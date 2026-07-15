// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormField, disabled, form } from '@angular/forms/signals';
import type {
  Diagnostic,
  FieldDefinition,
  FieldTemplate,
  FieldRuntimeSnapshot,
} from '@rabassoft/schema-engine';
import type { AngularFieldRenderer } from '../renderer.js';
import type { AngularFieldTextSnapshot } from '../text.js';
import {
  FIELD_INSTANCE_CONTEXT,
  describedBy,
  fieldDisabled,
  fieldIds,
} from './common.js';
import { createNumberCodec } from './number-codec.js';

@Component({
  selector: 'schema-number-renderer',
  standalone: true,
  imports: [FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <label [id]="ids().label" [for]="ids().control">{{
        texts().label
      }}</label>
      @if (texts().description; as description) {
        <p [id]="ids().description">{{ description }}</p>
      }
      @if (texts().hint; as hint) {
        <p [id]="ids().hint">{{ hint }}</p>
      }
      @if (texts().tooltip; as tooltip) {
        <details>
          <summary [attr.aria-label]="tooltip">ⓘ</summary>
          <p [id]="ids().tooltip">{{ tooltip }}</p>
        </details>
      }
      <input
        type="text"
        inputmode="decimal"
        [id]="ids().control"
        [formField]="controlField"
        [placeholder]="texts().placeholder ?? ''"
        [attr.aria-describedby]="describedBy()"
        [attr.aria-invalid]="ariaInvalid()"
        [attr.aria-required]="field().required ? 'true' : null"
        (input)="onInput($event)"
        (focus)="onFocus()"
        (blur)="onBlur()"
      />
      @if (canSetNull()) {
        <button
          type="button"
          [id]="ids().setNull"
          [attr.aria-labelledby]="ids().setNull + ' ' + ids().label"
          (click)="onSetNull()"
        >
          {{ texts().setNullLabel }}
        </button>
      }
      @if (confirmedNull()) {
        <span [id]="ids().nullValue">{{ texts().nullValueLabel }}</span>
      }
      @if (snapshot().presence.kind === 'value') {
        <button
          type="button"
          [id]="ids().clear"
          [attr.aria-labelledby]="ids().clear + ' ' + ids().label"
          (click)="onClear()"
        >
          {{ texts().clearLabel }}
        </button>
      }
      @if (snapshot().showIssues && texts().issueMessages.length > 0) {
        <ul [id]="ids().errors" aria-live="polite">
          @for (message of texts().issueMessages; track $index) {
            <li>{{ message }}</li>
          }
        </ul>
      }
    </div>
  `,
})
export class SchemaNumberRendererComponent implements AngularFieldRenderer {
  readonly field = input.required<FieldDefinition | FieldTemplate>();
  readonly snapshot = input.required<FieldRuntimeSnapshot>();
  readonly formId = input.required<string>();
  readonly locale = input.required<string>();
  readonly texts = input.required<AngularFieldTextSnapshot>();
  readonly setValue = output<unknown>();
  readonly removeValue = output<void>();
  readonly fieldFocus = output<void>();
  readonly fieldBlur = output<void>();
  readonly rendererDiagnostics = output<readonly Diagnostic[]>();

  private readonly controlModel = signal('');
  private readonly instanceContext = inject(FIELD_INSTANCE_CONTEXT, {
    optional: true,
  });
  protected readonly controlField = form(this.controlModel, (path) =>
    disabled(path, { when: () => fieldDisabled(this.snapshot()) }),
  );
  protected readonly ids = computed(() =>
    fieldIds(this.formId(), this.field(), this.instanceContext?.address()),
  );
  protected readonly describedBy = computed(() =>
    describedBy(this.ids(), this.texts(), this.snapshot(), this.field()),
  );
  protected readonly ariaInvalid = computed(() =>
    this.snapshot().showIssues && !this.snapshot().valid ? 'true' : null,
  );
  protected readonly confirmedNull = computed(() => {
    const presence = this.snapshot().presence;
    return (
      this.field().nullable &&
      presence.kind === 'value' &&
      presence.value === null
    );
  });
  protected readonly canSetNull = computed(
    () =>
      this.field().nullable &&
      !fieldDisabled(this.snapshot()) &&
      !this.confirmedNull(),
  );
  private readonly numberField = computed(() => {
    const field = this.field();
    if (field.kind !== 'number')
      throw new Error('Number renderer requires a number field.');
    return field;
  });
  private readonly codec = computed(() =>
    createNumberCodec(this.locale(), this.numberField(), this.snapshot().path),
  );
  private readonly confirmedValue = computed(() => {
    const presence = this.snapshot().presence;
    const field = this.numberField();
    return presence.kind === 'value' &&
      typeof presence.value === 'number' &&
      Number.isFinite(presence.value) &&
      (field.numericType !== 'integer' || Number.isInteger(presence.value))
      ? presence.value
      : undefined;
  });
  private readonly focused = computed(() => this.snapshot().focused);
  private lastDiagnosticKey: string | undefined;

  constructor() {
    effect(() => {
      const codec = this.codec();
      const value = this.confirmedValue();
      const formatted =
        value === undefined
          ? Object.freeze({ text: '', diagnostics: Object.freeze([]) })
          : codec.format(value, this.numberField());
      const diagnostics = [...codec.diagnostics, ...formatted.diagnostics];
      const diagnosticKey = diagnostics
        .map(({ code, parameters }) => `${code}:${JSON.stringify(parameters)}`)
        .join('|');
      if (diagnostics.length > 0 && diagnosticKey !== this.lastDiagnosticKey)
        this.rendererDiagnostics.emit(Object.freeze(diagnostics));
      this.lastDiagnosticKey = diagnosticKey;
      if (!this.focused()) this.controlField().reset(formatted.text);
    });
  }

  protected onInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    const snapshot = this.snapshot();
    const parsed = this.codec().parse(
      text,
      this.numberField().numericType === 'integer',
    );
    if (parsed.kind === 'empty') {
      if (snapshot.presence.kind === 'value') this.removeValue.emit();
      return;
    }
    if (parsed.kind !== 'value') return;
    if (
      snapshot.presence.kind !== 'value' ||
      !Object.is(snapshot.presence.value, parsed.value)
    )
      this.setValue.emit(parsed.value);
  }

  protected onBlur(): void {
    const formatted = this.formatConfirmed(this.snapshot(), this.codec());
    this.controlField().reset(formatted.text);
    this.fieldBlur.emit();
  }

  protected onFocus(): void {
    const presence = this.snapshot().presence;
    const field = this.numberField();
    if (
      presence.kind === 'value' &&
      typeof presence.value === 'number' &&
      Number.isFinite(presence.value) &&
      (field.numericType !== 'integer' || Number.isInteger(presence.value))
    ) {
      const formatted = this.codec().formatEditing(presence.value, field);
      this.controlField().reset(formatted.text);
    }
    this.fieldFocus.emit();
  }

  protected onClear(): void {
    this.controlField().focusBoundControl();
    this.removeValue.emit();
  }

  protected onSetNull(): void {
    try {
      this.controlField().focusBoundControl();
    } finally {
      this.setValue.emit(null);
    }
  }

  focus(options?: FocusOptions): void {
    this.controlField().focusBoundControl(options);
  }

  private formatConfirmed(
    snapshot: FieldRuntimeSnapshot,
    codec: ReturnType<typeof createNumberCodec>,
  ) {
    const presence = snapshot.presence;
    return presence.kind === 'value' &&
      typeof presence.value === 'number' &&
      Number.isFinite(presence.value) &&
      (this.numberField().numericType !== 'integer' ||
        Number.isInteger(presence.value))
      ? codec.format(presence.value, this.numberField())
      : Object.freeze({ text: '', diagnostics: Object.freeze([]) });
  }
}
