/**
 * Phase 45: deterministic timeline director.
 *
 * One clock drives every teaching animation as a registered participant.
 * Participants are pure samplers: given a time they return a state. The
 * director adds play/pause/step/scrub/speed, deterministic event emission,
 * and serializable state — so any teaching moment can be paused, stepped,
 * shared, and replayed identically.
 */
export class TimelineDirector {
  constructor(options = {}) {
    this.duration = Math.max(0.001, Number(options.duration) || 1);
    this.time = 0;
    this.speed = 1;
    this.playing = false;
    this.participants = new Map();
    this.listeners = new Set();
    this.eventListeners = new Set();
    this._lastEventIndex = new Map();
  }

  register(id, participant = {}) {
    this.participants.set(id, participant);
    this._lastEventIndex.set(id, -1);
    return () => this.participants.delete(id);
  }

  get phase() {
    return ((this.time / this.duration) % 1 + 1) % 1;
  }

  play() { this.playing = true; return this.snapshot(); }
  pause() { this.playing = false; return this.snapshot(); }
  toggle() { this.playing = !this.playing; return this.snapshot(); }

  setSpeed(speed = 1) {
    this.speed = Math.max(0.1, Math.min(4, Number(speed) || 1));
    return this.snapshot();
  }

  /** Advance by dt seconds (scaled). Returns the snapshot after the step. */
  step(deltaSeconds = 0.016) {
    if (!Number.isFinite(deltaSeconds)) return this.snapshot();
    this.time += Math.max(0, deltaSeconds) * this.speed;
    return this._emit();
  }

  /** Deterministic scrub: the same phase always yields the same state. */
  seek(phase = 0) {
    const normalized = ((Number(phase) % 1) + 1) % 1;
    this.time = normalized * this.duration;
    this.participants.forEach((_, id) => this._lastEventIndex.set(id, -1));
    return this._emit(true);
  }

  sample() {
    const states = {};
    this.participants.forEach((participant, id) => {
      states[id] = typeof participant.sample === 'function' ? participant.sample(this.phase, this.time) : null;
    });
    return states;
  }

  /** Emit events whose phase has been crossed since the last emission. */
  _emitEvents(force = false) {
    const phase = this.phase;
    this.participants.forEach((participant, id) => {
      const events = participant.events || [];
      if (!events.length) return;
      let lastIndex = force ? -1 : (this._lastEventIndex.get(id) ?? -1);
      events.forEach((event, index) => {
        const crossed = force ? event.phase <= phase + 1e-9 : index > lastIndex && event.phase <= phase + 1e-9;
        if (crossed) {
          lastIndex = index;
          this.eventListeners.forEach((listener) => listener({ participant: id, ...event }));
        }
      });
      this._lastEventIndex.set(id, lastIndex);
    });
  }

  snapshot() {
    return {
      time: this.time,
      phase: this.phase,
      playing: this.playing,
      speed: this.speed,
      states: this.sample()
    };
  }

  _emit(force = false) {
    this._emitEvents(force);
    const snapshot = this.snapshot();
    this.listeners.forEach((listener) => listener(snapshot));
    return snapshot;
  }

  onSnapshot(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onEvent(listener) {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  serialize() {
    return { phase: this.phase, speed: this.speed, playing: this.playing };
  }

  restore(state = {}) {
    this.speed = Math.max(0.1, Math.min(4, Number(state.speed) || 1));
    this.playing = Boolean(state.playing);
    return this.seek(Number(state.phase) || 0);
  }

  dispose() {
    this.listeners.clear();
    this.eventListeners.clear();
    this.participants.clear();
  }
}

/**
 * Convenience adapter: wraps any object exposing setPhase/getSnapshot (e.g.
 * the CardioPhysiologyEngine) as a director participant without changing the
 * engine's own playback responsibilities.
 */
export function createEngineParticipant(engine, events = []) {
  return {
    events,
    sample: (phase) => {
      engine.setPhase(phase);
      return engine.getSnapshot();
    }
  };
}
