// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import type {
  FormNodeDefinition,
  PresentationEntryDefinition,
} from '../contracts.js';

export function createDefaultPresentation(
  nodes: readonly FormNodeDefinition[],
): readonly PresentationEntryDefinition[] {
  return nodes.map((node) => ({ kind: 'form-node' as const, node }));
}
