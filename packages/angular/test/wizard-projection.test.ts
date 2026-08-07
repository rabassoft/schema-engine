import {
  Component,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  compileFormDefinition,
  type ControlledFormRuntimeOptions,
  type Diagnostic,
} from '@rabassoft/schema-engine';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  SchemaFormDirective,
  provideSchemaEngineAngular,
} from '../dist/index.js';
import { WizardHostFactory, WizardStepHostFactory } from '../dist/wizard.js';

const compiled = compileFormDefinition({
  schema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      review: { type: 'string' },
    },
  },
  uiSchema: {
    presentation: [
      {
        kind: 'wizard',
        id: 'onboarding',
        label: 'Onboarding',
        steps: [
          {
            kind: 'wizard-step',
            id: 'identity',
            label: 'Identity',
            children: ['name'],
          },
          {
            kind: 'wizard-step',
            id: 'review',
            label: 'Review',
            children: ['review'],
          },
        ],
      },
    ],
  },
});
if (!compiled.success) throw new Error('Wizard fixture compilation failed.');
const wizardDefinition = compiled.definition;

const validator = Object.freeze({
  validate: () => Object.freeze({ valid: true as const, issues: [] }),
});

function config(): ControlledFormRuntimeOptions<Record<string, unknown>> {
  return {
    formId: 'wizard-host-failure',
    definition: wizardDefinition,
    schema: {},
    value: { name: 'Ada', review: 'ready' },
    baselineValue: { name: 'Ada', review: 'ready' },
    locale: 'en',
    validator,
    wizardState: { selectedStepId: 'identity' },
  };
}

@Component({
  standalone: true,
  imports: [SchemaFormDirective],
  template: `<div
    [schemaForm]="config()"
    (schemaDiagnostics)="diagnostics.push($event)"
  ></div>`,
})
class WizardFailureHost {
  readonly config = signal(config());
  readonly diagnostics: (readonly Diagnostic[])[] = [];
}

describe('Angular wizard projection failures', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it.each([
    [
      'wizard',
      WizardHostFactory,
      'WIZARD_HOST_INSTANTIATION_FAILED',
      { wizardId: 'onboarding' },
      'Wizard host could not be instantiated.',
    ],
    [
      'step',
      WizardStepHostFactory,
      'WIZARD_STEP_HOST_INSTANTIATION_FAILED',
      { wizardId: 'onboarding', stepId: 'identity' },
      'Wizard step host could not be instantiated.',
    ],
  ] as const)(
    'suppresses and cleans an atomically failed %s host',
    (_kind, token, code, parameters, fallbackMessage) => {
      TestBed.configureTestingModule({
        imports: [WizardFailureHost],
        providers: [
          provideZonelessChangeDetection(),
          provideSchemaEngineAngular(),
          {
            provide: token,
            useValue: {
              create() {
                throw new Error('unsafe');
              },
            },
          },
        ],
      });
      const fixture = TestBed.createComponent(WizardFailureHost);
      fixture.detectChanges();
      TestBed.tick();

      expect(
        (fixture.nativeElement as HTMLElement).querySelector('.schema-wizard'),
      ).toBeNull();
      expect(fixture.componentInstance.diagnostics).toEqual([
        [
          {
            code,
            severity: 'error',
            source: 'runtime',
            parameters,
            fallbackMessage,
          },
        ],
      ]);
    },
  );
});
