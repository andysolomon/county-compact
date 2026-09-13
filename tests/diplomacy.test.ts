import { describe, expect, it } from "vitest";
import { countyIdByName } from "../src/data/geometry";
import { admitForecast, evaluateMotions, submitAdmitMotion, tally } from "../src/sim/coalition";
import { improveRelationsOffer, relationBetween, startImproveRelations } from "../src/sim/diplomacy";
import { stepDay } from "../src/sim/engine";
import { adminIdFor, buildCobbScenario } from "../src/sim/scenario";
import { applySettlement, cessionCandidates, counterOffer, forecastSettlement, warScore } from "../src/sim/war";
import { buildBartowSettlementTraining } from "../src/sim/training";

const COBB = adminIdFor(countyIdByName("Cobb"));
const PAULDING = adminIdFor(countyIdByName("Paulding"));
const FULTON = adminIdFor(countyIdByName("Fulton"));

describe("Diplomacy (GDD §6.3)", () => {
  it("shows every acceptance term and the threshold for admitting Paulding", () => {
    const s = buildCobbScenario();
    const f = admitForecast(s, "metro-atlanta", COBB, PAULDING);
    expect(f.applicantForecast.terms.map((t) => t.value)).toEqual([4, 10.5, 20, 10, -15, -0]);
    expect(f.applicantForecast.score).toBe(29.5);
    expect(f.applicantForecast.threshold).toBe(25);
    expect(f.canSubmit).toBe(true);
    expect(f.votesNeeded).toBe(3);
    expect(f.duesAfter).toBe(6);
  });

  it("runs a motion through weekly member votes to admission without transferring counties", () => {
    const s = buildCobbScenario();
    const r = submitAdmitMotion(s, "metro-atlanta", COBB, PAULDING);
    expect(r.ok).toBe(true);
    const c = s.coalitions["metro-atlanta"]!;
    expect(tally(c.motion!)).toEqual({ yes: 1, no: 0, pending: 4 });
    expect(s.admins[COBB]!.actions).toHaveLength(1);
    let days = 0;
    while (c.motion!.status === "voting" && days < 40) { stepDay(s); days++; }
    expect(c.motion!.status).toBe("passed");
    expect(c.members).toContain(PAULDING);
    expect(s.admins[PAULDING]!.coalitionId).toBe("metro-atlanta");
    expect(s.admins[PAULDING]!.counties).toEqual([countyIdByName("Paulding")]);
    expect(s.admins[COBB]!.counties).toEqual([countyIdByName("Cobb")]);
    expect(s.admins[COBB]!.actions).toHaveLength(0);
  });

  it("blocks a second motion while one is voting and blocks non-independent applicants", () => {
    const s = buildCobbScenario();
    submitAdmitMotion(s, "metro-atlanta", COBB, PAULDING);
    const again = submitAdmitMotion(s, "metro-atlanta", COBB, adminIdFor(countyIdByName("Douglas")));
    expect(again.ok).toBe(false);
    const f = admitForecast(s, "metro-atlanta", COBB, FULTON);
    expect(f.applicantForecast.gatesMet).toBe(false);
    expect(evaluateMotions(s)).toBe(false);
  });

  it("improves relations by +10 after 30 days and enforces the pair cooldown", () => {
    const s = buildCobbScenario();
    expect(relationBetween(s, COBB, PAULDING).relations).toBe(10);
    expect(startImproveRelations(s, COBB, PAULDING)).toEqual({ ok: true });
    expect(s.admins[COBB]!.treasury).toBe(115);
    for (let i = 0; i < 30; i++) stepDay(s);
    expect(relationBetween(s, COBB, PAULDING).relations).toBe(20);
    expect(relationBetween(s, PAULDING, COBB).relations).toBe(20);
    expect(improveRelationsOffer(s, COBB, PAULDING).available).toBe(false);
  });
});

describe("Peace settlement (GDD §6.4)", () => {
  it("computes war score, cession costs, eligibility, and the receiving forecast from state", () => {
    const s = buildBartowSettlementTraining();
    const war = s.wars[0]!;
    const score = warScore(s, war);
    expect(score.occupation).toBe(25);
    expect(score.goal).toBe(25);
    expect(score.battles).toBe(10);
    expect(score.total).toBe(60);
    const cands = cessionCandidates(s, war, COBB);
    const bartow = cands.find((c) => c.county.name === "Bartow")!;
    expect(bartow.eligible).toBe(true);
    expect(bartow.cost).toBe(26);
    expect(cands.find((c) => c.county.name === "Gordon")!.reasons).toContain("no registered claim");
    expect(cands.find((c) => c.county.name === "Cherokee")!.reasons).toEqual(["not occupied", "not a war party"]);
    const f = forecastSettlement(s, war, COBB, { cessions: [bartow.county.id], reparations: 0 });
    expect(f.totalCost).toBe(26);
    expect(f.acceptable).toBe(true);
    expect(f.arbitrationInDays).toBe(27);
    expect(f.receiving.loadNow).toBe(6);
    expect(f.receiving.loadAfter).toBe(5);
    expect(f.receiving.capacity).toBe(9);
    expect(f.receiving.standingAfter).toBe(57);
    expect(f.receiving.supportChanges).toEqual([{ county: "Bartow", before: 45, after: 25 }]);
    expect(f.receiving.integrationNote).toMatch(/Integration blocked/);
    expect(f.whitePeace.available).toBe(false);
  });

  it("rejects over-limit or ineligible terms and offers a lower-cost counteroffer", () => {
    const s = buildBartowSettlementTraining();
    const war = s.wars[0]!;
    const gordon = countyIdByName("Gordon");
    const bartow = countyIdByName("Bartow");
    const f = forecastSettlement(s, war, COBB, { cessions: [bartow, gordon], reparations: 30 });
    expect(f.acceptable).toBe(false);
    expect(f.validity.some((v) => v.startsWith("Gordon"))).toBe(true);
    expect(counterOffer(s, war, COBB)).toEqual({ cessions: [bartow], reparations: 0 });
  });

  it("transfers legal control only through the accepted settlement", () => {
    const s = buildBartowSettlementTraining();
    const war = s.wars[0]!;
    const bartow = countyIdByName("Bartow");
    expect(s.counties[bartow]!.ownerAdminId).not.toBe(COBB);
    applySettlement(s, war, COBB, { cessions: [bartow], reparations: 0 });
    const c = s.counties[bartow]!;
    expect(c.ownerAdminId).toBe(COBB);
    expect(c.occupierAdminId).toBeUndefined();
    expect(c.stats).toMatchObject({ support: 25, integration: 0, autonomy: 80 });
    expect(s.occupations).toHaveLength(0);
    expect(war.status).toBe("settled");
    expect(s.admins[COBB]!.standing).toBe(57);
    expect(Object.keys(s.admins[COBB]!.truces)).toHaveLength(4);
    expect(s.admins[COBB]!.counties).toHaveLength(3);
  });
});
