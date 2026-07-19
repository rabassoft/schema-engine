// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import type {
  ArrayNodeDefinition,
  ArrayRuntimeSnapshot,
  CollectionNodeAddress,
  FieldDefinition,
  FieldRuntimeSnapshot,
  FieldTemplate,
  FormDefinition,
  FormNodeDefinition,
  FormNodeTemplate,
  FormRuntime,
  FormRuntimeSnapshot,
  ItemRuntimeSnapshot,
  NodeRuntimeSnapshot,
  PresentationEntryDefinition,
  PresentationAccordionDefinition,
  PresentationGridDefinition,
  PresentationPanelDefinition,
  PresentationSectionDefinition,
  PresentationTabsDefinition,
  AdvancedPresentationLabelDefinition,
} from '@rabassoft/schema-engine';

interface FieldBinding {
  readonly element: HTMLElement;
  reconcile(snapshot: FieldRuntimeSnapshot, locale: string): void;
  dispose(): void;
}

function collectCollections(
  nodes: readonly NodeRuntimeSnapshot[],
  target: Map<string, ArrayRuntimeSnapshot>,
): void {
  for (const node of nodes) {
    if (node.nodeKind === 'array') {
      target.set(node.key, node);
    } else if (node.nodeKind === 'object') {
      collectCollections(node.children, target);
    }
  }
}

function setMountedHidden(element: HTMLElement, hidden: boolean): void {
  element.hidden = hidden;
  if (hidden) element.setAttribute('inert', '');
  else element.removeAttribute('inert');
}

function sectionIdBase(formId: string, sectionId: string): string {
  return `se-${encodeURIComponent(JSON.stringify([formId, 'section', sectionId]))}`;
}

function containerIdBase(
  formId: string,
  kind: 'tabs' | 'accordion' | 'grid',
  id: string,
): string {
  return `se-${encodeURIComponent(
    JSON.stringify([formId, 'presentation', kind, id]),
  )}`;
}

function panelIdBase(
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

function gridItemIdBase(formId: string, gridId: string, index: number): string {
  return `se-${encodeURIComponent(
    JSON.stringify([formId, 'presentation', 'grid', gridId, 'item', index]),
  )}`;
}

interface FieldIntentions {
  focus(): void;
  blur(): void;
  set(value: unknown): void;
  remove(): void;
  locale(): string;
}

interface CollectionBinding {
  readonly element: HTMLElement;
  reconcile(snapshot: ArrayRuntimeSnapshot, locale: string): void;
  dispose(): void;
}

export interface StandardDomRendererOptions {
  readonly embeddedCollectionControls?: boolean;
  readonly formId?: string;
  readonly resolvePresentationLabel?: (
    label: string,
    context: Readonly<{
      formId: string;
      locale: string;
      presentation:
        PresentationSectionDefinition | AdvancedPresentationLabelDefinition;
    }>,
  ) => unknown;
}

interface PresentationLabelBinding {
  reconcile(locale: string): void;
}

export class StandardDomRenderer {
  private readonly form = document.createElement('form');
  private readonly bindings = new Map<string, FieldBinding>();
  private readonly collections = new Map<string, CollectionBinding>();
  private readonly cleanups: Array<() => void> = [];
  private readonly presentationLabels: PresentationLabelBinding[] = [];
  private disposed = false;

  constructor(
    private readonly host: HTMLElement,
    definition: FormDefinition,
    private readonly runtime: FormRuntime<object>,
    private readonly options: StandardDomRendererOptions = {},
  ) {
    this.form.noValidate = true;
    this.form.className = 'standard-form';
    this.form.setAttribute('aria-label', 'Schema Engine form preview');
    this.listen(this.form, 'submit', (event) => event.preventDefault());
    for (const entry of definition.presentation) {
      this.form.append(this.renderPresentation(entry));
    }
    this.host.replaceChildren(this.form);
  }

  reconcile(snapshot: FormRuntimeSnapshot<object>): void {
    if (this.disposed) return;
    const fields = new Map(snapshot.fields.map((field) => [field.key, field]));
    for (const [key, binding] of this.bindings) {
      const field = fields.get(key);
      if (field !== undefined) binding.reconcile(field, snapshot.locale);
    }
    const collections = new Map<string, ArrayRuntimeSnapshot>();
    collectCollections(snapshot.nodes, collections);
    for (const [key, binding] of this.collections) {
      const collection = collections.get(key);
      if (collection !== undefined)
        binding.reconcile(collection, snapshot.locale);
    }
    for (const binding of this.presentationLabels)
      binding.reconcile(snapshot.locale);
  }

  getBindingElement(key: string): HTMLElement | undefined {
    return this.bindings.get(key)?.element;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const binding of this.bindings.values()) binding.dispose();
    this.bindings.clear();
    for (const binding of this.collections.values()) binding.dispose();
    this.collections.clear();
    this.presentationLabels.length = 0;
    for (const cleanup of this.cleanups.splice(0)) cleanup();
    this.host.replaceChildren();
  }

  private renderPresentation(entry: PresentationEntryDefinition): HTMLElement {
    if (entry.kind === 'form-node') return this.renderNode(entry.node);
    if (entry.kind === 'section') return this.renderSection(entry);
    if (entry.kind === 'tabs') return this.renderTabs(entry);
    if (entry.kind === 'accordion') return this.renderAccordion(entry);
    return this.renderGrid(entry);
  }

  private renderSection(entry: PresentationSectionDefinition): HTMLElement {
    const section = document.createElement('fieldset');
    section.className = 'form-section';
    const legend = document.createElement('legend');
    legend.id = `${sectionIdBase(this.formId, entry.id)}--legend`;
    this.bindPresentationLabel(entry, legend);
    section.append(legend);
    for (const child of entry.children)
      section.append(this.renderPresentation(child));
    return section;
  }

  private renderTabs(entry: PresentationTabsDefinition): HTMLElement {
    const wrapper = document.createElement('section');
    wrapper.className = 'presentation-tabs';
    const tablist = document.createElement('div');
    tablist.id = `${containerIdBase(this.formId, 'tabs', entry.id)}--tablist`;
    tablist.setAttribute('role', 'tablist');
    this.bindPresentationLabel(entry, tablist, 'aria-label');
    const tabs: HTMLButtonElement[] = [];
    const panels: HTMLElement[] = [];
    let activeIndex = 0;
    const update = (): void => {
      tabs.forEach((tab, index) => {
        tab.setAttribute('aria-selected', String(index === activeIndex));
        tab.tabIndex = index === activeIndex ? 0 : -1;
      });
      panels.forEach((panel, index) =>
        setMountedHidden(panel, index !== activeIndex),
      );
    };
    entry.panels.forEach((panel, index) => {
      const base = panelIdBase(this.formId, 'tabs', entry.id, panel.id);
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.id = `${base}--tab`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', `${base}--tabpanel`);
      this.bindPresentationLabel(panel, tab);
      const region = this.renderPanel(panel);
      region.id = `${base}--tabpanel`;
      region.setAttribute('role', 'tabpanel');
      region.setAttribute('aria-labelledby', tab.id);
      const activate = (): void => {
        activeIndex = index;
        update();
        tab.focus();
      };
      this.listen(tab, 'click', activate);
      this.listen(tab, 'keydown', (event) => {
        const keyboard = event as KeyboardEvent;
        let next: number | undefined;
        if (keyboard.key === 'ArrowLeft')
          next = (index - 1 + entry.panels.length) % entry.panels.length;
        else if (keyboard.key === 'ArrowRight')
          next = (index + 1) % entry.panels.length;
        else if (keyboard.key === 'Home') next = 0;
        else if (keyboard.key === 'End') next = entry.panels.length - 1;
        if (next === undefined) return;
        keyboard.preventDefault();
        tabs[next]?.click();
      });
      tabs.push(tab);
      panels.push(region);
      tablist.append(tab);
    });
    update();
    wrapper.append(tablist, ...panels);
    return wrapper;
  }

  private renderAccordion(entry: PresentationAccordionDefinition): HTMLElement {
    const group = document.createElement('section');
    group.className = 'presentation-accordion';
    group.id = `${containerIdBase(this.formId, 'accordion', entry.id)}--accordion`;
    group.setAttribute('role', 'group');
    this.bindPresentationLabel(entry, group, 'aria-label');
    entry.panels.forEach((panel) => {
      const base = panelIdBase(this.formId, 'accordion', entry.id, panel.id);
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.id = `${base}--trigger`;
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-controls', `${base}--region`);
      this.bindPresentationLabel(panel, trigger);
      const region = this.renderPanel(panel);
      region.id = `${base}--region`;
      region.setAttribute('role', 'region');
      region.setAttribute('aria-labelledby', trigger.id);
      setMountedHidden(region, true);
      this.listen(trigger, 'click', () => {
        const expanded = trigger.getAttribute('aria-expanded') !== 'true';
        trigger.setAttribute('aria-expanded', String(expanded));
        setMountedHidden(region, !expanded);
      });
      group.append(trigger, region);
    });
    return group;
  }

  private renderGrid(entry: PresentationGridDefinition): HTMLElement {
    const grid = document.createElement('section');
    grid.className = 'presentation-grid';
    grid.id = `${containerIdBase(this.formId, 'grid', entry.id)}--grid`;
    grid.setAttribute('role', 'group');
    grid.style.setProperty('--standard-grid-columns', String(entry.columns));
    this.bindPresentationLabel(entry, grid, 'aria-label');
    entry.items.forEach((item, index) => {
      const cell = document.createElement('div');
      cell.className = 'presentation-grid-cell';
      cell.id = `${gridItemIdBase(this.formId, entry.id, index)}--cell`;
      cell.style.setProperty('--standard-grid-span', String(item.span));
      cell.append(this.renderPresentation(item.child));
      grid.append(cell);
    });
    return grid;
  }

  private renderPanel(panel: PresentationPanelDefinition): HTMLElement {
    const region = document.createElement('div');
    region.className = 'presentation-panel';
    for (const child of panel.children)
      region.append(this.renderPresentation(child));
    return region;
  }

  private bindPresentationLabel(
    presentation:
      PresentationSectionDefinition | AdvancedPresentationLabelDefinition,
    element: HTMLElement,
    attribute?: 'aria-label',
  ): void {
    const source = presentation.label;
    let lastLocale: string | undefined;
    const apply = (locale: string): void => {
      if (locale === lastLocale) return;
      lastLocale = locale;
      let result: unknown;
      try {
        result =
          this.options.resolvePresentationLabel?.(
            source,
            Object.freeze({ formId: this.formId, locale, presentation }),
          ) ?? source;
      } catch {
        result = source;
      }
      const text =
        typeof result === 'string' && result.trim().length > 0
          ? result
          : source;
      if (attribute === undefined) element.textContent = text;
      else element.setAttribute(attribute, text);
    };
    const binding = { reconcile: apply };
    this.presentationLabels.push(binding);
    apply(this.runtime.getSnapshot().locale);
  }

  private get formId(): string {
    return this.options.formId ?? 'reference-standard';
  }

  private renderNode(node: FormNodeDefinition): HTMLElement {
    if (node.kind === 'object') {
      const fieldset = document.createElement('fieldset');
      fieldset.className = 'object-group';
      const legend = document.createElement('legend');
      legend.textContent = node.label;
      fieldset.append(legend);
      appendSupportingText(fieldset, node.description, node.hint);
      for (const child of node.children)
        fieldset.append(this.renderNode(child));
      return fieldset;
    }
    if (node.kind === 'array') {
      const binding = createCollectionBinding(
        node,
        this.runtime,
        this.options.embeddedCollectionControls !== false,
      );
      this.collections.set(node.key, binding);
      return binding.element;
    }
    const binding = createFieldBinding(node, {
      focus: () => this.runtime.focus(node.path),
      blur: () => this.runtime.blur(node.path),
      set: (value) => this.runtime.requestSetValue(node.path, value),
      remove: () => this.runtime.requestRemoveValue(node.path),
      locale: () => this.runtime.getSnapshot().locale,
    });
    this.bindings.set(node.key, binding);
    return binding.element;
  }

  private listen(
    target: EventTarget,
    type: string,
    listener: EventListener,
  ): void {
    target.addEventListener(type, listener);
    this.cleanups.push(() => target.removeEventListener(type, listener));
  }
}

function createFieldBinding(
  definition: FieldDefinition | FieldTemplate,
  intentions: FieldIntentions,
  idScope = '',
): FieldBinding {
  const container = document.createElement('div');
  container.className = 'form-field';
  container.dataset['fieldKey'] = definition.key;
  container.dataset['fieldName'] = definition.name;
  const controlId = domId(`field-${idScope}-${definition.key}`);
  const descriptionId = `${controlId}-description`;
  const hintId = `${controlId}-hint`;
  const issuesId = `${controlId}-issues`;
  const describedBy: string[] = [];
  const cleanups: Array<() => void> = [];
  let focused = false;
  let currentSnapshot: FieldRuntimeSnapshot | undefined;

  const label = document.createElement('label');
  label.htmlFor = controlId;
  label.textContent = definition.label;
  container.append(label);

  if (definition.description !== undefined) {
    const description = supportingText(descriptionId, definition.description);
    describedBy.push(descriptionId);
    container.append(description);
  }
  if (definition.hint !== undefined) {
    const hint = supportingText(hintId, definition.hint);
    describedBy.push(hintId);
    container.append(hint);
  }

  const control = createControl(definition);
  control.id = controlId;
  control.required = definition.required;
  if (definition.tooltip !== undefined) control.title = definition.tooltip;
  container.append(control);

  const actions = document.createElement('div');
  actions.className = 'field-actions';
  const clear = button('Clear');
  actions.append(clear);
  const setNull = definition.nullable ? button('Set null') : undefined;
  if (setNull !== undefined) actions.append(setNull);
  container.append(actions);

  const presence = document.createElement('output');
  presence.className = 'presence-state';
  presence.setAttribute('aria-live', 'polite');
  container.append(presence);

  const issues = document.createElement('ul');
  issues.id = issuesId;
  issues.className = 'field-issues';
  issues.hidden = true;
  describedBy.push(issuesId);
  container.append(issues);
  control.setAttribute('aria-describedby', describedBy.join(' '));

  listen(control, 'focus', () => {
    focused = true;
    intentions.focus();
  });
  listen(control, 'blur', () => {
    focused = false;
    intentions.blur();
  });
  listen(clear, 'click', () => {
    if (currentSnapshot?.presence.kind === 'value') {
      intentions.remove();
    }
  });
  if (setNull !== undefined) {
    listen(setNull, 'click', () => intentions.set(null));
  }

  if (definition.kind === 'string') {
    const eventType = control instanceof HTMLSelectElement ? 'change' : 'input';
    listen(control, eventType, () => {
      if (control instanceof HTMLSelectElement && control.value === MISSING) {
        if (currentSnapshot?.presence.kind === 'value') {
          intentions.remove();
        }
        return;
      }
      intentions.set(control.value);
    });
  } else if (definition.kind === 'number') {
    control.addEventListener('input', handleNumberInput);
    cleanups.push(() =>
      control.removeEventListener('input', handleNumberInput),
    );
  } else {
    listen(control, 'change', () => {
      if (control instanceof HTMLInputElement) {
        intentions.set(control.checked);
      }
    });
  }

  function handleNumberInput(): void {
    if (!(control instanceof HTMLInputElement)) return;
    const parsed = parseNumber(control.value, intentions.locale());
    if (
      parsed !== undefined &&
      (definition.kind !== 'number' ||
        definition.numericType !== 'integer' ||
        Number.isInteger(parsed))
    ) {
      intentions.set(parsed);
    }
  }

  function reconcile(snapshot: FieldRuntimeSnapshot, locale: string): void {
    currentSnapshot = snapshot;
    const value =
      snapshot.presence.kind === 'value' ? snapshot.presence.value : undefined;
    const isPresent = snapshot.presence.kind === 'value';
    const isNull = isPresent && value === null;
    presence.value = presenceLabel(snapshot);
    clear.hidden = !isPresent;
    if (setNull !== undefined) setNull.disabled = isNull;
    control.setAttribute('aria-invalid', String(!snapshot.valid));

    if (definition.kind === 'boolean') {
      if (control instanceof HTMLInputElement) {
        control.checked = value === true;
        control.indeterminate = isNull;
      }
    } else if (definition.kind === 'number') {
      if (control instanceof HTMLInputElement && !focused) {
        control.value =
          typeof value === 'number'
            ? formatNumber(value, locale, definition)
            : '';
      }
    } else if (control instanceof HTMLSelectElement) {
      control.value = typeof value === 'string' ? value : MISSING;
    } else if (control instanceof HTMLInputElement) {
      control.value = typeof value === 'string' ? value : '';
    }

    issues.replaceChildren(
      ...snapshot.issues.map((issue) => {
        const item = document.createElement('li');
        item.textContent = issue.code;
        return item;
      }),
    );
    issues.hidden = !snapshot.showIssues || snapshot.issues.length === 0;
  }

  function listen(
    target: EventTarget,
    type: string,
    handler: EventListener,
  ): void {
    target.addEventListener(type, handler);
    cleanups.push(() => target.removeEventListener(type, handler));
  }

  return {
    element: container,
    reconcile,
    dispose() {
      for (const cleanup of cleanups.splice(0)) cleanup();
    },
  };
}

function createCollectionBinding(
  definition: ArrayNodeDefinition,
  runtime: FormRuntime<object>,
  embeddedControls: boolean,
): CollectionBinding {
  const collectionPath = stringPath(definition.path);
  const section = document.createElement('section');
  section.className = 'collection-group';
  section.dataset['collectionName'] = definition.name;
  const heading = document.createElement('h2');
  heading.textContent = definition.label;
  section.append(heading);
  appendSupportingText(section, definition.description, definition.hint);

  const insert = document.createElement('div');
  insert.className = 'collection-insert';
  insert.hidden = !embeddedControls;
  const inputScope = domId(definition.key);
  const idInput = labelledInput(`${inputScope}-new-id`, 'New item id');
  const drafts = definition.item.fields.map((field) => ({
    field,
    control: labelledInput(
      `${inputScope}-new-${domId(field.relativePath.join('-'))}`,
      `New ${field.label.toLocaleLowerCase()}`,
    ),
  }));
  const add = button('Add item');
  insert.append(idInput.label, idInput.input);
  for (const { control } of drafts) insert.append(control.label, control.input);
  insert.append(add);
  section.append(insert);
  const identity = document.createElement('p');
  identity.className = 'field-issues';
  identity.hidden = true;
  section.append(identity);
  const itemsHost = document.createElement('div');
  itemsHost.className = 'collection-items';
  section.append(itemsHost);

  const items = new Map<string, ReturnType<typeof createItemBinding>>();
  let current: ArrayRuntimeSnapshot | undefined;
  const addHandler = (): void => {
    const itemId = idInput.input.value.trim();
    if (itemId.length === 0) return;
    const item: Record<string, unknown> = {
      [definition.identity.property]: itemId,
    };
    for (const { field, control } of drafts) {
      const text = control.input.value.trim();
      if (text.length === 0 && !field.required) continue;
      setNestedValue(
        item,
        field.relativePath,
        draftFieldValue(field, text, itemId, runtime.getSnapshot().locale),
      );
    }
    runtime.requestInsertItem(collectionPath, itemId, item, { kind: 'end' });
    items.get(itemId)?.focusFirst();
  };
  add.addEventListener('click', addHandler);

  return {
    element: section,
    reconcile(snapshot, locale) {
      current = snapshot;
      identity.hidden = snapshot.identityState.kind === 'valid';
      identity.textContent =
        snapshot.identityState.kind === 'valid'
          ? ''
          : `Collection identity: ${snapshot.identityState.reason}`;
      const present = new Set(
        snapshot.items.map(({ address }) => address.itemId),
      );
      for (const [itemId, binding] of items) {
        if (!present.has(itemId)) {
          binding.dispose();
          items.delete(itemId);
        }
      }
      for (const itemSnapshot of snapshot.items) {
        let binding = items.get(itemSnapshot.address.itemId);
        if (binding === undefined) {
          binding = createItemBinding(
            definition,
            collectionPath,
            itemSnapshot.address.itemId,
            runtime,
            () => current,
            () => add.focus(),
            embeddedControls,
          );
          items.set(itemSnapshot.address.itemId, binding);
        }
        binding.reconcile(itemSnapshot, locale);
        itemsHost.append(binding.element);
      }
    },
    dispose() {
      add.removeEventListener('click', addHandler);
      for (const binding of items.values()) binding.dispose();
      items.clear();
    },
  };
}

function createItemBinding(
  collection: ArrayNodeDefinition,
  collectionPath: readonly string[],
  itemId: string,
  runtime: FormRuntime<object>,
  getCollection: () => ArrayRuntimeSnapshot | undefined,
  focusAfterRemove: () => void,
  embeddedControls: boolean,
) {
  const fieldset = document.createElement('fieldset');
  fieldset.className = 'collection-item';
  fieldset.dataset['itemId'] = itemId;
  const legend = document.createElement('legend');
  legend.textContent = `Item ${itemId}`;
  fieldset.append(legend);
  const fieldBindings: Array<{
    readonly relativePath: readonly string[];
    readonly binding: FieldBinding;
  }> = [];
  for (const child of collection.item.children) {
    fieldset.append(renderItemTemplate(child));
  }
  const actions = document.createElement('div');
  actions.className = 'field-actions';
  actions.hidden = !embeddedControls;
  const earlier = button('Move earlier');
  const later = button('Move later');
  const remove = button('Remove item');
  actions.append(earlier, later, remove);
  fieldset.append(actions);

  const address = { collectionPath, itemId } as const;
  const moveEarlier = (): void => {
    const snapshot = getCollection();
    const index =
      snapshot?.items.findIndex((item) => item.address.itemId === itemId) ?? -1;
    const previous = snapshot?.items[index - 1];
    if (previous !== undefined) {
      runtime.requestMoveItem(address, {
        kind: 'before',
        itemId: previous.address.itemId,
      });
    }
  };
  const moveLater = (): void => {
    const snapshot = getCollection();
    const index =
      snapshot?.items.findIndex((item) => item.address.itemId === itemId) ?? -1;
    const next = snapshot?.items[index + 1];
    if (next !== undefined) {
      runtime.requestMoveItem(address, {
        kind: 'after',
        itemId: next.address.itemId,
      });
    }
  };
  const removeItem = (): void => {
    runtime.requestRemoveItem(address);
    if (
      !getCollection()?.items.some((item) => item.address.itemId === itemId)
    ) {
      focusAfterRemove();
    }
  };
  earlier.addEventListener('click', moveEarlier);
  later.addEventListener('click', moveLater);
  remove.addEventListener('click', removeItem);

  function renderItemTemplate(template: FormNodeTemplate): HTMLElement {
    if (template.kind === 'object') {
      const group = document.createElement('fieldset');
      const groupLegend = document.createElement('legend');
      groupLegend.textContent = template.label;
      group.append(groupLegend);
      for (const child of template.children)
        group.append(renderItemTemplate(child));
      return group;
    }
    const target: CollectionNodeAddress = {
      collectionPath,
      itemId,
      relativePath: template.relativePath,
    };
    const binding = createFieldBinding(
      template,
      {
        focus: () => runtime.focus(target),
        blur: () => runtime.blur(target),
        set: (value) => runtime.requestSetItemValue(target, value),
        remove: () => runtime.requestRemoveItemValue(target),
        locale: () => runtime.getSnapshot().locale,
      },
      `${domId(collection.key)}-${itemId}`,
    );
    fieldBindings.push({ relativePath: template.relativePath, binding });
    return binding.element;
  }

  return {
    element: fieldset,
    reconcile(snapshot: ItemRuntimeSnapshot, locale: string) {
      earlier.disabled = snapshot.index === 0;
      const collectionSnapshot = getCollection();
      later.disabled =
        snapshot.index === (collectionSnapshot?.items.length ?? 0) - 1;
      for (const record of fieldBindings) {
        const field = snapshot.fields.find(({ path }) =>
          endsWithPath(path, record.relativePath),
        );
        if (field !== undefined) record.binding.reconcile(field, locale);
      }
    },
    focusFirst() {
      fieldset.querySelector<HTMLElement>('input, select, button')?.focus();
    },
    dispose() {
      earlier.removeEventListener('click', moveEarlier);
      later.removeEventListener('click', moveLater);
      remove.removeEventListener('click', removeItem);
      for (const { binding } of fieldBindings) binding.dispose();
      fieldset.remove();
    },
  };
}

function endsWithPath(
  path: readonly (string | number)[],
  suffix: readonly string[],
): boolean {
  if (suffix.length > path.length) return false;
  return suffix.every(
    (segment, index) => path[path.length - suffix.length + index] === segment,
  );
}

function stringPath(path: readonly (string | number)[]): readonly string[] {
  if (
    !path.every((segment): segment is string => typeof segment === 'string')
  ) {
    throw new Error('Collection paths must contain only string segments.');
  }
  return path;
}

function draftFieldValue(
  field: FieldTemplate,
  text: string,
  fallback: string,
  locale: string,
): unknown {
  if (field.kind === 'boolean') return text === 'true';
  if (field.kind === 'number') return parseNumber(text, locale) ?? 0;
  return text || fallback;
}

function setNestedValue(
  target: Record<string, unknown>,
  path: readonly string[],
  value: unknown,
): void {
  let cursor = target;
  for (let index = 0; index < path.length - 1; index += 1) {
    const segment = path[index];
    if (segment === undefined) return;
    const existing = cursor[segment];
    const child =
      typeof existing === 'object' &&
      existing !== null &&
      !Array.isArray(existing)
        ? (existing as Record<string, unknown>)
        : {};
    if (existing !== child) cursor[segment] = child;
    cursor = child;
  }
  const leaf = path.at(-1);
  if (leaf !== undefined) cursor[leaf] = value;
}

function labelledInput(id: string, text: string) {
  const label = document.createElement('label');
  label.htmlFor = id;
  label.textContent = text;
  const input = document.createElement('input');
  input.id = id;
  input.type = 'text';
  return { label, input };
}

const MISSING = '__schema_engine_missing__';

function createControl(
  definition: FieldDefinition | FieldTemplate,
): HTMLInputElement | HTMLSelectElement {
  if (definition.kind === 'string' && definition.choices !== undefined) {
    const select = document.createElement('select');
    select.append(option(MISSING, 'Missing'));
    for (const choice of definition.choices) {
      select.append(option(choice.value, choice.label));
    }
    return select;
  }
  const input = document.createElement('input');
  if (definition.kind === 'boolean') {
    input.type = 'checkbox';
  } else {
    input.type = 'text';
    if (definition.kind === 'number') {
      input.inputMode =
        definition.numericType === 'integer' ? 'numeric' : 'decimal';
    } else if (definition.placeholder !== undefined) {
      input.placeholder = definition.placeholder;
    }
  }
  return input;
}

function presenceLabel(snapshot: FieldRuntimeSnapshot): string {
  if (snapshot.presence.kind !== 'value') {
    return snapshot.presence.kind === 'missing' ? 'Missing' : 'Blocked';
  }
  if (snapshot.presence.value === null) return 'Null';
  if (snapshot.presence.value === '') return 'Empty string';
  if (snapshot.presence.value === false) return 'False';
  if (snapshot.presence.value === 0) return 'Zero';
  return 'Value present';
}

function parseNumber(text: string, locale: string): number | undefined {
  const trimmed = text.trim();
  if (trimmed.length === 0) return undefined;
  const decimal = new Intl.NumberFormat(locale)
    .formatToParts(1.1)
    .find(({ type }) => type === 'decimal')?.value;
  const normalized =
    decimal === undefined ? trimmed : trimmed.replace(decimal, '.');
  if (!/^[+-]?(?:\d+|\d+\.\d+|\.\d+)(?:[eE][+-]?\d+)?$/.test(normalized)) {
    return undefined;
  }
  const value = Number(normalized);
  return Number.isFinite(value) ? value : undefined;
}

function formatNumber(
  value: number,
  locale: string,
  definition: Extract<FieldDefinition | FieldTemplate, { kind: 'number' }>,
): string {
  return new Intl.NumberFormat(locale, {
    useGrouping: false,
    ...(definition.ui.decimalPlaces === undefined
      ? { maximumFractionDigits: 20 }
      : {
          minimumFractionDigits: definition.ui.showTrailingZeros
            ? definition.ui.decimalPlaces
            : 0,
          maximumFractionDigits: definition.ui.decimalPlaces,
        }),
  }).format(value);
}

function option(value: string, label: string): HTMLOptionElement {
  const element = document.createElement('option');
  element.value = value;
  element.textContent = label;
  return element;
}

function button(label: string): HTMLButtonElement {
  const element = document.createElement('button');
  element.type = 'button';
  element.textContent = label;
  return element;
}

function supportingText(id: string, text: string): HTMLParagraphElement {
  const element = document.createElement('p');
  element.id = id;
  element.className = 'supporting-text';
  element.textContent = text;
  return element;
}

function appendSupportingText(
  container: HTMLElement,
  description?: string,
  hint?: string,
): void {
  if (description !== undefined)
    container.append(supportingText('', description));
  if (hint !== undefined) container.append(supportingText('', hint));
}

function domId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '-');
}
