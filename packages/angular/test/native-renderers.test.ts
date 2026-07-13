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
    },
    required: ['name'],
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
    },
  },
});
if (!compiled.success || compiled.definition.fields.length !== 3)
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
