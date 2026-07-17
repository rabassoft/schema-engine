import { expect, test, type Page } from '@playwright/test';

const scenarios = [
  ['controlled-primitives', 'Controlled primitive fields'],
  ['nested-profile', 'Nested profile materialization'],
  ['stable-team', 'Stable team collection'],
  ['local-definitions', 'Same-document local definitions'],
  ['presentation-sections', 'Static presentation sections'],
  ['nullable-preferences', 'Nullable preferences'],
] as const;

async function selectScenario(page: Page, id: string, heading: string) {
  await page.getByRole('combobox', { name: 'Scenario' }).selectOption(id);
  await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  await expect(
    page.getByRole('form', { name: 'Selected schema form' }),
  ).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
}

async function openInspector(page: Page, testId: string) {
  const inspector = page.getByTestId(testId);
  await inspector.locator('summary').click();
  return inspector.locator('pre');
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Schema Engine reference platform' }),
  ).toBeVisible();
});

test('navigates every scenario and exposes the complete inspector inventory', async ({
  page,
}) => {
  for (const [id, heading] of scenarios) {
    await selectScenario(page, id, heading);
  }

  for (const name of [
    'Schema',
    'UI Schema',
    'Value',
    'Baseline value',
    'Normalized definition',
    'Runtime snapshot',
    'Compiler diagnostics',
    'Runtime diagnostics',
    'Validation issues',
    'Operation history',
  ]) {
    await expect(page.getByText(name, { exact: true })).toBeVisible();
  }
  await expect(
    page.getByRole('heading', { name: 'Build-checked integration excerpts' }),
  ).toBeVisible();
});

test('shows confirm, reject, pending, stale, reset and application controls', async ({
  page,
}) => {
  await selectScenario(
    page,
    'controlled-primitives',
    'Controlled primitive fields',
  );
  const name = page.getByRole('textbox', { name: 'Name' });
  await name.fill('Grace');
  await expect(page.getByTestId('reference-state')).toContainText('Modified');
  await expect(await openInspector(page, 'inspector-value')).toContainText(
    'Grace',
  );

  await page.getByTestId('decision-reject').click();
  const age = page.getByRole('textbox', { name: 'Age' });
  await age.fill('-1');
  await age.press('Tab');
  await expect(age).toHaveValue('37');

  await page.getByRole('button', { name: 'Reset scenario' }).click();
  await page.getByTestId('decision-pending').click();
  await name.fill('Pending name');
  await expect(page.getByTestId('reference-state')).toContainText('1 pending');

  await page.getByTestId('decision-confirm').click();
  await name.fill('External name');
  await page
    .getByRole('button', { name: /Confirm pending operation 1: set-value/u })
    .click();
  await expect(await openInspector(page, 'inspector-history')).toContainText(
    'STALE_OPERATION',
  );

  await page.getByRole('button', { name: 'Commit baseline' }).click();
  await expect(page.getByTestId('reference-state')).toContainText(
    'Matches baseline',
  );
  await page.getByRole('button', { name: 'Locale es' }).click();
  await page.getByRole('button', { name: 'All issues' }).click();
  await expect(page.getByTestId('reference-state')).toContainText(
    'locale es · all validation',
  );
  await page.getByRole('button', { name: 'Reset scenario' }).click();
  await expect(page.getByTestId('reference-state')).toContainText(
    'locale en · touched validation · 0 pending',
  );
});

test('covers nested, collection and nullable keyboard interaction with accessible groups', async ({
  page,
}) => {
  await selectScenario(
    page,
    'nested-profile',
    'Nested profile materialization',
  );
  const city = page.getByRole('textbox', { name: 'City' });
  await city.focus();
  await city.pressSequentially('Barcelona', { delay: 25 });
  await expect(city).toHaveValue('Barcelona');

  await selectScenario(page, 'stable-team', 'Stable team collection');
  await expect(
    page.getByRole('group', { name: 'Team collection controls' }),
  ).toBeVisible();
  await page.getByRole('textbox', { name: 'New member ID' }).fill('linus');
  await page.getByRole('textbox', { name: 'New member name' }).fill('Linus');
  await page.getByRole('button', { name: 'Insert member at end' }).click();
  await expect(await openInspector(page, 'inspector-value')).toContainText(
    'linus',
  );
  await page
    .getByRole('button', { name: 'Move first member after second' })
    .click();
  await page.getByRole('button', { name: 'Remove last member' }).click();

  await selectScenario(page, 'nullable-preferences', 'Nullable preferences');
  const nickname = page.getByRole('textbox', { name: 'Nickname' });
  await nickname.focus();
  await nickname.pressSequentially('Ricard', { delay: 25 });
  await expect(nickname).toHaveValue('Ricard');
  await expect(
    page.getByRole('group', { name: 'Operation decision' }),
  ).toBeVisible();
  await expect(
    page.getByText('Missing, null and false are distinct'),
  ).toBeVisible();
});
