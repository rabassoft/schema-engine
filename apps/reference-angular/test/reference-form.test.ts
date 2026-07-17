import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  type FormOperation,
  type SetValueOperation,
} from '@rabassoft/schema-engine';
import { provideSchemaEngineAngularNative } from '@rabassoft/schema-engine-angular';
import type { ReferenceScenario } from '@schema-engine-internal/reference-scenarios';
import { beforeEach, describe, expect, it } from 'vitest';

import { referenceSnippets } from '../src/app/generated/reference-snippets.js';
import { ReferenceFormComponent } from '../src/app/reference-form.component.js';

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
    expect(initial?.schema).toBe(
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
      root.querySelector('#scenario-explanation-heading')?.textContent,
    ).toBe('Scenario explanation');
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
    expect(
      root.querySelectorAll('details[data-testid^="inspector-"]'),
    ).toHaveLength(10);
    expect(
      root.querySelector('[data-testid="inspector-value"] summary')
        ?.textContent,
    ).toBe('Value');
    expect(root.textContent).toContain('A required display name.');

    for (const [id, source] of Object.entries(referenceSnippets)) {
      expect(
        root.querySelector(`[data-testid="snippet-${id}"] pre`)?.textContent,
      ).toBe(source);
    }
    expect(root.textContent).toContain(
      'generated from marked regions in the compiled reference-form source',
    );
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
