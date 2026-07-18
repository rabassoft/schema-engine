// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import { expect, test, type Locator, type Page } from '@playwright/test';

const scenarios = [
  ['controlled-primitives', 'Controlled primitive fields'],
  ['nested-profile', 'Nested profile materialization'],
  ['stable-team', 'Stable team collection'],
  ['local-definitions', 'Same-document local definitions'],
  ['presentation-sections', 'Static presentation sections'],
  ['nullable-preferences', 'Nullable preferences'],
] as const;

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Schema Engine Standard reference' }),
  ).toBeVisible();
  await expect(page.getByTestId('compile-status')).toHaveText(
    'Public core compilation succeeded.',
  );
});

test('navigates all scenarios with normalized accessible interaction', async ({
  page,
}) => {
  const preview = page.locator('[data-region="preview-panel"]');
  const schemas = page.locator('[data-region="configuration-panel"]');
  const previewBounds = await preview.boundingBox();
  const schemaBounds = await schemas.boundingBox();
  expect(previewBounds).not.toBeNull();
  expect(schemaBounds).not.toBeNull();
  expect(schemaBounds!.x).toBeGreaterThan(previewBounds!.x);

  for (const [id, title] of scenarios) await selectScenario(page, id, title);

  await selectScenario(
    page,
    'nested-profile',
    'Nested profile materialization',
  );
  await expect(page.getByRole('group', { name: 'User profile' })).toBeVisible();
  await page.getByRole('textbox', { name: 'City' }).fill('Barcelona');
  await expect(page.getByRole('textbox', { name: 'City' })).toHaveValue(
    'Barcelona',
  );

  await selectScenario(page, 'stable-team', 'Stable team collection');
  await expect(
    page.getByRole('heading', { name: 'Team members' }),
  ).toBeVisible();
  await page.getByRole('textbox', { name: 'New member ID' }).fill('linus');
  await page.getByRole('textbox', { name: 'New member name' }).fill('Linus');
  await page.getByRole('button', { name: 'Insert member at end' }).click();
  await expect(page.getByRole('group', { name: /linus/u })).toBeVisible();
  await page
    .getByRole('button', { name: 'Move first member after second' })
    .click();
  await page.getByRole('button', { name: 'Remove last member' }).click();
  await expect(page.getByRole('group', { name: /linus/u })).toHaveCount(0);

  await selectScenario(
    page,
    'presentation-sections',
    'Static presentation sections',
  );
  await expect(page.getByRole('heading', { name: 'Identity' })).toBeVisible();
  await selectScenario(page, 'nullable-preferences', 'Nullable preferences');
  await expect(
    page.getByRole('button', { name: 'Set null' }).first(),
  ).toBeVisible();
});

test('covers controlled decisions, stale pending work, baseline and reset', async ({
  page,
}) => {
  const name = page.getByRole('textbox', { name: 'Name' });
  await name.fill('Grace');
  await expect(valueEvidence(page)).toContainText('Grace');

  await page.getByTestId('decision-reject').click();
  await name.fill('Rejected');
  await expect(name).toHaveValue('Grace');

  await page.getByTestId('decision-pending').click();
  await name.fill('Pending');
  await page.getByRole('tab', { name: 'Runtime', exact: true }).click();
  await expect(page.getByText('Operation 3', { exact: true })).toBeVisible();

  await page.getByTestId('decision-confirm').click();
  await name.fill('External');
  await page.getByRole('button', { name: 'Confirm pending operation' }).click();
  await expect(page.locator('#evidence-panel-runtime')).toContainText(
    'STALE_OPERATION',
  );

  await page.getByRole('button', { name: 'Commit baseline' }).click();
  await expect(page.locator('#evidence-panel-runtime')).toContainText(
    '"dirty": false',
  );
  await page.getByRole('button', { name: 'Locale es' }).click();
  await page.getByRole('button', { name: 'All issues' }).click();
  await page.getByRole('button', { name: 'Reset scenario' }).click();
  await expect(page.getByRole('button', { name: 'Locale en' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(
    page.getByRole('button', { name: 'Touched issues' }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(name).toHaveValue('Ada');
});

test('validates, cancels, applies and restores edited configuration with Ajv', async ({
  page,
}) => {
  const schemaEditor = page.getByRole('textbox', {
    name: 'JSON Schema editor',
  });
  await schemaEditor.fill('{');
  await page.getByRole('button', { name: 'Validate configuration' }).click();
  await expect(page.getByTestId('configuration-status')).toHaveText(
    'Invalid JSON.',
  );
  await page.getByRole('button', { name: 'Cancel changes' }).click();
  await expect(page.getByTestId('configuration-status')).toHaveText(
    'Not validated.',
  );

  await schemaEditor.fill('{"type":"string"}');
  await page.getByRole('button', { name: 'Validate configuration' }).click();
  await expect(page.getByTestId('configuration-status')).toHaveText(
    'Configuration compilation failed.',
  );
  await expect(page.getByTestId('configuration-diagnostics')).toContainText(
    'ROOT_TYPE_MUST_BE_OBJECT',
  );
  await page.getByRole('button', { name: 'Cancel changes' }).click();

  const schema = JSON.parse(await requiredText(schemaEditor)) as {
    properties: Record<string, unknown>;
  };
  schema.properties['nickname'] = {
    type: 'string',
    title: 'Nickname',
    maxLength: 2,
  };
  const uiTab = page.getByRole('tab', { name: 'UI Schema', exact: true });
  await schemaEditor.fill(JSON.stringify(schema, undefined, 2));
  await uiTab.click();
  const uiEditor = page.getByRole('textbox', { name: 'UI Schema editor' });
  const uiSchema = JSON.parse(await requiredText(uiEditor)) as {
    order: string[];
  };
  uiSchema.order.push('nickname');
  await uiEditor.fill(JSON.stringify(uiSchema, undefined, 2));
  await page.getByRole('button', { name: 'Validate configuration' }).click();
  await expect(page.getByTestId('configuration-status')).toHaveText(
    'Configuration valid.',
  );
  await page.getByRole('button', { name: 'Apply configuration' }).click();
  const nickname = page.getByRole('textbox', { name: 'Nickname' });
  await nickname.fill('long');
  await page.getByRole('button', { name: 'All issues' }).click();
  await expect(nickname).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('.field-issues:not([hidden])')).toContainText(
    'maxLength',
  );

  await page
    .getByRole('button', { name: 'Restore scenario configuration' })
    .click();
  await expect(
    page.getByRole('button', { name: 'Restore scenario', exact: true }),
  ).toBeFocused();
  await page
    .getByRole('button', { name: 'Restore scenario', exact: true })
    .click();
  await expect(page.getByRole('textbox', { name: 'Nickname' })).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Restore scenario configuration' }),
  ).toBeDisabled();
});

test('keeps tabs, copy and themes accessible', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
    origin: 'http://127.0.0.1:4212',
  });
  const state = page.getByRole('tab', { name: 'State', exact: true });
  await state.focus();
  await state.press('End');
  const integration = page.getByRole('tab', {
    name: 'Integration',
    exact: true,
  });
  await expect(integration).toHaveAttribute('aria-selected', 'true');
  await integration.press('Home');
  await expect(state).toHaveAttribute('aria-selected', 'true');
  await state.press('ArrowRight');
  await expect(
    page.getByRole('tab', { name: 'Definition', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');

  await integration.click();
  await page.getByText('Compile Definition', { exact: true }).click();
  const code = page.locator('#evidence-panel-integration code').first();
  await expect(code.locator('[class^="tok-"]').first()).toBeVisible();
  await page.getByRole('button', { name: 'Copy Compile Definition' }).click();
  await expect(
    page.getByText('Copied.', { exact: true }).first(),
  ).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain('compileFormDefinition');

  const theme = page.getByRole('combobox', { name: 'Theme' });
  const readColors = () =>
    page.evaluate(() => ({
      page: getComputedStyle(document.body).backgroundColor,
      surface: getComputedStyle(
        document.querySelector('.reference-region') ?? document.body,
      ).backgroundColor,
    }));
  await theme.selectOption('light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  const light = await readColors();
  await theme.selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const dark = await readColors();
  expect(dark.page).not.toBe(light.page);
  expect(dark.surface).not.toBe(light.surface);
  await theme.selectOption('auto');
  await expect(page.locator('main')).toHaveAttribute('data-theme', 'auto');
  await expect(page.locator('html')).not.toHaveAttribute('data-theme');
});

test('reflows preview before schemas at 390 px and 200% zoom', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expectNoPageOverflow(page);
  await expectWorkspaceStacked(page);
  await expect(
    page.getByRole('button', { name: 'Validate configuration' }),
  ).toBeVisible();

  await page.setViewportSize({ width: 800, height: 900 });
  await page.evaluate(() => {
    document.documentElement.style.zoom = '2';
  });
  await expectNoPageOverflow(page);
  await expectWorkspaceStacked(page);
  await expect(
    page.getByRole('button', { name: 'Restore scenario configuration' }),
  ).toBeVisible();
});

test('repeated scenario replacement leaves one active delivery path', async ({
  page,
}) => {
  for (let index = 0; index < 3; index += 1) {
    await selectScenario(
      page,
      'nested-profile',
      'Nested profile materialization',
    );
    await selectScenario(
      page,
      'controlled-primitives',
      'Controlled primitive fields',
    );
  }
  await page.getByRole('textbox', { name: 'Name' }).fill('Once');
  await page.getByRole('tab', { name: 'Runtime', exact: true }).click();
  const history = page.locator('#evidence-panel-runtime pre').nth(1);
  await expect(history).toContainText('"sequence": 1');
  await expect(history).not.toContainText('"sequence": 2');
});

async function selectScenario(page: Page, id: string, title: string) {
  const selector = page.getByRole('combobox', { name: 'Reference scenario' });
  await selector.selectOption(id);
  await expect(selector).toHaveValue(id);
  await expect(selector.locator('option:checked')).toHaveText(title);
  await expect(page.getByTestId('compile-status')).toHaveText(
    'Public core compilation succeeded.',
  );
  await expect(
    page.getByRole('form', { name: 'Schema Engine form preview' }),
  ).toBeVisible();
}

function valueEvidence(page: Page): Locator {
  return page.locator('#evidence-panel-state details').first().locator('pre');
}

async function requiredText(locator: Locator): Promise<string> {
  const value = await locator.textContent();
  if (value === null) throw new Error('Expected editor text.');
  return value;
}

async function expectNoPageOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    )
    .toBe(true);
}

async function expectWorkspaceStacked(page: Page) {
  const preview = await page
    .locator('[data-region="preview-panel"]')
    .boundingBox();
  const schemas = await page
    .locator('[data-region="configuration-panel"]')
    .boundingBox();
  expect(preview).not.toBeNull();
  expect(schemas).not.toBeNull();
  expect(schemas!.y).toBeGreaterThan(preview!.y);
}
