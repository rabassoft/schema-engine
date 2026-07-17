import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ReferenceFormComponent } from './reference-form.component.js';

@Component({
  selector: 'reference-root',
  standalone: true,
  imports: [ReferenceFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main>
      <h1>Schema Engine reference platform</h1>
      <reference-form />
    </main>
  `,
})
export class AppComponent {}
