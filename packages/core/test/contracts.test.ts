import { describe, expect, expectTypeOf, it } from 'vitest';
import type {
  FieldUiSchema,
  FieldTextMember,
  FieldDefinition,
  FieldTemplate,
  StringChoiceDefinition,
  StringFieldDefinition,
  TextResolutionContext,
} from '../src/index.js';

describe('public string choice contracts', () => {
  it('exports immutable choice, string-field, and UI metadata shapes', () => {
    const choice = {
      value: 'draft',
      label: 'status.draft',
    } satisfies StringChoiceDefinition;
    const field = {
      key: '["status"]',
      name: 'status',
      path: ['status'],
      required: true,
      label: 'Status',
      kind: 'string',
      nullable: false,
      constraints: {},
      choices: [choice],
    } satisfies StringFieldDefinition;
    const ui = {
      enumLabels: { draft: 'status.draft' },
    } satisfies FieldUiSchema;

    expect(field.choices).toEqual([choice]);
    expect(ui.enumLabels).toEqual({ draft: 'status.draft' });
    expectTypeOf<StringChoiceDefinition>().toEqualTypeOf<{
      readonly value: string;
      readonly label: string;
    }>();
    expectTypeOf<StringFieldDefinition['choices']>().toEqualTypeOf<
      readonly StringChoiceDefinition[] | undefined
    >();
    expectTypeOf<FieldUiSchema['enumLabels']>().toEqualTypeOf<
      Readonly<Record<string, string>> | undefined
    >();
    expectTypeOf<FieldTextMember>().toEqualTypeOf<
      | 'label'
      | 'description'
      | 'hint'
      | 'tooltip'
      | 'placeholder'
      | 'clear'
      | 'set-null'
      | 'null-value'
      | 'choice'
      | 'issue'
    >();
    const clearContext = {
      formId: 'form',
      locale: 'en',
      field,
      member: 'clear',
    } satisfies TextResolutionContext;
    expect(clearContext.member).toBe('clear');
    expectTypeOf<
      Extract<TextResolutionContext, { member: 'choice' }>
    >().toEqualTypeOf<{
      readonly formId: string;
      readonly locale: string;
      readonly field: FieldDefinition | FieldTemplate;
      readonly member: 'choice';
      readonly choice: StringChoiceDefinition;
      readonly issue?: never;
    }>();
  });
});
