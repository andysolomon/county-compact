// Fixed daily resolution order (GDD §6.5): expire treaties/external events →
// dated decisions → construction/recruitment → movement → battles → occupation
// → standing notices; month end: budgets, support, cohesion, exhaustion, integration.
import { isMonthEnd } from "./calendar";
import { coalitionMonthEnd, evaluateMotions } from "./coalition";
import { completeDiplomaticActions } from "./diplomacy";
import { settleMonth } from "./economy";
import { activeDecisions, applyExpiredDefaults, fireDueEvents } from "./events";
import { completeDueProjects } from "./projects";
import { STANDING, WAR } from "./rules";
import type { GameState } from "./types";
import { warParties } from "./war";

export interface DayReport {
  day: number;
  completions: string[];
  newDecisions: number;
  motionResolved: boolean;
  monthEnd: boolean;
  shouldPause: boolean;
}

export function stepDay(state: GameState): DayReport {
  state.day += 1;
  const report: DayReport = { day: state.day, completions: [], newDecisions: 0, motionResolved: false, monthEnd: false, shouldPause: false };

  // 1. Expirations
  for (const admin of Object.values(state.admins)) {
    for (const [other, until] of Object.entries(admin.truces)) if (until <= state.day) delete admin.truces[other];
  }
  for (const c of Object.values(state.counties)) if (c.autonomyFloor && c.autonomyFloor.untilDay <= state.day) delete c.autonomyFloor;

  // 2. Dated decisions
  applyExpiredDefaults(state);
  const before = activeDecisions(state).length;
  fireDueEvents(state);
  report.newDecisions = Math.max(0, activeDecisions(state).length - before);

  // 3. Construction and diplomatic actions
  report.completions = completeDueProjects(state).map((c) => c.name);
  completeDiplomaticActions(state);
  report.motionResolved = evaluateMotions(state);

  // 6. Occupation progress (held counties count days)
  for (const o of state.occupations) o.days += 1;

  // 7. Arbitration notice for registered wars at day 180
  for (const war of state.wars) {
    if (war.status !== "active" || !war.registered) continue;
    if (state.day >= war.startDay + WAR.arbitrationDay) {
      state.log.push({ day: state.day, kind: "alert", text: "Commission arbitration is due: the higher-score side must settle within half its positive score." });
    }
  }

  if (isMonthEnd(state.day)) {
    monthEnd(state);
    report.monthEnd = true;
  }

  report.shouldPause = report.newDecisions > 0 || (state.pauseOnCompletion && (report.completions.length > 0 || report.motionResolved));
  if (report.shouldPause) state.paused = true;
  return report;
}

export function monthEnd(state: GameState): void {
  for (const admin of Object.values(state.admins)) {
    const forecast = settleMonth(state, admin.id);
    if (admin.isPlayer) {
      state.log.push({ day: state.day, kind: "info", text: `Month end: revenue ${fmt(forecast.revenueTotal)}, expenditure ${fmt(forecast.expenditureTotal)}, net ${forecast.net >= 0 ? "+" : ""}${fmt(forecast.net)} C; materials +${fmt(forecast.materialsNet)} M. Treasury ${fmt(admin.treasury)} C.${admin.arrears > 0 ? ` Arrears ${fmt(admin.arrears)} C.` : ""}` });
    }
    const atWar = state.wars.some((w) => w.status === "active" && warParties(w).includes(admin.id));
    if (atWar) {
      let gain = 3;
      for (const o of state.occupations) if (state.counties[o.countyId]?.ownerAdminId === admin.id && o.occupierAdminId !== admin.id) gain += 2;
      admin.exhaustion = Math.min(100, admin.exhaustion + Math.min(10, gain));
      if (state.wars.some((w) => w.status === "active" && w.aggressorAdminId === admin.id && w.registered)) admin.standing = Math.max(0, admin.standing + STANDING.aggressorMonthly);
      admin.peacefulMonths = 0;
    } else {
      admin.exhaustion = Math.max(0, admin.exhaustion - WAR.exhaustionPeaceRecovery);
      if (admin.arrears === 0) {
        admin.peacefulMonths += 1;
        if (admin.peacefulMonths % 3 === 0) admin.standing = Math.min(100, admin.standing + STANDING.peacefulTriadBonus);
      } else admin.peacefulMonths = 0;
    }
  }
  coalitionMonthEnd(state);
}

function fmt(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}
