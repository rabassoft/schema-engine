import {
  Injectable,
  InjectionToken,
  inject,
  type Provider,
} from '@angular/core';
import type {
  Diagnostic,
  FieldDefinition,
  FieldRuntimeSnapshot,
  FieldTextMember,
  ObjectFieldDefinition,
  ObjectRuntimeSnapshot,
  ObjectTextMember,
  StringChoiceDefinition,
  TextResolutionContext,
  TextResolver,
} from '@rabassoft/schema-engine';
import { adapterDiagnostic } from './renderer.js';

type FieldTextResolutionContext = Extract<
  TextResolutionContext,
  { readonly field: FieldDefinition }
>;
type ObjectTextResolutionContext = Extract<
  TextResolutionContext,
  { readonly node: unknown }
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

@Injectable({ providedIn: 'root' })
export class AngularTextProjector {
  private readonly candidate: unknown = inject(SCHEMA_TEXT_RESOLVER);
  private readonly parsed = parseResolver(this.candidate);

  project(
    field: FieldDefinition,
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
        true,
      ),
    );
    const issueMessages = snapshot.issues.map((issue) =>
      resolveText(
        this.parsed.resolver,
        issue.fallbackMessage ?? issue.code,
        { ...common, member: 'issue', issue },
        diagnostics,
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
  context: FieldTextResolutionContext | ObjectTextResolutionContext,
  diagnostics: Diagnostic[],
  rejectBlank = false,
): string {
  let result: unknown;
  try {
    result = resolver(source, context);
  } catch {
    diagnostics.push(textDiagnostic(context, 'exception'));
    return source;
  }
  if (typeof result !== 'string') {
    diagnostics.push(textDiagnostic(context, 'non-string-result'));
    return source;
  }
  if (rejectBlank && result.trim().length === 0) {
    diagnostics.push(textDiagnostic(context, 'blank-string-result'));
    return source;
  }
  return result;
}

function textDiagnostic(
  context: FieldTextResolutionContext | ObjectTextResolutionContext,
  reason: string,
): Diagnostic {
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
    context.field.path,
  );
}

function ownChoices(field: FieldDefinition): readonly StringChoiceDefinition[] {
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
