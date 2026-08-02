// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import {
  Ajv2020,
  type ErrorObject,
  type ValidateFunction,
} from 'ajv/dist/2020.js';
import type {
  DataPath,
  SchemaValidator,
  ValidationIssue,
  ValidationResult,
} from '@rabassoft/schema-engine';
import { selectedFormats } from './formats.js';

const EMPTY_ISSUES = Object.freeze([]) as readonly ValidationIssue[];

export function createAjvSchemaValidator(): SchemaValidator {
  const ajv = new Ajv2020({
    addUsedSchema: false,
    allErrors: true,
    logger: false,
    strict: false,
    validateFormats: true,
  });
  for (const format of ['email', 'date', 'date-time'] as const) {
    ajv.addFormat(format, selectedFormats[format]);
  }
  const objectCache = new WeakMap<object, ValidateFunction>();
  let trueSchema: ValidateFunction | undefined;
  let falseSchema: ValidateFunction | undefined;

  function compile(schema: unknown): ValidateFunction {
    if (schema === true) {
      trueSchema ??= compileSynchronous(ajv, true);
      return trueSchema;
    }
    if (schema === false) {
      falseSchema ??= compileSynchronous(ajv, false);
      return falseSchema;
    }
    if (typeof schema === 'object' && schema !== null) {
      const cached = objectCache.get(schema);
      if (cached !== undefined) return cached;
      const compiled = compileSynchronous(ajv, schema);
      objectCache.set(schema, compiled);
      return compiled;
    }
    return compileSynchronous(ajv, schema);
  }

  return Object.freeze({
    validate(schema: unknown, value: unknown): ValidationResult {
      const validate = compile(schema);
      const valid = validate(value);
      if (valid) {
        return Object.freeze({ valid: true, issues: EMPTY_ISSUES });
      }
      const issues = Object.freeze(
        (validate.errors ?? []).map((error) => normalizeIssue(error, value)),
      );
      return Object.freeze({ valid: false, issues });
    },
  });
}

function compileSynchronous(ajv: Ajv2020, schema: unknown): ValidateFunction {
  const compiled = ajv.compile(schema as never);
  if ('$async' in compiled && compiled.$async === true) {
    throw new TypeError(
      'Asynchronous JSON Schema validation is not supported.',
    );
  }
  return compiled;
}

function normalizeIssue(error: ErrorObject, value: unknown): ValidationIssue {
  const path = [...decodeDataPath(error.instancePath, value)];
  const property = reportedProperty(error);
  if (property !== undefined) path.push(property);

  return Object.freeze({
    code: error.keyword,
    path: Object.freeze(path),
    keyword: error.keyword,
    parameters: deepFrozenCopy(error.params),
    ...(error.message === undefined ? {} : { fallbackMessage: error.message }),
  });
}

function reportedProperty(error: ErrorObject): string | undefined {
  if (error.keyword === 'required') {
    return stringParameter(error.params, 'missingProperty');
  }
  if (error.keyword === 'additionalProperties') {
    return stringParameter(error.params, 'additionalProperty');
  }
  if (error.keyword === 'unevaluatedProperties') {
    return stringParameter(error.params, 'unevaluatedProperty');
  }
  return undefined;
}

function stringParameter(
  parameters: Record<string, unknown>,
  name: string,
): string | undefined {
  const value = parameters[name];
  return typeof value === 'string' ? value : undefined;
}

function decodeDataPath(pointer: string, value: unknown): DataPath {
  if (pointer === '') return Object.freeze([]);
  const path: (string | number)[] = [];
  let current = value;
  for (const encoded of pointer.split('/').slice(1)) {
    const segment = encoded.replaceAll('~1', '/').replaceAll('~0', '~');
    const pathSegment =
      Array.isArray(current) && /^(?:0|[1-9]\d*)$/.test(segment)
        ? Number(segment)
        : segment;
    path.push(pathSegment);
    current = ownDataValue(current, pathSegment);
  }
  return Object.freeze(path);
}

function ownDataValue(container: unknown, key: string | number): unknown {
  if (
    (typeof container !== 'object' || container === null) &&
    typeof container !== 'function'
  ) {
    return undefined;
  }
  const descriptor = Object.getOwnPropertyDescriptor(container, key);
  return descriptor !== undefined && 'value' in descriptor
    ? descriptor.value
    : undefined;
}

function deepFrozenCopy(
  value: Record<string, unknown>,
): Readonly<Record<string, unknown>> {
  return copyContainer(value) as Readonly<Record<string, unknown>>;
}

function copyContainer(value: unknown): unknown {
  if (Array.isArray(value)) {
    return Object.freeze(value.map((entry) => copyContainer(entry)));
  }
  if (typeof value === 'object' && value !== null) {
    const copy: Record<string, unknown> = {};
    for (const key of Object.keys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (descriptor !== undefined && 'value' in descriptor) {
        copy[key] = copyContainer(descriptor.value);
      }
    }
    return Object.freeze(copy);
  }
  return value;
}
