// Coalition constitution and the "admit a member" motion (GDD §6.3, wireframe D).
import { acceptanceForecast, isAtWar, militaryPower, relationBetween, strongestAdjacentThreat, type AcceptanceContext } from "./diplomacy";
import { COALITION, DIPLOMACY, ECONOMY } from "./rules";
import type { AcceptanceForecast, AdminId, Coalition, CoalitionMotion, GameState, MotionVote } from "./types";

export interface MotionRequirement {
  label: string;
  met: boolean;
  blocking: boolean; // false = informational
}

export interface AdmitForecast {
  coalition: Coalition;
  applicant: AdminId;
  applicantForecast: AcceptanceForecast;
  requirements: MotionRequirement[];
  canSubmit: boolean;
  blockedReason?: string;
  votesNeeded: number;
  memberCount: number;
  duesAfter: number;
  fundNow: number;
  fundNextMonth: number;
  fundAfterFirstDue: number;
}

export function coalitionOf(state: GameState, adminId: AdminId): Coalition | undefined {
  const cid = state.admins[adminId]?.coalitionId;
  return cid ? state.coalitions[cid] : undefined;
}

export function strictMajority(n: number): number {
  return Math.floor(n / 2) + 1;
}

export function twoThirds(n: number): number {
  return Math.ceil((2 * n) / 3);
}

function coalitionPower(state: GameState, c: Coalition): number {
  return c.members.reduce((s, m) => s + militaryPower(state, m), 0);
}

export function applicantContext(state: GameState, c: Coalition, proposer: AdminId, applicant: AdminId): AcceptanceContext {
  const app = state.admins[applicant]!;
  const seat = state.counties[app.seatCountyId]!;
  const shared: AcceptanceContext["sharedBenefit"] = seat.stats.transport <= 1
    ? { value: 20, reason: "charter access relieves a transport shortfall" }
    : seat.stats.transport === 2 ? { value: 10, reason: "useful route gain" } : { value: 0, reason: "no route gain" };
  const threat = strongestAdjacentThreat(state, applicant, c.id);
  const cover = coalitionPower(state, c);
  const security: AcceptanceContext["securityBenefit"] = threat === 0
    ? { value: 10, reason: "matched defensive cover · no adjacent threat" }
    : cover > threat ? { value: 20, reason: `cover ${r1(cover)} exceeds strongest adjacent threat ${r1(threat)}` }
    : cover >= threat / 2 ? { value: 10, reason: `matched defensive cover · threat ${r1(threat)}` } : { value: 0, reason: "no effective guarantee" };
  const atWar = c.members.some((m) => isAtWar(state, m, applicant));
  return {
    sharedBenefit: shared,
    securityBenefit: security,
    hardGates: [
      { label: "Independent administration, not in another coalition", met: !app.coalitionId },
      { label: "No active war with any member", met: !atWar },
      { label: "Charter accepted on admission", met: true },
      { label: `Proposer ${state.admins[proposer]?.name ?? proposer} holds a coalition seat`, met: c.members.includes(proposer) },
    ],
  };
}

export function admitForecast(state: GameState, coalitionId: string, proposer: AdminId, applicant: AdminId): AdmitForecast {
  const c = state.coalitions[coalitionId]!;
  const prop = state.admins[proposer]!;
  const ctx = applicantContext(state, c, proposer, applicant);
  const applicantForecast = acceptanceForecast(state, proposer, applicant, "coalition", ctx);
  const activeActions = prop.actions.filter((a) => a.endDay > state.day);
  const slotFree = activeActions.length < DIPLOMACY.actionSlots;
  const votesNeeded = strictMajority(c.members.length);
  const requirements: MotionRequirement[] = [
    { label: applicantForecast.likely ? `Applicant consent · forecast score ${applicantForecast.score} ≥ ${applicantForecast.threshold}` : `Applicant consent unavailable · score ${applicantForecast.score} below ${applicantForecast.threshold}${applicantForecast.gatesMet ? "" : " or a hard gate fails"}`, met: applicantForecast.likely, blocking: true },
    { label: slotFree ? `Diplomatic action slot · ${activeActions.length} of ${DIPLOMACY.actionSlots} in use; held ${DIPLOMACY.proposalDays} days` : `No free diplomatic action slot · ${activeActions.length} of ${DIPLOMACY.actionSlots} in use`, met: slotFree, blocking: true },
    { label: c.motion?.status === "voting" ? "Another motion is already before the members" : `Member vote · strict majority, ${votesNeeded} of ${c.members.length} needed`, met: c.motion?.status !== "voting", blocking: true },
    { label: c.cohesion >= COALITION.recruitmentMinCohesion ? `Cohesion ${c.cohesion} ≥ ${COALITION.recruitmentMinCohesion}` : `Cohesion ${c.cohesion} below ${COALITION.recruitmentMinCohesion} · recruitment stopped`, met: c.cohesion >= COALITION.recruitmentMinCohesion, blocking: true },
    { label: "Charter civil access granted on admission · no county transfers", met: true, blocking: false },
  ];
  const blocked = requirements.find((r) => r.blocking && !r.met);
  const duesAfter = (c.members.length + 1) * ECONOMY.coalitionDues;
  return {
    coalition: c, applicant, applicantForecast, requirements, canSubmit: !blocked, ...(blocked ? { blockedReason: blocked.label } : {}),
    votesNeeded, memberCount: c.members.length, duesAfter,
    fundNow: c.commonFund, fundNextMonth: c.commonFund + c.members.length * ECONOMY.coalitionDues, fundAfterFirstDue: c.commonFund + c.members.length * ECONOMY.coalitionDues + duesAfter,
  };
}

/** A member's vote rule, shown with its terms: 0.4R + 0.3Q toward the applicant + shared benefit − 0.3 × alarm toward the proposer ≥ 15. */
export function memberVoteRule(state: GameState, c: Coalition, member: AdminId, proposer: AdminId, applicant: AdminId): { vote: "yes" | "no"; reason: string } {
  const rel = relationBetween(state, member, applicant);
  const alarm = relationBetween(state, member, proposer).alarm;
  const ctx = applicantContext(state, c, proposer, applicant);
  const score = r1(0.4 * rel.relations + 0.3 * rel.trust + ctx.sharedBenefit.value - 0.3 * alarm);
  if (score >= 15) {
    const top = ctx.sharedBenefit.value >= 10 ? ctx.sharedBenefit.reason : `relations ${rel.relations}, trust ${rel.trust}`;
    return { vote: "yes", reason: `${cap(top)} · score ${score}` };
  }
  const why = alarm > 0 ? `Expansion alarm ${alarm} toward the proposer` : `Relations ${rel.relations}, trust ${rel.trust} insufficient`;
  return { vote: "no", reason: `${why} · score ${score} below 15` };
}

export function submitAdmitMotion(state: GameState, coalitionId: string, proposer: AdminId, applicant: AdminId): { ok: true; motion: CoalitionMotion } | { ok: false; reason: string } {
  const f = admitForecast(state, coalitionId, proposer, applicant);
  if (!f.canSubmit) return { ok: false, reason: f.blockedReason ?? "Blocked" };
  const c = f.coalition;
  const prop = state.admins[proposer]!;
  const votes: Record<AdminId, MotionVote> = {};
  const others = c.members.filter((m) => m !== proposer).sort();
  votes[proposer] = { vote: "yes", reason: "Proposer", decidesDay: state.day };
  others.forEach((m, i) => {
    const role = m === c.chairAdminId ? "Chair · evaluating charter and route impact" : "Awaiting weekly evaluation";
    votes[m] = { vote: "pending", reason: role, decidesDay: state.day + COALITION.weeklyEvaluationDays * (i + 1) };
  });
  const motion: CoalitionMotion = { id: `m${state.nextId++}`, kind: "admit", coalitionId, proposerAdminId: proposer, applicantAdminId: applicant, openedDay: state.day, closesDay: state.day + DIPLOMACY.proposalDays, votes, status: "voting" };
  c.motion = motion;
  prop.actions.push({ id: `a${state.nextId++}`, kind: "coalition-motion", targetAdminId: applicant, startDay: state.day, endDay: state.day + DIPLOMACY.proposalDays });
  state.log.push({ day: state.day, kind: "diplomacy", text: `${c.name}: motion to admit ${shortName(state, applicant)} submitted. Vote closes in ${DIPLOMACY.proposalDays} days.` });
  return { ok: true, motion };
}

export function withdrawMotion(state: GameState, coalitionId: string): void {
  const c = state.coalitions[coalitionId];
  if (!c?.motion || c.motion.status !== "voting") return;
  c.motion.status = "withdrawn";
  c.motion.resolutionNote = "Withdrawn by the proposer.";
  releaseSlot(state, c.motion);
  state.log.push({ day: state.day, kind: "diplomacy", text: `${c.name}: motion to admit ${shortName(state, c.motion.applicantAdminId)} withdrawn.` });
}

export function tally(motion: CoalitionMotion): { yes: number; no: number; pending: number } {
  let yes = 0, no = 0, pending = 0;
  for (const v of Object.values(motion.votes)) v.vote === "yes" ? yes++ : v.vote === "no" ? no++ : pending++;
  return { yes, no, pending };
}

/** Daily: members decide on their scheduled day; motions pass, fail, or expire. Returns true if any motion resolved. */
export function evaluateMotions(state: GameState): boolean {
  let resolved = false;
  for (const c of Object.values(state.coalitions)) {
    const m = c.motion;
    if (!m || m.status !== "voting") continue;
    for (const [member, v] of Object.entries(m.votes)) {
      if (v.vote !== "pending" || v.decidesDay > state.day) continue;
      const r = memberVoteRule(state, c, member, m.proposerAdminId, m.applicantAdminId);
      m.votes[member] = { ...v, vote: r.vote, reason: r.reason };
    }
    const t = tally(m);
    const needed = strictMajority(c.members.length);
    if (t.yes >= needed) {
      const f = admitForecast(state, c.id, m.proposerAdminId, m.applicantAdminId);
      if (f.applicantForecast.likely) {
        m.status = "passed";
        const app = state.admins[m.applicantAdminId]!;
        app.coalitionId = c.id;
        c.members.push(app.id);
        m.resolutionNote = `Admitted with ${t.yes} of ${c.members.length - 1} votes. Applicant keeps its budget, forces, and legal control; dues begin next month end.`;
        state.log.push({ day: state.day, kind: "diplomacy", text: `${c.name}: ${shortName(state, app.id)} admitted (${t.yes} yes). No county transfers.` });
      } else {
        m.status = "failed";
        m.resolutionNote = `Vote passed but the applicant declined at resolution (score ${f.applicantForecast.score} below ${f.applicantForecast.threshold}).`;
        state.log.push({ day: state.day, kind: "diplomacy", text: `${c.name}: ${shortName(state, m.applicantAdminId)} declined membership at resolution.` });
      }
      releaseSlot(state, m);
      resolved = true;
    } else if (t.no > c.members.length - needed) {
      m.status = "failed";
      m.resolutionNote = `Rejected · ${t.no} no votes make a majority impossible. Status quo retained.`;
      state.log.push({ day: state.day, kind: "diplomacy", text: `${c.name}: motion to admit ${shortName(state, m.applicantAdminId)} rejected.` });
      releaseSlot(state, m);
      resolved = true;
    } else if (state.day >= m.closesDay) {
      m.status = "failed";
      m.resolutionNote = "Vote closed without a majority. Ties and pending votes retain the status quo.";
      state.log.push({ day: state.day, kind: "diplomacy", text: `${c.name}: motion to admit ${shortName(state, m.applicantAdminId)} lapsed without a majority.` });
      releaseSlot(state, m);
      resolved = true;
    }
  }
  return resolved;
}

function releaseSlot(state: GameState, m: CoalitionMotion): void {
  const prop = state.admins[m.proposerAdminId];
  if (prop) prop.actions = prop.actions.filter((a) => !(a.kind === "coalition-motion" && a.targetAdminId === m.applicantAdminId));
}

/** Month end: dues into the common fund, cohesion drift. */
export function coalitionMonthEnd(state: GameState): void {
  for (const c of Object.values(state.coalitions)) {
    let unpaid = 0;
    for (const m of c.members) {
      const a = state.admins[m];
      if (!a) continue;
      if (a.arrears > 0) unpaid++;
      else c.commonFund += ECONOMY.coalitionDues;
    }
    const delta = unpaid === 0 ? COALITION.cohesionMonthlyGain : Math.max(COALITION.cohesionUnpaidCap, COALITION.cohesionUnpaidPenalty * unpaid);
    c.cohesion = Math.max(0, Math.min(100, c.cohesion + delta));
  }
}

export function shortName(state: GameState, adminId: AdminId): string {
  return state.admins[adminId]?.name.replace(" Administration", "") ?? adminId;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function r1(v: number): number {
  return Math.round(v * 10) / 10;
}
