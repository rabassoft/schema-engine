// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import type {
  Diagnostic,
  FieldDefinition,
  FieldRuntimeSnapshot,
  FieldTemplate,
} from '@rabassoft/schema-engine';
import type { AngularFieldRenderer } from '../renderer.js';
import type { AngularFieldTextSnapshot } from '../text.js';
import { FIELD_INSTANCE_CONTEXT, fieldIds } from './common.js';

@Component({
  selector: 'schema-fixed-value-renderer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [id]="ids().control"
      role="group"
      [attr.aria-labelledby]="ids().label"
      [attr.aria-describedby]="describedBy()"
      [attr.aria-invalid]="snapshot().valid ? null : 'true'"
    >
      <span [id]="ids().label">{{ texts().label }}</span>
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
      <span
        class="schema-fixed-value"
        [id]="ids().fixedValue"
        [attr.data-fixed-value-state]="display().state"
        >{{ display().text }}</span
      >
      @if (snapshot().showIssues && texts().issueMessages.length > 0) {
        <ul [id]="ids().errors" aria-live="polite">
          @for (message of texts().issueMessages; track $index) {
            <li>{{ message }}</li>
          }
        </ul>
      }
    </div>
  `,
  styles: `
    .schema-fixed-value {
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
  `,
})
export class SchemaFixedValueRendererComponent implements AngularFieldRenderer {
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

  private readonly instanceContext = inject(FIELD_INSTANCE_CONTEXT, {
    optional: true,
  });
  protected readonly ids = computed(() =>
    fieldIds(this.formId(), this.field(), this.instanceContext?.address()),
  );
  protected readonly describedBy = computed(() => {
    const ids = this.ids();
    const texts = this.texts();
    const snapshot = this.snapshot();
    const values = [
      ...(texts.description === undefined ? [] : [ids.description]),
      ...(texts.hint === undefined ? [] : [ids.hint]),
      ...(snapshot.showIssues && texts.issueMessages.length > 0
        ? [ids.errors]
        : []),
    ];
    return values.length === 0 ? null : values.join(' ');
  });
  protected readonly display = computed(() =>
    displayFixedValue(this.field(), this.snapshot(), this.texts()),
  );
}

function displayFixedValue(
  field: FieldDefinition | FieldTemplate,
  snapshot: FieldRuntimeSnapshot,
  texts: AngularFieldTextSnapshot,
): { readonly state: string; readonly text: string } {
  const presence = snapshot.presence;
  if (presence.kind === 'blocked')
    return { state: 'unavailable', text: texts.fixedUnavailableLabel };
  if (presence.kind === 'missing')
    return { state: 'missing', text: texts.fixedMissingLabel };
  const value = presence.value;
  if (value === null)
    return field.nullable
      ? { state: 'value', text: texts.nullValueLabel }
      : { state: 'incompatible', text: texts.fixedIncompatibleLabel };
  if (field.kind === 'string' && typeof value === 'string')
    return { state: 'value', text: value === '' ? '""' : value };
  if (
    field.kind === 'number' &&
    typeof value === 'number' &&
    Number.isFinite(value) &&
    (field.numericType !== 'integer' || Number.isInteger(value))
  )
    return {
      state: 'value',
      text: Object.is(value, -0) ? '-0' : String(value),
    };
  if (field.kind === 'boolean' && typeof value === 'boolean')
    return { state: 'value', text: String(value) };
  return { state: 'incompatible', text: texts.fixedIncompatibleLabel };
}
