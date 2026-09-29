// BVH (BioVision Hierarchy) parser for CMU-derived motion clips.
// Pure JS, no dependencies; usable in browser and node smoke tests.

export function parseBVH(text) {
  const tokens = text.split(/\s+/).filter(Boolean);
  let i = 0;
  const peek = () => tokens[i];
  const next = () => tokens[i++];
  const expect = (word) => {
    const got = next();
    if (got !== word) throw new Error(`BVH parse: expected ${word}, got ${got}`);
  };

  let jointCounter = 0;
  function parseJoint(isRoot) {
    const name = isRoot ? next() : next(); // ROOT <name> / JOINT <name>
    expect('{');
    const node = { name, id: jointCounter++, offset: [0, 0, 0], channels: [], children: [] };
    while (peek() !== '}') {
      const kw = next();
      if (kw === 'OFFSET') node.offset = [parseFloat(next()), parseFloat(next()), parseFloat(next())];
      else if (kw === 'CHANNELS') {
        const n = parseInt(next(), 10);
        for (let c = 0; c < n; c++) node.channels.push(next());
      } else if (kw === 'JOINT') node.children.push(parseJoint(false));
      else if (kw === 'End') {
        // End Site: consume offset-only block
        next(); expect('{'); expect('OFFSET');
        next(); next(); next(); expect('}');
      } else throw new Error(`BVH parse: unexpected ${kw}`);
    }
    expect('}');
    return node;
  }

  expect('HIERARCHY');
  expect('ROOT');
  const root = parseJoint(true);

  expect('MOTION');
  expect('Frames:');
  const frames = parseInt(next(), 10);
  expect('Frame');
  expect('Time:');
  const frameTime = parseFloat(next());

  const flat = [];
  let channelCount = 0;
  (function count(node) { channelCount += node.channels.length; node.children.forEach(count); })(root);
  const order = [];
  (function walk(node) { order.push(node); node.children.forEach(walk); })(root);

  const data = new Float32Array(frames * channelCount);
  for (let f = 0; f < frames; f++) for (let c = 0; c < channelCount; c++) data[f * channelCount + c] = parseFloat(next());

  return { root, order, channelCount, frames, frameTime, data };
}

// Channel values for one joint at one frame, as {axis -> degrees} in BVH channel order.
export function jointChannels(bvh, node, frame) {
  let base = frame * bvh.channelCount;
  for (const j of bvh.order) {
    if (j === node) break;
    base += j.channels.length;
  }
  const out = [];
  node.channels.forEach((ch, k) => out.push({ ch, deg: bvh.data[base + k] }));
  return out;
}
