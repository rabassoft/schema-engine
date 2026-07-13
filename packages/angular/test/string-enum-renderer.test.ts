import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  compileFormDefinition,
  type FieldRuntimeSnapshot,
  type StringFieldDefinition,
} from '@rabassoft/schema-engine';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  AngularRendererResolver,
  SchemaStringEnumRendererComponent,
  SchemaStringRendererComponent,
  provideSchemaEngineAngularNative,
  type AngularFieldTextSnapshot,
} from '../dist/index.js';

const enumField = compileField({ type: 'string', enum: ['', 'draft'] });
const ordinaryField = compileField({ type: 'string' });
const texts: AngularFieldTextSnapshot = Object.freeze({
  label: 'Status',
  placeholder: 'Choose status',
  choiceLabels: Object.freeze(['Empty', 'Draft']),
  issueMessages: Object.freeze([]),
});

describe('native string enum renderer step 5', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('selects the rank-20 renderer while ordinary strings keep rank 10', () => {
    TestBed.configureTestingModule({
      providers: [provideSchemaEngineAngularNative()],
    });
    const resolver = TestBed.inject(AngularRendererResolver);

    expect(resolver.resolve(enumField)).toMatchObject({
      success: true,
      registration: {
        id: 'native-string-enum',
        renderer: SchemaStringEnumRendererComponent,
        priority: 0,
      },
    });
    expect(resolver.resolve(ordinaryField)).toMatchObject({
      success: true,
      registration: {
        id: 'native-string',
        renderer: SchemaStringRendererComponent,
        priority: 0,
      },
    });
  });

  it('ignores inherited and accessor choices without executing getters', () => {
    let getterCalls = 0;
    const accessorField: StringFieldDefinition = Object.defineProperty(
      { ...ordinaryField },
      'choices',
      {
        get() {
          getterCalls += 1;
          return enumField.choices;
        },
      },
    );
    const inheritedField: StringFieldDefinition = Object.assign(
      Object.create({ choices: enumField.choices }) as object,
      { ...ordinaryField },
    );
    TestBed.configureTestingModule({
      providers: [provideSchemaEngineAngularNative()],
    });
    const resolver = TestBed.inject(AngularRendererResolver);

    expect(resolver.resolve(accessorField)).toMatchObject({
      success: true,
      registration: { id: 'native-string' },
    });
    expect(resolver.resolve(inheritedField)).toMatchObject({
      success: true,
      registration: { id: 'native-string' },
    });
    expect(getterCalls).toBe(0);
  });

  it('uses private tokens and emits the exact empty-string domain value', () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(SchemaStringEnumRendererComponent);
    fixture.componentRef.setInput('field', enumField);
    fixture.componentRef.setInput('snapshot', snapshot({ kind: 'missing' }));
    fixture.componentRef.setInput('formId', 'enum form');
    fixture.componentRef.setInput('locale', 'en');
    fixture.componentRef.setInput('texts', texts);
    const emitted: unknown[] = [];
    fixture.componentInstance.setValue.subscribe((value) =>
      emitted.push(value),
    );
    fixture.detectChanges();
    TestBed.tick();

    const root = fixture.nativeElement as HTMLElement;
    const select = root.querySelector('select') as HTMLSelectElement;
    expect(select.value).toBe('');
    expect(select.options).toHaveLength(3);
    expect(select.options[0]?.disabled).toBe(true);
    expect(select.options[0]?.textContent?.trim()).toBe('Choose status');
    expect(Array.from(select.options, ({ value }) => value)).toEqual([
      '',
      'choice:0',
      'choice:1',
    ]);
    fixture.componentInstance.focus();
    expect(document.activeElement).toBe(select);

    select.value = 'choice:0';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(emitted).toEqual(['']);

    const invalidOption = document.createElement('option');
    select.add(invalidOption);
    invalidOption.value = 'choice:99';
    select.value = invalidOption.value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    invalidOption.value = 'choice:01';
    select.value = invalidOption.value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(emitted).toEqual(['']);
    invalidOption.remove();

    fixture.componentRef.setInput(
      'snapshot',
      snapshot({ kind: 'value', value: 'draft' }),
    );
    fixture.detectChanges();
    TestBed.tick();
    expect(select.value).toBe('choice:1');
    expect(emitted).toEqual(['']);
  });
});

function compileField(fieldSchema: object): StringFieldDefinition {
  const result = compileFormDefinition({
    schema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: { status: fieldSchema },
    },
  });
  const field = result.success ? result.definition.fields[0] : undefined;
  if (field?.kind !== 'string') throw new Error('field compilation failed');
  return field;
}

function snapshot(
  presence: FieldRuntimeSnapshot['presence'],
): FieldRuntimeSnapshot {
  return Object.freeze({
    key: 'status',
    path: Object.freeze(['status']),
    presence: Object.freeze(presence),
    dirty: false,
    touched: false,
    focused: false,
    valid: true,
    issues: Object.freeze([]),
    showIssues: false,
  });
}
