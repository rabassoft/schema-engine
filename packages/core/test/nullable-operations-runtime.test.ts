import { describe, expect, it, vi } from 'vitest';

import {
  applyFormOperation,
  applyOperation,
  compileFormDefinition,
  createControlledFormRuntime,
  type FormDefinition,
  type FormOperation,
} from '../src/index.js';

const DIALECT = 'https://json-schema.org/draft/2020-12/schema';
const metadata = { id: 1, formId: 'form' } as const;

function schema(nullable = true) {
  const type = nullable ? (['string', 'null'] as const) : 'string';
  return {
    $schema: DIALECT,
    type: 'object',
    properties: {
      name: { type },
      scalar: { type: 'string' },
      profile: {
        type: 'object',
        properties: { value: { type } },
      },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: { id: { type: 'string' }, value: { type } },
          required: ['id'],
        },
      },
    },
  };
}

function definition(nullable = true): FormDefinition {
  const result = compileFormDefinition({
    schema: schema(nullable),
    collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
  });
  expect(result.success).toBe(true);
  if (!result.success) throw new Error('definition compilation failed');
  return result.definition;
}

function setValue(
  path: readonly string[],
  expected:
    | { readonly kind: 'missing' }
    | { readonly kind: 'value'; readonly value: unknown },
  value: unknown,
): FormOperation {
  return {
    type: 'set-value',
    metadata,
    path,
    expected,
    value,
    source: 'user',
  };
}

function removeValue(path: readonly string[], value: unknown): FormOperation {
  return {
    type: 'remove-value',
    metadata,
    path,
    expected: { kind: 'value', value },
    source: 'user',
  };
}

function setItemValue(value: unknown, expected: unknown): FormOperation {
  return {
    type: 'set-item-value',
    metadata,
    target: {
      collectionPath: ['rows'],
      itemId: 'a',
      relativePath: ['value'],
    },
    identityProperty: 'id',
    expected: { kind: 'value', value: expected },
    value,
    source: 'user',
  };
}

describe('nullable definition-aware operations and runtime', () => {
  it('keeps raw operations structural for null', () => {
    const result = applyOperation(
      { scalar: 'before' },
      setValue(['scalar'], { kind: 'value', value: 'before' }, null),
    );
    expect(result).toMatchObject({
      success: true,
      changed: true,
      value: { scalar: null },
      diagnostics: [],
    });
  });

  it('accepts null only for nullable direct and deep managed leaves', () => {
    const managed = definition();
    expect(
      applyFormOperation(
        managed,
        { name: 'before' },
        setValue(['name'], { kind: 'value', value: 'before' }, null),
      ),
    ).toMatchObject({ success: true, changed: true, value: { name: null } });

    expect(
      applyFormOperation(
        managed,
        {},
        setValue(['profile', 'value'], { kind: 'missing' }, null),
      ),
    ).toMatchObject({
      success: true,
      changed: true,
      value: { profile: { value: null } },
    });

    const rejected = applyFormOperation(
      managed,
      { scalar: 'before' },
      setValue(['scalar'], { kind: 'value', value: 'before' }, null),
    );
    expect(rejected).toMatchObject({
      success: false,
      changed: false,
      diagnostics: [
        {
          code: 'INCOMPATIBLE_OPERATION_VALUE',
          dataPath: ['scalar'],
          parameters: {
            field: 'scalar',
            fieldType: 'string',
            actualType: 'null',
            actualValue: null,
          },
        },
      ],
    });
  });

  it('accepts null only for nullable collection template leaves', () => {
    const current = { rows: [{ id: 'a', value: 'before' }] };
    expect(
      applyFormOperation(definition(), current, setItemValue(null, 'before')),
    ).toMatchObject({
      success: true,
      changed: true,
      value: { rows: [{ id: 'a', value: null }] },
    });

    const rejected = applyFormOperation(
      definition(false),
      current,
      setItemValue(null, 'before'),
    );
    expect(rejected).toMatchObject({
      success: false,
      changed: false,
      diagnostics: [
        {
          code: 'INCOMPATIBLE_COLLECTION_OPERATION_VALUE',
          dataPath: ['rows', 0, 'value'],
          parameters: {
            operationType: 'set-item-value',
            reason: 'leaf-type',
            actualType: 'null',
            field: 'value',
            fieldType: 'string',
          },
        },
      ],
    });
  });

  it('preserves null expectation, no-effect, stale and remove-to-missing semantics', () => {
    const managed = definition();
    const current = { name: null };
    const noEffect = applyFormOperation(
      managed,
      current,
      setValue(['name'], { kind: 'value', value: null }, null),
    );
    expect(noEffect).toMatchObject({ success: true, changed: false });
    expect(noEffect.value).toBe(current);

    expect(
      applyFormOperation(
        managed,
        current,
        setValue(['name'], { kind: 'value', value: 'wrong' }, null),
      ),
    ).toMatchObject({
      success: false,
      diagnostics: [{ code: 'STALE_OPERATION' }],
    });

    const removed = applyFormOperation(
      managed,
      current,
      removeValue(['name'], null),
    );
    expect(removed).toMatchObject({ success: true, changed: true });
    expect(Object.hasOwn(removed.value, 'name')).toBe(false);
  });

  it('retains incompatible-ancestor blocking for nullable sets', () => {
    const current = { profile: null };
    const result = applyFormOperation(
      definition(),
      current,
      setValue(['profile', 'value'], { kind: 'missing' }, null),
    );
    expect(result).toMatchObject({
      success: false,
      changed: false,
      diagnostics: [
        {
          code: 'INCOMPATIBLE_OPERATION_ANCESTOR',
          dataPath: ['profile'],
          parameters: {
            reason: 'non-object-ancestor',
            actualType: 'null',
          },
        },
      ],
    });
    expect(result.value).toBe(current);
  });

  it('keeps external null as data, delegates validation with schema identity and tracks dirty exactly', () => {
    const originalSchema = schema();
    const validate = vi.fn(() => ({ valid: true as const, issues: [] }));
    const created = createControlledFormRuntime<Record<string, unknown>>({
      formId: 'form',
      definition: definition(),
      schema: originalSchema,
      value: { name: null, scalar: '', profile: { value: false } },
      baselineValue: { name: null, scalar: '', profile: { value: false } },
      locale: 'en',
      validator: { validate },
    });
    expect(created.success).toBe(true);
    if (!created.success) return;
    expect(validate).toHaveBeenCalledWith(originalSchema, expect.anything());
    expect(created.runtime.getFieldSnapshot(['name'])).toMatchObject({
      presence: { kind: 'value', value: null },
      dirty: false,
    });

    const operations: FormOperation[] = [];
    created.runtime.subscribeOperations((operation) =>
      operations.push(operation),
    );
    created.runtime.updateExternalState({ value: { name: '', scalar: '' } });
    expect(operations).toEqual([]);
    expect(created.runtime.getFieldSnapshot(['name'])).toMatchObject({
      presence: { kind: 'value', value: '' },
      dirty: true,
    });
    created.runtime.updateExternalState({ value: {} });
    expect(created.runtime.getFieldSnapshot(['name'])).toMatchObject({
      presence: { kind: 'missing' },
      dirty: true,
    });
  });

  it('keeps externally supplied null present on a non-nullable field', () => {
    const created = createControlledFormRuntime({
      formId: 'form',
      definition: definition(false),
      schema: schema(false),
      value: { scalar: null },
      baselineValue: { scalar: null },
      locale: 'en',
      validator: { validate: () => ({ valid: true, issues: [] }) },
    });
    expect(created.success).toBe(true);
    if (!created.success) return;
    expect(created.runtime.getFieldSnapshot(['scalar'])).toMatchObject({
      presence: { kind: 'value', value: null },
      dirty: false,
    });
    expect(created.runtime.requestSetValue(['scalar'], null)).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INCOMPATIBLE_OPERATION_VALUE',
          parameters: { actualType: 'null' },
        },
      ],
    });
  });

  it('emits one frozen direct null intention without optimistic projection', () => {
    const created = createControlledFormRuntime({
      formId: 'form',
      definition: definition(),
      schema: schema(),
      value: { name: 'before' },
      baselineValue: { name: 'before' },
      locale: 'en',
      validator: { validate: () => ({ valid: true, issues: [] }) },
    });
    expect(created.success).toBe(true);
    if (!created.success) return;
    const emitted: FormOperation[] = [];
    created.runtime.subscribeOperations((operation) => emitted.push(operation));
    expect(created.runtime.requestSetValue(['name'], null)).toMatchObject({
      success: true,
      effects: { snapshotChanged: false, operationEmitted: true },
    });
    expect(emitted).toMatchObject([
      {
        type: 'set-value',
        path: ['name'],
        expected: { kind: 'value', value: 'before' },
        value: null,
      },
    ]);
    expect(Object.isFrozen(emitted[0])).toBe(true);
    expect(created.runtime.getFieldSnapshot(['name'])).toMatchObject({
      presence: { kind: 'value', value: 'before' },
    });
  });

  it('emits missing-ancestor null materialization and suppresses incompatible ancestors and null no-effects', () => {
    const create = (value: Record<string, unknown>) =>
      createControlledFormRuntime<Record<string, unknown>>({
        formId: 'form',
        definition: definition(),
        schema: schema(),
        value,
        baselineValue: value,
        locale: 'en',
        validator: { validate: () => ({ valid: true, issues: [] }) },
      });

    const missing = create({});
    expect(missing.success).toBe(true);
    if (!missing.success) return;
    const emitted: FormOperation[] = [];
    missing.runtime.subscribeOperations((operation) => emitted.push(operation));
    expect(
      missing.runtime.requestSetValue(['profile', 'value'], null),
    ).toMatchObject({
      success: true,
      effects: { operationEmitted: true, snapshotChanged: false },
    });
    expect(emitted[0]).toMatchObject({
      type: 'set-value',
      path: ['profile', 'value'],
      expected: { kind: 'missing' },
      value: null,
    });

    const incompatible = create({ profile: null });
    expect(incompatible.success).toBe(true);
    if (!incompatible.success) return;
    expect(
      incompatible.runtime.requestSetValue(['profile', 'value'], null),
    ).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INCOMPATIBLE_RUNTIME_ANCESTOR',
          parameters: { reason: 'incompatible-ancestor', actualType: 'null' },
        },
      ],
    });

    const confirmed = create({ name: null });
    expect(confirmed.success).toBe(true);
    if (!confirmed.success) return;
    expect(confirmed.runtime.requestSetValue(['name'], null)).toMatchObject({
      success: true,
      effects: { operationEmitted: false, snapshotChanged: false },
    });
  });

  it('emits nullable collection null intentions and rejects non-nullable ones', () => {
    const create = (nullable: boolean) =>
      createControlledFormRuntime({
        formId: 'form',
        definition: definition(nullable),
        schema: schema(nullable),
        value: { rows: [{ id: 'a', value: 'before' }] },
        baselineValue: { rows: [{ id: 'a', value: 'before' }] },
        locale: 'en',
        validator: { validate: () => ({ valid: true, issues: [] }) },
      });
    const nullable = create(true);
    expect(nullable.success).toBe(true);
    if (!nullable.success) return;
    const emitted: FormOperation[] = [];
    nullable.runtime.subscribeOperations((operation) =>
      emitted.push(operation),
    );
    const target = {
      collectionPath: ['rows'],
      itemId: 'a',
      relativePath: ['value'],
    } as const;
    expect(nullable.runtime.requestSetItemValue(target, null)).toMatchObject({
      success: true,
      effects: { operationEmitted: true, snapshotChanged: false },
    });
    expect(emitted).toMatchObject([
      {
        type: 'set-item-value',
        target,
        expected: { kind: 'value', value: 'before' },
        value: null,
      },
    ]);

    const scalar = create(false);
    expect(scalar.success).toBe(true);
    if (!scalar.success) return;
    expect(scalar.runtime.requestSetItemValue(target, null)).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INCOMPATIBLE_COLLECTION_OPERATION_VALUE',
          parameters: { reason: 'leaf-type', actualType: 'null' },
        },
      ],
    });
  });
});
