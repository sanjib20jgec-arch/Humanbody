/**
 * Phase 27 contract: structures that learners might expect but that are NOT
 * present in the certified BodyParts3D adult-male atlas. Recording absence
 * explicitly prevents a viewer from mistaking missing geometry for anatomy
 * that is "hidden" or from approving visual claims the source cannot support.
 */
export const ABSENT_STRUCTURES = {
  'lung-parenchyma': {
    id: 'lung-parenchyma',
    label: 'Lung parenchyma',
    systems: ['respiratory'],
    reason: 'The macro-anatomy source provides airway and pulmonary-vessel geometry, not lung-tissue volume.',
    disclosure: 'Alveolar gas exchange is shown only in the separate enlarged teaching model.'
  },
  'alveolar-surface': {
    id: 'alveolar-surface',
    label: 'Alveolar surface',
    systems: ['respiratory'],
    reason: 'Microscopic exchange surfaces are below the resolution of the macro-anatomy reference.',
    disclosure: 'The alveolar interface is a conceptual teaching model, not atlas geometry.'
  },
  'spinal-cord-parenchyma': {
    id: 'spinal-cord-parenchyma',
    label: 'Spinal cord parenchyma',
    systems: ['nervous'],
    reason: 'The atlas maps peripheral nerves and brain structures; continuous spinal-cord parenchyma is not certified.',
    disclosure: 'Signal pathways through the cord are simplified teaching models.'
  },
  nephron: {
    id: 'nephron',
    label: 'Nephron',
    systems: ['urinary'],
    reason: 'Filtration units are microscopic and not part of the macro-anatomy source.',
    disclosure: 'Nephron flow, filtration, and water recovery are separate teaching models.'
  },
  'female-reproductive-anatomy': {
    id: 'female-reproductive-anatomy',
    label: 'Female reproductive anatomy',
    systems: ['reproductive'],
    reason: 'BodyParts3D is an adult-male reference; female anatomy is not represented.',
    disclosure: 'The reproductive module must not imply female anatomy, ovarian timing, or pregnancy from this mesh.'
  },
  'pediatric-anatomy': {
    id: 'pediatric-anatomy',
    label: 'Pediatric anatomy',
    systems: [],
    reason: 'The source is an adult reference; child proportions and developmental anatomy are absent.',
    disclosure: 'No pediatric scale, proportion, or developmental claim is supported by this atlas.'
  },
  'intestinal-villi': {
    id: 'intestinal-villi',
    label: 'Intestinal villi and microvilli',
    systems: ['digestive'],
    reason: 'Absorptive surface structures are microscopic and absent from the macro-anatomy source.',
    disclosure: 'Absorption teaching uses a separate conceptual model.'
  }
};

export function getAbsentStructure(id) {
  return ABSENT_STRUCTURES[id] || null;
}
