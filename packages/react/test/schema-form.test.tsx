// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import {
  compileFormDefinition,
  type Diagnostic,
  type FormOperation,
  type SchemaValidator,
} from '@rabassoft/schema-engine';
import { act, StrictMode, useLayoutEffect, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createReactNativeRendererRegistry,
  createReactRendererRegistry,
  SchemaForm,
  type ReactControlledFormConfig,
  type ReactFieldRendererProps,
  type ReactFormHandle,
  type ReactRendererRegistry,
} from '../src/index.js';
import { ReactFormController } from '../src/internal/controller.js';
import {
  internalReactDiagnosticsReceiver,
  internalReactFormHandleBrand,
} from '../src/internal/handle.js';

interface Value {
  readonly name?: string;
  readonly second?: string;
}

const schema = Object.freeze({
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: Object.freeze({
    name: Object.freeze({ type: 'string', title: 'Name' }),
    second: Object.freeze({ type: 'string', title: 'Second' }),
  }),
});
const compilation = compileFormDefinition({ schema });
if (!compilation.success) throw new Error('SchemaForm fixture must compile.');
const definition = compilation.definition;
const validator: SchemaValidator = Object.freeze({
  validate: () => Object.freeze({ valid: true, issues: Object.freeze([]) }),
});

function config(
  overrides: Partial<ReactControlledFormConfig<Value>> = {},
): ReactControlledFormConfig<Value> {
  const value = Object.freeze({ name: 'Ada', second: 'Grace' });
  return {
    formId: 'projection',
    definition,
    schema,
    validator,
    value,
    baselineValue: value,
    locale: 'en',
    onOperation: vi.fn(),
    onWizardIntention: vi.fn(),
    ...overrides,
  };
}

function readyHandle(input: ReactControlledFormConfig<Value>): {
  readonly controller: ReactFormController<Value>;
  readonly handle: ReactFormHandle<Value>;
} {
  const controller = new ReactFormController<Value>();
  controller.commit(input);
  const handle = controller.store.getSnapshot();
  if (handle.state.status !== 'ready')
    throw new Error('Expected ready handle.');
  return { controller, handle };
}

function validRegistry(
  registrations: Parameters<typeof createReactRendererRegistry>[0],
): ReactRendererRegistry {
  const result = createReactRendererRegistry(registrations);
  if (!result.success) throw new Error('Expected valid renderer registry.');
  return result.registry;
}

describe('SchemaForm committed projection', () => {
  let host: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
  });

  afterEach(() => {
    act(() => root.unmount());
    host.remove();
  });

  function render(element: ReactElement): void {
    act(() => root.render(element));
  }

  it('prepares frozen exact props after commit and delegates owner actions', () => {
    let received: ReactFieldRendererProps | undefined;
    const operations = vi.fn<(operation: FormOperation) => void>();
    const resolver = vi.fn((text: string) => `resolved:${text}`);
    const { handle } = readyHandle(
      config({
        onOperation: operations,
        textResolver: Object.freeze({ resolve: resolver }),
      }),
    );
    const tester = vi.fn(() => 10);
    const Renderer = (props: ReactFieldRendererProps) => {
      received = props;
      return <output>{props.texts.label}</output>;
    };
    const registry = validRegistry([
      { id: 'custom', component: Renderer, tester },
    ]);

    render(<SchemaForm form={handle} rendererRegistry={registry} />);

    expect(host.textContent).toContain('resolved:Name');
    expect(host.textContent).toContain('resolved:Second');
    expect(tester).toHaveBeenCalledTimes(2);
    expect(resolver).toHaveBeenCalled();
    expect(received).toBeDefined();
    expect(Object.keys(received ?? {}).sort()).toEqual(
      [
        'field',
        'snapshot',
        'formId',
        'locale',
        'texts',
        'setValue',
        'removeValue',
        'fieldFocus',
        'fieldBlur',
        'rendererDiagnostics',
      ].sort(),
    );
    expect(Object.isFrozen(received)).toBe(true);
    expect(Object.isFrozen(received?.texts)).toBe(true);
    expect(Object.isFrozen(received?.texts.choiceLabels)).toBe(true);
    expect(Object.isFrozen(received?.setValue)).toBe(true);
    act(() => {
      expect(received?.setValue('Katherine').success).toBe(true);
    });
    expect(operations).toHaveBeenCalledOnce();
  });

  it('projects native controls through the closed factory and emits controlled operations', () => {
    const operations = vi.fn<(operation: FormOperation) => void>();
    const { handle } = readyHandle(config({ onOperation: operations }));
    const result = createReactNativeRendererRegistry();
    if (!result.success) throw new Error('Expected native registry.');

    render(<SchemaForm form={handle} rendererRegistry={result.registry} />);

    const inputs = host.querySelectorAll('input');
    expect(inputs).toHaveLength(2);
    expect(inputs[0]?.labels?.[0]?.textContent).toBe('Name');
    const descriptor = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    );
    if (descriptor?.set === undefined || inputs[0] === undefined)
      throw new Error('Expected native input setter.');
    descriptor.set.bind(inputs[0])('Katherine');
    act(() => {
      inputs[0]?.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(operations).toHaveBeenCalledOnce();
    expect(operations.mock.calls[0]?.[0]).toMatchObject({
      type: 'set-value',
      path: ['name'],
      value: 'Katherine',
    });
  });

  it('does not invoke text resolution again for an unchanged committed cache', () => {
    const resolver = vi.fn((text: string) => text);
    const initial = config({
      textResolver: Object.freeze({ resolve: resolver }),
    });
    const { controller, handle } = readyHandle(initial);
    const tester = vi.fn(() => 1);
    const registry = validRegistry([
      {
        id: 'custom',
        component: (props) => <output>{props.texts.label}</output>,
        tester,
      },
    ]);
    let element = <SchemaForm form={handle} rendererRegistry={registry} />;

    render(element);
    const firstResolverCount = resolver.mock.calls.length;
    const firstTesterCount = tester.mock.calls.length;
    expect(firstResolverCount).toBeGreaterThan(0);
    expect(firstTesterCount).toBe(2);
    render(element);
    expect(resolver).toHaveBeenCalledTimes(firstResolverCount);
    expect(tester).toHaveBeenCalledTimes(firstTesterCount);

    controller.commit({
      ...initial,
      value: Object.freeze({ name: 'Grace', second: 'Ada' }),
    });
    element = (
      <SchemaForm
        form={controller.store.getSnapshot()}
        rendererRegistry={registry}
      />
    );
    render(element);
    expect(resolver).toHaveBeenCalledTimes(firstResolverCount);
    expect(tester).toHaveBeenCalledTimes(firstTesterCount);
  });

  it('retains owner callbacks across same-epoch snapshots and closes them on replacement', () => {
    const operations = vi.fn<(operation: FormOperation) => void>();
    const initial = config({ onOperation: operations });
    const { controller, handle } = readyHandle(initial);
    const received = new Map<string, ReactFieldRendererProps>();
    const Renderer = (props: ReactFieldRendererProps) => {
      received.set(props.field.name, props);
      return <output>{props.texts.label}</output>;
    };
    const registry = validRegistry([
      { id: 'custom', component: Renderer, tester: () => 1 },
    ]);
    render(<SchemaForm form={handle} rendererRegistry={registry} />);
    const retained = received.get('name');
    if (retained === undefined)
      throw new Error('Expected retained renderer props.');

    controller.commit({
      ...initial,
      value: Object.freeze({ name: 'Grace', second: 'Ada' }),
    });
    render(
      <SchemaForm
        form={controller.store.getSnapshot()}
        rendererRegistry={registry}
      />,
    );
    expect(retained.setValue('Katherine').success).toBe(true);
    expect(operations).toHaveBeenCalledOnce();

    controller.commit({ ...initial, formId: 'replacement' });
    render(
      <SchemaForm
        form={controller.store.getSnapshot()}
        rendererRegistry={registry}
      />,
    );
    expect(retained.setValue('blocked')).toMatchObject({
      success: false,
      diagnostics: [{ code: 'STALE_REACT_FORM_ACTION' }],
    });
    expect(operations).toHaveBeenCalledOnce();
  });

  it('keeps committed owner gates active across Strict Mode effect replay', () => {
    const operations = vi.fn<(operation: FormOperation) => void>();
    const { handle } = readyHandle(config({ onOperation: operations }));
    let received: ReactFieldRendererProps | undefined;
    const tester = vi.fn(() => 1);
    const registry = validRegistry([
      {
        id: 'custom',
        component: (props) => {
          received = props;
          return <output>{props.texts.label}</output>;
        },
        tester,
      },
    ]);

    render(
      <StrictMode>
        <SchemaForm form={handle} rendererRegistry={registry} />
      </StrictMode>,
    );
    expect(tester).toHaveBeenCalledTimes(2);
    expect(received?.setValue('Changed').success).toBe(true);
    expect(operations).toHaveBeenCalledOnce();
  });

  it('publishes owner-ordered no-match diagnostics once for an unchanged cache', () => {
    const diagnostics = vi.fn<(batch: readonly Diagnostic[]) => void>();
    const { handle } = readyHandle(config({ onDiagnostics: diagnostics }));
    const registry = validRegistry([]);
    const element = <SchemaForm form={handle} rendererRegistry={registry} />;

    render(element);
    render(element);

    expect(host.childElementCount).toBe(0);
    expect(diagnostics).toHaveBeenCalledOnce();
    expect(diagnostics.mock.calls[0]?.[0]).toMatchObject([
      { code: 'NO_RENDERER_MATCH', parameters: { field: 'name' } },
      { code: 'NO_RENDERER_MATCH', parameters: { field: 'second' } },
    ]);
  });

  it('rejects a forged registry after commit without a partial tree', () => {
    const diagnostics = vi.fn<(batch: readonly Diagnostic[]) => void>();
    const { handle } = readyHandle(config({ onDiagnostics: diagnostics }));

    render(
      <SchemaForm
        form={handle}
        rendererRegistry={{} as ReactRendererRegistry}
      />,
    );

    expect(host.childElementCount).toBe(0);
    expect(diagnostics).toHaveBeenCalledWith([
      expect.objectContaining({
        code: 'INVALID_REACT_RENDERER_REGISTRY',
        parameters: { member: 'rendererRegistry', reason: 'invalid-brand' },
      }),
    ]);
  });

  it('uses a cross-copy receiver for one incompatible-handle diagnostic', () => {
    const receiver = vi.fn<(batch: readonly Diagnostic[]) => void>();
    const foreignBrand = Symbol(internalReactFormHandleBrand.description);
    const foreign = Object.freeze(
      Object.defineProperties(
        {},
        {
          [foreignBrand]: { value: true },
          [internalReactDiagnosticsReceiver]: { value: receiver },
        },
      ),
    ) as ReactFormHandle<Value>;
    const registry = validRegistry([]);

    render(<SchemaForm form={foreign} rendererRegistry={registry} />);

    expect(receiver).toHaveBeenCalledOnce();
    expect(receiver.mock.calls[0]?.[0]).toMatchObject([
      {
        code: 'INVALID_REACT_FORM_HANDLE',
        parameters: { member: 'form', reason: 'different-package-copy' },
      },
    ]);
  });

  it('closes only a throwing owner, diagnoses once and deactivates its callbacks', () => {
    const diagnostics = vi.fn<(batch: readonly Diagnostic[]) => void>();
    const operations = vi.fn<(operation: FormOperation) => void>();
    const { handle } = readyHandle(
      config({ onDiagnostics: diagnostics, onOperation: operations }),
    );
    let retained: ReactFieldRendererProps | undefined;
    const Throwing = (props: ReactFieldRendererProps): ReactElement => {
      retained = props;
      throw new Error('renderer failure');
    };
    const Working = (props: ReactFieldRendererProps) => (
      <output>{props.texts.label}</output>
    );
    const registry = validRegistry([
      {
        id: 'throwing',
        component: Throwing,
        tester: (field) => (field.name === 'name' ? 10 : null),
      },
      {
        id: 'working',
        component: Working,
        tester: (field) => (field.name === 'second' ? 10 : null),
      },
    ]);
    const report = vi.spyOn(console, 'error').mockImplementation(() => {});
    const element = <SchemaForm form={handle} rendererRegistry={registry} />;

    render(element);
    render(element);

    expect(host.textContent).toBe('Second');
    expect(
      diagnostics.mock.calls
        .flatMap(([batch]) => batch)
        .filter(({ code }) => code === 'REACT_RENDERER_FAILED'),
    ).toHaveLength(1);
    expect(retained?.setValue('blocked')).toMatchObject({
      success: false,
      diagnostics: [{ code: 'STALE_REACT_FORM_ACTION' }],
    });
    expect(operations).not.toHaveBeenCalled();
    report.mockRestore();
  });

  it('delivers detached renderer diagnostics after the renderer commit', async () => {
    const diagnostics = vi.fn<(batch: readonly Diagnostic[]) => void>();
    const { handle } = readyHandle(config({ onDiagnostics: diagnostics }));
    const Renderer = (props: ReactFieldRendererProps) => {
      useLayoutEffect(() => {
        props.rendererDiagnostics(
          Object.freeze([
            Object.freeze({
              code: 'CUSTOM_RENDERER_NOTICE',
              severity: 'warning' as const,
              source: 'runtime' as const,
              parameters: Object.freeze({ field: props.field.name }),
            }),
          ]),
        );
      }, [props]);
      return <output>{props.texts.label}</output>;
    };
    const registry = validRegistry([
      { id: 'diagnostic', component: Renderer, tester: () => 1 },
    ]);

    await act(async () => {
      root.render(<SchemaForm form={handle} rendererRegistry={registry} />);
      await Promise.resolve();
    });

    const delivered = diagnostics.mock.calls.flatMap(([batch]) => batch);
    expect(
      delivered.filter(({ code }) => code === 'CUSTOM_RENDERER_NOTICE'),
    ).toHaveLength(2);
    const custom = delivered.find(
      ({ code }) => code === 'CUSTOM_RENDERER_NOTICE',
    );
    expect(Object.isFrozen(custom)).toBe(true);
    expect(Object.isFrozen(custom?.parameters)).toBe(true);
  });

  it('deep-detaches valid renderer diagnostics and replaces hostile batches', async () => {
    const diagnostics = vi.fn<(batch: readonly Diagnostic[]) => void>();
    const { handle } = readyHandle(config({ onDiagnostics: diagnostics }));
    const nested = { values: ['one', { enabled: true }] };
    const getter = vi.fn(() => ({
      code: 'UNSAFE',
      severity: 'warning',
      source: 'runtime',
      parameters: {},
    }));
    const hostile = new Array(1);
    Object.defineProperty(hostile, '0', { get: getter });
    const Renderer = (props: ReactFieldRendererProps) => {
      useLayoutEffect(() => {
        props.rendererDiagnostics([
          {
            code: 'NESTED_RENDERER_NOTICE',
            severity: 'warning',
            source: 'runtime',
            parameters: nested,
            dataPath: ['name'],
            documentPath: ['uiSchema', 0],
          },
        ]);
        props.rendererDiagnostics(hostile);
      }, [props]);
      return <output>{props.texts.label}</output>;
    };
    const registry = validRegistry([
      { id: 'diagnostic', component: Renderer, tester: () => 1 },
    ]);

    await act(async () => {
      root.render(<SchemaForm form={handle} rendererRegistry={registry} />);
      await Promise.resolve();
    });

    expect(getter).not.toHaveBeenCalled();
    const delivered = diagnostics.mock.calls.flatMap(([batch]) => batch);
    const valid = delivered.find(
      ({ code }) => code === 'NESTED_RENDERER_NOTICE',
    );
    expect(valid?.parameters).not.toBe(nested);
    expect(Object.isFrozen(valid?.parameters)).toBe(true);
    expect(
      Object.isFrozen(
        (valid?.parameters['values'] as readonly unknown[] | undefined)?.[1],
      ),
    ).toBe(true);
    expect(valid?.documentPath).toEqual(['uiSchema', 0]);
    expect(
      delivered.filter(({ code }) => code === 'INVALID_RENDERER_DIAGNOSTICS'),
    ).toHaveLength(2);
  });

  it('discards a cache prepared from a generation invalidated by a tester', () => {
    const initial = config();
    const { controller, handle } = readyHandle(initial);
    let invalidate = true;
    const registry = validRegistry([
      {
        id: 'custom',
        component: (props) => <output>{props.texts.label}</output>,
        tester: () => {
          if (invalidate) {
            invalidate = false;
            controller.commit({
              ...initial,
              textResolver: Object.freeze({ resolve: (text: string) => text }),
            });
          }
          return 1;
        },
      },
    ]);

    render(<SchemaForm form={handle} rendererRegistry={registry} />);
    expect(host.childElementCount).toBe(0);

    const current = controller.store.getSnapshot();
    render(<SchemaForm form={current} rendererRegistry={registry} />);
    expect(host.textContent).toBe('NameSecond');
  });

  it('resets a failed boundary only when its component identity changes', () => {
    const diagnostics = vi.fn<(batch: readonly Diagnostic[]) => void>();
    const { handle } = readyHandle(config({ onDiagnostics: diagnostics }));
    const Throwing = (): ReactElement => {
      throw new Error('first component');
    };
    const Working = (props: ReactFieldRendererProps) => (
      <output>{props.texts.label}</output>
    );
    const first = validRegistry([
      { id: 'same', component: Throwing, tester: () => 1 },
    ]);
    const second = validRegistry([
      { id: 'same', component: Working, tester: () => 1 },
    ]);
    const report = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<SchemaForm form={handle} rendererRegistry={first} />);
    expect(host.childElementCount).toBe(0);
    render(<SchemaForm form={handle} rendererRegistry={second} />);
    expect(host.textContent).toBe('NameSecond');
    expect(
      diagnostics.mock.calls
        .flatMap(([batch]) => batch)
        .filter(({ code }) => code === 'REACT_RENDERER_FAILED'),
    ).toHaveLength(2);
    report.mockRestore();
  });

  it('does not run testers for a render abandoned before commit', () => {
    const { handle } = readyHandle(config());
    const tester = vi.fn(() => 1);
    const registry = validRegistry([
      { id: 'custom', component: () => null, tester },
    ]);
    const report = vi.spyOn(console, 'error').mockImplementation(() => {});
    const Abandoned = (): ReactElement => {
      throw new Error('abandoned parent');
    };

    expect(() =>
      render(
        <>
          <SchemaForm form={handle} rendererRegistry={registry} />
          <Abandoned />
        </>,
      ),
    ).toThrow('abandoned parent');
    expect(tester).not.toHaveBeenCalled();
    report.mockRestore();
  });
});
