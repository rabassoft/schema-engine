// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import {
  ChangeDetectionStrategy,
  Component,
  afterRenderEffect,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
  type ElementRef,
} from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import type {
  Diagnostic,
  FieldDefinition,
  FieldRuntimeSnapshot,
  FieldTemplate,
  StringChoiceDefinition,
} from '@rabassoft/schema-engine';
import type { AngularFieldRenderer } from '../renderer.js';
import type { AngularFieldTextSnapshot } from '../text.js';
import {
  FIELD_INSTANCE_CONTEXT,
  describedBy,
  fieldDisabled,
  fieldInteractive,
  fieldIds,
} from './common.js';

const choiceTokenPrefix = 'choice:';

@Component({
  selector: 'schema-string-enum-array-renderer',
  standalone: true,
  imports: [FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #host
      [attr.aria-labelledby]="ids().label"
      [attr.tabindex]="hostFocusable() ? 0 : null"
      (focus)="onHostFocus($event)"
      (blur)="onHostBlur($event)"
    >
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
        #selection
        multiple
        [id]="ids().control"
        [disabled]="selectionDisabled()"
        [attr.aria-describedby]="describedByWithStatus()"
        [attr.aria-invalid]="ariaInvalid()"
        [attr.aria-required]="field().required ? 'true' : null"
        (change)="onChange($event)"
        (focus)="onFocus()"
        (blur)="onBlur()"
      >
        @for (choice of choices(); track $index; let index = $index) {
          <option
            [value]="'choice:' + index"
            [selected]="selectedTokenSet().has('choice:' + index)"
          >
            {{ texts().choiceLabels[index] }}
          </option>
        }
      </select>
      <input type="hidden" aria-hidden="true" [formField]="controlField" />
      @if (statusText(); as status) {
        <p [id]="ids().status">{{ status }}</p>
      }
      @if (snapshot().presence.kind === 'value') {
        <button
          type="button"
          [id]="ids().clear"
          [disabled]="actionDisabled()"
          [attr.aria-labelledby]="ids().clear + ' ' + ids().label"
          (click)="onClear()"
          (focus)="onFocus()"
          (blur)="onBlur()"
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
export class SchemaStringEnumArrayRendererComponent implements AngularFieldRenderer {
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

  private readonly host = viewChild<ElementRef<HTMLElement>>('host');
  private readonly selection =
    viewChild<ElementRef<HTMLSelectElement>>('selection');
  private readonly controlModel = signal('');
  private readonly presentationTokens = signal<readonly string[]>([]);
  private readonly instanceContext = inject(FIELD_INSTANCE_CONTEXT, {
    optional: true,
  });
  protected readonly choices = computed(() => ownChoices(this.field()));
  private readonly presentation = computed(() =>
    inspectPresentation(this.snapshot(), this.choices()),
  );
  protected readonly controlField = form(this.controlModel);
  protected readonly actionDisabled = computed(() =>
    fieldDisabled(this.snapshot()),
  );
  protected readonly selectionDisabled = computed(
    () => this.actionDisabled() || !this.presentation().representable,
  );
  protected readonly hostFocusable = computed(
    () => !this.actionDisabled() && !this.presentation().representable,
  );
  protected readonly ids = computed(() =>
    fieldIds(this.formId(), this.field(), this.instanceContext?.address()),
  );
  protected readonly describedByWithStatus = computed(() => {
    const base = describedBy(
      this.ids(),
      this.texts(),
      this.snapshot(),
      this.field(),
    );
    return this.statusText() === undefined
      ? base
      : [base, this.ids().status].filter(Boolean).join(' ');
  });
  protected readonly ariaInvalid = computed(() =>
    this.snapshot().showIssues && !this.snapshot().valid ? 'true' : null,
  );
  protected readonly statusText = computed(() => {
    const presence = this.snapshot().presence;
    if (presence.kind === 'missing') return this.texts().missingSelectionLabel;
    if (presence.kind !== 'value') return this.texts().label;
    if (Array.isArray(presence.value) && presence.value.length === 0) {
      return this.texts().emptySelectionLabel;
    }
    const presentation = this.presentation();
    if (presentation.representable) {
      return presentation.values
        .map((value) => {
          const index = this.choices().findIndex(
            (choice) => choice.value === value,
          );
          return this.texts().choiceLabels[index] ?? value;
        })
        .join(', ');
    }
    return `${this.texts().label}: ${Array.isArray(presence.value) ? presence.value.length : 1}`;
  });
  protected readonly selectedTokenSet = computed(
    () => new Set(this.presentationTokens()),
  );

  constructor() {
    afterRenderEffect({
      write: () => this.resetPresentation(),
    });
  }

  protected onChange(event: Event): void {
    if (
      !fieldInteractive(this.snapshot()) ||
      !this.presentation().representable
    )
      return;
    const select = event.target as HTMLSelectElement;
    const selected = new Set<number>();
    for (const option of Array.from(select.options)) {
      if (!option.selected) continue;
      const index = choiceIndex(option.value, this.choices().length);
      if (index === undefined) {
        this.resetPresentation();
        return;
      }
      selected.add(index);
    }
    const confirmed = this.presentation().values;
    const retained = confirmed.filter((value) => {
      const index = this.choices().findIndex(
        (choice) => choice.value === value,
      );
      return index >= 0 && selected.has(index);
    });
    const confirmedSet = new Set(confirmed);
    const candidate = [...retained];
    for (let index = 0; index < this.choices().length; index += 1) {
      const value = this.choices()[index]!.value;
      if (selected.has(index) && !confirmedSet.has(value))
        candidate.push(value);
    }
    this.resetPresentation();
    if (orderedEqual(candidate, confirmed)) return;
    this.setValue.emit(candidate);
  }

  protected onBlur(): void {
    this.resetPresentation();
    if (fieldInteractive(this.snapshot())) this.fieldBlur.emit();
  }

  protected onFocus(): void {
    if (fieldInteractive(this.snapshot())) this.fieldFocus.emit();
  }

  protected onHostFocus(event: FocusEvent): void {
    if (event.target === event.currentTarget) this.onFocus();
  }

  protected onHostBlur(event: FocusEvent): void {
    if (event.target === event.currentTarget) this.onBlur();
  }

  protected onClear(): void {
    if (!fieldInteractive(this.snapshot())) return;
    try {
      this.focus();
    } finally {
      this.removeValue.emit();
    }
  }

  focus(options?: FocusOptions): void {
    if (this.presentation().representable) {
      this.selection()?.nativeElement.focus(options);
    } else {
      this.host()?.nativeElement.focus(options);
    }
  }

  private resetPresentation(): void {
    const tokens = Object.freeze([...this.presentation().tokens]);
    this.presentationTokens.set(tokens);
    this.controlField().reset(JSON.stringify(tokens));
    const selection = this.selection()?.nativeElement;
    if (selection === undefined) return;
    const selected = new Set(tokens);
    for (const option of Array.from(selection.options)) {
      option.selected = selected.has(option.value);
    }
  }
}

interface PresentationState {
  readonly representable: boolean;
  readonly values: readonly string[];
  readonly tokens: readonly string[];
}

function inspectPresentation(
  snapshot: FieldRuntimeSnapshot,
  choices: readonly StringChoiceDefinition[],
): PresentationState {
  const presence = snapshot.presence;
  if (presence.kind === 'missing') {
    return { representable: true, values: [], tokens: [] };
  }
  if (presence.kind !== 'value' || !Array.isArray(presence.value)) {
    return { representable: false, values: [], tokens: [] };
  }
  const values: string[] = [];
  const tokens: string[] = [];
  const seen = new Set<string>();
  for (let index = 0; index < presence.value.length; index += 1) {
    const member = Object.getOwnPropertyDescriptor(presence.value, index);
    if (
      member === undefined ||
      !('value' in member) ||
      typeof member.value !== 'string' ||
      seen.has(member.value)
    ) {
      return { representable: false, values: [], tokens: [] };
    }
    const choiceIndex = choices.findIndex(
      (choice) => choice.value === member.value,
    );
    if (choiceIndex < 0) {
      return { representable: false, values: [], tokens: [] };
    }
    seen.add(member.value);
    values.push(member.value);
    tokens.push(choiceToken(choiceIndex));
  }
  return {
    representable: true,
    values: Object.freeze(values),
    tokens: Object.freeze(tokens),
  };
}

function ownChoices(
  field: FieldDefinition | FieldTemplate,
): readonly StringChoiceDefinition[] {
  if (field.kind !== 'string-enum-array') return [];
  const descriptor = Object.getOwnPropertyDescriptor(field, 'choices');
  return descriptor !== undefined &&
    'value' in descriptor &&
    Array.isArray(descriptor.value)
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

function orderedEqual(
  left: readonly string[],
  right: readonly string[],
): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => Object.is(value, right[index]))
  );
}
