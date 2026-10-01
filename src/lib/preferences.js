// Foundation (Section 0): learner preferences shared by every learning bay.
// Decisions: D3/D20 language toggle in Settings, D18 Auto/Light/Dark theme,
// D23 default level Class 9, C10-1/R1 curriculum track (default WBBSE).
// Pure module: no React import, so Node smoke scripts can test it directly.

export const PREFERENCE_SCHEMA = {
  theme: { key: 'hbl-theme', values: ['auto', 'light', 'dark'], fallback: 'auto' },
  language: { key: 'hbl-language', values: ['en', 'bn'], fallback: 'en' },
  curriculum: { key: 'hbl-curriculum', values: ['wbbse', 'ncert'], fallback: 'wbbse' },
  level: { key: 'hbl-level', values: ['class9', 'class10', 'class11-12', 'neet'], fallback: 'class9' },
  graphics: { key: 'hbl-graphics', values: ['full', 'low'], fallback: 'full' },
  textScale: { key: 'hbl-text-scale', values: ['100', '115', '130'], fallback: '100' }
};

// Depth ladder (cross-cutting plan): each level includes everything below it.
export const LEVEL_ORDER = ['class9', 'class10', 'class11-12', 'neet'];
export function levelIncludes(activeLevel, contentLevel) {
  return LEVEL_ORDER.indexOf(contentLevel) <= LEVEL_ORDER.indexOf(activeLevel);
}

function storage() {
  try { return typeof window !== 'undefined' ? window.localStorage : null; } catch { return null; }
}

export function sanitizePreference(name, value) {
  const spec = PREFERENCE_SCHEMA[name];
  if (!spec) throw new Error(`Unknown preference: ${name}`);
  return spec.values.includes(value) ? value : spec.fallback;
}

export function readPreference(name) {
  const spec = PREFERENCE_SCHEMA[name];
  let raw = null;
  try { raw = storage()?.getItem(spec.key) ?? null; } catch { raw = null; }
  return sanitizePreference(name, raw);
}

export function writePreference(name, value) {
  const clean = sanitizePreference(name, value);
  try { storage()?.setItem(PREFERENCE_SCHEMA[name].key, clean); } catch { /* storage may be blocked */ }
  return clean;
}

export function readAllPreferences() {
  return Object.fromEntries(Object.keys(PREFERENCE_SCHEMA).map((name) => [name, readPreference(name)]));
}

export function resolveTheme(theme, prefersDark) {
  if (theme === 'light' || theme === 'dark') return theme;
  return prefersDark ? 'dark' : 'light';
}

// Stamp preferences on <html> so CSS tokens switch before React paints.
export function applyPreferencesToDocument(prefs, doc = typeof document !== 'undefined' ? document : null) {
  if (!doc) return;
  const root = doc.documentElement;
  const prefersDark = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
  const resolved = resolveTheme(prefs.theme, prefersDark ?? true);
  root.dataset.theme = resolved;
  root.dataset.themePreference = prefs.theme;
  root.style.colorScheme = resolved;
  root.lang = prefs.language === 'bn' ? 'bn' : 'en';
  root.dataset.curriculum = prefs.curriculum;
  root.dataset.level = prefs.level;
  root.dataset.graphics = prefs.graphics;
  root.style.setProperty('--user-text-scale', String(Number(prefs.textScale) / 100));
  const meta = doc.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', resolved === 'dark' ? '#08111c' : '#f7f5f0');
}
