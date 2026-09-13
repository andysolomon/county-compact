import { GEOMETRY } from "../../data/geometry";
import type { GameState } from "../../sim/types";
import { clear, h } from "../dom";
import { adminShort } from "../labels";
import type { Store } from "../store";

export function createFind(store: Store, onPick: (id: string) => void): { el: HTMLElement; open(): void; close(): void; isOpen(): boolean } {
  const el = h("div", { class: "find", hidden: true, role: "dialog", "aria-label": "Find county" });
  const input = h("input", { type: "search", placeholder: "County or seat", "aria-label": "Find county" });
  const results = h("div", { class: "results", role: "listbox" });
  el.append(h("div", { class: "section" }, h("div", { class: "search" }, input)), results);
  input.addEventListener("input", renderList);
  input.addEventListener("keydown", (e) => { if (e.key === "ArrowDown") { e.preventDefault(); (results.querySelector("button") as HTMLElement | null)?.focus(); } });

  function renderList(): void {
    clear(results);
    const state = store.state;
    const q = input.value.trim().toLowerCase();
    const rows = GEOMETRY.filter((g) => { const c = state?.counties[g.id]; return !q || g.name.toLowerCase().includes(q) || (c?.seat.toLowerCase().includes(q) ?? false); }).slice(0, 40);
    for (const g of rows) {
      const c = state?.counties[g.id];
      results.appendChild(h("button", { class: "list-row", role: "option", style: "grid-template-columns:1fr auto", onclick: () => onPick(g.id),
        onkeydown: (e: KeyboardEvent) => { if (e.key === "ArrowDown") { e.preventDefault(); ((e.currentTarget as HTMLElement).nextElementSibling as HTMLElement | null)?.focus(); } if (e.key === "ArrowUp") { e.preventDefault(); const p = (e.currentTarget as HTMLElement).previousElementSibling as HTMLElement | null; (p ?? input).focus(); } } },
        h("span", { class: "strong" }, g.name), h("span", { class: "small muted" }, c ? `${c.seat} · ${adminShort(state as GameState, c.ownerAdminId)}` : "")));
    }
  }
  return {
    el,
    open() { el.hidden = false; input.value = ""; renderList(); input.focus(); },
    close() { el.hidden = true; },
    isOpen() { return !el.hidden; },
  };
}
