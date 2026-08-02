import { readFileSync } from 'node:fs';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderReferenceSkeleton } from '../src/main.js';
import { StandardReferenceApplication } from '../src/reference-application.js';

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
    expect(
      root.querySelector('[aria-label="JSON Schema editor"]'),
    ).not.toBeNull();
    expect(
      root.querySelector('[aria-label="UI Schema editor"]'),
    ).not.toBeNull();
    expect(
      root.querySelector('[data-testid="configuration-status"]')?.textContent,
    ).toBe('Not validated.');

    dispose();
    expect(root.childElementCount).toBe(0);
  });

  it('focuses destructive configuration confirmation and restores its trigger', async () => {
    const root = document.createElement('main');
    document.body.replaceChildren(root);
    const application = new StandardReferenceApplication();
    const dispose = renderReferenceSkeleton(root, application);
    application.getRuntime()?.requestSetValue(['name'], 'Grace');
    application.updateSchemaDraft(`${application.getState().schemaDraft}\n`);

    const apply = requiredButton(root, 'Apply configuration');
    apply.click();
    await Promise.resolve();
    expect(document.activeElement?.textContent).toBe('Apply and reset form');
    expect(application.getState().pendingConfigurationAction).toBe('apply');

    requiredButton(root, 'Keep current state').click();
    await Promise.resolve();
    expect(document.activeElement).toBe(apply);
    expect(application.getState().pendingConfigurationAction).toBeUndefined();

    apply.click();
    await Promise.resolve();
    requiredButton(root, 'Apply and reset form').click();
    await Promise.resolve();
    expect(document.activeElement).toBe(
      root.querySelector('[data-testid="configuration-status"]'),
    );
    expect(application.getState().draftModified).toBe(false);

    dispose();
    document.body.replaceChildren();
  });

  it('renders the simultaneous workspace and independent accessible tab sets', () => {
    const root = document.createElement('main');
    const dispose = renderReferenceSkeleton(root);
    const regions = [...root.querySelectorAll<HTMLElement>('[data-region]')];
    const workspace = root.querySelector('.consumer-workspace');
    const evidence = root.querySelector('[data-region="evidence-panel"]');
    const tabLists = root.querySelectorAll('[role="tablist"]');

    expect(regions.map(({ dataset }) => dataset['region'])).toEqual([
      'scenario-panel',
      'preview-panel',
      'configuration-panel',
      'evidence-panel',
    ]);
    expect(workspace?.children[0]?.getAttribute('data-region')).toBe(
      'preview-panel',
    );
    expect(workspace?.children[1]?.getAttribute('data-region')).toBe(
      'configuration-panel',
    );
    expect(workspace?.nextElementSibling).toBe(evidence);
    expect(tabLists).toHaveLength(2);
    expect(tabLists[0]?.textContent).toBe('SchemaUI Schema');
    expect(tabLists[1]?.textContent).toBe(
      'StateDefinitionRuntimeDiagnosticsIntegration',
    );
    expect(
      root.querySelector(
        '[data-region="scenario-panel"] .scenario-explanation',
      ),
    ).not.toBeNull();
    expect(root.querySelectorAll('.eyebrow')).toHaveLength(4);
    const disclosures = Array.from(
      root.querySelectorAll<HTMLDetailsElement>(
        '.reference-region > details.region-disclosure',
      ),
    );
    expect(disclosures).toHaveLength(4);
    expect(disclosures.every(({ open }) => open)).toBe(true);
    expect(
      disclosures.map((disclosure) =>
        disclosure.querySelector(':scope > summary')?.textContent?.trim(),
      ),
    ).toEqual([
      'Scenario',
      'Interactive consumer',
      'Schemas',
      'Observable evidence',
    ]);
    for (const disclosure of disclosures) {
      disclosure.open = false;
      expect(disclosure.open).toBe(false);
      expect(
        disclosure.querySelector(':scope > summary .eyebrow'),
      ).not.toBeNull();
      disclosure.open = true;
    }

    dispose();
  });

  it('switches evidence with keyboard, highlights integration and copies it', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    const root = document.createElement('main');
    document.body.replaceChildren(root);
    const dispose = renderReferenceSkeleton(root);
    const integration = requiredTab(root, 'Integration');

    integration.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'End', bubbles: true }),
    );
    expect(integration.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(integration);
    const panel = document.getElementById(
      integration.getAttribute('aria-controls') ?? '',
    );
    expect(panel?.hidden).toBe(false);
    expect(panel?.textContent).toContain('not a public DOM adapter');
    expect(panel?.textContent).toContain(
      'Read them in order to follow the controlled integration',
    );
    expect(panel?.querySelectorAll('.snippet-explanation')).toHaveLength(5);
    expect(panel?.textContent).toContain('What it demonstrates');
    expect(panel?.textContent).toContain('Application responsibility');
    expect(panel?.textContent).toContain(
      'The application supplies and continues to own value and baselineValue',
    );
    expect(panel?.querySelector('[class^="tok-"]')).not.toBeNull();

    const copy = requiredButton(root, 'Copy Compile Definition');
    copy.click();
    expect(writeText).toHaveBeenCalledOnce();
    await vi.waitFor(() =>
      expect(copy.nextElementSibling?.textContent).toBe('Copied.'),
    );

    dispose();
  });

  it('applies all three theme modes and carries responsive/reduced-motion CSS', () => {
    const root = document.createElement('main');
    const dispose = renderReferenceSkeleton(root);
    const select = root.querySelector<HTMLSelectElement>('#standard-theme');
    if (select === null) throw new Error('Expected theme selector.');

    expect(root.dataset['theme']).toBe('auto');
    for (const theme of ['light', 'dark', 'auto']) {
      select.value = theme;
      select.dispatchEvent(new Event('change'));
      expect(root.dataset['theme']).toBe(theme);
      if (theme === 'auto') {
        expect(document.documentElement.dataset['theme']).toBeUndefined();
      } else {
        expect(document.documentElement.dataset['theme']).toBe(theme);
      }
    }
    const css = readFileSync('src/styles.css', 'utf8');
    expect(css).toContain('@media (max-width: 62rem)');
    expect(css).toContain('@media (max-width: 34rem)');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('--editor-selection: light-dark(#c7d2fe, #2b3852)');
    expect(css).toContain('--code-selection: #2b3852');
    expect(css).toContain('.cm-selectionBackground');
    expect(css).toContain('pre ::selection');

    dispose();
    expect(document.documentElement.dataset['theme']).toBeUndefined();
    expect(document.documentElement.style.colorScheme).toBe('');
  });

  it('keeps the duplicated Angular and Standard visible contract in parity', () => {
    const angularTemplate = readFileSync(
      '../reference-angular/src/app/reference-form.component.ts',
      'utf8',
    );
    const standardShell = readFileSync('src/main.ts', 'utf8');
    const visibleLabels = [
      'Application controls',
      'Reset scenario',
      'Commit baseline',
      'Locale en',
      'Locale es',
      'Touched issues',
      'All issues',
      'Operation decision',
      'Confirm',
      'Reject',
      'Pending',
      'Team collection controls',
      'New member ID',
      'New member name',
      'Insert member at end',
      'Move first member after second',
      'Remove last member',
      'Build-checked integration excerpts',
      'What it demonstrates',
      'Application responsibility',
    ] as const;

    for (const label of visibleLabels) {
      expect(angularTemplate, `Angular label: ${label}`).toContain(label);
      expect(standardShell, `Standard label: ${label}`).toContain(label);
    }

    const angularCss = readFileSync(
      '../reference-angular/src/styles.css',
      'utf8',
    );
    const standardCss = readFileSync('src/styles.css', 'utf8');
    const semanticTokenPairs = [
      ['--color-background', '--page'],
      ['--color-surface', '--surface'],
      ['--color-surface-muted', '--surface-muted'],
      ['--color-text', '--text'],
      ['--color-text-muted', '--muted'],
      ['--color-border', '--border'],
      ['--color-border-strong', '--border-strong'],
      ['--color-primary', '--primary'],
      ['--color-primary-strong', '--primary-strong'],
      ['--color-primary-soft', '--primary-soft'],
      ['--color-secondary', '--secondary'],
      ['--color-secondary-soft', '--secondary-soft'],
      ['--color-focus', '--focus'],
      ['--color-success', '--success'],
      ['--color-success-soft', '--success-soft'],
      ['--color-warning', '--warning'],
      ['--color-warning-soft', '--warning-soft'],
      ['--color-danger', '--danger'],
      ['--color-danger-soft', '--danger-soft'],
    ] as const;

    for (const [angularToken, standardToken] of semanticTokenPairs) {
      expect(readCssToken(standardCss, standardToken), standardToken).toBe(
        readCssToken(angularCss, angularToken),
      );
    }
  });

  it('keeps pending controls stable across unrelated state delivery', () => {
    const root = document.createElement('main');
    const application = new StandardReferenceApplication();
    const dispose = renderReferenceSkeleton(root, application);
    application.setDecisionMode('pending');
    application.getRuntime()?.requestSetValue(['name'], 'Pending');
    const confirm = requiredButton(root, 'Confirm pending operation');

    application.setLocale('es');
    expect(requiredButton(root, 'Confirm pending operation')).toBe(confirm);
    confirm.click();
    expect(application.getState().pendingOperations).toHaveLength(0);
    expect(application.getState().history.at(-1)?.decision).toBe('confirmed');

    dispose();
  });
});

function requiredButton(root: HTMLElement, label: string): HTMLButtonElement {
  const button = [...root.querySelectorAll('button')].find(
    ({ textContent }) => textContent === label,
  );
  if (!(button instanceof HTMLButtonElement)) {
    throw new Error(`Expected button: ${label}`);
  }
  return button;
}

function requiredTab(root: HTMLElement, label: string): HTMLButtonElement {
  const tab = [
    ...root.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
  ].find(({ textContent }) => textContent === label);
  if (tab === undefined) throw new Error(`Expected tab: ${label}`);
  return tab;
}

function readCssToken(source: string, token: string): string {
  const match = new RegExp(`${token}:\\s*([^;]+);`, 'u').exec(source);
  if (match?.[1] === undefined) throw new Error(`Expected CSS token: ${token}`);
  return match[1].trim();
}
