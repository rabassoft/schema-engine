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
  SchemaStringRendererComponent,
  provideSchemaEngineAngular,
  provideSchemaEngineAngularNative,
  provideSchemaRenderer,
  provideSchemaTextResolver,
} from '@rabassoft/schema-engine-angular';

assert.equal(typeof AngularRendererResolver, 'function');
assert.equal(typeof SchemaFormDirective, 'function');
assert.equal(typeof SchemaFieldOutletDirective, 'function');
assert.equal(typeof provideSchemaEngineAngular, 'function');
assert.equal(typeof provideSchemaRenderer, 'function');
assert.equal(typeof provideSchemaEngineAngularNative, 'function');
assert.equal(typeof provideSchemaTextResolver, 'function');
assert.equal(typeof SchemaStringRendererComponent, 'function');
assert.equal(typeof SchemaNumberRendererComponent, 'function');
assert.equal(typeof SchemaBooleanRendererComponent, 'function');
assert.equal('SCHEMA_RENDERER_REGISTRATIONS' in angularApi, false);

const injector = createEnvironmentInjector(
  [provideSchemaEngineAngular()],
  Injector.NULL,
);
const resolver = injector.get(AngularRendererResolver);
assert.equal(resolver.ready, true);
injector.destroy();
