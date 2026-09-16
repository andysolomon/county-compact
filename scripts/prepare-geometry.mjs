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
import { readFileSync, writeFileSync } from "node:fs";

const EXPECTED_COUNT = 159;
const COORD_PRECISION = 4;
const COBB_ID = "US-GA-13067";
const OUT_PATH = "src/data/georgia-counties.json";
// Deterministic ranAt so bundled provenance.validationReport does not drift.
const RAN_AT = "2026-09-16T00:00:00.000Z";
const HISTORICAL_VERIFICATION =
  "Roster verified for 1942-02-01 against Newberry AHCBP and 1940 Census (see docs/historical-research/issue-1-roster.md). Geometry remains modern Census cartographic boundary file; 1942-dated polygons are Issue #2 work. Newberry license regime: CC BY-NC-SA 2.5 (bundled deed) or \"any lawful purpose, commercial or non-commercial\" per current download pages; not CC0 as docs/game-design.md §3.2 [S6] previously claimed (corrected in this pass).";
const ROSTER_REFERENCE = "docs/historical-research/issue-1-roster.json";

// Corner-only contacts: share a vertex but no boundary segment. Intentionally
// absent from adjacency. Inspected against the modern Census extract.
const CORNER_ONLY_CONTACTS = [
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

function validateCount(actual, expected = EXPECTED_COUNT) {
  const pass = actual === expected;
  const details = { expected, actual };
  if (!pass) details.message = JSON.stringify({ error: "unexpected-county-count", expected, actual });
  return checkResult("count", pass, details);
}

function polygonsOf(geometry) {
  // Preserve MultiPolygon parts; wrap Polygon as a one-member MultiPolygon.
  return geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
}

function buildCounties(features) {
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
  return counties.map(({ id, fips, name, polygons, centroid, bbox }) => ({
    id, fips, name, polygons, centroid, bbox,
  }));
}

function buildSegmentOwnership(counties) {
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

function buildVertexOwnership(counties) {
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

function buildAdjacencyByCounty(segOwners, countyIds) {
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

function addCentroidsAndBboxes(counties) {
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

function validatePolygons(counties) {
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

function validateCoverage(counties) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const c of counties) {
    const [a, b, c2, d] = c.bbox;
    if (a < minX) minX = a;
    if (b < minY) minY = b;
    if (c2 > maxX) maxX = c2;
    if (d > maxY) maxY = d;
  }
  const atlanticCoast = minX <= -81.5;
  const outlineTouches = minY <= 30.7 && maxY >= 35.0;
  return checkResult("coverage", atlanticCoast && outlineTouches, {
    atlanticCoastMinX: minX,
    atlanticCoast: atlanticCoast,
    stateOutlineTouchesNonPlayable: outlineTouches,
    minY, maxY, maxX,
  });
}

function validateAdjacency(adjacency, countyIds) {
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

function validateSharedBoundaryRule(adjacency, vertexOwners, segmentCounts, nameById) {
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

function edgeCount(adjacency) {
  return Object.values(adjacency).reduce((s, n) => s + n.length, 0) / 2;
}

function isolatedIds(adjacency) {
  return Object.entries(adjacency).filter(([, n]) => n.length === 0).map(([id]) => id);
}

function buildReport(checks, counties, adjacency, multipart) {
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
  try {
    all = JSON.parse(readFileSync(parsed.src, "utf8"));
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
  const counties = buildCounties(ga);
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

main();
