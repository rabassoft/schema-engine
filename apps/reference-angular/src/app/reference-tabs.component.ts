import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  type OnChanges,
  Output,
  ViewChildren,
} from '@angular/core';
import type { QueryList } from '@angular/core';

export interface ReferenceTab {
  readonly id: string;
  readonly label: string;
}

export function referenceTabId(tabSetId: string, tabId: string): string {
  return `${tabSetId}-tab-${tabId}`;
}

export function referenceTabPanelId(tabSetId: string, tabId: string): string {
  return `${tabSetId}-panel-${tabId}`;
}

@Component({
  selector: 'reference-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="reference-tabs" role="tablist" [attr.aria-label]="label">
      @for (tab of tabs; track tab.id; let index = $index) {
        <button
          #tabButton
          type="button"
          role="tab"
          [id]="tabElementId(tab.id)"
          [attr.aria-controls]="panelElementId(tab.id)"
          [attr.aria-selected]="isActive(tab.id)"
          [tabIndex]="isActive(tab.id) ? 0 : -1"
          (click)="activate(index)"
          (keydown)="handleKeydown($event, index)"
        >
          {{ tab.label }}
        </button>
      }
    </div>
  `,
  styles: `
    .reference-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
      max-width: 100%;
      padding: 0.25rem;
    }

    button {
      flex: 1 1 auto;
      margin: 0;
      border: 1px solid transparent;
      border-radius: 0.4rem;
      background: transparent;
      white-space: normal;
    }

    button[aria-selected='true'] {
      border-color: var(--color-primary);
      background: var(--color-primary-soft);
      color: var(--color-primary-strong);
    }
  `,
})
export class ReferenceTabsComponent implements OnChanges {
  @Input({ required: true }) tabSetId = '';
  @Input({ required: true }) label = '';
  @Input({ required: true }) tabs: readonly ReferenceTab[] = [];
  @Input({ required: true }) activeId = '';
  @Output() readonly activeIdChange = new EventEmitter<string>();

  @ViewChildren('tabButton', { read: ElementRef })
  private readonly tabButtons?: QueryList<ElementRef<HTMLButtonElement>>;

  protected selectedId = '';

  ngOnChanges(): void {
    if (this.tabs.some(({ id }) => id === this.activeId)) {
      this.selectedId = this.activeId;
      return;
    }
    if (!this.tabs.some(({ id }) => id === this.selectedId)) {
      this.selectedId = this.tabs[0]?.id ?? '';
    }
  }

  protected isActive(id: string): boolean {
    return id === this.selectedId;
  }

  protected tabElementId(id: string): string {
    return referenceTabId(this.tabSetId, id);
  }

  protected panelElementId(id: string): string {
    return referenceTabPanelId(this.tabSetId, id);
  }

  protected activate(index: number, moveFocus = false): void {
    const tab = this.tabs[index];
    if (tab === undefined) return;
    const changed = tab.id !== this.selectedId;
    this.selectedId = tab.id;
    if (changed) this.activeIdChange.emit(tab.id);
    if (moveFocus) this.tabButtons?.get(index)?.nativeElement.focus();
  }

  protected handleKeydown(event: KeyboardEvent, index: number): void {
    if (this.tabs.length === 0) return;
    let nextIndex: number | undefined;
    switch (event.key) {
      case 'ArrowRight':
        nextIndex = (index + 1) % this.tabs.length;
        break;
      case 'ArrowLeft':
        nextIndex = (index - 1 + this.tabs.length) % this.tabs.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = this.tabs.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.activate(nextIndex, true);
  }
}
