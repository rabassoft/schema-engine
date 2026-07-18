import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  copyText,
  renderHighlightedCode,
  serializeEvidence,
} from '../src/syntax.js';

describe('safe evidence presentation', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('serializes deterministically and renders JSON as text with token classes', () => {
    const source = serializeEvidence({
      markup: '<script>unsafe()</script>',
      n: 2,
    });
    const pre = renderHighlightedCode(source, 'json');

    expect(source).toBe(
      '{\n  "markup": "<script>unsafe()</script>",\n  "n": 2\n}',
    );
    expect(pre.textContent).toBe(source);
    expect(pre.querySelector('script')).toBeNull();
    expect(pre.querySelector('[class^="tok-"]')).not.toBeNull();
  });

  it('highlights TypeScript integration source', () => {
    const pre = renderHighlightedCode(
      'const answer: number = 42;',
      'typescript',
    );
    expect(pre.textContent).toBe('const answer: number = 42;');
    expect(pre.querySelectorAll('[class^="tok-"]').length).toBeGreaterThan(1);
  });

  it('reports clipboard success, absence and rejection', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    await expect(copyText('evidence')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('evidence');

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });
    await expect(copyText('evidence')).resolves.toBe(false);

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    });
    await expect(copyText('evidence')).resolves.toBe(false);
  });
});
