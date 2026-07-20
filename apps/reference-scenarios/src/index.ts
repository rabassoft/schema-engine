import { defineReferenceCatalog } from './authoring.js';

export {
  defineReferenceCatalog,
  ReferenceCatalogAuthoringError,
} from './authoring.js';
export type {
  ReferenceCatalogAuthoringReason,
  ReferenceCatalogPath,
  ReferenceExpectedIssue,
  ReferenceExpectedOperation,
  ReferenceExplanation,
  ReferenceFeature,
  ReferenceInitialState,
  ReferenceScenario,
  ReferenceScenarioAuthoring,
  ReferenceTransitionExpectation,
  ReferenceValidatorFunction,
} from './contracts.js';

import { controlledPrimitives } from './scenarios/controlled-primitives.js';
import { advancedPresentation } from './scenarios/advanced-presentation.js';
import { localDefinitions } from './scenarios/local-definitions.js';
import { nestedProfile } from './scenarios/nested-profile.js';
import { nullablePreferences } from './scenarios/nullable-preferences.js';
import { presentationSections } from './scenarios/presentation-sections.js';
import { recursiveLocalPresentation } from './scenarios/recursive-local-presentation.js';
import { stableTeam } from './scenarios/stable-team.js';

export const referenceScenarios = defineReferenceCatalog([
  controlledPrimitives,
  nestedProfile,
  stableTeam,
  localDefinitions,
  presentationSections,
  nullablePreferences,
  advancedPresentation,
  recursiveLocalPresentation,
]);
