/**
 * Ressource zuweisen — 3-Schritt-Wizard.
 * Steps: 1) Aufgabe auswählen → 2) Ressource auswählen (mit Verfügbarkeitsprüfung) → 3) Zeitraum & Aufwand festlegen → 4) Prüfen & anlegen.
 * Reads: aufgaben, ressourcen, ressourcenzuweisungen (Belegung). Writes: ressourcenzuweisungen (createRessourcenzuweisungenEntry).
 * Composes: IntentWizardShell, WizardStep, EntitySelectStep, AvailabilityRangePicker, BudgetTracker, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { Bound } from '@/components/blocks/Bound';
import { BudgetTracker } from '@/components/blocks/BudgetTracker';
import { AvailabilityRangePicker } from '@/components/blocks/AvailabilityRangePicker';
import { Field } from '@/components/blocks/Field';
import {
  useStepForm,
  useJourneySubmit,
  useRecordSearch,
  useOccupancy,
  fieldText,
  fieldLookup,
  fieldNumber,
} from '@/lib/journey';
import { servicePort } from '@/services/journeyPort';
import { tx } from '@/i18n';

export default function RessourceZuweisenPage() {
  const [step, setStep] = useState(1);

  // Step 1: Aufgaben — nur aktive (nicht_begonnen, in_bearbeitung)
  const aufgaben = useRecordSearch(servicePort, 'aufgaben', {
    filter: "r.v_status in ['nicht_begonnen', 'in_bearbeitung']",
    where: r => {
      const key = fieldLookup(r, 'status')?.key;
      return key === 'nicht_begonnen' || key === 'in_bearbeitung';
    },
    searchFields: ['aufgabenname'],
    toItem: a => ({
      id: a.id,
      title: fieldText(a, 'aufgabenname'),
      subtitle: [
        fieldLookup(a, 'aufgabentyp')?.label,
        fieldLookup(a, 'status')?.label,
      ].filter(Boolean).join(' · '),
      status: fieldLookup(a, 'status') ?? undefined,
    }),
  });

  // Step 2: Ressourcen — alle qualifiziert
  const ressourcen = useRecordSearch(servicePort, 'ressourcen', {
    searchFields: ['vorname', 'nachname', 'email'],
    toItem: (r, ctx) => ({
      id: r.id,
      title: [fieldText(r, 'vorname'), fieldText(r, 'nachname')].filter(Boolean).join(' '),
      subtitle: [ctx.ref('organisation'), ctx.ref('rolle')].filter(Boolean).join(' · '),
    }),
  });

  // Formulare
  const zuweisung = useStepForm('ressourcenzuweisungen', {
    steps: {
      aufgabe: 1,
      ressource: 2,
      zuweisung_start: 3,
      zuweisung_ende: 3,
      geplanter_aufwand_stunden: 3,
      auslastung_prozent: 3,
      notizen: 3,
    },
    required: {
      geplanter_aufwand_stunden: true,
    },
    messages: {
      aufgabe: tx('Bitte eine Aufgabe auswählen, der die Ressource zugewiesen werden soll.'),
      ressource: tx('Bitte eine Ressource auswählen.'),
      geplanter_aufwand_stunden: tx('Bitte den geplanten Aufwand in Stunden angeben.'),
    },
  });

  // Belegung für die gewählte Ressource
  const gewaehlteRessourceId = zuweisung.get('ressource') as string | undefined;
  const belegung = useOccupancy(servicePort, 'ressourcenzuweisungen', {
    resource: gewaehlteRessourceId ?? null,
  });

  // Verfügbarkeit der gewählten Ressource
  const gewaehlteRessource = gewaehlteRessourceId
    ? ressourcen.recordOf(gewaehlteRessourceId)
    : undefined;
  const verfuegbarkeitProzent = gewaehlteRessource
    ? (fieldNumber(gewaehlteRessource, 'verfuegbarkeit_prozent') ?? 0)
    : 0;

  // Plan
  const submit = useJourneySubmit(
    servicePort,
    [
      {
        key: 'zuweisung',
        entity: 'ressourcenzuweisungen',
        form: zuweisung,
        primary: true,
      },
    ],
    { draftKey: 'ressource-zuweisen' }
  );

  return (
    <IntentWizardShell
      title={tx('Ressource zuweisen')}
      currentStep={step}
      onStepChange={setStep}
      forms={[zuweisung]}
      draftKey="ressource-zuweisen"
      intro={{
        description: tx('Eine Ressource in drei Schritten einer Aufgabe zuweisen.'),
        needs: [tx('Aufgabe auswählen'), tx('Ressource auswählen'), tx('Zeitraum und Aufwand angeben')],
      }}
    >
      {/* Schritt 1: Aufgabe wählen */}
      <WizardStep
        label={tx('Aufgabe')}
        description={tx('Wähle eine aktive Aufgabe, der eine Ressource zugewiesen werden soll.')}
      >
        <EntitySelectStep
          {...aufgaben.select}
          selectedId={zuweisung.get('aufgabe') as string | undefined}
          onSelect={id => {
            zuweisung.set('aufgabe', id, aufgaben.labelOf(id));
            setStep(2);
          }}
          emptyText={tx('Keine aktiven Aufgaben gefunden. Nur Aufgaben mit Status „Nicht begonnen" oder „In Bearbeitung" können Ressourcen erhalten.')}
          searchPlaceholder={tx('Aufgabe suchen…')}
          avatar="none"
        />
      </WizardStep>

      {/* Schritt 2: Ressource wählen */}
      <WizardStep
        label={tx('Ressource')}
        description={tx('Wähle eine Ressource aus. Rolle und Verfügbarkeit werden im nächsten Schritt sichtbar.')}
        needs={['aufgabe']}
      >
        <EntitySelectStep
          {...ressourcen.select}
          selectedId={zuweisung.get('ressource') as string | undefined}
          onSelect={id => {
            zuweisung.set('ressource', id, ressourcen.labelOf(id));
            setStep(3);
          }}
          searchPlaceholder={tx('Name oder E-Mail suchen…')}
          avatar="initials"
          columns={2}
        />
      </WizardStep>

      {/* Schritt 3: Zeitraum und Aufwand */}
      <WizardStep
        label={tx('Zeitraum & Aufwand')}
        description={tx('Lege den Einsatzzeitraum und den geplanten Aufwand fest.')}
        needs={['ressource']}
      >
        <div className="space-y-6">
          {/* Verfügbarkeit der Ressource als Kontext */}
          {gewaehlteRessource && (
            <BudgetTracker
              format="count"
              unit={tx('%')}
              budget={100}
              booked={100 - verfuegbarkeitProzent}
              label={tx('Verfügbarkeit der Ressource')}
              texts={{
                booked: tx('Belegt'),
                remaining: tx('Verfügbar'),
                over: tx('Überbucht'),
                none: tx('Keine Verfügbarkeit angegeben'),
              }}
            />
          )}

          {/* Zeitraum — AvailabilityRangePicker mit Belegung */}
          <Field
            form={zuweisung}
            name="zuweisung_start"
            label={tx('Einsatzzeitraum')}
            hint={tx('Belegte Zeiträume dieser Ressource sind ausgegraut.')}
          >
            <AvailabilityRangePicker
              {...zuweisung.range('zuweisung_start', 'zuweisung_ende', {
                blocked: belegung.blocked,
                unit: 'days',
              })}
              unit="days"
              legend={tx('Bereits belegt')}
              months={2}
            />
          </Field>

          {/* Geplanter Aufwand */}
          <Bound
            form={zuweisung}
            name="geplanter_aufwand_stunden"
            hint={tx('Geschätzter Arbeitsaufwand in Stunden')}
          />

          {/* Auslastung */}
          <Bound
            form={zuweisung}
            name="auslastung_prozent"
            hint={tx('Prozentualer Anteil der Kapazität dieser Ressource')}
          />

          {/* Notizen */}
          <Bound form={zuweisung} name="notizen" rows={3} />

          <StepNav
            onNext={() =>
              zuweisung.validate([
                'zuweisung_start',
                'zuweisung_ende',
                'geplanter_aufwand_stunden',
              ])
            }
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      {/* Schritt 4: Prüfen & Anlegen */}
      <WizardStep label={tx('Prüfen')}>
        {!submit.done && (
          <SummaryStep
            forms={[zuweisung]}
            submit={submit}
            whatHappensNext={tx(
              'Die Ressourcenzuweisung wird sofort angelegt und ist in der Übersicht sichtbar.'
            )}
            confirmLabel={tx('Zuweisung anlegen')}
          />
        )}
      </WizardStep>

      {/* Erfolgsschritt */}
      {submit.result && (
        <SuccessStep
          result={submit.result}
          forms={[zuweisung]}
          submit={submit}
          restartLabel={tx('Weitere Zuweisung')}
          next={[
            {
              label: tx('Neue Aufgabe anlegen'),
              href: '#/intents/neue-aufgabe',
            },
            {
              label: tx('Aufgabe abschließen'),
              href: '#/intents/aufgabe-abschliessen',
            },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
          whatHappensNext={tx(
            'Die Ressource ist jetzt dieser Aufgabe zugewiesen. Zum Abschluss der Aufgabe den Ablauf „Aufgabe abschließen" nutzen.'
          )}
        />
      )}
    </IntentWizardShell>
  );
}
