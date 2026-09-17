# CC-03 unresolved items (three-facet synthesis)

## License caveat {#license-caveat}

> License caveat (applies to every Georgia-archive-derived, Rumsey, and NGE source in this file). Quoted from docs/historical-research/issue-1-newberry-audit.md via issue-3-source-map.md: "The strongest open statement is the Download pages' "reused for any lawful purpose, commercial or non-commercial, without licensing or permission fees to the library" together with the instruction that files containing "the original, out-of-date copyright license … can be ignored". That is a permission statement by the copyright holder, not a CC0 dedication." and "Do not relicense. Do not mark Newberry-derived data as CC0 or public domain." Extension (issue-3-source-map.md): the Rumsey/IA road and rail maps carry an explicit CC BY-NC-SA 3.0 string with a separate "contact … for commercial use" instruction; NGE text is fair-use-only for non-commercial purposes. None of these is CC0; treat all three regimes (Newberry BY-NC-SA 2.5 or "any lawful purpose", Rumsey BY-NC-SA 3.0, NGE non-commercial fair use) as incompatible with commercial distribution until written confirmation is obtained. Modern FIPS codes (US-GA-<fips>) are a crosswalk key only; FIPS codes did not exist in 1942.

The caveat above also governs `issue-3-three-facet-summary.json`. That file has no metadata key because its keys must match the 159-county manifest exactly, so every entry points here with the flag `license-caveat:see issue-3-unresolved.md#license-caveat`.

## U3-1 No 1941-1943 Georgia State Highway Department map online

No official 1941-1943 State Highway Department map was found online (issue-3-source-map.md: GDOT maps page has no historical links, the GeorgiaInfo atlas is retired, the LOC search returned 503 and then only 1964-2014 items, and DLG sits behind Turnstile). As a result, **no road route is verified for 1942-02-01**. Roads are bracketed only by the 1940 Rand McNally sheet and the 1944 State Farm/Rand McNally sheet. Per-county route shields are also still untranscribed in issue-3-roads.json (OCR could not read them).

Citations:

| Key | Source URL | Retrieved | HTTP | Bytes | License quote (verbatim) | HTTP basis |
|---|---|---|---|---|---|---|
| rm1940 | https://archive.org/details/dr_rand-mcnally-road-map-georgia-copyright-by-rand-mcnally--company-chicag-5969027 | 2026-09-16 | 200 | 5430 | "Images may be downloaded and used following Creative Commons CC BY-NC-SA 3.0 license. Image credit should be given to "David Rumsey Map Collection, David Rumsey Map Center, Stanford Libraries."  Please contact the David Rumsey Map Collection for commercial use." | issue-3-source-map.json log |
| rm1944 | https://archive.org/details/dr_state-farm-road-map-georgia-copyright-by-rand-mcnally--company-chicago-4246020 | 2026-09-16 | 200 | 4681 | "Images may be downloaded and used following Creative Commons CC BY-NC-SA 3.0 license. Image credit should be given to "David Rumsey Map Collection, David Rumsey Map Center, Stanford Libraries."  Please contact the David Rumsey Map Collection for commercial use." | issue-3-source-map.json log |

## U3-2 Rail evidence is 1934-only (deferred)

The only period rail map is Leahy's Hotel Guide and Railway Distance Map of Georgia (1934), https://archive.org/details/dr_leahys-hotel-guide-and-railway-distance-map-of-the-state-of-georgia-publi-0425025. The source map logged it at 2026-09-16, HTTP 200, 3,676 bytes, with the license recorded as "Rumsey dr_ series; item string not fetched", so no verbatim license quote is available. The Official Guide of the Railways for 1940-1943 was not found on IA (numFound 0) and HathiTrust returned 403. Deferred to a follow-on issue; rail is not one of the three authorized facets.

## U3-3 Sanborn item-level rights strings unavailable

LOC Sanborn Marietta search (https://www.loc.gov/collections/sanborn-maps/?q=marietta+georgia&fo=json) returned HTTP 200, 91,629 bytes, retrieved 2026-09-16. The item rights JSON returned HTTP 503 twice, and the collection rights page returned 403. The Savannah search returned HTTP 200, 121,178 bytes. The only verbatim rights language available is the generic LOC statement: "You should determine for yourself whether or not an item is protected by copyright or in the public domain, and then satisfy any copyright or use restrictions when publishing or distributing materials from our collections." (cached loc-legal.html, 44273 bytes). The item-level rights for post-1930 sheets remain unverified.

## U3-4 OPERATOR QUESTION: what is the "Savannah PN depot"?

**Decided 2026-09-16:** label dropped; not in the 1942-02-01 roster. See docs/cc-03-crossings-settlements/closeout.md.

The label "Savannah PN depot" does not match anything in the cached sources (issue-3-source-map.json: "'Savannah PN depot' label unmatched"). **This worker does not pick a candidate.** Candidates for operator decision:

| # | Candidate | Cached evidence | Status on 1942-02-01 per cache |
|---|---|---|---|
| A | Southeastern Shipbuilding Corporation WWII shipyard, Savannah (Chatham, US-GA-13051) | NGE WWII: "In early 1942 the Southeastern Shipbuilding Corporation secured a contract to construct 36 Liberty ships at a site on the Savannah River , just east of Savannah." (HTTP 200, 321,743 bytes; nge-shipbuilding.html is a 404 body) | Contract "early 1942"; the exact date relative to 02-01 is unknown; private contractor |
| B | 1940-era Port of Savannah naval fuel depot (Chatham) | No cached document names it. NGE Savannah only says the port "played a prominent role in World War II" (nge-savannah.html, 347661 bytes). | Unevidenced |
| C | Central of Georgia Railway depot / terminal, Savannah (Chatham) | HABS/HAER Savannah search (haer-savannah-v2.json, 38877 bytes, 2,011 hits) includes "Central of Georgia Railway, Savannah Repair Shops & Terminal Facilities" (item ga0356) | Railway-owned (private); not a federal facility |
| D (context only) | Hunter Field, Savannah | Already listed in issue-3-federal-facilities.json | Army-operated from 1941 |

Licenses: NGE rows carry "Fair use of copyrighted material includes the use of protected materials for noncommercial educational purposes. The use of text and images from the NGE website for such purposes does not require express permission from the NGE." LOC rows carry "You should determine for yourself whether or not an item is protected by copyright or in the public domain, and then satisfy any copyright or use restrictions when publishing or distributing materials from our collections."

## U3-5 OPERATOR QUESTION: Marietta airfield 1942 designation contradicts brief

**Decided 2026-09-16:** follow the NGE chronology; no Marietta airfield on 1942-02-01. See docs/cc-03-crossings-settlements/closeout.md.

The brief treats "Marietta Army Air Field" as the 1942 designation and "Rickenbacker" as a post-war rename. The cached NGE Dobbins article says the reverse order ("Cobb County Army Air Field, then as Rickenbacker Field, and finally as Marietta Army Air Field, was established in June 1943"). The NGE Bell Bomber article says Rickenbacker Field was a CAA-program airstrip accepted by the Army Air Corps in May 1943. The facilities file leaves name1942 UNRESOLVED.

| Key | Source URL | Retrieved | HTTP | Bytes | License quote (verbatim) | HTTP basis |
|---|---|---|---|---|---|---|
| nge-dobbins | https://www.georgiaencyclopedia.org/articles/government-politics/dobbins-air-reserve-base/ | 2026-09-16 | 200 | 238001 | "Fair use of copyrighted material includes the use of protected materials for noncommercial educational purposes. The use of text and images from the NGE website for such purposes does not require express permission from the NGE." | issue-3-source-map.json log |
| nge-bell | https://www.georgiaencyclopedia.org/articles/government-politics/bell-bomber/ | 2026-09-16 | 200 | 245289 | "Fair use of copyrighted material includes the use of protected materials for noncommercial educational purposes. The use of text and images from the NGE website for such purposes does not require express permission from the NGE." | issue-3-source-map.json log |

## U3-6 Bell plant selection post-dates the reference date

NGE Bell Bomber: "on February 19, 1942, the War Department announced that Marietta had been selected." Including the plant as a 1942-02-01 facility is a scenario decision, not a historical fact.

## U3-7 HAER corroboration gaps

HAER/HABS searches for Camp Gordon, Fort Stewart, Hunter Field, and Robins Field returned 0 hits. Four first-pass HAER files and loc-search-benning.json are Cloudflare challenge pages. Only Fort Benning has HAER corroboration (458 hits).

## U3-8 Wetland classification relies on modern signals

The `wetland` class rests on current GNIS and NWI counts, not on 1942 observations. Four counties outside the existing roster.ts `WETLAND` set qualify under the proposed rule (see issue-3-terrain-classes.md).

## U3-9 HTTP codes not logged for some cache files

For nge-terms.html, nge-robins.html, usgs-copyrights-v3.html, and the four HAER *-v2 zero-hit files, the prior worker did not log an HTTP status. The recorded 200 is inferred from a valid response body and is labelled `httpCodeBasis` in each JSON citation.

### U3-1 Cobb airfield timeline

The worker considered Marietta Army Air Field as a 1942 federal facility. The cached NGE evidence (Dobbins article, Bell Bomber article, and the HAER Marietta record) dates its establishment to June 1943; the earlier names (Cobb County Army Air Field, Rickenbacker Field) belong to 1943 as well. Required resolution: locate a primary source — NARA Atlanta Record Group 18 or 38 (Records of the Army Air Forces), or the Air Force Historical Research Agency — that confirms or contradicts the NGE chronology. Until then, Marietta AAF is treated as post-1942-02-01 and is not in the federal-facilities roster.

### U3-2 Bell Aircraft plant timeline

GDD §3.1 and §7.2 reference the Bell Aircraft plant at Marietta. The cached NGE evidence dates the selection announcement to 19 February 1942 (after the reference date) and the groundbreaking to 2 April 1942. Required resolution: locate the Bell Aircraft primary records (NARA Atlanta Record Group 38; the original February 1942 Bell press release via the University of West Georgia / Georgia Tech archives) that pin the construction-start date. Until then, treat the Bell plant as planned-but-not-under-construction on 1942-02-01 and not in the federal-facilities roster.
