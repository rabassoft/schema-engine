import assert from 'node:assert/strict';
import {
  applyFormOperation,
  applyOperation,
  compileFormDefinition,
  createControlledFormRuntime,
} from '@rabassoft/schema-engine';

assert.equal(typeof compileFormDefinition, 'function');
assert.equal(typeof applyOperation, 'function');
assert.equal(typeof applyFormOperation, 'function');
assert.equal(typeof createControlledFormRuntime, 'function');

const referencedSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $defs: {
    profile: {
      type: 'object',
      properties: { address: { type: 'string' } },
    },
  },
  type: 'object',
  properties: { profile: { $ref: '#/$defs/profile' } },
};
const result = compileFormDefinition({ schema: referencedSchema });

assert.equal(result.success, true);
if (result.success) {
  assert.equal(result.definition.fields[0]?.nullable, false);
  assert.equal(result.definition.presentation.length, 1);
  assert.equal(result.definition.presentation[0]?.kind, 'form-node');
  assert.equal(
    result.definition.presentation[0]?.node,
    result.definition.nodes[0],
  );
  assert.equal(Object.isFrozen(result.definition.presentation), true);
}

const advancedResult = compileFormDefinition({
  schema: referencedSchema,
  uiSchema: {
    presentation: [
      {
        kind: 'tabs',
        id: 'profile-tabs',
        label: 'Profile',
        panels: [
          {
            kind: 'panel',
            id: 'main',
            label: 'Main',
            children: ['profile'],
          },
        ],
      },
    ],
  },
});
assert.equal(advancedResult.success, true);
if (!advancedResult.success)
  throw new Error('Advanced presentation compilation failed');
const advancedTabs = advancedResult.definition.presentation[0];
assert.equal(advancedTabs?.kind, 'tabs');
if (advancedTabs?.kind !== 'tabs') throw new Error('Missing normalized tabs');
assert.equal(advancedTabs.key, '["tabs","profile-tabs"]');
assert.equal(advancedTabs.panels[0]?.children[0]?.kind, 'form-node');
const advancedChild = advancedTabs.panels[0]?.children[0];
if (advancedChild?.kind !== 'form-node')
  throw new Error('Missing normalized advanced child');
assert.equal(advancedChild.node, advancedResult.definition.nodes[0]);
assert.equal(Object.isFrozen(advancedTabs.panels), true);
const advancedRuntime = createControlledFormRuntime({
  formId: 'advanced-smoke',
  definition: advancedResult.definition,
  schema: referencedSchema,
  value: {},
  baselineValue: {},
  locale: 'en',
  validator: { validate: () => ({ valid: true, issues: [] }) },
});
assert.equal(advancedRuntime.success, true);
if (!advancedRuntime.success)
  throw new Error('Advanced presentation runtime creation failed');
advancedRuntime.runtime.dispose();

const nullableSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: { value: { type: ['string', 'null'] } },
};
const nullableResult = compileFormDefinition({ schema: nullableSchema });
assert.equal(nullableResult.success, true);
if (!nullableResult.success) throw new Error('Nullable compilation failed');
assert.equal(nullableResult.definition.fields[0]?.nullable, true);
const nullableApplied = applyFormOperation(
  nullableResult.definition,
  { value: 'before' },
  {
    type: 'set-value',
    metadata: { id: 1, formId: 'nullable-smoke' },
    path: ['value'],
    expected: { kind: 'value', value: 'before' },
    value: null,
    source: 'user',
  },
);
assert.equal(nullableApplied.success, true);
if (!nullableApplied.success) throw new Error('Nullable set failed');
assert.equal(nullableApplied.value.value, null);

const runtimeResult = createControlledFormRuntime({
  formId: 'smoke',
  definition: result.definition,
  schema: referencedSchema,
  value: {},
  baselineValue: {},
  locale: 'en',
  validator: { validate: () => ({ valid: true, issues: [] }) },
});
assert.equal(runtimeResult.success, true);
if (runtimeResult.success) {
  const snapshot = runtimeResult.runtime.getSnapshot();
  assert.equal(snapshot.valid, true);
  const profile = snapshot.nodes[0];
  assert.equal(profile?.nodeKind, 'object');
  if (profile?.nodeKind !== 'object')
    throw new Error('Missing object snapshot');
  assert.equal(profile.children[0], snapshot.fields[0]);
  assert.equal(
    runtimeResult.runtime.getNodeSnapshot(['profile', 'address']),
    snapshot.fields[0],
  );
  assert.equal(
    runtimeResult.runtime.getFieldSnapshot(['profile', 'address']),
    snapshot.fields[0],
  );
  assert.equal(runtimeResult.runtime.getNodeSnapshot(['profile']), profile);
  assert.equal(runtimeResult.runtime.getNodeSnapshot([]), undefined);

  const operations = [];
  runtimeResult.runtime.subscribeOperations((operation) =>
    operations.push(operation),
  );
  runtimeResult.runtime.requestSetValue(['profile', 'address'], 'Barcelona');
  assert.equal(operations.length, 1);
  const applied = applyFormOperation(result.definition, {}, operations[0]);
  assert.equal(applied.success, true);
  if (!applied.success) throw new Error('Deep set failed');
  assert.deepEqual(applied.value, { profile: { address: 'Barcelona' } });
  const removed = applyFormOperation(result.definition, applied.value, {
    type: 'remove-value',
    metadata: { id: 2, formId: 'smoke' },
    path: ['profile', 'address'],
    expected: { kind: 'value', value: 'Barcelona' },
    source: 'user',
  });
  assert.equal(removed.success, true);
  if (!removed.success) throw new Error('Deep remove failed');
  assert.deepEqual(removed.value, { profile: {} });
  runtimeResult.runtime.dispose();
}

const collectionSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: {
    rows: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
        required: ['id'],
      },
    },
  },
};
const collectionCompilation = compileFormDefinition({
  schema: collectionSchema,
  collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
});
assert.equal(collectionCompilation.success, true);
if (!collectionCompilation.success)
  throw new Error('Collection compilation failed');
const collectionValue = {
  rows: [
    { id: 'a', name: 'Ada' },
    { id: 'b', name: 'Bob' },
  ],
};
const collectionRuntime = createControlledFormRuntime({
  formId: 'collection-smoke',
  definition: collectionCompilation.definition,
  schema: collectionSchema,
  value: collectionValue,
  baselineValue: collectionValue,
  locale: 'en',
  validator: { validate: () => ({ valid: true, issues: [] }) },
});
assert.equal(collectionRuntime.success, true);
if (!collectionRuntime.success) throw new Error('Collection runtime failed');
const itemAddress = { collectionPath: ['rows'], itemId: 'a' };
const nameAddress = { ...itemAddress, relativePath: ['name'] };
assert.equal(collectionRuntime.runtime.getItemSnapshot(itemAddress)?.index, 0);
assert.equal(
  collectionRuntime.runtime.getCollectionNodeSnapshot(nameAddress)?.nodeKind,
  'field',
);
const collectionOperations = [];
collectionRuntime.runtime.subscribeOperations((operation) =>
  collectionOperations.push(operation),
);
collectionRuntime.runtime.requestSetItemValue(nameAddress, 'Grace');
assert.equal(collectionOperations[0]?.type, 'set-item-value');
const collectionApplied = applyFormOperation(
  collectionCompilation.definition,
  collectionValue,
  collectionOperations[0],
);
assert.equal(collectionApplied.success, true);
if (!collectionApplied.success) throw new Error('Collection set failed');
assert.equal(collectionApplied.value.rows[0].name, 'Grace');
collectionRuntime.runtime.dispose();
