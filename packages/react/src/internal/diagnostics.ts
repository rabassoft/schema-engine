// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import type { Diagnostic } from '@rabassoft/schema-engine';

export const EMPTY_DIAGNOSTICS: readonly [] = Object.freeze([]);

export function actualType(value: unknown): string {
  if (value === null) return 'null';
  try {
    if (Array.isArray(value)) return 'array';
  } catch {
    return 'object';
  }
  return typeof value;
}

export function adapterDiagnostic(
  code: string,
  severity: 'warning' | 'error',
  parameters: Readonly<Record<string, unknown>>,
  fallbackMessage: string,
  dataPath?: readonly (string | number)[],
): Diagnostic {
  return Object.freeze({
    code,
    severity,
    source: 'runtime',
    ...(dataPath === undefined
      ? {}
      : { dataPath: Object.freeze([...dataPath]) }),
    parameters: Object.freeze({ ...parameters }),
    fallbackMessage,
  });
}

export function freezeDiagnostics(
  diagnostics: readonly Diagnostic[],
): readonly Diagnostic[] {
  if (diagnostics.length === 0) return EMPTY_DIAGNOSTICS;
  return Object.freeze([...diagnostics]);
}
