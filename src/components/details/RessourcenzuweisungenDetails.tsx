import type { Ressourcenzuweisungen, Ressourcen, Aufgaben } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';

export interface RessourcenzuweisungenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Ressourcenzuweisungen;
  /** N:1-Ziel „Ressourcen": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  ressourcenList: Ressourcen[];
  /** Klick auf die Ressourcen-Relation → overlay.push auf dessen Detail. */
  onOpenRessourcen?: (record: Ressourcen) => void;
  /** N:1-Ziel „Aufgaben": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  aufgabenList: Aufgaben[];
  /** Klick auf die Aufgaben-Relation → overlay.push auf dessen Detail. */
  onOpenAufgaben?: (record: Aufgaben) => void;
}

export function RessourcenzuweisungenDetails({
  record,
  ressourcenList,
  onOpenRessourcen,
  aufgabenList,
  onOpenAufgaben,
}: RessourcenzuweisungenDetailsProps) {
  const ressourceTarget = ressourcenList.find(r => r.record_id === extractRecordId(record.fields.ressource));
  const aufgabeTarget = aufgabenList.find(r => r.record_id === extractRecordId(record.fields.aufgabe));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('ressourcenzuweisungen', 'zuweisung_start')} value={record.fields.zuweisung_start} format="date" />
        <RecordField label={fieldLabel('ressourcenzuweisungen', 'zuweisung_ende')} value={record.fields.zuweisung_ende} format="date" />
        <RecordField label={fieldLabel('ressourcenzuweisungen', 'geplanter_aufwand_stunden')} value={record.fields.geplanter_aufwand_stunden} format="text" />
        <RecordField label={fieldLabel('ressourcenzuweisungen', 'tatsaechlicher_aufwand_stunden')} value={record.fields.tatsaechlicher_aufwand_stunden} format="text" />
        <RecordField label={fieldLabel('ressourcenzuweisungen', 'auslastung_prozent')} value={record.fields.auslastung_prozent} format="text" />
        <RecordField label={fieldLabel('ressourcenzuweisungen', 'notizen')} value={record.fields.notizen} format="longtext" className="md:col-span-2" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('ressourcenzuweisungen', 'ressource')}
          name={ressourceTarget?.fields.vorname ?? '—'}
          meta={[ressourceTarget?.fields.email, ressourceTarget?.fields.telefon].filter(Boolean).join(' · ') || undefined}
          onClick={ressourceTarget && onOpenRessourcen ? () => onOpenRessourcen!(ressourceTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('ressourcenzuweisungen', 'aufgabe')}
          name={aufgabeTarget?.fields.aufgabenname ?? '—'}
          meta={undefined}
          onClick={aufgabeTarget && onOpenAufgaben ? () => onOpenAufgaben!(aufgabeTarget!) : undefined}
        />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.RESSOURCENZUWEISUNGEN} recordId={record.record_id} />
    </>
  );
}
