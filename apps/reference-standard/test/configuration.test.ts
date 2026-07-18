// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import { describe, expect, it } from 'vitest';

import {
  emptyDraftResult,
  evaluateDraft,
  prepareConfiguration,
} from '../src/configuration.js';

describe('Standard configuration evaluation', () => {
  it('copies, formats and freezes authored input without retaining it', () => {
    const input = { schema: { type: 'object', properties: {} } };
    const prepared = prepareConfiguration(input);

    expect(prepared.input).not.toBe(input);
    expect(prepared.schemaText).toBe(
      '{\n  "type": "object",\n  "properties": {}\n}',
    );
    expect(prepared.uiSchemaText).toBe('{}');
    expect(Object.isFrozen(prepared.input)).toBe(true);
    expect(Object.isFrozen(prepared.input.schema)).toBe(true);
    expect(emptyDraftResult()).toEqual({
      status: 'unvalidated',
      syntaxIssues: [],
      diagnostics: [],
    });
  });

  it('reports each JSON document independently without compiling', () => {
    const result = evaluateDraft('{', '[', {
      schema: { type: 'object', properties: {} },
    });

    expect(result.success).toBe(false);
    expect(result.result).toEqual({
      status: 'invalid-json',
      syntaxIssues: [
        { document: 'schema', message: 'Invalid JSON syntax.' },
        { document: 'ui-schema', message: 'Invalid JSON syntax.' },
      ],
      diagnostics: [],
    });
  });

  it('preserves compiler diagnostics and the exact validated draft pair', () => {
    const failed = evaluateDraft('null', '{}', {
      schema: { type: 'object', properties: {} },
    });
    expect(failed.success).toBe(false);
    expect(failed.result.status).toBe('compile-failed');
    expect(failed.result.diagnostics.length).toBeGreaterThan(0);

    const schemaText = '{"type":"object","properties":{}}';
    const uiSchemaText = '{}';
    const valid = evaluateDraft(schemaText, uiSchemaText, {
      schema: { type: 'object', properties: {} },
    });
    expect(valid.success).toBe(true);
    if (!valid.success) return;
    expect(valid.configuration).toMatchObject({ schemaText, uiSchemaText });
    expect(valid.result.status).toBe('valid');
    expect(Object.isFrozen(valid.configuration.input)).toBe(true);
  });
});
