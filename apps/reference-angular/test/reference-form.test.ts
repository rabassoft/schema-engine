import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  type FormOperation,
  type SetValueOperation,
  type TextResolver,
  type WizardTextResolutionContext,
} from '@rabassoft/schema-engine';
import {
  provideSchemaEngineAngularNative,
  provideSchemaTextResolver,
} from '@rabassoft/schema-engine-angular';
import { createAjvSchemaValidator } from '@rabassoft/schema-engine-validator-ajv';
import {
  stringEnumArrayControlStates,
  type ReferenceScenario,
} from '@schema-engine-internal/reference-scenarios';
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

function createComponent(resolver?: TextResolver) {
  TestBed.configureTestingModule({
    imports: [ReferenceFormComponent],
    providers: [
      provideZonelessChangeDetection(),
      provideSchemaEngineAngularNative(),
      provideSchemaTextResolver(
        resolver ?? {
          resolve(text, context) {
            if (context.locale !== 'es') return text;
            return (
              (
                {
                  Clear: 'Limpiar',
                  'No value provided.': 'No se ha proporcionado ningún valor.',
                  'No values selected.': 'No hay valores seleccionados.',
                } as Readonly<Record<string, string>>
              )[text] ?? text
            );
          },
        },
      ),
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

async function flushAsyncValidation(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  TestBed.tick();
}

describe('ReferenceFormComponent application ownership', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('projects a once-mounted native wizard and confirms adjacent intentions in the application', async () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;
    component.selectScenario('linear-wizard');
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;
    const wizard = root.querySelector<HTMLElement>('.schema-wizard');
    if (wizard === null) throw new Error('Expected Angular wizard host.');
    const regions = [
      ...wizard.querySelectorAll<HTMLElement>('[role="region"]'),
    ];
    expect(regions).toHaveLength(3);
    expect(regions[0]?.hidden).toBe(false);
    expect(regions[1]?.hidden).toBe(true);
    expect(wizard.querySelector('[role="tablist"]')).toBeNull();

    component.setDecisionMode('reject');
    const next = [...wizard.querySelectorAll<HTMLButtonElement>('button')].find(
      ({ textContent }) => textContent?.trim() === 'Next',
    );
    next?.click();
    fixture.detectChanges();
    TestBed.tick();
    expect(regions[0]?.hidden).toBe(false);
    component.setDecisionMode('confirm');

    component.resolveServiceValidation(true);
    await flushAsyncValidation();
    next?.click();
    fixture.detectChanges();
    TestBed.tick();
    expect(regions[0]?.hidden).toBe(true);
    expect(regions[1]?.hidden).toBe(false);
    expect(document.activeElement).toBe(regions[1]?.querySelector('h3'));
    const retained = regions[1]?.querySelector<HTMLInputElement>('input');
    if (retained === null || retained === undefined)
      throw new Error('Expected a retained nested step input.');
    retained.value = 'Retained Angular buffer';
    retained.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    TestBed.tick();
    const previous = [
      ...wizard.querySelectorAll<HTMLButtonElement>('button'),
    ].find(({ textContent }) => textContent?.trim() === 'Previous');
    previous?.click();
    fixture.detectChanges();
    TestBed.tick();
    expect(regions[1]?.hidden).toBe(true);
    next?.click();
    fixture.detectChanges();
    TestBed.tick();
    expect(regions[1]?.querySelector('input')).toBe(retained);
    expect(retained.value).toBe('Retained Angular buffer');
  });

  it('resolves exact wizard text identities once per locale and falls back once on failure', () => {
    const contexts: WizardTextResolutionContext[] = [];
    const fixture = createComponent({
      resolve(text, context) {
        if (!('wizard' in context)) return text;
        contexts.push(context);
        if (context.member === 'next') throw new Error('unsafe');
        return context.locale === 'es' ? `es:${text}` : text;
      },
    });
    const component = fixture.componentInstance;
    component.selectScenario('linear-wizard');
    fixture.detectChanges();
    TestBed.tick();

    const enIdentities = contexts.map((context) =>
      JSON.stringify([
        context.locale,
        context.member,
        context.step?.key,
        context.position,
        context.count,
      ]),
    );
    expect(new Set(enIdentities).size).toBe(enIdentities.length);
    const diagnostic = component.runtimeDiagnostics()[0];
    expect(component.runtimeDiagnostics()).toHaveLength(1);
    expect(diagnostic?.code).toBe('TEXT_RESOLUTION_FAILED');
    expect(diagnostic?.parameters?.['member']).toBe('next');
    expect(diagnostic?.parameters?.['reason']).toBe('exception');

    component.setLocale('es');
    fixture.detectChanges();
    TestBed.tick();
    expect(contexts.some(({ locale }) => locale === 'es')).toBe(true);
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.schema-wizard h2')?.textContent).toContain(
      'es:Team onboarding',
    );
  });

  it('derives, cancels and explicitly accepts schema defaults without operations', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;
    component.selectScenario('explicit-schema-defaults');
    const original = component.value();
    const rows = (original as { rows: readonly unknown[] }).rows;

    component.deriveDefaultCandidate();
    expect(component.defaultCandidate()?.status).toBe('available');
    expect(component.value()).toBe(original);
    expect(component.history()).toHaveLength(0);

    component.cancelDefaultCandidate();
    expect(component.defaultCandidate()?.status).toBe('cancelled');
    expect(component.value()).toBe(original);

    component.deriveDefaultCandidate();
    component.acceptDefaultCandidate();
    expect(component.defaultCandidate()?.status).toBe('accepted');
    expect(component.value()).toMatchObject({
      title: 'New entity',
      enabled: false,
      attempts: 0,
      note: '',
      nullableNote: null,
      locale: 'en',
      profile: { displayName: 'Ada', code: 'x' },
    });
    expect((component.value() as { rows: readonly unknown[] }).rows).toBe(rows);
    expect(component.history()).toHaveLength(0);
    expect(
      component.validationIssues().map(({ keyword }) => keyword),
    ).toContain('minLength');

    component.deriveDefaultCandidate();
    expect(component.defaultCandidate()?.status).toBe('no-effect');
  });

  it('prepares and separately accepts scoped baseline candidates without owning persistence', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;
    component.selectScenario('scope-baseline-confirmation');
    const confirmation = component.selectedScenario().scopeConfirmation;
    const profile = confirmation?.targets.find(
      ({ id }) => id === 'profile-name',
    );
    const team = confirmation?.targets.find(({ id }) => id === 'whole-team');
    const currentOnly = confirmation?.targets.find(
      ({ id }) => id === 'current-only-linus',
    );
    if (
      profile === undefined ||
      team === undefined ||
      currentOnly === undefined
    ) {
      throw new Error('Scoped confirmation targets are required.');
    }

    const baseline = component.baselineValue();
    expect(component.dirty()).toBe(true);
    component.prepareScopeCandidate(profile);
    expect(component.scopeCandidate()?.status).toBe('available');
    expect(component.baselineValue()).toBe(baseline);
    expect(component.dirty()).toBe(true);

    component.acceptScopeCandidate();
    expect(component.scopeCandidate()?.status).toBe('accepted');
    expect(component.baselineValue()).toMatchObject({
      profile: { displayName: 'Ada Byron', timezone: 'UTC' },
      reviewNote: 'Baseline note',
    });
    expect(component.dirty()).toBe(true);

    component.resetScenario();
    component.prepareScopeCandidate(currentOnly);
    expect(component.scopeCandidate()?.status).toBe('unconfirmable');
    expect(component.baselineValue()).toEqual(baseline);

    component.prepareScopeCandidate(team);
    component.acceptScopeCandidate();
    expect(component.baselineValue()).toMatchObject({
      team: [
        { id: 'grace', name: 'Grace Hopper' },
        { id: 'linus', name: 'Linus' },
        { id: 'ada', name: 'Ada' },
      ],
      reviewNote: 'Baseline note',
    });
    expect(component.dirty()).toBe(true);

    component.loadScenario(component.selectedScenario());
    expect(component.scopeCandidate()).toBeUndefined();
  });

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
    expect(initial).not.toHaveProperty('asyncValidator');
    expect(component.runtimeSnapshot()).not.toHaveProperty('asyncValidation');
  });

  it('demonstrates controlled async settlement, blocking, stale suppression, failure and retry', async () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;
    component.selectScenario('service-validation');
    fixture.detectChanges();
    TestBed.tick();

    expect(component.runtimeSnapshot()?.asyncValidation).toEqual({
      status: 'pending',
      generation: 1,
    });
    expect(component.formConfig()).toHaveProperty('asyncValidator');
    expect(component.history()).toEqual([]);

    component.resolveServiceValidation(false);
    await flushAsyncValidation();
    expect(component.runtimeSnapshot()?.asyncValidation).toEqual({
      status: 'settled',
      generation: 1,
      valid: false,
    });
    expect(component.runtimeSnapshot()?.fields[0]?.issues).toEqual([
      expect.objectContaining({
        code: 'username-unavailable',
        path: ['username'],
      }),
    ]);

    component.replaceValue({ ...component.value(), username: 'x' });
    fixture.detectChanges();
    TestBed.tick();
    expect(component.runtimeSnapshot()?.asyncValidation).toEqual({
      status: 'blocked',
      reason: 'sync-invalid',
    });
    const blockedCount = component.serviceRequestEvidence().length;

    component.replaceValue({ ...component.value(), username: 'grace' });
    fixture.detectChanges();
    TestBed.tick();
    const stale = component.serviceRequestEvidence().at(-1);
    component.replaceValue({ ...component.value(), username: 'linus' });
    fixture.detectChanges();
    TestBed.tick();
    const current = component.serviceRequestEvidence().at(-1);
    expect(component.serviceRequestEvidence()).toHaveLength(blockedCount + 2);
    expect(
      component.serviceRequestEvidence().find(({ id }) => id === stale?.id)
        ?.status,
    ).toBe('cancelled');
    expect(current?.status).toBe('pending');
    expect(component.resolveServiceRequest(stale?.id ?? -1, false)).toBe(true);
    await flushAsyncValidation();
    expect(component.runtimeSnapshot()?.asyncValidation).toEqual({
      status: 'pending',
      generation: current?.generation,
    });

    component.rejectServiceValidation();
    await flushAsyncValidation();
    expect(component.runtimeSnapshot()?.asyncValidation).toEqual({
      status: 'failed',
      generation: current?.generation,
      reason: 'exception',
    });
    component.throwOnNextValidation();
    expect(component.retryAsyncValidation()?.success).toBe(true);
    await flushAsyncValidation();
    expect(component.runtimeSnapshot()?.asyncValidation).toMatchObject({
      status: 'failed',
      reason: 'exception',
    });
    expect(component.retryAsyncValidation()?.success).toBe(true);
    component.resolveServiceValidation(true);
    await flushAsyncValidation();
    expect(component.runtimeSnapshot()?.asyncValidation).toMatchObject({
      status: 'settled',
      valid: true,
    });
    expect(component.history()).toEqual([]);
    expect(
      component
        .serviceRequestEvidence()
        .filter(({ status }) => status === 'threw'),
    ).toHaveLength(1);

    component.updateUiSchemaDraft(`${component.uiSchemaDraft()}\n`);
    expect(component.applyConfiguration()).toBe(false);
    expect(component.confirmConfigurationAction()).toBe(true);
    fixture.detectChanges();
    TestBed.tick();
    expect(component.serviceRequestEvidence()).toEqual([
      expect.objectContaining({ id: 1, generation: 1, status: 'pending' }),
    ]);
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
    expect(root.querySelectorAll('#scenario-selector option')).toHaveLength(18);
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
    const disclosures = Array.from(
      root.querySelectorAll<HTMLDetailsElement>('details.card-disclosure'),
    );
    expect(disclosures).toHaveLength(5);
    expect(disclosures.every(({ open }) => open)).toBe(true);
    expect(
      disclosures.map((details) =>
        details.querySelector(':scope > summary')?.textContent?.trim(),
      ),
    ).toEqual([
      'Reference scenario',
      'Interactive consumer',
      'Schemas',
      'Observable evidence',
      'Integration',
    ]);
    for (const disclosure of disclosures) {
      disclosure.open = false;
      expect(disclosure.open).toBe(false);
      expect(
        disclosure.querySelector(':scope > summary .eyebrow'),
      ).not.toBeNull();
      disclosure.open = true;
    }
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
    const role = root.querySelector<HTMLSelectElement>('form select');
    expect(
      Array.from(role?.options ?? [], ({ textContent }) => textContent?.trim()),
    ).toEqual(['Select a role', 'Administrator', 'Editor', 'Viewer']);
    expect(role?.options[0]?.disabled).toBe(true);
    expect(root.querySelectorAll('[role="tablist"]')).toHaveLength(3);
    expect(root.querySelectorAll('[role="tab"]')).toHaveLength(9);
    expect(root.querySelectorAll('[role="tabpanel"]')).toHaveLength(2);
    expect(root.querySelector('.preview-workspace')).not.toBeNull();
    expect(root.querySelector('.schema-workspace')).not.toBeNull();
    const consumerRegion = root.querySelector(
      'section[aria-labelledby="interactive-consumer-heading"]',
    );
    const schemaRegion = root.querySelector(
      'section[aria-labelledby="schemas-heading"]',
    );
    expect(consumerRegion?.parentElement).toBe(schemaRegion?.parentElement);
    expect(consumerRegion?.contains(schemaRegion as Node)).toBe(false);
    const configurationTabs = root.querySelector(
      '.tab-interface--configuration',
    );
    expect(configurationTabs?.children[0]?.tagName).toBe('REFERENCE-TABS');
    expect(configurationTabs?.children[1]?.getAttribute('role')).toBe(
      'tabpanel',
    );
    expect(
      configurationTabs?.querySelector('.configuration-actions'),
    ).toBeNull();
    const configurationActions = root.querySelector('.configuration-actions');
    expect(
      Array.from(
        configurationActions?.querySelectorAll('button') ?? [],
        ({ textContent }) => textContent?.trim(),
      ),
    ).toEqual(['Validate', 'Apply', 'Cancel edits', 'Restore original']);
    expect(
      configurationTabs !== null &&
        configurationActions !== null &&
        Boolean(
          configurationTabs.compareDocumentPosition(configurationActions) &
          Node.DOCUMENT_POSITION_FOLLOWING,
        ),
    ).toBe(true);
    const evidenceTabs = root.querySelector('.tab-interface--evidence');
    expect(evidenceTabs?.children[0]?.tagName).toBe('REFERENCE-TABS');
    expect(evidenceTabs?.children[1]?.getAttribute('role')).toBe('tabpanel');
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
    expect(root.querySelectorAll('[role="tablist"]')).toHaveLength(3);
    expect(root.querySelectorAll('[role="tab"]')).toHaveLength(9);
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
    const integration = root.querySelector('[data-testid="integration-panel"]');
    expect(integration).not.toBeNull();
    expect(
      Array.from(
        integration?.querySelectorAll('[role="tab"]') ?? [],
        ({ textContent }) => textContent?.trim(),
      ),
    ).toEqual([
      'Application signals excerpt',
      'Operation decisions excerpt',
      'Controlled form template excerpt',
    ]);
    expect(component.integrationTab()).toBe('application-signals');
    component.setIntegrationTab('controlled-form-template');
    expect(component.integrationTab()).toBe('controlled-form-template');
  });

  it('loads every shared scenario through the same focused form component', () => {
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

  it('projects shared discriminated alternatives with stable common hosts and focused replacement', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;
    component.selectScenario('discriminated-object-alternatives');
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;
    const formId = 'reference-discriminated-object-alternatives';
    const kind = root.querySelector<HTMLSelectElement>(
      `[id="${nodeBase(formId, ['pet', 'kind'])}"]`,
    );
    const name = root.querySelector<HTMLElement>(
      `[id="${nodeBase(formId, ['pet', 'name'])}"]`,
    );
    const lives = root.querySelector<HTMLInputElement>(
      `[id="${nodeBase(formId, ['pet', 'lives'])}"]`,
    );
    if (kind === null || name === null || lives === null) {
      throw new Error('Expected initial Angular M33 controls.');
    }
    lives.dispatchEvent(new FocusEvent('focus'));
    kind.selectedIndex = 2;
    kind.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    TestBed.tick();

    expect(
      root.querySelector(`[id="${nodeBase(formId, ['pet', 'lives'])}"]`),
    ).toBeNull();
    expect(
      root.querySelector(
        `[id="${nodeBase(formId, ['pet', 'catDetails', 'indoor'])}"]`,
      ),
    ).toBeNull();
    expect(
      root.querySelector(`[id="${nodeBase(formId, ['pet', 'barkVolume'])}"]`),
    ).not.toBeNull();
    expect(
      root.querySelector(`[id="${nodeBase(formId, ['pet', 'name'])}"]`),
    ).toBe(name);
    expect(lives.isConnected).toBe(false);
    expect(
      component.runtimeSnapshot()?.fields.some(({ focused }) => focused),
    ).toBe(false);
  });

  it('projects the shared M31 scenario through controlled Angular operations', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;
    component.selectScenario('string-enum-array');
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;
    const rolesId = nodeBase('reference-string-enum-array', ['roles']);
    const channelsId = nodeBase('reference-string-enum-array', [
      'profile',
      'channels',
    ]);
    const roles = root.querySelector<HTMLSelectElement>(`[id="${rolesId}"]`);
    const channels = root.querySelector<HTMLSelectElement>(
      `[id="${channelsId}"]`,
    );
    if (roles === null || channels === null) {
      throw new Error('Expected Angular M31 controls.');
    }

    expect(roles.multiple).toBe(true);
    expect(Array.from(roles.options, ({ value }) => value)).toEqual(
      Array.from({ length: 6 }, (_value, index) => `choice:${index}`),
    );
    expect(document.getElementById(`${rolesId}-status`)?.textContent).toContain(
      'No value provided.',
    );
    expect(document.getElementById(`${rolesId}-clear`)).toBeNull();
    expect(channels.getAttribute('aria-required')).toBe('true');
    expect(
      document.getElementById(`${channelsId}-status`)?.textContent,
    ).toContain('No values selected.');

    const channelsClear = document.getElementById(`${channelsId}-clear`);
    if (!(channelsClear instanceof HTMLButtonElement)) {
      throw new Error('Expected nested Angular M31 clear action.');
    }
    channelsClear.click();
    fixture.detectChanges();
    TestBed.tick();
    expect(component.runtimeSnapshot()?.valid).toBe(false);
    expect(
      component
        .runtimeSnapshot()
        ?.fields.find(({ path }) => path.length === 2 && path[1] === 'channels')
        ?.issues.map(({ code }) => code),
    ).toEqual(['required']);
    component.replaceValue(component.selectedScenario().initialState.value);
    fixture.detectChanges();
    TestBed.tick();

    roles.options[3]!.selected = true;
    roles.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    TestBed.tick();
    roles.options[2]!.selected = true;
    roles.options[3]!.selected = true;
    roles.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    TestBed.tick();
    expect(component.value()).toMatchObject({ roles: ['editor', 'reader'] });
    expect(component.history().slice(-2)).toMatchObject([
      { status: 'applied', operation: { value: ['editor'] } },
      { status: 'applied', operation: { value: ['editor', 'reader'] } },
    ]);
    expect(component.runtimeSnapshot()?.dirty).toBe(true);
    component.commitBaseline();
    fixture.detectChanges();
    TestBed.tick();
    expect(component.runtimeSnapshot()?.dirty).toBe(false);

    component.setDecisionMode('reject');
    roles.options[4]!.selected = true;
    roles.dispatchEvent(new Event('change', { bubbles: true }));
    expect(component.history().at(-1)).toMatchObject({
      status: 'rejected',
      operation: { value: ['editor', 'reader', 'reviewer'] },
    });
    expect(selectedTokens(roles)).toEqual(['choice:2', 'choice:3']);

    component.setDecisionMode('confirm');
    component.replaceValue(
      Object.freeze({
        ...component.value(),
        roles: Object.freeze(['reader', 'editor']),
      }),
    );
    fixture.detectChanges();
    TestBed.tick();
    expect(selectedTokens(roles)).toEqual(['choice:2', 'choice:3']);
    const historyLength = component.history().length;
    roles.dispatchEvent(new Event('change', { bubbles: true }));
    expect(component.history()).toHaveLength(historyLength);

    roles.dispatchEvent(new FocusEvent('focus'));
    roles.dispatchEvent(new FocusEvent('blur'));
    expect(
      component
        .runtimeSnapshot()
        ?.fields.find(({ path }) => path.length === 1 && path[0] === 'roles'),
    ).toMatchObject({ focused: false, touched: true });

    component.setLocale('es');
    fixture.detectChanges();
    TestBed.tick();
    const clear = document.getElementById(`${rolesId}-clear`);
    if (!(clear instanceof HTMLButtonElement)) {
      throw new Error('Expected Angular M31 clear action.');
    }
    expect(clear.textContent?.trim()).toBe('Limpiar');
    clear.click();
    fixture.detectChanges();
    TestBed.tick();
    expect(Object.hasOwn(component.value(), 'roles')).toBe(false);
    expect(document.getElementById(`${rolesId}-status`)?.textContent).toContain(
      'No se ha proporcionado ningún valor.',
    );

    for (const { value: invalid } of stringEnumArrayControlStates) {
      component.replaceValue(invalid);
      fixture.detectChanges();
      TestBed.tick();
      expect(roles.disabled).toBe(true);
      expect(roles.closest('div')?.tabIndex).toBe(0);
      expect(
        component
          .runtimeSnapshot()
          ?.fields.find(({ path }) => path.length === 1 && path[0] === 'roles')
          ?.issues.length,
      ).toBeGreaterThan(0);
      const incompatibleClear = document.getElementById(`${rolesId}-clear`);
      expect(incompatibleClear).toBeInstanceOf(HTMLButtonElement);
      expect((incompatibleClear as HTMLButtonElement).disabled).toBe(false);
      (incompatibleClear as HTMLButtonElement).click();
      fixture.detectChanges();
      TestBed.tick();
      expect(Object.hasOwn(component.value(), 'roles')).toBe(false);
    }
  });

  it('projects shared object composition through the independent Angular lane', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;
    component.selectScenario('object-composition');
    fixture.detectChanges();
    TestBed.tick();

    expect(
      component.definition()?.fields.map(({ name, required }) => ({
        name,
        required,
      })),
    ).toEqual([
      { name: 'department', required: true },
      { name: 'displayName', required: true },
      { name: 'contactEmail', required: false },
      { name: 'active', required: false },
    ]);
    expect(component.compilerDiagnostics()).toEqual([]);
    expect(component.runtimeDiagnostics()).toEqual([]);
    const form = (fixture.nativeElement as HTMLElement).querySelector(
      'form[aria-label="Selected schema form"]',
    );
    if (form === null) throw new Error('Composed form missing.');
    expect(
      Array.from(
        form.querySelectorAll(
          'schema-string-renderer, schema-boolean-renderer',
        ),
        (renderer) => renderer.querySelector('label')?.textContent?.trim(),
      ),
    ).toEqual(['Department', 'Display name', 'Contact email', 'Active']);
    expect(
      Array.from(form.querySelectorAll('input')).map((input) =>
        input.getAttribute('aria-required'),
      ),
    ).toEqual(['true', 'true', null, null]);
    component.replaceValue({
      ...component.value(),
      displayName: 'A',
      department: 'R',
    });
    fixture.detectChanges();
    TestBed.tick();
    expect(component.runtimeSnapshot()?.valid).toBe(false);
    expect(
      component
        .runtimeSnapshot()
        ?.fields.flatMap(({ issues }) => issues)
        .map(({ code, path }) => ({ code, path })),
    ).toEqual([
      { code: 'minLength', path: ['department'] },
      { code: 'minLength', path: ['displayName'] },
    ]);
    expect(component.baselineValue()).toEqual(
      component.selectedScenario().initialState.baselineValue,
    );
  });

  it('projects the shared advanced scenario through the independent native Angular lane', () => {
    const fixture = createComponent();
    fixture.componentInstance.selectScenario('advanced-presentation');
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;
    const form = root.querySelector<HTMLElement>(
      'form[aria-label="Selected schema form"]',
    );
    if (form === null) throw new Error('Advanced form missing.');
    const tabs = Array.from(form.querySelectorAll<HTMLElement>('[role="tab"]'));
    const panels = Array.from(
      form.querySelectorAll<HTMLElement>('[role="tabpanel"]'),
    );
    expect(fixture.componentInstance.runtimeDiagnostics()).toEqual([]);
    expect(tabs.map(({ textContent }) => textContent?.trim())).toEqual([
      'Identity',
      'Contact',
    ]);
    expect(panels).toHaveLength(2);
    expect(panels[1]?.hidden).toBe(true);
    expect(panels[1]?.querySelector('input')).not.toBeNull();
    expect(form.querySelectorAll('[id$="--trigger"]')).toHaveLength(2);
    expect(
      form.querySelectorAll('[data-schema-presentation-grid-cell]'),
    ).toHaveLength(2);
  });

  it('projects the shared recursive scenario through stable local native owners', () => {
    const fixture = createComponent();
    fixture.componentInstance.selectScenario('recursive-local-presentation');
    fixture.detectChanges();
    TestBed.tick();
    const form = (fixture.nativeElement as HTMLElement).querySelector(
      'form[aria-label="Selected schema form"]',
    );
    if (form === null) throw new Error('Recursive form missing.');
    const items = Array.from(
      form.querySelectorAll<HTMLElement>('[data-schema-item-key]'),
    );
    expect(items).toHaveLength(2);
    expect(form.querySelectorAll('[role="tablist"]')).toHaveLength(3);
    expect(
      form.querySelectorAll('[data-schema-presentation-grid-cell]'),
    ).toHaveLength(6);
    const beta = items[1];
    if (beta === undefined) throw new Error('Beta item missing.');
    const tabs = Array.from(
      beta.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    );
    tabs[1]?.click();
    fixture.detectChanges();
    const tablist = beta.querySelector('[role="tablist"]');
    expect(tablist?.id).toBe(
      `se-${encodeURIComponent(
        JSON.stringify([
          'reference-recursive-local-presentation',
          'presentation',
          ['item', ['rows'], 'beta'],
          'tabs',
          'item-tabs',
        ]),
      )}--tablist`,
    );
    beta.querySelector<HTMLButtonElement>('[id$="--move-earlier"]')?.click();
    fixture.detectChanges();
    TestBed.tick();
    expect(
      Array.from(form.querySelectorAll('[data-schema-item-key]')).includes(
        beta,
      ),
    ).toBe(true);
    expect(tabs[1]?.getAttribute('aria-selected')).toBe('true');
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

function nodeBase(formId: string, path: readonly string[]): string {
  return `se-${encodeURIComponent(JSON.stringify([formId, path]))}`;
}

function selectedTokens(select: HTMLSelectElement): readonly string[] {
  return Array.from(select.options)
    .filter((option) => option.selected)
    .map(({ value }) => value);
}
