import type { Oeffnungszeiten } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';

export interface OeffnungszeitenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Oeffnungszeiten;
}

export function OeffnungszeitenDetails({
  record,
}: OeffnungszeitenDetailsProps) {
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('oeffnungszeiten', 'wochentag')} value={record.fields.wochentag} format="pill" />
        <RecordField label={fieldLabel('oeffnungszeiten', 'geschlossen')} value={record.fields.geschlossen} format="bool" />
        <RecordField label={fieldLabel('oeffnungszeiten', 'oeffnung_von')} value={record.fields.oeffnung_von} format="text" />
        <RecordField label={fieldLabel('oeffnungszeiten', 'oeffnung_bis')} value={record.fields.oeffnung_bis} format="text" />
        <RecordField label={fieldLabel('oeffnungszeiten', 'mittagspause_von')} value={record.fields.mittagspause_von} format="text" />
        <RecordField label={fieldLabel('oeffnungszeiten', 'mittagspause_bis')} value={record.fields.mittagspause_bis} format="text" />
        <RecordField label={fieldLabel('oeffnungszeiten', 'hinweis_tag')} value={record.fields.hinweis_tag} format="text" />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.OEFFNUNGSZEITEN} recordId={record.record_id} />
    </>
  );
}
