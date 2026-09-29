/**
 * Device matrix pass: single source of truth for form factor, input modality,
 * and capability tier so CSS and the render pipeline adapt to modern devices —
 * flagship Android handsets, latest iPhones, tablets, laptops/desktops, and
 * 10-foot Android TV — instead of guessing from width alone.
 *
 * Form factor is resolved from viewport + pointer modality + TV signals:
 *  - tv      → living-room 10-foot UI (overscan margins, D-pad focus, big type)
 *  - phone   → compact coarse or narrow viewport
 *  - tablet  → coarse pointer on a wide viewport (iPads, Android tablets)
 *  - desktop → fine pointer laptops/desktops (MacBooks included)
 */

const TV_UA_PATTERN = /SmartTV|SMART-TV|Smart-TV|Android TV|GoogleTV|AppleTV|CrKey|Tizen|webOS|HbbTV|BRAVIA|FireTV|Roku|Nexus Player|Shield/i;

function media(query) {
  return typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false;
}

export function detectDeviceProfile() {
  const nav = typeof navigator !== 'undefined' ? navigator : {};
  const width = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const height = typeof window !== 'undefined' ? window.innerHeight : 800;
  const coarse = media('(pointer: coarse)');
  const canHover = media('(hover: hover)');
  const isTV = TV_UA_PATTERN.test(nav.userAgent || '');
  const isHandset = /Android.*Mobile|iPhone|iPod|Windows Phone/i.test(nav.userAgent || '');
  let formFactor = 'desktop';
  if (isTV) formFactor = 'tv';
  // A rotated handset stays a phone: handset UA or a compact minor axis wins.
  else if (isHandset || Math.min(width, height) < 480 || width < 700 || (coarse && width < 820)) formFactor = 'phone';
  else if (coarse || (width >= 700 && width < 1180 && !canHover)) formFactor = 'tablet';

  const cores = nav.hardwareConcurrency || 4;
  // deviceMemory is Chrome-only; assume capable defaults where it is absent
  // (Safari/Firefox desktops, iPads) instead of silently downgrading them.
  const memory = nav.deviceMemory ?? (coarse ? 4 : 8);
  const saveData = Boolean(nav.connection?.saveData);
  // Flagship handsets (S24-class, iPhone 15/16-class) get the richer tier;
  // TVs and constrained devices get the conservative one.
  const capable = !isTV && cores >= 8 && memory >= 8 && !saveData;

  return {
    formFactor,
    isTV,
    coarse,
    canHover,
    saveData,
    cores,
    memory,
    capable,
    lowPower: isTV || saveData || memory <= 2,
    width
  };
}

let cached = null;
export function getDeviceProfile() {
  if (!cached) cached = detectDeviceProfile();
  return cached;
}

export function invalidateDeviceProfile() {
  cached = null;
  return getDeviceProfile();
}

/** Re-stamp classes when the viewport or input modality changes (rotation,
 *  fold/unfold, window moves between monitors, TV input switches). */
export function watchDeviceProfileChanges(doc = document) {
  if (typeof window === 'undefined') return () => {};
  let timer = 0;
  const refresh = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => applyDeviceProfileClasses(doc), 150);
  };
  window.addEventListener('resize', refresh);
  window.addEventListener('orientationchange', refresh);
  return () => {
    window.clearTimeout(timer);
    window.removeEventListener('resize', refresh);
    window.removeEventListener('orientationchange', refresh);
  };
}

/** Stamp body classes early (called before first paint) so CSS adapts with no flash. */
export function applyDeviceProfileClasses(doc = document) {
  const profile = invalidateDeviceProfile();
  const body = doc?.body;
  if (!body) return profile;
  body.classList.remove('ff-phone', 'ff-tablet', 'ff-desktop', 'ff-tv', 'input-coarse', 'input-fine', 'hover-capable', 'device-capable', 'device-constrained');
  body.classList.add(`ff-${profile.formFactor}`);
  body.classList.add(profile.coarse ? 'input-coarse' : 'input-fine');
  if (profile.canHover) body.classList.add('hover-capable');
  body.classList.add(profile.capable ? 'device-capable' : 'device-constrained');
  return profile;
}
