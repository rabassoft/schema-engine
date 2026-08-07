// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import type {
  BooleanFieldDefinition,
  FieldRuntimeSnapshot,
  NumberFieldDefinition,
  RuntimeActionResult,
  StringEnumArrayFieldDefinition,
  StringFieldDefinition,
} from '@rabassoft/schema-engine';
import { act, createElement, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  ReactFieldRendererProps,
  ReactFieldTextSnapshot,
} from '../src/contracts.js';
import {
  NativeBooleanRenderer,
  NativeFixedRenderer,
  NativeNumberRenderer,
  NativeStringEnumArrayRenderer,
  NativeStringEnumRenderer,
  NativeStringRenderer,
} from '../src/internal/native/renderers.js';

const SUCCESS: RuntimeActionResult = Object.freeze({
  success: true,
  effects: Object.freeze({ snapshotChanged: false, operationEmitted: true }),
  diagnostics: Object.freeze([]),
});

const texts: ReactFieldTextSnapshot = Object.freeze({
  label: 'Field label',
  description: 'Description',
  hint: 'Hint',
  tooltip: 'Tooltip',
  placeholder: 'Choose a value',
  clearLabel: 'Clear',
  setNullLabel: 'Set null',
  nullValueLabel: 'Null value',
  fixedMissingLabel: 'Missing value',
  fixedUnavailableLabel: 'Unavailable value',
  fixedIncompatibleLabel: 'Incompatible value',
  choiceLabels: Object.freeze(['First', 'Second', 'Third']),
  missingSelectionLabel: 'No value provided.',
  emptySelectionLabel: 'No values selected.',
  issueMessages: Object.freeze(['The value is invalid.']),
});

const baseNode = Object.freeze({
  key: 'field-😀',
  name: 'field',
  path: Object.freeze(['field']),
  required: true,
  label: 'Field label',
  description: 'Description',
  hint: 'Hint',
  tooltip: 'Tooltip',
});

const stringField: StringFieldDefinition = Object.freeze({
  ...baseNode,
  kind: 'string',
  nullable: true,
  placeholder: 'Choose a value',
  constraints: Object.freeze({}),
});

const enumField: StringFieldDefinition = Object.freeze({
  ...stringField,
  choices: Object.freeze([
    Object.freeze({ value: 'first', label: 'First' }),
    Object.freeze({ value: '', label: 'Empty' }),
    Object.freeze({ value: 'third', label: 'Third' }),
  ]),
});

const arrayField: StringEnumArrayFieldDefinition = Object.freeze({
  ...baseNode,
  kind: 'string-enum-array',
  nullable: false,
  choices: Object.freeze([
    Object.freeze({ value: 'first', label: 'First' }),
    Object.freeze({ value: 'second', label: 'Second' }),
    Object.freeze({ value: 'third', label: 'Third' }),
  ]),
});

const numberField: NumberFieldDefinition = Object.freeze({
  ...baseNode,
  kind: 'number',
  nullable: true,
  numericType: 'number',
  constraints: Object.freeze({}),
  ui: Object.freeze({ decimalPlaces: 2, showTrailingZeros: true }),
});

const booleanField: BooleanFieldDefinition = Object.freeze({
  ...baseNode,
  kind: 'boolean',
  nullable: true,
});

function snapshot(
  presence: FieldRuntimeSnapshot['presence'],
  overrides: Partial<FieldRuntimeSnapshot> = {},
): FieldRuntimeSnapshot {
  return Object.freeze({
    nodeKind: 'field',
    key: baseNode.key,
    path: baseNode.path,
    presence,
    dirty: false,
    touched: false,
    focused: false,
    visible: true,
    enabled: true,
    valid: true,
    issues: Object.freeze([]),
    showIssues: false,
    ...overrides,
  });
}

function rendererProps(
  field: ReactFieldRendererProps['field'],
  fieldSnapshot: FieldRuntimeSnapshot,
  overrides: Partial<ReactFieldRendererProps> = {},
): ReactFieldRendererProps {
  return Object.freeze({
    field,
    snapshot: fieldSnapshot,
    formId: 'A😀',
    locale: 'en-US',
    texts,
    setValue: vi.fn(() => SUCCESS),
    removeValue: vi.fn(() => SUCCESS),
    fieldFocus: vi.fn(() => SUCCESS),
    fieldBlur: vi.fn(() => SUCCESS),
    rendererDiagnostics: vi.fn(),
    ...overrides,
  });
}

describe('React native primitive renderers', () => {
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

  describe('native string', () => {
    it('preserves empty, null and external confirmation while emitting text intentions', () => {
      const setValue = vi.fn<(value: unknown) => RuntimeActionResult>(
        () => SUCCESS,
      );
      const removeValue = vi.fn(() => SUCCESS);
      let props = rendererProps(
        stringField,
        snapshot({ kind: 'value', value: '' }),
        {
          setValue,
          removeValue,
        },
      );
      render(createElement(NativeStringRenderer, props));
      const input = host.querySelector('input');
      expect(input?.value).toBe('');
      setInput(input, 'draft');
      expect(setValue).toHaveBeenLastCalledWith('draft');

      props = rendererProps(
        stringField,
        snapshot({ kind: 'value', value: null }),
        {
          setValue,
          removeValue,
        },
      );
      render(createElement(NativeStringRenderer, props));
      expect(host.textContent).toContain('Null value');
      expect(host.querySelector('input')?.value).toBe('');
      clickButton('Clear');
      expect(removeValue).toHaveBeenCalledOnce();
      expect(document.activeElement).toBe(host.querySelector('input'));

      props = rendererProps(stringField, snapshot({ kind: 'missing' }), {
        setValue,
        removeValue,
      });
      render(createElement(NativeStringRenderer, props));
      clickButton('Set null');
      expect(setValue).toHaveBeenLastCalledWith(null);
      expect(document.activeElement).toBe(host.querySelector('input'));
    });

    it('uses semantic input types without coercing date-time strings', () => {
      for (const [format, type] of [
        ['email', 'email'],
        ['date', 'date'],
        ['date-time', 'text'],
      ] as const) {
        const field = Object.freeze({ ...stringField, format });
        render(
          createElement(
            NativeStringRenderer,
            rendererProps(
              field,
              snapshot({ kind: 'value', value: '1843-01-01T12:00:00Z' }),
            ),
          ),
        );
        expect(host.querySelector('input')?.type).toBe(type);
      }
    });

    it('keeps missing ancestors materializable and blocks incompatible ancestors', () => {
      render(
        createElement(
          NativeStringRenderer,
          rendererProps(
            stringField,
            snapshot({
              kind: 'blocked',
              reason: 'missing-ancestor',
              at: Object.freeze(['parent']),
            }),
          ),
        ),
      );
      expect(host.querySelector('input')?.disabled).toBe(false);
      expect(host.textContent).toContain('Set null');

      render(
        createElement(
          NativeStringRenderer,
          rendererProps(
            stringField,
            snapshot({
              kind: 'blocked',
              reason: 'incompatible-ancestor',
              at: Object.freeze(['parent']),
            }),
          ),
        ),
      );
      expect(host.querySelector('input')?.disabled).toBe(true);
      expect(host.textContent).not.toContain('Set null');
    });
  });

  describe('native string enum', () => {
    it('shows a named missing option and preserves an empty-string choice', () => {
      const setValue = vi.fn(() => SUCCESS);
      const props = rendererProps(enumField, snapshot({ kind: 'missing' }), {
        setValue,
      });
      render(createElement(NativeStringEnumRenderer, props));
      const select = host.querySelector('select');
      expect(select?.options[0]?.textContent).toBe('Choose a value');
      expect(select?.options[0]?.disabled).toBe(true);
      setSelect(select, 'choice:1');
      expect(setValue).toHaveBeenCalledWith('');
    });

    it('restores an incompatible confirmed value to the sentinel on blur', () => {
      render(
        createElement(
          NativeStringEnumRenderer,
          rendererProps(
            enumField,
            snapshot({ kind: 'value', value: 'unknown' }),
          ),
        ),
      );
      const select = host.querySelector('select');
      expect(select?.value).toBe('');
      setSelect(select, 'choice:0');
      act(() => {
        select?.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
      });
      expect(select?.value).toBe('');
    });
  });

  describe('native atomic string-enum array', () => {
    it('distinguishes missing and empty selection and emits one atomic ordered candidate', () => {
      const setValue = vi.fn(() => SUCCESS);
      let props = rendererProps(arrayField, snapshot({ kind: 'missing' }), {
        setValue,
      });
      render(createElement(NativeStringEnumArrayRenderer, props));
      expect(host.textContent).toContain('No value provided.');

      props = rendererProps(
        arrayField,
        snapshot({ kind: 'value', value: [] }),
        {
          setValue,
        },
      );
      render(createElement(NativeStringEnumArrayRenderer, props));
      expect(host.textContent).toContain('No values selected.');
      const select = host.querySelector('select');
      if (select === null) throw new Error('Expected multiple select.');
      select.options[2]!.selected = true;
      select.options[0]!.selected = true;
      act(() => {
        select.dispatchEvent(new Event('change', { bubbles: true }));
      });
      expect(setValue).toHaveBeenLastCalledWith(['first', 'third']);
      expect([...select.selectedOptions].map((option) => option.value)).toEqual(
        [],
      );
    });

    it('disables an incompatible external selection without rewriting it', () => {
      const setValue = vi.fn(() => SUCCESS);
      render(
        createElement(
          NativeStringEnumArrayRenderer,
          rendererProps(
            arrayField,
            snapshot({ kind: 'value', value: ['unknown'] }),
            {
              setValue,
            },
          ),
        ),
      );
      expect(host.querySelector('select')?.disabled).toBe(true);
      expect(setValue).not.toHaveBeenCalled();
    });
  });

  describe('native number/integer', () => {
    it('uses a locale buffer, preserves negative zero and restores confirmed text on blur', () => {
      const setValue = vi.fn<(value: unknown) => RuntimeActionResult>(
        () => SUCCESS,
      );
      const props = rendererProps(
        numberField,
        snapshot({ kind: 'value', value: 1234.5 }),
        { locale: 'de-DE', setValue },
      );
      render(createElement(NativeNumberRenderer, props));
      const input = host.querySelector('input');
      expect(input?.value).toBe('1.234,50');
      act(() => input?.focus());
      expect(input?.value).toBe('1234,5');
      setInput(input, '-0');
      const emitted = setValue.mock.calls.at(-1)?.[0];
      expect(Object.is(emitted, -0)).toBe(true);
      setInput(input, 'not-a-number');
      expect(setValue).toHaveBeenCalledTimes(1);
      act(() => input?.blur());
      expect(input?.value).toBe('1.234,50');
    });

    it('rejects decimals for integer fields and clears an existing value from empty input', () => {
      const setValue = vi.fn(() => SUCCESS);
      const removeValue = vi.fn(() => SUCCESS);
      const integer = Object.freeze({
        ...numberField,
        numericType: 'integer' as const,
      });
      render(
        createElement(
          NativeNumberRenderer,
          rendererProps(integer, snapshot({ kind: 'value', value: 0 }), {
            setValue,
            removeValue,
          }),
        ),
      );
      const input = host.querySelector('input');
      setInput(input, '1.5');
      expect(setValue).not.toHaveBeenCalled();
      setInput(input, '');
      expect(removeValue).toHaveBeenCalledOnce();
    });
  });

  describe('native boolean', () => {
    it('keeps false distinct from missing/null and emits checkbox intentions', () => {
      const setValue = vi.fn(() => SUCCESS);
      let props = rendererProps(
        booleanField,
        snapshot({ kind: 'value', value: false }),
        {
          setValue,
        },
      );
      render(createElement(NativeBooleanRenderer, props));
      const checkbox = host.querySelector('input');
      expect(checkbox?.checked).toBe(false);
      if (checkbox === null) throw new Error('Expected checkbox.');
      act(() => checkbox.click());
      expect(setValue).toHaveBeenCalledWith(true);

      props = rendererProps(
        booleanField,
        snapshot({ kind: 'value', value: null }),
        {
          setValue,
        },
      );
      render(createElement(NativeBooleanRenderer, props));
      expect(host.textContent).toContain('Null value');
    });
  });

  describe('native fixed output', () => {
    it.each([
      [{ kind: 'missing' } as const, stringField, 'missing', 'Missing value'],
      [
        {
          kind: 'blocked',
          reason: 'incompatible-ancestor',
          at: ['parent'],
        } as const,
        stringField,
        'unavailable',
        'Unavailable value',
      ],
      [{ kind: 'value', value: '' } as const, stringField, 'value', '""'],
      [{ kind: 'value', value: -0 } as const, numberField, 'value', '-0'],
      [
        { kind: 'value', value: false } as const,
        booleanField,
        'value',
        'false',
      ],
      [
        { kind: 'value', value: null } as const,
        stringField,
        'value',
        'Null value',
      ],
      [
        { kind: 'value', value: 12 } as const,
        stringField,
        'incompatible',
        'Incompatible value',
      ],
    ])(
      'represents %# without collapsing edge values',
      (presence, field, state, text) => {
        const fixedField = Object.freeze({ ...field, fixedValue: null });
        render(
          createElement(
            NativeFixedRenderer,
            rendererProps(fixedField, snapshot(presence)),
          ),
        );
        const output = host.querySelector<HTMLElement>(
          '[data-fixed-value-state]',
        );
        expect(output?.dataset['fixedValueState']).toBe(state);
        expect(output?.textContent).toBe(text);
      },
    );

    it('uses a non-focusable group and exposes invalid state independently of issue visibility', () => {
      const fixedField = Object.freeze({
        ...stringField,
        fixedValue: 'fixed',
      });
      render(
        createElement(
          NativeFixedRenderer,
          rendererProps(
            fixedField,
            snapshot(
              { kind: 'value', value: 'other' },
              { valid: false, showIssues: false },
            ),
          ),
        ),
      );
      const group = host.querySelector('[role="group"]');
      expect(group?.getAttribute('aria-invalid')).toBe('true');
      expect(group?.hasAttribute('aria-required')).toBe(false);
      expect(group?.hasAttribute('tabindex')).toBe(false);
      expect(host.querySelector('input,select,button,output')).toBeNull();
    });
  });

  it('exposes exact UTF-16 IDs and associated visible invalid field semantics', () => {
    const invalidSnapshot = snapshot(
      { kind: 'value', value: 'bad' },
      {
        enabled: false,
        valid: false,
        showIssues: true,
        issues: Object.freeze([
          Object.freeze({
            code: 'invalid',
            path: baseNode.path,
            parameters: Object.freeze({}),
          }),
        ]),
      },
    );
    render(
      createElement(
        NativeStringRenderer,
        rendererProps(stringField, invalidSnapshot),
      ),
    );
    const input = host.querySelector('input');
    const prefix = 'se-0041d83dde00--006600690065006c0064002dd83dde00--';
    expect(input?.id).toBe(`${prefix}control`);
    expect(host.querySelector('label')?.id).toBe(`${prefix}label`);
    expect(input?.labels?.[0]?.textContent).toBe('Field label');
    expect(input?.required).toBe(true);
    expect(input?.disabled).toBe(true);
    expect(input?.getAttribute('aria-invalid')).toBe('true');
    expect(input?.getAttribute('aria-describedby')?.split(' ')).toEqual([
      `${prefix}description`,
      `${prefix}hint`,
      `${prefix}issues`,
    ]);
    expect(host.querySelector(`#${prefix}issues`)?.textContent).toContain(
      'The value is invalid.',
    );
    expect(host.querySelector(`button[id="${prefix}clear"]`)?.id).toBe(
      `${prefix}clear`,
    );
  });

  function setInput(input: HTMLInputElement | null, value: string): void {
    if (input === null) throw new Error('Expected input.');
    const descriptor = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    );
    if (descriptor?.set === undefined)
      throw new Error('Expected native value setter.');
    descriptor.set.bind(input)(value);
    act(() => {
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  function setSelect(select: HTMLSelectElement | null, value: string): void {
    if (select === null) throw new Error('Expected select.');
    select.value = value;
    act(() => {
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  function clickButton(text: string): void {
    const button = [...host.querySelectorAll('button')].find(
      (candidate) => candidate.textContent === text,
    );
    if (button === undefined) throw new Error(`Expected ${text} button.`);
    act(() => button.click());
  }
});
