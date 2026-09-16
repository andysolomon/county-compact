# Bundled runtime assets

All assets shipped with the local build. No runtime network requests fetch any
asset; fonts and geometry are bundled by Vite at build time.

## Fonts

Variable fonts under the SIL Open Font License 1.1, redistributed unmodified.
License texts are bundled beside the font files.

| Asset | Path | Version | License |
| --- | --- | --- | --- |
| Source Serif 4 Variable (Roman) | `src/assets/fonts/SourceSerif4Variable-Roman.otf.woff2` | Adobe source-serif release 4.005R | SIL OFL 1.1 (`src/assets/fonts/OFL-SourceSerif4.md`) |
| Source Serif 4 Variable (Italic) | `src/assets/fonts/SourceSerif4Variable-Italic.otf.woff2` | Adobe source-serif release 4.005R | SIL OFL 1.1 (`src/assets/fonts/OFL-SourceSerif4.md`) |
| Source Sans 3 Variable (Upright) | `src/assets/fonts/SourceSans3VF-Upright.otf.woff2` | Adobe source-sans release 3.052R | SIL OFL 1.1 (`src/assets/fonts/OFL-SourceSans3.md`) |

`@font-face` rules are declared in `src/styles/fonts.css`, imported ahead of
`tokens.css` via `src/styles/app.css`, so Vite fingerprints and bundles the
files with the application.

## Geometry data

| Asset | Path | Source | License / rights |
| --- | --- | --- | --- |
| Georgia county polygons, adjacency, provenance | `src/data/georgia-counties.json` | U.S. Census Bureau cartographic boundary file, filtered to STATE 13 from plotly/datasets `geojson-counties-fips.json` (per `scripts/prepare-geometry.mjs` and the file's `provenance` block) | Public-domain U.S. federal data; retain Census notices |

Regeneration and validation are reproducible via `scripts/prepare-geometry.mjs`
(`npm run prepare-geometry`). Modern Census geometry is used as the
crosswalk/mockup base; February 1, 1942 historical polygons remain Issue #2
work.

### Historical verification status

As recorded in the `provenance.historicalVerification` block of
`src/data/georgia-counties.json`: the county roster is verified for 1942-02-01
against the Newberry Atlas of Historical County Boundaries (AHCBP) and the 1940
Census (see `docs/historical-research/issue-1-roster.md`). The geometry itself
remains modern; historical verification status of derived facts (seats,
terrain, roads, federal facilities) is as recorded in the provenance blocks of
the relevant data and in `docs/historical-research/`.
