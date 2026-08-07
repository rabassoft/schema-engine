// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import type { FieldDefinition, FieldTemplate } from '@rabassoft/schema-engine';
import type { ReactRendererRegistration } from '../../contracts.js';
import { hasOwnFixedValue } from './common.js';
import {
  NativeBooleanRenderer,
  NativeFixedRenderer,
  NativeNumberRenderer,
  NativeStringEnumArrayRenderer,
  NativeStringEnumRenderer,
  NativeStringRenderer,
} from './renderers.js';

export const NATIVE_REACT_RENDERER_REGISTRATIONS: readonly ReactRendererRegistration[] =
  Object.freeze([
    Object.freeze({
      id: 'native-fixed',
      component: NativeFixedRenderer,
      tester: (field: FieldDefinition | FieldTemplate) =>
        hasOwnFixedValue(field) ? 30 : null,
      priority: 0,
    }),
    Object.freeze({
      id: 'native-string-enum-array',
      component: NativeStringEnumArrayRenderer,
      tester: (field: FieldDefinition | FieldTemplate) =>
        hasChoices(field, 'string-enum-array') ? 30 : null,
      priority: 0,
    }),
    Object.freeze({
      id: 'native-string-enum',
      component: NativeStringEnumRenderer,
      tester: (field: FieldDefinition | FieldTemplate) =>
        hasChoices(field, 'string') ? 20 : null,
      priority: 0,
    }),
    Object.freeze({
      id: 'native-string',
      component: NativeStringRenderer,
      tester: (field: FieldDefinition | FieldTemplate) =>
        field.kind === 'string' ? 10 : null,
      priority: 0,
    }),
    Object.freeze({
      id: 'native-number',
      component: NativeNumberRenderer,
      tester: (field: FieldDefinition | FieldTemplate) =>
        field.kind === 'number' ? 10 : null,
      priority: 0,
    }),
    Object.freeze({
      id: 'native-boolean',
      component: NativeBooleanRenderer,
      tester: (field: FieldDefinition | FieldTemplate) =>
        field.kind === 'boolean' ? 10 : null,
      priority: 0,
    }),
  ]);

function hasChoices(
  field: FieldDefinition | FieldTemplate,
  kind: 'string' | 'string-enum-array',
): boolean {
  if (field.kind !== kind) return false;
  const descriptor = Object.getOwnPropertyDescriptor(field, 'choices');
  return (
    descriptor !== undefined &&
    'value' in descriptor &&
    Array.isArray(descriptor.value) &&
    descriptor.value.length > 0
  );
}
