import {
  Component,
  ViewChild,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  compileFormDefinition,
  type ControlledFormRuntimeOptions,
  type Diagnostic,
  type FieldDefinition,
  type FormOperation,
} from '@rabassoft/schema-engine';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  SchemaFieldOutletDirective,
  SchemaFormDirective,
  provideSchemaEngineAngular,
  provideSchemaTextResolver,
  type AngularRendererType,
} from '../dist/index.js';
import { FakeRenderer } from '../dist/testing/fake-renderer.js';

const compiled = compileFormDefinition({
  schema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    properties: {
      name: { type: 'string', enum: ['Ada', 'Grace'] },
      age: { type: 'integer' },
    },
  },
});
if (!compiled.success || compiled.definition.fields[0] === undefined)
  throw new Error('fixture compilation failed');
const definition = compiled.definition;
const field = definition.fields[0];
const ageField = definition.fields[1];
if (ageField === undefined) throw new Error('age fixture compilation failed');
const alienField = compileAlienField();
const schema = Object.freeze({});
const validator = Object.freeze({
  validate: () => ({ valid: true as const, issues: [] }),
});

@Component({
  standalone: true,
  imports: [SchemaFormDirective],
  template: `<div
    [schemaForm]="config()"
    (schemaOperation)="operations.push($event)"
    (schemaDiagnostics)="diagnostics.push($event)"
  ></div>`,
})
class FormHost {
  readonly config = signal(createConfig());
  readonly operations: FormOperation[] = [];
  readonly diagnostics: (readonly Diagnostic[])[] = [];
  @ViewChild(SchemaFormDirective) form?: SchemaFormDirective<
    Record<string, unknown>
  >;
}

@Component({
  standalone: true,
  imports: [SchemaFormDirective, SchemaFieldOutletDirective],
  template: `<div
    [schemaForm]="config()"
    (schemaOperation)="operations.push($event)"
    (schemaDiagnostics)="diagnostics.push($event)"
  >
    <ng-container [schemaFieldOutlet]="field()" />
  </div>`,
})
class OutletHost {
  readonly config = signal(createConfig());
  readonly field = signal(field);
  readonly operations: FormOperation[] = [];
  readonly diagnostics: (readonly Diagnostic[])[] = [];
  @ViewChild(SchemaFormDirective) form?: SchemaFormDirective<
    Record<string, unknown>
  >;
}

describe('Angular adapter directives', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    FakeRenderer.latest = undefined;
    FakeRenderer.created = 0;
    FakeRenderer.destroyed = 0;
  });

  it('projects snapshots and emits controlled operations', () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    TestBed.tick();
    const host = fixture.componentInstance;
    expect(host.form?.ready()).toBe(true);
    expect(host.form?.snapshot()?.value).toEqual({ name: 'Ada' });

    host.form?.requestSetValue(['name'], 'Grace');
    expect(host.operations).toHaveLength(1);
    expect(host.form?.snapshot()?.value).toEqual({ name: 'Ada' });

    host.config.set(createConfig({ value: { name: 'Grace' } }));
    fixture.detectChanges();
    TestBed.tick();
    expect(host.form?.snapshot()?.value).toEqual({ name: 'Grace' });
  });

  it('preserves a valid runtime when replacement creation fails', async () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    TestBed.tick();
    const host = fixture.componentInstance;
    const previous = host.form?.snapshot();
    host.config.set(
      createConfig({
        formId: '',
        value: { name: 'Rejected' },
      }),
    );
    fixture.detectChanges();
    TestBed.tick();
    await fixture.whenStable();
    expect(host.form?.schemaForm().formId).toBe('');
    expect(host.form?.snapshot()).toBe(previous);
    expect(host.diagnostics.at(-1)?.[0]?.code).toBe('INVALID_RUNTIME_OPTIONS');
  });

  it('creates a renderer with reactive bindings and forwards outputs', () => {
    TestBed.configureTestingModule({
      providers: [
        provideSchemaEngineAngular({
          id: 'fake',
          renderer: FakeRenderer,
          tester: () => 1,
        }),
      ],
    });
    const fixture = TestBed.createComponent(OutletHost);
    fixture.detectChanges();
    TestBed.tick();
    const renderer = FakeRenderer.latest;
    expect(renderer).toBeDefined();
    if (renderer === undefined) throw new Error('renderer was not created');
    expect(renderer.field()).toBe(field);
    expect(renderer.snapshot().presence).toEqual({
      kind: 'value',
      value: 'Ada',
    });

    renderer.setValue.emit('Grace');
    renderer.removeValue.emit();
    expect(fixture.componentInstance.operations).toMatchObject([
      { type: 'set-value', value: 'Grace' },
      { type: 'remove-value' },
    ]);

    renderer.fieldFocus.emit();
    TestBed.tick();
    expect(renderer.snapshot().focused).toBe(true);
    renderer.fieldBlur.emit();
    TestBed.tick();
    expect(renderer.snapshot()).toMatchObject({
      focused: false,
      touched: true,
    });

    fixture.componentInstance.config.set(
      createConfig({
        value: { name: 'Grace' },
        locale: 'ca',
      }),
    );
    fixture.detectChanges();
    TestBed.tick();
    expect(FakeRenderer.latest).toBe(renderer);
    expect(renderer.snapshot().presence).toEqual({
      kind: 'value',
      value: 'Grace',
    });
    expect(renderer.locale()).toBe('ca');
    expect(FakeRenderer.destroyed).toBe(0);
  });

  it('reprojects choice texts by identity and locale without replacing the renderer', () => {
    let choiceCalls = 0;
    TestBed.configureTestingModule({
      providers: [
        provideSchemaTextResolver({
          resolve(text, context) {
            if (context.member !== 'choice') return text;
            choiceCalls += 1;
            if (context.choice.value === 'Grace') throw new Error('hidden');
            return `${context.locale}:${text}`;
          },
        }),
        provideSchemaEngineAngular({
          id: 'fake',
          renderer: FakeRenderer,
          tester: () => 1,
        }),
      ],
    });
    const fixture = TestBed.createComponent(OutletHost);
    fixture.detectChanges();
    TestBed.tick();
    const renderer = FakeRenderer.latest;
    expect(renderer?.texts().choiceLabels).toEqual(['en:Ada', 'Grace']);
    expect(choiceCalls).toBe(2);
    expect(FakeRenderer.created).toBe(1);
    expect(
      fixture.componentInstance.diagnostics
        .flat()
        .filter(({ code }) => code === 'TEXT_RESOLUTION_FAILED'),
    ).toHaveLength(1);

    fixture.componentInstance.form?.focus(['age']);
    TestBed.tick();
    expect(choiceCalls).toBe(2);
    expect(fixture.componentInstance.diagnostics).toHaveLength(1);

    fixture.componentInstance.config.set(createConfig({ locale: 'ca' }));
    fixture.detectChanges();
    TestBed.tick();
    expect(FakeRenderer.latest).toBe(renderer);
    expect(FakeRenderer.created).toBe(1);
    expect(renderer?.texts().choiceLabels).toEqual(['ca:Ada', 'Grace']);
    expect(choiceCalls).toBe(4);
    expect(
      fixture.componentInstance.diagnostics
        .flat()
        .filter(({ code }) => code === 'TEXT_RESOLUTION_FAILED'),
    ).toHaveLength(2);
  });

  it('replaces and destroys the renderer only after a successful runtime swap', () => {
    TestBed.configureTestingModule({
      providers: [
        provideSchemaEngineAngular({
          id: 'fake',
          renderer: FakeRenderer,
          tester: () => 1,
        }),
      ],
    });
    const fixture = TestBed.createComponent(OutletHost);
    fixture.detectChanges();
    TestBed.tick();
    const first = FakeRenderer.latest;
    expect({
      created: FakeRenderer.created,
      destroyed: FakeRenderer.destroyed,
    }).toEqual({ created: 1, destroyed: 0 });

    fixture.componentInstance.config.set(
      createConfig({ formId: 'replacement' }),
    );
    fixture.detectChanges();
    TestBed.tick();

    expect(FakeRenderer.latest).not.toBe(first);
    expect(FakeRenderer.latest?.formId()).toBe('replacement');
    expect(FakeRenderer.destroyed).toBe(1);
    const nativeElement = fixture.nativeElement as HTMLElement;
    expect(nativeElement.querySelectorAll('schema-test-renderer')).toHaveLength(
      1,
    );
  });

  it('replaces the renderer when its normalized field definition changes', () => {
    TestBed.configureTestingModule({
      providers: [
        provideSchemaEngineAngular({
          id: 'fake',
          renderer: FakeRenderer,
          tester: () => 1,
        }),
      ],
    });
    const fixture = TestBed.createComponent(OutletHost);
    fixture.detectChanges();
    TestBed.tick();
    const first = FakeRenderer.latest;

    fixture.componentInstance.field.set(ageField);
    fixture.detectChanges();
    TestBed.tick();

    expect(FakeRenderer.latest).not.toBe(first);
    expect(FakeRenderer.latest?.field()).toBe(ageField);
    expect(FakeRenderer.destroyed).toBe(1);
  });

  it('reports missing snapshots and renderer instantiation failures', () => {
    TestBed.configureTestingModule({
      providers: [
        provideSchemaEngineAngular({
          id: 'fake',
          renderer: FakeRenderer,
          tester: () => 1,
        }),
      ],
    });
    const missingFixture = TestBed.createComponent(OutletHost);
    missingFixture.componentInstance.field.set(alienField);
    missingFixture.detectChanges();
    TestBed.tick();
    expect(
      missingFixture.componentInstance.diagnostics
        .flat()
        .some(({ code }) => code === 'MISSING_FIELD_SNAPSHOT'),
    ).toBe(true);
    missingFixture.destroy();

    TestBed.resetTestingModule();
    class BrokenRenderer {}
    TestBed.configureTestingModule({
      providers: [
        provideSchemaEngineAngular({
          id: 'broken',
          renderer: BrokenRenderer as unknown as AngularRendererType,
          tester: () => 1,
        }),
      ],
    });
    const brokenFixture = TestBed.createComponent(OutletHost);
    brokenFixture.detectChanges();
    TestBed.tick();
    expect(
      brokenFixture.componentInstance.diagnostics
        .flat()
        .some(({ code }) => code === 'RENDERER_INSTANTIATION_FAILED'),
    ).toBe(true);
  });

  it('disposes the runtime and attached renderer with the host view', () => {
    TestBed.configureTestingModule({
      providers: [
        provideSchemaEngineAngular({
          id: 'fake',
          renderer: FakeRenderer,
          tester: () => 1,
        }),
      ],
    });
    const fixture = TestBed.createComponent(OutletHost);
    fixture.detectChanges();
    TestBed.tick();
    fixture.destroy();
    expect(FakeRenderer.destroyed).toBe(1);
  });

  it('emits controlled operations with explicit zoneless change detection', () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    TestBed.tick();
    fixture.componentInstance.form?.requestSetValue(['name'], 'Zoneless');
    expect(fixture.componentInstance.operations).toMatchObject([
      { type: 'set-value', value: 'Zoneless' },
    ]);
  });

  it('reports a missing renderer without creating a component', () => {
    TestBed.configureTestingModule({
      providers: [provideSchemaEngineAngular()],
    });
    const fixture = TestBed.createComponent(OutletHost);
    fixture.detectChanges();
    TestBed.tick();
    expect(FakeRenderer.latest).toBeUndefined();
    expect(
      fixture.componentInstance.diagnostics
        .flat()
        .some(({ code }) => code === 'NO_RENDERER_MATCH'),
    ).toBe(true);
  });
});

function createConfig(
  overrides: Partial<
    ControlledFormRuntimeOptions<Record<string, unknown>>
  > = {},
): ControlledFormRuntimeOptions<Record<string, unknown>> {
  return {
    formId: 'form',
    definition,
    schema,
    value: { name: 'Ada' },
    baselineValue: { name: 'Ada' },
    locale: 'en',
    validator,
    ...overrides,
  };
}

function compileAlienField(): FieldDefinition {
  const result = compileFormDefinition({
    schema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: { alien: { type: 'boolean' } },
    },
  });
  if (!result.success || result.definition.fields[0] === undefined)
    throw new Error('alien fixture compilation failed');
  return result.definition.fields[0];
}
