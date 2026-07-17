import { beforeEach, describe, expect, it } from 'vitest';

import { renderReferenceSkeleton } from '../src/main.js';

describe('Standard reference skeleton', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('compiles the first neutral scenario through the Public core', () => {
    const root = document.createElement('main');
    const dispose = renderReferenceSkeleton(root);

    expect(root.querySelector('h1')?.textContent).toBe(
      'Schema Engine Standard reference',
    );
    expect(root.querySelector('[role="status"]')?.textContent).toBe(
      'Public core compilation succeeded.',
    );
    expect(
      root.querySelector('form[aria-label="Schema Engine form preview"]'),
    ).not.toBeNull();

    dispose();
    expect(root.childElementCount).toBe(0);
  });
});
