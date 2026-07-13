import assert from 'node:assert/strict';
import { compileFormDefinition } from '@rabassoft/schema-engine';

assert.equal(typeof compileFormDefinition, 'function');

const result = compileFormDefinition({
  schema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    properties: {},
  },
});

assert.equal(result.success, true);
