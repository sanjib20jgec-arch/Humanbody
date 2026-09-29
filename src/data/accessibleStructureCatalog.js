/**
 * Phase 31: structure-level catalog for the accessible (non-WebGL) atlas
 * route. Every entry resolves to a real certified BodyParts3D part through
 * `sourceQuery`, so the keyboard route exposes the same semantic structures
 * the 3D raycast selector does — not just system summaries.
 */
export const ACCESSIBLE_STRUCTURE_CATALOG = {
  circulation: {
    systemId: 'circulation',
    systems: ['cardiac', 'arterial', 'venous'],
    evidenceId: 'evidence-heart-bodyparts3d',
    structures: [
      { id: 'acc-right-atrium', name: 'Cavity of right atrium', sourceQuery: 'cavity of right atrium', conceptId: 'FMA11359', function: 'Entry chamber for oxygen-poor blood returning from the body.', limitation: 'Macro-anatomy context only; flow and pressure come from the separate educational model.' },
      { id: 'acc-left-ventricle', name: 'Cavity of left ventricle', sourceQuery: 'cavity of left ventricle', conceptId: 'FMA9466', function: 'Main systemic pump chamber for oxygen-rich blood.', limitation: 'The source mesh is static; contraction is a teaching model, not animated source anatomy.' },
      { id: 'acc-mitral-valve', name: 'Anterior leaflet of mitral valve', sourceQuery: 'mitral valve', conceptId: 'FMA7242', function: 'One of the leaflets that keeps blood moving from left atrium to left ventricle.', limitation: 'Valve opening/closing shown by markers is pressure-model output, not imaged motion.' },
      { id: 'acc-aorta', name: 'Ascending aorta', sourceQuery: 'ascending aorta', conceptId: 'FMA3736', function: 'First systemic artery carrying oxygen-rich blood from the left ventricle.', limitation: 'Pulse and pressure waves are educational overlays.' },
      { id: 'acc-vena-cava', name: 'Superior vena cava', sourceQuery: 'superior vena cava', conceptId: 'FMA4720', function: 'Returns oxygen-poor blood from the upper body to the right atrium.', limitation: 'Flow direction is taught by the conceptual route, not measured flow.' },
      { id: 'acc-pulmonary-trunk', name: 'Pulmonary trunk', sourceQuery: 'pulmonary trunk', conceptId: 'FMA8612', function: 'Carries oxygen-poor blood from the right ventricle toward the lungs.', limitation: 'Oxygen status coloring is a teaching convention.' }
    ]
  },
  digestion: {
    systemId: 'digestion',
    systems: ['digestive'],
    evidenceId: 'evidence-digestive-bodyparts3d',
    structures: [
      { id: 'acc-tongue', name: 'Tongue', sourceQuery: 'tongue', conceptId: 'FMA54640', function: 'Mixes food and starts swallowing.', limitation: 'Taste and muscle detail are beyond the macro-anatomy scope.' },
      { id: 'acc-esophagus', name: 'Esophagus', sourceQuery: 'esophagus', conceptId: 'FMA7131', function: 'Moves the bolus toward the stomach.', limitation: 'Peristalsis is a teaching model, not source animation.' },
      { id: 'acc-stomach', name: 'Stomach', sourceQuery: 'stomach', conceptId: 'FMA7148', function: 'Acid and enzyme compartment that begins protein digestion.', limitation: 'pH and enzyme chemistry are separate simplified models.' },
      { id: 'acc-duodenum', name: 'Duodenum', sourceQuery: 'duodenum', conceptId: 'FMA7206', function: 'First small-intestine segment receiving bile and pancreatic juice.', limitation: 'Accessory organs support this segment; food does not pass through them.' },
      { id: 'acc-jejunum', name: 'Proximal part of jejunum', sourceQuery: 'jejunum', conceptId: 'FMA16981', function: 'Major site of nutrient absorption.', limitation: 'Villi and microvilli are microscopic and absent from this atlas.' },
      { id: 'acc-ileum', name: 'Proximal part of ileum', sourceQuery: 'ileum', conceptId: 'FMA14964', function: 'Continues absorption before material enters the large intestine.', limitation: 'Surface-area claims belong to the conceptual model.' },
      { id: 'acc-colon', name: 'Ascending colon', sourceQuery: 'colon', conceptId: 'FMA14545', function: 'Recovers water and ions from remaining material.', limitation: 'Microbiome activity is outside this atlas scope.' },
      { id: 'acc-rectum', name: 'Rectum', sourceQuery: 'rectum', conceptId: 'FMA14544', function: 'Stores material before elimination.', limitation: 'Sphincter control is not animated by the source mesh.' },
      { id: 'acc-pancreas', name: 'Pancreas', sourceQuery: 'pancreas', conceptId: 'FMA7198', function: 'Accessory organ releasing enzymes and bicarbonate into the duodenum.', limitation: 'Not part of the food route; enzyme kinetics are a separate model.' },
      { id: 'acc-gallbladder', name: 'Gallbladder', sourceQuery: 'gallbladder', conceptId: 'FMA7202', function: 'Stores and concentrates bile.', limitation: 'Bile release timing is not claimed by the source mesh.' },
      { id: 'acc-liver', name: 'Caudate lobe of liver', sourceQuery: 'liver', conceptId: 'FMA13365', function: 'Liver lobe; the liver produces bile and processes absorbed nutrients.', limitation: 'Metabolic detail is beyond macro-anatomy scope.' }
    ]
  },
  respiration: {
    systemId: 'respiration',
    systems: ['respiratory'],
    evidenceId: 'evidence-respiratory-bodyparts3d',
    structures: [
      { id: 'acc-trachea', name: 'Trachea', sourceQuery: 'trachea', conceptId: 'FMA7394', function: 'Main airway between the larynx and the bronchi.', limitation: 'Airflow pressure and ventilation are teaching models.' },
      { id: 'acc-bronchus', name: 'Left main bronchus', sourceQuery: 'bronchus', conceptId: 'FMA7396', function: 'Carries air into the left lung.', limitation: 'Lung parenchyma is absent from the atlas; airways are shown without tissue volume.' },
      { id: 'acc-pulmonary-vein', name: 'Left superior pulmonary vein', sourceQuery: 'pulmonary vein', conceptId: 'FMA49916', function: 'Returns oxygen-rich blood from the lungs to the left atrium.', limitation: 'Gas exchange itself is shown only in the enlarged conceptual model.' }
    ]
  },
  excretion: {
    systemId: 'excretion',
    systems: ['urinary'],
    evidenceId: 'evidence-kidney-bodyparts3d',
    structures: [
      { id: 'acc-kidney', name: 'Left kidney', sourceQuery: 'kidney', conceptId: 'FMA7205', function: 'Filters blood and helps regulate water and ions.', limitation: 'Nephrons are microscopic and absent; filtration is a teaching model.' },
      { id: 'acc-ureter', name: 'Left ureter', sourceQuery: 'ureter', conceptId: 'FMA15572', function: 'Carries urine from the kidney to the bladder.', limitation: 'Peristaltic transport is not animated in the source mesh.' },
      { id: 'acc-bladder', name: 'Urinary bladder', sourceQuery: 'urinary bladder', conceptId: 'FMA15900', function: 'Stores urine before elimination.', limitation: 'Volume and control dynamics are not claimed by the mesh.' }
    ]
  },
  nervous: {
    systemId: 'nervous',
    systems: ['nervous', 'sensory'],
    evidenceId: 'evidence-nervous-bodyparts3d',
    structures: [
      { id: 'acc-cerebellum', name: 'Cerebellum', sourceQuery: 'cerebellum', conceptId: 'FMA67944', function: 'Coordinates movement, balance, and motor learning.', limitation: 'Signal pathways are simplified teaching models.' },
      { id: 'acc-spinal-canal', name: 'Central canal of spinal cord', sourceQuery: 'spinal cord', conceptId: 'FMA78497', function: 'Landmark inside the spinal cord region.', limitation: 'Complete spinal-cord parenchyma is absent from this atlas; reflex routes are conceptual.' }
    ]
  },
  reproduction: {
    systemId: 'reproduction',
    systems: ['reproductive'],
    evidenceId: 'evidence-reproductive-bodyparts3d',
    structures: [
      { id: 'acc-testis', name: 'Left testis', sourceQuery: 'testis', conceptId: 'FMA7212', function: 'Produces sperm and testosterone in the adult-male reference.', limitation: 'Gamete formation is a separate educational model.' },
      { id: 'acc-prostate', name: 'Prostate', sourceQuery: 'prostate', conceptId: 'FMA9600', function: 'Accessory gland of the male reproductive tract.', limitation: 'Hormonal and cycle timing are not represented by this mesh.' }
    ]
  }
};

export function getAccessibleStructures(systemId) {
  return ACCESSIBLE_STRUCTURE_CATALOG[systemId]?.structures || [];
}
