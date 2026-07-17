// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import type { FormRuntime } from '@rabassoft/schema-engine';
import {
  referenceScenarios,
  type ReferenceScenario,
} from '@schema-engine-internal/reference-scenarios';
import { describe, expect, it, vi } from 'vitest';

import { StandardReferenceApplication } from '../src/reference-application.js';

describe('StandardReferenceApplication', () => {
  it('owns copied complete roots and creates a Public controlled runtime', () => {
    const application = new StandardReferenceApplication();
    const state = application.getState();

    expect(state.definition).toBeDefined();
    expect(state.snapshot?.value).toEqual(state.value);
    expect(state.value).not.toBe(state.scenario.initialState.value);
    expect(state.baselineValue).not.toBe(
      state.scenario.initialState.baselineValue,
    );
    expect(Object.isFrozen(state.value)).toBe(true);
    expect(Object.isFrozen(state.history)).toBe(true);
    expect(application.getRuntime()).toBeDefined();

    application.dispose();
  });

  it('keeps compile and runtime failures observable without creating a runtime', () => {
    const source = firstScenario();
    const compileFailure = {
      ...source,
      id: 'compile-failure',
      compileInput: { schema: null },
    } satisfies ReferenceScenario;
    const failedCompilation = new StandardReferenceApplication([
      compileFailure,
    ]);

    expect(failedCompilation.getState().definition).toBeUndefined();
    expect(
      failedCompilation.getState().compilationDiagnostics.length,
    ).toBeGreaterThan(0);
    expect(failedCompilation.getRuntime()).toBeUndefined();

    const runtimeFailure = {
      ...source,
      id: 'runtime-failure',
    } satisfies ReferenceScenario;
    const failedRuntime = new StandardReferenceApplication(
      [runtimeFailure],
      undefined,
      {
        validate() {
          throw new Error('validator unavailable');
        },
      },
    );

    expect(failedRuntime.getState().definition).toBeDefined();
    expect(failedRuntime.getState().runtimeDiagnostics.length).toBeGreaterThan(
      0,
    );
    expect(failedRuntime.getRuntime()).toBeUndefined();

    failedCompilation.dispose();
    failedRuntime.dispose();
  });

  it('validates a compiler-supported schema change through Ajv', () => {
    const source = firstScenario();
    const sourceSchema = source.compileInput.schema as {
      readonly properties: Readonly<Record<string, object>>;
    };
    const edited = {
      ...source,
      id: 'edited-validation',
      compileInput: {
        ...source.compileInput,
        schema: {
          ...(source.compileInput.schema as object),
          properties: {
            ...sourceSchema.properties,
            name: { ...sourceSchema.properties.name, maxLength: 2 },
          },
        },
      },
    } satisfies ReferenceScenario;
    const application = new StandardReferenceApplication([edited]);

    expect(application.getState().snapshot?.valid).toBe(false);
    expect(application.getState().snapshot?.fields[0]?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'maxLength', path: ['name'] }),
      ]),
    );
    application.dispose();
  });

  it('confirms, rejects and explicitly resolves pending operations', () => {
    const application = new StandardReferenceApplication();
    const runtime = requiredRuntime(application);

    runtime.requestSetValue(['name'], 'Grace');
    expect(application.getState()).toMatchObject({
      value: { name: 'Grace' },
      history: [{ decision: 'confirmed' }],
    });
    expect(Object.isFrozen(application.getState().history[0])).toBe(true);

    application.resetScenario();
    application.setDecisionMode('reject');
    requiredRuntime(application).requestSetValue(['age'], -1);
    expect(application.getState()).toMatchObject({
      value: { age: 37 },
      history: [{ decision: 'rejected' }],
    });

    application.resetScenario();
    expect(application.getState().decisionMode).toBe('confirm');
    application.setDecisionMode('pending');
    requiredRuntime(application).requestRemoveValue(['role']);
    const pending = application.getState().pendingOperations[0];
    expect(pending?.decision).toBe('pending');
    expect(application.getState().value).toMatchObject({ role: 'admin' });
    expect(application.confirmPending(requiredSequence(pending))).toBe(true);
    expect(application.getState().value).not.toHaveProperty('role');
    expect(application.getState().history[0]?.decision).toBe('confirmed');

    application.resetScenario();
    application.setDecisionMode('pending');
    requiredRuntime(application).requestSetValue(['name'], 'Grace');
    const rejected = application.getState().pendingOperations[0];
    expect(application.rejectPending(requiredSequence(rejected))).toBe(true);
    expect(application.getState().value).toMatchObject({ name: 'Ada' });
    expect(application.getState().history[0]?.decision).toBe('rejected');

    application.dispose();
  });

  it('records stale and incompatible pending applications atomically', () => {
    const application = new StandardReferenceApplication();
    application.setDecisionMode('pending');
    requiredRuntime(application).requestSetValue(['name'], 'Grace');
    const stale = application.getState().pendingOperations[0];
    const externalValue = {
      ...application.getState().value,
      name: 'External',
    };
    expect(application.replaceValue(externalValue)?.success).toBe(true);
    application.confirmPending(requiredSequence(stale));

    expect(application.getState().value).toMatchObject({ name: 'External' });
    expect(application.getState().history[0]?.decision).toBe('stale');

    expect(application.selectScenario('nested-profile')).toBe(true);
    application.setDecisionMode('pending');
    requiredRuntime(application).requestSetValue(
      ['profile', 'address', 'city'],
      'Barcelona',
    );
    const incompatible = application.getState().pendingOperations[0];
    expect(application.replaceValue({ profile: 'blocked' })?.success).toBe(
      true,
    );
    application.confirmPending(requiredSequence(incompatible));

    expect(application.getState().value).toEqual({ profile: 'blocked' });
    expect(application.getState().history[0]?.decision).toBe('incompatible');
    application.dispose();
  });

  it('commits the complete baseline and applies locale and visibility', () => {
    const application = new StandardReferenceApplication();
    requiredRuntime(application).requestSetValue(['name'], 'Grace');
    expect(application.getState().snapshot?.dirty).toBe(true);

    expect(application.commitBaseline()?.success).toBe(true);
    expect(application.getState().baselineValue).toEqual(
      application.getState().value,
    );
    expect(application.getState().baselineValue).not.toBe(
      application.getState().value,
    );
    expect(application.getState().snapshot?.dirty).toBe(false);

    expect(application.setLocale('es')?.success).toBe(true);
    expect(application.setValidationVisibility('all')?.success).toBe(true);
    expect(application.getState()).toMatchObject({
      locale: 'es',
      validationVisibility: 'all',
      snapshot: { locale: 'es', validationVisibility: 'all' },
    });
    application.dispose();
  });

  it('replaces scenarios repeatedly without old delivery or duplicate cleanup', () => {
    const application = new StandardReferenceApplication();
    const oldRuntime = requiredRuntime(application);
    const bindingCleanup = vi.fn();
    const releaseBinding = application.registerBindingCleanup(bindingCleanup);

    expect(application.selectScenario('nested-profile')).toBe(true);
    expect(bindingCleanup).toHaveBeenCalledTimes(1);
    releaseBinding();
    expect(bindingCleanup).toHaveBeenCalledTimes(1);
    expect(oldRuntime.requestSetValue(['name'], 'Ignored').success).toBe(false);
    expect(application.getState().history).toEqual([]);

    application.resetScenario();
    application.resetScenario();
    application.setDecisionMode('confirm');
    requiredRuntime(application).requestSetValue(
      ['profile', 'displayName'],
      'Ada',
    );
    expect(application.getState().history).toHaveLength(1);

    application.dispose();
    application.dispose();
    expect(bindingCleanup).toHaveBeenCalledTimes(1);
  });

  it('stops state delivery and disposes bindings idempotently', () => {
    const application = new StandardReferenceApplication();
    const listener = vi.fn();
    const cleanup = vi.fn();
    const unsubscribe = application.subscribeState(listener);
    application.registerBindingCleanup(cleanup);

    application.dispose();
    application.dispose();
    unsubscribe();

    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

function firstScenario(): ReferenceScenario {
  const scenario = referenceScenarios[0];
  if (scenario === undefined) throw new Error('Expected a reference scenario.');
  return scenario;
}

function requiredRuntime(
  application: StandardReferenceApplication,
): FormRuntime<object> {
  const runtime = application.getRuntime();
  if (runtime === undefined) throw new Error('Expected a controlled runtime.');
  return runtime;
}

function requiredSequence(
  entry: { readonly sequence: number } | undefined,
): number {
  if (entry === undefined) throw new Error('Expected a pending operation.');
  return entry.sequence;
}
