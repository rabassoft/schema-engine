// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import type { EnvironmentProviders } from '@angular/core';
import type { FieldDefinition, FieldTemplate } from '@rabassoft/schema-engine';
import { provideSchemaEngineAngular } from '../provider.js';
import type { AngularRendererRegistration } from '../renderer.js';
import { SchemaBooleanRendererComponent } from './boolean-renderer.js';
import { SchemaFixedValueRendererComponent } from './fixed-value-renderer.js';
import { SchemaNumberRendererComponent } from './number-renderer.js';
import { SchemaStringEnumRendererComponent } from './string-enum-renderer.js';
import { SchemaStringEnumArrayRendererComponent } from './string-enum-array-renderer.js';
import { SchemaStringRendererComponent } from './string-renderer.js';

const nativeRegistrations: readonly AngularRendererRegistration[] =
  Object.freeze([
    Object.freeze({
      id: 'native-fixed',
      renderer: SchemaFixedValueRendererComponent,
      tester: (field: FieldDefinition | FieldTemplate) =>
        hasOwnFixedValue(field) ? 30 : null,
      priority: 0,
    }),
    Object.freeze({
      id: 'native-string-enum-array',
      renderer: SchemaStringEnumArrayRendererComponent,
      tester: (field: FieldDefinition | FieldTemplate) =>
        hasOwnStringEnumArrayChoices(field) ? 30 : null,
      priority: 0,
    }),
    Object.freeze({
      id: 'native-string-enum',
      renderer: SchemaStringEnumRendererComponent,
      tester: (field: FieldDefinition | FieldTemplate) =>
        hasOwnChoices(field) ? 20 : null,
      priority: 0,
    }),
    Object.freeze({
      id: 'native-string',
      renderer: SchemaStringRendererComponent,
      tester: (field: FieldDefinition | FieldTemplate) =>
        field.kind === 'string' ? 10 : null,
      priority: 0,
    }),
    Object.freeze({
      id: 'native-number',
      renderer: SchemaNumberRendererComponent,
      tester: (field: FieldDefinition | FieldTemplate) =>
        field.kind === 'number' ? 10 : null,
      priority: 0,
    }),
    Object.freeze({
      id: 'native-boolean',
      renderer: SchemaBooleanRendererComponent,
      tester: (field: FieldDefinition | FieldTemplate) =>
        field.kind === 'boolean' ? 10 : null,
      priority: 0,
    }),
  ]);

function hasOwnFixedValue(field: FieldDefinition | FieldTemplate): boolean {
  const descriptor = Object.getOwnPropertyDescriptor(field, 'fixedValue');
  return descriptor !== undefined && 'value' in descriptor;
}

function hasOwnChoices(field: FieldDefinition | FieldTemplate): boolean {
  if (field.kind !== 'string') return false;
  const descriptor = Object.getOwnPropertyDescriptor(field, 'choices');
  return (
    descriptor !== undefined &&
    'value' in descriptor &&
    Array.isArray(descriptor.value) &&
    descriptor.value.length > 0
  );
}

function hasOwnStringEnumArrayChoices(
  field: FieldDefinition | FieldTemplate,
): boolean {
  if (field.kind !== 'string-enum-array') return false;
  const descriptor = Object.getOwnPropertyDescriptor(field, 'choices');
  if (
    descriptor === undefined ||
    !('value' in descriptor) ||
    !Array.isArray(descriptor.value) ||
    descriptor.value.length === 0
  ) {
    return false;
  }
  const seen = new Set<string>();
  for (let index = 0; index < descriptor.value.length; index += 1) {
    const choice = Object.getOwnPropertyDescriptor(descriptor.value, index);
    if (
      choice === undefined ||
      !('value' in choice) ||
      typeof choice.value !== 'object' ||
      choice.value === null ||
      Array.isArray(choice.value)
    ) {
      return false;
    }
    const value = Object.getOwnPropertyDescriptor(choice.value, 'value');
    const label = Object.getOwnPropertyDescriptor(choice.value, 'label');
    if (
      value === undefined ||
      !('value' in value) ||
      typeof value.value !== 'string' ||
      seen.has(value.value) ||
      label === undefined ||
      !('value' in label) ||
      typeof label.value !== 'string' ||
      label.value.trim().length === 0
    ) {
      return false;
    }
    seen.add(value.value);
  }
  return true;
}

export function provideSchemaEngineAngularNative(
  ...customRegistrations: readonly AngularRendererRegistration[]
): EnvironmentProviders {
  return provideSchemaEngineAngular(
    ...nativeRegistrations,
    ...customRegistrations,
  );
}
