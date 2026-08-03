import { describe, expect, expectTypeOf, it } from 'vitest';
import type {
  AdvancedPresentationLabelDefinition,
  AdvancedPresentationTextMember,
  AdvancedPresentationTextResolutionContext,
  FieldUiSchema,
  FieldTextMember,
  FieldDefinition,
  FieldTemplate,
  FormNodeDefinition,
  FormNodeTemplate,
  StringChoiceDefinition,
  StringFieldDefinition,
  TextResolutionContext,
  PresentationAccordionDefinition,
  PresentationGridDefinition,
  PresentationGridItemDefinition,
  PresentationPanelDefinition,
  PresentationTabsDefinition,
  PrimitiveFixedValue,
  UiAccordionSchema,
  UiGridItemSchema,
  UiGridSchema,
  UiPresentationEntry,
  UiPresentationPanelSchema,
  UiTabsSchema,
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
      | 'fixed-missing'
      | 'fixed-unavailable'
      | 'fixed-incompatible'
      | 'choice'
      | 'issue'
      | 'missing-selection'
      | 'empty-selection'
    >();
    expectTypeOf<PrimitiveFixedValue>().toEqualTypeOf<
      string | number | boolean | null
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

describe('public advanced presentation contracts', () => {
  it('exports the exact raw, normalized and text-context shapes', () => {
    const rawPanel = {
      kind: 'panel',
      id: 'main',
      label: 'Main',
      children: ['name'],
    } satisfies UiPresentationPanelSchema;
    const rawTabs = {
      kind: 'tabs',
      id: 'tabs',
      label: 'Tabs',
      panels: [rawPanel],
    } satisfies UiTabsSchema;
    const rawAccordion = {
      kind: 'accordion',
      id: 'accordion',
      label: 'Accordion',
      panels: [rawPanel],
    } satisfies UiAccordionSchema;
    const rawItem = {
      span: 2,
      child: rawTabs,
    } satisfies UiGridItemSchema;
    const rawGrid = {
      kind: 'grid',
      id: 'grid',
      label: 'Grid',
      columns: 2,
      items: [rawItem],
    } satisfies UiGridSchema;
    const entries = [
      rawTabs,
      rawAccordion,
      rawGrid,
    ] satisfies readonly UiPresentationEntry[];

    const panel = {
      kind: 'panel',
      id: 'main',
      key: '["tabs","tabs","panel","main"]',
      label: 'Main',
      children: [],
    } satisfies PresentationPanelDefinition;
    const tabs = {
      kind: 'tabs',
      id: 'tabs',
      key: '["tabs","tabs"]',
      label: 'Tabs',
      panels: [panel],
    } satisfies PresentationTabsDefinition;
    const accordionPanel = {
      ...panel,
      key: '["accordion","accordion","panel","main"]',
    } satisfies PresentationPanelDefinition;
    const accordion = {
      kind: 'accordion',
      id: 'accordion',
      key: '["accordion","accordion"]',
      label: 'Accordion',
      panels: [accordionPanel],
    } satisfies PresentationAccordionDefinition;
    const gridItem = {
      kind: 'grid-item',
      key: '["grid","grid","item",0]',
      span: 2,
      child: tabs,
    } satisfies PresentationGridItemDefinition;
    const grid = {
      kind: 'grid',
      id: 'grid',
      key: '["grid","grid"]',
      label: 'Grid',
      columns: 2,
      items: [gridItem],
    } satisfies PresentationGridDefinition;
    const context = {
      formId: 'form',
      locale: 'en',
      presentation: grid,
      member: 'label',
    } satisfies AdvancedPresentationTextResolutionContext;

    expect(entries).toHaveLength(3);
    expect(accordion.kind).toBe('accordion');
    expect(context.presentation).toBe(grid);
    expectTypeOf<AdvancedPresentationTextMember>().toEqualTypeOf<'label'>();
    expectTypeOf<AdvancedPresentationLabelDefinition>().toEqualTypeOf<
      | PresentationTabsDefinition<FormNodeDefinition | FormNodeTemplate>
      | PresentationAccordionDefinition<FormNodeDefinition | FormNodeTemplate>
      | PresentationPanelDefinition<FormNodeDefinition | FormNodeTemplate>
      | PresentationGridDefinition<FormNodeDefinition | FormNodeTemplate>
    >();
    expectTypeOf<
      Extract<TextResolutionContext, { presentation: unknown }>
    >().toEqualTypeOf<AdvancedPresentationTextResolutionContext>();
  });
});
