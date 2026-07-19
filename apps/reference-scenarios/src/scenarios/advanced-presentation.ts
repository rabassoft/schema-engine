import type { ReferenceScenarioAuthoring } from '../contracts.js';
import { isRecord, issue, result } from './validation.js';

const baseline = {
  givenName: 'Ada',
  familyName: 'Lovelace',
  email: 'ada@example.test',
  newsletter: true,
  multiFactor: false,
};

export const advancedPresentation = {
  id: 'advanced-presentation',
  title: 'Advanced static presentation',
  summary:
    'Composes a section, nested tabs, independent accordion panels and a logical grid without changing controlled data.',
  features: ['advanced-layout'],
  compileInput: {
    schema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        givenName: { type: 'string', title: 'Given name' },
        familyName: { type: 'string', title: 'Family name' },
        email: { type: 'string', title: 'Email' },
        newsletter: { type: 'boolean', title: 'Newsletter' },
        multiFactor: { type: 'boolean', title: 'Multi-factor authentication' },
      },
    },
    uiSchema: {
      presentation: [
        {
          kind: 'section',
          id: 'workspace',
          label: 'Account workspace',
          children: [
            {
              kind: 'tabs',
              id: 'account-tabs',
              label: 'Account details',
              panels: [
                {
                  kind: 'panel',
                  id: 'identity',
                  label: 'Identity',
                  children: [
                    {
                      kind: 'grid',
                      id: 'identity-grid',
                      label: 'Identity grid',
                      columns: 2,
                      items: [
                        { span: 1, child: 'givenName' },
                        { span: 1, child: 'familyName' },
                      ],
                    },
                  ],
                },
                {
                  kind: 'panel',
                  id: 'contact',
                  label: 'Contact',
                  children: ['email'],
                },
              ],
            },
            {
              kind: 'accordion',
              id: 'preferences',
              label: 'Account preferences',
              panels: [
                {
                  kind: 'panel',
                  id: 'notifications',
                  label: 'Notifications',
                  children: ['newsletter'],
                },
                {
                  kind: 'panel',
                  id: 'security',
                  label: 'Security',
                  children: ['multiFactor'],
                },
              ],
            },
          ],
        },
      ],
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
      if (typeof value.email !== 'string' || !value.email.includes('@'))
        return result([issue('email-shape', ['email'], 'format')]);
      return result([]);
    },
  },
  transitions: [
    {
      id: 'change-contact-email',
      action: 'Change the email while its second tab remains mounted.',
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
      id: 'target-owned-layout',
      title: 'Layout state belongs to the target',
      body: 'Tabs and accordion state remain outside controlled value, operations, validation and persistence.',
    },
    {
      id: 'shared-semantic-input',
      title: 'One neutral scenario, independent targets',
      body: 'Angular and Standard consume the same authored JSON while owning separate components, DOM, styles and lifecycle.',
    },
  ],
} satisfies ReferenceScenarioAuthoring;
