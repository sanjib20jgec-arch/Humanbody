import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [app, card, styles, reference, test] = await Promise.all([
  readFile('src/App.jsx', 'utf8'),
  readFile('src/components/GuidedStepCard.jsx', 'utf8'),
  readFile('src/styles.css', 'utf8'),
  readFile('src/components/ReferenceObject3D.jsx', 'utf8'),
  readFile('tests/browser/guided-path.spec.mjs', 'utf8')
]);

assert.match(app, /GuidedStepCard/);
assert.match(app, /getGuidedPathStep\(active\.id\)/);
assert.match(app, /previous=\{neighbors\.previous\}/);
assert.match(app, /next=\{neighbors\.next\}/);
assert.match(app, /function ObjectiveDisclosure/);
assert.match(app, /className="objective-disclosure"/);
assert.match(app, /className="guided-path-summary"/);
assert.match(card, /Learning target:/);
assert.match(card, /currentMode\.label/);
assert.match(card, /Check understanding/);
assert.match(card, /Previous step: \$\{previous\.title\}/);
assert.match(card, /Next step: \$\{next\.title\}/);
assert.doesNotMatch(card, /guided-step-dots|aria-label="Learning modes"/);
assert.match(styles, /\.guided-step-card-actions/);
assert.match(styles, /\.objective-disclosure/);
assert.match(styles, /\.guided-path-summary/);
assert.match(styles, /@media\(max-width:767px\)/);
assert.match(styles, /@media\(prefers-reduced-motion: reduce\)/);
assert.match(reference, /Rotate 360° with drag or touch/);
assert.match(reference, /source and license/);
assert.match(test, /guided-step-card/);
assert.match(test, /12/);

console.log('Guided Path UI foundation smoke passed');
