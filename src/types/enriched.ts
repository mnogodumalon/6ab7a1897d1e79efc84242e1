import type { Aufgaben, Ressourcen, Ressourcenzuweisungen } from './app';

export type EnrichedRessourcen = Ressourcen & {
  organisationName: string;
  rolleName: string;
};

export type EnrichedAufgaben = Aufgaben & {
  uebergeordnete_aufgabeName: string;
  vorgaengerName: string;
};

export type EnrichedRessourcenzuweisungen = Ressourcenzuweisungen & {
  ressourceName: string;
  aufgabeName: string;
};
