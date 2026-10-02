// Authored articulated performance rig (Kinesiology Theater v1, decision D6).
// Procedural, in-house (CC0-equivalent). Realistic adult proportions (~1.75 m),
// rigid segments with spherical joint blending, named muscle meshes for the
// activation system. NOT the certified BodyParts3D reference.

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

export const ROLE_COLORS = { PM: 0xff5d47, SY: 0xffb347, ST: 0x4dd8df };

export function buildPerformanceRig(THREE, opts = {}) {
  const detail = opts.lowPoly ? 10 : 20;
  const skin = new THREE.MeshStandardMaterial({ color: 0xc7cdd6, roughness: 0.62, metalness: 0.08 });
  const muscleBase = new THREE.MeshStandardMaterial({ color: 0x8a3040, roughness: 0.5, metalness: 0.05 });

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
    // Cylinder is Y-axis; limbs are built along -Y for legs/arms via rotation at caller through `along`
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

  // Arms (built along -Y after rotating -90° about Z so cylinder Y→X? keep -Y: arms hang)
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

  // Muscles: tapered tubes between anchors; sided entries mirrored to both sides.
  const muscles = {};
  const addMuscle = (m, sidePrefix) => {
    // Limb bones are named leftX/rightX; midline bones (root, spine, head…) are shared.
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
    muscles[key] = { mesh, mat, def: m };
  };
  for (const m of MUSCLES) {
    if (m.side) { addMuscle(m, 'left'); addMuscle(m, 'right'); }
    else addMuscle(m, null);
  }

  // Joint markers are kept in rig-local space and resynced after the pose is
  // applied. This makes one visibility toggle control the complete marker set
  // without parenting markers to animated bones or accumulating transforms.
  const markerGroup = new THREE.Group();
  markerGroup.name = 'joint-markers';
  markerGroup.visible = false;
  root.add(markerGroup);
  const markerGeometry = new THREE.SphereGeometry(0.026, detail >= 20 ? 12 : 8, detail >= 20 ? 8 : 6);
  const markerMaterial = new THREE.MeshBasicMaterial({
    color: 0xffe0b3,
    transparent: true,
    opacity: 0.96,
    depthTest: false,
    depthWrite: false
  });
  const jointSpecs = [
    ['root', 'pelvis'], ['spine', 'spine'], ['chest', 'sternum'], ['neck', 'neck'], ['head', 'head'],
    ['leftUpperArm', 'left shoulder'], ['leftForeArm', 'left elbow'], ['leftHand', 'left wrist'],
    ['rightUpperArm', 'right shoulder'], ['rightForeArm', 'right elbow'], ['rightHand', 'right wrist'],
    ['leftUpLeg', 'left hip'], ['leftLeg', 'left knee'], ['leftFoot', 'left ankle'],
    ['rightUpLeg', 'right hip'], ['rightLeg', 'right knee'], ['rightFoot', 'right ankle']
  ];
  const jointMarkers = jointSpecs.map(([boneName, label]) => {
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.name = `joint-marker-${label.replaceAll(' ', '-')}`;
    marker.userData.joint = boneName;
    marker.renderOrder = 20;
    markerGroup.add(marker);
    return { bone: bones[boneName], marker };
  });
  const markerPosition = new THREE.Vector3();
  const updateJointMarkers = () => {
    root.updateMatrixWorld(true);
    for (const { bone, marker } of jointMarkers) {
      bone.getWorldPosition(markerPosition);
      marker.position.copy(root.worldToLocal(markerPosition));
    }
  };

  const outlines = {};
  const baseMuscleColor = new THREE.Color(0x8a3040);
  const roleColorCache = Object.fromEntries(
    Object.entries(ROLE_COLORS).map(([role, color]) => [role, new THREE.Color(color)])
  );
  const displayColor = new THREE.Color();
  let heatModeEnabled = false;

  return {
    root, bones, muscles, bodyGroup, muscleGroup, markerGroup, outlines,
    setMuscleActivation(key, level, role) {
      const entry = muscles[key];
      if (!entry) return;
      const activation = Math.max(0, Math.min(1, Number(level) || 0));
      if (heatModeEnabled) displayColor.setHSL(0.67 * (1 - activation), 0.92, 0.54);
      else displayColor.copy(roleColorCache[role] || roleColorCache.ST);
      entry.mat.emissive.copy(displayColor);
      entry.mat.emissiveIntensity = heatModeEnabled ? 0.2 + activation * 1.3 : activation * 1.6;
      entry.mat.color.copy(baseMuscleColor).lerp(displayColor, heatModeEnabled ? 0.45 + activation * 0.55 : activation * 0.65);
    },
    setHeatMode(enabled) {
      heatModeEnabled = Boolean(enabled);
    },
    heatOn() {
      return heatModeEnabled;
    },
    setMarkersVisible(visible) {
      markerGroup.visible = Boolean(visible);
      if (markerGroup.visible) updateJointMarkers();
    },
    setMuscleOutline(key, visible) {
      Object.values(outlines).forEach((outline) => { outline.visible = false; });
      if (!visible || !key || !muscles[key]) return;
      let outline = outlines[key];
      if (!outline) {
        const entry = muscles[key];
        const material = new THREE.MeshBasicMaterial({
          color: 0xc9f6f9,
          side: THREE.BackSide,
          transparent: true,
          opacity: 0.9,
          depthTest: true,
          depthWrite: false
        });
        outline = new THREE.Mesh(entry.mesh.geometry, material);
        outline.name = `muscle-outline-${key}`;
        outline.scale.setScalar(1.12);
        outline.renderOrder = 21;
        entry.mesh.add(outline);
        outlines[key] = outline;
      }
      outline.visible = true;
    },
    resetMuscles() {
      Object.values(muscles).forEach(({ mat }) => {
        mat.emissiveIntensity = 0;
        mat.emissive.set(0x000000);
        mat.color.copy(baseMuscleColor);
      });
    },
    setMusclesVisible(visible) {
      Object.values(muscles).forEach(({ mesh }) => { mesh.visible = visible; });
    },
    dispose() {
      root.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    }
  };
}

export { BONE_TREE };
