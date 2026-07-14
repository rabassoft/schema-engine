import { mkdir, writeFile } from 'node:fs/promises';
import { URL } from 'node:url';
import { createControlledFormRuntime } from '../dist/index.js';

const fields = [
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
    key: '["age"]',
    name: 'age',
    path: ['age'],
    required: false,
    label: 'Age',
    kind: 'number',
    numericType: 'integer',
    constraints: {},
    ui: {},
  },
];
const definition = {
  nodes: fields,
  fields,
};
const nestedStreet = {
  key: '["profile","street"]',
  name: 'street',
  path: ['profile', 'street'],
  required: true,
  label: 'Street',
  kind: 'string',
  constraints: {},
};
const nestedProfile = {
  key: '["profile"]',
  name: 'profile',
  path: ['profile'],
  required: true,
  label: 'Profile',
  kind: 'object',
  children: [nestedStreet],
};
const nestedDefinition = {
  nodes: [nestedProfile],
  fields: [nestedStreet],
};
const cases = {
  'valid-creation': {
    value: { name: 'Ada' },
    baselineValue: { name: 'Ada' },
    actions: [],
  },
  'invalid-business-data': {
    value: {},
    baselineValue: { name: 'Ada' },
    validatorMode: 'required-name',
    actions: [],
  },
  'external-confirmation': {
    value: { name: 'Ada' },
    baselineValue: { name: 'Ada' },
    actions: [{ type: 'update', update: { value: { name: 'Grace' } } }],
  },
  'baseline-dirty-reset': {
    value: { name: 'Ada' },
    baselineValue: {},
    actions: [{ type: 'update', update: { baselineValue: { name: 'Ada' } } }],
  },
  'operation-emission': {
    value: { name: 'Ada' },
    baselineValue: { name: 'Ada' },
    actions: [
      { type: 'set', path: ['name'], value: 'Grace' },
      { type: 'remove', path: ['name'] },
    ],
  },
  'operation-noop': {
    value: { name: 'Ada' },
    baselineValue: { name: 'Ada' },
    actions: [
      { type: 'set', path: ['name'], value: 'Ada' },
      { type: 'remove', path: ['age'] },
    ],
  },
  interaction: {
    value: { name: 'Ada' },
    baselineValue: { name: 'Ada' },
    actions: [
      { type: 'focus', path: ['name'] },
      { type: 'blur', path: ['name'] },
    ],
  },
  'forced-scope': {
    value: {},
    baselineValue: {},
    validatorMode: 'required-name',
    actions: [
      { type: 'show', scope: { id: 'step', paths: [['name']] } },
      { type: 'hide', scopeId: 'step' },
    ],
  },
  'locale-update': {
    value: {},
    baselineValue: {},
    actions: [{ type: 'update', update: { locale: 'ca' } }],
  },
  disposal: {
    value: {},
    baselineValue: {},
    actions: [{ type: 'dispose' }, { type: 'focus', path: ['name'] }],
  },
  'nested-missing-operation': {
    definitionMode: 'nested',
    value: {},
    baselineValue: { profile: { street: 'Main' } },
    actions: [
      { type: 'set', path: ['profile', 'street'], value: 'New' },
      { type: 'remove', path: ['profile', 'street'] },
    ],
  },
  'nested-incompatible-action': {
    definitionMode: 'nested',
    value: { profile: 42 },
    baselineValue: { profile: { street: 'Main' } },
    actions: [{ type: 'focus', path: ['profile', 'street'] }],
  },
  'nested-object-scope': {
    definitionMode: 'nested',
    value: { profile: {} },
    baselineValue: { profile: {} },
    validatorMode: 'nested-issues',
    actions: [{ type: 'show', scope: { id: 'profile', paths: [['profile']] } }],
  },
};

function validator(mode) {
  return {
    validate(_schema, value) {
      if (mode === 'nested-issues') {
        return {
          valid: false,
          issues: [
            { code: 'profile', path: ['profile'], parameters: {} },
            { code: 'deep', path: ['profile', 'unknown'], parameters: {} },
          ],
        };
      }
      const missing = !Object.hasOwn(value, 'name');
      return mode === 'required-name' && missing
        ? {
            valid: false,
            issues: [{ code: 'required', path: ['name'], parameters: {} }],
          }
        : { valid: true, issues: [] };
    },
  };
}
function replay(fixture) {
  const created = createControlledFormRuntime({
    formId: 'fixture',
    definition:
      fixture.definitionMode === 'nested' ? nestedDefinition : definition,
    schema: {},
    value: fixture.value,
    baselineValue: fixture.baselineValue,
    locale: 'en',
    validator: validator(fixture.validatorMode),
  });
  if (!created.success) return created;
  const operations = [];
  let snapshotEmissions = 0;
  created.runtime.subscribe(() => {
    snapshotEmissions += 1;
  });
  created.runtime.subscribeOperations((operation) =>
    operations.push(operation),
  );
  const initialSnapshot = created.runtime.getSnapshot();
  const actions = [];
  for (const action of fixture.actions) {
    let result;
    if (action.type === 'update')
      result = created.runtime.updateExternalState(action.update);
    else if (action.type === 'set')
      result = created.runtime.requestSetValue(action.path, action.value);
    else if (action.type === 'remove')
      result = created.runtime.requestRemoveValue(action.path);
    else if (action.type === 'focus')
      result = created.runtime.focus(action.path);
    else if (action.type === 'blur') result = created.runtime.blur(action.path);
    else if (action.type === 'show')
      result = created.runtime.showValidationErrors(action.scope);
    else if (action.type === 'hide')
      result = created.runtime.hideValidationErrors(action.scopeId);
    else result = created.runtime.dispose();
    actions.push({ result, snapshot: created.runtime.getSnapshot() });
  }
  return {
    success: true,
    initialSnapshot,
    actions,
    operations,
    snapshotEmissions,
    finalSnapshot: created.runtime.getSnapshot(),
  };
}

for (const [name, fixture] of Object.entries(cases)) {
  const directory = new URL(`./runtime/fixtures/${name}/`, import.meta.url);
  await mkdir(directory, { recursive: true });
  await writeFile(
    new URL('fixture.json', directory),
    `${JSON.stringify(fixture, null, 2)}\n`,
  );
  await writeFile(
    new URL('expected.json', directory),
    `${JSON.stringify(replay(fixture), null, 2)}\n`,
  );
}
