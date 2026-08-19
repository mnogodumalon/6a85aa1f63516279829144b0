import type { StandortKontakt } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { MapRouteLinks } from '@/components/widgets/MapWidget';

export interface StandortKontaktDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: StandortKontakt;
}

export function StandortKontaktDetails({
  record,
}: StandortKontaktDetailsProps) {
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('standort_kontakt', 'restaurant_name')} value={record.fields.restaurant_name} format="text" />
        <RecordField label={fieldLabel('standort_kontakt', 'strasse')} value={record.fields.strasse} format="text" />
        <RecordField label={fieldLabel('standort_kontakt', 'hausnummer')} value={record.fields.hausnummer} format="text" />
        <RecordField label={fieldLabel('standort_kontakt', 'postleitzahl')} value={record.fields.postleitzahl} format="text" />
        <RecordField label={fieldLabel('standort_kontakt', 'ort')} value={record.fields.ort} format="text" />
        <RecordField label={fieldLabel('standort_kontakt', 'telefon')} value={record.fields.telefon} format="text" />
        <RecordField label={fieldLabel('standort_kontakt', 'email')} value={record.fields.email} format="email" />
        <RecordField label={fieldLabel('standort_kontakt', 'webseite')} value={record.fields.webseite} format="url" />
        <RecordField label={fieldLabel('standort_kontakt', 'reservierungshinweis')} value={record.fields.reservierungshinweis} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('standort_kontakt', 'standort_karte')}>
          {record.fields.standort_karte ? (
            <div className="space-y-1">
              <div>{record.fields.standort_karte.info ?? `${record.fields.standort_karte.lat}, ${record.fields.standort_karte.long}`}</div>
              {/* Directions links — the map popup is hover-fleeting; the overlay
                  is the only mobile-reachable place for navigation. */}
              <MapRouteLinks lat={record.fields.standort_karte.lat} long={record.fields.standort_karte.long} />
            </div>
          ) : '—'}
        </RecordField>
      </RecordSection>

      <RecordAttachments appId={APP_IDS.STANDORT_KONTAKT} recordId={record.record_id} />
    </>
  );
}
