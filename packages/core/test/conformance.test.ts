import { readdir, readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { compileFormDefinition } from '../src/index.js';

const fixturesDirectory = new URL('./conformance/fixtures/', import.meta.url);

describe('compiler conformance fixtures', async () => {
  const fixtureNames = (await readdir(fixturesDirectory)).sort();

  it.each(fixtureNames)('%s', async (fixtureName) => {
    const directory = new URL(`${fixtureName}/`, fixturesDirectory);
    const schema = JSON.parse(
      await readFile(new URL('schema.json', directory), 'utf8'),
    ) as unknown;
    const expected = JSON.parse(
      await readFile(new URL('expected.json', directory), 'utf8'),
    ) as unknown;
    let uiSchema: unknown;
    let collectionPolicies: unknown;

    try {
      uiSchema = JSON.parse(
        await readFile(new URL('ui-schema.json', directory), 'utf8'),
      ) as unknown;
    } catch (error) {
      if (!isMissingFileError(error)) {
        throw error;
      }
    }

    try {
      collectionPolicies = JSON.parse(
        await readFile(new URL('collection-policies.json', directory), 'utf8'),
      ) as unknown;
    } catch (error) {
      if (!isMissingFileError(error)) {
        throw error;
      }
    }

    expect(
      compileFormDefinition({
        schema,
        uiSchema,
        ...(collectionPolicies === undefined
          ? {}
          : { collectionPolicies: collectionPolicies as never }),
      }),
    ).toEqual(expected);
  });
});

function isMissingFileError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'ENOENT'
  );
}
