// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import type { Diagnostic } from '@rabassoft/schema-engine';
import type {
  AngularPresentationContainerDefinition,
  AngularPresentationContainerRenderModel,
} from './presentation-container.js';
import type { AngularTextProjector } from './text.js';

/** @internal */
export function projectPresentationContainer(
  definition: AngularPresentationContainerDefinition,
  formId: string,
  locale: string,
  projector: AngularTextProjector,
): {
  readonly model: AngularPresentationContainerRenderModel;
  readonly diagnostics: readonly Diagnostic[];
} {
  if (definition.kind === 'section') {
    const label = projector.projectSection(definition, formId, locale);
    return Object.freeze({
      model: Object.freeze({
        kind: 'section',
        definition,
        label: label.text,
        legendId: `${sectionIdBase(formId, definition.id)}--legend`,
      }),
      diagnostics: label.diagnostics,
    });
  }

  const label = projector.projectAdvancedPresentation(
    definition,
    formId,
    locale,
  );
  const diagnostics: Diagnostic[] = [...label.diagnostics];
  if (definition.kind === 'tabs' || definition.kind === 'accordion') {
    const base = containerIdBase(formId, definition.kind, definition.id);
    if (definition.kind === 'tabs') {
      const panels = definition.panels.map((panel) => {
        const projected = projector.projectAdvancedPresentation(
          panel,
          formId,
          locale,
        );
        diagnostics.push(...projected.diagnostics);
        const panelBase = panelIdBase(formId, 'tabs', definition.id, panel.id);
        return Object.freeze({
          definition: panel,
          label: projected.text,
          tabId: `${panelBase}--tab`,
          tabpanelId: `${panelBase}--tabpanel`,
        });
      });
      return Object.freeze({
        model: Object.freeze({
          kind: 'tabs',
          definition,
          label: label.text,
          tablistId: `${base}--tablist`,
          panels: Object.freeze(panels),
        }),
        diagnostics: Object.freeze(diagnostics),
      });
    }
    const panels = definition.panels.map((panel) => {
      const projected = projector.projectAdvancedPresentation(
        panel,
        formId,
        locale,
      );
      diagnostics.push(...projected.diagnostics);
      const panelBase = panelIdBase(
        formId,
        'accordion',
        definition.id,
        panel.id,
      );
      return Object.freeze({
        definition: panel,
        label: projected.text,
        triggerId: `${panelBase}--trigger`,
        regionId: `${panelBase}--region`,
      });
    });
    return Object.freeze({
      model: Object.freeze({
        kind: 'accordion',
        definition,
        label: label.text,
        accordionId: `${base}--accordion`,
        panels: Object.freeze(panels),
      }),
      diagnostics: Object.freeze(diagnostics),
    });
  }

  const base = containerIdBase(formId, 'grid', definition.id);
  return Object.freeze({
    model: Object.freeze({
      kind: 'grid',
      definition,
      label: label.text,
      gridId: `${base}--grid`,
      items: Object.freeze(
        definition.items.map((item, index) =>
          Object.freeze({
            definition: item,
            cellId: `${gridItemIdBase(formId, definition.id, index)}--cell`,
          }),
        ),
      ),
    }),
    diagnostics: Object.freeze(diagnostics),
  });
}

/** @internal */
export function sectionIdBase(formId: string, sectionId: string): string {
  return `se-${encodeURIComponent(JSON.stringify([formId, 'section', sectionId]))}`;
}

/** @internal */
export function containerIdBase(
  formId: string,
  kind: 'tabs' | 'accordion' | 'grid',
  id: string,
): string {
  return `se-${encodeURIComponent(
    JSON.stringify([formId, 'presentation', kind, id]),
  )}`;
}

/** @internal */
export function panelIdBase(
  formId: string,
  ownerKind: 'tabs' | 'accordion',
  ownerId: string,
  panelId: string,
): string {
  return `se-${encodeURIComponent(
    JSON.stringify([
      formId,
      'presentation',
      ownerKind,
      ownerId,
      'panel',
      panelId,
    ]),
  )}`;
}

/** @internal */
export function gridItemIdBase(
  formId: string,
  gridId: string,
  index: number,
): string {
  return `se-${encodeURIComponent(
    JSON.stringify([formId, 'presentation', 'grid', gridId, 'item', index]),
  )}`;
}
