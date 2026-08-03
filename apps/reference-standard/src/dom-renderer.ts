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

function sectionIdBase(
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

function containerIdBase(
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

function panelIdBase(
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

function gridItemIdBase(
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

type StandardPresentationNode = FormNodeDefinition | FormNodeTemplate;

export interface StandardDomRendererOptions {
  readonly embeddedCollectionControls?: boolean;
  readonly formId?: string;
  readonly resolvePresentationLabel?: (
    label: string,
    context: Readonly<{
      formId: string;
      locale: string;
      presentation:
        | PresentationSectionDefinition<StandardPresentationNode>
        | AdvancedPresentationLabelDefinition;
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
  private readonly presentationLabelCache = new WeakMap<
    object,
    Map<string, string>
  >();
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
      this.form.append(
        this.renderPresentation(
          entry,
          undefined,
          (node) => this.renderNode(node as FormNodeDefinition),
          this.cleanups,
        ),
      );
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

  private renderPresentation(
    entry: PresentationEntryDefinition<StandardPresentationNode>,
    ownerInstance: readonly unknown[] | undefined,
    renderNode: (node: StandardPresentationNode) => HTMLElement,
    cleanups: Array<() => void>,
  ): HTMLElement {
    if (entry.kind === 'form-node') return renderNode(entry.node);
    if (entry.kind === 'section')
      return this.renderSection(entry, ownerInstance, renderNode, cleanups);
    if (entry.kind === 'tabs')
      return this.renderTabs(entry, ownerInstance, renderNode, cleanups);
    if (entry.kind === 'accordion')
      return this.renderAccordion(entry, ownerInstance, renderNode, cleanups);
    return this.renderGrid(entry, ownerInstance, renderNode, cleanups);
  }

  private renderSection(
    entry: PresentationSectionDefinition<StandardPresentationNode>,
    ownerInstance: readonly unknown[] | undefined,
    renderNode: (node: StandardPresentationNode) => HTMLElement,
    cleanups: Array<() => void>,
  ): HTMLElement {
    const section = document.createElement('fieldset');
    section.className = 'form-section';
    const legend = document.createElement('legend');
    legend.id = `${sectionIdBase(this.formId, entry.id, ownerInstance)}--legend`;
    this.bindPresentationLabel(entry, legend, cleanups);
    section.append(legend);
    for (const child of entry.children)
      section.append(
        this.renderPresentation(child, ownerInstance, renderNode, cleanups),
      );
    return section;
  }

  private renderTabs(
    entry: PresentationTabsDefinition<StandardPresentationNode>,
    ownerInstance: readonly unknown[] | undefined,
    renderNode: (node: StandardPresentationNode) => HTMLElement,
    cleanups: Array<() => void>,
  ): HTMLElement {
    const wrapper = document.createElement('section');
    wrapper.className = 'presentation-tabs';
    const tablist = document.createElement('div');
    tablist.id = `${containerIdBase(
      this.formId,
      'tabs',
      entry.id,
      ownerInstance,
    )}--tablist`;
    tablist.setAttribute('role', 'tablist');
    this.bindPresentationLabel(entry, tablist, cleanups, 'aria-label');
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
      const base = panelIdBase(
        this.formId,
        'tabs',
        entry.id,
        panel.id,
        ownerInstance,
      );
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.id = `${base}--tab`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', `${base}--tabpanel`);
      this.bindPresentationLabel(panel, tab, cleanups);
      const region = this.renderPanel(
        panel,
        ownerInstance,
        renderNode,
        cleanups,
      );
      region.id = `${base}--tabpanel`;
      region.setAttribute('role', 'tabpanel');
      region.setAttribute('aria-labelledby', tab.id);
      const activate = (): void => {
        activeIndex = index;
        update();
        tab.focus();
      };
      this.listen(tab, 'click', activate, cleanups);
      this.listen(
        tab,
        'keydown',
        (event) => {
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
        },
        cleanups,
      );
      tabs.push(tab);
      panels.push(region);
      tablist.append(tab);
    });
    update();
    wrapper.append(tablist, ...panels);
    return wrapper;
  }

  private renderAccordion(
    entry: PresentationAccordionDefinition<StandardPresentationNode>,
    ownerInstance: readonly unknown[] | undefined,
    renderNode: (node: StandardPresentationNode) => HTMLElement,
    cleanups: Array<() => void>,
  ): HTMLElement {
    const group = document.createElement('section');
    group.className = 'presentation-accordion';
    group.id = `${containerIdBase(
      this.formId,
      'accordion',
      entry.id,
      ownerInstance,
    )}--accordion`;
    group.setAttribute('role', 'group');
    this.bindPresentationLabel(entry, group, cleanups, 'aria-label');
    entry.panels.forEach((panel) => {
      const base = panelIdBase(
        this.formId,
        'accordion',
        entry.id,
        panel.id,
        ownerInstance,
      );
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.id = `${base}--trigger`;
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-controls', `${base}--region`);
      this.bindPresentationLabel(panel, trigger, cleanups);
      const region = this.renderPanel(
        panel,
        ownerInstance,
        renderNode,
        cleanups,
      );
      region.id = `${base}--region`;
      region.setAttribute('role', 'region');
      region.setAttribute('aria-labelledby', trigger.id);
      setMountedHidden(region, true);
      this.listen(
        trigger,
        'click',
        () => {
          const expanded = trigger.getAttribute('aria-expanded') !== 'true';
          trigger.setAttribute('aria-expanded', String(expanded));
          setMountedHidden(region, !expanded);
        },
        cleanups,
      );
      group.append(trigger, region);
    });
    return group;
  }

  private renderGrid(
    entry: PresentationGridDefinition<StandardPresentationNode>,
    ownerInstance: readonly unknown[] | undefined,
    renderNode: (node: StandardPresentationNode) => HTMLElement,
    cleanups: Array<() => void>,
  ): HTMLElement {
    const grid = document.createElement('section');
    grid.className = 'presentation-grid';
    grid.id = `${containerIdBase(
      this.formId,
      'grid',
      entry.id,
      ownerInstance,
    )}--grid`;
    grid.setAttribute('role', 'group');
    grid.style.setProperty('--standard-grid-columns', String(entry.columns));
    this.bindPresentationLabel(entry, grid, cleanups, 'aria-label');
    entry.items.forEach((item, index) => {
      const cell = document.createElement('div');
      cell.className = 'presentation-grid-cell';
      cell.id = `${gridItemIdBase(
        this.formId,
        entry.id,
        index,
        ownerInstance,
      )}--cell`;
      cell.style.setProperty('--standard-grid-span', String(item.span));
      cell.append(
        this.renderPresentation(
          item.child,
          ownerInstance,
          renderNode,
          cleanups,
        ),
      );
      grid.append(cell);
    });
    return grid;
  }

  private renderPanel(
    panel: PresentationPanelDefinition<StandardPresentationNode>,
    ownerInstance: readonly unknown[] | undefined,
    renderNode: (node: StandardPresentationNode) => HTMLElement,
    cleanups: Array<() => void>,
  ): HTMLElement {
    const region = document.createElement('div');
    region.className = 'presentation-panel';
    for (const child of panel.children)
      region.append(
        this.renderPresentation(child, ownerInstance, renderNode, cleanups),
      );
    return region;
  }

  private bindPresentationLabel(
    presentation:
      | PresentationSectionDefinition<StandardPresentationNode>
      | AdvancedPresentationLabelDefinition,
    element: HTMLElement,
    cleanups: Array<() => void>,
    attribute?: 'aria-label',
  ): void {
    const source = presentation.label;
    let lastLocale: string | undefined;
    const apply = (locale: string): void => {
      if (locale === lastLocale) return;
      lastLocale = locale;
      let cache = this.presentationLabelCache.get(presentation);
      if (cache === undefined) {
        cache = new Map();
        this.presentationLabelCache.set(presentation, cache);
      }
      let text = cache.get(locale);
      if (text === undefined) {
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
        text =
          typeof result === 'string' && result.trim().length > 0
            ? result
            : source;
        cache.set(locale, text);
      }
      if (attribute === undefined) element.textContent = text;
      else element.setAttribute(attribute, text);
    };
    const binding = { reconcile: apply };
    this.presentationLabels.push(binding);
    cleanups.push(() => {
      const index = this.presentationLabels.indexOf(binding);
      if (index >= 0) this.presentationLabels.splice(index, 1);
    });
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
      const ownerInstance = ['object', stringPath(node.path)] as const;
      for (const entry of node.presentation) {
        fieldset.append(
          this.renderPresentation(
            entry,
            ownerInstance,
            (child) => this.renderNode(child as FormNodeDefinition),
            this.cleanups,
          ),
        );
      }
      return fieldset;
    }
    if (node.kind === 'array') {
      const binding = createCollectionBinding(
        node,
        this.runtime,
        this.options.embeddedCollectionControls !== false,
        (entry, ownerInstance, renderNode, cleanups) =>
          this.renderPresentation(entry, ownerInstance, renderNode, cleanups),
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
    cleanups = this.cleanups,
  ): void {
    target.addEventListener(type, listener);
    cleanups.push(() => target.removeEventListener(type, listener));
  }
}

type RenderStandardPresentation = (
  entry: PresentationEntryDefinition<StandardPresentationNode>,
  ownerInstance: readonly unknown[],
  renderNode: (node: StandardPresentationNode) => HTMLElement,
  cleanups: Array<() => void>,
) => HTMLElement;

function createFieldBinding(
  definition: FieldDefinition | FieldTemplate,
  intentions: FieldIntentions,
  idScope = '',
): FieldBinding {
  if (hasOwnFixedValue(definition))
    return createFixedFieldBinding(definition, idScope);
  if (definition.kind === 'string-enum-array') {
    return createStringEnumArrayFieldBinding(definition, intentions, idScope);
  }
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
    if (!fieldInteractive(currentSnapshot)) return;
    focused = true;
    intentions.focus();
  });
  listen(control, 'blur', () => {
    focused = false;
    if (!fieldInteractive(currentSnapshot)) return;
    intentions.blur();
  });
  listen(clear, 'click', () => {
    if (
      fieldInteractive(currentSnapshot) &&
      currentSnapshot?.presence.kind === 'value'
    ) {
      intentions.remove();
    }
  });
  if (setNull !== undefined) {
    listen(setNull, 'click', () => {
      if (fieldInteractive(currentSnapshot)) intentions.set(null);
    });
  }

  if (definition.kind === 'string') {
    const eventType = control instanceof HTMLSelectElement ? 'change' : 'input';
    listen(control, eventType, () => {
      if (!fieldInteractive(currentSnapshot)) return;
      if (control instanceof HTMLSelectElement && control.value === MISSING) {
        if (currentSnapshot?.presence.kind === 'value') {
          intentions.remove();
        }
        return;
      }
      const requested = control.value;
      intentions.set(requested);
      const confirmed = currentSnapshot?.presence;
      if (
        confirmed?.kind !== 'value' ||
        !Object.is(confirmed.value, requested)
      ) {
        control.value =
          confirmed?.kind === 'value' && typeof confirmed.value === 'string'
            ? confirmed.value
            : control instanceof HTMLSelectElement
              ? MISSING
              : '';
      }
    });
  } else if (definition.kind === 'number') {
    control.addEventListener('input', handleNumberInput);
    cleanups.push(() =>
      control.removeEventListener('input', handleNumberInput),
    );
  } else {
    listen(control, 'change', () => {
      if (
        fieldInteractive(currentSnapshot) &&
        control instanceof HTMLInputElement
      ) {
        intentions.set(control.checked);
      }
    });
  }

  function handleNumberInput(): void {
    if (
      !fieldInteractive(currentSnapshot) ||
      !(control instanceof HTMLInputElement)
    )
      return;
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
    const previousPresence = currentSnapshot?.presence;
    currentSnapshot = snapshot;
    const unavailable = fieldUnavailable(snapshot);
    const disabled = !snapshot.enabled || unavailable;
    if (!snapshot.visible || disabled) focused = false;
    setFieldMountedState(container, snapshot.visible);
    control.disabled = disabled;
    const value =
      snapshot.presence.kind === 'value' ? snapshot.presence.value : undefined;
    const isPresent = snapshot.presence.kind === 'value';
    const isNull = isPresent && value === null;
    presence.value = presenceLabel(snapshot);
    clear.hidden = !isPresent;
    clear.disabled = disabled;
    if (setNull !== undefined) setNull.disabled = disabled || isNull;
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
      if (!focused || presenceChanged(previousPresence, snapshot.presence))
        control.value = typeof value === 'string' ? value : MISSING;
    } else if (control instanceof HTMLInputElement) {
      if (!focused || presenceChanged(previousPresence, snapshot.presence))
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

function createStringEnumArrayFieldBinding(
  definition: Extract<FieldDefinition, { kind: 'string-enum-array' }>,
  intentions: FieldIntentions,
  idScope: string,
): FieldBinding {
  const container = document.createElement('div');
  container.className = 'form-field string-enum-array-field';
  container.dataset['fieldKey'] = definition.key;
  container.dataset['fieldName'] = definition.name;
  const controlId = domId(`field-${idScope}-${definition.key}`);
  const labelId = `${controlId}-label`;
  const descriptionId = `${controlId}-description`;
  const hintId = `${controlId}-hint`;
  const statusId = `${controlId}-status`;
  const issuesId = `${controlId}-issues`;
  const describedBy: string[] = [];
  const cleanups: Array<() => void> = [];
  let currentSnapshot: FieldRuntimeSnapshot | undefined;
  let currentPresentation: StringEnumArrayPresentation = {
    representable: true,
    values: [],
    tokens: [],
  };

  const label = document.createElement('label');
  label.id = labelId;
  label.htmlFor = controlId;
  label.textContent = definition.label;
  container.append(label);
  container.setAttribute('aria-labelledby', labelId);

  if (definition.description !== undefined) {
    container.append(supportingText(descriptionId, definition.description));
    describedBy.push(descriptionId);
  }
  if (definition.hint !== undefined) {
    container.append(supportingText(hintId, definition.hint));
    describedBy.push(hintId);
  }

  const control = document.createElement('select');
  control.id = controlId;
  control.multiple = true;
  control.required = definition.required;
  if (definition.tooltip !== undefined) control.title = definition.tooltip;
  definition.choices.forEach((choice, index) => {
    control.append(option(choiceToken(index), choice.label));
  });
  container.append(control);

  const actions = document.createElement('div');
  actions.className = 'field-actions';
  const clear = button('Clear');
  clear.id = `${controlId}-clear`;
  clear.setAttribute('aria-labelledby', `${clear.id} ${labelId}`);
  actions.append(clear);
  container.append(actions);

  const status = document.createElement('p');
  status.id = statusId;
  status.className = 'presence-state';
  describedBy.push(statusId);
  container.append(status);

  const issues = document.createElement('ul');
  issues.id = issuesId;
  issues.className = 'field-issues';
  issues.hidden = true;
  describedBy.push(issuesId);
  container.append(issues);
  control.setAttribute('aria-describedby', describedBy.join(' '));

  listen(control, 'focus', () => {
    if (fieldInteractive(currentSnapshot)) intentions.focus();
  });
  listen(control, 'blur', () => {
    reconcileSelection();
    if (fieldInteractive(currentSnapshot)) intentions.blur();
  });
  listen(container, 'focus', (event) => {
    if (event.target === container && fieldInteractive(currentSnapshot)) {
      intentions.focus();
    }
  });
  listen(container, 'blur', (event) => {
    if (event.target === container && fieldInteractive(currentSnapshot)) {
      intentions.blur();
    }
  });
  listen(clear, 'focus', () => {
    if (fieldInteractive(currentSnapshot)) intentions.focus();
  });
  listen(clear, 'blur', () => {
    if (fieldInteractive(currentSnapshot)) intentions.blur();
  });
  listen(clear, 'click', () => {
    if (
      !fieldInteractive(currentSnapshot) ||
      currentSnapshot?.presence.kind !== 'value'
    ) {
      return;
    }
    if (currentPresentation.representable) control.focus();
    else container.focus();
    intentions.remove();
  });
  listen(control, 'change', () => {
    if (
      !fieldInteractive(currentSnapshot) ||
      !currentPresentation.representable
    ) {
      return;
    }
    const selected = new Set<number>();
    for (const candidate of Array.from(control.options)) {
      if (!candidate.selected) continue;
      const index = choiceIndex(candidate.value, definition.choices.length);
      if (index === undefined) {
        reconcileSelection();
        return;
      }
      selected.add(index);
    }
    const retained = currentPresentation.values.filter((value) => {
      const index = definition.choices.findIndex(
        (choice) => choice.value === value,
      );
      return index >= 0 && selected.has(index);
    });
    const confirmed = new Set(currentPresentation.values);
    const candidate = [...retained];
    definition.choices.forEach((choice, index) => {
      if (selected.has(index) && !confirmed.has(choice.value)) {
        candidate.push(choice.value);
      }
    });
    reconcileSelection();
    if (!orderedStringsEqual(candidate, currentPresentation.values)) {
      intentions.set(candidate);
    }
  });

  function reconcileSelection(): void {
    const selected = new Set(currentPresentation.tokens);
    for (const candidate of Array.from(control.options)) {
      candidate.selected = selected.has(candidate.value);
    }
  }

  function reconcile(snapshot: FieldRuntimeSnapshot, locale: string): void {
    currentSnapshot = snapshot;
    currentPresentation = inspectStringEnumArrayPresentation(
      snapshot,
      definition,
    );
    const unavailable = fieldUnavailable(snapshot);
    const actionDisabled = !snapshot.enabled || unavailable;
    setFieldMountedState(container, snapshot.visible);
    control.disabled = actionDisabled || !currentPresentation.representable;
    if (
      snapshot.visible &&
      !actionDisabled &&
      !currentPresentation.representable
    ) {
      container.tabIndex = 0;
    } else {
      container.removeAttribute('tabindex');
    }
    clear.hidden = snapshot.presence.kind !== 'value';
    clear.disabled = actionDisabled;
    clear.textContent = selectionText('Clear', locale);
    control.setAttribute('aria-invalid', String(!snapshot.valid));
    status.textContent = selectionStatus(
      snapshot,
      currentPresentation,
      definition,
      locale,
    );
    reconcileSelection();
    issues.replaceChildren(
      ...snapshot.issues.map((validationIssue) => {
        const item = document.createElement('li');
        item.textContent =
          validationIssue.fallbackMessage ?? validationIssue.code;
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

interface StringEnumArrayPresentation {
  readonly representable: boolean;
  readonly values: readonly string[];
  readonly tokens: readonly string[];
}

function inspectStringEnumArrayPresentation(
  snapshot: FieldRuntimeSnapshot,
  definition: Extract<FieldDefinition, { kind: 'string-enum-array' }>,
): StringEnumArrayPresentation {
  if (snapshot.presence.kind === 'missing') {
    return { representable: true, values: [], tokens: [] };
  }
  if (
    snapshot.presence.kind !== 'value' ||
    !Array.isArray(snapshot.presence.value)
  ) {
    return { representable: false, values: [], tokens: [] };
  }
  const values: string[] = [];
  const tokens: string[] = [];
  const seen = new Set<string>();
  for (let index = 0; index < snapshot.presence.value.length; index += 1) {
    const member = Object.getOwnPropertyDescriptor(
      snapshot.presence.value,
      index,
    );
    if (
      member === undefined ||
      !('value' in member) ||
      typeof member.value !== 'string' ||
      seen.has(member.value)
    ) {
      return { representable: false, values: [], tokens: [] };
    }
    const choiceIndex = definition.choices.findIndex(
      (choice) => choice.value === member.value,
    );
    if (choiceIndex < 0) {
      return { representable: false, values: [], tokens: [] };
    }
    seen.add(member.value);
    values.push(member.value);
    tokens.push(choiceToken(choiceIndex));
  }
  return {
    representable: true,
    values: Object.freeze(values),
    tokens: Object.freeze(tokens),
  };
}

const selectionTextByLocale = Object.freeze({
  en: Object.freeze({
    Clear: 'Clear',
    Missing: 'No value provided.',
    Empty: 'No values selected.',
    Incompatible: 'Incompatible selection.',
    Unavailable: 'Selection unavailable.',
    Selected: 'Selected',
  }),
  es: Object.freeze({
    Clear: 'Limpiar',
    Missing: 'No se ha proporcionado ningún valor.',
    Empty: 'No hay valores seleccionados.',
    Incompatible: 'Selección incompatible.',
    Unavailable: 'Selección no disponible.',
    Selected: 'Seleccionados',
  }),
});

type SelectionTextSource = keyof (typeof selectionTextByLocale)['en'];

function selectionText(source: SelectionTextSource, locale: string): string {
  return selectionTextByLocale[locale === 'es' ? 'es' : 'en'][source];
}

function selectionStatus(
  snapshot: FieldRuntimeSnapshot,
  presentation: StringEnumArrayPresentation,
  definition: Extract<FieldDefinition, { kind: 'string-enum-array' }>,
  locale: string,
): string {
  if (snapshot.presence.kind === 'missing') {
    return selectionText('Missing', locale);
  }
  if (snapshot.presence.kind === 'blocked') {
    return selectionText('Unavailable', locale);
  }
  if (!presentation.representable) {
    return selectionText('Incompatible', locale);
  }
  if (presentation.values.length === 0) {
    return selectionText('Empty', locale);
  }
  const labels = presentation.values.map(
    (value) =>
      definition.choices.find((choice) => choice.value === value)?.label ??
      value,
  );
  return `${selectionText('Selected', locale)}: ${labels.join(', ')}`;
}

function choiceToken(index: number): string {
  return `choice:${index}`;
}

function choiceIndex(token: string, choiceCount: number): number | undefined {
  const match = /^choice:(0|[1-9]\d*)$/u.exec(token);
  if (match === null) return undefined;
  const index = Number(match[1]);
  return Number.isSafeInteger(index) && index < choiceCount ? index : undefined;
}

function orderedStringsEqual(
  left: readonly string[],
  right: readonly string[],
): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => Object.is(value, right[index]))
  );
}

function createFixedFieldBinding(
  definition: FieldDefinition | FieldTemplate,
  idScope: string,
): FieldBinding {
  const group = document.createElement('div');
  group.className = 'form-field fixed-field';
  group.dataset['fieldKey'] = definition.key;
  group.dataset['fieldName'] = definition.name;
  const baseId = domId(`field-${idScope}-${definition.key}`);
  const labelId = `${baseId}-label`;
  const descriptionId = `${baseId}-description`;
  const hintId = `${baseId}-hint`;
  const issuesId = `${baseId}-issues`;
  group.id = baseId;
  group.setAttribute('role', 'group');
  group.setAttribute('aria-labelledby', labelId);
  if (definition.tooltip !== undefined) group.title = definition.tooltip;

  const label = document.createElement('span');
  label.id = labelId;
  label.className = 'field-label';
  label.textContent = definition.label;
  group.append(label);

  const describedBy: string[] = [];
  if (definition.description !== undefined) {
    group.append(supportingText(descriptionId, definition.description));
    describedBy.push(descriptionId);
  }
  if (definition.hint !== undefined) {
    group.append(supportingText(hintId, definition.hint));
    describedBy.push(hintId);
  }

  const value = document.createElement('span');
  value.id = `${baseId}-fixed-value`;
  value.className = 'fixed-value';
  group.append(value);

  const issues = document.createElement('ul');
  issues.id = issuesId;
  issues.className = 'field-issues';
  issues.hidden = true;
  group.append(issues);

  return {
    element: group,
    reconcile(snapshot, locale) {
      setFieldMountedState(group, snapshot.visible);
      const display = fixedDisplay(definition, snapshot, locale);
      value.textContent = display.text;
      value.dataset['fixedValueState'] = display.state;
      if (snapshot.valid) group.removeAttribute('aria-invalid');
      else group.setAttribute('aria-invalid', 'true');
      issues.replaceChildren(
        ...snapshot.issues.map((issue) => {
          const item = document.createElement('li');
          item.textContent = issue.code;
          return item;
        }),
      );
      const issuesVisible = snapshot.showIssues && snapshot.issues.length > 0;
      issues.hidden = !issuesVisible;
      const ids = issuesVisible ? [...describedBy, issuesId] : describedBy;
      if (ids.length === 0) group.removeAttribute('aria-describedby');
      else group.setAttribute('aria-describedby', ids.join(' '));
    },
    dispose() {},
  };
}

function hasOwnFixedValue(
  definition: FieldDefinition | FieldTemplate,
): boolean {
  const descriptor = Object.getOwnPropertyDescriptor(definition, 'fixedValue');
  return descriptor !== undefined && 'value' in descriptor;
}

type FixedTextSource =
  'Missing value' | 'Unavailable value' | 'Incompatible value' | 'Null value';

const fixedTextByLocale: Readonly<
  Record<'en' | 'es', Readonly<Record<FixedTextSource, string>>>
> = Object.freeze({
  en: Object.freeze({
    'Missing value': 'Missing value',
    'Unavailable value': 'Unavailable value',
    'Incompatible value': 'Incompatible value',
    'Null value': 'Null value',
  }),
  es: Object.freeze({
    'Missing value': 'Valor ausente',
    'Unavailable value': 'Valor no disponible',
    'Incompatible value': 'Valor incompatible',
    'Null value': 'Valor nulo',
  }),
});

function fixedText(source: FixedTextSource, locale: string): string {
  return fixedTextByLocale[locale === 'es' ? 'es' : 'en'][source];
}

function fixedDisplay(
  definition: FieldDefinition | FieldTemplate,
  snapshot: FieldRuntimeSnapshot,
  locale: string,
): { readonly state: string; readonly text: string } {
  const presence = snapshot.presence;
  if (presence.kind === 'blocked')
    return {
      state: 'unavailable',
      text: fixedText('Unavailable value', locale),
    };
  if (presence.kind === 'missing')
    return { state: 'missing', text: fixedText('Missing value', locale) };
  const value = presence.value;
  if (value === null)
    return definition.nullable
      ? { state: 'value', text: fixedText('Null value', locale) }
      : {
          state: 'incompatible',
          text: fixedText('Incompatible value', locale),
        };
  if (definition.kind === 'string' && typeof value === 'string')
    return { state: 'value', text: value === '' ? '""' : value };
  if (
    definition.kind === 'number' &&
    typeof value === 'number' &&
    Number.isFinite(value) &&
    (definition.numericType !== 'integer' || Number.isInteger(value))
  )
    return {
      state: 'value',
      text: Object.is(value, -0) ? '-0' : String(value),
    };
  if (definition.kind === 'boolean' && typeof value === 'boolean')
    return { state: 'value', text: String(value) };
  return {
    state: 'incompatible',
    text: fixedText('Incompatible value', locale),
  };
}

function presenceChanged(
  previous: FieldRuntimeSnapshot['presence'] | undefined,
  current: FieldRuntimeSnapshot['presence'],
): boolean {
  if (previous === undefined || previous.kind !== current.kind) return true;
  return (
    previous.kind === 'value' &&
    current.kind === 'value' &&
    !Object.is(previous.value, current.value)
  );
}

function fieldUnavailable(snapshot: FieldRuntimeSnapshot): boolean {
  return (
    snapshot.presence.kind === 'blocked' &&
    snapshot.presence.reason === 'incompatible-ancestor'
  );
}

function fieldInteractive(snapshot: FieldRuntimeSnapshot | undefined): boolean {
  return (
    snapshot !== undefined &&
    snapshot.visible &&
    snapshot.enabled &&
    !fieldUnavailable(snapshot)
  );
}

function setFieldMountedState(element: HTMLElement, visible: boolean): void {
  element.hidden = !visible;
  if (visible) {
    element.removeAttribute('inert');
    element.removeAttribute('aria-hidden');
  } else {
    element.setAttribute('inert', '');
    element.setAttribute('aria-hidden', 'true');
  }
}

function createCollectionBinding(
  definition: ArrayNodeDefinition,
  runtime: FormRuntime<object>,
  embeddedControls: boolean,
  renderPresentation: RenderStandardPresentation,
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
            renderPresentation,
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
  renderPresentation: RenderStandardPresentation,
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
  const presentationCleanups: Array<() => void> = [];
  const itemOwner = ['item', collectionPath, itemId] as const;
  for (const entry of collection.item.presentation) {
    fieldset.append(
      renderPresentation(
        entry,
        itemOwner,
        (template) => renderItemTemplate(template as FormNodeTemplate),
        presentationCleanups,
      ),
    );
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
      appendSupportingText(group, template.description, template.hint);
      const owner = [
        'item-object',
        collectionPath,
        itemId,
        template.relativePath,
      ] as const;
      for (const entry of template.presentation) {
        group.append(
          renderPresentation(
            entry,
            owner,
            (child) => renderItemTemplate(child as FormNodeTemplate),
            presentationCleanups,
          ),
        );
      }
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
      for (const cleanup of presentationCleanups.splice(0)) cleanup();
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
  if (definition.kind === 'string-enum-array') {
    throw new Error('String-enum array renderer is not registered.');
  }
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
    input.type =
      definition.kind === 'string'
        ? semanticStringInputType(definition.format)
        : 'text';
    if (definition.kind === 'number') {
      input.inputMode =
        definition.numericType === 'integer' ? 'numeric' : 'decimal';
    } else if (definition.placeholder !== undefined) {
      input.placeholder = definition.placeholder;
    }
  }
  return input;
}

function semanticStringInputType(
  format: 'email' | 'date' | 'date-time' | undefined,
): 'email' | 'date' | 'text' {
  if (format === 'email') return 'email';
  if (format === 'date') return 'date';
  return 'text';
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
