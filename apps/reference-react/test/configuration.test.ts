// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import { referenceScenarios } from '@schema-engine-internal/reference-scenarios';
import { describe, expect, it } from 'vitest';
import { evaluateDraft, prepareConfiguration } from '../src/configuration.js';

describe('React reference configuration drafts', () => {
  it('validates every original scenario and rejects syntax without applying it', () => {
    for (const scenario of referenceScenarios) {
      const prepared = prepareConfiguration(scenario.compileInput);
      expect(
        evaluateDraft(
          prepared.schemaText,
          prepared.uiSchemaText,
          prepared.input,
        ).success,
      ).toBe(true);
    }
    const prepared = prepareConfiguration(referenceScenarios[0]!.compileInput);
    expect(
      evaluateDraft('{', prepared.uiSchemaText, prepared.input),
    ).toMatchObject({
      success: false,
      result: { status: 'invalid-json', documents: ['schema'] },
    });
  });
});
