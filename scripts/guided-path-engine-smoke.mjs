import assert from 'node:assert/strict';
import { guidedPathDefinition, GUIDED_PATH_SCHEMA_VERSION, WHOLE_BODY_PATH_ID, getGuidedPathSummary, validateGuidedPathDefinition } from '../src/data/guidedPaths.js';
import { getGuidedProgress, loadProgress, markCompleted, markExplored, markView, recordQuiz, PROGRESS_SCHEMA_VERSION } from '../src/lib/progress.js';

const errors = validateGuidedPathDefinition(guidedPathDefinition);
assert.deepEqual(errors, [], `Guided Path schema errors: ${errors.join('; ')}`);
assert.equal(guidedPathDefinition.version, GUIDED_PATH_SCHEMA_VERSION);
assert.equal(guidedPathDefinition.id, WHOLE_BODY_PATH_ID);
assert.ok(guidedPathDefinition.steps.length >= 9);
assert.equal(new Set(guidedPathDefinition.steps.map((step) => step.id)).size, guidedPathDefinition.steps.length);
assert.ok(guidedPathDefinition.steps.every((step) => step.objective && step.objectives.length && step.modes.includes('explore') && step.sources.length));
// Phase 72: Kinesiology Theater adds a tenth step under a new integration stage.
assert.deepEqual(getGuidedPathSummary(guidedPathDefinition).stages, ['Foundations', 'Systems', 'Coordination', 'Continuity', 'Information', 'Change', 'Ecology', 'Integration · movement']);

const originalStorage = globalThis.localStorage;
const store = new Map();
globalThis.localStorage = { getItem: (key) => store.get(key) || null, setItem: (key, value) => store.set(key, value) };
try {
  let progress = loadProgress();
  assert.equal(progress.schemaVersion, PROGRESS_SCHEMA_VERSION);
  assert.equal(getGuidedProgress(progress).currentStep, 'cell');
  progress = markView(progress, 'digestion', 'explore');
  progress = markExplored(progress, 'digestion');
  progress = recordQuiz(progress, 'digestion', 2, 3);
  progress = markCompleted(progress, 'digestion');
  const digestion = getGuidedProgress(progress).steps.digestion;
  assert.equal(getGuidedProgress(progress).currentStep, 'digestion');
  assert.equal(getGuidedProgress(progress).currentView, 'explore');
  assert.equal(digestion.explored, true);
  assert.equal(digestion.completed, true);
  assert.equal(digestion.best, 67);
  assert.equal(progress.quiz.digestion.passed, true);
  console.log('Guided Path engine smoke passed');
} finally {
  globalThis.localStorage = originalStorage;
}
