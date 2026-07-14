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
  StringFieldDefinition,
} from './contracts.js';
import { diagnostic, hasErrors } from './internal/diagnostics.js';
import { deepFreeze } from './internal/immutable.js';
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

const UI_ROOT_KEYS = new Set(['order', 'fields']);
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
): NodeCandidate[] {
  const candidates: NodeCandidate[] = [];
  type Frame =
    | {
        readonly kind: 'exit';
        readonly schema: Record<string, unknown>;
      }
    | {
        readonly kind: 'node';
        readonly name: string;
        readonly schemaValue: unknown;
        readonly required: boolean;
        readonly dataPath: readonly string[];
        readonly documentPath: readonly (string | number)[];
        readonly output: NodeCandidate[];
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
    });
  }

  while (stack.length > 0) {
    const frame = stack.pop();
    if (frame === undefined) {
      break;
    }
    if (frame.kind === 'exit') {
      active.delete(frame.schema);
      continue;
    }

    const {
      name,
      schemaValue: rawField,
      required,
      dataPath,
      documentPath: fieldPath,
      output,
    } = frame;

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

    if (!Object.hasOwn(rawField, 'type')) {
      diagnostics.push(
        diagnostic({
          code: 'MISSING_FIELD_TYPE',
          severity: 'error',
          source: 'schema',
          dataPath,
          documentPath: [...fieldPath, 'type'],
          parameters: { field: name },
          fallbackMessage: `Field "${name}" must declare a type.`,
        }),
      );
      continue;
    }

    const typeDescriptor = Object.getOwnPropertyDescriptor(rawField, 'type');
    const rawType: unknown =
      typeDescriptor !== undefined && 'value' in typeDescriptor
        ? typeDescriptor.value
        : ACCESSOR_VALUE;
    if (typeof rawType !== 'string' || !SUPPORTED_NODE_TYPES.has(rawType)) {
      diagnostics.push(
        diagnostic({
          code: 'UNSUPPORTED_FIELD_TYPE',
          severity: 'error',
          source: 'schema',
          dataPath,
          documentPath: [...fieldPath, 'type'],
          parameters: {
            field: name,
            ...(rawType === ACCESSOR_VALUE
              ? { actualType: 'accessor' }
              : describeActualValue(rawType)),
          },
          fallbackMessage: `Field "${name}" has an unsupported type.`,
        }),
      );
      continue;
    }

    if (SUPPORTED_FIELD_TYPES.has(rawType as FieldType)) {
      output.push(
        inspectValidField(
          name,
          rawType as FieldType,
          rawField,
          required,
          diagnostics,
          dataPath,
          fieldPath,
        ),
      );
      continue;
    }

    const firstDocumentPath = active.get(rawField);
    if (firstDocumentPath !== undefined) {
      diagnostics.push(
        diagnostic({
          code: 'CYCLIC_SCHEMA_OBJECT',
          severity: 'error',
          source: 'schema',
          dataPath,
          documentPath: fieldPath,
          parameters: { firstDocumentPath: [...firstDocumentPath] },
          fallbackMessage: 'Schema object cycle detected.',
        }),
      );
      continue;
    }

    if (rawType === 'array') {
      active.set(rawField, fieldPath);
      const array = inspectArrayCandidate(
        name,
        rawField,
        required,
        dataPath,
        fieldPath,
        diagnostics,
        active,
        collectionPolicies,
        usedPolicyIndices,
      );
      active.delete(rawField);
      if (array !== undefined) output.push(array);
      continue;
    }

    const object = inspectObjectCandidate(
      name,
      rawField,
      required,
      dataPath,
      fieldPath,
      diagnostics,
    );
    if (object === undefined) {
      continue;
    }
    output.push(object.candidate);
    active.set(rawField, fieldPath);
    stack.push({ kind: 'exit', schema: rawField });
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
        documentPath: [...fieldPath, 'properties', childName],
        output: object.candidate.children,
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

  const firstItemsPath = active.get(itemsMember.value);
  if (firstItemsPath !== undefined) {
    diagnostics.push(
      withTemplatePath(
        diagnostic({
          code: 'CYCLIC_SCHEMA_OBJECT',
          severity: 'error',
          source: 'schema',
          dataPath,
          documentPath: itemsPath,
          parameters: { firstDocumentPath: [...firstItemsPath] },
          fallbackMessage: 'Schema object cycle detected.',
        }),
        [],
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

  const item = inspectItemRoot(
    name,
    itemsMember.value,
    dataPath,
    itemsPath,
    diagnostics,
  );
  const children: NodeCandidate[] = [];
  let identitySchemaCompatible = false;
  if (item !== undefined) {
    active.set(itemsMember.value, itemsPath);
    identitySchemaCompatible = inspectItemTemplateChildren(
      item.properties,
      item.requiredNames,
      policy?.itemIdentityProperty,
      children,
      dataPath,
      itemsPath,
      diagnostics,
      active,
    );
    active.delete(itemsMember.value);
  }

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
        ),
      );
    } else if (!item.requiredNames.has(policy.itemIdentityProperty)) {
      diagnostics.push(
        semanticCollectionPolicyDiagnostic(
          policy,
          dataPath,
          'identity-property-not-required',
          'required item property',
        ),
      );
    } else if (!identitySchemaCompatible) {
      diagnostics.push(
        semanticCollectionPolicyDiagnostic(
          policy,
          dataPath,
          'identity-schema-incompatible',
          'required direct string identity property',
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
): boolean {
  type Frame =
    | { readonly kind: 'exit'; readonly schema: Record<string, unknown> }
    | {
        readonly kind: 'node';
        readonly name: string;
        readonly schemaValue: unknown;
        readonly required: boolean;
        readonly templatePath: readonly string[];
        readonly documentPath: readonly (string | number)[];
        readonly output: NodeCandidate[];
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
    });
  }
  let identityCompatible = false;
  while (stack.length > 0) {
    const frame = stack.pop();
    if (frame === undefined) break;
    if (frame.kind === 'exit') {
      active.delete(frame.schema);
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
    const schema = frame.schemaValue;
    const typeMember = ownDataValue(schema, 'type');
    if (!typeMember.present) {
      diagnostics.push(
        diagnostic({
          code: 'MISSING_FIELD_TYPE',
          severity: 'error',
          source: 'schema',
          dataPath: arrayPath,
          documentPath: [...frame.documentPath, 'type'],
          parameters: { field: frame.name },
          fallbackMessage: `Field "${frame.name}" must declare a type.`,
        }),
      );
      addTemplatePathToRange(diagnostics, start, frame.templatePath);
      continue;
    }
    const rawType = typeMember.accessor ? ACCESSOR_VALUE : typeMember.value;
    if (frame.templatePath.length === 1 && frame.name === identityProperty) {
      identityCompatible = inspectIdentitySchema(
        frame.name,
        schema,
        rawType,
        arrayPath,
        frame.documentPath,
        frame.templatePath,
        diagnostics,
      );
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
            documentPath: [...frame.documentPath, 'type'],
            parameters: {
              field: frame.name,
              reason: 'nested-array-not-supported',
            },
            fallbackMessage: `Field "${frame.name}" has an unsupported type.`,
          }),
          frame.templatePath,
        ),
      );
      continue;
    }
    if (typeof rawType !== 'string' || !SUPPORTED_NODE_TYPES.has(rawType)) {
      diagnostics.push(
        diagnostic({
          code: 'UNSUPPORTED_FIELD_TYPE',
          severity: 'error',
          source: 'schema',
          dataPath: arrayPath,
          documentPath: [...frame.documentPath, 'type'],
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
      continue;
    }
    if (rawType !== 'object') {
      const candidate = inspectValidField(
        frame.name,
        rawType as FieldType,
        schema,
        frame.required,
        diagnostics,
        arrayPath,
        frame.documentPath,
      );
      frame.output.push({ ...candidate, templatePath: frame.templatePath });
      addTemplatePathToRange(diagnostics, start, frame.templatePath);
      continue;
    }
    const firstPath = active.get(schema);
    if (firstPath !== undefined) {
      diagnostics.push(
        diagnostic({
          code: 'CYCLIC_SCHEMA_OBJECT',
          severity: 'error',
          source: 'schema',
          dataPath: arrayPath,
          documentPath: frame.documentPath,
          parameters: { firstDocumentPath: [...firstPath] },
          fallbackMessage: 'Schema object cycle detected.',
        }),
      );
      addTemplatePathToRange(diagnostics, start, frame.templatePath);
      continue;
    }
    const object = inspectObjectCandidate(
      frame.name,
      schema,
      frame.required,
      arrayPath,
      frame.documentPath,
      diagnostics,
    );
    addTemplatePathToRange(diagnostics, start, frame.templatePath);
    if (object === undefined) continue;
    const candidate: ObjectCandidate = {
      ...object.candidate,
      templatePath: frame.templatePath,
    };
    frame.output.push(candidate);
    active.set(schema, frame.documentPath);
    stack.push({ kind: 'exit', schema });
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
        documentPath: [...frame.documentPath, 'properties', childName],
        output: candidate.children,
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
  if (!compatible) {
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
): Diagnostic {
  return diagnostic({
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

function inspectValidField(
  name: string,
  type: FieldType,
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

  if (rawUiSchema === undefined) {
    return { order, fields };
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
    return { order, fields };
  }

  const knownFields =
    propertyNames === undefined ? undefined : new Set(propertyNames);

  for (const key of Object.keys(rawUiSchema)) {
    if (!UI_ROOT_KEYS.has(key)) {
      diagnostics.push(unknownUiKey(key, [key]));
      continue;
    }

    if (key === 'order') {
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

  return { order, fields };
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
  const result = {
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
  return { nodes, fields };
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
  return { nodes: fields, fields };
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
