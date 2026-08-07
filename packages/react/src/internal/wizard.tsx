// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import {
  createElement,
  useLayoutEffect,
  useRef,
  type ReactElement,
} from 'react';
import type {
  ValidationIssue,
  WizardDefinition,
  WizardRuntimeSnapshot,
  WizardStepDefinition,
  WizardStepSnapshot,
} from '@rabassoft/schema-engine';
import { semanticId } from './native/common.js';

export interface WizardTexts {
  readonly label: string;
  readonly previous: string;
  readonly next: string;
  readonly complete: string;
}

export interface ProjectedWizardStep {
  readonly definition: WizardStepDefinition;
  readonly snapshot: WizardStepSnapshot;
  readonly label: string;
  readonly position: string;
  readonly progress: string;
  readonly validation?: string;
  readonly children: readonly ReactElement[];
}

export function WizardHost({
  formId,
  definition,
  snapshot,
  texts,
  steps,
  globalIssues,
  requestPrevious,
  requestNext,
  requestComplete,
}: {
  readonly formId: string;
  readonly definition: WizardDefinition;
  readonly snapshot: WizardRuntimeSnapshot;
  readonly texts: WizardTexts;
  readonly steps: readonly ProjectedWizardStep[];
  readonly globalIssues: readonly ValidationIssue[];
  readonly requestPrevious: () => void;
  readonly requestNext: () => void;
  readonly requestComplete: () => void;
}): ReactElement {
  const previousSelection = useRef(snapshot.selectedStepId);
  useLayoutEffect(() => {
    const previous = previousSelection.current;
    previousSelection.current = snapshot.selectedStepId;
    if (previous === snapshot.selectedStepId) return;
    document
      .getElementById(
        stepHeadingId(formId, definition, snapshot.selectedStepId),
      )
      ?.focus();
  }, [definition, formId, snapshot.selectedStepId]);
  const ownerKey = definition.key;
  return createElement(
    'section',
    {
      'aria-labelledby': semanticId(formId, ownerKey, 'label'),
      'aria-busy': snapshot.pendingIntention === undefined ? undefined : true,
    },
    createElement(
      'h2',
      { id: semanticId(formId, ownerKey, 'label') },
      texts.label,
    ),
    createElement(
      'ol',
      null,
      ...steps.map((step) =>
        createElement(
          'li',
          {
            key: step.definition.key,
            id: stepIndicatorId(formId, definition, step.definition.id),
            'aria-current': step.snapshot.current ? 'step' : undefined,
            'aria-busy':
              step.snapshot.validation.state === 'pending' ? true : undefined,
          },
          createElement('span', null, step.position),
          createElement('span', null, step.label),
          createElement(
            'span',
            { id: stepStatusId(formId, definition, step.definition.id) },
            step.progress,
            step.validation === undefined
              ? null
              : createElement('span', null, step.validation),
          ),
        ),
      ),
    ),
    ...steps.map((step) =>
      createElement(WizardStepHost, {
        key: step.definition.key,
        formId,
        wizard: definition,
        step,
      }),
    ),
    snapshot.showGlobalIssues
      ? createElement(
          'div',
          { role: 'alert', tabIndex: -1 },
          ...globalIssues.map((issue, index) =>
            createElement('p', { key: `${index}:${issue.code}` }, issue.code),
          ),
        )
      : null,
    createElement(
      'div',
      null,
      createElement(
        'button',
        {
          type: 'button',
          disabled: !snapshot.controls.previous,
          onClick: requestPrevious,
        },
        texts.previous,
      ),
      createElement(
        'button',
        {
          type: 'button',
          disabled: !snapshot.controls.next,
          onClick: requestNext,
        },
        texts.next,
      ),
      createElement(
        'button',
        {
          type: 'button',
          disabled: !snapshot.controls.complete,
          onClick: requestComplete,
        },
        texts.complete,
      ),
    ),
  );
}

function WizardStepHost({
  formId,
  wizard,
  step,
}: {
  readonly formId: string;
  readonly wizard: WizardDefinition;
  readonly step: ProjectedWizardStep;
}): ReactElement {
  const host = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    if (step.snapshot.current) return;
    const active = document.activeElement;
    if (active instanceof HTMLElement && host.current?.contains(active))
      active.blur();
  }, [step.snapshot.current]);
  const heading = stepHeadingId(formId, wizard, step.definition.id);
  return createElement(
    'section',
    {
      ref: host,
      role: 'region',
      'aria-labelledby': heading,
      'aria-describedby': stepStatusId(formId, wizard, step.definition.id),
      hidden: !step.snapshot.current,
      inert: !step.snapshot.current,
      'aria-hidden': step.snapshot.current ? undefined : true,
      'aria-busy':
        step.snapshot.validation.state === 'pending' ? true : undefined,
    },
    createElement('h3', { id: heading, tabIndex: -1 }, step.label),
    ...step.children,
  );
}

function stepOwnerKey(wizard: WizardDefinition, stepId: string): string {
  return JSON.stringify([wizard.key, 'step', stepId]);
}

function stepHeadingId(
  formId: string,
  wizard: WizardDefinition,
  stepId: string,
): string {
  return semanticId(
    formId,
    JSON.stringify([stepOwnerKey(wizard, stepId), 'heading']),
    'wizard-step',
  );
}

function stepIndicatorId(
  formId: string,
  wizard: WizardDefinition,
  stepId: string,
): string {
  return semanticId(
    formId,
    JSON.stringify([stepOwnerKey(wizard, stepId), 'indicator']),
    'wizard-step',
  );
}

function stepStatusId(
  formId: string,
  wizard: WizardDefinition,
  stepId: string,
): string {
  return semanticId(
    formId,
    JSON.stringify([stepOwnerKey(wizard, stepId), 'status']),
    'wizard-step',
  );
}
