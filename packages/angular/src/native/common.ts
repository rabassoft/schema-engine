// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import type {
  CollectionNodeAddress,
  DataPath,
  FieldDefinition,
  FieldTemplate,
  FieldRuntimeSnapshot,
} from '@rabassoft/schema-engine';
import type { AngularFieldTextSnapshot } from '../text.js';

export interface FieldIds {
  readonly control: string;
  readonly label: string;
  readonly clear: string;
  readonly description: string;
  readonly hint: string;
  readonly tooltip: string;
  readonly errors: string;
}

/** @internal */
export interface FieldInstanceContext {
  readonly snapshot: Signal<FieldRuntimeSnapshot>;
  readonly address: Signal<CollectionNodeAddress | undefined>;
}

/** @internal */
export const FIELD_INSTANCE_CONTEXT = new InjectionToken<FieldInstanceContext>(
  'FIELD_INSTANCE_CONTEXT',
);

export function nodeIdBase(formId: string, path: DataPath): string {
  return `se-${encodeURIComponent(JSON.stringify([formId, path]))}`;
}

export function itemNodeIdBase(
  formId: string,
  collectionPath: DataPath,
  itemId: string,
  relativePath: readonly string[],
): string {
  return `se-${encodeURIComponent(
    JSON.stringify([formId, 'item', collectionPath, itemId, relativePath]),
  )}`;
}

export function fieldIds(
  formId: string,
  field: FieldDefinition | FieldTemplate,
  address?: CollectionNodeAddress,
): FieldIds {
  const base =
    address === undefined
      ? nodeIdBase(formId, (field as FieldDefinition).path)
      : itemNodeIdBase(
          formId,
          address.collectionPath,
          address.itemId,
          address.relativePath,
        );
  return Object.freeze({
    control: base,
    label: `${base}-label`,
    clear: `${base}-clear`,
    description: `${base}-description`,
    hint: `${base}-hint`,
    tooltip: `${base}-tooltip`,
    errors: `${base}-errors`,
  });
}

export function fieldDisabled(snapshot: FieldRuntimeSnapshot): boolean {
  return (
    snapshot.presence.kind === 'blocked' &&
    snapshot.presence.reason === 'incompatible-ancestor'
  );
}

export function describedBy(
  ids: FieldIds,
  texts: AngularFieldTextSnapshot,
  snapshot: FieldRuntimeSnapshot,
): string | null {
  const values = [
    ...(texts.description === undefined ? [] : [ids.description]),
    ...(texts.hint === undefined ? [] : [ids.hint]),
    ...(snapshot.showIssues && texts.issueMessages.length > 0
      ? [ids.errors]
      : []),
  ];
  return values.length === 0 ? null : values.join(' ');
}
import { InjectionToken, type Signal } from '@angular/core';
