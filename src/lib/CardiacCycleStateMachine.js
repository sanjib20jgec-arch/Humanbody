/**
 * Phase 32: explicit cardiac-cycle state machine.
 *
 * The CardioPhysiologyEngine produces normalized educational pressures. This
 * module turns those phases into an auditable state sequence with named valve
 * events and per-state captions, following the OpenStax A&P 2e teaching
 * sequence: ventricular pressure first closes the AV valves, then exceeds
 * arterial pressure to open the semilunar valves; falling ventricular
 * pressure closes the semilunar valves before filling resumes.
 *
 * Everything here is deterministic and pure: the same phase always yields the
 * same state, which makes the animation testable frame by frame.
 */

export const CARDIAC_STATES = [
  { id: 'atrial-systole', label: 'Atrial systole', from: 0, to: 0.1, caption: 'Atria contract and top up the ventricles through the open AV valves.', flow: 'atria → ventricles' },
  { id: 'isovolumetric-contraction', label: 'Isovolumetric contraction', from: 0.1, to: 0.16, caption: 'Ventricular pressure exceeds atrial pressure; AV valves close and all valves are shut while pressure builds.', flow: 'none — all valves closed' },
  { id: 'ventricular-ejection', label: 'Ventricular ejection', from: 0.16, to: 0.5, caption: 'Ventricular pressure exceeds arterial pressure; semilunar valves open and blood is ejected.', flow: 'ventricles → arteries' },
  { id: 'isovolumetric-relaxation', label: 'Isovolumetric relaxation', from: 0.5, to: 0.57, caption: 'Ventricles relax below arterial pressure; semilunar valves close and all valves are shut again.', flow: 'none — all valves closed' },
  { id: 'ventricular-filling', label: 'Ventricular filling', from: 0.57, to: 1, caption: 'Ventricular pressure falls below atrial pressure; AV valves open and passive filling begins.', flow: 'atria → ventricles' }
];

export const CARDIAC_VALVE_EVENTS = [
  { id: 'av-close', phase: 0.1, label: 'AV valves close', detail: 'Ventricular pressure crosses above atrial pressure.' },
  { id: 'semilunar-open', phase: 0.16, label: 'Semilunar valves open', detail: 'Ventricular pressure crosses above arterial pressure.' },
  { id: 'semilunar-close', phase: 0.5, label: 'Semilunar valves close', detail: 'Ventricular pressure falls below arterial pressure.' },
  { id: 'av-open', phase: 0.57, label: 'AV valves open', detail: 'Ventricular pressure falls below atrial pressure.' }
];

export function normalizePhase(phase = 0) {
  return ((phase % 1) + 1) % 1;
}

export function cardiacStateAt(phase = 0) {
  const normalized = normalizePhase(phase);
  return CARDIAC_STATES.find((state) => normalized >= state.from && normalized < state.to) || CARDIAC_STATES[CARDIAC_STATES.length - 1];
}

export function nextValveEvent(phase = 0) {
  const normalized = normalizePhase(phase);
  return CARDIAC_VALVE_EVENTS.find((event) => event.phase > normalized + 1e-9) || CARDIAC_VALVE_EVENTS[0];
}

export function previousValveEvent(phase = 0) {
  const normalized = normalizePhase(phase);
  const past = CARDIAC_VALVE_EVENTS.filter((event) => event.phase <= normalized + 1e-9);
  return past[past.length - 1] || CARDIAC_VALVE_EVENTS[CARDIAC_VALVE_EVENTS.length - 1];
}

/**
 * Deterministic valve state from phase alone (no memory). Right and left
 * valves follow the same gradient logic; the two sides differ in pressure
 * scale, not in event ordering.
 */
export function valveStateAt(phase = 0) {
  const normalized = normalizePhase(phase);
  const avOpen = normalized >= 0.57 || normalized < 0.1;
  const semilunarOpen = normalized >= 0.16 && normalized < 0.5;
  return {
    mitral: avOpen,
    tricuspid: avOpen,
    aortic: semilunarOpen,
    pulmonary: semilunarOpen
  };
}

/**
 * Hysteresis tracker for continuous playback: a valve only changes state when
 * the phase has clearly crossed its event boundary, preventing flicker when a
 * scrubber or animation sits exactly on the threshold.
 */
export function createValveTracker(hysteresis = 0.008) {
  let state = valveStateAt(0);
  return {
    update(phase = 0) {
      const normalized = normalizePhase(phase);
      const target = valveStateAt(normalized);
      const nearBoundary = CARDIAC_VALVE_EVENTS.some((event) => Math.abs(normalized - event.phase) < hysteresis);
      if (!nearBoundary) state = target;
      return { ...state };
    },
    get state() {
      return { ...state };
    }
  };
}

/**
 * Right/left normalized pressure split. The educational engine models one
 * ventricular and one atrial trace; these factors separate them into the two
 * circuits at teaching scale (right-side pressures are roughly a fifth of
 * systemic values). Factors are labeled constants, not measurements.
 */
export const RIGHT_LEFT_SPLIT = {
  rightVentricleFactor: 0.21,
  rightAtriumFactor: 1,
  pulmonaryArteryFactor: 0.2,
  leftVentricleFactor: 1,
  leftAtriumFactor: 1,
  aortaFactor: 1
};

export function splitRightLeft(waveform = {}) {
  const ventricular = Number(waveform.ventricular) || 0;
  const atrial = Number(waveform.atrial) || 0;
  return {
    rightAtrium: atrial * RIGHT_LEFT_SPLIT.rightAtriumFactor,
    rightVentricle: ventricular * RIGHT_LEFT_SPLIT.rightVentricleFactor,
    pulmonaryTrunk: Number(waveform.pulmonary) || 0,
    leftAtrium: atrial * RIGHT_LEFT_SPLIT.leftAtriumFactor,
    leftVentricle: ventricular * RIGHT_LEFT_SPLIT.leftVentricleFactor,
    aorta: Number(waveform.aortic) || 0
  };
}

export function describeCardiacPhase(phase = 0) {
  const state = cardiacStateAt(phase);
  const valves = valveStateAt(phase);
  const open = Object.entries(valves).filter(([, isOpen]) => isOpen).map(([name]) => name);
  return {
    state: state.id,
    stateLabel: state.label,
    caption: state.caption,
    flow: state.flow,
    openValves: open,
    nextEvent: nextValveEvent(phase)
  };
}
