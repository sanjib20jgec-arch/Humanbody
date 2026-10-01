// Procedural 3D builders for the Environment bay (state = f(chapter, t)).
import { ease, seeded } from '../three/ProceduralScene.js';

const chain = {
  cameraDistance: 8,
  build(ctx) {
    const T = ctx.THREE; const S = {};
    S.sun = ctx.part('sun', new T.Mesh(ctx.geo(new T.SphereGeometry(0.5, 24, 16)), ctx.mat(0xfacc15, { clip: false }))); S.sun.position.set(-2.8, 2.4, 0);
    // step widths ~ log-scaled 10 : 1 so all three stay visible
    S.steps = [['producer', 3.6, 0x22c55e], ['herbivore', 2.2, 0xfde68a], ['carnivore', 1.0, 0xf97316]].map(([p, w, c], i) => { const m = ctx.part(p, new T.Mesh(ctx.geo(new T.BoxGeometry(w, 0.6, w)), ctx.mat(c))); m.position.y = -1.6 + i * 0.65; return m; });
    S.heat = []; for (let i = 0; i < 9; i++) S.heat.push(ctx.part('heat', new T.Mesh(ctx.geo(new T.SphereGeometry(0.07, 8, 6)), ctx.mat(0xef4444, { clip: false }))));
    S.dots = []; const rnd = seeded(3);
    for (let lv = 0; lv < 3; lv++) for (let i = 0; i < 10; i++) { const m = ctx.part('heat', new T.Mesh(ctx.geo(new T.SphereGeometry(0.05, 6, 4)), ctx.mat(0x7c3aed, { clip: false }))); m.userData = { lv, i, x: rnd() - 0.5, z: rnd() - 0.5 }; S.dots.push(m); }
    S.ray = ctx.part('sun', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.03, 0.03, 3.6, 6)), ctx.mat(0xfde047, { opacity: 0.6, clip: false })));
    S.ray.position.set(-1.6, 0.8, 0); S.ray.rotation.z = 0.75;
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.35, t * 0.2, 0); ctx.clip.constant = 50;
    const build = ch === 'overview' ? ease(t / 12) : 1;
    S.steps.forEach((m, i) => { const u = Math.max(0, Math.min(1, build * 3 - i)); m.scale.set(1, Math.max(0.01, u), 1); m.visible = u > 0.01; });
    S.heat.forEach((h, i) => { const lv = i % 3; const u = (t * 0.5 + i * 0.37) % 1; h.visible = ch === 'overview' && build * 3 > lv + 1; h.position.set(Math.sin(i) * 1.5, -1.6 + lv * 0.65 + u * 1.8, Math.cos(i) * 1.5); });
    const mag = ch === 'magnify';
    // 1, 3, 10 dots per level: concentration rises upward
    const counts = [2, 5, 10]; const widths = [3.6, 2.2, 1.0];
    S.dots.forEach((d) => { const { lv, i, x, z } = d.userData; d.visible = mag && i < counts[lv] && t > lv * 3; d.position.set(x * widths[lv] * 0.9, -1.6 + lv * 0.65 + 0.32, z * widths[lv] * 0.9); });
  }
};

const sundarbans = {
  cameraDistance: 7,
  build(ctx) {
    const T = ctx.THREE; const S = {}; const rnd = seeded(11);
    S.mud = ctx.part('mud', new T.Mesh(ctx.geo(new T.CylinderGeometry(3, 3, 0.5, 40)), ctx.mat(0x78716c))); S.mud.position.y = -1.6;
    S.trunk = ctx.part('trunk', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.18, 0.26, 3, 12)), ctx.mat(0x92400e))); S.trunk.position.y = 0.1;
    S.crown = ctx.part('trunk', new T.Mesh(ctx.geo(new T.IcosahedronGeometry(1.1, 1)), ctx.mat(0x15803d))); S.crown.position.y = 1.9;
    for (let i = 0; i < 26; i++) { const a = rnd() * Math.PI * 2; const r = 0.6 + rnd() * 2; const h = 0.5 + rnd() * 0.4; const m = ctx.part('pneumatophore', new T.Mesh(ctx.geo(new T.ConeGeometry(0.04, h, 6)), ctx.mat(0xa3e635)), ctx.root); m.position.set(Math.cos(a) * r, -1.35 + h / 2, Math.sin(a) * r); }
    S.water = ctx.part('water', new T.Mesh(ctx.geo(new T.CylinderGeometry(3, 3, 1, 40)), ctx.mat(0x38bdf8, { opacity: 0.35 })));
    S.seed = ctx.part('seedling', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.04, 0.02, 0.6, 8)), ctx.mat(0x22c55e, { clip: false })));
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.2, t * 0.15, 0); ctx.clip.constant = 50;
    const tide = ch === 'overview' ? 0.5 - 0.5 * Math.cos((t / 20) * Math.PI * 2) : 0.3;
    const h = 0.05 + tide * 0.55; S.water.scale.y = h; S.water.position.y = -1.35 + h / 2;
    const seedOn = ch === 'seed'; S.seed.visible = seedOn;
    if (seedOn) { const grow = ease(t / 6); const drop = ease((t - 7) / 3); S.seed.scale.set(1, 0.2 + grow, 1); S.seed.position.set(0.9, 1.3 - drop * 2.4, 0.3); S.seed.rotation.z = drop > 0.99 ? 0.15 : 0; }
  }
};

const ozone = {
  cameraDistance: 7,
  build(ctx) {
    const T = ctx.THREE; const S = {};
    S.earth = ctx.part('earth', new T.Mesh(ctx.geo(new T.SphereGeometry(1.4, 32, 24)), ctx.mat(0x2563eb)));
    S.layer = ctx.part('layer', new T.Mesh(ctx.geo(new T.SphereGeometry(2.0, 40, 28)), ctx.mat(0xa78bfa, { opacity: 0.28, side: T.DoubleSide })));
    S.rays = []; for (let i = 0; i < 10; i++) S.rays.push(ctx.part('uv', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.03, 0.03, 0.5, 6)), ctx.mat(0xf472b6, { clip: false }))));
    S.cfc = []; for (let i = 0; i < 8; i++) S.cfc.push(ctx.part('cfc', new T.Mesh(ctx.geo(new T.TetrahedronGeometry(0.1)), ctx.mat(0x94a3b8, { clip: false }))));
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.2, t * 0.1, 0); ctx.clip.constant = 50;
    const hole = ch === 'hole'; const thin = hole ? (t < 10 ? ease(t / 8) : 1 - ease((t - 10) / 8)) : 0;
    S.layer.material.opacity = 0.28 * (1 - thin * 0.8);
    S.rays.forEach((r, i) => { const u = (t * 0.6 + i / S.rays.length) % 1; const stopAt = 2.05 - (thin > 0.4 && i % 2 ? 0.65 : 0); const d = 4 - u * (4 - stopAt); r.position.set(-0.6 + (i % 5) * 0.3, d, 0.3 * Math.floor(i / 5)); r.visible = true; });
    S.cfc.forEach((c, i) => { c.visible = hole && t < 12; const a = i / S.cfc.length * Math.PI * 2 + t * 0.4; const rr = 1.5 + ease(t / 8) * 0.5; c.position.set(Math.cos(a) * rr, Math.sin(a) * rr * 0.4 + 0.8, Math.sin(a) * rr); });
  }
};

const population = {
  cameraDistance: 7,
  build(ctx) {
    const T = ctx.THREE; const S = { j: [], s: [] };
    const ax = (len, rot, pos) => { const m = ctx.part('axes', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.03, 0.03, len, 6)), ctx.mat(0x94a3b8, { clip: false }))); m.rotation.z = rot; m.position.set(...pos); };
    ax(5, Math.PI / 2, [0, -2, 0]); ax(4.4, 0, [-2.5, 0.2, 0]);
    const dot = ctx.geo(new T.SphereGeometry(0.06, 8, 6));
    for (let i = 0; i < 40; i++) { S.j.push(ctx.part('jcurve', new T.Mesh(dot, ctx.mat(0xef4444, { clip: false })))); S.s.push(ctx.part('scurve', new T.Mesh(dot, ctx.mat(0x22c55e, { clip: false })))); }
    S.k = ctx.part('capacity', new T.Mesh(ctx.geo(new T.BoxGeometry(5, 0.02, 0.02)), ctx.mat(0xfacc15, { clip: false })));
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0, Math.sin(t * 0.2) * 0.2, 0); ctx.clip.constant = 50;
    const K = ch === 'limit' ? 2.2 + Math.sin(t * 0.4) * 0.9 : 2.6; const N0 = 0.05; const r = 0.9;
    const shown = ch === 'overview' ? ease(t / 14) : 1;
    S.k.position.set(0, -2 + K, 0);
    for (let i = 0; i < 40; i++) {
      const x = i / 39 * 4.8; const tt = x;
      const nj = N0 * Math.exp(r * tt); const ns = K / (1 + ((K - N0) / N0) * Math.exp(-r * tt));
      S.j[i].position.set(-2.5 + x, -2 + Math.min(nj, 4.4), 0); S.j[i].visible = i / 39 <= shown && nj <= 4.4;
      S.s[i].position.set(-2.5 + x, -2 + ns, 0); S.s[i].visible = i / 39 <= shown;
    }
  }
};

export const environmentBuilders = { 'food-chain': chain, sundarbans, ozone, population };
