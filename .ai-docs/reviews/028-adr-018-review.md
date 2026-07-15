# Review 028: ADR-018 complete review

- **Date:** 15 July 2026
- **Scope:** ADR-018 revision 0–1
- **Authority:** accepted ADR-009/010/013, completed PLAN-008 and accepted
  review 027
- **Cycle 1:** Two corrections required
- **Cycle 2:** Complete repeated review passed with zero findings
- **Cycle 3:** Four closing-state documentation corrections required
- **Cycle 4:** Complete repeated closing review passed with zero findings
- **Result:** Passed; ADR-018 revision 1 accepted under standing authorization

## Cycle 1 findings and corrections

1. **Source-file notices:** revision 0 required package-level AGPL material but
   did not explicitly preserve third-party notices or identify owned source
   files. Revision 1 requires copyright/license or SPDX notices on distributed
   owned source and preserves every third-party notice.
2. **Private-repository provenance:** revision 0 left provenance conditional
   without deciding the first-release behavior. Current npm provenance requires
   a matching public repository, and trusted-publisher setup requires an
   existing package. Revision 1 therefore requires interactive 2FA for initial
   package creation, trusted publishing afterward, truthful absence of first-
   release provenance and mandatory provenance after repository sanitization.

## Cycle 2 complete review

1. **Authority and promotion:** passes. Only D-034/D-040/M13 normative design
   is active; runtime and every functional deferred capability remain unchanged.
2. **License semantics:** passes. `AGPL-3.0-only` remains genuine Open Source,
   commercial use under AGPL is free and paid terms are a separate alternative.
3. **Identity and notices:** passes after correction. Ricardo Rabassó Rodríguez,
   operating as Rabassoft, is identified without exposing tax/address data;
   owned and third-party source notices are exact.
4. **Corresponding Source:** passes. A private repository is never treated as
   public source; buildable preferred TypeScript source is mandatory in public
   release artifacts or an equivalent immutable public archive.
5. **Packages and compatibility:** passes. Only the two package candidates
   become public `0.1.0` under `next`; root privacy, independent SemVer,
   Experimental APIs, exports, peers and Angular range remain unchanged.
6. **Ownership and commercial boundary:** passes. External code is not accepted
   before sufficient relicensing rights, and paid terms require professional
   legal review before sale.
7. **Security, provenance and rollback:** passes after correction. Initial 2FA,
   later OIDC trusted publishing, private-repository provenance limits, no
   secrets, immutable versions and explicit external checkpoints are coherent.
8. **Delivery and stop conditions:** passes. ADR acceptance authorizes only
   PLAN-013 preparation; manifests, licenses, credentials, tags, visibility and
   registry state remain unchanged until plan approval and external checkpoints.

No unresolved error, ambiguity, conflict or requested change remains.

## Cycle 3 findings and corrections

1. STATUS retained duplicate ADR-017/ADR-018 `Last accepted ADR` rows. Removed
   the superseded current-state row.
2. STATUS still labelled review 027 as Active and ADR-018 as Proposed in its
   task map. Corrected both to completed/accepted.
3. STATUS's latest documentation verification still reported the previous M12
   file/link count. Reconciled it to the current verified M13 checkpoint.
4. The new WORKLOG entry recorded an anticipated rather than observed link
   count. Replaced it with the exact `docs:check` result.

## Cycle 4 repeated closing review

Repeated authority, ADR/review/index/roadmap/deferred/status/worklog/onboarding
consistency, documentation links, formatting and diff checks after all cycle 3
corrections. No finding or unresolved change request remains.

## Primary references

- [GNU Affero General Public License v3](https://www.gnu.org/licenses/agpl-3.0.html)
- [How to use GNU licenses](https://www.gnu.org/licenses/gpl-howto.html.en)
- [OSI AGPL-3.0 entry](https://opensource.org/license/agpl-3.0)
- [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/)
- [npm provenance requirements](https://docs.npmjs.com/generating-provenance-statements/)
