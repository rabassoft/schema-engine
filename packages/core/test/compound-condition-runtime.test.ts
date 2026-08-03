import { describe, expect, it, vi } from 'vitest';
import {
  compileFormDefinition,
  createControlledFormRuntime,
  type FormRuntime,
  type ValidationResult,
} from '../src/index.js';

const DIALECT = 'https://json-schema.org/draft/2020-12/schema';

function createRuntime(
  operator: 'all' | 'any',
  value: Record<string, unknown>,
  validate = vi.fn((schema: unknown, received: unknown): ValidationResult => {
    void schema;
    void received;
    return { valid: true, issues: [] };
  }),
): FormRuntime<Record<string, unknown>> {
  const compiled = compileFormDefinition({
    schema: {
      $schema: DIALECT,
      type: 'object',
      properties: {
        text: { type: 'string' },
        flag: { type: 'boolean' },
        count: { type: 'number' },
        nullable: { type: ['string', 'null'] },
        target: { type: 'string' },
      },
    },
    uiSchema: {
      fields: {
        target: {
          visibleWhen: {
            operator,
            conditions: [
              { path: ['text'], equals: '' },
              { path: ['flag'], equals: false },
              { path: ['count'], equals: 0 },
              { path: ['nullable'], equals: null },
            ],
          },
        },
      },
    },
  });
  expect(compiled.success).toBe(true);
  if (!compiled.success) throw new Error('compile failed');
  const created = createControlledFormRuntime({
    formId: 'compound-runtime',
    definition: compiled.definition,
    schema: {},
    value,
    baselineValue: value,
    locale: 'en',
    validator: { validate },
  });
  expect(created.success).toBe(true);
  if (!created.success) throw new Error('runtime creation failed');
  return created.runtime;
}

describe('M32 compound-condition runtime contract', () => {
  it.each([
    ['all', true, { text: '', flag: false, count: 0, nullable: null }],
    ['all', false, { text: '', flag: true, count: 0, nullable: null }],
    ['all', false, { text: '', flag: false, count: 0 }],
    ['all', false, { text: '', flag: false, count: 0, nullable: {} }],
    ['any', true, { text: 'other', flag: true, count: 1, nullable: null }],
    ['any', true, { text: '', flag: true, count: 1, nullable: 'other' }],
    ['any', false, { text: 'other', flag: true, count: 1 }],
    ['any', false, { text: {}, flag: true, count: 1, nullable: 'other' }],
  ] as const)(
    '%s yields %s for present, missing and incompatible source combinations',
    (operator, expected, sources) => {
      const runtime = createRuntime(operator, {
        ...sources,
        target: 'value',
      });
      expect(runtime.getFieldSnapshot(['target'])?.visible).toBe(expected);
    },
  );

  it('matches assertion-invalid but basically compatible primitive values', () => {
    const compiled = compileFormDefinition({
      schema: {
        $schema: DIALECT,
        type: 'object',
        properties: {
          mode: { type: 'string', minLength: 3 },
          target: { type: 'string' },
        },
      },
      uiSchema: {
        fields: {
          target: {
            enabledWhen: {
              operator: 'any',
              conditions: [
                { path: ['mode'], equals: '' },
                { path: ['mode'], equals: 'other' },
              ],
            },
          },
        },
      },
    });
    expect(compiled.success).toBe(true);
    if (!compiled.success) return;
    const created = createControlledFormRuntime({
      formId: 'assertion-invalid',
      definition: compiled.definition,
      schema: {},
      value: { mode: '', target: 'value' },
      baselineValue: { mode: '', target: 'value' },
      locale: 'en',
      validator: { validate: () => ({ valid: false, issues: [] }) },
    });
    expect(created.success).toBe(true);
    if (!created.success) return;
    expect(created.runtime.getFieldSnapshot(['target'])?.enabled).toBe(true);
  });

  it('traverses every any member in authored order even after a true result', () => {
    const counts = { first: 0, second: 0 };
    const order: string[] = [];
    const next = new Proxy(
      { first: 'match', second: 'miss', target: 'value' },
      {
        getOwnPropertyDescriptor(target, key) {
          if (key === 'first' || key === 'second') {
            counts[key] += 1;
            order.push(key);
          }
          return Reflect.getOwnPropertyDescriptor(target, key);
        },
      },
    );
    const compiled = compileFormDefinition({
      schema: {
        $schema: DIALECT,
        type: 'object',
        properties: {
          first: { type: 'string' },
          second: { type: 'string' },
          target: { type: 'string' },
        },
      },
      uiSchema: {
        fields: {
          target: {
            visibleWhen: {
              operator: 'any',
              conditions: [
                { path: ['first'], equals: 'match' },
                { path: ['second'], equals: 'match' },
              ],
            },
          },
        },
      },
    });
    expect(compiled.success).toBe(true);
    if (!compiled.success) return;
    const initial = { first: 'miss', second: 'miss', target: 'value' };
    const created = createControlledFormRuntime({
      formId: 'complete-traversal',
      definition: compiled.definition,
      schema: {},
      value: initial,
      baselineValue: initial,
      locale: 'en',
      validator: { validate: () => ({ valid: true, issues: [] }) },
    });
    expect(created.success).toBe(true);
    if (!created.success) return;

    created.runtime.updateExternalState({ value: next });

    expect(created.runtime.getFieldSnapshot(['target'])?.visible).toBe(true);
    expect(counts.first).toBeGreaterThan(1);
    expect(counts.second).toBe(counts.first);
    expect(order.slice(-2)).toEqual(['first', 'second']);
  });

  it('retains schedule, sharing, focus reconciliation and stale-action defense', () => {
    const value = {
      text: '',
      flag: false,
      count: 0,
      nullable: null,
      target: 'value',
    };
    const runtime = createRuntime('all', value);
    runtime.focus(['target']);
    const initialTarget = runtime.getFieldSnapshot(['target']);

    value.flag = true;
    runtime.updateExternalState({ value, locale: 'es' });
    expect(runtime.getFieldSnapshot(['target'])).toBe(initialTarget);
    expect(runtime.getFieldSnapshot(['target'])?.visible).toBe(true);

    runtime.updateExternalState({ value: { ...value } });
    expect(runtime.getFieldSnapshot(['target'])).toMatchObject({
      visible: false,
      focused: false,
      touched: false,
    });
    expect(runtime.requestSetValue(['target'], 'next')).toMatchObject({
      success: false,
      effects: { snapshotChanged: false, operationEmitted: false },
      diagnostics: [
        {
          code: 'INACTIVE_RUNTIME_FIELD',
          parameters: { action: 'requestSetValue', reason: 'hidden' },
        },
      ],
    });
  });

  it('preserves value, baseline, dirty, validation, issues, scopes and operation silence', () => {
    const issue = Object.freeze({
      code: 'target-invalid',
      path: Object.freeze(['target']),
      parameters: Object.freeze({}),
    });
    const validate = vi.fn(
      (schema: unknown, value: unknown): ValidationResult => {
        void schema;
        void value;
        return { valid: false, issues: [issue] };
      },
    );
    const initial = {
      text: '',
      flag: false,
      count: 0,
      nullable: null,
      target: 'invalid',
    };
    const runtime = createRuntime('all', initial, validate);
    const operations = vi.fn();
    runtime.subscribeOperations(operations);
    runtime.showValidationErrors({ id: 'target', paths: [['target']] });
    const next = { ...initial, flag: true };

    runtime.updateExternalState({ value: next });

    expect(runtime.getSnapshot()).toMatchObject({
      value: next,
      valid: false,
      dirty: true,
    });
    expect(runtime.getSnapshot().value).toBe(next);
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
    expect(operations).not.toHaveBeenCalled();

    runtime.updateExternalState({ baselineValue: next });
    expect(runtime.getSnapshot().dirty).toBe(false);
    expect(runtime.getFieldSnapshot(['target'])?.visible).toBe(false);
    expect(validate).toHaveBeenCalledTimes(2);
  });
});
