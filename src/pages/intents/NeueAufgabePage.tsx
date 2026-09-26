/**
 * Neue Aufgabe — 3-Schritt-Wizard.
 * Steps: 1) Aufgabentyp & Name → 2) Hierarchie & Abhängigkeiten (optional) → 3) Zeitplan & Status → Prüfen & anlegen.
 * Reads: aufgaben (für übergeordnete Aufgabe + Vorgänger). Writes: aufgaben (createAufgabenEntry).
 * Composes: IntentWizardShell, WizardStep, EntitySelectStep, ChoiceGroup, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { Field } from '@/components/blocks/Field';
import { ChoiceGroup } from '@/components/blocks/ChoiceGroup';
import {
  useStepForm,
  useJourneySubmit,
  useRecordSearch,
  fieldText,
  fieldLookup,
} from '@/lib/journey';
import { servicePort } from '@/services/journeyPort';
import { tx } from '@/i18n';

export default function NeueAufgabePage() {
  const [step, setStep] = useState(1);

  // Schritt 1: Aufgabentyp, Name, Priorität, Beschreibung
  // Schritt 2: Hierarchie — uebergeordnete_aufgabe + vorgaenger (beide optional)
  // Schritt 3: Zeitplan + Status
  const aufgabe = useStepForm('aufgaben', {
    steps: {
      aufgabentyp: 1,
      aufgabenname: 1,
      prioritaet: 1,
      beschreibung: 1,
      uebergeordnete_aufgabe: 2,
      vorgaenger: 2,
      status: 3,
      geplanter_start: 3,
      geplantes_ende: 3,
      geplante_dauer_tage: 3,
      geschaetzter_aufwand_stunden: 3,
    },
    initial: { status: 'nicht_begonnen' },
    // vorgaenger ist multirecord — required auf false setzen, da optional laut Brief
    required: { uebergeordnete_aufgabe: false, vorgaenger: false },
  });

  // Suche: Sammelaufgaben als übergeordnete Aufgabe (nur aufgabentyp == 'sammelaufgabe')
  const elternAufgaben = useRecordSearch(servicePort, 'aufgaben', {
    filter: "r.v_aufgabentyp == 'sammelaufgabe'", /* i18n-exempt */
    where: r => fieldLookup(r, 'aufgabentyp')?.key === 'sammelaufgabe',
    searchFields: ['aufgabenname'],
    toItem: a => ({
      id: a.id,
      title: fieldText(a, 'aufgabenname'),
      status: fieldLookup(a, 'status') ?? undefined,
    }),
  });

  // Suche: alle Aufgaben als Vorgänger
  const alleAufgaben = useRecordSearch(servicePort, 'aufgaben', {
    searchFields: ['aufgabenname'],
    toItem: a => ({
      id: a.id,
      title: fieldText(a, 'aufgabenname'),
      subtitle: fieldLookup(a, 'aufgabentyp')?.label,
      status: fieldLookup(a, 'status') ?? undefined,
    }),
  });

  const submit = useJourneySubmit(
    servicePort,
    [{ key: 'aufgabe', entity: 'aufgaben', form: aufgabe, primary: true }],
    { draftKey: 'neue-aufgabe' },
  );

  return (
    <IntentWizardShell
      title={tx('Neue Aufgabe anlegen')}
      currentStep={step}
      onStepChange={setStep}
      forms={[aufgabe]}
      draftKey="neue-aufgabe"
      intro={{
        description: tx('Eine neue Aufgabe in drei Schritten anlegen und in die Projekthierarchie einordnen.'),
        needs: [tx('Aufgabenbezeichnung'), tx('Aufgabentyp')],
      }}
    >
      {/* Schritt 1: Aufgabentyp und Name */}
      <WizardStep
        label={tx('Typ & Name')}
        description={tx('Vergib einen eindeutigen Namen und wähle den Aufgabentyp.')}
      >
        <div className="space-y-5">
          <Field form={aufgabe} name="aufgabentyp">
            <ChoiceGroup {...aufgabe.choice('aufgabentyp')} />
          </Field>
          <Bound form={aufgabe} name="aufgabenname" />
          <Field form={aufgabe} name="prioritaet">
            <ChoiceGroup {...aufgabe.choice('prioritaet')} allowClear />
          </Field>
          <Bound form={aufgabe} name="beschreibung" rows={3} />
          <StepNav
            hideBack
            onNext={() => aufgabe.validate(['aufgabentyp', 'aufgabenname'])}
            nextStepLabel={tx('Hierarchie')}
          />
        </div>
      </WizardStep>

      {/* Schritt 2: Hierarchie und Abhängigkeiten (optional) */}
      <WizardStep
        label={tx('Hierarchie')}
        description={tx('Optional: Ordne die Aufgabe in die Hierarchie ein und lege Vorgänger fest.')}
      >
        <div className="space-y-6">
          {/* Übergeordnete Aufgabe — Einzelauswahl, nur Sammelaufgaben */}
          <Field
            form={aufgabe}
            name="uebergeordnete_aufgabe"
            hint={tx('Nur Sammelaufgaben können übergeordnet sein.')}
          >
            <EntitySelectStep
              {...elternAufgaben.select}
              selectedId={aufgabe.get('uebergeordnete_aufgabe') as string | null}
              onSelect={id => {
                aufgabe.set('uebergeordnete_aufgabe', id, elternAufgaben.labelOf(id));
              }}
              emptyText={tx('Keine Sammelaufgaben vorhanden — zuerst eine Sammelaufgabe anlegen.')}
              avatar="none"
              create={{ fields: ['aufgabenname', 'aufgabentyp'], initial: { aufgabentyp: 'sammelaufgabe' }, title: tx('Neue Sammelaufgabe') }}
            />
          </Field>

          {/* Vorgänger — Mehrfachauswahl */}
          <Field form={aufgabe} name="vorgaenger" hint={tx('Mehrere Vorgänger möglich.')}>
            <EntitySelectStep
              {...alleAufgaben.select}
              {...aufgabe.records('vorgaenger', alleAufgaben.labelOf)}
              avatar="none"
              create={false}
            />
          </Field>

          <StepNav
            onBack={() => setStep(1)}
            onNext={() => true}
            nextStepLabel={tx('Zeitplan')}
          />
        </div>
      </WizardStep>

      {/* Schritt 3: Zeitplan und Status */}
      <WizardStep
        label={tx('Zeitplan')}
        description={tx('Status, Zeitraum und Aufwand für die Aufgabe festlegen.')}
      >
        <div className="space-y-5">
          <Field form={aufgabe} name="status">
            <ChoiceGroup {...aufgabe.choice('status')} />
          </Field>
          <Bound form={aufgabe} name="geplanter_start" />
          <Bound form={aufgabe} name="geplantes_ende" />
          <Bound form={aufgabe} name="geplante_dauer_tage" />
          <Bound form={aufgabe} name="geschaetzter_aufwand_stunden" />
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => aufgabe.validate(['status'])}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      {/* Schritt 4: Prüfen & Anlegen */}
      <WizardStep label={tx('Prüfen')}>
        {!submit.done && (
          <SummaryStep
            forms={[aufgabe]}
            submit={submit}
            whatHappensNext={tx('Die Aufgabe wird sofort in der Projektübersicht angelegt und kann direkt mit Ressourcen belegt werden.')}
          />
        )}
      </WizardStep>

      {/* Erfolgsmeldung */}
      {submit.result && (
        <SuccessStep
          result={submit.result}
          forms={[aufgabe]}
          submit={submit}
          restartLabel={tx('Weitere Aufgabe anlegen')}
          next={[
            {
              label: tx('Ressource zuweisen'),
              href: '#/intents/ressource-zuweisen',
            },
            {
              label: tx('Aufgabe abschließen'),
              href: '#/intents/aufgabe-abschliessen',
            },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
          whatHappensNext={tx('Mit „Ressource zuweisen" kannst du der Aufgabe direkt Teammitglieder zuordnen.')}
        />
      )}
    </IntentWizardShell>
  );
}
