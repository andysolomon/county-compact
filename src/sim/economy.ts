import { neighborsOf } from "../data/geometry";
import { dateOf, dayOf } from "./calendar";
import { ECONOMY, FORMATIONS, SUPPORT } from "./rules";
import type { AdminId, Administration, County, CountyId, GameState } from "./types";

export interface BudgetLine {
  label: string;
  amount: number;
  countyId?: CountyId;
  essential?: boolean;
}

export interface BudgetForecast {
  revenue: BudgetLine[];
  expenditure: BudgetLine[];
  revenueTotal: number;
  expenditureTotal: number;
  net: number;
  essentialMonthly: number;
  materialsIndustry: number;
  materialsAllotment: number;
  materialsNet: number;
  overloadPenalty: number; // fraction removed from taxable revenue
  load: number;
  capacity: number;
}

const POSTWAR_NATIONAL_SERVICE_DAY = dayOf(1945, 10, 1);

export function requiredServiceW(county: County): number {
  return county.stats.workforce <= 6 ? 1 : 2;
}

export function staffedIndustryCap(county: County): number {
  return Math.min(county.stats.industry, county.stats.power + county.stats.transport);
}

export function allocatedW(county: County): number {
  const a = county.allocation;
  return a.agriculture + a.industry + a.services + a.security + a.project + a.liaison + a.contract;
}

export function availableW(county: County): number {
  return round1(county.stats.workforce - allocatedW(county));
}

export function servicesStaffed(county: County): boolean {
  return county.allocation.services >= requiredServiceW(county);
}

export function compliance(support: number): number {
  return clamp(0.5 + support / 100, 0.5, 1.0);
}

export function autonomyShare(autonomy: number): number {
  return 1 - autonomy / 200;
}

export function effortMultiplier(effort: Administration["revenueEffort"]): number {
  return effort === "relief" ? 0.9 : effort === "emergency" ? 1.15 : 1.0;
}

export function nationalServicePerCounty(day: number): number {
  return day >= POSTWAR_NATIONAL_SERVICE_DAY ? ECONOMY.nationalServicePerCountyPostwar : ECONOMY.nationalServicePerCountyWartime;
}

/** Counties an administration can traverse for administrative access: its own unoccupied counties plus coalition co-members' counties (charter civil access). */
function passableForAdmin(state: GameState, adminId: AdminId, countyId: CountyId): boolean {
  const county = state.counties[countyId];
  if (!county) return false;
  if (county.occupierAdminId && county.occupierAdminId !== adminId) return false;
  if (county.ownerAdminId === adminId) return true;
  const admin = state.admins[adminId];
  const owner = state.admins[county.ownerAdminId];
  return Boolean(admin?.coalitionId && owner?.coalitionId === admin.coalitionId);
}

export function accessibleCounties(state: GameState, adminId: AdminId): Set<CountyId> {
  const admin = state.admins[adminId];
  const out = new Set<CountyId>();
  if (!admin) return out;
  const seat = state.counties[admin.seatCountyId];
  if (!seat || seat.occupierAdminId) return out;
  const queue: CountyId[] = [admin.seatCountyId];
  const seen = new Set<CountyId>(queue);
  while (queue.length) {
    const id = queue.shift() as CountyId;
    if (state.counties[id]?.ownerAdminId === adminId) out.add(id);
    for (const n of neighborsOf(id)) {
      if (seen.has(n)) continue;
      if (!passableForAdmin(state, adminId, n)) continue;
      seen.add(n);
      queue.push(n);
    }
  }
  return out;
}

export function adminCapacity(state: GameState, adminId: AdminId): number {
  const accessible = accessibleCounties(state, adminId);
  let offices = 0;
  for (const id of accessible) offices += state.counties[id]?.stats.offices ?? 0;
  return ECONOMY.baseAdminCapacity + ECONOMY.capacityPerOffice * offices;
}

export function adminLoad(state: GameState, adminId: AdminId): number {
  const admin = state.admins[adminId];
  if (!admin) return 0;
  let load = 0;
  for (const id of admin.counties) {
    const c = state.counties[id];
    if (!c) continue;
    load += c.stats.integration >= 70 ? 1 : 3;
  }
  for (const occ of state.occupations) if (occ.occupierAdminId === adminId) load += 2;
  return load;
}

export function overloadPenalty(load: number, capacity: number): number {
  return Math.min(0.3, Math.max(0, load - capacity) * 0.02);
}

export function forecastBudget(state: GameState, adminId: AdminId): BudgetForecast {
  const admin = state.admins[adminId];
  const revenue: BudgetLine[] = [];
  const expenditure: BudgetLine[] = [];
  if (!admin) {
    return { revenue, expenditure, revenueTotal: 0, expenditureTotal: 0, net: 0, essentialMonthly: 0, materialsIndustry: 0, materialsAllotment: 0, materialsNet: 0, overloadPenalty: 0, load: 0, capacity: 0 };
  }
  const accessible = accessibleCounties(state, adminId);
  const load = adminLoad(state, adminId);
  const capacity = adminCapacity(state, adminId);
  const penalty = overloadPenalty(load, capacity);
  const effort = effortMultiplier(admin.revenueEffort);
  let materialsIndustry = 0;
  const multi = admin.counties.length > 1;

  for (const id of admin.counties) {
    const c = state.counties[id];
    if (!c) continue;
    const occupied = Boolean(c.occupierAdminId && c.occupierAdminId !== adminId);
    if (occupied) {
      revenue.push({ label: `${c.name} · occupied, no revenue`, amount: 0, countyId: id });
      continue;
    }
    const staffedI = Math.min(c.allocation.industry, staffedIndustryCap(c));
    const staffedA = Math.min(c.allocation.agriculture, c.stats.agriculture);
    const mult = compliance(c.stats.support) * autonomyShare(c.stats.autonomy) * effort * (1 - penalty) * (accessible.has(id) ? 1 : 0.5);
    const agri = ECONOMY.agricultureCreditsPerLevel * staffedA * mult;
    const ind = ECONOMY.industryCreditsPerLevel * staffedI * mult;
    const com = c.stats.commerce * mult;
    const prefix = multi ? `${c.name} · ` : "";
    if (staffedA > 0) revenue.push({ label: `${prefix}Agriculture · ${fmtW(staffedA)} staffed level${staffedA === 1 ? "" : "s"}`, amount: agri, countyId: id });
    if (staffedI > 0) revenue.push({ label: `${prefix}Industry · ${fmtW(staffedI)} staffed level${staffedI === 1 ? "" : "s"}`, amount: ind, countyId: id });
    revenue.push({ label: `${prefix}Commerce`, amount: com, countyId: id });
    if (mult !== 1) {
      const notes: string[] = [];
      if (compliance(c.stats.support) < 1) notes.push(`compliance ${compliance(c.stats.support).toFixed(2)}`);
      if (c.stats.autonomy > 0) notes.push(`autonomy share ${autonomyShare(c.stats.autonomy).toFixed(2)}`);
      if (effort !== 1) notes.push(`effort ×${effort}`);
      if (penalty > 0) notes.push(`overload −${Math.round(penalty * 100)}%`);
      if (!accessible.has(id)) notes.push("disconnected ×0.5");
      revenue[revenue.length - 1]!.label += ` (${notes.join(", ")})`;
    }
    materialsIndustry += ECONOMY.industryMaterialsPerLevel * staffedI;

    if (c.bell?.state === "operating") revenue.push({ label: `${prefix}Bell contract`, amount: c.allocation.contract >= 3 ? 20 : 6, countyId: id });
    else if (c.bell) revenue.push({ label: `${prefix}Bell contract · ${bellStateLabel(c.bell.state)}`, amount: 0, countyId: id });

    const svc = ECONOMY.servicesCostPerW * requiredServiceW(c);
    expenditure.push({ label: `${prefix}Essential services`, amount: svc, countyId: id, essential: true });
    expenditure.push({ label: `${prefix}County administration${c.stats.offices ? ` · ${c.stats.offices} office` : ""}`, amount: ECONOMY.adminCostPerCounty + ECONOMY.adminCostPerOffice * c.stats.offices, countyId: id, essential: true });
    const infra = c.stats.transport + c.stats.power;
    if (infra > 0) expenditure.push({ label: `${prefix}Transport and power upkeep`, amount: infra, countyId: id, essential: true });
    expenditure.push({ label: `${prefix}National service obligation`, amount: nationalServicePerCounty(state.day), countyId: id, essential: true });
  }

  for (const f of Object.values(state.formations)) {
    if (f.ownerAdminId !== adminId) continue;
    const def = FORMATIONS[f.kind];
    expenditure.push({ label: `${def.label} maintenance`, amount: def.upkeep, countyId: f.countyId, essential: true });
  }
  for (const n of admin.notes) expenditure.push({ label: `Emergency note interest`, amount: ECONOMY.noteInterest * (n.principal / ECONOMY.emergencyNote), countyId: admin.seatCountyId, essential: true });
  for (const occ of state.occupations) if (occ.occupierAdminId === adminId) expenditure.push({ label: `Occupation · ${state.counties[occ.countyId]?.name ?? occ.countyId}`, amount: ECONOMY.occupationCostPerCounty, countyId: occ.countyId, essential: true });
  if (admin.coalitionId) expenditure.push({ label: `Coalition dues · ${state.coalitions[admin.coalitionId]?.name ?? "coalition"}`, amount: ECONOMY.coalitionDues, countyId: admin.seatCountyId });

  const revenueTotal = sum(revenue);
  const expenditureTotal = sum(expenditure);
  const essentialMonthly = expenditure.filter((l) => l.essential).reduce((s, l) => s + l.amount, 0);
  const materialsAllotment = admin.standing >= ECONOMY.allotmentMinStanding ? ECONOMY.civilianMaterialAllotment : 0;
  return {
    revenue, expenditure, revenueTotal, expenditureTotal, net: revenueTotal - expenditureTotal, essentialMonthly,
    materialsIndustry, materialsAllotment, materialsNet: materialsIndustry + materialsAllotment, overloadPenalty: penalty, load, capacity,
  };
}

export function bellStateLabel(s: NonNullable<County["bell"]>["state"]): string {
  return { candidate: "Candidate", accepted: "Obligations accepted", construction: "Construction", ready: "Ready", operating: "Operating", mothballed: "Federally mothballed", closed: "Opportunity closed" }[s];
}

/** Month-end settlement for one administration: treasury, materials, arrears, and local support. */
export function settleMonth(state: GameState, adminId: AdminId): BudgetForecast {
  const admin = state.admins[adminId];
  const forecast = forecastBudget(state, adminId);
  if (!admin) return forecast;
  admin.treasury = round2(admin.treasury + forecast.revenueTotal);
  const order = [...forecast.expenditure].sort((a, b) => Number(Boolean(b.essential)) - Number(Boolean(a.essential)));
  let unpaid = 0;
  for (const line of order) {
    if (admin.treasury >= line.amount) admin.treasury = round2(admin.treasury - line.amount);
    else unpaid += line.amount;
  }
  admin.arrears = round2(unpaid);
  admin.materials = round2(admin.materials + forecast.materialsNet);
  admin.lastSettlement = { day: state.day, revenue: forecast.revenueTotal, expenditure: forecast.expenditureTotal, net: forecast.net, materials: forecast.materialsNet, treasuryAfter: admin.treasury };

  for (const id of admin.counties) {
    const c = state.counties[id];
    if (!c) continue;
    let delta = 0;
    const occupied = Boolean(c.occupierAdminId && c.occupierAdminId !== adminId);
    const staffed = servicesStaffed(c);
    if (!staffed) delta += SUPPORT.unstaffedServicesPenalty;
    if (c.stats.workforce > c.stats.services) delta += SUPPORT.crowdingPenalty;
    if (staffed && c.stats.workforce <= c.stats.services && admin.arrears === 0 && !occupied && 100 - c.stats.support < SUPPORT.noncooperationUnrest) delta += SUPPORT.peacefulRecovery;
    if (admin.arrears > 0) delta += SUPPORT.unpaidServicesPenalty;
    if (admin.revenueEffort === "relief") delta += 1;
    if (admin.revenueEffort === "emergency") delta -= 2;
    if (admin.exhaustion >= 70) delta -= 3;
    else if (admin.exhaustion >= 40) delta -= 1;
    c.stats.support = clamp(c.stats.support + delta, 0, 100);
  }
  return forecast;
}

export function monthLabelOf(day: number): string {
  const d = dateOf(day);
  return `${d.year}-${String(d.month).padStart(2, "0")}`;
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

export function round1(v: number): number {
  return Math.round(v * 10) / 10;
}

export function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

export function fmtW(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

function sum(lines: readonly BudgetLine[]): number {
  return round2(lines.reduce((s, l) => s + l.amount, 0));
}
