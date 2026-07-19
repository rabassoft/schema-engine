// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import {
  InjectionToken,
  type ComponentRef,
  type ViewContainerRef,
} from '@angular/core';
import type {
  FormDefinition,
  FormRuntimeSnapshot,
  PresentationEntryDefinition,
  PresentationPanelDefinition,
} from '@rabassoft/schema-engine';

/** @internal */
export interface PresentationProjectionState {
  readonly definition: () => FormDefinition;
  readonly snapshot: () => FormRuntimeSnapshot<object>;
  render(
    entry: PresentationEntryDefinition,
    container: ViewContainerRef,
  ): ComponentRef<unknown>;
}

/** @internal */
export interface PresentationEntryClaimContext extends PresentationProjectionState {
  claim(entry: PresentationEntryDefinition): void;
  release(entry: PresentationEntryDefinition): void;
  audit(): void;
}

/** @internal */
export interface PresentationPanelClaimContext extends PresentationProjectionState {
  claim(panel: PresentationPanelDefinition): void;
  release(panel: PresentationPanelDefinition): void;
  fail(panel: PresentationPanelDefinition): void;
  audit(): void;
}

/** @internal */
export const PRESENTATION_ENTRY_CLAIM_CONTEXT =
  new InjectionToken<PresentationEntryClaimContext>(
    'PRESENTATION_ENTRY_CLAIM_CONTEXT',
  );

/** @internal */
export const PRESENTATION_PANEL_CLAIM_CONTEXT =
  new InjectionToken<PresentationPanelClaimContext>(
    'PRESENTATION_PANEL_CLAIM_CONTEXT',
  );

/** @internal */
export class ExactPresentationClaims<T extends object> {
  private readonly expected: ReadonlySet<T>;
  private readonly claimed = new Set<T>();
  private audited = false;

  constructor(expected: readonly T[]) {
    this.expected = new Set(expected);
  }

  claim(value: T): void {
    if (this.audited || !this.expected.has(value) || this.claimed.has(value))
      throw new Error('Invalid presentation claim.');
    this.claimed.add(value);
  }

  audit(): void {
    if (this.claimed.size !== this.expected.size)
      throw new Error('Incomplete presentation claims.');
    this.audited = true;
  }

  release(value: T): boolean {
    const removed = this.claimed.delete(value);
    return this.audited && removed;
  }
}
