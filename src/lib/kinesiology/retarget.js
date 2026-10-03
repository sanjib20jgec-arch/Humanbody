// CMU-BVH → performance-rig rotation retargeter (intrinsic channel-order exact).
// Rotations only for joints (rig keeps its own proportions); root translation is
// scaled and calibrated. Foot-slide tolerance disclosed in-module.

const AXIS = { Xrotation: [1, 0, 0], Yrotation: [0, 1, 0], Zrotation: [0, 0, 1] };

export function rigNameFor(name) {
  const n = name.toLowerCase();
  const side = /^(l|r|left|right)[_\-]?/.test(n) ? (n.startsWith('l') ? 'left' : 'right') : null;
  const core = n.replace(/^(left|right|l|r)[_\-]?/, '');
  // 'hip' is the CMU root joint name (the clip's Hips node is literally `hip`,
  // with 3 position + 3 rotation channels). It used to fall through to null, so
  // the pelvis rotation was silently dropped and only the translation survived.
  if (n === 'root' || core === 'hips' || core === 'hip' || core === 'root') return 'root';
  if (core.includes('lowerback') || core.includes('abdomen')) return 'spine';
  if (core.includes('upperback') || core === 'thorax' || core === 'chest') return 'chest';
  if (core === 'lowerneck' || core === 'neck') return 'neck';
  if (core === 'upperneck') return 'head';
  if (core === 'head') return 'head';
  if (core.includes('jaw')) return 'jaw';
  if (core.includes('clav') || core.includes('shoulder')) return side + 'Clavicle';
  if (core.includes('upperarm') || core === 'arm' || core.includes('uarm')) return side + 'UpperArm';
  // NOT mapped on purpose: CMU's `lCollar`/`lShldr`/`lForeArm`/`lHand`.
  //
  // This retargeter maps by NAME and assumes the source joint's rest orientation
  // equals the rig bone's rest orientation. Measured against the shipped clips
  // (`walk_cmu.bvh`, offsets in cm):
  //
  //   lShldr -> lForeArm   offset (28.2, -1.7, 0.5)   arm points +X (T-pose)
  //   rig leftUpperArm ->  offset (0, -0.30, 0)        arm points -Y (down)
  //   lForeArm -> lHand    offset (22.6, 0.8, 7.1)    also +X
  //   lThigh -> lShin      offset (0, -36.8, 0.7)     -Y  == rig convention
  //
  // Legs, spine, neck and head agree with the rig; the arm chain does not. The
  // capture therefore carries a large constant shoulder rotation (about -80 deg)
  // that exists only to hold the arms down out of the T-pose. Mapping `shldr`
  // without a rest-frame correction applies that constant to a bone whose rest is
  // already "down", which throws the arm backwards (measured: shoulder-to-elbow
  // direction swinging -82..+71 deg in the body frame, versus about +-20 deg for
  // walking). Leaving the arm chain unmapped is the smaller lie: the arms hang and
  // swing less than the capture, and they do not jump.
  //
  // Phase 2 owns the real fix — a rest-pose-aware retarget that carries the
  // source segment frame (`R = rot(d_rest_target -> d_rest_source)`,
  // `q_target = A_parent_target^-1 * A_source * R`) and an acceptance test that
  // shoulder swing stays inside a physiological band for walking. Tracked as R3.
  if (core.includes('collar') || core.includes('shldr')) return null;
  if (core.includes('lowerarm') || core.includes('forearm') || core.includes('larm')) return side + 'ForeArm';
  if (core.includes('hand') || core.includes('wrist')) return side + 'Hand';
  if (core.includes('femur') || core.includes('thigh') || core.includes('upleg')) return side + 'UpLeg';
  if (core.includes('tibia') || core.includes('shin') || core === 'leg') return side + 'Leg';
  if (core.includes('foot') || core.includes('ankle')) return side + 'Foot';
  return null; // eyes, fingers, toes: intentionally unmapped in v1
}

function channelQuaternion(THREE, node, frame, bvh) {
  const q = new THREE.Quaternion();
  let base = frame * bvh.channelCount;
  for (const j of bvh.order) { if (j === node) break; base += j.channels.length; }
  node.channels.forEach((ch, k) => {
    const axis = AXIS[ch];
    if (!axis) return; // position channels handled separately
    const rad = (bvh.data[base + k] * Math.PI) / 180;
    q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(...axis), rad));
  });
  return q;
}

// Exported for the Phase 2 motion baker: the baked asset stores the RAW BVH
// root position (centimetres) so the runtime keeps ownership of the scale/heading
// calibration and a future rig swap cannot bake in this rig's proportions.
export function readRootPosition(bvh, frame) { return rootPosition(bvh, frame); }

function rootPosition(bvh, frame) {
  const node = bvh.order[0];
  let base = frame * bvh.channelCount;
  const v = { x: 0, y: 0, z: 0 };
  node.channels.forEach((ch, k) => {
    if (ch === 'Xposition') v.x = bvh.data[base + k];
    if (ch === 'Yposition') v.y = bvh.data[base + k];
    if (ch === 'Zposition') v.z = bvh.data[base + k];
  });
  return v;
}

export function computeCalibration(THREE, bvh) {
  // Scale: match BVH femur→tibia offset length to rig femur (0.46 m).
  let scale = 0.01;
  for (const node of bvh.order) {
    if (rigNameFor(node.name) === 'leftUpLeg' || rigNameFor(node.name) === 'rightUpLeg') {
      const child = node.children[0];
      if (child) {
        const len = Math.hypot(...child.offset);
        if (len > 0) scale = 0.44 / len;
      }
      break;
    }
  }
  // Vertical calibration: lowest sampled root should place feet near floor.
  const legDrop = (() => {
    let femur = 0, tibia = 0, foot = 0;
    for (const node of bvh.order) {
      const r = rigNameFor(node.name);
      if (r === 'leftUpLeg') femur = Math.hypot(...node.children[0]?.offset || node.offset);
      if (r === 'leftLeg') tibia = Math.hypot(...node.offset);
      if (r === 'leftFoot') foot = Math.hypot(...node.offset);
    }
    return (femur + tibia) * scale + 0.07;
  })();
  let minY = Infinity;
  const step = Math.max(1, Math.floor(bvh.frames / 40));
  for (let f = 0; f < bvh.frames; f += step) minY = Math.min(minY, rootPosition(bvh, f).y);
  const yOffset = legDrop - minY * scale;

  // Heading yaw: average travel direction → face +Z.
  const a = rootPosition(bvh, 0);
  const b = rootPosition(bvh, bvh.frames - 1);
  const dx = b.x - a.x, dz = b.z - a.z;
  const yaw = Math.hypot(dx, dz) > 1e-4 ? Math.atan2(dx, dz) : 0;
  return { scale, yOffset, yaw };
}

export function applyBVHFrame(THREE, rig, bvh, frame, cal, opts = {}) {
  const treadmill = opts.treadmill !== false;
  const cos = Math.cos(cal.yaw), sin = Math.sin(cal.yaw);
  for (const node of bvh.order) {
    const rigBone = rigNameFor(node.name);
    if (!rigBone || !rig.bones[rigBone]) continue;
    rig.bones[rigBone].quaternion.copy(channelQuaternion(THREE, node, frame, bvh));
  }
  const p = rootPosition(bvh, frame);
  const x = treadmill ? 0 : (p.x * cos - p.z * sin) * cal.scale;
  const z = treadmill ? 0 : (p.x * sin + p.z * cos) * cal.scale;
  rig.bones.root.position.set(x, p.y * cal.scale + cal.yOffset, z);
}

// Empirical ground calibration: shift so the lowest sampled foot rests at ~2 cm.
export function finalizeGround(THREE, rig, bvh, cal) {
  let minY = Infinity;
  const step = Math.max(1, Math.floor(bvh.frames / 60));
  for (let f = 0; f < bvh.frames; f += step) {
    applyBVHFrame(THREE, rig, bvh, f, cal);
    rig.root.updateMatrixWorld(true);
    for (const side of ['left', 'right']) {
      const v = new THREE.Vector3();
      rig.bones[`${side}Foot`].getWorldPosition(v);
      minY = Math.min(minY, v.y);
    }
  }
  cal.yOffset += 0.02 - minY;
  return cal;
}

// ---- Phase 76: stance-phase foot-plant two-bone IK (sagittal plane) ----
const clampN = (v, a, b) => Math.min(b, Math.max(a, v));

/**
 * Contact rule (Phase 2, replaces the height+speed rule of Phase 76).
 *
 * A foot is planted when it is not moving over the ground — measured in the
 * CAPTURE frame (`treadmill: false`), where a planted foot is stationary while
 * the body travels past it. The old rule (`ankle y < 12 cm && speed < 1.0 m/s`
 * in the treadmill frame) was speed-dependent: the 1 m/s threshold sits just
 * above the walk's own travel speed (0.46-0.9 m/s), so a slightly faster clip
 * would report no contacts at all. It also merged or split windows depending on
 * where the ground calibration happened to land.
 *
 * Measured on the shipped walk range (frames 0-63), per side, with the same
 * downstream IK acceptance test:
 *
 *   rule                        windows (left)      foot slide naive -> IK
 *   ankle y < 12 cm & v < 1.0   [0,36] [45,63]       0.920 -> 0.314  (34 %)
 *   ankle height < min + 4 cm   [0,5] [13,33] [46,63]  0.773 -> 0.151  (20 %)
 *   capture speed < 0.25 m/s    [16,32] [50,63]       0.556 -> 0.084  (15 %)  <-- used
 *
 * The chosen rule yields two stance windows of ~0.5 s per side (a ~50 % duty
 * cycle against the ~60 % a healthy walk shows) and a cadence of ~106 steps/min
 * at the clip's 0.46 m/s, which is self-consistent with the captured travel.
 * `verify:kine-timeline` pins the window count and the IK ratio; the anatomical
 * review of heel-strike/toe-off *labels* is still an SME item (R10).
 */
export const CONTACT_SPEED_MS = 0.25;

// One-time per clip+side: detect stance windows and capture plant targets.
export function computeStanceData(THREE, rig, bvh, cal, side) {
  const foot = rig.bones[`${side}Foot`];
  const leg = rig.bones[`${side}Leg`];
  const pos = [];
  const ankles = [];
  for (let f = 0; f < bvh.frames; f++) {
    // Capture frame: the planted foot is the one that is not moving.
    applyBVHFrame(THREE, rig, bvh, f, cal, { treadmill: false });
    rig.root.updateMatrixWorld(true);
    const v = new THREE.Vector3();
    foot.getWorldPosition(v);
    pos.push(v);
    const a = new THREE.Vector3();
    leg.getWorldPosition(a);
    a.add(new THREE.Vector3(0, -0.44, 0).applyQuaternion(leg.quaternion));
    ankles.push(a);
  }
  const speed = pos.map((p, i) => (i ? Math.hypot(p.x - pos[i - 1].x, p.z - pos[i - 1].z) / bvh.frameTime : 0));
  // Contact = the foot is not travelling over the ground (see CONTACT_SPEED_MS).
  const stance = speed.map((v, i) => (i > 0 && v < CONTACT_SPEED_MS));
  for (let i = 1; i < stance.length - 1; i++) if (stance[i - 1] && stance[i + 1]) stance[i] = true; // fill 1-frame gaps
  const windows = [];
  let start = -1;
  for (let i = 0; i <= stance.length; i++) {
    if (i < stance.length && stance[i] && start < 0) start = i;
    if ((i === stance.length || !stance[i]) && start >= 0) {
      if (i - start >= 6) windows.push({ start, end: i - 1, target: ankles[start].clone() });
      start = -1;
    }
  }
  return { windows };
}

// Override hip/knee pitch during stance so the planted foot stays put.
export function applyFootPlant(THREE, rig, frame, data, side) {
  if (!data) return false;
  const w = data.windows.find((win) => frame >= win.start && frame <= win.end);
  if (!w) return false;
  const hip = rig.bones[`${side}UpLeg`];
  const knee = rig.bones[`${side}Leg`];
  // Solve in the root frame (hip's parent frame): hip.rotation is applied relative to it.
  const hipW = new THREE.Vector3();
  hip.getWorldPosition(hipW);
  const t = w.target.clone().sub(hipW).applyQuaternion(rig.bones.root.quaternion.clone().invert());
  const dy = t.y;
  const dz = t.z;
  const L1 = 0.46, L2 = 0.44;
  const dist = clampN(Math.hypot(dy, dz), Math.abs(L1 - L2) + 0.02, L1 + L2 - 0.02);
  const chord = Math.atan2(dz, -dy);
  const A = Math.acos(clampN((L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist), -1, 1));
  const K = Math.acos(clampN((L1 * L1 + L2 * L2 - dist * dist) / (2 * L1 * L2), -1, 1));
  hip.rotation.x = -(chord + A);
  knee.rotation.x = Math.PI - K;
  // Lateral correction: pelvic sway is absorbed by a small hip abduction.
  rig.root.updateMatrixWorld(true);
  const afterW = new THREE.Vector3();
  rig.bones[`${side}Foot`].getWorldPosition(afterW);
  const inv = rig.bones.root.quaternion.clone().invert();
  const aR = afterW.clone().sub(hipW).applyQuaternion(inv);
  const tR = w.target.clone().sub(hipW).applyQuaternion(inv);
  hip.rotation.z += Math.asin(clampN((tR.x - aR.x) / 0.9, -0.25, 0.25));
  return true;
}

// Foot-slide metric: horizontal planted-foot travel during stance windows.
export function measureFootSlide(THREE, rig, bvh, cal, data, side, withIK) {
  let slide = 0;
  let prev = null;
  for (const w of data.windows) {
    prev = null;
    for (let f = w.start; f <= w.end; f++) {
      Object.values(rig.bones).forEach((b) => b.rotation.set(0, 0, 0));
      applyBVHFrame(THREE, rig, bvh, f, cal);
      if (withIK) { rig.root.updateMatrixWorld(true); applyFootPlant(THREE, rig, f, data, side); }
      rig.root.updateMatrixWorld(true);
      const v = new THREE.Vector3();
      rig.bones[`${side}Foot`].getWorldPosition(v);
      if (prev) slide += Math.hypot(v.x - prev.x, v.z - prev.z);
      prev = v.clone();
    }
  }
  return slide;
}
