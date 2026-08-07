// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import { createElement, type ReactNode } from 'react';
import type {
  FieldDefinition,
  FieldRuntimeSnapshot,
  FieldTemplate,
} from '@rabassoft/schema-engine';
import type { ReactFieldRendererProps } from '../../contracts.js';

export interface FieldIds {
  readonly control: string;
  readonly label: string;
  readonly description: string;
  readonly hint: string;
  readonly issues: string;
  readonly clear: string;
}

export function fieldIds(formId: string, ownerKey: string): FieldIds {
  const base = `se-${encodeUtf16(formId)}--${encodeUtf16(ownerKey)}--`;
  return Object.freeze({
    control: `${base}control`,
    label: `${base}label`,
    description: `${base}description`,
    hint: `${base}hint`,
    issues: `${base}issues`,
    clear: `${base}clear`,
  });
}

export function encodeUtf16(value: string): string {
  let encoded = '';
  for (let index = 0; index < value.length; index += 1)
    encoded += value.charCodeAt(index).toString(16).padStart(4, '0');
  return encoded;
}

export function semanticId(
  formId: string,
  ownerKey: string,
  suffix:
    | 'control'
    | 'label'
    | 'description'
    | 'hint'
    | 'issues'
    | 'clear'
    | 'tab'
    | 'panel'
    | 'accordion'
    | 'wizard-step',
): string {
  return `se-${encodeUtf16(formId)}--${encodeUtf16(ownerKey)}--${suffix}`;
}

export function fieldDisabled(snapshot: FieldRuntimeSnapshot): boolean {
  return !snapshot.enabled || fieldUnavailable(snapshot);
}

export function fieldUnavailable(snapshot: FieldRuntimeSnapshot): boolean {
  return (
    snapshot.presence.kind === 'blocked' &&
    snapshot.presence.reason === 'incompatible-ancestor'
  );
}

export function fieldInteractive(snapshot: FieldRuntimeSnapshot): boolean {
  return snapshot.visible && !fieldDisabled(snapshot);
}

export function describedBy(
  ids: FieldIds,
  props: ReactFieldRendererProps,
  includeNull = false,
): string | undefined {
  const values = [
    ...(props.texts.description === undefined ? [] : [ids.description]),
    ...(props.texts.hint === undefined ? [] : [ids.hint]),
    ...(includeNull ? [ids.description] : []),
    ...(props.snapshot.showIssues && props.texts.issueMessages.length > 0
      ? [ids.issues]
      : []),
  ];
  const unique = [...new Set(values)];
  return unique.length === 0 ? undefined : unique.join(' ');
}

export function FieldSupplementary({
  props,
  ids,
  extraDescription,
}: {
  readonly props: ReactFieldRendererProps;
  readonly ids: FieldIds;
  readonly extraDescription?: ReactNode;
}): ReactNode {
  const { texts, snapshot } = props;
  return createElement(
    'div',
    null,
    texts.description === undefined && extraDescription === undefined
      ? null
      : createElement(
          'p',
          { id: ids.description },
          texts.description,
          texts.description !== undefined && extraDescription !== undefined
            ? ' '
            : null,
          extraDescription,
        ),
    texts.hint === undefined
      ? null
      : createElement('p', { id: ids.hint }, texts.hint),
    texts.tooltip === undefined
      ? null
      : createElement(
          'details',
          null,
          createElement('summary', { 'aria-label': texts.tooltip }, 'ⓘ'),
          createElement('p', null, texts.tooltip),
        ),
    snapshot.showIssues && texts.issueMessages.length > 0
      ? createElement(
          'ul',
          { id: ids.issues, 'aria-live': 'polite' },
          ...texts.issueMessages.map((message, index) =>
            createElement('li', { key: `${index}:${message}` }, message),
          ),
        )
      : null,
  );
}

export function ownChoices(
  field: FieldDefinition | FieldTemplate,
): readonly { readonly value: string; readonly label: string }[] {
  if (field.kind !== 'string' && field.kind !== 'string-enum-array') return [];
  const descriptor = Object.getOwnPropertyDescriptor(field, 'choices');
  return descriptor !== undefined &&
    'value' in descriptor &&
    Array.isArray(descriptor.value)
    ? (descriptor.value as readonly {
        readonly value: string;
        readonly label: string;
      }[])
    : [];
}

export function hasOwnFixedValue(
  field: FieldDefinition | FieldTemplate,
): boolean {
  const descriptor = Object.getOwnPropertyDescriptor(field, 'fixedValue');
  return descriptor !== undefined && 'value' in descriptor;
}
