// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import { expect, test, type Locator, type Page } from '@playwright/test';

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

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Schema Engine Standard reference' }),
  ).toBeVisible();
  await expect(page.getByTestId('compile-status')).toHaveText(
    'Public core compilation succeeded.',
  );
});

test('keeps field labels visible and actions on the control row', async ({
  page,
}) => {
  const form = page.getByRole('form', { name: 'Schema Engine form preview' });
  const firstLabel = form.locator('label').first();
  await expect(firstLabel).toBeVisible();
  await expect(firstLabel).toHaveText('Name');
  const horizontalFields = await form
    .locator('.form-field:not(.boolean-field):not(.fixed-field)')
    .evaluateAll((fields) =>
      fields.map((field) => {
        const control = field.querySelector(
          'input:not([type="checkbox"]), select',
        );
        const clear = field.querySelector('.field-actions button');
        if (control === null || clear === null) return undefined;
        const controlRect = control.getBoundingClientRect();
        const clearRect = clear.getBoundingClientRect();
        return {
          centerGap: Math.abs(
            controlRect.top +
              controlRect.height / 2 -
              (clearRect.top + clearRect.height / 2),
          ),
          horizontalGap: clearRect.left - controlRect.right,
        };
      }),
    );
  expect(horizontalFields).toHaveLength(4);
  expect(
    horizontalFields.every(
      (geometry) =>
        geometry !== undefined &&
        geometry.centerGap < 2 &&
        geometry.horizontalGap >= 4,
    ),
  ).toBe(true);
  const active = form.getByRole('checkbox', { name: 'Active' });
  const centers = await active.evaluate((control) => {
    const host = control.parentElement;
    const label = host?.querySelector('label');
    const clear = host?.querySelector('.field-actions button');
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

test('navigates all scenarios with normalized accessible interaction', async ({
  page,
}) => {
  const disclosures = page.locator(
    '.reference-region > details.region-disclosure',
  );
  await expect(disclosures).toHaveCount(5);
  for (let index = 0; index < 5; index += 1) {
    await expect(disclosures.nth(index)).toHaveAttribute('open', '');
  }
  const previewDisclosure = page
    .locator('[data-region="preview-panel"]')
    .locator(':scope > details.region-disclosure');
  await previewDisclosure.locator(':scope > summary').click();
  await expect(previewDisclosure).not.toHaveAttribute('open', '');
  await expect(
    page.locator('[data-region="configuration-panel"]'),
  ).toBeVisible();
  await previewDisclosure.locator(':scope > summary').click();

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
  await expect(page.getByRole('group', { name: 'Identity' })).toBeVisible();
  await selectScenario(page, 'nullable-preferences', 'Nullable preferences');
  await expect(
    page.getByRole('button', { name: 'Set null' }).first(),
  ).toBeVisible();

  await selectScenario(
    page,
    'advanced-presentation',
    'Advanced static presentation',
  );
  await expect(page.getByRole('tab', { name: 'Identity' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await page.getByRole('tab', { name: 'Contact' }).click();
  await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
  await expect(
    page
      .getByRole('button', { name: 'Notifications' })
      .locator('.presentation-accordion-indicator'),
  ).toHaveText('+');
  await page.getByRole('button', { name: 'Notifications' }).click();
  await expect(
    page
      .getByRole('button', { name: 'Notifications' })
      .locator('.presentation-accordion-indicator'),
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
  const beta = page.locator('[data-item-id="beta"]');
  await beta.getByRole('tab', { name: 'Details' }).click();
  await beta.getByRole('button', { name: 'State' }).click();
  await beta.getByRole('button', { name: 'Move earlier' }).click();
  await expect(beta.getByRole('tab', { name: 'Details' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(beta.getByRole('button', { name: 'State' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
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

test('projects the exact shared conditional scenario independently', async ({
  page,
}) => {
  await selectScenario(
    page,
    'conditional-field-state',
    'Controlled conditional field state',
  );
  const nameHost = page.locator('[data-field-name="displayName"]');
  const name = nameHost.locator('input');
  const roleHost = page.locator('[data-field-name="role"]');
  const role = roleHost.locator('select');
  const driverHost = page.locator('[data-field-name="driver"]');

  await expect(
    page.getByRole('textbox', { name: 'Nullable match' }),
  ).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Zero match' })).toBeVisible();
  await expect(
    page.getByRole('textbox', { name: 'Empty-string match' }),
  ).toBeEnabled();
  await expect(
    page.getByRole('textbox', { name: 'Hidden-source match' }),
  ).toBeVisible();
  await expect(
    page.getByRole('textbox', { name: 'Nested compound note' }),
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
  await page.getByRole('tab', { name: 'Runtime', exact: true }).click();
  await expect(
    page.locator('#evidence-panel-runtime pre').first(),
  ).toContainText('"valid": false');
  const history = page.locator('#evidence-panel-runtime pre').nth(1);
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
  await expect(roleHost.getByRole('button', { name: /Clear/u })).toBeDisabled();
  const historyBeforeDisabled = await history.textContent();
  await role.dispatchEvent('change');
  await roleHost.getByRole('button', { name: /Clear/u }).dispatchEvent('click');
  await expect(history).toHaveText(historyBeforeDisabled ?? '');
  await page.getByRole('tab', { name: 'Diagnostics', exact: true }).click();
  await expect(page.locator('#evidence-panel-diagnostics pre')).toContainText(
    '"runtime": []',
  );

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

test('projects controlled ordered multiple choices independently', async ({
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
    page.locator('.string-enum-array-field').filter({ has: roles }),
  ).not.toContainText('ⓘ');
  await expect(
    page.getByText('No value provided.', { exact: true }),
  ).toBeVisible();
  await expect(channels).toHaveAttribute('required', '');
  await expect(
    page.getByText('No values selected.', { exact: true }),
  ).toBeVisible();

  await roles.selectOption(['choice:3']);
  await roles.selectOption(['choice:2', 'choice:3']);
  await page.getByRole('tab', { name: 'State', exact: true }).click();
  await expect(page.locator('#evidence-panel-state pre').first()).toContainText(
    '"roles": [\n    "editor",\n    "reader"',
  );
  await page.getByTestId('decision-reject').click();
  await roles.selectOption(['choice:2', 'choice:3', 'choice:4']);
  await expect(roles).toHaveValues(['choice:2', 'choice:3']);
  await page.getByRole('tab', { name: 'Runtime', exact: true }).click();
  await expect(
    page.locator('#evidence-panel-runtime pre').nth(1),
  ).toContainText('"decision": "rejected"');

  await roles.focus();
  await roles.blur();
  await expect(
    page.locator('#evidence-panel-runtime pre').first(),
  ).toContainText('"touched": true');
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

test('replaces controlled object alternatives independently', async ({
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
  await kind.selectOption('dog');
  await expect(lives).toHaveCount(0);
  await expect(
    page.getByRole('checkbox', { name: 'Lives indoors' }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('textbox', { name: 'Bark volume' }),
  ).toBeVisible();
  await page.getByRole('tab', { name: 'State', exact: true }).click();
  await expect(page.locator('#evidence-panel-state pre').first()).toContainText(
    '"lives": 9',
  );
  expect(
    await name.evaluate(
      (element) =>
        (element as HTMLElement & { __m33Common?: boolean }).__m33Common,
    ),
  ).toBe(true);
});

test('projects and validates shared object composition independently', async ({
  page,
}) => {
  await selectScenario(page, 'object-composition', 'Static object composition');
  const form = page.getByRole('form', {
    name: 'Schema Engine form preview',
  });
  const department = form.getByRole('textbox', { name: 'Department' });
  const displayName = form.getByRole('textbox', { name: 'Display name' });

  await expect
    .poll(() =>
      form
        .locator('[data-field-name]')
        .evaluateAll((fields) =>
          fields.map((field) => (field as HTMLElement).dataset['fieldName']),
        ),
    )
    .toEqual(['department', 'displayName', 'contactEmail', 'active']);
  await expect(department).toHaveAttribute('required', '');
  await expect(displayName).toHaveAttribute('required', '');
  await department.fill('R');
  await displayName.fill('A');
  await expect(department).toHaveAttribute('aria-invalid', 'true');
  await expect(displayName).toHaveAttribute('aria-invalid', 'true');
  await department.fill('Engineering');
  await displayName.fill('Grace Hopper');
  await expect(department).toHaveAttribute('aria-invalid', 'false');
  await expect(displayName).toHaveAttribute('aria-invalid', 'false');
  await page.getByRole('combobox', { name: 'Theme' }).selectOption('dark');
  await expect(form).toBeVisible();
  await expect(page.getByTestId('compile-status')).toHaveText(
    'Public core compilation succeeded.',
  );
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
    const label = group.querySelector('.field-label');
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
  await expect(direct).toContainText('const');
  await page.getByTestId('fixed-control-incompatible').click();
  await expect(
    page
      .getByRole('group', { name: 'Incompatible fixed value' })
      .locator('[data-fixed-value-state]'),
  ).toHaveText('Incompatible value');
  await page.getByRole('tab', { name: 'Runtime', exact: true }).click();
  await expect(
    page
      .getByRole('button', { name: 'Copy operation history' })
      .locator('..')
      .locator('..'),
  ).toContainText('[]');
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
    page.getByRole('form', { name: 'Schema Engine form preview' }),
  ).toContainText('username-unavailable');
  const usernameBorder = await username.evaluate(
    (element) => getComputedStyle(element).borderColor,
  );
  const issueColor = await page
    .getByText('username-unavailable', { exact: true })
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
  const baseline = page
    .locator('#evidence-panel-state details')
    .nth(1)
    .locator('pre');
  await expect(status).toHaveText('No baseline candidate prepared.');

  await page.getByTestId('prepare-scope-profile-name').click();
  await expect(status).toContainText('candidate prepared');
  await expect(accept).toBeEnabled();
  await expect(baseline).toContainText('Ada Lovelace');
  await accept.click();
  await expect(status).toContainText('baseline updated');
  await expect(page.getByTestId('inspector-scope-candidate')).toContainText(
    'Ada Byron',
  );
  await expect(baseline).toContainText('Ada Byron');

  await page.getByRole('button', { name: 'Reset scenario' }).click();
  await page.getByTestId('prepare-scope-current-only-linus').click();
  await expect(status).toContainText('unconfirmable');
  await expect(accept).toBeDisabled();

  await page.getByTestId('prepare-scope-whole-team').click();
  await accept.click();
  await expect(baseline).toContainText('Linus');
  await expect(baseline).toContainText('Baseline note');
  await expect(valueEvidence(page)).toContainText(
    'Unrelated edit remains dirty',
  );
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
  await page.getByTestId('derive-default-candidate').click();
  await expect(status).toContainText('Candidate derived');
  await expect(valueEvidence(page)).not.toContainText('New entity');
  await page.getByTestId('cancel-default-candidate').click();
  await expect(status).toContainText('cancelled');
  await page.getByTestId('derive-default-candidate').click();
  await page.getByTestId('accept-default-candidate').click();
  await expect(valueEvidence(page)).toContainText('New entity');
  await expect(valueEvidence(page)).toContainText('Existing row');
  await expect(status).toContainText('explicitly accepted');
  await page.getByTestId('derive-default-candidate').click();
  await expect(status).toContainText('no effect');
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
  await page.getByRole('button', { name: 'Validate', exact: true }).click();
  await expect(page.getByTestId('configuration-status')).toHaveText(
    'Invalid JSON.',
  );
  await page.getByRole('button', { name: 'Cancel edits' }).click();
  await expect(page.getByTestId('configuration-status')).toHaveText(
    'Not validated.',
  );

  await schemaEditor.fill('{"type":"string"}');
  await page.getByRole('button', { name: 'Validate', exact: true }).click();
  await expect(page.getByTestId('configuration-status')).toHaveText(
    'Configuration compilation failed.',
  );
  await expect(page.getByTestId('configuration-diagnostics')).toContainText(
    'ROOT_TYPE_MUST_BE_OBJECT',
  );
  await page.getByRole('button', { name: 'Cancel edits' }).click();

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
  await page.getByRole('button', { name: 'Validate', exact: true }).click();
  await expect(page.getByTestId('configuration-status')).toHaveText(
    'Configuration valid.',
  );
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  const nickname = page.getByRole('textbox', { name: 'Nickname' });
  await nickname.fill('long');
  await page.getByRole('button', { name: 'All issues' }).click();
  await expect(nickname).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('.field-issues:not([hidden])')).toContainText(
    'maxLength',
  );

  await page.getByRole('button', { name: 'Restore original' }).click();
  await expect(
    page.getByRole('button', { name: 'Confirm configuration', exact: true }),
  ).toBeFocused();
  await page
    .getByRole('button', { name: 'Confirm configuration', exact: true })
    .click();
  await expect(page.getByRole('textbox', { name: 'Nickname' })).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Restore original' }),
  ).toBeDisabled();
});

test('keeps tabs, copy and themes accessible', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
    origin: 'http://127.0.0.1:4212',
  });
  const state = page.getByRole('tab', { name: 'State', exact: true });
  await state.focus();
  await state.press('End');
  const diagnostics = page.getByRole('tab', {
    name: 'Diagnostics',
    exact: true,
  });
  await expect(diagnostics).toHaveAttribute('aria-selected', 'true');
  await diagnostics.press('Home');
  await expect(state).toHaveAttribute('aria-selected', 'true');
  await state.press('ArrowRight');
  await expect(
    page.getByRole('tab', { name: 'Definition', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');

  const integration = page.locator('[data-region="integration-panel"]');
  await expect(
    integration.locator('details.region-disclosure'),
  ).toHaveAttribute('open', '');
  const compile = integration.getByRole('tab', {
    name: 'Compile Definition',
    exact: true,
  });
  const cleanup = integration.getByRole('tab', {
    name: 'Runtime Cleanup',
    exact: true,
  });
  await expect(compile).toHaveAttribute('aria-selected', 'true');
  await compile.press('End');
  await expect(cleanup).toHaveAttribute('aria-selected', 'true');
  await cleanup.press('Home');
  await expect(compile).toHaveAttribute('aria-selected', 'true');
  const compilePanel = integration.getByRole('tabpanel', {
    name: 'Compile Definition',
  });
  await expect(compilePanel).toBeVisible();
  await expect(
    integration.getByRole('tabpanel', { name: 'Create Runtime' }),
  ).toBeHidden();
  const code = compilePanel.locator('code');
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
  const codeSelection = await code.evaluate(
    (element) => getComputedStyle(element, '::selection').backgroundColor,
  );
  expect(codeSelection).toBe('rgb(43, 56, 82)');
  await page.getByRole('tab', { name: 'Schema', exact: true }).click();
  const editor = page.getByRole('textbox', { name: 'JSON Schema editor' });
  await editor.click();
  await editor.press('Meta+A');
  const editorSelection = await page
    .locator('[data-testid="schema-editor"] .cm-selectionBackground')
    .first()
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(editorSelection).toBe('rgb(43, 56, 82)');
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
    page.getByRole('button', { name: 'Validate', exact: true }),
  ).toBeVisible();

  await page.setViewportSize({ width: 800, height: 900 });
  await page.evaluate(() => {
    document.documentElement.style.zoom = '2';
  });
  await expectNoPageOverflow(page);
  await expectWorkspaceStacked(page);
  await expect(
    page.getByRole('button', { name: 'Restore original' }),
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
