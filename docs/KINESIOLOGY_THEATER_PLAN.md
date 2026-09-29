# KINESIOLOGY THEATER — LANE 2 EXECUTION PLAN
**Status:** PROPOSED (awaiting human approval to execute) · **Date:** 2026-09-29
**Scope decision (user-directed):** Execute **Lane 2** — realistic skinned human + motion-capture-driven actions with per-muscle activation visualization and a multi-angle camera director. Lane 1 (procedural mannequin) survives only as the *constrained-device schematic fallback* inside this plan.

---

## §0 · Doctrine carried forward (hard constraints)

1. **Certified atlas never performs.** BodyParts3D remains the static certified reference. The Kinesiology Theater rig is a separate **performance/teaching model**, visibly badged, never implied to be the certified source.
2. **Five-gate process for every new 3D source** (Phase 36 law): **G1 Scientific accuracy · G2 Provenance · G3 License · G4 Human visual review · G5 Integration/verification.** No gate may be passed by automation; G1 and G4 require explicit human (user) sign-off recorded in docs. No fabricated approvals.
3. **Explain, don't perform.** Every animation ships with scrub, phase captions, checkpoints, reduced-motion static frames, keyboard parity.
4. **No clinical claims.** Educational schematics of normal movement only; disclosures visible in-module.
5. **Governance posture:** every visual change queues pending visual-review cases; `report:release` stays **blocked** while any case (including the existing 32) is pending. Motion-Fall and all existing bays untouched.
6. Accuracy over realism. Where a retarget or simplification deviates from source data, we disclose it.

---

## §1 · Experience specification

**Actions v1 (user-listed):** walking · running · jumping (vertical jump with countermovement) · waving hand · shaking hands · munching (chewing) · talking.

**Per action the student can:**
- Play / pause / **scrub** / speed 0.25×–1×; phase timeline with labeled phases.
- See **muscle activation** as emissive glow on anatomically placed muscle meshes, color-coded by role: **prime mover** (hot), **synergist** (warm), **stabilizer** (cool), with an intensity meter per muscle and a legend panel.
- Switch **camera angles**: Anterior · Posterior · Left lateral · Right lateral · Superior-oblique · **Close-up follow** (auto-frames the dominant joint group per phase) · **Turntable** (auto-orbit) · free orbit/zoom (OrbitControls).
- Read phase captions ("Push-off: gastrocnemius–soleus prime movers; hip flexors pre-loading swing") and answer checkpoints ("Which muscles decelerate the knee just before heel strike?").
- See the disclosure badge at all times: *"Performance teaching model — open-licensed rig driven by motion capture. Not the certified BodyParts3D reference; joint motion simplified for education."*
- Cross-link: *"See this muscle static in the certified atlas"* per muscle card (lane separation, one-way reference).

**Reduced motion / constrained tier:** static pose frames per phase with direction arrows + activation list (no autoplay); see §8.

---

## §2 · Architecture

New conceptual route `/kinesiology` (nav entry "Movement Theater", badged *conceptual performance model*). Components:

- `src/components/KinesiologyTheater.jsx` — shell, disclosure, camera director UI, timeline, legend.
- `src/lib/kinesiology/rigLoader.js` — lazy GLB loader (skin LODs + muscle layer), material slot registry.
- `src/lib/kinesiology/cameraDirector.js` — preset poses, follow-cam, turntable, orbit handoff.
- `src/lib/kinesiology/activationData.js` + `src/data/kinesiology/*.json` — per-action phase definitions and muscle→role→intensity-over-phase curves (seed tables §5, validated in G1).
- `src/lib/kinesiology/jawTracks.js` — authored jaw/facial teaching tracks (§7 Phase 71), clearly labeled *authored, not mocap*.
- Reuse: deviceProfile tiers, reduced-motion hooks, focus/keyboard system, TV mode, offline cache (lazy chunk + size budget).

Assets live in `vendor/kinesiology/` with a provenance sidecar `vendor/kinesiology/PROVENANCE.json` (per file: origin, license, transformation chain, checksum). **The app never offers raw asset downloads** (Mixamo fallback clause; CMU no-resell clause).

---

## §3 · Asset strategy & production pipeline (G2/G3 evidence base)

| Need | Primary candidate | License grounding | Fallback |
|---|---|---|---|
| Skinned realistic body + **muscle layer on same rig** | **MakeHuman / MPFB core assets** (base mesh, targets, anatomical muscle assets) | Core assets & exports **CC0** — "All core assets (the base mesh, targets, skins…) are shared under CC0"; exported models CC0 [1][2][3] | CC-BY anatomical rig from Sketchfab (per-model G2/G3 audit) |
| Body motion (walk/run/jump) | **Classic CMU Motion Capture Database** (mocap.cs.cmu.edu) | "Free for use in research projects. You may include this data in commercially-sold products, but you may not resell this data directly, even in converted form" + required acknowledgment text [4] | Mixamo (royalty-free embedded in finished projects; no raw redistribution) [5][6] |
| Social actions (wave/handshake) if absent/weak in CMU | CMU interactions first, else **Mixamo** (royalty-free, embed-only) | as above | authored procedural tracks (disclosed) |
| Jaw / facial (chew/talk) | **Authored teaching tracks** (no open face-mocap with clean license) | we author → CC0-by-us; disclosed as authored | — |
| SMPL/SMPL-X | **EXCLUDED** | Non-commercial-research-only license; commercial use behind Meshcapade paywall [7][8] | — |

**Important exclusions recorded:** CMU **I-MOVE-23** (CC BY-NC-SA) must NOT be used — only the *classic* database with its acknowledgment text [9]. SMPL-X excluded unless a commercial sub-license is ever obtained (decision record D2).

**Pipeline (documented, reproducible):**
1. MakeHuman/MPFB: neutral adult phenotype (documented slider sheet), export default rig + skin + muscle meshes (per-muscle material slots).
2. Blender (MPFB add-on): retarget selected CMU AMC/BVH clips onto the rig; clean foot-slide / shoulder pops; normalize clip lengths; bake.
3. Author jaw/facial tracks for chew/talk; bind to jaw bone only.
4. Decimate to 3 LODs (budget §8); Draco-compress GLB; write `PROVENANCE.json` (origin → every transform → checksum) and license acknowledgments (CMU attribution string shipped in-app credits + docs).
5. All artifacts are **derived works we own**, built only from CC0 / royalty-free-embed / authored inputs — but each still passes G1/G4/G5 before use.

---

## §4 · Five-gate mapping & evidence trail

| Gate | Evidence artifact | Approver |
|---|---|---|
| G1 Scientific | `docs/KINESIOLOGY_SCIENTIFIC_INSPECTION.md` — joint-ROM audit vs literature, muscle origin/insertion plausibility on the rig, activation-table review, retarget biomechanics sanity | **Human (user)** |
| G2 Provenance | `vendor/kinesiology/PROVENANCE.json` + `docs/PROVENANCE_AUDIT_KINESIOLOGY.md` (per-file chain of custody) | Human confirms |
| G3 License | license ledger in the audit doc: CC0 (MakeHuman core), CMU classic terms + acknowledgment, Mixamo embed-only clause; exclusion list (SMPL-X, I-MOVE-23) | Human confirms |
| G4 Visual | per-phase pending cases in `scripts/visual-review-status.json`; human eyes on evidence screenshots per camera preset & action | **Human (user) only** |
| G5 Integration | `scripts/kinesiology-*-smoke.mjs` + browser specs (loader, mixer determinism, camera presets, a11y, tier fallback) | automation *verifies*, never approves |

Registry hooks: new entry in the 3D-source registry (`report:3d-sources`) as **pending** until G1–G4 complete; `release-readiness` counts it as blocking until approved.

---

## §5 · Seed activation tables (validated in G1; roles: PM=prime mover, SY=synergist, ST=stabilizer)

**Walking** — Loading: tibialis anterior PM, quadriceps PM (ecc), gluteus medius ST · Mid-stance: soleus PM, gluteus medius ST · Push-off: gastrocnemius+soleus PM, iliopsoas SY · Swing: iliopsoas+rectus femoris PM, tibialis anterior PM (clearance), hamstrings SY (terminal decel).
**Running** — same loop, higher amplitudes; add gluteus maximus PM (hip extension), hamstrings PM (terminal swing decel), deltoid/latissimus dorsi SY (arm drive), core ST.
**Jumping** — Countermovement: quads+glutes+gastroc-soleus ecc ST/PM · Take-off triple extension: gluteus maximus PM, quadriceps PM, gastrocnemius+soleus PM, deltoid SY (arm swing) · Landing: same extensors ecc.
**Waving** — middle deltoid PM, supraspinatus SY, upper trap+serratus anterior ST (scapular upward rotation), wrist flexor/extensor oscillators PM (hand wave).
**Handshake** — flexor digitorum superficialis+profundus PM, opponens/adductor pollicis PM, brachialis+biceps ST (elbow ≈90°), pronator teres SY (orientation), wrist extensors ST.
**Munching** — masseter+temporalis+medial pterygoid PM (elevation), lateral pterygoid PM (protrusion/grinding), digastric+mylohyoid PM (depression), buccinator SY (bolus positioning).
**Talking** — masticatory set at speech amplitudes (SY/PM context-dependent) + orbicularis oris, buccinator, mentalis (schematic facial bands), genioglossus (tongue, schematic) — disclosed as simplified.

---

## §6 · Camera director specification

Presets: `anterior`, `posterior`, `lateral-L`, `lateral-R`, `superior-oblique`, `closeup-follow`, `turntable`, plus free orbit. Keyboard: `1–7` presets, `Space` play/pause, `,`/`.`` step, `[`/`]` speed, `M` cycle muscle-highlight mode. All preset buttons ≥44 px (coarse) / 48 px (TV); focus halos per TV mode. Follow-cam targets per-phase joint groups defined in action JSON. Turntable respects reduced-motion (disabled; replaced by 4 static angle cards).

---

## §7 · Phases 64–72 (execute in numerical order)

**Phase 64 — Governance scaffolding & decision record.** Deliverables: this plan; `docs/PROVENANCE_AUDIT_KINESIOLOGY.md` + `docs/KINESIOLOGY_SCIENTIFIC_INSPECTION.md` templates; 3D-source registry pending entry; decision records D1 (body=MakeHuman), D2 (SMPL-X excluded), D3 (jaw=authored), D4 (fallback=procedural schematic). Exit: templates + registry entry exist; release still blocked. *No runtime code.*

**Phase 65 — Asset discovery & license audit (G2/G3 evidence).** Download/inspect MakeHuman core + anatomical assets; select CMU classic clips per action (walk/run/jump/interactions); verify wave/handshake coverage else Mixamo; per-file license ledger; acknowledgment strings. Exit: `ASSET_MANIFEST.json` + audit doc drafted; **G2/G3 pass only on user's human sign-off**.

**Phase 66 — Production pipeline.** MakeHuman export → Blender retarget/bake → jaw bone tracks → 3 LODs → Draco GLB into `vendor/kinesiology/` + `PROVENANCE.json`. Exit: artifacts load via three.js loader smoke (`kinesiology-asset-smoke.mjs`: parses, bone count, clip durations, checksum match).

**Phase 67 — Scientific inspection (G1).** ROM audit, muscle placement review, retarget artifact review (foot-slide, pops), activation-table validation against seed §5; write inspection doc. Exit: **user human sign-off** or remediation loop.

**Phase 68 — Player runtime.** Route, lazy loader, mixer with scrub/speed, disclosure banner, atlas cross-link, camera director presets + orbit + turntable. Queues G4 cases. Browser spec `phase68-kinesiology-player.spec.mjs`.

**Phase 69 — Activation system.** Schema, emissive glow per role, intensity meters, legend, per-muscle info cards with atlas cross-link, toggle. Queues G4 cases.

**Phase 70 — Action library v1.** Walk/run/jump/wave/handshake with phase timelines, captions, checkpoints. Queues G4 cases. Spec `phase70-kinesiology-actions.spec.mjs`.

**Phase 71 — Jaw & speech tracks.** Munch/talk authored tracks + disclosures; mastication captions/checkpoints. Queues G4 cases.

**Phase 72 — Learning layer, a11y, tiers, regression.** Reduced-motion frames, keyboard map §6, coarse/TV targets, performance budget verification, schematic fallback wiring, offline cache entries, full `npm run verify` + Playwright, final G4 evidence pack. Exit: module feature-complete **pending human visual approvals**; release remains blocked.

---

## §8 · Performance budget per device tier

| Tier | Geometry | pixelRatio | Notes |
|---|---|---|---|
| Capable desktop/flagship | LOD0 skin ~45k tris + muscles ~60k | ≤2 | full camera director |
| Mid | LOD1 ~60k combined | ≤1.5 | turntable ok |
| Constrained handset / Save-Data / ≤2 GB | **procedural schematic fallback** (Lane-1-style capsules+muscle bars, ~8k) | ≤1 | captions/meters identical |
| TV (`ff-tv`) | LOD1, pixelRatio 1 | 1 | conservative tier, 10-foot UI |

Lazy-load: route chunk + GLB fetched on first visit; offline cache size-budgeted and documented.

---

## §9 · Risks & mitigations

| Risk | Mitigation |
|---|---|
| License ambiguity on any file | per-file ledger in G2/G3; exclusion list; Mixamo embed-only honored (no raw downloads) |
| Retarget artifacts (foot-slide, pops) | cleaning pass in Phase 66 + G1 visual-biomechanics review; disclose simplifications |
| Uncanny face | jaw-bone-only facial approach; schematic facial bands; disclosure |
| Asset weight on low tier | 3 LODs + schematic fallback; lazy load; budget verified in Phase 72 |
| Activation-timing disputes | seed tables + G1 inspection + "educational simplification" disclosure; cite sources |
| Scope creep (more actions) | v1 frozen at the seven user-listed actions; additions queue as later phases |

---

## §10 · Governance posture during execution

- Every Phase 68–72 visual deliverable queues pending review cases (est. +10–14 → ledger grows from 32).
- `report:release` and visual-review gates **remain blocked** until a human approves; automation only verifies.
- No approval, sign-off, or learning-study result is ever fabricated.
- Motion-Fall, certified atlas, and existing bays: untouched.

---

## §11 · Sources (license grounding)

1. MakeHuman/MPFB FAQ — core assets CC0, closed-source shipping ok: static.makehumancommunity.org/mpfb/faq/use_in_closed_source.html
2. MakeHuman license summary — code AGPLv3, bundled assets CC0, outputs unrestricted.
3. MakeHuman Wiki FAQ — exported models CC0, commercial use ok.
4. CMU Mocap (Kaggle mirror of mocap.cs.cmu.edu terms) — free for research; includable in commercial products; no direct resell even converted; acknowledgment required.
5. Adobe Mixamo FAQ — royalty-free personal/commercial/non-profit; no redistribution of raw assets.
6. Cinevva guide (2026) — Mixamo embed-in-shipped-product fine; raw redistribution not.
7. MMHuman3d docs — SMPL/SMPL-X non-commercial scientific research license.
8. smplx GitHub — same; commercial via ps-licensing@tue.mpg.de.
9. CMU I-MOVE-23 site — CC BY-NC-SA 4.0 → excluded from this project.

- Developer reference: [docs/RIG_MAPPING.md](RIG_MAPPING.md) — bone mapping (CMU/Unity/UE5/Mixamo) + foot-IK rationale (Phase 84).
