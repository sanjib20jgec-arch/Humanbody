import { guidedPathDefinition, getGuidedPathStep as getDefinitionGuidedPathStep, WHOLE_BODY_PATH_ID } from '../data/guidedPaths.js';

export const CHECKPOINT_PASS_PERCENT = 67;
export const guidedPath = guidedPathDefinition.steps.map((step) => step.moduleId);
export const guidedPathMeta = Object.fromEntries(guidedPathDefinition.steps.map((step) => [step.moduleId, {
  stage: step.stage,
  estimatedMinutes: step.estimatedMinutes,
  pathReason: step.pathReason,
  objective: step.objective,
  objectives: step.objectives,
  modes: step.modes,
  sources: step.sources,
  prerequisites: step.prerequisites
}]));

export function isCheckpointPassed(progress, moduleId) {
  const quiz = progress?.quiz?.[moduleId];
  // `completed` is retained as a compatibility bridge for learners who
  // finished a checkpoint before the scored-state model was introduced.
  return Boolean(progress?.completed?.[moduleId] || Number(quiz?.best || 0) >= CHECKPOINT_PASS_PERCENT);
}

export function getGuidedStepState(progress, moduleId) {
  const quiz = progress?.quiz?.[moduleId] || {};
  const views = progress?.visitedViews?.[moduleId] || {};
  const guidedStep = progress?.guidedPaths?.[WHOLE_BODY_PATH_ID]?.steps?.[moduleId] || {};
  const passed = isCheckpointPassed(progress, moduleId);
  const attempted = Number(quiz.attempts || 0) > 0;
  const explored = Boolean(progress?.explored?.[moduleId] || guidedStep.explored);
  const state = passed ? 'passed' : attempted ? 'review' : explored ? 'explored' : 'not-started';
  return {
    state,
    passed,
    attempted,
    explored,
    views,
    best: Number(quiz.best || guidedStep.best || 0),
    latest: Number(quiz.latest || guidedStep.latest || 0),
    label: {
      passed: 'Checkpoint passed',
      review: 'Review suggested',
      explored: 'Explored',
      'not-started': 'Not started'
    }[state]
  };
}

export function getGuidedRecommendation(progress, allModules = []) {
  const moduleById = new Map(allModules.map((module) => [module.id, module]));
  const pathModules = guidedPath.map((id) => moduleById.get(id)).filter(Boolean);
  const currentId = progress?.lastModule;
  const currentState = currentId ? getGuidedStepState(progress, currentId) : null;
  const current = pathModules.find((module) => module.id === currentId);
  if (current && !currentState.passed && (currentState.explored || currentState.attempted)) {
    return { module: current, reason: 'Resume where you left off.', kind: 'resume', meta: guidedPathMeta[current.id] };
  }
  const next = pathModules.find((module) => !getGuidedStepState(progress, module.id).passed);
  if (next) return { module: next, reason: guidedPathMeta[next.id]?.pathReason || 'Continue the guided sequence.', kind: 'next', meta: guidedPathMeta[next.id] };
  const review = [...pathModules].sort((a, b) => getGuidedStepState(progress, a.id).best - getGuidedStepState(progress, b.id).best)[0] || pathModules[0];
  return review ? { module: review, reason: 'Review your weakest checkpoint and strengthen recall.', kind: 'review', meta: guidedPathMeta[review.id] } : null;
}

export function getGuidedPathStep(stepId) {
  return getDefinitionGuidedPathStep(stepId, guidedPathDefinition);
}

export function getGuidedNeighbors(moduleId, allModules = []) {
  const moduleById = new Map(allModules.map((module) => [module.id, module]));
  const pathModules = guidedPath.map((id) => moduleById.get(id)).filter(Boolean);
  const index = pathModules.findIndex((module) => module.id === moduleId);
  return {
    index,
    total: pathModules.length,
    previous: index > 0 ? pathModules[index - 1] : null,
    next: index >= 0 && index < pathModules.length - 1 ? pathModules[index + 1] : null
  };
}

export function getGuidedPathProgress(progress, pathId = WHOLE_BODY_PATH_ID) {
  return progress?.guidedPaths?.[pathId] || { currentStep: guidedPath[0], currentView: 'explore', steps: {} };
}
