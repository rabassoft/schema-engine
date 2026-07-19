// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import {
  Injectable,
  InjectionToken,
  inject,
  type InputSignal,
  type Provider,
  type Type,
} from '@angular/core';
import type {
  Diagnostic,
  PresentationAccordionDefinition,
  PresentationGridDefinition,
  PresentationGridItemDefinition,
  PresentationPanelDefinition,
  PresentationSectionDefinition,
  PresentationTabsDefinition,
} from '@rabassoft/schema-engine';

export type AngularPresentationContainerDefinition =
  | PresentationSectionDefinition
  | PresentationTabsDefinition
  | PresentationAccordionDefinition
  | PresentationGridDefinition;

export type AngularPresentationContainerRenderModel =
  | {
      readonly kind: 'section';
      readonly definition: PresentationSectionDefinition;
      readonly label: string;
      readonly legendId: string;
    }
  | {
      readonly kind: 'tabs';
      readonly definition: PresentationTabsDefinition;
      readonly label: string;
      readonly tablistId: string;
      readonly panels: readonly {
        readonly definition: PresentationPanelDefinition;
        readonly label: string;
        readonly tabId: string;
        readonly tabpanelId: string;
      }[];
    }
  | {
      readonly kind: 'accordion';
      readonly definition: PresentationAccordionDefinition;
      readonly label: string;
      readonly accordionId: string;
      readonly panels: readonly {
        readonly definition: PresentationPanelDefinition;
        readonly label: string;
        readonly triggerId: string;
        readonly regionId: string;
      }[];
    }
  | {
      readonly kind: 'grid';
      readonly definition: PresentationGridDefinition;
      readonly label: string;
      readonly gridId: string;
      readonly items: readonly {
        readonly definition: PresentationGridItemDefinition;
        readonly cellId: string;
      }[];
    };

export interface AngularPresentationContainerRenderer {
  readonly presentation: InputSignal<AngularPresentationContainerRenderModel>;
}

export type AngularPresentationContainerRendererType =
  Type<AngularPresentationContainerRenderer>;

export type AngularPresentationContainerTester = (
  definition: AngularPresentationContainerDefinition,
) => number | null;

export interface AngularPresentationContainerRegistration {
  readonly id: string;
  readonly renderer: AngularPresentationContainerRendererType;
  readonly tester: AngularPresentationContainerTester;
  readonly priority?: number;
}

/** @internal */
export const SCHEMA_PRESENTATION_CONTAINER_REGISTRATIONS = new InjectionToken<
  readonly AngularPresentationContainerRegistration[]
>('SCHEMA_PRESENTATION_CONTAINER_REGISTRATIONS');

export function provideSchemaPresentationContainer(
  registration: AngularPresentationContainerRegistration,
): Provider {
  return {
    provide: SCHEMA_PRESENTATION_CONTAINER_REGISTRATIONS,
    multi: true,
    useValue: registration,
  };
}

/** @internal */
export type PresentationContainerResolutionResult =
  | {
      readonly success: true;
      readonly registration: AngularPresentationContainerRegistration;
      readonly diagnostics: readonly Diagnostic[];
    }
  | { readonly success: false; readonly diagnostics: readonly Diagnostic[] };

/** @internal */
@Injectable()
export class AngularPresentationContainerResolver {
  readonly ready: boolean;
  readonly configurationDiagnostics: readonly Diagnostic[];
  private readonly registrations: readonly AngularPresentationContainerRegistration[];

  constructor() {
    const injected = inject(SCHEMA_PRESENTATION_CONTAINER_REGISTRATIONS, {
      optional: true,
    });
    const parsed = validatePresentationRegistrations(injected ?? []);
    this.ready = parsed.diagnostics.length === 0;
    this.configurationDiagnostics = parsed.diagnostics;
    this.registrations = this.ready ? parsed.registrations : Object.freeze([]);
    Object.freeze(this);
  }

  resolve(
    definition: AngularPresentationContainerDefinition,
  ): PresentationContainerResolutionResult {
    if (!this.ready) {
      return Object.freeze({
        success: false,
        diagnostics: this.configurationDiagnostics,
      });
    }

    const diagnostics: Diagnostic[] = [];
    let selected:
      | {
          readonly registration: AngularPresentationContainerRegistration;
          readonly rank: number;
          readonly priority: number;
        }
      | undefined;
    this.registrations.forEach((registration, index) => {
      let rank: unknown;
      try {
        rank = registration.tester(definition);
      } catch {
        diagnostics.push(
          presentationDiagnostic(
            'PRESENTATION_CONTAINER_TESTER_EXCEPTION',
            'warning',
            {
              index,
              id: registration.id,
              presentationKind: definition.kind,
              presentationId: definition.id,
            },
            'Presentation container tester threw an exception.',
          ),
        );
        return;
      }
      if (rank === null) return;
      if (
        typeof rank !== 'number' ||
        !Number.isFinite(rank) ||
        !Number.isInteger(rank) ||
        rank < 0
      ) {
        diagnostics.push(
          presentationDiagnostic(
            'INVALID_PRESENTATION_CONTAINER_TEST_RESULT',
            'warning',
            {
              index,
              id: registration.id,
              presentationKind: definition.kind,
              presentationId: definition.id,
              ...safeActual(rank),
            },
            'Presentation container tester returned an invalid rank.',
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
        selected = { registration, rank, priority };
      }
    });

    if (selected === undefined) {
      diagnostics.push(
        presentationDiagnostic(
          'NO_PRESENTATION_CONTAINER_MATCH',
          'error',
          {
            presentationKind: definition.kind,
            presentationId: definition.id,
          },
          'No presentation container renderer matches the definition.',
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

function validatePresentationRegistrations(raw: readonly unknown[]): {
  readonly registrations: readonly AngularPresentationContainerRegistration[];
  readonly diagnostics: readonly Diagnostic[];
} {
  const registrations: Array<{
    readonly index: number;
    readonly registration: AngularPresentationContainerRegistration;
  }> = [];
  const diagnostics: Diagnostic[] = [];
  raw.forEach((value, index) => {
    const inspected = inspectPresentationRegistration(value, index);
    if ('diagnostic' in inspected) diagnostics.push(inspected.diagnostic);
    else registrations.push({ index, registration: inspected.registration });
  });

  const firstIds = new Map<string, number>();
  for (const { index, registration } of registrations) {
    const firstIndex = firstIds.get(registration.id);
    if (firstIndex === undefined) firstIds.set(registration.id, index);
    else {
      diagnostics.push(
        presentationDiagnostic(
          'DUPLICATE_PRESENTATION_CONTAINER_RENDERER_ID',
          'error',
          { index, id: registration.id, firstIndex },
          'Presentation container renderer id is duplicated.',
        ),
      );
    }
  }

  return {
    registrations: Object.freeze(
      registrations.map(({ registration }) => registration),
    ),
    diagnostics: Object.freeze(diagnostics),
  };
}

function inspectPresentationRegistration(
  value: unknown,
  index: number,
):
  | { readonly registration: AngularPresentationContainerRegistration }
  | { readonly diagnostic: Diagnostic } {
  if (!isOrdinaryObject(value)) {
    return {
      diagnostic: invalidPresentationRegistration(
        index,
        'registration',
        'object',
        'registration-not-object',
      ),
    };
  }
  const id = ownMember(value, 'id');
  if (id.kind !== 'value')
    return invalidMemberState(index, 'id', 'non-empty string', id.kind);
  if (typeof id.value !== 'string' || id.value.length === 0) {
    return {
      diagnostic: invalidPresentationRegistration(
        index,
        'id',
        'non-empty string',
        'invalid-id',
      ),
    };
  }
  const renderer = ownMember(value, 'renderer');
  if (renderer.kind !== 'value')
    return invalidMemberState(
      index,
      'renderer',
      'Angular component type',
      renderer.kind,
    );
  if (typeof renderer.value !== 'function') {
    return {
      diagnostic: invalidPresentationRegistration(
        index,
        'renderer',
        'Angular component type',
        'invalid-renderer',
      ),
    };
  }
  const tester = ownMember(value, 'tester');
  if (tester.kind !== 'value')
    return invalidMemberState(index, 'tester', 'callable tester', tester.kind);
  if (typeof tester.value !== 'function') {
    return {
      diagnostic: invalidPresentationRegistration(
        index,
        'tester',
        'callable tester',
        'invalid-tester',
      ),
    };
  }
  const priority = ownMember(value, 'priority');
  if (priority.kind === 'accessor') {
    return {
      diagnostic: invalidPresentationRegistration(
        index,
        'priority',
        'finite integer',
        'member-accessor',
      ),
    };
  }
  if (
    priority.kind === 'value' &&
    (typeof priority.value !== 'number' ||
      !Number.isFinite(priority.value) ||
      !Number.isInteger(priority.value))
  ) {
    return {
      diagnostic: invalidPresentationRegistration(
        index,
        'priority',
        'finite integer',
        'invalid-priority',
      ),
    };
  }
  return {
    registration: Object.freeze({
      id: id.value,
      renderer: renderer.value as AngularPresentationContainerRendererType,
      tester: tester.value as AngularPresentationContainerTester,
      ...(priority.kind === 'value'
        ? { priority: priority.value as number }
        : {}),
    }),
  };
}

function invalidMemberState(
  index: number,
  member: string,
  expected: string,
  kind: 'missing' | 'accessor',
): { readonly diagnostic: Diagnostic } {
  return {
    diagnostic: invalidPresentationRegistration(
      index,
      member,
      expected,
      kind === 'missing' ? 'member-missing' : 'member-accessor',
    ),
  };
}

function invalidPresentationRegistration(
  index: number,
  member: string,
  expected: string,
  reason: string,
): Diagnostic {
  return presentationDiagnostic(
    'INVALID_PRESENTATION_CONTAINER_REGISTRATION',
    'error',
    { index, member, expected, reason },
    'Presentation container registration is invalid.',
  );
}

type OwnMember =
  | { readonly kind: 'missing' }
  | { readonly kind: 'accessor' }
  | { readonly kind: 'value'; readonly value: unknown };

function ownMember(value: object, key: PropertyKey): OwnMember {
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  if (descriptor === undefined) return { kind: 'missing' };
  return 'value' in descriptor
    ? { kind: 'value', value: descriptor.value }
    : { kind: 'accessor' };
}

function isOrdinaryObject(value: unknown): value is object {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    return false;
  const prototype = Reflect.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function presentationDiagnostic(
  code: string,
  severity: 'warning' | 'error',
  parameters: Readonly<Record<string, unknown>>,
  fallbackMessage: string,
): Diagnostic {
  return Object.freeze({
    code,
    severity,
    source: 'runtime',
    parameters: Object.freeze({ ...parameters }),
    fallbackMessage,
  });
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
