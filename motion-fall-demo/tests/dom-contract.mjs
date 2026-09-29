import assert from 'node:assert/strict';

const requiredIds = [
  'offline-status', 'render-status', 'asset-status', 'scene-canvas', 'state-label', 'sim-clock', 'stability-label', 'seed-value',
  'loading-scene', 'impact-readout', 'mode-hint', 'scenario-status', 'copy-scenario', 'load-scenario', 'lesson-explanation', 'replay-status', 'contact-count', 'xcom-edge', 'impact-intensity', 'impact-intensity-value', 'friction-description',
  'physics-readout', 'show-com', 'show-support', 'show-trajectory', 'play-button', 'pause-button', 'step-button',
  'reset-button', 'replay-button', 'camera-reset', 'readme-panel'
];
const requiredDataValues = {
  'data-mode': ['Setup', 'Playback'],
  'data-movement': ['Idle', 'Walk', 'Run'],
  'data-region': ['Torso', 'Arm', 'Leg'],
  'data-direction': ['Front', 'Back', 'Left', 'Right'],
  'data-friction': ['Normal', 'Slippery', 'Grippy'],
  'data-slow': ['1', '0.5', '0.25'],
  'data-quality': ['high', 'mobile'],
  'data-scenario': ['gentle', 'slippery', 'recovery', 'high'],
  'data-state-track': ['Locomotion', 'ImpactReact', 'Stagger', 'Collapse', 'Grounded', 'Recover']
};

function attributeValues(html, attribute) {
  const expression = new RegExp(`${attribute}=["']([^"']+)["']`, 'g');
  return [...html.matchAll(expression)].map(match => match[1]);
}

export function runDOMContract(html) {
  for (const id of requiredIds) {
    assert.match(html, new RegExp(`\\bid=["']${id}["']`), `Missing required DOM id: ${id}`);
  }
  for (const [attribute, expected] of Object.entries(requiredDataValues)) {
    const actual = new Set(attributeValues(html, attribute));
    for (const value of expected) assert.ok(actual.has(value), `Missing ${attribute}=${value}`);
  }
  assert.match(html, /STATE MACHINE/);
  assert.match(html, /TRUE 3D SCENE/);
  assert.match(html, /README/);
  assert.match(html, /type=["']importmap["']/);
  return { ids: requiredIds.length, dataAttributes: Object.keys(requiredDataValues).length };
}

if (process.argv[1]?.endsWith('dom-contract.mjs')) {
  const { readFile } = await import('node:fs/promises');
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  console.log(`DOM contract passed: ${JSON.stringify(runDOMContract(html))}`);
}
