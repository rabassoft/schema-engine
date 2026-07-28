# PLAN-025 checkpoint 8 staged-byte review — Cycle 1

- **Date:** 2026-07-27
- **State:** Blocked by R189-F01; no stage is approved or rejected
- **Scope:** Exact workflow result, staged metadata, downloaded tarballs and
  selected-candidate comparison
- **Plan:** [`PLAN-025 revision 0`](../plans/025-stage-only-trusted-publication.md)
- **Outcome:** Three stages exist, but checkpoint 8 cannot complete under the
  approved byte-identity contract

## Workflow result

Run `30304490264` completed successfully on exact protected
`main@4bcb6eabed76d8bc2fa877236d10b7831cbb6f00`:

- `verify-release` job `90105269180`: 4m44s, success;
- separately approved environment `npm-publish@18549660922`;
- `stage` job `90106410134`: 2m4s, success; and
- GitHub Actions reports automatic provenance statements for all three stages.

No npm stage approval, rejection, live version, alias or token mutation
occurred.

## Exact staged state

| Role         | Stage ID                               | Version | Tag    | Access | Actor                               |
| ------------ | -------------------------------------- | ------- | ------ | ------ | ----------------------------------- |
| Core         | `a748719f-7fe6-4c79-ac23-61e3ee8ffb25` | `0.4.1` | `next` | Public | GitHub Actions / trusted automation |
| Base Angular | `bd1e0399-d41a-405c-8b24-dcc9a63eb761` | `0.4.1` | `next` | Public | GitHub Actions / trusted automation |
| Angular Aria | `de129160-ae80-4a15-8f43-dbc64a6f25fb` | `0.2.1` | `next` | Public | GitHub Actions / trusted automation |

Authenticated `npm stage view` and `npm stage download` succeed for every
stage. The workflow log proves that its prepared tarballs already had the same
SHA-1 values later reported and downloaded by npm, so the registry did not
introduce the mismatch.

## R189-F01 — cross-platform gzip bytes differ

All three downloaded tarballs fail the approved selected-byte comparison:

| Role         | Selected bytes | Staged bytes | Selected SHA-512                                                                                                                   | Staged SHA-512                                                                                                                     |
| ------------ | -------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Core         | 218297         | 217363       | `182aeb23087bb9b6d02c097aecda7acb239ed4d86b8b3c7854eb58f3232d510a0113b01f0790fc03ed4b8042d95ba59feb0d0b160702e088cf23d243f15e59bb` | `aede3c4b174eaa0ea2474d71454b27e6d4ae2bcfc2005b34dc8305f29cf934a9110a51685573e87da65cdf6cd05c0843678ecc90f135a4d57106b4722cd7afbb` |
| Base Angular | 126705         | 126267       | `51d95d98075b7ff63be1cafa5b39a42f9a93ce9a41a5147cd086330ceada6bf851b8d23725e87ec8077e4647b0c8874b70966dc3974d73ef9c7909aecc0b8bea` | `f3e40bb9daa4e68c772922decc7a0e22aae741ab9a0d5e0e7c730bc3c9db073b76995150e4d950627313d1964401ad46c66a7d024265ec956815221ad8042c8e` |
| Angular Aria | 28919          | 28761        | `dae08ca2d1c2716ed397ceabb8ba9c8af637e54710a4a47cf3f74d2461f69d3fb928aa6aa3c29effd2846f0832b6a1e34cd77dfe0783996d3177a1f80f82d937` | `7d2aaf89c494f23ae4e4a33e592c00c0965b10b28fef9e691b6990cfaae21648fca631f358e9bfb1c12d279fe1b1dd207d17ba464a40c6c0a629e3c9e276b75e` |

The mismatch is isolated to gzip compression:

- extracted trees are recursively byte-identical for all three packages;
- each selected/staged pair has the same uncompressed TAR length;
- each pair has the same uncompressed TAR SHA-512;
- selected gzip headers record OS byte `0x13`, while the Linux workflow records
  `0x03`; and
- compressed DEFLATE bytes also differ, consistent with platform zlib output.

| Role         | Uncompressed TAR bytes | Shared uncompressed TAR SHA-512                                                                                                    |
| ------------ | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Core         | 1441280                | `4bfe58b08ed38ef4993508540deb049e665dd40f0959992d370df33bec6db60d967d2068ef2fe8403eacd6d552aa7bb672ac922183c5705736e7a6398719e85a` |
| Base Angular | 793088                 | `1f0c5bcefdc0d23aed0c60b68032e25961062c4bec228f2f698eb52a33e20b4808cefa00d66a6966aeb0a2827a43aea9e302b247f625d4c93c65987ec225e7a6` |
| Angular Aria | 112128                 | `e7384800866258d140e5115376f8a8f8892102c60322915e558427eb13c8c5d8280f95222509a5ca3391475c9ba632e3529f91e212020ca39f6bdcd4f4fd8946` |

## Recovery alternatives

1. **Recommended — preserve the byte contract.** Keep all stages unapproved,
   separately authorize their rejection, make candidate gzip generation
   platform-independent, add macOS/Linux regression evidence, deliver the
   correction through protected branches, rebuild and select new exact
   candidates, then repeat staging.
2. **Weaken identity to canonical TAR/content.** Accept uncompressed TAR plus
   extracted-content identity instead of exact `.tgz` bytes. This changes the
   approved release contract and would require a reviewed PLAN/ADR correction
   before any stage approval.
3. **Retroactively select Linux bytes.** Treat the already staged Linux output
   as selected evidence. This reverses the approved selection-before-staging
   order and is not recommended without a reviewed contract change.

R189-F01 is a real stop condition under PLAN-025 sections 8, 11, 20 and 22.
No stage may proceed to checkpoint 9 until one recovery is explicitly selected,
reviewed and completed.

Final formatting, 282-document/921-link documentation, 762-file public-tree
policy and diff checks pass with the blocked state recorded.
