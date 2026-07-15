// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import type { DataPath, Diagnostic, DocumentPath } from '../contracts.js';

export interface DiagnosticInput {
  readonly code: string;
  readonly severity: 'warning' | 'error';
  readonly source: 'schema' | 'ui-schema' | 'runtime';
  readonly dataPath?: DataPath;
  readonly documentPath?: DocumentPath;
  readonly parameters?: Readonly<Record<string, unknown>>;
  readonly fallbackMessage: string;
}

export function diagnostic(input: DiagnosticInput): Diagnostic {
  return {
    code: input.code,
    severity: input.severity,
    source: input.source,
    ...(input.dataPath === undefined ? {} : { dataPath: [...input.dataPath] }),
    ...(input.documentPath === undefined
      ? {}
      : { documentPath: [...input.documentPath] }),
    parameters: { ...input.parameters },
    fallbackMessage: input.fallbackMessage,
  };
}

export function hasErrors(diagnostics: readonly Diagnostic[]): boolean {
  return diagnostics.some(({ severity }) => severity === 'error');
}
