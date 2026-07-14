import {
  ChangeDetectionStrategy,
  Component,
  afterRenderEffect,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { FormField, disabled, form } from '@angular/forms/signals';
import type {
  Diagnostic,
  FieldDefinition,
  FieldRuntimeSnapshot,
  StringChoiceDefinition,
} from '@rabassoft/schema-engine';
import type { AngularFieldRenderer } from '../renderer.js';
import type { AngularFieldTextSnapshot } from '../text.js';
import { describedBy, fieldDisabled, fieldIds } from './common.js';

const sentinelToken = '';
const choiceTokenPrefix = 'choice:';

@Component({
  selector: 'schema-string-enum-renderer',
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
      <select
        [id]="ids().control"
        [formField]="controlField"
        [attr.aria-describedby]="describedBy()"
        [attr.aria-invalid]="ariaInvalid()"
        [attr.aria-required]="field().required ? 'true' : null"
        (change)="onChange($event)"
        (focus)="fieldFocus.emit()"
        (blur)="onBlur()"
      >
        <option value="" disabled>
          {{ texts().placeholder ?? '' }}
        </option>
        @for (choice of choices(); track $index; let index = $index) {
          <option [value]="'choice:' + index">
            {{ texts().choiceLabels[index] }}
          </option>
        }
      </select>
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
export class SchemaStringEnumRendererComponent implements AngularFieldRenderer {
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

  private readonly controlModel = signal(sentinelToken);
  protected readonly controlField = form(this.controlModel, (path) =>
    disabled(path, { when: () => fieldDisabled(this.snapshot()) }),
  );
  protected readonly choices = computed(() => ownChoices(this.field()));
  protected readonly ids = computed(() =>
    fieldIds(this.formId(), this.field()),
  );
  protected readonly describedBy = computed(() =>
    describedBy(this.ids(), this.texts(), this.snapshot()),
  );
  protected readonly ariaInvalid = computed(() =>
    this.snapshot().showIssues && !this.snapshot().valid ? 'true' : null,
  );
  private readonly confirmedToken = computed(() => {
    const presence = this.snapshot().presence;
    if (presence.kind !== 'value' || typeof presence.value !== 'string')
      return sentinelToken;
    const index = this.choices().findIndex(
      ({ value }) => value === presence.value,
    );
    return index < 0 ? sentinelToken : choiceToken(index);
  });

  constructor() {
    afterRenderEffect({
      write: () => this.controlField().reset(this.confirmedToken()),
    });
  }

  protected onChange(event: Event): void {
    const token = (event.target as HTMLSelectElement).value;
    const index = choiceIndex(token, this.choices().length);
    if (index === undefined) return;
    this.setValue.emit(this.choices()[index]!.value);
  }

  protected onBlur(): void {
    this.controlField().reset(this.confirmedToken());
    this.fieldBlur.emit();
  }

  protected onClear(): void {
    this.controlField().focusBoundControl();
    this.removeValue.emit();
  }

  focus(options?: FocusOptions): void {
    this.controlField().focusBoundControl(options);
  }
}

function ownChoices(field: FieldDefinition): readonly StringChoiceDefinition[] {
  if (field.kind !== 'string') return [];
  const descriptor = Object.getOwnPropertyDescriptor(field, 'choices');
  return descriptor !== undefined &&
    'value' in descriptor &&
    Array.isArray(descriptor.value) &&
    descriptor.value.length > 0
    ? (descriptor.value as readonly StringChoiceDefinition[])
    : [];
}

function choiceToken(index: number): string {
  return `${choiceTokenPrefix}${index}`;
}

function choiceIndex(token: string, choiceCount: number): number | undefined {
  if (!token.startsWith(choiceTokenPrefix)) return undefined;
  const indexText = token.slice(choiceTokenPrefix.length);
  if (!/^(0|[1-9]\d*)$/.test(indexText)) return undefined;
  const index = Number(indexText);
  return Number.isSafeInteger(index) && index < choiceCount ? index : undefined;
}
