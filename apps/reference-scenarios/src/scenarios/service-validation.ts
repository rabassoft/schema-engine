import type { ReferenceScenarioAuthoring } from '../contracts.js';
import { isRecord, issue, result } from './validation.js';

const initialValue = {
  username: 'ada',
  displayName: 'Ada Lovelace',
};

export const serviceValidation = {
  id: 'service-validation',
  title: 'Controlled service validation',
  summary:
    'Exercises deterministic application-owned asynchronous validation without network or timers.',
  features: ['async-validation'],
  compileInput: {
    schema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        username: {
          type: 'string',
          title: 'Username',
          minLength: 3,
        },
        displayName: {
          type: 'string',
          title: 'Display name',
          minLength: 1,
        },
      },
      required: ['username', 'displayName'],
    },
    uiSchema: {
      order: ['username', 'displayName'],
      fields: {
        username: {
          description:
            'A service checks availability after synchronous validation succeeds.',
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
      if (!isRecord(value)) return result([issue('root-object', [])]);
      if (typeof value.username !== 'string' || value.username.length < 3) {
        return result([issue('minLength', ['username'], 'minLength')]);
      }
      if (
        typeof value.displayName !== 'string' ||
        value.displayName.length === 0
      ) {
        return result([issue('minLength', ['displayName'], 'minLength')]);
      }
      return result([]);
    },
  },
  transitions: [
    {
      id: 'change-username',
      action:
        'Enter grace and confirm the operation so a replacement service request starts.',
      decision: 'confirm',
      operation: {
        type: 'set-value',
        path: ['username'],
        expected: { kind: 'value', value: 'ada' },
        value: 'grace',
      },
      expected: {
        value: { ...initialValue, username: 'grace' },
        baselineValue: initialValue,
        dirty: true,
        valid: true,
        issues: [],
      },
    },
  ],
  explanation: [
    {
      id: 'sync-gate',
      title: 'Synchronous gate first',
      body: 'Invalid local data blocks service work; a valid complete value starts one controlled generation.',
    },
    {
      id: 'application-effect',
      title: 'Application-owned effect',
      body: 'The buttons settle deterministic fake service work. They change validation evidence, not the form value; core owns replacement, cancellation and stale-result suppression.',
    },
    {
      id: 'explicit-retry',
      title: 'Explicit retry',
      body: 'A failed generation stays failed until the application requests a retry or publishes a different valid value root.',
    },
  ],
  serviceValidation: {
    fieldPath: ['username'],
    issue: {
      code: 'username-unavailable',
      keyword: 'service',
      fallbackMessage: 'This username is not available.',
    },
    labels: {
      heading: 'Service validation controls',
      settleValid: 'Complete request: username available',
      settleInvalid: 'Complete request: username unavailable',
      reject: 'Fail current request',
      throwNext: 'Make next request throw',
      retry: 'Retry failed validation',
    },
  },
} satisfies ReferenceScenarioAuthoring;
