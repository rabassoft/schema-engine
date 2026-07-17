import type { ReferenceScenarioAuthoring } from '../contracts.js';
import { isRecord, issue, result } from './validation.js';

const baseline = {
  displayName: 'Ada',
  email: 'ada@example.test',
  newsletter: true,
};

export const presentationSections = {
  id: 'presentation-sections',
  title: 'Static presentation sections',
  summary:
    'Groups root fields in nested static sections without owning or changing controlled value shape.',
  features: ['presentation-groups'],
  compileInput: {
    schema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        displayName: { type: 'string', title: 'Display name' },
        email: { type: 'string', title: 'Email' },
        newsletter: { type: 'boolean', title: 'Newsletter' },
      },
    },
    uiSchema: {
      presentation: [
        {
          kind: 'section',
          id: 'identity',
          label: 'Identity',
          children: [
            'displayName',
            {
              kind: 'section',
              id: 'contact',
              label: 'Contact preferences',
              children: ['email', 'newsletter'],
            },
          ],
        },
      ],
      fields: {
        email: { description: 'Used only for this demonstration.' },
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
      if (!isRecord(value)) return result([issue('root-object', [])]);
      if (typeof value.email !== 'string' || !value.email.includes('@')) {
        return result([issue('email-shape', ['email'], 'format')]);
      }
      return result([]);
    },
  },
  transitions: [
    {
      id: 'change-email',
      action: 'Change the email rendered inside the nested contact section.',
      decision: 'confirm',
      operation: {
        type: 'set-value',
        path: ['email'],
        expected: { kind: 'value', value: 'ada@example.test' },
        value: 'ada@rabassoft.test',
      },
      expected: {
        value: { ...baseline, email: 'ada@rabassoft.test' },
        baselineValue: baseline,
        dirty: true,
        valid: true,
        issues: [],
      },
    },
  ],
  explanation: [
    {
      id: 'presentation-only',
      title: 'Presentation does not own data',
      body: 'Static sections reorder and label existing nodes while the complete controlled root remains unchanged in shape.',
    },
  ],
} satisfies ReferenceScenarioAuthoring;
