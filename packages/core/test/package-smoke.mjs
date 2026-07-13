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
    properties: {},
  },
});

assert.equal(result.success, true);

const runtimeResult = createControlledFormRuntime({
  formId: 'smoke',
  definition: result.definition,
  schema: { type: 'object', properties: {} },
  value: {},
  baselineValue: {},
  locale: 'en',
  validator: { validate: () => ({ valid: true, issues: [] }) },
});
assert.equal(runtimeResult.success, true);
if (runtimeResult.success) {
  assert.equal(runtimeResult.runtime.getSnapshot().valid, true);
  runtimeResult.runtime.dispose();
}
