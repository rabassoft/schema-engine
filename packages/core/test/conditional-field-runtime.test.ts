import { describe, expect, it, vi } from 'vitest';
import {
  compileFormDefinition,
  createControlledFormRuntime,
  type FormDefinition,
  type FormRuntime,
  type StringFieldDefinition,
  type ValidationResult,
} from '../src/index.js';

const DIALECT = 'https://json-schema.org/draft/2020-12/schema';

function createRuntime(
  properties: Record<string, unknown>,
  uiSchema: Record<string, unknown>,
  value: Record<string, unknown>,
  baselineValue: Record<string, unknown> = value,
  validate = vi.fn((_schema: unknown, _value: unknown): ValidationResult => {
    void _schema;
    void _value;
    return { valid: true, issues: Object.freeze([]) };
  }),
): {
  readonly runtime: FormRuntime<Record<string, unknown>>;
  readonly schema: Readonly<Record<string, unknown>>;
  readonly validate: typeof validate;
} {
  const runtimeSchema = { type: 'object' } as const;
  const compiled = compileFormDefinition({
    schema: {
      $schema: DIALECT,
      type: 'object',
      properties,
    },
    uiSchema,
    ...(Object.hasOwn(properties, 'rows')
      ? {
          collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
        }
      : {}),
  });
  expect(compiled.success).toBe(true);
  if (!compiled.success) throw new Error('compile failed');
  const created = createControlledFormRuntime({
    formId: 'conditional-runtime',
    definition: compiled.definition,
    schema: runtimeSchema,
    value,
    baselineValue,
    locale: 'en',
    validator: { validate },
  });
  expect(created.success).toBe(true);
  if (!created.success) throw new Error('runtime creation failed');
  return { runtime: created.runtime, schema: runtimeSchema, validate };
}

function directFixture() {
  return createRuntime(
    {
      mode: { type: 'string' },
      count: { type: 'number' },
      nullable: { type: ['string', 'null'] },
      visibleTarget: { type: 'string' },
      enabledTarget: { type: 'string' },
      bothTarget: { type: 'string' },
      fixed: { type: 'string', const: 'fixed' },
    },
    {
      fields: {
        visibleTarget: {
          visibleWhen: { path: ['mode'], equals: 'show' },
        },
        enabledTarget: {
          enabledWhen: { path: ['count'], equals: -0 },
        },
        bothTarget: {
          visibleWhen: { path: ['mode'], equals: 'show' },
          enabledWhen: { path: ['count'], equals: -0 },
        },
        fixed: {
          visibleWhen: { path: ['nullable'], equals: null },
        },
      },
    },
    {
      mode: 'show',
      count: -0,
      nullable: null,
      visibleTarget: 'visible',
      enabledTarget: 'enabled',
      bothTarget: 'both',
      fixed: 'fixed',
    },
  );
}

describe('M30 controlled conditional runtime state', () => {
  it('publishes exact initial/default/fixed flags with strict Object.is matching', () => {
    const { runtime, validate } = directFixture();
    expect(validate).toHaveBeenCalledTimes(1);
    expect(runtime.getFieldSnapshot(['mode'])).toMatchObject({
      visible: true,
      enabled: true,
    });
    expect(runtime.getFieldSnapshot(['visibleTarget'])).toMatchObject({
      visible: true,
      enabled: true,
    });
    expect(runtime.getFieldSnapshot(['enabledTarget'])).toMatchObject({
      visible: true,
      enabled: true,
    });
    expect(runtime.getFieldSnapshot(['fixed'])).toMatchObject({
      visible: true,
      enabled: true,
    });
    expect(Object.isFrozen(runtime.getFieldSnapshot(['visibleTarget']))).toBe(
      true,
    );

    expect(
      runtime.updateExternalState({
        value: {
          ...runtime.getSnapshot().value,
          count: 0,
          nullable: 'not-null',
        },
      }),
    ).toMatchObject({ success: true, effects: { snapshotChanged: true } });
    expect(runtime.getFieldSnapshot(['enabledTarget'])?.enabled).toBe(false);
    expect(runtime.getFieldSnapshot(['fixed'])).toMatchObject({
      visible: false,
      enabled: true,
    });
    expect(validate).toHaveBeenCalledTimes(2);
  });

  it('evaluates missing, blocked, null, false, zero and empty-string sources', () => {
    const { runtime } = createRuntime(
      {
        profile: {
          type: 'object',
          properties: { flag: { type: 'boolean' } },
        },
        nullable: { type: ['string', 'null'] },
        count: { type: 'number' },
        text: { type: 'string' },
        nestedTarget: { type: 'string' },
        nullTarget: { type: 'string' },
        zeroTarget: { type: 'string' },
        emptyTarget: { type: 'string' },
      },
      {
        fields: {
          nestedTarget: {
            visibleWhen: { path: ['profile', 'flag'], equals: false },
          },
          nullTarget: {
            visibleWhen: { path: ['nullable'], equals: null },
          },
          zeroTarget: { visibleWhen: { path: ['count'], equals: 0 } },
          emptyTarget: { visibleWhen: { path: ['text'], equals: '' } },
        },
      },
      { profile: { flag: false }, nullable: null, count: 0, text: '' },
    );
    expect(
      ['nestedTarget', 'nullTarget', 'zeroTarget', 'emptyTarget'].map(
        (name) => runtime.getFieldSnapshot([name])?.visible,
      ),
    ).toEqual([true, true, true, true]);

    runtime.updateExternalState({
      value: { profile: 'blocked', count: 1, text: 'value' },
    });
    expect(
      ['nestedTarget', 'nullTarget', 'zeroTarget', 'emptyTarget'].map(
        (name) => runtime.getFieldSnapshot([name])?.visible,
      ),
    ).toEqual([false, false, false, false]);
  });

  it('evaluates only accepted new value references', () => {
    const value = { source: 'match', target: 'value' };
    const compiled = compileFormDefinition({
      schema: {
        $schema: DIALECT,
        type: 'object',
        properties: {
          source: { type: 'string' },
          target: { type: 'string' },
        },
      },
      uiSchema: {
        fields: {
          target: { visibleWhen: { path: ['source'], equals: 'match' } },
        },
      },
    });
    expect(compiled.success).toBe(true);
    if (!compiled.success) return;
    const created = createControlledFormRuntime({
      formId: 'detached',
      definition: compiled.definition,
      schema: {},
      value,
      baselineValue: value,
      locale: 'en',
      validator: { validate: () => ({ valid: true, issues: [] }) },
    });
    expect(created.success).toBe(true);
    if (!created.success) return;
    const runtime = created.runtime;
    const initialField = runtime.getFieldSnapshot(['target']);

    value.source = 'changed-in-place';
    runtime.updateExternalState({ value, locale: 'es' });
    expect(runtime.getFieldSnapshot(['target'])).toBe(initialField);
    expect(runtime.getFieldSnapshot(['target'])?.visible).toBe(true);

    runtime.updateExternalState({ value: { ...value } });
    expect(runtime.getFieldSnapshot(['target'])?.visible).toBe(false);
  });

  it('detaches manual-definition predicates from later caller mutation', () => {
    const mutableCondition = {
      sourcePath: ['source'],
      equals: 'match',
    };
    const source: StringFieldDefinition = {
      key: '["source"]',
      name: 'source',
      path: ['source'],
      required: false,
      label: 'Source',
      kind: 'string',
      nullable: false,
      constraints: {},
    };
    const target: StringFieldDefinition = {
      key: '["target"]',
      name: 'target',
      path: ['target'],
      required: false,
      label: 'Target',
      kind: 'string',
      nullable: false,
      constraints: {},
      visibleWhen: mutableCondition,
    };
    const definition: FormDefinition = {
      nodes: [source, target],
      fields: [source, target],
      presentation: [
        { kind: 'form-node', node: source },
        { kind: 'form-node', node: target },
      ],
    };
    const created = createControlledFormRuntime({
      formId: 'detached-manual-definition',
      definition,
      schema: {},
      value: { source: 'match', target: 'value' },
      baselineValue: { source: 'match', target: 'value' },
      locale: 'en',
      validator: { validate: () => ({ valid: true, issues: [] }) },
    });
    expect(created.success).toBe(true);
    if (!created.success) return;

    mutableCondition.sourcePath[0] = 'target';
    mutableCondition.equals = 'changed';
    created.runtime.updateExternalState({
      value: { source: 'match', target: 'value' },
    });

    expect(created.runtime.getFieldSnapshot(['target'])?.visible).toBe(true);
    expect(Object.isFrozen(mutableCondition)).toBe(false);
    expect(Object.isFrozen(mutableCondition.sourcePath)).toBe(false);
  });

  it('does not reevaluate for same-reference, baseline, locale, visibility, touched, scope or async transitions', async () => {
    const value = { source: 'show', target: 'value' };
    const compiled = compileFormDefinition({
      schema: {
        $schema: DIALECT,
        type: 'object',
        properties: {
          source: { type: 'string' },
          target: { type: 'string' },
        },
      },
      uiSchema: {
        fields: {
          target: { visibleWhen: { path: ['source'], equals: 'show' } },
        },
      },
    });
    expect(compiled.success).toBe(true);
    if (!compiled.success) return;
    let settle!: (result: ValidationResult) => void;
    const pending = new Promise<ValidationResult>((resolve) => {
      settle = resolve;
    });
    const asyncValidate = vi.fn(() => pending);
    const created = createControlledFormRuntime({
      formId: 'conditional-schedule',
      definition: compiled.definition,
      schema: {},
      value,
      baselineValue: value,
      locale: 'en',
      validator: { validate: () => ({ valid: true, issues: [] }) },
      asyncValidator: { validate: asyncValidate },
    });
    expect(created.success).toBe(true);
    if (!created.success) return;
    const runtime = created.runtime;
    const remainsCached = () =>
      expect(runtime.getFieldSnapshot(['target'])?.visible).toBe(true);

    value.source = 'hide';
    runtime.updateExternalState({ value });
    remainsCached();
    runtime.updateExternalState({ baselineValue: { ...value } });
    remainsCached();
    runtime.updateExternalState({ locale: 'es' });
    remainsCached();
    runtime.showValidationErrors({ id: 'target', paths: [['target']] });
    remainsCached();
    runtime.focus(['target']);
    runtime.blur(['target']);
    runtime.resetTouched({ id: 'target', paths: [['target']] });
    runtime.hideValidationErrors('target');
    remainsCached();

    settle({ valid: true, issues: [] });
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    remainsCached();
    expect(asyncValidate).toHaveBeenCalledTimes(1);
  });

  it('preserves sharing when flags do not change and rebuilds only affected ancestors', () => {
    const { runtime } = createRuntime(
      {
        source: { type: 'string' },
        profile: {
          type: 'object',
          properties: {
            target: { type: 'string' },
            sibling: { type: 'string' },
          },
        },
        other: { type: 'string' },
      },
      {
        fields: {
          profile: {
            fields: {
              target: {
                visibleWhen: { path: ['source'], equals: 'show' },
              },
            },
          },
        },
      },
      {
        source: 'show',
        profile: { target: 'target', sibling: 'sibling' },
        other: 'other',
      },
    );
    const before = runtime.getSnapshot();
    const targetBefore = runtime.getFieldSnapshot(['profile', 'target']);
    const siblingBefore = runtime.getFieldSnapshot(['profile', 'sibling']);
    const otherBefore = runtime.getFieldSnapshot(['other']);
    const profileBefore = runtime.getNodeSnapshot(['profile']);

    runtime.updateExternalState({
      value: { ...before.value, other: 'changed' },
    });
    expect(runtime.getFieldSnapshot(['profile', 'target'])).toBe(targetBefore);
    expect(runtime.getFieldSnapshot(['profile', 'sibling'])).toBe(
      siblingBefore,
    );
    expect(runtime.getNodeSnapshot(['profile'])).toBe(profileBefore);
    expect(runtime.getFieldSnapshot(['other'])).not.toBe(otherBefore);
    const otherAfterChange = runtime.getFieldSnapshot(['other']);

    runtime.updateExternalState({
      value: { ...runtime.getSnapshot().value, source: 'hide' },
    });
    expect(runtime.getFieldSnapshot(['profile', 'target'])).not.toBe(
      targetBefore,
    );
    expect(runtime.getFieldSnapshot(['profile', 'sibling'])).toBe(
      siblingBefore,
    );
    expect(runtime.getFieldSnapshot(['other'])).toBe(otherAfterChange);
    expect(runtime.getNodeSnapshot(['profile'])).not.toBe(profileBefore);
  });

  it('clears inactive focus atomically without touching or restoring it', () => {
    const { runtime } = directFixture();
    expect(runtime.focus(['bothTarget'])).toMatchObject({ success: true });
    expect(runtime.getFieldSnapshot(['bothTarget'])?.focused).toBe(true);
    const snapshots: ReturnType<typeof runtime.getSnapshot>[] = [];
    const operations = vi.fn();
    runtime.subscribe((snapshot) => snapshots.push(snapshot));
    runtime.subscribeOperations(operations);

    runtime.updateExternalState({
      value: { ...runtime.getSnapshot().value, mode: 'hide' },
    });
    expect(runtime.getFieldSnapshot(['bothTarget'])).toMatchObject({
      visible: false,
      focused: false,
      touched: false,
    });
    expect(snapshots).toHaveLength(1);
    expect(
      snapshots[0]?.fields.find(({ key }) => key === '["bothTarget"]'),
    ).toMatchObject({ visible: false, focused: false, touched: false });
    expect(operations).not.toHaveBeenCalled();

    runtime.updateExternalState({
      value: { ...runtime.getSnapshot().value, mode: 'show' },
    });
    expect(runtime.getFieldSnapshot(['bothTarget'])).toMatchObject({
      visible: true,
      focused: false,
      touched: false,
    });

    runtime.focus(['bothTarget']);
    runtime.blur(['bothTarget']);
    runtime.focus(['bothTarget']);
    runtime.updateExternalState({
      value: { ...runtime.getSnapshot().value, count: 1 },
    });
    expect(runtime.getFieldSnapshot(['bothTarget'])).toMatchObject({
      enabled: false,
      focused: false,
      touched: true,
    });
  });

  it.each([
    [
      'requestSetValue',
      (runtime: FormRuntime<object>) =>
        runtime.requestSetValue(['bothTarget'], 'next'),
    ],
    [
      'requestRemoveValue',
      (runtime: FormRuntime<object>) =>
        runtime.requestRemoveValue(['bothTarget']),
    ],
    ['focus', (runtime: FormRuntime<object>) => runtime.focus(['bothTarget'])],
    ['blur', (runtime: FormRuntime<object>) => runtime.blur(['bothTarget'])],
  ] as const)(
    'blocks %s on hidden fields before no-effect handling',
    (action, invoke) => {
      const { runtime } = directFixture();
      const operations = vi.fn();
      runtime.subscribeOperations(operations);
      runtime.updateExternalState({
        value: { ...runtime.getSnapshot().value, mode: 'hide', count: 1 },
      });
      const before = runtime.getSnapshot();
      const result = invoke(runtime);
      expect(result).toMatchObject({
        success: false,
        effects: { snapshotChanged: false, operationEmitted: false },
        diagnostics: [
          {
            code: 'INACTIVE_RUNTIME_FIELD',
            dataPath: ['bothTarget'],
            parameters: { action, reason: 'hidden' },
            fallbackMessage:
              'Runtime action is blocked by conditional field state.',
          },
        ],
      });
      expect(runtime.getSnapshot()).toBe(before);
      expect(operations).not.toHaveBeenCalled();
      expect(Object.isFrozen(result)).toBe(true);
      expect(Object.isFrozen(result.diagnostics)).toBe(true);
      expect(Object.isFrozen(result.diagnostics[0]?.dataPath)).toBe(true);
      expect(Object.isFrozen(result.diagnostics[0]?.parameters)).toBe(true);
      expect(result.diagnostics[0]).toMatchObject({
        severity: 'error',
        source: 'runtime',
      });
      expect(result.diagnostics[0]).not.toHaveProperty('documentPath');
    },
  );

  it.each([
    [
      'requestSetValue',
      (runtime: FormRuntime<object>) =>
        runtime.requestSetValue(['bothTarget'], 'both'),
    ],
    [
      'requestRemoveValue',
      (runtime: FormRuntime<object>) =>
        runtime.requestRemoveValue(['bothTarget']),
    ],
    ['focus', (runtime: FormRuntime<object>) => runtime.focus(['bothTarget'])],
    ['blur', (runtime: FormRuntime<object>) => runtime.blur(['bothTarget'])],
  ] as const)('blocks %s on disabled fields', (action, invoke) => {
    const { runtime } = directFixture();
    runtime.updateExternalState({
      value: { ...runtime.getSnapshot().value, count: 1 },
    });
    const before = runtime.getSnapshot();
    expect(invoke(runtime)).toMatchObject({
      success: false,
      effects: { snapshotChanged: false, operationEmitted: false },
      diagnostics: [
        {
          code: 'INACTIVE_RUNTIME_FIELD',
          parameters: { action, reason: 'disabled' },
        },
      ],
    });
    expect(runtime.getSnapshot()).toBe(before);
  });

  it('keeps active direct actions on their accepted success paths', () => {
    const { runtime } = directFixture();
    expect(runtime.requestSetValue(['bothTarget'], 'next')).toMatchObject({
      success: true,
      effects: { snapshotChanged: false, operationEmitted: true },
    });
    expect(runtime.requestRemoveValue(['bothTarget'])).toMatchObject({
      success: true,
      effects: { snapshotChanged: false, operationEmitted: true },
    });
    expect(runtime.focus(['bothTarget'])).toMatchObject({
      success: true,
      effects: { snapshotChanged: true, operationEmitted: false },
    });
    expect(runtime.blur(['bothTarget'])).toMatchObject({
      success: true,
      effects: { snapshotChanged: true, operationEmitted: false },
    });
  });

  it('blocks a hidden remove before the existing missing-value no-effect path', () => {
    const { runtime } = directFixture();
    const withoutTarget = {
      ...(runtime.getSnapshot().value as Record<string, unknown>),
    };
    delete withoutTarget.bothTarget;
    runtime.updateExternalState({
      value: { ...withoutTarget, mode: 'hide' },
    });
    expect(runtime.requestRemoveValue(['bothTarget'])).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INACTIVE_RUNTIME_FIELD',
          parameters: { action: 'requestRemoveValue', reason: 'hidden' },
        },
      ],
    });
  });

  it('uses disabled after hidden and after compatibility/ancestor precedence', () => {
    const { runtime } = directFixture();
    runtime.updateExternalState({
      value: { ...runtime.getSnapshot().value, count: 1 },
    });
    expect(runtime.requestRemoveValue(['bothTarget'])).toMatchObject({
      diagnostics: [
        {
          code: 'INACTIVE_RUNTIME_FIELD',
          parameters: { action: 'requestRemoveValue', reason: 'disabled' },
        },
      ],
    });
    expect(runtime.requestSetValue(['bothTarget'], 1)).toMatchObject({
      diagnostics: [{ code: 'INCOMPATIBLE_OPERATION_VALUE' }],
    });

    const nested = createRuntime(
      {
        mode: { type: 'string' },
        profile: {
          type: 'object',
          properties: { target: { type: 'string' } },
        },
      },
      {
        fields: {
          profile: {
            fields: {
              target: {
                visibleWhen: { path: ['mode'], equals: 'show' },
              },
            },
          },
        },
      },
      { mode: 'hide', profile: 'incompatible' },
    ).runtime;
    expect(nested.requestRemoveValue(['profile', 'target'])).toMatchObject({
      diagnostics: [{ code: 'INCOMPATIBLE_RUNTIME_ANCESTOR' }],
    });
  });

  it('keeps collection item flags constant true', () => {
    const { runtime } = createRuntime(
      {
        rows: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              value: { type: 'string' },
            },
            required: ['id'],
          },
        },
      },
      {},
      { rows: [{ id: 'a', value: 'value' }] },
    );
    expect(
      runtime.getCollectionNodeSnapshot({
        collectionPath: ['rows'],
        itemId: 'a',
        relativePath: ['value'],
      }),
    ).toMatchObject({ nodeKind: 'field', visible: true, enabled: true });
  });

  it('preserves controlled value, baseline, dirty, scopes, validation, issues and operation history while hidden', () => {
    const issue = Object.freeze({
      code: 'target-invalid',
      path: Object.freeze(['target']),
      parameters: Object.freeze({}),
    });
    const validate = vi.fn(
      (_receivedSchema: unknown, _receivedValue: unknown): ValidationResult => {
        void _receivedSchema;
        void _receivedValue;
        return { valid: false, issues: [issue] };
      },
    );
    const initial = { source: 'show', target: 'invalid' };
    const { runtime, schema } = createRuntime(
      {
        source: { type: 'string' },
        target: { type: 'string' },
      },
      {
        fields: {
          target: { visibleWhen: { path: ['source'], equals: 'show' } },
        },
      },
      initial,
      initial,
      validate,
    );
    const operations = vi.fn();
    runtime.subscribeOperations(operations);
    runtime.showValidationErrors({ id: 'target', paths: [['target']] });
    const nextValue = { source: 'hide', target: 'invalid' };

    runtime.updateExternalState({ value: nextValue });

    const snapshot = runtime.getSnapshot();
    expect(snapshot.value).toBe(nextValue);
    expect(snapshot).toMatchObject({ valid: false, dirty: true });
    expect(runtime.getFieldSnapshot(['target'])).toMatchObject({
      visible: false,
      valid: false,
      showIssues: true,
      issues: [issue],
    });
    expect(
      runtime.getValidationSnapshot({ id: 'target', paths: [['target']] }),
    ).toMatchObject({ valid: false, issues: [issue] });
    expect(validate).toHaveBeenCalledTimes(2);
    expect(validate.mock.calls.every(([received]) => received === schema)).toBe(
      true,
    );
    expect(operations).not.toHaveBeenCalled();
  });
});
