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
  ReferenceSchemaDefaults,
  ReferenceScopeConfirmation,
  ReferenceScopeConfirmationExpectation,
  ReferenceScopeConfirmationTarget,
  ReferenceServiceValidation,
  ReferenceTransitionExpectation,
  ReferenceValidatorFunction,
} from './contracts.js';

import { controlledPrimitives } from './scenarios/controlled-primitives.js';
import { advancedPresentation } from './scenarios/advanced-presentation.js';
import { localDefinitions } from './scenarios/local-definitions.js';
import { nestedProfile } from './scenarios/nested-profile.js';
import { nullablePreferences } from './scenarios/nullable-preferences.js';
import { objectComposition } from './scenarios/object-composition.js';
import { presentationSections } from './scenarios/presentation-sections.js';
import { recursiveLocalPresentation } from './scenarios/recursive-local-presentation.js';
import { stableTeam } from './scenarios/stable-team.js';
import { semanticContact } from './scenarios/semantic-contact.js';
import { fixedValues } from './scenarios/fixed-values.js';
import { serviceValidation } from './scenarios/service-validation.js';
import { scopeBaselineConfirmation } from './scenarios/scope-baseline-confirmation.js';
import { explicitSchemaDefaults } from './scenarios/explicit-schema-defaults.js';
import { conditionalFieldState } from './scenarios/conditional-field-state.js';
import { stringEnumArray } from './scenarios/string-enum-array.js';
export { fixedValueControlStates } from './scenarios/fixed-values.js';
export { stringEnumArrayControlStates } from './scenarios/string-enum-array.js';

export const referenceScenarios = defineReferenceCatalog([
  controlledPrimitives,
  nestedProfile,
  stableTeam,
  localDefinitions,
  objectComposition,
  presentationSections,
  nullablePreferences,
  advancedPresentation,
  recursiveLocalPresentation,
  semanticContact,
  fixedValues,
  serviceValidation,
  scopeBaselineConfirmation,
  explicitSchemaDefaults,
  conditionalFieldState,
  stringEnumArray,
]);
