// Phase 1 (Movement Theater Masterplan §2.1): the single source of truth for time.
//
// Contract (do not weaken):
//   1. The authoritative position is an INTEGER frame index. Seconds and the
//      normalized 0–1 position are derived from it, never stored independently,
//      so the scrubber, the pose, the activation layer and the telemetry can
//      never disagree with each other.
//   2. Sub-frame time is accumulated in float64 and converted to whole frames.
//      A clip therefore advances at exactly one frame per (1/fps) of wall time
//      regardless of display refresh rate, with no floating-point drift.
//   3. Nothing else may advance time. Mixers, shaders and UI read `tNorm`.
//
// No DOM, no three.js, no React: this module is unit-testable in node.

export const LOOP_ONCE = 'once';
export const LOOP_LOOP = 'loop';
export const LOOP_PINGPONG = 'pingpong';
export const LOOP_MODES = [LOOP_ONCE, LOOP_LOOP, LOOP_PINGPONG];

export const MODE_IDLE = 'idle';
export const MODE_PLAYING = 'playing';
export const MODE_SCRUBBING = 'scrubbing';
export const MODE_ENDED = 'ended';

export const SPEEDS = [0.25, 0.5, 1];

const EPS = 1e-9;

export class TimeController {
  /**
   * @param {object} spec
   * @param {number} spec.fps        frames per second of the source clip (authored tracks: 30)
   * @param {number} spec.frameCount number of addressable frames (>= 2)
   * @param {string} [spec.loopMode] one of LOOP_MODES
   * @param {number} [spec.speed]    one of SPEEDS
   */
  constructor(spec = {}) {
    this._listeners = new Map();
    this._frameIndex = 0;
    this._accumulator = 0;
    this._direction = 1;
    this._mode = MODE_IDLE;
    this._playRequested = false;
    this._speed = 1;
    this._loopMode = LOOP_ONCE;
    this.setClip(spec);
  }

  // ---- clip identity -------------------------------------------------------

  /**
   * Set (or replace) the clip. Declares the authoritative duration as
   * frameCount / fps so a clip whose editor-declared duration disagrees with its
   * frame count can never silently drift (Masterplan audit A19).
   */
  setClip({ fps = 30, frameCount = 2, loopMode = LOOP_ONCE, speed = 1, keepPosition = false } = {}) {
    const count = Math.max(2, Math.floor(frameCount));
    const rate = fps > 0 ? fps : 30;
    const changedClip = this.fps !== rate || this.frameCount !== count;
    this.fps = rate;
    this.frameCount = count;
    this.duration = count / rate;
    this.frameTime = 1 / rate;
    this._loopMode = LOOP_MODES.includes(loopMode) ? loopMode : LOOP_ONCE;
    this._speed = SPEEDS.includes(speed) ? speed : 1;
    if (!keepPosition || changedClip) this._resetPosition();
    this._emit('clip', { fps: this.fps, frameCount: this.frameCount, duration: this.duration, loopMode: this._loopMode });
    return this;
  }

  /**
   * Assert that a declared duration matches the frame grid. Returns the
   * mismatch in seconds so callers can surface it instead of hiding it.
   */
  assertDuration(declaredSeconds, tolerance = 1e-6) {
    const mismatch = Math.abs(declaredSeconds - this.duration);
    return { ok: mismatch <= tolerance, mismatch, duration: this.duration };
  }

  // ---- derived views -------------------------------------------------------

  get frameIndex() { return this._frameIndex; }
  get tSeconds() { return this._frameIndex * this.frameTime; }
  get tNorm() { return this.frameCount > 1 ? this._frameIndex / (this.frameCount - 1) : 0; }
  get mode() { return this._mode; }
  get playing() { return this._mode === MODE_PLAYING; }
  get speed() { return this._speed; }
  get loopMode() { return this._loopMode; }
  get direction() { return this._direction; }
  get atEnd() { return this._frameIndex >= this.frameCount - 1; }

  /** Normalized position in [0,1] inclusive, used for data lookups. */
  progress() { return this.tNorm; }

  // ---- transport -----------------------------------------------------------

  play() {
    if (this.atEnd && this._direction > 0 && this._loopMode === LOOP_ONCE) this._frameIndex = 0;
    this._playRequested = true;
    this._mode = MODE_PLAYING;
    this._emit('state', this._stateSnapshot('play'));
    return this;
  }

  pause() {
    this._playRequested = false;
    if (this._mode === MODE_PLAYING) this._mode = MODE_IDLE;
    this._emit('state', this._stateSnapshot('pause'));
    return this;
  }

  toggle() { return this.playing ? this.pause() : this.play(); }

  setSpeed(speed) {
    if (!SPEEDS.includes(speed)) return this;
    this._speed = speed;
    this._emit('state', this._stateSnapshot('speed'));
    return this;
  }

  setLoopMode(loopMode) {
    if (!LOOP_MODES.includes(loopMode)) return this;
    this._loopMode = loopMode;
    this._emit('state', this._stateSnapshot('loop'));
    return this;
  }

  // ---- seeking -------------------------------------------------------------

  /** Seek to an absolute frame. Never advances time; always quantized. */
  seekFrame(frame, reason = 'seek') {
    const clamped = Math.max(0, Math.min(this.frameCount - 1, Math.round(frame)));
    if (clamped === this._frameIndex) return false;
    this._frameIndex = clamped;
    this._accumulator = 0;
    this._emit('seek', { frameIndex: this._frameIndex, reason });
    return true;
  }

  seekNorm(t) {
    const n = Number.isFinite(t) ? Math.max(0, Math.min(1, t)) : 0;
    return this.seekFrame(n * (this.frameCount - 1), 'norm');
  }

  seekSeconds(seconds) {
    const n = Number.isFinite(seconds) ? seconds : 0;
    return this.seekFrame(n / this.frameTime, 'seconds');
  }

  /** Exact frame stepping: ±1 frame is ±1 frame, for every clip (audit A3). */
  stepFrames(delta = 1) {
    const dir = Math.sign(delta) || 1;
    const magnitude = Math.abs(Math.round(delta)) || 1;
    let nextIndex = this._frameIndex + dir * magnitude;
    if (nextIndex > this.frameCount - 1) {
      if (this._loopMode === LOOP_LOOP) nextIndex -= this.frameCount;
      else nextIndex = this.frameCount - 1;
    }
    if (nextIndex < 0) {
      if (this._loopMode === LOOP_LOOP) nextIndex += this.frameCount;
      else nextIndex = 0;
    }
    this._accumulator = 0;
    if (this._frameIndex === nextIndex) return false;
    this._frameIndex = nextIndex;
    this._emit('seek', { frameIndex: this._frameIndex, reason: 'step' });
    return true;
  }

  /** Explicit end-of-clip jump. */
  seekEnd() { return this.seekFrame(this.frameCount - 1, 'end'); }

  /** Jump to the next/previous caller-supplied snap frame (frames array, sorted). */
  seekSnap(frames, direction = 1) {
    if (!frames || !frames.length) return false;
    const current = this._frameIndex;
    const sorted = [...frames].sort((a, b) => a - b);
    if (direction > 0) {
      const next = sorted.find((f) => f > current + EPS);
      return this.seekFrame(next === undefined ? sorted[0] : next, 'snap');
    }
    const prev = [...sorted].reverse().find((f) => f < current - EPS);
    return this.seekFrame(prev === undefined ? sorted[sorted.length - 1] : prev, 'snap');
  }

  // ---- scrubbing -----------------------------------------------------------

  beginScrub() {
    this._mode = MODE_SCRUBBING;
    this._emit('state', this._stateSnapshot('scrub-start'));
    return this;
  }

  /** Released without resuming: the learner stays in control (Masterplan §2.5). */
  endScrub() {
    if (this._mode === MODE_SCRUBBING) this._mode = MODE_IDLE;
    this._emit('state', this._stateSnapshot('scrub-end'));
    return this;
  }

  // ---- clock ---------------------------------------------------------------

  /**
   * Advance by wall-clock milliseconds. Returns the number of whole frames
   * crossed (0 when paused/scrubbing/ended). Call once per animation frame.
   *
   * The accumulator is SIGNED: it grows while playing forward and shrinks while
   * playing backward (ping-pong). One whole frame is consumed per crossing,
   * so the same `advance` handles both directions without a second code path.
   */
  advance(wallDtMs) {
    if (this._mode !== MODE_PLAYING) return 0;
    const dt = Math.max(0, Math.min(250, Number(wallDtMs) || 0)) / 1000;
    this._accumulator += dt * this._speed * this._sign();
    let crossed = 0;
    const last = this.frameCount - 1;
    // Bounded loop: never process more than 2 s of catch-up in one tick.
    const limit = Math.ceil((2 * this.fps) / Math.max(0.25, this._speed)) + 4;
    while (crossed < limit) {
      const forward = this._direction > 0;
      if (forward ? this._accumulator < this.frameTime : this._accumulator > -this.frameTime) break;
      this._accumulator += forward ? -this.frameTime : this.frameTime;
      crossed += 1;
      this._frameIndex += forward ? 1 : -1;
      // Wrap one frame PAST the last frame so the final frame is really shown:
      // frame 0 and frame N-1 are different poses of a cycle (audit A19).
      if (this._frameIndex > last) {
        if (this._loopMode === LOOP_LOOP) { this._frameIndex -= this.frameCount; }
        else if (this._loopMode === LOOP_PINGPONG) { this._frameIndex = last; this._direction = -1; }
        else { this._frameIndex = last; this._mode = MODE_ENDED; this._accumulator = 0; this._emit('ended', this._stateSnapshot('ended')); break; }
      } else if (this._frameIndex < 0) {
        if (this._loopMode === LOOP_LOOP) { this._frameIndex += this.frameCount; }
        else if (this._loopMode === LOOP_PINGPONG) { this._frameIndex = 0; this._direction = 1; }
        else { this._frameIndex = 0; this._mode = MODE_ENDED; this._accumulator = 0; this._emit('ended', this._stateSnapshot('ended')); break; }
      }
    }
    if (crossed) this._emit('frame', { frameIndex: this._frameIndex, crossed });
    return crossed;
  }

  _sign() { return this._direction < 0 ? -1 : 1; }

  _resetPosition() {
    this._frameIndex = 0;
    this._accumulator = 0;
    this._direction = 1;
    this._mode = MODE_IDLE;
    this._playRequested = false;
  }

  /** Reset to frame 0, pause, and clear any ping-pong direction. */
  reset() {
    this._resetPosition();
    this._emit('state', this._stateSnapshot('reset'));
    return this;
  }

  // ---- events --------------------------------------------------------------

  subscribe(event, listener) {
    if (!this._listeners.has(event)) this._listeners.set(event, new Set());
    this._listeners.get(event).add(listener);
    return () => this._listeners.get(event)?.delete(listener);
  }

  _stateSnapshot(reason) {
    return {
      reason,
      mode: this._mode,
      frameIndex: this._frameIndex,
      speed: this._speed,
      loopMode: this._loopMode,
      direction: this._direction,
      duration: this.duration
    };
  }

  _emit(event, payload) {
    const set = this._listeners.get(event);
    if (!set || !set.size) return;
    for (const listener of set) {
      try { listener(payload, this); } catch { /* listener errors must never stop the clock */ }
    }
  }
}

/** Convenience factory used by the Movement Theater stage. */
export function createTimeController(spec) {
  return new TimeController(spec);
}
