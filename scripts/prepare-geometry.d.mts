// Types for the pure functions exported by scripts/prepare-geometry.mjs.

export type Ring = readonly (readonly [number, number])[];

export interface FixtureCounty {
  id: string;
  name: string;
  polygons: readonly (readonly Ring[])[];
  centroid?: readonly [number, number];
  bbox?: readonly [number, number, number, number];
  historicalStatus?: string;
}

export interface CheckResult {
  readonly name: string;
  readonly pass: boolean;
  readonly details?: Record<string, unknown>;
}

export declare const HISTORICAL_STATUS: {
  readonly undated: "boundary-change-undated-1915-1952";
  readonly censusFootnote: "census-1940-footnote-change-not-in-newberry";
  readonly noChange: "no-recorded-change-1942-modern-polygon";
};

export declare const CORNER_ONLY_CONTACTS: readonly (readonly [string, string])[];

export declare function addCentroidsAndBboxes<T extends FixtureCounty>(counties: T[]): void;
export declare function assignHistoricalStatus<T extends FixtureCounty>(counties: T[]): T[];
export declare function validateCoverage(counties: readonly FixtureCounty[]): CheckResult;
export declare function validateGeometryValidity(counties: readonly FixtureCounty[]): CheckResult;
export declare function validateTopology(counties: readonly FixtureCounty[]): CheckResult;
export declare function validateOverlapsAndGaps(counties: readonly FixtureCounty[]): CheckResult;
