import { describe, expect, it, vi } from 'vitest';
import {
  compileFormDefinition,
  createControlledFormRuntime,
  type AsyncSchemaValidator,
  type ControlledFormRuntimeOptions,
  type FormDefinition,
  type ValidationIssue,
  type ValidationResult,
} from '../src/index.js';
import { withDefaultPresentation } from './definition-fixtures.js';

const nameField = {
  key: '["name"]',
  name: 'name',
  path: ['name'],
  required: true,
  label: 'Name',
  kind: 'string',
  nullable: false,
  constraints: {},
} as const;
const ageField = {
  key: '["age"]',
  name: 'age',
  path: ['age'],
  required: false,
  label: 'Age',
  kind: 'number',
  numericType: 'integer',
  nullable: false,
  constraints: {},
  ui: {},
} as const;
const definition: FormDefinition = withDefaultPresentation({
  nodes: [nameField, ageField],
  fields: [nameField, ageField],
});

function options(
  asyncValidator: AsyncSchemaValidator,
  overrides: Partial<
    ControlledFormRuntimeOptions<Record<string, unknown>>
  > = {},
): ControlledFormRuntimeOptions<Record<string, unknown>> {
  return {
    formId: 'async-results',
    definition,
    schema: { type: 'object' },
    value: { name: 'Ada', age: 30 },
    baselineValue: { name: 'Ada', age: 30 },
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

describe('async validation results and projection', () => {
  it('normalizes, detaches, freezes and composes sync-first issues without dedupe', async () => {
    const syncIssue: ValidationIssue = {
      code: 'same-code',
      path: ['name'],
      parameters: { source: 'sync' },
    };
    const parameters = { source: 'async', nested: { allowed: ['one'] } };
    const asyncIssue = {
      code: 'same-code',
      path: ['name'],
      keyword: 'service',
      parameters,
      fallbackMessage: 'Already used.',
    };
    const raw = { valid: true, issues: [asyncIssue] };
    const result = createControlledFormRuntime(
      options(
        { validate: () => Promise.resolve(raw) },
        {
          validator: { validate: () => ({ valid: true, issues: [syncIssue] }) },
        },
      ),
    );
    expect(result.success).toBe(true);
    if (!result.success) return;
    await flushAsync();

    const snapshot = result.runtime.getSnapshot();
    expect(snapshot.asyncValidation).toEqual({
      status: 'settled',
      generation: 1,
      valid: true,
    });
    expect(
      snapshot.fields[0]?.issues.map((issue) => issue.parameters.source),
    ).toEqual(['sync', 'async']);
    expect(snapshot.valid).toBe(false);
    expect(result.runtime.getValidationSnapshot().valid).toBe(false);
    expect(
      result.runtime
        .getValidationSnapshot({ id: 'name', paths: [['name']] })
        .issues.map((issue) => issue.parameters.source),
    ).toEqual(['sync', 'async']);
    expect(snapshot.fields[0]?.showIssues).toBe(false);
    result.runtime.showValidationErrors({ id: 'name', paths: [['name']] });
    expect(result.runtime.getSnapshot().fields[0]?.showIssues).toBe(true);
    result.runtime.hideValidationErrors('name');
    expect(result.runtime.getSnapshot().fields[0]?.showIssues).toBe(false);
    result.runtime.setValidationVisibility('all');
    expect(result.runtime.getSnapshot().fields[0]?.showIssues).toBe(true);
    expect(Object.isFrozen(snapshot.fields[0]?.issues)).toBe(true);
    expect(Object.isFrozen(snapshot.fields[0]?.issues[1])).toBe(true);
    expect(Object.isFrozen(snapshot.fields[0]?.issues[1]?.parameters)).toBe(
      true,
    );
    expect(snapshot.fields[0]?.issues[1]).not.toBe(asyncIssue);
    expect(snapshot.fields[0]?.issues[1]?.parameters).not.toBe(parameters);

    parameters.source = 'mutated';
    parameters.nested.allowed.push('two');
    raw.issues.length = 0;
    expect(snapshot.fields[0]?.issues[1]?.parameters).toEqual({
      source: 'async',
      nested: { allowed: ['one'] },
    });
  });

  it('projects conservative scopes while incomplete and explicit settled validity', async () => {
    let resolve!: (result: ValidationResult) => void;
    const promise = new Promise<ValidationResult>((done) => {
      resolve = done;
    });
    const result = createControlledFormRuntime(
      options({ validate: () => promise }),
    );
    expect(result.success).toBe(true);
    if (!result.success) return;
    const scope = { id: 'name', paths: [['name']] } as const;
    const pendingRoot = result.runtime.getSnapshot();
    const pendingField = pendingRoot.fields[0];
    expect(pendingRoot.valid).toBe(false);
    expect(pendingField?.valid).toBe(true);
    expect(result.runtime.getValidationSnapshot(scope).valid).toBe(false);
    expect(result.runtime.getValidationSnapshot(scope).asyncValidation).toBe(
      pendingRoot.asyncValidation,
    );
    expect(
      result.runtime.getValidationSnapshot({
        id: 'invalid',
        paths: [['missing']],
      }),
    ).toMatchObject({
      valid: false,
      issues: [],
      diagnostics: [{ code: 'UNKNOWN_SCOPE_PATH' }],
      asyncValidation: pendingRoot.asyncValidation,
    });

    resolve({ valid: false, issues: [] });
    await flushAsync();
    expect(result.runtime.getSnapshot().valid).toBe(false);
    expect(result.runtime.getSnapshot().fields[0]).toBe(pendingField);
    expect(result.runtime.getSnapshot().fields[0]?.valid).toBe(true);
    expect(result.runtime.getValidationSnapshot(scope).valid).toBe(true);
  });

  it('rebuilds only affected fields and exposes global issues in source order', async () => {
    const syncGlobal: ValidationIssue = {
      code: 'sync-global',
      path: [],
      parameters: {},
    };
    const result = createControlledFormRuntime(
      options(
        {
          validate: () =>
            Promise.resolve({
              valid: true,
              issues: [
                { code: 'async-global', path: [], parameters: {} },
                { code: 'async-name', path: ['name'], parameters: {} },
              ],
            }),
        },
        {
          validator: {
            validate: () => ({ valid: true, issues: [syncGlobal] }),
          },
        },
      ),
    );
    expect(result.success).toBe(true);
    if (!result.success) return;
    const pending = result.runtime.getSnapshot();
    await flushAsync();
    const settled = result.runtime.getSnapshot();

    expect(settled.globalIssues.map((issue) => issue.code)).toEqual([
      'sync-global',
      'async-global',
    ]);
    expect(settled.fields[0]?.issues.map((issue) => issue.code)).toEqual([
      'async-name',
    ]);
    expect(settled.fields[0]).not.toBe(pending.fields[0]);
    expect(settled.fields[1]).toBe(pending.fields[1]);
    expect(settled.valid).toBe(false);
  });

  it.each([
    null,
    {},
    { valid: 'yes', issues: [] },
    { valid: true },
    { valid: true, issues: {} },
    { valid: true, issues: [null] },
    { valid: true, issues: [{ code: '', path: ['name'], parameters: {} }] },
    { valid: true, issues: [{ code: 'x', parameters: {} }] },
    { valid: true, issues: [{ code: 'x', path: 'name', parameters: {} }] },
    { valid: true, issues: [{ code: 'x', path: [true], parameters: {} }] },
    {
      valid: true,
      issues: [{ code: 'x', path: ['name'], keyword: 1, parameters: {} }],
    },
    { valid: true, issues: [{ code: 'x', path: ['name'], parameters: null }] },
    {
      valid: true,
      issues: [
        { code: 'x', path: ['name'], parameters: {}, fallbackMessage: 1 },
      ],
    },
    { valid: true, issues: [{ code: 'x', path: ['unknown'], parameters: {} }] },
  ])('fails closed for malformed or unmanaged result %#', async (raw) => {
    const result = createControlledFormRuntime(
      options({ validate: () => Promise.resolve(raw as never) }),
    );
    expect(result.success).toBe(true);
    if (!result.success) return;
    await flushAsync();
    expect(result.runtime.getSnapshot().asyncValidation).toEqual({
      status: 'failed',
      generation: 1,
      reason: 'invalid-result',
    });
    expect(
      result.runtime
        .getSnapshot()
        .fields.every((field) => field.issues.length === 0),
    ).toBe(true);
    expect(result.runtime.getValidationSnapshot().diagnostics).toEqual([]);
  });

  it('rejects hostile result and issue members without invoking getters', async () => {
    const outerGetter = vi.fn();
    const outer = { issues: [] };
    Object.defineProperty(outer, 'valid', { get: outerGetter });
    const issueGetter = vi.fn();
    const issue = { path: ['name'], parameters: {} };
    Object.defineProperty(issue, 'code', { get: issueGetter });
    const nestedGetter = vi.fn();
    const parameters = {};
    Object.defineProperty(parameters, 'nested', {
      enumerable: true,
      get: nestedGetter,
    });

    for (const raw of [
      outer,
      { valid: true, issues: [issue] },
      {
        valid: true,
        issues: [{ code: 'x', path: ['name'], parameters }],
      },
    ]) {
      const result = createControlledFormRuntime(
        options({ validate: () => Promise.resolve(raw as never) }),
      );
      expect(result.success).toBe(true);
      if (!result.success) continue;
      await flushAsync();
      expect(result.runtime.getSnapshot().asyncValidation).toMatchObject({
        status: 'failed',
        reason: 'invalid-result',
      });
    }
    expect(outerGetter).not.toHaveBeenCalled();
    expect(issueGetter).not.toHaveBeenCalled();
    expect(nestedGetter).not.toHaveBeenCalled();
  });

  it('contains throwing descriptor traps as an invalid result', async () => {
    const raw = new Proxy(
      { valid: true, issues: [] },
      {
        getOwnPropertyDescriptor() {
          throw new Error('hostile descriptor trap');
        },
      },
    );
    const result = createControlledFormRuntime(
      options({ validate: () => Promise.resolve(raw) }),
    );
    expect(result.success).toBe(true);
    if (!result.success) return;
    await flushAsync();
    expect(result.runtime.getSnapshot().asyncValidation).toEqual({
      status: 'failed',
      generation: 1,
      reason: 'invalid-result',
    });
  });

  it('rejects cyclic parameter containers as an invalid result', async () => {
    const parameters: Record<string, unknown> = {};
    parameters.self = parameters;
    const result = createControlledFormRuntime(
      options({
        validate: () =>
          Promise.resolve({
            valid: true,
            issues: [{ code: 'x', path: ['name'], parameters }],
          }),
      }),
    );
    expect(result.success).toBe(true);
    if (!result.success) return;
    await flushAsync();
    expect(result.runtime.getSnapshot().asyncValidation).toMatchObject({
      status: 'failed',
      reason: 'invalid-result',
    });
  });

  it('rejects sparse/accessor issue arrays without invoking accessors', async () => {
    const getter = vi.fn();
    const issues: unknown[] = [];
    issues.length = 2;
    Object.defineProperty(issues, '1', { get: getter });
    const result = createControlledFormRuntime(
      options({
        validate: () => Promise.resolve({ valid: true, issues } as never),
      }),
    );
    expect(result.success).toBe(true);
    if (!result.success) return;
    await flushAsync();
    expect(result.runtime.getSnapshot().asyncValidation).toMatchObject({
      status: 'failed',
      reason: 'invalid-result',
    });
    expect(getter).not.toHaveBeenCalled();
  });

  it('maps positional collection issues to the current stable item', async () => {
    const schema = {
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
    const compilation = compileFormDefinition({
      schema,
      collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
    });
    expect(compilation.success).toBe(true);
    if (!compilation.success) return;
    const value = { rows: [{ id: 'a', name: 'Ada' }] };
    const result = createControlledFormRuntime({
      formId: 'async-collection',
      definition: compilation.definition,
      schema,
      value,
      baselineValue: value,
      locale: 'en',
      validator: { validate: () => ({ valid: true, issues: [] }) },
      asyncValidator: {
        validate: () =>
          Promise.resolve({
            valid: false,
            issues: [
              {
                code: 'reserved-name',
                path: ['rows', 0, 'name'],
                parameters: {},
              },
            ],
          }),
      },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    await flushAsync();
    expect(
      result.runtime
        .getCollectionNodeSnapshot({
          collectionPath: ['rows'],
          itemId: 'a',
          relativePath: ['name'],
        })
        ?.issues.map((issue) => issue.code),
    ).toEqual(['reserved-name']);
  });

  it('falls positional issues back to a collection with invalid identity', async () => {
    const schema = {
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
    const compilation = compileFormDefinition({
      schema,
      collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
    });
    expect(compilation.success).toBe(true);
    if (!compilation.success) return;
    const value = {
      rows: [
        { id: 'duplicate', name: 'Ada' },
        { id: 'duplicate', name: 'Grace' },
      ],
    };
    const result = createControlledFormRuntime({
      formId: 'async-invalid-collection',
      definition: compilation.definition,
      schema,
      value,
      baselineValue: value,
      locale: 'en',
      validator: { validate: () => ({ valid: true, issues: [] }) },
      asyncValidator: {
        validate: () =>
          Promise.resolve({
            valid: false,
            issues: [
              {
                code: 'reserved-name',
                path: ['rows', 1, 'name'],
                parameters: {},
              },
            ],
          }),
      },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    await flushAsync();
    expect(result.runtime.getSnapshot().nodes[0]).toMatchObject({
      identityState: { kind: 'invalid' },
      issues: [{ code: 'reserved-name' }],
    });
  });

  it('assigns deeper unmanaged paths to their deepest managed object ancestor', async () => {
    const schema = {
      type: 'object',
      properties: {
        profile: {
          type: 'object',
          properties: { name: { type: 'string' } },
        },
      },
    };
    const compilation = compileFormDefinition({ schema });
    expect(compilation.success).toBe(true);
    if (!compilation.success) return;
    const value = { profile: { name: 'Ada' } };
    const result = createControlledFormRuntime({
      formId: 'async-deep-fallback',
      definition: compilation.definition,
      schema,
      value,
      baselineValue: value,
      locale: 'en',
      validator: { validate: () => ({ valid: true, issues: [] }) },
      asyncValidator: {
        validate: () =>
          Promise.resolve({
            valid: false,
            issues: [
              {
                code: 'profile-service',
                path: ['profile', 'remote', 'name'],
                parameters: {},
              },
            ],
          }),
      },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    const pendingProfile = result.runtime.getSnapshot().nodes[0];
    const pendingName =
      pendingProfile?.nodeKind === 'object'
        ? pendingProfile.children[0]
        : undefined;
    await flushAsync();
    const settledProfile = result.runtime.getSnapshot().nodes[0];
    expect(settledProfile?.issues).toMatchObject([{ code: 'profile-service' }]);
    expect(settledProfile).not.toBe(pendingProfile);
    expect(
      settledProfile?.nodeKind === 'object'
        ? settledProfile.children[0]
        : undefined,
    ).toBe(pendingName);
  });

  it('reuses every node snapshot for a failure-only transition', async () => {
    const result = createControlledFormRuntime(
      options({ validate: () => Promise.reject(new Error('offline')) }),
    );
    expect(result.success).toBe(true);
    if (!result.success) return;
    const pending = result.runtime.getSnapshot();
    await flushAsync();
    const failed = result.runtime.getSnapshot();
    expect(failed.asyncValidation).toMatchObject({
      status: 'failed',
      reason: 'exception',
    });
    expect(failed.fields[0]).toBe(pending.fields[0]);
    expect(failed.fields[1]).toBe(pending.fields[1]);
  });

  it('clears settled async issues before retry pending and preserves sibling sharing', async () => {
    const results: Array<(value: ValidationResult) => void> = [];
    const asyncValidator: AsyncSchemaValidator = {
      validate: () =>
        new Promise<ValidationResult>((resolve) => results.push(resolve)),
    };
    const result = createControlledFormRuntime(options(asyncValidator));
    expect(result.success).toBe(true);
    if (!result.success) return;
    results[0]?.({
      valid: false,
      issues: [{ code: 'taken', path: ['name'], parameters: {} }],
    });
    await flushAsync();
    const settled = result.runtime.getSnapshot();
    expect(settled.fields[0]?.issues).toHaveLength(1);
    const unaffected = settled.fields[1];

    expect(result.runtime.retryAsyncValidation().success).toBe(true);
    const pending = result.runtime.getSnapshot();
    expect(pending.asyncValidation).toEqual({
      status: 'pending',
      generation: 2,
    });
    expect(pending.fields[0]?.issues).toHaveLength(0);
    expect(pending.fields[1]).toBe(unaffected);
  });
});
