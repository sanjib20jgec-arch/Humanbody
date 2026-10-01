# Brain & Nerves Bay — Master Plan (DRAFT, discussion only)
> Inherits Cell D6–D27, Tissues TD1–TD5, and the cross-cutting plan. No code until approval.

## 0. Current state audit
| Area | Current |
|---|---|
| Lab | `NervousLab.jsx` (90 lines): brain regions (cerebrum, cerebellum, brainstem), spinal cord, peripheral nerves; reflex arc steps (receptor → sensory → synapse → motor → muscle); BodyParts3D brain landmarks (Brain & Nerves QC report exists) |
| Engine | `NerveConductionModel.js`: 5 reflex segments, total ≈ 200 ms, Aδ ≈ 15 m/s |
| Quiz | 3 items (all reflex/structure) |

### 0.1 Findings
| # | Sev. | Finding |
|---|---|---|
| N1 | **High** | **Syllabus**: NEET **deleted reflex action/arc, sense organs, eye & ear**. Reflex remains Class 10 content. NEET layer must instead cover: neuron & nerves; CNS, PNS, visceral NS; **generation & conduction of nerve impulse** (resting potential, depolarisation, repolarisation, Na⁺/K⁺ roles); **synaptic transmission** (electrical & chemical); forebrain/midbrain/hindbrain parts & functions. |
| N2 | Medium | Disclosure text says real withdrawal latency "≈ 200–500 ms"; human nociceptive withdrawal (RIII) reflex latencies are often reported shorter (~90–130 ms). Needs re-sourcing (two sources) before shipping. |
| N3 | Medium | Missing Class 10 content: brain parts with functions table, protection (skull, CSF, meninges), voluntary vs involuntary vs reflex actions, coordination in plants (tropisms) — Class 10 chapter includes **plant coordination & hormones**; endocrine glands overview (Class 10). |
| N4 | Low | No neuron-level 3D (axon, dendrites, myelin, nodes) — shared with Tissues T3D-7. |

## 1. Syllabus scope
Class 10 Control & Coordination (incl. plant movements & hormones, animal hormones); NEET Neural Control & Coordination (rationalised); Chemical Coordination & Integration (NEET) — proposed as a sub-tab "Hormones" here (owner to confirm).

## 2. Sources
OpenStax A&P 2e Ch.12–14, 17 (endocrine); NCERT X Ch. Control & Coordination; NCERT XI Neural Control, Chemical Coordination; Kandel *Principles of Neural Science* (verification); BioNumbers for conduction velocities & resting potential.

## 3. Features
**3D**: existing atlas brain with lobes/regions + cut-away (ventricles, corpus callosum, hypothalamus, thalamus, pons, medulla); spinal cord cross-section slicer (grey/white matter, dorsal/ventral roots); 3D neuron with myelin (shared); synapse close-up (vesicles, cleft, receptors); endocrine gland map on the body.
**Animations**: action potential with ion channels (Na⁺ in, K⁺ out) + voltage trace; saltatory vs continuous conduction; chemical synapse (Ca²⁺ entry → vesicle fusion → neurotransmitter → receptor → reuptake/breakdown); reflex arc (Class 10); plant tropisms (phototropism auxin redistribution, Mimosa touch response); hormone feedback loop (e.g. insulin–glucagon).
**Simulations**: (1) Membrane potential lab — stimulus strength → threshold → all-or-none spike, refractory period; (2) Conduction race — myelinated vs unmyelinated, diameter; (3) Synapse lab — neurotransmitter amount, receptor blocking (labelled hypothetical); (4) Reflex vs conscious response timer (Class 10, re-sourced timings); (5) Feedback-loop lab (blood glucose).
**Missions**: "Message from finger to brain"; "Plant chasing the light".
**Assessment**: brain-part 3D labelling, function matching, AP phase ordering, hormone–gland–effect tables.

## 4. Accuracy specifics
Resting potential ≈ −70 mV (range); polarity changes shown with correct ion directions; brain region functions phrased per NCERT with modern caveats (no "left-brain/right-brain personality" myths; "we use only 10 % of brain" myth flagged).

## 5. Open questions
1. Add "Hormones" (Class 10 + NEET Chemical Coordination) as a sub-tab here, or a separate future bay?
2. Plant coordination (Class 10) here, or in a plant-focused section?

## 6. Round 10 findings
- **N2 resolved**: human nociceptive withdrawal reflex latencies are ≈ 65–150 ms (mean ≈ 90–100 ms) [PLOS One 2024 nerve-block study; Frontiers in Pain 2023 RII/RIII re-analysis; RIII ≈ 100–125 ms]. Current disclosure (200–500 ms) and model total (≈ 200 ms) must be corrected; conscious perception occurs later than the reflex — teaching point preserved.
- Class 10 Ch.6 (current book) still includes reflex action, brain, hormones, plant coordination → Class 10 layer keeps the reflex arc as its centrepiece.
- Benchmark: PhET "Neuron" (CC BY 4.0) — ion-level pause/rewind interaction pattern.


## Class 10 layer
See `docs/CLASS_10_CURRICULUM_PLAN.md` (NCERT/CBSE + WBBSE Madhyamik coverage matrix and per-bay Class 10 features).
