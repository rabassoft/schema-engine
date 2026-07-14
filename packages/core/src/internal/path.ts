import type { DataPath } from '../contracts.js';

export type OwnDataMember =
  | { readonly kind: 'missing' }
  | { readonly kind: 'accessor' }
  | { readonly kind: 'value'; readonly value: unknown };

export function readOwnDataMember(
  target: object,
  key: PropertyKey,
): OwnDataMember {
  const descriptor = Object.getOwnPropertyDescriptor(target, key);
  if (descriptor === undefined) return { kind: 'missing' };
  if (!('value' in descriptor)) return { kind: 'accessor' };
  return { kind: 'value', value: descriptor.value as unknown };
}

export function isOrdinaryObject(value: unknown): value is object {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const prototype = Reflect.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function copyStringDataPath(
  value: unknown,
  allowEmpty = false,
): readonly string[] | undefined {
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) {
    return undefined;
  }

  const result: string[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const member = readOwnDataMember(value, String(index));
    if (member.kind !== 'value' || typeof member.value !== 'string') {
      return undefined;
    }
    result.push(member.value);
  }
  return Object.freeze(result);
}

export function canonicalDataPathKey(path: readonly string[]): string {
  return JSON.stringify(path);
}

export function appendDataPath(
  parent: readonly string[],
  name: string,
): readonly string[] {
  return Object.freeze([...parent, name]);
}

export function sameDataPath(
  left: DataPath,
  right: readonly string[],
): boolean {
  return (
    left.length === right.length &&
    left.every((segment, index) => segment === right[index])
  );
}
