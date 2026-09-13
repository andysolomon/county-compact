import type { AdminId, County, GameState } from "../sim/types";

export function adminShort(state: GameState, id: AdminId | undefined): string {
  if (!id) return "—";
  const a = state.admins[id];
  return a ? a.name.replace(" Administration", "") : id;
}

export function isPlayerCounty(state: GameState, county: County): boolean {
  return county.ownerAdminId === state.playerAdminId;
}

export interface AuthorityBadge { text: string; color?: string; kind?: "alert" | "amber" }

export function authorityBadges(state: GameState, county: County): AuthorityBadge[] {
  const out: AuthorityBadge[] = [];
  const owner = state.admins[county.ownerAdminId];
  const you = county.ownerAdminId === state.playerAdminId;
  out.push({ text: `Owner · ${adminShort(state, county.ownerAdminId)}${you ? " (you)" : ""}` });
  if (owner?.coalitionId) {
    const c = state.coalitions[owner.coalitionId];
    if (c) out.push({ text: `${c.name.replace(" Coalition", "").replace(" Association", "").replace(" Compact", "").replace(" League", "").replace(" Accord", "")} · ${c.chairAdminId === owner.id ? "chair" : "member"}`, color: c.color });
  } else out.push({ text: "Independent administration" });
  if (county.occupierAdminId) out.push({ text: `Occupied · ${adminShort(state, county.occupierAdminId)}`, kind: "alert" });
  return out;
}

export function governsNote(state: GameState, county: County): string | undefined {
  if (county.ownerAdminId === state.playerAdminId) return undefined;
  return `${adminShort(state, county.ownerAdminId)} governs this county. You can inspect it and open diplomacy, but not allocate its workforce or budget.`;
}
