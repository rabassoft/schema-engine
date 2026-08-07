// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import {
  applyFormOperation,
  commitScopeToBaseline,
  compileFormDefinition,
  deriveSchemaDefaultCandidate,
  type Diagnostic,
  type FormDefinition,
  type FormOperation,
  type ValidationVisibility,
  type WizardIntention,
} from '@rabassoft/schema-engine';
import {
  createReactNativeRendererRegistry,
  SchemaForm,
  useSchemaForm,
  type ReactFormHandle,
} from '@rabassoft/schema-engine-react';
import { createAjvSchemaValidator } from '@rabassoft/schema-engine-validator-ajv';
import {
  fixedValueControlStates,
  referenceScenarios,
  stringEnumArrayControlStates,
  type ReferenceScenario,
  type ReferenceScopeConfirmationTarget,
} from '@schema-engine-internal/reference-scenarios';
import {
  StrictMode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  configurationsEqual,
  emptyDraftResult,
  evaluateDraft,
  prepareConfiguration,
  type AppliedConfiguration,
  type ConfigurationDraftResult,
} from './configuration.js';
import { referenceSnippets } from './generated/reference-snippets.js';
import { JsonEditor } from './json-editor.js';
import {
  ReactReferenceAsyncValidator,
  type ReactServiceRequestEvidence,
} from './reference-async-validator.js';
import { copyText, HighlightedCode, serializeEvidence } from './syntax.js';

type DecisionMode = 'confirm' | 'reject' | 'pending';
type ThemeMode = 'auto' | 'light' | 'dark';
type EvidenceTab = 'state' | 'operations' | 'diagnostics' | 'service';

interface HistoryEntry {
  readonly sequence: number;
  readonly operation: FormOperation;
  readonly decision: 'confirmed' | 'rejected' | 'pending' | 'failed';
  readonly diagnostics: readonly Diagnostic[];
}

interface Session {
  readonly scenario: ReferenceScenario;
  readonly original: AppliedConfiguration;
  readonly active: AppliedConfiguration;
  readonly definition: FormDefinition;
  readonly compilationDiagnostics: readonly Diagnostic[];
  readonly value: Readonly<object>;
  readonly baselineValue: Readonly<object>;
  readonly locale: string;
  readonly validationVisibility: ValidationVisibility;
  readonly revision: number;
}

type ScopeCandidate =
  | {
      readonly status: 'available' | 'accepted';
      readonly target: ReferenceScopeConfirmationTarget;
      readonly value: Readonly<object>;
      readonly changed: boolean;
      readonly diagnostics: readonly Diagnostic[];
    }
  | {
      readonly status: 'unconfirmable';
      readonly target: ReferenceScopeConfirmationTarget;
      readonly diagnostics: readonly Diagnostic[];
    };

type DefaultCandidate =
  | {
      readonly status: 'available';
      readonly value: Readonly<object>;
      readonly diagnostics: readonly Diagnostic[];
    }
  | {
      readonly status: 'accepted' | 'cancelled' | 'no-effect' | 'failed';
      readonly diagnostics: readonly Diagnostic[];
    };

type PendingConfiguration = {
  readonly kind: 'apply' | 'restore';
  readonly configuration: AppliedConfiguration;
  readonly definition: FormDefinition;
  readonly diagnostics: readonly Diagnostic[];
};

const rendererRegistryResult = createReactNativeRendererRegistry();
if (!rendererRegistryResult.success)
  throw new Error('The native React renderer registry could not be created.');
const rendererRegistry = rendererRegistryResult.registry;
const validator = createAjvSchemaValidator();

const snippetEntries = Object.freeze([
  Object.freeze({
    id: 'react-controlled-hook' as const,
    label: 'Controlled React hook',
    purpose:
      'Connects immutable application roots to a client-owned React lifecycle.',
    responsibility:
      'The application keeps value and baselineValue and supplies explicit decision callbacks.',
  }),
  Object.freeze({
    id: 'react-operation-decision' as const,
    label: 'Operation decision',
    purpose:
      'Applies a strict requested operation only after application confirmation.',
    responsibility:
      'The renderer requests; the application decides and publishes the next complete root.',
  }),
  Object.freeze({
    id: 'react-wizard-decision' as const,
    label: 'Wizard decision',
    purpose:
      'Confirms or rejects navigation without direct target-owned selection.',
    responsibility:
      'The application consumes the intention and uses the opaque facade action.',
  }),
  Object.freeze({
    id: 'react-schema-form' as const,
    label: 'SchemaForm projection',
    purpose:
      'Projects the current neutral snapshot through the native React registry.',
    responsibility:
      'SchemaForm renders controlled state; it does not own persistence or submission.',
  }),
]);

export function ReferenceApplication(): ReactElement {
  const [session, setSession] = useState(() =>
    createSession(referenceScenarios[0]),
  );
  const [decisionMode, setDecisionMode] = useState<DecisionMode>('confirm');
  const [history, setHistory] = useState<readonly HistoryEntry[]>(
    Object.freeze([]),
  );
  const [pendingWizard, setPendingWizard] = useState<WizardIntention>();
  const [wizardEvidence, setWizardEvidence] = useState<
    readonly WizardIntention[]
  >(Object.freeze([]));
  const [runtimeDiagnostics, setRuntimeDiagnostics] = useState<
    readonly Diagnostic[]
  >(Object.freeze([]));
  const [actionDiagnostics, setActionDiagnostics] = useState<
    readonly Diagnostic[]
  >(Object.freeze([]));
  const [serviceEvidence, setServiceEvidence] = useState<
    readonly ReactServiceRequestEvidence[]
  >(Object.freeze([]));
  const [scopeCandidate, setScopeCandidate] = useState<ScopeCandidate>();
  const [defaultCandidate, setDefaultCandidate] = useState<DefaultCandidate>();
  const [schemaDraft, setSchemaDraft] = useState(session.active.schemaText);
  const [uiSchemaDraft, setUiSchemaDraft] = useState(
    session.active.uiSchemaText,
  );
  const [draftResult, setDraftResult] =
    useState<ConfigurationDraftResult>(emptyDraftResult);
  const [pendingConfiguration, setPendingConfiguration] =
    useState<PendingConfiguration>();
  const [theme, setTheme] = useState<ThemeMode>('auto');
  const [schemaTab, setSchemaTab] = useState<'schema' | 'ui-schema'>('schema');
  const [evidenceTab, setEvidenceTab] = useState<EvidenceTab>('state');
  const [snippetId, setSnippetId] = useState<
    (typeof snippetEntries)[number]['id']
  >('react-controlled-hook');
  const [copyStatus, setCopyStatus] = useState('');
  const [memberId, setMemberId] = useState('new-member');
  const [memberName, setMemberName] = useState('New member');
  const nextSequence = useRef(1);
  const handleRef = useRef<ReactFormHandle<object> | undefined>(undefined);
  const activeRevision = useRef(session.revision);
  activeRevision.current = session.revision;

  const asyncValidator = useMemo(() => {
    const revision = session.revision;
    return session.scenario.serviceValidation === undefined
      ? undefined
      : new ReactReferenceAsyncValidator(
          session.scenario.serviceValidation,
          (evidence) => {
            if (activeRevision.current === revision)
              setServiceEvidence(evidence);
          },
        );
  }, [session.revision, session.scenario]);

  const appendHistory = useCallback(
    (
      operation: FormOperation,
      decision: HistoryEntry['decision'],
      diagnostics: readonly Diagnostic[] = Object.freeze([]),
    ) => {
      const entry = Object.freeze({
        sequence: nextSequence.current++,
        operation,
        decision,
        diagnostics,
      });
      setHistory((current) => Object.freeze([...current, entry]));
    },
    [],
  );

  // reference-snippet:start react-operation-decision
  const applyConfirmedOperation = useCallback(
    (
      operation: FormOperation,
    ): {
      readonly decision: 'confirmed' | 'failed';
      readonly diagnostics: readonly Diagnostic[];
    } => {
      const applied = applyFormOperation(
        session.definition,
        session.value,
        operation,
      );
      if (!applied.success) {
        setActionDiagnostics(applied.diagnostics);
        return Object.freeze({
          decision: 'failed',
          diagnostics: applied.diagnostics,
        });
      }
      setSession((current) => ({ ...current, value: ownRoot(applied.value) }));
      setActionDiagnostics(applied.diagnostics);
      return Object.freeze({
        decision: 'confirmed',
        diagnostics: applied.diagnostics,
      });
    },
    [session.definition, session.value],
  );
  // reference-snippet:end react-operation-decision

  const confirmOperation = useCallback(
    (operation: FormOperation): void => {
      const result = applyConfirmedOperation(operation);
      appendHistory(operation, result.decision, result.diagnostics);
    },
    [appendHistory, applyConfirmedOperation],
  );

  const receiveOperation = useCallback(
    (operation: FormOperation): void => {
      if (decisionMode === 'reject') {
        appendHistory(operation, 'rejected');
        return;
      }
      if (decisionMode === 'pending') {
        appendHistory(operation, 'pending');
        return;
      }
      confirmOperation(operation);
    },
    [appendHistory, confirmOperation, decisionMode],
  );

  // reference-snippet:start react-wizard-decision
  const receiveWizardIntention = useCallback(
    (intention: WizardIntention): void => {
      setWizardEvidence((current) => Object.freeze([...current, intention]));
      if (intention.kind === 'complete') return;
      const actions = handleRef.current?.actions;
      if (actions === undefined) return;
      if (decisionMode === 'reject') {
        recordAction(actions.rejectWizardIntention(intention.requestId));
        return;
      }
      if (decisionMode === 'pending') {
        setPendingWizard(intention);
        return;
      }
      recordAction(
        actions.confirmWizardSelection({
          requestId: intention.requestId,
          selectedStepId: intention.toStepId,
        }),
      );
    },
    [decisionMode],
  );
  // reference-snippet:end react-wizard-decision

  // reference-snippet:start react-controlled-hook
  const form = useSchemaForm({
    formId: `reference-react-${session.scenario.id}-${session.revision}`,
    definition: session.definition,
    schema: session.active.input.schema,
    validator,
    ...(asyncValidator === undefined
      ? {}
      : { asyncValidator: asyncValidator.validator }),
    value: session.value,
    baselineValue: session.baselineValue,
    locale: session.locale,
    validationVisibility: session.validationVisibility,
    ...(session.definition.presentation[0]?.kind === 'wizard'
      ? {
          wizardState: {
            selectedStepId:
              session.definition.presentation[0].steps[0]?.id ?? '',
          },
        }
      : {}),
    onOperation: receiveOperation,
    onWizardIntention: receiveWizardIntention,
    onDiagnostics: setRuntimeDiagnostics,
  });
  // reference-snippet:end react-controlled-hook
  handleRef.current = form;

  useEffect(() => {
    document.documentElement.dataset['theme'] = theme;
    return () => {
      delete document.documentElement.dataset['theme'];
    };
  }, [theme]);

  function recordAction(result: {
    readonly diagnostics: readonly Diagnostic[];
  }): void {
    setActionDiagnostics(result.diagnostics);
  }

  function installScenario(scenario: ReferenceScenario): void {
    const next = createSession(scenario, session.revision + 1);
    setSession(next);
    setSchemaDraft(next.active.schemaText);
    setUiSchemaDraft(next.active.uiSchemaText);
    clearTransientState();
  }

  function resetScenario(): void {
    setSession((current) => ({
      ...current,
      value: ownRoot(current.scenario.initialState.value),
      baselineValue: ownRoot(current.scenario.initialState.baselineValue),
      locale: current.scenario.initialState.locale,
      validationVisibility: current.scenario.initialState.validationVisibility,
      revision: current.revision + 1,
    }));
    clearTransientState(false);
  }

  function clearTransientState(resetDraft = true): void {
    setDecisionMode('confirm');
    setHistory(Object.freeze([]));
    setPendingWizard(undefined);
    setWizardEvidence(Object.freeze([]));
    setRuntimeDiagnostics(Object.freeze([]));
    setActionDiagnostics(Object.freeze([]));
    setServiceEvidence(Object.freeze([]));
    setScopeCandidate(undefined);
    setDefaultCandidate(undefined);
    setPendingConfiguration(undefined);
    if (resetDraft) setDraftResult(emptyDraftResult());
    nextSequence.current = 1;
    setMemberId('new-member');
    setMemberName('New member');
  }

  function setVisibility(visibility: ValidationVisibility): void {
    setSession((current) => ({ ...current, validationVisibility: visibility }));
    recordAction(form.actions.setValidationVisibility(visibility));
  }

  function resolvePendingOperation(sequence: number, confirm: boolean): void {
    const entry = history.find(
      (candidate) =>
        candidate.sequence === sequence && candidate.decision === 'pending',
    );
    if (entry === undefined) return;
    const resolution = confirm
      ? applyConfirmedOperation(entry.operation)
      : Object.freeze({
          decision: 'rejected' as const,
          diagnostics: Object.freeze([]),
        });
    setHistory((current) =>
      Object.freeze(
        current.map((candidate) =>
          candidate.sequence === sequence
            ? Object.freeze({
                ...candidate,
                decision: resolution.decision,
                diagnostics: resolution.diagnostics,
              })
            : candidate,
        ),
      ),
    );
  }

  function resolvePendingWizard(confirm: boolean): void {
    if (pendingWizard === undefined || pendingWizard.kind === 'complete')
      return;
    const result = confirm
      ? form.actions.confirmWizardSelection({
          requestId: pendingWizard.requestId,
          selectedStepId: pendingWizard.toStepId,
        })
      : form.actions.rejectWizardIntention(pendingWizard.requestId);
    recordAction(result);
    setPendingWizard(undefined);
  }

  function prepareScope(target: ReferenceScopeConfirmationTarget): void {
    const result = commitScopeToBaseline(
      session.definition,
      session.baselineValue,
      session.value,
      target.scope,
    );
    setScopeCandidate(
      result.success
        ? Object.freeze({
            status: 'available',
            target,
            value: result.value,
            changed: result.changed,
            diagnostics: result.diagnostics,
          })
        : Object.freeze({
            status: 'unconfirmable',
            target,
            diagnostics: result.diagnostics,
          }),
    );
  }

  function acceptScope(): void {
    if (scopeCandidate?.status !== 'available') return;
    setSession((current) => ({
      ...current,
      baselineValue: scopeCandidate.value,
    }));
    setScopeCandidate({ ...scopeCandidate, status: 'accepted' });
  }

  function deriveDefaults(): void {
    const result = deriveSchemaDefaultCandidate(
      session.active.input.schema,
      session.value,
    );
    setDefaultCandidate(
      result.success
        ? result.changed
          ? Object.freeze({
              status: 'available',
              value: result.value,
              diagnostics: result.diagnostics,
            })
          : Object.freeze({
              status: 'no-effect',
              diagnostics: result.diagnostics,
            })
        : Object.freeze({
            status: 'failed',
            diagnostics: result.diagnostics,
          }),
    );
  }

  function acceptDefaults(): void {
    if (defaultCandidate?.status !== 'available') return;
    setSession((current) => ({ ...current, value: defaultCandidate.value }));
    setDefaultCandidate({
      status: 'accepted',
      diagnostics: defaultCandidate.diagnostics,
    });
  }

  function validateDraft(): ReturnType<typeof evaluateDraft> {
    const evaluation = evaluateDraft(
      schemaDraft,
      uiSchemaDraft,
      session.active.input,
    );
    setDraftResult(evaluation.result);
    return evaluation;
  }

  function prepareConfigurationAction(kind: 'apply' | 'restore'): void {
    const configuration = kind === 'restore' ? session.original : undefined;
    const evaluation =
      configuration === undefined
        ? validateDraft()
        : evaluateDraft(
            configuration.schemaText,
            configuration.uiSchemaText,
            configuration.input,
          );
    if (!evaluation.success) return;
    setPendingConfiguration(
      Object.freeze({
        kind,
        configuration: evaluation.configuration,
        definition: evaluation.compilation.definition,
        diagnostics: evaluation.compilation.diagnostics,
      }),
    );
  }

  function confirmConfiguration(): void {
    if (pendingConfiguration === undefined) return;
    const configuration = pendingConfiguration.configuration;
    setSession((current) => ({
      ...current,
      active: configuration,
      definition: pendingConfiguration.definition,
      compilationDiagnostics: pendingConfiguration.diagnostics,
      value: ownRoot(current.scenario.initialState.value),
      baselineValue: ownRoot(current.scenario.initialState.baselineValue),
      locale: current.scenario.initialState.locale,
      validationVisibility: current.scenario.initialState.validationVisibility,
      revision: current.revision + 1,
    }));
    setSchemaDraft(configuration.schemaText);
    setUiSchemaDraft(configuration.uiSchemaText);
    clearTransientState();
    setDraftResult(
      Object.freeze({
        status: 'valid',
        diagnostics: pendingConfiguration.diagnostics,
      }),
    );
  }

  function cancelDraft(): void {
    setSchemaDraft(session.active.schemaText);
    setUiSchemaDraft(session.active.uiSchemaText);
    setDraftResult(emptyDraftResult());
    setPendingConfiguration(undefined);
  }

  function requestTeamInsert(): void {
    const id = memberId.trim();
    const name = memberName.trim();
    if (id.length === 0 || name.length === 0) return;
    recordAction(
      form.actions.requestInsertItem(
        ['team'],
        id,
        { id, name, role: 'Member' },
        { kind: 'end' },
      ),
    );
  }

  function moveFirstTeamMemberLater(): void {
    const [first, second] = readTeamMembers(session.value);
    if (first === undefined || second === undefined) return;
    recordAction(
      form.actions.requestMoveItem(
        { collectionPath: ['team'], itemId: first.id },
        { kind: 'after', itemId: second.id },
      ),
    );
  }

  function removeLastTeamMember(): void {
    const last = readTeamMembers(session.value).at(-1);
    if (last === undefined) return;
    recordAction(
      form.actions.requestRemoveItem({
        collectionPath: ['team'],
        itemId: last.id,
      }),
    );
  }

  const pendingOperations = history.filter(
    ({ decision }) => decision === 'pending',
  );
  const readySnapshot =
    form.state.status === 'ready' ? form.state.snapshot : undefined;
  // reference-snippet:start react-schema-form
  const projectedForm = (
    <SchemaForm form={form} rendererRegistry={rendererRegistry} />
  );
  // reference-snippet:end react-schema-form

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Private reference</p>
          <h1>Schema Engine React reference</h1>
        </div>
        <label className="theme-control">
          Theme
          <select
            aria-label="Theme"
            value={theme}
            onChange={(event) =>
              setTheme(event.currentTarget.value as ThemeMode)
            }
          >
            <option value="auto">Auto</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </header>

      <main>
        <Collapsible title="Reference scenario" testId="scenario-panel">
          <div className="scenario-navigation">
            <label htmlFor="react-scenario">Reference scenario</label>
            <select
              id="react-scenario"
              value={session.scenario.id}
              onChange={(event) => {
                const scenario = referenceScenarios.find(
                  ({ id }) => id === event.currentTarget.value,
                );
                if (scenario !== undefined) installScenario(scenario);
              }}
            >
              {referenceScenarios.map((scenario) => (
                <option value={scenario.id} key={scenario.id}>
                  {scenario.title}
                </option>
              ))}
            </select>
          </div>
          <p className="scenario-summary">{session.scenario.summary}</p>
          <div className="scenario-explanation">
            {session.scenario.explanation.map((entry) => (
              <article key={entry.id}>
                <h3>{entry.title}</h3>
                <p>{entry.body}</p>
              </article>
            ))}
          </div>
          <p role="status" data-testid="compile-status">
            {form.state.status === 'ready'
              ? 'Configuration compiled and runtime ready.'
              : form.state.status === 'initializing'
                ? 'Initializing controlled runtime.'
                : 'Runtime unavailable.'}
          </p>
        </Collapsible>

        <div className="consumer-workspace">
          <Collapsible title="Interactive consumer" testId="preview-panel">
            <section
              className="application-controls"
              aria-labelledby="application-controls-heading"
            >
              <div>
                <h2 id="application-controls-heading">Application controls</h2>
                <p>
                  The application owns confirmation, roots, locale and issue
                  visibility.
                </p>
              </div>
              <div className="button-row">
                <button type="button" onClick={resetScenario}>
                  Reset scenario
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSession((current) => ({
                      ...current,
                      baselineValue: ownRoot(current.value),
                    }))
                  }
                >
                  Commit baseline
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSession((current) => ({ ...current, locale: 'en' }))
                  }
                >
                  Locale en
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSession((current) => ({ ...current, locale: 'es' }))
                  }
                >
                  Locale es
                </button>
                <button type="button" onClick={() => setVisibility('touched')}>
                  Touched issues
                </button>
                <button type="button" onClick={() => setVisibility('all')}>
                  All issues
                </button>
              </div>
            </section>

            <fieldset className="decision-control">
              <legend>Operation and wizard decision</legend>
              <div className="button-row">
                {(['confirm', 'reject', 'pending'] as const).map((mode) => (
                  <button
                    type="button"
                    aria-pressed={decisionMode === mode}
                    onClick={() => setDecisionMode(mode)}
                    key={mode}
                  >
                    {capitalize(mode)}
                  </button>
                ))}
              </div>
            </fieldset>

            {session.scenario.id === 'stable-team' ? (
              <fieldset className="special-controls">
                <legend>Team collection controls</legend>
                <div className="field-row">
                  <label>
                    New member ID
                    <input
                      value={memberId}
                      onChange={(event) =>
                        setMemberId(event.currentTarget.value)
                      }
                    />
                  </label>
                  <label>
                    New member name
                    <input
                      value={memberName}
                      onChange={(event) =>
                        setMemberName(event.currentTarget.value)
                      }
                    />
                  </label>
                </div>
                <button type="button" onClick={requestTeamInsert}>
                  Insert member at end
                </button>
                <button type="button" onClick={moveFirstTeamMemberLater}>
                  Move first member after second
                </button>
                <button type="button" onClick={removeLastTeamMember}>
                  Remove last member
                </button>
              </fieldset>
            ) : null}

            {session.scenario.id === 'fixed-values' ? (
              <ControlValues
                title="Fixed value controls"
                values={fixedValueControlStates}
                apply={(value) =>
                  setSession((current) => ({
                    ...current,
                    value: ownRoot(value),
                  }))
                }
              />
            ) : null}
            {session.scenario.id === 'string-enum-array' ? (
              <ControlValues
                title="Multiple-choice compatibility controls"
                values={stringEnumArrayControlStates}
                apply={(value) =>
                  setSession((current) => ({
                    ...current,
                    value: ownRoot(value),
                  }))
                }
              />
            ) : null}

            {session.scenario.serviceValidation === undefined ? null : (
              <fieldset
                className="special-controls"
                data-testid="service-validation-controls"
              >
                <legend>
                  {session.scenario.serviceValidation.labels.heading}
                </legend>
                <p>
                  Fake application service: these actions settle validation and
                  never mutate the form value.
                </p>
                <div className="button-row">
                  <button
                    type="button"
                    onClick={() => asyncValidator?.resolveCurrent(true)}
                  >
                    {session.scenario.serviceValidation.labels.settleValid}
                  </button>
                  <button
                    type="button"
                    onClick={() => asyncValidator?.resolveCurrent(false)}
                  >
                    {session.scenario.serviceValidation.labels.settleInvalid}
                  </button>
                  <button
                    type="button"
                    onClick={() => asyncValidator?.rejectCurrent()}
                  >
                    {session.scenario.serviceValidation.labels.reject}
                  </button>
                  <button
                    type="button"
                    onClick={() => asyncValidator?.throwOnNextRequest()}
                  >
                    {session.scenario.serviceValidation.labels.throwNext}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      recordAction(form.actions.retryAsyncValidation())
                    }
                  >
                    {session.scenario.serviceValidation.labels.retry}
                  </button>
                </div>
              </fieldset>
            )}

            {session.scenario.scopeConfirmation === undefined ? null : (
              <fieldset className="special-controls">
                <legend>
                  {session.scenario.scopeConfirmation.labels.heading}
                </legend>
                <p>{session.scenario.scopeConfirmation.labels.guidance}</p>
                <div className="button-row">
                  {session.scenario.scopeConfirmation.targets.map((target) => (
                    <button
                      type="button"
                      key={target.id}
                      onClick={() => prepareScope(target)}
                    >
                      {target.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={scopeCandidate?.status !== 'available'}
                    onClick={acceptScope}
                  >
                    {session.scenario.scopeConfirmation.labels.accept}
                  </button>
                </div>
                <Evidence value={scopeCandidate} />
              </fieldset>
            )}

            {session.scenario.schemaDefaults === undefined ? null : (
              <fieldset className="special-controls">
                <legend>
                  {session.scenario.schemaDefaults.labels.heading}
                </legend>
                <p>{session.scenario.schemaDefaults.labels.guidance}</p>
                <div className="button-row">
                  <button type="button" onClick={deriveDefaults}>
                    {session.scenario.schemaDefaults.labels.derive}
                  </button>
                  <button
                    type="button"
                    disabled={defaultCandidate?.status !== 'available'}
                    onClick={() =>
                      setDefaultCandidate(
                        defaultCandidate?.status === 'available'
                          ? {
                              status: 'cancelled',
                              diagnostics: defaultCandidate.diagnostics,
                            }
                          : defaultCandidate,
                      )
                    }
                  >
                    {session.scenario.schemaDefaults.labels.cancel}
                  </button>
                  <button
                    type="button"
                    disabled={defaultCandidate?.status !== 'available'}
                    onClick={acceptDefaults}
                  >
                    {session.scenario.schemaDefaults.labels.accept}
                  </button>
                </div>
                <Evidence value={defaultCandidate} />
              </fieldset>
            )}

            {pendingOperations.length === 0 ? null : (
              <section className="pending-decisions">
                <h2>Pending operations</h2>
                {pendingOperations.map((entry) => (
                  <div className="button-row" key={entry.sequence}>
                    <span>Operation {entry.sequence}</span>
                    <button
                      type="button"
                      onClick={() =>
                        resolvePendingOperation(entry.sequence, true)
                      }
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        resolvePendingOperation(entry.sequence, false)
                      }
                    >
                      Reject
                    </button>
                  </div>
                ))}
              </section>
            )}
            {pendingWizard === undefined ? null : (
              <section className="pending-decisions">
                <h2>Pending wizard navigation</h2>
                <div className="button-row">
                  <button
                    type="button"
                    onClick={() => resolvePendingWizard(true)}
                  >
                    Confirm navigation
                  </button>
                  <button
                    type="button"
                    onClick={() => resolvePendingWizard(false)}
                  >
                    Reject navigation
                  </button>
                </div>
              </section>
            )}

            <h2 className="preview-heading">Form preview</h2>
            <div className="form-preview" data-testid="form-preview">
              {projectedForm}
            </div>
          </Collapsible>

          <Collapsible title="Schemas" testId="schemas-panel">
            <div className="schema-workspace">
              <TabList
                label="Schema documents"
                value={schemaTab}
                options={[
                  ['schema', 'Schema'],
                  ['ui-schema', 'UI Schema'],
                ]}
                onChange={setSchemaTab}
              />
              <p id="schema-editor-guidance">
                Validate drafts before applying. Applying or restoring starts a
                fresh controlled scenario epoch.
              </p>
              {schemaTab === 'schema' ? (
                <div
                  id={tabPanelId('Schema documents', 'schema')}
                  role="tabpanel"
                  aria-labelledby={tabId('Schema documents', 'schema')}
                >
                  <JsonEditor
                    label="Schema JSON"
                    value={schemaDraft}
                    describedBy="schema-editor-guidance"
                    onChange={(value) => {
                      setSchemaDraft(value);
                      setDraftResult(emptyDraftResult());
                    }}
                  />
                </div>
              ) : (
                <div
                  id={tabPanelId('Schema documents', 'ui-schema')}
                  role="tabpanel"
                  aria-labelledby={tabId('Schema documents', 'ui-schema')}
                >
                  <JsonEditor
                    label="UI Schema JSON"
                    value={uiSchemaDraft}
                    describedBy="schema-editor-guidance"
                    onChange={(value) => {
                      setUiSchemaDraft(value);
                      setDraftResult(emptyDraftResult());
                    }}
                  />
                </div>
              )}
              <div className="button-row schema-actions">
                <button type="button" onClick={validateDraft}>
                  Validate
                </button>
                <button
                  type="button"
                  onClick={() => prepareConfigurationAction('apply')}
                >
                  Apply
                </button>
                <button type="button" onClick={cancelDraft}>
                  Cancel edits
                </button>
                <button
                  type="button"
                  disabled={configurationsEqual(
                    session.active,
                    session.original,
                  )}
                  onClick={() => prepareConfigurationAction('restore')}
                >
                  Restore original
                </button>
                <CopyButton
                  value={schemaTab === 'schema' ? schemaDraft : uiSchemaDraft}
                  label={`Copy ${schemaTab === 'schema' ? 'Schema' : 'UI Schema'}`}
                  onStatus={setCopyStatus}
                />
              </div>
              <p role="status" data-testid="draft-status">
                Draft: {draftResult.status}. {copyStatus}
              </p>
              {pendingConfiguration === undefined ? null : (
                <div
                  className="confirmation"
                  role="alertdialog"
                  aria-label="Confirm configuration reset"
                >
                  <p>
                    {pendingConfiguration.kind === 'apply'
                      ? 'Apply this valid configuration and reset application state?'
                      : 'Restore the original scenario configuration and reset application state?'}
                  </p>
                  <button type="button" onClick={confirmConfiguration}>
                    Confirm configuration
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingConfiguration(undefined)}
                  >
                    Keep current configuration
                  </button>
                </div>
              )}
              <DiagnosticList diagnostics={draftResult.diagnostics} />
            </div>
          </Collapsible>
        </div>

        <Collapsible title="Observable evidence" testId="evidence-panel">
          <TabList
            label="Observable evidence"
            value={evidenceTab}
            options={[
              ['state', 'State'],
              ['operations', 'Operations'],
              ['diagnostics', 'Diagnostics'],
              ['service', 'Service'],
            ]}
            onChange={setEvidenceTab}
          />
          <div
            id={tabPanelId('Observable evidence', evidenceTab)}
            role="tabpanel"
            aria-labelledby={tabId('Observable evidence', evidenceTab)}
          >
            {evidenceTab === 'state' ? (
              <Evidence
                value={{
                  value: session.value,
                  baselineValue: session.baselineValue,
                  locale: session.locale,
                  validationVisibility: session.validationVisibility,
                  snapshot: readySnapshot,
                }}
                open
              />
            ) : null}
            {evidenceTab === 'operations' ? (
              <Evidence value={{ history, wizardIntentions: wizardEvidence }} />
            ) : null}
            {evidenceTab === 'diagnostics' ? (
              <Evidence
                value={{
                  compilation: session.compilationDiagnostics,
                  runtime: runtimeDiagnostics,
                  actions: actionDiagnostics,
                }}
              />
            ) : null}
            {evidenceTab === 'service' ? (
              <Evidence value={serviceEvidence} />
            ) : null}
          </div>
        </Collapsible>

        <Collapsible title="Integration" testId="integration-panel">
          <TabList
            label="Integration examples"
            value={snippetId}
            options={snippetEntries.map(({ id, label }) => [id, label])}
            onChange={setSnippetId}
          />
          {snippetEntries
            .filter(({ id }) => id === snippetId)
            .map((snippet) => (
              <article
                className="snippet"
                key={snippet.id}
                id={tabPanelId('Integration examples', snippet.id)}
                role="tabpanel"
                aria-labelledby={tabId('Integration examples', snippet.id)}
              >
                <h2>{snippet.label}</h2>
                <dl>
                  <dt>Purpose</dt>
                  <dd>{snippet.purpose}</dd>
                  <dt>Application responsibility</dt>
                  <dd>{snippet.responsibility}</dd>
                </dl>
                <CopyButton
                  value={referenceSnippets[snippet.id]}
                  label={`Copy ${snippet.label}`}
                  onStatus={setCopyStatus}
                />
                <HighlightedCode
                  source={referenceSnippets[snippet.id]}
                  language="typescript"
                />
              </article>
            ))}
        </Collapsible>
      </main>
    </div>
  );
}

export function ReferenceApplicationRoot(): ReactElement {
  return (
    <StrictMode>
      <ReferenceApplication />
    </StrictMode>
  );
}

function Collapsible({
  title,
  testId,
  children,
}: {
  readonly title: string;
  readonly testId: string;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <details className="panel" data-testid={testId} open>
      <summary>
        <span className="eyebrow">{title}</span>
      </summary>
      <div className="panel-body">{children}</div>
    </details>
  );
}

function TabList<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  readonly label: string;
  readonly value: T;
  readonly options: readonly (readonly [T, string])[];
  readonly onChange: (value: T) => void;
}): ReactElement {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {options.map(([id, text]) => (
        <button
          type="button"
          id={tabId(label, id)}
          role="tab"
          aria-controls={tabPanelId(label, id)}
          aria-selected={id === value}
          tabIndex={id === value ? 0 : -1}
          onClick={() => onChange(id)}
          onKeyDown={(event) => {
            if (
              event.key !== 'ArrowLeft' &&
              event.key !== 'ArrowRight' &&
              event.key !== 'Home' &&
              event.key !== 'End'
            )
              return;
            event.preventDefault();
            const tabs = [
              ...(event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
                '[role="tab"]',
              ) ?? []),
            ];
            const current = tabs.indexOf(event.currentTarget);
            const target =
              event.key === 'Home'
                ? tabs[0]
                : event.key === 'End'
                  ? tabs.at(-1)
                  : tabs[
                      (current +
                        (event.key === 'ArrowRight' ? 1 : -1) +
                        tabs.length) %
                        tabs.length
                    ];
            target?.focus();
            target?.click();
          }}
          key={id}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

function ControlValues({
  title,
  values,
  apply,
}: {
  readonly title: string;
  readonly values: readonly {
    readonly id: string;
    readonly label: string;
    readonly value: Readonly<object>;
  }[];
  readonly apply: (value: Readonly<object>) => void;
}): ReactElement {
  return (
    <fieldset className="special-controls">
      <legend>{title}</legend>
      <div className="button-row">
        {values.map((entry) => (
          <button
            type="button"
            key={entry.id}
            onClick={() => apply(entry.value)}
          >
            {entry.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Evidence({
  value,
  open = false,
}: {
  readonly value: unknown;
  readonly open?: boolean;
}): ReactElement {
  const [status, setStatus] = useState('');
  const source = serializeEvidence(value);
  return (
    <details className="evidence-value" open={open}>
      <summary>Value</summary>
      <button
        type="button"
        onClick={() =>
          void copyText(source).then((copied) =>
            setStatus(copied ? 'Copied.' : 'Copy unavailable.'),
          )
        }
      >
        Copy JSON
      </button>
      <span role="status">{status}</span>
      <HighlightedCode source={source} language="json" />
    </details>
  );
}

function DiagnosticList({
  diagnostics,
}: {
  readonly diagnostics: readonly Diagnostic[];
}): ReactElement | null {
  return diagnostics.length === 0 ? null : (
    <ul className="diagnostics">
      {diagnostics.map((diagnostic, index) => (
        <li key={`${index}:${diagnostic.code}`}>
          {diagnostic.code}: {diagnostic.fallbackMessage}
        </li>
      ))}
    </ul>
  );
}

function CopyButton({
  value,
  label,
  onStatus,
}: {
  readonly value: string;
  readonly label: string;
  readonly onStatus: (status: string) => void;
}): ReactElement {
  return (
    <button
      type="button"
      onClick={() =>
        void copyText(value).then((copied) =>
          onStatus(copied ? 'Copied.' : 'Copy unavailable.'),
        )
      }
    >
      {label}
    </button>
  );
}

function createSession(
  scenario: ReferenceScenario | undefined,
  revision = 0,
): Session {
  if (scenario === undefined)
    throw new Error('At least one reference scenario is required.');
  const original = prepareConfiguration(scenario.compileInput);
  const compilation = compileFormDefinition(original.input);
  if (!compilation.success)
    throw new Error(`Reference scenario "${scenario.id}" does not compile.`);
  return Object.freeze({
    scenario,
    original,
    active: prepareConfiguration(original.input),
    definition: compilation.definition,
    compilationDiagnostics: compilation.diagnostics,
    value: ownRoot(scenario.initialState.value),
    baselineValue: ownRoot(scenario.initialState.baselineValue),
    locale: scenario.initialState.locale,
    validationVisibility: scenario.initialState.validationVisibility,
    revision,
  });
}

function ownRoot(value: Readonly<object>): Readonly<object> {
  return deepFreeze(structuredClone(value));
}

function readTeamMembers(
  value: Readonly<object>,
): readonly { readonly id: string }[] {
  const team = (value as { readonly team?: unknown }).team;
  if (!Array.isArray(team)) return Object.freeze([]);
  return Object.freeze(
    team.flatMap((entry) =>
      typeof entry === 'object' &&
      entry !== null &&
      typeof Reflect.get(entry, 'id') === 'string'
        ? [Object.freeze({ id: Reflect.get(entry, 'id') as string })]
        : [],
    ),
  );
}

function deepFreeze<T>(value: T): T {
  if (typeof value !== 'object' || value === null || Object.isFrozen(value))
    return value;
  if (Array.isArray(value)) for (const entry of value) deepFreeze(entry);
  else for (const entry of Object.values(value)) deepFreeze(entry);
  return Object.freeze(value);
}

function capitalize(value: string): string {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}

function tabId(label: string, value: string): string {
  return `react-${domToken(label)}-${domToken(value)}-tab`;
}

function tabPanelId(label: string, value: string): string {
  return `react-${domToken(label)}-${domToken(value)}-panel`;
}

function domToken(value: string): string {
  return value
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/gu, '-')
    .replaceAll(/^-|-$/gu, '');
}
