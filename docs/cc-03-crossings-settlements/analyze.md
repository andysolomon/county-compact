# Analyze — CC-03 continued: river-tag corroboration and 1940 seat verification

Date: 2026-09-16. Workflow leaf: CC-03 (GitHub issue #3). Branch `feat/cc-03-crossings-settlements`. Follows PR #33 (movement edges).

## Open acceptance items after PR #33

| Criterion | Gap | Tractable now with open data? |
|---|---|---|
| Date-source roads | No route verified for 1942-02-01; 1940/1944 sheets are CC BY-NC-SA 3.0 and route shields are untranscribed | No — licence-restricted and needs manual sheet reading. Stays open. |
| Date-source rail corridors | Only a 1934 Rumsey map (non-commercial) | No public-domain period rail source found. Stays open. |
| Date-source river crossings | 75 tags derived from Natural Earth 10m (small scale, generic labels, 2 likely false negatives) | **Yes** — US Census TIGER/Line 2023 LINEARWATER (public domain, named features) corroborates each shared boundary. |
| Date-source seats and settlements | `roster.ts` SEATS are modern placeholders (U-4) | **Partially** — 1940 Census Vol. I Georgia chapter (public domain) Table 5 lists incorporated places with county; confirms each seat existed as an incorporated place in 1940 and gives its population. Seat *status* itself is not in the census tables. |
| Operator questions U3-4, U3-5 | Need operator decision | No. Stays open. |

## Inputs (scratchpad, not bundled)

- TIGER/Line 2023 LINEARWATER, 159 per-county zips (64 MB), `https://www2.census.gov/geo/tiger/TIGER2023/LINEARWATER/tl_2023_<fips>_linearwater.zip`. Public domain (US Government work). Fields include FULLNAME and MTFCC.
- 1940 Census Population Vol. I, Georgia chapter, `https://www2.census.gov/library/publications/decennial/1940/population-volume-1/33973538v1ch04.pdf` (23,390,865 bytes). Public domain. The embedded OCR text layer is poor (e.g. "PopuJation", split columns), so extraction needs re-OCR or tolerant matching and explicit confidence.

## Decisions

- Crossings: a crossing is tagged when a named TIGER feature whose name contains "River" covers at least 50% of the shared boundary, or when the existing Natural Earth rule tags it. The label comes from TIGER when available, which resolves "Little"/"South" and the upper-Oconee tributary labels. Every change against PR #33's tag set is listed in the validation report, never silently applied. Modern hydrography is accepted as a proxy for 1942 river courses because the county boundaries themselves follow those rivers; reservoir-only features (names containing "Lake"/"Reservoir" without "River") are excluded, per the "unverified reservoirs" rule.
- Seats: data records `seat1940Evidence` per county: matched incorporated-place name, 1940 population (null when OCR is not confident), and `seatStatusBasis: "modern seat assumed; incorporation in 1940 confirmed by Census Table 5"`. Unmatched seats are listed, not guessed.
- No new runtime dependencies; scripts follow the existing `prepare-*.mjs` pattern (exported pure functions, `--check`, deterministic timestamps, sha256 provenance).
