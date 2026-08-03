import type { ValidationIssue } from '@rabassoft/schema-engine';

import type { ReferenceScenarioAuthoring } from '../contracts.js';
import { isRecord, issue, result } from './validation.js';

const baseline = {
  displayName: 'Ada Lovelace',
  contactEmail: 'ada@example.com',
  department: 'Research',
  active: true,
};

export const objectComposition = {
  id: 'object-composition',
  title: 'Static object composition',
  summary:
    'Combines a reusable identity contribution with inline account fields while preserving application-owned state.',
  features: ['object-composition'],
  compileInput: {
    schema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      $defs: {
        identity: {
          type: 'object',
          properties: {
            displayName: {
              type: 'string',
              title: 'Display name',
              minLength: 2,
            },
            contactEmail: {
              type: 'string',
              title: 'Contact email',
              format: 'email',
            },
          },
          required: ['displayName'],
        },
      },
      type: 'object',
      allOf: [
        { $ref: '#/$defs/identity' },
        {
          type: 'object',
          properties: {
            department: {
              type: 'string',
              title: 'Department',
              minLength: 2,
            },
            active: { type: 'boolean', title: 'Active' },
          },
          required: ['department'],
        },
      ],
    },
    uiSchema: {
      order: ['department', 'displayName', 'contactEmail', 'active'],
      fields: {
        department: {
          description: 'Required by the inline contribution.',
        },
        displayName: {
          description: 'Required by the referenced identity contribution.',
        },
        contactEmail: { placeholder: 'name@example.com' },
      },
    },
  },
  initialState: {
    value: baseline,
    baselineValue: baseline,
    locale: 'en',
    validationVisibility: 'touched',
  },
  validator: {
    validate(_schema: unknown, value: unknown) {
      const issues: ValidationIssue[] = [];
      if (!isRecord(value)) return result([issue('root-object', [])]);
      if (
        typeof value.displayName !== 'string' ||
        value.displayName.length < 2
      ) {
        issues.push(issue('display-name-length', ['displayName'], 'minLength'));
      }
      if (typeof value.department !== 'string' || value.department.length < 2) {
        issues.push(issue('department-length', ['department'], 'minLength'));
      }
      return result(issues);
    },
  },
  transitions: [
    {
      id: 'invalidate-department',
      action: 'Shorten the inline department value below its minimum length.',
      decision: 'confirm',
      operation: {
        type: 'set-value',
        path: ['department'],
        expected: { kind: 'value', value: 'Research' },
        value: 'R',
      },
      expected: {
        value: { ...baseline, department: 'R' },
        baselineValue: baseline,
        dirty: true,
        valid: false,
        issues: [
          {
            code: 'department-length',
            path: ['department'],
            keyword: 'minLength',
          },
        ],
      },
    },
    {
      id: 'repair-department',
      action: 'Repair the inline department value.',
      decision: 'confirm',
      operation: {
        type: 'set-value',
        path: ['department'],
        expected: { kind: 'value', value: 'R' },
        value: 'Engineering',
      },
      expected: {
        value: { ...baseline, department: 'Engineering' },
        baselineValue: baseline,
        dirty: true,
        valid: true,
        issues: [],
      },
    },
    {
      id: 'rename-referenced-field',
      action: 'Edit a field contributed by the referenced identity schema.',
      decision: 'confirm',
      operation: {
        type: 'set-value',
        path: ['displayName'],
        expected: { kind: 'value', value: 'Ada Lovelace' },
        value: 'Grace Hopper',
      },
      expected: {
        value: {
          ...baseline,
          displayName: 'Grace Hopper',
          department: 'Engineering',
        },
        baselineValue: baseline,
        dirty: true,
        valid: true,
        issues: [],
      },
    },
  ],
  explanation: [
    {
      id: 'bounded-composition',
      title: 'Bounded object composition',
      body: 'The compiler reduces one pure local-reference contribution and one inline object contribution into a single normalized field catalog.',
    },
    {
      id: 'cross-branch-behavior',
      title: 'Combined requiredness and UI order',
      body: 'Required fields from both branches remain required while UI Schema orders all combined fields without exposing composition provenance.',
    },
  ],
} satisfies ReferenceScenarioAuthoring;
