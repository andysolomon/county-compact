import { availableW, forecastBudget } from "./economy";
import { ECONOMY, PROJECTS, type ProjectDefinition, type ProjectKind } from "./rules";
import type { County, GameState } from "./types";

export interface ProjectOffer {
  def: ProjectDefinition;
  available: boolean;
  reasons: string[]; // why unavailable, or informational notes when available
  resultText: string;
  upkeepDelta: number;
  treasuryAfter: number;
  materialsAfter: number;
  reserveMonthsAfter: number;
}

export function projectOffers(state: GameState, countyId: string): ProjectOffer[] {
  const county = state.counties[countyId];
  if (!county) return [];
  const admin = state.admins[county.ownerAdminId];
  const forecast = admin ? forecastBudget(state, admin.id) : undefined;
  return PROJECTS.map((def) => {
    const reasons: string[] = [];
    const s = county.stats;
    let resultText = "";
    let upkeepDelta = 0;
    switch (def.id) {
      case "transport":
        resultText = `Transport level ${s.transport} → ${s.transport + 1}`;
        upkeepDelta = 1;
        if (s.transport >= 3) reasons.push("Transport already at level 3");
        break;
      case "power":
        resultText = `Power level ${s.power} → ${s.power + 1}`;
        upkeepDelta = 1;
        if (s.power >= 3) reasons.push("Power already at level 3");
        break;
      case "agriculture":
        resultText = `Agriculture level ${s.agriculture} → ${s.agriculture + 1} · staffing still required`;
        if (s.agriculture >= 6) reasons.push("Agriculture already at level 6");
        break;
      case "workshop":
        resultText = `Industry level ${s.industry} → ${s.industry + 1}`;
        if (s.power < 1) reasons.push("Needs power level 1");
        if (s.transport < 1) reasons.push("Needs transport level 1");
        if (s.industry >= 6) reasons.push("Industry already at level 6");
        break;
      case "housing":
        resultText = `Service capacity ${s.services} → ${s.services + 4} · no automatic workforce`;
        break;
      case "office":
        resultText = `Administrative capacity +3 · offices ${s.offices} → ${s.offices + 1}`;
        upkeepDelta = 1;
        if (s.offices >= 2) reasons.push("Offices already at level 2");
        break;
    }
    if (!admin) reasons.push("No administration");
    if (county.project) reasons.push(`Project slot occupied · ${PROJECTS.find((p) => p.id === county.project?.kind)?.label ?? "project"}`);
    if (county.occupierAdminId) reasons.push("County is occupied");
    if (availableW(county) < ECONOMY.constructionReservedW) reasons.push(`Needs ${ECONOMY.constructionReservedW} available W · ${availableW(county)} free`);
    if (admin && admin.arrears > 0) reasons.push("No new projects while arrears exist");
    if (admin && admin.treasury < def.credits) reasons.push(`Needs ${def.credits} C · treasury ${admin.treasury}`);
    if (admin && admin.materials < def.materials) reasons.push(`Needs ${def.materials} M · stock ${admin.materials}`);
    const treasuryAfter = (admin?.treasury ?? 0) - def.credits;
    const materialsAfter = (admin?.materials ?? 0) - def.materials;
    const essential = forecast?.essentialMonthly ?? 0;
    const reserveMonthsAfter = essential > 0 ? treasuryAfter / essential : 0;
    return { def, available: reasons.length === 0, reasons, resultText, upkeepDelta, treasuryAfter, materialsAfter, reserveMonthsAfter };
  });
}

export function startProject(state: GameState, countyId: string, kind: ProjectKind): { ok: true } | { ok: false; reason: string } {
  const offer = projectOffers(state, countyId).find((o) => o.def.id === kind);
  if (!offer) return { ok: false, reason: "Unknown project" };
  if (!offer.available) return { ok: false, reason: offer.reasons.join("; ") };
  const county = state.counties[countyId]!;
  const admin = state.admins[county.ownerAdminId]!;
  admin.treasury -= offer.def.credits;
  admin.materials -= offer.def.materials;
  county.allocation.project += ECONOMY.constructionReservedW;
  county.project = { kind, startDay: state.day, completeDay: state.day + offer.def.days, credits: offer.def.credits, materials: offer.def.materials, reservedW: ECONOMY.constructionReservedW };
  state.log.push({ day: state.day, kind: "info", text: `${county.name}: ${offer.def.label} funded (${offer.def.credits} C / ${offer.def.materials} M). ${ECONOMY.constructionReservedW} W reserved; completes ${offer.def.days} days from today.` });
  return { ok: true };
}

export function cancelProject(state: GameState, countyId: string): void {
  const county = state.counties[countyId];
  if (!county?.project) return;
  const admin = state.admins[county.ownerAdminId]!;
  const p = county.project;
  const remaining = Math.max(0, (p.completeDay - state.day) / (p.completeDay - p.startDay));
  admin.treasury += Math.round(p.credits * remaining * 0.5 * 100) / 100;
  admin.materials += Math.round(p.materials * remaining * 0.5 * 100) / 100;
  county.allocation.project -= p.reservedW;
  delete county.project;
  state.log.push({ day: state.day, kind: "info", text: `${county.name}: project cancelled; 50% of the uncompleted fraction refunded.` });
}

/** Called daily by the engine. Applies completions due today. */
export function completeDueProjects(state: GameState): County[] {
  const done: County[] = [];
  for (const county of Object.values(state.counties)) {
    const p = county.project;
    if (!p || p.completeDay > state.day) continue;
    if (county.occupierAdminId) continue; // occupation pauses construction
    applyProjectResult(county, p.kind);
    county.allocation.project -= p.reservedW;
    delete county.project;
    const def = PROJECTS.find((d) => d.id === p.kind)!;
    state.log.push({ day: state.day, kind: "completion", text: `${county.name}: ${def.label} complete. ${p.reservedW} W returned.` });
    done.push(county);
  }
  return done;
}

function applyProjectResult(county: County, kind: ProjectKind): void {
  const s = county.stats;
  switch (kind) {
    case "transport": s.transport = Math.min(3, s.transport + 1); break;
    case "power": s.power = Math.min(3, s.power + 1); break;
    case "agriculture": s.agriculture = Math.min(6, s.agriculture + 1); break;
    case "workshop": s.industry = Math.min(6, s.industry + 1); break;
    case "housing": s.services += 4; break;
    case "office": s.offices = Math.min(2, s.offices + 1); break;
  }
}

/** Reallocate available workforce to a productive slot, in 0.5 W steps. */
export function setAllocation(state: GameState, countyId: string, slot: "agriculture" | "industry", value: number): { ok: true } | { ok: false; reason: string } {
  const county = state.counties[countyId];
  if (!county) return { ok: false, reason: "Unknown county" };
  const v = Math.round(value * 2) / 2;
  if (v < 0) return { ok: false, reason: "Cannot be negative" };
  const cap = slot === "agriculture" ? county.stats.agriculture : Math.min(county.stats.industry, county.stats.power + county.stats.transport);
  if (v > cap) return { ok: false, reason: slot === "industry" ? `Staffed industry cannot exceed min(I, E + T) = ${cap}` : `Only ${cap} agriculture levels exist`};
  const current = county.allocation[slot];
  if (v - current > availableW(county)) return { ok: false, reason: `Only ${availableW(county)} W available` };
  county.allocation[slot] = v;
  return { ok: true };
}
