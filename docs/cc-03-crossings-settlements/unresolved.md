# CC-03 — Unresolved after crossing corroboration and 1940 seat evidence

Carries forward `docs/cc-03-movement-edges/unresolved.md` (M-1 rail, M-2 roads, M-4 operator questions U3-4, U3-5). Those remain open and unchanged.

## C-1. River-crossing tags now rest on two public-domain sources, still modern

`src/data/movement-edges.json` tags 109 of 417 edges: 72 agreed by Natural Earth 10m and TIGER/Line 2023, 34 TIGER-only additions, 3 Natural Earth-only. The two near-misses from the earlier pass are resolved: Glynn–McIntosh (Altamaha) and Dougherty–Lee (Flint) are now tagged. Both sources are modern hydrography, so they stand in for the 1942 river courses the county boundaries follow.

Rules and why:
- A generalised county-boundary segment gets full TIGER credit only when both endpoints lie within 0.02° of the same river. The first worker pass used either endpoint and inflated the tags to 207; the parent rejected it.
- Wide main stems are polygons in TIGER AREAWATER, so ring edges of polygons named "… River" are included. Lakes and reservoirs are excluded by name.
- When TIGER rivers tie within 0.01, the Natural Earth main stem wins. This fixes Washington–Wilkinson, which was labelled with the "Dead" oxbow instead of the Oconee.

Open, listed in `provenance.validationReport.diff`:
- **Disputed:**
  - Baldwin–Putnam: Natural Earth "Little"; TIGER only 0.25, likely Lake Sinclair.
  - Barrow–Jackson: Natural Earth "Oconee"; TIGER relabels it Mulberry.
  - Clarke–Jackson: Natural Earth "Oconee" at exactly 0.50; TIGER "Middle Oconee" 0.30.
- **Questionable additions:**
  - Dawson–Hall is labelled Chattahoochee; the boundary is more likely the Chestatee, and both tie at 1.0 inside modern Lake Lanier (impounded 1956).
  - Muscogee–Talbot is labelled "Tar" and needs a source check.
  - Liberty–McIntosh (South Newport) is estuarine, and area-water rings may over-credit it.
- **Ambiguous name:** bare "Little" labels (Cherokee–Fulton, McDuffie–Wilkes, Taliaferro–Wilkes, Warren–Wilkes) are TIGER's own names but refer to different Little Rivers.

## C-2. 1940 seat evidence is partial

`src/data/settlements.json` checks every `roster.ts` seat against OCR of 1940 Census Table 5 (public domain). Matching a place confirms it was an incorporated place in 1940. It does not confirm seat status, which the census does not record.

- **Matched:** 144 of 159.
- **Unmatched (15):** Clayton/Jonesboro, Columbia/Appling, Crawford/Knoxville, Echols/Statenville, Forsyth/Cumming, Gilmer/Ellijay, Glascock/Gibson, Irwin/Ocilla, Jackson/Jefferson, Jones/Gray, Lee/Leesburg, Telfair/McRae, Tift/Tifton, Troup/LaGrange, Twiggs/Jeffersonville.
  - Most are OCR failures in the county field; LaGrange and Tifton were certainly incorporated.
  - Statenville may have been unincorporated in 1940.
  - The next step is a Table 4 (minor civil division) pass or a manual page read.
- **1940 population:** 117 seats have one.
  - 70 are corroborated by the PDF's own text layer.
  - 47 are single-OCR reads (`population1940Corroborated: false`). They are provisional; Waynesboro 3,703 against 3,793 on the text layer is a likely digit error.
  - 27 matched seats have a null population, because the value failed a vote, sanity, duplicate or text-layer check. They are listed in `validationReport` and `seat-verification.md`.
- **1930 population:** read but not validated, so not published.
- **Build checks:** Atlanta, Macon, Savannah, Augusta, Columbus and Marietta must match exactly or the build fails.
- **Reproducibility:** needs system `pdfimages`, ImageMagick and `tesseract` (`scripts/ocr/`), and tesseract versions can change the reads.

CC-04 must not treat uncorroborated populations as final starting data.
