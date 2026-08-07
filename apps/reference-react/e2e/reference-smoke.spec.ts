// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import { expect, test, type Page } from '@playwright/test';

async function selectScenario(page: Page, id: string): Promise<void> {
  await page.locator('#react-scenario').selectOption(id);
  await expect(page.getByTestId('compile-status')).toHaveText(
    'Configuration compiled and runtime ready.',
  );
}

test('primitive ownership, reset and theme remain application controlled', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Schema Engine React reference',
  );
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Grace');
  await expect(page.getByTestId('evidence-panel')).toContainText('Grace');
  await page.getByRole('button', { name: 'Reset scenario' }).click();
  await expect(
    page.getByRole('textbox', { name: 'Name', exact: true }),
  ).toHaveValue('Ada');
  await page.getByLabel('Theme').selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('nested, collection, condition and alternative scenarios are functional', async ({
  page,
}) => {
  await page.goto('/');
  await selectScenario(page, 'nested-profile');
  await page.getByRole('textbox', { name: 'City', exact: true }).fill('Madrid');
  await expect(page.getByTestId('evidence-panel')).toContainText('Madrid');

  await selectScenario(page, 'stable-team');
  await page.getByLabel('New member ID').fill('linus');
  await page.getByLabel('New member name').fill('Linus');
  await page.getByRole('button', { name: 'Insert member at end' }).click();
  await expect(
    page.getByRole('textbox', { name: 'Name', exact: true }).last(),
  ).toHaveValue('Linus');

  await selectScenario(page, 'conditional-field-state');
  const showDetails = page.getByRole('checkbox', {
    name: 'Show details',
    exact: true,
  });
  await showDetails.uncheck();
  await expect(
    page.getByRole('textbox', { name: 'Conditional name', exact: true }),
  ).toBeHidden();
  await showDetails.check();
  await expect(
    page.getByRole('textbox', { name: 'Conditional name', exact: true }),
  ).toBeVisible();

  await selectScenario(page, 'discriminated-object-alternatives');
  await page
    .getByRole('combobox', { name: 'Kind', exact: true })
    .selectOption({ label: 'Dog' });
  await expect(
    page.getByRole('textbox', { name: 'Bark volume', exact: true }),
  ).toBeVisible();
});

test('async validation, scope confirmation and controlled wizard remain explicit', async ({
  page,
}) => {
  await page.goto('/');
  await selectScenario(page, 'service-validation');
  await page
    .getByRole('button', { name: 'Complete request: username available' })
    .click();
  await page
    .getByRole('textbox', { name: 'Username', exact: true })
    .fill('taken');
  await page
    .getByRole('button', { name: 'Complete request: username unavailable' })
    .click();
  await page.getByRole('button', { name: 'All issues' }).click();
  await expect(page.getByTestId('form-preview')).toContainText(
    'This username is not available.',
  );

  await selectScenario(page, 'scope-baseline-confirmation');
  await page
    .getByRole('textbox', { name: 'Display name', exact: true })
    .fill('Ada King');
  await page
    .getByRole('button', { name: 'Prepare current profile name as saved' })
    .click();
  await expect(page.getByTestId('preview-panel')).toContainText('available');
  await page.getByRole('button', { name: 'Accept prepared candidate' }).click();
  await expect(page.getByTestId('preview-panel')).toContainText('accepted');

  await selectScenario(page, 'linear-wizard');
  await page
    .getByRole('button', { name: 'Resolve wizard validation as available' })
    .click();
  await page
    .getByTestId('form-preview')
    .getByRole('button', { name: 'Next', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Team', exact: true }),
  ).toBeVisible();
});

test('schema editing, cancellation, integration highlighting and copy are available', async ({
  page,
}) => {
  await page.goto('/');
  const editor = page.getByLabel('Schema JSON');
  await editor.click();
  await editor.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
  await editor.fill('{');
  await page.getByRole('button', { name: 'Validate', exact: true }).click();
  await expect(page.getByTestId('draft-status')).toContainText('invalid-json');
  await page.getByRole('button', { name: 'Cancel edits' }).click();
  await expect(page.getByTestId('draft-status')).toContainText('unvalidated');
  await page.getByRole('tab', { name: 'Operation decision' }).click();
  await expect(page.getByTestId('integration-panel')).toContainText(
    'The renderer requests; the application decides',
  );
  await expect(
    page.getByRole('button', { name: 'Copy Operation decision' }),
  ).toBeVisible();
  await expect(
    page.getByTestId('integration-panel').locator('code'),
  ).toHaveAttribute('data-language', 'typescript');
});

test('field spacing and editor selections remain coherent in both themes', async ({
  page,
}) => {
  await page.goto('/');

  const firstInput = page.getByRole('textbox', { name: 'Name', exact: true });
  const firstInputId = await firstInput.getAttribute('id');
  if (firstInputId === null)
    throw new Error('Expected a stable first input ID.');
  const firstLabel = page.locator(`label[for="${firstInputId}"]`);
  const clear = page.getByRole('button', { name: 'Clear Name' });

  await expect(firstLabel).toBeVisible();
  await expect(firstLabel).toHaveText('Name');

  const fieldSpacing = await firstInput.evaluate((input) => {
    const host = input.parentElement;
    const label = host?.querySelector('label');
    const description = host?.querySelector('p');
    const action = host?.querySelector('button');
    const nextField =
      host?.parentElement?.nextElementSibling?.firstElementChild ??
      host?.nextElementSibling;
    if (host == null || label == null || action == null || nextField == null)
      return null;
    const hostRect = host.getBoundingClientRect();
    const labelRect = label.getBoundingClientRect();
    const descriptionRect = description?.getBoundingClientRect();
    const inputRect = input.getBoundingClientRect();
    const actionRect = action.getBoundingClientRect();
    const nextFieldRect = nextField.getBoundingClientRect();
    return {
      display: getComputedStyle(host).display,
      labelGap: inputRect.top - labelRect.bottom,
      supportingTextGap:
        inputRect.top - (descriptionRect?.bottom ?? labelRect.bottom),
      actionGap: actionRect.left - inputRect.right,
      fieldGap: nextFieldRect.top - hostRect.bottom,
    };
  });
  expect(fieldSpacing?.display).toBe('grid');
  expect(fieldSpacing?.labelGap).toBeGreaterThan(0);
  expect(fieldSpacing?.supportingTextGap).toBeGreaterThan(0);
  expect(fieldSpacing?.actionGap).toBeGreaterThan(0);
  expect(fieldSpacing?.fieldGap).toBeGreaterThan(
    (fieldSpacing?.supportingTextGap ?? 0) * 2,
  );
  await expect(clear).toBeVisible();

  const checkboxSpacing = await page
    .getByRole('checkbox', { name: 'Active', exact: true })
    .evaluate((checkbox) => {
      const host = checkbox.parentElement;
      const label = host?.querySelector('label');
      const action = host?.querySelector('button');
      if (label == null || action == null) return null;
      const checkboxRect = checkbox.getBoundingClientRect();
      const labelRect = label.getBoundingClientRect();
      const actionRect = action.getBoundingClientRect();
      return {
        checkLabelGap: labelRect.left - checkboxRect.right,
        checkboxCenter: checkboxRect.top + checkboxRect.height / 2,
        labelCenter: labelRect.top + labelRect.height / 2,
        actionCenter: actionRect.top + actionRect.height / 2,
      };
    });
  expect(checkboxSpacing?.checkLabelGap).toBeGreaterThan(0);
  expect(checkboxSpacing?.checkLabelGap).toBeLessThanOrEqual(5);
  expect(checkboxSpacing?.labelCenter).toBeCloseTo(
    checkboxSpacing?.checkboxCenter ?? 0,
    0,
  );
  expect(checkboxSpacing?.actionCenter).toBeCloseTo(
    checkboxSpacing?.checkboxCenter ?? 0,
    0,
  );

  const editor = page.getByLabel('Schema JSON');
  await editor.click();
  await editor.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');

  const selectionColors = async () =>
    page.evaluate(() => {
      const editorSelection = document.querySelector(
        '.json-editor .cm-selectionBackground',
      );
      const code = document.querySelector('pre code');
      if (editorSelection === null || code === null) return null;
      return {
        editor: getComputedStyle(editorSelection).backgroundColor,
        code: getComputedStyle(code, '::selection').backgroundColor,
      };
    });

  await page.getByLabel('Theme').selectOption('light');
  expect(await selectionColors()).toEqual({
    editor: 'rgb(199, 210, 254)',
    code: 'rgb(43, 56, 82)',
  });

  await page.getByLabel('Theme').selectOption('dark');
  expect(await selectionColors()).toEqual({
    editor: 'rgb(43, 56, 82)',
    code: 'rgb(43, 56, 82)',
  });
});
