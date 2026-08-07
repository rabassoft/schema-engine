import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  compileFormDefinition,
  createControlledFormRuntime,
  type DiscriminatedObjectAlternativeDefinition,
  type DiscriminatedObjectFieldDefinition,
  type DiscriminatedObjectRuntimeSnapshot,
  type FormDefinition,
  type FormNodeDefinition,
  type ObjectAlternativeSelection,
  type ObjectNodeDefinition,
} from '../src/index.js';

function validSchema(): Record<string, unknown> {
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    properties: {
      pet: {
        type: 'object',
        properties: {
          kind: { type: 'string', enum: ['cat', 'dog'] },
          name: { type: 'string' },
        },
        required: ['kind'],
        oneOf: [
          {
            type: 'object',
            properties: {
              kind: { type: 'string', const: 'cat' },
              lives: { type: 'integer' },
            },
            required: ['kind', 'lives'],
          },
          {
            type: 'object',
            properties: {
              kind: { type: 'string', const: 'dog' },
              barkVolume: { type: 'number' },
            },
            required: ['kind'],
          },
        ],
      },
    },
  };
}

function petSchema(schema = validSchema()): Record<string, unknown> {
  const properties = schema.properties as Record<string, unknown>;
  return properties.pet as Record<string, unknown>;
}

function failureDiagnostics(schema: Record<string, unknown>) {
  const result = compileFormDefinition({ schema });
  expect(result.success).toBe(false);
  return result.success ? [] : result.diagnostics;
}

function alternativeReason(
  diagnostics: ReturnType<typeof failureDiagnostics>,
  reason: string,
) {
  return diagnostics.find(
    ({ code, parameters }) =>
      code === 'INCOMPATIBLE_SCHEMA_ALTERNATIVE' &&
      parameters.reason === reason,
  );
}

describe('controlled discriminated object compiler', () => {
  it('exports the exact M33 Public type surface while ordinary objects remain assignable', () => {
    expectTypeOf<DiscriminatedObjectAlternativeDefinition>().toMatchTypeOf<{
      readonly discriminatorValue: string;
      readonly children: readonly string[];
    }>();
    expectTypeOf<DiscriminatedObjectFieldDefinition>().toMatchTypeOf<
      Extract<FormNodeDefinition, { kind: 'discriminated-object' }>
    >();
    expectTypeOf<ObjectAlternativeSelection>().toMatchTypeOf<
      | { readonly kind: 'none' }
      | { readonly kind: 'active'; readonly discriminatorValue: string }
    >();
    expectTypeOf<
      DiscriminatedObjectRuntimeSnapshot['nodeKind']
    >().toEqualTypeOf<'discriminated-object'>();

    const ordinary: ObjectNodeDefinition = {
      kind: 'object',
      key: '["profile"]',
      name: 'profile',
      path: ['profile'],
      required: false,
      label: 'Profile',
      children: [],
      presentation: [],
    };
    expect(ordinary.kind).toBe('object');
  });

  it('normalizes a finite enum/const bijection into one static union catalog', () => {
    const result = compileFormDefinition({
      schema: validSchema(),
      uiSchema: {
        fields: {
          pet: {
            order: ['kind', 'name', 'lives', 'barkVolume'],
            fields: {
              kind: { enumLabels: { cat: 'Cat', dog: 'Dog' } },
            },
          },
        },
      },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    const pet = result.definition.nodes[0];
    expect(pet).toMatchObject({
      kind: 'discriminated-object',
      discriminator: 'kind',
      alternatives: [
        { discriminatorValue: 'cat', children: ['lives'] },
        { discriminatorValue: 'dog', children: ['barkVolume'] },
      ],
    });
    expect(
      pet?.kind === 'discriminated-object'
        ? pet.children.map(({ name }) => name)
        : [],
    ).toEqual(['kind', 'name', 'lives', 'barkVolume']);
    expect(result.definition.fields.map(({ name }) => name)).toEqual([
      'kind',
      'name',
      'lives',
      'barkVolume',
    ]);
    expect(Object.isFrozen(result.definition)).toBe(true);
    expect(Object.isFrozen(pet)).toBe(true);
  });

  it('hands a compiled M33 definition to the controlled runtime', () => {
    const result = compileFormDefinition({ schema: validSchema() });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expectTypeOf(result.definition).toMatchTypeOf<FormDefinition>();

    let validatorCalls = 0;
    const created = createControlledFormRuntime({
      formId: 'm33-guarded',
      definition: result.definition,
      schema: validSchema(),
      value: {},
      baselineValue: {},
      locale: 'en',
      validator: {
        validate: () => {
          validatorCalls += 1;
          return { valid: true, issues: [] };
        },
      },
    });
    expect(created).toMatchObject({ success: true, diagnostics: [] });
    expect(validatorCalls).toBe(1);
  });

  it('classifies root, primitive and nested-alternative oneOf locations without traversing excluded branches', () => {
    const root = failureDiagnostics({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {},
      oneOf: [
        {
          get unsafe() {
            throw new Error('must not run');
          },
        },
        {},
      ],
    });
    expect(root).toContainEqual(
      expect.objectContaining({
        code: 'UNSUPPORTED_SCHEMA_KEYWORD',
        documentPath: ['oneOf'],
      }),
    );

    const primitiveSchema = validSchema();
    (primitiveSchema.properties as Record<string, unknown>).summary = {
      type: 'string',
      oneOf: [{}, {}],
    };
    const primitive = failureDiagnostics(primitiveSchema);
    expect(primitive).toContainEqual(
      expect.objectContaining({
        code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
        dataPath: ['summary'],
        parameters: expect.objectContaining({
          keyword: 'oneOf',
          fieldType: 'string',
        }) as unknown,
      }),
    );

    const nestedSchema = validSchema();
    (petSchema(nestedSchema).properties as Record<string, unknown>).name = {
      type: 'string',
      oneOf: [
        {
          get unsafe() {
            throw new Error('must not run');
          },
        },
        {},
      ],
    };
    const nested = failureDiagnostics(nestedSchema);
    expect(nested).toContainEqual(
      expect.objectContaining({
        code: 'INCOMPATIBLE_SCHEMA_ALTERNATIVE',
        dataPath: ['pet'],
        parameters: {
          reason: 'unsupported-alternative-descendant',
          property: 'name',
          expected: 'non-array primitive or ordinary object subtree',
        },
      }),
    );

    const arraySchema = validSchema();
    (arraySchema.properties as Record<string, unknown>).rows = {
      type: 'array',
      items: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id'],
      },
      oneOf: [
        {
          get unsafe() {
            throw new Error('must not run');
          },
        },
        {},
      ],
    };
    const array = compileFormDefinition({
      schema: arraySchema,
      collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
    });
    expect(array.success).toBe(false);
    expect(array.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
        dataPath: ['rows'],
        documentPath: ['properties', 'rows', 'oneOf'],
        parameters: { keyword: 'oneOf', fieldType: 'array' },
      }),
    );

    const itemSchema = validSchema();
    (itemSchema.properties as Record<string, unknown>).rows = {
      type: 'array',
      items: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id'],
        oneOf: [
          {
            get unsafe() {
              throw new Error('must not run');
            },
          },
          {},
        ],
      },
    };
    const item = compileFormDefinition({
      schema: itemSchema,
      collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
    });
    expect(item.success).toBe(false);
    expect(item.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'UNSUPPORTED_SCHEMA_KEYWORD',
        dataPath: ['rows'],
        documentPath: ['properties', 'rows', 'items', 'oneOf'],
        parameters: { keyword: 'oneOf', templatePath: [] },
      }),
    );
  });

  it.each([
    {
      name: 'accessor member',
      mutate: (pet: Record<string, unknown>) => {
        Object.defineProperty(pet, 'oneOf', {
          enumerable: true,
          get() {
            throw new Error('must not run');
          },
        });
      },
      actualType: 'accessor',
    },
    {
      name: 'non-array value',
      mutate: (pet: Record<string, unknown>) => {
        pet.oneOf = {};
      },
      actualType: 'object',
    },
    {
      name: 'non-enumerable member',
      mutate: (pet: Record<string, unknown>) => {
        Object.defineProperty(pet, 'oneOf', {
          value: pet.oneOf,
          enumerable: false,
        });
      },
      actualType: 'non-enumerable',
    },
    {
      name: 'single branch',
      mutate: (pet: Record<string, unknown>) => {
        (pet.oneOf as unknown[]).length = 1;
      },
      actualType: 'number',
      reason: 'invalid-oneof-length',
    },
    {
      name: 'sparse branch',
      mutate: (pet: Record<string, unknown>) => {
        Reflect.deleteProperty(pet.oneOf as unknown[], '1');
      },
      actualType: 'missing',
    },
    {
      name: 'accessor branch',
      mutate: (pet: Record<string, unknown>) => {
        Object.defineProperty(pet.oneOf as unknown[], 1, {
          enumerable: true,
          configurable: true,
          get() {
            throw new Error('must not run');
          },
        });
      },
      actualType: 'accessor',
    },
    {
      name: 'extra enumerable key',
      mutate: (pet: Record<string, unknown>) => {
        Object.assign(pet.oneOf as object, { extra: {} });
      },
      reason: 'unexpected-oneof-member',
    },
  ])(
    'rejects a descriptor-unsafe oneOf exterior: $name',
    ({ mutate, actualType, reason }) => {
      const schema = validSchema();
      mutate(petSchema(schema));
      const diagnostics = failureDiagnostics(schema);
      const exterior = diagnostics.find(
        ({ code, parameters }) =>
          code === 'INVALID_SCHEMA_KEYWORD_VALUE' &&
          parameters.keyword === 'oneOf',
      );
      expect(exterior).toBeDefined();
      if (actualType !== undefined)
        expect(exterior?.parameters.actualType).toBe(actualType);
      if (reason !== undefined)
        expect(exterior?.parameters.reason).toBe(reason);
    },
  );

  it('reports seed ambiguity without retaining candidate names or discriminator values', () => {
    const schema = validSchema();
    const pet = petSchema(schema);
    (pet.properties as Record<string, unknown>).mode = {
      type: 'string',
      enum: ['cat', 'dog'],
    };
    pet.required = ['kind', 'mode'];
    for (const branch of pet.oneOf as Array<Record<string, unknown>>) {
      (branch.properties as Record<string, unknown>).mode = {
        type: 'string',
        const: (branch.properties as Record<string, Record<string, unknown>>)
          .kind?.const,
      };
      branch.required = [...(branch.required as string[]), 'mode'];
    }
    const diagnostics = failureDiagnostics(schema);
    const conflict = diagnostics.find(
      ({ code, parameters }) =>
        code === 'INCOMPATIBLE_SCHEMA_ALTERNATIVE' &&
        parameters.reason === 'invalid-discriminator-candidate-count',
    );
    expect(conflict?.parameters).toEqual({
      reason: 'invalid-discriminator-candidate-count',
      candidateCount: 2,
      expected: 'exactly one seeded required outer string-enum discriminator',
    });
  });

  it('reports missing, duplicate and unmapped discriminator branches with structural metadata only', () => {
    const missingSchema = validSchema();
    const missingBranches = petSchema(missingSchema).oneOf as Array<
      Record<string, unknown>
    >;
    delete (missingBranches[1]?.properties as Record<string, unknown>).kind;
    const missing = failureDiagnostics(missingSchema);
    expect(missing).toContainEqual(
      expect.objectContaining({
        code: 'INCOMPATIBLE_SCHEMA_ALTERNATIVE',
        parameters: expect.objectContaining({
          reason: 'missing-branch-discriminator',
          branchIndex: 1,
          discriminator: 'kind',
        }) as unknown,
      }),
    );

    const duplicateSchema = validSchema();
    const duplicateBranches = petSchema(duplicateSchema).oneOf as Array<
      Record<string, unknown>
    >;
    const duplicateKind = (
      duplicateBranches[1]?.properties as Record<
        string,
        Record<string, unknown>
      >
    ).kind;
    if (duplicateKind === undefined) throw new Error('Missing test branch.');
    duplicateKind.const = 'cat';
    const duplicate = failureDiagnostics(duplicateSchema);
    expect(duplicate).toContainEqual(
      expect.objectContaining({
        code: 'INCOMPATIBLE_SCHEMA_ALTERNATIVE',
        parameters: expect.objectContaining({
          reason: 'duplicate-discriminator-value',
          branchIndex: 1,
          firstBranchIndex: 0,
          discriminator: 'kind',
        }) as unknown,
      }),
    );
    expect(duplicate).toContainEqual(
      expect.objectContaining({
        parameters: expect.objectContaining({
          reason: 'unmapped-discriminator-value',
          choiceIndex: 1,
          discriminator: 'kind',
        }) as unknown,
      }),
    );
  });

  it('closes branch kind, discriminator, ownership and required conflict reasons', () => {
    const kindSchema = validSchema();
    const invalidBranch = (
      petSchema(kindSchema).oneOf as Array<Record<string, unknown>>
    )[0];
    delete invalidBranch?.required;
    expect(
      alternativeReason(
        failureDiagnostics(kindSchema),
        'unsupported-branch-kind',
      )?.parameters,
    ).toEqual({
      reason: 'unsupported-branch-kind',
      branchIndex: 0,
      expected: 'ordinary object alternative or local reference',
    });

    const discriminatorSchema = validSchema();
    const invalidDiscriminator = (
      petSchema(discriminatorSchema).oneOf as Array<Record<string, unknown>>
    )[1];
    const invalidKind = (
      invalidDiscriminator?.properties as Record<
        string,
        Record<string, unknown>
      >
    ).kind;
    if (invalidKind === undefined) throw new Error('Missing test branch.');
    invalidKind.type = 'number';
    expect(
      alternativeReason(
        failureDiagnostics(discriminatorSchema),
        'invalid-branch-discriminator',
      )?.parameters,
    ).toEqual({
      reason: 'invalid-branch-discriminator',
      branchIndex: 1,
      discriminator: 'kind',
    });

    const duplicateSchema = validSchema();
    const duplicateBranches = petSchema(duplicateSchema).oneOf as Array<
      Record<string, unknown>
    >;
    for (const branch of duplicateBranches) {
      (branch.properties as Record<string, unknown>).shared = {
        type: 'string',
      };
    }
    expect(
      alternativeReason(
        failureDiagnostics(duplicateSchema),
        'duplicate-alternative-property',
      )?.parameters,
    ).toEqual({
      reason: 'duplicate-alternative-property',
      branchIndex: 1,
      property: 'shared',
      firstDocumentPath: [
        'properties',
        'pet',
        'oneOf',
        0,
        'properties',
        'shared',
      ],
    });

    const requiredSchema = validSchema();
    const requiredBranch = (
      petSchema(requiredSchema).oneOf as Array<Record<string, unknown>>
    )[0];
    const branchRequired = requiredBranch?.required;
    if (!Array.isArray(branchRequired)) throw new Error('Missing required.');
    branchRequired.push('ghost');
    expect(
      alternativeReason(
        failureDiagnostics(requiredSchema),
        'invalid-alternative-required',
      )?.parameters,
    ).toEqual({
      reason: 'invalid-alternative-required',
      branchIndex: 0,
      property: 'ghost',
    });
  });

  it('preserves unmanaged outer required warnings while blocking property overlap', () => {
    const warningSchema = validSchema();
    petSchema(warningSchema).required = ['kind', 'serverOnly'];
    const warning = compileFormDefinition({ schema: warningSchema });
    expect(warning.success).toBe(true);
    expect(warning.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'UNMANAGED_REQUIRED_PROPERTY',
        dataPath: ['pet', 'serverOnly'],
      }),
    );

    const overlapSchema = validSchema();
    const firstBranch = (
      petSchema(overlapSchema).oneOf as Array<Record<string, unknown>>
    )[0];
    (firstBranch?.properties as Record<string, unknown>).name = {
      type: 'string',
    };
    const overlap = failureDiagnostics(overlapSchema);
    expect(overlap).toContainEqual(
      expect.objectContaining({
        code: 'INCOMPATIBLE_SCHEMA_ALTERNATIVE',
        parameters: expect.objectContaining({
          reason: 'outer-property-redeclared',
          branchIndex: 0,
          property: 'name',
          firstDocumentPath: ['properties', 'pet', 'properties', 'name'],
        }) as unknown,
      }),
    );
  });

  it('uses owner-relative descendant diagnostics without inventing a branch index', () => {
    const malformedSchema = validSchema();
    (petSchema(malformedSchema).properties as Record<string, unknown>).kind =
      42;
    const malformed = failureDiagnostics(malformedSchema);
    expect(malformed).toContainEqual(
      expect.objectContaining({
        code: 'INCOMPATIBLE_SCHEMA_ALTERNATIVE',
        documentPath: ['properties', 'pet', 'properties', 'kind'],
        parameters: {
          reason: 'unsupported-alternative-descendant',
          property: 'kind',
          expected: 'non-array primitive or ordinary object subtree',
        },
      }),
    );
    expect(
      malformed.some(
        ({ parameters }) =>
          parameters.reason === 'invalid-discriminator-candidate-count',
      ),
    ).toBe(false);

    const outerSchema = validSchema();
    (petSchema(outerSchema).properties as Record<string, unknown>).history = {
      type: 'array',
      items: { type: 'string' },
    };
    const outer = failureDiagnostics(outerSchema).find(
      ({ code, parameters }) =>
        code === 'INCOMPATIBLE_SCHEMA_ALTERNATIVE' &&
        parameters.reason === 'unsupported-alternative-descendant' &&
        parameters.property === 'history',
    );
    expect(outer?.parameters).toEqual({
      reason: 'unsupported-alternative-descendant',
      property: 'history',
      expected: 'non-array primitive or ordinary object subtree',
    });
    expect(Object.hasOwn(outer?.parameters ?? {}, 'branchIndex')).toBe(false);

    const referencedOuterSchema = validSchema();
    (
      petSchema(referencedOuterSchema).properties as Record<string, unknown>
    ).details = { $ref: '#/$defs/details' };
    referencedOuterSchema.$defs = {
      details: {
        type: 'object',
        properties: {
          history: { $ref: '#/$defs/history' },
        },
      },
      history: { type: 'array', items: { type: 'string' } },
    };
    const referencedOuter = failureDiagnostics(referencedOuterSchema).find(
      ({ code, parameters }) =>
        code === 'INCOMPATIBLE_SCHEMA_ALTERNATIVE' &&
        parameters.reason === 'unsupported-alternative-descendant' &&
        parameters.property === 'details',
    );
    expect(referencedOuter).toMatchObject({
      dataPath: ['pet'],
      documentPath: ['$defs', 'history'],
      parameters: {
        reason: 'unsupported-alternative-descendant',
        property: 'details',
        expected: 'non-array primitive or ordinary object subtree',
        referenceChain: [
          ['properties', 'pet', 'properties', 'details', '$ref'],
          ['$defs', 'details', 'properties', 'history', '$ref'],
        ],
      },
    });
    expect(
      Object.hasOwn(referencedOuter?.parameters ?? {}, 'branchIndex'),
    ).toBe(false);

    const branchSchema = validSchema();
    const branch = (
      petSchema(branchSchema).oneOf as Array<Record<string, unknown>>
    )[0];
    (branch?.properties as Record<string, unknown>).history = {
      $ref: '#/$defs/history',
    };
    branchSchema.$defs = {
      history: { type: 'array', items: { type: 'string' } },
    };
    const branchConflict = failureDiagnostics(branchSchema).find(
      ({ code, parameters }) =>
        code === 'INCOMPATIBLE_SCHEMA_ALTERNATIVE' &&
        parameters.reason === 'unsupported-alternative-descendant' &&
        parameters.property === 'history',
    );
    expect(branchConflict?.parameters).toEqual(
      expect.objectContaining({
        reason: 'unsupported-alternative-descendant',
        branchIndex: 0,
        property: 'history',
        expected: 'non-array primitive or ordinary object subtree',
        referenceChain: expect.any(Array) as unknown,
      }),
    );
  });

  it('resolves wrapper and branch references while retaining source provenance', () => {
    const direct = petSchema();
    const branches = direct.oneOf as Array<Record<string, unknown>>;
    const schema: Record<string, unknown> = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      $defs: {
        pet: {
          ...direct,
          properties: {
            ...(direct.properties as Record<string, unknown>),
            kind: { $ref: '#/$defs/kind' },
          },
          oneOf: [{ $ref: '#/$defs/cat' }, { $ref: '#/$defs/dog' }],
        },
        kind: { type: 'string', enum: ['cat', 'dog'] },
        cat: branches[0],
        dog: branches[1],
      },
      type: 'object',
      properties: { pet: { $ref: '#/$defs/pet' } },
    };
    const result = compileFormDefinition({ schema });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.definition.nodes[0]?.kind).toBe('discriminated-object');
  });

  it('keeps enum order authoritative while filtering branch children through UI order', () => {
    const schema = validSchema();
    const branches = petSchema(schema).oneOf as Array<Record<string, unknown>>;
    const cat = branches[0] as Record<string, unknown>;
    const dog = branches[1] as Record<string, unknown>;
    Object.assign(cat.properties as Record<string, unknown>, {
      whiskers: { type: 'integer' },
      age: { type: 'integer' },
    });
    Object.assign(dog.properties as Record<string, unknown>, {
      tail: { type: 'boolean' },
      trained: { type: 'boolean' },
    });
    petSchema(schema).oneOf = [dog, cat];

    const result = compileFormDefinition({
      schema,
      uiSchema: {
        fields: {
          pet: {
            order: [
              'kind',
              'trained',
              'tail',
              'name',
              'age',
              'whiskers',
              'lives',
              'barkVolume',
            ],
          },
        },
      },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    const pet = result.definition.nodes[0];
    expect(pet).toMatchObject({
      kind: 'discriminated-object',
      alternatives: [
        {
          discriminatorValue: 'cat',
          children: ['age', 'whiskers', 'lives'],
        },
        {
          discriminatorValue: 'dog',
          children: ['trained', 'tail', 'barkVolume'],
        },
      ],
    });
    expect(
      pet?.kind === 'discriminated-object'
        ? pet.children.map(({ name }) => name)
        : [],
    ).toEqual([
      'kind',
      'trained',
      'tail',
      'name',
      'age',
      'whiskers',
      'lives',
      'barkVolume',
    ]);
    expect(result.definition.fields.map(({ name }) => name)).toEqual([
      'kind',
      'trained',
      'tail',
      'name',
      'age',
      'whiskers',
      'lives',
      'barkVolume',
    ]);
    expect(
      pet?.kind === 'discriminated-object' &&
        Object.isFrozen(pet.alternatives) &&
        Object.isFrozen(pet.alternatives[0]?.children),
    ).toBe(true);
  });

  it('retains the existing raw-object and reference cycle diagnostics', () => {
    const wrapperCycleSchema = validSchema();
    const wrapper = petSchema(wrapperCycleSchema);
    (wrapper.oneOf as unknown[])[0] = wrapper;
    expect(failureDiagnostics(wrapperCycleSchema)).toContainEqual(
      expect.objectContaining({
        code: 'CYCLIC_SCHEMA_OBJECT',
        dataPath: ['pet'],
        documentPath: ['properties', 'pet', 'oneOf', 0],
        parameters: {
          firstDocumentPath: ['properties', 'pet'],
        },
      }),
    );

    const rawCycleSchema = validSchema();
    const recursive: Record<string, unknown> = {
      type: 'object',
      properties: {},
    };
    (recursive.properties as Record<string, unknown>).self = recursive;
    const rawBranch = (
      petSchema(rawCycleSchema).oneOf as Array<Record<string, unknown>>
    )[0];
    (rawBranch?.properties as Record<string, unknown>).details = recursive;
    expect(failureDiagnostics(rawCycleSchema)).toContainEqual(
      expect.objectContaining({ code: 'CYCLIC_SCHEMA_OBJECT' }),
    );

    const referenceCycleSchema = validSchema();
    (petSchema(referenceCycleSchema).oneOf as unknown[])[0] = {
      $ref: '#/$defs/loop',
    };
    referenceCycleSchema.$defs = {
      loop: { $ref: '#/$defs/loop' },
    };
    expect(failureDiagnostics(referenceCycleSchema)).toContainEqual(
      expect.objectContaining({ code: 'CYCLIC_SCHEMA_REFERENCE' }),
    );
  });

  it('ignores valid owner presentation with a warning and rejects union conditions', () => {
    const presentation = compileFormDefinition({
      schema: validSchema(),
      uiSchema: {
        fields: {
          pet: {
            presentation: ['kind', 'name', 'lives', 'barkVolume'],
            fields: {
              lives: { visibleWhen: { path: ['pet', 'kind'], equals: 'cat' } },
            },
          },
        },
      },
    });
    expect(presentation.success).toBe(false);
    expect(presentation.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'INCOMPATIBLE_UI_OPTION',
        parameters: expect.objectContaining({
          fieldType: 'discriminated-object',
          option: 'presentation',
          reason: 'dynamic-children',
        }) as unknown,
      }),
    );
    expect(presentation.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'INVALID_UI_FIELD_CONDITION',
        parameters: expect.objectContaining({
          reason: 'unsupported-target-location',
        }) as unknown,
      }),
    );

    const external = compileFormDefinition({
      schema: {
        ...validSchema(),
        properties: {
          ...(validSchema().properties as Record<string, unknown>),
          summary: { type: 'string' },
        },
      },
      uiSchema: {
        fields: {
          summary: { visibleWhen: { path: ['pet', 'kind'], equals: 'cat' } },
        },
      },
    });
    expect(external.success).toBe(false);
    expect(external.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'INVALID_UI_FIELD_CONDITION',
        parameters: expect.objectContaining({
          reason: 'source-not-ordinary-field',
          sourcePath: ['pet', 'kind'],
        }) as unknown,
      }),
    );

    const malformedOwner: Record<string, unknown> = { fields: { pet: {} } };
    Object.defineProperty(
      (malformedOwner.fields as Record<string, Record<string, unknown>>).pet,
      'presentation',
      {
        enumerable: true,
        get() {
          throw new Error('must not run');
        },
      },
    );
    const malformed = compileFormDefinition({
      schema: validSchema(),
      uiSchema: malformedOwner,
    });
    expect(malformed.success).toBe(true);
    expect(malformed.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'INVALID_UI_PRESENTATION',
        documentPath: ['fields', 'pet', 'presentation'],
        parameters: {
          reason: 'presentation-accessor',
          expected: 'dense array',
        },
      }),
    );
    expect(
      malformed.diagnostics.some(
        ({ code, parameters }) =>
          code === 'INCOMPATIBLE_UI_OPTION' &&
          parameters.option === 'presentation',
      ),
    ).toBe(false);
  });
});
