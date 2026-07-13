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
  TextResolutionContext,
  TextResolver,
} from '@rabassoft/schema-engine';
import { adapterDiagnostic } from './renderer.js';

export interface AngularFieldTextSnapshot {
  readonly label: string;
  readonly description?: string;
  readonly hint?: string;
  readonly tooltip?: string;
  readonly placeholder?: string;
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
      member: Exclude<FieldTextMember, 'issue'>,
    ): string =>
      resolveText(
        this.parsed.resolver,
        source,
        { ...common, member },
        diagnostics,
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
        label: resolve(field.label, 'label'),
        ...(field.description === undefined
          ? {}
          : { description: resolve(field.description, 'description') }),
        ...(field.hint === undefined
          ? {}
          : { hint: resolve(field.hint, 'hint') }),
        ...(field.tooltip === undefined
          ? {}
          : { tooltip: resolve(field.tooltip, 'tooltip') }),
        ...(field.placeholder === undefined
          ? {}
          : { placeholder: resolve(field.placeholder, 'placeholder') }),
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
  context: TextResolutionContext,
  diagnostics: Diagnostic[],
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
  return result;
}

function textDiagnostic(
  context: TextResolutionContext,
  reason: string,
): Diagnostic {
  return adapterDiagnostic(
    'TEXT_RESOLUTION_FAILED',
    'warning',
    {
      field: context.field.name,
      member: context.member,
      ...(context.member === 'issue' ? { issueCode: context.issue.code } : {}),
      reason,
    },
    `Text resolution failed for field "${context.field.name}".`,
    context.field.path,
  );
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
  return Object.freeze({ label: '', issueMessages: Object.freeze([]) });
}
