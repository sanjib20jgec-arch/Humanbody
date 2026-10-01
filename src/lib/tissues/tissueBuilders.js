// Procedural 3D builders for the Tissues bay (state = f(chapter, t)).
import { ease, seeded } from '../three/ProceduralScene.js';

const loop = (t, p) => (t % p) / p;

// ---------- Skeletal muscle: fibre → sarcomere ----------
const muscle = {
  cameraDistance: 6.4,
  build(ctx) {
    const T = ctx.THREE; const S = {}; const m4 = new T.Matrix4();
    // Fibre view
    S.fibre = new T.Group(); ctx.root.add(S.fibre);
    const fg = ctx.geo(new T.CylinderGeometry(0.9, 0.9, 5, 40, 1, true)); fg.rotateZ(Math.PI / 2);
    ctx.part('fibre', new T.Mesh(fg, ctx.mat(0xfb7185, { opacity: 0.35, side: T.DoubleSide })), S.fibre);
    const nucGeo = ctx.geo(new T.SphereGeometry(0.12, 12, 8)); nucGeo.scale(2.2, 0.7, 0.9);
    const nMat = ctx.mat(0xa78bfa);
    for (let i = 0; i < 10; i++) { const a = i * 2.4; ctx.part('nuclei', new T.Mesh(nucGeo, nMat), S.fibre).position.set(-2.2 + i * 0.48, Math.cos(a) * 0.82, Math.sin(a) * 0.82); }
    // Myofibrils: striped cylinders (alternating light/dark segments)
    const light = ctx.mat(0xfde2e4); const dark = ctx.mat(0xbe123c);
    const seg = ctx.geo(new T.CylinderGeometry(0.13, 0.13, 0.25, 12)); seg.rotateZ(Math.PI / 2);
    const fibPos = [[0, 0], [0.32, 0.18], [-0.32, 0.18], [0, -0.36], [0.32, -0.18], [-0.32, -0.18], [0, 0.36]];
    const lightI = new T.InstancedMesh(seg, light, fibPos.length * 10); const darkI = new T.InstancedMesh(seg, dark, fibPos.length * 10);
    let a = 0;
    fibPos.forEach(([y, z]) => { for (let k = 0; k < 10; k++) { lightI.setMatrixAt(a, m4.makeTranslation(-2.375 + k * 0.5, y, z)); darkI.setMatrixAt(a, m4.makeTranslation(-2.125 + k * 0.5, y, z)); a++; } });
    ctx.part('myofibril', lightI, S.fibre); ctx.part('myofibril', darkI, S.fibre);
    // Sarcomere view
    S.sarc = new T.Group(); S.sarc.visible = false; ctx.root.add(S.sarc);
    const zGeo = ctx.geo(new T.BoxGeometry(0.06, 2.2, 2.2));
    S.zL = ctx.part('zline', new T.Mesh(zGeo, ctx.mat(0xe2e8f0, { clip: false })), S.sarc);
    S.zR = ctx.part('zline', new T.Mesh(zGeo, ctx.mat(0xe2e8f0, { clip: false })), S.sarc);
    const grid = []; for (let i = -2; i <= 2; i++) for (let k = -2; k <= 2; k++) grid.push([i * 0.4, k * 0.4]);
    const thick = ctx.geo(new T.CylinderGeometry(0.07, 0.07, 1.6, 8)); thick.rotateZ(Math.PI / 2);
    const myo = new T.InstancedMesh(thick, ctx.mat(0xf59e0b, { clip: false }), grid.length);
    grid.forEach(([y, z], i) => myo.setMatrixAt(i, m4.makeTranslation(0, y, z))); ctx.part('myosin', myo, S.sarc);
    const thin = ctx.geo(new T.CylinderGeometry(0.03, 0.03, 1.25, 6)); thin.rotateZ(Math.PI / 2);
    S.thinPos = []; for (let i = -2; i < 2; i++) for (let k = -2; k < 2; k++) S.thinPos.push([i * 0.4 + 0.2, k * 0.4 + 0.2]);
    S.actL = ctx.part('actin', new T.InstancedMesh(thin, ctx.mat(0x38bdf8, { clip: false }), S.thinPos.length), S.sarc);
    S.actR = ctx.part('actin', new T.InstancedMesh(thin, ctx.mat(0x38bdf8, { clip: false }), S.thinPos.length), S.sarc);
    // Myosin heads (cross bridges) for the NEET chapter
    S.heads = ctx.part('myosin', new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.06, 8, 6)), ctx.mat(0xfbbf24, { clip: false }), grid.length * 4), S.sarc);
    S.ca = ctx.part('actin', new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.05, 8, 6)), ctx.mat(0x22c55e, { clip: false }), 20), S.sarc);
    S.grid = grid; S.m4 = m4;
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.clip.constant = 50;
    const sv = ch !== 'overview'; S.fibre.visible = !sv; S.sarc.visible = sv;
    if (!sv) { ctx.root.rotation.set(0.3, -0.5 + t * 0.06, 0); return; }
    ctx.root.rotation.set(0.25, -0.6, 0);
    // Contraction: half-sarcomere from 1.25 (relaxed) to 0.85 (contracted); A band (myosin 1.6) unchanged.
    const c = ch === 'sliding' ? (t < 12 ? ease((t - 2) / 8) : 1 - ease((t - 14) / 8)) : ease(loop(t, 13) * 2) * (loop(t, 13) < 0.5 ? 1 : 0) + (loop(t, 13) >= 0.5 ? 1 - ease((loop(t, 13) - 0.5) * 2) : 0);
    const half = 1.25 - 0.4 * c;
    S.zL.position.x = -half; S.zR.position.x = half;
    const m4 = S.m4;
    S.thinPos.forEach(([y, z], i) => { S.actL.setMatrixAt(i, m4.makeTranslation(-half + 0.625, y, z)); S.actR.setMatrixAt(i, m4.makeTranslation(half - 0.625, y, z)); });
    S.actL.instanceMatrix.needsUpdate = true; S.actR.instanceMatrix.needsUpdate = true;
    const xb = ch === 'crossbridge'; S.heads.visible = xb; S.ca.visible = xb;
    if (xb) {
      let n = 0; const wob = Math.sin(t * 6) * 0.05;
      S.grid.forEach(([y, z]) => { for (const sx of [-0.55, -0.3, 0.3, 0.55]) S.heads.setMatrixAt(n++, m4.makeTranslation(sx + Math.sign(sx) * wob, y + 0.12, z)); });
      S.heads.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < 20; i++) { const u = loop(t / 4 + i / 20, 1); S.ca.setMatrixAt(i, m4.makeTranslation(-1.3 + (i % 10) * 0.28, 1.3 - u * 0.4, -1 + Math.floor(i / 10) * 2)); }
      S.ca.instanceMatrix.needsUpdate = true;
    }
  }
};

// ---------- Epithelium: four patches ----------
const epithelium = {
  cameraDistance: 7,
  build(ctx) {
    const T = ctx.THREE; const S = {}; const m4 = new T.Matrix4();
    const base = ctx.part('basement', new T.Mesh(ctx.geo(new T.BoxGeometry(6.4, 0.06, 1.6)), ctx.mat(0x94a3b8)));
    base.position.y = -0.6;
    const nucMat = ctx.mat(0x6d28d9);
    const block = (id, color, x0, w, h, d, n) => {
      const g = ctx.geo(new T.BoxGeometry(w * 0.94, h, d * 0.94)); const mat = ctx.mat(color);
      for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) {
        const c = ctx.part(id, new T.Mesh(g, mat)); c.position.set(x0 + i * w, -0.57 + h / 2, -0.5 + k * d);
        const nu = ctx.part(id, new T.Mesh(ctx.geo(new T.SphereGeometry(Math.min(w, h) * 0.22, 10, 8)), nucMat)); nu.position.set(c.position.x, -0.57 + h * (id === 'squamous' ? 0.5 : 0.4), c.position.z);
      }
    };
    block('squamous', 0xfda4af, -2.9, 0.5, 0.1, 0.5, 3);
    block('cuboidal', 0xfbbf24, -1.3, 0.4, 0.4, 0.5, 3);
    block('columnar', 0x34d399, 0.2, 0.3, 0.9, 0.5, 4);
    block('columnar', 0x22d3ee, 1.8, 0.3, 0.9, 0.5, 4);
    S.ciliaPos = []; for (let i = 0; i < 4; i++) for (let k = 0; k < 3; k++) for (let j = 0; j < 4; j++) S.ciliaPos.push([1.8 + i * 0.3 - 0.1 + j * 0.065, -0.5 + k * 0.5]);
    S.cilia = ctx.part('cilia', new T.InstancedMesh(ctx.geo(new T.CylinderGeometry(0.012, 0.012, 0.3, 4)), ctx.mat(0x38bdf8), S.ciliaPos.length));
    S.mucus = ctx.part('cilia', new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.07, 8, 6)), ctx.mat(0xd9f99d, { opacity: 0.8 }), 10));
    S.m4 = m4; S.q = new T.Quaternion(); S.e = new T.Euler(); S.one = new T.Vector3(1, 1, 1); S.v = new T.Vector3();
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.clip.constant = 50; ctx.root.rotation.set(0.45, -0.3 + (ch === 'overview' ? t * 0.04 : 0.3), 0);
    S.ciliaPos.forEach(([x, z], i) => {
      const phase = ch === 'cilia' ? Math.sin(t * 5 - x * 6) * 0.6 : 0;
      S.e.set(0, 0, phase); S.q.setFromEuler(S.e); S.v.set(x - Math.sin(phase) * 0.15, 0.48, z);
      S.cilia.setMatrixAt(i, S.m4.compose(S.v, S.q, S.one));
    });
    S.cilia.instanceMatrix.needsUpdate = true;
    S.mucus.visible = ch === 'cilia';
    for (let i = 0; i < 10; i++) { const u = loop(t / 6 + i / 10, 1); S.mucus.setMatrixAt(i, S.m4.makeTranslation(1.6 + u * 1.3, 0.72, -0.5 + (i % 3) * 0.5)); }
    S.mucus.instanceMatrix.needsUpdate = true;
  }
};

// ---------- Compact bone: osteons ----------
const bone = {
  cameraDistance: 6.5,
  build(ctx) {
    const T = ctx.THREE; const S = {}; const rnd = seeded(21);
    const centres = [[0, 0], [1.25, 0.5], [-1.2, 0.6], [0.4, -1.2], [-0.9, -1.0]];
    const lamMats = [ctx.mat(0xfde68a, { side: T.DoubleSide }), ctx.mat(0xfcd34d, { side: T.DoubleSide })];
    const ocGeo = ctx.geo(new T.SphereGeometry(0.06, 8, 6)); ocGeo.scale(1.6, 0.8, 0.8);
    const ocMat = ctx.mat(0xa78bfa);
    centres.forEach(([x, z], ci) => {
      for (let r = 0; r < 4; r++) {
        const g = ctx.geo(new T.CylinderGeometry(0.18 + r * 0.14, 0.18 + r * 0.14, 2.2, 32, 1, true));
        ctx.part('lamellae', new T.Mesh(g, lamMats[r % 2])).position.set(x, 0, z);
        for (let k = 0; k < 6; k++) { const a = rnd() * Math.PI * 2; const rr = 0.25 + r * 0.14; const o = ctx.part('osteocyte', new T.Mesh(ocGeo, ocMat)); o.position.set(x + Math.cos(a) * rr, (rnd() - 0.5) * 2, z + Math.sin(a) * rr); o.rotation.y = -a; }
      }
      ctx.part('canal', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.15, 0.15, 2.25, 16, 1, true)), ctx.mat(0x7f1d1d, { side: T.DoubleSide }))).position.set(x, 0, z);
      ctx.part('vessel', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.05, 0.05, 2.3, 8)), ctx.mat(0xef4444))).position.set(x - 0.05, 0, z);
      ctx.part('vessel', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.04, 0.04, 2.3, 8)), ctx.mat(0x3b82f6))).position.set(x + 0.06, 0, z + 0.03);
      if (ci === 0) S.focus = [x, z];
    });
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.5 + (ch === 'osteon' ? 0.5 * ease(t / 6) : 0), t * 0.06, 0);
    ctx.clip.constant = ch === 'osteon' ? 1.6 - 1.6 * ease(t / 6) : 50;
  }
};

// ---------- Neuron ----------
const neuron = {
  cameraDistance: 7.5,
  build(ctx) {
    const T = ctx.THREE; const S = {}; const rnd = seeded(31);
    const soma = ctx.part('soma', new T.Mesh(ctx.geo(new T.IcosahedronGeometry(0.55, 3)), ctx.mat(0xa78bfa))); soma.position.set(-2.4, 0, 0); soma.scale.set(1, 0.85, 0.85);
    ctx.part('soma', new T.Mesh(ctx.geo(new T.SphereGeometry(0.2, 16, 12)), ctx.mat(0x4c1d95))).position.set(-2.4, 0.05, 0.3);
    const dMat = ctx.mat(0x38bdf8);
    S.dendrites = [];
    for (let i = 0; i < 6; i++) {
      const a = Math.PI * 0.55 + (i / 5) * Math.PI * 0.9; const p0 = new T.Vector3(-2.4 + Math.cos(a) * 0.45, Math.sin(a) * 0.4, (rnd() - 0.5) * 0.5);
      const p1 = p0.clone().add(new T.Vector3(Math.cos(a) * 0.7, Math.sin(a) * 0.7, (rnd() - 0.5) * 0.6));
      const p2 = p1.clone().add(new T.Vector3(Math.cos(a + 0.4) * 0.5, Math.sin(a + 0.4) * 0.5, (rnd() - 0.5) * 0.4));
      const curve = new T.CatmullRomCurve3([p0, p1, p2]); S.dendrites.push(curve);
      ctx.part('dendrite', new T.Mesh(ctx.geo(new T.TubeGeometry(curve, 20, 0.06, 6)), dMat));
      const br = new T.CatmullRomCurve3([p1, p1.clone().add(new T.Vector3(Math.cos(a - 0.6) * 0.45, Math.sin(a - 0.6) * 0.45, 0))]);
      ctx.part('dendrite', new T.Mesh(ctx.geo(new T.TubeGeometry(br, 8, 0.04, 6)), dMat));
    }
    const axon = ctx.geo(new T.CylinderGeometry(0.07, 0.07, 4.6, 10)); axon.rotateZ(Math.PI / 2);
    ctx.part('axon', new T.Mesh(axon, ctx.mat(0xfbbf24))).position.set(0.45, 0, 0);
    const my = ctx.geo(new T.CylinderGeometry(0.17, 0.17, 0.6, 16)); my.rotateZ(Math.PI / 2);
    const myMat = ctx.mat(0xe2e8f0);
    for (let i = 0; i < 6; i++) ctx.part('myelin', new T.Mesh(my, myMat)).position.set(-1.25 + i * 0.68, 0, 0);
    const tMat = ctx.mat(0xfbbf24);
    for (let i = 0; i < 4; i++) { const a = -0.6 + i * 0.4; const tip = new T.CatmullRomCurve3([new T.Vector3(2.75, 0, 0), new T.Vector3(3.2, Math.sin(a) * 0.5, Math.cos(a) * 0.2)]); ctx.part('axon', new T.Mesh(ctx.geo(new T.TubeGeometry(tip, 6, 0.04, 6)), tMat)); ctx.part('axon', new T.Mesh(ctx.geo(new T.SphereGeometry(0.08, 8, 6)), tMat)).position.set(3.2, Math.sin(a) * 0.5, Math.cos(a) * 0.2); }
    S.pulse = ctx.part('signal', new T.Mesh(ctx.geo(new T.SphereGeometry(0.14, 12, 8)), ctx.mat(0x22d3ee, { clip: false })));
    S.pulse.material.emissive.setHex(0x0e7490);
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.clip.constant = 50; ctx.root.rotation.set(0.25, -0.25 + t * 0.03, 0);
    S.pulse.visible = ch === 'impulse';
    if (ch === 'impulse') {
      const u = loop(t, 6) ;
      if (u < 0.3) { S.pulse.position.copy(S.dendrites[2].getPoint(1 - u / 0.3)); }
      else if (u < 0.4) { S.pulse.position.set(-2.4, 0, 0); }
      else { const v = (u - 0.4) / 0.6; const nodeX = -1.6 + Math.floor(v * 7) * 0.68; S.pulse.position.set(Math.min(3.1, nodeX), 0, 0); } // jumps node to node
      S.pulse.material.emissive.setHex(0x0e7490);
    }
  }
};

// ---------- Joints ----------
const joints = {
  cameraDistance: 7.5,
  build(ctx) {
    const T = ctx.THREE; const S = {};
    const boneMat = ctx.mat(0xf5f5f4); const cart = ctx.mat(0xbae6fd); const capMat = ctx.mat(0x93c5fd, { opacity: 0.25, side: T.DoubleSide });
    // Ball and socket (left)
    S.bs = new T.Group(); S.bs.position.set(-1.7, 0, 0); ctx.root.add(S.bs);
    const socket = ctx.geo(new T.SphereGeometry(0.62, 32, 16, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5));
    ctx.part('ball', new T.Mesh(socket, ctx.mat(0xe7e5e4, { side: T.DoubleSide })), S.bs).position.y = 0.05;
    ctx.part('bone', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.5, 0.7, 0.6, 24)), boneMat), S.bs).position.y = -0.85;
    S.arm = new T.Group(); S.bs.add(S.arm);
    ctx.part('cartilage', new T.Mesh(ctx.geo(new T.SphereGeometry(0.5, 32, 24)), cart), S.arm);
    ctx.part('ball', new T.Mesh(ctx.geo(new T.SphereGeometry(0.47, 24, 16)), ctx.mat(0xfde68a)), S.arm);
    const shaft = ctx.part('bone', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.2, 0.24, 2.2, 16)), boneMat), S.arm); shaft.position.y = 1.4;
    ctx.part('capsule', new T.Mesh(ctx.geo(new T.SphereGeometry(0.78, 24, 16)), capMat), S.bs);
    // Hinge (right)
    S.hg = new T.Group(); S.hg.position.set(1.7, 0, 0); ctx.root.add(S.hg);
    const roll = ctx.geo(new T.CylinderGeometry(0.4, 0.4, 0.9, 24)); roll.rotateX(Math.PI / 2);
    ctx.part('hinge', new T.Mesh(roll, ctx.mat(0xfbbf24)), S.hg);
    ctx.part('bone', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.22, 0.26, 2.0, 16)), boneMat), S.hg).position.y = -1.3;
    S.fore = new T.Group(); S.hg.add(S.fore);
    const cup = ctx.geo(new T.CylinderGeometry(0.46, 0.46, 0.7, 24, 1, true, 0, Math.PI)); cup.rotateX(Math.PI / 2);
    ctx.part('cartilage', new T.Mesh(cup, ctx.mat(0xbae6fd, { side: T.DoubleSide })), S.fore).rotation.z = Math.PI / 2;
    ctx.part('bone', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.2, 0.22, 2.0, 16)), boneMat), S.fore).position.y = 1.4;
    ctx.part('capsule', new T.Mesh(ctx.geo(new T.SphereGeometry(0.66, 24, 16)), capMat), S.hg);
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.clip.constant = 50; ctx.root.rotation.set(0.15, -0.3 + (ch === 'overview' ? t * 0.05 : 0.2), 0);
    if (ch === 'motion') {
      S.arm.rotation.set(Math.sin(t * 0.8) * 0.7, t * 0.6, Math.cos(t * 0.8) * 0.7); // circumduction + rotation
      S.fore.rotation.set(0, 0, -Math.abs(Math.sin(t * 0.8)) * 1.6); // flexion in one plane only
    } else { S.arm.rotation.set(0, 0, 0.3); S.fore.rotation.set(0, 0, -0.5); }
  }
};

// ---------- Plant tissues ----------
const plantTissue = {
  cameraDistance: 7.5,
  build(ctx) {
    const T = ctx.THREE; const S = {}; const m4 = new T.Matrix4(); const rnd = seeded(41);
    // Meristem tip (top): dense small cubes in a dome
    const mg = ctx.geo(new T.BoxGeometry(0.17, 0.17, 0.17));
    const mer = new T.InstancedMesh(mg, ctx.mat(0x86efac), 160); let n = 0;
    for (let i = 0; i < 400 && n < 160; i++) { const x = (rnd() - 0.5) * 1.6; const z = (rnd() - 0.5) * 1.6; const y = rnd() * 0.9; if (x * x + z * z + (y * 1.2) ** 2 < 0.8) mer.setMatrixAt(n++, m4.makeTranslation(x, 1.4 + y, z)); }
    mer.count = n; ctx.part('meristem', mer);
    // Stem below: parenchyma ground, xylem (left, blue tubes), phloem (right, orange tubes)
    const parGeo = ctx.geo(new T.SphereGeometry(0.16, 8, 6));
    const par = new T.InstancedMesh(parGeo, ctx.mat(0xbef264, { opacity: 0.7 }), 90);
    for (let i = 0; i < 90; i++) { const a = rnd() * Math.PI * 2; const r = 0.75 + rnd() * 0.15; par.setMatrixAt(i, m4.makeTranslation(Math.cos(a) * r, -1.6 + rnd() * 2.8, Math.sin(a) * r)); }
    ctx.part('parenchyma', par);
    const xg = ctx.geo(new T.CylinderGeometry(0.14, 0.14, 3, 14, 1, true));
    S.xylemX = [-0.45, -0.15]; S.phloemX = [0.2, 0.45];
    S.xylemX.forEach((x, i) => ctx.part('xylem', new T.Mesh(xg, ctx.mat(0x60a5fa, { side: T.DoubleSide }))).position.set(x, -0.2, i * 0.3 - 0.15));
    const pg = ctx.geo(new T.CylinderGeometry(0.09, 0.09, 3, 10, 1, true));
    S.phloemX.forEach((x, i) => ctx.part('phloem', new T.Mesh(pg, ctx.mat(0xfb923c, { side: T.DoubleSide }))).position.set(x, -0.2, i * 0.3 - 0.15));
    for (let k = 0; k < 6; k++) for (const x of S.phloemX) ctx.part('phloem', new T.Mesh(ctx.geo(new T.CylinderGeometry(0.09, 0.09, 0.02, 10)), ctx.mat(0x9a3412))).position.set(x, -1.6 + k * 0.55, S.phloemX.indexOf(x) * 0.3 - 0.15);
    S.water = ctx.part('xylem', new T.InstancedMesh(ctx.geo(new T.SphereGeometry(0.06, 8, 6)), ctx.mat(0x0ea5e9, { clip: false }), 12));
    S.food = ctx.part('phloem', new T.InstancedMesh(ctx.geo(new T.BoxGeometry(0.08, 0.08, 0.08)), ctx.mat(0xfacc15, { clip: false }), 12));
    S.m4 = m4;
    return S;
  },
  apply(ctx, ch, t, S) {
    ctx.root.rotation.set(0.2, t * 0.07, 0); ctx.clip.constant = 1.0;
    const tr = ch === 'transport'; S.water.visible = tr; S.food.visible = tr;
    if (tr) {
      for (let i = 0; i < 12; i++) { const u = loop(t / 5 + i / 12, 1); S.water.setMatrixAt(i, S.m4.makeTranslation(S.xylemX[i % 2], -1.7 + u * 3, (i % 2) * 0.3 - 0.15)); }
      for (let i = 0; i < 12; i++) { const u = loop(t / 7 + i / 12, 1); const dir = i % 3 === 0 ? 1 : -1; S.food.setMatrixAt(i, S.m4.makeTranslation(S.phloemX[i % 2], dir > 0 ? -1.7 + u * 3 : 1.3 - u * 3, (i % 2) * 0.3 - 0.15)); }
      S.water.instanceMatrix.needsUpdate = true; S.food.instanceMatrix.needsUpdate = true;
    }
  }
};

export const tissueBuilders = { 'skeletal-muscle': muscle, epithelium, bone, neuron, joints, 'plant-tissue': plantTissue };
