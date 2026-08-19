import { useState, useMemo } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useEntityCrud } from '@/components/EntityCrud';
import { DashboardSkeleton, DashboardError } from '@/components/DashboardStates';
import { DashboardGrid } from '@/components/DashboardGrid';
import { StatStrip, StatStripItem } from '@/components/StatCard';
import { WorkList } from '@/components/WorkList';
import { tx, appLabel } from '@/i18n';
import { LOOKUP_OPTIONS } from '@/types/app';
import { useClock, gruss } from '@/lib/polish';
import { formatCurrency, lookupKey } from '@/lib/formatters';
import { GalerieGrid } from '@/components/custom/GalerieGrid';
import {
  IconLeaf,
  IconPlant,
  IconWheat,
  IconEdit,
  IconPlus,
  IconPhone,
  IconMail,
  IconClock,
  IconMapPin,
  IconToolsKitchen2,
} from '@tabler/icons-react';

export default function DashboardOverview() {
  const data = useDashboardData();
  const {
    speisekarte, oeffnungszeiten, galerie, standortKontakt,
    loading, error, fetchAll,
  } = data;
  const crud = useEntityCrud(data);
  const clock = useClock();

  const [kategorieFilter, setKategorieFilter] = useState<string | null>(null);

  // Kategorien aus der Speisekarte (im Component-Body für locale-aware labels)
  const kategorienOptions = LOOKUP_OPTIONS['speisekarte']?.['kategorie'] ?? [];

  const veganeAnzahl = useMemo(
    () => speisekarte.filter(g => g.fields.vegan).length,
    [speisekarte]
  );
  const vegetarischeAnzahl = useMemo(
    () => speisekarte.filter(g => g.fields.vegetarisch || g.fields.vegan).length,
    [speisekarte]
  );
  const glutenfreiAnzahl = useMemo(
    () => speisekarte.filter(g => g.fields.glutenfrei).length,
    [speisekarte]
  );

  const gefilterteSpeisen = useMemo(() => {
    if (!kategorieFilter) return speisekarte;
    return speisekarte.filter(g => lookupKey(g.fields.kategorie) === kategorieFilter);
  }, [speisekarte, kategorieFilter]);

  const kontakt = standortKontakt[0] ?? null;

  // Öffnungszeiten: Wochentag-Reihenfolge
  const wochentagOrder: Record<string, number> = {
    montag: 0, dienstag: 1, mittwoch: 2, donnerstag: 3,
    freitag: 4, samstag: 5, sonntag: 6,
  };
  const sortierteOeffnungszeiten = useMemo(
    () => [...oeffnungszeiten].sort((a, b) => {
      const ka = lookupKey(a.fields.wochentag) ?? '';
      const kb = lookupKey(b.fields.wochentag) ?? '';
      return (wochentagOrder[ka] ?? 99) - (wochentagOrder[kb] ?? 99);
    }),
    [oeffnungszeiten]
  );

  if (loading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} onRetry={fetchAll} />;

  // Heute offen?
  const wochentageDE: Record<number, string> = {
    0: 'sonntag', 1: 'montag', 2: 'dienstag', 3: 'mittwoch',
    4: 'donnerstag', 5: 'freitag', 6: 'samstag',
  };
  const heuteKey = wochentageDE[clock.getDay()];
  const heuteEintrag = oeffnungszeiten.find(o => lookupKey(o.fields.wochentag) === heuteKey);
  const heuteGeschlossen = heuteEintrag?.fields.geschlossen === true;
  const heuteOffen = heuteEintrag && !heuteGeschlossen;
  const heuteZeit = heuteOffen
    ? `${heuteEintrag!.fields.oeffnung_von ?? '?'} – ${heuteEintrag!.fields.oeffnung_bis ?? '?'}`
    : null;

  const kontextZeile = speisekarte.length === 0
    ? tx('Richte dein Menü ein — füge das erste Gericht hinzu.')
    : heuteGeschlossen
      ? tx('Heute geschlossen. Die Speisekarte hat ${n} Gerichte.', { n: speisekarte.length })
      : heuteZeit
        ? tx`Heute geöffnet ${heuteZeit} · ${speisekarte.length} Gerichte auf der Karte`
        : tx`${speisekarte.length} Gerichte auf der Karte`;

  return (
    <div className="space-y-6">
      {/* Seitenheader */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground truncate">
            {gruss(clock)}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{kontextZeile}</p>
        </div>
        <button
          onClick={() => crud.speisekarte.openCreate({})}
          className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <IconPlus size={16} className="shrink-0" />
          {tx('Gericht hinzufügen')}
        </button>
      </div>

      <DashboardGrid
        variant="wide"
        kpis={
          <StatStrip>
            <StatStripItem
              title={tx('Gerichte gesamt')}
              value={speisekarte.length}
              icon={<IconToolsKitchen2 size={16} />}
              tone="default"
            />
            <StatStripItem
              title={tx('Vegetarisch')}
              value={vegetarischeAnzahl}
              icon={<IconLeaf size={16} />}
              tone={vegetarischeAnzahl > 0 ? 'success' : 'default'}
            />
            <StatStripItem
              title={tx('Vegan')}
              value={veganeAnzahl}
              icon={<IconPlant size={16} />}
              tone={veganeAnzahl > 0 ? 'success' : 'default'}
            />
            <StatStripItem
              title={tx('Glutenfrei')}
              value={glutenfreiAnzahl}
              icon={<IconWheat size={16} />}
              tone={glutenfreiAnzahl > 0 ? 'success' : 'default'}
            />
          </StatStrip>
        }
        primary={
          <div className="space-y-4">
            {/* Kategorie-Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setKategorieFilter(null)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  kategorieFilter === null
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {tx('Alle')}
              </button>
              {kategorienOptions.map(opt => {
                const count = speisekarte.filter(g => lookupKey(g.fields.kategorie) === opt.key).length;
                if (count === 0) return null;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setKategorieFilter(f => f === opt.key ? null : opt.key)}
                    className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                      kategorieFilter === opt.key
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {opt.label} <span className="opacity-60">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Speisekarten-Grid */}
            {speisekarte.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-16 gap-4 text-center">
                <IconToolsKitchen2 size={48} className="text-muted-foreground" stroke={1.5} />
                <div>
                  <p className="font-semibold text-foreground">{tx('Noch keine Gerichte')}</p>
                  <p className="text-sm text-muted-foreground mt-1">{tx('Füge das erste Gericht hinzu, um die Speisekarte zu starten.')}</p>
                </div>
                <button
                  onClick={() => crud.speisekarte.openCreate({})}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <IconPlus size={16} className="shrink-0" />
                  {tx('Erstes Gericht hinzufügen')}
                </button>
              </div>
            ) : gefilterteSpeisen.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-border py-12 gap-2 text-center">
                <p className="text-muted-foreground text-sm">{tx('Keine Gerichte in dieser Kategorie.')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {gefilterteSpeisen.map(gericht => {
                  const kat = lookupKey(gericht.fields.kategorie);
                  const katLabel = gericht.fields.kategorie?.label ?? '';
                  return (
                    <div
                      key={gericht.record_id}
                      onClick={() => crud.speisekarte.openDetail(gericht)}
                      className="group rounded-xl border border-border bg-card overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    >
                      {gericht.fields.gericht_foto ? (
                        <img
                          src={gericht.fields.gericht_foto}
                          alt={gericht.fields.gericht_name ?? ''}
                          className="w-full h-40 object-cover"
                        />
                      ) : (
                        <div className="w-full h-40 bg-muted flex items-center justify-center">
                          <IconToolsKitchen2 size={32} className="text-muted-foreground" stroke={1} />
                        </div>
                      )}
                      <div className="p-3 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-sm text-foreground truncate min-w-0">
                            {gericht.fields.gericht_name ?? '—'}
                          </p>
                          <span className="shrink-0 text-sm font-bold text-primary">
                            {gericht.fields.preis != null ? formatCurrency(gericht.fields.preis) : '—'}
                          </span>
                        </div>
                        {gericht.fields.beschreibung && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {gericht.fields.beschreibung}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-1 pt-1">
                          {katLabel && (
                            <span className="text-xs rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                              {katLabel}
                            </span>
                          )}
                          {gericht.fields.vegetarisch && (
                            <span className="text-xs rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700 flex items-center gap-0.5">
                              <IconLeaf size={10} /> {tx('V')}
                            </span>
                          )}
                          {gericht.fields.vegan && (
                            <span className="text-xs rounded-full bg-green-100 px-2 py-0.5 text-green-700 flex items-center gap-0.5">
                              <IconPlant size={10} /> {tx('Ve')}
                            </span>
                          )}
                          {gericht.fields.glutenfrei && (
                            <span className="text-xs rounded-full bg-amber-100 px-2 py-0.5 text-amber-700 flex items-center gap-0.5">
                              <IconWheat size={10} /> {tx('Gf')}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={e => { e.stopPropagation(); crud.speisekarte.openEdit(gericht); }}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <IconEdit size={12} className="shrink-0" />
                            {tx('Bearbeiten')}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        }
        aside={
          <>
            {/* Öffnungszeiten */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h2 className="font-semibold text-sm flex items-center gap-2">
                  <IconClock size={16} className="shrink-0 text-muted-foreground" />
                  {appLabel('oeffnungszeiten')}
                </h2>
                <button
                  onClick={() => crud.oeffnungszeiten.openCreate({})}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={tx('Öffnungszeit hinzufügen')}
                >
                  <IconPlus size={16} />
                </button>
              </div>
              {oeffnungszeiten.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  {tx('Noch keine Öffnungszeiten gepflegt.')}
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {sortierteOeffnungszeiten.map(oz => {
                    const key = lookupKey(oz.fields.wochentag);
                    const istHeute = key === heuteKey;
                    const geschlossen = oz.fields.geschlossen;
                    return (
                      <div
                        key={oz.record_id}
                        onClick={() => crud.oeffnungszeiten.openDetail(oz)}
                        className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-muted/40 transition-colors text-sm ${istHeute ? 'bg-primary/5' : ''}`}
                      >
                        <span className={`font-medium ${istHeute ? 'text-primary' : 'text-foreground'}`}>
                          {oz.fields.wochentag?.label ?? key ?? '—'}
                          {istHeute && <span className="ml-1 text-xs text-primary opacity-70">{tx('(heute)')}</span>}
                        </span>
                        {geschlossen ? (
                          <span className="text-muted-foreground text-xs">{tx('Geschlossen')}</span>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            {oz.fields.oeffnung_von ?? '?'} – {oz.fields.oeffnung_bis ?? '?'}
                            {oz.fields.mittagspause_von && (
                              <span className="ml-1 opacity-60">
                                ({tx('Pause')} {oz.fields.mittagspause_von}–{oz.fields.mittagspause_bis})
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Kontakt & Standort */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h2 className="font-semibold text-sm flex items-center gap-2">
                  <IconMapPin size={16} className="shrink-0 text-muted-foreground" />
                  {appLabel('standort_kontakt')}
                </h2>
                {kontakt ? (
                  <button
                    onClick={() => crud.standortKontakt.openEdit(kontakt)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={tx('Kontakt bearbeiten')}
                  >
                    <IconEdit size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => crud.standortKontakt.openCreate({})}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={tx('Kontakt hinzufügen')}
                  >
                    <IconPlus size={16} />
                  </button>
                )}
              </div>
              {!kontakt ? (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  {tx('Noch kein Standort hinterlegt.')}
                </div>
              ) : (
                <div
                  onClick={() => crud.standortKontakt.openDetail(kontakt)}
                  className="px-4 py-3 space-y-2 cursor-pointer hover:bg-muted/40 transition-colors"
                >
                  {kontakt.fields.restaurant_name && (
                    <p className="font-semibold text-sm text-foreground truncate">
                      {kontakt.fields.restaurant_name}
                    </p>
                  )}
                  {(kontakt.fields.strasse || kontakt.fields.ort) && (
                    <p className="text-xs text-muted-foreground">
                      {[kontakt.fields.strasse, kontakt.fields.hausnummer].filter(Boolean).join(' ')}
                      {kontakt.fields.postleitzahl || kontakt.fields.ort
                        ? `, ${[kontakt.fields.postleitzahl, kontakt.fields.ort].filter(Boolean).join(' ')}`
                        : ''}
                    </p>
                  )}
                  {kontakt.fields.telefon && (
                    <a
                      href={`tel:${kontakt.fields.telefon}`}
                      onClick={e => e.stopPropagation()}
                      className="flex items-center gap-2 text-xs text-primary hover:underline"
                    >
                      <IconPhone size={12} className="shrink-0" />
                      {kontakt.fields.telefon}
                    </a>
                  )}
                  {kontakt.fields.email && (
                    <a
                      href={`mailto:${kontakt.fields.email}`}
                      onClick={e => e.stopPropagation()}
                      className="flex items-center gap-2 text-xs text-primary hover:underline truncate"
                    >
                      <IconMail size={12} className="shrink-0" />
                      <span className="truncate">{kontakt.fields.email}</span>
                    </a>
                  )}
                  {kontakt.fields.reservierungshinweis && (
                    <p className="text-xs text-muted-foreground italic border-t border-border pt-2 mt-2 line-clamp-3">
                      {kontakt.fields.reservierungshinweis}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Galerie */}
            <GalerieGrid
              items={galerie.map(f => ({
                id: f.record_id,
                titel: f.fields.foto_titel ?? '',
                datei: f.fields.foto_datei,
                beschreibung: f.fields.foto_beschreibung,
                kategorie: lookupKey(f.fields.foto_kategorie),
                kategorieLabel: f.fields.foto_kategorie?.label,
              }))}
              onPhotoClick={id => {
                const rec = galerie.find(f => f.record_id === id);
                if (rec) crud.galerie.openDetail(rec);
              }}
              onAddPhoto={() => crud.galerie.openCreate({})}
            />
          </>
        }
      />

      {crud.surfaces}
    </div>
  );
}
