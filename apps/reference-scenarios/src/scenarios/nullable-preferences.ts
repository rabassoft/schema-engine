import type { ValidationIssue } from '@rabassoft/schema-engine';

import type { ReferenceScenarioAuthoring } from '../contracts.js';
import { isRecord, issue, result } from './validation.js';

const baseline = { nickname: null, notifications: false, volume: 5 };

export const nullablePreferences = {
  id: 'nullable-preferences',
  title: 'Nullable preferences',
  summary:
    'Distinguishes missing, null, false, primitive values and explicit clearing for nullable leaves.',
  features: ['nullable-leaves'],
  compileInput: {
    schema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        nickname: { type: ['string', 'null'], title: 'Nickname', minLength: 1 },
        notifications: {
          type: ['boolean', 'null'],
          title: 'Notifications',
        },
        volume: {
          type: ['number', 'null'],
          title: 'Volume',
          minimum: 0,
          maximum: 10,
        },
      },
    },
    uiSchema: {
      order: ['nickname', 'notifications', 'volume'],
      fields: {
        nickname: { placeholder: 'Missing, null or a name' },
        volume: { options: { decimalPlaces: 0, showTrailingZeros: false } },
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
        value.nickname !== undefined &&
        value.nickname !== null &&
        (typeof value.nickname !== 'string' || value.nickname.length === 0)
      ) {
        issues.push(issue('nickname-type', ['nickname'], 'type'));
      }
      if (
        value.notifications !== undefined &&
        value.notifications !== null &&
        typeof value.notifications !== 'boolean'
      ) {
        issues.push(issue('notifications-type', ['notifications'], 'type'));
      }
      if (
        value.volume !== undefined &&
        value.volume !== null &&
        (typeof value.volume !== 'number' ||
          value.volume < 0 ||
          value.volume > 10)
      ) {
        issues.push(issue('volume-range', ['volume'], 'minimum'));
      }
      return result(issues);
    },
  },
  transitions: [
    {
      id: 'set-nickname',
      action: 'Replace explicit null with a string value.',
      decision: 'confirm',
      operation: {
        type: 'set-value',
        path: ['nickname'],
        expected: { kind: 'value', value: null },
        value: 'Ricard',
      },
      expected: {
        value: { nickname: 'Ricard', notifications: false, volume: 5 },
        baselineValue: baseline,
        dirty: true,
        valid: true,
        issues: [],
      },
    },
    {
      id: 'clear-nickname',
      action:
        'Clear the nickname so the member becomes missing rather than null.',
      decision: 'confirm',
      operation: {
        type: 'remove-value',
        path: ['nickname'],
        expected: { kind: 'value', value: 'Ricard' },
      },
      expected: {
        value: { notifications: false, volume: 5 },
        baselineValue: baseline,
        dirty: true,
        valid: true,
        issues: [],
      },
    },
    {
      id: 'null-notifications',
      action: 'Replace the meaningful false value with explicit null.',
      decision: 'confirm',
      operation: {
        type: 'set-value',
        path: ['notifications'],
        expected: { kind: 'value', value: false },
        value: null,
      },
      expected: {
        value: { notifications: null, volume: 5 },
        baselineValue: baseline,
        dirty: true,
        valid: true,
        issues: [],
      },
    },
    {
      id: 'clear-volume',
      action: 'Clear the numeric preference so it becomes missing.',
      decision: 'confirm',
      operation: {
        type: 'remove-value',
        path: ['volume'],
        expected: { kind: 'value', value: 5 },
      },
      expected: {
        value: { notifications: null },
        baselineValue: baseline,
        dirty: true,
        valid: true,
        issues: [],
      },
    },
  ],
  explanation: [
    {
      id: 'presence-states',
      title: 'Missing, null and false are distinct',
      body: 'The controlled root preserves explicit null and false values; clearing removes the member entirely.',
    },
  ],
} satisfies ReferenceScenarioAuthoring;
