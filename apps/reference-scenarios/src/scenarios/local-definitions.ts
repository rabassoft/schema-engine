import type { ValidationIssue } from '@rabassoft/schema-engine';

import type { ReferenceScenarioAuthoring } from '../contracts.js';
import { isRecord, issue, result } from './validation.js';

const baseline = { primary: 'Ada', secondary: 'Grace' };

export const localDefinitions = {
  id: 'local-definitions',
  title: 'Same-document local definitions',
  summary:
    'Reuses one accepted local $defs target at two independently normalized fields.',
  features: ['local-references'],
  compileInput: {
    schema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      $defs: {
        displayName: { type: 'string', minLength: 2, maxLength: 40 },
      },
      type: 'object',
      properties: {
        primary: { $ref: '#/$defs/displayName' },
        secondary: { $ref: '#/$defs/displayName' },
      },
      required: ['primary'],
    },
    uiSchema: {
      fields: {
        primary: { label: 'Primary name' },
        secondary: { label: 'Secondary name' },
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
      for (const member of ['primary', 'secondary'] as const) {
        const entry = value[member];
        if (
          entry !== undefined &&
          (typeof entry !== 'string' || entry.length < 2)
        ) {
          issues.push(issue('display-name-length', [member], 'minLength'));
        }
      }
      return result(issues);
    },
  },
  transitions: [
    {
      id: 'invalidate-primary',
      action: 'Set the required primary name to one character.',
      decision: 'confirm',
      operation: {
        type: 'set-value',
        path: ['primary'],
        expected: { kind: 'value', value: 'Ada' },
        value: 'A',
      },
      expected: {
        value: { primary: 'A', secondary: 'Grace' },
        baselineValue: baseline,
        dirty: true,
        valid: false,
        issues: [
          {
            code: 'display-name-length',
            path: ['primary'],
            keyword: 'minLength',
          },
        ],
      },
    },
    {
      id: 'repair-primary',
      action: 'Replace the primary name with a valid value.',
      decision: 'confirm',
      operation: {
        type: 'set-value',
        path: ['primary'],
        expected: { kind: 'value', value: 'A' },
        value: 'Alan',
      },
      expected: {
        value: { primary: 'Alan', secondary: 'Grace' },
        baselineValue: baseline,
        dirty: true,
        valid: true,
        issues: [],
      },
    },
  ],
  explanation: [
    {
      id: 'independent-use-sites',
      title: 'One target, independent fields',
      body: 'The Public compiler resolves the same local definition independently at each managed use site.',
    },
  ],
} satisfies ReferenceScenarioAuthoring;
