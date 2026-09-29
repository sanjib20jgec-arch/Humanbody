// CMU-BVH → performance-rig rotation retargeter (intrinsic channel-order exact).
// Rotations only for joints (rig keeps its own proportions); root translation is
// scaled and calibrated. Foot-slide tolerance disclosed in-module.

const AXIS = { Xrotation: [1, 0, 0], Yrotation: [0, 1, 0], Zrotation: [0, 0, 1] };

export function rigNameFor(name) {
  const n = name.toLowerCase();
  const side = /^(l|r|left|right)[_\-]?/.test(n) ? (n.startsWith('l') ? 'left' : 'right') : null;
  const core = n.replace(/^(left|right|l|r)[_\-]?/, '');
  if (n === 'root' || core === 'hips' || core === 'root') return 'root';
  if (core.includes('lowerback') || core.includes('abdomen')) return 'spine';
  if (core.includes('upperback') || core === 'thorax' || core === 'chest') return 'chest';
  if (core === 'lowerneck' || core === 'neck') return 'neck';
  if (core === 'upperneck') return 'head';
  if (core === 'head') return 'head';
  if (core.includes('jaw')) return 'jaw';
  if (core.includes('clav') || core.includes('shoulder')) return side + 'Clavicle';
  if (core.includes('upperarm') || core === 'arm' || core.includes('uarm')) return side + 'UpperArm';
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

// One-time per clip+side: detect stance windows and capture plant targets.
export function computeStanceData(THREE, rig, bvh, cal, side) {
  const foot = rig.bones[`${side}Foot`];
  const leg = rig.bones[`${side}Leg`];
  const pos = [];
  const ankles = [];
  for (let f = 0; f < bvh.frames; f++) {
    applyBVHFrame(THREE, rig, bvh, f, cal);
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
  // Height-based contact test (slide-tolerant): foot within 4 cm of its lowest point.
  const stance = pos.map((p, i) => p.y < 0.12 && speed[i] < 1.0);
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
