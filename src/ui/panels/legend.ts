import type { GameState } from "../../sim/types";
import { h } from "../dom";
import type { MapMode } from "../store";

export function renderLegend(state: GameState, mode: MapMode): HTMLElement {
  const item = (sw: string, text: string) => h("div", { class: "row" }, h("span", { class: "swatch", style: sw }), text);
  const me = state.admins[state.playerAdminId]!;
  switch (mode) {
    case "coalitions":
      return h("div", { class: "legend" }, h("div", { class: "caps" }, "Coalitions and access"),
        ...Object.values(state.coalitions).map((c) => item(`background:${c.color}`, `${c.name}${me.coalitionId === c.id ? " · yours" : ""}`)),
        item("border:1.5px dashed var(--ink);background:none", "Combined charter boundary · civil access"));
    case "economy":
      return h("div", { class: "legend" }, h("div", { class: "caps" }, "Economy · balancing ranks"), item("background:var(--econ-industry-hi)", "Industry 3+ · materials source"), item("background:var(--econ-industry)", "Industry 1–2"), item("background:var(--econ-agri)", "Agriculture 3+"), item("background:var(--econ-low)", "Low commercial base"), h("div", { class: "small muted" }, "Ranks are scenario estimates, not historical output."));
    case "integration":
      return h("div", { class: "legend" }, h("div", { class: "caps" }, "Unrest and integration"), item("background:var(--integ-full)", "Integrated · N 100"), item("background:var(--integ-partial)", "Counts toward union · N ≥ 70"), item("background:var(--integ-none)", "Integration below 70 · load 3"), item("background:var(--fill-independent)", "Not yours"));
    case "terrain":
      return h("div", { class: "legend" }, h("div", { class: "caps" }, "Terrain · strategic abstraction"), item("background:var(--terrain-mountain)", "Mountain · +4 days, defense ×1.35"), item("background:var(--terrain-piedmont)", "Piedmont · defense ×1.2"), item("background:var(--terrain-coastal)", "Coastal plain · ×1.0"), item("background:var(--terrain-wetland)", "Wetland · +3 days, ×1.15"));
    default:
      return h("div", { class: "legend" }, h("div", { class: "caps" }, "Political control"),
        item("background:var(--fill-player);border:2.5px solid var(--ink)", `Your administration · ${me.name.replace(" Administration", "")}`),
        item("background:var(--fill-independent)", "Independent administration"),
        item("background:var(--fill-member);border:1px dashed var(--ink)", "Member of a coalition · own administration"),
        item("background:repeating-linear-gradient(135deg,rgba(37,42,45,.55) 0 1px,transparent 1px 4px)", "Occupied · owner unchanged, occupier labelled"),
        h("div", { class: "row" }, h("span", { class: "swatch", style: "display:grid;place-items:center;font:700 7px sans-serif;background:var(--paper)" }, "F"), "Protected federal facility"),
        h("div", { class: "row" }, h("span", { class: "swatch", style: "background:var(--paper);border:1.5px solid var(--ink)" }), "Formation · strength bar"));
  }
}
