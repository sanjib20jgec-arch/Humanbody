// Phase 1 (Movement Theater Masterplan §3.4): live kinematic telemetry.
//
// Pure numerics — no DOM, no three.js, no React — so every rule below can be
// unit-tested in node and audited by a human.
//
// Three problems this module solves:
//   1. A raw joint trace is noisy (retarget jitter, mocap noise). A One-Euro
//      filter gives low latency on fast swings and stability when still.
//   2. "Flexion / Extension" labels taken from the raw sign of a velocity flap
//      on every zero crossing. A Schmitt-trigger with dwell time fixes that.
//   3. Comparing a joint to its reference band requires tracking the extreme
//      values reached and knowing which reference band applies.
//
// Definitions of the angles themselves live with the pose sampler
// (jointAngles.js for retargeted clips, the authored pose dict for procedural
// tracks); this module never computes geometry.

import { GAIT_BANDS, romCandidatesFor, ROM_DISPLAY_TOLERANCE } from '../../data/kinesiology/romBands.js';

const LN2 = Math.LN2;

/**
 * One-Euro filter (Casiez, Roussel & Vogel 2012). Chosen over a moving average
 * or a plain low-pass because it is the only cheap filter whose lag shrinks as
 * the signal speeds up — exactly what a knee does through a gait cycle.
 */
export class OneEuroFilter {
  constructor({ minCutoff = 1.0, beta = 0.02, dCutoff = 1.0 } = {}) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
    this.reset();
  }

  reset() {
    this._x = null;
    this._dx = 0;
    this._t = null;
  }

  static _alpha(cutoff, dtSeconds) {
    const tau = 1 / (2 * Math.PI * Math.max(1e-6, cutoff));
    return 1 / (1 + tau / Math.max(1e-6, dtSeconds));
  }

  /** @returns {number} filtered value */
  filter(value, dtSeconds = 1 / 60) {
    const dt = Math.max(1e-4, Math.min(0.25, dtSeconds || 1 / 60));
    if (this._x === null) {
      this._x = value;
      this._dx = 0;
      this._t = dt;
      return value;
    }
    const rawDx = (value - this._x) / dt;
    const aD = OneEuroFilter._alpha(this.dCutoff, dt);
    this._dx = aD * rawDx + (1 - aD) * this._dx;
    const cutoff = this.minCutoff + this.beta * Math.abs(this._dx);
    const a = OneEuroFilter._alpha(cutoff, dt);
    this._x = a * value + (1 - a) * this._x;
    return this._x;
  }

  get value() { return this._x; }
}

/** Exponential smoothing that is frame-rate independent: half-life in seconds. */
export function dampFactor(halfLifeSeconds, dtSeconds) {
  if (!(halfLifeSeconds > 0)) return 1;
  const dt = Math.max(0, Math.min(0.25, dtSeconds || 0));
  return 1 - Math.exp((-LN2 * dt) / halfLifeSeconds);
}

/** Critically damped vector3 follower (used by the camera director). */
export function dampVec3(out, target, halfLifeSeconds, dtSeconds) {
  const k = dampFactor(halfLifeSeconds, dtSeconds);
  out.x += (target.x - out.x) * k;
  out.y += (target.y - out.y) * k;
  out.z += (target.z - out.z) * k;
  return out;
}

/**
 * Tracks one joint readout: filtered value, angular velocity, extremes reached
 * this session, and whether the joint is inside its reference band.
 *
 * The velocity is a 5-sample central difference, then a 3-sample moving mean —
 * the plan's §3.4 rule, chosen because single-frame difference on a 30 fps clip
 * amplifies retarget noise by ~2x.
 */
export class JointTracker {
  constructor({ id, label = id, unit = 'deg', band = null, neutral = 0, filter = {} } = {}) {
    this.id = id;
    this.label = label;
    this.unit = unit;
    this.band = band;
    this.neutral = neutral;
    this.filter = new OneEuroFilter(filter);
    this.reset();
  }

  reset() {
    this.filter?.reset();
    this.value = 0;
    this.raw = 0;
    this.velocity = 0;
    this.min = Infinity;
    this.max = -Infinity;
    this.aboveBandMs = 0;
    this.belowBandMs = 0;
    this.outOfBand = false;
    this._samples = [];
    this._velocities = [];
  }

  /** Nominal band for display (AAOS range or task band), resolved by the caller. */
  setBand(band) { this.band = band; }

  /** Band edges the CURRENT sign of motion is being compared against. */
  activeBand() {
    if (!this.band) return null;
    if (this.band.min !== undefined && this.band.max !== undefined) return this.band;
    return null;
  }

  /**
   * @param {number} rawValue degrees, already in the anatomical sign convention
   * @param {number} dtMs wall-clock delta
   */
  update(rawValue, dtMs = 16.6) {
    const dt = Math.max(1e-4, Math.min(0.25, dtMs / 1000));
    this.raw = rawValue;
    this.value = this.filter.filter(rawValue, dt);
    if (this.value < this.min) this.min = this.value;
    if (this.value > this.max) this.max = this.value;

    this._samples.push(this.value);
    if (this._samples.length > 5) this._samples.shift();
    if (this._samples.length === 5) {
      const d = (this._samples[4] - this._samples[0]) / (4 * dt);
      this._velocities.push(d);
      if (this._velocities.length > 3) this._velocities.shift();
      this.velocity = this._velocities.reduce((a, b) => a + b, 0) / this._velocities.length;
    }

    this._updateBandState(dtMs);
    return this.value;
  }

  /**
   * Out-of-reference-range flag with the plan's damping: only after the joint
   * has stayed beyond the band by more than the display tolerance for 150 ms,
   * so a transient overshoot at the end of a fast swing is not reported.
   */
  _updateBandState(dtMs) {
    const band = this.activeBand();
    if (!band) { this.outOfBand = false; return; }
    const span = Math.max(1, band.max - band.min);
    const above = band.max + span * ROM_DISPLAY_TOLERANCE;
    const below = band.min - span * ROM_DISPLAY_TOLERANCE;
    if (this.value > above) this.aboveBandMs += dtMs; else this.aboveBandMs = 0;
    if (this.value < below) this.belowBandMs += dtMs; else this.belowBandMs = 0;
    this.outOfBand = this.aboveBandMs > 150 || this.belowBandMs > 150;
  }

  /** 0–1 position of the current value inside the band (for the HUD bar). */
  bandRatio() {
    const band = this.activeBand();
    if (!band) return 0;
    const span = Math.max(1e-6, band.max - band.min);
    return Math.max(0, Math.min(1, (this.value - band.min) / span));
  }

  snapshot() {
    return {
      id: this.id,
      label: this.label,
      value: +this.value.toFixed(2),
      velocity: +this.velocity.toFixed(2),
      min: Number.isFinite(this.min) ? +this.min.toFixed(2) : 0,
      max: Number.isFinite(this.max) ? +this.max.toFixed(2) : 0,
      outOfBand: this.outOfBand,
      band: this.activeBand()
    };
  }
}

/** Motion vocabulary per joint readout: which anatomical term each sign means. */
export const MOTION_VOCABULARY = {
  hip: { positive: 'Hip flexion', negative: 'Hip extension', neutral: 'Hip neutral' },
  knee: { positive: 'Knee flexion', negative: 'Knee extension', neutral: 'Knee neutral' },
  ankle: { positive: 'Dorsiflexion', negative: 'Plantarflexion', neutral: 'Ankle neutral' },
  elbow: { positive: 'Elbow flexion', negative: 'Elbow extension', neutral: 'Elbow neutral' },
  shoulderElevation: { positive: 'Shoulder flexion/elevation', negative: 'Shoulder extension', neutral: 'Shoulder neutral' },
  spine: { positive: 'Trunk flexion', negative: 'Trunk extension', neutral: 'Trunk neutral' }
};

/**
 * Schmitt-triggered phase terminology feed.
 *
 * Entering a phase needs a real movement (>= enterVel, >= enterExcursion,
 * sustained enterFrames). Leaving it needs a clearly smaller signal
 * (exitVel/exitExcursion over more frames). That 2:1 asymmetry plus a minimum
 * dwell time is what stops "Flexion/Extension" from flickering around zero.
 */
export class PhaseEngine {
  constructor({
    enterVel = 8,
    exitVel = 4,
    enterExcursion = 3,
    exitExcursion = 1.5,
    enterFrames = 4,
    exitFrames = 8,
    minDwellMs = 150,
    neutral = 0
  } = {}) {
    Object.assign(this, { enterVel, exitVel, enterExcursion, exitExcursion, enterFrames, exitFrames, minDwellMs, neutral });
    this.reset();
  }

  reset() {
    this.label = 'Neutral';
    this._streak = 0;
    this._pending = null;
    this._sinceChangeMs = Number.POSITIVE_INFINITY;
    this.changed = false;
  }

  /**
   * @param {object} sample { id, value, velocity }
   * @param {number} dtMs wall-clock delta
   * @returns {string} current phase label (stable under noise)
   */
  update({ id, value, velocity }, dtMs = 16.6) {
    this._sinceChangeMs += dtMs;
    this.changed = false;
    const vocab = MOTION_VOCABULARY[id] || { positive: 'Positive', negative: 'Negative', neutral: 'Neutral' };
    const excursion = Math.abs(value - this.neutral);
    const moving = Math.abs(velocity) >= this.enterVel && excursion >= this.enterExcursion;
    const settled = Math.abs(velocity) <= this.exitVel && excursion <= this.exitExcursion;

    // Between the two thresholds the previous decision is held: this band is
    // the hysteresis, and it is deliberately wide enough to swallow the
    // velocity wobble a One-Euro-filtered signal still shows near zero.
    if (!moving && !settled) return this.label;

    const candidate = moving
      ? (velocity > 0 ? vocab.positive : vocab.negative)
      : vocab.neutral;
    if (candidate === this._pending) this._streak += 1;
    else { this._pending = candidate; this._streak = 1; }

    const needed = candidate === vocab.neutral ? this.exitFrames : this.enterFrames;
    if (this._streak < needed) return this.label;
    if (candidate === this.label) return this.label;
    if (this._sinceChangeMs < this.minDwellMs) return this.label; // dwell gate
    this.label = candidate;
    this._sinceChangeMs = 0;
    this.changed = true;
    return this.label;
  }
}

/** Min/max envelope of a band, whether it is {min,max} or keypoint-based. */
export function bandEnvelope(band) {
  if (!band) return null;
  if (Number.isFinite(band.min) && Number.isFinite(band.max)) return { min: band.min, max: band.max };
  if (Array.isArray(band.keys) && band.keys.length) {
    const values = band.keys.map(([, v]) => v);
    const margin = band.margin || 0;
    return { min: Math.min(...values) - margin, max: Math.max(...values) + margin };
  }
  return null;
}

/**
 * Publish rate control: continuous numbers update at <= hz, discrete events
 * (phase change, out-of-range entry/exit, user seek) bypass the gate so the UI
 * never feels laggy about the things that matter.
 */
export function createHudScheduler(hz = 15) {
  const intervalMs = 1000 / Math.max(1, hz);
  let lastPublished = -Infinity;
  return {
    intervalMs,
    due(nowMs) { return nowMs - lastPublished >= intervalMs; },
    mark(nowMs) { lastPublished = nowMs; },
    /** Force the next due() call to publish. */
    invalidate() { lastPublished = -Infinity; }
  };
}

/**
 * Joint readouts exposed by a movement. Sagittal hip/knee/ankle are computed
 * for every action (retargeted clips via geometry, authored tracks from their
 * exact pose values); other joints report `null` until their joint frames are
 * authored (Masterplan §3.4 phase table).
 */
export const SAGITTAL_READOUTS = ['hip', 'knee', 'ankle'];

/** Authored poses are defined in degrees per bone; these are the exact angles. */
export function anglesFromAuthoredPose(pose, side = 'left') {
  const upper = `${side}UpLeg`;
  const lower = `${side}Leg`;
  const foot = `${side}Foot`;
  const g = (bone) => Number(pose?.[bone]?.x || 0);
  // Convention declared in authoredTracks.js: hip flexion = -X, knee flexion = +X.
  // The foot follows the same forward-positive rule, so dorsiflexion = -X.
  return { hip: -g(upper), knee: g(lower), ankle: -g(foot) };
}

/**
 * Band lookup for a readout id.
 * `gait: true` returns the task band (envelope over the gait cycle) because a
 * healthy walk uses a fraction of AAOS range — comparing gait to AAOS would
 * flag every healthy step as "in range but barely moving".
 */
export function bandForReadout(readoutId, { gait = false } = {}) {
  if (gait && GAIT_BANDS[readoutId]) {
    const envelope = bandEnvelope(GAIT_BANDS[readoutId]);
    return { ...envelope, kind: 'task', source: 'RLA gait convention (Perry & Burnfield 2010)' };
  }
  const candidates = romCandidatesFor(readoutId, 0, 0);
  if (!candidates[0]) return null;
  const entry = candidates[0];
  return { min: entry.min, max: entry.max, kind: 'aaos', source: entry.joint + ' ' + entry.motion };
}

export function formatAngle(value, unit = '°') {
  if (!Number.isFinite(value)) return '–';
  return `${Math.round(value)}${unit}`;
}
