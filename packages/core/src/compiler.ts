// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import type {
  ArrayNodeDefinition,
  BooleanFieldDefinition,
  CompileFormDefinitionInput,
  CompileFormResult,
  Diagnostic,
  DiscriminatedObjectAlternativeDefinition,
  DiscriminatedObjectFieldDefinition,
  FieldConditionDefinition,
  FieldDefinition,
  FieldTemplate,
  FieldValueConditionDefinition,
  FieldValueConditionGroupDefinition,
  FormDefinition,
  FormNodeDefinition,
  FormNodeTemplate,
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
  PrimitiveFixedValue,
  RootPresentationEntryDefinition,
  StringEnumArrayFieldDefinition,
  StringFieldDefinition,
  StringSemanticFormat,
  WizardDefinition,
  WizardStepDefinition,
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
  acceptedNonObjectCompositionType,
  incompatibleAllOfDiagnostic,
  inspectCompositionFoundation,
  type CompositionFoundationResult,
  type CompositionUseSite,
} from './internal/schema-composition.js';
import {
  actualType,
  describeActualValue,
  describeDeclaredDialect,
  isRecord,
} from './internal/value.js';

type FieldType = 'string' | 'number' | 'integer' | 'boolean';
type CandidateFieldType = FieldType | 'string-enum-array';

interface RequiredEntry {
  readonly name: string;
  readonly index: number;
}

interface CompositionPropertySource {
  readonly documentPath: readonly (string | number)[];
  readonly referenceChain: ReferenceChain;
  readonly conflicted?: boolean;
}

interface CompositionRequiredSource extends RequiredEntry {
  readonly documentPath: readonly (string | number)[];
  readonly referenceChain: ReferenceChain;
}

interface ReducedObjectComposition {
  readonly properties: Record<string, unknown>;
  readonly propertySources: ReadonlyMap<string, CompositionPropertySource>;
  readonly requiredNames: ReadonlySet<string>;
  readonly catalogBlocked: boolean;
  readonly schemaTitle?: string;
  readonly schemaDescription?: string;
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

type FixedValueState =
  | { readonly kind: 'absent' }
  | { readonly kind: 'valid'; readonly value: PrimitiveFixedValue }
  | { readonly kind: 'schema-blocked' };

interface FieldCandidate {
  readonly name: string;
  readonly type: CandidateFieldType;
  readonly nullable: boolean;
  readonly required: boolean;
  readonly schemaTitle?: string;
  readonly schemaDescription?: string;
  readonly stringConstraints: StringConstraints;
  readonly numberConstraints: NumberConstraints;
  readonly stringEnum: StringEnumState;
  readonly fixedValue: FixedValueState;
  readonly stringFormat?: StringSemanticFormat;
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

interface DiscriminatedObjectCandidate {
  readonly name: string;
  readonly type: 'discriminated-object';
  readonly required: boolean;
  readonly schemaTitle?: string;
  readonly schemaDescription?: string;
  readonly dataPath: readonly string[];
  readonly documentPath: readonly (string | number)[];
  readonly discriminator: string;
  readonly alternatives: readonly DiscriminatedObjectAlternativeDefinition[];
  readonly children: NodeCandidate[];
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

type NodeCandidate =
  | FieldCandidate
  | ObjectCandidate
  | DiscriminatedObjectCandidate
  | ArrayCandidate;

function isObjectCandidate(
  candidate: NodeCandidate,
): candidate is ObjectCandidate | DiscriminatedObjectCandidate {
  return (
    candidate.type === 'object' || candidate.type === 'discriminated-object'
  );
}

export interface DefaultCandidateSchemaNode {
  readonly kind: FieldType | 'object' | 'array';
  readonly nullable: boolean;
  readonly path: readonly string[];
  readonly documentPath: readonly (string | number)[];
  readonly referenceChain: ReferenceChain;
  readonly schema: Record<string, unknown>;
  readonly children: readonly DefaultCandidateSchemaNode[];
}

export type DefaultCandidateSchemaResult =
  | {
      readonly success: true;
      readonly nodes: readonly DefaultCandidateSchemaNode[];
    }
  | {
      readonly success: false;
      readonly nodes: readonly DefaultCandidateSchemaNode[];
      readonly diagnostics: readonly Diagnostic[];
    };

interface ParsedFieldUi {
  readonly label?: string;
  readonly description?: string;
  readonly hint?: string;
  readonly tooltip?: string;
  readonly placeholder?: string;
  readonly decimalPlaces?: number;
  readonly showTrailingZeros?: boolean;
  readonly enumLabels?: ReadonlyMap<string, string>;
  readonly visibleWhenCapture?: CapturedConditionMember;
  readonly enabledWhenCapture?: CapturedConditionMember;
}

type ConditionMember = 'visibleWhen' | 'enabledWhen';

type CapturedConditionMember =
  | {
      readonly kind: 'accessor';
      readonly documentPath: readonly (string | number)[];
    }
  | {
      readonly kind: 'value';
      readonly value: unknown;
      readonly documentPath: readonly (string | number)[];
    };

interface NormalizedFieldConditions {
  readonly visibleWhen?: FieldConditionDefinition;
  readonly enabledWhen?: FieldConditionDefinition;
}

interface ParsedUiSchema {
  readonly order: readonly string[];
  readonly fields: ReadonlyMap<string, ParsedNodeUi>;
  presentation?: readonly ParsedPresentationEntry[];
  wizard?: ParsedWizard;
}

interface ParsedWizard {
  readonly id: string;
  readonly label: string;
  readonly steps: readonly ParsedWizardStep[];
}

interface ParsedWizardStep {
  readonly id: string;
  readonly label: string;
  readonly children: readonly ParsedPresentationEntry[];
  readonly nodeNames: readonly string[];
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
  presentation?: readonly ParsedPresentationEntry[];
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
  'visibleWhen',
  'enabledWhen',
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
      const rootComposition = inspectCompositionFoundation(rawSchema, {
        useSite: 'root',
        documentPath: [],
        inspectBranches: false,
      });
      const referenceContext: ReferenceContext = {
        rootSchema: rawSchema,
        registryAvailable: registry.kind !== 'invalid-exterior',
        activeTargets: new Map(),
      };
      if (rootComposition.kind !== 'absent') {
        diagnostics.push(...rootComposition.diagnostics);
      } else {
        inspectRootReference(rawSchema, diagnostics);
      }
      const reducedRoot =
        rootComposition.kind === 'wrapper'
          ? reduceObjectComposition(
              rawSchema,
              rootComposition,
              'root',
              [],
              undefined,
              undefined,
              diagnostics,
              referenceContext,
              [],
            )
          : undefined;
      const root =
        rootComposition.kind === 'absent'
          ? inspectRootSchema(rawSchema, diagnostics)
          : reducedRoot === undefined
            ? {
                canInspectFields: false,
                requiredEntries: [] as readonly RequiredEntry[],
                requiredNames: new Set<string>() as ReadonlySet<string>,
              }
            : {
                canInspectFields: true,
                properties: reducedRoot.properties,
                propertyNames: Object.keys(reducedRoot.properties),
                requiredEntries: [] as readonly RequiredEntry[],
                requiredNames: reducedRoot.requiredNames,
              };
      propertyNames = root.propertyNames;

      if (root.canInspectFields && root.properties !== undefined) {
        candidates = inspectNodes(
          root.properties,
          root.requiredNames,
          diagnostics,
          rawSchema,
          collectionPolicies,
          usedPolicyIndices,
          referenceContext,
          reducedRoot?.propertySources,
          reducedRoot?.catalogBlocked ?? false,
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

  const completeOrdinaryFieldIndex = !hasErrors(diagnostics);

  const nested = candidates.some(
    (candidate) =>
      candidate.type !== 'string' &&
      candidate.type !== 'number' &&
      candidate.type !== 'integer' &&
      candidate.type !== 'boolean',
  );
  const parsedUi = nested
    ? inspectNestedUiSchema(
        rawUiSchema,
        candidates,
        diagnostics,
        [],
        new Map(),
        undefined,
        undefined,
        propertyNames,
      )
    : inspectUiSchema(
        rawUiSchema,
        propertyNames,
        candidatesByName as ReadonlyMap<string, FieldCandidate> | undefined,
        diagnostics,
      );

  const conditions = inspectConditionPhase(
    candidates,
    parsedUi,
    completeOrdinaryFieldIndex,
    diagnostics,
    rawUiSchema,
  );

  if (hasErrors(diagnostics)) {
    return failedResult(diagnostics);
  }

  const definition = nested
    ? buildNestedDefinition(candidates, parsedUi, conditions)
    : buildDefinition(candidates as FieldCandidate[], parsedUi, conditions);
  return deepFreeze({
    success: true,
    definition,
    diagnostics,
  });
}

export function inspectDefaultCandidateSchema(
  schema: unknown,
): DefaultCandidateSchemaResult {
  const diagnostics: Diagnostic[] = [];
  if (!isRecord(schema)) {
    diagnostics.push(
      diagnostic({
        code: 'ROOT_SCHEMA_MUST_BE_OBJECT',
        severity: 'error',
        source: 'schema',
        parameters: describeActualValue(schema),
        fallbackMessage: 'The root schema must be an object.',
      }),
    );
    return defaultCandidateSchemaFailure(diagnostics);
  }

  if (!inspectDialect(schema, diagnostics)) {
    return defaultCandidateSchemaFailure(diagnostics);
  }
  const registry = inspectDefinitionRegistry(schema);
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
  const rootComposition = inspectCompositionFoundation(schema, {
    useSite: 'root',
    documentPath: [],
    inspectBranches: false,
  });
  const referenceContext: ReferenceContext = {
    rootSchema: schema,
    registryAvailable: registry.kind !== 'invalid-exterior',
    activeTargets: new Map(),
  };
  if (rootComposition.kind !== 'absent') {
    diagnostics.push(...rootComposition.diagnostics);
  } else {
    inspectRootReference(schema, diagnostics);
  }
  const reducedRoot =
    rootComposition.kind === 'wrapper'
      ? reduceObjectComposition(
          schema,
          rootComposition,
          'root',
          [],
          undefined,
          undefined,
          diagnostics,
          referenceContext,
          [],
        )
      : undefined;
  const root =
    rootComposition.kind === 'absent'
      ? inspectRootSchema(schema, diagnostics)
      : reducedRoot === undefined
        ? {
            canInspectFields: false,
            requiredEntries: [] as readonly RequiredEntry[],
            requiredNames: new Set<string>() as ReadonlySet<string>,
          }
        : {
            canInspectFields: true,
            properties: reducedRoot.properties,
            propertyNames: Object.keys(reducedRoot.properties),
            requiredEntries: [] as readonly RequiredEntry[],
            requiredNames: reducedRoot.requiredNames,
          };

  const nodes: DefaultCandidateSchemaNode[] = [];
  if (root.canInspectFields && root.properties !== undefined) {
    inspectNodes(
      root.properties,
      root.requiredNames,
      diagnostics,
      schema,
      { valid: true, policies: [], byPath: new Map() },
      new Set(),
      referenceContext,
      reducedRoot?.propertySources,
      reducedRoot?.catalogBlocked ?? false,
      nodes,
      true,
    );
  }
  const effectiveDiagnostics = diagnostics.filter(
    (item) =>
      !(item.dataPath === undefined && item.documentPath?.at(-1) === 'default'),
  );
  if (hasErrors(effectiveDiagnostics)) {
    return defaultCandidateSchemaFailure(effectiveDiagnostics, nodes);
  }
  return { success: true, nodes: Object.freeze(nodes) };
}

function defaultCandidateSchemaFailure(
  diagnostics: readonly Diagnostic[],
  nodes: readonly DefaultCandidateSchemaNode[] = [],
): DefaultCandidateSchemaResult {
  const failed = failedResult([...diagnostics]);
  return {
    success: false,
    nodes: Object.freeze([...nodes]),
    diagnostics: failed.diagnostics,
  };
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
    if (Object.getOwnPropertyDescriptor(currentSchema, 'allOf') !== undefined) {
      return {
        kind: 'resolved',
        schema: currentSchema,
        documentPath: currentDocumentPath,
        referenceChain,
        activatedTargets,
      };
    }
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

function reduceObjectComposition(
  schema: Record<string, unknown>,
  foundation: CompositionFoundationResult,
  useSite: CompositionUseSite,
  documentPath: readonly (string | number)[],
  dataPath: readonly string[] | undefined,
  templatePath: readonly string[] | undefined,
  diagnostics: Diagnostic[],
  referenceContext: ReferenceContext,
  inheritedReferenceChain: ReferenceChain,
): ReducedObjectComposition | undefined {
  const initialActiveTargets = new Set(referenceContext.activeTargets.keys());
  try {
    return reduceObjectCompositionUnsafe(
      schema,
      foundation,
      useSite,
      documentPath,
      dataPath,
      templatePath,
      diagnostics,
      referenceContext,
      inheritedReferenceChain,
    );
  } catch {
    for (const target of referenceContext.activeTargets.keys()) {
      if (!initialActiveTargets.has(target)) {
        referenceContext.activeTargets.delete(target);
      }
    }
    let value = diagnostic({
      code: 'INVALID_COMPILER_INPUT',
      severity: 'error',
      source: 'schema',
      ...(dataPath === undefined ? {} : { dataPath }),
      documentPath,
      parameters: { actualType: 'object' },
      fallbackMessage: 'Compiler input must be an object.',
    });
    if (templatePath !== undefined)
      value = withTemplatePath(value, templatePath);
    if (inheritedReferenceChain.length > 0) {
      value = {
        ...value,
        parameters: referenceDiagnosticParameters(value.parameters, {
          referenceChain: inheritedReferenceChain,
        }),
      };
    }
    diagnostics.push(value);
    return undefined;
  }
}

function reduceObjectCompositionUnsafe(
  schema: Record<string, unknown>,
  foundation: CompositionFoundationResult,
  useSite: CompositionUseSite,
  documentPath: readonly (string | number)[],
  dataPath: readonly string[] | undefined,
  templatePath: readonly string[] | undefined,
  diagnostics: Diagnostic[],
  referenceContext: ReferenceContext,
  inheritedReferenceChain: ReferenceChain,
): ReducedObjectComposition | undefined {
  if (foundation.kind !== 'wrapper' || foundation.branches === undefined) {
    return undefined;
  }
  interface AnnotationSource {
    readonly value: string;
    readonly documentPath: readonly (string | number)[];
    readonly referenceChain: ReferenceChain;
  }
  type Task =
    | {
        readonly kind: 'wrapper';
        readonly schema: Record<string, unknown>;
        readonly documentPath: readonly (string | number)[];
        readonly branches: readonly Record<string, unknown>[];
        readonly referenceChain: ReferenceChain;
      }
    | {
        readonly kind: 'branch';
        readonly schema: Record<string, unknown>;
        readonly documentPath: readonly (string | number)[];
        readonly branchIndex: number;
        readonly referenceChain: ReferenceChain;
      }
    | {
        readonly kind: 'exit-raw';
        readonly schema: Record<string, unknown>;
      }
    | {
        readonly kind: 'release-reference';
        readonly activatedTargets: readonly string[];
      };

  const properties: Record<string, unknown> = {};
  const propertySources = new Map<string, CompositionPropertySource>();
  const requiredNames = new Set<string>();
  const requiredSources = new Map<string, CompositionRequiredSource>();
  const annotations = new Map<'title' | 'description', AnnotationSource>();
  const activeRaw = new Map<object, readonly (string | number)[]>();
  let catalogBlocked = false;
  const stack: Task[] = [
    {
      kind: 'wrapper',
      schema,
      documentPath,
      branches: foundation.branches,
      referenceChain: inheritedReferenceChain,
    },
  ];

  const pushDiagnostic = (
    value: Diagnostic,
    referenceChain: ReferenceChain,
    preserveRootDataPath = false,
  ): void => {
    let next = value;
    if (
      dataPath === undefined &&
      !preserveRootDataPath &&
      Object.hasOwn(next, 'dataPath')
    ) {
      const { dataPath: _omitted, ...withoutDataPath } = next;
      void _omitted;
      next = withoutDataPath;
    }
    if (templatePath !== undefined) next = withTemplatePath(next, templatePath);
    if (
      referenceChain.length > 0 &&
      !Object.hasOwn(next.parameters, 'referenceChain')
    ) {
      next = {
        ...next,
        parameters: referenceDiagnosticParameters(next.parameters, {
          referenceChain,
        }),
      };
    }
    diagnostics.push(next);
  };

  const compositionConflict = (
    path: readonly (string | number)[],
    parameters: Readonly<Record<string, unknown>>,
    referenceChain: ReferenceChain,
  ): void => {
    pushDiagnostic(
      diagnostic({
        code: 'INCOMPATIBLE_SCHEMA_COMPOSITION',
        severity: 'error',
        source: 'schema',
        ...(dataPath === undefined ? {} : { dataPath }),
        documentPath: path,
        parameters,
        fallbackMessage: 'Schema composition is incompatible.',
      }),
      referenceChain,
    );
  };

  const recordAnnotation = (
    keyword: 'title' | 'description',
    value: string,
    path: readonly (string | number)[],
    referenceChain: ReferenceChain,
  ): void => {
    const first = annotations.get(keyword);
    if (first === undefined) {
      annotations.set(keyword, { value, documentPath: path, referenceChain });
      return;
    }
    if (first.value === value) return;
    compositionConflict(
      path,
      {
        reason: 'conflicting-annotation',
        keyword,
        firstDocumentPath: [...first.documentPath],
        ...(first.referenceChain.length === 0
          ? {}
          : {
              firstReferenceChain: first.referenceChain.map((entry) => [
                ...entry,
              ]),
            }),
      },
      referenceChain,
    );
  };

  const inspectContribution = (
    contribution: Record<string, unknown>,
    contributionPath: readonly (string | number)[],
    referenceChain: ReferenceChain,
  ): void => {
    const allowed =
      useSite === 'root'
        ? new Set(['type', 'properties', 'required', 'title', 'description'])
        : useSite === 'property'
          ? new Set([
              'type',
              'properties',
              'required',
              'title',
              'description',
              'default',
            ])
          : new Set(['type', 'properties', 'required']);

    for (const keyword of Object.keys(contribution)) {
      const keywordPath = [...contributionPath, keyword];
      if (allowed.has(keyword)) {
        if (keyword === 'required') {
          const member = ownDataValue(contribution, keyword);
          if (!member.present) continue;
          const localEntries: RequiredEntry[] = [];
          const localNames = new Set<string>();
          const start = diagnostics.length;
          if (member.accessor) {
            diagnostics.push(
              invalidSchemaKeywordDescriptor(
                keyword,
                'array of unique strings',
                keywordPath,
                dataPath ?? [],
                'accessor',
              ),
            );
          } else {
            inspectRequiredAtPath(
              member.value,
              localEntries,
              localNames,
              diagnostics,
              dataPath ?? [],
              keywordPath,
            );
          }
          if (dataPath === undefined) {
            for (let index = start; index < diagnostics.length; index += 1) {
              const current = diagnostics[index];
              if (current === undefined) continue;
              const { dataPath: _omitted, ...withoutDataPath } = current;
              void _omitted;
              diagnostics[index] = withoutDataPath;
            }
          }
          if (templatePath !== undefined)
            addTemplatePathToRange(diagnostics, start, templatePath);
          addReferenceChainToRange(diagnostics, start, referenceChain);
          for (const entry of localEntries) {
            requiredNames.add(entry.name);
            if (!requiredSources.has(entry.name)) {
              requiredSources.set(entry.name, {
                ...entry,
                documentPath: [...keywordPath, entry.index],
                referenceChain,
              });
            }
          }
        } else if (keyword === 'title' || keyword === 'description') {
          const member = ownDataValue(contribution, keyword);
          if (!member.present) continue;
          const expected =
            keyword === 'title' && useSite === 'property'
              ? 'non-blank string'
              : 'string';
          if (
            member.accessor ||
            typeof member.value !== 'string' ||
            (expected === 'non-blank string' &&
              member.value.trim().length === 0)
          ) {
            pushDiagnostic(
              member.accessor
                ? invalidSchemaKeywordDescriptor(
                    keyword,
                    expected,
                    keywordPath,
                    dataPath ?? [],
                    'accessor',
                  )
                : invalidSchemaKeywordValue(
                    keyword,
                    member.value,
                    expected,
                    keywordPath,
                    dataPath,
                  ),
              referenceChain,
            );
          } else {
            recordAnnotation(
              keyword,
              member.value,
              keywordPath,
              referenceChain,
            );
          }
        }
        continue;
      }

      let value: Diagnostic;
      if (keyword === '$schema' || keyword === '$defs') {
        value = diagnostic({
          code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
          severity: 'error',
          source: 'schema',
          ...(dataPath === undefined ? {} : { dataPath }),
          documentPath: keywordPath,
          parameters: { keyword, fieldType: 'object' },
          fallbackMessage: `Schema keyword "${keyword}" is incompatible with field type "object".`,
        });
      } else if (KNOWN_IGNORABLE_KEYWORDS.has(keyword)) {
        value = schemaKeywordDiagnostic(
          'IGNORED_SCHEMA_KEYWORD',
          'warning',
          keyword,
          keywordPath,
          `Known annotation "${keyword}" is ignored by the compiler.`,
          dataPath,
        );
      } else if (
        keyword === '$ref' ||
        keyword === 'items' ||
        COMPILER_SUPPORTED_KEYWORDS.has(keyword)
      ) {
        value = diagnostic({
          code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
          severity: 'error',
          source: 'schema',
          ...(dataPath === undefined ? {} : { dataPath }),
          documentPath: keywordPath,
          parameters: { keyword, fieldType: 'object' },
          fallbackMessage: `Schema keyword "${keyword}" is incompatible with field type "object".`,
        });
      } else if (KNOWN_DRAFT_2020_12_KEYWORDS.has(keyword)) {
        value = schemaKeywordDiagnostic(
          'UNSUPPORTED_SCHEMA_KEYWORD',
          'error',
          keyword,
          keywordPath,
          `Schema keyword "${keyword}" is not supported.`,
          dataPath,
        );
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
      pushDiagnostic(value, referenceChain);
    }

    const propertiesMember = ownDataValue(contribution, 'properties');
    if (
      !propertiesMember.present ||
      propertiesMember.accessor ||
      !isOrdinaryRecord(propertiesMember.value)
    )
      return;
    for (const property of Object.keys(propertiesMember.value)) {
      const propertyPath = [...contributionPath, 'properties', property];
      const first = propertySources.get(property);
      if (first !== undefined) {
        propertySources.set(property, { ...first, conflicted: true });
        compositionConflict(
          propertyPath,
          {
            reason: 'duplicate-property',
            property,
            firstDocumentPath: [...first.documentPath],
            ...(first.referenceChain.length === 0
              ? {}
              : {
                  firstReferenceChain: first.referenceChain.map((entry) => [
                    ...entry,
                  ]),
                }),
          },
          referenceChain,
        );
        continue;
      }
      const descriptor = Object.getOwnPropertyDescriptor(
        propertiesMember.value,
        property,
      );
      if (descriptor !== undefined) {
        Object.defineProperty(properties, property, descriptor);
      }
      propertySources.set(property, {
        documentPath: propertyPath,
        referenceChain,
      });
    }
  };

  while (stack.length > 0) {
    const task = stack.pop();
    if (task === undefined) break;
    if (task.kind === 'exit-raw') {
      activeRaw.delete(task.schema);
      continue;
    }
    if (task.kind === 'release-reference') {
      releaseReferenceTargets(referenceContext, task.activatedTargets);
      continue;
    }
    if (task.kind === 'wrapper') {
      const firstPath = activeRaw.get(task.schema);
      if (firstPath !== undefined) {
        catalogBlocked = true;
        pushDiagnostic(
          diagnostic({
            code: 'CYCLIC_SCHEMA_OBJECT',
            severity: 'error',
            source: 'schema',
            ...(dataPath === undefined ? {} : { dataPath }),
            documentPath: task.documentPath,
            parameters: { firstDocumentPath: [...firstPath] },
            fallbackMessage: 'Schema object cycle detected.',
          }),
          task.referenceChain,
        );
        continue;
      }
      activeRaw.set(task.schema, task.documentPath);
      stack.push({ kind: 'exit-raw', schema: task.schema });
      if (useSite !== 'item-root') {
        for (const keyword of ['title', 'description'] as const) {
          const member = ownDataValue(task.schema, keyword);
          if (
            member.present &&
            !member.accessor &&
            typeof member.value === 'string'
          ) {
            const valid =
              keyword !== 'title' ||
              useSite !== 'property' ||
              member.value.trim().length > 0;
            if (valid)
              recordAnnotation(
                keyword,
                member.value,
                [...task.documentPath, keyword],
                task.referenceChain,
              );
          }
        }
      }
      for (let index = task.branches.length - 1; index >= 0; index -= 1) {
        stack.push({
          kind: 'branch',
          schema: task.branches[index] as Record<string, unknown>,
          documentPath: [...task.documentPath, 'allOf', index],
          branchIndex: index,
          referenceChain: task.referenceChain,
        });
      }
      continue;
    }

    const nestedAllOf = Object.getOwnPropertyDescriptor(task.schema, 'allOf');
    if (nestedAllOf !== undefined) {
      const nestedStart = diagnostics.length;
      const nested = inspectCompositionFoundation(task.schema, {
        useSite,
        documentPath: task.documentPath,
        ...(dataPath === undefined ? {} : { dataPath }),
        ...(templatePath === undefined ? {} : { templatePath }),
        inspectBranches: false,
      });
      if (nested.kind === 'input-failure' || nested.kind === 'wrapper') {
        diagnostics.push(...nested.diagnostics);
        addReferenceChainToRange(diagnostics, nestedStart, task.referenceChain);
      }
      if (
        nested.kind === 'input-failure' ||
        (nested.kind === 'wrapper' && nested.branches === undefined)
      ) {
        catalogBlocked = true;
      }
      if (nested.kind === 'wrapper' && nested.branches !== undefined) {
        stack.push({
          kind: 'wrapper',
          schema: task.schema,
          documentPath: task.documentPath,
          branches: nested.branches,
          referenceChain: task.referenceChain,
        });
      }
      continue;
    }

    if (Object.getOwnPropertyDescriptor(task.schema, '$ref') !== undefined) {
      const start = diagnostics.length;
      const resolved = resolveUseSiteSchema(
        task.schema,
        dataPath ?? [],
        task.documentPath,
        task.referenceChain,
        diagnostics,
        referenceContext,
        templatePath,
      );
      if (dataPath === undefined) {
        for (let index = start; index < diagnostics.length; index += 1) {
          const current = diagnostics[index];
          if (current === undefined) continue;
          const { dataPath: _omitted, ...withoutDataPath } = current;
          void _omitted;
          diagnostics[index] = withoutDataPath;
        }
      }
      if (resolved.kind === 'blocked') {
        catalogBlocked = true;
        releaseReferenceTargets(referenceContext, resolved.activatedTargets);
        continue;
      }
      stack.push({
        kind: 'release-reference',
        activatedTargets: resolved.activatedTargets,
      });
      const targetFoundation = inspectCompositionFoundation(resolved.schema, {
        useSite,
        documentPath: resolved.documentPath,
        ...(dataPath === undefined ? {} : { dataPath }),
        ...(templatePath === undefined ? {} : { templatePath }),
        inspectBranches: false,
      });
      if (targetFoundation.kind === 'input-failure') {
        catalogBlocked = true;
        diagnostics.push(...targetFoundation.diagnostics);
        addReferenceChainToRange(diagnostics, start, resolved.referenceChain);
      } else if (targetFoundation.kind === 'wrapper') {
        diagnostics.push(...targetFoundation.diagnostics);
        addReferenceChainToRange(diagnostics, start, resolved.referenceChain);
        if (targetFoundation.branches !== undefined) {
          stack.push({
            kind: 'wrapper',
            schema: resolved.schema,
            documentPath: resolved.documentPath,
            branches: targetFoundation.branches,
            referenceChain: resolved.referenceChain,
          });
        } else {
          catalogBlocked = true;
        }
      } else if (isCompositionContribution(resolved.schema)) {
        inspectContribution(
          resolved.schema,
          resolved.documentPath,
          resolved.referenceChain,
        );
      } else {
        catalogBlocked = true;
        compositionConflict(
          resolved.documentPath,
          {
            reason: 'unsupported-branch-kind',
            branchIndex: task.branchIndex,
            expected:
              'object contribution, local reference or nested object composition',
          },
          resolved.referenceChain,
        );
      }
      continue;
    }

    if (isCompositionContribution(task.schema)) {
      inspectContribution(task.schema, task.documentPath, task.referenceChain);
    } else {
      catalogBlocked = true;
      compositionConflict(
        task.documentPath,
        {
          reason: 'unsupported-branch-kind',
          branchIndex: task.branchIndex,
          expected:
            'object contribution, local reference or nested object composition',
        },
        task.referenceChain,
      );
    }
  }

  for (const source of requiredSources.values()) {
    if (Object.hasOwn(properties, source.name)) continue;
    const warningDataPath =
      dataPath === undefined
        ? [source.name]
        : useSite === 'property'
          ? [...dataPath, source.name]
          : dataPath;
    pushDiagnostic(
      diagnostic({
        code: 'UNMANAGED_REQUIRED_PROPERTY',
        severity: 'warning',
        source: 'schema',
        ...(dataPath === undefined || useSite === 'property'
          ? { dataPath: warningDataPath }
          : { dataPath }),
        documentPath: source.documentPath,
        parameters: { field: source.name },
        fallbackMessage: `Required property "${source.name}" is not managed by this form.`,
      }),
      source.referenceChain,
      true,
    );
  }

  const title = annotations.get('title');
  const description = annotations.get('description');
  return {
    properties,
    propertySources,
    requiredNames,
    catalogBlocked,
    ...(title === undefined ? {} : { schemaTitle: title.value }),
    ...(description === undefined
      ? {}
      : { schemaDescription: description.value }),
  };
}

function isCompositionContribution(schema: Record<string, unknown>): boolean {
  const type = ownDataValue(schema, 'type');
  const properties = ownDataValue(schema, 'properties');
  return (
    type.present &&
    !type.accessor &&
    type.value === 'object' &&
    properties.present &&
    !properties.accessor &&
    isOrdinaryRecord(properties.value)
  );
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
  rootPropertySources?: ReadonlyMap<string, CompositionPropertySource>,
  rootCompositionBlocked = false,
  defaultOutput?: DefaultCandidateSchemaNode[],
  opaqueArrays = false,
  insideDiscriminatedObject = false,
  baseDataPath: readonly string[] = [],
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
        readonly defaultOutput?: DefaultCandidateSchemaNode[];
        readonly referenceChain: ReferenceChain;
        readonly compositionBlocked: boolean;
      };
  const active = new Map<object, readonly (string | number)[]>([
    [rootSchema, []],
  ]);
  const stack: Frame[] = [];
  const rootNames = Object.keys(properties);
  for (let index = rootNames.length - 1; index >= 0; index -= 1) {
    const name = rootNames[index] as string;
    const descriptor = Object.getOwnPropertyDescriptor(properties, name);
    const source = rootPropertySources?.get(name);
    stack.push({
      kind: 'node',
      name,
      schemaValue:
        descriptor !== undefined && 'value' in descriptor
          ? descriptor.value
          : ACCESSOR_VALUE,
      required: requiredNames.has(name),
      dataPath: [...baseDataPath, name],
      documentPath: source?.documentPath ?? ['properties', name],
      output: candidates,
      ...(defaultOutput === undefined ? {} : { defaultOutput }),
      referenceChain: source?.referenceChain ?? [],
      compositionBlocked: rootCompositionBlocked || source?.conflicted === true,
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
      defaultOutput: frameDefaultOutput,
      referenceChain: inheritedChain,
      compositionBlocked,
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

    const directComposition = inspectCompositionFoundation(rawField, {
      useSite: 'property',
      dataPath,
      documentPath: fieldPath,
      inspectBranches: false,
    });
    if (directComposition.kind === 'input-failure') {
      diagnostics.push(...directComposition.diagnostics);
      addReferenceChainToRange(diagnostics, diagnosticStart, inheritedChain);
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

    const composition = inspectCompositionFoundation(field, {
      useSite: 'property',
      dataPath,
      documentPath: resolvedFieldPath,
      inspectBranches: false,
    });
    if (composition.kind === 'input-failure') {
      diagnostics.push(...composition.diagnostics);
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
    const allOfDescriptor = Object.getOwnPropertyDescriptor(field, 'allOf');
    const oneOfDescriptor = Object.getOwnPropertyDescriptor(field, 'oneOf');
    if (
      oneOfDescriptor !== undefined &&
      (insideDiscriminatedObject ||
        rawType === 'object' ||
        rawType === ACCESSOR_VALUE)
    ) {
      if (frameDefaultOutput !== undefined) {
        diagnostics.push(
          schemaKeywordDiagnostic(
            'UNSUPPORTED_SCHEMA_KEYWORD',
            'error',
            'oneOf',
            [...resolvedFieldPath, 'oneOf'],
            'Schema keyword "oneOf" is not supported.',
            dataPath,
          ),
        );
      } else if (insideDiscriminatedObject) {
        diagnostics.push(
          diagnostic({
            code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
            severity: 'error',
            source: 'schema',
            dataPath,
            documentPath: [...resolvedFieldPath, 'oneOf'],
            parameters: {
              keyword: 'oneOf',
              fieldType: 'discriminated-object',
            },
            fallbackMessage:
              'Schema keyword "oneOf" is incompatible with field type "discriminated-object".',
          }),
        );
      } else {
        const candidate = inspectDiscriminatedObjectCandidate(
          name,
          field,
          required,
          dataPath,
          resolvedFieldPath,
          diagnostics,
          rootSchema,
          collectionPolicies,
          usedPolicyIndices,
          referenceContext,
          resolved.referenceChain,
        );
        if (candidate !== undefined) output.push(candidate);
      }
      releaseReferenceTargets(referenceContext, resolved.activatedTargets);
      addReferenceChainToRange(
        diagnostics,
        diagnosticStart,
        resolved.referenceChain,
      );
      continue;
    }
    if (
      allOfDescriptor !== undefined &&
      acceptedNonObjectCompositionType(rawType) === undefined
    ) {
      if (composition.kind === 'wrapper') {
        diagnostics.push(...composition.diagnostics);
        const reduced = reduceObjectComposition(
          field,
          composition,
          'property',
          resolvedFieldPath,
          dataPath,
          undefined,
          diagnostics,
          referenceContext,
          resolved.referenceChain,
        );
        if (reduced !== undefined) {
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
            releaseReferenceTargets(
              referenceContext,
              resolved.activatedTargets,
            );
            addReferenceChainToRange(
              diagnostics,
              diagnosticStart,
              resolved.referenceChain,
            );
            continue;
          }
          const candidate: ObjectCandidate = {
            name,
            type: 'object',
            required,
            ...(reduced.schemaTitle === undefined
              ? {}
              : { schemaTitle: reduced.schemaTitle }),
            ...(reduced.schemaDescription === undefined
              ? {}
              : { schemaDescription: reduced.schemaDescription }),
            dataPath,
            documentPath: resolvedFieldPath,
            children: [],
          };
          output.push(candidate);
          const defaultChildren: DefaultCandidateSchemaNode[] = [];
          frameDefaultOutput?.push({
            kind: 'object',
            nullable: false,
            path: dataPath,
            documentPath: resolvedFieldPath,
            referenceChain: resolved.referenceChain,
            schema: field,
            children: defaultChildren,
          });
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
          const childNames = Object.keys(reduced.properties);
          for (let index = childNames.length - 1; index >= 0; index -= 1) {
            const childName = childNames[index] as string;
            const descriptor = Object.getOwnPropertyDescriptor(
              reduced.properties,
              childName,
            );
            const source = reduced.propertySources.get(childName);
            stack.push({
              kind: 'node',
              name: childName,
              schemaValue:
                descriptor !== undefined && 'value' in descriptor
                  ? descriptor.value
                  : ACCESSOR_VALUE,
              required: reduced.requiredNames.has(childName),
              dataPath: [...dataPath, childName],
              documentPath: source?.documentPath ?? [
                ...resolvedFieldPath,
                'properties',
                childName,
              ],
              output: candidate.children,
              defaultOutput: defaultChildren,
              referenceChain: source?.referenceChain ?? resolved.referenceChain,
              compositionBlocked:
                compositionBlocked ||
                reduced.catalogBlocked ||
                source?.conflicted === true,
            });
          }
          continue;
        }
        releaseReferenceTargets(referenceContext, resolved.activatedTargets);
        addReferenceChainToRange(
          diagnostics,
          diagnosticStart,
          resolved.referenceChain,
        );
        continue;
      }
    }

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
        frameDefaultOutput?.push({
          kind: nullableType,
          nullable: true,
          path: dataPath,
          documentPath: resolvedFieldPath,
          referenceChain: resolved.referenceChain,
          schema: field,
          children: [],
        });
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
      frameDefaultOutput?.push({
        kind: rawType as FieldType,
        nullable: false,
        path: dataPath,
        documentPath: resolvedFieldPath,
        referenceChain: resolved.referenceChain,
        schema: field,
        children: [],
      });
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
      if (opaqueArrays) {
        inspectOpaqueArraySchema(
          field,
          dataPath,
          resolvedFieldPath,
          diagnostics,
        );
        frameDefaultOutput?.push({
          kind: 'array',
          nullable: false,
          path: dataPath,
          documentPath: resolvedFieldPath,
          referenceChain: resolved.referenceChain,
          schema: field,
          children: [],
        });
        releaseReferenceTargets(referenceContext, resolved.activatedTargets);
        addReferenceChainToRange(
          diagnostics,
          diagnosticStart,
          resolved.referenceChain,
        );
        continue;
      }
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
        compositionBlocked,
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
    const defaultChildren: DefaultCandidateSchemaNode[] = [];
    frameDefaultOutput?.push({
      kind: 'object',
      nullable: false,
      path: dataPath,
      documentPath: resolvedFieldPath,
      referenceChain: resolved.referenceChain,
      schema: field,
      children: defaultChildren,
    });
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
        defaultOutput: defaultChildren,
        referenceChain: resolved.referenceChain,
        compositionBlocked,
      });
    }
  }

  return candidates;
}

interface AlternativeBranchCatalog {
  readonly index: number;
  readonly schema: Record<string, unknown>;
  readonly documentPath: readonly (string | number)[];
  readonly referenceChain: ReferenceChain;
  readonly properties: Record<string, unknown>;
  readonly requiredEntries: readonly RequiredEntry[];
  readonly requiredNames: ReadonlySet<string>;
}

function inspectDiscriminatedObjectCandidate(
  name: string,
  schema: Record<string, unknown>,
  required: boolean,
  dataPath: readonly string[],
  documentPath: readonly (string | number)[],
  diagnostics: Diagnostic[],
  rootSchema: Record<string, unknown>,
  collectionPolicies: ParsedCollectionPolicies,
  usedPolicyIndices: Set<number>,
  referenceContext: ReferenceContext,
  referenceChain: ReferenceChain,
): DiscriminatedObjectCandidate | undefined {
  const start = diagnostics.length;
  let schemaTitle: string | undefined;
  let schemaDescription: string | undefined;
  let properties: Record<string, unknown> | undefined;
  const requiredEntries: RequiredEntry[] = [];
  const requiredNames = new Set<string>();

  for (const keyword of Object.keys(schema)) {
    const keywordPath = [...documentPath, keyword];
    const member = ownDataValue(schema, keyword);
    const value =
      member.present && !member.accessor ? member.value : ACCESSOR_VALUE;
    if (keyword === 'type') {
      if (value !== 'object') {
        diagnostics.push(
          value === ACCESSOR_VALUE
            ? invalidSchemaKeywordDescriptor(
                'type',
                '"object"',
                keywordPath,
                dataPath,
                'accessor',
              )
            : invalidSchemaKeywordValue(
                'type',
                value,
                '"object"',
                keywordPath,
                dataPath,
              ),
        );
      }
      continue;
    }
    if (keyword === 'properties') {
      if (isOrdinaryRecord(value)) properties = value;
      else {
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
      continue;
    }
    if (keyword === 'required') {
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
      continue;
    }
    if (keyword === 'oneOf' || keyword === 'default') continue;
    if (keyword === 'title' || keyword === 'description') {
      const expected = keyword === 'title' ? 'non-blank string' : 'string';
      if (
        typeof value !== 'string' ||
        (keyword === 'title' && value.trim().length === 0)
      ) {
        diagnostics.push(
          value === ACCESSOR_VALUE
            ? invalidSchemaKeywordDescriptor(
                keyword,
                expected,
                keywordPath,
                dataPath,
                'accessor',
              )
            : invalidSchemaKeywordValue(
                keyword,
                value,
                expected,
                keywordPath,
                dataPath,
              ),
        );
      } else if (keyword === 'title') schemaTitle = value;
      else schemaDescription = value;
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
          dataPath,
        ),
      );
    } else if (
      KNOWN_DRAFT_2020_12_KEYWORDS.has(keyword) ||
      COMPILER_SUPPORTED_KEYWORDS.has(keyword) ||
      keyword === 'items'
    ) {
      diagnostics.push(
        diagnostic({
          code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
          severity: 'error',
          source: 'schema',
          dataPath,
          documentPath: keywordPath,
          parameters: { keyword, fieldType: 'discriminated-object' },
          fallbackMessage: `Schema keyword "${keyword}" is incompatible with field type "discriminated-object".`,
        }),
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
  }

  for (const keyword of ['type', 'properties', 'required'] as const) {
    if (Object.hasOwn(schema, keyword)) continue;
    if (keyword === 'properties') {
      diagnostics.push(
        diagnostic({
          code: 'MISSING_SCHEMA_PROPERTIES',
          severity: 'error',
          source: 'schema',
          dataPath,
          documentPath: [...documentPath, keyword],
          parameters: {},
          fallbackMessage: 'Object schema must declare properties.',
        }),
      );
    } else {
      diagnostics.push(
        invalidSchemaKeywordDescriptor(
          keyword,
          keyword === 'type' ? '"object"' : 'array of unique strings',
          [...documentPath, keyword],
          dataPath,
          'missing',
        ),
      );
    }
  }

  const branches = inspectOneOfBranches(
    schema,
    dataPath,
    documentPath,
    diagnostics,
    referenceContext,
    referenceChain,
  );
  if (properties === undefined || branches === undefined) return undefined;

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

  const effectiveOuterProperties = new Map<string, Record<string, unknown>>();
  for (const property of Object.keys(properties)) {
    const propertyPath = [...documentPath, 'properties', property];
    const propertyMember = ownDataValue(properties, property);
    if (
      !propertyMember.present ||
      propertyMember.accessor ||
      !isOrdinaryRecord(propertyMember.value)
    ) {
      diagnostics.push(
        alternativeDiagnostic(dataPath, propertyPath, {
          reason: 'unsupported-alternative-descendant',
          property,
          expected: 'non-array primitive or ordinary object subtree',
        }),
      );
      continue;
    }
    if (propertyMember.value === schema) {
      diagnostics.push(
        diagnostic({
          code: 'CYCLIC_SCHEMA_OBJECT',
          severity: 'error',
          source: 'schema',
          dataPath: [...dataPath, property],
          documentPath: propertyPath,
          parameters: { firstDocumentPath: [...documentPath] },
          fallbackMessage: 'Schema object cycle detected.',
        }),
      );
      continue;
    }
    const resolvedProperty = resolveUseSiteSchema(
      propertyMember.value,
      [...dataPath, property],
      propertyPath,
      referenceChain,
      diagnostics,
      referenceContext,
    );
    if (resolvedProperty.kind === 'blocked') {
      releaseReferenceTargets(
        referenceContext,
        resolvedProperty.activatedTargets,
      );
      continue;
    }
    const unsupported = findUnsupportedAlternativeDescendant(
      resolvedProperty.schema,
      resolvedProperty.documentPath,
      [...dataPath, property],
      resolvedProperty.referenceChain,
      diagnostics,
      referenceContext,
    );
    if (unsupported !== undefined) {
      diagnostics.push(
        alternativeDiagnostic(
          dataPath,
          unsupported.documentPath,
          {
            reason: 'unsupported-alternative-descendant',
            property,
            expected: 'non-array primitive or ordinary object subtree',
          },
          unsupported.referenceChain,
        ),
      );
    } else {
      effectiveOuterProperties.set(property, resolvedProperty.schema);
    }
    releaseReferenceTargets(
      referenceContext,
      resolvedProperty.activatedTargets,
    );
  }

  if (hasErrors(diagnostics.slice(start))) return undefined;

  const seedCandidates: Array<{
    readonly name: string;
    readonly values: readonly string[];
  }> = [];
  for (const property of Object.keys(properties)) {
    if (!requiredNames.has(property)) continue;
    const effectiveProperty = effectiveOuterProperties.get(property);
    if (effectiveProperty === undefined) continue;
    const values = readSeedEnum(effectiveProperty);
    if (values === undefined) continue;
    if (
      branches.some((branch) => isExactBranchDiscriminator(branch, property))
    ) {
      seedCandidates.push({ name: property, values });
    }
  }

  if (seedCandidates.length !== 1) {
    diagnostics.push(
      alternativeDiagnostic(dataPath, [...documentPath, 'oneOf'], {
        reason: 'invalid-discriminator-candidate-count',
        candidateCount: seedCandidates.length,
        expected: 'exactly one seeded required outer string-enum discriminator',
      }),
    );
    return undefined;
  }
  const seed = seedCandidates[0] as (typeof seedCandidates)[number];
  const discriminator = seed.name;
  const valueToChoice = new Map(
    seed.values.map((value, index) => [value, index] as const),
  );
  const branchByChoice = new Map<number, number>();
  let mappingValid = true;

  for (const branch of branches) {
    const discriminatorMember = ownDataValue(branch.properties, discriminator);
    if (!discriminatorMember.present) {
      diagnostics.push(
        alternativeDiagnostic(
          dataPath,
          branch.documentPath,
          {
            reason: 'missing-branch-discriminator',
            branchIndex: branch.index,
            discriminator,
          },
          branch.referenceChain,
        ),
      );
      mappingValid = false;
      continue;
    }
    if (
      discriminatorMember.accessor ||
      !isOrdinaryRecord(discriminatorMember.value) ||
      !branch.requiredNames.has(discriminator)
    ) {
      diagnostics.push(
        alternativeDiagnostic(
          dataPath,
          [...branch.documentPath, 'properties', discriminator],
          {
            reason: 'invalid-branch-discriminator',
            branchIndex: branch.index,
            discriminator,
          },
          branch.referenceChain,
        ),
      );
      mappingValid = false;
      continue;
    }
    const value = readExactBranchConst(discriminatorMember.value);
    const choiceIndex =
      value === undefined ? undefined : valueToChoice.get(value);
    if (choiceIndex === undefined) {
      diagnostics.push(
        alternativeDiagnostic(
          dataPath,
          [...branch.documentPath, 'properties', discriminator, 'const'],
          {
            reason: 'invalid-branch-discriminator',
            branchIndex: branch.index,
            discriminator,
          },
          branch.referenceChain,
        ),
      );
      mappingValid = false;
      continue;
    }
    const firstBranchIndex = branchByChoice.get(choiceIndex);
    if (firstBranchIndex !== undefined) {
      diagnostics.push(
        alternativeDiagnostic(
          dataPath,
          [...branch.documentPath, 'properties', discriminator, 'const'],
          {
            reason: 'duplicate-discriminator-value',
            branchIndex: branch.index,
            firstBranchIndex,
            discriminator,
          },
          branch.referenceChain,
        ),
      );
      mappingValid = false;
      continue;
    }
    branchByChoice.set(choiceIndex, branch.index);
  }
  for (
    let choiceIndex = 0;
    choiceIndex < seed.values.length;
    choiceIndex += 1
  ) {
    if (!branchByChoice.has(choiceIndex)) {
      diagnostics.push(
        alternativeDiagnostic(
          dataPath,
          [...documentPath, 'properties', discriminator, 'enum', choiceIndex],
          {
            reason: 'unmapped-discriminator-value',
            choiceIndex,
            discriminator,
          },
        ),
      );
      mappingValid = false;
    }
  }

  const unionProperties: Record<string, unknown> = {};
  const propertySources = new Map<string, CompositionPropertySource>();
  const unionRequired = new Set<string>();
  for (const property of Object.keys(properties)) {
    const descriptor = Object.getOwnPropertyDescriptor(properties, property);
    if (descriptor !== undefined)
      Object.defineProperty(unionProperties, property, descriptor);
    propertySources.set(property, {
      documentPath: [...documentPath, 'properties', property],
      referenceChain,
    });
    if (requiredNames.has(property)) unionRequired.add(property);
  }

  const branchChildren = new Map<number, string[]>();
  for (const branch of branches) {
    const ownChildren: string[] = [];
    for (const entry of branch.requiredEntries) {
      if (
        entry.name !== discriminator &&
        !Object.hasOwn(branch.properties, entry.name)
      ) {
        diagnostics.push(
          alternativeDiagnostic(
            dataPath,
            [...branch.documentPath, 'required', entry.index],
            {
              reason: 'invalid-alternative-required',
              branchIndex: branch.index,
              property: entry.name,
            },
            branch.referenceChain,
          ),
        );
      }
    }
    for (const property of Object.keys(branch.properties)) {
      if (property === discriminator) continue;
      const currentPath = [...branch.documentPath, 'properties', property];
      const first = propertySources.get(property);
      if (first !== undefined) {
        diagnostics.push(
          alternativeDiagnostic(
            dataPath,
            currentPath,
            {
              reason: Object.hasOwn(properties, property)
                ? 'outer-property-redeclared'
                : 'duplicate-alternative-property',
              branchIndex: branch.index,
              property,
              firstDocumentPath: [...first.documentPath],
              ...(first.referenceChain.length === 0
                ? {}
                : {
                    firstReferenceChain: first.referenceChain.map((path) => [
                      ...path,
                    ]),
                  }),
            },
            branch.referenceChain,
          ),
        );
        continue;
      }
      const propertyMember = ownDataValue(branch.properties, property);
      if (
        !propertyMember.present ||
        propertyMember.accessor ||
        !isOrdinaryRecord(propertyMember.value)
      ) {
        diagnostics.push(
          alternativeDiagnostic(
            dataPath,
            currentPath,
            {
              reason: 'unsupported-alternative-descendant',
              branchIndex: branch.index,
              property,
              expected: 'non-array primitive or ordinary object subtree',
            },
            branch.referenceChain,
          ),
        );
        continue;
      }
      const rawCyclePath =
        propertyMember.value === branch.schema
          ? branch.documentPath
          : propertyMember.value === schema
            ? documentPath
            : undefined;
      if (rawCyclePath !== undefined) {
        diagnostics.push(
          diagnostic({
            code: 'CYCLIC_SCHEMA_OBJECT',
            severity: 'error',
            source: 'schema',
            dataPath: [...dataPath, property],
            documentPath: currentPath,
            parameters: { firstDocumentPath: [...rawCyclePath] },
            fallbackMessage: 'Schema object cycle detected.',
          }),
        );
        continue;
      }
      const resolvedDescendant = resolveUseSiteSchema(
        propertyMember.value,
        [...dataPath, property],
        currentPath,
        branch.referenceChain,
        diagnostics,
        referenceContext,
      );
      if (resolvedDescendant.kind === 'blocked') {
        releaseReferenceTargets(
          referenceContext,
          resolvedDescendant.activatedTargets,
        );
        continue;
      }
      const unsupported = findUnsupportedAlternativeDescendant(
        resolvedDescendant.schema,
        resolvedDescendant.documentPath,
        [...dataPath, property],
        resolvedDescendant.referenceChain,
        diagnostics,
        referenceContext,
      );
      if (unsupported !== undefined) {
        diagnostics.push(
          alternativeDiagnostic(
            dataPath,
            unsupported.documentPath,
            {
              reason: 'unsupported-alternative-descendant',
              branchIndex: branch.index,
              property,
              expected: 'non-array primitive or ordinary object subtree',
            },
            unsupported.referenceChain,
          ),
        );
        releaseReferenceTargets(
          referenceContext,
          resolvedDescendant.activatedTargets,
        );
        continue;
      }
      releaseReferenceTargets(
        referenceContext,
        resolvedDescendant.activatedTargets,
      );
      const descriptor = Object.getOwnPropertyDescriptor(
        branch.properties,
        property,
      );
      if (descriptor !== undefined)
        Object.defineProperty(unionProperties, property, descriptor);
      propertySources.set(property, {
        documentPath: currentPath,
        referenceChain: branch.referenceChain,
      });
      if (branch.requiredNames.has(property)) unionRequired.add(property);
      ownChildren.push(property);
    }
    branchChildren.set(branch.index, ownChildren);
  }

  const children = inspectNodes(
    unionProperties,
    unionRequired,
    diagnostics,
    rootSchema,
    collectionPolicies,
    usedPolicyIndices,
    referenceContext,
    propertySources,
    false,
    undefined,
    true,
    true,
    dataPath,
  );
  if (hasErrors(diagnostics.slice(start)) || !mappingValid) return undefined;

  const branchByIndex = new Map(
    branches.map((branch) => [branch.index, branch]),
  );
  const alternatives = seed.values.map((value, choiceIndex) => {
    const branchIndex = branchByChoice.get(choiceIndex) as number;
    const branch = branchByIndex.get(branchIndex) as AlternativeBranchCatalog;
    return {
      discriminatorValue: value,
      children: branchChildren.get(branch.index) ?? [],
    } satisfies DiscriminatedObjectAlternativeDefinition;
  });
  return {
    name,
    type: 'discriminated-object',
    required,
    ...(schemaTitle === undefined ? {} : { schemaTitle }),
    ...(schemaDescription === undefined ? {} : { schemaDescription }),
    dataPath,
    documentPath,
    discriminator,
    alternatives,
    children,
  };
}

function inspectOneOfBranches(
  schema: Record<string, unknown>,
  dataPath: readonly string[],
  documentPath: readonly (string | number)[],
  diagnostics: Diagnostic[],
  referenceContext: ReferenceContext,
  referenceChain: ReferenceChain,
): readonly AlternativeBranchCatalog[] | undefined {
  const oneOfPath = [...documentPath, 'oneOf'];
  const descriptor = Object.getOwnPropertyDescriptor(schema, 'oneOf');
  if (
    descriptor === undefined ||
    !descriptor.enumerable ||
    !('value' in descriptor) ||
    !Array.isArray(descriptor.value)
  ) {
    diagnostics.push(
      diagnostic({
        code: 'INVALID_SCHEMA_KEYWORD_VALUE',
        severity: 'error',
        source: 'schema',
        dataPath,
        documentPath: oneOfPath,
        parameters: {
          keyword: 'oneOf',
          expected: 'array of at least two object schemas',
          actualType:
            descriptor === undefined
              ? 'missing'
              : !descriptor.enumerable
                ? 'non-enumerable'
                : !('value' in descriptor)
                  ? 'accessor'
                  : actualType(descriptor.value),
        },
        fallbackMessage: 'Schema keyword "oneOf" has an invalid value.',
      }),
    );
    return undefined;
  }
  const value = descriptor.value;
  const lengthDescriptor = Object.getOwnPropertyDescriptor(value, 'length');
  const length: unknown =
    lengthDescriptor !== undefined && 'value' in lengthDescriptor
      ? (lengthDescriptor.value as unknown)
      : undefined;
  if (!Number.isSafeInteger(length) || (length as number) < 2) {
    diagnostics.push(
      diagnostic({
        code: 'INVALID_SCHEMA_KEYWORD_VALUE',
        severity: 'error',
        source: 'schema',
        dataPath,
        documentPath: oneOfPath,
        parameters: {
          keyword: 'oneOf',
          expected: 'safe integer length of at least two',
          reason: 'invalid-oneof-length',
          actualType:
            lengthDescriptor === undefined
              ? 'missing'
              : !('value' in lengthDescriptor)
                ? 'accessor'
                : actualType(length),
          ...(Number.isSafeInteger(length) && (length as number) < 2
            ? { actualLength: length }
            : {}),
        },
        fallbackMessage: 'Schema keyword "oneOf" has an invalid value.',
      }),
    );
    return undefined;
  }
  const branches: Record<string, unknown>[] = [];
  for (let index = 0; index < (length as number); index += 1) {
    const entry = Object.getOwnPropertyDescriptor(value, index);
    if (
      entry === undefined ||
      !entry.enumerable ||
      !('value' in entry) ||
      !isOrdinaryRecord(entry.value)
    ) {
      diagnostics.push(
        diagnostic({
          code: 'INVALID_SCHEMA_KEYWORD_VALUE',
          severity: 'error',
          source: 'schema',
          dataPath,
          documentPath: [...oneOfPath, index],
          parameters: {
            keyword: 'oneOf',
            expected: 'ordinary schema object',
            actualType:
              entry === undefined
                ? 'missing'
                : !entry.enumerable
                  ? 'non-enumerable'
                  : !('value' in entry)
                    ? 'accessor'
                    : actualType(entry.value),
          },
          fallbackMessage: 'Schema keyword "oneOf" has an invalid value.',
        }),
      );
      return undefined;
    }
    branches.push(entry.value);
  }
  const indexedKeys = new Set(branches.map((_, index) => String(index)));
  const unexpected = Object.keys(value).find((key) => !indexedKeys.has(key));
  if (unexpected !== undefined) {
    diagnostics.push(
      diagnostic({
        code: 'INVALID_SCHEMA_KEYWORD_VALUE',
        severity: 'error',
        source: 'schema',
        dataPath,
        documentPath: [...oneOfPath, unexpected],
        parameters: {
          keyword: 'oneOf',
          expected: 'dense array indices only',
          reason: 'unexpected-oneof-member',
        },
        fallbackMessage: 'Schema keyword "oneOf" has an invalid value.',
      }),
    );
    return undefined;
  }

  const result: AlternativeBranchCatalog[] = [];
  for (let index = 0; index < branches.length; index += 1) {
    const inline = branches[index] as Record<string, unknown>;
    const branchPath = [...oneOfPath, index];
    if (inline === schema) {
      diagnostics.push(
        diagnostic({
          code: 'CYCLIC_SCHEMA_OBJECT',
          severity: 'error',
          source: 'schema',
          dataPath,
          documentPath: branchPath,
          parameters: { firstDocumentPath: [...documentPath] },
          fallbackMessage: 'Schema object cycle detected.',
        }),
      );
      continue;
    }
    const resolved = resolveUseSiteSchema(
      inline,
      dataPath,
      branchPath,
      referenceChain,
      diagnostics,
      referenceContext,
    );
    if (resolved.kind === 'blocked') {
      releaseReferenceTargets(referenceContext, resolved.activatedTargets);
      continue;
    }
    const branch = resolved.schema;
    const branchDocumentPath = resolved.documentPath;
    const branchStart = diagnostics.length;
    const type = ownDataValue(branch, 'type');
    const properties = ownDataValue(branch, 'properties');
    const required = ownDataValue(branch, 'required');
    if (
      !type.present ||
      type.accessor ||
      type.value !== 'object' ||
      !properties.present ||
      properties.accessor ||
      !isOrdinaryRecord(properties.value) ||
      !required.present ||
      required.accessor
    ) {
      diagnostics.push(
        alternativeDiagnostic(
          dataPath,
          branchDocumentPath,
          {
            reason: 'unsupported-branch-kind',
            branchIndex: index,
            expected: 'ordinary object alternative or local reference',
          },
          resolved.referenceChain,
        ),
      );
      releaseReferenceTargets(referenceContext, resolved.activatedTargets);
      continue;
    }
    for (const keyword of Object.keys(branch)) {
      if (
        keyword === 'type' ||
        keyword === 'properties' ||
        keyword === 'required'
      )
        continue;
      const keywordPath = [...branchDocumentPath, keyword];
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
      } else if (!KNOWN_DRAFT_2020_12_KEYWORDS.has(keyword)) {
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
      } else {
        diagnostics.push(
          diagnostic({
            code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
            severity: 'error',
            source: 'schema',
            dataPath,
            documentPath: keywordPath,
            parameters: { keyword, fieldType: 'object-alternative' },
            fallbackMessage: `Schema keyword "${keyword}" is incompatible with field type "object-alternative".`,
          }),
        );
      }
    }
    const requiredEntries: RequiredEntry[] = [];
    const requiredNames = new Set<string>();
    inspectRequiredAtPath(
      required.value,
      requiredEntries,
      requiredNames,
      diagnostics,
      dataPath,
      [...branchDocumentPath, 'required'],
    );
    addReferenceChainToRange(diagnostics, branchStart, resolved.referenceChain);
    result.push({
      index,
      schema: branch,
      documentPath: branchDocumentPath,
      referenceChain: resolved.referenceChain,
      properties: properties.value,
      requiredEntries,
      requiredNames,
    });
    releaseReferenceTargets(referenceContext, resolved.activatedTargets);
  }
  return result;
}

function readSeedEnum(
  schema: Record<string, unknown>,
): readonly string[] | undefined {
  const type = ownDataValue(schema, 'type');
  const values = ownDataValue(schema, 'enum');
  if (
    !type.present ||
    type.accessor ||
    type.value !== 'string' ||
    Object.hasOwn(schema, 'const') ||
    !values.present ||
    values.accessor ||
    !Array.isArray(values.value) ||
    values.value.length < 2
  ) {
    return undefined;
  }
  const result: string[] = [];
  const seen = new Set<string>();
  for (let index = 0; index < values.value.length; index += 1) {
    const entry = Object.getOwnPropertyDescriptor(values.value, index);
    if (
      entry === undefined ||
      !('value' in entry) ||
      typeof entry.value !== 'string' ||
      seen.has(entry.value)
    ) {
      return undefined;
    }
    seen.add(entry.value);
    result.push(entry.value);
  }
  return result;
}

function isExactBranchDiscriminator(
  branch: AlternativeBranchCatalog,
  property: string,
): boolean {
  if (!branch.requiredNames.has(property)) return false;
  const member = ownDataValue(branch.properties, property);
  return (
    member.present &&
    !member.accessor &&
    isOrdinaryRecord(member.value) &&
    readExactBranchConst(member.value) !== undefined
  );
}

function readExactBranchConst(
  schema: Record<string, unknown>,
): string | undefined {
  const type = ownDataValue(schema, 'type');
  const fixed = ownDataValue(schema, 'const');
  if (
    !type.present ||
    type.accessor ||
    type.value !== 'string' ||
    !fixed.present ||
    fixed.accessor ||
    typeof fixed.value !== 'string' ||
    Object.hasOwn(schema, 'enum')
  ) {
    return undefined;
  }
  for (const keyword of Object.keys(schema)) {
    if (keyword === 'type' || keyword === 'const') continue;
    if (
      !KNOWN_IGNORABLE_KEYWORDS.has(keyword) &&
      KNOWN_DRAFT_2020_12_KEYWORDS.has(keyword)
    ) {
      return undefined;
    }
  }
  return fixed.value;
}

function findUnsupportedAlternativeDescendant(
  schema: Record<string, unknown>,
  documentPath: readonly (string | number)[],
  dataPath: readonly string[],
  referenceChain: ReferenceChain,
  diagnostics: Diagnostic[],
  referenceContext: ReferenceContext,
):
  | {
      readonly documentPath: readonly (string | number)[];
      readonly referenceChain: ReferenceChain;
    }
  | undefined {
  type Task =
    | {
        readonly kind: 'visit';
        readonly schema: Record<string, unknown>;
        readonly documentPath: readonly (string | number)[];
        readonly dataPath: readonly string[];
        readonly referenceChain: ReferenceChain;
      }
    | {
        readonly kind: 'children';
        readonly properties: Record<string, unknown>;
        readonly names: readonly string[];
        readonly index: number;
        readonly documentPath: readonly (string | number)[];
        readonly dataPath: readonly string[];
        readonly referenceChain: ReferenceChain;
      }
    | {
        readonly kind: 'exit-raw';
        readonly schema: Record<string, unknown>;
      }
    | {
        readonly kind: 'release-reference';
        readonly activatedTargets: readonly string[];
      };
  const initialTargets = new Set(referenceContext.activeTargets.keys());
  const activeRaw = new Set<object>();
  const stack: Task[] = [
    { kind: 'visit', schema, documentPath, dataPath, referenceChain },
  ];
  try {
    while (stack.length > 0) {
      const task = stack.pop();
      if (task === undefined) break;
      if (task.kind === 'exit-raw') {
        activeRaw.delete(task.schema);
        continue;
      }
      if (task.kind === 'release-reference') {
        releaseReferenceTargets(referenceContext, task.activatedTargets);
        continue;
      }
      if (task.kind === 'children') {
        const name = task.names[task.index];
        if (name === undefined) continue;
        stack.push({ ...task, index: task.index + 1 });
        const child = ownDataValue(task.properties, name);
        if (!child.present || child.accessor || !isOrdinaryRecord(child.value))
          continue;
        const childDataPath = [...task.dataPath, name];
        const childDocumentPath = [...task.documentPath, 'properties', name];
        const resolved = resolveUseSiteSchema(
          child.value,
          childDataPath,
          childDocumentPath,
          task.referenceChain,
          diagnostics,
          referenceContext,
        );
        if (resolved.kind === 'blocked') {
          releaseReferenceTargets(referenceContext, resolved.activatedTargets);
          continue;
        }
        stack.push({
          kind: 'release-reference',
          activatedTargets: resolved.activatedTargets,
        });
        stack.push({
          kind: 'visit',
          schema: resolved.schema,
          documentPath: resolved.documentPath,
          dataPath: childDataPath,
          referenceChain: resolved.referenceChain,
        });
        continue;
      }

      const current = task.schema;
      if (
        Object.hasOwn(current, 'oneOf') ||
        Object.hasOwn(current, 'allOf') ||
        Object.hasOwn(current, 'items')
      ) {
        return {
          documentPath: task.documentPath,
          referenceChain: task.referenceChain,
        };
      }
      const type = ownDataValue(current, 'type');
      if (
        type.present &&
        !type.accessor &&
        (type.value === 'array' ||
          (Array.isArray(type.value) && type.value.includes('array')))
      ) {
        return {
          documentPath: task.documentPath,
          referenceChain: task.referenceChain,
        };
      }
      if (activeRaw.has(current)) continue;
      const properties = ownDataValue(current, 'properties');
      if (
        !properties.present ||
        properties.accessor ||
        !isOrdinaryRecord(properties.value)
      ) {
        continue;
      }
      activeRaw.add(current);
      stack.push({ kind: 'exit-raw', schema: current });
      stack.push({
        kind: 'children',
        properties: properties.value,
        names: Object.keys(properties.value),
        index: 0,
        documentPath: task.documentPath,
        dataPath: task.dataPath,
        referenceChain: task.referenceChain,
      });
    }
    return undefined;
  } finally {
    for (const target of referenceContext.activeTargets.keys()) {
      if (!initialTargets.has(target)) {
        referenceContext.activeTargets.delete(target);
      }
    }
  }
}

function alternativeDiagnostic(
  dataPath: readonly string[],
  documentPath: readonly (string | number)[],
  parameters: Readonly<Record<string, unknown>>,
  referenceChain: ReferenceChain = [],
): Diagnostic {
  const value = diagnostic({
    code: 'INCOMPATIBLE_SCHEMA_ALTERNATIVE',
    severity: 'error',
    source: 'schema',
    dataPath,
    documentPath,
    parameters,
    fallbackMessage: 'Schema object alternative is incompatible.',
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

function inspectOpaqueArraySchema(
  schema: Record<string, unknown>,
  dataPath: readonly string[],
  documentPath: readonly (string | number)[],
  diagnostics: Diagnostic[],
): void {
  for (const keyword of Object.keys(schema)) {
    if (ARRAY_FIELD_KEYWORDS.has(keyword)) continue;
    const keywordPath = [...documentPath, keyword];
    if (keyword === 'allOf') {
      diagnostics.push(
        incompatibleAllOfDiagnostic('array', keywordPath, dataPath),
      );
    } else if (keyword === 'oneOf') {
      diagnostics.push(
        diagnostic({
          code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
          severity: 'error',
          source: 'schema',
          dataPath,
          documentPath: keywordPath,
          parameters: { keyword, fieldType: 'array' },
          fallbackMessage:
            'Schema keyword "oneOf" is incompatible with field type "array".',
        }),
      );
    } else if (KNOWN_IGNORABLE_KEYWORDS.has(keyword)) {
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
      keyword !== 'const' &&
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
    }
  }
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
  suppressDependentPolicyDiagnostics: boolean,
): ArrayCandidate | FieldCandidate | undefined {
  const directItems = ownDataValue(schema, 'items');
  if (
    hasSafeStringEnumArrayMarker(schema) &&
    (!directItems.present ||
      directItems.accessor ||
      !isOrdinaryRecord(directItems.value))
  ) {
    inspectUnclassifiedStringEnumArrayCommon(
      schema,
      dataPath,
      documentPath,
      diagnostics,
    );
    const itemsPath = [...documentPath, 'items'];
    diagnostics.push(
      !directItems.present || directItems.accessor
        ? invalidSchemaKeywordDescriptor(
            'items',
            'string-enum item schema',
            itemsPath,
            dataPath,
            !directItems.present ? 'missing' : 'accessor',
          )
        : invalidSchemaKeywordValue(
            'items',
            directItems.value,
            'string-enum item schema',
            itemsPath,
            dataPath,
          ),
    );
    return undefined;
  }
  if (
    directItems.present &&
    !directItems.accessor &&
    isOrdinaryRecord(directItems.value)
  ) {
    const directItemType = ownDataValue(directItems.value, 'type');
    if (
      directItemType.present &&
      !directItemType.accessor &&
      directItemType.value === 'string'
    ) {
      return inspectStringEnumArrayCandidate(
        name,
        schema,
        directItems.value,
        required,
        dataPath,
        documentPath,
        diagnostics,
      );
    }
  }

  let schemaTitle: string | undefined;
  let schemaDescription: string | undefined;
  const policy = collectionPolicies.valid
    ? collectionPolicies.byPath.get(JSON.stringify(dataPath))
    : undefined;
  if (policy !== undefined) usedPolicyIndices.add(policy.index);
  const suppressUnclassifiedUnique =
    hasSafeStringEnumArrayMarker(schema) &&
    directItems.present &&
    !directItems.accessor &&
    isOrdinaryRecord(directItems.value) &&
    !Object.hasOwn(directItems.value, '$ref') &&
    !Object.hasOwn(directItems.value, 'allOf') &&
    (() => {
      const type = ownDataValue(directItems.value, 'type');
      return (
        !type.present ||
        type.accessor ||
        (type.value !== 'object' && type.value !== 'string')
      );
    })();
  for (const keyword of Object.keys(schema)) {
    const keywordPath = [...documentPath, keyword];
    if (keyword === 'uniqueItems' && suppressUnclassifiedUnique) continue;
    if (keyword === 'allOf') {
      diagnostics.push(
        incompatibleAllOfDiagnostic('array', keywordPath, dataPath),
      );
      continue;
    }
    if (keyword === 'oneOf') {
      diagnostics.push(
        diagnostic({
          code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
          severity: 'error',
          source: 'schema',
          dataPath,
          documentPath: keywordPath,
          parameters: { keyword, fieldType: 'array' },
          fallbackMessage:
            'Schema keyword "oneOf" is incompatible with field type "array".',
        }),
      );
      continue;
    }
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
        keyword !== 'const' &&
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
    const expectedItems = hasSafeStringEnumArrayMarker(schema)
      ? 'string-enum item schema'
      : 'inline object item schema';
    diagnostics.push(
      !itemsMember.present || itemsMember.accessor
        ? invalidSchemaKeywordDescriptor(
            'items',
            expectedItems,
            itemsPath,
            dataPath,
            !itemsMember.present ? 'missing' : 'accessor',
          )
        : invalidSchemaKeywordValue(
            'items',
            itemsMember.value,
            expectedItems,
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
  const directItemComposition = inspectCompositionFoundation(
    itemsMember.value,
    {
      useSite: 'item-root',
      dataPath,
      documentPath: itemsPath,
      templatePath: [],
      inspectBranches: false,
    },
  );
  const directItemBlocked = directItemComposition.kind === 'input-failure';
  if (directItemBlocked) {
    diagnostics.push(...directItemComposition.diagnostics);
  }
  const resolvedItems: ResolvedUseSiteResult = directItemBlocked
    ? {
        kind: 'blocked',
        referenceChain,
        activatedTargets: [],
      }
    : resolveUseSiteSchema(
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
          referenceContext,
          resolvedItems.referenceChain,
        );
  const itemCompositionBlocked =
    itemSchema !== undefined &&
    Object.getOwnPropertyDescriptor(itemSchema, 'allOf') !== undefined &&
    (item === undefined || item.compositionBlocked === true);
  const dependentPolicyBlocked =
    suppressDependentPolicyDiagnostics || itemCompositionBlocked;
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
      item.propertySources,
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
      !dependentPolicyBlocked &&
      (item === undefined ||
        !Object.hasOwn(item.properties, policy.itemIdentityProperty))
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
    } else if (
      !dependentPolicyBlocked &&
      item !== undefined &&
      !item.requiredNames.has(policy.itemIdentityProperty)
    ) {
      diagnostics.push(
        semanticCollectionPolicyDiagnostic(
          policy,
          dataPath,
          'identity-property-not-required',
          'required item property',
          resolvedItems.referenceChain,
        ),
      );
    } else if (!dependentPolicyBlocked && !identitySchemaCompatible) {
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

function hasSafeStringEnumArrayMarker(
  schema: Record<string, unknown>,
): boolean {
  const descriptor = Object.getOwnPropertyDescriptor(schema, 'uniqueItems');
  return (
    descriptor !== undefined &&
    descriptor.enumerable === true &&
    'value' in descriptor &&
    descriptor.value === true
  );
}

function inspectUnclassifiedStringEnumArrayCommon(
  schema: Record<string, unknown>,
  dataPath: readonly string[],
  documentPath: readonly (string | number)[],
  diagnostics: Diagnostic[],
): void {
  for (const keyword of Object.keys(schema)) {
    if (
      keyword === 'type' ||
      keyword === 'items' ||
      keyword === 'uniqueItems' ||
      keyword === 'default'
    ) {
      continue;
    }
    const keywordPath = [...documentPath, keyword];
    if (keyword === 'title' || keyword === 'description') {
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
      }
    } else if (KNOWN_IGNORABLE_KEYWORDS.has(keyword)) {
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
      !KNOWN_DRAFT_2020_12_KEYWORDS.has(keyword) &&
      !COMPILER_SUPPORTED_KEYWORDS.has(keyword)
    ) {
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
  }
}

function inspectStringEnumArrayCandidate(
  name: string,
  schema: Record<string, unknown>,
  itemSchema: Record<string, unknown>,
  required: boolean,
  dataPath: readonly string[],
  documentPath: readonly (string | number)[],
  diagnostics: Diagnostic[],
): FieldCandidate {
  let schemaTitle: string | undefined;
  let schemaDescription: string | undefined;

  for (const keyword of Object.keys(schema)) {
    const keywordPath = [...documentPath, keyword];
    if (
      keyword === 'type' ||
      keyword === 'items' ||
      keyword === 'uniqueItems' ||
      keyword === 'default'
    ) {
      continue;
    }
    if (keyword === 'title' || keyword === 'description') {
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
          dataPath,
        ),
      );
    } else if (keyword === 'const') {
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
    } else if (
      keyword === 'properties' ||
      keyword === 'required' ||
      keyword === 'enum' ||
      keyword === 'allOf' ||
      STRING_FIELD_KEYWORDS.has(keyword) ||
      NUMBER_FIELD_KEYWORDS.has(keyword) ||
      BOOLEAN_FIELD_KEYWORDS.has(keyword)
    ) {
      diagnostics.push(
        diagnostic({
          code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
          severity: 'error',
          source: 'schema',
          dataPath,
          documentPath: keywordPath,
          parameters: { keyword, fieldType: 'string-enum-array' },
          fallbackMessage: `Schema keyword "${keyword}" is incompatible with field type "string-enum-array".`,
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
  }

  const uniquePath = [...documentPath, 'uniqueItems'];
  const uniqueDescriptor = Object.getOwnPropertyDescriptor(
    schema,
    'uniqueItems',
  );
  if (
    uniqueDescriptor === undefined ||
    !uniqueDescriptor.enumerable ||
    !('value' in uniqueDescriptor) ||
    uniqueDescriptor.value !== true
  ) {
    const actualDescriptorType:
      'missing' | 'non-enumerable' | 'accessor' | undefined =
      uniqueDescriptor === undefined
        ? 'missing'
        : !uniqueDescriptor.enumerable
          ? 'non-enumerable'
          : !('value' in uniqueDescriptor)
            ? 'accessor'
            : undefined;
    const invalidDataValue: unknown =
      actualDescriptorType === undefined &&
      uniqueDescriptor !== undefined &&
      'value' in uniqueDescriptor
        ? uniqueDescriptor.value
        : undefined;
    diagnostics.push(
      diagnostic({
        code: 'INVALID_SCHEMA_KEYWORD_VALUE',
        severity: 'error',
        source: 'schema',
        dataPath,
        documentPath: uniquePath,
        parameters: {
          keyword: 'uniqueItems',
          expected: 'true',
          ...(actualDescriptorType === undefined
            ? {
                actualType: actualType(invalidDataValue),
                ...(invalidDataValue === false ? { actualValue: false } : {}),
              }
            : { actualType: actualDescriptorType }),
        },
        fallbackMessage: 'Schema keyword "uniqueItems" has an invalid value.',
      }),
    );
  }

  for (const keyword of Object.keys(itemSchema)) {
    if (keyword === 'type' || keyword === 'enum') continue;
    const keywordPath = [...documentPath, 'items', keyword];
    if (KNOWN_IGNORABLE_KEYWORDS.has(keyword) && keyword !== 'format') {
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
    } else if (KNOWN_DRAFT_2020_12_KEYWORDS.has(keyword)) {
      diagnostics.push(
        diagnostic({
          code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
          severity: 'error',
          source: 'schema',
          dataPath,
          documentPath: keywordPath,
          parameters: { keyword, fieldType: 'string-enum-array-item' },
          fallbackMessage: `Schema keyword "${keyword}" is incompatible with field type "string-enum-array-item".`,
        }),
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
  }

  const stringEnum = inspectRequiredStringEnum(
    itemSchema,
    diagnostics,
    dataPath,
    [...documentPath, 'items'],
  );

  return {
    name,
    type: 'string-enum-array',
    nullable: false,
    required,
    ...(schemaTitle === undefined ? {} : { schemaTitle }),
    ...(schemaDescription === undefined ? {} : { schemaDescription }),
    stringConstraints: {},
    numberConstraints: {},
    stringEnum,
    fixedValue: { kind: 'absent' },
    dataPath,
    documentPath,
  };
}

function inspectRequiredStringEnum(
  itemSchema: Record<string, unknown>,
  diagnostics: Diagnostic[],
  dataPath: readonly string[],
  itemPath: readonly (string | number)[],
): StringEnumState {
  const descriptor = Object.getOwnPropertyDescriptor(itemSchema, 'enum');
  if (descriptor === undefined) {
    diagnostics.push(
      invalidSchemaKeywordDescriptor(
        'enum',
        'non-empty array of unique strings',
        [...itemPath, 'enum'],
        dataPath,
        'missing',
      ),
    );
    return { kind: 'schema-blocked' };
  }
  return inspectStringEnum(itemSchema, diagnostics, dataPath, itemPath);
}

function inspectItemRoot(
  name: string,
  schema: Record<string, unknown>,
  dataPath: readonly string[],
  documentPath: readonly (string | number)[],
  diagnostics: Diagnostic[],
  referenceContext: ReferenceContext,
  referenceChain: ReferenceChain,
):
  | {
      readonly properties: Record<string, unknown>;
      readonly requiredNames: ReadonlySet<string>;
      readonly propertySources?: ReadonlyMap<string, CompositionPropertySource>;
      readonly compositionBlocked?: boolean;
    }
  | undefined {
  const composition = inspectCompositionFoundation(schema, {
    useSite: 'item-root',
    dataPath,
    documentPath,
    templatePath: [],
    inspectBranches: false,
  });
  if (composition.kind === 'input-failure') {
    diagnostics.push(...composition.diagnostics);
    return undefined;
  }
  if (composition.kind === 'wrapper') {
    diagnostics.push(...composition.diagnostics);
    const reduced = reduceObjectComposition(
      schema,
      composition,
      'item-root',
      documentPath,
      dataPath,
      [],
      diagnostics,
      referenceContext,
      referenceChain,
    );
    if (reduced === undefined) return undefined;
    return {
      properties: reduced.properties,
      requiredNames: reduced.requiredNames,
      propertySources: reduced.propertySources,
      compositionBlocked:
        reduced.catalogBlocked ||
        [...reduced.propertySources.values()].some(
          ({ conflicted }) => conflicted === true,
        ),
    };
  }

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
      keyword !== 'const' &&
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
  rootPropertySources?: ReadonlyMap<string, CompositionPropertySource>,
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
    const source = rootPropertySources?.get(name);
    stack.push({
      kind: 'node',
      name,
      schemaValue:
        member.present && !member.accessor ? member.value : ACCESSOR_VALUE,
      required: requiredNames.has(name),
      templatePath: [name],
      documentPath: source?.documentPath ?? [
        ...itemDocumentPath,
        'properties',
        name,
      ],
      output,
      referenceChain: source?.referenceChain ?? inheritedReferenceChain,
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
    const rawType = !typeMember.present
      ? ACCESSOR_VALUE
      : typeMember.accessor
        ? ACCESSOR_VALUE
        : typeMember.value;
    if (
      frame.templatePath.length === 1 &&
      frame.name === identityProperty &&
      Object.getOwnPropertyDescriptor(schema, 'allOf') !== undefined
    ) {
      diagnostics.push(
        incompatibleAllOfDiagnostic(
          'string',
          [...resolvedDocumentPath, 'allOf'],
          arrayPath,
          frame.templatePath,
        ),
      );
      addReferenceChainToRange(diagnostics, start, resolved.referenceChain);
      releaseReferenceTargets(referenceContext, resolved.activatedTargets);
      continue;
    }
    const composition = inspectCompositionFoundation(schema, {
      useSite: 'property',
      dataPath: arrayPath,
      documentPath: resolvedDocumentPath,
      templatePath: frame.templatePath,
      inspectBranches: false,
    });
    if (composition.kind === 'input-failure') {
      diagnostics.push(...composition.diagnostics);
      addReferenceChainToRange(diagnostics, start, resolved.referenceChain);
      releaseReferenceTargets(referenceContext, resolved.activatedTargets);
      continue;
    }
    if (
      composition.kind === 'wrapper' &&
      acceptedNonObjectCompositionType(rawType) === undefined
    ) {
      diagnostics.push(...composition.diagnostics);
      const reduced = reduceObjectComposition(
        schema,
        composition,
        'property',
        resolvedDocumentPath,
        arrayPath,
        frame.templatePath,
        diagnostics,
        referenceContext,
        resolved.referenceChain,
      );
      if (reduced !== undefined) {
        const firstPath = active.get(schema);
        if (firstPath !== undefined && resolved.activatedTargets.length === 0) {
          diagnostics.push(
            withTemplatePath(
              diagnostic({
                code: 'CYCLIC_SCHEMA_OBJECT',
                severity: 'error',
                source: 'schema',
                dataPath: arrayPath,
                documentPath: resolvedDocumentPath,
                parameters: { firstDocumentPath: [...firstPath] },
                fallbackMessage: 'Schema object cycle detected.',
              }),
              frame.templatePath,
            ),
          );
          addReferenceChainToRange(diagnostics, start, resolved.referenceChain);
          releaseReferenceTargets(referenceContext, resolved.activatedTargets);
          continue;
        }
        const candidate: ObjectCandidate = {
          name: frame.name,
          type: 'object',
          required: frame.required,
          ...(reduced.schemaTitle === undefined
            ? {}
            : { schemaTitle: reduced.schemaTitle }),
          ...(reduced.schemaDescription === undefined
            ? {}
            : { schemaDescription: reduced.schemaDescription }),
          dataPath: arrayPath,
          documentPath: resolvedDocumentPath,
          children: [],
          templatePath: frame.templatePath,
        };
        frame.output.push(candidate);
        active.set(schema, resolvedDocumentPath);
        stack.push({
          kind: 'exit',
          schema,
          ...(firstPath === undefined
            ? {}
            : { previousDocumentPath: firstPath }),
          diagnosticStart: start,
          referenceChain: resolved.referenceChain,
          activatedTargets: resolved.activatedTargets,
        });
        const childNames = Object.keys(reduced.properties);
        for (let index = childNames.length - 1; index >= 0; index -= 1) {
          const childName = childNames[index] as string;
          const member = ownDataValue(reduced.properties, childName);
          const source = reduced.propertySources.get(childName);
          stack.push({
            kind: 'node',
            name: childName,
            schemaValue:
              member.present && !member.accessor
                ? member.value
                : ACCESSOR_VALUE,
            required: reduced.requiredNames.has(childName),
            templatePath: [...frame.templatePath, childName],
            documentPath: source?.documentPath ?? [
              ...resolvedDocumentPath,
              'properties',
              childName,
            ],
            output: candidate.children,
            referenceChain: source?.referenceChain ?? resolved.referenceChain,
          });
        }
        continue;
      }
      addReferenceChainToRange(diagnostics, start, resolved.referenceChain);
      releaseReferenceTargets(referenceContext, resolved.activatedTargets);
      continue;
    }
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
    if (keyword === 'allOf') {
      compatible = false;
      diagnostics.push(
        incompatibleAllOfDiagnostic(
          'string',
          keywordPath,
          dataPath,
          templatePath,
        ),
      );
      continue;
    }
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
      keyword !== 'const' &&
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
        keyword !== 'const' &&
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
  let fixedValue: FixedValueState = { kind: 'absent' };
  let stringFormat: StringSemanticFormat | undefined;
  const supportedKeywords = fieldKeywords(type);

  for (const keyword of Object.keys(field)) {
    const documentPath = [...fieldPath, keyword] as const;

    if (keyword === 'allOf') {
      diagnostics.push(
        incompatibleAllOfDiagnostic(type, documentPath, dataPath),
      );
      continue;
    }
    if (keyword === 'oneOf') {
      diagnostics.push(
        diagnostic({
          code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
          severity: 'error',
          source: 'schema',
          dataPath,
          documentPath,
          parameters: { keyword, fieldType: type },
          fallbackMessage: `Schema keyword "oneOf" is incompatible with field type "${type}".`,
        }),
      );
      continue;
    }

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

    if (keyword === 'const') {
      fixedValue = inspectFixedValue(
        field,
        type,
        nullable,
        diagnostics,
        dataPath,
        fieldPath,
      );
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
    } else if (keyword === 'format') {
      if (typeof value !== 'string') {
        diagnostics.push(
          invalidSchemaKeywordValue(
            keyword,
            value,
            'string format name',
            documentPath,
            dataPath,
          ),
        );
      } else if (isStringSemanticFormat(value)) {
        stringFormat = value;
      } else {
        diagnostics.push(
          diagnostic({
            code: 'IGNORED_SCHEMA_FORMAT',
            severity: 'warning',
            source: 'schema',
            dataPath,
            documentPath,
            parameters: { format: value },
            fallbackMessage: `String format "${value}" is not supported and is ignored by the compiler.`,
          }),
        );
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

  if (
    type === 'string' &&
    fixedValue.kind === 'valid' &&
    typeof fixedValue.value === 'string' &&
    stringEnum.kind === 'valid' &&
    !stringEnum.values.includes(fixedValue.value)
  ) {
    diagnostics.push(
      diagnostic({
        code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
        severity: 'error',
        source: 'schema',
        dataPath,
        documentPath: [...fieldPath, 'const'],
        parameters: {
          keyword: 'const',
          fieldType: 'string',
          reason: 'value-not-in-enum',
        },
        fallbackMessage:
          'Schema keyword "const" is incompatible with field type "string".',
      }),
    );
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
    fixedValue,
    ...(stringFormat === undefined ? {} : { stringFormat }),
    dataPath,
    documentPath: fieldPath,
  };
}

function inspectFixedValue(
  field: Record<string, unknown>,
  type: FieldType,
  nullable: boolean,
  diagnostics: Diagnostic[],
  dataPath: readonly string[],
  fieldPath: readonly (string | number)[],
): FixedValueState {
  const documentPath = [...fieldPath, 'const'] as const;
  const descriptor = Object.getOwnPropertyDescriptor(field, 'const');
  const expected = expectedFixedValue(type, nullable);
  if (descriptor === undefined || !('value' in descriptor)) {
    diagnostics.push(
      invalidSchemaKeywordDescriptor(
        'const',
        expected,
        documentPath,
        dataPath,
        descriptor === undefined ? 'missing' : 'accessor',
      ),
    );
    return { kind: 'schema-blocked' };
  }
  const value: unknown = descriptor.value;
  if (!isCompatibleFixedValue(value, type, nullable)) {
    diagnostics.push(
      invalidSchemaKeywordValue(
        'const',
        value,
        expected,
        documentPath,
        dataPath,
      ),
    );
    return { kind: 'schema-blocked' };
  }
  return { kind: 'valid', value };
}

function expectedFixedValue(type: FieldType, nullable: boolean): string {
  if (nullable) return 'compatible primitive value or null';
  if (type === 'string') return 'string';
  if (type === 'number') return 'finite number';
  if (type === 'integer') return 'finite integer';
  return 'boolean';
}

function isCompatibleFixedValue(
  value: unknown,
  type: FieldType,
  nullable: boolean,
): value is PrimitiveFixedValue {
  if (nullable && value === null) return true;
  if (type === 'string') return typeof value === 'string';
  if (type === 'boolean') return typeof value === 'boolean';
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    (type !== 'integer' || Number.isInteger(value))
  );
}

function expectedSchemaKeywordValue(keyword: string): string {
  if (keyword === 'title' || keyword === 'description') return 'string';
  if (keyword === 'minLength' || keyword === 'maxLength')
    return 'non-negative integer';
  if (keyword === 'pattern') return 'valid Unicode regular expression string';
  if (keyword === 'format') return 'string format name';
  if (keyword === 'multipleOf') return 'finite number greater than zero';
  return 'finite number';
}

function isStringSemanticFormat(value: string): value is StringSemanticFormat {
  return value === 'email' || value === 'date' || value === 'date-time';
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

  const wizardInspection = inspectRootWizard(
    rawUiSchema,
    propertyNames ?? [],
    diagnostics,
  );
  if (wizardInspection.handled) {
    if (wizardInspection.wizard !== undefined)
      result.wizard = wizardInspection.wizard;
  } else {
    const presentation = inspectRootPresentation(
      rawUiSchema,
      propertyNames ?? [],
      diagnostics,
    );
    if (presentation !== undefined) result.presentation = presentation;
  }
  return result;
}

interface PresentationInspectionOptions {
  readonly presentation?: OwnValue;
  readonly presentationPath?: readonly (string | number)[];
  readonly firstNodes?: Map<string, readonly (string | number)[]>;
  readonly firstContainers?: Map<string, readonly (string | number)[]>;
  readonly active?: Map<object, readonly (string | number)[]>;
  readonly requireComplete?: boolean;
  readonly inspectOrderConflict?: boolean;
}

function inspectRootWizard(
  ui: Record<string, unknown>,
  nodeNames: readonly string[],
  diagnostics: Diagnostic[],
): { readonly handled: boolean; readonly wizard?: ParsedWizard } {
  const presentation = ownDataValue(ui, 'presentation');
  if (
    !presentation.present ||
    presentation.accessor ||
    !Array.isArray(presentation.value)
  ) {
    return { handled: false };
  }

  const entries = presentation.value;
  let wizardIndex: number | undefined;
  for (let index = 0; index < entries.length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(entries, String(index));
    if (descriptor === undefined || !('value' in descriptor)) continue;
    const value: unknown = descriptor.value;
    if (!isOrdinaryRecord(value)) continue;
    const kind = presentationMember(value, 'kind');
    if (
      (kind.kind === 'value' && kind.value === 'wizard') ||
      presentationMember(value, 'steps').kind !== 'missing'
    ) {
      wizardIndex = index;
      break;
    }
  }
  if (wizardIndex === undefined) return { handled: false };

  const rootPath = ['presentation'] as const;
  if (entries.length !== 1 || wizardIndex !== 0) {
    diagnostics.push(
      invalidUiPresentation('wizard-not-sole-root', rootPath, {
        ownerKind: 'wizard',
        index: wizardIndex,
      }),
    );
    return { handled: true };
  }
  if (ownDataValue(ui, 'order').present) {
    diagnostics.push(
      invalidUiPresentation('invalid-wizard-exterior', rootPath, {
        ownerKind: 'wizard',
        member: 'order',
      }),
    );
    return { handled: true };
  }

  const wizardDescriptor = Object.getOwnPropertyDescriptor(entries, '0');
  const wizardValue: unknown =
    wizardDescriptor !== undefined && 'value' in wizardDescriptor
      ? wizardDescriptor.value
      : undefined;
  const wizardPath = ['presentation', 0] as const;
  if (!isOrdinaryRecord(wizardValue)) {
    diagnostics.push(
      invalidUiPresentation('invalid-wizard-exterior', wizardPath, {
        ownerKind: 'wizard',
        index: 0,
      }),
    );
    return { handled: true };
  }

  let invalid = false;
  const kind = presentationMember(wizardValue, 'kind');
  const id = presentationMember(wizardValue, 'id');
  const label = presentationMember(wizardValue, 'label');
  const steps = presentationMember(wizardValue, 'steps');
  const wizardId = memberNonEmptyString(id);
  const wizardLabel = memberNonBlankString(label);
  if (kind.kind !== 'value' || kind.value !== 'wizard') {
    invalid = true;
    diagnostics.push(
      invalidUiPresentation('invalid-wizard-kind', [...wizardPath, 'kind'], {
        ownerKind: 'wizard',
        member: 'kind',
      }),
    );
  }
  if (wizardId === undefined) {
    invalid = true;
    diagnostics.push(
      invalidUiPresentation('invalid-wizard-id', [...wizardPath, 'id'], {
        ownerKind: 'wizard',
        member: 'id',
      }),
    );
  }
  if (wizardLabel === undefined) {
    invalid = true;
    diagnostics.push(
      invalidUiPresentation('invalid-wizard-label', [...wizardPath, 'label'], {
        ownerKind: 'wizard',
        member: 'label',
        ...(wizardId === undefined ? {} : { wizardId }),
      }),
    );
  }
  if (
    steps.kind !== 'value' ||
    !Array.isArray(steps.value) ||
    steps.value.length < 2
  ) {
    invalid = true;
    diagnostics.push(
      invalidUiPresentation('invalid-wizard-steps', [...wizardPath, 'steps'], {
        ownerKind: 'wizard',
        member: 'steps',
        ...(wizardId === undefined ? {} : { wizardId }),
      }),
    );
  }
  for (const key of Object.keys(wizardValue)) {
    if (!['kind', 'id', 'label', 'steps'].includes(key)) {
      invalid = true;
      diagnostics.push(
        invalidUiPresentation('invalid-wizard-exterior', [...wizardPath, key], {
          ownerKind: 'wizard',
          member: key,
          ...(wizardId === undefined ? {} : { wizardId }),
        }),
      );
    }
  }
  if (steps.kind !== 'value' || !Array.isArray(steps.value))
    return { handled: true };

  const parsedSteps: ParsedWizardStep[] = [];
  const firstStepIds = new Map<string, number>();
  const firstNodes = new Map<string, readonly (string | number)[]>();
  const firstContainers = new Map<string, readonly (string | number)[]>();
  const active = new Map<object, readonly (string | number)[]>([
    [wizardValue, wizardPath],
  ]);
  for (let stepIndex = 0; stepIndex < steps.value.length; stepIndex += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(
      steps.value,
      String(stepIndex),
    );
    const stepValue: unknown =
      descriptor !== undefined && 'value' in descriptor
        ? descriptor.value
        : undefined;
    const stepPath = [...wizardPath, 'steps', stepIndex] as const;
    if (!isOrdinaryRecord(stepValue)) {
      invalid = true;
      diagnostics.push(
        invalidUiPresentation('invalid-wizard-step-exterior', stepPath, {
          ownerKind: 'wizard-step',
          stepIndex,
          ...(wizardId === undefined ? {} : { wizardId }),
        }),
      );
      continue;
    }
    const stepKind = presentationMember(stepValue, 'kind');
    const stepIdMember = presentationMember(stepValue, 'id');
    const stepLabelMember = presentationMember(stepValue, 'label');
    const children = presentationMember(stepValue, 'children');
    const stepId = memberNonEmptyString(stepIdMember);
    const stepLabel = memberNonBlankString(stepLabelMember);
    if (stepKind.kind !== 'value' || stepKind.value !== 'wizard-step') {
      invalid = true;
      diagnostics.push(
        invalidUiPresentation(
          'invalid-wizard-step-kind',
          [...stepPath, 'kind'],
          {
            ownerKind: 'wizard-step',
            stepIndex,
            ...(wizardId === undefined ? {} : { wizardId }),
          },
        ),
      );
    }
    if (stepId === undefined) {
      invalid = true;
      diagnostics.push(
        invalidUiPresentation('invalid-wizard-step-id', [...stepPath, 'id'], {
          ownerKind: 'wizard-step',
          stepIndex,
          ...(wizardId === undefined ? {} : { wizardId }),
        }),
      );
    } else {
      const firstIndex = firstStepIds.get(stepId);
      if (firstIndex !== undefined) {
        invalid = true;
        diagnostics.push(
          invalidUiPresentation(
            'duplicate-wizard-step-id',
            [...stepPath, 'id'],
            {
              ownerKind: 'wizard-step',
              stepIndex,
              stepId,
              index: firstIndex,
              ...(wizardId === undefined ? {} : { wizardId }),
            },
          ),
        );
      } else firstStepIds.set(stepId, stepIndex);
    }
    if (stepLabel === undefined) {
      invalid = true;
      diagnostics.push(
        invalidUiPresentation(
          'invalid-wizard-step-label',
          [...stepPath, 'label'],
          {
            ownerKind: 'wizard-step',
            stepIndex,
            ...(stepId === undefined ? {} : { stepId }),
            ...(wizardId === undefined ? {} : { wizardId }),
          },
        ),
      );
    }
    if (
      children.kind !== 'value' ||
      !Array.isArray(children.value) ||
      children.value.length === 0
    ) {
      invalid = true;
      diagnostics.push(
        invalidUiPresentation(
          'invalid-wizard-step-children',
          [...stepPath, 'children'],
          {
            ownerKind: 'wizard-step',
            stepIndex,
            ...(stepId === undefined ? {} : { stepId }),
            ...(wizardId === undefined ? {} : { wizardId }),
          },
        ),
      );
    }
    for (const key of Object.keys(stepValue)) {
      if (!['kind', 'id', 'label', 'children'].includes(key)) {
        invalid = true;
        diagnostics.push(
          invalidUiPresentation(
            'invalid-wizard-step-exterior',
            [...stepPath, key],
            {
              ownerKind: 'wizard-step',
              member: key,
              stepIndex,
              ...(stepId === undefined ? {} : { stepId }),
              ...(wizardId === undefined ? {} : { wizardId }),
            },
          ),
        );
      }
    }
    if (
      stepId === undefined ||
      stepLabel === undefined ||
      children.kind !== 'value' ||
      !Array.isArray(children.value) ||
      children.value.length === 0
    ) {
      continue;
    }
    active.set(stepValue, stepPath);
    const parsedChildren = inspectRootPresentation(
      ui,
      nodeNames,
      diagnostics,
      [],
      undefined,
      undefined,
      {
        presentation: {
          present: true,
          accessor: false,
          value: children.value,
        },
        presentationPath: [...stepPath, 'children'],
        firstNodes,
        firstContainers,
        active,
        requireComplete: false,
        inspectOrderConflict: false,
      },
    );
    active.delete(stepValue);
    if (parsedChildren === undefined) {
      invalid = true;
      continue;
    }
    parsedSteps.push({
      id: stepId,
      label: stepLabel,
      children: parsedChildren,
      nodeNames: collectParsedPresentationNodeNames(parsedChildren),
    });
  }
  for (const nodeName of presentationNodeOrder(ui, nodeNames)) {
    if (!firstNodes.has(nodeName)) {
      invalid = true;
      diagnostics.push(
        invalidUiPresentation('invalid-wizard-membership', rootPath, {
          ownerKind: 'wizard',
          member: 'steps',
          nodeName,
          ...(wizardId === undefined ? {} : { wizardId }),
        }),
      );
    }
  }
  if (
    invalid ||
    wizardId === undefined ||
    wizardLabel === undefined ||
    parsedSteps.length !== steps.value.length
  ) {
    return { handled: true };
  }
  return {
    handled: true,
    wizard: {
      id: wizardId,
      label: wizardLabel,
      steps: parsedSteps,
    },
  };
}

function collectParsedPresentationNodeNames(
  entries: readonly ParsedPresentationEntry[],
): readonly string[] {
  const names: string[] = [];
  const stack = [...entries].reverse();
  while (stack.length > 0) {
    const entry = stack.pop();
    if (entry === undefined) continue;
    if (entry.kind === 'form-node') {
      names.push(entry.name);
    } else if (entry.kind === 'section') {
      stack.push(...[...entry.children].reverse());
    } else if (entry.kind === 'tabs' || entry.kind === 'accordion') {
      for (let index = entry.panels.length - 1; index >= 0; index -= 1) {
        const panel = entry.panels[index];
        if (panel !== undefined) stack.push(...[...panel.children].reverse());
      }
    } else {
      for (let index = entry.items.length - 1; index >= 0; index -= 1) {
        const child = entry.items[index]?.child[0];
        if (child !== undefined) stack.push(child);
      }
    }
  }
  return names;
}

function inspectRootPresentation(
  ui: Record<string, unknown>,
  nodeNames: readonly string[],
  diagnostics: Diagnostic[],
  rootDocumentPath: readonly (string | number)[] = [],
  dataPath?: readonly string[],
  templatePath?: readonly string[],
  options: PresentationInspectionOptions = {},
): readonly ParsedPresentationEntry[] | undefined {
  const presentation = options.presentation ?? ownDataValue(ui, 'presentation');
  if (!presentation.present) return undefined;
  const diagnosticsStart = diagnostics.length;
  const presentationPath = options.presentationPath ?? [
    ...rootDocumentPath,
    'presentation',
  ];
  const finish = (
    value: readonly ParsedPresentationEntry[] | undefined,
  ): readonly ParsedPresentationEntry[] | undefined => {
    if (dataPath === undefined) return value;
    for (let index = diagnosticsStart; index < diagnostics.length; index += 1) {
      const current = diagnostics[index];
      if (current === undefined || current.code !== 'INVALID_UI_PRESENTATION')
        continue;
      diagnostics[index] = {
        ...current,
        dataPath: [...dataPath],
        parameters:
          templatePath === undefined
            ? current.parameters
            : { ...current.parameters, templatePath: [...templatePath] },
      };
    }
    return value;
  };

  let invalid = false;
  if (
    options.inspectOrderConflict !== false &&
    ownDataValue(ui, 'order').present
  ) {
    invalid = true;
    diagnostics.push(
      invalidUiPresentation('order-conflict', presentationPath, {
        member: 'order',
        expected: 'one root ordering authority',
      }),
    );
  }
  if (presentation.accessor) {
    diagnostics.push(
      invalidUiPresentation('presentation-accessor', presentationPath, {
        expected: 'dense array',
      }),
    );
    return finish(undefined);
  }
  if (!Array.isArray(presentation.value)) {
    diagnostics.push(
      invalidUiPresentation('presentation-not-array', presentationPath, {
        expected: 'dense array',
        actualType: actualType(presentation.value),
      }),
    );
    return finish(undefined);
  }

  const known = new Set(nodeNames);
  const normalizedNodeNames = presentationNodeOrder(ui, nodeNames);
  const firstNodes =
    options.firstNodes ?? new Map<string, readonly (string | number)[]>();
  const firstContainers =
    options.firstContainers ?? new Map<string, readonly (string | number)[]>();
  const active =
    options.active ?? new Map<object, readonly (string | number)[]>();
  const result: ParsedPresentationEntry[] = [];
  const stack: PresentationInspectionFrame[] = [];
  pushPresentationEntries(presentation.value, presentationPath, result, stack);

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

  if (options.requireComplete !== false) {
    for (const name of normalizedNodeNames) {
      if (!firstNodes.has(name)) {
        invalid = true;
        diagnostics.push(
          invalidUiPresentation('missing-node', presentationPath, {
            node: name,
          }),
        );
      }
    }
  }
  return finish(invalid ? undefined : result);
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
    const activeKind = presentationMember(frame.value, 'kind');
    const wizardCycle =
      activeKind.kind === 'value' &&
      (activeKind.value === 'wizard' || activeKind.value === 'wizard-step');
    diagnostics.push(
      invalidUiPresentation(
        wizardCycle ? 'wizard-cycle' : 'cyclic-presentation',
        frame.path,
        {
          ...(wizardCycle
            ? {
                ownerKind:
                  activeKind.value === 'wizard' ? 'wizard' : 'wizard-step',
              }
            : {}),
          firstDocumentPath: [...firstActivePath],
        },
      ),
    );
    return true;
  }

  const kind = presentationMember(frame.value, 'kind');
  if (
    kind.kind === 'value' &&
    typeof kind.value === 'string' &&
    !['section', 'tabs', 'accordion', 'grid'].includes(kind.value)
  ) {
    const wizardMembership =
      kind.value === 'wizard' || kind.value === 'wizard-step';
    diagnostics.push(
      invalidUiPresentation(
        wizardMembership
          ? 'invalid-wizard-membership'
          : 'unsupported-entry-kind',
        [...frame.path, 'kind'],
        wizardMembership
          ? {
              ownerKind: kind.value === 'wizard' ? 'wizard' : 'wizard-step',
              member: 'kind',
              index: frame.index,
            }
          : {
              expected: 'section, tabs, accordion or grid',
              actualType: 'string',
            },
      ),
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
  const known = new Set([...knownKeys, 'visibleWhen', 'enabledWhen']);
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
    if (knownFields?.has(name)) {
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
    visibleWhenCapture?: CapturedConditionMember;
    enabledWhenCapture?: CapturedConditionMember;
  } = {};

  const visibleWhenCapture = captureConditionMember(value, 'visibleWhen', [
    'fields',
    name,
    'visibleWhen',
  ]);
  if (visibleWhenCapture !== undefined)
    parsed.visibleWhenCapture = visibleWhenCapture;
  const enabledWhenCapture = captureConditionMember(value, 'enabledWhen', [
    'fields',
    name,
    'enabledWhen',
  ]);
  if (enabledWhenCapture !== undefined)
    parsed.enabledWhenCapture = enabledWhenCapture;

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
    if (key === 'visibleWhen' || key === 'enabledWhen') continue;

    const rawValue = value[key];
    const fieldType = candidate?.type;

    if (UI_TEXT_KEYS.has(key)) {
      if (typeof rawValue !== 'string') {
        diagnostics.push(
          invalidUiValue(key, rawValue, 'string', documentPath, [name]),
        );
      } else if (key === 'placeholder') {
        if (fieldType === 'boolean' || fieldType === 'string-enum-array') {
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
  fieldType: CandidateFieldType | undefined,
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
  rootKnownNames?: readonly string[],
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
        readonly target: ParsedUiSchema | ParsedObjectUi;
        readonly dataPath: readonly string[];
        readonly documentPath: readonly (string | number)[];
        readonly knownNames?: readonly string[];
        readonly dynamicChildren?: boolean;
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
      target: result,
      dataPath: [],
      documentPath: rootDocumentPath,
      ...(rootKnownNames === undefined ? {} : { knownNames: rootKnownNames }),
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
      if (isObjectCandidate(candidate)) {
        const objectUi = parsed as ParsedObjectUi;
        stack.push({
          kind: 'container',
          ui: rawNode,
          candidates: candidate.children,
          order: objectUi.order as string[],
          fields: objectUi.fields as Map<string, ParsedNodeUi>,
          target: objectUi,
          dataPath: nodePath,
          documentPath: uiPath,
          ...(candidate.type === 'discriminated-object'
            ? { dynamicChildren: true }
            : {}),
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
    const knownNames = new Set(frame.knownNames ?? byName.keys());
    const fieldsPath = [...frame.documentPath, 'fields'];
    let rawFields: Record<string, unknown> | undefined;
    if (frame.ui !== undefined) {
      if (frame.dataPath.length === 0) {
        for (const key of Object.keys(frame.ui)) {
          if (key !== 'order' && key !== 'fields' && key !== 'presentation') {
            if (
              templateArrayPath !== undefined &&
              (key === 'visibleWhen' || key === 'enabledWhen')
            ) {
              continue;
            }
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
      const rootWizardInspection =
        frame.dataPath.length === 0 && templateArrayPath === undefined
          ? inspectRootWizard(
              frame.ui,
              frame.candidates.map(({ name }) => name),
              diagnostics,
            )
          : { handled: false as const };
      if (
        rootWizardInspection.handled &&
        rootWizardInspection.wizard !== undefined
      ) {
        (frame.target as ParsedUiSchema).wizard = rootWizardInspection.wizard;
      }
      const presentation = rootWizardInspection.handled
        ? undefined
        : inspectRootPresentation(
            frame.ui,
            frame.candidates.map(({ name }) => name),
            diagnostics,
            frame.documentPath,
            templateArrayPath === undefined
              ? frame.dataPath.length === 0
                ? undefined
                : frame.dataPath
              : templateArrayPath,
            templateArrayPath === undefined ? undefined : frame.dataPath,
          );
      if (presentation !== undefined) {
        if (frame.dynamicChildren === true) {
          diagnostics.push(
            diagnostic({
              code: 'INCOMPATIBLE_UI_OPTION',
              severity: 'warning',
              source: 'ui-schema',
              dataPath: frame.dataPath,
              documentPath: [...frame.documentPath, 'presentation'],
              parameters: {
                field: frame.dataPath.at(-1) ?? '',
                fieldType: 'discriminated-object',
                option: 'presentation',
                reason: 'dynamic-children',
              },
              fallbackMessage:
                'UI presentation is incompatible with a discriminated object.',
            }),
          );
        } else frame.target.presentation = presentation;
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
          continue;
        }
        if (!byName.has(name)) {
          const rawNode = ownDataValue(rawFields, name);
          if (
            rawNode.present &&
            !rawNode.accessor &&
            isOrdinaryRecord(rawNode.value)
          ) {
            const parsed: {
              visibleWhenCapture?: CapturedConditionMember;
              enabledWhenCapture?: CapturedConditionMember;
            } = {};
            const visibleWhenCapture = captureConditionMember(
              rawNode.value,
              'visibleWhen',
              [...fieldsPath, name, 'visibleWhen'],
            );
            if (visibleWhenCapture !== undefined) {
              parsed.visibleWhenCapture = visibleWhenCapture;
            }
            const enabledWhenCapture = captureConditionMember(
              rawNode.value,
              'enabledWhen',
              [...fieldsPath, name, 'enabledWhen'],
            );
            if (enabledWhenCapture !== undefined) {
              parsed.enabledWhenCapture = enabledWhenCapture;
            }
            if (
              parsed.visibleWhenCapture !== undefined ||
              parsed.enabledWhenCapture !== undefined
            ) {
              frame.fields.set(name, parsed);
            }
          }
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

function captureConditionMember(
  object: object,
  member: ConditionMember,
  documentPath: readonly (string | number)[],
): CapturedConditionMember | undefined {
  const descriptor = Object.getOwnPropertyDescriptor(object, member);
  if (descriptor === undefined || !descriptor.enumerable) return undefined;
  return 'value' in descriptor
    ? { kind: 'value', value: descriptor.value, documentPath }
    : { kind: 'accessor', documentPath };
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
    visibleWhenCapture?: CapturedConditionMember;
    enabledWhenCapture?: CapturedConditionMember;
    order?: string[];
    fields?: Map<string, ParsedNodeUi>;
    item?: ParsedUiSchema;
    presentation?: readonly ParsedPresentationEntry[];
  } = {};
  if (isObjectCandidate(candidate)) {
    parsed.order = [];
    parsed.fields = new Map();
  } else if (candidate.type === 'array') {
    parsed.item = { order: [], fields: new Map() };
  }
  if (value === undefined) {
    return parsed;
  }
  const visibleWhenCapture = captureConditionMember(value, 'visibleWhen', [
    ...documentPath,
    'visibleWhen',
  ]);
  if (visibleWhenCapture !== undefined)
    parsed.visibleWhenCapture = visibleWhenCapture;
  const enabledWhenCapture = captureConditionMember(value, 'enabledWhen', [
    ...documentPath,
    'enabledWhen',
  ]);
  if (enabledWhenCapture !== undefined)
    parsed.enabledWhenCapture = enabledWhenCapture;
  if (
    candidate.type === 'array' &&
    ownDataValue(value, 'presentation').present
  ) {
    diagnostics.push(
      invalidUiPresentation(
        'unsupported-location',
        [...documentPath, 'presentation'],
        {
          member: 'presentation',
          nodeKind: 'array',
        },
        dataPath,
      ),
    );
  }
  const allowed = new Set(
    isObjectCandidate(candidate)
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
          'visibleWhen',
          'enabledWhen',
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
      (isObjectCandidate(candidate) || candidate.type === 'array') &&
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
      isObjectCandidate(candidate) ||
      candidate.type === 'array' ||
      candidate.type === 'boolean' ||
      candidate.type === 'string-enum-array'
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
            reason: isObjectCandidate(candidate) ? 'object-node' : 'leaf-node',
          },
          fallbackMessage: `UI option "item" is incompatible with field "${candidate.name}".`,
        }),
      );
    }
  }
  if (!isObjectCandidate(candidate)) {
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
  if (isObjectCandidate(candidate) || candidate.type === 'array') {
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
          reason: isObjectCandidate(candidate) ? 'object-node' : 'array-node',
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
    } else if (isObjectCandidate(candidate) || candidate.type === 'array') {
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
            reason: isObjectCandidate(candidate) ? 'object-node' : 'array-node',
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

interface ConditionTarget {
  readonly candidate?: NodeCandidate;
  readonly field: string;
  readonly dataPath?: readonly string[];
  readonly templatePath?: readonly string[];
  readonly targetKind?:
    | 'object'
    | 'array'
    | 'item'
    | 'template-object'
    | 'template-field'
    | 'identity'
    | 'presentation'
    | 'discriminated-object';
  readonly member: ConditionMember;
  readonly capture: CapturedConditionMember;
}

function inspectConditionPhase(
  candidates: readonly NodeCandidate[],
  ui: ParsedUiSchema,
  completeOrdinaryFieldIndex: boolean,
  diagnostics: Diagnostic[],
  rawUiSchema?: unknown,
): ReadonlyMap<string, NormalizedFieldConditions> {
  const targets: ConditionTarget[] = [];
  collectConditionTargets(candidates, ui, targets);
  collectUnsupportedConditionTargets(rawUiSchema, candidates, targets);
  const ordinaryFields = new Map<string, FieldCandidate>();
  const ordinaryObjects = new Set<string>();
  const ordinaryArrays = new Set<string>();
  const collectionPaths: string[][] = [];
  indexOrdinaryConditionSources(
    candidates,
    ordinaryFields,
    ordinaryObjects,
    ordinaryArrays,
    collectionPaths,
  );
  const normalized = new Map<string, NormalizedFieldConditions>();

  for (const target of targets) {
    const parsed = inspectConditionShape(target, diagnostics);
    const candidate = target.candidate;
    const targetKind = target.targetKind;
    if (targetKind !== undefined) {
      diagnostics.push(
        conditionDiagnostic(target, 'unsupported-target-location', {
          targetKind,
        }),
      );
      continue;
    }
    if (candidate === undefined) continue;
    if (
      target.member === 'enabledWhen' &&
      !isObjectCandidate(candidate) &&
      candidate.type !== 'array' &&
      candidate.fixedValue.kind === 'valid'
    ) {
      diagnostics.push(
        conditionDiagnostic(target, 'incompatible-target', {
          targetCapability: 'fixed-value',
        }),
      );
      continue;
    }
    if (parsed === undefined || !completeOrdinaryFieldIndex) {
      continue;
    }
    const predicates =
      parsed.kind === 'predicate' ? [parsed] : parsed.conditions;
    const linked: FieldValueConditionDefinition[] = [];
    let semanticValid = true;
    for (let index = 0; index < predicates.length; index += 1) {
      const predicate = predicates[index];
      if (predicate === undefined) continue;
      const memberLocation =
        parsed.kind === 'group' ? { memberIndex: index } : {};
      const sourceKey = JSON.stringify(predicate.sourcePath);
      const source = ordinaryFields.get(sourceKey);
      if (source === undefined) {
        semanticValid = false;
        const sourceReason = ordinaryObjects.has(sourceKey)
          ? 'object'
          : ordinaryArrays.has(sourceKey)
            ? 'array'
            : collectionPaths.some(
                  (path) =>
                    predicate.sourcePath.length > path.length &&
                    path.every(
                      (segment, pathIndex) =>
                        predicate.sourcePath[pathIndex] === segment,
                    ),
                )
              ? 'below-collection'
              : 'unmanaged';
        diagnostics.push(
          conditionDiagnostic(target, 'source-not-ordinary-field', {
            sourcePath: [...predicate.sourcePath],
            sourceReason,
            ...memberLocation,
          }),
        );
        continue;
      }
      const expected = conditionLiteralExpected(source);
      if (!conditionLiteralCompatible(source, predicate.equals)) {
        semanticValid = false;
        diagnostics.push(
          conditionDiagnostic(target, 'literal-incompatible', {
            sourcePath: [...predicate.sourcePath],
            sourceKind: source.type,
            sourceNullable: source.nullable,
            expected,
            actualType: actualType(predicate.equals),
            ...memberLocation,
          }),
        );
        continue;
      }
      linked.push({
        sourcePath: [...predicate.sourcePath],
        equals: predicate.equals,
      });
    }
    if (!semanticValid) continue;
    const normalizedCondition: FieldConditionDefinition =
      parsed.kind === 'predicate'
        ? (linked[0] as FieldValueConditionDefinition)
        : ({
            operator: parsed.operator,
            conditions: linked,
          } satisfies FieldValueConditionGroupDefinition);
    const key = JSON.stringify(candidate.dataPath);
    const previous = normalized.get(key) ?? {};
    normalized.set(key, {
      ...previous,
      [target.member]: normalizedCondition,
    });
  }
  return normalized;
}

function collectConditionTargets(
  candidates: readonly NodeCandidate[],
  ui: ParsedUiSchema | ParsedObjectUi,
  output: ConditionTarget[],
  insideDiscriminatedObject = false,
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
  for (const name of names) {
    const candidate = byName.get(name);
    if (candidate === undefined) continue;
    const parsed = ui.fields.get(name);
    const targetKind = insideDiscriminatedObject
      ? 'discriminated-object'
      : conditionTargetKind(candidate);
    const templatePath =
      'templatePath' in candidate ? candidate.templatePath : undefined;
    if (parsed?.visibleWhenCapture !== undefined) {
      output.push({
        candidate,
        field: candidate.name,
        dataPath: candidate.dataPath,
        ...(templatePath === undefined ? {} : { templatePath }),
        ...(targetKind === undefined ? {} : { targetKind }),
        member: 'visibleWhen',
        capture: parsed.visibleWhenCapture,
      });
    }
    if (parsed?.enabledWhenCapture !== undefined) {
      output.push({
        candidate,
        field: candidate.name,
        dataPath: candidate.dataPath,
        ...(templatePath === undefined ? {} : { templatePath }),
        ...(targetKind === undefined ? {} : { targetKind }),
        member: 'enabledWhen',
        capture: parsed.enabledWhenCapture,
      });
    }
    if (isObjectCandidate(candidate)) {
      collectConditionTargets(
        candidate.children,
        (parsed as ParsedObjectUi | undefined) ?? {
          order: [],
          fields: new Map(),
        },
        output,
        insideDiscriminatedObject || candidate.type === 'discriminated-object',
      );
    } else if (candidate.type === 'array') {
      collectConditionTargets(
        candidate.children,
        (parsed as ParsedArrayUi | undefined)?.item ?? {
          order: [],
          fields: new Map(),
        },
        output,
        insideDiscriminatedObject,
      );
    }
  }
  const candidateNames = new Set(candidates.map(({ name }) => name));
  const unmatchedNames = [
    ...ui.order.filter(
      (name) => ui.fields.has(name) && !candidateNames.has(name),
    ),
    ...[...ui.fields.keys()].filter(
      (name) => !candidateNames.has(name) && !ui.order.includes(name),
    ),
  ];
  for (const name of unmatchedNames) {
    const parsed = ui.fields.get(name);
    if (parsed?.visibleWhenCapture !== undefined) {
      output.push({
        field: name,
        dataPath: [name],
        member: 'visibleWhen',
        capture: parsed.visibleWhenCapture,
      });
    }
    if (parsed?.enabledWhenCapture !== undefined) {
      output.push({
        field: name,
        dataPath: [name],
        member: 'enabledWhen',
        capture: parsed.enabledWhenCapture,
      });
    }
  }
}

function collectUnsupportedConditionTargets(
  rawUiSchema: unknown,
  candidates: readonly NodeCandidate[],
  output: ConditionTarget[],
): void {
  if (!isOrdinaryRecord(rawUiSchema)) return;
  collectUnsupportedContainerConditions(
    rawUiSchema,
    candidates,
    output,
    [],
    [],
  );
}

function collectUnsupportedContainerConditions(
  ui: Record<string, unknown>,
  candidates: readonly NodeCandidate[],
  output: ConditionTarget[],
  documentPath: readonly (string | number)[],
  dataPath: readonly string[],
  template?: {
    readonly arrayPath: readonly string[];
    readonly identityProperty?: string;
  },
): void {
  const presentation = ownDataValue(ui, 'presentation');
  if (presentation.present && !presentation.accessor) {
    collectPresentationConditionTargets(
      presentation.value,
      [...documentPath, 'presentation'],
      output,
      template?.arrayPath ?? (dataPath.length === 0 ? undefined : dataPath),
      template === undefined ? undefined : dataPath,
    );
  }
  const fieldsMember = ownDataValue(ui, 'fields');
  if (
    !fieldsMember.present ||
    fieldsMember.accessor ||
    !isOrdinaryRecord(fieldsMember.value)
  ) {
    return;
  }
  const rawFields = fieldsMember.value;
  if (template?.identityProperty !== undefined) {
    const identity = ownDataValue(rawFields, template.identityProperty);
    if (
      identity.present &&
      !identity.accessor &&
      isOrdinaryRecord(identity.value)
    ) {
      collectUnsupportedMembers(
        identity.value,
        [...documentPath, 'fields', template.identityProperty],
        output,
        {
          field: template.identityProperty,
          dataPath: template.arrayPath,
          templatePath: [template.identityProperty],
          targetKind: 'identity',
        },
      );
    }
  }
  const byName = new Map(
    candidates.map((candidate) => [candidate.name, candidate] as const),
  );
  for (const [name, candidate] of byName) {
    const rawNodeMember = ownDataValue(rawFields, name);
    if (
      !rawNodeMember.present ||
      rawNodeMember.accessor ||
      !isOrdinaryRecord(rawNodeMember.value)
    ) {
      continue;
    }
    const rawNode = rawNodeMember.value;
    const nodeDocumentPath = [...documentPath, 'fields', name];
    if (isObjectCandidate(candidate)) {
      collectUnsupportedContainerConditions(
        rawNode,
        candidate.children,
        output,
        nodeDocumentPath,
        template === undefined ? [...dataPath, name] : [...dataPath, name],
        template,
      );
    } else if (candidate.type === 'array') {
      const item = ownDataValue(rawNode, 'item');
      if (!item.present || item.accessor || !isOrdinaryRecord(item.value)) {
        continue;
      }
      const itemPath = [...nodeDocumentPath, 'item'];
      collectUnsupportedMembers(item.value, itemPath, output, {
        field: candidate.name,
        dataPath: candidate.dataPath,
        templatePath: [],
        targetKind: 'item',
      });
      collectUnsupportedContainerConditions(
        item.value,
        candidate.children,
        output,
        itemPath,
        [],
        {
          arrayPath: candidate.dataPath,
          ...(candidate.identityProperty === undefined
            ? {}
            : { identityProperty: candidate.identityProperty }),
        },
      );
    }
  }
}

function collectUnsupportedMembers(
  value: object,
  documentPath: readonly (string | number)[],
  output: ConditionTarget[],
  target: Omit<ConditionTarget, 'member' | 'capture' | 'candidate'>,
): void {
  for (const member of ['visibleWhen', 'enabledWhen'] as const) {
    const capture = captureConditionMember(value, member, [
      ...documentPath,
      member,
    ]);
    if (capture !== undefined) output.push({ ...target, member, capture });
  }
}

function collectPresentationConditionTargets(
  value: unknown,
  documentPath: readonly (string | number)[],
  output: ConditionTarget[],
  dataPath?: readonly string[],
  templatePath?: readonly string[],
): void {
  type Frame =
    | {
        readonly kind: 'visit';
        readonly value: unknown;
        readonly documentPath: readonly (string | number)[];
      }
    | { readonly kind: 'leave'; readonly value: object };
  const active = new Set<object>();
  const stack: Frame[] = [{ kind: 'visit', value, documentPath }];

  while (stack.length > 0) {
    const frame = stack.pop();
    if (frame === undefined) break;
    if (frame.kind === 'leave') {
      active.delete(frame.value);
      continue;
    }
    const current = frame.value;
    if (Array.isArray(current)) {
      if (active.has(current)) continue;
      active.add(current);
      stack.push({ kind: 'leave', value: current });
      for (let index = current.length - 1; index >= 0; index -= 1) {
        const entry = Object.getOwnPropertyDescriptor(current, index);
        if (entry !== undefined && 'value' in entry) {
          stack.push({
            kind: 'visit',
            value: entry.value,
            documentPath: [...frame.documentPath, index],
          });
        }
      }
      continue;
    }
    if (!isOrdinaryRecord(current) || active.has(current)) continue;
    active.add(current);
    stack.push({ kind: 'leave', value: current });
    const id = ownDataValue(current, 'id');
    collectUnsupportedMembers(current, frame.documentPath, output, {
      field:
        id.present && !id.accessor && typeof id.value === 'string'
          ? id.value
          : 'presentation',
      ...(dataPath === undefined ? {} : { dataPath }),
      ...(templatePath === undefined ? {} : { templatePath }),
      targetKind: 'presentation',
    });
    const keys = Object.keys(current);
    for (let index = keys.length - 1; index >= 0; index -= 1) {
      const key = keys[index];
      if (key === undefined || key === 'visibleWhen' || key === 'enabledWhen') {
        continue;
      }
      const member = Object.getOwnPropertyDescriptor(current, key);
      if (member !== undefined && 'value' in member) {
        stack.push({
          kind: 'visit',
          value: member.value,
          documentPath: [...frame.documentPath, key],
        });
      }
    }
  }
}

function indexOrdinaryConditionSources(
  candidates: readonly NodeCandidate[],
  fields: Map<string, FieldCandidate>,
  objects: Set<string>,
  arrays: Set<string>,
  collectionPaths: string[][],
): void {
  for (const candidate of candidates) {
    const key = JSON.stringify(candidate.dataPath);
    if (candidate.type === 'array') {
      arrays.add(key);
      collectionPaths.push([...candidate.dataPath]);
    } else if (candidate.type === 'string-enum-array') {
      arrays.add(key);
    } else if (candidate.type === 'object') {
      objects.add(key);
      if (candidate.templatePath === undefined) {
        indexOrdinaryConditionSources(
          candidate.children,
          fields,
          objects,
          arrays,
          collectionPaths,
        );
      }
    } else if (candidate.type === 'discriminated-object') {
      objects.add(key);
    } else if (candidate.templatePath === undefined) fields.set(key, candidate);
  }
}

interface InspectedConditionPredicate {
  readonly kind: 'predicate';
  readonly sourcePath: readonly string[];
  readonly equals: string | number | boolean | null;
}

interface InspectedConditionGroup {
  readonly kind: 'group';
  readonly operator: 'all' | 'any';
  readonly conditions: readonly InspectedConditionPredicate[];
}

type InspectedCondition = InspectedConditionPredicate | InspectedConditionGroup;

type ConditionShapeFamily = 'predicate' | 'group' | 'mixed';

function enumerableConditionDescriptor(
  condition: Record<string, unknown>,
  member: 'path' | 'equals' | 'operator' | 'conditions',
): PropertyDescriptor | undefined {
  const descriptor = Object.getOwnPropertyDescriptor(condition, member);
  return descriptor?.enumerable === true ? descriptor : undefined;
}

function classifyConditionShape(
  condition: Record<string, unknown>,
): ConditionShapeFamily {
  const predicate =
    enumerableConditionDescriptor(condition, 'path') !== undefined ||
    enumerableConditionDescriptor(condition, 'equals') !== undefined;
  const group =
    enumerableConditionDescriptor(condition, 'operator') !== undefined ||
    enumerableConditionDescriptor(condition, 'conditions') !== undefined;
  if (predicate && group) return 'mixed';
  return group ? 'group' : 'predicate';
}

function appendConditionUnknownWarnings(
  target: ConditionTarget,
  condition: Record<string, unknown>,
  known: ReadonlySet<string>,
  diagnostics: Diagnostic[],
  suffix: readonly (string | number)[] = [],
): void {
  for (const key of Object.keys(condition)) {
    if (known.has(key)) continue;
    const warning = unknownUiKey(
      key,
      [...target.capture.documentPath, ...suffix, key],
      target.dataPath,
    );
    diagnostics.push(
      target.templatePath === undefined
        ? warning
        : withTemplatePath(warning, target.templatePath),
    );
  }
}

function inspectConditionShape(
  target: ConditionTarget,
  diagnostics: Diagnostic[],
): InspectedCondition | undefined {
  const { capture } = target;
  if (capture.kind === 'accessor') {
    diagnostics.push(
      conditionDiagnostic(target, 'condition-member-accessor', {
        conditionMember: 'condition',
        expected: 'condition object',
      }),
    );
    return undefined;
  }
  if (!isOrdinaryRecord(capture.value)) {
    diagnostics.push(
      conditionDiagnostic(target, 'condition-not-object', {
        expected: 'condition object',
        actualType: actualType(capture.value),
      }),
    );
    return undefined;
  }
  const condition = capture.value;
  const family = classifyConditionShape(condition);
  if (family === 'mixed') {
    diagnostics.push(
      conditionDiagnostic(target, 'condition-shape-mixed', {
        conditionMember: 'condition',
        expected: 'predicate or flat condition group',
      }),
    );
    appendConditionUnknownWarnings(
      target,
      condition,
      new Set(['path', 'equals', 'operator', 'conditions']),
      diagnostics,
    );
    return undefined;
  }
  return family === 'group'
    ? inspectConditionGroupShape(target, condition, diagnostics)
    : inspectConditionPredicateShape(target, condition, diagnostics);
}

function inspectConditionPredicateShape(
  target: ConditionTarget,
  condition: Record<string, unknown>,
  diagnostics: Diagnostic[],
  suffixPrefix: readonly (string | number)[] = [],
  memberIndex?: number,
): InspectedConditionPredicate | undefined {
  let valid = true;
  let sourcePath: string[] | undefined;
  let equals: string | number | boolean | null | undefined;
  let equalsValid = false;
  const location =
    memberIndex === undefined ? {} : { memberIndex: memberIndex };
  const pathDescriptor = enumerableConditionDescriptor(condition, 'path');
  if (pathDescriptor === undefined) {
    valid = false;
    diagnostics.push(
      conditionDiagnostic(
        target,
        'condition-member-missing',
        {
          conditionMember: 'path',
          expected: 'non-empty dense string path',
          ...location,
        },
        [...suffixPrefix, 'path'],
      ),
    );
  } else if (!('value' in pathDescriptor)) {
    valid = false;
    diagnostics.push(
      conditionDiagnostic(
        target,
        'condition-member-accessor',
        {
          conditionMember: 'path',
          expected: 'non-empty dense string path',
          ...location,
        },
        [...suffixPrefix, 'path'],
      ),
    );
  } else if (!Array.isArray(pathDescriptor.value)) {
    valid = false;
    diagnostics.push(
      conditionDiagnostic(
        target,
        'condition-member-invalid',
        {
          conditionMember: 'path',
          expected: 'non-empty dense string path',
          actualType: actualType(pathDescriptor.value),
          ...location,
        },
        [...suffixPrefix, 'path'],
      ),
    );
  } else {
    const path = pathDescriptor.value;
    const length = Object.getOwnPropertyDescriptor(path, 'length');
    if (
      length === undefined ||
      !('value' in length) ||
      !Number.isInteger(length.value) ||
      (length.value as number) <= 0
    ) {
      valid = false;
      diagnostics.push(
        conditionDiagnostic(
          target,
          'condition-member-invalid',
          {
            conditionMember: 'path',
            expected: 'non-empty dense string path',
            actualType: 'array',
            actualLength:
              length !== undefined &&
              'value' in length &&
              typeof length.value === 'number'
                ? length.value
                : 0,
            ...location,
          },
          [...suffixPrefix, 'path'],
        ),
      );
    } else {
      sourcePath = [];
      for (let index = 0; index < length.value; index += 1) {
        const entry = Object.getOwnPropertyDescriptor(path, index);
        if (entry === undefined || !entry.enumerable || !('value' in entry)) {
          valid = false;
          diagnostics.push(
            conditionDiagnostic(
              target,
              entry !== undefined && !('value' in entry)
                ? 'condition-member-accessor'
                : 'condition-member-invalid',
              entry !== undefined && !('value' in entry)
                ? {
                    conditionMember: 'path',
                    expected: 'string path segment',
                    pathIndex: index,
                    ...location,
                  }
                : {
                    conditionMember: 'path',
                    expected: 'string path segment',
                    pathIndex: index,
                    ...location,
                  },
              [...suffixPrefix, 'path', index],
            ),
          );
        } else if (typeof entry.value !== 'string') {
          valid = false;
          diagnostics.push(
            conditionDiagnostic(
              target,
              'condition-member-invalid',
              {
                conditionMember: 'path',
                expected: 'string path segment',
                actualType: actualType(entry.value),
                pathIndex: index,
                ...location,
              },
              [...suffixPrefix, 'path', index],
            ),
          );
        } else sourcePath.push(entry.value);
      }
      for (const key of Object.keys(path)) {
        if (/^(0|[1-9]\d*)$/.test(key) && Number(key) < length.value) continue;
        valid = false;
        diagnostics.push(
          conditionDiagnostic(
            target,
            'condition-member-invalid',
            {
              conditionMember: 'path',
              expected: 'non-empty dense string path',
              actualType: 'array',
              pathKey: key,
              ...location,
            },
            [...suffixPrefix, 'path', key],
          ),
        );
      }
    }
  }
  const equalsDescriptor = enumerableConditionDescriptor(condition, 'equals');
  if (equalsDescriptor === undefined) {
    valid = false;
    diagnostics.push(
      conditionDiagnostic(
        target,
        'condition-member-missing',
        {
          conditionMember: 'equals',
          expected: 'string, finite number, boolean or null',
          ...location,
        },
        [...suffixPrefix, 'equals'],
      ),
    );
  } else if (!('value' in equalsDescriptor)) {
    valid = false;
    diagnostics.push(
      conditionDiagnostic(
        target,
        'condition-member-accessor',
        {
          conditionMember: 'equals',
          expected: 'string, finite number, boolean or null',
          ...location,
        },
        [...suffixPrefix, 'equals'],
      ),
    );
  } else if (
    equalsDescriptor.value === null ||
    typeof equalsDescriptor.value === 'string' ||
    typeof equalsDescriptor.value === 'boolean' ||
    (typeof equalsDescriptor.value === 'number' &&
      Number.isFinite(equalsDescriptor.value))
  ) {
    equals = equalsDescriptor.value as string | number | boolean | null;
    equalsValid = true;
  } else {
    valid = false;
    diagnostics.push(
      conditionDiagnostic(
        target,
        'condition-member-invalid',
        {
          conditionMember: 'equals',
          expected: 'string, finite number, boolean or null',
          actualType: actualType(equalsDescriptor.value),
          ...location,
        },
        [...suffixPrefix, 'equals'],
      ),
    );
  }
  appendConditionUnknownWarnings(
    target,
    condition,
    new Set(['path', 'equals']),
    diagnostics,
    suffixPrefix,
  );
  return valid && sourcePath !== undefined && equalsValid
    ? {
        kind: 'predicate',
        sourcePath,
        equals: equals as string | number | boolean | null,
      }
    : undefined;
}

function inspectConditionGroupShape(
  target: ConditionTarget,
  condition: Record<string, unknown>,
  diagnostics: Diagnostic[],
): InspectedConditionGroup | undefined {
  let valid = true;
  let operator: 'all' | 'any' | undefined;
  let conditionsValue: unknown;
  let conditionsReadable = false;

  const operatorDescriptor = enumerableConditionDescriptor(
    condition,
    'operator',
  );
  if (operatorDescriptor === undefined) {
    valid = false;
    diagnostics.push(
      conditionDiagnostic(
        target,
        'condition-member-missing',
        { conditionMember: 'operator', expected: "'all' or 'any'" },
        ['operator'],
      ),
    );
  } else if (!('value' in operatorDescriptor)) {
    valid = false;
    diagnostics.push(
      conditionDiagnostic(
        target,
        'condition-member-accessor',
        { conditionMember: 'operator', expected: "'all' or 'any'" },
        ['operator'],
      ),
    );
  } else if (
    operatorDescriptor.value !== 'all' &&
    operatorDescriptor.value !== 'any'
  ) {
    valid = false;
    diagnostics.push(
      conditionDiagnostic(
        target,
        'condition-member-invalid',
        {
          conditionMember: 'operator',
          expected: "'all' or 'any'",
          actualType: actualType(operatorDescriptor.value),
          ...(typeof operatorDescriptor.value === 'string'
            ? { actualOperator: operatorDescriptor.value }
            : {}),
        },
        ['operator'],
      ),
    );
  } else operator = operatorDescriptor.value as 'all' | 'any';

  const conditionsDescriptor = enumerableConditionDescriptor(
    condition,
    'conditions',
  );
  if (conditionsDescriptor === undefined) {
    valid = false;
    diagnostics.push(
      conditionDiagnostic(
        target,
        'condition-member-missing',
        {
          conditionMember: 'conditions',
          expected: 'non-empty dense condition array',
        },
        ['conditions'],
      ),
    );
  } else if (!('value' in conditionsDescriptor)) {
    valid = false;
    diagnostics.push(
      conditionDiagnostic(
        target,
        'condition-member-accessor',
        {
          conditionMember: 'conditions',
          expected: 'non-empty dense condition array',
        },
        ['conditions'],
      ),
    );
  } else {
    conditionsValue = conditionsDescriptor.value;
    conditionsReadable = true;
  }

  const members: InspectedConditionPredicate[] = [];
  if (conditionsReadable) {
    if (!Array.isArray(conditionsValue)) {
      valid = false;
      diagnostics.push(
        conditionDiagnostic(
          target,
          'condition-member-invalid',
          {
            conditionMember: 'conditions',
            expected: 'non-empty dense condition array',
            actualType: actualType(conditionsValue),
          },
          ['conditions'],
        ),
      );
    } else {
      if (conditionsValue.length === 0) {
        valid = false;
        diagnostics.push(
          conditionDiagnostic(
            target,
            'condition-group-empty',
            {
              conditionMember: 'conditions',
              expected: 'non-empty dense condition array',
              actualType: 'array',
              actualLength: 0,
            },
            ['conditions'],
          ),
        );
      }
      const descriptors: Array<PropertyDescriptor | undefined> = [];
      for (let index = 0; index < conditionsValue.length; index += 1) {
        const descriptor = Object.getOwnPropertyDescriptor(
          conditionsValue,
          index,
        );
        descriptors.push(descriptor);
        if (
          descriptor === undefined ||
          !descriptor.enumerable ||
          !('value' in descriptor)
        ) {
          valid = false;
          diagnostics.push(
            conditionDiagnostic(
              target,
              descriptor !== undefined && !('value' in descriptor)
                ? 'condition-member-accessor'
                : 'condition-member-invalid',
              {
                conditionMember: 'conditions',
                expected: 'non-empty dense condition array',
                memberIndex: index,
              },
              ['conditions', index],
            ),
          );
        }
      }
      for (const key of Object.keys(conditionsValue)) {
        if (isCanonicalArrayIndex(key, conditionsValue.length)) continue;
        valid = false;
        diagnostics.push(
          conditionDiagnostic(
            target,
            'condition-member-invalid',
            {
              conditionMember: 'conditions',
              expected: 'non-empty dense condition array',
              conditionKey: key,
            },
            ['conditions', key],
          ),
        );
      }
      for (let index = 0; index < descriptors.length; index += 1) {
        const descriptor = descriptors[index];
        if (
          descriptor === undefined ||
          !descriptor.enumerable ||
          !('value' in descriptor)
        ) {
          continue;
        }
        if (!isOrdinaryRecord(descriptor.value)) {
          valid = false;
          diagnostics.push(
            conditionDiagnostic(
              target,
              'condition-not-object',
              {
                conditionMember: 'condition',
                expected: 'condition object',
                actualType: actualType(descriptor.value),
                memberIndex: index,
              },
              ['conditions', index],
            ),
          );
          continue;
        }
        const family = classifyConditionShape(descriptor.value);
        if (family === 'mixed') {
          valid = false;
          diagnostics.push(
            conditionDiagnostic(
              target,
              'condition-shape-mixed',
              {
                conditionMember: 'condition',
                expected: 'predicate or flat condition group',
                memberIndex: index,
              },
              ['conditions', index],
            ),
          );
          appendConditionUnknownWarnings(
            target,
            descriptor.value,
            new Set(['path', 'equals', 'operator', 'conditions']),
            diagnostics,
            ['conditions', index],
          );
          continue;
        }
        if (family === 'group') {
          valid = false;
          diagnostics.push(
            conditionDiagnostic(
              target,
              'condition-group-nested',
              {
                conditionMember: 'condition',
                expected: 'non-nested condition predicate',
                memberIndex: index,
              },
              ['conditions', index],
            ),
          );
          appendConditionUnknownWarnings(
            target,
            descriptor.value,
            new Set(['operator', 'conditions']),
            diagnostics,
            ['conditions', index],
          );
          continue;
        }
        const member = inspectConditionPredicateShape(
          target,
          descriptor.value,
          diagnostics,
          ['conditions', index],
          index,
        );
        if (member === undefined) valid = false;
        else members.push(member);
      }
    }
  }

  appendConditionUnknownWarnings(
    target,
    condition,
    new Set(['operator', 'conditions']),
    diagnostics,
  );

  return valid && operator !== undefined
    ? { kind: 'group', operator, conditions: members }
    : undefined;
}

function isCanonicalArrayIndex(key: string, length: number): boolean {
  if (key.length === 0) return false;
  const index = Number(key);
  return (
    Number.isInteger(index) &&
    index >= 0 &&
    index < 4_294_967_295 &&
    index < length &&
    String(index) === key
  );
}

function conditionTargetKind(
  candidate: NodeCandidate,
): 'object' | 'array' | 'template-object' | 'template-field' | undefined {
  if ('templatePath' in candidate && candidate.templatePath !== undefined) {
    return candidate.type === 'object' ? 'template-object' : 'template-field';
  }
  if (isObjectCandidate(candidate)) return 'object';
  if (candidate.type === 'array' || candidate.type === 'string-enum-array')
    return 'array';
  return undefined;
}

function conditionDiagnostic(
  target: ConditionTarget,
  reason: string,
  details: Readonly<Record<string, unknown>>,
  suffix: readonly (string | number)[] = [],
): Diagnostic {
  return diagnostic({
    code: 'INVALID_UI_FIELD_CONDITION',
    severity: 'error',
    source: 'ui-schema',
    ...(target.dataPath === undefined
      ? {}
      : { dataPath: [...target.dataPath] }),
    documentPath: [...target.capture.documentPath, ...suffix],
    parameters: {
      field: target.field,
      member: target.member,
      reason,
      ...details,
      ...(target.templatePath === undefined
        ? {}
        : { templatePath: [...target.templatePath] }),
    },
    fallbackMessage: 'Field condition is invalid.',
  });
}

function conditionLiteralCompatible(
  source: FieldCandidate,
  value: string | number | boolean | null,
): boolean {
  if (value === null) return source.nullable;
  if (source.type === 'string') return typeof value === 'string';
  if (source.type === 'boolean') return typeof value === 'boolean';
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    (source.type === 'number' || Number.isInteger(value))
  );
}

function conditionLiteralExpected(source: FieldCandidate): string {
  const primitive =
    source.type === 'string'
      ? 'string'
      : source.type === 'boolean'
        ? 'boolean'
        : source.type === 'integer'
          ? 'finite integer'
          : 'finite number';
  return source.nullable ? `${primitive} or null` : primitive;
}

function buildNestedDefinition(
  candidates: readonly NodeCandidate[],
  uiSchema: ParsedUiSchema,
  conditions: ReadonlyMap<string, NormalizedFieldConditions>,
): FormDefinition {
  const nodes: FormNodeDefinition[] = [];
  const fields: FieldDefinition[] = [];
  const pendingObjectPresentations: Array<{
    readonly parsed: readonly ParsedPresentationEntry[] | undefined;
    readonly children: FormNodeDefinition[];
    readonly output: PresentationEntryDefinition<FormNodeDefinition>[];
    readonly owner: readonly ['object', readonly string[]];
  }> = [];
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
    } else if (candidate.type === 'discriminated-object') {
      const objectUi = frame.ui as ParsedObjectUi | undefined;
      const children: FormNodeDefinition[] = [];
      const unionOrder = [
        ...(objectUi?.order ?? []),
        ...candidate.children
          .map(({ name }) => name)
          .filter((name) => !(objectUi?.order ?? []).includes(name)),
      ];
      const unionRank = new Map(
        unionOrder.map((childName, index) => [childName, index] as const),
      );
      const label =
        objectUi?.label ??
        candidate.schemaTitle ??
        accessibleName(candidate.name);
      const node: DiscriminatedObjectFieldDefinition = {
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
        kind: 'discriminated-object',
        discriminator: candidate.discriminator,
        children,
        alternatives: candidate.alternatives.map((alternative) => ({
          discriminatorValue: alternative.discriminatorValue,
          children: [...alternative.children].sort(
            (left, right) =>
              (unionRank.get(left) ?? Number.MAX_SAFE_INTEGER) -
              (unionRank.get(right) ?? Number.MAX_SAFE_INTEGER),
          ),
        })),
      };
      frame.output.push(node);
      pushBuildFrames(
        candidate.children,
        objectUi ?? { order: [], fields: new Map() },
        children,
        stack,
      );
    } else if (candidate.type === 'object') {
      const objectUi = frame.ui as ParsedObjectUi | undefined;
      const children: FormNodeDefinition[] = [];
      const presentation: PresentationEntryDefinition<FormNodeDefinition>[] =
        [];
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
        presentation,
      };
      frame.output.push(node);
      pendingObjectPresentations.push({
        parsed: objectUi?.presentation,
        children,
        output: presentation,
        owner: ['object', candidate.dataPath],
      });
      pushBuildFrames(
        candidate.children,
        objectUi ?? { order: [], fields: new Map() },
        children,
        stack,
      );
    } else {
      const field = buildFieldDefinition(
        candidate,
        frame.ui,
        conditions.get(JSON.stringify(candidate.dataPath)),
      );
      frame.output.push(field);
      fields.push(field);
    }
  }
  for (const pending of pendingObjectPresentations) {
    pending.output.push(
      ...createPresentationDefinition(
        pending.parsed,
        pending.children,
        pending.owner,
      ),
    );
  }
  return {
    nodes,
    fields,
    presentation: createRootPresentationDefinition(uiSchema, nodes),
  };
}

function buildItemTemplate(
  collection: ArrayCandidate,
  ui: ParsedUiSchema,
): ObjectItemTemplateDefinition {
  const children: Array<ObjectNodeTemplate | FieldTemplate> = [];
  const fields: FieldTemplate[] = [];
  const presentation: PresentationEntryDefinition<FormNodeTemplate>[] = [];
  const pendingObjectPresentations: Array<{
    readonly parsed: readonly ParsedPresentationEntry[] | undefined;
    readonly children: Array<ObjectNodeTemplate | FieldTemplate>;
    readonly output: PresentationEntryDefinition<FormNodeTemplate>[];
    readonly owner: readonly [
      'item-template-object',
      readonly string[],
      readonly string[],
    ];
  }> = [];
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
    if (
      candidate.type === 'array' ||
      candidate.type === 'discriminated-object' ||
      candidate.templatePath === undefined
    ) {
      throw new Error('Internal compiler error: invalid item template node.');
    }
    if (candidate.type === 'object') {
      const objectUi = frame.ui as ParsedObjectUi | undefined;
      const nestedChildren: Array<ObjectNodeTemplate | FieldTemplate> = [];
      const nestedPresentation: PresentationEntryDefinition<FormNodeTemplate>[] =
        [];
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
        presentation: nestedPresentation,
      };
      frame.output.push(node);
      pendingObjectPresentations.push({
        parsed: objectUi?.presentation,
        children: nestedChildren,
        output: nestedPresentation,
        owner: [
          'item-template-object',
          collection.dataPath,
          candidate.templatePath,
        ],
      });
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
  for (const pending of pendingObjectPresentations) {
    pending.output.push(
      ...createPresentationDefinition(
        pending.parsed,
        pending.children,
        pending.owner,
      ),
    );
  }
  presentation.push(
    ...createPresentationDefinition(ui.presentation, children, [
      'item-template',
      collection.dataPath,
    ]),
  );
  return { kind: 'item-template', children, fields, presentation };
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
    ...(candidate.fixedValue.kind === 'valid'
      ? { fixedValue: candidate.fixedValue.value }
      : {}),
  };
  if (candidate.type === 'string') {
    return {
      ...base,
      kind: 'string',
      ...(candidate.stringFormat === undefined
        ? {}
        : { format: candidate.stringFormat }),
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
  conditions: ReadonlyMap<string, NormalizedFieldConditions>,
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
    return buildFieldDefinition(
      candidate,
      uiSchema.fields.get(name),
      conditions.get(JSON.stringify(candidate.dataPath)),
    );
  });
  return {
    nodes: fields,
    fields,
    presentation: createRootPresentationDefinition(uiSchema, fields),
  };
}

function createRootPresentationDefinition(
  uiSchema: ParsedUiSchema,
  nodes: readonly FormNodeDefinition[],
): readonly RootPresentationEntryDefinition[] {
  const parsedWizard = uiSchema.wizard;
  if (parsedWizard === undefined)
    return createPresentationDefinition(uiSchema.presentation, nodes);
  const byName = new Map(nodes.map((node) => [node.name, node] as const));
  const steps: WizardStepDefinition[] = parsedWizard.steps.map((step) => {
    const paths = step.nodeNames.map((name) => {
      const node = byName.get(name);
      if (node === undefined)
        throw new Error('Internal compiler error: missing wizard step node.');
      return [...node.path];
    });
    return {
      kind: 'wizard-step',
      id: step.id,
      key: JSON.stringify(['wizard', parsedWizard.id, 'step', step.id]),
      label: step.label,
      children: createPresentationDefinition(step.children, nodes),
      scope: {
        id: JSON.stringify([
          'wizard',
          parsedWizard.id,
          'step',
          step.id,
          'scope',
        ]),
        paths,
        includeGlobalIssues: false,
      },
    };
  });
  const wizard: WizardDefinition = {
    kind: 'wizard',
    id: parsedWizard.id,
    key: JSON.stringify(['wizard', parsedWizard.id]),
    label: parsedWizard.label,
    steps,
    completionScope: {
      id: JSON.stringify(['wizard', parsedWizard.id, 'completion', 'scope']),
      paths: parsedWizard.steps.flatMap((step) =>
        step.nodeNames.map((name) => {
          const node = byName.get(name);
          if (node === undefined)
            throw new Error(
              'Internal compiler error: missing wizard completion node.',
            );
          return [...node.path];
        }),
      ),
      includeGlobalIssues: true,
    },
  };
  return [wizard];
}

type StaticPresentationOwner =
  | readonly ['object', readonly string[]]
  | readonly ['item-template', readonly string[]]
  | readonly ['item-template-object', readonly string[], readonly string[]];

function createPresentationDefinition<
  TNode extends FormNodeDefinition | FormNodeTemplate,
>(
  parsed: readonly ParsedPresentationEntry[] | undefined,
  nodes: readonly TNode[],
  owner?: StaticPresentationOwner,
): readonly PresentationEntryDefinition<TNode>[] {
  if (parsed === undefined) return createDefaultPresentation(nodes);
  const byName = new Map(nodes.map((node) => [node.name, node] as const));
  const result: PresentationEntryDefinition<TNode>[] = [];
  type Frame = {
    readonly entry: ParsedPresentationEntry;
    readonly output: PresentationEntryDefinition<TNode>[];
  };
  const stack: Frame[] = [];
  const pendingGridItems: Array<{
    readonly target: Omit<PresentationGridItemDefinition<TNode>, 'child'> & {
      child?: PresentationEntryDefinition<TNode>;
    };
    readonly childOutput: PresentationEntryDefinition<TNode>[];
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
      const children: PresentationEntryDefinition<TNode>[] = [];
      const section: PresentationSectionDefinition<TNode> = {
        kind: 'section',
        id: entry.id,
        key:
          owner === undefined
            ? JSON.stringify(['section', entry.id])
            : JSON.stringify(['presentation', owner, 'section', entry.id]),
        label: entry.label,
        children,
      };
      frame.output.push(section);
      pushPresentationBuildFrames(entry.children, children, stack);
      continue;
    }
    if (entry.kind === 'tabs' || entry.kind === 'accordion') {
      const panels: PresentationPanelDefinition<TNode>[] = entry.panels.map(
        (panel) => ({
          kind: 'panel',
          id: panel.id,
          key:
            owner === undefined
              ? JSON.stringify([entry.kind, entry.id, 'panel', panel.id])
              : JSON.stringify([
                  'presentation',
                  owner,
                  entry.kind,
                  entry.id,
                  'panel',
                  panel.id,
                ]),
          label: panel.label,
          children: [],
        }),
      );
      const container:
        | PresentationTabsDefinition<TNode>
        | PresentationAccordionDefinition<TNode> = {
        kind: entry.kind,
        id: entry.id,
        key:
          owner === undefined
            ? JSON.stringify([entry.kind, entry.id])
            : JSON.stringify(['presentation', owner, entry.kind, entry.id]),
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
          panel.children as PresentationEntryDefinition<TNode>[],
          stack,
        );
      }
      continue;
    }

    const items: PresentationGridItemDefinition<TNode>[] = entry.items.map(
      (item, itemIndex) => {
        const parsedChild = item.child[0];
        if (parsedChild === undefined || item.child.length !== 1)
          throw new Error('Internal compiler error: missing grid item child.');
        const childOutput: PresentationEntryDefinition<TNode>[] = [];
        stack.push({ entry: parsedChild, output: childOutput });
        const target: Omit<PresentationGridItemDefinition<TNode>, 'child'> & {
          child?: PresentationEntryDefinition<TNode>;
        } = {
          kind: 'grid-item',
          key:
            owner === undefined
              ? JSON.stringify(['grid', entry.id, 'item', itemIndex])
              : JSON.stringify([
                  'presentation',
                  owner,
                  'grid',
                  entry.id,
                  'item',
                  itemIndex,
                ]),
          span: item.span,
        };
        pendingGridItems.push({ target, childOutput });
        return target as PresentationGridItemDefinition<TNode>;
      },
    );
    const grid: PresentationGridDefinition<TNode> = {
      kind: 'grid',
      id: entry.id,
      key:
        owner === undefined
          ? JSON.stringify(['grid', entry.id])
          : JSON.stringify(['presentation', owner, 'grid', entry.id]),
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

function pushPresentationBuildFrames<
  TNode extends FormNodeDefinition | FormNodeTemplate,
>(
  entries: readonly ParsedPresentationEntry[],
  output: PresentationEntryDefinition<TNode>[],
  stack: Array<{
    readonly entry: ParsedPresentationEntry;
    readonly output: PresentationEntryDefinition<TNode>[];
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
  conditions?: NormalizedFieldConditions,
): FieldDefinition {
  if (candidate.type === 'string-enum-array') {
    const definition: StringEnumArrayFieldDefinition = {
      key: JSON.stringify(candidate.dataPath),
      name: candidate.name,
      path: candidate.dataPath,
      required: candidate.required,
      nullable: false,
      label: ui?.label ?? candidate.schemaTitle ?? candidate.name,
      ...(ui?.description !== undefined
        ? { description: ui.description }
        : candidate.schemaDescription === undefined
          ? {}
          : { description: candidate.schemaDescription }),
      ...(ui?.hint === undefined ? {} : { hint: ui.hint }),
      ...(ui?.tooltip === undefined ? {} : { tooltip: ui.tooltip }),
      kind: 'string-enum-array',
      choices:
        candidate.stringEnum.kind === 'valid'
          ? candidate.stringEnum.values.map((value) => ({
              value,
              label:
                ui?.enumLabels?.get(value) ??
                (value.trim().length > 0 ? value : JSON.stringify(value)),
            }))
          : [],
    };
    return definition;
  }

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
    ...(candidate.fixedValue.kind === 'valid'
      ? { fixedValue: candidate.fixedValue.value }
      : {}),
    ...(conditions?.visibleWhen === undefined
      ? {}
      : { visibleWhen: conditions.visibleWhen }),
    ...(conditions?.enabledWhen === undefined
      ? {}
      : { enabledWhen: conditions.enabledWhen }),
  };

  if (candidate.type === 'string') {
    const definition: StringFieldDefinition = {
      ...base,
      kind: 'string',
      ...(candidate.stringFormat === undefined
        ? {}
        : { format: candidate.stringFormat }),
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
