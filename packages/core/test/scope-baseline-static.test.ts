import { describe, expect, it, vi } from 'vitest';
import type {
  FieldDefinition,
  FormDefinition,
  FormNodeDefinition,
  ObjectFieldDefinition,
} from '../src/index.js';
import { applyOperation, createControlledFormRuntime } from '../src/index.js';
import { commitScopeToBaseline } from '../src/internal/scope-baseline.js';
import { canonicalDataPathKey } from '../src/internal/path.js';
import {
  withDefaultNodePresentation,
  withDefaultPresentation,
} from './definition-fixtures.js';

function leaf(path: readonly string[]): FieldDefinition {
  return {
    kind: 'string',
    nullable: false,
    key: canonicalDataPathKey(path),
    name: path.at(-1) ?? '',
    path,
    required: false,
    label: path.at(-1) ?? '',
    constraints: {},
  };
}

function objectNode(
  path: readonly string[],
  children: readonly FormNodeDefinition[],
): ObjectFieldDefinition {
  return withDefaultNodePresentation({
    kind: 'object',
    key: canonicalDataPathKey(path),
    name: path.at(-1) ?? '',
    path,
    required: false,
    label: path.at(-1) ?? '',
    children,
  });
}

function definition(): FormDefinition {
  const name = leaf(['profile', 'name']);
  const city = leaf(['profile', 'address', 'city']);
  const street = leaf(['profile', 'address', 'street']);
  const address = objectNode(['profile', 'address'], [city, street]);
  const profile = objectNode(['profile'], [name, address]);
  const note = leaf(['note']);
  return withDefaultPresentation({
    nodes: [profile, note],
    fields: [name, city, street, note],
  });
}

function commit(
  baselineValue: Record<string, unknown>,
  currentValue: Record<string, unknown>,
  paths: readonly unknown[],
  candidateDefinition = definition(),
) {
  return commitScopeToBaseline(
    candidateDefinition,
    baselineValue,
    currentValue,
    { id: 'scope', paths } as never,
  );
}

describe('scope-to-baseline primitive reconstruction', () => {
  it('confirms present, missing and own undefined terminals exactly', () => {
    const baseline = {
      profile: { name: 'Ada', address: { city: 'London' } },
      note: 'keep',
    };
    const changed = commit(
      baseline,
      { profile: { name: 'Grace', address: {} }, note: 'current' },
      [['profile', 'name']],
    );
    expect(changed).toMatchObject({ success: true, changed: true });
    expect(changed.value).not.toBe(baseline);
    expect(changed.value.profile as object).toEqual({
      name: 'Grace',
      address: baseline.profile.address,
    });
    expect(changed.value.note).toBe('keep');

    const removed = commit(baseline, { profile: { address: {} } }, [
      ['profile', 'name'],
    ]);
    expect(removed.success && removed.changed).toBe(true);
    expect(Object.hasOwn(removed.value.profile as object, 'name')).toBe(false);
    expect((removed.value.profile as { address: object }).address).toBe(
      baseline.profile.address,
    );

    const ownUndefined = commit(baseline, { profile: { name: undefined } }, [
      ['profile', 'name'],
    ]);
    expect(Object.hasOwn(ownUndefined.value.profile as object, 'name')).toBe(
      true,
    );
    expect((ownUndefined.value.profile as { name: unknown }).name).toBe(
      undefined,
    );
  });

  it('uses Object.is and returns the exact baseline for semantic no-effect', () => {
    const baseline = { profile: { name: Number.NaN }, note: 'same' };
    const result = commit(
      baseline,
      { profile: { name: Number.NaN, unmanaged: 'ignored' }, note: 'same' },
      [['profile', 'name']],
    );
    expect(result).toEqual({
      success: true,
      value: baseline,
      changed: false,
      diagnostics: [],
    });
    expect(result.value).toBe(baseline);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.diagnostics)).toBe(true);
    const operation = applyOperation(
      { name: 'same' },
      {
        type: 'set-value',
        metadata: { id: 1, formId: 'scope-test' },
        path: ['name'],
        expected: { kind: 'value', value: 'same' },
        value: 'same',
        source: 'user',
      },
    );
    expect(operation.success).toBe(true);
    expect(result.diagnostics).toBe(operation.diagnostics);
  });

  it.each([undefined, null, '', false, 0] as const)(
    'confirms schema-invalid business terminal %s without validation',
    (value) => {
      const baseline = { profile: { name: 'before' } };
      const result = commit(baseline, { profile: { name: value } }, [
        ['profile', 'name'],
      ]);
      expect(result.success && result.changed).toBe(true);
      expect(Object.hasOwn(result.value.profile as object, 'name')).toBe(true);
      expect((result.value.profile as { name: unknown }).name).toBe(value);
    },
  );

  it('removes only the terminal when the current ancestor is missing', () => {
    const address = { city: 'London', street: 'Main', unmanaged: 1 };
    const baseline = { profile: { name: 'Ada', address }, note: 'keep' };
    const result = commit(baseline, { note: 'current' }, [
      ['profile', 'address', 'city'],
    ]);
    expect(result.success && result.changed).toBe(true);
    expect(result.value.profile).not.toBe(baseline.profile);
    expect((result.value.profile as { address: object }).address).not.toBe(
      address,
    );
    expect(result.value).toMatchObject({
      profile: { name: 'Ada', address: { street: 'Main', unmanaged: 1 } },
      note: 'keep',
    });
  });

  it('materializes only the selected path with matching current prototypes', () => {
    const address = Object.assign(Object.create(null) as object, {
      city: 'Paris',
      street: 'not selected',
      unmanaged: 'not copied',
    });
    const profile = Object.assign(Object.create(null) as object, {
      name: 'not selected',
      address,
    });
    const baseline = { note: 'keep' };
    const result = commit(baseline, { profile }, [
      ['profile', 'address', 'city'],
    ]);
    expect(result.success && result.changed).toBe(true);
    const projectedProfile = result.value.profile as {
      address: { city: string };
    };
    expect(Object.getPrototypeOf(projectedProfile)).toBeNull();
    expect(Object.getPrototypeOf(projectedProfile.address)).toBeNull();
    expect(projectedProfile.address).toEqual({ city: 'Paris' });
    expect(Object.hasOwn(projectedProfile, 'name')).toBe(false);
    expect(Object.hasOwn(projectedProfile.address, 'street')).toBe(false);
    expect(Object.hasOwn(projectedProfile.address, 'unmanaged')).toBe(false);
  });

  it('merges independent targets into one reachable ancestor clone', () => {
    const baseline = {
      profile: { name: 'Ada', address: { city: 'London', street: 'Main' } },
    };
    const result = commit(
      baseline,
      {
        profile: {
          name: 'Grace',
          address: { city: 'Paris', street: 'Broadway' },
        },
      },
      [
        ['profile', 'name'],
        ['profile', 'address', 'city'],
      ],
    );
    expect(result.value).toEqual({
      profile: {
        name: 'Grace',
        address: { city: 'Paris', street: 'Main' },
      },
    });
  });
});

describe('scope-to-baseline object reconstruction', () => {
  it('reconciles the complete managed subtree and preserves baseline unmanaged data', () => {
    const symbol = Symbol('baseline');
    const baselineAddress = Object.assign(Object.create(null) as object, {
      city: 'London',
      street: 'Main',
      unmanaged: 'baseline',
    }) as Record<PropertyKey, unknown>;
    Object.defineProperty(baselineAddress, 'hidden', {
      value: 7,
      enumerable: false,
      writable: false,
      configurable: false,
    });
    baselineAddress[symbol] = { exact: true };
    const baseline = {
      profile: { name: 'Ada', address: baselineAddress },
      note: 'keep',
    };
    const result = commit(
      baseline,
      {
        profile: {
          name: 'Grace',
          address: {
            city: 'Paris',
            street: 'Main',
            unmanaged: 'current',
            currentOnly: true,
          },
        },
      },
      [['profile']],
    );
    expect(result.success && result.changed).toBe(true);
    const candidate = result.value.profile as {
      address: Record<PropertyKey, unknown>;
    };
    expect(candidate.address.unmanaged).toBe('baseline');
    expect(Object.hasOwn(candidate.address, 'currentOnly')).toBe(false);
    expect(candidate.address[symbol]).toBe(baselineAddress[symbol]);
    expect(
      Object.getOwnPropertyDescriptor(candidate.address, 'hidden'),
    ).toEqual(Object.getOwnPropertyDescriptor(baselineAddress, 'hidden'));
    expect(Object.getPrototypeOf(candidate.address)).toBeNull();
    expect(result.value.note).toBe('keep');
  });

  it('borrows incompatible current values and projects from incompatible baselines', () => {
    const incompatible: unknown[] = [];
    const replaced = commit(
      { profile: { name: 'Ada', address: { city: 'London' } } },
      { profile: incompatible },
      [['profile']],
    );
    expect(replaced.value.profile).toBe(incompatible);

    const currentProfile = {
      name: 'Grace',
      address: { city: 'Paris', unmanaged: 'omit' },
      unmanaged: 'omit',
    };
    const projected = commit(
      { profile: 1, note: 'keep' },
      { profile: currentProfile },
      [['profile']],
    );
    expect(projected.value).toEqual({
      profile: { name: 'Grace', address: { city: 'Paris' } },
      note: 'keep',
    });
    expect(projected.value.profile as object).not.toBe(currentProfile);
  });

  it('ignores container identity and unmanaged differences for object no-effect', () => {
    const address = { city: 'London', street: 'Main', unmanaged: 'baseline' };
    const profile = { name: 'Ada', address, unmanaged: 'baseline' };
    const baseline = { profile, note: 'keep' };
    const result = commit(
      baseline,
      {
        profile: {
          name: 'Ada',
          address: { city: 'London', street: 'Main', unmanaged: 'current' },
          unmanaged: 'current',
        },
      },
      [['profile']],
    );
    expect(result.success && result.changed).toBe(false);
    expect(result.value).toBe(baseline);
    expect(result.value.profile).toBe(profile);
    expect((result.value.profile as { address: object }).address).toBe(address);
  });

  it('preserves null prototypes and ordinary replacement descriptors', () => {
    const profile = Object.assign(Object.create(null) as object, {
      name: 'Ada',
      address: Object.assign(Object.create(null) as object, { city: 'Paris' }),
    });
    const result = commit({}, { profile }, [['profile']]);
    expect(Object.getPrototypeOf(result.value.profile as object)).toBeNull();
    expect(
      Object.getPrototypeOf(
        (result.value.profile as { address: object }).address,
      ),
    ).toBeNull();
    expect(
      Object.getOwnPropertyDescriptor(result.value, 'profile'),
    ).toMatchObject({ writable: true, enumerable: true, configurable: true });
  });
});

describe('scope-to-baseline construction safety', () => {
  it('contains changed descriptor behavior and discards partial candidates', () => {
    const baselineTarget = { name: 'Ada', address: { city: 'London' } };
    let reads = 0;
    const baseline = new Proxy(
      { profile: baselineTarget, note: 'keep' },
      {
        getOwnPropertyDescriptor(target, property) {
          if (property === 'profile') {
            reads += 1;
            if (reads === 2) throw new Error('changed trap');
          }
          return Reflect.getOwnPropertyDescriptor(target, property);
        },
      },
    );
    const result = commit(
      baseline,
      { profile: { name: 'Grace', address: { city: 'Paris' } } },
      [['profile', 'name']],
    );
    expect(result).toMatchObject({
      success: false,
      value: baseline,
      changed: false,
      diagnostics: [
        {
          code: 'BASELINE_CONFIRMATION_FAILED',
          dataPath: ['profile'],
          parameters: { reason: 'inspection-failed', path: ['profile'] },
          fallbackMessage: 'Baseline confirmation failed.',
        },
      ],
    });
    expect(result.value).toBe(baseline);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.diagnostics[0]?.dataPath)).toBe(true);
  });

  it('has no runtime/validator/listener/console effects and preserves async generation on baseline application', () => {
    const syncValidate = vi.fn(() => ({ valid: true, issues: [] }));
    const asyncValidate = vi.fn(() => new Promise<never>(() => undefined));
    const runtime = createControlledFormRuntime({
      formId: 'scope-side-effects',
      definition: definition(),
      schema: {},
      value: {
        profile: { name: 'Grace', address: { city: 'Paris' } },
        note: 'same',
      },
      baselineValue: {
        profile: { name: 'Ada', address: { city: 'Paris' } },
        note: 'same',
      },
      locale: 'en',
      validator: { validate: syncValidate },
      asyncValidator: { validate: asyncValidate },
    });
    expect(runtime.success).toBe(true);
    if (!runtime.success) return;
    runtime.runtime.focus(['profile', 'name']);
    runtime.runtime.blur(['profile', 'name']);
    runtime.runtime.setValidationVisibility('all');
    const before = runtime.runtime.getSnapshot();
    const syncCalls = syncValidate.mock.calls.length;
    const asyncCalls = asyncValidate.mock.calls.length;
    const snapshots = vi.fn();
    const operations = vi.fn();
    runtime.runtime.subscribe(snapshots);
    runtime.runtime.subscribeOperations(operations);
    const consoleLog = vi
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);

    const candidate = commitScopeToBaseline(
      definition(),
      {
        profile: { name: 'Ada', address: { city: 'Paris' } },
        note: 'same',
      },
      before.value,
      { id: 'profile-name', paths: [['profile', 'name']] },
    );
    expect(candidate.success).toBe(true);
    expect(snapshots).not.toHaveBeenCalled();
    expect(operations).not.toHaveBeenCalled();
    expect(syncValidate).toHaveBeenCalledTimes(syncCalls);
    expect(asyncValidate).toHaveBeenCalledTimes(asyncCalls);
    expect(consoleLog).not.toHaveBeenCalled();

    runtime.runtime.updateExternalState({ baselineValue: candidate.value });
    const after = runtime.runtime.getSnapshot();
    expect(after.dirty).toBe(false);
    expect(after.fields[0]).toMatchObject({ touched: true, focused: false });
    expect(after.validationVisibility).toBe('all');
    expect(after.asyncValidation).toBe(before.asyncValidation);
    expect(syncValidate).toHaveBeenCalledTimes(syncCalls);
    expect(asyncValidate).toHaveBeenCalledTimes(asyncCalls);
    expect(operations).not.toHaveBeenCalled();
    consoleLog.mockRestore();
    runtime.runtime.dispose();
  });

  it('does not invoke accessors while cloning off-target descriptors', () => {
    const getter = vi.fn();
    const profile = { name: 'Ada', address: { city: 'London' } };
    Object.defineProperty(profile, 'unmanaged', {
      get: getter,
      enumerable: true,
      configurable: false,
    });
    const result = commit({ profile }, { profile: { name: 'Grace' } }, [
      ['profile', 'name'],
    ]);
    expect(result.success && result.changed).toBe(true);
    expect(getter).not.toHaveBeenCalled();
    expect(
      Object.getOwnPropertyDescriptor(
        result.value.profile as object,
        'unmanaged',
      ),
    ).toEqual(expect.objectContaining({ get: getter }));
  });

  it('reconstructs a depth-1,200 path iteratively and preserves a cycle', () => {
    const depth = 1_200;
    const names = Array.from({ length: depth }, (_, index) => `n${index}`);
    const terminal = leaf([...names, 'value']);
    let node: FormNodeDefinition = terminal;
    for (let index = depth - 1; index >= 0; index -= 1) {
      node = objectNode(names.slice(0, index + 1), [node]);
    }
    const deepDefinition = withDefaultPresentation({
      nodes: [node],
      fields: [terminal],
    });
    const build = (value: string) => {
      const root: Record<string, unknown> = {};
      let cursor = root;
      for (const name of names) {
        const child: Record<string, unknown> = {};
        cursor[name] = child;
        cursor = child;
      }
      cursor.value = value;
      cursor.cycle = root;
      return root;
    };
    const baseline = build('before');
    const current = build('after');
    const result = commit(
      baseline,
      current,
      [[...names, 'value']],
      deepDefinition,
    );
    expect(result.success && result.changed).toBe(true);
    let cursor = result.value as Record<string, unknown>;
    for (const name of names) cursor = cursor[name] as Record<string, unknown>;
    expect(cursor.value).toBe('after');
    expect(cursor.cycle).toBe(baseline);
  });
});
