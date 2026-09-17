// Reproducible movement-edge and river-crossing preparation (CC-03).
//
// Inputs: Natural Earth 10m hydrography (public domain), both GeoJSON:
//   <centerlines>    ne_10m_rivers_lake_centerlines.geojson
//   <north-america>  ne_10m_rivers_north_america.geojson
//   optional TIGER/Line 2023 LINEARWATER directory (public domain; zips or
//     extracted .shp/.dbf). Named features only; TIGER files are not bundled.
//   optional TIGER/Line 2023 AREAWATER directory (public domain; polygon zips or
//     extracted .shp/.dbf). Wide main-stem reaches (e.g. the Chattahoochee
//     between Cobb and Fulton) are polygons here, not LINEARWATER lines; their
//     ring edges are treated as river lines under the same normalised name.
//   plus the bundled src/data/georgia-counties.json (counties and adjacency).
// Output: src/data/movement-edges.json
//   { provenance, edges } — one passable movement edge per undirected
//   geographic adjacency edge, sorted by (a, b) with a < b, each with an
//   optional derived river-crossing tag. No per-edge geometry is stored.
//
// Invocations:
//   node scripts/prepare-movement.mjs <centerlines> <north-america> [tiger-linear-dir [tiger-area-dir]]
//     writes src/data/movement-edges.json (with provenance.validationReport).
//   node scripts/prepare-movement.mjs --check <centerlines> <north-america> [tiger-linear-dir [tiger-area-dir]]
//     prints one JSON report {ok, ranAt, checks, counts} to stdout; writes no
//     file; exit 0 if ok, 1 on validation failure, 2 on parse errors.
//   node scripts/prepare-movement.mjs --help
//     prints usage.
//
// Crossing rule: the shared boundary of (a, b) is the set of boundary segments
// owned by both counties (exact coordinate keys, as in prepare-geometry). Each
// shared segment is subdivided into pieces no longer than TOLERANCE; a piece
// counts toward a river when its midpoint lies within TOLERANCE degrees of any
// segment of that river's lines. For TIGER only, a shared segment also counts
// fully toward a river when BOTH its endpoints are within TOLERANCE of that
// river (see riverFractions). Natural Earth tags the river with the highest
// length fraction when that fraction is >= 0.5. With TIGER, named features
// whose normalised FULLNAME contains "River" (Lake/Reservoir/Creek/Branch-only
// names excluded) are scored the same way; the edge is tagged if either source
// meets MIN_FRACTION. The label is the TIGER name without a trailing " River"
// when TIGER tags it, otherwise the Natural Earth name. Each source's best
// river and fraction is recorded in crossing.sources whenever that fraction is
// >= NEAR_MISS_MIN, so disagreements stay inspectable.
//
// The pure build/validate functions are exported so tests can run them on
// synthetic fixtures; main() runs only when this file is executed directly.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { CORNER_ONLY_CONTACTS, buildSegmentOwnership } from "./prepare-geometry.mjs";

const GEOMETRY_PATH = "src/data/georgia-counties.json";
const OUT_PATH = "src/data/movement-edges.json";
// Deterministic ranAt so bundled provenance.validationReport does not drift.
const RAN_AT = "2026-09-16T00:00:00.000Z";
const COBB_ID = "US-GA-13067";
const FULTON_ID = "US-GA-13121";
const GLYNN_ID = "US-GA-13127";
const MCINTOSH_ID = "US-GA-13191";

// Distance tolerance in plain degrees (no cos-latitude scaling; at Georgia's
// latitude 0.02° is about 2.2 km north-south and 1.9 km east-west).
// Chosen empirically over 0.01–0.03 (tagged edges: 0.01 → 59, 0.02 → 75,
// 0.03 → 88). Natural Earth 10m centerlines are generalised for 1:10M display
// and drift ~1–2 km from the Census river boundaries. At 0.01° long known river
// boundaries drop below 0.5 (Forsyth–Hall and Fulton–Gwinnett on the
// Chattahoochee, Clarke–Jackson on the Oconee, Camden–Charlton on the Satilla,
// Brooks–Lowndes on the Withlacoochee); 0.02° recovers them. At 0.03° the new
// tags are mostly headwater or parallel-valley artefacts (Dawson–Fannin
// Coosawattee, Haralson–Paulding Tallapoosa, Cherokee–Dawson Etowah). The
// perpendicular-crossing guard stays tight: a river crossing a boundary
// contributes at most about 2 × TOLERANCE of boundary length.
export const TOLERANCE = 0.02;
export const MIN_FRACTION = 0.5;
export const NEAR_MISS_MIN = 0.3;
export const TIE_EPSILON = 0.01;
const CLIP_MARGIN = 0.1;
const GRID_CELL = 0.05;
const FRACTION_DP = 4;

export const PASSABLE_BASIS = "scenario-abstraction: geographic adjacency assumed road-connected";
export const CROSSING_BASIS = "derived: Natural Earth 10m hydrography";
export const CROSSING_BASIS_TIGER = "derived: TIGER/Line 2023 linear water";
export const CROSSING_BASIS_BOTH = "derived: Natural Earth 10m and TIGER/Line 2023 linear water";
export const CROSSING_BASIS_TIGER_AREA = "derived: TIGER/Line 2023 linear and area water";
export const CROSSING_BASIS_BOTH_AREA = "derived: Natural Earth 10m and TIGER/Line 2023 linear and area water";
const LICENCE_QUOTE =
  "All versions of Natural Earth raster + vector map data found on this website are in the public domain.";
const TIGER_LICENCE = "US Government work, public domain";
const TIGER_URL_PATTERN =
  "https://www2.census.gov/geo/tiger/TIGER2023/LINEARWATER/tl_2023_<fips>_linearwater.zip";
const TIGER_AREA_URL_PATTERN =
  "https://www2.census.gov/geo/tiger/TIGER2023/AREAWATER/tl_2023_<fips>_areawater.zip";
const TIGER_KINDS = Object.freeze({
  linearwater: { zip: /^tl_2023_\d{5}_linearwater\.zip$/, shp: /^tl_2023_\d{5}_linearwater\.shp$/ },
  areawater: { zip: /^tl_2023_\d{5}_areawater\.zip$/, shp: /^tl_2023_\d{5}_areawater\.shp$/ },
});
const UNZIP_MAX_BUFFER = 64 * 1024 * 1024;
// Whole-token expansions observed in TIGER/Line 2023 LINEARWATER FULLNAME values.
const TIGER_NAME_ABBREVS = Object.freeze({
  Riv: "River",
  Crk: "Creek",
  Br: "Branch",
  Brk: "Brook",
  Lk: "Lake",
  Lks: "Lakes",
  Frk: "Fork",
  Strm: "Stream",
  Cnl: "Canal",
  Chnnl: "Channel",
  Spg: "Spring",
  Drn: "Drain",
  Holw: "Hollow",
  Res: "Reservoir",
});
const SOURCES = [
  {
    name: "Natural Earth 10m rivers and lake centerlines",
    url: "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_rivers_lake_centerlines.geojson",
  },
  {
    name: "Natural Earth 10m rivers, North America supplement",
    url: "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_rivers_north_america.geojson",
  },
];
const SANITY_RIVERS = ["Chattahoochee", "Flint", "Ocmulgee", "Oconee", "Altamaha"];
// Rivers that form Georgia's state border; tags on internal edges deserve review.
const STATE_BORDER_RIVERS = ["Savannah", "St. Marys", "Chattahoochee"];

const USAGE = `Usage:
  node scripts/prepare-movement.mjs <centerlines.geojson> <north-america.geojson> [tiger-linearwater-dir [tiger-areawater-dir]]
      Write src/data/movement-edges.json from Natural Earth 10m rivers, optionally
      corroborated with TIGER/Line 2023 LINEARWATER and AREAWATER (directories of
      zips or .shp/.dbf). AREAWATER requires LINEARWATER.
  node scripts/prepare-movement.mjs --check <centerlines.geojson> <north-america.geojson> [tiger-linearwater-dir [tiger-areawater-dir]]
      Validate only. JSON report to stdout. Exit 0/1/2. Writes no file.
  node scripts/prepare-movement.mjs --help
      Print this usage.`;

const pairKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
const roundFraction = (f) => Math.round(f * 10 ** FRACTION_DP) / 10 ** FRACTION_DP;

function asBuffer(buffer) {
  if (Buffer.isBuffer(buffer)) return buffer;
  return Buffer.from(buffer);
}

function viewOf(buffer) {
  const buf = asBuffer(buffer);
  return new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
}

function latin1(view, start, end) {
  let s = "";
  for (let i = start; i < end; i++) s += String.fromCharCode(view.getUint8(i));
  return s;
}

const POLYLINE_TYPES = new Set([3, 13, 23]);
const POLYGON_TYPES = new Set([5, 15, 25]);

// ESRI polyline shapefile (.shp): shape types 3 (PolyLine), 13 (PolyLineZ),
// 23 (PolyLineM). Returns one entry per record; each entry is that record's
// parts as coordinate lines. Null and unsupported records are empty arrays.
export function parseShpPolylines(buffer) {
  return parseShpParts(buffer, POLYLINE_TYPES);
}

// ESRI polygon shapefile (.shp): shape types 5 (Polygon), 15 (PolygonZ),
// 25 (PolygonM). Same layout as polylines; each part is a closed ring, returned
// as a coordinate line so its edges can be indexed like river lines.
export function parseShpPolygons(buffer) {
  return parseShpParts(buffer, POLYGON_TYPES);
}

// Polyline or polygon records, whichever the file holds.
export function parseShpLines(buffer) {
  return parseShpParts(buffer, new Set([...POLYLINE_TYPES, ...POLYGON_TYPES]));
}

function parseShpParts(buffer, types) {
  const view = viewOf(buffer);
  if (view.byteLength < 100) throw new Error("shp: truncated header");
  if (view.getInt32(0, false) !== 9994) throw new Error("shp: bad file code");
  const records = [];
  let offset = 100;
  while (offset + 8 <= view.byteLength) {
    const contentWords = view.getInt32(offset + 4, false);
    const contentStart = offset + 8;
    const next = contentStart + contentWords * 2;
    if (next > view.byteLength) throw new Error("shp: truncated record");
    const type = view.getInt32(contentStart, true);
    if (types.has(type)) {
      const numParts = view.getInt32(contentStart + 36, true);
      const numPoints = view.getInt32(contentStart + 40, true);
      const partsStart = contentStart + 44;
      const pointsStart = partsStart + numParts * 4;
      if (pointsStart + numPoints * 16 > next) throw new Error("shp: truncated points");
      const parts = [];
      for (let i = 0; i < numParts; i++) parts.push(view.getInt32(partsStart + i * 4, true));
      const points = [];
      for (let i = 0; i < numPoints; i++) {
        const x = view.getFloat64(pointsStart + i * 16, true);
        const y = view.getFloat64(pointsStart + i * 16 + 8, true);
        points.push([x, y]);
      }
      const lines = [];
      for (let i = 0; i < numParts; i++) {
        const a = parts[i];
        const b = i + 1 < numParts ? parts[i + 1] : numPoints;
        if (b - a >= 2) lines.push(points.slice(a, b));
      }
      records.push(lines);
    } else {
      records.push([]);
    }
    offset = next;
  }
  return records;
}

export function parseDbf(buffer) {
  const view = viewOf(buffer);
  if (view.byteLength < 32) throw new Error("dbf: truncated header");
  const nrec = view.getUint32(4, true);
  const hlen = view.getUint16(8, true);
  const rlen = view.getUint16(10, true);
  const fields = [];
  let off = 32;
  while (off + 32 <= hlen && view.getUint8(off) !== 0x0d) {
    let name = latin1(view, off, off + 11);
    const z = name.indexOf("\0");
    if (z >= 0) name = name.slice(0, z);
    fields.push({ name: name.trim(), len: view.getUint8(off + 16) });
    off += 32;
  }
  const records = [];
  for (let i = 0; i < nrec; i++) {
    const start = hlen + i * rlen;
    if (start + rlen > view.byteLength) throw new Error("dbf: truncated record");
    const rec = { deleted: view.getUint8(start) === 0x2a };
    let pos = start + 1;
    for (const f of fields) {
      rec[f.name] = latin1(view, pos, pos + f.len).trim();
      pos += f.len;
    }
    records.push(rec);
  }
  return records;
}

export function normaliseTigerName(fullName) {
  const trimmed = typeof fullName === "string" ? fullName.trim() : "";
  if (!trimmed) return "";
  return trimmed.split(/\s+/).map((tok) => TIGER_NAME_ABBREVS[tok] ?? tok).join(" ");
}

export function isTigerRiverName(name) {
  return typeof name === "string" && /\bRiver\b/.test(name);
}

export function tigerRiverLabel(normalisedName) {
  return normalisedName.replace(/\s+River$/, "");
}

export function collectTigerRiversFromBuffers(pairs) {
  const rivers = new Map();
  for (const { shp, dbf } of pairs) {
    const geoms = parseShpLines(shp);
    const rows = parseDbf(dbf);
    const n = Math.min(geoms.length, rows.length);
    for (let i = 0; i < n; i++) {
      const row = rows[i];
      if (!row || row.deleted) continue;
      const normalised = normaliseTigerName(row.FULLNAME);
      if (!isTigerRiverName(normalised)) continue;
      const lines = geoms[i];
      if (!lines?.length) continue;
      const label = tigerRiverLabel(normalised);
      const list = rivers.get(label) ?? [];
      list.push(...lines);
      rivers.set(label, list);
    }
  }
  return rivers;
}

function unzipMember(zipPath, member) {
  return execFileSync("unzip", ["-p", zipPath, member], { maxBuffer: UNZIP_MAX_BUFFER });
}

function loadShpDbfFromZip(zipPath) {
  const base = zipPath.replace(/^.*[/\\]/, "").replace(/\.zip$/i, "");
  return { shp: unzipMember(zipPath, `${base}.shp`), dbf: unzipMember(zipPath, `${base}.dbf`) };
}

function loadShpDbfFromShp(shpPath) {
  return { shp: readFileSync(shpPath), dbf: readFileSync(shpPath.replace(/\.shp$/i, ".dbf")) };
}

function loadTigerWater(dir, kind) {
  const { zip: zipRe, shp: shpRe } = TIGER_KINDS[kind];
  const entries = readdirSync(dir).sort();
  const zips = entries.filter((f) => zipRe.test(f));
  const hasher = createHash("sha256");
  const pairs = [];
  if (zips.length) {
    for (const name of zips) {
      const zipPath = join(dir, name);
      hasher.update(readFileSync(zipPath));
      pairs.push(loadShpDbfFromZip(zipPath));
    }
    return {
      rivers: collectTigerRiversFromBuffers(pairs),
      sha256: hasher.digest("hex"),
      fileCount: zips.length,
    };
  }
  const shps = [];
  for (const name of entries) {
    if (shpRe.test(name)) shps.push(join(dir, name));
    else {
      const sub = join(dir, name);
      try {
        const nested = readdirSync(sub).filter((f) => shpRe.test(f)).sort();
        for (const f of nested) shps.push(join(sub, f));
      } catch {
        // not a directory
      }
    }
  }
  shps.sort();
  for (const shpPath of shps) {
    const pair = loadShpDbfFromShp(shpPath);
    hasher.update(pair.shp);
    hasher.update(pair.dbf);
    pairs.push(pair);
  }
  return {
    rivers: collectTigerRiversFromBuffers(pairs),
    sha256: hasher.digest("hex"),
    fileCount: shps.length,
  };
}

export function loadTigerLinearWater(dir) {
  return loadTigerWater(dir, "linearwater");
}

export function loadTigerAreaWater(dir) {
  return loadTigerWater(dir, "areawater");
}

// Merge named line maps (same label from linear and area water -> one river).
export function mergeRiverMaps(...maps) {
  const out = new Map();
  for (const m of maps) {
    if (!m) continue;
    for (const [name, lines] of m) out.set(name, [...(out.get(name) ?? []), ...lines]);
  }
  return out;
}

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

function linesOf(geometry) {
  if (!geometry) return [];
  if (geometry.type === "LineString") return [geometry.coordinates];
  if (geometry.type === "MultiLineString") return geometry.coordinates;
  return [];
}

// Named river lines merged by exact (trimmed) name across all collections.
// Features with null geometry or a null/empty name are skipped.
export function collectRivers(collections) {
  const rivers = new Map();
  for (const fc of collections) {
    for (const f of fc.features ?? []) {
      const name = typeof f.properties?.name === "string" ? f.properties.name.trim() : "";
      if (!name || !f.geometry) continue;
      const lines = linesOf(f.geometry);
      if (!lines.length) continue;
      const list = rivers.get(name) ?? [];
      list.push(...lines);
      rivers.set(name, list);
    }
  }
  return rivers;
}

export function countiesBbox(counties, margin = CLIP_MARGIN) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const c of counties) {
    for (const poly of c.polygons) {
      for (const ring of poly) {
        for (const [x, y] of ring) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }
  }
  return [minX - margin, minY - margin, maxX + margin, maxY + margin];
}

// Grid index over river segments clipped to bbox. Each segment is registered in
// every cell its tolerance-expanded bbox touches, so a point query needs only
// the point's own cell.
export function buildRiverIndex(rivers, bbox, tolerance = TOLERANCE) {
  const [bx0, by0, bx1, by1] = bbox;
  const cell = (v) => Math.floor(v / GRID_CELL);
  const grid = new Map();
  const segmentsByRiver = {};
  const names = [...rivers.keys()].sort();
  for (const name of names) {
    let kept = 0;
    for (const line of rivers.get(name)) {
      for (let i = 0; i < line.length - 1; i++) {
        const [ax, ay] = line[i];
        const [bx, by] = line[i + 1];
        const minX = Math.min(ax, bx), maxX = Math.max(ax, bx);
        const minY = Math.min(ay, by), maxY = Math.max(ay, by);
        if (maxX < bx0 || minX > bx1 || maxY < by0 || minY > by1) continue;
        kept++;
        const seg = { name, ax, ay, bx, by };
        for (let gx = cell(minX - tolerance); gx <= cell(maxX + tolerance); gx++) {
          for (let gy = cell(minY - tolerance); gy <= cell(maxY + tolerance); gy++) {
            const k = `${gx},${gy}`;
            const list = grid.get(k);
            if (list) list.push(seg);
            else grid.set(k, [seg]);
          }
        }
      }
    }
    if (kept) segmentsByRiver[name] = kept;
  }
  return { grid, tolerance, segmentsByRiver, cell };
}

function pointSegmentDistance(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / len2;
  if (t < 0) t = 0;
  else if (t > 1) t = 1;
  const qx = ax + t * dx - px;
  const qy = ay + t * dy - py;
  return Math.sqrt(qx * qx + qy * qy);
}

export function riversNear(index, x, y) {
  const list = index.grid.get(`${index.cell(x)},${index.cell(y)}`) ?? [];
  const found = new Set();
  for (const s of list) {
    if (found.has(s.name)) continue;
    if (pointSegmentDistance(x, y, s.ax, s.ay, s.bx, s.by) <= index.tolerance) found.add(s.name);
  }
  return found;
}

// pairKey -> list of [[ax, ay], [bx, by]] segments owned by both counties.
export function buildSharedBoundaries(counties) {
  const shared = new Map();
  for (const [k, owners] of buildSegmentOwnership(counties)) {
    if (owners.size < 2) continue;
    const [p, q] = k.split("|");
    const seg = [p.split(",").map(Number), q.split(",").map(Number)];
    const ids = [...owners].sort();
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const pk = pairKey(ids[i], ids[j]);
        const list = shared.get(pk) ?? [];
        list.push(seg);
        shared.set(pk, list);
      }
    }
  }
  return shared;
}

// Fraction of shared boundary length near each river: each segment is split into
// pieces no longer than the tolerance and a piece counts when its midpoint is
// within tolerance of the river.
// When endpointCredit is true (TIGER vs the generalised 20m county chords, up to
// ~0.12 degrees long), a segment counts fully toward a river only when BOTH of its
// endpoints are within tolerance of that same river: the generalised vertices lie
// on the river while the chord between them cuts its meanders. A segment with only
// one endpoint near the river (a land border that starts at the river) keeps the
// midpoint-piece measure.
export function riverFractions(segments, index, endpointCredit = false) {
  let total = 0;
  const near = new Map();
  for (const [[ax, ay], [bx, by]] of segments) {
    const len = Math.hypot(bx - ax, by - ay);
    if (len === 0) continue;
    total += len;
    const contrib = new Map();
    const n = Math.max(1, Math.ceil(len / index.tolerance));
    const piece = len / n;
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      for (const name of riversNear(index, ax + t * (bx - ax), ay + t * (by - ay))) {
        contrib.set(name, (contrib.get(name) ?? 0) + piece);
      }
    }
    if (endpointCredit) {
      const atB = riversNear(index, bx, by);
      for (const name of riversNear(index, ax, ay)) {
        if (atB.has(name)) contrib.set(name, len);
      }
    }
    for (const [name, amount] of contrib) {
      near.set(name, (near.get(name) ?? 0) + Math.min(amount, len));
    }
  }
  const fractions = [...near.entries()]
    .map(([river, length]) => ({ river, fraction: total === 0 ? 0 : length / total }))
    .sort((p, q) => q.fraction - p.fraction || (p.river < q.river ? -1 : 1));
  return { length: total, fractions };
}

export function classifyCrossing(fractions, minFraction = MIN_FRACTION) {
  const best = fractions[0];
  if (!best || best.fraction < minFraction) return null;
  const src = { river: best.river, boundaryFraction: roundFraction(best.fraction) };
  return {
    kind: "river",
    river: best.river,
    boundaryFraction: src.boundaryFraction,
    basis: CROSSING_BASIS,
    sources: { naturalEarth: src, tiger: null },
  };
}

// Tags when either source reaches minFraction. Each source's best river is
// recorded in sources when its fraction is >= recordMin (even below
// minFraction), so disputes between sources are inspectable.
// Best TIGER river with a tie-break: when several TIGER rivers are within
// TIE_EPSILON of the best fraction (confluences, oxbows such as "Dead" beside
// the Oconee), prefer the river Natural Earth names as the main stem.
export function pickTigerBest(neFractions, tigerFractions) {
  const top = tigerFractions[0] ?? null;
  const ne = neFractions[0] ?? null;
  if (!top || !ne) return top;
  return tigerFractions.find((f) => f.river === ne.river && f.fraction >= top.fraction - TIE_EPSILON) ?? top;
}

export function classifyCorroboratedCrossing(
  neFractions, tigerFractions, minFraction = MIN_FRACTION, areaWater = false, recordMin = NEAR_MISS_MIN,
) {
  const neBest = neFractions[0] ?? null;
  const tigerBest = pickTigerBest(neFractions, tigerFractions);
  const neHit = !!(neBest && neBest.fraction >= minFraction);
  const tigerHit = !!(tigerBest && tigerBest.fraction >= minFraction);
  if (!neHit && !tigerHit) return null;
  const record = (best) =>
    best && best.fraction >= recordMin ? { river: best.river, boundaryFraction: roundFraction(best.fraction) } : null;
  const naturalEarth = record(neBest);
  const tiger = record(tigerBest);
  const river = tigerHit ? tigerBest.river : neBest.river;
  const boundaryFraction = tigerHit ? roundFraction(tigerBest.fraction) : roundFraction(neBest.fraction);
  const tigerBasis = areaWater ? CROSSING_BASIS_TIGER_AREA : CROSSING_BASIS_TIGER;
  const bothBasis = areaWater ? CROSSING_BASIS_BOTH_AREA : CROSSING_BASIS_BOTH;
  const basis = tigerHit && neHit ? bothBasis : tigerHit ? tigerBasis : CROSSING_BASIS;
  return { kind: "river", river, boundaryFraction, basis, sources: { naturalEarth, tiger } };
}

export function adjacencyPairs(adjacency) {
  const pairs = new Set();
  for (const [a, neighbors] of Object.entries(adjacency)) {
    for (const b of neighbors) if (a !== b) pairs.add(pairKey(a, b));
  }
  return [...pairs].sort();
}

// Returns { edges, audit } where audit carries per-edge best fractions.
export function buildMovementEdges(
  counties, adjacency, rivers, tolerance = TOLERANCE, tigerRivers = null, tigerAreaWater = false,
) {
  const bbox = countiesBbox(counties);
  const index = buildRiverIndex(rivers, bbox, tolerance);
  const tigerIndex = tigerRivers ? buildRiverIndex(tigerRivers, bbox, tolerance) : null;
  const shared = buildSharedBoundaries(counties);
  const edges = [];
  const audit = [];
  for (const pk of adjacencyPairs(adjacency)) {
    const [a, b] = pk.split("|");
    const segs = shared.get(pk) ?? [];
    const { length, fractions } = riverFractions(segs, index);
    const tigerResult = tigerIndex ? riverFractions(segs, tigerIndex, true) : { fractions: [] };
    const crossing = tigerIndex
      ? classifyCorroboratedCrossing(fractions, tigerResult.fractions, MIN_FRACTION, tigerAreaWater)
      : classifyCrossing(fractions);
    edges.push({ a, b, passable: true, basis: PASSABLE_BASIS, crossing });
    audit.push({ a, b, length, best: fractions[0] ?? null, tigerBest: pickTigerBest(fractions, tigerResult.fractions) });
  }
  return { edges, audit, index, shared, tigerIndex };
}

// ---------------------------------------------------------------------------
// Validation.

export function validateEdgeSet(edges, adjacency, shared) {
  const expected = new Set(adjacencyPairs(adjacency));
  const seen = new Set();
  const extra = [];
  const duplicates = [];
  const unordered = [];
  const noSharedBoundary = [];
  for (const e of edges) {
    const pk = pairKey(e.a, e.b);
    if (!(e.a < e.b)) unordered.push(pk);
    if (seen.has(pk)) duplicates.push(pk);
    seen.add(pk);
    if (!expected.has(pk)) extra.push(pk);
    if (shared && !(shared.get(pk)?.length > 0)) noSharedBoundary.push(pk);
  }
  const missing = [...expected].filter((pk) => !seen.has(pk));
  let sorted = true;
  for (let i = 1; i < edges.length; i++) {
    const p = edges[i - 1], q = edges[i];
    if (p.a > q.a || (p.a === q.a && p.b >= q.b)) { sorted = false; break; }
  }
  const pass = !extra.length && !missing.length && !duplicates.length && !unordered.length && !noSharedBoundary.length && sorted;
  return checkResult("edgesMatchAdjacency", pass, {
    expected: expected.size,
    actual: edges.length,
    extra, missing, duplicates, unordered, noSharedBoundary, sorted,
  });
}

export function validateCornerOnlyExcluded(edges, cornerOnly = CORNER_ONLY_CONTACTS) {
  const keys = new Set(edges.map((e) => pairKey(e.a, e.b)));
  const present = cornerOnly.filter(([a, b]) => keys.has(pairKey(a, b))).map(([a, b]) => pairKey(a, b));
  return checkResult("cornerOnlyExcluded", present.length === 0, { documented: cornerOnly.length, present });
}

export function validateCobbFulton(edges, requireBothSources = false) {
  const [a, b] = COBB_ID < FULTON_ID ? [COBB_ID, FULTON_ID] : [FULTON_ID, COBB_ID];
  const e = edges.find((x) => x.a === a && x.b === b);
  const river = e?.crossing?.river ?? null;
  const neSrc = e?.crossing?.sources?.naturalEarth ?? null;
  const tigerSrc = e?.crossing?.sources?.tiger ?? null;
  const ne = neSrc?.river ?? null;
  const tiger = tigerSrc?.river ?? null;
  // Sources are recorded from NEAR_MISS_MIN, so "both" also requires each to tag.
  const tags = (src) => src?.river === "Chattahoochee" && src.boundaryFraction >= MIN_FRACTION;
  const both = tags(neSrc) && tags(tigerSrc);
  const pass = river === "Chattahoochee" && (!requireBothSources || both);
  return checkResult("cobbFultonChattahoochee", pass, {
    found: e !== undefined,
    river,
    boundaryFraction: e?.crossing?.boundaryFraction ?? null,
    basis: e?.crossing?.basis ?? null,
    naturalEarth: ne,
    naturalEarthFraction: neSrc?.boundaryFraction ?? null,
    tiger,
    tigerFraction: tigerSrc?.boundaryFraction ?? null,
  });
}

export function validateGlynnMcIntosh(edges) {
  const [a, b] = GLYNN_ID < MCINTOSH_ID ? [GLYNN_ID, MCINTOSH_ID] : [MCINTOSH_ID, GLYNN_ID];
  const e = edges.find((x) => x.a === a && x.b === b);
  const river = e?.crossing?.river ?? null;
  return checkResult("glynnMcIntoshAltamaha", river === "Altamaha", {
    found: e !== undefined, river, boundaryFraction: e?.crossing?.boundaryFraction ?? null,
  });
}

export function validateNoBareLittleOrSouth(edges) {
  const bad = [];
  for (const e of edges) {
    const river = e.crossing?.river;
    if (river !== "Little" && river !== "South") continue;
    const tiger = e.crossing?.sources?.tiger?.river ?? null;
    if (tiger !== null && tiger !== river) bad.push({ a: e.a, b: e.b, river, tiger });
  }
  return checkResult("noBareLittleOrSouth", bad.length === 0, { bad });
}

export function validateTaggedCount(edges) {
  const tagged = edges.filter((e) => e.crossing).length;
  return checkResult("taggedEdgesPresent", tagged > 0, { tagged });
}

export function validateRiverNames(edges, sourceNames) {
  const unknown = [...new Set(edges.filter((e) => e.crossing).map((e) => e.crossing.river))]
    .filter((n) => !sourceNames.has(n))
    .sort();
  return checkResult("taggedRiversInSources", unknown.length === 0, { unknown });
}

function pairLabel(e, nameById) {
  return `${nameById.get(e.a) ?? e.a}–${nameById.get(e.b) ?? e.b}`;
}

export function buildCrossingDiff(edges, audit, nameById) {
  const added = [];
  const removed = [];
  const relabelled = [];
  const disputed = [];
  const tigerNearMisses = [];
  for (let i = 0; i < edges.length; i++) {
    const e = edges[i];
    const row = audit[i];
    const names = pairLabel(e, nameById);
    const ne = row?.best && row.best.fraction >= MIN_FRACTION ? row.best : null;
    const tigerHit = row?.tigerBest && row.tigerBest.fraction >= MIN_FRACTION ? row.tigerBest : null;
    if (row?.tigerBest && row.tigerBest.fraction >= NEAR_MISS_MIN && row.tigerBest.fraction < MIN_FRACTION) {
      tigerNearMisses.push({
        a: e.a, b: e.b, names, river: row.tigerBest.river, fraction: roundFraction(row.tigerBest.fraction),
      });
    }
    if (ne && !e.crossing) removed.push({ names, a: e.a, b: e.b, river: ne.river });
    if (!ne && tigerHit) {
      added.push({ names, a: e.a, b: e.b, river: tigerHit.river, boundaryFraction: roundFraction(tigerHit.fraction) });
    }
    if (ne && tigerHit && tigerHit.river !== ne.river) {
      relabelled.push({ names, a: e.a, b: e.b, from: ne.river, to: tigerHit.river });
    }
    if (ne && (!row.tigerBest || row.tigerBest.fraction < NEAR_MISS_MIN || row.tigerBest.river !== ne.river)) {
      disputed.push({
        names,
        a: e.a,
        b: e.b,
        naturalEarth: { river: ne.river, boundaryFraction: roundFraction(ne.fraction) },
        tiger: row.tigerBest
          ? { river: row.tigerBest.river, fraction: roundFraction(row.tigerBest.fraction) }
          : null,
      });
    }
  }
  return { added, removed, relabelled, disputed, tigerNearMisses };
}

export function buildReport(checks, edges, audit, index, nameById, tolerance = TOLERANCE, diff = null) {
  const perRiver = {};
  for (const e of edges) if (e.crossing) perRiver[e.crossing.river] = (perRiver[e.crossing.river] ?? 0) + 1;
  const perRiverEdgeCounts = Object.fromEntries(Object.entries(perRiver).sort(([p], [q]) => (p < q ? -1 : 1)));
  const nearMisses = audit
    .filter((x) => x.best && x.best.fraction >= NEAR_MISS_MIN && x.best.fraction < MIN_FRACTION)
    .map((x) => ({
      a: x.a, b: x.b, names: pairLabel(x, nameById), river: x.best.river, fraction: roundFraction(x.best.fraction),
    }));
  const taggedPairs = (river) =>
    edges.filter((e) => e.crossing?.river === river).map((e) => ({
      names: pairLabel(e, nameById), boundaryFraction: e.crossing.boundaryFraction,
    }));
  const sanityRivers = Object.fromEntries(SANITY_RIVERS.map((r) => [r, taggedPairs(r)]));
  const stateBorderRivers = Object.fromEntries(STATE_BORDER_RIVERS.map((r) => [r, taggedPairs(r).map((p) => p.names)]));
  const report = {
    ok: checks.every((c) => c.pass),
    ranAt: RAN_AT,
    checks,
    counts: {
      edges: edges.length,
      tagged: edges.filter((e) => e.crossing).length,
      untagged: edges.filter((e) => !e.crossing).length,
      nearMisses: nearMisses.length,
      riversIndexed: Object.keys(index.segmentsByRiver).length,
    },
    tolerance,
    minFraction: MIN_FRACTION,
    perRiverEdgeCounts,
    nearMisses,
    sanity: {
      note: "informational, not a pass/fail check: state-border river stretches are not internal edges, so internal tags on these rivers are listed for review",
      taggedPairs: sanityRivers,
      stateBorderRiverTags: stateBorderRivers,
    },
  };
  if (diff) {
    report.counts.tigerNearMisses = diff.tigerNearMisses.length;
    report.counts.added = diff.added.length;
    report.counts.removed = diff.removed.length;
    report.counts.relabelled = diff.relabelled.length;
    report.counts.disputed = diff.disputed.length;
    report.diff = diff;
  }
  return report;
}

function main() {
  const parsed = parseArgs(process.argv);
  if (parsed.help) {
    console.log(USAGE);
    process.exit(0);
  }
  if (parsed.srcs.length < 2 || parsed.srcs.length > 4) {
    console.error(USAGE);
    process.exit(2);
  }

  const geoPaths = parsed.srcs.slice(0, 2);
  const tigerDir = parsed.srcs[2] ?? null;
  const tigerAreaDir = parsed.srcs[3] ?? null;
  let collections;
  let geometry;
  let tiger = null;
  let tigerArea = null;
  const hashes = [];
  try {
    collections = geoPaths.map((p) => {
      const bytes = readFileSync(p);
      hashes.push(createHash("sha256").update(bytes).digest("hex"));
      const fc = JSON.parse(bytes.toString("utf8"));
      if (!fc || !Array.isArray(fc.features)) throw new Error(`${p}: expected a GeoJSON FeatureCollection`);
      return fc;
    });
    geometry = JSON.parse(readFileSync(GEOMETRY_PATH, "utf8"));
    if (tigerDir) tiger = loadTigerLinearWater(tigerDir);
    if (tigerAreaDir) tigerArea = loadTigerAreaWater(tigerAreaDir);
  } catch (err) {
    console.error(JSON.stringify({ ok: false, error: "parse", message: String(err.message ?? err) }));
    process.exit(2);
  }

  const rivers = collectRivers(collections);
  const { counties, adjacency } = geometry;
  const nameById = new Map(counties.map((c) => [c.id, c.name]));
  const tigerRivers = tiger ? mergeRiverMaps(tiger.rivers, tigerArea?.rivers) : null;
  const { edges, audit, index, shared } = buildMovementEdges(
    counties, adjacency, rivers, TOLERANCE, tigerRivers, !!tigerArea,
  );

  const sourceNames = new Set(rivers.keys());
  if (tigerRivers) for (const name of tigerRivers.keys()) sourceNames.add(name);
  const checks = [
    validateEdgeSet(edges, adjacency, shared),
    validateCornerOnlyExcluded(edges),
    validateCobbFulton(edges, !!tiger),
    validateTaggedCount(edges),
    validateRiverNames(edges, sourceNames),
  ];
  if (tiger) {
    checks.push(validateGlynnMcIntosh(edges));
    checks.push(validateNoBareLittleOrSouth(edges));
  }
  const diff = tiger ? buildCrossingDiff(edges, audit, nameById) : null;
  const report = buildReport(checks, edges, audit, index, nameById, TOLERANCE, diff);

  if (parsed.check) {
    console.log(JSON.stringify(report));
    process.exit(report.ok ? 0 : 1);
  }
  if (!report.ok) {
    console.log(JSON.stringify(report));
    process.exit(1);
  }

  const sources = SOURCES.map((s, i) => ({ ...s, sha256: hashes[i] }));
  if (tiger) {
    sources.push({
      name: "US Census TIGER/Line 2023 Linear Hydrography (LINEARWATER)",
      url: TIGER_URL_PATTERN,
      sha256: tiger.sha256,
      files: tiger.fileCount,
      licence: TIGER_LICENCE,
    });
  }
  if (tigerArea) {
    sources.push({
      name: "US Census TIGER/Line 2023 Area Hydrography (AREAWATER)",
      url: TIGER_AREA_URL_PATTERN,
      sha256: tigerArea.sha256,
      files: tigerArea.fileCount,
      licence: TIGER_LICENCE,
    });
  }
  const tigerWater = tigerArea ? "linear and area water" : "linear water";
  const crossingRule = tiger
    ? `shared boundary = segments owned by both counties; pieces no longer than the tolerance count toward a river when their midpoint is within ${TOLERANCE} degrees of the river's lines; Natural Earth tags the highest length fraction when it is >= ${MIN_FRACTION}; TIGER/Line 2023 ${tigerWater} named features containing "River" (Lake/Reservoir/Creek/Branch-only names excluded; area-water polygon ring edges count as lines) tag when their highest length fraction is >= ${MIN_FRACTION}, where a TIGER segment counts fully only when both endpoints are within the tolerance of the same river; an edge is tagged if either source tags it; the label is the TIGER name without a trailing " River" when TIGER tags it, otherwise the Natural Earth name; each source's best river and fraction is recorded when >= ${NEAR_MISS_MIN}`
    : `shared boundary = segments owned by both counties; pieces no longer than the tolerance count toward a river when their midpoint is within ${TOLERANCE} degrees of the river's Natural Earth lines; tag the river with the highest length fraction when it is >= ${MIN_FRACTION}`;
  const out = {
    provenance: {
      preparedBy: "scripts/prepare-movement.mjs",
      referenceDate: "1942-02-01",
      sources,
      licence: tiger ? `${LICENCE_QUOTE} TIGER/Line shapefiles are ${TIGER_LICENCE}.` : LICENCE_QUOTE,
      geometry: GEOMETRY_PATH,
      geometrySourceSha256: geometry.provenance?.sourceSha256 ?? null,
      edgeRule: "one passable movement edge per undirected geographic adjacency edge (shared boundary segment; corner-only contacts excluded)",
      crossingRule,
      tolerance: TOLERANCE,
      toleranceUnits: "degrees (unscaled longitude/latitude)",
      minFraction: MIN_FRACTION,
      evidenceLabels: {
        passable: PASSABLE_BASIS,
        crossing: tigerArea
          ? [CROSSING_BASIS, CROSSING_BASIS_TIGER_AREA, CROSSING_BASIS_BOTH_AREA]
          : tiger
            ? [CROSSING_BASIS, CROSSING_BASIS_TIGER, CROSSING_BASIS_BOTH]
            : CROSSING_BASIS,
      },
      riverAssumption: tigerArea
        ? "river courses treated as stable since 1942; centerlines and named river area-water polygons only, reservoirs ignored"
        : "river courses treated as stable since 1942; centerlines only, reservoirs ignored",
      validationReport: report,
    },
    edges,
  };
  writeFileSync(OUT_PATH, JSON.stringify(out));
  console.log(`wrote ${edges.length} movement edges, ${report.counts.tagged} river crossings`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
