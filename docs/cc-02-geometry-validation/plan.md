# Plan — CC-02 geometry validation

1. ~~Make `scripts/prepare-geometry.mjs` importable: export the pure validators and run `main()` only when invoked directly.~~
2. ~~Fix the Atlantic-coast check so it tests the eastern extent (`maxX`), and keep the outline latitude check.~~
3. ~~Add a geometry-validity check: rings have non-zero area, no ring self-intersects, and no hole lies outside its shell.~~
4. ~~Add a topology check:~~
   - Every boundary segment is owned by at most 2 county rings.
   - No county owns the same segment twice.
   - No proper crossings between different counties' edges (spatial hash).
5. ~~Add a gap and overlap check by area balance: single-owner segments form the outer outline and island loops; loops of single-owner segments inside the mainland outline are gaps; the sum of county areas must equal the outline and island area within tolerance.~~
6. ~~Metadata: record the source sha256 and vintage note, plus a per-county `historicalStatus` (`boundary-change-undated-1915-1952` for U-1, `census-1940-footnote-change-not-in-newberry` for U-2, `no-recorded-change-1942-modern-polygon` otherwise) in the output and in `CountyGeometry`.~~
7. ~~Tests: mutation tests on synthetic fixtures (an overlap, a gap, a self-intersecting ring, a coast check at the wrong edge) fail the validators; the bundled file passes and records the new checks.~~
8. ~~Regenerate `src/data/georgia-counties.json`; typecheck, test, build.~~
9. ~~Record the unresolved Newberry and 39-county research in `docs/cc-02-geometry-validation/unresolved.md`.~~
