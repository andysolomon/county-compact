import { RULESET_VERSION } from "./rules";
import type { GameState } from "./types";

const KEY = "county-compact:autosave";

export interface SaveEnvelope {
  schema: 1;
  rulesetVersion: string;
  savedAt: string;
  state: GameState;
}

export function saveLocal(state: GameState): boolean {
  try {
    const env: SaveEnvelope = { schema: 1, rulesetVersion: RULESET_VERSION, savedAt: new Date().toISOString(), state };
    localStorage.setItem(KEY, JSON.stringify(env));
    return true;
  } catch {
    return false;
  }
}

export function loadLocal(): { ok: true; state: GameState; savedAt: string } | { ok: false; reason: string } | undefined {
  let raw: string | null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return undefined;
  }
  if (!raw) return undefined;
  try {
    const env = JSON.parse(raw) as Partial<SaveEnvelope>;
    if (env.schema !== 1 || !env.state) return { ok: false, reason: "Unsupported save schema" };
    if (env.rulesetVersion !== RULESET_VERSION) return { ok: false, reason: `Save uses ruleset ${env.rulesetVersion ?? "?"}; this build is ${RULESET_VERSION}` };
    return { ok: true, state: env.state, savedAt: env.savedAt ?? "" };
  } catch {
    return { ok: false, reason: "Save data is corrupt" };
  }
}

export function clearLocal(): void {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
