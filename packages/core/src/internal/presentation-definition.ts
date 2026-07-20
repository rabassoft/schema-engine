// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import type {
  FormNodeDefinition,
  FormNodeTemplate,
  PresentationEntryDefinition,
} from '../contracts.js';

export function createDefaultPresentation<
  TNode extends FormNodeDefinition | FormNodeTemplate,
>(nodes: readonly TNode[]): readonly PresentationEntryDefinition<TNode>[] {
  return nodes.map((node) => ({ kind: 'form-node' as const, node }));
}
