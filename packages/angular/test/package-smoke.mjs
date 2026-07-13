import assert from 'node:assert/strict';
import '@angular/compiler';
import { Injector, createEnvironmentInjector } from '@angular/core';
import {
  AngularRendererResolver,
  SchemaFieldOutletDirective,
  SchemaFormDirective,
  provideSchemaEngineAngular,
  provideSchemaRenderer,
} from '@rabassoft/schema-engine-angular';

assert.equal(typeof AngularRendererResolver, 'function');
assert.equal(typeof SchemaFormDirective, 'function');
assert.equal(typeof SchemaFieldOutletDirective, 'function');
assert.equal(typeof provideSchemaEngineAngular, 'function');
assert.equal(typeof provideSchemaRenderer, 'function');

const injector = createEnvironmentInjector(
  [provideSchemaEngineAngular()],
  Injector.NULL,
);
const resolver = injector.get(AngularRendererResolver);
assert.equal(resolver.ready, true);
injector.destroy();
