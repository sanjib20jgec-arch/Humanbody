const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const ENZYME_PROFILES = {
  amylase: { id: 'amylase', name: 'Salivary amylase', compartment: 'Mouth', optimalPH: 6.8, phSigma: 0.85, optimalTemperature: 37, temperatureSigma: 10, vmax: 8.4, km: 18, substrate: 90, products: 'Maltose + smaller sugars', color: '#fbbf24' },
  pepsin: { id: 'pepsin', name: 'Pepsin', compartment: 'Stomach', optimalPH: 1.8, phSigma: 0.72, optimalTemperature: 37, temperatureSigma: 9, vmax: 6.2, km: 22, substrate: 90, products: 'Peptides', color: '#fb7185' },
  trypsin: { id: 'trypsin', name: 'Trypsin', compartment: 'Duodenum', optimalPH: 7.8, phSigma: 0.78, optimalTemperature: 37, temperatureSigma: 9, vmax: 7.2, km: 20, substrate: 90, products: 'Smaller peptides + amino acids', color: '#38bdf8' },
  lipase: { id: 'lipase', name: 'Lipase', compartment: 'Duodenum', optimalPH: 7.8, phSigma: 0.9, optimalTemperature: 37, temperatureSigma: 9, vmax: 5.4, km: 24, substrate: 90, products: '2-monoacylglycerol + fatty acids', color: '#a78bfa' }
};

/** Michaelis-Menten reaction model with bell-shaped pH and temperature factors. */
export class EnzymeKineticsEngine {
  constructor(profile = 'amylase', options = {}) {
    this.listeners = new Set();
    this.running = false;
    this.raf = null;
    this.lastFrame = 0;
    this.lastEmit = 0;
    this.profile = { ...(ENZYME_PROFILES[profile] || ENZYME_PROFILES.amylase), ...options };
    this.parameters = { pH: this.profile.optimalPH, temperature: 37, substrate: this.profile.substrate, elapsed: 0, product: 0 };
  }

  selectProfile(profile) {
    const next = ENZYME_PROFILES[profile] || profile;
    if (!next) return;
    this.profile = { ...next };
    this.reset();
  }

  setParameters(patch = {}) {
    if ('pH' in patch) this.parameters.pH = clamp(Number(patch.pH), 0, 14);
    if ('temperature' in patch) this.parameters.temperature = clamp(Number(patch.temperature), 0, 100);
    if ('substrate' in patch) this.parameters.substrate = clamp(Number(patch.substrate), 0, 100);
    return this.getSnapshot();
  }

  gaussianFactor(value, optimum, sigma) {
    return Math.exp(-0.5 * ((value - optimum) / sigma) ** 2);
  }

  pHFactor(pH = this.parameters.pH) {
    const factor = this.gaussianFactor(pH, this.profile.optimalPH, this.profile.phSigma);
    return factor < 0.01 ? 0 : factor;
  }

  /**
   * R4 (M4/P7): asymmetric temperature response. Below the optimum the enzyme
   * loses activity gently (Gaussian); above it, digestive enzymes denature in
   * a steep, largely irreversible cliff, so activity collapses well before
   * 50 °C instead of following a symmetric bell.
   */
  temperatureFactor(temperature = this.parameters.temperature) {
    const optimum = this.profile.optimalTemperature;
    if (temperature <= optimum) {
      const factor = this.gaussianFactor(temperature, optimum, this.profile.temperatureSigma);
      return factor < 0.01 ? 0 : factor;
    }
    const overshoot = temperature - optimum;
    const factor = Math.exp(-((overshoot / 7) ** 4));
    return factor < 0.005 ? 0 : factor;
  }

  activityFactor() {
    return this.pHFactor() * this.temperatureFactor();
  }

  reactionRate(substrate = this.parameters.substrate) {
    const effectiveVmax = this.profile.vmax * this.activityFactor();
    return effectiveVmax * substrate / (this.profile.km + substrate);
  }

  step(deltaSeconds) {
    const dt = clamp(Number(deltaSeconds) || 0, 0, 0.25);
    const rate = this.reactionRate();
    const consumed = Math.min(this.parameters.substrate, rate * dt);
    this.parameters.substrate -= consumed;
    this.parameters.product += consumed;
    this.parameters.elapsed += dt;
    return this.getSnapshot();
  }

  getSnapshot() {
    const pHActivity = this.pHFactor();
    const temperatureActivity = this.temperatureFactor();
    const activity = pHActivity * temperatureActivity;
    return {
      profile: this.profile,
      pH: this.parameters.pH,
      temperature: this.parameters.temperature,
      substrate: this.parameters.substrate,
      product: this.parameters.product,
      elapsed: this.parameters.elapsed,
      pHActivity,
      temperatureActivity,
      activity,
      rate: this.reactionRate(),
      halted: activity === 0 || this.parameters.substrate <= 0,
      equation: 'v = Vmax × [S] / (Km + [S])'
    };
  }

  reset() {
    this.stop();
    this.parameters = { pH: this.profile.optimalPH, temperature: 37, substrate: this.profile.substrate, elapsed: 0, product: 0 };
    this.emit(true);
  }

  subscribe(listener) { this.listeners.add(listener); return () => this.listeners.delete(listener); }

  emit(force = false) {
    const snapshot = this.getSnapshot();
    if (force || snapshot.elapsed - this.lastEmit > 0.04) {
      this.lastEmit = snapshot.elapsed;
      this.listeners.forEach((listener) => listener(snapshot));
    }
    return snapshot;
  }

  start() {
    if (this.raf) return;
    this.running = true;
    this.lastFrame = performance.now();
    const tick = (now) => {
      if (!this.running) return;
      const dt = (now - this.lastFrame) / 1000;
      this.lastFrame = now;
      const snapshot = this.step(dt);
      this.emit();
      if (snapshot.halted) this.stop();
      else this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
  }

  dispose() { this.stop(); this.listeners.clear(); }
}
