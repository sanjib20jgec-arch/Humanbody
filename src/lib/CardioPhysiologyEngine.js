import { describeCardiacPhase, splitRightLeft, CARDIAC_VALVE_EVENTS } from './CardiacCycleStateMachine.js';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const TAU = Math.PI * 2;

/**
 * Educational cardiac-cycle model. It is deliberately deterministic and
 * unit-labelled so students can inspect the relationship between HR, SV,
 * cardiac output, pressure, and valve gradients without implying clinical
 * measurement accuracy.
 */
export class CardioPhysiologyEngine {
  constructor(options = {}) {
    this.options = { baseHeartRate: 72, baseStrokeVolume: 70, baseSBP: 120, baseDBP: 80, ...options };
    this.state = { exercise: 0, epinephrine: 0, betaBlocker: 0, peripheralResistance: 1, time: 0, running: false };
    this.listeners = new Set();
    this.heartMesh = null;
    this.heartBaseScale = null;
    this.raf = null;
    this.lastFrame = 0;
    this.lastEmit = 0;
  }

  setParameters(patch = {}) {
    Object.entries(patch).forEach(([key, value]) => {
      if (key in this.state && key !== 'time' && key !== 'running') this.state[key] = clamp(Number(value) || 0, key === 'peripheralResistance' ? 0.55 : 0, key === 'peripheralResistance' ? 1.55 : 1);
    });
    return this.getSnapshot();
  }

  reset() {
    this.stop();
    this.state = { ...this.state, exercise: 0, epinephrine: 0, betaBlocker: 0, peripheralResistance: 1, time: 0, running: false };
    this.emit(true);
  }

  get heartRate() {
    return clamp(this.options.baseHeartRate + this.state.exercise * 100 + this.state.epinephrine * 35 - this.state.betaBlocker * 32, 42, 190);
  }

  get strokeVolume() {
    const contractility = 1 + this.state.exercise * 0.16 + this.state.epinephrine * 0.12 - this.state.betaBlocker * 0.08;
    return clamp(this.options.baseStrokeVolume * contractility, 42, 105);
  }

  get cardiacOutput() {
    return (this.heartRate * this.strokeVolume) / 1000;
  }

  get pressure() {
    const pulsePressure = clamp(40 + this.state.exercise * 16 + this.state.epinephrine * 10 - this.state.betaBlocker * 8, 28, 72);
    const baselineMap = this.options.baseDBP + (this.options.baseSBP - this.options.baseDBP) / 3;
    const map = baselineMap * this.state.peripheralResistance * (0.97 + this.state.exercise * 0.08);
    const dbp = map - pulsePressure / 3;
    const sbp = map + (pulsePressure * 2) / 3;
    return { map, sbp, dbp, pulsePressure };
  }

  cyclePeriod() {
    return 60 / this.heartRate;
  }

  phaseAt(time = this.state.time) {
    const normalized = ((time / this.cyclePeriod()) % 1 + 1) % 1;
    if (normalized < 0.1) return 'atrial systole';
    if (normalized < 0.16) return 'isovolumetric contraction';
    if (normalized < 0.5) return 'ventricular ejection';
    if (normalized < 0.57) return 'isovolumetric relaxation';
    return 'ventricular filling';
  }

  /**
   * R2: single-truth waveform. The curves are shaped so that, at default
   * pressures, the pressure-gradient crossings land on the state machine's
   * valve-event phases (AV close 0.10, semilunar open 0.16, semilunar close
   * 0.50, AV open 0.57) — captions, timeline ticks, and the drawn Wiggers
   * diagram all describe the same crossings.
   */
  waveformAt(normalizedPhase) {
    const p = ((normalizedPhase % 1) + 1) % 1;
    const { sbp, dbp } = this.pressure;
    const g = (center, spread) => Math.exp(-((p - center) ** 2) / spread);
    const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    // Atrial: mean ~6 mmHg, a-wave during atrial systole, v-wave mid-cycle.
    const atrial = 6 + 3 * g(0.06, 0.001) + 1.2 * g(0.31, 0.002);
    let ventricular;
    if (p < 0.1) {
      ventricular = 5; // LVEDP; below atrial so the AV valves stay open.
    } else if (p < 0.16) {
      // Isovolumetric contraction: steep rise crossing the atrial trace at ~0.10.
      const t = (p - 0.1) / 0.06;
      ventricular = 5 + (dbp + 3 - 5) * Math.pow(t, 0.6);
    } else if (p < 0.5) {
      const e = (p - 0.16) / 0.34;
      ventricular = (dbp + 3) + (sbp + 4 - (dbp + 3)) * Math.sin(Math.PI * e) ** 0.5;
    } else if (p < 0.57) {
      const s = (p - 0.5) / 0.07;
      ventricular = 5 + (dbp - 2) * Math.pow(1 - s, 1.4);
    } else {
      ventricular = 3 + 2 * smooth(0.85, 1, p);
    }
    let aortic;
    if (p < 0.16) {
      aortic = dbp;
    } else if (p < 0.3) {
      aortic = dbp + (sbp - dbp) * smooth(0.16, 0.3, p);
    } else if (p < 0.5) {
      // Slow diastolic runoff keeps aortic just under the ventricle until the
      // late-systolic crossover lands on the 0.5 state tick.
      aortic = sbp - 25 * smooth(0.3, 0.5, p);
    } else if (p < 0.56) {
      const s = (p - 0.5) / 0.06;
      aortic = dbp + 15 * Math.pow(1 - s, 1.2) + 3 * g(0.53, 0.0003);
    } else {
      aortic = dbp;
    }
    // Pulmonary trunk: diastolic floor ~9 mmHg, systolic ~25, dicrotic hump.
    const pulmonaryFloor = 9 + this.state.exercise * 2 + this.state.epinephrine * 1;
    let pulmonary = pulmonaryFloor;
    if (p >= 0.16 && p < 0.52) {
      const e = (p - 0.16) / 0.36;
      pulmonary = pulmonaryFloor + 16 * Math.sin(Math.PI * Math.min(1, e)) ** 1.1;
    } else if (p >= 0.52 && p < 0.6) {
      const s = (p - 0.52) / 0.08;
      pulmonary = pulmonaryFloor + 6 * Math.pow(1 - s, 1.2) + 2 * g(0.55, 0.0004);
    }
    return { phase: p, atrial, ventricular, aortic, pulmonary };
  }

  valveStates(wave = this.waveformAt((this.state.time / this.cyclePeriod()) % 1)) {
    return {
      mitral: wave.atrial > wave.ventricular,
      tricuspid: wave.atrial > wave.ventricular,
      aortic: wave.ventricular > wave.aortic,
      pulmonary: wave.ventricular > wave.pulmonary
    };
  }

  getSnapshot() {
    const phase = ((this.state.time / this.cyclePeriod()) % 1 + 1) % 1;
    const waveform = this.waveformAt(phase);
    return {
      time: this.state.time,
      phase,
      running: this.state.running,
      phaseLabel: this.phaseAt(),
      heartRate: this.heartRate,
      strokeVolume: this.strokeVolume,
      cardiacOutput: this.cardiacOutput,
      ...this.pressure,
      waveform,
      normalizedPressures: {
        rightAtrium: waveform.atrial,
        rightVentricle: waveform.ventricular,
        leftAtrium: waveform.atrial,
        leftVentricle: waveform.ventricular,
        pulmonaryTrunk: waveform.pulmonary,
        aorta: waveform.aortic
      },
      valves: this.valveStates(waveform),
      // Phase 32: explicit named state, captions, and the normalized
      // right/left pressure split travel with every snapshot so the timeline,
      // chart, and 3D markers all describe the same moment.
      cardiacState: describeCardiacPhase(phase),
      rightLeft: splitRightLeft(waveform),
      valveEvents: CARDIAC_VALVE_EVENTS,
      // Normalized educational pressure gradients drive the live valve
      // markers. They are deliberately relative teaching values, not clinical
      // pressure measurements or patient-specific inference.
      valveGradients: {
        mitral: clamp((waveform.atrial - waveform.ventricular) / 24, 0, 1),
        tricuspid: clamp((waveform.atrial - waveform.ventricular) / 24, 0, 1),
        aortic: clamp((waveform.ventricular - waveform.aortic) / 48, 0, 1),
        pulmonary: clamp((waveform.ventricular - waveform.pulmonary) / 24, 0, 1)
      },
      deformation: 1 - 0.075 * Math.max(0, Math.sin(Math.PI * clamp((phase - 0.16) / 0.34, 0, 1)))
    };
  }

  sampleWaveform(count = 180) {
    return Array.from({ length: count }, (_, index) => this.waveformAt(index / count));
  }

  /**
   * Phase 33: deterministic scrubbing. Setting a phase maps directly to the
   * cycle time, so any teaching state can be reached, shared, and replayed.
   */
  setPhase(phase = 0) {
    const normalized = ((Number(phase) % 1) + 1) % 1;
    this.state.time = Math.floor(this.state.time / this.cyclePeriod()) * this.cyclePeriod() + normalized * this.cyclePeriod();
    return this.getSnapshot();
  }

  step(deltaSeconds) {
    if (!Number.isFinite(deltaSeconds)) return this.getSnapshot();
    this.state.time += clamp(deltaSeconds, 0, 0.1);
    const snapshot = this.getSnapshot();
    this.deformHeartMesh(snapshot);
    return snapshot;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(force = false) {
    const snapshot = this.getSnapshot();
    if (force || snapshot.time - this.lastEmit > 0.04) {
      this.lastEmit = snapshot.time;
      this.listeners.forEach((listener) => listener(snapshot));
    }
    return snapshot;
  }

  start() {
    if (this.raf) return;
    this.state.running = true;
    this.lastFrame = performance.now();
    const tick = (now) => {
      if (!this.state.running) return;
      const delta = (now - this.lastFrame) / 1000;
      this.lastFrame = now;
      this.step(delta);
      this.emit();
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop() {
    this.state.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
  }

  attachHeartMesh(mesh) {
    this.heartMesh = mesh;
    this.heartBaseScale = mesh?.scale.clone() || null;
    return () => {
      if (this.heartMesh === mesh) {
        this.heartMesh = null;
        this.heartBaseScale = null;
      }
    };
  }

  deformHeartMesh(snapshot = this.getSnapshot()) {
    if (!this.heartMesh || !this.heartBaseScale) return;
    const contraction = snapshot.deformation;
    this.heartMesh.scale.set(this.heartBaseScale.x * contraction, this.heartBaseScale.y * (0.98 + (1 - contraction) * 0.2), this.heartBaseScale.z * contraction);
  }

  /**
   * Phase 46: deterministic teaching ECG (P–QRS–T) synthesized from the
   * cycle phase. Shape only — amplitudes and intervals are illustrative,
   * not diagnostic.
   */
  ecgAt(normalizedPhase) {
    const p = ((normalizedPhase % 1) + 1) % 1;
    const bump = (center, spread, amplitude) => amplitude * Math.exp(-((p - center) ** 2) / spread);
    return bump(0.06, 0.0009, 0.16)          // P wave: atrial depolarization
      + bump(0.125, 0.00006, -0.12)          // Q dip
      + bump(0.145, 0.00008, 1)              // R spike: ventricular depolarization
      + bump(0.165, 0.00007, -0.24)          // S dip
      + bump(0.32, 0.0016, 0.32);            // T wave: ventricular repolarization
  }

  /**
   * R7 (G3): calibrated teaching chart. Left ruler calibrates the systemic
   * traces (LV + aorta, 0–130 mmHg); the right ruler calibrates the
   * low-pressure traces (RV + pulmonary trunk, 0–30 mmHg). Faint gridlines,
   * cycle-% ticks along the bottom, and no in-plot legend text — the legend
   * lives outside the canvas in the DOM.
   */
  drawWiggers(ctx, width, height, options = {}) {
    if (!ctx || !width || !height) return;
    const left = 38;
    const right = width - 32;
    const top = 8;
    const bottom = height - 26;
    const samples = options.samples || this.sampleWaveform(180);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = options.background || '#0d1722';
    ctx.fillRect(0, 0, width, height);
    ctx.font = '9px system-ui, sans-serif';
    // Horizontal gridlines at quarter heights; systemic labels left,
    // low-pressure labels right.
    for (let row = 0; row <= 4; row += 1) {
      const t = row / 4;
      const y = top + (bottom - top) * t;
      ctx.strokeStyle = 'rgba(174,205,220,.12)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke();
      ctx.fillStyle = '#8fb6c9';
      ctx.textAlign = 'right';
      ctx.fillText(String(Math.round(130 * (1 - t))), left - 5, y + 3);
      ctx.fillStyle = '#c4a6e8';
      ctx.textAlign = 'left';
      ctx.fillText(String(Math.round(30 * (1 - t))), right + 5, y + 3);
    }
    ctx.textAlign = 'right';
    ctx.fillStyle = '#8fb6c9';
    ctx.save(); ctx.translate(10, (top + bottom) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillText('mmHg · LV/aorta', 0, 0); ctx.restore();
    ctx.save(); ctx.translate(width - 6, (top + bottom) / 2); ctx.rotate(Math.PI / 2); ctx.textAlign = 'center'; ctx.fillStyle = '#c4a6e8'; ctx.fillText('mmHg · RV/pulmonary', 0, 0); ctx.restore();
    // Cycle ticks along the bottom.
    ctx.textAlign = 'center';
    for (let tick = 0; tick <= 4; tick += 1) {
      const t = tick / 4;
      const x = left + (right - left) * t;
      ctx.strokeStyle = 'rgba(174,205,220,.09)';
      ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bottom); ctx.stroke();
      ctx.fillStyle = '#61809a';
      ctx.fillText(`${tick * 25}%`, x, height - 14);
    }
    ctx.fillText('cardiac cycle', left + (right - left) / 2, height - 3);
    // Phase 46: right/left split traces. The right ventricle works against
    // pulmonary resistance, so its normalized peak stays well below the
    // systemic left ventricle — the visual point of the split.
    // R2: each trace is plotted against its own honest mmHg axis, stated in
    // the label — the right ventricle is no longer amplified on the systemic
    // scale.
    const paths = [
      { key: 'atrial', color: '#fbbf24', label: 'atria · 0–12 mmHg axis', scale: 12, value: (sample) => sample.atrial },
      { key: 'ventricular', color: '#fb7185', label: 'left ventricle · 0–130 mmHg axis', scale: 130, value: (sample) => sample.ventricular },
      { key: 'rv', color: '#f9a8d4', label: 'right ventricle · 0–30 mmHg axis', scale: 30, value: (sample) => sample.ventricular * 0.21 },
      { key: 'aortic', color: '#38bdf8', label: 'aorta · 0–130 mmHg axis', scale: 130, value: (sample) => sample.aortic },
      { key: 'pulmonary', color: '#a78bfa', label: 'pulmonary trunk · 0–30 mmHg axis', scale: 30, value: (sample) => sample.pulmonary }
    ];
    paths.forEach((path) => {
      ctx.strokeStyle = path.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      samples.forEach((sample, index) => {
        const x = left + (index / (samples.length - 1)) * (right - left);
        const y = bottom - (path.value(sample) / path.scale) * (bottom - top);
        if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
    // Deterministic teaching ECG lane below the plot area.
    ctx.strokeStyle = 'rgba(134,239,172,.9)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    samples.forEach((sample, index) => {
      const x = left + (index / (samples.length - 1)) * (right - left);
      const y = height - 18 - this.ecgAt(sample.phase) * 6;
      if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    const x = left + this.getSnapshot().phase * (right - left);
    ctx.strokeStyle = 'rgba(141,245,237,.8)';
    ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bottom); ctx.stroke(); ctx.setLineDash([]);
  }

  /** R7 (G3): legend data rendered outside the plot by the host component. */
  wiggersLegend() {
    return [
      { color: '#fbbf24', label: 'atria (0–12 mmHg axis)' },
      { color: '#fb7185', label: 'left ventricle (left ruler)' },
      { color: '#f9a8d4', label: 'right ventricle (right ruler)' },
      { color: '#38bdf8', label: 'aorta (left ruler)' },
      { color: '#a78bfa', label: 'pulmonary trunk (right ruler)' },
      { color: '#86efac', label: 'ECG · teaching shape, intervals compressed' }
    ];
  }

  dispose() {
    this.stop();
    this.listeners.clear();
    this.heartMesh = null;
    this.heartBaseScale = null;
  }
}

export const cardioMath = { clamp, TAU };
