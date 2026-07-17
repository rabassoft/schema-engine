// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import { afterEach, describe, expect, it, vi } from 'vitest';
import { referenceScenarios } from '@schema-engine-internal/reference-scenarios';

import { StandardDomRenderer } from '../src/dom-renderer.js';
import { StandardReferenceApplication } from '../src/reference-application.js';

const disposals: Array<() => void> = [];

afterEach(() => {
  for (const dispose of disposals.splice(0)) dispose();
  document.body.replaceChildren();
});

describe('StandardDomRenderer', () => {
  it('builds labelled normalized controls once and reconciles confirmed values', () => {
    const harness = mount();
    const name = fieldControl(harness.host, 'name');
    const sameName = name;

    expect(name.getAttribute('required')).not.toBeNull();
    expect(
      harness.host.querySelector(`label[for="${name.id}"]`)?.textContent,
    ).toBe('Name');
    name.value = 'Grace';
    name.dispatchEvent(new Event('input', { bubbles: true }));

    expect(harness.application.getState().value).toMatchObject({
      name: 'Grace',
    });
    expect(fieldControl(harness.host, 'name')).toBe(sameName);
    expect(name.value).toBe('Grace');
    expect(harness.application.getState().history).toHaveLength(1);
    expect(
      [...field(harness.host, 'name').querySelectorAll('button')].find(
        ({ textContent }) => textContent === 'Clear',
      )?.hidden,
    ).toBe(false);

    const role = field(harness.host, 'role').querySelector('select');
    if (role === null) throw new Error('Expected role select.');
    role.value = 'viewer';
    role.dispatchEvent(new Event('change', { bubbles: true }));
    expect(harness.application.getState().value).toMatchObject({
      role: 'viewer',
    });
  });

  it('reconciles string rejection without emitting during rendering', () => {
    const harness = mount();
    harness.application.setDecisionMode('reject');
    const name = fieldControl(harness.host, 'name');
    const historyBefore = harness.application.getState().history.length;
    harness.renderer.reconcile(requiredSnapshot(harness.application));
    expect(harness.application.getState().history).toHaveLength(historyBefore);

    name.value = 'Rejected';
    name.dispatchEvent(new Event('input', { bubbles: true }));
    expect(name.value).toBe('Ada');
    expect(harness.application.getState().value).toMatchObject({ name: 'Ada' });
    expect(harness.application.getState().history[0]?.decision).toBe(
      'rejected',
    );
  });

  it('preserves an incomplete numeric buffer while focused and restores it on blur', () => {
    const harness = mount();
    const age = fieldControl(harness.host, 'age');
    age.dispatchEvent(new Event('focus'));
    age.value = '-';
    age.dispatchEvent(new Event('input', { bubbles: true }));

    expect(age.value).toBe('-');
    expect(harness.application.getState().value).toMatchObject({ age: 37 });
    expect(harness.application.getState().history).toEqual([]);

    age.value = '1.';
    age.dispatchEvent(new Event('input', { bubbles: true }));
    expect(age.value).toBe('1.');
    expect(harness.application.getState().history).toEqual([]);

    age.dispatchEvent(new Event('blur'));
    expect(age.value).toBe('37');
    expect(
      harness.application
        .getState()
        .snapshot?.fields.find(
          ({ path }) => path.length === 1 && path[0] === 'age',
        )?.touched,
    ).toBe(true);
  });

  it('restores rejected numbers on blur and parses the selected locale', () => {
    const harness = mount();
    harness.application.setDecisionMode('reject');
    const age = fieldControl(harness.host, 'age');
    age.dispatchEvent(new Event('focus'));
    age.value = '40';
    age.dispatchEvent(new Event('input', { bubbles: true }));
    expect(age.value).toBe('40');
    age.dispatchEvent(new Event('blur'));
    expect(age.value).toBe('37');

    harness.application.setDecisionMode('confirm');
    harness.application.setLocale('es');
    const score = fieldControl(harness.host, 'score');
    expect(score.value).toBe('9,5');
    score.dispatchEvent(new Event('focus'));
    score.value = '8,5';
    score.dispatchEvent(new Event('input', { bubbles: true }));
    expect(harness.application.getState().value).toMatchObject({ score: 8.5 });
  });

  it('renders validation semantics and described issue text', () => {
    const harness = mount();
    harness.application.setValidationVisibility('all');
    const name = fieldControl(harness.host, 'name');
    name.value = '';
    name.dispatchEvent(new Event('input', { bubbles: true }));

    expect(name.getAttribute('aria-invalid')).toBe('true');
    const describedBy = name.getAttribute('aria-describedby')?.split(' ') ?? [];
    expect(describedBy.length).toBeGreaterThan(0);
    expect(
      harness.host.querySelector('.field-issues:not([hidden])')?.textContent,
    ).toContain('minLength');
  });

  it('renders nested fieldsets and static presentation sections from normalized definitions', () => {
    const nested = mount('nested-profile');
    expect(
      [...nested.host.querySelectorAll('legend')].map(
        ({ textContent }) => textContent,
      ),
    ).toEqual(['User profile', 'Postal address']);

    nested.dispose();
    const sections = mount('presentation-sections');
    expect(
      [...sections.host.querySelectorAll('.form-section > h2')].map(
        ({ textContent }) => textContent,
      ),
    ).toEqual(['Identity', 'Contact preferences']);
  });

  it('keeps null, missing, false and zero visibly distinct', () => {
    const harness = mount('nullable-preferences');
    expect(field(harness.host, 'nickname').querySelector('output')?.value).toBe(
      'Null',
    );
    expect(
      field(harness.host, 'notifications').querySelector('output')?.value,
    ).toBe('False');
    expect(field(harness.host, 'volume').querySelector('output')?.value).toBe(
      'Value present',
    );

    clickButton(field(harness.host, 'volume'), 'Clear');
    expect(field(harness.host, 'volume').querySelector('output')?.value).toBe(
      'Missing',
    );
    clickButton(field(harness.host, 'notifications'), 'Set null');
    expect(
      field(harness.host, 'notifications').querySelector('output')?.value,
    ).toBe('Null');
    clickButton(field(harness.host, 'notifications'), 'Clear');
    expect(
      field(harness.host, 'notifications').querySelector('output')?.value,
    ).toBe('Missing');

    const volume = fieldControl(harness.host, 'volume');
    volume.value = '0';
    volume.dispatchEvent(new Event('input', { bubbles: true }));
    expect(field(harness.host, 'volume').querySelector('output')?.value).toBe(
      'Zero',
    );
    const nickname = fieldControl(harness.host, 'nickname');
    nickname.value = '';
    nickname.dispatchEvent(new Event('input', { bubbles: true }));
    expect(field(harness.host, 'nickname').querySelector('output')?.value).toBe(
      'Empty string',
    );
  });

  it('removes every field listener idempotently on disposal', () => {
    const harness = mount();
    const name = fieldControl(harness.host, 'name');
    harness.dispose();
    harness.dispose();
    name.value = 'Ignored';
    name.dispatchEvent(new Event('input', { bubbles: true }));

    expect(harness.application.getState().value).toMatchObject({ name: 'Ada' });
    expect(harness.application.getState().history).toEqual([]);
  });

  it('reconciles collection items by stable identity through Public intentions', () => {
    const harness = mount('stable-team');
    const ada = item(harness.host, 'ada');
    const adaName = fieldControl(ada, 'name');
    adaName.value = 'Ada Lovelace';
    adaName.dispatchEvent(new Event('input', { bubbles: true }));
    expect(item(harness.host, 'ada')).toBe(ada);
    expect(readTeam(harness.application)[0]).toMatchObject({
      id: 'ada',
      name: 'Ada Lovelace',
    });

    labelledControl(harness.host, 'New item id').value = 'linus';
    labelledControl(harness.host, 'New name').value = 'Linus';
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');
    clickButton(harness.host, 'Add item');
    const linus = item(harness.host, 'linus');
    expect(focus).toHaveBeenCalled();
    focus.mockRestore();
    expect(readTeam(harness.application).at(-1)).toEqual({
      id: 'linus',
      name: 'Linus',
    });

    clickButton(linus, 'Move earlier');
    clickButton(linus, 'Move earlier');
    expect(readTeam(harness.application).map(({ id }) => id)).toEqual([
      'linus',
      'ada',
      'grace',
    ]);
    expect(item(harness.host, 'linus')).toBe(linus);

    const grace = item(harness.host, 'grace');
    const removedInput = fieldControl(grace, 'name');
    const removeFocus = vi.spyOn(HTMLElement.prototype, 'focus');
    clickButton(grace, 'Remove item');
    expect(removeFocus).toHaveBeenCalled();
    removeFocus.mockRestore();
    const historyLength = harness.application.getState().history.length;
    removedInput.value = 'Ignored';
    removedInput.dispatchEvent(new Event('input', { bubbles: true }));
    expect(readTeam(harness.application).map(({ id }) => id)).toEqual([
      'linus',
      'ada',
    ]);
    expect(harness.application.getState().history).toHaveLength(historyLength);
  });

  it('records a stale pending item edit against the then-current complete root', () => {
    const harness = mount('stable-team');
    harness.application.setDecisionMode('pending');
    const name = fieldControl(item(harness.host, 'ada'), 'name');
    name.value = 'Pending Ada';
    name.dispatchEvent(new Event('input', { bubbles: true }));
    const pending = harness.application.getState().pendingOperations[0];
    if (pending === undefined) throw new Error('Expected pending item edit.');
    const team = readTeam(harness.application).map((member) =>
      member.id === 'ada' ? { ...member, name: 'External Ada' } : member,
    );
    harness.application.replaceValue({ team });
    harness.application.confirmPending(pending.sequence);

    expect(readTeam(harness.application)[0]?.name).toBe('External Ada');
    expect(harness.application.getState().history[0]?.decision).toBe('stale');
  });

  it('records incompatible pending collection operations without replacing the root', () => {
    const harness = mount('stable-team');
    harness.application.setDecisionMode('pending');
    clickButton(item(harness.host, 'grace'), 'Remove item');
    const pending = harness.application.getState().pendingOperations[0];
    if (pending === undefined) throw new Error('Expected pending removal.');
    harness.application.replaceValue({ team: 'blocked' });
    harness.application.confirmPending(pending.sequence);

    expect(harness.application.getState().value).toEqual({ team: 'blocked' });
    expect(harness.application.getState().history[0]?.decision).toBe(
      'incompatible',
    );
  });

  it.each(referenceScenarios)(
    'mounts the complete normalized $id scenario without target-specific semantics',
    ({ id }) => {
      const harness = mount(id);
      expect(
        harness.host.querySelector(
          'input, select, fieldset, .form-section, .collection-group',
        ),
      ).not.toBeNull();
    },
  );
});

function mount(initialScenarioId?: string): {
  readonly application: StandardReferenceApplication;
  readonly host: HTMLElement;
  readonly renderer: StandardDomRenderer;
  readonly dispose: () => void;
} {
  const application = new StandardReferenceApplication(
    undefined,
    initialScenarioId,
  );
  const definition = application.getState().definition;
  const runtime = application.getRuntime();
  if (definition === undefined || runtime === undefined)
    throw new Error('Expected a renderable scenario.');
  const host = document.createElement('main');
  document.body.append(host);
  const renderer = new StandardDomRenderer(host, definition, runtime);
  const unsubscribe = application.subscribeState((state) => {
    if (state.snapshot !== undefined) renderer.reconcile(state.snapshot);
  });
  let active = true;
  const dispose = (): void => {
    if (!active) return;
    active = false;
    unsubscribe();
    renderer.dispose();
    application.dispose();
  };
  disposals.push(dispose);
  return { application, host, renderer, dispose };
}

function field(host: HTMLElement, key: string): HTMLElement {
  const element = host.querySelector<HTMLElement>(`[data-field-name="${key}"]`);
  if (element === null) throw new Error(`Expected field ${key}.`);
  return element;
}

function item(host: HTMLElement, itemId: string): HTMLElement {
  const element = host.querySelector<HTMLElement>(`[data-item-id="${itemId}"]`);
  if (element === null) throw new Error(`Expected item ${itemId}.`);
  return element;
}

function fieldControl(host: HTMLElement, key: string): HTMLInputElement {
  const control = field(host, key).querySelector('input');
  if (control === null) throw new Error(`Expected input ${key}.`);
  return control;
}

function requiredSnapshot(application: StandardReferenceApplication) {
  const snapshot = application.getState().snapshot;
  if (snapshot === undefined) throw new Error('Expected a snapshot.');
  return snapshot;
}

function clickButton(container: HTMLElement, label: string): void {
  const target = [...container.querySelectorAll('button')].find(
    ({ textContent }) => textContent === label,
  );
  if (target === undefined) throw new Error(`Expected button ${label}.`);
  target.click();
}

function labelledControl(host: HTMLElement, label: string): HTMLInputElement {
  const target = [...host.querySelectorAll('label')].find(
    ({ textContent }) => textContent === label,
  );
  const control = target?.htmlFor
    ? host.querySelector<HTMLInputElement>(`#${target.htmlFor}`)
    : null;
  if (control === null || control === undefined) {
    throw new Error(`Expected labelled control ${label}.`);
  }
  return control;
}

function readTeam(application: StandardReferenceApplication): Array<{
  readonly id: string;
  readonly name: string;
  readonly role: string;
}> {
  return (
    application.getState().value as {
      readonly team: Array<{
        readonly id: string;
        readonly name: string;
        readonly role: string;
      }>;
    }
  ).team;
}
