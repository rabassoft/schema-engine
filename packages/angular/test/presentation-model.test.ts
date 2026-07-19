import { TestBed } from '@angular/core/testing';
import {
  compileFormDefinition,
  type TextResolutionContext,
} from '@rabassoft/schema-engine';
import { beforeEach, describe, expect, it } from 'vitest';
import { projectPresentationContainer } from '../src/presentation-model.js';
import {
  AngularTextProjector,
  provideSchemaTextResolver,
} from '../src/text.js';

const compiled = compileFormDefinition({
  schema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    properties: { a: { type: 'string' }, b: { type: 'string' } },
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
            id: 'first',
            label: 'First',
            children: [
              {
                kind: 'grid',
                id: 'grid',
                label: 'Grid',
                columns: 2,
                items: [{ child: 'a' }],
              },
            ],
          },
          {
            kind: 'panel',
            id: 'second',
            label: 'Second',
            children: ['b'],
          },
        ],
      },
    ],
  },
});
if (!compiled.success || compiled.definition.presentation[0]?.kind !== 'tabs')
  throw new Error('presentation model fixture failed');
const tabs = compiled.definition.presentation[0];

describe('advanced presentation text and model projection', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('resolves advanced labels depth-first once per exact identity and locale', () => {
    const calls: Array<{ text: string; context: TextResolutionContext }> = [];
    TestBed.configureTestingModule({
      providers: [
        provideSchemaTextResolver({
          resolve(text, context) {
            calls.push({ text, context });
            return `${context.locale}:${text}`;
          },
        }),
      ],
    });
    const projector = TestBed.inject(AngularTextProjector);
    projector.projectPresentationSubtree(tabs, 'form', 'en');
    expect(
      calls
        .filter(({ context }) => 'presentation' in context)
        .map(({ text }) => text),
    ).toEqual(['Tabs', 'First', 'Grid', 'Second']);

    const first = projectPresentationContainer(tabs, 'form', 'en', projector);
    projector.projectPresentationSubtree(tabs, 'form', 'en');
    expect(calls).toHaveLength(4);
    if (first.model.kind !== 'tabs') throw new Error('tabs model missing');
    expect(first.model.label).toBe('en:Tabs');
    expect(Object.isFrozen(first.model)).toBe(true);
    expect(Object.isFrozen(first.model.panels)).toBe(true);
    expect(Object.isFrozen(first.model.panels[0])).toBe(true);

    projector.projectPresentationSubtree(tabs, 'form', 'es');
    expect(calls).toHaveLength(8);
  });

  it.each([
    [
      'exception',
      (): never => {
        throw new Error('hidden');
      },
    ],
    ['non-string-result', (): unknown => ({ unsafe: true })],
    ['blank-string-result', (): unknown => '  '],
  ] as const)('uses the exact safe fallback for %s', (reason, resolve) => {
    TestBed.configureTestingModule({
      providers: [provideSchemaTextResolver({ resolve: resolve as never })],
    });
    const result = TestBed.inject(
      AngularTextProjector,
    ).projectAdvancedPresentation(tabs, 'form', 'en');
    expect(result).toEqual({
      text: 'Tabs',
      diagnostics: [
        {
          code: 'TEXT_RESOLUTION_FAILED',
          severity: 'warning',
          source: 'runtime',
          parameters: {
            presentationKind: 'tabs',
            presentationKey: tabs.key,
            member: 'label',
            reason,
          },
          fallbackMessage: 'Advanced presentation text resolution failed.',
        },
      ],
    });
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.diagnostics[0]?.parameters)).toBe(true);
  });
});
