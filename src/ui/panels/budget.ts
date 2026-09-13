import { formatDate, formatMonth } from "../../sim/calendar";
import { forecastBudget } from "../../sim/economy";
import { PROJECTS } from "../../sim/rules";
import type { GameState } from "../../sim/types";
import { fmt, h, signed } from "../dom";
import type { Store } from "../store";

export function renderBudget(store: Store, state: GameState): HTMLElement {
  const adm = state.admins[state.playerAdminId]!;
  const f = forecastBudget(state, adm.id);
  const last = adm.lastSettlement;
  const temp: string[] = [];
  for (const id of adm.counties) {
    const c = state.counties[id]!;
    if (c.project) {
      const def = PROJECTS.find((p) => p.id === c.project?.kind)!;
      const upkeep = c.project.kind === "transport" || c.project.kind === "power" || c.project.kind === "office" ? 1 : 0;
      temp.push(`${c.name}: ${def.label} completes ${formatDate(c.project.completeDay)}${upkeep ? ` · upkeep +${upkeep} C from completion` : ""} · returns ${c.project.reservedW} W`);
    }
    if (c.bell?.state === "construction") temp.push(`${c.name}: Bell liaison 1 W reserved until construction completes`);
  }
  if (adm.revenueEffort !== "standard") temp.push(`Revenue effort ${adm.revenueEffort}`);
  const lines = (arr: typeof f.revenue) => arr.map((l) => [h("span", null, l.label), h("span", { class: "right" }, fmt(l.amount))]).flat();
  return h("div", { class: "stack", style: "gap:0" },
    h("div", { class: "head between" }, h("div", null, h("div", { class: "caps" }, "Budget"), h("h2", { style: "font-size:20px" }, adm.name)), h("button", { class: "link small", onclick: () => store.setDrawer("details") }, "Details")),
    h("div", { class: "section" }, h("div", { class: "caps" }, "Actual · last month"),
      last ? h("div", { class: "kv", style: "margin-top:4px" }, h("span", null, formatMonth(last.day)), h("span", { class: "right strong" }, `${signed(last.net)} C`), h("span", null, `Revenue ${fmt(last.revenue)} · expenditure ${fmt(last.expenditure)} · materials +${fmt(last.materials)}`), h("span", { class: "right" }, `→ ${fmt(last.treasuryAfter)} C`))
        : h("div", { class: "small muted", style: "margin-top:4px" }, "No month has settled yet.")),
    h("div", { class: "section" }, h("div", { class: "between" }, h("span", { class: "caps" }, `Forecast · ${formatMonth(state.day)} month end`), h("span", { class: "strong", style: "font-size:16px" }, `${signed(f.net)} C`)),
      h("div", { class: "caps", style: "margin-top:8px;color:var(--ink)" }, "Revenue"), h("div", { class: "kv" }, ...lines(f.revenue), h("span", { class: "strong" }, "Total"), h("span", { class: "right strong" }, fmt(f.revenueTotal))),
      h("div", { class: "caps", style: "margin-top:8px;color:var(--ink)" }, "Expenditure"), h("div", { class: "kv" }, ...lines(f.expenditure), h("span", { class: "strong" }, "Total"), h("span", { class: "right strong" }, fmt(f.expenditureTotal))),
      h("div", { class: "kv", style: "margin-top:8px" },
        h("span", null, "Essential spending per month"), h("span", { class: "right" }, fmt(f.essentialMonthly)),
        h("span", null, "Reserve in essential months"), h("span", { class: `right ${adm.treasury < f.essentialMonthly * 3 ? "alert-text" : ""}` }, f.essentialMonthly ? (adm.treasury / f.essentialMonthly).toFixed(1) : "—"),
        h("span", null, "Materials · industry + civilian allotment"), h("span", { class: "right" }, `+${fmt(f.materialsIndustry)} + ${fmt(f.materialsAllotment)} = +${fmt(f.materialsNet)} M`),
        h("span", null, "Administrative load / capacity"), h("span", { class: `right ${f.load > f.capacity ? "alert-text" : ""}` }, `${f.load} / ${f.capacity}${f.overloadPenalty ? ` · −${Math.round(f.overloadPenalty * 100)}% revenue` : ""}`),
        adm.arrears > 0 ? h("span", { class: "alert-text" }, "Arrears · no new projects or recruitment") : null, adm.arrears > 0 ? h("span", { class: "right alert-text" }, fmt(adm.arrears)) : null)),
    h("div", { class: "section" }, h("div", { class: "caps" }, "Temporary effects and completions"),
      temp.length ? h("div", { class: "stack small", style: "margin-top:4px;gap:3px" }, ...temp.map((t) => h("span", null, t))) : h("div", { class: "small muted", style: "margin-top:4px" }, "None scheduled.")),
    h("div", { class: "section small muted" }, `Materials market: buy at 3 C/M, up to 6 M per month with an outside route and Standing ≥ 40. Emergency notes: 50 C, 1 C monthly interest, 18-month maturity. Both are authored in a later increment.`),
  );
}
