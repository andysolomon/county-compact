# 1940 Census Table 5 seat verification

Roster `SEATS` (modern placeholders) checked against Table 5, *Population of incorporated and urban places: 1940 and 1930*, in the 1940 Census of Population Vol. I Georgia chapter. Seat *status* is not in the census; a match only confirms the place was incorporated in 1940.

Source PDF (not bundled): `scratchpad/cc03/census1940-ga.pdf`  
URL: https://www2.census.gov/library/publications/decennial/1940/population-volume-1/33973538v1ch04.pdf  
23,390,865 bytes · sha256 `0340f343692ea40b52e83009ca058c2c5a4194d104addff03d2972935ab3238f` · US Government work, public domain.

OCR intermediates live in `scratchpad/cc03/table5-ocr/` (outside the repo). No PDF, scan, crop or OCR file is committed.

## Result (`src/data/settlements.json`)

| count | value |
|---|---|
| seats | 159 |
| matched to a Table 5 place (name + county) | 144 |
| unmatched | 15 |
| non-null `population1940` | 117 |
| `population1940Corroborated: true` | 70 of 117 |
| matched but `population1940` null | 27 |
| of which nulled by integrity checks | 9 (7 text-layer contradictions, 2 duplicates) |

All six spot checks match exactly. No 1940 value is shared by two places. No seat has a 1940 population under 100.

## Method

1. **Scans and crops.** `pdfimages -f 21 -l 23 -png` gives 400 dpi 1-bit scans. `scripts/ocr/ocr-table5.py` crops each Table 5 panel (three per page) and its four fields (place, county, 1940, 1930) into `table5-ocr/crops/`. All crops of a panel share the panel's y origin.
2. **Place and county lines.** `tesseract <field>.png raw/<panel>-<field>-psm6 --psm 6 --dpi 400 -c tessedit_create_tsv=1` for the place and county fields. The script reads the TSV word boxes and groups them into lines by vertical centre (±12 px), dropping boxes under 18 px tall (dot leaders).
3. **Population cells.** `scripts/ocr/ocr-rows.py` finds the panel's vertical rules from the column ink profile, crops the 1940 and 1930 columns between them, and cuts one 34 px band per text row (centres from the whole-column TSV, plus any uncovered single-line ink run). Each band is OCRed three times on its own: 1×, 2× and 3× scale, `tesseract --psm 7` with a digit/comma whitelist. Output: `raw/<panel>-{pop1940,pop1930}-rows.tsv` (`cy top bottom v1x v2x v3x`).
4. **Voting.** A cell's value is accepted only when at least two of the three reads parse to the same integer and no other value ties. 3/3 agreement is `clean`, 2/3 is `corrected`, anything else is null / `unparsed`. Malformed groups (`4,45`, `1 7608`, `, 228`) do not parse.
5. **Row alignment by position.** Each population row goes to the place line nearest in y within ±14 px. A row about as close to two place lines (within 3 px) is ambiguous and nulls both. A place with no row, or more than one, gets null. List order is never used. Counties come from county lines within ±14 px. The window widens to ±40 px only when a brace is on that row (`{De Kalb / Fulton}`).
6. **Matching.** A seat matches a place row only when the name matches (case/punctuation-insensitive, OCR confusions l/1, rn/m, e/c, 0/o, small edit distance) **and** that row's counties include the seat's county. The best row is chosen on name score alone, and extra words cost 5 points, so "Savannah" beats "Savannah Beach". Rows with a population get no bonus. `population1940`, `population1930` and `urban1940` come from the matched row only. Tied rows with different populations null the populations.
7. **Sanity.** Both years are nulled when 1940/1930 is outside 0.33×–3×.
8. **Publication.** `population1930` is used only as the sanity reference above. It is not validated against the page (e.g. Marietta read 7,838 where the page shows 7,638), so the parent removed it from `settlements.json`. Uncorroborated `population1940` values (`population1940Corroborated: false`) are provisional OCR reads.
8. **Text-layer veto.** `pdftotext -f 21 -l 23 -layout` gives the PDF's own OCR layer, which was made independently. A value is nulled when a layer line has the place name, then the seat's county as the next word, then within 30 characters a cleanly delimited number that differs from both our 1940 and 1930 figures.
9. **Integrity nulls.** A seat with a 1940 population under 100 is nulled. Every place sharing a 1940 value with a different place is nulled.
10. **Corroboration.** `population1940Corroborated` is `true` when some layer line has a fuzzy match of the seat (or matched place) name and the first number after it equals `population1940`. Commas and spaces inside digit groups are removed first (`302, 288` → 302288). It is `false` otherwise, and `null` when `population1940` is null.

The build fails (`validationReport.ok: false`, exit 1, no file written) unless: one row per county; bases consistent; **all spot checks exact**; **no duplicate 1940 value across different places**; **no seat under 100**; corroboration null exactly when population is null.

## Exact commands

Run from the directory that holds `scratchpad/` and the repo worktree.

```bash
PDF=scratchpad/cc03/census1940-ga.pdf
OUT=scratchpad/cc03/table5-ocr

python3 scripts/ocr/ocr-table5.py <pdf> <ocr-dir> # scans + panel/field crops

for p in p21-panel{1,2,3} p22-panel{1,2,3} p23-panel{1,2,3}; do
  for f in place county; do
    tesseract $OUT/crops/$p-$f.png $OUT/raw/$p-$f-psm6 --psm 6 --dpi 400 -c tessedit_create_tsv=1
  done
  for f in pop1940 pop1930; do
    tesseract $OUT/crops/$p-$f.png $OUT/raw/$p-$f-psm6 --psm 6 --dpi 400 -c tessedit_create_tsv=1 \
      -c tessedit_char_whitelist="0123456789,()*† "
  done
done

CC03_OCR_DIR=<ocr-dir> python3 scripts/ocr/ocr-rows.py              # per-row 1x/2x/3x population reads

cd <worktree>
npm run prepare-settlements -- --check ../scratchpad/cc03/table5-ocr ../scratchpad/cc03/census1940-ga.pdf
npm run prepare-settlements -- ../scratchpad/cc03/table5-ocr ../scratchpad/cc03/census1940-ga.pdf
```

Needs `pdfimages`, `pdftotext`, `magick`, `tesseract` and Python 3 (stdlib only). No npm dependencies.

## Spot checks (print pages 254–256, exact)

| seat | county | Table 5 1940 | parsed | corroborated |
|---|---|---|---|---|
| Atlanta | Fulton (also De Kalb) | 302,288 | 302288 | true |
| Macon | Bibb | 57,865 | 57865 | true |
| Savannah | Chatham | 95,996 | 95996 | true |
| Augusta | Richmond | 65,919 | 65919 | false (layer line has no number) |
| Columbus | Muscogee | 53,280 | 53280 | true |
| Marietta | Cobb | 8,667 | 8667 | true |

## Nulled 1940 populations on matched seats (27)

Integrity checks (in `validationReport.nulledPopulations`):

| seat (county) | OCR value | reason |
|---|---|---|
| Cartersville (Bartow) | 8141 | text layer 6,141 |
| Pembroke (Bryan) | 1039 | text layer 2,579 |
| Dahlonega (Lumpkin) | 1204 | text layer 1,294 |
| Watkinsville (Oconee) | 568 | text layer 558 |
| Dallas (Paulding) | 1022 | text layer 1,922 |
| Jasper (Pickens) | 676 | text layer 576 |
| Lyons (Toombs) | 1800 | text layer 1,900 |
| Hartwell (Hart) | 2372 | duplicate 1940 value |
| Forsyth (Monroe) | 2372 | duplicate 1940 value |

OCR could not settle the value:

| seat (county) | reason |
|---|---|
| Quitman (Brooks) | failed 1940/1930 sanity (4450 vs 120) |
| Thomson (McDuffie) | failed sanity (3088 vs 1014) |
| Lexington (Oglethorpe) | failed sanity (617 vs 45) |
| Zebulon (Pike) | failed sanity (543 vs 87) |
| Hawkinsville (Pulaski) | failed sanity (3000 vs 12484) |
| Butler (Taylor) | failed sanity (1003 vs 87) |
| Fort Gaines (Clay) | no 2-of-3 majority (1,357 / 1,367 / 1,347) |
| Swainsboro (Emanuel) | no majority (3,575 / 3,675 / 3,875) |
| Blue Ridge (Fannin) | no majority (one read) |
| Cairo (Grady) | no majority |
| Clarkesville (Habersham) | no majority (850 / 860 / 8560) |
| Lincolnton (Lincoln) | no majority |
| Valdosta (Lowndes) | no majority (15,595 / 15,695 / 15,690) |
| Eatonton (Putnam) | no majority (2,360 / 2,399 / 2,809) |
| Ellaville (Schley) | no majority |
| LaFayette (Walker) | no majority (one read) |
| Irwinton (Wilkinson) | no majority (689 / 589 / 539) |
| Hamilton (Harris) | two population rows aligned to the place line |

## Unmatched seats (do not guess)

Clayton: Jonesboro · Columbia: Appling · Crawford: Knoxville · Echols: Statenville · Forsyth: Cumming · Gilmer: Ellijay · Glascock: Gibson · Irwin: Ocilla · Jackson: Jefferson · Jones: Gray · Lee: Leesburg · Telfair: McRae · Tift: Tifton · Troup: LaGrange · Twiggs: Jeffersonville

Most come from county-field OCR that did not name the seat's county on the place row (Tifton's county read as `1)`, La Grange's as `Walker`, Cumming's as `Chattahoochee`). A few place names were not recovered at all. Unmatched records keep the `unverified` basis and null populations.

## Known limits

- **Uncorroborated values can still be wrong.** 47 non-null 1940 values have `population1940Corroborated: false`, mostly because the layer line has no number or splits the row. Two reads can agree on the same wrong digit: 6/8, 0/9 and 5/6 swaps survive in the 1-bit scans. Examples: Cartersville read `8,141` under six preprocessing variants (the veto caught it), and Waynesboro is 3703 against a layer `3, 793` on a line without its county, so the veto did not fire. Treat `false` as "unconfirmed", not "confirmed wrong".
- **`population1930` is not validated.** No spot checks, duplicate check or veto run on it. Known errors: Marietta 1930 parsed 7838 (page 7,638); Thomaston 1930 4022.
- The veto trusts the text layer only on tight place → county → number lines. It skips numbers glued to OCR letters (`l, 746`). It also skips a layer number equal to our 1930 figure, because the layer sometimes drops the 1940 column.
- `matchedPlace` is the OCR spelling (e.g. `GreensborQ`), kept as evidence.
- The crop boxes in `ocr-table5.py` are not guaranteed to reproduce the committed-against crops byte for byte. `ocr-rows.py` finds column rules from the crops themselves, and the place/county TSVs must be regenerated from the same crops (step 2). Earlier TSVs were stale against the crops.
