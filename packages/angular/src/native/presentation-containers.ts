// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
  type Provider,
} from '@angular/core';
import type { PresentationEntryDefinition } from '@rabassoft/schema-engine';
import type {
  AngularPresentationContainerDefinition,
  AngularPresentationContainerRegistration,
  AngularPresentationContainerRenderer,
  AngularPresentationContainerRenderModel,
} from '../presentation-container.js';
import { provideSchemaPresentationContainer } from '../presentation-container.js';
import {
  SchemaPresentationEntryOutletComponent,
  SchemaPresentationPanelOutletComponent,
} from '../presentation-outlets.js';

@Component({
  selector: 'schema-native-presentation-section',
  standalone: true,
  imports: [SchemaPresentationEntryOutletComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (section(); as model) {
      <fieldset>
        <legend [id]="model.legendId">{{ model.label }}</legend>
        @for (child of model.definition.children; track entryKey(child)) {
          <schema-presentation-entry-outlet [entry]="child" />
        }
      </fieldset>
    }
  `,
})
export class NativePresentationSectionComponent implements AngularPresentationContainerRenderer {
  readonly presentation =
    input.required<AngularPresentationContainerRenderModel>();
  protected readonly section = () => {
    const model = this.presentation();
    return model.kind === 'section' ? model : undefined;
  };
  protected entryKey(entry: PresentationEntryDefinition): string {
    return entry.kind === 'form-node' ? entry.node.key : entry.key;
  }
}

@Component({
  selector: 'schema-native-presentation-tabs',
  standalone: true,
  imports: [SchemaPresentationPanelOutletComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (tabs(); as model) {
      <div
        role="tablist"
        [id]="model.tablistId"
        [attr.aria-label]="model.label"
      >
        @for (
          panel of model.panels;
          track panel.definition.key;
          let index = $index
        ) {
          <button
            type="button"
            role="tab"
            [id]="panel.tabId"
            [attr.aria-selected]="activeIndex() === index"
            [attr.aria-controls]="panel.tabpanelId"
            [tabIndex]="activeIndex() === index ? 0 : -1"
            (click)="activate(index, panel.tabId)"
            (keydown)="onKeydown($event, index)"
          >
            {{ panel.label }}
          </button>
        }
      </div>
      @for (
        panel of model.panels;
        track panel.definition.key;
        let index = $index
      ) {
        <div
          role="tabpanel"
          [id]="panel.tabpanelId"
          [attr.aria-labelledby]="panel.tabId"
          [hidden]="activeIndex() !== index"
          [attr.inert]="activeIndex() !== index ? '' : null"
        >
          <schema-presentation-panel-outlet [panel]="panel.definition" />
        </div>
      }
    }
  `,
})
export class NativePresentationTabsComponent implements AngularPresentationContainerRenderer {
  readonly presentation =
    input.required<AngularPresentationContainerRenderModel>();
  protected readonly activeIndex = signal(0);
  private readonly document = inject(DOCUMENT);
  protected readonly tabs = () => {
    const model = this.presentation();
    return model.kind === 'tabs' ? model : undefined;
  };

  protected activate(index: number, tabId: string): void {
    this.activeIndex.set(index);
    this.document.getElementById(tabId)?.focus();
  }

  protected onKeydown(event: KeyboardEvent, index: number): void {
    const model = this.tabs();
    if (model === undefined) return;
    let next: number | undefined;
    if (event.key === 'ArrowLeft')
      next = (index - 1 + model.panels.length) % model.panels.length;
    else if (event.key === 'ArrowRight')
      next = (index + 1) % model.panels.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = model.panels.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    const panel = model.panels[next];
    if (panel !== undefined) this.activate(next, panel.tabId);
  }
}

@Component({
  selector: 'schema-native-presentation-accordion',
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
export class NativePresentationAccordionComponent implements AngularPresentationContainerRenderer {
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
  selector: 'schema-native-presentation-grid',
  standalone: true,
  imports: [SchemaPresentationEntryOutletComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host [data-schema-presentation-grid] {
      display: grid;
      grid-template-columns: repeat(var(--schema-grid-columns), minmax(0, 1fr));
    }
    :host [data-schema-presentation-grid-cell] {
      grid-column: span var(--schema-grid-span);
    }
    @media (max-width: 40rem) {
      :host [data-schema-presentation-grid] {
        grid-template-columns: minmax(0, 1fr);
      }
      :host [data-schema-presentation-grid-cell] {
        grid-column: span 1;
      }
    }
  `,
  template: `
    @if (grid(); as model) {
      <div
        role="group"
        data-schema-presentation-grid
        [id]="model.gridId"
        [attr.aria-label]="model.label"
        [style.--schema-grid-columns]="model.definition.columns"
      >
        @for (item of model.items; track item.definition.key) {
          <div
            data-schema-presentation-grid-cell
            [id]="item.cellId"
            [style.--schema-grid-span]="item.definition.span"
          >
            <schema-presentation-entry-outlet [entry]="item.definition.child" />
          </div>
        }
      </div>
    }
  `,
})
export class NativePresentationGridComponent implements AngularPresentationContainerRenderer {
  readonly presentation =
    input.required<AngularPresentationContainerRenderModel>();
  protected readonly grid = () => {
    const model = this.presentation();
    return model.kind === 'grid' ? model : undefined;
  };
}

const nativePresentationRegistrations: readonly AngularPresentationContainerRegistration[] =
  Object.freeze([
    Object.freeze({
      id: 'native-section',
      renderer: NativePresentationSectionComponent,
      tester: (definition: AngularPresentationContainerDefinition) =>
        definition.kind === 'section' ? 0 : null,
    }),
    Object.freeze({
      id: 'native-tabs',
      renderer: NativePresentationTabsComponent,
      tester: (definition: AngularPresentationContainerDefinition) =>
        definition.kind === 'tabs' ? 0 : null,
    }),
    Object.freeze({
      id: 'native-accordion',
      renderer: NativePresentationAccordionComponent,
      tester: (definition: AngularPresentationContainerDefinition) =>
        definition.kind === 'accordion' ? 0 : null,
    }),
    Object.freeze({
      id: 'native-grid',
      renderer: NativePresentationGridComponent,
      tester: (definition: AngularPresentationContainerDefinition) =>
        definition.kind === 'grid' ? 0 : null,
    }),
  ]);

/** @internal */
export function nativePresentationContainerProviders(): readonly Provider[] {
  return nativePresentationRegistrations.map((registration) =>
    provideSchemaPresentationContainer(registration),
  );
}
