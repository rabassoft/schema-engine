import { Component, computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  SchemaFormDirective,
  provideSchemaEngineAngularNative,
  provideSchemaTextResolver,
  type AngularControlledFormConfig,
} from '@rabassoft/schema-engine-angular';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  compileFormDefinition,
  type Diagnostic,
  type SchemaValidator,
} from '../../core/dist/index.js';
import { referenceScenarios } from '../../../apps/reference-scenarios/dist/index.js';
import { provideSchemaEngineAngularAriaContainers } from '../dist/index.js';

const schema = {
  type: 'object',
  properties: {
    first: { type: 'string' },
    second: { type: 'string' },
    enabled: { type: 'boolean' },
    gridA: { type: 'string' },
    gridB: { type: 'string' },
  },
} as const;
const uiSchema = {
  presentation: [
    {
      kind: 'section',
      id: 'root',
      label: 'Root',
      children: [
        {
          kind: 'tabs',
          id: 'tabs',
          label: 'Tabs',
          panels: [
            { kind: 'panel', id: 'one', label: 'One', children: ['first'] },
            { kind: 'panel', id: 'two', label: 'Two', children: ['second'] },
          ],
        },
        {
          kind: 'accordion',
          id: 'accordion',
          label: 'Accordion',
          panels: [
            {
              kind: 'panel',
              id: 'toggle',
              label: 'Toggle',
              children: ['enabled'],
            },
          ],
        },
        {
          kind: 'grid',
          id: 'grid',
          label: 'Grid',
          columns: 2,
          items: [
            { span: 1, child: 'gridA' },
            { span: 1, child: 'gridB' },
          ],
        },
      ],
    },
  ],
} as const;
const compiled = compileFormDefinition({ schema, uiSchema });
if (!compiled.success) throw new Error('Pilot fixture failed to compile.');
const validator: SchemaValidator = Object.freeze({
  validate: () => ({ valid: true, issues: [] }),
});
const value = Object.freeze({
  first: 'first',
  second: 'second',
  enabled: true,
  gridA: 'grid-a',
  gridB: 'grid-b',
});

const recursiveScenario = referenceScenarios.find(
  ({ id }) => id === 'recursive-local-presentation',
);
if (recursiveScenario === undefined)
  throw new Error('Recursive reference scenario missing.');
const recursiveCompilation = compileFormDefinition(
  recursiveScenario.compileInput,
);
if (!recursiveCompilation.success)
  throw new Error('Recursive Aria fixture failed to compile.');

@Component({
  standalone: true,
  imports: [SchemaFormDirective],
  template: `<form
    [schemaForm]="config()"
    (schemaDiagnostics)="diagnostics.push($event)"
  ></form>`,
})
class PilotHost {
  readonly locale = signal('en');
  readonly diagnostics: (readonly Diagnostic[])[] = [];
  readonly config = computed<AngularControlledFormConfig<object>>(() => ({
    formId: 'pilot.form',
    definition: compiled.definition,
    schema,
    value,
    baselineValue: value,
    locale: this.locale(),
    validator,
  }));
}

@Component({
  standalone: true,
  imports: [SchemaFormDirective],
  template: `<form [schemaForm]="config()"></form>`,
})
class RecursivePilotHost {
  readonly value = signal<Readonly<object>>(
    recursiveScenario.initialState.value,
  );
  readonly locale = signal('en');
  readonly config = computed<AngularControlledFormConfig<object>>(() => ({
    formId: 'aria.local',
    definition: recursiveCompilation.definition,
    schema: recursiveScenario.compileInput.schema,
    value: this.value(),
    baselineValue: recursiveScenario.initialState.baselineValue,
    locale: this.locale(),
    validator: recursiveScenario.validator,
  }));
}

describe('Angular Aria presentation pilot', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideSchemaEngineAngularNative(),
        provideSchemaEngineAngularAriaContainers(),
        provideSchemaTextResolver({
          resolve: (text, context) => `${context.locale}:${text}`,
        }),
      ],
    });
  });

  it('selects all four rank-10 hosts with exact semantics and retained state', () => {
    const fixture = TestBed.createComponent(PilotHost);
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;
    expect(fixture.componentInstance.diagnostics).toEqual([]);
    expect(
      root.querySelector('schema-aria-presentation-section'),
    ).not.toBeNull();
    expect(root.querySelector('schema-aria-presentation-tabs')).not.toBeNull();
    expect(
      root.querySelector('schema-aria-presentation-accordion'),
    ).not.toBeNull();
    expect(root.querySelector('schema-aria-presentation-grid')).not.toBeNull();

    const tabs = Array.from(
      root.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    );
    const panels = Array.from(
      root.querySelectorAll<HTMLElement>('[role="tabpanel"]'),
    );
    expect(tabs.map(({ textContent }) => textContent?.trim())).toEqual([
      'en:One',
      'en:Two',
    ]);
    expect(tabs.map((tab) => tab.getAttribute('aria-selected'))).toEqual([
      'true',
      'false',
    ]);
    expect(tabs[0]?.getAttribute('aria-controls')).toBe(panels[0]?.id);
    expect(panels[0]?.getAttribute('aria-labelledby')).toBe(tabs[0]?.id);
    expect(panels.map(({ hidden }) => hidden)).toEqual([false, true]);
    expect(panels.every((panel) => panel.querySelector('input') !== null)).toBe(
      true,
    );
    tabs[0]?.focus();
    tabs[0]?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }),
    );
    fixture.detectChanges();
    TestBed.tick();
    expect(tabs[1]?.getAttribute('aria-selected')).toBe('true');
    expect(panels.map(({ hidden }) => hidden)).toEqual([true, false]);

    const trigger = root.querySelector<HTMLButtonElement>('[id$="--trigger"]');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    trigger?.click();
    fixture.detectChanges();
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    const grid = root.querySelector<HTMLElement>('[id$="--grid"]');
    expect(grid?.getAttribute('role')).toBe('group');
    expect(grid?.querySelectorAll('.se-aria-grid-cell')).toHaveLength(2);

    fixture.componentInstance.locale.set('es');
    fixture.detectChanges();
    TestBed.tick();
    expect(tabs[1]?.getAttribute('aria-selected')).toBe('true');
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    expect(tabs[1]?.textContent?.trim()).toBe('es:Two');
    fixture.destroy();

    const replacement = TestBed.createComponent(PilotHost);
    replacement.detectChanges();
    TestBed.tick();
    const replacementTabs = Array.from(
      (replacement.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        '[role="tab"]',
      ),
    );
    expect(
      replacementTabs.map((tab) => tab.getAttribute('aria-selected')),
    ).toEqual(['true', 'false']);
    replacement.destroy();
  });

  it('projects the exact shared recursive scenario with stable local Aria state', () => {
    const fixture = TestBed.createComponent(RecursivePilotHost);
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;
    expect(
      root.querySelectorAll('schema-aria-presentation-section'),
    ).toHaveLength(1);
    expect(root.querySelectorAll('schema-aria-presentation-tabs')).toHaveLength(
      3,
    );
    expect(
      root.querySelectorAll('schema-aria-presentation-accordion'),
    ).toHaveLength(2);
    expect(root.querySelectorAll('schema-aria-presentation-grid')).toHaveLength(
      3,
    );

    const betaTablistId = `${id([
      'aria.local',
      'presentation',
      ['item', ['rows'], 'beta'],
      'tabs',
      'item-tabs',
    ])}--tablist`;
    const betaTablist = root.querySelector<HTMLElement>(
      `#${cssEscape(betaTablistId)}`,
    );
    if (betaTablist === null) throw new Error('Beta Aria tabs missing.');
    const betaHost = betaTablist.closest<HTMLElement>('[data-schema-item-key]');
    if (betaHost === null) throw new Error('Beta Aria item host missing.');
    const tabs = Array.from(
      betaTablist.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    );
    const trigger =
      betaHost.querySelector<HTMLButtonElement>('[id$="--trigger"]');
    tabs[1]?.click();
    trigger?.click();
    fixture.detectChanges();
    TestBed.tick();
    expect(tabs[1]?.getAttribute('aria-selected')).toBe('true');
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');

    const initial = recursiveScenario.initialState.value as {
      readonly profile: Readonly<object>;
      readonly rows: readonly Readonly<Record<string, unknown>>[];
    };
    const [alpha, beta] = initial.rows;
    if (alpha === undefined || beta === undefined)
      throw new Error('Recursive items missing.');
    fixture.componentInstance.value.set({
      profile: initial.profile,
      rows: [beta, alpha],
    });
    fixture.componentInstance.locale.set('es');
    fixture.detectChanges();
    TestBed.tick();
    expect(root.querySelector(`#${cssEscape(betaTablistId)}`)).toBe(
      betaTablist,
    );
    expect(tabs[1]?.getAttribute('aria-selected')).toBe('true');
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    expect(tabs[1]?.textContent?.trim()).toBe('es:Details');

    fixture.componentInstance.value.set({
      profile: initial.profile,
      rows: [alpha],
    });
    fixture.detectChanges();
    TestBed.tick();
    expect(root.querySelector(`#${cssEscape(betaTablistId)}`)).toBeNull();
    fixture.componentInstance.value.set({
      profile: initial.profile,
      rows: [alpha, beta],
    });
    fixture.detectChanges();
    TestBed.tick();
    const replacement = root.querySelector<HTMLElement>(
      `#${cssEscape(betaTablistId)}`,
    );
    expect(replacement).not.toBe(betaTablist);
    expect(
      replacement?.querySelector('[role="tab"]')?.getAttribute('aria-selected'),
    ).toBe('true');

    fixture.componentInstance.value.set({
      profile: initial.profile,
      rows: [{ name: 'Invalid identity' }],
    });
    fixture.detectChanges();
    TestBed.tick();
    expect(root.querySelectorAll('[data-schema-item-key]')).toHaveLength(0);
    fixture.destroy();
  });
});

function id(parts: readonly unknown[]): string {
  return `se-${encodeURIComponent(JSON.stringify(parts))}`;
}

function cssEscape(value: string): string {
  return CSS.escape(value);
}
