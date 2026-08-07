// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import {
  compileFormDefinition,
  type AsyncSchemaValidator,
  type FormOperation,
  type FormScope,
  type SchemaValidator,
  type ValidationResult,
  type WizardIntention,
} from '@rabassoft/schema-engine';
import { act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createReactNativeRendererRegistry,
  SchemaForm,
  type ReactControlledFormConfig,
  type ReactRendererRegistry,
} from '../src/index.js';
import { ReactFormController } from '../src/internal/controller.js';

const validValidator: SchemaValidator = Object.freeze({
  validate: () => Object.freeze({ valid: true, issues: Object.freeze([]) }),
});

interface ValidationValue {
  readonly name: string;
  readonly review?: string;
}

function nativeRegistry(): ReactRendererRegistry {
  const result = createReactNativeRendererRegistry();
  if (!result.success) throw new Error('Native registry was unavailable.');
  return result.registry;
}

describe('React neutral validation and controlled wizard projection', () => {
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

  it('keeps every step mounted and delegates only controlled navigation intentions', () => {
    const schema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        name: { type: 'string', title: 'Name' },
        team: { type: 'string', title: 'Team' },
        review: { type: 'string', title: 'Review' },
      },
      required: ['name', 'team', 'review'],
    };
    const uiSchema = {
      presentation: [
        {
          kind: 'wizard',
          id: 'setup',
          label: 'Setup',
          steps: [
            {
              kind: 'wizard-step',
              id: 'identity',
              label: 'Identity',
              children: ['name'],
            },
            {
              kind: 'wizard-step',
              id: 'team',
              label: 'Team step',
              children: [
                {
                  kind: 'tabs',
                  id: 'team-tabs',
                  label: 'Team tabs',
                  panels: [
                    {
                      kind: 'panel',
                      id: 'team-panel',
                      label: 'Team panel',
                      children: ['team'],
                    },
                  ],
                },
              ],
            },
            {
              kind: 'wizard-step',
              id: 'review',
              label: 'Review step',
              children: ['review'],
            },
          ],
        },
      ],
    };
    const compiled = compileFormDefinition({ schema, uiSchema });
    if (!compiled.success) throw new Error('Wizard fixture did not compile.');
    const value = { name: 'Ada', team: 'Core', review: 'Ready' };
    const intentions = vi.fn<(intention: WizardIntention) => void>();
    const operations = vi.fn<(operation: FormOperation) => void>();
    const resolver = vi.fn((text: string) => text);
    const input: ReactControlledFormConfig<typeof value> = {
      formId: 'wizard',
      definition: compiled.definition,
      schema,
      validator: validValidator,
      value,
      baselineValue: value,
      locale: 'en',
      wizardState: { selectedStepId: 'identity' },
      onOperation: operations,
      onWizardIntention: intentions,
      textResolver: Object.freeze({ resolve: resolver }),
    };
    const controller = new ReactFormController<typeof value>();
    controller.commit(input);
    const registry = nativeRegistry();
    const renderLatest = () =>
      render(
        <SchemaForm
          form={controller.store.getSnapshot()}
          rendererRegistry={registry}
        />,
      );

    renderLatest();
    expect(host.querySelectorAll('ol > li')).toHaveLength(3);
    expect(host.querySelector('ol button')).toBeNull();
    expect(host.querySelectorAll('section[role="region"]')).toHaveLength(3);
    expect(currentStepHeading()?.textContent).toBe('Identity');
    expect(
      [...host.querySelectorAll<HTMLInputElement>('input')].map(
        (input) => input.value,
      ),
    ).toEqual(['Ada', 'Core', 'Ready']);
    expect(host.textContent).toContain('Step 1 of 3IdentityVisited');
    expect(host.textContent).toContain('Step 2 of 3Team stepNot visited');
    const initialSources = resolver.mock.calls.map(([source]) => source);
    expect(initialSources.indexOf('Step 3 of 3')).toBeLessThan(
      initialSources.indexOf('Name'),
    );
    expect(initialSources.indexOf('Name')).toBeLessThan(
      initialSources.indexOf('Previous'),
    );
    const initialResolutionCount = resolver.mock.calls.length;
    const nameInput = host.querySelector<HTMLInputElement>('input');
    act(() => nameInput?.focus());
    expect(document.activeElement).toBe(nameInput);

    click('Next');
    renderLatest();
    expect(intentions).toHaveBeenCalledOnce();
    const next = intentions.mock.calls[0]?.[0];
    expect(next).toMatchObject({
      kind: 'next',
      fromStepId: 'identity',
      toStepId: 'team',
    });
    expect(currentStepHeading()?.textContent).toBe('Identity');
    expect(button('Next')?.disabled).toBe(true);
    if (next === undefined || next.kind !== 'next')
      throw new Error('Expected next intention.');
    act(() => {
      controller.store.getSnapshot().actions.confirmWizardSelection({
        requestId: next.requestId,
        selectedStepId: next.toStepId,
      });
    });
    renderLatest();
    expect(currentStepHeading()?.textContent).toBe('Team step');
    expect(document.activeElement).toBe(currentStepHeading());

    const teamInput = [
      ...host.querySelectorAll<HTMLInputElement>('input'),
    ].find((input) => input.value === 'Core');
    setInput(teamInput, 'Draft team');
    expect(operations).toHaveBeenCalledOnce();
    click('Previous');
    renderLatest();
    const previous = intentions.mock.calls.at(-1)?.[0];
    if (previous === undefined || previous.kind !== 'previous')
      throw new Error('Expected previous intention.');
    act(() => {
      controller.store.getSnapshot().actions.confirmWizardSelection({
        requestId: previous.requestId,
        selectedStepId: previous.toStepId,
      });
    });
    renderLatest();
    expect(currentStepHeading()?.textContent).toBe('Identity');
    expect(document.activeElement).toBe(currentStepHeading());
    expect(teamInput?.value).toBe('Draft team');
    expect(teamInput?.closest('[hidden]')).not.toBeNull();
    setInput(teamInput, 'Hidden draft');
    expect(operations).toHaveBeenCalledOnce();

    click('Next');
    renderLatest();
    const rejected = intentions.mock.calls.at(-1)?.[0];
    if (rejected === undefined || rejected.kind !== 'next')
      throw new Error('Expected a second next intention.');
    act(() => {
      controller.store
        .getSnapshot()
        .actions.rejectWizardIntention(rejected.requestId);
    });
    renderLatest();
    expect(currentStepHeading()?.textContent).toBe('Identity');
    expect(button('Next')?.disabled).toBe(false);

    click('Next');
    renderLatest();
    const team = intentions.mock.calls.at(-1)?.[0];
    if (team === undefined || team.kind !== 'next')
      throw new Error('Expected the confirmed team intention.');
    act(() => {
      controller.store.getSnapshot().actions.confirmWizardSelection({
        requestId: team.requestId,
        selectedStepId: team.toStepId,
      });
    });
    renderLatest();
    expect(currentStepHeading()?.textContent).toBe('Team step');
    expect(teamInput?.value).toBe('Hidden draft');

    click('Next');
    renderLatest();
    const review = intentions.mock.calls.at(-1)?.[0];
    if (review === undefined || review.kind !== 'next')
      throw new Error('Expected review intention.');
    act(() => {
      controller.store.getSnapshot().actions.confirmWizardSelection({
        requestId: review.requestId,
        selectedStepId: review.toStepId,
      });
    });
    renderLatest();
    expect(currentStepHeading()?.textContent).toBe('Review step');
    click('Complete');
    renderLatest();
    expect(intentions.mock.calls.at(-1)?.[0]).toMatchObject({
      kind: 'complete',
      stepId: 'review',
    });
    expect(currentStepHeading()?.textContent).toBe('Review step');
    expect(button('Complete')?.disabled).toBe(false);
    expect(resolver.mock.calls.length).toBeGreaterThanOrEqual(
      initialResolutionCount,
    );

    function currentStepHeading(): HTMLHeadingElement | undefined {
      return [...host.querySelectorAll<HTMLHeadingElement>('h3')].find(
        (heading) => heading.closest('section')?.hidden === false,
      );
    }

    function button(label: string): HTMLButtonElement | undefined {
      return [...host.querySelectorAll<HTMLButtonElement>('button')].find(
        (candidate) => candidate.textContent === label,
      );
    }

    function click(label: string): void {
      act(() => button(label)?.click());
    }
  });

  it('reads/reveals scoped validation and accepts external baseline confirmation without mutation', () => {
    const schema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: { name: { type: 'string', title: 'Name' } },
    };
    const compiled = compileFormDefinition({ schema });
    if (!compiled.success)
      throw new Error('Validation fixture did not compile.');
    const value: Readonly<ValidationValue> = Object.freeze({ name: 'Ada' });
    const baseline: Readonly<ValidationValue> = Object.freeze({
      name: 'Grace',
    });
    const operations = vi.fn<(operation: FormOperation) => void>();
    const validator: SchemaValidator = Object.freeze({
      validate: () =>
        Object.freeze({
          valid: false,
          issues: Object.freeze([
            Object.freeze({
              code: 'name-invalid',
              path: Object.freeze(['name']),
              fallbackMessage: 'Name is invalid.',
              parameters: Object.freeze({}),
            }),
          ]),
        }),
    });
    const input: ReactControlledFormConfig<ValidationValue> = {
      formId: 'validation',
      definition: compiled.definition,
      schema,
      validator,
      value,
      baselineValue: baseline,
      locale: 'en',
      validationVisibility: 'touched',
      onOperation: operations,
      onWizardIntention: vi.fn(),
    };
    const controller = new ReactFormController<ValidationValue>();
    controller.commit(input);
    const initial = controller.store.getSnapshot();
    if (initial.state.status !== 'ready')
      throw new Error('Expected ready form.');
    const initialValue = initial.state.snapshot.value;
    const scope: FormScope = Object.freeze({
      id: 'name-scope',
      paths: Object.freeze([Object.freeze(['name'])]),
    });

    expect(initial.actions.getValidationSnapshot(scope)).toMatchObject({
      success: true,
      value: { valid: false, issues: [{ code: 'name-invalid' }] },
    });
    expect(initial.actions.showValidationErrors(scope).success).toBe(true);
    const revealed = controller.store.getSnapshot();
    if (revealed.state.status !== 'ready')
      throw new Error('Expected ready form.');
    expect(revealed.state.snapshot.value).toBe(initialValue);
    expect(revealed.state.snapshot.fields[0]?.showIssues).toBe(true);
    expect(operations).not.toHaveBeenCalled();

    render(<SchemaForm form={revealed} rendererRegistry={nativeRegistry()} />);
    expect(host.textContent).toContain('Name is invalid.');
    expect(host.querySelector('input')?.getAttribute('aria-invalid')).toBe(
      'true',
    );

    expect(revealed.actions.hideValidationErrors(scope.id).success).toBe(true);
    expect(readyField().showIssues).toBe(false);
    expect(revealed.actions.setValidationVisibility('all').success).toBe(true);
    expect(readyField().showIssues).toBe(true);
    expect(operations).not.toHaveBeenCalled();

    controller.commit({ ...input, baselineValue: value });
    const confirmed = controller.store.getSnapshot();
    if (confirmed.state.status !== 'ready')
      throw new Error('Expected ready form.');
    expect(confirmed.state.snapshot.value).toBe(initialValue);
    expect(confirmed.state.snapshot.dirty).toBe(false);
    expect(operations).not.toHaveBeenCalled();

    function readyField() {
      const handle = controller.store.getSnapshot();
      if (handle.state.status !== 'ready')
        throw new Error('Expected ready validation form.');
      const field = handle.state.snapshot.fields[0];
      if (field === undefined) throw new Error('Expected validation field.');
      return field;
    }
  });

  it('renders completion gating and global issues without emitting an intention', () => {
    const schema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        name: { type: 'string', title: 'Name' },
        review: { type: 'string', title: 'Review' },
      },
    };
    const uiSchema = {
      presentation: [
        {
          kind: 'wizard',
          id: 'completion',
          label: 'Completion',
          steps: [
            {
              kind: 'wizard-step',
              id: 'identity',
              label: 'Identity',
              children: ['name'],
            },
            {
              kind: 'wizard-step',
              id: 'review',
              label: 'Review',
              children: ['review'],
            },
          ],
        },
      ],
    };
    const compiled = compileFormDefinition({ schema, uiSchema });
    if (!compiled.success)
      throw new Error('Completion fixture did not compile.');
    const value: Readonly<ValidationValue> = Object.freeze({
      name: 'Ada',
      review: 'Ready',
    });
    const intentions = vi.fn<(intention: WizardIntention) => void>();
    const controller = new ReactFormController<ValidationValue>();
    controller.commit({
      formId: 'completion',
      definition: compiled.definition,
      schema,
      validator: Object.freeze({
        validate: () =>
          Object.freeze({
            valid: false,
            issues: Object.freeze([
              Object.freeze({
                code: 'form-incomplete',
                path: Object.freeze([]),
                parameters: Object.freeze({}),
              }),
            ]),
          }),
      }),
      value,
      baselineValue: value,
      locale: 'en',
      wizardState: { selectedStepId: 'identity' },
      onOperation: vi.fn(),
      onWizardIntention: intentions,
    });
    const renderLatest = () =>
      render(
        <SchemaForm
          form={controller.store.getSnapshot()}
          rendererRegistry={nativeRegistry()}
        />,
      );

    controller.store.getSnapshot().actions.requestWizardNext();
    const next = intentions.mock.calls.at(-1)?.[0];
    if (next === undefined || next.kind !== 'next')
      throw new Error('Expected completion setup intention.');
    controller.store.getSnapshot().actions.confirmWizardSelection({
      requestId: next.requestId,
      selectedStepId: next.toStepId,
    });
    intentions.mockClear();
    renderLatest();
    act(() => {
      [...host.querySelectorAll<HTMLButtonElement>('button')]
        .find((candidate) => candidate.textContent === 'Complete')
        ?.click();
    });
    renderLatest();
    expect(intentions).not.toHaveBeenCalled();
    expect(host.querySelector('[role="alert"]')?.textContent).toBe(
      'form-incomplete',
    );
    expect(host.textContent).toContain('IdentityCompleted');
    expect(host.textContent).toContain('ReviewVisited');
    const snapshot = controller.store.getSnapshot();
    if (snapshot.state.status !== 'ready')
      throw new Error('Expected ready completion form.');
    expect(snapshot.state.snapshot.wizard?.selectedStepId).toBe('review');
  });

  it('observes async technical state and retries only through the facade action', async () => {
    const schema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        name: { type: 'string', title: 'Name' },
        review: { type: 'string', title: 'Review' },
      },
    };
    const uiSchema = {
      presentation: [
        {
          kind: 'wizard',
          id: 'validation-wizard',
          label: 'Validation wizard',
          steps: [
            {
              kind: 'wizard-step',
              id: 'identity',
              label: 'Identity',
              children: ['name'],
            },
            {
              kind: 'wizard-step',
              id: 'review',
              label: 'Review',
              children: ['review'],
            },
          ],
        },
      ],
    };
    const compiled = compileFormDefinition({ schema, uiSchema });
    if (!compiled.success) throw new Error('Async fixture did not compile.');
    const attempts: Array<{
      readonly resolve: (result: ValidationResult) => void;
      readonly reject: (reason: unknown) => void;
    }> = [];
    const validate = vi.fn<AsyncSchemaValidator['validate']>(
      () =>
        new Promise<ValidationResult>((resolve, reject) => {
          attempts.push(Object.freeze({ resolve, reject }));
        }),
    );
    const value: Readonly<ValidationValue> = Object.freeze({
      name: 'Ada',
      review: 'Ready',
    });
    const controller = new ReactFormController<ValidationValue>();
    controller.commit({
      formId: 'async-validation',
      definition: compiled.definition,
      schema,
      validator: validValidator,
      asyncValidator: Object.freeze({ validate }),
      value,
      baselineValue: value,
      locale: 'en',
      wizardState: { selectedStepId: 'identity' },
      onOperation: vi.fn(),
      onWizardIntention: vi.fn(),
    });
    const renderLatest = () =>
      render(
        <SchemaForm
          form={controller.store.getSnapshot()}
          rendererRegistry={nativeRegistry()}
        />,
      );

    expect(readySnapshot().asyncValidation).toEqual({
      status: 'pending',
      generation: 1,
    });
    renderLatest();
    renderLatest();
    expect(host.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(host.textContent).toContain('Additional validation in progress');
    expect(validate).toHaveBeenCalledOnce();

    attempts[0]?.reject(new Error('offline'));
    await act(async () => flushAsync());
    expect(readySnapshot().asyncValidation).toMatchObject({
      status: 'failed',
      generation: 1,
      reason: 'exception',
    });
    renderLatest();
    expect(host.textContent).toContain('Additional validation failed');
    expect(validate).toHaveBeenCalledOnce();

    expect(
      controller.store.getSnapshot().actions.retryAsyncValidation(),
    ).toMatchObject({
      success: true,
      effects: { snapshotChanged: true },
    });
    expect(validate).toHaveBeenCalledTimes(2);
    expect(readySnapshot().asyncValidation).toEqual({
      status: 'pending',
      generation: 2,
    });
    renderLatest();
    expect(host.textContent).toContain('Additional validation in progress');
    attempts[1]?.resolve({
      valid: false,
      issues: [
        {
          code: 'name-taken',
          path: ['name'],
          fallbackMessage: 'Name is already taken.',
          parameters: {},
        },
      ],
    });
    await act(async () => flushAsync());
    expect(readySnapshot().asyncValidation).toEqual({
      status: 'settled',
      generation: 2,
      valid: false,
    });
    expect(validate).toHaveBeenCalledTimes(2);
    renderLatest();
    expect(host.textContent).not.toContain('Name is already taken.');
    expect(
      controller.store.getSnapshot().actions.setValidationVisibility('all')
        .success,
    ).toBe(true);
    renderLatest();
    expect(host.textContent).toContain('Name is already taken.');
    expect(host.querySelector('input')?.getAttribute('aria-invalid')).toBe(
      'true',
    );
    expect(validate).toHaveBeenCalledTimes(2);

    function readySnapshot() {
      const handle = controller.store.getSnapshot();
      if (handle.state.status !== 'ready')
        throw new Error('Expected ready async form.');
      return handle.state.snapshot;
    }
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

async function flushAsync(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}
