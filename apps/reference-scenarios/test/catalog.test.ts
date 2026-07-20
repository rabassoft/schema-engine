import {
  applyFormOperation,
  compileFormDefinition,
  createControlledFormRuntime,
  type FormOperation,
} from '@rabassoft/schema-engine';
import { describe, expect, it } from 'vitest';

import {
  referenceScenarios,
  type ReferenceExpectedIssue,
  type ReferenceExpectedOperation,
  type ReferenceFeature,
} from '../src/index.js';

const EXPECTED_SCENARIOS = [
  'controlled-primitives',
  'nested-profile',
  'stable-team',
  'local-definitions',
  'presentation-sections',
  'nullable-preferences',
  'advanced-presentation',
  'recursive-local-presentation',
] as const;

const EXPECTED_FEATURES: readonly ReferenceFeature[] = [
  'controlled-state',
  'primitive-fields',
  'string-enum',
  'explicit-clear',
  'validation',
  'locale',
  'nested-objects',
  'object-collections',
  'local-references',
  'presentation-groups',
  'nullable-leaves',
  'advanced-layout',
  'recursive-local-presentation',
];

const EXPECTED_TRANSITIONS = {
  'controlled-primitives': [
    'confirm-name',
    'reject-age',
    'pending-clear-role',
    'commit-baseline',
  ],
  'nested-profile': [
    'materialize-city',
    'replace-with-incompatible-ancestor',
    'block-deep-update',
  ],
  'stable-team': [
    'rename-ada',
    'insert-linus',
    'move-linus-first',
    'remove-grace',
  ],
  'local-definitions': ['invalidate-primary', 'repair-primary'],
  'presentation-sections': ['change-email'],
  'nullable-preferences': [
    'set-nickname',
    'clear-nickname',
    'null-notifications',
    'clear-volume',
  ],
  'advanced-presentation': ['change-contact-email'],
  'recursive-local-presentation': ['move-beta-first', 'move-beta-last'],
} as const;

function withRuntimeEnvelope(
  operation: ReferenceExpectedOperation,
  id: number,
  formId: string,
): FormOperation {
  return {
    ...operation,
    metadata: { id, formId },
    source: 'user',
  };
}

function simplifiedIssues(
  issues: readonly {
    readonly code: string;
    readonly path: readonly (string | number)[];
    readonly keyword?: string;
  }[],
): readonly ReferenceExpectedIssue[] {
  return issues.map(({ code, path, keyword }) => ({
    code,
    path,
    ...(keyword === undefined ? {} : { keyword }),
  }));
}

describe('reference scenario catalog', () => {
  it('contains exactly the seven approved scenarios and unique closed feature evidence', () => {
    expect(referenceScenarios.map(({ id }) => id)).toEqual(EXPECTED_SCENARIOS);

    const features = referenceScenarios.flatMap(
      (scenario) => scenario.features,
    );
    expect(new Set(features).size).toBe(features.length);
    expect([...features].sort()).toEqual([...EXPECTED_FEATURES].sort());
    expect(
      Object.fromEntries(
        referenceScenarios.map(({ id, features: scenarioFeatures }) => [
          id,
          scenarioFeatures,
        ]),
      ),
    ).toMatchObject({
      'controlled-primitives': [
        'controlled-state',
        'primitive-fields',
        'string-enum',
        'explicit-clear',
        'validation',
        'locale',
      ],
      'nested-profile': ['nested-objects'],
      'stable-team': ['object-collections'],
      'local-definitions': ['local-references'],
      'presentation-sections': ['presentation-groups'],
      'nullable-preferences': ['nullable-leaves'],
      'advanced-presentation': ['advanced-layout'],
      'recursive-local-presentation': ['recursive-local-presentation'],
    });
    expect(
      Object.fromEntries(
        referenceScenarios.map(({ id, transitions }) => [
          id,
          transitions.map((transition) => transition.id),
        ]),
      ),
    ).toEqual(EXPECTED_TRANSITIONS);
  });

  it.each(referenceScenarios)(
    'compiles $id through the Public compiler without diagnostics',
    (scenario) => {
      const compiled = compileFormDefinition(scenario.compileInput);

      expect(compiled.diagnostics).toEqual([]);
      expect(compiled.success).toBe(true);
      if (!compiled.success) return;
      expect(Object.isFrozen(compiled.definition)).toBe(true);
    },
  );

  it.each(referenceScenarios)(
    'passes the exact $id schema identity to deterministic validation',
    (scenario) => {
      const compiled = compileFormDefinition(scenario.compileInput);
      expect(compiled.success).toBe(true);
      if (!compiled.success) return;
      const receivedSchemas: unknown[] = [];
      const before = JSON.stringify({
        schema: scenario.compileInput.schema,
        value: scenario.initialState.value,
      });
      const validationA = scenario.validator.validate(
        scenario.compileInput.schema,
        scenario.initialState.value,
      );
      const validationB = scenario.validator.validate(
        scenario.compileInput.schema,
        scenario.initialState.value,
      );
      const runtime = createControlledFormRuntime({
        formId: `reference-${scenario.id}`,
        definition: compiled.definition,
        schema: scenario.compileInput.schema,
        value: scenario.initialState.value,
        baselineValue: scenario.initialState.baselineValue,
        locale: scenario.initialState.locale,
        validationVisibility: scenario.initialState.validationVisibility,
        validator: {
          validate(schema, value) {
            receivedSchemas.push(schema);
            return scenario.validator.validate(schema, value);
          },
        },
      });

      expect(validationA).toEqual(validationB);
      expect(validationA.valid).toBe(true);
      expect(validationA.issues).toEqual([]);
      expect(
        JSON.stringify({
          schema: scenario.compileInput.schema,
          value: scenario.initialState.value,
        }),
      ).toBe(before);
      expect(runtime.success).toBe(true);
      expect(receivedSchemas.length).toBeGreaterThan(0);
      expect(
        receivedSchemas.every(
          (schema) => schema === scenario.compileInput.schema,
        ),
      ).toBe(true);
    },
  );

  it.each(referenceScenarios)(
    'replays $id transition evidence without mutating its reset sources',
    (scenario) => {
      const compiled = compileFormDefinition(scenario.compileInput);
      expect(compiled.success).toBe(true);
      if (!compiled.success) return;
      const resetSource = JSON.stringify(scenario.initialState);
      let value = scenario.initialState.value;
      let baselineValue = scenario.initialState.baselineValue;
      let operationId = 0;

      for (const transition of scenario.transitions) {
        if (
          transition.decision === 'confirm' &&
          transition.operation !== undefined
        ) {
          operationId += 1;
          const operation = withRuntimeEnvelope(
            transition.operation,
            operationId,
            `reference-${scenario.id}`,
          );
          const applied = applyFormOperation(
            compiled.definition,
            value,
            operation,
          );
          value = applied.value;
        } else if (transition.decision === 'external-update') {
          if (transition.expected.value !== undefined) {
            value = transition.expected.value;
          }
          if (transition.expected.baselineValue !== undefined) {
            baselineValue = transition.expected.baselineValue;
          }
        }

        if (transition.expected.value !== undefined) {
          expect(value, transition.id).toEqual(transition.expected.value);
        }
        if (transition.expected.baselineValue !== undefined) {
          expect(baselineValue, transition.id).toEqual(
            transition.expected.baselineValue,
          );
        }
        const validation = scenario.validator.validate(
          scenario.compileInput.schema,
          value,
        );
        expect(
          scenario.validator.validate(scenario.compileInput.schema, value),
          transition.id,
        ).toEqual(validation);
        if (transition.expected.valid !== undefined) {
          expect(validation.valid, transition.id).toBe(
            transition.expected.valid,
          );
        }
        if (transition.expected.issues !== undefined) {
          expect(simplifiedIssues(validation.issues), transition.id).toEqual(
            transition.expected.issues,
          );
        }
        if (transition.expected.dirty !== undefined) {
          expect(
            JSON.stringify(value) !== JSON.stringify(baselineValue),
            transition.id,
          ).toBe(transition.expected.dirty);
        }
      }

      expect(JSON.stringify(scenario.initialState)).toBe(resetSource);
      expect(Object.isFrozen(scenario.initialState.value)).toBe(true);
      expect(Object.isFrozen(scenario.initialState.baselineValue)).toBe(true);
    },
  );

  it('records the incompatible nested ancestor with the Public diagnostic', () => {
    const scenario = referenceScenarios.find(
      ({ id }) => id === 'nested-profile',
    );
    expect(scenario).toBeDefined();
    if (scenario === undefined) return;
    const compiled = compileFormDefinition(scenario.compileInput);
    expect(compiled.success).toBe(true);
    if (!compiled.success) return;
    const blocked = scenario.transitions.find(
      ({ id }) => id === 'block-deep-update',
    );
    expect(blocked?.operation).toBeDefined();
    if (blocked?.operation === undefined) return;

    const applied = applyFormOperation(
      compiled.definition,
      { profile: 'blocked' },
      withRuntimeEnvelope(blocked.operation, 1, 'reference-nested-profile'),
    );

    expect(applied).toMatchObject({
      success: false,
      value: { profile: 'blocked' },
      diagnostics: [
        {
          code: 'INCOMPATIBLE_OPERATION_ANCESTOR',
          dataPath: ['profile'],
          parameters: { reason: 'non-object-ancestor' },
        },
      ],
    });
  });
});
