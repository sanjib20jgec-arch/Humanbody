import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../style.css', import.meta.url), 'utf8');

assert.match(app, /function bindKeyboardControls\(\)/);
assert.match(app, /function bindReducedMotion\(\)/);
assert.match(app, /function lessonCopy\(\)/);
assert.match(app, /function applyScenario\(name\)/);
assert.match(app, /function copyScenarioToClipboard\(\)/);
assert.match(app, /function loadScenarioFromURL\(\)/);
assert.match(app, /function validateScenarioParameters\(parameters\)/);
assert.match(app, /prefers-reduced-motion/);
assert.match(html, /aria-live=["']polite["']/);
assert.match(html, /tabindex=["']0["']/);
assert.match(html, /id=["']canvas-help["']/);
assert.match(html, /id=["']lesson-explanation["']/);
assert.match(html, /data-scenario=["']gentle["']/);
assert.match(html, /id=["']copy-scenario["']/);
assert.match(css, /visually-hidden/);
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /#scene-canvas:focus-visible/);

console.log('Phase 6 accessibility/UX contract passed');
