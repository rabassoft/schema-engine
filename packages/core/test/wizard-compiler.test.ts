import { describe, expect, it, vi } from 'vitest';
import {
  compileFormDefinition,
  createControlledFormRuntime,
  type ControlledWizardState,
  type RootPresentationEntryDefinition,
  type UiRootPresentationEntry,
  type UiWizardSchema,
  type UiWizardStepSchema,
  type WizardActionResult,
  type WizardDefinition,
  type WizardIntention,
  type WizardIntentionListener,
  type WizardRuntimeSnapshot,
  type WizardSelectionConfirmation,
  type WizardStepDefinition,
  type WizardStepProgress,
  type WizardStepSnapshot,
  type WizardStepValidationSnapshot,
  type WizardStepValidationState,
  type WizardTextMember,
  type WizardTextResolutionContext,
} from '../src/index.js';
import { validateCollectionFormDefinition } from '../src/internal/nested-definition.js';

const schema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: {
    profile: {
      type: 'object',
      properties: { name: { type: 'string' } },
    },
    active: { type: 'boolean' },
    age: { type: 'integer' },
  },
} as const;

function wizardUi(): {
  readonly presentation: readonly UiRootPresentationEntry[];
} {
  const steps: readonly UiWizardStepSchema[] = [
    {
      kind: 'wizard-step',
      id: 'identity',
      label: 'Identity',
      children: [
        {
          kind: 'section',
          id: 'profile-section',
          label: 'Profile',
          children: ['profile'],
        },
      ],
    },
    {
      kind: 'wizard-step',
      id: 'status',
      label: 'Status',
      children: ['active'],
    },
    {
      kind: 'wizard-step',
      id: 'details',
      label: 'Details',
      children: ['age'],
    },
  ];
  const wizard: UiWizardSchema = {
    kind: 'wizard',
    id: 'onboarding',
    label: 'Onboarding',
    steps,
  };
  return { presentation: [wizard] };
}

describe('M34 checkpoint 1 wizard definitions and compiler', () => {
  it('exports the exact public declaration families as usable types', () => {
    const state: ControlledWizardState = { selectedStepId: 'identity' };
    const confirmation: WizardSelectionConfirmation = {
      requestId: 1,
      selectedStepId: 'status',
    };
    const intention: WizardIntention = {
      kind: 'next',
      requestId: 1,
      wizardKey: '["wizard","onboarding"]',
      fromStepId: 'identity',
      toStepId: 'status',
    };
    const listener: WizardIntentionListener = () => undefined;
    const validationState: WizardStepValidationState = 'provisional';
    const progress: WizardStepProgress = 'visited';
    const textMember: WizardTextMember = 'pending-validation';
    const compileOnly: readonly unknown[] = [
      state,
      confirmation,
      intention,
      listener,
      validationState,
      progress,
      textMember,
    ] satisfies readonly (
      | ControlledWizardState
      | WizardSelectionConfirmation
      | WizardIntention
      | WizardIntentionListener
      | WizardStepValidationState
      | WizardStepProgress
      | WizardTextMember
      | WizardActionResult
      | WizardRuntimeSnapshot
      | WizardStepSnapshot
      | WizardStepValidationSnapshot
      | WizardTextResolutionContext
      | WizardDefinition
      | WizardStepDefinition
      | RootPresentationEntryDefinition
    )[];
    expect(compileOnly).toHaveLength(7);
  });

  it('normalizes one root wizard with exact keys, ownership, scopes and freezing', () => {
    const result = compileFormDefinition({ schema, uiSchema: wizardUi() });
    expect(result.success).toBe(true);
    if (!result.success) return;
    const wizard = result.definition.presentation[0];
    expect(wizard).toMatchObject({
      kind: 'wizard',
      id: 'onboarding',
      key: '["wizard","onboarding"]',
      label: 'Onboarding',
    });
    if (wizard?.kind !== 'wizard') return;
    expect(
      wizard.steps.map(({ id, key, scope }) => ({ id, key, scope })),
    ).toEqual([
      {
        id: 'identity',
        key: '["wizard","onboarding","step","identity"]',
        scope: {
          id: '["wizard","onboarding","step","identity","scope"]',
          paths: [['profile']],
          includeGlobalIssues: false,
        },
      },
      {
        id: 'status',
        key: '["wizard","onboarding","step","status"]',
        scope: {
          id: '["wizard","onboarding","step","status","scope"]',
          paths: [['active']],
          includeGlobalIssues: false,
        },
      },
      {
        id: 'details',
        key: '["wizard","onboarding","step","details"]',
        scope: {
          id: '["wizard","onboarding","step","details","scope"]',
          paths: [['age']],
          includeGlobalIssues: false,
        },
      },
    ]);
    expect(wizard.completionScope).toEqual({
      id: '["wizard","onboarding","completion","scope"]',
      paths: [['profile'], ['active'], ['age']],
      includeGlobalIssues: true,
    });
    expect(wizard.steps[0]?.children[0]?.kind).toBe('section');
    expect(validateCollectionFormDefinition(result.definition)).toEqual({
      success: true,
    });
    expect(Object.isFrozen(wizard)).toBe(true);
    expect(Object.isFrozen(wizard.steps)).toBe(true);
    expect(Object.isFrozen(wizard.steps[0]?.scope.paths[0])).toBe(true);
  });

  it.each([
    {
      reason: 'wizard-not-sole-root',
      presentation: [wizardUi().presentation[0], 'active'],
    },
    {
      reason: 'invalid-wizard-kind',
      presentation: [
        {
          kind: 'steps-container',
          id: 'w',
          label: 'W',
          steps: [
            { kind: 'wizard-step', id: 'a', label: 'A', children: ['profile'] },
            {
              kind: 'wizard-step',
              id: 'b',
              label: 'B',
              children: ['active', 'age'],
            },
          ],
        },
      ],
    },
    {
      reason: 'invalid-wizard-steps',
      presentation: [{ kind: 'wizard', id: 'w', label: 'W', steps: [] }],
    },
    {
      reason: 'duplicate-wizard-step-id',
      presentation: [
        {
          kind: 'wizard',
          id: 'w',
          label: 'W',
          steps: [
            {
              kind: 'wizard-step',
              id: 'same',
              label: 'A',
              children: ['profile'],
            },
            {
              kind: 'wizard-step',
              id: 'same',
              label: 'B',
              children: ['active', 'age'],
            },
          ],
        },
      ],
    },
    {
      reason: 'invalid-wizard-membership',
      presentation: [
        {
          kind: 'wizard',
          id: 'w',
          label: 'W',
          steps: [
            { kind: 'wizard-step', id: 'a', label: 'A', children: ['profile'] },
            { kind: 'wizard-step', id: 'b', label: 'B', children: ['active'] },
          ],
        },
      ],
    },
  ])('falls back atomically for $reason', ({ reason, presentation }) => {
    const result = compileFormDefinition({
      schema,
      uiSchema: { presentation },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(
      result.diagnostics.some(
        (diagnostic) =>
          diagnostic.code === 'INVALID_UI_PRESENTATION' &&
          diagnostic.parameters['reason'] === reason,
      ),
    ).toBe(true);
    expect(
      result.definition.presentation.every(({ kind }) => kind === 'form-node'),
    ).toBe(true);
  });

  it('validates recomputed scopes before runtime validator effects', () => {
    const compiled = compileFormDefinition({ schema, uiSchema: wizardUi() });
    expect(compiled.success).toBe(true);
    if (!compiled.success) return;
    const wizard = compiled.definition.presentation[0];
    if (wizard?.kind !== 'wizard') return;
    const invalid = {
      ...compiled.definition,
      presentation: [
        {
          ...wizard,
          steps: [
            {
              ...wizard.steps[0],
              scope: { ...wizard.steps[0]?.scope, paths: [['age']] },
            },
            ...wizard.steps.slice(1),
          ],
        },
      ],
    };
    expect(validateCollectionFormDefinition(invalid)).toMatchObject({
      success: false,
      defect: { reason: 'invalid-wizard-scope', wizardStepIndex: 0 },
    });

    const validate = vi.fn(() => ({ valid: true, issues: [] }));
    const created = createControlledFormRuntime({
      formId: 'wizard-form',
      definition: compiled.definition,
      schema,
      value: { profile: { name: '' }, active: false, age: 0 },
      baselineValue: { profile: { name: '' }, active: false, age: 0 },
      locale: 'en',
      validator: { validate },
      wizardState: { selectedStepId: 'identity' },
    });
    expect(created.success).toBe(true);
    expect(validate).toHaveBeenCalledOnce();
    if (!created.success) return;
    expect(created.runtime.getSnapshot().wizard).toMatchObject({
      selectedStepId: 'identity',
      controls: { previous: false, next: true, complete: false },
      steps: [
        { visited: true, attempted: false, progress: 'visited' },
        { visited: false, attempted: false, progress: 'unvisited' },
        { visited: false, attempted: false, progress: 'unvisited' },
      ],
    });
  });

  it('preserves ordinary root presentation assignability and behavior', () => {
    const ordinary: readonly UiRootPresentationEntry[] = [
      'profile',
      'active',
      'age',
    ];
    const result = compileFormDefinition({
      schema,
      uiSchema: { presentation: ordinary },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.definition.presentation.map(({ kind }) => kind)).toEqual([
      'form-node',
      'form-node',
      'form-node',
    ]);
  });
});
