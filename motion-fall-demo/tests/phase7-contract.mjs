import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const smoke = await readFile(new URL('./smoke.mjs', import.meta.url), 'utf8');
const pwa = await readFile(new URL('./pwa-offline.mjs', import.meta.url), 'utf8');
const matrix = await readFile(new URL('./release-matrix.mjs', import.meta.url), 'utf8');
const report = await readFile(new URL('../verification/phase-7-report.md', import.meta.url), 'utf8');

assert.equal(pkg.scripts['test:phase7'], 'npm run test:phase6 && node tests/phase7-contract.mjs');
assert.equal(pkg.scripts['test:release'], 'npm run test:phase7 && npm run test:browser && npm run test:pwa && node tests/release-matrix.mjs');
assert.match(smoke, /waitForFunction/);
assert.match(pwa, /setOffline\(true\)/);
assert.match(matrix, /reducedMotion/);
assert.match(matrix, /hasTouch: true/);
assert.match(matrix, /clipboard/);
assert.match(report, /Release browser matrix passed/);

console.log('Phase 7 release-verification contract passed');
