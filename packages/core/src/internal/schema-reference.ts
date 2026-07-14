import type { DocumentPath } from '../contracts.js';
import { isOrdinaryObject } from './path.js';
import { actualType } from './value.js';

export type InvalidSchemaReferenceReason =
  | 'accessor-reference'
  | 'non-string-reference'
  | 'root-reference-not-supported'
  | 'non-fragment-reference'
  | 'invalid-uri-reference'
  | 'plain-name-fragment-not-supported'
  | 'invalid-percent-encoding'
  | 'invalid-pointer-escape'
  | 'outside-definitions'
  | 'non-canonical-array-index';

export type UnresolvedSchemaReferenceReason =
  | 'missing-target'
  | 'non-enumerable-target'
  | 'accessor-target'
  | 'non-schema-target';

export type ReferenceChain = readonly DocumentPath[];

export interface ResolvedSchemaCursor {
  readonly schema: Record<string, unknown>;
  readonly documentPath: DocumentPath;
  readonly referenceChain: ReferenceChain;
}

export interface ReferenceDiagnosticPaths {
  readonly referenceChain: ReferenceChain;
  readonly targetDocumentPath?: DocumentPath;
  readonly firstDocumentPath?: DocumentPath;
}

export interface DefinitionRegistryEntry {
  readonly name: string;
  readonly schema: Record<string, unknown>;
  readonly documentPath: DocumentPath;
}

export interface DefinitionRegistryProblem {
  readonly documentPath: DocumentPath;
  readonly definition?: string;
  readonly expected:
    'own enumerable ordinary definition object' | 'ordinary schema object';
  readonly actualType: string;
}

export type DefinitionRegistryInspection =
  | {
      readonly kind: 'absent';
      readonly entries: readonly DefinitionRegistryEntry[];
      readonly problems: readonly DefinitionRegistryProblem[];
    }
  | {
      readonly kind: 'invalid-exterior';
      readonly entries: readonly DefinitionRegistryEntry[];
      readonly problems: readonly DefinitionRegistryProblem[];
    }
  | {
      readonly kind: 'indexed';
      readonly entries: readonly DefinitionRegistryEntry[];
      readonly problems: readonly DefinitionRegistryProblem[];
    };

export type DecodedSchemaReference =
  | {
      readonly kind: 'invalid';
      readonly reason: InvalidSchemaReferenceReason;
    }
  | {
      readonly kind: 'decoded';
      readonly tokens: readonly string[];
    };

export type SchemaReferenceResolution =
  | {
      readonly kind: 'invalid';
      readonly reason: 'non-canonical-array-index';
    }
  | {
      readonly kind: 'unresolved';
      readonly reason: UnresolvedSchemaReferenceReason;
      readonly targetDocumentPath: DocumentPath;
    }
  | {
      readonly kind: 'resolved';
      readonly cursor: ResolvedSchemaCursor;
    };

const INVALID_PERCENT_TRIPLET = /%(?![0-9A-Fa-f]{2})/;
const CANONICAL_ARRAY_INDEX = /^(?:0|[1-9][0-9]*)$/;

export function inspectDefinitionRegistry(
  root: Record<string, unknown>,
): DefinitionRegistryInspection {
  const descriptor = Object.getOwnPropertyDescriptor(root, '$defs');
  if (descriptor === undefined) {
    return Object.freeze({
      kind: 'absent',
      entries: Object.freeze([]),
      problems: Object.freeze([]),
    });
  }

  if (
    !descriptor.enumerable ||
    !('value' in descriptor) ||
    !isOrdinaryObject(descriptor.value)
  ) {
    const problem = definitionRegistryProblem(
      ['$defs'],
      'own enumerable ordinary definition object',
      !('value' in descriptor) ? 'accessor' : actualType(descriptor.value),
    );
    return Object.freeze({
      kind: 'invalid-exterior',
      entries: Object.freeze([]),
      problems: Object.freeze([problem]),
    });
  }

  const definitions = descriptor.value;
  const entries: DefinitionRegistryEntry[] = [];
  const problems: DefinitionRegistryProblem[] = [];
  for (const name of Object.keys(definitions)) {
    const entryDescriptor = Object.getOwnPropertyDescriptor(definitions, name);
    if (
      entryDescriptor === undefined ||
      !('value' in entryDescriptor) ||
      !isOrdinaryObject(entryDescriptor.value)
    ) {
      problems.push(
        definitionRegistryProblem(
          ['$defs', name],
          'ordinary schema object',
          entryDescriptor === undefined
            ? 'missing'
            : !('value' in entryDescriptor)
              ? 'accessor'
              : actualType(entryDescriptor.value),
          name,
        ),
      );
      continue;
    }

    entries.push(
      Object.freeze({
        name,
        schema: entryDescriptor.value as Record<string, unknown>,
        documentPath: copyDocumentPath(['$defs', name]),
      }),
    );
  }

  return Object.freeze({
    kind: 'indexed',
    entries: Object.freeze(entries),
    problems: Object.freeze(problems),
  });
}

export function decodeSchemaReference(
  reference: string,
): DecodedSchemaReference {
  if (INVALID_PERCENT_TRIPLET.test(reference)) {
    return invalidDecodedReference('invalid-percent-encoding');
  }

  const fragmentMarker = reference.indexOf('#');
  if (
    !hasOnlyUriReferenceCharacters(reference, fragmentMarker) ||
    !hasValidBracketPlacement(reference, fragmentMarker) ||
    (fragmentMarker >= 0 && reference.indexOf('#', fragmentMarker + 1) >= 0)
  ) {
    return invalidDecodedReference('invalid-uri-reference');
  }

  if (fragmentMarker !== 0) {
    return invalidDecodedReference('non-fragment-reference');
  }

  let fragment: string;
  try {
    fragment = decodeURIComponent(reference.slice(1));
  } catch {
    return invalidDecodedReference('invalid-percent-encoding');
  }

  if (fragment.length > 0 && !fragment.startsWith('/')) {
    return invalidDecodedReference('plain-name-fragment-not-supported');
  }
  if (fragment.length === 0) {
    return invalidDecodedReference('outside-definitions');
  }

  const encodedTokens = fragment.slice(1).split('/');
  const tokens: string[] = [];
  for (const token of encodedTokens) {
    const decoded = decodePointerToken(token);
    if (decoded === undefined) {
      return invalidDecodedReference('invalid-pointer-escape');
    }
    tokens.push(decoded);
  }

  if (tokens[0] !== '$defs' || tokens.length < 2) {
    return invalidDecodedReference('outside-definitions');
  }

  return Object.freeze({ kind: 'decoded', tokens: Object.freeze(tokens) });
}

export function resolveSchemaReference(
  root: Record<string, unknown>,
  tokens: readonly string[],
  referenceChain: ReferenceChain,
): SchemaReferenceResolution {
  let current: unknown = root;
  const targetDocumentPath: Array<string | number> = [];

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index] as string;
    const array = Array.isArray(current) ? current : undefined;
    if (array === undefined && !isOrdinaryObject(current)) {
      return unresolvedReference('non-schema-target', targetDocumentPath);
    }

    if (array !== undefined) {
      if (!CANONICAL_ARRAY_INDEX.test(token)) {
        return Object.freeze({
          kind: 'invalid',
          reason: 'non-canonical-array-index',
        });
      }
      if (!arrayIndexExists(token, array.length)) {
        return unresolvedReference('missing-target', [
          ...targetDocumentPath,
          token,
        ]);
      }
    }

    const descriptor = Object.getOwnPropertyDescriptor(current, token);
    const unresolvedPath = [...targetDocumentPath, token];
    if (descriptor === undefined) {
      return unresolvedReference('missing-target', unresolvedPath);
    }
    if (!descriptor.enumerable) {
      return unresolvedReference('non-enumerable-target', unresolvedPath);
    }
    if (!('value' in descriptor)) {
      return unresolvedReference('accessor-target', unresolvedPath);
    }

    const pathSegment = array === undefined ? token : Number(token);
    current = descriptor.value;
    targetDocumentPath.push(pathSegment);
    const final = index === tokens.length - 1;
    if (final) {
      if (!isOrdinaryObject(current)) {
        return unresolvedReference('non-schema-target', targetDocumentPath);
      }
      return Object.freeze({
        kind: 'resolved',
        cursor: createResolvedSchemaCursor(
          current as Record<string, unknown>,
          targetDocumentPath,
          referenceChain,
        ),
      });
    }

    if (!Array.isArray(current) && !isOrdinaryObject(current)) {
      return unresolvedReference('non-schema-target', targetDocumentPath);
    }
  }

  return unresolvedReference('non-schema-target', targetDocumentPath);
}

export function copyDocumentPath(path: DocumentPath): DocumentPath {
  return Object.freeze([...path]);
}

export function copyReferenceChain(chain: ReferenceChain): ReferenceChain {
  return Object.freeze(chain.map((path) => copyDocumentPath(path)));
}

export function appendReferencePath(
  chain: ReferenceChain,
  path: DocumentPath,
): ReferenceChain {
  return Object.freeze([
    ...chain.map((member) => copyDocumentPath(member)),
    copyDocumentPath(path),
  ]);
}

export function createResolvedSchemaCursor(
  schema: Record<string, unknown>,
  documentPath: DocumentPath,
  referenceChain: ReferenceChain,
): ResolvedSchemaCursor {
  return Object.freeze({
    schema,
    documentPath: copyDocumentPath(documentPath),
    referenceChain: copyReferenceChain(referenceChain),
  });
}

export function referenceDiagnosticParameters(
  parameters: Readonly<Record<string, unknown>>,
  paths: ReferenceDiagnosticPaths,
): Readonly<Record<string, unknown>> {
  return Object.freeze({
    ...parameters,
    ...(paths.targetDocumentPath === undefined
      ? {}
      : { targetDocumentPath: copyDocumentPath(paths.targetDocumentPath) }),
    ...(paths.firstDocumentPath === undefined
      ? {}
      : { firstDocumentPath: copyDocumentPath(paths.firstDocumentPath) }),
    referenceChain: copyReferenceChain(paths.referenceChain),
  });
}

function definitionRegistryProblem(
  documentPath: DocumentPath,
  expected: DefinitionRegistryProblem['expected'],
  valueType: string,
  definition?: string,
): DefinitionRegistryProblem {
  return Object.freeze({
    documentPath: copyDocumentPath(documentPath),
    ...(definition === undefined ? {} : { definition }),
    expected,
    actualType: valueType,
  });
}

function invalidDecodedReference(
  reason: InvalidSchemaReferenceReason,
): DecodedSchemaReference {
  return Object.freeze({ kind: 'invalid', reason });
}

function hasOnlyUriReferenceCharacters(
  reference: string,
  fragmentMarker: number,
): boolean {
  for (let index = 0; index < reference.length; index += 1) {
    const character = reference[index] as string;
    if (character === '%') {
      index += 2;
      continue;
    }
    if (character === '#') continue;

    const fragmentCharacter = fragmentMarker >= 0 && index > fragmentMarker;
    if (
      fragmentCharacter
        ? !isFragmentCharacter(character)
        : !isUriReferenceCharacter(character)
    ) {
      return false;
    }
  }
  return true;
}

function isFragmentCharacter(character: string): boolean {
  return isPchar(character) || character === '/' || character === '?';
}

function isUriReferenceCharacter(character: string): boolean {
  return (
    isPchar(character) ||
    character === '/' ||
    character === '?' ||
    character === '[' ||
    character === ']'
  );
}

function isPchar(character: string): boolean {
  return (
    /^[A-Za-z0-9._~-]$/.test(character) || "!$&'()*+,;=:@".includes(character)
  );
}

function hasValidBracketPlacement(
  reference: string,
  fragmentMarker: number,
): boolean {
  const resource =
    fragmentMarker < 0 ? reference : reference.slice(0, fragmentMarker);
  const firstOpen = resource.indexOf('[');
  const firstClose = resource.indexOf(']');
  if (firstOpen < 0 && firstClose < 0) return true;
  if (
    firstOpen < 0 ||
    firstClose < firstOpen ||
    resource.indexOf('[', firstOpen + 1) >= 0 ||
    resource.indexOf(']', firstClose + 1) >= 0
  ) {
    return false;
  }

  const schemeAuthority = /^[A-Za-z][A-Za-z0-9+.-]*:\/\//.exec(resource);
  const authorityStart = resource.startsWith('//')
    ? 2
    : (schemeAuthority?.[0].length ?? -1);
  if (authorityStart < 0) return false;

  const pathStart = resource.slice(authorityStart).search(/[/?]/);
  const authorityEnd =
    pathStart < 0 ? resource.length : authorityStart + pathStart;
  return firstOpen >= authorityStart && firstClose < authorityEnd;
}

function decodePointerToken(token: string): string | undefined {
  let decoded = '';
  for (let index = 0; index < token.length; index += 1) {
    const character = token[index] as string;
    if (character !== '~') {
      decoded += character;
      continue;
    }

    const escape = token[index + 1];
    if (escape === '0') decoded += '~';
    else if (escape === '1') decoded += '/';
    else return undefined;
    index += 1;
  }
  return decoded;
}

function arrayIndexExists(token: string, length: number): boolean {
  const lengthToken = String(length);
  return (
    token.length < lengthToken.length ||
    (token.length === lengthToken.length && token < lengthToken)
  );
}

function unresolvedReference(
  reason: UnresolvedSchemaReferenceReason,
  targetDocumentPath: DocumentPath,
): SchemaReferenceResolution {
  return Object.freeze({
    kind: 'unresolved',
    reason,
    targetDocumentPath: copyDocumentPath(targetDocumentPath),
  });
}
