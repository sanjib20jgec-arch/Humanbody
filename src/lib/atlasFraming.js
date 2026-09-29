/**
 * Phase 28: shared framing contract for the certified atlas. Orientation
 * labels, preset yaw targets, and lighting presets are defined once here so
 * the 3D viewer, QC scripts, and future framing widgets cannot drift apart.
 * The atlas source is an adult-male macro-anatomy reference; framing presets
 * must never imply a clinical imaging plane or patient-specific orientation.
 */
export const ATLAS_ORIENTATIONS = [
  { id: 'front', label: 'FRONT VIEW', center: 0 },
  { id: 'right', label: 'RIGHT VIEW', center: Math.PI / 2 },
  { id: 'back', label: 'BACK VIEW', center: Math.PI },
  { id: 'left', label: 'LEFT VIEW', center: Math.PI * 1.5 }
];

export const ATLAS_THREE_QUARTER_LABEL = '3/4 VIEW';

export function orientationLabelForYaw(yaw = 0) {
  const normalized = ((yaw % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  if (normalized < Math.PI / 6 || normalized > Math.PI * 1.83) return ATLAS_ORIENTATIONS[0].label;
  if (normalized > Math.PI * 0.83 && normalized < Math.PI * 1.17) return ATLAS_ORIENTATIONS[2].label;
  if (normalized < Math.PI) return ATLAS_ORIENTATIONS[1].label;
  return ATLAS_ORIENTATIONS[3].label;
}

/**
 * Yaw targets for each canonical preset. The viewer's turntable applies yaw
 * to the anatomy root, so a preset is a single yaw value plus a small pitch.
 * Superior/inferior presets are recorded as unavailable until the pitch
 * clamp and camera path support them without misrepresenting anatomy.
 */
export const ATLAS_CAMERA_PRESETS = {
  anterior: { id: 'anterior', label: 'Anterior', yaw: 0.08, pitch: 0, available: true },
  lateral: { id: 'lateral', label: 'Lateral', yaw: -Math.PI / 2 + 0.08, pitch: 0.02, available: true },
  posterior: { id: 'posterior', label: 'Posterior', yaw: Math.PI + 0.08, pitch: 0, available: true },
  superior: { id: 'superior', label: 'Superior', yaw: 0.08, pitch: 0, available: false, note: 'Requires a dedicated top-down camera path before it can be exposed.' },
  inferior: { id: 'inferior', label: 'Inferior', yaw: 0.08, pitch: 0, available: false, note: 'Requires a dedicated bottom-up camera path before it can be exposed.' }
};

/**
 * Restrained lighting presets. Each preset is a named teaching context, not a
 * realism contest: contrast must keep system colors separable and selected
 * structures readable on the dark atlas background.
 */
export const ATLAS_LIGHTING_PRESETS = {
  neutralAtlas: {
    id: 'neutralAtlas',
    label: 'Neutral atlas',
    hemisphereIntensity: 1.55,
    keyIntensity: 2.65,
    fillIntensity: 1.35,
    rimIntensity: 1.5, // R5 (G5): rim dimmed ~30%
    exposure: 1.18
  },
  layerContrast: {
    id: 'layerContrast',
    label: 'Layer contrast',
    hemisphereIntensity: 1.35,
    keyIntensity: 2.85,
    fillIntensity: 1.15,
    rimIntensity: 1.2, // R5 (G5)
    exposure: 1.12
  },
  selectionFocus: {
    id: 'selectionFocus',
    label: 'Selection focus',
    hemisphereIntensity: 1.2,
    keyIntensity: 2.4,
    fillIntensity: 1.05,
    rimIntensity: 1.8, // R5 (G5)
    exposure: 1.22
  }
};

export function getAtlasLightingPreset(id = 'neutralAtlas') {
  return ATLAS_LIGHTING_PRESETS[id] || ATLAS_LIGHTING_PRESETS.neutralAtlas;
}
