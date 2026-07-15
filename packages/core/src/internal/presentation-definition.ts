import type {
  FormNodeDefinition,
  PresentationEntryDefinition,
} from '../contracts.js';

export function createDefaultPresentation(
  nodes: readonly FormNodeDefinition[],
): readonly PresentationEntryDefinition[] {
  return nodes.map((node) => ({ kind: 'form-node' as const, node }));
}
