import type { ReferenceScenarioAuthoring } from '../contracts.js';
import { result } from './validation.js';

const matchingValue: Readonly<Record<string, unknown>> = Object.freeze({
  direct: 'fixed',
  nested: Object.freeze({ code: 0 }),
  team: Object.freeze([Object.freeze({ id: 'ada', label: 'member' })]),
  referenced: false,
  nullable: null,
  email: 'person@example.com',
  empty: '',
  zero: 0,
  negativeZero: -0,
  incompatible: true,
});

export const fixedValueControlStates = Object.freeze([
  Object.freeze({
    id: 'matching',
    label: 'Show matching values',
    value: matchingValue,
  }),
  Object.freeze({
    id: 'mismatch',
    label: 'Show const mismatch',
    value: Object.freeze({ ...matchingValue, direct: 'other' }),
  }),
  Object.freeze({
    id: 'incompatible',
    label: 'Show incompatible value',
    value: Object.freeze({ ...matchingValue, incompatible: 'legacy' }),
  }),
  Object.freeze({
    id: 'blocked',
    label: 'Show incompatible ancestor',
    value: Object.freeze({ ...matchingValue, blockedParent: 'legacy' }),
  }),
]);

export const fixedValues = {
  id: 'fixed-values',
  title: 'Primitive fixed values',
  summary:
    'Demonstrates application-owned primitive const data through static fixed presentation in both reference targets.',
  features: ['fixed-values'],
  compileInput: {
    schema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      $defs: {
        referencedToggle: {
          type: 'boolean',
          title: 'Referenced toggle',
          const: false,
        },
      },
      type: 'object',
      properties: {
        direct: {
          type: 'string',
          title: 'Direct fixed choice',
          enum: ['fixed', 'other'],
          const: 'fixed',
        },
        nested: {
          type: 'object',
          title: 'Nested values',
          properties: {
            code: { type: 'integer', title: 'Nested code', const: 0 },
          },
        },
        team: {
          type: 'array',
          title: 'Fixed team',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              label: { type: 'string', title: 'Member label', const: 'member' },
            },
            required: ['id'],
          },
        },
        referenced: { $ref: '#/$defs/referencedToggle' },
        nullable: {
          type: ['string', 'null'],
          title: 'Nullable fixed value',
          const: null,
        },
        email: {
          type: 'string',
          title: 'Fixed email',
          format: 'email',
          const: 'person@example.com',
        },
        empty: { type: 'string', title: 'Empty string', const: '' },
        zero: { type: 'number', title: 'Zero', const: 0 },
        negativeZero: {
          type: 'number',
          title: 'Negative zero',
          const: -0,
        },
        missing: { type: 'string', title: 'Missing fixed value', const: 'x' },
        incompatible: {
          type: 'boolean',
          title: 'Incompatible fixed value',
          const: true,
        },
        blockedParent: {
          type: 'object',
          title: 'Blocked values',
          properties: {
            child: { type: 'string', title: 'Blocked child', const: 'child' },
          },
        },
      },
    },
    uiSchema: {
      order: [
        'direct',
        'nested',
        'team',
        'referenced',
        'nullable',
        'email',
        'empty',
        'zero',
        'negativeZero',
        'missing',
        'incompatible',
        'blockedParent',
      ],
      fields: {
        team: { item: { order: ['label'] } },
      },
    },
    collectionPolicies: [{ path: ['team'], itemIdentityProperty: 'id' }],
  },
  initialState: {
    value: matchingValue,
    baselineValue: matchingValue,
    locale: 'en',
    validationVisibility: 'all',
  },
  validator: { validate: () => result([]) },
  transitions: fixedValueControlStates.map(({ id, label, value }) => ({
    id: `control-${id}`,
    action: label,
    decision: 'external-update' as const,
    expected: { value, valid: true, issues: [] },
  })),
  explanation: [
    {
      id: 'controlled-fixed-values',
      title: 'Controlled data remains authoritative',
      body: 'Fixed presentation shows the actual application-owned value and never inserts, repairs or emits a mutation.',
    },
    {
      id: 'official-const-assertion',
      title: 'Ajv owns const assertion',
      body: 'A same-kind mismatch remains visible while the official validator reports the const issue.',
    },
    {
      id: 'fixed-state-legend',
      title: 'How to read each fixed row',
      body: 'The left column names the field; the right column shows its actual controlled value. Missing means no property was supplied, unavailable means an ancestor blocks access, and incompatible means the supplied value has the wrong primitive kind.',
    },
  ],
} satisfies ReferenceScenarioAuthoring;
