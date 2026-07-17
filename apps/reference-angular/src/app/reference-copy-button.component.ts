import {
  ChangeDetectionStrategy,
  Component,
  Input,
  signal,
} from '@angular/core';

type CopyStatus = 'idle' | 'copied' | 'failed';

@Component({
  selector: 'reference-copy-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="reference-copy-control">
      <button
        type="button"
        class="copy-button"
        [attr.aria-label]="'Copy ' + label"
        (click)="copy()"
      >
        Copy
      </button>
      <span class="copy-status" role="status" aria-live="polite">
        @if (status() === 'copied') {
          Copied {{ label }}.
        } @else if (status() === 'failed') {
          Could not copy {{ label }}.
        }
      </span>
    </span>
  `,
  styles: `
    .reference-copy-control {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 0.45rem;
      align-items: center;
    }

    .copy-button {
      min-height: 2.2rem;
      margin: 0;
      padding: 0.35rem 0.7rem;
    }

    .copy-status {
      color: #526078;
      font-size: 0.82rem;
    }
  `,
})
export class ReferenceCopyButtonComponent {
  @Input({ required: true }) label = '';
  @Input({ required: true }) text = '';

  protected readonly status = signal<CopyStatus>('idle');

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.text);
      this.status.set('copied');
    } catch {
      this.status.set('failed');
    }
  }
}
