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
            fixture.definition as never,
            fixture.currentValue,
            fixture.operation,
          )
        : applyOperation(fixture.currentValue, fixture.operation);
    expect(result).toEqual(expected);
  });
});
