// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  referenceScenarios,
  stringEnumArrayControlStates,
} from '@schema-engine-internal/reference-scenarios';
import {
  compileFormDefinition,
  createControlledFormRuntime,
  type FormOperation,
  type Diagnostic,
  type WizardTextResolutionContext,
} from '@rabassoft/schema-engine';

import { StandardDomRenderer } from '../src/dom-renderer.js';
import { StandardReferenceApplication } from '../src/reference-application.js';

const disposals: Array<() => void> = [];

afterEach(() => {
  for (const dispose of disposals.splice(0)) dispose();
  document.body.replaceChildren();
});

describe('StandardDomRenderer', () => {
  it('projects a once-mounted controlled wizard with application-confirmed adjacent navigation', async () => {
    const harness = mount('linear-wizard');
    const wizard = harness.host.querySelector<HTMLElement>('.schema-wizard');
    if (wizard === null) throw new Error('Expected Standard wizard host.');
    const regions = [
      ...wizard.querySelectorAll<HTMLElement>('[role="region"]'),
    ];
    expect(regions).toHaveLength(3);
    expect(regions[0]?.hidden).toBe(false);
    expect(regions[1]?.hidden).toBe(true);
    expect(regions[1]?.hasAttribute('inert')).toBe(true);
    expect(regions[1]?.getAttribute('aria-hidden')).toBe('true');
    expect(wizard.querySelector('[role="tablist"]')).toBeNull();

    harness.application.setDecisionMode('reject');
    clickButton(wizard, 'Next');
    expect(regions[0]?.hidden).toBe(false);
    harness.application.setDecisionMode('confirm');

    harness.application.resolveServiceValidation(true);
    await Promise.resolve();
    await Promise.resolve();
    clickButton(wizard, 'Next');
    expect(regions[0]?.hidden).toBe(true);
    expect(regions[1]?.hidden).toBe(false);
    expect(regions[1]?.hasAttribute('aria-hidden')).toBe(false);
    expect(document.activeElement).toBe(regions[1]?.querySelector('h3'));
    const retained = regions[1]?.querySelector<HTMLInputElement>('input');
    if (retained === null || retained === undefined)
      throw new Error('Expected a retained nested step input.');
    retained.value = 'Retained Standard buffer';
    retained.dispatchEvent(new Event('input', { bubbles: true }));
    clickButton(wizard, 'Previous');
    expect(regions[0]?.hidden).toBe(false);
    expect(wizard.querySelectorAll('[role="region"]')[1]).toBe(regions[1]);
    clickButton(wizard, 'Next');
    expect(regions[1]?.querySelector('input')).toBe(retained);
    expect(retained.value).toBe('Retained Standard buffer');
  });

  it('resolves exact wizard text identities once and normalizes one failed identity', () => {
    const application = new StandardReferenceApplication(
      undefined,
      'linear-wizard',
    );
    const definition = application.getState().definition;
    const runtime = application.getRuntime();
    if (definition === undefined || runtime === undefined)
      throw new Error('Expected a renderable wizard scenario.');
    const host = document.createElement('main');
    const contexts: WizardTextResolutionContext[] = [];
    const diagnostics: Diagnostic[] = [];
    const renderer = new StandardDomRenderer(host, definition, runtime, {
      formId: 'standard-wizard-text',
      resolveText(text, context) {
        if (!('wizard' in context)) return text;
        contexts.push(context);
        if (context.member === 'next') return '';
        return text;
      },
      reportDiagnostics(entries) {
        diagnostics.push(...entries);
      },
    });
    renderer.reconcile(runtime.getSnapshot());
    renderer.reconcile(runtime.getSnapshot());

    const identities = contexts.map((context) =>
      JSON.stringify([
        context.locale,
        context.member,
        context.step?.key,
        context.position,
        context.count,
      ]),
    );
    expect(new Set(identities).size).toBe(identities.length);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]?.code).toBe('TEXT_RESOLUTION_FAILED');
    expect(diagnostics[0]?.parameters?.['member']).toBe('next');
    expect(diagnostics[0]?.parameters?.['reason']).toBe('blank-string-result');
    renderer.dispose();
    application.dispose();
  });

  it('suppresses and cleans an atomically failed wizard step projection', () => {
    const application = new StandardReferenceApplication(
      undefined,
      'linear-wizard',
    );
    const definition = application.getState().definition;
    const runtime = application.getRuntime();
    if (definition === undefined || runtime === undefined)
      throw new Error('Expected a renderable wizard scenario.');
    const original = document.createElement.bind(document);
    const createElement = vi
      .spyOn(document, 'createElement')
      .mockImplementation((name: string, options?: ElementCreationOptions) => {
        if (name === 'h3') throw new Error('unsafe');
        return original(name, options);
      });
    const diagnostics: Diagnostic[] = [];
    const host = original('main');
    const renderer = new StandardDomRenderer(host, definition, runtime, {
      formId: 'standard-wizard-failure',
      reportDiagnostics(entries) {
        diagnostics.push(...entries);
      },
    });
    createElement.mockRestore();

    expect(host.querySelector('.schema-wizard')).toBeNull();
    expect(host.querySelector('input, select, button')).toBeNull();
    expect(diagnostics).toEqual([
      {
        code: 'WIZARD_STEP_HOST_INSTANTIATION_FAILED',
        severity: 'error',
        source: 'runtime',
        parameters: { wizardId: 'onboarding', stepId: 'identity' },
        fallbackMessage: 'Wizard step host could not be instantiated.',
      },
    ]);
    renderer.dispose();
    application.dispose();
  });

  it('projects shared discriminated alternatives with active replacement and stale-event isolation', () => {
    const harness = mount('discriminated-object-alternatives');
    const kind = field(harness.host, 'kind').querySelector('select');
    const commonName = field(harness.host, 'name');
    const lives = field(harness.host, 'lives');
    const livesInput = lives.querySelector('input');
    if (kind === null || livesInput === null) {
      throw new Error('Expected initial Standard M33 controls.');
    }
    expect(field(harness.host, 'indoor')).toBeDefined();
    expect(
      harness.host.querySelector('[data-field-name="barkVolume"]'),
    ).toBeNull();

    livesInput.dispatchEvent(new FocusEvent('focus'));
    kind.value = 'dog';
    kind.dispatchEvent(new Event('change', { bubbles: true }));

    expect(harness.host.querySelector('[data-field-name="lives"]')).toBeNull();
    expect(harness.host.querySelector('[data-field-name="indoor"]')).toBeNull();
    expect(field(harness.host, 'barkVolume')).toBeDefined();
    expect(field(harness.host, 'name')).toBe(commonName);
    expect(lives.isConnected).toBe(false);
    expect(
      harness.application
        .getState()
        .snapshot?.fields.some(({ focused }) => focused),
    ).toBe(false);

    const valueBeforeStaleEvent = harness.application.getState().value;
    livesInput.value = '7';
    livesInput.dispatchEvent(new Event('input', { bubbles: true }));
    expect(harness.application.getState().value).toBe(valueBeforeStaleEvent);
  });

  it('projects the shared M31 scenario with independent controlled multiselection', () => {
    const harness = mount('string-enum-array');
    const rolesHost = field(harness.host, 'roles');
    const roles = rolesHost.querySelector('select');
    const rolesStatus = rolesHost.querySelector('.presence-state');
    if (roles === null || rolesStatus === null) {
      throw new Error('Expected direct M31 controls.');
    }
    const channelsHost = field(harness.host, 'channels');
    const channels = channelsHost.querySelector('select');
    if (channels === null) throw new Error('Expected nested M31 control.');

    expect(roles.multiple).toBe(true);
    expect(roles.options).toHaveLength(6);
    expect(Array.from(roles.options, ({ value }) => value)).toEqual(
      Array.from({ length: 6 }, (_value, index) => `choice:${index}`),
    );
    expect(Array.from(roles.options, ({ textContent }) => textContent)).toEqual(
      [
        '(empty string)',
        '(single space)',
        'Reader',
        'Editor',
        'Reviewer',
        'Idea',
      ],
    );
    expect(rolesStatus.textContent).toBe('No value provided.');
    expect(rolesHost.querySelector('button')?.hidden).toBe(true);
    expect(channels.required).toBe(true);
    expect(channelsHost.querySelector('.presence-state')?.textContent).toBe(
      'No values selected.',
    );
    expect(channelsHost.querySelector('button')?.hidden).toBe(false);

    channelsHost.querySelector('button')?.click();
    expect(harness.application.getState().snapshot?.valid).toBe(false);
    expect(
      harness.application
        .getState()
        .snapshot?.fields.find(
          ({ path }) => path.length === 2 && path[1] === 'channels',
        )
        ?.issues.map(({ code }) => code),
    ).toEqual(['required']);
    harness.application.replaceValue(
      harness.application.getState().scenario.initialState.value,
    );

    roles.options[3]!.selected = true;
    roles.dispatchEvent(new Event('change', { bubbles: true }));
    roles.options[2]!.selected = true;
    roles.options[3]!.selected = true;
    roles.dispatchEvent(new Event('change', { bubbles: true }));
    expect(harness.application.getState().value).toMatchObject({
      roles: ['editor', 'reader'],
    });
    expect(harness.application.getState().history.slice(-2)).toMatchObject([
      { decision: 'confirmed', operation: { value: ['editor'] } },
      { decision: 'confirmed', operation: { value: ['editor', 'reader'] } },
    ]);
    expect(requiredSnapshot(harness.application).dirty).toBe(true);
    harness.application.commitBaseline();
    expect(requiredSnapshot(harness.application).dirty).toBe(false);

    harness.application.setDecisionMode('reject');
    roles.options[4]!.selected = true;
    roles.dispatchEvent(new Event('change', { bubbles: true }));
    expect(harness.application.getState().history.at(-1)).toMatchObject({
      decision: 'rejected',
      operation: { value: ['editor', 'reader', 'reviewer'] },
    });
    expect(selectedTokens(roles)).toEqual(['choice:2', 'choice:3']);

    harness.application.setDecisionMode('confirm');
    harness.application.replaceValue({
      ...harness.application.getState().value,
      roles: ['reader', 'editor'],
    });
    expect(rolesStatus.textContent).toBe('Selected: Reader, Editor');
    const historyLength = harness.application.getState().history.length;
    roles.dispatchEvent(new Event('change', { bubbles: true }));
    expect(harness.application.getState().history).toHaveLength(historyLength);

    roles.dispatchEvent(new FocusEvent('focus'));
    roles.dispatchEvent(new FocusEvent('blur'));
    expect(
      requiredSnapshot(harness.application).fields.find(
        ({ path }) => path.length === 1 && path[0] === 'roles',
      ),
    ).toMatchObject({ focused: false, touched: true });

    harness.application.setLocale('es');
    expect(rolesStatus.textContent).toBe('Seleccionados: Reader, Editor');
    const clear = rolesHost.querySelector('button');
    if (clear === null) throw new Error('Expected direct clear action.');
    expect(clear.textContent).toBe('Limpiar');
    clear.click();
    expect(Object.hasOwn(harness.application.getState().value, 'roles')).toBe(
      false,
    );
    expect(rolesStatus.textContent).toBe(
      'No se ha proporcionado ningún valor.',
    );

    for (const { value: invalid } of stringEnumArrayControlStates) {
      harness.application.replaceValue(invalid);
      expect(roles.disabled).toBe(true);
      expect(rolesHost.tabIndex).toBe(0);
      expect(rolesStatus.textContent).toBe('Selección incompatible.');
      expect(
        requiredSnapshot(harness.application).fields.find(
          ({ path }) => path.length === 1 && path[0] === 'roles',
        )?.issues.length,
      ).toBeGreaterThan(0);
      expect(
        rolesHost.querySelector('.field-issues')?.hasAttribute('hidden'),
      ).toBe(false);
      const incompatibleClear = rolesHost.querySelector('button');
      if (incompatibleClear === null) {
        throw new Error('Expected incompatible clear action.');
      }
      expect(incompatibleClear.disabled).toBe(false);
      incompatibleClear.click();
      expect(Object.hasOwn(harness.application.getState().value, 'roles')).toBe(
        false,
      );
    }

    const historyBeforeDispose = harness.application.getState().history.length;
    harness.dispose();
    roles.options[2]!.selected = true;
    roles.dispatchEvent(new Event('change', { bubbles: true }));
    expect(harness.application.getState().history).toHaveLength(
      historyBeforeDispose,
    );
  });

  it('projects the shared conditional scenario with mounted identity and inactive event safety', () => {
    const harness = mount('conditional-field-state');
    const initial = requiredSnapshot(harness.application);
    const snapshot = (name: string) =>
      requiredSnapshot(harness.application).fields.find(
        ({ path }) => path.length === 1 && path[0] === name,
      );

    expect(
      Object.fromEntries(
        [
          'displayName',
          'role',
          'nullableNote',
          'zeroNote',
          'emptyNote',
          'drivenNote',
        ].map((name) => [
          name,
          ((field) => ({ visible: field?.visible, enabled: field?.enabled }))(
            initial.fields.find(
              ({ path }) => path.length === 1 && path[0] === name,
            ),
          ),
        ]),
      ),
    ).toEqual({
      displayName: { visible: true, enabled: true },
      role: { visible: true, enabled: true },
      nullableNote: { visible: true, enabled: true },
      zeroNote: { visible: true, enabled: true },
      emptyNote: { visible: true, enabled: true },
      drivenNote: { visible: true, enabled: true },
    });
    expect(
      requiredSnapshot(harness.application).fields.find(
        ({ path }) => path.join('.') === 'profile.note',
      ),
    ).toMatchObject({ visible: true, enabled: true });

    const nameHost = field(harness.host, 'displayName');
    const name = fieldControl(harness.host, 'displayName');
    name.value = 'Grace';
    name.dispatchEvent(new Event('input', { bubbles: true }));
    name.dispatchEvent(new Event('focus'));
    expect(snapshot('displayName')).toMatchObject({
      focused: true,
      touched: false,
    });
    name.value = 'unconfirmed';

    const review = fieldControl(harness.host, 'reviewCode');
    review.value = 'needs-review';
    review.dispatchEvent(new Event('input', { bubbles: true }));
    const showDetails = fieldControl(harness.host, 'showDetails');
    showDetails.checked = false;
    showDetails.dispatchEvent(new Event('change', { bubbles: true }));

    expect(field(harness.host, 'displayName')).toBe(nameHost);
    expect(fieldControl(harness.host, 'displayName')).toBe(name);
    expect(nameHost.hidden).toBe(true);
    expect(nameHost.hasAttribute('inert')).toBe(true);
    expect(nameHost.getAttribute('aria-hidden')).toBe('true');
    expect(name.value).toBe('Grace');
    expect(snapshot('displayName')).toMatchObject({
      visible: false,
      focused: false,
      touched: false,
    });
    expect(snapshot('reviewCode')).toMatchObject({
      visible: false,
      valid: false,
      showIssues: true,
    });
    expect(requiredSnapshot(harness.application)).toMatchObject({
      valid: false,
      dirty: true,
    });

    const historyBeforeHiddenEvents =
      harness.application.getState().history.length;
    name.value = 'stale hidden edit';
    name.dispatchEvent(new Event('input', { bubbles: true }));
    name.dispatchEvent(new Event('focus'));
    name.dispatchEvent(new Event('blur'));
    expect(harness.application.getState().history).toHaveLength(
      historyBeforeHiddenEvents,
    );
    expect(harness.application.getState().runtimeDiagnostics).toEqual([]);

    const enableRole = fieldControl(harness.host, 'enableRole');
    enableRole.checked = false;
    enableRole.dispatchEvent(new Event('change', { bubbles: true }));
    const roleHost = field(harness.host, 'role');
    const role = roleHost.querySelector('select');
    const roleClear = [...roleHost.querySelectorAll('button')].find(
      ({ textContent }) => textContent === 'Clear',
    );
    if (role === null || roleClear === undefined)
      throw new Error('Expected conditional role controls.');
    expect(role.disabled).toBe(true);
    expect(roleClear.disabled).toBe(true);
    expect(roleHost.hidden).toBe(false);
    const historyBeforeDisabledEvents =
      harness.application.getState().history.length;
    role.value = 'admin';
    role.dispatchEvent(new Event('change', { bubbles: true }));
    role.dispatchEvent(new Event('focus'));
    role.dispatchEvent(new Event('blur'));
    roleClear.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(harness.application.getState().history).toHaveLength(
      historyBeforeDisabledEvents,
    );

    const showDriver = fieldControl(harness.host, 'showDriver');
    showDriver.checked = false;
    showDriver.dispatchEvent(new Event('change', { bubbles: true }));
    expect(field(harness.host, 'driver').hidden).toBe(true);
    expect(field(harness.host, 'drivenNote').hidden).toBe(false);
    expect(snapshot('driver')).toMatchObject({
      visible: false,
      presence: { kind: 'value', value: false },
    });
    expect(snapshot('drivenNote')?.visible).toBe(true);

    showDetails.checked = true;
    showDetails.dispatchEvent(new Event('change', { bubbles: true }));
    enableRole.checked = true;
    enableRole.dispatchEvent(new Event('change', { bubbles: true }));
    expect(field(harness.host, 'displayName')).toBe(nameHost);
    expect(fieldControl(harness.host, 'displayName')).toBe(name);
    expect(nameHost.hidden).toBe(false);
    expect(nameHost.hasAttribute('inert')).toBe(false);
    expect(nameHost.hasAttribute('aria-hidden')).toBe(false);
    expect(name.value).toBe('Grace');
    expect(role.disabled).toBe(false);
    expect(role.value).toBe('editor');
  });

  it('projects shared object composition through the independent Standard lane', () => {
    const harness = mount('object-composition');
    const state = harness.application.getState();

    expect(
      state.definition?.fields.map(({ name, required }) => ({
        name,
        required,
      })),
    ).toEqual([
      { name: 'department', required: true },
      { name: 'displayName', required: true },
      { name: 'contactEmail', required: false },
      { name: 'active', required: false },
    ]);
    expect(state.compilationDiagnostics).toEqual([]);
    expect(state.runtimeDiagnostics).toEqual([]);
    expect(
      Array.from(
        harness.host.querySelectorAll<HTMLElement>('[data-field-name]'),
        ({ dataset }) => dataset['fieldName'],
      ),
    ).toEqual(['department', 'displayName', 'contactEmail', 'active']);
    expect(fieldControl(harness.host, 'department').required).toBe(true);
    fieldControl(harness.host, 'displayName').value = 'A';
    fieldControl(harness.host, 'displayName').dispatchEvent(
      new Event('input', { bubbles: true }),
    );
    fieldControl(harness.host, 'department').value = 'R';
    fieldControl(harness.host, 'department').dispatchEvent(
      new Event('input', { bubbles: true }),
    );
    expect(harness.application.getState().snapshot?.valid).toBe(false);
    expect(
      harness.application
        .getState()
        .snapshot?.fields.flatMap(({ issues }) => issues)
        .map(({ code, path }) => ({ code, path })),
    ).toEqual([
      { code: 'minLength', path: ['department'] },
      { code: 'minLength', path: ['displayName'] },
    ]);
    expect(harness.application.getState().baselineValue).toEqual(
      state.scenario.initialState.baselineValue,
    );
  });

  it('builds labelled normalized controls once and reconciles confirmed values', () => {
    const harness = mount();
    const name = fieldControl(harness.host, 'name');
    const sameName = name;

    expect(name.getAttribute('required')).not.toBeNull();
    expect(
      harness.host.querySelector(`label[for="${name.id}"]`)?.textContent,
    ).toBe('Name');
    name.value = 'Grace';
    name.dispatchEvent(new Event('input', { bubbles: true }));

    expect(harness.application.getState().value).toMatchObject({
      name: 'Grace',
    });
    expect(fieldControl(harness.host, 'name')).toBe(sameName);
    expect(name.value).toBe('Grace');
    expect(harness.application.getState().history).toHaveLength(1);
    expect(
      [...field(harness.host, 'name').querySelectorAll('button')].find(
        ({ textContent }) => textContent === 'Clear',
      )?.hidden,
    ).toBe(false);

    const role = field(harness.host, 'role').querySelector('select');
    if (role === null) throw new Error('Expected role select.');
    role.value = 'viewer';
    role.dispatchEvent(new Event('change', { bubbles: true }));
    expect(harness.application.getState().value).toMatchObject({
      role: 'viewer',
    });
  });

  it('projects semantic string input types independently and emits exact values', () => {
    const compiled = compileFormDefinition({
      schema: {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          birthday: { type: 'string', format: 'date' },
          startsAt: { type: 'string', format: 'date-time' },
          contact: {
            type: 'string',
            format: 'email',
            enum: ['one@example.com', 'two@example.com'],
          },
        },
      },
    });
    if (!compiled.success) throw new Error('Expected semantic definition.');
    const created = createControlledFormRuntime({
      formId: 'standard-semantic',
      definition: compiled.definition,
      schema: {},
      value: {
        email: 'old@example.com',
        birthday: '2000-01-01',
        startsAt: '2026-07-30T12:34:56Z',
        contact: 'one@example.com',
      },
      baselineValue: {
        email: 'old@example.com',
        birthday: '2000-01-01',
        startsAt: '2026-07-30T12:34:56Z',
        contact: 'one@example.com',
      },
      locale: 'en',
      validator: { validate: () => ({ valid: true, issues: [] }) },
    });
    if (!created.success) throw new Error('Expected semantic runtime.');
    const operations: FormOperation[] = [];
    const subscription = created.runtime.subscribeOperations((operation) =>
      operations.push(operation),
    );
    if (!subscription.success) throw new Error('Expected operation listener.');
    const host = document.createElement('main');
    document.body.append(host);
    const renderer = new StandardDomRenderer(
      host,
      compiled.definition,
      created.runtime,
      { formId: 'standard-semantic' },
    );
    renderer.reconcile(created.runtime.getSnapshot());
    disposals.push(() => {
      subscription.unsubscribe();
      renderer.dispose();
      created.runtime.dispose();
    });

    const email = fieldControl(host, 'email');
    const birthday = fieldControl(host, 'birthday');
    const startsAt = fieldControl(host, 'startsAt');
    expect(email.type).toBe('email');
    expect(birthday.type).toBe('date');
    expect(startsAt.type).toBe('text');
    expect(field(host, 'contact').querySelector('select')).not.toBeNull();

    email.value = 'Exact+tag@example.com';
    email.dispatchEvent(new Event('input', { bubbles: true }));
    startsAt.value = '2026-07-30T12:34:56+02:00';
    startsAt.dispatchEvent(new Event('input', { bubbles: true }));
    expect(operations).toMatchObject([
      { type: 'set-value', path: ['email'], value: 'Exact+tag@example.com' },
      {
        type: 'set-value',
        path: ['startsAt'],
        value: '2026-07-30T12:34:56+02:00',
      },
    ]);
  });

  it('projects fixed values independently with localized static semantics and zero intentions', () => {
    const compiled = compileFormDefinition({
      schema: {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        type: 'object',
        properties: {
          label: {
            type: 'string',
            const: 'fixed',
            description: 'Fixed description',
          },
          zero: { type: 'number', const: 0 },
          flag: { type: 'boolean', const: false },
          optional: { type: ['string', 'null'], const: null },
          empty: { type: 'string', const: '' },
          broken: { type: 'string', const: 'safe' },
          parent: {
            type: 'object',
            properties: { child: { type: 'integer', const: 2 } },
          },
        },
      },
      uiSchema: { fields: { label: { hint: 'Fixed hint', tooltip: 'Info' } } },
    });
    if (!compiled.success) throw new Error('Expected fixed definition.');
    const initialValue: Record<string, unknown> = {
      label: '  other  ',
      zero: -0,
      flag: false,
      optional: null,
      empty: '',
      broken: { hostile: true },
    };
    const created = createControlledFormRuntime({
      formId: 'standard-fixed',
      definition: compiled.definition,
      schema: {},
      value: initialValue,
      baselineValue: initialValue,
      locale: 'en',
      validationVisibility: 'all',
      validator: {
        validate: () => ({
          valid: false,
          issues: [
            {
              code: 'const',
              keyword: 'const',
              path: ['label'],
              parameters: { allowedValue: 'fixed' },
            },
          ],
        }),
      },
    });
    if (!created.success) throw new Error('Expected fixed runtime.');
    const operations: FormOperation[] = [];
    const subscription = created.runtime.subscribeOperations((operation) =>
      operations.push(operation),
    );
    if (!subscription.success) throw new Error('Expected operation listener.');
    const host = document.createElement('main');
    document.body.append(host);
    const renderer = new StandardDomRenderer(
      host,
      compiled.definition,
      created.runtime,
      { formId: 'standard-fixed' },
    );
    const reconcile = (): void =>
      renderer.reconcile(created.runtime.getSnapshot());
    reconcile();
    disposals.push(() => {
      subscription.unsubscribe();
      renderer.dispose();
      created.runtime.dispose();
    });

    const label = field(host, 'label');
    const labelValue = label.querySelector<HTMLElement>('.fixed-value')!;
    expect(label.getAttribute('role')).toBe('group');
    expect(label.tabIndex).toBe(-1);
    expect(label.getAttribute('aria-labelledby')).toBe(
      label.querySelector('.field-label')?.id,
    );
    expect(label.getAttribute('aria-describedby')?.split(' ')).toEqual([
      label.querySelector('.supporting-text')?.id,
      [...label.querySelectorAll('.supporting-text')][1]?.id,
      label.querySelector('.field-issues')?.id,
    ]);
    expect(label.getAttribute('aria-invalid')).toBe('true');
    expect(label.hasAttribute('aria-required')).toBe(false);
    expect(label.title).toBe('Info');
    expect(labelValue.id.endsWith('-fixed-value')).toBe(true);
    expect(labelValue.dataset['fixedValueState']).toBe('value');
    expect(labelValue.textContent).toBe('  other  ');
    expect(labelValue.classList.contains('fixed-value')).toBe(true);
    expect(
      label.querySelector('.field-issues:not([hidden])')?.textContent,
    ).toBe('const');
    expect(host.querySelector('input, select, button, [tabindex]')).toBeNull();
    expect(fixedValue(host, 'zero')).toMatchObject({
      textContent: '-0',
      dataset: { fixedValueState: 'value' },
    });
    expect(fixedValue(host, 'flag').textContent).toBe('false');
    expect(fixedValue(host, 'optional').textContent).toBe('Null value');
    expect(fixedValue(host, 'empty').textContent).toBe('""');
    expect(fixedValue(host, 'broken')).toMatchObject({
      textContent: 'Incompatible value',
      dataset: { fixedValueState: 'incompatible' },
    });
    expect(fixedValue(host, 'child')).toMatchObject({
      textContent: 'Unavailable value',
      dataset: { fixedValueState: 'unavailable' },
    });

    created.runtime.setValidationVisibility('touched');
    reconcile();
    expect(label.querySelector('.field-issues')?.hasAttribute('hidden')).toBe(
      true,
    );
    expect(label.getAttribute('aria-describedby')?.split(' ')).toEqual([
      label.querySelector('.supporting-text')?.id,
      [...label.querySelectorAll('.supporting-text')][1]?.id,
    ]);
    expect(label.getAttribute('aria-invalid')).toBe('true');

    created.runtime.updateExternalState({
      value: { ...initialValue, label: undefined, parent: 'blocked' },
      locale: 'es',
    });
    reconcile();
    expect(fixedValue(host, 'label').textContent).toBe('Valor incompatible');
    expect(fixedValue(host, 'child').textContent).toBe('Valor no disponible');
    created.runtime.updateExternalState({
      value: {
        zero: -0,
        flag: false,
        optional: null,
        empty: '',
        broken: 'safe',
      },
      locale: 'fr',
    });
    reconcile();
    expect(fixedValue(host, 'label')).toMatchObject({
      textContent: 'Missing value',
      dataset: { fixedValueState: 'missing' },
    });
    expect(operations).toEqual([]);
    renderer.dispose();
    expect(operations).toEqual([]);
  });

  it('reconciles string rejection without emitting during rendering', () => {
    const harness = mount();
    harness.application.setDecisionMode('reject');
    const name = fieldControl(harness.host, 'name');
    const historyBefore = harness.application.getState().history.length;
    harness.renderer.reconcile(requiredSnapshot(harness.application));
    expect(harness.application.getState().history).toHaveLength(historyBefore);

    name.value = 'Rejected';
    name.dispatchEvent(new Event('input', { bubbles: true }));
    expect(name.value).toBe('Ada');
    expect(harness.application.getState().value).toMatchObject({ name: 'Ada' });
    expect(harness.application.getState().history[0]?.decision).toBe(
      'rejected',
    );
  });

  it('preserves an incomplete numeric buffer while focused and restores it on blur', () => {
    const harness = mount();
    const age = fieldControl(harness.host, 'age');
    age.dispatchEvent(new Event('focus'));
    age.value = '-';
    age.dispatchEvent(new Event('input', { bubbles: true }));

    expect(age.value).toBe('-');
    expect(harness.application.getState().value).toMatchObject({ age: 37 });
    expect(harness.application.getState().history).toEqual([]);

    age.value = '1.';
    age.dispatchEvent(new Event('input', { bubbles: true }));
    expect(age.value).toBe('1.');
    expect(harness.application.getState().history).toEqual([]);

    age.dispatchEvent(new Event('blur'));
    expect(age.value).toBe('37');
    expect(
      harness.application
        .getState()
        .snapshot?.fields.find(
          ({ path }) => path.length === 1 && path[0] === 'age',
        )?.touched,
    ).toBe(true);
  });

  it('restores rejected numbers on blur and parses the selected locale', () => {
    const harness = mount();
    harness.application.setDecisionMode('reject');
    const age = fieldControl(harness.host, 'age');
    age.dispatchEvent(new Event('focus'));
    age.value = '40';
    age.dispatchEvent(new Event('input', { bubbles: true }));
    expect(age.value).toBe('40');
    age.dispatchEvent(new Event('blur'));
    expect(age.value).toBe('37');

    harness.application.setDecisionMode('confirm');
    harness.application.setLocale('es');
    const score = fieldControl(harness.host, 'score');
    expect(score.value).toBe('9,5');
    score.dispatchEvent(new Event('focus'));
    score.value = '8,5';
    score.dispatchEvent(new Event('input', { bubbles: true }));
    expect(harness.application.getState().value).toMatchObject({ score: 8.5 });
  });

  it('renders validation semantics and described issue text', () => {
    const harness = mount();
    harness.application.setValidationVisibility('all');
    const name = fieldControl(harness.host, 'name');
    name.value = '';
    name.dispatchEvent(new Event('input', { bubbles: true }));

    expect(name.getAttribute('aria-invalid')).toBe('true');
    const describedBy = name.getAttribute('aria-describedby')?.split(' ') ?? [];
    expect(describedBy.length).toBeGreaterThan(0);
    expect(
      harness.host.querySelector('.field-issues:not([hidden])')?.textContent,
    ).toContain('minLength');
  });

  it('renders nested fieldsets and static presentation sections from normalized definitions', () => {
    const nested = mount('nested-profile');
    expect(
      [...nested.host.querySelectorAll('legend')].map(
        ({ textContent }) => textContent,
      ),
    ).toEqual(['User profile', 'Postal address']);

    nested.dispose();
    const sections = mount('presentation-sections');
    expect(
      [...sections.host.querySelectorAll('.form-section > legend')].map(
        ({ textContent }) => textContent,
      ),
    ).toEqual(['Identity', 'Contact preferences']);
  });

  it('projects advanced layout with exact state, accessibility and mounted reconciliation', () => {
    const harness = mount('advanced-presentation');
    const root = harness.host;
    const tabs = Array.from(
      root.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    );
    const panels = Array.from(
      root.querySelectorAll<HTMLElement>('[role="tabpanel"]'),
    );
    expect(tabs.map(({ textContent }) => textContent)).toEqual([
      'Identity',
      'Contact',
    ]);
    expect(tabs.map((tab) => tab.getAttribute('aria-selected'))).toEqual([
      'true',
      'false',
    ]);
    const tabBase = `se-${encodeURIComponent(
      JSON.stringify([
        'reference-standard-advanced-presentation',
        'presentation',
        'tabs',
        'account-tabs',
      ]),
    )}`;
    expect(root.querySelector('[role="tablist"]')?.id).toBe(
      `${tabBase}--tablist`,
    );
    expect(panels.map(({ hidden }) => hidden)).toEqual([false, true]);
    const email = fieldControl(root, 'email');
    expect(panels[1]?.contains(email)).toBe(true);
    email.value = 'hidden@rabassoft.test';
    email.dispatchEvent(new Event('input', { bubbles: true }));
    expect(harness.application.getState().value).toMatchObject({
      email: 'hidden@rabassoft.test',
    });
    expect(fieldControl(root, 'email')).toBe(email);

    tabs[1]?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    );
    expect(tabs[0]?.getAttribute('aria-selected')).toBe('true');
    tabs[0]?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'End', bubbles: true }),
    );
    expect(tabs[1]?.getAttribute('aria-selected')).toBe('true');
    expect(tabs[1]?.getAttribute('aria-controls')).toBe(panels[1]?.id);
    expect(panels[1]?.getAttribute('aria-labelledby')).toBe(tabs[1]?.id);

    const triggers = Array.from(
      root.querySelectorAll<HTMLButtonElement>('[id$="--trigger"]'),
    );
    expect(
      triggers.map(
        (trigger) =>
          trigger.querySelector('.presentation-accordion-indicator')
            ?.textContent,
      ),
    ).toEqual(['+', '+']);
    triggers[0]?.click();
    triggers[1]?.click();
    expect(
      triggers.map((trigger) => trigger.getAttribute('aria-expanded')),
    ).toEqual(['true', 'true']);
    expect(
      triggers.map(
        (trigger) =>
          trigger.querySelector('.presentation-accordion-indicator')
            ?.textContent,
      ),
    ).toEqual(['−', '−']);
    expect(root.querySelectorAll('.presentation-grid-cell')).toHaveLength(2);

    harness.application.setLocale('es');
    expect(tabs[1]?.getAttribute('aria-selected')).toBe('true');
    expect(triggers[0]?.getAttribute('aria-expanded')).toBe('true');
    harness.application.resetScenario();
    expect(tabs[1]?.getAttribute('aria-selected')).toBe('true');
    expect(triggers[0]?.getAttribute('aria-expanded')).toBe('true');
    harness.dispose();
    const replacement = mount('advanced-presentation');
    expect(
      replacement.host
        .querySelector('[role="tab"]')
        ?.getAttribute('aria-selected'),
    ).toBe('true');
    expect(
      Array.from(replacement.host.querySelectorAll('[id$="--trigger"]')).map(
        (trigger) => trigger.getAttribute('aria-expanded'),
      ),
    ).toEqual(['false', 'false']);
  });

  it('resolves Standard labels depth-first with safe local fallback', () => {
    const scenario = referenceScenarios.find(
      ({ id }) => id === 'advanced-presentation',
    );
    if (scenario === undefined) throw new Error('Advanced scenario missing.');
    const application = new StandardReferenceApplication(
      undefined,
      scenario.id,
    );
    const state = application.getState();
    const runtime = application.getRuntime();
    if (state.definition === undefined || runtime === undefined)
      throw new Error('Advanced runtime missing.');
    const calls: string[] = [];
    const host = document.createElement('main');
    const renderer = new StandardDomRenderer(host, state.definition, runtime, {
      formId: `reference-standard-${scenario.id}`,
      resolvePresentationLabel(label) {
        calls.push(label);
        if (label === 'Account details') throw new Error('Local resolver');
        if (label === 'Contact') return { label };
        if (label === 'Security') return ' ';
        return `Resolved ${label}`;
      },
    });
    expect(calls).toEqual([
      'Account workspace',
      'Account details',
      'Identity',
      'Identity grid',
      'Contact',
      'Account preferences',
      'Notifications',
      'Security',
    ]);
    expect(
      host.querySelector('[role="tablist"]')?.getAttribute('aria-label'),
    ).toBe('Account details');
    expect(
      Array.from(host.querySelectorAll('[role="tab"]')).at(-1)?.textContent,
    ).toBe('Contact');
    expect(
      host.querySelector('[id$="--accordion"]')?.getAttribute('aria-label'),
    ).toBe('Resolved Account preferences');
    expect(
      Array.from(host.querySelectorAll('[id$="--trigger"]'))
        .at(-1)
        ?.querySelector('span')?.textContent,
    ).toBe('Security');
    renderer.reconcile(runtime.getSnapshot());
    expect(calls).toHaveLength(8);
    application.setLocale('es');
    renderer.reconcile(runtime.getSnapshot());
    expect(calls).toHaveLength(16);
    renderer.dispose();
    application.dispose();
  });

  it('projects recursive local owners with exact stable-item state and fresh reinsertion', () => {
    const harness = mount('recursive-local-presentation');
    const root = harness.host;
    const definition = harness.application.getState().definition;
    expect(definition).toBeDefined();
    expect(
      definition?.presentation.map((entry) =>
        entry.kind === 'form-node' ? entry.node.name : entry.kind,
      ),
    ).toEqual(['profile', 'rows']);
    expect(root.querySelectorAll('.collection-group')).toHaveLength(1);
    expect(root.querySelectorAll('.collection-item')).toHaveLength(2);
    const beta = item(root, 'beta');
    const betaTabs = Array.from(
      beta.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    );
    const betaStatus =
      beta.querySelector<HTMLButtonElement>('[id$="--trigger"]');
    expect(root.querySelectorAll('[role="tablist"]')).toHaveLength(3);
    expect(betaTabs.map(({ textContent }) => textContent)).toEqual([
      'Summary',
      'Details',
    ]);
    expect(beta.querySelectorAll('.presentation-grid-cell')).toHaveLength(2);
    expect(beta.querySelector('[data-field-name="id"]')).toBeNull();

    betaTabs[1]?.click();
    betaStatus?.click();
    const name = fieldControl(beta, 'name');
    clickButton(beta, 'Move earlier');

    expect(item(root, 'beta')).toBe(beta);
    expect(betaTabs[1]?.getAttribute('aria-selected')).toBe('true');
    expect(betaStatus?.getAttribute('aria-expanded')).toBe('true');
    expect(name.value).toBe('Beta');
    expect(readRows(harness.application).map(({ id }) => id)).toEqual([
      'beta',
      'alpha',
    ]);

    clickButton(beta, 'Move later');
    expect(item(root, 'beta')).toBe(beta);
    expect(betaTabs[1]?.getAttribute('aria-selected')).toBe('true');
    const oldTabsId = beta.querySelector('[role="tablist"]')?.id;
    expect(oldTabsId).toBe(
      `se-${encodeURIComponent(
        JSON.stringify([
          'reference-standard-recursive-local-presentation',
          'presentation',
          ['item', ['rows'], 'beta'],
          'tabs',
          'item-tabs',
        ]),
      )}--tablist`,
    );

    clickButton(beta, 'Remove item');
    expect(root.querySelector('[data-item-id="beta"]')).toBeNull();
    const removedValue = harness.application.getState().value as {
      readonly profile: Readonly<object>;
      readonly rows: readonly Readonly<object>[];
    };
    harness.application.replaceValue({
      profile: removedValue.profile,
      rows: [
        ...removedValue.rows,
        {
          id: 'beta',
          name: 'Beta fresh',
          status: 'Draft',
          details: { role: 'Reviewer', active: false },
        },
      ],
    });
    const replacement = item(root, 'beta');
    expect(replacement).not.toBe(beta);
    expect(
      replacement.querySelector('[role="tab"]')?.getAttribute('aria-selected'),
    ).toBe('true');
    expect(
      replacement
        .querySelector('[id$="--trigger"]')
        ?.getAttribute('aria-expanded'),
    ).toBe('false');
    const replacementName = fieldControl(replacement, 'name');
    const historyBeforeInvalid = harness.application.getState().history.length;
    harness.application.replaceValue({
      profile: removedValue.profile,
      rows: [
        {
          name: 'Invalid identity',
          status: 'Blocked',
          details: { role: 'Unknown', active: false },
        },
      ],
    });
    expect(root.querySelectorAll('[data-item-id]')).toHaveLength(0);
    replacementName.value = 'Ignored after invalidation';
    replacementName.dispatchEvent(new Event('input', { bubbles: true }));
    expect(harness.application.getState().history).toHaveLength(
      historyBeforeInvalid,
    );
  });

  it('resolves each recursive static presentation label once per locale', () => {
    const scenario = referenceScenarios.find(
      ({ id }) => id === 'recursive-local-presentation',
    );
    if (scenario === undefined) throw new Error('Recursive scenario missing.');
    const application = new StandardReferenceApplication(
      undefined,
      scenario.id,
    );
    const state = application.getState();
    const runtime = application.getRuntime();
    if (state.definition === undefined || runtime === undefined)
      throw new Error('Recursive runtime missing.');
    const calls: string[] = [];
    const host = document.createElement('main');
    const renderer = new StandardDomRenderer(host, state.definition, runtime, {
      formId: `reference-standard-${scenario.id}`,
      resolvePresentationLabel(label) {
        calls.push(label);
        return label;
      },
    });
    renderer.reconcile(runtime.getSnapshot());
    expect(calls).toHaveLength(11);
    expect(calls.filter((label) => label === 'Item details')).toHaveLength(1);
    expect(calls.filter((label) => label === 'Detail values')).toHaveLength(1);

    application.setLocale('es');
    renderer.reconcile(runtime.getSnapshot());
    expect(calls).toHaveLength(22);
    renderer.dispose();
    application.dispose();
  });

  it('keeps null, missing, false and zero visibly distinct', () => {
    const harness = mount('nullable-preferences');
    expect(field(harness.host, 'nickname').querySelector('output')?.value).toBe(
      'Null',
    );
    expect(
      field(harness.host, 'notifications').querySelector('output')?.value,
    ).toBe('False');
    expect(field(harness.host, 'volume').querySelector('output')?.value).toBe(
      'Value present',
    );

    clickButton(field(harness.host, 'volume'), 'Clear');
    expect(field(harness.host, 'volume').querySelector('output')?.value).toBe(
      'Missing',
    );
    clickButton(field(harness.host, 'notifications'), 'Set null');
    expect(
      field(harness.host, 'notifications').querySelector('output')?.value,
    ).toBe('Null');
    clickButton(field(harness.host, 'notifications'), 'Clear');
    expect(
      field(harness.host, 'notifications').querySelector('output')?.value,
    ).toBe('Missing');

    const volume = fieldControl(harness.host, 'volume');
    volume.value = '0';
    volume.dispatchEvent(new Event('input', { bubbles: true }));
    expect(field(harness.host, 'volume').querySelector('output')?.value).toBe(
      'Zero',
    );
    const nickname = fieldControl(harness.host, 'nickname');
    nickname.value = '';
    nickname.dispatchEvent(new Event('input', { bubbles: true }));
    expect(field(harness.host, 'nickname').querySelector('output')?.value).toBe(
      'Empty string',
    );
  });

  it('removes every field listener idempotently on disposal', () => {
    const harness = mount();
    const name = fieldControl(harness.host, 'name');
    harness.dispose();
    harness.dispose();
    name.value = 'Ignored';
    name.dispatchEvent(new Event('input', { bubbles: true }));

    expect(harness.application.getState().value).toMatchObject({ name: 'Ada' });
    expect(harness.application.getState().history).toEqual([]);
  });

  it('reconciles collection items by stable identity through Public intentions', () => {
    const harness = mount('stable-team');
    const ada = item(harness.host, 'ada');
    const adaName = fieldControl(ada, 'name');
    adaName.value = 'Ada Lovelace';
    adaName.dispatchEvent(new Event('input', { bubbles: true }));
    expect(item(harness.host, 'ada')).toBe(ada);
    expect(readTeam(harness.application)[0]).toMatchObject({
      id: 'ada',
      name: 'Ada Lovelace',
    });

    labelledControl(harness.host, 'New item id').value = 'linus';
    labelledControl(harness.host, 'New name').value = 'Linus';
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');
    clickButton(harness.host, 'Add item');
    const linus = item(harness.host, 'linus');
    expect(focus).toHaveBeenCalled();
    focus.mockRestore();
    expect(readTeam(harness.application).at(-1)).toEqual({
      id: 'linus',
      name: 'Linus',
    });

    clickButton(linus, 'Move earlier');
    clickButton(linus, 'Move earlier');
    expect(readTeam(harness.application).map(({ id }) => id)).toEqual([
      'linus',
      'ada',
      'grace',
    ]);
    expect(item(harness.host, 'linus')).toBe(linus);

    const grace = item(harness.host, 'grace');
    const removedInput = fieldControl(grace, 'name');
    const removeFocus = vi.spyOn(HTMLElement.prototype, 'focus');
    clickButton(grace, 'Remove item');
    expect(removeFocus).toHaveBeenCalled();
    removeFocus.mockRestore();
    const historyLength = harness.application.getState().history.length;
    removedInput.value = 'Ignored';
    removedInput.dispatchEvent(new Event('input', { bubbles: true }));
    expect(readTeam(harness.application).map(({ id }) => id)).toEqual([
      'linus',
      'ada',
    ]);
    expect(harness.application.getState().history).toHaveLength(historyLength);
  });

  it('records a stale pending item edit against the then-current complete root', () => {
    const harness = mount('stable-team');
    harness.application.setDecisionMode('pending');
    const name = fieldControl(item(harness.host, 'ada'), 'name');
    name.value = 'Pending Ada';
    name.dispatchEvent(new Event('input', { bubbles: true }));
    const pending = harness.application.getState().pendingOperations[0];
    if (pending === undefined) throw new Error('Expected pending item edit.');
    const team = readTeam(harness.application).map((member) =>
      member.id === 'ada' ? { ...member, name: 'External Ada' } : member,
    );
    harness.application.replaceValue({ team });
    harness.application.confirmPending(pending.sequence);

    expect(readTeam(harness.application)[0]?.name).toBe('External Ada');
    expect(harness.application.getState().history[0]?.decision).toBe('stale');
  });

  it('records incompatible pending collection operations without replacing the root', () => {
    const harness = mount('stable-team');
    harness.application.setDecisionMode('pending');
    clickButton(item(harness.host, 'grace'), 'Remove item');
    const pending = harness.application.getState().pendingOperations[0];
    if (pending === undefined) throw new Error('Expected pending removal.');
    harness.application.replaceValue({ team: 'blocked' });
    harness.application.confirmPending(pending.sequence);

    expect(harness.application.getState().value).toEqual({ team: 'blocked' });
    expect(harness.application.getState().history[0]?.decision).toBe(
      'incompatible',
    );
  });

  it.each(referenceScenarios)(
    'mounts the complete normalized $id scenario without target-specific semantics',
    ({ id }) => {
      const harness = mount(id);
      expect(
        harness.host.querySelector(
          'input, select, fieldset, .form-section, .collection-group',
        ),
      ).not.toBeNull();
    },
  );
});

function mount(initialScenarioId?: string): {
  readonly application: StandardReferenceApplication;
  readonly host: HTMLElement;
  readonly renderer: StandardDomRenderer;
  readonly dispose: () => void;
} {
  const application = new StandardReferenceApplication(
    undefined,
    initialScenarioId,
  );
  const definition = application.getState().definition;
  const runtime = application.getRuntime();
  if (definition === undefined || runtime === undefined)
    throw new Error('Expected a renderable scenario.');
  const host = document.createElement('main');
  document.body.append(host);
  const renderer = new StandardDomRenderer(host, definition, runtime, {
    formId: `reference-standard-${application.getState().scenario.id}`,
  });
  const unsubscribe = application.subscribeState((state) => {
    if (state.snapshot !== undefined) renderer.reconcile(state.snapshot);
  });
  let active = true;
  const dispose = (): void => {
    if (!active) return;
    active = false;
    unsubscribe();
    renderer.dispose();
    application.dispose();
  };
  disposals.push(dispose);
  return { application, host, renderer, dispose };
}

function field(host: HTMLElement, key: string): HTMLElement {
  const element = host.querySelector<HTMLElement>(`[data-field-name="${key}"]`);
  if (element === null) throw new Error(`Expected field ${key}.`);
  return element;
}

function fixedValue(host: HTMLElement, key: string): HTMLElement {
  const value = field(host, key).querySelector<HTMLElement>('.fixed-value');
  if (value === null) throw new Error(`Expected fixed value ${key}.`);
  return value;
}

function item(host: HTMLElement, itemId: string): HTMLElement {
  const element = host.querySelector<HTMLElement>(`[data-item-id="${itemId}"]`);
  if (element === null) throw new Error(`Expected item ${itemId}.`);
  return element;
}

function fieldControl(host: HTMLElement, key: string): HTMLInputElement {
  const control = field(host, key).querySelector('input');
  if (control === null) throw new Error(`Expected input ${key}.`);
  return control;
}

function requiredSnapshot(application: StandardReferenceApplication) {
  const snapshot = application.getState().snapshot;
  if (snapshot === undefined) throw new Error('Expected a snapshot.');
  return snapshot;
}

function clickButton(container: HTMLElement, label: string): void {
  const target = [...container.querySelectorAll('button')].find(
    ({ textContent }) => textContent === label,
  );
  if (target === undefined) throw new Error(`Expected button ${label}.`);
  target.click();
}

function selectedTokens(select: HTMLSelectElement): readonly string[] {
  return Array.from(select.options)
    .filter((candidate) => candidate.selected)
    .map(({ value }) => value);
}

function labelledControl(host: HTMLElement, label: string): HTMLInputElement {
  const target = [...host.querySelectorAll('label')].find(
    ({ textContent }) => textContent === label,
  );
  const control = target?.htmlFor
    ? host.querySelector<HTMLInputElement>(`#${target.htmlFor}`)
    : null;
  if (control === null || control === undefined) {
    throw new Error(`Expected labelled control ${label}.`);
  }
  return control;
}

function readTeam(application: StandardReferenceApplication): Array<{
  readonly id: string;
  readonly name: string;
  readonly role: string;
}> {
  return (
    application.getState().value as {
      readonly team: Array<{
        readonly id: string;
        readonly name: string;
        readonly role: string;
      }>;
    }
  ).team;
}

function readRows(application: StandardReferenceApplication): Array<{
  readonly id: string;
}> {
  return (
    application.getState().value as {
      readonly rows: Array<{ readonly id: string }>;
    }
  ).rows;
}
