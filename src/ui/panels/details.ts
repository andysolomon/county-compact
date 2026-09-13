import { formatDate } from "../../sim/calendar";
import { availableW, bellStateLabel, forecastBudget, requiredServiceW, staffedIndustryCap } from "../../sim/economy";
import { E01_DAY } from "../../sim/events";
import { PROJECTS } from "../../sim/rules";
import { cancelProject, setAllocation } from "../../sim/projects";
import type { County, GameState } from "../../sim/types";
import { fmt, h, signed } from "../dom";
import { adminShort, authorityBadges, governsNote } from "../labels";
import type { Store } from "../store";

function nextObjective(state: GameState, county: County): string | undefined {
  if (county.ownerAdminId !== state.playerAdminId) return undefined;
  const f = forecastBudget(state, state.playerAdminId);
  const adm = state.admins[state.playerAdminId]!;
  if (county.bell) {
    if (county.bell.state === "candidate" && state.day < E01_DAY) return "Fund the access works for Bell before the 19 Feb review.";
    if (county.bell.state === "accepted" && county.stats.transport < 2 && county.project?.kind !== "transport") return "Transport level 2 or a transport project is required by 30 Jun.";
    if (county.bell.state === "construction" && county.stats.workforce > county.stats.services - 2) return "Prepare housing: construction workers will arrive before services can absorb them.";
  }
  if (adm.treasury < f.essentialMonthly * 3) return `Rebuild reserves to three months of essentials (${fmt(f.essentialMonthly * 3)} C).`;
  if (adm.actions.length === 0 && state.scenario === "cobb-1942") return "Sign one useful agreement with a neighboring administration.";
  return undefined;
}

export function renderDetails(store: Store, state: GameState, county: County): HTMLElement {
  const you = county.ownerAdminId === state.playerAdminId;
  const owner = state.admins[county.ownerAdminId]!;
  const f = forecastBudget(state, owner.id);
  const a = county.allocation;
  const W = county.stats.workforce;
  const free = availableW(county);
  const note = governsNote(state, county);
  const obj = nextObjective(state, county);
  const countyRevenue = f.revenue.filter((l) => l.countyId === county.id).reduce((s, l) => s + l.amount, 0);
  const countyExp = f.expenditure.filter((l) => l.countyId === county.id).reduce((s, l) => s + l.amount, 0);
  const projDef = county.project ? PROJECTS.find((p) => p.id === county.project?.kind) : undefined;

  const stepper = (slot: "agriculture" | "industry", cap: number) => {
    const v = a[slot];
    return h("span", { class: "stepper", "aria-label": `${slot} staffing` },
      h("button", { disabled: !you || v <= 0, "aria-label": `Reduce ${slot}`, onclick: () => apply(slot, v - 0.5) }, "−"),
      h("span", null, fmt(v)),
      h("button", { disabled: !you || v >= cap || free < 0.5, "aria-label": `Increase ${slot}`, onclick: () => apply(slot, v + 0.5) }, "+"));
  };
  const apply = (slot: "agriculture" | "industry", v: number) => {
    const r = setAllocation(state, county.id, slot, v);
    if (!r.ok) store.toast(r.reason);
    store.notify();
  };

  return h("div", { class: "stack", style: "gap:0" },
    h("div", { class: "head" },
      h("h2", null, `${county.name} County`),
      h("div", { class: "small muted", style: "margin-top:2px" }, `${county.seat} · county seat · ${county.terrain}`),
      h("div", { class: "row", style: "flex-wrap:wrap;gap:6px;margin-top:10px" }, ...authorityBadges(state, county).map((b) => h("span", { class: `badge${b.kind ? ` ${b.kind}` : ""}` }, b.color ? h("span", { class: "dot", style: `background:${b.color}` }) : null, b.text))),
      note ? h("div", { class: "notice", style: "margin-top:10px" }, h("span", { class: "mark", style: "background:var(--ink-muted)" }), h("span", null, note)) : null,
      obj ? h("div", { class: "card", style: "margin-top:10px;border-color:var(--ink)" }, h("div", { class: "caps" }, "Next objective"), h("div", { class: "small", style: "margin-top:2px;font-size:13px" }, obj)) : null),
    county.bell ? h("div", { class: "section row", style: "align-items:flex-start" },
      h("span", { style: "flex:none;width:16px;height:16px;border:1.5px solid var(--ink);display:grid;place-items:center;font:700 9px var(--font-sans);margin-top:2px" }, "F"),
      h("div", { style: "flex:1" }, h("div", { class: "between" }, h("span", { class: "strong" }, "Bell facility"), h("span", { class: "caps", style: "color:var(--ink)" }, bellStateLabel(county.bell.state))),
        h("div", { class: "small muted", style: "margin-top:2px" }, bellDetail(state, county)))) : null,
    h("div", { class: "section" },
      h("div", { class: "between" }, h("span", { class: "strong" }, "Local budget"), h("span", { class: "strong", style: "font-size:16px" }, `${signed(countyRevenue - countyExp)} C / mo`)),
      h("div", { class: "kv", style: "margin-top:6px" },
        h("span", null, `Revenue · ${f.revenue.filter((l) => l.countyId === county.id && l.amount > 0).map((l) => l.label.replace(`${county.name} · `, "").toLowerCase().replace(" staffed levels", "").replace(" staffed level", "").replace("agriculture · ", "agri ")).join(", ")}`), h("span", { class: "right" }, fmt(countyRevenue)),
        h("span", null, "Expenditure · services, admin, forces, dues, obligations"), h("span", { class: "right" }, fmt(countyExp))),
      you ? h("button", { class: "link small", style: "margin-top:6px", onclick: () => store.setDrawer("budget") }, "Open administration budget and forecast") : null),
    h("div", { class: "section" },
      h("div", { class: "between" }, h("span", { class: "strong" }, "Workforce"), h("span", { class: "strong" }, `${fmt(W)} W`)),
      h("div", { class: "wbar", "aria-hidden": "true" },
        h("span", { class: "agri", style: `flex:${a.agriculture}` }), h("span", { class: "ind", style: `flex:${a.industry}` }), h("span", { class: "svc", style: `flex:${a.services}` }),
        h("span", { class: "sec", style: `flex:${a.security}` }), h("span", { class: "res", style: `flex:${a.project + a.liaison + a.contract}` }), h("span", { class: "free", style: `flex:${Math.max(0, free)}` })),
      h("div", { class: "kv", style: "margin-top:6px;align-items:center" },
        h("span", null, `Agriculture · ${fmt(Math.min(a.agriculture, county.stats.agriculture))} of ${county.stats.agriculture} levels staffed`), you ? stepper("agriculture", county.stats.agriculture) : h("span", { class: "right" }, fmt(a.agriculture)),
        h("span", null, `Industry · ${fmt(a.industry)} of ${county.stats.industry} levels · cap ${staffedIndustryCap(county)} (E+T)`), you ? stepper("industry", staffedIndustryCap(county)) : h("span", { class: "right" }, fmt(a.industry)),
        h("span", null, `Essential services · ${requiredServiceW(county)} required`), h("span", { class: "right" }, fmt(a.services)),
        a.security > 0 ? h("span", null, "Security formations") : null, a.security > 0 ? h("span", { class: "right" }, fmt(a.security)) : null,
        a.project > 0 ? h("span", null, "Construction reserve") : null, a.project > 0 ? h("span", { class: "right" }, fmt(a.project)) : null,
        a.liaison > 0 ? h("span", null, "Bell liaison reserve") : null, a.liaison > 0 ? h("span", { class: "right" }, fmt(a.liaison)) : null,
        a.contract > 0 ? h("span", null, "Federal contract staff") : null, a.contract > 0 ? h("span", { class: "right" }, fmt(a.contract)) : null,
        h("span", { class: "muted" }, "Available"), h("span", { class: `right ${free < 0 ? "alert-text" : "muted"}` }, fmt(free)),
        h("span", { class: "muted" }, `Service capacity H ${county.stats.services}`), h("span", { class: `right ${W > county.stats.services ? "alert-text" : "muted"}` }, W > county.stats.services ? `crowded · −2 support/mo` : "not crowded"))),
    h("div", { class: "section" },
      h("div", { class: "between" }, h("span", { class: "strong" }, "Project slot"), county.project ? h("span", { class: "small" }, `completes ${formatDate(county.project.completeDay)}`) : h("span", { class: "small muted" }, "empty")),
      county.project ? h("div", { class: "small muted", style: "margin-top:2px" }, `${projDef?.label} · ${county.project.reservedW} W reserved · started ${formatDate(county.project.startDay)}`) : null,
      county.project && you ? h("button", { class: "btn small", style: "margin-top:6px", onclick: () => { cancelProject(state, county.id); store.notify(); } }, "Cancel · refunds 50% of the uncompleted fraction") : null,
      !county.project && you ? h("button", { class: "btn", style: "margin-top:6px", onclick: () => store.setDrawer("develop") }, "Develop") : null),
    h("div", { class: "section tight", style: "display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;font-size:12px" },
      meter("Support", county.stats.support), meter("Autonomy", county.stats.autonomy), meter("Integration", county.stats.integration)),
    h("div", { class: "section tight small muted" }, `Administration: ${adminShort(state, county.ownerAdminId)} · load ${f.load} / capacity ${f.capacity}${f.overloadPenalty ? ` · overload −${Math.round(f.overloadPenalty * 100)}% revenue` : ""}`),
  );
}

function meter(label: string, v: number): HTMLElement {
  return h("div", null, h("div", { class: "between" }, h("span", null, label), h("span", { class: "strong" }, String(v))), h("div", { class: "meter" }, h("span", { style: `width:${v}%` })));
}

function bellDetail(state: GameState, county: County): string {
  const b = county.bell!;
  switch (b.state) {
    case "candidate": return b.reviewDay ? `Delay requested; review on ${formatDate(b.reviewDay)}. No production or contract income.` : "Protected federal site. No production or contract income.";
    case "accepted": return `Obligations accepted. Transport level 2 or a transport project required by 30 Jun 1942. Construction commitment opens 2 Apr.`;
    case "construction": { const done = state.day - (b.constructionStartDay ?? state.day); return `Federal construction day ${done} of ${b.constructionDays ?? 395}; main building complete about ${formatDate((b.constructionStartDay ?? state.day) + (b.constructionDays ?? 395))}. 1 W liaison reserved.`; }
    case "ready": return "Main building complete. Production start (E03) is authored in a later increment; no income yet.";
    case "operating": return `Operating · federal contract, ${county.allocation.contract} W reserved.`;
    case "mothballed": return "Federally mothballed after contract cancellation.";
    case "closed": return b.closedReason ?? "Opportunity closed.";
  }
}
