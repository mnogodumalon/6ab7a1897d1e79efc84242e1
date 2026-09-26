import { lookupLabel } from '@/i18n';

// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
/** A raw record URL (applookup reference). NEVER render this directly
 *  in JSX — it is a URL, not a display value. Show the enriched `*Name`
 *  field or resolve it via the entity map instead. Assignable to/from
 *  string everywhere; the `& {}` keeps the alias NAME visible in tsc
 *  error messages (a plain primitive alias gets normalized away). */
export type RecordUrl = string & {};
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

export interface Organisationen {
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
    notizen?: string;
    name?: string;
    abteilungsleiter_vorname?: string;
    abteilungsleiter_nachname?: string;
    standort?: string;
    kuerzel?: string;
    beschreibung?: string;
  };
}

export interface Rollen {
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
    rollenname?: string;
    rollenkuerzel?: string;
    beschreibung?: string;
    kompetenzbereich?: LookupValue;
    notizen?: string;
  };
}

export interface Ressourcen {
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
    vorname?: string;
    nachname?: string;
    email?: string;
    notizen?: string;
    telefon?: string;
    organisation?: RecordUrl; // applookup -> URL zu 'Organisationen' Record
    rolle?: RecordUrl; // applookup -> URL zu 'Rollen' Record
    kostensatz?: number;
    verfuegbarkeit_prozent?: number;
    eintrittsdatum?: string; // Format: YYYY-MM-DD oder ISO String
    austrittsdatum?: string; // Format: YYYY-MM-DD oder ISO String
  };
}

export interface Aufgaben {
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
    aufgabenname?: string;
    aufgabentyp?: LookupValue;
    fertigstellungsgrad?: number;
    notizen?: string;
    geplantes_ende?: string; // Format: YYYY-MM-DD oder ISO String
    geplante_dauer_tage?: number;
    tatsaechlicher_start?: string; // Format: YYYY-MM-DD oder ISO String
    tatsaechliches_ende?: string; // Format: YYYY-MM-DD oder ISO String
    geschaetzter_aufwand_stunden?: number;
    tatsaechlicher_aufwand_stunden?: number;
    prioritaet?: LookupValue;
    beschreibung?: string;
    status?: LookupValue;
    geplanter_start?: string; // Format: YYYY-MM-DD oder ISO String
    uebergeordnete_aufgabe?: RecordUrl; // applookup -> URL zu 'Aufgaben' Record
    vorgaenger?: RecordUrl[];
  };
}

export interface Ressourcenzuweisungen {
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
    ressource?: RecordUrl; // applookup -> URL zu 'Ressourcen' Record
    zuweisung_start?: string; // Format: YYYY-MM-DD oder ISO String
    zuweisung_ende?: string; // Format: YYYY-MM-DD oder ISO String
    geplanter_aufwand_stunden?: number;
    tatsaechlicher_aufwand_stunden?: number;
    auslastung_prozent?: number;
    notizen?: string;
    aufgabe?: RecordUrl; // applookup -> URL zu 'Aufgaben' Record
  };
}

export const APP_IDS = {
  ORGANISATIONEN: '6ab7a17bdba25fd1e42dc67e',
  ROLLEN: '6ab7a17e07ae831366d01840',
  RESSOURCEN: '6ab7a17f4cc96b69e05d2640',
  AUFGABEN: '6ab7a17fc5b563a01dbfe73f',
  RESSOURCENZUWEISUNGEN: '6ab7a180b919bfe047dc38e9',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {
  'rollen': {
    kompetenzbereich: [{ key: "projektmanagement", get label() { return lookupLabel('rollen', 'kompetenzbereich', "projektmanagement") ?? "Projektmanagement"; } }, { key: "softwareentwicklung", get label() { return lookupLabel('rollen', 'kompetenzbereich', "softwareentwicklung") ?? "Softwareentwicklung"; } }, { key: "design_ux", get label() { return lookupLabel('rollen', 'kompetenzbereich', "design_ux") ?? "Design & UX"; } }, { key: "qualitaetssicherung", get label() { return lookupLabel('rollen', 'kompetenzbereich', "qualitaetssicherung") ?? "Qualitätssicherung"; } }, { key: "analyse_beratung", get label() { return lookupLabel('rollen', 'kompetenzbereich', "analyse_beratung") ?? "Analyse & Beratung"; } }, { key: "infrastruktur_betrieb", get label() { return lookupLabel('rollen', 'kompetenzbereich', "infrastruktur_betrieb") ?? "Infrastruktur & Betrieb"; } }, { key: "sonstiges", get label() { return lookupLabel('rollen', 'kompetenzbereich', "sonstiges") ?? "Sonstiges"; } }],
  },
  'aufgaben': {
    aufgabentyp: [{ key: "sammelaufgabe", get label() { return lookupLabel('aufgaben', 'aufgabentyp', "sammelaufgabe") ?? "Sammelaufgabe (Übergeordnet)"; } }, { key: "arbeitspaket", get label() { return lookupLabel('aufgaben', 'aufgabentyp', "arbeitspaket") ?? "Arbeitspaket"; } }, { key: "meilenstein", get label() { return lookupLabel('aufgaben', 'aufgabentyp', "meilenstein") ?? "Meilenstein"; } }],
    prioritaet: [{ key: "niedrig", get label() { return lookupLabel('aufgaben', 'prioritaet', "niedrig") ?? "Niedrig"; } }, { key: "mittel", get label() { return lookupLabel('aufgaben', 'prioritaet', "mittel") ?? "Mittel"; } }, { key: "hoch", get label() { return lookupLabel('aufgaben', 'prioritaet', "hoch") ?? "Hoch"; } }, { key: "kritisch", get label() { return lookupLabel('aufgaben', 'prioritaet', "kritisch") ?? "Kritisch"; } }],
    status: [{ key: "nicht_begonnen", get label() { return lookupLabel('aufgaben', 'status', "nicht_begonnen") ?? "Nicht begonnen"; } }, { key: "in_bearbeitung", get label() { return lookupLabel('aufgaben', 'status', "in_bearbeitung") ?? "In Bearbeitung"; } }, { key: "abgeschlossen", get label() { return lookupLabel('aufgaben', 'status', "abgeschlossen") ?? "Abgeschlossen"; } }, { key: "zurueckgestellt", get label() { return lookupLabel('aufgaben', 'status', "zurueckgestellt") ?? "Zurückgestellt"; } }, { key: "abgebrochen", get label() { return lookupLabel('aufgaben', 'status', "abgebrochen") ?? "Abgebrochen"; } }],
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
  'organisationen': {
    'notizen': 'string/textarea',
    'name': 'string/text',
    'abteilungsleiter_vorname': 'string/text',
    'abteilungsleiter_nachname': 'string/text',
    'standort': 'string/text',
    'kuerzel': 'string/text',
    'beschreibung': 'string/textarea',
  },
  'rollen': {
    'rollenname': 'string/text',
    'rollenkuerzel': 'string/text',
    'beschreibung': 'string/textarea',
    'kompetenzbereich': 'lookup/select',
    'notizen': 'string/textarea',
  },
  'ressourcen': {
    'vorname': 'string/text',
    'nachname': 'string/text',
    'email': 'string/email',
    'notizen': 'string/textarea',
    'telefon': 'string/tel',
    'organisation': 'applookup/select',
    'rolle': 'applookup/select',
    'kostensatz': 'number',
    'verfuegbarkeit_prozent': 'number',
    'eintrittsdatum': 'date/date',
    'austrittsdatum': 'date/date',
  },
  'aufgaben': {
    'aufgabenname': 'string/text',
    'aufgabentyp': 'lookup/radio',
    'fertigstellungsgrad': 'number',
    'notizen': 'string/textarea',
    'geplantes_ende': 'date/date',
    'geplante_dauer_tage': 'number',
    'tatsaechlicher_start': 'date/date',
    'tatsaechliches_ende': 'date/date',
    'geschaetzter_aufwand_stunden': 'number',
    'tatsaechlicher_aufwand_stunden': 'number',
    'prioritaet': 'lookup/radio',
    'beschreibung': 'string/textarea',
    'status': 'lookup/select',
    'geplanter_start': 'date/date',
    'uebergeordnete_aufgabe': 'applookup/select',
    'vorgaenger': 'multipleapplookup/select',
  },
  'ressourcenzuweisungen': {
    'ressource': 'applookup/select',
    'zuweisung_start': 'date/date',
    'zuweisung_ende': 'date/date',
    'geplanter_aufwand_stunden': 'number',
    'tatsaechlicher_aufwand_stunden': 'number',
    'auslastung_prozent': 'number',
    'notizen': 'string/textarea',
    'aufgabe': 'applookup/select',
  },
};

export const HUB_TOPOLOGY: Record<string, { field: string; entity: string }[]> = {
};

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | LookupValue | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | LookupValue[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateOrganisationen = StripLookup<Organisationen['fields']>;
export type CreateRollen = StripLookup<Rollen['fields']>;
export type CreateRessourcen = StripLookup<Ressourcen['fields']>;
export type CreateAufgaben = StripLookup<Aufgaben['fields']>;
export type CreateRessourcenzuweisungen = StripLookup<Ressourcenzuweisungen['fields']>;