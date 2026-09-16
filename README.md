# County Compact: Georgia, 1942

An original browser-based grand strategy game design spanning all 159 Georgia counties. The flagship campaign begins in Cobb County on February 1, 1942 and ends in 1948.

The player develops local industry and agriculture, negotiates coalitions, expands through peaceful integration or limited conflict, and administers a regional government through wartime investment and postwar change.

## Status

Early development. A local browser application now covers the first interaction loop: select Cobb, inspect the budget, fund a transport improvement, advance time, see it complete with updated finances, answer the Bell decisions, run a coalition admission motion, and negotiate a peace settlement in a training scenario. See [implementation notes](docs/implementation-notes.md) for what exists and what is deferred. County wars and sovereign regional arrangements are explicitly fictional alternate history; historical background and game values are distinguished throughout the design.

```sh
npm install
npm run dev        # local app at http://localhost:5173
npm test           # rule tests replaying the design's first-year ledger
npm run typecheck  # strict TypeScript, no emit
npm run build      # typecheck and production bundle
```

Pushes and pull requests to `main` run the same typecheck, tests, and build in CI (`.github/workflows/ci.yml`).

- [Game design document](docs/game-design.md)
- [Implementation notes](docs/implementation-notes.md)
- [GitHub issues](https://github.com/andysolomon/county-compact/issues)
- [Implementation backlog](planning/backlog.md)
- [Machine-readable issue plan](planning/issues.json)

## Delivery gates

1. Historical map foundation: verify the complete county roster, period geography, and data rights.
2. Economic vertical slice: deterministic simulation, map interaction, staffing, construction, budget, and saves.
3. Peaceful regional game: diplomacy, coalitions, public support, administration, and integration.
4. Limited conflict: formations, supply, battles, occupation, federal consequences, and peace.
5. Historical campaign: conditional events, Bell transformation, and postwar adjustment.
6. Complete first playable: all-county selection, onboarding, campaign endings, accessibility, performance, and validation.

## Intended technology

Strict TypeScript, Vite, an SVG strategic map behind a replaceable renderer interface, HTML/CSS panels, local saves, and bundled data/fonts. No required backend, paid services, API keys, or runtime asset downloads. See [docs/architecture.md](docs/architecture.md) for the module layers and [docs/ASSETS.md](docs/ASSETS.md) for bundled asset provenance.

## Data and rights

The game design includes a source register and unresolved research questions. Verify exact geographic downloads and preserve attribution before bundling. No software license is selected at this planning stage.
