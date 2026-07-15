import type {
  FormNodeDefinition,
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
