# CC-02 — Unresolved after geometry validation

These do not block the board, the adjacency graph, or the validation gate. They keep the geometry out of historically verified status.

## G-1. Modern polygons stand in for 1942 polygons

Every county carries `historicalStatus`:

| Status | Counties | Meaning |
|---|---|---|
| `boundary-change-undated-1915-1952` | 38 | Newberry dates a mappable change only "by 31 December 1952" (issue-1-unresolved.md U-1; Gordon is reclassified under G-2) |
| `census-1940-footnote-change-not-in-newberry` | 4 (Floyd, Gordon, Marion, Talbot) | 1933/1934 changes recorded by the 1940 Census (U-2) |
| `no-recorded-change-1942-modern-polygon` | 117 | No recorded change between 1942 and the modern file |

Resolution path: compare the 1940 Census minor-civil-division maps and the Hudgins 1915 / Official 1952 highway maps, as described in U-1. Bundling Newberry AHCBP polygons also needs the licence confirmation in U-6.

## G-2. Gordon appears in both source lists

Gordon is in the Newberry undated list (U-1) and the 1940 Census footnote list (U-2). The Census is the earlier and more specific witness, so the build assigns the U-2 flag.

## G-3. Coastline is simplified and carries no barrier islands

The source is a low-resolution cartographic file. The mainland outline is a single 536-vertex loop, with 0 multipart counties and 0 islands. The Atlantic coast passes the extent check (max longitude −80.8405), but the Sea Islands are absent. If the coast needs islands for play or recognizability, a higher-resolution Census file is required. The island and hole validation paths are exercised only by synthetic fixtures today.

## G-4. Source vintage is unrecorded

plotly/datasets does not state the Census vintage. The build pins the input by sha256 (`e540149b…e8c0`) instead.
