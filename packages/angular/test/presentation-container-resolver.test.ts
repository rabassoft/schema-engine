import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { compileFormDefinition } from '@rabassoft/schema-engine';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  provideSchemaPresentationContainer,
  type AngularPresentationContainerDefinition,
  type AngularPresentationContainerRegistration,
  type AngularPresentationContainerRenderer,
  type AngularPresentationContainerRenderModel,
} from '../src/index.js';
import {
  AngularPresentationContainerResolver,
  SCHEMA_PRESENTATION_CONTAINER_REGISTRATIONS,
} from '../src/presentation-container.js';

@Component({ selector: 'test-container', standalone: true, template: '' })
class TestContainer implements AngularPresentationContainerRenderer {
  readonly presentation =
    input.required<AngularPresentationContainerRenderModel>();
}

const definition = getDefinition();
const registration = (
  id: string,
  rank: number | null,
  priority = 0,
): AngularPresentationContainerRegistration => ({
  id,
  renderer: TestContainer,
  tester: () => rank,
  priority,
});

describe('AngularPresentationContainerResolver', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('selects by rank, priority and earliest registration', () => {
    TestBed.configureTestingModule({
      providers: [
        AngularPresentationContainerResolver,
        provideSchemaPresentationContainer(registration('low', 1, 100)),
        provideSchemaPresentationContainer(registration('first', 2)),
        provideSchemaPresentationContainer(registration('winner', 2, 1)),
        provideSchemaPresentationContainer(registration('later', 2, 1)),
      ],
    });
    const result = TestBed.inject(AngularPresentationContainerResolver).resolve(
      definition,
    );
    expect(result).toMatchObject({
      success: true,
      registration: { id: 'winner' },
      diagnostics: [],
    });
  });

  it('reports the exact first member defect per registration, then duplicates', () => {
    const getter = vi.fn();
    const accessor = Object.defineProperty(
      {
        renderer: TestContainer,
        tester: () => 1,
      },
      'id',
      { enumerable: true, get: getter },
    );
    const invalid = [
      null,
      {},
      accessor,
      { id: '', renderer: TestContainer, tester: () => 1 },
      { id: 'renderer', renderer: 1, tester: () => 1 },
      { id: 'tester', renderer: TestContainer, tester: 1 },
      {
        id: 'priority',
        renderer: TestContainer,
        tester: () => 1,
        priority: Number.POSITIVE_INFINITY,
      },
      registration('same', 1),
      registration('same', 2),
    ];
    TestBed.configureTestingModule({
      providers: [
        AngularPresentationContainerResolver,
        ...invalid.map((value) => ({
          provide: SCHEMA_PRESENTATION_CONTAINER_REGISTRATIONS,
          multi: true,
          useValue: value,
        })),
      ],
    });
    const resolver = TestBed.inject(AngularPresentationContainerResolver);
    expect(resolver.ready).toBe(false);
    expect(
      resolver.configurationDiagnostics.map(({ code, parameters }) => ({
        code,
        parameters,
      })),
    ).toEqual([
      {
        code: 'INVALID_PRESENTATION_CONTAINER_REGISTRATION',
        parameters: {
          index: 0,
          member: 'registration',
          expected: 'object',
          reason: 'registration-not-object',
        },
      },
      {
        code: 'INVALID_PRESENTATION_CONTAINER_REGISTRATION',
        parameters: {
          index: 1,
          member: 'id',
          expected: 'non-empty string',
          reason: 'member-missing',
        },
      },
      {
        code: 'INVALID_PRESENTATION_CONTAINER_REGISTRATION',
        parameters: {
          index: 2,
          member: 'id',
          expected: 'non-empty string',
          reason: 'member-accessor',
        },
      },
      {
        code: 'INVALID_PRESENTATION_CONTAINER_REGISTRATION',
        parameters: {
          index: 3,
          member: 'id',
          expected: 'non-empty string',
          reason: 'invalid-id',
        },
      },
      {
        code: 'INVALID_PRESENTATION_CONTAINER_REGISTRATION',
        parameters: {
          index: 4,
          member: 'renderer',
          expected: 'Angular component type',
          reason: 'invalid-renderer',
        },
      },
      {
        code: 'INVALID_PRESENTATION_CONTAINER_REGISTRATION',
        parameters: {
          index: 5,
          member: 'tester',
          expected: 'callable tester',
          reason: 'invalid-tester',
        },
      },
      {
        code: 'INVALID_PRESENTATION_CONTAINER_REGISTRATION',
        parameters: {
          index: 6,
          member: 'priority',
          expected: 'finite integer',
          reason: 'invalid-priority',
        },
      },
      {
        code: 'DUPLICATE_PRESENTATION_CONTAINER_RENDERER_ID',
        parameters: { index: 8, id: 'same', firstIndex: 7 },
      },
    ]);
    expect(getter).not.toHaveBeenCalled();
    expect(resolver.resolve(definition)).toEqual({
      success: false,
      diagnostics: resolver.configurationDiagnostics,
    });
  });

  it('inspects every registration member through own descriptors only', () => {
    const getters = Array.from({ length: 4 }, () => vi.fn());
    const accessor = (
      member: 'renderer' | 'tester' | 'priority',
      index: number,
    ) =>
      Object.defineProperty(
        {
          id: `${member}-accessor`,
          renderer: TestContainer,
          tester: () => 1,
        },
        member,
        { enumerable: true, get: getters[index]! },
      );
    const values = [
      [],
      (): void => undefined,
      { id: 'missing-renderer' },
      accessor('renderer', 0),
      { id: 'missing-tester', renderer: TestContainer },
      accessor('tester', 1),
      accessor('priority', 2),
      Object.defineProperty(
        { renderer: TestContainer, tester: () => 1 },
        'id',
        { enumerable: true, get: getters[3]! },
      ),
    ];
    TestBed.configureTestingModule({
      providers: [
        AngularPresentationContainerResolver,
        ...values.map((value) => ({
          provide: SCHEMA_PRESENTATION_CONTAINER_REGISTRATIONS,
          multi: true,
          useValue: value,
        })),
      ],
    });
    expect(
      TestBed.inject(
        AngularPresentationContainerResolver,
      ).configurationDiagnostics.map(({ parameters }) => parameters),
    ).toEqual([
      {
        index: 0,
        member: 'registration',
        expected: 'object',
        reason: 'registration-not-object',
      },
      {
        index: 1,
        member: 'registration',
        expected: 'object',
        reason: 'registration-not-object',
      },
      {
        index: 2,
        member: 'renderer',
        expected: 'Angular component type',
        reason: 'member-missing',
      },
      {
        index: 3,
        member: 'renderer',
        expected: 'Angular component type',
        reason: 'member-accessor',
      },
      {
        index: 4,
        member: 'tester',
        expected: 'callable tester',
        reason: 'member-missing',
      },
      {
        index: 5,
        member: 'tester',
        expected: 'callable tester',
        reason: 'member-accessor',
      },
      {
        index: 6,
        member: 'priority',
        expected: 'finite integer',
        reason: 'member-accessor',
      },
      {
        index: 7,
        member: 'id',
        expected: 'non-empty string',
        reason: 'member-accessor',
      },
    ]);
    for (const getter of getters) expect(getter).not.toHaveBeenCalled();
  });

  it('isolates tester exceptions and invalid results before selecting a fallback', () => {
    const exact = vi.fn(
      (received: AngularPresentationContainerDefinition): number => {
        expect(received).toBe(definition);
        expect(Object.isFrozen(received)).toBe(true);
        return 0;
      },
    );
    TestBed.configureTestingModule({
      providers: [
        AngularPresentationContainerResolver,
        provideSchemaPresentationContainer({
          ...registration('throws', 10),
          tester: () => {
            throw new Error('hidden');
          },
        }),
        provideSchemaPresentationContainer(registration('negative', -1)),
        provideSchemaPresentationContainer({
          ...registration('object', 1),
          tester: () => ({ rank: 10 }) as never,
        }),
        provideSchemaPresentationContainer({
          id: 'fallback',
          renderer: TestContainer,
          tester: exact,
        }),
      ],
    });
    const result = TestBed.inject(AngularPresentationContainerResolver).resolve(
      definition,
    );
    expect(result).toMatchObject({
      success: true,
      registration: { id: 'fallback' },
      diagnostics: [
        {
          code: 'PRESENTATION_CONTAINER_TESTER_EXCEPTION',
          parameters: {
            index: 0,
            id: 'throws',
            presentationKind: 'tabs',
            presentationId: 'tabs',
          },
        },
        {
          code: 'INVALID_PRESENTATION_CONTAINER_TEST_RESULT',
          parameters: { index: 1, actualType: 'number', actualValue: -1 },
        },
        {
          code: 'INVALID_PRESENTATION_CONTAINER_TEST_RESULT',
          parameters: { index: 2, actualType: 'object' },
        },
      ],
    });
    expect(exact).toHaveBeenCalledOnce();
  });

  it('copies and freezes valid registrations without freezing caller values', () => {
    const caller = registration('stable', 1) as {
      id: string;
      renderer: typeof TestContainer;
      tester: () => number | null;
      priority: number;
    };
    TestBed.configureTestingModule({
      providers: [
        AngularPresentationContainerResolver,
        provideSchemaPresentationContainer(caller),
      ],
    });
    const resolver = TestBed.inject(AngularPresentationContainerResolver);
    caller.id = 'mutated';
    caller.priority = 99;
    const result = resolver.resolve(definition);
    expect(result).toMatchObject({
      success: true,
      registration: { id: 'stable', priority: 0 },
    });
    if (!result.success) return;
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.registration)).toBe(true);
    expect(Object.isFrozen(result.diagnostics)).toBe(true);
    expect(Object.isFrozen(caller)).toBe(false);
    expect(Object.isFrozen(TestContainer)).toBe(false);
  });

  it('returns the exact no-match diagnostic', () => {
    TestBed.configureTestingModule({
      providers: [
        AngularPresentationContainerResolver,
        provideSchemaPresentationContainer(registration('none', null)),
      ],
    });
    expect(
      TestBed.inject(AngularPresentationContainerResolver).resolve(definition),
    ).toEqual({
      success: false,
      diagnostics: [
        {
          code: 'NO_PRESENTATION_CONTAINER_MATCH',
          severity: 'error',
          source: 'runtime',
          parameters: {
            presentationKind: 'tabs',
            presentationId: 'tabs',
          },
          fallbackMessage:
            'No presentation container renderer matches the definition.',
        },
      ],
    });
  });
});

function getDefinition(): AngularPresentationContainerDefinition {
  const result = compileFormDefinition({
    schema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: { name: { type: 'string' } },
    },
    uiSchema: {
      presentation: [
        {
          kind: 'tabs',
          id: 'tabs',
          label: 'Tabs',
          panels: [
            {
              kind: 'panel',
              id: 'main',
              label: 'Main',
              children: ['name'],
            },
          ],
        },
      ],
    },
  });
  if (!result.success || result.definition.presentation[0]?.kind !== 'tabs')
    throw new Error('presentation resolver fixture failed');
  return result.definition.presentation[0];
}
