const milestoneNames = ['hbl-shell-mounted', 'hbl-skeletal-ready', 'hbl-first-3d-ready', 'hbl-atlas-full-ready'];

function getSnapshot() {
  if (typeof window === 'undefined') return null;
  const snapshot = window.__HBL_PERF__ || { marks: {}, metrics: {}, resources: { anatomyChunks: 0, anatomyBytes: 0 } };
  window.__HBL_PERF__ = snapshot;
  return snapshot;
}

/**
 * Keep atlas decode/build timings local so a deployment can inspect real
 * device behavior without sending anatomy or learner data anywhere.
 */
export function recordAtlasChunkProfile(profile = {}) {
  const snapshot = getSnapshot();
  if (!snapshot || !Number.isInteger(profile.index)) return;
  snapshot.atlas = snapshot.atlas || { chunks: {}, errors: [] };
  snapshot.atlas.chunks[profile.index] = { ...profile };
  const profiles = Object.values(snapshot.atlas.chunks);
  snapshot.metrics.atlasChunksProfiled = profiles.length;
  snapshot.metrics.atlasDecodeMs = profiles.reduce((sum, item) => sum + Number(item.decodeMs || 0), 0);
  snapshot.metrics.atlasBuildMs = profiles.reduce((sum, item) => sum + Number(item.buildMs || 0), 0);
  snapshot.metrics.atlasLoadMs = profiles.reduce((sum, item) => sum + Number(item.totalMs || 0), 0);
}

export function recordAtlasChunkError(index, message = 'unknown error') {
  const snapshot = getSnapshot();
  if (!snapshot || !Number.isInteger(index)) return;
  snapshot.atlas = snapshot.atlas || { chunks: {}, errors: [] };
  snapshot.atlas.errors = [...snapshot.atlas.errors, { index, message: String(message) }].slice(-20);
}

export function startPerformanceTelemetry() {
  if (typeof window === 'undefined' || typeof performance === 'undefined' || typeof PerformanceObserver === 'undefined') return () => {};
  const snapshot = window.__HBL_PERF__ || { marks: {}, metrics: {}, resources: { anatomyChunks: 0, anatomyBytes: 0 } };
  window.__HBL_PERF__ = snapshot;

  const recordMilestones = () => {
    for (const name of milestoneNames) {
      const entry = performance.getEntriesByName(name, 'mark')[0];
      if (entry) snapshot.marks[name] = entry.startTime;
    }
    if (snapshot.marks['hbl-shell-mounted'] !== undefined && snapshot.marks['hbl-first-3d-ready'] !== undefined) {
      snapshot.metrics.shellToUsableAnatomy = snapshot.marks['hbl-first-3d-ready'] - snapshot.marks['hbl-shell-mounted'];
    }
  };
  recordMilestones();

  const supported = new Set(PerformanceObserver.supportedEntryTypes || []);
  const observers = [];
  const observe = (type, callback) => {
    if (!supported.has(type)) return;
    try {
      const observer = new PerformanceObserver((list) => callback(list.getEntries()));
      observer.observe({ type, buffered: true, ...(type === 'event' ? { durationThreshold: 40 } : {}) });
      observers.push(observer);
    } catch { /* metric availability varies by browser */ }
  };

  observe('mark', () => recordMilestones());
  observe('paint', (entries) => {
    for (const entry of entries) {
      if (entry.name === 'first-paint') snapshot.metrics.firstPaint = entry.startTime;
      if (entry.name === 'first-contentful-paint') snapshot.metrics.firstContentfulPaint = entry.startTime;
    }
  });
  observe('largest-contentful-paint', (entries) => { const entry = entries[entries.length - 1]; if (entry) snapshot.metrics.lcp = entry.startTime; });
  observe('layout-shift', (entries) => {
    snapshot.metrics.cls = (snapshot.metrics.cls || 0) + entries.filter((entry) => !entry.hadRecentInput).reduce((sum, entry) => sum + entry.value, 0);
  });
  observe('event', (entries) => {
    const worst = entries.reduce((max, entry) => Math.max(max, entry.duration || 0), snapshot.metrics.inp || 0);
    snapshot.metrics.inp = worst;
  });
  observe('resource', (entries) => {
    for (const entry of entries) {
      if (!/\/models\/body-\d+\.bin(?:\.gz)?$/.test(entry.name)) continue;
      snapshot.resources.anatomyChunks += 1;
      snapshot.resources.anatomyBytes += Number(entry.transferSize || entry.encodedBodySize || 0);
    }
  });

  return () => observers.forEach((observer) => observer.disconnect());
}
