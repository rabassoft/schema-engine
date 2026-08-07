# SPEC-019: Controlled Discriminated Nested-Object Alternatives

- **State:** Accepted
- **Version:** 0.1.2
- **Date:** 4 August 2026
- **Acceptance date:** 4 August 2026
- **Milestone:** M33 — Controlled discriminated nested-object alternatives
- **Promoted capability:** bounded D-007 selected by review 314 cycle 2
- **Accepted architecture:** ADR-036 revision 1 and ADR-005 revision 11
- **Accepted baselines:** SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-004
  v0.1.1, SPEC-011 v0.1.0, SPEC-014 v0.1.0, SPEC-015 v0.1.0,
  SPEC-016 v0.1.1 and SPEC-018 v0.1.0
- **Complete reviews:** [Review 317](../reviews/317-spec-019-review.md) cycle 2
  passed all fifteen areas and 17 conformance rows with zero findings after
  three corrections; coordinated [review 319](../reviews/319-m33-owner-relative-descendant-diagnostic-review.md)
  cycle 1 passes the v0.1.1 diagnostic correction with zero findings;
  coordinated [review 320](../reviews/320-m33-presentation-diagnostic-compatibility-review.md)
  cycle 2 passes the v0.1.2 presentation compatibility correction
- **Authority:** Accepted observable M33 contract under PLAN-035 revision 2
  Approved; implementation checkpoints 1–6 are authorized in order, while
  dependency, version, release, publication and Git remain inactive

## 1. Scope

This specification defines one nested ordinary object property whose active
children are selected by a required application-controlled string enum and an
exact finite `oneOf` enum/typed-const bijection. Every unchanged controlled,
validation, framework, package and Deferred rule remains authoritative.

The exact authored grammar, descriptor safety, catalogs, diagnostics,
references, paths, ordering and stopping behavior are ADR-005 revision 11.

## 2. Public definition contract

Core adds these Public + Experimental + Active exports:

```ts
export interface DiscriminatedObjectAlternativeDefinition {
  readonly discriminatorValue: string;
  readonly children: readonly string[];
}

export interface DiscriminatedObjectFieldDefinition extends BaseNodeDefinition {
  readonly kind: 'discriminated-object';
  readonly discriminator: string;
  readonly children: readonly FormNodeDefinition[];
  readonly alternatives: readonly DiscriminatedObjectAlternativeDefinition[];
}

export type ObjectNodeDefinition =
  ObjectFieldDefinition | DiscriminatedObjectFieldDefinition;

export type FormNodeDefinition =
  ObjectNodeDefinition | ArrayNodeDefinition | FieldDefinition;
```

The discriminator is one direct required non-null scalar string-choice child
without normalized `fixedValue`. `children` is the complete unique union in
normalized UI order. Alternatives are dense, contain at least two entries in
choice order, use exact unique choice values and list only their direct unique
variant child names in union-relative order. Unlisted children are common.

No union subtree contains an array/M31 node, another discriminated object or a
normalized field condition. `FormDefinition.nodes` owns the object once;
`FormDefinition.fields` is the static depth-first projection of every
potential primitive leaf exactly once. Existing ordinary object literals
remain assignable; exhaustive union readers must handle the new kind.

`ObjectTextResolutionContext.node` widens to `ObjectNodeDefinition`. No text
member is added; alternative labels are existing discriminator choice labels.

## 3. UI Schema and compiler

One owner `ObjectUiSchema` addresses the union. Text, `order` and `fields`
retain accepted behavior; runtime filters the single normalized order. A
malformed/accessor or otherwise invalid owner `presentation` retains the exact
`INVALID_UI_PRESENTATION` warning family and atomic fallback of
SPEC-005/SPEC-009, and does not add the M33 incompatibility warning. A
structurally valid owner presentation receives ADR-005 revision 11's
non-blocking dynamic-children warning and is ignored. Ordinary object
descendants retain local static presentation.

Union `visibleWhen`/`enabledWhen` targets use
`unsupported-target-location`; an external condition sourcing a union path
uses `source-not-ordinary-field`.

`compileFormDefinition()` keeps its signature, accepts only the exact M33
subset and emits ADR-005 revision 11 diagnostics. Every result/path/parameter is
detached/frozen, retains no schema or discriminator business value, and any
error returns no partial definition.

`unsupported-alternative-descendant` parameters are owner-relative: an
outer/common property contains `reason`, `property` and `expected` with
`branchIndex` absent; a branch property contains the same members plus its
mandatory authored `branchIndex`. No sentinel or inferred branch index exists.

## 4. Manual definitions

Runtime creation and `applyFormOperation()` inspect, in order: base node;
discriminator; union children; discriminator capability; alternatives;
choice/value mapping; alternative child lists/ownership; prohibited subtree
capabilities; and the complete static fields projection.

Existing envelopes gain:

```ts
type DiscriminatedObjectDefinitionReason =
  | 'invalid-discriminated-object'
  | 'invalid-object-alternative'
  | 'inconsistent-alternative-projection';
```

`INVALID_RUNTIME_OPTIONS` adds the exact `definitionReason`, `nodeIndexPath`,
`alternativeIndex?`, `childIndex?`, `path?` and `member?` locators.
`INVALID_FORM_DEFINITION` uses the same applicable locators directly. The first
defect wins; validator/effects are not invoked. Manual definitions are not
cloned or frozen and later mutation remains unsupported.

## 5. Runtime selection and snapshots

Core adds:

```ts
export type ObjectAlternativeSelection =
  | { readonly kind: 'none' }
  | { readonly kind: 'active'; readonly discriminatorValue: string };

export interface DiscriminatedObjectRuntimeSnapshot {
  readonly nodeKind: 'discriminated-object';
  readonly key: string;
  readonly path: DataPath;
  readonly presence: ObjectPresence;
  readonly selection: ObjectAlternativeSelection;
  readonly dirty: boolean;
  readonly touched: boolean;
  readonly focused: boolean;
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
  readonly showIssues: boolean;
  readonly children: readonly NodeRuntimeSnapshot[];
}
```

`NodeRuntimeSnapshot` and `RuntimeTreeSnapshot` widen accordingly. Current
owner object presence plus an own matching discriminator string selects one
alternative; missing, wrong-kind or unknown safe data selects `none`. Managed
accessors retain atomic input/update failure.

Snapshot children contain common plus active children in filtered union order;
`none` contains common only. `FormRuntimeSnapshot.fields` becomes the active
depth-first leaf projection and contains the same leaf snapshot references as
the active node tree. Inactive leaves appear in neither snapshot projection;
non-M33 forms remain exact. Lookups return `undefined` for inactive paths.

## 6. Controlled state

The discriminator emits only the existing set intention and waits for
application confirmation. External changes emit no operation. Core never
creates, clears, migrates or defaults branch data. Dormant value/baseline data
reappears on reselection.

Common/active dirty uses existing full value/baseline presence and `Object.is`;
inactive children do not contribute snapshots or owner dirty. Baseline-only
updates do not select. Touched remains stored by static path while inactive and
may be reset by scope. Deactivating the focused field clears focus without
touching it. One update emits at most one structurally shared snapshot.

## 7. Inactive actions and operation application

An inactive runtime intention or `applyFormOperation()` target emits exactly:

```ts
{
  code: 'INACTIVE_OBJECT_ALTERNATIVE_TARGET',
  severity: 'error',
  source: 'runtime',
  dataPath: targetPath,
  parameters: {
    action,
    ownerPath,
    discriminatorPath,
    requiredAlternativeIndex,
    selection: 'none' | 'different',
    activeAlternativeIndex?,
  },
  fallbackMessage: 'Runtime target belongs to an inactive object alternative.',
}
```

`action` is exactly `requestSetValue`, `requestRemoveValue`, `focus`, `blur` or
`applyFormOperation`. Indices expose no domain value. Runtime emits no operation
or snapshot; form application returns the original value/`changed: false`.
`activeAlternativeIndex` is present exactly for `selection: 'different'` and
absent for `none`; `requiredAlternativeIndex` is always the unique owner index
of the target. Every parameter path is a copied frozen `DataPath`.
Activity follows definition/root/path checks and precedes value compatibility
and expectation, closing stale selection races. `applyOperation()` is unchanged.

## 8. Validation, scopes and defaults

The validator receives exact original schema and complete value. Active/common
issue paths attach normally; inactive-only and owner/`oneOf` paths attach to
the discriminated owner; discriminator paths remain on the common field. No
issue is dropped or rewritten: a reassigned issue retains its original frozen
instance `path` while membership in the owner's `issues` array determines its
display/validity owner. Owner and root remain invalid, so inactive-branch
validator output may remain observable.

A scope may name any static union path. Inactive paths are known without an
unknown warning and contribute no current node until active. Owner scopes use
common plus active nodes.

`deriveSchemaDefaultCandidate()` returns ADR-005 revision 9's exact contextual
unsupported-`oneOf` failure without branch traversal. M30/M32 cannot source or
target union descendants. Async validation and all other accepted capabilities
remain otherwise unchanged.

## 9. Angular and Standard

Both targets consume only normalized definitions/snapshots, narrow the new
kinds and resolve active children by canonical key. Neither reads raw value for
selection, inspects `oneOf` nor filters validator output. The discriminator
uses the existing enum renderer. Variant replacement preserves common hosts
where observable identity permits, clears deactivated focus and retains
accessibility/lifecycle isolation.

One shared frozen scenario proves at least two alternatives, common/nested
children, none/active selection, confirmation/rejection, dormant data,
validation, dirty/touched/focus, inactive/stale actions and independent
Angular/Standard equivalence.

## 10. Migration inventory

| Classification         | Effect                                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| New Public core        | The five exact exports above.                                                                                                        |
| Changed Public core    | Definition/snapshot unions, static/active fields, object text context, manual definitions, lookups, actions, scopes and diagnostics. |
| Changed Public Angular | New-kind projection only; renderer contracts remain.                                                                                 |
| Private Standard/apps  | Independent projection and shared scenario.                                                                                          |
| Internal               | Wrapper/branch cursors, seeded inference, union ownership and activity index.                                                        |
| Unchanged              | Operation/validator signatures, packages, entry points, dependencies, versions and publication.                                      |

A later release requires an explicitly approved coordinated MINOR. This SPEC
selects none.

## 11. Conformance matrix

A future plan must map exactly once:

1. eligible/excluded locations and catalogs;
2. every `oneOf` exterior defect;
3. seed ambiguity plus every discriminator/bijection conflict;
4. property/required warning and conflict compatibility;
5. references/provenance/cycles and union/UI order;
6. presentation/condition exclusions;
7. five exports and ordinary-source compatibility;
8. every manual-definition reason/locator;
9. none/active selection and static-versus-active fields/lookups;
10. controlled confirmation/rejection and dormant data;
11. baseline/dirty/touched/focus/sharing;
12. every inactive action/apply/stale diagnostic;
13. active/inactive scopes and validation issues;
14. original sync/async validator and M29 helper behavior;
15. Angular accessibility/lifecycle and shared Chromium parity;
16. declarations/package/built/clean/source consumers; and
17. complete M1–M32 regressions, boundaries, docs and no graph/version drift.

## 12. Exclusions and acceptance

Root/collection/item/array/recursive/general alternatives, overlapping names,
non-string/inferred discriminators, other applicators/conditionals,
alternative composition, conditional union UI, applied defaults/migration,
dynamic definitions, persistence, transactions, Public AST, React/Vue,
dependency/version/release/publication and Stable promotion remain excluded.

SPEC-019 may be accepted only after a complete repeated review confirms the
Accepted ADRs, all five types, diagnostics/state/targets and all 17 rows with
zero findings. Acceptance would authorize only PLAN-035 preparation/review;
implementation still requires explicit plan approval.

## 13. History

| Version | Date       | Change                                                                          |
| ------- | ---------- | ------------------------------------------------------------------------------- |
| 0.1.2   | 04-08-2026 | Accepted presentation-family compatibility correction after review 320 cycle 2. |
| 0.1.1   | 03-08-2026 | Accepted owner-relative diagnostic correction after review 319 cycle 1.         |
| 0.1.0   | 03-08-2026 | Accepted after review 317 cycle 2 passed.                                       |
