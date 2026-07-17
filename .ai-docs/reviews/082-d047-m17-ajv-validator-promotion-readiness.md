# D-047/M17 synchronous Ajv validator promotion-readiness review — Cycle 1

- **Date:** 2026-07-17
- **State:** Accepted
- **Demand:** Editable reference schemas must validate newly added supported
  constraints instead of continuing to use scenario-specific validation logic.
- **Authority reviewed:** Accepted SPEC-001 through SPEC-006, ADR-005 revision
  4, ADR-009, ADR-010, ADR-018, ADR-020, ADR-021, PLAN-017, PLAN-018 checkpoint
  4 and D-003/D-004/D-024/D-026/D-035/D-043/D-046
- **Outcome:** Cycle 1 passed with zero findings

## 1. Readiness conclusion

Promote D-047 as the M17 design boundary for one replaceable synchronous JSON
Schema Draft 2020-12 validator backed by Ajv. The package will be reusable by
framework-neutral consumers while remaining private and unpublished during
this milestone.

The demand exposes a real integration gap, not a core-runtime defect. The
Angular and Standard reference shells currently pass catalog validators whose
logic is fixed to each original scenario. Recompiling an edited schema updates
the normalized form, but those validators do not derive new constraints from
that schema. SPEC-001 already defines the neutral `SchemaValidator` port and
predicts a replaceable Ajv package; no core contract change is required.

Ajv 8.20.0 is already resolved transitively in the frozen workspace graph. Its
official documentation confirms a dedicated Draft 2020-12 class, synchronous
validation, `allErrors`, strictness controls and non-mutating defaults. Direct
runtime ownership still requires an explicit exact dependency in the new
package.

## 2. Promoted boundary

ADR-022 may design only:

- private workspace package `@rabassoft/schema-engine-validator-ajv` with one
  explicit root entry point and Public + Experimental + Active factory API;
- Ajv 8.20.0 through its Draft 2020-12 implementation, with synchronous schema
  compilation and validation;
- fixed deterministic options: all errors, no format assertion, no strict-mode
  logging/rejection, no coercion/default insertion/property removal, no async
  schema loading and no remote-reference network access;
- identity-based compiled-schema reuse that cannot retain discarded schema
  objects indefinitely;
- immutable normalization from Ajv errors to existing `ValidationIssue` and
  `ValidationResult` contracts, including JSON Pointer decoding and the most
  specific safe data path;
- a peer/development relationship to the core rather than a private runtime
  copy;
- consumption by both private reference shells for runtime validation and
  editable-schema evidence; and
- package, unit, consumer, boundary and both-shell regression evidence.

The supported product integration validates only schemas that first pass the
Accepted Schema Engine compiler. Ajv's broader implementation does not activate
unsupported compiler keywords, composition, remote resources or another
dialect.

## 3. Required gates

1. ADR-022 must fix package ownership, Ajv mode/options, caching, failure
   behavior, normalization, shell migration and publication boundary.
2. SPEC-007 must define the new factory's observable contract, exact issue
   mapping, immutability, synchronous behavior and supported integration
   boundary.
3. PLAN-019 must sequence dependency ownership, package implementation,
   integration, regression and final review. It must retain separate gates for
   network access, publication, commit and push.
4. PLAN-018 checkpoint 5 remains paused until the validator integration is
   complete; it may then resume without absorbing M17 into its approved scope.

## 4. Material alternatives

### Put Ajv inside the core

Rejected. It would make one external validator and its release/security cycle
part of the framework-neutral runtime, contradicting the replaceable port.

### Keep one validator per scenario

Rejected for interactive edited schemas. Scenario validators remain useful as
catalog fixtures and expected-evidence oracles, but cannot validate arbitrary
supported edits.

### Add Ajv independently to each shell

Rejected. It duplicates dialect options, error mapping and cache behavior and
would let Angular and Standard teach different integration contracts.

### Enable formats, async validation or remote references

Rejected for M17. `format` remains a compiler-ignored annotation, SPEC-001
requires synchronous validation and network/resource policy is not promoted.

### Publish the package now

Rejected. Publication, version selection, registry evidence and coordinated
release remain separate D-040/D-043 work.

## 5. Complete review

Cycle 1 repeated ten areas from the beginning:

1. **Demand:** Pass. The edited-schema defect is reproducible and explained by
   fixed scenario validators.
2. **Authority:** Pass. SPEC-001 already owns the replaceable synchronous port;
   ADR-005 fixes Draft 2020-12.
3. **Core isolation:** Pass. No core source, export or runtime semantics need
   change.
4. **Package boundary:** Pass. One private reusable package avoids shell
   duplication without authorizing publication.
5. **Dialect/options:** Pass. Fixed Ajv2020 behavior aligns with accepted
   dialect, ignored formats and non-mutating controlled state.
6. **Normalization:** Pass. Existing issue contracts can represent all required
   Ajv evidence without a new core type.
7. **Shell integration:** Pass. Both shells can replace only their configured
   validator while retaining application ownership and compiler gating.
8. **Dependency/release:** Pass. Exact direct ownership is required; transitive
   presence is not treated as authorization or publication evidence.
9. **Deferred boundaries:** Pass. Async/partial validation, framework bridges,
   Public conformance, remote resources and release automation remain inactive.
10. **Delivery sequence:** Pass. ADR, SPEC and approved plan precede code; full
    reviews must converge to zero findings.

**Result:** zero findings and no unresolved change request. The user's explicit
selection accepts this boundary and promotes D-047 only for ADR-022, SPEC-007
and PLAN-019 preparation and review.
