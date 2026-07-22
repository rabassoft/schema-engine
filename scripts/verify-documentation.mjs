import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import {
  M19_RELEASE_DESCRIPTOR,
  M21_RELEASE_DESCRIPTOR,
} from './release-target.mjs';

const root = process.cwd();
const stableGuidePaths = ['AGENTS.md', 'HANDOFF.md'];
const onboardingPaths = ['README.md', '.ai-docs/README.md'];
const publicPolicyPaths = [
  'SECURITY.md',
  'CONTRIBUTING.md',
  'CODE_OF_CONDUCT.md',
];
const statusPath = '.ai-docs/project/STATUS.md';
const specificationDirectory = '.ai-docs/specs';
const specificationIndexPath = '.ai-docs/specs/000-index.md';
const publishableManifestPaths = M21_RELEASE_DESCRIPTOR.packages.map(
  ({ workspacePath }) => `${workspacePath}/package.json`,
);
const m21ReleaseNotePath = '.ai-docs/releases/0.4.0.md';
const staleCurrentClaims = [
  {
    path: '.ai-docs/releases/0.1.0.md',
    pattern: /completed M1[–-]M9 and G0 plus PLAN-010 checkpoints\s+1[–-]6/i,
    description: 'pre-completion M10 release scope',
  },
  {
    path: '.ai-docs/releases/0.1.0.md',
    pattern: /Final M10 review remains checkpoint 7/i,
    description: 'pending PLAN-010 checkpoint 7',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern:
      /PLAN-010 revisión 0 fue aprobado y sus checkpoints 1[–-]6 implementaron/i,
    description: 'partial PLAN-010 completion',
  },
  {
    path: '.ai-docs/adrs/016-resolucion-referencias-locales.md',
    pattern:
      /\*\*Authorized follow-up:\*\* Draft and review ADR-005 revision 3/i,
    description: 'completed ADR-016 follow-up as pending',
  },
  {
    path: '.ai-docs/adrs/016-resolucion-referencias-locales.md',
    pattern: /\*\*SPEC, plan and implementation authorized:\*\* No/i,
    description: 'pre-SPEC-004 authorization gate',
  },
  {
    path: '.ai-docs/releases/0.1.0.md',
    pattern: /accepted but unimplemented SPEC-004/i,
    description: 'pre-completion M11 release scope',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern: /Checkpoint 3 aún no empezó/i,
    description: 'pre-integration PLAN-011 state',
  },
  {
    path: '.ai-docs/specs/004-local-reference-resolution.md',
    pattern: /behavior remains inactive/i,
    description: 'pre-completion SPEC-004 implementation state',
  },
  {
    path: '.ai-docs/adrs/000-index.md',
    pattern: /sin implementación autorizada/i,
    description: 'pre-completion D-041 ADR index state',
  },
  {
    path: 'packages/core/README.md',
    pattern: /mandatory `latest`/i,
    description: 'universal initial latest claim',
  },
  {
    path: 'packages/angular/README.md',
    pattern: /mandatory `latest`/i,
    description: 'universal initial latest claim',
  },
  {
    path: 'packages/angular/README.md',
    pattern: /pending checkpoint gate/i,
    description: 'pre-completion M18 compatibility state',
  },
  {
    path: 'packages/angular-aria/README.md',
    pattern: /PLAN-020 gates/i,
    description: 'obsolete pilot publication gate',
  },
  {
    path: 'packages/angular-aria/SOURCE.md',
    pattern: /The private pilot includes/i,
    description: 'pre-M19 private pilot source state',
  },
  {
    path: '.ai-docs/releases/0.3.0.md',
    pattern: /State:\*\* Published/i,
    description: 'unobserved M19 publication claim',
  },
  {
    path: '.ai-docs/releases/0.3.0.md',
    pattern: /\*\*Source commit:\*\* [0-9a-f]{40}/i,
    description: 'pre-checkpoint-3 selected candidate claim',
  },
  {
    path: '.ai-docs/releases/0.3.0.md',
    pattern: /checkpoint 3 local\s+candidate selection remains pending/i,
    description: 'pre-completion checkpoint 3 state',
  },
  {
    path: '.ai-docs/releases/0.3.0.md',
    pattern: /No selected tarball hashes or source commit exist yet/i,
    description: 'pre-candidate checkpoint 3 state',
  },
  {
    path: '.ai-docs/releases/0.3.0.md',
    pattern: /later checkpoint 3 may represent M19/i,
    description: 'future checkpoint 3 state',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern: /No hay implementación ni acción externa autorizada/i,
    description: 'pre-completion M19 implementation state',
  },
  {
    path: '.ai-docs/releases/0.3.0.md',
    pattern: /Reviewed dirty-tree pre-commit candidates/i,
    description: 'pre-selection checkpoint 4 state',
  },
  {
    path: '.ai-docs/releases/0.3.0.md',
    pattern: /sourceCommit: null/i,
    description: 'pre-clean-rebuild candidate evidence state',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern: /PLAN-021 checkpoint 4 authorization/i,
    description: 'pre-completion checkpoint 4 next action',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern: /restores the npm session/i,
    description: 'resolved checkpoint 5 authentication state',
  },
  {
    path: '.ai-docs/README.md',
    pattern: /paused\s+at `npm whoami` `E401`/i,
    description: 'resolved checkpoint 5 authentication state',
  },
  {
    path: '.ai-docs/releases/0.3.0.md',
    pattern: /Selected clean committed candidates; not published/i,
    description: 'pre-publication checkpoint 5 state',
  },
  {
    path: '.ai-docs/releases/0.3.0.md',
    pattern:
      /checkpoints 1–4 complete; checkpoint 5 core\s+pre-publication review passed and its exact publish command awaits immediate\s+authorization/i,
    description: 'pre-publication checkpoint 5 plan state',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern: /checkpoint 5's exact\s+core `0\.3\.0` publication/i,
    description: 'pre-completion checkpoint 5 next action',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern: /core publication and every later npm mutation/i,
    description: 'pre-completion checkpoint 5 external gate',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern: /checkpoint 6 authorization/i,
    description: 'pre-preflight checkpoint 6 next action',
  },
  {
    path: '.ai-docs/releases/0.3.0.md',
    pattern:
      /checkpoint 6 base Angular\s+preflight requires separate authorization/i,
    description: 'pre-preflight checkpoint 6 plan state',
  },
  {
    path: '.ai-docs/releases/0.3.0.md',
    pattern: /base Angular `0\.3\.0` publish command/i,
    description: 'pre-publication checkpoint 6 release state',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern: /base\/pilot publication/i,
    description: 'pre-completion checkpoint 6 external gate',
  },
  {
    path: '.ai-docs/releases/0.3.0.md',
    pattern: /checkpoint 7 pilot\s+preflight requires separate authorization/i,
    description: 'pre-preflight checkpoint 7 release state',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern: /checkpoint 7 authorization/i,
    description: 'pre-preflight checkpoint 7 next action',
  },
  {
    path: '.ai-docs/releases/0.3.0.md',
    pattern: /pilot remains a selected unpublished candidate/i,
    description: 'pre-publication checkpoint 7 release state',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern: /only the exact PLAN-021[\s\S]{0,120}pilot[^\n]*publish command/i,
    description: 'pre-completion checkpoint 7 next action',
  },
  {
    path: '.ai-docs/releases/0.3.0.md',
    pattern: /checkpoint 8[^\n]*remains separately gated/i,
    description: 'pre-completion checkpoint 8 release state',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern: /checkpoint 8's[\s\S]{0,80}observation and retention branch/i,
    description: 'pre-completion checkpoint 8 next action',
  },
  {
    path: '.ai-docs/releases/0.3.0.md',
    pattern:
      /checkpoint 9 base Angular[\s\S]{0,80}preflight remains separately gated/i,
    description: 'pre-preflight checkpoint 9 release state',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern: /checkpoint 9's[\s\S]{0,80}read-only base Angular/i,
    description: 'pre-preflight checkpoint 9 next action',
  },
  {
    path: 'README.md',
    pattern: /Private M19 source candidates/i,
    description: 'pre-publication root onboarding state',
  },
  {
    path: 'packages/core/README.md',
    pattern:
      /Private Experimental candidate|no registry publication is implied/i,
    description: 'pre-publication core onboarding state',
  },
  {
    path: 'packages/angular/README.md',
    pattern:
      /Private Experimental candidate|no registry publication is implied/i,
    description: 'pre-publication Angular onboarding state',
  },
  {
    path: 'packages/angular-aria/README.md',
    pattern: /Private source candidate|PLAN-021 governs later publication/i,
    description: 'pre-publication pilot onboarding state',
  },
  {
    path: '.ai-docs/releases/0.3.0.md',
    pattern:
      /truthful partial state|checkpoint 11[\s\S]{0,80}remains separately gated/i,
    description: 'pre-completion M19 release state',
  },
  {
    path: '.ai-docs/releases/0.3.0.md',
    pattern: /Core\/base `latest` remain `0\.2\.0`/i,
    description: 'stale core/base default aliases after M19 completion',
  },
  {
    path: '.ai-docs/releases/0.3.0.md',
    pattern: /unsupported by this candidate|This candidate does not add/i,
    description: 'pre-completion candidate terminology in live release notes',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern:
      /checkpoint 11 todavía debe cerrar|authorization of PLAN-021 checkpoint 11/i,
    description: 'pre-completion M19 roadmap state',
  },
  {
    path: '.ai-docs/README.md',
    pattern: /Checkpoint 11 final closure remains gated/i,
    description: 'pre-completion documentation index state',
  },
  {
    path: '.ai-docs/releases/0.3.0.md',
    pattern:
      /checkpoint 9[\s\S]{0,100}dist-tag command[\s\S]{0,40}awaits immediate authorization/i,
    description: 'pre-completion checkpoint 9 release state',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern: /checkpoint 9's[\s\S]{0,80}exact base Angular `latest`/i,
    description: 'pre-completion checkpoint 9 next action',
  },
  {
    path: '.ai-docs/releases/0.3.0.md',
    pattern:
      /checkpoint 10 core default[\s\S]{0,80}preflight remains separately gated/i,
    description: 'pre-preflight checkpoint 10 release state',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern: /checkpoint 10's[\s\S]{0,80}read-only core/i,
    description: 'pre-preflight checkpoint 10 next action',
  },
  {
    path: '.ai-docs/releases/0.3.0.md',
    pattern:
      /checkpoint 10[\s\S]{0,100}core dist-tag command[\s\S]{0,50}manual execution/i,
    description: 'pre-completion checkpoint 10 release state',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern: /checkpoint 10's exact[\s\S]{0,80}core `latest`/i,
    description: 'pre-completion checkpoint 10 next action',
  },
  {
    path: 'packages/core/README.md',
    pattern: /Package manifest: `0\.3\.0`/i,
    description: 'M19 version presented as current core source manifest',
  },
  {
    path: 'packages/angular/README.md',
    pattern: /Package manifest: `0\.3\.0`/i,
    description: 'M19 version presented as current Angular source manifest',
  },
  {
    path: 'packages/angular-aria/README.md',
    pattern: /Package manifest: `0\.1\.0`/i,
    description: 'M19 version presented as current pilot source manifest',
  },
  {
    path: 'packages/core/README.md',
    pattern: /The candidate has no npm provenance/i,
    description: 'selected-candidate wording before M21 candidate selection',
  },
  {
    path: 'packages/angular/README.md',
    pattern: /The candidate has no npm provenance/i,
    description: 'selected-candidate wording before M21 candidate selection',
  },
  {
    path: m21ReleaseNotePath,
    pattern: /Current state:\*\* (?:Published|Completed coordinated live)/i,
    description: 'unobserved completed M21 publication state',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern: /No se ha cambiado ningún manifest, versión, peer/i,
    description: 'pre-checkpoint-1 M21 source state',
  },
  {
    path: m21ReleaseNotePath,
    pattern: /do not\s+claim that `\.release\/0\.4\.0` exists/i,
    description: 'pre-checkpoint-3 M21 candidate state',
  },
  {
    path: '.ai-docs/plans/023-coordinated-experimental-0-4-release.md',
    pattern: /checkpoint 3 is next/i,
    description: 'pre-completion M21 checkpoint 3 plan state',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern: /execute and completely review PLAN-023 checkpoint 3/i,
    description: 'pre-completion M21 checkpoint 3 next action',
  },
  {
    path: '.ai-docs/roadmap/deferred-decisions.md',
    pattern:
      /M21 release delivery:[\s\S]{0,400}checkpoint 3 es la siguiente acción/i,
    description: 'pre-completion M21 checkpoint 3 deferred state',
  },
  {
    path: 'README.md',
    pattern: /Those versions are not selected candidates/i,
    description: 'pre-selection M21 root onboarding state',
  },
  {
    path: 'packages/core/README.md',
    pattern: /not a\s+selected candidate or observed npm release/i,
    description: 'pre-selection M21 core onboarding state',
  },
  {
    path: 'packages/angular/README.md',
    pattern: /not a\s+selected candidate or observed npm release/i,
    description: 'pre-selection M21 Angular onboarding state',
  },
  {
    path: 'packages/angular-aria/README.md',
    pattern: /not a\s+selected candidate or observed npm release/i,
    description: 'pre-selection M21 pilot onboarding state',
  },
  {
    path: '.ai-docs/releases/0.4.0.md',
    pattern: /sourceCommit: null|Reviewed dirty-tree candidate evidence/i,
    description: 'pre-selection M21 release evidence',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern: /PLAN-023 checkpoint 4 authorization/i,
    description: 'pre-completion M21 checkpoint 4 next action',
  },
  {
    path: '.ai-docs/project/STATUS.md',
    pattern: /await separate\s+authorization for PLAN-023 checkpoint 4/i,
    description: 'pre-completion M21 checkpoint 4 status',
  },
  {
    path: '.ai-docs/project/STATUS.md',
    pattern:
      /Restore the npm session interactively|preflight is paused fail-closed|npm session is invalid/i,
    description: 'paused checkpoint 5 authentication status after recovery',
  },
  {
    path: '.ai-docs/releases/0.4.0.md',
    pattern: /preflight authorized and paused at npm authentication/i,
    description: 'paused checkpoint 5 release state after recovery',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern:
      /Next action:[\s\S]{0,240}(?:restaura[^\n]*sesión npm|reinicia[^\n]*preflight)/i,
    description: 'paused checkpoint 5 roadmap action after recovery',
  },
  {
    path: '.ai-docs/roadmap/deferred-decisions.md',
    pattern: /M21 release delivery:[\s\S]{0,500}pausado en `E401`/i,
    description: 'paused checkpoint 5 deferred action after recovery',
  },
  {
    path: '.ai-docs/project/STATUS.md',
    pattern:
      /await immediate approval[^\n]*core|Selected M21 source:[\s\S]{0,120}three[^\n]*not published/i,
    description: 'pre-publication core checkpoint 5 status',
  },
  {
    path: '.ai-docs/releases/0.4.0.md',
    pattern:
      /no M21 package or alias has been published|The core remains unpublished/i,
    description: 'pre-publication core release state',
  },
  {
    path: 'README.md',
    pattern:
      /they are not live npm releases|Do not install or describe them as live until/i,
    description: 'pre-publication aggregate M21 onboarding state',
  },
  {
    path: 'README.md',
    pattern: /`latest` aliases the same\s+coordinated versions/i,
    description: 'pre-publication coordinated M19 channel summary',
  },
  {
    path: 'packages/core/README.md',
    pattern:
      /not an observed npm release|no live registry evidence yet|unavailable\s+to consumers until separately published/i,
    description: 'pre-publication core onboarding state',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern:
      /Next action:[\s\S]{0,220}publicar solo core `0\.4\.0` bajo `next`/i,
    description: 'pre-publication core roadmap action',
  },
  {
    path: '.ai-docs/roadmap/deferred-decisions.md',
    pattern:
      /M21 release delivery:[\s\S]{0,500}aprobación inmediata de publicar solo core/i,
    description: 'pre-publication core deferred action',
  },
  {
    path: '.ai-docs/plans/023-coordinated-experimental-0-4-release.md',
    pattern:
      /\*\*Implementation:\*\*[\s\S]{0,320}publication remains separately gated/i,
    description: 'pre-publication checkpoint 5 plan header',
  },
  {
    path: '.ai-docs/project/STATUS.md',
    pattern:
      /await separate\s+authorization for PLAN-023 checkpoint 6's read-only|checkpoint 6 read-only preflight: reprove/i,
    description: 'pre-preflight checkpoint 6 status',
  },
  {
    path: '.ai-docs/releases/0.4.0.md',
    pattern: /checkpoint 6 read-only preflight remains separately gated/i,
    description: 'pre-preflight checkpoint 6 release state',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern:
      /Next action:[\s\S]{0,220}autorización separada del preflight[\s\S]{0,100}checkpoint 6/i,
    description: 'pre-preflight checkpoint 6 roadmap action',
  },
  {
    path: '.ai-docs/roadmap/deferred-decisions.md',
    pattern:
      /M21 release delivery:[\s\S]{0,600}autorización separada del preflight read-only de checkpoint 6/i,
    description: 'pre-preflight checkpoint 6 deferred action',
  },
  {
    path: '.ai-docs/project/STATUS.md',
    pattern:
      /await immediate approval[^\n]*base|Selected M21 source:[\s\S]{0,160}clean base and pilot candidates remain unpublished/i,
    description: 'pre-publication base checkpoint 6 status',
  },
  {
    path: '.ai-docs/releases/0.4.0.md',
    pattern:
      /selected base `0\.4\.0` and pilot `0\.2\.0` remain unpublished|Base `0\.4\.0` remains unpublished|Only the first command is currently available/i,
    description: 'pre-publication base checkpoint 6 release state',
  },
  {
    path: 'README.md',
    pattern:
      /checkpoint 5 has now published|Base Angular `0\.4\.0` and\s+pilot `0\.2\.0` remain selected clean candidates|Do not mix\s+core `@next` with base Angular `@next`/i,
    description: 'pre-publication base aggregate onboarding state',
  },
  {
    path: 'packages/angular/README.md',
    pattern:
      /Public verified Experimental line: `0\.3\.x`|not an observed npm release|does not make the base Angular `0\.4\.0` candidate available|base `0\.4\.0` has only|unavailable to\s+consumers until separately published/i,
    description: 'pre-publication base onboarding state',
  },
  {
    path: 'packages/angular-aria/README.md',
    pattern: /neither dependent package in this tuple\s+is live yet/i,
    description: 'pre-publication base pilot-onboarding state',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern:
      /Next action:[\s\S]{0,220}publicar solo base Angular `0\.4\.0` bajo `next`/i,
    description: 'pre-publication base roadmap action',
  },
  {
    path: '.ai-docs/roadmap/deferred-decisions.md',
    pattern:
      /M21 release delivery:[\s\S]{0,650}publicar solo base Angular `0\.4\.0` bajo `next`/i,
    description: 'pre-publication base deferred action',
  },
  {
    path: '.ai-docs/plans/023-coordinated-experimental-0-4-release.md',
    pattern: /\*\*Implementation:\*\* Checkpoints 1–5 completed/i,
    description: 'pre-completion checkpoint 6 plan header',
  },
  {
    path: '.ai-docs/project/STATUS.md',
    pattern:
      /await separate\s+authorization for checkpoint 7's read-only|checkpoint 7 read-only pre-publication gate/i,
    description: 'pre-preflight checkpoint 7 status',
  },
  {
    path: '.ai-docs/releases/0.4.0.md',
    pattern: /checkpoint 7 pilot preflight remains separately gated/i,
    description: 'pre-preflight checkpoint 7 release state',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern:
      /Next action:[\s\S]{0,220}preflight(?: read-only)? de checkpoint 7/i,
    description: 'pre-preflight checkpoint 7 roadmap action',
  },
  {
    path: '.ai-docs/roadmap/deferred-decisions.md',
    pattern:
      /M21 release delivery:[\s\S]{0,700}autorización separada del preflight read-only de checkpoint 7/i,
    description: 'pre-preflight checkpoint 7 deferred action',
  },
  {
    path: '.ai-docs/project/STATUS.md',
    pattern:
      /await immediate approval[^\n]*pilot|Selected M21 source:[\s\S]{0,180}pilot[^\n]*unpublished/i,
    description: 'pre-publication pilot checkpoint 7 status',
  },
  {
    path: '.ai-docs/releases/0.4.0.md',
    pattern:
      /selected pilot `0\.2\.0` remains unpublished|pilot `0\.2\.0` remains unpublished|pilot publication remains immediately gated|The first two commands are currently available/i,
    description: 'pre-publication pilot checkpoint 7 release state',
  },
  {
    path: 'README.md',
    pattern:
      /pilot `0\.2\.0` remains (?:a selected clean candidate|unpublished|unavailable)|Do not mix base Angular `@next` with pilot `@next`/i,
    description: 'pre-publication pilot aggregate onboarding state',
  },
  {
    path: 'packages/angular-aria/README.md',
    pattern:
      /Public verified Experimental `0\.1\.0`|not an observed npm release|not-yet-live|pilot `0\.2\.0` remains unavailable|Do not combine pilot `@next` with base Angular `@next`/i,
    description: 'pre-publication pilot onboarding state',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern:
      /Next action:[\s\S]{0,220}publicar solo (?:el )?piloto `0\.2\.0` bajo `next`/i,
    description: 'pre-publication pilot roadmap action',
  },
  {
    path: '.ai-docs/roadmap/deferred-decisions.md',
    pattern:
      /M21 release delivery:[\s\S]{0,750}publicar solo (?:el )?piloto `0\.2\.0` bajo `next`/i,
    description: 'pre-publication pilot deferred action',
  },
  {
    path: '.ai-docs/plans/023-coordinated-experimental-0-4-release.md',
    pattern: /\*\*Implementation:\*\* Checkpoints 1–6 completed/i,
    description: 'pre-completion checkpoint 7 plan header',
  },
  {
    path: '.ai-docs/project/STATUS.md',
    pattern:
      /await separate\s+authorization for checkpoint 8's read-only|checkpoint 8 read-only pilot-`latest` preflight/i,
    description: 'pre-preflight checkpoint 8 status',
  },
  {
    path: '.ai-docs/releases/0.4.0.md',
    pattern: /checkpoint 8 pilot-`latest` preflight remains separately gated/i,
    description: 'pre-preflight checkpoint 8 release state',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern:
      /Next action:[\s\S]{0,220}preflight(?: read-only)? de checkpoint 8/i,
    description: 'pre-preflight checkpoint 8 roadmap action',
  },
  {
    path: '.ai-docs/roadmap/deferred-decisions.md',
    pattern:
      /M21 release delivery:[\s\S]{0,800}autorización separada[\s\S]{0,100}preflight read-only de checkpoint 8/i,
    description: 'pre-preflight checkpoint 8 deferred action',
  },
  {
    path: '.ai-docs/project/STATUS.md',
    pattern:
      /await\s+immediate approval[^\n]*pilot `latest`|Stop for separate immediate approval[\s\S]{0,160}schema-engine-angular-aria@0\.2\.0 latest/i,
    description: 'pre-transition checkpoint 8 status',
  },
  {
    path: '.ai-docs/releases/0.4.0.md',
    pattern:
      /pilot `latest`\s+remains `0\.1\.0`|only the exact pilot `latest` command awaits immediate approval/i,
    description: 'pre-transition checkpoint 8 release state',
  },
  {
    path: 'README.md',
    pattern:
      /pilot `latest` remains `0\.1\.0`|coordinated default line under `latest`|M19 three-package line remains available through explicit\s+versions or `latest`/i,
    description: 'pre-transition checkpoint 8 root onboarding state',
  },
  {
    path: 'packages/angular-aria/README.md',
    pattern:
      /`latest` intentionally remains at `0\.1\.0`|observed `latest` remains\s+Experimental `0\.1\.0`|coordinated M19 default fallback/i,
    description: 'pre-transition checkpoint 8 pilot onboarding state',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern:
      /Next action:[\s\S]{0,240}dist-tag add @rabassoft\/schema-engine-angular-aria@0\.2\.0 latest/i,
    description: 'pre-transition checkpoint 8 roadmap action',
  },
  {
    path: '.ai-docs/roadmap/deferred-decisions.md',
    pattern:
      /M21 release delivery:[\s\S]{0,900}aprobación inmediata[\s\S]{0,120}dist-tag piloto `latest`/i,
    description: 'pre-transition checkpoint 8 deferred action',
  },
  {
    path: '.ai-docs/plans/023-coordinated-experimental-0-4-release.md',
    pattern: /\*\*Implementation:\*\* Checkpoints 1–7 completed/i,
    description: 'pre-completion checkpoint 8 plan header',
  },
  {
    path: '.ai-docs/project/STATUS.md',
    pattern:
      /Exact next action[\s\S]{0,240}checkpoint 9's read-only base Angular/i,
    description: 'pre-preflight checkpoint 9 status action',
  },
  {
    path: '.ai-docs/releases/0.4.0.md',
    pattern: /checkpoint 9 base-`latest` preflight remains separately gated/i,
    description: 'pre-preflight checkpoint 9 release state',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern: /Next action:[\s\S]{0,240}read-only de checkpoint 9/i,
    description: 'pre-preflight checkpoint 9 roadmap action',
  },
  {
    path: '.ai-docs/roadmap/deferred-decisions.md',
    pattern:
      /M21 release delivery:[\s\S]{0,1100}siguiente acción exacta[\s\S]{0,180}preflight read-only de checkpoint 9/i,
    description: 'pre-preflight checkpoint 9 deferred action',
  },
  {
    path: '.ai-docs/plans/023-coordinated-experimental-0-4-release.md',
    pattern:
      /\*\*Implementation:\*\*[\s\S]{0,180}checkpoint 9 remains separately gated/i,
    description: 'pre-preflight checkpoint 9 plan header',
  },
  {
    path: '.ai-docs/project/STATUS.md',
    pattern:
      /Exact next action[\s\S]{0,240}schema-engine-angular@0\.4\.0 latest/i,
    description: 'pre-transition checkpoint 9 status action',
  },
  {
    path: '.ai-docs/releases/0.4.0.md',
    pattern:
      /base-`latest` mutation awaits immediate approval|Only the exact base Angular `latest` command remains gated/i,
    description: 'pre-transition checkpoint 9 release state',
  },
  {
    path: 'README.md',
    pattern: /core\/base `latest` remain `0\.3\.0`/i,
    description: 'pre-transition checkpoint 9 root onboarding state',
  },
  {
    path: 'packages/angular/README.md',
    pattern:
      /`latest` intentionally remains at `0\.3\.0`|`latest` remains the earlier public `0\.3\.0`|`0\.3\.x`[^\n]{0,100}under `latest`/i,
    description: 'pre-transition checkpoint 9 Angular onboarding state',
  },
  {
    path: 'packages/angular-aria/README.md',
    pattern: /`0\.1\.x`[^\n]{0,100}under `latest`/i,
    description: 'stale pilot latest historical statement',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern: /Next action:[\s\S]{0,240}schema-engine-angular@0\.4\.0 latest/i,
    description: 'pre-transition checkpoint 9 roadmap action',
  },
  {
    path: '.ai-docs/roadmap/deferred-decisions.md',
    pattern:
      /M21 release delivery:[\s\S]{0,1200}siguiente acción exacta[\s\S]{0,180}schema-engine-angular@0\.4\.0 latest/i,
    description: 'pre-transition checkpoint 9 deferred action',
  },
  {
    path: '.ai-docs/plans/023-coordinated-experimental-0-4-release.md',
    pattern:
      /\*\*Implementation:\*\*[\s\S]{0,180}checkpoint 9 pre-transition passed/i,
    description: 'pre-completion checkpoint 9 plan header',
  },
  {
    path: '.ai-docs/project/STATUS.md',
    pattern: /Exact next action[\s\S]{0,240}checkpoint 10's read-only core/i,
    description: 'pre-transition checkpoint 10 status action',
  },
  {
    path: '.ai-docs/releases/0.4.0.md',
    pattern:
      /checkpoint 10 core-`latest` preflight remains separately gated|while core `latest` remains `0\.3\.0` in the planned mixed window/i,
    description: 'pre-transition checkpoint 10 release state',
  },
  {
    path: 'README.md',
    pattern:
      /core `latest` remains `0\.3\.0` in the planned[\s\S]{0,80}mixed window/i,
    description: 'pre-transition checkpoint 10 root onboarding state',
  },
  {
    path: 'packages/core/README.md',
    pattern:
      /`latest` intentionally remains at `0\.3\.0`|unqualified installs intentionally remain on verified M19|`0\.3\.x`[^\n]{0,100}under `latest`/i,
    description: 'pre-transition checkpoint 10 core onboarding state',
  },
  {
    path: 'packages/angular/README.md',
    pattern: /Core `latest`[\s\S]{0,80}remains `0\.3\.0`/i,
    description: 'pre-transition checkpoint 10 Angular onboarding state',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern: /Next action:[\s\S]{0,240}read-only de checkpoint 10/i,
    description: 'pre-transition checkpoint 10 roadmap action',
  },
  {
    path: '.ai-docs/roadmap/deferred-decisions.md',
    pattern:
      /M21 release delivery:[\s\S]{0,1300}siguiente acción exacta[\s\S]{0,180}preflight read-only de checkpoint 10/i,
    description: 'pre-transition checkpoint 10 deferred action',
  },
  {
    path: '.ai-docs/plans/023-coordinated-experimental-0-4-release.md',
    pattern: /\*\*Implementation:\*\* Checkpoints 1–9 completed/i,
    description: 'pre-completion checkpoint 10 plan header',
  },
  {
    path: 'README.md',
    pattern:
      /Core\/base `latest`\s+remain `0\.3\.0`|aliases form the planned mixed\s+window/i,
    description: 'pre-completion M21 root onboarding state',
  },
  {
    path: '.ai-docs/releases/0.4.0.md',
    pattern:
      /checkpoint 11 final closure remains separately gated|Their `latest` and unqualified installs form a planned mixed\s+window/i,
    description: 'pre-completion M21 release state',
  },
  {
    path: '.ai-docs/project/STATUS.md',
    pattern:
      /await separate authorization for checkpoint 11|Exact next action[\s\S]{0,240}checkpoint 11/i,
    description: 'pre-completion M21 status state',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern: /Next action:[\s\S]{0,240}checkpoint 11/i,
    description: 'pre-completion M21 roadmap state',
  },
  {
    path: '.ai-docs/roadmap/deferred-decisions.md',
    pattern:
      /M21 release delivery:[\s\S]{0,1400}siguiente acción exacta[\s\S]{0,180}checkpoint 11/i,
    description: 'pre-completion M21 deferred state',
  },
  {
    path: '.ai-docs/plans/023-coordinated-experimental-0-4-release.md',
    pattern:
      /\*\*Status:\*\* Approved|\*\*Implementation:\*\*[\s\S]{0,180}Checkpoints 1–10 completed/i,
    description: 'pre-completion M21 plan state',
  },
  {
    path: '.ai-docs/README.md',
    pattern:
      /PLAN-023:[^\n]{0,180}Approved revision 0|checkpoint 11 final closure separately gated/i,
    description: 'pre-completion M21 documentation-index state',
  },
  {
    path: 'README.md',
    pattern: /The private development repository/i,
    description: 'pre-M22 private-repository introduction',
  },
  {
    path: 'README.md',
    pattern: /PLAN-023 checkpoint 10 has published/i,
    description: 'pre-completion M21 onboarding state',
  },
  {
    path: 'README.md',
    pattern:
      /development repository remains private pending a separate sanitization review/i,
    description: 'pre-M22 sanitization state',
  },
  {
    path: 'README.md',
    pattern: /there is no public issue tracker yet/i,
    description: 'pre-M22 issue-tracker state',
  },
  {
    path: '.ai-docs/project/STATUS.md',
    pattern: /Execute PLAN-024 checkpoint 1 local/i,
    description: 'pre-completion PLAN-024 checkpoint-1 status',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern: /ejecutar PLAN-024 checkpoint 1 local/i,
    description: 'pre-completion PLAN-024 checkpoint-1 roadmap state',
  },
  {
    path: '.ai-docs/roadmap/deferred-decisions.md',
    pattern: /siguiente acción exacta es preparar y\s+revisar PLAN-024/i,
    description: 'pre-approval PLAN-024 deferred state',
  },
  {
    path: '.ai-docs/README.md',
    pattern: /implementation remains inactive pending PLAN-024/i,
    description: 'pre-implementation PLAN-024 documentation-index state',
  },
  {
    path: '.ai-docs/adrs/000-index.md',
    pattern: /PLAN-024[^\n]{0,160}only local checkpoint 1 authorized/i,
    description: 'pre-completion PLAN-024 checkpoint-1 ADR-index state',
  },
  {
    path: '.ai-docs/project/STATUS.md',
    pattern: /PLAN-024 checkpoint 2: acquire and verify/i,
    description: 'in-progress PLAN-024 checkpoint-2 status',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern: /obtener autorización explícita para el checkpoint 2/i,
    description: 'pre-completion PLAN-024 checkpoint-2 roadmap state',
  },
  {
    path: '.ai-docs/roadmap/deferred-decisions.md',
    pattern: /checkpoint 2 is awaiting\s+explicit network\/tool authorization/i,
    description: 'pre-completion PLAN-024 checkpoint-2 deferred state',
  },
  {
    path: '.ai-docs/README.md',
    pattern: /checkpoint 2 awaits explicit network\/tool authorization/i,
    description: 'pre-completion PLAN-024 checkpoint-2 documentation index',
  },
  {
    path: '.ai-docs/adrs/000-index.md',
    pattern: /checkpoint 2 awaits explicit authorization/i,
    description: 'pre-completion PLAN-024 checkpoint-2 ADR-index state',
  },
  {
    path: '.ai-docs/adrs/026-public-repository-and-secure-releases.md',
    pattern:
      /\*\*Implementation:\*\*\s+Not authorized; a separately reviewed PLAN-024 is\s+required/i,
    description: 'pre-PLAN-024 ADR-026 implementation gate',
  },
  {
    path: 'README.md',
    pattern:
      /The repository remains private until PLAN-024 completes its independently gated/i,
    description: 'pre-checkpoint-7 private repository onboarding state',
  },
  {
    path: '.ai-docs/README.md',
    pattern: /The repository remains private until PLAN-024 completes/i,
    description: 'pre-checkpoint-7 private documentation-index state',
  },
  {
    path: '.ai-docs/project/STATUS.md',
    pattern: /Visibility remains private until the reviewed/i,
    description: 'pre-checkpoint-7 private project status',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern: /visibilidad\s+permanece private/i,
    description: 'pre-checkpoint-7 private roadmap state',
  },
  {
    path: '.ai-docs/adrs/026-public-repository-and-secure-releases.md',
    pattern: /It remains private until every\s+pre-visibility gate/i,
    description: 'pre-checkpoint-7 private ADR-026 state',
  },
  {
    path: '.ai-docs/project/STATUS.md',
    pattern: /Obtain separate approval for one checkpoint-7 closure commit/i,
    description: 'pre-completion checkpoint-7 status action',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern: /autorizar el commit de cierre de checkpoint 7/i,
    description: 'pre-completion checkpoint-7 roadmap action',
  },
  {
    path: '.ai-docs/adrs/026-public-repository-and-secure-releases.md',
    pattern: /its closure commit\s+remains separately gated/i,
    description: 'pre-completion checkpoint-7 ADR state',
  },
  {
    path: '.ai-docs/README.md',
    pattern:
      /checkpoint 7's public transition is verified and its closure commit remains/i,
    description: 'pre-completion checkpoint-7 documentation-index state',
  },
];
const ignoredDirectories = new Set([
  '.git',
  '.pnpm-store',
  'coverage',
  'dist',
  'node_modules',
]);
const failures = [];

async function read(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function fail(message) {
  failures.push(message);
}

function sameJson(left, right) {
  return isDeepStrictEqual(left, right);
}

for (const guidePath of stableGuidePaths) {
  const guide = await read(guidePath);
  const volatileIdentifier = guide.match(
    /\b(?:ADR|PLAN|SPEC)-\d{3}\b|\bM\d+\b|\bv\d+\.\d+\.\d+\b/,
  );

  if (volatileIdentifier) {
    fail(
      `${guidePath} contains volatile project state: ${volatileIdentifier[0]}`,
    );
  }
}

for (const policyPath of publicPolicyPaths) {
  await access(path.join(root, policyPath));
}

const rootReadme = await read('README.md');
for (const policyPath of publicPolicyPaths) {
  if (
    !rootReadme.includes(`](${policyPath})`) &&
    !rootReadme.includes(`](./${policyPath})`)
  ) {
    fail(`README.md does not link to ${policyPath}`);
  }
}

const status = await read(statusPath);
const publishableManifests = await Promise.all(
  publishableManifestPaths.map(async (manifestPath) => [
    manifestPath,
    JSON.parse(await read(manifestPath)),
  ]),
);
const expectedManifestContracts = {
  core: {
    exports: {
      '.': {
        types: './dist/index.d.ts',
        import: './dist/index.js',
        default: './dist/index.js',
      },
    },
    dependencies: {},
    devDependencies: {},
    peerDependencies: {},
  },
  angular: {
    exports: {
      '.': {
        types: './dist/index.d.ts',
        import: './dist/index.js',
        default: './dist/index.js',
      },
    },
    dependencies: { tslib: '^2.8.1' },
    devDependencies: { '@rabassoft/schema-engine': 'workspace:*' },
    peerDependencies: {
      '@angular/core': '>=22.0.6 <23.0.0',
      '@angular/forms': '>=22.0.6 <23.0.0',
      '@rabassoft/schema-engine': 'workspace:^',
    },
  },
  angularAria: {
    exports: {
      '.': {
        types: './dist/index.d.ts',
        import: './dist/index.js',
        default: './dist/index.js',
      },
      './styles.css': './styles.css',
    },
    dependencies: { tslib: '^2.8.1' },
    devDependencies: {
      '@angular/aria': '22.0.5',
      '@angular/cdk': '22.0.5',
      '@rabassoft/schema-engine-angular': 'workspace:*',
    },
    peerDependencies: {
      '@angular/aria': '>=22.0.5 <23.0.0',
      '@angular/cdk': '>=22.0.5 <23.0.0',
      '@angular/core': '>=22.0.6 <23.0.0',
      '@rabassoft/schema-engine-angular': 'workspace:^',
    },
  },
};
for (const [
  index,
  packageTarget,
] of M21_RELEASE_DESCRIPTOR.packages.entries()) {
  const [manifestPath, manifest] = publishableManifests[index];
  if (manifest.name !== packageTarget.name) {
    fail(`${manifestPath} does not report ${packageTarget.name}`);
  }
  if (manifest.version !== packageTarget.version) {
    fail(
      `${manifestPath} reports ${manifest.version}, expected ${packageTarget.version}`,
    );
  }
  if (
    manifest.license !== 'AGPL-3.0-only' ||
    manifest.private !== undefined ||
    manifest.repository !== undefined ||
    manifest.publishConfig?.access !== 'public' ||
    manifest.publishConfig?.tag !== M21_RELEASE_DESCRIPTOR.distTag ||
    manifest.publishConfig?.provenance !== M21_RELEASE_DESCRIPTOR.provenance
  ) {
    fail(`${manifestPath} does not match the M21 distribution boundary`);
  }
  if (
    manifest.author?.name !==
      'Ricardo Rabassó Rodríguez, operating as Rabassoft' ||
    manifest.author?.email !== 'ricard@rabassoft.com'
  ) {
    fail(`${manifestPath} does not retain the accepted author/contact`);
  }
  const expectedManifest = expectedManifestContracts[packageTarget.role];
  for (const member of [
    'exports',
    'dependencies',
    'devDependencies',
    'peerDependencies',
  ]) {
    if (!sameJson(manifest[member] ?? {}, expectedManifest[member])) {
      fail(`${manifestPath} has an unexpected M21 ${member} contract`);
    }
  }
  for (const requiredFile of [
    'dist',
    'src',
    'source-build',
    'README.md',
    'SOURCE.md',
    'LICENSE',
    'NOTICE.md',
  ]) {
    if (!manifest.files?.includes(requiredFile)) {
      fail(`${manifestPath} omits package-local ${requiredFile}`);
    }
  }
  for (const requiredFile of [
    'LICENSE',
    'NOTICE.md',
    'SOURCE.md',
    'src/index.ts',
    'source-build/package.json',
    'source-build/pnpm-lock.yaml',
    'source-build/tsconfig.json',
    ...(packageTarget.role === 'angularAria' ? ['styles.css'] : []),
  ]) {
    try {
      await access(path.join(root, packageTarget.workspacePath, requiredFile));
    } catch {
      fail(`${packageTarget.workspacePath} is missing ${requiredFile}`);
    }
  }
}

const liveOnboarding = new Map([
  ['README.md', M19_RELEASE_DESCRIPTOR.packages],
  ['.ai-docs/releases/0.3.0.md', M19_RELEASE_DESCRIPTOR.packages],
  ['packages/core/README.md', [M19_RELEASE_DESCRIPTOR.packages[0]]],
  ['packages/angular/README.md', M19_RELEASE_DESCRIPTOR.packages.slice(0, 2)],
  ['packages/angular-aria/README.md', M19_RELEASE_DESCRIPTOR.packages.slice(1)],
]);
for (const [onboardingPath, packageTargets] of liveOnboarding) {
  const onboarding = await read(onboardingPath);
  for (const { name, version } of packageTargets) {
    if (!onboarding.includes(name) || !onboarding.includes(version)) {
      fail(`${onboardingPath} omits live M19 ${name}@${version}`);
    }
  }
  if (/npm provenance is (?:available|enabled)/iu.test(onboarding)) {
    fail(`${onboardingPath} incorrectly claims npm provenance`);
  }
}

const m21Onboarding = new Map([
  ['README.md', M21_RELEASE_DESCRIPTOR.packages],
  [m21ReleaseNotePath, M21_RELEASE_DESCRIPTOR.packages],
  ['packages/core/README.md', [M21_RELEASE_DESCRIPTOR.packages[0]]],
  ['packages/angular/README.md', M21_RELEASE_DESCRIPTOR.packages.slice(0, 2)],
  ['packages/angular-aria/README.md', M21_RELEASE_DESCRIPTOR.packages.slice(1)],
]);
for (const [onboardingPath, packageTargets] of m21Onboarding) {
  const onboarding = await read(onboardingPath);
  for (const { name, version } of packageTargets) {
    if (!onboarding.includes(name) || !onboarding.includes(version)) {
      fail(`${onboardingPath} omits reviewed M21 ${name}@${version}`);
    }
  }
  if (/npm provenance is (?:available|enabled)/iu.test(onboarding)) {
    fail(`${onboardingPath} incorrectly claims npm provenance`);
  }
}

const requiredOnboardingFragments = new Map([
  [
    'README.md',
    [
      'core/base Angular\n`0.4.0` plus pilot `0.2.0` under both `next` and `latest`',
      'Exact, `next`,\n`latest` and unqualified lower/latest-compatible native/pilot consumers pass',
      'npm install @rabassoft/schema-engine@next @rabassoft/schema-engine-angular@next @rabassoft/schema-engine-angular-aria@next',
    ],
  ],
  [
    'packages/core/README.md',
    [
      'Public verified Experimental `0.4.0`',
      'Source package manifest: `0.4.0`',
      'under both\n  `next` and `latest`',
      'Exact core `0.4.0`, `next`, `latest` and unqualified clean-consumer evidence',
      'Published core `0.4.0` includes these local forests',
    ],
  ],
  [
    'packages/angular/README.md',
    [
      'Public verified Experimental `0.4.0`',
      'Source package manifest: `0.4.0`',
      '| `0.4.x` | `^0.4.0`',
      'Required core `0.4.0` is likewise public and verified under `next`',
      'under both\n  `next` and `latest`',
      '`next`, `latest` and unqualified consumers are\n> verified with public core `0.4.0`',
      'Published `0.4.0` includes these local forests',
    ],
  ],
  [
    'packages/angular-aria/README.md',
    [
      'Public verified Experimental `0.2.0`',
      'Source package manifest: `0.2.0`',
      'selected from commit',
      'under both\n  `next` and `latest`',
      'pilot `0.2.x` with base Angular `^0.4.0`',
      'Core/base Angular `0.4.0`\nand pilot `0.2.0` are public together under both `next` and `latest`',
      'Published `0.2.0`\nincludes these local forests',
    ],
  ],
]);
for (const [onboardingPath, fragments] of requiredOnboardingFragments) {
  const onboarding = await read(onboardingPath);
  for (const fragment of fragments) {
    if (!onboarding.includes(fragment)) {
      fail(`${onboardingPath} omits candidate/live distinction: ${fragment}`);
    }
  }
  const stabilityClaim = onboarding.match(
    /(?:latest|default)[^\n.]{0,80}(?:promotes?|marks?|means?)\s+(?:the\s+)?(?:API\s+)?Stable/i,
  );
  if (stabilityClaim) {
    fail(
      `${onboardingPath} conflates routing with Stable: ${stabilityClaim[0]}`,
    );
  }
}

const m19ReleaseNotePath = '.ai-docs/releases/0.3.0.md';
const m19ReleaseNote = await read(m19ReleaseNotePath);
const requiredM19ReleaseFragments = [
  '@angular/core >=22.0.6 <23.0.0',
  '@angular/aria >=22.0.5 <23.0.0',
  '@angular/cdk >=22.0.5 <23.0.0',
  'Public + Experimental + Active',
  'private repository',
  'no advertised repository URL',
  'npm provenance',
];
for (const fragment of requiredM19ReleaseFragments) {
  if (!m19ReleaseNote.includes(fragment)) {
    fail(`${m19ReleaseNotePath} omits required M19 contract: ${fragment}`);
  }
}

const invalidM19ReleaseClaims = [
  {
    pattern:
      /(?:latest|default)[^\n.]{0,80}(?:promotes?|marks?|means?)\s+(?:the\s+)?(?:API\s+)?Stable/i,
    description: 'default-channel stability promotion',
  },
  {
    pattern:
      /pilot[^\n.]{0,80}`latest`[^\n.]{0,80}(?:mandatory|guaranteed|absent)/i,
    description: 'predicted pilot latest state',
  },
  {
    pattern: /(?:repository is public|public GitHub repository)/i,
    description: 'unobserved public repository state',
  },
  {
    pattern:
      /(?:provenance is enabled|with npm provenance|trusted publishing is enabled)/i,
    description: 'unobserved provenance state',
  },
];
for (const claim of invalidM19ReleaseClaims) {
  const match = m19ReleaseNote.match(claim.pattern);
  if (match) {
    fail(`${m19ReleaseNotePath} contains ${claim.description}: ${match[0]}`);
  }
}

const completedM19Publication =
  /Published packages:[^\n]*0\.3\.0/i.test(status) &&
  /Published packages:[^\n]*0\.1\.0/i.test(status);
if (
  completedM19Publication &&
  /(?:not published|no registry publication|private source candidate)/i.test(
    m19ReleaseNote,
  )
) {
  fail(`${m19ReleaseNotePath} retains pre-publication M19 state`);
}

const m21ReleaseNote = await read(m21ReleaseNotePath);
const requiredM21ReleaseFragments = [
  'are public and byte-verified under `next`',
  'planned mixed window',
  'Selected clean candidate evidence',
  '07755b4cbe31098f86099db38c65930d52772fb5',
  'neutralDryRun: true',
  'produced bytes identical to every',
  'Review 153 cycle 3 passed all nine',
  'Review 154 cycle 5 verifies the',
  'Review 155 cycle 1 subsequently verified',
  'Review 156 cycle 2 proves',
  'Review 157 cycle 2 reverified',
  'Review 158 cycle 2 proves',
  'Review 159 cycle 1 then reverified',
  'Review 160 cycle 3 verifies',
  'Review 161 cycle 5 then reverified',
  'Review 162 cycle 2 verifies',
  'Review 163 cycle 3 verifies',
  'final review 164',
  'PLAN-023 revision 0 and M21 completed',
  'under both `next` and `latest`',
  'unqualified lower/latest native/pilot consumers',
  'No `latest` or unqualified consumer evidence',
  'All three commands are currently available',
  'Public + Experimental + Active',
  'private repository',
  'no advertised repository URL',
  'npm provenance',
  'ObjectUiSchema.presentation',
  'ItemUiSchema.presentation',
  'TemplatePresentationEntryDefinition',
  'ObjectFieldDefinition.presentation',
  'ObjectNodeTemplate.presentation',
  'ObjectItemTemplateDefinition.presentation',
  'TextResolutionContext',
  'AngularPresentationContainerTester',
  'node.kind',
  'provideSchemaEngineAngularAriaContainers()',
  '@angular/core >=22.0.6 <23.0.0',
  '@angular/forms >=22.0.6 <23.0.0',
  '@angular/aria >=22.0.5 <23.0.0',
  '@angular/cdk >=22.0.5 <23.0.0',
  'Publication under `next` is dependency-first: core, base Angular, then pilot.',
  'The established `latest` transition is deepest-dependent-first: pilot, base',
  'Angular, then core.',
  'Only observed exact bytes',
  'never imply Stable',
  'never overwrite or unpublish immutable bytes',
];
for (const fragment of requiredM21ReleaseFragments) {
  if (!m21ReleaseNote.includes(fragment)) {
    fail(`${m21ReleaseNotePath} omits required M21 contract: ${fragment}`);
  }
}

const invalidM21ReleaseClaims = [
  {
    pattern: /(?:repository is public|public GitHub repository)/i,
    description: 'unobserved public repository state',
  },
  {
    pattern:
      /(?:provenance is enabled|with npm provenance|trusted publishing is enabled)/i,
    description: 'unobserved provenance state',
  },
  {
    pattern:
      /(?:latest|default)[^\n.]{0,80}(?:promotes?|marks?|means?)\s+(?:the\s+)?(?:API\s+)?Stable/i,
    description: 'default-channel stability promotion',
  },
  {
    pattern:
      /schema-engine-angular(?:-aria)?[^\n]{0,80}\^0\.3\.0[^\n]{0,80}(?:M21|0\.4\.0|0\.2\.0)/i,
    description: 'obsolete Schema Engine peer in the M21 line',
  },
  {
    pattern:
      /(?:dependency-first|Publication under `next`)[^\n.]{0,100}(?:pilot[^\n.]{0,40}base[^\n.]{0,40}core|base[^\n.]{0,40}core[^\n.]{0,40}pilot)/i,
    description: 'wrong M21 next order',
  },
  {
    pattern:
      /(?:deepest-dependent-first|`latest` transition)[^\n.]{0,100}(?:core[^\n.]{0,40}base[^\n.]{0,40}pilot|base[^\n.]{0,40}pilot[^\n.]{0,40}core)/i,
    description: 'wrong M21 latest order',
  },
];
for (const claim of invalidM21ReleaseClaims) {
  const match = m21ReleaseNote.match(claim.pattern);
  if (match) {
    fail(`${m21ReleaseNotePath} contains ${claim.description}: ${match[0]}`);
  }
}
const ephemeralGitClaim = status.match(
  /\bcommits? ahead\b|\bcommits? behind\b|no push performed|nothing was pushed/i,
);

if (ephemeralGitClaim) {
  fail(`${statusPath} contains ephemeral Git state: ${ephemeralGitClaim[0]}`);
}

for (const staleClaim of staleCurrentClaims) {
  const document = await read(staleClaim.path);
  const match = document.match(staleClaim.pattern);

  if (match) {
    fail(
      `${staleClaim.path} contains stale ${staleClaim.description}: ${match[0]}`,
    );
  }
}

const acceptedSpecificationBlock = status.match(
  /- \*\*Accepted specifications:\*\*([\s\S]*?)(?=\n- \*\*)/,
);
const acceptedSpecifications = [
  ...(acceptedSpecificationBlock?.[1] ?? '')
    .replaceAll(/\s+/g, ' ')
    .matchAll(/SPEC-\d{3}\s+v\d+\.\d+\.\d+/g),
].map(([specification]) => specification);

if (acceptedSpecifications.length === 0) {
  fail(`${statusPath} does not identify any accepted specification versions`);
}

const specificationEntries = await readdir(
  path.join(root, specificationDirectory),
);
const specifications = new Map();

for (const entry of specificationEntries.filter(
  (name) => name.endsWith('.md') && name !== '000-index.md',
)) {
  const relativePath = path.join(specificationDirectory, entry);
  const document = await read(relativePath);
  const identifier = document.match(/^# (SPEC-\d{3}):/m)?.[1];
  const state = document.match(/^- \*\*(?:State|Estado):\*\* (.+)$/m)?.[1];
  const version = document.match(/^- \*\*(?:Version|Versión):\*\* (.+)$/m)?.[1];

  if (!identifier || !state || !version) {
    fail(
      `${relativePath} does not expose a parseable identifier/state/version`,
    );
    continue;
  }

  specifications.set(identifier, { relativePath, state, version });
}

const specificationIndex = await read(specificationIndexPath);
for (const [identifier, document] of specifications) {
  const stateAndVersion = `**${document.state} ${document.version}`;
  const indexEntry = specificationIndex
    .split(/\r?\n/)
    .find((line) => line.includes(`[${identifier}:`));
  if (!indexEntry || !indexEntry.includes(stateAndVersion)) {
    fail(
      `${specificationIndexPath} does not report ${identifier} as ${document.state} ${document.version}`,
    );
  }
}

for (const acceptedSpecification of acceptedSpecifications) {
  const [identifier, version] = acceptedSpecification.split(/\s+v/);
  const document = specifications.get(identifier);

  if (!document) {
    fail(`${statusPath} references missing ${identifier}`);
  } else if (document.state !== 'Accepted' || document.version !== version) {
    fail(
      `${statusPath} reports ${acceptedSpecification}, but ${document.relativePath} is ${document.state} v${document.version}`,
    );
  }
}

const proposedSpecification = status
  .match(/- \*\*Last proposed specification:\*\*([^\n]+)/)?.[1]
  ?.match(/(SPEC-\d{3})\s+v(\d+\.\d+\.\d+)/);

if (proposedSpecification) {
  const [, identifier, version] = proposedSpecification;
  const document = specifications.get(identifier);

  if (!document) {
    fail(`${statusPath} references missing proposed ${identifier}`);
  } else if (document.state !== 'Draft' || document.version !== version) {
    fail(
      `${statusPath} reports proposed ${identifier} v${version}, but ${document.relativePath} is ${document.state} v${document.version}`,
    );
  }
}

for (const onboardingPath of onboardingPaths) {
  const onboarding = (await read(onboardingPath)).replaceAll(/\s+/g, ' ');
  for (const specification of new Set(acceptedSpecifications)) {
    if (!onboarding.includes(specification)) {
      fail(`${onboardingPath} does not report accepted ${specification}`);
    }
  }

  if (proposedSpecification) {
    const [, identifier, version] = proposedSpecification;
    const specification = `${identifier} v${version}`;
    if (!onboarding.includes(specification)) {
      fail(`${onboardingPath} does not report proposed ${specification}`);
    }
  }
}

async function collectMarkdownFiles(directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;

    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectMarkdownFiles(absolutePath)));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(absolutePath);
    }
  }

  return files;
}

const markdownFiles = await collectMarkdownFiles();
let localLinkCount = 0;

for (const markdownPath of markdownFiles) {
  const markdown = await readFile(markdownPath, 'utf8');
  const links = markdown.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g);

  for (const [, rawTarget] of links) {
    const target = rawTarget.trim().replace(/^<|>$/g, '');
    if (
      target === '' ||
      target.startsWith('#') ||
      /^(?:https?:|mailto:)/i.test(target)
    ) {
      continue;
    }

    localLinkCount += 1;
    const fileTarget = decodeURIComponent(target.split('#', 1)[0]);
    const absoluteTarget = path.resolve(path.dirname(markdownPath), fileTarget);

    try {
      await access(absoluteTarget);
    } catch {
      fail(
        `${path.relative(root, markdownPath)} references missing ${fileTarget}`,
      );
    }
  }
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `Documentation checks passed: ${markdownFiles.length} Markdown files, ${localLinkCount} local links, stable guides and accepted versions consistent.`,
  );
}
