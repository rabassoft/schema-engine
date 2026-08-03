import {
  Component,
  ViewChild,
  computed,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  applyFormOperation,
  compileFormDefinition,
  type AsyncSchemaValidator,
  type Diagnostic,
  type FormOperation,
  type SchemaValidator,
  type ValidationResult,
} from '@rabassoft/schema-engine';
import {
  SchemaFormDirective,
  provideSchemaEngineAngularNative,
  provideSchemaTextResolver,
  type AngularFieldRenderer,
  type AngularControlledFormConfig,
} from '@rabassoft/schema-engine-angular';
import { beforeEach, describe, expect, it } from 'vitest';

interface ConsumerValue {
  readonly profile?: {
    readonly address?: {
      readonly street?: string;
    };
  };
  readonly active?: boolean;
  readonly roles?: readonly string[];
  readonly rows: readonly {
    readonly id: string;
    readonly name?: string;
  }[];
}

const schema = Object.freeze({
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: Object.freeze({
    profile: Object.freeze({
      type: 'object',
      title: 'Profile',
      description: 'Profile details',
      properties: Object.freeze({
        address: Object.freeze({
          type: 'object',
          title: 'Address',
          properties: Object.freeze({
            street: Object.freeze({ type: 'string', title: 'Street' }),
          }),
        }),
      }),
    }),
    active: Object.freeze({ type: 'boolean', title: 'Active' }),
    roles: Object.freeze({
      type: 'array',
      title: 'Roles',
      items: Object.freeze({
        type: 'string',
        enum: Object.freeze(['reader', 'editor', 'reviewer']),
      }),
      uniqueItems: true,
    }),
    rows: Object.freeze({
      type: 'array',
      title: 'People',
      items: Object.freeze({
        type: 'object',
        properties: Object.freeze({
          id: Object.freeze({ type: 'string' }),
          name: Object.freeze({ type: 'string', title: 'Name' }),
        }),
        required: Object.freeze(['id', 'name']),
      }),
    }),
  }),
});
const compilation = compileFormDefinition({
  schema,
  collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
  uiSchema: {
    fields: {
      profile: {
        fields: {
          address: {
            fields: {
              street: {
                enabledWhen: { path: ['active'], equals: false },
              },
            },
          },
        },
      },
    },
    presentation: [
      {
        kind: 'section',
        id: 'details',
        label: 'Details',
        children: ['profile', 'active', 'roles'],
      },
      'rows',
    ],
  },
});
if (!compilation.success)
  throw new Error('The consumer schema must compile successfully.');
const definition = compilation.definition;
const initialValue: Readonly<ConsumerValue> = Object.freeze({
  profile: Object.freeze({
    address: Object.freeze({ street: 'Main' }),
  }),
  active: false,
  roles: Object.freeze(['editor']),
  rows: Object.freeze([
    Object.freeze({ id: 'a', name: 'Ada' }),
    Object.freeze({ id: 'b', name: 'Bob' }),
  ]),
});
const validator: SchemaValidator = Object.freeze({
  validate: () => ({ valid: true, issues: [] }),
});

@Component({
  standalone: true,
  imports: [SchemaFormDirective],
  template: `
    <form [schemaForm]="config()" (schemaOperation)="apply($event)"></form>
  `,
})
class ConsumerHost {
  readonly value = signal<Readonly<ConsumerValue>>(initialValue);
  readonly operations: FormOperation[] = [];
  readonly config = computed<AngularControlledFormConfig<ConsumerValue>>(
    () => ({
      formId: 'g0-consumer',
      definition,
      schema,
      value: this.value(),
      baselineValue: initialValue,
      locale: 'en',
      validator,
      validationVisibility: 'all',
    }),
  );
  @ViewChild(SchemaFormDirective)
  form?: SchemaFormDirective<ConsumerValue>;

  apply(operation: FormOperation): void {
    this.operations.push(operation);
    const result = applyFormOperation(definition, this.value(), operation);
    if (!result.success)
      throw new Error('The consumer must apply emitted operations.');
    this.value.set(result.value);
  }
}

@Component({
  standalone: true,
  imports: [SchemaFormDirective],
  template: `
    <form
      [schemaForm]="config()"
      (schemaDiagnostics)="diagnostics.push($event)"
    ></form>
  `,
})
class AsyncConsumerHost {
  readonly work = [deferred<ValidationResult>(), deferred<ValidationResult>()];
  readonly diagnostics: (readonly Diagnostic[])[] = [];
  private invocation = 0;
  readonly asyncValidator: AsyncSchemaValidator = {
    validate: () =>
      this.work[this.invocation++]?.promise as Promise<ValidationResult>,
  };
  readonly config = signal<AngularControlledFormConfig<ConsumerValue>>({
    formId: 'async-consumer',
    definition,
    schema,
    value: initialValue,
    baselineValue: initialValue,
    locale: 'en',
    validator,
    asyncValidator: this.asyncValidator,
  });
  @ViewChild(SchemaFormDirective)
  form?: SchemaFormDirective<ConsumerValue>;
}

describe('minimal built-package Angular consumer', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('renders nested objects and stable collections from the built packages', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideSchemaTextResolver({
          resolve: (text, context) => `${context.locale}:${text}`,
        }),
        provideSchemaEngineAngularNative(),
      ],
    });
    const fixture = TestBed.createComponent(ConsumerHost);
    fixture.detectChanges();
    TestBed.tick();

    const root = fixture.nativeElement as HTMLElement;
    expect(
      Array.from(root.querySelectorAll('legend'), ({ textContent }) =>
        textContent?.trim(),
      ),
    ).toEqual([
      'en:Details',
      'en:Profile',
      'en:Address',
      'en:People',
      'en:Item 1',
      'en:Item 2',
    ]);
    expect(root.querySelectorAll('input[type="text"]')).toHaveLength(3);
    expect(root.querySelectorAll('input[type="checkbox"]')).toHaveLength(1);
    expect(root.querySelectorAll('select[multiple]')).toHaveLength(1);
    expect(
      Object.hasOwn(
        fixture.componentInstance.form?.snapshot() ?? {},
        'asyncValidation',
      ),
    ).toBe(false);
    const ids = Array.from(root.querySelectorAll('[id]'), ({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);

    const streetId = nodeBase('g0-consumer', ['profile', 'address', 'street']);
    const street = byId(root, streetId) as HTMLInputElement;
    expect(street.value).toBe('Main');
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

    const clear = byId(root, `${streetId}-clear`) as HTMLButtonElement;
    clear.click();
    expect(fixture.componentInstance.operations.at(-1)).toMatchObject({
      type: 'remove-value',
      path: ['profile', 'address', 'street'],
    });
    fixture.detectChanges();
    TestBed.tick();
    expect(fixture.componentInstance.value()).toEqual({
      profile: { address: {} },
      active: false,
      roles: initialValue.roles,
      rows: initialValue.rows,
    });
    expect(root.querySelector(`[id="${streetId}-clear"]`)).toBeNull();
    expect(document.activeElement).toBe(street);
    expect(fixture.componentInstance.form?.snapshot()?.fields[0]).toMatchObject(
      {
        path: ['profile', 'address', 'street'],
        presence: { kind: 'missing' },
        focused: true,
      },
    );

    const active = root.querySelector<HTMLInputElement>(
      'input[type="checkbox"]',
    );
    if (active === null) throw new Error('Missing condition source.');
    active.checked = true;
    active.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    TestBed.tick();
    const streetSnapshot:
      ReturnType<AngularFieldRenderer['snapshot']> | undefined =
      fixture.componentInstance.form
        ?.snapshot()
        ?.fields.find(
          ({ path }) => path.join('.') === 'profile.address.street',
        );
    expect(streetSnapshot).toMatchObject({ visible: true, enabled: false });
    expect(street.disabled).toBe(true);
    const operationCount = fixture.componentInstance.operations.length;
    street.value = 'blocked';
    street.dispatchEvent(new Event('input', { bubbles: true }));
    expect(fixture.componentInstance.operations).toHaveLength(operationCount);

    const rolesId = nodeBase('g0-consumer', ['roles']);
    const roles = byId(root, rolesId) as HTMLSelectElement;
    expect(roles.multiple).toBe(true);
    expect(Array.from(roles.selectedOptions, ({ value }) => value)).toEqual([
      'choice:1',
    ]);
    roles.options[0]!.selected = true;
    roles.options[1]!.selected = true;
    roles.dispatchEvent(new Event('change', { bubbles: true }));
    expect(fixture.componentInstance.operations.at(-1)).toMatchObject({
      type: 'set-value',
      path: ['roles'],
      value: ['editor', 'reader'],
    });
    fixture.detectChanges();
    TestBed.tick();
    expect(fixture.componentInstance.value().roles).toEqual([
      'editor',
      'reader',
    ]);

    const itemNameId = itemBase('g0-consumer', ['rows'], 'a', ['name']);
    const itemName = byId(root, itemNameId) as HTMLInputElement;
    itemName.value = 'Grace';
    itemName.dispatchEvent(new Event('input', { bubbles: true }));
    expect(fixture.componentInstance.operations.at(-1)).toMatchObject({
      type: 'set-item-value',
      target: { itemId: 'a', relativePath: ['name'] },
      value: 'Grace',
    });
    fixture.detectChanges();
    TestBed.tick();
    expect(itemName.value).toBe('Grace');

    fixture.componentInstance.form?.requestMoveItem(
      { collectionPath: ['rows'], itemId: 'a' },
      { kind: 'after', itemId: 'b' },
    );
    fixture.detectChanges();
    TestBed.tick();
    expect(fixture.componentInstance.operations.at(-1)).toMatchObject({
      type: 'move-item',
      itemId: 'a',
      placement: { kind: 'after', itemId: 'b' },
    });
    expect(
      byId(root, `${itemBase('g0-consumer', ['rows'], 'a', [])}--legend`)
        .textContent,
    ).toContain('en:Item 2');
  });

  it('consumes configured async state and retry through the built package', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideSchemaEngineAngularNative(),
      ],
    });
    const fixture = TestBed.createComponent(AsyncConsumerHost);
    fixture.detectChanges();
    TestBed.tick();
    const host = fixture.componentInstance;
    expect(host.form?.snapshot()?.asyncValidation).toEqual({
      status: 'pending',
      generation: 1,
    });

    host.work[0]?.resolve({
      valid: false,
      issues: [{ code: 'service-active', path: ['active'], parameters: {} }],
    });
    await flushAsync();
    fixture.detectChanges();
    expect(host.form?.snapshot()).toMatchObject({
      asyncValidation: { status: 'settled', generation: 1, valid: false },
    });
    expect(
      host.form
        ?.snapshot()
        ?.fields.find(({ path }) => path.length === 1 && path[0] === 'active')
        ?.issues,
    ).toMatchObject([{ code: 'service-active' }]);

    expect(host.form?.retryAsyncValidation().success).toBe(true);
    expect(host.form?.snapshot()?.asyncValidation).toEqual({
      status: 'pending',
      generation: 2,
    });
    host.work[1]?.resolve({ valid: true, issues: [] });
    await flushAsync();
    fixture.detectChanges();
    expect(host.form?.snapshot()?.asyncValidation).toEqual({
      status: 'settled',
      generation: 2,
      valid: true,
    });
    expect(host.diagnostics).toEqual([]);
  });
});

interface Deferred<T> {
  readonly promise: Promise<T>;
  resolve(value: T): void;
}

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

async function flushAsync(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

function nodeBase(formId: string, path: readonly string[]): string {
  return `se-${encodeURIComponent(JSON.stringify([formId, path]))}`;
}

function itemBase(
  formId: string,
  collectionPath: readonly string[],
  itemId: string,
  relativePath: readonly string[],
): string {
  return `se-${encodeURIComponent(
    JSON.stringify([formId, 'item', collectionPath, itemId, relativePath]),
  )}`;
}

function byId(root: HTMLElement, id: string): HTMLElement {
  const element = root.querySelector(`[id="${id}"]`);
  if (!(element instanceof HTMLElement)) throw new Error(`Missing ${id}`);
  return element;
}
