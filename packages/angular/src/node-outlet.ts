import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EnvironmentInjector,
  Injectable,
  ViewContainerRef,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  inputBinding,
  signal,
  viewChild,
  type ComponentRef,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import type {
  ArrayNodeDefinition,
  ArrayRuntimeSnapshot,
  CollectionNodeAddress,
  FieldDefinition,
  FieldTemplate,
  FieldRuntimeSnapshot,
  FormNodeDefinition,
  FormNodeTemplate,
  ItemRuntimeSnapshot,
  NodeRuntimeSnapshot,
  ObjectFieldDefinition,
  ObjectNodeTemplate,
  ObjectRuntimeSnapshot,
} from '@rabassoft/schema-engine';
import { SchemaFieldOutletDirective } from './field-outlet.directive.js';
import { SchemaFormDirective, readRuntimeContext } from './form.directive.js';
import {
  FIELD_INSTANCE_CONTEXT,
  itemNodeIdBase,
  nodeIdBase,
} from './native/common.js';
import { adapterDiagnostic } from './renderer.js';
import {
  AngularTextProjector,
  emptyCollectionTextSnapshot,
  emptyItemTextSnapshot,
  emptyObjectTextSnapshot,
  type AngularCollectionTextSnapshot,
  type AngularItemTextSnapshot,
  type AngularObjectTextSnapshot,
} from './text.js';

interface ProjectedChild {
  readonly definition: FormNodeDefinition | FormNodeTemplate;
  readonly snapshot: NodeRuntimeSnapshot;
  readonly address?: CollectionNodeAddress;
}

/** @internal */
@Component({
  selector: 'schema-node-outlet',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-template #container />`,
})
export class SchemaNodeOutletComponent {
  readonly definition = input.required<FormNodeDefinition | FormNodeTemplate>();
  readonly snapshot = input.required<NodeRuntimeSnapshot>();
  readonly address = input<CollectionNodeAddress>();

  private readonly form = inject(SchemaFormDirective);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly objectHostFactory = inject(ObjectHostFactory);
  private readonly collectionHostFactory = inject(CollectionHostFactory);
  private readonly destroyRef = inject(DestroyRef);
  private readonly container = viewChild.required('container', {
    read: ViewContainerRef,
  });
  private componentRef: ComponentRef<unknown> | undefined;
  private lastIdentity: readonly unknown[] | undefined;

  constructor() {
    effect(() => {
      const definition = this.definition();
      const snapshot = this.snapshot();
      const runtimeContext = readRuntimeContext(this.form);
      const container = this.container();
      if (runtimeContext === undefined) return;
      const address = this.address();
      const identity = [
        definition,
        runtimeContext,
        snapshot.nodeKind,
        address?.itemId,
      ] as const;
      if (sameIdentity(this.lastIdentity, identity)) return;
      this.lastIdentity = identity;
      this.destroyComponent(container);

      try {
        if (definition.kind === 'object' && snapshot.nodeKind === 'object') {
          this.componentRef = this.objectHostFactory.create(
            container,
            this.environmentInjector,
            () => {
              const candidate = this.definition();
              return candidate.kind === 'object' ? candidate : definition;
            },
            () => {
              const candidate = this.snapshot();
              return candidate.nodeKind === 'object' ? candidate : snapshot;
            },
            () => this.address() ?? address,
          );
          return;
        }
        if (definition.kind === 'array' && snapshot.nodeKind === 'array') {
          this.componentRef = this.collectionHostFactory.create(
            container,
            this.environmentInjector,
            () => {
              const candidate = this.definition();
              return candidate.kind === 'array' ? candidate : definition;
            },
            () => {
              const candidate = this.snapshot();
              return candidate.nodeKind === 'array' ? candidate : snapshot;
            },
          );
          return;
        }
        if (
          definition.kind !== 'object' &&
          definition.kind !== 'array' &&
          snapshot.nodeKind === 'field'
        ) {
          this.componentRef = container.createComponent(
            LeafOutletHostComponent,
            {
              environmentInjector: this.environmentInjector,
              bindings: [
                inputBinding('definition', () => {
                  const candidate = this.definition();
                  return candidate.kind !== 'object' ? candidate : definition;
                }),
                inputBinding('snapshot', () => {
                  const candidate = this.snapshot();
                  return candidate.nodeKind === 'field' ? candidate : snapshot;
                }),
                inputBinding('address', () => this.address() ?? address),
              ],
            },
          );
        }
      } catch {
        this.destroyComponent(container);
        if (definition.kind === 'array' && 'path' in definition) {
          this.form.reportDiagnostics([
            adapterDiagnostic(
              'COLLECTION_HOST_INSTANTIATION_FAILED',
              'error',
              { node: definition.name },
              'Collection host could not be instantiated.',
              definition.path,
            ),
          ]);
        } else if (definition.kind === 'object') {
          this.form.reportDiagnostics([
            adapterDiagnostic(
              'OBJECT_HOST_INSTANTIATION_FAILED',
              'error',
              { node: definition.name },
              'Object host could not be instantiated.',
              'path' in definition
                ? definition.path
                : this.address()?.collectionPath,
            ),
          ]);
        }
      }
    });
    this.destroyRef.onDestroy(() => this.destroyComponent(this.container()));
  }

  private destroyComponent(container: ViewContainerRef): void {
    const ref = this.componentRef;
    this.componentRef = undefined;
    if (ref === undefined) {
      container.clear();
      return;
    }
    const index = container.indexOf(ref.hostView);
    if (index >= 0) container.remove(index);
    else if (!ref.hostView.destroyed) ref.destroy();
  }
}

/** @internal */
@Injectable({ providedIn: 'root' })
export class ObjectHostFactory {
  create(
    container: ViewContainerRef,
    environmentInjector: EnvironmentInjector,
    definition: () => ObjectFieldDefinition | ObjectNodeTemplate,
    snapshot: () => ObjectRuntimeSnapshot,
    address: () => CollectionNodeAddress | undefined,
  ): ComponentRef<unknown> {
    return container.createComponent(ObjectHostComponent, {
      environmentInjector,
      bindings: [
        inputBinding('definition', definition),
        inputBinding('snapshot', snapshot),
        inputBinding('address', address),
      ],
    });
  }
}

@Component({
  selector: 'schema-leaf-outlet-host',
  standalone: true,
  imports: [SchemaFieldOutletDirective],
  providers: [
    {
      provide: FIELD_INSTANCE_CONTEXT,
      useExisting: forwardRef(() => LeafOutletHostComponent),
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-container [schemaFieldOutlet]="definition()" />`,
})
class LeafOutletHostComponent {
  readonly definition = input.required<FieldDefinition | FieldTemplate>();
  readonly snapshot = input.required<FieldRuntimeSnapshot>();
  readonly address = input<CollectionNodeAddress>();
}

@Component({
  selector: 'schema-object-host',
  standalone: true,
  imports: [forwardRef(() => SchemaNodeOutletComponent)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fieldset [disabled]="disabled()" [attr.aria-describedby]="describedBy()">
      <legend [id]="ids().legend">{{ texts().label }}</legend>
      @if (texts().description; as description) {
        <p [id]="ids().description">{{ description }}</p>
      }
      @if (texts().hint; as hint) {
        <p [id]="ids().hint">{{ hint }}</p>
      }
      @if (texts().tooltip; as tooltip) {
        <details>
          <summary [attr.aria-label]="tooltip">ⓘ</summary>
          <p [id]="ids().tooltip">{{ tooltip }}</p>
        </details>
      }
      @if (snapshot().showIssues && texts().issueMessages.length > 0) {
        <ul [id]="ids().issues" aria-live="polite">
          @for (message of texts().issueMessages; track $index) {
            <li>{{ message }}</li>
          }
        </ul>
      }
      @for (child of children(); track child.definition.key) {
        <schema-node-outlet
          [definition]="child.definition"
          [snapshot]="child.snapshot"
          [address]="child.address"
        />
      }
    </fieldset>
  `,
})
class ObjectHostComponent {
  readonly definition = input.required<
    ObjectFieldDefinition | ObjectNodeTemplate
  >();
  readonly snapshot = input.required<ObjectRuntimeSnapshot>();
  readonly address = input<CollectionNodeAddress>();

  private readonly form = inject(SchemaFormDirective);
  private readonly projector = inject(AngularTextProjector);
  private readonly textsState = signal<AngularObjectTextSnapshot>(
    emptyObjectTextSnapshot(),
  );
  private lastTextIdentity: readonly unknown[] | undefined;

  protected readonly texts = this.textsState.asReadonly();
  protected readonly ids = computed(() => {
    const context = readRuntimeContext(this.form);
    const definition = this.definition();
    const address = this.address();
    const base =
      address === undefined
        ? nodeIdBase(
            context?.formId ?? '',
            (definition as ObjectFieldDefinition).path,
          )
        : itemNodeIdBase(
            context?.formId ?? '',
            address.collectionPath,
            address.itemId,
            address.relativePath,
          );
    return Object.freeze({
      legend: `${base}--legend`,
      description: `${base}--description`,
      hint: `${base}--hint`,
      tooltip: `${base}--tooltip`,
      issues: `${base}--issues`,
    });
  });
  protected readonly disabled = computed(() => {
    const presence = this.snapshot().presence;
    return (
      presence.kind === 'incompatible' ||
      (presence.kind === 'blocked' &&
        presence.reason === 'incompatible-ancestor')
    );
  });
  protected readonly describedBy = computed(() => {
    const texts = this.texts();
    const ids = this.ids();
    const values = [
      ...(texts.description === undefined ? [] : [ids.description]),
      ...(texts.hint === undefined ? [] : [ids.hint]),
      ...(this.snapshot().showIssues && texts.issueMessages.length > 0
        ? [ids.issues]
        : []),
    ];
    return values.length === 0 ? null : values.join(' ');
  });
  protected readonly children = computed<readonly ProjectedChild[]>(() => {
    const definition = this.definition();
    const snapshot = this.snapshot();
    return Object.freeze(
      definition.children.flatMap((child, index) => {
        const childSnapshot = snapshot.children[index];
        if (childSnapshot === undefined) return [];
        const parentAddress = this.address();
        const address =
          parentAddress === undefined || !('relativePath' in child)
            ? undefined
            : Object.freeze({
                collectionPath: parentAddress.collectionPath,
                itemId: parentAddress.itemId,
                relativePath: child.relativePath,
              });
        return [
          Object.freeze({
            definition: child,
            snapshot: childSnapshot,
            ...(address === undefined ? {} : { address }),
          }),
        ];
      }),
    );
  });

  constructor() {
    effect(() => {
      const definition = this.definition();
      const snapshot = this.snapshot();
      const context = readRuntimeContext(this.form);
      const locale = this.form.snapshot()?.locale;
      if (context === undefined || locale === undefined) return;
      if (!('path' in definition)) {
        this.textsState.set(
          Object.freeze({
            label: definition.label,
            ...(definition.description === undefined
              ? {}
              : { description: definition.description }),
            ...(definition.hint === undefined ? {} : { hint: definition.hint }),
            ...(definition.tooltip === undefined
              ? {}
              : { tooltip: definition.tooltip }),
            issueMessages: Object.freeze(
              snapshot.issues.map(
                (issue) => issue.fallbackMessage ?? issue.code,
              ),
            ),
          }),
        );
        return;
      }
      const identity = [
        definition,
        context.formId,
        locale,
        snapshot.issues,
      ] as const;
      if (sameIdentity(this.lastTextIdentity, identity)) return;
      this.lastTextIdentity = identity;
      const projection = this.projector.projectObject(
        definition,
        snapshot,
        context.formId,
        locale,
      );
      this.textsState.set(projection.texts);
      this.form.reportDiagnostics(projection.diagnostics);
    });
  }
}

interface ProjectedItem {
  readonly snapshot: ItemRuntimeSnapshot;
  readonly previousItemId?: string;
  readonly nextItemId?: string;
}

/** @internal */
@Injectable({ providedIn: 'root' })
export class CollectionHostFactory {
  create(
    container: ViewContainerRef,
    environmentInjector: EnvironmentInjector,
    definition: () => ArrayNodeDefinition,
    snapshot: () => ArrayRuntimeSnapshot,
  ): ComponentRef<unknown> {
    return container.createComponent(CollectionHostComponent, {
      environmentInjector,
      bindings: [
        inputBinding('definition', definition),
        inputBinding('snapshot', snapshot),
      ],
    });
  }
}

@Component({
  selector: 'schema-collection-host',
  standalone: true,
  imports: [forwardRef(() => ItemOutletComponent)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fieldset [attr.aria-describedby]="describedBy()">
      <legend [id]="ids().legend" tabindex="-1">{{ texts().label }}</legend>
      @if (texts().description; as description) {
        <p [id]="ids().description">{{ description }}</p>
      }
      @if (texts().hint; as hint) {
        <p [id]="ids().hint">{{ hint }}</p>
      }
      @if (texts().tooltip; as tooltip) {
        <details>
          <summary [attr.aria-label]="tooltip">ⓘ</summary>
          <p [id]="ids().tooltip">{{ tooltip }}</p>
        </details>
      }
      @if (texts().identityError; as identityError) {
        <p [id]="ids().identity" role="alert">{{ identityError }}</p>
      }
      @if (snapshot().showIssues && texts().issueMessages.length > 0) {
        <ul [id]="ids().issues" aria-live="polite">
          @for (message of texts().issueMessages; track $index) {
            <li>{{ message }}</li>
          }
        </ul>
      }
      @for (item of items(); track item.snapshot.key) {
        <schema-item-outlet
          [collection]="definition()"
          [snapshot]="item.snapshot"
          [previousItemId]="item.previousItemId"
          [nextItemId]="item.nextItemId"
        />
      }
    </fieldset>
  `,
})
class CollectionHostComponent {
  readonly definition = input.required<ArrayNodeDefinition>();
  readonly snapshot = input.required<ArrayRuntimeSnapshot>();

  private readonly form = inject(SchemaFormDirective);
  private readonly projector = inject(AngularTextProjector);
  private readonly document = inject(DOCUMENT);
  private readonly nodeTextsState = signal<AngularCollectionTextSnapshot>(
    emptyCollectionTextSnapshot(),
  );
  private readonly identityTextState = signal<string | undefined>(undefined);
  private readonly issueTextsState = signal<readonly string[]>(
    Object.freeze([]),
  );
  private lastNodeTextIdentity: readonly unknown[] | undefined;
  private lastIdentityTextIdentity: readonly unknown[] | undefined;
  private lastIssueTextIdentity: readonly unknown[] | undefined;
  private lastItems: readonly ItemRuntimeSnapshot[] | undefined;

  protected readonly texts = computed<AngularCollectionTextSnapshot>(() => {
    const node = this.nodeTextsState();
    const identityError = this.identityTextState();
    return Object.freeze({
      label: node.label,
      ...(node.description === undefined
        ? {}
        : { description: node.description }),
      ...(node.hint === undefined ? {} : { hint: node.hint }),
      ...(node.tooltip === undefined ? {} : { tooltip: node.tooltip }),
      ...(identityError === undefined ? {} : { identityError }),
      issueMessages: this.issueTextsState(),
    });
  });
  protected readonly ids = computed(() => {
    const context = readRuntimeContext(this.form);
    const base = nodeIdBase(context?.formId ?? '', this.definition().path);
    return Object.freeze({
      legend: `${base}--legend`,
      description: `${base}--description`,
      hint: `${base}--hint`,
      tooltip: `${base}--tooltip`,
      identity: `${base}--identity`,
      issues: `${base}--issues`,
    });
  });
  protected readonly describedBy = computed(() => {
    const texts = this.texts();
    const ids = this.ids();
    const values = [
      ...(texts.description === undefined ? [] : [ids.description]),
      ...(texts.hint === undefined ? [] : [ids.hint]),
      ...(texts.identityError === undefined ? [] : [ids.identity]),
      ...(this.snapshot().showIssues && texts.issueMessages.length > 0
        ? [ids.issues]
        : []),
    ];
    return values.length === 0 ? null : values.join(' ');
  });
  protected readonly items = computed<readonly ProjectedItem[]>(() => {
    const items = this.snapshot().items;
    return Object.freeze(
      items.map((snapshot, index) =>
        Object.freeze({
          snapshot,
          ...(index === 0
            ? {}
            : {
                previousItemId: (items[index - 1] as ItemRuntimeSnapshot)
                  .address.itemId,
              }),
          ...(index === items.length - 1
            ? {}
            : {
                nextItemId: (items[index + 1] as ItemRuntimeSnapshot).address
                  .itemId,
              }),
        }),
      ),
    );
  });

  constructor() {
    effect(() => {
      const definition = this.definition();
      const context = readRuntimeContext(this.form);
      const locale = this.form.snapshot()?.locale;
      if (context === undefined || locale === undefined) return;
      const identity = [definition, context.formId, locale] as const;
      if (sameIdentity(this.lastNodeTextIdentity, identity)) return;
      this.lastNodeTextIdentity = identity;
      const projection = this.projector.projectCollectionNode(
        definition,
        context.formId,
        locale,
      );
      this.nodeTextsState.set(projection.texts);
      this.form.reportDiagnostics(projection.diagnostics);
    });
    effect(() => {
      const definition = this.definition();
      const snapshot = this.snapshot();
      const context = readRuntimeContext(this.form);
      const locale = this.form.snapshot()?.locale;
      if (context === undefined || locale === undefined) return;
      const identityState = snapshot.identityState;
      const identity = [
        definition,
        context.formId,
        locale,
        identityState.kind,
        identityState.kind === 'invalid' ? identityState.reason : undefined,
        identityState.kind === 'invalid' ? identityState.index : undefined,
      ] as const;
      if (sameIdentity(this.lastIdentityTextIdentity, identity)) return;
      this.lastIdentityTextIdentity = identity;
      const projection = this.projector.projectCollectionIdentity(
        definition,
        snapshot,
        context.formId,
        locale,
      );
      this.identityTextState.set(projection.text);
      this.form.reportDiagnostics(projection.diagnostics);
    });
    effect(() => {
      const definition = this.definition();
      const snapshot = this.snapshot();
      const context = readRuntimeContext(this.form);
      const locale = this.form.snapshot()?.locale;
      if (context === undefined || locale === undefined) return;
      const identity = [
        definition,
        context.formId,
        locale,
        snapshot.issues,
      ] as const;
      if (sameIdentity(this.lastIssueTextIdentity, identity)) return;
      this.lastIssueTextIdentity = identity;
      const projection = this.projector.projectCollectionIssues(
        definition,
        snapshot,
        context.formId,
        locale,
      );
      this.issueTextsState.set(projection.messages);
      this.form.reportDiagnostics(projection.diagnostics);
    });
    effect(() => this.restoreFocus(this.snapshot().items));
  }

  private restoreFocus(items: readonly ItemRuntimeSnapshot[]): void {
    const previous = this.lastItems;
    this.lastItems = items;
    if (previous === undefined) return;
    const active = this.document.activeElement;
    if (!(active instanceof HTMLElement)) return;
    const owner = active.closest<HTMLElement>('[data-schema-item-key]');
    const activeKey = owner?.dataset['schemaItemKey'];
    if (activeKey === undefined) return;
    const previousIndex = previous.findIndex((item) => item.key === activeKey);
    if (previousIndex < 0) return;
    const currentIndex = items.findIndex((item) => item.key === activeKey);
    const activeId = active.id;
    queueMicrotask(() => {
      if (currentIndex >= 0) {
        if (activeId.length > 0)
          this.document.getElementById(activeId)?.focus();
        return;
      }
      const target =
        items[previousIndex] ??
        items[Math.min(previousIndex - 1, items.length - 1)];
      const context = readRuntimeContext(this.form);
      const targetId =
        target === undefined || context === undefined
          ? this.ids().legend
          : `${itemNodeIdBase(
              context.formId,
              this.definition().path,
              target.address.itemId,
              [],
            )}--legend`;
      this.document.getElementById(targetId)?.focus();
    });
  }
}

/** @internal */
@Injectable({ providedIn: 'root' })
export class ItemHostFactory {
  create(
    container: ViewContainerRef,
    environmentInjector: EnvironmentInjector,
    collection: () => ArrayNodeDefinition,
    snapshot: () => ItemRuntimeSnapshot,
    previousItemId: () => string | undefined,
    nextItemId: () => string | undefined,
  ): ComponentRef<unknown> {
    return container.createComponent(ItemHostComponent, {
      environmentInjector,
      bindings: [
        inputBinding('collection', collection),
        inputBinding('snapshot', snapshot),
        inputBinding('previousItemId', previousItemId),
        inputBinding('nextItemId', nextItemId),
      ],
    });
  }
}

@Component({
  selector: 'schema-item-outlet',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-template #container />`,
})
class ItemOutletComponent {
  readonly collection = input.required<ArrayNodeDefinition>();
  readonly snapshot = input.required<ItemRuntimeSnapshot>();
  readonly previousItemId = input<string>();
  readonly nextItemId = input<string>();

  private readonly form = inject(SchemaFormDirective);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly factory = inject(ItemHostFactory);
  private readonly container = viewChild.required('container', {
    read: ViewContainerRef,
  });
  private readonly destroyRef = inject(DestroyRef);
  private componentRef: ComponentRef<unknown> | undefined;
  private lastIdentity: readonly unknown[] | undefined;

  constructor() {
    effect(() => {
      const collection = this.collection();
      const snapshot = this.snapshot();
      const context = readRuntimeContext(this.form);
      const container = this.container();
      if (context === undefined) return;
      const identity = [collection, context, snapshot.address.itemId] as const;
      if (sameIdentity(this.lastIdentity, identity)) return;
      this.lastIdentity = identity;
      this.destroyComponent(container);
      try {
        this.componentRef = this.factory.create(
          container,
          this.environmentInjector,
          () => this.collection(),
          () => this.snapshot(),
          () => this.previousItemId(),
          () => this.nextItemId(),
        );
      } catch {
        this.destroyComponent(container);
        this.form.reportDiagnostics([
          adapterDiagnostic(
            'ITEM_HOST_INSTANTIATION_FAILED',
            'error',
            { node: collection.name, itemId: snapshot.address.itemId },
            'Item host could not be instantiated.',
            collection.path,
          ),
        ]);
      }
    });
    this.destroyRef.onDestroy(() => this.destroyComponent(this.container()));
  }

  private destroyComponent(container: ViewContainerRef): void {
    const ref = this.componentRef;
    this.componentRef = undefined;
    if (ref === undefined) {
      container.clear();
      return;
    }
    const index = container.indexOf(ref.hostView);
    if (index >= 0) container.remove(index);
    else if (!ref.hostView.destroyed) ref.destroy();
  }
}

@Component({
  selector: 'schema-item-host',
  standalone: true,
  imports: [forwardRef(() => SchemaNodeOutletComponent)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fieldset [attr.data-schema-item-key]="snapshot().key">
      <legend [id]="ids().legend" tabindex="-1">{{ texts().label }}</legend>
      <div>
        <button
          type="button"
          [id]="ids().remove"
          [attr.aria-label]="texts().remove"
          (click)="remove()"
        >
          {{ texts().remove }}
        </button>
        <button
          type="button"
          [id]="ids().moveEarlier"
          [attr.aria-label]="texts().moveEarlier"
          [disabled]="previousItemId() === undefined"
          (click)="moveEarlier()"
        >
          {{ texts().moveEarlier }}
        </button>
        <button
          type="button"
          [id]="ids().moveLater"
          [attr.aria-label]="texts().moveLater"
          [disabled]="nextItemId() === undefined"
          (click)="moveLater()"
        >
          {{ texts().moveLater }}
        </button>
      </div>
      @if (snapshot().showIssues && texts().issueMessages.length > 0) {
        <ul [id]="ids().issues" aria-live="polite">
          @for (message of texts().issueMessages; track $index) {
            <li>{{ message }}</li>
          }
        </ul>
      }
      @for (child of children(); track child.definition.key) {
        <schema-node-outlet
          [definition]="child.definition"
          [snapshot]="child.snapshot"
          [address]="child.address"
        />
      }
    </fieldset>
  `,
})
class ItemHostComponent {
  readonly collection = input.required<ArrayNodeDefinition>();
  readonly snapshot = input.required<ItemRuntimeSnapshot>();
  readonly previousItemId = input<string>();
  readonly nextItemId = input<string>();

  private readonly form = inject(SchemaFormDirective);
  private readonly projector = inject(AngularTextProjector);
  private readonly actionTextsState = signal<AngularItemTextSnapshot>(
    emptyItemTextSnapshot(),
  );
  private readonly issueTextsState = signal<readonly string[]>(
    Object.freeze([]),
  );
  private lastActionTextIdentity: readonly unknown[] | undefined;
  private lastIssueTextIdentity: readonly unknown[] | undefined;

  protected readonly texts = computed<AngularItemTextSnapshot>(() => {
    const actions = this.actionTextsState();
    return Object.freeze({
      label: actions.label,
      remove: actions.remove,
      moveEarlier: actions.moveEarlier,
      moveLater: actions.moveLater,
      issueMessages: this.issueTextsState(),
    });
  });
  protected readonly ids = computed(() => {
    const context = readRuntimeContext(this.form);
    const snapshot = this.snapshot();
    const base = itemNodeIdBase(
      context?.formId ?? '',
      this.collection().path,
      snapshot.address.itemId,
      [],
    );
    return Object.freeze({
      legend: `${base}--legend`,
      remove: `${base}--remove`,
      moveEarlier: `${base}--move-earlier`,
      moveLater: `${base}--move-later`,
      issues: `${base}--issues`,
    });
  });
  protected readonly children = computed<readonly ProjectedChild[]>(() => {
    const collection = this.collection();
    const snapshot = this.snapshot();
    return Object.freeze(
      collection.item.children.flatMap((definition, index) => {
        const childSnapshot = snapshot.children[index];
        if (childSnapshot === undefined) return [];
        const address: CollectionNodeAddress = Object.freeze({
          collectionPath: snapshot.address.collectionPath,
          itemId: snapshot.address.itemId,
          relativePath: definition.relativePath,
        });
        return [
          Object.freeze({ definition, snapshot: childSnapshot, address }),
        ];
      }),
    );
  });

  constructor() {
    effect(() => {
      const collection = this.collection();
      const snapshot = this.snapshot();
      const context = readRuntimeContext(this.form);
      const locale = this.form.snapshot()?.locale;
      if (context === undefined || locale === undefined) return;
      const identity = [
        collection,
        context.formId,
        locale,
        snapshot.address.itemId,
        snapshot.index,
      ] as const;
      if (sameIdentity(this.lastActionTextIdentity, identity)) return;
      this.lastActionTextIdentity = identity;
      const projection = this.projector.projectItemActions(
        collection,
        snapshot,
        context.formId,
        locale,
      );
      this.actionTextsState.set({
        ...projection.texts,
        issueMessages: Object.freeze([]),
      });
      this.form.reportDiagnostics(projection.diagnostics);
    });
    effect(() => {
      const collection = this.collection();
      const snapshot = this.snapshot();
      const context = readRuntimeContext(this.form);
      const locale = this.form.snapshot()?.locale;
      if (context === undefined || locale === undefined) return;
      const identity = [
        collection,
        context.formId,
        locale,
        snapshot.address.itemId,
        snapshot.index,
        snapshot.issues,
      ] as const;
      if (sameIdentity(this.lastIssueTextIdentity, identity)) return;
      this.lastIssueTextIdentity = identity;
      const projection = this.projector.projectItemIssues(
        collection,
        snapshot,
        context.formId,
        locale,
      );
      this.issueTextsState.set(projection.messages);
      this.form.reportDiagnostics(projection.diagnostics);
    });
  }

  protected remove(): void {
    this.form.requestRemoveItem(this.snapshot().address);
  }

  protected moveEarlier(): void {
    const itemId = this.previousItemId();
    if (itemId === undefined) return;
    this.form.requestMoveItem(this.snapshot().address, {
      kind: 'before',
      itemId,
    });
  }

  protected moveLater(): void {
    const itemId = this.nextItemId();
    if (itemId === undefined) return;
    this.form.requestMoveItem(this.snapshot().address, {
      kind: 'after',
      itemId,
    });
  }
}

function sameIdentity(
  left: readonly unknown[] | undefined,
  right: readonly unknown[],
): boolean {
  return (
    left !== undefined &&
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}
