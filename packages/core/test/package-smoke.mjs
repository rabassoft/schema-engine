import assert from 'node:assert/strict';
import * as packageRoot from '@rabassoft/schema-engine';
import {
  applyFormOperation,
  applyOperation,
  commitScopeToBaseline,
  compileFormDefinition,
  createControlledFormRuntime,
  deriveSchemaDefaultCandidate,
} from '@rabassoft/schema-engine';

assert.equal(typeof compileFormDefinition, 'function');
assert.equal(typeof applyOperation, 'function');
assert.equal(typeof applyFormOperation, 'function');
assert.equal(typeof createControlledFormRuntime, 'function');
assert.equal(typeof commitScopeToBaseline, 'function');
assert.equal(typeof deriveSchemaDefaultCandidate, 'function');
assert.deepEqual(Object.keys(packageRoot).sort(), [
  'applyFormOperation',
  'applyOperation',
  'commitScopeToBaseline',
  'compileFormDefinition',
  'createControlledFormRuntime',
  'deriveSchemaDefaultCandidate',
]);

const defaultSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: {
    profile: {
      type: 'object',
      properties: { name: { type: 'string', default: 'Ada' } },
    },
  },
};
const defaultInput = {};
const defaultCandidate = deriveSchemaDefaultCandidate(
  defaultSchema,
  defaultInput,
);
assert.equal(defaultCandidate.success, true);
assert.equal(defaultCandidate.changed, true);
assert.deepEqual(defaultCandidate.value, { profile: { name: 'Ada' } });
const defaultNoEffect = deriveSchemaDefaultCandidate(
  defaultSchema,
  defaultCandidate.value,
);
assert.equal(defaultNoEffect.success, true);
assert.equal(defaultNoEffect.changed, false);
assert.equal(defaultNoEffect.value, defaultCandidate.value);
const defaultFailure = deriveSchemaDefaultCandidate(
  {
    ...defaultSchema,
    properties: { value: { type: 'integer', default: 1.5 } },
  },
  defaultInput,
);
assert.equal(defaultFailure.success, false);
assert.equal(defaultFailure.value, defaultInput);
assert.equal(
  defaultFailure.diagnostics[0]?.code,
  'INVALID_SCHEMA_KEYWORD_VALUE',
);

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

  const confirmed = commitScopeToBaseline(
    result.definition,
    { profile: { address: 'before' }, unmanaged: 'baseline' },
    { profile: { address: 'after' }, unmanaged: 'current' },
    { id: 'profile', paths: [['profile', 'address']] },
  );
  assert.equal(confirmed.success, true);
  assert.equal(confirmed.changed, true);
  assert.deepEqual(confirmed.value, {
    profile: { address: 'after' },
    unmanaged: 'baseline',
  });
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

const fixedResult = compileFormDefinition({
  schema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    properties: { value: { type: 'string', const: '' } },
  },
});
assert.equal(fixedResult.success, true);
if (!fixedResult.success) throw new Error('Fixed-value compilation failed');
assert.equal(fixedResult.definition.fields[0]?.fixedValue, '');
assert.equal(
  Object.hasOwn(fixedResult.definition.fields[0], 'fixedValue'),
  true,
);
assert.equal(Object.isFrozen(fixedResult.definition.fields[0]), true);

const composedSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $defs: {
    contact: {
      type: 'object',
      properties: { email: { type: 'string' } },
    },
  },
  allOf: [
    { $ref: '#/$defs/contact' },
    {
      type: 'object',
      properties: { displayName: { type: 'string' } },
      required: ['email', 'displayName'],
    },
  ],
};
const composedResult = compileFormDefinition({ schema: composedSchema });
assert.equal(composedResult.success, true);
if (!composedResult.success)
  throw new Error('Static object composition compilation failed');
assert.deepEqual(
  composedResult.definition.fields.map(({ name, required }) => ({
    name,
    required,
  })),
  [
    { name: 'email', required: true },
    { name: 'displayName', required: true },
  ],
);
const conflictingComposition = compileFormDefinition({
  schema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    allOf: [
      {
        type: 'object',
        properties: { value: { type: 'string' } },
      },
      {
        type: 'object',
        properties: { value: { type: 'number' } },
      },
    ],
  },
});
assert.equal(conflictingComposition.success, false);
assert.equal(
  conflictingComposition.diagnostics[0]?.code,
  'INCOMPATIBLE_SCHEMA_COMPOSITION',
);

const conditionalSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: {
    active: { type: 'boolean' },
    visibleTarget: { type: 'string' },
    enabledTarget: { type: 'string' },
  },
};
const conditionalResult = compileFormDefinition({
  schema: conditionalSchema,
  uiSchema: {
    fields: {
      visibleTarget: {
        visibleWhen: { path: ['active'], equals: true },
      },
      enabledTarget: {
        enabledWhen: { path: ['active'], equals: true },
      },
    },
  },
});
assert.equal(conditionalResult.success, true);
if (!conditionalResult.success)
  throw new Error('Conditional field compilation failed');
assert.deepEqual(conditionalResult.definition.fields[1]?.visibleWhen, {
  sourcePath: ['active'],
  equals: true,
});
assert.deepEqual(conditionalResult.definition.fields[2]?.enabledWhen, {
  sourcePath: ['active'],
  equals: true,
});
const conditionalValue = {
  active: false,
  visibleTarget: 'visible',
  enabledTarget: 'enabled',
};
const conditionalRuntime = createControlledFormRuntime({
  formId: 'conditional-smoke',
  definition: conditionalResult.definition,
  schema: conditionalSchema,
  value: conditionalValue,
  baselineValue: conditionalValue,
  locale: 'en',
  validator: { validate: () => ({ valid: true, issues: [] }) },
});
assert.equal(conditionalRuntime.success, true);
if (!conditionalRuntime.success)
  throw new Error('Conditional field runtime failed');
assert.deepEqual(
  conditionalRuntime.runtime
    .getSnapshot()
    .fields.map(({ path, visible, enabled }) => ({ path, visible, enabled })),
  [
    { path: ['active'], visible: true, enabled: true },
    { path: ['visibleTarget'], visible: false, enabled: true },
    { path: ['enabledTarget'], visible: true, enabled: false },
  ],
);
assert.deepEqual(
  conditionalRuntime.runtime.requestSetValue(['visibleTarget'], 'stale'),
  {
    success: false,
    effects: { snapshotChanged: false, operationEmitted: false },
    diagnostics: [
      {
        code: 'INACTIVE_RUNTIME_FIELD',
        severity: 'error',
        source: 'runtime',
        dataPath: ['visibleTarget'],
        parameters: {
          action: 'requestSetValue',
          reason: 'hidden',
        },
        fallbackMessage:
          'Runtime action is blocked by conditional field state.',
      },
    ],
  },
);
assert.equal(
  conditionalRuntime.runtime.requestSetValue(['enabledTarget'], 'stale')
    .diagnostics[0]?.parameters.reason,
  'disabled',
);
conditionalRuntime.runtime.dispose();

const stringEnumArraySchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: {
    roles: {
      type: 'array',
      items: { type: 'string', enum: ['', 'reader', 'editor'] },
      uniqueItems: true,
    },
  },
};
const stringEnumArrayResult = compileFormDefinition({
  schema: stringEnumArraySchema,
  uiSchema: {
    fields: {
      roles: {
        enumLabels: {
          '': '(empty string)',
          reader: 'Reader',
          editor: 'Editor',
        },
      },
    },
  },
});
assert.equal(stringEnumArrayResult.success, true);
if (!stringEnumArrayResult.success)
  throw new Error('String-enum array compilation failed');
const stringEnumArrayField = stringEnumArrayResult.definition.fields[0];
assert.equal(stringEnumArrayField?.kind, 'string-enum-array');
assert.deepEqual(stringEnumArrayField?.choices, [
  { value: '', label: '(empty string)' },
  { value: 'reader', label: 'Reader' },
  { value: 'editor', label: 'Editor' },
]);
const stringEnumArrayValue = { roles: ['editor'] };
const stringEnumArrayRuntime = createControlledFormRuntime({
  formId: 'string-enum-array-smoke',
  definition: stringEnumArrayResult.definition,
  schema: stringEnumArraySchema,
  value: stringEnumArrayValue,
  baselineValue: stringEnumArrayValue,
  locale: 'en',
  validator: { validate: () => ({ valid: true, issues: [] }) },
});
assert.equal(stringEnumArrayRuntime.success, true);
if (!stringEnumArrayRuntime.success)
  throw new Error('String-enum array runtime failed');
const stringEnumArrayOperations = [];
stringEnumArrayRuntime.runtime.subscribeOperations((operation) =>
  stringEnumArrayOperations.push(operation),
);
assert.equal(
  stringEnumArrayRuntime.runtime.requestSetValue(
    ['roles'],
    ['editor', 'reader'],
  ).success,
  true,
);
assert.equal(stringEnumArrayOperations.length, 1);
assert.equal(Object.isFrozen(stringEnumArrayOperations[0].value), true);
const stringEnumArrayApplied = applyFormOperation(
  stringEnumArrayResult.definition,
  stringEnumArrayValue,
  stringEnumArrayOperations[0],
);
assert.equal(stringEnumArrayApplied.success, true);
if (!stringEnumArrayApplied.success)
  throw new Error('String-enum array operation failed');
assert.deepEqual(stringEnumArrayApplied.value, {
  roles: ['editor', 'reader'],
});
stringEnumArrayRuntime.runtime.dispose();

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
  assert.equal(Object.hasOwn(snapshot, 'asyncValidation'), false);
  assert.equal(
    runtimeResult.runtime.retryAsyncValidation().diagnostics[0]?.code,
    'ASYNC_VALIDATION_RETRY_UNAVAILABLE',
  );
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
