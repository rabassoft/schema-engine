import { Component, ViewChild, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  compileFormDefinition,
  type ControlledFormRuntimeOptions,
  type Diagnostic,
  type FormOperation,
  type SchemaValidator,
} from '@rabassoft/schema-engine';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  SchemaFormDirective,
  provideSchemaEngineAngular,
  provideSchemaEngineAngularNative,
  provideSchemaTextResolver,
} from '../dist/index.js';
import { FakeRenderer } from '../dist/testing/fake-renderer.js';

const schema = Object.freeze({
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: Object.freeze({
    show: Object.freeze({ type: 'boolean', title: 'Show fields' }),
    enable: Object.freeze({ type: 'boolean', title: 'Enable fields' }),
    visibleTarget: Object.freeze({
      type: Object.freeze(['string', 'null']),
      title: 'Visible target',
      description: 'Visible supporting text',
    }),
    enabledName: Object.freeze({
      type: Object.freeze(['string', 'null']),
      title: 'Enabled name',
      description: 'Disabled supporting text',
    }),
    enabledAmount: Object.freeze({
      type: Object.freeze(['number', 'null']),
      title: 'Enabled amount',
    }),
    enabledActive: Object.freeze({
      type: Object.freeze(['boolean', 'null']),
      title: 'Enabled active',
    }),
    enabledStatus: Object.freeze({
      type: 'string',
      title: 'Enabled status',
      enum: Object.freeze(['draft', 'published']),
    }),
  }),
});

const compiled = compileFormDefinition({
  schema,
  uiSchema: {
    fields: {
      visibleTarget: {
        visibleWhen: { path: ['show'], equals: true },
      },
      enabledName: {
        enabledWhen: { path: ['enable'], equals: true },
      },
      enabledAmount: {
        enabledWhen: { path: ['enable'], equals: true },
      },
      enabledActive: {
        enabledWhen: { path: ['enable'], equals: true },
      },
      enabledStatus: {
        enabledWhen: { path: ['enable'], equals: true },
      },
    },
  },
});
if (!compiled.success) throw new Error('conditional Angular fixture failed');
const definition = compiled.definition;
const initialValue = Object.freeze({
  show: true,
  enable: true,
  visibleTarget: 'initial',
  enabledName: 'name',
  enabledAmount: 12,
  enabledActive: true,
  enabledStatus: 'draft',
});
const validValidator: SchemaValidator = Object.freeze({
  validate: () => ({ valid: true, issues: [] }),
});
const issueValidator: SchemaValidator = Object.freeze({
  validate: () => ({
    valid: false,
    issues: [
      {
        code: 'disabled-issue',
        path: ['enabledName'],
        parameters: {},
        fallbackMessage: 'Disabled issue remains visible',
      },
    ],
  }),
});

@Component({
  standalone: true,
  imports: [SchemaFormDirective],
  template: `<div
    [schemaForm]="config()"
    (schemaOperation)="operations.push($event)"
    (schemaDiagnostics)="diagnostics.push($event)"
  ></div>`,
})
class ConditionalHost {
  readonly config = signal(createConfig());
  readonly operations: FormOperation[] = [];
  readonly diagnostics: (readonly Diagnostic[])[] = [];
  @ViewChild(SchemaFormDirective) form?: SchemaFormDirective<
    Record<string, unknown>
  >;
}

describe('Angular conditional field projection', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    FakeRenderer.latest = undefined;
    FakeRenderer.instances = [];
    FakeRenderer.created = 0;
    FakeRenderer.destroyed = 0;
    FakeRenderer.emitOnDestroy = false;
  });

  it('keeps custom renderers mounted, hidden and stale-output safe without reselection', () => {
    const tester = vi.fn(() => 1);
    TestBed.configureTestingModule({
      providers: [
        provideSchemaTextResolver({
          resolve: (text, context) => `${context.locale}:${text}`,
        }),
        provideSchemaEngineAngular({
          id: 'conditional-fake',
          renderer: FakeRenderer,
          tester,
        }),
      ],
    });
    const fixture = TestBed.createComponent(ConditionalHost);
    fixture.detectChanges();
    TestBed.tick();
    const target = fakeRenderer('visibleTarget');
    const targetHost = leafHost(
      fixture.nativeElement as HTMLElement,
      'visibleTarget',
    );
    const created = FakeRenderer.created;
    expect(tester).toHaveBeenCalledTimes(definition.fields.length);

    target.fieldFocus.emit();
    TestBed.tick();
    expect(target.snapshot()).toMatchObject({ focused: true, touched: false });

    fixture.componentInstance.config.set(
      createConfig({
        locale: 'es',
        value: { ...initialValue, show: false, visibleTarget: 'confirmed' },
      }),
    );
    fixture.detectChanges();
    TestBed.tick();

    expect(fakeRenderer('visibleTarget')).toBe(target);
    expect(FakeRenderer.created).toBe(created);
    expect(FakeRenderer.destroyed).toBe(0);
    expect(tester).toHaveBeenCalledTimes(definition.fields.length);
    expect(targetHost.hidden).toBe(true);
    expect(targetHost.hasAttribute('inert')).toBe(true);
    expect(targetHost.getAttribute('aria-hidden')).toBe('true');
    expect(target.snapshot()).toMatchObject({
      visible: false,
      focused: false,
      touched: false,
      presence: { kind: 'value', value: 'confirmed' },
    });
    expect(target.locale()).toBe('es');
    expect(target.texts().label).toBe('es:Visible target');

    target.setValue.emit('stale');
    target.removeValue.emit();
    target.fieldFocus.emit();
    target.fieldBlur.emit();
    TestBed.tick();
    expect(fixture.componentInstance.operations).toEqual([]);
    expect(target.snapshot()).toMatchObject({ focused: false, touched: false });
    expect(fixture.componentInstance.diagnostics.flat()).toMatchObject([
      {
        code: 'INACTIVE_RUNTIME_FIELD',
        parameters: { action: 'requestSetValue', reason: 'hidden' },
      },
      {
        code: 'INACTIVE_RUNTIME_FIELD',
        parameters: { action: 'requestRemoveValue', reason: 'hidden' },
      },
      {
        code: 'INACTIVE_RUNTIME_FIELD',
        parameters: { action: 'focus', reason: 'hidden' },
      },
      {
        code: 'INACTIVE_RUNTIME_FIELD',
        parameters: { action: 'blur', reason: 'hidden' },
      },
    ]);

    fixture.componentInstance.config.set(
      createConfig({
        locale: 'es',
        value: { ...initialValue, visibleTarget: 'restored' },
      }),
    );
    fixture.detectChanges();
    TestBed.tick();
    expect(fakeRenderer('visibleTarget')).toBe(target);
    expect(tester).toHaveBeenCalledTimes(definition.fields.length);
    expect(targetHost.hidden).toBe(false);
    expect(targetHost.hasAttribute('inert')).toBe(false);
    expect(targetHost.hasAttribute('aria-hidden')).toBe(false);
    expect(target.snapshot()).toMatchObject({ visible: true, focused: false });

    const disabled = fakeRenderer('enabledName');
    fixture.componentInstance.config.set(
      createConfig({ value: { ...initialValue, enable: false } }),
    );
    fixture.detectChanges();
    TestBed.tick();
    expect(fakeRenderer('enabledName')).toBe(disabled);
    expect(tester).toHaveBeenCalledTimes(definition.fields.length);
    expect(disabled.snapshot()).toMatchObject({
      visible: true,
      enabled: false,
    });
    disabled.setValue.emit('stale');
    disabled.removeValue.emit();
    disabled.fieldFocus.emit();
    disabled.fieldBlur.emit();
    TestBed.tick();
    expect(fixture.componentInstance.operations).toEqual([]);
    expect(disabled.snapshot()).toMatchObject({
      focused: false,
      touched: false,
    });
    expect(
      fixture.componentInstance.diagnostics.flat().slice(-4),
    ).toMatchObject([
      {
        code: 'INACTIVE_RUNTIME_FIELD',
        parameters: { action: 'requestSetValue', reason: 'disabled' },
      },
      {
        code: 'INACTIVE_RUNTIME_FIELD',
        parameters: { action: 'requestRemoveValue', reason: 'disabled' },
      },
      {
        code: 'INACTIVE_RUNTIME_FIELD',
        parameters: { action: 'focus', reason: 'disabled' },
      },
      {
        code: 'INACTIVE_RUNTIME_FIELD',
        parameters: { action: 'blur', reason: 'disabled' },
      },
    ]);

    fixture.destroy();
    expect(FakeRenderer.destroyed).toBe(created);
  });

  it('disables every native editable control and action while retaining supporting state', () => {
    TestBed.configureTestingModule({
      providers: [provideSchemaEngineAngularNative()],
    });
    const fixture = TestBed.createComponent(ConditionalHost);
    fixture.componentInstance.config.set(
      createConfig({
        validator: issueValidator,
        validationVisibility: 'all',
        value: { ...initialValue, enable: false },
      }),
    );
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;

    for (const name of [
      'enabledName',
      'enabledAmount',
      'enabledActive',
      'enabledStatus',
    ]) {
      const control = byId(root, nodeBase('conditional-angular', [name])) as
        HTMLInputElement | HTMLSelectElement;
      const clear = byId(
        root,
        `${nodeBase('conditional-angular', [name])}-clear`,
      ) as HTMLButtonElement;
      expect(control.disabled).toBe(true);
      expect(clear.disabled).toBe(true);
    }
    for (const name of ['enabledName', 'enabledAmount', 'enabledActive']) {
      const setNull = byId(
        root,
        `${nodeBase('conditional-angular', [name])}-set-null`,
      ) as HTMLButtonElement;
      expect(setNull.disabled).toBe(true);
    }
    expect(root.textContent).toContain('Disabled supporting text');
    expect(root.textContent).toContain('Disabled issue remains visible');
    expect(
      fixture.componentInstance.form
        ?.snapshot()
        ?.fields.find(({ path }) => path[0] === 'enabledName'),
    ).toMatchObject({ enabled: false, valid: false, showIssues: true });

    const operationCount = fixture.componentInstance.operations.length;
    const name = byId(
      root,
      nodeBase('conditional-angular', ['enabledName']),
    ) as HTMLInputElement;
    name.value = 'blocked';
    name.dispatchEvent(new Event('input', { bubbles: true }));
    name.dispatchEvent(new Event('focus', { bubbles: true }));
    name.dispatchEvent(new Event('blur', { bubbles: true }));
    byId(
      root,
      `${nodeBase('conditional-angular', ['enabledName'])}-clear`,
    ).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    byId(
      root,
      `${nodeBase('conditional-angular', ['enabledName'])}-set-null`,
    ).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    TestBed.tick();
    expect(fixture.componentInstance.operations).toHaveLength(operationCount);
    expect(fixture.componentInstance.diagnostics).toEqual([]);
  });

  it('reconciles the same native edit buffer while hidden and restores the same host', () => {
    TestBed.configureTestingModule({
      providers: [provideSchemaEngineAngularNative()],
    });
    const fixture = TestBed.createComponent(ConditionalHost);
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;
    const id = nodeBase('conditional-angular', ['visibleTarget']);
    const input = byId(root, id) as HTMLInputElement;
    const host = leafHost(root, 'visibleTarget');

    input.value = 'unconfirmed';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(fixture.componentInstance.operations.at(-1)).toMatchObject({
      type: 'set-value',
      path: ['visibleTarget'],
      value: 'unconfirmed',
    });
    expect(input.value).toBe('unconfirmed');

    fixture.componentInstance.config.set(
      createConfig({
        value: { ...initialValue, show: false, visibleTarget: 'confirmed' },
      }),
    );
    fixture.detectChanges();
    TestBed.tick();
    expect(host.hidden).toBe(true);
    expect(byId(root, id)).toBe(input);
    expect(input.value).toBe('confirmed');

    fixture.componentInstance.config.set(
      createConfig({
        value: { ...initialValue, visibleTarget: 'restored' },
      }),
    );
    fixture.detectChanges();
    TestBed.tick();
    expect(host.hidden).toBe(false);
    expect(byId(root, id)).toBe(input);
    expect(input.value).toBe('restored');
  });
});

function createConfig(
  overrides: Partial<
    ControlledFormRuntimeOptions<Record<string, unknown>>
  > = {},
): ControlledFormRuntimeOptions<Record<string, unknown>> {
  return {
    formId: 'conditional-angular',
    definition,
    schema,
    value: initialValue,
    baselineValue: initialValue,
    locale: 'en',
    validator: validValidator,
    ...overrides,
  };
}

function fakeRenderer(name: string): FakeRenderer {
  const renderer = FakeRenderer.instances.find(
    (candidate) => candidate.field().name === name,
  );
  if (renderer === undefined) throw new Error(`Missing renderer ${name}.`);
  return renderer;
}

function leafHost(root: HTMLElement, name: string): HTMLElement {
  const index = definition.fields.findIndex((field) => field.name === name);
  const host = root.querySelectorAll<HTMLElement>('schema-leaf-outlet-host')[
    index
  ];
  if (host === undefined) throw new Error(`Missing host ${name}.`);
  return host;
}

function byId(root: HTMLElement, id: string): HTMLElement {
  const element = root.querySelector<HTMLElement>(`[id="${id}"]`);
  if (element === null) throw new Error(`Missing element ${id}.`);
  return element;
}

function nodeBase(formId: string, path: readonly string[]): string {
  return `se-${encodeURIComponent(JSON.stringify([formId, path]))}`;
}
