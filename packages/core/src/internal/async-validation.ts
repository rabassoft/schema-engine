// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import type { AsyncValidationCancellation, Unsubscribe } from '../contracts.js';

export class AsyncGenerationCounter {
  constructor(private current = 0) {}

  next(): number | undefined {
    if (this.current >= Number.MAX_SAFE_INTEGER) return undefined;
    this.current += 1;
    return this.current;
  }

  last(): number {
    return this.current;
  }

  exhausted(): boolean {
    return this.current >= Number.MAX_SAFE_INTEGER;
  }
}

export class AsyncCancellationController {
  private cancelled = false;
  private released = false;
  private listeners: Array<(() => void) | undefined> = [];

  readonly capability: AsyncValidationCancellation = Object.freeze({
    isCancelled: (): boolean => this.cancelled,
    onCancel: (listener: () => void): Unsubscribe => {
      if (typeof listener !== 'function')
        throw new TypeError('Invalid listener');
      if (this.cancelled) {
        invokeSafely(listener);
        return NOOP;
      }
      if (this.released) return NOOP;
      const index = this.listeners.length;
      this.listeners.push(listener);
      let active = true;
      return Object.freeze(() => {
        if (!active) return;
        active = false;
        this.listeners[index] = undefined;
      });
    },
  });

  isCancelled(): boolean {
    return this.cancelled;
  }

  cancel(): void {
    if (this.cancelled) return;
    this.cancelled = true;
    const listeners = this.listeners;
    this.listeners = [];
    for (const listener of listeners) {
      if (listener !== undefined) invokeSafely(listener);
    }
  }

  release(): void {
    this.released = true;
    this.listeners = [];
  }
}

const NOOP: Unsubscribe = Object.freeze(() => undefined);

function invokeSafely(listener: () => void): void {
  try {
    listener();
  } catch {
    // Cancellation callbacks are advisory and isolated by contract.
  }
}
