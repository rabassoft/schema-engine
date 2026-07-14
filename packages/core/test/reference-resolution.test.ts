import { describe, expect, it } from 'vitest';
import {
  decodeSchemaReference,
  inspectDefinitionRegistry,
  resolveSchemaReference,
  type DecodedSchemaReference,
} from '../src/internal/schema-reference.js';

function decodedTokens(reference: string): readonly string[] {
  const decoded: DecodedSchemaReference = decodeSchemaReference(reference);
  expect(decoded.kind).toBe('decoded');
  if (decoded.kind !== 'decoded') throw new Error('Reference did not decode.');
  return decoded.tokens;
}

describe('M11 Internal definition registry inspection', () => {
  it('distinguishes absence and an empty ordinary registry', () => {
    const absent = inspectDefinitionRegistry({ type: 'object' });
    const empty = inspectDefinitionRegistry({
      $defs: Object.create(null) as Record<string, unknown>,
    });

    expect(absent).toEqual({ kind: 'absent', entries: [], problems: [] });
    expect(empty).toEqual({ kind: 'indexed', entries: [], problems: [] });
    expect(Object.isFrozen(absent)).toBe(true);
    expect(Object.isFrozen(empty.entries)).toBe(true);
  });

  it('rejects invalid exteriors without invoking accessors', () => {
    let reads = 0;
    const accessorRoot: Record<string, unknown> = {};
    Object.defineProperty(accessorRoot, '$defs', {
      enumerable: true,
      get: () => {
        reads += 1;
        return {};
      },
    });
    const nonEnumerableRoot: Record<string, unknown> = {};
    Object.defineProperty(nonEnumerableRoot, '$defs', {
      enumerable: false,
      value: {},
    });

    expect(inspectDefinitionRegistry(accessorRoot)).toMatchObject({
      kind: 'invalid-exterior',
      problems: [
        {
          documentPath: ['$defs'],
          expected: 'own enumerable ordinary definition object',
          actualType: 'accessor',
        },
      ],
    });
    expect(inspectDefinitionRegistry(nonEnumerableRoot)).toMatchObject({
      kind: 'invalid-exterior',
      problems: [{ actualType: 'object' }],
    });
    expect(reads).toBe(0);
  });

  it.each([
    ['array', []],
    ['null', null],
    ['string', 'definitions'],
    ['class instance', new (class Definitions {})()],
  ])('rejects a %s registry exterior', (_label, value) => {
    const result = inspectDefinitionRegistry({ $defs: value });

    expect(result.kind).toBe('invalid-exterior');
    expect(result.entries).toEqual([]);
    expect(result.problems).toHaveLength(1);
  });

  it('indexes valid entries in key order and continues after invalid entries', () => {
    let contentReads = 0;
    const first: Record<string, unknown> = {};
    Object.defineProperty(first, 'type', {
      enumerable: true,
      get: () => {
        contentReads += 1;
        return 'string';
      },
    });
    const last = { type: 'number' };
    const definitions: Record<string, unknown> = {
      first,
      invalid: 1,
      last,
    };
    Object.defineProperty(definitions, 'accessor', {
      enumerable: true,
      get: () => {
        contentReads += 1;
        return {};
      },
    });

    const result = inspectDefinitionRegistry({ $defs: definitions });

    expect(result.kind).toBe('indexed');
    expect(result.entries.map(({ name }) => name)).toEqual(['first', 'last']);
    expect(result.entries[0]?.schema).toBe(first);
    expect(result.entries[1]?.schema).toBe(last);
    expect(result.problems).toEqual([
      {
        documentPath: ['$defs', 'invalid'],
        definition: 'invalid',
        expected: 'ordinary schema object',
        actualType: 'number',
      },
      {
        documentPath: ['$defs', 'accessor'],
        definition: 'accessor',
        expected: 'ordinary schema object',
        actualType: 'accessor',
      },
    ]);
    expect(contentReads).toBe(0);
    expect(Object.isFrozen(result.entries)).toBe(true);
    expect(Object.isFrozen(result.entries[0]?.documentPath)).toBe(true);
    expect(Object.isFrozen(result.problems[0]?.documentPath)).toBe(true);
  });
});

describe('M11 Internal URI fragment and JSON Pointer decoding', () => {
  it.each([
    ['%', 'invalid-percent-encoding'],
    ['schema%GG', 'invalid-percent-encoding'],
    ['#/$defs/a b', 'invalid-uri-reference'],
    ['#/$defs/é', 'invalid-uri-reference'],
    ['#/$defs/a#b', 'invalid-uri-reference'],
    ['schema[invalid]', 'invalid-uri-reference'],
    ['https://[::1/schema', 'invalid-uri-reference'],
    ['schema.json#/$defs/a', 'non-fragment-reference'],
    ['schema.json', 'non-fragment-reference'],
    ['#anchor', 'plain-name-fragment-not-supported'],
    ['#/%ED%A0%80/value', 'invalid-percent-encoding'],
    ['#/$defs/a~2b', 'invalid-pointer-escape'],
    ['#', 'outside-definitions'],
    ['#/$defs', 'outside-definitions'],
    ['#/properties/value', 'outside-definitions'],
  ])('classifies %s as %s', (reference, reason) => {
    expect(decodeSchemaReference(reference)).toEqual({
      kind: 'invalid',
      reason,
    });
  });

  it('classifies a structurally valid external IPv6 URI before rejecting scope', () => {
    expect(decodeSchemaReference('https://[::1]/schema#/$defs/value')).toEqual({
      kind: 'invalid',
      reason: 'non-fragment-reference',
    });
  });

  it.each([
    ['#/%24defs/a%2Fb', ['$defs', 'a', 'b']],
    ['#/$defs/a~1b~0c', ['$defs', 'a/b~c']],
    ['#/$defs/%E2%82%AC', ['$defs', '€']],
    ['#/$defs/', ['$defs', '']],
    ['#/$defs/%252F', ['$defs', '%2F']],
    ['#/$defs/a?b', ['$defs', 'a?b']],
    ['#/$defs/%23', ['$defs', '#']],
  ])('decodes %s exactly once', (reference, tokens) => {
    const result = decodeSchemaReference(reference);

    expect(result).toEqual({ kind: 'decoded', tokens });
    if (result.kind === 'decoded') {
      expect(Object.isFrozen(result)).toBe(true);
      expect(Object.isFrozen(result.tokens)).toBe(true);
    }
  });
});

describe('M11 Internal mechanical target resolution', () => {
  it('resolves ordinary targets and preserves exact schema identity/provenance', () => {
    const target = { type: 'string' };
    const referencePath = ['properties', 'name', '$ref'] as const;
    const root = { $defs: { target } };
    const result = resolveSchemaReference(
      root,
      decodedTokens('#/$defs/target'),
      [referencePath],
    );

    expect(result.kind).toBe('resolved');
    if (result.kind !== 'resolved') return;
    expect(result.cursor.schema).toBe(target);
    expect(result.cursor.documentPath).toEqual(['$defs', 'target']);
    expect(result.cursor.referenceChain).toEqual([referencePath]);
    expect(Object.isFrozen(result.cursor.documentPath)).toBe(true);
    expect(Object.isFrozen(result.cursor.referenceChain[0])).toBe(true);
    expect(Object.isFrozen(target)).toBe(false);
  });

  it('treats an own enumerable __proto__ member as an ordinary token', () => {
    const target = { type: 'boolean' };
    const definitions: Record<string, unknown> = {};
    Object.defineProperty(definitions, '__proto__', {
      enumerable: true,
      value: target,
    });
    const result = resolveSchemaReference(
      { $defs: definitions },
      decodedTokens('#/$defs/__proto__'),
      [],
    );

    expect(result.kind).toBe('resolved');
    if (result.kind === 'resolved') expect(result.cursor.schema).toBe(target);
  });

  it('uses numeric path segments only after resolving existing array elements', () => {
    const target = { type: 'integer' };
    const result = resolveSchemaReference(
      { $defs: { holder: { values: [target] } } },
      decodedTokens('#/$defs/holder/values/0'),
      [],
    );

    expect(result.kind).toBe('resolved');
    if (result.kind === 'resolved') {
      expect(result.cursor.documentPath).toEqual([
        '$defs',
        'holder',
        'values',
        0,
      ]);
      expect(result.cursor.schema).toBe(target);
    }
  });

  it.each(['-', '+1', '01', ' 1', '1.0'])(
    'rejects non-canonical array token %s',
    (token) => {
      const result = resolveSchemaReference(
        { $defs: { holder: { values: [{}] } } },
        ['$defs', 'holder', 'values', token],
        [],
      );

      expect(result).toEqual({
        kind: 'invalid',
        reason: 'non-canonical-array-index',
      });
    },
  );

  it('reports canonical oversized/out-of-range array tokens as missing strings', () => {
    const values: unknown[] = [{}];
    Object.defineProperty(values, '4294967296', {
      enumerable: true,
      value: { type: 'string' },
    });
    const result = resolveSchemaReference(
      { $defs: { holder: { values } } },
      ['$defs', 'holder', 'values', '4294967296'],
      [],
    );

    expect(result).toEqual({
      kind: 'unresolved',
      reason: 'missing-target',
      targetDocumentPath: ['$defs', 'holder', 'values', '4294967296'],
    });
  });

  it.each([
    ['missing-target', [] as unknown[]],
    [
      'non-enumerable-target',
      (() => {
        const values: unknown[] = [];
        Object.defineProperty(values, '0', {
          enumerable: false,
          value: {},
        });
        return values;
      })(),
    ],
    [
      'accessor-target',
      (() => {
        const values: unknown[] = [];
        Object.defineProperty(values, '0', {
          enumerable: true,
          get: () => {
            throw new Error('must not run');
          },
        });
        return values;
      })(),
    ],
  ])('reports a sparse/descriptor array failure as %s', (reason, values) => {
    values.length = 1;
    const result = resolveSchemaReference(
      { $defs: { holder: { values } } },
      ['$defs', 'holder', 'values', '0'],
      [],
    );

    expect(result).toEqual({
      kind: 'unresolved',
      reason,
      targetDocumentPath: ['$defs', 'holder', 'values', '0'],
    });
  });

  it('does not resolve inherited or accessor object members', () => {
    let reads = 0;
    const holder: Record<string, unknown> = {};
    Object.defineProperty(holder, 'accessor', {
      enumerable: true,
      get: () => {
        reads += 1;
        return {};
      },
    });
    const root = { $defs: { holder } };
    Object.defineProperty(Object.prototype, 'inheritedReferenceTarget', {
      configurable: true,
      value: {},
    });
    try {
      expect(
        resolveSchemaReference(
          root,
          ['$defs', 'holder', 'inheritedReferenceTarget'],
          [],
        ),
      ).toMatchObject({ kind: 'unresolved', reason: 'missing-target' });
    } finally {
      Reflect.deleteProperty(Object.prototype, 'inheritedReferenceTarget');
    }
    expect(
      resolveSchemaReference(root, ['$defs', 'holder', 'accessor'], []),
    ).toMatchObject({ kind: 'unresolved', reason: 'accessor-target' });
    expect(reads).toBe(0);
  });

  it('stops a non-schema intermediate/final value at its exact decoded prefix', () => {
    const root = { $defs: { target: { nested: 1 }, final: [] } };

    expect(
      resolveSchemaReference(
        root,
        ['$defs', 'target', 'nested', 'unvisited'],
        [],
      ),
    ).toEqual({
      kind: 'unresolved',
      reason: 'non-schema-target',
      targetDocumentPath: ['$defs', 'target', 'nested'],
    });
    expect(resolveSchemaReference(root, ['$defs', 'final'], [])).toEqual({
      kind: 'unresolved',
      reason: 'non-schema-target',
      targetDocumentPath: ['$defs', 'final'],
    });
  });

  it('resolves a deeply finite pointer iteratively', () => {
    const depth = 5_000;
    const target = { type: 'string' };
    const holder: Record<string, unknown> = {};
    let current = holder;
    const tokens = ['$defs', 'holder'];
    for (let index = 0; index < depth; index += 1) {
      const next: Record<string, unknown> = {};
      current.next = next;
      current = next;
      tokens.push('next');
    }
    current.target = target;
    tokens.push('target');

    const result = resolveSchemaReference({ $defs: { holder } }, tokens, []);

    expect(result.kind).toBe('resolved');
    if (result.kind === 'resolved') expect(result.cursor.schema).toBe(target);
  });
});
