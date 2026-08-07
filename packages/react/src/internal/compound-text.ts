// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import type {
  AdvancedPresentationLabelDefinition,
  ArrayNodeDefinition,
  ArrayRuntimeSnapshot,
  Diagnostic,
  DiscriminatedObjectRuntimeSnapshot,
  ItemRuntimeSnapshot,
  ObjectNodeDefinition,
  ObjectNodeTemplate,
  ObjectRuntimeSnapshot,
  PresentationSectionDefinition,
  FormNodeDefinition,
  FormNodeTemplate,
  TextResolutionContext,
  ValidationIssue,
  WizardTextResolutionContext,
} from '@rabassoft/schema-engine';
import type { InternalReactHandleContext } from './controller.js';
import { adapterDiagnostic, freezeDiagnostics } from './diagnostics.js';

export interface CompoundNodeTexts {
  readonly label: string;
  readonly description?: string;
  readonly hint?: string;
  readonly tooltip?: string;
  readonly issueMessages: readonly string[];
}

export interface CollectionTexts extends CompoundNodeTexts {
  readonly identityError?: string;
}

export interface ItemTexts {
  readonly label: string;
  readonly remove: string;
  readonly moveEarlier: string;
  readonly moveLater: string;
  readonly issueMessages: readonly string[];
}

export interface TextProjection<TTexts> {
  readonly texts: TTexts;
  readonly diagnostics: readonly Diagnostic[];
}

export function projectObjectText(
  node: ObjectNodeDefinition | ObjectNodeTemplate,
  snapshot: ObjectRuntimeSnapshot | DiscriminatedObjectRuntimeSnapshot,
  context: InternalReactHandleContext,
): TextProjection<CompoundNodeTexts> {
  if (!('path' in node))
    return Object.freeze({
      texts: Object.freeze({
        label: node.label,
        ...(node.description === undefined
          ? {}
          : { description: node.description }),
        ...(node.hint === undefined ? {} : { hint: node.hint }),
        ...(node.tooltip === undefined ? {} : { tooltip: node.tooltip }),
        issueMessages: Object.freeze(
          snapshot.issues.map((issue) => issue.fallbackMessage ?? issue.code),
        ),
      }),
      diagnostics: Object.freeze([]),
    });
  const diagnostics: Diagnostic[] = [];
  const common = {
    formId: context.formId ?? '',
    locale: context.locale ?? '',
    node,
  } as const;
  const resolve = (
    source: string,
    member: 'label' | 'description' | 'hint' | 'tooltip',
    rejectBlank = false,
  ) =>
    resolveText(
      context,
      source,
      Object.freeze({ ...common, member }),
      diagnostics,
      node.name,
      snapshot.path,
      rejectBlank,
    );
  return Object.freeze({
    texts: Object.freeze({
      label: resolve(node.label, 'label', true),
      ...(node.description === undefined
        ? {}
        : { description: resolve(node.description, 'description') }),
      ...(node.hint === undefined ? {} : { hint: resolve(node.hint, 'hint') }),
      ...(node.tooltip === undefined
        ? {}
        : { tooltip: resolve(node.tooltip, 'tooltip') }),
      issueMessages: Object.freeze(
        snapshot.issues.map((issue) =>
          resolveIssue(
            context,
            common,
            issue,
            diagnostics,
            node.name,
            snapshot.path,
          ),
        ),
      ),
    }),
    diagnostics: freezeDiagnostics(diagnostics),
  });
}

export function projectCollectionText(
  collection: ArrayNodeDefinition,
  snapshot: ArrayRuntimeSnapshot,
  context: InternalReactHandleContext,
): TextProjection<CollectionTexts> {
  const diagnostics: Diagnostic[] = [];
  const common = {
    formId: context.formId ?? '',
    locale: context.locale ?? '',
    node: collection,
  } as const;
  const resolve = (
    source: string,
    member: 'label' | 'description' | 'hint' | 'tooltip',
    rejectBlank = false,
  ) =>
    resolveText(
      context,
      source,
      Object.freeze({ ...common, member }),
      diagnostics,
      collection.name,
      collection.path,
      rejectBlank,
    );
  const label = resolve(collection.label, 'label', true);
  const description =
    collection.description === undefined
      ? undefined
      : resolve(collection.description, 'description');
  const hint =
    collection.hint === undefined
      ? undefined
      : resolve(collection.hint, 'hint');
  const tooltip =
    collection.tooltip === undefined
      ? undefined
      : resolve(collection.tooltip, 'tooltip');
  let identityError: string | undefined;
  if (snapshot.identityState.kind === 'invalid') {
    const collectionContext = Object.freeze({
      formId: context.formId ?? '',
      locale: context.locale ?? '',
      collection,
      member: 'identity-error' as const,
    });
    identityError = resolveCollectionText(
      context,
      'Collection items have invalid identity.',
      collectionContext,
      diagnostics,
      collection,
      undefined,
      true,
    );
  }
  const issueMessages = snapshot.issues.map((issue) =>
    resolveIssue(
      context,
      common,
      issue,
      diagnostics,
      collection.name,
      collection.path,
    ),
  );
  return Object.freeze({
    texts: Object.freeze({
      label,
      ...(description === undefined ? {} : { description }),
      ...(hint === undefined ? {} : { hint }),
      ...(tooltip === undefined ? {} : { tooltip }),
      ...(identityError === undefined ? {} : { identityError }),
      issueMessages: Object.freeze(issueMessages),
    }),
    diagnostics: freezeDiagnostics(diagnostics),
  });
}

export function projectItemText(
  collection: ArrayNodeDefinition,
  item: ItemRuntimeSnapshot,
  context: InternalReactHandleContext,
): TextProjection<ItemTexts> {
  const diagnostics: Diagnostic[] = [];
  const common = {
    formId: context.formId ?? '',
    locale: context.locale ?? '',
    collection,
    item,
  } as const;
  const position = item.index + 1;
  const resolve = (
    source: string,
    member:
      'item-label' | 'remove-item' | 'move-item-earlier' | 'move-item-later',
  ) =>
    resolveCollectionText(
      context,
      source,
      Object.freeze({ ...common, member }),
      diagnostics,
      collection,
      item,
      true,
    );
  const label = resolve(`Item ${position}`, 'item-label');
  const remove = resolve(`Remove item ${position}`, 'remove-item');
  const moveEarlier = resolve(
    `Move item ${position} earlier`,
    'move-item-earlier',
  );
  const moveLater = resolve(`Move item ${position} later`, 'move-item-later');
  const issueMessages = item.issues.map((issue) =>
    resolveCollectionText(
      context,
      issue.fallbackMessage ?? issue.code,
      Object.freeze({ ...common, member: 'issue' as const, issue }),
      diagnostics,
      collection,
      item,
      false,
      issue.code,
    ),
  );
  return Object.freeze({
    texts: Object.freeze({
      label,
      remove,
      moveEarlier,
      moveLater,
      issueMessages: Object.freeze(issueMessages),
    }),
    diagnostics: freezeDiagnostics(diagnostics),
  });
}

export function projectPresentationLabel(
  presentation:
    | PresentationSectionDefinition<FormNodeDefinition | FormNodeTemplate>
    | AdvancedPresentationLabelDefinition,
  context: InternalReactHandleContext,
): TextProjection<string> {
  const diagnostics: Diagnostic[] = [];
  const isSection = presentation.kind === 'section';
  const resolutionContext = isSection
    ? Object.freeze({
        formId: context.formId ?? '',
        locale: context.locale ?? '',
        section: presentation,
        member: 'label' as const,
      })
    : Object.freeze({
        formId: context.formId ?? '',
        locale: context.locale ?? '',
        presentation,
        member: 'label' as const,
      });
  const text = resolvePresentationText(
    context,
    presentation.label,
    resolutionContext,
    diagnostics,
    presentation,
  );
  return Object.freeze({
    texts: text,
    diagnostics: freezeDiagnostics(diagnostics),
  });
}

export function projectWizardText(
  source: string,
  resolutionContext: WizardTextResolutionContext,
  context: InternalReactHandleContext,
): TextProjection<string> {
  const diagnostics: Diagnostic[] = [];
  const failure = resolveFailure(context, source, resolutionContext, true);
  if (failure.result !== undefined)
    return Object.freeze({
      texts: failure.result,
      diagnostics: Object.freeze([]),
    });
  diagnostics.push(
    adapterDiagnostic(
      'TEXT_RESOLUTION_FAILED',
      'warning',
      {
        wizardKey: resolutionContext.wizard.key,
        ...(resolutionContext.step === undefined
          ? {}
          : { stepKey: resolutionContext.step.key }),
        member: resolutionContext.member,
        reason: failure.reason,
      },
      'Wizard text resolution failed.',
    ),
  );
  return Object.freeze({
    texts: source,
    diagnostics: freezeDiagnostics(diagnostics),
  });
}

function resolveIssue(
  context: InternalReactHandleContext,
  common: Readonly<Record<string, unknown>>,
  issue: ValidationIssue,
  diagnostics: Diagnostic[],
  name: string,
  path: readonly (string | number)[],
): string {
  return resolveText(
    context,
    issue.fallbackMessage ?? issue.code,
    Object.freeze({
      ...common,
      member: 'issue',
      issue,
    }) as TextResolutionContext,
    diagnostics,
    name,
    path,
    false,
    issue.code,
  );
}

function resolveText(
  adapter: InternalReactHandleContext,
  source: string,
  resolutionContext: TextResolutionContext,
  diagnostics: Diagnostic[],
  nodeName: string,
  path: readonly (string | number)[],
  rejectBlank: boolean,
  issueCode?: string,
): string {
  const reason = resolveFailure(
    adapter,
    source,
    resolutionContext,
    rejectBlank,
  );
  if (reason.result !== undefined) return reason.result;
  const member = 'member' in resolutionContext ? resolutionContext.member : '';
  diagnostics.push(
    adapterDiagnostic(
      'TEXT_RESOLUTION_FAILED',
      'warning',
      {
        node: nodeName,
        nodeKind:
          'node' in resolutionContext && resolutionContext.node.kind === 'array'
            ? 'array'
            : 'object',
        member,
        ...(issueCode === undefined ? {} : { issueCode }),
        reason: reason.reason,
      },
      'node' in resolutionContext && resolutionContext.node.kind === 'array'
        ? `Text resolution failed for collection "${nodeName}".`
        : `Text resolution failed for object "${nodeName}".`,
      path,
    ),
  );
  return source;
}

function resolveCollectionText(
  adapter: InternalReactHandleContext,
  source: string,
  resolutionContext: TextResolutionContext,
  diagnostics: Diagnostic[],
  collection: ArrayNodeDefinition,
  item: ItemRuntimeSnapshot | undefined,
  rejectBlank: boolean,
  issueCode?: string,
): string {
  const failure = resolveFailure(
    adapter,
    source,
    resolutionContext,
    rejectBlank,
  );
  if (failure.result !== undefined) return failure.result;
  const member = 'member' in resolutionContext ? resolutionContext.member : '';
  diagnostics.push(
    adapterDiagnostic(
      'TEXT_RESOLUTION_FAILED',
      'warning',
      {
        node: collection.name,
        nodeKind: 'array',
        member,
        ...(item === undefined ? {} : { itemId: item.address.itemId }),
        ...(issueCode === undefined ? {} : { issueCode }),
        reason: failure.reason,
      },
      `Text resolution failed for collection "${collection.name}".`,
      collection.path,
    ),
  );
  return source;
}

function resolvePresentationText(
  adapter: InternalReactHandleContext,
  source: string,
  resolutionContext: TextResolutionContext,
  diagnostics: Diagnostic[],
  presentation:
    | PresentationSectionDefinition<FormNodeDefinition | FormNodeTemplate>
    | AdvancedPresentationLabelDefinition,
): string {
  const failure = resolveFailure(adapter, source, resolutionContext, true);
  if (failure.result !== undefined) return failure.result;
  diagnostics.push(
    adapterDiagnostic(
      'TEXT_RESOLUTION_FAILED',
      'warning',
      presentation.kind === 'section'
        ? {
            sectionId: presentation.id,
            ...(presentation.key.startsWith('["presentation",')
              ? { sectionKey: presentation.key }
              : {}),
            member: 'label',
            reason: failure.reason,
          }
        : {
            presentationKind: presentation.kind,
            presentationKey: presentation.key,
            member: 'label',
            reason: failure.reason,
          },
      presentation.kind === 'section'
        ? 'Section text resolution failed.'
        : 'Advanced presentation text resolution failed.',
    ),
  );
  return source;
}

function resolveFailure(
  adapter: InternalReactHandleContext,
  source: string,
  context: TextResolutionContext,
  rejectBlank: boolean,
):
  | { readonly result: string; readonly reason?: never }
  | {
      readonly result?: never;
      readonly reason:
        'exception' | 'non-string-result' | 'blank-string-result';
    } {
  let result: unknown;
  try {
    result = adapter.resolveText(source, context);
  } catch {
    return { reason: 'exception' };
  }
  if (typeof result !== 'string') return { reason: 'non-string-result' };
  if (rejectBlank && result.trim().length === 0)
    return { reason: 'blank-string-result' };
  return { result };
}
