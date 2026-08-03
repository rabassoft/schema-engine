import { describe, expect, it, vi } from 'vitest';
import {
  createControlledFormRuntime,
  type AsyncSchemaValidator,
  type AsyncValidationCancellation,
  type AsyncValidationContext,
  type AsyncValidationState,
  type ControlledFormRuntimeOptions,
  type FormDefinition,
} from '../src/index.js';
import { withDefaultPresentation } from './definition-fixtures.js';

const field = {
  key: '["name"]',
  name: 'name',
  path: ['name'],
  required: true,
  label: 'Name',
  kind: 'string',
  nullable: false,
  constraints: {},
} as const;

const definition: FormDefinition = withDefaultPresentation({
  nodes: [field],
  fields: [field],
});

function options(): ControlledFormRuntimeOptions<Record<string, unknown>> {
  return {
    formId: 'async-contract',
    definition,
    schema: { type: 'object' },
    value: { name: 'Ada' },
    baselineValue: { name: 'Ada' },
    locale: 'en',
    validator: { validate: () => ({ valid: true, issues: [] }) },
  };
}

describe('async validation public contract and option boundary', () => {
  it('root-exports the exact declaration-ready types', () => {
    const cancellation: AsyncValidationCancellation = {
      isCancelled: () => false,
      onCancel: () => () => undefined,
    };
    const context: AsyncValidationContext = { generation: 1, cancellation };
    const validator: AsyncSchemaValidator = {
      validate: () => Promise.resolve({ valid: true, issues: [] }),
    };
    const state: AsyncValidationState = {
      status: 'settled',
      generation: context.generation,
      valid: true,
    };

    expect(validator.validate({}, {}, context)).toBeInstanceOf(Promise);
    expect(state).toEqual({ status: 'settled', generation: 1, valid: true });
  });

  it('preserves exact snapshot shape when absent or own undefined', () => {
    for (const candidate of [
      options(),
      { ...options(), asyncValidator: undefined },
    ]) {
      const result = createControlledFormRuntime(candidate);
      expect(result.success).toBe(true);
      if (!result.success) continue;
      expect(
        Object.hasOwn(result.runtime.getSnapshot(), 'asyncValidation'),
      ).toBe(false);
      expect(
        Object.hasOwn(
          result.runtime.getValidationSnapshot(),
          'asyncValidation',
        ),
      ).toBe(false);
      expect(result.runtime.retryAsyncValidation()).toEqual({
        success: false,
        effects: { snapshotChanged: false, operationEmitted: false },
        diagnostics: [
          {
            code: 'ASYNC_VALIDATION_RETRY_UNAVAILABLE',
            severity: 'error',
            source: 'runtime',
            parameters: {
              action: 'retryAsyncValidation',
              reason: 'not-configured',
            },
            fallbackMessage: 'Asynchronous validation cannot be retried.',
          },
        ],
      });
    }
  });

  it('treats an inherited async option as absent', () => {
    const candidate = Object.assign(
      Object.create({
        asyncValidator: {
          validate: () => Promise.resolve({ valid: true, issues: [] }),
        },
      }) as object,
      options(),
    );
    const result = createControlledFormRuntime(candidate as never);

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(Object.hasOwn(result.runtime.getSnapshot(), 'asyncValidation')).toBe(
      false,
    );
  });

  it('rejects accessors and malformed validator members without invoking them', () => {
    const optionGetter = vi.fn();
    const accessorOption = options() as unknown as Record<string, unknown>;
    Object.defineProperty(accessorOption, 'asyncValidator', {
      get: optionGetter,
    });
    expect(createControlledFormRuntime(accessorOption as never)).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INVALID_RUNTIME_OPTIONS',
          parameters: {
            member: 'asyncValidator',
            expected: 'object with callable validate or undefined',
            reason: 'accessor-member',
          },
        },
      ],
    });
    expect(optionGetter).not.toHaveBeenCalled();

    const validateGetter = vi.fn();
    const port = {};
    Object.defineProperty(port, 'validate', { get: validateGetter });
    expect(
      createControlledFormRuntime({
        ...options(),
        asyncValidator: port,
      } as never),
    ).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INVALID_RUNTIME_OPTIONS',
          parameters: {
            member: 'asyncValidator',
            reason: 'invalid-value',
          },
        },
      ],
    });
    expect(validateGetter).not.toHaveBeenCalled();

    const inheritedValidate = Object.create({
      validate: () => Promise.resolve({ valid: true, issues: [] }),
    }) as object;
    const syncValidate = vi.fn(() => ({ valid: true, issues: [] }));
    for (const asyncValidator of [
      null,
      [],
      {},
      { validate: 'no' },
      inheritedValidate,
    ]) {
      expect(
        createControlledFormRuntime({
          ...options(),
          validator: { validate: syncValidate },
          asyncValidator,
        } as never),
      ).toMatchObject({
        success: false,
        diagnostics: [
          {
            code: 'INVALID_RUNTIME_OPTIONS',
            parameters: { member: 'asyncValidator', reason: 'invalid-value' },
          },
        ],
      });
    }
    expect(syncValidate).not.toHaveBeenCalled();
  });

  it('checks visibility before asyncValidator and accepts an own callable port', () => {
    const getter = vi.fn();
    const invalid = {
      ...options(),
      validationVisibility: 'sometimes',
    } as Record<string, unknown>;
    Object.defineProperty(invalid, 'asyncValidator', { get: getter });
    expect(createControlledFormRuntime(invalid as never)).toMatchObject({
      success: false,
      diagnostics: [{ code: 'INVALID_RUNTIME_OPTIONS' }],
    });
    expect(getter).not.toHaveBeenCalled();

    const syncValidate = vi.fn(() => ({ valid: true, issues: [] }));
    const asyncValidate = vi.fn(() =>
      Promise.resolve({ valid: true, issues: [] }),
    );
    const result = createControlledFormRuntime({
      ...options(),
      validator: { validate: syncValidate },
      asyncValidator: { validate: asyncValidate },
    });
    expect(result.success).toBe(true);
    expect(syncValidate).toHaveBeenCalledTimes(1);
  });

  it('keeps disposed precedence for retry', () => {
    const result = createControlledFormRuntime(options());
    expect(result.success).toBe(true);
    if (!result.success) return;
    result.runtime.dispose();
    expect(result.runtime.retryAsyncValidation()).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'RUNTIME_DISPOSED',
          parameters: { action: 'retryAsyncValidation' },
        },
      ],
    });
  });
});
