# County Compact: Georgia, 1942

An original browser-based grand strategy game design spanning all 159 Georgia counties. The flagship campaign begins in Cobb County on February 1, 1942 and ends in 1948.

The player develops local industry and agriculture, negotiates coalitions, expands through peaceful integration or limited conflict, and administers a regional government through wartime investment and postwar change.

## Status

Design and planning. No playable application is implemented yet. County wars and sovereign regional arrangements are explicitly fictional alternate history; historical background and game values are distinguished throughout the design.

- [Game design document](docs/game-design.md)
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

Strict TypeScript, Vite, Three.js, HTML/CSS panels, local saves, and bundled data/assets. No required backend, paid services, API keys, or runtime asset downloads.

## Data and rights

The game design includes a source register and unresolved research questions. Verify exact geographic downloads and preserve attribution before bundling. No software license is selected at this planning stage.
