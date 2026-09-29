/**
 * Phase 40: rendering-mode registry and per-tier capability flags.
 *
 * Every rendering mode that can change how anatomy is perceived is
 * registered here with what it shows and what it must never imply. Heavy
 * techniques are desktop-flagged; the battery tier keeps the clean pipeline.
 */
export const RENDERING_TIERS = {
  sharp: { environment: true, postprocessing: true, outlines: true, xray: true, clipping: true },
  balanced: { environment: true, postprocessing: true, outlines: true, xray: true, clipping: true },
  battery: { environment: false, postprocessing: false, outlines: true, xray: true, clipping: true }
};

export function resolveRenderingCapabilities(qualityId = 'balanced', lowPower = false) {
  if (lowPower) return { ...RENDERING_TIERS.battery, tier: 'battery' };
  const tier = RENDERING_TIERS[qualityId] || RENDERING_TIERS.balanced;
  return { ...tier, tier: RENDERING_TIERS[qualityId] ? qualityId : 'balanced' };
}

export const RENDERING_MODES = {
  environment: {
    id: 'environment',
    label: 'Environment lighting',
    shows: 'Physically-based ambient shading from a neutral studio environment.',
    neverImplies: 'No anatomical detail is added; lighting changes appearance, not structure.',
    disclosure: 'Lighting enhancement only.'
  },
  ssao: {
    id: 'ssao',
    label: 'Ambient occlusion',
    shows: 'Contact shadowing that emphasizes depth between existing surfaces.',
    neverImplies: 'Shading must never read as cavities, lesions, or internal anatomy.',
    disclosure: 'Depth-shading enhancement only.'
  },
  outlines: {
    id: 'outlines',
    label: 'Silhouette outlines',
    shows: 'Contour lines around selected and hovered structures.',
    neverImplies: 'Outlines follow source geometry bounds; they are not dissection borders.',
    disclosure: 'Readability aid only.'
  },
  xray: {
    id: 'xray',
    label: 'X-ray ghost mode',
    shows: 'Fresnel-based translucency on loaded layers so deeper loaded layers stay visible.',
    neverImplies: 'This is a visualization mode, not imaging; hidden structures are not fabricated.',
    disclosure: 'Visualization mode — not imaging.'
  },
  clipping: {
    id: 'clipping',
    label: 'Section plane',
    shows: 'A geometric clipping plane through the loaded atlas mesh.',
    neverImplies: 'The open cut must not imply internal parenchyma or cross-sectional anatomy the source lacks.',
    disclosure: 'Section view — no implied internal anatomy.'
  },
  isolation: {
    id: 'isolation',
    label: 'Structure isolation',
    shows: 'One certified part rendered alone while other layers are hidden.',
    neverImplies: 'Isolation is a view state; the hidden anatomy remains part of the reference.',
    disclosure: 'View state only.'
  },
  tours: {
    id: 'tours',
    label: 'Guided tours',
    shows: 'Deterministic walkthroughs of teaching stages and camera framings.',
    neverImplies: 'Tour captions are teaching claims tied to the evidence ledger, not source motion.',
    disclosure: 'Guided teaching sequence.'
  },
  measurement: {
    id: 'measurement',
    label: 'Educational measurement',
    shows: 'Relative distances between certified part bounds.',
    neverImplies: 'Not clinical measurement; values are atlas-scale approximations.',
    disclosure: 'Educational scale — not clinical.'
  },
  musclePulse: {
    id: 'musclePulse',
    label: 'Contraction pulse',
    shows: 'A labeled conceptual contraction pulse on the selected muscle part overlay.',
    neverImplies: 'The source mesh does not move; this is a teaching cue, not anatomical motion.',
    disclosure: 'Conceptual teaching cue.'
  },
  labelQuiz: {
    id: 'labelQuiz',
    label: 'Pin-label quiz',
    shows: 'Identification questions over loaded certified parts.',
    neverImplies: 'Quiz correctness reflects atlas labels, not clinical identification skill.',
    disclosure: 'Atlas label practice.'
  }
};

export function getRenderingMode(id) {
  return RENDERING_MODES[id] || null;
}
