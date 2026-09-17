import { describe, expect, it } from "vitest";
import { ADJACENCY, countyIdByName } from "../src/data/geometry";
import { MOVEMENT_EDGES, MOVEMENT_PROVENANCE, crossingOf, movementEdge } from "../src/data/movement";
import { CORNER_ONLY_CONTACTS, type FixtureCounty, type Ring } from "../scripts/prepare-geometry.mjs";
import {
  CROSSING_BASIS_BOTH_AREA,
  CROSSING_BASIS_TIGER_AREA,
  MIN_FRACTION,
  TOLERANCE,
  buildMovementEdges,
  pickTigerBest,
  buildRiverIndex,
  classifyCorroboratedCrossing,
  collectTigerRiversFromBuffers,
  isTigerRiverName,
  normaliseTigerName,
  parseDbf,
  parseShpLines,
  parseShpPolygons,
  parseShpPolylines,
  riverFractions,
  tigerRiverLabel,
  validateEdgeSet,
  type Line,
} from "../scripts/prepare-movement.mjs";

const COBB = "US-GA-13067";
const FULTON = "US-GA-13121";

function concat(parts: readonly Uint8Array[]): Uint8Array {
  const n = parts.reduce((s, p) => s + p.length, 0);
  const out = new Uint8Array(n);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

function i32(n: number, little: boolean): Uint8Array {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setInt32(0, n, little);
  return b;
}

function f64(n: number): Uint8Array {
  const b = new Uint8Array(8);
  new DataView(b.buffer).setFloat64(0, n, true);
  return b;
}

function encodeShpPolyline(line: Line, shapeType = 3): Uint8Array {
  const xs = line.map((p) => p[0]);
  const ys = line.map((p) => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const numPoints = line.length;
  const content = concat([
    i32(shapeType, true),
    f64(minX), f64(minY), f64(maxX), f64(maxY),
    i32(1, true),
    i32(numPoints, true),
    i32(0, true),
    ...line.flatMap(([x, y]) => [f64(x), f64(y)]),
  ]);
  const fileLenWords = (100 + 8 + content.length) / 2;
  const header = new Uint8Array(100);
  const hv = new DataView(header.buffer);
  hv.setInt32(0, 9994, false);
  hv.setInt32(24, fileLenWords, false);
  hv.setInt32(28, 1000, true);
  hv.setInt32(32, shapeType, true);
  hv.setFloat64(36, minX, true);
  hv.setFloat64(44, minY, true);
  hv.setFloat64(52, maxX, true);
  hv.setFloat64(60, maxY, true);
  return concat([header, i32(1, false), i32(content.length / 2, false), content]);
}

function encodeDbf(rows: readonly Record<string, string>[], fields: readonly { name: string; len: number }[]): Uint8Array {
  const hlen = 32 + 32 * fields.length + 1;
  const rlen = 1 + fields.reduce((s, f) => s + f.len, 0);
  const header = new Uint8Array(hlen);
  const hv = new DataView(header.buffer);
  header[0] = 0x03;
  hv.setUint32(4, rows.length, true);
  hv.setUint16(8, hlen, true);
  hv.setUint16(10, rlen, true);
  for (let i = 0; i < fields.length; i++) {
    const f = fields[i]!;
    const off = 32 + i * 32;
    for (let c = 0; c < f.name.length && c < 11; c++) header[off + c] = f.name.charCodeAt(c);
    header[off + 11] = 0x43; // C
    header[off + 16] = f.len;
  }
  header[hlen - 1] = 0x0d;
  const recs = rows.map((row) => {
    const rec = new Uint8Array(rlen);
    rec[0] = 0x20;
    let pos = 1;
    for (const f of fields) {
      const val = (row[f.name] ?? "").padEnd(f.len, " ").slice(0, f.len);
      for (let i = 0; i < f.len; i++) rec[pos + i] = val.charCodeAt(i);
      pos += f.len;
    }
    return rec;
  });
  return concat([header, ...recs]);
}

describe("movement edges data", () => {
  it("has exactly one edge per undirected adjacency pair, sorted with a < b", () => {
    const pairs = new Set<string>();
    for (const [a, neighbors] of Object.entries(ADJACENCY)) {
      for (const b of neighbors) pairs.add(a < b ? `${a}|${b}` : `${b}|${a}`);
    }
    const keys = MOVEMENT_EDGES.map((e) => `${e.a}|${e.b}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect([...keys].sort()).toEqual([...pairs].sort());
    expect(keys).toEqual([...keys].sort());
    for (const e of MOVEMENT_EDGES) {
      expect(e.a < e.b).toBe(true);
      expect(e.passable).toBe(true);
    }
    expect(validateEdgeSet(MOVEMENT_EDGES, ADJACENCY).pass).toBe(true);
  });

  it("looks edges up symmetrically and returns undefined for non-neighbors", () => {
    for (const e of MOVEMENT_EDGES) {
      expect(movementEdge(e.a, e.b)).toBe(e);
      expect(movementEdge(e.b, e.a)).toBe(e);
      expect(crossingOf(e.b, e.a)).toEqual(e.crossing);
    }
    expect(movementEdge(COBB, COBB)).toBeUndefined();
    expect(movementEdge(countyIdByName("Chatham"), countyIdByName("Dade"))).toBeUndefined();
    expect(crossingOf(countyIdByName("Chatham"), countyIdByName("Dade"))).toBeNull();
  });

  it("has no edge for corner-only contacts", () => {
    expect(CORNER_ONLY_CONTACTS.length).toBeGreaterThan(0);
    for (const [a, b] of CORNER_ONLY_CONTACTS) {
      expect(movementEdge(a, b)).toBeUndefined();
      expect(movementEdge(b, a)).toBeUndefined();
    }
  });

  it("tags Cobb–Fulton as a Chattahoochee crossing corroborated by both sources", () => {
    const crossing = crossingOf(FULTON, COBB);
    expect(crossing?.kind).toBe("river");
    expect(crossing?.river).toBe("Chattahoochee");
    expect(crossing?.boundaryFraction).toBeGreaterThanOrEqual(0.5);
    expect(crossing?.basis).toBe(CROSSING_BASIS_BOTH_AREA);
    expect(crossing?.sources.naturalEarth?.river).toBe("Chattahoochee");
    expect(crossing?.sources.tiger?.river).toBe("Chattahoochee");
    expect(crossing?.sources.naturalEarth?.boundaryFraction).toBeGreaterThanOrEqual(0.5);
    expect(crossing?.sources.tiger?.boundaryFraction).toBeGreaterThanOrEqual(0.5);
  });

  it("tags Glynn–McIntosh as Altamaha", () => {
    const crossing = crossingOf(countyIdByName("Glynn"), countyIdByName("McIntosh"));
    expect(crossing?.kind).toBe("river");
    expect(crossing?.river).toBe("Altamaha");
    expect(crossing?.boundaryFraction).toBeGreaterThanOrEqual(0.5);
    expect(crossing?.sources.tiger?.river).toBe("Altamaha");
  });

  it("does not use bare Little or South labels unless TIGER names them that way", () => {
    for (const e of MOVEMENT_EDGES) {
      const river = e.crossing?.river;
      if (river !== "Little" && river !== "South") continue;
      const tiger = e.crossing?.sources.tiger?.river ?? null;
      if (tiger !== null) expect(tiger).toBe(river);
    }
  });

  it("records provenance and a passing validation report", () => {
    expect(MOVEMENT_PROVENANCE["preparedBy"]).toBe("scripts/prepare-movement.mjs");
    expect(MOVEMENT_PROVENANCE["tolerance"]).toBe(TOLERANCE);
    const report = MOVEMENT_PROVENANCE["validationReport"] as { ok: boolean; counts: { tagged: number } };
    expect(report.ok).toBe(true);
    expect(report.counts.tagged).toBeGreaterThan(0);
    const sources = MOVEMENT_PROVENANCE["sources"] as { name: string; url: string; sha256: string }[];
    expect(sources.some((s) => s.name.includes("LINEARWATER"))).toBe(true);
    expect(sources.some((s) => s.name.includes("AREAWATER") && s.url.includes("/AREAWATER/"))).toBe(true);
    expect(report.ok).toBe(true);
  });
});

describe("TIGER shapefile and DBF reader", () => {
  it("round-trips a polyline shapefile and FULLNAME dbf, expanding Riv to River", () => {
    const line: Line = [[-84.5, 32.1], [-84.4, 32.2], [-84.3, 32.3]];
    const shp = encodeShpPolyline(line);
    const dbf = encodeDbf([{ FULLNAME: "Chattahoochee Riv", MTFCC: "H3010" }], [
      { name: "FULLNAME", len: 40 },
      { name: "MTFCC", len: 5 },
    ]);
    const geoms = parseShpPolylines(shp);
    const rows = parseDbf(dbf);
    expect(geoms).toHaveLength(1);
    expect(geoms[0]).toHaveLength(1);
    expect(geoms[0]?.[0]).toEqual(line);
    expect(rows[0]?.FULLNAME).toBe("Chattahoochee Riv");
    expect(rows[0]?.deleted).toBe(false);
    const normalised = normaliseTigerName(String(rows[0]?.FULLNAME));
    expect(normalised).toBe("Chattahoochee River");
    expect(isTigerRiverName(normalised)).toBe(true);
    expect(isTigerRiverName("Allatoona Creek")).toBe(false);
    expect(isTigerRiverName("Lake Lanier")).toBe(false);
    expect(tigerRiverLabel(normalised)).toBe("Chattahoochee");
    const rivers = collectTigerRiversFromBuffers([{ shp, dbf }]);
    expect([...rivers.keys()]).toEqual(["Chattahoochee"]);
    expect(rivers.get("Chattahoochee")).toEqual([line]);
  });
});

describe("crossing rule on synthetic fixtures", () => {
  const X0 = -84;
  const Y0 = 32;
  const r4 = (v: number): number => Math.round(v * 1e4) / 1e4;
  const square = (x: number, y: number): Ring => {
    const pts: [number, number][] = [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1], [x, y]];
    return pts.map(([u, v]) => [r4(u), r4(v)] as const);
  };
  // West county [X0-1, X0] and east county [X0, X0+1] share the line x = X0.
  const counties: FixtureCounty[] = [
    { id: "E", name: "East", polygons: [[square(X0, Y0)]] },
    { id: "W", name: "West", polygons: [[square(X0 - 1, Y0)]] },
  ];
  const adjacency = { E: ["W"], W: ["E"] };
  const run = (line: Line) => buildMovementEdges(counties, adjacency, new Map([["Test", [line]]]));

  it("tags a boundary that runs along a river line", () => {
    const { edges } = run([[X0 + 0.005, Y0 - 0.2], [X0 - 0.004, Y0 + 0.5], [X0 + 0.005, Y0 + 1.2]]);
    expect(edges).toHaveLength(1);
    expect(edges[0]).toMatchObject({ a: "E", b: "W", passable: true });
    expect(edges[0]?.crossing?.river).toBe("Test");
    expect(edges[0]?.crossing?.boundaryFraction).toBe(1);
  });

  it("does not tag a river that crosses the boundary perpendicularly", () => {
    const { edges, audit } = run([[X0 - 1, Y0 + 0.5], [X0 + 1, Y0 + 0.5]]);
    expect(edges[0]?.crossing).toBeNull();
    expect(audit[0]?.best?.fraction ?? 0).toBeLessThanOrEqual(2 * TOLERANCE + 1e-9);
  });

  it("does not tag a river 0.1 degree away from the boundary", () => {
    const { edges, audit } = run([[X0 + 0.1, Y0 - 0.2], [X0 + 0.1, Y0 + 1.2]]);
    expect(edges[0]?.crossing).toBeNull();
    expect(audit[0]?.best).toBeNull();
  });
});

describe("TIGER polygon reader and area water", () => {
  it("parses polygon rings as lines and keeps only River names", () => {
    const ring: Line = [[-84.5, 33.9], [-84.4, 33.9], [-84.4, 34.0], [-84.5, 33.9]];
    const shp = encodeShpPolyline(ring, 5);
    expect(parseShpPolygons(shp)).toEqual([[ring]]);
    expect(parseShpPolylines(shp)).toEqual([[]]);
    expect(parseShpLines(shp)).toEqual([[ring]]);
    const fields = [{ name: "FULLNAME", len: 40 }];
    const river = collectTigerRiversFromBuffers([
      { shp, dbf: encodeDbf([{ FULLNAME: "Chattahoochee Riv" }], fields) },
    ]);
    expect(river.get("Chattahoochee")).toEqual([ring]);
    const lake = collectTigerRiversFromBuffers([{ shp, dbf: encodeDbf([{ FULLNAME: "Lk Lanier" }], fields) }]);
    expect(lake.size).toBe(0);
  });
});

describe("TIGER endpoint credit", () => {
  const bbox: [number, number, number, number] = [-2, -2, 2, 2];
  const river = new Map<string, Line[]>([["R", [[[0, 0], [1, 0]]]]]);

  it("gives full credit only when both endpoints are near the same river", () => {
    const index = buildRiverIndex(river, bbox, TOLERANCE);
    // Both endpoints within tolerance of R: full credit.
    const both = riverFractions([[[0, 0.01], [1, 0.01]]], index, true);
    expect(both.fractions[0]?.fraction).toBeCloseTo(1, 6);
    // A land border that only starts at the river: one endpoint near, one far.
    const one = riverFractions([[[0.5, 0.01], [0.5, 1]]], index, true);
    const f = one.fractions.find((x) => x.river === "R")?.fraction ?? 0;
    expect(f).toBeLessThan(0.1);
    expect(f).toBeGreaterThan(0);
  });

  it("does not credit a chord whose endpoints touch different rivers", () => {
    const two = new Map<string, Line[]>([
      ["R", [[[0, 0], [0.1, 0]]]],
      ["S", [[[1, 1], [1.1, 1]]]],
    ]);
    const index = buildRiverIndex(two, bbox, TOLERANCE);
    const res = riverFractions([[[0.05, 0], [1.05, 1]]], index, true);
    for (const x of res.fractions) expect(x.fraction).toBeLessThan(0.1);
  });
});

describe("corroborated crossing sources", () => {
  it("records each source's best river from 0.3 even below MIN_FRACTION", () => {
    const c = classifyCorroboratedCrossing(
      [{ river: "Oconee", fraction: 0.35 }],
      [{ river: "Apalachee", fraction: 0.9 }],
      MIN_FRACTION,
      true,
    );
    expect(c?.river).toBe("Apalachee");
    expect(c?.basis).toBe(CROSSING_BASIS_TIGER_AREA);
    expect(c?.sources.naturalEarth).toEqual({ river: "Oconee", boundaryFraction: 0.35 });
    expect(c?.sources.tiger).toEqual({ river: "Apalachee", boundaryFraction: 0.9 });
    const low = classifyCorroboratedCrossing([{ river: "Flint", fraction: 0.8 }], [{ river: "Flint", fraction: 0.29 }]);
    expect(low?.sources.tiger).toBeNull();
    expect(classifyCorroboratedCrossing([{ river: "A", fraction: 0.4 }], [{ river: "B", fraction: 0.45 }])).toBeNull();
  });
});

describe("TIGER tie-break", () => {
  it("prefers the Natural Earth main stem among tied TIGER rivers", () => {
    const tiger = [
      { river: "Dead", fraction: 1 },
      { river: "Oconee", fraction: 1 },
    ];
    expect(pickTigerBest([{ river: "Oconee", fraction: 0.8 }], tiger)?.river).toBe("Oconee");
    expect(pickTigerBest([], tiger)?.river).toBe("Dead");
    expect(pickTigerBest([{ river: "Oconee", fraction: 0.8 }], [{ river: "Mulberry", fraction: 0.8 }, { river: "Oconee", fraction: 0.3 }])?.river).toBe("Mulberry");
  });

  it("labels Washington–Wilkinson as the Oconee", () => {
    expect(crossingOf(countyIdByName("Washington"), countyIdByName("Wilkinson"))?.river).toBe("Oconee");
  });
});
