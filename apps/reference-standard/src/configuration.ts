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

export type ConfigurationDraftStatus =
  'unvalidated' | 'invalid-json' | 'compile-failed' | 'valid';

export interface ConfigurationSyntaxIssue {
  readonly document: 'schema' | 'ui-schema';
  readonly message: 'Invalid JSON syntax.';
}

export interface ConfigurationDraftResult {
  readonly status: ConfigurationDraftStatus;
  readonly syntaxIssues: readonly ConfigurationSyntaxIssue[];
  readonly diagnostics: readonly Diagnostic[];
}

export type DraftEvaluation =
  | {
      readonly success: false;
      readonly result: ConfigurationDraftResult;
    }
  | {
      readonly success: true;
      readonly result: ConfigurationDraftResult;
      readonly configuration: AppliedConfiguration;
      readonly compilation: Extract<CompileFormResult, { success: true }>;
    };

const EMPTY_DIAGNOSTICS: readonly Diagnostic[] = Object.freeze([]);
const EMPTY_SYNTAX_ISSUES: readonly ConfigurationSyntaxIssue[] = Object.freeze(
  [],
);

export function prepareConfiguration(
  input: CompileFormDefinitionInput,
): AppliedConfiguration {
  const copiedInput = JSON.parse(
    formatJson(input),
  ) as CompileFormDefinitionInput;
  const schemaText = formatJson(copiedInput.schema);
  const uiSchemaText = formatJson(copiedInput.uiSchema ?? {});
  return Object.freeze({
    input: freezeJson({
      ...copiedInput,
      schema: JSON.parse(schemaText) as unknown,
      uiSchema: JSON.parse(uiSchemaText) as unknown,
    }),
    schemaText,
    uiSchemaText,
  });
}

export function emptyDraftResult(): ConfigurationDraftResult {
  return Object.freeze({
    status: 'unvalidated',
    syntaxIssues: EMPTY_SYNTAX_ISSUES,
    diagnostics: EMPTY_DIAGNOSTICS,
  });
}

export function evaluateDraft(
  schemaText: string,
  uiSchemaText: string,
  baseInput: CompileFormDefinitionInput,
): DraftEvaluation {
  const syntaxIssues: ConfigurationSyntaxIssue[] = [];
  let schema: unknown;
  let uiSchema: unknown;
  try {
    schema = JSON.parse(schemaText) as unknown;
  } catch {
    syntaxIssues.push(
      Object.freeze({
        document: 'schema',
        message: 'Invalid JSON syntax.',
      }),
    );
  }
  try {
    uiSchema = JSON.parse(uiSchemaText) as unknown;
  } catch {
    syntaxIssues.push(
      Object.freeze({
        document: 'ui-schema',
        message: 'Invalid JSON syntax.',
      }),
    );
  }

  if (syntaxIssues.length > 0) {
    return Object.freeze({
      success: false,
      result: Object.freeze({
        status: 'invalid-json',
        syntaxIssues: Object.freeze(syntaxIssues),
        diagnostics: EMPTY_DIAGNOSTICS,
      }),
    });
  }

  const input = freezeJson({ ...baseInput, schema, uiSchema });
  const compilation = compileFormDefinition(input);
  if (!compilation.success) {
    return Object.freeze({
      success: false,
      result: Object.freeze({
        status: 'compile-failed',
        syntaxIssues: EMPTY_SYNTAX_ISSUES,
        diagnostics: compilation.diagnostics,
      }),
    });
  }

  const configuration = Object.freeze({
    input,
    schemaText,
    uiSchemaText,
  });
  return Object.freeze({
    success: true,
    configuration,
    compilation,
    result: Object.freeze({
      status: 'valid',
      syntaxIssues: EMPTY_SYNTAX_ISSUES,
      diagnostics: compilation.diagnostics,
    }),
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
  const serialized = JSON.stringify(value, undefined, 2);
  if (serialized === undefined) {
    throw new Error('Reference configuration must be JSON serializable.');
  }
  return serialized;
}

function freezeJson<T>(value: T): T {
  if (typeof value !== 'object' || value === null || Object.isFrozen(value)) {
    return value;
  }
  if (Array.isArray(value)) {
    for (const entry of value) freezeJson(entry);
  } else {
    for (const entry of Object.values(value)) freezeJson(entry);
  }
  return Object.freeze(value);
}
