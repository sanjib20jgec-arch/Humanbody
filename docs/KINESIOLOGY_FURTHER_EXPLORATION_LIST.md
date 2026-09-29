# Kinesiology Theater — Further Exploration List (2026-09-29)

Second exploration pass beyond `KINESIOLOGY_INDUSTRY_BENCHMARK_V2.md`. Part 1
records newly explored industry territory; Part 2 turns it into a numbered
opportunity list (C1–C15) with value/effort/constraint tags; Part 3 is the honest
"not doing" list; Part 4 suggests the strongest next-round picks. No code changed.

## Part 1 — Newly explored territory

1. **Clinical gait-model standards.** The ISB Joint Coordinate System (Grood &
   Suntay; Wu et al. 2002) is the reporting standard; the Conventional Gait Model
   (Helen Hayes/Davis) and Plug-in-Gait differ *systematically* from ISB-aligned
   CGM2.3 (e.g. knee rotation RMSD 17.8° between PiG and CGM2.3 during walking)
   [1](https://pmc.ncbi.nlm.nih.gov/articles/PMC13357812/), [2](https://pmc.ncbi.nlm.nih.gov/articles/PMC4745434/).
   Lesson: joint-angle numbers are model-dependent — our "teaching convention, not
   ISB" disclosure is exactly the right instinct and can cite this literature.
2. **Learning science.** Spaced repetition / retrieval practice: 2026 meta-analysis
   (21,415 learners) SMD 0.78 for medical test performance; Anki use independently
   associated with higher board scores; 65–88 % of undergraduate anatomy terms are
   *structure identification* → visual-first, retrieval-first practice beats passive
   viewing [3](https://www.probiologists.com/article/evidence-based-educational-algorithm-anki-for-optimization-of-medical-education), [4](https://studycardsai.com/blog/how-to-use-anki-to-study-for-anatomy).
3. **Game animation state of the art.** Motion matching (UE5 PoseSearch) is the
   modern locomotion standard — data-driven pose search replaces hand-authored state
   machines; *stride warping* adjusts foot placement to speed in real time [5](https://dev.epicgames.com/documentation/en-us/unreal-engine/game-animation-sample-project-in-unreal-engine), [6](https://mocaponline.com/blogs/mocap-news/unreal-engine-5-animation-features).
   Our 0.4 s crossfade is blend-tree-era; motion matching is overkill for seven fixed
   actions, but stride-warping inspires speed-linked cadence for authored gait.
4. **Wearables & in-browser pose.** IMU gait biofeedback tracks foot-progression at
   2.4° RMS vs optical mocap; MediaPipe Pose (33 landmarks) runs as JavaScript in the
   browser, rated "high" for gait/fitness use in a 2024 narrative review [7](https://www.researchgate.net/publication/383968901_Validation_of_a_MediaPipe_System_for_Markerless_Motion_Analysis_During_Virtual_Reality_Rehabilitation), [8](https://www.sciencedirect.com/science/article/pii/S2405844024160082).
   Opens a local-only "compare your own movement" teaching mode.

## Part 2 — Opportunity list

### Learning-science layer
- **C1. Spaced-repetition role drills.** "Which muscle is the prime mover *now*?"
  prompt at random phase stops; results feed a local review queue; optional Anki-TSV
  export of the 54-muscle facts deck. Value H / Effort S. Evidence: [3], [4].
- **C2. Click-to-identify quiz.** Quiz view asks structure-identification by raycast
  click ("click the muscle braking the body at landing"). Value H / Effort S.
  Evidence: identification share 65–88 % [4].
- **C3. Predict-then-reveal.** Learner predicts active muscles before captions reveal;
  testing-effect boost, zero new assets. Value M / Effort S.

### Clinical-quantitative layer
- **C4. Convention footnote.** Angle panel + RIG_MAPPING cite ISB/PiG/CGM2.3
  differences as the reason for teaching conventions. Value M / Effort XS. [1], [2].
- **C5. Asymmetry strip.** Already-measured L/R stance windows → show step-time and
  step-length (in)symmetry as a teaching readout ("healthy gait is roughly symmetric").
  Value M / Effort S. No new data source.
- **C6. Authored pathology-pattern tracks.** Trendelenburg-style pelvic drop and
  antalgic short-stance as *authored, labelled* comparisons. Value H / Effort M.
  **Constraint: expands the frozen v1 action list → needs explicit scope approval.**

### Interaction & presentation
- **C7. Audio-described action tracks.** Synced spoken phase description per action
  (generated in-repo, offline), toggled, screen-reader friendly. Value H / Effort S.
- **C8. Activation sonification.** Optional subtle pitch mapped to selected muscle's
  activation; off by default. Value L–M / Effort S.
- **C9. True CoM trail + readout.** Segment-weighted CoM (head/trunk/pelvis/limbs
  approx.) with vertical-displacement number — closes the root-vs-CoM honesty gap
  fully. Value M / Effort M.
- **C10. A/B compare mode.** Desktop split view shows two *actions* side by side
  (e.g. walk vs jump) instead of two cameras. Value M / Effort M.

### Emerging tech (optional, gated)
- **C11. Local webcam self-compare.** MediaPipe in-browser, on-device only, learner's
  knee-angle curve vs the theater's; explicit privacy disclosure; fully optional.
  Value H / Effort L. Evidence: [7], [8]. **Needs bundle/offline review (wasm asset).**
- **C12. Speed-linked cadence warp.** Authored gait cadence scales with the speed
  slider (stride-warping concept), honesty label retained. Value M / Effort M. [6].

### Pipeline & governance
- **C13. Pose-search metadata.** Tag derived embeds with contact frames / phase % in
  the manifest — future-proofs any motion-matching-style feature. Value L / Effort XS.
- **C14. Opt-in local learning telemetry.** First-attempt quiz correctness stored
  locally only, labelled, never transmitted; informs future rounds without fabricating
  a learning study. Value M / Effort S.
- **C15. WebXR view.** Low priority; defer.

## Part 3 — Not doing (honest scoping)
- In-browser OpenSim dynamic simulation (different product class; compute + scope).
- Any clinical/diagnostic claim or patient-data handling.
- Raw CMU redistribution or new external runtime assets without provenance review.
- Expanding the seven-action v1 list (C6) without explicit approval.
- Marker-based-grade accuracy claims for the teaching rig.

## Part 4 — Suggested next-round shortlist
C2 → C1 → C4 → C5 → C9 → C7 (learning science first, then honesty deepening, then
a11y). All constraint-safe, no new external assets, no action-list change. C6 and C11
held for explicit scope decisions.

## Part 5 — Second exploration pass (2026-09-29, later same day)

Newly explored: motor-learning science (AOMI/PETTLEP, attentional focus), Mayer's
multimedia-learning principles, the direct movement-education competitor
(Muscle & Motion), digital MSK physio platforms (Kaia/Hinge/Sword), coaching video
tooling (Dartfish/Onform/Kinovea), and non-visual accessibility (sonification).

Findings:
5. **Action observation + motor imagery.** Combined AOMI beats either alone (two
   meta-analyses: corticospinal excitability + skill performance, robust across
   moderators); PETTLEP (Physical, Environment, Task, Timing, Learning, Emotion,
   Perspective) is the standard imagery framework, with gains comparable to physical
   practice in some trials; observing actions in meaningful environments raises
   corticospinal excitability [9](https://www.sciencedirect.com/science/article/pii/S2667239122000260), [10](https://www.mdpi.com/2076-3417/12/19/9753), [11](https://www.sciencedirect.com/science/article/abs/pii/S0149763421002177).
6. **Mayer's principles.** Segmenting (user-paced continue buttons) improved
   transfer from animations (ES ≈ 1 in Mayer, Dow & Mayer 2003); signaling, temporal
   contiguity, and modality (voiceover + animation > on-screen text + animation) are
   the design levers [12](https://sites.google.com/site/cognitivetheorymmlearning/segmenting-principle), [13](https://services.dartmouth.edu/TDClient/1806/Portal/KB/Article/171655/Mayer-s-12-Principles-of-Multimedia-Learning).
7. **Muscle & Motion** (direct competitor): 3D muscles-in-motion, origin/insertion/
   action per muscle, PM/synergist/stabilizer/antagonist color coding (same
   vocabulary as ours), and *common-mistakes* 3D comparisons across 1,200+ exercises
   [14](https://apps.apple.com/us/app/muscle-motion-anatomy/id1149322730), [15](https://apps.apple.com/us/app/muscle-motion-strength/id1302056349).
8. **Digital MSK platforms.** Kaia's smartphone computer-vision form feedback was
   noninferior to physiotherapist evaluation; Hinge TrueMotion and Sword deliver live
   audio-visual corrective cues — corrective-cue delivery is now an industry product
   category [16](https://dtxalliance.org/products/kaia-health/), [17](https://research.contrary.com/company/hinge-health).
9. **Coaching video tools.** Dartfish/Onform/Kinovea standard toolkit: slow-mo,
   frame-by-frame, drawing/annotation overlays, voiceover, side-by-side compare
   [18](https://www.trackandfieldapp.com/best-app-for-sprinters/), [19](https://us.fitgap.com/products/024566/dartfish).
10. **Attentional focus.** External focus superior to internal in meta-analyses
   (Chua et al. 2021, Psychol Bull), but a 2025 distance meta-analysis finds the
   benefit in *experienced* performers, no distance effect in novices → offer both
   cue styles, default per audience [22](https://pmc.ncbi.nlm.nih.gov/articles/PMC12424610/), [23](https://www.semanticscholar.org/paper/55a3b83607b68ef84077940931f2a912ecfd361d).
11. **Sonification for blind/low-vision learners.** Pitch→Y, stereo pan→X mapping;
   fastest overview modality; established in STEM access (Perkins, Seo's MAIDR)
   [20](https://www.perkins.org/resource/sonification-summary-page/), [21](https://ischool.illinois.edu/news-events/news/2023/09/information-sciences-professor-developing-tool-make-data-visualizations).

## Part 6 — Additional opportunity items (D1–D11)

*Motor learning & imagery*
- **D1. AOMI rehearsal mode** — play clip while learner imagines performing it in
  real time, PETTLEP-timed prompts. H/M. [9][10][11]
- **D2. Perspective labelling** — learner-view/coach-view tags on cameras + one-line
  evidence note. M/XS. [10]
- **D3. External-focus cue toggle** — "push the ground away" vs anatomical wording.
  H/S. [22][23]

*Multimedia design*
- **D4. Segmenting study mode** — auto-pause at RLA boundaries, Continue button.
  H/S. [12][13]
- **D5. Signaling spotlight** — optional prime-mover emphasis synced to caption. M/XS.
- **D6. Voiceover narration** of captions, offline generated (modality principle);
  merges with C7. M/S. [13]

*Competitor-validated*
- **D7. Common-mistakes ghost comparison** on authored tracks (exaggerated pelvic
  drop / knee valgus ghost vs neutral), safety-neutral language. M/M. [14][15]
- **D8. Corrective form-cue library** per action, digital-PT style. M/S. [16][17]

*Coaching tooling*
- **D9. Time-synced drawing/annotation overlay + PNG export.** M/M. [18][19]
- **D10. Frame-step ±1 buttons + snap-to-contact scrub.** M/XS. [18]

*Non-visual access*
- **D11. Sonified angle/activation graphs** (pitch=value, pan=cycle time) for BLV
  learners. M/M. [20][21]

## Part 7 — Revised next-round shortlist
D4 → C2 → D3 → C1 → D1 → C9 → D6/C7 → D11, holding C6/C11 for explicit scope
decisions. Rationale: cheapest highest-evidence learning gains first (segmenting,
retrieval, cue wording), then imagery mode, then honesty (CoM), then access
(voiceover, sonification). All constraint-safe: no new external assets, no action
list change, disclosures preserved.

## Part 8 — Third exploration pass (XR, corpora, notation, privacy, AI tutoring, curricula)

12. **XR anatomy.** AR meta-analysis (508 participants) found *no* significant test
    score advantage over controls (−0.765 %-points, p = 0.732); engagement rises;
    low mental-rotation-test (MRT) students learn more from 3D AR than from
    conventional material; VR studies report nausea in a minority; virtual dissection
    tables (Anatomage) are valued as cadaver *supplements* [24](https://www.nature.com/articles/s41598-021-94721-4), [25](https://research-repository.griffith.edu.au/server/api/core/bitstreams/764d6ae5-8e85-405f-8821-c88f24b9d1bb/content).
13. **Mocap corpora & licensing.** AMASS unifies 15 datasets (CMU, KIT, HDM05, SFU,
    ACCAD, TCD…) — 40+ h, 11,451 motions — but is SMPL-parameterised and
    **academic-licence-only** (MPI registration), and SMPL itself is non-commercial;
    any future clip sourcing must stay per-dataset licence audits like ours
    [26](https://ar5iv.labs.arxiv.org/html/1904.03278), [27](https://www.roboticscenter.ai/datasets/amass-motion-capture).
14. **Movement notation.** Labanotation (Laban, *Schrifttanz* 1928): universal staff —
    body-part columns, glyph shape/shading/length = direction/level/duration; used in
    dance, physio and sport; software (LabanWriter/Calaban) keeps it alive
    [28](https://www.britannica.com/art/labanotation), [29](https://jcom.sissa.it/article/2/galley/3/download/).
15. **Child privacy.** COPPA's 2025 amendments explicitly fold **biometric data**
    (facial/voice) into children's personal information; "actual knowledge" triggers
    duties; GDPR-K threshold 16 (member states may lower to 13). Any camera feature
    must be ephemeral, on-device, no stored templates, off by default
    [30](https://pandectes.io/blog/childrens-online-privacy-rules-around-coppa-gdpr-k-and-age-verification/), [31](https://ideausher.com/blog/coppa-parenting-app-compliance/).
16. **AI tutoring evidence.** Khanmigo two-year cluster RCT: ≈0.06–0.08 SD per school
    year (active participation ≈0.14 SD) — similar to the platform *without* AI;
    engagement, not capability, is the bottleneck; "coach rather than give answers"
    configuration; ITS meta-analyses historically d ≈ 0.66 but recommend supplement,
    not replacement [32](https://edworkingpapers.com/sites/default/files/ai26-1551.pdf), [33](https://www.winssolutions.org/khanmigo-ai-tutoring-two-year-trial/), [34](https://www.researchgate.net/publication/396808798_Leveraging_Khanmigo_Generative_AI-Powered_Tool_for_Personalized_Tutoring_to_Learn_Scientific_Concepts).
17. **Curriculum standards.** India's competency-based entry-level BPT curriculum
    names *Kinesiology & Movement Science I & II* as foundation papers integrated
    with anatomy/physiology [35](https://www.muhs.ac.in/upload/syllabus/competency%20Based%20Entry%20Level%20Physiotherapy%20Undergraduate%20Curriculum%20BPTH.pdf);
    World Physiotherapy (WCPT) defines 8 domains / 38 competencies incl. motor
    control & motor learning, muscle performance, movement assessment
    [36](https://www.achek.cl/WCPTGuideline_PTEducation_complete.pdf), [37](https://www.mdpi.com/2227-7102/15/2/200).

## Part 9 — Additional opportunity items (E1–E8)

- **E1. History & notation mode.** Timeline strip (classical gait lineage:
  Muybridge, Braune–Fischer) + simplified Laban-inspired glyph row for gait phases,
  labelled "inspired by Labanotation". M/M. [28][29]
- **E2. Triple-representation toggle.** Same content as 3D + curves + glyph strip —
  dual-coding by explicit second/third representations. M/M. [12][13][28]
- **E3. Curriculum-alignment matrix.** Action/caption → BPT Kinesiology I/II topics +
  WCPT domain tags, educator-facing doc + small in-UI note. M/S. [35][36][37]
- **E4. Clip-sourcing runbook.** Candidate corpora (SFU, KIT, HDM05, ACCAD, TCD) with
  per-licence checklists; AMASS/SMPL route documented as *excluded for shipped
  assets* (academic/non-commercial). L/S (doc). [26][27]
- **E5. Privacy-hardened design spec for C11.** Ephemeral on-device only, no
  biometric storage, COPPA/GDPR-K disclosure copy, default-off, account-free;
  mandatory gate before any C11 work. H/S (doc). [30][31]
- **E6. Optional WebXR supplement.** Position as engagement/spatial-access aid (low-
  MRT learners), with nausea guardrails (short sessions, reduced-motion respect);
  never claimed to raise scores. M/L. [24][25]
- **E7. AI-tutor coach guardrails.** "Coach, don't answer" prompt policy, engagement
  nudges, no efficacy claims, local-first — mirrors Khanmigo trial configuration.
  M/S. [32][33][34]
- **E8. Spatial-reading onboarding.** "New to 3D?" micro-tour (orientation cues,
  slow first orbit) for learners who struggle with spatial representations. L/S. [24]

## Part 10 — Consolidated candidate pool & suggested phase cut

Pool now: C1–C15, D1–D11, E1–E8 (34 items). Suggested phase cut for a future
masterplan (each independently verifiable, constraint-safe):
- 86: D4 + D10 (segmenting study mode, frame-step) — Mayer + coaching-tool basics.
- 87: C2 + C1 + C3 (retrieval-first quiz suite + spaced drills + predict-reveal).
- 88: D3 + D8 (external-focus cue toggle + corrective cue library).
- 89: D1 + D2 (AOMI rehearsal + perspective labels).
- 90: C9 + D6/C7 + D11 (CoM honesty + voiceover + sonification access).
- 91: E1 + E2 + E3 (notation strip, triple representation, curriculum matrix).
- 92: E4 + E5 + E7 (docs: sourcing runbook, privacy spec, tutor guardrails).
Held for explicit scope decisions: C6 (pathology tracks), C11 (webcam, gated on E5),
E6 (WebXR), C14/C15.
