// Pillar 5 (Movement Theater Masterplan §2.6): kinematic camera director.
//
// What changed from v1 and why:
//   * v1 interpolated with a fixed per-frame factor (0.08…0.20). A fixed factor
//     is frame-rate dependent, so a 120 Hz phone converged twice as fast as a
//     60 Hz one (audit A13). v2 uses half-lives with `1 - exp(-dt·ln2/τ)`,
//     which behaves identically at 30/60/120 Hz.
//   * v1 was seven fixed shots. v2 adds joint anchoring (the look-at follows a
//     named joint through a dead zone), anatomical plane presets expressed in
//     the anchored joint's local frame, orbit + zoom limits, and an explicit
//     reset. The seven original presets and their key bindings are preserved
//     verbatim because the UI, the keyboard map and the browser specs use them.
//
// No DOM, no React. three.js is injected so this module stays testable in node.

import { dampFactor } from './telemetry.js';

export const CAMERA_PRESETS = [
  { id: 'anterior', label: 'Anterior', key: '1' },
  { id: 'posterior', label: 'Posterior', key: '2' },
  { id: 'lateralL', label: 'Left lateral', key: '3' },
  { id: 'lateralR', label: 'Right lateral', key: '4' },
  { id: 'superior', label: 'Superior', key: '5' },
  { id: 'closeup', label: 'Close-up follow', key: '6' },
  { id: 'turntable', label: 'Turntable', key: '7' }
];

const FULL = { x: 0, y: 0.92, z: 0 };

// Action-aware framing (Phase 79). Distances and heights in metres.
const FRAMES = {
  walk: { y: 0.92, d: 4.9 }, run: { y: 1.0, d: 5.4 }, jump: { y: 1.1, d: 5.8 },
  wave: { y: 1.35, d: 3.7 }, handshake: { y: 1.25, d: 3.5 }, chew: { y: 1.62, d: 2.7 }, talk: { y: 1.62, d: 2.7 },
  squat: { y: 0.8, d: 4.2 }, 'sit-stand': { y: 0.85, d: 4.2 }, lunge: { y: 0.95, d: 4.4 }, kick: { y: 1, d: 4.2 },
  sidestep: { y: 0.95, d: 4.6 }, 'one-leg': { y: 1.05, d: 4 }, 'tiptoe-walk': { y: 0.98, d: 4.2 },
  'heel-walk': { y: 0.98, d: 4.2 }, bow: { y: 1, d: 4 }, shrug: { y: 1.45, d: 2.8 }, 'reach-up': { y: 1.2, d: 3.4 },
  clap: { y: 1.3, d: 3 }, 'head-signals': { y: 1.6, d: 2.4 }
};

/** Anatomical plane presets, expressed in the anchored joint's local frame. */
export const PLANE_PRESETS = [
  { id: 'free', label: 'Free', hint: 'orbit freely' },
  { id: 'sagittal', label: 'Sagittal', hint: 'side view — flexion / extension' },
  { id: 'coronal', label: 'Coronal', hint: 'front view — abduction / adduction' },
  { id: 'transverse', label: 'Transverse', hint: 'top view — rotation' }
];

/** Joints a learner can anchor to, in the order they are offered. */
export const ANCHOR_JOINTS = [
  { id: 'root', label: 'Pelvis' },
  { id: 'leftUpLeg', label: 'Left hip' },
  { id: 'leftLeg', label: 'Left knee' },
  { id: 'leftFoot', label: 'Left ankle' },
  { id: 'rightUpLeg', label: 'Right hip' },
  { id: 'rightLeg', label: 'Right knee' },
  { id: 'rightFoot', label: 'Right ankle' },
  { id: 'leftUpperArm', label: 'Left shoulder' },
  { id: 'leftForeArm', label: 'Left elbow' },
  { id: 'rightUpperArm', label: 'Right shoulder' },
  { id: 'rightForeArm', label: 'Right elbow' },
  { id: 'chest', label: 'Thorax' },
  { id: 'head', label: 'Head' }
];

export const CAMERA_LIMITS = {
  minDistance: 0.5,
  maxDistance: 6,
  minPolar: (25 * Math.PI) / 180,
  maxPolar: (145 * Math.PI) / 180
};

/** Frame-rate independent damping constants (§2.6). */
export const CAMERA_DAMPING = {
  positionHalfLife: 0.12,
  lookHalfLife: 0.09,
  deadZone: 0.012,
  lookDeadZone: 0.02,
  maxSpeed: 2.0,
  shakeWindowMs: 500,
  shakeThreshold: 2
};

/** Local offset directions per plane (metres along the joint frame axes). */
const PLANE_OFFSETS = {
  sagittal: [1, 0.28, 0.001],
  coronal: [0.001, 0.28, 1],
  transverse: [0.001, 1, 0.001],
  free: [0.62, 0.42, 0.62]
};

export function cameraStateFor(presetId, t, reducedMotion, actionId) {
  const f = FRAMES[actionId] || FRAMES.walk;
  const target = { x: 0, y: f.y, z: 0 };
  switch (presetId) {
    case 'anterior': return { pos: [0, 1.3, f.d], target, controls: false };
    case 'posterior': return { pos: [0, 1.3, -f.d], target, controls: false };
    case 'lateralL': return { pos: [f.d, 1.35, 0], target, controls: false };
    case 'lateralR': return { pos: [-f.d, 1.35, 0], target, controls: false };
    case 'superior': return { pos: [0, 4.0, 3.0], target: FULL, controls: false };
    case 'turntable': {
      // Ease-in on the first two seconds so the orbit never snaps to speed.
      const a = reducedMotion ? 0.6 : 0.35 * (t < 2 ? (t * t) / 4 + t / 2 : t);
      return { pos: [Math.sin(a) * f.d, 1.7, Math.cos(a) * f.d], target, controls: false };
    }
    case 'closeup': return { follow: true, controls: false };
    default: return { pos: [2.2, 1.7, 3.4], target: FULL, controls: true };
  }
}

export function framingForAction(actionId) {
  return FRAMES[actionId] || FRAMES.walk;
}

/**
 * Owns the smoothed camera position/look-at, the joint anchor, the plane
 * selection, the jitter-rejecting dead zones and the shake guard.
 */
export class CameraDirector {
  constructor({ THREE, camera, controls = null } = {}) {
    this.THREE = THREE;
    this.camera = camera;
    this.controls = controls;
    this.presetId = 'anterior';
    this.focusBone = 'root';
    this.mode = 'FREE';            // FREE | JOINT_ANCHORED | PLANE_LOCKED
    this.anchorJointId = null;
    this.plane = 'free';
    this.position = new THREE.Vector3(0, 1.45, 3.4);
    this.look = new THREE.Vector3(0, 1, 0);
    this._jointWorld = new THREE.Vector3();
    this._jointPrev = new THREE.Vector3();
    this._lookTarget = new THREE.Vector3();
    this._posTarget = new THREE.Vector3();
    this._offset = new THREE.Vector3();
    this._anchorVelocity = 0;
    this._shakeEvents = [];
    this._deadZone = CAMERA_DAMPING.deadZone;
    this._lastDt = 1 / 60;
    this._framing = framingForAction('walk');
    this._focusAnchorValid = false;
  }

  setPreset(presetId) {
    this.presetId = presetId;
    return this;
  }

  /** The bone a follow-preset frames (the action's own focal joint). */
  setFocusBone(boneName) {
    if (this.focusBone !== boneName) {
      this.focusBone = boneName || 'root';
      this._focusAnchorValid = false;
    }
    return this;
  }

  /** Anchor the camera target to a joint. */
  setAnchor(jointId, { plane = this.plane } = {}) {
    this.anchorJointId = jointId;
    this.plane = plane || 'free';
    this.mode = this.plane === 'free' ? 'JOINT_ANCHORED' : 'PLANE_LOCKED';
    this._anchorVelocity = 0;
    this._shakeEvents = [];
    return this;
  }

  clearAnchor() {
    this.anchorJointId = null;
    this.mode = 'FREE';
    return this;
  }

  setPlane(plane) {
    this.plane = plane;
    if (this.anchorJointId) this.mode = plane === 'free' ? 'JOINT_ANCHORED' : 'PLANE_LOCKED';
    return this;
  }

  /** The learner grabbed the canvas: stop steering until they ask us to. */
  userOrbit() {
    this.mode = 'FREE';
    return this;
  }

  /** "Re-center" action: hand the camera back to the tracking rules. */
  reengage() {
    if (this.anchorJointId) this.setAnchor(this.anchorJointId, { plane: this.plane });
    this._anchorVelocity = 0;
    this._shakeEvents = [];
    this._deadZone = CAMERA_DAMPING.deadZone;
    return this;
  }

  update({ rig, state, reducedMotion = false, dtSeconds = 1 / 60, manual = false, focusBone = null, framing = null }) {
    const THREE = this.THREE;
    this._lastDt = dtSeconds;
    if (focusBone) this.setFocusBone(focusBone);
    if (framing) this._framing = framing;
    const hl = (base) => (reducedMotion ? 0 : base);
    const followJoint = this.anchorJointId && rig?.bones?.[this.anchorJointId];

    // ---- desired look-at ----------------------------------------------------
    if (followJoint) {
      rig.bones[this.anchorJointId].getWorldPosition(this._jointWorld);
      const moved = this._jointPrev.lengthSq() === 0 ? 0 : this._jointPrev.distanceTo(this._jointWorld);
      this._jointPrev.copy(this._jointWorld);
      const instant = dtSeconds > 0 ? moved / dtSeconds : 0;
      this._anchorVelocity = this._anchorVelocity * 0.8 + instant * 0.2;
      const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (this._anchorVelocity > CAMERA_DAMPING.maxSpeed) this._shakeEvents.push(nowMs);
      this._shakeEvents = this._shakeEvents.filter((t0) => nowMs - t0 < CAMERA_DAMPING.shakeWindowMs);
      const adaptiveZone = this._shakeEvents.length >= CAMERA_DAMPING.shakeThreshold
        ? CAMERA_DAMPING.deadZone * 4
        : CAMERA_DAMPING.deadZone;
      this._deadZone += (adaptiveZone - this._deadZone) * dampFactor(0.5, dtSeconds);
      this._lookTarget.copy(this._jointWorld);
      if (this._lookTarget.distanceTo(this.look) < this._deadZone) this._lookTarget.copy(this.look);
    } else {
      this._lookTarget.set(state.target.x, state.target.y, state.target.z);
      if (this._lookTarget.distanceTo(this.look) < CAMERA_DAMPING.lookDeadZone) this._lookTarget.copy(this.look);
    }

    // ---- manual orbit: OrbitControls owns the transform --------------------
    if (manual && this.controls) {
      this.controls.update();
      const lookK = dampFactor(hl(CAMERA_DAMPING.lookHalfLife), dtSeconds);
      this.look.lerp(this._lookTarget, lookK);
      this.controls.target.copy(this.look);
      this.position.copy(this.camera.position);
      this.camera.lookAt(this.look);
      return;
    }

    // ---- desired position ---------------------------------------------------
    if (followJoint) {
      this._anchorOffset(this.rig ?? rig, this.anchorJointId, this._offset);
      this._posTarget.copy(this._lookTarget).add(this._offset);
    } else if (state.follow && rig?.bones?.[this.focusBone]) {
      rig.bones[this.focusBone].getWorldPosition(this._posTarget);
      this._posTarget.add(this._offset.set(0.5, 0.35, 0.9));
    } else {
      this._posTarget.set(state.pos[0], state.pos[1], state.pos[2]);
    }

    const posK = dampFactor(hl(CAMERA_DAMPING.positionHalfLife), dtSeconds);
    const lookK = dampFactor(hl(CAMERA_DAMPING.lookHalfLife), dtSeconds);
    this.position.lerp(this._posTarget, posK);
    this.look.lerp(this._lookTarget, lookK);
    this.camera.position.copy(this.position);
    this.camera.lookAt(this.look);
    if (this.controls) this.controls.target.copy(this.look);
  }

  /** Offset that places the camera on the requested plane of the joint frame. */
  _anchorOffset(rig, jointId, out) {
    const distance = Math.max(1.2, (this._framing || framingForAction('walk')).d * 0.55);
    const dir = PLANE_OFFSETS[this.plane] || PLANE_OFFSETS.free;
    out.set(dir[0], dir[1], dir[2]).normalize().multiplyScalar(distance);
    const bone = rig?.bones?.[jointId];
    if (bone) {
      bone.getWorldQuaternion(this._quat || (this._quat = new (this.THREE.Quaternion)()));
      out.applyQuaternion(this._quat);
    }
    return out;
  }

  /** Keep OrbitControls inside the stated limits (Masterplan §3.5). */
  applyLimits() {
    if (!this.controls) return this;
    this.controls.minDistance = CAMERA_LIMITS.minDistance;
    this.controls.maxDistance = CAMERA_LIMITS.maxDistance;
    this.controls.minPolarAngle = CAMERA_LIMITS.minPolar;
    this.controls.maxPolarAngle = CAMERA_LIMITS.maxPolar;
    return this;
  }
}
