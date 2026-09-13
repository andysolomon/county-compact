// Optional training scenario (GDD §9.1): copied data, a fictional marked opposing
// force, fixed reserves, and no effects on the campaign save. It exists so the
// peace-settlement workflow can be exercised against real state and rules.
import { countyIdByName } from "../data/geometry";
import { dayOf } from "./calendar";
import { adminIdFor, buildCobbScenario } from "./scenario";
import type { GameState } from "./types";

export function buildBartowSettlementTraining(): GameState {
  const state = buildCobbScenario("Cobb");
  state.scenario = "training-bartow-1944";
  state.day = dayOf(1944, 9, 14);
  state.log = [{ day: state.day, kind: "info", text: "Training scenario: a fictional limited war over an adjacent claim on Bartow. No campaign effects." }];
  state.ledger = [];

  const cobbId = countyIdByName("Cobb");
  const pauldingId = countyIdByName("Paulding");
  const bartowId = countyIdByName("Bartow");
  const gordonId = countyIdByName("Gordon");
  const cobb = state.admins[adminIdFor(cobbId)]!;
  const paulding = state.admins[adminIdFor(pauldingId)]!;
  const bartowAdm = state.admins[adminIdFor(bartowId)]!;

  // Cobb by 1944: transport 2, an office, Bell operating, Paulding peacefully united.
  const cobbCounty = state.counties[cobbId]!;
  cobbCounty.stats.transport = 2;
  cobbCounty.stats.offices = 1;
  cobbCounty.stats.services = 18;
  cobbCounty.stats.workforce = 15;
  cobbCounty.bell = { state: "operating", constructionStartDay: dayOf(1942, 4, 2), constructionDays: 395 };
  cobbCounty.allocation = { agriculture: 3, industry: 1, services: 2, security: 3, project: 0, liaison: 0, contract: 3 };
  const pauldingCounty = state.counties[pauldingId]!;
  pauldingCounty.ownerAdminId = cobb.id;
  pauldingCounty.stats.integration = 75;
  pauldingCounty.stats.autonomy = 60;
  pauldingCounty.stats.support = 58;
  cobb.counties = [cobbId, pauldingId];
  delete state.admins[paulding.id];
  cobb.treasury = 142;
  cobb.materials = 26;
  cobb.standing = 62;
  cobb.exhaustion = 31;

  // Bartow's administration: exhausted, its seat occupied.
  bartowAdm.exhaustion = 43;
  const bartow = state.counties[bartowId]!;
  bartow.stats.support = 45;
  bartow.stats.industry = 1;
  bartow.stats.commerce = 4;
  bartow.allocation.industry = 1;

  // Forces: three Cobb battalions (two forward), one league battalion in Floyd.
  const cobbBattalion = Object.values(state.formations).find((f) => f.ownerAdminId === cobb.id)!;
  cobbBattalion.strength = 74;
  cobbBattalion.countyId = bartowId;
  state.formations["f-train-2"] = { id: "f-train-2", kind: "battalion", ownerAdminId: cobb.id, countyId: gordonId, homeCountyId: cobbId, strength: 88, morale: 70 };
  state.formations["f-train-3"] = { id: "f-train-3", kind: "battalion", ownerAdminId: cobb.id, countyId: cobbId, homeCountyId: cobbId, strength: 100, morale: 80 };
  state.formations["f-train-nw"] = { id: "f-train-nw", kind: "battalion", ownerAdminId: adminIdFor(countyIdByName("Floyd")), countyId: countyIdByName("Floyd"), homeCountyId: countyIdByName("Floyd"), strength: 61, morale: 40 };

  const defenders = ["Bartow", "Floyd", "Gordon", "Whitfield"].map((n) => adminIdFor(countyIdByName(n)));
  const startDay = state.day - 153; // arbitration in 27 days
  state.wars.push({
    id: "w-train-1",
    aggressorAdminId: cobb.id,
    defenderAdminIds: defenders,
    goal: { kind: "claim", countyId: bartowId },
    startDay,
    lastBattleDay: state.day - 20,
    battles: { aggressorWins: 3, defenderWins: 1 },
    prewarCounties: Object.fromEntries([[cobb.id, 2], ...defenders.map((d) => [d, 1] as const)]),
    registered: true,
    status: "active",
  });
  state.claims.push({ countyId: bartowId, claimantAdminId: cobb.id, registeredDay: dayOf(1944, 3, 12) });
  state.claims.push({ countyId: countyIdByName("Cherokee"), claimantAdminId: cobb.id, registeredDay: dayOf(1944, 5, 2) });
  state.occupations.push({ countyId: bartowId, occupierAdminId: cobb.id, days: 41 });
  state.occupations.push({ countyId: gordonId, occupierAdminId: cobb.id, days: 12 });
  bartow.occupierAdminId = cobb.id;
  bartow.occupationDays = 41;
  const gordon = state.counties[gordonId]!;
  gordon.occupierAdminId = cobb.id;
  gordon.occupationDays = 12;
  return state;
}
