import { describe, expect, it, vi } from 'vitest';
import {
  commitScopeToBaseline,
  createControlledFormRuntime,
  type AsyncSchemaValidator,
  type ControlledFormRuntimeOptions,
  type FormDefinition,
  type FormOperation,
  type StringEnumArrayFieldDefinition,
  type ValidationIssue,
} from '../src/index.js';
import { withDefaultPresentation } from './definition-fixtures.js';

const field: StringEnumArrayFieldDefinition = {
  key: '["roles"]',
  name: 'roles',
  path: ['roles'],
  required: true,
  label: 'Roles',
  kind: 'string-enum-array',
  nullable: false,
  choices: [
    { value: 'reader', label: 'Reader' },
    { value: 'editor', label: 'Editor' },
    { value: 'reviewer', label: 'Reviewer' },
  ],
};

const definition: FormDefinition = withDefaultPresentation({
  nodes: [field],
  fields: [field],
});

function options(
  overrides: Partial<
    ControlledFormRuntimeOptions<Record<string, unknown>>
  > = {},
): ControlledFormRuntimeOptions<Record<string, unknown>> {
  return {
    formId: 'm31-controlled',
    definition,
    schema: { type: 'object' },
    value: {},
    baselineValue: {},
    locale: 'en',
    validator: { validate: () => ({ valid: true, issues: [] }) },
    ...overrides,
  };
}

function create(
  overrides: Partial<
    ControlledFormRuntimeOptions<Record<string, unknown>>
  > = {},
) {
  const created = createControlledFormRuntime(options(overrides));
  expect(created.success).toBe(true);
  if (!created.success) throw new Error('runtime creation failed');
  return created.runtime;
}

async function flushAsync(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

describe('M31 controlled empty and removal semantics', () => {
  it('sets missing to an empty array without optimistic state and removes present empty', () => {
    const runtime = create();
    const operations: FormOperation[] = [];
    runtime.subscribeOperations((operation) => operations.push(operation));
    const initial = runtime.getSnapshot();

    expect(runtime.requestRemoveValue(['roles'])).toMatchObject({
      success: true,
      effects: { operationEmitted: false, snapshotChanged: false },
    });
    expect(runtime.requestSetValue(['roles'], [])).toMatchObject({
      success: true,
      effects: { operationEmitted: true, snapshotChanged: false },
    });
    expect(runtime.getSnapshot()).toBe(initial);
    expect(operations[0]).toMatchObject({
      type: 'set-value',
      path: ['roles'],
      expected: { kind: 'missing' },
      value: [],
    });

    const empty = (
      operations[0] as Extract<FormOperation, { type: 'set-value' }>
    ).value;
    expect(
      runtime.updateExternalState({ value: { roles: empty } }),
    ).toMatchObject({
      success: true,
      effects: { snapshotChanged: true, operationEmitted: false },
    });
    expect(runtime.getFieldSnapshot(['roles'])?.presence).toEqual({
      kind: 'value',
      value: [],
    });

    expect(runtime.requestRemoveValue(['roles'])).toMatchObject({
      success: true,
      effects: { operationEmitted: true, snapshotChanged: false },
    });
    expect(operations[1]).toMatchObject({
      type: 'remove-value',
      expected: { kind: 'value', value: [] },
    });
    expect(
      (operations[1] as Extract<FormOperation, { type: 'remove-value' }>)
        .expected.value,
    ).toBe(empty);
  });

  it('allows explicit removal of required and safely incompatible present values', () => {
    const issue = { code: 'required', path: ['roles'], parameters: {} };
    for (const value of [[], ['reader'], 42]) {
      const runtime = create({
        value: { roles: value },
        validator: { validate: () => ({ valid: false, issues: [issue] }) },
      });
      const operations: FormOperation[] = [];
      runtime.subscribeOperations((operation) => operations.push(operation));
      expect(runtime.requestRemoveValue(['roles'])).toMatchObject({
        success: true,
        effects: { operationEmitted: true, snapshotChanged: false },
      });
      expect(operations).toHaveLength(1);
      expect(operations[0]?.type).toBe('remove-value');
    }
  });
});

describe('M31 ordered dirty and immutable reconciliation', () => {
  it.each([
    ['both missing', {}, {}, false],
    ['missing versus empty', {}, { roles: [] }, true],
    ['empty copies', { roles: [] }, { roles: [] }, false],
    [
      'ordered copies',
      { roles: ['reader', 'editor'] },
      { roles: ['reader', 'editor'] },
      false,
    ],
    [
      'different order',
      { roles: ['editor', 'reader'] },
      { roles: ['reader', 'editor'] },
      true,
    ],
    [
      'duplicate copies',
      { roles: ['reader', 'reader'] },
      { roles: ['reader', 'reader'] },
      false,
    ],
    ['same incompatible identity', undefined, undefined, false],
    ['different incompatible arrays', { roles: [1] }, { roles: [1] }, true],
  ] as const)('computes %s exactly', (_name, rawValue, rawBaseline, dirty) => {
    const shared = [1];
    const value: Record<string, unknown> =
      rawValue === undefined ? { roles: shared } : rawValue;
    const baselineValue: Record<string, unknown> =
      rawBaseline === undefined ? { roles: shared } : rawBaseline;
    const runtime = create({ value, baselineValue });

    expect(runtime.getFieldSnapshot(['roles'])?.dirty).toBe(dirty);
    expect(runtime.getSnapshot().dirty).toBe(dirty);
  });

  it('uses Object.is fallback for sparse and non-string values', () => {
    const sparse = Array(1);
    const same = create({
      value: { roles: sparse },
      baselineValue: { roles: sparse },
    });
    expect(same.getSnapshot().dirty).toBe(false);

    const different = create({
      value: { roles: Array(1) },
      baselineValue: { roles: Array(1) },
    });
    expect(different.getSnapshot().dirty).toBe(true);
  });

  it('validates immutable replacements once and does not detect in-place updates', () => {
    const schema = { type: 'object' };
    const firstArray = ['reader'];
    const firstRoot = { roles: firstArray };
    const validate = vi.fn(
      (receivedSchema: unknown, receivedValue: unknown) => {
        expect(receivedSchema).toBe(schema);
        expect(receivedValue).toBe(firstRoot);
        return { valid: true, issues: [] };
      },
    );
    const runtime = create({
      schema,
      value: firstRoot,
      baselineValue: { roles: ['reader'] },
      validator: { validate },
    });
    expect(validate).toHaveBeenCalledTimes(1);
    const snapshots: unknown[] = [];
    runtime.subscribe((snapshot) => snapshots.push(snapshot));

    const replacement = { roles: ['reader'] };
    validate.mockImplementation((_schema, receivedValue) => {
      expect(receivedValue).toBe(replacement);
      return { valid: true, issues: [] };
    });
    expect(runtime.updateExternalState({ value: replacement })).toMatchObject({
      success: true,
      effects: { snapshotChanged: true, operationEmitted: false },
    });
    expect(validate).toHaveBeenCalledTimes(2);
    expect(snapshots).toHaveLength(1);
    expect(runtime.getSnapshot().value).toBe(replacement);
    expect(runtime.getSnapshot().dirty).toBe(false);

    replacement.roles.push('editor');
    const before = runtime.getSnapshot();
    expect(runtime.updateExternalState({ value: replacement })).toMatchObject({
      success: true,
      effects: { snapshotChanged: false, operationEmitted: false },
    });
    expect(runtime.getSnapshot()).toBe(before);
    expect(validate).toHaveBeenCalledTimes(2);
  });

  it('keeps focus and touched while a baseline-only replacement changes dirty', () => {
    const validate = vi.fn(() => ({ valid: true, issues: [] }));
    const runtime = create({
      value: { roles: ['reader'] },
      baselineValue: { roles: ['editor'] },
      validator: { validate },
    });
    runtime.focus(['roles']);
    runtime.blur(['roles']);
    runtime.focus(['roles']);
    expect(runtime.getFieldSnapshot(['roles'])).toMatchObject({
      dirty: true,
      touched: true,
      focused: true,
    });

    expect(
      runtime.updateExternalState({ baselineValue: { roles: ['reader'] } }),
    ).toMatchObject({ success: true, effects: { snapshotChanged: true } });
    expect(runtime.getFieldSnapshot(['roles'])).toMatchObject({
      dirty: false,
      touched: true,
      focused: true,
    });
    expect(validate).toHaveBeenCalledTimes(1);
  });
});

describe('M31 validator issue ownership', () => {
  it('assigns array, numeric, deep and out-of-range issues to one field in order', () => {
    const issues: ValidationIssue[] = [
      { code: 'array', path: ['roles'], parameters: {} },
      { code: 'item', path: ['roles', 0], parameters: {} },
      { code: 'deep', path: ['roles', 0, 'detail'], parameters: {} },
      { code: 'out-of-range', path: ['roles', 999], parameters: {} },
    ];
    const created = createControlledFormRuntime(
      options({
        value: { roles: ['reader'] },
        validator: { validate: () => ({ valid: false, issues }) },
      }),
    );
    expect(created.success).toBe(true);
    if (!created.success) return;
    expect(created.diagnostics).toEqual([]);
    const runtime = created.runtime;
    expect(
      runtime.getFieldSnapshot(['roles'])?.issues.map(({ code }) => code),
    ).toEqual(['array', 'item', 'deep', 'out-of-range']);
    expect(runtime.getFieldSnapshot(['roles'])).toMatchObject({ valid: false });
    expect(runtime.getSnapshot().globalIssues).toEqual([]);

    const scope = { id: 'roles', paths: [['roles']] as const };
    expect(
      runtime.getValidationSnapshot(scope).issues.map(({ code }) => code),
    ).toEqual(['array', 'item', 'deep', 'out-of-range']);
    expect(runtime.showValidationErrors(scope).success).toBe(true);
    expect(runtime.getFieldSnapshot(['roles'])?.showIssues).toBe(true);
  });

  it('accepts asynchronous numeric issue paths for the same field', async () => {
    const asyncValidator: AsyncSchemaValidator = {
      validate: () =>
        Promise.resolve({
          valid: false,
          issues: [
            { code: 'async-item', path: ['roles', 7, 'deep'], parameters: {} },
          ],
        }),
    };
    const runtime = create({
      value: { roles: ['reader'] },
      asyncValidator,
    });
    await flushAsync();

    expect(runtime.getSnapshot().asyncValidation).toEqual({
      status: 'settled',
      generation: 1,
      valid: false,
    });
    expect(
      runtime.getFieldSnapshot(['roles'])?.issues.map(({ code }) => code),
    ).toEqual(['async-item']);
  });
});

describe('M31 interaction, scopes and condition boundary', () => {
  it('commits only the ordinary field path as one atomic baseline value', () => {
    const currentRoles = ['editor', 'reader'];
    const baseline: Record<string, unknown> = {
      roles: ['reader'],
      untouched: { stable: true },
    };
    const current: Record<string, unknown> = {
      roles: currentRoles,
      untouched: { changed: true },
    };
    const result = commitScopeToBaseline(definition, baseline, current, {
      id: 'roles',
      paths: [['roles']],
    });

    expect(result).toMatchObject({ success: true, changed: true });
    expect(Reflect.get(result.value, 'roles')).toBe(currentRoles);
    expect(Reflect.get(result.value, 'untouched')).toBe(
      Reflect.get(baseline, 'untouched'),
    );

    expect(
      commitScopeToBaseline(definition, baseline, current, {
        id: 'numeric',
        paths: [['roles', 0]],
      }),
    ).toMatchObject({
      success: false,
      diagnostics: [{ code: 'UNCONFIRMABLE_SCOPE_TARGET' }],
    });
  });

  it('keeps one ordinary field target and rejects numeric/item targets', () => {
    const runtime = create({ value: { roles: ['reader'] } });
    expect(runtime.focus(['roles'])).toMatchObject({ success: true });
    expect(runtime.getFieldSnapshot(['roles'])).toMatchObject({
      focused: true,
      touched: false,
    });
    expect(runtime.blur(['roles'])).toMatchObject({ success: true });
    expect(runtime.getFieldSnapshot(['roles'])).toMatchObject({
      focused: false,
      touched: true,
    });

    expect(runtime.focus(['roles', 0])).toMatchObject({
      success: false,
      diagnostics: [{ code: 'UNKNOWN_RUNTIME_PATH' }],
    });
    expect(runtime.requestSetValue(['roles', 0], 'reader')).toMatchObject({
      success: false,
      diagnostics: [{ code: 'UNKNOWN_RUNTIME_PATH' }],
    });
    expect(
      runtime.requestSetItemValue(
        {
          collectionPath: ['roles'],
          itemId: 'reader',
          relativePath: [],
        },
        'reader',
      ),
    ).toMatchObject({ success: false });

    const numericScope = runtime.getValidationSnapshot({
      id: 'numeric',
      paths: [['roles', 0]],
    });
    expect(numericScope.diagnostics).toMatchObject([
      { code: 'UNKNOWN_SCOPE_PATH' },
    ]);
  });

  it('always exposes true condition state for the M31 field', () => {
    const runtime = create({ value: { roles: ['reader'] } });
    expect(runtime.getFieldSnapshot(['roles'])).toMatchObject({
      visible: true,
      enabled: true,
    });
    expect(runtime.requestSetValue(['roles'], ['editor']).success).toBe(true);
    expect(runtime.requestRemoveValue(['roles']).success).toBe(true);
  });
});
