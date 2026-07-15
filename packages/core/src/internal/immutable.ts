// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

export function deepFreeze<T>(value: T): T {
  if (typeof value !== 'object' || value === null) {
    return value;
  }

  const seen = new Set<object>();
  const stack: Array<{ object: object; visited: boolean }> = [
    { object: value, visited: false },
  ];

  while (stack.length > 0) {
    const current = stack.pop();
    if (current === undefined || Object.isFrozen(current.object)) {
      continue;
    }

    if (current.visited) {
      Object.freeze(current.object);
      continue;
    }

    if (seen.has(current.object)) {
      continue;
    }
    seen.add(current.object);
    stack.push({ object: current.object, visited: true });

    for (const key of Reflect.ownKeys(current.object)) {
      const descriptor = Object.getOwnPropertyDescriptor(current.object, key);
      if (descriptor === undefined || !('value' in descriptor)) {
        continue;
      }
      const child: unknown = descriptor.value;
      if (typeof child === 'object' && child !== null) {
        stack.push({ object: child, visited: false });
      }
    }
  }

  return value;
}
