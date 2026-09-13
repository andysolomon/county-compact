import { describe, expect, it } from "vitest";
import { countyIdByName } from "../src/data/geometry";
import { dayOf } from "../src/sim/calendar";
import { availableW, forecastBudget } from "../src/sim/economy";
import { stepDay } from "../src/sim/engine";
import { activeDecisions, resolveDecision } from "../src/sim/events";
import { startProject } from "../src/sim/projects";
import { adminIdFor, buildCobbScenario } from "../src/sim/scenario";
import type { GameState } from "../src/sim/types";

const COBB = countyIdByName("Cobb");
const COBB_ADM = adminIdFor(COBB);

function advanceTo(state: GameState, day: number): void {
  while (state.day < day) stepDay(state);
}

describe("Cobb opening (GDD §4.1, §6.1)", () => {
  it("has the authored opening parameters and a +8 C / +4 M monthly forecast", () => {
    const s = buildCobbScenario();
    const cobb = s.counties[COBB]!;
    const adm = s.admins[COBB_ADM]!;
    expect(adm.treasury).toBe(120);
    expect(adm.materials).toBe(20);
    expect(cobb.stats).toMatchObject({ workforce: 12, agriculture: 3, industry: 1, commerce: 4, transport: 1, power: 1, services: 14, support: 65, autonomy: 0, integration: 100 });
    expect(cobb.allocation).toMatchObject({ agriculture: 3, industry: 1, services: 2, security: 1 });
    expect(availableW(cobb)).toBe(5);
    const f = forecastBudget(s, COBB_ADM);
    expect(f.revenueTotal).toBe(22);
    expect(f.expenditureTotal).toBe(14);
    expect(f.net).toBe(8);
    expect(f.materialsNet).toBe(4);
    expect(f.load).toBe(1);
    expect(f.capacity).toBe(6);
  });

  it("gives every county a start whose recurring income exceeds essentials by at least 2 C", () => {
    const s = buildCobbScenario();
    const failures: string[] = [];
    for (const adm of Object.values(s.admins)) {
      const f = forecastBudget(s, adm.id);
      if (f.net < 2) failures.push(`${adm.name}: net ${f.net}`);
      const county = s.counties[adm.seatCountyId]!;
      if (county.stats.workforce < 3 || county.stats.commerce < 1 || adm.treasury < 40) failures.push(`${adm.name}: below constitutional minimum`);
      if (availableW(county) < 0) failures.push(`${adm.name}: over-allocated workforce`);
    }
    expect(failures).toEqual([]);
    expect(Object.keys(s.counties)).toHaveLength(159);
    expect(Object.values(s.admins).filter((a) => a.coalitionId)).toHaveLength(30);
  });
});

describe("Narrated first year, February–June 1942 (GDD §9.2)", () => {
  it("reconciles the cash ledger through the transport project and Bell E01/E02", () => {
    const s = buildCobbScenario();
    // February: fund transport for 36 C / 10 M, reserving 2 W.
    expect(startProject(s, COBB, "transport")).toEqual({ ok: true });
    const adm = s.admins[COBB_ADM]!;
    expect(adm.treasury).toBe(84);
    expect(adm.materials).toBe(10);
    expect(availableW(s.counties[COBB]!)).toBe(3);

    // 19 Feb: E01 fires and pauses; accept obligations for 20 C / 4 M.
    advanceTo(s, dayOf(1942, 2, 19));
    const e01 = activeDecisions(s).find((d) => d.eventId === "E01");
    expect(e01).toBeDefined();
    expect(s.paused).toBe(true);
    expect(resolveDecision(s, e01!.id, "A")).toEqual({ ok: true });
    expect(adm.treasury).toBe(64);
    expect(adm.materials).toBe(6);
    expect(s.counties[COBB]!.bell?.state).toBe("accepted");

    // Month-end +8 brings treasury to 72; materials +4.
    advanceTo(s, dayOf(1942, 2, 28));
    expect(adm.treasury).toBe(72);
    expect(adm.materials).toBe(10);
    // March ends at 80.
    advanceTo(s, dayOf(1942, 3, 31));
    expect(adm.treasury).toBe(80);

    // 2 April: E02 fires; fund 24 C / 8 M, reserve 1 W liaison.
    advanceTo(s, dayOf(1942, 4, 2));
    const e02 = activeDecisions(s).find((d) => d.eventId === "E02");
    expect(e02).toBeDefined();
    expect(resolveDecision(s, e02!.id, "A")).toEqual({ ok: true });
    expect(adm.treasury).toBe(56);
    expect(s.counties[COBB]!.allocation.liaison).toBe(1);
    expect(s.counties[COBB]!.bell?.state).toBe("construction");
    expect(availableW(s.counties[COBB]!)).toBe(2);
    advanceTo(s, dayOf(1942, 4, 30));
    expect(adm.treasury).toBe(64);

    // Early May: transport completes, T 1→2, 2 W returned, surplus +8 → +7.
    advanceTo(s, dayOf(1942, 5, 2));
    expect(s.counties[COBB]!.project).toBeUndefined();
    expect(s.counties[COBB]!.stats.transport).toBe(2);
    expect(availableW(s.counties[COBB]!)).toBe(4);
    expect(s.paused).toBe(true);
    expect(forecastBudget(s, COBB_ADM).net).toBe(7);
    advanceTo(s, dayOf(1942, 5, 31));
    expect(adm.treasury).toBe(71);
    // Materials never negative along the way.
    expect(adm.materials).toBeGreaterThanOrEqual(0);
  });

  it("applies the no-spend default when a decision window lapses and closes the chain when the review fails", () => {
    const s = buildCobbScenario();
    advanceTo(s, dayOf(1942, 2, 19));
    expect(activeDecisions(s)).toHaveLength(1);
    advanceTo(s, dayOf(1942, 3, 21)); // 30-day window lapses on 21 Mar
    expect(activeDecisions(s)).toHaveLength(0);
    const bell = s.counties[COBB]!.bell!;
    expect(bell.state).toBe("candidate");
    expect(bell.reviewDay).toBe(dayOf(1942, 3, 21) + 90);
    advanceTo(s, bell.reviewDay! + 1);
    expect(s.counties[COBB]!.bell?.state).toBe("closed");
    expect(s.ledger.some((l) => l.text.startsWith("Historical development did not occur here"))).toBe(true);
  });

  it("blocks a project without materials or workforce and says why", () => {
    const s = buildCobbScenario();
    s.admins[COBB_ADM]!.materials = 5;
    const r = startProject(s, COBB, "transport");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/Needs 10 M/);
  });
});
