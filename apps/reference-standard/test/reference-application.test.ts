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
  it('derives, cancels and explicitly accepts schema defaults without operations', () => {
    const application = new StandardReferenceApplication(
      referenceScenarios,
      'explicit-schema-defaults',
    );
    const original = application.getState().value;
    const rows = (original as { rows: readonly unknown[] }).rows;

    expect(application.deriveDefaultCandidate()).toBe(true);
    expect(application.getState().defaultCandidate?.status).toBe('available');
    expect(application.getState().value).toBe(original);
    expect(application.getState().history).toHaveLength(0);

    expect(application.cancelDefaultCandidate()).toBe(true);
    expect(application.getState().defaultCandidate?.status).toBe('cancelled');
    expect(application.getState().value).toBe(original);

    expect(application.deriveDefaultCandidate()).toBe(true);
    expect(application.acceptDefaultCandidate()?.success).toBe(true);
    expect(application.getState().defaultCandidate?.status).toBe('accepted');
    expect(application.getState().value).toMatchObject({
      title: 'New entity',
      enabled: false,
      attempts: 0,
      note: '',
      nullableNote: null,
      locale: 'en',
      profile: { displayName: 'Ada', code: 'x' },
    });
    expect(
      (application.getState().value as { rows: readonly unknown[] }).rows,
    ).toBe(rows);
    expect(application.getState().history).toHaveLength(0);
    expect(
      application
        .getState()
        .snapshot?.fields.flatMap(({ issues }) => issues)
        .map(({ keyword }) => keyword),
    ).toContain('minLength');

    expect(application.deriveDefaultCandidate()).toBe(true);
    expect(application.getState().defaultCandidate?.status).toBe('no-effect');
    application.dispose();
  });

  it('prepares and separately accepts scoped candidates with independent application state', () => {
    const application = new StandardReferenceApplication(
      referenceScenarios,
      'scope-baseline-confirmation',
    );
    const confirmation = application.getState().scenario.scopeConfirmation;
    const profile = confirmation?.targets.find(
      ({ id }) => id === 'profile-name',
    );
    const team = confirmation?.targets.find(({ id }) => id === 'whole-team');
    const currentOnly = confirmation?.targets.find(
      ({ id }) => id === 'current-only-linus',
    );
    if (
      profile === undefined ||
      team === undefined ||
      currentOnly === undefined
    ) {
      throw new Error('Scoped confirmation targets are required.');
    }

    const baseline = application.getState().baselineValue;
    expect(application.getState().snapshot?.dirty).toBe(true);
    expect(application.prepareScopeCandidate(profile)).toBe(true);
    expect(application.getState().scopeCandidate?.status).toBe('available');
    expect(application.getState().baselineValue).toBe(baseline);
    expect(application.getState().snapshot?.dirty).toBe(true);

    expect(application.acceptScopeCandidate()?.success).toBe(true);
    expect(application.getState().scopeCandidate?.status).toBe('accepted');
    expect(application.getState().baselineValue).toMatchObject({
      profile: { displayName: 'Ada Byron', timezone: 'UTC' },
      reviewNote: 'Baseline note',
    });
    expect(application.getState().snapshot?.dirty).toBe(true);

    application.resetScenario();
    expect(application.prepareScopeCandidate(currentOnly)).toBe(false);
    expect(application.getState().scopeCandidate?.status).toBe('unconfirmable');
    expect(application.getState().baselineValue).toEqual(baseline);

    expect(application.prepareScopeCandidate(team)).toBe(true);
    expect(application.acceptScopeCandidate()?.success).toBe(true);
    expect(application.getState().baselineValue).toMatchObject({
      team: [
        { id: 'grace', name: 'Grace Hopper' },
        { id: 'linus', name: 'Linus' },
        { id: 'ada', name: 'Ada' },
      ],
      reviewNote: 'Baseline note',
    });
    expect(application.getState().snapshot?.dirty).toBe(true);

    expect(application.selectScenario('scope-baseline-confirmation')).toBe(
      true,
    );
    expect(application.getState().scopeCandidate).toBeUndefined();
    application.dispose();
  });

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

  it('keeps unconfigured scenarios exact and demonstrates the complete controlled async lifecycle', async () => {
    const unconfigured = new StandardReferenceApplication();
    expect(unconfigured.getState().snapshot).not.toHaveProperty(
      'asyncValidation',
    );
    unconfigured.dispose();

    const application = new StandardReferenceApplication(
      referenceScenarios,
      'service-validation',
    );
    expect(application.getState().snapshot?.asyncValidation).toEqual({
      status: 'pending',
      generation: 1,
    });
    expect(application.getState().history).toEqual([]);

    expect(application.resolveServiceValidation(false)).toBe(true);
    await flushAsyncValidation();
    expect(application.getState().snapshot?.asyncValidation).toEqual({
      status: 'settled',
      generation: 1,
      valid: false,
    });
    expect(application.getState().snapshot?.fields[0]?.issues).toEqual([
      expect.objectContaining({
        code: 'username-unavailable',
        path: ['username'],
      }),
    ]);

    expect(
      application.replaceValue({
        ...application.getState().value,
        username: 'x',
      })?.success,
    ).toBe(true);
    expect(application.getState().snapshot?.asyncValidation).toEqual({
      status: 'blocked',
      reason: 'sync-invalid',
    });
    const blockedCount = application.getState().serviceRequestEvidence.length;

    application.replaceValue({
      ...application.getState().value,
      username: 'grace',
    });
    const stale = application.getState().serviceRequestEvidence.at(-1);
    application.replaceValue({
      ...application.getState().value,
      username: 'linus',
    });
    const current = application.getState().serviceRequestEvidence.at(-1);
    expect(application.getState().serviceRequestEvidence).toHaveLength(
      blockedCount + 2,
    );
    expect(
      application
        .getState()
        .serviceRequestEvidence.find(({ id }) => id === stale?.id)?.status,
    ).toBe('cancelled');
    expect(current?.status).toBe('pending');
    expect(application.resolveServiceRequest(stale?.id ?? -1, false)).toBe(
      true,
    );
    await flushAsyncValidation();
    expect(application.getState().snapshot?.asyncValidation).toEqual({
      status: 'pending',
      generation: current?.generation,
    });

    expect(application.rejectServiceValidation()).toBe(true);
    await flushAsyncValidation();
    expect(application.getState().snapshot?.asyncValidation).toEqual({
      status: 'failed',
      generation: current?.generation,
      reason: 'exception',
    });
    expect(application.throwOnNextValidation()).toBe(true);
    expect(application.retryAsyncValidation()?.success).toBe(true);
    await flushAsyncValidation();
    expect(application.getState().snapshot?.asyncValidation).toMatchObject({
      status: 'failed',
      reason: 'exception',
    });
    expect(application.retryAsyncValidation()?.success).toBe(true);
    expect(application.resolveServiceValidation(true)).toBe(true);
    await flushAsyncValidation();
    expect(application.getState().snapshot?.asyncValidation).toMatchObject({
      status: 'settled',
      valid: true,
    });
    expect(application.getState().history).toEqual([]);
    expect(
      application
        .getState()
        .serviceRequestEvidence.filter(({ status }) => status === 'threw'),
    ).toHaveLength(1);

    application.updateUiSchemaDraft(
      `${application.getState().uiSchemaDraft}\n`,
    );
    expect(application.applyConfiguration()).toBe(false);
    expect(application.confirmConfigurationAction()).toBe(true);
    expect(application.getState().serviceRequestEvidence).toEqual([
      expect.objectContaining({ id: 1, generation: 1, status: 'pending' }),
    ]);
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

  it('validates drafts without mutating the active runtime or controlled roots', () => {
    const application = new StandardReferenceApplication();
    const before = application.getState();
    application.updateSchemaDraft('{');

    expect(application.validateConfiguration()).toBe(false);
    expect(application.getState()).toMatchObject({
      draftResult: {
        status: 'invalid-json',
        syntaxIssues: [{ document: 'schema' }],
      },
      runtimeEpoch: before.runtimeEpoch,
      value: before.value,
      history: [],
    });
    expect(application.getRuntime()).toBeDefined();

    application.updateSchemaDraft(before.schemaDraft);
    expect(application.validateConfiguration()).toBe(true);
    expect(application.getState().draftResult.status).toBe('valid');
    expect(application.getState().runtimeEpoch).toBe(before.runtimeEpoch);
    application.dispose();
  });

  it('applies active configuration through a fresh runtime and active-schema Ajv', () => {
    const application = new StandardReferenceApplication();
    const before = application.getState();
    const oldRuntime = requiredRuntime(application);
    const schema = JSON.parse(before.schemaDraft) as {
      properties: Record<string, unknown>;
    };
    schema.properties['nickname'] = { type: 'string', maxLength: 2 };
    application.updateSchemaDraft(JSON.stringify(schema, undefined, 2));

    expect(application.applyConfiguration()).toBe(true);
    const applied = application.getState();
    expect(applied.runtimeEpoch).toBe(before.runtimeEpoch + 1);
    expect(applied.activeConfigurationDiffersFromOriginal).toBe(true);
    expect(applied.draftModified).toBe(false);
    expect(oldRuntime.requestSetValue(['name'], 'ignored').success).toBe(false);

    expect(
      application.replaceValue({ ...applied.value, nickname: 'long' })?.success,
    ).toBe(true);
    expect(application.getState().snapshot?.valid).toBe(false);
    expect(
      application
        .getState()
        .snapshot?.fields.flatMap(({ issues }) => issues)
        .some(
          ({ code, path }) =>
            code === 'maxLength' && path.join('.') === 'nickname',
        ),
    ).toBe(true);
    application.dispose();
  });

  it('confirms destructive apply, invalidates stale confirmation and restores original input', () => {
    const application = new StandardReferenceApplication();
    const original = application.getState();
    requiredRuntime(application).requestSetValue(['name'], 'Grace');
    application.updateSchemaDraft(addNameMaximum(original.schemaDraft, 3));

    expect(application.applyConfiguration()).toBe(false);
    expect(application.getState().pendingConfigurationAction).toBe('apply');
    application.updateSchemaDraft(addNameMaximum(original.schemaDraft, 4));
    expect(application.getState().pendingConfigurationAction).toBeUndefined();
    expect(application.confirmConfigurationAction()).toBe(false);

    expect(application.applyConfiguration()).toBe(false);
    const oldRuntime = requiredRuntime(application);
    expect(application.confirmConfigurationAction()).toBe(true);
    expect(application.getState()).toMatchObject({
      value: original.value,
      baselineValue: original.baselineValue,
      history: [],
      decisionMode: 'confirm',
      activeConfigurationDiffersFromOriginal: true,
    });
    expect(oldRuntime.requestSetValue(['name'], 'ignored').success).toBe(false);

    expect(application.restoreScenarioConfiguration()).toBe(false);
    expect(application.getState().pendingConfigurationAction).toBe('restore');
    application.cancelConfigurationAction();
    expect(application.getState().pendingConfigurationAction).toBeUndefined();
    expect(application.restoreScenarioConfiguration()).toBe(false);
    expect(application.confirmConfigurationAction()).toBe(true);
    expect(application.getState().activeConfigurationDiffersFromOriginal).toBe(
      false,
    );
    expect(application.getState().schemaDraft).toBe(original.schemaDraft);
    application.dispose();
  });

  it('cancels drafts and resets state while preserving active configuration and draft text', () => {
    const application = new StandardReferenceApplication();
    const original = application.getState();
    application.updateSchemaDraft(addNameMaximum(original.schemaDraft, 8));
    expect(application.applyConfiguration()).toBe(true);
    const active = application.getState();

    application.updateUiSchemaDraft(`${active.uiSchemaDraft}\n`);
    expect(application.getState().draftModified).toBe(true);
    application.cancelConfigurationChanges();
    expect(application.getState().draftModified).toBe(false);

    application.updateUiSchemaDraft(`${active.uiSchemaDraft}\n`);
    requiredRuntime(application).requestSetValue(['name'], 'Grace');
    application.setDecisionMode('pending');
    const epoch = application.getState().runtimeEpoch;
    application.resetScenario();
    expect(application.getState()).toMatchObject({
      activeCompileInput: active.activeCompileInput,
      uiSchemaDraft: `${active.uiSchemaDraft}\n`,
      value: original.value,
      baselineValue: original.baselineValue,
      decisionMode: 'confirm',
      history: [],
      runtimeEpoch: epoch,
    });

    expect(application.selectScenario('nested-profile')).toBe(true);
    expect(application.getState()).toMatchObject({
      draftModified: false,
      activeConfigurationDiffersFromOriginal: false,
    });
    expect(application.getState().pendingConfigurationAction).toBeUndefined();
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

  it('drives stable-team aggregate actions through public runtime intentions', () => {
    const application = new StandardReferenceApplication();
    expect(application.selectScenario('stable-team')).toBe(true);
    const initialTeam = readTeam(application);

    application.updateCollectionDraftId('linus');
    application.updateCollectionDraftName('Linus Torvalds');
    expect(application.insertTeamMember()).toBe(true);
    expect(readTeam(application).at(-1)).toMatchObject({
      id: 'linus',
      name: 'Linus Torvalds',
      role: 'Member',
    });

    expect(application.moveFirstTeamMemberLater()).toBe(true);
    expect(
      readTeam(application)
        .slice(0, 2)
        .map(({ id }) => id),
    ).toEqual([initialTeam[1]?.id, initialTeam[0]?.id]);
    expect(application.removeLastTeamMember()).toBe(true);
    expect(readTeam(application).some(({ id }) => id === 'linus')).toBe(false);

    application.resetScenario();
    expect(application.getState()).toMatchObject({
      collectionDraftId: 'new-member',
      collectionDraftName: 'New member',
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

function readTeam(application: StandardReferenceApplication): readonly {
  readonly id: string;
  readonly name: string;
  readonly role: string;
}[] {
  const value = application.getState().value;
  if (!('team' in value)) throw new Error('Expected stable team members.');
  const team = value.team;
  if (!Array.isArray(team)) throw new Error('Expected stable team members.');
  return team as readonly {
    readonly id: string;
    readonly name: string;
    readonly role: string;
  }[];
}

function requiredSequence(
  entry: { readonly sequence: number } | undefined,
): number {
  if (entry === undefined) throw new Error('Expected a pending operation.');
  return entry.sequence;
}

function addNameMaximum(schemaText: string, maxLength: number): string {
  const schema = JSON.parse(schemaText) as {
    properties: Record<string, Record<string, unknown>>;
  };
  schema.properties['name'] = {
    ...schema.properties['name'],
    maxLength,
  };
  return JSON.stringify(schema, undefined, 2);
}

async function flushAsyncValidation(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}
