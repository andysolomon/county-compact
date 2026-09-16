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

export interface Crossing {
  readonly kind: "river";
  readonly river: string;
  readonly boundaryFraction: number;
  readonly basis: string;
}

export interface Edge {
  readonly a: string;
  readonly b: string;
  readonly passable: true;
  readonly basis: string;
  readonly crossing: Crossing | null;
}

export declare const TOLERANCE: number;
export declare const MIN_FRACTION: number;
export declare const NEAR_MISS_MIN: number;
export declare const PASSABLE_BASIS: string;
export declare const CROSSING_BASIS: string;

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
): { length: number; fractions: RiverFraction[] };
export declare function classifyCrossing(fractions: readonly RiverFraction[], minFraction?: number): Crossing | null;
export declare function adjacencyPairs(adjacency: Readonly<Record<string, readonly string[]>>): string[];
export declare function buildMovementEdges(
  counties: readonly FixtureCounty[],
  adjacency: Readonly<Record<string, readonly string[]>>,
  rivers: ReadonlyMap<string, readonly Line[]>,
  tolerance?: number,
): {
  edges: Edge[];
  audit: { a: string; b: string; length: number; best: RiverFraction | null }[];
  index: RiverIndex;
  shared: Map<string, Segment[]>;
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
export declare function validateCobbFulton(edges: readonly Edge[]): CheckResult;
export declare function validateTaggedCount(edges: readonly Edge[]): CheckResult;
export declare function validateRiverNames(edges: readonly Edge[], sourceNames: ReadonlySet<string>): CheckResult;
