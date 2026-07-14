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
import { CollectionHostFactory, ItemHostFactory } from '../dist/node-outlet.js';
import { FakeRenderer } from '../dist/testing/fake-renderer.js';

interface Row {
  readonly id: string;
  readonly name?: string;
  readonly active?: boolean;
}

interface CollectionValue {
  readonly rows: readonly Row[];
}

const schema = Object.freeze({
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: Object.freeze({
    rows: Object.freeze({
      type: 'array',
      title: 'People',
      description: 'People in display order',
      items: Object.freeze({
        type: 'object',
        properties: Object.freeze({
          id: Object.freeze({ type: 'string' }),
          name: Object.freeze({ type: 'string', title: 'Name' }),
          active: Object.freeze({ type: 'boolean', title: 'Active' }),
        }),
        required: Object.freeze(['id', 'name']),
      }),
    }),
  }),
});
const compiled = compileFormDefinition({
  schema,
  collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
});
if (!compiled.success) throw new Error('collection Angular fixture failed');
const definition = compiled.definition;
const initialValue: Readonly<CollectionValue> = Object.freeze({
  rows: Object.freeze([
    Object.freeze({ id: 'a', name: 'Ada', active: true }),
    Object.freeze({ id: 'b', name: 'Bob', active: false }),
  ]),
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
  ></form>`,
})
class CollectionHost {
  readonly value = signal<Readonly<CollectionValue>>(initialValue);
  readonly locale = signal('en');
  readonly acceptOperations = signal(true);
  readonly operations: FormOperation[] = [];
  readonly diagnostics: (readonly Diagnostic[])[] = [];
  readonly config = computed<AngularControlledFormConfig<CollectionValue>>(
    () => ({
      formId: 'collection.form',
      definition,
      schema,
      value: this.value(),
      baselineValue: initialValue,
      locale: this.locale(),
      validator: validValidator,
      validationVisibility: 'all',
    }),
  );
  @ViewChild(SchemaFormDirective) form?: SchemaFormDirective<CollectionValue>;

  apply(operation: FormOperation): void {
    this.operations.push(operation);
    if (!this.acceptOperations()) return;
    const result = applyFormOperation(definition, this.value(), operation);
    if (!result.success) throw new Error('collection operation failed');
    this.value.set(result.value);
  }
}

@Component({
  selector: 'partial-collection-host',
  standalone: true,
  template: '',
})
class PartialCollectionHost {}

@Component({
  selector: 'partial-item-host',
  standalone: true,
  template: '<div data-schema-item-key="partial"></div>',
})
class PartialItemHost {}

describe('Angular collection projection', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    FakeRenderer.latest = undefined;
    FakeRenderer.instances = [];
    FakeRenderer.created = 0;
    FakeRenderer.destroyed = 0;
  });

  it('projects stable accessible item controls and emits stable operations', async () => {
    TestBed.configureTestingModule({
      providers: [provideSchemaEngineAngularNative()],
    });
    const fixture = TestBed.createComponent(CollectionHost);
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;
    const collectionBase = nodeBase('collection.form', ['rows']);
    const itemABase = itemBase('collection.form', ['rows'], 'a', []);
    const itemANameBase = itemBase('collection.form', ['rows'], 'a', ['name']);

    expect(byId(root, `${collectionBase}--legend`).textContent).toContain(
      'People',
    );
    expect(byId(root, `${itemABase}--legend`).textContent).toContain('Item 1');
    const name = byId(root, itemANameBase) as HTMLInputElement;
    expect(name.value).toBe('Ada');
    expect(byId(root, `${itemANameBase}-label`).getAttribute('for')).toBe(
      itemANameBase,
    );
    expect(
      (byId(root, `${itemABase}--move-earlier`) as HTMLButtonElement).disabled,
    ).toBe(true);

    name.value = 'Grace';
    name.dispatchEvent(new Event('input', { bubbles: true }));
    expect(fixture.componentInstance.operations.at(-1)).toMatchObject({
      type: 'set-item-value',
      target: {
        collectionPath: ['rows'],
        itemId: 'a',
        relativePath: ['name'],
      },
      value: 'Grace',
    });
    fixture.detectChanges();
    TestBed.tick();
    expect(name.value).toBe('Grace');

    const moveLater = byId(root, `${itemABase}--move-later`);
    moveLater.focus();
    moveLater.click();
    fixture.detectChanges();
    TestBed.tick();
    await fixture.whenStable();
    expect(fixture.componentInstance.operations.at(-1)).toMatchObject({
      type: 'move-item',
      itemId: 'a',
      placement: { kind: 'after', itemId: 'b' },
    });
    expect(byId(root, `${itemABase}--legend`).textContent).toContain('Item 2');
    expect(document.activeElement).toBe(moveLater);
    expect(
      new Set(Array.from(root.querySelectorAll('[id]'), ({ id }) => id)).size,
    ).toBe(root.querySelectorAll('[id]').length);
  });

  it('reuses logical item renderers across movement and keeps accepted views on rejection', () => {
    TestBed.configureTestingModule({
      providers: [
        provideSchemaEngineAngular({
          id: 'fake',
          renderer: FakeRenderer,
          tester: () => 1,
        }),
      ],
    });
    const fixture = TestBed.createComponent(CollectionHost);
    fixture.detectChanges();
    TestBed.tick();
    const renderer = FakeRenderer.instances.find((candidate) => {
      const presence = candidate.snapshot().presence;
      return (
        candidate.field().name === 'name' &&
        presence.kind === 'value' &&
        presence.value === 'Ada'
      );
    });
    expect(renderer).toBeDefined();
    expect(FakeRenderer.created).toBe(4);

    renderer?.fieldFocus.emit();
    TestBed.tick();
    expect(renderer?.snapshot().focused).toBe(true);

    fixture.componentInstance.form?.requestMoveItem(
      { collectionPath: ['rows'], itemId: 'a' },
      { kind: 'after', itemId: 'b' },
    );
    fixture.detectChanges();
    TestBed.tick();
    expect(renderer?.snapshot().path).toEqual(['rows', 1, 'name']);
    expect(renderer?.snapshot().focused).toBe(true);
    expect(FakeRenderer.created).toBe(4);
    expect(FakeRenderer.destroyed).toBe(0);

    fixture.componentInstance.locale.set('ca');
    fixture.detectChanges();
    TestBed.tick();
    expect(renderer?.locale()).toBe('ca');
    expect(FakeRenderer.created).toBe(4);
    expect(FakeRenderer.destroyed).toBe(0);

    fixture.componentInstance.acceptOperations.set(false);
    const acceptedValue = fixture.componentInstance.value();
    fixture.componentInstance.form?.requestMoveItem(
      { collectionPath: ['rows'], itemId: 'a' },
      { kind: 'before', itemId: 'b' },
    );
    fixture.detectChanges();
    TestBed.tick();
    expect(fixture.componentInstance.value()).toBe(acceptedValue);
    expect(renderer?.snapshot().path).toEqual(['rows', 1, 'name']);
    expect(FakeRenderer.created).toBe(4);

    fixture.componentInstance.acceptOperations.set(true);
    fixture.componentInstance.form?.requestRemoveItem({
      collectionPath: ['rows'],
      itemId: 'a',
    });
    fixture.detectChanges();
    TestBed.tick();
    expect(FakeRenderer.destroyed).toBe(2);
  });

  it('resolves collection and item text in order without recreating renderers', () => {
    const calls: string[] = [];
    TestBed.configureTestingModule({
      providers: [
        provideSchemaTextResolver({
          resolve(text, context) {
            if ('collection' in context || 'node' in context) {
              calls.push(context.member);
              if (
                'collection' in context &&
                context.member === 'move-item-earlier'
              )
                return '   ';
            }
            return text;
          },
        }),
        provideSchemaEngineAngular({
          id: 'fake',
          renderer: FakeRenderer,
          tester: () => 1,
        }),
      ],
    });
    const fixture = TestBed.createComponent(CollectionHost);
    fixture.detectChanges();
    TestBed.tick();
    expect(calls).toEqual([
      'label',
      'description',
      'item-label',
      'remove-item',
      'move-item-earlier',
      'move-item-later',
      'item-label',
      'remove-item',
      'move-item-earlier',
      'move-item-later',
    ]);
    expect(FakeRenderer.created).toBe(4);
    expect(
      fixture.componentInstance.diagnostics
        .flat()
        .filter(({ code }) => code === 'TEXT_RESOLUTION_FAILED'),
    ).toMatchObject([
      {
        dataPath: ['rows'],
        parameters: {
          node: 'rows',
          nodeKind: 'array',
          member: 'move-item-earlier',
          itemId: 'a',
          reason: 'blank-string-result',
        },
      },
      {
        parameters: {
          member: 'move-item-earlier',
          itemId: 'b',
          reason: 'blank-string-result',
        },
      },
    ]);

    fixture.componentInstance.locale.set('ca');
    fixture.detectChanges();
    TestBed.tick();
    expect(calls).toHaveLength(20);
    expect(FakeRenderer.created).toBe(4);
    expect(FakeRenderer.destroyed).toBe(0);

    fixture.componentInstance.value.set({
      rows: [
        { id: 'duplicate', name: 'One' },
        { id: 'duplicate', name: 'Two' },
      ],
    });
    fixture.detectChanges();
    TestBed.tick();
    expect(calls).toHaveLength(21);
    expect(calls.at(-1)).toBe('identity-error');
  });

  it('suppresses unaddressable items and restores focus after removal', async () => {
    TestBed.configureTestingModule({
      providers: [provideSchemaEngineAngularNative()],
    });
    const fixture = TestBed.createComponent(CollectionHost);
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;
    const itemABase = itemBase('collection.form', ['rows'], 'a', []);
    const itemBBase = itemBase('collection.form', ['rows'], 'b', []);
    const removeA = byId(root, `${itemABase}--remove`);
    removeA.focus();
    removeA.click();
    fixture.detectChanges();
    TestBed.tick();
    await fixture.whenStable();
    expect(document.activeElement).toBe(byId(root, `${itemBBase}--legend`));

    fixture.componentInstance.value.set({
      rows: [
        { id: 'duplicate', name: 'One' },
        { id: 'duplicate', name: 'Two' },
      ],
    });
    fixture.detectChanges();
    TestBed.tick();
    expect(root.querySelectorAll('[data-schema-item-key]')).toHaveLength(0);
    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'invalid identity',
    );
  });

  it.each([
    {
      name: 'previous item',
      value: initialValue,
      removedId: 'b',
      expectedId: itemBase('collection.form', ['rows'], 'a', []) + '--legend',
    },
    {
      name: 'collection legend',
      value: { rows: [{ id: 'a', name: 'Ada' }] },
      removedId: 'a',
      expectedId: nodeBase('collection.form', ['rows']) + '--legend',
    },
  ])('restores removal focus to the $name fallback', async (scenario) => {
    TestBed.configureTestingModule({
      providers: [provideSchemaEngineAngularNative()],
    });
    const fixture = TestBed.createComponent(CollectionHost);
    fixture.componentInstance.value.set(scenario.value);
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;
    const itemRoot = itemBase(
      'collection.form',
      ['rows'],
      scenario.removedId,
      [],
    );
    const remove = byId(root, `${itemRoot}--remove`);
    remove.focus();
    remove.click();
    fixture.detectChanges();
    TestBed.tick();
    await fixture.whenStable();
    expect(document.activeElement).toBe(byId(root, scenario.expectedId));
  });

  it.each(['creation', 'binding'])(
    'isolates collection-host %s failure and clears partial views',
    (mode) => {
      const factory = {
        create(container: ViewContainerRef) {
          if (mode === 'binding')
            container.createComponent(PartialCollectionHost);
          throw new Error('hidden');
        },
      };
      TestBed.configureTestingModule({
        providers: [
          { provide: CollectionHostFactory, useValue: factory },
          provideSchemaEngineAngularNative(),
        ],
      });
      const fixture = TestBed.createComponent(CollectionHost);
      fixture.detectChanges();
      TestBed.tick();
      const root = fixture.nativeElement as HTMLElement;
      expect(root.querySelector('fieldset')).toBeNull();
      expect(root.querySelector('partial-collection-host')).toBeNull();
      expect(
        fixture.componentInstance.diagnostics
          .flat()
          .filter(
            ({ code }) => code === 'COLLECTION_HOST_INSTANTIATION_FAILED',
          ),
      ).toMatchObject([
        {
          dataPath: ['rows'],
          parameters: { node: 'rows' },
        },
      ]);
    },
  );

  it('isolates one item-host failure without suppressing its siblings', () => {
    let calls = 0;
    const factory = {
      create(container: ViewContainerRef) {
        calls += 1;
        if (calls === 1) throw new Error('hidden');
        return container.createComponent(PartialItemHost);
      },
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: ItemHostFactory, useValue: factory },
        provideSchemaEngineAngularNative(),
      ],
    });
    const fixture = TestBed.createComponent(CollectionHost);
    fixture.detectChanges();
    TestBed.tick();
    expect(
      (fixture.nativeElement as HTMLElement).querySelectorAll(
        '[data-schema-item-key]',
      ),
    ).toHaveLength(1);
    expect(
      fixture.componentInstance.diagnostics
        .flat()
        .filter(({ code }) => code === 'ITEM_HOST_INSTANTIATION_FAILED'),
    ).toHaveLength(1);
  });
});

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
  if (!(element instanceof HTMLElement)) throw new Error(`missing id ${id}`);
  return element;
}
