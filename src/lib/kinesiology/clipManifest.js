// Phase 1 (Movement Theater Masterplan §2.1 / §3.3): the clip manifest.
//
// One authoritative record per action: the frame grid, the source kind, the
// joints it reports, and its snap points. The frame grid is *derived*, never
// declared twice — this is the fix for audit A19, where playback advanced time
// with `duration` while stepping advanced it with `frameTime`, so any clip
// whose declared duration disagreed with frames/fps would silently drift.
//
// No DOM, no three.js: `sampleAngles(frameIndex)` is injected by the caller.

/** Procedural tracks are sampled on the same 30 fps grid as the mocap clips. */
export const AUTHORED_FPS = 30;

/** Actions whose motion is a repeated cycle rather than a single excursion. */
export const CYCLIC_ACTIONS = new Set([
  'walk', 'run', 'tiptoe-walk', 'heel-walk', 'clap', 'chew', 'talk', 'head-signals'
]);

/** Actions treated as gait for reference-band purposes. */
export const GAIT_ACTIONS = new Set(['walk', 'run', 'tiptoe-walk', 'heel-walk']);

/**
 * Build the manifest for one action.
 *
 * @param {object} args
 * @param {object} args.action        entry from ACTIONS
 * @param {{frames:number, frameTime:number}|null} args.clipMeta  BVH metadata for `source:'cmu'`
 * @param {(frame:number)=>({hip:number,knee:number,ankle:number})} [args.sampleAngles]
 * @returns {{actionId:string, fps:number, frameCount:number, duration:number,
 *            sourceKind:'mocap'|'authored', joints:string[], gait:boolean,
 *            cyclic:boolean, snapPoints:Array<{id:string,label:string,frame:number}>,
 *            warnings:string[]}}
 */
export function buildClipManifest({ action, clipMeta = null, sampleAngles = null } = {}) {
  const warnings = [];
  let fps;
  let frameCount;
  let sourceKind;

  if (action.source === 'cmu' && clipMeta) {
    sourceKind = 'mocap';
    fps = Math.round(1 / clipMeta.frameTime);
    frameCount = clipMeta.frames;
    const derived = frameCount / fps;
    const mismatch = Math.abs(action.duration - derived);
    if (mismatch > 1e-6) {
      // Not fatal: the frame grid wins, and the discrepancy is surfaced rather
      // than silently absorbed (audit A19).
      warnings.push(
        `${action.id}: declared duration ${action.duration}s disagrees with ${frameCount}/${fps} = ${derived.toFixed(4)}s by ${mismatch.toFixed(4)}s; using the frame grid.`
      );
    }
  } else {
    sourceKind = 'authored';
    fps = AUTHORED_FPS;
    frameCount = Math.max(2, Math.round(action.duration * fps));
  }

  const duration = frameCount / fps;

  const snapPoints = buildSnapPoints({ action, frameCount, sampleAngles, cyclic: CYCLIC_ACTIONS.has(action.id) });

  const joints = sourceKind === 'mocap' ? ['hip', 'knee', 'ankle'] : ['hip', 'knee', 'ankle'];
  return {
    actionId: action.id,
    fps,
    frameCount,
    duration,
    sourceKind,
    joints,
    gait: GAIT_ACTIONS.has(action.id),
    cyclic: CYCLIC_ACTIONS.has(action.id),
    snapPoints,
    warnings
  };
}

/**
 * Snap points: Neutral, Peak flexion, Full extension, Return — the four the
 * plan requires — plus anything the caller registers later (gait contacts come
 * from the stance-window detector at load time).
 *
 * They are derived from the knee curve because the knee is the joint every
 * reported movement either flexes or extends; for a movement with no knee
 * excursion the fallback is frame 0 / mid / last.
 */
export function buildSnapPoints({ action, frameCount, sampleAngles, cyclic = false }) {
  const last = frameCount - 1;
  const dt = (id, label, frame) => ({ id, label, frame: Math.max(0, Math.min(last, Math.round(frame))) });
  const points = [dt('neutral', 'Neutral', 0)];

  if (sampleAngles) {
    let peakFrame = 0;
    let peakValue = -Infinity;
    let extFrame = 0;
    let extValue = Infinity;
    const step = Math.max(1, Math.floor(frameCount / 240)); // cap the scan on long clips
    for (let f = 0; f <= last; f += step) {
      const a = sampleAngles(f);
      if (!a) continue;
      const flexion = Math.abs(a.knee || 0);
      if (flexion > peakValue) { peakValue = flexion; peakFrame = f; }
      if (flexion < extValue) { extValue = flexion; extFrame = f; }
    }
    if (peakValue > 5) points.push(dt('peakFlexion', 'Peak flexion', peakFrame));
    if (Number.isFinite(extValue)) points.push(dt('fullExtension', 'Full extension', extFrame));
  }

  points.push(dt(cyclic ? 'cycleEnd' : 'return', cyclic ? 'Cycle end' : 'Return', last));

  // De-duplicate frames (first label wins) and keep them ordered.
  const seen = new Set();
  return points
    .sort((a, b) => a.frame - b.frame)
    .filter((p) => (seen.has(p.frame) ? false : (seen.add(p.frame), true)));
}

/** Convenience: the frame indices only, for TimeController.seekSnap(). */
export function snapFrames(manifest) {
  return manifest.snapPoints.map((p) => p.frame);
}

/**
 * Gait contact frames from the retargeter's stance windows, kept in the
 * manifest so snapping works without re-deriving stance at runtime.
 */
export function withContacts(manifest, contacts = []) {
  const sideLabel = { left: 'Left', right: 'Right' };
  const extras = contacts.map((contact, i) => ({
    id: `${contact.side || 'foot'}Contact${i}`,
    label: `${sideLabel[contact.side] || 'Foot'} initial contact`,
    frame: contact.frame
  }));
  // A detected contact is more informative than the generic "Neutral" it
  // collides with (gait clips start ON initial contact), so the contact wins.
  const contactFrames = new Set(extras.map((c) => c.frame));
  const base = manifest.snapPoints.filter((p) => !(p.id === 'neutral' && contactFrames.has(p.frame)));
  const seen = new Set();
  const snapPoints = [...base, ...extras]
    .sort((a, b) => a.frame - b.frame)
    .filter((p) => (seen.has(p.frame) ? false : (seen.add(p.frame), true)));
  return { ...manifest, snapPoints };
}

/** All manifest warnings for a set of actions, for the load-time console + QA. */
export function collectManifestWarnings(manifests) {
  return Object.values(manifests).flatMap((m) => m.warnings || []);
}
