// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import type { AsyncValidationCancellation } from '@rabassoft/schema-engine';
import { describe, expect, it, vi } from 'vitest';
import { ReactReferenceAsyncValidator } from '../src/reference-async-validator.js';

const definition = Object.freeze({
  fieldPath: Object.freeze(['username']),
  issue: Object.freeze({
    code: 'username-taken',
    keyword: 'service',
    fallbackMessage: 'Username is unavailable.',
  }),
  labels: Object.freeze({
    heading: 'Service',
    settleValid: 'Valid',
    settleInvalid: 'Invalid',
    reject: 'Reject',
    throwNext: 'Throw',
    retry: 'Retry',
  }),
});

describe('React reference async-service evidence', () => {
  it('settles and cancels deterministic application requests', async () => {
    const notify = vi.fn();
    const validator = new ReactReferenceAsyncValidator(definition, notify);
    const cancellation = cancellationPort();
    const pending = Promise.resolve(
      validator.validator.validate(
        {},
        { username: 'ada' },
        { generation: 1, cancellation },
      ),
    );
    expect(validator.getEvidence()).toEqual([
      { id: 1, generation: 1, value: 'ada', status: 'pending' },
    ]);
    expect(validator.resolveCurrent(false)).toBe(true);
    await expect(pending).resolves.toMatchObject({
      valid: false,
      issues: [{ code: 'username-taken', path: ['username'] }],
    });
    expect(validator.getEvidence()[0]?.status).toBe('resolved-invalid');

    void validator.validator.validate(
      {},
      { username: 'grace' },
      { generation: 2, cancellation },
    );
    cancellation.cancel();
    expect(validator.getEvidence()[1]?.status).toBe('cancelled');
    expect(notify).toHaveBeenCalled();
  });
});

function cancellationPort(): AsyncValidationCancellation & {
  cancel(): void;
} {
  const listeners = new Set<() => void>();
  let cancelled = false;
  return {
    isCancelled: () => cancelled,
    onCancel(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    cancel() {
      cancelled = true;
      for (const listener of listeners) listener();
    },
  };
}
