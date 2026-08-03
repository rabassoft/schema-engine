import { describe, expect, it, vi } from 'vitest';
import {
  createControlledFormRuntime,
  type AsyncSchemaValidator,
  type AsyncValidationContext,
  type ControlledFormRuntimeOptions,
  type FormDefinition,
  type ValidationResult,
} from '../src/index.js';
import { AsyncGenerationCounter } from '../src/internal/async-validation.js';
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

interface Deferred<T> {
  readonly promise: Promise<T>;
  resolve(value: T): void;
  reject(reason?: unknown): void;
}

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function options(
  asyncValidator: AsyncSchemaValidator,
  overrides: Partial<
    ControlledFormRuntimeOptions<Record<string, unknown>>
  > = {},
): ControlledFormRuntimeOptions<Record<string, unknown>> {
  return {
    formId: 'async-lifecycle',
    definition,
    schema: { type: 'object' },
    value: { name: 'Ada' },
    baselineValue: { name: 'Ada' },
    locale: 'en',
    validator: { validate: () => ({ valid: true, issues: [] }) },
    asyncValidator,
    ...overrides,
  };
}

async function flushAsync(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

describe('controlled async validation lifecycle', () => {
  it('blocks initial async work behind an invalid synchronous result', () => {
    const validate = vi.fn((): Promise<ValidationResult> =>
      Promise.resolve({ valid: true, issues: [] }),
    );
    const result = createControlledFormRuntime(
      options(
        { validate },
        {
          validator: { validate: () => ({ valid: false, issues: [] }) },
        },
      ),
    );

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.runtime.getSnapshot()).toMatchObject({
      valid: false,
      asyncValidation: { status: 'blocked', reason: 'sync-invalid' },
    });
    expect(validate).not.toHaveBeenCalled();
    expect(result.runtime.retryAsyncValidation()).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'ASYNC_VALIDATION_RETRY_UNAVAILABLE',
          parameters: { reason: 'sync-invalid' },
        },
      ],
    });
  });

  it('starts generation 1 with exact borrowed identities and settles later', async () => {
    const schema = { type: 'object' };
    const value = { name: 'Ada' };
    let context: AsyncValidationContext | undefined;
    const validate = vi.fn(
      (
        receivedSchema: unknown,
        receivedValue: unknown,
        receivedContext: AsyncValidationContext,
      ) => {
        expect(receivedSchema).toBe(schema);
        expect(receivedValue).toBe(value);
        context = receivedContext;
        return Promise.resolve({ valid: true, issues: [] });
      },
    );
    const result = createControlledFormRuntime(
      options({ validate }, { schema, value }),
    );

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.runtime.getSnapshot()).toMatchObject({
      valid: false,
      asyncValidation: { status: 'pending', generation: 1 },
    });
    expect(validate).toHaveBeenCalledTimes(1);
    expect(context?.generation).toBe(1);
    expect(Object.isFrozen(context)).toBe(true);
    expect(Object.isFrozen(context?.cancellation)).toBe(true);

    await flushAsync();
    expect(result.runtime.getSnapshot()).toMatchObject({
      valid: true,
      asyncValidation: { status: 'settled', generation: 1, valid: true },
    });
  });

  it('cancels replacements in order and ignores stale completion', async () => {
    const work = [deferred<ValidationResult>(), deferred<ValidationResult>()];
    const contexts: AsyncValidationContext[] = [];
    const validate = vi.fn(
      (_schema: unknown, _value: unknown, context: AsyncValidationContext) => {
        contexts.push(context);
        return work[contexts.length - 1]?.promise as Promise<ValidationResult>;
      },
    );
    const result = createControlledFormRuntime(options({ validate }));
    expect(result.success).toBe(true);
    if (!result.success) return;

    const delivered: string[] = [];
    const removed = contexts[0]?.cancellation.onCancel(() =>
      delivered.push('removed'),
    );
    removed?.();
    contexts[0]?.cancellation.onCancel(() => {
      delivered.push('first');
      throw new Error('isolated');
    });
    contexts[0]?.cancellation.onCancel(() => delivered.push('second'));

    expect(
      result.runtime.updateExternalState({ value: { name: 'Grace' } }),
    ).toMatchObject({
      success: true,
      effects: { snapshotChanged: true, operationEmitted: false },
    });
    expect(delivered).toEqual(['first', 'second']);
    expect(contexts[0]?.cancellation.isCancelled()).toBe(true);
    expect(contexts[1]?.generation).toBe(2);
    contexts[0]?.cancellation.onCancel(() => delivered.push('late'));
    expect(delivered).toEqual(['first', 'second', 'late']);

    work[0]?.resolve({ valid: false, issues: [] });
    await flushAsync();
    expect(result.runtime.getSnapshot().asyncValidation).toEqual({
      status: 'pending',
      generation: 2,
    });

    work[1]?.resolve({ valid: true, issues: [] });
    await flushAsync();
    expect(result.runtime.getSnapshot().asyncValidation).toEqual({
      status: 'settled',
      generation: 2,
      valid: true,
    });
  });

  it('preserves active work across non-triggers and atomic sync failure', () => {
    const active = deferred<ValidationResult>();
    const asyncValidate = vi.fn(() => active.promise);
    const syncValidate = vi.fn((_schema: unknown, value: unknown) => {
      if ((value as { name?: string }).name === 'throw')
        throw new Error('sync');
      return { valid: true, issues: [] };
    });
    const result = createControlledFormRuntime(
      options(
        { validate: asyncValidate },
        { validator: { validate: syncValidate } },
      ),
    );
    expect(result.success).toBe(true);
    if (!result.success) return;
    const pending = result.runtime.getSnapshot();

    expect(result.runtime.updateExternalState({ locale: 'es' }).success).toBe(
      true,
    );
    expect(
      result.runtime.updateExternalState({ baselineValue: { name: 'Ada' } })
        .success,
    ).toBe(true);
    result.runtime.focus(['name']);
    result.runtime.requestSetValue(['name'], 'Grace');
    expect(asyncValidate).toHaveBeenCalledTimes(1);
    expect(result.runtime.getSnapshot().asyncValidation).toBe(
      pending.asyncValidation,
    );

    expect(
      result.runtime.updateExternalState({ value: { name: 'throw' } }),
    ).toMatchObject({
      success: false,
      diagnostics: [{ code: 'VALIDATOR_EXCEPTION' }],
    });
    expect(asyncValidate).toHaveBeenCalledTimes(1);
    expect(result.runtime.getSnapshot().value).not.toEqual({ name: 'throw' });
    expect(result.runtime.getSnapshot().asyncValidation).toBe(
      pending.asyncValidation,
    );
  });

  it('retries by cancelling pending work and starting the next generation', () => {
    const contexts: AsyncValidationContext[] = [];
    const validate = vi.fn(
      (_schema: unknown, _value: unknown, context: AsyncValidationContext) => {
        contexts.push(context);
        return deferred<ValidationResult>().promise;
      },
    );
    const result = createControlledFormRuntime(options({ validate }));
    expect(result.success).toBe(true);
    if (!result.success) return;
    const snapshots: unknown[] = [];
    result.runtime.subscribe((snapshot) =>
      snapshots.push(snapshot.asyncValidation),
    );

    expect(result.runtime.retryAsyncValidation()).toEqual({
      success: true,
      effects: { snapshotChanged: true, operationEmitted: false },
      diagnostics: [],
    });
    expect(contexts[0]?.cancellation.isCancelled()).toBe(true);
    expect(contexts[1]?.generation).toBe(2);
    expect(snapshots).toEqual([{ status: 'pending', generation: 2 }]);
  });

  it.each([
    [
      'throw',
      {
        validate: () => {
          throw new Error('bad');
        },
      },
      'exception',
    ],
    [
      'reject',
      { validate: () => Promise.reject(new Error('bad')) },
      'exception',
    ],
    [
      'non-thenable',
      { validate: () => ({ valid: true, issues: [] }) as never },
      'invalid-result',
    ],
    [
      'malformed',
      {
        validate: () => Promise.resolve({ valid: 'yes', issues: [] }) as never,
      },
      'invalid-result',
    ],
  ] as const)(
    'reduces %s only after creation returns',
    async (_name, asyncValidator, reason) => {
      const result = createControlledFormRuntime(options(asyncValidator));
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.runtime.getSnapshot().asyncValidation).toEqual({
        status: 'pending',
        generation: 1,
      });
      await flushAsync();
      expect(result.runtime.getSnapshot().asyncValidation).toEqual({
        status: 'failed',
        generation: 1,
        reason,
      });
    },
  );

  it('reads hostile then once and accepts only its first settlement', async () => {
    const then = vi.fn(
      (
        resolve: (value: ValidationResult) => void,
        reject: (reason?: unknown) => void,
      ) => {
        resolve({ valid: true, issues: [] });
        reject(new Error('late'));
        resolve({ valid: false, issues: [] });
      },
    );
    const thenGetter = vi.fn(() => then);
    const thenable = {};
    Object.defineProperty(thenable, 'then', { get: thenGetter });
    const result = createControlledFormRuntime(
      options({ validate: () => thenable as PromiseLike<ValidationResult> }),
    );
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(thenGetter).toHaveBeenCalledTimes(1);
    expect(then).toHaveBeenCalledTimes(1);
    expect(result.runtime.getSnapshot().asyncValidation?.status).toBe(
      'pending',
    );

    await flushAsync();
    expect(result.runtime.getSnapshot().asyncValidation).toEqual({
      status: 'settled',
      generation: 1,
      valid: true,
    });
  });

  it('releases a completed capability without cancelling it', async () => {
    const contexts: AsyncValidationContext[] = [];
    const validate = vi.fn(
      (_schema: unknown, _value: unknown, context: AsyncValidationContext) => {
        contexts.push(context);
        return Promise.resolve({ valid: true, issues: [] });
      },
    );
    const result = createControlledFormRuntime(options({ validate }));
    expect(result.success).toBe(true);
    if (!result.success) return;
    await flushAsync();
    const completed = contexts[0]?.cancellation;
    const listener = vi.fn();
    completed?.onCancel(listener);

    result.runtime.updateExternalState({ value: { name: 'Grace' } });
    expect(completed?.isCancelled()).toBe(false);
    expect(listener).not.toHaveBeenCalled();
    expect(contexts[1]?.generation).toBe(2);
  });

  it('cancels on sync invalidity and disposal and silences later results', async () => {
    const work = [deferred<ValidationResult>(), deferred<ValidationResult>()];
    const contexts: AsyncValidationContext[] = [];
    const syncValidate = vi.fn((_schema: unknown, value: unknown) => ({
      valid: (value as { name?: string }).name !== '',
      issues: [],
    }));
    const asyncValidate = vi.fn(
      (_schema: unknown, _value: unknown, context: AsyncValidationContext) => {
        contexts.push(context);
        return work[contexts.length - 1]?.promise as Promise<ValidationResult>;
      },
    );
    const result = createControlledFormRuntime(
      options(
        { validate: asyncValidate },
        { validator: { validate: syncValidate } },
      ),
    );
    expect(result.success).toBe(true);
    if (!result.success) return;

    result.runtime.updateExternalState({ value: { name: '' } });
    expect(contexts[0]?.cancellation.isCancelled()).toBe(true);
    expect(result.runtime.getSnapshot().asyncValidation).toEqual({
      status: 'blocked',
      reason: 'sync-invalid',
    });
    result.runtime.updateExternalState({ value: { name: 'Grace' } });
    expect(contexts[1]?.generation).toBe(2);
    const finalSnapshot = result.runtime.getSnapshot();
    result.runtime.dispose();
    expect(contexts[1]?.cancellation.isCancelled()).toBe(true);
    work[1]?.resolve({ valid: true, issues: [] });
    await flushAsync();
    expect(result.runtime.getSnapshot()).toBe(finalSnapshot);
  });

  it('stops generation allocation at the maximum safe integer', () => {
    const counter = new AsyncGenerationCounter(Number.MAX_SAFE_INTEGER - 1);
    expect(counter.next()).toBe(Number.MAX_SAFE_INTEGER);
    expect(counter.exhausted()).toBe(true);
    expect(counter.next()).toBeUndefined();
    expect(counter.last()).toBe(Number.MAX_SAFE_INTEGER);
  });
});
