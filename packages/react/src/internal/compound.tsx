// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import {
  createElement,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import type {
  ArrayRuntimeSnapshot,
  ItemRuntimeSnapshot,
  ObjectRuntimeSnapshot,
  DiscriminatedObjectRuntimeSnapshot,
} from '@rabassoft/schema-engine';
import type {
  CollectionTexts,
  CompoundNodeTexts,
  ItemTexts,
} from './compound-text.js';
import { semanticId } from './native/common.js';

export function LeafVisibilityHost({
  visible,
  interactive,
  registerHost,
  children,
}: {
  readonly visible: boolean;
  readonly interactive: boolean;
  readonly registerHost?: (host: HTMLDivElement | null) => void;
  readonly children?: ReactElement;
}): ReactElement {
  const host = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (interactive) return;
    const active = document.activeElement;
    if (active instanceof HTMLElement && host.current?.contains(active))
      active.blur();
  }, [interactive]);
  return createElement(
    'div',
    {
      ref: (node: HTMLDivElement | null) => {
        host.current = node;
        registerHost?.(node);
      },
      hidden: !visible,
      inert: !interactive,
      'aria-hidden': visible ? undefined : true,
    },
    children ?? null,
  );
}

export function ObjectHost({
  formId,
  ownerKey,
  snapshot,
  texts,
  children,
}: {
  readonly formId: string;
  readonly ownerKey: string;
  readonly snapshot: ObjectRuntimeSnapshot | DiscriminatedObjectRuntimeSnapshot;
  readonly texts: CompoundNodeTexts;
  readonly children: readonly ReactElement[];
}): ReactElement {
  const ids = supplementaryIds(formId, ownerKey);
  const disabled =
    snapshot.presence.kind === 'incompatible' ||
    (snapshot.presence.kind === 'blocked' &&
      snapshot.presence.reason === 'incompatible-ancestor');
  return createElement(
    'fieldset',
    {
      disabled,
      'aria-describedby': describedBy(ids, texts, snapshot.showIssues),
      'aria-invalid': snapshot.valid ? undefined : true,
    },
    createElement('legend', { id: ids.label }, texts.label),
    supplementary(ids, texts, snapshot.showIssues),
    ...children,
  );
}

export interface ProjectedItem {
  readonly snapshot: ItemRuntimeSnapshot;
  readonly texts: ItemTexts;
  readonly content: readonly ReactElement[];
  readonly remove: () => void;
  readonly moveEarlier: () => void;
  readonly moveLater: () => void;
  readonly canMoveEarlier: boolean;
  readonly canMoveLater: boolean;
}

export function CollectionHost({
  formId,
  ownerKey,
  snapshot,
  texts,
  items,
  focusBeforeUpdate,
}: {
  readonly formId: string;
  readonly ownerKey: string;
  readonly snapshot: ArrayRuntimeSnapshot;
  readonly texts: CollectionTexts;
  readonly items: readonly ProjectedItem[];
  readonly focusBeforeUpdate?: {
    readonly itemKey: string;
    readonly id: string;
  };
}): ReactElement {
  const legend = useRef<HTMLLegendElement>(null);
  const host = useRef<HTMLFieldSetElement>(null);
  const priorItems = useRef(items);
  const ids = supplementaryIds(formId, ownerKey);
  useLayoutEffect(() => {
    const previous = priorItems.current;
    priorItems.current = items;
    const focused = focusBeforeUpdate;
    if (focused === undefined) return;
    const previousIndex = previous.findIndex(
      (item) => item.snapshot.key === focused.itemKey,
    );
    if (previousIndex < 0) return;
    if (items.some((item) => item.snapshot.key === focused.itemKey)) {
      document.getElementById(focused.id)?.focus();
      return;
    }
    const target = items[previousIndex] ?? items[previousIndex - 1];
    const targetOwner =
      target === undefined
        ? undefined
        : [
            ...(host.current?.querySelectorAll<HTMLElement>(
              '[data-schema-item-key]',
            ) ?? []),
          ].find(
            (candidate) =>
              candidate.dataset['schemaItemKey'] === target.snapshot.key,
          );
    const targetElement =
      target === undefined
        ? legend.current
        : targetOwner?.querySelector<HTMLElement>('[tabindex="-1"]');
    targetElement?.focus();
  }, [focusBeforeUpdate, items]);
  return createElement(
    'fieldset',
    {
      ref: host,
      'data-schema-collection-key': ownerKey,
      'aria-describedby': describedBy(
        ids,
        texts,
        snapshot.showIssues,
        texts.identityError,
      ),
      'aria-invalid': snapshot.valid ? undefined : true,
    },
    createElement(
      'legend',
      { ref: legend, id: ids.label, tabIndex: -1 },
      texts.label,
    ),
    supplementary(ids, texts, snapshot.showIssues, texts.identityError),
    ...items.map((item) =>
      createElement(ItemHost, {
        key: item.snapshot.key,
        formId,
        item,
      }),
    ),
  );
}

function ItemHost({
  formId,
  item,
}: {
  readonly formId: string;
  readonly item: ProjectedItem;
}): ReactElement {
  const ownerKey = item.snapshot.key;
  const labelId = semanticId(formId, ownerKey, 'label');
  const issuesId = semanticId(formId, ownerKey, 'issues');
  return createElement(
    'fieldset',
    {
      'data-schema-item-key': item.snapshot.key,
      'aria-invalid': item.snapshot.valid ? undefined : true,
      'aria-describedby':
        item.snapshot.showIssues && item.texts.issueMessages.length > 0
          ? issuesId
          : undefined,
    },
    createElement('legend', { id: labelId, tabIndex: -1 }, item.texts.label),
    createElement(
      'div',
      null,
      createElement(
        'button',
        { type: 'button', onClick: item.remove },
        item.texts.remove,
      ),
      createElement(
        'button',
        {
          type: 'button',
          disabled: !item.canMoveEarlier,
          onClick: item.moveEarlier,
        },
        item.texts.moveEarlier,
      ),
      createElement(
        'button',
        {
          type: 'button',
          disabled: !item.canMoveLater,
          onClick: item.moveLater,
        },
        item.texts.moveLater,
      ),
    ),
    item.snapshot.showIssues && item.texts.issueMessages.length > 0
      ? issueList(issuesId, item.texts.issueMessages)
      : null,
    ...item.content,
  );
}

export function SectionHost({
  formId,
  ownerKey,
  label,
  children,
}: PresentationHostProps): ReactElement {
  return createElement(
    'fieldset',
    null,
    createElement(
      'legend',
      { id: semanticId(formId, ownerKey, 'label') },
      label,
    ),
    ...children,
  );
}

interface PresentationHostProps {
  readonly formId: string;
  readonly ownerKey: string;
  readonly label: string;
  readonly children: readonly ReactElement[];
}

export interface PresentationPanel {
  readonly key: string;
  readonly label: string;
  readonly children: readonly ReactElement[];
}

export function TabsHost({
  formId,
  ownerKey,
  label,
  panels,
}: {
  readonly formId: string;
  readonly ownerKey: string;
  readonly label: string;
  readonly panels: readonly PresentationPanel[];
}): ReactElement {
  const [active, setActive] = useState(0);
  const select = (index: number) => {
    setActive(index);
    queueMicrotask(() =>
      document
        .getElementById(semanticId(formId, panels[index]?.key ?? '', 'tab'))
        ?.focus(),
    );
  };
  const keydown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number | undefined;
    if (event.key === 'ArrowLeft')
      next = (index - 1 + panels.length) % panels.length;
    else if (event.key === 'ArrowRight') next = (index + 1) % panels.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = panels.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    select(next);
  };
  return createElement(
    'div',
    null,
    createElement(
      'div',
      {
        role: 'tablist',
        id: semanticId(formId, ownerKey, 'tab'),
        'aria-label': label,
      },
      ...panels.map((panel, index) =>
        createElement(
          'button',
          {
            key: panel.key,
            type: 'button',
            role: 'tab',
            id: semanticId(formId, panel.key, 'tab'),
            'aria-selected': active === index,
            'aria-controls': semanticId(formId, panel.key, 'panel'),
            tabIndex: active === index ? 0 : -1,
            onClick: () => select(index),
            onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) =>
              keydown(event, index),
          },
          panel.label,
        ),
      ),
    ),
    ...panels.map((panel, index) =>
      createElement(
        'div',
        {
          key: panel.key,
          role: 'tabpanel',
          id: semanticId(formId, panel.key, 'panel'),
          'aria-labelledby': semanticId(formId, panel.key, 'tab'),
          hidden: active !== index,
          inert: active !== index,
        },
        ...panel.children,
      ),
    ),
  );
}

export function AccordionHost({
  formId,
  ownerKey,
  label,
  panels,
}: {
  readonly formId: string;
  readonly ownerKey: string;
  readonly label: string;
  readonly panels: readonly PresentationPanel[];
}): ReactElement {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const toggle = (panel: PresentationPanel) => {
    const open = expanded.has(panel.key);
    const triggerId = semanticId(formId, panel.key, 'accordion');
    const regionId = semanticId(formId, panel.key, 'panel');
    if (open) {
      const region = document.getElementById(regionId);
      if (region?.contains(document.activeElement))
        document.getElementById(triggerId)?.focus();
    }
    const next = new Set(expanded);
    if (open) next.delete(panel.key);
    else next.add(panel.key);
    setExpanded(next);
  };
  return createElement(
    'div',
    {
      role: 'group',
      id: semanticId(formId, ownerKey, 'accordion'),
      'aria-label': label,
    },
    ...panels.flatMap((panel) => {
      const open = expanded.has(panel.key);
      const triggerId = semanticId(formId, panel.key, 'accordion');
      const regionId = semanticId(formId, panel.key, 'panel');
      return [
        createElement(
          'button',
          {
            key: `${panel.key}:trigger`,
            type: 'button',
            id: triggerId,
            'aria-expanded': open,
            'aria-controls': regionId,
            onClick: () => toggle(panel),
          },
          panel.label,
        ),
        createElement(
          'div',
          {
            key: `${panel.key}:panel`,
            role: 'region',
            id: regionId,
            'aria-labelledby': triggerId,
            hidden: !open,
            inert: !open,
          },
          ...panel.children,
        ),
      ];
    }),
  );
}

export interface GridItem {
  readonly key: string;
  readonly span: 1 | 2 | 3 | 4;
  readonly child: ReactElement;
}

export function GridHost({
  formId,
  ownerKey,
  label,
  items,
}: {
  readonly formId: string;
  readonly ownerKey: string;
  readonly label: string;
  readonly items: readonly GridItem[];
}): ReactElement {
  return createElement(
    'div',
    {
      role: 'group',
      id: semanticId(formId, ownerKey, 'panel'),
      'aria-label': label,
    },
    ...items.map((item) => createElement('div', { key: item.key }, item.child)),
  );
}

function supplementaryIds(formId: string, ownerKey: string) {
  return Object.freeze({
    label: semanticId(formId, ownerKey, 'label'),
    description: semanticId(formId, ownerKey, 'description'),
    hint: semanticId(formId, ownerKey, 'hint'),
    issues: semanticId(formId, ownerKey, 'issues'),
  });
}

function describedBy(
  ids: ReturnType<typeof supplementaryIds>,
  texts: CompoundNodeTexts,
  showIssues: boolean,
  identityError?: string,
): string | undefined {
  const values = [
    ...(texts.description === undefined ? [] : [ids.description]),
    ...(texts.hint === undefined ? [] : [ids.hint]),
    ...(identityError !== undefined ||
    (showIssues && texts.issueMessages.length > 0)
      ? [ids.issues]
      : []),
  ];
  return values.length === 0 ? undefined : values.join(' ');
}

function supplementary(
  ids: ReturnType<typeof supplementaryIds>,
  texts: CompoundNodeTexts,
  showIssues: boolean,
  identityError?: string,
): ReactNode {
  return createElement(
    'div',
    null,
    texts.description === undefined
      ? null
      : createElement('p', { id: ids.description }, texts.description),
    texts.hint === undefined
      ? null
      : createElement('p', { id: ids.hint }, texts.hint),
    texts.tooltip === undefined
      ? null
      : createElement(
          'details',
          null,
          createElement('summary', { 'aria-label': texts.tooltip }, 'ⓘ'),
          createElement('p', null, texts.tooltip),
        ),
    identityError === undefined
      ? showIssues && texts.issueMessages.length > 0
        ? issueList(ids.issues, texts.issueMessages)
        : null
      : createElement(
          'div',
          { id: ids.issues },
          createElement('p', { role: 'alert' }, identityError),
          showIssues && texts.issueMessages.length > 0
            ? issueList(undefined, texts.issueMessages)
            : null,
        ),
  );
}

function issueList(
  id: string | undefined,
  messages: readonly string[],
): ReactElement {
  return createElement(
    'ul',
    { ...(id === undefined ? {} : { id }), 'aria-live': 'polite' },
    ...messages.map((message, index) =>
      createElement('li', { key: `${index}:${message}` }, message),
    ),
  );
}
