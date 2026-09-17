// Reproducible 1940 Census Table 5 seat-verification (CC-03).
//
// Inputs:
//   <ocr-dir>  scratchpad OCR of Table 5 (PDF pages 21–23, 1940 Census
//              Georgia chapter): raw/<panel>-{place,county}-psm6.tsv word
//              boxes and raw/<panel>-{pop1940,pop1930}-rows.tsv row reads
//   <pdf>      the same PDF: sha256 / byte-size provenance, and its embedded
//              text layer (pdftotext -layout) for independent corroboration
// Output: src/data/settlements.json
//   { provenance, seats } — one record per roster SEATS county, sorted by
//   countyId. Unmatched seats are listed, not guessed.
//
// Invocations:
//   node scripts/prepare-settlements.mjs <ocr-dir> <pdf>
//   node scripts/prepare-settlements.mjs --check <ocr-dir> <pdf>
//   node scripts/prepare-settlements.mjs --help
//
// The pure parse/match/validate functions are exported so tests can run
// them on synthetic strings; main() runs only when this file is executed
// directly.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ROSTER_PATH = "src/data/roster.ts";
const GEOMETRY_PATH = "src/data/georgia-counties.json";
const OUT_PATH = "src/data/settlements.json";
const RAN_AT = "2026-09-16T00:00:00.000Z";
const MATCHED_BASIS =
  "modern seat assumed; incorporation in 1940 confirmed by Census Table 5";
const UNMATCHED_BASIS = "unverified: seat not found in 1940 Census Table 5";
const SOURCE = {
  name: "1940 Census of Population, Volume I, Georgia chapter, Table 5",
  url: "https://www2.census.gov/library/publications/decennial/1940/population-volume-1/33973538v1ch04.pdf",
  licence: "US Government work, public domain",
};
const METHOD =
  "400 dpi 1-bit scans of PDF pages 21–23 cropped per Table 5 panel and field; tesseract --psm 6 TSV word boxes for place and county fields; each population row re-OCRed alone (tesseract --psm 7, digit whitelist) at 1×/2×/3× and accepted only when at least two reads agree; populations paired to place lines by vertical position (±14 px, unique nearest), never by list order; seat matched on place name + county only, populations taken from that row only; 0.33×–3× 1940/1930 sanity check; values the PDF text layer contradicts on a place+county line, duplicate 1940 values across different places and seat populations under 100 are nulled; 1940 values corroborated against the PDF's own text layer (pdftotext -layout)";

const USAGE = `Usage:
  node scripts/prepare-settlements.mjs <ocr-dir> <census1940-ga.pdf>
      Write src/data/settlements.json from Table 5 OCR text.
  node scripts/prepare-settlements.mjs --check <ocr-dir> <census1940-ga.pdf>
      Validate only. JSON report to stdout. Exit 0/1/2. Writes no file.
  node scripts/prepare-settlements.mjs --help
      Print this usage.`;

export const SANITY_LO = 0.33;
export const SANITY_HI = 3;
export const MATCHED_SEAT_BASIS = MATCHED_BASIS;
export const UNMATCHED_SEAT_BASIS = UNMATCHED_BASIS;

function parseArgs(argv) {
  const args = argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) return { help: true };
  const check = args.includes("--check");
  const srcs = args.filter((a) => !a.startsWith("-"));
  return { help: false, check, srcs };
}

function checkResult(name, pass, details) {
  return details === undefined ? { name, pass } : { name, pass, details };
}

/** Lowercase, strip punctuation/spaces. Exported for tests. */
export function normalizeName(s) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

/** Collapse documented OCR confusions (l/1, rn/m, e/c, 0/o). */
export function collapseOcrConfusions(normalized) {
  return String(normalized ?? "")
    .replace(/1/g, "l")
    .replace(/0/g, "o")
    .replace(/rn/g, "m")
    .replace(/c/g, "e");
}

export function levenshtein(a, b) {
  const s = String(a), t = String(b);
  const n = s.length, m = t.length;
  if (n === 0) return m;
  if (m === 0) return n;
  const prev = new Array(m + 1);
  const cur = new Array(m + 1);
  for (let j = 0; j <= m; j++) prev[j] = j;
  for (let i = 1; i <= n; i++) {
    cur[0] = i;
    for (let j = 1; j <= m; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= m; j++) prev[j] = cur[j];
  }
  return prev[m];
}

function tokensMatch(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  const ca = collapseOcrConfusions(a);
  const cb = collapseOcrConfusions(b);
  if (ca === cb) return true;
  const maxLen = Math.max(a.length, b.length);
  const dist = Math.min(levenshtein(a, b), levenshtein(ca, cb));
  if (maxLen >= 8 && dist <= 2) return true;
  if (maxLen >= 4 && dist <= 1) return true;
  // Dropped leading letter(s) from a clipped crop: "tlanta" ~ "atlanta".
  // Trailing OCR junk: "atlantar" ~ "atlanta", "cobboioocaaen" ~ "cobb".
  const prefixOk = (short, long, maxExtra) =>
    short.length >= 4 && long.startsWith(short) && long.length - short.length <= maxExtra;
  const suffixOk = (short, long) =>
    short.length >= 5 && long.endsWith(short) && long.length - short.length <= 2;
  const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];
  if (prefixOk(shorter, longer, 2) || suffixOk(shorter, longer)) return true;
  const [cShort, cLong] = ca.length <= cb.length ? [ca, cb] : [cb, ca];
  if (prefixOk(cShort, cLong, 2) || suffixOk(cShort, cLong)) return true;
  return false;
}

export function namesMatch(a, b) {
  return tokensMatch(normalizeName(a), normalizeName(b));
}

function countyTokensMatch(a, b) {
  if (tokensMatch(a, b)) return true;
  const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];
  return shorter.length >= 4 && longer.startsWith(shorter) && longer.length - shorter.length <= 12;
}

export function countyMatch(a, b) {
  const na = normalizeName(a), nb = normalizeName(b);
  if (countyTokensMatch(na, nb)) return true;
  return countyTokensMatch(collapseOcrConfusions(na), collapseOcrConfusions(nb));
}

/**
 * Parse a population token. Thousands commas/spaces are clean; OCR letter
 * substitutions and edge junk are corrected; malformed digit groups
 * ("4,45", "1 7608") are unparsed (null) rather than guessed.
 */
export function parsePopulationToken(raw) {
  const text = String(raw ?? "").trim();
  if (!text) return { value: null, confidence: "unparsed" };
  if (!/\d/.test(text)) return { value: null, confidence: "unparsed" };
  // Parenthesised footnote remnants ("(1)893", "0)") are not populations.
  if (/[()]/.test(text)) return { value: null, confidence: "unparsed" };
  let s = text.replace(/[Oo]/g, "0").replace(/[Il]/g, "1").replace(/[Ss]/g, "5");
  let corrected = s !== text;
  // A leading separator (", 228") means a digit group was lost.
  if (/^[,.]/.test(s.trim())) return { value: null, confidence: "unparsed" };
  const trimmed = s.replace(/^[^\d]+/, "").replace(/[^\d]+$/, "");
  if (trimmed !== s.trim()) corrected = true;
  s = trimmed;
  const inRange = (n) => Number.isInteger(n) && n >= 0 && n <= 400000;
  // "302. 288" / "5, 052" / "9,281"
  if (/^\d{1,3}(?:[,.]\s*\d{3})+$/.test(s)) {
    const n = Number(s.replace(/\D+/g, ""));
    if (!inRange(n)) return { value: null, confidence: "unparsed" };
    return { value: n, confidence: corrected || /[.\s]/.test(s) ? "corrected" : "clean" };
  }
  if (/^\d{1,6}$/.test(s)) {
    const n = Number(s);
    if (!inRange(n)) return { value: null, confidence: "unparsed" };
    return { value: n, confidence: corrected ? "corrected" : "clean" };
  }
  return { value: null, confidence: "unparsed" };
}

/** 1940 pop must be within 0.33×–3× of 1930 when both parse. */
export function populationSanity(pop1940, pop1930) {
  if (pop1940 == null || pop1930 == null) return true;
  if (pop1930 === 0) return pop1940 === 0;
  const ratio = pop1940 / pop1930;
  return ratio >= SANITY_LO && ratio <= SANITY_HI;
}

export function parsePopulationPair(raw1940, raw1930) {
  const a = parsePopulationToken(raw1940);
  const b = parsePopulationToken(raw1930);
  let confidence = "clean";
  if (a.confidence === "unparsed" && b.confidence === "unparsed") confidence = "unparsed";
  else if (a.confidence === "unparsed" || b.confidence === "unparsed" ||
           a.confidence === "corrected" || b.confidence === "corrected") {
    confidence = a.confidence === "unparsed" && b.value != null ? "corrected"
      : b.confidence === "unparsed" && a.value != null ? "corrected"
      : a.confidence === "unparsed" && b.confidence === "unparsed" ? "unparsed"
      : "corrected";
    if (a.value != null && b.value != null &&
        (a.confidence === "corrected" || b.confidence === "corrected")) {
      confidence = "corrected";
    } else if (a.value != null && b.value == null) confidence = a.confidence;
    else if (b.value != null && a.value == null) confidence = b.confidence;
  }
  if (!populationSanity(a.value, b.value)) {
    return { population1940: null, population1930: null, ocrConfidence: "unparsed" };
  }
  if (a.value == null && b.value == null) {
    return { population1940: null, population1930: null, ocrConfidence: "unparsed" };
  }
  return { population1940: a.value, population1930: b.value, ocrConfidence: confidence };
}

export function loadSeats(rosterSrc) {
  const src = rosterSrc ?? readFileSync(ROSTER_PATH, "utf8");
  const block = src.match(/export const SEATS[\s\S]*?=\s*\{([\s\S]*?)\};/);
  if (!block) throw new Error("SEATS object not found in roster.ts");
  const seats = {};
  const re = /["']?([A-Za-z][A-Za-z .']*)["']?\s*:\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(block[1]))) seats[m[1]] = m[2];
  return seats;
}

function countyAliases(name) {
  const n = name;
  if (n === "DeKalb") return ["DeKalb", "De Kalb", "Dekalb"];
  if (n === "McDuffie") return [n, "Mc Duffe", "McDuffe"];
  if (n === "McIntosh") return [n, "Mc Intosh", "Mclntosh", "MecIntosh"];
  return [n];
}

export function findCountiesInText(text, countyNames) {
  const rawWords = String(text ?? "").split(/[^A-Za-z]+/).filter((w) => w.length >= 1);
  const words = rawWords.filter((w) => w.length >= 2);
  if (!rawWords.length) return [];
  const names = [...countyNames].sort((a, b) => b.length - a.length);
  const found = [];
  const seen = new Set();
  const consider = [...words];
  for (let i = 0; i < rawWords.length - 1; i++) consider.push(`${rawWords[i]}${rawWords[i + 1]}`);
  for (const word of consider) {
    let best = null;
    for (const name of names) {
      if (seen.has(name)) continue;
      if (countyAliases(name).some((alias) => countyMatch(word, alias))) {
        best = name;
        break;
      }
    }
    if (best && !seen.has(best)) {
      seen.add(best);
      found.push(best);
    }
  }
  return found;
}

// ---------------------------------------------------------------------------
// OCR geometry: tesseract TSV word boxes and per-row population reads.

/** Vertical tolerance (px) for pairing a place line with a field line. */
export const ALIGN_TOL = 14;
/** Wider window for brace-listed counties ({De Kalb / Fulton}). */
const BRACE_TOL = 40;
/** A seat below this 1940 population is treated as an OCR error. */
export const MIN_SEAT_POPULATION = 100;

/** Parse tesseract TSV (level-5 word rows) into word boxes. */
export function parseTsvWords(text) {
  const words = [];
  for (const line of String(text ?? "").split(/\r?\n/).slice(1)) {
    const p = line.split("\t");
    if (p.length < 12 || p[0] !== "5" || !p[11].trim()) continue;
    const left = Number(p[6]), top = Number(p[7]), width = Number(p[8]), height = Number(p[9]);
    words.push({ text: p[11], conf: Number(p[10]), left, top, width, height, cy: top + height / 2 });
  }
  return words;
}

/** Group word boxes into text lines by vertical centre; drops dot-leader specks. */
export function clusterLines(words, { tol = 12, minHeight = 18, maxHeight = 50 } = {}) {
  const ws = words
    .filter((w) => w.height >= minHeight && w.height <= maxHeight)
    .sort((a, b) => a.cy - b.cy || a.left - b.left);
  const groups = [];
  for (const w of ws) {
    const g = groups[groups.length - 1];
    if (g && Math.abs(w.cy - g.cy) <= tol) {
      g.words.push(w);
      g.cy = g.words.reduce((s, x) => s + x.cy, 0) / g.words.length;
    } else {
      groups.push({ words: [w], cy: w.cy });
    }
  }
  return groups.map((g) => ({
    cy: g.cy,
    text: g.words.sort((a, b) => a.left - b.left).map((w) => w.text).join(" "),
  }));
}

/** Parse raw/<panel>-<field>-rows.tsv (cy top bottom v1x v2x v3x). */
export function parseRowReads(text) {
  const rows = [];
  for (const line of String(text ?? "").split(/\r?\n/).slice(1)) {
    if (!line.trim()) continue;
    const p = line.split("\t");
    const cy = Number(p[0]);
    if (!Number.isFinite(cy)) continue;
    rows.push({ cy, reads: p.slice(3) });
  }
  return rows;
}

/**
 * Majority vote over independent reads of one population cell. A value is
 * accepted only when at least two reads parse to it and no other value has
 * as many votes. All reads agreeing is "clean"; a 2-of-3 majority is
 * "corrected"; anything else is null / "unparsed".
 */
export function voteReads(reads) {
  const list = reads ?? [];
  const counts = new Map();
  for (const r of list) {
    const { value } = parsePopulationToken(r);
    if (value == null) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  if (!ranked.length || ranked[0][1] < 2 || (ranked[1] && ranked[1][1] === ranked[0][1])) {
    return { value: null, confidence: "unparsed", votes: ranked[0]?.[1] ?? 0 };
  }
  const [value, votes] = ranked[0];
  return { value, confidence: votes === list.length ? "clean" : "corrected", votes };
}

/**
 * Place-name candidates from one OCR'd place line: the leading letter runs of
 * the first words, stopping at the first dot leader / asterisk. Returns 1-,
 * 2- and 3-word prefixes so "College Park *..." yields "College Park".
 */
export function placeNameVariants(lineText) {
  const words = String(lineText ?? "").split(/\s+/).filter(Boolean);
  const parts = [];
  for (const w of words) {
    const m = w.match(/^[^A-Za-z]*([A-Za-z]+)(.*)$/);
    if (!m) {
      if (parts.length) break;
      continue;
    }
    parts.push(m[1]);
    if (m[2] || parts.length >= 3) break;
  }
  const out = [];
  for (let i = 1; i <= parts.length; i++) out.push(parts.slice(0, i).join(" "));
  return out.filter((v) => v.replace(/\s/g, "").length >= 3);
}

/**
 * Assign each population row to the place line nearest to it in y, within
 * ALIGN_TOL. A row whose two nearest place lines are within 3 px of equal
 * distance is ambiguous and marks both places.
 */
export function assignRowsToPlaces(placeLines, rows, tol = ALIGN_TOL) {
  const byPlace = placeLines.map(() => ({ rows: [], ambiguous: false }));
  for (const row of rows) {
    const near = placeLines
      .map((p, i) => ({ i, d: Math.abs(p.cy - row.cy) }))
      .filter((x) => x.d <= tol)
      .sort((a, b) => a.d - b.d);
    if (!near.length) continue;
    if (near[1] && near[1].d - near[0].d <= 3) {
      byPlace[near[0].i].ambiguous = true;
      byPlace[near[1].i].ambiguous = true;
      continue;
    }
    byPlace[near[0].i].rows.push(row);
  }
  return byPlace;
}

/**
 * Counties named in one OCR'd county-field line. Falls back to a prefix
 * match on the leading letters, because dot leaders often OCR as letters
 * glued to the name ("Hallooenocmeeeeae" -> Hall); the longest county name
 * that prefixes the text wins.
 */
export function countiesInField(text, countyNames) {
  const found = findCountiesInText(text, countyNames);
  if (found.length) return found;
  const lead = String(text ?? "").match(/[A-Za-z][A-Za-z ]*/)?.[0] ?? "";
  const nl = normalizeName(lead);
  const names = [...countyNames].sort((a, b) => b.length - a.length);
  for (const name of names) {
    for (const alias of countyAliases(name)) {
      const na = normalizeName(alias);
      if (na.length >= 3 && (nl.startsWith(na) || collapseOcrConfusions(nl).startsWith(collapseOcrConfusions(na)))) {
        return [name];
      }
    }
  }
  return [];
}

/**
 * Build place records for one panel. Populations are paired with place
 * lines strictly by vertical position; a place with zero or several
 * candidate rows, or an ambiguous row, gets null populations ("unparsed").
 */
export function assemblePanelRows(panel, countyNames) {
  const { id = "", placeLines, countyLines, pop1940Rows, pop1930Rows } = panel;
  const p40 = assignRowsToPlaces(placeLines, pop1940Rows);
  const p30 = assignRowsToPlaces(placeLines, pop1930Rows);
  const linesNear = (cy, tol) => countyLines.filter((c) => Math.abs(c.cy - cy) <= tol);
  const countiesOf = (lines) => [...new Set(lines.flatMap((c) => countiesInField(c.text, countyNames)))];
  const records = [];
  let carry = null;
  for (let i = 0; i < placeLines.length; i++) {
    const line = placeLines[i];
    let variants = placeNameVariants(line.text);
    if (carry) {
      variants = [...variants.map((v) => `${carry} ${v}`), ...variants];
      carry = null;
    }
    if (!variants.length) continue;
    const a40 = p40[i], a30 = p30[i];
    const next = placeLines[i + 1];
    const ownLines = linesNear(line.cy, ALIGN_TOL);
    // Wrapped two-line name ("Chalybeate" / "Springs"): no county and no
    // population on this line, continuation on the very next text line.
    if (!ownLines.length && !a40.rows.length && !a30.rows.length && next && next.cy - line.cy <= 45) {
      carry = variants[variants.length - 1];
      continue;
    }
    // Brace-listed counties straddle the place line; widen only when a brace
    // is actually on this row, never to borrow a neighbour's county.
    const counties = ownLines.some((c) => /[{}]/.test(c.text))
      ? countiesOf(linesNear(line.cy, BRACE_TOL))
      : countiesOf(ownLines);
    const cell = (a) =>
      a.ambiguous || a.rows.length !== 1 ? { value: null, confidence: "unparsed" } : voteReads(a.rows[0].reads);
    const v40 = cell(a40);
    const v30 = cell(a30);
    let population1940 = v40.value;
    let population1930 = v30.value;
    let ocrConfidence = population1940 == null
      ? "unparsed"
      : v40.confidence === "clean" && (v30.value == null || v30.confidence === "clean") ? "clean" : "corrected";
    if (!populationSanity(population1940, population1930)) {
      population1940 = null;
      population1930 = null;
      ocrConfidence = "unparsed";
    }
    records.push({
      place: variants[variants.length - 1],
      nameVariants: variants,
      counties,
      urban1940: /\*/.test(line.text) ? true : null,
      population1940,
      population1930,
      ocrConfidence,
      panel: id,
      cy: Math.round(line.cy),
    });
  }
  return records;
}

function readText(path) {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return null;
  }
}

/** Read every panel's TSV word boxes and row reads from <ocr-dir>/raw. */
export function parseOcrDirectory(ocrDir, countyNames) {
  const raw = join(ocrDir, "raw");
  const panels = readdirSync(raw)
    .map((f) => f.match(/^(p\d+-panel\d+)-place-psm6\.tsv$/)?.[1])
    .filter(Boolean)
    .sort();
  const records = [];
  for (const id of panels) {
    const need = (name) => {
      const text = readText(join(raw, name));
      if (text == null) throw new Error(`missing OCR file raw/${name}`);
      return text;
    };
    records.push(
      ...assemblePanelRows(
        {
          id,
          placeLines: clusterLines(parseTsvWords(need(`${id}-place-psm6.tsv`))),
          countyLines: clusterLines(parseTsvWords(need(`${id}-county-psm6.tsv`))),
          pop1940Rows: parseRowReads(need(`${id}-pop1940-rows.tsv`)),
          pop1930Rows: parseRowReads(need(`${id}-pop1930-rows.tsv`)),
        },
        countyNames,
      ),
    );
  }
  return records;
}

// ---------------------------------------------------------------------------
// Matching: name + county evidence only.

function nameScore(seat, rec) {
  const ns = normalizeName(seat);
  const fullWords = String(rec.place).split(" ").length;
  let best = -1;
  for (const v of rec.nameVariants ?? [rec.place]) {
    if (!namesMatch(seat, v)) continue;
    const np = normalizeName(v);
    const score = ns === np ? 100
      : collapseOcrConfusions(ns) === collapseOcrConfusions(np) ? 90
      : Math.max(0, 80 - levenshtein(ns, np) * 10);
    // "Savannah" must beat the "Savannah" prefix of "Savannah Beach".
    best = Math.max(best, score - 5 * (fullWords - v.split(" ").length));
  }
  return best;
}

/**
 * The single place row whose name matches the seat and whose county list
 * includes the seat's county, chosen by name score alone. Populations come
 * from that row only. Equal-score rows with different populations are
 * ambiguous: the match stands but populations are nulled.
 */
export function matchSeatToPlaces(seat, county, places) {
  const hits = [];
  for (const rec of places) {
    const score = nameScore(seat, rec);
    if (score < 0) continue;
    if (!(rec.counties ?? []).some((c) => countyMatch(c, county))) continue;
    hits.push({ rec, score });
  }
  if (!hits.length) return null;
  hits.sort((a, b) => b.score - a.score);
  const best = hits[0].rec;
  const place = (best.nameVariants ?? []).find((v) => namesMatch(seat, v)) ?? best.place;
  const tied = hits.filter((h) => h.score === hits[0].score);
  const pops = new Set(tied.map((h) => `${h.rec.population1940}|${h.rec.population1930}`));
  if (pops.size > 1) {
    return { ...best, place, population1940: null, population1930: null, ocrConfidence: "unparsed", ambiguous: true };
  }
  return { ...best, place };
}

export function buildSeatEvidence(seats, counties, places) {
  const nameToId = new Map(counties.map((c) => [c.name, c.id]));
  const rows = [];
  for (const [county, seat] of Object.entries(seats)) {
    const countyId = nameToId.get(county);
    if (!countyId) continue;
    const hit = matchSeatToPlaces(seat, county, places);
    rows.push(hit
      ? {
          countyId,
          county,
          seat,
          matchedPlace: hit.place.replace(/\s+/g, " ").trim(),
          population1940: hit.population1940,
          population1930: hit.population1930,
          population1940Corroborated: null,
          urban1940: hit.urban1940,
          ocrConfidence: hit.ocrConfidence,
          seatStatusBasis: MATCHED_BASIS,
        }
      : {
          countyId,
          county,
          seat,
          matchedPlace: null,
          population1940: null,
          population1930: null,
          population1940Corroborated: null,
          urban1940: null,
          ocrConfidence: "unparsed",
          seatStatusBasis: UNMATCHED_BASIS,
        });
  }
  rows.sort((a, b) => (a.countyId < b.countyId ? -1 : a.countyId > b.countyId ? 1 : 0));
  return rows;
}

// ---------------------------------------------------------------------------
// Integrity: duplicates, implausible seats, independent corroboration.

/** 1940 values carried by two or more different matched places. */
export function findDuplicatePopulations(evidence) {
  const byValue = new Map();
  for (const e of evidence) {
    if (e.matchedPlace == null || e.population1940 == null) continue;
    const list = byValue.get(e.population1940) ?? [];
    list.push(e);
    byValue.set(e.population1940, list);
  }
  const dups = [];
  for (const [value, rows] of byValue) {
    const places = new Set(rows.map((r) => normalizeName(r.matchedPlace)));
    if (places.size > 1) dups.push({ population1940: value, seats: rows.map((r) => `${r.county}: ${r.seat}`) });
  }
  return dups.sort((a, b) => a.population1940 - b.population1940);
}

/**
 * Null populations that cannot be trusted and report why: seats below
 * MIN_SEAT_POPULATION, then every place sharing a 1940 value with a
 * different place. Returns new rows; the input is not mutated.
 */
export function applyIntegrityNulls(evidence) {
  const nulled = [];
  const clear = (e, reason) => {
    nulled.push({ county: e.county, seat: e.seat, population1940: e.population1940, reason });
    return { ...e, population1940: null, population1930: null, population1940Corroborated: null, ocrConfidence: "unparsed" };
  };
  let rows = evidence.map((e) =>
    e.population1940 != null && e.population1940 < MIN_SEAT_POPULATION ? clear(e, "seat-population-below-100") : e,
  );
  const dupValues = new Set(findDuplicatePopulations(rows).map((d) => d.population1940));
  rows = rows.map((e) =>
    e.population1940 != null && dupValues.has(e.population1940) ? clear(e, "duplicate-population1940") : e,
  );
  return { rows, nulled };
}

/**
 * True when `value` is the first number after a fuzzy match of `placeName`
 * on some text-layer line; false otherwise; null when `value` is null.
 * Digit groups split by commas/spaces ("302, 288") are joined first.
 */
export function corroboratePopulation(placeName, value, textLines) {
  if (value == null) return null;
  if (!placeName) return false;
  for (const line of textLines) {
    const s = String(line);
    const runs = [...s.matchAll(/[A-Za-z]+/g)];
    for (let i = 0; i < runs.length; i++) {
      const candidates = [[runs[i][0], runs[i]]];
      if (runs[i + 1]) candidates.push([`${runs[i][0]}${runs[i + 1][0]}`, runs[i + 1]]);
      for (const [name, last] of candidates) {
        if (!namesMatch(placeName, name)) continue;
        const num = s.slice(last.index + last[0].length).match(/\d{1,3}(?:\s*[,.]\s*\d{3})+|\d+/);
        if (num && Number(num[0].replace(/\D+/g, "")) === value) return true;
      }
    }
  }
  return false;
}

/**
 * The 1940 figure the text layer gives for this place when it disagrees
 * with `value`, else null. Only a tight "place  county  number" run counts:
 * no other word between place and county (so "Covington Mills" is not
 * Covington), the number within 30 characters of the county, delimited on
 * both sides (so "l, 746" and "4,.206" are skipped as unreadable), and not
 * equal to the row's own 1930 figure (the layer sometimes drops the 1940
 * column).
 */
export function textLayerContradiction(placeName, county, value, textLines, population1930 = null) {
  if (value == null || !placeName || !county) return null;
  for (const line of textLines) {
    const s = String(line);
    const runs = [...s.matchAll(/[A-Za-z]+/g)];
    for (let i = 0; i + 1 < runs.length; i++) {
      const place = runs[i], countyRun = runs[i + 1];
      if (!namesMatch(placeName, place[0]) || !countyMatch(countyRun[0], county)) continue;
      const rest = s.slice(countyRun.index + countyRun[0].length);
      const num = rest.match(/\d{1,3}(?:\s*[,.]\s*\d{3})+|\d+/);
      if (!num || num.index > 30) continue;
      const before = rest.slice(0, num.index);
      const after = rest.slice(num.index + num[0].length);
      if (/[A-Za-z]/.test(before) || /[lIoO,.]\s*$/.test(before) || /^[,.]?\d|^[,.]/.test(after)) continue;
      const n = Number(num[0].replace(/\D+/g, ""));
      if (n !== value && n !== population1930) return n;
    }
  }
  return null;
}

/**
 * Null 1940 populations the PDF text layer directly contradicts (see
 * textLayerContradiction) and report them.
 */
export function applyTextLayerVeto(evidence, textLayer) {
  const lines = String(textLayer ?? "").split(/\r?\n/);
  const nulled = [];
  const rows = evidence.map((e) => {
    const layer = textLayerContradiction(e.seat, e.county, e.population1940, lines, e.population1930);
    if (layer == null) return e;
    nulled.push({ county: e.county, seat: e.seat, population1940: e.population1940, textLayer: layer, reason: "contradicted-by-text-layer" });
    return { ...e, population1940: null, population1930: null, population1940Corroborated: null, ocrConfidence: "unparsed" };
  });
  return { rows, nulled };
}

export function applyCorroboration(evidence, textLayer) {
  const lines = String(textLayer ?? "").split(/\r?\n/);
  return evidence.map((e) => ({
    ...e,
    population1940Corroborated: e.population1940 == null
      ? null
      : corroboratePopulation(e.seat, e.population1940, lines) ||
        corroboratePopulation(e.matchedPlace, e.population1940, lines),
  }));
}

/** Validation constants read off print pages 254–256 by eye. */
export const SPOT_CHECKS = [
  { county: "Fulton", seat: "Atlanta", population1940: 302288, note: "p.254 Atlanta* {De Kalb / Fulton} 302,288 / 270,366" },
  { county: "Bibb", seat: "Macon", population1940: 57865, note: "p.255 Macon* Bibb 57,865 / 53,829" },
  { county: "Chatham", seat: "Savannah", population1940: 95996, note: "p.256 Savannah* Chatham 95,996 / 85,024" },
  { county: "Richmond", seat: "Augusta", population1940: 65919, note: "p.254 Augusta* Richmond 65,919 / 60,342" },
  { county: "Muscogee", seat: "Columbus", population1940: 53280, note: "p.255 Columbus* Muscogee 53,280 / 43,131" },
  { county: "Cobb", seat: "Marietta", population1940: 8667, note: "p.255 Marietta* Cobb 8,667 / 7,638" },
];

/** Exact spot checks: matched, and population1940 identical to the page. */
export function checkSpotChecks(evidence, spotChecks = SPOT_CHECKS) {
  return spotChecks.map((s) => {
    const row = evidence.find((e) => e.county === s.county);
    const parsed = row?.population1940 ?? null;
    return {
      ...s,
      matchedPlace: row?.matchedPlace ?? null,
      parsed,
      pass: row?.matchedPlace != null && parsed === s.population1940,
    };
  });
}

export function validateSeatEvidence(seats, counties, evidence) {
  const expectedIds = counties.map((c) => c.id).sort();
  const actualIds = evidence.map((e) => e.countyId);
  const sorted = actualIds.slice().sort();
  const countOk = evidence.length === expectedIds.length &&
    actualIds.length === new Set(actualIds).size &&
    actualIds.join() === sorted.join() &&
    sorted.join() === expectedIds.join();
  const unmatchedWrongBasis = evidence.filter(
    (e) => e.matchedPlace == null && e.seatStatusBasis !== UNMATCHED_BASIS,
  );
  const matchedWrongBasis = evidence.filter(
    (e) => e.matchedPlace != null && e.seatStatusBasis !== MATCHED_BASIS,
  );
  const spot = checkSpotChecks(evidence);
  const dups = findDuplicatePopulations(evidence);
  const small = evidence.filter((e) => e.population1940 != null && e.population1940 < MIN_SEAT_POPULATION);
  const badCorroboration = evidence.filter(
    (e) => (e.population1940 == null) !== (e.population1940Corroborated == null),
  );
  return [
    checkResult("oneRowPerCounty", countOk, { expected: expectedIds.length, actual: evidence.length }),
    checkResult("unmatchedUseUnverifiedBasis", unmatchedWrongBasis.length === 0, {
      count: unmatchedWrongBasis.length,
      sample: unmatchedWrongBasis.slice(0, 5).map((e) => e.county),
    }),
    checkResult("matchedUseConfirmedBasis", matchedWrongBasis.length === 0, {
      count: matchedWrongBasis.length,
    }),
    checkResult("spotChecksExact", spot.every((s) => s.pass), { spot }),
    checkResult("noDuplicatePopulation1940", dups.length === 0, { duplicates: dups }),
    checkResult("seatPopulationAtLeast100", small.length === 0, {
      seats: small.map((e) => `${e.county}: ${e.seat} ${e.population1940}`),
    }),
    checkResult("corroboratedNullIffPopulationNull", badCorroboration.length === 0, {
      count: badCorroboration.length,
    }),
  ];
}

export function buildReport(checks, evidence, nulled, sha256, bytes) {
  const matched = evidence.filter((e) => e.matchedPlace);
  const unmatched = evidence.filter((e) => !e.matchedPlace);
  const withPop = evidence.filter((e) => e.population1940 != null);
  const nullPop = matched.filter((e) => e.population1940 == null);
  return {
    ok: checks.every((c) => c.pass),
    ranAt: RAN_AT,
    checks,
    counts: {
      seats: evidence.length,
      matched: matched.length,
      unmatched: unmatched.length,
      population1940NonNull: withPop.length,
      population1940Corroborated: withPop.filter((e) => e.population1940Corroborated === true).length,
      matchedNullPopulation1940: nullPop.length,
      nulledByIntegrityChecks: nulled.length,
    },
    unmatchedSeats: unmatched.map((e) => `${e.county}: ${e.seat}`),
    nulledPopulations: nulled,
    matchedNullPopulationSeats: nullPop.map((e) => `${e.county}: ${e.seat}`),
    spotChecks: checks.find((c) => c.name === "spotChecksExact")?.details?.spot ?? SPOT_CHECKS,
    sourceSha256: sha256,
    sourceBytes: bytes,
  };
}

function main() {
  const parsed = parseArgs(process.argv);
  if (parsed.help) {
    console.log(USAGE);
    process.exit(0);
  }
  if (parsed.srcs.length !== 2) {
    console.error(USAGE);
    process.exit(2);
  }
  const [ocrDir, pdfPath] = parsed.srcs;
  let seats, geometry, pdfBytes, sha256, textLayer, places;
  try {
    seats = loadSeats();
    geometry = JSON.parse(readFileSync(GEOMETRY_PATH, "utf8"));
    pdfBytes = readFileSync(pdfPath);
    sha256 = createHash("sha256").update(pdfBytes).digest("hex");
    textLayer = execFileSync("pdftotext", ["-f", "21", "-l", "23", "-layout", pdfPath, "-"], {
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
    });
    places = parseOcrDirectory(ocrDir, (geometry.counties ?? []).map((c) => c.name));
  } catch (err) {
    console.error(JSON.stringify({ ok: false, error: "parse", message: String(err.message ?? err) }));
    process.exit(2);
  }
  const counties = geometry.counties ?? [];
  const vetoed = applyTextLayerVeto(buildSeatEvidence(seats, counties, places), textLayer);
  const { rows, nulled: integrityNulled } = applyIntegrityNulls(vetoed.rows);
  const nulled = [...vetoed.nulled, ...integrityNulled];
  const evidence = applyCorroboration(rows, textLayer);
  const checks = validateSeatEvidence(seats, counties, evidence);
  const report = buildReport(checks, evidence, nulled, sha256, pdfBytes.length);

  if (parsed.check) {
    console.log(JSON.stringify(report));
    process.exit(report.ok ? 0 : 1);
  }
  if (!report.ok) {
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }
  const out = {
    provenance: {
      preparedBy: "scripts/prepare-settlements.mjs",
      ranAt: RAN_AT,
      source: {
        name: SOURCE.name,
        url: SOURCE.url,
        sha256,
        bytes: pdfBytes.length,
        licence: SOURCE.licence,
      },
      method: METHOD,
      validationReport: report,
    },
    // population1930 is used internally as a sanity reference but is not
    // validated against the page, so it is not published.
    seats: evidence.map(({ population1930: _unvalidated, ...rest }) => rest),
  };
  writeFileSync(OUT_PATH, `${JSON.stringify(out, null, 2)}\n`);
  const c = report.counts;
  console.log(
    `wrote ${c.seats} seats: ${c.matched} matched, ${c.unmatched} unmatched, ` +
      `${c.population1940NonNull} with 1940 population, ${c.population1940Corroborated} corroborated`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();

