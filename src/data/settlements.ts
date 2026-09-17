import raw from "./settlements.json";

export type OcrConfidence = "clean" | "corrected" | "unparsed";

export type SeatStatusBasis =
  | "modern seat assumed; incorporation in 1940 confirmed by Census Table 5"
  | "unverified: seat not found in 1940 Census Table 5";

/** One roster seat checked against 1940 Census Table 5. */
export interface SeatEvidence {
  readonly countyId: string;
  readonly county: string;
  readonly seat: string;
  readonly matchedPlace: string | null;
  readonly population1940: number | null;
  /**
   * True when the same 1940 figure follows a fuzzy match of the place name on
   * a line of the PDF's own text layer; false when not found; null when
   * population1940 is null.
   */
  readonly population1940Corroborated: boolean | null;
  readonly urban1940: boolean | null;
  readonly ocrConfidence: OcrConfidence;
  readonly seatStatusBasis: SeatStatusBasis;
}

interface SettlementsFile {
  readonly provenance: Readonly<Record<string, unknown>>;
  readonly seats: readonly SeatEvidence[];
}

const data = raw as unknown as SettlementsFile;

export const SEAT_EVIDENCE: readonly SeatEvidence[] = data.seats;
export const SETTLEMENTS_PROVENANCE = data.provenance;

const BY_ID: ReadonlyMap<string, SeatEvidence> = new Map(SEAT_EVIDENCE.map((s) => [s.countyId, s]));

/** Seat evidence for a county id (e.g. US-GA-13067), or undefined if none. */
export function seatEvidence(countyId: string): SeatEvidence | undefined {
  return BY_ID.get(countyId);
}
