import type { ValidationIssue } from '@rabassoft/schema-engine';

import type { ReferenceScenarioAuthoring } from '../contracts.js';
import { isRecord, isUnknownArray, issue, result } from './validation.js';

const baseline = {
  profile: { displayName: 'Ada Lovelace', timezone: 'UTC' },
  team: [
    { id: 'ada', name: 'Ada', role: 'Architect' },
    { id: 'grace', name: 'Grace', role: 'Engineer' },
  ],
  reviewNote: 'Baseline note',
};

const current = {
  profile: { displayName: 'Ada Byron', timezone: 'UTC' },
  team: [
    { id: 'grace', name: 'Grace Hopper', role: 'Engineer' },
    { id: 'linus', name: 'Linus', role: 'Reviewer' },
    { id: 'ada', name: 'Ada', role: 'Architect' },
  ],
  reviewNote: 'Unrelated edit remains dirty',
};

export const scopeBaselineConfirmation = {
  id: 'scope-baseline-confirmation',
  title: 'Scoped baseline confirmation',
  summary:
    'Prepares application-owned baseline candidates for one field, a structural collection, and an unconfirmable current-only item.',
  features: ['scope-confirmation'],
  compileInput: {
    schema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        profile: {
          type: 'object',
          title: 'Profile',
          properties: {
            displayName: { type: 'string', title: 'Display name' },
            timezone: { type: 'string', title: 'Timezone' },
          },
          required: ['displayName', 'timezone'],
        },
        team: {
          type: 'array',
          title: 'Team',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string', minLength: 1 },
              role: { type: 'string' },
            },
            required: ['id', 'name', 'role'],
          },
        },
        reviewNote: { type: 'string', title: 'Review note' },
      },
      required: ['profile', 'team', 'reviewNote'],
    },
    uiSchema: {
      order: ['profile', 'team', 'reviewNote'],
      fields: {
        profile: { order: ['displayName', 'timezone'] },
        team: {
          label: 'Team members',
          item: {
            order: ['name', 'role'],
            fields: {
              name: { label: 'Name' },
              role: { label: 'Role' },
            },
          },
        },
        reviewNote: {
          description:
            'This unrelated edit remains dirty after either successful scoped confirmation.',
        },
      },
    },
    collectionPolicies: [{ path: ['team'], itemIdentityProperty: 'id' }],
  },
  initialState: {
    value: current,
    baselineValue: baseline,
    locale: 'en',
    validationVisibility: 'touched',
  },
  validator: {
    validate(_schema: unknown, value: unknown) {
      const issues: ValidationIssue[] = [];
      if (!isRecord(value)) return result([issue('root-object', [])]);
      if (!isRecord(value.profile)) {
        issues.push(issue('profile-object', ['profile'], 'type'));
      }
      if (!isUnknownArray(value.team)) {
        issues.push(issue('team-array', ['team'], 'type'));
      }
      if (typeof value.reviewNote !== 'string') {
        issues.push(issue('review-note-string', ['reviewNote'], 'type'));
      }
      return result(issues);
    },
  },
  transitions: [
    {
      id: 'edit-profile-name',
      action: 'Change the profile name before preparing its scoped candidate.',
      decision: 'confirm',
      operation: {
        type: 'set-value',
        path: ['profile', 'displayName'],
        expected: { kind: 'value', value: 'Ada Byron' },
        value: 'Ada King',
      },
      expected: {
        value: {
          ...current,
          profile: { ...current.profile, displayName: 'Ada King' },
        },
        baselineValue: baseline,
        dirty: true,
        valid: true,
        issues: [],
      },
    },
  ],
  explanation: [
    {
      id: 'prepare-then-accept',
      title: 'Calculation is not persistence',
      body: 'Preparing a candidate leaves the runtime baseline and dirty state unchanged; accepting it simulates successful application persistence.',
    },
    {
      id: 'structural-boundary',
      title: 'Structure belongs to the collection scope',
      body: 'The whole team scope can accept reorder and insertion. A stable target for the current-only Linus item fails until that identity exists in the baseline.',
    },
  ],
  scopeConfirmation: {
    labels: {
      heading: 'Scoped baseline confirmation',
      guidance:
        'Prepare a candidate first. Accepting it separately simulates successful persistence and updates only the baseline.',
      accept: 'Accept prepared candidate',
    },
    targets: [
      {
        id: 'profile-name',
        label: 'Prepare profile name candidate',
        scope: { id: 'profile-name', paths: [['profile', 'displayName']] },
        expectation: 'candidate-and-acceptance-leaves-unrelated-dirty',
      },
      {
        id: 'whole-team',
        label: 'Prepare whole team candidate',
        scope: { id: 'whole-team', paths: [['team']] },
        expectation: 'candidate-and-acceptance-leaves-unrelated-dirty',
      },
      {
        id: 'current-only-linus',
        label: 'Try current-only Linus item',
        scope: {
          id: 'current-only-linus',
          paths: [{ collectionPath: ['team'], itemId: 'linus' }],
        },
        expectation: 'unconfirmable',
      },
    ],
  },
} satisfies ReferenceScenarioAuthoring;
