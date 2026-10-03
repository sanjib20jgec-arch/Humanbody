# Movement Theater — Phase 3 activation review sheet

**Status: NOT REVIEWED.** This sheet exists so a human subject-matter expert can
review every shipped activation curve. No clinical or academic sign-off has happened,
and no claim of one may be made until this sheet carries named reviewer records
(see `docs/MOVEMENT_THEATER_MASTERPLAN.md` §8.3 and the Gate G1 governance rules).

Generated from `content/kinesiology/clips/*.json` by
`node scripts/bake-activation-data.mjs --sme-sheet` — re-run it after any edit.

How to review:

1. **Role** — is the muscle's role in this movement right? The taxonomy is
   Agonist (prime mover) / Synergist / Antagonist / Stabilizer / Inactive. Some records
   are curated by hand and some fall back to peak thresholds; a wrong role is a one-word
   fix in the JSON.
2. **Contraction** — derived from the tracked joint angle (shortening = concentric,
   lengthening = eccentric, holding = isometric) and marked `mixed` where the two joints
   a two-joint muscle crosses disagree, or where the muscle's action is outside the
   tracked sagittal plane. Flag anything anatomically wrong.
3. **Peak / mean** — the relative intensity. These are teaching values, not EMG
   amplitudes; check the *ordering* between muscles rather than the absolute number.
4. **Evidence** — does the cited basis actually support the curve? Records labelled
   `authored-teaching` are hand-timed and are the first candidates for replacement.

## bow — Bow

Authored · 90 frames @ 30 fps · 3 s · source: HBL authored teaching track

| Muscle | Role | Contraction | Peak | Mean | Evidence | Role ok? | Notes |
|---|---|---|---|---|---|---|---|
| `erectorSpinae` | ST | mixed | 0.77 | 0.55 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `gluteusMaximus.L` | PM | isometric (3 phases) | 1.00 | 0.49 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `gluteusMaximus.R` | PM | isometric (3 phases) | 1.00 | 0.49 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `hamstrings.L` | PM | isometric (3 phases) | 1.00 | 0.64 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `hamstrings.R` | PM | isometric (3 phases) | 1.00 | 0.64 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `rectusAbdominis` | ST | mixed | 0.35 | 0.35 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |

## chew — Chew

Authored · 96 frames @ 30 fps · 3.2 s · source: HBL authored teaching track

| Muscle | Role | Contraction | Peak | Mean | Evidence | Role ok? | Notes |
|---|---|---|---|---|---|---|---|
| `buccinator.L` | SY | mixed | 0.80 | 0.54 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `buccinator.R` | SY | mixed | 0.80 | 0.54 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `digastric` | PM | mixed | 0.90 | 0.16 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `lateralPterygoid.L` | PM | mixed | 0.70 | 0.16 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `lateralPterygoid.R` | PM | mixed | 0.70 | 0.16 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `masseter.L` | PM | mixed | 1.00 | 0.30 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `masseter.R` | PM | mixed | 1.00 | 0.30 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `temporalis.L` | PM | mixed | 0.90 | 0.25 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `temporalis.R` | PM | mixed | 0.90 | 0.25 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |

## clap — Clap

Authored · 60 frames @ 30 fps · 2 s · source: HBL authored teaching track

| Muscle | Role | Contraction | Peak | Mean | Evidence | Role ok? | Notes |
|---|---|---|---|---|---|---|---|
| `bicepsBrachii.L` | PM | mixed | 0.50 | 0.50 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `bicepsBrachii.R` | PM | mixed | 0.50 | 0.50 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `deltoid.L` | PM | mixed | 0.50 | 0.50 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `deltoid.R` | PM | mixed | 0.50 | 0.50 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `rectusAbdominis` | ST | mixed | 0.25 | 0.25 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `tricepsBrachii.L` | ST | mixed | 0.20 | 0.20 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `tricepsBrachii.R` | ST | mixed | 0.20 | 0.20 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |

## handshake — Handshake

Authored · 72 frames @ 30 fps · 2.4 s · source: HBL authored teaching track

| Muscle | Role | Contraction | Peak | Mean | Evidence | Role ok? | Notes |
|---|---|---|---|---|---|---|---|
| `adductorPollicis.R` | PM | mixed | 0.80 | 0.59 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `bicepsBrachii.R` | ST | mixed | 0.60 | 0.51 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `deltoid.R` | SY | mixed | 0.50 | 0.43 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `erectorSpinae` | ST | mixed | 0.30 | 0.30 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `forearmExtensors.R` | SY | mixed | 0.90 | 0.46 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `forearmFlexors.R` | PM | mixed | 0.85 | 0.62 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `pronatorTeres.R` | SY | mixed | 0.45 | 0.36 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |

## head-signals — Head signals

Authored · 120 frames @ 30 fps · 4 s · source: HBL authored teaching track

| Muscle | Role | Contraction | Peak | Mean | Evidence | Role ok? | Notes |
|---|---|---|---|---|---|---|---|
| `erectorSpinae` | ST | mixed | 0.30 | 0.30 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `masseter.L` | IN | mixed | 0.05 | 0.05 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `masseter.R` | IN | mixed | 0.05 | 0.05 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `upperTrapezius.L` | ST | mixed | 0.25 | 0.25 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `upperTrapezius.R` | ST | mixed | 0.25 | 0.25 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |

## heel-walk — Heel walk

Authored · 66 frames @ 30 fps · 2.2 s · source: HBL authored teaching track

| Muscle | Role | Contraction | Peak | Mean | Evidence | Role ok? | Notes |
|---|---|---|---|---|---|---|---|
| `hamstrings.L` | SY | mixed (5 phases) | 0.40 | 0.40 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `hamstrings.R` | SY | mixed (5 phases) | 0.40 | 0.40 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `iliopsoas.L` | ST | eccentric (3 phases) | 0.50 | 0.50 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `iliopsoas.R` | ST | eccentric (3 phases) | 0.50 | 0.50 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `quadriceps.L` | SY | isometric (5 phases) | 0.50 | 0.50 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `quadriceps.R` | SY | isometric (5 phases) | 0.50 | 0.50 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `soleus.L` | ST | concentric (4 phases) | 0.15 | 0.15 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `soleus.R` | ST | concentric (4 phases) | 0.15 | 0.15 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `tibialisAnterior.L` | PM | eccentric (4 phases) | 0.90 | 0.90 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `tibialisAnterior.R` | PM | eccentric (4 phases) | 0.90 | 0.90 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |

## jump — Jump (mocap)

Motion capture · 66 frames @ 30 fps · 2.2 s · source: CMU Graphics Lab Motion Capture Database (see vendor/kinesiology/PROVENANCE.json)

| Muscle | Role | Contraction | Peak | Mean | Evidence | Role ok? | Notes |
|---|---|---|---|---|---|---|---|
| `deltoid.L` | SY | mixed | 0.90 | 0.14 | authored-teaching | ☐ | Hand-timed teaching envelope for an upper-body/trunk muscle during a lower-body capture. |
| `deltoid.R` | SY | mixed | 0.90 | 0.14 | authored-teaching | ☐ | Hand-timed teaching envelope for an upper-body/trunk muscle during a lower-body capture. |
| `erectorSpinae` | ST | mixed | 0.40 | 0.40 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |
| `gastrocnemius.L` | PM | mixed | 1.00 | 0.20 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |
| `gastrocnemius.R` | PM | mixed | 1.00 | 0.20 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |
| `gluteusMaximus.L` | PM | eccentric (6 phases) | 1.00 | 0.32 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |
| `gluteusMaximus.R` | PM | eccentric (6 phases) | 1.00 | 0.32 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |
| `hamstrings.L` | SY | mixed (3 phases) | 0.70 | 0.23 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |
| `hamstrings.R` | SY | mixed (3 phases) | 0.70 | 0.23 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |
| `quadriceps.L` | PM | mixed | 1.00 | 0.33 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |
| `quadriceps.R` | PM | mixed | 1.00 | 0.33 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |
| `rectusAbdominis` | ST | mixed | 1.00 | 0.45 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |
| `soleus.L` | SY | mixed | 0.90 | 0.19 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |
| `soleus.R` | SY | mixed | 0.90 | 0.19 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |
| `tibialisAnterior.L` | SY | mixed | 0.60 | 0.07 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |
| `tibialisAnterior.R` | SY | mixed | 0.60 | 0.07 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |

## kick — Kick

Authored · 72 frames @ 30 fps · 2.4 s · source: HBL authored teaching track

| Muscle | Role | Contraction | Peak | Mean | Evidence | Role ok? | Notes |
|---|---|---|---|---|---|---|---|
| `erectorSpinae` | ST | mixed | 0.35 | 0.35 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `hamstrings.L` | PM | mixed (4 phases) | 0.90 | 0.45 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `hamstrings.R` | PM | mixed (4 phases) | 0.90 | 0.45 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `iliopsoas.L` | PM | concentric (3 phases) | 1.00 | 0.41 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `iliopsoas.R` | PM | concentric (3 phases) | 1.00 | 0.41 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `quadriceps.L` | PM | eccentric (3 phases) | 1.00 | 0.43 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `quadriceps.R` | PM | eccentric (3 phases) | 1.00 | 0.43 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `rectusAbdominis` | SY | mixed | 0.40 | 0.40 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `rectusFemoris.L` | PM | mixed (4 phases) | 0.80 | 0.12 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `rectusFemoris.R` | PM | mixed (4 phases) | 0.80 | 0.12 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |

## lunge — Lunge

Authored · 90 frames @ 30 fps · 3 s · source: HBL authored teaching track

| Muscle | Role | Contraction | Peak | Mean | Evidence | Role ok? | Notes |
|---|---|---|---|---|---|---|---|
| `gastrocnemius.L` | SY | mixed (2 phases) | 0.40 | 0.17 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `gastrocnemius.R` | SY | mixed (2 phases) | 0.40 | 0.17 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `gluteusMaximus.L` | PM | eccentric (2 phases) | 0.80 | 0.34 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `gluteusMaximus.R` | PM | eccentric (2 phases) | 0.80 | 0.34 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `gluteusMedius.L` | SY | mixed | 0.60 | 0.43 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `gluteusMedius.R` | SY | mixed | 0.60 | 0.43 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `hamstrings.L` | SY | mixed (2 phases) | 0.60 | 0.43 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `hamstrings.R` | SY | mixed (2 phases) | 0.60 | 0.43 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `quadriceps.L` | PM | eccentric (2 phases) | 1.00 | 0.43 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `quadriceps.R` | PM | eccentric (2 phases) | 1.00 | 0.43 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `rectusAbdominis` | ST | mixed | 0.30 | 0.30 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |

## one-leg — Single-leg stand

Authored · 90 frames @ 30 fps · 3 s · source: HBL authored teaching track

| Muscle | Role | Contraction | Peak | Mean | Evidence | Role ok? | Notes |
|---|---|---|---|---|---|---|---|
| `erectorSpinae` | ST | mixed | 0.30 | 0.30 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `gluteusMedius.L` | PM | mixed | 0.88 | 0.59 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `iliopsoas.L` | SY | isometric | 0.48 | 0.19 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `iliopsoas.R` | SY | isometric | 0.48 | 0.19 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `quadriceps.L` | SY | isometric | 0.46 | 0.36 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `quadriceps.R` | SY | isometric | 0.46 | 0.36 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `rectusAbdominis` | ST | mixed | 0.35 | 0.35 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `soleus.L` | SY | isometric | 0.46 | 0.36 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `soleus.R` | SY | isometric | 0.46 | 0.36 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |

## reach-up — Reach up

Authored · 90 frames @ 30 fps · 3 s · source: HBL authored teaching track

| Muscle | Role | Contraction | Peak | Mean | Evidence | Role ok? | Notes |
|---|---|---|---|---|---|---|---|
| `deltoid.L` | PM | mixed | 1.00 | 0.46 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `deltoid.R` | PM | mixed | 1.00 | 0.46 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `latissimusDorsi.L` | SY | mixed | 0.69 | 0.32 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `latissimusDorsi.R` | SY | mixed | 0.69 | 0.32 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `serratusAnterior.L` | PM | mixed | 0.84 | 0.41 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `serratusAnterior.R` | PM | mixed | 0.84 | 0.41 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `supraspinatus.L` | PM | mixed | 0.84 | 0.41 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `supraspinatus.R` | PM | mixed | 0.84 | 0.41 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |

## run — Run

Authored · 68 frames @ 30 fps · 2.25 s · source: HBL authored teaching track

| Muscle | Role | Contraction | Peak | Mean | Evidence | Role ok? | Notes |
|---|---|---|---|---|---|---|---|
| `deltoid.L` | SY | mixed | 0.60 | 0.30 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `deltoid.R` | SY | mixed | 0.60 | 0.30 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `erectorSpinae` | ST | mixed | 0.50 | 0.50 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `gastrocnemius.L` | PM | mixed (3 phases) | 1.00 | 0.12 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `gastrocnemius.R` | PM | mixed (3 phases) | 1.00 | 0.12 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `gluteusMaximus.L` | PM | eccentric (4 phases) | 1.00 | 0.17 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `gluteusMaximus.R` | PM | eccentric (4 phases) | 1.00 | 0.17 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `gluteusMedius.L` | ST | mixed | 0.85 | 0.42 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `gluteusMedius.R` | ST | mixed | 0.85 | 0.42 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `hamstrings.L` | PM | mixed | 1.00 | 0.14 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `hamstrings.R` | PM | mixed | 1.00 | 0.14 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `iliopsoas.L` | PM | concentric (4 phases) | 0.90 | 0.13 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `iliopsoas.R` | PM | concentric (4 phases) | 0.90 | 0.13 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `latissimusDorsi.L` | SY | mixed | 0.50 | 0.25 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `latissimusDorsi.R` | SY | mixed | 0.50 | 0.25 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `quadriceps.L` | PM | eccentric (5 phases) | 1.00 | 0.12 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `quadriceps.R` | PM | eccentric (5 phases) | 1.00 | 0.12 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `rectusAbdominis` | ST | mixed | 0.50 | 0.50 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `rectusFemoris.L` | PM | mixed | 0.80 | 0.12 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `rectusFemoris.R` | PM | mixed | 0.80 | 0.12 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `soleus.L` | SY | concentric (4 phases) | 0.90 | 0.13 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `soleus.R` | SY | concentric (4 phases) | 0.90 | 0.13 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `tibialisAnterior.L` | PM | eccentric (4 phases) | 0.80 | 0.17 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `tibialisAnterior.R` | PM | eccentric (4 phases) | 0.80 | 0.17 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |

## shrug — Shrug

Authored · 60 frames @ 30 fps · 2 s · source: HBL authored teaching track

| Muscle | Role | Contraction | Peak | Mean | Evidence | Role ok? | Notes |
|---|---|---|---|---|---|---|---|
| `erectorSpinae` | ST | mixed | 0.20 | 0.20 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `upperTrapezius.L` | PM | mixed | 1.00 | 0.42 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `upperTrapezius.R` | PM | mixed | 1.00 | 0.42 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |

## sidestep — Side step

Authored · 72 frames @ 30 fps · 2.4 s · source: HBL authored teaching track

| Muscle | Role | Contraction | Peak | Mean | Evidence | Role ok? | Notes |
|---|---|---|---|---|---|---|---|
| `gluteusMedius.L` | PM | mixed | 1.00 | 0.48 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `gluteusMedius.R` | PM | mixed | 1.00 | 0.48 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `quadriceps.L` | ST | eccentric (3 phases) | 0.35 | 0.35 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `quadriceps.R` | ST | eccentric (3 phases) | 0.35 | 0.35 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `rectusAbdominis` | ST | mixed | 0.30 | 0.30 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `tibialisAnterior.L` | ST | isometric (3 phases) | 0.27 | 0.13 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `tibialisAnterior.R` | ST | isometric (3 phases) | 0.27 | 0.13 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |

## sit-stand — Sit to stand

Authored · 120 frames @ 30 fps · 4 s · source: HBL authored teaching track

| Muscle | Role | Contraction | Peak | Mean | Evidence | Role ok? | Notes |
|---|---|---|---|---|---|---|---|
| `erectorSpinae` | SY | mixed | 0.45 | 0.45 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `gluteusMaximus.L` | PM | eccentric (2 phases) | 0.90 | 0.22 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `gluteusMaximus.R` | PM | eccentric (2 phases) | 0.90 | 0.22 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `iliopsoas.L` | SY | concentric (2 phases) | 0.40 | 0.19 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `iliopsoas.R` | SY | concentric (2 phases) | 0.40 | 0.19 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `quadriceps.L` | PM | eccentric (2 phases) | 1.00 | 0.24 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `quadriceps.R` | PM | eccentric (2 phases) | 1.00 | 0.24 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `tibialisAnterior.L` | ST | isometric (2 phases) | 0.30 | 0.07 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `tibialisAnterior.R` | ST | isometric (2 phases) | 0.30 | 0.07 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |

## squat — Squat

Authored · 90 frames @ 30 fps · 3 s · source: HBL authored teaching track

| Muscle | Role | Contraction | Peak | Mean | Evidence | Role ok? | Notes |
|---|---|---|---|---|---|---|---|
| `erectorSpinae` | ST | mixed | 0.50 | 0.50 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `gluteusMaximus.L` | PM | eccentric (2 phases) | 0.85 | 0.34 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `gluteusMaximus.R` | PM | eccentric (2 phases) | 0.85 | 0.34 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `hamstrings.L` | SY | mixed (2 phases) | 0.70 | 0.46 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `hamstrings.R` | SY | mixed (2 phases) | 0.70 | 0.46 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `quadriceps.L` | PM | eccentric (2 phases) | 1.00 | 0.40 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `quadriceps.R` | PM | eccentric (2 phases) | 1.00 | 0.40 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `rectusAbdominis` | ST | mixed | 0.30 | 0.30 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `soleus.L` | ST | eccentric (2 phases) | 0.30 | 0.30 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `soleus.R` | ST | eccentric (2 phases) | 0.30 | 0.30 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |

## talk — Talk

Authored · 108 frames @ 30 fps · 3.6 s · source: HBL authored teaching track

| Muscle | Role | Contraction | Peak | Mean | Evidence | Role ok? | Notes |
|---|---|---|---|---|---|---|---|
| `buccinator.L` | SY | mixed | 0.75 | 0.47 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `buccinator.R` | SY | mixed | 0.75 | 0.47 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `digastric` | SY | mixed | 0.50 | 0.11 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `lateralPterygoid.L` | SY | mixed | 0.20 | 0.20 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `lateralPterygoid.R` | SY | mixed | 0.20 | 0.20 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `masseter.L` | SY | mixed | 0.65 | 0.37 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `masseter.R` | SY | mixed | 0.65 | 0.37 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `orbicularisOris` | PM | mixed | 0.90 | 0.58 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `temporalis.L` | SY | mixed | 0.55 | 0.30 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `temporalis.R` | SY | mixed | 0.55 | 0.30 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |

## tiptoe-walk — Tip-toe walk

Authored · 66 frames @ 30 fps · 2.2 s · source: HBL authored teaching track

| Muscle | Role | Contraction | Peak | Mean | Evidence | Role ok? | Notes |
|---|---|---|---|---|---|---|---|
| `erectorSpinae` | ST | mixed | 0.30 | 0.30 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `gastrocnemius.L` | PM | mixed (3 phases) | 0.80 | 0.80 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `gastrocnemius.R` | PM | mixed (3 phases) | 0.80 | 0.80 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `quadriceps.L` | SY | eccentric (5 phases) | 0.40 | 0.40 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `quadriceps.R` | SY | eccentric (5 phases) | 0.40 | 0.40 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `soleus.L` | PM | concentric (4 phases) | 0.90 | 0.90 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `soleus.R` | PM | concentric (4 phases) | 0.90 | 0.90 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `tibialisAnterior.L` | SY | eccentric (4 phases) | 0.40 | 0.40 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `tibialisAnterior.R` | SY | eccentric (4 phases) | 0.40 | 0.40 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |

## walk — Walk (mocap)

Motion capture · 64 frames @ 30 fps · 2.13333 s · source: CMU Graphics Lab Motion Capture Database (see vendor/kinesiology/PROVENANCE.json)

| Muscle | Role | Contraction | Peak | Mean | Evidence | Role ok? | Notes |
|---|---|---|---|---|---|---|---|
| `deltoid.L` | SY | mixed | 0.20 | 0.20 | authored-teaching | ☐ | Hand-timed teaching envelope for an upper-body/trunk muscle during a lower-body capture. |
| `deltoid.R` | SY | mixed | 0.20 | 0.20 | authored-teaching | ☐ | Hand-timed teaching envelope for an upper-body/trunk muscle during a lower-body capture. |
| `erectorSpinae` | ST | mixed | 0.35 | 0.35 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |
| `gastrocnemius.L` | PM | eccentric (6 phases) | 1.00 | 0.11 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |
| `gastrocnemius.R` | PM | eccentric (6 phases) | 1.00 | 0.11 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |
| `gluteusMaximus.L` | SY | eccentric (4 phases) | 0.70 | 0.12 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |
| `gluteusMaximus.R` | SY | eccentric (4 phases) | 0.70 | 0.12 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |
| `gluteusMedius.L` | ST | mixed | 0.75 | 0.32 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |
| `gluteusMedius.R` | ST | mixed | 0.75 | 0.32 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |
| `hamstrings.L` | SY | mixed (3 phases) | 0.80 | 0.12 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |
| `hamstrings.R` | SY | mixed (3 phases) | 0.80 | 0.12 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |
| `iliopsoas.L` | PM | concentric (4 phases) | 0.90 | 0.13 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |
| `iliopsoas.R` | PM | concentric (4 phases) | 0.90 | 0.13 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |
| `latissimusDorsi.L` | SY | mixed | 0.20 | 0.20 | authored-teaching | ☐ | Hand-timed teaching envelope for an upper-body/trunk muscle during a lower-body capture. |
| `latissimusDorsi.R` | SY | mixed | 0.20 | 0.20 | authored-teaching | ☐ | Hand-timed teaching envelope for an upper-body/trunk muscle during a lower-body capture. |
| `quadriceps.L` | PM | mixed | 0.85 | 0.08 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |
| `quadriceps.R` | PM | mixed | 0.85 | 0.08 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |
| `rectusAbdominis` | ST | mixed | 0.30 | 0.30 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |
| `rectusFemoris.L` | PM | mixed (3 phases) | 0.70 | 0.10 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |
| `rectusFemoris.R` | PM | mixed (3 phases) | 0.70 | 0.10 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |
| `soleus.L` | PM | eccentric (6 phases) | 0.85 | 0.15 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |
| `soleus.R` | PM | eccentric (6 phases) | 0.85 | 0.15 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |
| `tibialisAnterior.L` | PM | concentric (6 phases) | 0.90 | 0.20 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |
| `tibialisAnterior.R` | PM | concentric (6 phases) | 0.90 | 0.20 | EMG | ☐ | Timing windows simplified to a teaching envelope; magnitudes are relative, not EMG amplitudes. |

## wave — Wave

Authored · 90 frames @ 30 fps · 3 s · source: HBL authored teaching track

| Muscle | Role | Contraction | Peak | Mean | Evidence | Role ok? | Notes |
|---|---|---|---|---|---|---|---|
| `deltoid.L` | PM | mixed | 1.00 | 0.61 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `deltoid.R` | ST | mixed | 0.20 | 0.03 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `forearmExtensors.L` | PM | mixed | 0.80 | 0.19 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `forearmFlexors.L` | PM | mixed | 0.80 | 0.21 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `serratusAnterior.L` | ST | mixed | 0.55 | 0.46 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `supraspinatus.L` | SY | mixed | 0.80 | 0.11 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |
| `upperTrapezius.L` | ST | mixed | 0.60 | 0.50 | kinesiology-text | ☐ | Hand-authored teaching envelope: roles and timing follow standard texts, magnitudes are illustrative. |

## Coverage

- 201 muscle records across 20 clips.
- Roles in the shipped data: ST 44 · PM 90 · SY 65 · IN 2.
- **Antagonist is currently unused (0 records).** Nothing in the shipped data asserts an
  antagonist, because the Phase 1 curation pass never assigned one. Muscle groups that
  brake a movement show up as `eccentric` contractions (see the Contraction column), which
  is the measured half of the story; whether any of them should be *labelled* Antagonist
  is a judgement call this sheet is asking for.
