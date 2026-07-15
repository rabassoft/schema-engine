// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import {
  Injectable,
  InjectionToken,
  inject,
  makeEnvironmentProviders,
  type EnvironmentProviders,
  type InputSignal,
  type OutputEmitterRef,
  type Provider,
  type Type,
} from '@angular/core';
import type {
  Diagnostic,
  FieldDefinition,
  FieldTemplate,
  FieldRuntimeSnapshot,
} from '@rabassoft/schema-engine';
import type { AngularFieldTextSnapshot } from './text.js';

export interface AngularFieldRenderer {
  readonly field: InputSignal<FieldDefinition | FieldTemplate>;
  readonly snapshot: InputSignal<FieldRuntimeSnapshot>;
  readonly formId: InputSignal<string>;
  readonly locale: InputSignal<string>;
  readonly texts: InputSignal<AngularFieldTextSnapshot>;
  readonly setValue: OutputEmitterRef<unknown>;
  readonly removeValue: OutputEmitterRef<void>;
  readonly fieldFocus: OutputEmitterRef<void>;
  readonly fieldBlur: OutputEmitterRef<void>;
  readonly rendererDiagnostics: OutputEmitterRef<readonly Diagnostic[]>;
}

export type AngularRendererType = Type<AngularFieldRenderer>;
export type RendererTester = (
  field: FieldDefinition | FieldTemplate,
) => number | null;

export interface AngularRendererRegistration {
  readonly id: string;
  readonly renderer: AngularRendererType;
  readonly tester: RendererTester;
  readonly priority?: number;
}

export type RendererResolutionResult =
  | {
      readonly success: true;
      readonly registration: AngularRendererRegistration;
      readonly diagnostics: readonly Diagnostic[];
    }
  | { readonly success: false; readonly diagnostics: readonly Diagnostic[] };

export const SCHEMA_RENDERER_REGISTRATIONS = new InjectionToken<
  readonly AngularRendererRegistration[]
>('SCHEMA_RENDERER_REGISTRATIONS');

export function provideSchemaRenderer(
  registration: AngularRendererRegistration,
): Provider {
  return {
    provide: SCHEMA_RENDERER_REGISTRATIONS,
    multi: true,
    useValue: registration,
  };
}

export function provideSchemaEngineAngular(
  ...registrations: readonly AngularRendererRegistration[]
): EnvironmentProviders {
  return makeEnvironmentProviders([
    AngularRendererResolver,
    ...registrations.map((registration) => provideSchemaRenderer(registration)),
  ]);
}

@Injectable()
export class AngularRendererResolver {
  readonly ready: boolean;
  readonly configurationDiagnostics: readonly Diagnostic[];
  private readonly registrations: readonly AngularRendererRegistration[];

  constructor() {
    const injected = inject(SCHEMA_RENDERER_REGISTRATIONS, { optional: true });
    const raw: readonly unknown[] = injected ?? [];
    const parsed = validateRegistrations(raw);
    this.ready = parsed.diagnostics.length === 0;
    this.configurationDiagnostics = parsed.diagnostics;
    this.registrations = this.ready ? parsed.registrations : Object.freeze([]);
    Object.freeze(this);
  }

  resolve(field: FieldDefinition | FieldTemplate): RendererResolutionResult {
    if (!this.ready) {
      return Object.freeze({
        success: false,
        diagnostics: this.configurationDiagnostics,
      });
    }

    const diagnostics: Diagnostic[] = [];
    let selected:
      | {
          readonly registration: AngularRendererRegistration;
          readonly rank: number;
          readonly priority: number;
          readonly index: number;
        }
      | undefined;

    this.registrations.forEach((registration, index) => {
      let rank: unknown;
      try {
        rank = registration.tester(field);
      } catch {
        diagnostics.push(
          adapterDiagnostic(
            'RENDERER_TESTER_EXCEPTION',
            'warning',
            { id: registration.id, index },
            'Renderer tester threw an exception.',
          ),
        );
        return;
      }
      if (rank === null) return;
      if (!Number.isInteger(rank) || typeof rank !== 'number' || rank < 0) {
        diagnostics.push(
          adapterDiagnostic(
            'INVALID_RENDERER_TEST_RESULT',
            'warning',
            {
              id: registration.id,
              index,
              ...safeActual(rank),
            },
            'Renderer tester returned an invalid rank.',
          ),
        );
        return;
      }
      const priority = registration.priority ?? 0;
      if (
        selected === undefined ||
        rank > selected.rank ||
        (rank === selected.rank && priority > selected.priority)
      ) {
        selected = { registration, rank, priority, index };
      }
    });

    if (selected === undefined) {
      const path = 'path' in field ? field.path : undefined;
      diagnostics.push(
        adapterDiagnostic(
          'NO_RENDERER_MATCH',
          'error',
          {
            field: field.name,
            ...('path' in field
              ? { path: Object.freeze([...field.path]) }
              : { relativePath: Object.freeze([...field.relativePath]) }),
          },
          `No renderer matches field "${field.name}".`,
          path,
        ),
      );
      return Object.freeze({
        success: false,
        diagnostics: Object.freeze(diagnostics),
      });
    }
    return Object.freeze({
      success: true,
      registration: selected.registration,
      diagnostics: Object.freeze(diagnostics),
    });
  }
}

function validateRegistrations(raw: readonly unknown[]): {
  readonly registrations: readonly AngularRendererRegistration[];
  readonly diagnostics: readonly Diagnostic[];
} {
  const registrations: AngularRendererRegistration[] = [];
  const diagnostics: Diagnostic[] = [];
  const ids = new Map<string, number>();
  raw.forEach((value, index) => {
    if (!isRecord(value)) {
      diagnostics.push(
        invalidRegistration(
          index,
          'registration',
          'object',
          'registration-not-object',
        ),
      );
      return;
    }
    const id = ownValue(value, 'id');
    const renderer = ownValue(value, 'renderer');
    const tester = ownValue(value, 'tester');
    const priority = ownValue(value, 'priority');
    if (typeof id !== 'string' || id.length === 0) {
      diagnostics.push(
        invalidRegistration(
          index,
          'id',
          'non-empty string',
          ownReason(value, 'id', 'invalid-id'),
        ),
      );
      return;
    }
    if (typeof renderer !== 'function') {
      diagnostics.push(
        invalidRegistration(
          index,
          'renderer',
          'Angular component type',
          ownReason(value, 'renderer', 'invalid-renderer'),
        ),
      );
      return;
    }
    if (typeof tester !== 'function') {
      diagnostics.push(
        invalidRegistration(
          index,
          'tester',
          'callable tester',
          ownReason(value, 'tester', 'invalid-tester'),
        ),
      );
      return;
    }
    if (
      priority !== undefined &&
      (!Number.isInteger(priority) || typeof priority !== 'number')
    ) {
      diagnostics.push(
        invalidRegistration(
          index,
          'priority',
          'finite integer',
          ownReason(value, 'priority', 'invalid-priority'),
        ),
      );
      return;
    }
    const first = ids.get(id);
    if (first !== undefined) {
      diagnostics.push(
        adapterDiagnostic(
          'DUPLICATE_RENDERER_ID',
          'error',
          { id, firstIndex: first, duplicateIndex: index },
          `Renderer id "${id}" is duplicated.`,
        ),
      );
      return;
    }
    ids.set(id, index);
    registrations.push(
      Object.freeze({
        id,
        renderer: renderer as AngularRendererType,
        tester: tester as RendererTester,
        ...(priority === undefined ? {} : { priority }),
      }),
    );
  });
  return {
    registrations: Object.freeze(registrations),
    diagnostics: Object.freeze(diagnostics),
  };
}

function invalidRegistration(
  index: number,
  member: string,
  expected: string,
  reason: string,
): Diagnostic {
  return adapterDiagnostic(
    'INVALID_RENDERER_REGISTRATION',
    'error',
    { index, member, expected, reason },
    `Renderer registration member "${member}" is invalid.`,
  );
}

function ownReason(value: object, key: PropertyKey, invalid: string): string {
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  return descriptor === undefined
    ? 'missing-member'
    : 'value' in descriptor
      ? invalid
      : 'accessor-member';
}

function ownValue(value: object, key: PropertyKey): unknown {
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  return descriptor !== undefined && 'value' in descriptor
    ? descriptor.value
    : undefined;
}

function isRecord(value: unknown): value is object {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function adapterDiagnostic(
  code: string,
  severity: 'warning' | 'error',
  parameters: Readonly<Record<string, unknown>>,
  fallbackMessage: string,
  dataPath?: readonly (string | number)[],
): Diagnostic {
  const safeParameters = Object.freeze({ ...parameters });
  const diagnostic: Diagnostic = {
    code,
    severity,
    source: 'runtime',
    ...(dataPath === undefined
      ? {}
      : { dataPath: Object.freeze([...dataPath]) }),
    parameters: safeParameters,
    fallbackMessage,
  };
  return Object.freeze(diagnostic);
}

function safeActual(value: unknown): Readonly<Record<string, unknown>> {
  const actualType =
    value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
  return value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value))
    ? { actualType, actualValue: value }
    : { actualType };
}

export { adapterDiagnostic };
