// Bell industrial chain, E01 and E02 (GDD §7.2). Historical basis: S1.
// All costs, deadlines, and consequences are scenario fiction.
import { dayOf, formatDate } from "./calendar";
import { availableW, forecastBudget } from "./economy";
import type { DecisionInstance, GameState } from "./types";

export interface DecisionOption {
  id: "A" | "B";
  title: string;
  costLabel: string;
  credits: number;
  materials: number;
  lines: string[];
  affordable: boolean;
  shortfall?: string;
  isDefault: boolean;
  forecast: { label: string; value: string }[];
  prerequisites: { label: string; met: boolean; note?: string }[];
}

export interface DecisionView {
  instance: DecisionInstance;
  category: "Conditional history" | "Scenario fiction";
  title: string;
  narrative: string[];
  historicalNote: string;
  source: string;
  affected: string;
  windowText: string;
  options: DecisionOption[];
  locateCountyId: string;
}

export const E01_DAY = dayOf(1942, 2, 19);
export const E01_ACCESS_DEADLINE = dayOf(1942, 6, 30);
export const E02_OPEN = dayOf(1942, 4, 2);
export const E02_CLOSE = dayOf(1942, 6, 30);
export const BELL_CONSTRUCTION_DAYS = 395;
export const DECISION_WINDOW_DAYS = 30;

function cobbCounty(state: GameState) {
  return Object.values(state.counties).find((c) => c.bell);
}

function transportUnderwayOrDone(state: GameState, countyId: string): { met: boolean; note: string } {
  const c = state.counties[countyId]!;
  if (c.stats.transport >= 2) return { met: true, note: `Transport level ${c.stats.transport}` };
  if (c.project?.kind === "transport") return { met: true, note: `yours completes about ${formatDate(c.project.completeDay)}` };
  return { met: false, note: "no transport project underway" };
}

/** Daily: fire Bell decisions whose window opens today. */
export function fireDueEvents(state: GameState): DecisionInstance[] {
  const fired: DecisionInstance[] = [];
  const cobb = cobbCounty(state);
  if (!cobb || !cobb.bell) return fired;
  const bell = cobb.bell;
  const admin = state.admins[cobb.ownerAdminId]!;
  const pendingFor = (eventId: DecisionInstance["eventId"]) => state.pendingDecisions.some((d) => d.eventId === eventId);
  const firedBefore = (eventId: string) => state.ledger.some((l) => l.eventId === eventId);

  if (state.day === E01_DAY && bell.state === "candidate" && !cobb.occupierAdminId && !firedBefore("E01")) {
    const inst = makeInstance(state, "E01", cobb.id, admin.id);
    state.ledger.push({ day: state.day, eventId: "E01", category: "conditional", text: "Marietta selected for aircraft investment (historical selection date, S1). Local choices are fictional." });
    fired.push(inst);
  }
  if (bell.reviewDay !== undefined && state.day === bell.reviewDay && bell.state === "candidate" && !pendingFor("E01-review")) {
    const check = transportUnderwayOrDone(state, cobb.id);
    if (check.met) {
      bell.state = "accepted";
      delete bell.reviewDay;
      bell.acceptedDay = state.day;
      bell.accessDeadlineDay = E01_ACCESS_DEADLINE;
      state.ledger.push({ day: state.day, eventId: "E01-review", category: "outcome", text: `Bell review: access requirements met (${check.note}); obligations accepted at review.` });
      state.log.push({ day: state.day, kind: "decision", text: `Bell review passed: ${check.note}. Construction commitment may follow.` });
      if (state.day >= E02_OPEN && state.day <= E02_CLOSE) fired.push(makeInstance(state, "E02", cobb.id, admin.id));
    } else {
      closeBell(state, cobb.id, "Access requirements unmet at the 90-day review.");
    }
  }
  if (bell.state === "accepted" && bell.accessDeadlineDay !== undefined && state.day > bell.accessDeadlineDay) {
    const check = transportUnderwayOrDone(state, cobb.id);
    if (!check.met) closeBell(state, cobb.id, "Transport level 2 was not reached or underway by 30 June 1942.");
  }
  if (bell.state === "accepted" && state.day >= E02_OPEN && state.day <= E02_CLOSE && !pendingFor("E02") && !firedBefore("E02") && !cobb.occupierAdminId && admin.standing >= 40) {
    const check = transportUnderwayOrDone(state, cobb.id);
    if (check.met) {
      state.ledger.push({ day: state.day, eventId: "E02", category: "conditional", text: "The construction commitment (historical groundbreaking 2 April 1942, S1)." });
      fired.push(makeInstance(state, "E02", cobb.id, admin.id));
    }
  }
  if (bell.state === "accepted" && state.day > E02_CLOSE && !pendingFor("E02")) {
    closeBell(state, cobb.id, "The construction window closed on 30 June 1942 without a local commitment.");
  }
  if (bell.state === "construction" && bell.constructionStartDay !== undefined && state.day >= bell.constructionStartDay + BELL_CONSTRUCTION_DAYS) {
    bell.state = "ready";
    state.log.push({ day: state.day, kind: "completion", text: "Bell: federal main-building construction complete. Production start (E03) is authored in a later increment; the plant is Ready, not Operating." });
    state.ledger.push({ day: state.day, eventId: "E02-complete", category: "outcome", text: "Federal construction timeline of 395 days completed." });
  }
  state.pendingDecisions.push(...fired);
  return fired;
}

function makeInstance(state: GameState, eventId: DecisionInstance["eventId"], countyId: string, adminId: string): DecisionInstance {
  return { id: `d${state.nextId++}`, eventId, firedDay: state.day, deadlineDay: state.day + DECISION_WINDOW_DAYS, countyId, adminId };
}

function closeBell(state: GameState, countyId: string, reason: string): void {
  const c = state.counties[countyId]!;
  if (!c.bell) return;
  c.bell.state = "closed";
  c.bell.closedReason = reason;
  delete c.bell.reviewDay;
  state.ledger.push({ day: state.day, eventId: "E01-closed", category: "outcome", text: `Historical development did not occur here in this campaign. ${reason}` });
  state.log.push({ day: state.day, kind: "alert", text: `Bell opportunity closed: ${reason}` });
}

export function viewDecision(state: GameState, inst: DecisionInstance): DecisionView {
  const county = state.counties[inst.countyId]!;
  const admin = state.admins[inst.adminId]!;
  const budget = forecastBudget(state, admin.id);
  const essential = budget.essentialMonthly;
  const money = (credits: number, materials: number) => {
    const t = admin.treasury - credits;
    const m = admin.materials - materials;
    const affordable = t >= 0 && m >= 0;
    const shortfall = affordable ? undefined : t < 0 ? `Short ${(-t).toFixed(0)} C` : `Short ${(-m).toFixed(0)} M`;
    return { t, m, affordable, shortfall };
  };
  if (inst.eventId === "E01") {
    const a = money(20, 4);
    const access = transportUnderwayOrDone(state, county.id);
    const review = state.day + 90;
    return {
      instance: inst,
      category: "Conditional history",
      title: "Marietta selected for aircraft investment",
      narrative: [
        "The War Department has selected Marietta for an aircraft plant. Our immediate responsibilities concern access, services, and local preparation. Production has not begun.",
        "Accepting creates obligations for access works and liaison staff before any federal contract pays. Delay preserves reserves but may lose the opportunity.",
      ],
      historicalNote: "Marietta was selected for the aircraft plant on 19 February 1942. Costs and deadlines here are scenario fiction.",
      source: "S1 · Thomas A. Scott, “Bell Bomber,” New Georgia Encyclopedia",
      affected: `${county.name} · coalition notified`,
      windowText: `Decision window: ${DECISION_WINDOW_DAYS} days · default on ${formatDate(inst.deadlineDay)} is Option B`,
      locateCountyId: county.id,
      options: [
        {
          id: "A", title: "Accept enabling obligations", costLabel: "20 C / 4 M now", credits: 20, materials: 4, isDefault: false,
          lines: ["Pledge access works and a liaison. Opens the construction commitment (E02).", "No production income results from this choice."],
          affordable: a.affordable, ...(a.shortfall ? { shortfall: a.shortfall } : {}),
          forecast: [
            { label: "Treasury after choice", value: `${fmt(admin.treasury)} → ${fmt(a.t)} C` },
            { label: "Materials after choice", value: `${fmt(admin.materials)} → ${fmt(a.m)} M` },
            { label: "Reserve in essential months", value: essential > 0 ? (a.t / essential).toFixed(1) : "—" },
          ],
          prerequisites: [{ label: `Deadline 30 Jun 1942: transport level 2, or a transport project underway`, met: access.met, note: access.met ? `Met · ${access.note}` : `Not met · ${access.note}; fund transport before 30 Jun` }],
        },
        {
          id: "B", title: "Request delay", costLabel: "No cost", credits: 0, materials: 0, isDefault: true,
          lines: [`One 90-day review. If requirements are still unmet on ${formatDate(review)}, the opportunity closes here.`, "No instant factory somewhere else; the divergence is recorded."],
          affordable: true,
          forecast: [
            { label: "Treasury after choice", value: `${fmt(admin.treasury)} C` },
            { label: "Materials after choice", value: `${fmt(admin.materials)} M` },
            { label: "Review due", value: formatDate(review) },
          ],
          prerequisites: [],
        },
      ],
    };
  }
  // E02
  const a = money(24, 8);
  const liaisonFree = availableW(county) >= 1;
  const finish = state.day + BELL_CONSTRUCTION_DAYS;
  const canPostpone = !county.bell?.postponedOnce && state.day + 60 <= E02_CLOSE;
  return {
    instance: inst,
    category: "Conditional history",
    title: "The construction commitment",
    narrative: [
      "Construction brings an immediate obligation to coordinate access and local services, well before the plant produces aircraft.",
      "National construction is a protected federal milestone, separate from the county's single local project slot. The liaison workforce stays unavailable for farms or armies.",
    ],
    historicalNote: "Groundbreaking occurred on 2 April 1942 with an approximately thirteen-month main-building construction. The 395-day timeline is a design abstraction.",
    source: "S1 · Thomas A. Scott, “Bell Bomber,” New Georgia Encyclopedia",
    affected: `${county.name} · Fulton receives a freight-demand notification`,
    windowText: `Window 2 Apr – 30 Jun 1942 · default on ${formatDate(inst.deadlineDay)} is Option B`,
    locateCountyId: county.id,
    options: [
      {
        id: "A", title: "Fund the local commitment", costLabel: "24 C / 8 M now", credits: 24, materials: 8, isDefault: false,
        lines: [`Reserve 1 W as liaison during a ${BELL_CONSTRUCTION_DAYS}-day federal construction timeline.`, `Facility advances to Construction; main building complete about ${formatDate(finish)}.`],
        affordable: a.affordable && liaisonFree, ...(a.shortfall ? { shortfall: a.shortfall } : !liaisonFree ? { shortfall: "No available W for the liaison" } : {}),
        forecast: [
          { label: "Treasury after choice", value: `${fmt(admin.treasury)} → ${fmt(a.t)} C` },
          { label: "Materials after choice", value: `${fmt(admin.materials)} → ${fmt(a.m)} M` },
          { label: "Reserve in essential months", value: essential > 0 ? (a.t / essential).toFixed(1) : "—" },
        ],
        prerequisites: [
          { label: "1 W available for liaison", met: liaisonFree, note: `${availableW(county)} W free` },
          { label: "Federal Standing ≥ 40", met: admin.standing >= 40, note: `Standing ${admin.standing}` },
        ],
      },
      {
        id: "B", title: canPostpone ? "Postpone" : "Postpone · unavailable, closes the chain", costLabel: "No cost", credits: 0, materials: 0, isDefault: true,
        lines: canPostpone ? [`Postpone up to 60 days within the window; the decision returns on ${formatDate(state.day + 60)}.`, "Missing 30 June closes the chain."] : ["A second postponement is not permitted; declining closes the local opportunity."],
        affordable: true,
        forecast: [{ label: "Treasury after choice", value: `${fmt(admin.treasury)} C` }, { label: canPostpone ? "Decision returns" : "Outcome", value: canPostpone ? formatDate(state.day + 60) : "Opportunity closed" }],
        prerequisites: [],
      },
    ],
  };
}

export function resolveDecision(state: GameState, instanceId: string, optionId: "A" | "B"): { ok: true } | { ok: false; reason: string } {
  const idx = state.pendingDecisions.findIndex((d) => d.id === instanceId);
  const inst = state.pendingDecisions[idx];
  if (!inst) return { ok: false, reason: "Decision no longer pending" };
  const view = viewDecision(state, inst);
  const opt = view.options.find((o) => o.id === optionId)!;
  if (!opt.affordable) return { ok: false, reason: opt.shortfall ?? "Option unavailable" };
  const county = state.counties[inst.countyId]!;
  const admin = state.admins[inst.adminId]!;
  const bell = county.bell!;
  admin.treasury -= opt.credits;
  admin.materials -= opt.materials;
  state.pendingDecisions.splice(idx, 1);

  if (inst.eventId === "E01") {
    if (optionId === "A") {
      bell.state = "accepted";
      bell.acceptedDay = state.day;
      bell.accessDeadlineDay = E01_ACCESS_DEADLINE;
      state.ledger.push({ day: state.day, eventId: "E01-A", category: "outcome", text: "Accepted enabling obligations for the Bell plant (20 C / 4 M). Access deadline 30 June 1942." });
      state.log.push({ day: state.day, kind: "decision", text: "Bell: enabling obligations accepted. Transport level 2 or a transport project must be in place by 30 Jun." });
    } else {
      bell.reviewDay = state.day + 90;
      state.ledger.push({ day: state.day, eventId: "E01-B", category: "outcome", text: `Requested delay; single review on ${formatDate(bell.reviewDay)}.` });
      state.log.push({ day: state.day, kind: "decision", text: `Bell: delay requested. One review on ${formatDate(bell.reviewDay)}.` });
    }
  } else if (inst.eventId === "E02") {
    if (optionId === "A") {
      bell.state = "construction";
      bell.constructionStartDay = state.day;
      bell.constructionDays = BELL_CONSTRUCTION_DAYS;
      county.allocation.liaison += 1;
      state.ledger.push({ day: state.day, eventId: "E02-A", category: "outcome", text: "Funded the local construction commitment (24 C / 8 M); 1 W reserved as liaison for 395 days." });
      state.log.push({ day: state.day, kind: "decision", text: `Bell: construction underway. Main building complete about ${formatDate(state.day + BELL_CONSTRUCTION_DAYS)}.` });
    } else if (!bell.postponedOnce && state.day + 60 <= E02_CLOSE) {
      bell.postponedOnce = true;
      state.pendingDecisions.push({ id: `d${state.nextId++}`, eventId: "E02", firedDay: state.day + 60, deadlineDay: state.day + 60 + DECISION_WINDOW_DAYS, countyId: county.id, adminId: admin.id });
      // The postponed instance is inserted with a future firedDay; the engine surfaces it when the day arrives.
      state.ledger.push({ day: state.day, eventId: "E02-B", category: "outcome", text: `Construction commitment postponed 60 days, to ${formatDate(state.day + 60)}.` });
      state.log.push({ day: state.day, kind: "decision", text: `Bell: commitment postponed to ${formatDate(state.day + 60)}.` });
    } else {
      closeBell(state, county.id, "The local construction commitment was declined.");
    }
  }
  return { ok: true };
}

/** Apply the labeled no-spend default to decisions past their window. */
export function applyExpiredDefaults(state: GameState): void {
  for (const inst of [...state.pendingDecisions]) {
    if (inst.firedDay <= state.day && state.day >= inst.deadlineDay) {
      state.log.push({ day: state.day, kind: "alert", text: `Decision window closed; the no-spend default applied (${inst.eventId}).` });
      resolveDecision(state, inst.id, "B");
    }
  }
}

export function activeDecisions(state: GameState): DecisionInstance[] {
  return state.pendingDecisions.filter((d) => d.firedDay <= state.day);
}

function fmt(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}
