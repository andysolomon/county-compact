import { projectOffers, startProject } from "../../sim/projects";
import type { County, GameState } from "../../sim/types";
import { fmt, h } from "../dom";
import { governsNote } from "../labels";
import type { Store } from "../store";

export function renderDevelop(store: Store, state: GameState, county: County): HTMLElement {
  const you = county.ownerAdminId === state.playerAdminId;
  const offers = projectOffers(state, county.id);
  const note = governsNote(state, county);
  return h("div", { class: "stack", style: "gap:0;min-height:100%" },
    h("div", { class: "head between" }, h("div", null, h("div", { class: "caps" }, "Develop"), h("h2", { style: "font-size:20px" }, `${county.name} County`)), h("button", { class: "link small", onclick: () => store.setDrawer("details") }, "Details")),
    note ? h("div", { class: "section" }, h("div", { class: "notice" }, h("span", { class: "mark", style: "background:var(--ink-muted)" }), h("span", null, note))) : null,
    ...offers.map((o) => h("div", { class: "section", style: o.available ? "" : "opacity:.75" },
      h("div", { class: "between" }, h("span", { class: "strong" }, o.def.label), h("span", null, `${o.def.credits} C / ${o.def.materials} M`)),
      h("div", { class: "small muted" }, `${o.def.days} days · ${o.resultText}${o.upkeepDelta ? ` · +${o.upkeepDelta} C upkeep` : ""} · 2 W reserved`),
      o.available
        ? h("div", { class: "between", style: "margin-top:4px" },
          h("span", { class: "small" }, `After: ${fmt(o.treasuryAfter)} C, ${fmt(o.materialsAfter)} M · reserve ${o.reserveMonthsAfter.toFixed(1)} months of essentials`),
          you ? h("button", { class: "btn primary", onclick: () => { const r = startProject(state, county.id, o.def.id); store.toast(r.ok ? `${o.def.label} funded.` : r.reason); store.notify(); } }, "Fund") : null)
        : h("div", { class: "small alert-text", style: "margin-top:2px" }, o.reasons.join(" · ")))),
    h("div", { class: "foot" }, "Costs are charged up front. One project per county. Cancellation refunds 50% of the uncompleted fraction. Occupation pauses construction."),
  );
}
