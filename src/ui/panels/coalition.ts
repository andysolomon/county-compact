import { neighborsOf } from "../../data/geometry";
import { formatDate } from "../../sim/calendar";
import { admitForecast, coalitionOf, memberVoteRule, submitAdmitMotion, tally, withdrawMotion } from "../../sim/coalition";
import { DIPLOMACY } from "../../sim/rules";
import type { GameState } from "../../sim/types";
import { fmt, h, signed } from "../dom";
import { adminShort } from "../labels";
import type { Store } from "../store";

export function renderCoalition(store: Store, state: GameState): HTMLElement {
  const me = state.admins[state.playerAdminId]!;
  const c = coalitionOf(state, me.id);
  const back = h("button", { class: "btn", onclick: () => store.setDrawer("details") }, "Back");
  if (!c) {
    return h("div", { class: "wide-panel coalition" },
      h("div", { class: "whead" }, h("span", { class: "serif strong", style: "font-size:20px" }, "No coalition membership"), h("span", { class: "muted" }, formatDate(state.day))),
      h("div", { class: "wbody", style: "grid-template-columns:1fr" }, h("div", { class: "section" },
        h("p", { style: "max-width:640px" }, `${me.name} is independent. Joining an existing coalition requires a member's admission motion; founding a new charter is authored in a later increment. Existing coalitions:`),
        h("div", { class: "stack", style: "margin-top:10px;max-width:640px" }, ...Object.values(state.coalitions).map((k) => h("div", { class: "row" }, h("span", { class: "dot", style: `background:${k.color}` }), h("span", { class: "strong" }, k.name), h("span", { class: "muted small" }, `chair ${adminShort(state, k.chairAdminId)} · ${k.members.length} members · cohesion ${k.cohesion}`)))))),
      h("div", { class: "wfoot" }, back));
  }
  const motion = c.motion;
  const voting = motion?.status === "voting";
  const slots = me.actions.filter((a) => a.endDay > state.day).length;

  // Applicant candidates: independent administrations adjacent to any member.
  const candidates = new Set<string>();
  for (const m of c.members) for (const id of state.admins[m]?.counties ?? []) for (const n of neighborsOf(id)) { const o = state.counties[n]?.ownerAdminId; if (o && !state.admins[o]?.coalitionId) candidates.add(o); }
  const applicant = voting ? motion.applicantAdminId : (store.ui.coalitionApplicant && candidates.has(store.ui.coalitionApplicant) ? store.ui.coalitionApplicant : [...candidates].sort()[0]);
  const forecast = applicant ? admitForecast(state, c.id, me.id, applicant) : undefined;
  const app = applicant ? state.admins[applicant] : undefined;
  const appSeat = app ? state.counties[app.seatCountyId] : undefined;
  const t = motion ? tally(motion) : undefined;
  const needed = forecast?.votesNeeded ?? Math.floor(c.members.length / 2) + 1;

  const memberRows = c.members.map((m) => {
    const isMe = m === me.id;
    let vote = "—", reason = motion ? "" : "No motion before the members";
    let cls = "pending";
    if (motion && motion.votes[m]) { const v = motion.votes[m]!; vote = v.vote === "pending" ? "Pending" : v.vote === "yes" ? "Yes" : "No"; cls = v.vote; reason = v.reason + (v.vote === "pending" ? ` · decides ${formatDate(v.decidesDay)}` : ""); }
    else if (!motion && applicant && !isMe) { const r = memberVoteRule(state, c, m, me.id, applicant); vote = `Forecast ${r.vote}`; cls = r.vote; reason = r.reason; }
    else if (!motion && isMe) { vote = "Proposer"; cls = "yes"; reason = "Your vote is recorded as Yes on submission"; }
    return h("div", { class: "vote-row" }, h("span", null, h("span", { class: "strong" }, adminShort(state, m)), isMe ? h("span", { class: "muted" }, " · you") : null, m === c.chairAdminId ? h("span", { class: "muted small" }, " · chair") : null), h("span", { class: `v ${cls}` }, vote), h("span", { class: "reason" }, reason));
  });

  const steps = h("div", { class: "row", style: "gap:14px;font-size:12px" },
    h("span", { class: !motion || motion.status === "voting" ? "strong" : "muted" }, "Draft ✓"),
    h("span", { class: voting ? "strong" : "muted" }, "Vote underway"),
    h("span", { class: motion && !voting ? "strong" : "muted" }, "Resolved"));

  const center = h("div", { class: "col" },
    h("div", { class: "section" }, h("div", { class: "between" }, h("span", { class: "caps" }, "Motion"), steps),
      app ? h("h2", { style: "font-size:24px;margin-top:6px" }, `Admit ${adminShort(state, app.id)}`) : h("h2", { style: "font-size:24px;margin-top:6px" }, "No eligible applicant"),
      app ? h("div", { class: "muted small" }, `${appSeat?.seat} · independent administration · adjacent to ${c.members.filter((m) => neighborsOf(app.seatCountyId).some((n) => state.admins[m]?.counties.includes(n))).map((m) => adminShort(state, m)).join(", ") || "a member"}`) : null,
      !voting && candidates.size > 1 ? h("label", { class: "row small", style: "margin-top:8px" }, h("span", { class: "muted" }, "Applicant"), h("select", { onchange: (e: Event) => { store.ui.coalitionApplicant = (e.target as HTMLSelectElement).value; store.notify(); } },
        ...[...candidates].sort((a, b) => adminShort(state, a).localeCompare(adminShort(state, b))).map((a) => h("option", { value: a, selected: a === applicant }, adminShort(state, a))))) : null),
    app ? h("div", { class: "section small" }, `${adminShort(state, app.id)} keeps its own budget, forces, and legal control · gains charter civil access · owes 1 C / month · one vote · no county transfers.`) : null,
    motion ? h("div", { class: "section" },
      h("div", { class: "between" }, h("span", { class: "strong" }, motion.status === "voting" ? `${t!.yes} vote${t!.yes === 1 ? "" : "s"} secured · ${Math.max(0, needed - t!.yes)} more needed` : motion.status === "passed" ? "Motion passed" : motion.status === "withdrawn" ? "Motion withdrawn" : "Motion failed"),
        h("span", { class: "small muted" }, motion.status === "voting" ? `${t!.pending} pending · vote closes ${formatDate(motion.closesDay)} · ties keep the status quo` : `resolved ${formatDate(Math.min(motion.closesDay, state.day))}`)),
      h("div", { class: "steps", style: "margin-top:6px" }, ...c.members.map((_, i) => h("span", { class: i < (t?.yes ?? 0) ? "on" : "" }))),
      motion.status !== "voting" ? h("div", { class: "small", style: "margin-top:6px" }, motion.resolutionNote ?? "") : null) : null,
    forecast ? h("div", { class: "section" },
      h("div", { class: "between" }, h("span", { class: "strong" }, "Applicant acceptance forecast"), h("span", { class: `badge ${forecast.applicantForecast.likely ? "" : "alert"}` }, forecast.applicantForecast.likely ? "Likely accepted" : "Unlikely")),
      h("div", { class: "term-grid", style: "margin-top:6px" },
        ...forecast.applicantForecast.terms.flatMap((term) => [h("span", null, term.label), h("span", { class: "sym" }, term.symbol ?? ""), h("span", { class: "right" }, signed(term.value))]),
        h("span", { class: "total" }, "Score"), h("span", { class: "sym total" }, `threshold ${forecast.applicantForecast.threshold}`), h("span", { class: "right total" }, fmt(forecast.applicantForecast.score))),
      h("div", { class: "small muted", style: "margin-top:6px" }, `Hard gates: ${forecast.applicantForecast.hardGates.map((g) => `${g.label} · ${g.met ? "met" : "NOT met"}`).join("; ")}.`)) : null,
  );

  const right = h("div", { class: "col" },
    forecast ? h("div", { class: "section" }, h("div", { class: "caps" }, "Common fund impact"),
      h("div", { class: "kv", style: "margin-top:6px" },
        h("span", null, "Dues after admission"), h("span", { class: "right" }, `${forecast.duesAfter} C / mo`),
        h("span", null, `Next month end · ${c.members.length} members`), h("span", { class: "right" }, `${fmt(forecast.fundNow)} → ${fmt(forecast.fundNextMonth)} C`),
        h("span", null, "Following month · applicant's first due"), h("span", { class: "right" }, `${fmt(forecast.fundNextMonth)} → ${fmt(forecast.fundAfterFirstDue)} C`),
        h("span", null, "Member treasuries touched"), h("span", { class: "right" }, "None"))) : null,
    forecast ? h("div", { class: "section" }, h("div", { class: "caps" }, "Requirements"),
      h("div", { class: "stack", style: "margin-top:6px;gap:5px" }, ...forecast.requirements.map((r) => h("div", { class: `check ${r.met ? "met" : r.blocking ? "unmet" : ""}` }, h("span", { class: "box" }, r.met ? "✓" : ""), h("span", null, r.label))))) : null,
    h("div", { class: "section small muted" }, "Direct annexation of a member would need that member's consent and a two-thirds vote. This motion does not change ownership."),
  );

  const footer: HTMLElement[] = [back];
  if (voting) {
    footer.push(h("span", { class: "muted" }, `Your vote is recorded as Yes`));
    footer.push(h("button", { class: "btn danger", style: "margin-left:auto", onclick: () => { withdrawMotion(state, c.id); store.notify(); } }, "Withdraw motion"));
  } else if (forecast) {
    footer.push(h("span", { class: forecast.canSubmit ? "muted" : "alert-text" }, forecast.canSubmit ? `Submitting occupies one diplomatic slot for ${DIPLOMACY.proposalDays} days` : `Blocked · ${forecast.blockedReason}`));
    footer.push(h("button", { class: "btn primary", style: "margin-left:auto", disabled: !forecast.canSubmit, onclick: () => { const r = submitAdmitMotion(state, c.id, me.id, forecast.applicant); store.toast(r.ok ? "Motion submitted." : r.reason); store.notify(); } }, "Submit motion"));
  }

  return h("div", { class: "wide-panel coalition", role: "dialog", "aria-label": "Coalition management" },
    h("div", { class: "whead" },
      h("span", { class: "dot", style: `background:${c.color};width:10px;height:10px` }), h("span", { class: "serif strong", style: "font-size:20px" }, c.name), h("span", { class: "muted" }, `Chair · ${adminShort(state, c.chairAdminId)}`),
      h("span", { class: "row small" }, h("span", { class: "muted" }, "Cohesion"), h("span", { class: "meter", style: "width:60px;margin:0" }, h("span", { style: `width:${c.cohesion}%` })), h("span", { class: "strong" }, String(c.cohesion))),
      h("span", { class: "small" }, "Common fund ", h("b", null, `${fmt(c.commonFund)} C`)),
      voting ? h("span", { class: "badge amber" }, "Vote underway") : null,
      h("span", { class: "small muted", style: "margin-left:auto" }, `Your diplomatic actions ${slots} of ${DIPLOMACY.actionSlots} in use`), h("span", { class: "serif strong" }, formatDate(state.day))),
    h("div", { class: "wbody" }, h("div", { class: "col" }, h("div", { class: "caps", style: "padding:10px 14px 4px" }, "Members · one vote each"), ...memberRows, h("div", { class: "section small" }, h("div", { class: "strong" }, `Strict majority · ${needed} of ${c.members.length} needed`), h("div", { class: "muted" }, t ? `${t.yes} Yes · ${t.no} No · ${t.pending} Pending. Ties keep the status quo.` : "Ties keep the status quo."))), center, right),
    h("div", { class: "wfoot" }, ...footer));
}
