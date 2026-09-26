import type { Rollen, Ressourcen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';

export interface RollenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Rollen;
  /** 1:N „Ressourcen" (rolle): VOLLE Liste — der Block filtert auf diesen Record. */
  ressourcenList: Ressourcen[];
  /** Zeilen-Klick → overlay.push auf das Ressourcen-Detail (nie der Edit-Dialog). */
  onOpenRessourcen: (record: Ressourcen) => void;
  /** Kontextuelles „+": öffnet den Ressourcen-Dialog mit diesem Record vorgesetzt. */
  onAddRessourcen: () => void;
}

export function RollenDetails({
  record,
  ressourcenList,
  onOpenRessourcen,
  onAddRessourcen,
}: RollenDetailsProps) {
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('rollen', 'rollenname')} value={record.fields.rollenname} format="text" />
        <RecordField label={fieldLabel('rollen', 'rollenkuerzel')} value={record.fields.rollenkuerzel} format="text" />
        <RecordField label={fieldLabel('rollen', 'beschreibung')} value={record.fields.beschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('rollen', 'kompetenzbereich')} value={record.fields.kompetenzbereich} format="pill" />
        <RecordField label={fieldLabel('rollen', 'notizen')} value={record.fields.notizen} format="longtext" className="md:col-span-2" />
      </RecordSection>

      <SatelliteSection
        title={appLabel('ressourcen')}
        items={ressourcenList.filter(r => extractRecordId(r.fields.rolle) === record.record_id)}
        map={r => ({ name: r.fields.vorname ?? appLabel('ressourcen'), meta: r.fields.eintrittsdatum })}
        onOpen={onOpenRessourcen}
        onAdd={onAddRessourcen}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.ROLLEN} recordId={record.record_id} />
    </>
  );
}
