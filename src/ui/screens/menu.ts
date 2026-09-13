import { loadLocal } from "../../sim/save";
import { buildCobbScenario } from "../../sim/scenario";
import { buildBartowSettlementTraining } from "../../sim/training";
import { formatDate } from "../../sim/calendar";
import { clear, h } from "../dom";
import { createMap } from "../map";
import type { Store } from "../store";

export interface ScreenView { el: HTMLElement; render(): void; mounted(): void }

export function createMenuScreen(store: Store): ScreenView {
  const el = h("div", { class: "screen menu" });
  const map = createMap({ interactive: false, padding: { top: 30, right: 30, bottom: 30, left: 420 } });
  map.el.classList.add("map-bg");
  const content = h("div", { class: "content" });
  el.append(map.el, h("div", { class: "wash" }), content);
  const preview = buildCobbScenario();

  function render(): void {
    clear(content);
    const save = loadLocal();
    const items: HTMLElement[] = [];
    if (save?.ok) {
      const st = save.state;
      items.push(h("button", { class: "menu-item primary", onclick: () => store.startCampaign(st) },
        h("span", { class: "t" }, "Continue"), h("span", { class: "d" }, `${st.admins[st.playerAdminId]?.name.replace(" Administration", "")} · ${formatDate(st.day)} · autosave`)));
    } else if (save && !save.ok) {
      items.push(h("div", { class: "notice" }, h("span", { class: "mark" }), h("span", null, h("strong", null, "Saved campaign cannot be loaded. "), save.reason, ". Start a new campaign; the save is left untouched.")));
    }
    items.push(h("button", { class: "menu-item", onclick: () => store.startCampaign(buildCobbScenario("Cobb")) }, h("span", { class: "t" }, "Cobb County campaign"), h("span", { class: "d" }, "Flagship · 1 Feb 1942")));
    items.push(h("button", { class: "menu-item", onclick: () => { store.ui.selectStartCounty = store.ui.selectStartCounty ?? preview.admins[preview.playerAdminId]!.seatCountyId; store.ui.selectedCountyId = store.ui.selectStartCounty; store.setScreen("select"); } }, h("span", { class: "t" }, "Any-county campaign"), h("span", { class: "d" }, "159 starts")));
    items.push(h("button", { class: "menu-item", onclick: () => store.startCampaign(buildBartowSettlementTraining()) }, h("span", { class: "t" }, "Peace-settlement training"), h("span", { class: "d" }, "Optional · Sept 1944 · no campaign effects")));
    items.push(h("button", { class: "menu-item", onclick: () => { store.ui.reducedMotion = !store.ui.reducedMotion; store.toast(`Reduced motion ${store.ui.reducedMotion ? "on" : "off"}`); } }, h("span", { class: "t" }, "Settings"), h("span", { class: "d" }, `Reduced motion · ${store.ui.reducedMotion ? "on" : "off"} · keyboard: Space pause, 1/2/3 speed, Esc back`)));

    content.append(
      h("div", null,
        h("div", { class: "caps" }, "A game of regional administration"),
        h("h1", null, "County Compact"),
        h("div", { class: "sub" }, "Georgia, 1942"),
        h("div", { class: "menu-list" }, ...items)),
      h("div", null,
        h("div", { class: "notice", style: "max-width:420px" }, h("span", { class: "mark" }), h("span", null, h("strong", null, "Scenario fiction. "), "This campaign uses an invented Georgia Emergency Compact. County wars and regional governments did not occur. Historical background is labeled and sourced throughout.")),
        h("div", { class: "small muted", style: "margin-top:14px" }, "Design v1.0 · ruleset 0.1.0 · Saves stored locally · Continue appears only when a local save exists")),
    );
    map.update(preview, undefined, "coalitions");
  }

  return { el, render, mounted: () => { map.resize(); map.fitState(); } };
}
