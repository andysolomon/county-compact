import { formatDate } from "../../sim/calendar";
import { resolveDecision, viewDecision, type DecisionView } from "../../sim/events";
import type { DecisionInstance, GameState } from "../../sim/types";
import { h } from "../dom";
import type { Store } from "../store";

const chosen = new Map<string, "A" | "B">();

export function renderDecisionModal(store: Store, state: GameState, inst: DecisionInstance, locate: (id: string) => void): HTMLElement {
  const view: DecisionView = viewDecision(state, inst);
  const pick = chosen.get(inst.id) ?? (view.options.find((o) => o.id === "A")?.affordable ? "A" : "B");
  const opt = view.options.find((o) => o.id === pick)!;
  return h("div", { class: "scrim", role: "dialog", "aria-modal": "true", "aria-labelledby": "decision-title" },
    h("div", { class: "modal" },
      h("div", { class: "mhead" }, h("span", { class: "badge" }, view.category), h("span", { class: "serif strong", style: "font-size:15px" }, formatDate(inst.firedDay)),
        h("button", { class: "link small", style: "margin-left:auto", onclick: () => locate(view.locateCountyId) }, `Locate ${state.counties[view.locateCountyId]?.name}`)),
      h("div", { class: "mbody" }, h("h2", { id: "decision-title" }, view.title), ...view.narrative.map((p, i) => h("p", { class: i ? "muted" : "" }, p))),
      h("div", { class: "options" }, ...view.options.map((o) => h("button", { class: "option", "aria-pressed": String(o.id === pick), disabled: !o.affordable, onclick: () => { chosen.set(inst.id, o.id); store.notify(); } },
        h("div", { class: "between" }, h("span", { class: "caps" }, `Option ${o.id}${o.id === pick ? " · selected" : ""}${o.isDefault ? " · no-spend default" : ""}`), h("span", { class: "strong" }, o.costLabel)),
        h("h3", null, o.title),
        h("div", { class: "lines" }, ...o.lines.map((l) => h("span", null, l)),
          ...o.prerequisites.map((p) => h("span", { class: p.met ? "" : "alert-text" }, `${p.label}. `, h("strong", null, p.note ?? (p.met ? "Met" : "Not met")))),
          o.shortfall ? h("span", { class: "alert-text strong" }, `${o.shortfall} · explain the shortfall; the affordable option remains available`) : null),
        h("div", { class: "fc kv" }, ...o.forecast.flatMap((f) => [h("span", null, f.label), h("span", { class: "right strong" }, f.value)]))))),
      h("div", { class: "mfoot" },
        h("div", { style: "flex:1" }, h("span", { class: "caps", style: "font-weight:700" }, "Historical note"), h("br"), view.historicalNote, h("br"), h("span", { class: "muted" }, view.source)),
        h("div", { class: "muted", style: "white-space:nowrap" }, `Affected: ${view.affected}`, h("br"), view.windowText),
        h("button", { class: "btn primary large", onclick: () => { const r = resolveDecision(state, inst.id, pick); if (!r.ok) store.toast(r.reason); chosen.delete(inst.id); store.notify(); } }, `Confirm · ${opt.title}`))));
}
