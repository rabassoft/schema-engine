// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import type {
  ArrayNodeDefinition,
  BooleanFieldDefinition,
  CompileFormDefinitionInput,
  CompileFormResult,
  Diagnostic,
  FieldDefinition,
  FieldTemplate,
  FormDefinition,
  FormNodeDefinition,
  NumberFieldDefinition,
  ObjectItemTemplateDefinition,
  ObjectFieldDefinition,
  ObjectNodeTemplate,
  PresentationAccordionDefinition,
  PresentationEntryDefinition,
  PresentationGridDefinition,
  PresentationGridItemDefinition,
  PresentationPanelDefinition,
  PresentationSectionDefinition,
  PresentationTabsDefinition,
  StringFieldDefinition,
} from './contracts.js';
import { diagnostic, hasErrors } from './internal/diagnostics.js';
import { deepFreeze } from './internal/immutable.js';
import { createDefaultPresentation } from './internal/presentation-definition.js';
import {
  BOOLEAN_FIELD_KEYWORDS,
  COMPILER_SUPPORTED_KEYWORDS,
  KNOWN_DRAFT_2020_12_KEYWORDS,
  KNOWN_IGNORABLE_KEYWORDS,
  NUMBER_FIELD_KEYWORDS,
  REFERENCE_DIALECT,
  ROOT_SUPPORTED_KEYWORDS,
  STRING_FIELD_KEYWORDS,
} from './internal/keywords.js';
import {
  appendReferencePath,
  decodeSchemaReference,
  inspectDefinitionRegistry,
  referenceDiagnosticParameters,
  resolveSchemaReference,
  type InvalidSchemaReferenceReason,
  type ReferenceChain,
} from './internal/schema-reference.js';
import {
  actualType,
  describeActualValue,
  describeDeclaredDialect,
  isRecord,
} from './internal/value.js';

type FieldType = 'string' | 'number' | 'integer' | 'boolean';

interface RequiredEntry {
  readonly name: string;
  readonly index: number;
}

interface StringConstraints {
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly pattern?: string;
}

interface NumberConstraints {
  readonly minimum?: number;
  readonly maximum?: number;
  readonly multipleOf?: number;
}

type StringEnumState =
  | { readonly kind: 'absent' }
  | { readonly kind: 'valid'; readonly values: readonly string[] }
  | { readonly kind: 'schema-blocked' };

interface FieldCandidate {
  readonly name: string;
  readonly type: FieldType;
  readonly nullable: boolean;
  readonly required: boolean;
  readonly schemaTitle?: string;
  readonly schemaDescription?: string;
  readonly stringConstraints: StringConstraints;
  readonly numberConstraints: NumberConstraints;
  readonly stringEnum: StringEnumState;
  readonly dataPath: readonly string[];
  readonly documentPath: readonly (string | number)[];
  readonly templatePath?: readonly string[];
}

interface ObjectCandidate {
  readonly name: string;
  readonly type: 'object';
  readonly required: boolean;
  readonly schemaTitle?: string;
  readonly schemaDescription?: string;
  readonly dataPath: readonly string[];
  readonly documentPath: readonly (string | number)[];
  readonly children: NodeCandidate[];
  readonly templatePath?: readonly string[];
}

interface ArrayCandidate {
  readonly name: string;
  readonly type: 'array';
  readonly required: boolean;
  readonly schemaTitle?: string;
  readonly schemaDescription?: string;
  readonly dataPath: readonly string[];
  readonly documentPath: readonly (string | number)[];
  readonly identityProperty?: string;
  readonly policyIndex?: number;
  readonly children: NodeCandidate[];
}

type NodeCandidate = FieldCandidate | ObjectCandidate | ArrayCandidate;

interface ParsedFieldUi {
  readonly label?: string;
  readonly description?: string;
  readonly hint?: string;
  readonly tooltip?: string;
  readonly placeholder?: string;
  readonly decimalPlaces?: number;
  readonly showTrailingZeros?: boolean;
  readonly enumLabels?: ReadonlyMap<string, string>;
}

interface ParsedUiSchema {
  readonly order: readonly string[];
  readonly fields: ReadonlyMap<string, ParsedNodeUi>;
  presentation?: readonly ParsedPresentationEntry[];
}

type ParsedPresentationEntry =
  | { readonly kind: 'form-node'; readonly name: string }
  | {
      readonly kind: 'section';
      readonly id: string;
      readonly label: string;
      readonly children: readonly ParsedPresentationEntry[];
    }
  | {
      readonly kind: 'tabs';
      readonly id: string;
      readonly label: string;
      readonly panels: readonly ParsedPresentationPanel[];
    }
  | {
      readonly kind: 'accordion';
      readonly id: string;
      readonly label: string;
      readonly panels: readonly ParsedPresentationPanel[];
    }
  | {
      readonly kind: 'grid';
      readonly id: string;
      readonly label: string;
      readonly columns: 1 | 2 | 3 | 4;
      readonly items: readonly ParsedGridItem[];
    };

interface ParsedPresentationPanel {
  readonly id: string;
  readonly label: string;
  readonly children: readonly ParsedPresentationEntry[];
}

interface ParsedGridItem {
  readonly span: 1 | 2 | 3 | 4;
  readonly child: readonly ParsedPresentationEntry[];
}

interface ParsedObjectUi extends ParsedFieldUi {
  readonly order: readonly string[];
  readonly fields: ReadonlyMap<string, ParsedNodeUi>;
}

interface ParsedArrayUi extends ParsedFieldUi {
  item: ParsedUiSchema;
}

type ParsedNodeUi = ParsedFieldUi | ParsedObjectUi | ParsedArrayUi;

interface ParsedCollectionPolicy {
  readonly index: number;
  readonly path: readonly string[];
  readonly itemIdentityProperty: string;
}

interface ParsedCollectionPolicies {
  readonly valid: boolean;
  readonly policies: readonly ParsedCollectionPolicy[];
  readonly byPath: ReadonlyMap<string, ParsedCollectionPolicy>;
}

interface ReferenceContext {
  readonly rootSchema: Record<string, unknown>;
  readonly registryAvailable: boolean;
  readonly activeTargets: Map<string, readonly (string | number)[]>;
}

interface ResolvedUseSite {
  readonly kind: 'resolved';
  readonly schema: Record<string, unknown>;
  readonly documentPath: readonly (string | number)[];
  readonly referenceChain: ReferenceChain;
  readonly activatedTargets: readonly string[];
}

interface BlockedUseSite {
  readonly kind: 'blocked';
  readonly referenceChain: ReferenceChain;
  readonly activatedTargets: readonly string[];
}

type ResolvedUseSiteResult = ResolvedUseSite | BlockedUseSite;

const SUPPORTED_FIELD_TYPES = new Set<FieldType>([
  'string',
  'number',
  'integer',
  'boolean',
]);
const SUPPORTED_NODE_TYPES = new Set([
  ...SUPPORTED_FIELD_TYPES,
  'object',
  'array',
]);
const OBJECT_FIELD_KEYWORDS = new Set([
  'type',
  'properties',
  'required',
  'title',
  'description',
  'default',
]);
const ARRAY_FIELD_KEYWORDS = new Set([
  'type',
  'items',
  'title',
  'description',
  'default',
]);
const ITEM_ROOT_KEYWORDS = new Set(['type', 'properties', 'required']);

const UI_ROOT_KEYS = new Set(['order', 'fields', 'presentation']);
const UI_FIELD_KEYS = new Set([
  'label',
  'description',
  'hint',
  'tooltip',
  'placeholder',
  'enumLabels',
  'options',
]);
const UI_TEXT_KEYS = new Set([
  'label',
  'description',
  'hint',
  'tooltip',
  'placeholder',
]);
const UI_OPTION_KEYS = new Set(['decimalPlaces', 'showTrailingZeros']);

export function compileFormDefinition(
  input: CompileFormDefinitionInput,
): CompileFormResult {
  const diagnostics: Diagnostic[] = [];
  const rawInput: unknown = input;

  if (!isRecord(rawInput)) {
    diagnostics.push(
      diagnostic({
        code: 'INVALID_COMPILER_INPUT',
        severity: 'error',
        source: 'schema',
        parameters: describeActualValue(rawInput),
        fallbackMessage: 'Compiler input must be an object.',
      }),
    );
    return failedResult(diagnostics);
  }

  const rawSchema = rawInput.schema;
  const rawUiSchema = rawInput.uiSchema;
  const policyDiagnostics: Diagnostic[] = [];
  const collectionPolicies = inspectCollectionPolicies(
    rawInput,
    policyDiagnostics,
  );
  const usedPolicyIndices = new Set<number>();
  let candidates: NodeCandidate[] = [];
  let propertyNames: readonly string[] | undefined;
  let candidatesByName: ReadonlyMap<string, NodeCandidate> | undefined;

  if (!isRecord(rawSchema)) {
    diagnostics.push(
      diagnostic({
        code: 'ROOT_SCHEMA_MUST_BE_OBJECT',
        severity: 'error',
        source: 'schema',
        parameters: describeActualValue(rawSchema),
        fallbackMessage: 'The root schema must be an object.',
      }),
    );
    diagnostics.push(...policyDiagnostics);
  } else {
    const dialectValid = inspectDialect(rawSchema, diagnostics);
    diagnostics.push(...policyDiagnostics);
    if (dialectValid) {
      const registry = inspectDefinitionRegistry(rawSchema);
      for (const problem of registry.problems) {
        diagnostics.push(
          diagnostic({
            code: 'INVALID_SCHEMA_KEYWORD_VALUE',
            severity: 'error',
            source: 'schema',
            documentPath: problem.documentPath,
            parameters: {
              keyword: '$defs',
              ...(problem.definition === undefined
                ? {}
                : { definition: problem.definition }),
              expected: problem.expected,
              actualType: problem.actualType,
            },
            fallbackMessage: 'Schema keyword "$defs" has an invalid value.',
          }),
        );
      }
      inspectRootReference(rawSchema, diagnostics);
      const root = inspectRootSchema(rawSchema, diagnostics);
      propertyNames = root.propertyNames;

      if (root.canInspectFields && root.properties !== undefined) {
        candidates = inspectNodes(
          root.properties,
          root.requiredNames,
          diagnostics,
          rawSchema,
          collectionPolicies,
          usedPolicyIndices,
          {
            rootSchema: rawSchema,
            registryAvailable: registry.kind !== 'invalid-exterior',
            activeTargets: new Map(),
          },
        );
        candidatesByName = new Map(
          candidates.map((candidate) => [candidate.name, candidate] as const),
        );

        for (const entry of root.requiredEntries) {
          if (!Object.hasOwn(root.properties, entry.name)) {
            diagnostics.push(
              diagnostic({
                code: 'UNMANAGED_REQUIRED_PROPERTY',
                severity: 'warning',
                source: 'schema',
                dataPath: [entry.name],
                documentPath: ['required', entry.index],
                parameters: { field: entry.name },
                fallbackMessage: `Required property "${entry.name}" is not managed by this form.`,
              }),
            );
          }
        }
      }
    }
  }

  if (collectionPolicies.valid) {
    for (const policy of collectionPolicies.policies) {
      if (!usedPolicyIndices.has(policy.index)) {
        diagnostics.push(
          diagnostic({
            code: 'UNUSED_COLLECTION_POLICY',
            severity: 'error',
            source: 'schema',
            parameters: { policyIndex: policy.index, arrayPath: policy.path },
            fallbackMessage:
              'Collection policy does not target a supported array.',
          }),
        );
      }
    }
  }

  const nested = candidates.some(
    (candidate) =>
      candidate.type !== 'string' &&
      candidate.type !== 'number' &&
      candidate.type !== 'integer' &&
      candidate.type !== 'boolean',
  );
  const parsedUi = nested
    ? inspectNestedUiSchema(rawUiSchema, candidates, diagnostics)
    : inspectUiSchema(
        rawUiSchema,
        propertyNames,
        candidatesByName as ReadonlyMap<string, FieldCandidate> | undefined,
        diagnostics,
      );

  if (hasErrors(diagnostics)) {
    return failedResult(diagnostics);
  }

  const definition = nested
    ? buildNestedDefinition(candidates, parsedUi)
    : buildDefinition(candidates as FieldCandidate[], parsedUi);
  return deepFreeze({
    success: true,
    definition,
    diagnostics,
  });
}

function inspectCollectionPolicies(
  input: Record<string, unknown>,
  diagnostics: Diagnostic[],
): ParsedCollectionPolicies {
  const member = ownDataValue(input, 'collectionPolicies');
  if (!member.present) {
    return { valid: true, policies: [], byPath: new Map() };
  }
  if (member.accessor || !Array.isArray(member.value)) {
    diagnostics.push(
      invalidCollectionPolicy({
        reason: 'policies-not-array',
        expected: 'array',
        ...(member.accessor ? {} : { actualType: actualType(member.value) }),
      }),
    );
    return { valid: false, policies: [], byPath: new Map() };
  }

  const policies: ParsedCollectionPolicy[] = [];
  const byPath = new Map<string, ParsedCollectionPolicy>();
  for (let index = 0; index < member.value.length; index += 1) {
    const entry = ownDataValue(member.value, index);
    if (!entry.present) {
      diagnostics.push(
        invalidCollectionPolicy({
          reason: 'sparse-policy',
          policyIndex: index,
          expected: 'collection policy object',
        }),
      );
      return { valid: false, policies: [], byPath: new Map() };
    }
    if (entry.accessor) {
      diagnostics.push(
        invalidCollectionPolicy({
          reason: 'policy-index-accessor',
          policyIndex: index,
          expected: 'collection policy object',
        }),
      );
      return { valid: false, policies: [], byPath: new Map() };
    }
    if (!isOrdinaryRecord(entry.value)) {
      diagnostics.push(
        invalidCollectionPolicy({
          reason: 'policy-not-object',
          policyIndex: index,
          expected: 'collection policy object',
          actualType: actualType(entry.value),
        }),
      );
      return { valid: false, policies: [], byPath: new Map() };
    }

    const pathMember = ownDataValue(entry.value, 'path');
    const path = inspectPolicyPath(pathMember);
    if (path === undefined) {
      diagnostics.push(
        invalidCollectionPolicy({
          reason: !pathMember.present
            ? 'member-missing'
            : pathMember.accessor
              ? 'member-accessor'
              : 'invalid-path',
          policyIndex: index,
          member: 'path',
          expected: 'non-empty string-only path',
          ...(!pathMember.present || pathMember.accessor
            ? {}
            : { actualType: actualType(pathMember.value) }),
        }),
      );
      return { valid: false, policies: [], byPath: new Map() };
    }

    const identityMember = ownDataValue(entry.value, 'itemIdentityProperty');
    if (
      !identityMember.present ||
      identityMember.accessor ||
      typeof identityMember.value !== 'string'
    ) {
      diagnostics.push(
        invalidCollectionPolicy({
          reason: !identityMember.present
            ? 'member-missing'
            : identityMember.accessor
              ? 'member-accessor'
              : 'invalid-identity-property',
          policyIndex: index,
          member: 'itemIdentityProperty',
          expected: 'string',
          ...(!identityMember.present || identityMember.accessor
            ? {}
            : { actualType: actualType(identityMember.value) }),
        }),
      );
      return { valid: false, policies: [], byPath: new Map() };
    }

    const key = JSON.stringify(path);
    const first = byPath.get(key);
    if (first !== undefined) {
      diagnostics.push(
        invalidCollectionPolicy({
          reason: 'duplicate-array-path',
          policyIndex: index,
          expected: 'non-empty string-only path',
          firstPolicyIndex: first.index,
        }),
      );
      return { valid: false, policies: [], byPath: new Map() };
    }
    const policy = Object.freeze({
      index,
      path,
      itemIdentityProperty: identityMember.value,
    });
    policies.push(policy);
    byPath.set(key, policy);
  }
  return {
    valid: true,
    policies: Object.freeze(policies),
    byPath,
  };
}

function inspectPolicyPath(member: OwnValue): readonly string[] | undefined {
  if (!member.present || member.accessor || !Array.isArray(member.value)) {
    return undefined;
  }
  if (member.value.length === 0) return undefined;
  const path: string[] = [];
  for (let index = 0; index < member.value.length; index += 1) {
    const segment = ownDataValue(member.value, index);
    if (
      !segment.present ||
      segment.accessor ||
      typeof segment.value !== 'string'
    ) {
      return undefined;
    }
    path.push(segment.value);
  }
  return Object.freeze(path);
}

function invalidCollectionPolicy(
  parameters: Readonly<Record<string, unknown>>,
): Diagnostic {
  return diagnostic({
    code: 'INVALID_COLLECTION_POLICY',
    severity: 'error',
    source: 'schema',
    parameters,
    fallbackMessage: 'Collection policy configuration is invalid.',
  });
}

function failedResult(diagnostics: Diagnostic[]): CompileFormResult {
  return deepFreeze({ success: false, diagnostics });
}

function inspectDialect(
  schema: Record<string, unknown>,
  diagnostics: Diagnostic[],
): boolean {
  if (!Object.hasOwn(schema, '$schema')) {
    diagnostics.push(
      diagnostic({
        code: 'MISSING_SCHEMA_DIALECT',
        severity: 'warning',
        source: 'schema',
        documentPath: ['$schema'],
        parameters: { assumedDialect: REFERENCE_DIALECT },
        fallbackMessage: `Schema dialect is missing; assuming ${REFERENCE_DIALECT}.`,
      }),
    );
    return true;
  }

  const dialectDescriptor = Object.getOwnPropertyDescriptor(schema, '$schema');
  if (dialectDescriptor === undefined || !('value' in dialectDescriptor)) {
    diagnostics.push(
      diagnostic({
        code: 'INVALID_SCHEMA_DIALECT',
        severity: 'error',
        source: 'schema',
        documentPath: ['$schema'],
        parameters: { declaredDialect: { type: 'accessor' } },
        fallbackMessage: 'The declared schema dialect must be an absolute URI.',
      }),
    );
    return false;
  }
  const declaredDialect: unknown = dialectDescriptor.value;
  if (
    typeof declaredDialect !== 'string' ||
    !/^[A-Za-z][A-Za-z\d+.-]*:/.test(declaredDialect)
  ) {
    diagnostics.push(
      diagnostic({
        code: 'INVALID_SCHEMA_DIALECT',
        severity: 'error',
        source: 'schema',
        documentPath: ['$schema'],
        parameters: {
          declaredDialect: describeDeclaredDialect(declaredDialect),
        },
        fallbackMessage: 'The declared schema dialect must be an absolute URI.',
      }),
    );
    return false;
  }

  if (declaredDialect !== REFERENCE_DIALECT) {
    diagnostics.push(
      diagnostic({
        code: 'UNSUPPORTED_SCHEMA_DIALECT',
        severity: 'error',
        source: 'schema',
        documentPath: ['$schema'],
        parameters: {
          declaredDialect,
          supportedDialect: REFERENCE_DIALECT,
        },
        fallbackMessage: `Schema dialect "${declaredDialect}" is not supported.`,
      }),
    );
    return false;
  }

  return true;
}

function inspectRootReference(
  schema: Record<string, unknown>,
  diagnostics: Diagnostic[],
): void {
  const descriptor = Object.getOwnPropertyDescriptor(schema, '$ref');
  if (descriptor === undefined) return;
  const referencePath = ['$ref'] as const;
  const referenceChain = appendReferencePath([], referencePath);
  const reference =
    'value' in descriptor && typeof descriptor.value === 'string'
      ? descriptor.value
      : undefined;
  diagnostics.push(
    diagnostic({
      code: 'INVALID_SCHEMA_REFERENCE',
      severity: 'error',
      source: 'schema',
      documentPath: referencePath,
      parameters: referenceDiagnosticParameters(
        {
          reason: 'root-reference-not-supported',
          ...(reference === undefined ? {} : { reference }),
        },
        { referenceChain },
      ),
      fallbackMessage: 'Schema reference is invalid.',
    }),
  );
}

function resolveUseSiteSchema(
  schema: Record<string, unknown>,
  dataPath: readonly string[],
  documentPath: readonly (string | number)[],
  inheritedChain: ReferenceChain,
  diagnostics: Diagnostic[],
  context: ReferenceContext,
  templatePath?: readonly string[],
): ResolvedUseSiteResult {
  let currentSchema = schema;
  let currentDocumentPath = documentPath;
  let referenceChain = inheritedChain;
  const activatedTargets: string[] = [];

  while (true) {
    const descriptor = Object.getOwnPropertyDescriptor(currentSchema, '$ref');
    if (descriptor === undefined) {
      return {
        kind: 'resolved',
        schema: currentSchema,
        documentPath: currentDocumentPath,
        referenceChain,
        activatedTargets,
      };
    }

    const referencePath = [...currentDocumentPath, '$ref'];
    referenceChain = appendReferencePath(referenceChain, referencePath);
    let reference: string | undefined;
    let invalidReason: InvalidSchemaReferenceReason | undefined;
    let decoded: ReturnType<typeof decodeSchemaReference> | undefined;
    if (!('value' in descriptor)) {
      invalidReason = 'accessor-reference';
    } else if (typeof descriptor.value !== 'string') {
      invalidReason = 'non-string-reference';
    } else {
      reference = descriptor.value;
      decoded = decodeSchemaReference(reference);
      invalidReason = decoded.kind === 'invalid' ? decoded.reason : undefined;
    }

    if (invalidReason !== undefined) {
      pushReferenceDiagnostic(
        diagnostics,
        diagnostic({
          code: 'INVALID_SCHEMA_REFERENCE',
          severity: 'error',
          source: 'schema',
          dataPath,
          documentPath: referencePath,
          parameters: referenceDiagnosticParameters(
            {
              reason: invalidReason,
              ...(reference === undefined ? {} : { reference }),
            },
            { referenceChain },
          ),
          fallbackMessage: 'Schema reference is invalid.',
        }),
        templatePath,
      );
    }

    const compatible = inspectReferenceSiblings(
      currentSchema,
      dataPath,
      currentDocumentPath,
      referenceChain,
      diagnostics,
      templatePath,
    );
    if (
      invalidReason !== undefined ||
      !compatible ||
      !context.registryAvailable ||
      decoded?.kind !== 'decoded' ||
      reference === undefined
    ) {
      return { kind: 'blocked', referenceChain, activatedTargets };
    }

    const resolution = resolveSchemaReference(
      context.rootSchema,
      decoded.tokens,
      referenceChain,
    );
    if (resolution.kind === 'invalid') {
      pushReferenceDiagnostic(
        diagnostics,
        diagnostic({
          code: 'INVALID_SCHEMA_REFERENCE',
          severity: 'error',
          source: 'schema',
          dataPath,
          documentPath: referencePath,
          parameters: referenceDiagnosticParameters(
            { reason: resolution.reason, reference },
            { referenceChain },
          ),
          fallbackMessage: 'Schema reference is invalid.',
        }),
        templatePath,
      );
      return { kind: 'blocked', referenceChain, activatedTargets };
    }
    if (resolution.kind === 'unresolved') {
      pushReferenceDiagnostic(
        diagnostics,
        diagnostic({
          code: 'UNRESOLVED_SCHEMA_REFERENCE',
          severity: 'error',
          source: 'schema',
          dataPath,
          documentPath: referencePath,
          parameters: referenceDiagnosticParameters(
            { reason: resolution.reason, reference },
            {
              targetDocumentPath: resolution.targetDocumentPath,
              referenceChain,
            },
          ),
          fallbackMessage: 'Schema reference target could not be resolved.',
        }),
        templatePath,
      );
      return { kind: 'blocked', referenceChain, activatedTargets };
    }

    const targetPath = resolution.cursor.documentPath;
    const targetKey = JSON.stringify(targetPath);
    const firstDocumentPath = context.activeTargets.get(targetKey);
    if (firstDocumentPath !== undefined) {
      pushReferenceDiagnostic(
        diagnostics,
        diagnostic({
          code: 'CYCLIC_SCHEMA_REFERENCE',
          severity: 'error',
          source: 'schema',
          dataPath,
          documentPath: referencePath,
          parameters: referenceDiagnosticParameters(
            {},
            { firstDocumentPath, referenceChain },
          ),
          fallbackMessage: 'Schema reference cycle detected.',
        }),
        templatePath,
      );
      return { kind: 'blocked', referenceChain, activatedTargets };
    }

    context.activeTargets.set(targetKey, targetPath);
    activatedTargets.push(targetKey);
    currentSchema = resolution.cursor.schema;
    currentDocumentPath = resolution.cursor.documentPath;
  }
}

function inspectReferenceSiblings(
  schema: Record<string, unknown>,
  dataPath: readonly string[],
  documentPath: readonly (string | number)[],
  referenceChain: ReferenceChain,
  diagnostics: Diagnostic[],
  templatePath?: readonly string[],
): boolean {
  let compatible = true;
  for (const keyword of Object.keys(schema)) {
    if (keyword === '$ref') continue;
    const keywordPath = [...documentPath, keyword];
    let value: Diagnostic;
    if (KNOWN_IGNORABLE_KEYWORDS.has(keyword)) {
      value = schemaKeywordDiagnostic(
        'IGNORED_SCHEMA_KEYWORD',
        'warning',
        keyword,
        keywordPath,
        `Known annotation "${keyword}" is ignored by the compiler.`,
        dataPath,
      );
    } else if (KNOWN_DRAFT_2020_12_KEYWORDS.has(keyword)) {
      compatible = false;
      value = diagnostic({
        code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
        severity: 'error',
        source: 'schema',
        dataPath,
        documentPath: keywordPath,
        parameters: { keyword, fieldType: 'reference' },
        fallbackMessage: `Schema keyword "${keyword}" is incompatible with field type "reference".`,
      });
    } else {
      value = schemaKeywordDiagnostic(
        'UNKNOWN_SCHEMA_KEYWORD',
        'warning',
        keyword,
        keywordPath,
        `Unknown schema keyword "${keyword}" is treated as an annotation.`,
        dataPath,
      );
    }
    pushReferenceDiagnostic(
      diagnostics,
      {
        ...value,
        parameters: referenceDiagnosticParameters(value.parameters, {
          referenceChain,
        }),
      },
      templatePath,
    );
  }
  return compatible;
}

function pushReferenceDiagnostic(
  diagnostics: Diagnostic[],
  value: Diagnostic,
  templatePath?: readonly string[],
): void {
  diagnostics.push(
    templatePath === undefined ? value : withTemplatePath(value, templatePath),
  );
}

function releaseReferenceTargets(
  context: ReferenceContext,
  activatedTargets: readonly string[],
): void {
  for (let index = activatedTargets.length - 1; index >= 0; index -= 1) {
    context.activeTargets.delete(activatedTargets[index] as string);
  }
}

function addReferenceChainToRange(
  diagnostics: Diagnostic[],
  start: number,
  referenceChain: ReferenceChain,
): void {
  if (referenceChain.length === 0) return;
  for (let index = start; index < diagnostics.length; index += 1) {
    const current = diagnostics[index];
    if (
      current === undefined ||
      Object.hasOwn(current.parameters, 'referenceChain')
    ) {
      continue;
    }
    diagnostics[index] = {
      ...current,
      parameters: referenceDiagnosticParameters(current.parameters, {
        referenceChain,
      }),
    };
  }
}

function inspectRootSchema(
  schema: Record<string, unknown>,
  diagnostics: Diagnostic[],
): {
  readonly canInspectFields: boolean;
  readonly properties?: Record<string, unknown>;
  readonly propertyNames?: readonly string[];
  readonly requiredEntries: readonly RequiredEntry[];
  readonly requiredNames: ReadonlySet<string>;
} {
  let rootTypeValid = false;
  let properties: Record<string, unknown> | undefined;
  const requiredEntries: RequiredEntry[] = [];
  const requiredNames = new Set<string>();

  for (const keyword of Object.keys(schema)) {
    if (keyword === '$schema') {
      continue;
    }

    const descriptor = Object.getOwnPropertyDescriptor(schema, keyword);
    const value: unknown =
      descriptor !== undefined && 'value' in descriptor
        ? descriptor.value
        : ACCESSOR_VALUE;
    inspectRootKeyword(keyword, value, diagnostics);

    if (keyword === 'type') {
      rootTypeValid = value === 'object';
      if (!rootTypeValid) {
        diagnostics.push(
          diagnostic({
            code: 'ROOT_TYPE_MUST_BE_OBJECT',
            severity: 'error',
            source: 'schema',
            documentPath: ['type'],
            parameters:
              value === ACCESSOR_VALUE
                ? { actualType: 'accessor' }
                : describeActualValue(value),
            fallbackMessage: 'The root schema type must be "object".',
          }),
        );
      }
    } else if (keyword === 'properties') {
      if (isOrdinaryRecord(value)) {
        properties = value;
      } else {
        diagnostics.push(
          diagnostic({
            code: 'INVALID_SCHEMA_PROPERTIES',
            severity: 'error',
            source: 'schema',
            documentPath: ['properties'],
            parameters: {
              actualType:
                value === ACCESSOR_VALUE ? 'accessor' : actualType(value),
            },
            fallbackMessage: 'Schema properties must be an object.',
          }),
        );
      }
    } else if (keyword === 'required') {
      inspectRequired(value, requiredEntries, requiredNames, diagnostics);
    } else if (keyword === 'title' || keyword === 'description') {
      if (typeof value !== 'string') {
        diagnostics.push(
          value === ACCESSOR_VALUE
            ? invalidSchemaKeywordDescriptor(
                keyword,
                'string',
                [keyword],
                [],
                'accessor',
              )
            : invalidSchemaKeywordValue(keyword, value, 'string', [keyword]),
        );
      }
    }
  }

  if (!Object.hasOwn(schema, 'type')) {
    diagnostics.push(
      diagnostic({
        code: 'ROOT_TYPE_MUST_BE_OBJECT',
        severity: 'error',
        source: 'schema',
        documentPath: ['type'],
        parameters: { actualType: 'undefined' },
        fallbackMessage: 'The root schema must declare type "object".',
      }),
    );
  }

  if (!Object.hasOwn(schema, 'properties')) {
    diagnostics.push(
      diagnostic({
        code: 'MISSING_SCHEMA_PROPERTIES',
        severity: 'error',
        source: 'schema',
        documentPath: ['properties'],
        parameters: {},
        fallbackMessage: 'The root schema must declare properties.',
      }),
    );
  }

  return {
    canInspectFields: rootTypeValid && properties !== undefined,
    ...(properties === undefined
      ? {}
      : { properties, propertyNames: Object.keys(properties) }),
    requiredEntries,
    requiredNames,
  };
}

function inspectRootKeyword(
  keyword: string,
  value: unknown,
  diagnostics: Diagnostic[],
): void {
  if (ROOT_SUPPORTED_KEYWORDS.has(keyword)) {
    return;
  }

  if (keyword === 'items') {
    diagnostics.push(
      diagnostic({
        code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
        severity: 'error',
        source: 'schema',
        documentPath: [keyword],
        parameters: { keyword, fieldType: 'object' },
        fallbackMessage: `Schema keyword "${keyword}" is incompatible with field type "object".`,
      }),
    );
    return;
  }

  if (KNOWN_IGNORABLE_KEYWORDS.has(keyword)) {
    diagnostics.push(
      schemaKeywordDiagnostic(
        'IGNORED_SCHEMA_KEYWORD',
        'warning',
        keyword,
        [keyword],
        `Known annotation "${keyword}" is ignored by the compiler.`,
      ),
    );
  } else if (KNOWN_DRAFT_2020_12_KEYWORDS.has(keyword)) {
    diagnostics.push(
      schemaKeywordDiagnostic(
        'UNSUPPORTED_SCHEMA_KEYWORD',
        'error',
        keyword,
        [keyword],
        `Schema keyword "${keyword}" is not supported.`,
      ),
    );
  } else {
    void value;
    diagnostics.push(
      schemaKeywordDiagnostic(
        'UNKNOWN_SCHEMA_KEYWORD',
        'warning',
        keyword,
        [keyword],
        `Unknown schema keyword "${keyword}" is treated as an annotation.`,
      ),
    );
  }
}

function inspectRequired(
  value: unknown,
  entries: RequiredEntry[],
  names: Set<string>,
  diagnostics: Diagnostic[],
): void {
  if (!Array.isArray(value)) {
    diagnostics.push(
      invalidSchemaKeywordValue('required', value, 'array of unique strings', [
        'required',
      ]),
    );
    return;
  }

  for (let index = 0; index < value.length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, index);
    const entry: unknown =
      descriptor !== undefined && 'value' in descriptor
        ? descriptor.value
        : ACCESSOR_VALUE;
    if (typeof entry !== 'string') {
      diagnostics.push(
        entry === ACCESSOR_VALUE
          ? invalidSchemaKeywordDescriptor(
              'required',
              'string',
              ['required', index],
              [],
              descriptor === undefined ? 'missing' : 'accessor',
            )
          : invalidSchemaKeywordValue('required', entry, 'string', [
              'required',
              index,
            ]),
      );
      continue;
    }

    if (names.has(entry)) {
      diagnostics.push(
        invalidSchemaKeywordValue('required', entry, 'unique string', [
          'required',
          index,
        ]),
      );
      continue;
    }

    names.add(entry);
    entries.push({ name: entry, index });
  }
}

function inspectRequiredAtPath(
  value: unknown,
  entries: RequiredEntry[],
  names: Set<string>,
  diagnostics: Diagnostic[],
  dataPath: readonly string[],
  documentPath: readonly (string | number)[],
): void {
  if (!Array.isArray(value)) {
    diagnostics.push(
      invalidSchemaKeywordValue(
        'required',
        value,
        'array of unique strings',
        documentPath,
        dataPath,
      ),
    );
    return;
  }
  for (let index = 0; index < value.length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, index);
    const entry: unknown =
      descriptor !== undefined && 'value' in descriptor
        ? descriptor.value
        : ACCESSOR_VALUE;
    if (typeof entry !== 'string') {
      diagnostics.push(
        entry === ACCESSOR_VALUE
          ? invalidSchemaKeywordDescriptor(
              'required',
              'string',
              [...documentPath, index],
              dataPath,
              descriptor === undefined ? 'missing' : 'accessor',
            )
          : invalidSchemaKeywordValue(
              'required',
              entry,
              'string',
              [...documentPath, index],
              dataPath,
            ),
      );
      continue;
    }
    if (names.has(entry)) {
      diagnostics.push(
        invalidSchemaKeywordValue(
          'required',
          entry,
          'unique string',
          [...documentPath, index],
          dataPath,
        ),
      );
      continue;
    }
    names.add(entry);
    entries.push({ name: entry, index });
  }
}

function inspectNodes(
  properties: Record<string, unknown>,
  requiredNames: ReadonlySet<string>,
  diagnostics: Diagnostic[],
  rootSchema: Record<string, unknown>,
  collectionPolicies: ParsedCollectionPolicies,
  usedPolicyIndices: Set<number>,
  referenceContext: ReferenceContext,
): NodeCandidate[] {
  const candidates: NodeCandidate[] = [];
  type Frame =
    | {
        readonly kind: 'exit';
        readonly schema: Record<string, unknown>;
        readonly previousDocumentPath?: readonly (string | number)[];
        readonly diagnosticStart: number;
        readonly referenceChain: ReferenceChain;
        readonly activatedTargets: readonly string[];
      }
    | {
        readonly kind: 'node';
        readonly name: string;
        readonly schemaValue: unknown;
        readonly required: boolean;
        readonly dataPath: readonly string[];
        readonly documentPath: readonly (string | number)[];
        readonly output: NodeCandidate[];
        readonly referenceChain: ReferenceChain;
      };
  const active = new Map<object, readonly (string | number)[]>([
    [rootSchema, []],
  ]);
  const stack: Frame[] = [];
  const rootNames = Object.keys(properties);
  for (let index = rootNames.length - 1; index >= 0; index -= 1) {
    const name = rootNames[index] as string;
    const descriptor = Object.getOwnPropertyDescriptor(properties, name);
    stack.push({
      kind: 'node',
      name,
      schemaValue:
        descriptor !== undefined && 'value' in descriptor
          ? descriptor.value
          : ACCESSOR_VALUE,
      required: requiredNames.has(name),
      dataPath: [name],
      documentPath: ['properties', name],
      output: candidates,
      referenceChain: [],
    });
  }

  while (stack.length > 0) {
    const frame = stack.pop();
    if (frame === undefined) {
      break;
    }
    if (frame.kind === 'exit') {
      if (frame.previousDocumentPath === undefined) active.delete(frame.schema);
      else active.set(frame.schema, frame.previousDocumentPath);
      releaseReferenceTargets(referenceContext, frame.activatedTargets);
      addReferenceChainToRange(
        diagnostics,
        frame.diagnosticStart,
        frame.referenceChain,
      );
      continue;
    }

    const {
      name,
      schemaValue: rawField,
      required,
      dataPath,
      documentPath: fieldPath,
      output,
      referenceChain: inheritedChain,
    } = frame;
    const diagnosticStart = diagnostics.length;

    if (rawField === ACCESSOR_VALUE || !isOrdinaryRecord(rawField)) {
      diagnostics.push(
        diagnostic({
          code: 'INVALID_FIELD_SCHEMA',
          severity: 'error',
          source: 'schema',
          dataPath,
          documentPath: fieldPath,
          parameters: {
            field: name,
            actualType:
              rawField === ACCESSOR_VALUE ? 'accessor' : actualType(rawField),
          },
          fallbackMessage: `Schema for field "${name}" must be an object.`,
        }),
      );
      continue;
    }

    const resolved = resolveUseSiteSchema(
      rawField,
      dataPath,
      fieldPath,
      inheritedChain,
      diagnostics,
      referenceContext,
    );
    if (resolved.kind === 'blocked') {
      releaseReferenceTargets(referenceContext, resolved.activatedTargets);
      addReferenceChainToRange(
        diagnostics,
        diagnosticStart,
        resolved.referenceChain,
      );
      continue;
    }
    const field = resolved.schema;
    const resolvedFieldPath = resolved.documentPath;

    if (!Object.hasOwn(field, 'type')) {
      diagnostics.push(
        diagnostic({
          code: 'MISSING_FIELD_TYPE',
          severity: 'error',
          source: 'schema',
          dataPath,
          documentPath: [...resolvedFieldPath, 'type'],
          parameters: { field: name },
          fallbackMessage: `Field "${name}" must declare a type.`,
        }),
      );
      releaseReferenceTargets(referenceContext, resolved.activatedTargets);
      addReferenceChainToRange(
        diagnostics,
        diagnosticStart,
        resolved.referenceChain,
      );
      continue;
    }

    const typeDescriptor = Object.getOwnPropertyDescriptor(field, 'type');
    const rawType: unknown =
      typeDescriptor !== undefined && 'value' in typeDescriptor
        ? typeDescriptor.value
        : ACCESSOR_VALUE;
    if (Array.isArray(rawType) && !isNullableContainerTypeArray(rawType)) {
      const nullableType = inspectNullableTypeArray(
        name,
        rawType,
        dataPath,
        resolvedFieldPath,
        diagnostics,
      );
      if (nullableType !== undefined) {
        output.push(
          inspectValidField(
            name,
            nullableType,
            true,
            field,
            required,
            diagnostics,
            dataPath,
            resolvedFieldPath,
          ),
        );
      }
      releaseReferenceTargets(referenceContext, resolved.activatedTargets);
      addReferenceChainToRange(
        diagnostics,
        diagnosticStart,
        resolved.referenceChain,
      );
      continue;
    }
    if (typeof rawType !== 'string' || !SUPPORTED_NODE_TYPES.has(rawType)) {
      diagnostics.push(
        diagnostic({
          code: 'UNSUPPORTED_FIELD_TYPE',
          severity: 'error',
          source: 'schema',
          dataPath,
          documentPath: [...resolvedFieldPath, 'type'],
          parameters: {
            field: name,
            ...(rawType === ACCESSOR_VALUE
              ? { actualType: 'accessor' }
              : describeActualValue(rawType)),
          },
          fallbackMessage: `Field "${name}" has an unsupported type.`,
        }),
      );
      releaseReferenceTargets(referenceContext, resolved.activatedTargets);
      addReferenceChainToRange(
        diagnostics,
        diagnosticStart,
        resolved.referenceChain,
      );
      continue;
    }

    if (SUPPORTED_FIELD_TYPES.has(rawType as FieldType)) {
      output.push(
        inspectValidField(
          name,
          rawType as FieldType,
          false,
          field,
          required,
          diagnostics,
          dataPath,
          resolvedFieldPath,
        ),
      );
      releaseReferenceTargets(referenceContext, resolved.activatedTargets);
      addReferenceChainToRange(
        diagnostics,
        diagnosticStart,
        resolved.referenceChain,
      );
      continue;
    }

    const firstDocumentPath = active.get(field);
    if (
      firstDocumentPath !== undefined &&
      resolved.activatedTargets.length === 0
    ) {
      diagnostics.push(
        diagnostic({
          code: 'CYCLIC_SCHEMA_OBJECT',
          severity: 'error',
          source: 'schema',
          dataPath,
          documentPath: resolvedFieldPath,
          parameters: { firstDocumentPath: [...firstDocumentPath] },
          fallbackMessage: 'Schema object cycle detected.',
        }),
      );
      releaseReferenceTargets(referenceContext, resolved.activatedTargets);
      addReferenceChainToRange(
        diagnostics,
        diagnosticStart,
        resolved.referenceChain,
      );
      continue;
    }

    if (rawType === 'array') {
      active.set(field, resolvedFieldPath);
      const array = inspectArrayCandidate(
        name,
        field,
        required,
        dataPath,
        resolvedFieldPath,
        diagnostics,
        active,
        collectionPolicies,
        usedPolicyIndices,
        referenceContext,
        resolved.referenceChain,
      );
      if (firstDocumentPath === undefined) active.delete(field);
      else active.set(field, firstDocumentPath);
      if (array !== undefined) output.push(array);
      releaseReferenceTargets(referenceContext, resolved.activatedTargets);
      addReferenceChainToRange(
        diagnostics,
        diagnosticStart,
        resolved.referenceChain,
      );
      continue;
    }

    const object = inspectObjectCandidate(
      name,
      field,
      required,
      dataPath,
      resolvedFieldPath,
      diagnostics,
    );
    if (object === undefined) {
      releaseReferenceTargets(referenceContext, resolved.activatedTargets);
      addReferenceChainToRange(
        diagnostics,
        diagnosticStart,
        resolved.referenceChain,
      );
      continue;
    }
    output.push(object.candidate);
    active.set(field, resolvedFieldPath);
    stack.push({
      kind: 'exit',
      schema: field,
      ...(firstDocumentPath === undefined
        ? {}
        : { previousDocumentPath: firstDocumentPath }),
      diagnosticStart,
      referenceChain: resolved.referenceChain,
      activatedTargets: resolved.activatedTargets,
    });
    const childNames = Object.keys(object.properties);
    for (let index = childNames.length - 1; index >= 0; index -= 1) {
      const childName = childNames[index] as string;
      const descriptor = Object.getOwnPropertyDescriptor(
        object.properties,
        childName,
      );
      stack.push({
        kind: 'node',
        name: childName,
        schemaValue:
          descriptor !== undefined && 'value' in descriptor
            ? descriptor.value
            : ACCESSOR_VALUE,
        required: object.requiredNames.has(childName),
        dataPath: [...dataPath, childName],
        documentPath: [...resolvedFieldPath, 'properties', childName],
        output: object.candidate.children,
        referenceChain: resolved.referenceChain,
      });
    }
  }

  return candidates;
}

function inspectArrayCandidate(
  name: string,
  schema: Record<string, unknown>,
  required: boolean,
  dataPath: readonly string[],
  documentPath: readonly (string | number)[],
  diagnostics: Diagnostic[],
  active: Map<object, readonly (string | number)[]>,
  collectionPolicies: ParsedCollectionPolicies,
  usedPolicyIndices: Set<number>,
  referenceContext: ReferenceContext,
  referenceChain: ReferenceChain,
): ArrayCandidate | undefined {
  let schemaTitle: string | undefined;
  let schemaDescription: string | undefined;
  const policy = collectionPolicies.valid
    ? collectionPolicies.byPath.get(JSON.stringify(dataPath))
    : undefined;
  if (policy !== undefined) usedPolicyIndices.add(policy.index);
  for (const keyword of Object.keys(schema)) {
    const keywordPath = [...documentPath, keyword];
    if (!ARRAY_FIELD_KEYWORDS.has(keyword)) {
      if (KNOWN_IGNORABLE_KEYWORDS.has(keyword)) {
        diagnostics.push(
          schemaKeywordDiagnostic(
            'IGNORED_SCHEMA_KEYWORD',
            'warning',
            keyword,
            keywordPath,
            `Known annotation "${keyword}" is ignored by the compiler.`,
            dataPath,
          ),
        );
      } else if (
        keyword !== '$schema' &&
        (COMPILER_SUPPORTED_KEYWORDS.has(keyword) || keyword === 'items')
      ) {
        diagnostics.push(
          diagnostic({
            code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
            severity: 'error',
            source: 'schema',
            dataPath,
            documentPath: keywordPath,
            parameters: { keyword, fieldType: 'array' },
            fallbackMessage: `Schema keyword "${keyword}" is incompatible with field type "array".`,
          }),
        );
      } else if (KNOWN_DRAFT_2020_12_KEYWORDS.has(keyword)) {
        diagnostics.push(
          schemaKeywordDiagnostic(
            'UNSUPPORTED_SCHEMA_KEYWORD',
            'error',
            keyword,
            keywordPath,
            `Schema keyword "${keyword}" is not supported.`,
            dataPath,
          ),
        );
      } else {
        diagnostics.push(
          schemaKeywordDiagnostic(
            'UNKNOWN_SCHEMA_KEYWORD',
            'warning',
            keyword,
            keywordPath,
            `Unknown schema keyword "${keyword}" is treated as an annotation.`,
            dataPath,
          ),
        );
      }
      continue;
    }
    if (keyword !== 'title' && keyword !== 'description') continue;
    const member = ownDataValue(schema, keyword);
    if (!member.present) continue;
    const expected = keyword === 'title' ? 'non-blank string' : 'string';
    if (
      member.accessor ||
      typeof member.value !== 'string' ||
      (keyword === 'title' && member.value.trim().length === 0)
    ) {
      diagnostics.push(
        member.accessor
          ? invalidSchemaKeywordDescriptor(
              keyword,
              expected,
              keywordPath,
              dataPath,
              'accessor',
            )
          : invalidSchemaKeywordValue(
              keyword,
              member.value,
              expected,
              keywordPath,
              dataPath,
            ),
      );
    } else if (keyword === 'title') schemaTitle = member.value;
    else schemaDescription = member.value;
  }

  const itemsPath = [...documentPath, 'items'];
  const itemsMember = ownDataValue(schema, 'items');
  if (
    !itemsMember.present ||
    itemsMember.accessor ||
    !isOrdinaryRecord(itemsMember.value)
  ) {
    diagnostics.push(
      !itemsMember.present || itemsMember.accessor
        ? invalidSchemaKeywordDescriptor(
            'items',
            'inline object item schema',
            itemsPath,
            dataPath,
            !itemsMember.present ? 'missing' : 'accessor',
          )
        : invalidSchemaKeywordValue(
            'items',
            itemsMember.value,
            'inline object item schema',
            itemsPath,
            dataPath,
          ),
    );
    if (collectionPolicies.valid && policy === undefined) {
      diagnostics.push(
        diagnostic({
          code: 'MISSING_COLLECTION_POLICY',
          severity: 'error',
          source: 'schema',
          dataPath,
          parameters: { arrayPath: [...dataPath] },
          fallbackMessage: 'Collection policy is required.',
        }),
      );
    }
    return undefined;
  }

  const itemDiagnosticStart = diagnostics.length;
  const resolvedItems = resolveUseSiteSchema(
    itemsMember.value,
    dataPath,
    itemsPath,
    referenceChain,
    diagnostics,
    referenceContext,
    [],
  );
  const itemSchema =
    resolvedItems.kind === 'resolved' ? resolvedItems.schema : undefined;
  const resolvedItemsPath =
    resolvedItems.kind === 'resolved' ? resolvedItems.documentPath : itemsPath;
  const firstItemsPath =
    itemSchema === undefined ? undefined : active.get(itemSchema);
  if (
    itemSchema !== undefined &&
    firstItemsPath !== undefined &&
    resolvedItems.activatedTargets.length === 0
  ) {
    diagnostics.push(
      withTemplatePath(
        diagnostic({
          code: 'CYCLIC_SCHEMA_OBJECT',
          severity: 'error',
          source: 'schema',
          dataPath,
          documentPath: resolvedItemsPath,
          parameters: { firstDocumentPath: [...firstItemsPath] },
          fallbackMessage: 'Schema object cycle detected.',
        }),
        [],
      ),
    );
    releaseReferenceTargets(referenceContext, resolvedItems.activatedTargets);
    addReferenceChainToRange(
      diagnostics,
      itemDiagnosticStart,
      resolvedItems.referenceChain,
    );
    if (collectionPolicies.valid && policy === undefined) {
      diagnostics.push(
        diagnostic({
          code: 'MISSING_COLLECTION_POLICY',
          severity: 'error',
          source: 'schema',
          dataPath,
          parameters: { arrayPath: [...dataPath] },
          fallbackMessage: 'Collection policy is required.',
        }),
      );
    }
    return undefined;
  }

  const item =
    itemSchema === undefined
      ? undefined
      : inspectItemRoot(
          name,
          itemSchema,
          dataPath,
          resolvedItemsPath,
          diagnostics,
        );
  const children: NodeCandidate[] = [];
  let identitySchemaCompatible = false;
  if (item !== undefined) {
    active.set(itemSchema as Record<string, unknown>, resolvedItemsPath);
    identitySchemaCompatible = inspectItemTemplateChildren(
      item.properties,
      item.requiredNames,
      policy?.itemIdentityProperty,
      children,
      dataPath,
      resolvedItemsPath,
      diagnostics,
      active,
      referenceContext,
      resolvedItems.referenceChain,
    );
    if (firstItemsPath === undefined)
      active.delete(itemSchema as Record<string, unknown>);
    else active.set(itemSchema as Record<string, unknown>, firstItemsPath);
  }

  releaseReferenceTargets(referenceContext, resolvedItems.activatedTargets);
  addReferenceChainToRange(
    diagnostics,
    itemDiagnosticStart,
    resolvedItems.referenceChain,
  );

  if (collectionPolicies.valid) {
    if (policy === undefined) {
      diagnostics.push(
        diagnostic({
          code: 'MISSING_COLLECTION_POLICY',
          severity: 'error',
          source: 'schema',
          dataPath,
          parameters: { arrayPath: [...dataPath] },
          fallbackMessage: 'Collection policy is required.',
        }),
      );
    } else if (
      item === undefined ||
      !Object.hasOwn(item.properties, policy.itemIdentityProperty)
    ) {
      diagnostics.push(
        semanticCollectionPolicyDiagnostic(
          policy,
          dataPath,
          'identity-property-not-found',
          'direct item property',
          resolvedItems.referenceChain,
        ),
      );
    } else if (!item.requiredNames.has(policy.itemIdentityProperty)) {
      diagnostics.push(
        semanticCollectionPolicyDiagnostic(
          policy,
          dataPath,
          'identity-property-not-required',
          'required item property',
          resolvedItems.referenceChain,
        ),
      );
    } else if (!identitySchemaCompatible) {
      diagnostics.push(
        semanticCollectionPolicyDiagnostic(
          policy,
          dataPath,
          'identity-schema-incompatible',
          'required direct string identity property',
          resolvedItems.referenceChain,
        ),
      );
    }
  }

  return {
    name,
    type: 'array',
    required,
    ...(schemaTitle === undefined ? {} : { schemaTitle }),
    ...(schemaDescription === undefined ? {} : { schemaDescription }),
    dataPath,
    documentPath,
    ...(policy === undefined
      ? {}
      : {
          identityProperty: policy.itemIdentityProperty,
          policyIndex: policy.index,
        }),
    children,
  };
}

function inspectItemRoot(
  name: string,
  schema: Record<string, unknown>,
  dataPath: readonly string[],
  documentPath: readonly (string | number)[],
  diagnostics: Diagnostic[],
):
  | {
      readonly properties: Record<string, unknown>;
      readonly requiredNames: ReadonlySet<string>;
    }
  | undefined {
  let properties: Record<string, unknown> | undefined;
  const requiredEntries: RequiredEntry[] = [];
  const requiredNames = new Set<string>();

  const typeMember = ownDataValue(schema, 'type');
  if (!typeMember.present) {
    diagnostics.push(
      withTemplatePath(
        diagnostic({
          code: 'MISSING_FIELD_TYPE',
          severity: 'error',
          source: 'schema',
          dataPath,
          documentPath: [...documentPath, 'type'],
          parameters: { field: name },
          fallbackMessage: `Field "${name}" must declare a type.`,
        }),
        [],
      ),
    );
  } else if (typeMember.accessor || typeMember.value !== 'object') {
    diagnostics.push(
      withTemplatePath(
        diagnostic({
          code: 'UNSUPPORTED_FIELD_TYPE',
          severity: 'error',
          source: 'schema',
          dataPath,
          documentPath: [...documentPath, 'type'],
          parameters: {
            field: name,
            ...(typeMember.accessor
              ? { actualType: 'accessor' }
              : describeActualValue(typeMember.value)),
          },
          fallbackMessage: `Field "${name}" has an unsupported type.`,
        }),
        [],
      ),
    );
  }

  const propertiesMember = ownDataValue(schema, 'properties');
  if (!propertiesMember.present) {
    diagnostics.push(
      withTemplatePath(
        diagnostic({
          code: 'MISSING_SCHEMA_PROPERTIES',
          severity: 'error',
          source: 'schema',
          dataPath,
          documentPath: [...documentPath, 'properties'],
          parameters: {},
          fallbackMessage: 'Object schema must declare properties.',
        }),
        [],
      ),
    );
  } else if (
    propertiesMember.accessor ||
    !isOrdinaryRecord(propertiesMember.value)
  ) {
    diagnostics.push(
      withTemplatePath(
        diagnostic({
          code: 'INVALID_SCHEMA_PROPERTIES',
          severity: 'error',
          source: 'schema',
          dataPath,
          documentPath: [...documentPath, 'properties'],
          parameters: {
            actualType: propertiesMember.accessor
              ? 'accessor'
              : actualType(propertiesMember.value),
          },
          fallbackMessage: 'Schema properties must be an object.',
        }),
        [],
      ),
    );
  } else {
    properties = propertiesMember.value;
  }

  const requiredMember = ownDataValue(schema, 'required');
  if (requiredMember.present) {
    const start = diagnostics.length;
    if (requiredMember.accessor) {
      diagnostics.push(
        invalidSchemaKeywordDescriptor(
          'required',
          'array of unique strings',
          [...documentPath, 'required'],
          dataPath,
          'accessor',
        ),
      );
    } else {
      inspectRequiredAtPath(
        requiredMember.value,
        requiredEntries,
        requiredNames,
        diagnostics,
        dataPath,
        [...documentPath, 'required'],
      );
    }
    addTemplatePathToRange(diagnostics, start, []);
  }

  for (const keyword of Object.keys(schema)) {
    if (ITEM_ROOT_KEYWORDS.has(keyword)) continue;
    const keywordPath = [...documentPath, keyword];
    let itemDiagnostic: Diagnostic;
    if (KNOWN_IGNORABLE_KEYWORDS.has(keyword)) {
      itemDiagnostic = schemaKeywordDiagnostic(
        'IGNORED_SCHEMA_KEYWORD',
        'warning',
        keyword,
        keywordPath,
        `Known annotation "${keyword}" is ignored by the compiler.`,
        dataPath,
      );
    } else if (
      keyword !== '$schema' &&
      (COMPILER_SUPPORTED_KEYWORDS.has(keyword) || keyword === 'items')
    ) {
      itemDiagnostic = diagnostic({
        code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
        severity: 'error',
        source: 'schema',
        dataPath,
        documentPath: keywordPath,
        parameters: { keyword, fieldType: 'object' },
        fallbackMessage: `Schema keyword "${keyword}" is incompatible with field type "object".`,
      });
    } else if (KNOWN_DRAFT_2020_12_KEYWORDS.has(keyword)) {
      itemDiagnostic = schemaKeywordDiagnostic(
        'UNSUPPORTED_SCHEMA_KEYWORD',
        'error',
        keyword,
        keywordPath,
        `Schema keyword "${keyword}" is not supported.`,
        dataPath,
      );
    } else {
      itemDiagnostic = schemaKeywordDiagnostic(
        'UNKNOWN_SCHEMA_KEYWORD',
        'warning',
        keyword,
        keywordPath,
        `Unknown schema keyword "${keyword}" is treated as an annotation.`,
        dataPath,
      );
    }
    diagnostics.push(withTemplatePath(itemDiagnostic, []));
  }

  if (properties === undefined) return undefined;
  for (const entry of requiredEntries) {
    if (!Object.hasOwn(properties, entry.name)) {
      diagnostics.push(
        withTemplatePath(
          diagnostic({
            code: 'UNMANAGED_REQUIRED_PROPERTY',
            severity: 'warning',
            source: 'schema',
            dataPath,
            documentPath: [...documentPath, 'required', entry.index],
            parameters: { field: entry.name },
            fallbackMessage: `Required property "${entry.name}" is not managed by this form.`,
          }),
          [],
        ),
      );
    }
  }
  return { properties, requiredNames };
}

function inspectItemTemplateChildren(
  properties: Record<string, unknown>,
  requiredNames: ReadonlySet<string>,
  identityProperty: string | undefined,
  output: NodeCandidate[],
  arrayPath: readonly string[],
  itemDocumentPath: readonly (string | number)[],
  diagnostics: Diagnostic[],
  active: Map<object, readonly (string | number)[]>,
  referenceContext: ReferenceContext,
  inheritedReferenceChain: ReferenceChain,
): boolean {
  type Frame =
    | {
        readonly kind: 'exit';
        readonly schema: Record<string, unknown>;
        readonly previousDocumentPath?: readonly (string | number)[];
        readonly diagnosticStart: number;
        readonly referenceChain: ReferenceChain;
        readonly activatedTargets: readonly string[];
      }
    | {
        readonly kind: 'node';
        readonly name: string;
        readonly schemaValue: unknown;
        readonly required: boolean;
        readonly templatePath: readonly string[];
        readonly documentPath: readonly (string | number)[];
        readonly output: NodeCandidate[];
        readonly referenceChain: ReferenceChain;
      };
  const stack: Frame[] = [];
  const names = Object.keys(properties);
  for (let index = names.length - 1; index >= 0; index -= 1) {
    const name = names[index] as string;
    const member = ownDataValue(properties, name);
    stack.push({
      kind: 'node',
      name,
      schemaValue:
        member.present && !member.accessor ? member.value : ACCESSOR_VALUE,
      required: requiredNames.has(name),
      templatePath: [name],
      documentPath: [...itemDocumentPath, 'properties', name],
      output,
      referenceChain: inheritedReferenceChain,
    });
  }
  let identityCompatible = false;
  while (stack.length > 0) {
    const frame = stack.pop();
    if (frame === undefined) break;
    if (frame.kind === 'exit') {
      if (frame.previousDocumentPath === undefined) active.delete(frame.schema);
      else active.set(frame.schema, frame.previousDocumentPath);
      releaseReferenceTargets(referenceContext, frame.activatedTargets);
      addReferenceChainToRange(
        diagnostics,
        frame.diagnosticStart,
        frame.referenceChain,
      );
      continue;
    }
    const start = diagnostics.length;
    if (
      frame.schemaValue === ACCESSOR_VALUE ||
      !isOrdinaryRecord(frame.schemaValue)
    ) {
      diagnostics.push(
        diagnostic({
          code: 'INVALID_FIELD_SCHEMA',
          severity: 'error',
          source: 'schema',
          dataPath: arrayPath,
          documentPath: frame.documentPath,
          parameters: {
            field: frame.name,
            actualType:
              frame.schemaValue === ACCESSOR_VALUE
                ? 'accessor'
                : actualType(frame.schemaValue),
          },
          fallbackMessage: `Schema for field "${frame.name}" must be an object.`,
        }),
      );
      addTemplatePathToRange(diagnostics, start, frame.templatePath);
      continue;
    }
    const resolved = resolveUseSiteSchema(
      frame.schemaValue,
      arrayPath,
      frame.documentPath,
      frame.referenceChain,
      diagnostics,
      referenceContext,
      frame.templatePath,
    );
    if (resolved.kind === 'blocked') {
      addTemplatePathToRange(diagnostics, start, frame.templatePath);
      addReferenceChainToRange(diagnostics, start, resolved.referenceChain);
      releaseReferenceTargets(referenceContext, resolved.activatedTargets);
      continue;
    }
    const schema = resolved.schema;
    const resolvedDocumentPath = resolved.documentPath;
    const typeMember = ownDataValue(schema, 'type');
    if (!typeMember.present) {
      diagnostics.push(
        diagnostic({
          code: 'MISSING_FIELD_TYPE',
          severity: 'error',
          source: 'schema',
          dataPath: arrayPath,
          documentPath: [...resolvedDocumentPath, 'type'],
          parameters: { field: frame.name },
          fallbackMessage: `Field "${frame.name}" must declare a type.`,
        }),
      );
      addTemplatePathToRange(diagnostics, start, frame.templatePath);
      addReferenceChainToRange(diagnostics, start, resolved.referenceChain);
      releaseReferenceTargets(referenceContext, resolved.activatedTargets);
      continue;
    }
    const rawType = typeMember.accessor ? ACCESSOR_VALUE : typeMember.value;
    if (frame.templatePath.length === 1 && frame.name === identityProperty) {
      identityCompatible = inspectIdentitySchema(
        frame.name,
        schema,
        rawType,
        arrayPath,
        resolvedDocumentPath,
        frame.templatePath,
        diagnostics,
      );
      addReferenceChainToRange(diagnostics, start, resolved.referenceChain);
      releaseReferenceTargets(referenceContext, resolved.activatedTargets);
      continue;
    }
    if (Array.isArray(rawType) && !isNullableContainerTypeArray(rawType)) {
      const nullableType = inspectNullableTypeArray(
        frame.name,
        rawType,
        arrayPath,
        resolvedDocumentPath,
        diagnostics,
      );
      if (nullableType !== undefined) {
        const candidate = inspectValidField(
          frame.name,
          nullableType,
          true,
          schema,
          frame.required,
          diagnostics,
          arrayPath,
          resolvedDocumentPath,
        );
        frame.output.push({ ...candidate, templatePath: frame.templatePath });
      }
      addTemplatePathToRange(diagnostics, start, frame.templatePath);
      addReferenceChainToRange(diagnostics, start, resolved.referenceChain);
      releaseReferenceTargets(referenceContext, resolved.activatedTargets);
      continue;
    }
    if (rawType === 'array') {
      diagnostics.push(
        withTemplatePath(
          diagnostic({
            code: 'UNSUPPORTED_FIELD_TYPE',
            severity: 'error',
            source: 'schema',
            dataPath: arrayPath,
            documentPath: [...resolvedDocumentPath, 'type'],
            parameters: {
              field: frame.name,
              reason: 'nested-array-not-supported',
            },
            fallbackMessage: `Field "${frame.name}" has an unsupported type.`,
          }),
          frame.templatePath,
        ),
      );
      addReferenceChainToRange(diagnostics, start, resolved.referenceChain);
      releaseReferenceTargets(referenceContext, resolved.activatedTargets);
      continue;
    }
    if (typeof rawType !== 'string' || !SUPPORTED_NODE_TYPES.has(rawType)) {
      diagnostics.push(
        diagnostic({
          code: 'UNSUPPORTED_FIELD_TYPE',
          severity: 'error',
          source: 'schema',
          dataPath: arrayPath,
          documentPath: [...resolvedDocumentPath, 'type'],
          parameters: {
            field: frame.name,
            ...(rawType === ACCESSOR_VALUE
              ? { actualType: 'accessor' }
              : describeActualValue(rawType)),
          },
          fallbackMessage: `Field "${frame.name}" has an unsupported type.`,
        }),
      );
      addTemplatePathToRange(diagnostics, start, frame.templatePath);
      addReferenceChainToRange(diagnostics, start, resolved.referenceChain);
      releaseReferenceTargets(referenceContext, resolved.activatedTargets);
      continue;
    }
    if (rawType !== 'object') {
      const candidate = inspectValidField(
        frame.name,
        rawType as FieldType,
        false,
        schema,
        frame.required,
        diagnostics,
        arrayPath,
        resolvedDocumentPath,
      );
      frame.output.push({ ...candidate, templatePath: frame.templatePath });
      addTemplatePathToRange(diagnostics, start, frame.templatePath);
      addReferenceChainToRange(diagnostics, start, resolved.referenceChain);
      releaseReferenceTargets(referenceContext, resolved.activatedTargets);
      continue;
    }
    const firstPath = active.get(schema);
    if (firstPath !== undefined && resolved.activatedTargets.length === 0) {
      diagnostics.push(
        diagnostic({
          code: 'CYCLIC_SCHEMA_OBJECT',
          severity: 'error',
          source: 'schema',
          dataPath: arrayPath,
          documentPath: resolvedDocumentPath,
          parameters: { firstDocumentPath: [...firstPath] },
          fallbackMessage: 'Schema object cycle detected.',
        }),
      );
      addTemplatePathToRange(diagnostics, start, frame.templatePath);
      addReferenceChainToRange(diagnostics, start, resolved.referenceChain);
      releaseReferenceTargets(referenceContext, resolved.activatedTargets);
      continue;
    }
    const object = inspectObjectCandidate(
      frame.name,
      schema,
      frame.required,
      arrayPath,
      resolvedDocumentPath,
      diagnostics,
    );
    addTemplatePathToRange(diagnostics, start, frame.templatePath);
    if (object === undefined) {
      addReferenceChainToRange(diagnostics, start, resolved.referenceChain);
      releaseReferenceTargets(referenceContext, resolved.activatedTargets);
      continue;
    }
    const candidate: ObjectCandidate = {
      ...object.candidate,
      templatePath: frame.templatePath,
    };
    frame.output.push(candidate);
    active.set(schema, resolvedDocumentPath);
    stack.push({
      kind: 'exit',
      schema,
      ...(firstPath === undefined ? {} : { previousDocumentPath: firstPath }),
      diagnosticStart: start,
      referenceChain: resolved.referenceChain,
      activatedTargets: resolved.activatedTargets,
    });
    const childNames = Object.keys(object.properties);
    for (let index = childNames.length - 1; index >= 0; index -= 1) {
      const childName = childNames[index] as string;
      const member = ownDataValue(object.properties, childName);
      stack.push({
        kind: 'node',
        name: childName,
        schemaValue:
          member.present && !member.accessor ? member.value : ACCESSOR_VALUE,
        required: object.requiredNames.has(childName),
        templatePath: [...frame.templatePath, childName],
        documentPath: [...resolvedDocumentPath, 'properties', childName],
        output: candidate.children,
        referenceChain: resolved.referenceChain,
      });
    }
  }
  return identityCompatible;
}

function inspectIdentitySchema(
  name: string,
  schema: Record<string, unknown>,
  rawType: unknown,
  dataPath: readonly string[],
  documentPath: readonly (string | number)[],
  templatePath: readonly string[],
  diagnostics: Diagnostic[],
): boolean {
  let compatible = rawType === 'string';
  if (!compatible && !Array.isArray(rawType)) {
    diagnostics.push(
      withTemplatePath(
        diagnostic({
          code: 'UNSUPPORTED_FIELD_TYPE',
          severity: 'error',
          source: 'schema',
          dataPath,
          documentPath: [...documentPath, 'type'],
          parameters: {
            field: name,
            ...(rawType === ACCESSOR_VALUE
              ? { actualType: 'accessor' }
              : describeActualValue(rawType)),
          },
          fallbackMessage: `Field "${name}" has an unsupported type.`,
        }),
        templatePath,
      ),
    );
  }
  for (const keyword of Object.keys(schema)) {
    if (keyword === 'type') continue;
    const keywordPath = [...documentPath, keyword];
    if (KNOWN_IGNORABLE_KEYWORDS.has(keyword)) {
      diagnostics.push(
        withTemplatePath(
          schemaKeywordDiagnostic(
            'IGNORED_SCHEMA_KEYWORD',
            'warning',
            keyword,
            keywordPath,
            `Known annotation "${keyword}" is ignored by the compiler.`,
            dataPath,
          ),
          templatePath,
        ),
      );
    } else if (
      keyword !== '$schema' &&
      (COMPILER_SUPPORTED_KEYWORDS.has(keyword) || keyword === 'items')
    ) {
      compatible = false;
      diagnostics.push(
        withTemplatePath(
          diagnostic({
            code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
            severity: 'error',
            source: 'schema',
            dataPath,
            documentPath: keywordPath,
            parameters: { keyword, fieldType: 'string' },
            fallbackMessage: `Schema keyword "${keyword}" is incompatible with field type "string".`,
          }),
          templatePath,
        ),
      );
    } else if (KNOWN_DRAFT_2020_12_KEYWORDS.has(keyword)) {
      compatible = false;
      diagnostics.push(
        withTemplatePath(
          schemaKeywordDiagnostic(
            'UNSUPPORTED_SCHEMA_KEYWORD',
            'error',
            keyword,
            keywordPath,
            `Schema keyword "${keyword}" is not supported.`,
            dataPath,
          ),
          templatePath,
        ),
      );
    } else {
      diagnostics.push(
        withTemplatePath(
          schemaKeywordDiagnostic(
            'UNKNOWN_SCHEMA_KEYWORD',
            'warning',
            keyword,
            keywordPath,
            `Unknown schema keyword "${keyword}" is treated as an annotation.`,
            dataPath,
          ),
          templatePath,
        ),
      );
    }
  }
  return compatible;
}

function semanticCollectionPolicyDiagnostic(
  policy: ParsedCollectionPolicy,
  dataPath: readonly string[],
  reason:
    | 'identity-property-not-found'
    | 'identity-property-not-required'
    | 'identity-schema-incompatible',
  expected: string,
  referenceChain: ReferenceChain,
): Diagnostic {
  const value = diagnostic({
    code: 'INVALID_COLLECTION_POLICY',
    severity: 'error',
    source: 'schema',
    dataPath,
    parameters: {
      reason,
      policyIndex: policy.index,
      member: 'itemIdentityProperty',
      expected,
    },
    fallbackMessage: 'Collection policy is incompatible with the item schema.',
  });
  return referenceChain.length === 0
    ? value
    : {
        ...value,
        parameters: referenceDiagnosticParameters(value.parameters, {
          referenceChain,
        }),
      };
}

function addTemplatePathToRange(
  diagnostics: Diagnostic[],
  start: number,
  templatePath: readonly string[],
): void {
  for (let index = start; index < diagnostics.length; index += 1) {
    const current = diagnostics[index];
    if (current !== undefined)
      diagnostics[index] = withTemplatePath(current, templatePath);
  }
}

function withTemplatePath(
  value: Diagnostic,
  templatePath: readonly string[],
): Diagnostic {
  return {
    ...value,
    parameters: { ...value.parameters, templatePath: [...templatePath] },
  };
}

const ACCESSOR_VALUE = Symbol('accessor');

function isOrdinaryRecord(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value)) {
    return false;
  }
  const prototype: unknown = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function inspectObjectCandidate(
  name: string,
  schema: Record<string, unknown>,
  required: boolean,
  dataPath: readonly string[],
  documentPath: readonly (string | number)[],
  diagnostics: Diagnostic[],
):
  | {
      readonly candidate: ObjectCandidate;
      readonly properties: Record<string, unknown>;
      readonly requiredNames: ReadonlySet<string>;
    }
  | undefined {
  let schemaTitle: string | undefined;
  let schemaDescription: string | undefined;
  let properties: Record<string, unknown> | undefined;
  const requiredEntries: RequiredEntry[] = [];
  const requiredNames = new Set<string>();

  for (const keyword of Object.keys(schema)) {
    const keywordPath = [...documentPath, keyword];
    const descriptor = Object.getOwnPropertyDescriptor(schema, keyword);
    const value: unknown =
      descriptor !== undefined && 'value' in descriptor
        ? descriptor.value
        : ACCESSOR_VALUE;
    if (!OBJECT_FIELD_KEYWORDS.has(keyword)) {
      if (KNOWN_IGNORABLE_KEYWORDS.has(keyword)) {
        diagnostics.push(
          schemaKeywordDiagnostic(
            'IGNORED_SCHEMA_KEYWORD',
            'warning',
            keyword,
            keywordPath,
            `Known annotation "${keyword}" is ignored by the compiler.`,
            dataPath,
          ),
        );
      } else if (
        keyword !== '$schema' &&
        (COMPILER_SUPPORTED_KEYWORDS.has(keyword) || keyword === 'items')
      ) {
        diagnostics.push(
          diagnostic({
            code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
            severity: 'error',
            source: 'schema',
            dataPath,
            documentPath: keywordPath,
            parameters: { keyword, fieldType: 'object' },
            fallbackMessage: `Schema keyword "${keyword}" is incompatible with field type "object".`,
          }),
        );
      } else if (KNOWN_DRAFT_2020_12_KEYWORDS.has(keyword)) {
        diagnostics.push(
          schemaKeywordDiagnostic(
            'UNSUPPORTED_SCHEMA_KEYWORD',
            'error',
            keyword,
            keywordPath,
            `Schema keyword "${keyword}" is not supported.`,
            dataPath,
          ),
        );
      } else {
        diagnostics.push(
          schemaKeywordDiagnostic(
            'UNKNOWN_SCHEMA_KEYWORD',
            'warning',
            keyword,
            keywordPath,
            `Unknown schema keyword "${keyword}" is treated as an annotation.`,
            dataPath,
          ),
        );
      }
      continue;
    }

    if (keyword === 'properties') {
      if (isOrdinaryRecord(value)) {
        properties = value;
      } else {
        diagnostics.push(
          diagnostic({
            code: 'INVALID_SCHEMA_PROPERTIES',
            severity: 'error',
            source: 'schema',
            dataPath,
            documentPath: keywordPath,
            parameters: {
              actualType:
                value === ACCESSOR_VALUE ? 'accessor' : actualType(value),
            },
            fallbackMessage: 'Schema properties must be an object.',
          }),
        );
      }
    } else if (keyword === 'required') {
      if (value === ACCESSOR_VALUE) {
        diagnostics.push(
          invalidSchemaKeywordDescriptor(
            'required',
            'array of unique strings',
            keywordPath,
            dataPath,
            'accessor',
          ),
        );
      } else {
        inspectRequiredAtPath(
          value,
          requiredEntries,
          requiredNames,
          diagnostics,
          dataPath,
          keywordPath,
        );
      }
    } else if (keyword === 'title') {
      if (typeof value !== 'string' || value.trim().length === 0) {
        diagnostics.push(
          value === ACCESSOR_VALUE
            ? invalidSchemaKeywordDescriptor(
                keyword,
                'non-blank string',
                keywordPath,
                dataPath,
                'accessor',
              )
            : invalidSchemaKeywordValue(
                keyword,
                value,
                'non-blank string',
                keywordPath,
                dataPath,
              ),
        );
      } else {
        schemaTitle = value;
      }
    } else if (keyword === 'description') {
      if (typeof value !== 'string') {
        diagnostics.push(
          value === ACCESSOR_VALUE
            ? invalidSchemaKeywordDescriptor(
                keyword,
                'string',
                keywordPath,
                dataPath,
                'accessor',
              )
            : invalidSchemaKeywordValue(
                keyword,
                value,
                'string',
                keywordPath,
                dataPath,
              ),
        );
      } else {
        schemaDescription = value;
      }
    }
  }

  if (!Object.hasOwn(schema, 'properties')) {
    diagnostics.push(
      diagnostic({
        code: 'MISSING_SCHEMA_PROPERTIES',
        severity: 'error',
        source: 'schema',
        dataPath,
        documentPath: [...documentPath, 'properties'],
        parameters: {},
        fallbackMessage: 'Object schema must declare properties.',
      }),
    );
  }
  if (properties === undefined) {
    return undefined;
  }
  for (const entry of requiredEntries) {
    if (!Object.hasOwn(properties, entry.name)) {
      diagnostics.push(
        diagnostic({
          code: 'UNMANAGED_REQUIRED_PROPERTY',
          severity: 'warning',
          source: 'schema',
          dataPath: [...dataPath, entry.name],
          documentPath: [...documentPath, 'required', entry.index],
          parameters: { field: entry.name },
          fallbackMessage: `Required property "${entry.name}" is not managed by this form.`,
        }),
      );
    }
  }
  return {
    candidate: {
      name,
      type: 'object',
      required,
      ...(schemaTitle === undefined ? {} : { schemaTitle }),
      ...(schemaDescription === undefined ? {} : { schemaDescription }),
      dataPath,
      documentPath,
      children: [],
    },
    properties,
    requiredNames,
  };
}

function inspectNullableTypeArray(
  name: string,
  typeArray: unknown[],
  dataPath: readonly string[],
  fieldPath: readonly (string | number)[],
  diagnostics: Diagnostic[],
): FieldType | undefined {
  const fallbackMessage = `Field "${name}" has an unsupported type.`;
  const fail = (
    suffix: readonly (string | number)[],
    parameters: Readonly<Record<string, unknown>>,
  ): undefined => {
    diagnostics.push(
      diagnostic({
        code: 'UNSUPPORTED_FIELD_TYPE',
        severity: 'error',
        source: 'schema',
        dataPath,
        documentPath: [...fieldPath, 'type', ...suffix],
        parameters: { field: name, ...parameters },
        fallbackMessage,
      }),
    );
    return undefined;
  };

  const lengthDescriptor = Object.getOwnPropertyDescriptor(typeArray, 'length');
  if (lengthDescriptor === undefined) {
    return fail([], {
      expected: 'primitive type plus null',
      actualType: 'missing',
    });
  }
  if (!('value' in lengthDescriptor)) {
    return fail([], {
      expected: 'primitive type plus null',
      actualType: 'accessor',
    });
  }
  if (typeof lengthDescriptor.value !== 'number') {
    return fail([], {
      expected: 'primitive type plus null',
      actualType: actualType(lengthDescriptor.value),
    });
  }
  if (lengthDescriptor.value !== 2) {
    return fail([], {
      expected: 'primitive type plus null',
      actualLength: lengthDescriptor.value,
    });
  }

  const members: string[] = [];
  for (const index of [0, 1] as const) {
    const descriptor = Object.getOwnPropertyDescriptor(typeArray, index);
    if (descriptor === undefined) {
      return fail([index], {
        expected: 'null or primitive type',
        actualType: 'missing',
      });
    }
    if (!descriptor.enumerable) {
      return fail([index], {
        expected: 'null or primitive type',
        actualType: 'non-enumerable',
      });
    }
    if (!('value' in descriptor)) {
      return fail([index], {
        expected: 'null or primitive type',
        actualType: 'accessor',
      });
    }
    if (typeof descriptor.value !== 'string') {
      return fail([index], {
        expected: 'null or primitive type',
        ...describeActualValue(descriptor.value),
      });
    }
    if (
      descriptor.value !== 'null' &&
      !SUPPORTED_FIELD_TYPES.has(descriptor.value as FieldType)
    ) {
      return fail([index], {
        expected: 'null or primitive type',
        reason: 'unsupported-type-member',
        ...describeActualValue(descriptor.value),
      });
    }
    members.push(descriptor.value);
  }

  const extraKey = Object.keys(typeArray).find(
    (key) => key !== '0' && key !== '1',
  );
  if (extraKey !== undefined) {
    return fail([extraKey], { reason: 'unexpected-type-array-member' });
  }

  const first = members[0] as string;
  const second = members[1] as string;
  if (first === 'null' && second === 'null') {
    return fail([], {
      expected: 'one primitive type and null',
      reason: 'duplicate-null',
    });
  }
  if (first === second) {
    return fail([], {
      expected: 'one primitive type and null',
      reason: 'duplicate-primitive',
    });
  }
  if (first !== 'null' && second !== 'null') {
    return fail([], {
      expected: 'one primitive type and null',
      reason: 'missing-null',
    });
  }
  return (first === 'null' ? second : first) as FieldType;
}

function isNullableContainerTypeArray(typeArray: unknown[]): boolean {
  const length = Object.getOwnPropertyDescriptor(typeArray, 'length');
  if (length === undefined || !('value' in length) || length.value !== 2)
    return false;
  const first = Object.getOwnPropertyDescriptor(typeArray, 0);
  const second = Object.getOwnPropertyDescriptor(typeArray, 1);
  if (
    first === undefined ||
    second === undefined ||
    !first.enumerable ||
    !second.enumerable ||
    !('value' in first) ||
    !('value' in second) ||
    Object.keys(typeArray).some((key) => key !== '0' && key !== '1')
  )
    return false;
  return (
    (first.value === 'null' &&
      (second.value === 'object' || second.value === 'array')) ||
    (second.value === 'null' &&
      (first.value === 'object' || first.value === 'array'))
  );
}

function inspectValidField(
  name: string,
  type: FieldType,
  nullable: boolean,
  field: Record<string, unknown>,
  required: boolean,
  diagnostics: Diagnostic[],
  dataPath: readonly string[],
  fieldPath: readonly (string | number)[],
): FieldCandidate {
  let schemaTitle: string | undefined;
  let schemaDescription: string | undefined;
  const stringConstraints: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  } = {};
  const numberConstraints: {
    minimum?: number;
    maximum?: number;
    multipleOf?: number;
  } = {};
  let stringEnum: StringEnumState = { kind: 'absent' };
  const supportedKeywords = fieldKeywords(type);

  for (const keyword of Object.keys(field)) {
    const documentPath = [...fieldPath, keyword] as const;

    if (nullable && keyword === 'enum') {
      stringEnum = { kind: 'schema-blocked' };
      diagnostics.push(
        diagnostic({
          code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
          severity: 'error',
          source: 'schema',
          dataPath,
          documentPath,
          parameters: { keyword, fieldType: type },
          fallbackMessage: `Schema keyword "${keyword}" is incompatible with field type "${type}".`,
        }),
      );
      continue;
    }

    if (!supportedKeywords.has(keyword)) {
      if (KNOWN_IGNORABLE_KEYWORDS.has(keyword)) {
        diagnostics.push(
          schemaKeywordDiagnostic(
            'IGNORED_SCHEMA_KEYWORD',
            'warning',
            keyword,
            documentPath,
            `Known annotation "${keyword}" is ignored by the compiler.`,
            dataPath,
          ),
        );
      } else if (
        keyword !== '$schema' &&
        (COMPILER_SUPPORTED_KEYWORDS.has(keyword) || keyword === 'items')
      ) {
        if (keyword === 'enum') {
          stringEnum = { kind: 'schema-blocked' };
        }
        diagnostics.push(
          diagnostic({
            code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
            severity: 'error',
            source: 'schema',
            dataPath,
            documentPath,
            parameters: { keyword, fieldType: type },
            fallbackMessage: `Schema keyword "${keyword}" is incompatible with field type "${type}".`,
          }),
        );
      } else if (KNOWN_DRAFT_2020_12_KEYWORDS.has(keyword)) {
        diagnostics.push(
          schemaKeywordDiagnostic(
            'UNSUPPORTED_SCHEMA_KEYWORD',
            'error',
            keyword,
            documentPath,
            `Schema keyword "${keyword}" is not supported.`,
            dataPath,
          ),
        );
      } else {
        diagnostics.push(
          schemaKeywordDiagnostic(
            'UNKNOWN_SCHEMA_KEYWORD',
            'warning',
            keyword,
            documentPath,
            `Unknown schema keyword "${keyword}" is treated as an annotation.`,
            dataPath,
          ),
        );
      }
      continue;
    }

    if (keyword === 'enum') {
      stringEnum = inspectStringEnum(field, diagnostics, dataPath, fieldPath);
      continue;
    }

    const descriptor = Object.getOwnPropertyDescriptor(field, keyword);
    const value: unknown =
      descriptor !== undefined && 'value' in descriptor
        ? descriptor.value
        : ACCESSOR_VALUE;

    if (value === ACCESSOR_VALUE) {
      if (keyword !== 'default' && keyword !== 'type') {
        diagnostics.push(
          invalidSchemaKeywordDescriptor(
            keyword,
            expectedSchemaKeywordValue(keyword),
            documentPath,
            dataPath,
            'accessor',
          ),
        );
      }
      continue;
    }

    if (keyword === 'title' || keyword === 'description') {
      if (typeof value !== 'string') {
        diagnostics.push(
          invalidSchemaKeywordValue(
            keyword,
            value,
            'string',
            documentPath,
            dataPath,
          ),
        );
      } else if (keyword === 'title') {
        schemaTitle = value;
      } else {
        schemaDescription = value;
      }
    } else if (keyword === 'minLength' || keyword === 'maxLength') {
      if (!Number.isInteger(value) || (value as number) < 0) {
        diagnostics.push(
          invalidSchemaKeywordValue(
            keyword,
            value,
            'non-negative integer',
            documentPath,
            dataPath,
          ),
        );
      } else {
        stringConstraints[keyword] = value as number;
      }
    } else if (keyword === 'pattern') {
      if (typeof value !== 'string' || !isUnicodePattern(value)) {
        diagnostics.push(
          invalidSchemaKeywordValue(
            keyword,
            value,
            'valid Unicode regular expression string',
            documentPath,
            dataPath,
          ),
        );
      } else {
        stringConstraints.pattern = value;
      }
    } else if (keyword === 'minimum' || keyword === 'maximum') {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        diagnostics.push(
          invalidSchemaKeywordValue(
            keyword,
            value,
            'finite number',
            documentPath,
            dataPath,
          ),
        );
      } else {
        numberConstraints[keyword] = value;
      }
    } else if (keyword === 'multipleOf') {
      if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
        diagnostics.push(
          invalidSchemaKeywordValue(
            keyword,
            value,
            'finite number greater than zero',
            documentPath,
            dataPath,
          ),
        );
      } else {
        numberConstraints.multipleOf = value;
      }
    }
  }

  return {
    name,
    type,
    nullable,
    required,
    ...(schemaTitle === undefined ? {} : { schemaTitle }),
    ...(schemaDescription === undefined ? {} : { schemaDescription }),
    stringConstraints,
    numberConstraints,
    stringEnum,
    dataPath,
    documentPath: fieldPath,
  };
}

function expectedSchemaKeywordValue(keyword: string): string {
  if (keyword === 'title' || keyword === 'description') return 'string';
  if (keyword === 'minLength' || keyword === 'maxLength')
    return 'non-negative integer';
  if (keyword === 'pattern') return 'valid Unicode regular expression string';
  if (keyword === 'multipleOf') return 'finite number greater than zero';
  return 'finite number';
}

function inspectStringEnum(
  field: Record<string, unknown>,
  diagnostics: Diagnostic[],
  dataPath: readonly string[],
  fieldPath: readonly (string | number)[],
): StringEnumState {
  const documentPath = [...fieldPath, 'enum'] as const;
  const descriptor = Object.getOwnPropertyDescriptor(field, 'enum');

  if (descriptor === undefined || !('value' in descriptor)) {
    diagnostics.push(
      invalidSchemaKeywordDescriptor(
        'enum',
        'array of unique strings',
        documentPath,
        dataPath,
        descriptor === undefined ? 'missing' : 'accessor',
      ),
    );
    return { kind: 'schema-blocked' };
  }

  const value: unknown = descriptor.value;
  if (!Array.isArray(value)) {
    diagnostics.push(
      invalidSchemaKeywordValue(
        'enum',
        value,
        'array of unique strings',
        documentPath,
        dataPath,
      ),
    );
    return { kind: 'schema-blocked' };
  }

  if (value.length === 0) {
    diagnostics.push(
      invalidSchemaKeywordValue(
        'enum',
        value,
        'non-empty array of unique strings',
        documentPath,
        dataPath,
      ),
    );
    return { kind: 'schema-blocked' };
  }

  const values: string[] = [];
  const seen = new Set<string>();
  let blocked = false;

  for (let index = 0; index < value.length; index += 1) {
    const entryPath = [...documentPath, index] as const;
    const entryDescriptor = Object.getOwnPropertyDescriptor(value, index);

    if (entryDescriptor === undefined || !('value' in entryDescriptor)) {
      diagnostics.push(
        invalidSchemaKeywordDescriptor(
          'enum',
          'string',
          entryPath,
          dataPath,
          entryDescriptor === undefined ? 'missing' : 'accessor',
        ),
      );
      blocked = true;
      continue;
    }

    const entry: unknown = entryDescriptor.value;
    if (typeof entry !== 'string') {
      diagnostics.push(
        invalidSchemaKeywordValue('enum', entry, 'string', entryPath, dataPath),
      );
      blocked = true;
      continue;
    }

    if (seen.has(entry)) {
      diagnostics.push(
        invalidSchemaKeywordValue(
          'enum',
          entry,
          'unique string',
          entryPath,
          dataPath,
        ),
      );
      blocked = true;
      continue;
    }

    seen.add(entry);
    values.push(entry);
  }

  return blocked ? { kind: 'schema-blocked' } : { kind: 'valid', values };
}

function fieldKeywords(type: FieldType): ReadonlySet<string> {
  if (type === 'string') {
    return STRING_FIELD_KEYWORDS;
  }
  if (type === 'number' || type === 'integer') {
    return NUMBER_FIELD_KEYWORDS;
  }
  return BOOLEAN_FIELD_KEYWORDS;
}

function isUnicodePattern(value: string): boolean {
  try {
    RegExp(value, 'u');
    return true;
  } catch {
    return false;
  }
}

function inspectUiSchema(
  rawUiSchema: unknown,
  propertyNames: readonly string[] | undefined,
  candidatesByName: ReadonlyMap<string, FieldCandidate> | undefined,
  diagnostics: Diagnostic[],
): ParsedUiSchema {
  const order: string[] = [];
  const fields = new Map<string, ParsedFieldUi>();
  const result: ParsedUiSchema = { order, fields };

  if (rawUiSchema === undefined) {
    return result;
  }

  if (!isRecord(rawUiSchema)) {
    diagnostics.push(
      diagnostic({
        code: 'INVALID_UI_SCHEMA',
        severity: 'error',
        source: 'ui-schema',
        parameters: { actualType: actualType(rawUiSchema) },
        fallbackMessage: 'UI Schema must be an object.',
      }),
    );
    return result;
  }

  const knownFields =
    propertyNames === undefined ? undefined : new Set(propertyNames);

  for (const key of Object.keys(rawUiSchema)) {
    if (!UI_ROOT_KEYS.has(key)) {
      diagnostics.push(unknownUiKey(key, [key]));
      continue;
    }

    if (key === 'presentation') {
      continue;
    } else if (key === 'order') {
      inspectUiOrder(rawUiSchema.order, knownFields, order, diagnostics);
    } else {
      inspectUiFields(
        rawUiSchema.fields,
        knownFields,
        candidatesByName,
        fields,
        diagnostics,
      );
    }
  }

  const presentation = inspectRootPresentation(
    rawUiSchema,
    propertyNames ?? [],
    diagnostics,
  );
  if (presentation !== undefined) result.presentation = presentation;
  return result;
}

function inspectRootPresentation(
  ui: Record<string, unknown>,
  nodeNames: readonly string[],
  diagnostics: Diagnostic[],
): readonly ParsedPresentationEntry[] | undefined {
  const presentation = ownDataValue(ui, 'presentation');
  if (!presentation.present) return undefined;

  let invalid = false;
  if (ownDataValue(ui, 'order').present) {
    invalid = true;
    diagnostics.push(
      invalidUiPresentation('order-conflict', ['presentation'], {
        member: 'order',
        expected: 'one root ordering authority',
      }),
    );
  }
  if (presentation.accessor) {
    diagnostics.push(
      invalidUiPresentation('presentation-accessor', ['presentation'], {
        expected: 'dense array',
      }),
    );
    return undefined;
  }
  if (!Array.isArray(presentation.value)) {
    diagnostics.push(
      invalidUiPresentation('presentation-not-array', ['presentation'], {
        expected: 'dense array',
        actualType: actualType(presentation.value),
      }),
    );
    return undefined;
  }

  const known = new Set(nodeNames);
  const normalizedNodeNames = presentationNodeOrder(ui, nodeNames);
  const firstNodes = new Map<string, readonly (string | number)[]>();
  const firstContainers = new Map<string, readonly (string | number)[]>();
  const active = new Map<object, readonly (string | number)[]>();
  const result: ParsedPresentationEntry[] = [];
  const stack: PresentationInspectionFrame[] = [];
  pushPresentationEntries(presentation.value, ['presentation'], result, stack);

  while (stack.length > 0) {
    const frame = stack.pop();
    if (frame === undefined) break;
    if (frame.kind === 'exit') {
      active.delete(frame.value);
      continue;
    }
    if (frame.kind === 'entry') {
      const outcome = inspectPresentationEntryFrame(
        frame,
        known,
        firstNodes,
        firstContainers,
        active,
        diagnostics,
        stack,
      );
      invalid = outcome || invalid;
      continue;
    }
    if (frame.kind === 'panel') {
      const outcome = inspectPresentationPanelFrame(
        frame,
        active,
        diagnostics,
        stack,
      );
      invalid = outcome || invalid;
      continue;
    }
    const outcome = inspectPresentationGridItemFrame(
      frame,
      active,
      diagnostics,
      stack,
    );
    invalid = outcome || invalid;
  }

  for (const name of normalizedNodeNames) {
    if (!firstNodes.has(name)) {
      invalid = true;
      diagnostics.push(
        invalidUiPresentation('missing-node', ['presentation'], { node: name }),
      );
    }
  }
  return invalid ? undefined : result;
}

function inspectPresentationEntryFrame(
  frame: PresentationEntryFrame,
  known: ReadonlySet<string>,
  firstNodes: Map<string, readonly (string | number)[]>,
  firstContainers: Map<string, readonly (string | number)[]>,
  active: Map<object, readonly (string | number)[]>,
  diagnostics: Diagnostic[],
  stack: PresentationInspectionFrame[],
): boolean {
  if (frame.value === SPARSE_PRESENTATION_ENTRY) {
    diagnostics.push(
      invalidUiPresentation('sparse-entry', frame.path, {
        entryIndex: frame.index,
      }),
    );
    return true;
  }
  if (frame.value === ACCESSOR_PRESENTATION_ENTRY) {
    diagnostics.push(
      invalidUiPresentation('entry-accessor', frame.path, {
        entryIndex: frame.index,
      }),
    );
    return true;
  }
  if (typeof frame.value === 'string') {
    if (!known.has(frame.value)) {
      diagnostics.push(
        invalidUiPresentation('unknown-node', frame.path, {
          entryIndex: frame.index,
          node: frame.value,
        }),
      );
      return true;
    }
    const firstDocumentPath = firstNodes.get(frame.value);
    if (firstDocumentPath !== undefined) {
      diagnostics.push(
        invalidUiPresentation('duplicate-node', frame.path, {
          entryIndex: frame.index,
          node: frame.value,
          firstDocumentPath: [...firstDocumentPath],
        }),
      );
      return true;
    }
    firstNodes.set(frame.value, frame.path);
    frame.output.push({ kind: 'form-node', name: frame.value });
    return false;
  }
  if (!isOrdinaryRecord(frame.value)) {
    diagnostics.push(
      invalidUiPresentation('invalid-entry', frame.path, {
        entryIndex: frame.index,
        expected: 'root node name or presentation container object',
        actualType: actualType(frame.value),
      }),
    );
    return true;
  }

  const firstActivePath = active.get(frame.value);
  if (firstActivePath !== undefined) {
    diagnostics.push(
      invalidUiPresentation('cyclic-presentation', frame.path, {
        firstDocumentPath: [...firstActivePath],
      }),
    );
    return true;
  }

  const kind = presentationMember(frame.value, 'kind');
  if (
    kind.kind === 'value' &&
    typeof kind.value === 'string' &&
    !['section', 'tabs', 'accordion', 'grid'].includes(kind.value)
  ) {
    diagnostics.push(
      invalidUiPresentation('unsupported-entry-kind', [...frame.path, 'kind'], {
        expected: 'section, tabs, accordion or grid',
        actualType: 'string',
      }),
    );
    return true;
  }

  if (kind.kind !== 'value' || kind.value === 'section') {
    return inspectPresentationSectionFrame(
      frame,
      kind,
      firstContainers,
      active,
      diagnostics,
      stack,
    );
  }
  if (kind.value === 'tabs' || kind.value === 'accordion') {
    return inspectPresentationPanelsContainerFrame(
      frame,
      kind.value,
      firstContainers,
      active,
      diagnostics,
      stack,
    );
  }
  if (kind.value === 'grid') {
    return inspectPresentationGridFrame(
      frame,
      firstContainers,
      active,
      diagnostics,
      stack,
    );
  }

  return inspectPresentationSectionFrame(
    frame,
    kind,
    firstContainers,
    active,
    diagnostics,
    stack,
  );
}

function inspectPresentationSectionFrame(
  frame: PresentationEntryFrame,
  kind: PresentationMember,
  firstContainers: Map<string, readonly (string | number)[]>,
  active: Map<object, readonly (string | number)[]>,
  diagnostics: Diagnostic[],
  stack: PresentationInspectionFrame[],
): boolean {
  const section = frame.value as Record<string, unknown>;
  const id = presentationMember(section, 'id');
  const label = presentationMember(section, 'label');
  const children = presentationMember(section, 'children');
  let invalid = inspectPresentationSectionMember(
    kind,
    'kind',
    'section',
    frame.path,
    diagnostics,
    (value) => value === 'section',
  );
  invalid =
    inspectPresentationSectionMember(
      id,
      'id',
      'non-empty string',
      frame.path,
      diagnostics,
      isNonEmptyString,
    ) || invalid;
  invalid = inspectPresentationLabel(label, frame.path, diagnostics) || invalid;
  invalid =
    inspectPresentationSectionMember(
      children,
      'children',
      'non-empty dense array',
      frame.path,
      diagnostics,
      Array.isArray,
    ) || invalid;

  const sectionId = memberNonEmptyString(id);
  const sectionLabel = memberNonBlankString(label);
  if (
    sectionId !== undefined &&
    registerContainerId(
      'section',
      sectionId,
      frame.path,
      firstContainers,
      diagnostics,
    )
  ) {
    invalid = true;
  }
  inspectUnknownPresentationKeys(
    section,
    ['kind', 'id', 'label', 'children'],
    frame.path,
    diagnostics,
  );

  if (children.kind !== 'value' || !Array.isArray(children.value))
    return invalid;
  if (children.value.length === 0) {
    if (sectionId !== undefined) {
      diagnostics.push(
        invalidUiPresentation('empty-section', [...frame.path, 'children'], {
          sectionId,
          expected: 'non-empty dense children array',
        }),
      );
      return true;
    }
    return invalid;
  }

  const parsedChildren: ParsedPresentationEntry[] = [];
  if (
    kind.kind === 'value' &&
    kind.value === 'section' &&
    sectionId !== undefined &&
    sectionLabel !== undefined
  ) {
    frame.output.push({
      kind: 'section',
      id: sectionId,
      label: sectionLabel,
      children: parsedChildren,
    });
  }
  active.set(section, frame.path);
  stack.push({ kind: 'exit', value: section });
  pushPresentationEntries(
    children.value,
    [...frame.path, 'children'],
    parsedChildren,
    stack,
  );
  return invalid;
}

function inspectPresentationPanelsContainerFrame(
  frame: PresentationEntryFrame,
  containerKind: 'tabs' | 'accordion',
  firstContainers: Map<string, readonly (string | number)[]>,
  active: Map<object, readonly (string | number)[]>,
  diagnostics: Diagnostic[],
  stack: PresentationInspectionFrame[],
): boolean {
  const container = frame.value as Record<string, unknown>;
  const id = presentationMember(container, 'id');
  const label = presentationMember(container, 'label');
  const panels = presentationMember(container, 'panels');
  let invalid = inspectContainerMember(
    id,
    containerKind,
    'id',
    'non-empty string',
    frame.path,
    diagnostics,
    isNonEmptyString,
  );
  invalid =
    inspectContainerLabel(label, containerKind, frame.path, diagnostics) ||
    invalid;
  invalid =
    inspectContainerMember(
      panels,
      containerKind,
      'panels',
      'non-empty dense panels array',
      frame.path,
      diagnostics,
      Array.isArray,
    ) || invalid;

  const containerId = memberNonEmptyString(id);
  const containerLabel = memberNonBlankString(label);
  if (
    containerId !== undefined &&
    registerContainerId(
      containerKind,
      containerId,
      frame.path,
      firstContainers,
      diagnostics,
    )
  ) {
    invalid = true;
  }
  inspectUnknownPresentationKeys(
    container,
    ['kind', 'id', 'label', 'panels'],
    frame.path,
    diagnostics,
  );

  if (panels.kind !== 'value' || !Array.isArray(panels.value)) return invalid;
  if (panels.value.length === 0) {
    if (containerId !== undefined) {
      diagnostics.push(
        invalidUiPresentation('empty-panels', [...frame.path, 'panels'], {
          containerKind,
          containerId,
          expected: 'non-empty dense panels array',
        }),
      );
      return true;
    }
    return invalid;
  }

  const parsedPanels: ParsedPresentationPanel[] = [];
  if (containerId !== undefined && containerLabel !== undefined) {
    frame.output.push({
      kind: containerKind,
      id: containerId,
      label: containerLabel,
      panels: parsedPanels,
    });
  }
  active.set(container, frame.path);
  stack.push({ kind: 'exit', value: container });
  pushPresentationPanels(
    panels.value,
    [...frame.path, 'panels'],
    containerKind,
    containerId,
    parsedPanels,
    new Map(),
    stack,
  );
  return invalid;
}

function inspectPresentationGridFrame(
  frame: PresentationEntryFrame,
  firstContainers: Map<string, readonly (string | number)[]>,
  active: Map<object, readonly (string | number)[]>,
  diagnostics: Diagnostic[],
  stack: PresentationInspectionFrame[],
): boolean {
  const grid = frame.value as Record<string, unknown>;
  const id = presentationMember(grid, 'id');
  const label = presentationMember(grid, 'label');
  const columns = presentationMember(grid, 'columns');
  const items = presentationMember(grid, 'items');
  let invalid = inspectContainerMember(
    id,
    'grid',
    'id',
    'non-empty string',
    frame.path,
    diagnostics,
    isNonEmptyString,
  );
  invalid =
    inspectContainerLabel(label, 'grid', frame.path, diagnostics) || invalid;
  invalid =
    inspectContainerMember(
      columns,
      'grid',
      'columns',
      'integer from 1 through 4',
      frame.path,
      diagnostics,
      isGridInteger,
    ) || invalid;
  invalid =
    inspectContainerMember(
      items,
      'grid',
      'items',
      'non-empty dense items array',
      frame.path,
      diagnostics,
      Array.isArray,
    ) || invalid;

  const gridId = memberNonEmptyString(id);
  const gridLabel = memberNonBlankString(label);
  const gridColumns =
    columns.kind === 'value' && isGridInteger(columns.value)
      ? columns.value
      : undefined;
  if (
    gridId !== undefined &&
    registerContainerId(
      'grid',
      gridId,
      frame.path,
      firstContainers,
      diagnostics,
    )
  ) {
    invalid = true;
  }
  inspectUnknownPresentationKeys(
    grid,
    ['kind', 'id', 'label', 'columns', 'items'],
    frame.path,
    diagnostics,
  );

  if (items.kind !== 'value' || !Array.isArray(items.value)) return invalid;
  if (items.value.length === 0) {
    if (gridId !== undefined) {
      diagnostics.push(
        invalidUiPresentation('empty-grid', [...frame.path, 'items'], {
          containerId: gridId,
          expected: 'non-empty dense items array',
        }),
      );
      return true;
    }
    return invalid;
  }

  const parsedItems: ParsedGridItem[] = [];
  if (
    gridId !== undefined &&
    gridLabel !== undefined &&
    gridColumns !== undefined
  ) {
    frame.output.push({
      kind: 'grid',
      id: gridId,
      label: gridLabel,
      columns: gridColumns,
      items: parsedItems,
    });
  }
  active.set(grid, frame.path);
  stack.push({ kind: 'exit', value: grid });
  pushPresentationGridItems(
    items.value,
    [...frame.path, 'items'],
    gridColumns,
    parsedItems,
    stack,
  );
  return invalid;
}

function inspectPresentationPanelFrame(
  frame: PresentationPanelFrame,
  active: Map<object, readonly (string | number)[]>,
  diagnostics: Diagnostic[],
  stack: PresentationInspectionFrame[],
): boolean {
  if (frame.value === SPARSE_PRESENTATION_ENTRY) {
    diagnostics.push(
      invalidUiPresentation('sparse-panel', frame.path, {
        containerKind: frame.containerKind,
        panelIndex: frame.index,
      }),
    );
    return true;
  }
  if (frame.value === ACCESSOR_PRESENTATION_ENTRY) {
    diagnostics.push(
      invalidUiPresentation('panel-accessor', frame.path, {
        containerKind: frame.containerKind,
        panelIndex: frame.index,
      }),
    );
    return true;
  }
  if (!isOrdinaryRecord(frame.value)) {
    diagnostics.push(
      invalidUiPresentation('panel-not-object', frame.path, {
        containerKind: frame.containerKind,
        panelIndex: frame.index,
        expected: 'panel object',
        actualType: actualType(frame.value),
      }),
    );
    return true;
  }
  const firstActivePath = active.get(frame.value);
  if (firstActivePath !== undefined) {
    diagnostics.push(
      invalidUiPresentation('cyclic-presentation', frame.path, {
        firstDocumentPath: [...firstActivePath],
      }),
    );
    return true;
  }

  const panel = frame.value;
  const kind = presentationMember(panel, 'kind');
  const id = presentationMember(panel, 'id');
  const label = presentationMember(panel, 'label');
  const children = presentationMember(panel, 'children');
  let invalid = inspectPanelMember(
    kind,
    frame,
    'kind',
    'panel',
    diagnostics,
    (value) => value === 'panel',
  );
  invalid =
    inspectPanelMember(
      id,
      frame,
      'id',
      'non-empty string',
      diagnostics,
      isNonEmptyString,
    ) || invalid;
  invalid = inspectPanelLabel(label, frame, diagnostics) || invalid;
  invalid =
    inspectPanelMember(
      children,
      frame,
      'children',
      'non-empty dense children array',
      diagnostics,
      Array.isArray,
    ) || invalid;

  const panelId = memberNonEmptyString(id);
  const panelLabel = memberNonBlankString(label);
  if (panelId !== undefined && frame.containerId !== undefined) {
    const idPath = [...frame.path, 'id'];
    const firstDocumentPath = frame.firstPanels.get(panelId);
    if (firstDocumentPath !== undefined) {
      invalid = true;
      diagnostics.push(
        invalidUiPresentation('duplicate-panel-id', idPath, {
          containerKind: frame.containerKind,
          containerId: frame.containerId,
          panelId,
          firstDocumentPath: [...firstDocumentPath],
        }),
      );
    } else frame.firstPanels.set(panelId, idPath);
  }
  inspectUnknownPresentationKeys(
    panel,
    ['kind', 'id', 'label', 'children'],
    frame.path,
    diagnostics,
  );

  if (children.kind !== 'value' || !Array.isArray(children.value))
    return invalid;
  if (children.value.length === 0) {
    if (panelId !== undefined) {
      diagnostics.push(
        invalidUiPresentation('empty-panel', [...frame.path, 'children'], {
          containerKind: frame.containerKind,
          panelId,
          expected: 'non-empty dense children array',
        }),
      );
      return true;
    }
    return invalid;
  }

  const parsedChildren: ParsedPresentationEntry[] = [];
  if (
    kind.kind === 'value' &&
    kind.value === 'panel' &&
    panelId !== undefined &&
    panelLabel !== undefined
  ) {
    frame.output.push({
      id: panelId,
      label: panelLabel,
      children: parsedChildren,
    });
  }
  active.set(panel, frame.path);
  stack.push({ kind: 'exit', value: panel });
  pushPresentationEntries(
    children.value,
    [...frame.path, 'children'],
    parsedChildren,
    stack,
  );
  return invalid;
}

function inspectPresentationGridItemFrame(
  frame: PresentationGridItemFrame,
  active: Map<object, readonly (string | number)[]>,
  diagnostics: Diagnostic[],
  stack: PresentationInspectionFrame[],
): boolean {
  if (frame.value === SPARSE_PRESENTATION_ENTRY) {
    diagnostics.push(
      invalidUiPresentation('sparse-grid-item', frame.path, {
        itemIndex: frame.index,
      }),
    );
    return true;
  }
  if (frame.value === ACCESSOR_PRESENTATION_ENTRY) {
    diagnostics.push(
      invalidUiPresentation('grid-item-accessor', frame.path, {
        itemIndex: frame.index,
      }),
    );
    return true;
  }
  if (!isOrdinaryRecord(frame.value)) {
    diagnostics.push(
      invalidUiPresentation('grid-item-not-object', frame.path, {
        itemIndex: frame.index,
        expected: 'grid item object',
        actualType: actualType(frame.value),
      }),
    );
    return true;
  }
  const firstActivePath = active.get(frame.value);
  if (firstActivePath !== undefined) {
    diagnostics.push(
      invalidUiPresentation('cyclic-presentation', frame.path, {
        firstDocumentPath: [...firstActivePath],
      }),
    );
    return true;
  }

  const item = frame.value;
  const span = presentationMember(item, 'span');
  const child = presentationMember(item, 'child');
  let invalid = false;
  let normalizedSpan: 1 | 2 | 3 | 4 = 1;
  if (span.kind === 'accessor') {
    invalid = true;
    diagnostics.push(
      invalidUiPresentation(
        'grid-item-member-accessor',
        [...frame.path, 'span'],
        {
          itemIndex: frame.index,
          member: 'span',
          expected: 'integer from 1 through 4',
        },
      ),
    );
  } else if (span.kind === 'value') {
    if (!isGridInteger(span.value)) {
      invalid = true;
      diagnostics.push(
        invalidUiPresentation(
          'grid-item-member-invalid',
          [...frame.path, 'span'],
          {
            itemIndex: frame.index,
            member: 'span',
            expected: 'integer from 1 through 4',
            actualType: actualType(span.value),
          },
        ),
      );
    } else {
      normalizedSpan = span.value;
      if (frame.columns !== undefined && normalizedSpan > frame.columns) {
        invalid = true;
        diagnostics.push(
          invalidUiPresentation(
            'grid-span-exceeds-columns',
            [...frame.path, 'span'],
            {
              itemIndex: frame.index,
              span: normalizedSpan,
              columns: frame.columns,
              expected: 'integer not greater than grid columns',
            },
          ),
        );
      }
    }
  }

  let childInspectable = false;
  if (child.kind === 'missing') {
    invalid = true;
    diagnostics.push(
      invalidUiPresentation(
        'grid-item-member-missing',
        [...frame.path, 'child'],
        {
          itemIndex: frame.index,
          member: 'child',
          expected: 'presentation entry',
        },
      ),
    );
  } else if (child.kind === 'accessor') {
    invalid = true;
    diagnostics.push(
      invalidUiPresentation(
        'grid-item-member-accessor',
        [...frame.path, 'child'],
        {
          itemIndex: frame.index,
          member: 'child',
          expected: 'presentation entry',
        },
      ),
    );
  } else if (
    typeof child.value !== 'string' &&
    !isOrdinaryRecord(child.value)
  ) {
    invalid = true;
    diagnostics.push(
      invalidUiPresentation(
        'grid-item-member-invalid',
        [...frame.path, 'child'],
        {
          itemIndex: frame.index,
          member: 'child',
          expected: 'presentation entry',
          actualType: actualType(child.value),
        },
      ),
    );
  } else childInspectable = true;

  inspectUnknownPresentationKeys(
    item,
    ['span', 'child'],
    frame.path,
    diagnostics,
  );
  if (!childInspectable || child.kind !== 'value') return invalid;

  const parsedChild: ParsedPresentationEntry[] = [];
  frame.output.push({ span: normalizedSpan, child: parsedChild });
  active.set(item, frame.path);
  stack.push({ kind: 'exit', value: item });
  stack.push({
    kind: 'entry',
    value: child.value,
    index: 0,
    path: [...frame.path, 'child'],
    output: parsedChild,
  });
  return invalid;
}

function presentationNodeOrder(
  ui: object,
  nodeNames: readonly string[],
): readonly string[] {
  const known = new Set(nodeNames);
  const seen = new Set<string>();
  const result: string[] = [];
  const order = ownDataValue(ui, 'order');
  if (order.present && !order.accessor && Array.isArray(order.value)) {
    for (let index = 0; index < order.value.length; index += 1) {
      const descriptor = Object.getOwnPropertyDescriptor(
        order.value,
        String(index),
      );
      if (descriptor === undefined || !('value' in descriptor)) continue;
      const name: unknown = descriptor.value;
      if (typeof name !== 'string' || !known.has(name) || seen.has(name))
        continue;
      seen.add(name);
      result.push(name);
    }
  }
  for (const name of nodeNames) {
    if (!seen.has(name)) result.push(name);
  }
  return result;
}

type PresentationEntryFrame = {
  readonly kind: 'entry';
  readonly value: unknown;
  readonly index: number;
  readonly path: readonly (string | number)[];
  readonly output: ParsedPresentationEntry[];
};

type PresentationPanelFrame = {
  readonly kind: 'panel';
  readonly value: unknown;
  readonly index: number;
  readonly path: readonly (string | number)[];
  readonly containerKind: 'tabs' | 'accordion';
  readonly containerId: string | undefined;
  readonly output: ParsedPresentationPanel[];
  readonly firstPanels: Map<string, readonly (string | number)[]>;
};

type PresentationGridItemFrame = {
  readonly kind: 'grid-item';
  readonly value: unknown;
  readonly index: number;
  readonly path: readonly (string | number)[];
  readonly columns: 1 | 2 | 3 | 4 | undefined;
  readonly output: ParsedGridItem[];
};

type PresentationInspectionFrame =
  | PresentationEntryFrame
  | PresentationPanelFrame
  | PresentationGridItemFrame
  | { readonly kind: 'exit'; readonly value: object };

function pushPresentationEntries(
  entries: readonly unknown[],
  basePath: readonly (string | number)[],
  output: ParsedPresentationEntry[],
  stack: PresentationInspectionFrame[],
): void {
  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const descriptor = Object.getOwnPropertyDescriptor(entries, String(index));
    const path = [...basePath, index];
    if (descriptor === undefined) {
      stack.push({
        kind: 'entry',
        value: SPARSE_PRESENTATION_ENTRY,
        index,
        path,
        output,
      });
    } else if (!('value' in descriptor)) {
      stack.push({
        kind: 'entry',
        value: ACCESSOR_PRESENTATION_ENTRY,
        index,
        path,
        output,
      });
    } else
      stack.push({
        kind: 'entry',
        value: descriptor.value,
        index,
        path,
        output,
      });
  }
}

function pushPresentationPanels(
  panels: readonly unknown[],
  basePath: readonly (string | number)[],
  containerKind: 'tabs' | 'accordion',
  containerId: string | undefined,
  output: ParsedPresentationPanel[],
  firstPanels: Map<string, readonly (string | number)[]>,
  stack: PresentationInspectionFrame[],
): void {
  for (let index = panels.length - 1; index >= 0; index -= 1) {
    const descriptor = Object.getOwnPropertyDescriptor(panels, String(index));
    stack.push({
      kind: 'panel',
      value:
        descriptor === undefined
          ? SPARSE_PRESENTATION_ENTRY
          : 'value' in descriptor
            ? descriptor.value
            : ACCESSOR_PRESENTATION_ENTRY,
      index,
      path: [...basePath, index],
      containerKind,
      containerId,
      output,
      firstPanels,
    });
  }
}

function pushPresentationGridItems(
  items: readonly unknown[],
  basePath: readonly (string | number)[],
  columns: 1 | 2 | 3 | 4 | undefined,
  output: ParsedGridItem[],
  stack: PresentationInspectionFrame[],
): void {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    const descriptor = Object.getOwnPropertyDescriptor(items, String(index));
    stack.push({
      kind: 'grid-item',
      value:
        descriptor === undefined
          ? SPARSE_PRESENTATION_ENTRY
          : 'value' in descriptor
            ? descriptor.value
            : ACCESSOR_PRESENTATION_ENTRY,
      index,
      path: [...basePath, index],
      columns,
      output,
    });
  }
}

const SPARSE_PRESENTATION_ENTRY = Symbol('sparse-presentation-entry');
const ACCESSOR_PRESENTATION_ENTRY = Symbol('accessor-presentation-entry');

type PresentationMember =
  | { readonly kind: 'missing' }
  | { readonly kind: 'accessor' }
  | { readonly kind: 'value'; readonly value: unknown };

function presentationMember(value: object, member: string): PresentationMember {
  const descriptor = Object.getOwnPropertyDescriptor(value, member);
  if (descriptor === undefined || descriptor.enumerable !== true)
    return { kind: 'missing' };
  return 'value' in descriptor
    ? { kind: 'value', value: descriptor.value }
    : { kind: 'accessor' };
}

function inspectPresentationSectionMember(
  inspected: PresentationMember,
  member: string,
  expected: string,
  sectionPath: readonly (string | number)[],
  diagnostics: Diagnostic[],
  valid: (value: unknown) => boolean,
): boolean {
  const documentPath = [...sectionPath, member];
  if (inspected.kind === 'missing') {
    diagnostics.push(
      invalidUiPresentation('section-member-missing', documentPath, {
        member,
        expected,
      }),
    );
    return true;
  }
  if (inspected.kind === 'accessor') {
    diagnostics.push(
      invalidUiPresentation('section-member-accessor', documentPath, {
        member,
        expected,
      }),
    );
    return true;
  }
  if (!valid(inspected.value)) {
    diagnostics.push(
      invalidUiPresentation('section-member-invalid', documentPath, {
        member,
        expected,
        actualType: actualType(inspected.value),
      }),
    );
    return true;
  }
  return false;
}

function inspectPresentationLabel(
  inspected: PresentationMember,
  sectionPath: readonly (string | number)[],
  diagnostics: Diagnostic[],
): boolean {
  if (
    inspected.kind !== 'value' ||
    typeof inspected.value !== 'string' ||
    inspected.value.trim().length > 0
  ) {
    return inspectPresentationSectionMember(
      inspected,
      'label',
      'non-blank string',
      sectionPath,
      diagnostics,
      (value) => typeof value === 'string',
    );
  }
  diagnostics.push(
    invalidUiPresentation('section-member-blank', [...sectionPath, 'label'], {
      member: 'label',
      expected: 'non-blank string',
    }),
  );
  return true;
}

function inspectContainerMember(
  inspected: PresentationMember,
  containerKind: 'tabs' | 'accordion' | 'grid',
  member: string,
  expected: string,
  containerPath: readonly (string | number)[],
  diagnostics: Diagnostic[],
  valid: (value: unknown) => boolean,
): boolean {
  const documentPath = [...containerPath, member];
  if (inspected.kind === 'missing') {
    diagnostics.push(
      invalidUiPresentation('container-member-missing', documentPath, {
        containerKind,
        member,
        expected,
      }),
    );
    return true;
  }
  if (inspected.kind === 'accessor') {
    diagnostics.push(
      invalidUiPresentation('container-member-accessor', documentPath, {
        containerKind,
        member,
        expected,
      }),
    );
    return true;
  }
  if (!valid(inspected.value)) {
    diagnostics.push(
      invalidUiPresentation('container-member-invalid', documentPath, {
        containerKind,
        member,
        expected,
        actualType: actualType(inspected.value),
      }),
    );
    return true;
  }
  return false;
}

function inspectContainerLabel(
  inspected: PresentationMember,
  containerKind: 'tabs' | 'accordion' | 'grid',
  containerPath: readonly (string | number)[],
  diagnostics: Diagnostic[],
): boolean {
  if (
    inspected.kind !== 'value' ||
    typeof inspected.value !== 'string' ||
    inspected.value.trim().length > 0
  ) {
    return inspectContainerMember(
      inspected,
      containerKind,
      'label',
      'non-blank string',
      containerPath,
      diagnostics,
      (value) => typeof value === 'string',
    );
  }
  diagnostics.push(
    invalidUiPresentation(
      'container-member-blank',
      [...containerPath, 'label'],
      {
        containerKind,
        member: 'label',
        expected: 'non-blank string',
      },
    ),
  );
  return true;
}

function inspectPanelMember(
  inspected: PresentationMember,
  frame: PresentationPanelFrame,
  member: string,
  expected: string,
  diagnostics: Diagnostic[],
  valid: (value: unknown) => boolean,
): boolean {
  const documentPath = [...frame.path, member];
  const parameters = {
    containerKind: frame.containerKind,
    panelIndex: frame.index,
    member,
    expected,
  };
  if (inspected.kind === 'missing') {
    diagnostics.push(
      invalidUiPresentation('panel-member-missing', documentPath, parameters),
    );
    return true;
  }
  if (inspected.kind === 'accessor') {
    diagnostics.push(
      invalidUiPresentation('panel-member-accessor', documentPath, parameters),
    );
    return true;
  }
  if (!valid(inspected.value)) {
    diagnostics.push(
      invalidUiPresentation('panel-member-invalid', documentPath, {
        ...parameters,
        actualType: actualType(inspected.value),
      }),
    );
    return true;
  }
  return false;
}

function inspectPanelLabel(
  inspected: PresentationMember,
  frame: PresentationPanelFrame,
  diagnostics: Diagnostic[],
): boolean {
  if (
    inspected.kind !== 'value' ||
    typeof inspected.value !== 'string' ||
    inspected.value.trim().length > 0
  ) {
    return inspectPanelMember(
      inspected,
      frame,
      'label',
      'non-blank string',
      diagnostics,
      (value) => typeof value === 'string',
    );
  }
  diagnostics.push(
    invalidUiPresentation('panel-member-blank', [...frame.path, 'label'], {
      containerKind: frame.containerKind,
      panelIndex: frame.index,
      member: 'label',
      expected: 'non-blank string',
    }),
  );
  return true;
}

function registerContainerId(
  containerKind: 'section' | 'tabs' | 'accordion' | 'grid',
  containerId: string,
  containerPath: readonly (string | number)[],
  firstContainers: Map<string, readonly (string | number)[]>,
  diagnostics: Diagnostic[],
): boolean {
  const idPath = [...containerPath, 'id'];
  const firstDocumentPath = firstContainers.get(containerId);
  if (firstDocumentPath === undefined) {
    firstContainers.set(containerId, idPath);
    return false;
  }
  diagnostics.push(
    containerKind === 'section'
      ? invalidUiPresentation('duplicate-section-id', idPath, {
          sectionId: containerId,
          firstDocumentPath: [...firstDocumentPath],
        })
      : invalidUiPresentation('duplicate-container-id', idPath, {
          containerKind,
          containerId,
          firstDocumentPath: [...firstDocumentPath],
        }),
  );
  return true;
}

function inspectUnknownPresentationKeys(
  value: object,
  knownKeys: readonly string[],
  path: readonly (string | number)[],
  diagnostics: Diagnostic[],
): void {
  const known = new Set(knownKeys);
  for (const key of Object.keys(value)) {
    if (!known.has(key)) diagnostics.push(unknownUiKey(key, [...path, key]));
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isGridInteger(value: unknown): value is 1 | 2 | 3 | 4 {
  return (
    Number.isInteger(value) &&
    typeof value === 'number' &&
    value >= 1 &&
    value <= 4
  );
}

function memberNonEmptyString(member: PresentationMember): string | undefined {
  return member.kind === 'value' && isNonEmptyString(member.value)
    ? member.value
    : undefined;
}

function memberNonBlankString(member: PresentationMember): string | undefined {
  return member.kind === 'value' &&
    typeof member.value === 'string' &&
    member.value.trim().length > 0
    ? member.value
    : undefined;
}

function inspectUiOrder(
  value: unknown,
  knownFields: ReadonlySet<string> | undefined,
  order: string[],
  diagnostics: Diagnostic[],
): void {
  if (!Array.isArray(value)) {
    diagnostics.push(
      invalidUiValue('order', value, 'array of strings', ['order']),
    );
    return;
  }

  const seen = new Map<string, number>();
  value.forEach((entry, index) => {
    if (typeof entry !== 'string') {
      diagnostics.push(
        invalidUiValue('order', entry, 'string', ['order', index]),
      );
      return;
    }

    if (knownFields === undefined) {
      return;
    }

    if (!knownFields.has(entry)) {
      diagnostics.push(
        diagnostic({
          code: 'UNKNOWN_UI_ORDER_FIELD',
          severity: 'warning',
          source: 'ui-schema',
          dataPath: [entry],
          documentPath: ['order', index],
          parameters: { field: entry, index },
          fallbackMessage: `UI order references unknown field "${entry}".`,
        }),
      );
      return;
    }

    const firstIndex = seen.get(entry);
    if (firstIndex !== undefined) {
      diagnostics.push(
        diagnostic({
          code: 'DUPLICATE_UI_ORDER_FIELD',
          severity: 'warning',
          source: 'ui-schema',
          dataPath: [entry],
          documentPath: ['order', index],
          parameters: { field: entry, firstIndex, duplicateIndex: index },
          fallbackMessage: `UI order repeats field "${entry}".`,
        }),
      );
      return;
    }

    seen.set(entry, index);
    order.push(entry);
  });
}

function inspectUiFields(
  value: unknown,
  knownFields: ReadonlySet<string> | undefined,
  candidatesByName: ReadonlyMap<string, FieldCandidate> | undefined,
  fields: Map<string, ParsedFieldUi>,
  diagnostics: Diagnostic[],
): void {
  if (!isRecord(value)) {
    diagnostics.push(invalidUiValue('fields', value, 'object', ['fields']));
    return;
  }

  for (const name of Object.keys(value)) {
    if (knownFields !== undefined && !knownFields.has(name)) {
      diagnostics.push(
        diagnostic({
          code: 'UNKNOWN_UI_FIELD',
          severity: 'warning',
          source: 'ui-schema',
          dataPath: [name],
          documentPath: ['fields', name],
          parameters: { field: name },
          fallbackMessage: `UI Schema references unknown field "${name}".`,
        }),
      );
      continue;
    }

    const rawFieldUi = value[name];
    if (!isRecord(rawFieldUi)) {
      diagnostics.push(
        invalidUiValue(name, rawFieldUi, 'object', ['fields', name], [name]),
      );
      continue;
    }

    const parsed = inspectFieldUi(
      name,
      rawFieldUi,
      candidatesByName?.get(name),
      diagnostics,
    );
    if (knownFields?.has(name) && candidatesByName?.has(name)) {
      fields.set(name, parsed);
    }
  }
}

function inspectFieldUi(
  name: string,
  value: Record<string, unknown>,
  candidate: FieldCandidate | undefined,
  diagnostics: Diagnostic[],
): ParsedFieldUi {
  const parsed: {
    label?: string;
    description?: string;
    hint?: string;
    tooltip?: string;
    placeholder?: string;
    decimalPlaces?: number;
    showTrailingZeros?: boolean;
    enumLabels?: ReadonlyMap<string, string>;
  } = {};

  for (const key of Object.keys(value)) {
    const documentPath = ['fields', name, key] as const;

    if (!UI_FIELD_KEYS.has(key)) {
      diagnostics.push(unknownUiKey(key, documentPath, [name]));
      continue;
    }

    if (key === 'enumLabels') {
      inspectEnumLabels(name, value, candidate, parsed, diagnostics);
      continue;
    }

    const rawValue = value[key];
    const fieldType = candidate?.type;

    if (UI_TEXT_KEYS.has(key)) {
      if (typeof rawValue !== 'string') {
        diagnostics.push(
          invalidUiValue(key, rawValue, 'string', documentPath, [name]),
        );
      } else if (key === 'placeholder') {
        if (fieldType === 'boolean') {
          diagnostics.push(
            diagnostic({
              code: 'INCOMPATIBLE_PLACEHOLDER',
              severity: 'warning',
              source: 'ui-schema',
              dataPath: [name],
              documentPath,
              parameters: { field: name, fieldType },
              fallbackMessage: `Placeholder is incompatible with boolean field "${name}".`,
            }),
          );
        } else if (fieldType !== undefined) {
          parsed.placeholder = rawValue;
        }
      } else {
        parsed[key as 'label' | 'description' | 'hint' | 'tooltip'] = rawValue;
      }
    } else {
      inspectUiOptions(name, rawValue, fieldType, parsed, diagnostics);
    }
  }

  return parsed;
}

function inspectEnumLabels(
  name: string,
  fieldUi: Record<string, unknown>,
  candidate: FieldCandidate | undefined,
  parsed: { enumLabels?: ReadonlyMap<string, string> },
  diagnostics: Diagnostic[],
): void {
  const documentPath = ['fields', name, 'enumLabels'] as const;
  const descriptor = Object.getOwnPropertyDescriptor(fieldUi, 'enumLabels');

  if (descriptor === undefined || !('value' in descriptor)) {
    diagnostics.push(
      invalidUiDescriptor(
        'enumLabels',
        'object',
        documentPath,
        [name],
        descriptor === undefined ? 'missing' : 'accessor',
      ),
    );
    return;
  }

  const value: unknown = descriptor.value;
  if (!isRecord(value)) {
    diagnostics.push(
      invalidUiValue('enumLabels', value, 'object', documentPath, [name]),
    );
    return;
  }

  if (
    candidate === undefined ||
    candidate.stringEnum.kind === 'schema-blocked'
  ) {
    return;
  }

  if (candidate.stringEnum.kind === 'absent') {
    diagnostics.push(
      diagnostic({
        code: 'INCOMPATIBLE_UI_OPTION',
        severity: 'warning',
        source: 'ui-schema',
        dataPath: [name],
        documentPath,
        parameters: {
          field: name,
          fieldType: candidate.type,
          option: 'enumLabels',
          reason: 'missing-compatible-enum',
        },
        fallbackMessage: `UI option "enumLabels" requires a compatible string enum on field "${name}".`,
      }),
    );
    return;
  }

  const enumValues = new Set(candidate.stringEnum.values);
  const labels = new Map<string, string>();

  for (const labelKey of Object.keys(value)) {
    const labelPath = [...documentPath, labelKey] as const;
    const labelDescriptor = Object.getOwnPropertyDescriptor(value, labelKey);

    if (labelDescriptor === undefined || !('value' in labelDescriptor)) {
      diagnostics.push(
        invalidUiDescriptor(
          labelKey,
          'non-blank string',
          labelPath,
          [name],
          labelDescriptor === undefined ? 'missing' : 'accessor',
        ),
      );
      continue;
    }

    const label: unknown = labelDescriptor.value;
    if (typeof label !== 'string' || label.trim().length === 0) {
      diagnostics.push(
        invalidUiValue(labelKey, label, 'non-blank string', labelPath, [name]),
      );
      continue;
    }

    if (!enumValues.has(labelKey)) {
      diagnostics.push(
        diagnostic({
          code: 'UNKNOWN_ENUM_LABEL',
          severity: 'warning',
          source: 'ui-schema',
          dataPath: [name],
          documentPath: labelPath,
          parameters: { field: name, value: labelKey },
          fallbackMessage: `UI enum label references unknown value "${labelKey}".`,
        }),
      );
      continue;
    }

    labels.set(labelKey, label);
  }

  parsed.enumLabels = labels;
}

function inspectUiOptions(
  name: string,
  value: unknown,
  fieldType: FieldType | undefined,
  parsed: {
    decimalPlaces?: number;
    showTrailingZeros?: boolean;
  },
  diagnostics: Diagnostic[],
): void {
  if (!isRecord(value)) {
    diagnostics.push(
      invalidUiValue(
        'options',
        value,
        'object',
        ['fields', name, 'options'],
        [name],
      ),
    );
    return;
  }

  for (const option of Object.keys(value)) {
    const optionValue = value[option];
    const documentPath = ['fields', name, 'options', option] as const;

    if (!UI_OPTION_KEYS.has(option)) {
      diagnostics.push(unknownUiKey(option, documentPath, [name]));
      continue;
    }

    const valid =
      option === 'decimalPlaces'
        ? Number.isInteger(optionValue) && (optionValue as number) >= 0
        : typeof optionValue === 'boolean';
    if (!valid) {
      diagnostics.push(
        invalidUiValue(
          option,
          optionValue,
          option === 'decimalPlaces' ? 'non-negative integer' : 'boolean',
          documentPath,
          [name],
        ),
      );
      continue;
    }

    if (fieldType === undefined) {
      continue;
    }

    if (fieldType !== 'number' && fieldType !== 'integer') {
      diagnostics.push(
        diagnostic({
          code: 'INCOMPATIBLE_UI_OPTION',
          severity: 'warning',
          source: 'ui-schema',
          dataPath: [name],
          documentPath,
          parameters: { field: name, fieldType, option },
          fallbackMessage: `UI option "${option}" is incompatible with field "${name}".`,
        }),
      );
      continue;
    }

    if (option === 'decimalPlaces') {
      parsed.decimalPlaces = optionValue as number;
    } else {
      parsed.showTrailingZeros = optionValue as boolean;
    }
  }
}

function inspectNestedUiSchema(
  rawUiSchema: unknown,
  candidates: readonly NodeCandidate[],
  diagnostics: Diagnostic[],
  rootDocumentPath: readonly (string | number)[] = [],
  ancestorActive: ReadonlyMap<object, readonly (string | number)[]> = new Map(),
  identityProperty?: string,
  templateArrayPath?: readonly string[],
): ParsedUiSchema {
  const diagnosticsStart = diagnostics.length;
  const result: ParsedUiSchema & {
    readonly order: string[];
    readonly fields: Map<string, ParsedNodeUi>;
  } = {
    order: [] as string[],
    fields: new Map<string, ParsedNodeUi>(),
  };
  if (rawUiSchema === undefined) {
    return result;
  }
  if (!isOrdinaryRecord(rawUiSchema)) {
    diagnostics.push(
      diagnostic({
        code: 'INVALID_UI_SCHEMA',
        severity: 'error',
        source: 'ui-schema',
        parameters: { actualType: actualType(rawUiSchema) },
        fallbackMessage: 'UI Schema must be an object.',
      }),
    );
    return result;
  }
  if (templateArrayPath === undefined) {
    const presentation = inspectRootPresentation(
      rawUiSchema,
      candidates.map(({ name }) => name),
      diagnostics,
    );
    if (presentation !== undefined) result.presentation = presentation;
  } else if (ownDataValue(rawUiSchema, 'presentation').present) {
    diagnostics.push(
      invalidUiPresentation(
        'unsupported-location',
        [...rootDocumentPath, 'presentation'],
        { member: 'presentation', nodeKind: 'item' },
        templateArrayPath,
      ),
    );
  }

  type ContainerFrame =
    | { readonly kind: 'exit'; readonly ui: Record<string, unknown> }
    | {
        readonly kind: 'node';
        readonly candidate: NodeCandidate;
        readonly rawFields: Record<string, unknown> | undefined;
        readonly fields: Map<string, ParsedNodeUi>;
        readonly dataPath: readonly string[];
        readonly documentPath: readonly (string | number)[];
      }
    | {
        readonly kind: 'container';
        readonly ui: Record<string, unknown> | undefined;
        readonly candidates: readonly NodeCandidate[];
        readonly order: string[];
        readonly fields: Map<string, ParsedNodeUi>;
        readonly dataPath: readonly string[];
        readonly documentPath: readonly (string | number)[];
      };
  const active = new Map<object, readonly (string | number)[]>(ancestorActive);
  active.set(rawUiSchema, rootDocumentPath);
  const stack: ContainerFrame[] = [
    {
      kind: 'container',
      ui: rawUiSchema,
      candidates,
      order: result.order,
      fields: result.fields,
      dataPath: [],
      documentPath: rootDocumentPath,
    },
  ];

  while (stack.length > 0) {
    const frame = stack.pop();
    if (frame === undefined) {
      break;
    }
    if (frame.kind === 'exit') {
      active.delete(frame.ui);
      continue;
    }

    if (frame.kind === 'node') {
      const { candidate } = frame;
      const name = candidate.name;
      const nodePath = [...frame.dataPath, name];
      const uiPath = [...frame.documentPath, 'fields', name];
      const rawNodeValue =
        frame.rawFields === undefined
          ? { present: false as const }
          : ownDataValue(frame.rawFields, name);
      let rawNode: Record<string, unknown> | undefined;
      if (rawNodeValue.present) {
        if (!isOrdinaryRecord(rawNodeValue.value)) {
          diagnostics.push(
            rawNodeValue.accessor
              ? invalidUiDescriptor(
                  name,
                  'object',
                  uiPath,
                  nodePath,
                  'accessor',
                )
              : invalidUiValue(
                  name,
                  rawNodeValue.value,
                  'object',
                  uiPath,
                  nodePath,
                ),
          );
        } else {
          const firstDocumentPath = active.get(rawNodeValue.value);
          if (firstDocumentPath !== undefined) {
            diagnostics.push(
              diagnostic({
                code: 'CYCLIC_UI_SCHEMA_OBJECT',
                severity: 'error',
                source: 'ui-schema',
                dataPath: nodePath,
                documentPath: uiPath,
                parameters: { firstDocumentPath: [...firstDocumentPath] },
                fallbackMessage: 'UI Schema object cycle detected.',
              }),
            );
          } else {
            rawNode = rawNodeValue.value;
          }
        }
      }
      const parsed = inspectNestedNodeUi(
        candidate,
        rawNode,
        diagnostics,
        nodePath,
        uiPath,
      );
      frame.fields.set(name, parsed);
      if (candidate.type === 'object') {
        const objectUi = parsed as ParsedObjectUi;
        stack.push({
          kind: 'container',
          ui: rawNode,
          candidates: candidate.children,
          order: objectUi.order as string[],
          fields: objectUi.fields as Map<string, ParsedNodeUi>,
          dataPath: nodePath,
          documentPath: uiPath,
        });
      } else if (candidate.type === 'array') {
        const arrayUi = parsed as ParsedArrayUi;
        const itemMember =
          rawNode === undefined
            ? { present: false as const }
            : ownDataValue(rawNode, 'item');
        let rawItem: Record<string, unknown> | undefined;
        if (itemMember.present) {
          if (itemMember.accessor || !isOrdinaryRecord(itemMember.value)) {
            diagnostics.push(
              itemMember.accessor
                ? invalidUiDescriptor(
                    'item',
                    'item UI object',
                    [...uiPath, 'item'],
                    nodePath,
                    'accessor',
                  )
                : invalidUiValue(
                    'item',
                    itemMember.value,
                    'item UI object',
                    [...uiPath, 'item'],
                    nodePath,
                  ),
            );
          } else {
            const firstItemPath =
              rawNode !== undefined && itemMember.value === rawNode
                ? uiPath
                : active.get(itemMember.value);
            if (firstItemPath !== undefined) {
              diagnostics.push(
                diagnostic({
                  code: 'CYCLIC_UI_SCHEMA_OBJECT',
                  severity: 'error',
                  source: 'ui-schema',
                  dataPath: nodePath,
                  documentPath: [...uiPath, 'item'],
                  parameters: { firstDocumentPath: [...firstItemPath] },
                  fallbackMessage: 'UI Schema object cycle detected.',
                }),
              );
            } else rawItem = itemMember.value;
          }
        }
        if (rawItem !== undefined) {
          const nestedActive = new Map(active);
          if (rawNode !== undefined) nestedActive.set(rawNode, uiPath);
          arrayUi.item = inspectNestedUiSchema(
            rawItem,
            candidate.children,
            diagnostics,
            [...uiPath, 'item'],
            nestedActive,
            candidate.identityProperty,
            nodePath,
          );
        }
      }
      continue;
    }

    if (frame.ui !== undefined && frame.dataPath.length > 0) {
      active.set(frame.ui, frame.documentPath);
      stack.push({ kind: 'exit', ui: frame.ui });
    }

    const byName = new Map(
      frame.candidates.map((candidate) => [candidate.name, candidate] as const),
    );
    const knownNames = new Set(byName.keys());
    const fieldsPath = [...frame.documentPath, 'fields'];
    let rawFields: Record<string, unknown> | undefined;
    if (frame.ui !== undefined) {
      if (frame.dataPath.length === 0) {
        for (const key of Object.keys(frame.ui)) {
          if (key !== 'order' && key !== 'fields') {
            diagnostics.push(unknownUiKey(key, [...frame.documentPath, key]));
          }
        }
      }
      const orderValue = ownDataValue(frame.ui, 'order');
      if (orderValue.present) {
        if (orderValue.accessor) {
          diagnostics.push(
            invalidUiDescriptorAtPath(
              'order',
              'array of strings',
              [...frame.documentPath, 'order'],
              frame.dataPath,
              'accessor',
            ),
          );
        } else {
          inspectNestedUiOrder(
            orderValue.value,
            knownNames,
            frame.order,
            diagnostics,
            frame.dataPath,
            [...frame.documentPath, 'order'],
          );
        }
      }
      const fieldsValue = ownDataValue(frame.ui, 'fields');
      if (fieldsValue.present) {
        if (isOrdinaryRecord(fieldsValue.value)) {
          rawFields = fieldsValue.value;
        } else {
          diagnostics.push(
            fieldsValue.accessor
              ? invalidUiDescriptorAtPath(
                  'fields',
                  'object',
                  fieldsPath,
                  frame.dataPath,
                  'accessor',
                )
              : invalidUiValueAtPath(
                  'fields',
                  fieldsValue.value,
                  'object',
                  fieldsPath,
                  frame.dataPath,
                ),
          );
        }
      }
    }

    if (rawFields !== undefined) {
      for (const name of Object.keys(rawFields)) {
        if (!knownNames.has(name)) {
          diagnostics.push(
            name === identityProperty
              ? diagnostic({
                  code: 'INCOMPATIBLE_UI_OPTION',
                  severity: 'warning',
                  source: 'ui-schema',
                  dataPath: [...frame.dataPath, name],
                  documentPath: [...fieldsPath, name],
                  parameters: {
                    field: name,
                    fieldType: 'string',
                    option: 'identity',
                    reason: 'identity-property',
                  },
                  fallbackMessage: `UI identity entry is incompatible with field "${name}".`,
                })
              : diagnostic({
                  code: 'UNKNOWN_UI_FIELD',
                  severity: 'warning',
                  source: 'ui-schema',
                  dataPath: [...frame.dataPath, name],
                  documentPath: [...fieldsPath, name],
                  parameters: { field: name },
                  fallbackMessage: `UI Schema references unknown field "${name}".`,
                }),
          );
        }
      }
    }

    const orderedNames = [
      ...frame.order,
      ...frame.candidates
        .map((candidate) => candidate.name)
        .filter((name) => !frame.order.includes(name)),
    ];
    for (let index = orderedNames.length - 1; index >= 0; index -= 1) {
      const name = orderedNames[index] as string;
      const candidate = byName.get(name);
      if (candidate === undefined) {
        continue;
      }
      stack.push({
        kind: 'node',
        candidate,
        rawFields,
        fields: frame.fields,
        dataPath: frame.dataPath,
        documentPath: frame.documentPath,
      });
    }
  }
  if (templateArrayPath !== undefined) {
    for (let index = diagnosticsStart; index < diagnostics.length; index += 1) {
      const current = diagnostics[index];
      if (current === undefined) continue;
      if (current.code === 'INVALID_UI_PRESENTATION') continue;
      const templatePath = (current.dataPath ?? []).filter(
        (segment): segment is string => typeof segment === 'string',
      );
      diagnostics[index] = {
        ...current,
        dataPath: [...templateArrayPath],
        parameters: { ...current.parameters, templatePath },
      };
    }
  }
  return result;
}

type OwnValue =
  | { readonly present: false }
  | {
      readonly present: true;
      readonly accessor: boolean;
      readonly value: unknown;
    };

function ownDataValue(object: object, key: PropertyKey): OwnValue {
  const descriptor = Object.getOwnPropertyDescriptor(object, key);
  if (descriptor === undefined) {
    return { present: false };
  }
  return 'value' in descriptor
    ? { present: true, accessor: false, value: descriptor.value }
    : { present: true, accessor: true, value: ACCESSOR_VALUE };
}

function inspectNestedUiOrder(
  value: unknown,
  knownNames: ReadonlySet<string>,
  order: string[],
  diagnostics: Diagnostic[],
  parentDataPath: readonly string[],
  documentPath: readonly (string | number)[],
): void {
  if (!Array.isArray(value)) {
    diagnostics.push(
      invalidUiValueAtPath(
        'order',
        value,
        'array of strings',
        documentPath,
        parentDataPath,
      ),
    );
    return;
  }
  const seen = new Map<string, number>();
  for (let index = 0; index < value.length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, index);
    const entry: unknown =
      descriptor !== undefined && 'value' in descriptor
        ? descriptor.value
        : ACCESSOR_VALUE;
    if (typeof entry !== 'string') {
      diagnostics.push(
        entry === ACCESSOR_VALUE
          ? invalidUiDescriptorAtPath(
              'order',
              'string',
              [...documentPath, index],
              parentDataPath,
              descriptor === undefined ? 'missing' : 'accessor',
            )
          : invalidUiValueAtPath(
              'order',
              entry,
              'string',
              [...documentPath, index],
              parentDataPath,
            ),
      );
      continue;
    }
    if (!knownNames.has(entry)) {
      diagnostics.push(
        diagnostic({
          code: 'UNKNOWN_UI_ORDER_FIELD',
          severity: 'warning',
          source: 'ui-schema',
          dataPath: [...parentDataPath, entry],
          documentPath: [...documentPath, index],
          parameters: { field: entry, index },
          fallbackMessage: `UI order references unknown field "${entry}".`,
        }),
      );
      continue;
    }
    const firstIndex = seen.get(entry);
    if (firstIndex !== undefined) {
      diagnostics.push(
        diagnostic({
          code: 'DUPLICATE_UI_ORDER_FIELD',
          severity: 'warning',
          source: 'ui-schema',
          dataPath: [...parentDataPath, entry],
          documentPath: [...documentPath, index],
          parameters: { field: entry, firstIndex, duplicateIndex: index },
          fallbackMessage: `UI order repeats field "${entry}".`,
        }),
      );
      continue;
    }
    seen.set(entry, index);
    order.push(entry);
  }
}

function invalidUiValueAtPath(
  key: string,
  value: unknown,
  expected: string,
  documentPath: readonly (string | number)[],
  dataPath: readonly string[],
): Diagnostic {
  return dataPath.length === 0
    ? invalidUiValue(key, value, expected, documentPath)
    : invalidUiValue(key, value, expected, documentPath, dataPath);
}

function invalidUiDescriptorAtPath(
  key: string,
  expected: string,
  documentPath: readonly (string | number)[],
  dataPath: readonly string[],
  actualDescriptorType: 'missing' | 'accessor',
): Diagnostic {
  if (dataPath.length > 0) {
    return invalidUiDescriptor(
      key,
      expected,
      documentPath,
      dataPath,
      actualDescriptorType,
    );
  }
  return diagnostic({
    code: 'INVALID_UI_SCHEMA_VALUE',
    severity: 'error',
    source: 'ui-schema',
    documentPath,
    parameters: { key, expected, actualType: actualDescriptorType },
    fallbackMessage: `UI Schema key "${key}" has an invalid value.`,
  });
}

function inspectNestedNodeUi(
  candidate: NodeCandidate,
  value: Record<string, unknown> | undefined,
  diagnostics: Diagnostic[],
  dataPath: readonly string[],
  documentPath: readonly (string | number)[],
): ParsedNodeUi {
  const parsed: {
    label?: string;
    description?: string;
    hint?: string;
    tooltip?: string;
    placeholder?: string;
    decimalPlaces?: number;
    showTrailingZeros?: boolean;
    enumLabels?: ReadonlyMap<string, string>;
    order?: string[];
    fields?: Map<string, ParsedNodeUi>;
    item?: ParsedUiSchema;
  } = {};
  if (candidate.type === 'object') {
    parsed.order = [];
    parsed.fields = new Map();
  } else if (candidate.type === 'array') {
    parsed.item = { order: [], fields: new Map() };
  }
  if (value === undefined) {
    return parsed;
  }
  if (
    (candidate.type === 'object' || candidate.type === 'array') &&
    ownDataValue(value, 'presentation').present
  ) {
    diagnostics.push(
      invalidUiPresentation(
        'unsupported-location',
        [...documentPath, 'presentation'],
        {
          member: 'presentation',
          nodeKind: candidate.type === 'array' ? 'array' : 'object',
        },
        dataPath,
      ),
    );
  }
  const allowed = new Set(
    candidate.type === 'object'
      ? [
          ...UI_ROOT_KEYS,
          'label',
          'description',
          'hint',
          'tooltip',
          'placeholder',
          'enumLabels',
          'options',
          'item',
        ]
      : candidate.type === 'array'
        ? [...UI_FIELD_KEYS, 'order', 'fields', 'item']
        : [...UI_FIELD_KEYS, 'order', 'fields', 'item'],
  );
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      diagnostics.push(unknownUiKey(key, [...documentPath, key], dataPath));
    }
  }
  for (const key of ['label', 'description', 'hint', 'tooltip'] as const) {
    const member = ownDataValue(value, key);
    if (!member.present) continue;
    const expected =
      (candidate.type === 'object' || candidate.type === 'array') &&
      key === 'label'
        ? 'non-blank string'
        : 'string';
    if (
      member.accessor ||
      typeof member.value !== 'string' ||
      (expected === 'non-blank string' && member.value.trim().length === 0)
    ) {
      diagnostics.push(
        member.accessor
          ? invalidUiDescriptor(
              key,
              expected,
              [...documentPath, key],
              dataPath,
              'accessor',
            )
          : invalidUiValue(
              key,
              member.value,
              expected,
              [...documentPath, key],
              dataPath,
            ),
      );
    } else {
      parsed[key] = member.value;
    }
  }
  const placeholder = ownDataValue(value, 'placeholder');
  if (placeholder.present) {
    if (placeholder.accessor || typeof placeholder.value !== 'string') {
      diagnostics.push(
        placeholder.accessor
          ? invalidUiDescriptor(
              'placeholder',
              'string',
              [...documentPath, 'placeholder'],
              dataPath,
              'accessor',
            )
          : invalidUiValue(
              'placeholder',
              placeholder.value,
              'string',
              [...documentPath, 'placeholder'],
              dataPath,
            ),
      );
    } else if (
      candidate.type === 'object' ||
      candidate.type === 'array' ||
      candidate.type === 'boolean'
    ) {
      diagnostics.push(
        diagnostic({
          code: 'INCOMPATIBLE_PLACEHOLDER',
          severity: 'warning',
          source: 'ui-schema',
          dataPath,
          documentPath: [...documentPath, 'placeholder'],
          parameters: { field: candidate.name, fieldType: candidate.type },
          fallbackMessage: `Placeholder is incompatible with ${candidate.type} field "${candidate.name}".`,
        }),
      );
    } else parsed.placeholder = placeholder.value;
  }
  inspectNestedEnumLabels(
    candidate,
    value,
    parsed,
    diagnostics,
    dataPath,
    documentPath,
  );
  inspectNestedOptions(
    candidate,
    value,
    parsed,
    diagnostics,
    dataPath,
    documentPath,
  );
  const item = ownDataValue(value, 'item');
  if (item.present && candidate.type !== 'array') {
    const path = [...documentPath, 'item'];
    if (item.accessor || !isOrdinaryRecord(item.value)) {
      diagnostics.push(
        item.accessor
          ? invalidUiDescriptor(
              'item',
              'item UI object',
              path,
              dataPath,
              'accessor',
            )
          : invalidUiValue(
              'item',
              item.value,
              'item UI object',
              path,
              dataPath,
            ),
      );
    } else {
      diagnostics.push(
        diagnostic({
          code: 'INCOMPATIBLE_UI_OPTION',
          severity: 'warning',
          source: 'ui-schema',
          dataPath,
          documentPath: path,
          parameters: {
            field: candidate.name,
            fieldType: candidate.type,
            option: 'item',
            reason: candidate.type === 'object' ? 'object-node' : 'leaf-node',
          },
          fallbackMessage: `UI option "item" is incompatible with field "${candidate.name}".`,
        }),
      );
    }
  }
  if (candidate.type !== 'object') {
    for (const key of ['order', 'fields'] as const) {
      const member = ownDataValue(value, key);
      if (!member.present) continue;
      const expected = key === 'order' ? 'array of strings' : 'object';
      const valid =
        key === 'order'
          ? Array.isArray(member.value)
          : isOrdinaryRecord(member.value);
      if (member.accessor || !valid) {
        diagnostics.push(
          member.accessor
            ? invalidUiDescriptor(
                key,
                expected,
                [...documentPath, key],
                dataPath,
                'accessor',
              )
            : invalidUiValue(
                key,
                member.value,
                expected,
                [...documentPath, key],
                dataPath,
              ),
        );
      } else {
        diagnostics.push(
          diagnostic({
            code: 'INCOMPATIBLE_UI_OPTION',
            severity: 'warning',
            source: 'ui-schema',
            dataPath,
            documentPath: [...documentPath, key],
            parameters: {
              field: candidate.name,
              fieldType: candidate.type,
              option: key,
              reason: candidate.type === 'array' ? 'array-node' : 'leaf-node',
            },
            fallbackMessage: `UI option "${key}" is incompatible with leaf field "${candidate.name}".`,
          }),
        );
      }
    }
  }
  return parsed;
}

function inspectNestedEnumLabels(
  candidate: NodeCandidate,
  value: Record<string, unknown>,
  parsed: { enumLabels?: ReadonlyMap<string, string> },
  diagnostics: Diagnostic[],
  dataPath: readonly string[],
  documentPath: readonly (string | number)[],
): void {
  const member = ownDataValue(value, 'enumLabels');
  if (!member.present) return;
  const path = [...documentPath, 'enumLabels'];
  if (member.accessor || !isOrdinaryRecord(member.value)) {
    diagnostics.push(
      member.accessor
        ? invalidUiDescriptor(
            'enumLabels',
            'object',
            path,
            dataPath,
            'accessor',
          )
        : invalidUiValue('enumLabels', member.value, 'object', path, dataPath),
    );
    return;
  }
  if (candidate.type === 'object' || candidate.type === 'array') {
    diagnostics.push(
      diagnostic({
        code: 'INCOMPATIBLE_UI_OPTION',
        severity: 'warning',
        source: 'ui-schema',
        dataPath,
        documentPath: path,
        parameters: {
          field: candidate.name,
          fieldType: candidate.type,
          option: 'enumLabels',
          reason: candidate.type === 'object' ? 'object-node' : 'array-node',
        },
        fallbackMessage: `UI option "enumLabels" is incompatible with ${candidate.type} field "${candidate.name}".`,
      }),
    );
    return;
  }
  if (candidate.stringEnum.kind !== 'valid') {
    if (candidate.stringEnum.kind === 'absent')
      diagnostics.push(
        diagnostic({
          code: 'INCOMPATIBLE_UI_OPTION',
          severity: 'warning',
          source: 'ui-schema',
          dataPath,
          documentPath: path,
          parameters: {
            field: candidate.name,
            fieldType: candidate.type,
            option: 'enumLabels',
            reason: 'missing-compatible-enum',
          },
          fallbackMessage: `UI option "enumLabels" requires a compatible string enum on field "${candidate.name}".`,
        }),
      );
    return;
  }
  const values = new Set(candidate.stringEnum.values);
  const labels = new Map<string, string>();
  for (const key of Object.keys(member.value)) {
    const label = ownDataValue(member.value, key);
    const labelPath = [...path, key];
    if (
      !label.present ||
      label.accessor ||
      typeof label.value !== 'string' ||
      label.value.trim().length === 0
    ) {
      diagnostics.push(
        !label.present || label.accessor
          ? invalidUiDescriptor(
              key,
              'non-blank string',
              labelPath,
              dataPath,
              !label.present ? 'missing' : 'accessor',
            )
          : invalidUiValue(
              key,
              label.value,
              'non-blank string',
              labelPath,
              dataPath,
            ),
      );
    } else if (!values.has(key)) {
      diagnostics.push(
        diagnostic({
          code: 'UNKNOWN_ENUM_LABEL',
          severity: 'warning',
          source: 'ui-schema',
          dataPath,
          documentPath: labelPath,
          parameters: { field: candidate.name, value: key },
          fallbackMessage: `UI enum label references unknown value "${key}".`,
        }),
      );
    } else labels.set(key, label.value);
  }
  parsed.enumLabels = labels;
}

function inspectNestedOptions(
  candidate: NodeCandidate,
  value: Record<string, unknown>,
  parsed: { decimalPlaces?: number; showTrailingZeros?: boolean },
  diagnostics: Diagnostic[],
  dataPath: readonly string[],
  documentPath: readonly (string | number)[],
): void {
  const member = ownDataValue(value, 'options');
  if (!member.present) return;
  const path = [...documentPath, 'options'];
  if (member.accessor || !isOrdinaryRecord(member.value)) {
    diagnostics.push(
      member.accessor
        ? invalidUiDescriptor('options', 'object', path, dataPath, 'accessor')
        : invalidUiValue('options', member.value, 'object', path, dataPath),
    );
    return;
  }
  for (const option of Object.keys(member.value)) {
    const optionPath = [...path, option];
    if (!UI_OPTION_KEYS.has(option)) {
      diagnostics.push(unknownUiKey(option, optionPath, dataPath));
      continue;
    }
    const optionMember = ownDataValue(member.value, option);
    const optionValue = optionMember.present
      ? optionMember.value
      : ACCESSOR_VALUE;
    const optionAccessor = !optionMember.present || optionMember.accessor;
    const valid =
      !optionAccessor &&
      (option === 'decimalPlaces'
        ? Number.isInteger(optionValue) && (optionValue as number) >= 0
        : typeof optionValue === 'boolean');
    if (!valid) {
      diagnostics.push(
        optionAccessor
          ? invalidUiDescriptor(
              option,
              option === 'decimalPlaces' ? 'non-negative integer' : 'boolean',
              optionPath,
              dataPath,
              'accessor',
            )
          : invalidUiValue(
              option,
              optionValue,
              option === 'decimalPlaces' ? 'non-negative integer' : 'boolean',
              optionPath,
              dataPath,
            ),
      );
    } else if (candidate.type === 'object' || candidate.type === 'array') {
      diagnostics.push(
        diagnostic({
          code: 'INCOMPATIBLE_UI_OPTION',
          severity: 'warning',
          source: 'ui-schema',
          dataPath,
          documentPath: optionPath,
          parameters: {
            field: candidate.name,
            fieldType: candidate.type,
            option,
            reason: candidate.type === 'object' ? 'object-node' : 'array-node',
          },
          fallbackMessage: `UI option "${option}" is incompatible with ${candidate.type} field "${candidate.name}".`,
        }),
      );
    } else if (candidate.type !== 'number' && candidate.type !== 'integer') {
      diagnostics.push(
        diagnostic({
          code: 'INCOMPATIBLE_UI_OPTION',
          severity: 'warning',
          source: 'ui-schema',
          dataPath,
          documentPath: optionPath,
          parameters: {
            field: candidate.name,
            fieldType: candidate.type,
            option,
          },
          fallbackMessage: `UI option "${option}" is incompatible with field "${candidate.name}".`,
        }),
      );
    } else if (option === 'decimalPlaces')
      parsed.decimalPlaces = optionValue as number;
    else parsed.showTrailingZeros = optionValue as boolean;
  }
}

function buildNestedDefinition(
  candidates: readonly NodeCandidate[],
  uiSchema: ParsedUiSchema,
): FormDefinition {
  const nodes: FormNodeDefinition[] = [];
  const fields: FieldDefinition[] = [];
  type BuildFrame = {
    readonly candidate: NodeCandidate;
    readonly ui: ParsedNodeUi | undefined;
    readonly output: FormNodeDefinition[];
  };
  const stack: BuildFrame[] = [];
  pushBuildFrames(candidates, uiSchema, nodes, stack);
  while (stack.length > 0) {
    const frame = stack.pop();
    if (frame === undefined) break;
    const candidate = frame.candidate;
    if (candidate.type === 'array') {
      if (candidate.identityProperty === undefined) {
        throw new Error(
          `Internal compiler error: missing identity for collection "${candidate.name}".`,
        );
      }
      const arrayUi = frame.ui as ParsedArrayUi | undefined;
      const item = buildItemTemplate(
        candidate,
        arrayUi?.item ?? { order: [], fields: new Map() },
      );
      const node: ArrayNodeDefinition = {
        key: JSON.stringify(candidate.dataPath),
        name: candidate.name,
        path: candidate.dataPath,
        required: candidate.required,
        label:
          arrayUi?.label ??
          candidate.schemaTitle ??
          accessibleName(candidate.name),
        ...(arrayUi?.description !== undefined
          ? { description: arrayUi.description }
          : candidate.schemaDescription === undefined
            ? {}
            : { description: candidate.schemaDescription }),
        ...(arrayUi?.hint === undefined ? {} : { hint: arrayUi.hint }),
        ...(arrayUi?.tooltip === undefined ? {} : { tooltip: arrayUi.tooltip }),
        kind: 'array',
        identity: { property: candidate.identityProperty },
        item,
      };
      frame.output.push(node);
    } else if (candidate.type === 'object') {
      const objectUi = frame.ui as ParsedObjectUi | undefined;
      const children: FormNodeDefinition[] = [];
      const label =
        objectUi?.label ??
        candidate.schemaTitle ??
        accessibleName(candidate.name);
      const node: ObjectFieldDefinition = {
        key: JSON.stringify(candidate.dataPath),
        name: candidate.name,
        path: candidate.dataPath,
        required: candidate.required,
        label,
        ...(objectUi?.description !== undefined
          ? { description: objectUi.description }
          : candidate.schemaDescription === undefined
            ? {}
            : { description: candidate.schemaDescription }),
        ...(objectUi?.hint === undefined ? {} : { hint: objectUi.hint }),
        ...(objectUi?.tooltip === undefined
          ? {}
          : { tooltip: objectUi.tooltip }),
        kind: 'object',
        children,
      };
      frame.output.push(node);
      pushBuildFrames(
        candidate.children,
        objectUi ?? { order: [], fields: new Map() },
        children,
        stack,
      );
    } else {
      const field = buildFieldDefinition(candidate, frame.ui);
      frame.output.push(field);
      fields.push(field);
    }
  }
  return {
    nodes,
    fields,
    presentation: createPresentationDefinition(uiSchema.presentation, nodes),
  };
}

function buildItemTemplate(
  collection: ArrayCandidate,
  ui: ParsedUiSchema,
): ObjectItemTemplateDefinition {
  const children: Array<ObjectNodeTemplate | FieldTemplate> = [];
  const fields: FieldTemplate[] = [];
  type Frame = {
    readonly candidate: NodeCandidate;
    readonly ui: ParsedNodeUi | undefined;
    readonly output: Array<ObjectNodeTemplate | FieldTemplate>;
  };
  const stack: Frame[] = [];
  pushTemplateBuildFrames(collection.children, ui, children, stack);
  while (stack.length > 0) {
    const frame = stack.pop();
    if (frame === undefined) break;
    const candidate = frame.candidate;
    if (candidate.type === 'array' || candidate.templatePath === undefined) {
      throw new Error('Internal compiler error: invalid item template node.');
    }
    if (candidate.type === 'object') {
      const objectUi = frame.ui as ParsedObjectUi | undefined;
      const nestedChildren: Array<ObjectNodeTemplate | FieldTemplate> = [];
      const node: ObjectNodeTemplate = {
        kind: 'object',
        key: JSON.stringify([
          'template',
          collection.dataPath,
          candidate.templatePath,
        ]),
        name: candidate.name,
        relativePath: candidate.templatePath,
        required: candidate.required,
        label:
          objectUi?.label ??
          candidate.schemaTitle ??
          accessibleName(candidate.name),
        ...(objectUi?.description !== undefined
          ? { description: objectUi.description }
          : candidate.schemaDescription === undefined
            ? {}
            : { description: candidate.schemaDescription }),
        ...(objectUi?.hint === undefined ? {} : { hint: objectUi.hint }),
        ...(objectUi?.tooltip === undefined
          ? {}
          : { tooltip: objectUi.tooltip }),
        children: nestedChildren,
      };
      frame.output.push(node);
      pushTemplateBuildFrames(
        candidate.children,
        objectUi ?? { order: [], fields: new Map() },
        nestedChildren,
        stack,
      );
    } else {
      const field = buildFieldTemplate(
        collection.dataPath,
        candidate,
        frame.ui,
      );
      frame.output.push(field);
      fields.push(field);
    }
  }
  return { kind: 'item-template', children, fields };
}

function pushTemplateBuildFrames(
  candidates: readonly NodeCandidate[],
  ui: ParsedUiSchema | ParsedObjectUi,
  output: Array<ObjectNodeTemplate | FieldTemplate>,
  stack: Array<{
    readonly candidate: NodeCandidate;
    readonly ui: ParsedNodeUi | undefined;
    readonly output: Array<ObjectNodeTemplate | FieldTemplate>;
  }>,
): void {
  const byName = new Map(
    candidates.map((candidate) => [candidate.name, candidate] as const),
  );
  const names = [
    ...ui.order,
    ...candidates
      .map((candidate) => candidate.name)
      .filter((name) => !ui.order.includes(name)),
  ];
  for (let index = names.length - 1; index >= 0; index -= 1) {
    const name = names[index] as string;
    const candidate = byName.get(name);
    if (candidate === undefined) {
      throw new Error(
        `Internal compiler error: missing template node "${name}".`,
      );
    }
    stack.push({ candidate, ui: ui.fields.get(name), output });
  }
}

function buildFieldTemplate(
  collectionPath: readonly string[],
  candidate: FieldCandidate,
  ui: ParsedFieldUi | undefined,
): FieldTemplate {
  if (candidate.templatePath === undefined) {
    throw new Error('Internal compiler error: missing template path.');
  }
  const base = {
    key: JSON.stringify(['template', collectionPath, candidate.templatePath]),
    name: candidate.name,
    relativePath: candidate.templatePath,
    required: candidate.required,
    nullable: candidate.nullable,
    label: ui?.label ?? candidate.schemaTitle ?? accessibleName(candidate.name),
    ...(ui?.description !== undefined
      ? { description: ui.description }
      : candidate.schemaDescription === undefined
        ? {}
        : { description: candidate.schemaDescription }),
    ...(ui?.hint === undefined ? {} : { hint: ui.hint }),
    ...(ui?.tooltip === undefined ? {} : { tooltip: ui.tooltip }),
    ...(ui?.placeholder === undefined ? {} : { placeholder: ui.placeholder }),
  };
  if (candidate.type === 'string') {
    return {
      ...base,
      kind: 'string',
      constraints: { ...candidate.stringConstraints },
      ...(candidate.stringEnum.kind === 'valid'
        ? {
            choices: candidate.stringEnum.values.map((value) => ({
              value,
              label:
                ui?.enumLabels?.get(value) ??
                (value.trim().length > 0 ? value : JSON.stringify(value)),
            })),
          }
        : {}),
    };
  }
  if (candidate.type === 'number' || candidate.type === 'integer') {
    return {
      ...base,
      kind: 'number',
      numericType: candidate.type,
      constraints: { ...candidate.numberConstraints },
      ui: {
        ...(ui?.decimalPlaces === undefined
          ? {}
          : { decimalPlaces: ui.decimalPlaces }),
        ...(ui?.showTrailingZeros === undefined
          ? {}
          : { showTrailingZeros: ui.showTrailingZeros }),
      },
    };
  }
  return { ...base, kind: 'boolean' };
}

function pushBuildFrames(
  candidates: readonly NodeCandidate[],
  ui: ParsedUiSchema | ParsedObjectUi,
  output: FormNodeDefinition[],
  stack: Array<{
    readonly candidate: NodeCandidate;
    readonly ui: ParsedNodeUi | undefined;
    readonly output: FormNodeDefinition[];
  }>,
): void {
  const byName = new Map(
    candidates.map((candidate) => [candidate.name, candidate] as const),
  );
  const names = [
    ...ui.order,
    ...candidates
      .map((candidate) => candidate.name)
      .filter((name) => !ui.order.includes(name)),
  ];
  for (let index = names.length - 1; index >= 0; index -= 1) {
    const name = names[index] as string;
    const candidate = byName.get(name);
    if (candidate === undefined)
      throw new Error(`Internal compiler error: missing node "${name}".`);
    stack.push({ candidate, ui: ui.fields.get(name), output });
  }
}

function accessibleName(name: string): string {
  return name.trim().length > 0 ? name : JSON.stringify(name);
}

function buildDefinition(
  candidates: readonly FieldCandidate[],
  uiSchema: ParsedUiSchema,
): FormDefinition {
  const byName = new Map(candidates.map((field) => [field.name, field]));
  const orderedNames = [
    ...uiSchema.order,
    ...candidates
      .map(({ name }) => name)
      .filter((name) => !uiSchema.order.includes(name)),
  ];

  const fields = orderedNames.map((name) => {
    const candidate = byName.get(name);
    if (candidate === undefined) {
      throw new Error(`Internal compiler error: missing field "${name}".`);
    }
    return buildFieldDefinition(candidate, uiSchema.fields.get(name));
  });
  return {
    nodes: fields,
    fields,
    presentation: createPresentationDefinition(uiSchema.presentation, fields),
  };
}

function createPresentationDefinition(
  parsed: readonly ParsedPresentationEntry[] | undefined,
  nodes: readonly FormNodeDefinition[],
): readonly PresentationEntryDefinition[] {
  if (parsed === undefined) return createDefaultPresentation(nodes);
  const byName = new Map(nodes.map((node) => [node.name, node] as const));
  const result: PresentationEntryDefinition[] = [];
  type Frame = {
    readonly entry: ParsedPresentationEntry;
    readonly output: PresentationEntryDefinition[];
  };
  const stack: Frame[] = [];
  const pendingGridItems: Array<{
    readonly target: Omit<PresentationGridItemDefinition, 'child'> & {
      child?: PresentationEntryDefinition;
    };
    readonly childOutput: PresentationEntryDefinition[];
  }> = [];
  pushPresentationBuildFrames(parsed, result, stack);
  while (stack.length > 0) {
    const frame = stack.pop();
    if (frame === undefined) break;
    const entry = frame.entry;
    if (entry.kind === 'form-node') {
      const node = byName.get(entry.name);
      if (node === undefined)
        throw new Error('Internal compiler error: missing presented node.');
      frame.output.push({ kind: 'form-node', node });
      continue;
    }
    if (entry.kind === 'section') {
      const children: PresentationEntryDefinition[] = [];
      const section: PresentationSectionDefinition = {
        kind: 'section',
        id: entry.id,
        key: JSON.stringify(['section', entry.id]),
        label: entry.label,
        children,
      };
      frame.output.push(section);
      pushPresentationBuildFrames(entry.children, children, stack);
      continue;
    }
    if (entry.kind === 'tabs' || entry.kind === 'accordion') {
      const panels: PresentationPanelDefinition[] = entry.panels.map(
        (panel) => ({
          kind: 'panel',
          id: panel.id,
          key: JSON.stringify([entry.kind, entry.id, 'panel', panel.id]),
          label: panel.label,
          children: [],
        }),
      );
      const container:
        PresentationTabsDefinition | PresentationAccordionDefinition = {
        kind: entry.kind,
        id: entry.id,
        key: JSON.stringify([entry.kind, entry.id]),
        label: entry.label,
        panels,
      };
      frame.output.push(container);
      for (let index = entry.panels.length - 1; index >= 0; index -= 1) {
        const parsedPanel = entry.panels[index];
        const panel = panels[index];
        if (parsedPanel === undefined || panel === undefined)
          throw new Error('Internal compiler error: missing panel.');
        pushPresentationBuildFrames(
          parsedPanel.children,
          panel.children as PresentationEntryDefinition[],
          stack,
        );
      }
      continue;
    }

    const items: PresentationGridItemDefinition[] = entry.items.map(
      (item, itemIndex) => {
        const parsedChild = item.child[0];
        if (parsedChild === undefined || item.child.length !== 1)
          throw new Error('Internal compiler error: missing grid item child.');
        const childOutput: PresentationEntryDefinition[] = [];
        stack.push({ entry: parsedChild, output: childOutput });
        const target: Omit<PresentationGridItemDefinition, 'child'> & {
          child?: PresentationEntryDefinition;
        } = {
          kind: 'grid-item',
          key: JSON.stringify(['grid', entry.id, 'item', itemIndex]),
          span: item.span,
        };
        pendingGridItems.push({ target, childOutput });
        return target as PresentationGridItemDefinition;
      },
    );
    const grid: PresentationGridDefinition = {
      kind: 'grid',
      id: entry.id,
      key: JSON.stringify(['grid', entry.id]),
      label: entry.label,
      columns: entry.columns,
      items,
    };
    frame.output.push(grid);
  }
  for (const pending of pendingGridItems) {
    const child = pending.childOutput[0];
    if (child === undefined || pending.childOutput.length !== 1)
      throw new Error('Internal compiler error: unbuilt grid item child.');
    pending.target.child = child;
  }
  return result;
}

function pushPresentationBuildFrames(
  entries: readonly ParsedPresentationEntry[],
  output: PresentationEntryDefinition[],
  stack: Array<{
    readonly entry: ParsedPresentationEntry;
    readonly output: PresentationEntryDefinition[];
  }>,
): void {
  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const entry = entries[index];
    if (entry !== undefined) stack.push({ entry, output });
  }
}

function buildFieldDefinition(
  candidate: FieldCandidate,
  ui: ParsedFieldUi | undefined,
): FieldDefinition {
  const base = {
    key: JSON.stringify(candidate.dataPath),
    name: candidate.name,
    path: candidate.dataPath,
    required: candidate.required,
    nullable: candidate.nullable,
    label: ui?.label ?? candidate.schemaTitle ?? candidate.name,
    ...(ui?.description !== undefined
      ? { description: ui.description }
      : candidate.schemaDescription === undefined
        ? {}
        : { description: candidate.schemaDescription }),
    ...(ui?.hint === undefined ? {} : { hint: ui.hint }),
    ...(ui?.tooltip === undefined ? {} : { tooltip: ui.tooltip }),
    ...(ui?.placeholder === undefined ? {} : { placeholder: ui.placeholder }),
  };

  if (candidate.type === 'string') {
    const definition: StringFieldDefinition = {
      ...base,
      kind: 'string',
      constraints: { ...candidate.stringConstraints },
      ...(candidate.stringEnum.kind === 'valid'
        ? {
            choices: candidate.stringEnum.values.map((value) => ({
              value,
              label:
                ui?.enumLabels?.get(value) ??
                (value.trim().length > 0 ? value : JSON.stringify(value)),
            })),
          }
        : {}),
    };
    return definition;
  }

  if (candidate.type === 'number' || candidate.type === 'integer') {
    const definition: NumberFieldDefinition = {
      ...base,
      kind: 'number',
      numericType: candidate.type,
      constraints: { ...candidate.numberConstraints },
      ui: {
        ...(ui?.decimalPlaces === undefined
          ? {}
          : { decimalPlaces: ui.decimalPlaces }),
        ...(ui?.showTrailingZeros === undefined
          ? {}
          : { showTrailingZeros: ui.showTrailingZeros }),
      },
    };
    return definition;
  }

  const definition: BooleanFieldDefinition = {
    ...base,
    kind: 'boolean',
  };
  return definition;
}

function schemaKeywordDiagnostic(
  code: string,
  severity: 'warning' | 'error',
  keyword: string,
  documentPath: readonly (string | number)[],
  fallbackMessage: string,
  dataPath?: readonly (string | number)[],
): Diagnostic {
  return diagnostic({
    code,
    severity,
    source: 'schema',
    ...(dataPath === undefined ? {} : { dataPath }),
    documentPath,
    parameters: { keyword },
    fallbackMessage,
  });
}

function invalidSchemaKeywordValue(
  keyword: string,
  value: unknown,
  expected: string,
  documentPath: readonly (string | number)[],
  dataPath?: readonly (string | number)[],
): Diagnostic {
  return diagnostic({
    code: 'INVALID_SCHEMA_KEYWORD_VALUE',
    severity: 'error',
    source: 'schema',
    ...(dataPath === undefined ? {} : { dataPath }),
    documentPath,
    parameters: {
      keyword,
      expected,
      ...describeActualValue(value),
    },
    fallbackMessage: `Schema keyword "${keyword}" has an invalid value.`,
  });
}

function invalidSchemaKeywordDescriptor(
  keyword: string,
  expected: string,
  documentPath: readonly (string | number)[],
  dataPath: readonly (string | number)[],
  actualDescriptorType: 'missing' | 'accessor',
): Diagnostic {
  return diagnostic({
    code: 'INVALID_SCHEMA_KEYWORD_VALUE',
    severity: 'error',
    source: 'schema',
    dataPath,
    documentPath,
    parameters: { keyword, expected, actualType: actualDescriptorType },
    fallbackMessage: `Schema keyword "${keyword}" has an invalid value.`,
  });
}

function unknownUiKey(
  key: string,
  documentPath: readonly (string | number)[],
  dataPath?: readonly (string | number)[],
): Diagnostic {
  return diagnostic({
    code: 'UNKNOWN_UI_SCHEMA_KEY',
    severity: 'warning',
    source: 'ui-schema',
    ...(dataPath === undefined ? {} : { dataPath }),
    documentPath,
    parameters: { key },
    fallbackMessage: `Unknown UI Schema key "${key}" is ignored.`,
  });
}

function invalidUiPresentation(
  reason: string,
  documentPath: readonly (string | number)[],
  parameters: Readonly<Record<string, unknown>>,
  dataPath?: readonly (string | number)[],
): Diagnostic {
  return diagnostic({
    code: 'INVALID_UI_PRESENTATION',
    severity: 'warning',
    source: 'ui-schema',
    ...(dataPath === undefined ? {} : { dataPath }),
    documentPath,
    parameters: { reason, ...parameters },
    fallbackMessage: 'UI presentation is invalid.',
  });
}

function invalidUiValue(
  key: string,
  value: unknown,
  expected: string,
  documentPath: readonly (string | number)[],
  dataPath?: readonly (string | number)[],
): Diagnostic {
  return diagnostic({
    code: 'INVALID_UI_SCHEMA_VALUE',
    severity: 'error',
    source: 'ui-schema',
    ...(dataPath === undefined ? {} : { dataPath }),
    documentPath,
    parameters: { key, expected, ...describeActualValue(value) },
    fallbackMessage: `UI Schema key "${key}" has an invalid value.`,
  });
}

function invalidUiDescriptor(
  key: string,
  expected: string,
  documentPath: readonly (string | number)[],
  dataPath: readonly (string | number)[],
  actualDescriptorType: 'missing' | 'accessor',
): Diagnostic {
  return diagnostic({
    code: 'INVALID_UI_SCHEMA_VALUE',
    severity: 'error',
    source: 'ui-schema',
    dataPath,
    documentPath,
    parameters: { key, expected, actualType: actualDescriptorType },
    fallbackMessage: `UI Schema key "${key}" has an invalid value.`,
  });
}
