function normalizeInspectorValue(
  value: unknown,
  active: WeakSet<object>,
): unknown {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    typeof value === 'number'
  ) {
    return value;
  }
  if (typeof value === 'bigint') return `${String(value)}n`;
  if (typeof value === 'undefined') return '[Undefined]';
  if (typeof value === 'function') return '[Function]';
  if (typeof value === 'symbol') return `[Symbol:${value.description ?? ''}]`;
  if (active.has(value)) return '[Circular]';

  active.add(value);
  try {
    if (Array.isArray(value)) {
      const normalized = value.map((entry) =>
        normalizeInspectorValue(entry, active),
      );
      return normalized;
    }
    const normalized: Record<string, unknown> = {};
    const keys = Reflect.ownKeys(value)
      .filter((key): key is string => typeof key === 'string')
      .sort();
    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      normalized[key] =
        descriptor !== undefined && 'value' in descriptor
          ? normalizeInspectorValue(descriptor.value, active)
          : '[Accessor]';
    }
    return normalized;
  } finally {
    active.delete(value);
  }
}

export function serializeInspector(value: unknown): string {
  try {
    return JSON.stringify(
      normalizeInspectorValue(value, new WeakSet()),
      null,
      2,
    );
  } catch {
    return '[Unserializable inspector value]';
  }
}
