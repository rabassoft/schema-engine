# D-003/M26 async-validation promotion-readiness review — Cycle 1

- **Date:** 2026-08-02
- **Scope:** Remaining Deferred candidates after completed M25
- **Outcome:** D-003 is selected and promoted only for bounded M26 architecture
  design; no observable contract or implementation is active

## 1. Candidate comparison

| Candidate                         | Readiness                                                                                                                                                | Consumer value                                                                   | Boundary risk                                                                                     | Outcome                          |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------- |
| D-003 asynchronous validation     | Its synchronous normalization prerequisite is completed and exercised by Angular and Standard.                                                           | High for remote uniqueness, policy and service-backed business checks.           | Material but containable behind an application-supplied asynchronous port and explicit lifecycle. | Selected for bounded M26 design. |
| D-039 explicit defaults           | The engine can represent presence correctly, but no concrete entity-creation flow selects raw schema, resolved model or normalized definition ownership. | High, but silent or partial default semantics can violate application ownership. | High until initialization authority and recursive/composition behavior are concrete.              | Remains Deferred.                |
| D-030 advanced localization       | Semantic formats now exist, satisfying only part of the historical trigger.                                                                              | Medium; currency, units, calendars and parsers have different value semantics.   | High if presentation, parsing and domain typing are combined prematurely.                         | Remains Deferred.                |
| D-031 additional issue visibility | Technically small.                                                                                                                                       | Medium-low without a consumer requiring `dirty` or `submit-attempted`.           | Low, but would add policy surface without evidence.                                               | Remains Deferred.                |
| D-007 composition/conditionals    | Local static reference resolution exists, but no general evaluation layer exists.                                                                        | High.                                                                            | Very high across schema evaluation, UI derivation and branch identity.                            | Remains Deferred.                |
| D-013 dynamic definitions         | No concrete hot-schema consumer exists.                                                                                                                  | Medium.                                                                          | Very high across focus, touched, scopes and stale operations.                                     | Remains Deferred.                |
| D-026/second framework adapter    | Angular and Standard already provide cross-target evidence.                                                                                              | Strategic, but prior direction retains React/Vue until demand.                   | Broad delivery and compatibility surface rather than one engine capability.                       | Remains Deferred.                |

## 2. Selected bounded M26 question

M26 may design an application-supplied asynchronous validation capability that
composes with the existing synchronous result while preserving application
ownership of `value` and `baselineValue`. The architecture must decide:

1. the framework-neutral port and whether it belongs in core or a separate
   integration layer;
2. deterministic pending, completion, cancellation, replacement and disposal
   lifecycle;
3. stale-result rejection when value, schema or validation generation changes;
4. immutable issue normalization, ordering and collision rules with synchronous
   issues;
5. explicit trigger/debounce ownership and `AbortSignal` propagation; and
6. Angular and Standard projection of pending/error evidence without making a
   renderer or framework the source of truth.

## 3. Explicit exclusions

Selection does not activate implementation, a Public API, Ajv `$async`, remote
schema loading, asynchronous compilation, HTTP ownership, persistence, submit
flows, optimistic value projection, partial validation, custom keywords,
workers, React, Vue, versioning, release or publication.

## 4. Gate result

Cycle 1 finds no conflict with Accepted SPEC-001/SPEC-007, ADR-005 or ADR-022
because those synchronous contracts remain authoritative until a separately
accepted ADR and SPEC explicitly replace only the promoted slice. D-003 is
promoted for M26 architecture design only. The exact next action is to draft
and completely review ADR-029; implementation remains unauthorized.
