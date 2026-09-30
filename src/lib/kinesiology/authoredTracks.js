// Authored teaching tracks (D5/D6) — Phase 75 animator pass:
// pelvic rotation/list, spine counter-rotation, head stabilization, double-bump
// knees, heel-rock foot roll, elbow flexion bias, wrist lag, idle breathing.
// Convention: limbs hang along -Y; forward = +Z; hip/shoulder flexion = -X;
// knee flexion = +X; left abduction = +Z, right abduction = -Z. Degrees.

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (t, a, b) => { const x = clamp((t - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
const pow = (v, e) => Math.sign(v) * Math.pow(Math.abs(v), e);

// Secondary life layered on every authored pose.
function withIdle(p, t) {
  const br = Math.sin(2 * Math.PI * 0.22 * t);
  p.chest = { ...(p.chest || {}), x: (p.chest?.x || 0) + 1.4 * br };
  p.head = { ...(p.head || {}), x: (p.head?.x || 0) - 0.7 * br, y: (p.head?.y || 0) + 1.2 * Math.sin(2 * Math.PI * 0.09 * t) };
  p.root = { ...(p.root || {}), y: (p.root?.y || 0) + 0.004 * br };
  return p;
}

function gait(t, opts) {
  const { period, hip, knee, arm, bounce, trunk } = opts;
  const ph = (2 * Math.PI * t) / period;
  const sin = Math.sin, L = ph, R = ph + Math.PI;
  const p = {};
  // Pelvis: yaw + list; spine counter-rotates; head stabilizes.
  p.root = { y: bounce * (0.75 * Math.abs(sin(ph)) + 0.25 * Math.abs(sin(2 * ph))), ry: 4 * sin(ph), rz: 1.6 * sin(ph) };
  p.spine = { x: trunk, y: -2.6 * sin(ph) };
  p.head = { y: 1.8 * sin(ph) };
  // Legs: double-bump knee (stance flex + swing flex), heel-rock foot roll.
  const kneeCurve = (a) => knee * (0.14 + 0.2 * Math.max(0, sin(a + 2.9)) + 0.72 * pow(Math.max(0, sin(a + 0.8)), 1.4));
  p.leftUpLeg = { x: -hip * sin(L) };
  p.rightUpLeg = { x: -hip * sin(R) };
  p.leftLeg = { x: kneeCurve(L) };
  p.rightLeg = { x: kneeCurve(R) };
  p.leftFoot = { x: -9 * sin(L + 0.55) + 7 * Math.max(0, sin(L + 2.7)) };
  p.rightFoot = { x: -9 * sin(R + 0.55) + 7 * Math.max(0, sin(R + 2.7)) };
  // Arms: swing with elbow flexion bias, shoulder–elbow phase offset.
  p.leftUpperArm = { x: arm * sin(L + Math.PI) };
  p.rightUpperArm = { x: arm * sin(R + Math.PI) };
  p.leftForeArm = { x: -18 - 16 * Math.max(0, sin(L + Math.PI + 0.7)) };
  p.rightForeArm = { x: -18 - 16 * Math.max(0, sin(R + Math.PI + 0.7)) };
  return withIdle(p, t);
}

export const AUTHORED_ACTIONS = {
  walk: {
    duration: 2.2, loop: true, source: 'authored',
    pose: (t) => gait(t, { period: 1.1, hip: 26, knee: 46, arm: 16, bounce: 0.016, trunk: 4 })
  },
  run: {
    duration: 2.25, loop: true, source: 'authored',
    pose: (t) => gait(t, { period: 0.75, hip: 46, knee: 100, arm: 52, bounce: 0.05, trunk: 12 })
  },
  jump: {
    duration: 2.6, loop: false, source: 'authored',
    pose: (t) => {
      const p = {};
      const squat = smooth(t, 0.4, 0.85) * (1 - smooth(t, 0.9, 1.15));
      const land = smooth(t, 1.85, 2.05) * (1 - smooth(t, 2.2, 2.5));
      const settle = smooth(t, 2.4, 2.6);
      const s = Math.max(squat, land * 0.8) * (1 - settle * 0.9);
      const air = smooth(t, 1.15, 1.35) * (1 - smooth(t, 1.7, 1.9));
      p.leftUpLeg = { x: 55 * s - 12 * air };
      p.rightUpLeg = { x: 55 * s - 12 * air };
      p.leftLeg = { x: 85 * s + 25 * air };
      p.rightLeg = { x: 85 * s + 25 * air };
      p.leftFoot = { x: -30 * s };
      p.rightFoot = { x: -30 * s };
      p.spine = { x: 18 * s - 6 * air };
      // Arms: anticipation back during countermovement, overhead in flight.
      p.leftUpperArm = { x: 28 * s - 150 * air };
      p.rightUpperArm = { x: 28 * s - 150 * air };
      p.leftForeArm = { x: -14 - 10 * air };
      p.rightForeArm = { x: -14 - 10 * air };
      p.head = { x: -4 * air + 3 * s };
      p.root = { y: -0.16 * s + 0.42 * air };
      return withIdle(p, t);
    }
  },
  kick: {
    duration: 2.4, loop: true, source: 'authored',
    pose: (t) => {
      const ph = t % 2.4;
      const w = smooth(ph, 0.2, 0.6) * (1 - smooth(ph, 0.6, 1.0));
      const k = smooth(ph, 0.5, 0.9) * (1 - smooth(ph, 1.5, 2.0));
      const p = {};
      p.leftUpLeg = { x: -35 * w - 85 * k };
      p.leftLeg = { x: 80 * w + 10 * k };
      p.leftFoot = { x: -15 * k };
      p.rightUpLeg = { x: 8 * k };
      p.spine = { x: -8 * k + 6 };
      p.leftUpperArm = { x: 25 * k }; p.rightUpperArm = { x: -35 * k };
      p.root = { y: -0.04 * k };
      return withIdle(p, t);
    }
  },
  sidestep: {
    duration: 2.4, loop: true, source: 'authored',
    pose: (t) => {
      const ph = (2 * Math.PI * t) / 2.4;
      const step = Math.sin(ph);
      const lift = Math.max(0, Math.sin(ph));
      const rlift = Math.max(0, -Math.sin(ph));
      const p = {};
      p.root = { x: 0.45 * step, y: 0.02 * Math.abs(Math.cos(ph)) };
      p.leftUpLeg = { z: 16 * lift, x: -4 * lift };
      p.rightUpLeg = { z: -16 * rlift, x: -4 * rlift };
      p.leftLeg = { x: 18 * lift }; p.rightLeg = { x: 18 * rlift };
      p.leftFoot = { x: -8 * lift }; p.rightFoot = { x: -8 * rlift };
      p.spine = { y: -4 * step };
      p.leftUpperArm = { x: 12 * rlift }; p.rightUpperArm = { x: 12 * lift };
      return withIdle(p, t);
    }
  },
  'one-leg': {
    duration: 3, loop: true, source: 'authored',
    pose: (t) => {
      const ph = t % 3;
      const u = smooth(ph, 0, 0.8) * (1 - smooth(ph, 2.3, 2.9));
      const p = {};
      p.rightUpLeg = { x: -35 * u }; p.rightLeg = { x: 50 * u }; p.rightFoot = { x: -12 * u };
      p.leftUpLeg = { x: -4 * u };
      p.root = { rz: 5 * u, y: -0.03 * u };
      p.spine = { rz: -3 * u };
      p.leftUpperArm = { z: 25 * u }; p.rightUpperArm = { z: -25 * u };
      return withIdle(p, t);
    }
  },
  'tiptoe-walk': {
    duration: 2.2, loop: true, source: 'authored',
    pose: (t) => {
      const p = gait(t, { period: 1.1, hip: 20, knee: 38, arm: 14, bounce: 0.02, trunk: 5 });
      p.leftFoot.x += 24; p.rightFoot.x += 24;
      p.root.y += 0.05;
      return p;
    }
  },
  'heel-walk': {
    duration: 2.2, loop: true, source: 'authored',
    pose: (t) => {
      const p = gait(t, { period: 1.1, hip: 22, knee: 30, arm: 14, bounce: 0.015, trunk: 3 });
      p.leftFoot.x -= 20; p.rightFoot.x -= 20;
      p.leftLeg.x *= 0.6; p.rightLeg.x *= 0.6;
      return p;
    }
  },
  bow: {
    duration: 3, loop: true, source: 'authored',
    pose: (t) => {
      const ph = t % 3;
      const b = smooth(ph, 0, 0.9) * (1 - smooth(ph, 1.8, 2.7));
      const p = {};
      p.spine = { x: 50 * b };
      p.head = { x: -18 * b };
      p.leftUpLeg = { x: -12 * b }; p.rightUpLeg = { x: -12 * b };
      p.leftLeg = { x: 10 * b }; p.rightLeg = { x: 10 * b };
      p.leftUpperArm = { x: -8 * b }; p.rightUpperArm = { x: -8 * b };
      return withIdle(p, t);
    }
  },
  shrug: {
    duration: 2, loop: true, source: 'authored',
    pose: (t) => {
      const s2 = 0.5 - 0.5 * Math.cos(2 * Math.PI * t / 2);
      const p = {};
      p.leftClavicle = { x: -14 * s2 }; p.rightClavicle = { x: -14 * s2 };
      p.leftUpperArm = { z: 6 * s2 }; p.rightUpperArm = { z: -6 * s2 };
      p.head = { y: 3 * s2 };
      return withIdle(p, t);
    }
  },
  'reach-up': {
    duration: 3, loop: true, source: 'authored',
    pose: (t) => {
      const ph = t % 3;
      const r = smooth(ph, 0, 0.9) * (1 - smooth(ph, 2.1, 2.8));
      const p = {};
      p.leftUpperArm = { x: -170 * r, z: 8 * r };
      p.rightUpperArm = { x: -170 * r, z: -8 * r };
      p.leftForeArm = { x: -12 * r }; p.rightForeArm = { x: -12 * r };
      p.spine = { x: -6 * r };
      p.head = { x: -12 * r };
      return withIdle(p, t);
    }
  },
  clap: {
    duration: 2, loop: true, source: 'authored',
    pose: (t) => {
      const a = Math.abs(Math.sin(2 * Math.PI * 1.5 * t));
      const p = {};
      p.leftUpperArm = { x: -35, z: -50 * a + -8 };
      p.rightUpperArm = { x: -35, z: 50 * a + 8 };
      p.leftForeArm = { x: -65 }; p.rightForeArm = { x: -65 };
      return withIdle(p, t);
    }
  },
  'head-signals': {
    duration: 4, loop: true, source: 'authored',
    pose: (t) => {
      const ph = t % 4;
      const nod = ph < 2 ? Math.sin(2 * Math.PI * 1.2 * ph) : 0;
      const shake = ph >= 2 ? Math.sin(2 * Math.PI * 1.1 * (ph - 2)) : 0;
      const p = {};
      p.head = { x: 18 * nod, y: 24 * shake };
      p.spine = { x: 3 * nod };
      return withIdle(p, t);
    }
  },
  squat: {
    duration: 3, loop: true, source: 'authored',
    pose: (t) => {
      const ph = t % 3;
      const d = smooth(ph, 0.2, 1.2) * (1 - smooth(ph, 1.8, 2.8));
      const p = {};
      p.root = { y: -0.34 * d };
      p.leftUpLeg = { x: -95 * d }; p.rightUpLeg = { x: -95 * d };
      p.leftLeg = { x: 100 * d }; p.rightLeg = { x: 100 * d };
      p.leftFoot = { x: -30 * d }; p.rightFoot = { x: -30 * d };
      p.spine = { x: 25 * d };
      p.leftUpperArm = { x: -70 * d }; p.rightUpperArm = { x: -70 * d };
      return withIdle(p, t);
    }
  },
  'sit-stand': {
    duration: 4, loop: true, source: 'authored',
    pose: (t) => {
      const ph = t % 4;
      const d = smooth(ph, 0.3, 1.6) * (1 - smooth(ph, 2.4, 3.6));
      const p = {};
      p.root = { y: -0.42 * d, z: 0.12 * d };
      p.leftUpLeg = { x: -100 * d }; p.rightUpLeg = { x: -100 * d };
      p.leftLeg = { x: 95 * d }; p.rightLeg = { x: 95 * d };
      p.leftFoot = { x: -25 * d }; p.rightFoot = { x: -25 * d };
      p.spine = { x: 30 * d };
      p.leftUpperArm = { x: -45 * d }; p.rightUpperArm = { x: -45 * d };
      return withIdle(p, t);
    }
  },
  lunge: {
    duration: 3, loop: true, source: 'authored',
    pose: (t) => {
      const ph = t % 3;
      const w = smooth(ph, 0.3, 1.1) * (1 - smooth(ph, 1.9, 2.7));
      const p = {};
      p.root = { y: -0.28 * w };
      p.leftUpLeg = { x: -55 * w }; p.leftLeg = { x: 35 * w }; p.leftFoot = { x: -10 * w };
      p.rightUpLeg = { x: 45 * w }; p.rightLeg = { x: 50 * w }; p.rightFoot = { x: 40 * w };
      p.spine = { x: 8 * w };
      p.leftUpperArm = { x: -20 * w }; p.rightUpperArm = { x: -20 * w };
      return withIdle(p, t);
    }
  },
  wave: {
    duration: 3, loop: true, source: 'authored',
    pose: (t) => {
      const tt = t % 3;
      const raise = smooth(tt, 0, 0.5);
      const lower = smooth(tt, 2.5, 2.95);
      const up = raise * (1 - lower);
      const osc = Math.sin(2 * Math.PI * 2 * t);
      const oscLead = Math.sin(2 * Math.PI * 2 * t + 0.5);
      const p = {};
      p.leftUpperArm = { z: 150 * up, x: -8 };
      p.leftForeArm = { z: (14 + 22 * oscLead) * up };
      p.leftHand = { z: 16 * osc * up }; // wrist snaps behind the forearm
      p.chest = { z: -4 * up };
      p.head = { z: 5 * up, y: 3 * up };
      p.root = { rz: -1.5 * up };
      return withIdle(p, t);
    }
  },
  handshake: {
    duration: 2.4, loop: true, source: 'authored',
    pose: (t) => {
      const reach = smooth(t, 0.1, 0.5) * (1 - smooth(t, 2.0, 2.35));
      const pump = Math.sin(2 * Math.PI * 1.6 * t);
      const pumpLag = Math.sin(2 * Math.PI * 1.6 * t - 0.6); // wrist lags elbow
      const p = {};
      p.rightUpperArm = { x: -42 * reach, z: -8 * reach };
      p.rightForeArm = { x: (-86 + 12 * pump) * reach };
      p.rightHand = { x: 7 * pumpLag * reach, z: -4 * reach };
      p.spine = { x: 8 * reach };
      p.head = { x: 6 * reach };
      p.leftUpperArm = { x: -6 * reach };
      return withIdle(p, t);
    }
  },
  chew: {
    duration: 3.2, loop: true, source: 'authored',
    pose: (t) => {
      const cycle = Math.sin(2 * Math.PI * 1.25 * t);
      const grind = Math.sin(2 * Math.PI * 0.62 * t);
      const p = {};
      p.jaw = { x: 9 + 7 * Math.max(0, cycle), z: 3 * grind };
      p.head = { x: 2.5 * cycle - 1 * Math.max(0, cycle), z: 1.5 * grind };
      return withIdle(p, t);
    }
  },
  talk: {
    duration: 3.6, loop: true, source: 'authored',
    pose: (t) => {
      const p = {};
      const j = 2.5 + 2 * Math.sin(2 * Math.PI * 2.1 * t) + 1.6 * Math.sin(2 * Math.PI * 3.3 * t + 1.1) + 1.2 * Math.sin(2 * Math.PI * 5.2 * t + 0.4);
      p.jaw = { x: Math.max(0.6, j) };
      p.head = { y: 4 * Math.sin(2 * Math.PI * 0.4 * t), x: 2 * Math.sin(2 * Math.PI * 0.9 * t) };
      return withIdle(p, t);
    }
  }
};

export function applyAuthoredPose(rig, poseMap) {
  const D2R = Math.PI / 180;
  for (const [bone, rot] of Object.entries(poseMap)) {
    if (bone === 'root') {
      rig.bones.root.position.set(rot.x || 0, 1.0 + (rot.y || 0), rot.z || 0);
      rig.bones.root.rotation.set((rot.rx || 0) * D2R, (rot.ry || 0) * D2R, (rot.rz || 0) * D2R);
      continue;
    }
    const b = rig.bones[bone];
    if (!b) continue;
    b.rotation.set((rot.x || 0) * D2R, (rot.y || 0) * D2R, (rot.z || 0) * D2R);
  }
}


// Phase 92 (C6/D7): clinical comparison patterns — exaggerated teaching
// caricatures rendered as a translucent ghost beside the captured normal gait.
// Explicitly NOT diagnostic; mapped to Kinesiology II pathology introductions.
export const CLINICAL_PATTERNS = [
  {
    id: 'trendelenburg',
    label: 'Trendelenburg-style drop (caricature)',
    pose: (t) => {
      const p = gait(t, { period: 1.1, hip: 26, knee: 46, arm: 16, bounce: 0.016, trunk: 4 });
      const ph = (2 * Math.PI * t) / 1.1;
      const stanceL = Math.max(0, Math.sin(ph));
      p.root.rz = (p.root.rz || 0) + 7 * stanceL;
      p.spine.y = (p.spine.y || 0) - 5 * stanceL;
      return p;
    }
  },
  {
    id: 'antalgic',
    label: 'Antalgic-style short stance (caricature)',
    pose: (t) => {
      const p = gait(t, { period: 1.1, hip: 22, knee: 40, arm: 14, bounce: 0.012, trunk: 6 });
      const ph = (2 * Math.PI * t) / 1.1;
      const L = Math.max(0, Math.sin(ph));
      p.leftUpLeg.x *= 1 - 0.35 * L;
      p.leftLeg.x *= 1 - 0.3 * L;
      p.root.y *= 0.7;
      return p;
    }
  }
];
