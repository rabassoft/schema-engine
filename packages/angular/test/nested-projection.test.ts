import {
  Component,
  ViewChild,
  computed,
  signal,
  type ViewContainerRef,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  applyFormOperation,
  compileFormDefinition,
  type Diagnostic,
  type FormOperation,
  type SchemaValidator,
} from '@rabassoft/schema-engine';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  SchemaFormDirective,
  provideSchemaEngineAngular,
  provideSchemaEngineAngularNative,
  provideSchemaTextResolver,
  type AngularControlledFormConfig,
} from '../dist/index.js';
import { ObjectHostFactory } from '../dist/node-outlet.js';
import { FakeRenderer } from '../dist/testing/fake-renderer.js';

interface NestedValue {
  readonly profile?: unknown;
  readonly note?: string;
}

const schema = Object.freeze({
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: Object.freeze({
    profile: Object.freeze({
      type: 'object',
      title: 'Profile',
      description: 'Profile description',
      properties: Object.freeze({
        address: Object.freeze({
          type: 'object',
          title: 'Address',
          properties: Object.freeze({
            street: Object.freeze({ type: 'string', title: 'Street' }),
          }),
        }),
        active: Object.freeze({ type: 'boolean', title: 'Active' }),
      }),
    }),
    note: Object.freeze({ type: 'string', title: 'Note' }),
  }),
});
const compiled = compileFormDefinition({ schema });
if (!compiled.success) throw new Error('nested Angular fixture failed');
const definition = compiled.definition;
const initialValue: Readonly<NestedValue> = Object.freeze({
  profile: Object.freeze({
    address: Object.freeze({ street: 'Main' }),
    active: true,
  }),
  note: 'Visible sibling',
});
const validValidator: SchemaValidator = Object.freeze({
  validate: () => ({ valid: true, issues: [] }),
});

@Component({
  standalone: true,
  imports: [SchemaFormDirective],
  template: `<form
    [schemaForm]="config()"
    (schemaOperation)="apply($event)"
    (schemaDiagnostics)="diagnostics.push($event)"
  >
    <span class="manual-content">Manual</span>
  </form>`,
})
class NestedHost {
  readonly value = signal<Readonly<NestedValue>>(initialValue);
  readonly formId = signal('nested.form');
  readonly locale = signal('en');
  readonly validator = signal<SchemaValidator>(validValidator);
  readonly operations: FormOperation[] = [];
  readonly diagnostics: (readonly Diagnostic[])[] = [];
  readonly config = computed<AngularControlledFormConfig<NestedValue>>(() => ({
    formId: this.formId(),
    definition,
    schema,
    value: this.value(),
    baselineValue: initialValue,
    locale: this.locale(),
    validator: this.validator(),
    validationVisibility: 'all',
  }));
  @ViewChild(SchemaFormDirective) form?: SchemaFormDirective<NestedValue>;

  apply(operation: FormOperation): void {
    this.operations.push(operation);
    const result = applyFormOperation(definition, this.value(), operation);
    if (!result.success) throw new Error('deep operation failed');
    this.value.set(result.value);
  }
}

@Component({ selector: 'partial-object-host', standalone: true, template: '' })
class PartialObjectHost {}

const hostileNames = [
  'a.b',
  'a.b-label',
  `snow-${String.fromCharCode(0xd800)}`,
];
const hostileCompilation = compileFormDefinition({
  schema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    properties: Object.fromEntries(
      hostileNames.map((name) => [name, { type: 'string', title: name }]),
    ),
  },
});
if (!hostileCompilation.success) throw new Error('hostile ID fixture failed');
const hostileDefinition = hostileCompilation.definition;
const hostileValue = Object.freeze(
  Object.fromEntries(hostileNames.map((name) => [name, name])),
);

@Component({
  standalone: true,
  imports: [SchemaFormDirective],
  template: `
    <form [schemaForm]="first"></form>
    <form [schemaForm]="second"></form>
  `,
})
class SimultaneousFormsHost {
  readonly first = hostileConfig('form.one');
  readonly second = hostileConfig('form.two');
}

describe('Angular nested projection', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    FakeRenderer.latest = undefined;
    FakeRenderer.instances = [];
    FakeRenderer.created = 0;
    FakeRenderer.destroyed = 0;
  });

  it('renders normalized object/leaf order with canonical accessible IDs and projected content', () => {
    TestBed.configureTestingModule({
      providers: [provideSchemaEngineAngularNative()],
    });
    const fixture = TestBed.createComponent(NestedHost);
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;
    const legends = Array.from(root.querySelectorAll('legend'), (element) =>
      element.textContent?.trim(),
    );
    expect(legends).toEqual(['Profile', 'Address']);
    expect(root.querySelector('.manual-content')?.textContent).toBe('Manual');

    const streetBase = nodeBase('nested.form', [
      'profile',
      'address',
      'street',
    ]);
    const street = byId(root, streetBase) as HTMLInputElement;
    expect(street.value).toBe('Main');
    expect(byId(root, `${streetBase}-label`).getAttribute('for')).toBe(
      streetBase,
    );
    expect(
      byId(root, `${nodeBase('nested.form', ['profile'])}--legend`).textContent,
    ).toContain('Profile');
    const ids = Array.from(root.querySelectorAll('[id]'), ({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);

    street.value = 'Broadway';
    street.dispatchEvent(new Event('input', { bubbles: true }));
    expect(fixture.componentInstance.operations.at(-1)).toMatchObject({
      type: 'set-value',
      path: ['profile', 'address', 'street'],
      value: 'Broadway',
    });
    fixture.detectChanges();
    TestBed.tick();
    expect(street.value).toBe('Broadway');
  });

  it('keeps missing branches interactive but disables and suppresses incompatible branches', () => {
    TestBed.configureTestingModule({
      providers: [provideSchemaEngineAngularNative()],
    });
    const missing = TestBed.createComponent(NestedHost);
    missing.componentInstance.value.set({ note: 'Sibling' });
    missing.detectChanges();
    TestBed.tick();
    const missingRoot = missing.nativeElement as HTMLElement;
    const streetBase = nodeBase('nested.form', [
      'profile',
      'address',
      'street',
    ]);
    const missingStreet = byId(missingRoot, streetBase) as HTMLInputElement;
    expect(missingStreet.disabled).toBe(false);
    expect(missingStreet.value).toBe('');
    missingStreet.value = 'Created';
    missingStreet.dispatchEvent(new Event('input', { bubbles: true }));
    expect(missing.componentInstance.operations.at(-1)).toMatchObject({
      path: ['profile', 'address', 'street'],
      expected: { kind: 'missing' },
    });
    expect(missing.componentInstance.value()).toMatchObject({
      profile: { address: { street: 'Created' } },
    });
    missing.componentInstance.value.set({ note: 'Sibling' });
    missing.detectChanges();
    TestBed.tick();
    expect(
      missing.componentInstance.form?.requestRemoveValue([
        'profile',
        'address',
        'street',
      ]),
    ).toMatchObject({ success: true, effects: { operationEmitted: false } });
    missingStreet.dispatchEvent(new Event('focus', { bubbles: true }));
    expect(missing.componentInstance.form?.snapshot()?.fields[0]?.focused).toBe(
      true,
    );
    missing.destroy();

    const incompatible = TestBed.createComponent(NestedHost);
    incompatible.componentInstance.value.set({ profile: 42, note: 'Sibling' });
    incompatible.detectChanges();
    TestBed.tick();
    const incompatibleRoot = incompatible.nativeElement as HTMLElement;
    const blockedStreet = byId(
      incompatibleRoot,
      streetBase,
    ) as HTMLInputElement;
    expect(blockedStreet.disabled).toBe(true);
    blockedStreet.value = 'Rejected';
    blockedStreet.dispatchEvent(new Event('input', { bubbles: true }));
    blockedStreet.dispatchEvent(new Event('focus', { bubbles: true }));
    expect(incompatible.componentInstance.operations).toEqual([]);
    expect(
      (
        byId(
          incompatibleRoot,
          nodeBase('nested.form', ['note']),
        ) as HTMLInputElement
      ).disabled,
    ).toBe(false);
  });

  it('suppresses custom renderer intentions below an incompatible ancestor', () => {
    TestBed.configureTestingModule({
      providers: [
        provideSchemaEngineAngular({
          id: 'fake',
          renderer: FakeRenderer,
          tester: () => 1,
        }),
      ],
    });
    const fixture = TestBed.createComponent(NestedHost);
    fixture.componentInstance.value.set({ profile: null, note: 'Sibling' });
    fixture.detectChanges();
    TestBed.tick();
    const street = FakeRenderer.instances.find(
      (renderer) => renderer.field().name === 'street',
    );
    expect(street?.snapshot().presence).toMatchObject({
      kind: 'blocked',
      reason: 'incompatible-ancestor',
    });
    street?.setValue.emit('Rejected');
    street?.removeValue.emit();
    street?.fieldFocus.emit();
    street?.fieldBlur.emit();
    expect(fixture.componentInstance.operations).toEqual([]);
    expect(fixture.componentInstance.form?.snapshot()?.fields[0]).toMatchObject(
      {
        focused: false,
        touched: false,
      },
    );
  });

  it('retains recursive renderer identity for locale and destroys descendants on replacement', () => {
    TestBed.configureTestingModule({
      providers: [
        provideSchemaEngineAngular({
          id: 'fake',
          renderer: FakeRenderer,
          tester: () => 1,
        }),
      ],
    });
    const fixture = TestBed.createComponent(NestedHost);
    fixture.detectChanges();
    TestBed.tick();
    const street = FakeRenderer.instances.find(
      (renderer) => renderer.field().name === 'street',
    );
    expect(FakeRenderer.created).toBe(3);
    expect(FakeRenderer.destroyed).toBe(0);

    fixture.componentInstance.locale.set('ca');
    fixture.detectChanges();
    TestBed.tick();
    expect(
      FakeRenderer.instances.find(
        (renderer) =>
          renderer.field().name === 'street' && renderer.locale() === 'ca',
      ),
    ).toBe(street);
    expect(FakeRenderer.created).toBe(3);
    expect(FakeRenderer.destroyed).toBe(0);

    fixture.componentInstance.formId.set('replacement');
    fixture.detectChanges();
    TestBed.tick();
    expect(
      FakeRenderer.instances.find(
        (renderer) =>
          renderer.field().name === 'street' &&
          renderer.formId() === 'replacement',
      ),
    ).not.toBe(street);
    expect(FakeRenderer.created).toBe(6);
    expect(FakeRenderer.destroyed).toBe(3);

    fixture.destroy();
    expect(FakeRenderer.destroyed).toBe(6);
  });

  it('projects object text failures once per identity with exact diagnostics', () => {
    const issueValidator: SchemaValidator = {
      validate: () => ({
        valid: false,
        issues: [
          {
            code: 'profile-issue',
            path: ['profile'],
            parameters: {},
            fallbackMessage: 'Profile issue',
          },
        ],
      }),
    };
    TestBed.configureTestingModule({
      providers: [
        provideSchemaTextResolver({
          resolve(text, context) {
            if (!('node' in context)) return text;
            if (context.node.name !== 'profile') return text;
            if (context.member === 'label') return '   ';
            if (context.member === 'description') throw new Error('hidden');
            if (context.member === 'issue') return 42 as never;
            return text;
          },
        }),
        provideSchemaEngineAngularNative(),
      ],
    });
    const fixture = TestBed.createComponent(NestedHost);
    fixture.componentInstance.validator.set(issueValidator);
    fixture.detectChanges();
    TestBed.tick();
    const diagnostics = fixture.componentInstance.diagnostics
      .flat()
      .filter(
        ({ code, parameters }) =>
          code === 'TEXT_RESOLUTION_FAILED' && 'node' in parameters,
      );
    expect(diagnostics).toMatchObject([
      {
        dataPath: ['profile'],
        parameters: {
          node: 'profile',
          nodeKind: 'object',
          member: 'label',
          reason: 'blank-string-result',
        },
      },
      {
        parameters: {
          node: 'profile',
          member: 'description',
          reason: 'exception',
        },
      },
      {
        parameters: {
          node: 'profile',
          member: 'issue',
          issueCode: 'profile-issue',
          reason: 'non-string-result',
        },
      },
    ]);
    expect(diagnostics).toHaveLength(3);
    fixture.componentInstance.form?.focus(['note']);
    TestBed.tick();
    expect(
      fixture.componentInstance.diagnostics
        .flat()
        .filter(
          ({ code, parameters }) =>
            code === 'TEXT_RESOLUTION_FAILED' && 'node' in parameters,
        ),
    ).toHaveLength(3);
    fixture.componentInstance.locale.set('ca');
    fixture.detectChanges();
    TestBed.tick();
    expect(
      fixture.componentInstance.diagnostics
        .flat()
        .filter(
          ({ code, parameters }) =>
            code === 'TEXT_RESOLUTION_FAILED' && 'node' in parameters,
        ),
    ).toHaveLength(6);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Profile issue',
    );
  });

  it.each(['creation', 'binding'])(
    'isolates object-host %s failure',
    (mode) => {
      const factory = {
        create(container: ViewContainerRef) {
          if (mode === 'binding') container.createComponent(PartialObjectHost);
          throw new Error('hidden');
        },
      };
      TestBed.configureTestingModule({
        providers: [
          { provide: ObjectHostFactory, useValue: factory },
          provideSchemaEngineAngularNative(),
        ],
      });
      const fixture = TestBed.createComponent(NestedHost);
      fixture.detectChanges();
      TestBed.tick();
      const root = fixture.nativeElement as HTMLElement;
      expect(root.querySelector('fieldset')).toBeNull();
      expect(root.querySelector('partial-object-host')).toBeNull();
      expect(byId(root, nodeBase('nested.form', ['note']))).toBeDefined();
      const failures = fixture.componentInstance.diagnostics
        .flat()
        .filter(({ code }) => code === 'OBJECT_HOST_INSTANTIATION_FAILED');
      expect(failures).toEqual([
        {
          code: 'OBJECT_HOST_INSTANTIATION_FAILED',
          severity: 'error',
          source: 'runtime',
          dataPath: ['profile'],
          parameters: { node: 'profile' },
          fallbackMessage: 'Object host could not be instantiated.',
        },
      ]);
    },
  );

  it('keeps the accepted tree atomically when replacement is rejected', () => {
    TestBed.configureTestingModule({
      providers: [provideSchemaEngineAngularNative()],
    });
    const fixture = TestBed.createComponent(NestedHost);
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;
    const profile = root.querySelector('fieldset');
    const snapshot = fixture.componentInstance.form?.snapshot();
    fixture.componentInstance.formId.set('');
    fixture.detectChanges();
    TestBed.tick();
    expect(fixture.componentInstance.form?.snapshot()).toBe(snapshot);
    expect(root.querySelector('fieldset')).toBe(profile);
    expect(root.querySelectorAll('schema-node-outlet')).not.toHaveLength(0);
    expect(fixture.componentInstance.diagnostics.at(-1)?.[0]?.code).toBe(
      'INVALID_RUNTIME_OPTIONS',
    );
  });

  it('keeps hostile canonical IDs collision-free across simultaneous forms', () => {
    TestBed.configureTestingModule({
      providers: [provideSchemaEngineAngularNative()],
    });
    const fixture = TestBed.createComponent(SimultaneousFormsHost);
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;
    const ids = Array.from(root.querySelectorAll('[id]'), ({ id }) => id);
    expect(ids).toHaveLength(hostileNames.length * 2 * 3);
    expect(new Set(ids).size).toBe(ids.length);
    for (const formId of ['form.one', 'form.two']) {
      for (const name of hostileNames) {
        const base = nodeBase(formId, [name]);
        expect(byId(root, base)).toBeDefined();
        expect(byId(root, `${base}-label`)).toBeDefined();
      }
    }
  });
});

function nodeBase(formId: string, path: readonly string[]): string {
  return `se-${encodeURIComponent(JSON.stringify([formId, path]))}`;
}

function byId(root: HTMLElement, id: string): HTMLElement {
  const element = root.querySelector(`[id="${id}"]`);
  if (!(element instanceof HTMLElement)) throw new Error(`missing id ${id}`);
  return element;
}

function hostileConfig(
  formId: string,
): AngularControlledFormConfig<Record<string, unknown>> {
  return {
    formId,
    definition: hostileDefinition,
    schema: {},
    value: hostileValue,
    baselineValue: hostileValue,
    locale: 'en',
    validator: validValidator,
  };
}
