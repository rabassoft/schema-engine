import type { ValidationIssue } from '@rabassoft/schema-engine';

import type { ReferenceScenarioAuthoring } from '../contracts.js';
import { isRecord, isUnknownArray, issue, result } from './validation.js';

const baseline = {
  team: [
    { id: 'ada', name: 'Ada', role: 'Architect' },
    { id: 'grace', name: 'Grace', role: 'Engineer' },
  ],
};

export const stableTeam = {
  id: 'stable-team',
  title: 'Stable team collection',
  summary:
    'Shows stable item identity with item-leaf, insertion, movement and removal intentions.',
  features: ['object-collections'],
  compileInput: {
    schema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
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
            required: ['id', 'name'],
          },
        },
      },
    },
    uiSchema: {
      fields: {
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
      },
    },
    collectionPolicies: [{ path: ['team'], itemIdentityProperty: 'id' }],
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
      if (!isRecord(value) || !isUnknownArray(value.team)) {
        return result([issue('team-array', ['team'], 'type')]);
      }
      const ids = new Set<string>();
      for (let index = 0; index < value.team.length; index += 1) {
        const member = value.team[index];
        if (!isRecord(member) || typeof member.id !== 'string') {
          issues.push(
            issue('member-identity', ['team', index, 'id'], 'required'),
          );
          continue;
        }
        if (ids.has(member.id)) {
          issues.push(
            issue('duplicate-identity', ['team', index, 'id'], 'uniqueItems'),
          );
        }
        ids.add(member.id);
        if (
          typeof member.name !== 'string' ||
          member.name.trim().length === 0
        ) {
          issues.push(
            issue('member-name', ['team', index, 'name'], 'minLength'),
          );
        }
      }
      return result(issues);
    },
  },
  transitions: [
    {
      id: 'rename-ada',
      action: 'Change Ada’s name and confirm the item-leaf intention.',
      decision: 'confirm',
      operation: {
        type: 'set-item-value',
        target: {
          collectionPath: ['team'],
          itemId: 'ada',
          relativePath: ['name'],
        },
        identityProperty: 'id',
        expected: { kind: 'value', value: 'Ada' },
        value: 'Ada Lovelace',
      },
      expected: {
        value: {
          team: [
            { id: 'ada', name: 'Ada Lovelace', role: 'Architect' },
            { id: 'grace', name: 'Grace', role: 'Engineer' },
          ],
        },
        baselineValue: baseline,
        dirty: true,
        valid: true,
        issues: [],
      },
    },
    {
      id: 'insert-linus',
      action: 'Insert Linus at the end of the team.',
      decision: 'confirm',
      operation: {
        type: 'insert-item',
        collectionPath: ['team'],
        identityProperty: 'id',
        itemId: 'linus',
        item: { id: 'linus', name: 'Linus', role: 'Reviewer' },
        placement: { kind: 'end' },
      },
      expected: {
        value: {
          team: [
            { id: 'ada', name: 'Ada Lovelace', role: 'Architect' },
            { id: 'grace', name: 'Grace', role: 'Engineer' },
            { id: 'linus', name: 'Linus', role: 'Reviewer' },
          ],
        },
        baselineValue: baseline,
        dirty: true,
        valid: true,
        issues: [],
      },
    },
    {
      id: 'move-linus-first',
      action: 'Move Linus before Ada using stable identities.',
      decision: 'confirm',
      operation: {
        type: 'move-item',
        collectionPath: ['team'],
        identityProperty: 'id',
        itemId: 'linus',
        placement: { kind: 'before', itemId: 'ada' },
      },
      expected: {
        value: {
          team: [
            { id: 'linus', name: 'Linus', role: 'Reviewer' },
            { id: 'ada', name: 'Ada Lovelace', role: 'Architect' },
            { id: 'grace', name: 'Grace', role: 'Engineer' },
          ],
        },
        baselineValue: baseline,
        dirty: true,
        valid: true,
        issues: [],
      },
    },
    {
      id: 'remove-grace',
      action: 'Remove Grace by stable identity.',
      decision: 'confirm',
      operation: {
        type: 'remove-item',
        collectionPath: ['team'],
        identityProperty: 'id',
        itemId: 'grace',
      },
      expected: {
        value: {
          team: [
            { id: 'linus', name: 'Linus', role: 'Reviewer' },
            { id: 'ada', name: 'Ada Lovelace', role: 'Architect' },
          ],
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
      id: 'stable-identity',
      title: 'Identity is explicit policy',
      body: 'Collection operations address items by the configured identity property rather than by display index.',
    },
  ],
} satisfies ReferenceScenarioAuthoring;
