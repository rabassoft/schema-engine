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
  imports: [SchemaFormDirective],
  template: `<div
    [schemaForm]="config()"
    (schemaOperation)="recordOperation($event)"
    (schemaDiagnostics)="diagnostics.push($event)"
  ></div>`,
})
class NativeHost {
  readonly config = signal(createConfig());
  readonly field = signal(fields[0]!);
  readonly operations: FormOperation[] = [];
  readonly operationFocusStates: boolean[] = [];
  readonly diagnostics: (readonly Diagnostic[])[] = [];
  @ViewChild(SchemaFormDirective) form?: SchemaFormDirective<
    Record<string, unknown>
  >;

  recordOperation(operation: FormOperation): void {
    this.operations.push(operation);
    const fieldSnapshot = this.form
      ?.snapshot()
      ?.fields.find(
        ({ path }) =>
          path.length === operation.path.length &&
          path.every((segment, index) =>
            Object.is(segment, operation.path[index]),
          ),
      );
    this.operationFocusStates.push(fieldSnapshot?.focused ?? false);
  }
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
    const base = nodeBase('native form', ['status']);
    const select = controlByBase(root, base) as HTMLSelectElement;
    const label = root.querySelector(
      `[id="${base}-label"]`,
    ) as HTMLLabelElement;
    const summary = select.parentElement?.querySelector(
      'summary',
    ) as HTMLElement;

    expect(fixture.componentInstance.operations).toEqual([]);
    expect(select.id).toBe(base);
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
      `${base}-description ${base}-hint ${base}-errors`,
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
    expect(root.querySelector('button')?.textContent?.trim()).toBe('ca:Clear');
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

  it('clears every present native value with focus-first accessible actions', () => {
    TestBed.configureTestingModule({
      providers: [
        provideSchemaTextResolver({
          resolve: (text, context) =>
            context.member === 'clear' ? 'Erase' : text,
        }),
        provideSchemaEngineAngularNative(),
      ],
    });
    const cases = [
      {
        field: fields[0]!,
        key: 'name',
        value: { name: '', amount: 1234.5 },
        expected: '',
      },
      {
        field: fields[0]!,
        key: 'name',
        value: { name: 42, amount: 1234.5 },
        expected: 42,
      },
      {
        field: fields[1]!,
        key: 'amount',
        value: { name: 'Ada', amount: -0 },
        expected: -0,
      },
      {
        field: fields[1]!,
        key: 'amount',
        value: { name: 'Ada', amount: 'legacy' },
        expected: 'legacy',
      },
      {
        field: fields[2]!,
        key: 'active',
        value: { name: 'Ada', amount: 1234.5, active: false },
        expected: false,
      },
      {
        field: fields[2]!,
        key: 'active',
        value: { name: 'Ada', amount: 1234.5, active: 'legacy' },
        expected: 'legacy',
      },
      {
        field: fields[3]!,
        key: 'status',
        value: { name: 'Ada', amount: 1234.5, status: '' },
        expected: '',
      },
      {
        field: fields[3]!,
        key: 'status',
        value: { name: 'Ada', amount: 1234.5, status: 'legacy' },
        expected: 'legacy',
      },
      {
        field: fields[3]!,
        key: 'status',
        value: { name: 'Ada', amount: 1234.5, status: 42 },
        expected: 42,
      },
    ] as const;

    for (const current of cases) {
      const fixture = TestBed.createComponent(NativeHost);
      fixture.componentInstance.field.set(current.field);
      fixture.componentInstance.config.set(
        createConfig({ value: current.value }),
      );
      fixture.detectChanges();
      TestBed.tick();
      const root = fixture.nativeElement as HTMLElement;
      const base = nodeBase('native form', [current.key]);
      const control = controlByBase(root, base);
      const label = root.querySelector(
        `[id="${base}-label"]`,
      ) as HTMLLabelElement;
      const button = root.querySelector(
        `[id="${base}-clear"]`,
      ) as HTMLButtonElement;

      expect(button).not.toBeNull();
      expect(button.type).toBe('button');
      expect(button.id).toBe(`${base}-clear`);
      expect(button.textContent?.trim()).toBe('Erase');
      expect(label.id).toBe(`${base}-label`);
      expect(label.htmlFor).toBe(control.id);
      expect(button.getAttribute('aria-labelledby')).toBe(
        `${base}-clear ${base}-label`,
      );

      if (current.key === 'name' && current.expected === '') {
        control.focus();
        expect(
          fixture.componentInstance.form?.snapshot()?.fields[0]?.focused,
        ).toBe(true);
        button.focus();
        expect(document.activeElement).toBe(button);
        expect(
          fixture.componentInstance.form?.snapshot()?.fields[0],
        ).toMatchObject({ focused: false, touched: true });
      }

      button.click();
      expect(document.activeElement).toBe(control);
      const operation = fixture.componentInstance.operations.at(-1);
      expect(operation).toMatchObject({
        type: 'remove-value',
        path: [current.key],
      });
      if (operation?.type !== 'remove-value')
        throw new Error('clear must emit remove-value');
      expect(Object.is(operation.expected.value, current.expected)).toBe(true);
      expect(fixture.componentInstance.operationFocusStates.at(-1)).toBe(true);
      expect(root.querySelector(`[id="${base}-clear"]`)).toBe(button);

      if (current.key === 'name' && current.expected === '') {
        const count = fixture.componentInstance.operations.length;
        button.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
        );
        button.dispatchEvent(
          new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }),
        );
        button.click();
        expect(fixture.componentInstance.operations).toHaveLength(count + 1);
      }

      const confirmedMissing = { ...current.value } as Record<string, unknown>;
      delete confirmedMissing[current.key];
      const operationCount = fixture.componentInstance.operations.length;
      fixture.componentInstance.config.set(
        createConfig({ value: confirmedMissing }),
      );
      fixture.detectChanges();
      TestBed.tick();
      expect(root.querySelector(`[id="${base}-clear"]`)).toBeNull();
      expect(fixture.componentInstance.operations).toHaveLength(operationCount);
      fixture.destroy();
    }
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
    const base = nodeBase('native form', ['name']);
    const input = controlByBase(root, base) as HTMLInputElement;
    expect(fixture.componentInstance.form?.snapshot()?.locale).toBe('es-ES');
    expect(input.value).toBe('Ada');
    expect(input.id).toBe(base);
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
    const input = controlByBase(
      root,
      nodeBase('native form', ['amount']),
    ) as HTMLInputElement;
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
    const operationCount = fixture.componentInstance.operations.length;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(fixture.componentInstance.operations.at(-1)).toMatchObject({
      type: 'remove-value',
    });
    expect(fixture.componentInstance.operations).toHaveLength(
      operationCount + 1,
    );

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
    const base = nodeBase('native form', ['active']);
    const input = controlByBase(root, base) as HTMLInputElement;
    expect(input.checked).toBe(false);
    expect(input.hasAttribute('aria-required')).toBe(false);
    expect(root.querySelector(`[id="${base}-clear"]`)).toBeNull();

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
    const input = controlByBase(
      root,
      nodeBase('native form', ['name']),
    ) as HTMLInputElement;
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

function nodeBase(formId: string, path: readonly string[]): string {
  return `se-${encodeURIComponent(JSON.stringify([formId, path]))}`;
}

function controlByBase(root: HTMLElement, base: string): HTMLElement {
  const control = root.querySelector(`[id="${base}"]`);
  if (!(control instanceof HTMLElement)) throw new Error('control is missing');
  return control;
}
