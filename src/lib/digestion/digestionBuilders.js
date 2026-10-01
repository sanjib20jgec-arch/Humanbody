// Procedural 3D builders for the Digestion bay (state = f(chapter, t)).
import { ease, seeded } from '../three/ProceduralScene.js';

const loop = (t, p) => (t % p) / p;

const stomach = {
  cameraDistance: 6.5,
  build(ctx) {
    const T = ctx.THREE; const S = {}; const rnd = seeded(51); const m4 = new T.Matrix4();
    const g = ctx.geo(new T.SphereGeometry(1.6, 48, 32)); g.scale(1.3, 1, 0.9);
    S.wall = ctx.part('wall', new T.Mesh(g, ctx.mat(0xfb7185, { side: T.DoubleSide })));
    const inner = ctx.geo(new T.SphereGeometry(1.45, 48, 32)); inner.scale(1.3, 1, 0.9);
    S.mucus = ctx.part('mucus', new T.Mesh(inner, ctx.mat(0x86efac, { side: T.DoubleSide, opacity: 0.7 })));
    const rm = ctx.mat(0xfda4af);
    for (let i = 0; i < 7; i++) { const r = ctx.part('rugae', new T.Mesh(ctx.geo(new T.TorusGeometry(1.2, 0.05, 6, 40, Math.PI * 1.4)), rm)); r.rotation.set(Math.PI / 2, 0, -0.7 + i * 0.05); r.position.y = -0.9 + i * 0.3; r.scale.set(1.25 * Math.sqrt(1 - ((-0.9 + i * 0.3) / 1.6) ** 2), 0.85 * Math.sqrt(1 - ((-0.9 + i * 0.3) / 1.6) ** 2), 1); }
    S.glandPos = [];
    const gl = new T.InstancedMesh(ctx.geo(new T.CylinderGeometry(0.06, 0.04, 0.22, 8)), ctx.mat(0xa78bfa), 40);
    const up = new T.Vector3(0, 1, 0); const q = new T.Quaternion();
    for (let i = 0; i < 40; i++) { const v = new T.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize(); q.setFromUnitVectors(up, v); const p = v.clone().multiply(new T.Vector3(1.85, 1.45, 1.3)); m4.compose(p, q, new T.Vector3(1, 1, 1)); gl.setMatrixAt(i, m4); S.glandPos.push(p.multiplyScalar(0.92)); }
    ctx.part('glands', gl);
    S.acid = ctx.part('acid', new T.InstancedMesh(ctx.geo(new T.OctahedronGeometry(0.06)), ctx.mat(0xfacc15, { clip: false }), 40));
    S.m4 = m4;
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.2, t * 0.08, 0); ctx.clip.constant = 0;
    const sq = 1 + Math.sin(t * 2) * 0.04; S.wall.scale.set(sq, 2 - sq, 1); S.mucus.scale.copy(S.wall.scale);
    S.acid.visible = ch === 'secretion';
    if (ch === 'secretion') { S.glandPos.forEach((p, i) => { const u = loop(t / 4 + i / 40, 1); S.acid.setMatrixAt(i, S.m4.makeTranslation(p.x * (1 - u * 0.7), p.y * (1 - u * 0.7), p.z * (1 - u * 0.7))); }); S.acid.instanceMatrix.needsUpdate = true; }
  }
};

const villus = {
  cameraDistance: 6.5,
  build(ctx) {
    const T = ctx.THREE; const S = {}; const m4 = new T.Matrix4();
    const base = ctx.part('villus', new T.Mesh(ctx.geo(new T.BoxGeometry(5, 0.3, 2.4)), ctx.mat(0xf9a8d4))); base.position.y = -1.6;
    const vg = ctx.geo(new T.CapsuleGeometry(0.28, 2.0, 6, 16));
    const vm = ctx.mat(0xfda4af, { opacity: 0.55 });
    S.centres = [];
    for (let i = 0; i < 5; i++) for (let k = 0; k < 2; k++) { const x = -2 + i * 1.0 + (k ? 0.5 : 0); const z = -0.55 + k * 1.1; S.centres.push([x, z]); ctx.part('villus', new T.Mesh(vg, vm)).position.set(x, -0.3, z); }
    const [fx, fz] = S.centres[4]; S.focus = [fx, fz];
    const lac = ctx.geo(new T.CylinderGeometry(0.06, 0.06, 2.0, 8));
    S.centres.forEach(([x, z]) => {
      ctx.part('lacteal', new T.Mesh(lac, ctx.mat(0xfef08a))).position.set(x, -0.4, z);
      const pts = []; for (let j = 0; j <= 20; j++) { const y = -1.4 + j * 0.13; pts.push(new T.Vector3(x + Math.cos(j * 0.9) * 0.18, y, z + Math.sin(j * 0.9) * 0.18)); }
      ctx.part('capillary', new T.Mesh(ctx.geo(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 60, 0.025, 5)), ctx.mat(0xef4444)));
    });
    const mv = new T.InstancedMesh(ctx.geo(new T.CylinderGeometry(0.015, 0.015, 0.08, 4)), ctx.mat(0x38bdf8), S.centres.length * 24);
    let n = 0; S.centres.forEach(([x, z]) => { for (let j = 0; j < 24; j++) { const a = j * 0.8; const y = -0.8 + (j % 8) * 0.22; mv.setMatrixAt(n++, m4.makeTranslation(x + Math.cos(a) * 0.3, y, z + Math.sin(a) * 0.3)); } });
    ctx.part('microvilli', mv);
    S.sugar = ctx.part('nutrient', new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.05, 8, 6)), ctx.mat(0x22c55e, { clip: false }), 30));
    S.fat = ctx.part('nutrient', new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.06, 8, 6)), ctx.mat(0xfde047, { clip: false }), 20));
    S.m4 = m4;
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.25, -0.4 + t * 0.04, 0); ctx.clip.constant = 50;
    const ab = ch === 'absorb'; S.sugar.visible = ab; S.fat.visible = ab;
    if (ab) {
      for (let i = 0; i < 30; i++) { const [x, z] = S.centres[i % S.centres.length]; const u = loop(t / 5 + i / 30, 1); const a = i * 1.7; const r = u < 0.3 ? 0.55 - u : 0.2; const y = u < 0.3 ? 0.6 : 0.6 - (u - 0.3) * 2.8; S.sugar.setMatrixAt(i, S.m4.makeTranslation(x + Math.cos(a) * r, y, z + Math.sin(a) * r)); }
      for (let i = 0; i < 20; i++) { const [x, z] = S.centres[(i * 3) % S.centres.length]; const u = loop(t / 6 + i / 20, 1); const y = u < 0.3 ? 0.9 - u : 0.6 - (u - 0.3) * 2.8; const off = u < 0.3 ? 0.5 - u * 1.6 : 0; S.fat.setMatrixAt(i, S.m4.makeTranslation(x + off, y, z)); }
      S.sugar.instanceMatrix.needsUpdate = true; S.fat.instanceMatrix.needsUpdate = true;
    }
  }
};

const peristalsis = {
  cameraDistance: 6.5,
  build(ctx) {
    const T = ctx.THREE; const S = {};
    const g = ctx.geo(new T.CylinderGeometry(0.5, 0.5, 5, 32, 60, true)); g.rotateZ(Math.PI / 2);
    S.base = g.attributes.position.array.slice();
    S.tube = ctx.part('tube', new T.Mesh(g, ctx.mat(0xfda4af, { side: T.DoubleSide, opacity: 0.6 })));
    S.rings = [];
    for (let i = 0; i < 12; i++) { const r = ctx.part('ring', new T.Mesh(ctx.geo(new T.TorusGeometry(0.52, 0.04, 6, 32)), ctx.mat(0xf43f5e))); r.rotation.y = Math.PI / 2; r.position.x = -2.3 + i * 0.42; S.rings.push(r); }
    S.bolus = ctx.part('bolus', new T.Mesh(ctx.geo(new T.SphereGeometry(0.42, 24, 16)), ctx.mat(0xf59e0b, { clip: false })));
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.3, -0.5, 0); ctx.clip.constant = 0;
    const wave = ch === 'wave';
    const bx = wave ? -2.4 + loop(t, 8) * 4.8 : -0.5;
    const sq = (x) => (wave ? Math.exp(-(((x - (bx - 0.6)) / 0.3) ** 2)) * 0.25 : 0);
    const bulge = (x) => Math.exp(-(((x - bx) / 0.4) ** 2)) * 0.05;
    const pos = S.tube.geometry.attributes.position; const a = pos.array;
    for (let i = 0; i < a.length; i += 3) { const x = S.base[i]; const y = S.base[i + 1]; const z = S.base[i + 2]; const k = (0.5 - sq(x) + bulge(x)) / 0.5; a[i + 1] = y * k; a[i + 2] = z * k; }
    pos.needsUpdate = true; S.tube.geometry.computeVertexNormals();
    S.rings.forEach((r) => { const k = (0.5 - sq(r.position.x) + bulge(r.position.x)) / 0.5; r.scale.set(k, k, 1); });
    S.bolus.position.set(bx, 0, 0);
  }
};

const bile = {
  cameraDistance: 6,
  build(ctx) {
    const T = ctx.THREE; const S = {}; const rnd = seeded(61);
    S.big = []; for (let i = 0; i < 3; i++) { const m = ctx.part('fat', new T.Mesh(ctx.geo(new T.SphereGeometry(0.7, 32, 20)), ctx.mat(0xfde047, { opacity: 0.85 }))); m.position.set(-1.8 + i * 1.8, 0, 0); S.big.push(m); }
    S.small = ctx.part('fat', new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.16, 12, 8)), ctx.mat(0xfde047), 60));
    S.smallSeeds = Array.from({ length: 60 }, (_, i) => [S.big[i % 3].position.x, (rnd() - 0.5) * 2.4, (rnd() - 0.5) * 1.6, (rnd() - 0.5) * 1.2]);
    S.salts = ctx.part('bilesalt', new T.InstancedMesh(ctx.geo(new T.CapsuleGeometry(0.03, 0.14, 4, 6)), ctx.mat(0x4ade80, { clip: false }), 60));
    S.lip = ctx.part('lipase', new T.InstancedMesh(ctx.geo(new T.IcosahedronGeometry(0.09, 0)), ctx.mat(0xc084fc, { clip: false }), 12));
    S.m4 = new T.Matrix4();
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.2, t * 0.05, 0); ctx.clip.constant = 50;
    const e = ch === 'emulsify' ? ease((t - 2) / 8) : 0;
    S.big.forEach((m) => { m.scale.setScalar(1 - e * 0.98); m.visible = e < 0.97; });
    S.small.visible = e > 0;
    S.smallSeeds.forEach(([cx, x, y, z], i) => { S.small.setMatrixAt(i, S.m4.makeTranslation(cx + x * 0.5 * e, y * 0.6 * e, z * e).scale(new ctx.THREE.Vector3(e, e, e).addScalar(0.001))); });
    S.small.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < 60; i++) { const a = i * 0.7 + t * 0.4; const r = 0.8 + Math.sin(i) * 0.3; const [cx] = S.smallSeeds[i]; S.salts.setMatrixAt(i, S.m4.makeTranslation(cx + Math.cos(a) * r * (1 - e * 0.5), Math.sin(a * 1.3) * r, Math.sin(a) * r * 0.6)); }
    S.salts.instanceMatrix.needsUpdate = true;
    S.lip.visible = ch === 'emulsify' && t > 10;
    for (let i = 0; i < 12; i++) { const [cx, x, y, z] = S.smallSeeds[i * 5]; S.lip.setMatrixAt(i, S.m4.makeTranslation(cx + x * 0.5 + 0.2, y * 0.6 + Math.sin(t * 2 + i) * 0.05, z + 0.15)); }
    S.lip.instanceMatrix.needsUpdate = true;
  }
};

const enzyme = {
  cameraDistance: 6,
  build(ctx) {
    const T = ctx.THREE; const S = {};
    // Enzyme: a sphere with a notch (active site) represented by a darker cup.
    S.enz = new T.Group(); ctx.root.add(S.enz);
    ctx.part('enzyme', new T.Mesh(ctx.geo(new T.SphereGeometry(1.1, 40, 24, 0, Math.PI * 2, 0.55, Math.PI - 0.55)), ctx.mat(0xc084fc, { side: T.DoubleSide })), S.enz);
    S.site = ctx.part('enzyme', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.5, 0.45, 0.35, 24, 1, true)), ctx.mat(0x7e22ce, { side: T.DoubleSide })), S.enz); S.site.position.y = 0.88;
    S.enz.position.y = -0.6;
    // Substrate: chain of 6 glucose beads.
    S.beads = []; for (let i = 0; i < 6; i++) { const b = ctx.part('substrate', new T.Mesh(ctx.geo(new T.IcosahedronGeometry(0.18, 1)), ctx.mat(0xf59e0b, { clip: false }))); S.beads.push(b); }
    S.prod = []; for (let i = 0; i < 3; i++) { const g = new T.Group(); for (let j = 0; j < 2; j++) { const b = ctx.part('product', new T.Mesh(ctx.geo(new T.IcosahedronGeometry(0.18, 1)), ctx.mat(0x22c55e, { clip: false })), g); b.position.x = j * 0.36 - 0.18; } g.visible = false; ctx.root.add(g); S.prod.push(g); }
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.15, -0.3 + t * 0.03, 0); ctx.clip.constant = 50;
    const u = ch === 'catalysis' ? loop(t, 10) : Math.min(1, t / 8) * 0.45;
    const dock = ease(u / 0.35); const split = ease((u - 0.45) / 0.15); const away = ease((u - 0.6) / 0.35);
    S.site.scale.set(1 - dock * 0.1, 1, 1 - dock * 0.1); // induced fit tightens slightly
    S.beads.forEach((b, i) => { b.visible = split < 0.01; b.position.set(-0.9 + i * 0.36, 2.2 - dock * 1.6, 0); });
    S.prod.forEach((g, k) => { g.visible = split >= 0.01; g.position.set(-0.72 + k * 0.72 + (k - 1) * away * 1.4, 0.6 + away * 1.5, 0); });
  }
};

export const digestionBuilders = { stomach, villus, peristalsis, bile, enzyme };
