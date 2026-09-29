/**
 * Phase 42: post-processing stack for the atlas, loaded lazily and only on
 * tiers whose capability flag allows it. SSAO adds contact shadowing that
 * emphasizes depth between existing surfaces — it must never read as
 * cavities or internal anatomy (see RENDERING_MODES.ssao).
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export function createAtlasPostFX({ renderer, scene, camera, width = 1, height = 1 }) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const ssao = new SSAOPass(scene, camera, Math.max(1, width), Math.max(1, height));
  // Scene scale is ~1.7 world units for the whole body; keep the occlusion
  // radius small so shading stays subtle contact shadowing.
  ssao.kernelRadius = 0.22;
  ssao.minDistance = 0.0008;
  ssao.maxDistance = 0.12;
  composer.addPass(ssao);
  composer.addPass(new OutputPass());
  return {
    composer,
    ssao,
    setSize(nextWidth, nextHeight, pixelRatio) {
      composer.setPixelRatio(pixelRatio);
      composer.setSize(Math.max(1, nextWidth), Math.max(1, nextHeight));
    },
    render() {
      composer.render();
    },
    dispose() {
      ssao.dispose?.();
      composer.passes.forEach((pass) => pass.dispose?.());
      composer.dispose?.();
    }
  };
}
