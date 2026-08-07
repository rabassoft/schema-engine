// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import {
  compileFormDefinition,
  type Diagnostic,
  type FormOperation,
  type SchemaValidator,
  type WizardIntention,
} from '@rabassoft/schema-engine';
import { act, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useSchemaForm,
  type ReactControlledFormConfig,
  type ReactFormHandle,
} from '../src/index.js';

interface Value {
  readonly name?: string;
  readonly first?: string;
  readonly second?: string;
}

const schema = Object.freeze({
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: Object.freeze({
    name: Object.freeze({ type: 'string', title: 'Name' }),
  }),
});
const compilation = compileFormDefinition({ schema });
if (!compilation.success) throw new Error('Test definition must compile.');
const definition = compilation.definition;
const wizardSchema = Object.freeze({
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: Object.freeze({
    first: Object.freeze({ type: 'string' }),
    second: Object.freeze({ type: 'string' }),
  }),
});
const wizardCompilation = compileFormDefinition({
  schema: wizardSchema,
  uiSchema: {
    presentation: [
      {
        kind: 'wizard',
        id: 'flow',
        label: 'Flow',
        steps: [
          {
            kind: 'wizard-step',
            id: 'one',
            label: 'One',
            children: ['first'],
          },
          {
            kind: 'wizard-step',
            id: 'two',
            label: 'Two',
            children: ['second'],
          },
        ],
      },
    ],
  },
});
if (!wizardCompilation.success)
  throw new Error('Wizard test definition must compile.');
const wizardDefinition = wizardCompilation.definition;
const EMPTY_ISSUES = Object.freeze([]);

function createValidator(validate = vi.fn()) {
  const validator: SchemaValidator = Object.freeze({
    validate: (inputSchema: unknown, value: unknown) => {
      validate(inputSchema, value);
      return Object.freeze({ valid: true, issues: EMPTY_ISSUES });
    },
  });
  return { validate, validator };
}

function createConfig(
  overrides: Partial<ReactControlledFormConfig<Value>> = {},
): ReactControlledFormConfig<Value> {
  const { validator } = createValidator();
  return {
    formId: 'react-test',
    definition,
    schema,
    validator,
    value: Object.freeze({ name: 'Ada' }),
    baselineValue: Object.freeze({ name: 'Ada' }),
    locale: 'en',
    onOperation: vi.fn<(operation: FormOperation) => void>(),
    onWizardIntention: vi.fn<(intention: WizardIntention) => void>(),
    ...overrides,
  };
}

interface HarnessProps {
  readonly config: ReactControlledFormConfig<Value>;
  readonly observe: (handle: ReactFormHandle<Value>) => void;
}

function Harness({ config, observe }: HarnessProps): null {
  observe(useSchemaForm(config));
  return null;
}

describe('useSchemaForm controlled lifecycle', () => {
  let host: HTMLDivElement;
  let root: Root;
  let handles: ReactFormHandle<Value>[];

  beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
    handles = [];
  });

  afterEach(() => {
    act(() => root.unmount());
    host.remove();
  });

  function render(
    config: ReactControlledFormConfig<Value>,
    strict = false,
  ): ReactFormHandle<Value> {
    const element = (
      <Harness config={config} observe={(handle) => handles.push(handle)} />
    );
    act(() =>
      root.render(strict ? <StrictMode>{element}</StrictMode> : element),
    );
    const handle = handles.at(-1);
    if (handle === undefined) throw new Error('Hook did not publish a handle.');
    return handle;
  }

  it('blocks invalid required callbacks before validator or core readiness', () => {
    const validation = vi.fn();
    const diagnostics: readonly Diagnostic[][] = [];
    const config = createConfig({
      validator: createValidator(validation).validator,
      onDiagnostics: (batch) =>
        (diagnostics as Diagnostic[][]).push([...batch]),
    });
    Object.defineProperty(config, 'onOperation', {
      get: () => {
        throw new Error('must not be invoked');
      },
      enumerable: true,
    });

    const handle = render(config);

    expect(handle.state.status).toBe('error');
    expect(validation).not.toHaveBeenCalled();
    expect(handle.state.diagnostics.map(({ code }) => code)).toEqual([
      'INVALID_REACT_FORM_CONFIG',
    ]);
    expect(diagnostics).toHaveLength(1);
    expect(Object.isFrozen(handle.state)).toBe(true);
    expect(Object.isFrozen(handle.state.diagnostics)).toBe(true);
  });

  it('reports invalid callbacks in member order and isolates diagnostics errors', () => {
    const batches: readonly Diagnostic[][] = [];
    const config = createConfig({
      onDiagnostics: (batch) => {
        (batches as Diagnostic[][]).push([...batch]);
        throw new Error('isolated diagnostics boundary');
      },
    }) as unknown as Record<string, unknown>;
    delete config['onOperation'];
    config['onWizardIntention'] = 'invalid';

    expect(() =>
      render(config as unknown as ReactControlledFormConfig<Value>),
    ).not.toThrow();
    expect(batches[0]?.map(({ parameters }) => parameters['member'])).toEqual([
      'onOperation',
      'onWizardIntention',
    ]);
  });

  it('inspects callback and resolver descriptors in exact order before blocking', () => {
    const inspected: string[] = [];
    const target = createConfig({
      onOperation: undefined as never,
      textResolver: Object.freeze({ resolve: (text: string) => text }),
    });
    const observed = new Proxy(target, {
      getOwnPropertyDescriptor: (candidate, member) => {
        if (typeof member === 'string') inspected.push(member);
        return Reflect.getOwnPropertyDescriptor(candidate, member);
      },
    });

    expect(render(observed).state.status).toBe('error');
    expect(
      inspected
        .filter((member) =>
          [
            'onOperation',
            'onWizardIntention',
            'onDiagnostics',
            'textResolver',
          ].includes(member),
        )
        .slice(0, 4),
    ).toEqual([
      'onOperation',
      'onWizardIntention',
      'onDiagnostics',
      'textResolver',
    ]);
  });

  it('clears a previously committed diagnostics callback when the next config omits it', () => {
    const previousDiagnostics = vi.fn<(batch: readonly Diagnostic[]) => void>();
    const valid = createConfig({ onDiagnostics: previousDiagnostics });
    expect(render(valid).state.status).toBe('ready');
    const invalid = { ...valid } as Record<string, unknown>;
    delete invalid['onDiagnostics'];
    delete invalid['onOperation'];

    expect(
      render(invalid as unknown as ReactControlledFormConfig<Value>).state
        .status,
    ).toBe('error');
    expect(previousDiagnostics).not.toHaveBeenCalled();
  });

  it('re-evaluates a blocked callback when its descriptor kind changes', () => {
    const batches: Diagnostic[][] = [];
    const invalid = createConfig({
      onDiagnostics: (batch) => batches.push([...batch]),
    });
    Object.defineProperty(invalid, 'onOperation', {
      configurable: true,
      get: () => undefined,
    });
    render(invalid);
    expect(batches.at(-1)?.[0]?.parameters['reason']).toBe('accessor-member');

    delete (invalid as unknown as Record<string, unknown>)['onOperation'];
    render(invalid);
    expect(batches).toHaveLength(2);
    expect(batches.at(-1)?.[0]?.parameters['reason']).toBe('missing-member');
  });

  it('publishes the exact snapshot and keeps actions stable within an epoch', () => {
    const config = createConfig();
    const first = render(config);
    expect(first.state.status).toBe('ready');
    if (first.state.status !== 'ready') return;
    expect(first.state.snapshot.value).toBe(config.value);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.actions)).toBe(true);
    expect(
      Object.isFrozen(
        Object.getOwnPropertyDescriptor(first.actions, 'requestSetValue')
          ?.value,
      ),
    ).toBe(true);

    const nextValue = Object.freeze({ name: 'Grace' });
    const second = render({ ...config, value: nextValue });
    expect(second.state.status).toBe('ready');
    if (second.state.status !== 'ready') return;
    expect(second.state.snapshot.value).toBe(nextValue);
    expect(second.actions).toBe(first.actions);
    expect(second).not.toBe(first);
  });

  it('uses latest callbacks without replacing core and diagnoses stale epochs', () => {
    const firstOperation = vi.fn<(operation: FormOperation) => void>();
    const secondOperation = vi.fn<(operation: FormOperation) => void>();
    const diagnostics = vi.fn<(batch: readonly Diagnostic[]) => void>();
    const config = createConfig({
      onOperation: firstOperation,
      onDiagnostics: diagnostics,
    });
    const first = render(config);
    const sameEpoch = render({ ...config, onOperation: secondOperation });
    expect(sameEpoch.actions).toBe(first.actions);

    act(() => {
      sameEpoch.actions.requestSetValue(['name'], 'Grace');
    });
    expect(firstOperation).not.toHaveBeenCalled();
    expect(secondOperation).toHaveBeenCalledTimes(1);

    const replaced = render({ ...config, formId: 'replacement' });
    expect(replaced.actions).not.toBe(first.actions);
    const stale = first.actions.requestRemoveValue(['name']);
    expect(stale.success).toBe(false);
    expect(stale.diagnostics[0]?.code).toBe('STALE_REACT_FORM_ACTION');
    expect(diagnostics).toHaveBeenCalledWith(stale.diagnostics);
  });

  it('freezes the exact closed action inventory without lifecycle escapes', () => {
    const handle = render(createConfig());
    expect(Object.keys(handle.actions).sort()).toEqual(
      [
        'blur',
        'confirmWizardSelection',
        'focus',
        'getCollectionNodeSnapshot',
        'getFieldSnapshot',
        'getItemSnapshot',
        'getNodeSnapshot',
        'getValidationSnapshot',
        'hideValidationErrors',
        'rejectWizardIntention',
        'requestInsertItem',
        'requestMoveItem',
        'requestRemoveItem',
        'requestRemoveItemValue',
        'requestRemoveValue',
        'requestSetItemValue',
        'requestSetValue',
        'requestWizardComplete',
        'requestWizardNext',
        'requestWizardPrevious',
        'resetTouched',
        'retryAsyncValidation',
        'setValidationVisibility',
        'showValidationErrors',
      ].sort(),
    );
    expect('subscribe' in handle.actions).toBe(false);
    expect('dispose' in handle.actions).toBe(false);
    expect('updateExternalState' in handle.actions).toBe(false);
    expect('getSnapshot' in handle.actions).toBe(false);
  });

  it('reconciles value, baseline and locale atomically without replacing actions', () => {
    const validation = vi.fn();
    const config = createConfig({
      validator: createValidator(validation).validator,
    });
    const first = render(config);
    expect(validation).toHaveBeenCalledTimes(1);
    const nextValue = Object.freeze({ name: 'Grace' });
    const nextBaseline = Object.freeze({ name: 'Katherine' });
    const second = render({
      ...config,
      value: nextValue,
      baselineValue: nextBaseline,
      locale: 'es',
      validationVisibility: 'all',
    });
    expect(validation).toHaveBeenCalledTimes(2);
    expect(second.actions).toBe(first.actions);
    expect(second.state).toMatchObject({
      status: 'ready',
      snapshot: {
        value: nextValue,
        locale: 'es',
        validationVisibility: 'all',
      },
    });
  });

  it('changes resolver/callback ports without recreating the runtime', () => {
    const validation = vi.fn();
    const firstResolver = Object.freeze({ resolve: (text: string) => text });
    const secondResolver = Object.freeze({ resolve: (text: string) => text });
    const config = createConfig({
      validator: createValidator(validation).validator,
      textResolver: firstResolver,
    });
    const first = render(config);
    const second = render({ ...config, textResolver: secondResolver });
    expect(validation).toHaveBeenCalledTimes(1);
    expect(second.actions).toBe(first.actions);
    expect(second).not.toBe(first);
  });

  it('warns once per invalid resolver identity and keeps source fallback ready', () => {
    const diagnostics = vi.fn<(batch: readonly Diagnostic[]) => void>();
    const invalidResolver = Object.freeze({ resolve: 'invalid' });
    const config = createConfig({
      onDiagnostics: diagnostics,
      textResolver: invalidResolver as never,
    });
    const first = render(config);
    expect(first.state.status).toBe('ready');
    expect(diagnostics).toHaveBeenCalledTimes(1);
    expect(diagnostics.mock.calls[0]?.[0]).toMatchObject([
      { code: 'INVALID_TEXT_RESOLVER', severity: 'warning' },
    ]);
    render(config);
    expect(diagnostics).toHaveBeenCalledTimes(1);
  });

  it('isolates operation callback exceptions at the core listener boundary', () => {
    const config = createConfig({
      onOperation: () => {
        throw new Error('application callback');
      },
    });
    const handle = render(config);
    expect(() =>
      handle.actions.requestSetValue(['name'], 'Grace'),
    ).not.toThrow();
  });

  it('keeps wizard config seed-only and confirms each intention explicitly', () => {
    const intentions = vi.fn<(intention: WizardIntention) => void>();
    const value = Object.freeze({ first: 'ready', second: 'ready' });
    const config = createConfig({
      definition: wizardDefinition,
      schema: wizardSchema,
      value,
      baselineValue: value,
      wizardState: Object.freeze({ selectedStepId: 'one' }),
      onWizardIntention: intentions,
    });
    const first = render(config);
    expect(first.state).toMatchObject({
      status: 'ready',
      snapshot: { wizard: { selectedStepId: 'one' } },
    });
    let requestId = 0;
    act(() => {
      const result = first.actions.requestWizardNext();
      expect(result.success).toBe(true);
      requestId = intentions.mock.calls[0]?.[0].requestId ?? 0;
    });
    expect(intentions).toHaveBeenCalledTimes(1);

    const seededOnly = render({
      ...config,
      wizardState: Object.freeze({ selectedStepId: 'two' }),
    });
    expect(seededOnly.actions).toBe(first.actions);
    expect(seededOnly.state).toMatchObject({
      status: 'ready',
      snapshot: { wizard: { selectedStepId: 'one' } },
    });
    act(() => {
      expect(
        seededOnly.actions.confirmWizardSelection(
          Object.freeze({ requestId, selectedStepId: 'two' }),
        ).success,
      ).toBe(true);
    });
    expect(handles.at(-1)?.state).toMatchObject({
      status: 'ready',
      snapshot: { wizard: { selectedStepId: 'two' } },
    });
    expect(intentions).toHaveBeenCalledTimes(1);
  });

  it('deduplicates an unchanged error epoch and retries after relevant input', () => {
    const validation = vi.fn();
    const diagnostics = vi.fn<(batch: readonly Diagnostic[]) => void>();
    const config = createConfig({
      validator: createValidator(validation).validator,
      wizardState: Object.freeze({ selectedStepId: 'not-applicable' }),
      onDiagnostics: diagnostics,
    });
    const first = render(config);
    expect(first.state.status).toBe('error');
    const deliveries = diagnostics.mock.calls.length;
    const renders = handles.length;
    render(config);
    expect(validation).toHaveBeenCalledTimes(0);
    expect(diagnostics).toHaveBeenCalledTimes(deliveries);
    expect(handles.length).toBe(renders + 1);

    const recoveredConfig = { ...config };
    delete recoveredConfig.wizardState;
    const recovered = render(recoveredConfig);
    expect(recovered.state.status).toBe('ready');
  });

  it('balances Strict Mode replay and makes retained actions inert on unmount', () => {
    const validation = vi.fn();
    const operations = vi.fn<(operation: FormOperation) => void>();
    const intentions = vi.fn<(intention: WizardIntention) => void>();
    const config = createConfig({
      validator: createValidator(validation).validator,
      onOperation: operations,
      onWizardIntention: intentions,
    });
    const handle = render(config, true);
    expect(handle.state.status).toBe('ready');
    expect(validation).toHaveBeenCalledTimes(2);
    act(() => {
      expect(handle.actions.requestSetValue(['name'], 'Grace').success).toBe(
        true,
      );
    });
    expect(operations).toHaveBeenCalledOnce();
    expect(intentions).not.toHaveBeenCalled();

    act(() => root.unmount());
    root = createRoot(host);
    const result = handle.actions.requestRemoveValue(['name']);
    expect(result.success).toBe(false);
    expect(result.diagnostics[0]).toMatchObject({
      code: 'STALE_REACT_FORM_ACTION',
      parameters: { reason: 'unmounted' },
    });
  });

  it('does not create a runtime for an abandoned render', () => {
    const validation = vi.fn();
    const config = createConfig({
      validator: createValidator(validation).validator,
    });
    const report = vi.spyOn(console, 'error').mockImplementation(() => {});
    function Abandoned(): never {
      useSchemaForm(config);
      throw new Error('abandoned render');
    }

    expect(() => act(() => root.render(<Abandoned />))).toThrow(
      'abandoned render',
    );
    expect(validation).not.toHaveBeenCalled();
    report.mockRestore();
  });
});
