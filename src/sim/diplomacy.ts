// Explainable acceptance rule (GDD §6.3). Every term is shown to the player.
import { neighborsOf } from "../data/geometry";
import { DIPLOMACY, FORMATIONS } from "./rules";
import type { AcceptanceForecast, AcceptanceTerm, AdminId, GameState, RelationRecord } from "./types";

export type TreatyKind = keyof typeof DIPLOMACY.autonomyCost;

export function relationBetween(state: GameState, a: AdminId, b: AdminId): RelationRecord {
  const rec = state.admins[a]?.relations[b];
  if (rec) return rec;
  const A = state.admins[a];
  const B = state.admins[b];
  if (A && B && A.coalitionId && A.coalitionId === B.coalitionId) return { relations: 30, trust: 50, influence: 0, alarm: 0 };
  if (A && B && areAdjacent(state, a, b)) return { relations: 5, trust: 25, influence: 0, alarm: 0 };
  return { relations: 0, trust: 20, influence: 0, alarm: 0 };
}

export function ensureRelation(state: GameState, a: AdminId, b: AdminId): RelationRecord {
  const A = state.admins[a]!;
  const B = state.admins[b]!;
  if (!A.relations[b]) {
    const rec = relationBetween(state, a, b);
    A.relations[b] = { ...rec };
    B.relations[a] = { ...rec };
  }
  return A.relations[b]!;
}

export function areAdjacent(state: GameState, a: AdminId, b: AdminId): boolean {
  const A = state.admins[a];
  const B = state.admins[b];
  if (!A || !B) return false;
  const bSet = new Set(B.counties);
  return A.counties.some((c) => neighborsOf(c).some((n) => bSet.has(n)));
}

export function isAtWar(state: GameState, a: AdminId, b: AdminId): boolean {
  return state.wars.some((w) => w.status === "active" && ((w.aggressorAdminId === a && w.defenderAdminIds.includes(b)) || (w.aggressorAdminId === b && w.defenderAdminIds.includes(a))));
}

export function militaryPower(state: GameState, adminId: AdminId): number {
  let p = 0;
  for (const f of Object.values(state.formations)) if (f.ownerAdminId === adminId) p += FORMATIONS[f.kind].power * (f.strength / 100);
  return p;
}

/** Strongest adjacent administration outside the given coalition (or any adjacent admin when no coalition). */
export function strongestAdjacentThreat(state: GameState, adminId: AdminId, excludeCoalition?: string): number {
  const admin = state.admins[adminId];
  if (!admin) return 0;
  let max = 0;
  const seen = new Set<AdminId>();
  for (const c of admin.counties) {
    for (const n of neighborsOf(c)) {
      const other = state.counties[n]?.ownerAdminId;
      if (!other || other === adminId || seen.has(other)) continue;
      seen.add(other);
      if (excludeCoalition && state.admins[other]?.coalitionId === excludeCoalition) continue;
      max = Math.max(max, militaryPower(state, other));
    }
  }
  return max;
}

export interface AcceptanceContext {
  sharedBenefit: { value: 0 | 10 | 20; reason: string };
  securityBenefit: { value: 0 | 10 | 20; reason: string };
  hardGates: { label: string; met: boolean }[];
}

/** Score from the TARGET's perspective toward the PROPOSER. */
export function acceptanceForecast(state: GameState, proposer: AdminId, target: AdminId, kind: TreatyKind, ctx: AcceptanceContext): AcceptanceForecast {
  const rel = relationBetween(state, target, proposer);
  const alarm = relationBetween(state, target, proposer).alarm;
  const terms: AcceptanceTerm[] = [
    { label: `Relations ${fmt(rel.relations)} × ${DIPLOMACY.relationsWeight}`, symbol: "R", value: r1(rel.relations * DIPLOMACY.relationsWeight) },
    { label: `Trust ${fmt(rel.trust)} × ${DIPLOMACY.trustWeight}`, symbol: "Q", value: r1(rel.trust * DIPLOMACY.trustWeight) },
    { label: `Shared benefit · ${ctx.sharedBenefit.reason}`, value: ctx.sharedBenefit.value },
    { label: `Security benefit · ${ctx.securityBenefit.reason}`, value: ctx.securityBenefit.value },
    { label: `Autonomy cost · ${kindLabel(kind)}`, value: -DIPLOMACY.autonomyCost[kind] },
    { label: `Threat penalty · alarm ${fmt(alarm)} × ${DIPLOMACY.alarmWeight}${isAtWar(state, proposer, target) ? " + at war 20" : ""}`, value: -r1(alarm * DIPLOMACY.alarmWeight + (isAtWar(state, proposer, target) ? DIPLOMACY.atWarPenalty : 0)) },
  ];
  const score = r1(terms.reduce((s, t) => s + t.value, 0));
  const threshold = kind === "dependency" || kind === "integration" ? DIPLOMACY.majorThreshold : DIPLOMACY.ordinaryThreshold;
  const gatesMet = ctx.hardGates.every((g) => g.met);
  return { terms, score, threshold, likely: score >= threshold && gatesMet, hardGates: ctx.hardGates, gatesMet };
}

export function kindLabel(kind: TreatyKind): string {
  return { access: "access agreement", nonaggression: "nonaggression", trade: "economic agreement", alliance: "alliance", coalition: "coalition membership", dependency: "dependency", integration: "integration" }[kind];
}

export interface ImproveOffer {
  available: boolean;
  reasons: string[];
  cost: number;
  days: number;
  gain: number;
  current: RelationRecord;
}

export function improveRelationsOffer(state: GameState, actor: AdminId, target: AdminId): ImproveOffer {
  const admin = state.admins[actor]!;
  const rel = relationBetween(state, actor, target);
  const reasons: string[] = [];
  const active = admin.actions.filter((a) => a.endDay > state.day);
  if (active.length >= DIPLOMACY.actionSlots) reasons.push(`Both diplomatic action slots in use until ${active.map((a) => a.endDay).sort()[0]}`);
  if (admin.treasury < DIPLOMACY.improveRelationsCost) reasons.push(`Needs ${DIPLOMACY.improveRelationsCost} C`);
  if (rel.lastImproveDay !== undefined && state.day - rel.lastImproveDay < DIPLOMACY.improveRelationsCooldownDays) reasons.push(`One per pair each 90 days · next on day ${rel.lastImproveDay + DIPLOMACY.improveRelationsCooldownDays}`);
  if ((rel.improveGained ?? 0) >= DIPLOMACY.improveRelationsCap) reasons.push("Peaceful cap of +60 from this action reached");
  if (active.some((a) => a.kind === "improve-relations" && a.targetAdminId === target)) reasons.push("Already underway with this administration");
  if (isAtWar(state, actor, target)) reasons.push("At war");
  return { available: reasons.length === 0, reasons, cost: DIPLOMACY.improveRelationsCost, days: DIPLOMACY.improveRelationsDays, gain: DIPLOMACY.improveRelationsGain, current: rel };
}

export function startImproveRelations(state: GameState, actor: AdminId, target: AdminId): { ok: true } | { ok: false; reason: string } {
  const offer = improveRelationsOffer(state, actor, target);
  if (!offer.available) return { ok: false, reason: offer.reasons.join("; ") };
  const admin = state.admins[actor]!;
  admin.treasury -= offer.cost;
  const rel = ensureRelation(state, actor, target);
  rel.lastImproveDay = state.day;
  admin.actions.push({ id: `a${state.nextId++}`, kind: "improve-relations", targetAdminId: target, startDay: state.day, endDay: state.day + offer.days });
  state.log.push({ day: state.day, kind: "diplomacy", text: `Improving relations with ${state.admins[target]?.name ?? target} (5 C, 30 days).` });
  return { ok: true };
}

/** Daily: complete diplomatic actions whose 30 days have elapsed. */
export function completeDiplomaticActions(state: GameState): void {
  for (const admin of Object.values(state.admins)) {
    for (const action of [...admin.actions]) {
      if (action.endDay > state.day) continue;
      admin.actions = admin.actions.filter((a) => a.id !== action.id);
      if (action.kind === "improve-relations") {
        const rec = ensureRelation(state, admin.id, action.targetAdminId);
        const gain = Math.min(DIPLOMACY.improveRelationsGain, DIPLOMACY.improveRelationsCap - (rec.improveGained ?? 0));
        rec.relations = Math.min(100, rec.relations + gain);
        rec.improveGained = (rec.improveGained ?? 0) + gain;
        const mirror = state.admins[action.targetAdminId]!.relations[admin.id]!;
        mirror.relations = rec.relations;
        mirror.improveGained = rec.improveGained;
        state.log.push({ day: state.day, kind: "diplomacy", text: `Relations with ${state.admins[action.targetAdminId]?.name ?? action.targetAdminId} improved by ${gain} (now ${rec.relations}).` });
      }
    }
  }
}

export function fmt(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

export function r1(v: number): number {
  return Math.round(v * 10) / 10;
}
