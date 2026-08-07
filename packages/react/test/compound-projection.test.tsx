// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import {
  compileFormDefinition,
  type FormDefinition,
  type FormOperation,
  type SchemaValidator,
} from '@rabassoft/schema-engine';
import { act, useState, type ReactElement } from 'react';
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

const validator: SchemaValidator = Object.freeze({
  validate: () => Object.freeze({ valid: true, issues: Object.freeze([]) }),
});

function compile(
  schema: unknown,
  uiSchema?: unknown,
  collectionPolicies?: readonly {
    readonly path: readonly string[];
    readonly itemIdentityProperty: string;
  }[],
): FormDefinition {
  const result = compileFormDefinition({
    schema,
    ...(uiSchema === undefined ? {} : { uiSchema }),
    ...(collectionPolicies === undefined ? {} : { collectionPolicies }),
  });
  if (!result.success)
    throw new Error(
      `Fixture did not compile: ${JSON.stringify(result.diagnostics)}`,
    );
  return result.definition;
}

function nativeRegistry(): ReactRendererRegistry {
  const result = createReactNativeRendererRegistry();
  if (!result.success) throw new Error('Native registry was unavailable.');
  return result.registry;
}

function config<TData extends object>(
  definition: FormDefinition,
  schema: unknown,
  value: TData,
  operations: (operation: FormOperation) => void = vi.fn(),
): ReactControlledFormConfig<TData> {
  return {
    formId: 'compound',
    definition,
    schema,
    validator,
    value,
    baselineValue: value,
    locale: 'en',
    onOperation: operations,
    onWizardIntention: vi.fn(),
  };
}

function ready<TData extends object>(
  input: ReactControlledFormConfig<TData>,
): {
  readonly controller: ReactFormController<TData>;
  readonly handle: ReactFormHandle<TData>;
} {
  const controller = new ReactFormController<TData>();
  controller.commit(input);
  const handle = controller.store.getSnapshot();
  if (handle.state.status !== 'ready')
    throw new Error('Expected ready handle.');
  return { controller, handle };
}

describe('React compound normalized projection', () => {
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

  const render = (element: ReactElement) => act(() => root.render(element));

  it('projects nested objects and retains tabs and accordion state across snapshots', async () => {
    const schema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        profile: {
          type: 'object',
          title: 'Profile',
          properties: {
            first: { type: 'string', title: 'First' },
            second: { type: 'string', title: 'Second' },
          },
        },
        note: { type: 'string', title: 'Note' },
      },
    };
    const uiSchema = {
      presentation: [
        {
          kind: 'tabs',
          id: 'root-tabs',
          label: 'Root tabs',
          panels: [
            {
              kind: 'panel',
              id: 'profile',
              label: 'Profile panel',
              children: [
                {
                  kind: 'section',
                  id: 'profile-section',
                  label: 'Profile section',
                  children: [
                    {
                      kind: 'grid',
                      id: 'profile-grid',
                      label: 'Profile grid',
                      columns: 2,
                      items: [{ span: 2, child: 'profile' }],
                    },
                  ],
                },
              ],
            },
            {
              kind: 'panel',
              id: 'note',
              label: 'Note panel',
              children: [
                {
                  kind: 'accordion',
                  id: 'note-accordion',
                  label: 'Note details',
                  panels: [
                    {
                      kind: 'panel',
                      id: 'note-body',
                      label: 'Note body',
                      children: ['note'],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
    const definition = compile(schema, uiSchema);
    const initial = {
      profile: { first: 'Ada', second: 'Lovelace' },
      note: 'Ready',
    };
    const resolver = vi.fn((text: string) => text);
    const input = {
      ...config(definition, schema, initial),
      textResolver: Object.freeze({ resolve: resolver }),
    };
    const { controller, handle } = ready(input);
    const registry = nativeRegistry();

    render(<SchemaForm form={handle} rendererRegistry={registry} />);
    expect(host.querySelectorAll('[role="tab"]')).toHaveLength(2);
    expect(
      host.querySelector('[role="group"][aria-label="Profile grid"]'),
    ).not.toBeNull();
    expect(host.querySelector('input')?.value).toBe('Ada');
    const noteTab = [
      ...host.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    ].find((button) => button.textContent === 'Note panel');
    const profileTab = host.querySelector<HTMLButtonElement>('[role="tab"]');
    await act(async () => {
      profileTab?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
      );
      await Promise.resolve();
    });
    expect(noteTab?.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(noteTab);
    const disclosure = [
      ...host.querySelectorAll<HTMLButtonElement>('button'),
    ].find((button) => button.textContent === 'Note body');
    expect(disclosure?.getAttribute('aria-expanded')).toBe('false');
    act(() => disclosure?.click());
    expect(disclosure?.getAttribute('aria-expanded')).toBe('true');
    const resolutionCount = resolver.mock.calls.length;

    controller.commit({ ...input, value: { ...initial, note: 'Updated' } });
    render(
      <SchemaForm
        form={controller.store.getSnapshot()}
        rendererRegistry={registry}
      />,
    );
    expect(noteTab?.getAttribute('aria-selected')).toBe('true');
    expect(disclosure?.getAttribute('aria-expanded')).toBe('true');
    expect(resolver).toHaveBeenCalledTimes(resolutionCount);
    expect(
      [...host.querySelectorAll('input')].some(
        (input) => input.value === 'Updated',
      ),
    ).toBe(true);
  });

  it('preserves a native item draft across a stable reorder', () => {
    const schema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        rows: {
          type: 'array',
          title: 'Rows',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string', title: 'Name' },
            },
            required: ['id', 'name'],
          },
        },
      },
    };
    const definition = compile(schema, undefined, [
      { path: ['rows'], itemIdentityProperty: 'id' },
    ]);
    const alpha = { id: 'alpha', name: 'Alpha' };
    const beta = { id: 'beta', name: 'Beta' };
    const initial = { rows: [alpha, beta] };
    const input = config(definition, schema, initial);
    const { controller, handle } = ready(input);
    const registry = nativeRegistry();

    render(<SchemaForm form={handle} rendererRegistry={registry} />);
    const alphaInput = [
      ...host.querySelectorAll<HTMLInputElement>('input'),
    ].find((candidate) => candidate.value === 'Alpha');
    setInput(alphaInput, 'Draft Alpha');
    controller.commit({ ...input, value: { rows: [beta, alpha] } });
    render(
      <SchemaForm
        form={controller.store.getSnapshot()}
        rendererRegistry={registry}
      />,
    );
    const draft = [...host.querySelectorAll<HTMLInputElement>('input')].find(
      (candidate) => candidate.value === 'Draft Alpha',
    );
    expect(draft).toBe(alphaInput);
    expect(draft?.closest('[data-schema-item-key]')).toBe(
      host.querySelectorAll('[data-schema-item-key]')[1],
    );
    act(() => draft?.focus());
    controller.commit({ ...input, value: { rows: [beta] } });
    render(
      <SchemaForm
        form={controller.store.getSnapshot()}
        rendererRegistry={registry}
      />,
    );
    expect(
      (document.activeElement as HTMLElement | null)?.closest(
        '[data-schema-item-key]',
      ),
    ).toBe(host.querySelector('[data-schema-item-key]'));

    controller.commit({
      ...input,
      value: { rows: [beta, { id: 'beta', name: 'Duplicate' }] },
    });
    render(
      <SchemaForm
        form={controller.store.getSnapshot()}
        rendererRegistry={registry}
      />,
    );
    expect(host.querySelectorAll('[data-schema-item-key]')).toHaveLength(0);
    const identityAlert = host.querySelector<HTMLElement>('[role="alert"]');
    expect(identityAlert?.textContent).toBe(
      'Collection items have invalid identity.',
    );
    expect(
      host
        .querySelector('[data-schema-collection-key]')
        ?.getAttribute('aria-describedby'),
    ).toContain(identityAlert?.parentElement?.id);
  });

  it('uses stable item ownership for reorder, routes item operations and deactivates removed callbacks', () => {
    const schema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        rows: {
          type: 'array',
          title: 'Rows',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string', title: 'Name' },
              details: {
                type: 'object',
                title: 'Details',
                properties: {
                  role: { type: 'string', title: 'Role' },
                },
              },
            },
            required: ['id', 'name'],
          },
        },
      },
    };
    const uiSchema = {
      fields: {
        rows: {
          item: {
            presentation: [
              {
                kind: 'tabs',
                id: 'item-tabs',
                label: 'Item details',
                panels: [
                  {
                    kind: 'panel',
                    id: 'summary',
                    label: 'Summary',
                    children: ['name'],
                  },
                  {
                    kind: 'panel',
                    id: 'details',
                    label: 'Details',
                    children: ['details'],
                  },
                ],
              },
            ],
          },
        },
      },
    };
    const definition = compile(schema, uiSchema, [
      { path: ['rows'], itemIdentityProperty: 'id' },
    ]);
    const initial = {
      rows: [
        { id: 'alpha', name: 'Alpha', details: { role: 'Owner' } },
        { id: 'beta', name: 'Beta', details: { role: 'Reviewer' } },
      ],
    };
    const operations = vi.fn<(operation: FormOperation) => void>();
    const input = config(definition, schema, initial, operations);
    const { controller, handle } = ready(input);
    let mounts = 0;
    const retained = new Map<string, ReactFieldRendererProps>();
    const Renderer = (props: ReactFieldRendererProps) => {
      const [mount] = useState(() => ++mounts);
      const value =
        props.snapshot.presence.kind === 'value'
          ? String(props.snapshot.presence.value)
          : 'missing';
      retained.set(value, props);
      return <output data-value={value}>{`${value}:${mount}`}</output>;
    };
    const registryResult = createReactRendererRegistry([
      { id: 'stateful', component: Renderer, tester: () => 1 },
    ]);
    if (!registryResult.success) throw new Error('Registry failed.');

    render(
      <SchemaForm form={handle} rendererRegistry={registryResult.registry} />,
    );
    const alphaBefore = host.querySelector('[data-value="Alpha"]')?.textContent;
    const betaBefore = host.querySelector('[data-value="Beta"]')?.textContent;
    expect(alphaBefore).toBeDefined();
    expect(betaBefore).toBeDefined();
    expect(host.textContent).toContain('Owner');
    expect(host.textContent).toContain('Reviewer');
    const betaItem = host
      .querySelector('[data-value="Beta"]')
      ?.closest<HTMLElement>('[data-schema-item-key]');
    const betaDetailsTab = [
      ...(betaItem?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []),
    ].find((button) => button.textContent === 'Details');
    act(() => betaDetailsTab?.click());
    expect(betaDetailsTab?.getAttribute('aria-selected')).toBe('true');
    expect(retained.get('Alpha')?.setValue('Changed').success).toBe(true);
    const itemOperation = operations.mock.calls.at(-1)?.[0];
    expect(itemOperation?.type).toBe('set-item-value');
    if (itemOperation?.type !== 'set-item-value')
      throw new Error('Expected a stable item operation.');
    expect(itemOperation.target).toEqual({
      collectionPath: ['rows'],
      itemId: 'alpha',
      relativePath: ['name'],
    });
    const moveBetaEarlier = [
      ...host.querySelectorAll<HTMLButtonElement>('button'),
    ].find((button) => button.textContent === 'Move item 2 earlier');
    act(() => moveBetaEarlier?.click());
    expect(operations).toHaveBeenLastCalledWith(
      expect.objectContaining({
        type: 'move-item',
        itemId: 'beta',
        placement: { kind: 'before', itemId: 'alpha' },
      }),
    );
    const removeBeta = [
      ...host.querySelectorAll<HTMLButtonElement>('button'),
    ].find((button) => button.textContent === 'Remove item 2');
    act(() => removeBeta?.click());
    expect(operations).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: 'remove-item', itemId: 'beta' }),
    );

    controller.commit({
      ...input,
      value: { rows: [initial.rows[1]!, initial.rows[0]!] },
    });
    render(
      <SchemaForm
        form={controller.store.getSnapshot()}
        rendererRegistry={registryResult.registry}
      />,
    );
    expect(host.querySelector('[data-value="Beta"]')?.textContent).toBe(
      betaBefore,
    );
    expect(host.querySelector('[data-value="Alpha"]')?.textContent).toBe(
      alphaBefore,
    );
    expect(betaDetailsTab?.getAttribute('aria-selected')).toBe('true');

    const betaProps = retained.get('Beta');
    controller.commit({ ...input, value: { rows: [initial.rows[0]!] } });
    render(
      <SchemaForm
        form={controller.store.getSnapshot()}
        rendererRegistry={registryResult.registry}
      />,
    );
    expect(betaProps?.setValue('stale')).toMatchObject({
      success: false,
      diagnostics: [{ code: 'STALE_REACT_FORM_ACTION' }],
    });
  });

  it('unmounts inactive alternatives and restores them with fresh local state', () => {
    const schema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        pet: {
          type: 'object',
          title: 'Pet',
          properties: {
            kind: { type: 'string', enum: ['cat', 'dog'], title: 'Kind' },
            name: { type: 'string', title: 'Name' },
          },
          required: ['kind'],
          oneOf: [
            {
              type: 'object',
              properties: {
                kind: { type: 'string', const: 'cat' },
                lives: { type: 'integer', title: 'Lives' },
              },
              required: ['kind'],
            },
            {
              type: 'object',
              properties: {
                kind: { type: 'string', const: 'dog' },
                bark: { type: 'number', title: 'Bark' },
              },
              required: ['kind'],
            },
          ],
        },
      },
    };
    const definition = compile(schema);
    const cat = { pet: { kind: 'cat', name: 'Milo', lives: 9, bark: 2 } };
    const input = config(definition, schema, cat);
    const { controller, handle } = ready(input);
    let mounts = 0;
    let livesProps: ReactFieldRendererProps | undefined;
    const Renderer = (props: ReactFieldRendererProps) => {
      const [mount] = useState(() => ++mounts);
      if (props.field.name === 'lives') livesProps = props;
      return <output tabIndex={0}>{`${props.field.name}:${mount}`}</output>;
    };
    const registryResult = createReactRendererRegistry([
      { id: 'alternative', component: Renderer, tester: () => 1 },
    ]);
    if (!registryResult.success) throw new Error('Registry failed.');

    render(
      <SchemaForm form={handle} rendererRegistry={registryResult.registry} />,
    );
    const firstLivesText = [...host.querySelectorAll('output')].find((output) =>
      output.textContent?.startsWith('lives:'),
    )?.textContent;
    const livesOutput = [
      ...host.querySelectorAll<HTMLOutputElement>('output'),
    ].find((output) => output.textContent?.startsWith('lives:'));
    act(() => livesOutput?.focus());
    const staleLives = livesProps;
    controller.commit({
      ...input,
      value: { pet: { ...cat.pet, kind: 'dog' } },
    });
    render(
      <SchemaForm
        form={controller.store.getSnapshot()}
        rendererRegistry={registryResult.registry}
      />,
    );
    expect(host.textContent).not.toContain('lives:');
    expect(document.activeElement).not.toBe(livesOutput);
    expect(staleLives?.setValue(8).success).toBe(false);

    controller.commit(input);
    render(
      <SchemaForm
        form={controller.store.getSnapshot()}
        rendererRegistry={registryResult.registry}
      />,
    );
    const secondLivesText = [...host.querySelectorAll('output')].find(
      (output) => output.textContent?.startsWith('lives:'),
    )?.textContent;
    expect(secondLivesText).toBeDefined();
    expect(secondLivesText).not.toBe(firstLivesText);
  });

  it('consumes core visibility and enabled snapshots without evaluating conditions locally', () => {
    const schema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        show: { type: 'boolean', title: 'Show' },
        enable: { type: 'boolean', title: 'Enable' },
        target: { type: 'string', title: 'Target' },
      },
    };
    const uiSchema = {
      fields: {
        target: {
          visibleWhen: { path: ['show'], equals: true },
          enabledWhen: { path: ['enable'], equals: true },
        },
      },
    };
    const definition = compile(schema, uiSchema);
    const visible = { show: true, enable: true, target: 'value' };
    const input = config(definition, schema, visible);
    const { controller, handle } = ready(input);
    let targetProps: ReactFieldRendererProps | undefined;
    const Renderer = (props: ReactFieldRendererProps) => {
      if (props.field.name === 'target') targetProps = props;
      return <button type="button">{props.field.name}</button>;
    };
    const registryResult = createReactRendererRegistry([
      { id: 'condition', component: Renderer, tester: () => 1 },
    ]);
    if (!registryResult.success) throw new Error('Registry failed.');

    render(
      <SchemaForm form={handle} rendererRegistry={registryResult.registry} />,
    );
    const retained = targetProps;
    const initialTarget = [...host.querySelectorAll('button')].find(
      (button) => button.textContent === 'target',
    );
    act(() => initialTarget?.focus());
    controller.commit({ ...input, value: { ...visible, show: false } });
    render(
      <SchemaForm
        form={controller.store.getSnapshot()}
        rendererRegistry={registryResult.registry}
      />,
    );
    const target = [...host.querySelectorAll('button')].find(
      (button) => button.textContent === 'target',
    );
    expect(target?.closest('[hidden]')).not.toBeNull();
    expect(document.activeElement).not.toBe(target);
    expect(retained?.setValue('hidden').success).toBe(false);

    controller.commit({ ...input, value: { ...visible, enable: false } });
    render(
      <SchemaForm
        form={controller.store.getSnapshot()}
        rendererRegistry={registryResult.registry}
      />,
    );
    expect(targetProps?.snapshot.enabled).toBe(false);
    expect(target?.closest('[inert]')).not.toBeNull();
    expect(targetProps?.setValue('disabled').success).toBe(false);
  });
});

function setInput(input: HTMLInputElement | undefined, value: string): void {
  const descriptor = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  );
  if (input === undefined || descriptor?.set === undefined)
    throw new Error('Expected an input value setter.');
  descriptor.set.bind(input)(value);
  act(() => {
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
