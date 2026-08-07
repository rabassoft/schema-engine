import type { ReferenceScenarioAuthoring } from '../contracts.js';
import { isRecord, issue, result } from './validation.js';

const initialValue = {
  pet: {
    kind: 'cat',
    name: 'Milo',
    lives: 9,
    catDetails: { indoor: true },
    barkVolume: 3,
  },
};

export const discriminatedObjectAlternatives = {
  id: 'discriminated-object-alternatives',
  title: 'Controlled object alternatives',
  summary:
    'Shows an application-controlled discriminator, common fields, active nested branch fields and dormant data restoration.',
  features: ['discriminated-object-alternatives'],
  compileInput: {
    schema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        pet: {
          type: 'object',
          title: 'Pet',
          properties: {
            kind: { type: 'string', title: 'Kind', enum: ['cat', 'dog'] },
            name: { type: 'string', title: 'Name' },
          },
          required: ['kind', 'name'],
          oneOf: [
            {
              type: 'object',
              properties: {
                kind: { type: 'string', const: 'cat' },
                lives: { type: 'integer', title: 'Lives' },
                catDetails: {
                  type: 'object',
                  title: 'Cat details',
                  properties: {
                    indoor: { type: 'boolean', title: 'Indoor cat' },
                  },
                },
              },
              required: ['kind', 'lives'],
            },
            {
              type: 'object',
              properties: {
                kind: { type: 'string', const: 'dog' },
                barkVolume: { type: 'number', title: 'Bark volume' },
              },
              required: ['kind'],
            },
          ],
        },
      },
    },
    uiSchema: {
      fields: {
        pet: {
          order: ['kind', 'name', 'lives', 'catDetails', 'barkVolume'],
          fields: {
            kind: {
              description:
                'Controls which branch is rendered. Values from the inactive branch stay dormant in application-owned State and return when reselected.',
              enumLabels: { cat: 'Cat', dog: 'Dog' },
            },
            catDetails: { fields: { indoor: { label: 'Lives indoors' } } },
          },
        },
      },
    },
  },
  initialState: {
    value: initialValue,
    baselineValue: initialValue,
    locale: 'en',
    validationVisibility: 'all',
  },
  validator: {
    validate(_schema: unknown, value: unknown) {
      if (!isRecord(value) || !isRecord(value.pet)) {
        return result([issue('pet-object', ['pet'], 'type')]);
      }
      return result(
        typeof value.pet.barkVolume === 'number' && value.pet.barkVolume > 10
          ? [issue('bark-volume', ['pet', 'barkVolume'], 'maximum')]
          : [],
      );
    },
  },
  transitions: [
    {
      id: 'select-dog',
      action: 'Select Dog and confirm the discriminator intention.',
      decision: 'confirm',
      operation: {
        type: 'set-value',
        path: ['pet', 'kind'],
        expected: { kind: 'value', value: 'cat' },
        value: 'dog',
      },
      expected: {
        value: { pet: { ...initialValue.pet, kind: 'dog' } },
        baselineValue: initialValue,
        dirty: true,
        valid: true,
        issues: [],
      },
    },
    {
      id: 'edit-dog-branch',
      action: 'Edit the active dog-only value.',
      decision: 'confirm',
      operation: {
        type: 'set-value',
        path: ['pet', 'barkVolume'],
        expected: { kind: 'value', value: 3 },
        value: 12,
      },
      expected: {
        value: { pet: { ...initialValue.pet, kind: 'dog', barkVolume: 12 } },
        baselineValue: initialValue,
        dirty: true,
        valid: false,
        issues: [
          {
            code: 'bark-volume',
            path: ['pet', 'barkVolume'],
            keyword: 'maximum',
          },
        ],
      },
    },
    {
      id: 'restore-cat',
      action: 'Reselect Cat and restore its dormant nested values.',
      decision: 'confirm',
      operation: {
        type: 'set-value',
        path: ['pet', 'kind'],
        expected: { kind: 'value', value: 'dog' },
        value: 'cat',
      },
      expected: {
        value: { pet: { ...initialValue.pet, barkVolume: 12 } },
        baselineValue: initialValue,
        dirty: true,
        valid: false,
        issues: [
          {
            code: 'bark-volume',
            path: ['pet', 'barkVolume'],
            keyword: 'maximum',
          },
        ],
      },
    },
  ],
  explanation: [
    {
      id: 'application-owned-selection',
      title: 'Selection remains controlled',
      body: 'The discriminator emits an ordinary intention; only application confirmation changes the active branch.',
    },
    {
      id: 'dormant-values',
      title: 'Inactive branch data remains dormant',
      body: 'Selecting Dog hides Lives and Cat details but State intentionally retains them. Changing alternatives filters normalized snapshots without clearing values owned by the application.',
    },
  ],
} satisfies ReferenceScenarioAuthoring;
