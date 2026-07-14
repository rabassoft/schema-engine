import { describe, expect, it } from 'vitest';
import {
  appendReferencePath,
  copyDocumentPath,
  copyReferenceChain,
  createResolvedSchemaCursor,
  referenceDiagnosticParameters,
} from '../src/internal/schema-reference.js';

describe('M11 Internal reference foundations', () => {
  it('copies and freezes document paths without retaining caller arrays', () => {
    const source: Array<string | number> = ['$defs', '__proto__', 0, '\ud800'];
    const copied = copyDocumentPath(source);

    source[1] = 'changed';
    source.push('later');

    expect(copied).toEqual(['$defs', '__proto__', 0, '\ud800']);
    expect(copied).not.toBe(source);
    expect(Object.isFrozen(copied)).toBe(true);
  });

  it('copies every nested path when copying and appending a chain', () => {
    const first: Array<string | number> = ['properties', 'field', '$ref'];
    const source = [first];
    const copied = copyReferenceChain(source);
    const appendedPath: Array<string | number> = ['$defs', 'field', '$ref'];
    const appended = appendReferencePath(copied, appendedPath);

    first[0] = 'changed';
    source.push(['later']);
    appendedPath[0] = 'changed';

    expect(copied).toEqual([['properties', 'field', '$ref']]);
    expect(appended).toEqual([
      ['properties', 'field', '$ref'],
      ['$defs', 'field', '$ref'],
    ]);
    expect(appended[0]).not.toBe(copied[0]);
    expect(Object.isFrozen(copied)).toBe(true);
    expect(Object.isFrozen(copied[0])).toBe(true);
    expect(Object.isFrozen(appended)).toBe(true);
    expect(Object.isFrozen(appended[1])).toBe(true);
  });

  it('retains the exact schema while isolating immutable cursor provenance', () => {
    const schema: Record<string, unknown> = { type: 'string' };
    const documentPath: Array<string | number> = ['$defs', 'field'];
    const referencePath: Array<string | number> = [
      'properties',
      'field',
      '$ref',
    ];
    const cursor = createResolvedSchemaCursor(schema, documentPath, [
      referencePath,
    ]);

    documentPath[1] = 'changed';
    referencePath[0] = 'changed';
    schema.type = 'number';

    expect(cursor.schema).toBe(schema);
    expect(cursor.schema.type).toBe('number');
    expect(Object.isFrozen(schema)).toBe(false);
    expect(cursor.documentPath).toEqual(['$defs', 'field']);
    expect(cursor.referenceChain).toEqual([['properties', 'field', '$ref']]);
    expect(Object.isFrozen(cursor)).toBe(true);
    expect(Object.isFrozen(cursor.documentPath)).toBe(true);
    expect(Object.isFrozen(cursor.referenceChain)).toBe(true);
    expect(Object.isFrozen(cursor.referenceChain[0])).toBe(true);
  });

  it('copies and freezes every diagnostic path without retaining inputs', () => {
    const base = { reason: 'missing-target', reference: '#/$defs/field' };
    const targetDocumentPath: Array<string | number> = ['$defs', 'field'];
    const firstDocumentPath: Array<string | number> = ['$defs', 'first'];
    const referencePath: Array<string | number> = [
      'properties',
      'field',
      '$ref',
    ];
    const parameters = referenceDiagnosticParameters(base, {
      targetDocumentPath,
      firstDocumentPath,
      referenceChain: [referencePath],
    });

    base.reason = 'changed';
    targetDocumentPath[1] = 'changed';
    firstDocumentPath[1] = 'changed';
    referencePath[0] = 'changed';

    expect(parameters).toEqual({
      reason: 'missing-target',
      reference: '#/$defs/field',
      targetDocumentPath: ['$defs', 'field'],
      firstDocumentPath: ['$defs', 'first'],
      referenceChain: [['properties', 'field', '$ref']],
    });
    expect(Object.isFrozen(parameters)).toBe(true);
    expect(Object.isFrozen(parameters.targetDocumentPath)).toBe(true);
    expect(Object.isFrozen(parameters.firstDocumentPath)).toBe(true);
    expect(Object.isFrozen(parameters.referenceChain)).toBe(true);
    expect(
      Object.isFrozen(
        (parameters.referenceChain as readonly (readonly unknown[])[])[0],
      ),
    ).toBe(true);
  });
});
