// Foundation: automatic light theme (D18 "auto-adjust colours", D21 OKLCH, R3 tint).
// src/styles.css was authored dark-only with ~1000 hard-coded colours. Instead of
// hand-editing every rule, this script parses the stylesheet and emits a mirror
// rule under :root[data-theme="light"] for every colour-bearing declaration.
// Each colour is converted to OKLCH and its lightness is inverted on a fitted
// curve (dark surface L 0.16 → 0.97, body text L 0.96 → 0.20), hue is kept so
// biological colour coding stays recognisable, near-neutral surfaces get the
// R3 warm tint (h 85), and chroma is reduced until the colour fits sRGB.
// Usage: node scripts/generate-light-theme.mjs [--check]
import { readFileSync, writeFileSync } from 'node:fs';

const SRC = new URL('../src/styles.css', import.meta.url);
const OUT = new URL('../src/theme-light.generated.css', import.meta.url);

// ---------- colour maths (OKLab, Björn Ottosson 2020) ----------
const toLin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLin = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
export function rgbToOklch([r, g, b]) {
  const [R, G, B] = [r, g, b].map((v) => toLin(v / 255));
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L, Math.hypot(a, bb), ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360];
}
export function oklchToRgb([L, C, H]) {
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const R = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const G = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const B = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  return [R, G, B].map((v) => fromLin(v) * 255);
}
const inGamut = (rgb) => rgb.every((v) => v >= -0.5 && v <= 255.5);

export function lightenForLightTheme(rgb) {
  let [L, C, H] = rgbToOklch(rgb);
  let L2 = Math.min(0.985, Math.max(0.16, 1.124 - 0.9625 * L));
  let C2 = C;
  // Accents (vivid hues) stay mid-tone so they keep their identity and still
  // reach >= 4.5:1 on the off-white surface.
  if (C >= 0.08 && L >= 0.45) L2 = Math.min(0.56, Math.max(0.45, L2));
  // Mid greys used for secondary text are pulled down to stay WCAG AA.
  if (C < 0.08 && L2 > 0.5 && L2 <= 0.85) L2 = 0.5;
  if (L2 > 0.85) {
    if (C < 0.06) { C2 = 0.006; H = 85; } // neutral surfaces: R3 warm off-white
    else C2 = C * 0.45; // tinted surfaces stay soft
  }
  let out = oklchToRgb([L2, C2, H]);
  while (!inGamut(out) && C2 > 0.001) { C2 *= 0.92; out = oklchToRgb([L2, C2, H]); }
  return out.map((v) => Math.round(Math.min(255, Math.max(0, v))));
}

// ---------- colour token rewriting ----------
const hex = (n) => n.toString(16).padStart(2, '0');
function parseHex(h) {
  let s = h.slice(1);
  if (s.length === 3 || s.length === 4) s = [...s].map((c) => c + c).join('');
  const rgb = [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
  const alpha = s.length === 8 ? parseInt(s.slice(6, 8), 16) : null;
  return { rgb, alpha };
}
const COLOR_RE = /#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3,4}\b|rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*(?:,\s*[\d.%]+\s*)?\)|\b(?:white|black)\b/g;
export function mapValue(value) {
  return value.replace(COLOR_RE, (tok) => {
    if (tok === 'white') return `#${lightenForLightTheme([255, 255, 255]).map(hex).join('')}`;
    if (tok === 'black') return `#${lightenForLightTheme([0, 0, 0]).map(hex).join('')}`;
    if (tok.startsWith('#')) {
      const { rgb, alpha } = parseHex(tok);
      return `#${lightenForLightTheme(rgb).map(hex).join('')}${alpha === null ? '' : hex(alpha)}`;
    }
    const nums = tok.match(/[\d.]+%?/g);
    const [r, g, b] = lightenForLightTheme(nums.slice(0, 3).map(Number));
    return nums[3] !== undefined ? `rgba(${r},${g},${b},${nums[3]})` : `rgb(${r},${g},${b})`;
  });
}

// ---------- minimal CSS walker (rules, @media/@supports/@container nesting) ----------
const COLOR_PROPS = /^(?:color|background(?:-color|-image)?|border(?:-(?:top|right|bottom|left))?(?:-color)?|outline(?:-color)?|box-shadow|text-shadow|fill|stroke|caret-color|accent-color|text-decoration-color|column-rule-color|--[\w-]+)$/;
function prefixSelector(sel) {
  return sel.split(',').map((part) => {
    const p = part.trim();
    if (!p) return p;
    if (/^(?::root|html)\b/.test(p)) return p.replace(/^(?::root|html)/, ':root[data-theme="light"]');
    return `:root[data-theme="light"] ${p}`;
  }).join(', ');
}
function splitDecls(body) {
  const out = []; let depth = 0; let cur = '';
  for (const ch of body) {
    if (ch === '(') depth++; if (ch === ')') depth--;
    if (ch === ';' && depth === 0) { out.push(cur); cur = ''; } else cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out;
}
function walk(css) {
  let i = 0; const out = [];
  const stripComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const src = stripComments;
  function block() {
    const parts = [];
    while (i < src.length) {
      const next = src.indexOf('{', i); const close = src.indexOf('}', i);
      if (close !== -1 && (next === -1 || close < next)) { i = close + 1; return parts; }
      if (next === -1) { i = src.length; return parts; }
      const prelude = src.slice(i, next).trim(); i = next + 1;
      if (prelude.startsWith('@keyframes') || prelude.startsWith('@font-face') || prelude.startsWith('@-webkit-keyframes')) {
        let d = 1; while (i < src.length && d) { if (src[i] === '{') d++; else if (src[i] === '}') d--; i++; }
        continue;
      }
      if (prelude.startsWith('@')) { const inner = block(); if (inner.length) parts.push(`${prelude} {\n${inner.join('\n')}\n}`); continue; }
      const end = src.indexOf('}', i); const body = src.slice(i, end); i = end + 1;
      const decls = splitDecls(body).map((d) => {
        const k = d.indexOf(':'); if (k < 0) return null;
        const prop = d.slice(0, k).trim(); const val = d.slice(k + 1).trim();
        if (!COLOR_PROPS.test(prop)) return null;
        COLOR_RE.lastIndex = 0;
        if (!COLOR_RE.test(val)) return null;
        return `${prop}: ${mapValue(val)}`;
      }).filter(Boolean);
      if (decls.length) parts.push(`${prefixSelector(prelude)} { ${decls.join('; ')} }`);
    }
    return parts;
  }
  out.push(...block());
  return out;
}

const header = '/* AUTO-GENERATED by scripts/generate-light-theme.mjs — do not edit by hand.\n   Light theme mirror of src/styles.css (OKLCH lightness inversion, R3 warm tint). */\n';
const css = header + walk(readFileSync(SRC, 'utf8')).join('\n') + '\n';
if (process.argv.includes('--check')) {
  const current = readFileSync(OUT, 'utf8');
  if (current !== css) { console.error('theme-light.generated.css is stale: run node scripts/generate-light-theme.mjs'); process.exit(1); }
  console.log('light theme up to date');
} else if (import.meta.url === `file://${process.argv[1]}`) {
  writeFileSync(OUT, css);
  console.log(`wrote ${OUT.pathname} (${css.length} bytes, ${css.split('\n').length} rules)`);
}
