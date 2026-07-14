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
    properties: { name: { type: 'string' } },
  },
});

assert.equal(result.success, true);

const runtimeResult = createControlledFormRuntime({
  formId: 'smoke',
  definition: result.definition,
  schema: { type: 'object', properties: { name: { type: 'string' } } },
  value: {},
  baselineValue: {},
  locale: 'en',
  validator: { validate: () => ({ valid: true, issues: [] }) },
});
assert.equal(runtimeResult.success, true);
if (runtimeResult.success) {
  const snapshot = runtimeResult.runtime.getSnapshot();
  assert.equal(snapshot.valid, true);
  assert.equal(snapshot.nodes[0], snapshot.fields[0]);
  assert.equal(
    runtimeResult.runtime.getNodeSnapshot(['name']),
    snapshot.fields[0],
  );
  assert.equal(runtimeResult.runtime.getNodeSnapshot([]), undefined);
  runtimeResult.runtime.dispose();
}
