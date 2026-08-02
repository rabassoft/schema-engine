import { expect, test, type Page } from '@playwright/test';

const scenarios = [
  ['controlled-primitives', 'Controlled primitive fields'],
  ['nested-profile', 'Nested profile materialization'],
  ['stable-team', 'Stable team collection'],
  ['local-definitions', 'Same-document local definitions'],
  ['presentation-sections', 'Static presentation sections'],
  ['nullable-preferences', 'Nullable preferences'],
  ['advanced-presentation', 'Advanced static presentation'],
  ['recursive-local-presentation', 'Recursive local presentation'],
  ['semantic-contact', 'Semantic contact formats'],
] as const;

async function selectScenario(page: Page, id: string, heading: string) {
  const selector = page.getByRole('combobox', { name: 'Scenario' });
  await selector.selectOption(id);
  await expect(selector).toHaveValue(id);
  await expect(selector.locator('option:checked')).toHaveText(heading);
  await expect(
    page.getByRole('form', { name: 'Selected schema form' }),
  ).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
}

async function expectSchemas(page: Page) {
  await expect(
    page.getByRole('tablist', { name: 'Schema documents' }),
  ).toBeVisible();
}

async function openInspector(page: Page, testId: string) {
  const tab = inspectorTab[testId];
  if (tab !== undefined) {
    await page.getByRole('tab', { name: tab, exact: true }).click();
  }
  const inspector = page.getByTestId(testId);
  if (
    !(await inspector.evaluate(
      (element) => (element as HTMLDetailsElement).open,
    ))
  ) {
    await inspector.locator('summary').click();
  }
  return inspector.locator('pre');
}

const inspectorTab: Readonly<Record<string, string>> = {
  'inspector-value': 'State',
  'inspector-baseline': 'State',
  'inspector-definition': 'Definition',
  'inspector-snapshot': 'Runtime',
  'inspector-history': 'Runtime',
  'inspector-compiler-diagnostics': 'Diagnostics',
  'inspector-runtime-diagnostics': 'Diagnostics',
  'inspector-issues': 'Diagnostics',
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Schema Engine reference platform' }),
  ).toBeVisible();
});

test('switches between sober light, dark and automatic themes', async ({
  page,
}) => {
  const theme = page.getByRole('combobox', { name: 'Theme' });
  const root = page.locator('html');
  const readColors = () =>
    page.evaluate(() => {
      const card = document.querySelector<HTMLElement>('.reference-card');
      const editor = document.querySelector<HTMLElement>(
        '.reference-json-editor .cm-editor',
      );
      return {
        background: getComputedStyle(document.body).backgroundColor,
        surface: card === null ? '' : getComputedStyle(card).backgroundColor,
        text: getComputedStyle(document.body).color,
        editor: editor === null ? '' : getComputedStyle(editor).backgroundColor,
      };
    });

  await theme.selectOption('light');
  await expect(root).toHaveAttribute('data-theme', 'light');
  const light = await readColors();

  await theme.selectOption('dark');
  await expect(root).toHaveAttribute('data-theme', 'dark');
  const dark = await readColors();
  expect(dark.background).not.toBe(light.background);
  expect(dark.surface).not.toBe(light.surface);
  expect(dark.text).not.toBe(light.text);
  expect(dark.editor).not.toBe(light.editor);

  await theme.selectOption('auto');
  await expect(root).not.toHaveAttribute('data-theme');
});

test('navigates every scenario and exposes the complete inspector inventory', async ({
  page,
}) => {
  const previewBounds = await page
    .getByRole('heading', { name: 'Form preview' })
    .boundingBox();
  const schemaBounds = await page
    .getByRole('heading', { name: 'Schemas' })
    .boundingBox();
  expect(previewBounds).not.toBeNull();
  expect(schemaBounds).not.toBeNull();
  expect(schemaBounds!.x).toBeGreaterThan(previewBounds!.x);

  for (const [id, heading] of scenarios) {
    await selectScenario(page, id, heading);
  }

  for (const testId of Object.keys(inspectorTab)) {
    await expect(await openInspector(page, testId)).toBeVisible();
  }
  await expectSchemas(page);
  await page.getByRole('tab', { name: 'Schema', exact: true }).click();
  await expect(
    page.getByRole('textbox', { name: 'JSON Schema editor' }),
  ).toBeVisible();
  await page.getByRole('tab', { name: 'UI Schema', exact: true }).click();
  await expect(
    page.getByRole('textbox', { name: 'UI Schema editor' }),
  ).toBeVisible();
  await page.getByRole('tab', { name: 'Integration', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Build-checked integration excerpts' }),
  ).toBeVisible();
});

test('projects and validates the shared semantic-format scenario', async ({
  page,
}) => {
  await selectScenario(page, 'semantic-contact', 'Semantic contact formats');
  const email = page.getByRole('textbox', { name: 'Email' });
  const birthDate = page.getByRole('textbox', {
    name: 'Birth date',
    exact: true,
  });
  const publishedAt = page.getByRole('textbox', { name: 'Published at' });

  await expect(email).toHaveAttribute('type', 'email');
  await expect(birthDate).toHaveAttribute('type', 'date');
  await expect(publishedAt).toHaveAttribute('type', 'text');
  await expect(publishedAt).toHaveValue('1843-01-01T12:00:00Z');

  await page.getByRole('button', { name: 'All issues' }).click();
  await email.fill('invalid-email');
  await expect(email).toHaveAttribute('aria-invalid', 'true');
  await email.fill('grace@example.com');
  await expect(email).not.toHaveAttribute('aria-invalid', 'true');
});

test('highlights and copies integration code, editable JSON and inspector JSON', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
    origin: 'http://127.0.0.1:4207',
  });
  await expectSchemas(page);
  await page.getByRole('button', { name: 'Copy JSON Schema editor' }).click();
  await expect(page.getByText('Copied JSON Schema editor.')).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    '"$schema"',
  );

  await page.getByRole('tab', { name: 'Integration', exact: true }).click();
  const snippet = page.getByTestId('snippet-application-signals');
  await expect(snippet.locator('.snippet-explanation')).toBeVisible();
  await expect(snippet).toContainText('What it demonstrates');
  await expect(snippet).toContainText('Application responsibility');
  await expect(snippet).toContainText(
    'The application remains the source of truth',
  );
  const code = snippet.getByRole('textbox', {
    name: 'Application signals excerpt code',
  });
  await expect(code).toBeVisible();
  const tokenColors = await snippet
    .locator('.cm-content span')
    .evaluateAll(
      (tokens) =>
        new Set(tokens.map((token) => getComputedStyle(token).color)).size,
    );
  expect(tokenColors).toBeGreaterThan(1);
  await snippet
    .getByRole('button', { name: 'Copy Application signals excerpt' })
    .click();
  await expect(
    snippet.getByText('Copied Application signals excerpt.'),
  ).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    'private readonly selectionState',
  );

  await page.getByRole('tab', { name: 'State', exact: true }).click();
  const valueInspector = page.getByTestId('inspector-value');
  await expect(valueInspector).toHaveAttribute('open', '');
  await expect(page.getByTestId('inspector-baseline')).not.toHaveAttribute(
    'open',
    '',
  );
  await valueInspector.getByRole('button', { name: 'Copy Value' }).click();
  await expect(valueInspector.getByText('Copied Value.')).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    '"name": "Ada"',
  );
});

test('validates, cancels, applies and restores configuration drafts safely', async ({
  page,
}) => {
  await expectSchemas(page);
  await page.getByRole('tab', { name: 'Schema', exact: true }).click();
  const editor = page.getByRole('textbox', { name: 'JSON Schema editor' });
  const editedSchema = JSON.stringify(
    {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        name: {
          type: 'string',
          title: 'Name',
          minLength: 1,
          maxLength: 2,
        },
        age: { type: 'integer', title: 'Age', minimum: 0 },
        active: { type: 'boolean', title: 'Active' },
      },
      required: ['name', 'age', 'active'],
    },
    undefined,
    2,
  );

  await editor.fill('{');
  await page.getByRole('button', { name: 'Validate configuration' }).click();
  await expect(page.getByText('Invalid JSON', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Configuration diagnostics' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Focus JSON Schema editor' }).click();
  await expect(editor).toBeFocused();
  await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue('Ada');

  await page.getByRole('button', { name: 'Cancel changes' }).click();
  await expect(page.getByText('Not validated', { exact: true })).toBeVisible();
  await expect(editor).toContainText('"$schema"');
  await editor.fill('{"type":"string"}');
  await page.getByRole('button', { name: 'Validate configuration' }).click();
  await expect(
    page.getByText('Compilation failed', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('ROOT_TYPE_MUST_BE_OBJECT')).toBeVisible();
  await page
    .getByRole('button', { name: 'Focus schema editor' })
    .first()
    .click();
  await expect(editor).toBeFocused();
  await page.getByRole('button', { name: 'Cancel changes' }).click();
  await editor.fill(editedSchema);
  await page.getByRole('button', { name: 'Validate configuration' }).click();
  await expect(page.getByText('Valid', { exact: true })).toBeVisible();

  await page.getByRole('textbox', { name: 'Name' }).fill('Grace');
  await page.getByRole('button', { name: 'Apply configuration' }).click();
  const confirmation = page.getByRole('alertdialog', {
    name: 'Confirm configuration reset',
  });
  await expect(confirmation).toBeVisible();
  await expect(
    confirmation.getByRole('button', { name: 'Apply and reset form' }),
  ).toBeFocused();
  await confirmation
    .getByRole('button', { name: 'Keep current state' })
    .click();
  await expect(
    page.getByRole('button', { name: 'Apply configuration' }),
  ).toBeFocused();
  await page.getByRole('button', { name: 'Apply configuration' }).click();
  await confirmation
    .getByRole('button', { name: 'Apply and reset form' })
    .click();
  await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue('Ada');
  await expect(page.getByRole('combobox', { name: 'Role' })).toHaveCount(0);
  await expect(
    page.getByText('Matches applied configuration', { exact: true }),
  ).toBeVisible();
  await page.getByRole('tab', { name: 'Diagnostics', exact: true }).click();
  await expect(page.getByText(/active Draft 2020-12 schema/u)).toBeVisible();
  await expect(
    page.getByText('JSON Schema validation issues', { exact: true }),
  ).toBeVisible();
  await expect(page.getByTestId('inspector-issues')).toContainText('maxLength');

  await page
    .getByRole('button', { name: 'Restore scenario configuration' })
    .click();
  const restoreConfirmation = page.getByRole('alertdialog', {
    name: 'Confirm configuration reset',
  });
  await expect(
    restoreConfirmation.getByRole('button', { name: 'Restore scenario' }),
  ).toBeFocused();
  await restoreConfirmation
    .getByRole('button', { name: 'Restore scenario' })
    .click();
  await expect(page.getByRole('combobox', { name: 'Role' })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Restore scenario configuration' }),
  ).toBeDisabled();
});

test('keeps both tab sets keyboard-accessible and usable at a narrow viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole('heading', { name: 'Form preview' }),
  ).toBeVisible();
  await expectSchemas(page);
  await expect(
    page.getByRole('tablist', { name: 'Evidence views' }),
  ).toBeVisible();

  const state = page.getByRole('tab', { name: 'State', exact: true });
  await state.focus();
  await expect
    .poll(() =>
      state.evaluate((element) => {
        const style = getComputedStyle(element);
        return `${style.outlineStyle} ${style.outlineWidth}`;
      }),
    )
    .toBe('solid 3px');
  await state.press('End');
  await expect(
    page.getByRole('tab', { name: 'Integration', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');
  await expect(
    page.getByRole('heading', { name: 'Build-checked integration excerpts' }),
  ).toBeVisible();

  await page
    .getByRole('tab', { name: 'Integration', exact: true })
    .press('Home');
  await expect(state).toHaveAttribute('aria-selected', 'true');
  await state.press('ArrowRight');
  await expect(
    page.getByRole('tab', { name: 'Definition', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);
});

test('reflows at 200% zoom without hiding configuration actions', async ({
  page,
}) => {
  await page.setViewportSize({ width: 800, height: 900 });
  await page.evaluate(() => {
    document.documentElement.style.zoom = '2';
  });
  await expectSchemas(page);
  await page.getByRole('tab', { name: 'Schema', exact: true }).click();
  await expect(
    page.getByRole('textbox', { name: 'JSON Schema editor' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Validate configuration' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Restore scenario configuration' }),
  ).toBeVisible();
  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);
});

test('shows confirm, reject, pending, stale, reset and application controls', async ({
  page,
}) => {
  await selectScenario(
    page,
    'controlled-primitives',
    'Controlled primitive fields',
  );
  const role = page.getByRole('combobox', { name: 'Role' });
  await expect(role.locator('option')).toHaveText([
    'Select a role',
    'Administrator',
    'Editor',
    'Viewer',
  ]);
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
  const state = page.getByTestId('reference-state');
  await expect(state.getByText('locale es', { exact: true })).toBeVisible();
  await expect(
    state.getByText('all validation', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Reset scenario' }).click();
  await expect(state.getByText('locale en', { exact: true })).toBeVisible();
  await expect(
    state.getByText('touched validation', { exact: true }),
  ).toBeVisible();
  await expect(state.getByText('0 pending', { exact: true })).toBeVisible();
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
  await page.getByRole('textbox', { name: 'New member ID' }).fill('temporary');
  await selectScenario(
    page,
    'controlled-primitives',
    'Controlled primitive fields',
  );
  await selectScenario(page, 'stable-team', 'Stable team collection');
  await expect(
    page.getByRole('textbox', { name: 'New member ID' }),
  ).toHaveValue('new-member');
  await expect(
    page.getByRole('textbox', { name: 'New member name' }),
  ).toHaveValue('New member');
  await page.getByRole('textbox', { name: 'New member ID' }).fill('linus');
  await page.getByRole('textbox', { name: 'New member name' }).fill('Linus');
  await page.getByRole('button', { name: 'Reset scenario' }).click();
  await expect(
    page.getByRole('textbox', { name: 'New member ID' }),
  ).toHaveValue('new-member');
  await expect(
    page.getByRole('textbox', { name: 'New member name' }),
  ).toHaveValue('New member');
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

  await selectScenario(
    page,
    'advanced-presentation',
    'Advanced static presentation',
  );
  const identityTab = page.getByRole('tab', { name: 'Identity' });
  const contactTab = page.getByRole('tab', { name: 'Contact' });
  await expect(identityTab).toHaveAttribute('aria-selected', 'true');
  const selectedBackground = await identityTab.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  const inactiveBackground = await contactTab.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  expect(selectedBackground).not.toBe(inactiveBackground);
  await contactTab.click();
  await expect(contactTab).toHaveAttribute('aria-selected', 'true');
  await expect
    .poll(() =>
      contactTab.evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      ),
    )
    .toBe(selectedBackground);
  await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
  await page.getByRole('button', { name: 'Notifications' }).click();
  await expect(
    page.getByRole('checkbox', { name: 'Newsletter' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Reset scenario' }).click();
  await expect(page.getByRole('tab', { name: 'Contact' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(
    page.getByRole('button', { name: 'Notifications' }),
  ).toHaveAttribute('aria-expanded', 'true');
  await selectScenario(
    page,
    'controlled-primitives',
    'Controlled primitive fields',
  );
  await selectScenario(
    page,
    'advanced-presentation',
    'Advanced static presentation',
  );
  await expect(page.getByRole('tab', { name: 'Identity' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(
    page.getByRole('button', { name: 'Notifications' }),
  ).toHaveAttribute('aria-expanded', 'false');

  await selectScenario(
    page,
    'recursive-local-presentation',
    'Recursive local presentation',
  );
  const beta = page.locator(
    '[data-schema-item-key=\'["item",["rows"],"beta"]\']',
  );
  await beta.getByRole('tab', { name: 'Details' }).click();
  await beta.getByRole('button', { name: 'State' }).click();
  await beta.locator('[id$="--move-earlier"]').click();
  await expect(beta.getByRole('tab', { name: 'Details' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(beta.getByRole('button', { name: 'State' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
});
