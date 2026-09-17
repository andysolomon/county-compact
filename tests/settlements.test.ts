import { describe, expect, it } from "vitest";
import { GEOMETRY } from "../src/data/geometry";
import { SEATS } from "../src/data/roster";
import { SEAT_EVIDENCE, SETTLEMENTS_PROVENANCE, seatEvidence } from "../src/data/settlements";
import {
  MATCHED_SEAT_BASIS,
  MIN_SEAT_POPULATION,
  SPOT_CHECKS,
  UNMATCHED_SEAT_BASIS,
  applyIntegrityNulls,
  assemblePanelRows,
  checkSpotChecks,
  collapseOcrConfusions,
  corroboratePopulation,
  findDuplicatePopulations,
  matchSeatToPlaces,
  namesMatch,
  normalizeName,
  parsePopulationPair,
  placeNameVariants,
  populationSanity,
  textLayerContradiction,
  voteReads,
  type PlaceRecord,
  type SeatEvidenceRow,
} from "../scripts/prepare-settlements.mjs";

const COBB = "US-GA-13067";
const FULTON = "US-GA-13121";

function row(county: string, seat: string, population1940: number | null, matchedPlace: string | null = seat): SeatEvidenceRow {
  return {
    countyId: `id-${county}`,
    county,
    seat,
    matchedPlace,
    population1940,
    population1930: population1940,
    population1940Corroborated: null,
    urban1940: null,
    ocrConfidence: population1940 == null ? "unparsed" : "clean",
    seatStatusBasis: matchedPlace == null ? UNMATCHED_SEAT_BASIS : MATCHED_SEAT_BASIS,
  };
}

describe("settlements data", () => {
  it("has 159 records keyed to the county ids, sorted by countyId", () => {
    const ids = GEOMETRY.map((c) => c.id).sort();
    expect(SEAT_EVIDENCE).toHaveLength(159);
    expect(SEAT_EVIDENCE.map((s) => s.countyId)).toEqual(ids);
    expect(new Set(SEAT_EVIDENCE.map((s) => s.countyId)).size).toBe(159);
    for (const r of SEAT_EVIDENCE) {
      expect(r.seat).toBe(SEATS[r.county]);
      expect(seatEvidence(r.countyId)).toBe(r);
    }
  });

  it("matches every spot check exactly", () => {
    const spot = checkSpotChecks(SEAT_EVIDENCE);
    expect(spot.map((s) => [s.seat, s.parsed])).toEqual(SPOT_CHECKS.map((s) => [s.seat, s.population1940]));
    expect(spot.every((s) => s.pass)).toBe(true);
    expect(seatEvidence(COBB)?.population1940).toBe(8667);
    expect(seatEvidence(FULTON)?.population1940).toBe(302288);
  });

  it("never shares a 1940 population between different places", () => {
    expect(findDuplicatePopulations(SEAT_EVIDENCE)).toEqual([]);
    const values = SEAT_EVIDENCE.flatMap((s) => (s.population1940 == null ? [] : [s.population1940]));
    expect(new Set(values).size).toBe(values.length);
  });

  it("has no seat below the minimum plausible population", () => {
    for (const r of SEAT_EVIDENCE) {
      if (r.population1940 != null) expect(r.population1940).toBeGreaterThanOrEqual(MIN_SEAT_POPULATION);
    }
  });

  it("sets population1940Corroborated null exactly when population1940 is null", () => {
    for (const r of SEAT_EVIDENCE) {
      expect(r.population1940Corroborated === null).toBe(r.population1940 === null);
    }
  });

  it("uses the unverified basis for every unmatched record", () => {
    for (const r of SEAT_EVIDENCE.filter((s) => s.matchedPlace == null)) {
      expect(r.seatStatusBasis).toBe(UNMATCHED_SEAT_BASIS);
      expect(r.population1940).toBeNull();
      expect(r.ocrConfidence).toBe("unparsed");
    }
    for (const r of SEAT_EVIDENCE.filter((s) => s.matchedPlace != null)) {
      expect(r.seatStatusBasis).toBe(MATCHED_SEAT_BASIS);
    }
  });

  it("records provenance and a passing validation report", () => {
    const source = SETTLEMENTS_PROVENANCE["source"] as { sha256: string; bytes: number; licence: string };
    expect(source.sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(source.bytes).toBe(23390865);
    expect(source.licence).toBe("US Government work, public domain");
    expect(SETTLEMENTS_PROVENANCE["preparedBy"]).toBe("scripts/prepare-settlements.mjs");
    expect(SETTLEMENTS_PROVENANCE["ranAt"]).toBe("2026-09-16T00:00:00.000Z");
    const report = SETTLEMENTS_PROVENANCE["validationReport"] as { ok: boolean; checks: { name: string; pass: boolean }[] };
    expect(report.ok).toBe(true);
    expect(report.checks.map((c) => c.name)).toEqual(
      expect.arrayContaining(["spotChecksExact", "noDuplicatePopulation1940", "seatPopulationAtLeast100"]),
    );
  });
});

describe("duplicate-population check", () => {
  it("reports a 1940 value shared by two different places", () => {
    const rows = [row("Hall", "Gainesville", 10243), row("Franklin", "Carnesville", 10243), row("Cobb", "Marietta", 8667)];
    expect(findDuplicatePopulations(rows)).toEqual([
      { population1940: 10243, seats: ["Hall: Gainesville", "Franklin: Carnesville"] },
    ]);
  });

  it("nulls every sharer and seats under 100, with reasons", () => {
    const rows = [
      row("McDuffie", "Thomson", 6306),
      row("Upson", "Thomaston", 6306),
      row("Brooks", "Quitman", 45),
      row("Bibb", "Macon", 57865),
    ];
    const { rows: out, nulled } = applyIntegrityNulls(rows);
    expect(out.map((r) => r.population1940)).toEqual([null, null, null, 57865]);
    expect(out.slice(0, 3).every((r) => r.ocrConfidence === "unparsed")).toBe(true);
    expect(nulled).toEqual([
      { county: "Brooks", seat: "Quitman", population1940: 45, reason: "seat-population-below-100" },
      { county: "McDuffie", seat: "Thomson", population1940: 6306, reason: "duplicate-population1940" },
      { county: "Upson", seat: "Thomaston", population1940: 6306, reason: "duplicate-population1940" },
    ]);
    expect(findDuplicatePopulations(out)).toEqual([]);
  });

  it("ignores unmatched rows and null populations", () => {
    expect(findDuplicatePopulations([row("A", "X", null), row("B", "Y", null), row("C", "Z", 500, null)])).toEqual([]);
  });
});

describe("exact spot checks", () => {
  const exact = SPOT_CHECKS.map((s) => row(s.county, s.seat, s.population1940));

  it("passes only on identical values", () => {
    expect(checkSpotChecks(exact).every((s) => s.pass)).toBe(true);
    const augustaOff = exact.map((r) => (r.seat === "Augusta" ? { ...r, population1940: 65019 } : r));
    const spot = checkSpotChecks(augustaOff);
    expect(spot.find((s) => s.seat === "Augusta")?.pass).toBe(false);
    expect(spot.filter((s) => !s.pass)).toHaveLength(1);
  });

  it("fails an unmatched or null spot-check seat", () => {
    const missing = exact.map((r) => (r.seat === "Macon" ? row("Bibb", "Macon", null, null) : r));
    expect(checkSpotChecks(missing).find((s) => s.seat === "Macon")?.pass).toBe(false);
  });

  it("uses the page values", () => {
    expect(Object.fromEntries(SPOT_CHECKS.map((s) => [s.seat, s.population1940]))).toEqual({
      Atlanta: 302288,
      Macon: 57865,
      Savannah: 95996,
      Augusta: 65919,
      Columbus: 53280,
      Marietta: 8667,
    });
  });
});

describe("row alignment and voting", () => {
  it("accepts a value only on a 2-of-3 majority", () => {
    expect(voteReads(["53, 280", "53,280", "53,280"])).toEqual({ value: 53280, confidence: "clean", votes: 3 });
    expect(voteReads(["6,306", "6, 396", "6, 396"])).toEqual({ value: 6396, confidence: "corrected", votes: 2 });
    expect(voteReads(["8,807", "8,867", "8,667"]).value).toBeNull();
    expect(voteReads(["4,45", "", "4,450"]).value).toBeNull();
  });

  it("pairs populations by y position, not list order, and nulls ambiguity", () => {
    const counties = ["Hall", "Franklin", "Cook", "Polk"];
    const recs = assemblePanelRows(
      {
        id: "t",
        placeLines: [
          { cy: 100, text: "Carnesville._._---" },
          { cy: 133, text: "Cecil . . oimenae" },
          { cy: 166, text: "Cedartown *....--" },
          { cy: 194, text: "Gainesville*." },
        ],
        countyLines: [
          { cy: 101, text: "Franklin........" },
          { cy: 134, text: "Cook" },
          { cy: 165, text: "Polk." },
          { cy: 195, text: "Hall" },
        ],
        // No row for Cecil; one row sits equidistant from Cedartown and Gainesville.
        pop1940Rows: [
          { cy: 99, reads: ["361", "361", "361"] },
          { cy: 167, reads: ["9, 025", "9,025", "9,025"] },
          { cy: 180, reads: ["10,243", "10,243", "10,243"] },
        ],
        pop1930Rows: [
          { cy: 100, reads: ["404", "404", "404"] },
          { cy: 133, reads: ["275", "275", "275"] },
        ],
      },
      counties,
    );
    const by = Object.fromEntries(recs.map((r) => [r.place, r]));
    expect(by["Carnesville"]?.population1940).toBe(361);
    expect(by["Cecil"]?.population1940).toBeNull();
    expect(by["Cecil"]?.ocrConfidence).toBe("unparsed");
    expect(by["Cedartown"]?.population1940).toBeNull();
    expect(by["Gainesville"]?.population1940).toBeNull();
    expect(by["Gainesville"]?.counties).toEqual(["Hall"]);
  });

  it("extracts place names up to the dot leader", () => {
    expect(placeNameVariants("College Park *...-")).toEqual(["College", "College Park"]);
    expect(placeNameVariants("Macon*. . _..._..")).toEqual(["Macon"]);
    expect(placeNameVariants("| Cartersville *_....")).toEqual(["Cartersville"]);
  });
});

describe("seat matching", () => {
  const place = (p: Partial<PlaceRecord> & { place: string; counties: string[] }): PlaceRecord => ({
    nameVariants: [p.place],
    urban1940: null,
    population1940: null,
    population1930: null,
    ocrConfidence: "unparsed",
    panel: "t",
    cy: 0,
    ...p,
  });

  it("takes populations only from the name+county row, with no bonus for having numbers", () => {
    const places = [
      place({ place: "Barnesville", counties: ["Lamar"], population1940: 3535 }),
      place({ place: "Carnesville", counties: ["Franklin"] }),
      place({ place: "Gainesville", counties: ["Hall"], population1940: 10243 }),
    ];
    const hit = matchSeatToPlaces("Carnesville", "Franklin", places);
    expect(hit?.place).toBe("Carnesville");
    expect(hit?.population1940).toBeNull();
    expect(matchSeatToPlaces("Carnesville", "Pike", places)).toBeNull();
  });
});

describe("text-layer corroboration", () => {
  const lines = [
    "Atlanta•---------- {~~ ~alb. - ------ }302, 288",
    "Columbus*------ Muscogee ______ _ 53, 280              43, 131       Franklin---------",
    "Minter-----------       Laurens---------        135                 Quitman*--------",
  ];

  it("joins split digit groups and requires the number after the name", () => {
    expect(corroboratePopulation("Atlanta", 302288, lines)).toBe(true);
    expect(corroboratePopulation("Columbus", 53280, lines)).toBe(true);
    expect(corroboratePopulation("Columbus", 53980, lines)).toBe(false);
    expect(corroboratePopulation("Quitman", 135, lines)).toBe(false);
    expect(corroboratePopulation("Atlanta", null, lines)).toBeNull();
  });
});

describe("text-layer veto", () => {
  const layer = [
    "Cartersville*-----    Bartow.-------_         6, 141    5, 250       East Juliette",
    "Covington Mills ••    Newton ________ _         317       220        Gillsville",
    "Monticello _______ Jasper___________ l, 746 l, 593",
    "Georgetown ______       Q,uitman ____ --                               345   Linwood",
    "Dublin*----------     Laurens ________ _                6,681        Hinesville",
  ];

  it("returns the layer figure only for a tight place-county-number disagreement", () => {
    expect(textLayerContradiction("Cartersville", "Bartow", 8141, layer)).toBe(6141);
    expect(textLayerContradiction("Cartersville", "Bartow", 6141, layer)).toBeNull();
    expect(textLayerContradiction("Covington", "Newton", 3900, layer)).toBeNull();
    expect(textLayerContradiction("Monticello", "Jasper", 1746, layer)).toBeNull();
    expect(textLayerContradiction("Georgetown", "Quitman", 367, layer, 345)).toBeNull();
    expect(textLayerContradiction("Dublin", "Laurens", 7814, layer, 6681)).toBeNull();
  });
});

describe("name normaliser", () => {
  it("ignores case, punctuation, and spaces", () => {
    expect(normalizeName("Marietta*")).toBe(normalizeName("marietta"));
    expect(normalizeName("Mc Rae")).toBe(normalizeName("McRae"));
    expect(normalizeName("De Kalb")).toBe(normalizeName("DeKalb"));
    expect(normalizeName("La Grange")).toBe(normalizeName("LaGrange"));
  });

  it("collapses documented OCR confusions and matches clipped names", () => {
    expect(collapseOcrConfusions("cobb")).toBe("eobb");
    expect(namesMatch("Atlanta", "Atlantar")).toBe(true);
    expect(namesMatch("Atlanta", "tlanta")).toBe(true);
    expect(namesMatch("Abbeville", "Abheville")).toBe(true);
    expect(namesMatch("Macon", "Macedonia")).toBe(false);
  });
});

describe("population sanity check", () => {
  it("parses clean and grouped thousands strings", () => {
    const clean = parsePopulationPair("57865", "53829");
    expect(clean.population1940).toBe(57865);
    expect(clean.population1930).toBe(53829);
    expect(clean.ocrConfidence).toBe("clean");
    const grouped = parsePopulationPair("302,288", "270,366");
    expect(grouped.population1940).toBe(302288);
    expect(grouped.population1930).toBe(270366);
  });

  it("corrects spacing, nulls failed sanity, malformed groups and junk", () => {
    const spaced = parsePopulationPair("8, 667", "7,638");
    expect(spaced.population1940).toBe(8667);
    expect(spaced.ocrConfidence).toBe("corrected");
    expect(populationSanity(100, 1000)).toBe(false);
    const badRatio = parsePopulationPair("100", "1000");
    expect(badRatio.population1940).toBeNull();
    expect(badRatio.population1930).toBeNull();
    expect(badRatio.ocrConfidence).toBe("unparsed");
    const junk = parsePopulationPair("abc", "12");
    expect(junk.population1940).toBeNull();
    expect(junk.population1930).toBe(12);
    expect(parsePopulationPair("4,45", "120").population1940).toBeNull();
    expect(parsePopulationPair("1 7608", "498").population1940).toBeNull();
  });
});
