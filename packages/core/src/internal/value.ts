export type ActualType =
  | 'null'
  | 'array'
  | 'object'
  | 'string'
  | 'number'
  | 'boolean'
  | 'undefined'
  | 'bigint'
  | 'symbol'
  | 'function';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function actualType(value: unknown): ActualType {
  if (value === null) {
    return 'null';
  }

  if (Array.isArray(value)) {
    return 'array';
  }

  return typeof value;
}

export function describeActualValue(
  value: unknown,
): Readonly<Record<string, unknown>> {
  const type = actualType(value);
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value))
  ) {
    return { actualType: type, actualValue: value };
  }

  return { actualType: type };
}

export function describeDeclaredDialect(value: unknown): unknown {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value))
  ) {
    return value;
  }

  return { type: actualType(value) };
}
