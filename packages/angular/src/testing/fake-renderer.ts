import { Component, input, output, type OnDestroy } from '@angular/core';
import type {
  Diagnostic,
  FieldDefinition,
  FieldRuntimeSnapshot,
} from '@rabassoft/schema-engine';
import type { AngularFieldRenderer } from '../renderer.js';
import type { AngularFieldTextSnapshot } from '../text.js';

@Component({ selector: 'schema-test-renderer', standalone: true, template: '' })
export class FakeRenderer implements AngularFieldRenderer, OnDestroy {
  static latest: FakeRenderer | undefined;
  static instances: FakeRenderer[] = [];
  static created = 0;
  static destroyed = 0;
  static emitOnDestroy = false;

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

  constructor() {
    FakeRenderer.latest = this;
    FakeRenderer.instances.push(this);
    FakeRenderer.created += 1;
  }

  ngOnDestroy(): void {
    FakeRenderer.destroyed += 1;
    if (FakeRenderer.emitOnDestroy) {
      this.setValue.emit('destroyed');
      this.removeValue.emit();
      this.fieldFocus.emit();
      this.fieldBlur.emit();
    }
  }
}
