import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideSchemaEngineAngularNative } from '@rabassoft/schema-engine-angular';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { AppComponent } from '../src/app/app.component.js';

describe('reference application theme control', () => {
  beforeEach(() => TestBed.resetTestingModule());
  afterEach(() => document.documentElement.removeAttribute('data-theme'));

  it('applies forced themes and restores automatic preference', () => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideSchemaEngineAngularNative(),
      ],
    });
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    TestBed.tick();

    const selector = (fixture.nativeElement as HTMLElement).querySelector(
      'select[aria-label="Theme"]',
    );
    expect(selector).not.toBeNull();
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);

    fixture.componentInstance.theme.set('dark');
    fixture.detectChanges();
    TestBed.tick();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    fixture.componentInstance.theme.set('light');
    fixture.detectChanges();
    TestBed.tick();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    fixture.componentInstance.theme.set('auto');
    fixture.detectChanges();
    TestBed.tick();
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });
});
