import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

assert.match(app, /const qualityProfiles =/);
assert.match(app, /shadowMap: 1536/);
assert.match(app, /shadowMap: 768/);
assert.match(app, /function initializeOverlayBuffers\(\)/);
assert.match(app, /setDrawRange\(0, count\)/);
assert.doesNotMatch(app, /trajectoryLine\.geometry\.dispose\(\)/);
assert.doesNotMatch(app, /supportFill\.geometry\.dispose\(\)/);
assert.match(app, /function disposeEnvironment\(\)/);
assert.match(app, /fromEquirectangular/);
assert.match(app, /function setupResizeHandling\(\)/);
assert.match(app, /ResizeObserver/);
assert.match(app, /webglcontextlost/);
assert.match(app, /webglcontextrestored/);
assert.match(app, /function disposeSceneResources\(\)/);
assert.match(app, /renderer\?\.dispose\(\)/);
assert.match(app, /frameStats/);
assert.match(html, /id=["']render-status["']/);

console.log('Phase 3 rendering/performance contract passed');
