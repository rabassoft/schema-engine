// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

export interface StandardTabDefinition {
  readonly id: string;
  readonly label: string;
  readonly panel: HTMLElement;
}

export class StandardTabs {
  private readonly buttons: readonly HTMLButtonElement[];
  private readonly cleanups: Array<() => void> = [];
  private selectedIndex: number;
  private disposed = false;

  constructor(
    private readonly id: string,
    private readonly tabs: readonly StandardTabDefinition[],
    initialId = tabs[0]?.id,
  ) {
    if (tabs.length === 0) throw new Error('A tab set requires one tab.');
    const selected = tabs.findIndex(({ id }) => id === initialId);
    this.selectedIndex = selected < 0 ? 0 : selected;
    this.buttons = Object.freeze(
      tabs.map((tab, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.id = `${id}-tab-${tab.id}`;
        button.textContent = tab.label;
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-controls', `${id}-panel-${tab.id}`);
        tab.panel.id = `${id}-panel-${tab.id}`;
        tab.panel.setAttribute('role', 'tabpanel');
        tab.panel.setAttribute('aria-labelledby', button.id);
        tab.panel.tabIndex = 0;
        const click = (): void => this.select(index, true);
        const keydown = (event: KeyboardEvent): void =>
          this.handleKeydown(event, index);
        button.addEventListener('click', click);
        button.addEventListener('keydown', keydown);
        this.cleanups.push(() => button.removeEventListener('click', click));
        this.cleanups.push(() =>
          button.removeEventListener('keydown', keydown),
        );
        return button;
      }),
    );
    this.update(false);
  }

  appendTo(tabList: HTMLElement): void {
    tabList.setAttribute('role', 'tablist');
    tabList.setAttribute('aria-label', `${this.id} tabs`);
    tabList.replaceChildren(...this.buttons);
  }

  getSelectedId(): string {
    return this.tabs[this.selectedIndex]?.id ?? '';
  }

  selectById(id: string): boolean {
    const index = this.tabs.findIndex((tab) => tab.id === id);
    if (index < 0) return false;
    this.select(index, false);
    return true;
  }

  destroy(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const cleanup of this.cleanups.splice(0)) cleanup();
  }

  private select(index: number, focus: boolean): void {
    if (this.disposed || index < 0 || index >= this.tabs.length) return;
    this.selectedIndex = index;
    this.update(focus);
  }

  private update(focus: boolean): void {
    for (const [index, button] of this.buttons.entries()) {
      const selected = index === this.selectedIndex;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      const panel = this.tabs[index]?.panel;
      if (panel !== undefined) panel.hidden = !selected;
    }
    if (focus) this.buttons[this.selectedIndex]?.focus();
  }

  private handleKeydown(event: KeyboardEvent, index: number): void {
    let next: number | undefined;
    if (event.key === 'ArrowRight') next = (index + 1) % this.tabs.length;
    else if (event.key === 'ArrowLeft') {
      next = (index - 1 + this.tabs.length) % this.tabs.length;
    } else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = this.tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    this.select(next, true);
  }
}
