import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const viewer = readFileSync(new URL('../src/components/BodyMap3DAtlas.jsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const materials = readFileSync(new URL('../src/lib/AnatomySceneManager.js', import.meta.url), 'utf8');

assert.match(viewer, /duration:\s*900/, 'organ focus transition should use the planned 0.9 s cinematic duration');
assert.match(viewer, /if \(flyToRef\.current\)[\s\S]{0,180}flyToRef\.current = null/, 'direct camera interaction must interrupt a running fly-to');
assert.match(viewer, /mobileHudOpen && <button className="atlas-sheet-handle"/, 'mobile details sheet needs a keyboard/touch close affordance');
assert.match(styles, /\.body-3d-stage \.anatomy-hud-card\.mobile-open[\s\S]{0,500}max-height:\s*min\(56dvh,\s*420px\)/, 'mobile detail panel must behave as a bounded, scrollable bottom sheet');
assert.match(styles, /\.anatomy-search\{[^}]*top:52px/, 'search panel must leave separation below the HUD topline');
assert.match(styles, /\.three-hud-bottom button[^}]*font:\s*10px/, 'atlas control labels must meet the 10px readability floor');
assert.match(styles, /prefers-reduced-transparency:\s*reduce[\s\S]*backdrop-filter:\s*none/, 'glass UI must retain a reduced-transparency fallback');
assert.match(materials, /clearcoatRoughness/, 'tissue material profiles must retain roughness-controlled highlights');
console.log('Atlas visual UX QC passed (focus motion, HUD readability, glass fallback, and mobile detail sheet).');
