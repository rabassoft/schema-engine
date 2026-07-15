# PLAN-013: First public experimental release

- **Status:** Approved
- **Date:** 2026-07-15
- **Approval date:** 2026-07-15
- **Revision:** 3 — mandatory npm latest alias and live-core recovery
- **Requires:** accepted
  [`ADR-018 revision 2`](../adrs/018-licencia-dual-publicacion-experimental.md),
  [`ADR-013 revision 1`](../adrs/013-preparacion-artefactos-experimentales-0-1.md),
  [`ADR-010 revision 1`](../adrs/010-versionado-semver-compatibilidad.md) and
  [`ADR-009 revision 1`](../adrs/009-politica-api-publica-estabilidad.md)
- **Promotion evidence:**
  [`review 027`](../reviews/027-d034-d040-publication-licensing-readiness.md)
- **Milestone:** M13 — First public experimental release
- **Capabilities:** D-034 and D-040 only
- **Implementation authorized:** Local preparation only; every Git or external
  checkpoint remains separately gated

## 1. Goal and hard boundary

Publish the existing independent `0.1.0` core and Angular candidates publicly
under `@rabassoft` with recommended dist-tag `next`, npm's mandatory `latest`
alias to the same Experimental version, dual `AGPL-3.0-only`/commercial
licensing and complete Corresponding Source, while the GitHub repository stays
private.

The plan has three authorization zones:

1. **Local preparation:** reversible repository changes and local/read-only
   verification.
2. **Private source checkpoint:** commit and push only after explicit request.
3. **External release checkpoints:** npm authentication/settings and each
   package publication require separate immediate approval.

Approving PLAN-013 authorizes only zone 1. It never authorizes commit, push,
login, 2FA changes, trusted-publisher configuration, registry writes, Git tags,
GitHub releases or repository visibility changes.

No runtime source behavior, Public export/signature, schema contract,
dependency range, Angular compatibility, package version or Stable status may
change.

## 2. Confirmed preflight state

- Ricard created npm organization `rabassoft`; authenticated human user
  `ricardrabasso` is its verified owner and controls the intended `@rabassoft`
  scope.
- Unauthenticated registry reads on 2026-07-15 return `E404` for
  `@rabassoft/schema-engine` and `@rabassoft/schema-engine-angular`; this is
  evidence that neither package currently exists, not a reservation guarantee.
- The current machine is authenticated to npm as `ricardrabasso`; the
  credential remains outside repository files.
- npm reports `ricardrabasso` as owner of organization `rabassoft`, with
  verified `ricard@rabassoft.com` email and `auth-and-writes` 2FA.
- Local Node is `22.23.1`, npm is `10.9.8` and pnpm is pinned to `10.28.2`.
- npm staged publishing and trusted-publisher CLI setup require an existing
  package, so neither can create these first versions. Initial publication must
  be direct and interactive under 2FA; later versions may use staged/OIDC flow.
- Ricard explicitly confirms `ricard@rabassoft.com` as the initial public
  commercial and security contact for package metadata, README and NOTICE.

## 3. Checkpoint 1 — License, notices and Corresponding Source

1. Add the unmodified official GNU AGPL v3 text as root `LICENSE` and identical
   package-local `LICENSE` files.
2. Add package-local `NOTICE.md` with:
   - `Copyright © 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft`;
   - exact `AGPL-3.0-only` public permission;
   - separate commercial-license inquiry wording using
     `ricard@rabassoft.com` without claiming that final paid terms already
     exist; and
   - no tax, address or private contract data.
3. Add the copyright plus SPDX notice to every owned file under
   `packages/core/src/**/*.ts` and `packages/angular/src/**/*.ts`; preserve and
   inventory any third-party notice before editing.
4. Include in each package tarball:
   - `src/**/*.ts` as preferred source;
   - a self-contained `source-build/` harness with its own private manifest,
     frozen lockfile and TypeScript configuration, without workspace-relative
     configuration or dependency specifiers;
   - `SOURCE.md` with the exact Node, package-manager and compiler versions,
     frozen-install/build commands and dependency expectations;
   - `LICENSE` and `NOTICE.md`; and
   - the existing built output and consumer README.
5. Do not publish tests, fixtures, `.ai-docs`, Git history, credentials or
   unrelated workspace material. Exclusion cannot remove any file needed to
   regenerate that package.
6. Expand only the still-private package `files` allowlists to `dist`, `src`,
   `source-build`, `README.md`, `SOURCE.md`, `LICENSE` and `NOTICE.md`. Do not
   remove `private: true` or add public license/publish metadata yet.
7. Extend artifact tooling to extract both tarballs into an isolated temporary
   project, install each `source-build/` harness with its frozen lockfile,
   rebuild core first and Angular against that exact rebuilt core, and compare
   root declarations/exports plus executable consumer behavior with the
   shipped `dist`. The rebuild must not read files outside the extracted
   tarballs after extraction.

Gate: exact license hashes, notices, source inventory and clean source rebuilds
pass for both tarballs. Both manifests still have `private: true` and remain
non-publishable when this checkpoint is reviewed independently.

## 4. Checkpoint 2 — Public candidate manifests and documentation

Change only the two publishable manifests:

- remove `private: true`;
- add `"license": "AGPL-3.0-only"`;
- add author/contact metadata for Ricardo Rabassó Rodríguez/Rabassoft;
- preserve the checkpoint 1 `files` allowlist exactly;
- add `publishConfig` with public access, `next` tag and provenance explicitly
  disabled while the repository remains private; and
- do not add a private/inaccessible `repository` URL.

The workspace root remains `private: true`. Core remains dependency-free;
Angular keeps only `tslib` runtime dependency, its core peer/dev relationship
and aligned Angular `>=22.0.6 <23.0.0` peers. Versions remain independent
`0.1.0`; exports and entry points remain exact.

Update package/root README and `.ai-docs/releases/0.1.0.md` to state:

- public Experimental availability via `@next` and explicit versions;
- AGPL rights and the separate commercial inquiry route;
- private-repository/source-in-tarball policy and no first-release provenance;
- root-only imports, compatibility matrix and breaking Experimental MINOR
  policy;
- mandatory `latest` as a registry alias only, with no Stable API, support SLA,
  public issue tracker or accepted external code contributions; and
- the exact release commit only after the private commit checkpoint exists.

Update artifact/package checks to reject `private`, missing license/source,
unexpected files, inaccessible repository metadata, provenance claims,
`workspace:` specifiers or changed exports/dependencies/peers.

Gate: candidates are locally publishable but no registry command has run;
packed metadata/content and documentation match ADR-018 exactly.

## 5. Checkpoint 3 — Complete local release gate

Run and record:

```text
CI=true pnpm install --frozen-lockfile
pnpm format:check
pnpm docs:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:package
pnpm test:consumer
pnpm test:artifacts
pnpm test:consumer:clean
git diff --check
```

Additionally:

1. rebuild both packages solely from tarball Corresponding Source;
2. inspect declarations/root exports and every tar member;
3. run a third-party copyright/license audit over distributed source;
4. scan tracked and packed files for credentials, tokens, `.npmrc`, personal
   address/tax data and private repository links;
5. run `npm publish --dry-run` only against the already-inspected tarballs;
6. repeat the complete PLAN-013 implementation review until one cycle has zero
   findings; and
7. record the exact Node/npm/pnpm versions used, tarball SHA-512 hashes and the
   intended source commit.

Checkpoint 3 ends with two immutable local candidate tarballs only. It does not
authenticate, commit, push, tag or publish.

## 6. Checkpoint 4 — Private commit and push stop

Stop and request explicit authorization to:

1. commit the fully verified local release preparation;
2. push that exact commit to the private `develop` branch; and
3. rebuild candidates from the clean committed tree, make the resulting hashes
   the sole publishable hashes and reject unexplained differences from the
   pre-commit candidates.

No Git tag or GitHub Release is created. If commit or push is not authorized,
M13 remains locally prepared and unpublished.

## 7. Checkpoint 5 — npm identity and core publication stop

Ricard performs interactive npm login/2FA outside repository files. The human
publishing identity and organization scope are distinct. Then run read-only
checks:

- `npm whoami` must equal `ricardrabasso`;
- npm organization membership must report `ricardrabasso` as owner of
  `rabassoft`;
- account 2FA must protect package publication/settings;
- both names must still be absent;
- registry must be `https://registry.npmjs.org/`; and
- the exact npm CLI version used for the dry run and live commands must be
  recorded and support all selected flags; and
- the inspected core tarball/hash must still match checkpoint 4.

Before the first registry write, capture the read-only account/scope security
state needed to verify 2FA and the post-creation package settings without
printing tokens or recovery material. If npm cannot prove the required state,
stop instead of weakening the gate.

Stop again for immediate approval of the exact core command equivalent to:

```text
npm publish <verified-core-tarball> --access public --tag next --provenance=false
```

After success, verify from unauthenticated registry/install reads that:

- only `@rabassoft/schema-engine@0.1.0` exists;
- `next` and mandatory `latest` both point to inspected Experimental `0.1.0`,
  and documentation denies that either alias promotes stability;
- visibility, manifest, license, files and hashes are exact; and
- a clean external consumer installs by exact version and `@next` and passes.

Core publication is irreversible for planning purposes. Do not unpublish it to
hide a mistake. Deprecate or release a corrected new version according to the
recorded recovery policy.

## 8. Checkpoint 6 — Angular publication stop

Before Angular publication, install the still-local Angular tarball against the
live core `0.1.0` in clean lower/upper Angular 22 consumers and repeat its
package/source/license checks.

Stop for separate immediate approval of the exact Angular command equivalent
to:

```text
npm publish <verified-angular-tarball> --access public --tag next --provenance=false
```

After success, verify unauthenticated registry metadata, `next` and mandatory
`latest` both resolving to inspected Experimental `0.1.0`, packed contents,
peer ranges and clean consumers using both live packages.

If core succeeds but Angular cannot be published, retain and document the
partial core release; do not overwrite or unpublish it. Correct Angular before
its first accepted publication, or use `0.1.1` if a defective `0.1.0` was
already accepted by the registry.

## 9. Checkpoint 7 — Post-publication security and closure

After both packages exist, prepare an exact private GitHub workflow for future
OIDC trusted publishing with no long-lived write token. Configure each npm
package's trusted publisher only after a separate external approval. While the
repository is private:

- provenance remains disabled and is not advertised;
- future automation may stage but not approve a release;
- human 2FA approval remains required for staged publication; and
- traditional token publication is disabled when npm permits it.

Repeat live installs, signature checks available without false provenance
claims, documentation consistency and the complete release review. Only then
mark M13 complete and update STATUS/WORKLOG/ROADMAP/release notes to the exact
live state.

Repository sanitization/publication and provenance activation are a separate
future milestone.

## 10. Expected repository diff

Allowed changes:

- root/package `LICENSE`, package `NOTICE.md`, `SOURCE.md` and
  package-local `source-build/` harnesses;
- owned production-source license headers only;
- the two package manifests and lockfile only as required by accepted metadata;
- package/root README and release notes;
- artifact/source-consumer/security verification scripts and root script
  entries;
- one manual-only future trusted-publishing workflow; and
- ADR/plan/review/state/index/roadmap/deferred documentation.

Forbidden changes:

- runtime logic, schemas, diagnostics, tests/fixtures except release tooling
  assertions, Public exports/signatures, entry points, versions, dependency
  ranges or Angular behavior;
- root publication, any claim that mandatory `latest` means Stable, provenance
  from the private repo, public GitHub visibility, tags/releases, committed
  credentials or automatic live publish;
  and
- commercial contract text presented as professionally approved when it is not.

## 11. Stop conditions

Stop on any:

- accepted-ADR conflict or need to change license/version/API/package boundary;
- third-party rights uncertainty or incomplete Corresponding Source;
- unexpected registry ownership/name collision;
- authentication, 2FA, secret, hash, tarball or clean-consumer mismatch;
- request to expose the private repository/history;
- desire to point `latest` somewhere other than the inspected Experimental
  release, claim it means Stable, claim provenance, accept contributions or
  advertise executable commercial terms outside ADR-018; or
- commit, push, tag, GitHub Release, npm setting or publish command lacking its
  immediate explicit approval.

## 12. Completion criteria

PLAN-013 completes only when both exact `0.1.0` packages are live publicly
under `next`, their AGPL/source/license/manifest contents and live consumers are
verified, post-publication security is configured under explicit approvals and
the final repeated review has zero findings. A local candidate, core-only
partial release or failed external checkpoint is not M13 completion.

## 13. Primary references

- [npm scoped public packages](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/)
- [npm publish](https://docs.npmjs.com/cli/commands/npm-publish/)
- [npm dist-tags](https://docs.npmjs.com/cli/commands/npm-dist-tag/)
- [npm staged publishing](https://docs.npmjs.com/staged-publishing/)
- [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/)
- [npm provenance](https://docs.npmjs.com/generating-provenance-statements/)
- [GNU AGPL v3](https://www.gnu.org/licenses/agpl-3.0.html)
