import { PublicShell } from '@/components/PublicShell';
import { tx } from '@/i18n';
import {
  IconBuilding,
  IconShield,
  IconUsers,
  IconChecklist,
  IconArrowsShuffle,
  IconPlus,
  IconCircleCheck,
  IconUserPlus,
} from '@tabler/icons-react';

// Module cards — no data needed, all static
export default function Overview() {
  const FLOWS = [
  {
    icon: <IconPlus size={28} stroke={1.5} />,
    name: tx('Neue Aufgabe'),
    description: tx('Aufgabe in mehreren Schritten anlegen'),
    href: '#/intents/neue-aufgabe',
  },
  {
    icon: <IconCircleCheck size={28} stroke={1.5} />,
    name: tx('Aufgabe abschliessen'),
    description: tx('Ist-Werte erfassen und Aufgabe als erledigt markieren'),
    href: '#/intents/aufgabe-abschliessen',
  },
  {
    icon: <IconUserPlus size={28} stroke={1.5} />,
    name: tx('Ressource zuweisen'),
    description: tx('Ressource einer Aufgabe zuweisen und Zeitraum festlegen'),
    href: '#/intents/ressource-zuweisen',
  },
];

  const MODULES = [
  {
    icon: <IconBuilding size={28} stroke={1.5} />,
    name: tx('Organisationen'),
    description: tx('Abteilungen und Organisationseinheiten'),
    href: '#/organisationen',
  },
  {
    icon: <IconShield size={28} stroke={1.5} />,
    name: tx('Rollen'),
    description: tx('Projektfunktionen und Kompetenzbereiche'),
    href: '#/rollen',
  },
  {
    icon: <IconUsers size={28} stroke={1.5} />,
    name: tx('Ressourcen'),
    description: tx('Teammitglieder mit Verfügbarkeit und Kostensatz'),
    href: '#/ressourcen',
  },
  {
    icon: <IconChecklist size={28} stroke={1.5} />,
    name: tx('Aufgaben'),
    description: tx('Arbeitspakete, Meilensteine und Sammelaufgaben'),
    href: '#/aufgaben',
  },
  {
    icon: <IconArrowsShuffle size={28} stroke={1.5} />,
    name: tx('Ressourcenzuweisungen'),
    description: tx('Zuweisungen von Ressourcen zu Aufgaben'),
    href: '#/ressourcenzuweisungen',
  },
];

  return (
    <PublicShell fullBleed>
      {/* Hero */}
      <div className="bg-primary text-primary-foreground py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {tx('Ressourcen- & Aufgabenverwaltung')}
          </h1>
          <p className="mt-4 text-lg opacity-90 max-w-2xl">
            {tx('Plane und verwalte Aufgaben, Ressourcen und Organisationseinheiten an einem Ort.')}
          </p>
        </div>
      </div>

      {/* Module overview */}
      <div className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold mb-6 text-foreground">
            {tx('Module')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MODULES.map((mod) => (
              <a
                key={mod.href}
                href={mod.href}
                className="group block rounded-lg border border-border bg-card p-5 shadow-sm hover:border-primary/50 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className="text-muted-foreground group-hover:text-primary transition-colors mt-0.5">
                    {mod.icon}
                  </span>
                  <div>
                    <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {mod.name}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground leading-snug">
                      {mod.description}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Flows */}
      <div className="py-12 px-4 bg-muted/40">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold mb-6 text-foreground">
            {tx('Abläufe')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FLOWS.map((flow) => (
              <a
                key={flow.href}
                href={flow.href}
                className="group block rounded-lg border border-primary/30 bg-primary/5 p-5 shadow-sm hover:bg-primary/10 hover:border-primary/60 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className="text-primary group-hover:text-primary transition-colors mt-0.5">
                    {flow.icon}
                  </span>
                  <div>
                    <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {flow.name}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground leading-snug">
                      {flow.description}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto text-center text-sm text-muted-foreground">
          {tx('Internes Tool zur Ressourcen- und Aufgabenverwaltung. Nur für autorisierte Teammitglieder.')}
        </div>
      </div>
    </PublicShell>
  );
}
