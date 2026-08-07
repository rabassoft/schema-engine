// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import { referenceScenarios } from '@schema-engine-internal/reference-scenarios';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ReferenceApplication } from '../src/reference-application.js';

describe('independent React reference application', () => {
  let host: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
    act(() => root.render(<ReferenceApplication />));
  });

  afterEach(() => {
    act(() => root.unmount());
    host.remove();
  });

  it('selects and renders every neutral catalog scenario', () => {
    const select = scenarioSelect();
    for (const scenario of referenceScenarios) {
      act(() => setSelect(select, scenario.id));
      expect(select.value).toBe(scenario.id);
      expect(host.textContent).toContain(scenario.summary);
      expect(status()).toBe('Configuration compiled and runtime ready.');
      expect(host.querySelector('[data-testid="form-preview"]')).not.toBeNull();
    }
  });

  it('confirms, rejects and explicitly resolves pending operations', () => {
    const name = inputByLabel('Name');
    setInput(name, 'Grace');
    expect(stateEvidence()).toContain('Grace');

    click('Reset scenario');
    expect(inputByLabel('Name').value).toBe('Ada');
    click('Reject');
    setInput(inputByLabel('Name'), 'Rejected');
    expect(stateEvidence()).not.toContain('Rejected');

    click('Pending');
    setInput(inputByLabel('Name'), 'Pending name');
    expect(host.textContent).toContain('Pending operations');
    const pendingConfirmation = host.querySelector<HTMLButtonElement>(
      '.pending-decisions button',
    );
    if (pendingConfirmation === null)
      throw new Error('Expected pending confirmation.');
    act(() => pendingConfirmation.click());
    expect(stateEvidence()).toContain('Pending name');
  });

  it('switches theme and exposes editable schema controls and snippets', () => {
    const theme = host.querySelector<HTMLSelectElement>('[aria-label="Theme"]');
    if (theme === null) throw new Error('Expected theme selector.');
    act(() => setSelect(theme, 'dark'));
    expect(document.documentElement.dataset['theme']).toBe('dark');
    expect(host.querySelector('[aria-label="Schema JSON"]')).not.toBeNull();
    expect(
      Array.from(
        host.querySelectorAll('.schema-actions > button'),
        ({ textContent }) => textContent?.trim(),
      ).slice(0, 4),
    ).toEqual(['Validate', 'Apply', 'Cancel edits', 'Restore original']);
    click('UI Schema');
    expect(host.querySelector('[aria-label="UI Schema JSON"]')).not.toBeNull();
    const uiSchemaTab = host.querySelector<HTMLButtonElement>(
      '[role="tab"][aria-selected="true"]',
    );
    act(() => {
      uiSchemaTab?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }),
      );
    });
    expect(document.activeElement?.textContent).toBe('Schema');
    expect(host.querySelector('[aria-label="Schema JSON"]')).not.toBeNull();
    click('Validate');
    expect(
      host.querySelector('[data-testid="draft-status"]')?.textContent,
    ).toContain('valid');
    click('Operation decision');
    expect(host.textContent).toContain('Applies a strict requested operation');
  });

  it('keeps the first projected control labelled inside the spaced form layout', () => {
    const preview = host.querySelector<HTMLElement>(
      '[data-testid="form-preview"]',
    );
    const firstInput = preview?.querySelector<HTMLInputElement>(
      'input:not([type="checkbox"])',
    );
    const firstLabel =
      firstInput?.id === undefined
        ? null
        : preview?.querySelector<HTMLLabelElement>(
            `label[for="${firstInput.id}"]`,
          );

    expect(firstLabel?.textContent).toBe('Name');
    expect(host.querySelector('.scenario-navigation #react-scenario')).not.toBe(
      null,
    );
    expect(host.querySelector('.schema-workspace .json-editor')).not.toBeNull();
  });

  it('drops stale async-service evidence when a scenario epoch is replaced', () => {
    act(() => setSelect(scenarioSelect(), 'service-validation'));
    click('Service');
    expect(stateEvidence()).toContain('pending');
    act(() => setSelect(scenarioSelect(), 'controlled-primitives'));
    expect(stateEvidence()).not.toContain('pending');
  });

  function scenarioSelect(): HTMLSelectElement {
    const select = host.querySelector<HTMLSelectElement>('#react-scenario');
    if (select === null) throw new Error('Expected scenario selector.');
    return select;
  }

  function status(): string | null | undefined {
    return host.querySelector('[data-testid="compile-status"]')?.textContent;
  }

  function inputByLabel(label: string): HTMLInputElement {
    const labels = [...host.querySelectorAll<HTMLLabelElement>('label')];
    const candidate = labels.find((entry) =>
      entry.textContent?.startsWith(label),
    );
    const input =
      candidate?.querySelector<HTMLInputElement>('input') ??
      (candidate?.htmlFor === ''
        ? null
        : host.querySelector<HTMLInputElement>(`#${candidate?.htmlFor}`));
    if (input === undefined || input === null)
      throw new Error(`Expected input labelled ${label}.`);
    return input;
  }

  function click(label: string): void {
    const button = [...host.querySelectorAll<HTMLButtonElement>('button')].find(
      (candidate) => candidate.textContent === label,
    );
    if (button === undefined) throw new Error(`Expected button ${label}.`);
    act(() => button.click());
  }

  function stateEvidence(): string {
    return (
      host.querySelector('[data-testid="evidence-panel"]')?.textContent ?? ''
    );
  }
});

function setSelect(select: HTMLSelectElement, value: string): void {
  const descriptor = Object.getOwnPropertyDescriptor(
    HTMLSelectElement.prototype,
    'value',
  );
  if (descriptor?.set === undefined) throw new Error('Expected select setter.');
  descriptor.set.bind(select)(value);
  select.dispatchEvent(new Event('change', { bubbles: true }));
}

function setInput(input: HTMLInputElement, value: string): void {
  const descriptor = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  );
  if (descriptor?.set === undefined) throw new Error('Expected input setter.');
  descriptor.set.bind(input)(value);
  act(() => {
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
