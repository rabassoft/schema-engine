// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

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
  '$defs',
  '$ref',
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
  'const',
  'minLength',
  'maxLength',
  'pattern',
  'enum',
  'format',
]);

export const NUMBER_FIELD_KEYWORDS = new Set([
  ...SHARED_FIELD_KEYWORDS,
  'const',
  'minimum',
  'maximum',
  'multipleOf',
]);

export const BOOLEAN_FIELD_KEYWORDS = new Set([
  ...SHARED_FIELD_KEYWORDS,
  'const',
]);

export const COMPILER_SUPPORTED_KEYWORDS = new Set([
  ...[...ROOT_SUPPORTED_KEYWORDS].filter(
    (keyword) => keyword !== '$defs' && keyword !== '$ref',
  ),
  ...STRING_FIELD_KEYWORDS,
  ...NUMBER_FIELD_KEYWORDS,
]);
