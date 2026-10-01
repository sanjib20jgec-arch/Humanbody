// Procedural 3D builders for the Circulation bay (state = f(chapter, t)).
import { ease, seeded } from '../three/ProceduralScene.js';

const loop = (t, p) => (t % p) / p;

// chapters: 'overview', 'beat' (atria then ventricles), 'pacemaker'
const heart = {
  cameraDistance: 6.5,
  build(ctx) {
    const T = ctx.THREE; const S = {};
    const sph = (r, sx, sy, sz) => { const g = ctx.geo(new T.SphereGeometry(r, 32, 20)); g.scale(sx, sy, sz); return g; };
    S.ra = ctx.part('atrium', new T.Mesh(sph(0.6, 1, 0.8, 0.9), ctx.mat(0x93c5fd))); S.ra.position.set(-0.75, 0.8, 0);
    S.la = ctx.part('atrium', new T.Mesh(sph(0.6, 1, 0.8, 0.9), ctx.mat(0xf472b6))); S.la.position.set(0.75, 0.8, 0);
    S.rv = ctx.part('ventricle', new T.Mesh(sph(0.75, 1, 1.3, 0.9), ctx.mat(0x60a5fa))); S.rv.position.set(-0.7, -0.6, 0);
    S.lv = ctx.part('ventricle', new T.Mesh(sph(0.85, 1, 1.4, 1), ctx.mat(0xe11d48))); S.lv.position.set(0.7, -0.65, 0);
    ctx.part('septum', new T.Mesh(ctx.geo(new T.BoxGeometry(0.08, 2.8, 1.4)), ctx.mat(0x94a3b8))).position.set(0, 0, 0);
    S.valves = [];
    for (const x of [-0.72, 0.72]) { const v = ctx.part('valve', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.35, 0.35, 0.05, 20)), ctx.mat(0xfde68a, { side: T.DoubleSide }))); v.position.set(x, 0.18, 0); S.valves.push(v); }
    S.sa = ctx.part('sanode', new T.Mesh(ctx.geo(new T.SphereGeometry(0.1, 12, 8)), ctx.mat(0x22d3ee, { clip: false }))); S.sa.position.set(-1.05, 1.15, 0.4);
    S.wave = ctx.part('sanode', new T.Mesh(ctx.geo(new T.TorusGeometry(1, 0.02, 6, 48)), ctx.mat(0x22d3ee, { clip: false })));
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.1, ch === 'overview' ? t * 0.1 : 0.2, 0); ctx.clip.constant = ch === 'overview' ? 50 : 0.2;
    const period = 0.8; const u = ch === 'overview' ? 0.5 : loop(t, period * 2.5);
    const atr = u < 0.15 ? Math.sin((u / 0.15) * Math.PI) : 0;
    const ven = u >= 0.2 && u < 0.55 ? Math.sin(((u - 0.2) / 0.35) * Math.PI) : 0;
    S.ra.scale.setScalar(1 - 0.12 * atr); S.la.scale.setScalar(1 - 0.12 * atr);
    S.rv.scale.setScalar(1 - 0.14 * ven); S.lv.scale.setScalar(1 - 0.14 * ven);
    S.valves.forEach((v) => { v.rotation.z = ven > 0 ? 0 : 1.1; });
    const pm = ch === 'pacemaker'; S.wave.visible = pm; S.sa.visible = pm || ch === 'overview';
    if (pm) { const w = loop(t, 2); S.wave.position.set(w < 0.4 ? -0.6 : 0, w < 0.4 ? 0.8 : -0.4 - (w - 0.5), 0.1); S.wave.rotation.x = Math.PI / 2; S.wave.scale.setScalar(w < 0.4 ? 0.2 + w * 3 : w < 0.5 ? 0.2 : 0.4 + (w - 0.5) * 2); }
  }
};

const double = {
  cameraDistance: 7,
  build(ctx) {
    const T = ctx.THREE; const S = {};
    ctx.part('pump', new T.Mesh(ctx.geo(new T.SphereGeometry(0.45, 24, 16)), ctx.mat(0xe11d48)));
    const lung = ctx.geo(new T.SphereGeometry(0.5, 20, 14)); lung.scale(0.8, 1.2, 0.7);
    for (const x of [-0.75, 0.75]) ctx.part('lungs', new T.Mesh(lung, ctx.mat(0x93c5fd, { opacity: 0.8 }))).position.set(x, 1.9, 0);
    const bodyG = ctx.geo(new T.BoxGeometry(2.2, 0.9, 0.9)); ctx.part('body', new T.Mesh(bodyG, ctx.mat(0xfca5a5, { opacity: 0.8 }))).position.set(0, -1.9, 0);
    const curve = (pts) => new T.CatmullRomCurve3(pts.map(([x, y]) => new T.Vector3(x, y, 0)), true);
    S.pul = curve([[0, 0.3], [-0.9, 1.0], [-0.6, 2.4], [0.6, 2.4], [0.9, 1.0]]);
    S.sys = curve([[0, -0.3], [1.4, -1.2], [0.9, -2.6], [-0.9, -2.6], [-1.4, -1.2]]);
    for (const c of [S.pul, S.sys]) ctx.part('blood', new T.Mesh(ctx.geo(new T.TubeGeometry(c, 80, 0.07, 6, true)), ctx.mat(0x64748b, { opacity: 0.5 })));
    S.cells = ctx.part('blood', new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.09, 10, 8)), ctx.mat(0xffffff, { clip: false }), 32));
    S.red = new T.Color(0xef4444); S.blue = new T.Color(0x3b82f6); S.c = new T.Color(); S.m4 = new T.Matrix4();
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0, ch === 'overview' ? Math.sin(t * 0.3) * 0.4 : 0, 0); ctx.clip.constant = 50;
    const flow = ch === 'flow'; S.cells.visible = true;
    for (let i = 0; i < 32; i++) {
      const pul = i < 16; const u = loop((flow ? t / 6 : 0) + (i % 16) / 16, 1);
      const p = (pul ? S.pul : S.sys).getPoint(u);
      // Pulmonary: leaves right side blue, turns red at the lungs (u≈0.5). Systemic: leaves red, turns blue in the body.
      const oxy = pul ? (u > 0.45 ? 1 : 0) : (u > 0.45 ? 0 : 1);
      S.c.copy(oxy ? S.red : S.blue); S.cells.setColorAt(i, S.c);
      S.cells.setMatrixAt(i, S.m4.makeTranslation(p.x, p.y, 0.05));
    }
    S.cells.instanceMatrix.needsUpdate = true; if (S.cells.instanceColor) S.cells.instanceColor.needsUpdate = true;
  }
};

const vessels = {
  cameraDistance: 6.5,
  build(ctx) {
    const T = ctx.THREE; const S = {};
    const tube = (rOut, rIn, len) => { const shape = new T.Shape(); shape.absarc(0, 0, rOut, 0, Math.PI * 2); const hole = new T.Path(); hole.absarc(0, 0, rIn, 0, Math.PI * 2, true); shape.holes.push(hole); const g = new T.ExtrudeGeometry(shape, { depth: len, bevelEnabled: false, curveSegments: 32 }); g.translate(0, 0, -len / 2); return ctx.geo(g); };
    S.art = new T.Group(); S.art.position.x = -1.9; ctx.root.add(S.art);
    ctx.part('artery', new T.Mesh(tube(0.7, 0.62, 2.2), ctx.mat(0xef4444)), S.art);
    ctx.part('media', new T.Mesh(tube(0.62, 0.36, 2.2), ctx.mat(0xf9a8d4)), S.art);
    ctx.part('artery', new T.Mesh(tube(0.36, 0.3, 2.2), ctx.mat(0xfecaca)), S.art);
    S.vein = new T.Group(); S.vein.position.x = 0.2; ctx.root.add(S.vein);
    ctx.part('vein', new T.Mesh(tube(0.75, 0.68, 2.2), ctx.mat(0x3b82f6)), S.vein);
    ctx.part('media', new T.Mesh(tube(0.68, 0.6, 2.2), ctx.mat(0xf9a8d4)), S.vein);
    S.flaps = []; for (const s of [1, -1]) { const f = ctx.part('vein', new T.Mesh(ctx.geo(new T.CircleGeometry(0.6, 20, 0, Math.PI)), ctx.mat(0x93c5fd, { side: T.DoubleSide })), S.vein); f.rotation.z = s > 0 ? 0 : Math.PI; S.flaps.push(f); }
    S.cap = new T.Group(); S.cap.position.x = 1.8; ctx.root.add(S.cap);
    ctx.part('capillary', new T.Mesh(tube(0.2, 0.17, 2.2), ctx.mat(0xa855f7, { opacity: 0.7 })), S.cap);
    S.rbc = []; const rg = ctx.geo(new T.CylinderGeometry(0.13, 0.13, 0.05, 16)); rg.rotateX(Math.PI / 2);
    for (let i = 0; i < 5; i++) { const r = ctx.part('capillary', new T.Mesh(rg, ctx.mat(0xdc2626, { clip: false })), S.cap); S.rbc.push(r); }
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.35, -0.55, 0); ctx.clip.constant = 50;
    const p = ch === 'pulse' ? Math.max(0, Math.sin(t * 7.5)) : 0;
    S.art.scale.set(1 + p * 0.08, 1 + p * 0.08, 1);
    const open = ch === 'pulse' ? (Math.sin(t * 2) > 0 ? 1 : 0) : 0;
    S.flaps.forEach((f, i) => { f.rotation.y = open ? (i ? -1.2 : 1.2) : 0; });
    S.rbc.forEach((r, i) => { r.position.z = -1 + loop(t / 3 + i / 5, 1) * 2; });
  }
};

const blood = {
  cameraDistance: 6,
  build(ctx) {
    const T = ctx.THREE; const S = {}; const rnd = seeded(71);
    ctx.part('plasma', new T.Mesh(ctx.geo(new T.BoxGeometry(5, 3, 1.6)), ctx.mat(0xfde68a, { opacity: 0.12, side: T.BackSide })));
    const rg = ctx.geo(new T.TorusGeometry(0.16, 0.09, 10, 20));
    S.rbc = ctx.part('rbc', new T.InstancedMesh(rg, ctx.mat(0xdc2626), 60));
    S.rbcSeeds = Array.from({ length: 60 }, () => [rnd() * 5 - 2.5, rnd() * 2.6 - 1.3, rnd() * 1.2 - 0.6, rnd() * 6]);
    S.wbc = []; for (let i = 0; i < 3; i++) { const w = ctx.part('wbc', new T.Mesh(ctx.geo(new T.IcosahedronGeometry(0.3, 2)), ctx.mat(0xe2e8f0))); S.wbc.push(w); const n = ctx.part('wbc', new T.Mesh(ctx.geo(new T.SphereGeometry(0.15, 12, 8)), ctx.mat(0x7c3aed, { clip: false }))); w.add(n); n.position.x = 0.12; }
    S.plt = ctx.part('platelet', new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.06, 8, 6)), ctx.mat(0xc084fc, { clip: false }), 24));
    S.pltSeeds = Array.from({ length: 24 }, () => [rnd() * 5 - 2.5, rnd() * 2.6 - 1.3, rnd() * 1.2 - 0.6]);
    S.fibrin = ctx.part('platelet', new T.Mesh(ctx.geo(new T.IcosahedronGeometry(0.9, 1)), new T.MeshBasicMaterial({ color: 0xfacc15, wireframe: true, transparent: true, opacity: 0.6 })));
    S.m4 = new T.Matrix4(); S.q = new T.Quaternion(); S.e = new T.Euler(); S.v = new T.Vector3(); S.one = new T.Vector3(1, 1, 1);
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.15, -0.2, 0); ctx.clip.constant = 50;
    const clot = ch === 'clot' ? ease((t - 3) / 10) : 0;
    S.rbcSeeds.forEach(([x, y, z, ph], i) => {
      let px = ((x + 2.5 + t * 0.4) % 5) - 2.5; let py = y; let pz = z;
      if (i < 18) { px = px * (1 - clot) + (1.2 + Math.cos(i) * 0.5) * clot; py = py * (1 - clot) + Math.sin(i * 2) * 0.5 * clot; pz *= 1 - clot * 0.5; }
      S.e.set(ph + t * 0.3, ph, 0); S.q.setFromEuler(S.e); S.v.set(px, py, pz);
      S.rbc.setMatrixAt(i, S.m4.compose(S.v, S.q, S.one));
    });
    S.rbc.instanceMatrix.needsUpdate = true;
    S.wbc.forEach((w, i) => w.position.set(((i * 1.7 + t * 0.3) % 5) - 2.5, -0.8 + i * 0.8, 0));
    S.pltSeeds.forEach(([x, y, z], i) => { const fx = ((x + 2.5 + t * 0.4) % 5) - 2.5; S.plt.setMatrixAt(i, S.m4.makeTranslation(fx * (1 - clot) + (1.2 + Math.cos(i * 3) * 0.6) * clot, y * (1 - clot) + Math.sin(i) * 0.6 * clot, z)); });
    S.plt.instanceMatrix.needsUpdate = true;
    S.fibrin.visible = clot > 0.3; S.fibrin.position.set(1.2, 0, 0); S.fibrin.scale.setScalar(clot);
  }
};

const plant = {
  cameraDistance: 7.5,
  build(ctx) {
    const T = ctx.THREE; const S = {}; const m4 = new T.Matrix4();
    const rootMat = ctx.mat(0xa16207);
    for (let i = 0; i < 5; i++) { const a = -0.8 + i * 0.4; const c = new T.CatmullRomCurve3([new T.Vector3(0, -1.6, 0), new T.Vector3(Math.sin(a) * 0.6, -2.2, Math.cos(a) * 0.2), new T.Vector3(Math.sin(a) * 1.1, -2.8, 0)]); ctx.part('root', new T.Mesh(ctx.geo(new T.TubeGeometry(c, 16, 0.05, 6)), rootMat)); }
    ctx.part('root', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.3, 0.3, 0.1, 16)), rootMat)).position.y = -1.6;
    ctx.part('xylem', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.1, 0.1, 3.4, 12)), ctx.mat(0x60a5fa, { opacity: 0.7 }))).position.set(-0.13, 0.1, 0);
    ctx.part('phloem', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.07, 0.07, 3.4, 12)), ctx.mat(0xfb923c, { opacity: 0.7 }))).position.set(0.13, 0.1, 0);
    const leafG = ctx.geo(new T.SphereGeometry(0.8, 24, 12)); leafG.scale(1, 0.1, 0.5);
    for (const s of [-1, 1]) { const l = ctx.part('leaf', new T.Mesh(leafG, ctx.mat(0x22c55e))); l.position.set(s * 0.85, 1.9, 0); l.rotation.z = s * 0.3; }
    S.water = ctx.part('xylem', new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.05, 8, 6)), ctx.mat(0x0ea5e9, { clip: false }), 14));
    S.vapour = ctx.part('leaf', new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.05, 8, 6)), ctx.mat(0xe0f2fe, { clip: false, opacity: 0.8 }), 14));
    S.sugar = ctx.part('phloem', new T.InstancedMesh(ctx.geo(new T.BoxGeometry(0.07, 0.07, 0.07)), ctx.mat(0xfacc15, { clip: false }), 10));
    S.m4 = m4; return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.1, t * 0.08, 0); ctx.clip.constant = 50;
    const on = ch === 'transpiration'; S.water.visible = on; S.vapour.visible = on; S.sugar.visible = on;
    if (!on) return;
    for (let i = 0; i < 14; i++) { const u = loop(t / 5 + i / 14, 1); S.water.setMatrixAt(i, S.m4.makeTranslation(-0.13, -1.6 + u * 3.4, 0)); const v = loop(t / 3 + i / 14, 1); const s = i % 2 ? 1 : -1; S.vapour.setMatrixAt(i, S.m4.makeTranslation(s * (0.6 + (i % 4) * 0.2), 1.85 - v * 0.2 + (i % 3 === 0 ? 0 : 0.2 + v * 0.8), (i % 3 - 1) * 0.3)); }
    for (let i = 0; i < 10; i++) { const u = loop(t / 7 + i / 10, 1); S.sugar.setMatrixAt(i, S.m4.makeTranslation(0.13, i % 3 === 0 ? -1.6 + u * 3.4 : 1.8 - u * 3.4, 0)); }
    S.water.instanceMatrix.needsUpdate = true; S.vapour.instanceMatrix.needsUpdate = true; S.sugar.instanceMatrix.needsUpdate = true;
  }
};

export const circulationBuilders = { heart, 'double-circulation': double, vessels, blood, 'plant-transport': plant };
