# PLAN-026 checkpoint 2 validator review — Cycles 1–3

- **Date:** 2026-07-30
- **Scope:** exact dependency ownership and selected-format assertion
- **Outcome:** Cycle 3 passed with zero findings

## Cycle 1 finding and correction

| ID       | Finding                                                                                                                                             | Correction                                                                                                               |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| R214-F01 | Enabling format assertion made Ajv log twice for an unregistered format even under `strict: false`, contradicting the existing no-console contract. | Set fixed `logger: false`, record it in ADR-027/SPEC-010 and retain compiler warning plus non-assertion for other names. |

## Cycle 2 finding and correction

| ID       | Finding                                                                                                                                                                   | Correction                                                                                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R214-F02 | Importing the `ajv-formats` plugin in runtime made the Angular production builder deadlock while bundling its CommonJS/dynamic-code path, despite validator unit success. | Keep exact `ajv-formats@3.0.1` only as a development/conformance oracle; adapt and attribute its three full validators into a browser-safe ESM subset and parity-test every case. |

## Cycle 3 — complete zero-finding pass

Cycle 3 repeated manifest/lock ownership, exact versions, adapted-source
attribution/parity, selected valid/invalid values, unknown-name tolerance,
no-console/non-mutation, immutable issue mapping, cache, declarations,
validator build/package smoke and Angular/Standard production bundles with zero
findings. The Angular sandbox-only esbuild IPC deadlock does not reproduce
outside the restricted sandbox.

## Result

PLAN-026 checkpoint 2 is complete. No network, version, publication, commit or
push occurred.
