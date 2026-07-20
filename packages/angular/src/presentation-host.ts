// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EnvironmentInjector,
  Injectable,
  ViewContainerRef,
  createEnvironmentInjector,
  effect,
  inject,
  input,
  inputBinding,
  signal,
  viewChild,
  type ComponentRef,
  type Injector,
} from '@angular/core';
import type { Diagnostic } from '@rabassoft/schema-engine';
import { SchemaFormDirective, readRuntimeContext } from './form.directive.js';
import {
  AngularPresentationContainerResolver,
  type AngularPresentationContainerDefinition,
  type AngularPresentationContainerRenderModel,
} from './presentation-container.js';
import {
  ExactPresentationClaims,
  PRESENTATION_ENTRY_CLAIM_CONTEXT,
  PRESENTATION_PANEL_CLAIM_CONTEXT,
  presentationOwnerDiagnosticParameters,
  type PresentationEntryClaimContext,
  type AngularPresentationNode,
  type PresentationPanelClaimContext,
  type PresentationOwnerDefinition,
  type PresentationOwnerSnapshot,
  type PresentationProjectionOwner,
} from './presentation-context.js';
import type {
  PresentationEntryDefinition,
  PresentationPanelDefinition,
} from '@rabassoft/schema-engine';
import { projectPresentationContainer } from './presentation-model.js';
import { AngularTextProjector } from './text.js';

/** @internal */
@Injectable({ providedIn: 'root' })
export class PresentationContainerHostFactory {
  create(
    container: ViewContainerRef,
    environmentInjector: EnvironmentInjector,
    injector: Injector,
    presentation: () => AngularPresentationContainerDefinition,
    owner: () => PresentationProjectionOwner,
    definition: () => PresentationOwnerDefinition,
    snapshot: () => PresentationOwnerSnapshot,
    locale: () => string,
    render: (
      entry: PresentationEntryDefinition<AngularPresentationNode>,
      container: ViewContainerRef,
    ) => ComponentRef<unknown>,
  ): ComponentRef<unknown> {
    return container.createComponent(
      PresentationContainerAdapterHostComponent,
      {
        environmentInjector,
        injector,
        bindings: [
          inputBinding('presentation', presentation),
          inputBinding('owner', owner),
          inputBinding('definition', definition),
          inputBinding('snapshot', snapshot),
          inputBinding('locale', locale),
          inputBinding('render', () => render),
        ],
      },
    );
  }
}

@Component({
  selector: 'schema-presentation-container-adapter-host',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-template #container />`,
})
class PresentationContainerAdapterHostComponent {
  readonly presentation =
    input.required<AngularPresentationContainerDefinition>();
  readonly owner = input.required<PresentationProjectionOwner>();
  readonly definition = input.required<PresentationOwnerDefinition>();
  readonly snapshot = input.required<PresentationOwnerSnapshot>();
  readonly locale = input.required<string>();
  readonly render =
    input.required<
      (
        entry: PresentationEntryDefinition<AngularPresentationNode>,
        container: ViewContainerRef,
      ) => ComponentRef<unknown>
    >();

  private readonly form = inject(SchemaFormDirective);
  private readonly resolver = inject(AngularPresentationContainerResolver);
  private readonly projector = inject(AngularTextProjector);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly container = viewChild.required('container', {
    read: ViewContainerRef,
  });
  private readonly modelState = signal<
    AngularPresentationContainerRenderModel | undefined
  >(undefined);
  private componentRef: ComponentRef<unknown> | undefined;
  private childInjector: EnvironmentInjector | undefined;
  private claims:
    | ExactPresentationClaims<
        PresentationEntryDefinition<AngularPresentationNode>
      >
    | ExactPresentationClaims<
        PresentationPanelDefinition<AngularPresentationNode>
      >
    | undefined;
  private selectedDefinition:
    AngularPresentationContainerDefinition | undefined;
  private lastProjectionIdentity: readonly unknown[] | undefined;
  private claimLifecycle: { active: boolean } | undefined;
  private hostFailureReported = false;

  constructor() {
    effect(() => this.synchronize());
    this.destroyRef.onDestroy(() => this.destroySelected());
  }

  private synchronize(): void {
    const presentation = this.presentation();
    const owner = this.owner();
    const locale = this.locale();
    const context = readRuntimeContext(this.form);
    const formId = context?.formId ?? '';
    const projectionIdentity = [presentation, owner, formId, locale] as const;
    if (!sameIdentity(this.lastProjectionIdentity, projectionIdentity)) {
      this.lastProjectionIdentity = projectionIdentity;
      this.projector.projectPresentationSubtree(presentation, formId, locale);
      const projected = projectPresentationContainer(
        presentation,
        formId,
        locale,
        this.projector,
        owner,
      );
      this.modelState.set(projected.model);
      this.form.reportDiagnostics(projected.diagnostics);
    }
    if (this.selectedDefinition === presentation) return;

    this.destroySelected();
    this.selectedDefinition = presentation;
    this.hostFailureReported = false;
    const resolved = this.resolver.resolve(presentation, owner);
    this.form.reportDiagnostics(resolved.diagnostics);
    if (!resolved.success) return;

    const providers = this.claimProviders(presentation);
    this.childInjector = createEnvironmentInjector(
      providers,
      this.environmentInjector,
    );
    try {
      this.componentRef = this.container().createComponent(
        resolved.registration.renderer,
        {
          environmentInjector: this.childInjector,
          injector: this.childInjector,
          bindings: [
            inputBinding('presentation', () => this.modelState() as never),
          ],
        },
      );
      this.componentRef.changeDetectorRef.detectChanges();
      this.claims?.audit();
    } catch {
      this.failSelected(presentation);
    }
  }

  private claimProviders(
    presentation: AngularPresentationContainerDefinition,
  ): Array<{
    provide:
      | typeof PRESENTATION_ENTRY_CLAIM_CONTEXT
      | typeof PRESENTATION_PANEL_CLAIM_CONTEXT;
    useValue: PresentationEntryClaimContext | PresentationPanelClaimContext;
  }> {
    const state = {
      owner: () => this.owner(),
      definition: () => this.definition(),
      snapshot: () => this.snapshot(),
      render: (
        entry: PresentationEntryDefinition<AngularPresentationNode>,
        container: ViewContainerRef,
      ) => this.render()(entry, container),
    };
    const lifecycle = { active: true };
    this.claimLifecycle = lifecycle;
    if (presentation.kind === 'section' || presentation.kind === 'grid') {
      const expected =
        presentation.kind === 'section'
          ? presentation.children
          : presentation.items.map(({ child }) => child);
      const claims = new ExactPresentationClaims(expected);
      this.claims = claims;
      return [
        {
          provide: PRESENTATION_ENTRY_CLAIM_CONTEXT,
          useValue: {
            ...state,
            claim: (
              entry: PresentationEntryDefinition<AngularPresentationNode>,
            ) => {
              try {
                claims.claim(entry);
              } catch (error) {
                this.failSelected(presentation);
                throw error;
              }
            },
            release: (
              entry: PresentationEntryDefinition<AngularPresentationNode>,
            ) => {
              if (lifecycle.active && claims.release(entry))
                this.failSelected(presentation);
            },
            audit: () => claims.audit(),
          },
        },
      ];
    }
    const claims = new ExactPresentationClaims(presentation.panels);
    this.claims = claims;
    return [
      {
        provide: PRESENTATION_PANEL_CLAIM_CONTEXT,
        useValue: {
          ...state,
          claim: (
            panel: PresentationPanelDefinition<AngularPresentationNode>,
          ) => {
            try {
              claims.claim(panel);
            } catch (error) {
              this.failSelected(presentation);
              throw error;
            }
          },
          release: (
            panel: PresentationPanelDefinition<AngularPresentationNode>,
          ) => {
            if (lifecycle.active && claims.release(panel))
              this.failSelected(presentation);
          },
          fail: (panel: PresentationPanelDefinition<AngularPresentationNode>) =>
            this.form.reportDiagnostics([
              panelHostDiagnostic(presentation, panel, this.owner()),
            ]),
          audit: () => claims.audit(),
        },
      },
    ];
  }

  private destroySelected(): void {
    if (this.claimLifecycle !== undefined) this.claimLifecycle.active = false;
    this.claimLifecycle = undefined;
    const ref = this.componentRef;
    this.componentRef = undefined;
    if (ref !== undefined && !ref.hostView.destroyed) ref.destroy();
    this.container().clear();
    this.childInjector?.destroy();
    this.childInjector = undefined;
    this.claims = undefined;
    this.selectedDefinition = undefined;
  }

  private failSelected(
    presentation: AngularPresentationContainerDefinition,
  ): void {
    if (this.hostFailureReported) return;
    this.hostFailureReported = true;
    this.destroySelected();
    this.form.reportDiagnostics([
      presentationHostDiagnostic(presentation, this.owner()),
    ]);
  }
}

/** @internal */
export function panelHostDiagnostic(
  owner: AngularPresentationContainerDefinition,
  panel: PresentationPanelDefinition<AngularPresentationNode>,
  projectionOwner?: PresentationProjectionOwner,
): Diagnostic {
  return Object.freeze({
    code: 'PANEL_HOST_INSTANTIATION_FAILED',
    severity: 'error',
    source: 'runtime',
    parameters: Object.freeze({
      ownerKind: owner.kind,
      ownerId: owner.id,
      panelId: panel.id,
      ...(projectionOwner === undefined
        ? {}
        : presentationOwnerDiagnosticParameters(projectionOwner)),
    }),
    fallbackMessage: 'Presentation panel host could not be instantiated.',
  });
}

/** @internal */
export function presentationHostDiagnostic(
  definition: AngularPresentationContainerDefinition,
  owner?: PresentationProjectionOwner,
): Diagnostic {
  const common = {
    severity: 'error' as const,
    source: 'runtime' as const,
  };
  if (definition.kind === 'section') {
    return Object.freeze({
      ...common,
      code: 'SECTION_HOST_INSTANTIATION_FAILED',
      parameters: Object.freeze({
        sectionId: definition.id,
        ...(owner === undefined
          ? {}
          : presentationOwnerDiagnosticParameters(owner)),
      }),
      fallbackMessage: 'Section host could not be instantiated.',
    });
  }
  const code =
    definition.kind === 'tabs'
      ? 'TABS_HOST_INSTANTIATION_FAILED'
      : definition.kind === 'accordion'
        ? 'ACCORDION_HOST_INSTANTIATION_FAILED'
        : 'GRID_HOST_INSTANTIATION_FAILED';
  const fallbackMessage =
    definition.kind === 'tabs'
      ? 'Tabs host could not be instantiated.'
      : definition.kind === 'accordion'
        ? 'Accordion host could not be instantiated.'
        : 'Grid host could not be instantiated.';
  return Object.freeze({
    ...common,
    code,
    parameters: Object.freeze({
      presentationKind: definition.kind,
      presentationId: definition.id,
      ...(owner === undefined
        ? {}
        : presentationOwnerDiagnosticParameters(owner)),
    }),
    fallbackMessage,
  });
}

function sameIdentity(
  left: readonly unknown[] | undefined,
  right: readonly unknown[],
): boolean {
  return (
    left !== undefined &&
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}
