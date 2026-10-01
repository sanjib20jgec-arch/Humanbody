/**
 * Reviewed conceptual sources for modules that intentionally do not claim a
 * certified 3D anatomy asset. These records keep the source boundary visible
 * in the learning bays while separate 3D review remains pending.
 */
export const CONCEPTUAL_SOURCE_REVIEW = {
  cell: {
    moduleId: 'cell',
    label: 'Cell Structure',
    source: { title: 'OpenStax Anatomy & Physiology 2e · The Cytoplasm and Cellular Organelles', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/3-2-the-cytoplasm-and-cellular-organelles', license: 'CC BY 4.0' },
    scope: 'Organelle names and broad structure–function relationships support the conceptual cell explorer.',
    threeDStatus: 'No reviewed 3D source approved; the cell view is a conceptual educational model.'
  },
  tissues: {
    moduleId: 'tissues',
    label: 'Tissues',
    source: { title: 'OpenStax Anatomy & Physiology 2e · Types of Tissues', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/4-1-types-of-tissues', license: 'CC BY 4.0' },
    scope: 'The four broad tissue categories and their organizing principles support the pattern explorer.',
    threeDStatus: 'No reviewed 3D source approved; the tissue view is a simplified pattern model.'
  },
  heredity: {
    moduleId: 'heredity',
    label: 'Heredity',
    source: { title: 'OpenStax Biology 2e · Characteristics and Traits', url: 'https://openstax.org/books/biology-2e/pages/12-2-characteristics-and-traits', license: 'CC BY 4.0' },
    scope: 'Gene, allele, genotype, phenotype, and simple dominance terminology support the inheritance model.',
    threeDStatus: 'No reviewed 3D source approved; the heredity view is a symbolic information model.'
  },
  evolution: {
    moduleId: 'evolution',
    label: 'Evolution',
    source: { title: 'OpenStax Biology 2e · Understanding Evolution', url: 'https://openstax.org/books/biology-2e/pages/18-1-understanding-evolution', license: 'CC BY 4.0' },
    scope: 'Variation, natural selection, homologous structures and common ancestry support the selection model.',
    threeDStatus: 'No reviewed 3D source approved; evolution scenes are procedural teaching models.'
  },
  environment: {
    moduleId: 'environment',
    label: 'Environment',
    source: { title: 'OpenStax Biology 2e · Energy Flow through Ecosystems', url: 'https://openstax.org/books/biology-2e/pages/46-2-energy-flow-through-ecosystems', license: 'CC BY 4.0' },
    scope: 'Trophic levels and transfer efficiency support the energy-flow model.',
    threeDStatus: 'No reviewed 3D source approved; ecology scenes are procedural teaching models.'
  }
};

export function getConceptualSourceReview(moduleId) {
  return CONCEPTUAL_SOURCE_REVIEW[moduleId] || null;
}

export function validateConceptualSourceReview(records = CONCEPTUAL_SOURCE_REVIEW) {
  const errors = [];
  Object.entries(records).forEach(([key, item]) => {
    if (item.moduleId !== key) errors.push(`${key}: moduleId must match key`);
    if (!item.source?.title || !item.source?.url || !item.source?.license) errors.push(`${key}: source title, URL, and license are required`);
    if (!item.scope || !item.threeDStatus) errors.push(`${key}: scope and 3D status are required`);
  });
  return errors;
}
