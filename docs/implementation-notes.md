# Implementation notes — first development increment

Date: 13 September 2026. Companion to [game-design.md](game-design.md) and the [backlog](../planning/backlog.md).

## What exists

A local Vite + strict TypeScript application with no backend, no API keys, and no runtime downloads.

| Area | Location | Backlog |
|---|---|---|
| Visual tokens and shell | `src/styles/tokens.css`, `src/styles/app.css` | #24 |
| Bundled 159-county geometry and shared-edge adjacency | `scripts/prepare-geometry.mjs` → `src/data/georgia-counties.json` | #2 (partial) |
| County roster, coalitions, baseline stats, Cobb opening | `src/data/*`, `src/sim/scenario.ts` | #4 (partial), #23 (partial) |
| Deterministic calendar and daily/month-end engine | `src/sim/calendar.ts`, `src/sim/engine.ts` | #6 |
| Workforce allocation, budget forecast and settlement | `src/sim/economy.ts` | #8 |
| Construction projects | `src/sim/projects.ts` | #9 (partial) |
| Bell chain E01 and E02 with computed costs and prerequisites | `src/sim/events.ts` | #20, #21 (partial) |
| Acceptance rule, improve-relations action | `src/sim/diplomacy.ts` | #12 (partial) |
| Coalition admission motion, member votes, common fund, cohesion | `src/sim/coalition.ts` | #13 (partial) |
| War score, cession eligibility and cost, settlement forecast and application | `src/sim/war.ts`, `src/sim/training.ts` | #19 (partial) |
| Local autosave with ruleset check | `src/sim/save.ts` | #10 (partial) |
| SVG strategic map, county selection, panels, decision modal | `src/ui/*` | #7, #24 (partial) |
| Rule tests replaying GDD §9.2 February–May 1942 | `tests/*.test.ts` | #28 (partial) |

Run `npm install`, then `npm run dev` (app), `npm test` (rules), `npm run build` (typecheck + bundle).

## Decisions taken in this increment

- **SVG map instead of Three.js for the vertical slice.** 159 polygons with about 2,600 vertices render and re-fill instantly as SVG, and every county path is a real DOM element the accessible Find-county list can share selection with. The map component (`src/ui/map.ts`) exposes `update / fitTo / centerOn`, so a WebGL renderer can replace it behind the same interface when performance targets (GDD §10.2) require it.
- **One shared selection.** `store.ui.selectedCountyId` is the only selection state; the map, the county list, the details panel, and every action drawer read it. Selecting a county while an administration-level drawer (budget, forces) is open returns to details.
- **Modern Census geometry as the crosswalk base.** The bundled polygons come from the public-domain Census cartographic file redistributed by plotly/datasets, rounded to four decimals. Adjacency is built only from shared boundary segments; the 12 corner-only contacts (for example Barrow–Hall, Cherokee–Gordon) are excluded as the design requires. Historical verification for 1 February 1942 (issues #1–#2) has not been done and the file's provenance block says so.
- **Baseline stats for all 159 counties are explicit design estimates.** Five tiers derived from the mockup's economic rank lists; every start satisfies the +2 C solvency floor and the constitutional minimum (3 W, B ≥ 1, 40 C), verified by a test. Cobb is the only authored profile. Seats are modern seats pending verification.
- **Decision windows apply the labeled no-spend default on the deadline day.** E01 fired 19 February defaults on 21 March.
- **Coalition member votes** use a visible rule (0.4R + 0.3Q toward the applicant + shared benefit − 0.3 × alarm toward the proposer ≥ 15) and resolve weekly in stable ID order. Applicant consent uses the GDD §6.3 acceptance score with autonomy cost 15 and is re-evaluated at resolution.
- **Peace negotiation runs on real state.** Because wars, claims, and battles are not yet simulated, the "Peace-settlement training" scenario builds an authored September 1944 state (copied data, fictional opposing force, no campaign effects, GDD §9.1) so the settlement rules are exercised end to end: candidates, cost `20 + 2I + B`, the two-county limit, contiguity, acceptance, counteroffer, and the receiving-administration forecast.

## Not implemented yet

Materials market and emergency notes; treaties other than relations and membership; integration sponsorship; recruitment, movement, supply, battles, occupation progress, claim registration and war declaration; Bell E03 onward and the other 14 events; AI planning; victory and defeat; tutorial; save import/export UI; WebGL renderer; historical verification of geometry, seats, and boundaries.
