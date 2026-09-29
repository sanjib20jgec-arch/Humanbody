# Performance-rig bone mapping & foot-IK rationale (Phase 84, B6)

Developer-facing reference for the Movement Theater's 14-bone teaching rig.
Source of truth for the CMU column: `src/lib/kinesiology/retarget.js#rigNameFor`.
The rig deliberately keeps only the bones a learner needs to read an action;
everything else is documented below as *intentionally omitted*.

## Mapping table (left side shown; right mirrors)

| HBL rig bone | CMU BVH (lawrennd mirror) | Unity Humanoid (required) | UE5 mannequin | Mixamo |
|---|---|---|---|---|
| root | Hips / Root | Hips | pelvis | Hips |
| spine | LowerBack / Abdomen | Spine | spine_01 | Spine |
| chest | UpperBack / Thorax / Chest | Chest | spine_02/03 | Spine1/Spine2 |
| neck | LowerNeck / Neck | Neck | neck_01 | Neck |
| head | UpperNeck / Head | Head | head | Head |
| leftClavicle | LClavicle / LShoulder | LeftShoulder | clavicle_l | LeftShoulder |
| leftUpperArm | LUpperArm / LFemur? (arm) | LeftUpperArm | upperarm_l | LeftArm |
| leftForeArm | LLowerArm / LForearm | LeftLowerArm | lowerarm_l | LeftForeArm |
| leftHand | LHand / LWrist | LeftHand | hand_l | LeftHand |
| leftUpLeg | LFemur / LThigh / LUpLeg | LeftUpperLeg | thigh_l | LeftUpLeg |
| leftLeg | LTibia / LShin / LLeg | LeftLowerLeg | calf_l | LeftLeg |
| leftFoot | LFoot / LAnkle | LeftFoot | foot_l | LeftFoot |

Mapped count asserted ≥ 12 in `kinesiology-asset-smoke` (actual: 14 incl. jaw on
some clips).

## Intentionally omitted (v1 scope)
- **Toes, fingers, eyes, jaw (most clips), scapulae, spine1/2 subdivisions** —
  pedagogically invisible at theater scale; they cost retarget ambiguity and frame
  budget. Game-industry guidance places clean retargets at 45–55 bones; we sit far
  below that on purpose (perf tier caps + "explain, don't perform" doctrine).
- **Patella / foot sub-talar joints** — the sagittal angle readout (Phase 82) is a
  teaching estimate and does not need them.

## Foot-IK rationale
Industry practice is FK playback of baked clips with **IK layered at runtime** for
foot planting, hand placement and look-at (Unity Animation Rigging two-bone IK;
UE5 IK Retargeter + control rig). Foot sliding is the canonical retarget artifact,
"usually caused by incorrect root bone position or mismatched leg proportions
during retargeting — lock the feet with IK" (benchmark §1.4).

We follow the same pattern: BVH rotations drive the skeleton (FK), then
`applyFootPlant` (retarget.js) runs a sagittal two-bone solve per side during
detected stance windows (hip pitch + knee bend in the root frame, plus a small hip
abduction term for pelvic sway). Measured effect on the shipped walk embed:
horizontal foot travel during stance **0.374 m → 0.078 m** (asserted ≥ 50 %
reduction in `kinesiology-asset-smoke`).

## Ground & treadmill notes
- `computeCalibration` scales CMU units to metres; `finalizeGround` applies an
  empirical yOffset so the lowest foot rests ~2 cm above the floor disc.
- `applyBVHFrame(..., { treadmill: false })` preserves raw root translation for
  metrics (speed in the smoke + Phase-81 honesty panel); default playback zeroes
  x/z so the figure stays centred in frame.

## Provenance
CMU Graphics Lab Motion Capture Database (mocap.cs.cmu.edu, NSF Grant #0196217),
BVH conversions via the lawrennd/mocap mirror; derived embeds only — see
`docs/PROVENANCE_AUDIT_KINESIOLOGY.md`. No new external assets were added in this
round.
