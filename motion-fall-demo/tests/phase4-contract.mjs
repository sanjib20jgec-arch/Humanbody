import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const assetsReadme = await readFile(new URL('../assets/README.txt', import.meta.url), 'utf8');

assert.match(app, /const BONE_ALIASES =/);
assert.match(app, /function validateCharacterScene\(root\)/);
assert.match(app, /function normalizeCharacterScene\(root\)/);
assert.match(app, /function mapCharacterBones\(root\)/);
assert.match(app, /function applyCharacterPose\(\)/);
assert.match(app, /function disposeLoadedCharacter\(\)/);
assert.match(app, /event\.lengthComputable/);
assert.match(app, /characterAdapter\.mappedCount/);
assert.match(app, /characterAdapter\.metrics/);
assert.match(app, /character.glb loaded/);
assert.match(app, /Proxy mannequin/);
assert.match(html, /id=["']asset-status["'][^>]*aria-live=["']polite["']/);
assert.match(assetsReadme, /bone-mapping/i);
assert.match(assetsReadme, /hair cards/i);

console.log('Phase 4 asset-adapter contract passed');
