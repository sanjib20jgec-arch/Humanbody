import { useEffect, useRef, useState } from 'react';

// Shared timeline engine (Foundation toolkit): play/pause/scrub a chapter of
// fixed duration (≤ 30 s, D17). One requestAnimationFrame loop; stops at the
// end; never auto-plays under reduced motion.
export function useTimeline(duration, { reducedMotion = false, speed = 1, onTick } = {}) {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const tRef = useRef(0);
  const tickRef = useRef(onTick);
  tickRef.current = onTick;

  useEffect(() => { tRef.current = 0; setT(0); setPlaying(false); tickRef.current?.(0); }, [duration]);

  useEffect(() => {
    if (!playing || reducedMotion) return undefined;
    let raf; let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      const next = Math.min(duration, tRef.current + dt * speed);
      tRef.current = next;
      tickRef.current?.(next);
      // React state only ~10×/s for the scrubber; the 3D scene gets every frame.
      if (Math.floor(next * 10) !== Math.floor((next - dt * speed) * 10) || next >= duration) setT(next);
      if (next >= duration) { setPlaying(false); return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, reducedMotion, duration, speed]);

  const seek = (value) => {
    const v = Math.min(duration, Math.max(0, value));
    tRef.current = v; setT(v); tickRef.current?.(v);
  };
  const toggle = () => {
    if (reducedMotion) return;
    if (tRef.current >= duration) seek(0);
    setPlaying((p) => !p);
  };
  return { t, playing, toggle, seek, setPlaying };
}
