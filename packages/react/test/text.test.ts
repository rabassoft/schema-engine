// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import type {
  FieldRuntimeSnapshot,
  StringFieldDefinition,
  TextResolutionContext,
} from '@rabassoft/schema-engine';
import { describe, expect, it, vi } from 'vitest';
import type { InternalReactHandleContext } from '../src/internal/controller.js';
import { projectFieldText } from '../src/internal/text.js';

const field: StringFieldDefinition = Object.freeze({
  key: 'role',
  name: 'role',
  path: Object.freeze(['role']),
  required: true,
  label: 'Role',
  description: 'Role description',
  hint: 'Role hint',
  tooltip: 'Role tooltip',
  kind: 'string',
  nullable: true,
  placeholder: 'Choose role',
  fixedValue: 'admin',
  constraints: Object.freeze({}),
  choices: Object.freeze([
    Object.freeze({ value: 'admin', label: 'Administrator' }),
    Object.freeze({ value: 'reader', label: 'Reader' }),
  ]),
});

const snapshot: FieldRuntimeSnapshot = Object.freeze({
  nodeKind: 'field',
  key: field.key,
  path: field.path,
  presence: Object.freeze({ kind: 'value', value: 'admin' }),
  dirty: false,
  touched: true,
  focused: false,
  visible: true,
  enabled: true,
  valid: false,
  issues: Object.freeze([
    Object.freeze({
      code: 'first-issue',
      path: field.path,
      parameters: Object.freeze({}),
      fallbackMessage: 'First issue',
    }),
    Object.freeze({
      code: 'second-issue',
      path: field.path,
      parameters: Object.freeze({}),
    }),
  ]),
  showIssues: true,
});

describe('React field text projection', () => {
  it('preserves exact member/choice/issue order, frozen contexts and hostile fallbacks', () => {
    const contexts: TextResolutionContext[] = [];
    const resolve = vi.fn((source: string, context: TextResolutionContext) => {
      expect(Object.isFrozen(context)).toBe(true);
      contexts.push(context);
      if (context.member === 'clear') return '   ';
      if (context.member === 'choice' && context.choice.value === 'reader')
        return 7 as never;
      if (context.member === 'issue' && context.issue.code === 'first-issue')
        throw new Error('hostile resolver');
      return `resolved:${source}`;
    });
    const context: InternalReactHandleContext = Object.freeze({
      epochId: 1,
      projectionGeneration: 1,
      formId: 'form',
      locale: 'es',
      definition: undefined,
      resolveText: resolve,
      reportDiagnostics: vi.fn(),
      isCurrent: () => true,
    });

    const result = projectFieldText(field, snapshot, context);

    expect(contexts.map((entry) => entry.member)).toEqual([
      'label',
      'description',
      'hint',
      'tooltip',
      'placeholder',
      'clear',
      'set-null',
      'null-value',
      'fixed-missing',
      'fixed-unavailable',
      'fixed-incompatible',
      'choice',
      'choice',
      'missing-selection',
      'empty-selection',
      'issue',
      'issue',
    ]);
    expect(contexts.every((entry) => entry.formId === 'form')).toBe(true);
    expect(contexts.every((entry) => entry.locale === 'es')).toBe(true);
    expect(
      contexts.every((entry) => 'field' in entry && entry.field === field),
    ).toBe(true);
    expect(result.texts.clearLabel).toBe('Clear');
    expect(result.texts.choiceLabels).toEqual([
      'resolved:Administrator',
      'Reader',
    ]);
    expect(result.texts.issueMessages).toEqual([
      'First issue',
      'resolved:second-issue',
    ]);
    expect(result.diagnostics).toMatchObject([
      { parameters: { member: 'clear', reason: 'blank-string-result' } },
      {
        parameters: {
          member: 'choice',
          choiceValue: 'reader',
          reason: 'non-string-result',
        },
      },
      {
        parameters: {
          member: 'issue',
          issueCode: 'first-issue',
          reason: 'exception',
        },
      },
    ]);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.texts)).toBe(true);
    expect(Object.isFrozen(result.texts.choiceLabels)).toBe(true);
    expect(Object.isFrozen(result.texts.issueMessages)).toBe(true);
    expect(Object.isFrozen(result.diagnostics)).toBe(true);
  });

  it('does not resolve fixed labels for a non-fixed field', () => {
    const plain = Object.freeze(
      Object.fromEntries(
        Object.entries(field).filter(([member]) => member !== 'fixedValue'),
      ),
    ) as unknown as StringFieldDefinition;
    const members: string[] = [];
    projectFieldText(plain, snapshot, {
      epochId: 1,
      projectionGeneration: 1,
      formId: 'form',
      locale: 'en',
      definition: undefined,
      resolveText: (source, context) => {
        members.push(context.member);
        return source;
      },
      reportDiagnostics: vi.fn(),
      isCurrent: () => true,
    });
    expect(members).not.toContain('fixed-missing');
    expect(members).not.toContain('fixed-unavailable');
    expect(members).not.toContain('fixed-incompatible');
  });
});
