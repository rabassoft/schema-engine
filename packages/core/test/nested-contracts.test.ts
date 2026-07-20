import { describe, expect, expectTypeOf, it } from 'vitest';
import type {
  ArrayNodeDefinition,
  FieldPresence,
  FieldDefinition,
  FormDefinition,
  FormNodeDefinition,
  NodeRuntimeSnapshot,
  ObjectFieldDefinition,
  ObjectPresence,
  ObjectTextResolutionContext,
  ObjectUiSchema,
  UiNodeSchema,
} from '../src/index.js';
import { validateNestedFormDefinition } from '../src/internal/nested-definition.js';
import { withDefaultPresentation } from './definition-fixtures.js';
import {
  appendDataPath,
  canonicalDataPathKey,
  copyStringDataPath,
} from '../src/internal/path.js';

function leaf(path: readonly string[]): FieldDefinition {
  return {
    kind: 'string',
    nullable: false,
    key: canonicalDataPathKey(path),
    name: path.at(-1) ?? '',
    path,
    required: false,
    label: path.at(-1) ?? '',
    constraints: {},
  };
}

function objectNode(
  path: readonly string[],
  children: readonly FormNodeDefinition[],
): ObjectFieldDefinition {
  return {
    kind: 'object',
    key: canonicalDataPathKey(path),
    name: path.at(-1) ?? '',
    path,
    required: false,
    label: path.at(-1) ?? '',
    children,
    presentation: children.map((node) => ({ kind: 'form-node', node })),
  };
}

describe('M9 public contract foundations', () => {
  it('exposes recursive UI, definition, presence, snapshot, and text shapes', () => {
    const ui = {
      label: 'Address',
      fields: { street: { placeholder: 'Street' } },
    } satisfies ObjectUiSchema;
    const uiNode: UiNodeSchema = ui;
    const street = leaf(Object.freeze(['address', 'street']));
    const address = objectNode(Object.freeze(['address']), [street]);
    const definition = withDefaultPresentation({
      nodes: [address],
      fields: [street],
    }) satisfies FormDefinition;
    const objectPresence: ObjectPresence = { kind: 'object' };
    const fieldPresence: FieldPresence = {
      kind: 'blocked',
      reason: 'missing-ancestor',
      at: ['address'],
    };
    const snapshot: NodeRuntimeSnapshot = {
      nodeKind: 'object',
      key: address.key,
      path: address.path,
      presence: objectPresence,
      dirty: false,
      touched: false,
      focused: false,
      valid: true,
      issues: [],
      showIssues: false,
      children: [],
    };
    const context: ObjectTextResolutionContext = {
      formId: 'form',
      locale: 'en',
      node: address,
      member: 'label',
    };

    expect(uiNode).toBe(ui);
    expect(definition.fields[0]).toBe(street);
    expect(fieldPresence.kind).toBe('blocked');
    expect(snapshot.nodeKind).toBe('object');
    expect(context.node).toBe(address);
    expectTypeOf<FormNodeDefinition>().toMatchTypeOf<
      | ObjectFieldDefinition
      | ArrayNodeDefinition
      | FormDefinition['fields'][number]
    >();
  });
});

describe('nested definition and path helpers', () => {
  it('validates identity-linked trees without mutating caller containers', () => {
    const street = leaf(['address', 'street']);
    const address = objectNode(['address'], [street]);
    const definition = withDefaultPresentation({
      nodes: [address],
      fields: [street],
    });

    expect(validateNestedFormDefinition(definition)).toMatchObject({
      success: true,
    });
    expect(Object.isFrozen(definition)).toBe(false);
    expect(Object.isFrozen(definition.nodes)).toBe(false);
  });

  it('reports cycles, reused nodes, and inconsistent projections safely', () => {
    const cyclic = objectNode(['cycle'], []) as ObjectFieldDefinition & {
      children: FormNodeDefinition[];
    };
    cyclic.children.push(cyclic);
    expect(
      validateNestedFormDefinition(
        withDefaultPresentation({ nodes: [cyclic], fields: [] }),
      ),
    ).toMatchObject({
      success: false,
      defect: { reason: 'cyclic-node', nodeIndexPath: [0, 0] },
    });

    const shared = leaf(['shared']);
    expect(
      validateNestedFormDefinition(
        withDefaultPresentation({
          nodes: [shared, shared],
          fields: [shared, shared],
        }),
      ),
    ).toMatchObject({
      success: false,
      defect: { reason: 'reused-node', nodeIndexPath: [1] },
    });

    expect(
      validateNestedFormDefinition(
        withDefaultPresentation({ nodes: [shared], fields: [] }),
      ),
    ).toMatchObject({
      success: false,
      defect: { reason: 'inconsistent-leaf-projection', fieldIndex: 0 },
    });
  });

  it('never executes accessors and supports deep finite definitions iteratively', () => {
    let executed = false;
    const hostile = Object.create(null) as Record<string, unknown>;
    Object.defineProperty(hostile, 'nodes', {
      get() {
        executed = true;
        return [];
      },
    });
    Object.defineProperty(hostile, 'fields', { value: [] });
    expect(validateNestedFormDefinition(hostile)).toMatchObject({
      success: false,
      defect: { reason: 'nodes-not-array' },
    });
    expect(executed).toBe(false);

    const terminalPath = Object.freeze(
      Array.from({ length: 1_500 }, (_, index) => `n${index}`),
    );
    const terminal = leaf(terminalPath);
    let node: FormNodeDefinition = terminal;
    for (let depth = terminalPath.length - 2; depth >= 0; depth -= 1) {
      node = objectNode(terminalPath.slice(0, depth + 1), [node]);
    }
    expect(
      validateNestedFormDefinition(
        withDefaultPresentation({ nodes: [node], fields: [terminal] }),
      ),
    ).toMatchObject({ success: true });
  });

  it('copies string-only paths and derives canonical keys without delimiters', () => {
    const path = copyStringDataPath(['a.b', '__proto__']);
    expect(path).toEqual(['a.b', '__proto__']);
    expect(Object.isFrozen(path)).toBe(true);
    expect(canonicalDataPathKey(path ?? [])).toBe('["a.b","__proto__"]');
    expect(appendDataPath(['a.b'], '__proto__')).toEqual(['a.b', '__proto__']);
    expect(copyStringDataPath(['ok', 1])).toBeUndefined();
  });
});
