// Reproducible geometry preparation for the bundled Georgia county board.
//
// Usage: node scripts/prepare-geometry.mjs <path-to-geojson-counties-fips.json>
//
// Source: plotly/datasets "geojson-counties-fips.json", a redistribution of the
// U.S. Census Bureau cartographic boundary file (public-domain federal data).
// URL: https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json
//
// Output: src/data/georgia-counties.json — the 159 Georgia (STATE 13) polygons,
// coordinates rounded to 4 decimals, plus a symmetric adjacency graph built
// only from shared boundary segments (corner-only contacts are excluded).
//
// This is MODERN geometry used as the crosswalk/mockup base (GDD §3.2). The
// February 1, 1942 historical verification (issues #1–#2) is still pending and
// is recorded as such in the output's provenance block.
import { readFileSync, writeFileSync } from "node:fs";

const src = process.argv[2];
if (!src) {
  console.error("usage: node scripts/prepare-geometry.mjs <geojson-counties-fips.json>");
  process.exit(1);
}
const all = JSON.parse(readFileSync(src, "utf8"));
const ga = all.features.filter((f) => f.properties.STATE === "13");
if (ga.length !== 159) throw new Error(`expected 159 Georgia counties, got ${ga.length}`);

const round = (n) => Math.round(n * 1e4) / 1e4;
const key = (p) => `${p[0]},${p[1]}`;

const counties = ga
  .map((f) => {
    const fips = `13${f.properties.COUNTY}`;
    const rings = (f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates).map(
      (poly) => poly.map((ring) => ring.map(([x, y]) => [round(x), round(y)])),
    );
    return { id: `US-GA-${fips}`, fips, name: f.properties.NAME, polygons: rings };
  })
  .sort((a, b) => a.fips.localeCompare(b.fips));

// Shared-edge adjacency: an undirected edge exists only if two counties share at
// least one boundary segment (two consecutive identical vertices).
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
const adjacency = Object.fromEntries(counties.map((c) => [c.id, new Set()]));
for (const owners of segOwners.values()) {
  if (owners.size < 2) continue;
  const ids = [...owners];
  for (const a of ids) for (const b of ids) if (a !== b) adjacency[a].add(b);
}
for (const id of Object.keys(adjacency)) adjacency[id] = [...adjacency[id]].sort();

// Bounding box + area-weighted centroid for label placement.
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

const isolated = Object.entries(adjacency).filter(([, n]) => n.length === 0).map(([id]) => id);
if (isolated.length) throw new Error(`isolated counties: ${isolated.join(", ")}`);

const out = {
  provenance: {
    source: "U.S. Census Bureau cartographic boundary file via plotly/datasets geojson-counties-fips.json",
    sourceUrl: "https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json",
    rights: "Public-domain U.S. federal data; retain Census notices.",
    referenceDate: "1942-02-01",
    historicalVerification: "PENDING — modern polygons used as crosswalk base; see issues #1 and #2",
    preparedBy: "scripts/prepare-geometry.mjs",
    coordinatePrecision: 4,
    adjacencyRule: "shared boundary segment; corner-only contacts excluded",
  },
  counties,
  adjacency,
};
writeFileSync("src/data/georgia-counties.json", JSON.stringify(out));
console.log(`wrote ${counties.length} counties, ${Object.values(adjacency).reduce((s, n) => s + n.length, 0) / 2} adjacency edges`);
