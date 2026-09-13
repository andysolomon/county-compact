// Persistent SVG map of the 159-county board. Rendering never determines
// simulation results; it reads state and the shared selection each update.
import { GEOMETRY, GEOMETRY_BY_ID, countyIdByName, neighborsOf, type CountyGeometry } from "../data/geometry";
import { MAJOR_SETTLEMENTS } from "../data/roster";
import { FORMATIONS } from "../sim/rules";
import type { CountyId, GameState } from "../sim/types";
import { clear, h, s } from "./dom";
import type { MapMode } from "./store";

const LON0 = -83.2;
const LAT0 = 32.7;
const K = 100;
const COS = Math.cos((LAT0 * Math.PI) / 180);

export function project(lon: number, lat: number): [number, number] {
  return [(lon - LON0) * COS * K, -(lat - LAT0) * K];
}

type Pt = readonly [number, number];
const pathCache = new Map<string, string>();

function countyPath(g: CountyGeometry): string {
  const cached = pathCache.get(g.id);
  if (cached) return cached;
  let d = "";
  for (const poly of g.polygons) {
    for (const ring of poly) {
      ring.forEach((p, i) => {
        const [x, y] = project(p[0], p[1]);
        d += `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
      });
      d += "Z";
    }
  }
  pathCache.set(g.id, d);
  return d;
}

const key = (p: Pt) => `${p[0]},${p[1]}`;
const outlineCache = new Map<string, string>();

/** Outer boundary of a group of counties: boundary segments used exactly once within the group, chained into polylines. */
export function groupOutline(ids: readonly CountyId[]): string {
  const ck = [...ids].sort().join("|");
  const cached = outlineCache.get(ck);
  if (cached !== undefined) return cached;
  const segs = new Map<string, { n: number; a: Pt; b: Pt }>();
  for (const id of ids) {
    const g = GEOMETRY_BY_ID.get(id);
    if (!g) continue;
    for (const poly of g.polygons) for (const ring of poly) for (let i = 0; i < ring.length - 1; i++) {
      const a = ring[i]!, b = ring[i + 1]!;
      const ka = key(a), kb = key(b);
      const k = ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
      const e = segs.get(k);
      if (e) e.n++; else segs.set(k, { n: 1, a, b });
    }
  }
  const single = [...segs.values()].filter((v) => v.n === 1);
  const byPoint = new Map<string, number[]>();
  single.forEach((sg, i) => { for (const p of [sg.a, sg.b]) { const k = key(p); const arr = byPoint.get(k) ?? []; arr.push(i); byPoint.set(k, arr); } });
  const used = new Array<boolean>(single.length).fill(false);
  let d = "";
  for (let i = 0; i < single.length; i++) {
    if (used[i]) continue;
    used[i] = true;
    const path: Pt[] = [single[i]!.a, single[i]!.b];
    let extended = true;
    while (extended) {
      extended = false;
      const last = path[path.length - 1]!;
      for (const j of byPoint.get(key(last)) ?? []) {
        if (used[j]) continue;
        const sg = single[j]!;
        path.push(key(sg.a) === key(last) ? sg.b : sg.a);
        used[j] = true;
        extended = true;
        break;
      }
    }
    path.forEach((p, idx) => { const [x, y] = project(p[0], p[1]); d += `${idx === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`; });
  }
  outlineCache.set(ck, d);
  return d;
}

function projectedBBox(ids: readonly CountyId[]): [number, number, number, number] {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const id of ids) {
    const g = GEOMETRY_BY_ID.get(id);
    if (!g) continue;
    const [x0, y0] = project(g.bbox[0], g.bbox[3]);
    const [x1, y1] = project(g.bbox[2], g.bbox[1]);
    minX = Math.min(minX, x0); minY = Math.min(minY, y0); maxX = Math.max(maxX, x1); maxY = Math.max(maxY, y1);
  }
  return [minX, minY, maxX, maxY];
}

const STATE_BBOX = projectedBBox(GEOMETRY.map((g) => g.id));

export interface MapOptions {
  interactive: boolean;
  onSelect?: (id: CountyId) => void;
  showBrackets?: boolean;
  padding?: { top: number; right: number; bottom: number; left: number };
}

export interface MapView {
  el: HTMLElement;
  update(state: GameState | undefined, selected: CountyId | undefined, mode: MapMode, opts?: { neighborsOf?: CountyId | undefined; playerAdminId?: string | undefined }): void;
  fitState(): void;
  fitTo(ids: readonly CountyId[], padding?: number): void;
  centerOn(id: CountyId): void;
  resize(): void;
}

export function createMap(options: MapOptions): MapView {
  const el = h("div", { class: "map-area", role: "img", "aria-label": "Georgia county map. Use Find county for keyboard selection." });
  const svg = s("svg", { "aria-hidden": "true" });
  const defs = s("defs");
  const hatch = s("pattern", { id: "hatch", patternUnits: "userSpaceOnUse", width: 4, height: 4, patternTransform: "rotate(45)" });
  hatch.appendChild(s("line", { x1: 0, y1: 0, x2: 0, y2: 4, stroke: "rgba(37,42,45,.55)", "stroke-width": 1.2 }));
  defs.appendChild(hatch);
  svg.appendChild(defs);
  const bg = s("rect", { x: 0, y: 0, width: "100%", height: "100%", fill: "var(--map-outside)" });
  svg.appendChild(bg);
  const root = s("g");
  const stateShape = s("path", { d: groupOutline(GEOMETRY.map((g) => g.id)), fill: "var(--map-ground)", stroke: "none" });
  const fills = s("g");
  const occupied = s("g");
  const coalitionLines = s("g");
  const neighborLines = s("g");
  const adminLines = s("g");
  const selectedLines = s("g");
  const labels = s("g");
  const markers = s("g");
  root.append(stateShape, fills, occupied, coalitionLines, neighborLines, adminLines, selectedLines, labels, markers);
  svg.appendChild(root);
  el.appendChild(svg);
  const brackets = h("div", { class: "brackets", hidden: true }, h("span", { class: "tl" }), h("span", { class: "tr" }), h("span", { class: "bl" }), h("span", { class: "br" }));
  el.appendChild(brackets);

  const paths = new Map<CountyId, SVGPathElement>();
  for (const g of GEOMETRY) {
    const p = s("path", { d: countyPath(g), class: "county-path", "data-id": g.id });
    p.appendChild(s("title", null, g.name));
    if (options.interactive) p.addEventListener("click", (ev) => { if (!dragMoved) { ev.stopPropagation(); options.onSelect?.(g.id); } });
    fills.appendChild(p);
    paths.set(g.id, p);
  }

  // View transform: px = k * unit + t
  let k = 1, tx = 0, ty = 0;
  let width = 1, height = 1;
  let kFit = 1;
  let last: { state: GameState | undefined; selected: CountyId | undefined; mode: MapMode; neighbors: CountyId | undefined; player: string | undefined } | undefined;
  let selectedBBox: [number, number, number, number] | undefined;
  const pad = options.padding ?? { top: 36, right: 36, bottom: 36, left: 36 };

  function applyTransform(): void {
    root.setAttribute("transform", `matrix(${k} 0 0 ${k} ${tx} ${ty})`);
    for (const c of labels.children) scaleAt(c as SVGElement);
    for (const c of markers.children) scaleAt(c as SVGElement);
    placeBrackets();
    if (last) {
      drawLabels(last.state, last.selected);
      const stateScale = k / kFit < 1.6;
      if (stateScale !== lastStateScale) { lastStateScale = stateScale; drawMarkers(last.state); }
    }
  }
  let lastStateScale: boolean | undefined;

  function scaleAt(node: SVGElement): void {
    const x = Number(node.dataset["x"]), y = Number(node.dataset["y"]);
    node.setAttribute("transform", `translate(${x} ${y}) scale(${1 / k})`);
  }

  function placeBrackets(): void {
    if (!selectedBBox || !options.showBrackets) { brackets.hidden = true; return; }
    const [x0, y0, x1, y1] = selectedBBox;
    const left = k * x0 + tx - 8, top = k * y0 + ty - 8;
    brackets.style.left = `${left}px`;
    brackets.style.top = `${top}px`;
    brackets.style.width = `${k * (x1 - x0) + 16}px`;
    brackets.style.height = `${k * (y1 - y0) + 16}px`;
    brackets.hidden = false;
  }

  function fitBBox(b: [number, number, number, number]): void {
    const w = b[2] - b[0], hgt = b[3] - b[1];
    const kx = (width - pad.left - pad.right) / w;
    const ky = (height - pad.top - pad.bottom) / hgt;
    k = Math.max(0.01, Math.min(kx, ky));
    tx = pad.left + ((width - pad.left - pad.right) - w * k) / 2 - b[0] * k;
    ty = pad.top + ((height - pad.top - pad.bottom) - hgt * k) / 2 - b[1] * k;
    applyTransform();
  }

  function fitState(): void {
    fitBBox(STATE_BBOX);
    kFit = k;
  }

  function resize(): void {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    const prev = width;
    width = r.width; height = r.height;
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    if (prev === 1) fitState();
    else { const sb = STATE_BBOX; const w = sb[2] - sb[0], hgt = sb[3] - sb[1]; kFit = Math.min((width - pad.left - pad.right) / w, (height - pad.top - pad.bottom) / hgt); applyTransform(); }
  }

  // Interaction: drag pan, wheel zoom at pointer, click select.
  let dragging = false, dragMoved = false, sx = 0, sy = 0, stx = 0, sty = 0;
  if (options.interactive) {
    svg.addEventListener("pointerdown", (e) => { if (e.button !== 0 && e.button !== 1) return; dragging = true; dragMoved = false; sx = e.clientX; sy = e.clientY; stx = tx; sty = ty; svg.setPointerCapture(e.pointerId); });
    svg.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!dragMoved && Math.hypot(dx, dy) < 4) return;
      dragMoved = true; tx = stx + dx; ty = sty + dy; applyTransform();
    });
    const end = () => { dragging = false; setTimeout(() => { dragMoved = false; }, 0); };
    svg.addEventListener("pointerup", end);
    svg.addEventListener("pointercancel", end);
    svg.addEventListener("wheel", (e) => {
      e.preventDefault();
      const r = svg.getBoundingClientRect();
      const px = e.clientX - r.left, py = e.clientY - r.top;
      const factor = Math.exp(-e.deltaY * 0.0015);
      const nk = Math.min(kFit * 12, Math.max(kFit * 0.6, k * factor));
      const ratio = nk / k;
      tx = px - (px - tx) * ratio; ty = py - (py - ty) * ratio; k = nk;
      applyTransform();
    }, { passive: false });
  }

  function fillFor(state: GameState | undefined, id: CountyId, mode: MapMode, player: string | undefined): string {
    if (!state) return "var(--fill-independent)";
    const c = state.counties[id];
    if (!c) return "var(--fill-independent)";
    const owner = state.admins[c.ownerAdminId];
    switch (mode) {
      case "coalitions": {
        if (player && c.ownerAdminId === player) return "var(--fill-player)";
        const coal = owner?.coalitionId ? state.coalitions[owner.coalitionId] : undefined;
        return coal ? coal.color : "#F0EADC";
      }
      case "economy": {
        const st = c.stats;
        if (st.industry >= 3) return "var(--econ-industry-hi)";
        if (st.industry >= 1) return "var(--econ-industry)";
        if (st.agriculture >= 3) return "var(--econ-agri)";
        return "var(--econ-low)";
      }
      case "integration": {
        if (!player || c.ownerAdminId !== player) return "var(--fill-independent)";
        return c.stats.integration >= 100 ? "var(--integ-full)" : c.stats.integration >= 70 ? "var(--integ-partial)" : "var(--integ-none)";
      }
      case "terrain":
        return c.terrain === "mountain" ? "var(--terrain-mountain)" : c.terrain === "wetland" ? "var(--terrain-wetland)" : c.terrain === "piedmont" ? "var(--terrain-piedmont)" : "var(--terrain-coastal)";
      default: {
        if (player && c.ownerAdminId === player) return c.stats.integration >= 70 ? "var(--fill-player)" : "var(--fill-player-owned)";
        return owner?.coalitionId ? "var(--fill-member)" : "var(--fill-independent)";
      }
    }
  }

  function drawLabels(state: GameState | undefined, selected: CountyId | undefined): void {
    clear(labels);
    const rel = k / kFit;
    const fontUnits = 11;
    const addLabel = (x: number, y: number, text: string, cls: string, dy = 0) => {
      const t = s("text", { class: cls, "data-x": x, "data-y": y, "font-size": fontUnits, dy }, text);
      labels.appendChild(t);
      scaleAt(t);
    };
    if (rel < 1.6) {
      for (const [name, lon, lat] of MAJOR_SETTLEMENTS) {
        const [x, y] = project(lon, lat);
        const dot = s("circle", { class: "seat-dot", "data-x": x, "data-y": y, r: 3 });
        labels.appendChild(dot); scaleAt(dot);
        addLabel(x, y, name, "seat-label", 14);
      }
      if (selected) { const g = GEOMETRY_BY_ID.get(selected)!; const [x, y] = project(g.centroid[0], g.centroid[1]); addLabel(x, y, g.name, "label", -8); }
      return;
    }
    const cap = rel >= 3.5 ? 70 : 45;
    const chosen: CountyGeometry[] = [];
    const seen = new Set<CountyId>();
    const push = (id: CountyId) => { const g = GEOMETRY_BY_ID.get(id); if (g && !seen.has(id)) { seen.add(id); chosen.push(g); } };
    if (selected) { push(selected); for (const n of neighborsOf(selected)) push(n); }
    // Then visible counties by projected area.
    const visible = GEOMETRY.filter((g) => {
      const [x, y] = project(g.centroid[0], g.centroid[1]);
      const px = k * x + tx, py = k * y + ty;
      return px > -20 && py > -20 && px < width + 20 && py < height + 20;
    }).sort((a, b) => (b.bbox[2] - b.bbox[0]) * (b.bbox[3] - b.bbox[1]) - (a.bbox[2] - a.bbox[0]) * (a.bbox[3] - a.bbox[1]));
    for (const g of visible) { if (chosen.length >= cap) break; push(g.id); }
    for (const g of chosen) {
      const [x, y] = project(g.centroid[0], g.centroid[1]);
      addLabel(x, y, g.name, "label", 3);
      if (rel >= 3.5 && state) {
        const c = state.counties[g.id];
        if (c) addLabel(x, y, c.seat, "seat-label", 15);
      }
    }
  }

  function drawMarkers(state: GameState | undefined): void {
    clear(markers);
    if (!state) return;
    const byCounty = new Map<CountyId, { init: string; str: number }[]>();
    const stateScale = k / kFit < 1.6;
    for (const f of Object.values(state.formations)) {
      if (stateScale && f.ownerAdminId !== state.playerAdminId) continue; // suppress most counters at state scale
      const owner = state.admins[f.ownerAdminId];
      const init = (owner?.name ?? "??").slice(0, 2).toUpperCase();
      const arr = byCounty.get(f.countyId) ?? [];
      arr.push({ init, str: f.strength });
      byCounty.set(f.countyId, arr);
    }
    for (const [id, list] of byCounty) {
      const g = GEOMETRY_BY_ID.get(id)!;
      const [x, y] = project(g.centroid[0], g.centroid[1]);
      list.forEach((m, i) => {
        const grp = s("g", { class: "marker-army", "data-x": x, "data-y": y });
        const ox = -19 + i * 6, oy = -30 - i * 4;
        grp.appendChild(s("rect", { class: "bg", x: ox, y: oy, width: 38, height: 22, rx: 1 }));
        grp.appendChild(s("rect", { x: ox + 4, y: oy + 4, width: 10, height: 6, fill: "none", stroke: "var(--ink)", "stroke-width": 1.2 }));
        grp.appendChild(s("text", { x: ox + 33, y: oy + 10, "text-anchor": "end" }, m.init));
        grp.appendChild(s("rect", { x: ox + 4, y: oy + 15, width: 30, height: 3, fill: "rgba(37,42,45,.2)" }));
        grp.appendChild(s("rect", { x: ox + 4, y: oy + 15, width: (30 * m.str) / 100, height: 3, fill: "var(--ink)" }));
        grp.appendChild(s("title", null, `${FORMATIONS.battalion.label} · strength ${m.str}`));
        markers.appendChild(grp);
        scaleAt(grp);
      });
    }
    for (const c of Object.values(state.counties)) {
      if (!c.bell) continue;
      const g = GEOMETRY_BY_ID.get(c.id)!;
      const [x, y] = project(g.centroid[0], g.centroid[1]);
      const grp = s("g", { class: "marker-fed", "data-x": x, "data-y": y });
      grp.appendChild(s("rect", { x: 6, y: 6, width: 14, height: 14 }));
      grp.appendChild(s("text", { x: 13, y: 16 }, "F"));
      grp.appendChild(s("title", null, "Protected federal facility · Bell plant site"));
      markers.appendChild(grp);
      scaleAt(grp);
    }
  }

  function update(state: GameState | undefined, selected: CountyId | undefined, mode: MapMode, opts?: { neighborsOf?: CountyId | undefined; playerAdminId?: string | undefined }): void {
    const player = opts?.playerAdminId ?? state?.playerAdminId;
    last = { state, selected, mode, neighbors: opts?.neighborsOf, player };
    for (const [id, p] of paths) p.setAttribute("fill", fillFor(state, id, mode, player));

    clear(occupied);
    if (state) for (const c of Object.values(state.counties)) if (c.occupierAdminId) occupied.appendChild(s("path", { d: countyPath(GEOMETRY_BY_ID.get(c.id)!), fill: "url(#hatch)", "pointer-events": "none" }));

    clear(coalitionLines);
    if (state && mode !== "economy" && mode !== "terrain") {
      for (const coal of Object.values(state.coalitions)) {
        const ids = coal.members.flatMap((m) => state.admins[m]?.counties ?? []);
        coalitionLines.appendChild(s("path", { d: groupOutline(ids), class: `outline-coalition${mode === "coalitions" ? " strong" : ""}` }));
      }
    }
    clear(adminLines);
    if (state) {
      for (const adm of Object.values(state.admins)) {
        if (adm.counties.length > 1 || adm.id === player) adminLines.appendChild(s("path", { d: groupOutline(adm.counties), class: "outline-admin" }));
      }
    }
    clear(neighborLines);
    if (opts?.neighborsOf) for (const n of neighborsOf(opts.neighborsOf)) neighborLines.appendChild(s("path", { d: countyPath(GEOMETRY_BY_ID.get(n)!), class: "outline-neighbor" }));

    clear(selectedLines);
    if (selected) {
      const g = GEOMETRY_BY_ID.get(selected)!;
      selectedLines.appendChild(s("path", { d: countyPath(g), class: "selected-outer" }));
      selectedLines.appendChild(s("path", { d: countyPath(g), class: "selected-inner" }));
      selectedBBox = projectedBBox([selected]);
    } else selectedBBox = undefined;
    placeBrackets();
    drawLabels(state, selected);
    drawMarkers(state);
  }

  function fitTo(ids: readonly CountyId[], padding = 0): void {
    const b = projectedBBox(ids);
    fitBBox([b[0] - padding, b[1] - padding, b[2] + padding, b[3] + padding]);
  }

  function centerOn(id: CountyId): void {
    const g = GEOMETRY_BY_ID.get(id);
    if (!g) return;
    const [x, y] = project(g.centroid[0], g.centroid[1]);
    if (k < kFit * 1.8) k = kFit * 2.4;
    tx = width / 2 - x * k; ty = height / 2 - y * k;
    applyTransform();
  }

  const ro = new ResizeObserver(() => resize());
  ro.observe(el);

  return { el, update, fitState, fitTo, centerOn, resize };
}

export const COBB_ID = countyIdByName("Cobb");
export const METRO_IDS = ["Cobb", "Fulton", "DeKalb", "Clayton", "Gwinnett", "Cherokee", "Bartow", "Paulding", "Douglas", "Forsyth", "Fayette", "Henry", "Rockdale", "Coweta", "Carroll"].map(countyIdByName);
