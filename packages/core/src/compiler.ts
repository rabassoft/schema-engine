import type {
  BooleanFieldDefinition,
  CompileFormDefinitionInput,
  CompileFormResult,
  Diagnostic,
  FieldDefinition,
  FormDefinition,
  NumberFieldDefinition,
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

interface FieldCandidate {
  readonly name: string;
  readonly type: FieldType;
  readonly required: boolean;
  readonly schemaTitle?: string;
  readonly schemaDescription?: string;
  readonly stringConstraints: StringConstraints;
  readonly numberConstraints: NumberConstraints;
}

interface ParsedFieldUi {
  readonly label?: string;
  readonly description?: string;
  readonly hint?: string;
  readonly tooltip?: string;
  readonly placeholder?: string;
  readonly decimalPlaces?: number;
  readonly showTrailingZeros?: boolean;
}

interface ParsedUiSchema {
  readonly order: readonly string[];
  readonly fields: ReadonlyMap<string, ParsedFieldUi>;
}

const SUPPORTED_FIELD_TYPES = new Set<FieldType>([
  'string',
  'number',
  'integer',
  'boolean',
]);

const UI_ROOT_KEYS = new Set(['order', 'fields']);
const UI_FIELD_KEYS = new Set([
  'label',
  'description',
  'hint',
  'tooltip',
  'placeholder',
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
  let candidates: FieldCandidate[] = [];
  let propertyNames: readonly string[] | undefined;
  let fieldTypes: ReadonlyMap<string, FieldType> | undefined;

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
  } else if (inspectDialect(rawSchema, diagnostics)) {
    const root = inspectRootSchema(rawSchema, diagnostics);
    propertyNames = root.propertyNames;

    if (root.canInspectFields && root.properties !== undefined) {
      candidates = inspectFields(
        root.properties,
        root.requiredNames,
        diagnostics,
      );
      fieldTypes = new Map(
        candidates.map(({ name, type }) => [name, type] as const),
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

  const parsedUi = inspectUiSchema(
    rawUiSchema,
    propertyNames,
    fieldTypes,
    diagnostics,
  );

  if (hasErrors(diagnostics)) {
    return failedResult(diagnostics);
  }

  const definition = buildDefinition(candidates, parsedUi);
  return deepFreeze({
    success: true,
    definition,
    diagnostics,
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

  const declaredDialect = schema.$schema;
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

    inspectRootKeyword(keyword, schema[keyword], diagnostics);

    if (keyword === 'type') {
      rootTypeValid = schema.type === 'object';
      if (!rootTypeValid) {
        diagnostics.push(
          diagnostic({
            code: 'ROOT_TYPE_MUST_BE_OBJECT',
            severity: 'error',
            source: 'schema',
            documentPath: ['type'],
            parameters: describeActualValue(schema.type),
            fallbackMessage: 'The root schema type must be "object".',
          }),
        );
      }
    } else if (keyword === 'properties') {
      if (isRecord(schema.properties)) {
        properties = schema.properties;
      } else {
        diagnostics.push(
          diagnostic({
            code: 'INVALID_SCHEMA_PROPERTIES',
            severity: 'error',
            source: 'schema',
            documentPath: ['properties'],
            parameters: { actualType: actualType(schema.properties) },
            fallbackMessage: 'Schema properties must be an object.',
          }),
        );
      }
    } else if (keyword === 'required') {
      inspectRequired(
        schema.required,
        requiredEntries,
        requiredNames,
        diagnostics,
      );
    } else if (keyword === 'title' || keyword === 'description') {
      if (typeof schema[keyword] !== 'string') {
        diagnostics.push(
          invalidSchemaKeywordValue(keyword, schema[keyword], 'string', [
            keyword,
          ]),
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

  value.forEach((entry, index) => {
    if (typeof entry !== 'string') {
      diagnostics.push(
        invalidSchemaKeywordValue('required', entry, 'string', [
          'required',
          index,
        ]),
      );
      return;
    }

    if (names.has(entry)) {
      diagnostics.push(
        invalidSchemaKeywordValue('required', entry, 'unique string', [
          'required',
          index,
        ]),
      );
      return;
    }

    names.add(entry);
    entries.push({ name: entry, index });
  });
}

function inspectFields(
  properties: Record<string, unknown>,
  requiredNames: ReadonlySet<string>,
  diagnostics: Diagnostic[],
): FieldCandidate[] {
  const candidates: FieldCandidate[] = [];

  for (const name of Object.keys(properties)) {
    const rawField = properties[name];
    const dataPath = [name] as const;
    const fieldPath = ['properties', name] as const;

    if (!isRecord(rawField)) {
      diagnostics.push(
        diagnostic({
          code: 'INVALID_FIELD_SCHEMA',
          severity: 'error',
          source: 'schema',
          dataPath,
          documentPath: fieldPath,
          parameters: { field: name, actualType: actualType(rawField) },
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

    const rawType = rawField.type;
    if (
      typeof rawType !== 'string' ||
      !SUPPORTED_FIELD_TYPES.has(rawType as FieldType)
    ) {
      diagnostics.push(
        diagnostic({
          code: 'UNSUPPORTED_FIELD_TYPE',
          severity: 'error',
          source: 'schema',
          dataPath,
          documentPath: [...fieldPath, 'type'],
          parameters: {
            field: name,
            ...describeActualValue(rawType),
          },
          fallbackMessage: `Field "${name}" has an unsupported type.`,
        }),
      );
      continue;
    }

    const type = rawType as FieldType;
    candidates.push(
      inspectValidField(
        name,
        type,
        rawField,
        requiredNames.has(name),
        diagnostics,
      ),
    );
  }

  return candidates;
}

function inspectValidField(
  name: string,
  type: FieldType,
  field: Record<string, unknown>,
  required: boolean,
  diagnostics: Diagnostic[],
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
  const supportedKeywords = fieldKeywords(type);

  for (const keyword of Object.keys(field)) {
    const value = field[keyword];
    const documentPath = ['properties', name, keyword] as const;

    if (!supportedKeywords.has(keyword)) {
      if (KNOWN_IGNORABLE_KEYWORDS.has(keyword)) {
        diagnostics.push(
          schemaKeywordDiagnostic(
            'IGNORED_SCHEMA_KEYWORD',
            'warning',
            keyword,
            documentPath,
            `Known annotation "${keyword}" is ignored by the compiler.`,
            [name],
          ),
        );
      } else if (COMPILER_SUPPORTED_KEYWORDS.has(keyword)) {
        diagnostics.push(
          diagnostic({
            code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
            severity: 'error',
            source: 'schema',
            dataPath: [name],
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
            [name],
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
            [name],
          ),
        );
      }
      continue;
    }

    if (keyword === 'title' || keyword === 'description') {
      if (typeof value !== 'string') {
        diagnostics.push(
          invalidSchemaKeywordValue(keyword, value, 'string', documentPath, [
            name,
          ]),
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
            [name],
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
            [name],
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
            [name],
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
            [name],
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
  };
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
  fieldTypes: ReadonlyMap<string, FieldType> | undefined,
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
        fieldTypes,
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
  fieldTypes: ReadonlyMap<string, FieldType> | undefined,
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
      fieldTypes?.get(name),
      diagnostics,
    );
    if (knownFields?.has(name) && fieldTypes?.has(name)) {
      fields.set(name, parsed);
    }
  }
}

function inspectFieldUi(
  name: string,
  value: Record<string, unknown>,
  fieldType: FieldType | undefined,
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
  } = {};

  for (const key of Object.keys(value)) {
    const rawValue = value[key];
    const documentPath = ['fields', name, key] as const;

    if (!UI_FIELD_KEYS.has(key)) {
      diagnostics.push(unknownUiKey(key, documentPath, [name]));
      continue;
    }

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

  return {
    fields: orderedNames.map((name) => {
      const candidate = byName.get(name);
      if (candidate === undefined) {
        throw new Error(`Internal compiler error: missing field "${name}".`);
      }
      return buildFieldDefinition(candidate, uiSchema.fields.get(name));
    }),
  };
}

function buildFieldDefinition(
  candidate: FieldCandidate,
  ui: ParsedFieldUi | undefined,
): FieldDefinition {
  const base = {
    key: candidate.name,
    name: candidate.name,
    path: [candidate.name] as const,
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
