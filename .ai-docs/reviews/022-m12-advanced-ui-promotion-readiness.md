# M12 advanced UI Schema promotion-readiness review

- **State:** Accepted; recommendation formally approved by Ricard
- **Date:** 15 July 2026
- **Acceptance date:** 15 July 2026
- **Reviewed:** D-011 and D-012 restart conditions, accepted SPEC-001/002/003,
  ADR-007/009/014/015, current Public core contracts, compiler normalization,
  runtime scopes and Angular structural projection
- **Current register state:** D-042 is Promoted for narrow normative design;
  D-011 and D-012 remain Deferred outside that slice

## 1. Result

D-011 and D-012 are not ready for joint wholesale promotion.

The repository now supplies useful prerequisites that did not exist when the
entries were deferred: nested object and collection structure, an immutable
normalized node tree, framework-neutral runtime targets, overlapping
application-owned scopes and fixed Angular object/collection/item hosts. These
prove that data structure, runtime semantics and framework projection can stay
separate.

They do not constitute a neutral layout contract. `FormDefinition.nodes`
mirrors managed data structure, UI `order` only orders direct structural
children, and the Angular containers deliberately have fixed semantic markup.
Promoting grids, tabs, accordions, sections, wizards, slots, actions and
responsive behavior together would combine several contracts with different
owners and lifecycles before the smallest useful abstraction has evidence.

D-012 is also not independently ready. Accepted contracts make the application
the source of each `FormScope`; UI metadata cannot silently acquire authority
over validation progression or application workflow. Its restart condition —
an advanced UI Schema design — is not yet satisfied.

## 2. Readiness evidence

The following foundations are complete and reusable by later design:

1. `FormDefinition.nodes` and collection item templates provide immutable,
   normalized structure without exposing raw JSON Schema to adapters.
2. `DataPath`, `CollectionItemAddress` and `CollectionNodeAddress` provide
   exact runtime targets without positional collection identity.
3. `FormScope` already defines application-owned grouping, overlap,
   `includeGlobalIssues`, visibility and reset behavior.
4. Angular recursively projects normalized nodes through fixed accessible
   object, collection and item hosts.
5. Leaf renderer selection remains adapter-owned under ADR-007 and does not
   depend on value, interaction state or locale.

The following promotion gates remain open:

1. There is no neutral distinction between data nodes and presentation-only
   layout nodes.
2. There is no contract for membership, ordering, unique identity, nesting or
   reuse of nodes inside a presentation group.
3. There is no ownership rule for active tab, expanded section, wizard step,
   responsive breakpoint or other layout state.
4. There is no adapter contract for container resolution, fallback semantics,
   accessibility or unsupported layout capabilities.
5. There is no action/command contract; adding one would overlap controlled
   operations and application workflow.
6. Declarative collection scopes would need item-instance semantics under
   insert, remove and move without using numeric identity.

## 3. Recommended split

The accepted decision does not promote D-011 or D-012 as currently written. It
creates D-042, the next global deferred identifier, for one narrow M12 design
slice:

**Static neutral presentation groups**

- one static `section`-like grouping primitive over the existing normalized
  form structure;
- immutable, framework-neutral normalized output compiled from UI metadata;
- deterministic group identity, membership, nesting, ordering, diagnostics and
  accessible label semantics;
- no effect on managed data paths, validation, operations, dirty, touched,
  focus, controlled state or validator input; and
- fixed native Angular projection as the first evidence consumer, without a
  generic container registry.

This slice should establish whether a layout model can remain presentation-only
before more expressive containers are designed. It must not use structural
object nodes as implicit sections or make raw UI Schema available to Angular.

The remainder of D-011 stays Deferred: grids, tabs, accordions, wizards, slots,
actions, responsive rules, conditional visibility, custom container renderers
and adapter capability negotiation. D-012 also stays Deferred until the static
group contract has been accepted and implemented. That later review can decide
whether metadata merely publishes immutable scope descriptors or whether the
application must continue constructing every runtime `FormScope` explicitly.

## 4. Questions the first ADR must close

1. **Separate model:** whether normalized layout is a separate tree referencing
   managed nodes, or a presentation wrapper tree containing them exactly once.
2. **Identity and membership:** how group IDs and node references are validated,
   whether groups may nest, and whether duplication or omission is permitted.
3. **Root and collection boundary:** whether the first slice is root/object
   only and explicitly excludes per-item groups until stable item-address
   semantics are designed.
4. **Fallback and accessibility:** how invalid or unsupported groups degrade
   deterministically while preserving field order, labels and issue access.
5. **Public/Internal inventory:** which compiler input/output types are Public
   under ADR-009 and how existing manual `FormDefinition` consumers migrate.

## 5. D-012 conditions for a later review

A future declarative-scope proposal must preserve these accepted invariants:

- the application owns workflow, submission, persistence and baseline changes;
- scopes do not mutate values or define renderer behavior;
- runtime scope targets use canonical managed paths or stable collection
  addresses, never collection indices;
- scopes may overlap and do not require registration today; and
- showing or hiding validation errors remains an explicit runtime action.

Before promotion, that proposal must define generated scope identity, mapping
from static groups to targets, global-issue policy, nested and collection-item
behavior, unknown/blocked members, and whether descriptors are advisory or
runtime-authoritative. No current consumer demonstrates the need to settle
those questions in the first static grouping slice.

## 6. Acceptance result

Ricard formally accepted this review on 15 July 2026. Acceptance did the
following:

1. approved the split rather than wholesale D-011/D-012 promotion;
2. created D-042 for static neutral presentation groups and promoted only that
   identifier to M12 normative design; and
3. left D-011's remaining capabilities and all of D-012 Deferred.

The exact next document is ADR-017, the M12 architecture ADR. It must close
section 4 before any SPEC or implementation plan is drafted. Acceptance does
not authorize a SPEC, plan, Public contract change or implementation.
