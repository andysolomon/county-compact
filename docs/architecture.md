# Architecture

County Compact is a local browser application: strict TypeScript, Vite, no UI
framework. There is no backend, no API keys, and no runtime asset downloads —
everything (data, fonts) is bundled at build time. The strategic map is SVG
behind a replaceable renderer interface (decision dated 2026-09-16; reconsider
only if the CC-27 performance measurements require WebGL).

## Layers and allowed import directions

Each layer may import only from layers listed before it (UI imports sim and data; sim imports data; data imports nothing internal):

1. **`src/data`** — scenario and static data (`geometry.ts`, `roster.ts`,
   `coalitions.ts`, `georgia-counties.json`). Must not import from `src/sim`
   or `src/ui`.
2. **`src/sim`** — deterministic rules engine: `calendar`, `engine`,
   `economy`, `events`, `rules`, `war`, `diplomacy`, `coalition`, `projects`,
   `training`, `scenario`, `types`. May import from `src/data`. Must never
   touch the DOM, `window`, or `localStorage` — with exactly one exception:
3. **`src/sim/save.ts`** — the persistence adapter. It is the only sim module
   allowed to use `localStorage`. The UI store and menu call its exported
   `saveLocal` and `loadLocal` (`clearLocal` is currently unused); no other sim module
   imports it.
4. **`src/ui/map.ts`** — the strategic map renderer, isolated behind the
   `MapView` interface (`update` / `fitState` / `fitTo` / `centerOn` /
   `resize`). Panels and screens call the interface, not SVG internals, so
   the renderer can be replaced (e.g. WebGL) without touching UI callers.
   It reads state; rendering never determines simulation results.
5. **`src/ui`** — panels, screens, and the shared store (`store.ts`,
   `dom.ts`, `labels.ts`, `panels/`, `screens/`). May import from `src/sim`
   and `src/data`. Renders simulation output; never mutates game state
   outside the store's exported actions.
6. **`src/styles`** — CSS tokens, app styles, and `fonts.css` for bundled
   `@font-face` rules. Referenced from `index.html` / `src/styles/app.css`.
7. **`src/assets`** — bundled fonts and license files, referenced only from
   CSS. Provenance in `docs/ASSETS.md`.

The boundary invariant test is `tests/architecture.test.ts`; it fails if
`src/sim` or `src/data` imports from `src/ui`, or if any sim module other
than `save.ts` references browser globals.

## Known boundary violations in current code

None. `src/sim` modules other than `save.ts` contain no DOM, `window`, or
`localStorage` references, and neither `src/sim` nor `src/data` imports from
`src/ui` (verified by `tests/architecture.test.ts`).
