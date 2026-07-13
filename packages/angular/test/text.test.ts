import { TestBed } from '@angular/core/testing';
import type {
  FieldRuntimeSnapshot,
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
  key: 'status',
  path: Object.freeze(['status']),
  presence: Object.freeze({ kind: 'missing' }),
  dirty: false,
  touched: false,
  focused: false,
  valid: false,
  issues: Object.freeze([issue]),
  showIssues: false,
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
      'choice',
      'choice',
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
      choiceLabels: ['ca:status.draft', 'ca:status.published'],
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
    const inheritedField: StringFieldDefinition = Object.assign(
      Object.create({ choices }) as object,
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
    const empty = emptyTextSnapshot();
    expect(empty.choiceLabels).toEqual([]);
    expect(Object.isFrozen(empty)).toBe(true);
    expect(Object.isFrozen(empty.choiceLabels)).toBe(true);
  });
});
