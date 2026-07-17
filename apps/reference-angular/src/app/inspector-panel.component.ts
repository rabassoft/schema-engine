import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { serializeInspector } from './inspector-serialization.js';

@Component({
  selector: 'reference-inspector-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <details [attr.data-testid]="testId">
      <summary>{{ label }}</summary>
      <pre>{{ serialized }}</pre>
    </details>
  `,
})
export class InspectorPanelComponent {
  @Input({ required: true }) label = '';
  @Input({ required: true }) testId = '';
  @Input({ required: true }) value: unknown;

  protected get serialized(): string {
    return serializeInspector(this.value);
  }
}
