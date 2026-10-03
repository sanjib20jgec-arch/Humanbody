// Foundation gate (Section 0): preferences, i18n, accuracy claims, light theme.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { PREFERENCE_SCHEMA, sanitizePreference, resolveTheme, levelIncludes } from '../src/lib/preferences.js';
import { STRINGS, translate, formatNumber } from '../src/lib/i18n.js';
import { validateClaims } from '../src/lib/claims.js';
import { foundationClaims } from '../src/data/claims/foundationClaims.js';
import { modules } from '../src/data/modules.js';
import { localizeModule, localizeObjectives } from '../src/data/moduleText.bn.js';
import { rgbToOklch, oklchToRgb } from './generate-light-theme.mjs';

let checks = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); checks++; };

// 1. Defaults decided with the owner.
ok(PREFERENCE_SCHEMA.level.fallback === 'class9', 'default level must be Class 9 (D23)');
ok(PREFERENCE_SCHEMA.curriculum.fallback === 'wbbse', 'default curriculum must be WBBSE (R1)');
ok(PREFERENCE_SCHEMA.theme.fallback === 'auto', 'default theme must be Auto (D18)');
ok(sanitizePreference('theme', 'neon') === 'auto', 'invalid values fall back');
ok(resolveTheme('auto', true) === 'dark' && resolveTheme('auto', false) === 'light', 'auto follows OS');
ok(levelIncludes('class10', 'class9') && !levelIncludes('class9', 'neet'), 'depth ladder');

// 2. i18n parity, formal Bengali hygiene, English digits.
const en = Object.keys(STRINGS.en).sort();
const bn = Object.keys(STRINGS.bn).sort();
const hi = Object.keys(STRINGS.hi).sort();
ok(JSON.stringify(en) === JSON.stringify(bn), `en/bn keys differ: ${en.filter((k) => !bn.includes(k)).concat(bn.filter((k) => !en.includes(k)))}`);
ok(JSON.stringify(en) === JSON.stringify(hi), `en/hi keys differ: ${en.filter((k) => !hi.includes(k)).concat(hi.filter((k) => !en.includes(k)))}`);
const ALLOWED_LATIN = /\b(WBBSE|NCERT|CBSE|NEET|2D|3D|ms|L|mOsm|kg|h|LH)\b/g;
for (const [k, v] of Object.entries(STRINGS.bn)) {
  ok(!/[০-৯]/.test(v), `${k}: Bengali digits not allowed (D26)`);
  ok(!/[A-Za-z]{2,}/.test(v.replace(ALLOWED_LATIN, '')), `${k}: Latin words in Bengali text (no Banglish): "${v}"`);
  ok(v.trim().length > 0, `${k}: empty`);
}
ok(translate('bn', 'missing.key', 'fb') === 'fb', 'fallback works');
ok(translate('hi', 'settings.language') === 'भाषा', 'Hindi translation lookup works');
ok(PREFERENCE_SCHEMA.language.values.includes('hi') && sanitizePreference('language', 'hi') === 'hi', 'Hindi language preference is accepted');
ok(/^[0-9,]+$/.test(formatNumber(123456)), 'numbers use English digits');
for (const module of modules) {
  const localized = localizeModule(module, 'hi');
  ok(localized.title !== module.title, `Hindi module title missing: ${module.id}`);
  ok(localized.description && /[\u0900-\u097F]/.test(localized.description), `Hindi module description missing: ${module.id}`);
  const objectives = localizeObjectives(module.id, [], 'hi');
  ok(Array.isArray(objectives), `Hindi objectives must be an array: ${module.id}`);
}

// 3. Accuracy claims.
const claimErrors = validateClaims(foundationClaims);
ok(claimErrors.length === 0, `claim errors:\n${claimErrors.join('\n')}`);

// 4. Light theme generated file is current, and key token pairs meet WCAG AA.
execFileSync(process.execPath, ['scripts/generate-light-theme.mjs', '--check'], { stdio: 'inherit' });
checks++;
const lum = (h) => { const n = h.replace('#', ''); const c = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const gen = readFileSync('src/theme-light.generated.css', 'utf8');
const tok = (name, css) => (css.match(new RegExp(`${name}:\\s*(#[0-9a-f]{6})`)) || [])[1];
const theme = readFileSync('src/theme.css', 'utf8');
const lightBg = tok('--bg', theme.slice(theme.indexOf(':root[data-theme="light"] {')));
const lightPanel = tok('--panel', theme.slice(theme.indexOf(':root[data-theme="light"] {')));
const lightText = tok('--text', theme.slice(theme.indexOf(':root[data-theme="light"] {')));
for (const [fg, name] of [[lightText, '--text'], [tok('--muted', gen), '--muted'], [tok('--faint', gen), '--faint'], [tok('--cyan', gen), '--cyan'], [tok('--purple', gen), '--purple'], [tok('--red', gen), '--red']]) {
  for (const bg of [lightBg, lightPanel]) {
    const c = contrast(fg, bg);
    ok(c >= 4.5, `light ${name} ${fg} on ${bg} contrast ${c.toFixed(2)} < 4.5 (WCAG AA)`);
  }
}
const dark = readFileSync('src/styles.css', 'utf8').slice(0, 600);
ok(contrast(tok('--text', dark), tok('--bg', dark)) >= 4.5, 'dark text contrast');
const [L] = rgbToOklch([255, 255, 255]); ok(Math.abs(L - 1) < 1e-3, 'oklab white L=1');
ok(oklchToRgb(rgbToOklch([18, 97, 101])).every((v, i) => Math.abs(v - [18, 97, 101][i]) < 0.5), 'oklch round trip');

console.log(`foundation smoke: ${checks} checks passed`);
