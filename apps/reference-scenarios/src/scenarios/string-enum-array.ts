import type { ValidationIssue } from '@rabassoft/schema-engine';

import type { ReferenceScenarioAuthoring } from '../contracts.js';
import { isRecord, issue, result } from './validation.js';

const choices = new Set(['', ' ', 'reader', 'editor', 'reviewer', '💡']);
const initialValue = Object.freeze({
  profile: Object.freeze({ channels: Object.freeze([]) }),
  showNote: true,
  note: 'Conditional primitive behavior remains unchanged.',
});
const orderedValue = { ...initialValue, roles: ['editor', 'reader'] };
const reorderedValue = { ...initialValue, roles: ['reader', 'editor'] };
const emptyValue = { ...initialValue, roles: [] };
const sparseRoles = Array<unknown>(2);
sparseRoles[0] = 'reader';
Object.freeze(sparseRoles);

export const stringEnumArrayControlStates = Object.freeze([
  Object.freeze({
    id: 'duplicate',
    label: 'Show duplicate values',
    value: Object.freeze({
      ...initialValue,
      roles: Object.freeze(['reader', 'reader']),
    }),
  }),
  Object.freeze({
    id: 'unknown',
    label: 'Show unknown value',
    value: Object.freeze({
      ...initialValue,
      roles: Object.freeze(['unknown']),
    }),
  }),
  Object.freeze({
    id: 'non-string',
    label: 'Show non-string value',
    value: Object.freeze({
      ...initialValue,
      roles: Object.freeze(['reader', 1]),
    }),
  }),
  Object.freeze({
    id: 'sparse',
    label: 'Show sparse value',
    value: Object.freeze({ ...initialValue, roles: sparseRoles }),
  }),
]);

export const stringEnumArray = {
  id: 'string-enum-array',
  title: 'Controlled multiple choices',
  summary:
    'Exercises ordered atomic string-enum arrays without collection identity or optimistic target state.',
  features: ['string-enum-array'],
  compileInput: {
    schema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        roles: {
          type: 'array',
          title: 'Assigned roles',
          description: 'Optional direct ordered multiple choice.',
          items: {
            type: 'string',
            enum: ['', ' ', 'reader', 'editor', 'reviewer', '💡'],
          },
          uniqueItems: true,
        },
        profile: {
          type: 'object',
          title: 'Notification profile',
          properties: {
            channels: {
              type: 'array',
              title: 'Required channels',
              items: {
                type: 'string',
                enum: ['', ' ', 'reader', 'editor', 'reviewer', '💡'],
              },
              uniqueItems: true,
            },
          },
          required: ['channels'],
        },
        showNote: { type: 'boolean', title: 'Show compatibility note' },
        note: { type: 'string', title: 'Compatibility note' },
      },
      required: ['profile', 'showNote'],
    },
    uiSchema: {
      order: ['roles', 'profile', 'showNote', 'note'],
      fields: {
        roles: {
          label: 'Assigned roles',
          description:
            'Retained choices keep their confirmed order; new choices append in schema order.',
          hint: 'Clear removes the property; selecting none keeps an empty array.',
          tooltip: 'Atomic multiple choice without collection item identity.',
          enumLabels: {
            '': '(empty string)',
            ' ': '(single space)',
            reader: 'Reader',
            editor: 'Editor',
            reviewer: 'Reviewer',
            '💡': 'Idea',
          },
        },
        profile: {
          fields: {
            channels: {
              label: 'Required channels',
              description:
                'Nested required M31 field, initially present empty.',
              enumLabels: {
                '': '(empty string)',
                ' ': '(single space)',
                reader: 'Reader',
                editor: 'Editor',
                reviewer: 'Reviewer',
                '💡': 'Idea',
              },
            },
          },
        },
        note: {
          visibleWhen: { path: ['showNote'], equals: true },
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
      if (!isRecord(value)) return result([issue('type', [], 'type')]);
      const issues: ValidationIssue[] = [];
      if (Object.hasOwn(value, 'roles')) {
        issues.push(...validateChoices(value.roles, ['roles']));
      }
      if (!isRecord(value.profile)) {
        issues.push(issue('type', ['profile'], 'type'));
      } else if (!Object.hasOwn(value.profile, 'channels')) {
        issues.push(issue('required', ['profile', 'channels'], 'required'));
      } else {
        issues.push(
          ...validateChoices(value.profile.channels, ['profile', 'channels']),
        );
      }
      return result(issues);
    },
  },
  transitions: [
    {
      id: 'construct-ordered-selection',
      action: 'Select Editor and Reader from a missing direct property.',
      decision: 'confirm',
      operation: {
        type: 'set-value',
        path: ['roles'],
        expected: { kind: 'missing' },
        value: ['editor', 'reader'],
      },
      expected: {
        value: orderedValue,
        baselineValue: initialValue,
        dirty: true,
        valid: true,
        issues: [],
      },
    },
    {
      id: 'reject-appended-choice',
      action: 'Request Reviewer and reject the controlled intention.',
      decision: 'reject',
      operation: {
        type: 'set-value',
        path: ['roles'],
        expected: { kind: 'value', value: ['editor', 'reader'] },
        value: ['editor', 'reader', 'reviewer'],
      },
      expected: {
        value: orderedValue,
        baselineValue: initialValue,
        dirty: true,
      },
    },
    {
      id: 'external-reorder',
      action: 'Replace the controlled value with a new external order.',
      decision: 'external-update',
      expected: {
        value: reorderedValue,
        baselineValue: initialValue,
        dirty: true,
        valid: true,
        issues: [],
      },
    },
    {
      id: 'equal-array-no-op',
      action: 'Supply an equal immutable array without changing semantics.',
      decision: 'external-update',
      expected: {
        value: { ...initialValue, roles: ['reader', 'editor'] },
        baselineValue: initialValue,
        dirty: true,
      },
    },
    {
      id: 'reject-clear-direct-selection',
      action: 'Request an explicit clear and reject the controlled intention.',
      decision: 'reject',
      operation: {
        type: 'remove-value',
        path: ['roles'],
        expected: { kind: 'value', value: ['reader', 'editor'] },
      },
      expected: {
        value: reorderedValue,
        baselineValue: initialValue,
        dirty: true,
        valid: true,
        issues: [],
      },
    },
    {
      id: 'external-clear-direct-selection',
      action: 'Confirm removal through the next application-owned root.',
      decision: 'external-update',
      expected: {
        value: initialValue,
        baselineValue: initialValue,
        dirty: false,
        valid: true,
        issues: [],
      },
    },
    {
      id: 'select-nested-blank-values',
      action: 'Select whitespace and Unicode choices in the nested field.',
      decision: 'external-update',
      expected: {
        value: { ...initialValue, profile: { channels: [' ', '💡'] } },
        baselineValue: initialValue,
        dirty: true,
        valid: true,
        issues: [],
      },
    },
    {
      id: 'reject-clear-required-selection',
      action: 'Request removal of the required nested value and reject it.',
      decision: 'reject',
      operation: {
        type: 'remove-value',
        path: ['profile', 'channels'],
        expected: { kind: 'value', value: [' ', '💡'] },
      },
      expected: {
        value: { ...initialValue, profile: { channels: [' ', '💡'] } },
        baselineValue: initialValue,
        dirty: true,
        valid: true,
        issues: [],
      },
    },
    {
      id: 'external-clear-required-selection',
      action: 'Confirm removal externally and retain the required issue.',
      decision: 'external-update',
      expected: {
        value: { ...initialValue, profile: {} },
        baselineValue: initialValue,
        dirty: true,
        valid: false,
        issues: [
          {
            code: 'required',
            path: ['profile', 'channels'],
            keyword: 'required',
          },
        ],
      },
    },
    {
      id: 'restore-empty-and-confirm-baseline',
      action: 'Restore a present empty direct value and confirm its baseline.',
      decision: 'external-update',
      expected: {
        value: emptyValue,
        baselineValue: emptyValue,
        dirty: false,
        valid: true,
        issues: [],
      },
    },
    {
      id: 'external-duplicate',
      action: 'Retain an externally supplied duplicate array unchanged.',
      decision: 'external-update',
      expected: {
        value: { ...initialValue, roles: ['reader', 'reader'] },
        baselineValue: emptyValue,
        dirty: true,
        valid: false,
        issues: [
          { code: 'uniqueItems', path: ['roles'], keyword: 'uniqueItems' },
        ],
      },
    },
    {
      id: 'external-unknown',
      action: 'Retain an externally supplied out-of-enum string unchanged.',
      decision: 'external-update',
      expected: {
        value: { ...initialValue, roles: ['unknown'] },
        baselineValue: emptyValue,
        dirty: true,
        valid: false,
        issues: [{ code: 'enum', path: ['roles', 0], keyword: 'enum' }],
      },
    },
    {
      id: 'external-non-string',
      action: 'Retain an externally supplied non-string member unchanged.',
      decision: 'external-update',
      expected: {
        value: { ...initialValue, roles: ['reader', 1] },
        baselineValue: emptyValue,
        dirty: true,
        valid: false,
        issues: [{ code: 'type', path: ['roles', 1], keyword: 'type' }],
      },
    },
    {
      id: 'restore-initial-state',
      action: 'Restore the original missing/empty controlled roots.',
      decision: 'external-update',
      expected: {
        value: initialValue,
        baselineValue: initialValue,
        dirty: false,
        valid: true,
        issues: [],
      },
    },
  ],
  explanation: [
    {
      id: 'atomic-field',
      title: 'Atomic ordered field',
      body: 'The array is one field value. It has no item identity, item operations or partial choice scope.',
    },
    {
      id: 'controlled-selection',
      title: 'Controlled selection',
      body: 'The renderer requests a complete ordered candidate and immediately returns to the last application-confirmed snapshot.',
    },
    {
      id: 'external-truth',
      title: 'External truth remains visible',
      body: 'Duplicate, unknown, non-string and sparse data remain authoritative while native selection is unavailable and clear stays explicit.',
    },
  ],
} satisfies ReferenceScenarioAuthoring;

function validateChoices(
  value: unknown,
  path: readonly string[],
): readonly ValidationIssue[] {
  if (!Array.isArray(value)) return [issue('type', path, 'type')];
  const issues: ValidationIssue[] = [];
  const seen = new Set<string>();
  for (let index = 0; index < value.length; index += 1) {
    const member = Object.getOwnPropertyDescriptor(value, index);
    if (member === undefined || !('value' in member)) {
      issues.push(issue('type', [...path, index], 'type'));
      continue;
    }
    if (typeof member.value !== 'string') {
      issues.push(issue('type', [...path, index], 'type'));
      continue;
    }
    if (!choices.has(member.value)) {
      issues.push(issue('enum', [...path, index], 'enum'));
    }
    if (seen.has(member.value)) {
      issues.push(issue('uniqueItems', path, 'uniqueItems'));
      break;
    }
    seen.add(member.value);
  }
  return issues;
}
