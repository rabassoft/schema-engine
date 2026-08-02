import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  ViewChild,
  afterNextRender,
  computed,
  inject,
  signal,
  type ElementRef,
} from '@angular/core';
import {
  applyFormOperation,
  compileFormDefinition,
  type CompileFormDefinitionInput,
  type CompileFormResult,
  type Diagnostic,
  type FormOperation,
  type ValidationVisibility,
} from '@rabassoft/schema-engine';
import {
  SchemaFormDirective,
  type AngularControlledFormConfig,
} from '@rabassoft/schema-engine-angular';
import {
  referenceScenarios,
  type ReferenceScenario,
} from '@schema-engine-internal/reference-scenarios';

import { InspectorPanelComponent } from './inspector-panel.component.js';
import { ReferenceCodeExampleComponent } from './reference-code-example.component.js';
import { referenceSnippets } from './generated/reference-snippets.js';
import { serializeInspector } from './inspector-serialization.js';
import { ReferenceJsonEditorComponent } from './reference-json-editor.component.js';
import { REFERENCE_SCHEMA_VALIDATOR } from './reference-validator.js';
import {
  ReferenceTabsComponent,
  type ReferenceTab,
} from './reference-tabs.component.js';

export type OperationDecisionMode = 'confirm' | 'reject' | 'pending';
export type OperationHistoryStatus =
  'applied' | 'failed' | 'pending' | 'rejected';

export interface OperationHistoryEntry {
  readonly id: number;
  readonly operation: FormOperation;
  readonly status: OperationHistoryStatus;
  readonly diagnostics: readonly Diagnostic[];
}

interface ScenarioSelection {
  readonly scenario: ReferenceScenario;
  readonly compilation: CompileFormResult;
}

interface AppliedConfiguration {
  readonly input: CompileFormDefinitionInput;
  readonly schemaText: string;
  readonly uiSchemaText: string;
}

export type ConfigurationDraftStatus =
  'unvalidated' | 'invalid-json' | 'compile-failed' | 'valid';

export interface ConfigurationSyntaxIssue {
  readonly document: 'schema' | 'ui-schema';
  readonly message: 'Invalid JSON syntax.';
}

export interface ConfigurationDraftResult {
  readonly status: ConfigurationDraftStatus;
  readonly syntaxIssues: readonly ConfigurationSyntaxIssue[];
  readonly diagnostics: readonly Diagnostic[];
}

type PendingConfigurationAction = 'apply' | 'restore';

type DraftEvaluation =
  | {
      readonly success: false;
      readonly result: ConfigurationDraftResult;
    }
  | {
      readonly success: true;
      readonly result: ConfigurationDraftResult;
      readonly configuration: AppliedConfiguration;
      readonly compilation: Extract<CompileFormResult, { success: true }>;
    };

const initialScenario = referenceScenarios[0];
if (initialScenario === undefined) {
  throw new Error('The reference catalog must contain an initial scenario.');
}

const initialConfiguration = prepareConfiguration(initialScenario.compileInput);
const initialActiveConfiguration = prepareConfiguration(
  initialConfiguration.input,
);
const initialCompilation = compileFormDefinition(
  initialActiveConfiguration.input,
);

const snippetEntries = Object.freeze([
  Object.freeze({
    id: 'application-signals',
    label: 'Application signals excerpt',
    language: 'typescript' as const,
    purpose:
      'Defines the application-owned value, baseline, locale, visibility and decision state that drives the controlled form.',
    responsibility:
      'The application remains the source of truth. Signals are shell state; the runtime observes complete roots but does not own them.',
    source: referenceSnippets['application-signals'],
  }),
  Object.freeze({
    id: 'operation-decisions',
    label: 'Operation decisions excerpt',
    language: 'typescript' as const,
    purpose:
      'Receives operation requests from the form and makes confirmation, rejection and pending decisions explicit.',
    responsibility:
      'The application chooses when to apply an operation, owns pending history and publishes the resulting complete value after confirmation.',
    source: referenceSnippets['operation-decisions'],
  }),
  Object.freeze({
    id: 'controlled-form-template',
    label: 'Controlled form template excerpt',
    language: 'html' as const,
    purpose:
      'Connects the Angular directive to the current normalized configuration and exposes operation and diagnostic outputs.',
    responsibility:
      'The template is only the integration boundary. Persistence, submission and application-state mutation stay outside the directive.',
    source: referenceSnippets['controlled-form-template'],
  }),
]);

type ConfigurationTabId = 'schema' | 'ui-schema';
type EvidenceTabId =
  'state' | 'definition' | 'runtime' | 'diagnostics' | 'integration';

const configurationTabs = Object.freeze<readonly ReferenceTab[]>([
  Object.freeze({ id: 'schema', label: 'Schema' }),
  Object.freeze({ id: 'ui-schema', label: 'UI Schema' }),
]);

const evidenceTabs = Object.freeze<readonly ReferenceTab[]>([
  Object.freeze({ id: 'state', label: 'State' }),
  Object.freeze({ id: 'definition', label: 'Definition' }),
  Object.freeze({ id: 'runtime', label: 'Runtime' }),
  Object.freeze({ id: 'diagnostics', label: 'Diagnostics' }),
  Object.freeze({ id: 'integration', label: 'Integration' }),
]);

@Component({
  selector: 'reference-form',
  standalone: true,
  imports: [
    SchemaFormDirective,
    InspectorPanelComponent,
    ReferenceCodeExampleComponent,
    ReferenceJsonEditorComponent,
    ReferenceTabsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="reference-workspace"
      aria-labelledby="reference-scenario-heading"
    >
      <header class="reference-card scenario-card">
        <details class="card-disclosure" open>
          <summary class="collapsible-card-summary">
            <h2 class="eyebrow" id="reference-scenario-heading">
              Reference scenario
            </h2>
          </summary>
          <div class="collapsible-card-content scenario-card-content">
            <nav class="scenario-navigation" aria-label="Reference scenarios">
              <label for="scenario-selector">Scenario</label>
              <select
                id="scenario-selector"
                aria-describedby="scenario-summary"
                [value]="selectedScenario().id"
                (change)="selectFromEvent($event)"
              >
                @for (scenario of scenarios; track scenario.id) {
                  <option [value]="scenario.id">{{ scenario.title }}</option>
                }
              </select>
              <p id="scenario-summary">{{ selectedScenario().summary }}</p>
              <div class="explanation-grid">
                @for (entry of selectedScenario().explanation; track entry.id) {
                  <article>
                    <h3>{{ entry.title }}</h3>
                    <p>{{ entry.body }}</p>
                  </article>
                }
              </div>
            </nav>

            <p
              class="state-pill"
              role="status"
              aria-live="polite"
              data-testid="reference-state"
            >
              <span>{{ dirty() ? 'Modified' : 'Matches baseline' }}</span>
              <span>locale {{ locale() }}</span>
              <span>{{ validationVisibility() }} validation</span>
              <span>{{ pendingEntries().length }} pending</span>
            </p>
          </div>
        </details>
      </header>

      <div class="consumer-workspace">
        <section
          class="reference-card consumer-card"
          aria-labelledby="interactive-consumer-heading"
        >
          <details class="card-disclosure" open>
            <summary class="collapsible-card-summary">
              <h2 class="eyebrow" id="interactive-consumer-heading">
                Interactive consumer
              </h2>
            </summary>
            <div class="collapsible-card-content">
              <section
                class="workspace-panel preview-workspace"
                aria-labelledby="form-preview-heading"
              >
                <section
                  class="application-controls"
                  aria-labelledby="application-controls-heading"
                >
                  <div>
                    <h4 id="application-controls-heading">
                      Application controls
                    </h4>
                    <p class="scope-guidance">
                      Reset keeps the applied configuration and unapplied editor
                      text while restoring scenario and shell state.
                    </p>
                  </div>
                  <div class="button-row">
                    <button type="button" (click)="resetScenario()">
                      Reset scenario
                    </button>
                    <button type="button" (click)="commitBaseline()">
                      Commit baseline
                    </button>
                    <button
                      type="button"
                      [attr.aria-pressed]="locale() === 'en'"
                      (click)="setLocale('en')"
                    >
                      Locale en
                    </button>
                    <button
                      type="button"
                      [attr.aria-pressed]="locale() === 'es'"
                      (click)="setLocale('es')"
                    >
                      Locale es
                    </button>
                    <button
                      type="button"
                      [attr.aria-pressed]="validationVisibility() === 'touched'"
                      (click)="setValidationVisibility('touched')"
                    >
                      Touched issues
                    </button>
                    <button
                      type="button"
                      [attr.aria-pressed]="validationVisibility() === 'all'"
                      (click)="setValidationVisibility('all')"
                    >
                      All issues
                    </button>
                  </div>
                </section>

                <div class="preview-heading">
                  <div>
                    <h4 id="form-preview-heading">Form preview</h4>
                  </div>
                  <fieldset class="decision-control">
                    <legend>Operation decision</legend>
                    <button
                      type="button"
                      data-testid="decision-confirm"
                      [attr.aria-pressed]="decisionMode() === 'confirm'"
                      (click)="setDecisionMode('confirm')"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      data-testid="decision-reject"
                      [attr.aria-pressed]="decisionMode() === 'reject'"
                      (click)="setDecisionMode('reject')"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      data-testid="decision-pending"
                      [attr.aria-pressed]="decisionMode() === 'pending'"
                      (click)="setDecisionMode('pending')"
                    >
                      Pending
                    </button>
                  </fieldset>
                </div>

                @if (selectedScenario().id === 'stable-team') {
                  <fieldset class="collection-controls">
                    <legend>Team collection controls</legend>
                    <div class="field-grid">
                      <label for="team-item-id">New member ID</label>
                      <input
                        id="team-item-id"
                        [value]="collectionDraftId()"
                        (input)="updateCollectionDraftId($event)"
                      />
                      <label for="team-item-name">New member name</label>
                      <input
                        id="team-item-name"
                        [value]="collectionDraftName()"
                        (input)="updateCollectionDraftName($event)"
                      />
                    </div>
                    <div class="button-row">
                      <button type="button" (click)="insertTeamMember()">
                        Insert member at end
                      </button>
                      <button
                        type="button"
                        [disabled]="teamMembers().length < 2"
                        (click)="moveFirstTeamMemberLater()"
                      >
                        Move first member after second
                      </button>
                      <button
                        type="button"
                        [disabled]="teamMembers().length === 0"
                        (click)="removeLastTeamMember()"
                      >
                        Remove last member
                      </button>
                    </div>
                  </fieldset>
                }

                <div class="form-surface">
                  @for (mount of formMounts(); track mount.epoch) {
                    <!-- reference-snippet:start controlled-form-template -->
                    <form
                      aria-label="Selected schema form"
                      [schemaForm]="mount.config"
                      (schemaOperation)="handleOperation($event)"
                      (schemaDiagnostics)="recordRuntimeDiagnostics($event)"
                    ></form>
                    <!-- reference-snippet:end controlled-form-template -->
                  } @empty {
                    <p role="alert">
                      The selected scenario could not be compiled.
                    </p>
                  }
                </div>

                @if (pendingEntries().length > 0) {
                  <section
                    class="pending-card"
                    aria-labelledby="pending-heading"
                    data-testid="pending-list"
                  >
                    <h4 id="pending-heading">Pending intentions</h4>
                    @for (entry of pendingEntries(); track entry.id) {
                      <p>
                        {{ entry.operation.type }}
                        <button
                          type="button"
                          [attr.aria-label]="
                            'Confirm pending operation ' +
                            entry.id +
                            ': ' +
                            entry.operation.type
                          "
                          (click)="resolvePending(entry.id, 'confirm')"
                        >
                          Confirm pending
                        </button>
                        <button
                          type="button"
                          [attr.aria-label]="
                            'Reject pending operation ' +
                            entry.id +
                            ': ' +
                            entry.operation.type
                          "
                          (click)="resolvePending(entry.id, 'reject')"
                        >
                          Reject pending
                        </button>
                      </p>
                    }
                  </section>
                }
              </section>
            </div>
          </details>
        </section>

        <section
          class="reference-card tool-card tool-card--configuration schema-workspace"
          aria-labelledby="schemas-heading"
        >
          <details class="card-disclosure" open>
            <summary class="collapsible-card-summary">
              <h2 class="eyebrow" id="schemas-heading">Schemas</h2>
            </summary>
            <div class="collapsible-card-content">
              <div class="schema-heading">
                <p>
                  Edit, validate and apply JSON Schema and UI Schema while the
                  form preview remains visible alongside.
                </p>
              </div>
              <div
                #configurationStatus
                class="configuration-status"
                aria-live="polite"
                tabindex="-1"
              >
                <span
                  class="status-badge"
                  [attr.data-status]="draftResult().status"
                >
                  {{ draftStatusLabel() }}
                </span>
                @if (draftModified()) {
                  <span>Modified draft</span>
                } @else {
                  <span>Matches applied configuration</span>
                }
              </div>
              <div class="button-row configuration-actions">
                <button type="button" (click)="validateConfiguration()">
                  Validate configuration
                </button>
                <button
                  type="button"
                  [disabled]="!draftModified()"
                  (click)="applyConfiguration($event.currentTarget)"
                >
                  Apply configuration
                </button>
                <button
                  type="button"
                  [disabled]="!draftModified()"
                  (click)="cancelConfigurationChanges()"
                >
                  Cancel changes
                </button>
                <button
                  type="button"
                  [disabled]="!canRestoreOriginalConfiguration()"
                  (click)="restoreScenarioConfiguration($event.currentTarget)"
                >
                  Restore scenario configuration
                </button>
              </div>
              <p class="scope-guidance">
                Cancel restores only the last applied editor text. Restore
                reinstalls the scenario's original configuration and resets the
                form and shell state.
              </p>

              @if (pendingConfigurationAction(); as action) {
                <section
                  #configurationConfirmation
                  class="configuration-confirmation"
                  role="alertdialog"
                  aria-labelledby="configuration-confirmation-heading"
                  aria-describedby="configuration-confirmation-description"
                  aria-modal="false"
                  tabindex="-1"
                >
                  <h4 id="configuration-confirmation-heading">
                    Confirm configuration reset
                  </h4>
                  <p id="configuration-confirmation-description">
                    @if (action === 'apply') {
                      Applying this configuration will reset the form value,
                      baseline, operation history and shell controls.
                    } @else {
                      Restoring the scenario will discard active configuration,
                      draft text and current form state.
                    }
                  </p>
                  <div class="button-row">
                    <button
                      type="button"
                      (click)="confirmConfigurationAction()"
                    >
                      {{
                        action === 'apply'
                          ? 'Apply and reset form'
                          : 'Restore scenario'
                      }}
                    </button>
                    <button type="button" (click)="cancelConfigurationAction()">
                      Keep current state
                    </button>
                  </div>
                </section>
              }

              @if (
                draftResult().syntaxIssues.length > 0 ||
                draftResult().diagnostics.length > 0
              ) {
                <section
                  class="draft-diagnostics"
                  aria-labelledby="draft-diagnostics-heading"
                >
                  <h4 id="draft-diagnostics-heading">
                    Configuration diagnostics
                  </h4>
                  <ol>
                    @for (
                      issue of draftResult().syntaxIssues;
                      track issue.document
                    ) {
                      <li class="diagnostic-row diagnostic-row--error">
                        <span class="diagnostic-severity">Error</span>
                        <code>JSON syntax</code>
                        <span>{{ issue.message }}</span>
                        <button
                          type="button"
                          (click)="focusConfigurationDocument(issue.document)"
                        >
                          Focus
                          {{
                            issue.document === 'schema'
                              ? 'JSON Schema'
                              : 'UI Schema'
                          }}
                          editor
                        </button>
                      </li>
                    }
                    @for (
                      diagnostic of draftResult().diagnostics;
                      track $index
                    ) {
                      <li
                        class="diagnostic-row"
                        [class.diagnostic-row--error]="
                          diagnostic.severity === 'error'
                        "
                        [class.diagnostic-row--warning]="
                          diagnostic.severity === 'warning'
                        "
                      >
                        <span class="diagnostic-severity">
                          {{ diagnostic.severity }}
                        </span>
                        <code>{{ diagnostic.code }}</code>
                        <span>{{ diagnosticMessage(diagnostic) }}</span>
                        @if (diagnostic.documentPath; as path) {
                          <span>Document path {{ formatPath(path) }}</span>
                        }
                        @if (diagnostic.dataPath; as path) {
                          <span>Data path {{ formatPath(path) }}</span>
                        }
                        @if (diagnostic.source !== 'runtime') {
                          <button
                            type="button"
                            (click)="
                              focusConfigurationDocument(diagnostic.source)
                            "
                          >
                            Focus {{ diagnostic.source }} editor
                          </button>
                        }
                      </li>
                    }
                  </ol>
                </section>
              }
              <div class="tab-interface tab-interface--configuration">
                <reference-tabs
                  tabSetId="configuration"
                  label="Schema documents"
                  [tabs]="configurationTabs"
                  [activeId]="configurationTab()"
                  (activeIdChange)="setConfigurationTab($event)"
                />

                @switch (configurationTab()) {
                  @case ('schema') {
                    <section
                      class="tab-panel"
                      id="configuration-panel-schema"
                      role="tabpanel"
                      aria-labelledby="configuration-tab-schema"
                      tabindex="0"
                    >
                      <h4>JSON Schema draft</h4>
                      <p id="schema-editor-help">
                        Edit JSON, then validate or apply the complete
                        configuration.
                      </p>
                      <reference-json-editor
                        #schemaEditor
                        label="JSON Schema editor"
                        instructionsId="schema-editor-help"
                        [value]="schemaDraft()"
                        (valueChange)="updateSchemaDraft($event)"
                      />
                    </section>
                  }
                  @case ('ui-schema') {
                    <section
                      class="tab-panel"
                      id="configuration-panel-ui-schema"
                      role="tabpanel"
                      aria-labelledby="configuration-tab-ui-schema"
                      tabindex="0"
                    >
                      <h4>UI Schema draft</h4>
                      <p id="ui-schema-editor-help">
                        Presentation metadata is compiled together with the
                        current JSON Schema draft.
                      </p>
                      <reference-json-editor
                        #uiSchemaEditor
                        label="UI Schema editor"
                        instructionsId="ui-schema-editor-help"
                        [value]="uiSchemaDraft()"
                        (valueChange)="updateUiSchemaDraft($event)"
                      />
                    </section>
                  }
                }
              </div>
            </div>
          </details>
        </section>
      </div>

      <section
        class="reference-card tool-card tool-card--evidence"
        aria-labelledby="observable-evidence-heading"
      >
        <details class="card-disclosure" open>
          <summary class="collapsible-card-summary">
            <h2 class="eyebrow" id="observable-evidence-heading">
              Observable evidence
            </h2>
          </summary>
          <div class="collapsible-card-content">
            <div class="tab-interface tab-interface--evidence">
              <reference-tabs
                tabSetId="evidence"
                label="Evidence views"
                [tabs]="evidenceTabs"
                [activeId]="evidenceTab()"
                (activeIdChange)="setEvidenceTab($event)"
              />

              @switch (evidenceTab()) {
                @case ('state') {
                  <section
                    class="tab-panel"
                    id="evidence-panel-state"
                    role="tabpanel"
                    aria-labelledby="evidence-tab-state"
                    tabindex="0"
                  >
                    <reference-inspector-panel
                      label="Value"
                      testId="inspector-value"
                      [expanded]="true"
                      [value]="value()"
                    />
                    <reference-inspector-panel
                      label="Baseline value"
                      testId="inspector-baseline"
                      [value]="baselineValue()"
                    />
                  </section>
                }
                @case ('definition') {
                  <section
                    class="tab-panel"
                    id="evidence-panel-definition"
                    role="tabpanel"
                    aria-labelledby="evidence-tab-definition"
                    tabindex="0"
                  >
                    <reference-inspector-panel
                      label="Normalized definition"
                      testId="inspector-definition"
                      [value]="definition()"
                    />
                  </section>
                }
                @case ('runtime') {
                  <section
                    class="tab-panel"
                    id="evidence-panel-runtime"
                    role="tabpanel"
                    aria-labelledby="evidence-tab-runtime"
                    tabindex="0"
                  >
                    <reference-inspector-panel
                      label="Runtime snapshot"
                      testId="inspector-snapshot"
                      [value]="runtimeSnapshot()"
                    />
                    <reference-inspector-panel
                      label="Operation history"
                      testId="inspector-history"
                      [value]="history()"
                    />
                  </section>
                }
                @case ('diagnostics') {
                  <section
                    class="tab-panel diagnostics-panel"
                    id="evidence-panel-diagnostics"
                    role="tabpanel"
                    aria-labelledby="evidence-tab-diagnostics"
                    tabindex="0"
                  >
                    <reference-inspector-panel
                      label="Compiler diagnostics"
                      testId="inspector-compiler-diagnostics"
                      [value]="compilerDiagnostics()"
                    />
                    <reference-inspector-panel
                      label="Runtime diagnostics"
                      testId="inspector-runtime-diagnostics"
                      [value]="runtimeDiagnostics()"
                    />
                    <reference-inspector-panel
                      label="JSON Schema validation issues"
                      testId="inspector-issues"
                      [value]="validationIssues()"
                    />
                    @if (activeConfigurationDiffersFromOriginal()) {
                      <p class="validation-caveat" role="note">
                        The active configuration differs from the scenario
                        original. These issues come from the active Draft
                        2020-12 schema through the reusable synchronous Ajv
                        integration.
                      </p>
                    }
                  </section>
                }
                @case ('integration') {
                  <section
                    class="tab-panel integration-panel"
                    id="evidence-panel-integration"
                    role="tabpanel"
                    aria-labelledby="evidence-tab-integration"
                    tabindex="0"
                  >
                    <h4 id="snippets-heading">
                      Build-checked integration excerpts
                    </h4>
                    <p>
                      These excerpts are generated from marked regions in the
                      compiled reference-form source. Read them in order to
                      follow the controlled integration from application-owned
                      state, through operation decisions, to the Angular
                      template boundary.
                    </p>
                    <ol
                      class="integration-flow"
                      aria-label="Angular integration flow"
                    >
                      <li>
                        <strong>Own state:</strong> keep value and baseline in
                        the application.
                      </li>
                      <li>
                        <strong>Decide operations:</strong> confirm, reject or
                        defer every request.
                      </li>
                      <li>
                        <strong>Bind the form:</strong> pass configuration in
                        and receive events out.
                      </li>
                    </ol>
                    @defer {
                      @for (snippet of snippets; track snippet.id) {
                        <article [attr.data-testid]="'snippet-' + snippet.id">
                          <h5>{{ snippet.label }}</h5>
                          <dl class="snippet-explanation">
                            <dt>What it demonstrates</dt>
                            <dd>{{ snippet.purpose }}</dd>
                            <dt>Application responsibility</dt>
                            <dd>{{ snippet.responsibility }}</dd>
                          </dl>
                          <reference-code-example
                            [label]="snippet.label"
                            [language]="snippet.language"
                            [source]="snippet.source"
                          />
                        </article>
                      }
                    } @placeholder {
                      <p>Loading highlighted integration excerpts…</p>
                    }
                  </section>
                }
              }
            </div>
          </div>
        </details>
      </section>
    </section>
  `,
})
export class ReferenceFormComponent {
  private readonly injector = inject(Injector);
  private readonly validator = inject(REFERENCE_SCHEMA_VALIDATOR);
  readonly scenarios = referenceScenarios;
  readonly snippets = snippetEntries;
  readonly configurationTabs = configurationTabs;
  readonly evidenceTabs = evidenceTabs;
  // reference-snippet:start application-signals
  private readonly selectionState = signal<ScenarioSelection>(
    Object.freeze({
      scenario: initialScenario,
      compilation: initialCompilation,
    }),
  );
  private readonly valueState = signal<Readonly<object>>(
    initialScenario.initialState.value,
  );
  private readonly baselineValueState = signal<Readonly<object>>(
    initialScenario.initialState.baselineValue,
  );
  private readonly localeState = signal(initialScenario.initialState.locale);
  private readonly visibilityState = signal<ValidationVisibility>(
    initialScenario.initialState.validationVisibility,
  );
  private readonly decisionModeState = signal<OperationDecisionMode>('confirm');
  private readonly historyState = signal<readonly OperationHistoryEntry[]>(
    Object.freeze([]),
  );
  private readonly runtimeDiagnosticsState = signal<readonly Diagnostic[]>(
    Object.freeze([]),
  );
  // reference-snippet:end application-signals
  private readonly formState = signal<SchemaFormDirective<object> | undefined>(
    undefined,
  );
  private readonly collectionDraftIdState = signal('new-member');
  private readonly collectionDraftNameState = signal('New member');
  private readonly activeConfigurationState = signal<AppliedConfiguration>(
    initialActiveConfiguration,
  );
  private readonly originalConfigurationState =
    signal<AppliedConfiguration>(initialConfiguration);
  private readonly schemaDraftState = signal(
    initialActiveConfiguration.schemaText,
  );
  private readonly uiSchemaDraftState = signal(
    initialActiveConfiguration.uiSchemaText,
  );
  private readonly draftResultState =
    signal<ConfigurationDraftResult>(emptyDraftResult());
  private readonly runtimeEpochState = signal(0);
  private readonly pendingConfigurationActionState = signal<
    PendingConfigurationAction | undefined
  >(undefined);
  private configurationActionTrigger: HTMLElement | undefined;
  private readonly configurationTabState = signal<ConfigurationTabId>('schema');
  private readonly evidenceTabState = signal<EvidenceTabId>('state');
  private nextHistoryId = 1;

  readonly selectedScenario = computed(() => this.selectionState().scenario);
  readonly compilation = computed(() => this.selectionState().compilation);
  readonly compilerDiagnostics = computed(() => this.compilation().diagnostics);
  readonly definition = computed(() => {
    const compilation = this.compilation();
    return compilation.success ? compilation.definition : undefined;
  });
  readonly value = this.valueState.asReadonly();
  readonly baselineValue = this.baselineValueState.asReadonly();
  readonly locale = this.localeState.asReadonly();
  readonly validationVisibility = this.visibilityState.asReadonly();
  readonly decisionMode = this.decisionModeState.asReadonly();
  readonly history = this.historyState.asReadonly();
  readonly runtimeDiagnostics = this.runtimeDiagnosticsState.asReadonly();
  readonly collectionDraftId = this.collectionDraftIdState.asReadonly();
  readonly collectionDraftName = this.collectionDraftNameState.asReadonly();
  readonly activeCompileInput = computed(
    () => this.activeConfigurationState().input,
  );
  readonly schemaDraft = this.schemaDraftState.asReadonly();
  readonly uiSchemaDraft = this.uiSchemaDraftState.asReadonly();
  readonly draftResult = this.draftResultState.asReadonly();
  readonly runtimeEpoch = this.runtimeEpochState.asReadonly();
  readonly pendingConfigurationAction =
    this.pendingConfigurationActionState.asReadonly();
  readonly configurationTab = this.configurationTabState.asReadonly();
  readonly evidenceTab = this.evidenceTabState.asReadonly();
  readonly draftModified = computed(() => {
    const active = this.activeConfigurationState();
    return (
      this.schemaDraft() !== active.schemaText ||
      this.uiSchemaDraft() !== active.uiSchemaText
    );
  });
  readonly activeConfigurationDiffersFromOriginal = computed(() => {
    const original = this.originalConfigurationState();
    const active = this.activeConfigurationState();
    return (
      active.schemaText !== original.schemaText ||
      active.uiSchemaText !== original.uiSchemaText
    );
  });
  readonly canRestoreOriginalConfiguration = computed(() => {
    const original = this.originalConfigurationState();
    const active = this.activeConfigurationState();
    return (
      active.schemaText !== original.schemaText ||
      active.uiSchemaText !== original.uiSchemaText ||
      this.schemaDraft() !== original.schemaText ||
      this.uiSchemaDraft() !== original.uiSchemaText
    );
  });
  readonly draftStatusLabel = computed(() => {
    switch (this.draftResult().status) {
      case 'unvalidated':
        return 'Not validated';
      case 'invalid-json':
        return 'Invalid JSON';
      case 'compile-failed':
        return 'Compilation failed';
      case 'valid':
        return 'Valid';
    }
  });
  readonly teamMembers = computed(() => readTeamMembers(this.value()));
  readonly pendingEntries = computed(() =>
    Object.freeze(this.history().filter(({ status }) => status === 'pending')),
  );
  readonly dirty = computed(
    () =>
      serializeInspector(this.value()) !==
      serializeInspector(this.baselineValue()),
  );
  readonly validationIssues = computed(
    () =>
      this.validator.validate(this.activeCompileInput().schema, this.value())
        .issues,
  );
  readonly formConfig = computed<
    AngularControlledFormConfig<object> | undefined
  >(() => {
    const selection = this.selectionState();
    if (!selection.compilation.success) return undefined;
    return Object.freeze({
      formId: `reference-${selection.scenario.id}`,
      definition: selection.compilation.definition,
      schema: this.activeCompileInput().schema,
      value: this.value(),
      baselineValue: this.baselineValue(),
      locale: this.locale(),
      validator: this.validator,
      validationVisibility: this.validationVisibility(),
    });
  });
  readonly formMounts = computed(() => {
    const config = this.formConfig();
    if (config === undefined) return Object.freeze([]);
    return Object.freeze([
      Object.freeze({ epoch: this.runtimeEpoch(), config }),
    ]);
  });
  readonly runtimeSnapshot = computed(() => this.formDirective?.snapshot());

  @ViewChild(SchemaFormDirective)
  private get formDirective(): SchemaFormDirective<object> | undefined {
    return this.formState();
  }

  private set formDirective(value: SchemaFormDirective<object> | undefined) {
    this.formState.set(value);
  }

  @ViewChild('schemaEditor')
  private schemaEditor?: ReferenceJsonEditorComponent;

  @ViewChild('uiSchemaEditor')
  private uiSchemaEditor?: ReferenceJsonEditorComponent;

  @ViewChild('configurationConfirmation')
  private configurationConfirmation?: ElementRef<HTMLElement>;

  @ViewChild('configurationStatus')
  private configurationStatus?: ElementRef<HTMLElement>;

  selectScenario(id: string): void {
    const scenario = this.scenarios.find((candidate) => candidate.id === id);
    if (scenario !== undefined) this.loadScenario(scenario);
  }

  loadScenario(scenario: ReferenceScenario): void {
    const original = prepareConfiguration(scenario.compileInput);
    const configuration = prepareConfiguration(original.input);
    const compilation = compileFormDefinition(configuration.input);
    this.selectionState.set(Object.freeze({ scenario, compilation }));
    this.originalConfigurationState.set(original);
    this.activeConfigurationState.set(configuration);
    this.schemaDraftState.set(configuration.schemaText);
    this.uiSchemaDraftState.set(configuration.uiSchemaText);
    this.draftResultState.set(emptyDraftResult());
    this.pendingConfigurationActionState.set(undefined);
    this.runtimeEpochState.update((epoch) => epoch + 1);
    this.resetApplicationState(scenario);
  }

  resetScenario(): void {
    this.resetApplicationState(this.selectedScenario());
  }

  commitBaseline(): void {
    this.baselineValueState.set(this.value());
  }

  replaceValue(value: Readonly<object>): void {
    this.valueState.set(value);
  }

  setLocale(locale: string): void {
    this.localeState.set(locale);
  }

  setValidationVisibility(visibility: ValidationVisibility): void {
    this.visibilityState.set(visibility);
  }

  setDecisionMode(mode: OperationDecisionMode): void {
    this.decisionModeState.set(mode);
  }

  setConfigurationTab(id: string): void {
    if (isConfigurationTabId(id)) this.configurationTabState.set(id);
  }

  setEvidenceTab(id: string): void {
    if (isEvidenceTabId(id)) this.evidenceTabState.set(id);
  }

  updateSchemaDraft(value: string): void {
    this.schemaDraftState.set(value);
    this.invalidateDraftResult();
  }

  updateUiSchemaDraft(value: string): void {
    this.uiSchemaDraftState.set(value);
    this.invalidateDraftResult();
  }

  validateConfiguration(): boolean {
    const evaluation = evaluateDraft(
      this.schemaDraft(),
      this.uiSchemaDraft(),
      this.activeCompileInput(),
    );
    this.draftResultState.set(evaluation.result);
    return evaluation.success;
  }

  applyConfiguration(trigger?: EventTarget | null): boolean {
    const evaluation = evaluateDraft(
      this.schemaDraft(),
      this.uiSchemaDraft(),
      this.activeCompileInput(),
    );
    this.draftResultState.set(evaluation.result);
    if (!evaluation.success) return false;
    if (this.requiresApplicationResetConfirmation()) {
      this.rememberConfigurationActionTrigger(trigger);
      this.pendingConfigurationActionState.set('apply');
      this.focusConfigurationConfirmationAfterRender();
      return false;
    }
    this.installConfiguration(evaluation.configuration, evaluation.compilation);
    return true;
  }

  cancelConfigurationChanges(): void {
    const active = this.activeConfigurationState();
    this.schemaDraftState.set(active.schemaText);
    this.uiSchemaDraftState.set(active.uiSchemaText);
    this.draftResultState.set(emptyDraftResult());
    this.pendingConfigurationActionState.set(undefined);
  }

  restoreScenarioConfiguration(trigger?: EventTarget | null): void {
    if (!this.canRestoreOriginalConfiguration()) return;
    this.rememberConfigurationActionTrigger(trigger);
    this.pendingConfigurationActionState.set('restore');
    this.focusConfigurationConfirmationAfterRender();
  }

  confirmConfigurationAction(): boolean {
    const action = this.pendingConfigurationAction();
    if (action === undefined) return false;
    if (action === 'apply') {
      const evaluation = evaluateDraft(
        this.schemaDraft(),
        this.uiSchemaDraft(),
        this.activeCompileInput(),
      );
      this.draftResultState.set(evaluation.result);
      if (!evaluation.success) {
        this.pendingConfigurationActionState.set(undefined);
        return false;
      }
      this.installConfiguration(
        evaluation.configuration,
        evaluation.compilation,
      );
      return true;
    }

    const original = this.originalConfigurationState();
    const restored = prepareConfiguration(original.input);
    const compilation = compileFormDefinition(restored.input);
    if (!compilation.success) {
      this.draftResultState.set(
        Object.freeze({
          status: 'compile-failed',
          syntaxIssues: Object.freeze([]),
          diagnostics: compilation.diagnostics,
        }),
      );
      this.pendingConfigurationActionState.set(undefined);
      return false;
    }
    this.installConfiguration(restored, compilation);
    return true;
  }

  cancelConfigurationAction(): void {
    this.pendingConfigurationActionState.set(undefined);
    this.returnConfigurationActionFocusAfterRender();
  }

  protected focusConfigurationDocument(document: 'schema' | 'ui-schema'): void {
    this.configurationTabState.set(document);
    afterNextRender(
      () => {
        if (document === 'schema') this.schemaEditor?.focus();
        else this.uiSchemaEditor?.focus();
      },
      { injector: this.injector },
    );
  }

  protected diagnosticMessage(diagnostic: Diagnostic): string {
    return diagnostic.fallbackMessage ?? 'No fallback message provided.';
  }

  protected formatPath(path: readonly (string | number)[]): string {
    return JSON.stringify(path);
  }

  // reference-snippet:start operation-decisions
  handleOperation(operation: FormOperation): void {
    switch (this.decisionMode()) {
      case 'confirm':
        this.applyAndAppend(operation);
        return;
      case 'reject':
        this.appendHistory(operation, 'rejected', []);
        return;
      case 'pending':
        this.appendHistory(operation, 'pending', []);
    }
  }

  resolvePending(id: number, decision: 'confirm' | 'reject'): void {
    const entry = this.history().find(
      (candidate) => candidate.id === id && candidate.status === 'pending',
    );
    if (entry === undefined) return;
    if (decision === 'reject') {
      this.replaceHistory(entry.id, 'rejected', []);
      return;
    }
    const definition = this.definition();
    if (definition === undefined) return;
    const applied = applyFormOperation(
      definition,
      this.value(),
      entry.operation,
    );
    if (applied.success) this.valueState.set(applied.value);
    this.replaceHistory(
      entry.id,
      applied.success ? 'applied' : 'failed',
      applied.diagnostics,
    );
  }
  // reference-snippet:end operation-decisions

  insertTeamMember(): void {
    const id = this.collectionDraftId().trim();
    const name = this.collectionDraftName().trim();
    if (id.length === 0 || name.length === 0) return;
    this.formDirective?.requestInsertItem(
      ['team'],
      id,
      { id, name, role: 'Member' },
      { kind: 'end' },
    );
  }

  moveFirstTeamMemberLater(): void {
    const [first, second] = this.teamMembers();
    if (first === undefined || second === undefined) return;
    this.formDirective?.requestMoveItem(
      { collectionPath: ['team'], itemId: first.id },
      { kind: 'after', itemId: second.id },
    );
  }

  removeLastTeamMember(): void {
    const last = this.teamMembers().at(-1);
    if (last === undefined) return;
    this.formDirective?.requestRemoveItem({
      collectionPath: ['team'],
      itemId: last.id,
    });
  }

  recordRuntimeDiagnostics(diagnostics: readonly Diagnostic[]): void {
    this.runtimeDiagnosticsState.set(Object.freeze([...diagnostics]));
  }

  protected selectFromEvent(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLSelectElement) this.selectScenario(target.value);
  }

  protected updateCollectionDraftId(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.collectionDraftIdState.set(target.value);
    }
  }

  protected updateCollectionDraftName(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.collectionDraftNameState.set(target.value);
    }
  }

  private applyAndAppend(operation: FormOperation): void {
    const definition = this.definition();
    if (definition === undefined) return;
    const applied = applyFormOperation(definition, this.value(), operation);
    if (applied.success) this.valueState.set(applied.value);
    this.appendHistory(
      operation,
      applied.success ? 'applied' : 'failed',
      applied.diagnostics,
    );
  }

  private appendHistory(
    operation: FormOperation,
    status: OperationHistoryStatus,
    diagnostics: readonly Diagnostic[],
  ): void {
    const entry = Object.freeze({
      id: this.nextHistoryId,
      operation,
      status,
      diagnostics: Object.freeze([...diagnostics]),
    });
    this.nextHistoryId += 1;
    this.historyState.update((history) => Object.freeze([...history, entry]));
  }

  private replaceHistory(
    id: number,
    status: OperationHistoryStatus,
    diagnostics: readonly Diagnostic[],
  ): void {
    this.historyState.update((history) =>
      Object.freeze(
        history.map((entry) =>
          entry.id === id
            ? Object.freeze({
                ...entry,
                status,
                diagnostics: Object.freeze([...diagnostics]),
              })
            : entry,
        ),
      ),
    );
  }

  private clearOperationState(): void {
    this.historyState.set(Object.freeze([]));
    this.runtimeDiagnosticsState.set(Object.freeze([]));
    this.nextHistoryId = 1;
  }

  private invalidateDraftResult(): void {
    this.draftResultState.set(emptyDraftResult());
    this.pendingConfigurationActionState.set(undefined);
  }

  private rememberConfigurationActionTrigger(
    trigger: EventTarget | null | undefined,
  ): void {
    this.configurationActionTrigger =
      trigger instanceof HTMLElement ? trigger : undefined;
  }

  private focusConfigurationConfirmationAfterRender(): void {
    afterNextRender(
      () =>
        this.configurationConfirmation?.nativeElement
          .querySelector<HTMLElement>('button')
          ?.focus(),
      { injector: this.injector },
    );
  }

  private returnConfigurationActionFocusAfterRender(): void {
    const trigger = this.configurationActionTrigger;
    this.configurationActionTrigger = undefined;
    afterNextRender(() => trigger?.focus(), { injector: this.injector });
  }

  private focusConfigurationStatusAfterRender(): void {
    afterNextRender(() => this.configurationStatus?.nativeElement.focus(), {
      injector: this.injector,
    });
  }

  private requiresApplicationResetConfirmation(): boolean {
    return this.dirty() || this.history().length > 0;
  }

  private installConfiguration(
    configuration: AppliedConfiguration,
    compilation: Extract<CompileFormResult, { success: true }>,
  ): void {
    this.activeConfigurationState.set(configuration);
    this.selectionState.update((selection) =>
      Object.freeze({ ...selection, compilation }),
    );
    this.schemaDraftState.set(configuration.schemaText);
    this.uiSchemaDraftState.set(configuration.uiSchemaText);
    this.draftResultState.set(
      Object.freeze({
        status: 'valid',
        syntaxIssues: Object.freeze([]),
        diagnostics: compilation.diagnostics,
      }),
    );
    this.pendingConfigurationActionState.set(undefined);
    this.configurationActionTrigger = undefined;
    this.runtimeEpochState.update((epoch) => epoch + 1);
    this.resetApplicationState(this.selectedScenario());
    this.focusConfigurationStatusAfterRender();
  }

  private resetApplicationState(scenario: ReferenceScenario): void {
    this.valueState.set(scenario.initialState.value);
    this.baselineValueState.set(scenario.initialState.baselineValue);
    this.localeState.set(scenario.initialState.locale);
    this.visibilityState.set(scenario.initialState.validationVisibility);
    this.decisionModeState.set('confirm');
    this.collectionDraftIdState.set('new-member');
    this.collectionDraftNameState.set('New member');
    this.clearOperationState();
  }
}

interface TeamMember {
  readonly id: string;
}

function readTeamMembers(value: Readonly<object>): readonly TeamMember[] {
  const team = (value as { readonly team?: unknown }).team;
  if (!isUnknownArray(team)) return Object.freeze([]);
  return Object.freeze(
    team.filter(
      (member): member is TeamMember =>
        typeof member === 'object' &&
        member !== null &&
        'id' in member &&
        typeof member.id === 'string',
    ),
  );
}

function isUnknownArray(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

function isConfigurationTabId(value: string): value is ConfigurationTabId {
  return value === 'schema' || value === 'ui-schema';
}

function isEvidenceTabId(value: string): value is EvidenceTabId {
  return (
    value === 'state' ||
    value === 'definition' ||
    value === 'runtime' ||
    value === 'diagnostics' ||
    value === 'integration'
  );
}

function prepareConfiguration(
  input: CompileFormDefinitionInput,
): AppliedConfiguration {
  const copiedInput = JSON.parse(
    formatJson(input),
  ) as CompileFormDefinitionInput;
  const schemaText = formatJson(copiedInput.schema);
  const uiSchemaText = formatJson(copiedInput.uiSchema ?? {});
  return Object.freeze({
    input: freezeJson({
      ...copiedInput,
      schema: JSON.parse(schemaText) as unknown,
      uiSchema: JSON.parse(uiSchemaText) as unknown,
    }),
    schemaText,
    uiSchemaText,
  });
}

function formatJson(value: unknown): string {
  const serialized = JSON.stringify(value, undefined, 2);
  if (serialized === undefined) {
    throw new Error('Reference configuration must be JSON serializable.');
  }
  return serialized;
}

function emptyDraftResult(): ConfigurationDraftResult {
  return Object.freeze({
    status: 'unvalidated',
    syntaxIssues: Object.freeze([]),
    diagnostics: Object.freeze([]),
  });
}

function evaluateDraft(
  schemaText: string,
  uiSchemaText: string,
  baseInput: CompileFormDefinitionInput,
): DraftEvaluation {
  const syntaxIssues: ConfigurationSyntaxIssue[] = [];
  let schema: unknown;
  let uiSchema: unknown;
  try {
    schema = JSON.parse(schemaText) as unknown;
  } catch {
    syntaxIssues.push(
      Object.freeze({
        document: 'schema',
        message: 'Invalid JSON syntax.',
      }),
    );
  }
  try {
    uiSchema = JSON.parse(uiSchemaText) as unknown;
  } catch {
    syntaxIssues.push(
      Object.freeze({
        document: 'ui-schema',
        message: 'Invalid JSON syntax.',
      }),
    );
  }

  if (syntaxIssues.length > 0) {
    return Object.freeze({
      success: false,
      result: Object.freeze({
        status: 'invalid-json',
        syntaxIssues: Object.freeze(syntaxIssues),
        diagnostics: Object.freeze([]),
      }),
    });
  }

  const input = freezeJson({ ...baseInput, schema, uiSchema });
  const compilation = compileFormDefinition(input);
  if (!compilation.success) {
    return Object.freeze({
      success: false,
      result: Object.freeze({
        status: 'compile-failed',
        syntaxIssues: Object.freeze([]),
        diagnostics: compilation.diagnostics,
      }),
    });
  }
  const configuration = Object.freeze({
    input,
    schemaText,
    uiSchemaText,
  });
  return Object.freeze({
    success: true,
    configuration,
    compilation,
    result: Object.freeze({
      status: 'valid',
      syntaxIssues: Object.freeze([]),
      diagnostics: compilation.diagnostics,
    }),
  });
}

function freezeJson<T>(value: T): T {
  if (typeof value !== 'object' || value === null || Object.isFrozen(value)) {
    return value;
  }
  if (Array.isArray(value)) {
    for (const entry of value) freezeJson(entry);
  } else {
    for (const entry of Object.values(value)) freezeJson(entry);
  }
  return Object.freeze(value);
}
