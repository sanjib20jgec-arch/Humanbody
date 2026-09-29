# Phase 4 report

Date: 2026-09-27
Project: Motion-Fall Lab

## Delivered

- Added an explicit `BONE_ALIASES` table for pelvis, torso, head, upper/lower arms, and upper/lower legs.
- Added optional character scene validation for mesh count, skinned meshes, bone count, materials, and usable bounds.
- Added character normalization: target height, ground placement, and centered X/Z origin.
- Added a lightweight character adapter with mapped-bone metrics and lifecycle disposal.
- Added proxy-to-character pose adaptation from the physically simulated proxy meshes using world-to-parent-local transforms and quaternion blending.
- Kept the proxy mannequin as the fallback when the optional GLB is absent, invalid, unsupported, or unparseable.
- Added optional GLB load progress and clear asset status messages.
- Added asset cleanup when replacing or rejecting a loaded character.
- Updated asset documentation with runtime bone mapping behavior and flagship-phone guidance, including hair-card recommendations.
- Added Phase 4 contract tests and updated the default `npm test` command.

## Passing checks

- `npm test`
- JavaScript syntax checks
- Phase 0 static smoke
- Phase 1 deterministic-core contract
- Phase 2 physics-credibility contract
- Phase 3 rendering/performance contract
- Phase 4 asset-adapter contract
- `verification/phase-4-file-hashes.sha256`

## Still pending

- Browser verification with a real optional GLB: normalization, skeleton aliases, skin deformation, and pose alignment need visual inspection.
- A valid `assets/character.glb` is still intentionally absent, so the current preview uses the proxy path.
- Phase 5 scope remains PWA/deployment hardening, update handling, install icons, cache integrity, and fresh-context offline verification.
