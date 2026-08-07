// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import type {
  Diagnostic,
  FieldDefinition,
  FieldTemplate,
} from '@rabassoft/schema-engine';
import type {
  ReactRendererComponent,
  ReactRendererRegistration,
  ReactRendererRegistry,
  ReactRendererRegistryResult,
  ReactRendererTester,
} from '../contracts.js';
import {
  actualType,
  adapterDiagnostic,
  EMPTY_DIAGNOSTICS,
  freezeDiagnostics,
} from './diagnostics.js';
import { internalReactRendererRegistryBrand } from './registry-brand.js';
import { NATIVE_REACT_RENDERER_REGISTRATIONS } from './native/registrations.js';

export interface InternalRendererRegistration {
  readonly id: string;
  readonly component: ReactRendererComponent;
  readonly tester: ReactRendererTester;
  readonly priority: number;
  readonly index: number;
}

interface RegistryData {
  readonly registrations: readonly InternalRendererRegistration[];
}

export interface RendererResolution {
  readonly registration?: InternalRendererRegistration;
  readonly diagnostics: readonly Diagnostic[];
}

export const internalReactRendererRegistries = new WeakMap<
  object,
  RegistryData
>();

const EMPTY_REGISTRATIONS: readonly ReactRendererRegistration[] = Object.freeze(
  [],
);

export function createReactRendererRegistry(
  registrations: readonly ReactRendererRegistration[] = EMPTY_REGISTRATIONS,
): ReactRendererRegistryResult {
  return createRegistry(registrations);
}

export function createReactNativeRendererRegistry(
  additionalRegistrations: readonly ReactRendererRegistration[] = EMPTY_REGISTRATIONS,
): ReactRendererRegistryResult {
  return createRegistry(
    additionalRegistrations,
    NATIVE_REACT_RENDERER_REGISTRATIONS,
  );
}

function createRegistry(
  input: unknown,
  trustedPrefix: readonly ReactRendererRegistration[] = EMPTY_REGISTRATIONS,
): ReactRendererRegistryResult {
  const structural: Diagnostic[] = [];
  const duplicates: Diagnostic[] = [];
  const entries = denseEntries(input, structural, trustedPrefix.length);
  const registrations: InternalRendererRegistration[] = [];
  const firstIds = new Map<string, number>();

  for (let index = 0; index < trustedPrefix.length; index += 1) {
    const registration = trustedPrefix[index];
    if (registration === undefined) continue;
    const parsed = Object.freeze({
      id: registration.id,
      component: registration.component,
      tester: registration.tester,
      priority: registration.priority ?? 0,
      index,
    });
    registrations.push(parsed);
    firstIds.set(parsed.id, index);
  }

  for (const [index, candidate] of entries) {
    const parsed = parseRegistration(candidate, index, structural);
    if (parsed === undefined) continue;
    registrations.push(parsed);
    const firstIndex = firstIds.get(parsed.id);
    if (firstIndex === undefined) firstIds.set(parsed.id, index);
    else
      duplicates.push(
        adapterDiagnostic(
          'DUPLICATE_RENDERER_ID',
          'error',
          { id: parsed.id, firstIndex, duplicateIndex: index },
          `React renderer id "${parsed.id}" is duplicated.`,
        ),
      );
  }

  const diagnostics = freezeDiagnostics([...structural, ...duplicates]);
  if (diagnostics.length > 0)
    return Object.freeze({
      success: false,
      diagnostics: diagnostics as readonly [Diagnostic, ...Diagnostic[]],
    });

  const registryCandidate = {} as ReactRendererRegistry;
  Object.defineProperty(registryCandidate, internalReactRendererRegistryBrand, {
    value: true,
    enumerable: false,
  });
  const registry = Object.freeze(registryCandidate);
  internalReactRendererRegistries.set(
    registry,
    Object.freeze({ registrations: Object.freeze(registrations) }),
  );
  return Object.freeze({
    success: true,
    registry,
    diagnostics: EMPTY_DIAGNOSTICS,
  });
}

function denseEntries(
  input: unknown,
  diagnostics: Diagnostic[],
  indexOffset = 0,
): readonly (readonly [number, unknown])[] {
  if (!safeIsArray(input)) {
    diagnostics.push(
      invalidRegistration(
        -1,
        'registration',
        'dense own-data array',
        'invalid-value',
      ),
    );
    return [];
  }
  const lengthDescriptor = safeOwnDescriptor(input, 'length');
  if (
    lengthDescriptor === undefined ||
    !('value' in lengthDescriptor) ||
    !Number.isSafeInteger(lengthDescriptor.value) ||
    lengthDescriptor.value < 0
  ) {
    diagnostics.push(
      invalidRegistration(
        -1,
        'registration',
        'dense own-data array',
        'invalid-value',
      ),
    );
    return [];
  }
  const entries: (readonly [number, unknown])[] = [];
  for (
    let localIndex = 0;
    localIndex < lengthDescriptor.value;
    localIndex += 1
  ) {
    const index = indexOffset + localIndex;
    const descriptor = safeOwnDescriptor(input, String(localIndex));
    if (descriptor === undefined) {
      diagnostics.push(
        invalidRegistration(
          index,
          'registration',
          'own data entry',
          'sparse-entry',
        ),
      );
      continue;
    }
    if (!('value' in descriptor)) {
      diagnostics.push(
        invalidRegistration(
          index,
          'registration',
          'own data entry',
          'accessor-entry',
        ),
      );
      continue;
    }
    entries.push(Object.freeze([index, descriptor.value]));
  }
  return entries;
}

function parseRegistration(
  candidate: unknown,
  index: number,
  diagnostics: Diagnostic[],
): InternalRendererRegistration | undefined {
  if (!isObject(candidate)) {
    diagnostics.push(
      invalidRegistration(
        index,
        'registration',
        'non-null object',
        'invalid-value',
      ),
    );
    return undefined;
  }
  const id = member(candidate, index, 'id', 'non-blank string', diagnostics);
  const component = member(
    candidate,
    index,
    'component',
    'callable component',
    diagnostics,
  );
  const tester = member(
    candidate,
    index,
    'tester',
    'callable tester',
    diagnostics,
  );
  const priorityEntry = safeOwnDescriptor(candidate, 'priority');
  let priority = 0;
  if (priorityEntry !== undefined) {
    if (!('value' in priorityEntry))
      diagnostics.push(
        invalidRegistration(
          index,
          'priority',
          'finite integer or undefined',
          'accessor-member',
        ),
      );
    else if (
      priorityEntry.value !== undefined &&
      (typeof priorityEntry.value !== 'number' ||
        !Number.isFinite(priorityEntry.value) ||
        !Number.isInteger(priorityEntry.value))
    )
      diagnostics.push(
        invalidRegistration(
          index,
          'priority',
          'finite integer or undefined',
          'invalid-value',
        ),
      );
    else if (typeof priorityEntry.value === 'number')
      priority = priorityEntry.value;
  }

  const validId = typeof id === 'string' && id.trim().length > 0;
  if (
    !validId ||
    typeof component !== 'function' ||
    typeof tester !== 'function'
  )
    return undefined;
  if (
    priorityEntry !== undefined &&
    (!('value' in priorityEntry) ||
      (priorityEntry.value !== undefined &&
        (typeof priorityEntry.value !== 'number' ||
          !Number.isFinite(priorityEntry.value) ||
          !Number.isInteger(priorityEntry.value))))
  )
    return undefined;
  return Object.freeze({
    id,
    component: component as ReactRendererComponent,
    tester: tester as ReactRendererTester,
    priority,
    index,
  });
}

function member(
  candidate: object,
  index: number,
  name: 'id' | 'component' | 'tester',
  expected: string,
  diagnostics: Diagnostic[],
): unknown {
  const descriptor = safeOwnDescriptor(candidate, name);
  if (descriptor === undefined) {
    diagnostics.push(
      invalidRegistration(index, name, expected, 'missing-member'),
    );
    return undefined;
  }
  if (!('value' in descriptor)) {
    diagnostics.push(
      invalidRegistration(index, name, expected, 'accessor-member'),
    );
    return undefined;
  }
  const valid =
    name === 'id'
      ? typeof descriptor.value === 'string' &&
        descriptor.value.trim().length > 0
      : typeof descriptor.value === 'function';
  if (!valid)
    diagnostics.push(
      invalidRegistration(index, name, expected, 'invalid-value'),
    );
  return descriptor.value;
}

function invalidRegistration(
  index: number,
  memberName: string,
  expected: string,
  reason: string,
): Diagnostic {
  return adapterDiagnostic(
    'INVALID_RENDERER_REGISTRATION',
    'error',
    { index, member: memberName, expected, reason },
    `React renderer registration member "${memberName}" is invalid.`,
  );
}

export function resolveReactRenderer(
  registry: ReactRendererRegistry,
  field: FieldDefinition | FieldTemplate,
): RendererResolution {
  const data = internalReactRendererRegistries.get(registry);
  if (data === undefined)
    return Object.freeze({ diagnostics: EMPTY_DIAGNOSTICS });
  const diagnostics: Diagnostic[] = [];
  let selected: InternalRendererRegistration | undefined;
  let selectedRank = -1;
  for (const registration of data.registrations) {
    let rank: unknown;
    try {
      rank = registration.tester(field);
    } catch {
      diagnostics.push(
        adapterDiagnostic(
          'RENDERER_TESTER_EXCEPTION',
          'warning',
          { id: registration.id, index: registration.index },
          'React renderer tester threw an exception.',
        ),
      );
      continue;
    }
    if (rank === null) continue;
    if (
      typeof rank !== 'number' ||
      !Number.isFinite(rank) ||
      !Number.isInteger(rank) ||
      rank < 0
    ) {
      diagnostics.push(invalidTesterResult(registration, rank));
      continue;
    }
    if (
      selected === undefined ||
      rank > selectedRank ||
      (rank === selectedRank && registration.priority > selected.priority)
    ) {
      selected = registration;
      selectedRank = rank;
    }
  }
  return Object.freeze({
    ...(selected === undefined ? {} : { registration: selected }),
    diagnostics: freezeDiagnostics(diagnostics),
  });
}

function invalidTesterResult(
  registration: InternalRendererRegistration,
  value: unknown,
): Diagnostic {
  const retain =
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value));
  return adapterDiagnostic(
    'INVALID_RENDERER_TEST_RESULT',
    'warning',
    {
      id: registration.id,
      index: registration.index,
      actualType: actualType(value),
      ...(retain ? { actualValue: value } : {}),
    },
    'React renderer tester returned an invalid rank.',
  );
}

function safeOwnDescriptor(
  candidate: object,
  member: PropertyKey,
): PropertyDescriptor | undefined {
  try {
    return Object.getOwnPropertyDescriptor(candidate, member);
  } catch {
    return undefined;
  }
}

function isObject(value: unknown): value is object {
  return (
    (typeof value === 'object' && value !== null) || typeof value === 'function'
  );
}

function safeIsArray(value: unknown): value is readonly unknown[] {
  try {
    return Array.isArray(value);
  } catch {
    return false;
  }
}
