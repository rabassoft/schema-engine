import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  type FormOperation,
  type SetValueOperation,
} from '@rabassoft/schema-engine';
import { provideSchemaEngineAngularNative } from '@rabassoft/schema-engine-angular';
import { createAjvSchemaValidator } from '@rabassoft/schema-engine-validator-ajv';
import type { ReferenceScenario } from '@schema-engine-internal/reference-scenarios';
import { beforeEach, describe, expect, it } from 'vitest';

import { referenceSnippets } from '../src/app/generated/reference-snippets.js';
import { ReferenceFormComponent } from '../src/app/reference-form.component.js';
import { REFERENCE_SCHEMA_VALIDATOR } from '../src/app/reference-validator.js';

function setValue(
  id: number,
  path: readonly string[],
  expected: unknown,
  value: unknown,
): SetValueOperation {
  return {
    type: 'set-value',
    metadata: { id, formId: 'reference-controlled-primitives' },
    path,
    expected: { kind: 'value', value: expected },
    value,
    source: 'user',
  };
}

function createComponent() {
  TestBed.configureTestingModule({
    imports: [ReferenceFormComponent],
    providers: [
      provideZonelessChangeDetection(),
      provideSchemaEngineAngularNative(),
      {
        provide: REFERENCE_SCHEMA_VALIDATOR,
        useValue: createAjvSchemaValidator(),
      },
    ],
  });
  const fixture = TestBed.createComponent(ReferenceFormComponent);
  fixture.detectChanges();
  TestBed.tick();
  return fixture;
}

describe('ReferenceFormComponent application ownership', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('compiles before mounting the form and exposes compiler failure', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;
    const selected = component.selectedScenario();
    const invalid: ReferenceScenario = {
      ...selected,
      id: 'invalid-scenario',
      title: 'Invalid scenario',
      compileInput: { schema: { type: 'string' } },
    };

    component.loadScenario(invalid);
    fixture.detectChanges();
    TestBed.tick();

    expect(component.compilation().success).toBe(false);
    expect(component.formConfig()).toBeUndefined();
    expect(component.compilerDiagnostics().length).toBeGreaterThan(0);
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('form')).toBeNull();
    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'could not be compiled',
    );
  });

  it('derives a fresh controlled config from application signals', () => {
    const component = createComponent().componentInstance;
    const initial = component.formConfig();

    expect(initial).toBeDefined();
    expect(initial?.value).toBe(component.value());
    expect(initial?.baselineValue).toBe(component.baselineValue());
    expect(initial?.schema).toEqual(
      component.selectedScenario().compileInput.schema,
    );
    expect(initial?.schema).not.toBe(
      component.selectedScenario().compileInput.schema,
    );

    component.setLocale('es');
    const localized = component.formConfig();
    expect(localized).not.toBe(initial);
    expect(localized?.locale).toBe('es');
    expect(localized?.value).toBe(component.value());
  });

  it('applies confirmed intentions and records rejected intentions without mutation', () => {
    const component = createComponent().componentInstance;
    const confirmed = setValue(1, ['name'], 'Ada', 'Grace');

    component.setDecisionMode('confirm');
    component.handleOperation(confirmed);
    expect(component.value()).toMatchObject({ name: 'Grace' });
    expect(component.history()).toMatchObject([
      { operation: confirmed, status: 'applied', diagnostics: [] },
    ]);
    expect(component.dirty()).toBe(true);

    const beforeReject = component.value();
    const rejected = setValue(2, ['age'], 37, -1);
    component.setDecisionMode('reject');
    component.handleOperation(rejected);
    expect(component.value()).toBe(beforeReject);
    expect(component.history().at(-1)).toMatchObject({
      operation: rejected,
      status: 'rejected',
      diagnostics: [],
    });
  });

  it('stores exact pending operations and resolves stale or rejected entries visibly', () => {
    const component = createComponent().componentInstance;
    const pending = setValue(1, ['name'], 'Ada', 'Grace');
    component.setDecisionMode('pending');
    component.handleOperation(pending);

    expect(component.value()).toMatchObject({ name: 'Ada' });
    expect(component.pendingEntries()).toHaveLength(1);
    expect(component.pendingEntries()[0]?.operation).toBe(pending);
    expect(Object.isFrozen(component.history())).toBe(true);

    component.replaceValue({ ...component.value(), name: 'External' });
    component.resolvePending(1, 'confirm');
    expect(component.value()).toMatchObject({ name: 'External' });
    expect(component.history()[0]).toMatchObject({
      status: 'failed',
      diagnostics: [{ code: 'STALE_OPERATION' }],
    });

    const second = setValue(2, ['age'], 37, 38);
    component.handleOperation(second);
    component.resolvePending(2, 'reject');
    expect(component.history()[1]).toMatchObject({
      operation: second,
      status: 'rejected',
    });
  });

  it('owns reset, whole baseline, locale and validation visibility', () => {
    const component = createComponent().componentInstance;
    const initialValue = component.value();
    const operation: FormOperation = setValue(1, ['name'], 'Ada', 'Grace');
    component.handleOperation(operation);
    expect(component.dirty()).toBe(true);

    component.commitBaseline();
    expect(component.baselineValue()).toBe(component.value());
    expect(component.dirty()).toBe(false);

    component.setLocale('es');
    component.setValidationVisibility('all');
    expect(component.locale()).toBe('es');
    expect(component.validationVisibility()).toBe('all');
    expect(component.formConfig()).toMatchObject({
      locale: 'es',
      validationVisibility: 'all',
    });

    component.setDecisionMode('pending');
    component.handleOperation(setValue(2, ['age'], 37, 38));
    component.resetScenario();
    expect(component.value()).toBe(initialValue);
    expect(component.baselineValue()).toBe(
      component.selectedScenario().initialState.baselineValue,
    );
    expect(component.locale()).toBe('en');
    expect(component.validationVisibility()).toBe('touched');
    expect(component.decisionMode()).toBe('confirm');
    expect(component.history()).toEqual([]);
    expect(component.pendingEntries()).toEqual([]);
    expect(Object.isFrozen(component.pendingEntries())).toBe(true);
  });

  it('resets all controlled and decision state when selecting another scenario', () => {
    const component = createComponent().componentInstance;
    component.setDecisionMode('pending');
    component.handleOperation(setValue(1, ['name'], 'Ada', 'Grace'));
    component.setLocale('es');

    component.selectScenario('nested-profile');

    expect(component.selectedScenario().id).toBe('nested-profile');
    expect(component.value()).toBe(
      component.selectedScenario().initialState.value,
    );
    expect(component.baselineValue()).toBe(
      component.selectedScenario().initialState.baselineValue,
    );
    expect(component.decisionMode()).toBe('confirm');
    expect(component.history()).toEqual([]);
    expect(component.compilation().success).toBe(true);
    expect(component.formConfig()).toBeDefined();
  });

  it('restores visible collection drafts on reset and scenario selection', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;
    const root = fixture.nativeElement as HTMLElement;
    component.selectScenario('stable-team');
    fixture.detectChanges();
    TestBed.tick();

    const id = root.querySelector<HTMLInputElement>('#team-item-id');
    const name = root.querySelector<HTMLInputElement>('#team-item-name');
    expect(id).not.toBeNull();
    expect(name).not.toBeNull();
    if (id === null || name === null) return;
    id.value = 'temporary';
    id.dispatchEvent(new Event('input'));
    name.value = 'Temporary member';
    name.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    component.resetScenario();
    fixture.detectChanges();
    expect(id.value).toBe('new-member');
    expect(name.value).toBe('New member');

    id.value = 'another';
    id.dispatchEvent(new Event('input'));
    component.selectScenario('controlled-primitives');
    fixture.detectChanges();
    TestBed.tick();
    component.selectScenario('stable-team');
    fixture.detectChanges();
    TestBed.tick();
    expect(root.querySelector<HTMLInputElement>('#team-item-id')?.value).toBe(
      'new-member',
    );
  });

  it('parses both drafts independently and leaves active state untouched on failure', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;
    const active = component.activeCompileInput();
    const value = component.value();
    const epoch = component.runtimeEpoch();

    component.updateSchemaDraft('{');
    component.updateUiSchemaDraft('[');

    expect(component.validateConfiguration()).toBe(false);
    expect(component.draftResult()).toMatchObject({
      status: 'invalid-json',
      syntaxIssues: [
        { document: 'schema', message: 'Invalid JSON syntax.' },
        { document: 'ui-schema', message: 'Invalid JSON syntax.' },
      ],
      diagnostics: [],
    });
    expect(Object.isFrozen(component.draftResult().syntaxIssues)).toBe(true);
    expect(component.activeCompileInput()).toBe(active);
    expect(component.value()).toBe(value);
    expect(component.runtimeEpoch()).toBe(epoch);
    expect(component.formConfig()).toBeDefined();
  });

  it('keeps compiler failure non-mutating and validates without applying', () => {
    const component = createComponent().componentInstance;
    const active = component.activeCompileInput();
    const epoch = component.runtimeEpoch();

    component.updateSchemaDraft('{"type":"string"}');
    expect(component.validateConfiguration()).toBe(false);
    expect(component.draftResult().status).toBe('compile-failed');
    expect(component.draftResult().diagnostics.length).toBeGreaterThan(0);
    expect(component.activeCompileInput()).toBe(active);
    expect(component.runtimeEpoch()).toBe(epoch);

    component.updateSchemaDraft(`${JSON.stringify(active.schema, null, 2)}\n`);
    expect(component.validateConfiguration()).toBe(true);
    expect(component.draftResult().status).toBe('valid');
    expect(component.activeCompileInput()).toBe(active);
    expect(component.runtimeEpoch()).toBe(epoch);
  });

  it('treats compiler warnings as a successful draft result', () => {
    const component = createComponent().componentInstance;
    const schema = component.activeCompileInput().schema as Record<
      string,
      unknown
    >;

    component.updateSchemaDraft(
      JSON.stringify({ ...schema, 'x-reference-note': true }, undefined, 2),
    );

    expect(component.validateConfiguration()).toBe(true);
    expect(component.draftResult().status).toBe('valid');
    expect(component.draftResult().diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'UNKNOWN_SCHEMA_KEYWORD',
          severity: 'warning',
          source: 'schema',
          documentPath: ['x-reference-note'],
        }),
      ]),
    );
  });

  it('applies exact current drafts by replacing the mounted runtime', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;
    const root = fixture.nativeElement as HTMLElement;
    const previousForm = root.querySelector('form');
    const previousEpoch = component.runtimeEpoch();
    const previousActive = component.activeCompileInput();

    component.updateSchemaDraft(`${component.schemaDraft()}\n`);
    expect(component.applyConfiguration()).toBe(true);
    fixture.detectChanges();
    TestBed.tick();

    expect(component.runtimeEpoch()).toBe(previousEpoch + 1);
    expect(component.activeCompileInput()).not.toBe(previousActive);
    expect(component.draftModified()).toBe(false);
    expect(component.draftResult().status).toBe('valid');
    expect(root.querySelector('form')).not.toBe(previousForm);
    expect(component.value()).toBe(
      component.selectedScenario().initialState.value,
    );
  });

  it('validates newly applied supported constraints through Ajv', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;
    const activeSchema = component.activeCompileInput().schema as {
      readonly properties: Readonly<Record<string, object>>;
    };
    component.updateSchemaDraft(
      JSON.stringify(
        {
          ...(component.activeCompileInput().schema as object),
          properties: {
            ...activeSchema.properties,
            name: { ...activeSchema.properties.name, maxLength: 2 },
          },
        },
        undefined,
        2,
      ),
    );

    expect(component.applyConfiguration()).toBe(true);
    fixture.detectChanges();
    TestBed.tick();
    expect(component.validationIssues()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'maxLength', path: ['name'] }),
      ]),
    );

    component.handleOperation(setValue(9, ['name'], 'Ada', 'Al'));
    fixture.detectChanges();
    TestBed.tick();
    expect(component.validationIssues()).toEqual([]);
  });

  it('confirms destructive apply from a freshly recompiled draft', () => {
    const component = createComponent().componentInstance;
    component.handleOperation(setValue(1, ['name'], 'Ada', 'Grace'));
    const active = component.activeCompileInput();
    component.updateSchemaDraft(`${component.schemaDraft()}\n`);

    expect(component.applyConfiguration()).toBe(false);
    expect(component.pendingConfigurationAction()).toBe('apply');
    component.updateSchemaDraft('{');
    expect(component.pendingConfigurationAction()).toBeUndefined();
    expect(component.confirmConfigurationAction()).toBe(false);
    expect(component.activeCompileInput()).toBe(active);
    expect(component.value()).toMatchObject({ name: 'Grace' });

    component.updateSchemaDraft(`${JSON.stringify(active.schema, null, 2)}\n`);
    expect(component.applyConfiguration()).toBe(false);
    expect(component.pendingConfigurationAction()).toBe('apply');
    expect(component.confirmConfigurationAction()).toBe(true);
    expect(component.pendingConfigurationAction()).toBeUndefined();
    expect(component.dirty()).toBe(false);
    expect(component.history()).toEqual([]);
    expect(component.value()).toBe(
      component.selectedScenario().initialState.value,
    );
  });

  it('cancels drafts and restores the immutable scenario configuration', () => {
    const component = createComponent().componentInstance;
    const originalSchemaText = component.schemaDraft();
    const originalUiSchemaText = component.uiSchemaDraft();

    component.updateSchemaDraft(`${originalSchemaText}\n`);
    component.cancelConfigurationChanges();
    expect(component.schemaDraft()).toBe(originalSchemaText);
    expect(component.draftResult().status).toBe('unvalidated');

    component.updateUiSchemaDraft(`${originalUiSchemaText}\n`);
    expect(component.applyConfiguration()).toBe(true);
    expect(component.canRestoreOriginalConfiguration()).toBe(true);
    component.restoreScenarioConfiguration();
    expect(component.pendingConfigurationAction()).toBe('restore');
    expect(component.confirmConfigurationAction()).toBe(true);
    expect(component.schemaDraft()).toBe(originalSchemaText);
    expect(component.uiSchemaDraft()).toBe(originalUiSchemaText);
    expect(component.canRestoreOriginalConfiguration()).toBe(false);
  });

  it('renders semantic navigation, controls, inspectors and build-checked excerpts', () => {
    const fixture = createComponent();
    const root = fixture.nativeElement as HTMLElement;
    const navigation = root.querySelector(
      'nav[aria-label="Reference scenarios"]',
    );
    const selector = root.querySelector('#scenario-selector');

    expect(navigation).not.toBeNull();
    expect(selector).toBeInstanceOf(HTMLSelectElement);
    expect(root.querySelectorAll('#scenario-selector option')).toHaveLength(6);
    expect(
      root.querySelector('label[for="scenario-selector"]')?.textContent,
    ).toBe('Scenario');
    expect(selector?.getAttribute('aria-describedby')).toBe('scenario-summary');
    expect(root.querySelector('[role="status"]')?.textContent).toContain(
      'Matches baseline',
    );
    expect(
      root.querySelector('#reference-scenario-heading')?.textContent,
    ).toContain('Reference scenario');
    expect(root.querySelector('#scenario-explanation-heading')).toBeNull();
    expect(
      root.querySelector('.scenario-navigation .explanation-grid'),
    ).not.toBeNull();
    expect(
      root.querySelector('#interactive-consumer-heading')?.textContent,
    ).toContain('Interactive consumer');
    expect(
      root.querySelector('#observable-evidence-heading')?.textContent,
    ).toContain('Observable evidence');
    for (const entry of fixture.componentInstance.selectedScenario()
      .explanation) {
      expect(root.textContent).toContain(entry.title);
      expect(root.textContent).toContain(entry.body);
    }
    expect(
      Array.from(root.querySelectorAll('legend'), ({ textContent }) =>
        textContent?.trim(),
      ),
    ).toContain('Operation decision');
    expect(root.querySelector('form')?.getAttribute('aria-label')).toBe(
      'Selected schema form',
    );
    expect(root.querySelectorAll('[role="tablist"]')).toHaveLength(2);
    expect(root.querySelectorAll('[role="tab"]')).toHaveLength(7);
    expect(root.querySelectorAll('[role="tabpanel"]')).toHaveLength(2);
    expect(root.querySelector('.preview-workspace')).not.toBeNull();
    expect(root.querySelector('.schema-workspace')).not.toBeNull();
    expect(
      root.querySelector('.cm-content[aria-label="JSON Schema editor"]'),
    ).not.toBeNull();
    expect(root.querySelector('#evidence-panel-state')).not.toBeNull();
    expect(
      root.querySelector('[data-testid="inspector-value"] summary')
        ?.textContent,
    ).toBe('Value');
    expect(
      root
        .querySelector('[data-testid="inspector-value"]')
        ?.hasAttribute('open'),
    ).toBe(true);
    expect(
      root
        .querySelector('[data-testid="inspector-baseline"]')
        ?.hasAttribute('open'),
    ).toBe(false);
    expect(root.textContent).toContain('A required display name.');

    const component = fixture.componentInstance;
    component.setConfigurationTab('schema');
    component.setEvidenceTab('definition');
    fixture.detectChanges();
    expect(
      root.querySelector('.cm-content[aria-label="JSON Schema editor"]'),
    ).not.toBeNull();
    expect(root.querySelectorAll('[role="tablist"]')).toHaveLength(2);
    expect(root.querySelectorAll('[role="tab"]')).toHaveLength(7);
    expect(
      root.querySelector('[data-testid="inspector-definition"]'),
    ).not.toBeNull();

    component.setConfigurationTab('ui-schema');
    component.setEvidenceTab('runtime');
    fixture.detectChanges();
    expect(
      root.querySelector('.cm-content[aria-label="UI Schema editor"]'),
    ).not.toBeNull();
    expect(
      root.querySelector('[data-testid="inspector-snapshot"]'),
    ).not.toBeNull();
    expect(
      root.querySelector('[data-testid="inspector-history"]'),
    ).not.toBeNull();

    component.setEvidenceTab('diagnostics');
    fixture.detectChanges();
    expect(
      root.querySelector('[data-testid="inspector-compiler-diagnostics"]'),
    ).not.toBeNull();
    expect(
      root.querySelector('[data-testid="inspector-runtime-diagnostics"]'),
    ).not.toBeNull();
    expect(
      root.querySelector('[data-testid="inspector-issues"]'),
    ).not.toBeNull();

    component.setEvidenceTab('integration');
    fixture.detectChanges();
    expect(component.snippets.map(({ source }) => source)).toEqual(
      Object.values(referenceSnippets),
    );
    expect(
      component.snippets.every(
        ({ purpose, responsibility }) =>
          purpose.length > 0 && responsibility.length > 0,
      ),
    ).toBe(true);
    expect(root.textContent).toContain(
      'Read them in order to follow the controlled integration',
    );
    expect(root.textContent).toContain('Own state:');
  });

  it('loads all six scenarios through the same focused form component', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;

    for (const scenario of component.scenarios) {
      component.selectScenario(scenario.id);
      fixture.detectChanges();
      TestBed.tick();
      expect(component.selectedScenario()).toBe(scenario);
      expect(component.compilation().success, scenario.id).toBe(true);
      expect(component.formConfig(), scenario.id).toBeDefined();
      expect(
        (fixture.nativeElement as HTMLElement).querySelector(
          'form[aria-label="Selected schema form"]',
        ),
        scenario.id,
      ).not.toBeNull();
    }
  });

  it('exposes shell-owned collection controls without renderer DOM coupling', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;
    component.selectScenario('stable-team');
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;

    expect(
      Array.from(root.querySelectorAll('legend'), ({ textContent }) =>
        textContent?.trim(),
      ),
    ).toContain('Team collection controls');
    expect(root.querySelector('label[for="team-item-id"]')?.textContent).toBe(
      'New member ID',
    );
    expect(root.querySelector('label[for="team-item-name"]')?.textContent).toBe(
      'New member name',
    );

    component.insertTeamMember();
    fixture.detectChanges();
    TestBed.tick();
    expect(component.teamMembers().map(({ id }) => id)).toEqual([
      'ada',
      'grace',
      'new-member',
    ]);

    component.moveFirstTeamMemberLater();
    fixture.detectChanges();
    TestBed.tick();
    expect(component.teamMembers().map(({ id }) => id)).toEqual([
      'grace',
      'ada',
      'new-member',
    ]);

    component.removeLastTeamMember();
    fixture.detectChanges();
    TestBed.tick();
    expect(component.teamMembers().map(({ id }) => id)).toEqual([
      'grace',
      'ada',
    ]);
  });
});
