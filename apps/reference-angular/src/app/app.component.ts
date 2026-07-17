import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';

import { ReferenceFormComponent } from './reference-form.component.js';

@Component({
  selector: 'reference-root',
  standalone: true,
  imports: [ReferenceFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main>
      <header class="app-header">
        <div>
          <p class="app-kicker">Private reference</p>
          <h1>Schema Engine reference platform</h1>
        </div>
        <label class="theme-control" for="theme-selector">
          Theme
          <select
            id="theme-selector"
            aria-label="Theme"
            [value]="theme()"
            (change)="selectTheme($event)"
          >
            <option value="auto">Auto</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </header>
      <reference-form />
    </main>
  `,
})
export class AppComponent {
  private readonly document = inject(DOCUMENT);
  readonly theme = signal<'auto' | 'light' | 'dark'>('auto');

  constructor() {
    effect(() => {
      const theme = this.theme();
      const root = this.document.documentElement;
      if (theme === 'auto') root.removeAttribute('data-theme');
      else root.setAttribute('data-theme', theme);
    });
  }

  selectTheme(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (value === 'auto' || value === 'light' || value === 'dark') {
      this.theme.set(value);
    }
  }
}
