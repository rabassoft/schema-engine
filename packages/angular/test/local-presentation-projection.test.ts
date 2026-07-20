import {
  Component,
  computed,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  compileFormDefinition,
  type SchemaValidator,
} from '@rabassoft/schema-engine';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  SchemaFormDirective,
  provideSchemaEngineAngularNative,
  type AngularControlledFormConfig,
} from '../dist/index.js';

interface Value {
  readonly profile: { readonly name: string; readonly active: boolean };
  readonly rows: readonly {
    readonly id: string;
    readonly name: string;
    readonly details: { readonly active: boolean };
  }[];
}

const schema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: {
    profile: {
      type: 'object',
      title: 'Profile',
      properties: {
        name: { type: 'string', title: 'Name' },
        active: { type: 'boolean', title: 'Active' },
      },
    },
    rows: {
      type: 'array',
      title: 'Rows',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string', title: 'Name' },
          details: {
            type: 'object',
            title: 'Details',
            properties: { active: { type: 'boolean', title: 'Enabled' } },
          },
        },
        required: ['id'],
      },
    },
  },
} as const;

const compilation = compileFormDefinition({
  schema,
  collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
  uiSchema: {
    fields: {
      profile: {
        presentation: [
          {
            kind: 'section',
            id: 'profile-main',
            label: 'Profile main',
            children: ['name', 'active'],
          },
        ],
      },
      rows: {
        item: {
          presentation: [
            {
              kind: 'tabs',
              id: 'item-tabs',
              label: 'Item tabs',
              panels: [
                {
                  kind: 'panel',
                  id: 'summary',
                  label: 'Summary',
                  children: ['name'],
                },
                {
                  kind: 'panel',
                  id: 'details',
                  label: 'Details',
                  children: ['details'],
                },
              ],
            },
          ],
          fields: {
            details: {
              presentation: [
                {
                  kind: 'grid',
                  id: 'details-grid',
                  label: 'Details grid',
                  columns: 2,
                  items: [{ span: 2, child: 'active' }],
                },
              ],
            },
          },
        },
      },
    },
  },
});
if (!compilation.success)
  throw new Error('Local presentation fixture must compile.');
const definition = compilation.definition;
const first = {
  id: 'a',
  name: 'Ada',
  details: { active: true },
} as const;
const second = {
  id: 'b',
  name: 'Bob',
  details: { active: false },
} as const;
const initial: Value = {
  profile: { name: 'Team', active: true },
  rows: [first, second],
};
const validator: SchemaValidator = {
  validate: () => ({ valid: true, issues: [] }),
};

@Component({
  standalone: true,
  imports: [SchemaFormDirective],
  template: `<form [schemaForm]="config()"></form>`,
})
class Host {
  readonly value = signal<Readonly<Value>>(initial);
  readonly config = computed<AngularControlledFormConfig<Value>>(() => ({
    formId: 'local-form',
    definition,
    schema,
    value: this.value(),
    baselineValue: initial,
    locale: 'en',
    validator,
  }));
}

describe('native recursive local presentation projection', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('projects every local owner with exact stable IDs and independent retained state', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideSchemaEngineAngularNative(),
      ],
    });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelectorAll('[role="tablist"]')).toHaveLength(2);
    expect(
      root.querySelectorAll('[data-schema-presentation-grid]'),
    ).toHaveLength(2);
    expect(root.textContent).toContain('Profile main');
    const profileLegend = id([
      'local-form',
      'presentation',
      ['object', ['profile']],
      'section',
      'profile-main',
    ]);
    expect(
      root.querySelector(`#${cssEscape(`${profileLegend}--legend`)}`),
    ).not.toBeNull();

    const tablistA = `${id([
      'local-form',
      'presentation',
      ['item', ['rows'], 'a'],
      'tabs',
      'item-tabs',
    ])}--tablist`;
    const list = root.querySelector(`#${cssEscape(tablistA)}`);
    expect(list).toBeInstanceOf(HTMLElement);
    const tabs = Array.from(list?.querySelectorAll('[role="tab"]') ?? []);
    expect(tabs).toHaveLength(2);
    expect(tabs[0]?.getAttribute('aria-selected')).toBe('true');
    (tabs[1] as HTMLButtonElement).click();
    fixture.detectChanges();
    TestBed.tick();
    expect(tabs[1]?.getAttribute('aria-selected')).toBe('true');

    fixture.componentInstance.value.set({
      ...initial,
      rows: [second, first],
    });
    fixture.detectChanges();
    TestBed.tick();
    const movedList = root.querySelector(`#${cssEscape(tablistA)}`);
    expect(movedList).toBe(list);
    expect(
      movedList
        ?.querySelectorAll('[role="tab"]')[1]
        ?.getAttribute('aria-selected'),
    ).toBe('true');

    fixture.componentInstance.value.set({ ...initial, rows: [second] });
    fixture.detectChanges();
    TestBed.tick();
    expect(root.querySelector(`#${cssEscape(tablistA)}`)).toBeNull();
    fixture.componentInstance.value.set({
      ...initial,
      rows: [second, first],
    });
    fixture.detectChanges();
    TestBed.tick();
    const reinserted = root.querySelector(`#${cssEscape(tablistA)}`);
    expect(reinserted).not.toBe(list);
    expect(
      reinserted?.querySelector('[role="tab"]')?.getAttribute('aria-selected'),
    ).toBe('true');

    const ids = Array.from(root.querySelectorAll('[id]'), ({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

function id(parts: readonly unknown[]): string {
  return `se-${encodeURIComponent(JSON.stringify(parts))}`;
}

function cssEscape(value: string): string {
  return CSS.escape(value);
}
