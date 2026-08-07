// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import type {
  Diagnostic,
  FieldDefinition,
  FieldRuntimeSnapshot,
  FieldTemplate,
  FieldTextMember,
  StringChoiceDefinition,
  TextResolutionContext,
} from '@rabassoft/schema-engine';
import type { ReactFieldTextSnapshot } from '../contracts.js';
import type { InternalReactHandleContext } from './controller.js';
import { adapterDiagnostic, freezeDiagnostics } from './diagnostics.js';

type FieldTextResolutionContext = Extract<
  TextResolutionContext,
  { readonly field: FieldDefinition | FieldTemplate }
>;

export interface FieldTextProjection {
  readonly texts: ReactFieldTextSnapshot;
  readonly diagnostics: readonly Diagnostic[];
}

export function projectFieldText(
  field: FieldDefinition | FieldTemplate,
  snapshot: FieldRuntimeSnapshot,
  context: InternalReactHandleContext,
): FieldTextProjection {
  const formId = context.formId ?? '';
  const locale = context.locale ?? '';
  const diagnostics: Diagnostic[] = [];
  const common = { formId, locale, field } as const;
  const resolve = (
    source: string,
    member: Exclude<FieldTextMember, 'choice' | 'issue'>,
    rejectBlank = false,
  ): string =>
    resolveFieldText(
      context,
      source,
      Object.freeze({ ...common, member }),
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
    field.tooltip === undefined ? undefined : resolve(field.tooltip, 'tooltip');
  const placeholder =
    !('placeholder' in field) || field.placeholder === undefined
      ? undefined
      : resolve(field.placeholder, 'placeholder');
  const clearLabel = resolve('Clear', 'clear', true);
  const setNullLabel = resolve('Set null', 'set-null', true);
  const nullValueLabel = resolve('Null value', 'null-value', true);
  const fixedLabels = hasOwnFixedValue(field)
    ? {
        fixedMissingLabel: resolve('Missing value', 'fixed-missing', true),
        fixedUnavailableLabel: resolve(
          'Unavailable value',
          'fixed-unavailable',
          true,
        ),
        fixedIncompatibleLabel: resolve(
          'Incompatible value',
          'fixed-incompatible',
          true,
        ),
      }
    : {
        fixedMissingLabel: 'Missing value',
        fixedUnavailableLabel: 'Unavailable value',
        fixedIncompatibleLabel: 'Incompatible value',
      };
  const choiceLabels = ownChoices(field).map((choice) =>
    resolveFieldText(
      context,
      choice.label,
      Object.freeze({ ...common, member: 'choice' as const, choice }),
      diagnostics,
      snapshot.path,
      true,
    ),
  );
  const missingSelectionLabel = resolve(
    'No value provided.',
    'missing-selection',
    true,
  );
  const emptySelectionLabel = resolve(
    'No values selected.',
    'empty-selection',
    true,
  );
  const issueMessages = snapshot.issues.map((issue) =>
    resolveFieldText(
      context,
      issue.fallbackMessage ?? issue.code,
      Object.freeze({ ...common, member: 'issue' as const, issue }),
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
      setNullLabel,
      nullValueLabel,
      ...fixedLabels,
      choiceLabels: Object.freeze(choiceLabels),
      missingSelectionLabel,
      emptySelectionLabel,
      issueMessages: Object.freeze(issueMessages),
    }),
    diagnostics: freezeDiagnostics(diagnostics),
  });
}

function resolveFieldText(
  adapter: InternalReactHandleContext,
  source: string,
  context: FieldTextResolutionContext,
  diagnostics: Diagnostic[],
  path: readonly (string | number)[],
  rejectBlank = false,
): string {
  let result: unknown;
  let reason: string | undefined;
  try {
    result = adapter.resolveText(source, context);
  } catch {
    reason = 'exception';
  }
  if (reason === undefined && typeof result !== 'string')
    reason = 'non-string-result';
  if (
    reason === undefined &&
    typeof result === 'string' &&
    rejectBlank &&
    result.trim().length === 0
  )
    reason = 'blank-string-result';
  if (reason === undefined) return result as string;
  diagnostics.push(
    adapterDiagnostic(
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
      path,
    ),
  );
  return source;
}

function ownChoices(
  field: FieldDefinition | FieldTemplate,
): readonly StringChoiceDefinition[] {
  if (field.kind !== 'string' && field.kind !== 'string-enum-array') return [];
  const descriptor = Object.getOwnPropertyDescriptor(field, 'choices');
  return descriptor !== undefined &&
    'value' in descriptor &&
    Array.isArray(descriptor.value)
    ? (descriptor.value as readonly StringChoiceDefinition[])
    : [];
}

function hasOwnFixedValue(field: FieldDefinition | FieldTemplate): boolean {
  const descriptor = Object.getOwnPropertyDescriptor(field, 'fixedValue');
  return descriptor !== undefined && 'value' in descriptor;
}
