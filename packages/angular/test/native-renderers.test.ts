import {
  Component,
  LOCALE_ID,
  ViewChild,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  compileFormDefinition,
  type Diagnostic,
  type FormOperation,
  type SchemaValidator,
} from '@rabassoft/schema-engine';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  AngularRendererResolver,
  SchemaBooleanRendererComponent,
  SchemaFieldOutletDirective,
  SchemaFormDirective,
  SchemaNumberRendererComponent,
  SchemaStringEnumRendererComponent,
  SchemaStringRendererComponent,
  provideSchemaEngineAngular,
  provideSchemaEngineAngularNative,
  provideSchemaTextResolver,
  type AngularControlledFormConfig,
} from '../dist/index.js';

const compiled = compileFormDefinition({
  schema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    properties: {
      name: { type: 'string' },
      amount: { type: 'number' },
      active: { type: 'boolean' },
      status: { type: 'string', enum: ['', ' ', 'draft', 'published'] },
    },
    required: ['name', 'status'],
  },
  uiSchema: {
    fields: {
      name: {
        label: 'name.label',
        description: 'name.description',
        hint: 'name.hint',
        tooltip: 'name.tooltip',
        placeholder: 'name.placeholder',
      },
      amount: { options: { decimalPlaces: 2, showTrailingZeros: true } },
      status: {
        label: 'status.label',
        description: 'status.description',
        hint: 'status.hint',
        tooltip: 'status.tooltip',
        placeholder: 'status.placeholder',
        enumLabels: {
          '': 'status.empty',
          ' ': 'status.space',
          draft: 'status.draft',
        },
      },
    },
  },
});
if (!compiled.success || compiled.definition.fields.length !== 4)
  throw new Error('native fixture compilation failed');
const definition = compiled.definition;
const fields = definition.fields;
const schema = Object.freeze({});
const validValidator: SchemaValidator = Object.freeze({
  validate: () => ({ valid: true, issues: [] }),
});

@Component({
  standalone: true,
  imports: [SchemaFormDirective, SchemaFieldOutletDirective],
  template: `<div
    [schemaForm]="config()"
    (schemaOperation)="operations.push($event)"
    (schemaDiagnostics)="diagnostics.push($event)"
  >
    <ng-container [schemaFieldOutlet]="field()" />
  </div>`,
})
class NativeHost {
  readonly config = signal(createConfig());
  readonly field = signal(fields[0]!);
  readonly operations: FormOperation[] = [];
  readonly diagnostics: (readonly Diagnostic[])[] = [];
  @ViewChild(SchemaFormDirective) form?: SchemaFormDirective<
    Record<string, unknown>
  >;
}

describe('native Signal Forms renderers', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('keeps the headless provider empty and resolves native registrations explicitly', () => {
    TestBed.configureTestingModule({
      providers: [provideSchemaEngineAngular()],
    });
    expect(
      TestBed.inject(AngularRendererResolver).resolve(fields[0]!),
    ).toMatchObject({
      success: false,
      diagnostics: [{ code: 'NO_RENDERER_MATCH' }],
    });

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideSchemaEngineAngularNative()],
    });
    const resolver = TestBed.inject(AngularRendererResolver);
    expect(resolver.resolve(fields[0]!)).toMatchObject({
      success: true,
      registration: { renderer: SchemaStringRendererComponent },
    });
    expect(resolver.resolve(fields[1]!)).toMatchObject({
      success: true,
      registration: { renderer: SchemaNumberRendererComponent },
    });
    expect(resolver.resolve(fields[2]!)).toMatchObject({
      success: true,
      registration: { renderer: SchemaBooleanRendererComponent },
    });
    expect(resolver.resolve(fields[3]!)).toMatchObject({
      success: true,
      registration: {
        id: 'native-string-enum',
        renderer: SchemaStringEnumRendererComponent,
      },
    });
  });

  it('allows explicit custom registrations to override native renderers', () => {
    TestBed.configureTestingModule({
      providers: [
        provideSchemaEngineAngularNative({
          id: 'custom-string',
          renderer: SchemaBooleanRendererComponent,
          tester: (field) => (field.kind === 'string' ? 10 : null),
          priority: 1,
        }),
      ],
    });
    expect(
      TestBed.inject(AngularRendererResolver).resolve(fields[0]!),
    ).toMatchObject({
      success: true,
      registration: { id: 'custom-string' },
    });
    expect(
      TestBed.inject(AngularRendererResolver).resolve(fields[3]!),
    ).toMatchObject({
      success: true,
      registration: { id: 'native-string-enum' },
    });
  });

  it('applies rank and priority override rules at the enum rank', () => {
    TestBed.configureTestingModule({
      providers: [
        provideSchemaEngineAngularNative({
          id: 'equal-enum',
          renderer: SchemaBooleanRendererComponent,
          tester: (field) => (field === fields[3] ? 20 : null),
          priority: 0,
        }),
      ],
    });
    expect(
      TestBed.inject(AngularRendererResolver).resolve(fields[3]!),
    ).toMatchObject({
      success: true,
      registration: { id: 'native-string-enum' },
    });

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideSchemaEngineAngularNative({
          id: 'priority-enum',
          renderer: SchemaBooleanRendererComponent,
          tester: (field) => (field === fields[3] ? 20 : null),
          priority: 1,
        }),
      ],
    });
    expect(
      TestBed.inject(AngularRendererResolver).resolve(fields[3]!),
    ).toMatchObject({
      success: true,
      registration: { id: 'priority-enum' },
    });

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideSchemaEngineAngularNative({
          id: 'higher-enum',
          renderer: SchemaBooleanRendererComponent,
          tester: (field) => (field === fields[3] ? 21 : null),
          priority: -1,
        }),
      ],
    });
    expect(
      TestBed.inject(AngularRendererResolver).resolve(fields[3]!),
    ).toMatchObject({
      success: true,
      registration: { id: 'higher-enum' },
    });
  });

  it('keeps enum selection controlled and accessible through the outlet', () => {
    const validator: SchemaValidator = {
      validate: () => ({
        valid: false,
        issues: [
          {
            code: 'required',
            path: ['status'],
            parameters: {},
            fallbackMessage: 'status.required',
          },
        ],
      }),
    };
    TestBed.configureTestingModule({
      providers: [
        provideSchemaTextResolver({
          resolve: (text, context) => `${context.locale}:${text}`,
        }),
        provideSchemaEngineAngularNative(),
      ],
    });
    const fixture = TestBed.createComponent(NativeHost);
    fixture.componentInstance.field.set(fields[3]!);
    fixture.componentInstance.config.set(
      createConfig({ validator, validationVisibility: 'all', locale: 'en' }),
    );
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;
    const select = root.querySelector('select') as HTMLSelectElement;
    const label = root.querySelector('label') as HTMLLabelElement;
    const summary = root.querySelector('summary') as HTMLElement;

    expect(fixture.componentInstance.operations).toEqual([]);
    expect(select.id).toBe('se-native%20form-status');
    expect(label.htmlFor).toBe(select.id);
    expect(select.value).toBe('');
    expect(select.options[0]?.disabled).toBe(true);
    expect(select.options[0]?.textContent?.trim()).toBe(
      'en:status.placeholder',
    );
    expect(Array.from(select.options, ({ value }) => value)).toEqual([
      '',
      'choice:0',
      'choice:1',
      'choice:2',
      'choice:3',
    ]);
    expect(
      Array.from(select.options, ({ textContent }) => textContent?.trim()),
    ).toEqual([
      'en:status.placeholder',
      'en:status.empty',
      'en:status.space',
      'en:status.draft',
      'en:published',
    ]);
    expect(select.getAttribute('aria-required')).toBe('true');
    expect(select.getAttribute('aria-invalid')).toBe('true');
    expect(select.getAttribute('aria-describedby')).toBe(
      'se-native%20form-status-description se-native%20form-status-hint se-native%20form-status-errors',
    );
    expect(summary.getAttribute('aria-label')).toBe('en:status.tooltip');
    expect(root.textContent).toContain('en:status.description');
    expect(root.textContent).toContain('en:status.hint');
    expect(root.querySelector('[aria-live="polite"]')?.textContent).toContain(
      'en:status.required',
    );

    select.dispatchEvent(new Event('focus', { bubbles: true }));
    expect(fixture.componentInstance.form?.snapshot()?.fields[3]?.focused).toBe(
      true,
    );

    select.value = 'choice:1';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(fixture.componentInstance.operations).toMatchObject([
      { type: 'set-value', value: ' ' },
    ]);
    expect(fixture.componentInstance.form?.snapshot()?.value).toEqual({
      name: 'Ada',
      amount: 1234.5,
    });

    select.dispatchEvent(new Event('blur', { bubbles: true }));
    fixture.detectChanges();
    TestBed.tick();
    expect(select.value).toBe('');
    expect(fixture.componentInstance.operations).toHaveLength(1);
    expect(fixture.componentInstance.form?.snapshot()?.fields[3]).toMatchObject(
      { focused: false, touched: true },
    );

    select.value = 'choice:3';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(fixture.componentInstance.operations.at(-1)).toMatchObject({
      type: 'set-value',
      value: 'published',
    });
    expect(fixture.componentInstance.operations).toHaveLength(2);

    fixture.componentInstance.config.set(
      createConfig({
        validator,
        validationVisibility: 'all',
        value: { name: 'Ada', amount: 1234.5, status: 'published' },
      }),
    );
    fixture.detectChanges();
    TestBed.tick();
    expect(select.value).toBe('choice:3');
    expect(fixture.componentInstance.operations).toHaveLength(2);

    fixture.componentInstance.config.set(
      createConfig({
        validator,
        validationVisibility: 'all',
        locale: 'ca',
        value: { name: 'Ada', amount: 1234.5, status: 'legacy' },
      }),
    );
    fixture.detectChanges();
    TestBed.tick();
    expect(select.value).toBe('');
    expect(select.options[0]?.textContent?.trim()).toBe(
      'ca:status.placeholder',
    );
    expect(select.options[1]?.textContent?.trim()).toBe('ca:status.empty');
    expect(fixture.componentInstance.operations).toHaveLength(2);

    const operationCount = fixture.componentInstance.operations.length;
    expect(select.isConnected).toBe(true);
    fixture.destroy();
    expect(select.isConnected).toBe(false);
    select.value = 'choice:3';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(fixture.componentInstance.operations).toHaveLength(operationCount);
  });

  it('runs the enum outlet under explicit zoneless change detection', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideSchemaEngineAngularNative(),
      ],
    });
    const fixture = TestBed.createComponent(NativeHost);
    fixture.componentInstance.field.set(fields[3]!);
    fixture.componentInstance.config.set(
      createConfig({
        value: { name: 'Ada', amount: 1234.5, status: 'draft' },
      }),
    );
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;
    const select = root.querySelector('select') as HTMLSelectElement;
    expect(select.value).toBe('choice:2');

    select.value = 'choice:3';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(fixture.componentInstance.operations).toMatchObject([
      { type: 'set-value', value: 'published' },
    ]);
  });

  it('uses LOCALE_ID, resolves text, and keeps string edits controlled', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: LOCALE_ID, useValue: 'es-ES' },
        provideSchemaTextResolver({
          resolve: (text, context) => `${context.locale}:${text}`,
        }),
        provideSchemaEngineAngularNative(),
      ],
    });
    const fixture = TestBed.createComponent(NativeHost);
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;
    const input = root.querySelector('input') as HTMLInputElement;
    expect(fixture.componentInstance.form?.snapshot()?.locale).toBe('es-ES');
    expect(input.value).toBe('Ada');
    expect(input.id).toBe('se-native%20form-name');
    expect(input.getAttribute('aria-describedby')).toContain('-description');
    expect(root.textContent).toContain('es-ES:name.label');

    input.value = 'Grace';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(fixture.componentInstance.operations).toMatchObject([
      { type: 'set-value', value: 'Grace' },
    ]);
    expect(fixture.componentInstance.form?.snapshot()?.value).toEqual({
      name: 'Ada',
      amount: 1234.5,
    });

    input.dispatchEvent(new Event('blur', { bubbles: true }));
    fixture.detectChanges();
    TestBed.tick();
    expect(input.value).toBe('Ada');

    fixture.componentInstance.config.set(
      createConfig({ value: { name: 'Grace', amount: 1234.5 } }),
    );
    fixture.detectChanges();
    TestBed.tick();
    expect(input.value).toBe('Grace');
  });

  it('parses localized numeric text, preserves incomplete input, and removes empty values', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideSchemaEngineAngularNative(),
      ],
    });
    const fixture = TestBed.createComponent(NativeHost);
    fixture.componentInstance.field.set(fields[1]!);
    fixture.componentInstance.config.set(createConfig({ locale: 'es-ES' }));
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;
    const input = root.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('1.234,50');

    input.dispatchEvent(new Event('focus', { bubbles: true }));
    expect(input.value).toBe('1234,5');
    input.value = '12,';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(fixture.componentInstance.operations).toHaveLength(0);
    expect(input.value).toBe('12,');

    input.value = '12,5';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(fixture.componentInstance.operations.at(-1)).toMatchObject({
      type: 'set-value',
      value: 12.5,
    });

    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(fixture.componentInstance.operations.at(-1)).toMatchObject({
      type: 'remove-value',
    });

    input.dispatchEvent(new Event('blur', { bubbles: true }));
    fixture.detectChanges();
    TestBed.tick();
    expect(input.value).toBe('1.234,50');
  });

  it('maps missing booleans to unchecked and emits explicit checked values', () => {
    TestBed.configureTestingModule({
      providers: [provideSchemaEngineAngularNative()],
    });
    const fixture = TestBed.createComponent(NativeHost);
    fixture.componentInstance.field.set(fields[2]!);
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;
    const input = root.querySelector('input') as HTMLInputElement;
    expect(input.checked).toBe(false);
    expect(input.hasAttribute('aria-required')).toBe(false);

    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    expect(fixture.componentInstance.operations.at(-1)).toMatchObject({
      type: 'set-value',
      value: true,
    });
  });

  it('projects visible issues accessibly and isolates text resolver failures', () => {
    const validator: SchemaValidator = {
      validate: () => ({
        valid: false,
        issues: [
          {
            code: 'required',
            path: ['name'],
            parameters: {},
            fallbackMessage: 'Required name',
          },
        ],
      }),
    };
    TestBed.configureTestingModule({
      providers: [
        provideSchemaTextResolver({
          resolve: (text, context) => {
            if (context.member === 'hint') throw new Error('hidden');
            return text;
          },
        }),
        provideSchemaEngineAngularNative(),
      ],
    });
    const fixture = TestBed.createComponent(NativeHost);
    fixture.componentInstance.config.set(
      createConfig({ validator, validationVisibility: 'all' }),
    );
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;
    const input = root.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(root.querySelector('[aria-live="polite"]')?.textContent).toContain(
      'Required name',
    );
    expect(
      fixture.componentInstance.diagnostics
        .flat()
        .some(({ code }) => code === 'TEXT_RESOLUTION_FAILED'),
    ).toBe(true);
  });

  it('forwards renderer diagnostics for invalid number locales', () => {
    TestBed.configureTestingModule({
      providers: [provideSchemaEngineAngularNative()],
    });
    const fixture = TestBed.createComponent(NativeHost);
    fixture.componentInstance.field.set(fields[1]!);
    fixture.componentInstance.config.set(
      createConfig({ locale: 'not_a_locale' }),
    );
    fixture.detectChanges();
    TestBed.tick();
    expect(
      fixture.componentInstance.diagnostics
        .flat()
        .some(({ code }) => code === 'INVALID_NUMBER_LOCALE'),
    ).toBe(true);
  });
});

function createConfig(
  overrides: Partial<AngularControlledFormConfig<Record<string, unknown>>> = {},
): AngularControlledFormConfig<Record<string, unknown>> {
  return {
    formId: 'native form',
    definition,
    schema,
    value: { name: 'Ada', amount: 1234.5 },
    baselineValue: { name: 'Ada', amount: 1234.5 },
    validator: validValidator,
    ...overrides,
  };
}
