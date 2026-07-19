// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import {
  makeEnvironmentProviders,
  type EnvironmentProviders,
} from '@angular/core';
import { nativePresentationContainerProviders } from './native/presentation-containers.js';
import { AngularPresentationContainerResolver } from './presentation-container.js';
import {
  AngularRendererResolver,
  provideSchemaRenderer,
  type AngularRendererRegistration,
} from './renderer.js';

export function provideSchemaEngineAngular(
  ...registrations: readonly AngularRendererRegistration[]
): EnvironmentProviders {
  return makeEnvironmentProviders([
    AngularRendererResolver,
    AngularPresentationContainerResolver,
    ...nativePresentationContainerProviders(),
    ...registrations.map((registration) => provideSchemaRenderer(registration)),
  ]);
}
