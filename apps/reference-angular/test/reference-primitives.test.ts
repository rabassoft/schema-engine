import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EditorView } from 'codemirror';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ReferenceCodeExampleComponent } from '../src/app/reference-code-example.component.js';
import { ReferenceJsonEditorComponent } from '../src/app/reference-json-editor.component.js';
import {
  ReferenceTabsComponent,
  referenceTabId,
  referenceTabPanelId,
} from '../src/app/reference-tabs.component.js';

describe('reference application presentation primitives', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('exposes deterministic tab relationships and roving selection', () => {
    TestBed.configureTestingModule({
      imports: [ReferenceTabsComponent],
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(ReferenceTabsComponent);
    fixture.componentRef.setInput('tabSetId', 'configuration');
    fixture.componentRef.setInput('label', 'Configuration views');
    fixture.componentRef.setInput('tabs', [
      { id: 'controls', label: 'Controls' },
      { id: 'schema', label: 'Schema' },
      { id: 'ui-schema', label: 'UI Schema' },
    ]);
    fixture.componentRef.setInput('activeId', 'controls');
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const tabList = root.querySelector('[role="tablist"]');
    const tabs = Array.from(
      root.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    );
    expect(tabList?.getAttribute('aria-label')).toBe('Configuration views');
    expect(getComputedStyle(tabList as Element).overflowY).toBe('hidden');
    expect(tabs).toHaveLength(3);
    expect(tabs[0]?.id).toBe(referenceTabId('configuration', 'controls'));
    expect(tabs[0]?.getAttribute('aria-controls')).toBe(
      referenceTabPanelId('configuration', 'controls'),
    );
    expect(tabs.map((tab) => tab.getAttribute('aria-selected'))).toEqual([
      'true',
      'false',
      'false',
    ]);
    expect(tabs.map(({ tabIndex }) => tabIndex)).toEqual([0, -1, -1]);

    const selected: string[] = [];
    fixture.componentInstance.activeIdChange.subscribe((id) =>
      selected.push(id),
    );
    tabs[1]?.click();
    fixture.detectChanges();
    expect(selected).toEqual(['schema']);
    expect(tabs[1]?.getAttribute('aria-selected')).toBe('true');
    expect(tabs[1]?.tabIndex).toBe(0);
  });

  it('activates and focuses tabs with arrows, Home and End', () => {
    TestBed.configureTestingModule({
      imports: [ReferenceTabsComponent],
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(ReferenceTabsComponent);
    fixture.componentRef.setInput('tabSetId', 'evidence');
    fixture.componentRef.setInput('label', 'Evidence views');
    fixture.componentRef.setInput('tabs', [
      { id: 'state', label: 'State' },
      { id: 'runtime', label: 'Runtime' },
      { id: 'diagnostics', label: 'Diagnostics' },
    ]);
    fixture.componentRef.setInput('activeId', 'state');
    fixture.detectChanges();
    const tabs = Array.from(
      (
        fixture.nativeElement as HTMLElement
      ).querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    );

    tabs[0]?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }),
    );
    fixture.detectChanges();
    expect(document.activeElement).toBe(tabs[2]);
    expect(tabs[2]?.getAttribute('aria-selected')).toBe('true');

    tabs[2]?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Home', bubbles: true }),
    );
    fixture.detectChanges();
    expect(document.activeElement).toBe(tabs[0]);

    tabs[0]?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'End', bubbles: true }),
    );
    fixture.detectChanges();
    expect(document.activeElement).toBe(tabs[2]);

    tabs[2]?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    );
    fixture.detectChanges();
    expect(document.activeElement).toBe(tabs[0]);
  });

  it('creates a labelled controlled JSON editor, emits and copies current edits, then destroys its view', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    TestBed.configureTestingModule({
      imports: [ReferenceJsonEditorComponent],
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(ReferenceJsonEditorComponent);
    fixture.componentRef.setInput('label', 'JSON Schema editor');
    fixture.componentRef.setInput('instructionsId', 'schema-editor-help');
    fixture.componentRef.setInput('value', '{\n  "type": "object"\n}');
    const emitted: string[] = [];
    fixture.componentInstance.valueChange.subscribe((value) =>
      emitted.push(value),
    );
    fixture.detectChanges();

    const content = (fixture.nativeElement as HTMLElement).querySelector(
      '.cm-content',
    );
    expect(content?.getAttribute('aria-label')).toBe('JSON Schema editor');
    expect(content?.getAttribute('aria-describedby')).toBe(
      'schema-editor-help',
    );
    expect(content?.getAttribute('aria-multiline')).toBe('true');
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.cm-gutters'),
    ).not.toBeNull();
    expect(
      Array.from(document.head.querySelectorAll('style')).some(
        (style) =>
          style.textContent?.includes('.cm-selectionBackground') === true &&
          style.textContent.includes('var(--color-editor-selection)'),
      ),
    ).toBe(true);

    const view = EditorView.findFromDOM(content as HTMLElement);
    expect(view).not.toBeNull();
    view?.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: '{\n  "type": "string"\n}',
      },
    });
    expect(emitted).toEqual(['{\n  "type": "string"\n}']);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>(
        'button[aria-label="Copy JSON Schema editor"]',
      )
      ?.click();
    await vi.waitFor(() =>
      expect(writeText).toHaveBeenCalledWith('{\n  "type": "string"\n}'),
    );

    fixture.componentRef.setInput('value', '{\n  "type": "number"\n}');
    fixture.detectChanges();
    expect(view?.state.doc.toString()).toBe('{\n  "type": "number"\n}');
    expect(emitted).toHaveLength(1);

    const destroy = view === null ? undefined : vi.spyOn(view, 'destroy');
    fixture.destroy();
    expect(destroy).toHaveBeenCalledOnce();
  });

  it('renders highlighted read-only TypeScript and copies the exact source', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    TestBed.configureTestingModule({
      imports: [ReferenceCodeExampleComponent],
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(ReferenceCodeExampleComponent);
    const source = "const value: string = 'highlighted';";
    fixture.componentRef.setInput('label', 'Application signals excerpt');
    fixture.componentRef.setInput('language', 'typescript');
    fixture.componentRef.setInput('source', source);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const content = root.querySelector('.cm-content');
    expect(content?.getAttribute('aria-label')).toBe(
      'Application signals excerpt code',
    );
    expect(content?.getAttribute('aria-readonly')).toBe('true');
    expect(
      Array.from(content?.querySelectorAll('span') ?? []).some(
        ({ textContent, className }) =>
          textContent === 'const' && className.length > 0,
      ),
    ).toBe(true);
    expect(
      Array.from(document.head.querySelectorAll('style')).some(
        (style) =>
          style.textContent?.includes('.cm-selectionBackground') === true &&
          style.textContent.includes('var(--color-code-selection)'),
      ),
    ).toBe(true);
    root
      .querySelector<HTMLButtonElement>(
        'button[aria-label="Copy Application signals excerpt"]',
      )
      ?.click();
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith(source));

    const view = EditorView.findFromDOM(content as HTMLElement);
    const destroy = view === null ? undefined : vi.spyOn(view, 'destroy');
    fixture.destroy();
    expect(destroy).toHaveBeenCalledOnce();
  });
});
