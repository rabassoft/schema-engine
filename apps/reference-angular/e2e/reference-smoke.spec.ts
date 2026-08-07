import { expect, test, type Page } from '@playwright/test';

const scenarios = [
  ['controlled-primitives', 'Controlled primitive fields'],
  ['nested-profile', 'Nested profile materialization'],
  ['stable-team', 'Stable team collection'],
  ['local-definitions', 'Same-document local definitions'],
  ['object-composition', 'Static object composition'],
  ['presentation-sections', 'Static presentation sections'],
  ['nullable-preferences', 'Nullable preferences'],
  ['advanced-presentation', 'Advanced static presentation'],
  ['recursive-local-presentation', 'Recursive local presentation'],
  ['semantic-contact', 'Semantic contact formats'],
  ['fixed-values', 'Primitive fixed values'],
  ['service-validation', 'Controlled service validation'],
  ['scope-baseline-confirmation', 'Scoped baseline confirmation'],
  ['explicit-schema-defaults', 'Explicit schema defaults'],
  ['conditional-field-state', 'Controlled conditional field state'],
  ['string-enum-array', 'Controlled multiple choices'],
  ['discriminated-object-alternatives', 'Controlled object alternatives'],
  ['linear-wizard', 'Controlled linear wizard'],
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

test('keeps field labels visible and boolean controls on one visual row', async ({
  page,
}) => {
  const form = page.getByRole('form', { name: 'Selected schema form' });
  const firstLabel = form.locator('label').first();
  await expect(firstLabel).toBeVisible();
  await expect(firstLabel).toHaveText('Name');
  const active = form.getByRole('checkbox', { name: 'Active' });
  const centers = await active.evaluate((control) => {
    const host = control.parentElement;
    const label = host?.querySelector('label');
    const clear = host?.querySelector('button');
    if (label == null || clear == null) return undefined;
    const center = (element: Element) => {
      const rect = element.getBoundingClientRect();
      return rect.top + rect.height / 2;
    };
    return [center(control), center(label), center(clear)];
  });
  expect(centers).toBeDefined();
  expect(Math.max(...centers!) - Math.min(...centers!)).toBeLessThan(2);
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
  await expect(
    page
      .getByTestId('integration-panel')
      .getByRole('heading', { name: 'Build-checked integration excerpts' }),
  ).toBeVisible();
});

test('keeps conditionally hidden and disabled Angular fields mounted and inaccessible', async ({
  page,
}) => {
  await selectScenario(
    page,
    'controlled-primitives',
    'Controlled primitive fields',
  );
  await page.getByRole('tab', { name: 'UI Schema', exact: true }).click();
  await page.getByRole('textbox', { name: 'UI Schema editor' }).fill(
    JSON.stringify(
      {
        order: ['name', 'role', 'age', 'score', 'active'],
        fields: {
          name: {
            description: 'A required display name.',
            visibleWhen: { path: ['active'], equals: true },
          },
          role: {
            placeholder: 'Select a role',
            enumLabels: {
              admin: 'Administrator',
              editor: 'Editor',
              viewer: 'Viewer',
            },
            enabledWhen: { path: ['active'], equals: true },
          },
          score: {
            options: { decimalPlaces: 1, showTrailingZeros: true },
          },
        },
      },
      null,
      2,
    ),
  );
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(
    page.getByText('Matches applied configuration', { exact: true }),
  ).toBeVisible();

  const nameId = nodeBase('reference-controlled-primitives', ['name']);
  const roleId = nodeBase('reference-controlled-primitives', ['role']);
  const name = page.locator(`[id="${nameId}"]`);
  const role = page.locator(`[id="${roleId}"]`);
  const nameHost = page.locator('schema-leaf-outlet-host', { has: name });
  await expect(name).toBeVisible();
  await expect(role).toBeEnabled();
  await name.evaluate((element) => {
    Object.defineProperty(element, '__conditionalIdentity', {
      value: true,
      configurable: true,
    });
  });
  await name.focus();

  await page.getByRole('checkbox', { name: 'Active' }).uncheck();
  await expect(nameHost).toHaveAttribute('hidden', '');
  await expect(nameHost).toHaveAttribute('inert', '');
  await expect(nameHost).toHaveAttribute('aria-hidden', 'true');
  await expect(name).toBeHidden();
  await expect(
    page.getByRole('textbox', { name: 'Name', exact: true }),
  ).toHaveCount(0);
  await expect(role).toBeDisabled();
  await expect(page.locator(`[id="${roleId}-clear"]`)).toBeDisabled();
  expect(
    await name.evaluate(
      (element) =>
        (element as HTMLElement & { __conditionalIdentity?: boolean })
          .__conditionalIdentity,
    ),
  ).toBe(true);
  expect(await page.evaluate(() => document.activeElement?.id)).not.toBe(
    nameId,
  );

  const diagnostics = await openInspector(
    page,
    'inspector-runtime-diagnostics',
  );
  await expect(diagnostics).toContainText('[]');

  const history = await openInspector(page, 'inspector-history');
  const historyBefore = await history.textContent();
  await name.evaluate((element) => {
    const input = element as HTMLInputElement;
    input.value = 'stale hidden edit';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('focus', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
  });
  await role.dispatchEvent('change');
  await page.locator(`[id="${roleId}-clear"]`).dispatchEvent('click');
  await expect(history).toHaveText(historyBefore ?? '');
  await expect(
    await openInspector(page, 'inspector-runtime-diagnostics'),
  ).toContainText('[]');

  await page.getByRole('checkbox', { name: 'Active' }).check();
  await expect(nameHost).not.toHaveAttribute('hidden', '');
  await expect(nameHost).not.toHaveAttribute('inert', '');
  await expect(nameHost).not.toHaveAttribute('aria-hidden', 'true');
  await expect(name).toBeVisible();
  await expect(name).toHaveValue('Ada');
  await expect(role).toBeEnabled();
  expect(
    await name.evaluate(
      (element) =>
        (element as HTMLElement & { __conditionalIdentity?: boolean })
          .__conditionalIdentity,
    ),
  ).toBe(true);
  expect(await page.evaluate(() => document.activeElement?.id)).not.toBe(
    nameId,
  );
});

test('projects the exact shared conditional scenario through Angular', async ({
  page,
}) => {
  await selectScenario(
    page,
    'conditional-field-state',
    'Controlled conditional field state',
  );
  const nameId = nodeBase('reference-conditional-field-state', ['displayName']);
  const roleId = nodeBase('reference-conditional-field-state', ['role']);
  const driverId = nodeBase('reference-conditional-field-state', ['driver']);
  const name = page.locator(`[id="${nameId}"]`);
  const nameHost = page.locator('schema-leaf-outlet-host', { has: name });
  const role = page.locator(`[id="${roleId}"]`);
  const driver = page.locator(`[id="${driverId}"]`);
  const driverHost = page.locator('schema-leaf-outlet-host', { has: driver });

  await expect(
    page.getByRole('textbox', { name: 'Nullable match' }),
  ).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Zero match' })).toBeVisible();
  await expect(
    page.getByRole('textbox', { name: 'Empty-string match' }),
  ).toBeEnabled();
  await expect(
    page.getByRole('textbox', { name: 'Nested compound note' }),
  ).toBeVisible();
  await expect(
    page.getByRole('textbox', { name: 'Hidden-source match' }),
  ).toBeVisible();

  await name.evaluate((element) => {
    Object.defineProperty(element, '__sharedConditionalIdentity', {
      value: true,
      configurable: true,
    });
  });
  await name.fill('Grace');
  await page
    .getByRole('textbox', { name: 'Conditional review code' })
    .fill('needs-review');
  await expect(
    page.getByRole('textbox', { name: 'Conditional review code' }),
  ).toHaveAttribute('aria-invalid', 'true');
  await name.focus();
  await page.getByRole('checkbox', { name: 'Show details' }).uncheck();
  await expect(nameHost).toHaveAttribute('hidden', '');
  await expect(nameHost).toHaveAttribute('inert', '');
  await expect(nameHost).toHaveAttribute('aria-hidden', 'true');
  await expect(
    page.getByRole('textbox', { name: 'Conditional name' }),
  ).toHaveCount(0);
  await expect(await openInspector(page, 'inspector-snapshot')).toContainText(
    '"valid": false',
  );
  expect(await page.evaluate(() => document.activeElement?.id)).not.toBe(
    nameId,
  );

  const history = await openInspector(page, 'inspector-history');
  const historyBeforeHidden = await history.textContent();
  await name.evaluate((element) => {
    const input = element as HTMLInputElement;
    input.value = 'stale hidden edit';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('focus', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
  });
  await expect(history).toHaveText(historyBeforeHidden ?? '');

  await page.getByRole('checkbox', { name: 'Enable role' }).uncheck();
  await expect(role).toBeDisabled();
  await expect(page.locator(`[id="${roleId}-clear"]`)).toBeDisabled();
  const historyBeforeDisabled = await history.textContent();
  await role.dispatchEvent('change');
  await page.locator(`[id="${roleId}-clear"]`).dispatchEvent('click');
  await expect(history).toHaveText(historyBeforeDisabled ?? '');
  await expect(
    await openInspector(page, 'inspector-runtime-diagnostics'),
  ).toContainText('[]');

  await page.getByRole('checkbox', { name: 'Show driver' }).uncheck();
  await expect(driverHost).toHaveAttribute('hidden', '');
  await expect(
    page.getByRole('textbox', { name: 'Hidden-source match' }),
  ).toBeVisible();

  await page.getByRole('checkbox', { name: 'Show details' }).check();
  await page.getByRole('checkbox', { name: 'Enable role' }).check();
  await expect(nameHost).not.toHaveAttribute('hidden', '');
  await expect(name).toHaveValue('Grace');
  await expect(role).toBeEnabled();
  expect(
    await name.evaluate(
      (element) =>
        (
          element as HTMLElement & {
            __sharedConditionalIdentity?: boolean;
          }
        ).__sharedConditionalIdentity,
    ),
  ).toBe(true);
});

test('projects controlled ordered multiple choices through Angular', async ({
  page,
}) => {
  await selectScenario(
    page,
    'string-enum-array',
    'Controlled multiple choices',
  );
  const roles = page.getByRole('listbox', { name: 'Assigned roles' });
  const channels = page.getByRole('listbox', { name: 'Required channels' });
  await expect(roles).toHaveAttribute('multiple', '');
  await expect(roles.locator('option')).toHaveCount(6);
  await expect(
    page.locator('schema-string-enum-array-renderer').filter({ has: roles }),
  ).not.toContainText('ⓘ');
  await expect(
    page.getByText('No value provided.', { exact: true }),
  ).toBeVisible();
  await expect(channels).toHaveAttribute('aria-required', 'true');
  await expect(
    page.getByText('No values selected.', { exact: true }),
  ).toBeVisible();

  await roles.selectOption(['choice:3']);
  await roles.selectOption(['choice:2', 'choice:3']);
  await expect(await openInspector(page, 'inspector-value')).toContainText(
    '"roles": [\n    "editor",\n    "reader"',
  );
  await page.getByTestId('decision-reject').click();
  await roles.selectOption(['choice:2', 'choice:3', 'choice:4']);
  await expect(roles).toHaveValues(['choice:2', 'choice:3']);
  await expect(await openInspector(page, 'inspector-history')).toContainText(
    '"status": "rejected"',
  );

  await roles.focus();
  await roles.blur();
  await expect(await openInspector(page, 'inspector-snapshot')).toContainText(
    '"touched": true',
  );
  await page.getByRole('button', { name: 'Locale es' }).click();
  await expect(
    page.getByText('No hay valores seleccionados.', { exact: true }),
  ).toBeVisible();
  await page.getByTestId('decision-confirm').click();
  await page.getByRole('button', { name: /Limpiar Assigned roles/u }).click();
  await expect(
    page.getByText('No se ha proporcionado ningún valor.', { exact: true }),
  ).toBeVisible();
});

test('replaces controlled object alternatives through Angular', async ({
  page,
}) => {
  await selectScenario(
    page,
    'discriminated-object-alternatives',
    'Controlled object alternatives',
  );
  const kind = page.getByRole('combobox', { name: 'Kind' });
  const name = page.getByRole('textbox', { name: 'Name' });
  const lives = page.getByRole('textbox', { name: 'Lives' });
  await name.evaluate((element) => {
    (element as HTMLElement & { __m33Common?: boolean }).__m33Common = true;
  });
  await lives.focus();
  await kind.selectOption({ label: 'Dog' });
  await expect(lives).toHaveCount(0);
  await expect(
    page.getByRole('checkbox', { name: 'Lives indoors' }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('textbox', { name: 'Bark volume' }),
  ).toBeVisible();
  await expect(await openInspector(page, 'inspector-value')).toContainText(
    '"lives": 9',
  );
  expect(
    await name.evaluate(
      (element) =>
        (element as HTMLElement & { __m33Common?: boolean }).__m33Common,
    ),
  ).toBe(true);
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

function nodeBase(formId: string, path: readonly string[]): string {
  return `se-${encodeURIComponent(JSON.stringify([formId, path]))}`;
}

test('projects and validates shared object composition independently', async ({
  page,
}) => {
  await selectScenario(page, 'object-composition', 'Static object composition');
  const form = page.getByRole('form', { name: 'Selected schema form' });
  const department = form.getByRole('textbox', { name: 'Department' });
  const displayName = form.getByRole('textbox', { name: 'Display name' });

  await expect
    .poll(() =>
      form
        .locator('label')
        .evaluateAll((labels) =>
          labels.map(({ textContent }) => textContent?.trim()),
        ),
    )
    .toEqual(['Department', 'Display name', 'Contact email', 'Active']);
  await expect(department).toHaveAttribute('aria-required', 'true');
  await expect(displayName).toHaveAttribute('aria-required', 'true');
  await department.fill('R');
  await displayName.fill('A');
  await displayName.blur();
  await expect(department).toHaveAttribute('aria-invalid', 'true');
  await expect(displayName).toHaveAttribute('aria-invalid', 'true');
  await department.fill('Engineering');
  await displayName.fill('Grace Hopper');
  await expect(department).not.toHaveAttribute('aria-invalid', 'true');
  await expect(displayName).not.toHaveAttribute('aria-invalid', 'true');
  await page.getByRole('combobox', { name: 'Theme' }).selectOption('dark');
  await expect(form).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('projects shared fixed values without renderer-owned intentions', async ({
  page,
}) => {
  await selectScenario(page, 'fixed-values', 'Primitive fixed values');
  const direct = page.getByRole('group', { name: 'Direct fixed choice' });
  const value = direct.locator('[data-fixed-value-state]');
  await expect(value).toHaveText('fixed');
  await expect(value).toHaveAttribute('data-fixed-value-state', 'value');
  const fixedAlignment = await direct.evaluate((group) => {
    const label = group.querySelector('[id$="-label"]');
    const fixedValue = group.querySelector('[data-fixed-value-state]');
    if (label === null || fixedValue === null) return undefined;
    const labelRect = label.getBoundingClientRect();
    const valueRect = fixedValue.getBoundingClientRect();
    return Math.abs(
      labelRect.top +
        labelRect.height / 2 -
        (valueRect.top + valueRect.height / 2),
    );
  });
  expect(fixedAlignment).toBeDefined();
  expect(fixedAlignment!).toBeLessThan(3);
  await expect(direct.locator('input, select, button, [tabindex]')).toHaveCount(
    0,
  );
  await expect(
    page
      .getByRole('group', { name: 'Missing fixed value' })
      .locator('[data-fixed-value-state]'),
  ).toHaveText('Missing value');
  await expect(
    page
      .getByRole('group', { name: 'Blocked child' })
      .locator('[data-fixed-value-state]'),
  ).toHaveText('Unavailable value');
  await expect(
    page
      .getByRole('group', { name: 'Nullable fixed value' })
      .locator('[data-fixed-value-state]'),
  ).toHaveText('Null value');
  await expect(
    page
      .getByRole('group', { name: 'Empty string' })
      .locator('[data-fixed-value-state]'),
  ).toHaveText('""');
  await expect(
    page
      .getByRole('group', { name: 'Negative zero' })
      .locator('[data-fixed-value-state]'),
  ).toHaveText('-0');

  await page.getByTestId('fixed-control-mismatch').click();
  await expect(value).toHaveText('other');
  await expect(direct).toHaveAttribute('aria-invalid', 'true');
  await expect(direct).toContainText('must be equal to constant');
  await page.getByTestId('fixed-control-incompatible').click();
  await expect(
    page
      .getByRole('group', { name: 'Incompatible fixed value' })
      .locator('[data-fixed-value-state]'),
  ).toHaveText('Incompatible value');
  await expect(await openInspector(page, 'inspector-history')).toContainText(
    '[]',
  );
  await page.getByRole('button', { name: 'Locale es' }).click();
  await expect(
    page
      .getByRole('group', { name: 'Missing fixed value' })
      .locator('[data-fixed-value-state]'),
  ).toHaveText('Valor ausente');
});

test('exposes deterministic controlled service validation without renderer orchestration', async ({
  page,
}) => {
  await selectScenario(
    page,
    'service-validation',
    'Controlled service validation',
  );
  const status = page.getByTestId('async-validation-state');
  const username = page.getByRole('textbox', { name: 'Username' });
  await expect(status).toHaveText('Generation 1 pending.');

  await page
    .getByRole('button', { name: 'Complete request: username unavailable' })
    .click();
  await expect(status).toHaveText('Generation 1 settled invalid.');
  await expect(username).toHaveAttribute('aria-invalid', 'true');
  await expect(
    page.getByRole('form', { name: 'Selected schema form' }),
  ).toContainText('This username is not available.');
  const usernameBorder = await username.evaluate(
    (element) => getComputedStyle(element).borderColor,
  );
  const issueColor = await page
    .getByText('This username is not available.', { exact: true })
    .evaluate((element) => getComputedStyle(element).color);
  expect(usernameBorder).toBe(issueColor);

  await username.fill('x');
  await expect(status).toHaveText('Blocked by synchronous validation.');
  await username.fill('grace');
  await expect(status).toContainText('pending');
  await username.fill('linus');
  await expect(status).toContainText('pending');
  await expect(page.getByTestId('service-validation-controls')).toContainText(
    'cancelled',
  );

  await page.getByRole('button', { name: 'Fail current request' }).click();
  await expect(status).toContainText('failed: exception');
  await page.getByRole('button', { name: 'Make next request throw' }).click();
  await page.getByRole('button', { name: 'Retry failed validation' }).click();
  await expect(status).toContainText('failed: exception');
  await page.getByRole('button', { name: 'Retry failed validation' }).click();
  await expect(status).toContainText('pending');
  await page
    .getByRole('button', { name: 'Complete request: username available' })
    .click();
  await expect(status).toContainText('settled valid');
  await expect(username).not.toHaveAttribute('aria-invalid', 'true');
});

test('prepares and accepts application-owned scoped baseline candidates', async ({
  page,
}) => {
  await selectScenario(
    page,
    'scope-baseline-confirmation',
    'Scoped baseline confirmation',
  );
  const status = page.getByTestId('scope-candidate-status');
  const accept = page.getByTestId('accept-scope-candidate');
  await expect(status).toHaveText('No baseline candidate prepared.');

  await page.getByTestId('prepare-scope-profile-name').click();
  await expect(status).toContainText('candidate prepared');
  await expect(accept).toBeEnabled();
  await expect(await openInspector(page, 'inspector-baseline')).toContainText(
    'Ada Lovelace',
  );
  await accept.click();
  await expect(status).toContainText('baseline updated');
  await expect(page.getByTestId('inspector-scope-candidate')).toContainText(
    'Ada Byron',
  );
  await expect(await openInspector(page, 'inspector-baseline')).toContainText(
    'Ada Byron',
  );
  await expect(page.getByTestId('reference-state')).toContainText('Modified');

  await page.getByRole('button', { name: 'Reset scenario' }).click();
  await page.getByTestId('prepare-scope-current-only-linus').click();
  await expect(status).toContainText('unconfirmable');
  await expect(accept).toBeDisabled();

  await page.getByTestId('prepare-scope-whole-team').click();
  await accept.click();
  const acceptedCollection = await openInspector(page, 'inspector-baseline');
  await expect(acceptedCollection).toContainText('Linus');
  await expect(acceptedCollection).toContainText('Baseline note');
  await expect(page.getByTestId('reference-state')).toContainText('Modified');
});

test('derives, cancels and accepts explicit schema defaults', async ({
  page,
}) => {
  await selectScenario(
    page,
    'explicit-schema-defaults',
    'Explicit schema defaults',
  );
  const status = page.getByTestId('default-candidate-status');
  const accept = page.getByTestId('accept-default-candidate');
  await page.getByTestId('derive-default-candidate').click();
  await expect(status).toContainText('Candidate derived');
  await expect(await openInspector(page, 'inspector-value')).not.toContainText(
    'New entity',
  );
  await page.getByTestId('cancel-default-candidate').click();
  await expect(status).toContainText('cancelled');
  await page.getByTestId('derive-default-candidate').click();
  await accept.click();
  const value = await openInspector(page, 'inspector-value');
  await expect(value).toContainText('New entity');
  await expect(value).toContainText('Existing row');
  await expect(status).toContainText('explicitly accepted');
  await page.getByTestId('derive-default-candidate').click();
  await expect(status).toContainText('no effect');
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

  const integration = page.getByTestId('integration-panel');
  const applicationSignals = integration.getByRole('tab', {
    name: 'Application signals excerpt',
    exact: true,
  });
  const controlledTemplate = integration.getByRole('tab', {
    name: 'Controlled form template excerpt',
    exact: true,
  });
  await expect(applicationSignals).toHaveAttribute('aria-selected', 'true');
  await applicationSignals.press('End');
  await expect(controlledTemplate).toHaveAttribute('aria-selected', 'true');
  await expect(
    integration.getByTestId('snippet-controlled-form-template'),
  ).toBeVisible();
  await controlledTemplate.press('Home');
  await expect(applicationSignals).toHaveAttribute('aria-selected', 'true');
  const snippet = integration.getByTestId('snippet-application-signals');
  await expect(snippet.locator('.snippet-explanation')).toBeVisible();
  await expect(
    integration.getByTestId('snippet-operation-decisions'),
  ).toBeHidden();
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
  await page.getByRole('button', { name: 'Validate', exact: true }).click();
  await expect(page.getByText('Invalid JSON', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Configuration diagnostics' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Focus JSON Schema editor' }).click();
  await expect(editor).toBeFocused();
  await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue('Ada');

  await page.getByRole('button', { name: 'Cancel edits' }).click();
  await expect(page.getByText('Not validated', { exact: true })).toBeVisible();
  await expect(editor).toContainText('"$schema"');
  await editor.fill('{"type":"string"}');
  await page.getByRole('button', { name: 'Validate', exact: true }).click();
  await expect(
    page.getByText('Compilation failed', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('ROOT_TYPE_MUST_BE_OBJECT')).toBeVisible();
  await page
    .getByRole('button', { name: 'Focus schema editor' })
    .first()
    .click();
  await expect(editor).toBeFocused();
  await page.getByRole('button', { name: 'Cancel edits' }).click();
  await editor.fill(editedSchema);
  await page.getByRole('button', { name: 'Validate', exact: true }).click();
  await expect(page.getByText('Valid', { exact: true })).toBeVisible();

  await page.getByRole('textbox', { name: 'Name' }).fill('Grace');
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  const confirmation = page.getByRole('alertdialog', {
    name: 'Confirm configuration reset',
  });
  await expect(confirmation).toBeVisible();
  await expect(
    confirmation.getByRole('button', { name: 'Confirm configuration' }),
  ).toBeFocused();
  await confirmation
    .getByRole('button', { name: 'Keep current configuration' })
    .click();
  await expect(
    page.getByRole('button', { name: 'Apply', exact: true }),
  ).toBeFocused();
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await confirmation
    .getByRole('button', { name: 'Confirm configuration' })
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

  await page.getByRole('button', { name: 'Restore original' }).click();
  const restoreConfirmation = page.getByRole('alertdialog', {
    name: 'Confirm configuration reset',
  });
  await expect(
    restoreConfirmation.getByRole('button', { name: 'Confirm configuration' }),
  ).toBeFocused();
  await restoreConfirmation
    .getByRole('button', { name: 'Confirm configuration' })
    .click();
  await expect(page.getByRole('combobox', { name: 'Role' })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Restore original' }),
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
  const diagnostics = page.getByRole('tab', {
    name: 'Diagnostics',
    exact: true,
  });
  await expect(diagnostics).toHaveAttribute('aria-selected', 'true');
  await expect(
    page
      .getByTestId('integration-panel')
      .getByRole('heading', { name: 'Build-checked integration excerpts' }),
  ).toBeVisible();

  await diagnostics.press('Home');
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
    page.getByRole('button', { name: 'Validate', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Restore original' }),
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
  await expect(
    page
      .getByRole('button', { name: 'Notifications' })
      .locator('.schema-presentation-accordion-indicator'),
  ).toHaveText('+');
  await page.getByRole('button', { name: 'Notifications' }).click();
  await expect(
    page
      .getByRole('button', { name: 'Notifications' })
      .locator('.schema-presentation-accordion-indicator'),
  ).toHaveText('−');
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

test('projects the controlled wizard lifecycle and retained step state', async ({
  page,
}) => {
  await selectScenario(page, 'linear-wizard', 'Controlled linear wizard');
  const wizard = page.locator('.schema-wizard');
  const regions = wizard.locator('.schema-wizard-step');
  await expect(regions).toHaveCount(3);
  await expect(wizard.locator('ol.schema-wizard-steps')).toBeVisible();
  await expect(wizard.getByRole('tablist')).toHaveCount(0);
  await expect(regions.nth(0)).toBeVisible();
  await expect(regions.nth(1)).toBeHidden();
  await expect(wizard).toContainText('Additional validation not yet available');

  await page.getByTestId('decision-reject').click();
  await wizard.getByRole('button', { name: 'Next' }).click();
  await expect(regions.nth(0)).toBeVisible();
  await page.getByTestId('decision-confirm').click();
  await wizard.getByRole('button', { name: 'Next' }).click();
  await expect(regions.nth(1)).toBeVisible();
  await expect(
    regions.nth(1).getByRole('heading', { name: 'Team' }),
  ).toBeFocused();

  const retained = regions.nth(1).getByRole('textbox', {
    name: 'Profile note',
  });
  await retained.fill('Retained browser buffer');
  await wizard.getByRole('button', { name: 'Previous' }).click();
  await expect(regions.nth(1)).toBeHidden();
  await wizard.getByRole('button', { name: 'Next' }).click();
  await expect(retained).toHaveValue('Retained browser buffer');

  await wizard.getByRole('button', { name: 'Next' }).click();
  await regions
    .nth(2)
    .getByRole('textbox', { name: 'Review code' })
    .fill('approved');
  await expect(wizard).toContainText('Additional validation in progress');
  await page
    .getByRole('button', { name: 'Reject wizard validation request' })
    .click();
  await expect(wizard).toContainText('Additional validation failed');
  await page.getByRole('button', { name: 'Retry wizard validation' }).click();
  await page
    .getByRole('button', {
      name: 'Resolve wizard validation as available',
    })
    .click();
  await wizard.getByRole('button', { name: 'Complete' }).click();
  await expect(wizard).toContainText('Completed');

  await page.getByRole('button', { name: 'Locale es' }).click();
  await expect(
    wizard.getByRole('heading', { name: 'Incorporación del equipo' }),
  ).toBeVisible();
  await expect(wizard.getByRole('button', { name: 'Anterior' })).toBeVisible();

  await selectScenario(
    page,
    'controlled-primitives',
    'Controlled primitive fields',
  );
  await selectScenario(page, 'linear-wizard', 'Controlled linear wizard');
  await expect(page.locator('.schema-wizard-step').nth(0)).toBeVisible();
  await expect(page.locator('.schema-wizard-step').nth(1)).toBeHidden();
});
