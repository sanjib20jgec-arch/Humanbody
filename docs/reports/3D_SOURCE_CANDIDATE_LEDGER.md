# 3D source candidate ledger

Status: **CANDIDATE INTAKE — NO RUNTIME ASSET APPROVED**

No candidate is loaded by the application until scientific, provenance, entry-specific license, visual, and offline-asset reviews are all complete and recorded. Repository presence (NIH 3D, RCSB) is never itself an approval: NIH 3D terms require independent verification of scientific conclusions and entry-specific licensing.

Candidates are intentionally triaged by educational fit, licensing, and scientific review status. A candidate is not a source attribution, a validated mesh, or permission to ship an asset.

Required gates per candidate: scientific, provenance, license, visual, offline

| Module | Provider | Entry-specific id | Status | Reviews (scientific · provenance · license · visual · offline) |
| --- | --- | --- | --- | --- |
| cell | NIH 3D Print Exchange | not selected | candidate-not-approved | pending · pending · pending · pending · pending |
| cell | RCSB Protein Data Bank / Mol* | not selected | candidate-not-approved | pending · pending · pending · pending · pending |
| tissues | NIH 3D Print Exchange | not selected | candidate-not-approved | pending · pending · pending · pending · pending |
| heredity | RCSB Protein Data Bank / Mol* | not selected | candidate-not-approved | pending · pending · pending · pending · pending |
| heredity | NIH 3D Print Exchange | not selected | candidate-not-approved | pending · pending · pending · pending · pending |
| kinesiology | Authored in-house (Human Biology Lab), procedural articulated performance rig | authored-rig-v1 | candidate-intake | pending · pending · pending · pending · pending |
| kinesiology | CMU Graphics Lab Motion Capture Database, via lawrennd/mocap GitHub mirror (BVH conversions) | lawrennd/mocap:python/files/10_01.bvh,10_03.bvh,11_01.bvh,14_06.bvh,14_10.bvh,14_19.bvh,Swagger.bvh | candidate-intake | pending · pending · pending · pending · pending |
| kinesiology | MakeHuman / MPFB community core assets | not selected | candidate-intake | pending · pending · pending · pending · pending |

## Required approval steps

- Identify a specific versioned model entry (`entrySpecificId`), not only a repository.
- Confirm the entry license, attribution, download rights, and offline redistribution terms.
- Check scientific provenance, scale, labels, topology, and educational scope with a named reviewer.
- Convert or package locally only after approval; do not load a remote viewer or CDN asset at runtime.
- Add source metadata, limitations, and a visual review matrix before exposing the model.
