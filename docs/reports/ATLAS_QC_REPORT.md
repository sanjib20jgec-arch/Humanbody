# BodyParts3D Atlas QA and Performance Report

Generated: 2026-10-02  
Manifest: BodyParts3D 4.0  
Scope: Adult male reference anatomy · 2,234 source meshes  
License: CC BY 4.0; see `public/ATTRIBUTION-BodyParts3D.md`.

## Executive summary

- **Source meshes:** 2,234
- **Source triangles declared by manifest:** 6,681,030
- **Geometry chunks:** 15
- **Raw geometry transfer:** 56.79 MB
- **Compressed geometry transfer:** 31.43 MB
- **Compression ratio:** 1.81×
- **Reference scope:** adult-male educational anatomy, not a diagnostic or surgical model

The atlas starts with the indexed skeletal chunk and requests other chunks only after an explicit system/search action. This report is a manifest and transfer QA report; it does not replace browser-level visual, spatial, or clinical-content review.

## Landmark structure presence

| Landmark | Manifest match | Expected system | Startup chunk(s) |
|---|---|---|---|
| Brain | Present | Expected | 5, 6 |
| Heart | Present | Expected | 8, 9 |
| Kidneys | Present | Expected | 7, 11, 13, 14 |
| Lungs | Missing | — | — |
| Bronchial tree | Present | Expected | 7, 8, 9, 13 |
| Liver | Present | Expected | 7, 8, 11 |
| Spinal cord | Present | Expected | 4, 5 |
| Aorta | Present | Expected | 7, 13 |

## System coverage

| System | Learning module | Parts | Vertices | Approx. triangles | Chunks |
|---|---|---:|---:|---:|---|
| arterial | Circulation | 639 | 210,758 | 333,798 | 5, 7, 8, 9, 11, 13, 14 |
| cardiac | Circulation | 18 | 24,010 | 38,778 | 8 |
| connective | Tissues | 40 | 42,730 | 45,524 | 0, 1, 3, 5, 9, 10 |
| digestive | Digestion | 97 | 96,287 | 88,382 | 7, 9, 10, 11, 13 |
| endocrine | Atlas reference | 4 | 2,409 | 4,756 | 6, 11 |
| integumentary | Atlas reference | 5 | 49,849 | 60,362 | 10, 11 |
| lymphatic | Atlas reference | 3 | 1,570 | 2,794 | 9, 11 |
| muscular | Tissues | 402 | 677,942 | 656,120 | 0, 1, 2, 3, 4, 5, 8, 9, 10, 11 |
| nervous | Brain & Nerves | 146 | 132,656 | 218,600 | 0, 5, 6, 7 |
| reproductive | Reproduction | 12 | 4,439 | 6,386 | 11 |
| respiratory | Respiration | 119 | 51,548 | 82,078 | 8, 9, 10, 12, 13 |
| sensory | Brain & Nerves | 43 | 78,505 | 104,184 | 0, 3, 10, 12, 13 |
| skeletal | Atlas reference | 296 | 229,239 | 338,056 | 0, 1, 4, 8, 9, 10, 11, 12, 13 |
| urinary | Excretion | 6 | 2,896 | 5,100 | 11 |
| venous | Circulation | 404 | 177,681 | 303,350 | 7, 8, 9, 11, 13, 14 |

## Chunk index and transfer budget

| Chunk | Raw | Gzip | Indexed structures | Systems | Learning modules |
|---:|---:|---:|---:|---|---|
| 0 | 3.83 MB | 2.15 MB | 123 | connective, muscular, nervous, sensory, skeletal | nervous, tissues |
| 1 | 4.32 MB | 2.19 MB | 135 | connective, muscular, skeletal | nervous, tissues |
| 2 | 4.23 MB | 2.21 MB | 7 | muscular | tissues |
| 3 | 3.85 MB | 1.98 MB | 94 | connective, muscular, sensory | nervous, tissues |
| 4 | 3.83 MB | 1.98 MB | 77 | muscular, skeletal | nervous, tissues |
| 5 | 3.84 MB | 2.08 MB | 226 | arterial, cardiac, connective, muscular, nervous | circulation, nervous, tissues |
| 6 | 3.85 MB | 2.27 MB | 99 | cardiac, endocrine, nervous, sensory | circulation, nervous |
| 7 | 3.82 MB | 2.28 MB | 163 | arterial, digestive, nervous, venous | circulation, digestion, nervous |
| 8 | 3.84 MB | 2.27 MB | 230 | arterial, cardiac, muscular, respiratory, skeletal, venous | circulation, nervous, respiration, tissues |
| 9 | 3.83 MB | 2.15 MB | 293 | arterial, connective, digestive, lymphatic, muscular, respiratory, skeletal, venous | circulation, digestion, nervous, respiration, tissues |
| 10 | 3.86 MB | 2.15 MB | 64 | connective, digestive, integumentary, muscular, respiratory, sensory, skeletal | digestion, nervous, respiration, tissues |
| 11 | 3.85 MB | 2.21 MB | 295 | arterial, digestive, endocrine, integumentary, lymphatic, muscular, reproductive, skeletal, urinary, venous | circulation, digestion, excretion, nervous, reproduction, tissues |
| 12 | 3.81 MB | 2.16 MB | 128 | respiratory, sensory, skeletal | nervous, respiration |
| 13 | 3.82 MB | 2.06 MB | 168 | arterial, digestive, respiratory, sensory, skeletal, venous | circulation, digestion, nervous, respiration |
| 14 | 2.19 MB | 1.28 MB | 132 | arterial, venous | circulation |

## Runtime index-buffer estimate

The packed source format stores indices as 32-bit values. The renderer now compacts a merged chunk/system mesh to 16-bit indices only when the merged vertex count is at most 65,535; wider merged meshes remain 32-bit. This is an estimated GPU index-buffer comparison, not a substitute for browser GPU profiling.

- **Merged chunk/system groups:** 66
- **16-bit eligible groups:** 59
- **32-bit groups retained:** 7
- **32-bit baseline index memory:** 26.19 MB
- **Estimated optimized index memory:** 18.40 MB
- **Estimated saving:** 7.79 MB

| Chunk | Merged groups | 16-bit eligible | 32-bit retained | Baseline index | Estimated optimized | Estimated saving |
|---:|---:|---:|---:|---:|---:|---:|
| 0 | 5 | 4 | 1 | 1.91 MB | 1.52 MB | 0.39 MB |
| 1 | 3 | 2 | 1 | 1.64 MB | 1.48 MB | 0.15 MB |
| 2 | 1 | 0 | 1 | 1.61 MB | 1.61 MB | 0.00 MB |
| 3 | 3 | 2 | 1 | 1.46 MB | 1.43 MB | 0.03 MB |
| 4 | 2 | 1 | 1 | 1.39 MB | 1.35 MB | 0.03 MB |
| 5 | 4 | 4 | 0 | 1.78 MB | 0.89 MB | 0.89 MB |
| 6 | 2 | 1 | 1 | 2.02 MB | 2.01 MB | 0.01 MB |
| 7 | 4 | 4 | 0 | 2.10 MB | 1.05 MB | 1.05 MB |
| 8 | 6 | 6 | 0 | 2.06 MB | 1.03 MB | 1.03 MB |
| 9 | 8 | 8 | 0 | 1.80 MB | 0.90 MB | 0.90 MB |
| 10 | 7 | 7 | 0 | 1.80 MB | 0.90 MB | 0.90 MB |
| 11 | 10 | 10 | 0 | 1.95 MB | 0.97 MB | 0.97 MB |
| 12 | 3 | 2 | 1 | 1.84 MB | 1.84 MB | 0.01 MB |
| 13 | 6 | 6 | 0 | 1.71 MB | 0.86 MB | 0.86 MB |
| 14 | 2 | 2 | 0 | 1.13 MB | 0.56 MB | 0.56 MB |

## QA interpretation

1. Landmark rows must remain present and mapped to the expected system before release.
2. A structure being present in the manifest does not prove its spatial orientation, relative size, or teaching label is correct; those require visual review against OpenStax Anatomy & Physiology 2e and the BodyParts3D source description.
3. Compression reduces transfer cost but does not prove acceptable frame time, draw-call count, GPU memory, or decompression latency.
4. Browser tests and real-device measurements remain required release gates.
5. The accessible 2D diagram is a complementary keyboard/touch route, not a replacement for the certified 3D atlas.
