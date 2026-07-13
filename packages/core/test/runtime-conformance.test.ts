import { readdir, readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import {
  createControlledFormRuntime,
  type FormOperation,
} from '../src/index.js';

const directory = new URL('./runtime/fixtures/', import.meta.url);
const definition = {
  fields: [
    {
      key: 'name',
      name: 'name',
      path: ['name'],
      required: true,
      label: 'Name',
      kind: 'string',
      constraints: {},
    },
    {
      key: 'age',
      name: 'age',
      path: ['age'],
      required: false,
      label: 'Age',
      kind: 'number',
      numericType: 'integer',
      constraints: {},
      ui: {},
    },
  ],
} as const;
type Action = {
  type: string;
  path?: readonly string[];
  value?: unknown;
  update?: object;
  scope?: never;
  scopeId?: string;
};
type Fixture = {
  value: object;
  baselineValue: object;
  validatorMode?: string;
  actions: readonly Action[];
};

describe('runtime conformance fixtures', async () => {
  const names = (await readdir(directory)).sort();
  it.each(names)('%s', async (name) => {
    const fixture = JSON.parse(
      await readFile(new URL(`${name}/fixture.json`, directory), 'utf8'),
    ) as Fixture;
    const expected = JSON.parse(
      await readFile(new URL(`${name}/expected.json`, directory), 'utf8'),
    ) as unknown;
    expect(replay(fixture)).toEqual(expected);
  });
});

function replay(fixture: Fixture): unknown {
  const created = createControlledFormRuntime({
    formId: 'fixture',
    definition,
    schema: {},
    value: fixture.value,
    baselineValue: fixture.baselineValue,
    locale: 'en',
    validator: {
      validate(_schema, value) {
        const missing =
          typeof value === 'object' &&
          value !== null &&
          !Object.hasOwn(value, 'name');
        return fixture.validatorMode === 'required-name' && missing
          ? {
              valid: false,
              issues: [{ code: 'required', path: ['name'], parameters: {} }],
            }
          : { valid: true, issues: [] };
      },
    },
  });
  if (!created.success) return created;
  const operations: FormOperation[] = [];
  let snapshotEmissions = 0;
  created.runtime.subscribe(() => {
    snapshotEmissions += 1;
  });
  created.runtime.subscribeOperations((operation) =>
    operations.push(operation),
  );
  const initialSnapshot = created.runtime.getSnapshot();
  const actions = [];
  for (const action of fixture.actions) {
    let result;
    if (action.type === 'update')
      result = created.runtime.updateExternalState(action.update as never);
    else if (action.type === 'set')
      result = created.runtime.requestSetValue(action.path ?? [], action.value);
    else if (action.type === 'remove')
      result = created.runtime.requestRemoveValue(action.path ?? []);
    else if (action.type === 'focus')
      result = created.runtime.focus(action.path ?? []);
    else if (action.type === 'blur')
      result = created.runtime.blur(action.path ?? []);
    else if (action.type === 'show')
      result = created.runtime.showValidationErrors(action.scope as never);
    else if (action.type === 'hide')
      result = created.runtime.hideValidationErrors(action.scopeId ?? '');
    else result = created.runtime.dispose();
    actions.push({ result, snapshot: created.runtime.getSnapshot() });
  }
  return {
    success: true,
    initialSnapshot,
    actions,
    operations,
    snapshotEmissions,
    finalSnapshot: created.runtime.getSnapshot(),
  };
}
