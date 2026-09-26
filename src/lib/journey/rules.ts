/**
 * Field rules — GENERATED from the app metadata. Do not edit.
 *
 * The mechanical truth about every field: what kind it is, whether the
 * platform's base view marks it required, which lookup keys exist, where an
 * applookup points, what the label is. `useStepForm` validates against these
 * rules and phrases its messages with the real labels; `toWirePayload` uses
 * them to shape the create payload; `SHAPES` tells a page which input FORM
 * fits the data (a date pair wants a calendar, not two fields) — it is a
 * signal, not a gate.
 */
import { appLabel, fieldLabel, lookupLabel } from '@/i18n';
import { LOOKUP_OPTIONS } from '@/types/app';

export type EntityKey = 'organisationen' | 'rollen' | 'ressourcen' | 'aufgaben' | 'ressourcenzuweisungen';

/** The text fields of each entity — what a search may run over (generated;
 *  `never` for an entity without text of its own, e.g. a link table). */
export interface StringFields {
  "organisationen": "notizen" | "name" | "abteilungsleiter_vorname" | "abteilungsleiter_nachname" | "standort" | "kuerzel" | "beschreibung";
  "rollen": "rollenname" | "rollenkuerzel" | "beschreibung" | "notizen";
  "ressourcen": "vorname" | "nachname" | "email" | "notizen" | "telefon";
  "aufgaben": "aufgabenname" | "notizen" | "beschreibung";
  "ressourcenzuweisungen": "notizen";
}
export type StringFieldKey<E extends EntityKey> = E extends keyof StringFields ? StringFields[E] : never;

/** The applookup fields of each entity (generated). A pick stored through
 *  `form.set` on one of these must carry its display name — at compile time
 *  (`StepForm.set`), because the review would otherwise show the id. */
export interface RecordFields {
  "organisationen": never;
  "rollen": never;
  "ressourcen": "organisation" | "rolle";
  "aufgaben": "uebergeordnete_aufgabe" | "vorgaenger";
  "ressourcenzuweisungen": "ressource" | "aufgabe";
}
export type RecordFieldKey<E extends EntityKey> = E extends keyof RecordFields ? RecordFields[E] : never;

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'email'
  | 'tel'
  | 'url'
  | 'number'
  | 'bool'
  | 'date'
  | 'datetime'
  | 'lookup'
  | 'multilookup'
  | 'record'
  | 'multirecord'
  | 'file'
  | 'geo';

export interface FieldRule {
  key: string;
  fulltype: string;
  kind: FieldKind;
  /** From the app's base view. A public page may override this per field. */
  required: boolean;
  /** Build-time label — `labelOf()` prefers the runtime i18n bundle. */
  label: string;
  /** Whether a journey may write it (`file` is upload-only, never via a journey). */
  writable: boolean;
  maxLength?: number;
  /** lookup / multilookup: the ONLY valid write values. */
  options?: string[];
  /** record / multirecord: the target app (always) and its entity key (when inside this appgroup). */
  targetAppId?: string;
  targetEntity?: EntityKey;
  format?: 'currency';
  /** HTML autocomplete token derived from the field name (given-name, email, tel, …). */
  autoComplete?: string;
}

export interface EntityInfo {
  key: EntityKey;
  appId: string;
  label: string;
  /** PascalCase plural — `get<pascal>()` on the service. */
  pascal: string;
  /** The single-record suffix — `create<single>()` on the service. */
  single: string;
}

/** Input-form signals per entity: which data shape each field (pair) has.
 *  `range`  — two date fields that form a stay/period → AvailabilityRangePicker
 *  `choice` — a lookup with few options → ChoiceGroup pills instead of a select
 *  `record` — an applookup → EntitySelectStep with search, never a raw id field
 *  `stock`  — a quantity that has a stock/capacity counterpart → show it, warn on overshoot */
export type Shape =
  | { kind: 'range'; from: string; to: string }
  | { kind: 'choice'; field: string; count: number }
  | { kind: 'record'; field: string; targetEntity?: EntityKey }
  | { kind: 'stock'; field: string };

export const ENTITIES: Record<EntityKey, EntityInfo> = {
  "organisationen": {
    "key": "organisationen",
    "appId": "6ab7a17bdba25fd1e42dc67e",
    "label": "Organisationen",
    "pascal": "Organisationen",
    "single": "OrganisationenEntry"
  },
  "rollen": {
    "key": "rollen",
    "appId": "6ab7a17e07ae831366d01840",
    "label": "Rollen",
    "pascal": "Rollen",
    "single": "RollenEntry"
  },
  "ressourcen": {
    "key": "ressourcen",
    "appId": "6ab7a17f4cc96b69e05d2640",
    "label": "Ressourcen",
    "pascal": "Ressourcen",
    "single": "RessourcenEntry"
  },
  "aufgaben": {
    "key": "aufgaben",
    "appId": "6ab7a17fc5b563a01dbfe73f",
    "label": "Aufgaben",
    "pascal": "Aufgaben",
    "single": "AufgabenEntry"
  },
  "ressourcenzuweisungen": {
    "key": "ressourcenzuweisungen",
    "appId": "6ab7a180b919bfe047dc38e9",
    "label": "Ressourcenzuweisungen",
    "pascal": "Ressourcenzuweisungen",
    "single": "RessourcenzuweisungenEntry"
  }
};

export const FIELD_RULES: Record<EntityKey, Record<string, FieldRule>> = {
  "organisationen": {
    "notizen": {
      "key": "notizen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Notizen",
      "writable": true
    },
    "name": {
      "key": "name",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Name der Organisation",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "name"
    },
    "abteilungsleiter_vorname": {
      "key": "abteilungsleiter_vorname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Vorname Abteilungsleiter/in",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "abteilungsleiter_nachname": {
      "key": "abteilungsleiter_nachname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Nachname Abteilungsleiter/in",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    },
    "standort": {
      "key": "standort",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Standort",
      "writable": true,
      "maxLength": 4000
    },
    "kuerzel": {
      "key": "kuerzel",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Kürzel",
      "writable": true,
      "maxLength": 4000
    },
    "beschreibung": {
      "key": "beschreibung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Beschreibung",
      "writable": true
    }
  },
  "rollen": {
    "rollenname": {
      "key": "rollenname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Rollenbezeichnung",
      "writable": true,
      "maxLength": 4000
    },
    "rollenkuerzel": {
      "key": "rollenkuerzel",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Kürzel",
      "writable": true,
      "maxLength": 4000
    },
    "beschreibung": {
      "key": "beschreibung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Beschreibung",
      "writable": true
    },
    "kompetenzbereich": {
      "key": "kompetenzbereich",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Kompetenzbereich",
      "writable": true,
      "options": [
        "projektmanagement",
        "softwareentwicklung",
        "design_ux",
        "qualitaetssicherung",
        "analyse_beratung",
        "infrastruktur_betrieb",
        "sonstiges"
      ]
    },
    "notizen": {
      "key": "notizen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Notizen",
      "writable": true
    }
  },
  "ressourcen": {
    "vorname": {
      "key": "vorname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Vorname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "nachname": {
      "key": "nachname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Nachname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    },
    "email": {
      "key": "email",
      "fulltype": "string/email",
      "kind": "email",
      "required": false,
      "label": "E-Mail-Adresse",
      "writable": true,
      "autoComplete": "email"
    },
    "notizen": {
      "key": "notizen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Notizen",
      "writable": true
    },
    "telefon": {
      "key": "telefon",
      "fulltype": "string/tel",
      "kind": "tel",
      "required": false,
      "label": "Telefonnummer",
      "writable": true,
      "autoComplete": "tel"
    },
    "organisation": {
      "key": "organisation",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Organisation",
      "writable": true,
      "targetAppId": "6ab7a17bdba25fd1e42dc67e",
      "targetEntity": "organisationen"
    },
    "rolle": {
      "key": "rolle",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Rolle",
      "writable": true,
      "targetAppId": "6ab7a17e07ae831366d01840",
      "targetEntity": "rollen"
    },
    "kostensatz": {
      "key": "kostensatz",
      "fulltype": "number",
      "kind": "number",
      "required": false,
      "label": "Kostensatz (€/Stunde)",
      "writable": true,
      "format": "currency"
    },
    "verfuegbarkeit_prozent": {
      "key": "verfuegbarkeit_prozent",
      "fulltype": "number",
      "kind": "number",
      "required": false,
      "label": "Verfügbarkeit (%)",
      "writable": true
    },
    "eintrittsdatum": {
      "key": "eintrittsdatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Verfügbar ab",
      "writable": true
    },
    "austrittsdatum": {
      "key": "austrittsdatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Verfügbar bis",
      "writable": true
    }
  },
  "aufgaben": {
    "aufgabenname": {
      "key": "aufgabenname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Aufgabenbezeichnung",
      "writable": true,
      "maxLength": 4000
    },
    "aufgabentyp": {
      "key": "aufgabentyp",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": true,
      "label": "Aufgabentyp",
      "writable": true,
      "options": [
        "sammelaufgabe",
        "arbeitspaket",
        "meilenstein"
      ]
    },
    "fertigstellungsgrad": {
      "key": "fertigstellungsgrad",
      "fulltype": "number",
      "kind": "number",
      "required": false,
      "label": "Fertigstellungsgrad (%)",
      "writable": true
    },
    "notizen": {
      "key": "notizen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Notizen",
      "writable": true
    },
    "geplantes_ende": {
      "key": "geplantes_ende",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Geplantes Ende",
      "writable": true
    },
    "geplante_dauer_tage": {
      "key": "geplante_dauer_tage",
      "fulltype": "number",
      "kind": "number",
      "required": false,
      "label": "Geplante Dauer (Tage)",
      "writable": true
    },
    "tatsaechlicher_start": {
      "key": "tatsaechlicher_start",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Tatsächlicher Start",
      "writable": true
    },
    "tatsaechliches_ende": {
      "key": "tatsaechliches_ende",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Tatsächliches Ende",
      "writable": true
    },
    "geschaetzter_aufwand_stunden": {
      "key": "geschaetzter_aufwand_stunden",
      "fulltype": "number",
      "kind": "number",
      "required": false,
      "label": "Geschätzter Aufwand (Stunden)",
      "writable": true
    },
    "tatsaechlicher_aufwand_stunden": {
      "key": "tatsaechlicher_aufwand_stunden",
      "fulltype": "number",
      "kind": "number",
      "required": false,
      "label": "Tatsächlicher Aufwand (Stunden)",
      "writable": true
    },
    "prioritaet": {
      "key": "prioritaet",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": false,
      "label": "Priorität",
      "writable": true,
      "options": [
        "niedrig",
        "mittel",
        "hoch",
        "kritisch"
      ]
    },
    "beschreibung": {
      "key": "beschreibung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Beschreibung",
      "writable": true
    },
    "status": {
      "key": "status",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Status",
      "writable": true,
      "options": [
        "nicht_begonnen",
        "in_bearbeitung",
        "abgeschlossen",
        "zurueckgestellt",
        "abgebrochen"
      ]
    },
    "geplanter_start": {
      "key": "geplanter_start",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Geplanter Start",
      "writable": true
    },
    "uebergeordnete_aufgabe": {
      "key": "uebergeordnete_aufgabe",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Übergeordnete Aufgabe",
      "writable": true,
      "targetAppId": "6ab7a17fc5b563a01dbfe73f",
      "targetEntity": "aufgaben"
    },
    "vorgaenger": {
      "key": "vorgaenger",
      "fulltype": "multipleapplookup/select",
      "kind": "multirecord",
      "required": false,
      "label": "Vorgänger",
      "writable": true,
      "targetAppId": "6ab7a17fc5b563a01dbfe73f",
      "targetEntity": "aufgaben"
    }
  },
  "ressourcenzuweisungen": {
    "ressource": {
      "key": "ressource",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Ressource",
      "writable": true,
      "targetAppId": "6ab7a17f4cc96b69e05d2640",
      "targetEntity": "ressourcen"
    },
    "zuweisung_start": {
      "key": "zuweisung_start",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Zuweisung Start",
      "writable": true
    },
    "zuweisung_ende": {
      "key": "zuweisung_ende",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Zuweisung Ende",
      "writable": true
    },
    "geplanter_aufwand_stunden": {
      "key": "geplanter_aufwand_stunden",
      "fulltype": "number",
      "kind": "number",
      "required": false,
      "label": "Geplanter Aufwand (Stunden)",
      "writable": true
    },
    "tatsaechlicher_aufwand_stunden": {
      "key": "tatsaechlicher_aufwand_stunden",
      "fulltype": "number",
      "kind": "number",
      "required": false,
      "label": "Tatsächlicher Aufwand (Stunden)",
      "writable": true
    },
    "auslastung_prozent": {
      "key": "auslastung_prozent",
      "fulltype": "number",
      "kind": "number",
      "required": false,
      "label": "Auslastung (%)",
      "writable": true
    },
    "notizen": {
      "key": "notizen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Notizen",
      "writable": true
    },
    "aufgabe": {
      "key": "aufgabe",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Aufgabe",
      "writable": true,
      "targetAppId": "6ab7a17fc5b563a01dbfe73f",
      "targetEntity": "aufgaben"
    }
  }
};

export const SHAPES: Record<EntityKey, Shape[]> = {
  "organisationen": [],
  "rollen": [],
  "ressourcen": [
    {
      "kind": "record",
      "field": "organisation",
      "targetEntity": "organisationen"
    },
    {
      "kind": "record",
      "field": "rolle",
      "targetEntity": "rollen"
    },
    {
      "kind": "stock",
      "field": "verfuegbarkeit_prozent"
    }
  ],
  "aufgaben": [
    {
      "kind": "range",
      "from": "tatsaechlicher_start",
      "to": "geplantes_ende"
    },
    {
      "kind": "range",
      "from": "geplanter_start",
      "to": "tatsaechliches_ende"
    },
    {
      "kind": "choice",
      "field": "aufgabentyp",
      "count": 3
    },
    {
      "kind": "choice",
      "field": "prioritaet",
      "count": 4
    },
    {
      "kind": "choice",
      "field": "status",
      "count": 5
    },
    {
      "kind": "record",
      "field": "uebergeordnete_aufgabe",
      "targetEntity": "aufgaben"
    },
    {
      "kind": "record",
      "field": "vorgaenger",
      "targetEntity": "aufgaben"
    }
  ],
  "ressourcenzuweisungen": [
    {
      "kind": "range",
      "from": "zuweisung_start",
      "to": "zuweisung_ende"
    },
    {
      "kind": "record",
      "field": "ressource",
      "targetEntity": "ressourcen"
    },
    {
      "kind": "record",
      "field": "aufgabe",
      "targetEntity": "aufgaben"
    }
  ]
};

/** The fields a record of this entity is recognised by (a person: first and
 *  last name; else its title-like text field) — the same choice the dashboard's
 *  enrichment makes for `<key>Name`. `useRecordSearch` resolves an applookup to
 *  this name (`ctx.ref('gast')` in `toItem`). */
export const DISPLAY_FIELDS: Record<EntityKey, string[]> = {
  "organisationen": [
    "name"
  ],
  "rollen": [
    "rollenname"
  ],
  "ressourcen": [
    "vorname",
    "nachname"
  ],
  "aufgaben": [
    "aufgabenname"
  ],
  "ressourcenzuweisungen": [
    "notizen"
  ]
};

/** The display name of a record: its display fields joined, else the first
 *  non-empty text value, else ''. */
/** A display-field value as text: strings as they are, a lookup `{ key, label }`
 *  (either door hydrates lookups to objects) by its label — an entity whose
 *  only title-like field is a lookup/select otherwise had no name at all. */
function displayPart(v: unknown): string {
  if (typeof v === 'string') return v.trim();
  if (v && typeof v === 'object' && 'label' in v) {
    const l = (v as { label?: unknown }).label;
    return l === null || l === undefined ? '' : String(l).trim();
  }
  return '';
}

export function displayNameOf(entity: EntityKey, fields: Record<string, unknown>): string {
  const parts = (DISPLAY_FIELDS[entity] ?? [])
    .map(k => displayPart(fields[k]))
    .filter(v => v !== '');
  if (parts.length > 0) return parts.join(' ');
  for (const [k, rule] of Object.entries(FIELD_RULES[entity] ?? {})) {
    if (rule.kind !== 'text' && rule.kind !== 'email') continue;
    const v = fields[k];
    if (typeof v === 'string' && v.trim() !== '') return v.trim();
  }
  return '';
}

export function ruleOf(entity: EntityKey, key: string): FieldRule | undefined {
  return FIELD_RULES[entity]?.[key];
}

/** The field label as the user sees it — runtime bundle first, generated label second. */
export function labelOf(entity: EntityKey, key: string): string {
  const fromBundle = fieldLabel(entity, key);
  if (fromBundle !== key) return fromBundle;
  return ruleOf(entity, key)?.label ?? key;
}

export function entityLabel(entity: EntityKey): string {
  const fromBundle = appLabel(entity);
  if (fromBundle !== entity) return fromBundle;
  return ENTITIES[entity]?.label ?? entity;
}

/** Lookup options with runtime labels — the only legitimate source of `{key,label}` pairs. */
export function optionsOf(entity: EntityKey, key: string): Array<{ key: string; label: string }> {
  const generated = (LOOKUP_OPTIONS as Record<string, Record<string, Array<{ key: string; label: string }>>>)[entity]?.[key];
  if (generated && generated.length) return generated.map(o => ({ key: o.key, label: o.label }));
  const keys = ruleOf(entity, key)?.options ?? [];
  return keys.map(k => ({ key: k, label: lookupLabel(entity, key, k) ?? k }));
}

export function isEmptyValue(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object' && 'from' in (v as object) && 'to' in (v as object)) {
    const r = v as { from: unknown; to: unknown };
    return isEmptyValue(r.from) && isEmptyValue(r.to);
  }
  return false;
}
