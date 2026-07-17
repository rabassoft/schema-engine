import assert from 'node:assert/strict';
import { createAjvSchemaValidator } from '@rabassoft/schema-engine-validator-ajv';

assert.equal(typeof createAjvSchemaValidator, 'function');
const validator = createAjvSchemaValidator();
const result = validator.validate(
  {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    properties: { name: { type: 'string', minLength: 2 } },
    required: ['name'],
  },
  { name: '' },
);
assert.equal(result.valid, false);
assert.deepEqual(result.issues[0].path, ['name']);
assert.equal(result.issues[0].code, 'minLength');
