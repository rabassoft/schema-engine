// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import type {
  CollectionItemAddress,
  CollectionNodeAddress,
} from '../contracts.js';
import {
  copyStringDataPath,
  isOrdinaryObject,
  readOwnDataMember,
} from './path.js';

export function copyCollectionItemAddress(
  value: unknown,
): CollectionItemAddress | undefined {
  const exterior = inspectAddressExterior(value);
  if (exterior === undefined) return undefined;
  return Object.freeze(exterior);
}

export function copyCollectionNodeAddress(
  value: unknown,
): CollectionNodeAddress | undefined {
  const exterior = inspectAddressExterior(value);
  if (exterior === undefined || !isOrdinaryObject(value)) return undefined;
  const relativePathMember = readOwnDataMember(value, 'relativePath');
  const relativePath =
    relativePathMember.kind === 'value'
      ? copyStringDataPath(relativePathMember.value, true)
      : undefined;
  if (relativePath === undefined) return undefined;
  return Object.freeze({ ...exterior, relativePath });
}

export function canonicalTemplateKey(
  collectionPath: readonly string[],
  relativePath: readonly string[],
): string {
  return JSON.stringify(['template', collectionPath, relativePath]);
}

export function canonicalItemKey(
  collectionPath: readonly string[],
  itemId: string,
): string {
  return JSON.stringify(['item', collectionPath, itemId]);
}

export function canonicalInstanceNodeKey(
  collectionPath: readonly string[],
  itemId: string,
  relativePath: readonly string[],
): string {
  return JSON.stringify(['item-node', collectionPath, itemId, relativePath]);
}

function inspectAddressExterior(
  value: unknown,
): CollectionItemAddress | undefined {
  if (!isOrdinaryObject(value)) return undefined;
  const collectionPathMember = readOwnDataMember(value, 'collectionPath');
  const itemIdMember = readOwnDataMember(value, 'itemId');
  const collectionPath =
    collectionPathMember.kind === 'value'
      ? copyStringDataPath(collectionPathMember.value)
      : undefined;
  if (
    collectionPath === undefined ||
    itemIdMember.kind !== 'value' ||
    typeof itemIdMember.value !== 'string' ||
    itemIdMember.value.trim().length === 0
  ) {
    return undefined;
  }
  return { collectionPath, itemId: itemIdMember.value };
}
