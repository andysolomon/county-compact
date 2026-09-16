# CC-03 federal facilities (non-targetable)

On 1942-02-01 the federal-facility roster covers five facilities: Fort Benning, Camp Stewart (Fort Stewart), Camp Gordon (Fort Gordon), Hunter Field, Georgia Air Depot (later renamed Robins Field). Marietta Army Air Field and the Bell Aircraft plant at Marietta are NOT included because the cached NGE evidence dates them post-1942-02-01; see issue-3-unresolved.md U3-1 and U3-2.

## License caveat

> License caveat (applies to every Georgia-archive-derived, Rumsey, and NGE source in this file). Quoted from docs/historical-research/issue-1-newberry-audit.md via issue-3-source-map.md: "The strongest open statement is the Download pages' "reused for any lawful purpose, commercial or non-commercial, without licensing or permission fees to the library" together with the instruction that files containing "the original, out-of-date copyright license … can be ignored". That is a permission statement by the copyright holder, not a CC0 dedication." and "Do not relicense. Do not mark Newberry-derived data as CC0 or public domain." Extension (issue-3-source-map.md): the Rumsey/IA road and rail maps carry an explicit CC BY-NC-SA 3.0 string with a separate "contact … for commercial use" instruction; NGE text is fair-use-only for non-commercial purposes. None of these is CC0; treat all three regimes (Newberry BY-NC-SA 2.5 or "any lawful purpose", Rumsey BY-NC-SA 3.0, NGE non-commercial fair use) as incompatible with commercial distribution until written confirmation is obtained. Modern FIPS codes (US-GA-<fips>) are a crosswalk key only; FIPS codes did not exist in 1942.

## Status

NGE is a secondary source. No facility status is verified for 1942-02-01 from open primaries; names reflect cached NGE chronology only.

Every facility below is `nonTargetable: true`.

| id | name1942 | modern equivalent | counties | ownership | primary citation | HTTP | bytes |
|---|---|---|---|---|---|---|---|
| fort-benning | Fort Benning | Fort Benning | US-GA-13215, US-GA-13053 | federal | https://www.georgiaencyclopedia.org/articles/government-politics/fort-benning/ | 200 | 227605 |
| fort-stewart | Camp Stewart | Fort Stewart | US-GA-13179, US-GA-13029, US-GA-13109, US-GA-13183, US-GA-13267 | federal | https://www.georgiaencyclopedia.org/articles/government-politics/fort-stewart/ | 200 | 217669 |
| fort-gordon | Camp Gordon | Fort Gordon | US-GA-13245 | federal | https://www.georgiaencyclopedia.org/articles/government-politics/fort-gordon/ | 200 | 203504 |
| hunter-field-savannah | Hunter Field | Hunter Army Airfield | US-GA-13051 | federal | https://www.georgiaencyclopedia.org/articles/government-politics/fort-stewart/ | 200 | 217669 |
| robins-field-warner-robins | Georgia Air Depot (initial name; exact designation on 1942-02-01 not stated) | Robins Air Force Base | US-GA-13153 | federal | https://www.georgiaencyclopedia.org/articles/government-politics/robins-air-force-base/ | 200 | 233696 |

## Notes per facility

### fort-benning

NGE: post "encompasses 287 square miles of Chattahoochee and Muscogee counties" (modern extent); "The post was made permanent in February 1922, earning its designation as a fort." HAER/HABS: 458 hits for "fort benning".

License quote: "Fair use of copyrighted material includes the use of protected materials for noncommercial educational purposes. The use of text and images from the NGE website for such purposes does not require express permission from the NGE."

### fort-stewart

NGE: "created in 1940 as an antiaircraft training facility"; "named Camp Stewart"; "received the permanent status of fort in 1956"; land "encompassed almost half of Liberty County and parts of four other counties: Bryan , Evans , Long , and Tattnall". HAER search "fort stewart georgia": 0 hits (no HAER corroboration in cache).

License quote: "Fair use of copyrighted material includes the use of protected materials for noncommercial educational purposes. The use of text and images from the NGE website for such purposes does not require express permission from the NGE."

### fort-gordon

NGE: "By May 1941 an area in Richmond County had been selected"; "On December 9 [1941] Colonel Herbert W. Schmid, camp commander, moved his small staff ... to the incomplete headquarters building at Camp Gordon"; redesignated Fort Gordon 1956-03-21; Fort Eisenhower 2023-2025; renamed Fort Gordon 2025-09-26. Only Richmond County is named in the text. HAER search "camp gordon georgia": 0 hits.

License quote: "Fair use of copyrighted material includes the use of protected materials for noncommercial educational purposes. The use of text and images from the NGE website for such purposes does not require express permission from the NGE."

### hunter-field-savannah

The cached nge-hunter.html (136,000 bytes) is an NGE "Page not found" body, so the Hunter evidence comes from the Hunter Army Airfield section of the Fort Stewart article: "The city of Savannah built the facility as a municipal airport in 1940 and turned it over to the army in 1941"; NGE WWII article uses "Hunter Field". Ownership nuance: city-built, army-operated from 1941; returned to city 1946. HAER "hunter field savannah": 0 hits.

License quote: "Fair use of copyrighted material includes the use of protected materials for noncommercial educational purposes. The use of text and images from the NGE website for such purposes does not require express permission from the NGE."

### robins-field-warner-robins

NGE: War Department approved the depot "In June 1941"; groundbreaking "September 1" [1941]; "construction on the industrial and cantonment areas was completed by August 31, 1942" (i.e. under construction on 1942-02-01); "Known as the Georgia Air Depot in the beginning ... redesignated seven times"; located in Houston County at Wellston. NGE WWII article calls it "Robins Field" (wartime usage, date unspecified). httpCode 200 inferred from real article body; not in source-map log. HAER "robins field georgia": 0 hits.

License quote: "Fair use of copyrighted material includes the use of protected materials for noncommercial educational purposes. The use of text and images from the NGE website for such purposes does not require express permission from the NGE."

## Reference-date conflicts to resolve

1. **Robins (Georgia Air Depot):** under construction on the reference date. It began as the Georgia Air Depot and was renamed seven times.

## Cache integrity

- nge-hunter.html and nge-shipbuilding.html bodies are NGE "Page not found" pages (not usable).
- haer-fort-benning.json, haer-fort-gordon.json, haer-fort-stewart.json, haer-marietta.json, loc-search-benning.json are Cloudflare "Just a moment..." challenge pages (not data); the *-v2.json files are the usable LOC responses.
- Uncategorized NGE pages of ~136 KB (camp-toccoa, camp-wheeler, fort-oglethorpe, fort-screven, naval-air-station-glynco, hunter-army-airfield-and-fort-stewart) match the 404 page size and were not used.

## Citations

| Key | Source URL | Retrieved | HTTP | Bytes | License quote (verbatim) | HTTP basis |
|---|---|---|---|---|---|---|
| nge-bell | https://www.georgiaencyclopedia.org/articles/government-politics/bell-bomber/ | 2026-09-16 | 200 | 245289 | "Fair use of copyrighted material includes the use of protected materials for noncommercial educational purposes. The use of text and images from the NGE website for such purposes does not require express permission from the NGE." | issue-3-source-map.json log |
| nge-dobbins | https://www.georgiaencyclopedia.org/articles/government-politics/dobbins-air-reserve-base/ | 2026-09-16 | 200 | 238001 | "Fair use of copyrighted material includes the use of protected materials for noncommercial educational purposes. The use of text and images from the NGE website for such purposes does not require express permission from the NGE." | issue-3-source-map.json log |
| nge-benning | https://www.georgiaencyclopedia.org/articles/government-politics/fort-benning/ | 2026-09-16 | 200 | 227605 | "Fair use of copyrighted material includes the use of protected materials for noncommercial educational purposes. The use of text and images from the NGE website for such purposes does not require express permission from the NGE." | issue-3-source-map.json log |
| nge-stewart | https://www.georgiaencyclopedia.org/articles/government-politics/fort-stewart/ | 2026-09-16 | 200 | 217669 | "Fair use of copyrighted material includes the use of protected materials for noncommercial educational purposes. The use of text and images from the NGE website for such purposes does not require express permission from the NGE." | issue-3-source-map.json log |
| nge-gordon | https://www.georgiaencyclopedia.org/articles/government-politics/fort-gordon/ | 2026-09-16 | 200 | 203504 | "Fair use of copyrighted material includes the use of protected materials for noncommercial educational purposes. The use of text and images from the NGE website for such purposes does not require express permission from the NGE." | issue-3-source-map.json log |
| nge-wwii | https://www.georgiaencyclopedia.org/articles/history-archaeology/world-war-ii-in-georgia/ | 2026-09-16 | 200 | 321743 | "Fair use of copyrighted material includes the use of protected materials for noncommercial educational purposes. The use of text and images from the NGE website for such purposes does not require express permission from the NGE." | issue-3-source-map.json log |
| nge-robins | https://www.georgiaencyclopedia.org/articles/government-politics/robins-air-force-base/ | 2026-09-16 | 200 | 233696 | "Fair use of copyrighted material includes the use of protected materials for noncommercial educational purposes. The use of text and images from the NGE website for such purposes does not require express permission from the NGE." | cache body is a real article (last edited 2019-12-10); status not separately logged |
| nge-terms | https://www.georgiaencyclopedia.org/terms-of-use/ | 2026-09-16 | 200 | 123815 | "Fair use of copyrighted material includes the use of protected materials for noncommercial educational purposes. The use of text and images from the NGE website for such purposes does not require express permission from the NGE." | cache body is the live Terms of Use page (status not separately logged) |
| haer-benning | https://www.loc.gov/pictures/search/?q=fort%20benning&co=hh&fo=json | 2026-09-16 | 200 | 35141 | "You should determine for yourself whether or not an item is protected by copyright or in the public domain, and then satisfy any copyright or use restrictions when publishing or distributing materials from our collections." | issue-3-source-map.json log; cached size 35135 |
| haer-gordon | https://www.loc.gov/pictures/search/?q=camp+gordon+georgia&co=hh&fo=json | 2026-09-16 | 200 | 4212 | "You should determine for yourself whether or not an item is protected by copyright or in the public domain, and then satisfy any copyright or use restrictions when publishing or distributing materials from our collections." | cache body is a valid JSON search response |
| haer-stewart | https://www.loc.gov/pictures/search/?q=fort+stewart+georgia&co=hh&fo=json | 2026-09-16 | 200 | 4228 | "You should determine for yourself whether or not an item is protected by copyright or in the public domain, and then satisfy any copyright or use restrictions when publishing or distributing materials from our collections." | cache body is a valid JSON search response |
| haer-hunter | https://www.loc.gov/pictures/search/?q=hunter+field+savannah&co=hh&fo=json | 2026-09-16 | 200 | 4244 | "You should determine for yourself whether or not an item is protected by copyright or in the public domain, and then satisfy any copyright or use restrictions when publishing or distributing materials from our collections." | cache body is a valid JSON search response |
| haer-robins | https://www.loc.gov/pictures/search/?q=robins+field+georgia&co=hh&fo=json | 2026-09-16 | 200 | 4228 | "You should determine for yourself whether or not an item is protected by copyright or in the public domain, and then satisfy any copyright or use restrictions when publishing or distributing materials from our collections." | cache body is a valid JSON search response |
| haer-marietta | https://www.loc.gov/pictures/search/?q=marietta+georgia&co=hh&fo=json | 2026-09-16 | 200 | 32007 | "You should determine for yourself whether or not an item is protected by copyright or in the public domain, and then satisfy any copyright or use restrictions when publishing or distributing materials from our collections." | cache body is a valid JSON search response |
