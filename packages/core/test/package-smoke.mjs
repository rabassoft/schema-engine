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

const result = compileFormDefinition({
  schema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    properties: {
      profile: {
        type: 'object',
        properties: { address: { type: 'string' } },
      },
    },
  },
});

assert.equal(result.success, true);

const runtimeResult = createControlledFormRuntime({
  formId: 'smoke',
  definition: result.definition,
  schema: {
    type: 'object',
    properties: {
      profile: {
        type: 'object',
        properties: { address: { type: 'string' } },
      },
    },
  },
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
