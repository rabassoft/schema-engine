import {
  argumentValue,
  loadCoordinatedReleaseTarget,
} from './release-target.mjs';
import { evaluateNpmPublishReadiness } from './npm-publish-readiness.mjs';

const args = process.argv.slice(2);
const target = loadCoordinatedReleaseTarget(args);
const findings = evaluateNpmPublishReadiness({
  ...target,
  sourceCommit: argumentValue(args, 'source-commit'),
});

if (findings.length > 0) {
  for (const finding of findings) console.error(`- ${finding}`);
  console.error('npm trusted publication is not authorized for this source.');
  process.exitCode = 1;
} else {
  console.log('npm trusted publication readiness passed.');
}
