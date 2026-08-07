// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import { json } from '@codemirror/lang-json';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { basicSetup, EditorView } from 'codemirror';
import { useLayoutEffect, useRef, type ReactElement } from 'react';

const jsonSyntaxTheme = syntaxHighlighting(
  HighlightStyle.define([
    {
      tag: [tags.string, tags.special(tags.string)],
      color: 'var(--syntax-string)',
    },
    {
      tag: [tags.number, tags.bool, tags.null],
      color: 'var(--syntax-literal)',
    },
    { tag: tags.propertyName, color: 'var(--syntax-property)' },
    { tag: tags.invalid, color: 'var(--danger)', textDecoration: 'underline' },
  ]),
);

export function JsonEditor({
  label,
  value,
  describedBy,
  onChange,
}: {
  readonly label: string;
  readonly value: string;
  readonly describedBy?: string;
  readonly onChange: (value: string) => void;
}): ReactElement {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | undefined>(undefined);
  const synchronizing = useRef(false);
  const change = useRef(onChange);
  change.current = onChange;

  useLayoutEffect(() => {
    if (host.current === null) return;
    const attributes: Record<string, string> = {
      'aria-label': label,
      spellcheck: 'false',
    };
    if (describedBy !== undefined) attributes['aria-describedby'] = describedBy;
    const editor = new EditorView({
      doc: value,
      extensions: [
        basicSetup,
        json(),
        jsonSyntaxTheme,
        EditorView.lineWrapping,
        EditorView.contentAttributes.of(attributes),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !synchronizing.current)
            change.current(update.state.doc.toString());
        }),
      ],
      parent: host.current,
    });
    view.current = editor;
    return () => {
      view.current = undefined;
      editor.destroy();
    };
  }, [describedBy, label]);

  useLayoutEffect(() => {
    const editor = view.current;
    if (editor === undefined || editor.state.doc.toString() === value) return;
    synchronizing.current = true;
    try {
      editor.dispatch({
        changes: { from: 0, to: editor.state.doc.length, insert: value },
      });
    } finally {
      synchronizing.current = false;
    }
  }, [value]);

  return <div className="json-editor" ref={host} />;
}
