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
import type {
  FieldDefinition,
  FieldRuntimeSnapshot,
  FormNodeDefinition,
  NodeRuntimeSnapshot,
  ObjectFieldDefinition,
  ObjectRuntimeSnapshot,
} from '@rabassoft/schema-engine';
import { SchemaFieldOutletDirective } from './field-outlet.directive.js';
import { SchemaFormDirective, readRuntimeContext } from './form.directive.js';
import { nodeIdBase } from './native/common.js';
import { adapterDiagnostic } from './renderer.js';
import {
  AngularTextProjector,
  emptyObjectTextSnapshot,
  type AngularObjectTextSnapshot,
} from './text.js';

interface ProjectedChild {
  readonly definition: FormNodeDefinition;
  readonly snapshot: NodeRuntimeSnapshot;
}

/** @internal */
@Component({
  selector: 'schema-node-outlet',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-template #container />`,
})
export class SchemaNodeOutletComponent {
  readonly definition = input.required<FormNodeDefinition>();
  readonly snapshot = input.required<NodeRuntimeSnapshot>();

  private readonly form = inject(SchemaFormDirective);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly objectHostFactory = inject(ObjectHostFactory);
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
      const identity = [definition, runtimeContext, snapshot.nodeKind] as const;
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
          );
          return;
        }
        if (definition.kind !== 'object' && snapshot.nodeKind === 'field') {
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
              ],
            },
          );
        }
      } catch {
        this.destroyComponent(container);
        if (definition.kind === 'object') {
          this.form.reportDiagnostics([
            adapterDiagnostic(
              'OBJECT_HOST_INSTANTIATION_FAILED',
              'error',
              { node: definition.name },
              'Object host could not be instantiated.',
              definition.path,
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
    definition: () => ObjectFieldDefinition,
    snapshot: () => ObjectRuntimeSnapshot,
  ): ComponentRef<unknown> {
    return container.createComponent(ObjectHostComponent, {
      environmentInjector,
      bindings: [
        inputBinding('definition', definition),
        inputBinding('snapshot', snapshot),
      ],
    });
  }
}

@Component({
  selector: 'schema-leaf-outlet-host',
  standalone: true,
  imports: [SchemaFieldOutletDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-container [schemaFieldOutlet]="definition()" />`,
})
class LeafOutletHostComponent {
  readonly definition = input.required<FieldDefinition>();
  readonly snapshot = input.required<FieldRuntimeSnapshot>();
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
        />
      }
    </fieldset>
  `,
})
class ObjectHostComponent {
  readonly definition = input.required<ObjectFieldDefinition>();
  readonly snapshot = input.required<ObjectRuntimeSnapshot>();

  private readonly form = inject(SchemaFormDirective);
  private readonly projector = inject(AngularTextProjector);
  private readonly textsState = signal<AngularObjectTextSnapshot>(
    emptyObjectTextSnapshot(),
  );
  private lastTextIdentity: readonly unknown[] | undefined;

  protected readonly texts = this.textsState.asReadonly();
  protected readonly ids = computed(() => {
    const context = readRuntimeContext(this.form);
    const base = nodeIdBase(context?.formId ?? '', this.definition().path);
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
        return childSnapshot === undefined
          ? []
          : [Object.freeze({ definition: child, snapshot: childSnapshot })];
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
