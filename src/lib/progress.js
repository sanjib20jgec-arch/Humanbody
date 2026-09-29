import { WHOLE_BODY_PATH_ID } from '../data/guidedPaths.js';
import { guidedPath } from './guidedPath.js';

const KEY = 'human-biology-lab-progress';
export const PROGRESS_SCHEMA_VERSION = 2;

function createGuidedPathProgress() {
  return {
    currentStep: guidedPath[0] || null,
    currentView: 'explore',
    started: false,
    steps: {}
  };
}

function createDefaultProgress() {
  return {
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    explored: {},
    completed: {},
    quiz: {},
    simulations: 0,
    lastModule: 'cell',
    lastView: 'explore',
    visitedViews: {},
    guidedPaths: {
      [WHOLE_BODY_PATH_ID]: createGuidedPathProgress()
    }
  };
}

function normalizeProgress(value) {
  const defaults = createDefaultProgress();
  const saved = value && typeof value === 'object' ? value : {};
  const savedPath = saved.guidedPaths?.[WHOLE_BODY_PATH_ID] || {};
  const savedSteps = savedPath.steps && typeof savedPath.steps === 'object' ? savedPath.steps : {};
  const guidedSteps = Object.fromEntries(guidedPath.map((moduleId) => [moduleId, {
    ...(savedSteps[moduleId] || {})
  }]));
  return {
    ...defaults,
    ...saved,
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    explored: { ...defaults.explored, ...(saved.explored || {}) },
    completed: { ...defaults.completed, ...(saved.completed || {}) },
    quiz: { ...defaults.quiz, ...(saved.quiz || {}) },
    visitedViews: { ...defaults.visitedViews, ...(saved.visitedViews || {}) },
    guidedPaths: {
      ...defaults.guidedPaths,
      ...(saved.guidedPaths || {}),
      [WHOLE_BODY_PATH_ID]: {
        ...defaults.guidedPaths[WHOLE_BODY_PATH_ID],
        ...savedPath,
        steps: guidedSteps
      }
    }
  };
}

export function loadProgress() {
  try {
    return normalizeProgress(JSON.parse(localStorage.getItem(KEY) || '{}'));
  } catch {
    return createDefaultProgress();
  }
}

export function saveProgress(progress) {
  try { localStorage.setItem(KEY, JSON.stringify(normalizeProgress(progress))); } catch { /* storage can be unavailable */ }
}

function updateGuidedStep(progress, moduleId, patch = {}) {
  if (!guidedPath.includes(moduleId)) return progress;
  const pathProgress = progress.guidedPaths?.[WHOLE_BODY_PATH_ID] || createGuidedPathProgress();
  const step = pathProgress.steps?.[moduleId] || {};
  return {
    ...progress,
    guidedPaths: {
      ...progress.guidedPaths,
      [WHOLE_BODY_PATH_ID]: {
        ...pathProgress,
        steps: { ...pathProgress.steps, [moduleId]: { ...step, ...patch } }
      }
    }
  };
}

export function markExplored(progress, moduleId) {
  const next = { ...progress, explored: { ...progress.explored, [moduleId]: true } };
  return updateGuidedStep(next, moduleId, { explored: true });
}

export function markView(progress, moduleId, view = 'explore') {
  const currentPath = progress.guidedPaths?.[WHOLE_BODY_PATH_ID] || createGuidedPathProgress();
  const next = {
    ...progress,
    lastModule: moduleId,
    lastView: view,
    visitedViews: {
      ...progress.visitedViews,
      [moduleId]: { ...(progress.visitedViews?.[moduleId] || {}), [view]: true }
    },
    guidedPaths: {
      ...progress.guidedPaths,
      [WHOLE_BODY_PATH_ID]: {
        ...currentPath,
        currentStep: moduleId,
        currentView: view,
        started: true
      }
    }
  };
  return updateGuidedStep(next, moduleId, { explored: true, lastView: view, lastVisitedAt: Date.now() });
}

export function markCompleted(progress, moduleId) {
  const next = { ...progress, completed: { ...progress.completed, [moduleId]: true } };
  return updateGuidedStep(next, moduleId, { completed: true });
}

export function recordQuiz(progress, moduleId, correct, total) {
  const previous = progress.quiz?.[moduleId] || { attempts: 0, correct: 0, total: 0, best: 0 };
  const latest = Math.round((correct / Math.max(total, 1)) * 100);
  const next = {
    ...progress,
    quiz: {
      ...progress.quiz,
      [moduleId]: {
        attempts: previous.attempts + 1,
        correct: previous.correct + correct,
        total: previous.total + total,
        latest,
        best: Math.max(previous.best || 0, latest),
        passed: Math.max(previous.best || 0, latest) >= 67
      }
    }
  };
  return updateGuidedStep(next, moduleId, {
    attempted: true,
    latest,
    best: Math.max(previous.best || 0, latest),
    passed: Math.max(previous.best || 0, latest) >= 67
  });
}

export function getGuidedProgress(progress, pathId = WHOLE_BODY_PATH_ID) {
  return progress?.guidedPaths?.[pathId] || createGuidedPathProgress();
}

export function progressPercent(progress, totalModules) {
  const explored = Object.keys(progress.explored || {}).length;
  const completed = Object.keys(progress.completed || {}).length;
  return Math.min(100, Math.round(((explored * 0.45 + completed * 0.55) / Math.max(totalModules, 1)) * 100));
}
