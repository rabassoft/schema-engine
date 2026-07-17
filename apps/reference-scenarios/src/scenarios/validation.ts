import type {
  ValidationIssue,
  ValidationResult,
} from '@rabassoft/schema-engine';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isUnknownArray(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

export function issue(
  code: string,
  path: readonly (string | number)[],
  keyword?: string,
): ValidationIssue {
  return Object.freeze({
    code,
    path: Object.freeze([...path]),
    ...(keyword === undefined ? {} : { keyword }),
    parameters: Object.freeze({}),
  });
}

export function result(issues: readonly ValidationIssue[]): ValidationResult {
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze([...issues]),
  });
}
