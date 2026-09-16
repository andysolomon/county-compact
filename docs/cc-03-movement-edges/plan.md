# Plan — CC-03 movement edges and river crossings

1. ~~`scripts/prepare-movement.mjs`: inputs are the two Natural Earth river files; reads `src/data/georgia-counties.json`; writes `src/data/movement-edges.json` with provenance (source URLs, sha256, licence quote, rule, deterministic ranAt) and a validation report. Supports `--check`, importable, pure exported functions.~~
2. ~~Crossing rule: for each adjacency pair, rebuild the shared boundary polyline from segments owned by both counties. Tag the edge `river:<name>` when at least 50% of the shared boundary length lies within tolerance of that river's lines (tolerance justified by NE 10m precision). Report the per-edge fraction for audit.~~
3. ~~Validation: edges match adjacency exactly (symmetric, no corner-only pairs); Cobb–Fulton is tagged Chattahoochee; state-border rivers (Savannah, St. Marys) produce no internal edges; the tagged-edge count and a per-river breakdown are reported.~~
4. ~~`src/data/movement.ts`: typed accessors (`movementEdge(a,b)`, `crossingOf(a,b)`) behind the data layer; no sim or UI changes.~~
5. ~~Tests: symmetry and adjacency parity, the Cobb–Fulton Chattahoochee crossing, the corner-only exclusion, synthetic fixtures for the ≥50% rule (a boundary along a river is tagged; a river crossing the boundary perpendicularly is not).~~
6. Docs: `docs/ASSETS.md` source row; `docs/cc-03-movement-edges/unresolved.md` for deferred rail, roads, seats and operator questions.
7. ~~Typecheck, test, build.~~
