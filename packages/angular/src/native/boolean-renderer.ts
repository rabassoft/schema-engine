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
  fieldInteractive,
  fieldUnavailable,
  fieldIds,
} from './common.js';

@Component({
  selector: 'schema-boolean-renderer',
  standalone: true,
  imports: [FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <input
        type="checkbox"
        [id]="ids().control"
        [formField]="controlField"
        [attr.aria-describedby]="describedBy()"
        [attr.aria-invalid]="ariaInvalid()"
        (change)="onChange($event)"
        (focus)="onFocus()"
        (blur)="onBlur()"
      />
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
      @if (canSetNull()) {
        <button
          type="button"
          [id]="ids().setNull"
          [disabled]="disabled()"
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
          [disabled]="disabled()"
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
export class SchemaBooleanRendererComponent implements AngularFieldRenderer {
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

  private readonly controlModel = signal(false);
  private readonly instanceContext = inject(FIELD_INSTANCE_CONTEXT, {
    optional: true,
  });
  protected readonly controlField = form(this.controlModel, (path) =>
    disabled(path, { when: () => fieldDisabled(this.snapshot()) }),
  );
  protected readonly disabled = computed(() => fieldDisabled(this.snapshot()));
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
      !fieldUnavailable(this.snapshot()) &&
      !this.confirmedNull(),
  );
  private readonly confirmedChecked = computed(() => {
    const presence = this.snapshot().presence;
    return presence.kind === 'value' && presence.value === true;
  });

  constructor() {
    effect(() => this.controlField().reset(this.confirmedChecked()));
  }

  protected onChange(event: Event): void {
    if (!fieldInteractive(this.snapshot())) return;
    this.setValue.emit((event.target as HTMLInputElement).checked);
  }

  protected onBlur(): void {
    this.controlField().reset(this.confirmedChecked());
    if (!fieldInteractive(this.snapshot())) return;
    this.fieldBlur.emit();
  }

  protected onFocus(): void {
    if (fieldInteractive(this.snapshot())) this.fieldFocus.emit();
  }

  protected onClear(): void {
    if (!fieldInteractive(this.snapshot())) return;
    this.controlField().focusBoundControl();
    this.removeValue.emit();
  }

  protected onSetNull(): void {
    if (!fieldInteractive(this.snapshot())) return;
    try {
      this.controlField().focusBoundControl();
    } finally {
      this.setValue.emit(null);
    }
  }

  focus(options?: FocusOptions): void {
    this.controlField().focusBoundControl(options);
  }
}
