import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Speisekarte, Oeffnungszeiten, Galerie, StandortKontakt } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';
import { t } from '@/i18n';

/** Dashboard data + the OPTIMISTIC-WRITE API.
 *
 *  The per-entity setters (`set<Entity>`) are exported for exactly one job:
 *  optimistic updates on drag writes (onEventDrop / onEventResize /
 *  onCardMove). Call the setter FIRST — the bar/card lands instantly — then
 *  fire the PATCH in the background and call `fetchAll()` ONLY in the catch.
 *  Never await the PATCH before updating state (the UI freezes for the full
 *  round-trip on every drag) and never refetch after a successful write.
 *  There is no other mechanism (no `__optimistic`, no `mutate`).
 */
export function useDashboardData() {
  const [speisekarte, setSpeisekarte] = useState<Speisekarte[]>([]);
  const [oeffnungszeiten, setOeffnungszeiten] = useState<Oeffnungszeiten[]>([]);
  const [galerie, setGalerie] = useState<Galerie[]>([]);
  const [standortKontakt, setStandortKontakt] = useState<StandortKontakt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [speisekarteData, oeffnungszeitenData, galerieData, standortKontaktData] = await Promise.all([
        LivingAppsService.getSpeisekarte(),
        LivingAppsService.getOeffnungszeiten(),
        LivingAppsService.getGalerie(),
        LivingAppsService.getStandortKontakt(),
      ]);
      setSpeisekarte(speisekarteData);
      setOeffnungszeiten(oeffnungszeitenData);
      setGalerie(galerieData);
      setStandortKontakt(standortKontaktData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(t('data_load_failed')));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Silent background refresh (no loading state change → no flicker)
  useEffect(() => {
    async function silentRefresh() {
      try {
        const [speisekarteData, oeffnungszeitenData, galerieData, standortKontaktData] = await Promise.all([
          LivingAppsService.getSpeisekarte(),
          LivingAppsService.getOeffnungszeiten(),
          LivingAppsService.getGalerie(),
          LivingAppsService.getStandortKontakt(),
        ]);
        setSpeisekarte(speisekarteData);
        setOeffnungszeiten(oeffnungszeitenData);
        setGalerie(galerieData);
        setStandortKontakt(standortKontaktData);
      } catch {
        // silently ignore — stale data is better than no data
      }
    }
    function handleRefresh() { void silentRefresh(); }
    window.addEventListener('dashboard-refresh', handleRefresh);
    return () => window.removeEventListener('dashboard-refresh', handleRefresh);
  }, []);

  return { speisekarte, setSpeisekarte, oeffnungszeiten, setOeffnungszeiten, galerie, setGalerie, standortKontakt, setStandortKontakt, loading, error, fetchAll };
}