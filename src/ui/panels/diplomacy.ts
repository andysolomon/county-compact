import { neighborsOf } from "../../data/geometry";
import { formatDate } from "../../sim/calendar";
import { acceptanceForecast, areAdjacent, improveRelationsOffer, isAtWar, kindLabel, relationBetween, startImproveRelations, type TreatyKind } from "../../sim/diplomacy";
import { DIPLOMACY } from "../../sim/rules";
import type { County, GameState } from "../../sim/types";
import { fmt, h, signed } from "../dom";
import { adminShort } from "../labels";
import type { Store } from "../store";

export function renderDiplomacy(store: Store, state: GameState, county: County): HTMLElement {
  const me = state.admins[state.playerAdminId]!;
  const target = state.admins[county.ownerAdminId]!;
  if (target.id === me.id) {
    const adjacent = new Set<string>();
    for (const id of me.counties) for (const n of neighborsOf(id)) { const o = state.counties[n]?.ownerAdminId; if (o && o !== me.id) adjacent.add(o); }
    return h("div", { class: "stack", style: "gap:0" },
      h("div", { class: "head" }, h("div", { class: "caps" }, "Diplomacy"), h("h2", { style: "font-size:20px" }, "Select a counterpart")),
      h("div", { class: "section small muted" }, "Select a county governed by another administration to see relations, trust, and what it would accept."),
      h("div", { class: "section" }, h("div", { class: "caps" }, "Adjacent administrations"), h("div", { class: "stack", style: "margin-top:6px;gap:4px" },
        ...[...adjacent].map((a) => state.admins[a]!).sort((x, y) => x.name.localeCompare(y.name)).map((a) => {
          const r = relationBetween(state, me.id, a.id);
          return h("button", { class: "list-row", style: "padding:6px 0;grid-template-columns:1fr auto", onclick: () => store.selectCounty(a.seatCountyId) }, h("span", { class: "strong" }, adminShort(state, a.id)), h("span", { class: "small muted" }, `R ${signed(r.relations)} · Q ${r.trust}`));
        }))),
      h("div", { class: "section small muted" }, `Diplomatic actions in use: ${me.actions.filter((a) => a.endDay > state.day).length} of ${DIPLOMACY.actionSlots}.`));
  }
  const rel = relationBetween(state, me.id, target.id);
  const offer = improveRelationsOffer(state, me.id, target.id);
  const active = me.actions.filter((a) => a.endDay > state.day);
  const truce = me.truces[target.id];
  const kinds: TreatyKind[] = ["access", "trade", "alliance", "dependency", "integration"];
  const previews = kinds.map((k) => {
    const f = acceptanceForecast(state, me.id, target.id, k, {
      sharedBenefit: k === "trade" || k === "access" ? { value: 10, reason: "useful gain" } : { value: 0, reason: "no gain" },
      securityBenefit: k === "alliance" ? { value: 10, reason: "matched defensive cover" } : { value: 0, reason: "no guarantee" },
      hardGates: [{ label: "not at war", met: !isAtWar(state, me.id, target.id) }],
    });
    return { k, f };
  });
  const coalition = me.coalitionId ? state.coalitions[me.coalitionId] : undefined;
  return h("div", { class: "stack", style: "gap:0" },
    h("div", { class: "head between" }, h("div", null, h("div", { class: "caps" }, "Diplomacy"), h("h2", { style: "font-size:20px" }, target.name)), h("button", { class: "link small", onclick: () => store.setDrawer("details") }, "Details")),
    h("div", { class: "section" },
      h("div", { class: "kv" },
        h("span", null, "Relations R"), h("span", { class: "right strong" }, signed(rel.relations)),
        h("span", null, "Trust Q"), h("span", { class: "right strong" }, String(rel.trust)),
        h("span", null, "Economic influence"), h("span", { class: "right" }, String(rel.influence)),
        h("span", null, "Expansion alarm toward you"), h("span", { class: "right" }, String(rel.alarm)),
        h("span", null, "Adjacent"), h("span", { class: "right" }, areAdjacent(state, me.id, target.id) ? "yes" : "no"),
        h("span", null, "Coalition"), h("span", { class: "right" }, target.coalitionId ? state.coalitions[target.coalitionId]!.name : "independent"),
        truce ? h("span", null, "Truce until") : null, truce ? h("span", { class: "right" }, formatDate(truce)) : null,
        isAtWar(state, me.id, target.id) ? h("span", { class: "alert-text" }, "At war") : null, isAtWar(state, me.id, target.id) ? h("span", { class: "right alert-text" }, "see Peace") : null)),
    h("div", { class: "section" },
      h("div", { class: "between" }, h("span", { class: "strong" }, "Improve relations"), h("span", null, `${offer.cost} C · ${offer.days} days`)),
      h("div", { class: "small muted" }, `+${offer.gain} R on completion · one per pair each 90 days · cap +60 from this action · gained so far ${rel.improveGained ?? 0}`),
      offer.available
        ? h("button", { class: "btn primary", style: "margin-top:6px", onclick: () => { const r = startImproveRelations(state, me.id, target.id); store.toast(r.ok ? "Relations action started." : r.reason); store.notify(); } }, "Start · occupies one action slot")
        : h("div", { class: "small alert-text", style: "margin-top:2px" }, offer.reasons.join(" · "))),
    coalition && !target.coalitionId ? h("div", { class: "section" },
      h("div", { class: "between" }, h("span", { class: "strong" }, "Propose coalition membership"), h("span", { class: "small muted" }, coalition.name)),
      h("div", { class: "small muted" }, "Opens the coalition motion with this administration as applicant. Requires applicant consent and a member vote."),
      h("button", { class: "btn", style: "margin-top:6px", onclick: () => { store.ui.coalitionApplicant = target.id; store.setDrawer("coalition"); } }, "Draft admission motion")) : null,
    h("div", { class: "section" },
      h("div", { class: "caps" }, "Acceptance previews · what this administration would accept"),
      h("div", { class: "small muted", style: "margin:2px 0 6px" }, "Score = 0.4R + 0.3Q + shared benefit + security benefit − autonomy cost − threat penalty. Ordinary threshold 25; dependency and integration 35."),
      h("div", { class: "kv" }, ...previews.flatMap(({ k, f }) => [h("span", null, `${kindLabel(k)} · autonomy cost ${DIPLOMACY.autonomyCost[k]}`), h("span", { class: `right ${f.likely ? "ok-text" : "muted"}` }, `${fmt(f.score)} / ${f.threshold} · ${f.likely ? "likely" : "unlikely"}`)])),
      h("div", { class: "small muted", style: "margin-top:6px" }, "Treaty proposals beyond membership motions and relations are authored in a later increment; the terms above use the live state.")),
    h("div", { class: "section small muted" }, `Your diplomatic actions: ${active.length} of ${DIPLOMACY.actionSlots} in use${active.length ? ` · ${active.map((a) => `${a.kind === "improve-relations" ? "relations" : "motion"} with ${adminShort(state, a.targetAdminId)} until ${formatDate(a.endDay)}`).join("; ")}` : ""}.`),
  );
}
