/**
 * Aufgabe abschliessen — 2-Schritt-Wizard.
 * Steps: 1) Aufgabe wählen (offen/laufend) → 2) Ist-Werte & Status setzen → 3) Prüfen & aktualisieren.
 * Reads: aufgaben (filter: nicht_begonnen | in_bearbeitung). Writes: aufgaben (updateAufgabenEntry — updates).
 * Composes: IntentWizardShell, WizardStep, EntitySelectStep, Bound, Field, ChoiceGroup, StepNav, SummaryStep, SuccessStep.
 */
import { useState, useEffect } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { Field } from '@/components/blocks/Field';
import { ChoiceGroup } from '@/components/blocks/ChoiceGroup';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import {
  useRecordSearch,
  useStepForm,
  useJourneySubmit,
  fieldLookup,
  fieldDate,
  fieldNumber,
} from '@/lib/journey';
import { servicePort } from '@/services/journeyPort';
import { formatDate } from '@/lib/formatters';
import { tx } from '@/i18n';

export default function AufgabeAbschliessenPage() {
  const [step, setStep] = useState(1);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const aufgaben = useRecordSearch(servicePort, 'aufgaben', {
    filter: "r.v_status in ['nicht_begonnen', 'in_bearbeitung']",
    where: r => {
      const s = fieldLookup(r, 'status')?.key;
      return s === 'nicht_begonnen' || s === 'in_bearbeitung';
    },
    searchFields: ['aufgabenname'],
    toItem: a => ({
      id: a.id,
      title: String(a.fields.aufgabenname ?? ''),
      subtitle: [
        fieldLookup(a, 'prioritaet')?.label,
        fieldLookup(a, 'status')?.label,
      ].filter(Boolean).join(' · '),
      status: fieldLookup(a, 'status') ?? undefined,
    }),
  });

  const f = useStepForm('aufgaben', {
    fields: ['tatsaechlicher_start', 'tatsaechliches_ende', 'tatsaechlicher_aufwand_stunden', 'fertigstellungsgrad', 'status'],
    steps: {
      tatsaechlicher_start: 2,
      tatsaechliches_ende: 2,
      tatsaechlicher_aufwand_stunden: 2,
      fertigstellungsgrad: 2,
      status: 2,
    },
    required: { tatsaechlicher_aufwand_stunden: false },
    initial: { status: 'abgeschlossen', fertigstellungsgrad: 100 },
  });

  const selectedRecord = selectedId ? aufgaben.recordOf(selectedId) : undefined;

  const statusValue = f.get('status') as string | null;

  // Wenn status = abgeschlossen → fertigstellungsgrad auf 100 setzen (sofern noch nicht vom Nutzer geändert)
  useEffect(() => {
    if (statusValue === 'abgeschlossen') {
      const current = f.get('fertigstellungsgrad');
      if (current === null || current === undefined || current === '') {
        f.set('fertigstellungsgrad', 100);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusValue]);

  const submit = useJourneySubmit(servicePort, [
    {
      key: 'aufgabe',
      entity: 'aufgaben',
      form: f,
      updates: () => selectedId ?? '',
      primary: true,
      verb: 'update',
    },
  ], { draftKey: 'aufgabe-abschliessen' });

  return (
    <IntentWizardShell
      title={tx('Aufgabe abschliessen')}
      subtitle={tx('Ist-Werte erfassen und Status setzen')}
      currentStep={step}
      onStepChange={setStep}
      forms={[f]}
      draftKey="aufgabe-abschliessen"
      intro={{
        description: tx('Erfasse die tatsächlichen Werte einer laufenden oder noch nicht begonnenen Aufgabe und markiere sie als abgeschlossen.'),
        needs: [tx('Die Aufgabe, die du abschliessen möchtest'), tx('Tatsächliche Start- und Endtermine')],
      }}
    >
      <WizardStep
        label={tx('Aufgabe')}
        description={tx('Wähle eine offene oder laufende Aufgabe aus.')}
      >
        <EntitySelectStep
          {...aufgaben.select}
          selectedId={selectedId ?? null}
          onSelect={id => {
            setSelectedId(id);
            setStep(2);
          }}
          searchPlaceholder={tx('Aufgabe suchen …')}
          emptyText={tx('Keine offenen oder laufenden Aufgaben gefunden.')}
          avatar="none"
        />
      </WizardStep>

      <WizardStep
        label={tx('Ist-Werte')}
        description={tx('Trage die tatsächlichen Werte ein und setze den neuen Status.')}
      >
        {selectedId ? (
          <div className="space-y-6">
            {/* Read-only Planwerte als Referenz */}
            {selectedRecord && (
              <div className="rounded-lg border bg-secondary/40 px-4 py-3 space-y-1 text-sm">
                <p className="font-medium text-foreground">{tx('Planwerte der Aufgabe')}</p>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-muted-foreground">
                  <span>
                    {tx('Geplanter Start')}{': '}
                    <span className="text-foreground">
                      {fieldDate(selectedRecord, 'geplanter_start')
                        ? formatDate(fieldDate(selectedRecord, 'geplanter_start')!)
                        : '—'}
                    </span>
                  </span>
                  <span>
                    {tx('Geplantes Ende')}{': '}
                    <span className="text-foreground">
                      {fieldDate(selectedRecord, 'geplantes_ende')
                        ? formatDate(fieldDate(selectedRecord, 'geplantes_ende')!)
                        : '—'}
                    </span>
                  </span>
                  {fieldNumber(selectedRecord, 'geschaetzter_aufwand_stunden') !== null && (
                    <span>
                      {tx('Gesch. Aufwand')}{': '}
                      <span className="text-foreground">
                        {fieldNumber(selectedRecord, 'geschaetzter_aufwand_stunden')} {tx('h')}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Bound form={f} name="tatsaechlicher_start" />
              <Bound form={f} name="tatsaechliches_ende" />
              <Bound form={f} name="tatsaechlicher_aufwand_stunden" />
              <Bound form={f} name="fertigstellungsgrad" hint={tx('0–100 %')} />

              <Field form={f} name="status" label={tx('Status')}>
                <ChoiceGroup {...f.choice('status')} />
              </Field>
            </div>

            <StepNav
              onNext={() => f.validate(['tatsaechlicher_start', 'tatsaechliches_ende', 'fertigstellungsgrad', 'status'])}
              nextStepLabel={tx('Prüfen')}
              onBack={() => setStep(1)}
            />
          </div>
        ) : (
          <StepNav
            onBack={() => setStep(1)}
            nextDisabled
          >
            <p className="text-sm text-muted-foreground">
              {tx('Dieser Schritt braucht eine ausgewählte Aufgabe aus Schritt 1.')}
            </p>
          </StepNav>
        )}
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!submit.done && selectedId ? (
          <SummaryStep
            forms={[f]}
            submit={submit}
            whatHappensNext={tx('Die Aufgabe wird sofort mit den neuen Ist-Werten und dem gesetzten Status aktualisiert.')}
            items={[
              {
                key: '_aufgabe_name',
                label: tx('Aufgabe'),
                value: aufgaben.labelOf(selectedId) ?? selectedId,
              },
            ]}
          />
        ) : !selectedId ? (
          <StepNav onBack={() => setStep(1)} nextDisabled>
            <p className="text-sm text-muted-foreground">
              {tx('Dieser Schritt braucht eine ausgewählte Aufgabe aus Schritt 1.')}
            </p>
          </StepNav>
        ) : null}
      </WizardStep>

      {submit.result && (
        <SuccessStep
          result={submit.result}
          forms={[f]}
          verb="updated"
          whatHappensNext={tx('Die aktualisierten Werte sind sofort in der Aufgabenübersicht sichtbar.')}
          next={[
            {
              label: tx('Weitere Aufgabe abschliessen'),
              onClick: () => {
                submit.reset();
                f.reset();
                setStep(1);
              },
            },
            {
              label: tx('Neue Aufgabe anlegen'),
              href: '#/intents/neue-aufgabe',
            },
            {
              label: tx('Ressource zuweisen'),
              href: '#/intents/ressource-zuweisen',
            },
            {
              label: tx('Zum Dashboard'),
              href: '#/',
            },
          ]}
          actions={{ copy: false, print: false }}
        />
      )}
    </IntentWizardShell>
  );
}
