import type { Aufgaben, Ressourcenzuweisungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';

export interface AufgabenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Aufgaben;
  /** N:1-Ziel „Aufgaben": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  aufgabenList: Aufgaben[];
  /** Klick auf die Aufgaben-Relation → overlay.push auf dessen Detail. */
  onOpenAufgaben?: (record: Aufgaben) => void;
  /** 1:N „Ressourcenzuweisungen" (aufgabe): VOLLE Liste — der Block filtert auf diesen Record. */
  ressourcenzuweisungenList: Ressourcenzuweisungen[];
  /** Zeilen-Klick → overlay.push auf das Ressourcenzuweisungen-Detail (nie der Edit-Dialog). */
  onOpenRessourcenzuweisungen: (record: Ressourcenzuweisungen) => void;
  /** Kontextuelles „+": öffnet den Ressourcenzuweisungen-Dialog mit diesem Record vorgesetzt. */
  onAddRessourcenzuweisungen: () => void;
}

export function AufgabenDetails({
  record,
  aufgabenList,
  onOpenAufgaben,
  ressourcenzuweisungenList,
  onOpenRessourcenzuweisungen,
  onAddRessourcenzuweisungen,
}: AufgabenDetailsProps) {
  const uebergeordnete_aufgabeTarget = aufgabenList.find(r => r.record_id === extractRecordId(record.fields.uebergeordnete_aufgabe));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('aufgaben', 'aufgabenname')} value={record.fields.aufgabenname} format="text" />
        <RecordField label={fieldLabel('aufgaben', 'aufgabentyp')} value={record.fields.aufgabentyp} format="pill" />
        <RecordField label={fieldLabel('aufgaben', 'fertigstellungsgrad')} value={record.fields.fertigstellungsgrad} format="text" />
        <RecordField label={fieldLabel('aufgaben', 'notizen')} value={record.fields.notizen} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('aufgaben', 'geplantes_ende')} value={record.fields.geplantes_ende} format="date" />
        <RecordField label={fieldLabel('aufgaben', 'geplante_dauer_tage')} value={record.fields.geplante_dauer_tage} format="text" />
        <RecordField label={fieldLabel('aufgaben', 'tatsaechlicher_start')} value={record.fields.tatsaechlicher_start} format="date" />
        <RecordField label={fieldLabel('aufgaben', 'tatsaechliches_ende')} value={record.fields.tatsaechliches_ende} format="date" />
        <RecordField label={fieldLabel('aufgaben', 'geschaetzter_aufwand_stunden')} value={record.fields.geschaetzter_aufwand_stunden} format="text" />
        <RecordField label={fieldLabel('aufgaben', 'tatsaechlicher_aufwand_stunden')} value={record.fields.tatsaechlicher_aufwand_stunden} format="text" />
        <RecordField label={fieldLabel('aufgaben', 'prioritaet')} value={record.fields.prioritaet} format="pill" />
        <RecordField label={fieldLabel('aufgaben', 'beschreibung')} value={record.fields.beschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('aufgaben', 'status')} value={record.fields.status} format="pill" />
        <RecordField label={fieldLabel('aufgaben', 'geplanter_start')} value={record.fields.geplanter_start} format="date" />
        <RecordField label={fieldLabel('aufgaben', 'vorgaenger')} value={Array.isArray(record.fields.vorgaenger) ? record.fields.vorgaenger.map((u: unknown) => aufgabenList.find(t => t.record_id === extractRecordId(u))?.fields.aufgabenname ?? '—').join(', ') : null} format="text" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={1}>
        <RecordRelation
          label={fieldLabel('aufgaben', 'uebergeordnete_aufgabe')}
          name={uebergeordnete_aufgabeTarget?.fields.aufgabenname ?? '—'}
          meta={undefined}
          onClick={uebergeordnete_aufgabeTarget && onOpenAufgaben ? () => onOpenAufgaben!(uebergeordnete_aufgabeTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('ressourcenzuweisungen')}
        items={ressourcenzuweisungenList.filter(r => extractRecordId(r.fields.aufgabe) === record.record_id)}
        map={r => ({ name: appLabel('ressourcenzuweisungen'), meta: r.fields.zuweisung_start })}
        onOpen={onOpenRessourcenzuweisungen}
        onAdd={onAddRessourcenzuweisungen}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.AUFGABEN} recordId={record.record_id} />
    </>
  );
}
