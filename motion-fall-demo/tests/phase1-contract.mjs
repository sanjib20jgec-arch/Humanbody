import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

assert.match(app, /const MAX_CATCHUP_TICKS = 8/);
assert.match(app, /while \(sim\.accumulator >= FIXED_STEP && ticks < MAX_CATCHUP_TICKS\)/);
assert.match(app, /function updateSimulationTick\(dt = FIXED_STEP\)/);
assert.match(app, /world\.step\(FIXED_STEP\)/);
assert.doesNotMatch(app, /world\.step\(FIXED_STEP, scaled/);
assert.match(app, /function createReplaySnapshot\(\)/);
assert.match(app, /initialBodies: captureBodyState\(\)/);
assert.match(app, /function computeStateChecksum\(\)/);
assert.match(app, /function recordChecksum\(force = false\)/);
assert.match(app, /function startReplay\(\)/);
assert.match(app, /'Verified' : 'Mismatch'/);
assert.match(app, /mesh\.position\.lerpVectors/);
assert.match(html, /id=["']replay-status["']/);

console.log('Phase 1 deterministic-core contract passed');
