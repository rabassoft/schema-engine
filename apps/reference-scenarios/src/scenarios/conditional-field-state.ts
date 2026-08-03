import type { ReferenceScenarioAuthoring } from '../contracts.js';
import { isRecord, issue, result } from './validation.js';

const initialValue = {
  showDetails: true,
  enableRole: true,
  nullableGate: null,
  zeroGate: 0,
  emptyGate: '',
  showDriver: true,
  driver: false,
  displayName: 'Ada',
  role: 'editor',
  nullableNote: 'Null matches explicitly',
  zeroNote: 'Zero matches exactly',
  emptyNote: 'Empty string enables explicitly',
  drivenNote: 'Hidden sources retain controlled truth',
  reviewCode: 'ok',
  profile: {
    flag: false,
    note: 'Nested compound target',
  },
};

const invalidReviewIssue = {
  code: 'review-code',
  path: ['reviewCode'],
  keyword: 'pattern',
} as const;

export const conditionalFieldState = {
  id: 'conditional-field-state',
  title: 'Controlled conditional field state',
  summary:
    'Shows bounded equality-driven visibility and enabled state without changing controlled data, validation or operation ownership.',
  features: ['conditional-field-state'],
  compileInput: {
    schema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        showDetails: { type: 'boolean', title: 'Show details' },
        enableRole: { type: 'boolean', title: 'Enable role' },
        nullableGate: {
          type: ['boolean', 'null'],
          title: 'Nullable gate',
        },
        zeroGate: { type: 'number', title: 'Zero gate' },
        emptyGate: { type: 'string', title: 'Empty gate' },
        showDriver: { type: 'boolean', title: 'Show driver' },
        driver: { type: 'boolean', title: 'Hidden driver' },
        displayName: { type: 'string', title: 'Conditional name' },
        role: {
          type: 'string',
          title: 'Conditional role',
          enum: ['admin', 'editor', 'viewer'],
        },
        nullableNote: { type: 'string', title: 'Nullable match' },
        zeroNote: { type: 'string', title: 'Zero match' },
        emptyNote: { type: 'string', title: 'Empty-string match' },
        drivenNote: { type: 'string', title: 'Hidden-source match' },
        reviewCode: {
          type: 'string',
          title: 'Conditional review code',
          pattern: '^ok$',
        },
        profile: {
          type: 'object',
          title: 'Nested compound profile',
          properties: {
            flag: { type: 'boolean', title: 'Nested condition flag' },
            note: { type: 'string', title: 'Nested compound note' },
          },
        },
      },
      required: [
        'showDetails',
        'enableRole',
        'showDriver',
        'driver',
        'displayName',
        'role',
      ],
    },
    uiSchema: {
      order: [
        'showDetails',
        'enableRole',
        'nullableGate',
        'zeroGate',
        'emptyGate',
        'showDriver',
        'driver',
        'displayName',
        'role',
        'nullableNote',
        'zeroNote',
        'emptyNote',
        'drivenNote',
        'reviewCode',
        'profile',
      ],
      fields: {
        driver: {
          visibleWhen: { path: ['showDriver'], equals: true },
        },
        displayName: {
          description: 'Focus this field before hiding the detail targets.',
          visibleWhen: {
            operator: 'all',
            conditions: [
              { path: ['showDetails'], equals: true },
              { path: ['nullableGate'], equals: null },
              { path: ['zeroGate'], equals: 0 },
              { path: ['emptyGate'], equals: '' },
              { path: ['driver'], equals: false },
            ],
          },
        },
        role: {
          placeholder: 'Select a role',
          enumLabels: {
            admin: 'Administrator',
            editor: 'Editor',
            viewer: 'Viewer',
          },
          enabledWhen: {
            operator: 'any',
            conditions: [
              { path: ['enableRole'], equals: true },
              { path: ['profile', 'flag'], equals: true },
            ],
          },
        },
        nullableNote: {
          visibleWhen: { path: ['nullableGate'], equals: null },
        },
        zeroNote: {
          visibleWhen: { path: ['zeroGate'], equals: 0 },
        },
        emptyNote: {
          enabledWhen: { path: ['emptyGate'], equals: '' },
        },
        drivenNote: {
          visibleWhen: { path: ['driver'], equals: false },
        },
        reviewCode: {
          description:
            'Its validator issue remains authoritative while this field is hidden.',
          visibleWhen: {
            operator: 'all',
            conditions: [
              { path: ['showDetails'], equals: true },
              { path: ['nullableGate'], equals: null },
            ],
          },
        },
        profile: {
          fields: {
            note: {
              visibleWhen: {
                operator: 'all',
                conditions: [
                  { path: ['profile', 'flag'], equals: false },
                  { path: ['zeroGate'], equals: 0 },
                ],
              },
            },
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
      if (!isRecord(value)) return result([issue('root-object', [])]);
      return result(
        value.reviewCode === 'ok'
          ? []
          : [issue('review-code', ['reviewCode'], 'pattern')],
      );
    },
  },
  transitions: [
    {
      id: 'confirm-active-name',
      action: 'Edit the active conditional name and confirm the intention.',
      decision: 'confirm',
      operation: {
        type: 'set-value',
        path: ['displayName'],
        expected: { kind: 'value', value: 'Ada' },
        value: 'Grace',
      },
      expected: {
        value: { ...initialValue, displayName: 'Grace' },
        baselineValue: initialValue,
        dirty: true,
        valid: true,
        issues: [],
      },
    },
    {
      id: 'invalidate-visible-review',
      action: 'Make the optional review target invalid while it is visible.',
      decision: 'confirm',
      operation: {
        type: 'set-value',
        path: ['reviewCode'],
        expected: { kind: 'value', value: 'ok' },
        value: 'needs-review',
      },
      expected: {
        value: {
          ...initialValue,
          displayName: 'Grace',
          reviewCode: 'needs-review',
        },
        baselineValue: initialValue,
        dirty: true,
        valid: false,
        issues: [invalidReviewIssue],
      },
    },
    {
      id: 'hide-detail-targets',
      action:
        'Focus the conditional name, then turn Show details off and keep its invalid sibling authoritative.',
      decision: 'confirm',
      operation: {
        type: 'set-value',
        path: ['showDetails'],
        expected: { kind: 'value', value: true },
        value: false,
      },
      expected: {
        value: {
          ...initialValue,
          showDetails: false,
          displayName: 'Grace',
          reviewCode: 'needs-review',
        },
        baselineValue: initialValue,
        dirty: true,
        valid: false,
        issues: [invalidReviewIssue],
      },
    },
    {
      id: 'reject-hidden-name',
      action: 'Attempt a stale edit against the mounted hidden name.',
      decision: 'reject',
      operation: {
        type: 'set-value',
        path: ['displayName'],
        expected: { kind: 'value', value: 'Grace' },
        value: 'Stale hidden edit',
      },
      expected: {
        value: {
          ...initialValue,
          showDetails: false,
          displayName: 'Grace',
          reviewCode: 'needs-review',
        },
        baselineValue: initialValue,
        dirty: true,
        valid: false,
        issues: [invalidReviewIssue],
      },
    },
    {
      id: 'disable-role',
      action: 'Turn Enable role off while preserving its confirmed value.',
      decision: 'confirm',
      operation: {
        type: 'set-value',
        path: ['enableRole'],
        expected: { kind: 'value', value: true },
        value: false,
      },
      expected: {
        value: {
          ...initialValue,
          showDetails: false,
          enableRole: false,
          displayName: 'Grace',
          reviewCode: 'needs-review',
        },
        baselineValue: initialValue,
        dirty: true,
        valid: false,
        issues: [invalidReviewIssue],
      },
    },
    {
      id: 'reject-disabled-role',
      action: 'Attempt a stale edit against the mounted disabled role.',
      decision: 'reject',
      operation: {
        type: 'set-value',
        path: ['role'],
        expected: { kind: 'value', value: 'editor' },
        value: 'admin',
      },
      expected: {
        value: {
          ...initialValue,
          showDetails: false,
          enableRole: false,
          displayName: 'Grace',
          reviewCode: 'needs-review',
        },
        baselineValue: initialValue,
        dirty: true,
        valid: false,
        issues: [invalidReviewIssue],
      },
    },
    {
      id: 'hide-false-driver',
      action:
        'Hide the false-valued driver while its controlled value keeps the dependent target visible.',
      decision: 'confirm',
      operation: {
        type: 'set-value',
        path: ['showDriver'],
        expected: { kind: 'value', value: true },
        value: false,
      },
      expected: {
        value: {
          ...initialValue,
          showDetails: false,
          enableRole: false,
          showDriver: false,
          displayName: 'Grace',
          reviewCode: 'needs-review',
        },
        baselineValue: initialValue,
        dirty: true,
        valid: false,
        issues: [invalidReviewIssue],
      },
    },
    {
      id: 'restore-details',
      action: 'Turn Show details on and reuse the mounted targets.',
      decision: 'confirm',
      operation: {
        type: 'set-value',
        path: ['showDetails'],
        expected: { kind: 'value', value: false },
        value: true,
      },
      expected: {
        value: {
          ...initialValue,
          enableRole: false,
          showDriver: false,
          displayName: 'Grace',
          reviewCode: 'needs-review',
        },
        baselineValue: initialValue,
        dirty: true,
        valid: false,
        issues: [invalidReviewIssue],
      },
    },
    {
      id: 'reenable-role',
      action: 'Turn Enable role on and reuse the mounted native control.',
      decision: 'confirm',
      operation: {
        type: 'set-value',
        path: ['enableRole'],
        expected: { kind: 'value', value: false },
        value: true,
      },
      expected: {
        value: {
          ...initialValue,
          showDriver: false,
          displayName: 'Grace',
          reviewCode: 'needs-review',
        },
        baselineValue: initialValue,
        dirty: true,
        valid: false,
        issues: [invalidReviewIssue],
      },
    },
  ],
  explanation: [
    {
      id: 'controlled-predicates',
      title: 'Controlled compound predicates',
      body: 'Flat all/any groups read only current application-owned primitive values; hidden sources keep participating without losing data or validation truth.',
    },
    {
      id: 'mounted-targets',
      title: 'Mounted target projection',
      body: 'Both reference targets retain field identity and confirmed buffers while independently blocking inaccessible interactions.',
    },
  ],
} satisfies ReferenceScenarioAuthoring;
