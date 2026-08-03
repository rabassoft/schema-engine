import { describe, expect, it, vi } from 'vitest';
import {
  applyFormOperation,
  createControlledFormRuntime,
  type FormOperation,
} from '../src/index.js';
import {
  collectCollectionFormDefinitionDefects,
  validateCollectionFormDefinition,
} from '../src/internal/nested-definition.js';

const metadata = { id: 1, formId: 'conditional-definition' } as const;

function field(
  name: string,
  kind: 'string' | 'number' | 'integer' | 'boolean' = 'string',
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  const path = [name];
  return {
    key: JSON.stringify(path),
    name,
    path,
    required: false,
    label: name,
    kind: kind === 'integer' ? 'number' : kind,
    nullable: false,
    ...(kind === 'string' ? { constraints: {} } : {}),
    ...(kind === 'number' || kind === 'integer'
      ? { numericType: kind, constraints: {}, ui: {} }
      : {}),
    ...overrides,
  };
}

function definition(nodes: object[], fields = nodes): Record<string, unknown> {
  return {
    nodes,
    fields,
    presentation: nodes.map((node) => ({ kind: 'form-node', node })),
  };
}

function setTarget(value: unknown = 'next'): FormOperation {
  return {
    type: 'set-value',
    metadata,
    path: ['target'],
    expected: { kind: 'missing' },
    value,
    source: 'user',
  };
}

function runtimeOptions(
  manualDefinition: Record<string, unknown>,
  value: Record<string, unknown> = {},
  validate = vi.fn(() => ({ valid: true, issues: [] })),
) {
  return {
    formId: 'conditional-definition',
    definition: manualDefinition,
    schema: { type: 'object' },
    value,
    baselineValue: {},
    locale: 'en',
    validator: { validate },
  } as never;
}

function template(name = 'value'): Record<string, unknown> {
  return {
    key: JSON.stringify(['template', ['rows'], [name]]),
    name,
    relativePath: [name],
    required: false,
    label: name,
    kind: 'string',
    nullable: false,
    constraints: {},
  };
}

function collectionDefinition(
  itemFields: Record<string, unknown>[],
  target?: Record<string, unknown>,
): Record<string, unknown> {
  const collection = {
    key: JSON.stringify(['rows']),
    name: 'rows',
    path: ['rows'],
    required: false,
    label: 'rows',
    kind: 'array',
    identity: { property: 'id' },
    item: {
      kind: 'item-template',
      children: itemFields,
      fields: itemFields,
      presentation: itemFields.map((node) => ({ kind: 'form-node', node })),
    },
  };
  const nodes = target === undefined ? [collection] : [collection, target];
  return definition(nodes, target === undefined ? [] : [target]);
}

describe('M30 manual field-condition definition contract', () => {
  it('accepts detached direct conditions, self links and strict literal variants', () => {
    const source = field('source', 'boolean');
    const count = field('count', 'number');
    const target = field('target', 'string', {
      visibleWhen: { sourcePath: ['source'], equals: false },
      enabledWhen: { sourcePath: ['count'], equals: -0 },
    });
    const manual = definition([source, count, target]);

    expect(validateCollectionFormDefinition(manual)).toEqual({ success: true });
    expect(
      validateCollectionFormDefinition(
        definition([
          field('target', 'string', {
            visibleWhen: { sourcePath: ['target'], equals: '' },
          }),
        ]),
      ),
    ).toEqual({ success: true });

    const fixed = field('fixed', 'string', { fixedValue: 'fixed' });
    Object.defineProperty(fixed, 'visibleWhen', {
      enumerable: false,
      value: { sourcePath: ['fixed'], equals: 'fixed' },
    });
    expect(validateCollectionFormDefinition(definition([fixed]))).toEqual({
      success: true,
    });
  });

  it('reports exact hostile shape metadata without invoking accessors', () => {
    const getter = vi.fn(() => ({ sourcePath: ['source'], equals: '' }));
    const target = field('target');
    Object.defineProperty(target, 'visibleWhen', { get: getter });
    expect(validateCollectionFormDefinition(definition([target]))).toEqual({
      success: false,
      defect: {
        reason: 'invalid-field-condition',
        nodeIndexPath: [0],
        path: ['target'],
        conditionMember: 'visibleWhen',
        conditionReason: 'member-accessor',
        conditionExpected: 'condition object',
      },
    });
    expect(getter).not.toHaveBeenCalled();

    const sparsePath = new Array<string>(1);
    const sparse = field('target', 'string', {
      visibleWhen: { sourcePath: sparsePath, equals: '' },
    });
    expect(validateCollectionFormDefinition(definition([sparse]))).toEqual({
      success: false,
      defect: {
        reason: 'invalid-field-condition',
        nodeIndexPath: [0],
        path: ['target'],
        conditionMember: 'visibleWhen',
        conditionReason: 'member-invalid',
        conditionDetailMember: 'sourcePath',
        conditionExpected: 'string path segment',
        conditionIndex: 0,
      },
    });
  });

  it.each([
    [
      'non-object',
      (): unknown => null,
      {
        conditionReason: 'not-object',
        conditionExpected: 'condition object',
        conditionActualType: 'null',
      },
    ],
    [
      'missing sourcePath',
      (): unknown => ({ equals: '' }),
      {
        conditionReason: 'member-missing',
        conditionDetailMember: 'sourcePath',
        conditionExpected: 'non-empty dense string path',
      },
    ],
    [
      'non-array sourcePath',
      (): unknown => ({ sourcePath: 'source', equals: '' }),
      {
        conditionReason: 'member-invalid',
        conditionDetailMember: 'sourcePath',
        conditionActualType: 'string',
      },
    ],
    [
      'empty sourcePath',
      (): unknown => ({ sourcePath: [], equals: '' }),
      {
        conditionReason: 'member-invalid',
        conditionDetailMember: 'sourcePath',
        conditionActualType: 'array',
        conditionActualLength: 0,
      },
    ],
    [
      'non-string index',
      (): unknown => ({ sourcePath: [1], equals: '' }),
      {
        conditionReason: 'member-invalid',
        conditionDetailMember: 'sourcePath',
        conditionActualType: 'number',
        conditionIndex: 0,
      },
    ],
    [
      'extra path key',
      (): unknown => ({
        sourcePath: Object.assign(['source'], { extra: true }),
        equals: '',
      }),
      {
        conditionReason: 'member-invalid',
        conditionDetailMember: 'sourcePath',
        conditionActualType: 'array',
        conditionPathKey: 'extra',
      },
    ],
    [
      'missing equals',
      (): unknown => ({ sourcePath: ['source'] }),
      {
        conditionReason: 'member-missing',
        conditionDetailMember: 'equals',
        conditionExpected: 'string, finite number, boolean or null',
      },
    ],
    [
      'invalid equals',
      (): unknown => ({ sourcePath: ['source'], equals: Number.NaN }),
      {
        conditionReason: 'member-invalid',
        conditionDetailMember: 'equals',
        conditionActualType: 'number',
      },
    ],
  ] as const)('reports %s shape metadata', (_name, create, expected) => {
    const source = field('source');
    const target = field('target', 'string', { visibleWhen: create() });
    const result = validateCollectionFormDefinition(
      definition([source, target]),
    );
    expect(result).toMatchObject({
      success: false,
      defect: {
        reason: 'invalid-field-condition',
        nodeIndexPath: [1],
        path: ['target'],
        conditionMember: 'visibleWhen',
        ...expected,
      },
    });
  });

  it('preserves base-definition precedence before detached condition defects', () => {
    const first = field('first', 'string', {
      visibleWhen: null,
    });
    const second = field('second');
    delete second.nullable;
    const defects = collectCollectionFormDefinitionDefects(
      definition([first, second]),
    );

    expect(defects.map(({ reason }) => reason)).toEqual([
      'invalid-field-nullable',
      'invalid-field-condition',
    ]);
    expect(
      validateCollectionFormDefinition(definition([first, second])),
    ).toMatchObject({
      defect: { reason: 'invalid-field-nullable', path: ['second'] },
    });
  });

  it('rejects own template condition members without invoking accessors', () => {
    const item = template();
    const getter = vi.fn(() => ({ sourcePath: ['target'], equals: '' }));
    Object.defineProperty(item, 'enabledWhen', { get: getter });

    expect(
      validateCollectionFormDefinition(collectionDefinition([item])),
    ).toEqual({
      success: false,
      defect: {
        reason: 'unsupported-field-condition-location',
        templateIndexPath: [0],
        relativePath: ['value'],
        conditionMember: 'enabledWhen',
        conditionLocation: 'template-field',
      },
    });
    expect(getter).not.toHaveBeenCalled();

    const target = field('target');
    const manual = collectionDefinition([item], target);
    expect(
      applyFormOperation(manual as never, {}, setTarget()).diagnostics[0],
    ).toMatchObject({
      code: 'INVALID_FORM_DEFINITION',
      parameters: {
        reason: 'unsupported-field-condition-location',
        templateIndexPath: [0],
        relativePath: ['value'],
        conditionMember: 'enabledWhen',
        location: 'template-field',
      },
    });
    expect(
      createControlledFormRuntime(runtimeOptions(manual)).diagnostics[0],
    ).toMatchObject({
      code: 'INVALID_RUNTIME_OPTIONS',
      parameters: {
        definitionReason: 'unsupported-field-condition-location',
        definitionConditionMember: 'enabledWhen',
        definitionLocation: 'template-field',
        templateIndexPath: [0],
        relativePath: ['value'],
      },
    });

    Object.defineProperty(Object.prototype, 'visibleWhen', {
      configurable: true,
      value: { sourcePath: ['target'], equals: '' },
    });
    try {
      expect(
        validateCollectionFormDefinition(
          collectionDefinition([template('inherited')]),
        ),
      ).toEqual({ success: true });
    } finally {
      delete (Object.prototype as { visibleWhen?: unknown }).visibleWhen;
    }
  });

  it('classifies fixed targets and every unmanaged source family', () => {
    const fixed = field('fixed', 'string', {
      fixedValue: 'fixed',
      enabledWhen: { sourcePath: ['target'], equals: '' },
    });
    const target = field('target');
    expect(
      validateCollectionFormDefinition(definition([fixed, target])),
    ).toMatchObject({
      defect: {
        reason: 'field-condition-target-incompatible',
        conditionTargetCapability: 'fixed-value',
      },
    });

    const nestedLeaf = {
      ...field('name'),
      key: JSON.stringify(['profile', 'name']),
      path: ['profile', 'name'],
    };
    const profile = {
      key: JSON.stringify(['profile']),
      name: 'profile',
      path: ['profile'],
      required: false,
      label: 'profile',
      kind: 'object',
      children: [nestedLeaf],
      presentation: [{ kind: 'form-node', node: nestedLeaf }],
    };
    const failures = ['profile', 'rows', 'rows.id', 'missing'].map((source) => {
      const conditioned = field('target', 'string', {
        visibleWhen: { sourcePath: source.split('.'), equals: '' },
      });
      const itemValue = template('value');
      const collection = collectionDefinition([itemValue], conditioned);
      const collectionNode = (collection.nodes as object[])[0] as object;
      const nodes = [profile, collectionNode, conditioned];
      return validateCollectionFormDefinition(
        definition(nodes, [nestedLeaf, conditioned]),
      );
    });
    expect(
      failures.map((failure) =>
        failure.success ? undefined : failure.defect.sourceReason,
      ),
    ).toEqual(['object', 'array', 'below-collection', 'unmanaged']);
  });

  it('reports literal compatibility with exact source metadata', () => {
    const source = field('source', 'integer');
    const target = field('target', 'string', {
      visibleWhen: { sourcePath: ['source'], equals: 0.5 },
    });
    expect(
      validateCollectionFormDefinition(definition([source, target])),
    ).toEqual({
      success: false,
      defect: {
        reason: 'field-condition-literal-incompatible',
        nodeIndexPath: [1],
        path: ['target'],
        conditionMember: 'visibleWhen',
        sourcePath: ['source'],
        sourceKind: 'integer',
        sourceNullable: false,
        conditionExpected: 'finite integer',
        conditionActualType: 'number',
      },
    });
  });

  it('orders semantic defects by field projection and condition member', () => {
    const second = field('second', 'string', {
      visibleWhen: { sourcePath: ['missing-second-visible'], equals: '' },
      enabledWhen: { sourcePath: ['missing-second-enabled'], equals: '' },
    });
    const first = field('first', 'string', {
      visibleWhen: { sourcePath: ['missing-first-visible'], equals: '' },
      enabledWhen: { sourcePath: ['missing-first-enabled'], equals: '' },
    });
    const defects = collectCollectionFormDefinitionDefects(
      definition([second, first]),
    );
    expect(
      defects.map(({ path, conditionMember, reason }) => [
        path?.[0],
        conditionMember,
        reason,
      ]),
    ).toEqual([
      ['second', 'visibleWhen', 'field-condition-source-not-managed'],
      ['second', 'enabledWhen', 'field-condition-source-not-managed'],
      ['first', 'visibleWhen', 'field-condition-source-not-managed'],
      ['first', 'enabledWhen', 'field-condition-source-not-managed'],
    ]);
  });

  it('maps exact direct and runtime wrapper diagnostics and freezes copies', () => {
    const target = field('target', 'string', {
      visibleWhen: { sourcePath: ['missing'], equals: '' },
    });
    const manual = definition([target]);
    const applied = applyFormOperation(manual as never, {}, setTarget());
    expect(applied).toMatchObject({
      success: false,
      changed: false,
      diagnostics: [
        {
          code: 'INVALID_FORM_DEFINITION',
          dataPath: ['target'],
          parameters: {
            reason: 'field-condition-source-not-managed',
            nodeIndexPath: [0],
            path: ['target'],
            conditionMember: 'visibleWhen',
            sourcePath: ['missing'],
            sourceReason: 'unmanaged',
          },
          fallbackMessage: 'Form definition is invalid.',
        },
      ],
    });
    const directParameters = applied.diagnostics[0]?.parameters;
    expect(Object.isFrozen(directParameters)).toBe(true);
    expect(Object.isFrozen(directParameters?.sourcePath)).toBe(true);

    const validate = vi.fn(() => ({ valid: true, issues: [] }));
    const created = createControlledFormRuntime(
      runtimeOptions(manual, {}, validate),
    );
    expect(created).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INVALID_RUNTIME_OPTIONS',
          parameters: {
            member: 'definition',
            definitionReason: 'field-condition-source-not-managed',
            definitionConditionMember: 'visibleWhen',
            definitionSourcePath: ['missing'],
            definitionSourceReason: 'unmanaged',
            nodeIndexPath: [0],
            path: ['target'],
          },
        },
      ],
    });
    expect(validate).not.toHaveBeenCalled();
    const wrapperParameters = created.diagnostics[0]?.parameters;
    expect(Object.isFrozen(wrapperParameters)).toBe(true);
    expect(Object.isFrozen(wrapperParameters?.definitionSourcePath)).toBe(true);
  });

  it('does not read controlled targets or invoke validators after a definition defect', () => {
    const target = field('target', 'string', { visibleWhen: null });
    const manual = definition([target]);
    const controlledGetter = vi.fn(() => 'value');
    const value: Record<string, unknown> = {};
    Object.defineProperty(value, 'target', {
      enumerable: true,
      get: controlledGetter,
    });
    const validate = vi.fn(() => ({ valid: true, issues: [] }));

    const created = createControlledFormRuntime(
      runtimeOptions(manual, value, validate),
    );
    expect(created.success).toBe(false);
    expect(controlledGetter).not.toHaveBeenCalled();
    expect(validate).not.toHaveBeenCalled();

    const applied = applyFormOperation(manual as never, value, setTarget());
    expect(applied.success).toBe(false);
    expect(applied.value).toBe(value);
    expect(controlledGetter).not.toHaveBeenCalled();
  });
});
