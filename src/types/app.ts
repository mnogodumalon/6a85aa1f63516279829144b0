import { lookupLabel } from '@/i18n';

// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
export type GeoLocation = { lat: number; long: number; info?: string };

export type AttachmentType = 'file' | 'note' | 'url' | 'json';
export interface Attachment {
  id: string;
  type: AttachmentType;
  label: string | null;
  value: string | null;
  active: boolean;
  createdat?: string | null;
  updatedat?: string | null;
}

export interface AttachmentInput {
  type: AttachmentType;
  label?: string;
  value: string;
  active?: boolean;
}

export interface Speisekarte {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    gericht_name?: string;
    kategorie?: LookupValue;
    beschreibung?: string;
    preis?: number;
    gericht_foto?: string;
    vegetarisch?: boolean;
    vegan?: boolean;
    glutenfrei?: boolean;
  };
}

export interface Oeffnungszeiten {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    wochentag?: LookupValue;
    geschlossen?: boolean;
    oeffnung_von?: string;
    oeffnung_bis?: string;
    mittagspause_von?: string;
    mittagspause_bis?: string;
    hinweis_tag?: string;
  };
}

export interface Galerie {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    foto_titel?: string;
    foto_datei?: string;
    foto_beschreibung?: string;
    foto_kategorie?: LookupValue;
  };
}

export interface StandortKontakt {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    restaurant_name?: string;
    strasse?: string;
    hausnummer?: string;
    postleitzahl?: string;
    ort?: string;
    telefon?: string;
    email?: string;
    webseite?: string;
    reservierungshinweis?: string;
    standort_karte?: GeoLocation; // { lat, long, info }
  };
}

export const APP_IDS = {
  SPEISEKARTE: '6a85aa008159436889685815',
  OEFFNUNGSZEITEN: '6a85aa05da030153c4bd6114',
  GALERIE: '6a85aa0559fc4bfca196afd3',
  STANDORT_KONTAKT: '6a85aa06b59780ee07e2eb9a',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {
  'speisekarte': {
    kategorie: [{ key: "vorspeise", get label() { return lookupLabel('speisekarte', 'kategorie', "vorspeise") ?? "Vorspeise"; } }, { key: "suppe", get label() { return lookupLabel('speisekarte', 'kategorie', "suppe") ?? "Suppe"; } }, { key: "hauptgericht", get label() { return lookupLabel('speisekarte', 'kategorie', "hauptgericht") ?? "Hauptgericht"; } }, { key: "pasta", get label() { return lookupLabel('speisekarte', 'kategorie', "pasta") ?? "Pasta"; } }, { key: "pizza", get label() { return lookupLabel('speisekarte', 'kategorie', "pizza") ?? "Pizza"; } }, { key: "salat", get label() { return lookupLabel('speisekarte', 'kategorie', "salat") ?? "Salat"; } }, { key: "dessert", get label() { return lookupLabel('speisekarte', 'kategorie', "dessert") ?? "Dessert"; } }, { key: "getraenk", get label() { return lookupLabel('speisekarte', 'kategorie', "getraenk") ?? "Getränk"; } }, { key: "tagesgericht", get label() { return lookupLabel('speisekarte', 'kategorie', "tagesgericht") ?? "Tagesgericht"; } }],
  },
  'oeffnungszeiten': {
    wochentag: [{ key: "montag", get label() { return lookupLabel('oeffnungszeiten', 'wochentag', "montag") ?? "Montag"; } }, { key: "dienstag", get label() { return lookupLabel('oeffnungszeiten', 'wochentag', "dienstag") ?? "Dienstag"; } }, { key: "mittwoch", get label() { return lookupLabel('oeffnungszeiten', 'wochentag', "mittwoch") ?? "Mittwoch"; } }, { key: "donnerstag", get label() { return lookupLabel('oeffnungszeiten', 'wochentag', "donnerstag") ?? "Donnerstag"; } }, { key: "freitag", get label() { return lookupLabel('oeffnungszeiten', 'wochentag', "freitag") ?? "Freitag"; } }, { key: "samstag", get label() { return lookupLabel('oeffnungszeiten', 'wochentag', "samstag") ?? "Samstag"; } }, { key: "sonntag", get label() { return lookupLabel('oeffnungszeiten', 'wochentag', "sonntag") ?? "Sonntag"; } }],
  },
  'galerie': {
    foto_kategorie: [{ key: "innenraum", get label() { return lookupLabel('galerie', 'foto_kategorie', "innenraum") ?? "Innenraum"; } }, { key: "aussenbereich", get label() { return lookupLabel('galerie', 'foto_kategorie', "aussenbereich") ?? "Außenbereich"; } }, { key: "gerichte", get label() { return lookupLabel('galerie', 'foto_kategorie', "gerichte") ?? "Gerichte"; } }, { key: "team", get label() { return lookupLabel('galerie', 'foto_kategorie', "team") ?? "Team"; } }, { key: "atmosphaere", get label() { return lookupLabel('galerie', 'foto_kategorie', "atmosphaere") ?? "Atmosphäre"; } }, { key: "sonstiges", get label() { return lookupLabel('galerie', 'foto_kategorie', "sonstiges") ?? "Sonstiges"; } }],
  },
};

// Optimistic LookupValue writes: never re-type a label — resolve the schema
// option instead (its label is a locale-aware getter; falls back to the key).
// WRONG: status: { key: 'offen', label: 'Offen' }   (frozen in one language)
// RIGHT: status: lookupOption('<appKey>', 'status', 'offen')
export function lookupOption(app: string, field: string, key: string): LookupValue {
  return LOOKUP_OPTIONS[app]?.[field]?.find(o => o.key === key) ?? { key, label: key };
}

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'speisekarte': {
    'gericht_name': 'string/text',
    'kategorie': 'lookup/select',
    'beschreibung': 'string/textarea',
    'preis': 'number',
    'gericht_foto': 'file',
    'vegetarisch': 'bool',
    'vegan': 'bool',
    'glutenfrei': 'bool',
  },
  'oeffnungszeiten': {
    'wochentag': 'lookup/select',
    'geschlossen': 'bool',
    'oeffnung_von': 'string/text',
    'oeffnung_bis': 'string/text',
    'mittagspause_von': 'string/text',
    'mittagspause_bis': 'string/text',
    'hinweis_tag': 'string/text',
  },
  'galerie': {
    'foto_titel': 'string/text',
    'foto_datei': 'file',
    'foto_beschreibung': 'string/textarea',
    'foto_kategorie': 'lookup/select',
  },
  'standort_kontakt': {
    'restaurant_name': 'string/text',
    'strasse': 'string/text',
    'hausnummer': 'string/text',
    'postleitzahl': 'string/text',
    'ort': 'string/text',
    'telefon': 'string/tel',
    'email': 'string/email',
    'webseite': 'string/url',
    'reservierungshinweis': 'string/textarea',
    'standort_karte': 'geo',
  },
};

export const HUB_TOPOLOGY: Record<string, { field: string; entity: string }[]> = {
};

// Aliases for the pre-0.0.279 app keys (see 4c).
LOOKUP_OPTIONS['standort_&_kontakt'] = LOOKUP_OPTIONS['standort_kontakt'];
FIELD_TYPES['standort_&_kontakt'] = FIELD_TYPES['standort_kontakt'];

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | LookupValue | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | LookupValue[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateSpeisekarte = StripLookup<Speisekarte['fields']>;
export type CreateOeffnungszeiten = StripLookup<Oeffnungszeiten['fields']>;
export type CreateGalerie = StripLookup<Galerie['fields']>;
export type CreateStandortKontakt = StripLookup<StandortKontakt['fields']>;