import { describe, expect, it } from "vitest";
import data from "../src/data/georgia-counties.json";
import {
  HISTORICAL_STATUS,
  addCentroidsAndBboxes,
  assignHistoricalStatus,
  validateCoverage,
  validateGeometryValidity,
  validateOverlapsAndGaps,
  validateTopology,
  type CheckResult,
  type FixtureCounty,
  type Ring,
} from "../scripts/prepare-geometry.mjs";

// Fixture units are cells on a Georgia-sized board so the coverage check
// (latitude outline, Atlantic coast at the eastern extent) can pass.
const X0 = -85.6;
const Y0 = 30.4;
const W = 2.4;
const H = 2.3;
const px = (u: number): number => Math.round((X0 + u * W) * 1e4) / 1e4;
const py = (v: number): number => Math.round((Y0 + v * H) * 1e4) / 1e4;

function ring(points: readonly (readonly [number, number])[]): Ring {
  const r = points.map(([u, v]) => [px(u), py(v)] as const);
  return [...r, r[0]!];
}

function county(id: string, ...rings: Ring[]): FixtureCounty {
  return { id, name: id, polygons: rings.map((r) => [r]) };
}

function board(...counties: FixtureCounty[]): FixtureCounty[] {
  addCentroidsAndBboxes(counties);
  return counties;
}

const square = (u: number, v: number, size = 1): Ring =>
  ring([[u, v], [u + size, v], [u + size, v + size], [u, v + size]]);

const detail = (r: CheckResult, k: string): unknown => r.details?.[k];

const validGrid = (): FixtureCounty[] =>
  board(county("A", square(0, 0)), county("B", square(1, 0)), county("C", square(0, 1)), county("D", square(1, 1)));

describe("validators on a valid 2x2 grid", () => {
  it("passes coverage, geometryValidity, topology, and overlapsAndGaps", () => {
    const counties = validGrid();
    expect(validateCoverage(counties).pass).toBe(true);
    expect(validateGeometryValidity(counties).pass).toBe(true);
    expect(validateTopology(counties).pass).toBe(true);
    const gaps = validateOverlapsAndGaps(counties);
    expect(gaps.pass).toBe(true);
    expect(detail(gaps, "gaps")).toBe(0);
    expect(detail(gaps, "areaRelativeError")).toBe(0);
  });
});

describe("mutation fixtures fail the relevant check", () => {
  it("two overlapping squares fail topology and overlapsAndGaps", () => {
    const counties = board(county("A", square(0, 0, 2)), county("B", square(1, 1, 2)));
    const topology = validateTopology(counties);
    expect(topology.pass).toBe(false);
    expect(detail(topology, "crossCountyCrossings")).toBeGreaterThan(0);
    const overlaps = validateOverlapsAndGaps(counties);
    expect(overlaps.pass).toBe(false);
    expect(detail(overlaps, "areaBalanced")).toBe(false);
  });

  it("three counties around a hole fail overlapsAndGaps with one gap", () => {
    const counties = board(
      county("A", ring([[0, 0], [3, 0], [3, 1], [2, 1], [1, 1], [0, 1]])),
      county("B", ring([[0, 1], [1, 1], [1, 2], [2, 2], [3, 2], [3, 3], [0, 3]])),
      county("C", ring([[2, 1], [3, 1], [3, 2], [2, 2]])),
    );
    expect(validateTopology(counties).pass).toBe(true);
    const gaps = validateOverlapsAndGaps(counties);
    expect(gaps.pass).toBe(false);
    expect(detail(gaps, "gaps")).toBe(1);
    expect(detail(gaps, "areaBalanced")).toBe(false);
  });

  it("a bow-tie ring fails geometryValidity", () => {
    const counties = board(county("A", ring([[0, 0], [2, 2], [2, 0], [0, 2]])));
    const validity = validateGeometryValidity(counties);
    expect(validity.pass).toBe(false);
    expect(detail(validity, "selfIntersections")).toBeGreaterThan(0);
  });

  it("a board whose eastern extent is far west fails coverage", () => {
    const counties = validGrid().map((c) => ({
      ...c,
      polygons: c.polygons.map((p) => p.map((r) => r.map(([x, y]) => [x - 3, y] as const))),
    }));
    addCentroidsAndBboxes(counties);
    const coverage = validateCoverage(counties);
    expect(coverage.pass).toBe(false);
    expect(detail(coverage, "atlanticCoast")).toBe(false);
    expect(detail(coverage, "atlanticCoastMaxX")).toBeLessThan(-81);
  });
});

describe("assignHistoricalStatus", () => {
  it("throws when a listed county name matches no county", () => {
    expect(() => assignHistoricalStatus(validGrid())).toThrow(/match no county/);
  });
});

describe("bundled geometry validation report", () => {
  const report = data.provenance.validationReport;
  const check = (name: string) => report.checks.find((c) => c.name === name);

  it("records passing geometryValidity, topology, and overlapsAndGaps checks", () => {
    expect(report.ok).toBe(true);
    for (const name of ["coverage", "geometryValidity", "topology", "overlapsAndGaps"]) {
      expect(check(name)?.pass, name).toBe(true);
    }
  });

  it("records the source checksum and vintage", () => {
    expect(data.provenance.sourceSha256).toBe("e540149b7525e71ee6b6cab6dea2a95205f11e0c3e7374d27a7c9c47ea96e8c0");
    expect(data.provenance.sourceVintage).toMatch(/^unrecorded in plotly\/datasets/);
  });
});

describe("bundled historicalStatus", () => {
  it("gives every county a valid status with the expected counts", () => {
    const valid = new Set<string>(Object.values(HISTORICAL_STATUS));
    const counts = new Map<string, number>();
    for (const c of data.counties) {
      expect(valid.has(c.historicalStatus), c.name).toBe(true);
      counts.set(c.historicalStatus, (counts.get(c.historicalStatus) ?? 0) + 1);
    }
    expect(counts.get(HISTORICAL_STATUS.undated)).toBe(38);
    expect(counts.get(HISTORICAL_STATUS.censusFootnote)).toBe(4);
    expect(counts.get(HISTORICAL_STATUS.noChange)).toBe(117);
  });

  it("flags Gordon with the census-footnote status", () => {
    expect(data.counties.find((c) => c.name === "Gordon")?.historicalStatus).toBe(HISTORICAL_STATUS.censusFootnote);
  });
});
