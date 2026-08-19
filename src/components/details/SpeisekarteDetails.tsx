import type { Speisekarte } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { MediaThumbnail } from '@/components/widgets/MediaViewer';

export interface SpeisekarteDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Speisekarte;
}

export function SpeisekarteDetails({
  record,
}: SpeisekarteDetailsProps) {
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('speisekarte', 'gericht_name')} value={record.fields.gericht_name} format="text" />
        <RecordField label={fieldLabel('speisekarte', 'kategorie')} value={record.fields.kategorie} format="pill" />
        <RecordField label={fieldLabel('speisekarte', 'beschreibung')} value={record.fields.beschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('speisekarte', 'preis')} value={record.fields.preis} format="text" />
        <RecordField label={fieldLabel('speisekarte', 'gericht_foto')} className="md:col-span-2">
          {record.fields.gericht_foto ? (
            <MediaThumbnail src={record.fields.gericht_foto as string} fit="contain" className="max-h-64 w-full rounded-lg" />
          ) : '—'}
        </RecordField>
        <RecordField label={fieldLabel('speisekarte', 'vegetarisch')} value={record.fields.vegetarisch} format="bool" />
        <RecordField label={fieldLabel('speisekarte', 'vegan')} value={record.fields.vegan} format="bool" />
        <RecordField label={fieldLabel('speisekarte', 'glutenfrei')} value={record.fields.glutenfrei} format="bool" />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.SPEISEKARTE} recordId={record.record_id} />
    </>
  );
}
