export const REFERENCE_DIALECT = 'https://json-schema.org/draft/2020-12/schema';

export const KNOWN_IGNORABLE_KEYWORDS = new Set([
  '$comment',
  'deprecated',
  'readOnly',
  'writeOnly',
  'examples',
  'format',
  'contentEncoding',
  'contentMediaType',
  'contentSchema',
]);

export const KNOWN_DRAFT_2020_12_KEYWORDS = new Set([
  '$schema',
  '$id',
  '$vocabulary',
  '$anchor',
  '$dynamicAnchor',
  '$ref',
  '$dynamicRef',
  '$defs',
  '$comment',
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
  'allOf',
  'anyOf',
  'oneOf',
  'not',
  'unevaluatedItems',
  'unevaluatedProperties',
  'type',
  'enum',
  'const',
  'multipleOf',
  'maximum',
  'exclusiveMaximum',
  'minimum',
  'exclusiveMinimum',
  'maxLength',
  'minLength',
  'pattern',
  'maxItems',
  'minItems',
  'uniqueItems',
  'maxContains',
  'minContains',
  'maxProperties',
  'minProperties',
  'required',
  'dependentRequired',
  'title',
  'description',
  'default',
  'deprecated',
  'readOnly',
  'writeOnly',
  'examples',
  'format',
  'contentEncoding',
  'contentMediaType',
  'contentSchema',
]);

export const ROOT_SUPPORTED_KEYWORDS = new Set([
  '$schema',
  'type',
  'properties',
  'required',
  'title',
  'description',
]);

export const SHARED_FIELD_KEYWORDS = new Set([
  'type',
  'title',
  'description',
  'default',
]);

export const STRING_FIELD_KEYWORDS = new Set([
  ...SHARED_FIELD_KEYWORDS,
  'minLength',
  'maxLength',
  'pattern',
]);

export const NUMBER_FIELD_KEYWORDS = new Set([
  ...SHARED_FIELD_KEYWORDS,
  'minimum',
  'maximum',
  'multipleOf',
]);

export const BOOLEAN_FIELD_KEYWORDS = SHARED_FIELD_KEYWORDS;

export const COMPILER_SUPPORTED_KEYWORDS = new Set([
  ...ROOT_SUPPORTED_KEYWORDS,
  ...STRING_FIELD_KEYWORDS,
  ...NUMBER_FIELD_KEYWORDS,
]);
