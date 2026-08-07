// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

export class BridgeStore<TSnapshot> {
  private readonly listeners = new Set<() => void>();

  constructor(private snapshot: TSnapshot) {}

  readonly getSnapshot = (): TSnapshot => this.snapshot;

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  publish(snapshot: TSnapshot): void {
    if (Object.is(snapshot, this.snapshot)) return;
    this.snapshot = snapshot;
    for (const listener of [...this.listeners]) listener();
  }
}
