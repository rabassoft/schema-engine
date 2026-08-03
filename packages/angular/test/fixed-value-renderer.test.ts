import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  compileFormDefinition,
  type FieldDefinition,
  type FieldRuntimeSnapshot,
  type StringFieldDefinition,
  type ValidationIssue,
} from '@rabassoft/schema-engine';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  AngularRendererResolver,
  SchemaBooleanRendererComponent,
  SchemaFixedValueRendererComponent,
  SchemaStringEnumRendererComponent,
  SchemaStringRendererComponent,
  provideSchemaEngineAngularNative,
  type AngularFieldTextSnapshot,
} from '../dist/index.js';

const fields = compileFields();
const stringField = fields[0]!;
const numberField = fields[1]!;
const integerField = fields[2]!;
const booleanField = fields[3]!;
const nullableField = fields[4]!;
const texts: AngularFieldTextSnapshot = Object.freeze({
  label: 'Fixed label',
  description: 'Fixed description',
  hint: 'Fixed hint',
  tooltip: 'Fixed tooltip',
  clearLabel: 'Clear',
  setNullLabel: 'Set null',
  nullValueLabel: 'Localized null',
  fixedMissingLabel: 'Localized missing',
  fixedUnavailableLabel: 'Localized unavailable',
  fixedIncompatibleLabel: 'Localized incompatible',
  choiceLabels: Object.freeze(['Fixed', 'Other']),
  missingSelectionLabel: 'No value provided.',
  emptySelectionLabel: 'No values selected.',
  issueMessages: Object.freeze(['Must equal constant']),
});
const issue: ValidationIssue = Object.freeze({
  code: 'const',
  keyword: 'const',
  path: Object.freeze(['label']),
  parameters: Object.freeze({ allowedValue: 'fixed' }),
  fallbackMessage: 'must be equal to constant',
});

describe('native fixed-value renderer', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('selects own fixed values at rank 30 and preserves explicit overrides', () => {
    TestBed.configureTestingModule({
      providers: [
        provideSchemaEngineAngularNative({
          id: 'fixed-override',
          renderer: SchemaBooleanRendererComponent,
          tester: (field) => (field === stringField ? 30 : null),
          priority: 1,
        }),
      ],
    });
    const resolver = TestBed.inject(AngularRendererResolver);
    expect(resolver.resolve(stringField)).toMatchObject({
      success: true,
      registration: {
        id: 'fixed-override',
        renderer: SchemaBooleanRendererComponent,
      },
    });
    for (const field of fields.slice(1)) {
      expect(resolver.resolve(field)).toMatchObject({
        success: true,
        registration: {
          id: 'native-fixed',
          renderer: SchemaFixedValueRendererComponent,
          priority: 0,
        },
      });
    }

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideSchemaEngineAngularNative({
          id: 'fixed-tie',
          renderer: SchemaBooleanRendererComponent,
          tester: (field) => (field === stringField ? 30 : null),
          priority: 0,
        }),
      ],
    });
    expect(
      TestBed.inject(AngularRendererResolver).resolve(stringField),
    ).toMatchObject({
      success: true,
      registration: { id: 'native-fixed' },
    });
  });

  it('ignores inherited and accessor fixedValue members without reading them', () => {
    let getterCalls = 0;
    const ordinary = { ...stringField } as StringFieldDefinition;
    delete (ordinary as { fixedValue?: unknown }).fixedValue;
    const accessor = Object.defineProperty({ ...ordinary }, 'fixedValue', {
      get() {
        getterCalls += 1;
        return 'fixed';
      },
    });
    const inherited = Object.assign(
      Object.create({ fixedValue: 'fixed' }) as object,
      ordinary,
    );
    TestBed.configureTestingModule({
      providers: [provideSchemaEngineAngularNative()],
    });
    const resolver = TestBed.inject(AngularRendererResolver);
    expect(resolver.resolve(accessor)).toMatchObject({
      success: true,
      registration: { renderer: SchemaStringEnumRendererComponent },
    });
    expect(resolver.resolve(inherited)).toMatchObject({
      success: true,
      registration: { renderer: SchemaStringEnumRendererComponent },
    });
    expect(getterCalls).toBe(0);

    const plain = { ...ordinary };
    delete (plain as { choices?: unknown }).choices;
    expect(resolver.resolve(plain)).toMatchObject({
      success: true,
      registration: { renderer: SchemaStringRendererComponent },
    });
  });

  it('renders controlled mismatch metadata and visible issues accessibly', () => {
    const fixture = createFixture(
      stringField,
      snapshot({ kind: 'value', value: '  other  ' }, false, true),
    );
    const root = fixture.nativeElement as HTMLElement;
    const base = nodeBase('fixed form', ['label']);
    const group = root.querySelector('[role="group"]') as HTMLElement;
    const value = root.querySelector(
      `[id="${base}-fixed-value"]`,
    ) as HTMLElement;

    expect(group.id).toBe(base);
    expect(group.tabIndex).toBe(-1);
    expect(group.getAttribute('aria-labelledby')).toBe(`${base}-label`);
    expect(group.getAttribute('aria-describedby')).toBe(
      `${base}-description ${base}-hint ${base}-errors`,
    );
    expect(group.getAttribute('aria-invalid')).toBe('true');
    expect(group.hasAttribute('aria-required')).toBe(false);
    expect(value.textContent).toBe('  other  ');
    expect(value.dataset['fixedValueState']).toBe('value');
    expect(getComputedStyle(value).whiteSpace).toBe('pre-wrap');
    expect(root.querySelector('summary')?.getAttribute('aria-label')).toBe(
      'Fixed tooltip',
    );
    expect(root.querySelector('[aria-live="polite"]')?.textContent).toContain(
      'Must equal constant',
    );
    expect(root.querySelector('input, select, button, [tabindex]')).toBeNull();
  });

  it.each([
    [stringField, { kind: 'value', value: '' }, 'value', '""'],
    [numberField, { kind: 'value', value: 0 }, 'value', '0'],
    [numberField, { kind: 'value', value: -0 }, 'value', '-0'],
    [integerField, { kind: 'value', value: 3 }, 'value', '3'],
    [booleanField, { kind: 'value', value: false }, 'value', 'false'],
    [nullableField, { kind: 'value', value: null }, 'value', 'Localized null'],
    [stringField, { kind: 'missing' }, 'missing', 'Localized missing'],
    [
      stringField,
      { kind: 'blocked', reason: 'missing-ancestor', at: ['parent'] },
      'unavailable',
      'Localized unavailable',
    ],
    [
      stringField,
      { kind: 'blocked', reason: 'incompatible-ancestor', at: ['parent'] },
      'unavailable',
      'Localized unavailable',
    ],
    [
      integerField,
      { kind: 'value', value: 1.5 },
      'incompatible',
      'Localized incompatible',
    ],
    [
      booleanField,
      { kind: 'value', value: {} },
      'incompatible',
      'Localized incompatible',
    ],
  ] as const)(
    'renders the exact controlled state table',
    (field, presence, state, text) => {
      const fixture = createFixture(field, snapshot(presence));
      const value = (fixture.nativeElement as HTMLElement).querySelector(
        '[data-fixed-value-state]',
      ) as HTMLElement;
      expect(value.dataset['fixedValueState']).toBe(state);
      expect(value.textContent).toBe(text);
    },
  );

  it('never emits intentions or renderer diagnostics across updates and destroy', () => {
    const fixture = createFixture(stringField, snapshot({ kind: 'missing' }));
    const emitted: unknown[] = [];
    for (const output of [
      fixture.componentInstance.setValue,
      fixture.componentInstance.removeValue,
      fixture.componentInstance.fieldFocus,
      fixture.componentInstance.fieldBlur,
      fixture.componentInstance.rendererDiagnostics,
    ]) {
      output.subscribe((value) => emitted.push(value));
    }
    fixture.componentRef.setInput(
      'snapshot',
      snapshot({ kind: 'value', value: 'fixed' }, true, true),
    );
    fixture.componentRef.setInput('locale', 'es');
    fixture.componentRef.setInput('texts', {
      ...texts,
      fixedMissingLabel: 'Falta el valor',
    });
    fixture.detectChanges();
    TestBed.tick();
    fixture.destroy();
    expect(emitted).toEqual([]);
  });
});

function createFixture(
  field: FieldDefinition,
  fieldSnapshot: FieldRuntimeSnapshot,
) {
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()],
  });
  const fixture = TestBed.createComponent(SchemaFixedValueRendererComponent);
  fixture.componentRef.setInput('field', field);
  fixture.componentRef.setInput('snapshot', fieldSnapshot);
  fixture.componentRef.setInput('formId', 'fixed form');
  fixture.componentRef.setInput('locale', 'en');
  fixture.componentRef.setInput('texts', texts);
  fixture.detectChanges();
  TestBed.tick();
  return fixture;
}

function snapshot(
  presence: FieldRuntimeSnapshot['presence'],
  valid = true,
  showIssues = false,
): FieldRuntimeSnapshot {
  return Object.freeze({
    nodeKind: 'field',
    key: 'label',
    path: Object.freeze(['label']),
    presence: Object.freeze(presence),
    dirty: false,
    touched: false,
    focused: false,
    visible: true,
    enabled: true,
    valid,
    issues: showIssues ? Object.freeze([issue]) : Object.freeze([]),
    showIssues,
  });
}

function compileFields(): readonly FieldDefinition[] {
  const result = compileFormDefinition({
    schema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        label: {
          type: 'string',
          enum: ['fixed', 'other'],
          const: 'fixed',
          description: 'Fixed description',
        },
        ratio: { type: 'number', const: 1.5 },
        count: { type: 'integer', const: 2 },
        enabled: { type: 'boolean', const: false },
        optional: { type: ['string', 'null'], const: null },
      },
      required: ['label'],
    },
    uiSchema: {
      fields: {
        label: { hint: 'Fixed hint', tooltip: 'Fixed tooltip' },
      },
    },
  });
  if (!result.success) throw new Error('fixed fixture compilation failed');
  return result.definition.fields;
}

function nodeBase(formId: string, path: readonly string[]): string {
  return `se-${encodeURIComponent(JSON.stringify([formId, path]))}`;
}
