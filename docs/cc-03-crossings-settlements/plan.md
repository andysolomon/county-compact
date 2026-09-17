# Plan — CC-03 continued

1. Crossing corroboration (implement, medium-heavy)
   1. ~~Minimal dependency-free .shp/.dbf reader for polyline shapefiles inside zips (use system `unzip -p`, or a scratch extract dir passed on the CLI).~~
   2. ~~`scripts/prepare-movement.mjs`: optional third argument, TIGER linearwater directory; per edge compute the named-river boundary fraction; record `corroboration` on crossings; resolve labels; report added/removed/relabelled edges against the Natural Earth-only result.~~
   3. ~~Regenerate `src/data/movement-edges.json`; extend `src/data/movement.ts` types; tests in `tests/movement.test.ts` (Cobb–Fulton Chattahoochee corroborated; Glynn–McIntosh Altamaha tagged; no "Little"/"South" bare labels without TIGER corroboration name).~~
2. Seat verification (implement, medium-medium)
   1. ~~`scripts/prepare-settlements.mjs` reads the 1940 Census Georgia chapter text (re-OCR Table 5 pages with pdftoppm + tesseract when the text layer is unusable) and matches each `roster.ts` seat to a place + county.~~
   2. ~~`src/data/settlements.json` + `src/data/settlements.ts`; `tests/settlements.test.ts` (159 records, Marietta/Cobb and Atlanta/Fulton matched, provenance sha256).~~
3. ~~Parent: ASSETS.md rows, package.json scripts, unresolved.md, workflow evidence, verify (typecheck, test, build), PR, merge on green CI.~~

Review loops: crossing pass 1 rejected (either-endpoint credit inflated tags to 207; wide rivers missing) and redone with both-endpoint credit plus AREAWATER; parent added the Natural Earth main-stem tie-break. Seat pass 1 failed verification (populations misaligned across rows) and was redone with y-aligned rows, 2-of-3 votes and text-layer corroboration; parent removed unvalidated 1930 populations.
