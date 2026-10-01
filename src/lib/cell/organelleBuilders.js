// Procedural builders for Cell bay organelles. Each: build(ctx) → state, apply(ctx, chapter, t, state).
// All motion is a pure function of t, so scrubbing and reduced-motion stills work.
import { ease, seeded } from '../three/ProceduralScene.js';
import { mitochondrionBuilder } from './MitochondrionScene.js';

const loop = (t, period) => (t % period) / period;

// ---------- Nucleus ----------
const nucleus = {
  cameraDistance: 6,
  build(ctx) {
    const T = ctx.THREE; const S = {}; const rnd = seeded(3); const m4 = new T.Matrix4();
    S.outerMat = ctx.mat(0x60a5fa, { side: T.DoubleSide, opacity: 1 });
    ctx.part('envelope', new T.Mesh(ctx.geo(new T.SphereGeometry(1.5, 48, 32)), S.outerMat));
    ctx.part('envelope', new T.Mesh(ctx.geo(new T.SphereGeometry(1.42, 48, 32)), ctx.mat(0x3b82f6, { side: T.DoubleSide })));
    ctx.part('nucleoplasm', new T.Mesh(ctx.geo(new T.SphereGeometry(1.38, 32, 24)), ctx.mat(0x38bdf8, { opacity: 0.18, side: T.BackSide })));
    // Pores: instanced tori on the surface, oriented along the normal.
    const poreN = 70; const pores = new T.InstancedMesh(ctx.geo(new T.TorusGeometry(0.07, 0.025, 6, 16)), ctx.mat(0xf472b6), poreN);
    const up = new T.Vector3(0, 0, 1); const q = new T.Quaternion(); const v = new T.Vector3();
    S.porePos = [];
    for (let i = 0; i < poreN; i++) {
      const y = 1 - (2 * (i + 0.5)) / poreN; const r = Math.sqrt(1 - y * y); const a = i * 2.39996;
      v.set(Math.cos(a) * r, y, Math.sin(a) * r); q.setFromUnitVectors(up, v);
      m4.compose(v.clone().multiplyScalar(1.5), q, new T.Vector3(1, 1, 1)); pores.setMatrixAt(i, m4); S.porePos.push(v.clone());
    }
    ctx.part('pores', pores);
    // Chromatin: random tubes.
    const chromMat = ctx.mat(0xa78bfa);
    for (let k = 0; k < 7; k++) {
      const pts = []; let p = new T.Vector3((rnd() - 0.5) * 1.4, (rnd() - 0.5) * 1.4, (rnd() - 0.5) * 1.4);
      for (let j = 0; j < 9; j++) { pts.push(p.clone()); p.add(new T.Vector3((rnd() - 0.5) * 0.6, (rnd() - 0.5) * 0.6, (rnd() - 0.5) * 0.6)); if (p.length() > 1.15) p.multiplyScalar(0.8); }
      ctx.part('chromatin', new T.Mesh(ctx.geo(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 60, 0.035, 6)), chromMat));
    }
    const nl = ctx.part('nucleolus', new T.Mesh(ctx.geo(new T.IcosahedronGeometry(0.45, 3)), ctx.mat(0xfb923c, { roughness: 0.9 })));
    nl.position.set(0.3, 0.15, -0.1);
    // mRNA particles for the export chapter.
    S.rna = ctx.part('pores', new T.InstancedMesh(ctx.geo(new T.CapsuleGeometry(0.03, 0.14, 4, 8)), ctx.mat(0x34d399, { clip: false }), 14));
    S.rnaSeeds = Array.from({ length: 14 }, (_, i) => ({ pore: S.porePos[(i * 13) % poreN], phase: i / 14 }));
    S.m4 = m4;
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.2, t * 0.12, 0);
    S.outerMat.opacity = 1;
    ctx.clip.constant = ch === 'overview' ? 50 : ch === 'export' ? 0 : 4 - 4 * ease(t / 5);
    S.rna.visible = ch === 'export';
    if (ch === 'export') {
      S.rnaSeeds.forEach((s, i) => {
        const u = loop(t / 8 + s.phase, 1); const r = 0.6 + u * 1.6;
        S.m4.makeTranslation(s.pore.x * r, s.pore.y * r, s.pore.z * r); if (u < 0.02) S.m4.makeScale(0, 0, 0);
        S.rna.setMatrixAt(i, S.m4);
      });
      S.rna.instanceMatrix.needsUpdate = true;
    }
  }
};

// ---------- ER + ribosomes ----------
const er = {
  cameraDistance: 6.2,
  build(ctx) {
    const T = ctx.THREE; const S = {}; const rnd = seeded(5); const m4 = new T.Matrix4();
    const sheetMat = ctx.mat(0x60a5fa, { side: T.DoubleSide });
    const riboPos = [];
    for (let i = 0; i < 4; i++) {
      const g = ctx.geo(new T.BoxGeometry(2.6, 0.12, 1.5, 24, 1, 1));
      const pos = g.attributes.position; for (let k = 0; k < pos.count; k++) pos.setY(k, pos.getY(k) + Math.sin(pos.getX(k) * 1.6 + i) * 0.12);
      g.computeVertexNormals();
      const sheet = ctx.part('rer', new T.Mesh(g, sheetMat)); sheet.position.set(-0.8, -0.9 + i * 0.45, 0);
      for (let k = 0; k < 40; k++) { const x = (rnd() - 0.5) * 2.5; riboPos.push([-0.8 + x, -0.9 + i * 0.45 + Math.sin(x * 1.6 + i) * 0.12 + 0.09, (rnd() - 0.5) * 1.4]); }
      ctx.part('lumen', new T.Mesh(ctx.geo(new T.BoxGeometry(2.5, 0.06, 1.4)), ctx.mat(0xfacc15, { opacity: 0.5 }))).position.set(-0.8, -0.9 + i * 0.45, 0);
    }
    const ribo = new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.04, 8, 6)), ctx.mat(0xf472b6), riboPos.length);
    riboPos.forEach((p, i) => ribo.setMatrixAt(i, m4.makeTranslation(...p))); ctx.part('ribosome', ribo);
    // Free ribosomes.
    const free = new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.04, 8, 6)), ctx.mat(0xf472b6), 20);
    for (let i = 0; i < 20; i++) free.setMatrixAt(i, m4.makeTranslation((rnd() - 0.5) * 4, 1.2 + rnd() * 0.5, (rnd() - 0.5) * 2)); ctx.part('ribosome', free);
    // Smooth ER: tube network.
    const serMat = ctx.mat(0x34d399);
    for (let k = 0; k < 6; k++) {
      const pts = []; let p = new T.Vector3(1.3, (rnd() - 0.5) * 1.6, (rnd() - 0.5) * 1.2);
      for (let j = 0; j < 6; j++) { pts.push(p.clone()); p.add(new T.Vector3(rnd() * 0.35, (rnd() - 0.5) * 0.5, (rnd() - 0.5) * 0.5)); }
      ctx.part('ser', new T.Mesh(ctx.geo(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 40, 0.08, 8)), serMat));
    }
    // Translation chapter: a big ribosome on the top sheet, growing chain, vesicle.
    S.bigRibo = new T.Group(); ctx.root.add(S.bigRibo); S.bigRibo.position.set(-0.8, 0.55, 0.3);
    ctx.part('ribosome', new T.Mesh(ctx.geo(new T.SphereGeometry(0.16, 16, 12)), ctx.mat(0xec4899, { clip: false })), S.bigRibo).position.y = 0.12;
    ctx.part('ribosome', new T.Mesh(ctx.geo(new T.SphereGeometry(0.11, 16, 12)), ctx.mat(0xf9a8d4, { clip: false })), S.bigRibo).position.y = 0.32;
    S.chain = ctx.part('lumen', new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.035, 8, 6)), ctx.mat(0xfb923c, { clip: false }), 30));
    S.vesicle = ctx.part('vesicle', new T.Mesh(ctx.geo(new T.SphereGeometry(0.2, 20, 14)), ctx.mat(0xfb923c, { opacity: 0.45, clip: false })));
    S.m4 = m4;
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.45, -0.5 + t * 0.04, 0); ctx.clip.constant = 50;
    const tr = ch === 'translate';
    S.bigRibo.visible = tr; S.chain.visible = tr; S.vesicle.visible = tr && t > 16;
    if (tr) {
      const n = Math.min(30, Math.floor(t / 0.5));
      for (let i = 0; i < 30; i++) {
        if (i >= n || t > 16) S.m4.makeScale(0, 0, 0);
        else S.m4.makeTranslation(-0.8 + Math.sin(i * 0.7) * 0.18, 0.5 - i * 0.012, 0.3 + Math.cos(i * 0.7) * 0.18 - i * 0.01);
        S.chain.setMatrixAt(i, S.m4);
      }
      S.chain.instanceMatrix.needsUpdate = true;
      const u = ease((t - 16) / 9); S.vesicle.position.set(-0.8 + u * 2.6, 0.45 + u * 0.9, 0.3);
    }
  }
};

// ---------- Golgi ----------
const golgi = {
  cameraDistance: 6,
  build(ctx) {
    const T = ctx.THREE; const S = {}; const rnd = seeded(9); const m4 = new T.Matrix4();
    const colors = [0x60a5fa, 0x93c5fd, 0xfbbf24, 0xf9a8d4, 0xf472b6];
    const ids = ['cis', 'cisternae', 'cisternae', 'cisternae', 'trans'];
    for (let i = 0; i < 5; i++) {
      const g = ctx.geo(new T.CylinderGeometry(1.25 - Math.abs(i - 2) * 0.08, 1.25 - Math.abs(i - 2) * 0.08, 0.1, 40, 1));
      const pos = g.attributes.position; for (let k = 0; k < pos.count; k++) { const x = pos.getX(k); const z = pos.getZ(k); pos.setY(k, pos.getY(k) + (x * x + z * z) * 0.18); }
      g.computeVertexNormals();
      ctx.part(ids[i], new T.Mesh(g, ctx.mat(colors[i]))).position.y = -0.7 + i * 0.32;
    }
    const ves = new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.09, 12, 8)), ctx.mat(0xfb923c), 18);
    for (let i = 0; i < 18; i++) { const a = rnd() * Math.PI * 2; ves.setMatrixAt(i, m4.makeTranslation(Math.cos(a) * 1.5, -0.8 + rnd() * 1.6, Math.sin(a) * 1.5)); }
    ctx.part('vesicle', ves);
    S.moving = ctx.part('vesicle', new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.11, 12, 8)), ctx.mat(0xfde047), 6));
    S.membrane = ctx.part('trans', new T.Mesh(ctx.geo(new T.BoxGeometry(3.6, 0.08, 2.4)), ctx.mat(0x94a3b8, { opacity: 0.35 })));
    S.membrane.position.y = 1.9; S.m4 = m4;
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.35, t * 0.08, 0); ctx.clip.constant = 50;
    const tr = ch === 'traffic'; S.moving.visible = tr; S.membrane.visible = tr;
    if (tr) {
      for (let i = 0; i < 6; i++) {
        const u = loop(t / 12 + i / 6, 1);
        // Arrive from below (ER side) → climb through the stack → bud off the top → reach membrane.
        const y = -1.6 + u * 3.4; const x = 1.0 * Math.sin(i * 1.3) * (u < 0.25 || u > 0.75 ? 1 : 0.4);
        S.m4.makeTranslation(x, y, Math.cos(i * 1.3) * 0.5); S.moving.setMatrixAt(i, S.m4);
      }
      S.moving.instanceMatrix.needsUpdate = true;
    }
  }
};

// ---------- Lysosome ----------
const lysosome = {
  cameraDistance: 5,
  build(ctx) {
    const T = ctx.THREE; const S = {}; const rnd = seeded(13); const m4 = new T.Matrix4();
    S.lyso = new T.Group(); ctx.root.add(S.lyso);
    S.memMat = ctx.mat(0xf472b6, { opacity: 0.4, side: T.DoubleSide });
    S.shell = ctx.part('membrane', new T.Mesh(ctx.geo(new T.SphereGeometry(0.8, 32, 24)), S.memMat), S.lyso);
    const enz = new T.InstancedMesh(ctx.geo(new T.TetrahedronGeometry(0.07)), ctx.mat(0xfacc15), 40);
    for (let i = 0; i < 40; i++) { const v = new T.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize().multiplyScalar(rnd() * 0.65); enz.setMatrixAt(i, m4.makeTranslation(v.x, v.y, v.z)); }
    ctx.part('enzymes', enz, S.lyso);
    // Target: small worn-out mitochondrion inside an autophagosome membrane.
    S.target = new T.Group(); ctx.root.add(S.target);
    const cg = ctx.geo(new T.CapsuleGeometry(0.28, 0.5, 8, 20)); cg.rotateZ(Math.PI / 2);
    S.targetMat = ctx.mat(0xfb923c, { opacity: 1 });
    S.mito = ctx.part('target', new T.Mesh(cg, S.targetMat), S.target);
    S.wrapMat = ctx.mat(0xcbd5e1, { opacity: 0.3, side: T.DoubleSide });
    S.wrap = ctx.part('target', new T.Mesh(ctx.geo(new T.SphereGeometry(0.62, 24, 16)), S.wrapMat), S.target);
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.clip.constant = 50; ctx.root.rotation.set(0.2, t * 0.1, 0);
    const dig = ch === 'digest'; S.target.visible = dig;
    S.lyso.position.set(dig ? -1.6 + 1.6 * ease((t - 4) / 6) : 0, 0, 0);
    if (dig) {
      S.target.position.set(1.2 - 1.2 * ease((t - 4) / 6), 0, 0);
      S.wrapMat.opacity = 0.3 * ease(t / 3);
      const d = ease((t - 11) / 10); // digestion progress after fusion
      S.mito.scale.setScalar(Math.max(0.001, 1 - d)); S.targetMat.opacity = 1 - d * 0.7;
      S.memMat.opacity = 0.4 + 0.2 * Math.sin(t * 2) * (t > 10 ? 1 : 0);
    } else { S.mito.scale.setScalar(1); }
  }
};

// ---------- Plasma membrane ----------
const membrane = {
  cameraDistance: 6,
  build(ctx) {
    const T = ctx.THREE; const S = {}; const m4 = new T.Matrix4(); const rnd = seeded(17);
    const nx = 20; const nz = 10; const sp = 0.2;
    const heads = new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.085, 10, 8)), ctx.mat(0x60a5fa), nx * nz * 2);
    const tails = new T.InstancedMesh(ctx.geo(new T.CylinderGeometry(0.025, 0.025, 0.32, 6)), ctx.mat(0xfacc15), nx * nz * 4);
    let h = 0; let tl = 0;
    for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) {
      const x = (i - nx / 2) * sp; const z = (k - nz / 2) * sp;
      if (Math.hypot(x - 0.6, z) < 0.35 || Math.hypot(x + 1.0, z - 0.2) < 0.3) continue; // room for proteins
      for (const side of [1, -1]) {
        heads.setMatrixAt(h++, m4.makeTranslation(x, side * 0.42, z));
        tails.setMatrixAt(tl++, m4.makeTranslation(x - 0.03, side * 0.2, z));
        tails.setMatrixAt(tl++, m4.makeTranslation(x + 0.03, side * 0.2, z));
      }
    }
    heads.count = h; tails.count = tl;
    ctx.part('heads', heads); ctx.part('tails', tails);
    ctx.part('protein', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.28, 0.28, 1.2, 20)), ctx.mat(0xf472b6))).position.set(0.6, 0, 0);
    ctx.part('protein', new T.Mesh(ctx.geo(new T.SphereGeometry(0.22, 16, 12)), ctx.mat(0xe879f9))).position.set(-1.6, 0.55, -0.6);
    S.pump = ctx.part('pump', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.24, 0.3, 1.1, 20)), ctx.mat(0xfb923c))); S.pump.position.set(-1.0, 0, 0.2);
    S.gas = ctx.part('gas', new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.06, 8, 6)), ctx.mat(0x34d399, { clip: false }), 16));
    S.gasSeeds = Array.from({ length: 16 }, (_, i) => ({ x: (rnd() - 0.5) * 3.4, z: (rnd() - 0.5) * 1.6, phase: rnd(), dir: i % 4 === 0 ? -1 : 1 }));
    S.na = ctx.part('pump', new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.07, 8, 6)), ctx.mat(0xa78bfa, { clip: false }), 3));
    S.k = ctx.part('pump', new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.09, 8, 6)), ctx.mat(0x22d3ee, { clip: false }), 2));
    S.m4 = m4;
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.clip.constant = 50; ctx.root.rotation.set(0.3, -0.4 + t * 0.03, 0);
    S.gas.visible = ch === 'diffusion'; S.na.visible = ch === 'pump'; S.k.visible = ch === 'pump';
    if (ch === 'diffusion') {
      // O2 (dir 1) moves outside→inside (top→bottom); CO2 (dir −1) inside→outside.
      S.gasSeeds.forEach((s, i) => { const u = loop(t / 6 + s.phase, 1); const y = s.dir * (1.3 - u * 2.6); S.gas.setMatrixAt(i, S.m4.makeTranslation(s.x, y, s.z)); });
      S.gas.instanceMatrix.needsUpdate = true;
    }
    if (ch === 'pump') {
      const u = loop(t, 6) ; // one pump cycle per 6 s (slowed for viewing)
      for (let i = 0; i < 3; i++) { const y = -0.9 + ease(u / 0.5) * 1.8; S.na.setMatrixAt(i, S.m4.makeTranslation(-1.0 + (i - 1) * 0.14, u < 0.5 ? y : 0.9 + (u - 0.5) * 0.6, 0.2)); }
      for (let i = 0; i < 2; i++) { const y = 0.9 - ease((u - 0.5) / 0.5) * 1.8; S.k.setMatrixAt(i, S.m4.makeTranslation(-1.0 + (i - 0.5) * 0.2, u >= 0.5 ? y : 0.9 + (0.5 - u) * 0.6, 0.2)); }
      S.na.instanceMatrix.needsUpdate = true; S.k.instanceMatrix.needsUpdate = true;
      S.pump.rotation.y = u < 0.5 ? 0 : Math.PI / 6;
    }
  }
};

// ---------- Chloroplast ----------
const chloroplast = {
  cameraDistance: 6,
  build(ctx) {
    const T = ctx.THREE; const S = {}; const m4 = new T.Matrix4();
    const outer = ctx.geo(new T.SphereGeometry(1, 48, 32)); outer.scale(2.0, 0.9, 1.1);
    S.outerMat = ctx.mat(0x86efac, { side: T.DoubleSide, opacity: 1 });
    ctx.part('envelope', new T.Mesh(outer, S.outerMat));
    const inner = ctx.geo(new T.SphereGeometry(1, 48, 32)); inner.scale(1.92, 0.84, 1.04);
    ctx.part('envelope', new T.Mesh(inner, ctx.mat(0x4ade80, { side: T.DoubleSide })));
    const stroma = ctx.geo(new T.SphereGeometry(1, 32, 24)); stroma.scale(1.88, 0.8, 1.0);
    ctx.part('stroma', new T.Mesh(stroma, ctx.mat(0xbef264, { opacity: 0.25, side: T.BackSide })));
    const disc = ctx.geo(new T.CylinderGeometry(0.26, 0.26, 0.055, 24));
    const granaPos = [[-1.2, 0, 0.2], [-0.6, 0, -0.35], [0, 0, 0.3], [0.6, 0, -0.3], [1.2, 0, 0.15], [-0.2, 0, -0.1]];
    const thy = new T.InstancedMesh(disc, ctx.mat(0x16a34a), granaPos.length * 9);
    let n = 0; granaPos.forEach(([x, , z]) => { for (let k = 0; k < 9; k++) thy.setMatrixAt(n++, m4.makeTranslation(x, -0.3 + k * 0.075, z)); });
    ctx.part('grana', thy);
    const lamMat = ctx.mat(0x4ade80, { side: T.DoubleSide });
    for (let i = 0; i < granaPos.length - 2; i++) {
      const a = new T.Vector3(...granaPos[i]); const b = new T.Vector3(...granaPos[i + 1]);
      const len = a.distanceTo(b); const lam = ctx.part('lamellae', new T.Mesh(ctx.geo(new T.BoxGeometry(len, 0.02, 0.12)), lamMat));
      lam.position.copy(a).add(b).multiplyScalar(0.5); lam.position.y = -0.3 + (i % 3) * 0.15; lam.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x);
    }
    S.photons = ctx.part('grana', new T.InstancedMesh(ctx.geo(new T.ConeGeometry(0.05, 0.25, 6)), ctx.mat(0xfde047, { clip: false }), 8));
    S.o2 = ctx.part('grana', new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.06, 8, 6)), ctx.mat(0x38bdf8, { clip: false }), 8));
    S.co2 = ctx.part('stroma', new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.06, 8, 6)), ctx.mat(0x9ca3af, { clip: false }), 6));
    S.sugar = ctx.part('stroma', new T.InstancedMesh(ctx.geo(new T.CylinderGeometry(0.12, 0.12, 0.04, 6)), ctx.mat(0xfbbf24, { clip: false }), 4));
    S.granaPos = granaPos; S.m4 = m4;
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.35, t * 0.08, 0);
    ctx.clip.constant = ch === 'overview' ? 50 : ch === 'photo' ? 0 : 4 - 4 * ease(t / 5);
    const ph = ch === 'photo'; [S.photons, S.o2, S.co2, S.sugar].forEach((m) => { m.visible = ph; });
    if (ph) {
      const m4 = S.m4;
      for (let i = 0; i < 8; i++) { const g = S.granaPos[i % 6]; const u = loop(t / 3 + i / 8, 1); m4.makeTranslation(g[0], 2.2 - u * 2.2, g[2]); if (u > 0.95) m4.makeScale(0, 0, 0); S.photons.setMatrixAt(i, m4); }
      for (let i = 0; i < 8; i++) { const g = S.granaPos[i % 6]; const u = loop(t / 5 + i / 8, 1); S.o2.setMatrixAt(i, m4.makeTranslation(g[0] + u * 0.5, 0.1 + u * 1.8, g[2] + u * 1.3)); }
      for (let i = 0; i < 6; i++) { const u = loop(t / 6 + i / 6, 1); S.co2.setMatrixAt(i, m4.makeTranslation(-2.6 + u * 2.4, -0.55, (i - 3) * 0.25)); }
      for (let i = 0; i < 4; i++) { const age = t - 6 - i * 4.5; if (age < 0) m4.makeScale(0, 0, 0); else m4.makeTranslation(0.2 + i * 0.35, -0.6 - Math.min(age, 4) * 0.02, -0.4 + Math.min(age, 6) * 0.05); S.sugar.setMatrixAt(i, m4); }
      [S.photons, S.o2, S.co2, S.sugar].forEach((m) => { m.instanceMatrix.needsUpdate = true; });
    }
  }
};

// ---------- Plant cell wall + vacuole ----------
const wallVacuole = {
  cameraDistance: 7,
  build(ctx) {
    const T = ctx.THREE; const S = {};
    const box = (w, h, d) => ctx.geo(new T.BoxGeometry(w, h, d, 2, 2, 2));
    ctx.part('wall', new T.Mesh(box(3.2, 2.4, 2.4), ctx.mat(0xa3e635, { side: T.DoubleSide })));
    ctx.part('lamella', new T.Mesh(box(3.34, 2.54, 2.54), ctx.mat(0xfacc15, { opacity: 0.25, side: T.BackSide })));
    S.memGroup = new T.Group(); ctx.root.add(S.memGroup);
    S.memMesh = ctx.part('membrane', new T.Mesh(ctx.geo(new T.CapsuleGeometry(1.0, 0.8, 12, 32)), ctx.mat(0x60a5fa, { side: T.DoubleSide })), S.memGroup);
    S.memMesh.rotation.z = Math.PI / 2;
    S.cyto = ctx.part('cytoplasm', new T.Mesh(ctx.geo(new T.CapsuleGeometry(0.97, 0.8, 12, 32)), ctx.mat(0xbef264, { opacity: 0.35, side: T.BackSide })), S.memGroup);
    S.cyto.rotation.z = Math.PI / 2;
    S.vac = ctx.part('vacuole', new T.Mesh(ctx.geo(new T.CapsuleGeometry(0.82, 0.7, 12, 32)), ctx.mat(0x38bdf8, { opacity: 0.6 })), S.memGroup);
    S.vac.rotation.z = Math.PI / 2;
    const nuc = ctx.part('cytoplasm', new T.Mesh(ctx.geo(new T.SphereGeometry(0.2, 16, 12)), ctx.mat(0xa78bfa)), S.memGroup); nuc.position.set(0.9, 0.55, 0.3);
    const chlGeo = ctx.geo(new T.SphereGeometry(0.11, 12, 8)); chlGeo.scale(1.6, 0.7, 1);
    const chlMat = ctx.mat(0x16a34a);
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; ctx.part('cytoplasm', new T.Mesh(chlGeo, chlMat), S.memGroup).position.set(Math.cos(a) * 1.2, Math.sin(a) * 0.88, 0.55); }
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.3, -0.4 + t * 0.04, 0);
    ctx.clip.constant = ch === 'overview' ? 4 - 4 * ease((t - 4) / 5) : 0;
    let shrink = 0;
    if (ch === 'plasmolysis') shrink = t < 12 ? ease((t - 2) / 8) : 1 - ease((t - 14) / 8);
    // Membrane + cytoplasm pull away from the wall; vacuole loses water most.
    S.memGroup.scale.set(1.1 - 0.36 * shrink, 1.0 - 0.32 * shrink, 1.0 - 0.32 * shrink);
    S.vac.scale.setScalar(1 - 0.35 * shrink);
  }
};

export const organelleBuilders = {
  mitochondrion: mitochondrionBuilder, nucleus, er, golgi, lysosome, membrane, chloroplast, 'wall-vacuole': wallVacuole
};
