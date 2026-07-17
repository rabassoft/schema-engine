import { describe, expect, it, vi } from 'vitest';

import { serializeInspector } from '../src/app/inspector-serialization.js';

describe('serializeInspector', () => {
  it('sorts object members and normalizes unsupported primitives', () => {
    expect(serializeInspector({ z: undefined, b: 2, a: 1, large: 2n })).toBe(`{
  "a": 1,
  "b": 2,
  "large": "2n",
  "z": "[Undefined]"
}`);
  });

  it('contains cycles and accessors without executing consumer code', () => {
    const getter = vi.fn(() => 'unsafe');
    const value: Record<string, unknown> = {};
    value.self = value;
    Object.defineProperty(value, 'computed', {
      enumerable: true,
      get: getter,
    });

    expect(serializeInspector(value)).toBe(`{
  "computed": "[Accessor]",
  "self": "[Circular]"
}`);
    expect(getter).not.toHaveBeenCalled();
  });
});
