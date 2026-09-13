import { formatDate } from "../../sim/calendar";
import type { GameState } from "../../sim/types";
import { applySettlement, cessionCandidates, counterOffer, forecastSettlement, primaryLoser, warParties } from "../../sim/war";
import { h, signed } from "../dom";
import { adminShort } from "../labels";
import type { Store } from "../store";

let confirming = false;

export function renderPeace(store: Store, state: GameState): HTMLElement {
  const me = state.admins[state.playerAdminId]!;
  const back = h("button", { class: "btn", onclick: () => { confirming = false; store.setDrawer("details"); } }, "Back");
  const war = state.wars.find((w) => w.status === "active" && warParties(w).includes(me.id));
  if (!war) {
    return h("div", { class: "wide-panel peace" },
      h("div", { class: "whead" }, h("span", { class: "serif strong", style: "font-size:20px" }, "No active war"), h("span", { class: "muted", style: "margin-left:auto" }, formatDate(state.day))),
      h("div", { class: "wbody", style: "grid-template-columns:1fr" }, h("div", { class: "section" }, h("p", { style: "max-width:640px" }, "Peace negotiation opens when your administration is a party to a registered dispute. Claims, registration, and battles are authored in a later increment (issues #16–#18). The settlement rules can be exercised now in the peace-settlement training scenario from the main menu."),
        state.wars.length ? h("p", { class: "muted", style: "margin-top:8px" }, `Settled wars: ${state.wars.length}.`) : null)),
      h("div", { class: "wfoot" }, back));
  }
  const recipient = me.id;
  const terms = { cessions: store.ui.peaceCessions.filter((id) => state.counties[id]), reparations: store.ui.peaceReparations };
  const f = forecastSettlement(state, war, recipient, terms);
  const cands = cessionCandidates(state, war, recipient, terms.cessions);
  const loser = primaryLoser(state, war);
  const goalName = war.goal.kind === "release" ? adminShort(state, war.goal.adminId) : state.counties[war.goal.countyId]?.name;
  const toggle = (id: string) => { const set = new Set(store.ui.peaceCessions); set.has(id) ? set.delete(id) : set.add(id); store.ui.peaceCessions = [...set]; confirming = false; store.notify(); };
  const counter = counterOffer(state, war, recipient);
  const others = war.defenderAdminIds.filter((d) => d !== loser).map((d) => adminShort(state, d));

  const left = h("div", { class: "col" }, h("div", { class: "caps", style: "padding:10px 14px 4px" }, "Cession candidates"),
    ...cands.map((c) => {
      const selected = terms.cessions.includes(c.county.id);
      return h("button", { class: "list-row", style: "grid-template-columns:1fr auto", "aria-selected": String(selected), "aria-pressed": String(selected), disabled: !c.eligible, onclick: () => toggle(c.county.id) },
        h("span", { class: "strong" }, c.county.name), h("span", { class: `small ${c.eligible ? "" : "alert-text"}` }, c.eligible ? (selected ? "Selected" : "Eligible") : "Not eligible"),
        h("span", { class: "sub" }, `${c.ownerName}${state.admins[c.county.ownerAdminId]?.coalitionId ? ` · ${state.coalitions[state.admins[c.county.ownerAdminId]!.coalitionId!]?.name}` : " · independent"}`),
        h("span", { class: "sub" }, c.eligible ? `Occupied ${c.occupiedDays} days · claim registered ${c.claimDay !== undefined ? formatDate(c.claimDay) : "—"} · I ${c.county.stats.industry} · B ${c.county.stats.commerce} · cession cost ${c.cost}` : `${c.occupiedDays ? `Occupied ${c.occupiedDays} days` : "Not occupied"} · ${c.reasons.join(" · ")}`));
    }),
    h("div", { class: "section small muted" }, "Maximum two counties per war. Ceded counties must be occupied, claimed, and contiguous with the recipient through legal access. Unoccupied or unclaimed counties cannot be selected."),
    h("div", { class: "section" }, h("div", { class: "caps" }, "Reparations"), h("div", { class: "row", style: "margin-top:6px" }, h("span", { class: "segmented" }, ...[0, 10, 20, 30].map((r) => h("button", { "aria-pressed": String(terms.reparations === r), onclick: () => { store.ui.peaceReparations = r; confirming = false; store.notify(); } }, r === 0 ? "none" : String(r)))), h("span", { class: "small muted" }, "2 C per point, capped at payer treasury"))));

  const center = h("div", { class: "col", style: "display:flex;flex-direction:column" },
    h("div", { style: "flex:1;min-height:120px" }),
    h("div", { class: "section", style: "background:var(--paper)" },
      h("div", { class: "caps" }, "Proposed terms"),
      h("div", { class: "kv", style: "margin-top:6px" }, ...f.termLines.flatMap((l) => [h("span", null, l.label), h("span", { class: "right strong" }, l.value)])),
      f.validity.length ? h("div", { class: "small alert-text", style: "margin-top:6px" }, f.validity.join(" · ")) : null),
    h("div", { class: "section", style: "background:var(--paper-sunk)" },
      h("div", { class: "between" }, h("span", { class: "strong" }, "Terms vs war score"), h("span", { class: "strong", style: "font-size:16px" }, `${f.totalCost} of ${signed(f.score.total)}`)),
      h("div", { class: `small ${f.acceptable ? "" : "alert-text"}`, style: "margin-top:2px" }, f.acceptanceNote),
      h("div", { class: "kv small muted", style: "margin-top:6px" }, ...f.score.lines.flatMap((l) => [h("span", null, l.label), h("span", { class: "right" }, signed(l.value))]))),
    h("div", { class: "section small", style: "background:var(--paper)" },
      h("div", { class: "row" }, h("span", { class: "swatch", style: "background:var(--fill-player);border:2.5px solid var(--ink)" }), `${me.name} · ${me.counties.map((id) => state.counties[id]?.name).join(", ")}`),
      h("div", { class: "row" }, h("span", { class: "swatch", style: "background:repeating-linear-gradient(135deg,rgba(37,42,45,.55) 0 1px,transparent 1px 4px)" }), "Occupied by you · owner unchanged, labelled"),
      h("div", { class: "row" }, h("span", { class: "swatch", style: "border:2px solid var(--amber);background:none" }), "Selected cession target")));

  const r = f.receiving;
  const right = h("div", { class: "col" },
    h("div", { class: "section" }, h("div", { class: "caps" }, "Receiving administration"), h("div", { class: "serif strong", style: "font-size:18px" }, me.name), h("div", { class: "small muted" }, `Forecast if ${adminShort(state, loser)} Administration accepts`)),
    h("div", { class: "section small" }, h("span", { class: r.integrationNote.startsWith("Integration blocked") ? "strong alert-text" : "strong" }, r.integrationNote.split(" · ")[0]), r.integrationNote.includes(" · ") ? ` · ${r.integrationNote.slice(r.integrationNote.indexOf(" · ") + 3)}` : ""),
    h("div", { class: "section" }, h("div", { class: "between" }, h("span", { class: "strong" }, "Administrative load"), h("span", { class: `strong ${r.loadAfter > r.capacity ? "alert-text" : ""}` }, `${r.loadNow} → ${r.loadAfter} of ${r.capacity}`)),
      h("div", { class: "term-grid small", style: "margin-top:4px" }, h("span", null, ""), h("span", { class: "sym" }, "now"), h("span", { class: "sym right" }, "after"), ...r.loadLines.flatMap((l) => [h("span", null, l.label), h("span", { class: "right" }, String(l.now)), h("span", { class: "right" }, String(l.after))]))),
    h("div", { class: "section" }, h("div", { class: "between" }, h("span", { class: "strong" }, "Change in monthly balance"), h("span", { class: "strong" }, `${signed(r.balanceDelta)} C / mo`)),
      h("div", { class: "kv small", style: "margin-top:4px" }, ...r.balanceLines.flatMap((l) => [h("span", null, l.label), h("span", { class: "right" }, signed(l.value))]))),
    h("div", { class: "section" }, h("div", { class: "kv" },
      ...r.supportChanges.flatMap((sc) => [h("span", null, `${sc.county} support`), h("span", { class: "right strong alert-text" }, `${sc.before} → ${sc.after}`)]),
      terms.cessions.length ? h("span", null, "Autonomy") : null, terms.cessions.length ? h("span", { class: "right" }, "80 · floor 60 for 24 months") : null,
      h("span", null, "Federal Standing"), h("span", { class: "right" }, terms.cessions.length ? `${r.standingBefore} → ${r.standingAfter}` : String(r.standingBefore)),
      h("span", null, "War exhaustion"), h("span", { class: "right" }, `${r.exhaustion} · −5 / mo at peace`))),
    h("div", { class: "section small muted" }, "Ceded administrations' formations do not transfer. Debt follows only a documented project share."));

  const send = () => {
    if (!f.acceptable) {
      if (counter) { store.toast(`${adminShort(state, loser)} offers a lower-cost settlement: cede ${counter.cessions.map((id) => state.counties[id]?.name).join(", ")}. Terms loaded for review.`); store.ui.peaceCessions = counter.cessions; store.ui.peaceReparations = 0; }
      else store.toast(`${adminShort(state, loser)} rejects the offer: ${f.acceptanceNote}.`);
      confirming = false; store.notify(); return;
    }
    applySettlement(state, war, recipient, terms);
    confirming = false;
    store.ui.peaceCessions = [];
    store.ui.peaceReparations = 0;
    store.toast("Settlement accepted. Occupation ends; legal control transferred by agreement.");
    store.setDrawer("details");
  };

  const foot = h("div", { class: "wfoot" }, back,
    h("span", { class: "small muted", style: "flex:1" }, confirming
      ? `Final summary: ${adminShort(state, loser)} cedes ${terms.cessions.map((id) => state.counties[id]?.name).join(", ") || "nothing"}${terms.reparations ? ` and pays ${terms.reparations} points` : ""}; ${others.join(", ") || "no other party"} sign the truce and cede nothing. Standing ${r.standingBefore} → ${r.standingAfter}.`
      : `Counterparty: ${adminShort(state, loser)} Administration${terms.cessions.length ? ` cedes ${terms.cessions.map((id) => state.counties[id]?.name).join(", ")}` : ""}. ${others.length ? `${others.join(", ")} sign the truce and cede nothing. ` : ""}You confirm a final summary before sending.`),
    h("span", { class: "small", style: "text-align:right" }, h("span", { class: f.whitePeace.available ? "strong" : "muted" }, `White peace · ${f.whitePeace.available ? "available" : "unavailable"}`), h("br"), h("span", { class: "muted" }, f.whitePeace.reason)),
    confirming
      ? h("button", { class: "btn primary large", onclick: send }, f.acceptable ? "Send offer" : "Send anyway · expect a counteroffer")
      : h("button", { class: "btn primary large", disabled: !terms.cessions.length && !terms.reparations, onclick: () => { confirming = true; store.notify(); } }, "Review and send offer"));

  return h("div", { class: "wide-panel peace", role: "dialog", "aria-label": "Peace negotiation" },
    h("div", { class: "whead" }, h("span", { class: "badge" }, "Negotiation"), h("span", null, "War goal · ", h("b", null, `${war.goal.kind === "claim" ? "Adjacent claim" : war.goal.kind === "access" ? "Access enforcement" : "Release"}, ${goalName}`)),
      h("span", null, "War score ", h("b", null, signed(f.score.total))), h("span", null, "Loser exhaustion ", h("b", null, String(f.loserExhaustion))),
      h("span", { class: "row" }, h("span", { class: "dot", style: "background:var(--amber)" }), "Federal arbitration in ", h("b", null, `${f.arbitrationInDays} days`)),
      h("span", { class: "serif strong", style: "margin-left:auto" }, formatDate(state.day))),
    h("div", { class: "wbody" }, left, center, right), foot);
}
