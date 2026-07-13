import { Component, input, output } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  compileFormDefinition,
  type Diagnostic,
  type FieldDefinition,
  type FieldRuntimeSnapshot,
} from '@rabassoft/schema-engine';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  AngularRendererResolver,
  SCHEMA_RENDERER_REGISTRATIONS,
  provideSchemaEngineAngular,
  type AngularFieldRenderer,
  type AngularFieldTextSnapshot,
  type AngularRendererRegistration,
} from '../src/index.js';

@Component({ selector: 'test-renderer', standalone: true, template: '' })
class TestRenderer implements AngularFieldRenderer {
  readonly field = input.required<FieldDefinition>();
  readonly snapshot = input.required<FieldRuntimeSnapshot>();
  readonly formId = input.required<string>();
  readonly locale = input.required<string>();
  readonly texts = input.required<AngularFieldTextSnapshot>();
  readonly setValue = output<unknown>();
  readonly removeValue = output<void>();
  readonly fieldFocus = output<void>();
  readonly fieldBlur = output<void>();
  readonly rendererDiagnostics = output<readonly Diagnostic[]>();
}

const field = getField();
const registration = (
  id: string,
  rank: number | null,
  priority = 0,
): AngularRendererRegistration => ({
  id,
  renderer: TestRenderer,
  tester: () => rank,
  priority,
});

describe('AngularRendererResolver', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('selects by rank, priority, then earliest registration', () => {
    TestBed.configureTestingModule({
      providers: [
        provideSchemaEngineAngular(
          registration('low', 1, 100),
          registration('first', 2, 0),
          registration('winner', 2, 1),
          registration('later', 2, 1),
        ),
      ],
    });
    const resolver = TestBed.inject(AngularRendererResolver);
    expect(resolver.ready).toBe(true);
    const result = resolver.resolve(field);
    expect(result.success).toBe(true);
    if (result.success) expect(result.registration.id).toBe('winner');
  });

  it('isolates tester failures and invalid ranks', () => {
    const throwing: AngularRendererRegistration = {
      ...registration('throws', 1),
      tester: () => {
        throw new Error('bad');
      },
    };
    TestBed.configureTestingModule({
      providers: [
        provideSchemaEngineAngular(
          throwing,
          registration('invalid', -1),
          registration('valid', 1),
        ),
      ],
    });
    const result = TestBed.inject(AngularRendererResolver).resolve(field);
    expect(result).toMatchObject({
      success: true,
      registration: { id: 'valid' },
      diagnostics: [
        { code: 'RENDERER_TESTER_EXCEPTION' },
        { code: 'INVALID_RENDERER_TEST_RESULT' },
      ],
    });
  });

  it('blocks all resolution when registrations are invalid', () => {
    TestBed.configureTestingModule({
      providers: [
        provideSchemaEngineAngular(
          registration('duplicate', 1),
          registration('duplicate', 2),
        ),
      ],
    });
    const resolver = TestBed.inject(AngularRendererResolver);
    expect(resolver.ready).toBe(false);
    expect(resolver.resolve(field)).toMatchObject({
      success: false,
      diagnostics: [{ code: 'DUPLICATE_RENDERER_ID' }],
    });
  });

  it('reports independent registration failures without activating a partial registry', () => {
    let executed = false;
    const accessor = {} as Record<string, unknown>;
    Object.defineProperty(accessor, 'id', {
      get: () => {
        throw new Error('must not execute');
      },
    });
    Object.defineProperties(accessor, {
      renderer: { value: TestRenderer, enumerable: true },
      tester: { value: () => 1, enumerable: true },
    });
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SCHEMA_RENDERER_REGISTRATIONS,
          multi: true,
          useValue: null,
        },
        {
          provide: SCHEMA_RENDERER_REGISTRATIONS,
          multi: true,
          useValue: accessor,
        },
        provideSchemaEngineAngular({
          ...registration('valid', 1),
          tester: () => {
            executed = true;
            return 1;
          },
        }),
      ],
    });
    const resolver = TestBed.inject(AngularRendererResolver);
    expect(resolver.ready).toBe(false);
    expect(resolver.configurationDiagnostics).toMatchObject([
      {
        code: 'INVALID_RENDERER_REGISTRATION',
        parameters: { index: 0, reason: 'registration-not-object' },
      },
      {
        code: 'INVALID_RENDERER_REGISTRATION',
        parameters: { index: 1, member: 'id', reason: 'accessor-member' },
      },
    ]);
    expect(resolver.resolve(field).success).toBe(false);
    expect(executed).toBe(false);
  });

  it('snapshots immutable registrations without freezing caller-owned types', () => {
    const caller = registration('stable', 1) as {
      id: string;
      renderer: typeof TestRenderer;
      tester: (field: FieldDefinition) => number | null;
      priority: number;
    };
    TestBed.configureTestingModule({
      providers: [provideSchemaEngineAngular(caller)],
    });
    const resolver = TestBed.inject(AngularRendererResolver);
    caller.id = 'mutated';
    const result = resolver.resolve(field);
    expect(result.success).toBe(true);
    if (!result.success) throw new Error('resolution failed');
    expect(result.registration.id).toBe('stable');
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.registration)).toBe(true);
    expect(Object.isFrozen(result.diagnostics)).toBe(true);
    expect(Object.isFrozen(TestRenderer)).toBe(false);
    expect(Object.isFrozen(caller)).toBe(false);
  });

  it('returns a blocking diagnostic when nothing matches', () => {
    TestBed.configureTestingModule({
      providers: [provideSchemaEngineAngular(registration('none', null))],
    });
    expect(
      TestBed.inject(AngularRendererResolver).resolve(field),
    ).toMatchObject({
      success: false,
      diagnostics: [{ code: 'NO_RENDERER_MATCH' }],
    });
  });
});

function getField(): FieldDefinition {
  const result = compileFormDefinition({
    schema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: { name: { type: 'string' } },
    },
  });
  if (!result.success || result.definition.fields[0] === undefined)
    throw new Error('fixture compilation failed');
  return result.definition.fields[0];
}
