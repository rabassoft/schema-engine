# PLAN-019 checkpoint 2 review — Cycles 1–3

- **Date:** 2026-07-17
- **Outcome:** Cycle 3 passed with zero findings

## Corrections

Cycle 1 found that static Ajv loading raised the Angular initial bundle to
1.07 MB and failed its 1 MB budget. The shell was corrected to dynamically load
the package before bootstrap and inject the ready synchronous validator.

Cycle 2 found Angular/Vite's virtual development root could not resolve pnpm's
package-nested `ajv/dist/2020.js`, and Chromium exposed stale scenario-validator
wording. Exact Ajv root development ownership restored dev resolution; browser
evidence now applies `maxLength: 2` and observes the normalized `maxLength`
issue. Production returned to 943.75 kB with separate 129.35 kB Ajv and 143.14
kB code-viewer chunks.

## Zero-finding pass

Cycle 3 repeated dependency ownership, pre-bootstrap lifecycle, runtime/direct
validator identity, edited-schema behavior, reset/restore, unit/build/browser,
budget, Public isolation and diff. Angular reference 24/24 tests and Chromium
8/8 pass. The remaining Ajv CommonJS optimization and existing 750 kB budget
warnings are documented observations; the 1 MB error budget passes.
