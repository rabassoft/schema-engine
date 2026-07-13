import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import type {
  Diagnostic,
  FieldDefinition,
  FieldRuntimeSnapshot,
} from '@rabassoft/schema-engine';
import type { AngularFieldRenderer } from '../renderer.js';
import type { AngularFieldTextSnapshot } from '../text.js';
import { describedBy, fieldIds } from './common.js';

@Component({
  selector: 'schema-string-renderer',
  standalone: true,
  imports: [FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <label [for]="ids().control">{{ texts().label }}</label>
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
        [id]="ids().control"
        [formField]="controlField"
        [placeholder]="texts().placeholder ?? ''"
        [attr.aria-describedby]="describedBy()"
        [attr.aria-invalid]="ariaInvalid()"
        [attr.aria-required]="field().required ? 'true' : null"
        (input)="onInput($event)"
        (focus)="fieldFocus.emit()"
        (blur)="onBlur()"
      />
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
export class SchemaStringRendererComponent implements AngularFieldRenderer {
  readonly field = input.required<FieldDefinition>();
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
  protected readonly controlField = form(this.controlModel);
  protected readonly ids = computed(() =>
    fieldIds(this.formId(), this.field()),
  );
  protected readonly describedBy = computed(() =>
    describedBy(this.ids(), this.texts(), this.snapshot()),
  );
  protected readonly ariaInvalid = computed(() =>
    this.snapshot().showIssues && !this.snapshot().valid ? 'true' : null,
  );
  private readonly confirmedText = computed(() => {
    const presence = this.snapshot().presence;
    return presence.kind === 'value' && typeof presence.value === 'string'
      ? presence.value
      : '';
  });

  constructor() {
    effect(() => this.controlField().reset(this.confirmedText()));
  }

  protected onInput(event: Event): void {
    this.setValue.emit((event.target as HTMLInputElement).value);
  }

  protected onBlur(): void {
    this.controlField().reset(this.confirmedText());
    this.fieldBlur.emit();
  }

  focus(options?: FocusOptions): void {
    this.controlField().focusBoundControl(options);
  }
}
