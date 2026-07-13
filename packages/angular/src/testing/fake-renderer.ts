import { Component, input, output, type OnDestroy } from '@angular/core';
import type {
  FieldDefinition,
  FieldRuntimeSnapshot,
} from '@rabassoft/schema-engine';
import type { AngularFieldRenderer } from '../renderer.js';

@Component({ selector: 'schema-test-renderer', standalone: true, template: '' })
export class FakeRenderer implements AngularFieldRenderer, OnDestroy {
  static latest: FakeRenderer | undefined;
  static created = 0;
  static destroyed = 0;

  readonly field = input.required<FieldDefinition>();
  readonly snapshot = input.required<FieldRuntimeSnapshot>();
  readonly formId = input.required<string>();
  readonly locale = input.required<string>();
  readonly setValue = output<unknown>();
  readonly removeValue = output<void>();
  readonly fieldFocus = output<void>();
  readonly fieldBlur = output<void>();

  constructor() {
    FakeRenderer.latest = this;
    FakeRenderer.created += 1;
  }

  ngOnDestroy(): void {
    FakeRenderer.destroyed += 1;
  }
}
