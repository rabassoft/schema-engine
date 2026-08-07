import type { ReferenceScenarioAuthoring } from '../contracts.js';
import { isRecord, issue, result } from './validation.js';

const initialValue = {
  name: 'Ada',
  email: 'ada@example.test',
  profile: { note: 'Retained nested state' },
  members: [{ id: 'member-1', name: 'Grace' }],
  reviewCode: 'pending',
};

export const linearWizard = {
  id: 'linear-wizard',
  title: 'Controlled linear wizard',
  summary:
    'Exercises application-confirmed navigation, factual step progress, retained nested/collection state and synchronous plus asynchronous gates.',
  features: ['linear-wizard'],
  compileInput: {
    schema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        name: { type: 'string', title: 'Name' },
        email: { type: 'string', title: 'Email' },
        profile: {
          type: 'object',
          title: 'Profile',
          properties: {
            note: { type: 'string', title: 'Profile note' },
          },
          required: ['note'],
        },
        members: {
          type: 'array',
          title: 'Members',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string', title: 'Member name' },
            },
            required: ['id', 'name'],
          },
        },
        reviewCode: {
          type: 'string',
          title: 'Review code',
          minLength: 8,
        },
      },
      required: ['name', 'email', 'profile', 'members', 'reviewCode'],
    },
    uiSchema: {
      presentation: [
        {
          kind: 'wizard',
          id: 'onboarding',
          label: 'Team onboarding',
          steps: [
            {
              kind: 'wizard-step',
              id: 'identity',
              label: 'Identity',
              children: ['name', 'email'],
            },
            {
              kind: 'wizard-step',
              id: 'team',
              label: 'Team',
              children: [
                {
                  kind: 'section',
                  id: 'team-details',
                  label: 'Team details',
                  children: ['profile', 'members'],
                },
              ],
            },
            {
              kind: 'wizard-step',
              id: 'review',
              label: 'Review',
              children: ['reviewCode'],
            },
          ],
        },
      ],
    },
    collectionPolicies: [{ path: ['members'], itemIdentityProperty: 'id' }],
  },
  initialState: {
    value: initialValue,
    baselineValue: initialValue,
    locale: 'en',
    validationVisibility: 'touched',
  },
  validator: {
    validate(_schema: unknown, value: unknown) {
      if (!isRecord(value)) return result([issue('root-object', [])]);
      return result(
        value.reviewCode === 'approved'
          ? []
          : [issue('review-code', ['reviewCode'], 'minLength')],
      );
    },
  },
  serviceValidation: {
    fieldPath: ['email'],
    issue: {
      code: 'email-unavailable',
      keyword: 'remote',
      fallbackMessage: 'The email is not available.',
    },
    labels: {
      heading: 'Wizard service validation',
      settleValid: 'Resolve wizard validation as available',
      settleInvalid: 'Resolve wizard validation as unavailable',
      reject: 'Reject wizard validation request',
      throwNext: 'Throw on next wizard validation',
      retry: 'Retry wizard validation',
    },
  },
  transitions: [
    {
      id: 'application-confirmed-navigation',
      action:
        'Request next and let the application confirm the exact adjacent target.',
      decision: 'external-update',
      expected: {
        value: initialValue,
        baselineValue: initialValue,
        dirty: false,
        valid: false,
        issues: [
          { code: 'review-code', path: ['reviewCode'], keyword: 'minLength' },
        ],
      },
    },
  ],
  explanation: [
    {
      id: 'controlled-navigation',
      title: 'Application-confirmed navigation',
      body: 'Both targets request adjacent navigation through core; the reference application confirms the emitted target and never infers step validity.',
    },
    {
      id: 'retained-steps',
      title: 'Once-mounted steps',
      body: 'Nested presentation and collection controls remain mounted while inactive so local renderer state survives previous and next navigation.',
    },
  ],
} as const satisfies ReferenceScenarioAuthoring<typeof initialValue>;
