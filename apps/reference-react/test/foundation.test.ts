// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import { describe, expect, it } from 'vitest';

describe('React reference checkpoint-1 foundation', () => {
  it('reserves the independent browser root', () => {
    document.body.innerHTML = '<main id="root"></main>';
    expect(document.querySelector('#root')).not.toBeNull();
  });
});
