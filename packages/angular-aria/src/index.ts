// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import {
  ChangeDetectionStrategy,
  Component,
  input,
  makeEnvironmentProviders,
  signal,
  type EnvironmentProviders,
  type OnInit,
} from '@angular/core';
import { Tab, TabList, TabPanel, Tabs } from '@angular/aria/tabs';
import {
  SchemaPresentationEntryOutletComponent,
  SchemaPresentationPanelOutletComponent,
  provideSchemaPresentationContainer,
  type AngularPresentationContainerDefinition,
  type AngularPresentationContainerRegistration,
  type AngularPresentationContainerRenderer,
  type AngularPresentationContainerRenderModel,
} from '@rabassoft/schema-engine-angular';

@Component({
  selector: 'schema-aria-presentation-section',
  standalone: true,
  imports: [SchemaPresentationEntryOutletComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (section(); as model) {
      <fieldset>
        <legend [id]="model.legendId">{{ model.label }}</legend>
        @for (
          child of model.definition.children;
          track child.kind === 'form-node' ? child.node.key : child.key
        ) {
          <schema-presentation-entry-outlet [entry]="child" />
        }
      </fieldset>
    }
  `,
})
class AngularAriaPresentationSectionComponent implements AngularPresentationContainerRenderer {
  readonly presentation =
    input.required<AngularPresentationContainerRenderModel>();
  protected readonly section = () => {
    const model = this.presentation();
    return model.kind === 'section' ? model : undefined;
  };
}

@Component({
  selector: 'schema-aria-presentation-tabs',
  standalone: true,
  imports: [
    Tabs,
    TabList,
    Tab,
    TabPanel,
    SchemaPresentationPanelOutletComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (tabs(); as model) {
      <div ngTabs>
        <div
          ngTabList
          orientation="horizontal"
          focusMode="roving"
          selectionMode="follow"
          [wrap]="true"
          [(selectedTab)]="selectedTab"
          [id]="model.tablistId"
          [attr.aria-label]="model.label"
        >
          @for (panel of model.panels; track panel.definition.key) {
            <button
              ngTab
              type="button"
              [id]="panel.tabId"
              [value]="panel.tabpanelId"
            >
              {{ panel.label }}
            </button>
          }
        </div>
        @for (panel of model.panels; track panel.definition.key) {
          <div
            ngTabPanel
            [preserveContent]="true"
            [id]="panel.tabpanelId"
            [value]="panel.tabpanelId"
            [hidden]="selectedTab() !== panel.tabpanelId"
            [attr.inert]="selectedTab() !== panel.tabpanelId ? '' : null"
          >
            <schema-presentation-panel-outlet [panel]="panel.definition" />
          </div>
        }
      </div>
    }
  `,
})
class AngularAriaPresentationTabsComponent
  implements AngularPresentationContainerRenderer, OnInit
{
  readonly presentation =
    input.required<AngularPresentationContainerRenderModel>();
  protected readonly selectedTab = signal<string | undefined>(undefined);
  protected readonly tabs = () => {
    const model = this.presentation();
    return model.kind === 'tabs' ? model : undefined;
  };

  ngOnInit(): void {
    this.selectedTab.set(this.tabs()?.panels[0]?.tabpanelId);
  }
}

@Component({
  selector: 'schema-aria-presentation-accordion',
  standalone: true,
  imports: [SchemaPresentationPanelOutletComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (accordion(); as model) {
      <div
        role="group"
        [id]="model.accordionId"
        [attr.aria-label]="model.label"
      >
        @for (
          panel of model.panels;
          track panel.definition.key;
          let index = $index
        ) {
          <button
            type="button"
            [id]="panel.triggerId"
            [attr.aria-expanded]="expanded().has(index)"
            [attr.aria-controls]="panel.regionId"
            (click)="toggle(index)"
          >
            {{ panel.label }}
          </button>
          <div
            role="region"
            [id]="panel.regionId"
            [attr.aria-labelledby]="panel.triggerId"
            [hidden]="!expanded().has(index)"
            [attr.inert]="!expanded().has(index) ? '' : null"
          >
            <schema-presentation-panel-outlet [panel]="panel.definition" />
          </div>
        }
      </div>
    }
  `,
})
class AngularAriaPresentationAccordionComponent implements AngularPresentationContainerRenderer {
  readonly presentation =
    input.required<AngularPresentationContainerRenderModel>();
  protected readonly expanded = signal<ReadonlySet<number>>(new Set());
  protected readonly accordion = () => {
    const model = this.presentation();
    return model.kind === 'accordion' ? model : undefined;
  };

  protected toggle(index: number): void {
    const next = new Set(this.expanded());
    if (next.has(index)) next.delete(index);
    else next.add(index);
    this.expanded.set(next);
  }
}

@Component({
  selector: 'schema-aria-presentation-grid',
  standalone: true,
  imports: [SchemaPresentationEntryOutletComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (grid(); as model) {
      <div
        class="se-aria-grid"
        role="group"
        [id]="model.gridId"
        [attr.aria-label]="model.label"
        [style.--se-aria-grid-columns]="model.definition.columns"
      >
        @for (item of model.items; track item.definition.key) {
          <div
            class="se-aria-grid-cell"
            [id]="item.cellId"
            [style.--se-aria-grid-span]="item.definition.span"
          >
            <schema-presentation-entry-outlet [entry]="item.definition.child" />
          </div>
        }
      </div>
    }
  `,
})
class AngularAriaPresentationGridComponent implements AngularPresentationContainerRenderer {
  readonly presentation =
    input.required<AngularPresentationContainerRenderModel>();
  protected readonly grid = () => {
    const model = this.presentation();
    return model.kind === 'grid' ? model : undefined;
  };
}

const registrations: readonly AngularPresentationContainerRegistration[] =
  Object.freeze([
    registration(
      'angular-aria-section',
      AngularAriaPresentationSectionComponent,
      'section',
    ),
    registration(
      'angular-aria-tabs',
      AngularAriaPresentationTabsComponent,
      'tabs',
    ),
    registration(
      'angular-aria-accordion',
      AngularAriaPresentationAccordionComponent,
      'accordion',
    ),
    registration(
      'angular-aria-grid',
      AngularAriaPresentationGridComponent,
      'grid',
    ),
  ]);

function registration(
  id: string,
  renderer: AngularPresentationContainerRegistration['renderer'],
  kind: AngularPresentationContainerDefinition['kind'],
): AngularPresentationContainerRegistration {
  return Object.freeze({
    id,
    renderer,
    tester: (definition: AngularPresentationContainerDefinition) =>
      definition.kind === kind ? 10 : null,
    priority: 0,
  });
}

export function provideSchemaEngineAngularAriaContainers(): EnvironmentProviders {
  return makeEnvironmentProviders(
    registrations.map((value) => provideSchemaPresentationContainer(value)),
  );
}
