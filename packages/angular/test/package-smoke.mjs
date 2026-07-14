import assert from 'node:assert/strict';
import '@angular/compiler';
import { Injector, createEnvironmentInjector } from '@angular/core';
import * as angularApi from '@rabassoft/schema-engine-angular';
import {
  AngularRendererResolver,
  SchemaBooleanRendererComponent,
  SchemaFieldOutletDirective,
  SchemaFormDirective,
  SchemaNumberRendererComponent,
  SchemaStringEnumRendererComponent,
  SchemaStringRendererComponent,
  provideSchemaEngineAngular,
  provideSchemaEngineAngularNative,
  provideSchemaRenderer,
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
assert.equal(typeof SchemaStringRendererComponent, 'function');
assert.equal(typeof SchemaStringEnumRendererComponent, 'function');
assert.equal(typeof SchemaNumberRendererComponent, 'function');
assert.equal(typeof SchemaBooleanRendererComponent, 'function');
assert.equal('SCHEMA_RENDERER_REGISTRATIONS' in angularApi, false);
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
