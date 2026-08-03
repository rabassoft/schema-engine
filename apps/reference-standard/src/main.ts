// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import './styles.css';

import {
  fixedValueControlStates,
  referenceScenarios,
} from '@schema-engine-internal/reference-scenarios';

import { StandardDomRenderer } from './dom-renderer.js';
import { referenceSnippets } from './generated/reference-snippets.js';
import { StandardJsonEditor } from './json-editor.js';
import {
  StandardReferenceApplication,
  type StandardReferenceApplicationState,
} from './reference-application.js';
import {
  copyText,
  renderHighlightedCode,
  serializeEvidence,
  type DisplayLanguage,
} from './syntax.js';
import { StandardTabs } from './tabs.js';

type ThemeMode = 'auto' | 'light' | 'dark';
type StandardSnippetId = keyof typeof referenceSnippets;

const standardSnippetOrder = Object.freeze([
  'standard-compile-definition',
  'standard-create-runtime',
  'standard-runtime-subscriptions',
  'standard-controlled-operation',
  'standard-runtime-cleanup',
] as const satisfies readonly StandardSnippetId[]);

const standardSnippetExplanations = Object.freeze({
  'standard-compile-definition': Object.freeze({
    label: 'Compile Definition',
    purpose:
      'Compiles the active JSON Schema and UI Schema into the normalized definition consumed by renderers and runtimes.',
    responsibility:
      'The application selects the complete configuration and must stop before runtime creation when compilation returns diagnostics.',
  }),
  'standard-create-runtime': Object.freeze({
    label: 'Create Runtime',
    purpose:
      'Creates a controlled runtime with the compiled definition, active schema, complete roots, locale, visibility and replaceable validator.',
    responsibility:
      'The application supplies and continues to own value and baselineValue; creating a runtime does not transfer state ownership.',
  }),
  'standard-runtime-subscriptions': Object.freeze({
    label: 'Runtime Subscriptions',
    purpose:
      'Separately subscribes to immutable snapshots for rendering and operation requests for application decisions.',
    responsibility:
      'The application handles subscription failures, stores both cleanup functions and never treats snapshots as mutable state.',
  }),
  'standard-controlled-operation': Object.freeze({
    label: 'Controlled Operation',
    purpose:
      'Applies a requested operation incrementally against the current application value and returns the resulting complete root to the runtime.',
    responsibility:
      'The application decides the request, owns the new root and records failures; the renderer never mutates application data optimistically.',
  }),
  'standard-runtime-cleanup': Object.freeze({
    label: 'Runtime Cleanup',
    purpose:
      'Releases DOM bindings, snapshot and operation subscriptions, then disposes the runtime during replacement or teardown.',
    responsibility:
      'The application owns lifecycle ordering and must prevent an old runtime from delivering into a replacement scenario.',
  }),
} satisfies Readonly<
  Record<
    StandardSnippetId,
    {
      readonly label: string;
      readonly purpose: string;
      readonly responsibility: string;
    }
  >
>);

export function renderReferenceSkeleton(
  root: HTMLElement,
  application = new StandardReferenceApplication(),
): () => void {
  const header = document.createElement('header');
  header.className = 'app-header';
  const titleGroup = document.createElement('div');
  const kicker = document.createElement('p');
  kicker.className = 'app-kicker';
  kicker.textContent = 'Private reference';
  const heading = document.createElement('h1');
  heading.textContent = 'Schema Engine Standard reference';
  titleGroup.append(kicker, heading);
  const theme = labelledSelect('standard-theme', 'Theme', [
    { value: 'auto', label: 'Auto' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ]);
  theme.label.className = 'theme-control';
  theme.label.append(theme.select);
  header.append(titleGroup, theme.label);

  const scenarioPanel = region('Scenario', 'scenario-panel');
  const scenarioSelect = labelledSelect(
    'standard-scenario',
    'Reference scenario',
    referenceScenarios.map(({ id, title }) => ({ value: id, label: title })),
  );
  const summary = document.createElement('p');
  summary.className = 'scenario-summary';
  const explanation = document.createElement('div');
  explanation.className = 'scenario-explanation';
  const compileStatus = document.createElement('p');
  compileStatus.dataset['testid'] = 'compile-status';
  compileStatus.setAttribute('role', 'status');
  scenarioPanel.body.append(
    scenarioSelect.label,
    scenarioSelect.select,
    summary,
    explanation,
    compileStatus,
  );

  const workspace = document.createElement('div');
  workspace.className = 'consumer-workspace';
  const preview = region('Interactive consumer', 'preview-panel');
  const controls = document.createElement('div');
  controls.className = 'application-controls';
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-labelledby', 'standard-application-controls');
  const controlsIntro = document.createElement('div');
  const controlsHeading = document.createElement('h3');
  controlsHeading.id = 'standard-application-controls';
  controlsHeading.textContent = 'Application controls';
  const controlsGuidance = document.createElement('p');
  controlsGuidance.textContent =
    'Reset keeps the applied configuration and unapplied editor text while restoring scenario and shell state.';
  controlsIntro.append(controlsHeading, controlsGuidance);
  const controlActions = document.createElement('div');
  controlActions.className = 'button-row';
  const reset = actionButton('Reset scenario');
  const commitBaseline = actionButton('Commit baseline');
  const localeEn = actionButton('Locale en');
  const localeEs = actionButton('Locale es');
  const touchedIssues = actionButton('Touched issues');
  const allIssues = actionButton('All issues');
  controlActions.append(
    reset,
    commitBaseline,
    localeEn,
    localeEs,
    touchedIssues,
    allIssues,
  );
  controls.append(controlsIntro, controlActions);

  const previewHeading = document.createElement('h3');
  previewHeading.className = 'preview-heading';
  previewHeading.textContent = 'Form preview';

  const decisionControl = document.createElement('fieldset');
  decisionControl.className = 'decision-control';
  const decisionLegend = document.createElement('legend');
  decisionLegend.textContent = 'Operation decision';
  const confirmOperations = actionButton('Confirm');
  confirmOperations.dataset['testid'] = 'decision-confirm';
  const rejectOperations = actionButton('Reject');
  rejectOperations.dataset['testid'] = 'decision-reject';
  const pendingOperations = actionButton('Pending');
  pendingOperations.dataset['testid'] = 'decision-pending';
  const decisionActions = document.createElement('div');
  decisionActions.className = 'button-row';
  decisionActions.append(
    confirmOperations,
    rejectOperations,
    pendingOperations,
  );
  decisionControl.append(decisionLegend, decisionActions);

  const collectionControls = document.createElement('fieldset');
  collectionControls.className = 'collection-controls';
  const collectionLegend = document.createElement('legend');
  collectionLegend.textContent = 'Team collection controls';
  const collectionFields = document.createElement('div');
  collectionFields.className = 'field-grid';
  const memberId = labelledInput('standard-team-member-id', 'New member ID');
  const memberName = labelledInput(
    'standard-team-member-name',
    'New member name',
  );
  collectionFields.append(
    memberId.label,
    memberId.input,
    memberName.label,
    memberName.input,
  );
  const collectionActions = document.createElement('div');
  collectionActions.className = 'button-row';
  const insertMember = actionButton('Insert member at end');
  const moveFirstMember = actionButton('Move first member after second');
  const removeLastMember = actionButton('Remove last member');
  collectionActions.append(insertMember, moveFirstMember, removeLastMember);
  collectionControls.append(
    collectionLegend,
    collectionFields,
    collectionActions,
  );

  const fixedControls = document.createElement('fieldset');
  fixedControls.className = 'collection-controls';
  const fixedControlsLegend = document.createElement('legend');
  fixedControlsLegend.textContent = 'Fixed value controls';
  const fixedControlActions = document.createElement('div');
  fixedControlActions.className = 'button-row';
  const fixedControlButtons = fixedValueControlStates.map((control) => {
    const controlButton = actionButton(control.label);
    controlButton.dataset['testid'] = `fixed-control-${control.id}`;
    controlButton.addEventListener('click', () =>
      application.replaceValue(control.value),
    );
    return controlButton;
  });
  fixedControlActions.append(...fixedControlButtons);
  fixedControls.append(fixedControlsLegend, fixedControlActions);

  const serviceControls = document.createElement('fieldset');
  serviceControls.className = 'collection-controls service-validation-controls';
  serviceControls.dataset['testid'] = 'service-validation-controls';
  const serviceLegend = document.createElement('legend');
  const serviceGuidance = document.createElement('p');
  serviceGuidance.className = 'scope-guidance';
  serviceGuidance.textContent =
    'Resolve deterministic application work to inspect core settlement, cancellation, failure and retry behavior.';
  const serviceStatus = document.createElement('p');
  serviceStatus.dataset['testid'] = 'async-validation-state';
  serviceStatus.setAttribute('role', 'status');
  serviceStatus.setAttribute('aria-live', 'polite');
  const serviceActions = document.createElement('div');
  serviceActions.className = 'button-row';
  const settleServiceValid = actionButton('Resolve as available');
  const settleServiceInvalid = actionButton('Resolve as unavailable');
  const rejectService = actionButton('Reject current request');
  const throwNextService = actionButton('Throw on next request');
  const retryService = actionButton('Retry service validation');
  serviceActions.append(
    settleServiceValid,
    settleServiceInvalid,
    rejectService,
    throwNextService,
    retryService,
  );
  const serviceEvidence = evidenceDetails('Service request evidence', true);
  serviceControls.append(
    serviceLegend,
    serviceGuidance,
    serviceStatus,
    serviceActions,
    serviceEvidence.details,
  );

  const scopeControls = document.createElement('fieldset');
  scopeControls.className = 'collection-controls scope-confirmation-controls';
  scopeControls.dataset['testid'] = 'scope-confirmation-controls';
  const scopeLegend = document.createElement('legend');
  const scopeGuidance = document.createElement('p');
  scopeGuidance.className = 'scope-guidance';
  const scopeActions = document.createElement('div');
  scopeActions.className = 'button-row';
  const acceptScopeCandidate = actionButton('Accept prepared candidate');
  acceptScopeCandidate.dataset['testid'] = 'accept-scope-candidate';
  const scopeStatus = document.createElement('p');
  scopeStatus.dataset['testid'] = 'scope-candidate-status';
  scopeStatus.setAttribute('role', 'status');
  scopeStatus.setAttribute('aria-live', 'polite');
  const scopeEvidence = evidenceDetails('Prepared baseline candidate', true);
  scopeControls.append(
    scopeLegend,
    scopeGuidance,
    scopeActions,
    scopeStatus,
    scopeEvidence.details,
  );

  const defaultControls = document.createElement('fieldset');
  defaultControls.className = 'collection-controls schema-default-controls';
  defaultControls.dataset['testid'] = 'schema-default-controls';
  const defaultLegend = document.createElement('legend');
  const defaultGuidance = document.createElement('p');
  defaultGuidance.className = 'scope-guidance';
  const defaultActions = document.createElement('div');
  defaultActions.className = 'button-row';
  const deriveDefaultCandidate = actionButton('Derive candidate');
  deriveDefaultCandidate.dataset['testid'] = 'derive-default-candidate';
  const cancelDefaultCandidate = actionButton('Cancel candidate');
  cancelDefaultCandidate.dataset['testid'] = 'cancel-default-candidate';
  const acceptDefaultCandidate = actionButton('Accept candidate');
  acceptDefaultCandidate.dataset['testid'] = 'accept-default-candidate';
  defaultActions.append(
    deriveDefaultCandidate,
    cancelDefaultCandidate,
    acceptDefaultCandidate,
  );
  const defaultStatus = document.createElement('p');
  defaultStatus.dataset['testid'] = 'default-candidate-status';
  defaultStatus.setAttribute('role', 'status');
  defaultStatus.setAttribute('aria-live', 'polite');
  const defaultEvidence = evidenceDetails(
    'Prepared schema-default candidate',
    true,
  );
  defaultControls.append(
    defaultLegend,
    defaultGuidance,
    defaultActions,
    defaultStatus,
    defaultEvidence.details,
  );

  const formHost = document.createElement('section');
  formHost.dataset['testid'] = 'form-preview';
  const formSurface = document.createElement('div');
  formSurface.className = 'form-surface';
  formSurface.append(formHost);
  preview.body.append(
    controls,
    previewHeading,
    decisionControl,
    collectionControls,
    fixedControls,
    serviceControls,
    scopeControls,
    defaultControls,
    formSurface,
  );

  const configuration = region('Schemas', 'configuration-panel');
  const editorInstructions = document.createElement('p');
  editorInstructions.id = 'standard-editor-instructions';
  editorInstructions.textContent =
    'Edit JSON, then validate or apply the complete configuration.';
  const configurationActions = document.createElement('div');
  configurationActions.className = 'configuration-actions';
  configurationActions.setAttribute('role', 'group');
  configurationActions.setAttribute('aria-label', 'Configuration actions');
  const validateButton = actionButton('Validate configuration');
  const applyButton = actionButton('Apply configuration');
  const cancelButton = actionButton('Cancel changes');
  const restoreButton = actionButton('Restore scenario configuration');
  configurationActions.append(
    validateButton,
    applyButton,
    cancelButton,
    restoreButton,
  );
  const configurationStatus = document.createElement('p');
  configurationStatus.dataset['testid'] = 'configuration-status';
  configurationStatus.setAttribute('role', 'status');
  configurationStatus.tabIndex = -1;
  const configurationDiagnostics = document.createElement('ul');
  configurationDiagnostics.dataset['testid'] = 'configuration-diagnostics';
  const confirmation = document.createElement('div');
  confirmation.dataset['testid'] = 'configuration-confirmation';
  const schemaPanel = document.createElement('div');
  const schemaHost = document.createElement('div');
  schemaHost.dataset['testid'] = 'schema-editor';
  schemaPanel.append(schemaHost);
  const uiSchemaPanel = document.createElement('div');
  const uiSchemaHost = document.createElement('div');
  uiSchemaHost.dataset['testid'] = 'ui-schema-editor';
  uiSchemaPanel.append(uiSchemaHost);
  const configurationTabList = document.createElement('div');
  const configurationTabs = new StandardTabs(
    'configuration',
    Object.freeze([
      Object.freeze({ id: 'schema', label: 'Schema', panel: schemaPanel }),
      Object.freeze({
        id: 'ui-schema',
        label: 'UI Schema',
        panel: uiSchemaPanel,
      }),
    ]),
    'schema',
  );
  configurationTabs.appendTo(configurationTabList);
  configuration.body.append(
    editorInstructions,
    configurationActions,
    configurationStatus,
    configurationDiagnostics,
    confirmation,
    configurationTabList,
    schemaPanel,
    uiSchemaPanel,
  );
  workspace.append(preview.section, configuration.section);

  const evidence = region('Observable evidence', 'evidence-panel');
  const statePanel = document.createElement('div');
  const valueDetails = evidenceDetails('Value', true);
  const baselineDetails = evidenceDetails('Baseline value', false);
  statePanel.append(valueDetails.details, baselineDetails.details);
  const definitionPanel = document.createElement('div');
  const definitionHost = document.createElement('div');
  definitionPanel.append(definitionHost);
  const runtimePanel = document.createElement('div');
  const snapshotHost = document.createElement('div');
  const historyHost = document.createElement('div');
  const pendingHost = document.createElement('div');
  runtimePanel.append(snapshotHost, historyHost, pendingHost);
  const diagnosticsPanel = document.createElement('div');
  const diagnosticsHost = document.createElement('div');
  diagnosticsPanel.append(diagnosticsHost);
  const integrationPanel = document.createElement('div');
  const evidenceTabList = document.createElement('div');
  const evidenceTabs = new StandardTabs(
    'evidence',
    Object.freeze([
      Object.freeze({ id: 'state', label: 'State', panel: statePanel }),
      Object.freeze({
        id: 'definition',
        label: 'Definition',
        panel: definitionPanel,
      }),
      Object.freeze({ id: 'runtime', label: 'Runtime', panel: runtimePanel }),
      Object.freeze({
        id: 'diagnostics',
        label: 'Diagnostics',
        panel: diagnosticsPanel,
      }),
      Object.freeze({
        id: 'integration',
        label: 'Integration',
        panel: integrationPanel,
      }),
    ]),
    'state',
  );
  evidenceTabs.appendTo(evidenceTabList);
  evidence.body.append(
    evidenceTabList,
    statePanel,
    definitionPanel,
    runtimePanel,
    diagnosticsPanel,
    integrationPanel,
  );

  root.replaceChildren(
    header,
    scenarioPanel.section,
    workspace,
    evidence.section,
  );

  const initialState = application.getState();
  const schemaEditor = new StandardJsonEditor({
    host: schemaHost,
    label: 'JSON Schema editor',
    value: initialState.schemaDraft,
    describedBy: editorInstructions.id,
    onChange: (value) => application.updateSchemaDraft(value),
  });
  const uiSchemaEditor = new StandardJsonEditor({
    host: uiSchemaHost,
    label: 'UI Schema editor',
    value: initialState.uiSchemaDraft,
    describedBy: editorInstructions.id,
    onChange: (value) => application.updateUiSchemaDraft(value),
  });
  renderIntegration(integrationPanel);

  let activeDefinition: StandardReferenceApplicationState['definition'];
  let activeRuntime = application.getRuntime();
  let renderer: StandardDomRenderer | undefined;
  let releaseRenderer: (() => void) | undefined;
  let configurationActionTrigger: HTMLButtonElement | undefined;
  let pendingOperationSignature: string | undefined;

  const render = (state: StandardReferenceApplicationState): void => {
    scenarioSelect.select.value = state.scenario.id;
    summary.textContent = state.scenario.summary;
    explanation.replaceChildren(
      ...state.scenario.explanation.flatMap((entry) => {
        const title = document.createElement('h3');
        title.textContent = entry.title;
        const body = document.createElement('p');
        body.textContent = entry.body;
        return [title, body];
      }),
    );
    compileStatus.textContent = state.definition
      ? 'Public core compilation succeeded.'
      : 'Public core compilation failed.';

    const runtime = application.getRuntime();
    if (state.definition !== activeDefinition || runtime !== activeRuntime) {
      releaseRenderer?.();
      renderer = undefined;
      activeDefinition = state.definition;
      activeRuntime = runtime;
      if (state.definition !== undefined && runtime !== undefined) {
        const nextRenderer = new StandardDomRenderer(
          formHost,
          state.definition,
          runtime,
          {
            embeddedCollectionControls:
              state.scenario.id === 'recursive-local-presentation',
            formId: `reference-standard-${state.scenario.id}`,
          },
        );
        renderer = nextRenderer;
        releaseRenderer = application.registerBindingCleanup(() =>
          nextRenderer.dispose(),
        );
      } else {
        formHost.replaceChildren();
        releaseRenderer = undefined;
      }
    }
    if (state.snapshot !== undefined) renderer?.reconcile(state.snapshot);

    setPressed(localeEn, state.locale === 'en');
    setPressed(localeEs, state.locale === 'es');
    setPressed(touchedIssues, state.validationVisibility === 'touched');
    setPressed(allIssues, state.validationVisibility === 'all');
    setPressed(confirmOperations, state.decisionMode === 'confirm');
    setPressed(rejectOperations, state.decisionMode === 'reject');
    setPressed(pendingOperations, state.decisionMode === 'pending');
    setInputValue(memberId.input, state.collectionDraftId);
    setInputValue(memberName.input, state.collectionDraftName);
    collectionControls.hidden = state.scenario.id !== 'stable-team';
    fixedControls.hidden = state.scenario.id !== 'fixed-values';
    const serviceDefinition = state.scenario.serviceValidation;
    serviceControls.hidden = serviceDefinition === undefined;
    if (serviceDefinition !== undefined) {
      serviceLegend.textContent = serviceDefinition.labels.heading;
      settleServiceValid.textContent = serviceDefinition.labels.settleValid;
      settleServiceInvalid.textContent = serviceDefinition.labels.settleInvalid;
      rejectService.textContent = serviceDefinition.labels.reject;
      throwNextService.textContent = serviceDefinition.labels.throwNext;
      retryService.textContent = serviceDefinition.labels.retry;
    }
    const hasPendingServiceRequest = state.serviceRequestEvidence.some(
      ({ status }) => status === 'pending',
    );
    settleServiceValid.disabled = !hasPendingServiceRequest;
    settleServiceInvalid.disabled = !hasPendingServiceRequest;
    rejectService.disabled = !hasPendingServiceRequest;
    serviceStatus.textContent = asyncValidationStatus(state);
    renderCopyable(
      serviceEvidence.body,
      'Copy service request evidence',
      serializeEvidence(state.serviceRequestEvidence),
      'json',
    );
    const scopeDefinition = state.scenario.scopeConfirmation;
    scopeControls.hidden = scopeDefinition === undefined;
    if (scopeDefinition !== undefined) {
      scopeLegend.textContent = scopeDefinition.labels.heading;
      scopeGuidance.textContent = scopeDefinition.labels.guidance;
      acceptScopeCandidate.textContent = scopeDefinition.labels.accept;
      scopeActions.replaceChildren(
        ...scopeDefinition.targets.map((target) => {
          const button = actionButton(target.label);
          button.dataset['testid'] = `prepare-scope-${target.id}`;
          button.addEventListener('click', () =>
            application.prepareScopeCandidate(target),
          );
          return button;
        }),
        acceptScopeCandidate,
      );
    }
    acceptScopeCandidate.disabled =
      state.scopeCandidate?.status !== 'available';
    scopeStatus.textContent = scopeCandidateStatus(state);
    renderCopyable(
      scopeEvidence.body,
      'Copy prepared baseline candidate',
      serializeEvidence(state.scopeCandidate),
      'json',
    );
    const defaultDefinition = state.scenario.schemaDefaults;
    defaultControls.hidden = defaultDefinition === undefined;
    if (defaultDefinition !== undefined) {
      defaultLegend.textContent = defaultDefinition.labels.heading;
      defaultGuidance.textContent = defaultDefinition.labels.guidance;
      deriveDefaultCandidate.textContent = defaultDefinition.labels.derive;
      cancelDefaultCandidate.textContent = defaultDefinition.labels.cancel;
      acceptDefaultCandidate.textContent = defaultDefinition.labels.accept;
    }
    cancelDefaultCandidate.disabled =
      state.defaultCandidate?.status !== 'available';
    acceptDefaultCandidate.disabled =
      state.defaultCandidate?.status !== 'available';
    defaultStatus.textContent = defaultCandidateStatus(state);
    renderCopyable(
      defaultEvidence.body,
      'Copy prepared schema-default candidate',
      serializeEvidence(state.defaultCandidate),
      'json',
    );
    const memberCount = readTeamMemberCount(state.value);
    moveFirstMember.disabled = memberCount < 2;
    removeLastMember.disabled = memberCount === 0;
    schemaEditor.setValue(state.schemaDraft);
    uiSchemaEditor.setValue(state.uiSchemaDraft);
    cancelButton.disabled = !state.draftModified;
    applyButton.disabled = !state.draftModified;
    restoreButton.disabled = !state.canRestoreOriginalConfiguration;
    configurationStatus.textContent = draftStatusLabel(state);
    configurationDiagnostics.replaceChildren(
      ...configurationDiagnosticRows(state),
    );
    renderConfigurationConfirmation(
      confirmation,
      state,
      application,
      configurationStatus,
      () => configurationActionTrigger,
      () => {
        configurationActionTrigger = undefined;
      },
    );

    renderCopyable(
      valueDetails.body,
      'Copy value',
      serializeEvidence(state.value),
      'json',
    );
    renderCopyable(
      baselineDetails.body,
      'Copy baseline value',
      serializeEvidence(state.baselineValue),
      'json',
    );
    renderCopyable(
      definitionHost,
      'Copy normalized definition',
      serializeEvidence(state.definition),
      'json',
    );
    renderCopyable(
      snapshotHost,
      'Copy runtime snapshot',
      serializeEvidence(state.snapshot),
      'json',
    );
    renderCopyable(
      historyHost,
      'Copy operation history',
      serializeEvidence(state.history),
      'json',
    );
    const nextPendingOperationSignature = state.pendingOperations
      .map(({ sequence }) => sequence)
      .join(',');
    if (nextPendingOperationSignature !== pendingOperationSignature) {
      pendingOperationSignature = nextPendingOperationSignature;
      renderPendingOperations(pendingHost, state, application);
    }
    renderCopyable(
      diagnosticsHost,
      'Copy diagnostics and issues',
      serializeEvidence({
        compiler: state.compilationDiagnostics,
        runtime: state.runtimeDiagnostics,
        action: state.actionDiagnostics,
        validationIssues:
          state.snapshot?.fields.flatMap(({ issues }) => issues) ?? [],
      }),
      'json',
    );
  };

  scenarioSelect.select.addEventListener('change', () => {
    application.selectScenario(scenarioSelect.select.value);
  });
  reset.addEventListener('click', () => application.resetScenario());
  commitBaseline.addEventListener('click', () => application.commitBaseline());
  localeEn.addEventListener('click', () => application.setLocale('en'));
  localeEs.addEventListener('click', () => application.setLocale('es'));
  touchedIssues.addEventListener('click', () =>
    application.setValidationVisibility('touched'),
  );
  allIssues.addEventListener('click', () =>
    application.setValidationVisibility('all'),
  );
  confirmOperations.addEventListener('click', () =>
    application.setDecisionMode('confirm'),
  );
  rejectOperations.addEventListener('click', () =>
    application.setDecisionMode('reject'),
  );
  pendingOperations.addEventListener('click', () =>
    application.setDecisionMode('pending'),
  );
  memberId.input.addEventListener('input', () =>
    application.updateCollectionDraftId(memberId.input.value),
  );
  memberName.input.addEventListener('input', () =>
    application.updateCollectionDraftName(memberName.input.value),
  );
  insertMember.addEventListener('click', () => application.insertTeamMember());
  moveFirstMember.addEventListener('click', () =>
    application.moveFirstTeamMemberLater(),
  );
  removeLastMember.addEventListener('click', () =>
    application.removeLastTeamMember(),
  );
  settleServiceValid.addEventListener('click', () =>
    application.resolveServiceValidation(true),
  );
  settleServiceInvalid.addEventListener('click', () =>
    application.resolveServiceValidation(false),
  );
  rejectService.addEventListener('click', () =>
    application.rejectServiceValidation(),
  );
  throwNextService.addEventListener('click', () =>
    application.throwOnNextValidation(),
  );
  retryService.addEventListener('click', () =>
    application.retryAsyncValidation(),
  );
  acceptScopeCandidate.addEventListener('click', () =>
    application.acceptScopeCandidate(),
  );
  deriveDefaultCandidate.addEventListener('click', () =>
    application.deriveDefaultCandidate(),
  );
  cancelDefaultCandidate.addEventListener('click', () =>
    application.cancelDefaultCandidate(),
  );
  acceptDefaultCandidate.addEventListener('click', () =>
    application.acceptDefaultCandidate(),
  );
  theme.select.addEventListener('change', () => {
    const value = theme.select.value;
    if (isThemeMode(value)) applyTheme(root, value);
  });
  validateButton.addEventListener('click', () => {
    application.validateConfiguration();
  });
  applyButton.addEventListener('click', () => {
    configurationActionTrigger = applyButton;
    application.applyConfiguration();
  });
  cancelButton.addEventListener('click', () => {
    application.cancelConfigurationChanges();
  });
  restoreButton.addEventListener('click', () => {
    configurationActionTrigger = restoreButton;
    application.restoreScenarioConfiguration();
  });

  applyTheme(root, 'auto');
  const unsubscribe = application.subscribeState(render);
  return () => {
    releaseRenderer?.();
    unsubscribe();
    configurationTabs.destroy();
    evidenceTabs.destroy();
    schemaEditor.destroy();
    uiSchemaEditor.destroy();
    application.dispose();
    clearTheme(root);
    root.replaceChildren();
  };
}

function region(
  label: string,
  id: string,
): {
  readonly section: HTMLElement;
  readonly body: HTMLElement;
} {
  const section = document.createElement('section');
  section.className = 'reference-region';
  section.dataset['region'] = id;
  const disclosure = document.createElement('details');
  disclosure.className = 'region-disclosure';
  disclosure.open = true;
  const summary = document.createElement('summary');
  summary.className = 'region-summary';
  const heading = document.createElement('h2');
  heading.className = 'eyebrow';
  heading.id = `${id}-heading`;
  heading.textContent = label;
  section.setAttribute('aria-labelledby', heading.id);
  const body = document.createElement('div');
  body.className = 'region-body';
  summary.append(heading);
  disclosure.append(summary, body);
  section.append(disclosure);
  return Object.freeze({ section, body });
}

function labelledSelect(
  id: string,
  labelText: string,
  options: readonly { readonly value: string; readonly label: string }[],
): { readonly label: HTMLLabelElement; readonly select: HTMLSelectElement } {
  const label = document.createElement('label');
  label.htmlFor = id;
  label.textContent = labelText;
  const select = document.createElement('select');
  select.id = id;
  for (const option of options) {
    const element = document.createElement('option');
    element.value = option.value;
    element.textContent = option.label;
    select.append(element);
  }
  return Object.freeze({ label, select });
}

function labelledInput(
  id: string,
  labelText: string,
): { readonly label: HTMLLabelElement; readonly input: HTMLInputElement } {
  const label = document.createElement('label');
  label.htmlFor = id;
  label.textContent = labelText;
  const input = document.createElement('input');
  input.id = id;
  input.type = 'text';
  return Object.freeze({ label, input });
}

function setPressed(button: HTMLButtonElement, pressed: boolean): void {
  button.setAttribute('aria-pressed', String(pressed));
}

function setInputValue(input: HTMLInputElement, value: string): void {
  if (input.value !== value) input.value = value;
}

function readTeamMemberCount(value: Readonly<object>): number {
  if (!('team' in value)) return 0;
  const team = value.team;
  return Array.isArray(team) ? team.length : 0;
}

function actionButton(label: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  return button;
}

function evidenceDetails(
  label: string,
  open: boolean,
): {
  readonly details: HTMLDetailsElement;
  readonly body: HTMLElement;
} {
  const details = document.createElement('details');
  details.open = open;
  const summary = document.createElement('summary');
  summary.textContent = label;
  const body = document.createElement('div');
  details.append(summary, body);
  return Object.freeze({ details, body });
}

function renderCopyable(
  host: HTMLElement,
  copyLabel: string,
  source: string,
  language: DisplayLanguage,
): void {
  const actions = document.createElement('div');
  actions.className = 'code-actions';
  const copy = actionButton(copyLabel);
  const status = document.createElement('span');
  status.setAttribute('role', 'status');
  copy.addEventListener('click', () => {
    void copyText(source).then((success) => {
      status.textContent = success ? 'Copied.' : 'Copy unavailable.';
    });
  });
  actions.append(copy, status);
  host.replaceChildren(actions, renderHighlightedCode(source, language));
}

function renderIntegration(host: HTMLElement): void {
  const heading = document.createElement('h3');
  heading.textContent = 'Build-checked integration excerpts';
  const notice = document.createElement('p');
  notice.textContent =
    'These exact Standard/DOM excerpts come from compiled source. Read them in order to follow the controlled integration from compilation and runtime creation through subscriptions, application decisions and deterministic cleanup. This private reference is not a public DOM adapter, compatibility certification or cross-browser claim.';
  const flow = document.createElement('ol');
  flow.className = 'integration-flow';
  flow.setAttribute('aria-label', 'Standard integration flow');
  for (const step of [
    ['Compile', 'normalize the active Schema and UI Schema.'],
    ['Create', 'supply complete application-owned state to the runtime.'],
    ['Subscribe', 'observe snapshots and receive operation requests.'],
    ['Decide', 'apply confirmed requests and publish the new complete root.'],
    ['Clean up', 'detach bindings and subscriptions before disposal.'],
  ] as const) {
    const item = document.createElement('li');
    const strong = document.createElement('strong');
    strong.textContent = `${step[0]}: `;
    item.append(strong, step[1]);
    flow.append(item);
  }
  host.append(heading, notice, flow);
  for (const id of standardSnippetOrder) {
    const explanation = standardSnippetExplanations[id];
    const details = evidenceDetails(explanation.label, false);
    const explanationList = document.createElement('dl');
    explanationList.className = 'snippet-explanation';
    appendExplanation(
      explanationList,
      'What it demonstrates',
      explanation.purpose,
    );
    appendExplanation(
      explanationList,
      'Application responsibility',
      explanation.responsibility,
    );
    const codeHost = document.createElement('div');
    renderCopyable(
      codeHost,
      `Copy ${explanation.label}`,
      referenceSnippets[id],
      'typescript',
    );
    details.body.append(explanationList, codeHost);
    host.append(details.details);
  }
}

function appendExplanation(
  list: HTMLDListElement,
  termText: string,
  descriptionText: string,
): void {
  const term = document.createElement('dt');
  term.textContent = termText;
  const description = document.createElement('dd');
  description.textContent = descriptionText;
  list.append(term, description);
}

function renderPendingOperations(
  host: HTMLElement,
  state: StandardReferenceApplicationState,
  application: StandardReferenceApplication,
): void {
  const heading = document.createElement('h3');
  heading.textContent = 'Pending operations';
  const list = document.createElement('ul');
  for (const entry of state.pendingOperations) {
    const item = document.createElement('li');
    const label = document.createElement('span');
    label.textContent = `Operation ${entry.sequence}`;
    const confirm = actionButton('Confirm pending operation');
    const reject = actionButton('Reject pending operation');
    confirm.addEventListener('click', () =>
      application.confirmPending(entry.sequence),
    );
    reject.addEventListener('click', () =>
      application.rejectPending(entry.sequence),
    );
    item.append(label, confirm, reject);
    list.append(item);
  }
  if (state.pendingOperations.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'No pending operations.';
    host.replaceChildren(heading, empty);
  } else {
    host.replaceChildren(heading, list);
  }
}

function draftStatusLabel(state: StandardReferenceApplicationState): string {
  switch (state.draftResult.status) {
    case 'unvalidated':
      return state.draftModified ? 'Configuration modified.' : 'Not validated.';
    case 'invalid-json':
      return 'Invalid JSON.';
    case 'compile-failed':
      return 'Configuration compilation failed.';
    case 'valid':
      return 'Configuration valid.';
  }
}

function asyncValidationStatus(
  state: StandardReferenceApplicationState,
): string {
  const asyncValidation = state.snapshot?.asyncValidation;
  if (asyncValidation === undefined) {
    return 'Asynchronous validation is not configured.';
  }
  if (asyncValidation.status === 'blocked') {
    return 'Blocked by synchronous validation.';
  }
  if (asyncValidation.status === 'pending') {
    return `Generation ${asyncValidation.generation} pending.`;
  }
  if (asyncValidation.status === 'failed') {
    return `Generation ${asyncValidation.generation} failed: ${asyncValidation.reason}.`;
  }
  return `Generation ${asyncValidation.generation} settled ${asyncValidation.valid ? 'valid' : 'invalid'}.`;
}

function scopeCandidateStatus(
  state: StandardReferenceApplicationState,
): string {
  const candidate = state.scopeCandidate;
  if (candidate === undefined) return 'No baseline candidate prepared.';
  if (candidate.status === 'unconfirmable') {
    return `${candidate.label}: unconfirmable; baseline and dirty state are unchanged.`;
  }
  if (candidate.status === 'accepted') {
    return `${candidate.label}: simulated persistence accepted; unrelated edits remain dirty.`;
  }
  return `${candidate.label}: candidate prepared; baseline and dirty state are unchanged until acceptance.`;
}

function defaultCandidateStatus(
  state: StandardReferenceApplicationState,
): string {
  const candidate = state.defaultCandidate;
  if (candidate === undefined) return 'No schema-default candidate derived.';
  if (candidate.status === 'available') {
    return 'Candidate derived; controlled value and operation history are unchanged.';
  }
  if (candidate.status === 'accepted') {
    return 'Candidate explicitly accepted as the application-owned value.';
  }
  if (candidate.status === 'cancelled') {
    return 'Candidate cancelled; controlled value remains unchanged.';
  }
  if (candidate.status === 'no-effect') {
    return 'Derivation has no effect because every supported default path is present.';
  }
  return 'Candidate derivation failed; controlled value remains unchanged.';
}

function configurationDiagnosticRows(
  state: StandardReferenceApplicationState,
): readonly HTMLLIElement[] {
  const rows: HTMLLIElement[] = [];
  for (const issue of state.draftResult.syntaxIssues) {
    const row = document.createElement('li');
    row.textContent = `${issue.document}: ${issue.message}`;
    rows.push(row);
  }
  for (const diagnostic of state.draftResult.diagnostics) {
    const row = document.createElement('li');
    row.textContent = `${diagnostic.code}: ${diagnostic.fallbackMessage ?? 'No fallback message provided.'}`;
    rows.push(row);
  }
  return Object.freeze(rows);
}

function renderConfigurationConfirmation(
  host: HTMLElement,
  state: StandardReferenceApplicationState,
  application: StandardReferenceApplication,
  status: HTMLElement,
  readTrigger: () => HTMLButtonElement | undefined,
  clearTrigger: () => void,
): void {
  if (state.pendingConfigurationAction === undefined) {
    host.replaceChildren();
    return;
  }
  const message = document.createElement('p');
  message.textContent =
    state.pendingConfigurationAction === 'apply'
      ? 'Applying this configuration will reset form state and history.'
      : 'Restoring the scenario configuration will discard local configuration and form state.';
  const confirm = actionButton(
    state.pendingConfigurationAction === 'apply'
      ? 'Apply and reset form'
      : 'Restore scenario',
  );
  const cancel = actionButton('Keep current state');
  confirm.addEventListener('click', () => {
    const completed = application.confirmConfigurationAction();
    clearTrigger();
    if (completed) queueMicrotask(() => status.focus());
  });
  cancel.addEventListener('click', () => {
    const trigger = readTrigger();
    application.cancelConfigurationAction();
    clearTrigger();
    queueMicrotask(() => trigger?.focus());
  });
  host.replaceChildren(message, confirm, cancel);
  queueMicrotask(() => confirm.focus());
}

function isThemeMode(value: string): value is ThemeMode {
  return value === 'auto' || value === 'light' || value === 'dark';
}

function applyTheme(root: HTMLElement, theme: ThemeMode): void {
  root.dataset['theme'] = theme;
  root.style.colorScheme = theme === 'auto' ? 'light dark' : theme;
  const documentRoot = root.ownerDocument.documentElement;
  if (theme === 'auto') delete documentRoot.dataset['theme'];
  else documentRoot.dataset['theme'] = theme;
  documentRoot.style.colorScheme = theme === 'auto' ? 'light dark' : theme;
}

function clearTheme(root: HTMLElement): void {
  delete root.dataset['theme'];
  root.style.removeProperty('color-scheme');
  const documentRoot = root.ownerDocument.documentElement;
  delete documentRoot.dataset['theme'];
  documentRoot.style.removeProperty('color-scheme');
}

const root = document.querySelector<HTMLElement>('#app');
if (root !== null) {
  const dispose = renderReferenceSkeleton(root);
  const handlePageHide = (): void => {
    window.removeEventListener('pagehide', handlePageHide);
    dispose();
  };
  window.addEventListener('pagehide', handlePageHide);
}
