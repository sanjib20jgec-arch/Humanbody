export const EVIDENCE_REVIEW_STATES = {
  sourceCited: 'source-cited',
  pendingHuman: 'pending-human',
  approved: 'approved'
};

export const ANATOMY_EVIDENCE = {
  'evidence-heart-bodyparts3d': {
    id: 'evidence-heart-bodyparts3d',
    claimType: 'source-fact',
    source: { dataset: 'BodyParts3D 4.0', url: 'https://dbarchive.biosciencedbc.jp/en/bodyparts3d/desc.html', license: 'CC BY 4.0' },
    claim: 'Adult-male macro-anatomy source reference for heart and major vessels.',
    limitation: 'Does not certify animated physiology, pressure, valve timing, or population variation.',
    scientificReview: EVIDENCE_REVIEW_STATES.sourceCited,
    visualReview: EVIDENCE_REVIEW_STATES.pendingHuman
  },
  'evidence-digestive-bodyparts3d': {
    id: 'evidence-digestive-bodyparts3d',
    claimType: 'source-fact',
    source: { dataset: 'BodyParts3D 4.0', url: 'https://dbarchive.biosciencedbc.jp/en/bodyparts3d/desc.html', license: 'CC BY 4.0' },
    claim: 'Adult-male macro-anatomy source reference for digestive organs.',
    limitation: 'Does not certify food movement, enzyme chemistry, absorption, or microscopic surfaces.',
    scientificReview: EVIDENCE_REVIEW_STATES.sourceCited,
    visualReview: EVIDENCE_REVIEW_STATES.pendingHuman
  },
  'evidence-respiratory-bodyparts3d': {
    id: 'evidence-respiratory-bodyparts3d',
    claimType: 'source-fact',
    source: { dataset: 'BodyParts3D 4.0', url: 'https://dbarchive.biosciencedbc.jp/en/bodyparts3d/desc.html', license: 'CC BY 4.0' },
    claim: 'Adult-male macro-anatomy source reference for airway and pulmonary structures present in the atlas.',
    limitation: 'No lung-parenchyma mesh is claimed; alveolar exchange remains a separate enlarged teaching model.',
    scientificReview: EVIDENCE_REVIEW_STATES.sourceCited,
    visualReview: EVIDENCE_REVIEW_STATES.pendingHuman
  },
  'evidence-kidney-bodyparts3d': {
    id: 'evidence-kidney-bodyparts3d',
    claimType: 'source-fact',
    source: { dataset: 'BodyParts3D 4.0', url: 'https://dbarchive.biosciencedbc.jp/en/bodyparts3d/desc.html', license: 'CC BY 4.0' },
    claim: 'Adult-male macro-anatomy source reference for kidney and urinary structures.',
    limitation: 'Does not certify nephron-scale filtration or fluid-regulation models.',
    scientificReview: EVIDENCE_REVIEW_STATES.sourceCited,
    visualReview: EVIDENCE_REVIEW_STATES.pendingHuman
  },
  'evidence-nervous-bodyparts3d': {
    id: 'evidence-nervous-bodyparts3d',
    claimType: 'source-fact',
    source: { dataset: 'BodyParts3D 4.0', url: 'https://dbarchive.biosciencedbc.jp/en/bodyparts3d/desc.html', license: 'CC BY 4.0' },
    claim: 'Adult-male macro-anatomy source reference for mapped brain and nervous-system structures.',
    limitation: 'Does not certify complete spinal-cord parenchyma or neural signaling animation.',
    scientificReview: EVIDENCE_REVIEW_STATES.sourceCited,
    visualReview: EVIDENCE_REVIEW_STATES.pendingHuman
  },
  'evidence-reproductive-bodyparts3d': {
    id: 'evidence-reproductive-bodyparts3d',
    claimType: 'source-fact',
    source: { dataset: 'BodyParts3D 4.0', url: 'https://dbarchive.biosciencedbc.jp/en/bodyparts3d/desc.html', license: 'CC BY 4.0' },
    claim: 'Adult-male macro-anatomy source reference for the mapped reproductive system.',
    limitation: 'Does not represent female anatomy, gamete formation, cycle timing, pregnancy, or variation.',
    scientificReview: EVIDENCE_REVIEW_STATES.sourceCited,
    visualReview: EVIDENCE_REVIEW_STATES.pendingHuman
  },
  'evidence-digestive-openstax': {
    id: 'evidence-digestive-openstax',
    claimType: 'conceptual-model',
    source: { dataset: 'OpenStax Anatomy & Physiology 2e', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/23-1-overview-of-the-digestive-system', license: 'CC BY 4.0' },
    claim: 'Conceptual alimentary-canal and accessory-organ teaching schematic.',
    limitation: 'Not a literal scale reconstruction or a claim that food passes through accessory organs.',
    scientificReview: EVIDENCE_REVIEW_STATES.sourceCited,
    visualReview: EVIDENCE_REVIEW_STATES.pendingHuman
  },
  'evidence-alveoli-openstax': {
    id: 'evidence-alveoli-openstax',
    claimType: 'conceptual-model',
    source: { dataset: 'OpenStax Anatomy & Physiology 2e', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/22-4-gas-exchange', license: 'CC BY 4.0' },
    claim: 'Enlarged conceptual alveolar-capillary diffusion teaching model.',
    limitation: 'Not a literal scale reconstruction of lung tissue or a clinical image.',
    scientificReview: EVIDENCE_REVIEW_STATES.sourceCited,
    visualReview: EVIDENCE_REVIEW_STATES.pendingHuman
  }
};

export const CLAIM_TYPE_BY_REPRESENTATION = {
  'source-reference': 'source-fact',
  'simplified-teaching': 'conceptual-model',
  'conceptual-overlay': 'conceptual-model'
};

export function getAnatomyEvidence(id) {
  return ANATOMY_EVIDENCE[id] || null;
}

/**
 * Phase 26 contract: every registry entry and teaching route must resolve to
 * an evidence record whose claim type matches its representation. A claim is
 * never stronger than its weakest review state.
 */
export function validateEvidenceConsistency(registry = {}, spec = {}) {
  const errors = [];
  const ids = Object.keys(ANATOMY_EVIDENCE);
  if (!ids.length) errors.push('anatomy evidence ledger is empty');
  ids.forEach((id) => {
    const record = ANATOMY_EVIDENCE[id];
    if (!record.source?.dataset || !record.source?.url || !record.source?.license) errors.push(`${id}: evidence record needs dataset, url, and license`);
    if (!record.claim) errors.push(`${id}: evidence record needs a claim`);
    if (!record.limitation) errors.push(`${id}: evidence record needs an explicit limitation`);
    if (!Object.values(EVIDENCE_REVIEW_STATES).includes(record.scientificReview)) errors.push(`${id}: invalid scientific review state`);
    if (!Object.values(EVIDENCE_REVIEW_STATES).includes(record.visualReview)) errors.push(`${id}: invalid visual review state`);
    // Automated checks may cite sources, but they must never set approval.
    if (record.visualReview === EVIDENCE_REVIEW_STATES.approved && !record.visualReviewer) errors.push(`${id}: visual approval requires a named human reviewer`);
    if (record.scientificReview === EVIDENCE_REVIEW_STATES.approved && !record.scientificReviewer) errors.push(`${id}: scientific approval requires a named human reviewer`);
  });
  Object.entries(registry || {}).forEach(([key, item]) => {
    if (!item.evidenceId) { errors.push(`${key}: registry entry is missing evidenceId`); return; }
    const evidence = ANATOMY_EVIDENCE[item.evidenceId];
    if (!evidence) { errors.push(`${key}: evidenceId ${item.evidenceId} is not in the evidence ledger`); return; }
    const expectedType = CLAIM_TYPE_BY_REPRESENTATION[item.representation];
    if (expectedType && evidence.claimType !== expectedType) errors.push(`${key}: evidence claim type ${evidence.claimType} does not match representation ${item.representation}`);
  });
  Object.entries(spec || {}).forEach(([routeId, route]) => {
    (route.evidence || []).forEach((evidenceId) => {
      if (!ANATOMY_EVIDENCE[evidenceId]) errors.push(`${routeId}: teaching route references unknown evidence ${evidenceId}`);
    });
    if (!(route.evidence || []).length) errors.push(`${routeId}: teaching route needs at least one evidence reference`);
    if (!route.routeDisclosure) errors.push(`${routeId}: teaching route needs an explicit route disclosure`);
  });
  return errors;
}
