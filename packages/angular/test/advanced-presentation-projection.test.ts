import { Component, computed, inject, input, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  compileFormDefinition,
  type Diagnostic,
  type PresentationEntryDefinition,
  type PresentationPanelDefinition,
  type SchemaValidator,
} from '@rabassoft/schema-engine';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  SchemaFormDirective,
  SchemaPresentationEntryOutletComponent,
  SchemaPresentationPanelOutletComponent,
  provideSchemaEngineAngularNative,
  provideSchemaPresentationContainer,
  provideSchemaTextResolver,
  type AngularControlledFormConfig,
  type AngularPresentationContainerRenderModel,
  type AngularPresentationContainerRenderer,
} from '../dist/index.js';
import { PRESENTATION_PANEL_CLAIM_CONTEXT } from '../dist/presentation-context.js';
import { SCHEMA_PRESENTATION_CONTAINER_REGISTRATIONS } from '../dist/presentation-container.js';
import { panelHostDiagnostic } from '../dist/presentation-host.js';

const schema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: Object.fromEntries(
    [
      'tabOne',
      'tabTwo',
      'first',
      'second',
      'gridOne',
      'gridTwo',
      'section',
    ].map((name) => [name, { type: 'string' }]),
  ),
} as const;

const uiSchema = {
  presentation: [
    {
      kind: 'tabs',
      id: 'account',
      label: 'Account tabs',
      panels: [
        { kind: 'panel', id: 'one', label: 'First tab', children: ['tabOne'] },
        { kind: 'panel', id: 'two', label: 'Second tab', children: ['tabTwo'] },
      ],
    },
    {
      kind: 'accordion',
      id: 'details',
      label: 'Details accordion',
      panels: [
        {
          kind: 'panel',
          id: 'first',
          label: 'First detail',
          children: ['first'],
        },
        {
          kind: 'panel',
          id: 'second',
          label: 'Second detail',
          children: ['second'],
        },
      ],
    },
    {
      kind: 'grid',
      id: 'summary',
      label: 'Summary grid',
      columns: 3,
      items: [
        { span: 2, child: 'gridOne' },
        { span: 1, child: 'gridTwo' },
      ],
    },
    {
      kind: 'section',
      id: 'plain',
      label: 'Plain section',
      children: ['section'],
    },
  ],
} as const;

const compiled = compileFormDefinition({ schema, uiSchema });
if (!compiled.success) throw new Error('advanced Angular fixture failed');
const definition = compiled.definition;
const validator: SchemaValidator = Object.freeze({
  validate: () => ({ valid: true, issues: [] }),
});
const value = Object.freeze({
  tabOne: 'one',
  tabTwo: 'two',
  first: 'first',
  second: 'second',
  gridOne: 'grid-one',
  gridTwo: 'grid-two',
  section: 'section',
});

@Component({
  standalone: true,
  imports: [SchemaFormDirective],
  template: `<form
    [schemaForm]="config()"
    (schemaDiagnostics)="diagnostics.push($event)"
  ></form>`,
})
class AdvancedHost {
  readonly locale = signal('en');
  readonly definition = signal(compiled.definition);
  readonly diagnostics: (readonly Diagnostic[])[] = [];
  readonly config = computed<AngularControlledFormConfig<object>>(() => ({
    formId: 'advanced.form',
    definition: this.definition(),
    schema,
    value,
    baselineValue: value,
    locale: this.locale(),
    validator,
  }));
}

@Component({ selector: 'missing-section', standalone: true, template: '' })
class MissingSectionRenderer implements AngularPresentationContainerRenderer {
  readonly presentation =
    input.required<AngularPresentationContainerRenderModel>();

  ngOnDestroy(): void {
    missingSectionDestroyed();
  }
}

const missingSectionDestroyed = vi.fn();

@Component({
  selector: 'duplicate-section',
  standalone: true,
  imports: [SchemaPresentationEntryOutletComponent],
  template: `
    <schema-presentation-entry-outlet [entry]="child()" />
    <schema-presentation-entry-outlet [entry]="child()" />
  `,
})
class DuplicateSectionRenderer implements AngularPresentationContainerRenderer {
  readonly presentation =
    input.required<AngularPresentationContainerRenderModel>();
  protected readonly child = (): PresentationEntryDefinition => {
    const model = this.presentation();
    if (model.kind !== 'section' || model.definition.children[0] === undefined)
      throw new Error('invalid test model');
    return model.definition.children[0];
  };
}

const tabsDefinition = definition.presentation[0];
if (tabsDefinition?.kind !== 'tabs') throw new Error('tabs fixture missing');
const foreignEntry = tabsDefinition.panels[0]?.children[0];
if (foreignEntry === undefined)
  throw new Error('foreign entry fixture missing');

@Component({
  selector: 'foreign-section',
  standalone: true,
  imports: [SchemaPresentationEntryOutletComponent],
  template: `<schema-presentation-entry-outlet [entry]="foreign" />`,
})
class ForeignSectionRenderer implements AngularPresentationContainerRenderer {
  readonly presentation =
    input.required<AngularPresentationContainerRenderModel>();
  protected readonly foreign = foreignEntry;
}

@Component({
  selector: 'conditional-section',
  standalone: true,
  imports: [SchemaPresentationEntryOutletComponent],
  template: `
    <button type="button" (click)="visible.set(false)">Hide</button>
    @if (visible()) {
      <schema-presentation-entry-outlet [entry]="child()" />
    }
  `,
})
class ConditionalSectionRenderer implements AngularPresentationContainerRenderer {
  readonly presentation =
    input.required<AngularPresentationContainerRenderModel>();
  protected readonly visible = signal(true);
  protected readonly child = (): PresentationEntryDefinition => {
    const model = this.presentation();
    if (model.kind !== 'section' || model.definition.children[0] === undefined)
      throw new Error('invalid test model');
    return model.definition.children[0];
  };
}

@Component({ selector: 'throwing-container', standalone: true, template: '' })
class ThrowingContainerRenderer implements AngularPresentationContainerRenderer {
  readonly presentation =
    input.required<AngularPresentationContainerRenderModel>();

  constructor() {
    throw new Error('hidden');
  }
}

@Component({
  selector: 'authority-seeking-section',
  standalone: true,
  template: '',
})
class AuthoritySeekingSectionRenderer implements AngularPresentationContainerRenderer {
  readonly presentation =
    input.required<AngularPresentationContainerRenderModel>();

  constructor() {
    inject(SchemaFormDirective);
  }
}

describe('Angular advanced presentation projection', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('projects exact native semantics, mounted descendants and source order', () => {
    TestBed.configureTestingModule({
      providers: [provideSchemaEngineAngularNative()],
    });
    const fixture = TestBed.createComponent(AdvancedHost);
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;

    const tabs = Array.from(root.querySelectorAll<HTMLElement>('[role="tab"]'));
    const panels = Array.from(
      root.querySelectorAll<HTMLElement>('[role="tabpanel"]'),
    );
    expect(tabs).toHaveLength(2);
    expect(panels).toHaveLength(2);
    expect(tabs.map((tab) => tab.textContent?.trim())).toEqual([
      'First tab',
      'Second tab',
    ]);
    expect(tabs.map((tab) => tab.getAttribute('aria-selected'))).toEqual([
      'true',
      'false',
    ]);
    expect(tabs.map((tab) => tab.tabIndex)).toEqual([0, -1]);
    expect(panels.map((panel) => panel.hidden)).toEqual([false, true]);
    expect(panels[0]?.querySelector('input')).not.toBeNull();
    expect(panels[1]?.querySelector('input')).not.toBeNull();
    expect(tabs[0]?.getAttribute('aria-controls')).toBe(panels[0]?.id);
    expect(panels[0]?.getAttribute('aria-labelledby')).toBe(tabs[0]?.id);
    const tabsBase = `se-${encodeURIComponent(
      JSON.stringify(['advanced.form', 'presentation', 'tabs', 'account']),
    )}`;
    const firstPanelBase = `se-${encodeURIComponent(
      JSON.stringify([
        'advanced.form',
        'presentation',
        'tabs',
        'account',
        'panel',
        'one',
      ]),
    )}`;
    expect(root.querySelector('[role="tablist"]')?.id).toBe(
      `${tabsBase}--tablist`,
    );
    expect(tabs[0]?.id).toBe(`${firstPanelBase}--tab`);
    expect(panels[0]?.id).toBe(`${firstPanelBase}--tabpanel`);

    const accordion = root.querySelector<HTMLElement>('[id$="--accordion"]');
    const triggers = Array.from(
      accordion?.querySelectorAll<HTMLButtonElement>('[id$="--trigger"]') ?? [],
    );
    const regions = Array.from(
      accordion?.querySelectorAll<HTMLElement>('[role="region"]') ?? [],
    );
    expect(
      triggers.map((trigger) => trigger.getAttribute('aria-expanded')),
    ).toEqual(['false', 'false']);
    expect(regions.map((region) => region.hidden)).toEqual([true, true]);
    expect(
      regions.every((region) => region.querySelector('input') !== null),
    ).toBe(true);
    expect(triggers[0]?.getAttribute('aria-controls')).toBe(regions[0]?.id);
    expect(regions[0]?.getAttribute('aria-labelledby')).toBe(triggers[0]?.id);

    const grid = root.querySelector<HTMLElement>('[id$="--grid"]');
    const cells = Array.from(
      grid?.querySelectorAll<HTMLElement>(
        '[data-schema-presentation-grid-cell]',
      ) ?? [],
    );
    expect(grid?.getAttribute('role')).toBe('group');
    expect(grid?.style.getPropertyValue('--schema-grid-columns')).toBe('3');
    expect(
      cells.map((cell) => cell.style.getPropertyValue('--schema-grid-span')),
    ).toEqual(['2', '1']);
    expect(cells.map((cell) => cell.querySelector('input')?.value)).toEqual([
      'grid-one',
      'grid-two',
    ]);
    expect(root.querySelectorAll('fieldset')).toHaveLength(1);
  });

  it('retains native state and renderer identity across locale projection', () => {
    TestBed.configureTestingModule({
      providers: [
        provideSchemaEngineAngularNative(),
        provideSchemaTextResolver({
          resolve: (text, context) => `${context.locale}:${text}`,
        }),
      ],
    });
    const fixture = TestBed.createComponent(AdvancedHost);
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;
    const tablist = root.querySelector<HTMLElement>('[role="tablist"]');
    const tabs = Array.from(
      root.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    );
    tabs[1]?.click();
    fixture.detectChanges();
    TestBed.tick();
    const triggers = Array.from(
      root.querySelectorAll<HTMLButtonElement>('[id$="--trigger"]'),
    );
    triggers[1]?.click();
    fixture.detectChanges();
    TestBed.tick();

    fixture.componentInstance.locale.set('es');
    fixture.detectChanges();
    TestBed.tick();
    const updatedTabs = Array.from(
      root.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    );
    expect(root.querySelector('[role="tablist"]')).toBe(tablist);
    expect(updatedTabs[1]?.getAttribute('aria-selected')).toBe('true');
    expect(updatedTabs[1]?.textContent?.trim()).toBe('es:Second tab');
    expect(triggers[1]?.getAttribute('aria-expanded')).toBe('true');

    const replacement = compileFormDefinition({ schema, uiSchema });
    if (!replacement.success) throw new Error('replacement fixture failed');
    fixture.componentInstance.definition.set(replacement.definition);
    fixture.detectChanges();
    TestBed.tick();
    const replacedTabs = Array.from(
      root.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    );
    const replacedTriggers = Array.from(
      root.querySelectorAll<HTMLButtonElement>('[id$="--trigger"]'),
    );
    expect(replacedTabs[0]).not.toBe(updatedTabs[0]);
    expect(replacedTabs[0]?.getAttribute('aria-selected')).toBe('true');
    expect(
      replacedTriggers.map((trigger) => trigger.getAttribute('aria-expanded')),
    ).toEqual(['false', 'false']);
  });

  it('implements cyclic tab keyboard navigation and independent disclosure', () => {
    TestBed.configureTestingModule({
      providers: [provideSchemaEngineAngularNative()],
    });
    const fixture = TestBed.createComponent(AdvancedHost);
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;
    const tabs = Array.from(
      root.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    );
    tabs[0]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    fixture.detectChanges();
    expect(tabs[1]?.getAttribute('aria-selected')).toBe('true');
    tabs[1]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
    fixture.detectChanges();
    expect(tabs[0]?.getAttribute('aria-selected')).toBe('true');

    const triggers = Array.from(
      root.querySelectorAll<HTMLButtonElement>('[id$="--trigger"]'),
    );
    triggers[0]?.click();
    triggers[1]?.click();
    fixture.detectChanges();
    expect(
      triggers.map((trigger) => trigger.getAttribute('aria-expanded')),
    ).toEqual(['true', 'true']);
    triggers[0]?.click();
    fixture.detectChanges();
    expect(
      triggers.map((trigger) => trigger.getAttribute('aria-expanded')),
    ).toEqual(['false', 'true']);
  });

  it('rejects incomplete custom claims without retrying native and keeps siblings', () => {
    missingSectionDestroyed.mockClear();
    TestBed.configureTestingModule({
      providers: [
        provideSchemaEngineAngularNative(),
        provideSchemaPresentationContainer({
          id: 'missing-section',
          renderer: MissingSectionRenderer,
          tester: (candidate) => (candidate.kind === 'section' ? 10 : null),
        }),
      ],
    });
    const fixture = TestBed.createComponent(AdvancedHost);
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('missing-section')).toBeNull();
    expect(root.querySelector('fieldset')).toBeNull();
    expect(root.querySelector('[role="tablist"]')).not.toBeNull();
    expect(
      fixture.componentInstance.diagnostics
        .flat()
        .filter(({ code }) => code === 'SECTION_HOST_INSTANTIATION_FAILED'),
    ).toHaveLength(1);
    expect(missingSectionDestroyed).toHaveBeenCalledOnce();
  });

  it('does not expose form authority to a selected container renderer', () => {
    TestBed.configureTestingModule({
      providers: [
        provideSchemaEngineAngularNative(),
        provideSchemaPresentationContainer({
          id: 'authority-seeking-section',
          renderer: AuthoritySeekingSectionRenderer,
          tester: (candidate) => (candidate.kind === 'section' ? 10 : null),
        }),
      ],
    });
    const fixture = TestBed.createComponent(AdvancedHost);
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('authority-seeking-section')).toBeNull();
    expect(root.querySelector('fieldset')).toBeNull();
    expect(root.querySelector('[role="tablist"]')).not.toBeNull();
    expect(
      fixture.componentInstance.diagnostics
        .flat()
        .filter(({ code }) => code === 'SECTION_HOST_INSTANTIATION_FAILED'),
    ).toHaveLength(1);
  });

  it.each([
    ['duplicate', DuplicateSectionRenderer],
    ['foreign', ForeignSectionRenderer],
  ] as const)('rejects a %s exact-definition claim', (_mode, renderer) => {
    TestBed.configureTestingModule({
      providers: [
        provideSchemaEngineAngularNative(),
        provideSchemaPresentationContainer({
          id: `invalid-${_mode}-section`,
          renderer,
          tester: (candidate) => (candidate.kind === 'section' ? 10 : null),
        }),
      ],
    });
    const fixture = TestBed.createComponent(AdvancedHost);
    fixture.detectChanges();
    TestBed.tick();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('fieldset'),
    ).toBeNull();
    expect(
      fixture.componentInstance.diagnostics
        .flat()
        .filter(({ code }) => code === 'SECTION_HOST_INSTANTIATION_FAILED'),
    ).toHaveLength(1);
  });

  it('invalidates a renderer that conditionally removes an audited outlet', () => {
    TestBed.configureTestingModule({
      providers: [
        provideSchemaEngineAngularNative(),
        provideSchemaPresentationContainer({
          id: 'conditional-section',
          renderer: ConditionalSectionRenderer,
          tester: (candidate) => (candidate.kind === 'section' ? 10 : null),
        }),
      ],
    });
    const fixture = TestBed.createComponent(AdvancedHost);
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;
    const button = Array.from(
      root.querySelectorAll<HTMLButtonElement>('button'),
    ).find(({ textContent }) => textContent?.trim() === 'Hide');
    expect(button).not.toBeNull();
    button?.click();
    fixture.detectChanges();
    TestBed.tick();
    expect(root.querySelector('conditional-section')).toBeNull();
    expect(
      fixture.componentInstance.diagnostics
        .flat()
        .filter(({ code }) => code === 'SECTION_HOST_INSTANTIATION_FAILED'),
    ).toHaveLength(1);
  });

  it.each([
    [
      'tabs',
      'account',
      'TABS_HOST_INSTANTIATION_FAILED',
      'Tabs host could not be instantiated.',
    ],
    [
      'accordion',
      'details',
      'ACCORDION_HOST_INSTANTIATION_FAILED',
      'Accordion host could not be instantiated.',
    ],
    [
      'grid',
      'summary',
      'GRID_HOST_INSTANTIATION_FAILED',
      'Grid host could not be instantiated.',
    ],
  ] as const)(
    'isolates a selected %s host failure without native retry',
    (kind, id, code, fallbackMessage) => {
      TestBed.configureTestingModule({
        providers: [
          provideSchemaEngineAngularNative(),
          provideSchemaPresentationContainer({
            id: `throwing-${kind}`,
            renderer: ThrowingContainerRenderer,
            tester: (candidate) => (candidate.kind === kind ? 10 : null),
          }),
        ],
      });
      const fixture = TestBed.createComponent(AdvancedHost);
      fixture.detectChanges();
      TestBed.tick();
      const root = fixture.nativeElement as HTMLElement;
      expect(root.querySelector('throwing-container')).toBeNull();
      expect(root.querySelector('fieldset')).not.toBeNull();
      expect(
        fixture.componentInstance.diagnostics
          .flat()
          .filter((diagnostic) => diagnostic.code === code),
      ).toEqual([
        {
          code,
          severity: 'error',
          source: 'runtime',
          parameters: { presentationKind: kind, presentationId: id },
          fallbackMessage,
        },
      ]);
    },
  );

  it('recovers from tester defects to native selection in evaluation order', () => {
    TestBed.configureTestingModule({
      providers: [
        provideSchemaEngineAngularNative(),
        provideSchemaPresentationContainer({
          id: 'throws-for-section',
          renderer: MissingSectionRenderer,
          tester: (candidate) => {
            if (candidate.kind === 'section') throw new Error('hidden');
            return null;
          },
        }),
        provideSchemaPresentationContainer({
          id: 'invalid-for-section',
          renderer: MissingSectionRenderer,
          tester: (candidate) => (candidate.kind === 'section' ? -1 : null),
        }),
      ],
    });
    const fixture = TestBed.createComponent(AdvancedHost);
    fixture.detectChanges();
    TestBed.tick();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('fieldset'),
    ).not.toBeNull();
    expect(
      fixture.componentInstance.diagnostics
        .flat()
        .filter(({ code }) => code.includes('PRESENTATION_CONTAINER_TEST'))
        .map(({ code }) => code),
    ).toEqual([
      'PRESENTATION_CONTAINER_TESTER_EXCEPTION',
      'INVALID_PRESENTATION_CONTAINER_TEST_RESULT',
    ]);
  });

  it('blocks complete form projection for one provider configuration defect', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideSchemaEngineAngularNative(),
        {
          provide: SCHEMA_PRESENTATION_CONTAINER_REGISTRATIONS,
          multi: true,
          useValue: { id: 'invalid' },
        },
      ],
    });
    const fixture = TestBed.createComponent(AdvancedHost);
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('input'),
    ).toBeNull();
    expect(fixture.componentInstance.diagnostics.flat()).toEqual([
      {
        code: 'INVALID_PRESENTATION_CONTAINER_REGISTRATION',
        severity: 'error',
        source: 'runtime',
        parameters: {
          index: 4,
          member: 'renderer',
          expected: 'Angular component type',
          reason: 'member-missing',
        },
        fallbackMessage: 'Presentation container registration is invalid.',
      },
    ]);
  });

  it('requires scoped outlet context and isolates panel-owned child failure', () => {
    expect(() =>
      TestBed.createComponent(SchemaPresentationEntryOutletComponent),
    ).toThrow();
    expect(() =>
      TestBed.createComponent(SchemaPresentationPanelOutletComponent),
    ).toThrow();
    TestBed.resetTestingModule();

    const panel = definition.presentation[0];
    if (panel?.kind !== 'tabs') throw new Error('tabs fixture missing');
    const ownedPanel: PresentationPanelDefinition | undefined = panel.panels[0];
    if (ownedPanel === undefined) throw new Error('panel fixture missing');
    const fail = vi.fn();
    const claim = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: PRESENTATION_PANEL_CLAIM_CONTEXT,
          useValue: {
            definition: () => definition,
            snapshot: () => ({}) as never,
            render: () => {
              throw new Error('hidden');
            },
            claim,
            release: vi.fn(),
            fail,
            audit: vi.fn(),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(
      SchemaPresentationPanelOutletComponent,
    );
    fixture.componentRef.setInput('panel', ownedPanel);
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(claim).toHaveBeenCalledOnce();
    expect(fail).toHaveBeenCalledOnce();
    expect(fail).toHaveBeenCalledWith(ownedPanel);
    expect(panelHostDiagnostic(panel, ownedPanel)).toEqual({
      code: 'PANEL_HOST_INSTANTIATION_FAILED',
      severity: 'error',
      source: 'runtime',
      parameters: {
        ownerKind: 'tabs',
        ownerId: 'account',
        panelId: 'one',
      },
      fallbackMessage: 'Presentation panel host could not be instantiated.',
    });
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('input'),
    ).toBeNull();
  });
});
