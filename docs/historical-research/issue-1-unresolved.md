# Issue #1 — Unresolved items after the roster audit

These are material gaps that remain after verifying the 159-county roster. None of them affects the count or the names of the 1942 counties; they affect geometry, seats, and licensing, and must be kept out of release-ready status until resolved.

## U-1. Thirty-nine boundary changes that Newberry can date only "by 31 December 1952"

Newberry's Georgia commentary explains that after Georgia's 1881 general boundary law "there was no systematic, centralized, authoritative record of changes in Georgia's county network," and that "nearly forty counties experienced mappable boundary changes between 1915 and 1952; all those changes had to be dated 'by 31 December 1952'." The Comprehensive Database contains 39 such records, each citing the Georgia State Highway Department "Official 1952 Georgia Highway Map" (one citing the 1952 Census minor-civil-division map). Counties affected (flag `boundary-change-undated-1915-1952` in the manifest):

Baker, Bartow, Berrien, Butts, Calhoun, Catoosa, Clinch, Colquitt, Crawford, Echols, Gilmer, Gordon, Greene, Haralson, Henry, Houston, Irwin, Jasper, Long, Lowndes, Macon, Monroe, Newton, Pickens, Pike, Polk, Pulaski, Randolph, Spalding, Stewart, Taliaferro, Tattnall, Thomas, Upson, Walton, Ware, Webster, Whitfield, Wilcox.

For each, Newberry's polygon "in force on 1942-02-01" is the pre-change version, but the change may in fact have happened before 1942. Resolution path (Issue #2): compare the 1940 Census Georgia maps by minor civil divisions (Vol. I, pp. 235–238, "Georgia — Northwestern / Northeastern / Southwestern / Southeastern Part") and the Hudgins 1915 and Official 1952 highway maps in the GeorgiaInfo *Historical Atlas of Georgia Counties*, and document each of the 39 as before/after 1942 or "undetermined, modern polygon used".

## U-2. Census-recorded changes of 1933 and 1934 that Newberry does not date

1940 Census Table 3 footnotes: "Part of Gordon annexed to Floyd in 1933." and "Part of Marion annexed to Talbot, and part of Talbot annexed to Marion, in 1934." Newberry dates the Floyd–Gordon change "by 31 December 1999" and the only Marion–Talbot change "by 31 December 1915". The Census is the earlier and more specific witness for these two pairs; the 1942 shapes of Floyd, Gordon, Marion, and Talbot must be taken from a post-1934 source, not from Newberry's version in force. Flag `census-1940-footnote-change-not-in-newberry`.

## U-3. A possible 1926 partial annexation of Campbell to Fulton

The OCR text of the 1940 Census Table 3 footnote reads "Parts of Campbell and Cobb annexed to Fulton in 1926 and 1932, respectively; Milton and remainder of Campbell annexed to Fulton in 1932." Newberry records no Campbell→Fulton transfer between 24 August 1872 and 1 January 1932. Because Campbell was wholly absorbed by 1932 the item does not affect the 1942 roster or Fulton's 1942 outline, but it should be checked against the printed page before the note is repeated anywhere, since the "1926" may be an OCR artefact of "1872" and Newberry's chronology may be incomplete.

## U-4. County seats are not verified

`src/data/roster.ts` uses modern seats as placeholders. This package verified county identities, not seats. Newberry does not record seats. Sources to use (Issue #3/#4): the 1940 Census Table 4 militia-district listings (which name the seat's district, e.g. "Dist. 733, Campbellton"), period Georgia highway maps, and Georgia Archives county histories. Known cases needing attention: none of the 159 seats is known to have moved between 1942 and today from the sources read here, but that absence of evidence is not verification.

## U-5. Session-law texts not read directly

The acts Newberry cites for the 1932 eliminations (Ga. Laws 1929, p. 551; Ga. Laws 1931, p. 527) were not read in the original because the Digital Library of Georgia's Georgia Legislative Documents collection (`https://dlg.usg.edu/collection/dlg_zlgl`) is behind an interactive access check. The dissolution dates rest on Newberry's day-precise chronology plus the independent 1940 Census footnotes and the Georgia Archives index, which is sufficient for the roster. Reading the acts would additionally settle whether any land-lot exceptions were made at the Cobb boundary.

## U-6. Newberry licence terms are inconsistent and the design document's CC0 claim is unsupported

Detailed in [issue-1-newberry-audit.md](issue-1-newberry-audit.md) §3.5. The bundled deed and metadata say CC BY-NC-SA 2.5; the current Download pages say "any lawful purpose, commercial or non-commercial, without licensing or permission fees" and that the bundled licence "can be ignored"; nothing says CC0. Before any Newberry polygon geometry is bundled (Issue #2), the project should (a) correct the [S6] statement in `docs/game-design.md`, and (b) if commercial distribution is contemplated, obtain written confirmation from the Newberry that the "any lawful purpose" statement governs. This package copies no Newberry geometry.
