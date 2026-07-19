// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  Injector,
  input,
  viewChild,
  ViewContainerRef,
  type ComponentRef,
  type AfterViewInit,
  type OnDestroy,
} from '@angular/core';
import type {
  PresentationEntryDefinition,
  PresentationPanelDefinition,
} from '@rabassoft/schema-engine';
import {
  ExactPresentationClaims,
  PRESENTATION_ENTRY_CLAIM_CONTEXT,
  PRESENTATION_PANEL_CLAIM_CONTEXT,
  type PresentationEntryClaimContext,
} from './presentation-context.js';

const panelEntryContexts = new WeakMap<
  SchemaPresentationPanelOutletComponent,
  PresentationEntryClaimContext
>();

@Component({
  selector: 'schema-presentation-entry-outlet',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-template #container />`,
})
export class SchemaPresentationEntryOutletComponent {
  readonly entry = input.required<PresentationEntryDefinition>();
  private readonly context = inject(PRESENTATION_ENTRY_CLAIM_CONTEXT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly container = viewChild.required('container', {
    read: ViewContainerRef,
  });

  private claimed: PresentationEntryDefinition | undefined;
  private componentRef: ComponentRef<unknown> | undefined;

  constructor() {
    effect(() => {
      const value = this.entry();
      if (this.claimed === value) return;
      this.context.claim(value);
      this.claimed = value;
      this.container().clear();
      this.componentRef = this.context.render(value, this.container());
      this.componentRef.changeDetectorRef.detectChanges();
    });
    this.destroyRef.onDestroy(() => {
      if (this.claimed !== undefined) this.context.release(this.claimed);
      if (
        this.componentRef !== undefined &&
        !this.componentRef.hostView.destroyed
      )
        this.componentRef.destroy();
    });
  }
}

@Component({
  selector: 'schema-presentation-panel-outlet',
  standalone: true,
  providers: [
    {
      provide: PRESENTATION_ENTRY_CLAIM_CONTEXT,
      useFactory: () => {
        const component = inject(SchemaPresentationPanelOutletComponent);
        const context = panelEntryContexts.get(component);
        if (context === undefined)
          throw new Error('Presentation panel context is unavailable.');
        return context;
      },
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-template #container />`,
})
export class SchemaPresentationPanelOutletComponent
  implements AfterViewInit, OnDestroy
{
  readonly panel = input.required<PresentationPanelDefinition>();
  private readonly parent = inject(PRESENTATION_PANEL_CLAIM_CONTEXT);
  private readonly injector = inject(Injector);
  private readonly container = viewChild.required('container', {
    read: ViewContainerRef,
  });
  private claims:
    ExactPresentationClaims<PresentationEntryDefinition> | undefined;
  private claimedPanel: PresentationPanelDefinition | undefined;
  private failed = false;
  private destroying = false;

  constructor() {
    panelEntryContexts.set(this, {
      definition: () => this.parent.definition(),
      snapshot: () => this.parent.snapshot(),
      render: (entry, container) => this.parent.render(entry, container),
      claim: (entry) => {
        this.ensureClaims();
        try {
          this.claims?.claim(entry);
        } catch (error) {
          this.failPanel();
          throw error;
        }
      },
      release: (entry) => {
        if (
          !this.destroying &&
          !this.failed &&
          this.claims?.release(entry) === true
        )
          this.failPanel();
      },
      audit: () => this.claims?.audit(),
    });
    effect(() => {
      const value = this.panel();
      if (this.claimedPanel !== value) {
        this.parent.claim(value);
        this.claimedPanel = value;
      }
      this.ensureClaims();
    });
  }

  ngAfterViewInit(): void {
    this.ensureClaims();
    const panel = this.panel();
    try {
      for (const child of panel.children) {
        const ref = this.container().createComponent(
          SchemaPresentationEntryOutletComponent,
          { injector: this.injector },
        );
        ref.setInput('entry', child);
        ref.changeDetectorRef.detectChanges();
      }
      this.claims?.audit();
    } catch {
      this.failPanel();
    }
  }

  ngOnDestroy(): void {
    this.destroying = true;
    panelEntryContexts.delete(this);
    if (this.claimedPanel !== undefined) this.parent.release(this.claimedPanel);
  }

  private ensureClaims(): void {
    if (this.failed) return;
    const panel = this.panel();
    if (this.claimedPanel !== panel) {
      this.parent.claim(panel);
      this.claimedPanel = panel;
    }
    if (this.claims === undefined)
      this.claims = new ExactPresentationClaims(panel.children);
  }

  private failPanel(): void {
    if (this.failed) return;
    this.failed = true;
    this.container().clear();
    this.parent.fail(this.panel());
  }
}
