// R3 exit test — respiration teaching model invariants.
import { gasExchangeAt, oxygenSaturation, ANATOMICAL_DEAD_SPACE_ML } from '../src/lib/GasExchangeModel.js';
import assert from 'node:assert/strict';

// Normal resting breathing (12/min × 500 mL) sits on the textbook values.
const normal = gasExchangeAt(12, 500);
assert.ok(Math.abs(normal.paco2 - 40) <= 1, `resting PACO2 should be ~40, got ${normal.paco2}`);
assert.ok(Math.abs(normal.pao2 - 100) <= 2, `resting PAO2 should be ~100, got ${normal.pao2}`);
assert.ok(normal.saturation >= 96, `resting saturation should be >=96, got ${normal.saturation}`);

// M2 fix: rapid shallow breathing (24/min × 250 mL) must read as HYPOventilation
// — CO2 rising, O2 falling — because most of each breath is dead space.
const shallow = gasExchangeAt(24, 250);
assert.ok(shallow.paco2 > 55, `rapid shallow breathing should raise PACO2, got ${shallow.paco2}`);
assert.ok(shallow.pao2 < 80, `rapid shallow breathing should lower PAO2, got ${shallow.pao2}`);
assert.ok(shallow.saturation < gasExchangeAt(12, 500).saturation, 'shallow pattern must not saturate higher than normal');

// Deep slow breathing moves in the opposite (mild hyperventilation) direction.
const deep = gasExchangeAt(8, 800);
assert.ok(deep.paco2 < 40, `deep slow breathing should lower PACO2, got ${deep.paco2}`);
assert.ok(deep.pao2 > 100, `deep slow breathing should raise PAO2, got ${deep.pao2}`);

// Saturation curve is monotonic and bounded.
let prev = 0;
for (let po2 = 10; po2 <= 150; po2 += 5) {
  const s = oxygenSaturation(po2);
  assert.ok(s > prev && s <= 100, `saturation must rise monotonically to <=100 (PO2 ${po2})`);
  prev = s;
}

assert.equal(ANATOMICAL_DEAD_SPACE_ML, 150, 'dead space constant');
console.log(`Respiration smoke passed (rest PACO2 ${normal.paco2.toFixed(1)}/PAO2 ${normal.pao2.toFixed(1)} · shallow PACO2 ${shallow.paco2.toFixed(1)} · deep PACO2 ${deep.paco2.toFixed(1)})`);
