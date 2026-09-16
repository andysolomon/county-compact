import { describe, expect, it } from "vitest";
import { ADJACENCY, countyIdByName } from "../src/data/geometry";
import { MOVEMENT_EDGES, MOVEMENT_PROVENANCE, crossingOf, movementEdge } from "../src/data/movement";
import { CORNER_ONLY_CONTACTS, type FixtureCounty, type Ring } from "../scripts/prepare-geometry.mjs";
import {
  TOLERANCE,
  buildMovementEdges,
  validateEdgeSet,
  type Line,
} from "../scripts/prepare-movement.mjs";

const COBB = "US-GA-13067";
const FULTON = "US-GA-13121";

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

  it("tags Cobb–Fulton as a Chattahoochee crossing", () => {
    const crossing = crossingOf(FULTON, COBB);
    expect(crossing?.kind).toBe("river");
    expect(crossing?.river).toBe("Chattahoochee");
    expect(crossing?.boundaryFraction).toBeGreaterThanOrEqual(0.5);
    expect(crossing?.basis).toBe("derived: Natural Earth 10m hydrography");
  });

  it("records provenance and a passing validation report", () => {
    expect(MOVEMENT_PROVENANCE["preparedBy"]).toBe("scripts/prepare-movement.mjs");
    expect(MOVEMENT_PROVENANCE["tolerance"]).toBe(TOLERANCE);
    const report = MOVEMENT_PROVENANCE["validationReport"] as { ok: boolean; counts: { tagged: number } };
    expect(report.ok).toBe(true);
    expect(report.counts.tagged).toBeGreaterThan(0);
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
