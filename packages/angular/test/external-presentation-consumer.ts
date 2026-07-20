import { Component, input } from '@angular/core';
import type {
  FormNodeDefinition,
  FormNodeTemplate,
  PresentationEntryDefinition,
} from '@rabassoft/schema-engine';
import {
  type AngularPresentationContainerDefinition,
  type AngularPresentationContainerRegistration,
  type AngularPresentationContainerRenderer,
  type AngularPresentationContainerRenderModel,
} from '@rabassoft/schema-engine-angular';

@Component({
  standalone: true,
  template: '',
})
class ExternalPresentationContainer implements AngularPresentationContainerRenderer {
  readonly presentation =
    input.required<AngularPresentationContainerRenderModel>();

  protected readonly definition = () => this.presentation().definition;
}

export const externalPresentationRegistration = Object.freeze({
  id: 'external-tabs-consumer',
  renderer: ExternalPresentationContainer,
  priority: -1,
  tester(definition: AngularPresentationContainerDefinition) {
    const node = firstWrappedNode(definition);
    return definition.kind === 'tabs' && node?.kind === 'object' ? 1 : null;
  },
}) satisfies AngularPresentationContainerRegistration;

function firstWrappedNode(
  definition: AngularPresentationContainerDefinition,
): FormNodeDefinition | FormNodeTemplate | undefined {
  if (definition.kind === 'section') return wrappedNode(definition.children[0]);
  if (definition.kind === 'tabs' || definition.kind === 'accordion')
    return wrappedNode(definition.panels[0]?.children[0]);
  return wrappedNode(definition.items[0]?.child);
}

function wrappedNode(
  entry:
    | PresentationEntryDefinition<FormNodeDefinition | FormNodeTemplate>
    | undefined,
): FormNodeDefinition | FormNodeTemplate | undefined {
  return entry?.kind === 'form-node' ? entry.node : undefined;
}
