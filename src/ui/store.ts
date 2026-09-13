import { stepDay } from "../sim/engine";
import { saveLocal } from "../sim/save";
import type { CountyId, GameState } from "../sim/types";

export type Screen = "menu" | "select" | "map";
export type Drawer = "details" | "develop" | "budget" | "diplomacy" | "coalition" | "forces" | "peace";
export type MapMode = "control" | "coalitions" | "economy" | "integration" | "terrain";

export interface UiState {
  screen: Screen;
  selectedCountyId: CountyId | undefined; // the one shared selection
  drawer: Drawer;
  mapMode: MapMode;
  findOpen: boolean;
  toast: string | undefined;
  coalitionApplicant: string | undefined;
  peaceCessions: CountyId[];
  peaceReparations: number;
  selectStartCounty: CountyId | undefined;
  loadError: string | undefined;
  reducedMotion: boolean;
}

type Listener = () => void;

export class Store {
  state: GameState | undefined;
  ui: UiState = {
    screen: "menu", selectedCountyId: undefined, drawer: "details", mapMode: "control", findOpen: false, toast: undefined,
    coalitionApplicant: undefined, peaceCessions: [], peaceReparations: 0, selectStartCounty: undefined, loadError: undefined,
    reducedMotion: typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches,
  };
  private listeners = new Set<Listener>();
  private timer: number | undefined;
  private toastTimer: number | undefined;

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify(): void {
    for (const fn of this.listeners) fn();
  }

  /** Mutate game + ui state through one entry point so every panel re-renders from the same selection. */
  update(fn: (state: GameState | undefined, ui: UiState) => void): void {
    fn(this.state, this.ui);
    this.notify();
  }

  selectCounty(id: CountyId | undefined): void {
    this.update((_, ui) => {
      ui.selectedCountyId = id;
      if (ui.screen === "select") ui.selectStartCounty = id;
      // Administration-level drawers are not about a county; return to the county details on a new selection.
      if (ui.drawer === "budget" || ui.drawer === "forces") ui.drawer = "details";
    });
  }

  setScreen(screen: Screen): void {
    this.update((_, ui) => { ui.screen = screen; ui.findOpen = false; });
  }

  setDrawer(drawer: Drawer): void {
    this.update((_, ui) => { ui.drawer = ui.drawer === drawer && drawer !== "details" ? "details" : drawer; });
  }

  setMapMode(mode: MapMode): void {
    this.update((_, ui) => { ui.mapMode = mode; });
  }

  toast(message: string): void {
    this.ui.toast = message;
    this.notify();
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => { this.ui.toast = undefined; this.notify(); }, 4000);
  }

  startCampaign(state: GameState): void {
    this.stop();
    this.state = state;
    this.ui.selectedCountyId = state.admins[state.playerAdminId]?.seatCountyId;
    this.ui.drawer = state.scenario === "training-bartow-1944" ? "peace" : "details";
    this.ui.screen = "map";
    this.ui.peaceCessions = [];
    this.ui.peaceReparations = 0;
    this.ui.coalitionApplicant = undefined;
    this.notify();
  }

  advanceDays(n: number): void {
    const s = this.state;
    if (!s) return;
    for (let i = 0; i < n; i++) {
      const r = stepDay(s);
      if (r.monthEnd && s.scenario === "cobb-1942") saveLocal(s);
      if (r.shouldPause) break;
    }
    this.notify();
  }

  advanceToMonthEnd(): void {
    const s = this.state;
    if (!s) return;
    for (let i = 0; i < 31; i++) {
      const r = stepDay(s);
      if (r.monthEnd && s.scenario === "cobb-1942") saveLocal(s);
      if (r.shouldPause || r.monthEnd) break;
    }
    this.notify();
  }

  setPaused(paused: boolean): void {
    const s = this.state;
    if (!s) return;
    s.paused = paused;
    if (paused) this.stop();
    else this.run();
    this.notify();
  }

  setSpeed(speed: GameState["speed"]): void {
    const s = this.state;
    if (!s) return;
    s.speed = speed;
    if (!s.paused) this.run();
    this.notify();
  }

  private run(): void {
    this.stop();
    const s = this.state;
    if (!s) return;
    this.timer = window.setInterval(() => {
      const state = this.state;
      if (!state || state.paused) { this.stop(); return; }
      const r = stepDay(state);
      if (r.monthEnd && state.scenario === "cobb-1942") saveLocal(state);
      if (state.paused) this.stop();
      this.notify();
    }, 1000 / s.speed);
  }

  private stop(): void {
    if (this.timer !== undefined) { clearInterval(this.timer); this.timer = undefined; }
  }
}

export const store = new Store();
