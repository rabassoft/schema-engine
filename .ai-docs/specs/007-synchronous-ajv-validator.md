# SPEC-007: Reusable Synchronous Ajv Validator

- **State:** Accepted
- **Version:** 0.1.0
- **Date:** 17 July 2026
- **Acceptance date:** 17 July 2026
- **Milestone:** M17 — Reusable synchronous JSON Schema validator
- **Promoted capability:** D-047 under
  [`review 082`](../reviews/082-d047-m17-ajv-validator-promotion-readiness.md)
- **Accepted architecture:**
  [`ADR-022 revision 1`](../adrs/022-validador-ajv-sincrono-reutilizable.md)
- **Accepted baselines:** SPEC-001 v0.1.15 through SPEC-006 v0.1.1
- **Complete review:** [`review 084`](../reviews/084-spec-007-review.md) cycle 1
  passed all twelve areas with zero findings
- **Authority:** Accepted observable M17 contract; authorizes PLAN-019
  preparation/review only, not implementation, publication, commit or push

## 1. Public surface

`@rabassoft/schema-engine-validator-ajv` exposes only:

```ts
import type { SchemaValidator } from '@rabassoft/schema-engine';

export declare function createAjvSchemaValidator(): SchemaValidator;
```

No options, class, Ajv instance, error type, secondary entry point or testing
export is Public. Repeated factory calls return independent validator/cache
instances.

## 2. Validation contract

`validate(schema, value)` is synchronous and returns the accepted
`ValidationResult`. It shall:

1. compile a schema object only on the first call for that object identity;
2. validate the exact supplied value without coercion, default insertion,
   property removal or other mutation;
3. collect every Ajv-reported error in deterministic Ajv order;
4. return a deeply frozen result detached from mutable Ajv error storage; and
5. reuse the compiled function for later calls with the same schema identity.

For `{ valid: true }`, `issues` is the shared or per-result frozen empty array.
For `{ valid: false }`, `issues.length > 0`. Schema compilation failure or an
async validation result throws; the package does not convert schema defects
into data issues.

The supported Schema Engine flow requires successful
`compileFormDefinition({ schema, uiSchema })` before constructing/updating a
runtime with this validator. Behavior for compiler-rejected schemas is outside
the integration contract even if Ajv alone could compile them.

## 3. Exact Ajv mode

The implementation owns Ajv 8.20.0 and the Draft 2020-12 class. Observable
configuration is:

```ts
{
  allErrors: true,
  strict: false,
  validateFormats: false,
  addUsedSchema: false
}
```

No formats, keywords, plugins, schemas, remote loaders or logger are registered.
The package shall not emit strict-mode warnings. Defaults for `coerceTypes`,
`useDefaults` and `removeAdditional` remain disabled.

## 4. Error-to-issue mapping

For each Ajv error `error`:

```ts
issue.code = error.keyword;
issue.keyword = error.keyword;
issue.parameters = deepFrozenCopy(error.params);
issue.fallbackMessage = error.message; // omitted when absent
```

`instancePath` is decoded as RFC 6901. `~1` becomes `/` and `~0` becomes `~`;
any malformed escape is treated literally according to the decoder's ordered
replacement. While traversing `value`, a canonical decimal segment becomes a
number only when its parent is an array. Every other segment is a string.

The following keyword refinements target the most specific safe property:

| Keyword                 | Additional final segment            |
| ----------------------- | ----------------------------------- |
| `required`              | string `params.missingProperty`     |
| `additionalProperties`  | string `params.additionalProperty`  |
| `unevaluatedProperties` | string `params.unevaluatedProperty` |

The segment is appended only when the parameter is a string. Other errors keep
the decoded instance path. Numeric object keys and the appended property names
remain strings. Root errors retain `[]`.

`parameters` recursively copies arrays and ordinary records, freezes every
copied container and preserves JSON primitives. Ajv-owned values never escape.

## 5. Cache and lifecycle

Schema objects/functions use a private `WeakMap`. Boolean schemas, if directly
used outside the supported compiler flow, may use two fixed compiled slots.
Primitive schemas other than booleans are passed to Ajv and may throw. The
package exposes no cache controls, counters or disposal contract. Discarding a
validator releases its Ajv instance and all cache reachability; discarding a
schema object permits its weak entry to be collected.

## 6. Reference integrations

Each Angular and Standard composition root creates one validator. Every runtime
creation, scenario replacement and applied edited schema uses that validator.
Direct validation evidence shown in a shell must call the same validator and
active schema/value as its runtime.

The schema editor order remains parse, Public compile, then runtime replacement.
An edit that adds a compiler-supported constraint such as `maxLength`,
`pattern`, `maximum` or `multipleOf` must affect validation after Apply. Cancel
and restore retain their existing configuration semantics.

Catalog validators and transition fixtures remain unchanged and separately
tested. They are not presented as general JSON Schema validation after M17.

## 7. Required conformance

Tests must cover:

- Draft 2020-12 declared and absent-dialect schemas after compiler success;
- valid/invalid primitives, nested objects, arrays and local `$ref` scenarios;
- all-errors ordering and `required` child-path refinement;
- escaped pointer tokens, numeric object keys and numeric array indices;
- detached deep-frozen results/parameters and unchanged schema/value;
- same-identity reuse and distinct-identity recompilation;
- formats ignored, unknown extension tolerated and no console warning;
- schema compilation/async failure throwing;
- root-only package import, declaration build and package smoke;
- Angular and Standard edited-schema regression; and
- unchanged core, Angular package, catalog and release boundaries.

## 8. Non-goals

This SPEC does not define async/partial validation, localization, custom
messages, formats, remote references, custom vocabularies, configurable Ajv,
standalone generation, browser workers, framework validators, core compiler
expansion, publication/versioning or Stable API.
