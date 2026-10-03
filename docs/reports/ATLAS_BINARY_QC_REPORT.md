# Atlas binary QC report

Generated: 2026-10-03  
Manifest: BodyParts3D 4.0  
Scope: all 15 compressed geometry chunks and 2234 source parts

## Validation performed

- Compressed byte size matches the manifest for every chunk.
- Gzip inflation succeeds for every chunk.
- Position, normal, and index spans remain within the inflated chunk buffer.
- Attribute offsets satisfy their typed-array alignment requirements.
- Every packed uint32 index is smaller than its source part vertex count.

## Results

| Chunk | Parts | Compressed | Raw | Maximum source index | Invalid spans | Invalid indices |
|---:|---:|---:|---:|---:|---:|---:|
| 0 | 123 | 2,257,262 | 4,019,496 | 13,964 | 0 | 0 |
| 1 | 135 | 2,299,850 | 4,526,484 | 36,745 | 0 | 0 |
| 2 | 7 | 2,312,911 | 4,438,056 | 36,850 | 0 | 0 |
| 3 | 94 | 2,079,806 | 4,041,436 | 25,052 | 0 | 0 |
| 4 | 77 | 2,075,177 | 4,020,544 | 5,815 | 0 | 0 |
| 5 | 226 | 2,176,648 | 4,022,564 | 4,185 | 0 | 0 |
| 6 | 99 | 2,378,951 | 4,035,584 | 7,199 | 0 | 0 |
| 7 | 163 | 2,385,857 | 4,006,940 | 4,420 | 0 | 0 |
| 8 | 230 | 2,382,534 | 4,028,452 | 5,902 | 0 | 0 |
| 9 | 293 | 2,259,266 | 4,018,260 | 8,141 | 0 | 0 |
| 10 | 64 | 2,249,282 | 4,046,108 | 22,901 | 0 | 0 |
| 11 | 295 | 2,319,620 | 4,037,528 | 8,468 | 0 | 0 |
| 12 | 128 | 2,268,977 | 4,000,292 | 5,333 | 0 | 0 |
| 13 | 168 | 2,165,080 | 4,004,548 | 45,139 | 0 | 0 |
| 14 | 132 | 1,344,908 | 2,300,452 | 2,387 | 0 | 0 |

All values in this report are binary-layout checks. They do not establish anatomical orientation, visual correctness, clinical validity, or acceptable GPU frame time.
