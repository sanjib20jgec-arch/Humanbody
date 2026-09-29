// Camera director: preset angles, close-up follow, turntable, orbit handoff.

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

// Phase 79: action-aware framing — face/hand actions frame tighter and higher.
const FRAMES = {
  walk: { y: 0.92, d: 4.9 }, run: { y: 1.0, d: 5.4 }, jump: { y: 1.1, d: 5.8 },
  wave: { y: 1.35, d: 3.7 }, handshake: { y: 1.25, d: 3.5 }, chew: { y: 1.62, d: 2.7 }, talk: { y: 1.62, d: 2.7 },
  squat: { y: 0.8, d: 4.2 }, 'sit-stand': { y: 0.85, d: 4.2 }, lunge: { y: 0.95, d: 4.4 }, kick: { y: 1, d: 4.2 }, sidestep: { y: 0.95, d: 4.6 }, 'one-leg': { y: 1.05, d: 4 }, 'tiptoe-walk': { y: 0.98, d: 4.2 }, 'heel-walk': { y: 0.98, d: 4.2 }, bow: { y: 1, d: 4 }, shrug: { y: 1.45, d: 2.8 }, 'reach-up': { y: 1.2, d: 3.4 }, clap: { y: 1.3, d: 3 }, 'head-signals': { y: 1.6, d: 2.4 }
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
    default: return { pos: [2.2, 1.7, 3.4], target: TARGET, controls: true };
  }
}

export function applyCamera(THREE, camera, rig, state, focusBone) {
  // Phase 79: damped look-at point so follow and preset moves never snap.
  const look = camera.userData._kineLook || (camera.userData._kineLook = new THREE.Vector3(0, 1, 0));
  if (state.follow) {
    const bone = rig.bones[focusBone] || rig.bones.root;
    const world = new THREE.Vector3();
    bone.getWorldPosition(world);
    const offset = new THREE.Vector3(0.5, 0.35, 0.9);
    camera.position.lerp(world.clone().add(offset), 0.08);
    look.lerp(world, 0.15);
    camera.lookAt(look);
  } else {
    camera.position.lerp(new THREE.Vector3(...state.pos), 0.12);
    look.lerp(new THREE.Vector3(state.target.x, state.target.y, state.target.z), 0.2);
    camera.lookAt(look);
  }
}
