// GasExchangeModel — teaching-level alveolar gas exchange for RespirationLab (R3).
//
// What it is: minute ventilation minus anatomical dead space (~150 mL) gives
// alveolar ventilation; P_A CO2 is inversely proportional to it (constant CO2
// output), P_A O2 follows the alveolar gas equation (respiratory quotient 0.8).
// The returned values are steady-state (no per-breath swing) and are labelled
// in the UI as teaching values — NOT arterial blood gases.

export const ANATOMICAL_DEAD_SPACE_ML = 150;
const CO2_OUTPUT_CONSTANT = 4.2; // tuned so 4.2 L/min alveolar ventilation ⇢ P_A CO2 40 mmHg
const RQ = 0.8;

export function alveolarVentilationLpm(ratePerMin, tidalVolumeMl) {
  return Math.max(0.4, (ratePerMin * Math.max(0, tidalVolumeMl - ANATOMICAL_DEAD_SPACE_ML)) / 1000);
}

export function alveolarPCO2(alveolarLpm) {
  return Math.min(90, Math.max(18, (40 * CO2_OUTPUT_CONSTANT) / alveolarLpm));
}

export function alveolarPO2(paco2) {
  return Math.min(130, Math.max(35, 150 - paco2 / RQ));
}

/** Hill-type O2 saturation (teaching curve), % given PO2 in mmHg. */
export function oxygenSaturation(po2) {
  return (100 * po2 ** 2.7) / (27 ** 2.7 + po2 ** 2.7);
}

export function gasExchangeAt(ratePerMin, tidalVolumeMl) {
  const va = alveolarVentilationLpm(ratePerMin, tidalVolumeMl);
  const paco2 = alveolarPCO2(va);
  const pao2 = alveolarPO2(paco2);
  return { alveolarVentilation: va, paco2, pao2, saturation: oxygenSaturation(pao2) };
}
