import { readdir, readFile, writeFile } from 'node:fs/promises';
import { URL } from 'node:url';
import { compileFormDefinition } from '../dist/index.js';

const fixturesDirectory = new URL('./conformance/fixtures/', import.meta.url);
const fixtureNames = (await readdir(fixturesDirectory)).sort();

for (const fixtureName of fixtureNames) {
  const directory = new URL(`${fixtureName}/`, fixturesDirectory);
  const schema = JSON.parse(
    await readFile(new URL('schema.json', directory), 'utf8'),
  );
  let uiSchema;
  let collectionPolicies;

  try {
    uiSchema = JSON.parse(
      await readFile(new URL('ui-schema.json', directory), 'utf8'),
    );
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      throw error;
    }
  }

  try {
    collectionPolicies = JSON.parse(
      await readFile(new URL('collection-policies.json', directory), 'utf8'),
    );
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      throw error;
    }
  }

  const result = compileFormDefinition({
    schema,
    uiSchema,
    ...(collectionPolicies === undefined ? {} : { collectionPolicies }),
  });
  await writeFile(
    new URL('expected.json', directory),
    `${JSON.stringify(result, null, 2)}\n`,
  );
}
