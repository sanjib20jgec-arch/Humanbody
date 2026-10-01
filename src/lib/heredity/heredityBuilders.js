// Procedural 3D builders for the Heredity bay (state = f(chapter, t)).
import { ease } from '../three/ProceduralScene.js';

const loop = (t, p) => (t % p) / p;
const BASE_COL = { A: 0xef4444, T: 0xfacc15, G: 0x22c55e, C: 0x3b82f6 };
const PAIR = { A: 'T', T: 'A', G: 'C', C: 'G' };
const SEQ = 'ATGCGTACGTTAGCCA';

function helix(ctx, parent, n, { r = 0.6, rise = 0.2, twist = 0.6, partStrand = 'helix', partBase = 'base' } = {}) {
  const T = ctx.THREE; const out = { a: [], b: [], rungs: [] };
  const sph = ctx.geo(new T.SphereGeometry(0.07, 8, 6)); const sA = ctx.mat(0x38bdf8, { clip: false }); const sB = ctx.mat(0x0ea5e9, { clip: false });
  for (let i = 0; i < n; i++) {
    const y = (i - n / 2) * rise; const a = i * twist; const base = SEQ[i % SEQ.length];
    const p1 = ctx.part(partStrand, new T.Mesh(sph, sA), parent); p1.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
    const p2 = ctx.part(partStrand, new T.Mesh(sph, sB), parent); p2.position.set(-Math.cos(a) * r, y, -Math.sin(a) * r);
    const h1 = ctx.part(partBase, new T.Mesh(ctx.geo(new T.CylinderGeometry(0.035, 0.035, r, 6)), ctx.mat(BASE_COL[base], { clip: false })), parent);
    const h2 = ctx.part(partBase, new T.Mesh(ctx.geo(new T.CylinderGeometry(0.035, 0.035, r, 6)), ctx.mat(BASE_COL[PAIR[base]], { clip: false })), parent);
    [h1, h2].forEach((h, k) => { h.rotation.z = Math.PI / 2; h.rotation.y = -a; const s = k ? -1 : 1; h.position.set(s * Math.cos(a) * r / 2, y, s * Math.sin(a) * r / 2); });
    out.a.push(p1); out.b.push(p2); out.rungs.push([h1, h2, a, y]);
  }
  return out;
}

const dna = {
  cameraDistance: 6,
  build(ctx) {
    const T = ctx.THREE; const S = {};
    S.chrom = new T.Group(); ctx.root.add(S.chrom);
    for (const s of [-1, 1]) { const arm = ctx.part('chromosome', new T.Mesh(ctx.geo(new T.CapsuleGeometry(0.28, 2.2, 8, 16)), ctx.mat(0xa78bfa)), S.chrom); arm.position.x = s * 0.22; arm.rotation.z = s * 0.12; }
    S.dna = new T.Group(); ctx.root.add(S.dna);
    S.h = helix(ctx, S.dna, 22);
    S.gene = ctx.part('gene', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.85, 0.85, 1.2, 24, 1, true)), ctx.mat(0x22c55e, { opacity: 0.25, side: T.DoubleSide, clip: false })), S.dna);
    S.gene.position.y = 0.6;
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.1, t * 0.25, 0); ctx.clip.constant = 50;
    const z = ch === 'overview' ? ease((t - 2) / 6) : 1;
    S.chrom.scale.setScalar(1 - z * 0.9); S.chrom.visible = z < 0.98;
    S.dna.scale.setScalar(0.1 + z * 0.9);
    S.gene.visible = ch === 'overview' && z > 0.9;
    const glow = ch === 'pairs';
    S.h.rungs.forEach(([h1, h2], i) => { const on = glow && (Math.floor(t * 1.5) % S.h.rungs.length) === i; [h1, h2].forEach((h) => h.scale.set(1, on ? 1.6 : 1, on ? 1.6 : 1)); });
  }
};

const mendel = {
  cameraDistance: 7,
  build(ctx) {
    const T = ctx.THREE; const S = {};
    const plant = (tall, color) => { const g = new T.Group(); const h = tall ? 1.6 : 0.6; const st = ctx.part(tall ? 'tall' : 'dwarf', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.05, 0.06, h, 8)), ctx.mat(color)), g); st.position.y = h / 2; for (let i = 0; i < 3; i++) { const lf = ctx.geo(new T.SphereGeometry(0.15, 10, 6)); lf.scale(1, 0.2, 0.5); const l = ctx.part(tall ? 'tall' : 'dwarf', new T.Mesh(lf, ctx.mat(color)), g); l.position.set((i % 2 ? 1 : -1) * 0.15, h * (0.3 + i * 0.3), 0); } ctx.root.add(g); return g; };
    S.p1 = plant(true, 0x22c55e); S.p2 = plant(false, 0xa3e635); S.p1.position.set(-1.4, 0.4, 0); S.p2.position.set(1.4, 0.4, 0);
    S.f = []; for (let i = 0; i < 4; i++) { const tall = i < 3; const g = plant(tall, tall ? 0x22c55e : 0xa3e635); S.f.push(g); }
    S.cells = []; for (let i = 0; i < 4; i++) { const b = ctx.part('grid', new T.Mesh(ctx.geo(new T.BoxGeometry(0.9, 0.04, 0.9)), ctx.mat(0x94a3b8, { opacity: 0.5 }))); b.position.set((i % 2 ? 0.5 : -0.5), -1.6, (i < 2 ? -0.5 : 0.5)); S.cells.push(b); }
    S.alleles = []; for (let i = 0; i < 8; i++) { const big = [1, 1, 1, 0, 1, 0, 0, 0][i]; const a = ctx.part('allele', new T.Mesh(big ? ctx.geo(new T.BoxGeometry(0.18, 0.18, 0.18)) : ctx.geo(new T.SphereGeometry(0.08, 10, 8)), ctx.mat(big ? 0xfacc15 : 0xfde68a, { clip: false }))); S.alleles.push(a); }
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.35, Math.sin(t * 0.2) * 0.3, 0); ctx.clip.constant = 50;
    const f2 = ch === 'f2'; const u = ease((t - 3) / 6);
    // overview: TT × tt → all Tt (tall). f2: Tt × Tt → TT, Tt, Tt, tt.
    S.p2.visible = true; S.p2.scale.setScalar(f2 ? 1 : 1); S.p2.children.forEach((m) => { m.scale.y = f2 ? 2.6 : 1; });
    S.f.forEach((g, i) => { const tall = f2 ? i < 3 : true; g.visible = u > 0.05; g.scale.set(1, tall ? 1 : 0.38, 1); g.position.set((i % 2 ? 0.5 : -0.5), -1.6, (i < 2 ? -0.5 : 0.5)); g.scale.multiplyScalar(0.6 * u + 0.0001); });
    // genotype markers in each cell: two alleles per box (big = T, small = t)
    const geno = f2 ? [[1, 1], [1, 0], [0, 1], [0, 0]] : [[1, 0], [1, 0], [1, 0], [1, 0]];
    S.alleles.forEach((a, i) => { const box = Math.floor(i / 2); const g = geno[box][i % 2]; a.visible = u > 0.5; a.scale.setScalar(g ? 1 : 0.6); a.material.color.setHex(g ? 0xfacc15 : 0xfde68a); a.position.set((box % 2 ? 0.5 : -0.5) + (i % 2 ? 0.25 : -0.25), -1.5, (box < 2 ? -0.5 : 0.5) + 0.32); });
  }
};

const sex = {
  cameraDistance: 7,
  build(ctx) {
    const T = ctx.THREE; const S = {};
    const X = (color, part) => { const g = new T.Group(); for (const s of [-1, 1]) { const m = ctx.part(part, new T.Mesh(ctx.geo(new T.CapsuleGeometry(0.08, 0.7, 4, 8)), ctx.mat(color, { clip: false })), g); m.rotation.z = s * 0.6; } ctx.root.add(g); return g; };
    const Y = (color) => { const g = new T.Group(); const a = ctx.part('y', new T.Mesh(ctx.geo(new T.CapsuleGeometry(0.08, 0.35, 4, 8)), ctx.mat(color, { clip: false })), g); a.position.set(-0.12, 0.2, 0); a.rotation.z = 0.6; const b = ctx.part('y', new T.Mesh(ctx.geo(new T.CapsuleGeometry(0.08, 0.35, 4, 8)), ctx.mat(color, { clip: false })), g); b.position.set(0.12, 0.2, 0); b.rotation.z = -0.6; const c = ctx.part('y', new T.Mesh(ctx.geo(new T.CapsuleGeometry(0.08, 0.4, 4, 8)), ctx.mat(color, { clip: false })), g); c.position.y = -0.2; ctx.root.add(g); return g; };
    S.egg = ctx.part('egg', new T.Mesh(ctx.geo(new T.SphereGeometry(0.6, 24, 16)), ctx.mat(0xfde68a, { opacity: 0.5 }))); S.egg.position.set(0, -0.8, 0);
    S.eggX = X(0xf472b6, 'x'); S.eggX.position.copy(S.egg.position);
    S.spX = ctx.part('sperm', new T.Mesh(ctx.geo(new T.SphereGeometry(0.3, 16, 12)), ctx.mat(0xe2e8f0, { opacity: 0.6 }))); S.spY = ctx.part('sperm', new T.Mesh(ctx.geo(new T.SphereGeometry(0.3, 16, 12)), ctx.mat(0xe2e8f0, { opacity: 0.6 })));
    S.cX = X(0xf472b6, 'x'); S.cY = Y(0x38bdf8);
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.1, 0, 0); ctx.clip.constant = 50;
    const cr = ch === 'cross';
    const pick = cr ? Math.floor(t / 10) % 2 : -1; const u = cr ? ease(((t % 10) - 1) / 5) : 0;
    const home = [[-1.6, 1.3, 0], [1.6, 1.3, 0]];
    [[S.spX, S.cX], [S.spY, S.cY]].forEach(([sp, c], i) => { const go = pick === i ? u : 0; const x = home[i][0] * (1 - go); const y = home[i][1] - go * 2.1; sp.position.set(x, y, 0.1); c.position.set(x, y, 0.1); c.scale.setScalar(0.7); });
    S.eggX.position.set(pick >= 0 && u > 0.95 ? -0.25 : 0, -0.8, 0);
  }
};

const expression = {
  cameraDistance: 6.5,
  build(ctx) {
    const T = ctx.THREE; const S = {};
    S.dna = new T.Group(); ctx.root.add(S.dna);
    S.h = helix(ctx, S.dna, 16, { partStrand: 'template', partBase: 'template' });
    S.newA = []; S.newB = [];
    const nm = ctx.mat(0x22c55e, { clip: false }); const g = ctx.geo(new T.SphereGeometry(0.07, 8, 6));
    S.h.rungs.forEach(() => { S.newA.push(ctx.part('newstrand', new T.Mesh(g, nm), S.dna)); S.newB.push(ctx.part('newstrand', new T.Mesh(g, nm), S.dna)); });
    S.mrna = []; for (let i = 0; i < 12; i++) S.mrna.push(ctx.part('mrna', new T.Mesh(ctx.geo(new T.BoxGeometry(0.12, 0.12, 0.12)), ctx.mat(0xf472b6, { clip: false }))));
    S.ribo = ctx.part('ribosome', new T.Mesh(ctx.geo(new T.SphereGeometry(0.35, 20, 14)), ctx.mat(0xfb923c, { opacity: 0.8 })));
    S.aa = []; for (let i = 0; i < 4; i++) S.aa.push(ctx.part('ribosome', new T.Mesh(ctx.geo(new T.IcosahedronGeometry(0.11, 1)), ctx.mat([0xa855f7, 0x22d3ee, 0xf59e0b, 0x84cc16][i], { clip: false }))));
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.1, ch === 'overview' ? t * 0.15 : 0.3, 0); ctx.clip.constant = 50;
    const rep = ch === 'overview'; const unzip = rep ? ease((t - 2) / 10) : 0;
    S.h.a.forEach((p, i) => { const [, , a, y] = S.h.rungs[i]; const open = unzip * (i / S.h.a.length < unzip ? 1 : 0); p.position.set(Math.cos(a) * 0.6 - open * 0.9, y, Math.sin(a) * 0.6); S.h.b[i].position.set(-Math.cos(a) * 0.6 + open * 0.9, y, -Math.sin(a) * 0.6);
      S.h.rungs[i][0].visible = open < 0.5; S.h.rungs[i][1].visible = open < 0.5;
      S.newA[i].visible = rep && open > 0.5; S.newB[i].visible = rep && open > 0.5;
      S.newA[i].position.set(p.position.x + 0.45, y, p.position.z); S.newB[i].position.set(S.h.b[i].position.x - 0.45, y, S.h.b[i].position.z); });
    const ex = ch === 'express'; S.ribo.visible = ex; S.mrna.forEach((m) => { m.visible = ex; }); S.aa.forEach((a) => { a.visible = ex; });
    if (ex) {
      S.dna.position.x = -1.6; const tr = ease((t - 1) / 8); const tl = ease((t - 10) / 12);
      S.mrna.forEach((m, i) => { m.position.set(-1.0 + tr * 1.0 + i * 0.16, 1.2 - i * 0.0, 0); m.visible = i / 12 < tr; });
      S.ribo.position.set(0 + tl * 1.8, 1.25, 0.2);
      S.aa.forEach((a, i) => { a.visible = tl > i / 4; a.position.set(S.ribo.position.x - i * 0.24, 1.75 + i * 0.05, 0.2); });
    } else S.dna.position.x = 0;
  }
};

export const heredityBuilders = { dna, mendel, 'sex-determination': sex, 'gene-expression': expression };
