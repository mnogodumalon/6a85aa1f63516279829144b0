import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: [
    'gericht_name',
    'kategorie',
    'preis',
    'vegetarisch',
    'vegan',
    'glutenfrei',
    'beschreibung',
  ],
  defaults: {
    'kategorie': { kind: 'lookup', key: 'hauptgericht', label: 'Hauptgericht' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};

export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
