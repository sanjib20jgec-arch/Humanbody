// Authored articulated performance rig (Kinesiology Theater v1, decision D6).
// Procedural, in-house (CC0-equivalent). Realistic adult proportions (~1.75 m),
// rigid segments with spherical joint blending, named muscle meshes for the
// activation system. NOT the certified BodyParts3D reference.
//
// Movement Theater Phase 1 additions (Masterplan §4.2/§4.3, audit A10/A14):
//   * activation colouring no longer allocates a THREE.Color per muscle per
//     frame, and now skips muscles whose level+role did not change — a paused
//     figure does zero colour work;
//   * "activation heat" and "joint markers" are real switches instead of the
//     dead toggles the audit found (the browser specs asserted methods that did
//     not exist);
//   * selection produces a single shared outline object, so a legend selection
//     does not add 54 transparent draws.

const BONE_TREE = [
  { name: 'root', len: 0 },
  { name: 'spine', parent: 'root', len: 0.14, at: [0, 0.06, 0] },
  { name: 'chest', parent: 'spine', len: 0.2, at: [0, 0.14, 0] },
  { name: 'neck', parent: 'chest', len: 0.09, at: [0, 0.2, 0] },
  { name: 'head', parent: 'neck', len: 0.22, at: [0, 0.09, 0] },
  { name: 'jaw', parent: 'head', len: 0.12, at: [0, -0.02, 0.06] },
  { name: 'leftClavicle', parent: 'chest', len: 0.16, at: [0.04, 0.17, 0] },
  { name: 'leftUpperArm', parent: 'leftClavicle', len: 0.3, at: [0.14, 0, 0] },
  { name: 'leftForeArm', parent: 'leftUpperArm', len: 0.27, at: [0, -0.3, 0] },
  { name: 'leftHand', parent: 'leftForeArm', len: 0.17, at: [0, -0.27, 0] },
  { name: 'rightClavicle', parent: 'chest', len: 0.16, at: [-0.04, 0.17, 0] },
  { name: 'rightUpperArm', parent: 'rightClavicle', len: 0.3, at: [-0.14, 0, 0] },
  { name: 'rightForeArm', parent: 'rightUpperArm', len: 0.27, at: [0, -0.3, 0] },
  { name: 'rightHand', parent: 'rightForeArm', len: 0.17, at: [0, -0.27, 0] },
  { name: 'leftUpLeg', parent: 'root', len: 0.46, at: [0.1, -0.04, 0] },
  { name: 'leftLeg', parent: 'leftUpLeg', len: 0.44, at: [0.46 * 0 + 0, -0.46, 0] },
  { name: 'leftFoot', parent: 'leftLeg', len: 0.24, at: [0, -0.44, 0] },
  { name: 'rightUpLeg', parent: 'root', len: 0.46, at: [-0.1, -0.04, 0] },
  { name: 'rightLeg', parent: 'rightUpLeg', len: 0.44, at: [0, -0.46, 0] },
  { name: 'rightFoot', parent: 'rightLeg', len: 0.24, at: [0, -0.44, 0] }
];

// Muscle anchor table: owning bone, local from/to (m), radii, default role class.
export const MUSCLES = [
  { id: 'gluteusMaximus', side: true, bone: 'UpLeg', from: [0.02, 0.05, -0.06], to: [0.01, -0.16, -0.07], r: 0.055 },
  { id: 'gluteusMedius', side: true, bone: 'root', from: [0.11, 0.02, 0.0], to: [0.13, -0.07, 0.01], r: 0.045 },
  { id: 'rectusFemoris', side: true, bone: 'UpLeg', from: [0.02, -0.05, 0.07], to: [0.012, -0.4, 0.058], r: 0.028 },
  { id: 'quadriceps', side: true, bone: 'UpLeg', from: [0.01, -0.05, 0.06], to: [0.0, -0.4, 0.05], r: 0.06 },
  { id: 'hamstrings', side: true, bone: 'UpLeg', from: [0.0, -0.06, -0.06], to: [0.0, -0.4, -0.045], r: 0.05 },
  { id: 'iliopsoas', side: true, bone: 'UpLeg', from: [0.02, 0.06, 0.04], to: [0.01, -0.12, 0.05], r: 0.04 },
  { id: 'gastrocnemius', side: true, bone: 'Leg', from: [0.0, -0.02, -0.05], to: [0.0, -0.24, -0.03], r: 0.05 },
  { id: 'tibialisAnterior', side: true, bone: 'Leg', from: [0.01, -0.04, 0.045], to: [0.01, -0.34, 0.03], r: 0.032 },
  { id: 'soleus', side: true, bone: 'Leg', from: [-0.01, -0.1, -0.04], to: [0.0, -0.32, -0.02], r: 0.036 },
  { id: 'rectusAbdominis', side: false, bone: 'spine', from: [0, 0.02, 0.09], to: [0, 0.3, 0.1], r: 0.05 },
  { id: 'erectorSpinae', side: false, bone: 'spine', from: [0, 0.02, -0.08], to: [0, 0.32, -0.09], r: 0.05 },
  { id: 'obliquusExternus', side: true, bone: 'spine', from: [0.11, 0.06, 0.05], to: [0.12, 0.26, 0.03], r: 0.045 },
  { id: 'latissimusDorsi', side: true, bone: 'chest', from: [0.09, -0.06, -0.07], to: [0.05, 0.12, -0.08], r: 0.05 },
  { id: 'serratusAnterior', side: true, bone: 'chest', from: [0.11, -0.08, 0.02], to: [0.1, 0.08, 0.05], r: 0.04 },
  { id: 'upperTrapezius', side: true, bone: 'chest', from: [0.03, 0.16, -0.03], to: [0.14, 0.19, 0.0], r: 0.035 },
  { id: 'deltoid', side: true, bone: 'UpperArm', from: [0.02, 0.03, 0.0], to: [0.05, -0.08, 0.0], r: 0.055 },
  { id: 'bicepsBrachii', side: true, bone: 'UpperArm', from: [0.01, -0.04, 0.04], to: [0.0, -0.26, 0.04], r: 0.042 },
  { id: 'tricepsBrachii', side: true, bone: 'UpperArm', from: [0.0, -0.04, -0.04], to: [0.0, -0.27, -0.035], r: 0.045 },
  { id: 'forearmFlexors', side: true, bone: 'ForeArm', from: [0.0, -0.02, 0.03], to: [0.0, -0.22, 0.02], r: 0.036 },
  { id: 'forearmExtensors', side: true, bone: 'ForeArm', from: [0.0, -0.02, -0.03], to: [0.0, -0.2, -0.02], r: 0.033 },
  { id: 'pronatorTeres', side: true, bone: 'ForeArm', from: [0.012, -0.01, 0.025], to: [0.005, -0.13, 0.012], r: 0.018 },
  { id: 'adductorPollicis', side: true, bone: 'Hand', from: [0.0, -0.01, 0.02], to: [0.012, -0.07, 0.03], r: 0.012 },
  { id: 'supraspinatus', side: true, bone: 'chest', from: [0.05, 0.17, 0.0], to: [0.15, 0.18, 0.0], r: 0.03 },
  { id: 'masseter', side: true, bone: 'head', from: [0.06, -0.04, 0.04], to: [0.055, -0.11, 0.06], r: 0.026 },
  { id: 'lateralPterygoid', side: true, bone: 'head', from: [0.04, -0.01, 0.075], to: [0.035, -0.07, 0.085], r: 0.016 },
  { id: 'temporalis', side: true, bone: 'head', from: [0.06, 0.03, 0.04], to: [0.06, -0.03, 0.06], r: 0.03 },
  { id: 'digastric', side: false, bone: 'jaw', from: [0, 0.0, -0.02], to: [0, -0.08, -0.03], r: 0.016 },
  { id: 'orbicularisOris', side: false, bone: 'head', from: [0, -0.09, 0.115], to: [0, -0.115, 0.115], r: 0.022 },
  { id: 'buccinator', side: true, bone: 'head', from: [0.05, -0.07, 0.09], to: [0.045, -0.1, 0.1], r: 0.02 }
];

/**
 * Functional-role palette (Masterplan §4.2 / audit A7).
 *
 * The previous triple (#ff5d47 / #ffb347 / #4dd8df) failed deuteranopia:
 * prime mover vs synergist separated by only ΔE*ab 19.9 and — worse — by hue
 * alone, which is exactly the axis a deutan viewer loses. A literal Okabe-Ito
 * triple also failed the deutan check (ΔE*ab 7.3-8.1) because the "sky blue"
 * and "bluish green" members collapse toward each other. These five values are
 * the smallest set from the Okabe-Ito family that clears deuteranopia AND
 * protanopia within its own hue-family groups, while intensity is carried by
 * LUMINANCE (see ACTIVATION_RAMP) rather than hue:
 *
 *   protanopia  min ΔE*ab 29.8   deuteranopia min ΔE*ab 23.8
 *   tritanopia  min ΔE*ab 16.5   (acceptable only with the shape/label
 *                                 redundancy the legend always shows)
 *
 * Role is always accompanied by its text label in the legend and by the role
 * letter on the muscle outline, so colour is redundant, never the only channel.
 */
export const ROLE_COLORS = {
  PM: 0x0072b2, // Agonist — blue
  SY: 0x009e73, // Synergist — bluish green
  AN: 0xd55e00, // Antagonist — vermillion
  ST: 0xb9c2cc, // Stabilizer — neutral grey-blue
  IN: 0x5a6472  // Inactive — dark grey
};

/**
 * Intensity ramp for activation heat mode (Masterplan §4.3).
 * A monotone-luminance viridis-like ramp: relative luminance rises 0.019 →
 * 0.782 across the five stops (7.9x), so intensity survives any colour-vision
 * deficiency as a brightness difference, not a hue difference.
 */
export const ACTIVATION_RAMP = [0x440154, 0x3b528b, 0x21918c, 0x5ec962, 0xfde725];

const MUSCLE_BASE = 0x8a3040;

/** Joint markers: where the rig's axes live, for the marker overlay. */
export const JOINT_MARKERS = BONE_TREE.filter((b) => b.name !== 'root').map((b) => b.name);

function rampColor(out, t) {
  const n = ACTIVATION_RAMP.length - 1;
  const x = Math.max(0, Math.min(1, t)) * n;
  const i = Math.min(n - 1, Math.floor(x));
  const f = x - i;
  const a = ACTIVATION_RAMP[i];
  const b = ACTIVATION_RAMP[i + 1];
  out.setRGB(
    ((a >> 16 & 255) + (((b >> 16 & 255) - (a >> 16 & 255)) * f)) / 255,
    ((a >> 8 & 255) + (((b >> 8 & 255) - (a >> 8 & 255)) * f)) / 255,
    ((a & 255) + (((b & 255) - (a & 255)) * f)) / 255
  );
  return out;
}

export function buildPerformanceRig(THREE, opts = {}) {
  const detail = opts.lowPoly ? 10 : 20;
  const skin = new THREE.MeshStandardMaterial({ color: 0xc7cdd6, roughness: 0.62, metalness: 0.08 });
  const muscleBase = new THREE.MeshStandardMaterial({ color: MUSCLE_BASE, roughness: 0.5, metalness: 0.05 });

  const root = new THREE.Group();
  root.name = 'performance-rig';
  const bones = {};
  const bodyGroup = new THREE.Group();
  const muscleGroup = new THREE.Group();
  root.add(bodyGroup, muscleGroup);

  for (const spec of BONE_TREE) {
    const bone = new THREE.Object3D();
    bone.name = spec.name;
    if (spec.parent) {
      bones[spec.parent].add(bone);
      bone.position.set(...spec.at);
    } else {
      bone.position.set(0, 1.0, 0);
      root.add(bone);
    }
    bones[spec.name] = bone;
  }

  const seg = (bone, radiusTop, radiusBottom, length, along, shift = [0, 0, 0], mat = skin) => {
    const geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, length, detail, 1);
    // Cylinder is Y-axis; limbs are built along -Y for legs/arms via `along`.
    geo.rotateX(along);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...shift);
    bone.add(mesh);
    return mesh;
  };
  const ball = (bone, r, at, mat = skin) => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, detail, Math.max(8, detail / 2)), mat);
    mesh.position.set(...at);
    bone.add(mesh);
    return mesh;
  };

  // Torso + head
  seg(bones.spine, 0.13, 0.15, 0.2, 0, [0, 0.08, 0]);
  seg(bones.chest, 0.15, 0.13, 0.24, 0, [0, 0.09, 0]);
  seg(bones.neck, 0.05, 0.05, 0.1, 0, [0, 0.04, 0]);
  ball(bones.head, 0.105, [0, 0.1, 0.01]);
  seg(bones.head, 0.05, 0.04, 0.09, Math.PI / 2.4, [0, -0.06, 0.09]); // facial plane hint
  seg(bones.jaw, 0.045, 0.035, 0.1, Math.PI / 2.6, [0, -0.045, 0.02]);

  for (const side of ['left', 'right']) {
    const s = side === 'left' ? 1 : -1;
    ball(bones[`${side}Clavicle`], 0.055, [0.1, 0, 0]);
    seg(bones[`${side}UpperArm`], 0.05, 0.04, 0.3, 0, [0, -0.15, 0]);
    ball(bones[`${side}UpperArm`], 0.045, [0, -0.3, 0]);
    seg(bones[`${side}ForeArm`], 0.042, 0.028, 0.27, 0, [0, -0.135, 0]);
    seg(bones[`${side}Hand`], 0.03, 0.022, 0.16, 0, [0, -0.08, 0]);
    const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.06, 3, Math.max(8, detail / 2)), skin);
    thumb.position.set(s * 0.02, -0.05, 0.035);
    thumb.rotation.set(Math.PI / 3, 0, s * -0.5);
    bones[`${side}Hand`].add(thumb);
    // Legs
    seg(bones[`${side}UpLeg`], 0.075, 0.055, 0.46, 0, [0, -0.23, 0]);
    ball(bones[`${side}UpLeg`], 0.055, [0, -0.46, 0]);
    seg(bones[`${side}Leg`], 0.052, 0.032, 0.44, 0, [0, -0.22, 0]);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.07, 0.24), skin);
    foot.position.set(0, -0.035, 0.08);
    bones[`${side}Foot`].add(foot);
  }

  // ---- muscle meshes: tapered tubes between anchors, one mesh per side ----
  const muscles = {};
  const muscleEntries = [];
  const scratchColor = new THREE.Color();
  const scratchHeat = new THREE.Color();
  const scratchRole = new THREE.Color();

  const addMuscle = (m, sidePrefix) => {
    const boneName = sidePrefix && /^[A-Z]/.test(m.bone) ? sidePrefix + m.bone : m.bone;
    const bone = bones[boneName];
    if (!bone) return;
    const mirror = sidePrefix === 'right' ? -1 : 1;
    const from = new THREE.Vector3(m.from[0] * mirror, m.from[1], m.from[2]);
    const to = new THREE.Vector3(m.to[0] * mirror, m.to[1], m.to[2]);
    const dir = to.clone().sub(from);
    const len = dir.length();
    const geo = new THREE.CylinderGeometry(m.r * 0.72, m.r, len, Math.max(8, detail / 2), 1);
    const mat = muscleBase.clone();
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(from.clone().add(to).multiplyScalar(0.5));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    const key = sidePrefix ? `${m.id}.${sidePrefix === 'left' ? 'L' : 'R'}` : m.id;
    mesh.name = `muscle-${key}`;
    mesh.userData.muscleId = key;
    bone.add(mesh);
    const entry = { mesh, mat, def: m, lastLevel: -1, lastRole: null, heat: false };
    muscles[key] = entry;
    muscleEntries.push(entry);
    return entry;
  };
  for (const m of MUSCLES) {
    if (m.side) { addMuscle(m, 'left'); addMuscle(m, 'right'); }
    else addMuscle(m, null);
  }

  // ---- joint markers (opt-in overlay, built once) --------------------------
  const markerGroup = new THREE.Group();
  markerGroup.name = 'joint-markers';
  markerGroup.visible = false;
  const markerMat = new THREE.MeshBasicMaterial({ color: 0xffe0b3, transparent: true, opacity: 0.85, depthWrite: false });
  const markerGeo = new THREE.SphereGeometry(0.018, 10, 8);
  const markerMeshes = [];
  for (const name of JOINT_MARKERS) {
    const bone = bones[name];
    if (!bone) continue;
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.set(0, 0, 0);
    marker.userData.jointId = name;
    marker.renderOrder = 30;
    bone.add(marker);
    markerMeshes.push(marker);
  }
  root.add(markerGroup); // grouping is virtual: markers live under their bones

  // ---- selection outline (ONE shared object for the whole rig) -------------
  // It is re-parented onto the selected muscle's bone, so it inherits exactly
  // the transform the mesh has without any matrix bookkeeping.
  const outlineMat = new THREE.LineBasicMaterial({ color: 0x4dd8df, transparent: true, opacity: 0.95, depthWrite: false, depthTest: true });
  const outline = new THREE.LineSegments(new THREE.BufferGeometry(), outlineMat);
  outline.name = 'muscle-outline';
  outline.visible = false;
  outline.frustumCulled = false;
  outline.userData.outlineFor = null;
  outline.renderOrder = 20;
  const outlines = { selected: outline };
  const _edgeCache = new Map();
  let heatMode = false;

  const api = {
    root, bones, muscles, muscleEntries, bodyGroup, muscleGroup, markerGroup, markerMeshes, outlines,

    /** True when the colour path is the activation heat ramp. */
    heatOn: () => heatMode,

    setHeatMode(on) {
      heatMode = Boolean(on);
      for (const entry of muscleEntries) {
        if (entry.heat !== heatMode) { entry.heat = heatMode; entry.lastLevel = -1; entry.lastRole = null; }
      }
      return api;
    },

    setMarkersVisible(on) {
      const visible = Boolean(on);
      markerGroup.visible = visible;
      for (const marker of markerMeshes) marker.visible = visible;
      return api;
    },

    /**
     * @param {string} key   muscle id with side suffix, e.g. 'quadriceps.L'
     * @param {number} level activation 0–1 (clamped: audit A11 found 1.3 in data)
     * @param {string} role  'PM' | 'SY' | 'ST'
     */
    setMuscleActivation(key, level, role) {
      const entry = muscles[key];
      if (!entry) return;
      const clamped = Math.max(0, Math.min(1, Number(level) || 0));
      // Quantise so unchanged values cost nothing (paused figure = no work).
      const quantised = Math.round(clamped * 255);
      const roleCode = heatMode ? 'H' : (role || 'ST');
      if (entry.lastLevel === quantised && entry.lastRole === roleCode) return;
      entry.lastLevel = quantised;
      entry.lastRole = roleCode;
      const t = quantised / 255;
      if (heatMode) {
        rampColor(scratchHeat, t);
        entry.mat.emissive.copy(scratchHeat);
        entry.mat.emissiveIntensity = 0.35 + t * 1.25;
        entry.mat.color.copy(scratchColor.setHex(MUSCLE_BASE)).lerp(scratchHeat, 0.15 + t * 0.7);
      } else {
        const roleHex = ROLE_COLORS[role] ?? ROLE_COLORS.IN;
        entry.mat.emissive.copy(scratchRole.setHex(roleHex));
        entry.mat.emissiveIntensity = t * 1.6;
        entry.mat.color.copy(scratchColor.setHex(MUSCLE_BASE)).lerp(scratchRole, Math.min(1, t) * 0.65);
      }
    },

    resetMuscles() {
      for (const entry of muscleEntries) {
        if (entry.lastLevel === 0 && entry.lastRole !== null) continue;
        entry.lastLevel = 0;
        entry.lastRole = heatMode ? 'H' : (entry.lastRole || null);
        if (heatMode) {
          rampColor(scratchHeat, 0);
          entry.mat.emissive.copy(scratchHeat);
          entry.mat.emissiveIntensity = 0.35;
          entry.mat.color.copy(scratchColor.setHex(MUSCLE_BASE)).lerp(scratchHeat, 0.15);
        } else {
          entry.mat.emissiveIntensity = 0;
          entry.mat.color.setHex(MUSCLE_BASE);
        }
      }
    },

    setMusclesVisible(visible) {
      const on = Boolean(visible);
      for (const entry of muscleEntries) entry.mesh.visible = on;
      return api;
    },

    /**
     * Dim every muscle except the selected one. Material state is mutated once
     * per change (never per frame) — the audit's A14 recompile-per-selection is
     * avoided by leaving `transparent` alone and driving opacity only.
     */
    setIsolation(selectedKey) {
      for (const entry of muscleEntries) {
        const dim = Boolean(selectedKey) && entry.mesh.userData.muscleId !== selectedKey;
        entry.mat.opacity = dim ? 0.12 : 1;
        entry.mat.transparent = dim;
        if (entry.mat.needsUpdate !== dim) entry.mat.needsUpdate = true;
      }
      return api;
    },

    /** Move the shared outline onto a muscle (or hide it with null). */
    setMuscleOutline(key) {
      const entry = key ? muscles[key] : null;
      if (!entry) {
        outline.visible = false;
        outline.userData.outlineFor = null;
        return api;
      }
      if (outline.userData.outlineFor === key) { outline.visible = true; return api; }
      let edges = _edgeCache.get(entry.mesh.geometry.uuid);
      if (!edges) {
        edges = new THREE.EdgesGeometry(entry.mesh.geometry, 30);
        _edgeCache.set(entry.mesh.geometry.uuid, edges);
      }
      outline.geometry = edges;
      // Re-parent onto the muscle's own bone so the transform follows for free.
      if (outline.parent !== entry.mesh.parent) entry.mesh.parent.add(outline);
      outline.position.copy(entry.mesh.position);
      outline.quaternion.copy(entry.mesh.quaternion);
      outline.scale.copy(entry.mesh.scale);
      outline.userData.outlineFor = key;
      outline.visible = true;
      return api;
    },

    /** Cheap introspection for the debug HUD and browser contracts. */
    stats() {
      let triangles = 0;
      let meshes = 0;
      const materials = new Set();
      root.traverse((o) => {
        if (!o.isMesh) return;
        meshes += 1;
        materials.add(o.material);
        const g = o.geometry;
        triangles += g.index ? g.index.count / 3 : g.attributes.position.count / 3;
      });
      return {
        meshes,
        triangles: Math.round(triangles),
        materials: materials.size,
        bones: Object.keys(bones).length,
        muscles: muscleEntries.length,
        // Markers are one mesh per joint, attached to their bone, and hidden by
        // default — so this is the draw-call cost only while the overlay is on.
        markerDrawCalls: markerMeshes.length
      };
    },

    dispose() {
      _edgeCache.forEach((g) => g.dispose());
      _edgeCache.clear();
      root.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    }
  };

  return api;
}

export { BONE_TREE };
