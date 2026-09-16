import { describe, expect, it } from "vitest";
import data from "../src/data/georgia-counties.json";
import { GEOMETRY_PROVENANCE, isAdjacencyEdge } from "../src/data/geometry";

const HISTORICAL_VERIFICATION =
  "Roster verified for 1942-02-01 against Newberry AHCBP and 1940 Census (see docs/historical-research/issue-1-roster.md). Geometry remains modern Census cartographic boundary file; 1942-dated polygons are Issue #2 work. Newberry license regime: CC BY-NC-SA 2.5 (bundled deed) or \"any lawful purpose, commercial or non-commercial\" per current download pages; not CC0 as docs/game-design.md §3.2 [S6] previously claimed (corrected in this pass).";
const ROSTER_REFERENCE = "docs/historical-research/issue-1-roster.json";
const COBB = "US-GA-13067";

const CORNER_ONLY_CONTACTS: readonly (readonly [string, string])[] = [
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

describe("provenance.block", () => {
  it("records 159 counties, preparedBy, referenceDate, and canonical provenance strings", () => {
    expect(data.counties).toHaveLength(159);
    expect(Object.keys(data.adjacency)).toHaveLength(159);
    expect(data.provenance.preparedBy).toBe("scripts/prepare-geometry.mjs");
    expect(data.provenance.referenceDate).toBe("1942-02-01");
    expect(data.provenance.historicalVerification).toBe(HISTORICAL_VERIFICATION);
    expect(data.provenance.rosterReference).toBe(ROSTER_REFERENCE);
    expect(GEOMETRY_PROVENANCE.preparedBy).toBe("scripts/prepare-geometry.mjs");
    expect(GEOMETRY_PROVENANCE.referenceDate).toBe("1942-02-01");
  });
});

describe("adjacency symmetry", () => {
  it("makes every neighbor relation mutual", () => {
    for (const [id, neighbors] of Object.entries(data.adjacency)) {
      for (const n of neighbors) {
        expect(data.adjacency[n as keyof typeof data.adjacency]).toContain(id);
        expect(isAdjacencyEdge(id, n)).toBe(true);
        expect(isAdjacencyEdge(n, id)).toBe(true);
      }
    }
  });
});

describe("corner-only exclusion", () => {
  it("omits each documented corner-only contact from both sides", () => {
    for (const [a, b] of CORNER_ONLY_CONTACTS) {
      expect(data.adjacency[a as keyof typeof data.adjacency]).not.toContain(b);
      expect(data.adjacency[b as keyof typeof data.adjacency]).not.toContain(a);
      expect(isAdjacencyEdge(a, b)).toBe(false);
      expect(isAdjacencyEdge(a, b, 0)).toBe(false);
    }
  });
});

describe("coverage", () => {
  it("reaches all 159 counties by BFS from US-GA-13067", () => {
    const seen = new Set([COBB]);
    const q = [COBB];
    while (q.length) {
      const id = q.pop()!;
      for (const n of data.adjacency[id as keyof typeof data.adjacency]) {
        if (!seen.has(n)) { seen.add(n); q.push(n); }
      }
    }
    expect(seen.size).toBe(159);
  });
});

describe("multipart preservation", () => {
  it("keeps MultiPolygon-compatible nesting so a MultiPolygon source retains parts", () => {
    const preserved = data.counties.filter((c) =>
      Array.isArray(c.polygons) &&
      c.polygons.length >= 1 &&
      Array.isArray(c.polygons[0]) &&
      Array.isArray(c.polygons[0][0]) &&
      Array.isArray(c.polygons[0][0][0]),
    );
    expect(preserved.length).toBeGreaterThanOrEqual(1);
    expect(preserved.length).toBe(159);
  });
});

describe("provenance historical-verification text", () => {
  it("matches the canonical Issue #1 historicalVerification string", () => {
    expect(data.provenance.historicalVerification).toBe(HISTORICAL_VERIFICATION);
  });
});

describe("provenance roster-reference text", () => {
  it("matches the canonical rosterReference path exactly", () => {
    expect(data.provenance.rosterReference).toBe(ROSTER_REFERENCE);
  });
});
