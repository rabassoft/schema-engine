// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import type { Diagnostic } from '@rabassoft/schema-engine';
import type {
  AngularPresentationContainerDefinition,
  AngularPresentationContainerRenderModel,
} from './presentation-container.js';
import type { AngularTextProjector } from './text.js';
import type { PresentationProjectionOwner } from './presentation-context.js';

/** @internal */
export function projectPresentationContainer(
  definition: AngularPresentationContainerDefinition,
  formId: string,
  locale: string,
  projector: AngularTextProjector,
  owner: PresentationProjectionOwner = { kind: 'root' },
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
        legendId: `${sectionIdBase(
          formId,
          definition.id,
          owner.kind === 'root' ? undefined : owner.ownerInstance,
        )}--legend`,
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
    const ownerInstance =
      owner.kind === 'root' ? undefined : owner.ownerInstance;
    const base = containerIdBase(
      formId,
      definition.kind,
      definition.id,
      ownerInstance,
    );
    if (definition.kind === 'tabs') {
      const panels = definition.panels.map((panel) => {
        const projected = projector.projectAdvancedPresentation(
          panel,
          formId,
          locale,
        );
        diagnostics.push(...projected.diagnostics);
        const panelBase = panelIdBase(
          formId,
          'tabs',
          definition.id,
          panel.id,
          ownerInstance,
        );
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
        ownerInstance,
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

  const ownerInstance = owner.kind === 'root' ? undefined : owner.ownerInstance;
  const base = containerIdBase(formId, 'grid', definition.id, ownerInstance);
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
            cellId: `${gridItemIdBase(
              formId,
              definition.id,
              index,
              ownerInstance,
            )}--cell`,
          }),
        ),
      ),
    }),
    diagnostics: Object.freeze(diagnostics),
  });
}

/** @internal */
export function sectionIdBase(
  formId: string,
  sectionId: string,
  ownerInstance?: readonly unknown[],
): string {
  return `se-${encodeURIComponent(
    JSON.stringify(
      ownerInstance === undefined
        ? [formId, 'section', sectionId]
        : [formId, 'presentation', ownerInstance, 'section', sectionId],
    ),
  )}`;
}

/** @internal */
export function containerIdBase(
  formId: string,
  kind: 'tabs' | 'accordion' | 'grid',
  id: string,
  ownerInstance?: readonly unknown[],
): string {
  return `se-${encodeURIComponent(
    JSON.stringify(
      ownerInstance === undefined
        ? [formId, 'presentation', kind, id]
        : [formId, 'presentation', ownerInstance, kind, id],
    ),
  )}`;
}

/** @internal */
export function panelIdBase(
  formId: string,
  ownerKind: 'tabs' | 'accordion',
  ownerId: string,
  panelId: string,
  ownerInstance?: readonly unknown[],
): string {
  return `se-${encodeURIComponent(
    JSON.stringify(
      ownerInstance === undefined
        ? [formId, 'presentation', ownerKind, ownerId, 'panel', panelId]
        : [
            formId,
            'presentation',
            ownerInstance,
            ownerKind,
            ownerId,
            'panel',
            panelId,
          ],
    ),
  )}`;
}

/** @internal */
export function gridItemIdBase(
  formId: string,
  gridId: string,
  index: number,
  ownerInstance?: readonly unknown[],
): string {
  return `se-${encodeURIComponent(
    JSON.stringify(
      ownerInstance === undefined
        ? [formId, 'presentation', 'grid', gridId, 'item', index]
        : [
            formId,
            'presentation',
            ownerInstance,
            'grid',
            gridId,
            'item',
            index,
          ],
    ),
  )}`;
}
