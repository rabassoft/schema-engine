// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import {
  Component,
  Fragment,
  createElement,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
  type ReactElement,
} from 'react';
import type {
  ArrayNodeDefinition,
  ArrayRuntimeSnapshot,
  CollectionNodeAddress,
  DataPath,
  Diagnostic,
  DiscriminatedObjectRuntimeSnapshot,
  FieldDefinition,
  FieldRuntimeSnapshot,
  FieldTemplate,
  FormNodeDefinition,
  FormNodeTemplate,
  ItemRuntimeSnapshot,
  NodeRuntimeSnapshot,
  ObjectNodeDefinition,
  ObjectRuntimeSnapshot,
  PresentationEntryDefinition,
  RuntimeActionResult,
  WizardDefinition,
  WizardStepSnapshot,
} from '@rabassoft/schema-engine';
import type {
  ReactFieldRendererProps,
  ReactFieldTextSnapshot,
  ReactFormHandle,
  ReactRendererComponent,
  ReactRendererRegistry,
  SchemaFormProps,
} from './contracts.js';
import {
  internalReactHandleContexts,
  type InternalReactHandleContext,
} from './internal/controller.js';
import {
  actualType,
  adapterDiagnostic,
  EMPTY_DIAGNOSTICS,
  freezeDiagnostics,
} from './internal/diagnostics.js';
import {
  internalReactDiagnosticsReceiver,
  internalReactFormHandleBrand,
} from './internal/handle.js';
import {
  internalReactRendererRegistries,
  resolveReactRenderer,
  type InternalRendererRegistration,
  type RendererResolution,
} from './internal/registry.js';
import { internalReactRendererRegistryBrand } from './internal/registry-brand.js';
import { BridgeStore } from './internal/store.js';
import { projectFieldText } from './internal/text.js';
import {
  AccordionHost,
  CollectionHost,
  GridHost,
  LeafVisibilityHost,
  ObjectHost,
  SectionHost,
  TabsHost,
  type GridItem,
  type PresentationPanel,
  type ProjectedItem,
} from './internal/compound.js';
import {
  projectCollectionText,
  projectItemText,
  projectObjectText,
  projectPresentationLabel,
  projectWizardText,
} from './internal/compound-text.js';
import {
  WizardHost,
  type ProjectedWizardStep,
  type WizardTexts,
} from './internal/wizard.js';

interface RendererGate {
  active: boolean;
  interactive: boolean;
  committed: boolean;
  wasCommitted: boolean;
  failed: boolean;
  blurActive?: () => void;
}

interface ProjectionCache {
  readonly handle?: object;
  readonly epochId?: number;
  readonly registry?: object;
  readonly generation?: number;
  readonly elements: readonly ReactElement[];
  readonly gates: readonly RendererGate[];
  readonly owners: readonly OwnerGate[];
  readonly memos: readonly OwnerProjectionMemo[];
  readonly compoundMemos: readonly CompoundProjectionMemo[];
}

interface OwnerGate {
  readonly epochId: number;
  readonly ownerKey: string;
  readonly registrationId: string;
  readonly component: ReactRendererComponent;
  readonly gate: RendererGate;
}

interface OwnerProjectionMemo {
  readonly epochId: number;
  readonly ownerKey: string;
  readonly field: FieldDefinition | FieldTemplate;
  readonly registry: ReactRendererRegistry;
  readonly projectionGeneration: number;
  readonly locale: string;
  readonly issues: FieldRuntimeSnapshot['issues'];
  readonly resolution: RendererResolution;
  readonly texts?: ReactFieldTextSnapshot;
}

interface CompoundProjectionMemo {
  readonly epochId: number;
  readonly ownerKey: string;
  readonly source: object;
  readonly projectionGeneration: number;
  readonly locale: string;
  readonly identity: readonly unknown[];
  readonly texts: unknown;
}

interface ValidComposition<TData extends object> {
  readonly valid: true;
  readonly form: ReactFormHandle<TData>;
  readonly registry: ReactRendererRegistry;
  readonly context: InternalReactHandleContext;
}

interface InvalidComposition {
  readonly valid: false;
  readonly candidate: unknown;
  readonly diagnostic: Diagnostic;
  readonly report?: (diagnostics: readonly Diagnostic[]) => void;
}

type Composition<TData extends object> =
  ValidComposition<TData> | InvalidComposition;

const EMPTY_ELEMENTS: readonly ReactElement[] = Object.freeze([]);
const EMPTY_GATES: readonly RendererGate[] = Object.freeze([]);
const EMPTY_OWNERS: readonly OwnerGate[] = Object.freeze([]);
const EMPTY_MEMOS: readonly OwnerProjectionMemo[] = Object.freeze([]);
const EMPTY_COMPOUND_MEMOS: readonly CompoundProjectionMemo[] = Object.freeze(
  [],
);

export function SchemaForm<TData extends object>(
  props: SchemaFormProps<TData>,
): ReactElement | null {
  const storeReference = useRef<BridgeStore<ProjectionCache> | undefined>(
    undefined,
  );
  if (storeReference.current === undefined)
    storeReference.current = new BridgeStore(emptyCache());
  const store = storeReference.current;
  const cache = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const composition = inspectComposition<TData>(props);
  const lastCompositionFailure = useRef<
    | readonly [
        unknown,
        string,
        string,
        ((diagnostics: readonly Diagnostic[]) => void) | undefined,
      ]
    | undefined
  >(undefined);

  useLayoutEffect(() => {
    if (composition.valid) {
      lastCompositionFailure.current = undefined;
      return;
    }
    const current = lastCompositionFailure.current;
    if (
      current !== undefined &&
      Object.is(current[0], composition.candidate) &&
      current[1] === composition.diagnostic.code &&
      current[2] === composition.diagnostic.parameters['reason'] &&
      current[3] === composition.report
    )
      return;
    lastCompositionFailure.current = Object.freeze([
      composition.candidate,
      composition.diagnostic.code,
      String(composition.diagnostic.parameters['reason']),
      composition.report,
    ]);
    try {
      composition.report?.(Object.freeze([composition.diagnostic]));
    } catch {
      // Cross-copy diagnostic receivers are an isolated composition boundary.
    }
  });

  useLayoutEffect(() => {
    if (
      !composition.valid ||
      composition.form.state.status !== 'ready' ||
      composition.context.epochId === undefined ||
      composition.context.formId === undefined ||
      composition.context.locale === undefined ||
      composition.context.definition === undefined
    ) {
      replaceCache(store, emptyCache());
      return;
    }
    const current = store.getSnapshot();
    if (
      current.handle === composition.form &&
      current.registry === composition.registry &&
      current.generation === composition.context.projectionGeneration
    ) {
      reactivate(current.gates);
      return;
    }
    const prepared = prepareProjection(composition, current);
    if (!composition.context.isCurrent()) {
      deactivate(prepared.gates);
      return;
    }
    replaceCache(store, prepared);
    composition.context.reportDiagnostics(prepared.diagnostics);
  });

  useLayoutEffect(
    () => () => {
      deactivate(store.getSnapshot().gates);
    },
    [store],
  );

  if (
    !composition.valid ||
    composition.form.state.status !== 'ready' ||
    cache.epochId !== composition.context.epochId ||
    cache.registry !== composition.registry ||
    cache.generation !== composition.context.projectionGeneration
  )
    return null;
  return createElement(Fragment, null, ...cache.elements);
}

interface PreparedProjection extends ProjectionCache {
  readonly diagnostics: readonly Diagnostic[];
}

function prepareProjection<TData extends object>(
  composition: ValidComposition<TData>,
  previous: ProjectionCache,
): PreparedProjection {
  const state = composition.form.state;
  if (state.status !== 'ready')
    return Object.freeze({ ...emptyCache(), diagnostics: EMPTY_DIAGNOSTICS });
  const elements: ReactElement[] = [];
  const gates: RendererGate[] = [];
  const owners: OwnerGate[] = [];
  const memos: OwnerProjectionMemo[] = [];
  const compoundMemos: CompoundProjectionMemo[] = [];
  const diagnostics: Diagnostic[] = [];
  const epochId = composition.context.epochId;
  const locale = composition.context.locale;
  if (epochId === undefined || locale === undefined)
    return Object.freeze({ ...emptyCache(), diagnostics: EMPTY_DIAGNOSTICS });
  const definition = composition.context.definition;
  if (definition === undefined)
    return Object.freeze({ ...emptyCache(), diagnostics: EMPTY_DIAGNOSTICS });
  const directSnapshots = snapshotPathMap(state.snapshot.nodes);

  const projectCompoundText = <TTexts,>(
    ownerKey: string,
    source: object,
    identity: readonly unknown[],
    project: () => {
      readonly texts: TTexts;
      readonly diagnostics: readonly Diagnostic[];
    },
  ): TTexts => {
    const previousMemo = previous.compoundMemos.find(
      (memo) =>
        memo.epochId === epochId &&
        memo.ownerKey === ownerKey &&
        memo.source === source &&
        memo.projectionGeneration ===
          composition.context.projectionGeneration &&
        memo.locale === locale &&
        identityEquals(memo.identity, identity),
    );
    if (previousMemo !== undefined) {
      compoundMemos.push(previousMemo);
      return previousMemo.texts as TTexts;
    }
    const projected = project();
    diagnostics.push(...projected.diagnostics);
    compoundMemos.push(
      Object.freeze({
        epochId,
        ownerKey,
        source,
        projectionGeneration: composition.context.projectionGeneration,
        locale,
        identity: Object.freeze([...identity]),
        texts: projected.texts,
      }),
    );
    return projected.texts;
  };

  const projectField = (
    field: FieldDefinition | FieldTemplate,
    snapshot: FieldRuntimeSnapshot,
    ownerKey: string,
    target: FieldOwnerTarget,
    projectionInteractive = true,
  ): ReactElement | undefined => {
    const previousMemo = previous.memos.find(
      (memo) =>
        memo.epochId === epochId &&
        memo.ownerKey === ownerKey &&
        memo.field === field &&
        memo.registry === composition.registry,
    );
    const resolved =
      previousMemo?.resolution ??
      resolveReactRenderer(composition.registry, field);
    if (previousMemo === undefined) diagnostics.push(...resolved.diagnostics);
    if (resolved.registration === undefined) {
      if (previousMemo === undefined) diagnostics.push(noRenderer(field));
      memos.push(
        Object.freeze({
          epochId,
          ownerKey,
          field,
          registry: composition.registry,
          projectionGeneration: composition.context.projectionGeneration,
          locale,
          issues: snapshot.issues,
          resolution: resolved,
        }),
      );
      return undefined;
    }
    const reuseTexts =
      previousMemo?.texts !== undefined &&
      previousMemo.projectionGeneration ===
        composition.context.projectionGeneration &&
      previousMemo.locale === locale &&
      previousMemo.issues === snapshot.issues;
    const projected = reuseTexts
      ? Object.freeze({
          texts: previousMemo.texts,
          diagnostics: EMPTY_DIAGNOSTICS,
        })
      : projectFieldText(field, snapshot, composition.context);
    diagnostics.push(...projected.diagnostics);
    memos.push(
      Object.freeze({
        epochId,
        ownerKey,
        field,
        registry: composition.registry,
        projectionGeneration: composition.context.projectionGeneration,
        locale,
        issues: snapshot.issues,
        resolution: resolved,
        texts: projected.texts,
      }),
    );
    const previousOwner = previous.owners.find(
      (owner) =>
        owner.epochId === epochId &&
        owner.ownerKey === ownerKey &&
        owner.registrationId === resolved.registration?.id &&
        owner.component === resolved.registration?.component,
    );
    const gate: RendererGate = previousOwner?.gate ?? {
      active: true,
      interactive:
        projectionInteractive && snapshot.visible && snapshot.enabled,
      committed: false,
      wasCommitted: false,
      failed: false,
    };
    gate.active = !gate.failed;
    gate.interactive =
      !gate.failed &&
      projectionInteractive &&
      snapshot.visible &&
      snapshot.enabled;
    gates.push(gate);
    owners.push(
      Object.freeze({
        epochId,
        ownerKey,
        registrationId: resolved.registration.id,
        component: resolved.registration.component,
        gate,
      }),
    );
    const rendererProps = createRendererProps(
      composition,
      field,
      snapshot,
      projected.texts,
      gate,
      target,
    );
    const identity = boundaryIdentity(epochId, ownerKey, resolved.registration);
    const failure = () => {
      gate.active = false;
      if (!composition.context.isCurrent()) return;
      composition.context.reportDiagnostics(
        Object.freeze([
          adapterDiagnostic(
            'REACT_RENDERER_FAILED',
            'error',
            {
              ownerKey,
              registrationId: resolved.registration?.id ?? '',
              phase: 'render-or-lifecycle',
            },
            `React renderer "${resolved.registration?.id ?? ''}" failed for owner "${ownerKey}".`,
          ),
        ]),
      );
    };
    return createElement(RendererErrorBoundary, {
      key: identity,
      component: resolved.registration.component,
      rendererProps,
      visible: snapshot.visible,
      gate,
      reportFailure: Object.freeze(failure),
    });
  };

  const projectDirectNode = (
    node: FormNodeDefinition,
    snapshot: NodeRuntimeSnapshot | undefined,
    projectionInteractive = true,
  ): ReactElement | undefined => {
    if (snapshot === undefined) return undefined;
    if (
      node.kind === 'string' ||
      node.kind === 'number' ||
      node.kind === 'boolean' ||
      node.kind === 'string-enum-array'
    ) {
      if (snapshot.nodeKind !== 'field') return undefined;
      return projectField(
        node,
        snapshot,
        node.key,
        {
          kind: 'path',
          path: snapshot.path,
        },
        projectionInteractive,
      );
    }
    if (node.kind === 'array') {
      if (snapshot.nodeKind !== 'array') return undefined;
      return projectCollection(node, snapshot, projectionInteractive);
    }
    if (snapshot.nodeKind !== node.kind) return undefined;
    return projectObject(node, snapshot, projectionInteractive);
  };

  const projectObject = (
    node: ObjectNodeDefinition,
    snapshot: ObjectRuntimeSnapshot | DiscriminatedObjectRuntimeSnapshot,
    projectionInteractive: boolean,
  ): ReactElement => {
    const texts = projectCompoundText(node.key, node, [snapshot.issues], () =>
      projectObjectText(node, snapshot, composition.context),
    );
    const childMap = snapshotPathMap(snapshot.children);
    const content =
      node.kind === 'discriminated-object'
        ? node.children.flatMap((child) => {
            const element = projectDirectNode(
              child,
              childMap.get(pathKey(child.path)),
              projectionInteractive,
            );
            return element === undefined ? [] : [element];
          })
        : projectEntries(
            node.presentation,
            (child) =>
              projectDirectNode(
                child,
                childMap.get(pathKey(child.path)),
                projectionInteractive,
              ),
            node.key,
          );
    return createElement(ObjectHost, {
      key: node.key,
      formId: composition.context.formId ?? '',
      ownerKey: node.key,
      snapshot,
      texts,
      children: Object.freeze(content),
    });
  };

  const projectTemplateNode = (
    node: FormNodeTemplate,
    item: ItemRuntimeSnapshot,
    itemSnapshots: ReadonlyMap<string, NodeRuntimeSnapshot>,
    collection: ArrayNodeDefinition,
    projectionInteractive: boolean,
  ): ReactElement | undefined => {
    const snapshot = itemSnapshots.get(
      pathKey([...item.dataPath, ...node.relativePath]),
    );
    if (snapshot === undefined) return undefined;
    const ownerKey = JSON.stringify([
      'item-owner',
      collection.path,
      item.address.itemId,
      node.key,
    ]);
    if (node.kind !== 'object') {
      if (snapshot.nodeKind !== 'field') return undefined;
      const target: CollectionNodeAddress = Object.freeze({
        collectionPath: collection.path as readonly string[],
        itemId: item.address.itemId,
        relativePath: node.relativePath,
      });
      return projectField(
        node,
        snapshot,
        ownerKey,
        {
          kind: 'item',
          address: target,
        },
        projectionInteractive,
      );
    }
    if (snapshot.nodeKind !== 'object') return undefined;
    const objectSnapshot = snapshot;
    const texts = projectCompoundText(
      ownerKey,
      node,
      [objectSnapshot.issues],
      () => projectObjectText(node, objectSnapshot, composition.context),
    );
    const content = projectEntries(
      node.presentation,
      (child) =>
        projectTemplateNode(
          child,
          item,
          itemSnapshots,
          collection,
          projectionInteractive,
        ),
      ownerKey,
    );
    return createElement(ObjectHost, {
      key: ownerKey,
      formId: composition.context.formId ?? '',
      ownerKey,
      snapshot: objectSnapshot,
      texts,
      children: Object.freeze(content),
    });
  };

  const projectCollection = (
    collection: ArrayNodeDefinition,
    snapshot: ArrayRuntimeSnapshot,
    projectionInteractive: boolean,
  ): ReactElement => {
    const texts = projectCompoundText(
      collection.key,
      collection,
      [
        snapshot.identityState.kind,
        snapshot.identityState.kind === 'invalid'
          ? snapshot.identityState.reason
          : undefined,
        snapshot.identityState.kind === 'invalid'
          ? snapshot.identityState.index
          : undefined,
        snapshot.identityState.kind === 'invalid'
          ? snapshot.identityState.firstIndex
          : undefined,
        snapshot.issues,
      ],
      () => projectCollectionText(collection, snapshot, composition.context),
    );
    const projectedItems: ProjectedItem[] = snapshot.items.map(
      (item, index) => {
        const itemTexts = projectCompoundText(
          item.key,
          collection.item,
          [item.index, item.issues],
          () => projectItemText(collection, item, composition.context),
        );
        const itemSnapshots = snapshotPathMap(item.children);
        const content = projectEntries(
          collection.item.presentation,
          (child) =>
            projectTemplateNode(
              child,
              item,
              itemSnapshots,
              collection,
              projectionInteractive,
            ),
          item.key,
        );
        const previousItem = snapshot.items[index - 1];
        const nextItem = snapshot.items[index + 1];
        return Object.freeze({
          snapshot: item,
          texts: itemTexts,
          content: Object.freeze(content),
          remove: Object.freeze(() => {
            if (projectionInteractive)
              composition.form.actions.requestRemoveItem(item.address);
          }),
          moveEarlier: Object.freeze(() => {
            if (projectionInteractive && previousItem !== undefined)
              composition.form.actions.requestMoveItem(item.address, {
                kind: 'before',
                itemId: previousItem.address.itemId,
              });
          }),
          moveLater: Object.freeze(() => {
            if (projectionInteractive && nextItem !== undefined)
              composition.form.actions.requestMoveItem(item.address, {
                kind: 'after',
                itemId: nextItem.address.itemId,
              });
          }),
          canMoveEarlier: previousItem !== undefined,
          canMoveLater: nextItem !== undefined,
        });
      },
    );
    const focusBeforeUpdate = captureCollectionFocus(collection.key);
    return createElement(CollectionHost, {
      key: collection.key,
      formId: composition.context.formId ?? '',
      ownerKey: collection.key,
      snapshot,
      texts,
      items: Object.freeze(projectedItems),
      ...(focusBeforeUpdate === undefined ? {} : { focusBeforeUpdate }),
    });
  };

  const projectEntries = <TNode extends FormNodeDefinition | FormNodeTemplate>(
    entries: readonly PresentationEntryDefinition<TNode>[],
    nodeProjector: (node: TNode) => ReactElement | undefined,
    parentKey: string,
  ): ReactElement[] => {
    const projectedEntries: ReactElement[] = [];
    for (const entry of entries) {
      if (entry.kind === 'form-node') {
        const child = nodeProjector(entry.node);
        if (child !== undefined) projectedEntries.push(child);
        continue;
      }
      const ownerKey = JSON.stringify([parentKey, entry.key]);
      const label = projectCompoundText(ownerKey, entry, [], () =>
        projectPresentationLabel(entry, composition.context),
      );
      if (entry.kind === 'section') {
        projectedEntries.push(
          createElement(SectionHost, {
            key: entry.key,
            formId: composition.context.formId ?? '',
            ownerKey,
            label,
            children: Object.freeze(
              projectEntries(entry.children, nodeProjector, ownerKey),
            ),
          }),
        );
        continue;
      }
      if (entry.kind === 'grid') {
        const gridItems: GridItem[] = entry.items.flatMap((item) => {
          const child = projectEntries(
            [item.child],
            nodeProjector,
            ownerKey,
          )[0];
          return child === undefined
            ? []
            : [Object.freeze({ key: item.key, span: item.span, child })];
        });
        projectedEntries.push(
          createElement(GridHost, {
            key: entry.key,
            formId: composition.context.formId ?? '',
            ownerKey,
            label,
            items: Object.freeze(gridItems),
          }),
        );
        continue;
      }
      const panels: PresentationPanel[] = entry.panels.map((panel) => {
        const panelOwnerKey = JSON.stringify([ownerKey, panel.key]);
        const panelLabel = projectCompoundText(panelOwnerKey, panel, [], () =>
          projectPresentationLabel(panel, composition.context),
        );
        return Object.freeze({
          key: panelOwnerKey,
          label: panelLabel,
          children: Object.freeze(
            projectEntries(panel.children, nodeProjector, panel.key),
          ),
        });
      });
      projectedEntries.push(
        entry.kind === 'tabs'
          ? createElement(TabsHost, {
              key: entry.key,
              formId: composition.context.formId ?? '',
              ownerKey,
              label,
              panels: Object.freeze(panels),
            })
          : createElement(AccordionHost, {
              key: entry.key,
              formId: composition.context.formId ?? '',
              ownerKey,
              label,
              panels: Object.freeze(panels),
            }),
      );
    }
    return projectedEntries;
  };

  const projectWizard = (
    wizard: WizardDefinition,
    wizardSnapshot: NonNullable<typeof state.snapshot.wizard>,
  ): ReactElement => {
    const common = {
      formId: composition.context.formId ?? '',
      locale,
      wizard,
    } as const;
    const resolve = (
      source: string,
      member: 'label' | 'previous' | 'next' | 'complete',
    ): string =>
      projectCompoundText(
        JSON.stringify([wizard.key, member]),
        wizard,
        [],
        () =>
          projectWizardText(
            source,
            Object.freeze({ ...common, member }),
            composition.context,
          ),
      );
    const label = resolve(wizard.label, 'label');
    const stepSnapshots = new Map(
      wizardSnapshot.steps.map((step) => [step.id, step]),
    );
    const stepTexts = wizard.steps.flatMap((step) => {
      const stepSnapshot = stepSnapshots.get(step.id);
      if (stepSnapshot === undefined) return [];
      const stepCommon = { ...common, step } as const;
      const resolveStep = (
        source: string,
        member:
          | 'label'
          | 'unvisited'
          | 'visited'
          | 'error'
          | 'completed'
          | 'provisional-validation'
          | 'pending-validation'
          | 'failed-validation',
        identity: readonly unknown[] = [],
      ): string =>
        projectCompoundText(
          JSON.stringify([wizard.key, step.key, member]),
          wizard,
          identity,
          () =>
            projectWizardText(
              source,
              Object.freeze({ ...stepCommon, member }),
              composition.context,
            ),
        );
      const position = projectCompoundText(
        JSON.stringify([wizard.key, step.key, 'position']),
        wizard,
        [stepSnapshot.position, wizard.steps.length],
        () =>
          projectWizardText(
            `Step ${stepSnapshot.position} of ${wizard.steps.length}`,
            Object.freeze({
              ...stepCommon,
              member: 'position' as const,
              position: stepSnapshot.position,
              count: wizard.steps.length,
            }),
            composition.context,
          ),
      );
      const stepLabel = resolveStep(step.label, 'label');
      const progressSources = {
        unvisited: 'Not visited',
        visited: 'Visited',
        error: 'Contains errors',
        completed: 'Completed',
      } as const;
      const progress = resolveStep(
        progressSources[stepSnapshot.progress],
        stepSnapshot.progress,
        [stepSnapshot.progress],
      );
      const validation = wizardValidationText(stepSnapshot, resolveStep);
      return [
        Object.freeze({
          definition: step,
          snapshot: stepSnapshot,
          label: stepLabel,
          position,
          progress,
          ...(validation === undefined ? {} : { validation }),
        }),
      ];
    });
    const steps: ProjectedWizardStep[] = stepTexts.map((step) => {
      const gateStart = gates.length;
      const children = projectEntries(
        step.definition.children,
        (node) =>
          projectDirectNode(
            node,
            directSnapshots.get(pathKey(node.path)),
            step.snapshot.current,
          ),
        step.definition.key,
      );
      for (const gate of gates.slice(gateStart))
        gate.interactive = gate.interactive && step.snapshot.current;
      return Object.freeze({
        ...step,
        children: Object.freeze(children),
      });
    });
    const texts: WizardTexts = Object.freeze({
      label,
      previous: resolve('Previous', 'previous'),
      next: resolve('Next', 'next'),
      complete: resolve('Complete', 'complete'),
    });
    return createElement(WizardHost, {
      key: wizard.key,
      formId: composition.context.formId ?? '',
      definition: wizard,
      snapshot: wizardSnapshot,
      texts,
      steps: Object.freeze(steps),
      globalIssues: state.snapshot.globalIssues,
      requestPrevious: Object.freeze(() => {
        composition.form.actions.requestWizardPrevious();
      }),
      requestNext: Object.freeze(() => {
        composition.form.actions.requestWizardNext();
      }),
      requestComplete: Object.freeze(() => {
        composition.form.actions.requestWizardComplete();
      }),
    });
  };

  const root = definition.presentation[0];
  if (
    definition.presentation.length === 1 &&
    root?.kind === 'wizard' &&
    state.snapshot.wizard !== undefined
  )
    elements.push(projectWizard(root, state.snapshot.wizard));
  else {
    const rootEntries = definition.presentation.filter(
      (entry): entry is PresentationEntryDefinition<FormNodeDefinition> =>
        entry.kind !== 'wizard',
    );
    elements.push(
      ...projectEntries(
        rootEntries,
        (node) =>
          projectDirectNode(node, directSnapshots.get(pathKey(node.path))),
        'root',
      ),
    );
  }
  return Object.freeze({
    handle: composition.form,
    epochId,
    registry: composition.registry,
    generation: composition.context.projectionGeneration,
    elements: Object.freeze(elements),
    gates: Object.freeze(gates),
    owners: Object.freeze(owners),
    memos: Object.freeze(memos),
    compoundMemos: Object.freeze(compoundMemos),
    diagnostics: freezeDiagnostics(diagnostics),
  });
}

function wizardValidationText(
  snapshot: WizardStepSnapshot,
  resolve: (
    source: string,
    member:
      | 'label'
      | 'unvisited'
      | 'visited'
      | 'error'
      | 'completed'
      | 'provisional-validation'
      | 'pending-validation'
      | 'failed-validation',
    identity?: readonly unknown[],
  ) => string,
): string | undefined {
  if (snapshot.validation.state === 'provisional')
    return resolve(
      'Additional validation not yet available',
      'provisional-validation',
      ['provisional'],
    );
  if (snapshot.validation.state === 'pending')
    return resolve('Additional validation in progress', 'pending-validation', [
      'pending',
    ]);
  if (snapshot.validation.state === 'failed')
    return resolve('Additional validation failed', 'failed-validation', [
      'failed',
    ]);
  return undefined;
}

type FieldOwnerTarget =
  | { readonly kind: 'path'; readonly path: DataPath }
  | { readonly kind: 'item'; readonly address: CollectionNodeAddress };

function snapshotPathMap(
  snapshots: readonly NodeRuntimeSnapshot[],
): ReadonlyMap<string, NodeRuntimeSnapshot> {
  const result = new Map<string, NodeRuntimeSnapshot>();
  const visit = (snapshot: NodeRuntimeSnapshot): void => {
    result.set(pathKey(snapshot.path), snapshot);
    if (
      snapshot.nodeKind === 'object' ||
      snapshot.nodeKind === 'discriminated-object'
    )
      for (const child of snapshot.children) visit(child);
  };
  for (const snapshot of snapshots) visit(snapshot);
  return result;
}

function pathKey(path: readonly (string | number)[]): string {
  return JSON.stringify(path);
}

function identityEquals(
  left: readonly unknown[],
  right: readonly unknown[],
): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => Object.is(value, right[index]))
  );
}

function captureCollectionFocus(
  collectionKey: string,
): { readonly itemKey: string; readonly id: string } | undefined {
  if (typeof document === 'undefined') return undefined;
  const active = document.activeElement;
  if (!(active instanceof HTMLElement)) return undefined;
  const collection = active.closest<HTMLElement>(
    '[data-schema-collection-key]',
  );
  if (collection?.dataset['schemaCollectionKey'] !== collectionKey)
    return undefined;
  const item = active.closest<HTMLElement>('[data-schema-item-key]');
  const itemKey = item?.dataset['schemaItemKey'];
  return itemKey === undefined
    ? undefined
    : Object.freeze({ itemKey, id: active.id });
}

function createRendererProps<TData extends object>(
  composition: ValidComposition<TData>,
  field: FieldDefinition | FieldTemplate,
  snapshot: FieldRuntimeSnapshot,
  texts: ReactFieldRendererProps['texts'],
  gate: RendererGate,
  target: FieldOwnerTarget,
): ReactFieldRendererProps {
  const invoke = (
    method: string,
    action: () => RuntimeActionResult,
  ): RuntimeActionResult =>
    gate.active &&
    gate.interactive &&
    gate.committed &&
    composition.context.isCurrent()
      ? action()
      : inactiveRendererResult(method, composition.context, gate.wasCommitted);
  const callbacks = {
    setValue: Object.freeze((value: unknown) =>
      invoke('requestSetValue', () =>
        target.kind === 'path'
          ? composition.form.actions.requestSetValue(target.path, value)
          : composition.form.actions.requestSetItemValue(target.address, value),
      ),
    ),
    removeValue: Object.freeze(() =>
      invoke('requestRemoveValue', () =>
        target.kind === 'path'
          ? composition.form.actions.requestRemoveValue(target.path)
          : composition.form.actions.requestRemoveItemValue(target.address),
      ),
    ),
    fieldFocus: Object.freeze(() =>
      invoke('focus', () =>
        composition.form.actions.focus(
          target.kind === 'path' ? target.path : target.address,
        ),
      ),
    ),
    fieldBlur: Object.freeze(() =>
      invoke('blur', () =>
        composition.form.actions.blur(
          target.kind === 'path' ? target.path : target.address,
        ),
      ),
    ),
    rendererDiagnostics: Object.freeze((input: readonly Diagnostic[]) => {
      const batch = normalizeRendererDiagnostics(input);
      if (batch.length === 0) return;
      queueMicrotask(() => {
        if (gate.active && gate.committed && composition.context.isCurrent())
          composition.context.reportDiagnostics(batch);
      });
    }),
  };
  return Object.freeze({
    field,
    snapshot,
    formId: composition.context.formId ?? '',
    locale: composition.context.locale ?? '',
    texts,
    ...callbacks,
  });
}

interface RendererErrorBoundaryProps {
  readonly component: ReactRendererComponent;
  readonly rendererProps: ReactFieldRendererProps;
  readonly visible: boolean;
  readonly gate: RendererGate;
  readonly reportFailure: () => void;
}

interface RendererErrorBoundaryState {
  readonly failed: boolean;
  readonly component: ReactRendererComponent;
}

class RendererErrorBoundary extends Component<
  RendererErrorBoundaryProps,
  RendererErrorBoundaryState
> {
  override state: RendererErrorBoundaryState = Object.freeze({
    failed: false,
    component: this.props.component,
  });

  static getDerivedStateFromProps(
    props: RendererErrorBoundaryProps,
    state: RendererErrorBoundaryState,
  ): RendererErrorBoundaryState | null {
    return props.component === state.component
      ? null
      : Object.freeze({ failed: false, component: props.component });
  }

  static getDerivedStateFromError(): Partial<RendererErrorBoundaryState> {
    return Object.freeze({ failed: true });
  }

  override componentDidMount(): void {
    this.props.gate.committed = true;
    this.props.gate.wasCommitted = true;
  }

  override componentDidUpdate(): void {
    this.props.gate.committed = true;
    this.props.gate.wasCommitted = true;
  }

  override componentDidCatch(): void {
    this.props.gate.active = false;
    this.props.gate.committed = false;
    this.props.gate.failed = true;
    this.props.reportFailure();
  }

  override render(): ReactElement | null {
    if (this.state.failed) return null;
    return createElement(
      LeafVisibilityHost,
      {
        visible: this.props.visible,
        interactive: this.props.gate.interactive,
        registerHost: (host) => {
          this.props.gate.blurActive = () => {
            const active = document.activeElement;
            if (active instanceof HTMLElement && host?.contains(active))
              active.blur();
          };
        },
      },
      createElement(this.props.component, this.props.rendererProps),
    );
  }
}

function inspectComposition<TData extends object>(
  props: unknown,
): Composition<TData> {
  const formEntry = ownData(props, 'form');
  const registryEntry = ownData(props, 'rendererRegistry');
  const form = formEntry.valid ? formEntry.value : undefined;
  const registry = registryEntry.valid ? registryEntry.value : undefined;
  const formResult = inspectHandle<TData>(form);
  if (!formResult.valid) {
    const report = crossCopyReceiver(form);
    return invalidComposition(
      form,
      'INVALID_REACT_FORM_HANDLE',
      'form',
      formEntry.valid ? formResult.reason : 'malformed',
      report,
    );
  }
  const registryResult = inspectRegistry(registry);
  if (!registryResult.valid)
    return invalidComposition(
      registry,
      'INVALID_REACT_RENDERER_REGISTRY',
      'rendererRegistry',
      registryEntry.valid ? registryResult.reason : 'malformed',
      formResult.context.reportDiagnostics,
    );
  return Object.freeze({
    valid: true,
    form: formResult.form,
    registry: registryResult.registry,
    context: formResult.context,
  });
}

function inspectHandle<TData extends object>(
  candidate: unknown,
):
  | {
      readonly valid: true;
      readonly form: ReactFormHandle<TData>;
      readonly context: InternalReactHandleContext;
    }
  | { readonly valid: false; readonly reason: string } {
  if (!isObject(candidate)) return { valid: false, reason: 'malformed' };
  const brand = safeDescriptor(candidate, internalReactFormHandleBrand);
  if (brand === undefined)
    return {
      valid: false,
      reason: hasForeignBrand(
        candidate,
        internalReactFormHandleBrand.description,
      )
        ? 'different-package-copy'
        : 'invalid-brand',
    };
  const context = internalReactHandleContexts.get(candidate);
  if (!('value' in brand) || brand.value !== true || context === undefined)
    return { valid: false, reason: 'invalid-brand' };
  const state = safeDescriptor(candidate, 'state');
  const actions = safeDescriptor(candidate, 'actions');
  if (
    state === undefined ||
    !('value' in state) ||
    actions === undefined ||
    !('value' in actions)
  )
    return { valid: false, reason: 'malformed' };
  return {
    valid: true,
    form: candidate as ReactFormHandle<TData>,
    context,
  };
}

function inspectRegistry(
  candidate: unknown,
):
  | { readonly valid: true; readonly registry: ReactRendererRegistry }
  | { readonly valid: false; readonly reason: string } {
  if (!isObject(candidate)) return { valid: false, reason: 'malformed' };
  const brand = safeDescriptor(candidate, internalReactRendererRegistryBrand);
  if (brand === undefined)
    return {
      valid: false,
      reason: hasForeignBrand(
        candidate,
        internalReactRendererRegistryBrand.description,
      )
        ? 'different-package-copy'
        : 'invalid-brand',
    };
  if (
    !('value' in brand) ||
    brand.value !== true ||
    !internalReactRendererRegistries.has(candidate)
  )
    return { valid: false, reason: 'invalid-brand' };
  return { valid: true, registry: candidate as ReactRendererRegistry };
}

function invalidComposition(
  candidate: unknown,
  code: 'INVALID_REACT_FORM_HANDLE' | 'INVALID_REACT_RENDERER_REGISTRY',
  member: 'form' | 'rendererRegistry',
  reason: string,
  report?: (diagnostics: readonly Diagnostic[]) => void,
): InvalidComposition {
  return Object.freeze({
    valid: false,
    candidate,
    diagnostic: adapterDiagnostic(
      code,
      'error',
      { member, reason },
      `React form composition member "${member}" is invalid.`,
    ),
    ...(report === undefined ? {} : { report }),
  });
}

function crossCopyReceiver(
  candidate: unknown,
): ((diagnostics: readonly Diagnostic[]) => void) | undefined {
  if (!isObject(candidate)) return undefined;
  const descriptor = safeDescriptor(
    candidate,
    internalReactDiagnosticsReceiver,
  );
  return descriptor !== undefined &&
    'value' in descriptor &&
    typeof descriptor.value === 'function'
    ? (descriptor.value as (diagnostics: readonly Diagnostic[]) => void)
    : undefined;
}

function ownData(
  candidate: unknown,
  member: string,
):
  | { readonly valid: true; readonly value: unknown }
  | { readonly valid: false } {
  if (!isObject(candidate)) return { valid: false };
  const descriptor = safeDescriptor(candidate, member);
  return descriptor !== undefined && 'value' in descriptor
    ? { valid: true, value: descriptor.value }
    : { valid: false };
}

function noRenderer(field: FieldDefinition | FieldTemplate): Diagnostic {
  const template = !('path' in field);
  const path = template ? field.relativePath : field.path;
  return adapterDiagnostic(
    'NO_RENDERER_MATCH',
    'error',
    {
      field: field.name,
      ...(template
        ? { relativePath: Object.freeze([...path]) }
        : { path: Object.freeze([...path]) }),
    },
    `No React renderer matches field "${field.name}".`,
    path,
  );
}

function inactiveRendererResult(
  method: string,
  context: InternalReactHandleContext,
  report: boolean,
): RuntimeActionResult {
  const diagnostic = adapterDiagnostic(
    'STALE_REACT_FORM_ACTION',
    'error',
    { method, reason: 'replaced-epoch' },
    `React form action "${method}" belongs to a stale runtime epoch.`,
  );
  const diagnostics = Object.freeze([diagnostic]);
  if (report) context.reportDiagnostics(diagnostics);
  return Object.freeze({
    success: false,
    effects: Object.freeze({
      snapshotChanged: false,
      operationEmitted: false,
    }),
    diagnostics,
  });
}

function normalizeRendererDiagnostics(input: unknown): readonly Diagnostic[] {
  if (!safeIsArray(input)) return invalidRendererDiagnostics('not-array');
  const length = safeDescriptor(input, 'length');
  if (
    length === undefined ||
    !('value' in length) ||
    !Number.isSafeInteger(length.value)
  )
    return invalidRendererDiagnostics('not-array');
  const diagnostics: Diagnostic[] = [];
  for (let index = 0; index < length.value; index += 1) {
    const descriptor = safeDescriptor(input, String(index));
    if (descriptor === undefined)
      return invalidRendererDiagnostics('sparse-entry', index);
    if (!('value' in descriptor))
      return invalidRendererDiagnostics('accessor-entry', index);
    const diagnostic = detachDiagnostic(descriptor.value);
    if (diagnostic === undefined)
      return invalidRendererDiagnostics(
        'invalid-diagnostic',
        index,
        actualType(descriptor.value),
      );
    diagnostics.push(diagnostic);
  }
  return freezeDiagnostics(diagnostics);
}

function detachDiagnostic(candidate: unknown): Diagnostic | undefined {
  if (!isObject(candidate)) return undefined;
  const code = dataValue(candidate, 'code');
  const severity = dataValue(candidate, 'severity');
  const source = dataValue(candidate, 'source');
  const parameters = dataValue(candidate, 'parameters');
  if (
    typeof code !== 'string' ||
    code.length === 0 ||
    (severity !== 'warning' && severity !== 'error') ||
    (source !== 'schema' && source !== 'ui-schema' && source !== 'runtime') ||
    !isObject(parameters)
  )
    return undefined;
  const detachedParameters = detachParameters(parameters);
  if (detachedParameters === undefined) return undefined;
  const fallback = dataValue(candidate, 'fallbackMessage');
  const rawDataPath = dataValue(candidate, 'dataPath');
  const rawDocumentPath = dataValue(candidate, 'documentPath');
  const path = detachPath(rawDataPath);
  const documentPath = detachPath(rawDocumentPath);
  if (fallback !== undefined && typeof fallback !== 'string') return undefined;
  if (rawDataPath !== undefined && path === undefined) return undefined;
  if (rawDocumentPath !== undefined && documentPath === undefined)
    return undefined;
  return Object.freeze({
    code,
    severity,
    source,
    parameters: detachedParameters,
    ...(fallback === undefined ? {} : { fallbackMessage: fallback }),
    ...(path === undefined ? {} : { dataPath: path }),
    ...(documentPath === undefined ? {} : { documentPath }),
  });
}

function detachParameters(
  candidate: object,
): Readonly<Record<string, unknown>> | undefined {
  let keys: readonly string[];
  try {
    keys = Object.keys(candidate);
  } catch {
    return undefined;
  }
  const detached = detachRecord(candidate, new Set([candidate]), keys);
  return detached;
}

function detachPath(value: unknown): readonly (string | number)[] | undefined {
  if (value === undefined) return undefined;
  if (!safeIsArray(value)) return undefined;
  const length = safeDescriptor(value, 'length');
  if (
    length === undefined ||
    !('value' in length) ||
    !Number.isSafeInteger(length.value)
  )
    return undefined;
  const result: (string | number)[] = [];
  for (let index = 0; index < length.value; index += 1) {
    const descriptor = safeDescriptor(value, String(index));
    if (
      descriptor === undefined ||
      !('value' in descriptor) ||
      (typeof descriptor.value !== 'string' &&
        typeof descriptor.value !== 'number')
    )
      return undefined;
    result.push(descriptor.value);
  }
  return Object.freeze(result);
}

function invalidRendererDiagnostics(
  reason: string,
  index?: number,
  type?: string,
): readonly [Diagnostic] {
  return Object.freeze([
    adapterDiagnostic(
      'INVALID_RENDERER_DIAGNOSTICS',
      'warning',
      {
        reason,
        ...(index === undefined ? {} : { index }),
        ...(type === undefined ? {} : { actualType: type }),
      },
      'React renderer diagnostics are invalid.',
    ),
  ]);
}

function boundaryIdentity(
  epochId: number,
  ownerKey: string,
  registration: InternalRendererRegistration,
): string {
  return JSON.stringify([epochId, ownerKey, registration.id]);
}

function detachRecord(
  candidate: object,
  seen: Set<object>,
  providedKeys?: readonly string[],
): Readonly<Record<string, unknown>> | undefined {
  let keys = providedKeys;
  if (keys === undefined)
    try {
      keys = Object.keys(candidate);
    } catch {
      return undefined;
    }
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    const descriptor = safeDescriptor(candidate, key);
    if (descriptor === undefined || !('value' in descriptor)) return undefined;
    const detached = detachValue(descriptor.value, seen);
    if (!detached.valid) return undefined;
    result[key] = detached.value;
  }
  return Object.freeze(result);
}

function detachValue(
  value: unknown,
  seen: Set<object>,
):
  | { readonly valid: true; readonly value: unknown }
  | { readonly valid: false } {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'undefined'
  )
    return { valid: true, value };
  if (!isObject(value) || seen.has(value)) return { valid: false };
  seen.add(value);
  if (safeIsArray(value)) {
    const length = safeDescriptor(value, 'length');
    if (
      length === undefined ||
      !('value' in length) ||
      !Number.isSafeInteger(length.value)
    )
      return { valid: false };
    const array: unknown[] = [];
    for (let index = 0; index < length.value; index += 1) {
      const descriptor = safeDescriptor(value, String(index));
      if (descriptor === undefined || !('value' in descriptor))
        return { valid: false };
      const detached = detachValue(descriptor.value, seen);
      if (!detached.valid) return detached;
      array.push(detached.value);
    }
    seen.delete(value);
    return { valid: true, value: Object.freeze(array) };
  }
  const record = detachRecord(value, seen);
  seen.delete(value);
  return record === undefined
    ? { valid: false }
    : { valid: true, value: record };
}

function replaceCache(
  store: BridgeStore<ProjectionCache>,
  next: ProjectionCache,
): void {
  const previous = store.getSnapshot();
  if (
    previous.handle === next.handle &&
    previous.registry === next.registry &&
    previous.generation === next.generation &&
    previous.elements === next.elements
  )
    return;
  const retained = new Set(next.gates);
  deactivate(previous.gates.filter((gate) => !retained.has(gate)));
  store.publish(next);
}

function emptyCache(): ProjectionCache {
  return Object.freeze({
    elements: EMPTY_ELEMENTS,
    gates: EMPTY_GATES,
    owners: EMPTY_OWNERS,
    memos: EMPTY_MEMOS,
    compoundMemos: EMPTY_COMPOUND_MEMOS,
  });
}

function deactivate(gates: readonly RendererGate[]): void {
  for (const gate of gates) {
    gate.blurActive?.();
    gate.active = false;
    gate.committed = false;
  }
}

function reactivate(gates: readonly RendererGate[]): void {
  for (const gate of gates)
    if (!gate.failed) {
      gate.active = true;
      gate.committed = true;
      gate.wasCommitted = true;
    }
}

function dataValue(candidate: object, member: string): unknown {
  const descriptor = safeDescriptor(candidate, member);
  return descriptor !== undefined && 'value' in descriptor
    ? descriptor.value
    : undefined;
}

function safeDescriptor(
  candidate: object,
  member: PropertyKey,
): PropertyDescriptor | undefined {
  try {
    return Object.getOwnPropertyDescriptor(candidate, member);
  } catch {
    return undefined;
  }
}

function hasForeignBrand(
  candidate: object,
  description: string | undefined,
): boolean {
  if (description === undefined) return false;
  try {
    return Object.getOwnPropertySymbols(candidate).some(
      (symbol) => symbol.description === description,
    );
  } catch {
    return false;
  }
}

function isObject(value: unknown): value is object {
  return (
    (typeof value === 'object' && value !== null) || typeof value === 'function'
  );
}

function safeIsArray(value: unknown): value is readonly unknown[] {
  try {
    return Array.isArray(value);
  } catch {
    return false;
  }
}
