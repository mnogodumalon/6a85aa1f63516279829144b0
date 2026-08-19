import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: [
    'restaurant_name',
    { row: ['strasse', 'hausnummer'], cols: '2fr 1fr' },
    { row: ['postleitzahl', 'ort'], cols: '1fr 2fr' },
    'telefon',
    'email',
    'webseite',
    'reservierungshinweis',
  ],
  defaults: {},
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};

export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
