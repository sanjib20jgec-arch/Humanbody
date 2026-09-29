import { guidedPath as moduleOrder, guidedPathMeta as moduleMeta, modules } from './modules.js';
import { learningObjectives, evidenceReferences } from './learningObjectives.js';
import { getAnatomyReference } from './anatomyRegistry.js';

export const GUIDED_PATH_SCHEMA_VERSION = 1;
export const WHOLE_BODY_PATH_ID = 'whole-body-foundations';

const moduleById = new Map(modules.map((module) => [module.id, module]));
const sourceByModule = {
  circulation: [evidenceReferences.heartAnatomy.url, getAnatomyReference('heart-macro').source.url],
  digestion: [evidenceReferences.digestionSystem.url, getAnatomyReference('digestive-macro').source.url],
  excretion: [evidenceReferences.kidneyAnatomy.url, getAnatomyReference('kidney-macro').source.url],
  nervous: [evidenceReferences.nervousSystem.url, getAnatomyReference('nervous-macro').source.url],
  respiration: [evidenceReferences.anatomyTerminology.url, getAnatomyReference('respiratory-macro').source.url],
  reproduction: [evidenceReferences.anatomyTerminology.url, getAnatomyReference('reproductive-macro').source.url],
  kinesiology: [evidenceReferences.muscularSystem.url, evidenceReferences.cmuMocap.url]
};

function makeStep(moduleId, order) {
  const module = moduleById.get(moduleId);
  const meta = moduleMeta[moduleId] || {};
  const objectives = learningObjectives[moduleId] || [];
  if (!module) return null;
  return {
    id: moduleId,
    moduleId,
    order,
    title: module.title,
    shortTitle: module.short,
    stage: meta.stage || 'Learning systems',
    estimatedMinutes: meta.estimatedMinutes || 8,
    pathReason: meta.pathReason || `Explore ${module.title}.`,
    objective: objectives[0] || `Build a working model of ${module.title}.`,
    objectives: objectives.slice(),
    modes: ['explore', 'simulate', 'quiz'],
    sources: sourceByModule[moduleId] || [evidenceReferences.anatomyTerminology.url, evidenceReferences.bodyParts3D.url],
    prerequisites: order > 1 ? [moduleOrder[order - 2]] : []
  };
}

export const guidedPathDefinition = {
  id: WHOLE_BODY_PATH_ID,
  version: GUIDED_PATH_SCHEMA_VERSION,
  title: 'From cell to whole-body systems',
  description: 'A progressive sequence from cellular foundations to coordinated human systems.',
  steps: moduleOrder.map((moduleId, index) => makeStep(moduleId, index + 1)).filter(Boolean)
};

export const guidedPathDefinitions = {
  [WHOLE_BODY_PATH_ID]: guidedPathDefinition
};

export function validateGuidedPathDefinition(definition) {
  const errors = [];
  if (!definition?.id) errors.push('path id is required');
  if (definition?.version !== GUIDED_PATH_SCHEMA_VERSION) errors.push('unsupported path schema version');
  if (!Array.isArray(definition?.steps) || definition.steps.length === 0) {
    errors.push('at least one step is required');
    return errors;
  }
  const ids = new Set();
  definition.steps.forEach((step, index) => {
    if (!step.id || ids.has(step.id)) errors.push(`step ${index + 1} has a missing or duplicate id`);
    ids.add(step.id);
    if (step.order !== index + 1) errors.push(`step ${step.id || index + 1} has an invalid order`);
    if (!step.moduleId) errors.push(`step ${step.id || index + 1} is missing moduleId`);
    if (!step.title) errors.push(`step ${step.id || index + 1} is missing title`);
    if (!step.objective) errors.push(`step ${step.id || index + 1} is missing objective`);
    if (!Array.isArray(step.objectives) || step.objectives.length === 0) errors.push(`step ${step.id || index + 1} is missing objectives`);
    if (!Array.isArray(step.modes) || step.modes.length === 0) errors.push(`step ${step.id || index + 1} is missing modes`);
    if (!Array.isArray(step.sources) || step.sources.length === 0) errors.push(`step ${step.id || index + 1} is missing sources`);
  });
  return errors;
}

export function getGuidedPathStep(stepId, definition = guidedPathDefinition) {
  return definition.steps.find((step) => step.id === stepId || step.moduleId === stepId) || null;
}

export function getGuidedPathSummary(definition = guidedPathDefinition) {
  return {
    id: definition.id,
    title: definition.title,
    totalSteps: definition.steps.length,
    estimatedMinutes: definition.steps.reduce((total, step) => total + step.estimatedMinutes, 0),
    stages: [...new Set(definition.steps.map((step) => step.stage))]
  };
}
