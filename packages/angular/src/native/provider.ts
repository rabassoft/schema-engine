// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import type { EnvironmentProviders } from '@angular/core';
import type { FieldDefinition, FieldTemplate } from '@rabassoft/schema-engine';
import { provideSchemaEngineAngular } from '../provider.js';
import type { AngularRendererRegistration } from '../renderer.js';
import { SchemaBooleanRendererComponent } from './boolean-renderer.js';
import { SchemaNumberRendererComponent } from './number-renderer.js';
import { SchemaStringEnumRendererComponent } from './string-enum-renderer.js';
import { SchemaStringRendererComponent } from './string-renderer.js';

const nativeRegistrations: readonly AngularRendererRegistration[] =
  Object.freeze([
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

export function provideSchemaEngineAngularNative(
  ...customRegistrations: readonly AngularRendererRegistration[]
): EnvironmentProviders {
  return provideSchemaEngineAngular(
    ...nativeRegistrations,
    ...customRegistrations,
  );
}
