import assert from 'node:assert/strict';
import '@angular/compiler';
import { Injector, createEnvironmentInjector } from '@angular/core';
import {
  compileFormDefinition,
  createControlledFormRuntime,
} from '@rabassoft/schema-engine';
import * as angularApi from '@rabassoft/schema-engine-angular';
import {
  AngularRendererResolver,
  SchemaPresentationEntryOutletComponent,
  SchemaPresentationPanelOutletComponent,
  SchemaBooleanRendererComponent,
  SchemaFixedValueRendererComponent,
  SchemaFieldOutletDirective,
  SchemaFormDirective,
  SchemaNumberRendererComponent,
  SchemaStringEnumArrayRendererComponent,
  SchemaStringEnumRendererComponent,
  SchemaStringRendererComponent,
  provideSchemaEngineAngular,
  provideSchemaEngineAngularNative,
  provideSchemaRenderer,
  provideSchemaPresentationContainer,
  provideSchemaTextResolver,
} from '@rabassoft/schema-engine-angular';

assert.equal(typeof AngularRendererResolver, 'function');
assert.equal(typeof SchemaFormDirective, 'function');
assert.equal(typeof SchemaFormDirective.ɵcmp, 'object');
assert.equal(SchemaFormDirective.ɵdir, undefined);
assert.equal(typeof SchemaFieldOutletDirective, 'function');
assert.equal(typeof provideSchemaEngineAngular, 'function');
assert.equal(typeof provideSchemaRenderer, 'function');
assert.equal(typeof provideSchemaEngineAngularNative, 'function');
assert.equal(typeof provideSchemaTextResolver, 'function');
assert.equal(typeof provideSchemaPresentationContainer, 'function');
assert.equal(typeof SchemaPresentationEntryOutletComponent, 'function');
assert.equal(typeof SchemaPresentationPanelOutletComponent, 'function');
assert.equal(typeof SchemaStringRendererComponent, 'function');
assert.equal(typeof SchemaStringEnumRendererComponent, 'function');
assert.equal(typeof SchemaStringEnumArrayRendererComponent, 'function');
assert.equal(typeof SchemaNumberRendererComponent, 'function');
assert.equal(typeof SchemaBooleanRendererComponent, 'function');
assert.equal(typeof SchemaFixedValueRendererComponent, 'function');
assert.deepEqual(Object.keys(angularApi).sort(), [
  'AngularRendererResolver',
  'SCHEMA_TEXT_RESOLVER',
  'SchemaBooleanRendererComponent',
  'SchemaFieldOutletDirective',
  'SchemaFixedValueRendererComponent',
  'SchemaFormDirective',
  'SchemaNumberRendererComponent',
  'SchemaPresentationEntryOutletComponent',
  'SchemaPresentationPanelOutletComponent',
  'SchemaStringEnumArrayRendererComponent',
  'SchemaStringEnumRendererComponent',
  'SchemaStringRendererComponent',
  'provideSchemaEngineAngular',
  'provideSchemaEngineAngularNative',
  'provideSchemaPresentationContainer',
  'provideSchemaRenderer',
  'provideSchemaTextResolver',
]);
assert.equal('SCHEMA_RENDERER_REGISTRATIONS' in angularApi, false);
assert.equal(
  'SCHEMA_PRESENTATION_CONTAINER_REGISTRATIONS' in angularApi,
  false,
);
assert.equal('AngularPresentationContainerResolver' in angularApi, false);
assert.equal('PresentationContainerHostFactory' in angularApi, false);
assert.equal('nativeRegistrations' in angularApi, false);
assert.equal('sentinelToken' in angularApi, false);
assert.equal('choiceToken' in angularApi, false);
assert.equal('SchemaNodeOutletComponent' in angularApi, false);
assert.equal('ObjectHostFactory' in angularApi, false);
assert.equal('CollectionHostFactory' in angularApi, false);
assert.equal('ItemHostFactory' in angularApi, false);
assert.equal('AngularObjectTextSnapshot' in angularApi, false);
assert.equal('AngularCollectionTextSnapshot' in angularApi, false);
assert.equal('FIELD_INSTANCE_CONTEXT' in angularApi, false);

for (const method of [
  'getItemSnapshot',
  'getCollectionNodeSnapshot',
  'requestSetItemValue',
  'requestRemoveItemValue',
  'requestInsertItem',
  'requestRemoveItem',
  'requestMoveItem',
  'retryAsyncValidation',
]) {
  assert.equal(typeof SchemaFormDirective.prototype[method], 'function');
}

const injector = createEnvironmentInjector(
  [provideSchemaEngineAngular()],
  Injector.NULL,
);
const resolver = injector.get(AngularRendererResolver);
assert.equal(resolver.ready, true);
injector.destroy();

const conditionalSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: {
    active: { type: 'boolean' },
    target: { type: 'string' },
  },
};
const conditionalDefinition = compileFormDefinition({
  schema: conditionalSchema,
  uiSchema: {
    fields: {
      target: { enabledWhen: { path: ['active'], equals: true } },
    },
  },
});
assert.equal(conditionalDefinition.success, true);
if (!conditionalDefinition.success)
  throw new Error('Conditional package compilation failed');
const conditionalValue = { active: false, target: 'kept' };
const conditionalRuntime = createControlledFormRuntime({
  formId: 'angular-conditional-package-smoke',
  definition: conditionalDefinition.definition,
  schema: conditionalSchema,
  value: conditionalValue,
  baselineValue: conditionalValue,
  locale: 'en',
  validator: { validate: () => ({ valid: true, issues: [] }) },
});
assert.equal(conditionalRuntime.success, true);
if (!conditionalRuntime.success)
  throw new Error('Conditional package runtime failed');
assert.deepEqual(
  conditionalRuntime.runtime.getFieldSnapshot(['target']),
  conditionalRuntime.runtime.getSnapshot().fields[1],
);
assert.equal(
  conditionalRuntime.runtime.getFieldSnapshot(['target'])?.enabled,
  false,
);
assert.equal(
  conditionalRuntime.runtime.requestSetValue(['target'], 'stale').diagnostics[0]
    ?.parameters.reason,
  'disabled',
);
conditionalRuntime.runtime.dispose();

const stringEnumArrayDefinition = compileFormDefinition({
  schema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    properties: {
      roles: {
        type: 'array',
        items: { type: 'string', enum: ['reader', 'editor'] },
        uniqueItems: true,
      },
    },
  },
});
assert.equal(stringEnumArrayDefinition.success, true);
if (!stringEnumArrayDefinition.success)
  throw new Error('String-enum array package compilation failed');
const nativeInjector = createEnvironmentInjector(
  [provideSchemaEngineAngularNative()],
  Injector.NULL,
);
const stringEnumArrayResolution = nativeInjector
  .get(AngularRendererResolver)
  .resolve(stringEnumArrayDefinition.definition.fields[0]);
assert.equal(stringEnumArrayResolution.success, true);
assert.equal(
  stringEnumArrayResolution.registration?.id,
  'native-string-enum-array',
);
assert.equal(
  stringEnumArrayResolution.registration?.renderer,
  SchemaStringEnumArrayRendererComponent,
);
nativeInjector.destroy();
