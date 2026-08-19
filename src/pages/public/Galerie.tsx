import { useEffect, useState, useCallback } from 'react';
import { PublicShell } from '@/components/PublicShell';
import {
  loadPublicPagesConfig, listPublicRecords,
  type PublicPagesConfig, type PublicPageConfig,
} from '@/lib/publicClient';
import { tx } from '@/i18n';
import { IconX, IconChevronLeft, IconChevronRight, IconPhoto } from '@tabler/icons-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GalerieRecord {
  id: string;
  foto_titel: string;
  foto_datei: string | null;
  foto_beschreibung: string | null;
  foto_kategorie: string | null;
}

interface StandortRecord {
  id: string;
  restaurant_name: string | null;
}

type KategorieKey = 'alle' | 'innenraum' | 'aussenbereich' | 'gerichte' | 'team' | 'atmosphaere' | 'sonstiges';

// ---------------------------------------------------------------------------
// Lightbox
// ---------------------------------------------------------------------------

interface LightboxProps {
  photos: GalerieRecord[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function Lightbox({ photos, index, onClose, onPrev, onNext }: LightboxProps) {
  const photo = photos[index];

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, onPrev, onNext]);

  if (!photo) return null;

  return (
    <div
      className="fixed inset-0 z-[var(--z-overlay)] bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/40 rounded-full p-2 transition-colors"
        onClick={onClose}
        aria-label={tx('Schließen')}
      >
        <IconX size={24} />
      </button>

      {/* Prev */}
      {photos.length > 1 && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/40 rounded-full p-2 transition-colors"
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          aria-label={tx('Vorheriges Bild')}
        >
          <IconChevronLeft size={28} />
        </button>
      )}

      {/* Next */}
      {photos.length > 1 && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/40 rounded-full p-2 transition-colors"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          aria-label={tx('Nächstes Bild')}
        >
          <IconChevronRight size={28} />
        </button>
      )}

      {/* Image + caption */}
      <div
        className="flex flex-col items-center max-w-5xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {photo.foto_datei ? (
          <img
            src={photo.foto_datei}
            alt={photo.foto_titel}
            className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-64 bg-white/10 rounded-lg">
            <IconPhoto size={48} className="text-white/40" />
          </div>
        )}
        <div className="mt-4 text-center px-4">
          <p className="text-white font-semibold text-lg">{photo.foto_titel}</p>
          {photo.foto_beschreibung && (
            <p className="text-white/70 text-sm mt-1">{photo.foto_beschreibung}</p>
          )}
          <p className="text-white/40 text-xs mt-2">
            {index + 1} / {photos.length}
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function Galerie() {
  const [cfg, setCfg] = useState<PublicPagesConfig | null>(null);
  const [page, setPage] = useState<PublicPageConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const [fotos, setFotos] = useState<GalerieRecord[]>([]);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  const [activeKategorie, setActiveKategorie] = useState<KategorieKey>('alle');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Load config
  useEffect(() => {
    loadPublicPagesConfig('galerie').then(c => {
      setCfg(c);
      setPage(c?.pages['galerie'] ?? null);
      setLoading(false);
    });
  }, []);

  // Load data once config is ready
  useEffect(() => {
    if (!cfg || !page) return;
    setDataLoading(true);

    const galerieEp = page.endpoints?.find(e => e.entity === 'galerie' && e.op === 'list');
    const standortEp = page.endpoints?.find(e => e.entity === 'standort_kontakt' && e.op === 'list');

    const promises: Promise<void>[] = [];

    if (galerieEp) {
      promises.push(
        listPublicRecords(cfg, page, { appId: galerieEp.app_id, limit: 200 }).then(res => {
          const records: GalerieRecord[] = Object.values(res).map(r => ({
            id: r.id,
            foto_titel: (r.fields.foto_titel as string) ?? '',
            foto_datei: (r.fields.foto_datei as string) ?? null,
            foto_beschreibung: (r.fields.foto_beschreibung as string) ?? null,
            foto_kategorie: (r.fields.foto_kategorie as string) ?? null,
          }));
          setFotos(records);
        })
      );
    }

    if (standortEp) {
      promises.push(
        listPublicRecords(cfg, page, { appId: standortEp.app_id, limit: 1 }).then(res => {
          const first = Object.values(res)[0];
          if (first) {
            setRestaurantName((first.fields.restaurant_name as string) ?? null);
          }
        })
      );
    }

    Promise.all(promises).finally(() => setDataLoading(false));
  }, [cfg, page]);

  // Lightbox helpers
  const filteredFotos = fotos.filter(
    f => activeKategorie === 'alle' || f.foto_kategorie === activeKategorie
  );

  const openLightbox = useCallback((index: number) => setLightboxIndex(index), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevPhoto = useCallback(() => {
    setLightboxIndex(i => (i === null ? null : (i - 1 + filteredFotos.length) % filteredFotos.length));
  }, [filteredFotos.length]);
  const nextPhoto = useCallback(() => {
    setLightboxIndex(i => (i === null ? null : (i + 1) % filteredFotos.length));
  }, [filteredFotos.length]);

  if (loading) return <PublicShell loading />;
  if (!cfg || !page) return <PublicShell unavailable />;

  const pageTitle = restaurantName ?? (page.title ?? tx('Unsere Galerie'));

  const kategorien: { key: KategorieKey; label: string }[] = [
    { key: 'alle', label: tx('Alle') },
    { key: 'innenraum', label: tx('Innenraum') },
    { key: 'aussenbereich', label: tx('Außenbereich') },
    { key: 'gerichte', label: tx('Gerichte') },
    { key: 'team', label: tx('Team') },
    { key: 'atmosphaere', label: tx('Atmosphäre') },
    { key: 'sonstiges', label: tx('Sonstiges') },
  ];

  return (
    <PublicShell title={pageTitle} fullBleed>
      {/* Hero band */}
      <div className="bg-gradient-to-b from-stone-900 to-stone-800 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{pageTitle}</h1>
          <p className="mt-3 text-stone-300 text-lg">{tx('Einblicke in unser Restaurant')}</p>
        </div>
      </div>

      {/* Filter chips */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-stone-200 py-3 px-4">
        <div className="max-w-5xl mx-auto flex flex-wrap gap-2 justify-center">
          {kategorien.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveKategorie(key)}
              className={[
                'px-4 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0',
                activeKategorie === key
                  ? 'bg-stone-800 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery grid */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {dataLoading ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="w-full rounded-xl bg-stone-100 animate-pulse"
                style={{ height: `${180 + (i % 3) * 60}px` }}
              />
            ))}
          </div>
        ) : filteredFotos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-400">
            <IconPhoto size={48} stroke={1.5} />
            <p className="mt-4 text-base">{tx('Noch keine Fotos in dieser Kategorie')}</p>
          </div>
        ) : (
          /* Masonry-style CSS columns layout */
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {filteredFotos.map((foto, idx) => (
              <div
                key={foto.id}
                className="break-inside-avoid group relative cursor-pointer rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                onClick={() => openLightbox(idx)}
                role="button"
                tabIndex={0}
                aria-label={foto.foto_titel}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openLightbox(idx); }}
              >
                {foto.foto_datei ? (
                  <img
                    src={foto.foto_datei}
                    alt={foto.foto_titel}
                    className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-48 bg-stone-100 flex items-center justify-center">
                    <IconPhoto size={40} className="text-stone-300" stroke={1.5} />
                  </div>
                )}

                {/* Caption overlay on hover/tap */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4">
                  <p className="text-white font-semibold text-sm leading-tight truncate">{foto.foto_titel}</p>
                  {foto.foto_beschreibung && (
                    <p className="text-white/80 text-xs mt-0.5 line-clamp-2">{foto.foto_beschreibung}</p>
                  )}
                </div>

                {/* Always-visible title caption below image on mobile (no hover) */}
                <div className="sm:hidden bg-white px-3 py-2">
                  <p className="text-stone-800 text-sm font-medium truncate">{foto.foto_titel}</p>
                  {foto.foto_beschreibung && (
                    <p className="text-stone-500 text-xs mt-0.5 line-clamp-1">{foto.foto_beschreibung}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Photo count */}
        {!dataLoading && filteredFotos.length > 0 && (
          <p className="text-center text-stone-400 text-sm mt-8">
            {/* i18n-exempt: interpolation handled by tx template literal */}
            {tx`${filteredFotos.length} Fotos`}
          </p>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={filteredFotos}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevPhoto}
          onNext={nextPhoto}
        />
      )}
    </PublicShell>
  );
}
