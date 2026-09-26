import { useState, useMemo, useCallback } from 'react';
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import type { DashboardData } from '@/hooks/useDashboardData';
import { useEntityCrud } from '@/components/EntityCrud';
import { tx, appLabel } from '@/i18n';
import { useClock, gruss, namen, undoToast } from '@/lib/polish';
import { formatDate } from '@/lib/formatters';
import { DashboardGrid } from '@/components/DashboardGrid';
import { StatStrip, StatStripItem } from '@/components/StatCard';
import { WorkList } from '@/components/WorkList';
import { HeroBanner } from '@/components/HeroBanner';
import {
  ResourceTimeline,
  ResourceTimelineSkeleton,
  type ResourceEvent,
  type ResourceGroup,
} from '@/components/widgets/ResourceTimeline';
import { dateFnsLocale } from '@/i18n';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { APP_IDS, lookupOption } from '@/types/app';
import {
  IconAlertTriangle,
  IconUsers,
  IconCheckbox,
  IconListCheck,
  IconPlayerPlay,
  IconBriefcase,
} from '@tabler/icons-react';

export default function DashboardOverview({ data }: { data: DashboardData }) {
  const {
    ressourcen,
    aufgaben,
    ressourcenzuweisungen,
    setRessourcenzuweisungen,
    ressourcenMap,
    aufgabenMap,
    fetchAll,
  } = data;

  const crud = useEntityCrud(data);
  const enrichedRessourcen = crud.enriched.ressourcen;
  const enrichedAufgaben = crud.enriched.aufgaben;
  const enrichedRessourcenzuweisungen = crud.enriched.ressourcenzuweisungen;

  const clock = useClock();
  const today = format(clock, 'yyyy-MM-dd');

  // ── Filter state ─────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // ── Derived KPIs ─────────────────────────────────────────────────────────
  const aktiveAufgaben = useMemo(
    () => aufgaben.filter(a => a.fields.status?.key === 'in_bearbeitung'),
    [aufgaben]
  );

  const ueberfaelligeAufgaben = useMemo(
    () =>
      aufgaben.filter(
        a =>
          a.fields.geplantes_ende &&
          isBefore(parseISO(a.fields.geplantes_ende), clock) &&
          a.fields.status?.key !== 'abgeschlossen' &&
          a.fields.status?.key !== 'abgebrochen'
      ),
    [aufgaben, clock]
  );

  const abgeschlosseneAufgaben = useMemo(
    () => aufgaben.filter(a => a.fields.status?.key === 'abgeschlossen'),
    [aufgaben]
  );

  const gesamtAufwandGeplant = useMemo(
    () =>
      ressourcenzuweisungen.reduce(
        (sum, r) => sum + (r.fields.geplanter_aufwand_stunden ?? 0),
        0
      ),
    [ressourcenzuweisungen]
  );

  const gesamtAufwandIst = useMemo(
    () =>
      ressourcenzuweisungen.reduce(
        (sum, r) => sum + (r.fields.tatsaechlicher_aufwand_stunden ?? 0),
        0
      ),
    [ressourcenzuweisungen]
  );

  // ── Context line ─────────────────────────────────────────────────────────
  const contextLine = useMemo(() => {
    if (ueberfaelligeAufgaben.length > 0) {
      const names = ueberfaelligeAufgaben
        .slice(0, 3)
        .map(a => a.fields.aufgabenname ?? '')
        .filter(Boolean);
      return tx`${namen(names)} ${ueberfaelligeAufgaben.length === 1 ? tx('ist überfällig') : tx('sind überfällig')} — bitte prüfen.`;
    }
    if (aktiveAufgaben.length > 0) {
      return tx`${aktiveAufgaben.length} Aufgaben in Bearbeitung, alles im Zeitplan.`;
    }
    return tx('Keine aktiven Aufgaben — jetzt loslegen!');
  }, [ueberfaelligeAufgaben, aktiveAufgaben]);

  // ── ResourceTimeline: Ressourcen als Zeilen ───────────────────────────────
  const groups = useMemo<ResourceGroup[]>(
    () =>
      ressourcen.map(r => ({
        key: r.record_id,
        label: [r.fields.vorname, r.fields.nachname].filter(Boolean).join(' ') || r.record_id,
      })),
    [ressourcen]
  );

  const events = useMemo<ResourceEvent[]>(
    () =>
      ressourcenzuweisungen
        .filter(z => !!z.fields.zuweisung_start)
        .map(z => {
          const ressId = extractRecordId(z.fields.ressource) ?? '';
          const aufgabeId = extractRecordId(z.fields.aufgabe);
          const aufgabe = aufgabeId ? aufgabenMap.get(aufgabeId) : undefined;
          const statusKey = aufgabe?.fields.status?.key;
          const tone: ResourceEvent['tone'] =
            statusKey === 'abgeschlossen'
              ? 'success'
              : statusKey === 'abgebrochen'
              ? 'default'
              : ueberfaelligeAufgaben.some(a => a.record_id === aufgabeId)
              ? 'destructive'
              : statusKey === 'in_bearbeitung'
              ? 'primary'
              : 'default';

          return {
            id: `zuweisung:${z.record_id}`,
            start: z.fields.zuweisung_start!,
            end: z.fields.zuweisung_ende,
            allDay: true,
            title: aufgabe?.fields.aufgabenname ?? tx('Zuweisung'),
            subtitle: z.fields.geplanter_aufwand_stunden
              ? `${z.fields.geplanter_aufwand_stunden}h`
              : undefined,
            tone,
            group: ressId,
          };
        }),
    [ressourcenzuweisungen, aufgabenMap, ueberfaelligeAufgaben]
  );

  // ── Drag-write: Zuweisung verschieben ────────────────────────────────────
  const handleEventDrop = useCallback(
    async (id: string, newStart: string, newEnd?: string, newGroup?: string) => {
      const rid = id.split(':')[1] ?? '';
      if (!rid) return;
      const prev = ressourcenzuweisungen.find(z => z.record_id === rid);
      if (!prev) return;

      const patch: Partial<typeof prev.fields> = {
        zuweisung_start: newStart,
        ...(newEnd ? { zuweisung_ende: newEnd } : {}),
        ...(newGroup
          ? { ressource: createRecordUrl(APP_IDS.RESSOURCEN, newGroup) }
          : {}),
      };

      // Optimistic update
      const snapshot = [...ressourcenzuweisungen];
      setRessourcenzuweisungen(
        ressourcenzuweisungen.map(z =>
          z.record_id === rid
            ? {
                ...z,
                fields: {
                  ...z.fields,
                  ...patch,
                  ...(newGroup
                    ? { ressource: createRecordUrl(APP_IDS.RESSOURCEN, newGroup) }
                    : {}),
                },
              }
            : z
        )
      );

      undoToast(
        tx`Zuweisung verschoben`,
        async () => {
          setRessourcenzuweisungen(snapshot);
          await LivingAppsService.updateRessourcenzuweisungenEntry(rid, {
            zuweisung_start: prev.fields.zuweisung_start,
            zuweisung_ende: prev.fields.zuweisung_ende,
            ressource: prev.fields.ressource,
          });
        }
      );

      try {
        await LivingAppsService.updateRessourcenzuweisungenEntry(rid, patch);
      } catch {
        fetchAll();
      }
    },
    [ressourcenzuweisungen, setRessourcenzuweisungen, fetchAll]
  );

  const handleEventResize = useCallback(
    async (id: string, newStart: string, newEnd: string) => {
      const rid = id.split(':')[1] ?? '';
      if (!rid) return;
      const prev = ressourcenzuweisungen.find(z => z.record_id === rid);
      if (!prev) return;

      const snapshot = [...ressourcenzuweisungen];
      setRessourcenzuweisungen(
        ressourcenzuweisungen.map(z =>
          z.record_id === rid
            ? { ...z, fields: { ...z.fields, zuweisung_start: newStart, zuweisung_ende: newEnd } }
            : z
        )
      );

      undoToast(
        tx`Zuweisung angepasst`,
        async () => {
          setRessourcenzuweisungen(snapshot);
          await LivingAppsService.updateRessourcenzuweisungenEntry(rid, {
            zuweisung_start: prev.fields.zuweisung_start,
            zuweisung_ende: prev.fields.zuweisung_ende,
          });
        }
      );

      try {
        await LivingAppsService.updateRessourcenzuweisungenEntry(rid, {
          zuweisung_start: newStart,
          zuweisung_ende: newEnd,
        });
      } catch {
        fetchAll();
      }
    },
    [ressourcenzuweisungen, setRessourcenzuweisungen, fetchAll]
  );

  // ── Aufgaben-Status advance ───────────────────────────────────────────────
  const nextStatus = useCallback(
    (current: string | undefined): string | null => {
      const map: Record<string, string> = {
        nicht_begonnen: 'in_bearbeitung',
        in_bearbeitung: 'abgeschlossen',
        zurueckgestellt: 'in_bearbeitung',
      };
      return current ? (map[current] ?? null) : 'in_bearbeitung';
    },
    []
  );

  const advanceAufgabe = useCallback(
    async (record: (typeof aufgaben)[0]) => {
      const current = record.fields.status?.key;
      const next = nextStatus(current);
      if (!next) return;

      const snapshot = [...aufgaben];
      data.setAufgaben(
        aufgaben.map(a =>
          a.record_id === record.record_id
            ? { ...a, fields: { ...a.fields, status: lookupOption('aufgaben', 'status', next) } }
            : a
        )
      );

      undoToast(
        tx`Status aktualisiert`,
        async () => {
          data.setAufgaben(snapshot);
          await LivingAppsService.updateAufgabenEntry(record.record_id, {
            status: current ?? undefined,
          });
        }
      );

      try {
        await LivingAppsService.updateAufgabenEntry(record.record_id, { status: next });
      } catch {
        fetchAll();
      }
    },
    [aufgaben, data, nextStatus, fetchAll]
  );

  // ── Aside: Aufgaben-Liste ─────────────────────────────────────────────────
  const filteredAufgaben = useMemo(() => {
    if (statusFilter === 'ueberfaellig') return ueberfaelligeAufgaben;
    if (statusFilter === 'aktiv') return aktiveAufgaben;
    if (statusFilter === 'abgeschlossen') return abgeschlosseneAufgaben;
    return aufgaben.filter(
      a =>
        a.fields.status?.key !== 'abgeschlossen' &&
        a.fields.status?.key !== 'abgebrochen'
    );
  }, [statusFilter, aufgaben, ueberfaelligeAufgaben, aktiveAufgaben, abgeschlosseneAufgaben]);

  const workListItems = useMemo(
    () =>
      filteredAufgaben.slice(0, 30).map(a => {
        const isOverdue =
          a.fields.geplantes_ende &&
          isBefore(parseISO(a.fields.geplantes_ende), clock) &&
          a.fields.status?.key !== 'abgeschlossen';
        const next = nextStatus(a.fields.status?.key);
        const nextLabel: string = (() => {
          if (a.fields.status?.key === 'nicht_begonnen') return tx('Starten');
          if (a.fields.status?.key === 'in_bearbeitung') return tx('Abschließen');
          if (a.fields.status?.key === 'zurueckgestellt') return tx('Fortsetzen');
          return tx('Starten');
        })();

        return {
          id: a.record_id,
          title: a.fields.aufgabenname ?? tx('Aufgabe'),
          secondLine: (
            <span>
              {isOverdue ? (
                <span className="font-medium text-destructive">{tx('Überfällig')}</span>
              ) : (
                <span className="text-muted-foreground">{a.fields.status?.label ?? '—'}</span>
              )}
              {a.fields.geplantes_ende && (
                <span className="text-muted-foreground">
                  {' · '}
                  {formatDate(a.fields.geplantes_ende)}
                </span>
              )}
            </span>
          ),
          action: next
            ? { label: nextLabel, onClick: () => advanceAufgabe(a) }
            : undefined,
        };
      }),
    [filteredAufgaben, clock, nextStatus, advanceAufgabe]
  );

  // ── Aside: Ressourcenzuweisungen demnächst ───────────────────────────────
  const nextWeekEnd = format(addDays(clock, 7), 'yyyy-MM-dd');
  const naechsteZuweisungen = useMemo(
    () =>
      enrichedRessourcenzuweisungen
        .filter(
          z =>
            z.fields.zuweisung_start &&
            z.fields.zuweisung_start >= today &&
            z.fields.zuweisung_start <= nextWeekEnd
        )
        .sort((a, b) =>
          (a.fields.zuweisung_start ?? '').localeCompare(b.fields.zuweisung_start ?? '')
        )
        .slice(0, 8),
    [enrichedRessourcenzuweisungen, today, nextWeekEnd]
  );

  const zuweisungListItems = useMemo(
    () =>
      naechsteZuweisungen.map(z => ({
        id: z.record_id,
        title: z.ressourceName || tx('Unbekannte Ressource'),
        secondLine: (
          <span>
            <span className="text-muted-foreground">{z.aufgabeName || '—'}</span>
            {z.fields.zuweisung_start && (
              <span className="text-muted-foreground">
                {' · '}
                {formatDate(z.fields.zuweisung_start)}
              </span>
            )}
          </span>
        ),
        action: {
          label: tx('Details'),
          onClick: () => {
            const raw = ressourcenzuweisungen.find(r => r.record_id === z.record_id);
            if (raw) crud.ressourcenzuweisungen.openDetail(raw);
          },
        },
      })),
    [naechsteZuweisungen, ressourcenzuweisungen, crud]
  );

  // ── Empty state ───────────────────────────────────────────────────────────
  if (aufgaben.length === 0 && ressourcen.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
        <IconBriefcase size={48} className="text-muted-foreground" />
        <div>
          <h2 className="text-xl font-semibold mb-2">{tx('Projekt einrichten')}</h2>
          <p className="text-muted-foreground max-w-sm">
            {tx('Füge Ressourcen und Aufgaben hinzu, um deine Projektplanung zu starten.')}
          </p>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            onClick={() => crud.ressourcen.openCreate({})}
          >
            {tx('Erste Ressource anlegen')}
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            onClick={() => crud.aufgaben.openCreate({ status: 'nicht_begonnen' })}
          >
            {tx('Erste Aufgabe anlegen')}
          </button>
        </div>
        {crud.surfaces}
      </div>
    );
  }

  const fertigstellungGesamt =
    aufgaben.length > 0
      ? Math.round(
          aufgaben.reduce((sum, a) => sum + (a.fields.fertigstellungsgrad ?? 0), 0) /
            aufgaben.length
        )
      : 0;

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{gruss(clock)}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{contextLine}</p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 self-start sm:self-auto shrink-0"
          onClick={() => crud.aufgaben.openCreate({ status: 'nicht_begonnen' })}
        >
          <IconListCheck size={16} className="shrink-0" />
          {tx('Neue Aufgabe')}
        </button>
      </div>

      <DashboardGrid
        variant="wide"
        hero={
          ueberfaelligeAufgaben.length > 0 ? (
            <HeroBanner
              icon={<IconAlertTriangle size={18} />}
              action={{
                label: tx('Starten'),
                onClick: () => advanceAufgabe(ueberfaelligeAufgaben[0]),
              }}
            >
              <b>
                {namen(
                  ueberfaelligeAufgaben.slice(0, 3).map(a => a.fields.aufgabenname ?? '')
                )}
              </b>{' '}
              {ueberfaelligeAufgaben.length === 1
                ? tx('ist überfällig')
                : tx('sind überfällig')}
              {ueberfaelligeAufgaben[0]?.fields.geplantes_ende && (
                <> — {tx('Fällig')}: {formatDate(ueberfaelligeAufgaben[0].fields.geplantes_ende)}</>
              )}
            </HeroBanner>
          ) : undefined
        }
        kpis={
          <StatStrip>
            <StatStripItem
              title={tx('Aufgaben aktiv')}
              value={aktiveAufgaben.length}
              icon={<IconPlayerPlay size={16} />}
              tone={aktiveAufgaben.length > 0 ? 'primary' : 'default'}
              onClick={() =>
                setStatusFilter(f => (f === 'aktiv' ? null : 'aktiv'))
              }
              active={statusFilter === 'aktiv'}
            />
            <StatStripItem
              title={tx('Überfällig')}
              value={ueberfaelligeAufgaben.length}
              icon={<IconAlertTriangle size={16} />}
              tone={ueberfaelligeAufgaben.length > 0 ? 'destructive' : 'default'}
              onClick={() =>
                setStatusFilter(f => (f === 'ueberfaellig' ? null : 'ueberfaellig'))
              }
              active={statusFilter === 'ueberfaellig'}
            />
            <StatStripItem
              title={tx('Abgeschlossen')}
              value={abgeschlosseneAufgaben.length}
              icon={<IconCheckbox size={16} />}
              tone={abgeschlosseneAufgaben.length > 0 ? 'success' : 'default'}
              onClick={() =>
                setStatusFilter(f => (f === 'abgeschlossen' ? null : 'abgeschlossen'))
              }
              active={statusFilter === 'abgeschlossen'}
            />
            <StatStripItem
              title={tx('Ressourcen')}
              value={ressourcen.length}
              icon={<IconUsers size={16} />}
              tone="default"
            />
            <StatStripItem
              title={tx('Geplant (h)')}
              value={`${Math.round(gesamtAufwandGeplant)}h`}
              tone="default"
            />
            <StatStripItem
              title={tx('Ist (h)')}
              value={`${Math.round(gesamtAufwandIst)}h`}
              tone={
                gesamtAufwandIst > gesamtAufwandGeplant && gesamtAufwandGeplant > 0
                  ? 'warning'
                  : 'default'
              }
            />
          </StatStrip>
        }
        primary={
          <ResourceTimeline
            events={events}
            groups={groups}
            axis="day"
            defaultRange="week"
            defaultDate={clock}
            locale={dateFnsLocale()}
            onEventClick={ev => {
              const rid = ev.id.split(':')[1] ?? '';
              const raw = ressourcenzuweisungen.find(z => z.record_id === rid);
              if (raw) crud.ressourcenzuweisungen.openDetail(raw);
            }}
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
            onEmptyClick={(date, group) => {
              crud.ressourcenzuweisungen.openCreate({
                zuweisung_start: format(date, 'yyyy-MM-dd'),
                ressource: group,
              });
            }}
            onRangeCreate={(start, end, group) => {
              crud.ressourcenzuweisungen.openCreate({
                zuweisung_start: format(start, 'yyyy-MM-dd'),
                zuweisung_ende: format(end, 'yyyy-MM-dd'),
                ressource: group,
              });
            }}
          />
        }
        aside={
          <>
            <WorkList
              title={tx('Aufgaben')}
              items={workListItems}
              onItemClick={id => {
                const raw = aufgaben.find(a => a.record_id === id);
                if (raw) crud.aufgaben.openDetail(raw);
              }}
              empty={{
                text: tx('Alle Aufgaben erledigt — neues Projekt starten!'),
                action: {
                  label: tx('Aufgabe anlegen'),
                  onClick: () => crud.aufgaben.openCreate({ status: 'nicht_begonnen' }),
                },
              }}
            />
            <WorkList
              title={tx('Zuweisungen diese Woche')}
              items={zuweisungListItems}
              onItemClick={id => {
                const raw = ressourcenzuweisungen.find(z => z.record_id === id);
                if (raw) crud.ressourcenzuweisungen.openDetail(raw);
              }}
              empty={{
                text: tx('Keine Zuweisungen diese Woche'),
                action: {
                  label: tx('Zuweisung anlegen'),
                  onClick: () => crud.ressourcenzuweisungen.openCreate({}),
                },
              }}
            />
          </>
        }
      />
      {crud.surfaces}
    </div>
  );
}
