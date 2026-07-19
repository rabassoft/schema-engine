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
});
