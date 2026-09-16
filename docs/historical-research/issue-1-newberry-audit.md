# Issue #1 — Newberry *Atlas of Historical County Boundaries*, Georgia dataset: metadata and license audit

Audit date: 14 September 2026. All quotations below are copied verbatim from the pages and files named, with only HTML markup and line breaks removed. Where a passage contains a typographic curly quote or an em dash in the source, it is reproduced as found.

## 1. Where the dataset lives now

- `https://publications.newberry.org/ahcbp/` (the URL cited in the game design) now returns a 152-byte redirect stub whose only content is `window.location.replace("https://digital.newberry.org/ahcb")`.
- `https://digital.newberry.org/ahcb/` resolves (HTTP 200) to `https://publications.newberry.org/ahcb/`.
- Georgia state page: `https://publications.newberry.org/ahcb/pages/Georgia.html` (HTTP 200, 12,492 bytes).
- Georgia dataset download: `https://publications.newberry.org/ahcb/downloads/gis/GA_AtlasHCB.zip` (HTTP 200, `content-length: 21271531`, `content-type: application/zip`).
- Supplemental texts (all HTTP 200): `documents/GA_County_Index.htm`, `documents/GA_Individual_County_Chronologies.htm`, `documents/GA_Consolidated_Chronology.htm`, `documents/GA_Bibliography.htm`, `documents/GA_Commentary.htm`, `documents/GA_Metadata1.htm`, `documents/GA_Metadata2.htm`.

## 2. Dataset metadata (quoted)

From the Georgia state page, `https://publications.newberry.org/ahcb/pages/Georgia.html`:

> Georgia
> 159 Counties
> Maps and text covering the historical boundaries, names, organization, and attachments of every county, extinct county and unsuccessful county proposal from the creation of the first county through December 31, 2000.

From the summary metadata, `https://publications.newberry.org/ahcb/documents/GA_Metadata1.htm` (also shipped inside the zip as `GA_Supplemental_Texts/GA_Metadata1.htm`):

> DatasetTitle Georgia Historical Counties
> DatasetType vector digital data
> CreationDate 2010
> LastUpdated 2010-06-14
> Citation.PreferredStyle Long, John H., John Ford, and Robert Will. Georgia Historical Counties. Data Set. Emily Kelley, digital comp. Atlas of Historical County Boundaries, ed. by John H. Long. Chicago: The Newberry Library, 2010. Available online from http://www.newberry.org/ahcbp.
> Description Compilation of all changes in the size, shape, and location of all counties in Georgia from the creation of the first one to the end of 2000. Separate polygon for each version of a county in shapefile format, including attribute table, plus database, supplemental chronologies, bibliography, etc., in textual form.
> Publisher The Newberry Library
> Format Shapefile
> Format.Size 1310 polygons, 25.979 MB
> Source Laws of Georgia and other sources listed in bibliography
> Coverage.t.early 1758-03-17
> Coverage.t.late 2000-12-31
> Coverage.Spatial.Resolution 1:100,000
> Coverage.Temporal.Interval 1 day
> Rights Free access/download and use under Attribution-NonCommercial-ShareAlike Creative Commons License (www.newberry.org/ahcbp)

From the full FGDC metadata, `https://publications.newberry.org/ahcb/documents/GA_Metadata2.htm`:

> Originator: John H. Long, Historical Compiler
> Originator: John Ford, Historical Compiler
> Originator: Robert Will, Historical Compiler
> Originator: Emily Kelley, Digital Compiler
> Originator: John H. Long, Editor, Atlas of Historical County Boundaries
> Publication_Date: 06/30/2010
> Title: Georgia_Historical_Counties_Dataset
> Temporal_Keyword: 17 March 1758 to 31 December 2000
> Access_Constraints: Free access for use under an Attribution-NonCommercial-ShareAlike Creative Commons License
> Use_Constraints: Free for use under an Attribution-NonCommercial-ShareAlike Creative Commons License
> Horizontal_Positional_Accuracy_Report: Accurate to matching USGS 1:500,000 scale State Base maps.
> Distribution_Liability: No liability is assumed by the Atlas of Historical County Boundaries Project or the Newberry Library
> Metadata_Date: 20100630

From the county index, `https://publications.newberry.org/ahcb/documents/GA_County_Index.htm`:

> Copyright The Newberry Library 2010

Contents of `GA_AtlasHCB.zip` as downloaded (25 files): `GA_Historical_Counties/` shapefile set (`.shp`, `.shx`, `.dbf`, `.prj`, `.sbn`, `.sbx`, `.shp.xml`); `GA_Comprehensive_Database/GA_Comprehensive_Database.txt` (tab-delimited, header `"NAME" "ID" "STATE" "FIPS" "VERSION" "START_DATE" "END_DATE" "CREATION_OR_CHANGE" "CITATION" "START_N" "END_N" "DATASET"`, 1,784 data rows); `GA_Supplemental_Texts/` (seven HTML files plus `chron.css`); `zCreativeCommonsLicense/CreativeCommonsDeed.htm` with image files; `Atlas_Dataset_READ_ME.htm`; `CompDB_READ_ME.htm`. No `Small_Changes` shapefile is included for Georgia.

## 3. License terms (quoted verbatim)

Three different statements apply, and they do not say the same thing. All are reproduced here so the project can decide which governs.

### 3.1 Terms on the Georgia state page

`https://publications.newberry.org/ahcb/pages/Georgia.html`, "Download Shapefiles for use with GIS Programs (zip file)" section:

> Full contents of the Atlas of Historical County Boundaries may be downloaded free of charge for use under the stipulations and constraints described in the Creative Commons License. Downloads a zipped folder containing the full dataset for the desired state.

The words "Creative Commons License" on that page link to `http://creativecommons.org/licenses/by-nc-sa/2.5/`. The same section's bullet list includes:

> Copy of the free access Attribution-NonCommercial-ShareAlike Creative Commons License

Footer of the same page (and of every Atlas page):

> The Newberry makes its collections available for any lawful purpose, commercial or non-commercial, without licensing or permission fees to the library, subject to the following terms and conditions: https://www.newberry.org/rights-and-reproductions

### 3.2 Terms on the Download Files pages

`https://publications.newberry.org/ahcb/downloads/index.html`:

> The data used in the Atlas project is readily available to download to be consulted, reviewed, and reused for any lawful purpose, commercial or non-commercial, without licensing or permission fees to the library. Please note that some files may contain the original, out-of-date copyright license; these can be ignored.

`https://publications.newberry.org/ahcb/downloads/united_states.html`:

> The data used in the Atlas project is readily available to download to be consulted, reviewed, and reused for any lawful purpose, commercial or non-commercial, without licensing or permission fees to the library. Please note that some of these files contain the original, out-of-date copyright license; these can be ignored.

### 3.3 Terms inside the downloaded Georgia zip

`GA_AtlasHCB/Atlas_Dataset_READ_ME.htm`:

> Creative Commons License
> The Newberry Library is the copyright holder.
> These files are free for use under an Attribution-NonCommercial-ShareAlike Creative Commons License and may be downloaded from the Web site: www.newberry.org/ahcbp.

`GA_AtlasHCB/zCreativeCommonsLicense/CreativeCommonsDeed.htm` (deed as bundled, dated 2006-03-14 in its document properties):

> Creative Commons Attribution-NonCommercial-ShareAlike 2.5
> You are free:
> to copy, distribute, display, and perform the work
> to make derivative works
> Under the following conditions:
> Attribution. You must attribute the work in the manner specified by the author or licensor.
> Noncommercial. You may not use this work for commercial purposes.
> Share Alike. If you alter, transform, or build upon this work, you may distribute the resulting work only under a license identical to this one.
> For any reuse or distribution, you must make clear to others the license terms of this work.
> Any of these conditions can be waived if you get permission from the copyright holder.
> Your fair use and other rights are in no way affected by the above.
> This is a human-readable summary of the Legal Code (the full license).

### 3.4 The Newberry's institution-wide open access policy

`https://www.newberry.org/rights-and-reproductions` redirects to `https://www.newberry.org/collection/order-digital-files`, which states under "Permissions for Using Images from the Collection":

> Under our open access policy, you can use images from the Newberry collection for any lawful purpose without paying any licensing or permission fees to the library.
> Please keep in mind that US copyright law still applies. You are responsible for making sure you're in compliance.
> Determine whether the material is in the public domain or protected by copyright law or other restrictions.
> If the material is protected by copyright law, determine if your intended use of it falls within the bounds of fair use.
> If your intended use of the material doesn't qualify as fair use, obtain permission from any rights holders.

The linked policy text, `https://www.newberry.org/policies#open-access`, "Open Access Policy — Using Images from the Newberry Collection":

> The Newberry makes its collections available for any lawful purpose, commercial or non-commercial, without licensing or permission fees to the library, subject to the following terms and conditions. Use of reproductions of Newberry collection items shall be at the user’s sole risk. Researchers are responsible for determining whether the material is in the public domain or whether it is protected by copyright law or other restrictions. If the material is protected by copyright law, researchers are responsible for determining whether the intended use is within the limits of fair use and, if not, for obtaining permission from any rights holders. The Newberry shall not be responsible or liable for any claim of infringement or damage that may occur owing to the use of any material that the Newberry makes available.

### 3.5 Finding on the CC0 claim in the game design

`docs/game-design.md` §3.2 states that "Newberry's current About page explicitly releases Atlas data under CC0 1.0 Universal [S6]". **No CC0 or "Universal" language was found** on the About page (`https://publications.newberry.org/ahcb/project.html`), the Download pages, the Georgia page, the Georgia metadata, the bundled README or deed, the rights page, or the policies page (searched all fetched copies for the strings `CC0` and `Universal`; zero hits). The About page says only:

> The Newberry Library makes these data available without charge over the Internet as shapefiles that users can download for use with geographic information system (GIS) software.

The strongest open statement is the Download pages' "reused for any lawful purpose, commercial or non-commercial, without licensing or permission fees to the library" together with the instruction that files containing "the original, out-of-date copyright license … can be ignored". That is a permission statement by the copyright holder, not a CC0 dedication. The design document's [S6] citation should be corrected.

## 4. Retention and redistribution guidance for County Compact

1. **What was used in this package.** Only the textual chronology and the Comprehensive Database attribute rows (county names, IDs, FIPS crosswalk, version dates, change descriptions, legal citations). No Newberry polygon geometry has been copied into the repository at this phase.
2. **If polygons are bundled later (Issue #2).** Treat the dataset as copyright The Newberry Library 2010 and satisfy *both* published regimes: (a) attribute using the Newberry preferred citation (section 2 above) in the provenance block and in the in-app credits; (b) keep a copy of this audit with the verbatim "any lawful purpose, commercial or non-commercial" statement and its URL and retrieval date, because that statement is the only basis for use outside CC BY-NC-SA. If the project is ever distributed commercially, obtain written confirmation from `dis@newberry.org` (the contact address on the Atlas pages) or `scholl@newberry.org` (the metadata contact) that the "any lawful purpose" statement supersedes the bundled BY-NC-SA 2.5 deed, since the deed's NonCommercial clause would otherwise apply.
3. **Do not relicense.** Do not mark Newberry-derived data as CC0 or public domain. Do not strip the "Copyright The Newberry Library 2010" notice from any copied supplemental text.
4. **Keep the retrieval record.** Record in the provenance block: dataset title, publication date 2010-06-30, download URL, zip byte size 21,271,531, and access date 2026-09-14, plus the note that the legacy `ahcbp` URL redirects.
5. **Census material is separate.** The 1940 Census volume and the 2020 code list are U.S. federal publications in the public domain; retain the Census Bureau attribution as the existing provenance block already requires.
