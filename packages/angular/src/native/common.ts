import type {
  DataPath,
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

export function nodeIdBase(formId: string, path: DataPath): string {
  return `se-${encodeURIComponent(JSON.stringify([formId, path]))}`;
}

export function fieldIds(formId: string, field: FieldDefinition): FieldIds {
  const base = nodeIdBase(formId, field.path);
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

export function fieldDisabled(snapshot: FieldRuntimeSnapshot): boolean {
  return (
    snapshot.presence.kind === 'blocked' &&
    snapshot.presence.reason === 'incompatible-ancestor'
  );
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
