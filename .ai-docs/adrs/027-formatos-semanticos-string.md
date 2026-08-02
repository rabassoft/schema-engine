# ADR 027: Neutral semantic string formats and official assertion

- **State:** Accepted revision 0
- **Date:** 30 July 2026
- **Acceptance date:** 30 July 2026
- **Milestone:** M24 — Semantic string formats
- **Promotes:** only the D-037 slice accepted by
  [`review 209`](../reviews/209-d037-m24-semantic-formats-promotion-readiness.md)
- **Coordinates:** ADR-005 revision 5 and ADR-022 revision 2
- **Complete review:** [`review 210`](../reviews/210-adr-027-review.md) cycle 3
  passed all twelve areas with zero findings
- **Authority:** Accepted M24 architecture; authorizes SPEC-010 preparation and
  review, not implementation, release, commit or push

## 1. Context

`format` is currently a recognized ignored annotation and the official Ajv
validator disables format assertions. Consumers nevertheless need common
email, date and timestamp fields without making Angular, Standard or browser
constraint validation authoritative.

Draft 2020-12 separates format annotation from optional assertion. Schema
Engine therefore needs two explicit responsibilities: the compiler normalizes
selected presentation semantics, while a replaceable validator decides whether
to assert them.

## 2. Decision

### 2.1 Neutral vocabulary

Core adds the Public + Experimental union:

```ts
export type StringSemanticFormat = 'email' | 'date' | 'date-time';
```

`StringFieldDefinition` and string `FieldTemplate` gain optional
`readonly format?: StringSemanticFormat`. It is copied from supported string
schemas reached directly, through nested objects, collection item templates or
local `$ref`. It remains an annotation in core: operations and runtime never
parse, coerce, canonicalize or validate it.

`format` may coexist with nullable strings and string `enum`. Enum renderer
selection retains its higher rank; the format still reaches validation.

### 2.2 Compiler classification

On a string leaf:

- exact `email`, `date` and `date-time` values are supported and normalized;
- any other string value emits one non-blocking
  `IGNORED_SCHEMA_FORMAT` warning and is omitted from the definition;
- an accessor or non-string value emits blocking
  `INVALID_SCHEMA_KEYWORD_VALUE`, expected `string format name`; and
- source objects and values are never mutated.

On root, object, array, identity, number, integer and boolean positions,
`format` retains the existing ignored-annotation behavior. The increment does
not infer a field type from `format`.

### 2.3 Official Ajv assertion

`@rabassoft/schema-engine-validator-ajv` owns a private browser-safe ESM module
containing only the three full validators adapted from
`ajv-formats@3.0.1`. The package and workspace root own that exact dependency
as development/conformance tooling, not runtime code. The adapted source
retains MIT attribution in its header and package NOTICE and is parity-tested
against the pinned oracle.

Each factory registers only those three definitions and uses
`validateFormats: true`. `logger: false` preserves the existing no-console
contract when `strict: false` tolerates another format name. No comparison
keyword or dynamic CommonJS code-generation bridge enters the browser bundle.

Invalid values use the existing normalized Ajv issue:

```ts
{
  code: 'format',
  keyword: 'format',
  path,
  parameters: { format: '<selected-format>' },
  fallbackMessage?: string
}
```

Unknown format names remain tolerated because Ajv stays `strict: false`; they
do not become assertions. Caching, synchronous behavior, immutable issue
mapping and non-mutation remain unchanged.

### 2.4 Native projection

The generic string renderer projects:

| Normalized format | Native input type | Reason                                                   |
| ----------------- | ----------------- | -------------------------------------------------------- |
| `email`           | `email`           | Preserves the exact string and exposes email affordances |
| `date`            | `date`            | Canonical full-date maps directly to the native value    |
| `date-time`       | `text`            | `datetime-local` cannot preserve an RFC 3339 timezone    |
| absent            | `text`            | Existing fallback                                        |

Standard follows the same table. Native validity is presentational only:
runtime issues continue to come from `SchemaValidator`. Renderers emit the
exact input string without trimming or normalization.

### 2.5 API and release boundary

The new type/member are Public + Experimental + Active under ADR-009. No entry
point, validator option, renderer registration, package publication, version,
peer range or stability tier changes. The private validator package gains only
the attributed ESM subset, exact development/conformance dependency and
behavior required here.

## 3. Consequences

Consumers obtain portable semantic fields and consistent official validation.
The distinction between annotation and assertion remains explicit and core
stays framework/vendor neutral. Date-time keeps a less specialized visual
control because preserving the domain string is more important than forcing an
incompatible browser widget.

## 4. Rejected alternatives

Presentation-only formats, browser-authoritative validation, configurable
factory options, `datetime-local`, custom in-house RFC parsers and registering
the complete ajv-formats catalog are rejected for the reasons recorded in
review 209.

## 5. Deferred boundary

All other formats, `format-assertion` vocabulary negotiation, comparison
keywords, localized parsers, custom formats, async validation, composition,
conditionals, expression-driven presentation, public validator publication and
framework bridges remain Deferred.
