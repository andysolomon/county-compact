import { GEOMETRY, neighborsOf } from "../../data/geometry";
import { formatDate } from "../../sim/calendar";
import { availableW, forecastBudget } from "../../sim/economy";
import { militaryPower, strongestAdjacentThreat } from "../../sim/diplomacy";
import { buildCobbScenario } from "../../sim/scenario";
import type { County, GameState } from "../../sim/types";
import { clear, fmt, h } from "../dom";
import { adminShort } from "../labels";
import { createMap } from "../map";
import type { Store } from "../store";
import type { ScreenView } from "./menu";

interface Difficulty { label: string; factors: { label: string; value: string; good: boolean }[] }

function difficulty(state: GameState, county: County): Difficulty {
  const adm = state.admins[county.ownerAdminId]!;
  const f = forecastBudget(state, adm.id);
  const coverage = f.essentialMonthly > 0 ? f.revenueTotal / f.essentialMonthly : 0;
  const threat = strongestAdjacentThreat(state, adm.id, adm.coalitionId);
  const own = militaryPower(state, adm.id);
  const factors = [
    { label: "Income coverage of essentials", value: `${coverage.toFixed(2)}× · net +${fmt(f.net)} C`, good: coverage >= 1.4 },
    { label: "Strongest adjacent force", value: threat === 0 ? "none" : `${fmt(threat)} vs yours ${fmt(own)}`, good: threat <= own },
    { label: "Transport level", value: String(county.stats.transport), good: county.stats.transport >= 1 },
    { label: "Coalition security", value: adm.coalitionId ? state.coalitions[adm.coalitionId]!.name : "none · independent", good: Boolean(adm.coalitionId) },
  ];
  const score = factors.filter((x) => x.good).length;
  const label = score >= 4 ? "Balanced" : score === 3 ? "Moderate" : score === 2 ? "Moderate-hard" : "Hard";
  return { label, factors };
}

function objectives(state: GameState, county: County): string[] {
  if (county.name === "Cobb") return [
    "Keep three months of recurring expenditure in reserve while preparing Cobb's industrial application.",
    "Fund the access works required for Bell and adopt a workforce services plan.",
    "Sign one useful agreement with a neighboring administration and understand its limits.",
  ];
  const f = forecastBudget(state, county.ownerAdminId);
  return [
    `Keep three months of essentials (${fmt(f.essentialMonthly * 3)} C) in reserve while funding one improvement.`,
    county.stats.transport < 2 ? "Raise transport to level 2 so industry and supply can grow." : "Staff a productive slot and plan a workshop or housing.",
    "Sign one useful agreement with a neighboring administration and understand its limits.",
  ];
}

export function createSelectScreen(store: Store): ScreenView {
  const preview = buildCobbScenario();
  const el = h("div", { class: "screen select-shell" });
  const top = h("div", { class: "topbar" });
  const left = h("div", { class: "select-left" });
  const map = createMap({ interactive: true, showBrackets: true, onSelect: (id) => store.selectCounty(id) });
  const right = h("div", { class: "select-right" });
  const foot = h("div", { class: "select-foot" });
  el.append(top, left, map.el, right, foot);
  let query = "";
  let affiliation = "all";
  let diff = "all";
  const search = h("input", { type: "search", placeholder: "Search 159 counties or seats", "aria-label": "Search counties", oninput: (e: Event) => { query = (e.target as HTMLInputElement).value; renderList(); } });
  const results = h("div", { class: "results", role: "listbox", "aria-label": "Counties" });
  const affSel = h("select", { "aria-label": "Affiliation filter", onchange: (e: Event) => { affiliation = (e.target as HTMLSelectElement).value; renderList(); } },
    h("option", { value: "all" }, "Affiliation · All"), h("option", { value: "member" }, "Coalition members"), h("option", { value: "independent" }, "Independent"));
  const diffSel = h("select", { "aria-label": "Difficulty filter", onchange: (e: Event) => { diff = (e.target as HTMLSelectElement).value; renderList(); } },
    h("option", { value: "all" }, "Difficulty · All"), ...["Balanced", "Moderate", "Moderate-hard", "Hard"].map((d) => h("option", { value: d }, d)));
  left.append(h("div", { class: "section stack" }, h("div", { class: "search" }, h("span", { class: "dot", style: "border:1.5px solid var(--ink);width:10px;height:10px;background:none" }), search), h("div", { class: "filters" }, affSel, diffSel)), results);
  const diffCache = new Map<string, Difficulty>();
  const diffOf = (c: County) => { let d = diffCache.get(c.id); if (!d) { d = difficulty(preview, c); diffCache.set(c.id, d); } return d; };
  const RECOMMENDED = ["Cobb", "Fulton", "Chatham", "Muscogee", "Dougherty", "Rabun"];

  function renderList(): void {
    clear(results);
    const q = query.trim().toLowerCase();
    const rows = GEOMETRY.map((g) => preview.counties[g.id]!).filter((c) => {
      if (q && !c.name.toLowerCase().includes(q) && !c.seat.toLowerCase().includes(q)) return false;
      const adm = preview.admins[c.ownerAdminId]!;
      if (affiliation === "member" && !adm.coalitionId) return false;
      if (affiliation === "independent" && adm.coalitionId) return false;
      if (diff !== "all" && diffOf(c).label !== diff) return false;
      return true;
    });
    const rec = rows.filter((c) => RECOMMENDED.includes(c.name)).sort((a, b) => RECOMMENDED.indexOf(a.name) - RECOMMENDED.indexOf(b.name));
    const rest = rows.filter((c) => !RECOMMENDED.includes(c.name)).sort((a, b) => a.name.localeCompare(b.name));
    if (rec.length) results.appendChild(h("div", { class: "caps", style: "padding:6px 14px 4px" }, "Recommended starts · authored openings"));
    for (const c of rec) results.appendChild(row(c));
    if (rest.length) results.appendChild(h("div", { class: "caps", style: "padding:8px 14px 4px" }, `All counties · ${rest.length}`));
    for (const c of rest) results.appendChild(row(c));
  }

  function row(c: County): HTMLElement {
    const adm = preview.admins[c.ownerAdminId]!;
    const coal = adm.coalitionId ? preview.coalitions[adm.coalitionId] : undefined;
    const selected = store.ui.selectedCountyId === c.id;
    return h("button", { class: "list-row", role: "option", "aria-selected": String(selected), "data-id": c.id, onclick: () => { store.selectCounty(c.id); map.centerOn(c.id); },
      onkeydown: (e: KeyboardEvent) => { if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); const sib = (e.key === "ArrowDown" ? (e.currentTarget as HTMLElement).nextElementSibling : (e.currentTarget as HTMLElement).previousElementSibling) as HTMLElement | null; const target = sib?.classList.contains("list-row") ? sib : (e.key === "ArrowDown" ? sib?.nextElementSibling : sib?.previousElementSibling) as HTMLElement | null; target?.focus(); } } },
      h("span", { class: "dot", style: `background:${coal ? coal.color : "transparent"};border:1px solid var(--rule-strong)` }),
      h("span", { class: "strong" }, c.name), h("span", { class: "small muted" }, diffOf(c).label),
      h("span", { class: "sub" }, `${c.seat} · ${coal ? (coal.chairAdminId === adm.id ? `${coal.name} chair` : coal.name) : "Independent"}`));
  }

  function renderRight(): void {
    clear(right);
    const id = store.ui.selectedCountyId;
    const c = id ? preview.counties[id] : undefined;
    if (!c) { right.appendChild(h("div", { class: "section muted" }, "Select a county on the map or in the list.")); return; }
    const adm = preview.admins[c.ownerAdminId]!;
    const coal = adm.coalitionId ? preview.coalitions[adm.coalitionId] : undefined;
    const d = diffOf(c);
    const f = forecastBudget(preview, adm.id);
    const neighbors = neighborsOf(c.id).map((n) => preview.counties[n]!.name).sort().join(", ");
    right.append(
      h("div", { class: "section" },
        h("h2", null, `${c.name} County`), h("div", { class: "small muted" }, `${c.seat} · county seat`),
        h("div", { class: "row", style: "flex-wrap:wrap;margin-top:10px;gap:6px" },
          h("span", { class: "badge" }, `Direct control · ${c.name} only`),
          coal ? h("span", { class: "badge" }, h("span", { class: "dot", style: `background:${coal.color}` }), `${coal.name} · ${coal.chairAdminId === adm.id ? "chair" : "member"}`) : h("span", { class: "badge soft" }, "Independent administration")),
        c.tier === "estimated" ? h("div", { class: "small muted", style: "margin-top:8px" }, "Baseline statistics are explicit design estimates pending research (issue #4); seat name pending historical verification.") : h("div", { class: "small muted", style: "margin-top:8px" }, "Authored flagship opening (GDD §4.1).")),
      h("div", { class: "section" }, h("div", { class: "caps" }, "Economy and workforce"),
        h("div", { class: "kv", style: "margin-top:6px" },
          h("span", null, "Treasury / materials"), h("span", { class: "right strong" }, `${adm.treasury} C / ${adm.materials} M`),
          h("span", null, "Workforce · available"), h("span", { class: "right strong" }, `${c.stats.workforce} W · ${availableW(c)} free`),
          h("span", null, "Agriculture / industry / commerce"), h("span", { class: "right strong" }, `${c.stats.agriculture} / ${c.stats.industry} / ${c.stats.commerce}`),
          h("span", null, "Transport / power / services"), h("span", { class: "right strong" }, `${c.stats.transport} / ${c.stats.power} / ${c.stats.services}`),
          h("span", null, "Monthly surplus"), h("span", { class: "right strong" }, `+${fmt(f.net)} C`),
          h("span", null, "Terrain"), h("span", { class: "right" }, c.terrain))),
      h("div", { class: "section" }, h("div", { class: "caps" }, `Difficulty · ${d.label} · advisory`),
        h("div", { class: "kv", style: "margin-top:6px" }, ...d.factors.flatMap((x) => [h("span", null, x.label), h("span", { class: `right ${x.good ? "" : "alert-text"}` }, x.value)]))),
      h("div", { class: "section" }, h("div", { class: "caps" }, "Adjacent administrations"), h("div", { class: "small", style: "margin-top:4px" }, neighbors)),
      h("div", { class: "section" }, h("div", { class: "caps" }, "Three opening objectives"),
        h("div", { class: "stack", style: "margin-top:6px" }, ...objectives(preview, c).map((o, i) => h("div", { class: "obj" }, h("b", null, String(i + 1)), h("span", null, o))))),
    );
  }

  let ambition: GameState["ambition"] = "regional-union";
  function renderFoot(): void {
    clear(foot);
    const id = store.ui.selectedCountyId;
    const c = id ? preview.counties[id] : undefined;
    foot.append(
      h("span", null, h("span", { class: "muted" }, "Start date "), h("b", null, formatDate(preview.day))),
      h("label", { class: "row" }, h("span", { class: "muted" }, "Ambition"), h("select", { onchange: (e: Event) => { ambition = (e.target as HTMLSelectElement).value as GameState["ambition"]; } },
        h("option", { value: "regional-union", selected: ambition === "regional-union" }, "Regional Union · 20 integrated counties"),
        h("option", { value: "commonwealth", selected: ambition === "commonwealth" }, "Commonwealth of Counties · chair 35 counties"))),
      h("span", { class: "muted small" }, "Can be changed once before January 1944"),
      h("button", { class: "btn primary large", disabled: !c, onclick: () => { if (!c) return; const st = buildCobbScenario(c.name); st.ambition = ambition; store.startCampaign(st); } }, c ? `Begin campaign · ${c.name}` : "Select a county"),
    );
  }

  function render(): void {
    clear(top);
    top.append(h("span", { class: "title" }, "County Compact"), h("span", { class: "muted" }, "·"), h("span", null, "New campaign"),
      h("button", { class: "btn", style: "margin-left:auto", onclick: () => store.setScreen("menu") }, "Back"));
    renderList();
    renderRight();
    renderFoot();
    const sel = store.ui.selectedCountyId;
    map.update(preview, sel, "control", { neighborsOf: sel, playerAdminId: sel ? preview.counties[sel]?.ownerAdminId : undefined });
    const selRow = results.querySelector(`[data-id="${sel}"]`);
    selRow?.scrollIntoView({ block: "nearest" });
  }

  return { el, render, mounted: () => { map.resize(); map.fitState(); if (store.ui.selectedCountyId) map.centerOn(store.ui.selectedCountyId); }, };
}

export function adminLabel(state: GameState, county: County): string {
  return adminShort(state, county.ownerAdminId);
}
