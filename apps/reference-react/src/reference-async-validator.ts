// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import type {
  AsyncSchemaValidator,
  AsyncValidationContext,
  ValidationResult,
} from '@rabassoft/schema-engine';
import type { ReferenceServiceValidation } from '@schema-engine-internal/reference-scenarios';

export type ReactServiceRequestStatus =
  | 'pending'
  | 'resolved-valid'
  | 'resolved-invalid'
  | 'rejected'
  | 'cancelled'
  | 'threw';

export interface ReactServiceRequestEvidence {
  readonly id: number;
  readonly generation: number;
  readonly value: unknown;
  readonly status: ReactServiceRequestStatus;
}

interface DeferredRequest {
  readonly evidence: ReactServiceRequestEvidence;
  readonly resolve: (result: ValidationResult) => void;
  readonly reject: () => void;
  unsubscribeCancellation(): void;
}

export class ReactReferenceAsyncValidator {
  readonly validator: AsyncSchemaValidator;
  private requests: readonly ReactServiceRequestEvidence[] = Object.freeze([]);
  private readonly deferred = new Map<number, DeferredRequest>();
  private nextId = 1;
  private throwNext = false;

  constructor(
    private readonly definition: ReferenceServiceValidation,
    private readonly notify: (
      evidence: readonly ReactServiceRequestEvidence[],
    ) => void,
  ) {
    this.validator = Object.freeze({
      validate: (
        _schema: unknown,
        value: unknown,
        context: AsyncValidationContext,
      ) => this.validate(value, context),
    });
  }

  getEvidence(): readonly ReactServiceRequestEvidence[] {
    return this.requests;
  }

  resolveCurrent(valid: boolean): boolean {
    const request = this.findCurrent();
    if (request === undefined) return false;
    request.unsubscribeCancellation();
    this.deferred.delete(request.evidence.id);
    this.replaceStatus(
      request.evidence.id,
      valid ? 'resolved-valid' : 'resolved-invalid',
    );
    request.resolve(
      Object.freeze({
        valid,
        issues: valid
          ? Object.freeze([])
          : Object.freeze([
              Object.freeze({
                code: this.definition.issue.code,
                path: this.definition.fieldPath,
                keyword: this.definition.issue.keyword,
                parameters: Object.freeze({ service: 'reference-react' }),
                fallbackMessage: this.definition.issue.fallbackMessage,
              }),
            ]),
      }),
    );
    return true;
  }

  rejectCurrent(): boolean {
    const request = this.findCurrent();
    if (request === undefined) return false;
    request.unsubscribeCancellation();
    this.deferred.delete(request.evidence.id);
    this.replaceStatus(request.evidence.id, 'rejected');
    request.reject();
    return true;
  }

  throwOnNextRequest(): void {
    this.throwNext = true;
  }

  private validate(
    value: unknown,
    context: AsyncValidationContext,
  ): PromiseLike<ValidationResult> {
    const evidence = Object.freeze({
      id: this.nextId++,
      generation: context.generation,
      value: readPath(value, this.definition.fieldPath),
      status: this.throwNext ? ('threw' as const) : ('pending' as const),
    });
    this.requests = Object.freeze([...this.requests, evidence]);
    this.notify(this.requests);
    if (this.throwNext) {
      this.throwNext = false;
      throw new Error('Deterministic React reference failure.');
    }

    let resolve!: (result: ValidationResult) => void;
    let reject!: () => void;
    const promise = new Promise<ValidationResult>((done, fail) => {
      resolve = done;
      reject = () =>
        fail(new Error('Deterministic React reference rejection.'));
    });
    const unsubscribeCancellation = context.cancellation.onCancel(() => {
      this.replaceStatus(evidence.id, 'cancelled');
    });
    this.deferred.set(evidence.id, {
      evidence,
      resolve,
      reject,
      unsubscribeCancellation,
    });
    return promise;
  }

  private findCurrent(): DeferredRequest | undefined {
    return [...this.deferred.values()]
      .reverse()
      .find(({ evidence }) =>
        this.requests.some(
          ({ id, status }) => id === evidence.id && status === 'pending',
        ),
      );
  }

  private replaceStatus(id: number, status: ReactServiceRequestStatus): void {
    this.requests = Object.freeze(
      this.requests.map((entry) =>
        entry.id === id ? Object.freeze({ ...entry, status }) : entry,
      ),
    );
    this.notify(this.requests);
  }
}

function readPath(value: unknown, path: readonly (string | number)[]): unknown {
  let current = value;
  for (const segment of path) {
    if (typeof current !== 'object' || current === null) return undefined;
    current = Reflect.get(current, segment);
  }
  return current;
}
