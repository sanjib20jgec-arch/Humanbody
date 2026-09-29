# Guided Path Phase 25 report

Added the release-readiness audit in `scripts/release-readiness.mjs`.

- `report:release` produces `RELEASE_READINESS.md`.
- `verify:release` is the strict gate.
- Normal verification passes automated checks while clearly reporting the remaining human visual-signoff block.

The final strict release gate is intentionally blocked until Phase 22 human approval is recorded. No unreviewed 3D candidate is treated as runtime-approved.