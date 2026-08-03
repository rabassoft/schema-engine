import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  compileFormDefinition,
  type FieldRuntimeSnapshot,
  type StringEnumArrayFieldDefinition,
} from '@rabassoft/schema-engine';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  AngularRendererResolver,
  SchemaBooleanRendererComponent,
  SchemaStringEnumArrayRendererComponent,
  provideSchemaEngineAngular,
  provideSchemaEngineAngularNative,
  type AngularFieldTextSnapshot,
} from '../dist/index.js';

const field = compileField();
const texts: AngularFieldTextSnapshot = Object.freeze({
  label: 'Roles',
  description: 'Choose every assigned role.',
  hint: 'Order is retained from confirmed data.',
  tooltip: 'Role help',
  clearLabel: 'Clear roles',
  setNullLabel: 'Set null',
  nullValueLabel: 'Null value',
  fixedMissingLabel: 'Missing value',
  fixedUnavailableLabel: 'Unavailable value',
  fixedIncompatibleLabel: 'Incompatible value',
  choiceLabels: Object.freeze([
    'Empty',
    'Space',
    'Reader',
    'Editor',
    'Reviewer',
    'Unicode',
    'Lone surrogate',
  ]),
  missingSelectionLabel: 'No role value provided.',
  emptySelectionLabel: 'No roles selected.',
  issueMessages: Object.freeze(['Roles are invalid.']),
});

describe('native M31 string-enum array renderer', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('is native-only at rank 30 and preserves consumer overrides', () => {
    TestBed.configureTestingModule({
      providers: [provideSchemaEngineAngular()],
    });
    expect(
      TestBed.inject(AngularRendererResolver).resolve(field),
    ).toMatchObject({
      success: false,
      diagnostics: [{ code: 'NO_RENDERER_MATCH' }],
    });

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideSchemaEngineAngularNative()],
    });
    expect(
      TestBed.inject(AngularRendererResolver).resolve(field),
    ).toMatchObject({
      success: true,
      registration: {
        id: 'native-string-enum-array',
        renderer: SchemaStringEnumArrayRendererComponent,
        priority: 0,
      },
    });

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideSchemaEngineAngularNative({
          id: 'custom-array',
          renderer: SchemaBooleanRendererComponent,
          tester: (candidate) =>
            candidate.kind === 'string-enum-array' ? 30 : null,
          priority: 1,
        }),
      ],
    });
    expect(
      TestBed.inject(AngularRendererResolver).resolve(field),
    ).toMatchObject({
      success: true,
      registration: { id: 'custom-array' },
    });
  });

  it('matches only exact own valid choices without invoking accessors', () => {
    let getterCalls = 0;
    const accessor = Object.defineProperty({ ...field }, 'choices', {
      get() {
        getterCalls += 1;
        return field.choices;
      },
    });
    const malformed = {
      ...field,
      choices: [{ value: 'reader', label: '   ' }],
    };
    const withoutChoices = Object.fromEntries(
      Object.entries(field).filter(([key]) => key !== 'choices'),
    );
    const inherited = Object.assign(
      Object.create({ choices: field.choices }) as object,
      withoutChoices,
    );
    const sparseChoices = Array(1);
    const choiceAccessor = Object.defineProperties(
      {},
      {
        value: {
          enumerable: true,
          get() {
            getterCalls += 1;
            return 'reader';
          },
        },
        label: { enumerable: true, value: 'Reader' },
      },
    );
    TestBed.configureTestingModule({
      providers: [provideSchemaEngineAngularNative()],
    });
    const resolver = TestBed.inject(AngularRendererResolver);

    for (const candidate of [
      accessor,
      malformed,
      inherited,
      { ...field, choices: [] },
      { ...field, choices: sparseChoices },
      {
        ...field,
        choices: [field.choices[2], field.choices[2]],
      },
      { ...field, choices: [choiceAccessor] },
    ]) {
      expect(resolver.resolve(candidate as never)).toMatchObject({
        success: false,
        diagnostics: [{ code: 'NO_RENDERER_MATCH' }],
      });
    }
    expect(
      resolver.resolve({
        ...field,
        kind: 'string',
        choices: field.choices,
      } as never),
    ).toMatchObject({
      success: true,
      registration: { id: 'native-string-enum' },
    });
    expect(getterCalls).toBe(0);
  });

  it('projects labelled missing/empty states and private choice tokens', () => {
    const fixture = render(snapshot({ kind: 'missing' }));
    const root = fixture.nativeElement as HTMLElement;
    const select = root.querySelector('select') as HTMLSelectElement;
    const label = root.querySelector('label') as HTMLLabelElement;
    const status = document.getElementById(`${select.id}-status`);

    expect(select.multiple).toBe(true);
    expect(label.htmlFor).toBe(select.id);
    expect(select.getAttribute('aria-required')).toBe('true');
    expect(select.options).toHaveLength(field.choices.length);
    expect(Array.from(select.options, ({ value }) => value)).toEqual(
      field.choices.map((_choice, index) => `choice:${index}`),
    );
    expect(Array.from(select.options, ({ text }) => text.trim())).toEqual(
      texts.choiceLabels,
    );
    expect(status?.textContent?.trim()).toBe(texts.missingSelectionLabel);
    expect(select.getAttribute('aria-describedby')).toContain(
      `${select.id}-status`,
    );
    expect(root.querySelector('button')).toBeNull();

    fixture.componentRef.setInput(
      'snapshot',
      snapshot({ kind: 'value', value: [] }),
    );
    fixture.detectChanges();
    TestBed.tick();
    expect(
      document.getElementById(`${select.id}-status`)?.textContent?.trim(),
    ).toBe(texts.emptySelectionLabel);
    expect(root.querySelector('button')).not.toBeNull();
  });

  it('retains confirmed order, appends in choice order and reconciles immediately', async () => {
    const fixture = render(
      snapshot({ kind: 'value', value: ['editor', 'reader'] }),
    );
    const select = (fixture.nativeElement as HTMLElement).querySelector(
      'select',
    ) as HTMLSelectElement;
    const emitted: unknown[] = [];
    fixture.componentInstance.setValue.subscribe((value) =>
      emitted.push(value),
    );

    select.options[2]!.selected = true;
    select.options[3]!.selected = true;
    select.options[4]!.selected = true;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await Promise.resolve();
    fixture.detectChanges();
    TestBed.tick();
    expect(emitted).toEqual([['editor', 'reader', 'reviewer']]);
    expect(selectedTokens(select)).toEqual(['choice:2', 'choice:3']);

    fixture.componentRef.setInput(
      'snapshot',
      snapshot({ kind: 'value', value: ['reviewer', 'reader'] }),
    );
    fixture.detectChanges();
    TestBed.tick();
    expect(selectedTokens(select)).toEqual(['choice:2', 'choice:4']);
    expect(
      document.getElementById(`${select.id}-status`)?.textContent?.trim(),
    ).toBe('Reviewer, Reader');

    select.options[2]!.selected = true;
    select.options[3]!.selected = true;
    select.options[4]!.selected = true;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(emitted).toEqual([
      ['editor', 'reader', 'reviewer'],
      ['reviewer', 'reader', 'editor'],
    ]);
  });

  it('constructs missing selections in choice order and ignores malformed tokens', () => {
    const fixture = render(snapshot({ kind: 'missing' }));
    const select = (fixture.nativeElement as HTMLElement).querySelector(
      'select',
    ) as HTMLSelectElement;
    const emitted: unknown[] = [];
    fixture.componentInstance.setValue.subscribe((value) =>
      emitted.push(value),
    );

    select.options[4]!.selected = true;
    select.options[0]!.selected = true;
    select.options[3]!.selected = true;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(emitted).toEqual([['', 'editor', 'reviewer']]);

    const malformed = document.createElement('option');
    malformed.value = 'choice:99';
    malformed.selected = true;
    select.add(malformed);
    select.dispatchEvent(new Event('change', { bubbles: true }));
    malformed.value = 'choice:01';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(emitted).toHaveLength(1);
  });

  it.each([
    ['duplicate', ['reader', 'reader']],
    ['unknown', ['unknown']],
    ['non-string', ['reader', 1]],
    ['sparse', sparseValue()],
  ])('disables only selection for %s retained data', (_name, value) => {
    const fixture = render(
      snapshot(
        { kind: 'value', value },
        {
          valid: false,
          showIssues: true,
          issues: [{ code: 'invalid', path: ['roles', 0], parameters: {} }],
        },
      ),
    );
    const root = fixture.nativeElement as HTMLElement;
    const select = root.querySelector('select') as HTMLSelectElement;
    const host = root.firstElementChild as HTMLElement;
    const clear = root.querySelector('button') as HTMLButtonElement;
    const setValues: unknown[] = [];
    const removes: unknown[] = [];
    fixture.componentInstance.setValue.subscribe((next) =>
      setValues.push(next),
    );
    fixture.componentInstance.removeValue.subscribe(() => removes.push(true));

    expect(select.disabled).toBe(true);
    expect(select.getAttribute('aria-invalid')).toBe('true');
    expect(host.tabIndex).toBe(0);
    expect(host.getAttribute('aria-labelledby')).toBe(`${select.id}-label`);
    expect(clear.disabled).toBe(false);
    expect(root.querySelectorAll('li')).toHaveLength(1);
    expect(
      document.getElementById(`${select.id}-status`)?.textContent?.trim(),
    ).toBe(`Roles: ${Array.isArray(value) ? value.length : 1}`);

    fixture.componentInstance.focus();
    expect(document.activeElement).toBe(host);
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(setValues).toEqual([]);
    clear.click();
    expect(removes).toEqual([true]);
  });

  it('forwards field focus/blur and emits nothing on render, locale or destroy', () => {
    const fixture = render(snapshot({ kind: 'value', value: ['reader'] }));
    const select = (fixture.nativeElement as HTMLElement).querySelector(
      'select',
    ) as HTMLSelectElement;
    const focus: unknown[] = [];
    const blur: unknown[] = [];
    const values: unknown[] = [];
    const removes: unknown[] = [];
    fixture.componentInstance.fieldFocus.subscribe(() => focus.push(true));
    fixture.componentInstance.fieldBlur.subscribe(() => blur.push(true));
    fixture.componentInstance.setValue.subscribe((value) => values.push(value));
    fixture.componentInstance.removeValue.subscribe(() => removes.push(true));

    fixture.componentInstance.focus();
    expect(document.activeElement).toBe(select);
    select.dispatchEvent(new FocusEvent('blur'));
    fixture.componentRef.setInput('locale', 'es');
    fixture.componentRef.setInput('texts', {
      ...texts,
      missingSelectionLabel: 'Sin valor.',
      emptySelectionLabel: 'Sin selecciones.',
    });
    fixture.detectChanges();
    TestBed.tick();
    fixture.destroy();

    expect(focus).toEqual([true]);
    expect(blur).toEqual([true]);
    expect(values).toEqual([]);
    expect(removes).toEqual([]);
  });
});

function render(fieldSnapshot: FieldRuntimeSnapshot) {
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()],
  });
  const fixture = TestBed.createComponent(
    SchemaStringEnumArrayRendererComponent,
  );
  fixture.componentRef.setInput('field', field);
  fixture.componentRef.setInput('snapshot', fieldSnapshot);
  fixture.componentRef.setInput('formId', 'array form');
  fixture.componentRef.setInput('locale', 'en');
  fixture.componentRef.setInput('texts', texts);
  fixture.detectChanges();
  TestBed.tick();
  return fixture;
}

function compileField(): StringEnumArrayFieldDefinition {
  const result = compileFormDefinition({
    schema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        roles: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['', ' ', 'reader', 'editor', 'reviewer', '💡', '\ud800'],
          },
          uniqueItems: true,
        },
      },
      required: ['roles'],
    },
    uiSchema: {
      fields: {
        roles: {
          label: 'Roles',
          description: 'Choose every assigned role.',
          hint: 'Order is retained from confirmed data.',
          tooltip: 'Role help',
          enumLabels: {
            '': 'Empty',
            ' ': 'Space',
            reader: 'Reader',
            editor: 'Editor',
            reviewer: 'Reviewer',
            '💡': 'Unicode',
            '\ud800': 'Lone surrogate',
          },
        },
      },
    },
  });
  const compiled = result.success ? result.definition.fields[0] : undefined;
  if (compiled?.kind !== 'string-enum-array') {
    throw new Error('M31 field compilation failed');
  }
  return compiled;
}

function snapshot(
  presence: FieldRuntimeSnapshot['presence'],
  overrides: Partial<FieldRuntimeSnapshot> = {},
): FieldRuntimeSnapshot {
  return Object.freeze({
    nodeKind: 'field',
    key: field.key,
    path: field.path,
    presence: Object.freeze(presence),
    dirty: false,
    touched: false,
    focused: false,
    visible: true,
    enabled: true,
    valid: true,
    issues: Object.freeze([]),
    showIssues: false,
    ...overrides,
  });
}

function selectedTokens(select: HTMLSelectElement): readonly string[] {
  return Array.from(select.options)
    .filter((option) => option.selected)
    .map(({ value }) => value);
}

function sparseValue(): readonly unknown[] {
  return Array(1);
}
