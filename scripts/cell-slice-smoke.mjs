// Cell bay vertical slice gate: Mitochondrion content accuracy & bilingual hygiene.
import assert from 'node:assert/strict';
import { mitochondrionChapters, mitochondrionClaims, mitochondrionMisconceptions, mitochondrionParts, mitochondrionQuiz, MITO_LIMITATION } from '../src/data/cell/mitochondrion.js';
import { organellePacks } from '../src/data/cell/organellePacks.js';
import { readFileSync } from 'node:fs';
import { STRINGS_CELL } from '../src/data/cell/strings.js';
import { validateClaims } from '../src/lib/claims.js';
import { LEVEL_ORDER, levelIncludes } from '../src/lib/preferences.js';

let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; };

// Bengali hygiene: English digits; Latin allowed only for symbols/units/abbreviations or inside (parentheses).
const LATIN_OK = /\b(ATP|ADP|DNA|RNA|mRNA|tRNA|rRNA|70S|80S|60S|50S|40S|30S|S|F0|F1|H|Na|K|O2|CO2|ER|pH|NCERT|NEET|µm|nm|bp|rev|s)\b/g;
function checkBn(text, where) {
  ok(typeof text === 'string' && text.length > 0, `${where}: missing bn`);
  ok(!/[০-৯]/.test(text), `${where}: Bengali digits (D26)`);
  const stripped = text.replace(/\([^)]*\)/g, '').replace(LATIN_OK, '');
  ok(!/[A-Za-z]{2,}/.test(stripped), `${where}: Latin word outside parentheses: "${text}"`);
  ok(/[\u0980-\u09FF]/.test(text) || /^[A-Za-z0-9 +.%/–-]+$/.test(text), `${where}: no Bengali script`);
}
const pair = (obj, where) => { ok(obj?.en, `${where}: missing en`); checkBn(obj?.bn, where); };

ok(validateClaims(mitochondrionClaims).length === 0, validateClaims(mitochondrionClaims).join('\n'));
mitochondrionClaims.forEach((c) => checkBn(c.text.bn, c.id));
const claimIds = new Set(mitochondrionClaims.map((c) => c.id));

mitochondrionChapters.forEach((c) => {
  ok(c.duration > 0 && c.duration <= 30, `${c.id}: chapter must be ≤30 s (D17)`);
  pair(c.title, `chapter ${c.id} title`); pair(c.caption, `chapter ${c.id} caption`);
  ok(LEVEL_ORDER.includes(c.level), `${c.id}: level`);
});
mitochondrionParts.forEach((p) => {
  ['name', 'what', 'deep'].forEach((k) => pair(p[k], `part ${p.id}.${k}`));
  ok(LEVEL_ORDER.indexOf(p.deepLevel) >= LEVEL_ORDER.indexOf(p.level), `${p.id}: deep level must not precede intro level`);
});
mitochondrionMisconceptions.forEach((m, i) => { pair(m.wrong, `myth ${i}`); pair(m.right, `myth ${i}`); });
mitochondrionQuiz.forEach((q) => {
  pair(q.q, q.id);
  ok(q.options.length === 4, `${q.id}: 4 options`);
  q.options.forEach((o, i) => pair(o, `${q.id} option ${i}`));
  ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4, `${q.id}: answer index`);
  ok(claimIds.has(q.claim), `${q.id}: must cite an existing claim`);
  ok(LEVEL_ORDER.indexOf(mitochondrionClaims.find((c) => c.id === q.claim).level) <= LEVEL_ORDER.indexOf(q.level) + 1, `${q.id}: claim level too deep for question`);
});
pair(MITO_LIMITATION, 'limitation');

// Every level gets content; Class 9 (default, D23) has chapters, parts and quiz items.
for (const lvl of LEVEL_ORDER) {
  ok(mitochondrionChapters.some((c) => levelIncludes(lvl, c.level)), `${lvl}: no chapter`);
  ok(mitochondrionQuiz.filter((q) => levelIncludes(lvl, q.level)).length >= 3, `${lvl}: needs ≥3 quiz items`);
  ok(mitochondrionParts.filter((p) => levelIncludes(lvl, p.level)).length >= 4, `${lvl}: needs ≥4 parts`);
}

// UI string parity.
ok(JSON.stringify(Object.keys(STRINGS_CELL.en).sort()) === JSON.stringify(Object.keys(STRINGS_CELL.bn).sort()), 'STRINGS_CELL en/bn keys differ');
Object.entries(STRINGS_CELL.bn).forEach(([k, v]) => checkBn(v, `STRINGS_CELL.${k}`));

// Scientific spot checks pinned to sources (guards against accidental edits).
const byId = Object.fromEntries(mitochondrionClaims.map((c) => [c.id, c]));
ok(byId['cell.mito.size'].range[0] === 0.2 && byId['cell.mito.size'].range[1] === 1.0, 'NCERT XI diameter 0.2–1.0 µm');
ok(byId['cell.mito.human-mtdna'].value === 16569, 'Anderson 1981: 16,569 bp');
ok(byId['cell.mito.atpase-rotation'].range[1] <= 150, 'ATP synthase ≤150 rev/s');
ok(/38/.test(byId['cell.mito.atp-yield'].text.en) && /30–32/.test(byId['cell.mito.atp-yield'].text.en), 'ATP yield shows NCERT 38 and measured 30–32');

// All organelle packs: same rules as the mitochondrion slice.
const builderSrc = readFileSync(new URL('../src/lib/cell/organelleBuilders.js', import.meta.url), 'utf8');
const allIds = new Set();
for (const pk of organellePacks) {
  ok(!allIds.has(pk.id), `${pk.id}: duplicate pack`); allIds.add(pk.id);
  ok(['animal', 'plant', 'both'].includes(pk.cell), `${pk.id}: cell type`);
  ok(builderSrc.includes(pk.id === 'wall-vacuole' ? "'wall-vacuole'" : pk.id === 'mitochondrion' ? 'mitochondrion:' : `${pk.id}`), `${pk.id}: needs a 3D builder`);
  pair(pk.title, `${pk.id} title`); pair(pk.lead, `${pk.id} lead`); pair(pk.limitation, `${pk.id} limitation`);
  const errs = validateClaims(pk.claims); ok(errs.length === 0, errs.join('\n'));
  pk.claims.forEach((c) => { ok(!allIds.has(`claim:${c.id}`), `duplicate claim ${c.id}`); allIds.add(`claim:${c.id}`); checkBn(c.text.bn, c.id); });
  const ids = new Set(pk.claims.map((c) => c.id));
  pk.chapters.forEach((c) => { ok(c.duration > 0 && c.duration <= 30, `${pk.id}/${c.id} ≤30 s`); pair(c.title, `${pk.id}/${c.id}`); pair(c.caption, `${pk.id}/${c.id}`); });
  pk.parts.forEach((p) => { ['name', 'what', 'deep'].forEach((k) => pair(p[k], `${pk.id}/${p.id}.${k}`)); ok(LEVEL_ORDER.indexOf(p.deepLevel) >= LEVEL_ORDER.indexOf(p.level), `${pk.id}/${p.id} deep level`); });
  pk.myths.forEach((m, i) => { pair(m.wrong, `${pk.id} myth ${i}`); pair(m.right, `${pk.id} myth ${i}`); });
  pk.quiz.forEach((qq) => { pair(qq.q, qq.id); ok(qq.options.length === 4 && qq.answer >= 0 && qq.answer < 4, `${qq.id} options`); qq.options.forEach((o, i) => pair(o, `${qq.id}.${i}`)); ok(ids.has(qq.claim), `${qq.id} cites unknown claim ${qq.claim}`); });
  ok(pk.chapters.some((c) => c.level === 'class9'), `${pk.id}: Class 9 chapter (default level)`);
  ok(pk.quiz.filter((qq) => qq.level === 'class9').length >= 3, `${pk.id}: ≥3 Class 9 quiz items`);
  ok(pk.parts.filter((p) => p.level === 'class9').length >= 2, `${pk.id}: ≥2 Class 9 parts`);
}
ok(organellePacks.length >= 8, 'Cell bay covers ≥8 organelle packs');
ok(!JSON.stringify(organellePacks).toLowerCase().includes('water potential'), 'water potential removed (D8)');

console.log(`cell slice smoke: ${n} checks passed`);
