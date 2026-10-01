// Procedural 3D builders for the Respiration bay (state = f(chapter, t)).
import { ease, seeded } from '../three/ProceduralScene.js';

const loop = (t, p) => (t % p) / p;

const alveoli = {
  cameraDistance: 6,
  build(ctx) {
    const T = ctx.THREE; const S = {}; const rnd = seeded(91);
    const br = ctx.geo(new T.CylinderGeometry(0.18, 0.22, 2, 16)); ctx.part('bronchiole', new T.Mesh(br, ctx.mat(0xe2e8f0))).position.set(0, 1.8, 0);
    S.sacs = [];
    for (let i = 0; i < 9; i++) { const a = i * 2.4; const y = 0.2 - (i % 3) * 0.6; const r = 0.75; const m = ctx.part('alveolus', new T.Mesh(ctx.geo(new T.SphereGeometry(0.5, 24, 16)), ctx.mat(0xf9a8d4, { opacity: 0.6, side: T.DoubleSide }))); m.position.set(Math.cos(a) * r, y, Math.sin(a) * r); S.sacs.push(m); }
    const capMat = ctx.mat(0xef4444);
    S.sacs.forEach((s) => { const pts = []; for (let j = 0; j <= 24; j++) { const a = j * 0.55; pts.push(new T.Vector3(Math.cos(a) * 0.53, (j / 24 - 0.5) * 0.9, Math.sin(a) * 0.53).add(s.position)); } ctx.part('capillary', new T.Mesh(ctx.geo(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 60, 0.025, 5)), capMat)); });
    S.o2 = ctx.part('gas', new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.05, 8, 6)), ctx.mat(0x22d3ee, { clip: false }), 27));
    S.co2 = ctx.part('gas', new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.05, 8, 6)), ctx.mat(0x94a3b8, { clip: false }), 27));
    S.dirs = Array.from({ length: 27 }, () => new T.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize());
    S.m4 = new T.Matrix4(); return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.2, t * 0.08, 0); ctx.clip.constant = 50;
    const breathe = 1 + Math.sin(t * 1.2) * 0.04; S.sacs.forEach((s) => s.scale.setScalar(breathe));
    const on = ch === 'exchange'; S.o2.visible = on; S.co2.visible = on;
    for (let i = 0; i < 27; i++) { const s = S.sacs[i % 9].position; const d = S.dirs[i]; const u = loop(t / 3 + i / 27, 1);
      const ro = 0.1 + u * 0.55; S.o2.setMatrixAt(i, S.m4.makeTranslation(s.x + d.x * ro, s.y + d.y * ro, s.z + d.z * ro));
      const rc = 0.65 - u * 0.55; S.co2.setMatrixAt(i, S.m4.makeTranslation(s.x - d.x * rc, s.y - d.y * rc, s.z - d.z * rc)); }
    S.o2.instanceMatrix.needsUpdate = true; S.co2.instanceMatrix.needsUpdate = true;
  }
};

const breathing = {
  cameraDistance: 7,
  build(ctx) {
    const T = ctx.THREE; const S = {};
    S.ribs = []; for (let i = 0; i < 7; i++) { const r = ctx.part('ribs', new T.Mesh(ctx.geo(new T.TorusGeometry(1.4 - Math.abs(i - 3) * 0.06, 0.05, 6, 40)), ctx.mat(0xf5f5f4))); r.rotation.x = Math.PI / 2; r.position.y = 1.4 - i * 0.38; S.ribs.push(r); }
    S.lungs = []; for (const s of [-1, 1]) { const g = ctx.geo(new T.SphereGeometry(0.6, 24, 16)); g.scale(0.9, 1.6, 0.9); const l = ctx.part('lung', new T.Mesh(g, ctx.mat(0xf9a8d4))); l.position.set(s * 0.65, 0.2, 0); S.lungs.push(l); }
    S.dia = ctx.part('diaphragm', new T.Mesh(ctx.geo(new T.SphereGeometry(1.35, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2)), ctx.mat(0xfb7185, { side: T.DoubleSide })));
    S.air = ctx.part('airflow', new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.05, 8, 6)), ctx.mat(0x22d3ee, { clip: false }), 16));
    ctx.part('airflow', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.12, 0.12, 1.2, 12)), ctx.mat(0xe2e8f0))).position.set(0, 2.0, 0);
    S.m4 = new T.Matrix4(); return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.15, -0.4, 0); ctx.clip.constant = 0.3;
    const inh = ch === 'cycle' ? (Math.sin((t / 4) * Math.PI * 2 - Math.PI / 2) + 1) / 2 : 0.3; // 4 s per breath (~15/min)
    S.ribs.forEach((r, i) => { r.position.y = 1.4 - i * 0.38 + inh * 0.12; r.scale.set(1 + inh * 0.08, 1 + inh * 0.08, 1); r.rotation.x = Math.PI / 2 - inh * 0.12; });
    S.dia.position.y = -1.3 - inh * 0.35; S.dia.scale.set(1 + inh * 0.06, 0.55 - inh * 0.35, 1 + inh * 0.06);
    S.lungs.forEach((l) => l.scale.set(1 + inh * 0.12, 1 + inh * 0.15, 1 + inh * 0.12));
    S.air.visible = ch === 'cycle';
    const dir = Math.cos((t / 4) * Math.PI * 2 - Math.PI / 2) >= 0 ? 1 : -1; // inflow while expanding
    for (let i = 0; i < 16; i++) { const u = loop(t / 1.5 + i / 16, 1); const y = dir > 0 ? 3.0 - u * 2.2 : 0.8 + u * 2.2; S.air.setMatrixAt(i, S.m4.makeTranslation(Math.sin(i) * 0.06, y, Math.cos(i) * 0.06)); }
    S.air.instanceMatrix.needsUpdate = true;
  }
};

const cellular = {
  cameraDistance: 6.5,
  build(ctx) {
    const T = ctx.THREE; const S = {};
    ctx.part('cytoplasm', new T.Mesh(ctx.geo(new T.SphereGeometry(2.4, 40, 24)), ctx.mat(0xbae6fd, { opacity: 0.15, side: T.BackSide })));
    const mg = ctx.geo(new T.CapsuleGeometry(0.45, 1.2, 8, 20)); mg.rotateZ(Math.PI / 2);
    S.mito = ctx.part('mito', new T.Mesh(mg, ctx.mat(0xfb923c, { opacity: 0.85 }))); S.mito.position.set(1.2, 0, 0);
    const bead = ctx.geo(new T.IcosahedronGeometry(0.12, 1));
    S.glu = []; for (let i = 0; i < 6; i++) S.glu.push(ctx.part('glucose', new T.Mesh(bead, ctx.mat(0xfacc15, { clip: false }))));
    S.atp = ctx.part('atp', new T.InstancedMesh(ctx.geo(new T.OctahedronGeometry(0.09)), ctx.mat(0x22c55e, { clip: false }), 20));
    S.waste = ctx.part('waste', new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.07, 8, 6)), ctx.mat(0x94a3b8, { clip: false }), 12));
    S.m4 = new T.Matrix4(); return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.15, -0.2, 0); ctx.clip.constant = 50;
    const u = loop(t, 10); const split = ease((u - 0.2) / 0.15);
    S.glu.forEach((b, i) => { const half = i < 3 ? -1 : 1; const k = i % 3; b.position.set(-2 + k * 0.25 + split * 0.6, half * split * 0.5 + (i < 3 ? 0 : 0.0001), 0); });
    const aer = ch === 'aerobic'; const ana = ch === 'anaerobic';
    if (aer) { const into = ease((u - 0.45) / 0.25); S.glu.forEach((b, i) => { b.position.x += into * 2.4; b.position.y *= 1 - into; b.visible = into < 0.98; }); }
    else S.glu.forEach((b) => { b.visible = true; });
    const nAtp = ch === 'overview' ? (split > 0.5 ? 2 : 0) : aer ? (u > 0.7 ? 20 : 2) : (split > 0.5 ? 2 : 0);
    for (let i = 0; i < 20; i++) { const a = i * 0.9 + t; const c = i < 2 ? [-1.3, 0] : [1.2, 0]; S.atp.setMatrixAt(i, S.m4.makeTranslation(c[0] + Math.cos(a) * (0.9 + (i % 3) * 0.2), c[1] + Math.sin(a) * 0.8, Math.sin(a * 1.3) * 0.3).scale(new ctx.THREE.Vector3(1, 1, 1).multiplyScalar(i < nAtp ? 1 : 0.0001))); }
    S.atp.instanceMatrix.needsUpdate = true;
    S.waste.visible = (aer && u > 0.7) || (ana && u > 0.5);
    for (let i = 0; i < 12; i++) { const v = loop(t / 2 + i / 12, 1); const o = aer ? [1.2 + v * 1.5, Math.sin(i) * 0.8] : [-1.0 + Math.cos(i) * 0.4, Math.sin(i) * 0.6 + v * 0.3]; S.waste.setMatrixAt(i, S.m4.makeTranslation(o[0], o[1], Math.cos(i) * 0.3)); }
    S.waste.instanceMatrix.needsUpdate = true;
  }
};

const stomata = {
  cameraDistance: 5.5,
  build(ctx) {
    const T = ctx.THREE; const S = {}; const rnd = seeded(97);
    const ep = new T.InstancedMesh(ctx.geo(new T.BoxGeometry(0.62, 0.25, 0.42)), ctx.mat(0xbbf7d0), 40); const m4 = new T.Matrix4(); let n = 0;
    for (let i = -4; i <= 4; i++) for (let k = -2; k <= 2; k++) { if (Math.abs(i) <= 1 && Math.abs(k) <= 1) continue; if (n < 40) ep.setMatrixAt(n++, m4.makeTranslation(i * 0.64, -0.13, k * 0.44 + (i % 2) * 0.1)); }
    ep.count = n; ctx.part('epidermis', ep);
    S.g = []; for (const s of [-1, 1]) { const g = ctx.geo(new T.TorusGeometry(0.5, 0.18, 12, 32, Math.PI)); const m = ctx.part('guard', new T.Mesh(g, ctx.mat(0x22c55e))); m.rotation.x = -Math.PI / 2; m.rotation.z = s > 0 ? Math.PI / 2 : -Math.PI / 2; S.g.push(m); }
    S.pore = ctx.part('pore', new T.Mesh(ctx.geo(new T.CircleGeometry(0.3, 24)), ctx.mat(0x0f172a))); S.pore.rotation.x = -Math.PI / 2; S.pore.position.y = -0.05;
    S.o2 = ctx.part('gas', new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.05, 8, 6)), ctx.mat(0x22d3ee, { clip: false }), 12));
    S.co2 = ctx.part('gas', new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.05, 8, 6)), ctx.mat(0x94a3b8, { clip: false }), 12));
    S.jit = Array.from({ length: 12 }, () => [(rnd() - 0.5) * 0.3, (rnd() - 0.5) * 0.3]);
    S.m4 = m4; return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.7, t * 0.05, 0); ctx.clip.constant = 50;
    const dn = ch === 'daynight'; const day = !dn || (t % 24) < 12;
    const open = dn ? (day ? ease(((t % 24) - 1) / 3) : 1 - ease(((t % 24) - 12) / 3)) * 0.8 + 0.2 : 0.7;
    S.g.forEach((m, i) => { m.position.x = (i ? 1 : -1) * (0.2 + open * 0.15); });
    S.pore.scale.set(0.4 + open * 0.6, 1, 1.4);
    S.o2.visible = dn && day; S.co2.visible = dn;
    for (let i = 0; i < 12; i++) { const u = loop(t / 3 + i / 12, 1); const [x, z] = S.jit[i];
      S.o2.setMatrixAt(i, S.m4.makeTranslation(x, -0.6 + u * 1.8, z));
      S.co2.setMatrixAt(i, S.m4.makeTranslation(x * 1.2, day ? 1.2 - u * 1.8 : -0.6 + u * 1.8, z * 1.2)); }
    S.o2.instanceMatrix.needsUpdate = true; S.co2.instanceMatrix.needsUpdate = true;
  }
};

export const respirationBuilders = { alveoli, breathing, 'cellular-respiration': cellular, stomata };
