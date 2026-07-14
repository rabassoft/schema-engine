import { describe, expect, it } from 'vitest';

import { compileFormDefinition } from '../src/index.js';

const DIALECT = 'https://json-schema.org/draft/2020-12/schema';

describe('nested object compiler', () => {
  it('normalizes structural order and preserves the depth-first leaf projection', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: DIALECT,
        type: 'object',
        properties: {
          active: { type: 'boolean' },
          address: {
            type: 'object',
            title: 'Address',
            properties: {
              zip: { type: 'integer', minimum: 0 },
              street: { type: 'string', enum: ['main', 'side'] },
              line2: { type: 'string' },
              latitude: { type: 'number', minimum: -90, maximum: 90 },
            },
            required: ['street'],
          },
        },
      },
      uiSchema: {
        order: ['address', 'active'],
        fields: {
          address: {
            label: 'Postal address',
            order: ['street'],
            fields: {
              street: { enumLabels: { main: 'Main road' } },
            },
          },
        },
      },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.diagnostics).toEqual([]);
    const [address, active] = result.definition.nodes;
    expect(address).toMatchObject({
      kind: 'object',
      key: '["address"]',
      path: ['address'],
      label: 'Postal address',
    });
    if (address?.kind !== 'object') return;
    expect(address.children.map(({ name }) => name)).toEqual([
      'street',
      'zip',
      'line2',
      'latitude',
    ]);
    expect(address.children[0]).toMatchObject({
      path: ['address', 'street'],
      required: true,
      choices: [
        { value: 'main', label: 'Main road' },
        { value: 'side', label: 'side' },
      ],
    });
    expect(result.definition.fields).toEqual([
      address.children[0],
      address.children[1],
      address.children[2],
      address.children[3],
      active,
    ]);
    expect(result.definition.fields[0]).toBe(address.children[0]);
    expect(address.children[2]).toMatchObject({
      kind: 'string',
      path: ['address', 'line2'],
    });
    expect(address.children[3]).toMatchObject({
      kind: 'number',
      numericType: 'number',
      path: ['address', 'latitude'],
    });
    expect(Object.isFrozen(address.children)).toBe(true);
  });

  it('detects active schema cycles but permits shared sibling schemas', () => {
    const cyclic: Record<string, unknown> = {
      type: 'object',
      properties: {},
    };
    (cyclic.properties as Record<string, unknown>).self = cyclic;
    const cycleResult = compileFormDefinition({
      schema: {
        $schema: DIALECT,
        type: 'object',
        properties: { branch: cyclic },
      },
    });
    expect(cycleResult).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'CYCLIC_SCHEMA_OBJECT',
          dataPath: ['branch', 'self'],
          documentPath: ['properties', 'branch', 'properties', 'self'],
          parameters: { firstDocumentPath: ['properties', 'branch'] },
        },
      ],
    });

    const shared = {
      type: 'object',
      properties: { value: { type: 'string' } },
    };
    const sharedResult = compileFormDefinition({
      schema: {
        $schema: DIALECT,
        type: 'object',
        properties: { left: shared, right: shared },
      },
    });
    expect(sharedResult.success).toBe(true);
    if (sharedResult.success) {
      expect(sharedResult.definition.fields.map(({ path }) => path)).toEqual([
        ['left', 'value'],
        ['right', 'value'],
      ]);
    }
  });

  it('detects UI ancestry cycles without executing accessors', () => {
    let getterCalls = 0;
    const branchUi: Record<string, unknown> = { fields: {} };
    (branchUi.fields as Record<string, unknown>).child = branchUi;
    Object.defineProperty(branchUi, 'tooltip', {
      enumerable: true,
      get() {
        getterCalls += 1;
        return 'unsafe';
      },
    });
    const result = compileFormDefinition({
      schema: {
        $schema: DIALECT,
        type: 'object',
        properties: {
          branch: {
            type: 'object',
            properties: { child: { type: 'object', properties: {} } },
          },
        },
      },
      uiSchema: { fields: { branch: branchUi } },
    });
    expect(getterCalls).toBe(0);
    expect(result.success).toBe(false);
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'INVALID_UI_SCHEMA_VALUE',
          dataPath: ['branch'],
          documentPath: ['fields', 'branch', 'tooltip'],
        }),
        expect.objectContaining({
          code: 'CYCLIC_UI_SCHEMA_OBJECT',
          dataPath: ['branch', 'child'],
          parameters: { firstDocumentPath: ['fields', 'branch'] },
        }),
      ]),
    );
    expect(
      result.diagnostics.find(({ code }) => code === 'INVALID_UI_SCHEMA_VALUE')
        ?.parameters,
    ).toMatchObject({ actualType: 'accessor' });
  });

  it('emits structural UI incompatibilities in the specified node order', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: DIALECT,
        type: 'object',
        properties: {
          group: {
            type: 'object',
            properties: { leaf: { type: 'string' } },
          },
        },
      },
      uiSchema: {
        fields: {
          group: {
            placeholder: 'invalid',
            enumLabels: {},
            options: { decimalPlaces: 2, showTrailingZeros: true },
            fields: { leaf: { order: [], fields: {} } },
          },
        },
      },
    });
    expect(result.success).toBe(true);
    expect(
      result.diagnostics.map(({ code, documentPath, parameters }) => ({
        code,
        documentPath,
        option: parameters.option,
        reason: parameters.reason,
      })),
    ).toEqual([
      {
        code: 'INCOMPATIBLE_PLACEHOLDER',
        documentPath: ['fields', 'group', 'placeholder'],
        option: undefined,
        reason: undefined,
      },
      {
        code: 'INCOMPATIBLE_UI_OPTION',
        documentPath: ['fields', 'group', 'enumLabels'],
        option: 'enumLabels',
        reason: 'object-node',
      },
      {
        code: 'INCOMPATIBLE_UI_OPTION',
        documentPath: ['fields', 'group', 'options', 'decimalPlaces'],
        option: 'decimalPlaces',
        reason: 'object-node',
      },
      {
        code: 'INCOMPATIBLE_UI_OPTION',
        documentPath: ['fields', 'group', 'options', 'showTrailingZeros'],
        option: 'showTrailingZeros',
        reason: 'object-node',
      },
      {
        code: 'INCOMPATIBLE_UI_OPTION',
        documentPath: ['fields', 'group', 'fields', 'leaf', 'order'],
        option: 'order',
        reason: 'leaf-node',
      },
      {
        code: 'INCOMPATIBLE_UI_OPTION',
        documentPath: ['fields', 'group', 'fields', 'leaf', 'fields'],
        option: 'fields',
        reason: 'leaf-node',
      },
    ]);
  });

  it('supports deep finite schemas without recursive calls', () => {
    const depth = 1_500;
    let child: Record<string, unknown> = { type: 'string' };
    for (let index = depth - 1; index >= 0; index -= 1) {
      child = { type: 'object', properties: { [`level-${index}`]: child } };
    }
    const result = compileFormDefinition({
      schema: {
        $schema: DIALECT,
        type: 'object',
        properties: { root: child },
      },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.definition.fields).toHaveLength(1);
    expect(result.definition.fields[0]?.path).toHaveLength(depth + 1);
  });
});
