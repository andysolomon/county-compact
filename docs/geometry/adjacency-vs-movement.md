# Adjacency versus movement

Geographic adjacency and passable movement are separate datasets (GDD §3.2, §8). This leaf ships adjacency only.

## 1. Definition — geographic adjacency (this leaf)

A shared boundary **segment** (two consecutive identical vertices) creates an undirected geographic adjacency edge. Corner-only / point-only contacts do not. Multipart water-separated pieces stay one county. The rule is implemented by `scripts/prepare-geometry.mjs`, stored in `src/data/georgia-counties.json` `adjacency`, and exposed as `isAdjacencyEdge` / `neighborsOf` in `src/data/geometry.ts`. Modern Census polygons are the crosswalk/mockup base (GDD §3.2); 1942-dated polygons remain open.

## 2. Definition — passable movement (Issue #3 / CC-03, not implemented here)

A passable land crossing is a **movement** edge. River boundaries may still adjoin geographically but impose a crossing cost. Point-only corners never become movement edges. Terrain classes and route tags live on connections, not on county fills (GDD §3.2, §8 terrain / infrastructure modes). No overseas or ocean movement in version one.

## 3. Contract — `MovementEdge`

`src/sim/types.ts` will declare a `MovementEdge` type that references a geographic adjacency pair plus `passable` and `terrainTags`. Until CC-03 lands, the simulation has adjacency edges only: `neighborsOf` / `ADJACENCY`. Rendering (GDD §8) interpolates motion but must not invent neighbors.

## 4. Tests

- `tests/geometry.test.ts` tests adjacency only (counts, symmetry, corner-only exclusion, Cobb BFS coverage, multipart nesting, provenance strings).
- `tests/movement.test.ts` will test passable edges once CC-03 lands.
