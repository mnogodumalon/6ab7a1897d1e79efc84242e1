// Auto-generated. Per-entity form-enhancements config for "Aufgaben".
// The sandbox sub-agent (Step 0) may overwrite this file with a richer config.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: [
    "aufgabenname",
    "aufgabentyp",
    "status",
    "prioritaet",
    "fertigstellungsgrad",
    { row: ["geplanter_start", "geplantes_ende"], cols: "1fr 1fr" },
    "geplante_dauer_tage",
    { row: ["tatsaechlicher_start", "tatsaechliches_ende"], cols: "1fr 1fr" },
    "geschaetzter_aufwand_stunden",
    "tatsaechlicher_aufwand_stunden",
    "beschreibung",
    "uebergeordnete_aufgabe",
    "vorgaenger",
    "notizen",
  ],
  defaults: {
    status: { kind: "lookup", key: "nicht_begonnen", label: "Nicht begonnen" },
    prioritaet: { kind: "lookup", key: "mittel", label: "Mittel" },
    geplanter_start: { kind: "today" },
    geplantes_ende: { kind: "todayOffset", days: 7 },
  },
  computed: {
    'geplante_dauer_tage': { kind: 'dateDiff', from: 'geplanter_start', to: 'geplantes_ende', unit: 'days' },
    '_aufgaben_dauer_tatsaechlich_tage': { kind: 'dateDiff', from: 'tatsaechlicher_start', to: 'tatsaechliches_ende', unit: 'days' },
    '_aufwand_abweichung_stunden': { op: 'sub', left: { kind: 'field', key: 'tatsaechlicher_aufwand_stunden' }, right: { kind: 'field', key: 'geschaetzter_aufwand_stunden' } },
  },
};

// Build-time-populated field dependencies for MODUS-2 arrow functions in
// `computed`. The sub-agent leaves this empty; scripts/parse-formulas.mjs
// fills it after Step 0 by regex-extracting ctx.* calls from each function
// body. The dialog feeds these into classifyComputed so MODUS-2 entries get
// inline anchors instead of always landing in the aggregate section.
export const computedDeps: Record<string, string[]> = {};

// Build-time-populated applookup (ownKey → lookupKey) pairs found in MODUS-2
// arrow functions. Filled by scripts/parse-formulas.mjs from regex matches
// on `ctx.applookup('x','y')` and `ctx.applookupAny('x','y')`. The dialog
// merges this with MODUS-1 refs extracted at render time, so every numeric
// field the formula pulls from a selected lookup is surfaced as an inline
// hint next to the lookup combobox.
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
