// Types for the pure functions exported by scripts/prepare-settlements.mjs.

export type OcrConfidence = "clean" | "corrected" | "unparsed";

export interface TsvWord {
  readonly text: string;
  readonly conf: number;
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
  readonly cy: number;
}

export interface TextLine {
  readonly cy: number;
  readonly text: string;
}

export interface RowReads {
  readonly cy: number;
  readonly reads: readonly string[];
}

export interface PlaceRecord {
  readonly place: string;
  readonly nameVariants: readonly string[];
  readonly counties: readonly string[];
  readonly urban1940: boolean | null;
  readonly population1940: number | null;
  readonly population1930: number | null;
  readonly ocrConfidence: OcrConfidence;
  readonly panel: string;
  readonly cy: number;
}

export interface SeatEvidenceRow {
  readonly countyId: string;
  readonly county: string;
  readonly seat: string;
  readonly matchedPlace: string | null;
  readonly population1940: number | null;
  /** Internal sanity reference only; not published in settlements.json. */
  readonly population1930?: number | null;
  readonly population1940Corroborated: boolean | null;
  readonly urban1940: boolean | null;
  readonly ocrConfidence: OcrConfidence;
  readonly seatStatusBasis: string;
}

export interface CheckResult {
  readonly name: string;
  readonly pass: boolean;
  readonly details?: Record<string, unknown>;
}

export interface SpotCheck {
  readonly county: string;
  readonly seat: string;
  readonly population1940: number;
  readonly note: string;
}

export interface NulledPopulation {
  readonly county: string;
  readonly seat: string;
  readonly population1940: number | null;
  readonly reason: "seat-population-below-100" | "duplicate-population1940";
}

export declare const SANITY_LO: number;
export declare const SANITY_HI: number;
export declare const ALIGN_TOL: number;
export declare const MIN_SEAT_POPULATION: number;
export declare const MATCHED_SEAT_BASIS: string;
export declare const UNMATCHED_SEAT_BASIS: string;
export declare const SPOT_CHECKS: readonly SpotCheck[];

export declare function normalizeName(s: string): string;
export declare function collapseOcrConfusions(normalized: string): string;
export declare function levenshtein(a: string, b: string): number;
export declare function namesMatch(a: string, b: string): boolean;
export declare function countyMatch(a: string, b: string): boolean;
export declare function parsePopulationToken(raw: string): {
  value: number | null;
  confidence: OcrConfidence;
};
export declare function populationSanity(pop1940: number | null, pop1930: number | null): boolean;
export declare function parsePopulationPair(
  raw1940: string,
  raw1930: string,
): {
  population1940: number | null;
  population1930: number | null;
  ocrConfidence: OcrConfidence;
};
export declare function loadSeats(rosterSrc?: string): Record<string, string>;
export declare function findCountiesInText(text: string, countyNames: readonly string[]): string[];
export declare function parseTsvWords(text: string): TsvWord[];
export declare function clusterLines(
  words: readonly TsvWord[],
  opts?: { tol?: number; minHeight?: number; maxHeight?: number },
): TextLine[];
export declare function parseRowReads(text: string): RowReads[];
export declare function voteReads(reads: readonly string[]): {
  value: number | null;
  confidence: OcrConfidence;
  votes: number;
};
export declare function placeNameVariants(lineText: string): string[];
export declare function assignRowsToPlaces(
  placeLines: readonly TextLine[],
  rows: readonly RowReads[],
  tol?: number,
): { rows: RowReads[]; ambiguous: boolean }[];
export declare function assemblePanelRows(
  panel: {
    id?: string;
    placeLines: readonly TextLine[];
    countyLines: readonly TextLine[];
    pop1940Rows: readonly RowReads[];
    pop1930Rows: readonly RowReads[];
  },
  countyNames: readonly string[],
): PlaceRecord[];
export declare function parseOcrDirectory(ocrDir: string, countyNames: readonly string[]): PlaceRecord[];
export declare function matchSeatToPlaces(
  seat: string,
  county: string,
  places: readonly PlaceRecord[],
): (PlaceRecord & { ambiguous?: boolean }) | null;
export declare function buildSeatEvidence(
  seats: Readonly<Record<string, string>>,
  counties: readonly { id: string; name: string }[],
  places: readonly PlaceRecord[],
): SeatEvidenceRow[];
export declare function findDuplicatePopulations(
  evidence: readonly SeatEvidenceRow[],
): { population1940: number; seats: string[] }[];
export declare function applyIntegrityNulls(evidence: readonly SeatEvidenceRow[]): {
  rows: SeatEvidenceRow[];
  nulled: NulledPopulation[];
};
export declare function corroboratePopulation(
  placeName: string | null,
  value: number | null,
  textLines: readonly string[],
): boolean | null;
export declare function applyCorroboration(
  evidence: readonly SeatEvidenceRow[],
  textLayer: string,
): SeatEvidenceRow[];
export declare function checkSpotChecks(
  evidence: readonly SeatEvidenceRow[],
  spotChecks?: readonly SpotCheck[],
): (SpotCheck & { matchedPlace: string | null; parsed: number | null; pass: boolean })[];
export declare function validateSeatEvidence(
  seats: Readonly<Record<string, string>>,
  counties: readonly { id: string; name: string }[],
  evidence: readonly SeatEvidenceRow[],
): CheckResult[];
export declare function countiesInField(text: string, countyNames: readonly string[]): string[];
export declare function textLayerContradiction(
  placeName: string | null,
  county: string,
  value: number | null,
  textLines: readonly string[],
  population1930?: number | null,
): number | null;
export declare function applyTextLayerVeto(
  evidence: readonly SeatEvidenceRow[],
  textLayer: string,
): { rows: SeatEvidenceRow[]; nulled: (NulledPopulation | VetoedPopulation)[] };
export interface VetoedPopulation {
  readonly county: string;
  readonly seat: string;
  readonly population1940: number;
  readonly textLayer: number;
  readonly reason: "contradicted-by-text-layer";
}
