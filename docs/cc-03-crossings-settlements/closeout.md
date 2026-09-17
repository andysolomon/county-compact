# CC-03 close-out decisions (2026-09-16)

Operator accepted the parent's recommendation to close CC-03 with the evidence already bundled and move the residual research to issue #35.

## Acceptance criteria

| Criterion | Closing evidence | Residual (issue #35) |
|---|---|---|
| Date-source roads, rail, crossings, seats, settlements; distinguish evidence from abstraction | Roads bracketed 1940/1944 (`docs/historical-research/issue-3-roads.*`); movement edges labelled `scenario-abstraction`; river crossings derived from Natural Earth + TIGER/Line with per-source fractions; seats checked against 1940 Census (`src/data/settlements.json`) | Rail corridors, route numbers, 15 unmatched seats, uncorroborated populations |
| Passable edges, crossing tags, terrain classes, protected facility records | `src/data/movement-edges.json`; `issue-3-terrain-classes.*`; `issue-3-federal-facilities.*` | Disputed crossing tags |
| Period-correct names; no interstates or unverified reservoirs | No interstate data; reservoir-only water features excluded from crossing tags; date-aware airfield/Bell labels in game-design §3 | Dawson–Hall label inside Lake Lanier |
| Cobb–Fulton access, Rickenbacker naming, federal ownership; unresolved questions recorded | Cobb–Fulton Chattahoochee crossing corroborated by both sources; decisions below; unresolved logs | — |

## Decision U3-4 — "Savannah PN depot"

No cached source matches the label. Decision: drop the label. No facility of that name enters the 1942-02-01 roster. Chatham's federal presence is represented by Hunter Field (already in the roster). The Southeastern Shipbuilding yard (contract early 1942, private contractor) may enter later only as a dated scenario event with its own citation.

## Decision U3-5 — Marietta airfield name on 1942-02-01

Follow the cached New Georgia Encyclopedia chronology: the Cobb County Army Air Field, Rickenbacker Field and Marietta Army Air Field names all date from 1943, and the Bell plant selection was announced on 19 February 1942. Decision: no Marietta airfield or Bell plant in the 1942-02-01 federal-facility roster. The in-game site uses date-aware labels, as `docs/game-design.md` §3 already states. A primary source (NARA RG 18/38 or AFHRA) that contradicts this reopens the question under #35.
