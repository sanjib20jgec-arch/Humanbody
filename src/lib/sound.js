class SoundManager {
  constructor() {
    this.enabled = true;
    this.ambient = false;
    this.volume = 0.16;
    this.context = null;
    this.ambientNodes = null;
  }

  ensureContext() {
    if (!this.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      this.context = new AudioContext();
    }
    if (this.context.state === 'suspended') this.context.resume();
    return this.context;
  }

  tone(frequency, duration = 0.06, type = 'sine', offset = 0) {
    if (!this.enabled) return;
    const context = this.ensureContext();
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime + offset);
    gain.gain.setValueAtTime(0.0001, context.currentTime + offset);
    gain.gain.exponentialRampToValueAtTime(Math.max(this.volume * 0.22, 0.002), context.currentTime + offset + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + offset + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(context.currentTime + offset);
    oscillator.stop(context.currentTime + offset + duration + 0.02);
  }

  playClick() { this.tone(420, 0.07, 'sine'); }
  playHover() { this.tone(680, 0.025, 'sine'); }
  playSuccess() { this.tone(620, 0.08); this.tone(830, 0.11, 'sine', 0.08); }
  playError() { this.tone(190, 0.12, 'triangle'); }
  playComplete() { this.tone(520, 0.1); this.tone(700, 0.1, 'sine', 0.08); this.tone(980, 0.16, 'sine', 0.18); }
  playSimulationStart() { this.tone(350, 0.08); this.tone(500, 0.14, 'sine', 0.07); }
  playSimulationPause() { this.tone(300, 0.06, 'triangle'); }
  playReset() { this.tone(240, 0.08, 'triangle'); this.tone(180, 0.08, 'triangle', 0.07); }

  setAmbient(on) {
    this.ambient = on;
    if (!on || !this.enabled) {
      this.stopAmbient();
      return;
    }
    const context = this.ensureContext();
    if (!context || this.ambientNodes) return;
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    const oscillator = context.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = 72;
    filter.type = 'lowpass';
    filter.frequency.value = 180;
    gain.gain.value = Math.max(this.volume * 0.08, 0.002);
    oscillator.connect(filter).connect(gain).connect(context.destination);
    oscillator.start();
    this.ambientNodes = { oscillator, gain };
  }

  stopAmbient() {
    if (!this.ambientNodes) return;
    try { this.ambientNodes.oscillator.stop(); } catch { /* already stopped */ }
    this.ambientNodes = null;
  }

  setEnabled(on) {
    this.enabled = on;
    if (!on) this.stopAmbient();
    if (on && this.ambient) this.setAmbient(true);
  }

  setVolume(value) {
    this.volume = Number(value);
    if (this.ambientNodes) this.ambientNodes.gain.gain.value = this.volume * 0.08;
  }
}

export const soundManager = new SoundManager();
