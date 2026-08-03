// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import type { Diagnostic, DocumentPath } from '../contracts.js';
import { diagnostic } from './diagnostics.js';
import {
  COMPILER_SUPPORTED_KEYWORDS,
  KNOWN_DRAFT_2020_12_KEYWORDS,
  KNOWN_IGNORABLE_KEYWORDS,
} from './keywords.js';
import { actualType, isRecord } from './value.js';

export type CompositionUseSite = 'root' | 'property' | 'item-root';

export interface CompositionInspectionContext {
  readonly useSite: CompositionUseSite;
  readonly documentPath: DocumentPath;
  readonly dataPath?: readonly string[];
  readonly templatePath?: readonly string[];
  readonly inspectBranches?: boolean;
}

export type CompositionFoundationResult =
  | { readonly kind: 'absent' }
  | {
      readonly kind: 'input-failure';
      readonly diagnostics: readonly Diagnostic[];
    }
  | {
      readonly kind: 'wrapper';
      readonly blocked: boolean;
      readonly exteriorValid: boolean;
      readonly diagnostics: readonly Diagnostic[];
      readonly branches?: readonly Record<string, unknown>[];
    };

type DataDescriptor = Omit<PropertyDescriptor, 'value'> & {
  readonly value: unknown;
};

interface ValidExterior {
  readonly branches: readonly Record<string, unknown>[];
}

const PRIMITIVE_TYPES = new Set(['string', 'number', 'integer', 'boolean']);

const SEMANTIC_APPLICATORS = new Set([
  '$ref',
  '$dynamicRef',
  'prefixItems',
  'items',
  'contains',
  'additionalProperties',
  'properties',
  'patternProperties',
  'dependentSchemas',
  'propertyNames',
  'if',
  'then',
  'else',
  'anyOf',
  'oneOf',
  'not',
  'unevaluatedItems',
  'unevaluatedProperties',
]);

const ROOT_WRAPPER_MEMBERS = new Set([
  '$schema',
  '$defs',
  'type',
  'title',
  'description',
  'allOf',
]);
const PROPERTY_WRAPPER_MEMBERS = new Set([
  'type',
  'title',
  'description',
  'default',
  'allOf',
]);
const ITEM_ROOT_WRAPPER_MEMBERS = new Set(['type', 'allOf']);

/**
 * Returns the accepted non-object field kind for exact ordinary declarations.
 * The inspection is descriptor-based and never uses an array iterator.
 */
export function acceptedNonObjectCompositionType(
  value: unknown,
): 'string' | 'number' | 'integer' | 'boolean' | 'array' | undefined {
  if (typeof value === 'string') {
    return value === 'array' || PRIMITIVE_TYPES.has(value)
      ? (value as 'string' | 'number' | 'integer' | 'boolean' | 'array')
      : undefined;
  }
  if (!Array.isArray(value)) return undefined;

  const length = Object.getOwnPropertyDescriptor(value, 'length');
  if (!isDataDescriptor(length) || length.value !== 2) return undefined;
  const first = Object.getOwnPropertyDescriptor(value, '0');
  const second = Object.getOwnPropertyDescriptor(value, '1');
  if (
    !isEnumerableDataDescriptor(first) ||
    !isEnumerableDataDescriptor(second)
  ) {
    return undefined;
  }
  if (Object.keys(value).some((key) => key !== '0' && key !== '1')) {
    return undefined;
  }

  const firstValue = first.value;
  const secondValue = second.value;
  if (
    firstValue === 'null' &&
    typeof secondValue === 'string' &&
    PRIMITIVE_TYPES.has(secondValue)
  ) {
    return secondValue as 'string' | 'number' | 'integer' | 'boolean';
  }
  if (
    secondValue === 'null' &&
    typeof firstValue === 'string' &&
    PRIMITIVE_TYPES.has(firstValue)
  ) {
    return firstValue as 'string' | 'number' | 'integer' | 'boolean';
  }
  return undefined;
}

export function inspectCompositionFoundation(
  schema: Record<string, unknown>,
  context: CompositionInspectionContext,
): CompositionFoundationResult {
  try {
    return inspectCompositionFoundationUnsafe(schema, context);
  } catch {
    return {
      kind: 'input-failure',
      diagnostics: [
        withTemplatePath(
          diagnostic({
            code: 'INVALID_COMPILER_INPUT',
            severity: 'error',
            source: 'schema',
            ...(context.dataPath === undefined
              ? {}
              : { dataPath: context.dataPath }),
            documentPath: context.documentPath,
            parameters: { actualType: 'object' },
            fallbackMessage: 'Compiler input must be an object.',
          }),
          context.templatePath,
        ),
      ],
    };
  }
}

function inspectCompositionFoundationUnsafe(
  schema: Record<string, unknown>,
  context: CompositionInspectionContext,
): CompositionFoundationResult {
  if (Object.getOwnPropertyDescriptor(schema, 'allOf') === undefined) {
    return { kind: 'absent' };
  }

  const diagnostics: Diagnostic[] = [];
  type Task =
    | {
        readonly kind: 'wrapper';
        readonly schema: Record<string, unknown>;
        readonly documentPath: DocumentPath;
      }
    | {
        readonly kind: 'branch';
        readonly schema: Record<string, unknown>;
        readonly documentPath: DocumentPath;
        readonly branchIndex: number;
      }
    | { readonly kind: 'exit'; readonly schema: Record<string, unknown> };
  const stack: Task[] = [
    { kind: 'wrapper', schema, documentPath: context.documentPath },
  ];
  const active = new Set<object>();
  let exteriorValid = true;
  let rootBranches: readonly Record<string, unknown>[] | undefined;

  while (stack.length > 0) {
    const frame = stack.pop();
    if (frame === undefined) break;
    if (frame.kind === 'exit') {
      active.delete(frame.schema);
      continue;
    }
    if (frame.kind === 'branch') {
      if (
        Object.getOwnPropertyDescriptor(frame.schema, 'allOf') !== undefined
      ) {
        stack.push({
          kind: 'wrapper',
          schema: frame.schema,
          documentPath: frame.documentPath,
        });
      } else if (
        Object.getOwnPropertyDescriptor(frame.schema, '$ref') === undefined &&
        !isOrdinaryContribution(frame.schema)
      ) {
        diagnostics.push(
          compositionDiagnostic(context, frame.documentPath, {
            reason: 'unsupported-branch-kind',
            branchIndex: frame.branchIndex,
            expected:
              'object contribution, local reference or nested object composition',
          }),
        );
      }
      continue;
    }
    if (active.has(frame.schema)) continue;
    active.add(frame.schema);
    stack.push({ kind: 'exit', schema: frame.schema });

    inspectWrapperMembers(
      frame.schema,
      frame.documentPath,
      context,
      diagnostics,
    );
    const exterior = inspectAllOfExterior(
      frame.schema,
      frame.documentPath,
      context,
      diagnostics,
    );
    if (exterior === undefined) {
      exteriorValid = false;
      continue;
    }
    if (frame.schema === schema && rootBranches === undefined) {
      rootBranches = exterior.branches;
    }

    if (context.inspectBranches === false) continue;

    for (let index = exterior.branches.length - 1; index >= 0; index -= 1) {
      const branch = exterior.branches[index] as Record<string, unknown>;
      const branchPath = [...frame.documentPath, 'allOf', index];
      stack.push({
        kind: 'branch',
        schema: branch,
        documentPath: branchPath,
        branchIndex: index,
      });
    }
  }

  return {
    kind: 'wrapper',
    blocked: diagnostics.some(({ severity }) => severity === 'error'),
    exteriorValid,
    diagnostics,
    ...(rootBranches === undefined ? {} : { branches: rootBranches }),
  };
}

export function incompatibleAllOfDiagnostic(
  fieldType: 'string' | 'number' | 'integer' | 'boolean' | 'array',
  documentPath: DocumentPath,
  dataPath: readonly string[],
  templatePath?: readonly string[],
): Diagnostic {
  return withTemplatePath(
    diagnostic({
      code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
      severity: 'error',
      source: 'schema',
      dataPath,
      documentPath,
      parameters: { keyword: 'allOf', fieldType },
      fallbackMessage: `Schema keyword "allOf" is incompatible with field type "${fieldType}".`,
    }),
    templatePath,
  );
}

function inspectWrapperMembers(
  schema: Record<string, unknown>,
  documentPath: DocumentPath,
  context: CompositionInspectionContext,
  diagnostics: Diagnostic[],
): void {
  const type = Object.getOwnPropertyDescriptor(schema, 'type');
  if (
    type !== undefined &&
    (!isDataDescriptor(type) || type.value !== 'object')
  ) {
    diagnostics.push(
      invalidKeyword(
        context,
        [...documentPath, 'type'],
        {
          keyword: 'type',
          expected: '"object"',
          actualType: !isDataDescriptor(type)
            ? 'accessor'
            : actualType(type.value),
        },
        'type',
      ),
    );
  }

  const supported = wrapperMembers(context.useSite);
  for (const keyword of Object.keys(schema)) {
    if (keyword === 'type' || keyword === 'allOf') continue;
    if (
      context.useSite === 'root' &&
      (keyword === '$schema' || keyword === '$defs')
    ) {
      continue;
    }
    const keywordPath = [...documentPath, keyword];
    if (supported.has(keyword)) {
      if (keyword === 'title' || keyword === 'description') {
        inspectTextMember(schema, keyword, keywordPath, context, diagnostics);
      }
      continue;
    }
    if (KNOWN_IGNORABLE_KEYWORDS.has(keyword)) {
      diagnostics.push(
        schemaKeywordDiagnostic(
          'IGNORED_SCHEMA_KEYWORD',
          'warning',
          keyword,
          keywordPath,
          `Known annotation "${keyword}" is ignored by the compiler.`,
          context,
        ),
      );
      continue;
    }
    if (
      keyword === '$ref' ||
      SEMANTIC_APPLICATORS.has(keyword) ||
      COMPILER_SUPPORTED_KEYWORDS.has(keyword)
    ) {
      diagnostics.push(
        withTemplatePath(
          diagnostic({
            code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
            severity: 'error',
            source: 'schema',
            ...(context.dataPath === undefined
              ? {}
              : { dataPath: context.dataPath }),
            documentPath: keywordPath,
            parameters: { keyword, fieldType: 'composition' },
            fallbackMessage: `Schema keyword "${keyword}" is incompatible with field type "composition".`,
          }),
          context.templatePath,
        ),
      );
      continue;
    }
    if (KNOWN_DRAFT_2020_12_KEYWORDS.has(keyword)) {
      diagnostics.push(
        schemaKeywordDiagnostic(
          'UNSUPPORTED_SCHEMA_KEYWORD',
          'error',
          keyword,
          keywordPath,
          `Schema keyword "${keyword}" is not supported.`,
          context,
        ),
      );
      continue;
    }
    diagnostics.push(
      schemaKeywordDiagnostic(
        'UNKNOWN_SCHEMA_KEYWORD',
        'warning',
        keyword,
        keywordPath,
        `Unknown schema keyword "${keyword}" is treated as an annotation.`,
        context,
      ),
    );
  }
}

function inspectTextMember(
  schema: Record<string, unknown>,
  keyword: 'title' | 'description',
  documentPath: DocumentPath,
  context: CompositionInspectionContext,
  diagnostics: Diagnostic[],
): void {
  const descriptor = Object.getOwnPropertyDescriptor(schema, keyword);
  const expected =
    keyword === 'title' && context.useSite === 'property'
      ? 'non-blank string'
      : 'string';
  if (!isDataDescriptor(descriptor)) {
    diagnostics.push(
      invalidKeyword(
        context,
        documentPath,
        { keyword, expected, actualType: 'accessor' },
        keyword,
      ),
    );
    return;
  }
  if (
    typeof descriptor.value !== 'string' ||
    (expected === 'non-blank string' && descriptor.value.trim().length === 0)
  ) {
    diagnostics.push(
      invalidKeyword(
        context,
        documentPath,
        { keyword, expected, actualType: actualType(descriptor.value) },
        keyword,
      ),
    );
  }
}

function inspectAllOfExterior(
  schema: Record<string, unknown>,
  documentPath: DocumentPath,
  context: CompositionInspectionContext,
  diagnostics: Diagnostic[],
): ValidExterior | undefined {
  const allOfPath = [...documentPath, 'allOf'];
  const descriptor = Object.getOwnPropertyDescriptor(schema, 'allOf');
  if (!isDataDescriptor(descriptor) || descriptor.enumerable !== true) {
    diagnostics.push(
      invalidAllOf(context, allOfPath, {
        keyword: 'allOf',
        expected: 'non-empty dense array of object schemas',
        actualType: !isDataDescriptor(descriptor)
          ? 'accessor'
          : 'non-enumerable',
      }),
    );
    return undefined;
  }

  const value = descriptor.value;
  if (!Array.isArray(value)) {
    diagnostics.push(
      invalidAllOf(context, allOfPath, {
        keyword: 'allOf',
        expected: 'non-empty dense array of object schemas',
        actualType: actualType(value),
      }),
    );
    return undefined;
  }

  const lengthDescriptor = Object.getOwnPropertyDescriptor(value, 'length');
  if (
    !isDataDescriptor(lengthDescriptor) ||
    typeof lengthDescriptor.value !== 'number' ||
    !Number.isSafeInteger(lengthDescriptor.value) ||
    lengthDescriptor.value <= 0
  ) {
    const lengthValue = isDataDescriptor(lengthDescriptor)
      ? lengthDescriptor.value
      : undefined;
    diagnostics.push(
      invalidAllOf(context, allOfPath, {
        keyword: 'allOf',
        expected: 'positive safe integer length',
        reason: 'invalid-allof-length',
        actualType: !isDataDescriptor(lengthDescriptor)
          ? lengthDescriptor === undefined
            ? 'missing'
            : 'accessor'
          : actualType(lengthValue),
        ...(typeof lengthValue === 'number' &&
        Number.isSafeInteger(lengthValue) &&
        lengthValue <= 0
          ? { actualLength: lengthValue }
          : {}),
      }),
    );
    return undefined;
  }

  const length = lengthDescriptor.value;
  const branches: Record<string, unknown>[] = [];
  for (let index = 0; index < length; index += 1) {
    const entry = Object.getOwnPropertyDescriptor(value, String(index));
    if (!isEnumerableDataDescriptor(entry) || !isOrdinaryRecord(entry.value)) {
      diagnostics.push(
        invalidAllOf(context, [...allOfPath, index], {
          keyword: 'allOf',
          expected: 'ordinary schema object',
          actualType:
            entry === undefined
              ? 'missing'
              : !isDataDescriptor(entry)
                ? 'accessor'
                : entry.enumerable !== true
                  ? 'non-enumerable'
                  : actualType(entry.value),
        }),
      );
      return undefined;
    }
    branches.push(entry.value);
  }

  const denseKeys = new Set(branches.map((_, index) => String(index)));
  const extraKey = Object.keys(value).find((key) => !denseKeys.has(key));
  if (extraKey !== undefined) {
    diagnostics.push(
      invalidAllOf(context, [...allOfPath, extraKey], {
        keyword: 'allOf',
        expected: 'dense array indices only',
        reason: 'unexpected-allof-member',
      }),
    );
    return undefined;
  }

  return { branches };
}

function isOrdinaryContribution(schema: Record<string, unknown>): boolean {
  const type = Object.getOwnPropertyDescriptor(schema, 'type');
  const properties = Object.getOwnPropertyDescriptor(schema, 'properties');
  return (
    isDataDescriptor(type) &&
    type.value === 'object' &&
    isDataDescriptor(properties) &&
    isOrdinaryRecord(properties.value)
  );
}

function isOrdinaryRecord(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value)) return false;
  const prototype = Object.getPrototypeOf(value) as unknown;
  return prototype === Object.prototype || prototype === null;
}

function isDataDescriptor(
  descriptor: PropertyDescriptor | undefined,
): descriptor is DataDescriptor {
  return descriptor !== undefined && 'value' in descriptor;
}

function isEnumerableDataDescriptor(
  descriptor: PropertyDescriptor | undefined,
): descriptor is DataDescriptor {
  return isDataDescriptor(descriptor) && descriptor.enumerable === true;
}

function wrapperMembers(useSite: CompositionUseSite): ReadonlySet<string> {
  if (useSite === 'root') return ROOT_WRAPPER_MEMBERS;
  if (useSite === 'property') return PROPERTY_WRAPPER_MEMBERS;
  return ITEM_ROOT_WRAPPER_MEMBERS;
}

function invalidAllOf(
  context: CompositionInspectionContext,
  documentPath: DocumentPath,
  parameters: Readonly<Record<string, unknown>>,
): Diagnostic {
  return invalidKeyword(context, documentPath, parameters, 'allOf');
}

function invalidKeyword(
  context: CompositionInspectionContext,
  documentPath: DocumentPath,
  parameters: Readonly<Record<string, unknown>>,
  keyword: string,
): Diagnostic {
  return withTemplatePath(
    diagnostic({
      code: 'INVALID_SCHEMA_KEYWORD_VALUE',
      severity: 'error',
      source: 'schema',
      ...(context.dataPath === undefined ? {} : { dataPath: context.dataPath }),
      documentPath,
      parameters,
      fallbackMessage: `Schema keyword "${keyword}" has an invalid value.`,
    }),
    context.templatePath,
  );
}

function compositionDiagnostic(
  context: CompositionInspectionContext,
  documentPath: DocumentPath,
  parameters: Readonly<Record<string, unknown>>,
): Diagnostic {
  return withTemplatePath(
    diagnostic({
      code: 'INCOMPATIBLE_SCHEMA_COMPOSITION',
      severity: 'error',
      source: 'schema',
      ...(context.dataPath === undefined ? {} : { dataPath: context.dataPath }),
      documentPath,
      parameters,
      fallbackMessage: 'Schema composition is incompatible.',
    }),
    context.templatePath,
  );
}

function schemaKeywordDiagnostic(
  code: string,
  severity: 'warning' | 'error',
  keyword: string,
  documentPath: DocumentPath,
  fallbackMessage: string,
  context: CompositionInspectionContext,
): Diagnostic {
  return withTemplatePath(
    diagnostic({
      code,
      severity,
      source: 'schema',
      ...(context.dataPath === undefined ? {} : { dataPath: context.dataPath }),
      documentPath,
      parameters: { keyword },
      fallbackMessage,
    }),
    context.templatePath,
  );
}

function withTemplatePath(
  value: Diagnostic,
  templatePath: readonly string[] | undefined,
): Diagnostic {
  if (templatePath === undefined) return value;
  return {
    ...value,
    parameters: { ...value.parameters, templatePath: [...templatePath] },
  };
}
