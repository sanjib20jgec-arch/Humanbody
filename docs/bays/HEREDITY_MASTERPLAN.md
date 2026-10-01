# Heredity Bay — Master Plan (DRAFT, discussion only)
> Inherits Cell D6–D27, Tissues TD1–TD5, and the cross-cutting plan. No code until approval.

## 0. Current state audit
| Area | Current |
|---|---|
| Lab | `HeredityLab.jsx` (86 lines): chromosome pair, gene, allele, genotype, phenotype cards; animated monohybrid Punnett square with presets; genotype/phenotype ratios |
| Quiz | 3 items |

### 0.1 Findings
| # | Sev. | Finding |
|---|---|---|
| H1 | Medium | Only **one gene, complete dominance**. Phenotype card correctly warns real inheritance is more complex ✔, but nothing beyond it is explorable. |
| H2 | Medium | Probability shown, but no "sample many offspring" experiment → students may read 3:1 as certainty. |
| H3 | High (scope) | **NEET gaps — Principles of Inheritance & Variation**: Mendel's experiments & laws, dihybrid cross (9:3:3:1), test cross, incomplete dominance, co-dominance (ABO), multiple alleles, polygenic inheritance, pleiotropy, chromosomal theory, linkage & recombination (Morgan), sex determination (XX–XY, XX–XO, ZW–ZZ, haplodiploidy in honeybee), mutation, **pedigree analysis**, Mendelian disorders (haemophilia, colour blindness, sickle-cell anaemia, phenylketonuria, thalassemia), chromosomal disorders (Down, Turner, Klinefelter). **Molecular Basis of Inheritance**: DNA structure, packaging, search for genetic material (Griffith, Hershey–Chase), replication (Meselson–Stahl), transcription, genetic code, tRNA, translation, lac operon, Human Genome Project, DNA fingerprinting. |
| H4 | Medium | Class 10 "Heredity" (new chapter scope): Mendel's contributions, sex determination in humans; evolution content was moved/trimmed — re-verify with current Class 10 book. |

## 1. Syllabus scope
Class 10 Heredity; NEET Principles of Inheritance & Variation + Molecular Basis of Inheritance (highest-weight NEET chapters).

## 2. Sources
OpenStax Biology 2e Ch.12–15; NCERT X & XII; Griffiths *Introduction to Genetic Analysis*; OMIM/NCBI (disorder facts, reference only); RCSB PDB (DNA, RNA polymerase, ribosome — CC0).

## 3. Features
**3D**: chromosome → chromatin → nucleosome → DNA double helix zoom ladder (links Cell nucleus); DNA helix with base pairing (A–T 2 H-bonds, G–C 3 H-bonds), major/minor grooves; replication fork 3D (helicase, primase, DNA polymerase, Okazaki fragments); karyotype board.
**Animations**: meiosis → segregation & independent assortment (links Cell AN14); crossing-over creating recombinants; DNA replication (semi-conservative); transcription & translation (shared with Cell AN6); lac operon on/off; Hershey–Chase & Meselson–Stahl experiments; Griffith transformation.
**Simulations**: (1) **Punnett lab v2** — monohybrid, dihybrid, test cross, incomplete/co-dominance, multiple alleles (ABO), sex-linked; (2) **Offspring sampler** — generate 10/100/1000 offspring, watch ratios converge (law of large numbers); (3) **Pedigree builder & solver** — draw family trees, infer mode of inheritance; (4) Linkage lab — distance vs recombination frequency; (5) Sex-determination explorer (human, grasshopper, birds, honeybee); (6) Mutation lab — point mutation → codon change → protein effect (sickle-cell example); (7) DNA fingerprinting gel lab (virtual electrophoresis, Advanced).
**Missions**: "Mendel's garden" — reproduce Mendel's pea experiments and discover the laws yourself.
**Assessment**: cross solving, pedigree identification, codon table puzzles, experiment-to-conclusion matching.

## 4. Accuracy specifics
Ratios are expectations, not guarantees (sampler); dominance ≠ frequency ("dominant traits are not always common" misconception); environment affects phenotype; genetic disorders described respectfully, no deterministic or eugenic framing; NCERT vs modern notes (e.g. "one gene–one enzyme" → modern gene concept).

## 5. Open questions
1. Molecular Basis of Inheritance here, or shared with Cell bay's protein-synthesis animation (proposed: here, re-using Cell assets)?
2. Include DNA fingerprinting / HGP at NEET level?
3. Evolution (Class 10/12) — out of scope for now?

## 6. Round 10 findings
- Class 10 (2026-27) Ch.8 is titled **"Heredity"** (evolution rationalised out) → Evolution stays out of scope for Class 10; NEET Evolution remains a future decision.
- Benchmarks: PhET "Gene Expression Essentials", "Natural Selection" (CC BY 4.0).


## Class 10 layer
See `docs/CLASS_10_CURRICULUM_PLAN.md` (NCERT/CBSE + WBBSE Madhyamik coverage matrix and per-bay Class 10 features).
