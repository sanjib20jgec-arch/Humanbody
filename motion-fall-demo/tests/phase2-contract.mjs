import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

assert.match(app, /new CANNON\.ConeTwistConstraint/);
assert.match(app, /function setConstraintForce\(constraint, maxForce\)/);
assert.match(app, /collideConnected: false/);
assert.match(app, /function allFloorContactCount\(\)/);
assert.match(app, /function floorContactSamples\(\)/);
assert.match(app, /world\.contacts/);
assert.match(app, /const physicsTuning =/);
assert.match(app, /function signedDistanceToPolygon\(point, polygon\)/);
assert.match(app, /function updateSettleDwell\(dt\)/);
assert.match(app, /sim\.settleDwell >= physicsTuning\.settle\.dwell/);
assert.match(app, /function applyQuaternionSpring\(body, targetEuler, strength/);
assert.match(app, /function drivePhysicalPose\(strength, lean = 0\)/);
assert.match(app, /sim\.contactCount/);
assert.match(app, /sim\.xcomEdgeDistance/);
assert.match(app, /sim\.recoverySucceeded/);
assert.match(html, /id=["']contact-count["']/);
assert.match(html, /id=["']xcom-edge["']/);

console.log('Phase 2 physics-credibility contract passed');
