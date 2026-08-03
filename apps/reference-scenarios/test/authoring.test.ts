import { describe, expect, it, vi } from 'vitest';

import {
  defineReferenceCatalog,
  ReferenceCatalogAuthoringError,
  type ReferenceCatalogAuthoringReason,
  type ReferenceScenarioAuthoring,
} from '../src/index.js';

function validScenario(
  id = 'controlled-primitives',
): ReferenceScenarioAuthoring {
  return {
    id,
    title: 'Controlled primitives',
    summary: 'Exercises controlled primitive fields.',
    features: ['controlled-state', 'primitive-fields'],
    compileInput: {
      schema: {
        type: 'object',
        properties: { name: { type: 'string' } },
      },
      uiSchema: { fields: { name: { label: 'Name' } } },
    },
    initialState: {
      value: { name: 'Ada' },
      baselineValue: { name: 'Ada' },
      locale: 'en',
      validationVisibility: 'touched',
    },
    validator: {
      validate: (_schema, value) => ({
        valid: typeof value === 'object',
        issues: [],
      }),
    },
    transitions: [
      {
        id: 'rename',
        action: 'Enter Grace and confirm.',
        decision: 'confirm',
        operation: {
          type: 'set-value',
          path: ['name'],
          expected: { kind: 'value', value: 'Ada' },
          value: 'Grace',
        },
        expected: {
          value: { name: 'Grace' },
          baselineValue: { name: 'Ada' },
          dirty: true,
          valid: true,
          issues: [{ code: 'required', path: ['name'], keyword: 'required' }],
        },
      },
    ],
    explanation: [
      {
        id: 'controlled-ownership',
        title: 'Controlled ownership',
        body: 'The application owns both complete roots.',
      },
    ],
  };
}

function asAuthoring(value: unknown): readonly ReferenceScenarioAuthoring[] {
  return value as readonly ReferenceScenarioAuthoring[];
}

function expectAuthoringError(
  action: () => unknown,
  reason: ReferenceCatalogAuthoringReason,
  path?: readonly (string | number)[],
): ReferenceCatalogAuthoringError {
  try {
    action();
  } catch (error) {
    expect(error).toBeInstanceOf(ReferenceCatalogAuthoringError);
    const authored = error as ReferenceCatalogAuthoringError;
    expect(authored.reason).toBe(reason);
    if (path !== undefined) expect(authored.path).toEqual(path);
    return authored;
  }
  throw new Error('Expected catalog authoring to fail.');
}

describe('defineReferenceCatalog', () => {
  it('deep-copies and freezes data while wrapping, but not freezing, the validator', () => {
    const authored = validScenario();
    const authoredValidator = authored.validator;
    const catalog = defineReferenceCatalog([authored]);
    const scenario = catalog[0];

    expect(scenario).toBeDefined();
    expect(Object.isFrozen(catalog)).toBe(true);
    expect(Object.isFrozen(scenario)).toBe(true);
    expect(Object.isFrozen(scenario?.compileInput)).toBe(true);
    expect(Object.isFrozen(scenario?.compileInput.schema)).toBe(true);
    expect(Object.isFrozen(scenario?.initialState.value)).toBe(true);
    expect(Object.isFrozen(scenario?.transitions[0]?.operation)).toBe(true);
    expect(Object.isFrozen(scenario?.validator)).toBe(true);
    expect(Object.isFrozen(authoredValidator)).toBe(false);
    expect(scenario?.validator).not.toBe(authoredValidator);
    expect(scenario?.compileInput).not.toBe(authored.compileInput);
    expect(scenario?.initialState).not.toBe(authored.initialState);
    expect(scenario?.validator.validate({}, {})).toEqual({
      valid: true,
      issues: [],
    });

    (authored.compileInput.schema as { type: string }).type = 'string';
    expect((scenario?.compileInput.schema as { type: string }).type).toBe(
      'object',
    );
  });

  it('does not compile, execute validation or apply expected operations while authoring', () => {
    const authored = validScenario();
    const validate = vi.fn((schema: unknown, value: unknown) =>
      authored.validator.validate(schema, value),
    );
    (
      authored as unknown as { validator: { validate: typeof validate } }
    ).validator = {
      validate,
    };

    const [scenario] = defineReferenceCatalog([authored]);

    expect(validate).not.toHaveBeenCalled();
    expect(scenario?.compileInput.schema).toEqual(authored.compileInput.schema);
    expect(scenario?.transitions[0]?.operation).toEqual(
      authored.transitions[0]?.operation,
    );
    expect(scenario?.transitions[0]?.expected.issues).toEqual(
      authored.transitions[0]?.expected.issues,
    );
  });

  it('accepts shared acyclic input without retaining aliases', () => {
    const shared = { type: 'string' };
    const authored = validScenario();
    (authored.compileInput as { schema: unknown }).schema = {
      type: 'object',
      properties: { first: shared, second: shared },
    };
    const [scenario] = defineReferenceCatalog([authored]);
    const properties = (
      scenario?.compileInput.schema as {
        properties: { first: unknown; second: unknown };
      }
    ).properties;

    expect(properties.first).toEqual(shared);
    expect(properties.first).not.toBe(shared);
    expect(properties.first).not.toBe(properties.second);
    expect(Object.isFrozen(properties.first)).toBe(true);
  });

  it('copies and validates optional service-validation metadata without executing effects', () => {
    const authored = validScenario();
    const serviceValidation = {
      fieldPath: ['name'],
      issue: {
        code: 'name-unavailable',
        keyword: 'service',
        fallbackMessage: 'Name unavailable.',
      },
      labels: {
        heading: 'Service controls',
        settleValid: 'Resolve valid',
        settleInvalid: 'Resolve invalid',
        reject: 'Reject request',
        throwNext: 'Throw next',
        retry: 'Retry',
      },
    };
    (
      authored as ReferenceScenarioAuthoring & {
        serviceValidation: typeof serviceValidation;
      }
    ).serviceValidation = serviceValidation;

    const [scenario] = defineReferenceCatalog([authored]);

    expect(scenario?.serviceValidation).toEqual(serviceValidation);
    expect(scenario?.serviceValidation).not.toBe(serviceValidation);
    expect(Object.isFrozen(scenario?.serviceValidation)).toBe(true);
    expect(Object.isFrozen(scenario?.serviceValidation?.fieldPath)).toBe(true);

    serviceValidation.labels.retry = 'Changed';
    expect(scenario?.serviceValidation?.labels.retry).toBe('Retry');

    const invalid = validScenario() as ReferenceScenarioAuthoring & {
      serviceValidation: typeof serviceValidation;
    };
    invalid.serviceValidation = {
      ...serviceValidation,
      labels: { ...serviceValidation.labels, retry: ' ' },
    };
    expectAuthoringError(
      () => defineReferenceCatalog([invalid]),
      'invalid-member',
      [0, 'serviceValidation', 'labels', 'retry'],
    );
  });

  it('copies and validates optional scoped-confirmation metadata', () => {
    const authored = validScenario();
    const scopeConfirmation = {
      labels: {
        heading: 'Confirmation',
        guidance: 'Prepare then accept.',
        accept: 'Accept candidate',
      },
      targets: [
        {
          id: 'name',
          label: 'Prepare name',
          scope: { id: 'name', paths: [['name']] },
          expectation: 'candidate-and-acceptance-leaves-unrelated-dirty',
        },
      ],
    } as const;
    (
      authored as ReferenceScenarioAuthoring & {
        scopeConfirmation: typeof scopeConfirmation;
      }
    ).scopeConfirmation = scopeConfirmation;

    const [scenario] = defineReferenceCatalog([authored]);

    expect(scenario?.scopeConfirmation).toEqual(scopeConfirmation);
    expect(scenario?.scopeConfirmation).not.toBe(scopeConfirmation);
    expect(
      Object.isFrozen(scenario?.scopeConfirmation?.targets[0]?.scope),
    ).toBe(true);

    const invalid = validScenario() as ReferenceScenarioAuthoring & {
      scopeConfirmation: typeof scopeConfirmation;
    };
    invalid.scopeConfirmation = {
      ...scopeConfirmation,
      targets: [
        {
          ...scopeConfirmation.targets[0],
          scope: { id: 'name', paths: [[]] },
        },
      ],
    } as unknown as typeof scopeConfirmation;
    expectAuthoringError(
      () => defineReferenceCatalog([invalid]),
      'invalid-member',
      [0, 'scopeConfirmation', 'targets', 0, 'scope', 'paths', 0],
    );
  });

  it('rejects duplicate IDs at every catalog level with scenario context', () => {
    const duplicateScenario = validScenario();
    expectAuthoringError(
      () => defineReferenceCatalog([validScenario(), duplicateScenario]),
      'duplicate-id',
      [1, 'id'],
    );

    const duplicateFeatures = validScenario();
    (duplicateFeatures as unknown as { features: string[] }).features = [
      'validation',
      'validation',
    ];
    expectAuthoringError(
      () => defineReferenceCatalog([duplicateFeatures]),
      'duplicate-id',
      [0, 'features', 1],
    );

    for (const member of ['transitions', 'explanation'] as const) {
      const authored = validScenario();
      const entries = authored[member] as readonly object[];
      (authored as unknown as Record<string, unknown>)[member] = [
        entries[0],
        entries[0],
      ];
      expectAuthoringError(
        () => defineReferenceCatalog([authored]),
        'duplicate-id',
        [0, member, 1, 'id'],
      );
    }
  });

  it('rejects malformed required values and exact transition shapes', () => {
    const invalidId = validScenario('Not kebab');
    expectAuthoringError(
      () => defineReferenceCatalog([invalidId]),
      'invalid-id',
    );

    const blankLocale = validScenario();
    (blankLocale.initialState as { locale: string }).locale = '  ';
    expectAuthoringError(
      () => defineReferenceCatalog([blankLocale]),
      'invalid-member',
      [0, 'initialState', 'locale'],
    );

    const invalidVisibility = validScenario();
    (
      invalidVisibility.initialState as { validationVisibility: string }
    ).validationVisibility = 'submit';
    expectAuthoringError(
      () => defineReferenceCatalog([invalidVisibility]),
      'invalid-member',
      [0, 'initialState', 'validationVisibility'],
    );

    const metadata = validScenario();
    const operation = metadata.transitions[0]?.operation as Record<
      string,
      unknown
    >;
    operation.metadata = { id: 1, formId: 'forbidden' };
    expectAuthoringError(
      () => defineReferenceCatalog([metadata]),
      'extra-member',
      [0, 'transitions', 0, 'operation'],
    );

    const badIssue = validScenario();
    const issue = badIssue.transitions[0]?.expected.issues?.[0] as {
      path: unknown;
    };
    issue.path = [true];
    expectAuthoringError(
      () => defineReferenceCatalog([badIssue]),
      'invalid-member',
      [0, 'transitions', 0, 'expected', 'issues', 0, 'path', 0],
    );
  });

  it('never executes accessors and applies deterministic extra-member precedence', () => {
    const getter = vi.fn(() => 'unexpected');
    const authored = validScenario() as unknown as Record<string, unknown>;
    Object.defineProperty(authored, 'title', {
      enumerable: true,
      get: getter,
    });
    expectAuthoringError(
      () => defineReferenceCatalog(asAuthoring([authored])),
      'accessor-member',
      [0, 'title'],
    );
    expect(getter).not.toHaveBeenCalled();

    const precedence = validScenario() as unknown as Record<string, unknown>;
    delete precedence.title;
    precedence.unexpected = true;
    expectAuthoringError(
      () => defineReferenceCatalog(asAuthoring([precedence])),
      'extra-member',
      [0, 'unexpected'],
    );
  });

  it.each([
    ['inherited-member', () => Object.create({ id: 'inherited' }) as object],
    [
      'symbol-member',
      () => Object.assign(validScenario(), { [Symbol('x')]: true }),
    ],
    ['invalid-container', () => null],
    [
      'missing-member',
      () => {
        const authored = validScenario() as unknown as Record<string, unknown>;
        delete authored.summary;
        return authored;
      },
    ],
    [
      'non-json-value',
      () => ({
        ...validScenario(),
        compileInput: { schema: { invalid: Number.NaN } },
      }),
    ],
    [
      'non-json-value',
      () => ({
        ...validScenario(),
        compileInput: { schema: { invalid: () => true } },
      }),
    ],
  ] satisfies readonly [ReferenceCatalogAuthoringReason, () => unknown][])(
    'reports %s for unsupported authored input',
    (reason, create) => {
      expectAuthoringError(
        () => defineReferenceCatalog(asAuthoring([create()])),
        reason,
      );
    },
  );

  it('rejects sparse arrays, cycles, symbols and hostile array members', () => {
    const sparse = new Array<ReferenceScenarioAuthoring>(1);
    expectAuthoringError(
      () => defineReferenceCatalog(sparse),
      'sparse-array',
      [0],
    );

    const cycle: Record<string, unknown> = {};
    cycle.self = cycle;
    const cyclic = validScenario();
    (cyclic.compileInput as { schema: unknown }).schema = cycle;
    expectAuthoringError(
      () => defineReferenceCatalog([cyclic]),
      'cyclic-value',
      [0, 'compileInput', 'schema', 'self'],
    );

    const symbolCatalog = [validScenario()];
    Object.defineProperty(symbolCatalog, Symbol('x'), { value: true });
    expectAuthoringError(
      () => defineReferenceCatalog(symbolCatalog),
      'symbol-member',
      [],
    );

    const extraCatalog = [validScenario()] as ReferenceScenarioAuthoring[] & {
      extra?: boolean;
    };
    extraCatalog.extra = true;
    expectAuthoringError(
      () => defineReferenceCatalog(extraCatalog),
      'extra-member',
      ['extra'],
    );
  });

  it('copies hostile property names as inert own data', () => {
    const schema = Object.create(null) as Record<string, unknown>;
    Object.defineProperty(schema, '__proto__', {
      enumerable: true,
      value: { polluted: true },
      writable: true,
    });
    const authored = validScenario();
    (authored.compileInput as { schema: unknown }).schema = schema;
    const [scenario] = defineReferenceCatalog([authored]);
    const copied = scenario?.compileInput.schema as Record<string, unknown>;

    expect(Object.prototype.hasOwnProperty.call(copied, '__proto__')).toBe(
      true,
    );
    expect(Object.getPrototypeOf(copied)).toBe(Object.prototype);
    expect(({} as { polluted?: boolean }).polluted).toBeUndefined();
  });

  it('contains proxy inspection failures without reading values or iterators', () => {
    const get = vi.fn(() => {
      throw new Error('must not read');
    });
    const ownKeys = vi.fn(() => {
      throw new Error('hostile');
    });
    const proxy = new Proxy(validScenario(), { get, ownKeys });
    const error = expectAuthoringError(
      () => defineReferenceCatalog([proxy]),
      'inspection-failed',
      [0],
    );

    expect(error.scenarioId).toBeUndefined();
    expect(ownKeys).toHaveBeenCalledOnce();
    expect(get).not.toHaveBeenCalled();
  });
});
