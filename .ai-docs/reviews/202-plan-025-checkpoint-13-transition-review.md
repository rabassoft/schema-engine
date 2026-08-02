# PLAN-025 checkpoint 13 transition review

- **Date:** 2026-07-30
- **State:** Accepted after cycle 3 passed with zero findings
- **Scope:** Base Angular `latest` transition and intentional mixed window
- **Plan:** [`PLAN-025 revision 0`](../plans/025-stage-only-trusted-publication.md)
- **Requires:** Accepted
  [`review 201`](./201-plan-025-checkpoint-12-transition-review.md)
- **Outcome:** Checkpoint 13 complete; base/pilot resolve M23 through `latest`,
  while core remained on `latest: 0.4.0`

## Transition evidence

Ricard reports executing only:

```text
npm dist-tag add @rabassoft/schema-engine-angular@0.4.1 latest
```

Fresh authenticated observation as `ricardrabasso` returns:

- core `next: 0.4.1`, `latest: 0.4.0`;
- base Angular `next/latest: 0.4.1`; and
- Angular Aria pilot `next/latest: 0.2.1`.

A fresh base Angular `@latest` download is 127734 bytes and direct-`cmp`
byte-identical to the selected protected-main candidate. Its SHA-512 is
`016138d763fcee7e80eebb3a0c1f05e39d96efea94a07ada4a48f1c16e3550b27531ed8f70da3e3b51627f3a7fd89c98afcf6ec5ad0889d7ddde4e59024f961a`,
SHA-1 is `626ac56d30503ad6fefef010ffa3e3ac520c758d`, integrity is
`sha512-AWE412P87n6A7rs6DB8F452W7+qUoHraSkjxwW41ULJ1Me2PcNo+O1Fifzp/2JyYr89uxa0Iidfd3k5ZAk+WGg==`,
and repository metadata points to `packages/angular` in
`rabassoft/schema-engine`.

## Cycle 1 — finding and correction

| ID       | Finding                                                                                   | Correction                                    |
| -------- | ----------------------------------------------------------------------------------------- | --------------------------------------------- |
| R202-F01 | M23 release notes retained the 29 July date after recording the 30 July checkpoint state. | Advance the release-state date to 2026-07-30. |

## Cycle 2 — repeated review and finding

The technical matrix passed, but final current-state inspection found:

| ID       | Finding                                                                                          | Correction                                                                |
| -------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| R202-F02 | `STATUS.md` conditioned the core decision on checkpoint 13 passing after that checkpoint passed. | State the core-only authorization question directly in the present tense. |

## Cycle 3 — complete repeated review

Every applicable area passes with zero findings:

- authenticated aliases preserve only the intended base transition;
- fresh base `@latest` bytes match the selected candidate exactly;
- the core/base packed compatibility floor remains `^0.4.0`;
- the second mixed window is not presented as coordinated default evidence;
- formatting;
- 295 Markdown documents and 960 local documentation links;
- lint;
- 41 release-tooling tests;
- 23 public-repository policy tests;
- 776-file public-tree policy;
- workflow policy; and
- diff checks.

Checkpoint 13 is accepted. No core alias, token, trust, access, package, Git
tag, GitHub Release or repository mutation is authorized.
