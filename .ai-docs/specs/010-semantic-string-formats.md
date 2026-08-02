# SPEC-010: Semantic String Formats

- **State:** Accepted
- **Version:** 0.1.0
- **Date:** 30 July 2026
- **Acceptance date:** 30 July 2026
- **Milestone:** M24 — Semantic string formats
- **Promoted capability:** bounded D-037 slice under review 209
- **Accepted architecture:** ADR-027 revision 0, coordinated with ADR-005
  revision 5 and ADR-022 revision 2
- **Accepted baselines:** SPEC-001 v0.1.15 and SPEC-007 v0.1.0
- **Complete review:** [`review 211`](../reviews/211-spec-010-review.md) cycle 2
  passed all fourteen areas with zero findings
- **Authority:** Accepted observable M24 extension; it replaces only the
  `format` clauses it names and authorizes PLAN-026 preparation/review

## 1. Public contract

Core exports:

```ts
export type StringSemanticFormat = 'email' | 'date' | 'date-time';

export interface StringFieldDefinition extends BaseFieldDefinition {
  readonly kind: 'string';
  readonly format?: StringSemanticFormat;
  // Existing constraints and choices remain unchanged.
}
```

String `FieldTemplate` carries the same optional member through its existing
derivation. The member and type are Public + Experimental + Active. No new
entry point or renderer component is added.

## 2. Compilation

At every supported string leaf:

| Input                        | Result                                              |
| ---------------------------- | --------------------------------------------------- |
| no own `format`              | no normalized member or diagnostic                  |
| `email`, `date`, `date-time` | exact normalized member, no format diagnostic       |
| another string               | no member; warning `IGNORED_SCHEMA_FORMAT`          |
| accessor/non-string          | compilation-blocking `INVALID_SCHEMA_KEYWORD_VALUE` |

`IGNORED_SCHEMA_FORMAT` has source `schema`, severity `warning`, the exact
`dataPath`/`documentPath`, parameters `{ format }` and a stable fallback
message. Invalid values use parameters `{ keyword: 'format', expected:
'string format name', ...safeActual }`.

The rule applies equally to direct, nested, collection-item-template and local
reference targets, including nullable strings. Reference/template diagnostic
metadata follows the existing SPEC-003/SPEC-004 rules. Other node kinds retain
`IGNORED_SCHEMA_KEYWORD`.

Compiled definitions and format values are immutable. Compilation does not
validate data or mutate schema/UI Schema.

## 3. Official validation

The existing factory remains the only validator export. Its fixed mode becomes:

```ts
{
  allErrors: true,
  logger: false,
  strict: false,
  validateFormats: true,
  addUsedSchema: false
}
```

It registers only `email`, `date` and `date-time` from an internal browser-safe
ESM subset adapted from exact `ajv-formats@3.0.1` full validators. The package
and root workspace own the pinned package only as development/conformance
tooling, with parity evidence and MIT attribution. No comparison keyword or
dynamic CommonJS code-generation bridge enters runtime. Every other option,
cache/failure rule and issue mapping from SPEC-007 remains unchanged; core,
Angular and both apps own neither dependency nor format validation.

Selected-format violations yield ordinary immutable `format` issues in Ajv
order. Unknown format names tolerated outside the supported compiler flow do
not assert. The supported flow still compiles before runtime creation.

## 4. Native rendering

For a generic string field, Angular and Standard set the input type to:

- `email` for normalized `email`;
- `date` for normalized `date`;
- `text` for normalized `date-time`; and
- `text` when format is absent.

The exact DOM value is emitted. There is no trim, timezone conversion,
canonicalization, default insertion or browser-to-runtime issue bridge.
Nullable actions, clear, focus, touched, controlled reconciliation,
accessibility descriptions and issue rendering retain their accepted behavior.

A string enum continues to resolve to its select renderer/control regardless
of format. Validation still evaluates the schema format against the selected
string.

## 5. Runtime and manual definitions

Runtime structural validation accepts only an absent member or one of the
three exact strings on string definitions/templates. An own accessor or other
value on a string definition/template is invalid under the existing
`INVALID_RUNTIME_OPTIONS`/`INVALID_FORM_DEFINITION` boundaries. The TypeScript
Public contract does not expose `format` on non-string definitions; if
untyped/manual input carries such an extra member, the existing tolerant
structural boundary does not interpret it. Runtime does not revalidate a
definition after creation.

Operations check only the existing primitive/null compatibility and never
enforce format.

## 6. Required conformance

Tests shall cover:

1. direct, nested, template and local-reference normalization;
2. nullable and enum coexistence;
3. absent, selected, unknown, non-string and accessor cases;
4. exact diagnostic paths, metadata, ordering and immutability;
5. manual definition acceptance/rejection;
6. unchanged operation/runtime controlled behavior;
7. Ajv valid/invalid cases for all three formats in full mode;
8. unknown format tolerance and unchanged schema/value/cache behavior;
9. root-only declarations and dependency ownership;
10. Angular input types, exact emission, enum precedence and nullable behavior;
11. Standard input types, exact emission and enum precedence;
12. one shared reference scenario and edited-schema evidence;
13. unchanged existing conformance and package boundaries; and
14. full workspace, docs, build, unit and focused Chromium verification.

## 7. Non-goals

Other formats, custom format registration, Public validator options, localized
parsing, `datetime-local`, format comparison keywords, browser-authoritative
validation, async/partial validation, composition, expressions, new UI Schema,
release/version/publication and Stable promotion are excluded.
