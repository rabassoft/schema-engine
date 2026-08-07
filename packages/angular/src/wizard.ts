// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import { DOCUMENT } from '@angular/common';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EnvironmentInjector,
  Injectable,
  Injector,
  ViewContainerRef,
  computed,
  effect,
  inject,
  input,
  inputBinding,
  signal,
  viewChild,
  type ComponentRef,
} from '@angular/core';
import type {
  FormDefinition,
  FormRuntimeSnapshot,
  WizardDefinition,
  WizardStepDefinition,
  WizardStepSnapshot,
  WizardTextMember,
} from '@rabassoft/schema-engine';
import { SchemaFormDirective, readRuntimeContext } from './form.directive.js';
import { SchemaPresentationOutletComponent } from './node-outlet.js';
import type { PresentationProjectionOwner } from './presentation-context.js';
import { AngularTextProjector } from './text.js';

const ROOT_OWNER: PresentationProjectionOwner = Object.freeze({ kind: 'root' });

/** @internal */
@Injectable({ providedIn: 'root' })
export class WizardHostFactory {
  create(
    container: ViewContainerRef,
    environmentInjector: EnvironmentInjector,
    injector: Injector,
    wizard: () => WizardDefinition,
    definition: () => FormDefinition,
    snapshot: () => FormRuntimeSnapshot<object>,
  ): ComponentRef<SchemaWizardHostComponent> {
    return container.createComponent(SchemaWizardHostComponent, {
      environmentInjector,
      injector,
      bindings: [
        inputBinding('wizard', wizard),
        inputBinding('definition', definition),
        inputBinding('snapshot', snapshot),
      ],
    });
  }
}

/** @internal */
@Injectable({ providedIn: 'root' })
export class WizardStepHostFactory {
  create(
    container: ViewContainerRef,
    environmentInjector: EnvironmentInjector,
    injector: Injector,
    step: () => WizardStepDefinition,
    state: () => WizardStepSnapshot,
    definition: () => FormDefinition,
    snapshot: () => FormRuntimeSnapshot<object>,
  ): ComponentRef<SchemaWizardStepHostComponent> {
    return container.createComponent(SchemaWizardStepHostComponent, {
      environmentInjector,
      injector,
      bindings: [
        inputBinding('step', step),
        inputBinding('state', state),
        inputBinding('definition', definition),
        inputBinding('snapshot', snapshot),
      ],
    });
  }
}

/** @internal */
@Component({
  selector: 'schema-wizard-outlet',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-template #container />`,
})
export class SchemaWizardOutletComponent {
  readonly wizard = input.required<WizardDefinition>();
  readonly definition = input.required<FormDefinition>();
  readonly snapshot = input.required<FormRuntimeSnapshot<object>>();

  private readonly form = inject(SchemaFormDirective);
  private readonly factory = inject(WizardHostFactory);
  private readonly injector = inject(Injector);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly container = viewChild.required('container', {
    read: ViewContainerRef,
  });
  private selected: WizardDefinition | undefined;
  private componentRef: ComponentRef<SchemaWizardHostComponent> | undefined;

  constructor() {
    effect(() => {
      const wizard = this.wizard();
      if (wizard === this.selected) return;
      this.destroySelected();
      this.selected = wizard;
      try {
        this.componentRef = this.factory.create(
          this.container(),
          this.environmentInjector,
          this.injector,
          () => this.wizard(),
          () => this.definition(),
          () => this.snapshot(),
        );
        this.componentRef.changeDetectorRef.detectChanges();
      } catch {
        this.destroySelected();
        this.form.reportDiagnostics([wizardHostDiagnostic(wizard, undefined)]);
      }
    });
    this.destroyRef.onDestroy(() => this.destroySelected());
  }

  private destroySelected(): void {
    const ref = this.componentRef;
    this.componentRef = undefined;
    if (ref !== undefined && !ref.hostView.destroyed) ref.destroy();
    this.container().clear();
    this.selected = undefined;
  }
}

/** @internal */
@Component({
  selector: 'schema-wizard-step-outlet',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-template #container />`,
})
export class SchemaWizardStepOutletComponent {
  readonly wizard = input.required<WizardDefinition>();
  readonly step = input.required<WizardStepDefinition>();
  readonly state = input.required<WizardStepSnapshot>();
  readonly definition = input.required<FormDefinition>();
  readonly snapshot = input.required<FormRuntimeSnapshot<object>>();
  readonly fail = input.required<(step: WizardStepDefinition) => void>();

  private readonly factory = inject(WizardStepHostFactory);
  private readonly injector = inject(Injector);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly container = viewChild.required('container', {
    read: ViewContainerRef,
  });
  private selected: WizardStepDefinition | undefined;
  private componentRef: ComponentRef<SchemaWizardStepHostComponent> | undefined;

  constructor() {
    effect(() => {
      const step = this.step();
      if (step === this.selected) return;
      this.destroySelected();
      this.selected = step;
      try {
        this.componentRef = this.factory.create(
          this.container(),
          this.environmentInjector,
          this.injector,
          () => this.step(),
          () => this.state(),
          () => this.definition(),
          () => this.snapshot(),
        );
        this.componentRef.changeDetectorRef.detectChanges();
      } catch {
        this.destroySelected();
        this.fail()(step);
      }
    });
    this.destroyRef.onDestroy(() => this.destroySelected());
  }

  private destroySelected(): void {
    const ref = this.componentRef;
    this.componentRef = undefined;
    if (ref !== undefined && !ref.hostView.destroyed) ref.destroy();
    this.container().clear();
    this.selected = undefined;
  }
}

/** @internal */
@Component({
  selector: 'schema-wizard-step-host',
  standalone: true,
  imports: [SchemaPresentationOutletComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="schema-wizard-step"
      [id]="stepBase() + '--region'"
      role="region"
      [attr.aria-labelledby]="stepBase() + '--heading'"
      [attr.aria-describedby]="stepBase() + '--status'"
      [hidden]="!state().current"
      [attr.inert]="state().current ? null : ''"
      [attr.aria-hidden]="state().current ? null : 'true'"
    >
      <h3 [id]="stepBase() + '--heading'" tabindex="-1">
        {{ stepLabel() }}
      </h3>
      @for (
        entry of step().children;
        track entry.kind === 'form-node' ? entry.node.key : entry.key
      ) {
        <schema-presentation-outlet
          [entry]="entry"
          [owner]="rootOwner"
          [definition]="definition()"
          [snapshot]="snapshot()"
          [locale]="snapshot().locale"
        />
      }
    </section>
  `,
})
export class SchemaWizardStepHostComponent {
  readonly step = input.required<WizardStepDefinition>();
  readonly state = input.required<WizardStepSnapshot>();
  readonly definition = input.required<FormDefinition>();
  readonly snapshot = input.required<FormRuntimeSnapshot<object>>();
  protected readonly rootOwner = ROOT_OWNER;

  private readonly form = inject(SchemaFormDirective);
  private readonly textProjector = inject(AngularTextProjector);

  protected stepBase(): string {
    const wizard = this.definition().presentation[0];
    const wizardId = wizard?.kind === 'wizard' ? wizard.id : '';
    return `se-${encodeURIComponent(
      JSON.stringify([
        readRuntimeContext(this.form)?.formId ?? '',
        'presentation',
        'wizard',
        wizardId,
        'step',
        this.step().id,
      ]),
    )}`;
  }

  protected stepLabel(): string {
    const wizard = this.definition().presentation[0];
    if (wizard?.kind !== 'wizard') return this.step().label;
    return this.textProjector.projectWizard(this.step().label, {
      formId: readRuntimeContext(this.form)?.formId ?? '',
      locale: this.snapshot().locale,
      wizard,
      step: this.step(),
      member: 'label',
    }).text;
  }
}

/** @internal */
@Component({
  selector: 'schema-wizard-host',
  standalone: true,
  imports: [SchemaWizardStepOutletComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!failed()) {
      <section
        class="schema-wizard"
        [id]="wizardBase() + '--wizard'"
        [attr.aria-labelledby]="wizardBase() + '--heading'"
      >
        <h2 [id]="wizardBase() + '--heading'">{{ wizardText('label') }}</h2>
        <ol class="schema-wizard-steps" [id]="wizardBase() + '--steps'">
          @for (step of wizard().steps; track step.key; let index = $index) {
            @if (stepSnapshot(index); as state) {
              <li
                [id]="stepBase(step.id) + '--indicator'"
                [attr.aria-current]="state.current ? 'step' : null"
              >
                <span>{{ positionText(step, state) }}</span>
                <span>{{ stepText(step, 'label') }}</span>
                <span [id]="stepBase(step.id) + '--status'">
                  {{ progressText(state) }}
                  @if (validationText(state); as validation) {
                    <span>{{ validation }}</span>
                  }
                </span>
              </li>
            }
          }
        </ol>

        @for (step of wizard().steps; track step.key; let index = $index) {
          @if (stepSnapshot(index); as state) {
            <schema-wizard-step-outlet
              [wizard]="wizard()"
              [step]="step"
              [state]="state"
              [definition]="definition()"
              [snapshot]="snapshot()"
              [fail]="failStep"
            />
          }
        }

        @if (snapshot().wizard?.showGlobalIssues) {
          <div class="schema-wizard-global-issues" role="alert" tabindex="-1">
            @for (issue of snapshot().globalIssues; track $index) {
              <p>{{ issue.code }}</p>
            }
          </div>
        }

        <div class="schema-wizard-controls">
          <button
            type="button"
            [id]="wizardBase() + '--previous'"
            [disabled]="!snapshot().wizard?.controls?.previous"
            (click)="requestPrevious()"
          >
            {{ wizardText('previous') }}
          </button>
          <button
            type="button"
            [id]="wizardBase() + '--next'"
            [disabled]="!snapshot().wizard?.controls?.next"
            (click)="requestNext()"
          >
            {{ wizardText('next') }}
          </button>
          <button
            type="button"
            [id]="wizardBase() + '--complete'"
            [disabled]="!snapshot().wizard?.controls?.complete"
            (click)="requestComplete()"
          >
            {{ wizardText('complete') }}
          </button>
        </div>
      </section>
    }
  `,
})
export class SchemaWizardHostComponent {
  readonly wizard = input.required<WizardDefinition>();
  readonly definition = input.required<FormDefinition>();
  readonly snapshot = input.required<FormRuntimeSnapshot<object>>();

  protected readonly failed = signal(false);
  protected readonly failStep = (step: WizardStepDefinition): void => {
    if (this.failed()) return;
    this.failed.set(true);
    this.form.reportDiagnostics([wizardHostDiagnostic(this.wizard(), step)]);
  };

  private readonly form = inject(SchemaFormDirective);
  private readonly document = inject(DOCUMENT);
  private readonly textProjector = inject(AngularTextProjector);
  private readonly reportedTextIdentities = new Set<string>();
  private lastSelectedStepId: string | undefined;
  private readonly formId = computed(
    () => readRuntimeContext(this.form)?.formId ?? '',
  );

  constructor() {
    afterRenderEffect(() => {
      if (this.failed()) return;
      const selected = this.snapshot().wizard?.selectedStepId;
      const previous = this.lastSelectedStepId;
      this.lastSelectedStepId = selected;
      if (
        selected === undefined ||
        previous === undefined ||
        selected === previous
      )
        return;
      this.document
        .getElementById(`${this.stepBase(selected)}--heading`)
        ?.focus();
    });
  }

  protected wizardBase(): string {
    return `se-${encodeURIComponent(
      JSON.stringify([
        readRuntimeContext(this.form)?.formId ?? '',
        'presentation',
        'wizard',
        this.wizard().id,
      ]),
    )}`;
  }

  protected stepBase(stepId: string): string {
    return `se-${encodeURIComponent(
      JSON.stringify([
        readRuntimeContext(this.form)?.formId ?? '',
        'presentation',
        'wizard',
        this.wizard().id,
        'step',
        stepId,
      ]),
    )}`;
  }

  protected stepSnapshot(index: number): WizardStepSnapshot | undefined {
    return this.snapshot().wizard?.steps[index];
  }

  protected wizardText(
    member: 'label' | 'previous' | 'next' | 'complete',
  ): string {
    const sources = {
      label: this.wizard().label,
      previous: 'Previous',
      next: 'Next',
      complete: 'Complete',
    } as const;
    return this.resolveText(sources[member], member);
  }

  protected stepText(step: WizardStepDefinition, member: 'label'): string {
    return this.resolveText(step.label, member, step);
  }

  protected positionText(
    definition: WizardStepDefinition,
    step: WizardStepSnapshot,
  ): string {
    const count = this.wizard().steps.length;
    return this.resolveText(
      `Step ${step.position} of ${count}`,
      'position',
      definition,
      step.position,
      count,
    );
  }

  protected progressText(step: WizardStepSnapshot): string {
    const definition = this.wizard().steps[step.position - 1];
    if (definition === undefined) return '';
    const sources = {
      unvisited: 'Not visited',
      visited: 'Visited',
      error: 'Contains errors',
      completed: 'Completed',
    } as const;
    return this.resolveText(sources[step.progress], step.progress, definition);
  }

  protected validationText(step: WizardStepSnapshot): string | undefined {
    const definition = this.wizard().steps[step.position - 1];
    if (definition === undefined) return undefined;
    const state = step.validation.state;
    if (state === 'provisional')
      return this.resolveText(
        'Additional validation not yet available',
        'provisional-validation',
        definition,
      );
    if (state === 'pending')
      return this.resolveText(
        'Additional validation in progress',
        'pending-validation',
        definition,
      );
    if (state === 'failed')
      return this.resolveText(
        'Additional validation failed',
        'failed-validation',
        definition,
      );
    return undefined;
  }

  private resolveText(
    source: string,
    member: WizardTextMember,
    step?: WizardStepDefinition,
    position?: number,
    count?: number,
  ): string {
    const common = {
      formId: this.formId(),
      locale: this.snapshot().locale,
      wizard: this.wizard(),
    } as const;
    const context =
      member === 'position' && step !== undefined
        ? ({
            ...common,
            step,
            member,
            position: position!,
            count: count!,
          } as const)
        : step === undefined
          ? ({
              ...common,
              member: member as 'label' | 'previous' | 'next' | 'complete',
            } as const)
          : ({
              ...common,
              step,
              member: member as Exclude<
                WizardTextMember,
                'previous' | 'next' | 'complete' | 'position'
              >,
            } as const);
    const result = this.textProjector.projectWizard(source, context);
    if (!this.reportedTextIdentities.has(result.identity)) {
      this.reportedTextIdentities.add(result.identity);
      this.form.reportDiagnostics(result.diagnostics);
    }
    return result.text;
  }

  protected requestPrevious(): void {
    this.form.requestWizardPrevious();
  }

  protected requestNext(): void {
    this.form.requestWizardNext();
  }

  protected requestComplete(): void {
    this.form.requestWizardComplete();
  }
}

function wizardHostDiagnostic(
  wizard: WizardDefinition,
  step: WizardStepDefinition | undefined,
) {
  return Object.freeze({
    code:
      step === undefined
        ? 'WIZARD_HOST_INSTANTIATION_FAILED'
        : 'WIZARD_STEP_HOST_INSTANTIATION_FAILED',
    severity: 'error' as const,
    source: 'runtime' as const,
    parameters: Object.freeze({
      wizardId: wizard.id,
      ...(step === undefined ? {} : { stepId: step.id }),
    }),
    fallbackMessage:
      step === undefined
        ? 'Wizard host could not be instantiated.'
        : 'Wizard step host could not be instantiated.',
  });
}
