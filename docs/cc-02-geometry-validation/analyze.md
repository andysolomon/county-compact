# Analyze — CC-02 geometry validation

Date: 2026-09-16. Workflow leaf: CC-02 (GitHub issue #2), branch `feat/cc-02-geometry-validation`. Chosen as next work: CC-02 is `ready` and unblocks CC-03 → CC-04 → CC-06.

## Acceptance criteria and state

| Criterion | State | Evidence / gap |
|---|---|---|
| Dated county geometry, recognizable outline and Atlantic coast; all records and multipart geometry preserved | Partial | 159 counties, multipart preserved. Geometry is the modern Census cartographic file; no per-county historical status. The coast check tests `minX <= -81.5` (western edge, −85.6) instead of the eastern coast (`maxX` −80.84). |
| Validate coverage, shared boundaries, overlaps, gaps, geometry validity | Partial | `validateCoverage` is bbox-only. No overlap, gap, self-intersection, or zero-area checks. |
| Symmetric adjacency; corner-only contacts excluded | Met | `validateAdjacency`, `validateSharedBoundaryRule`, `tests/geometry.test.ts` |
| Reproducible preparation and source/version metadata; adjacency separate from routes | Partial | Regeneration from the cached source is byte-identical. The source has no recorded vintage or checksum. Route data is separate (CC-03). |

Source used: plotly/datasets `geojson-counties-fips.json`, sha256 `e540149b7525e71ee6b6cab6dea2a95205f11e0c3e7374d27a7c9c47ea96e8c0`.

## Scope decision

True 1942 polygons need Newberry AHCBP geometry. That is licence-gated (U-6: written confirmation is needed for commercial use) and needs map-by-map research for 39 + 4 counties (U-1, U-2). GDD §3.2 allows each difference from modern geometry to be "resolved or visibly documented". This pass documents: every county gets a `historicalStatus` flag from U-1/U-2. Bundling Newberry polygons and resolving the 39 stays open and is recorded as unresolved.
