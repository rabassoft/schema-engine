import type { ValidationIssue } from '@rabassoft/schema-engine';

import type { ReferenceScenarioAuthoring } from '../contracts.js';
import { isRecord, isUnknownArray, issue, result } from './validation.js';

const alpha = {
  id: 'alpha',
  name: 'Alpha',
  status: 'Ready',
  details: { role: 'Owner', active: true },
};
const beta = {
  id: 'beta',
  name: 'Beta',
  status: 'Draft',
  details: { role: 'Reviewer', active: false },
};
const profile = {
  givenName: 'Ada',
  familyName: 'Lovelace',
  email: 'ada@example.test',
};
const baseline = { profile, rows: [alpha, beta] };

export const recursiveLocalPresentation = {
  id: 'recursive-local-presentation',
  title: 'Recursive local presentation',
  summary:
    'Projects object, collection-item and nested template layout forests while stable item identities preserve local state.',
  features: ['recursive-local-presentation'],
  compileInput: {
    schema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        profile: {
          type: 'object',
          title: 'Profile',
          properties: {
            givenName: { type: 'string', title: 'Given name' },
            familyName: { type: 'string', title: 'Family name' },
            email: { type: 'string', title: 'Email' },
          },
        },
        rows: {
          type: 'array',
          title: 'Rows',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string', title: 'Name' },
              status: { type: 'string', title: 'Status' },
              details: {
                type: 'object',
                title: 'Details',
                properties: {
                  role: { type: 'string', title: 'Role' },
                  active: { type: 'boolean', title: 'Active' },
                },
              },
            },
            required: ['id', 'name'],
          },
        },
      },
    },
    uiSchema: {
      fields: {
        profile: {
          presentation: [
            {
              kind: 'section',
              id: 'profile-workspace',
              label: 'Profile workspace',
              children: [
                {
                  kind: 'tabs',
                  id: 'profile-tabs',
                  label: 'Profile details',
                  panels: [
                    {
                      kind: 'panel',
                      id: 'identity',
                      label: 'Identity',
                      children: [
                        {
                          kind: 'grid',
                          id: 'profile-name-grid',
                          label: 'Profile name',
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
              ],
            },
          ],
        },
        rows: {
          item: {
            presentation: [
              {
                kind: 'tabs',
                id: 'item-tabs',
                label: 'Item details',
                panels: [
                  {
                    kind: 'panel',
                    id: 'summary',
                    label: 'Summary',
                    children: ['name'],
                  },
                  {
                    kind: 'panel',
                    id: 'details',
                    label: 'Details',
                    children: ['details'],
                  },
                ],
              },
              {
                kind: 'accordion',
                id: 'item-status',
                label: 'Item status',
                panels: [
                  {
                    kind: 'panel',
                    id: 'state',
                    label: 'State',
                    children: ['status'],
                  },
                ],
              },
            ],
            fields: {
              details: {
                presentation: [
                  {
                    kind: 'grid',
                    id: 'details-grid',
                    label: 'Detail values',
                    columns: 2,
                    items: [
                      { span: 1, child: 'role' },
                      { span: 1, child: 'active' },
                    ],
                  },
                ],
              },
            },
          },
        },
      },
    },
    collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
  },
  initialState: {
    value: baseline,
    baselineValue: baseline,
    locale: 'en',
    validationVisibility: 'touched',
  },
  validator: {
    validate(_schema: unknown, value: unknown) {
      if (!isRecord(value) || !isUnknownArray(value.rows))
        return result([issue('rows-array', ['rows'], 'type')]);
      const issues: ValidationIssue[] = [];
      const identities = new Set<string>();
      value.rows.forEach((row, index) => {
        if (!isRecord(row) || typeof row.id !== 'string') {
          issues.push(issue('row-identity', ['rows', index, 'id'], 'required'));
          return;
        }
        if (identities.has(row.id))
          issues.push(
            issue(
              'duplicate-row-identity',
              ['rows', index, 'id'],
              'uniqueItems',
            ),
          );
        identities.add(row.id);
      });
      return result(issues);
    },
  },
  transitions: [
    {
      id: 'move-beta-first',
      action: 'Move Beta before Alpha while retaining its local layout state.',
      decision: 'confirm',
      operation: {
        type: 'move-item',
        collectionPath: ['rows'],
        identityProperty: 'id',
        itemId: 'beta',
        placement: { kind: 'before', itemId: 'alpha' },
      },
      expected: {
        value: { profile, rows: [beta, alpha] },
        baselineValue: baseline,
        dirty: true,
        valid: true,
        issues: [],
      },
    },
    {
      id: 'move-beta-last',
      action: 'Move Beta after Alpha without recreating its local layout.',
      decision: 'confirm',
      operation: {
        type: 'move-item',
        collectionPath: ['rows'],
        identityProperty: 'id',
        itemId: 'beta',
        placement: { kind: 'after', itemId: 'alpha' },
      },
      expected: {
        value: baseline,
        baselineValue: baseline,
        dirty: false,
        valid: true,
        issues: [],
      },
    },
  ],
  explanation: [
    {
      id: 'local-owners',
      title: 'Layout is local to each owner',
      body: 'The profile, each stable item and each nested details object project independent normalized presentation forests.',
    },
    {
      id: 'stable-item-state',
      title: 'Identity retains target state',
      body: 'Moving an item reorders its retained host; removing and reinserting the same identity creates a fresh host.',
    },
  ],
} satisfies ReferenceScenarioAuthoring;
