import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  computed,
  signal,
} from '@angular/core';
import {
  applyFormOperation,
  compileFormDefinition,
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
import { referenceSnippets } from './generated/reference-snippets.js';
import { serializeInspector } from './inspector-serialization.js';

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

const initialScenario = referenceScenarios[0];
if (initialScenario === undefined) {
  throw new Error('The reference catalog must contain an initial scenario.');
}

const snippetEntries = Object.freeze([
  Object.freeze({
    id: 'application-signals',
    label: 'Application signals excerpt',
    source: referenceSnippets['application-signals'],
  }),
  Object.freeze({
    id: 'operation-decisions',
    label: 'Operation decisions excerpt',
    source: referenceSnippets['operation-decisions'],
  }),
  Object.freeze({
    id: 'controlled-form-template',
    label: 'Controlled form template excerpt',
    source: referenceSnippets['controlled-form-template'],
  }),
]);

@Component({
  selector: 'reference-form',
  standalone: true,
  imports: [SchemaFormDirective, InspectorPanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-labelledby="scenario-heading">
      <header>
        <h2 id="scenario-heading">{{ selectedScenario().title }}</h2>
        <p id="scenario-summary">{{ selectedScenario().summary }}</p>
      </header>

      <nav aria-label="Reference scenarios">
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
      </nav>

      <p role="status" aria-live="polite" data-testid="reference-state">
        {{ dirty() ? 'Modified' : 'Matches baseline' }} · locale
        {{ locale() }} · {{ validationVisibility() }} validation ·
        {{ pendingEntries().length }}
        pending
      </p>

      <section aria-labelledby="scenario-explanation-heading">
        <h3 id="scenario-explanation-heading">Scenario explanation</h3>
        @for (entry of selectedScenario().explanation; track entry.id) {
          <article>
            <h4>{{ entry.title }}</h4>
            <p>{{ entry.body }}</p>
          </article>
        }
      </section>

      <fieldset>
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

      <section aria-labelledby="application-controls-heading">
        <h3 id="application-controls-heading">Application controls</h3>
        <button type="button" (click)="resetScenario()">Reset scenario</button>
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
      </section>

      @if (selectedScenario().id === 'stable-team') {
        <fieldset>
          <legend>Team collection controls</legend>
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
        </fieldset>
      }

      @if (formConfig(); as config) {
        <!-- reference-snippet:start controlled-form-template -->
        <form
          aria-label="Selected schema form"
          [schemaForm]="config"
          (schemaOperation)="handleOperation($event)"
          (schemaDiagnostics)="recordRuntimeDiagnostics($event)"
        ></form>
        <!-- reference-snippet:end controlled-form-template -->
      } @else {
        <p role="alert">The selected scenario could not be compiled.</p>
      }

      @if (pendingEntries().length > 0) {
        <section aria-labelledby="pending-heading" data-testid="pending-list">
          <h3 id="pending-heading">Pending intentions</h3>
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

      <reference-inspector-panel
        label="Schema"
        testId="inspector-schema"
        [value]="selectedScenario().compileInput.schema"
      />
      <reference-inspector-panel
        label="UI Schema"
        testId="inspector-ui-schema"
        [value]="selectedScenario().compileInput.uiSchema"
      />
      <reference-inspector-panel
        label="Value"
        testId="inspector-value"
        [value]="value()"
      />
      <reference-inspector-panel
        label="Baseline value"
        testId="inspector-baseline"
        [value]="baselineValue()"
      />
      <reference-inspector-panel
        label="Normalized definition"
        testId="inspector-definition"
        [value]="definition()"
      />
      <reference-inspector-panel
        label="Runtime snapshot"
        testId="inspector-snapshot"
        [value]="runtimeSnapshot()"
      />
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
        label="Validation issues"
        testId="inspector-issues"
        [value]="validationIssues()"
      />
      <reference-inspector-panel
        label="Operation history"
        testId="inspector-history"
        [value]="history()"
      />

      <section aria-labelledby="snippets-heading">
        <h2 id="snippets-heading">Build-checked integration excerpts</h2>
        <p>
          These excerpts are generated from marked regions in the compiled
          reference-form source.
        </p>
        @for (snippet of snippets; track snippet.id) {
          <article [attr.data-testid]="'snippet-' + snippet.id">
            <h3>{{ snippet.label }}</h3>
            <pre>{{ snippet.source }}</pre>
          </article>
        }
      </section>
    </section>
  `,
})
export class ReferenceFormComponent {
  readonly scenarios = referenceScenarios;
  readonly snippets = snippetEntries;
  // reference-snippet:start application-signals
  private readonly selectionState = signal<ScenarioSelection>(
    Object.freeze({
      scenario: initialScenario,
      compilation: compileFormDefinition(initialScenario.compileInput),
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
      this.selectedScenario().validator.validate(
        this.selectedScenario().compileInput.schema,
        this.value(),
      ).issues,
  );
  readonly formConfig = computed<
    AngularControlledFormConfig<object> | undefined
  >(() => {
    const selection = this.selectionState();
    if (!selection.compilation.success) return undefined;
    return Object.freeze({
      formId: `reference-${selection.scenario.id}`,
      definition: selection.compilation.definition,
      schema: selection.scenario.compileInput.schema,
      value: this.value(),
      baselineValue: this.baselineValue(),
      locale: this.locale(),
      validator: selection.scenario.validator,
      validationVisibility: this.validationVisibility(),
    });
  });
  readonly runtimeSnapshot = computed(() => this.formDirective?.snapshot());

  @ViewChild(SchemaFormDirective)
  private get formDirective(): SchemaFormDirective<object> | undefined {
    return this.formState();
  }

  private set formDirective(value: SchemaFormDirective<object> | undefined) {
    this.formState.set(value);
  }

  selectScenario(id: string): void {
    const scenario = this.scenarios.find((candidate) => candidate.id === id);
    if (scenario !== undefined) this.loadScenario(scenario);
  }

  loadScenario(scenario: ReferenceScenario): void {
    const compilation = compileFormDefinition(scenario.compileInput);
    this.selectionState.set(Object.freeze({ scenario, compilation }));
    this.valueState.set(scenario.initialState.value);
    this.baselineValueState.set(scenario.initialState.baselineValue);
    this.localeState.set(scenario.initialState.locale);
    this.visibilityState.set(scenario.initialState.validationVisibility);
    this.decisionModeState.set('confirm');
    this.clearOperationState();
  }

  resetScenario(): void {
    const scenario = this.selectedScenario();
    this.valueState.set(scenario.initialState.value);
    this.baselineValueState.set(scenario.initialState.baselineValue);
    this.localeState.set(scenario.initialState.locale);
    this.visibilityState.set(scenario.initialState.validationVisibility);
    this.decisionModeState.set('confirm');
    this.clearOperationState();
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
