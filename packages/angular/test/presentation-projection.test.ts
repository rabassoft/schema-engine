import { Component, ViewChild, computed, input, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  compileFormDefinition,
  type Diagnostic,
  type PresentationSectionDefinition,
  type SchemaValidator,
  type TextResolutionContext,
} from '@rabassoft/schema-engine';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  SchemaFormDirective,
  provideSchemaEngineAngularNative,
  provideSchemaPresentationContainer,
  provideSchemaTextResolver,
  type AngularPresentationContainerRenderModel,
  type AngularPresentationContainerRenderer,
  type AngularControlledFormConfig,
} from '../dist/index.js';
import { AngularTextProjector } from '../dist/text.js';

const schema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: { a: { type: 'string' }, b: { type: 'boolean' } },
} as const;
const compiled = compileFormDefinition({
  schema,
  uiSchema: {
    presentation: [
      {
        kind: 'section',
        id: 'outer',
        label: 'Outer',
        children: [
          {
            kind: 'section',
            id: 'inner',
            label: 'Inner',
            children: ['b'],
          },
        ],
      },
      'a',
    ],
  },
});
if (!compiled.success) throw new Error('presentation Angular fixture failed');
const definition = compiled.definition;
const ungroupedCompilation = compileFormDefinition({ schema });
if (!ungroupedCompilation.success)
  throw new Error('ungrouped Angular fixture failed');
const ungroupedDefinition = ungroupedCompilation.definition;
const validator: SchemaValidator = Object.freeze({
  validate: () => ({ valid: true, issues: [] }),
});

@Component({
  standalone: true,
  imports: [SchemaFormDirective],
  template: `<form
    [schemaForm]="config()"
    (schemaDiagnostics)="diagnostics.push($event)"
  ></form>`,
})
class PresentationHost {
  readonly locale = signal('en');
  readonly definitionState = signal(definition);
  readonly diagnostics: (readonly Diagnostic[])[] = [];
  readonly config = computed<AngularControlledFormConfig<object>>(() => ({
    formId: 'presentation.form',
    definition: this.definitionState(),
    schema,
    value: { a: 'Ada', b: true },
    baselineValue: { a: 'Ada', b: true },
    locale: this.locale(),
    validator,
  }));
  @ViewChild(SchemaFormDirective) form?: SchemaFormDirective<object>;
}

@Component({
  selector: 'partial-section-host',
  standalone: true,
  template: '',
})
class PartialSectionHost {}

@Component({
  selector: 'throwing-section-host',
  standalone: true,
  template: '',
})
class ThrowingSectionHost implements AngularPresentationContainerRenderer {
  readonly presentation =
    input.required<AngularPresentationContainerRenderModel>();

  constructor() {
    throw new Error('hidden');
  }
}

@Component({
  selector: 'binding-section-host',
  standalone: true,
  template: '<partial-section-host />',
  imports: [PartialSectionHost],
})
class BindingSectionHost implements AngularPresentationContainerRenderer {
  readonly presentation = input.required<
    AngularPresentationContainerRenderModel,
    AngularPresentationContainerRenderModel
  >({
    transform: () => {
      throw new Error('hidden');
    },
  });
}

describe('Angular static presentation projection', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('renders nested accessible fieldsets in forest order with collision-free IDs', () => {
    TestBed.configureTestingModule({
      providers: [provideSchemaEngineAngularNative()],
    });
    const fixture = TestBed.createComponent(PresentationHost);
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;

    expect(
      Array.from(root.querySelectorAll('legend'), ({ textContent }) =>
        textContent?.trim(),
      ),
    ).toEqual(['Outer', 'Inner']);
    const expectedOuter = `se-${encodeURIComponent(
      JSON.stringify(['presentation.form', 'section', 'outer']),
    )}--legend`;
    const expectedInner = `se-${encodeURIComponent(
      JSON.stringify(['presentation.form', 'section', 'inner']),
    )}--legend`;
    expect(root.ownerDocument.getElementById(expectedOuter)).not.toBeNull();
    expect(root.ownerDocument.getElementById(expectedInner)).not.toBeNull();
    expect(root.querySelectorAll('fieldset')).toHaveLength(2);
    expect(root.querySelectorAll('input')).toHaveLength(2);
  });

  it('reprojects section labels for locale without recreating the forest', () => {
    const calls: { text: string; context: TextResolutionContext }[] = [];
    TestBed.configureTestingModule({
      providers: [
        provideSchemaEngineAngularNative(),
        provideSchemaTextResolver({
          resolve(text, context) {
            calls.push({ text, context });
            return 'section' in context ? `${context.locale}:${text}` : text;
          },
        }),
      ],
    });
    const fixture = TestBed.createComponent(PresentationHost);
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;
    const outer = root.querySelector('fieldset');
    expect(root.querySelector('legend')?.textContent?.trim()).toBe('en:Outer');

    fixture.componentInstance.locale.set('ca');
    fixture.detectChanges();
    TestBed.tick();
    expect(root.querySelector('fieldset')).toBe(outer);
    expect(root.querySelector('legend')?.textContent?.trim()).toBe('ca:Outer');
    const sectionCalls = calls.filter(({ context }) => 'section' in context);
    expect(sectionCalls).toHaveLength(4);
    expect(sectionCalls[0]?.context).toMatchObject({
      formId: 'presentation.form',
      locale: 'en',
      member: 'label',
    });
    expect(Object.isFrozen(sectionCalls[0]?.context)).toBe(true);
  });

  it('destroys section hosts and descendants on accepted definition replacement', () => {
    TestBed.configureTestingModule({
      providers: [provideSchemaEngineAngularNative()],
    });
    const fixture = TestBed.createComponent(PresentationHost);
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;
    const oldSection = root.querySelector('fieldset');
    expect(oldSection).not.toBeNull();

    fixture.componentInstance.definitionState.set(ungroupedDefinition);
    fixture.detectChanges();
    TestBed.tick();
    expect(oldSection?.isConnected).toBe(false);
    expect(root.querySelector('fieldset')).toBeNull();
    expect(root.querySelectorAll('input')).toHaveLength(2);
  });

  it.each([
    [
      'exception',
      (): unknown => {
        throw new Error('hidden');
      },
    ],
    ['non-string-result', (): unknown => 1],
    ['blank-string-result', (): unknown => '  '],
  ] as const)('falls back safely for %s section text', (reason, resolve) => {
    TestBed.configureTestingModule({
      providers: [provideSchemaTextResolver({ resolve: resolve as never })],
    });
    const section = definition.presentation[0] as PresentationSectionDefinition;
    const result = TestBed.inject(AngularTextProjector).projectSection(
      section,
      'form',
      'en',
    );
    expect(result).toEqual({
      text: 'Outer',
      diagnostics: [
        {
          code: 'TEXT_RESOLUTION_FAILED',
          severity: 'warning',
          source: 'runtime',
          parameters: { sectionId: 'outer', member: 'label', reason },
          fallbackMessage: 'Section text resolution failed.',
        },
      ],
    });
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.diagnostics[0]?.parameters)).toBe(true);
  });

  it.each(['creation', 'binding'])(
    'isolates section-host %s failure',
    (mode) => {
      TestBed.configureTestingModule({
        providers: [
          provideSchemaEngineAngularNative(),
          provideSchemaPresentationContainer({
            id: `broken-section-${mode}`,
            renderer:
              mode === 'creation' ? ThrowingSectionHost : BindingSectionHost,
            tester: (candidate) =>
              candidate.kind === 'section' && candidate.id === 'outer'
                ? 10
                : null,
          }),
        ],
      });
      const fixture = TestBed.createComponent(PresentationHost);
      fixture.detectChanges();
      TestBed.tick();
      const root = fixture.nativeElement as HTMLElement;

      expect(root.querySelector('fieldset')).toBeNull();
      expect(root.querySelector('partial-section-host')).toBeNull();
      expect(root.querySelector('input[type="text"]')).not.toBeNull();
      expect(
        fixture.componentInstance.diagnostics
          .flat()
          .filter(({ code }) => code === 'SECTION_HOST_INSTANTIATION_FAILED'),
      ).toEqual([
        {
          code: 'SECTION_HOST_INSTANTIATION_FAILED',
          severity: 'error',
          source: 'runtime',
          parameters: { sectionId: 'outer' },
          fallbackMessage: 'Section host could not be instantiated.',
        },
      ]);
    },
  );
});
