export const ANATOMY_REGISTRY_VERSION = 2;

export const ANATOMY_REPRESENTATIONS = {
  sourceReference: 'source-reference',
  simplifiedTeaching: 'simplified-teaching',
  conceptualOverlay: 'conceptual-overlay'
};

export const ANATOMY_VIEW_PRESETS = {
  anterior: { id: 'anterior', label: 'Anterior', detail: 'front-facing reference orientation' },
  lateral: { id: 'lateral', label: 'Lateral', detail: 'side-facing reference orientation' },
  posterior: { id: 'posterior', label: 'Posterior', detail: 'back-facing reference orientation' }
};

const SOURCE_VIEW_PRESETS = ['anterior', 'lateral', 'posterior'];

const BODYPARTS3D = {
  dataset: 'BodyParts3D 4.0 adult-male reference atlas',
  url: 'https://dbarchive.biosciencedbc.jp/en/bodyparts3d/desc.html',
  license: 'CC BY 4.0',
  scale: 'macro-anatomy reference; not to scale for teaching overlays'
};

export const anatomyRegistry = {
  'heart-macro': {
    id: 'heart-macro',
    label: 'Heart and major vessels',
    moduleId: 'circulation',
    representation: ANATOMY_REPRESENTATIONS.sourceReference,
    source: BODYPARTS3D,
    evidenceId: 'evidence-heart-bodyparts3d',
    systems: ['cardiac', 'arterial', 'venous'],
    viewPresets: SOURCE_VIEW_PRESETS,
    focusStructures: ['right atrium', 'right ventricle', 'left atrium', 'left ventricle', 'major vessels'],
    limitation: 'The mesh provides macro-anatomy context; chamber flow, valve timing, pressure, and oxygen status are explained by separate learning models.',
    teachingModels: ['pulmonary/systemic flow', 'pressure-driven valves', 'oxygen status']
  },
  'digestive-macro': {
    id: 'digestive-macro',
    label: 'Digestive tract and accessory organs',
    moduleId: 'digestion',
    representation: ANATOMY_REPRESENTATIONS.sourceReference,
    source: BODYPARTS3D,
    evidenceId: 'evidence-digestive-bodyparts3d',
    systems: ['digestive'],
    viewPresets: SOURCE_VIEW_PRESETS,
    focusStructures: ['mouth', 'esophagus', 'stomach', 'small intestine', 'large intestine', 'liver', 'gallbladder', 'pancreas'],
    limitation: 'The mesh provides macro-anatomy context; food movement, pH, enzymes, absorption, and microscopic surface area are separate learning models.',
    teachingModels: ['food pathway', 'enzyme chemistry', 'absorption']
  },
  'respiratory-macro': {
    id: 'respiratory-macro',
    label: 'Airways and pulmonary structures',
    moduleId: 'respiration',
    representation: ANATOMY_REPRESENTATIONS.sourceReference,
    source: BODYPARTS3D,
    evidenceId: 'evidence-respiratory-bodyparts3d',
    absentStructures: ['lung-parenchyma', 'alveolar-surface'],
    systems: ['respiratory'],
    viewPresets: SOURCE_VIEW_PRESETS,
    focusStructures: ['nasal cavity', 'trachea', 'bronchi', 'pulmonary vessels'],
    limitation: 'The certified atlas does not provide lung-parenchyma detail; alveoli, gas exchange, and pressure mechanics are explicitly simplified teaching models.',
    teachingModels: ['airway route', 'alveolar exchange', 'ventilation pressure']
  },
  'kidney-macro': {
    id: 'kidney-macro',
    label: 'Kidneys and urinary structures',
    moduleId: 'excretion',
    representation: ANATOMY_REPRESENTATIONS.sourceReference,
    source: BODYPARTS3D,
    evidenceId: 'evidence-kidney-bodyparts3d',
    absentStructures: ['nephron'],
    systems: ['urinary'],
    viewPresets: SOURCE_VIEW_PRESETS,
    focusStructures: ['kidney', 'ureter', 'urinary bladder'],
    limitation: 'The source mesh is macro-anatomy; nephron filtration, reabsorption, secretion, and ADH effects are separate teaching models.',
    teachingModels: ['nephron flow', 'filtration', 'water recovery']
  },
  'nervous-macro': {
    id: 'nervous-macro',
    label: 'Brain and nervous-system structures',
    moduleId: 'nervous',
    representation: ANATOMY_REPRESENTATIONS.sourceReference,
    source: BODYPARTS3D,
    evidenceId: 'evidence-nervous-bodyparts3d',
    absentStructures: ['spinal-cord-parenchyma'],
    systems: ['nervous', 'sensory'],
    viewPresets: SOURCE_VIEW_PRESETS,
    focusStructures: ['cerebrum', 'cerebellum', 'brainstem', 'spinal cord', 'peripheral nerves'],
    limitation: 'The certified atlas does not provide complete spinal-cord parenchyma; signal pathways and reflex processing are separate simplified teaching models.',
    teachingModels: ['signal route', 'reflex arc', 'synapse']
  },
  'reproductive-macro': {
    id: 'reproductive-macro',
    label: 'Reproductive macro-anatomy',
    moduleId: 'reproduction',
    representation: ANATOMY_REPRESENTATIONS.sourceReference,
    source: BODYPARTS3D,
    evidenceId: 'evidence-reproductive-bodyparts3d',
    absentStructures: ['female-reproductive-anatomy', 'pediatric-anatomy'],
    systems: ['reproductive'],
    viewPresets: SOURCE_VIEW_PRESETS,
    focusStructures: ['reproductive structures in the reference atlas'],
    limitation: 'The source is an adult-male macro-anatomy reference; gametes, ovarian timing, hormones, and pregnancy are separate educational models and are not implied by the mesh.',
    teachingModels: ['gamete model', 'cycle timing', 'fertilization sequence']
  },
  'digestive-pathway': {
    id: 'digestive-pathway',
    label: 'Digestive pathway schematic',
    moduleId: 'digestion',
    representation: ANATOMY_REPRESENTATIONS.simplifiedTeaching,
    source: { dataset: 'OpenStax Anatomy & Physiology 2e', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/23-1-overview-of-the-digestive-system', license: 'CC BY 4.0', scale: 'conceptual schematic; not to scale' },
    evidenceId: 'evidence-digestive-openstax',
    systems: ['digestive'],
    focusStructures: ['alimentary canal', 'liver', 'pancreas', 'gallbladder'],
    limitation: 'The food route is shown separately from accessory organs; the schematic does not represent literal food travel through the liver, gallbladder, or pancreas.',
    teachingModels: ['food bolus marker', 'pH zones', 'enzyme activity']
  },
  'alveoli-teaching': {
    id: 'alveoli-teaching',
    label: 'Alveolar gas-exchange teaching model',
    moduleId: 'respiration',
    representation: ANATOMY_REPRESENTATIONS.simplifiedTeaching,
    source: { dataset: 'OpenStax Anatomy & Physiology 2e', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/22-4-gas-exchange', license: 'CC BY 4.0', scale: 'conceptual teaching model; enlarged for visibility' },
    evidenceId: 'evidence-alveoli-openstax',
    systems: ['respiratory'],
    focusStructures: ['alveoli', 'pulmonary capillaries'],
    limitation: 'The enlarged interface explains diffusion relationships and is not a literal scale reconstruction of lung tissue.',
    teachingModels: ['oxygen diffusion', 'carbon dioxide diffusion']
  }
};

export function getAnatomyReference(id) {
  return anatomyRegistry[id] || null;
}

export function validateAnatomyRegistry(registry = anatomyRegistry) {
  const errors = [];
  for (const [key, item] of Object.entries(registry || {})) {
    if (item.id !== key) errors.push(`${key}: id must match registry key`);
    if (!item.label) errors.push(`${key}: label is required`);
    if (!item.moduleId) errors.push(`${key}: moduleId is required`);
    if (!Object.values(ANATOMY_REPRESENTATIONS).includes(item.representation)) errors.push(`${key}: invalid representation type`);
    if (!item.source?.dataset || !item.source?.url || !item.source?.license || !item.source?.scale) errors.push(`${key}: source, license, and scale metadata are required`);
    if (!item.evidenceId) errors.push(`${key}: evidenceId is required so every visual claim resolves to the evidence ledger`);
    if (item.absentStructures && (!Array.isArray(item.absentStructures) || item.absentStructures.some((id) => typeof id !== 'string'))) errors.push(`${key}: absentStructures must be a list of absent-structure ids`);
    if (!Array.isArray(item.systems) || item.systems.length === 0) errors.push(`${key}: at least one system is required`);
    if (!Array.isArray(item.focusStructures) || item.focusStructures.length === 0) errors.push(`${key}: focusStructures are required`);
    if (item.representation === ANATOMY_REPRESENTATIONS.sourceReference) {
      if (!Array.isArray(item.viewPresets) || item.viewPresets.length < 3) errors.push(`${key}: source references require anterior, lateral, and posterior view presets`);
      for (const preset of item.viewPresets || []) if (!ANATOMY_VIEW_PRESETS[preset]) errors.push(`${key}: unknown view preset ${preset}`);
    }
    if (!item.limitation) errors.push(`${key}: limitation is required`);
    if (!Array.isArray(item.teachingModels) || item.teachingModels.length === 0) errors.push(`${key}: teachingModels are required`);
  }
  return errors;
}

export function getRegistrySummary(registry = anatomyRegistry) {
  const entries = Object.values(registry);
  return {
    total: entries.length,
    sourceReferences: entries.filter((item) => item.representation === ANATOMY_REPRESENTATIONS.sourceReference).length,
    simplifiedTeaching: entries.filter((item) => item.representation === ANATOMY_REPRESENTATIONS.simplifiedTeaching).length,
    modules: [...new Set(entries.map((item) => item.moduleId))]
  };
}
