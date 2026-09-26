import type { Ressourcen, Organisationen, Rollen, Ressourcenzuweisungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';

export interface RessourcenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Ressourcen;
  /** N:1-Ziel „Organisationen": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  organisationenList: Organisationen[];
  /** Klick auf die Organisationen-Relation → overlay.push auf dessen Detail. */
  onOpenOrganisationen?: (record: Organisationen) => void;
  /** N:1-Ziel „Rollen": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  rollenList: Rollen[];
  /** Klick auf die Rollen-Relation → overlay.push auf dessen Detail. */
  onOpenRollen?: (record: Rollen) => void;
  /** 1:N „Ressourcenzuweisungen" (ressource): VOLLE Liste — der Block filtert auf diesen Record. */
  ressourcenzuweisungenList: Ressourcenzuweisungen[];
  /** Zeilen-Klick → overlay.push auf das Ressourcenzuweisungen-Detail (nie der Edit-Dialog). */
  onOpenRessourcenzuweisungen: (record: Ressourcenzuweisungen) => void;
  /** Kontextuelles „+": öffnet den Ressourcenzuweisungen-Dialog mit diesem Record vorgesetzt. */
  onAddRessourcenzuweisungen: () => void;
}

export function RessourcenDetails({
  record,
  organisationenList,
  onOpenOrganisationen,
  rollenList,
  onOpenRollen,
  ressourcenzuweisungenList,
  onOpenRessourcenzuweisungen,
  onAddRessourcenzuweisungen,
}: RessourcenDetailsProps) {
  const organisationTarget = organisationenList.find(r => r.record_id === extractRecordId(record.fields.organisation));
  const rolleTarget = rollenList.find(r => r.record_id === extractRecordId(record.fields.rolle));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('ressourcen', 'vorname')} value={record.fields.vorname} format="text" />
        <RecordField label={fieldLabel('ressourcen', 'nachname')} value={record.fields.nachname} format="text" />
        <RecordField label={fieldLabel('ressourcen', 'email')} value={record.fields.email} format="email" />
        <RecordField label={fieldLabel('ressourcen', 'notizen')} value={record.fields.notizen} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('ressourcen', 'telefon')} value={record.fields.telefon} format="text" />
        <RecordField label={fieldLabel('ressourcen', 'kostensatz')} value={record.fields.kostensatz} format="text" />
        <RecordField label={fieldLabel('ressourcen', 'verfuegbarkeit_prozent')} value={record.fields.verfuegbarkeit_prozent} format="text" />
        <RecordField label={fieldLabel('ressourcen', 'eintrittsdatum')} value={record.fields.eintrittsdatum} format="date" />
        <RecordField label={fieldLabel('ressourcen', 'austrittsdatum')} value={record.fields.austrittsdatum} format="date" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('ressourcen', 'organisation')}
          name={organisationTarget?.fields.name ?? '—'}
          meta={[organisationTarget?.fields.abteilungsleiter_vorname, organisationTarget?.fields.abteilungsleiter_nachname].filter(Boolean).join(' · ') || undefined}
          onClick={organisationTarget && onOpenOrganisationen ? () => onOpenOrganisationen!(organisationTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('ressourcen', 'rolle')}
          name={rolleTarget?.fields.rollenname ?? '—'}
          meta={[rolleTarget?.fields.rollenkuerzel].filter(Boolean).join(' · ') || undefined}
          onClick={rolleTarget && onOpenRollen ? () => onOpenRollen!(rolleTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('ressourcenzuweisungen')}
        items={ressourcenzuweisungenList.filter(r => extractRecordId(r.fields.ressource) === record.record_id)}
        map={r => ({ name: appLabel('ressourcenzuweisungen'), meta: r.fields.zuweisung_start })}
        onOpen={onOpenRessourcenzuweisungen}
        onAdd={onAddRessourcenzuweisungen}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.RESSOURCEN} recordId={record.record_id} />
    </>
  );
}
