// Range-of-motion reference data (Movement Theater Masterplan §3.4).
//
// Two kinds of reference live here and they must not be confused:
//
//   1. AAOS_ROM — passive/active range of motion for a single joint measured in
//      a clinical exam, in the anatomical zero reference position.
//      Source: American Academy of Orthopaedic Surgeons, "Joint Motion:
//      Method of Measuring and Recording" (1965); the table reproduced in
//      standard kinesiology texts (e.g. Norkin & White, "Measurement of Joint
//      Motion"). Values are degrees; `hyper` is the small physiological
//      hyperextension some references allow and is displayed as a note only.
//
//   2. GAIT_BANDS — the range a joint travels through *during one gait cycle*,
//      as piecewise keypoints over %cycle. This is deliberately NOT the AAOS
//      band: a healthy walk uses a fraction of available range.
//      Source: teaching estimates after the Rancho Los Amigos (RLA)
//      observational gait analysis convention, as summarised in
//      Perry & Burnfield, "Gait Analysis: Normal and Pathological Function"
//      (2nd ed., 2010), ch. 2. `margin` widens the keypoint band for display.
//
// Every band carries its citation so the UI can show provenance rather than an
// unexplained shaded area. Nothing here is a clinical measurement.

export const ROM_SOURCES = {
  aaos: 'AAOS, Joint Motion: Method of Measuring and Recording (1965)',
  gait: 'Perry & Burnfield, Gait Analysis (2nd ed., 2010) — RLA convention'
};

/**
 * Anatomical zero reference used by every entry below: the standard
 * anatomical position (standing, arms at sides, palms forward, feet together).
 * Flexion/abduction/dorsiflexion/supination/pronation-to-neutral are positive
 * by convention; extension/adduction/plantarflexion are reported signed.
 */
export const ZERO_REFERENCE = 'Anatomical position (standing, arms at side, palms forward)';

export const AAOS_ROM = [
  { id: 'shoulder.flexion', joint: 'Shoulder', motion: 'Flexion', plane: 'Sagittal', min: 0, max: 180, hyper: 0, isbAxis: 'thorax-humerus X' },
  { id: 'shoulder.extension', joint: 'Shoulder', motion: 'Extension', plane: 'Sagittal', min: 0, max: 60, hyper: 0, isbAxis: 'thorax-humerus X' },
  { id: 'shoulder.abduction', joint: 'Shoulder', motion: 'Abduction', plane: 'Frontal', min: 0, max: 180, hyper: 0, isbAxis: 'thorax-humerus Z' },
  { id: 'shoulder.adduction', joint: 'Shoulder', motion: 'Adduction', plane: 'Frontal', min: 0, max: 45, hyper: 0, isbAxis: 'thorax-humerus Z' },
  { id: 'shoulder.internalRotation', joint: 'Shoulder', motion: 'Internal rotation', plane: 'Transverse', min: 0, max: 70, hyper: 0, isbAxis: 'humerus Y' },
  { id: 'shoulder.externalRotation', joint: 'Shoulder', motion: 'External rotation', plane: 'Transverse', min: 0, max: 90, hyper: 0, isbAxis: 'humerus Y' },
  { id: 'elbow.flexion', joint: 'Elbow', motion: 'Flexion', plane: 'Sagittal', min: 0, max: 140, hyper: 10, isbAxis: 'humerus-ulna X' },
  { id: 'forearm.pronation', joint: 'Forearm', motion: 'Pronation', plane: 'Transverse', min: 0, max: 80, hyper: 0, isbAxis: 'radius-ulna Y' },
  { id: 'forearm.supination', joint: 'Forearm', motion: 'Supination', plane: 'Transverse', min: 0, max: 80, hyper: 0, isbAxis: 'radius-ulna Y' },
  { id: 'wrist.flexion', joint: 'Wrist', motion: 'Flexion', plane: 'Sagittal', min: 0, max: 80, hyper: 0, isbAxis: 'radius-hand X' },
  { id: 'wrist.extension', joint: 'Wrist', motion: 'Extension', plane: 'Sagittal', min: 0, max: 70, hyper: 0, isbAxis: 'radius-hand X' },
  { id: 'hip.flexion', joint: 'Hip', motion: 'Flexion', plane: 'Sagittal', min: 0, max: 120, hyper: 0, isbAxis: 'pelvis-femur X' },
  { id: 'hip.extension', joint: 'Hip', motion: 'Extension', plane: 'Sagittal', min: 0, max: 30, hyper: 0, isbAxis: 'pelvis-femur X' },
  { id: 'hip.abduction', joint: 'Hip', motion: 'Abduction', plane: 'Frontal', min: 0, max: 45, hyper: 0, isbAxis: 'pelvis-femur Z' },
  { id: 'hip.adduction', joint: 'Hip', motion: 'Adduction', plane: 'Frontal', min: 0, max: 30, hyper: 0, isbAxis: 'pelvis-femur Z' },
  { id: 'hip.internalRotation', joint: 'Hip', motion: 'Internal rotation', plane: 'Transverse', min: 0, max: 45, hyper: 0, isbAxis: 'femur Y' },
  { id: 'hip.externalRotation', joint: 'Hip', motion: 'External rotation', plane: 'Transverse', min: 0, max: 45, hyper: 0, isbAxis: 'femur Y' },
  { id: 'knee.flexion', joint: 'Knee', motion: 'Flexion', plane: 'Sagittal', min: 0, max: 135, hyper: 10, isbAxis: 'femur-tibia X (floating axis)' },
  { id: 'ankle.dorsiflexion', joint: 'Ankle', motion: 'Dorsiflexion', plane: 'Sagittal', min: 0, max: 20, hyper: 0, isbAxis: 'tibia-foot X' },
  { id: 'ankle.plantarflexion', joint: 'Ankle', motion: 'Plantarflexion', plane: 'Sagittal', min: 0, max: 50, hyper: 0, isbAxis: 'tibia-foot X' },
  { id: 'subtalar.inversion', joint: 'Subtalar', motion: 'Inversion', plane: 'Frontal', min: 0, max: 35, hyper: 0, isbAxis: 'calcaneus-foot X' },
  { id: 'subtalar.eversion', joint: 'Subtalar', motion: 'Eversion', plane: 'Frontal', min: 0, max: 15, hyper: 0, isbAxis: 'calcaneus-foot X' },
  { id: 'cervical.flexion', joint: 'Cervical spine', motion: 'Flexion', plane: 'Sagittal', min: 0, max: 45, hyper: 0, isbAxis: 'C7-T1 X' },
  { id: 'cervical.extension', joint: 'Cervical spine', motion: 'Extension', plane: 'Sagittal', min: 0, max: 45, hyper: 0, isbAxis: 'C7-T1 X' },
  { id: 'cervical.rotation', joint: 'Cervical spine', motion: 'Rotation', plane: 'Transverse', min: 0, max: 60, hyper: 0, isbAxis: 'C7-T1 Y' },
  { id: 'tmj.depression', joint: 'Temporomandibular', motion: 'Depression (opening)', plane: 'Sagittal', min: 0, max: 50, hyper: 0, isbAxis: 'mandible X' },
  { id: 'tmj.elevation', joint: 'Temporomandibular', motion: 'Elevation (closing)', plane: 'Sagittal', min: 0, max: 5, hyper: 0, isbAxis: 'mandible X' }
];

export const AAOS_BY_ID = Object.fromEntries(AAOS_ROM.map((entry) => [entry.id, entry]));

/**
 * Sagittal gait-cycle bands (degrees, signed with the teaching convention used
 * by the theater's left-leg readout: hip flexion positive, knee flexion
 * positive, ankle dorsiflexion positive).
 */
export const GAIT_BANDS = {
  hip: { margin: 7, keys: [[0, 30], [10, 25], [30, 5], [50, -8], [60, 2], [75, 32], [90, 25], [100, 30]] },
  knee: { margin: 9, keys: [[0, 5], [15, 18], [30, 10], [45, 5], [62, 12], [72, 62], [85, 28], [100, 5]] },
  ankle: { margin: 6, keys: [[0, 0], [8, -8], [30, 8], [45, 10], [60, -16], [72, -2], [85, 2], [100, 0]] }
};

/** AAOS band for one joint readout, or null when the joint is task-banded. */
export function romBandFor(readoutId) {
  const id = { hip: 'hip.flexion', knee: 'knee.flexion', ankle: 'ankle.dorsiflexion' }[readoutId];
  return id ? AAOS_BY_ID[id] : null;
}

/** Which AAOS motions a signed sagittal readout covers as it moves through ±. */
export function romCandidatesFor(readoutId, value, velocity = 0) {
  const sign = value < 0 || velocity < 0 ? -1 : 1;
  switch (readoutId) {
    case 'hip': return sign > 0 ? [AAOS_BY_ID['hip.flexion']] : [AAOS_BY_ID['hip.extension']];
    case 'knee': return [AAOS_BY_ID['knee.flexion']];
    case 'ankle': return sign > 0 ? [AAOS_BY_ID['ankle.dorsiflexion']] : [AAOS_BY_ID['ankle.plantarflexion']];
    case 'elbow': return [AAOS_BY_ID['elbow.flexion']];
    case 'shoulderElevation': return [AAOS_BY_ID['shoulder.flexion']];
    default: return [];
  }
}

/**
 * Display tolerance on an AAOS band: the theatre shows the published range and
 * allows 10% before flagging a reading as beyond reference range, so normal
 * anatomical variation and retarget error do not produce false alarms.
 */
export const ROM_DISPLAY_TOLERANCE = 0.1;
