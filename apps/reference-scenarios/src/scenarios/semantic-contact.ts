import type { ReferenceScenarioAuthoring } from '../contracts.js';
import { isRecord, issue, result } from './validation.js';

const baseline = {
  email: 'ada@example.com',
  birthDate: '1815-12-10',
  publishedAt: '1843-01-01T12:00:00Z',
};

export const semanticContact = {
  id: 'semantic-contact',
  title: 'Semantic contact formats',
  summary:
    'Demonstrates neutral email, full-date and timezone-bearing date-time metadata with official validation.',
  features: ['semantic-formats'],
  compileInput: {
    schema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        email: { type: 'string', title: 'Email', format: 'email' },
        birthDate: {
          type: 'string',
          title: 'Birth date',
          format: 'date',
        },
        publishedAt: {
          type: 'string',
          title: 'Published at',
          description: 'RFC 3339 date-time with an explicit timezone.',
          format: 'date-time',
        },
      },
      required: ['email', 'birthDate', 'publishedAt'],
    },
    uiSchema: {
      order: ['email', 'birthDate', 'publishedAt'],
      fields: {
        email: { placeholder: 'person@example.com' },
        birthDate: { hint: 'Choose a canonical full date.' },
        publishedAt: {
          placeholder: '2026-07-30T12:34:56Z',
          hint: 'Kept as text so an RFC 3339 timezone is never discarded.',
        },
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
      if (
        typeof value.email !== 'string' ||
        !/^[^@\s]+@[^@\s]+\.[^@\s]+$/u.test(value.email)
      ) {
        return result([issue('format', ['email'], 'format')]);
      }
      return result([]);
    },
  },
  transitions: [
    {
      id: 'invalidate-email-format',
      action: 'Enter an invalid email and confirm the emitted string.',
      decision: 'confirm',
      operation: {
        type: 'set-value',
        path: ['email'],
        expected: { kind: 'value', value: 'ada@example.com' },
        value: 'invalid-email',
      },
      expected: {
        value: { ...baseline, email: 'invalid-email' },
        baselineValue: baseline,
        dirty: true,
        valid: false,
        issues: [{ code: 'format', path: ['email'], keyword: 'format' }],
      },
    },
    {
      id: 'repair-email-format',
      action: 'Enter a valid email and confirm the emitted string.',
      decision: 'confirm',
      operation: {
        type: 'set-value',
        path: ['email'],
        expected: { kind: 'value', value: 'invalid-email' },
        value: 'grace@example.com',
      },
      expected: {
        value: { ...baseline, email: 'grace@example.com' },
        baselineValue: baseline,
        dirty: true,
        valid: true,
        issues: [],
      },
    },
  ],
  explanation: [
    {
      id: 'neutral-format',
      title: 'Neutral semantic metadata',
      body: 'Core normalizes the selected format while each target owns its native projection.',
    },
    {
      id: 'replaceable-assertion',
      title: 'Replaceable validation authority',
      body: 'The reference shells use the reusable Ajv integration; browser validity never replaces runtime issues.',
    },
    {
      id: 'timezone-fidelity',
      title: 'Timezone-preserving date-time',
      body: 'Date-time remains textual because datetime-local cannot represent the required RFC 3339 timezone.',
    },
  ],
} satisfies ReferenceScenarioAuthoring;
