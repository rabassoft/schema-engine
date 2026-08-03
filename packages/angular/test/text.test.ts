import { TestBed } from '@angular/core/testing';
import type {
  FieldRuntimeSnapshot,
  StringEnumArrayFieldDefinition,
  StringFieldDefinition,
  TextResolutionContext,
  ValidationIssue,
} from '@rabassoft/schema-engine';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  AngularTextProjector,
  emptyTextSnapshot,
  provideSchemaTextResolver,
} from '../src/text.js';

const choices = Object.freeze([
  Object.freeze({ value: 'draft', label: 'status.draft' }),
  Object.freeze({ value: 'published', label: 'status.published' }),
]);
const field: StringFieldDefinition = Object.freeze({
  key: 'status',
  name: 'status',
  path: Object.freeze(['status']),
  required: true,
  label: 'status.label',
  description: 'status.description',
  hint: 'status.hint',
  tooltip: 'status.tooltip',
  placeholder: 'status.placeholder',
  kind: 'string',
  nullable: false,
  constraints: Object.freeze({}),
  choices,
});
const issue: ValidationIssue = Object.freeze({
  code: 'required',
  path: Object.freeze(['status']),
  parameters: Object.freeze({}),
  fallbackMessage: 'status.required',
});
const snapshot: FieldRuntimeSnapshot = Object.freeze({
  nodeKind: 'field',
  key: 'status',
  path: Object.freeze(['status']),
  presence: Object.freeze({ kind: 'missing' }),
  dirty: false,
  touched: false,
  focused: false,
  visible: true,
  enabled: true,
  valid: false,
  issues: Object.freeze([issue]),
  showIssues: false,
});
const arrayField: StringEnumArrayFieldDefinition = Object.freeze({
  key: 'roles',
  name: 'roles',
  path: Object.freeze(['roles']),
  required: false,
  label: 'roles.label',
  kind: 'string-enum-array',
  nullable: false,
  choices,
});

describe('AngularTextProjector choice texts', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('projects every member in normative order with exclusive choice contexts', () => {
    const calls: { text: string; context: TextResolutionContext }[] = [];
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

    const result = TestBed.inject(AngularTextProjector).project(
      field,
      snapshot,
      'form',
      'ca',
    );

    expect(calls.map(({ context }) => context.member)).toEqual([
      'label',
      'description',
      'hint',
      'tooltip',
      'placeholder',
      'clear',
      'set-null',
      'null-value',
      'choice',
      'choice',
      'missing-selection',
      'empty-selection',
      'issue',
    ]);
    const choiceContexts = calls
      .map(({ context }) => context)
      .filter(
        (
          context,
        ): context is Extract<TextResolutionContext, { member: 'choice' }> =>
          context.member === 'choice',
      );
    expect(choiceContexts.map(({ choice }) => choice)).toEqual(choices);
    expect(choiceContexts[0]?.choice).toBe(choices[0]);
    expect(Object.hasOwn(choiceContexts[0]!, 'issue')).toBe(false);
    expect(Object.hasOwn(calls.at(-1)!.context, 'choice')).toBe(false);
    expect(result.texts).toEqual({
      label: 'ca:status.label',
      description: 'ca:status.description',
      hint: 'ca:status.hint',
      tooltip: 'ca:status.tooltip',
      placeholder: 'ca:status.placeholder',
      clearLabel: 'ca:Clear',
      setNullLabel: 'ca:Set null',
      nullValueLabel: 'ca:Null value',
      fixedMissingLabel: 'Missing value',
      fixedUnavailableLabel: 'Unavailable value',
      fixedIncompatibleLabel: 'Incompatible value',
      choiceLabels: ['ca:status.draft', 'ca:status.published'],
      missingSelectionLabel: 'ca:No value provided.',
      emptySelectionLabel: 'ca:No values selected.',
      issueMessages: ['ca:status.required'],
    });
    expect(result.diagnostics).toEqual([]);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.texts)).toBe(true);
    expect(Object.isFrozen(result.texts.choiceLabels)).toBe(true);
    expect(Object.isFrozen(result.texts.issueMessages)).toBe(true);
    expect(Object.isFrozen(result.diagnostics)).toBe(true);
  });

  it('isolates exception, non-string, and blank choice results in choice order', () => {
    const failingChoices = Object.freeze([
      Object.freeze({ value: 'exception', label: 'Exception' }),
      Object.freeze({ value: 'non-string', label: 'Non string' }),
      Object.freeze({ value: 'blank', label: 'Blank' }),
    ]);
    const failingField = Object.freeze({
      ...field,
      choices: failingChoices,
    });
    TestBed.configureTestingModule({
      providers: [
        provideSchemaTextResolver({
          resolve(_text, context) {
            if (
              context.member === 'clear' ||
              context.member === 'set-null' ||
              context.member === 'null-value'
            )
              return _text;
            if (
              context.member === 'missing-selection' ||
              context.member === 'empty-selection'
            )
              return _text;
            if (context.member !== 'choice') return '';
            if (context.choice.value === 'exception') throw new Error('hidden');
            if (context.choice.value === 'non-string') return 42 as never;
            return '   ';
          },
        }),
      ],
    });

    const result = TestBed.inject(AngularTextProjector).project(
      failingField,
      { ...snapshot, issues: [] },
      'form',
      'en',
    );

    expect(result.texts.label).toBe('');
    expect(result.texts.choiceLabels).toEqual([
      'Exception',
      'Non string',
      'Blank',
    ]);
    expect(result.diagnostics).toMatchObject([
      {
        code: 'TEXT_RESOLUTION_FAILED',
        severity: 'warning',
        source: 'runtime',
        dataPath: ['status'],
        parameters: {
          field: 'status',
          member: 'choice',
          choiceValue: 'exception',
          reason: 'exception',
        },
      },
      {
        parameters: {
          member: 'choice',
          choiceValue: 'non-string',
          reason: 'non-string-result',
        },
      },
      {
        parameters: {
          member: 'choice',
          choiceValue: 'blank',
          reason: 'blank-string-result',
        },
      },
    ]);
    expect(result.diagnostics).toHaveLength(3);
    for (const diagnostic of result.diagnostics) {
      expect(Object.hasOwn(diagnostic, 'documentPath')).toBe(false);
      expect(Object.isFrozen(diagnostic)).toBe(true);
      expect(Object.isFrozen(diagnostic.dataPath)).toBe(true);
      expect(Object.isFrozen(diagnostic.parameters)).toBe(true);
    }
  });

  it('projects fixed status members after null and before choices and issues', () => {
    const calls: TextResolutionContext[] = [];
    TestBed.configureTestingModule({
      providers: [
        provideSchemaTextResolver({
          resolve(text, context) {
            calls.push(context);
            return `${context.locale}:${text}`;
          },
        }),
      ],
    });
    const fixedField = Object.freeze({ ...field, fixedValue: 'draft' });
    const result = TestBed.inject(AngularTextProjector).project(
      fixedField,
      snapshot,
      'form',
      'es',
    );

    expect(calls.map(({ member }) => member)).toEqual([
      'label',
      'description',
      'hint',
      'tooltip',
      'placeholder',
      'clear',
      'set-null',
      'null-value',
      'fixed-missing',
      'fixed-unavailable',
      'fixed-incompatible',
      'choice',
      'choice',
      'missing-selection',
      'empty-selection',
      'issue',
    ]);
    expect(result.texts).toMatchObject({
      fixedMissingLabel: 'es:Missing value',
      fixedUnavailableLabel: 'es:Unavailable value',
      fixedIncompatibleLabel: 'es:Incompatible value',
    });
    expect(result.diagnostics).toEqual([]);
  });

  it('falls back to Clear with exact diagnostics for invalid resolutions', () => {
    const fieldWithoutChoices = { ...field };
    delete fieldWithoutChoices.choices;
    const cases = [
      {
        reason: 'exception',
        resolve: () => {
          throw new Error('hidden');
        },
      },
      { reason: 'non-string-result', resolve: () => 42 as never },
      { reason: 'blank-string-result', resolve: () => '   ' },
    ] as const;

    for (const current of cases) {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideSchemaTextResolver({
            resolve(text, context) {
              return context.member === 'clear' ? current.resolve() : text;
            },
          }),
        ],
      });

      const result = TestBed.inject(AngularTextProjector).project(
        fieldWithoutChoices,
        { ...snapshot, issues: [] },
        'form',
        'en',
      );

      expect(result.texts.clearLabel).toBe('Clear');
      expect(result.diagnostics).toEqual([
        {
          code: 'TEXT_RESOLUTION_FAILED',
          severity: 'warning',
          source: 'runtime',
          dataPath: ['status'],
          parameters: {
            field: 'status',
            member: 'clear',
            reason: current.reason,
          },
          fallbackMessage: 'Text resolution failed for field "status".',
        },
      ]);
      const diagnostic = result.diagnostics[0]!;
      expect(Object.hasOwn(diagnostic, 'documentPath')).toBe(false);
      expect(Object.isFrozen(diagnostic)).toBe(true);
      expect(Object.isFrozen(diagnostic.dataPath)).toBe(true);
      expect(Object.isFrozen(diagnostic.parameters)).toBe(true);
      expect(Object.isFrozen(result.texts)).toBe(true);
    }
  });

  it.each([
    ['set-null', 'Set null', 'setNullLabel'],
    ['null-value', 'Null value', 'nullValueLabel'],
    ['fixed-missing', 'Missing value', 'fixedMissingLabel'],
    ['fixed-unavailable', 'Unavailable value', 'fixedUnavailableLabel'],
    ['fixed-incompatible', 'Incompatible value', 'fixedIncompatibleLabel'],
  ] as const)(
    'falls back for %s with every existing failure reason',
    (member, source, snapshotMember) => {
      const fieldWithoutChoices = { ...field };
      delete fieldWithoutChoices.choices;
      const cases = [
        {
          reason: 'exception',
          resolve: () => {
            throw new Error('hidden');
          },
        },
        { reason: 'non-string-result', resolve: () => 42 as never },
        { reason: 'blank-string-result', resolve: () => '   ' },
      ] as const;

      for (const current of cases) {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          providers: [
            provideSchemaTextResolver({
              resolve(text, context) {
                return context.member === member ? current.resolve() : text;
              },
            }),
          ],
        });
        const projectedField = member.startsWith('fixed-')
          ? { ...fieldWithoutChoices, fixedValue: 'fixed' }
          : fieldWithoutChoices;
        const result = TestBed.inject(AngularTextProjector).project(
          projectedField,
          { ...snapshot, issues: [] },
          'form',
          'en',
        );
        expect(result.texts[snapshotMember]).toBe(source);
        expect(result.diagnostics).toMatchObject([
          {
            code: 'TEXT_RESOLUTION_FAILED',
            dataPath: ['status'],
            parameters: {
              field: 'status',
              member,
              reason: current.reason,
            },
          },
        ]);
        expect(result.diagnostics).toHaveLength(1);
      }
    },
  );

  it('uses empty frozen labels without inherited or accessor choices', () => {
    let getterCalls = 0;
    const accessorField: StringFieldDefinition = Object.defineProperty(
      { ...field },
      'choices',
      {
        enumerable: true,
        get() {
          getterCalls += 1;
          return choices;
        },
      },
    );
    Object.defineProperty(accessorField, 'fixedValue', {
      enumerable: true,
      get() {
        getterCalls += 1;
        return 'draft';
      },
    });
    const inheritedField: StringFieldDefinition = Object.assign(
      Object.create({ choices, fixedValue: 'draft' }) as object,
      {
        ...field,
      },
    );
    delete (inheritedField as { choices?: unknown }).choices;
    const projector = TestBed.inject(AngularTextProjector);

    expect(
      projector.project(accessorField, snapshot, 'form', 'en').texts
        .choiceLabels,
    ).toEqual([]);
    expect(
      projector.project(inheritedField, snapshot, 'form', 'en').texts
        .choiceLabels,
    ).toEqual([]);
    expect(getterCalls).toBe(0);
    expect(
      projector.project(accessorField, snapshot, 'form', 'en').texts
        .fixedMissingLabel,
    ).toBe('Missing value');
    expect(
      projector.project(inheritedField, snapshot, 'form', 'en').texts
        .fixedMissingLabel,
    ).toBe('Missing value');
    const empty = emptyTextSnapshot();
    expect(empty.clearLabel).toBe('Clear');
    expect(empty.setNullLabel).toBe('Set null');
    expect(empty.nullValueLabel).toBe('Null value');
    expect(empty.fixedMissingLabel).toBe('Missing value');
    expect(empty.fixedUnavailableLabel).toBe('Unavailable value');
    expect(empty.fixedIncompatibleLabel).toBe('Incompatible value');
    expect(empty.choiceLabels).toEqual([]);
    expect(empty.missingSelectionLabel).toBe('No value provided.');
    expect(empty.emptySelectionLabel).toBe('No values selected.');
    expect(Object.isFrozen(empty)).toBe(true);
    expect(Object.isFrozen(empty.choiceLabels)).toBe(true);
  });

  it('resolves total M31 status texts and falls back for every failure reason', () => {
    const cases = [
      {
        member: 'missing-selection',
        source: 'No value provided.',
        snapshotMember: 'missingSelectionLabel',
      },
      {
        member: 'empty-selection',
        source: 'No values selected.',
        snapshotMember: 'emptySelectionLabel',
      },
    ] as const;
    for (const current of cases) {
      for (const [reason, failure] of [
        [
          'exception',
          () => {
            throw new Error('hidden');
          },
        ],
        ['non-string-result', () => 42 as never],
        ['blank-string-result', () => '   '],
      ] as const) {
        TestBed.resetTestingModule();
        const contexts: TextResolutionContext[] = [];
        TestBed.configureTestingModule({
          providers: [
            provideSchemaTextResolver({
              resolve(text, context) {
                contexts.push(context);
                return context.member === current.member ? failure() : text;
              },
            }),
          ],
        });
        const result = TestBed.inject(AngularTextProjector).project(
          arrayField,
          { ...snapshot, key: 'roles', path: ['roles'], issues: [] },
          'form',
          'es',
        );
        expect(result.texts[current.snapshotMember]).toBe(current.source);
        expect(result.diagnostics).toMatchObject([
          {
            code: 'TEXT_RESOLUTION_FAILED',
            dataPath: ['roles'],
            parameters: {
              field: 'roles',
              member: current.member,
              reason,
            },
          },
        ]);
        expect(result.diagnostics).toHaveLength(1);
        const context = contexts.find(
          ({ member }) => member === current.member,
        );
        expect(context).toMatchObject({
          field: arrayField,
          member: current.member,
        });
        expect(Object.hasOwn(context!, 'choice')).toBe(false);
        expect(Object.hasOwn(context!, 'issue')).toBe(false);
      }
    }
  });
});
