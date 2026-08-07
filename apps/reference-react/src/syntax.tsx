// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import { typescriptLanguage } from '@codemirror/lang-javascript';
import { jsonLanguage } from '@codemirror/lang-json';
import { classHighlighter, highlightTree } from '@lezer/highlight';
import { Fragment, type ReactElement, type ReactNode } from 'react';

export function HighlightedCode({
  source,
  language,
}: {
  readonly source: string;
  readonly language: 'json' | 'typescript';
}): ReactElement {
  const tree =
    language === 'json'
      ? jsonLanguage.parser.parse(source)
      : typescriptLanguage.parser.parse(source);
  const nodes: ReactNode[] = [];
  let position = 0;
  let key = 0;
  highlightTree(tree, classHighlighter, (from, to, classes) => {
    if (from > position)
      nodes.push(
        <Fragment key={key++}>{source.slice(position, from)}</Fragment>,
      );
    nodes.push(
      <span className={classes} key={key++}>
        {source.slice(from, to)}
      </span>,
    );
    position = to;
  });
  if (position < source.length)
    nodes.push(<Fragment key={key}>{source.slice(position)}</Fragment>);
  return (
    <pre>
      <code data-language={language}>{nodes}</code>
    </pre>
  );
}

export function serializeEvidence(value: unknown): string {
  return JSON.stringify(value, undefined, 2) ?? 'undefined';
}

export async function copyText(value: string): Promise<boolean> {
  if (navigator.clipboard?.writeText === undefined) return false;
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}
