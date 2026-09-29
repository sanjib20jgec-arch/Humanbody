# Guided Path diagram improvement plan

Updated: 2026-09-27

> The broader replacement of childlike primitive objects with source-derived, labelled, rotatable 3D reference objects is proposed in [`GUIDED_PATH_3D_REFERENCE_PLAN.md`](./GUIDED_PATH_3D_REFERENCE_PLAN.md). That proposal is awaiting user approval; this file records the currently implemented source/disclosure/animation contracts.

## Product rule

The Guided Path should use diagrams that are visually clear, technically accurate, source-attributed, and honest about simplification. A diagram must never look more medically authoritative than its evidence supports.

The real BodyParts3D 4.0 atlas remains the anatomically grounded macro-reference. Focused module diagrams may simplify scale, hide structures, or show processes, but must say so and must be validated against reputable anatomy/physiology references.

## Source hierarchy

1. **BodyParts3D 4.0** for adult-male macro-anatomy shape, location, bilateral placement, and relative structure relationships. It is a CC BY reference and must retain attribution and adult-male limitation labeling.
2. **OpenStax Anatomy & Physiology 2e** for educational labels, system relationships, pathway explanations, anatomical terminology, and process sequencing.
3. **Module-specific primary or institutional references** only when a topic needs more detail than BodyParts3D or OpenStax supplies.
4. **Hand-built SVG/CSS geometry** only for a clearly labeled schematic, not as an implicit replacement for the certified atlas.

Current references:

- BodyParts3D description: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/desc.html
- Nervous-system structure: https://openstax.org/books/anatomy-and-physiology-2e/pages/12-1-basic-structure-and-function-of-the-nervous-system
- Nervous-system chapter review: https://openstax.org/books/anatomy-and-physiology-2e/pages/12-chapter-review
- Motor responses and reflex arcs: https://openstax.org/books/anatomy-and-physiology-2e/pages/14-3-motor-responses
- Heart anatomy: https://openstax.org/books/anatomy-and-physiology-2e/pages/19-1-heart-anatomy
- Digestive-system overview: https://openstax.org/books/anatomy-and-physiology-2e/pages/23-1-overview-of-the-digestive-system
- Digestive processes and regulation: https://openstax.org/books/anatomy-and-physiology-2e/pages/23-2-digestive-system-processes-and-regulation
- Kidney anatomy: https://openstax.org/books/anatomy-and-physiology-2e/pages/25-3-gross-anatomy-of-the-kidney

## Diagram types and requirements

### Reference anatomy diagram

Use the certified 3D atlas or a source-derived 2D view. Required:

- correct anatomical position and orientation;
- stable relative locations and laterality;
- source/license attribution;
- adult-male reference limitation where applicable;
- labels connected to actual structures;
- touch, keyboard, and reset alternatives.

### Process schematic

Use arrows, nodes, and highlighting to explain a process. Required:

- explicit “simplified schematic” label;
- correct sequence and direction;
- clear distinction between structure, signal, and outcome;
- no implied scale or shape accuracy;
- text explanation paired with the visual.

### Simulation diagram

Use animation to show a causal relationship. Required:

- Play, Pause, Step, Reset, and speed controls where applicable;
- a stable paused state;
- reduced-motion behavior that disables automatic playback but preserves manual steps;
- current-step label and live status;
- animation that represents the underlying process rather than decorative motion.

## Current audit by guided bay

| Bay | Current diagram mode | Main risk | Improvement direction |
|---|---|---|---|
| Cell Structure | CSS/SVG cell schematic | scale and organelle relationships can be read as literal | retain schematic label; validate organelle roles and relative placement against OpenStax |
| Tissues | CSS tissue patterns | patterns can imply histology-level realism | label as conceptual tissue pattern; animate organization/function only |
| Human Digestion | tract/pathway schematic | route and accessory-organ relationships need clear sequence | validate mouth → esophagus → stomach → small intestine → large intestine and absorption sites; completed source/disclosure pass, browser review pending |
| Circulation | heart and flow schematic | chamber orientation, valve direction, pulmonary/systemic circuits | use OpenStax heart anatomy as the label and flow authority; completed circuit/source pass, browser review pending |
| Brain & Nerves | simplified brain/CNS/PNS schematic plus reflex animation | current diagram is not a direct atlas render; spinal-cord mesh is incomplete in atlas | keep schematic disclosure, anchor macro-region labels to BodyParts3D/OpenStax, animate signal pathway |
| Respiration | airway and alveoli teaching model | current atlas has no lung-parenchyma mesh | retain explicit focused teaching-model label; validate airway order and ventilation equations |
| Excretion | nephron schematic | filtration/reabsorption/secretion sequencing | validate nephron order and ADH explanation against OpenStax; animate filtrate direction |
| Reproduction | gamete/cycle schematic | timing and terminology | validate sequence, not-to-scale disclosure, and hormone/event labels |
| Heredity | chromosome/Punnett schematic | probability can be mistaken for certainty | animate combinations, show sample space, label outcome as expected proportion |

## P0 — Brain & Nerves first

Completed in the current pass:

- corrected the reflex relay wording to identify an interneuron and synapse in the spinal cord;
- added an explicit BodyParts3D/OpenStax-aligned macro-region source note;
- added a restrained peripheral signal animation to the schematic;
- preserved reduced-motion support through the existing body-level motion preference;
- retained the existing animated reflex sequence and manual controls;
- retained the disclosure that the pathway is a simplified teaching schematic.

Still required for sign-off:

- browser screenshots at desktop and phone sizes;
- visual review of labels, overlap, focus state, and animation timing;
- expert confirmation that the macro-region diagram does not imply a clinical scan;
- explicit review of the atlas limitation: central canal present, spinal-cord parenchyma absent.

## P1 — Circulation and Digestion pass

Completed in the current pass:

- Circulation now uses a focused BodyParts3D 4.0 source mesh for the primary heart/vessel visual, with source-linked labels, 360° rotation, reset, touch gestures, and accessible fallback;
- Circulation keeps explicit pulmonary and systemic circuit cues, oxygen-status direction, and a visible source/limitation disclosure;
- Digestion now uses a focused BodyParts3D 4.0 source mesh for primary tract/accessory-organ context, while the OpenStax Figure 23.2 plate remains available in the process view and the food-bolus marker follows the anatomical route;
- Digestion identifies the schematic/process layer as simplified, distinguishes the alimentary canal from accessory organs, and links the OpenStax digestive overview/process references;
- both plates retain functional stage/chamber selection, text equivalents, and process controls rather than becoming static images;
- both additions inherit the existing reduced-motion CSS behavior and keyboard/touch controls;
- curriculum smoke checks now enforce source disclosure, circuit/pathway cues, and the accessory-organ relationship text.

Still required for sign-off:

- browser screenshots at desktop and phone sizes;
- visual review of label overlap, circuit/pathway direction, focus states, and animation timing;
- expert confirmation of the simplified-model wording and the selected reference relationships.

## P1 — Source-aligned diagram contract for all bays

Create a reusable diagram metadata contract:

```js
{
  id: 'reflex-arc',
  type: 'process-schematic',
  sourceRefs: ['openstax-nervous-12-1', 'openstax-reflex-14-3'],
  simplified: true,
  animated: true,
  supportsReducedMotion: true,
  steps: ['stimulus', 'sensory-input', 'interneuron', 'motor-output', 'effector']
}
```

Every module diagram should declare:

- source references;
- whether it is a real atlas view or a simplified model;
- what animation means;
- whether it supports step mode;
- the accessible text equivalent.

## P1 — Animation contract

All guided diagrams should use the same interaction vocabulary:

- `Play`: start automatic progression;
- `Pause`: freeze at the current causal state;
- `Step`: advance exactly one state;
- `Reset`: return to the initial state;
- `Speed`: adjust only where timing is pedagogically meaningful;
- `Reduced motion`: no automatic progression, no decorative loops, manual Step remains usable.

Animation must have a clear mapping to an educational statement. For example:

- a signal bead means transmission along a pathway;
- a valve transition means pressure-driven one-way flow;
- a particle crossing a membrane means transport;
- a Punnett-square highlight means one possible allele combination.

## P2 — Full diagram QA

For each bay, review:

1. structure names and terminology;
2. source mapping and license;
3. anterior/posterior, left/right, superior/inferior relationships;
4. process order and arrow direction;
5. relative-size claims;
6. visible simplified-model disclosure;
7. keyboard focus and touch selection;
8. paused, stepped, reset, and reduced-motion states;
9. phone portrait, landscape, tablet, and desktop layout;
10. screenshot and browser contract coverage.

## Definition of done

- No diagram implies that a simplified schematic is a clinical or direct atlas image.
- Every macro-anatomical claim is source-aligned.
- Every process animation has Play/Pause/Step/Reset behavior where appropriate.
- Reduced motion disables automatic movement without disabling learning interactions.
- Every bay has an accessible text explanation equivalent.
- Source references and attribution remain visible or reachable in context.
- `npm run verify` and browser review contracts remain green.
