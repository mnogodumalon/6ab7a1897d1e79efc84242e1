/**
 * EntityCrud — pre-generated CRUD + overlay plumbing for the dashboard.
 * Compose it; NEVER re-roll dialog state, submit handlers, an overlay stack
 * or a RecordOverlayHost in the page — this file owns all of it.
 *
 * API at a glance:
 *   const data = useDashboardData();
 *   const crud = useEntityCrud(data, {
 *     // optional — the ONE semantic slot on the overlay: the record's next
 *     // workflow step. Return undefined for types without one.
 *     footer: (top) => top.type === 'organisationen'
 *       ? { label: …, onClick: () => … }
 *       : undefined,
 *   });
 *
 *   `top.type` is the SAME camelCase key as `crud.<entity>` — one spelling
 *   per entity, everywhere in this API.
 *   …
 *   crud.organisationen.openCreate({ …defaults })   // create dialog, prefilled — defaults are
 *                                       // shape-tolerant: bare lookup keys / record ids are fine
 *   crud.organisationen.openEdit(record)            // edit dialog (recordId + defaults wired)
 *   crud.organisationen.openDetail(record)          // record overlay — pass the RAW record,
 *                                       // enrichment is resolved inside
 *   crud.overlay                         // RecordOverlayStack<OverlayItem> for drills:
 *                                       // push / pop / replace / close
 *   crud.enriched.organisationen              // the display-ready array for EVERY entity —
 *                                       // Enriched* where relations exist, the raw array
 *                                       // otherwise. Reuse these; never call enrich*()
 *                                       // in the page, and never guess which entity has
 *                                       // one: they all do.
 *   {crud.surfaces}                      // render ONCE at the end of the page JSX:
 *                                       // all entity dialogs + the overlay host
 *
 * Built in (do NOT re-implement): optimistic update + Rückgängig counter-write
 * on edit, fetchAll-on-error, edit-from-overlay, and per-entity overlay bodies
 * (RecordHeader + <{Entity}Details> with every relation reachable and the
 * contextual "+" prefilled; list-field back-references additionally get a
 * "choose existing" picker that links an EXISTING record — built in, do not
 * re-roll). Drag writes (onEventDrop/onCardMove) stay YOURS:
 * optimistic setter first, PATCH in background, undoToast with counter-write.
 *
 * Overlay content per entity (the host renders these — you never compose
 * Details blocks yourself):
 *   organisationen: notizen, name, abteilungsleiter_vorname, abteilungsleiter_nachname, standort, kuerzel, beschreibung  ·  ← ressourcen (list + contextual +)
 *   rollen: rollenname, rollenkuerzel, beschreibung, kompetenzbereich, notizen  ·  ← ressourcen (list + contextual +)
 *   ressourcen: vorname, nachname, email, notizen, telefon, organisation, rolle, kostensatz, …  ·  → organisationen · → rollen · ← ressourcenzuweisungen (list + contextual +)
 *   aufgaben: aufgabenname, aufgabentyp, fertigstellungsgrad, notizen, geplantes_ende, geplante_dauer_tage, tatsaechlicher_start, tatsaechliches_ende, …  ·  → aufgaben · ← ressourcenzuweisungen (list + contextual +)
 *   ressourcenzuweisungen: ressource, zuweisung_start, zuweisung_ende, geplanter_aufwand_stunden, tatsaechlicher_aufwand_stunden, auslastung_prozent, notizen, aufgabe  ·  → ressourcen · → aufgaben
 */
import { useState, useMemo, type ReactNode } from 'react';
import type { Organisationen, Rollen, Ressourcen, Aufgaben, Ressourcenzuweisungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, createRecordUrl } from '@/services/livingAppsService';
import { enrichRessourcen, enrichAufgaben, enrichRessourcenzuweisungen } from '@/lib/enrich';
import type { EnrichedRessourcen, EnrichedAufgaben, EnrichedRessourcenzuweisungen } from '@/types/enriched';
import { useDashboardData } from '@/hooks/useDashboardData';
import {
  useRecordOverlayStack, RecordOverlayHost, RecordHeader,
  type RecordOverlayStack,
} from '@/components/widgets/RecordView';
import { OrganisationenDialog, type OrganisationenDialogDefaults } from '@/components/dialogs/OrganisationenDialog';
import { OrganisationenDetails } from '@/components/details/OrganisationenDetails';
import { RollenDialog, type RollenDialogDefaults } from '@/components/dialogs/RollenDialog';
import { RollenDetails } from '@/components/details/RollenDetails';
import { RessourcenDialog, type RessourcenDialogDefaults } from '@/components/dialogs/RessourcenDialog';
import { RessourcenDetails } from '@/components/details/RessourcenDetails';
import { AufgabenDialog, type AufgabenDialogDefaults } from '@/components/dialogs/AufgabenDialog';
import { AufgabenDetails } from '@/components/details/AufgabenDetails';
import { RessourcenzuweisungenDialog, type RessourcenzuweisungenDialogDefaults } from '@/components/dialogs/RessourcenzuweisungenDialog';
import { RessourcenzuweisungenDetails } from '@/components/details/RessourcenzuweisungenDetails';
import { AI_PHOTO_SCAN, AI_PHOTO_LOCATION } from '@/config/ai-features';
import { t, appLabel } from '@/i18n';
import { undoToast } from '@/lib/polish';
import { formatDate } from '@/lib/formatters';

// The overlay union — one branch per entity, `record` typed the way the data
// flows: Enriched* where enrichment exists, the raw record type otherwise.
// The host resolves enrichment itself; pages pass raw records everywhere.
export type OverlayItem =
  | { type: 'organisationen'; record: Organisationen }
  | { type: 'rollen'; record: Rollen }
  | { type: 'ressourcen'; record: EnrichedRessourcen }
  | { type: 'aufgaben'; record: EnrichedAufgaben }
  | { type: 'ressourcenzuweisungen'; record: EnrichedRessourcenzuweisungen };

/** The useDashboardData() return — pass it in, never re-fetch inside. */
export type EntityCrudData = ReturnType<typeof useDashboardData>;

export interface EntityCrudOptions {
  /** Per-type overlay footer — the record's next workflow step. */
  footer?: (top: OverlayItem) => ReactNode | { label: ReactNode; onClick: () => void } | undefined;
  placement?: 'side' | 'center';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface EntityCrudApi<TRecord, TDefaults> {
  /** Open the create dialog, optionally prefilled (shape-tolerant defaults). */
  openCreate: (defaults?: TDefaults) => void;
  /** Open the edit dialog for a record (recordId + defaults are wired). */
  openEdit: (record: TRecord) => void;
  /** Open the record overlay (raw record is fine — enrichment resolved inside). */
  openDetail: (record: TRecord) => void;
}

export interface EntityCrud {
  /** The overlay stack for drills: push / pop / replace / close. */
  overlay: RecordOverlayStack<OverlayItem>;
  /** Render ONCE at the end of the page JSX — all dialogs + the overlay host. */
  surfaces: ReactNode;
  organisationen: EntityCrudApi<Organisationen, OrganisationenDialogDefaults>;
  rollen: EntityCrudApi<Rollen, RollenDialogDefaults>;
  ressourcen: EntityCrudApi<Ressourcen, RessourcenDialogDefaults>;
  aufgaben: EntityCrudApi<Aufgaben, AufgabenDialogDefaults>;
  ressourcenzuweisungen: EntityCrudApi<Ressourcenzuweisungen, RessourcenzuweisungenDialogDefaults>;
  /** The display-ready array per entity: Enriched* where an enrich function
   *  exists, the raw array otherwise. One key per entity so no page has to
   *  know which is which. Reuse these; never re-enrich in the page. */
  enriched: { organisationen: Organisationen[]; rollen: Rollen[]; ressourcen: EnrichedRessourcen[]; aufgaben: EnrichedAufgaben[]; ressourcenzuweisungen: EnrichedRessourcenzuweisungen[] };
}

export function useEntityCrud(data: EntityCrudData, options?: EntityCrudOptions): EntityCrud {
  const overlay = useRecordOverlayStack<OverlayItem>();
  const [organisationenDialog, setOrganisationenDialog] = useState<{ defaults?: OrganisationenDialogDefaults; editing?: Organisationen } | null>(null);
  const [rollenDialog, setRollenDialog] = useState<{ defaults?: RollenDialogDefaults; editing?: Rollen } | null>(null);
  const [ressourcenDialog, setRessourcenDialog] = useState<{ defaults?: RessourcenDialogDefaults; editing?: Ressourcen } | null>(null);
  const [aufgabenDialog, setAufgabenDialog] = useState<{ defaults?: AufgabenDialogDefaults; editing?: Aufgaben } | null>(null);
  const [ressourcenzuweisungenDialog, setRessourcenzuweisungenDialog] = useState<{ defaults?: RessourcenzuweisungenDialogDefaults; editing?: Ressourcenzuweisungen } | null>(null);
  const enrichedRessourcen = useMemo(() => enrichRessourcen(data.ressourcen, { organisationenMap: data.organisationenMap, rollenMap: data.rollenMap }), [data.ressourcen, data.organisationenMap, data.rollenMap]);
  const enrichedAufgaben = useMemo(() => enrichAufgaben(data.aufgaben, { aufgabenMap: data.aufgabenMap }), [data.aufgaben, data.aufgabenMap]);
  const enrichedRessourcenzuweisungen = useMemo(() => enrichRessourcenzuweisungen(data.ressourcenzuweisungen, { ressourcenMap: data.ressourcenMap, aufgabenMap: data.aufgabenMap }), [data.ressourcenzuweisungen, data.ressourcenMap, data.aufgabenMap]);

  function detailOrganisationen(record: Organisationen, push = false) {
    const item: OverlayItem = { type: 'organisationen', record };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitOrganisationen(fields: Organisationen['fields']) {
    const editing = organisationenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setOrganisationen(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateOrganisationenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('organisationen')} — ${t('crud_updated')}`, async () => {
        data.setOrganisationen(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateOrganisationenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createOrganisationenEntry(fields);
      undoToast(`${appLabel('organisationen')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailRollen(record: Rollen, push = false) {
    const item: OverlayItem = { type: 'rollen', record };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitRollen(fields: Rollen['fields']) {
    const editing = rollenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setRollen(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateRollenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('rollen')} — ${t('crud_updated')}`, async () => {
        data.setRollen(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateRollenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createRollenEntry(fields);
      undoToast(`${appLabel('rollen')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailRessourcen(record: Ressourcen, push = false) {
    const rec = enrichedRessourcen.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'ressourcen', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitRessourcen(fields: Ressourcen['fields']) {
    const editing = ressourcenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setRessourcen(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateRessourcenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('ressourcen')} — ${t('crud_updated')}`, async () => {
        data.setRessourcen(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateRessourcenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createRessourcenEntry(fields);
      undoToast(`${appLabel('ressourcen')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailAufgaben(record: Aufgaben, push = false) {
    const rec = enrichedAufgaben.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'aufgaben', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitAufgaben(fields: Aufgaben['fields']) {
    const editing = aufgabenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setAufgaben(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateAufgabenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('aufgaben')} — ${t('crud_updated')}`, async () => {
        data.setAufgaben(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateAufgabenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createAufgabenEntry(fields);
      undoToast(`${appLabel('aufgaben')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailRessourcenzuweisungen(record: Ressourcenzuweisungen, push = false) {
    const rec = enrichedRessourcenzuweisungen.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'ressourcenzuweisungen', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitRessourcenzuweisungen(fields: Ressourcenzuweisungen['fields']) {
    const editing = ressourcenzuweisungenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setRessourcenzuweisungen(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateRessourcenzuweisungenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('ressourcenzuweisungen')} — ${t('crud_updated')}`, async () => {
        data.setRessourcenzuweisungen(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateRessourcenzuweisungenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createRessourcenzuweisungenEntry(fields);
      undoToast(`${appLabel('ressourcenzuweisungen')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  const surfaces = (
    <>
      <OrganisationenDialog
        open={organisationenDialog !== null}
        onClose={() => setOrganisationenDialog(null)}
        onSubmit={submitOrganisationen}
        defaultValues={organisationenDialog?.defaults}
        recordId={organisationenDialog?.editing?.record_id}
        enablePhotoScan={AI_PHOTO_SCAN['Organisationen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Organisationen']}
      />
      <RollenDialog
        open={rollenDialog !== null}
        onClose={() => setRollenDialog(null)}
        onSubmit={submitRollen}
        defaultValues={rollenDialog?.defaults}
        recordId={rollenDialog?.editing?.record_id}
        enablePhotoScan={AI_PHOTO_SCAN['Rollen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Rollen']}
      />
      <RessourcenDialog
        open={ressourcenDialog !== null}
        onClose={() => setRessourcenDialog(null)}
        onSubmit={submitRessourcen}
        defaultValues={ressourcenDialog?.defaults}
        recordId={ressourcenDialog?.editing?.record_id}
        organisationenList={data.organisationen}
        rollenList={data.rollen}
        enablePhotoScan={AI_PHOTO_SCAN['Ressourcen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Ressourcen']}
      />
      <AufgabenDialog
        open={aufgabenDialog !== null}
        onClose={() => setAufgabenDialog(null)}
        onSubmit={submitAufgaben}
        defaultValues={aufgabenDialog?.defaults}
        recordId={aufgabenDialog?.editing?.record_id}
        aufgabenList={data.aufgaben}
        enablePhotoScan={AI_PHOTO_SCAN['Aufgaben']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Aufgaben']}
      />
      <RessourcenzuweisungenDialog
        open={ressourcenzuweisungenDialog !== null}
        onClose={() => setRessourcenzuweisungenDialog(null)}
        onSubmit={submitRessourcenzuweisungen}
        defaultValues={ressourcenzuweisungenDialog?.defaults}
        recordId={ressourcenzuweisungenDialog?.editing?.record_id}
        ressourcenList={data.ressourcen}
        aufgabenList={data.aufgaben}
        enablePhotoScan={AI_PHOTO_SCAN['Ressourcenzuweisungen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Ressourcenzuweisungen']}
      />
      <RecordOverlayHost
        overlay={overlay}
        placement={options?.placement}
        size={options?.size}
        footer={options?.footer}
        render={(top) => {
          if (top.type === 'organisationen') {
            return (
              <>
                <RecordHeader title={top.record.fields.name ?? appLabel('organisationen')} subtitle={undefined} />
                <OrganisationenDetails
                  record={top.record}
                  ressourcenList={data.ressourcen}
                  onOpenRessourcen={(r) => detailRessourcen(r, true)}
                  onAddRessourcen={() => setRessourcenDialog({ defaults: { organisation: createRecordUrl(APP_IDS.ORGANISATIONEN, top.record.record_id) } })}
                />
              </>
            );
          }
          if (top.type === 'rollen') {
            return (
              <>
                <RecordHeader title={top.record.fields.rollenname ?? appLabel('rollen')} subtitle={undefined} />
                <RollenDetails
                  record={top.record}
                  ressourcenList={data.ressourcen}
                  onOpenRessourcen={(r) => detailRessourcen(r, true)}
                  onAddRessourcen={() => setRessourcenDialog({ defaults: { rolle: createRecordUrl(APP_IDS.ROLLEN, top.record.record_id) } })}
                />
              </>
            );
          }
          if (top.type === 'ressourcen') {
            return (
              <>
                <RecordHeader title={top.record.fields.vorname ?? appLabel('ressourcen')} subtitle={top.record.fields.eintrittsdatum ? formatDate(top.record.fields.eintrittsdatum) : undefined} />
                <RessourcenDetails
                  record={top.record}
                  organisationenList={data.organisationen}
                  onOpenOrganisationen={(r) => detailOrganisationen(r, true)}
                  rollenList={data.rollen}
                  onOpenRollen={(r) => detailRollen(r, true)}
                  ressourcenzuweisungenList={data.ressourcenzuweisungen}
                  onOpenRessourcenzuweisungen={(r) => detailRessourcenzuweisungen(r, true)}
                  onAddRessourcenzuweisungen={() => setRessourcenzuweisungenDialog({ defaults: { ressource: createRecordUrl(APP_IDS.RESSOURCEN, top.record.record_id) } })}
                />
              </>
            );
          }
          if (top.type === 'aufgaben') {
            return (
              <>
                <RecordHeader title={top.record.fields.aufgabenname ?? appLabel('aufgaben')} subtitle={top.record.fields.geplantes_ende ? formatDate(top.record.fields.geplantes_ende) : undefined} />
                <AufgabenDetails
                  record={top.record}
                  aufgabenList={data.aufgaben}
                  onOpenAufgaben={(r) => detailAufgaben(r, true)}
                  ressourcenzuweisungenList={data.ressourcenzuweisungen}
                  onOpenRessourcenzuweisungen={(r) => detailRessourcenzuweisungen(r, true)}
                  onAddRessourcenzuweisungen={() => setRessourcenzuweisungenDialog({ defaults: { aufgabe: createRecordUrl(APP_IDS.AUFGABEN, top.record.record_id) } })}
                />
              </>
            );
          }
          if (top.type === 'ressourcenzuweisungen') {
            return (
              <>
                <RecordHeader title={appLabel('ressourcenzuweisungen')} subtitle={top.record.fields.zuweisung_start ? formatDate(top.record.fields.zuweisung_start) : undefined} />
                <RessourcenzuweisungenDetails
                  record={top.record}
                  ressourcenList={data.ressourcen}
                  onOpenRessourcen={(r) => detailRessourcen(r, true)}
                  aufgabenList={data.aufgaben}
                  onOpenAufgaben={(r) => detailAufgaben(r, true)}
                />
              </>
            );
          }
          return null;
        }}
        onEdit={(top) => {
          overlay.close();
          if (top.type === 'organisationen') setOrganisationenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'rollen') setRollenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'ressourcen') setRessourcenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'aufgaben') setAufgabenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'ressourcenzuweisungen') setRessourcenzuweisungenDialog({ editing: top.record, defaults: top.record.fields });
        }}
      />
    </>
  );

  return {
    overlay,
    surfaces,
    organisationen: {
      openCreate: (defaults?: OrganisationenDialogDefaults) => setOrganisationenDialog({ defaults }),
      openEdit: (record: Organisationen) => setOrganisationenDialog({ editing: record, defaults: record.fields }),
      openDetail: (record: Organisationen) => detailOrganisationen(record, false),
    },
    rollen: {
      openCreate: (defaults?: RollenDialogDefaults) => setRollenDialog({ defaults }),
      openEdit: (record: Rollen) => setRollenDialog({ editing: record, defaults: record.fields }),
      openDetail: (record: Rollen) => detailRollen(record, false),
    },
    ressourcen: {
      openCreate: (defaults?: RessourcenDialogDefaults) => setRessourcenDialog({ defaults }),
      openEdit: (record: Ressourcen) => setRessourcenDialog({ editing: record, defaults: record.fields }),
      openDetail: (record: Ressourcen) => detailRessourcen(record, false),
    },
    aufgaben: {
      openCreate: (defaults?: AufgabenDialogDefaults) => setAufgabenDialog({ defaults }),
      openEdit: (record: Aufgaben) => setAufgabenDialog({ editing: record, defaults: record.fields }),
      openDetail: (record: Aufgaben) => detailAufgaben(record, false),
    },
    ressourcenzuweisungen: {
      openCreate: (defaults?: RessourcenzuweisungenDialogDefaults) => setRessourcenzuweisungenDialog({ defaults }),
      openEdit: (record: Ressourcenzuweisungen) => setRessourcenzuweisungenDialog({ editing: record, defaults: record.fields }),
      openDetail: (record: Ressourcenzuweisungen) => detailRessourcenzuweisungen(record, false),
    },
    enriched: { organisationen: data.organisationen, rollen: data.rollen, ressourcen: enrichedRessourcen, aufgaben: enrichedAufgaben, ressourcenzuweisungen: enrichedRessourcenzuweisungen },
  };
}
