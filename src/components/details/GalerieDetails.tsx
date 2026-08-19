import type { Galerie } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { MediaThumbnail } from '@/components/widgets/MediaViewer';

export interface GalerieDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Galerie;
}

export function GalerieDetails({
  record,
}: GalerieDetailsProps) {
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('galerie', 'foto_titel')} value={record.fields.foto_titel} format="text" />
        <RecordField label={fieldLabel('galerie', 'foto_datei')} className="md:col-span-2">
          {record.fields.foto_datei ? (
            <MediaThumbnail src={record.fields.foto_datei as string} fit="contain" className="max-h-64 w-full rounded-lg" />
          ) : '—'}
        </RecordField>
        <RecordField label={fieldLabel('galerie', 'foto_beschreibung')} value={record.fields.foto_beschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('galerie', 'foto_kategorie')} value={record.fields.foto_kategorie} format="pill" />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.GALERIE} recordId={record.record_id} />
    </>
  );
}
