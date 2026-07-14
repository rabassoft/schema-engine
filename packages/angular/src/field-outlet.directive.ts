import {
  Directive,
  DestroyRef,
  EnvironmentInjector,
  ViewContainerRef,
  effect,
  inject,
  input,
  inputBinding,
  outputBinding,
  signal,
  type ComponentRef,
} from '@angular/core';
import type {
  DataPath,
  Diagnostic,
  FieldDefinition,
  FieldRuntimeSnapshot,
} from '@rabassoft/schema-engine';
import { SchemaFormDirective, readRuntimeContext } from './form.directive.js';
import {
  adapterDiagnostic,
  AngularRendererResolver,
  type AngularFieldRenderer,
} from './renderer.js';
import {
  AngularTextProjector,
  emptyTextSnapshot,
  type AngularFieldTextSnapshot,
} from './text.js';

interface RendererBinding {
  readonly path: DataPath;
  readonly runtimeContext: NonNullable<ReturnType<typeof readRuntimeContext>>;
  active: boolean;
}

@Directive({ selector: '[schemaFieldOutlet]', standalone: true })
export class SchemaFieldOutletDirective {
  readonly schemaFieldOutlet = input.required<FieldDefinition>();

  private readonly form = inject(SchemaFormDirective);
  private readonly resolver = inject(AngularRendererResolver);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly textProjector = inject(AngularTextProjector);
  private readonly textsState =
    signal<AngularFieldTextSnapshot>(emptyTextSnapshot());
  private componentRef: ComponentRef<AngularFieldRenderer> | undefined;
  private componentBinding: RendererBinding | undefined;
  private lastIdentity: readonly unknown[] | undefined;
  private lastTextIdentity: readonly unknown[] | undefined;

  constructor() {
    effect(() => {
      const field = this.schemaFieldOutlet();
      const snapshot = this.form.snapshot();
      const context = readRuntimeContext(this.form);
      if (snapshot === undefined || context === undefined) return;
      const fieldSnapshot = findFieldSnapshot(snapshot.fields, field);
      if (fieldSnapshot === undefined) return;
      const identity = [
        field,
        context.formId,
        snapshot.locale,
        fieldSnapshot.issues,
      ] as const;
      if (sameIdentity(this.lastTextIdentity, identity)) return;
      this.lastTextIdentity = identity;
      const projection = this.textProjector.project(
        field,
        fieldSnapshot,
        context.formId,
        snapshot.locale,
      );
      this.textsState.set(projection.texts);
      this.form.reportDiagnostics(projection.diagnostics);
    });
    effect(() => {
      const field = this.schemaFieldOutlet();
      const snapshot = this.form.snapshot();
      const runtimeContext = readRuntimeContext(this.form);
      const identity = [field, runtimeContext] as const;
      if (
        !this.form.ready() ||
        snapshot === undefined ||
        runtimeContext === undefined
      )
        return;
      if (sameIdentity(this.lastIdentity, identity)) return;
      this.lastIdentity = identity;
      this.destroyComponent();

      const fieldSnapshot = findFieldSnapshot(snapshot.fields, field);
      if (fieldSnapshot === undefined) {
        this.form.reportDiagnostics([
          outletDiagnostic(
            'MISSING_FIELD_SNAPSHOT',
            { field: field.name, path: Object.freeze([...field.path]) },
            `Field snapshot "${field.name}" is missing.`,
            field,
          ),
        ]);
        return;
      }

      const resolution = this.resolver.resolve(field);
      this.form.reportDiagnostics(resolution.diagnostics);
      if (!resolution.success) return;

      const boundPath = Object.freeze([...field.path]);
      const boundRuntimeContext = runtimeContext;
      const binding: RendererBinding = {
        path: boundPath,
        runtimeContext: boundRuntimeContext,
        active: true,
      };

      try {
        this.componentRef = this.viewContainer.createComponent(
          resolution.registration.renderer,
          {
            environmentInjector: this.environmentInjector,
            bindings: [
              inputBinding('field', () => this.schemaFieldOutlet()),
              inputBinding(
                'snapshot',
                () =>
                  findFieldSnapshot(
                    this.form.snapshot()?.fields ?? [],
                    this.schemaFieldOutlet(),
                  ) ?? fieldSnapshot,
              ),
              inputBinding(
                'formId',
                () => readRuntimeContext(this.form)?.formId ?? '',
              ),
              inputBinding('locale', () => this.form.snapshot()?.locale ?? ''),
              inputBinding('texts', () => this.textsState()),
              outputBinding<unknown>('setValue', (value) => {
                if (
                  binding.active &&
                  readRuntimeContext(this.form) === boundRuntimeContext &&
                  this.allowsIntent(boundPath)
                )
                  this.form.requestSetValue(boundPath, value);
              }),
              outputBinding<void>('removeValue', () => {
                if (
                  binding.active &&
                  readRuntimeContext(this.form) === boundRuntimeContext &&
                  this.allowsIntent(boundPath)
                )
                  this.form.requestRemoveValue(boundPath);
              }),
              outputBinding<void>('fieldFocus', () => {
                if (
                  binding.active &&
                  readRuntimeContext(this.form) === boundRuntimeContext &&
                  this.allowsIntent(boundPath)
                )
                  this.form.focus(boundPath);
              }),
              outputBinding<void>('fieldBlur', () => {
                if (
                  binding.active &&
                  readRuntimeContext(this.form) === boundRuntimeContext &&
                  this.allowsIntent(boundPath)
                )
                  this.form.blur(boundPath);
              }),
              outputBinding<readonly Diagnostic[]>(
                'rendererDiagnostics',
                (diagnostics) => this.form.reportDiagnostics(diagnostics),
              ),
            ],
          },
        );
        this.componentBinding = binding;
      } catch {
        binding.active = false;
        this.destroyComponent();
        this.form.reportDiagnostics([
          outletDiagnostic(
            'RENDERER_INSTANTIATION_FAILED',
            { id: resolution.registration.id, field: field.name },
            `Renderer "${resolution.registration.id}" could not be instantiated.`,
            field,
          ),
        ]);
      }
    });
    this.destroyRef.onDestroy(() => this.destroyComponent());
  }

  private destroyComponent(): void {
    const ref = this.componentRef;
    const binding = this.componentBinding;
    this.componentRef = undefined;
    this.componentBinding = undefined;
    if (binding !== undefined) binding.active = false;
    if (ref === undefined) {
      this.viewContainer.clear();
      return;
    }
    const index = this.viewContainer.indexOf(ref.hostView);
    const snapshot = this.form.snapshot();
    if (
      index >= 0 &&
      binding !== undefined &&
      readRuntimeContext(this.form) === binding.runtimeContext &&
      snapshot !== undefined &&
      findFieldSnapshotByPath(snapshot.fields, binding.path)?.focused === true
    )
      this.form.blur(binding.path);
    if (index >= 0) this.viewContainer.remove(index);
    else if (!ref.hostView.destroyed) ref.destroy();
  }

  private allowsIntent(path: DataPath): boolean {
    const presence = findFieldSnapshotByPath(
      this.form.snapshot()?.fields ?? [],
      path,
    )?.presence;
    return !(
      presence?.kind === 'blocked' &&
      presence.reason === 'incompatible-ancestor'
    );
  }
}

function findFieldSnapshot(
  snapshots: readonly FieldRuntimeSnapshot[],
  field: FieldDefinition,
): FieldRuntimeSnapshot | undefined {
  return findFieldSnapshotByPath(snapshots, field.path);
}

function findFieldSnapshotByPath(
  snapshots: readonly FieldRuntimeSnapshot[],
  path: DataPath,
): FieldRuntimeSnapshot | undefined {
  return snapshots.find(
    (snapshot) =>
      snapshot.path.length === path.length &&
      snapshot.path.every((segment, index) => Object.is(segment, path[index])),
  );
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

function outletDiagnostic(
  code: string,
  parameters: Readonly<Record<string, unknown>>,
  fallbackMessage: string,
  field: FieldDefinition,
): Diagnostic {
  return adapterDiagnostic(
    code,
    'error',
    parameters,
    fallbackMessage,
    field.path,
  );
}
