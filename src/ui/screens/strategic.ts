import { formatDate } from "../../sim/calendar";
import { availableW, forecastBudget } from "../../sim/economy";
import { activeDecisions } from "../../sim/events";
import { clear, fmt, h, signed } from "../dom";
import { createMap, METRO_IDS } from "../map";
import { renderBudget } from "../panels/budget";
import { renderCoalition } from "../panels/coalition";
import { renderDecisionModal } from "../panels/decision";
import { renderDetails } from "../panels/details";
import { renderDevelop } from "../panels/develop";
import { renderDiplomacy } from "../panels/diplomacy";
import { createFind } from "../panels/find";
import { renderForces } from "../panels/forces";
import { renderLegend } from "../panels/legend";
import { renderPeace } from "../panels/peace";
import type { Drawer, MapMode, Store } from "../store";
import type { ScreenView } from "./menu";

const MODES: { id: MapMode; label: string }[] = [
  { id: "control", label: "Control" }, { id: "coalitions", label: "Coalitions" }, { id: "economy", label: "Economy" }, { id: "integration", label: "Integration" }, { id: "terrain", label: "Terrain" },
];

export function createStrategicScreen(store: Store): ScreenView & { escape(): void } {
  const el = h("div", { class: "screen shell" });
  const top = h("div", { class: "topbar" });
  const left = h("div", { class: "left-panel", "aria-live": "polite" });
  const map = createMap({ interactive: true, showBrackets: true, onSelect: (id) => store.selectCounty(id) });
  const controls = h("div", { class: "map-controls" });
  const legendHost = h("div");
  const overlayHost = h("div");
  const find = createFind(store, (id) => { store.selectCounty(id); map.centerOn(id); find.close(); });
  map.el.append(controls, legendHost, find.el, overlayHost);
  const rail = h("div", { class: "rail", role: "toolbar", "aria-label": "Actions" });
  const bottom = h("div", { class: "bottombar" });
  el.append(top, left, map.el, rail, bottom);
  let lastScenario: string | undefined;

  function railButton(id: Drawer, label: string, iconClass: string): HTMLElement {
    return h("button", { "aria-pressed": String(store.ui.drawer === id), onclick: () => store.setDrawer(id) }, h("span", { class: `icon ${iconClass}` }), label);
  }

  function render(): void {
    const state = store.state;
    if (!state) return;
    const ui = store.ui;
    const me = state.admins[state.playerAdminId]!;
    const f = forecastBudget(state, me.id);
    const decisions = activeDecisions(state);
    const homeCounty = state.counties[me.seatCountyId]!;
    let freeW = 0, totalW = 0;
    for (const id of me.counties) { const c = state.counties[id]!; freeW += availableW(c); totalW += c.stats.workforce; }
    const alerts: string[] = [];
    for (const d of decisions) alerts.push(`${d.eventId} decision · ${state.counties[d.countyId]?.name}`);
    if (me.arrears > 0) alerts.push(`Arrears ${fmt(me.arrears)} C`);
    const coal = me.coalitionId ? state.coalitions[me.coalitionId] : undefined;
    if (coal?.motion?.status === "voting") alerts.push("Coalition vote underway");
    if (homeCounty.bell?.state === "candidate" && !homeCounty.bell.reviewDay && state.day < formatDateDay(1942, 2, 19)) alerts.push("Bell review 19 Feb");

    // Top bar
    clear(top);
    top.append(
      h("span", { class: "date" }, formatDate(state.day)),
      h("span", { class: "badge" }, state.paused ? (decisions.length ? "Paused · decision" : "Paused") : "Running"),
      h("button", { class: "btn primary", disabled: decisions.length > 0, onclick: () => store.setPaused(!state.paused) }, state.paused ? "Resume" : "Pause"),
      h("span", { class: "segmented", role: "group", "aria-label": "Speed, days per second" }, ...([1, 4, 12] as const).map((sp) => h("button", { "aria-pressed": String(state.speed === sp), onclick: () => store.setSpeed(sp) }, String(sp)))),
      h("button", { class: "btn", disabled: decisions.length > 0, title: "Advance one day", onclick: () => store.advanceDays(1) }, "+1 day"),
      h("button", { class: "btn", disabled: decisions.length > 0, title: "Advance to the next month end or pause", onclick: () => store.advanceToMonthEnd() }, "→ Month end"),
      h("div", { class: "stats" },
        stat(`${fmt(me.treasury)} C`, `${signed(f.net)} / mo`, me.treasury < f.essentialMonthly * 3),
        stat(`${fmt(me.materials)} M`, `+${fmt(f.materialsNet)} / mo`),
        stat(`${fmt(freeW)} W`, `available of ${fmt(totalW)}`),
        stat(String(homeCounty.stats.support), "Support"),
        stat(`${f.load} / ${f.capacity}`, "Admin load", f.load > f.capacity),
        stat(String(me.standing), "Standing", me.standing < 40),
        stat(String(me.exhaustion), "Exhaustion", me.exhaustion >= 40)),
      h("button", { class: "btn", style: alerts.length ? "" : "opacity:.6", title: alerts.join("\n") || "No alerts", "aria-label": alerts.length ? `${alerts.length} alerts: ${alerts.join("; ")}` : "No alerts", onclick: () => { if (decisions.length) return; store.setDrawer("budget"); } }, h("span", { class: "dot", style: `background:${alerts.length ? "var(--amber)" : "var(--rule)"}` }), alerts.length ? `${alerts.length} alert${alerts.length > 1 ? "s" : ""}` : "None"),
      h("button", { class: "btn", onclick: () => { store.setPaused(true); store.setScreen("menu"); } }, "Menu"),
    );

    // Left panel
    clear(left);
    const county = ui.selectedCountyId ? state.counties[ui.selectedCountyId] : undefined;
    if (!county) left.appendChild(h("div", { class: "section muted" }, "Select a county."));
    else if (ui.drawer === "develop") left.appendChild(renderDevelop(store, state, county));
    else if (ui.drawer === "budget") left.appendChild(renderBudget(store, state));
    else if (ui.drawer === "diplomacy") left.appendChild(renderDiplomacy(store, state, county));
    else if (ui.drawer === "forces") left.appendChild(renderForces(store, state));
    else left.appendChild(renderDetails(store, state, county));

    // Map
    map.update(state, ui.selectedCountyId, ui.mapMode);
    clear(controls);
    controls.append(
      h("button", { class: "btn", onclick: () => map.fitState() }, "Georgia overview"),
      h("button", { class: "btn primary", onclick: () => { store.selectCounty(me.seatCountyId); map.fitTo(state.scenario === "training-bartow-1944" ? [...me.counties, ...state.occupations.map((o) => o.countyId)] : METRO_IDS, 12); } }, `Return to ${homeCounty.name}`),
      h("button", { class: "btn", "aria-expanded": String(find.isOpen()), onclick: () => (find.isOpen() ? find.close() : find.open()) }, "Find county"));
    clear(legendHost);
    legendHost.appendChild(renderLegend(state, ui.mapMode));
    clear(overlayHost);
    if (ui.drawer === "coalition") overlayHost.appendChild(renderCoalition(store, state));
    if (ui.drawer === "peace") overlayHost.appendChild(renderPeace(store, state));
    const d0 = decisions[0];
    if (d0) overlayHost.appendChild(renderDecisionModal(store, state, d0, (id) => { store.selectCounty(id); map.centerOn(id); }));

    // Rail
    clear(rail);
    rail.append(railButton("develop", "Develop", ""), railButton("diplomacy", "Diplomacy", "round"), railButton("coalition", "Coalition", "dashed"), railButton("forces", "Forces", "wide"), railButton("peace", "Peace", "wide"), railButton("budget", "Budget", ""));

    // Bottom bar
    clear(bottom);
    const recent = [...state.log].slice(-2);
    bottom.append(
      h("div", { class: "modes", role: "tablist", "aria-label": "Map modes" }, ...MODES.map((m) => h("button", { role: "tab", "aria-pressed": String(ui.mapMode === m.id), onclick: () => store.setMapMode(m.id) }, m.label))),
      h("div", { class: "log", "aria-live": "polite" }, ...recent.map((l) => h("span", { class: l.kind === "alert" ? "alert" : "" }, h("b", null, formatDate(l.day).replace(/ \d{4}$/, "")), ` · ${l.text}`))),
    );

    if (lastScenario !== state.scenario + state.playerAdminId) {
      lastScenario = state.scenario + state.playerAdminId;
      map.resize();
      map.fitState();
      map.fitTo(state.scenario === "training-bartow-1944" ? [...me.counties, ...state.occupations.map((o) => o.countyId)] : METRO_IDS, 12);
    }
  }

  function stat(v: string, l: string, alert = false): HTMLElement {
    return h("div", { class: `stat${alert ? " alert-stat" : ""}` }, h("span", { class: "v" }, v), h("span", { class: "l" }, l));
  }

  return {
    el, render,
    mounted: () => { map.resize(); },
    escape: () => { if (find.isOpen()) find.close(); else if (store.ui.drawer !== "details") store.setDrawer("details"); },
  };
}

function formatDateDay(y: number, m: number, d: number): number {
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(1942, 0, 1)) / 86_400_000);
}
