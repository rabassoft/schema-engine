import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { serializeInspector } from './inspector-serialization.js';
import { ReferenceCopyButtonComponent } from './reference-copy-button.component.js';

@Component({
  selector: 'reference-inspector-panel',
  standalone: true,
  imports: [ReferenceCopyButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <details [attr.data-testid]="testId">
      <summary>{{ label }}</summary>
      <div class="inspector-toolbar">
        <reference-copy-button [label]="label" [text]="serialized" />
      </div>
      <pre>{{ serialized }}</pre>
    </details>
  `,
  styles: `
    .inspector-toolbar {
      display: flex;
      justify-content: flex-end;
      margin: 0.5rem 0;
    }
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
