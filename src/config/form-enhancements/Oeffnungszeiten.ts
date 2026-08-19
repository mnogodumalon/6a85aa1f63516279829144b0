import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: [
    'wochentag',
    'geschlossen',
    'oeffnung_von',
    'oeffnung_bis',
    'mittagspause_von',
    'mittagspause_bis',
    'hinweis_tag',
  ],
  defaults: {
    'geschlossen': { kind: 'literal', value: false },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};

export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
