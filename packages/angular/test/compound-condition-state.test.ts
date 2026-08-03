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
    gate: Object.freeze({ type: 'boolean', title: 'Gate' }),
    flag: Object.freeze({ type: 'boolean', title: 'Flag' }),
    count: Object.freeze({ type: 'number', title: 'Count' }),
    text: Object.freeze({ type: 'string', title: 'Text' }),
    nullable: Object.freeze({
      type: Object.freeze(['string', 'null']),
      title: 'Nullable',
    }),
    hiddenSource: Object.freeze({
      type: 'string',
      title: 'Hidden source',
    }),
    directTarget: Object.freeze({
      type: Object.freeze(['string', 'null']),
      title: 'Direct target',
    }),
    profile: Object.freeze({
      type: 'object',
      title: 'Profile',
      properties: Object.freeze({
        flag: Object.freeze({ type: 'boolean', title: 'Profile flag' }),
        target: Object.freeze({
          type: Object.freeze(['string', 'null']),
          title: 'Nested target',
        }),
      }),
    }),
  }),
});

function compileDefinition() {
  const compiled = compileFormDefinition({
    schema,
    uiSchema: {
      fields: {
        hiddenSource: {
          visibleWhen: { path: ['gate'], equals: true },
        },
        directTarget: {
          visibleWhen: {
            operator: 'all',
            conditions: [
              { path: ['flag'], equals: false },
              { path: ['count'], equals: 0 },
              { path: ['text'], equals: '' },
              { path: ['nullable'], equals: null },
            ],
          },
        },
        profile: {
          fields: {
            target: {
              enabledWhen: {
                operator: 'any',
                conditions: [
                  { path: ['hiddenSource'], equals: 'secret' },
                  { path: ['profile', 'flag'], equals: true },
                ],
              },
            },
          },
        },
      },
    },
  });
  if (!compiled.success) throw new Error('compound Angular fixture failed');
  return compiled.definition;
}

const definition = compileDefinition();
const initialValue = Object.freeze({
  gate: false,
  flag: true,
  count: 1,
  text: 'value',
  nullable: 'value',
  hiddenSource: 'secret',
  directTarget: 'direct',
  profile: Object.freeze({ flag: false, target: 'nested' }),
});
const matchingValue = Object.freeze({
  ...initialValue,
  flag: false,
  count: 0,
  text: '',
  nullable: null,
});
const validValidator: SchemaValidator = Object.freeze({
  validate: () => ({ valid: true, issues: [] }),
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
class CompoundHost {
  readonly config = signal(createConfig());
  readonly operations: FormOperation[] = [];
  readonly diagnostics: (readonly Diagnostic[])[] = [];
  @ViewChild(SchemaFormDirective) form?: SchemaFormDirective<
    Record<string, unknown>
  >;
}

describe('Angular compound-condition projection', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    FakeRenderer.latest = undefined;
    FakeRenderer.instances = [];
    FakeRenderer.created = 0;
    FakeRenderer.destroyed = 0;
    FakeRenderer.emitOnDestroy = false;
  });

  it('keeps renderers mounted across all/any transitions, locale and replacement', () => {
    const tester = vi.fn(() => 1);
    TestBed.configureTestingModule({
      providers: [
        provideSchemaTextResolver({
          resolve: (text, context) => `${context.locale}:${text}`,
        }),
        provideSchemaEngineAngular({
          id: 'compound-fake',
          renderer: FakeRenderer,
          tester,
        }),
      ],
    });
    const fixture = TestBed.createComponent(CompoundHost);
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;
    const direct = fakeRenderer(['directTarget']);
    const nested = fakeRenderer(['profile', 'target']);
    const hiddenSource = fakeRenderer(['hiddenSource']);
    const directHost = leafHost(root, ['directTarget']);
    const nestedHost = leafHost(root, ['profile', 'target']);
    const created = FakeRenderer.created;

    expect(direct.snapshot()).toMatchObject({ visible: false, enabled: true });
    expect(directHost.hidden).toBe(true);
    expect(hiddenSource.snapshot()).toMatchObject({
      visible: false,
      presence: { kind: 'value', value: 'secret' },
    });
    expect(nested.snapshot()).toMatchObject({ visible: true, enabled: true });
    expect(nestedHost.hidden).toBe(false);

    fixture.componentInstance.config.set(
      createConfig({ locale: 'es', value: matchingValue }),
    );
    fixture.detectChanges();
    TestBed.tick();
    expect(fakeRenderer(['directTarget'])).toBe(direct);
    expect(fakeRenderer(['profile', 'target'])).toBe(nested);
    expect(FakeRenderer.created).toBe(created);
    expect(tester).toHaveBeenCalledTimes(definition.fields.length);
    expect(directHost.hidden).toBe(false);
    expect(direct.locale()).toBe('es');
    expect(direct.texts().label).toBe('es:Direct target');

    direct.fieldFocus.emit();
    TestBed.tick();
    expect(direct.snapshot()).toMatchObject({ focused: true, touched: false });
    fixture.componentInstance.config.set(
      createConfig({
        locale: 'es',
        value: { ...matchingValue, count: 1 },
      }),
    );
    fixture.detectChanges();
    TestBed.tick();
    expect(direct.snapshot()).toMatchObject({
      visible: false,
      focused: false,
      touched: false,
    });
    direct.setValue.emit('stale');
    TestBed.tick();
    expect(fixture.componentInstance.operations).toEqual([]);
    expect(fixture.componentInstance.diagnostics.flat().at(-1)).toMatchObject({
      code: 'INACTIVE_RUNTIME_FIELD',
      parameters: { action: 'requestSetValue', reason: 'hidden' },
    });

    fixture.componentInstance.config.set(
      createConfig({
        value: {
          ...matchingValue,
          hiddenSource: 'other',
          profile: { flag: false, target: 'nested' },
        },
      }),
    );
    fixture.detectChanges();
    TestBed.tick();
    expect(nested.snapshot()).toMatchObject({ enabled: false });
    nested.setValue.emit('stale');
    TestBed.tick();
    expect(fixture.componentInstance.operations).toEqual([]);
    expect(fixture.componentInstance.diagnostics.flat().at(-1)).toMatchObject({
      code: 'INACTIVE_RUNTIME_FIELD',
      parameters: { action: 'requestSetValue', reason: 'disabled' },
    });

    const operationCount = fixture.componentInstance.operations.length;
    fixture.componentInstance.config.set(
      createConfig({ definition: compileDefinition(), locale: 'ca' }),
    );
    fixture.detectChanges();
    TestBed.tick();
    expect(FakeRenderer.destroyed).toBe(created);
    expect(FakeRenderer.created).toBe(created * 2);
    direct.setValue.emit('ignored-after-replacement');
    TestBed.tick();
    expect(fixture.componentInstance.operations).toHaveLength(operationCount);

    fixture.destroy();
    expect(FakeRenderer.destroyed).toBe(FakeRenderer.created);
  });

  it('projects compound hidden/inert and disabled native accessibility without output', () => {
    TestBed.configureTestingModule({
      providers: [provideSchemaEngineAngularNative()],
    });
    const fixture = TestBed.createComponent(CompoundHost);
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;
    const directHost = leafHost(root, ['directTarget']);
    const nestedId = nodeBase('compound-angular', ['profile', 'target']);
    const nestedInput = byId(root, nestedId) as HTMLInputElement;

    expect(directHost.hidden).toBe(true);
    expect(directHost.hasAttribute('inert')).toBe(true);
    expect(directHost.getAttribute('aria-hidden')).toBe('true');
    expect(nestedInput.disabled).toBe(false);

    fixture.componentInstance.config.set(
      createConfig({
        value: {
          ...matchingValue,
          hiddenSource: 'other',
          profile: { flag: false, target: 'nested' },
        },
      }),
    );
    fixture.detectChanges();
    TestBed.tick();
    expect(directHost.hidden).toBe(false);
    expect(directHost.hasAttribute('inert')).toBe(false);
    expect(directHost.hasAttribute('aria-hidden')).toBe(false);
    expect(nestedInput.disabled).toBe(true);
    expect(
      (byId(root, `${nestedId}-clear`) as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(
      (byId(root, `${nestedId}-set-null`) as HTMLButtonElement).disabled,
    ).toBe(true);

    nestedInput.value = 'blocked';
    nestedInput.dispatchEvent(new Event('input', { bubbles: true }));
    nestedInput.dispatchEvent(new Event('focus', { bubbles: true }));
    nestedInput.dispatchEvent(new Event('blur', { bubbles: true }));
    TestBed.tick();
    expect(fixture.componentInstance.operations).toEqual([]);
    expect(fixture.componentInstance.diagnostics).toEqual([]);
  });
});

function createConfig(
  overrides: Partial<
    ControlledFormRuntimeOptions<Record<string, unknown>>
  > = {},
): ControlledFormRuntimeOptions<Record<string, unknown>> {
  return {
    formId: 'compound-angular',
    definition,
    schema,
    value: initialValue,
    baselineValue: initialValue,
    locale: 'en',
    validator: validValidator,
    ...overrides,
  };
}

function fakeRenderer(path: readonly string[]): FakeRenderer {
  const renderer = FakeRenderer.instances.find((candidate) => {
    const field = candidate.field();
    return (
      'path' in field && JSON.stringify(field.path) === JSON.stringify(path)
    );
  });
  if (renderer === undefined) {
    throw new Error(`Missing renderer ${JSON.stringify(path)}.`);
  }
  return renderer;
}

function leafHost(root: HTMLElement, path: readonly string[]): HTMLElement {
  const index = definition.fields.findIndex(
    (field) => JSON.stringify(field.path) === JSON.stringify(path),
  );
  const host = root.querySelectorAll<HTMLElement>('schema-leaf-outlet-host')[
    index
  ];
  if (host === undefined)
    throw new Error(`Missing host ${JSON.stringify(path)}.`);
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
