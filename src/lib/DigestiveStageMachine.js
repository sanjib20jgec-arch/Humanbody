/**
 * Phase 32: digestive pathway state machine.
 *
 * The digestion route is a conceptual teaching model. This machine makes its
 * stages, transitions, and accessory-organ side inputs explicit so captions,
 * pH zones, and the 3D route overlay can all be driven from one auditable
 * sequence. Food never passes through accessory organs: bile and pancreatic
 * juice are modeled as side inputs entering at the duodenum.
 */

// R7 (F8): this machine is the single source for the digestive pathway.
// `displayPH` carries the teaching range shown in the pH strip so no second
// copy can drift.
export const DIGESTIVE_STAGES = [
  { id: 'mouth', label: 'Mouth', pH: 7, displayPH: '6.5–7.5', caption: 'Mechanical breakdown and salivary amylase start carbohydrate digestion.', sideInputs: ['salivary amylase'], inAlimentaryCanal: true },
  { id: 'esophagus', label: 'Esophagus', pH: 7, displayPH: '≈ 7', caption: 'Peristalsis moves the bolus toward the stomach; no new enzyme is added here.', sideInputs: [], inAlimentaryCanal: true },
  { id: 'stomach', label: 'Stomach', pH: 2.5, displayPH: '1.5–3.5', caption: 'Acid and pepsin begin protein digestion in a strongly acidic compartment. Pepsin is secreted as inactive pepsinogen and activated by HCl.', sideInputs: ['gastric acid', 'pepsinogen → pepsin'], inAlimentaryCanal: true },
  { id: 'small-intestine', label: 'Small intestine', pH: 7.5, displayPH: '7–8 after neutralization', caption: 'Most chemical digestion and absorption happen here. Bicarbonate in pancreatic juice neutralizes stomach acid, so duodenal contents sit around pH 7–8 after neutralization.', sideInputs: ['bile', 'pancreatic enzymes', 'bicarbonate'], inAlimentaryCanal: true },
  { id: 'large-intestine', label: 'Large intestine', pH: 6.2, displayPH: '5.5–7', caption: 'Water and selected ions are recovered as remaining material moves onward.', sideInputs: [], inAlimentaryCanal: true }
];

export const DIGESTIVE_ACCESSORY_ORGANS = [
  { id: 'liver', label: 'Liver', supportsStage: 'small-intestine', contribution: 'Produces bile that emulsifies fats.', foodPassesThrough: false },
  { id: 'gallbladder', label: 'Gallbladder', supportsStage: 'small-intestine', contribution: 'Stores and concentrates bile before release.', foodPassesThrough: false },
  { id: 'pancreas', label: 'Pancreas', supportsStage: 'small-intestine', contribution: 'Releases digestive enzymes and bicarbonate.', foodPassesThrough: false }
];

export function digestiveStageAt(index = 0) {
  const bounded = Math.max(0, Math.min(DIGESTIVE_STAGES.length - 1, Math.floor(Number(index) || 0)));
  return DIGESTIVE_STAGES[bounded];
}

export function nextDigestiveStage(index = 0) {
  return digestiveStageAt(index + 1);
}

export function previousDigestiveStage(index = 0) {
  return digestiveStageAt(index - 1);
}

export function accessorySupportAt(stageId) {
  return DIGESTIVE_ACCESSORY_ORGANS.filter((organ) => organ.supportsStage === stageId);
}

export function describeDigestiveStage(index = 0) {
  const stage = digestiveStageAt(index);
  return {
    stage: stage.id,
    stageLabel: stage.label,
    index: DIGESTIVE_STAGES.indexOf(stage),
    pH: stage.pH,
    caption: stage.caption,
    sideInputs: stage.sideInputs,
    accessorySupport: accessorySupportAt(stage.id).map((organ) => organ.label)
  };
}
