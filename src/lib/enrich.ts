import type { EnrichedAufgaben, EnrichedRessourcen, EnrichedRessourcenzuweisungen } from '@/types/enriched';
import type { Aufgaben, Organisationen, Ressourcen, Ressourcenzuweisungen, Rollen } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveDisplay(url: unknown, map: Map<string, any>, ...fields: string[]): string {
  if (!url) return '';
  const id = extractRecordId(url);
  if (!id) return '';
  const r = map.get(id);
  if (!r) return '';
  return fields.map(f => String(r.fields[f] ?? '')).join(' ').trim();
}

interface RessourcenMaps {
  organisationenMap: Map<string, Organisationen>;
  rollenMap: Map<string, Rollen>;
}

export function enrichRessourcen(
  ressourcen: Ressourcen[],
  maps: RessourcenMaps
): EnrichedRessourcen[] {
  return ressourcen.map(r => ({
    ...r,
    organisationName: resolveDisplay(r.fields.organisation, maps.organisationenMap, 'name'),
    rolleName: resolveDisplay(r.fields.rolle, maps.rollenMap, 'rollenname'),
  }));
}

interface AufgabenMaps {
  aufgabenMap: Map<string, Aufgaben>;
}

export function enrichAufgaben(
  aufgaben: Aufgaben[],
  maps: AufgabenMaps
): EnrichedAufgaben[] {
  return aufgaben.map(r => ({
    ...r,
    uebergeordnete_aufgabeName: resolveDisplay(r.fields.uebergeordnete_aufgabe, maps.aufgabenMap, 'aufgabenname'),
    vorgaengerName: resolveDisplay(r.fields.vorgaenger, maps.aufgabenMap, 'aufgabenname'),
  }));
}

interface RessourcenzuweisungenMaps {
  ressourcenMap: Map<string, Ressourcen>;
  aufgabenMap: Map<string, Aufgaben>;
}

export function enrichRessourcenzuweisungen(
  ressourcenzuweisungen: Ressourcenzuweisungen[],
  maps: RessourcenzuweisungenMaps
): EnrichedRessourcenzuweisungen[] {
  return ressourcenzuweisungen.map(r => ({
    ...r,
    ressourceName: resolveDisplay(r.fields.ressource, maps.ressourcenMap, 'vorname', 'nachname'),
    aufgabeName: resolveDisplay(r.fields.aufgabe, maps.aufgabenMap, 'aufgabenname'),
  }));
}
