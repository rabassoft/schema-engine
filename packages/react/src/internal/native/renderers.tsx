// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import {
  createElement,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type ReactElement,
} from 'react';
import type { FieldRuntimeSnapshot } from '@rabassoft/schema-engine';
import type { ReactFieldRendererProps } from '../../contracts.js';
import {
  describedBy,
  fieldDisabled,
  fieldIds,
  fieldInteractive,
  fieldUnavailable,
  FieldSupplementary,
  ownChoices,
} from './common.js';
import { createNumberCodec, type NumberRendererField } from './number-codec.js';

export function NativeStringRenderer(
  props: ReactFieldRendererProps,
): ReactElement {
  const ids = fieldIds(props.formId, props.snapshot.key);
  const confirmed = confirmedString(props.snapshot);
  const [buffer, setBuffer] = useState(confirmed);
  const control = useRef<HTMLInputElement>(null);
  useLayoutEffect(
    () => setBuffer(confirmed),
    [
      confirmed,
      props.snapshot.presence.kind,
      props.snapshot.presence.kind === 'value'
        ? props.snapshot.presence.value
        : props.snapshot.presence.kind === 'blocked'
          ? props.snapshot.presence.reason
          : undefined,
    ],
  );
  const confirmedNull = isConfirmedNull(props);
  const disabled = fieldDisabled(props.snapshot);
  const inputType =
    props.field.kind === 'string' && props.field.format === 'email'
      ? 'email'
      : props.field.kind === 'string' && props.field.format === 'date'
        ? 'date'
        : 'text';
  return createElement(
    'div',
    { hidden: !props.snapshot.visible },
    createElement(
      'label',
      { id: ids.label, htmlFor: ids.control },
      props.texts.label,
    ),
    createElement(FieldSupplementary, {
      props,
      ids,
      ...(confirmedNull
        ? { extraDescription: nullStatus(props.texts.nullValueLabel) }
        : {}),
    }),
    createElement('input', {
      ref: control,
      id: ids.control,
      type: inputType,
      value: buffer,
      disabled,
      required: props.field.required,
      placeholder: props.texts.placeholder ?? '',
      'aria-describedby': describedBy(ids, props, confirmedNull),
      'aria-invalid': ariaInvalid(props),
      'aria-description': props.texts.tooltip,
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        setBuffer(event.currentTarget.value);
        if (fieldInteractive(props.snapshot))
          props.setValue(event.currentTarget.value);
      },
      onFocus: () => {
        if (fieldInteractive(props.snapshot)) props.fieldFocus();
      },
      onBlur: () => {
        setBuffer(confirmed);
        if (fieldInteractive(props.snapshot)) props.fieldBlur();
      },
    }),
    nullableActions(props, ids, confirmedNull, () => control.current?.focus()),
  );
}

export function NativeStringEnumRenderer(
  props: ReactFieldRendererProps,
): ReactElement {
  const ids = fieldIds(props.formId, props.snapshot.key);
  const choices = ownChoices(props.field);
  const confirmed = confirmedChoiceToken(props.snapshot, choices);
  const [token, setToken] = useState(confirmed);
  const control = useRef<HTMLSelectElement>(null);
  useLayoutEffect(
    () => setToken(confirmed),
    [
      confirmed,
      props.snapshot.presence.kind,
      props.snapshot.presence.kind === 'value'
        ? props.snapshot.presence.value
        : props.snapshot.presence.kind === 'blocked'
          ? props.snapshot.presence.reason
          : undefined,
    ],
  );
  return createElement(
    'div',
    { hidden: !props.snapshot.visible },
    createElement(
      'label',
      { id: ids.label, htmlFor: ids.control },
      props.texts.label,
    ),
    createElement(FieldSupplementary, { props, ids }),
    createElement(
      'select',
      {
        ref: control,
        id: ids.control,
        value: token,
        disabled: fieldDisabled(props.snapshot),
        required: props.field.required,
        'aria-describedby': describedBy(ids, props),
        'aria-invalid': ariaInvalid(props),
        'aria-description': props.texts.tooltip,
        onChange: (event: ChangeEvent<HTMLSelectElement>) => {
          const next = event.currentTarget.value;
          setToken(next);
          const index = choiceIndex(next, choices.length);
          if (index !== undefined && fieldInteractive(props.snapshot))
            props.setValue(choices[index]?.value);
        },
        onFocus: () => {
          if (fieldInteractive(props.snapshot)) props.fieldFocus();
        },
        onBlur: () => {
          setToken(confirmed);
          if (fieldInteractive(props.snapshot)) props.fieldBlur();
        },
      },
      createElement(
        'option',
        { value: '', disabled: true },
        nonBlank(props.texts.placeholder) ?? props.texts.missingSelectionLabel,
      ),
      ...choices.map((choice, index) =>
        createElement(
          'option',
          { key: `${index}:${choice.value}`, value: choiceToken(index) },
          props.texts.choiceLabels[index] ?? choice.label,
        ),
      ),
    ),
    clearAction(props, ids, () => control.current?.focus()),
  );
}

export function NativeStringEnumArrayRenderer(
  props: ReactFieldRendererProps,
): ReactElement {
  const ids = fieldIds(props.formId, props.snapshot.key);
  const choices = ownChoices(props.field);
  const presentation = useMemo(
    () => inspectSelection(props.snapshot, choices),
    [props.snapshot, choices],
  );
  const confirmed = presentation.tokens;
  const [tokens, setTokens] = useState<readonly string[]>(confirmed);
  const host = useRef<HTMLDivElement>(null);
  const control = useRef<HTMLSelectElement>(null);
  const confirmationIdentity = selectionConfirmationIdentity(
    props.snapshot,
    presentation,
  );
  useLayoutEffect(() => setTokens(confirmed), [confirmationIdentity]);
  const status = selectionStatus(props, presentation, choices);
  return createElement(
    'div',
    {
      ref: host,
      hidden: !props.snapshot.visible,
      'aria-labelledby': ids.label,
      tabIndex:
        !fieldDisabled(props.snapshot) && !presentation.representable
          ? 0
          : undefined,
      onFocus: (event: FocusEvent<HTMLDivElement>) => {
        if (
          event.target === event.currentTarget &&
          fieldInteractive(props.snapshot)
        )
          props.fieldFocus();
      },
      onBlur: (event: FocusEvent<HTMLDivElement>) => {
        if (
          event.target === event.currentTarget &&
          fieldInteractive(props.snapshot)
        )
          props.fieldBlur();
      },
    },
    createElement(
      'label',
      { id: ids.label, htmlFor: ids.control },
      props.texts.label,
    ),
    createElement(FieldSupplementary, {
      props,
      ids,
      ...(status === undefined ? {} : { extraDescription: status }),
    }),
    createElement(
      'select',
      {
        ref: control,
        id: ids.control,
        multiple: true,
        value: tokens,
        disabled: fieldDisabled(props.snapshot) || !presentation.representable,
        required: props.field.required,
        'aria-describedby': describedBy(ids, props, status !== undefined),
        'aria-invalid': ariaInvalid(props),
        'aria-description': props.texts.tooltip,
        onChange: (event: ChangeEvent<HTMLSelectElement>) => {
          if (!fieldInteractive(props.snapshot) || !presentation.representable)
            return;
          const selected = [...event.currentTarget.options]
            .filter((option) => option.selected)
            .map((option) => option.value);
          if (
            selected.some(
              (value) => choiceIndex(value, choices.length) === undefined,
            )
          ) {
            setTokens(Object.freeze([...confirmed]));
            return;
          }
          const selectedIndices = new Set(
            selected.map(
              (value) => choiceIndex(value, choices.length) as number,
            ),
          );
          const retained = presentation.values.filter((value) => {
            const index = choices.findIndex((choice) => choice.value === value);
            return index >= 0 && selectedIndices.has(index);
          });
          const candidate = [...retained];
          const confirmedSet = new Set(presentation.values);
          for (let index = 0; index < choices.length; index += 1) {
            const value = choices[index]?.value;
            if (
              value !== undefined &&
              selectedIndices.has(index) &&
              !confirmedSet.has(value)
            )
              candidate.push(value);
          }
          setTokens(Object.freeze([...confirmed]));
          if (!orderedEqual(candidate, presentation.values))
            props.setValue(candidate);
        },
        onFocus: () => {
          if (fieldInteractive(props.snapshot)) props.fieldFocus();
        },
        onBlur: () => {
          setTokens(confirmed);
          if (fieldInteractive(props.snapshot)) props.fieldBlur();
        },
      },
      ...choices.map((choice, index) =>
        createElement(
          'option',
          { key: `${index}:${choice.value}`, value: choiceToken(index) },
          props.texts.choiceLabels[index] ?? choice.label,
        ),
      ),
    ),
    clearAction(props, ids, () =>
      presentation.representable
        ? control.current?.focus()
        : host.current?.focus(),
    ),
  );
}

export function NativeNumberRenderer(
  props: ReactFieldRendererProps,
): ReactElement {
  if (props.field.kind !== 'number')
    throw new Error('Native number renderer requires a number field.');
  const field: NumberRendererField = props.field;
  const ids = fieldIds(props.formId, props.snapshot.key);
  const codec = useMemo(() => createNumberCodec(props.locale), [props.locale]);
  const value = confirmedNumber(props.snapshot, field);
  const confirmed = value === undefined ? '' : codec.format(value, field);
  const [buffer, setBuffer] = useState(confirmed);
  const control = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => {
    if (!props.snapshot.focused) setBuffer(confirmed);
  }, [
    confirmed,
    props.snapshot.focused,
    props.snapshot.presence.kind,
    props.snapshot.presence.kind === 'value'
      ? props.snapshot.presence.value
      : props.snapshot.presence.kind === 'blocked'
        ? props.snapshot.presence.reason
        : undefined,
  ]);
  const confirmedNull = isConfirmedNull(props);
  return createElement(
    'div',
    { hidden: !props.snapshot.visible },
    createElement(
      'label',
      { id: ids.label, htmlFor: ids.control },
      props.texts.label,
    ),
    createElement(FieldSupplementary, {
      props,
      ids,
      ...(confirmedNull
        ? { extraDescription: nullStatus(props.texts.nullValueLabel) }
        : {}),
    }),
    createElement('input', {
      ref: control,
      id: ids.control,
      type: 'text',
      inputMode: field.numericType === 'integer' ? 'numeric' : 'decimal',
      value: buffer,
      disabled: fieldDisabled(props.snapshot),
      required: field.required,
      placeholder: props.texts.placeholder ?? '',
      'aria-describedby': describedBy(ids, props, confirmedNull),
      'aria-invalid': ariaInvalid(props),
      'aria-description': props.texts.tooltip,
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        const next = event.currentTarget.value;
        setBuffer(next);
        if (!fieldInteractive(props.snapshot)) return;
        const parsed = codec.parse(next, field.numericType === 'integer');
        if (parsed.kind === 'empty') {
          if (props.snapshot.presence.kind === 'value') props.removeValue();
        } else if (
          parsed.kind === 'value' &&
          (props.snapshot.presence.kind !== 'value' ||
            !Object.is(props.snapshot.presence.value, parsed.value))
        )
          props.setValue(parsed.value);
      },
      onFocus: () => {
        if (!fieldInteractive(props.snapshot)) return;
        if (value !== undefined) setBuffer(codec.formatEditing(value, field));
        props.fieldFocus();
      },
      onBlur: () => {
        setBuffer(confirmed);
        if (fieldInteractive(props.snapshot)) props.fieldBlur();
      },
    }),
    nullableActions(props, ids, confirmedNull, () => control.current?.focus()),
  );
}

export function NativeBooleanRenderer(
  props: ReactFieldRendererProps,
): ReactElement {
  const ids = fieldIds(props.formId, props.snapshot.key);
  const confirmed =
    props.snapshot.presence.kind === 'value' &&
    props.snapshot.presence.value === true;
  const [checked, setChecked] = useState(confirmed);
  const control = useRef<HTMLInputElement>(null);
  useLayoutEffect(
    () => setChecked(confirmed),
    [
      confirmed,
      props.snapshot.presence.kind,
      props.snapshot.presence.kind === 'value'
        ? props.snapshot.presence.value
        : props.snapshot.presence.kind === 'blocked'
          ? props.snapshot.presence.reason
          : undefined,
    ],
  );
  const confirmedNull = isConfirmedNull(props);
  return createElement(
    'div',
    { hidden: !props.snapshot.visible },
    createElement('input', {
      ref: control,
      id: ids.control,
      type: 'checkbox',
      checked,
      disabled: fieldDisabled(props.snapshot),
      required: props.field.required,
      'aria-describedby': describedBy(ids, props, confirmedNull),
      'aria-invalid': ariaInvalid(props),
      'aria-description': props.texts.tooltip,
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        setChecked(event.currentTarget.checked);
        if (fieldInteractive(props.snapshot))
          props.setValue(event.currentTarget.checked);
      },
      onFocus: () => {
        if (fieldInteractive(props.snapshot)) props.fieldFocus();
      },
      onBlur: () => {
        setChecked(confirmed);
        if (fieldInteractive(props.snapshot)) props.fieldBlur();
      },
    }),
    createElement(
      'label',
      { id: ids.label, htmlFor: ids.control },
      props.texts.label,
    ),
    createElement(FieldSupplementary, {
      props,
      ids,
      ...(confirmedNull
        ? { extraDescription: nullStatus(props.texts.nullValueLabel) }
        : {}),
    }),
    nullableActions(props, ids, confirmedNull, () => control.current?.focus()),
  );
}

export function NativeFixedRenderer(
  props: ReactFieldRendererProps,
): ReactElement {
  const ids = fieldIds(props.formId, props.snapshot.key);
  const display = displayFixedValue(props);
  return createElement(
    'div',
    {
      id: ids.control,
      role: 'group',
      hidden: !props.snapshot.visible,
      'aria-labelledby': ids.label,
      'aria-describedby': describedBy(ids, props),
      'aria-invalid': !props.snapshot.valid || undefined,
      'aria-description': props.texts.tooltip,
    },
    createElement('span', { id: ids.label }, props.texts.label),
    createElement(FieldSupplementary, { props, ids }),
    createElement(
      'span',
      {
        'data-fixed-value-state': display.state,
        style: { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' },
      },
      display.text,
    ),
  );
}

function nullableActions(
  props: ReactFieldRendererProps,
  ids: ReturnType<typeof fieldIds>,
  confirmedNull: boolean,
  focusControl: () => void,
): ReactElement | readonly ReactElement[] | null {
  const actions: ReactElement[] = [];
  if (
    props.field.nullable &&
    !fieldUnavailable(props.snapshot) &&
    !confirmedNull
  )
    actions.push(
      createElement(
        'button',
        {
          key: 'null',
          type: 'button',
          disabled: fieldDisabled(props.snapshot),
          'aria-label': `${props.texts.setNullLabel}: ${props.texts.label}`,
          onClick: () => {
            if (!fieldInteractive(props.snapshot)) return;
            try {
              focusControl();
            } finally {
              props.setValue(null);
            }
          },
        },
        props.texts.setNullLabel,
      ),
    );
  const clear = clearAction(props, ids, focusControl);
  if (clear !== null) actions.push(clear);
  return actions.length === 0 ? null : actions;
}

function clearAction(
  props: ReactFieldRendererProps,
  ids: ReturnType<typeof fieldIds>,
  focusControl: () => void,
): ReactElement | null {
  return props.snapshot.presence.kind !== 'value'
    ? null
    : createElement(
        'button',
        {
          key: 'clear',
          id: ids.clear,
          type: 'button',
          disabled: fieldDisabled(props.snapshot),
          'aria-labelledby': `${ids.clear} ${ids.label}`,
          onClick: () => {
            if (!fieldInteractive(props.snapshot)) return;
            try {
              focusControl();
            } finally {
              props.removeValue();
            }
          },
        },
        props.texts.clearLabel,
      );
}

function confirmedString(snapshot: FieldRuntimeSnapshot): string {
  return snapshot.presence.kind === 'value' &&
    typeof snapshot.presence.value === 'string'
    ? snapshot.presence.value
    : '';
}

function confirmedNumber(
  snapshot: FieldRuntimeSnapshot,
  field: NumberRendererField,
): number | undefined {
  const value =
    snapshot.presence.kind === 'value' ? snapshot.presence.value : undefined;
  return typeof value === 'number' &&
    Number.isFinite(value) &&
    (field.numericType !== 'integer' || Number.isInteger(value))
    ? value
    : undefined;
}

function isConfirmedNull(props: ReactFieldRendererProps): boolean {
  return (
    props.field.nullable &&
    props.snapshot.presence.kind === 'value' &&
    props.snapshot.presence.value === null
  );
}

function nullStatus(text: string): ReactElement {
  return createElement('span', null, text);
}

function ariaInvalid(props: ReactFieldRendererProps): boolean | undefined {
  return props.snapshot.showIssues && !props.snapshot.valid ? true : undefined;
}

function nonBlank(value: string | undefined): string | undefined {
  return value !== undefined && value.trim().length > 0 ? value : undefined;
}

const CHOICE_PREFIX = 'choice:';

function choiceToken(index: number): string {
  return `${CHOICE_PREFIX}${index}`;
}

function choiceIndex(token: string, count: number): number | undefined {
  if (!token.startsWith(CHOICE_PREFIX)) return undefined;
  const suffix = token.slice(CHOICE_PREFIX.length);
  if (!/^(0|[1-9]\d*)$/.test(suffix)) return undefined;
  const index = Number(suffix);
  return Number.isSafeInteger(index) && index < count ? index : undefined;
}

function confirmedChoiceToken(
  snapshot: FieldRuntimeSnapshot,
  choices: readonly { readonly value: string }[],
): string {
  if (
    snapshot.presence.kind !== 'value' ||
    typeof snapshot.presence.value !== 'string'
  )
    return '';
  const confirmedValue = snapshot.presence.value;
  const index = choices.findIndex(({ value }) => value === confirmedValue);
  return index < 0 ? '' : choiceToken(index);
}

interface SelectionPresentation {
  readonly representable: boolean;
  readonly values: readonly string[];
  readonly tokens: readonly string[];
}

function selectionConfirmationIdentity(
  snapshot: FieldRuntimeSnapshot,
  presentation: SelectionPresentation,
): unknown {
  if (snapshot.presence.kind === 'missing') return 'missing';
  if (snapshot.presence.kind === 'blocked')
    return `blocked:${snapshot.presence.reason}`;
  return presentation.representable
    ? JSON.stringify(['selection', ...presentation.values])
    : snapshot.presence.value;
}

function inspectSelection(
  snapshot: FieldRuntimeSnapshot,
  choices: readonly { readonly value: string }[],
): SelectionPresentation {
  if (snapshot.presence.kind === 'missing')
    return {
      representable: true,
      values: Object.freeze([]),
      tokens: Object.freeze([]),
    };
  if (
    snapshot.presence.kind !== 'value' ||
    !Array.isArray(snapshot.presence.value)
  )
    return {
      representable: false,
      values: Object.freeze([]),
      tokens: Object.freeze([]),
    };
  const values: string[] = [];
  const tokens: string[] = [];
  const seen = new Set<string>();
  for (let index = 0; index < snapshot.presence.value.length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(
      snapshot.presence.value,
      index,
    );
    if (
      descriptor === undefined ||
      !('value' in descriptor) ||
      typeof descriptor.value !== 'string' ||
      seen.has(descriptor.value)
    )
      return {
        representable: false,
        values: Object.freeze([]),
        tokens: Object.freeze([]),
      };
    const choice = choices.findIndex(({ value }) => value === descriptor.value);
    if (choice < 0)
      return {
        representable: false,
        values: Object.freeze([]),
        tokens: Object.freeze([]),
      };
    seen.add(descriptor.value);
    values.push(descriptor.value);
    tokens.push(choiceToken(choice));
  }
  return {
    representable: true,
    values: Object.freeze(values),
    tokens: Object.freeze(tokens),
  };
}

function selectionStatus(
  props: ReactFieldRendererProps,
  presentation: SelectionPresentation,
  choices: readonly { readonly value: string }[],
): string | undefined {
  if (props.snapshot.presence.kind === 'missing')
    return props.texts.missingSelectionLabel;
  if (
    props.snapshot.presence.kind === 'value' &&
    Array.isArray(props.snapshot.presence.value)
  ) {
    if (props.snapshot.presence.value.length === 0)
      return props.texts.emptySelectionLabel;
    if (presentation.representable)
      return presentation.values
        .map((value) => {
          const index = choices.findIndex((choice) => choice.value === value);
          return props.texts.choiceLabels[index] ?? value;
        })
        .join(', ');
  }
  return props.texts.label;
}

function orderedEqual(
  left: readonly string[],
  right: readonly string[],
): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function displayFixedValue(props: ReactFieldRendererProps): {
  readonly state: string;
  readonly text: string;
} {
  const { presence } = props.snapshot;
  if (presence.kind === 'blocked')
    return { state: 'unavailable', text: props.texts.fixedUnavailableLabel };
  if (presence.kind === 'missing')
    return { state: 'missing', text: props.texts.fixedMissingLabel };
  const value = presence.value;
  if (value === null)
    return props.field.nullable
      ? { state: 'value', text: props.texts.nullValueLabel }
      : { state: 'incompatible', text: props.texts.fixedIncompatibleLabel };
  if (props.field.kind === 'string' && typeof value === 'string')
    return { state: 'value', text: value === '' ? '""' : value };
  if (
    props.field.kind === 'number' &&
    typeof value === 'number' &&
    Number.isFinite(value) &&
    (props.field.numericType !== 'integer' || Number.isInteger(value))
  )
    return {
      state: 'value',
      text: Object.is(value, -0) ? '-0' : String(value),
    };
  if (props.field.kind === 'boolean' && typeof value === 'boolean')
    return { state: 'value', text: String(value) };
  return { state: 'incompatible', text: props.texts.fixedIncompatibleLabel };
}
