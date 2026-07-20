// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import {
  InjectionToken,
  type ComponentRef,
  type ViewContainerRef,
} from '@angular/core';
import type {
  CollectionItemAddress,
  FormDefinition,
  FormNodeDefinition,
  FormNodeTemplate,
  FormRuntimeSnapshot,
  ItemRuntimeSnapshot,
  ObjectFieldDefinition,
  ObjectItemTemplateDefinition,
  ObjectNodeTemplate,
  ObjectRuntimeSnapshot,
  PresentationEntryDefinition,
  PresentationPanelDefinition,
} from '@rabassoft/schema-engine';

/** @internal */
export type AngularPresentationNode = FormNodeDefinition | FormNodeTemplate;

/** @internal */
export type PresentationOwnerDefinition =
  | FormDefinition
  | ObjectFieldDefinition
  | ObjectItemTemplateDefinition
  | ObjectNodeTemplate;

/** @internal */
export type PresentationOwnerSnapshot =
  FormRuntimeSnapshot<object> | ItemRuntimeSnapshot | ObjectRuntimeSnapshot;

/** @internal */
export type PresentationProjectionOwner =
  | { readonly kind: 'root' }
  | {
      readonly kind: 'object';
      readonly ownerPath: readonly string[];
      readonly staticOwner: readonly ['object', readonly string[]];
      readonly ownerInstance: readonly ['object', readonly string[]];
    }
  | {
      readonly kind: 'item';
      readonly ownerPath: readonly string[];
      readonly templatePath: readonly [];
      readonly itemId: string;
      readonly address: CollectionItemAddress;
      readonly staticOwner: readonly ['item-template', readonly string[]];
      readonly ownerInstance: readonly ['item', readonly string[], string];
    }
  | {
      readonly kind: 'template-object';
      readonly ownerPath: readonly string[];
      readonly templatePath: readonly string[];
      readonly itemId: string;
      readonly address: CollectionItemAddress;
      readonly staticOwner: readonly [
        'item-template-object',
        readonly string[],
        readonly string[],
      ];
      readonly ownerInstance: readonly [
        'item-object',
        readonly string[],
        string,
        readonly string[],
      ];
    };

/** @internal */
export function presentationOwnerDiagnosticParameters(
  owner: PresentationProjectionOwner,
): Readonly<Record<string, unknown>> {
  if (owner.kind === 'root') return Object.freeze({});
  return Object.freeze({
    presentationOwnerKind: owner.kind,
    presentationOwnerPath: Object.freeze([...owner.ownerPath]),
    ...(owner.kind === 'object'
      ? {}
      : {
          presentationTemplatePath: Object.freeze([...owner.templatePath]),
          itemId: owner.itemId,
        }),
  });
}

/** @internal */
export interface PresentationProjectionState {
  readonly owner: () => PresentationProjectionOwner;
  readonly definition: () => PresentationOwnerDefinition;
  readonly snapshot: () => PresentationOwnerSnapshot;
  render(
    entry: PresentationEntryDefinition<AngularPresentationNode>,
    container: ViewContainerRef,
  ): ComponentRef<unknown>;
}

/** @internal */
export interface PresentationEntryClaimContext extends PresentationProjectionState {
  claim(entry: PresentationEntryDefinition<AngularPresentationNode>): void;
  release(entry: PresentationEntryDefinition<AngularPresentationNode>): void;
  audit(): void;
}

/** @internal */
export interface PresentationPanelClaimContext extends PresentationProjectionState {
  claim(panel: PresentationPanelDefinition<AngularPresentationNode>): void;
  release(panel: PresentationPanelDefinition<AngularPresentationNode>): void;
  fail(panel: PresentationPanelDefinition<AngularPresentationNode>): void;
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
