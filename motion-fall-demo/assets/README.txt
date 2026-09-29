Motion Fall Lab — optional local assets

The demo runs without this folder containing any binary asset: a procedural proxy mannequin is the required fallback.

Optional files
- character.glb
  A glTF 2.0 binary character asset. The loader hook in app.js validates, normalizes, and attempts to bone-map it; it keeps the proxy mannequin if the file is absent, invalid, or cannot be parsed. A loaded asset receives proxy-body pose transforms when aliases are found.
- studio_env.hdr
  An equirectangular HDR environment map. The app attempts to load it, then falls back to Three.js RoomEnvironment when it is absent or unsupported.

Flagship-phone character asset guidance
- Prefer a single GLB under 8 MB, with a practical target of 2–5 MB.
- Use one skinned mesh where possible, one 1K–2K texture set, and compressed geometry/textures when your pipeline supports them.
- Keep the body in a neutral T-pose or A-pose, facing +Z, with a consistent 1 unit = 1 metre convention.
- Include named bones that can be mapped to: hips/pelvis, spine or chest, head, upper/lower arms, and upper/lower legs.
- Avoid simulation-critical dependencies on facial rigs, cloth, or high-frequency morph targets; prefer efficient hair cards instead of dense strand geometry.
- Test touch orbit, portrait layout, and first-load memory on a current flagship phone before release.

Later bone-mapping integration
1. Load the GLB scene and inspect its SkeletonHelper/bone names.
2. Add a small explicit alias table in app.js for hips, chest, head, upper/lower arm, and upper/lower leg bones.
3. Normalize the asset's rest pose and scale against the proxy mannequin's segment transforms.
4. Drive mapped bone quaternions from the same physical body targets used by the proxy; keep the proxy bodies as the simulation authority.
5. Blend physical-animation targets toward the ragdoll pose during Collapse, and return toward the authored upright pose during Recover.
6. Keep the proxy fallback path and a reduced-quality phone path available when skinning or texture memory is constrained.

Do not put personal or sensitive imagery in this folder. Safety language in the application is intentionally neutral and limited to motion, impact region, direction, intensity, balance, and recovery.
