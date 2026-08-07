// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import { compileFormDefinition } from '@rabassoft/schema-engine';
import type { ReactRendererComponent } from '../src/contracts.js';
import {
  createReactNativeRendererRegistry,
  createReactRendererRegistry,
} from '../src/index.js';
import { resolveReactRenderer } from '../src/internal/registry.js';
import { describe, expect, it, vi } from 'vitest';

const schema = Object.freeze({
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: Object.freeze({
    name: Object.freeze({ type: 'string' }),
  }),
});
const compilation = compileFormDefinition({ schema });
if (!compilation.success) throw new Error('Registry fixture must compile.');
const field = compilation.definition.fields[0];
if (field === undefined) throw new Error('Registry fixture needs one field.');
const nativeCompilation = compileFormDefinition({
  schema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    properties: {
      fixed: { type: 'string', const: '' },
      multiple: {
        type: 'array',
        items: { type: 'string', enum: ['one', 'two'] },
        uniqueItems: true,
      },
      choice: { type: 'string', enum: ['one', 'two'] },
      text: { type: 'string' },
      number: { type: 'number' },
      integer: { type: 'integer' },
      toggle: { type: 'boolean' },
    },
  },
});
if (!nativeCompilation.success)
  throw new Error('Native registry fixture must compile.');
const nativeFields = new Map(
  nativeCompilation.definition.fields.map((candidate) => [
    candidate.name,
    candidate,
  ]),
);
const Renderer: ReactRendererComponent = () => null;

describe('React renderer registry', () => {
  it('creates frozen opaque empty registries from both factories', () => {
    for (const result of [
      createReactRendererRegistry(),
      createReactNativeRendererRegistry(),
    ]) {
      expect(result).toMatchObject({ success: true, diagnostics: [] });
      if (!result.success) continue;
      expect(Object.isFrozen(result)).toBe(true);
      expect(Object.isFrozen(result.registry)).toBe(true);
      expect(Object.keys(result.registry)).toEqual([]);
    }
  });

  it('prepends the six exact closed native registrations in rank order', () => {
    const result = createReactNativeRendererRegistry();
    if (!result.success) throw new Error('Expected native registry.');
    for (const [name, id, rank, index] of [
      ['fixed', 'native-fixed', 30, 0],
      ['multiple', 'native-string-enum-array', 30, 1],
      ['choice', 'native-string-enum', 20, 2],
      ['text', 'native-string', 10, 3],
      ['number', 'native-number', 10, 4],
      ['integer', 'native-number', 10, 4],
      ['toggle', 'native-boolean', 10, 5],
    ] as const) {
      const candidate = nativeFields.get(name);
      if (candidate === undefined) throw new Error(`Missing ${name} field.`);
      const resolution = resolveReactRenderer(result.registry, candidate);
      expect(resolution.registration).toMatchObject({ id, priority: 0, index });
      expect(resolution.registration?.tester(candidate)).toBe(rank);
    }
  });

  it('lets later consumer registrations override natives only by rank or priority', () => {
    const sameRank = () => null;
    const higherPriority = () => null;
    const result = createReactNativeRendererRegistry([
      { id: 'same-rank', component: sameRank, tester: () => 10 },
      {
        id: 'higher-priority',
        component: higherPriority,
        tester: () => 10,
        priority: 1,
      },
    ]);
    if (!result.success) throw new Error('Expected composed native registry.');
    const resolution = resolveReactRenderer(result.registry, field);
    expect(resolution.registration).toMatchObject({
      id: 'higher-priority',
      priority: 1,
      index: 7,
    });
    expect(resolution.registration?.component).toBe(higherPriority);
  });

  it('rejects consumer duplication of a closed native id atomically', () => {
    const result = createReactNativeRendererRegistry([
      { id: 'native-string', component: Renderer, tester: () => 100 },
    ]);
    expect(result).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'DUPLICATE_RENDERER_ID',
          parameters: {
            id: 'native-string',
            firstIndex: 3,
            duplicateIndex: 6,
          },
        },
      ],
    });
    expect('registry' in result).toBe(false);
  });

  it('rejects sparse/accessor entries without invoking getters', () => {
    const getter = vi.fn(() => ({
      id: 'unsafe',
      component: Renderer,
      tester: () => 1,
    }));
    const registrations = new Array(2);
    Object.defineProperty(registrations, '1', { get: getter });
    const result = createReactRendererRegistry(registrations);
    expect(result.success).toBe(false);
    expect(
      result.diagnostics.map(({ parameters }) => parameters['reason']),
    ).toEqual(['sparse-entry', 'accessor-entry']);
    expect(getter).not.toHaveBeenCalled();
  });

  it('fails closed for a revoked array proxy without throwing', () => {
    const hostile = Proxy.revocable([], {});
    hostile.revoke();
    expect(() => createReactRendererRegistry(hostile.proxy)).not.toThrow();
    expect(createReactRendererRegistry(hostile.proxy)).toMatchObject({
      success: false,
      diagnostics: [{ code: 'INVALID_RENDERER_REGISTRATION' }],
    });
  });

  it('reports registration members in exact order and creates no partial registry', () => {
    const result = createReactRendererRegistry([
      {
        id: ' ',
        component: 'invalid',
        tester: null,
        priority: 1.5,
      } as never,
    ]);
    expect(result.success).toBe(false);
    expect(
      result.diagnostics.map(({ parameters }) => parameters['member']),
    ).toEqual(['id', 'component', 'tester', 'priority']);
    expect('registry' in result).toBe(false);
  });

  it('detects duplicates after structural diagnostics in duplicate order', () => {
    const registration = {
      id: 'same',
      component: Renderer,
      tester: () => 1,
    };
    const result = createReactRendererRegistry([
      registration,
      { ...registration },
      { ...registration },
    ]);
    expect(result.success).toBe(false);
    expect(result.diagnostics).toMatchObject([
      {
        code: 'DUPLICATE_RENDERER_ID',
        parameters: { firstIndex: 0, duplicateIndex: 1 },
      },
      {
        code: 'DUPLICATE_RENDERER_ID',
        parameters: { firstIndex: 0, duplicateIndex: 2 },
      },
    ]);
  });

  it('resolves by rank, then priority, then earliest registration', () => {
    const first = () => null;
    const priority = () => null;
    const later = () => null;
    const result = createReactRendererRegistry([
      { id: 'first', component: first, tester: () => 10 },
      { id: 'priority', component: priority, tester: () => 10, priority: 1 },
      { id: 'later', component: later, tester: () => 10, priority: 1 },
    ]);
    if (!result.success) throw new Error('Expected valid registry.');
    const resolution = resolveReactRenderer(result.registry, field);
    expect(resolution.registration).toMatchObject({ id: 'priority', index: 1 });
    expect(resolution.registration?.component).toBe(priority);
    expect(resolution.diagnostics).toEqual([]);
  });

  it('discards throwing and invalid testers while preserving later candidates', () => {
    const selected = () => null;
    const result = createReactRendererRegistry([
      {
        id: 'throws',
        component: Renderer,
        tester: () => {
          throw new Error('hostile');
        },
      },
      { id: 'invalid', component: Renderer, tester: () => -1 },
      { id: 'selected', component: selected, tester: () => 1 },
    ]);
    if (!result.success) throw new Error('Expected valid registry.');
    const resolution = resolveReactRenderer(result.registry, field);
    expect(resolution.registration?.component).toBe(selected);
    expect(resolution.diagnostics.map(({ code }) => code)).toEqual([
      'RENDERER_TESTER_EXCEPTION',
      'INVALID_RENDERER_TEST_RESULT',
    ]);
  });
});
