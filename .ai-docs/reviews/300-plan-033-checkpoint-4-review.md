# PLAN-033 checkpoint 4 review

- **Date:** 2026-08-03
- **Scope:** Exact M31 text contracts and independent Angular native
  projection; SPEC-017 rows 16 and 22–23
- **Outcome:** Cycle 1 found four implementation/evidence defects. After
  correction, cycle 2 repeated all twelve areas and rows 16, 22 and 23 with
  zero findings.

## Cycle 1 findings and corrections

1. Angular 22 Signal Forms types do not support an array model on a native
   `<select multiple>`; a scalar binding also overwrote native multiselection.
   The visible select now owns only presentation events while one private
   Signal Form serializes index tokens through a hidden control. Domain value,
   validation and operation application remain runtime-owned.
2. Immediate rejection reconciliation relied on `selectedOptions`, whose
   collection was stale in the supported DOM test environment. The renderer
   now inspects exact option `selected` properties and imperatively restores
   the confirmed token set before emitting an intention.
3. Isolated component/resolver tests did not prove the provider-to-outlet path.
   A form-host integration now proves native resolution, exact operation
   emission, immediate rejection and immutable external confirmation.
4. A checkpoint-1 exhaustive-union adaptation in the existing conditional
   scenario test required both optional condition keys to be own properties,
   hiding every primitive condition. It now excludes only the exact M31 kind
   and the complete M30 scenario regression passes again.

Cycle 1 cannot support completion.

## Cycle 2 complete review

| Area                                 | Result | Evidence                                                                                                                                                   |
| ------------------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Public text union                 | Pass   | Exactly `missing-selection` and `empty-selection` extend `FieldTextMember`; existing members and contexts remain unchanged.                                |
| 2. Total Angular text shape          | Pass   | Both required non-blank labels exist for every field snapshot and empty fallback snapshot; fixed and existing members remain total.                        |
| 3. Resolution and diagnostics        | Pass   | Every-field resolution uses exact sources/context/order; exception, non-string and blank results fall back with one exact warning each.                    |
| 4. Registration boundary             | Pass   | `native-string-enum-array` is rank 30/priority 0, native-provider-only and headless remains empty; ADR-007 consumer overrides win.                         |
| 5. Exact tester                      | Pass   | Only exact M31 kind with own dense non-empty unique data choices and non-blank labels matches; accessors, inheritance, sparse/empty/duplicate fail safely. |
| 6. Native token protocol             | Pass   | Persistently labelled `<select multiple>` exposes only index tokens; blank, whitespace, Unicode and lone-surrogate domain strings never become tokens.     |
| 7. Lossless representability         | Pass   | Missing/empty and exact dense unique known arrays render; sparse, non-string, duplicate and unknown values disable selection while preserving clear.       |
| 8. Ordered candidate                 | Pass   | Confirmed selected values retain order, deselections drop and new choices append in definition order; missing constructs in choice order.                  |
| 9. Controlled reconciliation         | Pass   | Change/blur immediately restore the last snapshot; only an immutable external update changes visual selection and no optimistic value is retained.         |
| 10. Accessibility and interaction    | Pass   | Label, descriptions, status, required/invalid, issues, clear, disabled host focus and field-level focus/blur relationships are exact.                      |
| 11. Lifecycle and integration        | Pass   | Render, locale/text change and destruction emit no value/remove intention; provider/outlet integration emits one exact runtime operation.                  |
| 12. Regression and deferred boundary | Pass   | Existing primitive/nullable/fixed/conditional renderers, scenarios and reference Angular tests pass; Standard/scenario M31 behavior remains checkpoint 5.  |

## Decision

Cycle 2 passes completely with zero findings. PLAN-033 checkpoint 4 is complete
for SPEC-017 rows 16 and 22–23. Checkpoint 5 may begin; this does not activate
package, dependency, version, release or Git work.

## Verification

- Core contract build and focused contract test: 1 file and 2 tests.
- Angular ESLint, typecheck/build and complete unit suite: 17 files and 146
  tests; focused renderer/text/native regression: 6 files and 56 tests.
- Shared scenario unit suite: 2 files and 68 tests.
- Angular reference unit suite: 4 files and 30 tests.
- Documentation: 416 Markdown files and 1,171 local links.
- Scoped Prettier and repository diff hygiene.

The broader Angular reference build reproduced the already documented esbuild
abort inside the restricted sandbox. The exact checkpoint-required unit suites
passed independently; no dependency, manifest, lockfile, package/version,
release, publication, commit, push or external action changed.
