// Types for the pure functions exported by scripts/prepare-movement.mjs.
import type { CheckResult, FixtureCounty } from "./prepare-geometry.mjs";

export type Point = readonly [number, number];
export type Line = readonly Point[];
export type Segment = readonly [Point, Point];

export interface GeoJsonLineFeature {
  readonly properties: { readonly name?: string | null } | null;
  readonly geometry:
    | { readonly type: "LineString"; readonly coordinates: Line }
    | { readonly type: "MultiLineString"; readonly coordinates: readonly Line[] }
    | null;
}

export interface GeoJsonCollection {
  readonly features: readonly GeoJsonLineFeature[];
}

export interface RiverIndex {
  readonly tolerance: number;
  readonly segmentsByRiver: Readonly<Record<string, number>>;
}

export interface RiverFraction {
  readonly river: string;
  readonly fraction: number;
}

export type CrossingBasis =
  | "derived: Natural Earth 10m hydrography"
  | "derived: TIGER/Line 2023 linear water"
  | "derived: Natural Earth 10m and TIGER/Line 2023 linear water"
  | "derived: TIGER/Line 2023 linear and area water"
  | "derived: Natural Earth 10m and TIGER/Line 2023 linear and area water";

export interface CrossingSource {
  readonly river: string;
  readonly boundaryFraction: number;
}

export interface Crossing {
  readonly kind: "river";
  readonly river: string;
  readonly boundaryFraction: number;
  readonly basis: CrossingBasis | string;
  readonly sources: {
    readonly naturalEarth: CrossingSource | null;
    readonly tiger: CrossingSource | null;
  };
}

export interface Edge {
  readonly a: string;
  readonly b: string;
  readonly passable: true;
  readonly basis: string;
  readonly crossing: Crossing | null;
}

export interface DbfRecord {
  readonly deleted: boolean;
  readonly [field: string]: string | boolean;
}

export declare const TOLERANCE: number;
export declare const MIN_FRACTION: number;
export declare const NEAR_MISS_MIN: number;
export declare const PASSABLE_BASIS: string;
export declare const CROSSING_BASIS: string;
export declare const CROSSING_BASIS_TIGER: string;
export declare const CROSSING_BASIS_BOTH: string;
export declare const CROSSING_BASIS_TIGER_AREA: string;
export declare const CROSSING_BASIS_BOTH_AREA: string;

export declare function parseShpPolylines(buffer: Uint8Array): Line[][];
export declare function parseShpPolygons(buffer: Uint8Array): Line[][];
export declare function parseShpLines(buffer: Uint8Array): Line[][];
export declare function parseDbf(buffer: Uint8Array): DbfRecord[];
export declare function normaliseTigerName(fullName: string | null | undefined): string;
export declare function isTigerRiverName(name: string): boolean;
export declare function tigerRiverLabel(normalisedName: string): string;
export declare function collectTigerRiversFromBuffers(
  pairs: readonly { readonly shp: Uint8Array; readonly dbf: Uint8Array }[],
): Map<string, Line[]>;
export declare function loadTigerLinearWater(dir: string): {
  rivers: Map<string, Line[]>;
  sha256: string;
  fileCount: number;
};
export declare function loadTigerAreaWater(dir: string): {
  rivers: Map<string, Line[]>;
  sha256: string;
  fileCount: number;
};
export declare function mergeRiverMaps(
  ...maps: readonly (ReadonlyMap<string, readonly Line[]> | null | undefined)[]
): Map<string, Line[]>;
export declare function collectRivers(collections: readonly GeoJsonCollection[]): Map<string, Line[]>;
export declare function countiesBbox(
  counties: readonly FixtureCounty[],
  margin?: number,
): [number, number, number, number];
export declare function buildRiverIndex(
  rivers: ReadonlyMap<string, readonly Line[]>,
  bbox: readonly [number, number, number, number],
  tolerance?: number,
): RiverIndex;
export declare function riversNear(index: RiverIndex, x: number, y: number): Set<string>;
export declare function buildSharedBoundaries(counties: readonly FixtureCounty[]): Map<string, Segment[]>;
export declare function riverFractions(
  segments: readonly Segment[],
  index: RiverIndex,
  endpointCredit?: boolean,
): { length: number; fractions: RiverFraction[] };
export declare function classifyCrossing(fractions: readonly RiverFraction[], minFraction?: number): Crossing | null;
export declare function classifyCorroboratedCrossing(
  neFractions: readonly RiverFraction[],
  tigerFractions: readonly RiverFraction[],
  minFraction?: number,
  areaWater?: boolean,
  recordMin?: number,
): Crossing | null;
export declare function adjacencyPairs(adjacency: Readonly<Record<string, readonly string[]>>): string[];
export declare function buildMovementEdges(
  counties: readonly FixtureCounty[],
  adjacency: Readonly<Record<string, readonly string[]>>,
  rivers: ReadonlyMap<string, readonly Line[]>,
  tolerance?: number,
  tigerRivers?: ReadonlyMap<string, readonly Line[]> | null,
  tigerAreaWater?: boolean,
): {
  edges: Edge[];
  audit: { a: string; b: string; length: number; best: RiverFraction | null; tigerBest: RiverFraction | null }[];
  index: RiverIndex;
  shared: Map<string, Segment[]>;
  tigerIndex: RiverIndex | null;
};
export declare function validateEdgeSet(
  edges: readonly Edge[],
  adjacency: Readonly<Record<string, readonly string[]>>,
  shared?: ReadonlyMap<string, readonly Segment[]>,
): CheckResult;
export declare function validateCornerOnlyExcluded(
  edges: readonly Edge[],
  cornerOnly?: readonly (readonly [string, string])[],
): CheckResult;
export declare function validateCobbFulton(edges: readonly Edge[], requireBothSources?: boolean): CheckResult;
export declare function validateGlynnMcIntosh(edges: readonly Edge[]): CheckResult;
export declare function validateNoBareLittleOrSouth(edges: readonly Edge[]): CheckResult;
export declare function validateTaggedCount(edges: readonly Edge[]): CheckResult;
export declare function validateRiverNames(edges: readonly Edge[], sourceNames: ReadonlySet<string>): CheckResult;

export declare const TIE_EPSILON: number;
export declare function pickTigerBest<F extends { river: string; fraction: number }>(neFractions: readonly F[], tigerFractions: readonly F[]): F | null;
