// Procedural 3D builders for the Excretion bay (state = f(chapter, t)).
import { ease, seeded } from '../three/ProceduralScene.js';

const loop = (t, p) => (t % p) / p;

const system = {
  cameraDistance: 7,
  build(ctx) {
    const T = ctx.THREE; const S = {};
    const kg = ctx.geo(new T.SphereGeometry(0.6, 32, 20)); kg.scale(0.65, 1, 0.45);
    for (const s of [-1, 1]) { const k = ctx.part('kidney', new T.Mesh(kg, ctx.mat(0xb91c1c))); k.position.set(s * 1.2, 1.2, 0); k.rotation.z = s * 0.2; }
    S.ur = []; for (const s of [-1, 1]) { const c = new T.CatmullRomCurve3([new T.Vector3(s * 1.0, 0.8, 0), new T.Vector3(s * 0.9, -0.2, 0.1), new T.Vector3(s * 0.35, -1.25, 0.1)]); S.ur.push(c); ctx.part('ureter', new T.Mesh(ctx.geo(new T.TubeGeometry(c, 30, 0.05, 6)), ctx.mat(0xfde68a))); }
    S.bl = ctx.part('bladder', new T.Mesh(ctx.geo(new T.SphereGeometry(0.5, 24, 16)), ctx.mat(0xfbbf24, { opacity: 0.75 }))); S.bl.position.y = -1.55;
    ctx.part('urethra', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.05, 0.05, 0.7, 8)), ctx.mat(0xfcd34d))).position.y = -2.3;
    ctx.part('renal-vessels', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.1, 0.1, 3.6, 12)), ctx.mat(0xef4444))).position.set(-0.12, 0.6, -0.3);
    ctx.part('renal-vessels', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.12, 0.12, 3.6, 12)), ctx.mat(0x3b82f6))).position.set(0.15, 0.6, -0.3);
    for (const s of [-1, 1]) { const v = ctx.part('renal-vessels', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.05, 0.05, 1, 8)), ctx.mat(0xef4444))); v.rotation.z = Math.PI / 2; v.position.set(s * 0.6, 1.25, -0.25); }
    S.drops = ctx.part('ureter', new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.05, 8, 6)), ctx.mat(0xfef08a, { clip: false }), 12));
    S.m4 = new T.Matrix4(); return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.1, Math.sin(t * 0.3) * 0.5, 0); ctx.clip.constant = 50;
    const fl = ch === 'flow'; S.drops.visible = fl;
    S.bl.scale.setScalar(fl ? 0.8 + ease(t / 18) * 0.35 : 1);
    for (let i = 0; i < 12; i++) { const p = S.ur[i % 2].getPoint(loop(t / 4 + i / 12, 1)); S.drops.setMatrixAt(i, S.m4.makeTranslation(p.x, p.y, p.z + 0.02)); }
    S.drops.instanceMatrix.needsUpdate = true;
  }
};

const nephron = {
  cameraDistance: 7,
  build(ctx) {
    const T = ctx.THREE; const S = {}; const rnd = seeded(101);
    S.cap = ctx.part('capsule', new T.Mesh(ctx.geo(new T.SphereGeometry(0.6, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.7)), ctx.mat(0xfda4af, { opacity: 0.6, side: T.DoubleSide })));
    S.cap.position.set(-2.4, 1.2, 0); S.cap.rotation.z = -Math.PI / 2;
    for (let k = 0; k < 6; k++) { const pts = []; let p = new T.Vector3(-2.4, 1.2, 0); for (let j = 0; j < 8; j++) { pts.push(p.clone()); p = new T.Vector3(-2.4 + (rnd() - 0.5) * 0.6, 1.2 + (rnd() - 0.5) * 0.6, (rnd() - 0.5) * 0.6); } ctx.part('glomerulus', new T.Mesh(ctx.geo(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 30, 0.04, 5)), ctx.mat(0xef4444))); }
    S.path = new T.CatmullRomCurve3([[-1.85, 1.2, 0], [-1.0, 1.5, 0], [-0.6, 0.9, 0], [-0.3, -1.6, 0], [0.2, -1.8, 0], [0.5, 0.6, 0], [1.1, 1.3, 0], [1.6, 0.8, 0], [2.0, 1.2, 0]].map((v) => new T.Vector3(...v)));
    ctx.part('tubule', new T.Mesh(ctx.geo(new T.TubeGeometry(S.path, 120, 0.12, 10)), ctx.mat(0xfde68a, { opacity: 0.6 })));
    S.duct = new T.CatmullRomCurve3([new T.Vector3(2.0, 1.6, 0), new T.Vector3(2.1, -2.4, 0)]);
    ctx.part('collecting', new T.Mesh(ctx.geo(new T.TubeGeometry(S.duct, 20, 0.15, 10)), ctx.mat(0xf59e0b, { opacity: 0.7 })));
    S.good = ctx.part('solute', new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.06, 8, 6)), ctx.mat(0x22c55e, { clip: false }), 24));
    S.urea = ctx.part('solute', new T.InstancedMesh(ctx.geo(new T.BoxGeometry(0.08, 0.08, 0.08)), ctx.mat(0xfacc15, { clip: false }), 12));
    S.m4 = new T.Matrix4(); return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.15, -0.2, 0); ctx.clip.constant = 50;
    const on = ch === 'filter'; S.good.visible = on; S.urea.visible = on;
    for (let i = 0; i < 24; i++) { const u = loop(t / 8 + i / 24, 1); const p = S.path.getPoint(Math.min(1, u * 1.4)); const out = ease((u - 0.25 - (i % 5) * 0.08) / 0.1); S.good.setMatrixAt(i, S.m4.makeTranslation(p.x, p.y, p.z + out * 0.9)); }
    for (let i = 0; i < 12; i++) { const u = loop(t / 8 + i / 12, 1); const p = u < 0.75 ? S.path.getPoint(u / 0.75) : S.duct.getPoint((u - 0.75) / 0.25); S.urea.setMatrixAt(i, S.m4.makeTranslation(p.x, p.y, p.z)); }
    S.good.instanceMatrix.needsUpdate = true; S.urea.instanceMatrix.needsUpdate = true;
  }
};

const dialysis = {
  cameraDistance: 6.5,
  build(ctx) {
    const T = ctx.THREE; const S = {}; const rnd = seeded(107);
    ctx.part('fluid', new T.Mesh(ctx.geo(new T.BoxGeometry(5, 2.4, 2)), ctx.mat(0x93c5fd, { opacity: 0.2, side: T.BackSide })));
    S.ty = [-0.6, 0, 0.6];
    const tg = ctx.geo(new T.CylinderGeometry(0.22, 0.22, 4.6, 20, 1, true)); tg.rotateZ(Math.PI / 2);
    S.ty.forEach((y) => ctx.part('tube', new T.Mesh(tg, ctx.mat(0xfca5a5, { opacity: 0.45, side: T.DoubleSide }))).position.set(0, y, 0));
    S.cells = ctx.part('cells', new T.InstancedMesh(ctx.geo(new T.TorusGeometry(0.07, 0.04, 6, 12)), ctx.mat(0xdc2626, { clip: false }), 18));
    S.urea = ctx.part('urea', new T.InstancedMesh(ctx.geo(new T.BoxGeometry(0.06, 0.06, 0.06)), ctx.mat(0xfacc15, { clip: false }), 30));
    S.seed = Array.from({ length: 30 }, () => [rnd(), (rnd() - 0.5) * 2, rnd() * Math.PI * 2]);
    S.m4 = new T.Matrix4(); return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.25, -0.3, 0); ctx.clip.constant = 50;
    for (let i = 0; i < 18; i++) { const x = -2.3 + loop(t / 6 + i / 18, 1) * 4.6; S.cells.setMatrixAt(i, S.m4.makeTranslation(x, S.ty[i % 3] + Math.sin(i) * 0.08, Math.cos(i) * 0.08)); }
    S.cells.instanceMatrix.needsUpdate = true;
    const d = ch === 'diffuse';
    S.seed.forEach(([ph, , a], i) => { const x = -2.3 + loop(t / 6 + ph, 1) * 4.6; const out = d ? ease(((x + 2.3) / 4.6 - 0.15 - (i % 4) * 0.12) / 0.2) : 0; const r = 0.1 + out * 0.6; S.urea.setMatrixAt(i, S.m4.makeTranslation(x, S.ty[i % 3] + Math.sin(a) * r, Math.cos(a) * r)); });
    S.urea.instanceMatrix.needsUpdate = true;
  }
};

const plant = {
  cameraDistance: 6.5,
  build(ctx) {
    const T = ctx.THREE; const S = {};
    ctx.part('resin', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.25, 0.32, 3.2, 16)), ctx.mat(0x92400e))).position.y = -0.6;
    ctx.part('resin', new T.Mesh(ctx.geo(new T.SphereGeometry(0.1, 10, 8)), ctx.mat(0xd97706))).position.set(0.27, -0.8, 0.1);
    const lg = ctx.geo(new T.SphereGeometry(0.5, 20, 10)); lg.scale(1, 0.12, 0.45);
    S.leaves = []; [[-0.8, 0.8, 0.4], [0.8, 0.6, -0.4], [-0.7, 0.2, -0.6], [0.75, 1.1, 0.5]].forEach(([x, y, r], i) => { const l = ctx.part('leaf', new T.Mesh(lg, ctx.mat(i === 2 ? 0xeab308 : 0x22c55e))); l.position.set(x, y, 0); l.rotation.z = r; S.leaves.push(l); });
    S.vac = ctx.part('vacuole', new T.Mesh(ctx.geo(new T.SphereGeometry(0.12, 12, 8)), ctx.mat(0xa855f7, { clip: false }))); S.vac.position.set(-0.7, 0.26, -0.1);
    S.vap = ctx.part('vapour', new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.04, 8, 6)), ctx.mat(0xbae6fd, { clip: false }), 14));
    S.m4 = new T.Matrix4(); return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.1, t * 0.08, 0); ctx.clip.constant = 50;
    const sh = ch === 'shed'; const f = sh ? ease((t - 3) / 8) : 0;
    const old = S.leaves[2]; old.position.set(-0.7 - f * 0.6, 0.2 - f * 2.0, 0); old.rotation.set(f * 2, 0, -0.6 + f * 3);
    S.vac.position.set(old.position.x, old.position.y + 0.06, -0.1);
    S.vap.visible = sh;
    for (let i = 0; i < 14; i++) { const l = S.leaves[[0, 1, 3][i % 3]]; const u = loop(t / 3 + i / 14, 1); S.vap.setMatrixAt(i, S.m4.makeTranslation(l.position.x + Math.sin(i) * 0.3, l.position.y + 0.1 + u * 1.2, Math.cos(i) * 0.2)); }
    S.vap.instanceMatrix.needsUpdate = true;
  }
};

export const excretionBuilders = { 'urinary-system': system, nephron, dialysis, 'plant-excretion': plant };
