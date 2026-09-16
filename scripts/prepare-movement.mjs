// Reproducible movement-edge and river-crossing preparation (CC-03).
//
// Inputs: Natural Earth 10m hydrography (public domain), both GeoJSON:
//   <centerlines>    ne_10m_rivers_lake_centerlines.geojson
//   <north-america>  ne_10m_rivers_north_america.geojson
//   plus the bundled src/data/georgia-counties.json (counties and adjacency).
// Output: src/data/movement-edges.json
//   { provenance, edges } — one passable movement edge per undirected
//   geographic adjacency edge, sorted by (a, b) with a < b, each with an
//   optional derived river-crossing tag. No per-edge geometry is stored.
//
// Invocations:
//   node scripts/prepare-movement.mjs <centerlines> <north-america>
//     writes src/data/movement-edges.json (with provenance.validationReport).
//   node scripts/prepare-movement.mjs --check <centerlines> <north-america>
//     prints one JSON report {ok, ranAt, checks, counts} to stdout; writes no
//     file; exit 0 if ok, 1 on validation failure, 2 on parse errors.
//   node scripts/prepare-movement.mjs --help
//     prints usage.
//
// Crossing rule: the shared boundary of (a, b) is the set of boundary segments
// owned by both counties (exact coordinate keys, as in prepare-geometry). Each
// shared segment is subdivided into pieces no longer than TOLERANCE; a piece
// counts toward a river when its midpoint lies within TOLERANCE degrees of any
// segment of that river's lines. The edge is tagged with the river holding the
// highest fraction of shared boundary length when that fraction is >= 0.5.
//
// The pure build/validate functions are exported so tests can run them on
// synthetic fixtures; main() runs only when this file is executed directly.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { CORNER_ONLY_CONTACTS, buildSegmentOwnership } from "./prepare-geometry.mjs";

const GEOMETRY_PATH = "src/data/georgia-counties.json";
const OUT_PATH = "src/data/movement-edges.json";
// Deterministic ranAt so bundled provenance.validationReport does not drift.
const RAN_AT = "2026-09-16T00:00:00.000Z";
const COBB_ID = "US-GA-13067";
const FULTON_ID = "US-GA-13121";

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
const CLIP_MARGIN = 0.1;
const GRID_CELL = 0.05;
const FRACTION_DP = 4;

export const PASSABLE_BASIS = "scenario-abstraction: geographic adjacency assumed road-connected";
export const CROSSING_BASIS = "derived: Natural Earth 10m hydrography";
const LICENCE_QUOTE =
  "All versions of Natural Earth raster + vector map data found on this website are in the public domain.";
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
  node scripts/prepare-movement.mjs <centerlines.geojson> <north-america.geojson>
      Write src/data/movement-edges.json from Natural Earth 10m rivers.
  node scripts/prepare-movement.mjs --check <centerlines.geojson> <north-america.geojson>
      Validate only. JSON report to stdout. Exit 0/1/2. Writes no file.
  node scripts/prepare-movement.mjs --help
      Print this usage.`;

const pairKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
const roundFraction = (f) => Math.round(f * 10 ** FRACTION_DP) / 10 ** FRACTION_DP;

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

// Fraction of shared boundary length near each river.
export function riverFractions(segments, index) {
  let total = 0;
  const near = new Map();
  for (const [[ax, ay], [bx, by]] of segments) {
    const len = Math.hypot(bx - ax, by - ay);
    if (len === 0) continue;
    total += len;
    const n = Math.max(1, Math.ceil(len / index.tolerance));
    const piece = len / n;
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      for (const name of riversNear(index, ax + t * (bx - ax), ay + t * (by - ay))) {
        near.set(name, (near.get(name) ?? 0) + piece);
      }
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
  return { kind: "river", river: best.river, boundaryFraction: roundFraction(best.fraction), basis: CROSSING_BASIS };
}

export function adjacencyPairs(adjacency) {
  const pairs = new Set();
  for (const [a, neighbors] of Object.entries(adjacency)) {
    for (const b of neighbors) if (a !== b) pairs.add(pairKey(a, b));
  }
  return [...pairs].sort();
}

// Returns { edges, audit } where audit carries per-edge best fractions.
export function buildMovementEdges(counties, adjacency, rivers, tolerance = TOLERANCE) {
  const index = buildRiverIndex(rivers, countiesBbox(counties), tolerance);
  const shared = buildSharedBoundaries(counties);
  const edges = [];
  const audit = [];
  for (const pk of adjacencyPairs(adjacency)) {
    const [a, b] = pk.split("|");
    const { length, fractions } = riverFractions(shared.get(pk) ?? [], index);
    const crossing = classifyCrossing(fractions);
    edges.push({ a, b, passable: true, basis: PASSABLE_BASIS, crossing });
    audit.push({ a, b, length, best: fractions[0] ?? null });
  }
  return { edges, audit, index, shared };
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

export function validateCobbFulton(edges) {
  const [a, b] = COBB_ID < FULTON_ID ? [COBB_ID, FULTON_ID] : [FULTON_ID, COBB_ID];
  const e = edges.find((x) => x.a === a && x.b === b);
  const river = e?.crossing?.river ?? null;
  return checkResult("cobbFultonChattahoochee", river === "Chattahoochee", {
    found: e !== undefined, river, boundaryFraction: e?.crossing?.boundaryFraction ?? null,
  });
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

export function buildReport(checks, edges, audit, index, nameById, tolerance = TOLERANCE) {
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
  return {
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

  let collections;
  let geometry;
  const hashes = [];
  try {
    collections = parsed.srcs.map((p) => {
      const bytes = readFileSync(p);
      hashes.push(createHash("sha256").update(bytes).digest("hex"));
      const fc = JSON.parse(bytes.toString("utf8"));
      if (!fc || !Array.isArray(fc.features)) throw new Error(`${p}: expected a GeoJSON FeatureCollection`);
      return fc;
    });
    geometry = JSON.parse(readFileSync(GEOMETRY_PATH, "utf8"));
  } catch (err) {
    console.error(JSON.stringify({ ok: false, error: "parse", message: String(err.message ?? err) }));
    process.exit(2);
  }

  const rivers = collectRivers(collections);
  const { counties, adjacency } = geometry;
  const nameById = new Map(counties.map((c) => [c.id, c.name]));
  const { edges, audit, index, shared } = buildMovementEdges(counties, adjacency, rivers);

  const checks = [
    validateEdgeSet(edges, adjacency, shared),
    validateCornerOnlyExcluded(edges),
    validateCobbFulton(edges),
    validateTaggedCount(edges),
    validateRiverNames(edges, new Set(rivers.keys())),
  ];
  const report = buildReport(checks, edges, audit, index, nameById);

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
      preparedBy: "scripts/prepare-movement.mjs",
      referenceDate: "1942-02-01",
      sources: SOURCES.map((s, i) => ({ ...s, sha256: hashes[i] })),
      licence: LICENCE_QUOTE,
      geometry: GEOMETRY_PATH,
      geometrySourceSha256: geometry.provenance?.sourceSha256 ?? null,
      edgeRule: "one passable movement edge per undirected geographic adjacency edge (shared boundary segment; corner-only contacts excluded)",
      crossingRule: `shared boundary = segments owned by both counties; pieces no longer than the tolerance count toward a river when their midpoint is within ${TOLERANCE} degrees of the river's Natural Earth lines; tag the river with the highest length fraction when it is >= ${MIN_FRACTION}`,
      tolerance: TOLERANCE,
      toleranceUnits: "degrees (unscaled longitude/latitude)",
      minFraction: MIN_FRACTION,
      evidenceLabels: { passable: PASSABLE_BASIS, crossing: CROSSING_BASIS },
      riverAssumption: "river courses treated as stable since 1942; centerlines only, reservoirs ignored",
      validationReport: report,
    },
    edges,
  };
  writeFileSync(OUT_PATH, JSON.stringify(out));
  console.log(`wrote ${edges.length} movement edges, ${report.counts.tagged} river crossings`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
