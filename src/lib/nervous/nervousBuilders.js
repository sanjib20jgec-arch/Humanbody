// Procedural 3D builders for the Brain & Nerves bay (state = f(chapter, t)).
import { ease, seeded } from '../three/ProceduralScene.js';

const loop = (t, p) => (t % p) / p;

const synapse = {
  cameraDistance: 6,
  build(ctx) {
    const T = ctx.THREE; const S = {}; const rnd = seeded(81);
    const ax = ctx.geo(new T.CylinderGeometry(0.25, 0.25, 2, 16)); ax.rotateZ(Math.PI / 2);
    ctx.part('terminal', new T.Mesh(ax, ctx.mat(0xfbbf24))).position.set(-2.2, 0.3, 0);
    const knob = ctx.geo(new T.SphereGeometry(0.9, 32, 20, 0, Math.PI * 2, 0, Math.PI)); knob.rotateZ(-Math.PI / 2);
    ctx.part('terminal', new T.Mesh(knob, ctx.mat(0xfbbf24, { opacity: 0.45, side: T.DoubleSide }))).position.set(-0.4, 0.3, 0);
    const rec = ctx.geo(new T.SphereGeometry(1.0, 32, 20, 0, Math.PI * 2, 0, Math.PI)); rec.rotateZ(Math.PI / 2);
    ctx.part('receiver', new T.Mesh(rec, ctx.mat(0x38bdf8, { opacity: 0.55, side: T.DoubleSide }))).position.set(0.45, 0.3, 0);
    const dn = ctx.geo(new T.CylinderGeometry(0.25, 0.25, 1.8, 16)); dn.rotateZ(Math.PI / 2);
    ctx.part('receiver', new T.Mesh(dn, ctx.mat(0x38bdf8))).position.set(2.3, 0.3, 0);
    S.ves = []; for (let i = 0; i < 9; i++) { const v = ctx.part('vesicle', new T.Mesh(ctx.geo(new T.SphereGeometry(0.13, 12, 8)), ctx.mat(0xf472b6, { clip: false }))); v.userData.home = new T.Vector3(-1.1 + rnd() * 0.5, 0.3 + (rnd() - 0.5) * 1.1, (rnd() - 0.5) * 0.9); S.ves.push(v); }
    S.tx = ctx.part('transmitter', new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.035, 6, 4)), ctx.mat(0x22d3ee, { clip: false }), 60));
    S.seeds = Array.from({ length: 60 }, () => [(rnd() - 0.5) * 1.2, (rnd() - 0.5) * 0.9, rnd()]);
    S.pulse = ctx.part('terminal', new T.Mesh(ctx.geo(new T.SphereGeometry(0.2, 12, 8)), ctx.mat(0xffffff, { clip: false })));
    S.post = ctx.part('receiver', new T.Mesh(ctx.geo(new T.SphereGeometry(0.2, 12, 8)), ctx.mat(0xffffff, { clip: false })));
    S.m4 = new T.Matrix4();
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.2, -0.3, 0); ctx.clip.constant = 50;
    const go = ch === 'transmit'; const u = go ? loop(t, 6) : 0;
    S.pulse.visible = go && u < 0.25; S.pulse.position.set(-3 + (u / 0.25) * 2.2, 0.3, 0);
    const fuse = ease((u - 0.25) / 0.15);
    S.ves.forEach((v, i) => { const h = v.userData.home; v.position.set(h.x + (-0.42 - h.x) * fuse * (i < 4 ? 1 : 0), h.y, h.z); v.visible = !(i < 4 && fuse > 0.95); });
    const cross = ease((u - 0.4) / 0.2); S.tx.visible = go && u > 0.38 && u < 0.85;
    S.seeds.forEach(([y, z, r], i) => S.tx.setMatrixAt(i, S.m4.makeTranslation(-0.42 + cross * (0.4 + r * 0.05), 0.3 + y, z)));
    S.tx.instanceMatrix.needsUpdate = true;
    S.post.visible = go && u > 0.65; S.post.position.set(0.8 + ((u - 0.65) / 0.35) * 2.4, 0.3, 0);
  }
};

const reflex = {
  cameraDistance: 7.5,
  build(ctx) {
    const T = ctx.THREE; const S = {};
    // Spinal cord cross-section (butterfly grey matter suggested by a darker core).
    const cord = ctx.geo(new T.CylinderGeometry(0.9, 0.9, 2.4, 32)); ctx.part('cord', new T.Mesh(cord, ctx.mat(0xe2e8f0, { opacity: 0.6 }))).position.set(1.8, 0.6, 0);
    ctx.part('cord', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.45, 0.45, 2.42, 6)), ctx.mat(0x94a3b8))).position.set(1.8, 0.6, 0);
    const handG = ctx.geo(new T.BoxGeometry(1.2, 0.35, 0.8)); S.hand = ctx.part('effector', new T.Mesh(handG, ctx.mat(0xfda4af))); S.hand.position.set(-2.6, -1.4, 0);
    ctx.part('effector', new T.Mesh(ctx.geo(new T.CapsuleGeometry(0.3, 1.2, 6, 12)), ctx.mat(0xfb7185))).position.set(-1.8, 0.1, 0);
    ctx.part('receptor', new T.Mesh(ctx.geo(new T.SphereGeometry(0.14, 12, 8)), ctx.mat(0xfacc15))).position.set(-2.6, -1.62, 0.3);
    const flame = ctx.geo(new T.ConeGeometry(0.25, 0.6, 12)); ctx.part('receptor', new T.Mesh(flame, ctx.mat(0xf97316))).position.set(-2.6, -2.2, 0);
    S.sens = new T.CatmullRomCurve3([[-2.6, -1.6, 0.3], [-1.2, -1.5, 0.4], [0.4, -0.6, 0.3], [1.2, 0.2, 0.3], [1.7, 0.6, 0.2]].map((p) => new T.Vector3(...p)));
    S.rel = new T.CatmullRomCurve3([[1.7, 0.6, 0.2], [1.9, 0.6, 0], [1.7, 0.7, -0.2]].map((p) => new T.Vector3(...p)));
    S.mot = new T.CatmullRomCurve3([[1.7, 0.7, -0.2], [1.0, 0.9, -0.3], [-0.4, 0.8, -0.3], [-1.5, 0.3, -0.2]].map((p) => new T.Vector3(...p)));
    ctx.part('sensory', new T.Mesh(ctx.geo(new T.TubeGeometry(S.sens, 40, 0.05, 6)), ctx.mat(0x38bdf8)));
    ctx.part('relay', new T.Mesh(ctx.geo(new T.TubeGeometry(S.rel, 10, 0.05, 6)), ctx.mat(0xa78bfa, { clip: false })));
    ctx.part('motor', new T.Mesh(ctx.geo(new T.TubeGeometry(S.mot, 40, 0.05, 6)), ctx.mat(0xf472b6)));
    S.imp = ctx.part('impulse', new T.Mesh(ctx.geo(new T.SphereGeometry(0.13, 12, 8)), ctx.mat(0x22d3ee, { clip: false })));
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.15, -0.2, 0); ctx.clip.constant = 50;
    const go = ch === 'arc'; const u = go ? loop(t, 5) : 0;
    S.imp.visible = go;
    if (go) S.imp.position.copy(u < 0.45 ? S.sens.getPoint(u / 0.45) : u < 0.55 ? S.rel.getPoint((u - 0.45) / 0.1) : S.mot.getPoint(Math.min(1, (u - 0.55) / 0.35)));
    const lift = go ? ease((u - 0.88) / 0.1) : 0; S.hand.position.y = -1.4 + lift * 0.6;
  }
};

const brain = {
  cameraDistance: 6.5,
  build(ctx) {
    const T = ctx.THREE; const S = {};
    const blob = (r, sx, sy, sz) => { const g = ctx.geo(new T.SphereGeometry(r, 40, 24)); g.scale(sx, sy, sz); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const n = 1 + 0.03 * Math.sin(p.getX(i) * 14) * Math.sin(p.getY(i) * 12) * Math.sin(p.getZ(i) * 13); p.setXYZ(i, p.getX(i) * n, p.getY(i) * n, p.getZ(i) * n); } g.computeVertexNormals(); return g; };
    S.regions = {};
    S.regions.forebrain = ctx.part('forebrain', new T.Mesh(blob(1.4, 1.3, 0.95, 1), ctx.mat(0xf472b6))); S.regions.forebrain.position.set(0.1, 0.5, 0);
    S.regions.midbrain = ctx.part('midbrain', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.3, 0.3, 0.5, 16)), ctx.mat(0xfbbf24))); S.regions.midbrain.position.set(-0.2, -0.5, 0);
    S.regions.cerebellum = ctx.part('cerebellum', new T.Mesh(blob(0.6, 1.2, 0.8, 1.3), ctx.mat(0x34d399))); S.regions.cerebellum.position.set(-1.1, -0.85, 0);
    S.regions.medulla = ctx.part('medulla', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.28, 0.22, 0.7, 16)), ctx.mat(0x60a5fa))); S.regions.medulla.position.set(-0.4, -1.05, 0); S.regions.medulla.rotation.z = -0.25;
    S.regions.spinal = ctx.part('spinal', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.2, 0.2, 1.4, 16)), ctx.mat(0xcbd5e1))); S.regions.spinal.position.set(-0.6, -2.0, 0); S.regions.spinal.rotation.z = -0.2;
    S.order = ['forebrain', 'midbrain', 'cerebellum', 'medulla'];
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.1, 1.2 + t * (ch === 'overview' ? 0.12 : 0.04), 0); ctx.clip.constant = ch === 'roles' ? 0 : 50;
    const focus = ch === 'roles' ? S.order[Math.floor(t / 5.5) % 4] : null;
    Object.entries(S.regions).forEach(([k, m]) => { const on = !focus || k === focus; m.material.emissive.setHex(focus && on ? 0x333333 : 0x000000); m.material.opacity = on ? 1 : 0.35; m.material.transparent = !on; m.material.depthWrite = on; });
  }
};

const eye = {
  cameraDistance: 6.5,
  build(ctx) {
    const T = ctx.THREE; const S = {};
    ctx.part('retina', new T.Mesh(ctx.geo(new T.SphereGeometry(1.5, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.6)), ctx.mat(0xf472b6, { side: T.DoubleSide }))).rotation.z = Math.PI / 2;
    ctx.part('retina', new T.Mesh(ctx.geo(new T.SphereGeometry(1.55, 48, 32)), ctx.mat(0xf8fafc, { opacity: 0.18, side: T.BackSide })));
    const cg = ctx.geo(new T.SphereGeometry(0.75, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.35)); cg.rotateZ(-Math.PI / 2);
    ctx.part('cornea', new T.Mesh(cg, ctx.mat(0xbae6fd, { opacity: 0.6, side: T.DoubleSide }))).position.set(0.95, 0, 0);
    S.iris = ctx.part('iris', new T.Mesh(ctx.geo(new T.RingGeometry(0.28, 0.62, 32)), ctx.mat(0xa16207, { side: T.DoubleSide }))); S.iris.rotation.y = Math.PI / 2; S.iris.position.x = 1.05;
    S.lens = ctx.part('lens', new T.Mesh(ctx.geo(new T.SphereGeometry(0.45, 32, 20)), ctx.mat(0xfde68a, { opacity: 0.8 }))); S.lens.position.x = 0.8;
    for (const s of [1, -1]) ctx.part('ciliary', new T.Mesh(ctx.geo(new T.TorusGeometry(0.55, 0.06, 6, 24, Math.PI * 0.6)), ctx.mat(0xfb7185))).rotation.set(0, Math.PI / 2, s > 0 ? Math.PI * 0.2 : Math.PI * 1.2);
    S.obj = ctx.part('ray', new T.Mesh(ctx.geo(new T.ConeGeometry(0.15, 0.6, 12)), ctx.mat(0x22c55e, { clip: false })));
    S.img = ctx.part('ray', new T.Mesh(ctx.geo(new T.ConeGeometry(0.06, 0.24, 12)), ctx.mat(0x22c55e, { clip: false }))); S.img.rotation.z = Math.PI;
    S.rays = []; for (let i = 0; i < 3; i++) { const r = ctx.part('ray', new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(), new T.Vector3(), new T.Vector3()]), new T.LineBasicMaterial({ color: 0xfacc15 }))); S.rays.push(r); }
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.2, -0.9, 0); ctx.clip.constant = 0;
    const near = ch === 'accommodation' ? (Math.sin(t * 0.5) + 1) / 2 : 0;
    const ox = 3.6 - near * 1.6; S.obj.position.set(ox, 0.3, 0);
    S.lens.scale.set(0.55 + near * 0.35, 1, 1); // thicker for near objects
    S.img.position.set(-1.45, -0.12, 0);
    const tip = [ox, 0.6, 0]; const lensX = 0.8;
    [[0.6], [0.0], [-0.3]].forEach(([y], i) => {
      const pts = [new ctx.THREE.Vector3(...tip), new ctx.THREE.Vector3(lensX, y * 0.5, 0), new ctx.THREE.Vector3(-1.45, -0.24, 0)];
      S.rays[i].geometry.setFromPoints(pts);
    });
  }
};

const hormones = {
  cameraDistance: 7,
  build(ctx) {
    const T = ctx.THREE; const S = {};
    const g = ctx.geo(new T.SphereGeometry(0.6, 24, 16)); g.scale(1.6, 0.7, 0.8);
    ctx.part('gland', new T.Mesh(g, ctx.mat(0xf59e0b))).position.set(-2.3, 0.2, 0);
    S.path = new T.CatmullRomCurve3([[-1.6, 0.2, 0], [-0.5, 1.1, 0], [0.8, 0.9, 0], [2.0, 0.2, 0]].map((p) => new T.Vector3(...p)));
    ctx.part('vessel', new T.Mesh(ctx.geo(new T.TubeGeometry(S.path, 60, 0.18, 12)), ctx.mat(0xef4444, { opacity: 0.45 })));
    S.targets = []; for (let i = 0; i < 4; i++) { const c = ctx.part('target', new T.Mesh(ctx.geo(new T.IcosahedronGeometry(0.32, 2)), ctx.mat(0x22c55e))); c.position.set(2.2 + (i % 2) * 0.7, -0.4 - Math.floor(i / 2) * 0.7, 0); S.targets.push(c); }
    S.h = ctx.part('hormone', new T.InstancedMesh(ctx.geo(new T.OctahedronGeometry(0.08)), ctx.mat(0xa855f7, { clip: false }), 16));
    S.sugar = ctx.part('sugar', new T.InstancedMesh(ctx.geo(new T.BoxGeometry(0.09, 0.09, 0.09)), ctx.mat(0xfacc15, { clip: false }), 24));
    S.m4 = new T.Matrix4(); return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.15, -0.2, 0); ctx.clip.constant = 50;
    const fb = ch === 'feedback';
    // Blood sugar rises (0–8 s), insulin output follows, sugar falls, output falls (feedback).
    const sugarLvl = fb ? (t < 8 ? ease(t / 8) : 1 - ease((t - 10) / 10)) : 0.3;
    const out = fb ? Math.max(0, sugarLvl - 0.15) : 1;
    const n = Math.round(16 * out);
    for (let i = 0; i < 16; i++) { const u = loop(t / 4 + i / 16, 1); const p = S.path.getPoint(u); S.h.setMatrixAt(i, S.m4.makeTranslation(p.x, p.y, p.z).scale(new ctx.THREE.Vector3(1, 1, 1).multiplyScalar(i < n ? 1 : 0.0001))); }
    S.h.instanceMatrix.needsUpdate = true;
    const k = Math.round(24 * sugarLvl); S.sugar.visible = fb;
    for (let i = 0; i < 24; i++) { const u = loop(t / 5 + i / 24, 1); const p = S.path.getPoint(u); S.sugar.setMatrixAt(i, S.m4.makeTranslation(p.x, p.y + 0.06, p.z + 0.06).scale(new ctx.THREE.Vector3(1, 1, 1).multiplyScalar(i < k ? 1 : 0.0001))); }
    S.sugar.instanceMatrix.needsUpdate = true;
    S.targets.forEach((c) => c.scale.setScalar(1 + (fb ? out * 0.08 * Math.sin(t * 4) : 0)));
  }
};

const plant = {
  cameraDistance: 6.5,
  build(ctx) {
    const T = ctx.THREE; const S = {};
    ctx.part('shoot', new T.Mesh(ctx.geo(new T.CylinderGeometry(1.2, 1, 0.6, 24)), ctx.mat(0x92400e))).position.y = -1.9;
    S.segs = []; let parent = ctx.root; let y0 = -1.6;
    for (let i = 0; i < 8; i++) { const g = new T.Group(); g.position.y = i === 0 ? y0 : 0.4; parent.add(g); const m = ctx.part('shoot', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.09, 0.1, 0.42, 10)), ctx.mat(0x22c55e)), g); m.position.y = 0.2; S.segs.push(g); parent = g; }
    S.tip = ctx.part('tip', new T.Mesh(ctx.geo(new T.ConeGeometry(0.12, 0.25, 10)), ctx.mat(0x86efac)), parent); S.tip.position.y = 0.5;
    for (const s of [-1, 1]) { const lf = ctx.geo(new T.SphereGeometry(0.3, 16, 8)); lf.scale(1, 0.15, 0.5); ctx.part('shoot', new T.Mesh(lf, ctx.mat(0x16a34a)), S.segs[6]).position.set(s * 0.3, 0.3, 0); }
    S.sun = ctx.part('light', new T.Mesh(ctx.geo(new T.SphereGeometry(0.3, 16, 12)), new T.MeshBasicMaterial({ color: 0xfacc15 })));
    S.aux = ctx.part('auxin', new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.035, 6, 4)), ctx.mat(0xa855f7, { clip: false }), 16));
    S.m4 = new T.Matrix4(); S.v = new T.Vector3();
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.1, -0.3, 0); ctx.clip.constant = 50;
    const side = ch === 'bend'; const b = side ? ease((t - 2) / 14) : 0;
    S.sun.position.set(side ? 2.4 : 0, side ? 1.2 : 2.4, 0);
    S.segs.forEach((g, i) => { g.rotation.z = i === 0 ? 0 : -b * 0.16; });
    S.aux.visible = side;
    ctx.root.updateMatrixWorld(true);
    for (let i = 0; i < 16; i++) { const seg = S.segs[Math.min(7, 2 + (i % 6))]; S.v.set(-0.11, (loop(t / 3 + i / 16, 1)) * 0.4, (i % 2 ? 0.04 : -0.04)); seg.localToWorld(S.v); ctx.root.worldToLocal(S.v); S.aux.setMatrixAt(i, S.m4.makeTranslation(S.v.x, S.v.y, S.v.z)); }
    S.aux.instanceMatrix.needsUpdate = true;
  }
};

export const nervousBuilders = { synapse, reflex, brain, eye, hormones, 'plant-coordination': plant };
