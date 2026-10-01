// Generic deep-dive pack gate for every bay using DeepDiveExplorer (Tissues onward).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateClaims } from '../src/lib/claims.js';
import { LEVEL_ORDER } from '../src/lib/preferences.js';

const BAYS = [
  { name: 'tissues', packs: '../src/data/tissues/tissuePacks.js', key: 'tissuePacks', builders: '../src/lib/tissues/tissueBuilders.js', min: 6 },
  { name: 'digestion', packs: '../src/data/digestion/digestionPacks.js', key: 'digestionPacks', builders: '../src/lib/digestion/digestionBuilders.js', min: 5 },
  { name: 'circulation', packs: '../src/data/circulation/circulationPacks.js', key: 'circulationPacks', builders: '../src/lib/circulation/circulationBuilders.js', min: 5 },
  { name: 'nervous', packs: '../src/data/nervous/nervousPacks.js', key: 'nervousPacks', builders: '../src/lib/nervous/nervousBuilders.js', min: 6 },
  { name: 'respiration', packs: '../src/data/respiration/respirationPacks.js', key: 'respirationPacks', builders: '../src/lib/respiration/respirationBuilders.js', min: 4 },
  { name: 'excretion', packs: '../src/data/excretion/excretionPacks.js', key: 'excretionPacks', builders: '../src/lib/excretion/excretionBuilders.js', min: 4 },
];
let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; };
const LATIN_OK = /\b(ATP|ADP|DNA|RNA|SA|AV|ADH|pO2|pCO2|Hg|mL|L|Ca2|Ca|Na|K|O2|CO2|pH|NCERT|NEET|WBBSE|µm|nm|mm|cm|m|s|ms|3D|A|I|H|Z)\b/g;
function checkBn(text, where) {
  ok(typeof text === 'string' && text.length > 0, `${where}: missing bn`);
  ok(!/[০-৯]/.test(text), `${where}: Bengali digits (D26)`);
  const stripped = text.replace(/\([^)]*\)/g, '').replace(LATIN_OK, '');
  ok(!/[A-Za-z]{2,}/.test(stripped), `${where}: Latin word outside parentheses: "${text}"`);
}
const pair = (o, w) => { ok(o?.en, `${w}: missing en`); checkBn(o?.bn, w); };

for (const bay of BAYS) {
  const packs = (await import(bay.packs))[bay.key];
  const src = readFileSync(new URL(bay.builders, import.meta.url), 'utf8');
  const { [Object.keys(await import(bay.builders))[0]]: builders } = await import(bay.builders);
  ok(packs.length >= bay.min, `${bay.name}: ≥${bay.min} packs`);
  const seen = new Set(); let nClass9 = 0;
  for (const pk of packs) {
    ok(!seen.has(pk.id), `${pk.id} duplicate`); seen.add(pk.id);
    ok(typeof builders[pk.id]?.build === 'function' && typeof builders[pk.id]?.apply === 'function', `${pk.id}: builder`);
    pair(pk.title, `${pk.id} title`); pair(pk.lead, `${pk.id} lead`); pair(pk.limitation, `${pk.id} limitation`);
    if (pk.tag) pair(pk.tag, `${pk.id} tag`);
    const errs = validateClaims(pk.claims); ok(errs.length === 0, errs.join('\n'));
    pk.claims.forEach((c) => { ok(!seen.has(`c:${c.id}`), `dup claim ${c.id}`); seen.add(`c:${c.id}`); checkBn(c.text.bn, c.id); });
    const ids = new Set(pk.claims.map((c) => c.id));
    pk.chapters.forEach((c) => { ok(c.duration > 0 && c.duration <= 30, `${pk.id}/${c.id} ≤30 s`); pair(c.title, `${pk.id}/${c.id}`); pair(c.caption, `${pk.id}/${c.id}`); ok(src.includes(`'${c.id}'`) || c.id === 'overview', `${pk.id}/${c.id}: chapter not animated by builder`); });
    pk.parts.forEach((p) => { ['name', 'what', 'deep'].forEach((k) => pair(p[k], `${pk.id}/${p.id}.${k}`)); ok(LEVEL_ORDER.indexOf(p.deepLevel) >= LEVEL_ORDER.indexOf(p.level), `${pk.id}/${p.id} deep level`); ok(src.includes(`'${p.id}'`), `${pk.id}/${p.id}: no 3D mesh for part`); });
    pk.myths.forEach((m, i) => { pair(m.wrong, `${pk.id} myth ${i}`); pair(m.right, `${pk.id} myth ${i}`); });
    pk.quiz.forEach((q) => { pair(q.q, q.id); ok(q.options.length === 4 && q.answer >= 0 && q.answer < 4, `${q.id} options`); q.options.forEach((o, i) => pair(o, `${q.id}.${i}`)); ok(ids.has(q.claim), `${q.id} cites unknown ${q.claim}`); });
    // Entry level = the pack's lowest level (Class 9 by default; Class 10-only topics such as dialysis start at Class 10).
    const entry = LEVEL_ORDER.find((l) => pk.chapters.some((c) => c.level === l));
    ok(pk.chapters[0].level === entry, `${pk.id}: first chapter must be at entry level`);
    ok(pk.quiz.filter((q) => q.level === entry).length >= 3, `${pk.id}: ≥3 entry-level quiz`);
    ok(pk.parts.filter((p) => p.level === entry).length >= 2, `${pk.id}: ≥2 entry-level parts`);
    if (entry === 'class9') nClass9++;
  }
  ok(nClass9 >= packs.length - 1, `${bay.name}: Class 9 default level must cover almost every pack (D23)`);
  ok(!JSON.stringify(packs).toLowerCase().includes('frog'), `${bay.name}: frog removed (TD2)`);
}
console.log(`bay packs smoke: ${n} checks passed`);
