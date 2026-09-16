# Issue #1 — 1942 Georgia county roster: findings, method, and sources

Research date: 14 September 2026. Reference date: **1 February 1942** (`CAMPAIGN_START_DAY` in `src/sim/calendar.ts`; GDD §3.2). Companion files: [issue-1-roster.json](issue-1-roster.json) (structured manifest), [issue-1-newberry-audit.md](issue-1-newberry-audit.md), [issue-1-former-counties.md](issue-1-former-counties.md), [issue-1-unresolved.md](issue-1-unresolved.md).

## 1. Result

**Georgia had exactly 159 counties on 1 February 1942, and every one of them carries the same name today.** The 159 modern Census county records bundled in `src/data/georgia-counties.json` therefore map one-to-one onto the 1942 roster with no renames, no missing counties, and no extra counties. The two 19th-century counties named in the design brief, Campbell and Milton, were both abolished effective 1 January 1932 and absorbed into Fulton, thirteen months before the reference date.

Two things the roster verification does **not** establish, and which are recorded in [issue-1-unresolved.md](issue-1-unresolved.md): that every modern polygon is geometrically identical to its 1942 shape (it is not, for at least 39 counties), and that the modern county seats in `src/data/roster.ts` were the seats in 1942.

## 2. Primary sources consulted

| # | Source | What it established | Access |
|---|--------|---------------------|--------|
| S-A | Newberry Library, *Atlas of Historical County Boundaries*, Georgia dataset (John H. Long, ed.; Georgia compiled by Long, John Ford, Robert Will; digital compiler Emily Kelley; published 30 June 2010). Downloaded `GA_AtlasHCB.zip` (21,271,531 bytes) containing the Comprehensive Database (tab-delimited, 1,784 rows), county index, individual and consolidated chronologies, FGDC metadata, and the bundled license deed. | County set in force on 1942-02-01; creation and elimination dates to the day; legal citations (Georgia session laws) for every change. | https://publications.newberry.org/ahcb/pages/Georgia.html and https://publications.newberry.org/ahcb/downloads/gis/GA_AtlasHCB.zip (HTTP 200, 2026-09-14). The legacy URL `publications.newberry.org/ahcbp/` now redirects to `digital.newberry.org/ahcb`, which itself serves from `publications.newberry.org/ahcb/`. |
| S-B | U.S. Bureau of the Census, *Sixteenth Census of the United States: 1940. Population, Volume I, Number of Inhabitants* (Washington: GPO, 1942), Georgia chapter, "Counties" text and Table 3 "Area and population of counties, urban and rural: 1920 to 1940" (pp. 241–243) and Table 4 footnotes (p. 244). | Independent statement that Georgia had 159 counties at the 1940 census; footnotes recording every county boundary change 1930–1940, including the 1932 Campbell/Milton/Cobb annexations to Fulton. | https://www2.census.gov/library/publications/decennial/1940/population-volume-1/33973538v1ch04.pdf (23,390,865 bytes; chapter covering Georgia, Idaho, Illinois, Indiana, Iowa). Index page: https://www.census.gov/library/publications/1942/dec/population-vol-1.html |
| S-C | U.S. Census Bureau, 2020 Census county code list for Georgia, `st13_ga_cou2020.txt` (159 data rows; columns STATE, STATEFP, COUNTYFP, COUNTYNS, COUNTYNAME, CLASSFP, FUNCSTAT). | Modern crosswalk target: official current spelling, FIPS county code, and ANSI (GNIS) code for each county. | https://www2.census.gov/geo/docs/reference/codes2020/cou/st13_ga_cou2020.txt via https://www.census.gov/library/reference/code-lists/ansi.html |
| S-D | Georgia Archives, Virtual Vault, collection "Index to County Records on Microfilm (No Images)" (`countycards`): items "Campbell (Fulton)" (identifier CC021, source "County Records Microfilm Index, Georgia Archives") and "Milton (Fulton)" / "Milton (Fulton) County" (records 631–632). | The state archives files the records of both former counties under Fulton, corroborating the absorption (not the date). | https://vault.georgiaarchives.org/digital/collection/countycards (queried through the CONTENTdm web-service API, 2026-09-14) |
| X-1 | Wikipedia: *List of counties in Georgia*, *Campbell County, Georgia*, *Milton County, Georgia*; New Georgia Encyclopedia: *Milton County*, *Fulton County*. | Cross-reference only. All agree with S-A/S-B (159 counties; 161 counties 1924–1931; Campbell and Milton merged into Fulton effective 1 January 1932; seats Fairburn and Alpharetta). Not used as the basis for any manifest field. | https://en.wikipedia.org/wiki/List_of_counties_in_Georgia ; https://www.georgiaencyclopedia.org/articles/counties-cities-neighborhoods/milton-county/ |

Not reachable in this pass: the Georgia Legislative Documents collection at the Digital Library of Georgia (`https://dlg.usg.edu/collection/dlg_zlgl`) sits behind an interactive access check (`/turnstile/access`), so the texts of *Ga. Laws 1929, p. 551* and *Ga. Laws 1931, p. 527* were not read directly; they are cited here exactly as Newberry cites them. The Georgia Archives main site returns 404 for its former county-records guide URLs; only the Vault (S-D) was usable.

## 3. Method

1. **Derive the 1942 set from Newberry (S-A).** Loaded `GA_Comprehensive_Database.txt` and selected every county version whose `START_N ≤ 19420201` and `END_N ≥ 19420201` (`VERSION` non-empty, so text-only events are excluded). Result: 159 polygon versions, 159 distinct county IDs, 159 distinct FIPS crosswalk codes, no extinct or proposal entries in the set.
2. **Corroborate the count from the Census (S-B).** The Georgia chapter states verbatim: "Table 3 shows the population of the 159 counties of Georgia from 1920 to 1940 … Of the 153 counties whose boundaries remained unchanged since 1930, 95 increased in population between 1930 and 1940, and 58 decreased. Information concerning boundary changes is given in the footnotes on table 3." The Georgia chapter's OCR text layer was searched for each of the 159 names; 157 were matched mechanically and the remaining two (DeKalb, McIntosh) fail only because the OCR splits or mangles them. No county name outside the 159 appears in the Georgia tables except in the footnotes describing Campbell and Milton as annexed.
3. **Crosswalk to modern codes (S-C) and to the repository.** The FIPS set from S-A equals the FIPS set from S-C equals the FIPS set in `src/data/georgia-counties.json` (159 = 159 = 159). Names were compared case-insensitively (Newberry stores names in upper case, e.g. `DEKALB`, `MCDUFFIE`, `BEN HILL`); **zero discrepancies**.
4. **Check for renames.** Every Newberry record whose change text contains "renamed" was listed. All eight Georgia renames predate 1862 (Cass→Bartow 1861-12-06; Kinchafoonee→Webster 1856-02-21; Randolph (original)→Jasper 1812-12-10; "Section the First … Fifth" → Lee, Muscogee, Troup, Coweta, Carroll 1826-12-11). None affects the 1942-to-modern crosswalk.
5. **Check for changes between 1932 and 1942.** Newberry records exactly four events dated in that window, all on 1 January 1932: Campbell eliminated, Milton eliminated, Fulton gained both plus part of Cobb, Cobb lost to Fulton. Newberry records **no** county creation or elimination after 4 November 1924 (Peach) other than the 1932 eliminations, and none after 1932 through 2000.
6. **Verify Campbell and Milton from primary sources** (S-A chronologies, S-B footnotes, S-D archive index). Details in [issue-1-former-counties.md](issue-1-former-counties.md).
7. **Audit Newberry metadata and license** (see [issue-1-newberry-audit.md](issue-1-newberry-audit.md)).

## 4. Findings in detail

### 4.1 Roster

- 159 counties in force on 1942-02-01; the youngest is Peach (created 4 November 1924 from Houston and Macon; Ga. Laws 1924, no. 274/pp. 39–46). The 1940 Census footnotes give "organized" years one year later than Newberry's "took effect" dates for the 1920–21 creations (Lanier, Brantley, Seminole, Lamar, Long "1921"; Peach "1925"); Newberry's dates come from the effective dates in the acts, the Census's from organization. Both agree these counties existed well before 1942.
- Every county's `modernFips` in the manifest is the current 2020 Census code and is labelled as a crosswalk target only. FIPS codes did not exist in 1942 and no deliverable claims otherwise.
- Identifier policy in the manifest: `id` = `GA-<ModernNameWithoutSpaces>` (e.g. `GA-Cobb`, `GA-BenHill`, `GA-DeKalb`); `repoId` = the existing `US-GA-<fips>` key so the Implement phase can join on either.

### 4.2 Name discrepancies between modern and 1942 names

None. All 159 names match. Casing conventions differ by source only: Newberry `DEKALB`/`MCDUFFIE`/`MCINTOSH`, Census `DeKalb County`/`McDuffie County`/`McIntosh County`, repository `DeKalb`/`McDuffie`/`McIntosh`. The manifest keeps the Census mixed-case spelling as `historicalName` and `modernName` and records the raw Newberry string in `historicalNameSource`.

### 4.3 Boundary changes that touch 1942 (for Issue #2, recorded here because they surfaced during the roster audit)

- **1 January 1932** (dated to the day): Fulton absorbed all of Campbell and Milton and the Roswell militia district (Census district 845, "including Roswell town") of Cobb. Newberry: "By 1 Jan 1932, COBB lost to FULTON." Census footnote 25 (Table 4): population of district 845, Cobb County, "including Roswell town, annexed to Fulton County, in 1932".
- **Census-only changes 1933–1934**: "Part of Gordon annexed to Floyd in 1933." and "Part of Marion annexed to Talbot, and part of Talbot annexed to Marion, in 1934." (Table 3 footnotes). Newberry does not record either at those dates: it dates a Floyd–Gordon change "by 31 December 1999" and a Marion–Talbot change "by 31 December 1915". These four counties are flagged `census-1940-footnote-change-not-in-newberry`.
- **Undated 1915–1952 changes**: Newberry's Georgia commentary states that after the 1881 general boundary law "there was no systematic, centralized, authoritative record of changes in Georgia's county network" and that "nearly forty counties experienced mappable boundary changes between 1915 and 1952; all those changes had to be dated 'by 31 December 1952'". The Comprehensive Database contains 39 such records. Those 39 counties are flagged `boundary-change-undated-1915-1952` in the manifest; whether each change was before or after 1 February 1942 cannot be determined from Newberry.
- A Census footnote also reads (OCR-degraded) "Parts of Campbell and Cobb annexed to Fulton in 1926 and 1932, respectively; Milton and remainder of Campbell annexed to Fulton in 1932." Newberry's only Campbell→Fulton transfer before 1932 is dated 24 August 1872. The "1926" partial annexation is recorded as an open item.

### 4.4 Verification runs (observed output)

```
$ node -e "const d=require('./docs/historical-research/issue-1-roster.json'); console.assert(d.counties.length===159,'expected 159 got '+d.counties.length); console.log('OK',d.counties.length)"
OK 159
$ node -e "const d=require('./docs/historical-research/issue-1-roster.json'); const missing=d.counties.filter(c=>!c.id||!c.historicalName||!c.modernName||!c.modernFips||!c.sourceCitation||!c.sourceUrl); console.assert(missing.length===0,'missing fields in '+missing.length+' entries'); console.log('OK')"
OK
```

Comparison of the manifest against `src/data/georgia-counties.json` (159 names, 159 FIPS): 159 matched, 0 unmatched, 0 renames, 0 mergers among the modern set (the only mergers, Campbell and Milton, predate the reference date and are listed under `formerCounties`).

## 5. What the Implement phase can now do

- Replace the `historicalVerification: "PENDING …"` string in the provenance block of `src/data/georgia-counties.json` with a statement that the **roster** (159 identities and names) is verified for 1942-02-01 against Newberry (S-A) and the 1940 Census (S-B), while **geometry** remains modern Census polygons pending Issue #2, and cite this package.
- Keep `MODERN FIPS = crosswalk only` wording. Do not add Campbell or Milton as county records.
- Leave the seats in `src/data/roster.ts` marked as placeholders; seat verification is not covered by this package (see unresolved items).
