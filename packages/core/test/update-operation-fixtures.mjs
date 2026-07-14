import { mkdir, writeFile } from 'node:fs/promises';
import { URL } from 'node:url';
import { applyFormOperation, applyOperation } from '../dist/index.js';

const metadata = { id: 1, formId: 'form' };
const definitionFields = [
  {
    key: '["name"]',
    name: 'name',
    path: ['name'],
    required: true,
    label: 'Name',
    kind: 'string',
    constraints: {},
  },
  {
    key: '["amount"]',
    name: 'amount',
    path: ['amount'],
    required: false,
    label: 'Amount',
    kind: 'number',
    numericType: 'number',
    constraints: {},
    ui: {},
  },
  {
    key: '["count"]',
    name: 'count',
    path: ['count'],
    required: false,
    label: 'Count',
    kind: 'number',
    numericType: 'integer',
    constraints: {},
    ui: {},
  },
  {
    key: '["active"]',
    name: 'active',
    path: ['active'],
    required: false,
    label: 'Active',
    kind: 'boolean',
  },
];
const definition = {
  nodes: definitionFields,
  fields: definitionFields,
};
const nestedStreet = {
  key: '["profile","address","street"]',
  name: 'street',
  path: ['profile', 'address', 'street'],
  required: true,
  label: 'Street',
  kind: 'string',
  constraints: {},
};
const nestedAddress = {
  key: '["profile","address"]',
  name: 'address',
  path: ['profile', 'address'],
  required: false,
  label: 'Address',
  kind: 'object',
  children: [nestedStreet],
};
const nestedProfile = {
  key: '["profile"]',
  name: 'profile',
  path: ['profile'],
  required: false,
  label: 'Profile',
  kind: 'object',
  children: [nestedAddress],
};
const nestedDefinition = {
  nodes: [nestedProfile],
  fields: [nestedStreet],
};
const set = (path, expected, value) => ({
  type: 'set-value',
  metadata,
  path,
  expected,
  value,
  source: 'user',
});
const remove = (path, value) => ({
  type: 'remove-value',
  metadata,
  path,
  expected: { kind: 'value', value },
  source: 'user',
});

const cases = {
  'success-set-existing': {
    mode: 'structural',
    currentValue: { name: 'Ada' },
    operation: set(['name'], { kind: 'value', value: 'Ada' }, 'Grace'),
  },
  'success-set-missing': {
    mode: 'structural',
    currentValue: {},
    operation: set(['name'], { kind: 'missing' }, 'Ada'),
  },
  'success-remove-existing': {
    mode: 'structural',
    currentValue: { name: 'Ada' },
    operation: remove(['name'], 'Ada'),
  },
  'success-noop-set': {
    mode: 'structural',
    currentValue: { name: 'Ada' },
    operation: set(['name'], { kind: 'value', value: 'Ada' }, 'Ada'),
  },
  'error-invalid-target': {
    mode: 'structural',
    currentValue: [],
    operation: set(['name'], { kind: 'missing' }, 'Ada'),
  },
  'error-invalid-operation-type': {
    mode: 'structural',
    currentValue: {},
    operation: { ...set(['name'], { kind: 'missing' }, 'Ada'), type: 'bad' },
  },
  'error-invalid-metadata': {
    mode: 'structural',
    currentValue: {},
    operation: {
      ...set(['name'], { kind: 'missing' }, 'Ada'),
      metadata: { id: 0, formId: '' },
    },
  },
  'error-invalid-source': {
    mode: 'structural',
    currentValue: {},
    operation: {
      ...set(['name'], { kind: 'missing' }, 'Ada'),
      source: 'system',
    },
  },
  'error-invalid-expectation': {
    mode: 'structural',
    currentValue: {},
    operation: { ...set(['name'], { kind: 'missing' }, 'Ada'), expected: null },
  },
  'error-missing-set-value': {
    mode: 'structural',
    currentValue: {},
    operation: {
      type: 'set-value',
      metadata,
      path: ['name'],
      expected: { kind: 'missing' },
      source: 'user',
    },
  },
  'error-empty-path': {
    mode: 'structural',
    currentValue: {},
    operation: set([], { kind: 'missing' }, 'Ada'),
  },
  'success-deep-set': {
    mode: 'structural',
    currentValue: {},
    operation: set(['a', 'b'], { kind: 'missing' }, 'Ada'),
  },
  'success-deep-remove': {
    mode: 'structural',
    currentValue: { a: { b: 'Ada' } },
    operation: remove(['a', 'b'], 'Ada'),
  },
  'error-incompatible-ancestor': {
    mode: 'structural',
    currentValue: { a: null },
    operation: set(['a', 'b'], { kind: 'missing' }, 'Ada'),
  },
  'error-numeric-segment': {
    mode: 'structural',
    currentValue: {},
    operation: set([0], { kind: 'missing' }, 'Ada'),
  },
  'error-stale-missing': {
    mode: 'structural',
    currentValue: { name: 'Ada' },
    operation: set(['name'], { kind: 'missing' }, 'Grace'),
  },
  'error-stale-value': {
    mode: 'structural',
    currentValue: { name: 'Ada' },
    operation: set(['name'], { kind: 'value', value: 'Grace' }, 'Marie'),
  },
  'error-remove-missing': {
    mode: 'structural',
    currentValue: {},
    operation: remove(['name'], 'Ada'),
  },
  'success-form-string': {
    mode: 'form',
    definition,
    currentValue: {},
    operation: set(['name'], { kind: 'missing' }, 'Ada'),
  },
  'success-form-number': {
    mode: 'form',
    definition,
    currentValue: {},
    operation: set(['amount'], { kind: 'missing' }, 1.5),
  },
  'success-form-integer': {
    mode: 'form',
    definition,
    currentValue: {},
    operation: set(['count'], { kind: 'missing' }, 2),
  },
  'success-form-boolean': {
    mode: 'form',
    definition,
    currentValue: {},
    operation: set(['active'], { kind: 'missing' }, true),
  },
  'success-remove-required': {
    mode: 'form',
    definition,
    currentValue: { name: 'Ada' },
    operation: remove(['name'], 'Ada'),
  },
  'success-form-deep-string': {
    mode: 'form',
    definition: nestedDefinition,
    currentValue: {},
    operation: set(
      ['profile', 'address', 'street'],
      { kind: 'missing' },
      'Main',
    ),
  },
  'error-form-object-target': {
    mode: 'form',
    definition: nestedDefinition,
    currentValue: {},
    operation: set(['profile', 'address'], { kind: 'missing' }, {}),
  },
  'error-malformed-definition': {
    mode: 'form',
    definition: { fields: null },
    currentValue: {},
    operation: set(['name'], { kind: 'missing' }, 'Ada'),
  },
  'error-duplicate-managed-path': {
    mode: 'form',
    definition: {
      nodes: [],
      fields: [definitionFields[0], definitionFields[0]],
    },
    currentValue: {},
    operation: set(['name'], { kind: 'missing' }, 'Ada'),
  },
  'error-unmanaged-path': {
    mode: 'form',
    definition,
    currentValue: {},
    operation: set(['other'], { kind: 'missing' }, 'Ada'),
  },
  'error-incompatible-string': {
    mode: 'form',
    definition,
    currentValue: {},
    operation: set(['name'], { kind: 'missing' }, 1),
  },
  'error-non-integer': {
    mode: 'form',
    definition,
    currentValue: {},
    operation: set(['count'], { kind: 'missing' }, 1.5),
  },
  'error-incompatible-boolean': {
    mode: 'form',
    definition,
    currentValue: {},
    operation: set(['active'], { kind: 'missing' }, 'true'),
  },
};

for (const [name, fixture] of Object.entries(cases)) {
  const directory = new URL(`./operations/fixtures/${name}/`, import.meta.url);
  await mkdir(directory, { recursive: true });
  const result =
    fixture.mode === 'form'
      ? applyFormOperation(
          fixture.definition,
          fixture.currentValue,
          fixture.operation,
        )
      : applyOperation(fixture.currentValue, fixture.operation);
  await writeFile(
    new URL('fixture.json', directory),
    `${JSON.stringify(fixture, null, 2)}\n`,
  );
  await writeFile(
    new URL('expected.json', directory),
    `${JSON.stringify(result, null, 2)}\n`,
  );
}
