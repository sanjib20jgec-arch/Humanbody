# Release readiness report

Overall status: **BLOCKED**

| Check | Status | Detail |
| --- | --- | --- |
| Automated build and offline verification | passed | Covered by npm run verify |
| Source-anchor QC | passed | Covered by npm run verify:teaching-overlays and npm run verify:overlay-spec |
| Evidence ledger contract (Phase 26) | passed | Every registry entry and teaching route resolves to a cited evidence record |
| Structure identity and geometry QC (Phase 27) | passed | Identity, topology, and bounds checks over all 2,234 atlas parts |
| Framing and orientation contract (Phase 28) | passed | Orientation labels and preset yaw targets verified |
| Accessible structure catalog (Phase 31) | passed | Keyboard route resolves exact certified parts with limitations |
| Cardiac and digestive state machines (Phase 32) | passed | Explicit states, valve events, hysteresis, and accessory-organ separation |
| Performance budgets (Phase 34) | passed | Static budgets per device tier enforced; runtime targets reported from browser profiling |
| WebGL context-loss coverage (Phase 35) | passed | Browser test forces WEBGL_lose_context and verifies recovery |
| Rendering registry and honesty records (Phases 40–49) | passed | 10 rendering modes carry shows/neverImplies/disclosure records; battery tier stays clean |
| Materials and lighting budgets (Phase 41) | passed | Clearcoat/roughness budgets and tier capability flags verified |
| Timeline director determinism (Phase 45) | passed | Deterministic event streams, seek, and state round-trip verified |
| Ventilation and conduction models (Phases 50, 55) | passed | Pressure invariants and reflex timing ordering verified |
| Human visual sign-off (Phase 37) | blocked | 2 route sign-off records remain pending; rubric and build hash are recorded |
| Pending mode reviews (Phases 40–63) | blocked | 38 new rendering/animation/interaction modes await human visual review before release |
| Future 3D asset approval (Phase 36) | review | 8 candidate records remain non-runtime candidates with five-gate review fields |
| Learning validation study (Phase 38) | informational | Status: planned. No educational-benefit claim may be made until a study record exists. |
| Offline/runtime policy | passed | No candidate source is loaded by runtime |

Release remains blocked until human visual sign-off and any required source approvals are complete. Informational items do not block, but they must not be presented as completed validation.
