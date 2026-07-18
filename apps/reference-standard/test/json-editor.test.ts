// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import { describe, expect, it, vi } from 'vitest';

import { StandardJsonEditor } from '../src/json-editor.js';

describe('StandardJsonEditor', () => {
  it('owns a labelled JSON editor with controlled synchronization and cleanup', () => {
    const host = document.createElement('div');
    document.body.replaceChildren(host);
    const onChange = vi.fn();
    const editor = new StandardJsonEditor({
      host,
      label: 'JSON Schema editor',
      value: '{\n  "type": "object"\n}',
      onChange,
    });

    expect(editor.getValue()).toContain('"object"');
    expect(
      host
        .querySelector('[contenteditable="true"]')
        ?.getAttribute('aria-label'),
    ).toBe('JSON Schema editor');
    expect(host.querySelector('.cm-lineNumbers')).not.toBeNull();

    editor.setValue('{}');
    expect(editor.getValue()).toBe('{}');
    expect(onChange).not.toHaveBeenCalled();

    editor.focus();
    expect(document.activeElement).toBe(
      host.querySelector('[contenteditable="true"]'),
    );
    editor.destroy();
    editor.destroy();
    document.body.replaceChildren();
  });
});
