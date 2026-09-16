# CC-03 — Unresolved after movement edges and river crossings

## M-1. Rail corridors are not sourced (carries U3-2)

The only period rail evidence is Leahy's 1934 railway map (Rumsey, non-commercial licence). No 1940–1943 Official Guide of the Railways was reachable. No rail data is bundled. Acceptance item 1 stays open.

## M-2. Road routes are not transcribed (carries U3-1)

Movement edges assume every pair of neighbouring counties is road-connected (`basis: "scenario-abstraction…"`). No edge is backed by a dated road source, and US/state route shields on the 1940 and 1944 sheets remain untranscribed.

## M-3. River-crossing tags are derived, not surveyed

The rule tags an edge when at least 50% of the shared boundary lies within 0.02° of a Natural Earth 10m river line. With 417 edges, 75 are tagged and 26 are near-misses (0.3–0.5, listed in `provenance.validationReport`). The count is tolerance-sensitive: 59 at 0.01°, 88 at 0.03°. Parent spot-check against general geography:

- **Plausible:**
  - Chattahoochee: Cobb–Fulton, Douglas–Fulton, Carroll–Fulton, Carroll–Coweta, Forsyth–Gwinnett, Forsyth–Hall, Fulton–Gwinnett, Habersham–White
  - Ocmulgee: Butts–Jasper through Jeff Davis–Wheeler
  - Altamaha: Appling–Tattnall, Long–Wayne, McIntosh–Wayne
- **Likely false negatives (near-misses):**
  - Glynn–McIntosh on the Altamaha (0.438)
  - Dougherty–Lee on the Flint (0.462)
- **Label caveats:**
  - Barrow–Jackson and Clarke–Jackson carry Natural Earth's "Oconee" label along upper tributaries.
  - Crisp–Lee and Crisp–Sumter on the Flint pass through Lake Blackshear (impounded 1930, so present in 1942).
  - Generic names "Little" (4 edges) and "South" (2) are ambiguous Natural Earth labels.

Resolution path: check each tagged edge and near-miss against the 1940/1944 road sheets or USGS topographic quadrangles, then add a documented per-edge override list if needed.

## M-4. Carried operator questions

U3-4 (identity of the "Savannah PN depot"), U3-5 (Marietta airfield 1942 name), and U-4 (county seats unverified) remain open.
