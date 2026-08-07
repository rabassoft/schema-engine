import { describe, expect, it, vi } from 'vitest';
import {
  compileFormDefinition,
  createControlledFormRuntime,
  type FormOperation,
} from '../src/index.js';

const schema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: {
    mode: { type: 'string' },
    guarded: { type: 'string' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
        required: ['id', 'name'],
      },
    },
  },
  required: ['mode', 'guarded', 'items'],
} as const;

const compiled = compileFormDefinition({
  schema,
  uiSchema: {
    fields: {
      guarded: { visibleWhen: { path: ['mode'], equals: 'show' } },
    },
    presentation: [
      {
        kind: 'wizard',
        id: 'invariants',
        label: 'Invariants',
        steps: [
          {
            kind: 'wizard-step',
            id: 'details',
            label: 'Details',
            children: ['mode', 'guarded'],
          },
          {
            kind: 'wizard-step',
            id: 'collection',
            label: 'Collection',
            children: ['items'],
          },
        ],
      },
    ],
  },
  collectionPolicies: [{ path: ['items'], itemIdentityProperty: 'id' }],
});
if (!compiled.success)
  throw new Error('Invariant wizard fixture must compile.');

async function flushAsync(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

describe('M34 wizard core state invariants', () => {
  it('changes only wizard protocol state across every accepted wizard action', () => {
    const item = { id: 'item-1', name: 'One' };
    const value = { mode: 'show', guarded: 'current', items: [item] };
    const baselineValue = {
      mode: 'show',
      guarded: 'baseline',
      items: [item],
    };
    const runtimeSchema = { type: 'object' } as const;
    const validate = vi.fn(
      (receivedSchema: unknown, receivedValue: unknown) => {
        expect(receivedSchema).toBe(runtimeSchema);
        expect(receivedValue).toBe(value);
        return { valid: true, issues: [] };
      },
    );
    const created = createControlledFormRuntime({
      formId: 'wizard-invariants',
      definition: compiled.definition,
      schema: runtimeSchema,
      value,
      baselineValue,
      locale: 'en',
      wizardState: { selectedStepId: 'details' },
      validator: { validate },
    });
    expect(created.success).toBe(true);
    if (!created.success) return;
    const runtime = created.runtime;
    const operations: FormOperation[] = [];
    runtime.subscribeOperations((operation) => operations.push(operation));
    runtime.focus(['guarded']);
    runtime.blur(['guarded']);

    const before = runtime.getSnapshot();
    const beforeField = runtime.getFieldSnapshot(['guarded']);
    const beforeItem = runtime.getItemSnapshot({
      collectionPath: ['items'],
      itemId: 'item-1',
    });
    const internals = runtime as unknown as {
      baseline: unknown;
      conditionState: unknown;
      nextOperationId: number;
    };
    const baselineIdentity = internals.baseline;
    const conditionIdentity = internals.conditionState;
    const itemsIdentity = value.items;
    const valueImage = structuredClone(value);
    const baselineImage = structuredClone(baselineValue);

    expect(runtime.requestWizardNext().effects.intentionEmitted).toBe(true);
    expect(runtime.requestWizardPrevious().success).toBe(false);
    expect(runtime.rejectWizardIntention(1).success).toBe(true);
    expect(runtime.requestWizardNext().effects.intentionEmitted).toBe(true);
    expect(
      runtime.updateExternalState({
        wizardSelection: { requestId: 2, selectedStepId: 'collection' },
      }).success,
    ).toBe(true);
    expect(runtime.requestWizardPrevious().effects.intentionEmitted).toBe(true);
    expect(runtime.rejectWizardIntention(3).success).toBe(true);
    expect(runtime.requestWizardComplete().effects.intentionEmitted).toBe(true);

    const after = runtime.getSnapshot();
    expect(after.value).toBe(value);
    expect(after.value).toEqual(valueImage);
    expect(internals.baseline).toBe(baselineIdentity);
    expect(internals.baseline).toEqual(baselineImage);
    expect(after.dirty).toBe(before.dirty);
    expect(after.validationVisibility).toBe(before.validationVisibility);
    expect(runtime.getFieldSnapshot(['guarded'])).toBe(beforeField);
    expect(runtime.getFieldSnapshot(['guarded'])).toMatchObject({
      dirty: true,
      touched: true,
      visible: true,
      enabled: true,
    });
    expect(
      runtime.getItemSnapshot({
        collectionPath: ['items'],
        itemId: 'item-1',
      }),
    ).toBe(beforeItem);
    expect(value.items).toBe(itemsIdentity);
    expect(value.items).toEqual(valueImage.items);
    expect(value.items[0]).toBe(item);
    expect(internals.conditionState).toBe(conditionIdentity);
    expect(internals.nextOperationId).toBe(1);
    expect(validate).toHaveBeenCalledTimes(1);
    expect(operations).toEqual([]);
  });

  it('uses the existing invalid validation result without invoking validation again', () => {
    const value = { mode: 'show', guarded: '', items: [] };
    const validate = vi.fn(() => ({
      valid: false,
      issues: [{ code: 'required', path: ['guarded'], parameters: {} }],
    }));
    const created = createControlledFormRuntime({
      formId: 'wizard-invalid-invariant',
      definition: compiled.definition,
      schema: { type: 'object' },
      value,
      baselineValue: value,
      locale: 'en',
      wizardState: { selectedStepId: 'details' },
      validator: { validate },
    });
    expect(created.success).toBe(true);
    if (!created.success) return;
    expect(created.runtime.requestWizardNext()).toMatchObject({
      success: true,
      effects: { intentionEmitted: false },
    });
    expect(validate).toHaveBeenCalledTimes(1);
  });

  it('consumes settled async validation without invoking or retrying it', async () => {
    const value = {
      mode: 'show',
      guarded: 'current',
      items: [{ id: 'item-1', name: 'One' }],
    };
    const syncValidate = vi.fn(() => ({ valid: true, issues: [] }));
    const asyncValidate = vi.fn(() =>
      Promise.resolve({ valid: true, issues: [] }),
    );
    const created = createControlledFormRuntime({
      formId: 'wizard-async-invariant',
      definition: compiled.definition,
      schema: { type: 'object' },
      value,
      baselineValue: value,
      locale: 'en',
      wizardState: { selectedStepId: 'details' },
      validator: { validate: syncValidate },
      asyncValidator: { validate: asyncValidate },
    });
    expect(created.success).toBe(true);
    if (!created.success) return;
    await flushAsync();
    expect(created.runtime.requestWizardNext().effects.intentionEmitted).toBe(
      true,
    );
    created.runtime.updateExternalState({
      wizardSelection: { requestId: 1, selectedStepId: 'collection' },
    });
    expect(
      created.runtime.requestWizardComplete().effects.intentionEmitted,
    ).toBe(true);
    expect(syncValidate).toHaveBeenCalledTimes(1);
    expect(asyncValidate).toHaveBeenCalledTimes(1);
  });
});
