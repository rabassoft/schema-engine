import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import type { AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { html } from '@codemirror/lang-html';
import { javascript } from '@codemirror/lang-javascript';
import { basicSetup, EditorView } from 'codemirror';

import { referenceSyntaxTheme } from './reference-code-theme.js';
import { ReferenceCopyButtonComponent } from './reference-copy-button.component.js';

export type ReferenceCodeLanguage = 'html' | 'typescript';

@Component({
  selector: 'reference-code-example',
  standalone: true,
  imports: [ReferenceCopyButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="reference-code-example">
      <div class="code-example-toolbar">
        <span>{{
          language === 'typescript' ? 'TypeScript' : 'Angular template'
        }}</span>
        <reference-copy-button [label]="label" [text]="source" />
      </div>
      <div #codeHost class="reference-code-host"></div>
    </div>
  `,
  styles: `
    .reference-code-example {
      --syntax-keyword: #c4b5fd;
      --syntax-string: #fda4af;
      --syntax-literal: #86efac;
      --syntax-property: #93c5fd;
      --syntax-name: #e6e8ec;
      --syntax-comment: #a9b0bc;
      overflow: hidden;
      border: 1px solid var(--color-border-strong);
      border-radius: var(--radius-medium);
      background: var(--color-code-background);
    }

    .code-example-toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      align-items: center;
      justify-content: space-between;
      padding: 0.55rem 0.7rem;
      border-bottom: 1px solid var(--color-border-strong);
      background: var(--color-surface-muted);
      color: var(--color-text);
      font-size: 0.82rem;
      font-weight: 800;
    }

    reference-code-example .cm-editor {
      max-height: 30rem;
      background: var(--color-code-background);
      color: var(--color-code-text);
      font-size: 0.84rem;
    }

    reference-code-example .cm-gutters {
      border-right-color: var(--color-border-strong);
      background: var(--color-code-surface);
      color: var(--color-code-muted);
    }

    reference-code-example .cm-scroller {
      overflow: auto;
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    }

    reference-code-example .cm-content {
      caret-color: transparent;
    }

    reference-code-example .cm-editor.cm-focused {
      outline: 3px solid var(--color-focus);
      outline-offset: -3px;
    }
  `,
})
export class ReferenceCodeExampleComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) label = '';
  @Input({ required: true }) language: ReferenceCodeLanguage = 'typescript';
  @Input({ required: true }) source = '';

  @ViewChild('codeHost', { static: true })
  private readonly codeHost?: ElementRef<HTMLElement>;

  private editorView: EditorView | undefined;

  ngAfterViewInit(): void {
    const parent = this.codeHost?.nativeElement;
    if (parent === undefined) return;
    this.editorView = new EditorView({
      parent,
      doc: this.source,
      extensions: [
        basicSetup,
        this.language === 'typescript'
          ? javascript({ typescript: true })
          : html(),
        referenceSyntaxTheme,
        EditorView.editable.of(false),
        EditorView.lineWrapping,
        EditorView.contentAttributes.of({
          'aria-label': `${this.label} code`,
          'aria-readonly': 'true',
        }),
      ],
    });
  }

  ngOnDestroy(): void {
    this.editorView?.destroy();
    this.editorView = undefined;
  }
}
