// Procedural 3D builders for the Reproduction bay — schematic, textbook-style shapes only.
import { ease, seeded } from '../three/ProceduralScene.js';

const loop = (t, p) => (t % p) / p;

// chapters: 'overview' (binary fission), 'budding'
const asexual = {
  cameraDistance: 6,
  build(ctx) {
    const T = ctx.THREE; const S = {};
    S.a = ctx.part('parent', new T.Mesh(ctx.geo(new T.IcosahedronGeometry(0.9, 4)), ctx.mat(0xa78bfa, { opacity: 0.75 })));
    S.b = ctx.part('parent', new T.Mesh(ctx.geo(new T.IcosahedronGeometry(0.9, 4)), ctx.mat(0xa78bfa, { opacity: 0.75 })));
    S.na = ctx.part('nucleus', new T.Mesh(ctx.geo(new T.SphereGeometry(0.25, 16, 12)), ctx.mat(0x4c1d95, { clip: false })));
    S.nb = ctx.part('nucleus', new T.Mesh(ctx.geo(new T.SphereGeometry(0.25, 16, 12)), ctx.mat(0x4c1d95, { clip: false })));
    // Hydra-like body for budding
    S.hydra = new T.Group(); ctx.root.add(S.hydra);
    ctx.part('parent', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.35, 0.45, 2.4, 20)), ctx.mat(0x86efac)), S.hydra);
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; const tc = ctx.part('parent', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.04, 0.06, 0.9, 6)), ctx.mat(0x86efac)), S.hydra); tc.position.set(Math.cos(a) * 0.3, 1.5, Math.sin(a) * 0.3); tc.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); }
    S.bud = ctx.part('bud', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.15, 0.2, 0.9, 16)), ctx.mat(0x34d399)), S.hydra);
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.15, t * 0.1, 0); ctx.clip.constant = 50;
    const fis = ch === 'overview'; S.a.visible = fis; S.b.visible = fis; S.na.visible = fis; S.nb.visible = fis; S.hydra.visible = !fis;
    if (fis) {
      const nuc = ease((t - 2) / 4); const cell = ease((t - 6) / 6);
      S.na.position.set(-0.4 * nuc - 0.6 * cell, 0, 0); S.nb.position.set(0.4 * nuc + 0.6 * cell, 0, 0);
      const sep = 0.15 + cell * 0.85; S.a.position.x = -sep; S.b.position.x = sep;
      const sq = 1 - 0.25 * Math.sin(cell * Math.PI); S.a.scale.set(1, sq, sq); S.b.scale.set(1, sq, sq);
    } else {
      const g = ease((t - 1) / 10); const off = ease((t - 12) / 5);
      S.bud.scale.setScalar(0.2 + g * 0.8); S.bud.position.set(0.45 + g * 0.35 + off * 1.2, -0.3 - off * 0.6, 0); S.bud.rotation.z = -1.1 + off * 0.9;
    }
  }
};

const flower = {
  cameraDistance: 6,
  build(ctx) {
    const T = ctx.THREE; const S = {};
    const pg = ctx.geo(new T.SphereGeometry(0.7, 20, 10)); pg.scale(0.5, 0.08, 1); pg.translate(0, 0, 0.7);
    for (let i = 0; i < 5; i++) { const p = ctx.part('petal', new T.Mesh(pg, ctx.mat(0xf472b6, { side: T.DoubleSide }))); p.rotation.set(-0.5, (i / 5) * Math.PI * 2, 0); }
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; const f = ctx.part('stamen', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.02, 0.02, 1.0, 6)), ctx.mat(0xfef08a))); f.position.set(Math.cos(a) * 0.35, 0.5, Math.sin(a) * 0.35); const an = ctx.part('stamen', new T.Mesh(ctx.geo(new T.CapsuleGeometry(0.06, 0.14, 4, 8)), ctx.mat(0xfacc15))); an.position.set(Math.cos(a) * 0.35, 1.05, Math.sin(a) * 0.35); }
    S.ovary = ctx.part('carpel', new T.Mesh(ctx.geo(new T.SphereGeometry(0.3, 20, 14)), ctx.mat(0x22c55e, { opacity: 0.6 }))); S.ovary.position.y = 0.1;
    ctx.part('carpel', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.05, 0.08, 1.1, 10)), ctx.mat(0x4ade80, { opacity: 0.7 }))).position.y = 0.9;
    ctx.part('carpel', new T.Mesh(ctx.geo(new T.SphereGeometry(0.12, 12, 8)), ctx.mat(0x16a34a))).position.y = 1.5;
    S.ovule = ctx.part('ovule', new T.Mesh(ctx.geo(new T.SphereGeometry(0.1, 12, 8)), ctx.mat(0xfde68a, { clip: false }))); S.ovule.position.set(0, 0.05, 0);
    S.pollen = ctx.part('stamen', new T.Mesh(ctx.geo(new T.IcosahedronGeometry(0.07, 1)), ctx.mat(0xfacc15, { clip: false })));
    S.tubeCurve = new T.CatmullRomCurve3([new T.Vector3(0, 1.55, 0), new T.Vector3(0.02, 1.0, 0), new T.Vector3(0, 0.4, 0), new T.Vector3(0, 0.12, 0)]);
    S.tube = ctx.part('pollen-tube', new T.Mesh(ctx.geo(new T.TubeGeometry(S.tubeCurve, 40, 0.025, 6)), ctx.mat(0xfb923c, { clip: false })));
    S.tube.geometry.setDrawRange(0, 0);
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.3, t * 0.08, 0); ctx.clip.constant = ch === 'pollinate' ? 0 : 50;
    const on = ch === 'pollinate'; S.pollen.visible = on;
    const land = ease((t - 1) / 4); S.pollen.position.set(1.8 * (1 - land), 2.4 - land * 0.8, 0);
    const grow = on ? ease((t - 6) / 10) : 0;
    const total = S.tube.geometry.index ? S.tube.geometry.index.count : 0; S.tube.geometry.setDrawRange(0, Math.floor(total * grow));
    const fert = on ? ease((t - 17) / 3) : 0; S.ovule.scale.setScalar(1 + fert * 0.6); S.ovule.material.emissive.setHex(fert > 0.5 ? 0x553300 : 0x000000);
  }
};

// chapters: 'overview' (meeting), 'implant' (cleavage on the way to the uterus)
const human = {
  cameraDistance: 6.5,
  build(ctx) {
    const T = ctx.THREE; const S = {}; const rnd = seeded(113);
    S.path = new T.CatmullRomCurve3([[-2.6, 0.3, 0], [-1.4, 0.6, 0], [0, 0.4, 0], [1.2, -0.2, 0], [2.2, -0.9, 0]].map((v) => new T.Vector3(...v)));
    ctx.part('oviduct', new T.Mesh(ctx.geo(new T.TubeGeometry(S.path, 80, 0.45, 20)), ctx.mat(0xf9a8d4, { opacity: 0.25, side: T.DoubleSide })));
    ctx.part('uterus', new T.Mesh(ctx.geo(new T.BoxGeometry(0.3, 2.2, 1.6)), ctx.mat(0xfb7185))).position.set(2.7, -0.9, 0);
    S.egg = ctx.part('egg', new T.Mesh(ctx.geo(new T.SphereGeometry(0.28, 24, 16)), ctx.mat(0xfde68a, { clip: false })));
    S.sperm = []; for (let i = 0; i < 8; i++) { const g = new T.Group(); ctx.part('sperm', new T.Mesh(ctx.geo(new T.SphereGeometry(0.05, 10, 8)), ctx.mat(0xe2e8f0, { clip: false })), g); const tl = ctx.part('sperm', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.008, 0.008, 0.35, 4)), ctx.mat(0xe2e8f0, { clip: false })), g); tl.rotation.z = Math.PI / 2; tl.position.x = 0.2; g.userData.o = [(rnd() - 0.5) * 0.5, (rnd() - 0.5) * 0.5, rnd()]; ctx.root.add(g); S.sperm.push(g); }
    S.cells = []; for (let i = 0; i < 8; i++) S.cells.push(ctx.part('zygote', new T.Mesh(ctx.geo(new T.SphereGeometry(0.1, 12, 8)), ctx.mat(0xa78bfa, { clip: false }))));
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.15, -0.2, 0); ctx.clip.constant = 50;
    const meet = S.path.getPoint(0.35);
    if (ch === 'overview') {
      S.egg.visible = true; S.egg.position.copy(S.path.getPoint(0.1 + 0.25 * ease(t / 8)));
      S.sperm.forEach((g, i) => { const [y, z, ph] = g.userData.o; const u = ease((t - ph * 3) / 10); const p = S.path.getPoint(0.95 - u * 0.6); g.visible = true; g.position.set(p.x + 0.3 * (i === 0 ? 0 : 1) * u, p.y + y * (1 - (i === 0 ? u : 0)), p.z + z); g.rotation.z = Math.sin(t * 12 + i) * 0.2; });
      S.cells.forEach((c) => { c.visible = false; });
    } else {
      S.egg.visible = false; S.sperm.forEach((g) => { g.visible = false; });
      const u = ease(t / 18); const p = S.path.getPoint(0.35 + u * 0.65); const n = Math.min(8, 2 ** Math.floor(1 + u * 3));
      S.cells.forEach((c, i) => { c.visible = i < n; const a = i * 2.4; const r = n > 1 ? 0.12 : 0; c.position.set(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r, Math.sin(a * 0.7) * r); });
      if (u > 0.95) S.cells.forEach((c, i) => { c.position.x = 2.4 + (i % 2) * 0.05; });
    }
    void meet;
  }
};

const cycle = {
  cameraDistance: 7,
  build(ctx) {
    const T = ctx.THREE; const S = {};
    S.ring = ctx.part('day', new T.Mesh(ctx.geo(new T.TorusGeometry(2.2, 0.05, 8, 112)), ctx.mat(0x64748b)));
    S.marker = ctx.part('day', new T.Mesh(ctx.geo(new T.SphereGeometry(0.14, 12, 8)), ctx.mat(0x22d3ee, { clip: false })));
    S.lining = ctx.part('endometrium', new T.Mesh(ctx.geo(new T.BoxGeometry(1.6, 1, 1)), ctx.mat(0xfb7185))); S.lining.position.set(0, -0.6, 0);
    S.foll = ctx.part('follicle', new T.Mesh(ctx.geo(new T.SphereGeometry(0.3, 16, 12)), ctx.mat(0xfde68a, { opacity: 0.8 }))); S.foll.position.set(0, 0.9, 0);
    S.bars = [0xf472b6, 0x22c55e, 0xa855f7].map((c, i) => { const b = ctx.part('hormone-bars', new T.Mesh(ctx.geo(new T.BoxGeometry(0.25, 1, 0.25)), ctx.mat(c, { clip: false }))); b.position.set(-0.5 + i * 0.5, 0, 1.2); return b; });
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.45, -0.3, 0); ctx.clip.constant = 50;
    const dur = ch === 'overview' ? 18 : 28; const day = 1 + (t % dur) / dur * 27.99;
    const a = Math.PI / 2 - ((day - 1) / 28) * Math.PI * 2; S.marker.position.set(Math.cos(a) * 2.2, Math.sin(a) * 2.2, 0);
    // Lining: shed days 1–5, then thickens to about day 21, maintained to day 28.
    const th = day <= 5 ? 0.5 - (day - 1) * 0.08 : Math.min(1, 0.18 + (day - 5) / 16 * 0.82);
    S.lining.scale.set(1, Math.max(0.12, th) * 0.8, 1); S.lining.position.y = -0.9 + S.lining.scale.y / 2;
    S.foll.scale.setScalar(day < 14 ? 0.4 + (day / 14) * 0.6 : day < 15 ? 0.5 : 0.7); S.foll.material.color.setHex(day < 14 ? 0xfde68a : 0xf59e0b);
    const show = ch === 'hormones'; S.bars.forEach((b) => { b.visible = show; });
    if (show) {
      // Relative teaching curves: oestrogen peaks ~day 12–13 (≈1 day before LH), LH surge ~day 13–14, progesterone high in luteal phase.
      const g = (x, m, s) => Math.exp(-(((x - m) / s) ** 2));
      const e2 = 0.15 + 0.85 * g(day, 12.5, 2.2) + 0.35 * g(day, 21, 3);
      const lh = 0.1 + 0.9 * g(day, 13.8, 0.8);
      const p4 = 0.05 + 0.9 * g(day, 21.5, 3.2);
      [e2, lh, p4].forEach((v, i) => { S.bars[i].scale.y = Math.max(0.05, v) * 1.8; S.bars[i].position.y = S.bars[i].scale.y / 2 - 0.9; });
    }
  }
};

const health = {
  cameraDistance: 7,
  build(ctx) {
    const T = ctx.THREE; const S = {};
    S.tokens = {};
    S.tokens.barrier = ctx.part('barrier', new T.Mesh(ctx.geo(new T.SphereGeometry(0.9, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2)), ctx.mat(0x38bdf8, { opacity: 0.55, side: T.DoubleSide })));
    S.tokens.barrier.position.set(-2.1, -0.3, 0);
    const pill = ctx.part('hormonal', new T.Mesh(ctx.geo(new T.CapsuleGeometry(0.22, 0.5, 6, 12)), ctx.mat(0xa855f7))); pill.rotation.z = Math.PI / 4; pill.position.set(-0.7, 0, 0); S.tokens.hormonal = pill;
    const tg = new T.Group(); tg.position.set(0.7, 0, 0); ctx.root.add(tg);
    ctx.part('iud', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.05, 0.05, 1.1, 8)), ctx.mat(0xf59e0b)), tg);
    const arm = ctx.part('iud', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.05, 0.05, 0.8, 8)), ctx.mat(0xf59e0b)), tg); arm.rotation.z = Math.PI / 2; arm.position.y = 0.55;
    S.tokens.iud = tg;
    S.path = ctx.part('pathogen', new T.InstancedMesh(ctx.geo(new T.IcosahedronGeometry(0.07, 0)), ctx.mat(0xef4444, { clip: false }), 14));
    S.m4 = new T.Matrix4(); return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.2, ch === 'overview' ? Math.sin(t * 0.3) * 0.4 : 0, 0); ctx.clip.constant = 50;
    const pr = ch === 'protect'; S.path.visible = pr;
    ['hormonal', 'iud'].forEach((k) => { const m = S.tokens[k]; m.visible = !pr; });
    for (let i = 0; i < 14; i++) { const u = loop(t / 3 + i / 14, 1); const x = -2.1 + Math.sin(i * 1.7) * 0.6; const y = 2.0 - u * 2.6; const stop = Math.max(y, 0.6 + Math.cos(i) * 0.05); S.path.setMatrixAt(i, S.m4.makeTranslation(x, stop, Math.cos(i * 2.3) * 0.5)); }
    S.path.instanceMatrix.needsUpdate = true;
  }
};

export const reproductionBuilders = { asexual, flower, fertilisation: human, 'menstrual-cycle': cycle, 'reproductive-health': health };
