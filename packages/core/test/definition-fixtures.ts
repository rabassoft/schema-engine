import type {
  FormNodeDefinition,
  FormNodeTemplate,
  PresentationEntryDefinition,
  PresentedFormNodeDefinition,
} from '../src/index.js';

export function withDefaultPresentation<
  const TDefinition extends { readonly nodes: readonly unknown[] },
>(
  definition: TDefinition,
): TDefinition & {
  readonly presentation: readonly PresentedFormNodeDefinition[];
} {
  return {
    ...definition,
    presentation: definition.nodes.map((node) => ({
      kind: 'form-node',
      node: node as FormNodeDefinition,
    })),
  };
}

export function withDefaultNodePresentation<
  const TNode extends FormNodeDefinition | FormNodeTemplate,
  const TDefinition extends { readonly children: readonly TNode[] },
>(
  definition: TDefinition,
): TDefinition & {
  readonly presentation: readonly PresentationEntryDefinition<TNode>[];
} {
  return {
    ...definition,
    presentation: definition.children.map((node) => ({
      kind: 'form-node' as const,
      node,
    })),
  };
}
