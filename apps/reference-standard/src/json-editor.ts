// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import { json } from '@codemirror/lang-json';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { basicSetup, EditorView } from 'codemirror';

const standardJsonSyntaxTheme = syntaxHighlighting(
  HighlightStyle.define([
    {
      tag: [tags.string, tags.special(tags.string)],
      color: 'var(--syntax-string)',
    },
    {
      tag: [tags.number, tags.bool, tags.null],
      color: 'var(--syntax-literal)',
    },
    {
      tag: tags.propertyName,
      color: 'var(--syntax-property)',
    },
    {
      tag: tags.invalid,
      color: 'var(--danger)',
      textDecoration: 'underline',
    },
  ]),
);

export interface StandardJsonEditorOptions {
  readonly host: HTMLElement;
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly describedBy?: string;
}

export class StandardJsonEditor {
  private readonly view: EditorView;
  private synchronizing = false;
  private disposed = false;

  constructor(options: StandardJsonEditorOptions) {
    const attributes: Record<string, string> = {
      'aria-label': options.label,
      spellcheck: 'false',
    };
    if (options.describedBy !== undefined) {
      attributes['aria-describedby'] = options.describedBy;
    }
    this.view = new EditorView({
      doc: options.value,
      extensions: [
        basicSetup,
        json(),
        standardJsonSyntaxTheme,
        EditorView.lineWrapping,
        EditorView.contentAttributes.of(attributes),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !this.disposed && !this.synchronizing) {
            options.onChange(update.state.doc.toString());
          }
        }),
      ],
      parent: options.host,
    });
  }

  getValue(): string {
    return this.view.state.doc.toString();
  }

  setValue(value: string): void {
    if (this.disposed || value === this.getValue()) return;
    this.synchronizing = true;
    try {
      this.view.dispatch({
        changes: { from: 0, to: this.view.state.doc.length, insert: value },
      });
    } finally {
      this.synchronizing = false;
    }
  }

  focus(): void {
    if (!this.disposed) this.view.focus();
  }

  destroy(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.view.destroy();
  }
}
