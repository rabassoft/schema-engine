import {
  applyFormOperation,
  compileFormDefinition,
  createControlledFormRuntime,
  type FormOperation,
} from '@rabassoft/schema-engine';
import { describe, expect, it } from 'vitest';

import {
  referenceScenarios,
  stringEnumArrayControlStates,
  type ReferenceExpectedIssue,
  type ReferenceExpectedOperation,
  type ReferenceFeature,
} from '../src/index.js';

const EXPECTED_SCENARIOS = [
  'controlled-primitives',
  'nested-profile',
  'stable-team',
  'local-definitions',
  'object-composition',
  'presentation-sections',
  'nullable-preferences',
  'advanced-presentation',
  'recursive-local-presentation',
  'semantic-contact',
  'fixed-values',
  'service-validation',
  'scope-baseline-confirmation',
  'explicit-schema-defaults',
  'conditional-field-state',
  'string-enum-array',
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
  'semantic-formats',
  'fixed-values',
  'object-composition',
  'async-validation',
  'scope-confirmation',
  'schema-defaults',
  'conditional-field-state',
  'string-enum-array',
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
  'object-composition': [
    'invalidate-department',
    'repair-department',
    'rename-referenced-field',
  ],
  'presentation-sections': ['change-email'],
  'nullable-preferences': [
    'set-nickname',
    'clear-nickname',
    'null-notifications',
    'clear-volume',
  ],
  'advanced-presentation': ['change-contact-email'],
  'recursive-local-presentation': ['move-beta-first', 'move-beta-last'],
  'semantic-contact': ['invalidate-email-format', 'repair-email-format'],
  'fixed-values': [
    'control-matching',
    'control-mismatch',
    'control-incompatible',
    'control-blocked',
  ],
  'service-validation': ['change-username'],
  'scope-baseline-confirmation': ['edit-profile-name'],
  'explicit-schema-defaults': ['preserve-present-values'],
  'conditional-field-state': [
    'confirm-active-name',
    'invalidate-visible-review',
    'hide-detail-targets',
    'reject-hidden-name',
    'disable-role',
    'reject-disabled-role',
    'hide-false-driver',
    'restore-details',
    'reenable-role',
  ],
  'string-enum-array': [
    'construct-ordered-selection',
    'reject-appended-choice',
    'external-reorder',
    'equal-array-no-op',
    'reject-clear-direct-selection',
    'external-clear-direct-selection',
    'select-nested-blank-values',
    'reject-clear-required-selection',
    'external-clear-required-selection',
    'restore-empty-and-confirm-baseline',
    'external-duplicate',
    'external-unknown',
    'external-non-string',
    'restore-initial-state',
  ],
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
  it('contains exactly the approved scenarios and unique closed feature evidence', () => {
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
      'object-composition': ['object-composition'],
      'presentation-sections': ['presentation-groups'],
      'nullable-preferences': ['nullable-leaves'],
      'advanced-presentation': ['advanced-layout'],
      'recursive-local-presentation': ['recursive-local-presentation'],
      'semantic-contact': ['semantic-formats'],
      'fixed-values': ['fixed-values'],
      'service-validation': ['async-validation'],
      'scope-baseline-confirmation': ['scope-confirmation'],
      'explicit-schema-defaults': ['schema-defaults'],
      'conditional-field-state': ['conditional-field-state'],
      'string-enum-array': ['string-enum-array'],
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

  it('publishes detached deterministic service-validation authoring metadata', () => {
    const scenario = referenceScenarios.find(
      ({ id }) => id === 'service-validation',
    );

    expect(scenario?.serviceValidation).toEqual({
      fieldPath: ['username'],
      issue: {
        code: 'username-unavailable',
        keyword: 'service',
        fallbackMessage: 'This username is not available.',
      },
      labels: {
        heading: 'Service validation controls',
        settleValid: 'Resolve as available',
        settleInvalid: 'Resolve as unavailable',
        reject: 'Reject current request',
        throwNext: 'Throw on next request',
        retry: 'Retry service validation',
      },
    });
    expect(Object.isFrozen(scenario?.serviceValidation)).toBe(true);
    expect(Object.isFrozen(scenario?.serviceValidation?.labels)).toBe(true);
  });

  it('publishes frozen scoped-confirmation authoring without owning effects', () => {
    const scenario = referenceScenarios.find(
      ({ id }) => id === 'scope-baseline-confirmation',
    );

    expect(scenario?.scopeConfirmation?.targets.map(({ id }) => id)).toEqual([
      'profile-name',
      'whole-team',
      'current-only-linus',
    ]);
    expect(scenario?.scopeConfirmation?.targets[2]?.scope).toEqual({
      id: 'current-only-linus',
      paths: [{ collectionPath: ['team'], itemId: 'linus' }],
    });
    expect(Object.isFrozen(scenario?.scopeConfirmation)).toBe(true);
    expect(Object.isFrozen(scenario?.scopeConfirmation?.targets)).toBe(true);
    expect(
      Object.isFrozen(scenario?.scopeConfirmation?.targets[0]?.scope.paths),
    ).toBe(true);
  });

  it('publishes one deeply frozen direct/nested M31 scenario with neutral evidence', () => {
    const scenario = referenceScenarios.find(
      ({ id }) => id === 'string-enum-array',
    );
    if (scenario === undefined) throw new Error('M31 scenario missing.');
    const compiled = compileFormDefinition(scenario.compileInput);
    expect(compiled.success).toBe(true);
    if (!compiled.success) return;

    expect(
      compiled.definition.fields.flatMap((field) =>
        field.kind === 'string-enum-array'
          ? [
              {
                path: field.path,
                required: field.required,
                values: field.choices.map(({ value }) => value),
                labels: field.choices.map(({ label }) => label),
              },
            ]
          : [],
      ),
    ).toEqual([
      {
        path: ['roles'],
        required: false,
        values: ['', ' ', 'reader', 'editor', 'reviewer', '💡'],
        labels: [
          '(empty string)',
          '(single space)',
          'Reader',
          'Editor',
          'Reviewer',
          'Idea',
        ],
      },
      {
        path: ['profile', 'channels'],
        required: true,
        values: ['', ' ', 'reader', 'editor', 'reviewer', '💡'],
        labels: [
          '(empty string)',
          '(single space)',
          'Reader',
          'Editor',
          'Reviewer',
          'Idea',
        ],
      },
    ]);
    expect(
      compiled.definition.fields.find(({ name }) => name === 'note'),
    ).toMatchObject({
      visibleWhen: { sourcePath: ['showNote'], equals: true },
    });
    expect(Object.isFrozen(scenario)).toBe(true);
    expect(Object.isFrozen(scenario.compileInput.schema)).toBe(true);
    expect(Object.isFrozen(scenario.compileInput.uiSchema)).toBe(true);
    expect(Object.isFrozen(scenario.transitions)).toBe(true);
    expect(Object.isFrozen(scenario.explanation)).toBe(true);
    expect(Object.isFrozen(scenario.initialState.value)).toBe(true);
    expect(Object.isFrozen(scenario.initialState.baselineValue)).toBe(true);
    expect(stringEnumArrayControlStates.map(({ id }) => id)).toEqual([
      'duplicate',
      'unknown',
      'non-string',
      'sparse',
    ]);
    expect(Object.isFrozen(stringEnumArrayControlStates)).toBe(true);
    expect(
      stringEnumArrayControlStates.every(
        ({ value }) =>
          Object.isFrozen(value) &&
          Object.isFrozen(
            (value as { readonly roles: readonly unknown[] }).roles,
          ),
      ),
    ).toBe(true);
    const sparse = stringEnumArrayControlStates[3]?.value as
      { readonly roles: readonly unknown[] } | undefined;
    expect(sparse?.roles).toHaveLength(2);
    expect(Object.hasOwn(sparse?.roles ?? [], 1)).toBe(false);
  });

  it('publishes the exact frozen conditional scenario without target logic', () => {
    const scenario = referenceScenarios.find(
      ({ id }) => id === 'conditional-field-state',
    );
    if (scenario === undefined)
      throw new Error('Conditional scenario missing.');
    const compiled = compileFormDefinition(scenario.compileInput);
    expect(compiled.success).toBe(true);
    if (!compiled.success) return;

    expect(Object.isFrozen(scenario)).toBe(true);
    expect(Object.isFrozen(scenario.compileInput.uiSchema)).toBe(true);
    expect(Object.isFrozen(scenario.initialState.value)).toBe(true);
    expectDeepFrozen(scenario.compileInput.uiSchema);
    expect(
      compiled.definition.fields.flatMap((field) => {
        if (field.kind === 'string-enum-array') return [];
        const { name, visibleWhen, enabledWhen } = field;
        return visibleWhen === undefined && enabledWhen === undefined
          ? []
          : [
              {
                name,
                ...(visibleWhen === undefined ? {} : { visibleWhen }),
                ...(enabledWhen === undefined ? {} : { enabledWhen }),
              },
            ];
      }),
    ).toMatchObject([
      {
        name: 'driver',
        visibleWhen: { sourcePath: ['showDriver'], equals: true },
      },
      {
        name: 'displayName',
        visibleWhen: {
          operator: 'all',
          conditions: [
            { sourcePath: ['showDetails'], equals: true },
            { sourcePath: ['nullableGate'], equals: null },
            { sourcePath: ['zeroGate'], equals: 0 },
            { sourcePath: ['emptyGate'], equals: '' },
            { sourcePath: ['driver'], equals: false },
          ],
        },
      },
      {
        name: 'role',
        enabledWhen: {
          operator: 'any',
          conditions: [
            { sourcePath: ['enableRole'], equals: true },
            { sourcePath: ['profile', 'flag'], equals: true },
          ],
        },
      },
      {
        name: 'nullableNote',
        visibleWhen: { sourcePath: ['nullableGate'], equals: null },
      },
      {
        name: 'zeroNote',
        visibleWhen: { sourcePath: ['zeroGate'], equals: 0 },
      },
      {
        name: 'emptyNote',
        enabledWhen: { sourcePath: ['emptyGate'], equals: '' },
      },
      {
        name: 'drivenNote',
        visibleWhen: { sourcePath: ['driver'], equals: false },
      },
      {
        name: 'reviewCode',
        visibleWhen: {
          operator: 'all',
          conditions: [
            { sourcePath: ['showDetails'], equals: true },
            { sourcePath: ['nullableGate'], equals: null },
          ],
        },
      },
      {
        name: 'note',
        visibleWhen: {
          operator: 'all',
          conditions: [
            { sourcePath: ['profile', 'flag'], equals: false },
            { sourcePath: ['zeroGate'], equals: 0 },
          ],
        },
      },
    ]);

    const created = createControlledFormRuntime({
      formId: 'reference-conditional-field-state',
      definition: compiled.definition,
      schema: scenario.compileInput.schema,
      value: scenario.initialState.value,
      baselineValue: scenario.initialState.baselineValue,
      locale: scenario.initialState.locale,
      validationVisibility: scenario.initialState.validationVisibility,
      validator: scenario.validator,
    });
    expect(created.success).toBe(true);
    if (!created.success) return;
    const runtime = created.runtime;
    const field = (name: string) =>
      runtime
        .getSnapshot()
        .fields.find(({ path }) => path.length === 1 && path[0] === name);
    expect(
      ['nullableNote', 'zeroNote', 'emptyNote', 'drivenNote'].map((name) => ({
        name,
        visible: field(name)?.visible,
        enabled: field(name)?.enabled,
      })),
    ).toEqual([
      { name: 'nullableNote', visible: true, enabled: true },
      { name: 'zeroNote', visible: true, enabled: true },
      { name: 'emptyNote', visible: true, enabled: true },
      { name: 'drivenNote', visible: true, enabled: true },
    ]);
    runtime.focus(['displayName']);
    runtime.updateExternalState({
      value: {
        ...scenario.initialState.value,
        showDetails: false,
        enableRole: false,
        showDriver: false,
        reviewCode: 'needs-review',
      },
    });
    expect(field('displayName')).toMatchObject({
      visible: false,
      focused: false,
      touched: false,
    });
    expect(field('role')?.enabled).toBe(false);
    expect(field('driver')).toMatchObject({
      visible: false,
      presence: { kind: 'value', value: false },
    });
    expect(field('drivenNote')?.visible).toBe(true);
    expect(runtime.getFieldSnapshot(['profile', 'note'])?.visible).toBe(true);
    expect(field('reviewCode')).toMatchObject({ visible: false, valid: false });
    expect(
      runtime.getValidationSnapshot({
        id: 'conditional-targets',
        paths: [['displayName'], ['reviewCode']],
      }),
    ).toMatchObject({
      valid: false,
      issues: [{ code: 'review-code', path: ['reviewCode'] }],
    });
    expect(runtime.requestSetValue(['displayName'], 'stale')).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INACTIVE_RUNTIME_FIELD',
          parameters: { action: 'requestSetValue', reason: 'hidden' },
        },
      ],
    });
    expect(runtime.requestSetValue(['role'], 'admin')).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INACTIVE_RUNTIME_FIELD',
          parameters: { action: 'requestSetValue', reason: 'disabled' },
        },
      ],
    });
    expect(runtime.getSnapshot()).toMatchObject({ valid: false, dirty: true });
    expect(scenario.initialState.baselineValue).toEqual(
      scenario.initialState.value,
    );
    runtime.dispose();
  });

  it('publishes one authoring-safe composed object scenario with combined evidence', () => {
    const scenario = referenceScenarios.find(
      ({ id }) => id === 'object-composition',
    );
    if (scenario === undefined) throw new Error('Composed scenario missing.');
    const schema = scenario.compileInput.schema as {
      readonly allOf: readonly unknown[];
    };
    const uiSchema = scenario.compileInput.uiSchema as {
      readonly order: readonly string[];
    };

    expect(schema.allOf).toEqual([
      { $ref: '#/$defs/identity' },
      expect.objectContaining({
        type: 'object',
        required: ['department'],
      }),
    ]);
    expect(uiSchema.order).toEqual([
      'department',
      'displayName',
      'contactEmail',
      'active',
    ]);
    const compiled = compileFormDefinition(scenario.compileInput);
    expect(compiled.success).toBe(true);
    if (!compiled.success) return;
    expect(
      compiled.definition.fields.map(({ name, required }) => ({
        name,
        required,
      })),
    ).toEqual([
      { name: 'department', required: true },
      { name: 'displayName', required: true },
      { name: 'contactEmail', required: false },
      { name: 'active', required: false },
    ]);
    expect(compiled.diagnostics).toEqual([]);
    expect(
      scenario.validator.validate(scenario.compileInput.schema, {
        ...scenario.initialState.value,
        displayName: 'A',
        department: 'R',
      }),
    ).toEqual({
      valid: false,
      issues: [
        expect.objectContaining({
          code: 'display-name-length',
          path: ['displayName'],
        }),
        expect.objectContaining({
          code: 'department-length',
          path: ['department'],
        }),
      ],
    });
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

function expectDeepFrozen(value: unknown): void {
  if (typeof value !== 'object' || value === null) return;
  expect(Object.isFrozen(value)).toBe(true);
  for (const key of Object.keys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor !== undefined && 'value' in descriptor) {
      expectDeepFrozen(descriptor.value as unknown);
    }
  }
}
