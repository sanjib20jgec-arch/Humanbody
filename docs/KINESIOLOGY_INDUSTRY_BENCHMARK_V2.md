# Movement Theater — Industry Benchmark v2 (2026-09-29)

Scope: re-examination of the HBL Movement Theater (post Phase-80) against current
industry standards in (a) research musculoskeletal simulation, (b) clinical gait
analysis, (c) commercial anatomy-education platforms, and (d) game-engine
character-animation practice. Sources fetched 2026-09-29; numbered in §Sources.
This is a comparison/reference document — no code changed, no new assets added.

## 1. The four industry reference classes

### 1.1 Research-grade simulation — OpenSim / OpenCap (Stanford NMBL)
- OpenSim is the de-facto open-source platform for neuromusculoskeletal simulation:
  muscle actuators, computed muscle control (CMC), muscle-induced acceleration
  analysis, subject-specific SimTrack pipelines [1](https://nmbl.stanford.edu/publications/pdf/Delp2007.pdf).
- The reference full-body model (Rajagopal 2016) has 22 rigid bodies, 37 DOF and
  **80 muscle-tendon units (40/leg)**, with architecture from cadaver + MRI data and
  validation against inverse-dynamics moments **and EMG** [2](https://nmbl.stanford.edu/wp-content/uploads/Rajagopal2016.pdf).
- OpenCap (Uhlrich et al. 2023, *PLOS Comp Biol*) makes this web-accessible: two
  smartphone videos → pose estimation → OpenSim IK/ID, joint-angle errors vs
  marker-based of 1.7–10.3° for walking/squat/jump [12](https://www.tandfonline.com/doi/full/10.1080/02640414.2024.2415233), [13](https://www.frontiersin.org/journals/digital-health/articles/10.3389/fdgth.2026.1882536/xml).

### 1.2 Clinical gait analysis — terminology + normative values
- The **Rancho Los Amigos (RLA)** phase terminology (initial contact, loading
  response, mid-stance, terminal stance, pre-swing; initial/mid/terminal swing) is
  the preferred clinical standard; traditional terms (heel strike, foot flat…)
  describe momentary events [7](https://uw.cloud-cme.com/assets/uw/Presentations/1140/Mon_845_Guthrie.pdf), [8](https://www.slideshare.net/saurabsharma/gait-analysis-normal-gait-ss-teaching).
- Normative spatiotemporal values: velocity ≈ 80 m/min (≈1.3 m/s), cadence ≈
  110–116 steps/min, stride ≈ 144 cm, step ≈ 72 cm, step width 7–10 cm, toe-out
  5–7°, stance ≈ 60 % of cycle [7](https://uw.cloud-cme.com/assets/uw/Presentations/1140/Mon_845_Guthrie.pdf), [8](https://www.slideshare.net/saurabsharma/gait-analysis-normal-gait-ss-teaching).
- Markerless clinical systems (Theia3D) agree well for **sagittal** hip/knee angles
  and spatiotemporal parameters but are **not interchangeable** with marker-based
  for rotations/frontal plane [11](https://www.nature.com/articles/s41598-024-80499-8).

### 1.3 Commercial anatomy-education platforms
- **Complete Anatomy (Elsevier/3D4Medical):** real-time muscle motion (contract/relax
  while you orbit), origin/insertion mapping and innervation tracing, isolation &
  fade, dissection, 700+ atlas screens, courses, quizzes, AR [3](https://3d4medical.com/student), [4](https://apps.microsoft.com/detail/9nblggh40f2t).
- **Visible Body (Human Anatomy Atlas + Muscle Premium):** 600+ muscles, ~60 curated
  *muscle-action animations* organized by movement, attachment pins on a painted
  skeleton, pronunciations, definitions, quizzes; users still report missing/
  incomplete muscle actions (e.g. hamstrings) [5](https://libguides.lib.cuhk.edu.hk/visiblebody), [6](https://zspace.com/edu/info/human-anatomy-atlas-for-zspace), [14](https://play.google.com/store/apps/details?id=com.visiblebody.atlas).

### 1.4 Game-engine animation practice
- Playback is **FK from baked clips; IK is a runtime layer** for foot planting, hand
  placement, look-at — exactly our architecture (BVH FK + runtime two-bone IK) [10](https://mocaponline.com/blogs/mocap-news/unity-animation-rigging-guide).
- Unity Humanoid Avatar defines the retarget standard (≈15 required bones, automatic
  mapping); UE5 uses IK Retargeter chains. **Foot sliding is the canonical retarget
  artifact**, fixed by IK or retarget-profile tuning — the problem our Phase-76 metric
  targets [9](https://mocaponline.com/blogs/mocap-news/skeleton-3d-model-rigging-games).
- Industry guidance: streamlined 45–55-bone game rigs retarget cleanest; our 14-bone
  teaching rig is intentionally below that (performance + pedagogy) [9](https://mocaponline.com/blogs/mocap-news/skeleton-3d-model-rigging-games).

## 2. Feature matrix (honest self-assessment)

| Dimension | OpenSim/OpenCap | Complete Anatomy | Visible Body | **HBL Theater (v80)** |
|---|---|---|---|---|
| Anatomy depth | 80 MTU/leg, MRI-based | thousands of structures | 600+ muscles | 54 teaching meshes (disclosed) |
| Motion source | subject-specific sim | authored loops | ~60 action loops | 2 CMU captures + 5 authored tracks (badged) |
| Muscle activity basis | CMC + EMG-validated | qualitative contraction | qualitative contraction | heuristic bumps, curated PM/SY/ST roles (disclosed) |
| Quantitative readouts | joint angles/moments/EMG | — | — | speed + bounce only (internal metric) |
| Gait terminology | RLA + %gait cycle | — | — | traditional only (heel strike/mid-stance/…) |
| Origin/insertion | model geometry | 3D mapping + tracer | pins on skeleton | text card only |
| Isolation/solo | model editing | isolate/fade/dissect | hide/fade | solo dim + facts card ✓ |
| Foot planting | IK/simulation | n/a (loops) | n/a | two-bone IK, slide −79 % ✓ |
| Accessibility | limited | app-level | app-level | WCAG 2.2, reduced-motion, keyboard parity ✓✓ |
| Cost/license | open (Apache-ish) | subscription | purchase/sub | free, local, CC-credited CMU |
| Runs in browser, offline | OpenCap web (cloud compute) | no | no | **yes (PWA)** ✓✓ |

## 3. Gap analysis vs normative data (self-audit)

1. **Walk speed honesty.** Our CMU walk measures 0.9 m/s; normative comfortable is
   ≈1.3 m/s [7](https://uw.cloud-cme.com/assets/uw/Presentations/1140/Mon_845_Guthrie.pdf), [8](https://www.slideshare.net/saurabsharma/gait-analysis-normal-gait-ss-teaching). The clip is therefore a *leisurely* walk — nothing wrong with the data,
   but the UI never says so. Gap: no normative context shown to the learner.
2. **Vertical bounce metric.** Smoke prints 23.4 cm root vertical range for walk;
   true centre-of-mass displacement in normal gait is ~4–5 cm. Our number is root-bone
   range (includes pelvic-list artefact), not CoM — presenting it as "bounce" without
   a definition risks teaching a wrong magnitude.
3. **Terminology.** Captions use traditional phase names only; RLA is the clinical
   standard learners will meet in textbooks/clinics [7](https://uw.cloud-cme.com/assets/uw/Presentations/1140/Mon_845_Guthrie.pdf), [8](https://www.slideshare.net/saurabsharma/gait-analysis-normal-gait-ss-teaching).
4. **No joint-angle or gait-event readout.** Research and clinical tools lead with
   sagittal hip/knee/ankle curves and %gait-cycle events; we show none (by design,
   but a teaching readout with normative bands is the highest-value addition).
5. **Origin/insertion are text-only.** Both commercial atlases show attachments as
   3D pins/mapping; our facts card is text — a visual-pin gap [3](https://3d4medical.com/student), [6](https://zspace.com/edu/info/human-anatomy-atlas-for-zspace).
6. **Activation model provenance.** Our bumps are animator heuristics; they happen to
   follow published EMG timing windows (TA loading+swing, gastrocnemius terminal
   stance, quads loading) but we never cite or display that lineage, unlike
   OpenSim's EMG validation [2](https://nmbl.stanford.edu/wp-content/uploads/Rajagopal2016.pdf).
7. **Retarget standard undocumented.** Our 14-bone map vs Unity Humanoid's required
   set is unmapped in docs — a developer-facing parity table is missing [9](https://mocaponline.com/blogs/mocap-news/skeleton-3d-model-rigging-games).

## 4. Where we stand

The Theater occupies a niche no single commercial product fills: **captured human
motion + choreographed muscle-role teaching + full browser/offline/a11y delivery**.
Versus OpenSim we trade quantitative fidelity for accessibility and zero install;
versus Complete Anatomy/Visible Body we trade anatomical breadth for *time-domain*
teaching (phases, roles, activation over the cycle); versus game pipelines we match
architecture (FK + runtime IK) and beat them on disclosure honesty. The gaps are
concentrated in **clinical vocabulary and quantitative readouts**, not in rendering.

## 5. Recommendations (candidate next round; no scope change until approved)

| # | Recommendation | Value | Effort | Standards met |
|---|---|---|---|---|
| B1 | Dual terminology: RLA + traditional phase names, %gait-cycle scrub ticks | high | S | [7](https://uw.cloud-cme.com/assets/uw/Presentations/1140/Mon_845_Guthrie.pdf), [8](https://www.slideshare.net/saurabsharma/gait-analysis-normal-gait-ss-teaching) |
| B2 | Live sagittal hip/knee/ankle angle readout with normative band shading (walk only, labelled "teaching estimate") | high | M | [1](https://nmbl.stanford.edu/publications/pdf/Delp2007.pdf), [11](https://www.nature.com/articles/s41598-024-80499-8) |
| B3 | Spatiotemporal honesty panel: measured speed/cadence/step vs normative ranges, clip labelled "leisurely" | high | S | [7](https://uw.cloud-cme.com/assets/uw/Presentations/1140/Mon_845_Guthrie.pdf), [8](https://www.slideshare.net/saurabsharma/gait-analysis-normal-gait-ss-teaching) |
| B4 | 3D origin/insertion pins on selection (spheres at attachment anchors) | medium | S | [3](https://3d4medical.com/student), [6](https://zspace.com/edu/info/human-anatomy-atlas-for-zspace) |
| B5 | Facts-card "activation window" sparkline aligned to cited EMG timing literature | medium | S | [2](https://nmbl.stanford.edu/wp-content/uploads/Rajagopal2016.pdf) |
| B6 | Developer doc: 14-bone rig ↔ Unity Humanoid ↔ CMU mapping table + foot-IK rationale | medium | XS | [9](https://mocaponline.com/blogs/mocap-news/skeleton-3d-model-rigging-games), [10](https://mocaponline.com/blogs/mocap-news/unity-animation-rigging-guide) |
| B7 | Rename/define the bounce metric as "root vertical range (not CoM)" in smoke + docs | low | XS | [8](https://www.slideshare.net/saurabsharma/gait-analysis-normal-gait-ss-teaching) |

Constraints honoured: seven-action list stays frozen (B1–B5 enrich existing walk
only); no new external assets; all readouts carry "teaching estimate, not clinical
measurement" disclosure; release remains blocked on human review.

## Sources
1. Delp et al., *OpenSim: Open-Source Software to Create and Analyze Dynamic Simulations of Movement*, IEEE TBME 2007.
2. Rajagopal et al., *Full body musculoskeletal model for muscle-driven simulation of human gait*, IEEE TBME 2016.
3. 3D4Medical/Elsevier, Complete Anatomy — student page.
4. Microsoft Store, Complete Anatomy listing.
5. CUHK LibGuides, Visible Body suite overview.
6. zSpace/Visible Body, Human Anatomy Atlas tutorial transcript.
7. Guthrie, *Review of Normal and Pathologic Gait*, UW Cloud-CME lecture notes.
8. Sharma, *Gait Analysis: Normal Gait* teaching slides (normative spatiotemporal values).
9. MoCap Online, *Skeleton 3D Models & Rigging for Game Animation* (2026).
10. MoCap Online, *Unity Animation Rigging guide* (two-bone IK foot lock).
11. D'Souza et al., *Theia3D vs marker-based gait kinematics*, Sci Rep 2024.
12. Tandfonline, *Validity/reliability of OpenCap for squat/hop/jump*, J Sports Sci 2024.
13. Frontiers Digital Health 2026, OpenCap scoping review.
14. Google Play, Human Anatomy Atlas 2027 listing.
