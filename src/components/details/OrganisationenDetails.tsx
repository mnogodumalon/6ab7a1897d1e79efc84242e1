import type { Organisationen, Ressourcen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';

export interface OrganisationenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Organisationen;
  /** 1:N „Ressourcen" (organisation): VOLLE Liste — der Block filtert auf diesen Record. */
  ressourcenList: Ressourcen[];
  /** Zeilen-Klick → overlay.push auf das Ressourcen-Detail (nie der Edit-Dialog). */
  onOpenRessourcen: (record: Ressourcen) => void;
  /** Kontextuelles „+": öffnet den Ressourcen-Dialog mit diesem Record vorgesetzt. */
  onAddRessourcen: () => void;
}

export function OrganisationenDetails({
  record,
  ressourcenList,
  onOpenRessourcen,
  onAddRessourcen,
}: OrganisationenDetailsProps) {
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('organisationen', 'notizen')} value={record.fields.notizen} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('organisationen', 'name')} value={record.fields.name} format="text" />
        <RecordField label={fieldLabel('organisationen', 'abteilungsleiter_vorname')} value={record.fields.abteilungsleiter_vorname} format="text" />
        <RecordField label={fieldLabel('organisationen', 'abteilungsleiter_nachname')} value={record.fields.abteilungsleiter_nachname} format="text" />
        <RecordField label={fieldLabel('organisationen', 'standort')} value={record.fields.standort} format="text" />
        <RecordField label={fieldLabel('organisationen', 'kuerzel')} value={record.fields.kuerzel} format="text" />
        <RecordField label={fieldLabel('organisationen', 'beschreibung')} value={record.fields.beschreibung} format="longtext" className="md:col-span-2" />
      </RecordSection>

      <SatelliteSection
        title={appLabel('ressourcen')}
        items={ressourcenList.filter(r => extractRecordId(r.fields.organisation) === record.record_id)}
        map={r => ({ name: r.fields.vorname ?? appLabel('ressourcen'), meta: r.fields.eintrittsdatum })}
        onOpen={onOpenRessourcen}
        onAdd={onAddRessourcen}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.ORGANISATIONEN} recordId={record.record_id} />
    </>
  );
}
