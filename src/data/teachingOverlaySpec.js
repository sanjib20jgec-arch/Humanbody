/**
 * Canonical visual contract for source-linked teaching overlays.
 * A query resolves source anatomy; a claim describes the separate learning
 * model. This file intentionally contains no physiology values.
 */
export const TEACHING_CLAIMS = {
  sourceStructure: 'source-structure',
  sourceMarker: 'source-bound-marker',
  conceptualRoute: 'conceptual-route',
  normalizedModel: 'normalized-model',
  sourceNotAnimated: 'source-not-animated'
};

export const TEACHING_OVERLAY_SPEC = {
  circulation: {
    registryId: 'heart-macro',
    evidence: ['evidence-heart-bodyparts3d'],
    routeDisclosure: 'Route lines and pulse markers are conceptual teaching overlays. They do not show literal blood volume, velocity, or imaging flow.',
    sourceClaims: ['source-structure', 'source-bound-marker', 'source-not-animated'],
    modelClaims: ['conceptual-route', 'normalized-model'],
    stages: ['systemic-return', 'pulmonary-send', 'pulmonary-return', 'systemic-send'],
    // Authored waypoints bend conceptual routes through the valve plane that
    // the chamber-center polyline would otherwise skip (Phase 29).
    stageWaypoints: {
      'pulmonary-send': ['anterior leaflet of tricuspid valve'],
      'systemic-send': ['anterior leaflet of mitral valve']
    },
    anchors: {
      chambers: ['cavity of right atrium', 'cavity of right ventricle', 'cavity of left atrium', 'cavity of left ventricle'],
      transitions: ['superior vena cava', 'pulmonary trunk', 'pulmonary vein', 'ascending aorta'],
      valves: {
        mitral: ['anterior leaflet of mitral valve', 'posterior leaflet of mitral valve'],
        tricuspid: ['anterior leaflet of tricuspid valve', 'posterior leaflet of tricuspid valve', 'septal leaflet of tricuspid valve'],
        aortic: ['anterior cusp of aortic valve', 'left posterior cusp of aortic valve', 'right posterior cusp of aortic valve'],
        pulmonary: ['left anterior cusp of pulmonary valve', 'right anterior cusp of pulmonary valve', 'posterior cusp of pulmonary valve']
      }
    }
  },
  digestion: {
    registryId: 'digestive-macro',
    evidence: ['evidence-digestive-bodyparts3d', 'evidence-digestive-openstax'],
    routeDisclosure: 'The food route is conceptual and stays separate from accessory organs. It does not imply food passes through the liver, gallbladder, or pancreas.',
    sourceClaims: ['source-structure', 'source-bound-marker', 'source-not-animated'],
    modelClaims: ['conceptual-route', 'normalized-model'],
    stages: ['mouth', 'esophagus', 'stomach', 'small-intestine', 'large-intestine'],
    stageWaypoints: {
      'small-intestine': ['duodenum']
    },
    anchors: {
      route: ['esophagus', 'stomach', 'duodenum', 'colon']
    }
  }
};

export function getTeachingOverlaySpec(id) {
  return TEACHING_OVERLAY_SPEC[id] || null;
}
