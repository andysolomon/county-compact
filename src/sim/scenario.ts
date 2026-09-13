import { COALITIONS, ECONOMIC_TIERS } from "../data/coalitions";
import { GEOMETRY, countyIdByName } from "../data/geometry";
import { MOUNTAIN, PIEDMONT_MIN_LAT, SEATS, WETLAND } from "../data/roster";
import { CAMPAIGN_START_DAY } from "./calendar";
import { RULESET_VERSION, STANDING } from "./rules";
import type { Administration, Allocation, Coalition, County, CountyStats, GameState, RelationRecord, Terrain } from "./types";

export function adminIdFor(countyId: string): string {
  return `adm:${countyId}`;
}

interface Baseline {
  stats: CountyStats;
  treasury: number;
  materials: number;
  battalion: boolean;
  profile: Administration["profile"];
}

const INDUSTRIAL = new Set<string>(ECONOMIC_TIERS.industrial);
const MIXED = new Set<string>(ECONOMIC_TIERS.mixed);
const AGRICULTURAL = new Set<string>(ECONOMIC_TIERS.agricultural);
const MEMBERS = new Set<string>(COALITIONS.flatMap((c) => c.members));

function stats(p: Partial<CountyStats> & Pick<CountyStats, "workforce" | "agriculture" | "industry" | "commerce" | "transport" | "power" | "services">): CountyStats {
  return { support: 55, autonomy: 0, integration: 100, offices: 0, ...p };
}

/** Baseline start for every county: explicit design estimates that satisfy the +2 C solvency floor (GDD §4.2). */
export function baselineFor(name: string, terrain: Terrain): Baseline {
  if (name === "Cobb") {
    return { stats: stats({ workforce: 12, agriculture: 3, industry: 1, commerce: 4, transport: 1, power: 1, services: 14, support: 65 }), treasury: 120, materials: 20, battalion: true, profile: "industrial" };
  }
  if (name === "Rabun") {
    return { stats: stats({ workforce: 3, agriculture: 2, industry: 0, commerce: 1, transport: 1, power: 0, services: 5 }), treasury: 40, materials: 6, battalion: false, profile: "small-defensive" };
  }
  if (INDUSTRIAL.has(name)) {
    return { stats: stats({ workforce: 20, agriculture: 2, industry: 4, commerce: 8, transport: 2, power: 2, services: 22, support: 60 }), treasury: 200, materials: 30, battalion: true, profile: "industrial" };
  }
  if (MIXED.has(name)) {
    return { stats: stats({ workforce: 12, agriculture: 3, industry: 1, commerce: 4, transport: 1, power: 1, services: 14, support: 60 }), treasury: 120, materials: 20, battalion: false, profile: "commercial" };
  }
  if (MEMBERS.has(name)) {
    return { stats: stats({ workforce: 8, agriculture: 3, industry: 1, commerce: 3, transport: 1, power: 1, services: 10, support: 60 }), treasury: 80, materials: 12, battalion: false, profile: AGRICULTURAL.has(name) ? "agricultural" : "commercial" };
  }
  if (AGRICULTURAL.has(name)) {
    return { stats: stats({ workforce: 8, agriculture: 4, industry: 0, commerce: 2, transport: 1, power: 0, services: 10 }), treasury: 80, materials: 10, battalion: false, profile: "agricultural" };
  }
  const mountain = terrain === "mountain";
  return { stats: stats({ workforce: 4, agriculture: 2, industry: 0, commerce: 1, transport: 1, power: 0, services: mountain ? 5 : 6 }), treasury: 40, materials: 6, battalion: false, profile: "small-defensive" };
}

export function terrainFor(name: string, centroidLat: number): Terrain {
  if (MOUNTAIN.has(name)) return "mountain";
  if (WETLAND.has(name)) return "wetland";
  return centroidLat >= PIEDMONT_MIN_LAT ? "piedmont" : "coastal";
}

/** Default civilian allocation: services first, then agriculture, then industry within the staffing cap. */
export function defaultAllocation(s: CountyStats, security: number): Allocation {
  const services = s.workforce <= 6 ? 1 : 2;
  let remaining = s.workforce - services - security;
  const agriculture = Math.max(0, Math.min(s.agriculture, remaining));
  remaining -= agriculture;
  const industry = Math.max(0, Math.min(Math.min(s.industry, s.power + s.transport), remaining));
  return { agriculture, industry, services, security, project: 0, liaison: 0, contract: 0 };
}

const COBB_RELATIONS: Record<string, [number, number]> = { Fulton: [35, 55], Cherokee: [15, 35], Bartow: [5, 25], Paulding: [10, 35], Douglas: [10, 30] };

export function buildCobbScenario(playerCountyName = "Cobb"): GameState {
  const counties: Record<string, County> = {};
  const admins: Record<string, Administration> = {};
  const coalitions: Record<string, Coalition> = {};
  const formations: GameState["formations"] = {};
  let nextId = 1;

  for (const g of GEOMETRY) {
    const terrain = terrainFor(g.name, g.centroid[1]);
    const base = baselineFor(g.name, terrain);
    const adminId = adminIdFor(g.id);
    const county: County = {
      id: g.id,
      name: g.name,
      seat: SEATS[g.name] ?? "Seat pending research",
      terrain,
      stats: { ...base.stats },
      allocation: defaultAllocation(base.stats, base.battalion ? 1 : 0),
      ownerAdminId: adminId,
      tier: g.name === "Cobb" ? "authored" : "estimated",
    };
    if (g.name === "Cobb") county.bell = { state: "candidate" };
    counties[g.id] = county;
    admins[adminId] = {
      id: adminId,
      name: `${g.name} Administration`,
      seatCountyId: g.id,
      counties: [g.id],
      treasury: base.treasury,
      materials: base.materials,
      notes: [],
      arrears: 0,
      standing: STANDING.start,
      exhaustion: 0,
      relations: {},
      actions: [],
      isPlayer: g.name === playerCountyName,
      revenueEffort: "standard",
      peacefulMonths: 0,
      profile: base.profile,
      truces: {},
    };
    if (base.battalion) {
      const fid = `f${nextId++}`;
      formations[fid] = { id: fid, kind: "battalion", ownerAdminId: adminId, countyId: g.id, homeCountyId: g.id, strength: 100, morale: 80 };
    }
  }

  for (const def of COALITIONS) {
    const memberAdmins = def.members.map((n) => adminIdFor(countyIdByName(n)));
    const chair = memberAdmins[0];
    if (!chair) continue;
    coalitions[def.id] = { id: def.id, name: def.name, color: def.color, chairAdminId: chair, members: memberAdmins, cohesion: 65, commonFund: 0, priority: def.priority };
    for (const a of memberAdmins) admins[a]!.coalitionId = def.id;
  }

  const cobbAdmin = adminIdFor(countyIdByName("Cobb"));
  for (const [name, [r, q]] of Object.entries(COBB_RELATIONS)) {
    const other = adminIdFor(countyIdByName(name));
    setRelation(admins, cobbAdmin, other, r, q);
  }

  const playerAdminId = adminIdFor(countyIdByName(playerCountyName));
  const state: GameState = {
    rulesetVersion: RULESET_VERSION,
    seed: 1942,
    day: CAMPAIGN_START_DAY,
    paused: true,
    speed: 1,
    pauseOnCompletion: true,
    playerAdminId,
    scenario: "cobb-1942",
    counties,
    admins,
    coalitions,
    formations,
    wars: [],
    claims: [],
    occupations: [],
    pendingDecisions: [],
    ledger: [],
    log: [],
    nextId,
    ambition: "regional-union",
  };
  state.log.push({ day: state.day, kind: "info", text: "Campaign begins. The Georgia Emergency Compact is scenario fiction; historical background is labeled and sourced." });
  const coal = admins[playerAdminId]?.coalitionId;
  if (coal) {
    const c = coalitions[coal]!;
    state.log.push({ day: state.day, kind: "info", text: `${c.name} charter in force; ${admins[c.chairAdminId]?.name.replace(" Administration", "") ?? "chair"} chairs.` });
  }
  if (playerCountyName === "Cobb") state.log.push({ day: state.day, kind: "alert", text: "Bell site review scheduled for 19 Feb. No production or income yet." });
  return state;
}

export function setRelation(admins: Record<string, Administration>, a: string, b: string, relations: number, trust: number): void {
  const rec: RelationRecord = { relations, trust, influence: 0, alarm: 0 };
  admins[a]!.relations[b] = { ...rec };
  admins[b]!.relations[a] = { ...rec };
}
