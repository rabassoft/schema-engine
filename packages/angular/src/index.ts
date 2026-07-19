// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

export { AngularRendererResolver, provideSchemaRenderer } from './renderer.js';
export { provideSchemaEngineAngular } from './provider.js';
export { SchemaFormDirective } from './form.directive.js';
export { SchemaFieldOutletDirective } from './field-outlet.directive.js';
export { SchemaStringRendererComponent } from './native/string-renderer.js';
export { SchemaStringEnumRendererComponent } from './native/string-enum-renderer.js';
export { SchemaNumberRendererComponent } from './native/number-renderer.js';
export { SchemaBooleanRendererComponent } from './native/boolean-renderer.js';
export { provideSchemaEngineAngularNative } from './native/provider.js';
export { SCHEMA_TEXT_RESOLVER, provideSchemaTextResolver } from './text.js';
export { provideSchemaPresentationContainer } from './presentation-container.js';
export {
  SchemaPresentationEntryOutletComponent,
  SchemaPresentationPanelOutletComponent,
} from './presentation-outlets.js';
export type {
  AngularFieldRenderer,
  AngularRendererRegistration,
  AngularRendererType,
  RendererResolutionResult,
  RendererTester,
} from './renderer.js';
export type { AngularControlledFormConfig } from './form.directive.js';
export type { AngularFieldTextSnapshot } from './text.js';
export type {
  AngularPresentationContainerDefinition,
  AngularPresentationContainerRegistration,
  AngularPresentationContainerRenderer,
  AngularPresentationContainerRendererType,
  AngularPresentationContainerRenderModel,
  AngularPresentationContainerTester,
} from './presentation-container.js';
