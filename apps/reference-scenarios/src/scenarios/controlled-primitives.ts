import type { ValidationIssue } from '@rabassoft/schema-engine';

import type { ReferenceScenarioAuthoring } from '../contracts.js';
import { isRecord, issue, result } from './validation.js';

const initialValue = {
  name: 'Ada',
  age: 37,
  score: 9.5,
  active: true,
  role: 'admin',
};

export const controlledPrimitives = {
  id: 'controlled-primitives',
  title: 'Controlled primitive fields',
  summary:
    'Shows application-owned primitive values, validation, locale and explicit decisions.',
  features: [
    'controlled-state',
    'primitive-fields',
    'string-enum',
    'explicit-clear',
    'validation',
    'locale',
  ],
  compileInput: {
    schema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        name: { type: 'string', title: 'Name', minLength: 1 },
        age: { type: 'integer', title: 'Age', minimum: 0 },
        score: {
          type: 'number',
          title: 'Score',
          minimum: 0,
          maximum: 10,
          multipleOf: 0.5,
        },
        active: { type: 'boolean', title: 'Active' },
        role: {
          type: 'string',
          title: 'Role',
          enum: ['admin', 'editor', 'viewer'],
        },
      },
      required: ['name', 'age', 'active'],
    },
    uiSchema: {
      order: ['name', 'role', 'age', 'score', 'active'],
      fields: {
        name: { description: 'A required display name.' },
        role: {
          enumLabels: {
            admin: 'Administrator',
            editor: 'Editor',
            viewer: 'Viewer',
          },
        },
        score: { options: { decimalPlaces: 1, showTrailingZeros: true } },
      },
    },
  },
  initialState: {
    value: initialValue,
    baselineValue: initialValue,
    locale: 'en',
    validationVisibility: 'touched',
  },
  validator: {
    validate(_schema: unknown, value: unknown) {
      const issues: ValidationIssue[] = [];
      if (!isRecord(value)) return result([issue('root-object', [])]);
      if (typeof value.name !== 'string' || value.name.trim().length === 0) {
        issues.push(issue('required', ['name'], 'minLength'));
      }
      if (
        typeof value.age !== 'number' ||
        !Number.isInteger(value.age) ||
        value.age < 0
      ) {
        issues.push(issue('non-negative-integer', ['age'], 'minimum'));
      }
      if (
        value.role !== undefined &&
        value.role !== 'admin' &&
        value.role !== 'editor' &&
        value.role !== 'viewer'
      ) {
        issues.push(issue('role-choice', ['role'], 'enum'));
      }
      return result(issues);
    },
  },
  transitions: [
    {
      id: 'confirm-name',
      action: 'Enter Grace and confirm the emitted intention.',
      decision: 'confirm',
      operation: {
        type: 'set-value',
        path: ['name'],
        expected: { kind: 'value', value: 'Ada' },
        value: 'Grace',
      },
      expected: {
        value: { ...initialValue, name: 'Grace' },
        baselineValue: initialValue,
        dirty: true,
        valid: true,
        issues: [],
      },
    },
    {
      id: 'reject-age',
      action: 'Enter a negative age and reject the emitted intention.',
      decision: 'reject',
      operation: {
        type: 'set-value',
        path: ['age'],
        expected: { kind: 'value', value: 37 },
        value: -1,
      },
      expected: {
        value: { ...initialValue, name: 'Grace' },
        baselineValue: initialValue,
        dirty: true,
        valid: true,
        issues: [],
      },
    },
    {
      id: 'pending-clear-role',
      action:
        'Queue role clearing as pending, then confirm that exact intention.',
      decision: 'confirm',
      operation: {
        type: 'remove-value',
        path: ['role'],
        expected: { kind: 'value', value: 'admin' },
      },
      expected: {
        value: { name: 'Grace', age: 37, score: 9.5, active: true },
        baselineValue: initialValue,
        dirty: true,
        valid: true,
        issues: [],
      },
    },
    {
      id: 'commit-baseline',
      action:
        'Commit the complete current value as the new application baseline.',
      decision: 'external-update',
      expected: {
        value: { name: 'Grace', age: 37, score: 9.5, active: true },
        baselineValue: { name: 'Grace', age: 37, score: 9.5, active: true },
        dirty: false,
        valid: true,
        issues: [],
      },
    },
  ],
  explanation: [
    {
      id: 'application-ownership',
      title: 'Application-owned state',
      body: 'The shell decides whether each emitted operation changes its complete value root.',
    },
    {
      id: 'clear-is-removal',
      title: 'Explicit clearing',
      body: 'Clearing an optional field is represented as a remove-value intention, not an empty fallback.',
    },
  ],
} satisfies ReferenceScenarioAuthoring;
