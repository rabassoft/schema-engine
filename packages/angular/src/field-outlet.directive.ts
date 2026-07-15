// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

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
  CollectionNodeAddress,
  DataPath,
  Diagnostic,
  FieldDefinition,
  FieldTemplate,
  FieldRuntimeSnapshot,
} from '@rabassoft/schema-engine';
import { FIELD_INSTANCE_CONTEXT } from './native/common.js';
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
  readonly target: DataPath | CollectionNodeAddress;
  readonly address?: CollectionNodeAddress;
  readonly runtimeContext: NonNullable<ReturnType<typeof readRuntimeContext>>;
  active: boolean;
}

@Directive({ selector: '[schemaFieldOutlet]', standalone: true })
export class SchemaFieldOutletDirective {
  readonly schemaFieldOutlet = input.required<
    FieldDefinition | FieldTemplate
  >();

  private readonly form = inject(SchemaFormDirective);
  private readonly resolver = inject(AngularRendererResolver);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly textProjector = inject(AngularTextProjector);
  private readonly instanceContext = inject(FIELD_INSTANCE_CONTEXT, {
    optional: true,
  });
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
      const fieldSnapshot = this.fieldSnapshot(snapshot.fields, field);
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
      const address = this.instanceContext?.address();
      const identity = [field, runtimeContext, address?.itemId] as const;
      if (
        !this.form.ready() ||
        snapshot === undefined ||
        runtimeContext === undefined
      )
        return;
      if (sameIdentity(this.lastIdentity, identity)) return;
      this.lastIdentity = identity;
      this.destroyComponent();

      const fieldSnapshot = this.fieldSnapshot(snapshot.fields, field);
      if (fieldSnapshot === undefined) {
        this.form.reportDiagnostics([
          outletDiagnostic(
            'MISSING_FIELD_SNAPSHOT',
            {
              field: field.name,
              ...('path' in field
                ? { path: Object.freeze([...field.path]) }
                : {
                    relativePath: Object.freeze([...field.relativePath]),
                  }),
            },
            `Field snapshot "${field.name}" is missing.`,
            field,
          ),
        ]);
        return;
      }

      const resolution = this.resolver.resolve(field);
      this.form.reportDiagnostics(resolution.diagnostics);
      if (!resolution.success) return;

      const boundAddress =
        address === undefined
          ? undefined
          : Object.freeze({
              collectionPath: Object.freeze([...address.collectionPath]),
              itemId: address.itemId,
              relativePath: Object.freeze([...address.relativePath]),
            });
      const boundTarget =
        boundAddress ?? Object.freeze([...(field as FieldDefinition).path]);
      const boundRuntimeContext = runtimeContext;
      const binding: RendererBinding = {
        target: boundTarget,
        ...(boundAddress === undefined ? {} : { address: boundAddress }),
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
                  this.fieldSnapshot(
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
                  this.allowsIntent()
                ) {
                  if (binding.address === undefined)
                    this.form.requestSetValue(
                      binding.target as DataPath,
                      value,
                    );
                  else this.form.requestSetItemValue(binding.address, value);
                }
              }),
              outputBinding<void>('removeValue', () => {
                if (
                  binding.active &&
                  readRuntimeContext(this.form) === boundRuntimeContext &&
                  this.allowsIntent()
                ) {
                  if (binding.address === undefined)
                    this.form.requestRemoveValue(binding.target as DataPath);
                  else this.form.requestRemoveItemValue(binding.address);
                }
              }),
              outputBinding<void>('fieldFocus', () => {
                if (
                  binding.active &&
                  readRuntimeContext(this.form) === boundRuntimeContext &&
                  this.allowsIntent()
                )
                  this.form.focus(binding.target);
              }),
              outputBinding<void>('fieldBlur', () => {
                if (
                  binding.active &&
                  readRuntimeContext(this.form) === boundRuntimeContext &&
                  this.allowsIntent()
                )
                  this.form.blur(binding.target);
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
            fieldSnapshot.path,
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
      (binding.address === undefined
        ? findFieldSnapshotByPath(snapshot.fields, binding.target as DataPath)
        : this.form.getCollectionNodeSnapshot(binding.address)
      )?.focused === true
    )
      this.form.blur(binding.target);
    if (index >= 0) this.viewContainer.remove(index);
    else if (!ref.hostView.destroyed) ref.destroy();
  }

  private allowsIntent(): boolean {
    const presence = this.fieldSnapshot(
      this.form.snapshot()?.fields ?? [],
      this.schemaFieldOutlet(),
    )?.presence;
    return !(
      presence?.kind === 'blocked' &&
      presence.reason === 'incompatible-ancestor'
    );
  }

  private fieldSnapshot(
    snapshots: readonly FieldRuntimeSnapshot[],
    field: FieldDefinition | FieldTemplate,
  ): FieldRuntimeSnapshot | undefined {
    return (
      this.instanceContext?.snapshot() ??
      ('path' in field
        ? findFieldSnapshotByPath(snapshots, field.path)
        : undefined)
    );
  }
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
  field: FieldDefinition | FieldTemplate,
  snapshotPath?: DataPath,
): Diagnostic {
  return adapterDiagnostic(
    code,
    'error',
    parameters,
    fallbackMessage,
    snapshotPath ?? ('path' in field ? field.path : undefined),
  );
}
