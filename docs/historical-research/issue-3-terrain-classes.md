# CC-03 terrain classes (Fenneman 1946 primary; NWI/GNIS modern confirmation)

## License caveat

> License caveat (applies to every Georgia-archive-derived, Rumsey, and NGE source in this file). Quoted from docs/historical-research/issue-1-newberry-audit.md via issue-3-source-map.md: "The strongest open statement is the Download pages' "reused for any lawful purpose, commercial or non-commercial, without licensing or permission fees to the library" together with the instruction that files containing "the original, out-of-date copyright license … can be ignored". That is a permission statement by the copyright holder, not a CC0 dedication." and "Do not relicense. Do not mark Newberry-derived data as CC0 or public domain." Extension (issue-3-source-map.md): the Rumsey/IA road and rail maps carry an explicit CC BY-NC-SA 3.0 string with a separate "contact … for commercial use" instruction; NGE text is fair-use-only for non-commercial purposes. None of these is CC0; treat all three regimes (Newberry BY-NC-SA 2.5 or "any lawful purpose", Rumsey BY-NC-SA 3.0, NGE non-commercial fair use) as incompatible with commercial distribution until written confirmation is obtained. Modern FIPS codes (US-GA-<fips>) are a crosswalk key only; FIPS codes did not exist in 1942.

## Method

- fall-line: Fenneman Piedmont fraction >= 0.20 AND Coastal Plain fraction >= 0.20 (county straddles the Fall Line boundary)
- mountain: Blue Ridge + Valley and Ridge + Appalachian Plateaus fraction >= 0.50
- piedmont: Piedmont fraction >= 0.50, or Piedmont+mountain-province >= 0.50 with Coastal Plain < 0.20
- wetland: otherwise Coastal Plain AND modern GNIS swamp features >= 10 AND modern NWI polygon density >= 5.5 per km2 (modern signal only; not a 1942 observation)
- coastal: all remaining Coastal Plain counties
- UNCLASSIFIED Fenneman fraction (open water/coast) is excluded from province sums but reported as a flag

Class counts: coastal 67, fall-line 8, mountain 15, piedmont 53, wetland 16

## Comparison with src/data/roster.ts

- Existing `MOUNTAIN` (18): Catoosa, Chattooga, Dade, Dawson, Fannin, Gilmer, Gordon, Habersham, Lumpkin, Murray, Pickens, Rabun, Stephens, Towns, Union, Walker, White, Whitfield
- Existing `WETLAND` (12): Brantley, Bryan, Camden, Charlton, Chatham, Clinch, Echols, Glynn, Liberty, Long, McIntosh, Ware
- Existing `PIEDMONT_MIN_LAT` = 32.95; `terrainFor()` in src/sim/scenario.ts has no fall-line class, so every proposed `fall-line` county is a disagreement by construction.
- Centroid latitude basis: centroidLat taken from /tmp/issue-3-downloads/gnis-signals.json (prior-worker county centroid); may differ slightly from src/data/geometry.ts runtime centroid.

Proposed mountain set: Bartow, Catoosa, Chattooga, Dade, Fannin, Floyd, Gilmer, Gordon, Murray, Polk, Rabun, Towns, Union, Walker, Whitfield

Proposed wetland set: Atkinson, Brantley, Bryan, Camden, Charlton, Chatham, Clinch, Echols, Effingham, Glynn, Lanier, Liberty, Long, McIntosh, Ware, Wayne

### Every disagreement (29)

| County | repoId | roster.ts | proposed | lat | mtn | pied | CP | GNIS swamp | NWI/km² |
|---|---|---|---|---|---|---|---|---|---|
| Atkinson | US-GA-13003 | coastal | wetland | 31.2963 | 0.000 | 0.000 | 1.000 | 11 | 7.53 |
| Baldwin | US-GA-13009 | piedmont | fall-line | 33.0717 | 0.000 | 0.536 | 0.464 | 0 | 3.86 |
| Bartow | US-GA-13015 | piedmont | mountain | 34.2392 | 0.756 | 0.244 | 0.000 | 2 | 2.60 |
| Bibb | US-GA-13021 | coastal | fall-line | 32.8030 | 0.000 | 0.231 | 0.769 | 1 | 4.21 |
| Burke | US-GA-13033 | piedmont | coastal | 33.0604 | 0.000 | 0.000 | 1.000 | 3 | 4.97 |
| Columbia | US-GA-13073 | piedmont | fall-line | 33.5438 | 0.000 | 0.604 | 0.396 | 0 | 5.30 |
| Crawford | US-GA-13079 | coastal | fall-line | 32.7175 | 0.000 | 0.371 | 0.629 | 1 | 3.98 |
| Dawson | US-GA-13085 | mountain | piedmont | 34.4397 | 0.220 | 0.780 | 0.000 | 0 | 1.95 |
| Effingham | US-GA-13103 | coastal | wetland | 32.3658 | 0.000 | 0.000 | 1.000 | 14 | 8.73 |
| Floyd | US-GA-13115 | piedmont | mountain | 34.2677 | 1.000 | 0.000 | 0.000 | 0 | 3.19 |
| Glascock | US-GA-13125 | piedmont | coastal | 33.2389 | 0.000 | 0.000 | 1.000 | 0 | 3.80 |
| Habersham | US-GA-13137 | mountain | piedmont | 34.6305 | 0.102 | 0.898 | 0.000 | 0 | 2.32 |
| Hancock | US-GA-13141 | piedmont | fall-line | 33.2744 | 0.000 | 0.786 | 0.214 | 0 | 3.22 |
| Harris | US-GA-13145 | coastal | piedmont | 32.7348 | 0.000 | 1.000 | 0.000 | 0 | 4.14 |
| Jefferson | US-GA-13163 | piedmont | coastal | 33.0565 | 0.000 | 0.000 | 1.000 | 1 | 4.42 |
| Lanier | US-GA-13173 | coastal | wetland | 31.0377 | 0.000 | 0.000 | 1.000 | 12 | 7.40 |
| Lumpkin | US-GA-13187 | mountain | piedmont | 34.5706 | 0.427 | 0.573 | 0.000 | 0 | 1.51 |
| McDuffie | US-GA-13189 | piedmont | fall-line | 33.4743 | 0.000 | 0.562 | 0.438 | 0 | 5.38 |
| Muscogee | US-GA-13215 | coastal | fall-line | 32.5099 | 0.000 | 0.226 | 0.774 | 0 | 4.89 |
| Pickens | US-GA-13227 | mountain | piedmont | 34.4652 | 0.000 | 1.000 | 0.000 | 0 | 1.96 |
| Polk | US-GA-13233 | piedmont | mountain | 34.0040 | 0.680 | 0.320 | 0.000 | 0 | 4.08 |
| Richmond | US-GA-13245 | piedmont | coastal | 33.3590 | 0.000 | 0.002 | 0.998 | 2 | 4.14 |
| Stephens | US-GA-13257 | mountain | piedmont | 34.5498 | 0.000 | 1.000 | 0.000 | 1 | 3.48 |
| Talbot | US-GA-13263 | coastal | piedmont | 32.6988 | 0.000 | 0.833 | 0.167 | 0 | 3.87 |
| Upson | US-GA-13293 | coastal | piedmont | 32.8795 | 0.000 | 1.000 | 0.000 | 0 | 4.30 |
| Warren | US-GA-13301 | piedmont | fall-line | 33.4091 | 0.000 | 0.726 | 0.274 | 0 | 4.52 |
| Washington | US-GA-13303 | piedmont | coastal | 32.9717 | 0.000 | 0.000 | 1.000 | 0 | 4.55 |
| Wayne | US-GA-13305 | coastal | wetland | 31.5510 | 0.000 | 0.000 | 1.000 | 21 | 7.52 |
| White | US-GA-13311 | mountain | piedmont | 34.6429 | 0.332 | 0.668 | 0.000 | 0 | 2.04 |

## Per-county table

| County | repoId | terrain | Fenneman dominant | fraction | GNIS swamp | NWI polygons | flag |
|---|---|---|---|---|---|---|---|
| Appling | US-GA-13001 | coastal | COASTAL PLAIN / SEA ISLAND | 1.000 | 1 | 8384 |  |
| Atkinson | US-GA-13003 | wetland | COASTAL PLAIN / SEA ISLAND | 0.539 | 11 | 6716 | mixed-province;wetland-from-modern-gnis-nwi-signal;disagrees-with-roster.ts(coastal) |
| Bacon | US-GA-13005 | coastal | COASTAL PLAIN / SEA ISLAND | 1.000 | 0 | 5614 |  |
| Baker | US-GA-13007 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 5 | 4362 |  |
| Baldwin | US-GA-13009 | fall-line | PIEDMONT / PIEDMONT UPLAND | 0.536 | 0 | 2686 | mixed-province;disagrees-with-roster.ts(piedmont) |
| Banks | US-GA-13011 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 1716 |  |
| Barrow | US-GA-13013 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 2235 |  |
| Bartow | US-GA-13015 | mountain | VALLEY AND RIDGE / TENNESSEE | 0.756 | 2 | 3115 | disagrees-with-roster.ts(piedmont) |
| Ben Hill | US-GA-13017 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 0.755 | 0 | 5558 |  |
| Berrien | US-GA-13019 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 7 | 10792 |  |
| Bibb | US-GA-13021 | fall-line | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 0.543 | 1 | 2789 | mixed-province;disagrees-with-roster.ts(coastal) |
| Bleckley | US-GA-13023 | coastal | COASTAL PLAIN / SEA ISLAND | 0.887 | 0 | 3806 |  |
| Brantley | US-GA-13025 | wetland | COASTAL PLAIN / SEA ISLAND | 1.000 | 25 | 9229 | wetland-from-modern-gnis-nwi-signal |
| Brooks | US-GA-13027 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 5 | 8258 |  |
| Bryan | US-GA-13029 | wetland | COASTAL PLAIN / SEA ISLAND | 0.971 | 15 | 6495 | wetland-from-modern-gnis-nwi-signal;fenneman-unclassified-fraction(0.029) |
| Bulloch | US-GA-13031 | coastal | COASTAL PLAIN / SEA ISLAND | 1.000 | 5 | 14599 |  |
| Burke | US-GA-13033 | coastal | COASTAL PLAIN / SEA ISLAND | 1.000 | 3 | 10584 | disagrees-with-roster.ts(piedmont) |
| Butts | US-GA-13035 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 2004 |  |
| Calhoun | US-GA-13037 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 0 | 5254 |  |
| Camden | US-GA-13039 | wetland | COASTAL PLAIN / SEA ISLAND | 0.912 | 41 | 13706 | wetland-from-modern-gnis-nwi-signal;fenneman-unclassified-fraction(0.088) |
| Candler | US-GA-13043 | coastal | COASTAL PLAIN / SEA ISLAND | 1.000 | 0 | 5090 |  |
| Carroll | US-GA-13045 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 1 | 5394 |  |
| Catoosa | US-GA-13047 | mountain | VALLEY AND RIDGE / TENNESSEE | 0.976 | 0 | 2149 |  |
| Charlton | US-GA-13049 | wetland | COASTAL PLAIN / SEA ISLAND | 1.000 | 27 | 12802 | wetland-from-modern-gnis-nwi-signal |
| Chatham | US-GA-13051 | wetland | COASTAL PLAIN / SEA ISLAND | 0.907 | 10 | 9345 | wetland-from-modern-gnis-nwi-signal;fenneman-unclassified-fraction(0.093) |
| Chattahoochee | US-GA-13053 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 1 | 2643 |  |
| Chattooga | US-GA-13055 | mountain | VALLEY AND RIDGE / TENNESSEE | 0.787 | 0 | 2066 |  |
| Cherokee | US-GA-13057 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 2915 |  |
| Clarke | US-GA-13059 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 1496 |  |
| Clay | US-GA-13061 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 1 | 1967 |  |
| Clayton | US-GA-13063 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 1087 |  |
| Clinch | US-GA-13065 | wetland | COASTAL PLAIN / SEA ISLAND | 0.565 | 58 | 17986 | mixed-province;wetland-from-modern-gnis-nwi-signal |
| Cobb | US-GA-13067 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 2460 |  |
| Coffee | US-GA-13069 | coastal | COASTAL PLAIN / SEA ISLAND | 0.858 | 0 | 14553 |  |
| Colquitt | US-GA-13071 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 0 | 13232 |  |
| Columbia | US-GA-13073 | fall-line | PIEDMONT / PIEDMONT UPLAND | 0.604 | 0 | 4218 | disagrees-with-roster.ts(piedmont) |
| Cook | US-GA-13075 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 7 | 5506 |  |
| Coweta | US-GA-13077 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 4558 |  |
| Crawford | US-GA-13079 | fall-line | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 0.629 | 1 | 3375 | disagrees-with-roster.ts(coastal) |
| Crisp | US-GA-13081 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 0 | 6240 |  |
| Dade | US-GA-13083 | mountain | APPALACHIAN PLATEAUS / CUMBERLAND PLATEAU | 1.000 | 0 | 1390 |  |
| Dawson | US-GA-13085 | piedmont | PIEDMONT / PIEDMONT UPLAND | 0.780 | 0 | 1062 | partial-mountain-province(0.22);disagrees-with-roster.ts(mountain) |
| Decatur | US-GA-13087 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 1 | 5487 |  |
| DeKalb | US-GA-13089 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 1761 |  |
| Dodge | US-GA-13091 | coastal | COASTAL PLAIN / SEA ISLAND | 0.910 | 0 | 8655 |  |
| Dooly | US-GA-13093 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 3 | 6043 |  |
| Dougherty | US-GA-13095 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 1 | 4583 |  |
| Douglas | US-GA-13097 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 1698 |  |
| Early | US-GA-13099 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 0 | 8245 |  |
| Echols | US-GA-13101 | wetland | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 0.996 | 33 | 12006 | wetland-from-modern-gnis-nwi-signal |
| Effingham | US-GA-13103 | wetland | COASTAL PLAIN / SEA ISLAND | 1.000 | 14 | 11246 | wetland-from-modern-gnis-nwi-signal;disagrees-with-roster.ts(coastal) |
| Elbert | US-GA-13105 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 3591 |  |
| Emanuel | US-GA-13107 | coastal | COASTAL PLAIN / SEA ISLAND | 1.000 | 0 | 12547 |  |
| Evans | US-GA-13109 | coastal | COASTAL PLAIN / SEA ISLAND | 1.000 | 0 | 3678 |  |
| Fannin | US-GA-13111 | mountain | BLUE RIDGE / SOUTHERN | 1.000 | 0 | 1098 |  |
| Fayette | US-GA-13113 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 2085 |  |
| Floyd | US-GA-13115 | mountain | VALLEY AND RIDGE / TENNESSEE | 1.000 | 0 | 4255 | disagrees-with-roster.ts(piedmont) |
| Forsyth | US-GA-13117 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 1745 |  |
| Franklin | US-GA-13119 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 1 | 2715 |  |
| Fulton | US-GA-13121 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 3933 |  |
| Gilmer | US-GA-13123 | mountain | BLUE RIDGE / SOUTHERN | 0.593 | 0 | 1455 | mixed-province |
| Glascock | US-GA-13125 | coastal | COASTAL PLAIN / SEA ISLAND | 1.000 | 0 | 1239 | disagrees-with-roster.ts(piedmont) |
| Glynn | US-GA-13127 | wetland | COASTAL PLAIN / SEA ISLAND | 0.894 | 38 | 10286 | wetland-from-modern-gnis-nwi-signal;fenneman-unclassified-fraction(0.106) |
| Gordon | US-GA-13129 | mountain | VALLEY AND RIDGE / TENNESSEE | 0.991 | 0 | 3550 |  |
| Grady | US-GA-13131 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 0 | 6747 |  |
| Greene | US-GA-13133 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 3133 |  |
| Gwinnett | US-GA-13135 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 3865 |  |
| Habersham | US-GA-13137 | piedmont | PIEDMONT / PIEDMONT UPLAND | 0.898 | 0 | 1726 | disagrees-with-roster.ts(mountain) |
| Hall | US-GA-13139 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 3004 |  |
| Hancock | US-GA-13141 | fall-line | PIEDMONT / PIEDMONT UPLAND | 0.786 | 0 | 4007 | disagrees-with-roster.ts(piedmont) |
| Haralson | US-GA-13143 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 2584 |  |
| Harris | US-GA-13145 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 5021 | disagrees-with-roster.ts(coastal) |
| Hart | US-GA-13147 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 2768 |  |
| Heard | US-GA-13149 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 2335 |  |
| Henry | US-GA-13151 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 3234 |  |
| Houston | US-GA-13153 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 0 | 3796 |  |
| Irwin | US-GA-13155 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 0.972 | 1 | 8968 |  |
| Jackson | US-GA-13157 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 3486 |  |
| Jasper | US-GA-13159 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 3289 |  |
| Jeff Davis | US-GA-13161 | coastal | COASTAL PLAIN / SEA ISLAND | 1.000 | 0 | 5519 |  |
| Jefferson | US-GA-13163 | coastal | COASTAL PLAIN / SEA ISLAND | 1.000 | 1 | 6075 | disagrees-with-roster.ts(piedmont) |
| Jenkins | US-GA-13165 | coastal | COASTAL PLAIN / SEA ISLAND | 1.000 | 0 | 5458 |  |
| Johnson | US-GA-13167 | coastal | COASTAL PLAIN / SEA ISLAND | 1.000 | 0 | 4834 |  |
| Jones | US-GA-13169 | piedmont | PIEDMONT / PIEDMONT UPLAND | 0.822 | 0 | 3383 |  |
| Lamar | US-GA-13171 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 2205 |  |
| Lanier | US-GA-13173 | wetland | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 12 | 3924 | wetland-from-modern-gnis-nwi-signal;disagrees-with-roster.ts(coastal) |
| Laurens | US-GA-13175 | coastal | COASTAL PLAIN / SEA ISLAND | 1.000 | 2 | 13876 |  |
| Lee | US-GA-13177 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 2 | 5814 |  |
| Liberty | US-GA-13179 | wetland | COASTAL PLAIN / SEA ISLAND | 0.957 | 13 | 9453 | wetland-from-modern-gnis-nwi-signal;fenneman-unclassified-fraction(0.043) |
| Lincoln | US-GA-13181 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 1910 |  |
| Long | US-GA-13183 | wetland | COASTAL PLAIN / SEA ISLAND | 1.000 | 12 | 6722 | wetland-from-modern-gnis-nwi-signal |
| Lowndes | US-GA-13185 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 7 | 8357 |  |
| Lumpkin | US-GA-13187 | piedmont | PIEDMONT / PIEDMONT UPLAND | 0.573 | 0 | 1071 | partial-mountain-province(0.43);mixed-province;disagrees-with-roster.ts(mountain) |
| McDuffie | US-GA-13189 | fall-line | PIEDMONT / PIEDMONT UPLAND | 0.562 | 0 | 3629 | mixed-province;disagrees-with-roster.ts(piedmont) |
| McIntosh | US-GA-13191 | wetland | COASTAL PLAIN / SEA ISLAND | 0.885 | 20 | 8463 | wetland-from-modern-gnis-nwi-signal;fenneman-unclassified-fraction(0.115) |
| Macon | US-GA-13193 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 1 | 3760 |  |
| Madison | US-GA-13195 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 3170 |  |
| Marion | US-GA-13197 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 0 | 3165 |  |
| Meriwether | US-GA-13199 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 4512 |  |
| Miller | US-GA-13201 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 4 | 4561 |  |
| Mitchell | US-GA-13205 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 2 | 6546 |  |
| Monroe | US-GA-13207 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 3092 |  |
| Montgomery | US-GA-13209 | coastal | COASTAL PLAIN / SEA ISLAND | 1.000 | 0 | 4615 |  |
| Morgan | US-GA-13211 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 3824 |  |
| Murray | US-GA-13213 | mountain | VALLEY AND RIDGE / TENNESSEE | 0.806 | 0 | 2601 |  |
| Muscogee | US-GA-13215 | fall-line | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 0.774 | 0 | 2783 | disagrees-with-roster.ts(coastal) |
| Newton | US-GA-13217 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 3471 |  |
| Oconee | US-GA-13219 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 2219 |  |
| Oglethorpe | US-GA-13221 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 4378 |  |
| Paulding | US-GA-13223 | piedmont | PIEDMONT / PIEDMONT UPLAND | 0.974 | 0 | 2564 |  |
| Peach | US-GA-13225 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 0 | 1051 |  |
| Pickens | US-GA-13227 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 1224 | disagrees-with-roster.ts(mountain) |
| Pierce | US-GA-13229 | coastal | COASTAL PLAIN / SEA ISLAND | 1.000 | 3 | 5241 |  |
| Pike | US-GA-13231 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 2009 |  |
| Polk | US-GA-13233 | mountain | VALLEY AND RIDGE / TENNESSEE | 0.680 | 0 | 3493 | disagrees-with-roster.ts(piedmont) |
| Pulaski | US-GA-13235 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 0.955 | 0 | 4034 |  |
| Putnam | US-GA-13237 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 2328 |  |
| Quitman | US-GA-13239 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 0 | 1178 |  |
| Rabun | US-GA-13241 | mountain | BLUE RIDGE / SOUTHERN | 0.998 | 0 | 1439 |  |
| Randolph | US-GA-13243 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 0 | 3144 |  |
| Richmond | US-GA-13245 | coastal | COASTAL PLAIN / SEA ISLAND | 0.998 | 2 | 3531 | disagrees-with-roster.ts(piedmont) |
| Rockdale | US-GA-13247 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 1494 |  |
| Schley | US-GA-13249 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 0 | 1515 |  |
| Screven | US-GA-13251 | coastal | COASTAL PLAIN / SEA ISLAND | 1.000 | 8 | 12054 |  |
| Seminole | US-GA-13253 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 1 | 2714 |  |
| Spalding | US-GA-13255 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 2224 |  |
| Stephens | US-GA-13257 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 1 | 1603 | disagrees-with-roster.ts(mountain) |
| Stewart | US-GA-13259 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 0 | 3882 |  |
| Sumter | US-GA-13261 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 0 | 6077 |  |
| Talbot | US-GA-13263 | piedmont | PIEDMONT / PIEDMONT UPLAND | 0.833 | 0 | 3942 | disagrees-with-roster.ts(coastal) |
| Taliaferro | US-GA-13265 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 1515 |  |
| Tattnall | US-GA-13267 | coastal | COASTAL PLAIN / SEA ISLAND | 1.000 | 5 | 8602 |  |
| Taylor | US-GA-13269 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 0.886 | 1 | 4037 |  |
| Telfair | US-GA-13271 | coastal | COASTAL PLAIN / SEA ISLAND | 0.991 | 4 | 7194 |  |
| Terrell | US-GA-13273 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 0 | 4208 |  |
| Thomas | US-GA-13275 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 4 | 8526 |  |
| Tift | US-GA-13277 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 0 | 8433 |  |
| Toombs | US-GA-13279 | coastal | COASTAL PLAIN / SEA ISLAND | 1.000 | 0 | 6588 |  |
| Towns | US-GA-13281 | mountain | BLUE RIDGE / SOUTHERN | 1.000 | 0 | 651 |  |
| Treutlen | US-GA-13283 | coastal | COASTAL PLAIN / SEA ISLAND | 1.000 | 0 | 3850 |  |
| Troup | US-GA-13285 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 4782 |  |
| Turner | US-GA-13287 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 1 | 7120 |  |
| Twiggs | US-GA-13289 | coastal | COASTAL PLAIN / SEA ISLAND | 0.930 | 2 | 3344 |  |
| Union | US-GA-13291 | mountain | BLUE RIDGE / SOUTHERN | 1.000 | 0 | 1213 |  |
| Upson | US-GA-13293 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 3686 | disagrees-with-roster.ts(coastal) |
| Walker | US-GA-13295 | mountain | APPALACHIAN PLATEAUS / CUMBERLAND PLATEAU | 0.624 | 0 | 3988 |  |
| Walton | US-GA-13297 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 4084 |  |
| Ware | US-GA-13299 | wetland | COASTAL PLAIN / SEA ISLAND | 1.000 | 38 | 17526 | wetland-from-modern-gnis-nwi-signal |
| Warren | US-GA-13301 | fall-line | PIEDMONT / PIEDMONT UPLAND | 0.726 | 0 | 3223 | disagrees-with-roster.ts(piedmont) |
| Washington | US-GA-13303 | coastal | COASTAL PLAIN / SEA ISLAND | 1.000 | 0 | 8393 | disagrees-with-roster.ts(piedmont) |
| Wayne | US-GA-13305 | wetland | COASTAL PLAIN / SEA ISLAND | 1.000 | 21 | 12226 | wetland-from-modern-gnis-nwi-signal;disagrees-with-roster.ts(coastal) |
| Webster | US-GA-13307 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 0 | 1885 |  |
| Wheeler | US-GA-13309 | coastal | COASTAL PLAIN / SEA ISLAND | 1.000 | 0 | 5095 |  |
| White | US-GA-13311 | piedmont | PIEDMONT / PIEDMONT UPLAND | 0.668 | 0 | 1256 | partial-mountain-province(0.33);disagrees-with-roster.ts(mountain) |
| Whitfield | US-GA-13313 | mountain | VALLEY AND RIDGE / TENNESSEE | 1.000 | 0 | 3517 |  |
| Wilcox | US-GA-13315 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 3 | 8345 |  |
| Wilkes | US-GA-13317 | piedmont | PIEDMONT / PIEDMONT UPLAND | 1.000 | 0 | 3491 |  |
| Wilkinson | US-GA-13319 | coastal | COASTAL PLAIN / SEA ISLAND | 1.000 | 0 | 4073 |  |
| Worth | US-GA-13321 | coastal | COASTAL PLAIN / EAST GULF COASTAL PLAIN | 1.000 | 0 | 12248 |  |

## Citations

| Key | Source URL | Retrieved | HTTP | Bytes | License quote (verbatim) | HTTP basis |
|---|---|---|---|---|---|---|
| physio | https://water.usgs.gov/GIS/dsdl/physio_shp.zip | 2026-09-16 | 200 | 451315 | "USGS-authored or produced data and information are considered to be in the U.S. Public Domain." | issue-3-source-map.json log (HEAD); cached zip size 451315 |
| usgs-rights | https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits | 2026-09-16 | 200 | 81841 | "USGS-authored or produced data and information are considered to be in the U.S. Public Domain." | cache body is the live policy page (status not separately logged) |
| gnis | https://prd-tnm.s3.amazonaws.com/StagedProducts/GeographicNames/DomesticNames/DomesticNames_GA_Text.zip | 2026-09-16 | 200 | 926404 | "USGS-authored or produced data and information are considered to be in the U.S. Public Domain." | issue-3-source-map.json log (HEAD); cached size 926404 |
| nwi | https://www.fws.gov/program/national-wetlands-inventory | 2026-09-16 | 200 | 116323 | "Not all the information on our site is in the public domain. Some images/graphics are licensed for use under the copyright law , and the use of the Service logo is restricted to official publications (see below)." | issue-3-source-map.json log; cached size 116322 |

NWI and GNIS are current inventories. Their counts describe 2020s mapping, not 1942 ground conditions; they are used only to separate `wetland` from `coastal` inside Fenneman Coastal Plain counties.
