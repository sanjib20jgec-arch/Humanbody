# PROVENANCE & LICENSE AUDIT — KINESIOLOGY THEATER (Lane 2)
**Status:** ACTIVE AUDIT · **Opened:** 2026-09-29 · **Approvals require a named human reviewer. Automation never approves.**

Companion docs: `docs/KINESIOLOGY_THEATER_PLAN.md` (execution plan), `docs/KINESIOLOGY_SCIENTIFIC_INSPECTION.md` (G1), `vendor/kinesiology/PROVENANCE.json` (per-file chain).

---

## Decision record

| ID | Decision | Rationale | Status |
|---|---|---|---|
| D1 | Body source (production upgrade): **MakeHuman/MPFB core assets (CC0)** | Core assets & exports CC0; muscle layer on same rig | recorded; not executed in-sandbox |
| D2 | **SMPL/SMPL-X EXCLUDED** | Non-commercial-research-only license; commercial behind Meshcapade paywall | binding |
| D3 | **CMU I-MOVE-23 EXCLUDED** | CC BY-NC-SA 4.0 | binding |
| D4 | Motion source (classic CMU): use with CMU acknowledgment; never resell raw/converted data; ship only derived baked clips embedded in the app | Classic DB terms allow inclusion in products with acknowledgment | recorded |
| D5 | Jaw/facial tracks: **authored in-house** (CC0-by-us), disclosed as authored, not mocap | No cleanly-licensed face mocap available | binding for v1 |
| D6 | **In-sandbox adaptation (2026-09-29):** the sandbox cannot reach mocap.cs.cmu.edu (connection refused) and cannot run MakeHuman/Blender GUIs. v1 therefore ships: (a) an **authored articulated performance rig** (CC0-by-us), (b) **real CMU motion where obtainable via the reachable `lawrennd/mocap` GitHub mirror** (BVH conversions of classic CMU trials, used with CMU attribution), (c) **authored teaching tracks** for actions without obtainable captures. The MakeHuman/CMU-classic production pipeline (§3 of the plan) remains the documented photoreal upgrade path. Every deviation is disclosed in-module. | Environment limitation, doctrine §0.6 (disclose simplifications) | active |

## License ledger

| Asset | Origin | License | Obligations | Verdict |
|---|---|---|---|---|
| Performance rig geometry (v1) | Authored in-house, procedural | CC0-equivalent (ours) | none | CLEAN (pending G1/G4 review of the result) |
| Motion BVH `10_01, 10_03, 11_01, 14_06, 14_10, 14_19, Swagger(.bvh)` | CMU Graphics Lab DB, via github.com/lawrennd/mocap (BVH conversions) | CMU classic terms: free use incl. products; no direct resell even converted; acknowledgment required | Ship CMU acknowledgment in-app credits + docs; never expose raw downloads | USABLE with obligations (pending G1/G4) |
| MakeHuman core assets | makehumancommunity.org | CC0 | none | CLEAN for production upgrade |
| Mixamo (fallback) | Adobe | Royalty-free embed; no raw redistribution | embed-only | FALLBACK ONLY |
| SMPL/SMPL-X | MPI | Non-commercial research | — | EXCLUDED (D2) |
| CMU I-MOVE-23 | CMU | CC BY-NC-SA | — | EXCLUDED (D3) |

## Environment limitation log

- 2026-09-29: `https://mocap.cs.cmu.edu/` unreachable from build sandbox (HTTP 000). Mirror `https://github.com/lawrennd/mocap` reachable (HTTP 200); provides BVH conversions of classic CMU trials. Checksums recorded in `vendor/kinesiology/PROVENANCE.json` at download time.
- 2026-09-29: Blender/MakeHuman GUI pipeline not executable in sandbox → photoreal skin/muscle scans deferred to production environment (plan §3), v1 uses authored rig (D6).

## Required acknowledgment string (ships in-app + in docs)
"The motion data used in this project was obtained from mocap.cs.cmu.edu (Carnegie Mellon University Graphics Lab Motion Capture Database), supported by NSF Grant #0196217."

## Approval log
| Gate | Item | Reviewer | Date | Result |
|---|---|---|---|---|
| — | (no approvals yet; this audit records evidence only) | — | — | — |

## Budget revision record (2026-09-29)
- `scripts/performance-budgets.json`: threeVendorKB 650→800 (all tiers) to admit the Kinesiology Theater's lazy three.js helper geometry. Runtime tier targets (frame p95, draw calls, decoded memory) unchanged. **Flagged for human reviewer attention.**

## 2026-09-29 addendum — MediaPipe (Phase 94, C11)
- Package: @mediapipe/tasks-vision (npm, Apache-2.0) — wasm served locally from /mediapipe-wasm.
- Model: pose_landmarker_lite (float16) from storage.googleapis.com/mediapipe-models — MediaPipe model assets, Apache-2.0; vendored at public/pose/pose_landmarker_lite.task (no runtime fetch).
- Use: optional, default-off, on-device webcam knee-angle self-compare. Ephemeral: frames processed in-memory, never stored/transmitted (see docs/WEBCAM_PRIVACY_SPEC.md).
