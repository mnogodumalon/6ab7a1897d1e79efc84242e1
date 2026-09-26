// Auto-generated. Per-entity form-enhancements config for "Ressourcenzuweisungen".
// The sandbox sub-agent (Step 0) may overwrite this file with a richer config.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: [
    "ressource",
    "aufgabe",
    { row: ["zuweisung_start", "zuweisung_ende"], cols: "1fr 1fr" },
    "geplanter_aufwand_stunden",
    "tatsaechlicher_aufwand_stunden",
    "auslastung_prozent",
    "notizen",
  ],
  defaults: {
    zuweisung_start: { kind: "today" },
    zuweisung_ende: { kind: "todayOffset", days: 7 },
    auslastung_prozent: { kind: "literal", value: 100 },
  },
  computed: {
    '_zuweisung_dauer_tage': { kind: 'dateDiff', from: 'zuweisung_start', to: 'zuweisung_ende', unit: 'days' },
    '_geplante_kosten_gesamt': { op: 'mul', left: { kind: 'applookup', ownKey: 'ressource', lookupKey: 'kostensatz' }, right: { kind: 'field', key: 'geplanter_aufwand_stunden' } },
    '_tatsaechliche_kosten_gesamt': { op: 'mul', left: { kind: 'applookup', ownKey: 'ressource', lookupKey: 'kostensatz' }, right: { kind: 'field', key: 'tatsaechlicher_aufwand_stunden' } },
    '_aufwand_abweichung_stunden': { op: 'sub', left: { kind: 'field', key: 'tatsaechlicher_aufwand_stunden' }, right: { kind: 'field', key: 'geplanter_aufwand_stunden' } },
    '_kostenabweichung_gesamt': { op: 'sub', left: { kind: 'field', key: '_tatsaechliche_kosten_gesamt' }, right: { kind: 'field', key: '_geplante_kosten_gesamt' } },
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
