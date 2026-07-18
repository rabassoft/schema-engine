// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import { typescriptLanguage } from '@codemirror/lang-javascript';
import { jsonLanguage } from '@codemirror/lang-json';
import { classHighlighter, highlightTree } from '@lezer/highlight';

export type DisplayLanguage = 'json' | 'typescript';

export function renderHighlightedCode(
  source: string,
  language: DisplayLanguage,
): HTMLPreElement {
  const pre = document.createElement('pre');
  const code = document.createElement('code');
  code.dataset['language'] = language;
  const tree =
    language === 'json'
      ? jsonLanguage.parser.parse(source)
      : typescriptLanguage.parser.parse(source);
  let position = 0;
  highlightTree(tree, classHighlighter, (from, to, classes) => {
    if (from > position) code.append(source.slice(position, from));
    const span = document.createElement('span');
    span.className = classes;
    span.textContent = source.slice(from, to);
    code.append(span);
    position = to;
  });
  if (position < source.length) code.append(source.slice(position));
  pre.append(code);
  return pre;
}

export function serializeEvidence(value: unknown): string {
  const serialized = JSON.stringify(value, undefined, 2);
  return serialized ?? 'undefined';
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
