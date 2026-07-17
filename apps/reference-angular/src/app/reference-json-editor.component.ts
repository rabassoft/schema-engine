import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
  signal,
} from '@angular/core';
import type { AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { json } from '@codemirror/lang-json';
import { basicSetup, EditorView } from 'codemirror';

import { referenceSyntaxTheme } from './reference-code-theme.js';
import { ReferenceCopyButtonComponent } from './reference-copy-button.component.js';

@Component({
  selector: 'reference-json-editor',
  standalone: true,
  imports: [ReferenceCopyButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="json-editor-toolbar">
      <span>Editable JSON</span>
      <reference-copy-button [label]="label" [text]="currentValue()" />
    </div>
    <div #editorHost class="reference-json-editor"></div>
  `,
  styles: `
    .json-editor-toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.45rem;
      color: var(--color-text-muted);
      font-size: 0.82rem;
      font-weight: 800;
    }

    .reference-json-editor {
      overflow: hidden;
      border: 1px solid var(--color-border-strong);
      border-radius: var(--radius-medium);
      background: var(--color-surface);
    }

    reference-json-editor .reference-json-editor .cm-editor {
      min-height: 16rem;
      max-height: 34rem;
      background: var(--color-surface);
      color: var(--color-text);
      font-size: 0.9rem;
    }

    reference-json-editor .reference-json-editor .cm-gutters {
      border-right-color: var(--color-border);
      background: var(--color-surface-muted);
      color: var(--color-text-muted);
    }

    reference-json-editor .reference-json-editor .cm-activeLine,
    reference-json-editor .reference-json-editor .cm-activeLineGutter {
      background: var(--color-primary-soft);
    }

    reference-json-editor .reference-json-editor .cm-scroller {
      overflow: auto;
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    }

    reference-json-editor .reference-json-editor .cm-editor.cm-focused {
      outline: 3px solid var(--color-focus);
      outline-offset: -1px;
    }
  `,
})
export class ReferenceJsonEditorComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) label = '';
  @Input() instructionsId: string | undefined;
  @Output() readonly valueChange = new EventEmitter<string>();

  @ViewChild('editorHost', { static: true })
  private readonly editorHost?: ElementRef<HTMLElement>;

  private editorView: EditorView | undefined;
  protected readonly currentValue = signal('');
  private suppressEmission = false;

  @Input({ required: true })
  set value(value: string) {
    if (value === this.currentValue()) return;
    this.currentValue.set(value);
    const view = this.editorView;
    if (view === undefined || view.state.doc.toString() === value) return;
    this.suppressEmission = true;
    try {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value },
      });
    } finally {
      this.suppressEmission = false;
    }
  }

  ngAfterViewInit(): void {
    const parent = this.editorHost?.nativeElement;
    if (parent === undefined) return;
    const contentAttributes: Record<string, string> = {
      'aria-label': this.label,
      'aria-multiline': 'true',
    };
    if (this.instructionsId !== undefined) {
      contentAttributes['aria-describedby'] = this.instructionsId;
    }
    this.editorView = new EditorView({
      parent,
      doc: this.currentValue(),
      extensions: [
        basicSetup,
        json(),
        referenceSyntaxTheme,
        EditorView.lineWrapping,
        EditorView.contentAttributes.of(contentAttributes),
        EditorView.updateListener.of((update) => {
          if (!update.docChanged || this.suppressEmission) return;
          const value = update.state.doc.toString();
          this.currentValue.set(value);
          this.valueChange.emit(value);
        }),
      ],
    });
  }

  ngOnDestroy(): void {
    this.editorView?.destroy();
    this.editorView = undefined;
  }

  focus(): void {
    this.editorView?.focus();
  }
}
