import type {
  FieldDefinition,
  FieldRuntimeSnapshot,
} from '@rabassoft/schema-engine';
import type { AngularFieldTextSnapshot } from '../text.js';

export interface FieldIds {
  readonly control: string;
  readonly label: string;
  readonly clear: string;
  readonly description: string;
  readonly hint: string;
  readonly tooltip: string;
  readonly errors: string;
}

export function fieldIds(formId: string, field: FieldDefinition): FieldIds {
  const base = `se-${encodeURIComponent(formId)}-${encodeURIComponent(field.name)}`;
  return Object.freeze({
    control: base,
    label: `${base}-label`,
    clear: `${base}-clear`,
    description: `${base}-description`,
    hint: `${base}-hint`,
    tooltip: `${base}-tooltip`,
    errors: `${base}-errors`,
  });
}

export function describedBy(
  ids: FieldIds,
  texts: AngularFieldTextSnapshot,
  snapshot: FieldRuntimeSnapshot,
): string | null {
  const values = [
    ...(texts.description === undefined ? [] : [ids.description]),
    ...(texts.hint === undefined ? [] : [ids.hint]),
    ...(snapshot.showIssues && texts.issueMessages.length > 0
      ? [ids.errors]
      : []),
  ];
  return values.length === 0 ? null : values.join(' ');
}
