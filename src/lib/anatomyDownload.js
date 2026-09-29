export const ATLAS_CACHE_NAME = 'hbl-atlas-bodyparts3d-4-0';

async function readManifest(manifestUrl = '/models/atlas.json', signal) {
  const response = await fetch(manifestUrl, { signal, cache: 'no-store' });
  if (!response.ok) throw new Error(`Anatomy manifest download failed (${response.status}).`);
  return response.json();
}

export async function getAnatomyDownloadEstimate({ manifestUrl = '/models/atlas.json', signal } = {}) {
  const manifest = await readManifest(manifestUrl, signal);
  const chunks = manifest.chunks || [];
  return {
    version: manifest.version || 'unknown',
    chunks: chunks.length,
    bytes: chunks.reduce((sum, chunk) => sum + Number(chunk.gzipBytes || chunk.bytes || 0), 0),
    label: 'compressed anatomy data'
  };
}

export async function downloadAnatomyForOffline({ manifestUrl = '/models/atlas.json', signal, onProgress } = {}) {
  if (typeof caches === 'undefined') throw new Error('This browser does not support offline anatomy storage.');
  const manifest = await readManifest(manifestUrl, signal);
  const chunks = manifest.chunks || [];
  const cache = await caches.open(ATLAS_CACHE_NAME);
  const totalBytes = chunks.reduce((sum, chunk) => sum + Number(chunk.gzipBytes || chunk.bytes || 0), 0);
  let completedBytes = 0;
  let completedChunks = 0;
  onProgress?.({ status: 'downloading', totalBytes, completedBytes, completedChunks, totalChunks: chunks.length, percent: 0 });

  // Two concurrent downloads give mobile browsers a predictable storage and
  // radio workload without turning an explicit offline action into a flood.
  for (let cursor = 0; cursor < chunks.length; cursor += 2) {
    const batch = chunks.slice(cursor, cursor + 2).map(async (chunk) => {
      if (signal?.aborted) throw new DOMException('Download cancelled.', 'AbortError');
      const requestUrl = chunk.gzip || chunk.url;
      const request = new Request(requestUrl);
      const cached = await cache.match(request);
      if (!cached) {
        const response = await fetch(request, { signal, cache: 'no-store' });
        if (!response.ok) throw new Error(`Anatomy chunk download failed (${response.status}).`);
        await cache.put(request, response.clone());
      }
      completedBytes += Number(chunk.gzipBytes || chunk.bytes || 0);
      completedChunks += 1;
      onProgress?.({ status: 'downloading', totalBytes, completedBytes, completedChunks, totalChunks: chunks.length, percent: totalBytes ? Math.round((completedBytes / totalBytes) * 100) : Math.round((completedChunks / chunks.length) * 100) });
    });
    await Promise.all(batch);
  }
  const result = { status: 'complete', version: manifest.version || 'unknown', totalBytes, totalChunks: chunks.length, completedBytes: totalBytes, completedChunks: chunks.length, percent: 100 };
  onProgress?.(result);
  return result;
}

export async function clearAnatomyOfflineDownload() {
  if (typeof caches === 'undefined') return false;
  return caches.delete(ATLAS_CACHE_NAME);
}
