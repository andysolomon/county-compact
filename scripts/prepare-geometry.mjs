// Reproducible geometry preparation for the bundled Georgia county board.
//
// Input:  plotly/datasets "geojson-counties-fips.json" (FeatureCollection).
//         Filter features with properties.STATE === "13".
//         Source: U.S. Census Bureau cartographic boundary file (public-domain
//         federal data) redistributed at
//         https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json
// Output: src/data/georgia-counties.json
//         { provenance, counties, adjacency } — 159 Georgia polygons, a
//         symmetric adjacency graph, and provenance.validationReport.
// Expected counts: 159 counties; undirected shared-segment edges (no isolated
//         counties); MultiPolygon source parts kept as separate `polygons`
//         members (not collapsed).
// Precision: coordinates rounded to 4 decimal places.
//
// Invocations:
//   node scripts/prepare-geometry.mjs <path>
//     writes src/data/georgia-counties.json (same county/adjacency shape as
//     today, plus provenance.validationReport).
//   node scripts/prepare-geometry.mjs --check <path>
//     prints one JSON report {ok, ranAt, checks, counts} to stdout; writes no
//     file; exit 0 if ok, 1 on validation failure, 2 on parse errors.
//   node scripts/prepare-geometry.mjs --help
//     prints usage.
//
// Adjacency rule (unchanged): shared boundary segment; corner-only contacts
// excluded. This is MODERN geometry used as the crosswalk/mockup base
// (GDD §3.2). February 1, 1942 historical polygons remain Issue #2 work.
//
// The pure build/validate functions are exported so tests can run them on
// synthetic fixtures; main() runs only when this file is executed directly.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const EXPECTED_COUNT = 159;
const COORD_PRECISION = 4;
const COBB_ID = "US-GA-13067";
const OUT_PATH = "src/data/georgia-counties.json";
// Deterministic ranAt so bundled provenance.validationReport does not drift.
const RAN_AT = "2026-09-16T00:00:00.000Z";
const HISTORICAL_VERIFICATION =
  "Roster verified for 1942-02-01 against Newberry AHCBP and 1940 Census (see docs/historical-research/issue-1-roster.md). Geometry remains modern Census cartographic boundary file; 1942-dated polygons are Issue #2 work. Newberry license regime: CC BY-NC-SA 2.5 (bundled deed) or \"any lawful purpose, commercial or non-commercial\" per current download pages; not CC0 as docs/game-design.md §3.2 [S6] previously claimed (corrected in this pass).";
const ROSTER_REFERENCE = "docs/historical-research/issue-1-roster.json";
const SOURCE_VINTAGE =
  "unrecorded in plotly/datasets; Census cartographic boundary file, modern (post-2010) county set";

// Per-county historical status for the modern polygons (GDD §3.2: each
// difference from 1942 geometry is resolved or visibly documented).
export const HISTORICAL_STATUS = Object.freeze({
  undated: "boundary-change-undated-1915-1952",
  censusFootnote: "census-1940-footnote-change-not-in-newberry",
  noChange: "no-recorded-change-1942-modern-polygon",
});
// U-1: Newberry records a boundary change between 1915 and 1952 without a date
// that places it before or after 1942-02-01.
const U1_UNDATED_CHANGE = [
  "Baker", "Bartow", "Berrien", "Butts", "Calhoun", "Catoosa", "Clinch", "Colquitt",
  "Crawford", "Echols", "Gilmer", "Gordon", "Greene", "Haralson", "Henry", "Houston",
  "Irwin", "Jasper", "Long", "Lowndes", "Macon", "Monroe", "Newton", "Pickens", "Pike",
  "Polk", "Pulaski", "Randolph", "Spalding", "Stewart", "Taliaferro", "Tattnall",
  "Thomas", "Upson", "Walton", "Ware", "Webster", "Whitfield", "Wilcox",
];
// U-2: 1940 Census footnotes a change that Newberry does not record.
const U2_CENSUS_FOOTNOTE = ["Floyd", "Gordon", "Marion", "Talbot"];

// Corner-only contacts: share a vertex but no boundary segment. Intentionally
// absent from adjacency. Inspected against the modern Census extract.
export const CORNER_ONLY_CONTACTS = [
  ["US-GA-13013", "US-GA-13059"], // Barrow–Clarke
  ["US-GA-13013", "US-GA-13139"], // Barrow–Hall
  ["US-GA-13015", "US-GA-13227"], // Bartow–Pickens
  ["US-GA-13023", "US-GA-13319"], // Bleckley–Wilkinson
  ["US-GA-13043", "US-GA-13279"], // Candler–Toombs
  ["US-GA-13057", "US-GA-13129"], // Cherokee–Gordon
  ["US-GA-13107", "US-GA-13175"], // Emanuel–Laurens
  ["US-GA-13107", "US-GA-13267"], // Emanuel–Tattnall
  ["US-GA-13135", "US-GA-13157"], // Gwinnett–Jackson
  ["US-GA-13157", "US-GA-13219"], // Jackson–Oconee
  ["US-GA-13167", "US-GA-13283"], // Johnson–Treutlen
  ["US-GA-13175", "US-GA-13289"], // Laurens–Twiggs
];

const USAGE = `Usage:
  node scripts/prepare-geometry.mjs <path-to-geojson-counties-fips.json>
      Write src/data/georgia-counties.json (159 counties, 4-decimal coords).
  node scripts/prepare-geometry.mjs --check <path-to-geojson-counties-fips.json>
      Validate only. JSON report to stdout. Exit 0/1/2. Writes no file.
  node scripts/prepare-geometry.mjs --help
      Print this usage.`;

const round = (n) => Math.round(n * 1e4) / 1e4;
const key = (p) => `${p[0]},${p[1]}`;
const pairKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);

function parseArgs(argv) {
  const args = argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) return { help: true };
  const check = args.includes("--check");
  const src = args.find((a) => !a.startsWith("-"));
  return { help: false, check, src };
}

function checkResult(name, pass, details) {
  return details === undefined ? { name, pass } : { name, pass, details };
}

export function validateCount(actual, expected = EXPECTED_COUNT) {
  const pass = actual === expected;
  const details = { expected, actual };
  if (!pass) details.message = JSON.stringify({ error: "unexpected-county-count", expected, actual });
  return checkResult("count", pass, details);
}

function polygonsOf(geometry) {
  // Preserve MultiPolygon parts; wrap Polygon as a one-member MultiPolygon.
  return geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
}

export function buildCounties(features) {
  return features
    .map((f) => {
      const fips = `13${f.properties.COUNTY}`;
      const rings = polygonsOf(f.geometry).map((poly) =>
        poly.map((ring) => ring.map(([x, y]) => [round(x), round(y)])),
      );
      const sourceParts = polygonsOf(f.geometry);
      return {
        id: `US-GA-${fips}`,
        fips,
        name: f.properties.NAME,
        polygons: rings,
        sourceType: f.geometry.type,
        sourcePartCount: sourceParts.length,
      };
    })
    .sort((a, b) => a.fips.localeCompare(b.fips));
}

function stripSourceType(counties) {
  return counties.map(({ id, fips, name, polygons, centroid, bbox, historicalStatus }) => ({
    id, fips, name, polygons, centroid, bbox, historicalStatus,
  }));
}

export function assignHistoricalStatus(counties) {
  const names = new Set(counties.map((c) => c.name));
  const missing = [...U1_UNDATED_CHANGE, ...U2_CENSUS_FOOTNOTE].filter((n) => !names.has(n));
  if (missing.length) throw new Error(`historicalStatus names match no county: ${missing.join(", ")}`);
  const u1 = new Set(U1_UNDATED_CHANGE);
  const u2 = new Set(U2_CENSUS_FOOTNOTE);
  for (const c of counties) {
    // U-2 is checked first: Gordon is in both U-1 and U-2 and takes the U-2 flag.
    if (u2.has(c.name)) c.historicalStatus = HISTORICAL_STATUS.censusFootnote;
    else if (u1.has(c.name)) c.historicalStatus = HISTORICAL_STATUS.undated;
    else c.historicalStatus = HISTORICAL_STATUS.noChange;
  }
  return counties;
}

export function buildSegmentOwnership(counties) {
  const segOwners = new Map();
  for (const c of counties) {
    for (const poly of c.polygons) {
      for (const ring of poly) {
        for (let i = 0; i < ring.length - 1; i++) {
          const a = key(ring[i]);
          const b = key(ring[i + 1]);
          const k = a < b ? `${a}|${b}` : `${b}|${a}`;
          const set = segOwners.get(k) ?? new Set();
          set.add(c.id);
          segOwners.set(k, set);
        }
      }
    }
  }
  return segOwners;
}

export function buildVertexOwnership(counties) {
  const vertexOwners = new Map();
  for (const c of counties) {
    for (const poly of c.polygons) {
      for (const ring of poly) {
        for (const p of ring) {
          const k = key(p);
          const set = vertexOwners.get(k) ?? new Set();
          set.add(c.id);
          vertexOwners.set(k, set);
        }
      }
    }
  }
  return vertexOwners;
}

export function buildAdjacencyByCounty(segOwners, countyIds) {
  const adjacency = Object.fromEntries(countyIds.map((id) => [id, new Set()]));
  const segmentCounts = new Map();
  for (const owners of segOwners.values()) {
    if (owners.size < 2) continue;
    const ids = [...owners];
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = ids[i];
        const b = ids[j];
        adjacency[a].add(b);
        adjacency[b].add(a);
        const pk = pairKey(a, b);
        segmentCounts.set(pk, (segmentCounts.get(pk) ?? 0) + 1);
      }
    }
  }
  const lists = {};
  for (const id of countyIds) lists[id] = [...adjacency[id]].sort();
  return { adjacency: lists, segmentCounts };
}

export function addCentroidsAndBboxes(counties) {
  for (const c of counties) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    let area = 0, cx = 0, cy = 0;
    for (const poly of c.polygons) {
      const ring = poly[0];
      for (let i = 0; i < ring.length - 1; i++) {
        const [x0, y0] = ring[i];
        const [x1, y1] = ring[i + 1];
        const cross = x0 * y1 - x1 * y0;
        area += cross;
        cx += (x0 + x1) * cross;
        cy += (y0 + y1) * cross;
        for (const [x, y] of [ring[i]]) {
          if (x < minX) minX = x; if (y < minY) minY = y;
          if (x > maxX) maxX = x; if (y > maxY) maxY = y;
        }
      }
    }
    area /= 2;
    c.centroid = [round(cx / (6 * area)), round(cy / (6 * area))];
    c.bbox = [minX, minY, maxX, maxY];
  }
}

export function validatePolygons(counties) {
  let unclosed = 0, short = 0, empty = 0, outside = 0, collapsed = 0;
  for (const c of counties) {
    if (!c.polygons.length) { empty++; continue; }
    if (c.sourceType === "MultiPolygon" && c.polygons.length !== c.sourcePartCount) collapsed++;
    for (const poly of c.polygons) {
      if (!poly.length) { empty++; continue; }
      for (const ring of poly) {
        if (ring.length < 4) { short++; continue; }
        const first = ring[0];
        const last = ring[ring.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) unclosed++;
        const [minX, minY, maxX, maxY] = c.bbox;
        for (const [x, y] of ring) {
          if (x < minX || x > maxX || y < minY || y > maxY) { outside++; break; }
        }
      }
    }
  }
  const pass = unclosed === 0 && short === 0 && empty === 0 && outside === 0 && collapsed === 0;
  return checkResult("polygons", pass, {
    multipartPreserved: collapsed === 0,
    ringClosure: unclosed === 0,
    minRingVertices: short === 0,
    bboxContained: outside === 0,
    noEmptyPolygons: empty === 0,
    unclosed, short, empty, outside, collapsed,
  });
}

export function validateCoverage(counties) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const c of counties) {
    const [a, b, c2, d] = c.bbox;
    if (a < minX) minX = a;
    if (b < minY) minY = b;
    if (c2 > maxX) maxX = c2;
    if (d > maxY) maxY = d;
  }
  // The Atlantic coast is Georgia's eastern extent (about -80.84).
  const atlanticCoast = maxX >= -81.0;
  const outlineTouches = minY <= 30.7 && maxY >= 35.0;
  return checkResult("coverage", atlanticCoast && outlineTouches, {
    atlanticCoastMaxX: maxX,
    atlanticCoast: atlanticCoast,
    stateOutlineTouchesNonPlayable: outlineTouches,
    minX, minY, maxY,
  });
}

export function validateAdjacency(adjacency, countyIds) {
  const issues = [];
  let selfLoops = 0;
  let duplicates = 0;
  const isolated = [];
  for (const id of countyIds) {
    const neighbors = adjacency[id] ?? [];
    if (neighbors.length === 0) isolated.push(id);
    const seen = new Set();
    for (const n of neighbors) {
      if (n === id) selfLoops++;
      if (seen.has(n)) duplicates++;
      seen.add(n);
      const back = adjacency[n] ?? [];
      if (!back.includes(id)) issues.push(`${id} -> ${n} is not symmetric`);
    }
  }
  const seen = new Set([COBB_ID]);
  const q = [COBB_ID];
  while (q.length) {
    const id = q.pop();
    for (const n of adjacency[id] ?? []) if (!seen.has(n)) { seen.add(n); q.push(n); }
  }
  const reachable = seen.size;
  const pass =
    issues.length === 0 &&
    selfLoops === 0 &&
    duplicates === 0 &&
    isolated.length === 0 &&
    reachable === countyIds.length;
  return checkResult("adjacency", pass, {
    symmetric: issues.length === 0,
    noSelfLoops: selfLoops === 0,
    noDuplicates: duplicates === 0,
    nonEmpty: isolated.length === 0,
    isolated,
    transitiveCoverageFromCobb: reachable,
    expected: countyIds.length,
    asymmetry: issues.slice(0, 8),
  });
}

function inspectCornerOnly(vertexOwners, segmentCounts, nameById) {
  const found = new Map();
  for (const owners of vertexOwners.values()) {
    const ids = [...owners];
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const pk = pairKey(ids[i], ids[j]);
        if ((segmentCounts.get(pk) ?? 0) > 0) continue;
        found.set(pk, (found.get(pk) ?? 0) + 1);
      }
    }
  }
  return [...found.keys()].sort().map((pk) => {
    const [a, b] = pk.split("|");
    return { a, b, names: `${nameById.get(a)}–${nameById.get(b)}` };
  });
}

export function validateSharedBoundaryRule(adjacency, vertexOwners, segmentCounts, nameById) {
  const documented = CORNER_ONLY_CONTACTS.map(([a, b]) => pairKey(a, b));
  const documentedSet = new Set(documented);
  const present = [];
  for (const pk of documented) {
    const [a, b] = pk.split("|");
    const ab = (adjacency[a] ?? []).includes(b);
    const ba = (adjacency[b] ?? []).includes(a);
    if (ab || ba) present.push({ a, b, names: `${nameById.get(a)}–${nameById.get(b)}` });
  }
  const inspected = inspectCornerOnly(vertexOwners, segmentCounts, nameById);
  const undocumented = inspected.filter((p) => !documentedSet.has(pairKey(p.a, p.b)));
  const pass = present.length === 0 && undocumented.length === 0;
  return checkResult("sharedBoundaryRule", pass, {
    rule: "shared boundary segment; corner-only contacts excluded",
    documentedCornerOnly: CORNER_ONLY_CONTACTS.map(([a, b]) => ({
      a, b, names: `${nameById.get(a)}–${nameById.get(b)}`,
    })),
    inspectedCornerOnly: inspected,
    incorrectlyAdjacent: present,
    undocumentedCornerOnly: undocumented,
  });
}

// ---------------------------------------------------------------------------
// Geometry validity, topology, overlaps and gaps.
//
// All three checks work on integer coordinates (degrees × 1e4). Coordinates are
// already rounded to 4 decimals, so the conversion is exact and orientation
// tests and shoelace areas are exact in doubles (values stay far below 2^53).
// No floating tolerance is needed.
const SCALE = 1e4;
const GRID_CELL = 500; // 0.05 degrees in integer units
const SAMPLE = 8;
const AREA_REL_TOLERANCE = 1e-4; // 0.01 %

const toInt = (v) => Math.round(v * SCALE);
const ptKey = (x, y) => `${x},${y}`;
const segKey = (ax, ay, bx, by) =>
  ax < bx || (ax === bx && ay < by) ? `${ax},${ay}|${bx},${by}` : `${bx},${by}|${ax},${ay}`;
const toDegrees = (x, y) => [x / SCALE, y / SCALE];
const areaToDegrees = (a) => a / (SCALE * SCALE);

function intRing(ring) {
  return ring.map(([x, y]) => [toInt(x), toInt(y)]);
}

function signedArea(ring) {
  let s = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    s += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return s / 2;
}

function orient(ax, ay, bx, by, cx, cy) {
  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
}

const opposite = (p, q) => (p > 0 && q < 0) || (p < 0 && q > 0);

// Proper crossing: the segments meet at one point interior to both. Shared
// endpoints, T-junctions and collinear overlaps are not proper crossings.
function properCross(e, f) {
  return (
    opposite(orient(e.ax, e.ay, e.bx, e.by, f.ax, f.ay), orient(e.ax, e.ay, e.bx, e.by, f.bx, f.by)) &&
    opposite(orient(f.ax, f.ay, f.bx, f.by, e.ax, e.ay), orient(f.ax, f.ay, f.bx, f.by, e.bx, e.by))
  );
}

function collectEdges(counties) {
  const edges = [];
  let ringId = 0;
  counties.forEach((c, ci) => {
    for (const poly of c.polygons) {
      for (const ring of poly) {
        const r = intRing(ring);
        const n = r.length - 1;
        for (let i = 0; i < n; i++) {
          const [ax, ay] = r[i];
          const [bx, by] = r[i + 1];
          edges.push({
            ci, ringId, i, n, ax, ay, bx, by,
            minX: Math.min(ax, bx), minY: Math.min(ay, by),
            maxX: Math.max(ax, bx), maxY: Math.max(ay, by),
          });
        }
        ringId++;
      }
    }
  });
  return edges;
}

const crossingCache = new WeakMap();

// Grid spatial hash. Each candidate pair is tested once: in the cell holding
// the lower-left corner of the two edges' bbox intersection.
function findProperCrossings(counties) {
  const cached = crossingCache.get(counties);
  if (cached) return cached;
  const edges = collectEdges(counties);
  const cell = (v) => Math.floor(v / GRID_CELL);
  const grid = new Map();
  for (const e of edges) {
    for (let gx = cell(e.minX); gx <= cell(e.maxX); gx++) {
      for (let gy = cell(e.minY); gy <= cell(e.maxY); gy++) {
        const k = `${gx},${gy}`;
        const list = grid.get(k);
        if (list) list.push(e);
        else grid.set(k, [e]);
      }
    }
  }
  const result = { selfIntersections: [], sameCountyRingCrossings: [], crossCounty: [] };
  const counts = { selfIntersections: 0, sameCountyRingCrossings: 0, crossCounty: 0 };
  for (const [k, list] of grid) {
    const [gx, gy] = k.split(",").map(Number);
    for (let a = 0; a < list.length; a++) {
      const e = list[a];
      for (let b = a + 1; b < list.length; b++) {
        const f = list[b];
        const ix = Math.max(e.minX, f.minX);
        const iy = Math.max(e.minY, f.minY);
        if (ix > Math.min(e.maxX, f.maxX) || iy > Math.min(e.maxY, f.maxY)) continue;
        if (cell(ix) !== gx || cell(iy) !== gy) continue;
        if (e.ringId === f.ringId) {
          const d = Math.abs(e.i - f.i);
          if (d === 1 || d === e.n - 1) continue; // adjacent edges of the ring
        }
        if (!properCross(e, f)) continue;
        const kind =
          e.ci !== f.ci ? "crossCounty" : e.ringId === f.ringId ? "selfIntersections" : "sameCountyRingCrossings";
        counts[kind]++;
        if (result[kind].length < SAMPLE) {
          result[kind].push({
            a: counties[e.ci].id,
            b: counties[f.ci].id,
            edgeA: [toDegrees(e.ax, e.ay), toDegrees(e.bx, e.by)],
            edgeB: [toDegrees(f.ax, f.ay), toDegrees(f.bx, f.by)],
          });
        }
      }
    }
  }
  const out = { counts, samples: result, edgeCount: edges.length };
  crossingCache.set(counties, out);
  return out;
}

export function validateGeometryValidity(counties) {
  let rings = 0;
  const zeroArea = [];
  for (const c of counties) {
    c.polygons.forEach((poly, pi) => {
      poly.forEach((ring, ri) => {
        rings++;
        if (signedArea(intRing(ring)) === 0) zeroArea.push({ id: c.id, polygon: pi, ring: ri });
      });
    });
  }
  const { counts, samples } = findProperCrossings(counties);
  const pass = zeroArea.length === 0 && counts.selfIntersections === 0 && counts.sameCountyRingCrossings === 0;
  return checkResult("geometryValidity", pass, {
    rings,
    zeroAreaRings: zeroArea.length,
    selfIntersections: counts.selfIntersections,
    sameCountyRingCrossings: counts.sameCountyRingCrossings,
    zeroAreaSample: zeroArea.slice(0, SAMPLE),
    selfIntersectionSample: samples.selfIntersections,
    sameCountyRingCrossingSample: samples.sameCountyRingCrossings,
  });
}

// Undirected segment -> occurrences. Zero-length segments (repeated vertices)
// carry no boundary and are skipped. Rings are oriented shell CCW / hole CW so
// single-owner segments keep a consistent direction for loop stitching.
function buildSegmentOccurrences(counties) {
  const segs = new Map();
  let zeroLength = 0;
  for (const c of counties) {
    for (const poly of c.polygons) {
      poly.forEach((ring, ri) => {
        let r = intRing(ring);
        const area = signedArea(r);
        if ((ri === 0 && area < 0) || (ri > 0 && area > 0)) r = [...r].reverse();
        for (let i = 0; i < r.length - 1; i++) {
          const [ax, ay] = r[i];
          const [bx, by] = r[i + 1];
          if (ax === bx && ay === by) { zeroLength++; continue; }
          const k = segKey(ax, ay, bx, by);
          const entry = segs.get(k);
          if (entry) entry.owners.push(c.id);
          else segs.set(k, { owners: [c.id], ax, ay, bx, by });
        }
      });
    }
  }
  return { segs, zeroLength };
}

export function validateTopology(counties) {
  const { segs, zeroLength } = buildSegmentOccurrences(counties);
  let maxOwners = 0;
  let overTwo = 0;
  let duplicates = 0;
  const overTwoSample = [];
  const duplicateSample = [];
  for (const [k, { owners }] of segs) {
    const distinct = new Set(owners);
    if (distinct.size > maxOwners) maxOwners = distinct.size;
    if (distinct.size > 2) {
      overTwo++;
      if (overTwoSample.length < SAMPLE) overTwoSample.push({ segment: k, owners: [...distinct] });
    }
    if (distinct.size !== owners.length) {
      duplicates++;
      if (duplicateSample.length < SAMPLE) duplicateSample.push({ segment: k, owners });
    }
  }
  const { counts, samples, edgeCount: edges } = findProperCrossings(counties);
  const pass = overTwo === 0 && duplicates === 0 && counts.crossCounty === 0;
  return checkResult("topology", pass, {
    edges,
    uniqueSegments: segs.size,
    zeroLengthEdges: zeroLength,
    maxOwnersPerSegment: maxOwners,
    segmentsOverTwoOwners: overTwo,
    duplicateSegmentsWithinCounty: duplicates,
    crossCountyCrossings: counts.crossCounty,
    overTwoOwnersSample: overTwoSample,
    duplicateSegmentSample: duplicateSample,
    crossCountyCrossingSample: samples.crossCounty,
  });
}

// Stitch directed single-owner segments into closed loops.
function stitchLoops(single) {
  const out = new Map();
  for (const s of single) {
    const k = ptKey(s.ax, s.ay);
    const list = out.get(k);
    if (list) list.push(s);
    else out.set(k, [s]);
  }
  const loops = [];
  let openChains = 0;
  for (const s of single) {
    if (s.used) continue;
    s.used = true;
    const startKey = ptKey(s.ax, s.ay);
    const ring = [[s.ax, s.ay], [s.bx, s.by]];
    let cur = ptKey(s.bx, s.by);
    let closed = cur === startKey;
    while (!closed) {
      const next = (out.get(cur) ?? []).find((t) => !t.used);
      if (!next) break;
      next.used = true;
      ring.push([next.bx, next.by]);
      cur = ptKey(next.bx, next.by);
      closed = cur === startKey;
    }
    if (closed) loops.push(ring);
    else openChains++;
  }
  return { loops, openChains };
}

function onSegment(px, py, ax, ay, bx, by) {
  return (
    orient(ax, ay, bx, by, px, py) === 0 &&
    px >= Math.min(ax, bx) && px <= Math.max(ax, bx) &&
    py >= Math.min(ay, by) && py <= Math.max(ay, by)
  );
}

// 1 strictly inside, -1 strictly outside, 0 on the boundary.
function pointInRing(px, py, ring) {
  let inside = false;
  for (let i = 0; i < ring.length - 1; i++) {
    const [ax, ay] = ring[i];
    const [bx, by] = ring[i + 1];
    if (onSegment(px, py, ax, ay, bx, by)) return 0;
    if ((ay > py) !== (by > py)) {
      const t = orient(ax, ay, bx, by, px, py);
      // Crossing to the right of p: sign of orient depends on edge direction.
      if (by > ay ? t > 0 : t < 0) inside = !inside;
    }
  }
  return inside ? 1 : -1;
}

function countyArea(c) {
  let total = 0;
  for (const poly of c.polygons) {
    poly.forEach((ring, ri) => {
      const a = Math.abs(signedArea(intRing(ring)));
      total += ri === 0 ? a : -a;
    });
  }
  return total;
}

export function validateOverlapsAndGaps(counties) {
  const { segs } = buildSegmentOccurrences(counties);
  const single = [...segs.values()]
    .filter((s) => s.owners.length === 1)
    .map((s) => ({ ax: s.ax, ay: s.ay, bx: s.bx, by: s.by, used: false }));
  const { loops, openChains } = stitchLoops(single);
  const withArea = loops.map((ring) => ({ ring, area: Math.abs(signedArea(ring)) }));
  withArea.sort((a, b) => b.area - a.area);
  const mainland = withArea[0];
  const gaps = [];
  let islandArea = 0;
  let islands = 0;
  for (const loop of withArea.slice(1)) {
    // A loop is inside the outline if any vertex or edge midpoint is strictly
    // inside it; islands touch the outline at most on its boundary.
    let inside = false;
    for (let i = 0; i < loop.ring.length - 1 && !inside; i++) {
      const [ax, ay] = loop.ring[i];
      const [bx, by] = loop.ring[i + 1];
      inside =
        pointInRing(ax, ay, mainland.ring) === 1 ||
        pointInRing((ax + bx) / 2, (ay + by) / 2, mainland.ring) === 1;
    }
    if (inside) gaps.push(loop);
    else { islands++; islandArea += loop.area; }
  }
  const countyTotal = counties.reduce((s, c) => s + countyArea(c), 0);
  const outlineTotal = (mainland?.area ?? 0) + islandArea;
  const relativeError = outlineTotal === 0 ? Infinity : Math.abs(countyTotal - outlineTotal) / outlineTotal;
  const areaBalanced = relativeError <= AREA_REL_TOLERANCE;
  const pass = mainland !== undefined && openChains === 0 && gaps.length === 0 && areaBalanced;
  return checkResult("overlapsAndGaps", pass, {
    singleOwnerSegments: single.length,
    loops: loops.length,
    openChains,
    mainlandOutlineArea: areaToDegrees(mainland?.area ?? 0),
    mainlandOutlineVertices: mainland ? mainland.ring.length - 1 : 0,
    islands,
    islandArea: areaToDegrees(islandArea),
    gaps: gaps.length,
    gapSample: gaps.slice(0, SAMPLE).map((g) => ({
      area: areaToDegrees(g.area),
      firstVertex: toDegrees(g.ring[0][0], g.ring[0][1]),
      vertices: g.ring.length - 1,
    })),
    countyAreaSum: areaToDegrees(countyTotal),
    outlinePlusIslandArea: areaToDegrees(outlineTotal),
    areaRelativeError: relativeError,
    areaRelativeTolerance: AREA_REL_TOLERANCE,
    areaBalanced,
  });
}

function edgeCount(adjacency) {
  return Object.values(adjacency).reduce((s, n) => s + n.length, 0) / 2;
}

function isolatedIds(adjacency) {
  return Object.entries(adjacency).filter(([, n]) => n.length === 0).map(([id]) => id);
}

export function buildReport(checks, counties, adjacency, multipart) {
  const ok = checks.every((c) => c.pass);
  return {
    ok,
    ranAt: RAN_AT,
    checks,
    counts: {
      counties: counties.length,
      edges: edgeCount(adjacency),
      isolated: isolatedIds(adjacency).length,
      multipart,
    },
  };
}

function main() {
  const parsed = parseArgs(process.argv);
  if (parsed.help) {
    console.log(USAGE);
    process.exit(0);
  }
  if (!parsed.src) {
    console.error(USAGE);
    process.exit(2);
  }

  let all;
  let sourceSha256;
  try {
    const bytes = readFileSync(parsed.src);
    sourceSha256 = createHash("sha256").update(bytes).digest("hex");
    all = JSON.parse(bytes.toString("utf8"));
  } catch (err) {
    console.error(JSON.stringify({ ok: false, error: "parse", message: String(err.message ?? err) }));
    process.exit(2);
  }
  if (!all || !Array.isArray(all.features)) {
    console.error(JSON.stringify({ ok: false, error: "parse", message: "expected a GeoJSON FeatureCollection" }));
    process.exit(2);
  }

  const ga = all.features.filter((f) => f.properties.STATE === "13");
  const countCheck = validateCount(ga.length);
  const counties = assignHistoricalStatus(buildCounties(ga));
  const sourceTypes = counties.map((c) => c.sourceType);
  const multipart = sourceTypes.filter((t) => t === "MultiPolygon").length;
  addCentroidsAndBboxes(counties);
  const segOwners = buildSegmentOwnership(counties);
  const { adjacency, segmentCounts } = buildAdjacencyByCounty(
    segOwners,
    counties.map((c) => c.id),
  );
  const vertexOwners = buildVertexOwnership(counties);
  const nameById = new Map(counties.map((c) => [c.id, c.name]));

  const checks = [
    countCheck,
    validatePolygons(counties),
    validateCoverage(counties),
    validateAdjacency(adjacency, counties.map((c) => c.id)),
    validateSharedBoundaryRule(adjacency, vertexOwners, segmentCounts, nameById),
    validateGeometryValidity(counties),
    validateTopology(counties),
    validateOverlapsAndGaps(counties),
  ];
  const report = buildReport(checks, counties, adjacency, multipart);

  if (parsed.check) {
    console.log(JSON.stringify(report));
    process.exit(report.ok ? 0 : 1);
  }

  if (!report.ok) {
    console.log(JSON.stringify(report));
    process.exit(1);
  }

  const out = {
    provenance: {
      source: "U.S. Census Bureau cartographic boundary file via plotly/datasets geojson-counties-fips.json",
      sourceUrl: "https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json",
      sourceSha256,
      sourceVintage: SOURCE_VINTAGE,
      rights: "Public-domain U.S. federal data; retain Census notices.",
      referenceDate: "1942-02-01",
      historicalVerification: HISTORICAL_VERIFICATION,
      rosterReference: ROSTER_REFERENCE,
      preparedBy: "scripts/prepare-geometry.mjs",
      coordinatePrecision: COORD_PRECISION,
      adjacencyRule: "shared boundary segment; corner-only contacts excluded",
      validationReport: report,
    },
    counties: stripSourceType(counties),
    adjacency,
  };
  writeFileSync(OUT_PATH, JSON.stringify(out));
  console.log(`wrote ${counties.length} counties, ${report.counts.edges} adjacency edges`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
