// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import {
  Injectable,
  InjectionToken,
  inject,
  type Provider,
} from '@angular/core';
import type {
  ArrayNodeDefinition,
  ArrayRuntimeSnapshot,
  CollectionTextMember,
  Diagnostic,
  FieldDefinition,
  FieldTemplate,
  FieldRuntimeSnapshot,
  FieldTextMember,
  ObjectFieldDefinition,
  ObjectRuntimeSnapshot,
  ObjectTextMember,
  ItemRuntimeSnapshot,
  PresentationSectionDefinition,
  StringChoiceDefinition,
  TextResolutionContext,
  TextResolver,
} from '@rabassoft/schema-engine';
import { adapterDiagnostic } from './renderer.js';

type FieldTextResolutionContext = Extract<
  TextResolutionContext,
  { readonly field: FieldDefinition | FieldTemplate }
>;
type ObjectTextResolutionContext = Extract<
  TextResolutionContext,
  { readonly node: unknown }
>;
type CollectionTextResolutionContext = Extract<
  TextResolutionContext,
  { readonly collection: ArrayNodeDefinition }
>;
type SectionTextResolutionContext = Extract<
  TextResolutionContext,
  { readonly section: PresentationSectionDefinition }
>;

export interface AngularFieldTextSnapshot {
  readonly label: string;
  readonly description?: string;
  readonly hint?: string;
  readonly tooltip?: string;
  readonly placeholder?: string;
  readonly clearLabel: string;
  readonly choiceLabels: readonly string[];
  readonly issueMessages: readonly string[];
}

/** @internal */
export interface AngularObjectTextSnapshot {
  readonly label: string;
  readonly description?: string;
  readonly hint?: string;
  readonly tooltip?: string;
  readonly issueMessages: readonly string[];
}

/** @internal */
export interface AngularCollectionTextSnapshot extends AngularObjectTextSnapshot {
  readonly identityError?: string;
}

/** @internal */
export interface AngularItemTextSnapshot {
  readonly label: string;
  readonly remove: string;
  readonly moveEarlier: string;
  readonly moveLater: string;
  readonly issueMessages: readonly string[];
}

const identityResolver: TextResolver = Object.freeze({
  resolve: (text: string) => text,
});

export const SCHEMA_TEXT_RESOLVER = new InjectionToken<TextResolver>(
  'SCHEMA_TEXT_RESOLVER',
  { factory: () => identityResolver },
);

export function provideSchemaTextResolver(resolver: TextResolver): Provider {
  return { provide: SCHEMA_TEXT_RESOLVER, useValue: resolver };
}

export interface TextProjectionResult {
  readonly texts: AngularFieldTextSnapshot;
  readonly diagnostics: readonly Diagnostic[];
}

/** @internal */
export interface ObjectTextProjectionResult {
  readonly texts: AngularObjectTextSnapshot;
  readonly diagnostics: readonly Diagnostic[];
}

/** @internal */
export interface CollectionNodeTextProjectionResult {
  readonly texts: Omit<AngularCollectionTextSnapshot, 'identityError'>;
  readonly diagnostics: readonly Diagnostic[];
}

/** @internal */
export interface OptionalTextProjectionResult {
  readonly text?: string;
  readonly diagnostics: readonly Diagnostic[];
}

/** @internal */
export interface IssueTextProjectionResult {
  readonly messages: readonly string[];
  readonly diagnostics: readonly Diagnostic[];
}

/** @internal */
export interface ItemActionTextProjectionResult {
  readonly texts: Omit<AngularItemTextSnapshot, 'issueMessages'>;
  readonly diagnostics: readonly Diagnostic[];
}

/** @internal */
export interface SectionTextProjectionResult {
  readonly text: string;
  readonly diagnostics: readonly Diagnostic[];
}

@Injectable({ providedIn: 'root' })
export class AngularTextProjector {
  private readonly candidate: unknown = inject(SCHEMA_TEXT_RESOLVER);
  private readonly parsed = parseResolver(this.candidate);

  /** @internal */
  projectSection(
    section: PresentationSectionDefinition,
    formId: string,
    locale: string,
  ): SectionTextProjectionResult {
    const diagnostics: Diagnostic[] = [...this.parsed.diagnostics];
    const context: SectionTextResolutionContext = Object.freeze({
      formId,
      locale,
      section,
      member: 'label',
    });
    let result: unknown;
    let reason:
      'exception' | 'non-string-result' | 'blank-string-result' | undefined;
    try {
      result = this.parsed.resolver(section.label, context);
    } catch {
      reason = 'exception';
    }
    if (reason === undefined && typeof result !== 'string')
      reason = 'non-string-result';
    if (
      reason === undefined &&
      typeof result === 'string' &&
      result.trim().length === 0
    )
      reason = 'blank-string-result';
    if (reason !== undefined) {
      diagnostics.push(
        adapterDiagnostic(
          'TEXT_RESOLUTION_FAILED',
          'warning',
          { sectionId: section.id, member: 'label', reason },
          'Section text resolution failed.',
        ),
      );
      result = section.label;
    }
    return Object.freeze({
      text: result as string,
      diagnostics: Object.freeze(diagnostics),
    });
  }

  project(
    field: FieldDefinition | FieldTemplate,
    snapshot: FieldRuntimeSnapshot,
    formId: string,
    locale: string,
  ): TextProjectionResult {
    const diagnostics: Diagnostic[] = [...this.parsed.diagnostics];
    const common = { formId, locale, field } as const;
    const resolve = (
      source: string,
      member: Exclude<FieldTextMember, 'choice' | 'issue'>,
      rejectBlank = false,
    ): string =>
      resolveText(
        this.parsed.resolver,
        source,
        { ...common, member },
        diagnostics,
        snapshot.path,
        rejectBlank,
      );
    const label = resolve(field.label, 'label');
    const description =
      field.description === undefined
        ? undefined
        : resolve(field.description, 'description');
    const hint =
      field.hint === undefined ? undefined : resolve(field.hint, 'hint');
    const tooltip =
      field.tooltip === undefined
        ? undefined
        : resolve(field.tooltip, 'tooltip');
    const placeholder =
      field.placeholder === undefined
        ? undefined
        : resolve(field.placeholder, 'placeholder');
    const clearLabel = resolve('Clear', 'clear', true);
    const choiceLabels = ownChoices(field).map((choice) =>
      resolveText(
        this.parsed.resolver,
        choice.label,
        { ...common, member: 'choice', choice },
        diagnostics,
        snapshot.path,
        true,
      ),
    );
    const issueMessages = snapshot.issues.map((issue) =>
      resolveText(
        this.parsed.resolver,
        issue.fallbackMessage ?? issue.code,
        { ...common, member: 'issue', issue },
        diagnostics,
        snapshot.path,
      ),
    );
    return Object.freeze({
      texts: Object.freeze({
        label,
        ...(description === undefined ? {} : { description }),
        ...(hint === undefined ? {} : { hint }),
        ...(tooltip === undefined ? {} : { tooltip }),
        ...(placeholder === undefined ? {} : { placeholder }),
        clearLabel,
        choiceLabels: Object.freeze(choiceLabels),
        issueMessages: Object.freeze(issueMessages),
      }),
      diagnostics: Object.freeze(diagnostics),
    });
  }

  projectObject(
    node: ObjectFieldDefinition,
    snapshot: ObjectRuntimeSnapshot,
    formId: string,
    locale: string,
  ): ObjectTextProjectionResult {
    const diagnostics: Diagnostic[] = [...this.parsed.diagnostics];
    const common = { formId, locale, node } as const;
    const resolve = (
      source: string,
      member: Exclude<ObjectTextMember, 'issue'>,
      rejectBlank = false,
    ): string =>
      resolveText(
        this.parsed.resolver,
        source,
        { ...common, member },
        diagnostics,
        snapshot.path,
        rejectBlank,
      );
    const label = resolve(node.label, 'label', true);
    const description =
      node.description === undefined
        ? undefined
        : resolve(node.description, 'description');
    const hint =
      node.hint === undefined ? undefined : resolve(node.hint, 'hint');
    const tooltip =
      node.tooltip === undefined ? undefined : resolve(node.tooltip, 'tooltip');
    const issueMessages = snapshot.issues.map((issue) =>
      resolveText(
        this.parsed.resolver,
        issue.fallbackMessage ?? issue.code,
        { ...common, member: 'issue', issue },
        diagnostics,
        snapshot.path,
      ),
    );
    return Object.freeze({
      texts: Object.freeze({
        label,
        ...(description === undefined ? {} : { description }),
        ...(hint === undefined ? {} : { hint }),
        ...(tooltip === undefined ? {} : { tooltip }),
        issueMessages: Object.freeze(issueMessages),
      }),
      diagnostics: Object.freeze(diagnostics),
    });
  }

  /** @internal */
  projectCollectionNode(
    collection: ArrayNodeDefinition,
    formId: string,
    locale: string,
  ): CollectionNodeTextProjectionResult {
    const diagnostics: Diagnostic[] = [...this.parsed.diagnostics];
    const nodeCommon = { formId, locale, node: collection } as const;
    const resolveNode = (
      source: string,
      member: Exclude<ObjectTextMember, 'issue'>,
      rejectBlank = false,
    ): string =>
      resolveText(
        this.parsed.resolver,
        source,
        { ...nodeCommon, member },
        diagnostics,
        collection.path,
        rejectBlank,
      );
    const label = resolveNode(collection.label, 'label', true);
    const description =
      collection.description === undefined
        ? undefined
        : resolveNode(collection.description, 'description');
    const hint =
      collection.hint === undefined
        ? undefined
        : resolveNode(collection.hint, 'hint');
    const tooltip =
      collection.tooltip === undefined
        ? undefined
        : resolveNode(collection.tooltip, 'tooltip');
    return Object.freeze({
      texts: Object.freeze({
        label,
        ...(description === undefined ? {} : { description }),
        ...(hint === undefined ? {} : { hint }),
        ...(tooltip === undefined ? {} : { tooltip }),
        issueMessages: Object.freeze([]),
      }),
      diagnostics: Object.freeze(diagnostics),
    });
  }

  /** @internal */
  projectCollectionIdentity(
    collection: ArrayNodeDefinition,
    snapshot: ArrayRuntimeSnapshot,
    formId: string,
    locale: string,
  ): OptionalTextProjectionResult {
    if (snapshot.identityState.kind !== 'invalid')
      return Object.freeze({ diagnostics: Object.freeze([]) });
    const diagnostics: Diagnostic[] = [];
    const text = resolveText(
      this.parsed.resolver,
      'Collection items have invalid identity.',
      { formId, locale, collection, member: 'identity-error' },
      diagnostics,
      collection.path,
      true,
    );
    return Object.freeze({ text, diagnostics: Object.freeze(diagnostics) });
  }

  /** @internal */
  projectCollectionIssues(
    collection: ArrayNodeDefinition,
    snapshot: ArrayRuntimeSnapshot,
    formId: string,
    locale: string,
  ): IssueTextProjectionResult {
    const diagnostics: Diagnostic[] = [];
    const common = { formId, locale, node: collection } as const;
    const messages = snapshot.issues.map((issue) =>
      resolveText(
        this.parsed.resolver,
        issue.fallbackMessage ?? issue.code,
        { ...common, member: 'issue', issue },
        diagnostics,
        collection.path,
      ),
    );
    return Object.freeze({
      messages: Object.freeze(messages),
      diagnostics: Object.freeze(diagnostics),
    });
  }

  /** @internal */
  projectItemActions(
    collection: ArrayNodeDefinition,
    item: ItemRuntimeSnapshot,
    formId: string,
    locale: string,
  ): ItemActionTextProjectionResult {
    const diagnostics: Diagnostic[] = [...this.parsed.diagnostics];
    const common = { formId, locale, collection, item } as const;
    const resolve = (
      source: string,
      member: Exclude<CollectionTextMember, 'identity-error' | 'issue'>,
    ): string =>
      resolveText(
        this.parsed.resolver,
        source,
        { ...common, member },
        diagnostics,
        collection.path,
        true,
      );
    const position = item.index + 1;
    const label = resolve(`Item ${position}`, 'item-label');
    const remove = resolve(`Remove item ${position}`, 'remove-item');
    const moveEarlier = resolve(
      `Move item ${position} earlier`,
      'move-item-earlier',
    );
    const moveLater = resolve(`Move item ${position} later`, 'move-item-later');
    return Object.freeze({
      texts: Object.freeze({
        label,
        remove,
        moveEarlier,
        moveLater,
      }),
      diagnostics: Object.freeze(diagnostics),
    });
  }

  /** @internal */
  projectItemIssues(
    collection: ArrayNodeDefinition,
    item: ItemRuntimeSnapshot,
    formId: string,
    locale: string,
  ): IssueTextProjectionResult {
    const diagnostics: Diagnostic[] = [];
    const common = { formId, locale, collection, item } as const;
    const messages = item.issues.map((issue) =>
      resolveText(
        this.parsed.resolver,
        issue.fallbackMessage ?? issue.code,
        { ...common, member: 'issue', issue },
        diagnostics,
        collection.path,
      ),
    );
    return Object.freeze({
      messages: Object.freeze(messages),
      diagnostics: Object.freeze(diagnostics),
    });
  }
}

function parseResolver(candidate: unknown): {
  readonly resolver: (text: string, context: TextResolutionContext) => unknown;
  readonly diagnostics: readonly Diagnostic[];
} {
  const descriptor = findDescriptor(candidate, 'resolve');
  if (descriptor === undefined)
    return invalidResolver('missing-resolve', 'undefined');
  if (!('value' in descriptor))
    return invalidResolver('accessor-resolve', 'accessor');
  if (typeof descriptor.value !== 'function')
    return invalidResolver('invalid-resolve', safeType(descriptor.value));
  const method = descriptor.value as (
    this: unknown,
    text: string,
    context: TextResolutionContext,
  ) => unknown;
  return {
    resolver: (text, context) => method.call(candidate, text, context),
    diagnostics: Object.freeze([]),
  };
}

function invalidResolver(reason: string, actualType: string) {
  return {
    resolver: (text: string) => text,
    diagnostics: Object.freeze([
      adapterDiagnostic(
        'INVALID_TEXT_RESOLVER',
        'warning',
        { expected: 'callable resolve method', reason, actualType },
        'Text resolver is invalid; source text is used.',
      ),
    ]),
  };
}

function resolveText(
  resolver: (text: string, context: TextResolutionContext) => unknown,
  source: string,
  context:
    | FieldTextResolutionContext
    | ObjectTextResolutionContext
    | CollectionTextResolutionContext,
  diagnostics: Diagnostic[],
  diagnosticPath?: readonly (string | number)[],
  rejectBlank = false,
): string {
  let result: unknown;
  try {
    result = resolver(source, context);
  } catch {
    diagnostics.push(textDiagnostic(context, 'exception', diagnosticPath));
    return source;
  }
  if (typeof result !== 'string') {
    diagnostics.push(
      textDiagnostic(context, 'non-string-result', diagnosticPath),
    );
    return source;
  }
  if (rejectBlank && result.trim().length === 0) {
    diagnostics.push(
      textDiagnostic(context, 'blank-string-result', diagnosticPath),
    );
    return source;
  }
  return result;
}

function textDiagnostic(
  context:
    | FieldTextResolutionContext
    | ObjectTextResolutionContext
    | CollectionTextResolutionContext,
  reason: string,
  diagnosticPath?: readonly (string | number)[],
): Diagnostic {
  if ('collection' in context) {
    const itemId = context.item?.address.itemId;
    return adapterDiagnostic(
      'TEXT_RESOLUTION_FAILED',
      'warning',
      {
        node: context.collection.name,
        nodeKind: 'array',
        member: context.member,
        ...(itemId === undefined ? {} : { itemId }),
        ...(context.member === 'issue'
          ? { issueCode: context.issue.code }
          : {}),
        reason,
      },
      `Text resolution failed for collection "${context.collection.name}".`,
      context.collection.path,
    );
  }
  if ('node' in context) {
    const isArray = context.node.kind === 'array';
    return adapterDiagnostic(
      'TEXT_RESOLUTION_FAILED',
      'warning',
      {
        node: context.node.name,
        nodeKind: isArray ? 'array' : 'object',
        member: context.member,
        ...(context.member === 'issue'
          ? { issueCode: context.issue.code }
          : {}),
        reason,
      },
      isArray
        ? `Text resolution failed for collection "${context.node.name}".`
        : `Text resolution failed for object "${context.node.name}".`,
      context.node.path,
    );
  }
  return adapterDiagnostic(
    'TEXT_RESOLUTION_FAILED',
    'warning',
    {
      field: context.field.name,
      member: context.member,
      ...(context.member === 'choice'
        ? { choiceValue: context.choice.value }
        : context.member === 'issue'
          ? { issueCode: context.issue.code }
          : {}),
      reason,
    },
    `Text resolution failed for field "${context.field.name}".`,
    diagnosticPath ??
      ('path' in context.field ? context.field.path : undefined),
  );
}

function ownChoices(
  field: FieldDefinition | FieldTemplate,
): readonly StringChoiceDefinition[] {
  if (field.kind !== 'string') return [];
  const descriptor = Object.getOwnPropertyDescriptor(field, 'choices');
  return descriptor !== undefined &&
    'value' in descriptor &&
    Array.isArray(descriptor.value)
    ? (descriptor.value as readonly StringChoiceDefinition[])
    : [];
}

function findDescriptor(
  candidate: unknown,
  key: PropertyKey,
): PropertyDescriptor | undefined {
  if (
    (typeof candidate !== 'object' && typeof candidate !== 'function') ||
    candidate === null
  )
    return undefined;
  let current: object | null = candidate;
  while (current !== null) {
    const descriptor = Object.getOwnPropertyDescriptor(current, key);
    if (descriptor !== undefined) return descriptor;
    current = Object.getPrototypeOf(current) as object | null;
  }
  return undefined;
}

function safeType(value: unknown): string {
  return value === null
    ? 'null'
    : Array.isArray(value)
      ? 'array'
      : typeof value;
}

export function emptyTextSnapshot(): AngularFieldTextSnapshot {
  return Object.freeze({
    label: '',
    clearLabel: 'Clear',
    choiceLabels: Object.freeze([]),
    issueMessages: Object.freeze([]),
  });
}

/** @internal */
export function emptyObjectTextSnapshot(): AngularObjectTextSnapshot {
  return Object.freeze({
    label: '',
    issueMessages: Object.freeze([]),
  });
}

/** @internal */
export function emptyCollectionTextSnapshot(): AngularCollectionTextSnapshot {
  return Object.freeze({
    label: '',
    issueMessages: Object.freeze([]),
  });
}

/** @internal */
export function emptyItemTextSnapshot(): AngularItemTextSnapshot {
  return Object.freeze({
    label: '',
    remove: '',
    moveEarlier: '',
    moveLater: '',
    issueMessages: Object.freeze([]),
  });
}
