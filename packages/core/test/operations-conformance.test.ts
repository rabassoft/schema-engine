import { readdir, readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { applyFormOperation, applyOperation } from '../src/index.js';

const fixturesDirectory = new URL('./operations/fixtures/', import.meta.url);

describe('operation conformance fixtures', async () => {
  const fixtureNames = (await readdir(fixturesDirectory)).sort();

  it.each(fixtureNames)('%s', async (fixtureName) => {
    const directory = new URL(`${fixtureName}/`, fixturesDirectory);
    const fixture = JSON.parse(
      await readFile(new URL('fixture.json', directory), 'utf8'),
    ) as {
      mode: 'structural' | 'form';
      definition?: never;
      currentValue: object;
      operation: never;
    };
    const expected = JSON.parse(
      await readFile(new URL('expected.json', directory), 'utf8'),
    ) as unknown;
    const result =
      fixture.mode === 'form'
        ? applyFormOperation(
            rehydrateDefinition(fixture.definition) as never,
            fixture.currentValue,
            fixture.operation,
          )
        : applyOperation(fixture.currentValue, fixture.operation);
    expect(result).toEqual(expected);
  });
});

function rehydrateDefinition(value: unknown): unknown {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return value;
  }
  const definition = value as { nodes?: unknown; fields?: unknown };
  if (!Array.isArray(definition.nodes) || !Array.isArray(definition.fields)) {
    return value;
  }
  const nodes = definition.nodes as readonly unknown[];
  const fields = definition.fields as readonly unknown[];
  const leaves = new Map<string, unknown>();
  const stack: unknown[] = [...nodes].reverse();
  while (stack.length > 0) {
    const node = stack.pop();
    if (typeof node !== 'object' || node === null || Array.isArray(node)) {
      continue;
    }
    const candidate = node as {
      kind?: unknown;
      path?: unknown;
      children?: unknown;
    };
    if (candidate.kind === 'object' && Array.isArray(candidate.children)) {
      const children = candidate.children as readonly unknown[];
      for (let index = children.length - 1; index >= 0; index -= 1) {
        stack.push(children[index]);
      }
    } else if (Array.isArray(candidate.path)) {
      leaves.set(JSON.stringify(candidate.path), node);
    }
  }
  return {
    ...definition,
    fields: fields.map((field): unknown => {
      if (typeof field !== 'object' || field === null || Array.isArray(field)) {
        return field;
      }
      const path = (field as { path?: unknown }).path;
      return Array.isArray(path)
        ? (leaves.get(JSON.stringify(path)) ?? field)
        : field;
    }),
  };
}
