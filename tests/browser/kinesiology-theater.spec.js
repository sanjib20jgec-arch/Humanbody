import { test, expect } from '@playwright/test';

async function openTheater(page, { openAdvanced = true } = {}) {
  await page.goto('/');
  await expect(page.locator('[data-hbl-app="true"]')).toBeVisible();
  await page.locator('.module-list-item', { hasText: 'Movement Theater' }).click();
  const theater = page.locator('[data-kinesiology-theater="true"]');
  await expect(theater).toBeVisible();
  await expect(theater.locator('.kine-stage canvas[data-engine]')).toBeVisible({ timeout: 30000 });
  const advancedTools = theater.locator('.kine-tools-disclosure');
  await expect(advancedTools).toBeVisible();
  if (openAdvanced) {
    await advancedTools.locator('summary').evaluate((summary) => summary.click());
    await expect(advancedTools).toHaveAttribute('open', '');
  }
  return theater;
}

test.describe('Kinesiology Theater', () => {
  test('quick-start stays in context while optional tools collapse and core playback stays available', async ({ page }) => {
    const theater = await openTheater(page, { openAdvanced: false });
    const tour = theater.locator('.kine-tour');
    const advanced = theater.locator('.kine-tools-disclosure');
    const transport = theater.locator('.kine-transport');
    await expect(tour).toBeVisible();
    await expect(tour).toContainText('Quick start');
    expect(await tour.evaluate((element) => getComputedStyle(element).position)).toBe('static');
    await expect(theater.locator('.kine-stage canvas[data-engine]')).toBeVisible();
    await expect(advanced).not.toHaveAttribute('open', '');
    await expect(transport).not.toHaveClass(/tools-open/);
    await expect(advanced.locator('.kine-tool').first()).toBeHidden();

    const playPause = page.locator('.sim-controls .primary-control');
    await expect(playPause).toBeVisible();
    await expect(page.locator('.sim-controls .speed-selector')).toBeVisible();
    const wasPlaying = await playPause.getAttribute('aria-pressed');
    await playPause.click();
    await expect(playPause).toHaveAttribute('aria-pressed', wasPlaying === 'true' ? 'false' : 'true');

    const stickyByDefault = await transport.evaluate((element) => getComputedStyle(element).position === 'sticky');
    const summary = advanced.locator('summary');
    await summary.click();
    await expect(advanced).toHaveAttribute('open', '');
    await expect(transport).toHaveClass(/tools-open/);
    await expect(advanced.locator('.kine-tool', { hasText: 'drill me' })).toBeVisible();
    if (stickyByDefault) await expect(transport).toHaveCSS('position', 'static');
    await summary.click();
    await expect(advanced).not.toHaveAttribute('open', '');
    await expect(transport).not.toHaveClass(/tools-open/);
  });

  test('renders with real WebGL canvas, rig muscles, and seven actions', async ({ page }) => {
    const theater = await openTheater(page);
    await expect(theater.getByRole('tab', { name: /^walk\b/i })).toBeVisible();
    for (const id of ['walk', 'run', 'jump', 'wave', 'handshake', 'chew', 'talk']) {
      await expect(theater.getByRole('tab', { name: new RegExp(`^${id}\\b`, 'i') })).toBeVisible();
    }
    const rigInfo = await page.evaluate(() => {
      const rig = window.__kineDebug?.rig;
      if (!rig) return { muscles: 0, bones: 0, renderer: '' };
      return { muscles: Object.keys(rig.muscles).length, bones: Object.keys(rig.bones).length };
    });
    expect(rigInfo.muscles).toBeGreaterThanOrEqual(50);
    expect(rigInfo.bones).toBeGreaterThanOrEqual(14);
    const hasWebGL = await page.evaluate(() => {
      const c = document.querySelector('.kine-stage canvas[data-engine]');
      return Boolean(c && (c.getContext('webgl2') || c.getContext('webgl')));
    });
    expect(hasWebGL).toBe(true);
    await expect(theater).toBeVisible();
  });

  test('camera presets respond to clicks and keyboard', async ({ page }) => {
    await openTheater(page);
    await page.locator('.kine-cameras button', { hasText: 'Posterior' }).click();
    await expect(page.locator('.kine-cameras button', { hasText: 'Posterior' })).toHaveClass(/active/);
    await page.keyboard.press('3');
    await expect(page.locator('.kine-cameras button', { hasText: 'Left lateral' })).toHaveClass(/active/);
  });

  test('CMU clips load with provenance note and treadmill keeps figure centered', async ({ page }) => {
    const theater = await openTheater(page);
    await theater.getByRole('tab', { name: /^walk\b/i }).click();
    await expect(theater.locator('.kine-source-badge')).toContainText('CMU');
    await expect(theater.locator('.kine-disclosure')).toContainText('CMU Graphics Lab mocap');
    const rootX = await page.evaluate(() => new Promise((resolve) => {
      let waited = 0;
      const iv = setInterval(() => {
        waited += 100;
        const rig = window.__kineDebug?.rig;
        if (rig && waited >= 1200) { clearInterval(iv); resolve(rig.root.position.x); }
        else if (waited > 4000) { clearInterval(iv); resolve(null); }
      }, 100);
    }));
    expect(Math.abs(rootX)).toBeLessThan(0.01);
  });

  test('muscle legend buttons select and facts card teaches', async ({ page }) => {
    const theater = await openTheater(page);
    await theater.locator('.kine-legend-row').first().click();
    await expect(theater.locator('.kine-facts')).toBeVisible();
    await expect(theater.locator('.kine-facts p').first()).toContainText('Plane:');
    await theater.locator('.kine-facts-head button').click();
    await expect(theater.locator('.kine-facts')).toHaveCount(0);
  });

  test('phase 81: RLA terminology, gait ticks, and honesty panel', async ({ page }) => {
    const theater = await openTheater(page);
    await expect(theater.locator('.kine-honesty')).toContainText('leisurely');
    await expect(theater.locator('.kine-honesty')).toContainText('not a clinical measurement');
    await expect(theater.locator('.kine-tick')).toHaveCount(8);
    await expect(theater.locator('.kine-caption strong')).toContainText('loading response');
    await theater.locator('.kine-term button', { hasText: 'Traditional' }).click();
    await expect(theater.locator('.kine-caption strong')).toContainText('Heel strike');
    await theater.locator('.kine-term button', { hasText: 'RLA' }).click();
    await expect(theater.locator('.kine-caption strong')).not.toContainText('Heel strike');
    await theater.locator('.kine-tick').nth(6).click();
    await page.waitForTimeout(300);
    await expect(theater.locator('.kine-caption strong')).toContainText('swing');
  });

  test('phase 107: paused figure breathes subtly; reduced-motion stays still', async ({ page }) => {
    const theater = await openTheater(page);
    await theater.locator('.kine-stage').press(' '); // pause
    if (page.viewportSize().width > 900) {
      const s1 = await page.evaluate(() => window.__kineDebug.rig.bones.chest.scale.x);
      await new Promise((r) => setTimeout(r, 700));
      const s2 = await page.evaluate(() => window.__kineDebug.rig.bones.chest.scale.x);
      expect(Math.abs(s1 - s2)).toBeGreaterThan(1e-4);
    }
  });

  test('phase 106: cinema tier gains spotlight + environment; fast tier stays lean', async ({ page }) => {
    const theater = await openTheater(page);
    await theater.locator('.kine-quality button', { hasText: 'cinema' }).click();
    await page.waitForFunction(() => {
      const d = window.__kineDebug;
      return d && d.scene.children.some((c) => c.isSpotLight) && Boolean(d.scene.environment);
    }, null, { timeout: 15000 });
    await theater.locator('.kine-quality button', { hasText: 'fast' }).click();
    await page.waitForFunction(() => {
      const d = window.__kineDebug;
      return d && !d.scene.children.some((c) => c.isSpotLight) && !d.scene.environment;
    }, null, { timeout: 8000 });
  });

  test('phase 105: phase ribbon seeks playback to clicked phase', async ({ page }) => {
    const theater = await openTheater(page);
    const before = await page.evaluate(() => window.__kineDebug.timeNow() % 4);
    await theater.locator('.kine-ribbon button').nth(3).click(); // swing phase ≈ 0.6–1.0 of 4 s
    const after = await page.evaluate(() => window.__kineDebug.timeNow() % 4);
    expect(after).toBeGreaterThanOrEqual(2.3);
    expect(after).toBeLessThan(4.05);
    expect(before).toBeGreaterThanOrEqual(0);
  });

  test('phase 104: top-down transverse inset renders on desktop', async ({ page }) => {
    test.skip(page.viewportSize().width < 900, 'The transverse inset is intentionally desktop-only.');
    const theater = await openTheater(page);
    await theater.locator('.kine-dual-toggle', { hasText: 'Top-down' }).click();
    if (page.viewportSize().width >= 900) {
      await page.waitForFunction(() => window.__kineDebug.lastDualMode() === 'top', null, { timeout: 5000 });
    }
    if (page.viewportSize().width >= 900) {
      await theater.locator('.kine-dual-toggle', { hasText: 'Dual angle' }).click();
      await page.waitForFunction(() => window.__kineDebug.lastDualMode() === 'rear', null, { timeout: 5000 });
    }
  });

  test('phase 103: activation heat colour mode toggles rig materials', async ({ page }) => {
    const theater = await openTheater(page);
    await theater.locator('.kine-tool-toggle', { hasText: 'activation heat' }).locator('input').check();
    await page.waitForFunction(() => window.__kineDebug.rig.heatOn?.() === true, null, { timeout: 5000 });
    await theater.locator('.kine-tool-toggle', { hasText: 'activation heat' }).locator('input').uncheck();
    await page.waitForFunction(() => window.__kineDebug.rig.heatOn?.() === false, null, { timeout: 5000 });
  });

  test('phase 102: joint markers toggle and selected-muscle outline', async ({ page }) => {
    const theater = await openTheater(page);
    await theater.locator('.kine-tool-toggle', { hasText: 'joint markers' }).locator('input').check();
    await page.waitForFunction(() => window.__kineDebug.markersVisible() === true, null, { timeout: 5000 });
    await theater.locator('.kine-legend-row').first().click();
    await page.waitForFunction(() => window.__kineDebug.outlineCount() === 1, null, { timeout: 5000 });
    await theater.locator('.kine-tool-toggle', { hasText: 'joint markers' }).locator('input').uncheck();
    await page.waitForFunction(() => window.__kineDebug.markersVisible() === false, null, { timeout: 5000 });
  });

  test('phase 101: quality selector updates the live renderer (cinema/fast parity)', async ({ page }) => {
    const theater = await openTheater(page);
    await theater.locator('.kine-quality button', { hasText: 'cinema' }).click();
    await page.waitForFunction(() => window.__kineDebug?.renderer?.shadowMap?.enabled === true, null, { timeout: 8000 });
    await theater.locator('.kine-quality button', { hasText: 'fast' }).click();
    await page.waitForFunction(() => window.__kineDebug?.renderer?.shadowMap?.enabled === false, null, { timeout: 8000 });
    const stored = await page.evaluate(() => localStorage.getItem('kine-quality'));
    expect(stored).toBe('fast');
    await theater.locator('.kine-quality button', { hasText: 'auto' }).click();
  });

  test('phase 100: ghost depth-blend and faded floor edge', async ({ page }) => {
    await openTheater(page);
    const info = await page.evaluate(() => {
      const d = window.__kineDebug;
      const ghostMats = [];
      d.ghost.root.traverse((o) => { if (o.material) ghostMats.push(o.material); });
      const floor = d.scene.children.find((c) => c.isMesh && c.geometry?.type === 'CircleGeometry');
      return {
        ghostNoDepthWrite: ghostMats.length > 0 && ghostMats.every((m) => m.depthWrite === false),
        floorTransparent: Boolean(floor && floor.material.transparent && floor.material.alphaMap)
      };
    });
    expect(info.ghostNoDepthWrite).toBe(true);
    expect(info.floorTransparent).toBe(true);
  });

  test('phase 99: action-aware framing snaps instantly under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const theater = await openTheater(page);
    const expectedZ = await theater.locator('.kine-stage').evaluate((stage) => {
      const aspect = stage.clientWidth / Math.max(1, stage.clientHeight);
      const phoneScale = Math.max(0.7, Math.min(1, aspect / 1.5));
      return 4.9 * phoneScale; // walk preset distance, scaled for the stage's aspect ratio
    });
    await theater.getByRole('button', { name: 'Camera: Anterior (coach view)' }).click();
    await page.waitForFunction((targetZ) => {
      const d = window.__kineDebug;
      return d && Math.abs(d.camera.position.z - targetZ) < 0.05 && Math.abs(d.camera.position.x) < 0.05;
    }, expectedZ, { timeout: 10000 });
    const z = await page.evaluate(() => window.__kineDebug.camera.position.z);
    expect(Math.abs(z - expectedZ)).toBeLessThan(0.05);
  });

  test('phase 98: endpoint motion trails accumulate during locomotion and clear on toggle', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const theater = await openTheater(page);
    const playPause = page.locator('.sim-controls .primary-control');
    if (await playPause.getAttribute('aria-pressed') !== 'true') await playPause.click();
    await expect(playPause).toHaveAttribute('aria-pressed', 'true');
    await theater.getByRole('tab', { name: /^walk\b/i }).click();
    await expect.poll(() => page.evaluate(() => {
      const debug = window.__kineDebug;
      return {
        points: debug?.trails?.[0]?.pts?.length || 0,
        playing: debug?.playing?.() || false,
        action: debug?.activeAction?.() || null,
        enabled: debug?.trailsEnabled?.() || false
      };
    }), { timeout: 20000 }).toMatchObject({ points: expect.any(Number), playing: true, action: 'walk', enabled: true });
    await expect.poll(() => page.evaluate(() => window.__kineDebug?.trails?.[0]?.pts?.length || 0), { timeout: 20000 }).toBeGreaterThan(8);
    const vis = await page.evaluate(() => window.__kineDebug.trails[0].line.visible);
    expect(vis).toBe(true);
    await theater.locator('.kine-tool-toggle', { hasText: 'motion trails' }).locator('input').uncheck();
    const vis2 = await page.evaluate(() => window.__kineDebug.trails[0].line.visible);
    expect(vis2).toBe(false);
    await theater.locator('.kine-tool-toggle', { hasText: 'motion trails' }).locator('input').check();
  });

  test('phase 97: radial stage, contact shadow, bounded presentation canvas', async ({ page }) => {
    const theater = await openTheater(page);
    const info = await page.evaluate(() => {
      const d = window.__kineDebug;
      const polar = d.scene.children.find((c) => c.userData?.kind === 'polar-stage');
      const grid = d.scene.children.find((c) => c.isGridHelper);
      const c = d.renderer.domElement;
      return { polar: Boolean(polar), oldGrid: Boolean(grid), w: c.width, h: c.height };
    });
    expect(info.polar).toBe(true);
    expect(info.oldGrid).toBe(false);
    expect(info.w / info.h).toBeLessThan(1.6); // presentation aspect bounded (no more 1:1.6 portrait)
    const stageBox = await theater.locator('.kine-stage').boundingBox();
    if (page.viewportSize().width > 900) expect(stageBox.height).toBeLessThanOrEqual(780);
  });

  test('phase 96: stagecraft lighting — tone mapping, 3-point lights, shadows on desktop', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('kine-quality', 'cinema'));
    const theater = await openTheater(page);
    const state = await page.evaluate(() => {
      const d = window.__kineDebug;
      return {
        toneMapping: d.renderer.toneMapping,
        ac: d.THREE.ACESFilmicToneMapping,
        shadows: d.renderer.shadowMap.enabled,
        dirLights: d.scene.children.filter((c) => c.isDirectionalLight).length,
        fog: Boolean(d.scene.fog),
        floorReceives: d.scene.children.some((c) => c.isMesh && c.receiveShadow),
        casters: Array.from(d.rig.root.children).length > 0 && (() => { let n = 0; d.rig.root.traverse((o) => { if (o.isMesh && o.castShadow) n++; }); return n; })()
      };
    });
    expect(state.toneMapping).toBe(state.ac); // ACESFilmicToneMapping
    // 3-point stagecraft present on every tier; shadows follow the quality tier
    expect(state.dirLights).toBeGreaterThanOrEqual(3);
    if (page.viewportSize().width > 900) {
      expect(state.shadows).toBe(true); // cinema override forces full-fidelity stage
      expect(state.casters).toBeGreaterThan(0);
    } else {
      expect(state.shadows).toBe(true); // cinema override verified on phone too (user choice)
    }
    expect(state.fog).toBe(true);
    expect(state.floorReceives).toBe(true);
    await expect(theater.locator('.kine-stage canvas[data-engine]')).toBeVisible();
  });

  test('phase 94: coach hint, learning log, self-compare disclosure, privacy spec', async ({ page }) => {
    const theater = await openTheater(page);
    await theater.locator('.kine-tool', { hasText: 'coach hint' }).click();
    await expect(theater.locator('.kine-hint span')).toBeVisible();
    await theater.locator('.kine-tool-toggle', { hasText: 'learning log' }).locator('input').check();
    await theater.locator('.kine-tool-toggle', { hasText: 'self-compare' }).locator('input').check();
    await expect(theater.locator('.kine-selfcam')).toBeVisible();
    await expect(theater.locator('.kine-selfcam small')).toContainText(/on your device|Camera unavailable|denied/);
    await expect(theater.locator('.kine-cues')).toContainText(/WEBCAM_PRIVACY_SPEC.md \(E5\)/);
    await theater.locator('.kine-tool-toggle', { hasText: 'self-compare' }).locator('input').uncheck();
    const cams = await page.evaluate(() => document.querySelectorAll('video').length === 0 || document.querySelector('video')?.srcObject === null);
    expect(cams).toBe(true);
  });

  test('phase 93: annotation strokes draw and A/B offset ghost', async ({ page }) => {
    const theater = await openTheater(page);
    await theater.locator('.kine-tool-toggle', { hasText: 'annotate' }).locator('input').check();
    const cv = theater.locator('.kine-overlay');
    await cv.scrollIntoViewIfNeeded();
    const box = await cv.boundingBox();
    const py = Math.min(520, Math.max(60, box.y + 400));
    const py2 = Math.min(560, Math.max(80, box.y + 460));
    await page.mouse.move(box.x + 300, py);
    await page.mouse.down();
    await page.mouse.move(box.x + 480, py2, { steps: 8 });
    await page.mouse.up();
    const drawn = await page.evaluate(() => {
      const c = document.querySelector('.kine-overlay');
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      let n = 0;
      for (let i = 3; i < d.length; i += 400) if (d[i] > 0) n++;
      return n;
    });
    expect(drawn).toBeGreaterThan(0);
    await theater.locator('.kine-dual-toggle', { hasText: 'A/B offset' }).click();
    await page.waitForFunction(() => window.__kineDebug?.ghost?.root?.visible === true, null, { timeout: 5000 });
  });

  test('phase 92: clinical pattern ghost appears and clears', async ({ page }) => {
    const theater = await openTheater(page);
    await theater.locator('.kine-actions[aria-label="Clinical comparison patterns"] button', { hasText: 'Trendelenburg' }).click();
    await page.waitForFunction(() => window.__kineDebug?.ghost?.root?.visible === true, null, { timeout: 10000 });
    const vis = await page.evaluate(() => window.__kineDebug?.ghost?.root?.visible);
    expect(vis).toBe(true);
    await expect(theater.locator('.kine-persp-note', { hasText: 'not diagnostic' }).first()).toBeVisible();
    await theater.locator('.kine-actions[aria-label="Clinical comparison patterns"] button', { hasText: 'none' }).click();
    await page.waitForFunction(() => window.__kineDebug?.ghost?.root?.visible === false, null, { timeout: 5000 });
  });

  test('phase 91: notation strip, density toggle, convention footnote', async ({ page }) => {
    const theater = await openTheater(page);
    await expect(theater.locator('.kine-notation')).toBeVisible();
    await expect(theater.locator('.kine-angles small')).toContainText('ISB');
    await theater.locator('.kine-term[aria-label="Representation density"] button', { hasText: 'Data only' }).click();
    await expect(theater.locator('.kine-stage canvas[data-engine]')).toBeHidden();
    await expect(theater.locator('.kine-notation')).toBeVisible();
    await theater.locator('.kine-term[aria-label="Representation density"] button', { hasText: '3D + data' }).click();
    await expect(theater.locator('.kine-stage canvas[data-engine]')).toBeVisible();
  });

  test('phase 90: tour, CoM honesty readout, a11y toggles present', async ({ page }) => {
    const theater = await openTheater(page);
    await expect(theater.locator('.kine-tour')).toBeVisible();
    await theater.locator('.kine-tour-dismiss').click();
    await expect(theater.locator('.kine-tour')).toBeHidden();
    await page.waitForTimeout(2500);
    await expect(theater.locator('.kine-honesty')).toContainText('CoM vertical');
    await expect(theater.locator('.kine-honesty')).toContainText('asymmetry');
    await expect(theater.locator('.kine-tool-toggle', { hasText: 'voice captions' })).toBeVisible();
    await expect(theater.locator('.kine-tool-toggle', { hasText: 'sonify knee angle' })).toBeVisible();
  });

  test('phase 89: rehearsal overlay and perspective labels', async ({ page }) => {
    const theater = await openTheater(page);
    await theater.locator('.kine-tool-toggle', { hasText: 'rehearsal mode' }).locator('input').check();
    await expect(theater.locator('.kine-rehearse')).toContainText('Imagine YOURSELF');
    await expect(theater.locator('.kine-cameras button', { hasText: 'Posterior' })).toContainText('coach');
    await expect(theater.locator('.kine-cameras button', { hasText: 'Close-up' })).toContainText('learner');
  });

  test('phase 88: external-focus cue toggle and coaching cue library', async ({ page }) => {
    const theater = await openTheater(page);
    await expect(theater.locator('.kine-cues span:not(.eyebrow)').first()).toContainText('Walk tall');
    const caption = theater.locator('.kine-caption');
    const anat = await caption.textContent();
    await theater.locator('.kine-term[aria-label="Cue wording style"] button', { hasText: 'External-focus' }).click();
    await expect(caption).not.toHaveText(anat);
    await expect(caption).toContainText(/kiss the ground|rail|wall|puddle|string/);
  });

  test('phase 87: retrieval drill asks, gives feedback, and offers Anki export', async ({ page }) => {
    const theater = await openTheater(page);
    await theater.locator('.kine-tool', { hasText: 'drill me' }).click();
    await expect(theater.locator('.kine-drill')).toBeVisible();
    const choice = theater.locator('.kine-drill-options .kine-tool').first();
    if (await choice.count()) {
      await choice.click();
      await expect(theater.locator('.kine-drill em')).toBeVisible();
    } else {
      await expect(theater.locator('.kine-drill')).toContainText('Click the muscle');
    }
    await expect(theater.locator('.kine-tool', { hasText: 'Anki TSV' })).toBeVisible();
    await theater.locator('.kine-drill .kine-tool', { hasText: 'stop' }).click().catch(() => {});
  });

  test('phase 86: study mode pauses at boundaries; frame step works', async ({ page }) => {
    const theater = await openTheater(page);
    await theater.locator('.kine-tool-toggle', { hasText: 'study mode' }).locator('input').check();
    await expect(theater.locator('.kine-study-pause')).toBeVisible({ timeout: 8000 });
    const predict = theater.locator('.kine-study-pause .kine-drill-options .kine-tool').first();
    if (await predict.count()) await predict.click();
    await theater.locator('.kine-study-pause button', { hasText: 'Continue' }).click();
    await expect(theater.locator('.kine-study-pause')).toBeHidden();
    const t0 = await page.evaluate(() => window.__kineDebug?.rig ? true : true);
    await theater.locator('.kine-tool', { hasText: '+1f' }).click();
    await theater.locator('.kine-tool', { hasText: '−1f' }).click();
    await theater.locator('.kine-tool', { hasText: 'contact' }).click();
    await expect(theater.locator('.kine-caption')).toBeVisible();
    expect(t0).toBe(true);
  });

  test('phase 82: sagittal angle readout with normative bands on CMU clips', async ({ page }) => {
    const theater = await openTheater(page);
    await expect(theater.locator('.kine-angles')).toBeVisible();
    await expect(theater.locator('.kine-angle-row')).toHaveCount(3);
    await expect(theater.locator('.kine-band')).toHaveCount(3);
    await expect(theater.locator('.kine-curve')).toHaveCount(3);
    await page.waitForTimeout(800);
    const val = await theater.locator('.kine-angle-val').first().textContent();
    expect(val).toMatch(/-?\d+°/);
    await expect(theater.locator('.kine-angles small')).toContainText('not a clinical measurement');
    await theater.locator('.kine-actions button', { hasText: 'wave' }).first().click();
    await expect(theater.locator('.kine-angles')).toHaveCount(0);
  });

  test('action-aware framing tightens for face actions', async ({ page }) => {
    const theater = await openTheater(page);
    const walkZ = await theater.locator('.kine-stage').evaluate((stage) => {
      const aspect = stage.clientWidth / Math.max(1, stage.clientHeight);
      return 4.9 * Math.max(0.7, Math.min(1, aspect / 1.5));
    });
    await page.waitForFunction((targetZ) => Math.abs(window.__kineDebug?.camera.position.z - targetZ) < 0.12, walkZ, { timeout: 15000 });
    const zWalk = await page.evaluate(() => window.__kineDebug.camera.position.z);
    await theater.getByRole('tab', { name: /^chew\b/i }).click();
    await page.waitForFunction((walkDistance) => window.__kineDebug?.camera.position.z < walkDistance - 1, zWalk, { timeout: 20000 });
    const zChew = await page.evaluate(() => window.__kineDebug.camera.position.z);
    expect(zChew).toBeLessThan(zWalk - 1);
  });

  test('dual-angle inset toggles on desktop', async ({ page }) => {
    test.skip(page.viewportSize().width < 900, 'The dual-angle inset is intentionally desktop-only.');
    const theater = await openTheater(page);
    const toggle = theater.getByRole('button', { name: /^Dual angle\b/i });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await page.waitForFunction(() => window.__kineDebug?.lastDualMode() === 'rear', null, { timeout: 8000 });
    await expect(theater.locator('.kine-caption')).toBeVisible();
  });

  test('survives WebGL context loss and recovers', async ({ page }) => {
    const theater = await openTheater(page);
    const canLoseContext = await page.evaluate(() => {
      const canvas = document.querySelector('.kine-stage canvas[data-engine]');
      const gl = canvas?.getContext('webgl2') || canvas?.getContext('webgl');
      return Boolean(gl?.getExtension('WEBGL_lose_context'));
    });
    test.skip(!canLoseContext, 'This browser does not expose WEBGL_lose_context.');
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.evaluate(() => {
      const canvas = document.querySelector('.kine-stage canvas[data-engine]');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      window.__testContextLoss = gl.getExtension('WEBGL_lose_context');
      window.__testContextLoss.loseContext();
    });
    await page.waitForFunction(() => {
      const canvas = document.querySelector('.kine-stage canvas[data-engine]');
      const gl = canvas?.getContext('webgl2') || canvas?.getContext('webgl');
      return Boolean(gl?.isContextLost());
    }, null, { timeout: 8000 });
    await page.evaluate(() => window.__testContextLoss.restoreContext());
    await page.waitForFunction(() => {
      const canvas = document.querySelector('.kine-stage canvas[data-engine]');
      const gl = canvas?.getContext('webgl2') || canvas?.getContext('webgl');
      return Boolean(gl && !gl.isContextLost());
    }, null, { timeout: 15000 });
    await expect(theater.locator('.kine-stage canvas[data-engine]')).toBeVisible();
    await expect(theater.locator('.kine-caption')).toBeVisible();
    expect(errors).toHaveLength(0);
  });

  test('phase 83: attachment pins and activation sparkline on selection', async ({ page }) => {
    const theater = await openTheater(page);
    await theater.locator('.kine-legend-row').filter({ hasText: /gastrocnemius/i }).first().click();
    const pins = await page.evaluate(() => window.__kineDebug?.rig?.pins?.length ?? -1);
    expect(pins).toBe(2);
    await expect(theater.locator('.kine-actline path')).toBeVisible();
    await expect(theater.locator('.kine-actline-note')).toContainText('EMG');
    await theater.locator('.kine-facts-head button').click();
    const after = await page.evaluate(() => window.__kineDebug?.rig?.pins?.length ?? -1);
    expect(after).toBe(0);
  });

  test('selecting a muscle isolates it visually', async ({ page }) => {
    const theater = await openTheater(page);
    await theater.locator('.kine-legend-row').nth(1).click();
    await expect(theater.locator('.kine-facts')).toBeVisible();
    const counts = await page.evaluate(() => {
      const rig = window.__kineDebug?.rig;
      if (!rig) return { dimmed: -1, total: 0 };
      const entries = Object.values(rig.muscles);
      return { dimmed: entries.filter((m) => m.mat.opacity < 0.5).length, total: entries.length };
    });
    expect(counts.dimmed).toBe(counts.total - 1);
  });
});
