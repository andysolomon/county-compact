import { accessibleCounties } from "../../sim/economy";
import { FORMATIONS } from "../../sim/rules";
import type { GameState } from "../../sim/types";
import { fmt, h } from "../dom";
import { adminShort } from "../labels";
import type { Store } from "../store";

export function renderForces(store: Store, state: GameState): HTMLElement {
  const me = state.admins[state.playerAdminId]!;
  const mine = Object.values(state.formations).filter((f) => f.ownerAdminId === me.id);
  const accessible = accessibleCounties(state, me.id);
  let accessibleW = 0, militaryW = 0;
  for (const id of accessible) { const c = state.counties[id]!; accessibleW += c.stats.workforce; militaryW += c.allocation.security; }
  const cap = Math.max(1, 0.3 * accessibleW);
  return h("div", { class: "stack", style: "gap:0" },
    h("div", { class: "head between" }, h("div", null, h("div", { class: "caps" }, "Forces"), h("h2", { style: "font-size:20px" }, me.name)), h("button", { class: "link small", onclick: () => store.setDrawer("details") }, "Details")),
    ...(mine.length ? mine.map((f) => { const d = FORMATIONS[f.kind]; return h("div", { class: "section" },
      h("div", { class: "between" }, h("span", { class: "strong" }, d.label), h("span", { class: "small" }, `${d.upkeep} C / mo`)),
      h("div", { class: "small muted" }, `In ${state.counties[f.countyId]?.name} · strength ${f.strength} · morale ${f.morale} · power ${d.power} · ${d.workforce} W from ${state.counties[f.homeCountyId]?.name}`)); })
      : [h("div", { class: "section small muted" }, "No formations.")]),
    h("div", { class: "section" }, h("div", { class: "caps" }, "Military workforce cap"), h("div", { class: "kv", style: "margin-top:4px" }, h("span", null, "Assigned military W"), h("span", { class: "right" }, fmt(militaryW)), h("span", null, "Cap · greater of 1 W or 30% of accessible W"), h("span", { class: "right" }, fmt(cap)))),
    h("div", { class: "section" }, h("div", { class: "caps" }, "Recruitment"), h("div", { class: "kv", style: "margin-top:4px" }, ...Object.values(FORMATIONS).flatMap((d) => [h("span", null, `${d.label} · ${d.workforce} W`), h("span", { class: "right" }, `${d.credits} C / ${d.materials} M · ${d.days} d`)])),
      h("div", { class: "small muted", style: "margin-top:6px" }, "Recruitment, movement, supply, and battle orders are authored in a later increment (issues #16–#17). Formations shown here are read from state.")),
    state.wars.length ? h("div", { class: "section" }, h("div", { class: "caps" }, "Wars"), ...state.wars.map((w) => h("div", { class: "small", style: "margin-top:4px" }, `${adminShort(state, w.aggressorAdminId)} vs ${w.defenderAdminIds.map((d) => adminShort(state, d)).join(", ")} · ${w.status}`)), h("button", { class: "btn", style: "margin-top:6px", onclick: () => store.setDrawer("peace") }, "Open peace negotiation")) : null,
  );
}
