// Derives short, origin-rebased, 30fps BVH embeds from the CMU mirror clips.
// These are transformed derivatives embedded in the app (never raw-resold),
// shipped with the CMU acknowledgment. Input files stay in vendor/ (not served).
import fs from 'node:fs';
import { parseBVH } from '../src/lib/kinesiology/bvh.js';

const SRC = 'vendor/kinesiology/raw/';
const OUT = 'src/data/kinesiology/';
fs.mkdirSync(OUT, { recursive: true });

function emit(bvh, from, to, step, rebase) {
  const frames = Math.floor((to - from) / step);
  const lines = [];
  const root = bvh.order[0];
  const posIdx = { x: root.channels.indexOf('Xposition'), z: root.channels.indexOf('Zposition') };
  let baseX = 0, baseZ = 0;
  if (rebase) {
    const b = from * bvh.channelCount;
    if (posIdx.x >= 0) baseX = bvh.data[b + posIdx.x];
    if (posIdx.z >= 0) baseZ = bvh.data[b + posIdx.z];
  }
  for (let f = 0; f < frames; f++) {
    const src = from + f * step;
    const vals = [];
    for (let c = 0; c < bvh.channelCount; c++) {
      let v = bvh.data[src * bvh.channelCount + c];
      if (c === posIdx.x) v -= baseX;
      if (c === posIdx.z) v -= baseZ;
      vals.push(v.toFixed(3));
    }
    lines.push(vals.join(' '));
  }
  return { frames, lines };
}

function derive(file, pick, outName) {
  const text = fs.readFileSync(SRC + file, 'utf8');
  const hierarchyText = text.slice(0, text.indexOf('MOTION'));
  const bvh = parseBVH(text);
  const { from, to } = pick(bvh);
  const step = Math.max(1, Math.round(1 / (30 * bvh.frameTime)));
  const { frames, lines } = emit(bvh, from, to, step, true);
  const out = `${hierarchyText}MOTION\nFrames: ${frames}\nFrame Time: ${(1 / 30).toFixed(5)}\n${lines.join('\n')}\n`;
  fs.writeFileSync(OUT + outName, out);
  console.log(outName, frames, 'frames', (out.length / 1024).toFixed(0) + 'KB');
}

// Walk: steady middle window of 11_01.
derive('11_01.bvh', (bvh) => ({ from: 60, to: Math.min(bvh.frames, 60 + Math.round(4 / bvh.frameTime)) }), 'walk_cmu.bvh');

// Jump: find the window with maximal root vertical range in 14_06.
{
  const text = fs.readFileSync(SRC + '14_06.bvh', 'utf8');
  const bvh = parseBVH(text);
  const root = bvh.order[0];
  const yIdx = root.channels.indexOf('Yposition');
  const win = Math.round(3 / bvh.frameTime);
  let best = 0, bestAt = 0;
  for (let f = 0; f < bvh.frames - win; f += 10) {
    let mn = Infinity, mx = -Infinity;
    for (let k = f; k < f + win; k += 2) {
      const y = bvh.data[k * bvh.channelCount + yIdx];
      mn = Math.min(mn, y); mx = Math.max(mx, y);
    }
    if (mx - mn > best) { best = mx - mn; bestAt = f; }
  }
  const hierarchyText = text.slice(0, text.indexOf('MOTION'));
  const { frames, lines } = emit(bvh, bestAt, Math.min(bvh.frames, bestAt + win), Math.max(1, Math.round(1 / (30 * bvh.frameTime))), true);
  const out = `${hierarchyText}MOTION\nFrames: ${frames}\nFrame Time: ${(1 / 30).toFixed(5)}\n${lines.join('\n')}\n`;
  fs.writeFileSync(OUT + 'jump_cmu.bvh', out);
  console.log('jump_cmu.bvh', frames, 'frames', (out.length / 1024).toFixed(0) + 'KB', 'vertical range', best.toFixed(1));
}
