// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import {
  compileFormDefinition,
  type CompileFormDefinitionInput,
  type CompileFormResult,
  type Diagnostic,
} from '@rabassoft/schema-engine';

export interface AppliedConfiguration {
  readonly input: CompileFormDefinitionInput;
  readonly schemaText: string;
  readonly uiSchemaText: string;
}

export type ConfigurationDraftResult =
  | { readonly status: 'unvalidated'; readonly diagnostics: readonly [] }
  | {
      readonly status: 'invalid-json';
      readonly diagnostics: readonly [];
      readonly documents: readonly ('schema' | 'ui-schema')[];
    }
  | {
      readonly status: 'compile-failed';
      readonly diagnostics: readonly Diagnostic[];
    }
  | { readonly status: 'valid'; readonly diagnostics: readonly Diagnostic[] };

export type DraftEvaluation =
  | { readonly success: false; readonly result: ConfigurationDraftResult }
  | {
      readonly success: true;
      readonly result: ConfigurationDraftResult;
      readonly configuration: AppliedConfiguration;
      readonly compilation: Extract<CompileFormResult, { success: true }>;
    };

const EMPTY: readonly [] = Object.freeze([]);

export function prepareConfiguration(
  input: CompileFormDefinitionInput,
): AppliedConfiguration {
  const copy = JSON.parse(formatJson(input)) as CompileFormDefinitionInput;
  const schemaText = formatJson(copy.schema);
  const uiSchemaText = formatJson(copy.uiSchema ?? {});
  return Object.freeze({
    input: freezeJson({
      ...copy,
      schema: JSON.parse(schemaText) as unknown,
      uiSchema: JSON.parse(uiSchemaText) as unknown,
    }),
    schemaText,
    uiSchemaText,
  });
}

export function emptyDraftResult(): ConfigurationDraftResult {
  return Object.freeze({ status: 'unvalidated', diagnostics: EMPTY });
}

export function evaluateDraft(
  schemaText: string,
  uiSchemaText: string,
  base: CompileFormDefinitionInput,
): DraftEvaluation {
  const documents: ('schema' | 'ui-schema')[] = [];
  let schema: unknown;
  let uiSchema: unknown;
  try {
    schema = JSON.parse(schemaText) as unknown;
  } catch {
    documents.push('schema');
  }
  try {
    uiSchema = JSON.parse(uiSchemaText) as unknown;
  } catch {
    documents.push('ui-schema');
  }
  if (documents.length > 0)
    return Object.freeze({
      success: false,
      result: Object.freeze({
        status: 'invalid-json',
        diagnostics: EMPTY,
        documents: Object.freeze(documents),
      }),
    });

  const input = freezeJson({ ...base, schema, uiSchema });
  const compilation = compileFormDefinition(input);
  if (!compilation.success)
    return Object.freeze({
      success: false,
      result: Object.freeze({
        status: 'compile-failed',
        diagnostics: compilation.diagnostics,
      }),
    });

  const result = Object.freeze({
    status: 'valid' as const,
    diagnostics: compilation.diagnostics,
  });
  return Object.freeze({
    success: true,
    result,
    compilation,
    configuration: Object.freeze({ input, schemaText, uiSchemaText }),
  });
}

export function configurationsEqual(
  left: AppliedConfiguration,
  right: AppliedConfiguration,
): boolean {
  return (
    left.schemaText === right.schemaText &&
    left.uiSchemaText === right.uiSchemaText
  );
}

function formatJson(value: unknown): string {
  const result = JSON.stringify(value, undefined, 2);
  if (result === undefined)
    throw new Error('Reference configuration must be JSON serializable.');
  return result;
}

function freezeJson<T>(value: T): T {
  if (typeof value !== 'object' || value === null || Object.isFrozen(value))
    return value;
  if (Array.isArray(value)) for (const entry of value) freezeJson(entry);
  else for (const entry of Object.values(value)) freezeJson(entry);
  return Object.freeze(value);
}
