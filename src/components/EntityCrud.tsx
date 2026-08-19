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
 *     footer: (top) => top.type === 'speisekarte'
 *       ? { label: …, onClick: () => … }
 *       : undefined,
 *   });
 *
 *   `top.type` carries the snake_case IDENTIFIER, NOT the camelCase key that
 *   `crud.<entity>` uses — for multi-word entities the two differ. Take each
 *   from its own column below, verbatim; a camelCase top.type narrows `top`
 *   to `never` and costs a build cycle (TS2367 "have no overlap", then
 *   TS2339 on top.record):
 *     crud.speisekarte  ·  top.type === 'speisekarte'
 *     crud.oeffnungszeiten  ·  top.type === 'oeffnungszeiten'
 *     crud.galerie  ·  top.type === 'galerie'
 *     crud.standortKontakt  ·  top.type === 'standort_kontakt'
 *   …
 *   crud.speisekarte.openCreate({ …defaults })   // create dialog, prefilled — defaults are
 *                                       // shape-tolerant: bare lookup keys / record ids are fine
 *   crud.speisekarte.openEdit(record)            // edit dialog (recordId + defaults wired)
 *   crud.speisekarte.openDetail(record)          // record overlay — pass the RAW record,
 *                                       // enrichment is resolved inside
 *   crud.overlay                         // RecordOverlayStack<OverlayItem> for drills:
 *                                       // push / pop / replace / close
 *   {crud.surfaces}                      // render ONCE at the end of the page JSX:
 *                                       // all entity dialogs + the overlay host
 *
 * Built in (do NOT re-implement): optimistic update + Rückgängig counter-write
 * on edit, fetchAll-on-error, edit-from-overlay, and per-entity overlay bodies
 * (RecordHeader + <{Entity}Details> with every relation reachable and the
 * contextual "+" prefilled). Drag writes (onEventDrop/onCardMove) stay YOURS:
 * optimistic setter first, PATCH in background, undoToast with counter-write.
 *
 * Overlay content per entity (the host renders these — you never compose
 * Details blocks yourself):
 *   speisekarte: gericht_name, kategorie, beschreibung, preis, gericht_foto, vegetarisch, vegan, glutenfrei
 *   oeffnungszeiten: wochentag, geschlossen, oeffnung_von, oeffnung_bis, mittagspause_von, mittagspause_bis, hinweis_tag
 *   galerie: foto_titel, foto_datei, foto_beschreibung, foto_kategorie
 *   standort_kontakt: restaurant_name, strasse, hausnummer, postleitzahl, ort, telefon, email, webseite, …
 */
import { useState, type ReactNode } from 'react';
import type { Speisekarte, Oeffnungszeiten, Galerie, StandortKontakt } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';
import { useDashboardData } from '@/hooks/useDashboardData';
import {
  useRecordOverlayStack, RecordOverlayHost, RecordHeader,
  type RecordOverlayStack,
} from '@/components/widgets/RecordView';
import { SpeisekarteDialog, type SpeisekarteDialogDefaults } from '@/components/dialogs/SpeisekarteDialog';
import { SpeisekarteDetails } from '@/components/details/SpeisekarteDetails';
import { OeffnungszeitenDialog, type OeffnungszeitenDialogDefaults } from '@/components/dialogs/OeffnungszeitenDialog';
import { OeffnungszeitenDetails } from '@/components/details/OeffnungszeitenDetails';
import { GalerieDialog, type GalerieDialogDefaults } from '@/components/dialogs/GalerieDialog';
import { GalerieDetails } from '@/components/details/GalerieDetails';
import { StandortKontaktDialog, type StandortKontaktDialogDefaults } from '@/components/dialogs/StandortKontaktDialog';
import { StandortKontaktDetails } from '@/components/details/StandortKontaktDetails';
import { AI_PHOTO_SCAN, AI_PHOTO_LOCATION } from '@/config/ai-features';
import { t, appLabel } from '@/i18n';
import { undoToast } from '@/lib/polish';

// The overlay union — one branch per entity, `record` typed the way the data
// flows: Enriched* where enrichment exists, the raw record type otherwise.
// The host resolves enrichment itself; pages pass raw records everywhere.
export type OverlayItem =
  | { type: 'speisekarte'; record: Speisekarte }
  | { type: 'oeffnungszeiten'; record: Oeffnungszeiten }
  | { type: 'galerie'; record: Galerie }
  | { type: 'standort_kontakt'; record: StandortKontakt };

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
  speisekarte: EntityCrudApi<Speisekarte, SpeisekarteDialogDefaults>;
  oeffnungszeiten: EntityCrudApi<Oeffnungszeiten, OeffnungszeitenDialogDefaults>;
  galerie: EntityCrudApi<Galerie, GalerieDialogDefaults>;
  standortKontakt: EntityCrudApi<StandortKontakt, StandortKontaktDialogDefaults>;
}

export function useEntityCrud(data: EntityCrudData, options?: EntityCrudOptions): EntityCrud {
  const overlay = useRecordOverlayStack<OverlayItem>();
  const [speisekarteDialog, setSpeisekarteDialog] = useState<{ defaults?: SpeisekarteDialogDefaults; editing?: Speisekarte } | null>(null);
  const [oeffnungszeitenDialog, setOeffnungszeitenDialog] = useState<{ defaults?: OeffnungszeitenDialogDefaults; editing?: Oeffnungszeiten } | null>(null);
  const [galerieDialog, setGalerieDialog] = useState<{ defaults?: GalerieDialogDefaults; editing?: Galerie } | null>(null);
  const [standortKontaktDialog, setStandortKontaktDialog] = useState<{ defaults?: StandortKontaktDialogDefaults; editing?: StandortKontakt } | null>(null);

  function detailSpeisekarte(record: Speisekarte, push = false) {
    const item: OverlayItem = { type: 'speisekarte', record };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitSpeisekarte(fields: Speisekarte['fields']) {
    const editing = speisekarteDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setSpeisekarte(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateSpeisekarteEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('speisekarte')} — ${t('crud_updated')}`, async () => {
        data.setSpeisekarte(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateSpeisekarteEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createSpeisekarteEntry(fields);
      undoToast(`${appLabel('speisekarte')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailOeffnungszeiten(record: Oeffnungszeiten, push = false) {
    const item: OverlayItem = { type: 'oeffnungszeiten', record };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitOeffnungszeiten(fields: Oeffnungszeiten['fields']) {
    const editing = oeffnungszeitenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setOeffnungszeiten(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateOeffnungszeitenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('oeffnungszeiten')} — ${t('crud_updated')}`, async () => {
        data.setOeffnungszeiten(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateOeffnungszeitenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createOeffnungszeitenEntry(fields);
      undoToast(`${appLabel('oeffnungszeiten')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailGalerie(record: Galerie, push = false) {
    const item: OverlayItem = { type: 'galerie', record };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitGalerie(fields: Galerie['fields']) {
    const editing = galerieDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setGalerie(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateGalerieEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('galerie')} — ${t('crud_updated')}`, async () => {
        data.setGalerie(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateGalerieEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createGalerieEntry(fields);
      undoToast(`${appLabel('galerie')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailStandortKontakt(record: StandortKontakt, push = false) {
    const item: OverlayItem = { type: 'standort_kontakt', record };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitStandortKontakt(fields: StandortKontakt['fields']) {
    const editing = standortKontaktDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setStandortKontakt(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateStandortKontaktEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('standort_kontakt')} — ${t('crud_updated')}`, async () => {
        data.setStandortKontakt(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateStandortKontaktEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createStandortKontaktEntry(fields);
      undoToast(`${appLabel('standort_kontakt')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  const surfaces = (
    <>
      <SpeisekarteDialog
        open={speisekarteDialog !== null}
        onClose={() => setSpeisekarteDialog(null)}
        onSubmit={submitSpeisekarte}
        defaultValues={speisekarteDialog?.defaults}
        recordId={speisekarteDialog?.editing?.record_id}
        enablePhotoScan={AI_PHOTO_SCAN['Speisekarte']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Speisekarte']}
      />
      <OeffnungszeitenDialog
        open={oeffnungszeitenDialog !== null}
        onClose={() => setOeffnungszeitenDialog(null)}
        onSubmit={submitOeffnungszeiten}
        defaultValues={oeffnungszeitenDialog?.defaults}
        recordId={oeffnungszeitenDialog?.editing?.record_id}
        enablePhotoScan={AI_PHOTO_SCAN['Oeffnungszeiten']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Oeffnungszeiten']}
      />
      <GalerieDialog
        open={galerieDialog !== null}
        onClose={() => setGalerieDialog(null)}
        onSubmit={submitGalerie}
        defaultValues={galerieDialog?.defaults}
        recordId={galerieDialog?.editing?.record_id}
        enablePhotoScan={AI_PHOTO_SCAN['Galerie']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Galerie']}
      />
      <StandortKontaktDialog
        open={standortKontaktDialog !== null}
        onClose={() => setStandortKontaktDialog(null)}
        onSubmit={submitStandortKontakt}
        defaultValues={standortKontaktDialog?.defaults}
        recordId={standortKontaktDialog?.editing?.record_id}
        enablePhotoScan={AI_PHOTO_SCAN['StandortKontakt']}
        enablePhotoLocation={AI_PHOTO_LOCATION['StandortKontakt']}
      />
      <RecordOverlayHost
        overlay={overlay}
        placement={options?.placement}
        size={options?.size}
        footer={options?.footer}
        render={(top) => {
          if (top.type === 'speisekarte') {
            return (
              <>
                <RecordHeader title={top.record.fields.gericht_name ?? appLabel('speisekarte')} subtitle={undefined} />
                <SpeisekarteDetails
                  record={top.record}
                />
              </>
            );
          }
          if (top.type === 'oeffnungszeiten') {
            return (
              <>
                <RecordHeader title={top.record.fields.oeffnung_von ?? appLabel('oeffnungszeiten')} subtitle={undefined} />
                <OeffnungszeitenDetails
                  record={top.record}
                />
              </>
            );
          }
          if (top.type === 'galerie') {
            return (
              <>
                <RecordHeader title={top.record.fields.foto_titel ?? appLabel('galerie')} subtitle={undefined} />
                <GalerieDetails
                  record={top.record}
                />
              </>
            );
          }
          if (top.type === 'standort_kontakt') {
            return (
              <>
                <RecordHeader title={top.record.fields.restaurant_name ?? appLabel('standort_kontakt')} subtitle={undefined} />
                <StandortKontaktDetails
                  record={top.record}
                />
              </>
            );
          }
          return null;
        }}
        onEdit={(top) => {
          overlay.close();
          if (top.type === 'speisekarte') setSpeisekarteDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'oeffnungszeiten') setOeffnungszeitenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'galerie') setGalerieDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'standort_kontakt') setStandortKontaktDialog({ editing: top.record, defaults: top.record.fields });
        }}
      />
    </>
  );

  return {
    overlay,
    surfaces,
    speisekarte: {
      openCreate: (defaults?: SpeisekarteDialogDefaults) => setSpeisekarteDialog({ defaults }),
      openEdit: (record: Speisekarte) => setSpeisekarteDialog({ editing: record, defaults: record.fields }),
      openDetail: (record: Speisekarte) => detailSpeisekarte(record, false),
    },
    oeffnungszeiten: {
      openCreate: (defaults?: OeffnungszeitenDialogDefaults) => setOeffnungszeitenDialog({ defaults }),
      openEdit: (record: Oeffnungszeiten) => setOeffnungszeitenDialog({ editing: record, defaults: record.fields }),
      openDetail: (record: Oeffnungszeiten) => detailOeffnungszeiten(record, false),
    },
    galerie: {
      openCreate: (defaults?: GalerieDialogDefaults) => setGalerieDialog({ defaults }),
      openEdit: (record: Galerie) => setGalerieDialog({ editing: record, defaults: record.fields }),
      openDetail: (record: Galerie) => detailGalerie(record, false),
    },
    standortKontakt: {
      openCreate: (defaults?: StandortKontaktDialogDefaults) => setStandortKontaktDialog({ defaults }),
      openEdit: (record: StandortKontakt) => setStandortKontaktDialog({ editing: record, defaults: record.fields }),
      openDetail: (record: StandortKontakt) => detailStandortKontakt(record, false),
    },
  };
}
