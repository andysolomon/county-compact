// War score, settlement costs, acceptance, and cession effects (GDD §6.4, wireframe E).
import { neighborsOf } from "../data/geometry";
import { formatDate } from "./calendar";
import { adminCapacity, adminLoad, autonomyShare, compliance, forecastBudget, nationalServicePerCounty, requiredServiceW, staffedIndustryCap } from "./economy";
import { ECONOMY, WAR } from "./rules";
import type { AdminId, County, CountyId, GameState, War } from "./types";

export interface WarScoreBreakdown {
  occupation: number;
  goal: number;
  battles: number;
  total: number;
  lines: { label: string; value: number }[];
}

export function warParties(war: War): AdminId[] {
  return [war.aggressorAdminId, ...war.defenderAdminIds];
}

export function primaryLoser(state: GameState, war: War): AdminId {
  if (war.goal.kind === "release") return war.goal.adminId;
  const owner = state.counties[war.goal.countyId]?.ownerAdminId;
  return owner && war.defenderAdminIds.includes(owner) ? owner : war.defenderAdminIds[0]!;
}

export function warScore(state: GameState, war: War): WarScoreBreakdown {
  const defenders = new Set(war.defenderAdminIds);
  const defenderPrewar = war.defenderAdminIds.reduce((s, d) => s + (war.prewarCounties[d] ?? 0), 0);
  const aggressorPrewar = war.prewarCounties[war.aggressorAdminId] ?? 1;
  let aggOcc = 0, defOcc = 0;
  for (const o of state.occupations) {
    const owner = state.counties[o.countyId]?.ownerAdminId;
    if (!owner) continue;
    if (o.occupierAdminId === war.aggressorAdminId && defenders.has(owner)) aggOcc++;
    else if (defenders.has(o.occupierAdminId) && owner === war.aggressorAdminId) defOcc++;
  }
  const occupation = r1(clamp(WAR.occupationScoreShare * aggOcc / Math.max(1, defenderPrewar), 0, WAR.occupationScoreShare) - clamp(WAR.occupationScoreShare * defOcc / Math.max(1, aggressorPrewar), 0, WAR.occupationScoreShare));
  const goalHeld = war.goal.kind !== "release" && state.occupations.some((o) => war.goal.kind !== "release" && o.countyId === war.goal.countyId && o.occupierAdminId === war.aggressorAdminId);
  const goal = goalHeld ? WAR.goalCountyScore : 0;
  const battles = clamp((war.battles.aggressorWins - war.battles.defenderWins) * WAR.battleScoreEach, -WAR.battleScoreCap, WAR.battleScoreCap);
  const total = r1(occupation + goal + battles);
  return {
    occupation, goal, battles, total,
    lines: [
      { label: `Occupation · ${aggOcc} of ${defenderPrewar} defender counties held, ${defOcc} of ${aggressorPrewar} lost`, value: occupation },
      { label: goalHeld ? "War-goal county held" : "War-goal county not held", value: goal },
      { label: `Battles · ${war.battles.aggressorWins} won, ${war.battles.defenderWins} lost (±5 each, cap ±25)`, value: battles },
    ],
  };
}

export function cessionCost(county: County): { total: number; text: string } {
  const total = WAR.cessionBase + WAR.cessionPerIndustry * county.stats.industry + county.stats.commerce;
  return { total, text: `base ${WAR.cessionBase} + industry ${WAR.cessionPerIndustry * county.stats.industry} + commerce ${county.stats.commerce}` };
}

export interface CessionCandidate {
  county: County;
  eligible: boolean;
  reasons: string[];
  occupiedDays: number;
  claimDay?: number;
  cost: number;
  ownerName: string;
}

export function cessionCandidates(state: GameState, war: War, recipient: AdminId, selected: readonly CountyId[] = []): CessionCandidate[] {
  const parties = new Set(warParties(war));
  const recip = state.admins[recipient]!;
  const out: CessionCandidate[] = [];
  const considered = new Set<CountyId>();
  const consider = (id: CountyId) => {
    if (considered.has(id)) return;
    considered.add(id);
    const county = state.counties[id]!;
    const occ = state.occupations.find((o) => o.countyId === id && o.occupierAdminId === recipient);
    const claim = state.claims.find((c) => c.countyId === id && c.claimantAdminId === recipient);
    const reasons: string[] = [];
    if (!occ) reasons.push("not occupied");
    if (!claim) reasons.push("no registered claim");
    if (!parties.has(county.ownerAdminId)) reasons.push("not a war party");
    const contiguous = neighborsOf(id).some((n) => state.counties[n]?.ownerAdminId === recipient || selected.includes(n));
    if (!contiguous) reasons.push("not contiguous with the recipient through legal access");
    const ownerName = state.admins[county.ownerAdminId]?.name ?? county.ownerAdminId;
    out.push({ county, eligible: reasons.length === 0, reasons, occupiedDays: occ?.days ?? 0, ...(claim ? { claimDay: claim.registeredDay } : {}), cost: cessionCost(county).total, ownerName });
  };
  for (const o of state.occupations) if (o.occupierAdminId === recipient) consider(o.countyId);
  for (const c of state.claims) if (c.claimantAdminId === recipient && !recip.counties.includes(c.countyId)) consider(c.countyId);
  return out.sort((a, b) => Number(b.eligible) - Number(a.eligible) || a.county.name.localeCompare(b.county.name));
}

export interface SettlementTerms {
  cessions: CountyId[];
  reparations: number; // points 0 or 10–30
}

export interface SettlementForecast {
  war: War;
  score: WarScoreBreakdown;
  terms: SettlementTerms;
  termLines: { label: string; value: string }[];
  totalCost: number;
  withinScore: boolean;
  loser: AdminId;
  loserExhaustion: number;
  loserSeatOccupied: boolean;
  acceptable: boolean;
  acceptanceNote: string;
  validity: string[]; // rule violations
  whitePeace: { available: boolean; reason: string };
  arbitrationInDays: number;
  receiving: {
    loadNow: number; loadAfter: number; capacity: number;
    loadLines: { label: string; now: number; after: number }[];
    balanceLines: { label: string; value: number }[];
    balanceDelta: number;
    supportChanges: { county: string; before: number; after: number }[];
    standingBefore: number; standingAfter: number;
    exhaustion: number;
    integrationNote: string;
  };
}

export function whitePeaceStatus(state: GameState, war: War): { available: boolean; reason: string } {
  const parties = new Set(warParties(war));
  const occupied = state.occupations.some((o) => parties.has(o.occupierAdminId) && parties.has(state.counties[o.countyId]?.ownerAdminId ?? ""));
  const quiet = state.day - (war.lastBattleDay ?? war.startDay);
  if (occupied) return { available: false, reason: `Counties are occupied; needs ${WAR.whitePeaceQuietDays} days without battle and no occupation` };
  if (quiet < WAR.whitePeaceQuietDays) return { available: false, reason: `${WAR.whitePeaceQuietDays - quiet} more days without a battle needed` };
  return { available: true, reason: "No occupied counties and 90 quiet days" };
}

export function forecastSettlement(state: GameState, war: War, recipient: AdminId, terms: SettlementTerms): SettlementForecast {
  const score = warScore(state, war);
  const loser = primaryLoser(state, war);
  const loserAdmin = state.admins[loser]!;
  const recip = state.admins[recipient]!;
  const validity: string[] = [];
  if (terms.cessions.length > WAR.maxCessionsPerWar) validity.push(`Maximum ${WAR.maxCessionsPerWar} counties per war`);
  const candidates = cessionCandidates(state, war, recipient, terms.cessions);
  const termLines: { label: string; value: string }[] = [];
  let totalCost = 0;
  for (const id of terms.cessions) {
    const cand = candidates.find((c) => c.county.id === id);
    if (!cand) { validity.push(`${state.counties[id]?.name ?? id} is not a cession candidate`); continue; }
    if (!cand.eligible) validity.push(`${cand.county.name}: ${cand.reasons.join(", ")}`);
    totalCost += cand.cost;
    termLines.push({ label: `Cede ${cand.county.name} · ${cessionCost(cand.county).text}`, value: String(cand.cost) });
  }
  if (terms.reparations > 0) {
    if (terms.reparations < WAR.reparationsMin || terms.reparations > WAR.reparationsMax) validity.push(`Reparations must be ${WAR.reparationsMin}–${WAR.reparationsMax} points`);
    const credits = Math.min(terms.reparations * WAR.reparationsPerPoint, loserAdmin.treasury);
    totalCost += terms.reparations;
    termLines.push({ label: `Reparations · ${terms.reparations} points × ${WAR.reparationsPerPoint} C, capped at payer treasury ${r1(loserAdmin.treasury)}`, value: `${terms.reparations} · ${r1(credits)} C` });
  } else termLines.push({ label: "Reparations", value: "none" });
  termLines.push({ label: `${WAR.truceMonths}-month bilateral truce · all war parties`, value: "included" });
  if (terms.cessions.length) termLines.push({ label: `Autonomy floor ${WAR.forcedCessionAutonomyFloor} in ceded counties for ${WAR.forcedCessionFloorMonths} months`, value: "included" });

  const loserSeatOccupied = state.occupations.some((o) => o.countyId === loserAdmin.seatCountyId && o.occupierAdminId === recipient);
  const withinScore = totalCost <= Math.max(0, score.total);
  const exhaustionOk = loserAdmin.exhaustion >= WAR.loserExhaustionForAcceptance || loserSeatOccupied;
  const acceptable = withinScore && exhaustionOk && validity.length === 0 && (terms.cessions.length > 0 || terms.reparations > 0);
  let acceptanceNote: string;
  if (validity.length) acceptanceNote = "Terms violate settlement rules";
  else if (!terms.cessions.length && !terms.reparations) acceptanceNote = "No terms selected";
  else if (!withinScore) acceptanceNote = `Cost ${totalCost} exceeds war score ${score.total}; the counterparty may offer a lower-cost settlement`;
  else if (!exhaustionOk) acceptanceNote = `Loser exhaustion ${loserAdmin.exhaustion} below ${WAR.loserExhaustionForAcceptance} and seat not occupied`;
  else acceptanceNote = `Remaining ${r1(score.total - totalCost)} · loser exhaustion ${loserAdmin.exhaustion} ≥ ${WAR.loserExhaustionForAcceptance}, normal acceptance possible`;

  // Receiving administration forecast
  const loadNow = adminLoad(state, recipient);
  const capacity = adminCapacity(state, recipient);
  const ownedNow = recip.counties.reduce((s, id) => s + ((state.counties[id]?.stats.integration ?? 0) >= 70 ? 1 : 3), 0);
  const occNow = state.occupations.filter((o) => o.occupierAdminId === recipient).length;
  const ownedAfter = ownedNow + terms.cessions.length * 3;
  const partiesSet = new Set(warParties(war));
  const occEnding = state.occupations.filter((o) => o.occupierAdminId === recipient && partiesSet.has(state.counties[o.countyId]?.ownerAdminId ?? "")).length;
  const occAfter = occNow - occEnding;
  const loadAfter = ownedAfter + occAfter * 2;
  const ownedLabel = [...recip.counties.map((id) => `${state.counties[id]?.name} ${(state.counties[id]?.stats.integration ?? 0) >= 70 ? 1 : 3}`), ...terms.cessions.map((id) => `${state.counties[id]?.name} 3 until Integration 70`)].join(", ");
  const balanceLines: { label: string; value: number }[] = [];
  const supportChanges: SettlementForecast["receiving"]["supportChanges"] = [];
  const budget = forecastBudget(state, recipient);
  let balanceDelta = 0;
  for (const id of terms.cessions) {
    const c = state.counties[id]!;
    const supportAfter = Math.max(0, c.stats.support - WAR.forcedCessionSupportPenalty);
    const staffedA = Math.min(c.allocation.agriculture, c.stats.agriculture);
    const staffedI = Math.min(c.allocation.industry, staffedIndustryCap(c));
    const mult = compliance(supportAfter) * autonomyShare(WAR.forcedCessionAutonomy);
    const tax = r1((ECONOMY.agricultureCreditsPerLevel * staffedA + ECONOMY.industryCreditsPerLevel * staffedI + c.stats.commerce) * mult);
    const expenses = ECONOMY.servicesCostPerW * requiredServiceW(c) + ECONOMY.adminCostPerCounty + ECONOMY.adminCostPerOffice * c.stats.offices + c.stats.transport + c.stats.power + nationalServicePerCounty(state.day);
    balanceLines.push({ label: `${c.name} tax to your treasury · autonomy ${WAR.forcedCessionAutonomy}, compliance ${compliance(supportAfter).toFixed(2)}`, value: tax });
    balanceLines.push({ label: `${c.name} county expenses · services, admin, upkeep, obligations`, value: -expenses });
    balanceDelta += tax - expenses;
    supportChanges.push({ county: c.name, before: c.stats.support, after: supportAfter });
  }
  if (occEnding > 0) {
    const names = state.occupations.filter((o) => o.occupierAdminId === recipient && partiesSet.has(state.counties[o.countyId]?.ownerAdminId ?? "")).map((o) => state.counties[o.countyId]?.name).join(", ");
    balanceLines.push({ label: `Occupation costs end · ${names}`, value: occEnding * ECONOMY.occupationCostPerCounty });
    balanceDelta += occEnding * ECONOMY.occupationCostPerCounty;
  }
  if (terms.reparations > 0) balanceLines.push({ label: "One-time reparations received (not monthly)", value: Math.min(terms.reparations * WAR.reparationsPerPoint, loserAdmin.treasury) });
  const blocked = supportChanges.filter((s) => s.after < 50);
  const integrationNote = terms.cessions.length === 0 ? "No cession selected."
    : blocked.length ? `Integration blocked · ${blocked.map((s) => `${s.county} support ${s.after}, needs 50`).join("; ")}. No progress until support recovers; then at least 14 qualifying months to reach Integration 70.`
    : "Integration may start after peace (15 C, then 2 C/month); at least 14 qualifying months to reach Integration 70.";
  void budget;
  return {
    war, score, terms, termLines, totalCost, withinScore, loser, loserExhaustion: loserAdmin.exhaustion, loserSeatOccupied, acceptable, acceptanceNote, validity,
    whitePeace: whitePeaceStatus(state, war),
    arbitrationInDays: Math.max(0, war.startDay + WAR.arbitrationDay - state.day),
    receiving: {
      loadNow, loadAfter, capacity,
      loadLines: [
        { label: `Owned · ${ownedLabel}`, now: ownedNow, after: ownedAfter },
        { label: `Occupation · ${occNow} counties now, ${occEnding} end at peace`, now: occNow * 2, after: occAfter * 2 },
      ],
      balanceLines, balanceDelta: r1(balanceDelta), supportChanges,
      standingBefore: recip.standing, standingAfter: recip.standing - WAR.cessionStandingPenalty * terms.cessions.length,
      exhaustion: recip.exhaustion, integrationNote,
    },
  };
}

/** The counterparty's lower-cost alternative when a demand exceeds its acceptance rule: the most valuable eligible cessions within the score. */
export function counterOffer(state: GameState, war: War, recipient: AdminId): SettlementTerms | undefined {
  const score = warScore(state, war).total;
  if (score <= 0) return undefined;
  const eligible = cessionCandidates(state, war, recipient).filter((c) => c.eligible).sort((a, b) => b.cost - a.cost);
  const cessions: CountyId[] = [];
  let cost = 0;
  for (const c of eligible) {
    if (cessions.length >= WAR.maxCessionsPerWar) break;
    if (cost + c.cost <= score) { cessions.push(c.county.id); cost += c.cost; }
  }
  if (!cessions.length) return undefined;
  return { cessions, reparations: 0 };
}

/** Apply an accepted settlement: legal control transfers only here, never through battle alone. */
export function applySettlement(state: GameState, war: War, recipient: AdminId, terms: SettlementTerms): void {
  const loser = primaryLoser(state, war);
  const loserAdmin = state.admins[loser]!;
  const recip = state.admins[recipient]!;
  const parties = warParties(war);
  for (const id of terms.cessions) {
    const c = state.counties[id]!;
    const prev = state.admins[c.ownerAdminId]!;
    prev.counties = prev.counties.filter((x) => x !== id);
    recip.counties.push(id);
    c.ownerAdminId = recipient;
    c.stats.support = Math.max(0, c.stats.support - WAR.forcedCessionSupportPenalty);
    c.stats.integration = 0;
    c.stats.autonomy = WAR.forcedCessionAutonomy;
    c.autonomyFloor = { value: WAR.forcedCessionAutonomyFloor, untilDay: state.day + WAR.forcedCessionFloorMonths * 30 };
    delete c.occupierAdminId;
    delete c.occupationDays;
    for (const f of Object.values(state.formations)) if (f.ownerAdminId === prev.id && f.countyId === id) f.countyId = prev.seatCountyId;
    recip.standing = Math.max(0, recip.standing - WAR.cessionStandingPenalty);
    state.ledger.push({ day: state.day, eventId: `cession:${id}`, category: "outcome", text: `${c.name} ceded to ${recip.name} by settlement. Support −${WAR.forcedCessionSupportPenalty}, integration 0, autonomy ${WAR.forcedCessionAutonomy} (floor ${WAR.forcedCessionAutonomyFloor} for ${WAR.forcedCessionFloorMonths} months).` });
  }
  if (terms.reparations > 0) {
    const credits = Math.min(terms.reparations * WAR.reparationsPerPoint, loserAdmin.treasury);
    loserAdmin.treasury -= credits;
    recip.treasury += credits;
  }
  const partySet = new Set(parties);
  state.occupations = state.occupations.filter((o) => !(partySet.has(o.occupierAdminId) && partySet.has(state.counties[o.countyId]?.ownerAdminId ?? "")));
  for (const c of Object.values(state.counties)) if (c.occupierAdminId && partySet.has(c.occupierAdminId) && partySet.has(c.ownerAdminId)) { delete c.occupierAdminId; delete c.occupationDays; }
  const truceUntil = state.day + WAR.truceMonths * 30;
  for (const a of parties) for (const b of parties) if (a !== b) state.admins[a]!.truces[b] = truceUntil;
  war.status = "settled";
  state.log.push({ day: state.day, kind: "diplomacy", text: `Settlement signed: ${terms.cessions.map((id) => state.counties[id]?.name).join(", ") || "no cessions"}${terms.reparations ? `, reparations ${terms.reparations}` : ""}. Truce until ${formatDate(truceUntil)}. Occupations end; legal control transferred only by this agreement.` });
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

function r1(v: number): number {
  return Math.round(v * 10) / 10;
}
