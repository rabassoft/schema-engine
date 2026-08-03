import type { ValidationIssue } from '@rabassoft/schema-engine';

import type { ReferenceScenarioAuthoring } from '../contracts.js';
import { isRecord, issue, result } from './validation.js';

const initialValue = {
  enabled: false,
  attempts: 0,
  note: '',
  nullableNote: null,
  rows: [{ id: 'kept', label: 'Existing row' }],
};

export const explicitSchemaDefaults = {
  id: 'explicit-schema-defaults',
  title: 'Explicit schema defaults',
  summary:
    'Derives, cancels and explicitly accepts one application-owned candidate while preserving present values and array barriers.',
  features: ['schema-defaults'],
  compileInput: {
    schema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      $defs: {
        locale: { type: 'string', default: 'en' },
      },
      type: 'object',
      properties: {
        title: { type: 'string', default: 'New entity' },
        enabled: { type: 'boolean', default: true },
        attempts: { type: 'integer', default: 3 },
        note: { type: 'string', default: 'Fallback note' },
        nullableNote: { type: ['string', 'null'], default: 'fallback' },
        locale: { $ref: '#/$defs/locale' },
        profile: {
          type: 'object',
          allOf: [
            {
              type: 'object',
              properties: {
                displayName: { type: 'string', default: 'Ada' },
              },
            },
            {
              type: 'object',
              properties: {
                code: { type: 'string', minLength: 3, default: 'x' },
              },
            },
          ],
        },
        rows: {
          type: 'array',
          default: [{ id: 'default', label: 'Container default' }],
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              label: { type: 'string', default: 'Item default' },
            },
            required: ['id'],
          },
        },
      },
    },
    collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
  },
  initialState: {
    value: initialValue,
    baselineValue: initialValue,
    locale: 'en',
    validationVisibility: 'all',
  },
  validator: {
    validate(_schema: unknown, value: unknown) {
      const issues: ValidationIssue[] = [];
      if (!isRecord(value)) return result([issue('root-object', [])]);
      if (isRecord(value.profile) && value.profile.code === 'x') {
        issues.push(
          issue('profile-code-min-length', ['profile', 'code'], 'minLength'),
        );
      }
      return result(issues);
    },
  },
  transitions: [
    {
      id: 'preserve-present-values',
      action: 'Keep the initial controlled value before candidate derivation.',
      decision: 'external-update',
      expected: {
        baselineValue: initialValue,
        dirty: false,
        valid: true,
        issues: [],
      },
    },
  ],
  explanation: [
    {
      id: 'explicit-acceptance',
      title: 'The application decides',
      body: 'Derivation leaves the controlled value and operation history unchanged. Cancel discards the candidate; accept supplies it as a normal application-owned value.',
    },
    {
      id: 'presence-and-barriers',
      title: 'Presence and arrays are preserved',
      body: 'False, zero, empty string and null remain exact. Missing object ancestors are materialized, while array/container/item defaults remain untouched.',
    },
  ],
  schemaDefaults: {
    labels: {
      heading: 'Explicit schema-default candidate',
      guidance:
        'Derive without changing the form, then cancel or explicitly accept the application-owned candidate.',
      derive: 'Derive candidate',
      cancel: 'Cancel candidate',
      accept: 'Accept candidate',
    },
  },
} satisfies ReferenceScenarioAuthoring;
