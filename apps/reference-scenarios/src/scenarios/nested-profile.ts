import type { ReferenceScenarioAuthoring } from '../contracts.js';
import { isRecord, issue, result } from './validation.js';

export const nestedProfile = {
  id: 'nested-profile',
  title: 'Nested profile materialization',
  summary:
    'Shows deep fields, missing-ancestor materialization and atomic blocking by an incompatible ancestor.',
  features: ['nested-objects'],
  compileInput: {
    schema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        profile: {
          type: 'object',
          title: 'Profile',
          properties: {
            displayName: { type: 'string', title: 'Display name' },
            address: {
              type: 'object',
              title: 'Address',
              properties: {
                city: { type: 'string', title: 'City' },
                postalCode: { type: 'string', title: 'Postal code' },
              },
            },
          },
        },
      },
    },
    uiSchema: {
      fields: {
        profile: {
          label: 'User profile',
          order: ['displayName', 'address'],
          fields: {
            address: {
              label: 'Postal address',
              order: ['city', 'postalCode'],
            },
          },
        },
      },
    },
  },
  initialState: {
    value: {},
    baselineValue: {},
    locale: 'en',
    validationVisibility: 'touched',
  },
  validator: {
    validate(_schema: unknown, value: unknown) {
      if (!isRecord(value)) return result([issue('root-object', [])]);
      if (value.profile !== undefined && !isRecord(value.profile)) {
        return result([issue('profile-object', ['profile'], 'type')]);
      }
      return result([]);
    },
  },
  transitions: [
    {
      id: 'materialize-city',
      action: 'Enter a city while profile and address are both missing.',
      decision: 'confirm',
      operation: {
        type: 'set-value',
        path: ['profile', 'address', 'city'],
        expected: { kind: 'missing' },
        value: 'Barcelona',
      },
      expected: {
        value: { profile: { address: { city: 'Barcelona' } } },
        baselineValue: {},
        dirty: true,
        valid: true,
        issues: [],
      },
    },
    {
      id: 'replace-with-incompatible-ancestor',
      action: 'Apply an external update that replaces profile with a scalar.',
      decision: 'external-update',
      expected: {
        value: { profile: 'blocked' },
        baselineValue: {},
        dirty: true,
        valid: false,
        issues: [
          { code: 'profile-object', path: ['profile'], keyword: 'type' },
        ],
      },
    },
    {
      id: 'block-deep-update',
      action:
        'Attempt to confirm a city update through the incompatible profile value.',
      decision: 'confirm',
      operation: {
        type: 'set-value',
        path: ['profile', 'address', 'city'],
        expected: { kind: 'missing' },
        value: 'Valencia',
      },
      expected: {
        value: { profile: 'blocked' },
        baselineValue: {},
        dirty: true,
        valid: false,
        issues: [
          { code: 'profile-object', path: ['profile'], keyword: 'type' },
        ],
      },
    },
  ],
  explanation: [
    {
      id: 'deep-materialization',
      title: 'Missing ancestors can be materialized',
      body: 'A strict set-value operation can build missing plain-object ancestors along a managed path.',
    },
    {
      id: 'incompatible-ancestor',
      title: 'Incompatible ancestors block atomically',
      body: 'A present non-object ancestor is never overwritten implicitly; the application keeps its current root.',
    },
  ],
} satisfies ReferenceScenarioAuthoring;
