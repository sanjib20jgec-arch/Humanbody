// Phase 82: sagittal joint-angle readout (teaching convention, not ISB claims).
// Angles are signed sagittal-plane bends, calibrated so frame 0 (quiet standing
// in the clip) reads ~0°, which keeps curves intuitive for learners.

const X_AXIS = { x: 1, y: 0, z: 0 };

function sag(u, rootQ, THREE) {
  // express world direction in root frame and flatten to the sagittal (Y-Z) plane
  const v = u.clone().applyQuaternion(rootQ.clone().invert());
  v.x = 0;
  return v.normalize();
}

function signedDeg(a, b) {
  // signed angle from b to a about +X (forward flexion positive for +Z-forward)
  const cross = b.y * a.z - b.z * a.y;
  const dot = a.y * b.y + a.z * b.z;
  return (Math.atan2(cross, dot) * 180) / Math.PI;
}

export function sampleSagittalAngles(THREE, rig, applyFrame, frame, cal, offset) {
  applyFrame(frame);
  rig.root.updateMatrixWorld(true);
  const rootQ = rig.bones.root.quaternion;
  const dir = (bone) => new THREE.Vector3(0, -1, 0).applyQuaternion(bone.getWorldQuaternion(new THREE.Quaternion()));
  const thigh = sag(dir(rig.bones.leftUpLeg), rootQ, THREE);
  const shank = sag(dir(rig.bones.leftLeg), rootQ, THREE);
  const foot = sag(dir(rig.bones.leftFoot), rootQ, THREE);
  const trunk = sag(new THREE.Vector3(0, -1, 0).applyQuaternion(rootQ), rootQ, THREE);
  const raw = {
    hip: signedDeg(thigh, trunk),
    knee: Math.abs(signedDeg(shank, thigh)),
    ankle: signedDeg(foot, shank)
  };
  return {
    hip: raw.hip - offset.hip,
    knee: raw.knee - offset.knee,
    ankle: raw.ankle - offset.ankle
  };
}

export function calibrateAngles(THREE, rig, applyFrame, frames) {
  applyFrame(frames[0]);
  rig.root.updateMatrixWorld(true);
  const rootQ = rig.bones.root.quaternion;
  const dir = (bone) => new THREE.Vector3(0, -1, 0).applyQuaternion(bone.getWorldQuaternion(new THREE.Quaternion()));
  const thigh = sag(dir(rig.bones.leftUpLeg), rootQ, THREE);
  const shank = sag(dir(rig.bones.leftLeg), rootQ, THREE);
  const foot = sag(dir(rig.bones.leftFoot), rootQ, THREE);
  const trunk = sag(new THREE.Vector3(0, -1, 0).applyQuaternion(rootQ), rootQ, THREE);
  return { hip: signedDeg(thigh, trunk), knee: Math.abs(signedDeg(shank, thigh)), ankle: signedDeg(foot, shank) };
}

// Typical sagittal ranges while walking, piecewise keypoints over %gait cycle
// (teaching estimates after RLA gait-analysis teaching sources; see
// docs/KINESIOLOGY_INDUSTRY_BENCHMARK_V2.md §1.2). Band = keypoint ± margin.
export const NORM_BANDS = {
  hip: { margin: 7, keys: [[0, 30], [10, 25], [30, 5], [50, -8], [60, 2], [75, 32], [90, 25], [100, 30]] },
  knee: { margin: 9, keys: [[0, 5], [15, 18], [30, 10], [45, 5], [62, 12], [72, 62], [85, 28], [100, 5]] },
  ankle: { margin: 6, keys: [[0, 0], [8, -8], [30, 8], [45, 10], [60, -16], [72, -2], [85, 2], [100, 0]] }
};

export function bandAt(band, pct) {
  const k = band.keys;
  for (let i = 1; i < k.length; i++) {
    if (pct <= k[i][0]) {
      const [p0, v0] = k[i - 1];
      const [p1, v1] = k[i];
      const w = p1 === p0 ? 0 : (pct - p0) / (p1 - p0);
      return v0 + (v1 - v0) * w;
    }
  }
  return k[k.length - 1][1];
}

export function curvePath(values, w, h, min = -30, max = 80) {
  const n = values.length;
  return values.map((v, i) => {
    const x = (i / (n - 1)) * w;
    const y = h - ((Math.min(max, Math.max(min, v)) - min) / (max - min)) * h;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

export function bandPolygon(band, w, h, min = -30, max = 80) {
  const top = [];
  const bottom = [];
  for (let p = 0; p <= 100; p += 5) {
    const v = bandAt(band, p);
    const x = (p / 100) * w;
    top.push(`${x.toFixed(1)},${(h - ((Math.min(max, Math.max(min, v + band.margin)) - min) / (max - min)) * h).toFixed(1)}`);
    bottom.push(`${x.toFixed(1)},${(h - ((Math.min(max, Math.max(min, v - band.margin)) - min) / (max - min)) * h).toFixed(1)}`);
  }
  return top.concat(bottom.reverse()).join(' ');
}
