// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import { readOwnDataMember } from './path.js';
import { actualType } from './value.js';

export type DenseStringArrayDefect = {
  readonly reason: 'sparse-array' | 'array-index-accessor' | 'array-item-type';
  readonly index: number;
  readonly actualType: string;
};

export type DenseStringArrayInspection =
  | { readonly success: true }
  | { readonly success: false; readonly defect?: DenseStringArrayDefect };

export function inspectDenseStringArray(
  value: unknown,
): DenseStringArrayInspection {
  if (!Array.isArray(value)) return { success: false };
  for (let index = 0; index < value.length; index += 1) {
    const member = readOwnDataMember(value, String(index));
    if (member.kind === 'missing') {
      return {
        success: false,
        defect: { reason: 'sparse-array', index, actualType: 'missing' },
      };
    }
    if (member.kind === 'accessor') {
      return {
        success: false,
        defect: {
          reason: 'array-index-accessor',
          index,
          actualType: 'accessor',
        },
      };
    }
    if (typeof member.value !== 'string') {
      return {
        success: false,
        defect: {
          reason: 'array-item-type',
          index,
          actualType: actualType(member.value),
        },
      };
    }
  }
  return { success: true };
}

export function detachDenseStringArray(value: unknown):
  | { readonly success: true; readonly value: readonly string[] }
  | {
      readonly success: false;
      readonly defect?: DenseStringArrayDefect;
    } {
  if (!Array.isArray(value)) return { success: false };
  const copy: string[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const member = readOwnDataMember(value, String(index));
    if (member.kind === 'missing') {
      return {
        success: false,
        defect: { reason: 'sparse-array', index, actualType: 'missing' },
      };
    }
    if (member.kind === 'accessor') {
      return {
        success: false,
        defect: {
          reason: 'array-index-accessor',
          index,
          actualType: 'accessor',
        },
      };
    }
    if (typeof member.value !== 'string') {
      return {
        success: false,
        defect: {
          reason: 'array-item-type',
          index,
          actualType: actualType(member.value),
        },
      };
    }
    copy.push(member.value);
  }
  return { success: true, value: Object.freeze(copy) };
}

export function orderedDenseStringArraysEqual(
  left: unknown,
  right: unknown,
): boolean {
  if (!Array.isArray(left) || !Array.isArray(right)) return false;
  if (left.length !== right.length) return false;
  if (!inspectDenseStringArray(left).success) return false;
  if (!inspectDenseStringArray(right).success) return false;
  for (let index = 0; index < left.length; index += 1) {
    const leftMember = readOwnDataMember(left, String(index));
    const rightMember = readOwnDataMember(right, String(index));
    if (
      leftMember.kind !== 'value' ||
      rightMember.kind !== 'value' ||
      !Object.is(leftMember.value, rightMember.value)
    ) {
      return false;
    }
  }
  return true;
}
