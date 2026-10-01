// Procedural 3D builders for the Evolution bay (state = f(chapter, t)).
import { ease, seeded } from '../three/ProceduralScene.js';

const selection = {
  cameraDistance: 7,
  build(ctx) {
    const T = ctx.THREE; const S = {}; const rnd = seeded(7);
    S.bark = ctx.part('bark', new T.Mesh(ctx.geo(new T.CylinderGeometry(1.1, 1.3, 5, 32)), ctx.mat(0xd6d3d1)));
    S.moths = [];
    const wing = ctx.geo(new T.CircleGeometry(0.16, 3));
    for (let i = 0; i < 24; i++) {
      const dark = i % 3 === 0; const g = new T.Group(); ctx.root.add(g);
      for (const s of [-1, 1]) { const w = ctx.part(dark ? 'dark' : 'pale', new T.Mesh(wing, ctx.mat(dark ? 0x334155 : 0xf1f5f9, { side: T.DoubleSide, clip: false })), g); w.rotation.z = s > 0 ? 0 : Math.PI; w.position.x = s * 0.1; }
      const a = rnd() * Math.PI * 2; const y = -2 + rnd() * 4;
      g.position.set(Math.sin(a) * 1.22, y, Math.cos(a) * 1.22); g.lookAt(Math.sin(a) * 3, y, Math.cos(a) * 3);
      S.moths.push({ g, dark, k: rnd() });
    }
    const bird = new T.Group(); ctx.root.add(bird);
    ctx.part('bird', new T.Mesh(ctx.geo(new T.ConeGeometry(0.18, 0.7, 12)), ctx.mat(0xf97316, { clip: false })), bird).rotation.z = -Math.PI / 2;
    const wg = ctx.geo(new T.BoxGeometry(0.1, 0.02, 0.9)); S.bw = [ctx.part('bird', new T.Mesh(wg, ctx.mat(0xea580c, { clip: false })), bird), ctx.part('bird', new T.Mesh(wg, ctx.mat(0xea580c, { clip: false })), bird)];
    S.bird = bird;
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.05, t * 0.15, 0); ctx.clip.constant = 50;
    const soot = ch === 'soot'; const sootU = soot ? ease(t / 4) : 0;
    S.bark.material.color.setRGB(0.84 - 0.6 * sootU, 0.83 - 0.6 * sootU, 0.82 - 0.6 * sootU);
    // the conspicuous morph is eaten progressively; survivors stay
    const eaten = ease((t - 4) / 14);
    S.moths.forEach((m) => { const visible = soot ? !m.dark : m.dark; m.g.visible = !(visible && m.k < eaten); });
    const a = t * 1.1; S.bird.position.set(Math.sin(a) * 2.4, Math.sin(t * 0.7) * 1.2, Math.cos(a) * 2.4); S.bird.rotation.y = a + Math.PI / 2;
    S.bw.forEach((w, i) => { w.rotation.x = (i ? 1 : -1) * Math.sin(t * 10) * 0.5; });
  }
};

const evidence = {
  cameraDistance: 7.5,
  build(ctx) {
    const T = ctx.THREE; const S = { limbs: [] };
    // [humerus, radius, digits] lengths for human, whale, bat
    const specs = [[1.3, 1.1, 0.7], [0.6, 0.4, 0.9], [0.9, 1.2, 2.0]];
    specs.forEach((L, k) => {
      const g = new T.Group(); g.position.x = (k - 1) * 2.3; g.position.y = 1.2; ctx.root.add(g);
      const bone = (part, len, r, col) => { const m = ctx.part(part, new T.Mesh(ctx.geo(new T.CylinderGeometry(r, r, len, 10)), ctx.mat(col)), g); return m; };
      const h = bone('humerus', L[0], 0.09, 0xf59e0b); h.position.y = -L[0] / 2;
      const r1 = bone('radius', L[1], 0.05, 0x22c55e); r1.position.set(-0.06, -L[0] - L[1] / 2, 0);
      const r2 = bone('radius', L[1], 0.05, 0x16a34a); r2.position.set(0.06, -L[0] - L[1] / 2, 0);
      const digits = []; for (let d = 0; d < 5; d++) { const dl = L[2] * (k === 2 ? 1 : (0.7 + 0.06 * d)); const m = bone('digits', dl, 0.03, 0x38bdf8); m.position.set((d - 2) * 0.11 * (k === 2 ? 2.2 : 1), -L[0] - L[1] - dl / 2, 0); m.rotation.z = (d - 2) * (k === 2 ? 0.28 : 0.08); digits.push(m); }
      let mem = null;
      if (k === 2) { const sh = new T.Shape(); sh.moveTo(-0.9, 0); sh.lineTo(0.9, 0); sh.lineTo(0.6, -2.0); sh.lineTo(-0.6, -2.0); mem = ctx.part('membrane', new T.Mesh(ctx.geo(new T.ShapeGeometry(sh)), ctx.mat(0xa78bfa, { opacity: 0.35, side: T.DoubleSide })), g); mem.position.y = -L[0] - L[1]; mem.position.z = -0.05; }
      if (k === 1) { const fl = ctx.part('digits', new T.Mesh(ctx.geo(new T.SphereGeometry(0.45, 16, 10)), ctx.mat(0x64748b, { opacity: 0.3 })), g); fl.scale.set(0.8, 1.4, 0.2); fl.position.y = -L[0] - L[1] - 0.45; }
      S.limbs.push({ g, h, r: [r1, r2], digits, mem });
    });
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0, Math.sin(t * 0.3) * 0.4, 0); ctx.clip.constant = 50;
    const step = ch === 'overview' ? Math.floor(t / 5) % 4 : 3;
    S.limbs.forEach((l) => {
      l.h.scale.x = l.h.scale.z = step === 0 ? 1.6 : 1;
      l.r.forEach((m) => { m.scale.x = m.scale.z = step === 1 ? 1.6 : 1; });
      l.digits.forEach((m) => { m.scale.x = m.scale.z = step === 2 ? 1.8 : 1; });
    });
    if (ch === 'compare') S.limbs.forEach((l, i) => { l.g.rotation.z = Math.sin(t * (1 + i * 0.5)) * 0.25; });
    else S.limbs.forEach((l) => { l.g.rotation.z = 0; });
  }
};

const human = {
  cameraDistance: 8,
  build(ctx) {
    const T = ctx.THREE; const S = { branches: [] };
    const seg = (part, from, to, col, r = 0.07) => {
      const a = new T.Vector3(...from); const b = new T.Vector3(...to); const len = a.distanceTo(b);
      const m = ctx.part(part, new T.Mesh(ctx.geo(new T.CylinderGeometry(r, r, len, 8)), ctx.mat(col)));
      m.position.copy(a).lerp(b, 0.5); m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), b.clone().sub(a).normalize());
      const tip = ctx.part(part, new T.Mesh(ctx.geo(new T.SphereGeometry(r * 2.2, 12, 8)), ctx.mat(col))); tip.position.copy(b);
      return { m, tip };
    };
    // [part, from, to, colour, growStart(0..1), extinct]
    const defs = [
      ['root', [0, -3, 0], [0, -1.6, 0], 0xa8a29e, 0, false],
      ['chimp', [0, -1.6, 0], [-2.2, 2.6, 0], 0xf97316, 0.15, false],
      ['hominin', [0, -1.6, 0], [0.6, -0.2, 0], 0xfacc15, 0.15, false],
      ['hominin', [0.6, -0.2, 0], [2.4, 1.0, 0.4], 0xfacc15, 0.35, true],
      ['hominin', [0.6, -0.2, 0], [0.9, 1.0, 0], 0xfacc15, 0.35, false],
      ['hominin', [0.9, 1.0, 0], [2.0, 2.2, -0.4], 0xfde047, 0.55, true],
      ['sapiens', [0.9, 1.0, 0], [0.8, 2.8, 0], 0x22c55e, 0.7, false]
    ];
    defs.forEach(([p, f, to, c, s, ex]) => S.branches.push({ ...seg(p, f, to, c), s, ex }));
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0, Math.sin(t * 0.25) * 0.35, 0); ctx.clip.constant = 50;
    const grow = ch === 'overview' ? ease(t / 18) : 1; const prune = ch === 'prune' ? ease((t - 3) / 8) : 0;
    S.branches.forEach((b) => {
      const u = Math.max(0, Math.min(1, (grow - b.s) / 0.2));
      b.m.visible = u > 0.01; b.tip.visible = u > 0.95;
      const fade = b.ex ? 1 - prune * 0.85 : 1; b.m.material.opacity = fade; b.m.material.transparent = fade < 1; b.tip.material.opacity = fade; b.tip.material.transparent = fade < 1;
    });
  }
};

const origin = {
  cameraDistance: 7,
  build(ctx) {
    const T = ctx.THREE; const S = {};
    S.flask = ctx.part('flask', new T.Mesh(ctx.geo(new T.SphereGeometry(0.7, 24, 16)), ctx.mat(0x38bdf8, { opacity: 0.4 }))); S.flask.position.set(-1.6, -1.4, 0);
    S.chamber = ctx.part('chamber', new T.Mesh(ctx.geo(new T.SphereGeometry(1.1, 24, 16)), ctx.mat(0xa78bfa, { opacity: 0.25 }))); S.chamber.position.set(1.2, 1.2, 0);
    const pipe = (a, b) => { const A = new T.Vector3(...a); const B = new T.Vector3(...b); const m = ctx.part('trap', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.06, 0.06, A.distanceTo(B), 8)), ctx.mat(0x94a3b8, { opacity: 0.5 }))); m.position.copy(A).lerp(B, 0.5); m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), B.clone().sub(A).normalize()); };
    S.path = [[-1.6, -0.7, 0], [-1.6, 1.2, 0], [0.1, 1.2, 0], [1.2, 0.1, 0], [1.2, -1.4, 0], [-0.9, -1.4, 0]];
    for (let i = 0; i < S.path.length - 1; i++) pipe(S.path[i], S.path[i + 1]);
    S.trap = ctx.part('trap', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.25, 0.2, 0.6, 16)), ctx.mat(0x22c55e, { opacity: 0.5 }))); S.trap.position.set(1.2, -1.0, 0);
    S.e = [0, 1].map((k) => { const m = ctx.part('spark', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.04, 0.04, 0.6, 8)), ctx.mat(0x64748b)), S.chamber); m.position.set(k ? 0.35 : -0.35, 0, 0); m.rotation.z = Math.PI / 2; return m; });
    S.bolt = ctx.part('spark', new T.Mesh(ctx.geo(new T.SphereGeometry(0.12, 10, 8)), ctx.mat(0xfacc15, { clip: false })), S.chamber);
    S.gas = []; for (let i = 0; i < 18; i++) S.gas.push(ctx.part('chamber', new T.Mesh(ctx.geo(new T.SphereGeometry(0.06, 8, 6)), ctx.mat(0xe2e8f0, { clip: false }))));
    S.aa = []; for (let i = 0; i < 6; i++) { const m = ctx.part('trap', new T.Mesh(ctx.geo(new T.IcosahedronGeometry(0.07, 0)), ctx.mat(0xf59e0b, { clip: false }))); S.aa.push(m); }
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.1, Math.sin(t * 0.2) * 0.3, 0); ctx.clip.constant = 50;
    S.bolt.visible = Math.sin(t * 17) > 0.3; S.bolt.scale.setScalar(0.8 + Math.random() * 0.6);
    const P = S.path; const n = P.length - 1;
    S.gas.forEach((g, i) => { const u = ((t * 0.12 + i / S.gas.length) % 1) * n; const k = Math.floor(u); const f = u - k; const a = P[k]; const b = P[k + 1]; g.position.set(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2]); });
    const fill = ch === 'products' ? 1 : ease((t - 6) / 12);
    S.aa.forEach((m, i) => { m.visible = i / S.aa.length < fill; m.position.set(1.2 + ((i % 3) - 1) * 0.1, -1.2 + Math.floor(i / 3) * 0.14, 0.05); });
    S.trap.scale.setScalar(ch === 'products' ? 1.3 + 0.08 * Math.sin(t * 3) : 1);
  }
};

export const evolutionBuilders = { selection, evidence, 'human-evolution': human, 'origin-of-life': origin };
