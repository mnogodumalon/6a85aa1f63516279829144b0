import { useEffect, useRef, useState } from 'react';
import { PublicShell } from '@/components/PublicShell';
import {
  loadPublicPagesConfig,
  listPublicRecords,
  PageUnavailableError,
  type PublicPagesConfig,
  type PublicPageConfig,
} from '@/lib/publicClient';
import { tx } from '@/i18n';
import {
  IconLeaf,
  IconStar,
  IconWheat,
  IconPhone,
  IconMail,
  IconWorld,
  IconMapPin,
  IconClock,
  IconAlertCircle,
  IconChevronRight,
} from '@tabler/icons-react';

// ─── Data interfaces ───────────────────────────────────────────────────────

interface Gericht {
  id: string;
  gericht_name: string;
  kategorie: string | null;
  beschreibung: string | null;
  preis: number | null;
  gericht_foto: string | null;
  vegetarisch: boolean | null;
  vegan: boolean | null;
  glutenfrei: boolean | null;
}

interface Oeffnungszeit {
  id: string;
  wochentag: string | null;
  geschlossen: boolean | null;
  oeffnung_von: string | null;
  oeffnung_bis: string | null;
  mittagspause_von: string | null;
  mittagspause_bis: string | null;
  hinweis_tag: string | null;
}

interface StandortKontakt {
  id: string;
  restaurant_name: string | null;
  strasse: string | null;
  hausnummer: string | null;
  postleitzahl: string | null;
  ort: string | null;
  telefon: string | null;
  email: string | null;
  webseite: string | null;
  reservierungshinweis: string | null;
  standort_karte: { lat: number; long: number; info?: string } | null;
}

// ─── Kategorie ordering & labels ──────────────────────────────────────────

const KATEGORIE_ORDER = [
  'tagesgericht',
  'vorspeise',
  'suppe',
  'salat',
  'pasta',
  'pizza',
  'hauptgericht',
  'dessert',
  'getraenk',
];

const KATEGORIE_LABELS: Record<string, string> = {
  tagesgericht: 'Tagesgericht',
  vorspeise: 'Vorspeisen',
  suppe: 'Suppen',
  salat: 'Salate',
  pasta: 'Pasta',
  pizza: 'Pizza',
  hauptgericht: 'Hauptgerichte',
  dessert: 'Desserts',
  getraenk: 'Getränke',
};

const WOCHENTAG_ORDER = [
  'montag',
  'dienstag',
  'mittwoch',
  'donnerstag',
  'freitag',
  'samstag',
  'sonntag',
];

const WOCHENTAG_LABELS: Record<string, string> = {
  montag: 'Montag',
  dienstag: 'Dienstag',
  mittwoch: 'Mittwoch',
  donnerstag: 'Donnerstag',
  freitag: 'Freitag',
  samstag: 'Samstag',
  sonntag: 'Sonntag',
};

// ─── Scroll helpers ────────────────────────────────────────────────────────

function scrollTo(ref: React.RefObject<HTMLElement | null>) {
  ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── Sub-components ────────────────────────────────────────────────────────

function DietBadge({ vegetarisch, vegan, glutenfrei }: Pick<Gericht, 'vegetarisch' | 'vegan' | 'glutenfrei'>) {
  return (
    <span className="flex items-center gap-1.5 flex-wrap">
      {vegan && (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
          <IconStar size={11} className="shrink-0" />
          {tx('Vegan')}
        </span>
      )}
      {!vegan && vegetarisch && (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
          <IconLeaf size={11} className="shrink-0" />
          {tx('Vegetarisch')}
        </span>
      )}
      {glutenfrei && (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
          <IconWheat size={11} className="shrink-0" />
          {tx('Glutenfrei')}
        </span>
      )}
    </span>
  );
}

function GerichtCard({ g }: { g: Gericht }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden flex flex-col sm:flex-row gap-0">
      {g.gericht_foto && (
        <div className="sm:w-32 sm:shrink-0 h-44 sm:h-auto">
          <img
            src={g.gericht_foto}
            alt={g.gericht_name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-col justify-between gap-2 p-4 flex-1 min-w-0">
        <div>
          <div className="flex items-start justify-between gap-2 min-w-0">
            <h3 className="text-base font-semibold text-stone-900 leading-snug">{g.gericht_name}</h3>
            {g.preis != null && (
              <span className="text-base font-bold text-amber-700 shrink-0 tabular-nums">
                {g.preis.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 })}
              </span>
            )}
          </div>
          {g.beschreibung && (
            <p className="text-sm text-stone-500 mt-1 line-clamp-3">{g.beschreibung}</p>
          )}
        </div>
        <DietBadge vegetarisch={g.vegetarisch} vegan={g.vegan} glutenfrei={g.glutenfrei} />
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export default function Restaurant() {
  const [cfg, setCfg] = useState<PublicPagesConfig | null>(null);
  const [page, setPage] = useState<PublicPageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  const [gerichte, setGerichte] = useState<Gericht[]>([]);
  const [oeffnungszeiten, setOeffnungszeiten] = useState<Oeffnungszeit[]>([]);
  const [standort, setStandort] = useState<StandortKontakt | null>(null);

  // Nav refs for smooth scroll (no hash anchors — hash-routed app)
  const speisekarteRef = useRef<HTMLElement>(null);
  const oeffnungRef = useRef<HTMLElement>(null);
  const standortRef = useRef<HTMLElement>(null);

  useEffect(() => {
    loadPublicPagesConfig('restaurant')
      .then(async (c) => {
        if (!c) { setUnavailable(true); setLoading(false); return; }
        const p = c.pages['restaurant'] ?? null;
        if (!p) { setUnavailable(true); setLoading(false); return; }
        setCfg(c);
        setPage(p);

        const epSpeise = p.endpoints?.find(e => e.entity === 'speisekarte' && e.op === 'list');
        const epOeff   = p.endpoints?.find(e => e.entity === 'oeffnungszeiten' && e.op === 'list');
        const epStand  = p.endpoints?.find(e => e.entity === 'standort_kontakt' && e.op === 'list');

        const [rSpeise, rOeff, rStand] = await Promise.all([
          epSpeise ? listPublicRecords(c, p, { appId: epSpeise.app_id }) : Promise.resolve({}),
          epOeff   ? listPublicRecords(c, p, { appId: epOeff.app_id })   : Promise.resolve({}),
          epStand  ? listPublicRecords(c, p, { appId: epStand.app_id })  : Promise.resolve({}),
        ]);

        setGerichte(
          Object.values(rSpeise).map(r => ({
            id: r.id,
            gericht_name: (r.fields.gericht_name as string) ?? '',
            kategorie:    (r.fields.kategorie as string)    ?? null,
            beschreibung: (r.fields.beschreibung as string) ?? null,
            preis:        (r.fields.preis as number)        ?? null,
            gericht_foto: (r.fields.gericht_foto as string) ?? null,
            vegetarisch:  (r.fields.vegetarisch as boolean) ?? null,
            vegan:        (r.fields.vegan as boolean)       ?? null,
            glutenfrei:   (r.fields.glutenfrei as boolean)  ?? null,
          }))
        );

        setOeffnungszeiten(
          Object.values(rOeff).map(r => ({
            id:               r.id,
            wochentag:        (r.fields.wochentag as string)        ?? null,
            geschlossen:      (r.fields.geschlossen as boolean)     ?? null,
            oeffnung_von:     (r.fields.oeffnung_von as string)     ?? null,
            oeffnung_bis:     (r.fields.oeffnung_bis as string)     ?? null,
            mittagspause_von: (r.fields.mittagspause_von as string) ?? null,
            mittagspause_bis: (r.fields.mittagspause_bis as string) ?? null,
            hinweis_tag:      (r.fields.hinweis_tag as string)      ?? null,
          }))
        );

        const standortArr = Object.values(rStand);
        if (standortArr.length > 0) {
          const r = standortArr[0];
          setStandort({
            id:                  r.id,
            restaurant_name:     (r.fields.restaurant_name as string)     ?? null,
            strasse:             (r.fields.strasse as string)             ?? null,
            hausnummer:          (r.fields.hausnummer as string)          ?? null,
            postleitzahl:        (r.fields.postleitzahl as string)        ?? null,
            ort:                 (r.fields.ort as string)                 ?? null,
            telefon:             (r.fields.telefon as string)             ?? null,
            email:               (r.fields.email as string)               ?? null,
            webseite:            (r.fields.webseite as string)            ?? null,
            reservierungshinweis:(r.fields.reservierungshinweis as string)?? null,
            standort_karte:      (r.fields.standort_karte as { lat: number; long: number; info?: string }) ?? null,
          });
        }

        setLoading(false);
      })
      .catch((err) => {
        if (err instanceof PageUnavailableError) setUnavailable(true);
        setLoading(false);
      });
  }, []);

  if (loading || unavailable || !cfg || !page) {
    return <PublicShell loading={loading} unavailable={!loading && unavailable} />;
  }

  // ─── Speisekarte grouped by category ──────────────────────────────────
  const byKat = new Map<string, Gericht[]>();
  for (const g of gerichte) {
    const k = g.kategorie ?? '__other__';
    if (!byKat.has(k)) byKat.set(k, []);
    byKat.get(k)!.push(g);
  }
  const sortedKats = [
    ...KATEGORIE_ORDER.filter(k => byKat.has(k)),
    ...[...byKat.keys()].filter(k => !KATEGORIE_ORDER.includes(k)),
  ];

  // ─── Öffnungszeiten sorted by weekday ─────────────────────────────────
  const sortedOeff = [...oeffnungszeiten].sort((a, b) => {
    const ai = WOCHENTAG_ORDER.indexOf(a.wochentag ?? '');
    const bi = WOCHENTAG_ORDER.indexOf(b.wochentag ?? '');
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  // ─── Map URL fallback (Google Maps) ───────────────────────────────────
  const geo = standort?.standort_karte;
  const mapEmbedUrl = geo
    ? `https://maps.google.com/maps?q=${geo.lat},${geo.long}&z=16&output=embed`
    : standort
      ? `https://maps.google.com/maps?q=${encodeURIComponent(
          [standort.strasse, standort.hausnummer, standort.postleitzahl, standort.ort]
            .filter(Boolean).join(' ')
        )}&z=16&output=embed`
      : null;

  const restaurantName = standort?.restaurant_name ?? tx('Unser Restaurant');

  return (
    <PublicShell fullBleed>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative bg-stone-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
        <div className="relative max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center">
          <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-3">
            {tx('Willkommen bei')}
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">{restaurantName}</h1>
          {standort?.reservierungshinweis && (
            <div className="inline-flex items-start gap-2 mt-4 bg-amber-500/20 border border-amber-400/40 rounded-xl px-5 py-3 text-amber-200 text-sm max-w-lg mx-auto">
              <IconAlertCircle size={18} className="shrink-0 mt-0.5 text-amber-400" />
              <span>{standort.reservierungshinweis}</span>
            </div>
          )}
          {/* Nav pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <button
              onClick={() => scrollTo(speisekarteRef)}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-4 py-2 text-sm font-medium transition-colors"
            >
              {tx('Speisekarte')} <IconChevronRight size={14} className="shrink-0" />
            </button>
            <button
              onClick={() => scrollTo(oeffnungRef)}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-4 py-2 text-sm font-medium transition-colors"
            >
              {tx('Öffnungszeiten')} <IconChevronRight size={14} className="shrink-0" />
            </button>
            <button
              onClick={() => scrollTo(standortRef)}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-4 py-2 text-sm font-medium transition-colors"
            >
              {tx('Standort & Kontakt')} <IconChevronRight size={14} className="shrink-0" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Speisekarte ──────────────────────────────────────────────── */}
      <section ref={speisekarteRef} className="py-12 sm:py-16 bg-stone-50 scroll-mt-4">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-stone-900">{tx('Speisekarte')}</h2>
            <p className="text-stone-500 mt-2 text-sm">
              <span className="inline-flex items-center gap-1.5">
                <IconLeaf size={13} className="text-green-600" /> {tx('Vegetarisch')}
              </span>
              {' · '}
              <span className="inline-flex items-center gap-1.5">
                <IconStar size={13} className="text-emerald-600" /> {tx('Vegan')}
              </span>
              {' · '}
              <span className="inline-flex items-center gap-1.5">
                <IconWheat size={13} className="text-amber-600" /> {tx('Glutenfrei')}
              </span>
            </p>
          </div>

          {gerichte.length === 0 ? (
            <p className="text-center text-stone-400 py-12">{tx('Die Speisekarte wird gerade aktualisiert.')}</p>
          ) : (
            <div className="space-y-10">
              {sortedKats.map(kat => {
                const items = byKat.get(kat)!;
                const label = kat === '__other__'
                  ? tx('Weitere Gerichte')
                  : (KATEGORIE_LABELS[kat] ?? kat);
                return (
                  <div key={kat}>
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-lg font-bold text-stone-800 uppercase tracking-wide">{label}</h3>
                      <div className="flex-1 h-px bg-stone-200" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {items.map(g => <GerichtCard key={g.id} g={g} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Öffnungszeiten ───────────────────────────────────────────── */}
      <section ref={oeffnungRef} className="py-12 sm:py-16 bg-white scroll-mt-4">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-50 mb-3">
              <IconClock size={20} className="text-amber-600" />
            </span>
            <h2 className="text-3xl font-bold text-stone-900">{tx('Öffnungszeiten')}</h2>
          </div>

          {sortedOeff.length === 0 ? (
            <p className="text-center text-stone-400 py-8">{tx('Öffnungszeiten werden noch hinterlegt.')}</p>
          ) : (
            <div className="bg-stone-50 rounded-2xl border border-stone-100 divide-y divide-stone-100 overflow-hidden">
              {sortedOeff.map((oz) => {
                const label = oz.wochentag ? (WOCHENTAG_LABELS[oz.wochentag] ?? oz.wochentag) : '—';
                const isToday = (() => {
                  const dayNames = ['sonntag','montag','dienstag','mittwoch','donnerstag','freitag','samstag'];
                  return oz.wochentag === dayNames[new Date().getDay()];
                })();
                return (
                  <div
                    key={oz.id}
                    className={`flex items-start justify-between gap-4 px-5 py-4 ${isToday ? 'bg-amber-50' : ''}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`font-semibold text-sm w-24 shrink-0 ${isToday ? 'text-amber-700' : 'text-stone-700'}`}>
                        {label}
                        {isToday && (
                          <span className="ml-2 text-xs font-medium text-amber-600 bg-amber-100 rounded-full px-1.5 py-0.5">
                            {tx('Heute')}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="text-right text-sm text-stone-600 min-w-0">
                      {oz.geschlossen ? (
                        <span className="font-semibold text-red-600 bg-red-50 border border-red-100 rounded-full px-3 py-0.5 text-xs">
                          {tx('Geschlossen')}
                        </span>
                      ) : (
                        <div className="space-y-0.5">
                          {oz.oeffnung_von && oz.oeffnung_bis && (
                            <div>{oz.oeffnung_von} – {oz.oeffnung_bis} {tx('Uhr')}</div>
                          )}
                          {oz.mittagspause_von && oz.mittagspause_bis && (
                            <div className="text-stone-400 text-xs">
                              {tx('Mittagspause')}: {oz.mittagspause_von} – {oz.mittagspause_bis} {tx('Uhr')}
                            </div>
                          )}
                          {oz.hinweis_tag && (
                            <div className="text-amber-600 text-xs italic">{oz.hinweis_tag}</div>
                          )}
                          {!oz.oeffnung_von && !oz.oeffnung_bis && (
                            <span className="text-stone-400">—</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Standort & Kontakt ────────────────────────────────────────── */}
      <section ref={standortRef} className="py-12 sm:py-16 bg-stone-50 scroll-mt-4">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-50 mb-3">
              <IconMapPin size={20} className="text-amber-600" />
            </span>
            <h2 className="text-3xl font-bold text-stone-900">{tx('Standort & Kontakt')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Contact card */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-4">
              {standort ? (
                <>
                  <div className="flex items-start gap-3">
                    <IconMapPin size={18} className="shrink-0 text-amber-600 mt-0.5" />
                    <address className="not-italic text-stone-700 text-sm leading-relaxed">
                      {standort.strasse && standort.hausnummer
                        ? <>{standort.strasse} {standort.hausnummer}<br /></>
                        : null}
                      {standort.postleitzahl && standort.ort
                        ? <>{standort.postleitzahl} {standort.ort}</>
                        : null}
                    </address>
                  </div>

                  {standort.telefon && (
                    <div className="flex items-center gap-3">
                      <IconPhone size={18} className="shrink-0 text-amber-600" />
                      <a
                        href={`tel:${standort.telefon}`}
                        className="text-sm text-stone-700 hover:text-amber-700 transition-colors"
                      >
                        {standort.telefon}
                      </a>
                    </div>
                  )}

                  {standort.email && (
                    <div className="flex items-center gap-3">
                      <IconMail size={18} className="shrink-0 text-amber-600" />
                      <a
                        href={`mailto:${standort.email}`}
                        className="text-sm text-stone-700 hover:text-amber-700 transition-colors break-all"
                      >
                        {standort.email}
                      </a>
                    </div>
                  )}

                  {standort.webseite && (
                    <div className="flex items-center gap-3">
                      <IconWorld size={18} className="shrink-0 text-amber-600" />
                      <a
                        href={standort.webseite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-stone-700 hover:text-amber-700 transition-colors break-all"
                      >
                        {standort.webseite.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-stone-400 text-sm">{tx('Kontaktdaten werden noch hinterlegt.')}</p>
              )}
            </div>

            {/* Map */}
            {mapEmbedUrl ? (
              <div className="rounded-2xl overflow-hidden shadow-sm border border-stone-100 aspect-[4/3]">
                <iframe
                  title={tx('Kartenansicht')}
                  src={mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : (
              <div className="rounded-2xl bg-stone-100 border border-stone-200 aspect-[4/3] flex items-center justify-center">
                <p className="text-stone-400 text-sm">{tx('Karte wird eingerichtet.')}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="bg-stone-900 text-stone-400 text-center text-xs py-6 px-4">
        <p>© {new Date().getFullYear()} {restaurantName} {/* i18n-exempt */}</p>
      </footer>
    </PublicShell>
  );
}
