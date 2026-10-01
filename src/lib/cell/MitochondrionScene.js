// Procedural mitochondrion builder for ProceduralScene. State = f(chapter, t).
import { ease, seeded } from '../three/ProceduralScene.js';

const HALF = 1.15; const R_OUT = 1.0; const R_IN = 0.88;
const profile = (x, r) => (Math.abs(x) <= HALF ? r : Math.sqrt(Math.max(0, r * r - (Math.abs(x) - HALF) ** 2)));

export const mitochondrionBuilder = {
  cameraDistance: 5.6,
  build(ctx) {
    const T = ctx.THREE; const S = {};
    const org = new T.Group(); ctx.root.add(org); S.org = org;
    const add = (id, mesh) => ctx.part(id, mesh, org);
    const capsule = (r) => { const g = ctx.geo(new T.CapsuleGeometry(r, HALF * 2, 12, 48)); g.rotateZ(Math.PI / 2); return g; };
    S.outerMat = ctx.mat(0xf59e7a, { opacity: 1, side: T.DoubleSide });
    add('outer', new T.Mesh(capsule(R_OUT), S.outerMat));
    add('inner', new T.Mesh(capsule(R_IN), ctx.mat(0xfacc15, { side: T.DoubleSide })));
    add('ims', new T.Mesh(capsule((R_OUT + R_IN) / 2), ctx.mat(0x38bdf8, { opacity: 0.12, side: T.BackSide })));
    add('matrix', new T.Mesh(capsule(R_IN - 0.03), ctx.mat(0x8b6cf0, { opacity: 0.28, side: T.BackSide })));
    const rnd = seeded(7); const cristaMat = ctx.mat(0xfde68a, { side: T.DoubleSide }); const synthPos = [];
    for (let i = 0; i < 9; i++) {
      const x = -1.65 + (3.3 * (i + 0.5)) / 9; const r = profile(x, R_IN) * 0.97; if (r < 0.3) continue;
      const open = Math.PI * (0.45 + rnd() * 0.25); const start = (i % 2 ? 0 : Math.PI) + open / 2;
      const g = ctx.geo(new T.CylinderGeometry(r, r, 0.07, 40, 1, false, start, Math.PI * 2 - open)); g.rotateZ(Math.PI / 2);
      add('cristae', new T.Mesh(g, cristaMat)).position.x = x;
      for (let k = 0; k < 12; k++) { const a = start + rnd() * (Math.PI * 2 - open); const rr = r * (0.35 + rnd() * 0.6); synthPos.push([x + (rnd() < 0.5 ? -0.06 : 0.06), Math.cos(a) * rr, Math.sin(a) * rr]); }
    }
    const m4 = new T.Matrix4();
    const synth = new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.035, 10, 8)), ctx.mat(0xfb923c), synthPos.length);
    synthPos.forEach((p, i) => synth.setMatrixAt(i, m4.makeTranslation(...p))); add('synthase', synth);
    const ribo = new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.028, 8, 6)), ctx.mat(0xf472b6), 46);
    for (let i = 0; i < 46; i++) { const x = (rnd() * 2 - 1) * 1.6; const r = profile(x, R_IN) * 0.75 * Math.sqrt(rnd()); const a = rnd() * Math.PI * 2; ribo.setMatrixAt(i, m4.makeTranslation(x, Math.cos(a) * r, Math.sin(a) * r)); }
    add('ribosome', ribo);
    const dnaMat = ctx.mat(0x34d399);
    [[-0.5, 0.15, 0.2], [0.75, -0.2, -0.1], [0.05, -0.35, 0.3]].forEach(([x, y, z], i) => { const d = add('dna', new T.Mesh(ctx.geo(new T.TorusGeometry(0.16, 0.014, 6, 36)), dnaMat)); d.position.set(x, y, z); d.rotation.set(i, i * 0.7, 0.3); });

    // Chapter 3 insert: membrane patch, ETC complexes, ATP synthase (c8 ring), H+ and ATP.
    const ins = new T.Group(); ins.visible = false; ctx.root.add(ins); S.ins = ins;
    const nc = { clip: false };
    ctx.part('inner', new T.Mesh(ctx.geo(new T.BoxGeometry(4.4, 0.32, 1.6)), ctx.mat(0xfacc15, { ...nc, opacity: 0.55 })), ins);
    const etcMat = ctx.mat(0x60a5fa, nc);
    S.etcX = [-1.6, -0.9, -0.2];
    S.etcX.forEach((x, i) => { ctx.part('inner', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.2 + i * 0.03, 0.2 + i * 0.03, 0.62, 18)), etcMat), ins).position.set(x, 0, 0); });
    const sy = new T.Group(); sy.position.set(1.2, 0, 0); ins.add(sy);
    const rotor = new T.Group(); sy.add(rotor); S.rotor = rotor;
    const cMat = ctx.mat(0xfb923c, nc);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; ctx.part('synthase', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.06, 0.06, 0.4, 10)), cMat), rotor).position.set(Math.cos(a) * 0.24, 0, Math.sin(a) * 0.24); }
    ctx.part('synthase', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.05, 0.05, 0.7, 10)), ctx.mat(0xfdba74, nc)), rotor).position.y = -0.5;
    const al = ctx.mat(0xf97316, nc); const be = ctx.mat(0xfed7aa, nc);
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; ctx.part('synthase', new T.Mesh(ctx.geo(new T.SphereGeometry(0.17, 16, 12)), i % 2 ? al : be), sy).position.set(Math.cos(a) * 0.2, -1.0, Math.sin(a) * 0.2); }
    ctx.part('synthase', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.035, 0.035, 1.05, 8)), ctx.mat(0xfdba74, nc)), sy).position.set(0.42, -0.5, 0);
    S.protons = ctx.part('ims', new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.05, 8, 6)), ctx.mat(0xef4444, nc), 36), ins);
    S.atp = ctx.part('synthase', new T.InstancedMesh(ctx.geo(new T.IcosahedronGeometry(0.075, 0)), ctx.mat(0x22d3ee, nc), 9), ins);
    const r2 = seeded(11); S.seeds = Array.from({ length: 36 }, () => ({ phase: r2(), lane: Math.floor(r2() * 3), dx: (r2() - 0.5) * 0.3, dz: (r2() - 0.5) * 0.9 }));
    S.twin = org.clone(true); S.twin.visible = false; ctx.root.add(S.twin);
    S.m4 = m4;
    return S;
  },
  apply(ctx, chapter, t, S) {
    const ins3 = chapter === 'synthase';
    S.org.visible = !ins3; S.ins.visible = ins3; S.twin.visible = chapter === 'fission';
    S.org.position.set(0, 0, 0); S.org.scale.set(1, 1, 1);
    if (chapter === 'overview') { S.org.rotation.set(0.25, t * 0.25, 0); S.outerMat.opacity = 1 - 0.65 * ease((t - 9) / 6); ctx.clip.constant = 50; }
    else if (chapter === 'cutaway') { S.org.rotation.set(0.35, -0.5 + t * 0.05, 0); S.outerMat.opacity = 1; ctx.clip.constant = 5 - 5 * ease(t / 6); }
    else if (chapter === 'fission') {
      const p = ease((t - 2) / 11); ctx.clip.constant = 0; S.outerMat.opacity = 1; const sep = p * 1.25; const s = 1 - 0.35 * p;
      S.org.rotation.set(0.35, 0.2, 0); S.org.scale.set(s * (1 + 0.3 * (1 - p)), s, s); S.org.position.set(-sep, 0, 0);
      S.twin.rotation.copy(S.org.rotation); S.twin.scale.copy(S.org.scale); S.twin.position.set(sep, 0, 0);
    } else if (ins3) {
      S.ins.rotation.set(0.35, -0.35, 0);
      S.rotor.rotation.y = t * Math.PI * 2 * 0.13; // ~1000× slower than real 100–150 rev/s
      const m4 = S.m4;
      S.seeds.forEach((s, i) => {
        const u = (s.phase + t / 10) % 1; const lx = S.etcX[s.lane]; let x; let y; let z = s.dz;
        if (u < 0.25) { x = lx + s.dx; y = -0.9 + (u / 0.25) * 1.6; }
        else if (u < 0.7) { const v = (u - 0.25) / 0.45; x = lx + s.dx + v * (1.2 - lx); y = 0.7 + Math.sin(v * Math.PI) * 0.35; }
        else { const v = (u - 0.7) / 0.3; const a = v * Math.PI * 2; x = 1.2 + Math.cos(a) * 0.24; z = Math.sin(a) * 0.24; y = 0.7 - v * 1.6; }
        S.protons.setMatrixAt(i, m4.makeTranslation(x, y, z));
      });
      S.protons.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < 9; i++) {
        const age = t - i * (30 / 9);
        if (age < 0) m4.makeScale(0, 0, 0); else { const a = (i / 3) * Math.PI * 2; m4.makeTranslation(1.2 + Math.cos(a) * (0.35 + age * 0.08), -1.05 - age * 0.06, Math.sin(a) * (0.35 + age * 0.08)); }
        S.atp.setMatrixAt(i, m4);
      }
      S.atp.instanceMatrix.needsUpdate = true;
    }
  }
};
