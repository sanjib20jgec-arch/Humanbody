const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const WATER_RADIUS_NM = 0.14;
const GLUCOSE_RADIUS_NM = 0.36;

function gaussian(random = Math.random) {
  const u = Math.max(1e-9, random());
  const v = Math.max(1e-9, random());
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(Math.PI * 2 * v);
}

/**
 * 2D Brownian particle solver for a teaching membrane model.
 * Concentrations are normalized units, distance is the width of the canvas,
 * and the reported flux is the Fick's-first-law value in model units.
 */
export class CellularDiffusionEngine {
  constructor(options = {}) {
    this.width = options.width || 760;
    this.height = options.height || 320;
    this.particleCount = options.particleCount || 64;
    this.state = {
      leftConcentration: options.leftConcentration ?? 0.72,
      rightConcentration: options.rightConcentration ?? 0.28,
      poreSize: options.poreSize ?? 0.22,
      temperature: options.temperature ?? 24,
      solute: options.solute || 'water',
      diffusionCoefficient: options.diffusionCoefficient ?? 0.35,
      time: 0
    };
    this.particles = new Float32Array(this.particleCount * 3);
    this.random = options.random || Math.random;
    this.listeners = new Set();
    this.running = false;
    this.raf = null;
    this.lastFrame = 0;
    this.lastEmit = 0;
    this.resetParticles();
  }

  setParameters(patch = {}) {
    Object.entries(patch).forEach(([key, value]) => {
      if (key === 'solute') this.state.solute = value === 'glucose' ? 'glucose' : 'water';
      else if (key in this.state) this.state[key] = Number(value);
    });
    return this.getSnapshot();
  }

  get soluteRadius() { return this.state.solute === 'glucose' ? GLUCOSE_RADIUS_NM : WATER_RADIUS_NM; }

  get gradient() { return this.state.rightConcentration - this.state.leftConcentration; }

  get diffusionCoefficientAtTemperature() {
    return this.state.diffusionCoefficient * Math.sqrt(clamp(this.state.temperature, 0, 60) / 298.15 + 273.15 / 298.15);
  }

  calculateFlux() {
    const distance = 1;
    return -this.diffusionCoefficientAtTemperature * this.gradient / distance;
  }

  resetParticles() {
    const membraneX = 0.5;
    for (let i = 0; i < this.particleCount; i += 1) {
      const side = i % 2 === 0 ? 0 : 1;
      const index = i * 3;
      this.particles[index] = side ? membraneX + 0.06 + this.random() * 0.38 : 0.06 + this.random() * 0.38;
      this.particles[index + 1] = 0.12 + this.random() * 0.76;
      this.particles[index + 2] = side;
    }
    this.state.time = 0;
  }

  concentrationAt(x) { return x < 0.5 ? this.state.leftConcentration : this.state.rightConcentration; }

  step(deltaSeconds) {
    const dt = clamp(Number(deltaSeconds) || 0, 0, 0.08);
    const temperatureMultiplier = Math.sqrt((this.state.temperature + 273.15) / 298.15);
    const diffusion = this.state.diffusionCoefficient * temperatureMultiplier;
    const sigma = Math.sqrt(2 * diffusion * dt) * 0.18;
    const drift = -this.gradient * diffusion * dt * 0.22;
    const canCross = this.soluteRadius <= this.state.poreSize;
    for (let i = 0; i < this.particleCount; i += 1) {
      const index = i * 3;
      let x = this.particles[index];
      let y = this.particles[index + 1];
      const direction = this.gradient > 0 ? 1 : -1;
      x += gaussian(this.random) * sigma + drift * direction;
      y += gaussian(this.random) * sigma;
      y = y < 0.05 ? 0.05 : y > 0.95 ? 0.95 : y;
      const crossed = (this.particles[index] < 0.5 && x >= 0.5) || (this.particles[index] >= 0.5 && x < 0.5);
      if (crossed && !canCross) x = this.particles[index] < 0.5 ? 0.499 : 0.501;
      x = x < 0.04 ? 0.04 : x > 0.96 ? 0.96 : x;
      this.particles[index] = x;
      this.particles[index + 1] = y;
      this.particles[index + 2] = x < 0.5 ? 0 : 1;
    }
    this.state.time += dt;
    this.emit();
    return this.getSnapshot();
  }

  getSnapshot() {
    const flux = this.calculateFlux();
    return {
      ...this.state,
      gradient: this.state.leftConcentration - this.state.rightConcentration,
      flux,
      direction: flux > 0.005 ? 'left → right' : flux < -0.005 ? 'right → left' : 'near equilibrium',
      soluteRadius: this.soluteRadius,
      permeable: this.soluteRadius <= this.state.poreSize,
      particleCount: this.particleCount,
      equation: 'J = −D × dC / dx'
    };
  }

  draw(ctx, width = this.width, height = this.height) {
    if (!ctx) return;
    this.width = width || this.width;
    this.height = height || this.height;
    ctx.clearRect(0, 0, this.width, this.height);
    const gradient = ctx.createLinearGradient(0, 0, this.width, 0);
    gradient.addColorStop(0, 'rgba(167,139,250,.22)');
    gradient.addColorStop(0.49, 'rgba(167,139,250,.08)');
    gradient.addColorStop(0.51, 'rgba(34,211,238,.08)');
    gradient.addColorStop(1, 'rgba(34,211,238,.22)');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, this.width, this.height);
    ctx.fillStyle = 'rgba(237,246,249,.5)'; ctx.fillRect(this.width * 0.495, 0, this.width * 0.01, this.height);
    ctx.fillStyle = 'rgba(255,255,255,.65)'; ctx.font = '10px system-ui, sans-serif';
    ctx.fillText(`REGION A  ${Math.round(this.state.leftConcentration * 100)}%`, 14, 20);
    ctx.fillText(`REGION B  ${Math.round(this.state.rightConcentration * 100)}%`, this.width - 92, 20);
    ctx.fillText(this.state.solute === 'water' ? 'H₂O' : 'GLUCOSE', this.width * 0.5 - 20, 20);
    for (let i = 0; i < this.particleCount; i += 1) {
      const index = i * 3;
      const x = this.particles[index] * this.width;
      const y = this.particles[index + 1] * this.height;
      const r = this.state.solute === 'glucose' ? 4.2 : 3;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = this.state.solute === 'glucose' ? '#fbbf24' : (this.particles[index + 2] ? '#22d3ee' : '#a78bfa');
      ctx.globalAlpha = 0.82; ctx.fill(); ctx.globalAlpha = 1;
    }
  }

  subscribe(listener) { this.listeners.add(listener); return () => this.listeners.delete(listener); }

  emit() {
    const snapshot = this.getSnapshot();
    if (snapshot.time - this.lastEmit > 0.04) {
      this.lastEmit = snapshot.time;
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
      this.step(dt);
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop() { this.running = false; if (this.raf) cancelAnimationFrame(this.raf); this.raf = null; }
  dispose() { this.stop(); this.listeners.clear(); }
}
