import { test, expect } from '@playwright/test';

// Movement Theater Phase 1 — Truth & Feel.
//
// These specs pin the contracts the plan promised and the old build broke:
// one owner for time, frame-exact stepping, a controlled scrubber, a 15 Hz HUD
// over a 60 FPS figure, live telemetry that matches the pose, the colour-blind
// safe role legend, and the plane/anchored camera. Everything is read from
// `window.__kineDebug` (DEV only) so the assertions test behaviour, not pixels.

async function openTheater(page) {
  await page.goto('/');
  await expect(page.locator('[data-hbl-app="true"]')).toBeVisible();
  await page.locator('.module-list-item', { hasText: 'Movement Theater' }).click();
  const theater = page.locator('[data-kinesiology-theater="true"]');
  await expect(theater).toBeVisible();
  await page.waitForSelector('.kine-stage canvas', { timeout: 20000 });
  await page.waitForFunction(() => Boolean(window.__kineDebug?.time?.()), null, { timeout: 20000 });
  return theater;
}

const debug = (page, fn) => page.evaluate(fn);

test.describe('Movement Theater — Phase 1 timeline', () => {
  test('the clock owns the frame grid: 120 frames at 30 fps for walk', async ({ page }) => {
    await openTheater(page);
    const info = await debug(page, () => {
      const d = window.__kineDebug;
      return {
        frame: d.frameIndex(),
        frames: d.frameCount(),
        frameCountManifest: d.manifest()?.frameCount,
        fps: d.manifest()?.fps,
        duration: d.time().duration,
        tNorm: d.tNorm()
      };
    });
    expect(info.frames).toBe(120);
    expect(info.frameCountManifest).toBe(120);
    expect(info.fps).toBe(30);
    expect(info.duration).toBeCloseTo(4, 5);
    expect(info.frame).toBe(0);
    expect(info.tNorm).toBe(0);
  });

  test('step ±1f moves exactly one frame — not 3 or 4', async ({ page }) => {
    const theater = await openTheater(page);
    await theater.locator('.kine-tool', { hasText: '+1f' }).click();
    let state = await debug(page, () => ({ frame: window.__kineDebug.frameIndex(), t: window.__kineDebug.time().tSeconds }));
    expect(state.frame).toBe(1);
    expect(state.t).toBeCloseTo(1 / 30, 4);

    await theater.locator('.kine-tool', { hasText: '+1f' }).click();
    await theater.locator('.kine-tool', { hasText: '−1f' }).click();
    state = await debug(page, () => ({ frame: window.__kineDebug.frameIndex(), playing: window.__kineDebug.playing() }));
    expect(state.frame).toBe(1);
    expect(state.playing).toBe(false); // stepping always pauses

    await theater.locator('.kine-tool', { hasText: '−1f' }).click();
    await theater.locator('.kine-tool', { hasText: '−1f' }).click();
    state = await debug(page, () => ({ frame: window.__kineDebug.frameIndex() }));
    expect(state.frame).toBe(0); // clamped, never negative
  });

  test('stepping is frame-exact on the other clip too (jump, 90 frames)', async ({ page }) => {
    const theater = await openTheater(page);
    await theater.locator('.kine-actions button', { hasText: 'jump' }).first().click();
    await page.waitForFunction(() => window.__kineDebug?.manifest()?.actionId === 'jump', null, { timeout: 5000 });
    await theater.locator('.kine-tool', { hasText: '+1f' }).click();
    const state = await debug(page, () => ({
      frame: window.__kineDebug.frameIndex(),
      frames: window.__kineDebug.frameCount(),
      t: window.__kineDebug.time().tSeconds
    }));
    expect(state.frames).toBe(90);
    expect(state.frame).toBe(1);
    expect(state.t).toBeCloseTo(1 / 30, 4);
  });

  test('speed buttons expose the sanctioned 0.25/0.5/1 range and reach the clock', async ({ page }) => {
    const theater = await openTheater(page);
    for (const value of [0.25, 0.5, 1]) {
      await theater.locator('.kine-speed-group button', { hasText: `${value}×` }).click();
      const speed = await debug(page, () => window.__kineDebug.speed());
      expect(speed).toBe(value);
    }
    const group = await theater.locator('.kine-speed-group button').allInnerTexts();
    expect(group.map((t) => Number(t.replace('×', '')))).toEqual([0.25, 0.5, 1]);
  });

  test('loop modes switch and ping-pong reverses at the end', async ({ page }) => {
    const theater = await openTheater(page);
    await theater.locator('.kine-loop-group button', { hasText: 'Loop' }).click();
    expect(await debug(page, () => window.__kineDebug.loopMode())).toBe('loop');
    await theater.locator('.kine-loop-group button', { hasText: 'Ping-pong' }).click();
    expect(await debug(page, () => window.__kineDebug.loopMode())).toBe('pingpong');
    // Park near the end, play, and watch the direction flip.
    await debug(page, () => { window.__kineDebug.time().seekFrame(117); window.__kineDebug.time().play(); });
    await page.waitForFunction(() => window.__kineDebug.time().direction < 0, null, { timeout: 8000 });
    const after = await debug(page, () => window.__kineDebug.frameIndex());
    expect(after).toBeGreaterThan(100);
    await theater.locator('.kine-loop-group button', { hasText: 'Once' }).click();
    expect(await debug(page, () => window.__kineDebug.loopMode())).toBe('once');
  });

  test('snap points come from the manifest and jump to their frame', async ({ page }) => {
    const theater = await openTheater(page);
    const snaps = await debug(page, () => window.__kineDebug.manifest().snapPoints.map((s) => ({ id: s.id, label: s.label, frame: s.frame })));
    expect(snaps.length).toBeGreaterThanOrEqual(3);
    expect(snaps[0].frame).toBe(0); // gait clips start ON a contact, which wins over "Neutral"
    const peak = snaps.find((s) => s.id === 'peakFlexion');
    expect(peak, 'the walk clip must expose a peak-flexion snap').toBeTruthy();
    await theater.locator('.kine-snap-group button', { hasText: peak.label }).click();
    const state = await debug(page, () => ({ frame: window.__kineDebug.frameIndex(), playing: window.__kineDebug.playing(), label: window.__kineDebug.manifest().snapPoints.find((s) => s.frame === window.__kineDebug.frameIndex())?.label }));
    expect(state.frame).toBe(peak.frame);
    expect(state.playing).toBe(false);
    expect(state.label).toBe(peak.label);
  });

  test('snap stepping walks forward and backward through the snap frames', async ({ page }) => {
    const theater = await openTheater(page);
    await debug(page, () => window.__kineDebug.time().seekFrame(0));
    await theater.locator('.kine-tool', { hasText: '⤓ snap' }).click();
    const forward = await debug(page, () => window.__kineDebug.frameIndex());
    expect(forward).toBeGreaterThan(0);
    await theater.locator('.kine-tool', { hasText: '⤒ snap' }).click();
    const back = await debug(page, () => window.__kineDebug.frameIndex());
    expect(back).toBeLessThan(forward);
  });
});

test.describe('Movement Theater — Phase 1 scrubbing', () => {
  test('the scrubber is controlled by the clock and seeks frame-exactly', async ({ page }) => {
    const theater = await openTheater(page);
    const scrub = theater.locator('.kine-scrub');
    await scrub.fill('500');
    const mid = await debug(page, () => ({ frame: window.__kineDebug.frameIndex(), frames: window.__kineDebug.frameCount() }));
    expect(mid.frame).toBe(Math.round(0.5 * (mid.frames - 1)));

    await scrub.fill('250');
    const quarter = await debug(page, () => window.__kineDebug.frameIndex());
    expect(quarter).toBe(Math.round(0.25 * (mid.frames - 1)));
    // The DOM value and the clock agree: the old build left the thumb at 0.
    const domValue = await scrub.inputValue();
    expect(Number(domValue)).toBeCloseTo(250, -1);
  });

  test('the thumb follows playback and the aria value advances with it', async ({ page }) => {
    const theater = await openTheater(page);
    await debug(page, () => window.__kineDebug.time().play());
    await page.waitForTimeout(600);
    const state = await debug(page, () => ({
      value: Number(document.querySelector('.kine-scrub').value),
      frame: window.__kineDebug.frameIndex(),
      frames: window.__kineDebug.frameCount(),
      ariaNow: Number(document.querySelector('.kine-scrub').getAttribute('aria-valuenow'))
    }));
    expect(state.frame).toBeGreaterThan(5);
    expect(state.value).toBeCloseTo(Math.round((state.frame / (state.frames - 1)) * 1000), -1);
    expect(state.ariaNow).toBe(state.frame + 1);
  });

  test('dragging pauses, seeking is jitter-free, and release resumes playback', async ({ page }) => {
    const theater = await openTheater(page);
    await debug(page, () => window.__kineDebug.time().play());
    const scrub = theater.locator('.kine-scrub');
    const box = await scrub.boundingBox();
    expect(box).toBeTruthy();
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2);
    await page.mouse.down();
    const during = await debug(page, () => window.__kineDebug.playing());
    expect(during).toBe(false); // drag pauses the mixer
    const samples = [];
    for (const frac of [0.3, 0.4, 0.5, 0.6, 0.7]) {
      await page.mouse.move(box.x + box.width * frac, box.y + box.height / 2);
      const frame = await debug(page, () => window.__kineDebug.frameIndex());
      samples.push(frame);
    }
    expect([...samples].sort((a, b) => a - b)).toEqual(samples); // monotonic while dragging right
    await page.mouse.up();
    const resume = await debug(page, () => window.__kineDebug.playing());
    expect(resume).toBe(true); // resume on release
  });

  test('keyboard seeking is frame-exact and does not start a drag', async ({ page }) => {
    const theater = await openTheater(page);
    const scrub = theater.locator('.kine-scrub');
    await debug(page, () => window.__kineDebug.time().seekFrame(20));
    await scrub.focus();
    await page.keyboard.press('ArrowRight');
    expect(await debug(page, () => window.__kineDebug.frameIndex())).toBe(21);
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    expect(await debug(page, () => window.__kineDebug.frameIndex())).toBe(19);
    expect(await debug(page, () => window.__kineDebug.playing())).toBe(false);
  });
});

test.describe('Movement Theater — Phase 1 telemetry HUD', () => {
  test('the live panel reads the same angles as the pose', async ({ page }) => {
    const theater = await openTheater(page);
    await debug(page, () => { window.__kineDebug.time().pause(); window.__kineDebug.time().seekFrame(60); });
    await page.waitForFunction(() => Boolean(window.__kineDebug.telemetry()), null, { timeout: 5000 });
    const state = await debug(page, () => {
      const t = window.__kineDebug.telemetry();
      const rows = [...document.querySelectorAll('.kine-rom-row')].map((row) => ({
        name: row.querySelector('.kine-rom-name')?.textContent,
        value: row.querySelector('.kine-rom-value')?.textContent,
        out: row.dataset.outOfBand
      }));
      return { angles: t.angles, rows, phase: t.phase };
    });
    expect(state.rows.length).toBe(3);
    for (const row of state.rows) {
      const key = row.name.toLowerCase();
      const shown = Number(row.value.replace('°', ''));
      expect(shown).toBeCloseTo(Math.round(state.angles[key]), 0);
      expect(row.out === 'true' || row.out === 'false').toBe(true);
    }
    // The phase feed is a real label from the motion vocabulary, never empty.
    expect(typeof state.phase).toBe('string');
    expect(state.phase.length).toBeGreaterThan(2);
  });

  test('numbers update at ~15 Hz while the figure keeps rendering', async ({ page }) => {
    const theater = await openTheater(page);
    await expect(theater.locator('.kine-rom')).toBeVisible();
    const counts = await page.evaluate(() => new Promise((resolve) => {
      const target = document.querySelector('.kine-rom-value');
      let mutations = 0;
      const observer = new MutationObserver(() => { mutations += 1; });
      observer.observe(target, { childList: true, characterData: true, subtree: true });
      if (!window.__kineDebug.playing()) window.__kineDebug.time().play();
      setTimeout(() => { observer.disconnect(); resolve({ mutations, fps: window.__kineDebug.perf().fps }); }, 1000);
    }));
    // 15 Hz nominal; allow 1.5x for the discrete-event bypass, and require that
    // the DOM is NOT being written once per rendered frame.
    expect(counts.mutations).toBeGreaterThan(4);
    expect(counts.mutations).toBeLessThanOrEqual(30);
  });

  // Phase 1 gate (Masterplan §6): "0 DOM writes per frame while paused".
  // The render loop keeps drawing (and the camera can still be orbited) but an
  // idle scene must not rewrite ~90 HUD nodes 15 times a second.
  test('a paused scene writes nothing to the HUD', async ({ page }) => {
    const theater = await openTheater(page);
    await expect(theater.locator('.kine-rom')).toBeVisible();
    await page.evaluate(() => { const dbg = window.__kineDebug; if (dbg.playing()) dbg.time().pause(); });
    await page.waitForTimeout(400); // let the pause settle before measuring
    const sample = await page.evaluate(() => new Promise((resolve) => {
      const before = { writes: window.__kinePerf.domWrites, frames: window.__kinePerf.frameCount };
      setTimeout(() => resolve({
        writes: window.__kinePerf.domWrites - before.writes,
        frames: window.__kinePerf.frameCount - before.frames,
        paused: !window.__kineDebug.playing(),
      }), 1000);
    }));
    expect(sample.paused).toBe(true);
    expect(sample.frames).toBeGreaterThan(20); // the figure is still rendering
    expect(sample.writes).toBe(0);             // ...but the HUD is silent
  });

  test('the telemetry panel never claims clinical measurement', async ({ page }) => {
    const theater = await openTheater(page);
    await expect(theater.locator('.kine-rom-note')).toContainText('not a clinical measurement');
    await expect(theater.locator('.kine-rom-note')).toContainText('AAOS');
    await expect(theater.locator('.kine-rom-band').first()).toContainText('°');
  });

  test('an out-of-range reading is flagged by shape and text, not colour alone', async ({ page }) => {
    await openTheater(page);
    const css = await page.evaluate(() => {
      const el = document.createElement('div');
      el.className = 'kine-rom-row';
      el.dataset.outOfBand = 'true';
      document.body.appendChild(el);
      const style = getComputedStyle(el);
      const badge = getComputedStyle(el, '::after').content;
      el.remove();
      return { bar: style.borderLeftColor, badge };
    });
    expect(css.bar).toBe('rgb(213, 94, 0)');           // the antagonist vermillion, not a hue-only cue
    expect(css.badge).toContain('beyond reference');    // text badge, so colour is redundant
  });
});

test.describe('Movement Theater — Phase 1 roles, camera and grid', () => {
  test('the role legend is the colour-blind-safe five-role set', async ({ page }) => {
    const theater = await openTheater(page);
    const key = theater.locator('.kine-role-key li');
    await expect(key).toHaveCount(5);
    const labels = await key.allInnerTexts();
    expect(labels.join(' ')).toContain('Agonist');
    expect(labels.join(' ')).toContain('Antagonist');
    expect(labels.join(' ')).toContain('Stabilizer');
    const colours = await page.evaluate(() => [...document.querySelectorAll('.kine-role-key i')].map((el) => getComputedStyle(el).backgroundColor));
    expect(colours).toContain('rgb(0, 114, 178)');
    expect(colours).toContain('rgb(213, 94, 0)');
    // The failing triple must not appear anywhere in the key.
    expect(colours).not.toContain('rgb(255, 93, 71)');
    expect(colours).not.toContain('rgb(255, 179, 71)');
  });

  test('every muscle row carries a role word, not only a colour', async ({ page }) => {
    const theater = await openTheater(page);
    const roles = await theater.locator('.kine-legend-row i').allInnerTexts();
    expect(roles.length).toBeGreaterThan(20);
    for (const role of roles.slice(0, 10)) {
      expect(['Agonist', 'Synergist', 'Antagonist', 'Stabilizer', 'Inactive']).toContain(role.trim());
    }
  });

  test('plane presets and joint anchoring drive the camera', async ({ page }) => {
    const theater = await openTheater(page);
    await theater.locator('.kine-term', { hasText: 'Plane' }).first().locator('button', { hasText: 'Sagittal' }).click();
    expect(await debug(page, () => window.__kineDebug.director().plane)).toBe('sagittal');

    await theater.locator('.kine-term', { hasText: 'Track joint' }).locator('button', { hasText: 'Left knee' }).click();
    await page.waitForFunction(() => window.__kineDebug.director().anchorJointId === 'leftLeg', null, { timeout: 5000 });
    await page.waitForFunction(() => {
      const d = window.__kineDebug;
      const bone = d.rig.bones.leftLeg;
      const p = d.camera.position;
      return Math.hypot(p.x, p.y, p.z) > 0 && Number.isFinite(bone.getWorldPosition(new d.THREE.Vector3()).y);
    }, null, { timeout: 5000 });
    const look = await debug(page, () => {
      const d = window.__kineDebug;
      const joint = d.rig.bones.leftLeg.getWorldPosition(new d.THREE.Vector3());
      return d.director().look.distanceTo(joint);
    });
    await page.waitForFunction(() => window.__kineDebug.director().look.distanceTo(
      window.__kineDebug.rig.bones.leftLeg.getWorldPosition(new window.__kineDebug.THREE.Vector3())
    ) < 0.1, null, { timeout: 8000 });
    expect(look).toBeLessThan(1.5);

    // The learner's own orbit takes over, and re-center hands it back.
    await debug(page, () => window.__kineDebug.director().userOrbit());
    expect(await debug(page, () => window.__kineDebug.director().mode)).toBe('FREE');
    await theater.locator('.kine-term', { hasText: 'Track joint' }).locator('button', { hasText: 're-center' }).click();
    expect(await debug(page, () => window.__kineDebug.director().mode)).not.toBe('FREE');
  });

  test('camera limits stay inside the contracted envelope', async ({ page }) => {
    await openTheater(page);
    const limits = await debug(page, () => {
      const c = window.__kineDebug.controls;
      return { min: c?.minDistance, max: c?.maxDistance, minPolar: c?.minPolarAngle, maxPolar: c?.maxPolarAngle };
    });
    expect(limits.min).toBeCloseTo(0.5, 5);
    expect(limits.max).toBeCloseTo(6, 5);
    expect((limits.minPolar * 180) / Math.PI).toBeCloseTo(25, 3);
    expect((limits.maxPolar * 180) / Math.PI).toBeCloseTo(145, 3);
  });

  test('every frame of the grid maps to a distinct monotonic timestamp', async ({ page }) => {
    await openTheater(page);
    const rows = await debug(page, () => {
      const d = window.__kineDebug;
      const out = [];
      for (let f = 0; f < d.frameCount(); f += 7) out.push(d.mapFrame(f));
      return out;
    });
    let previous = -1;
    for (const row of rows) {
      expect(row.tSeconds).toBeGreaterThan(previous);
      expect(row.tSeconds).toBeCloseTo(row.frame / 30, 6);
      previous = row.tSeconds;
    }
    const last = await debug(page, () => {
      const d = window.__kineDebug;
      return d.mapFrame(d.frameCount() - 1).tNorm;
    });
    expect(last).toBeCloseTo(1, 6);
  });

  test('the clip grid mismatch is surfaced, not hidden (audit A19)', async ({ page }) => {
    await openTheater(page);
    const accuracy = await debug(page, () => {
      const t = window.__kineDebug.time();
      const declared = 4; // walk's declared duration in actions.js
      return { duration: t.duration, frameCount: t.frameCount, fps: t.fps, declared };
    });
    expect(accuracy.frameCount / accuracy.fps).toBeCloseTo(accuracy.duration, 9);
    expect(accuracy.duration).toBeCloseTo(accuracy.declared, 5);
  });
});
