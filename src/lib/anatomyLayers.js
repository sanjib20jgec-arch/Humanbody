/**
 * Shared atlas data extracted in Phase 59 so lightweight UI code (layer
 * labels, metadata fallbacks) does not drag the full rendering manager and
 * its three/examples dependencies into the viewer chunk.
 */
export const ANATOMY_LAYERS = {
  skeletal: { label: 'Skeletal system', systems: ['skeletal', 'connective'], opacity: 0.78, order: 10, accent: '#e6dfc4' },
  muscular: { label: 'Muscular system', systems: ['muscular'], opacity: 0.42, order: 20, accent: '#df8178' },
  arterial: { label: 'Arterial network', systems: ['arterial'], opacity: 0.82, order: 30, accent: '#f25d68' },
  venous: { label: 'Venous network', systems: ['venous'], opacity: 0.8, order: 40, accent: '#62b9d5' },
  nervous: { label: 'Nervous system', systems: ['nervous', 'sensory'], opacity: 0.96, order: 50, accent: '#e9a7b7' },
  visceral: { label: 'Digestive & visceral organs', systems: ['cardiac', 'respiratory', 'digestive', 'urinary', 'reproductive', 'endocrine', 'lymphatic'], opacity: 0.96, order: 60, accent: '#e9a178' }
};

export const SYSTEM_FUNCTIONS = {
  skeletal: ['Support, protection, movement leverage', 'Fractures, osteoporosis, and joint injury are common clinical considerations.'],
  muscular: ['Produces force for movement, posture, and heat', 'Strains, tears, and neuromuscular disorders can reduce force production.'],
  arterial: ['Carries blood away from the heart under higher pressure', 'Atherosclerosis and aneurysm can alter arterial flow.'],
  venous: ['Returns blood toward the heart and stores blood volume', 'Venous insufficiency and thrombosis can impair return.'],
  nervous: ['Coordinates sensation, decisions, and rapid responses', 'Injury or disease can interrupt signal transmission.'],
  sensory: ['Detects light, sound, touch, and chemical signals', 'Sensory loss depends on which receptor or pathway is affected.'],
  cardiac: ['Pumps blood through pulmonary and systemic circuits', 'The model is educational and not a diagnostic heart scan.'],
  respiratory: ['Moves air and exchanges oxygen and carbon dioxide', 'Airway obstruction and impaired gas exchange affect oxygen delivery.'],
  digestive: ['Digests food and absorbs nutrients', 'Inflammation or obstruction can alter digestion and absorption.'],
  urinary: ['Filters blood and helps regulate water and ions', 'Kidney disease can affect filtration and fluid balance.'],
  reproductive: ['Produces gametes and supports reproduction', 'This atlas is a simplified educational reference model.'],
  endocrine: ['Releases hormones that coordinate body processes', 'Hormone imbalance can affect multiple organ systems.'],
  lymphatic: ['Returns tissue fluid and supports immune defense', 'Lymphatic blockage can cause swelling and impaired immune transport.'],
  connective: ['Links, wraps, and stabilizes tissues', 'Scarring and connective-tissue disorders can change mobility.']
};

export function getAnatomyMetadataFallback(system = 'visceral') {
  const [primaryFunction, clinicalSignificance] = SYSTEM_FUNCTIONS[system] || SYSTEM_FUNCTIONS.cardiac;
  return { commonName: 'Certified human anatomy', latinName: 'BodyParts3D reference structure', conceptId: '—', id: '—', system, primaryFunction, clinicalSignificance, educationalModel: 'Simplified educational visualization' };
}
