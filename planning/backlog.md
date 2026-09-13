# Implementation backlog

All 28 issues are published in [andysolomon/county-compact](https://github.com/andysolomon/county-compact/issues). GitHub issues are the current tracking source; the table below records the initial delivery sequence and prerequisites.

Priority: P0 covers critical correctness foundations; P1 covers the remaining required first-playable work. Delivery stages establish sequence. These priorities are recorded in issue bodies, not GitHub labels.

Start with #1 (historical data) and #5 (project setup), which have no prerequisites. Planning IDs remain stable cross-reference keys.

## A — Historical map foundation

| Issue | Plan ID | Priority | Prerequisites |
|---|---|---|---|
| [#1 — Verify the 1942 Georgia county roster and geographic provenance](https://github.com/andysolomon/county-compact/issues/1) | CC-01 | P0 | None |
| [#2 — Prepare county geometry and validate geographic adjacency](https://github.com/andysolomon/county-compact/issues/2) | CC-02 | P0 | [#1](https://github.com/andysolomon/county-compact/issues/1) |
| [#3 — Research period transport, terrain, settlements, and federal facilities](https://github.com/andysolomon/county-compact/issues/3) | CC-03 | P1 | [#1](https://github.com/andysolomon/county-compact/issues/1), [#2](https://github.com/andysolomon/county-compact/issues/2) |
| [#4 — Author complete starting data for all 159 counties](https://github.com/andysolomon/county-compact/issues/4) | CC-04 | P0 | [#1](https://github.com/andysolomon/county-compact/issues/1), [#3](https://github.com/andysolomon/county-compact/issues/3) |

## B — Economic vertical slice

| Issue | Plan ID | Priority | Prerequisites |
|---|---|---|---|
| [#5 — Establish the local browser project and bundled-asset baseline](https://github.com/andysolomon/county-compact/issues/5) | CC-05 | P1 | None |
| [#6 — Specify and implement deterministic campaign state and calendar](https://github.com/andysolomon/county-compact/issues/6) | CC-06 | P0 | [#4](https://github.com/andysolomon/county-compact/issues/4), [#5](https://github.com/andysolomon/county-compact/issues/5) |
| [#7 — Render the Georgia strategic map and accessible county selection](https://github.com/andysolomon/county-compact/issues/7) | CC-07 | P1 | [#2](https://github.com/andysolomon/county-compact/issues/2), [#5](https://github.com/andysolomon/county-compact/issues/5), [#6](https://github.com/andysolomon/county-compact/issues/6) |
| [#8 — Implement workforce allocation and the monthly county budget](https://github.com/andysolomon/county-compact/issues/8) | CC-08 | P0 | [#6](https://github.com/andysolomon/county-compact/issues/6) |
| [#9 — Implement construction, procurement, debt, and arrears](https://github.com/andysolomon/county-compact/issues/9) | CC-09 | P1 | [#8](https://github.com/andysolomon/county-compact/issues/8), [#3](https://github.com/andysolomon/county-compact/issues/3) |
| [#10 — Add versioned local saves, export/import, and recovery](https://github.com/andysolomon/county-compact/issues/10) | CC-10 | P0 | [#6](https://github.com/andysolomon/county-compact/issues/6) |

## C — Peaceful regional game

| Issue | Plan ID | Priority | Prerequisites |
|---|---|---|---|
| [#11 — Implement public support, administrative reach, and territorial integration](https://github.com/andysolomon/county-compact/issues/11) | CC-11 | P1 | [#8](https://github.com/andysolomon/county-compact/issues/8), [#9](https://github.com/andysolomon/county-compact/issues/9), [#3](https://github.com/andysolomon/county-compact/issues/3) |
| [#12 — Implement treaties and explainable diplomatic acceptance](https://github.com/andysolomon/county-compact/issues/12) | CC-12 | P1 | [#6](https://github.com/andysolomon/county-compact/issues/6), [#8](https://github.com/andysolomon/county-compact/issues/8), [#3](https://github.com/andysolomon/county-compact/issues/3) |
| [#13 — Implement coalitions, voting, common budgets, and delegated authority](https://github.com/andysolomon/county-compact/issues/13) | CC-13 | P1 | [#12](https://github.com/andysolomon/county-compact/issues/12), [#8](https://github.com/andysolomon/county-compact/issues/8) |
| [#14 — Implement dependency, negotiated union, and expansion alarm](https://github.com/andysolomon/county-compact/issues/14) | CC-14 | P1 | [#11](https://github.com/andysolomon/county-compact/issues/11), [#12](https://github.com/andysolomon/county-compact/issues/12), [#13](https://github.com/andysolomon/county-compact/issues/13) |
| [#15 — Implement constrained AI planning and visible priorities](https://github.com/andysolomon/county-compact/issues/15) | CC-15 | P1 | [#9](https://github.com/andysolomon/county-compact/issues/9), [#11](https://github.com/andysolomon/county-compact/issues/11), [#12](https://github.com/andysolomon/county-compact/issues/12), [#13](https://github.com/andysolomon/county-compact/issues/13), [#14](https://github.com/andysolomon/county-compact/issues/14) |

## D — Limited conflict

| Issue | Plan ID | Priority | Prerequisites |
|---|---|---|---|
| [#16 — Implement recruitment, formations, movement, and supply](https://github.com/andysolomon/county-compact/issues/16) | CC-16 | P1 | [#3](https://github.com/andysolomon/county-compact/issues/3), [#8](https://github.com/andysolomon/county-compact/issues/8), [#12](https://github.com/andysolomon/county-compact/issues/12) |
| [#17 — Implement simultaneous county battles and occupation](https://github.com/andysolomon/county-compact/issues/17) | CC-17 | P1 | [#16](https://github.com/andysolomon/county-compact/issues/16), [#6](https://github.com/andysolomon/county-compact/issues/6) |
| [#18 — Implement war goals, Federal Standing, exhaustion, and intervention](https://github.com/andysolomon/county-compact/issues/18) | CC-18 | P1 | [#12](https://github.com/andysolomon/county-compact/issues/12), [#16](https://github.com/andysolomon/county-compact/issues/16), [#17](https://github.com/andysolomon/county-compact/issues/17) |
| [#19 — Implement peace negotiation, arbitration, and cession rules](https://github.com/andysolomon/county-compact/issues/19) | CC-19 | P1 | [#17](https://github.com/andysolomon/county-compact/issues/17), [#18](https://github.com/andysolomon/county-compact/issues/18), [#14](https://github.com/andysolomon/county-compact/issues/14) |

## E — Historical campaign

| Issue | Plan ID | Priority | Prerequisites |
|---|---|---|---|
| [#20 — Build the historical and dynamic event framework](https://github.com/andysolomon/county-compact/issues/20) | CC-20 | P1 | [#6](https://github.com/andysolomon/county-compact/issues/6), [#8](https://github.com/andysolomon/county-compact/issues/8), [#10](https://github.com/andysolomon/county-compact/issues/10) |
| [#21 — Author and validate the Bell industrial transformation chain](https://github.com/andysolomon/county-compact/issues/21) | CC-21 | P1 | [#20](https://github.com/andysolomon/county-compact/issues/20), [#9](https://github.com/andysolomon/county-compact/issues/9), [#11](https://github.com/andysolomon/county-compact/issues/11), [#12](https://github.com/andysolomon/county-compact/issues/12) |
| [#22 — Author statewide events, coastal contracts, and postwar adjustment](https://github.com/andysolomon/county-compact/issues/22) | CC-22 | P1 | [#20](https://github.com/andysolomon/county-compact/issues/20), [#13](https://github.com/andysolomon/county-compact/issues/13), [#14](https://github.com/andysolomon/county-compact/issues/14) |

## F — Complete first playable

| Issue | Plan ID | Priority | Prerequisites |
|---|---|---|---|
| [#23 — Create campaign selection, ambitions, and six opening profiles](https://github.com/andysolomon/county-compact/issues/23) | CC-23 | P1 | [#4](https://github.com/andysolomon/county-compact/issues/4), [#7](https://github.com/andysolomon/county-compact/issues/7), [#8](https://github.com/andysolomon/county-compact/issues/8), [#13](https://github.com/andysolomon/county-compact/issues/13) |
| [#24 — Build the strategic UI, map modes, and consequential-action flows](https://github.com/andysolomon/county-compact/issues/24) | CC-24 | P1 | [#7](https://github.com/andysolomon/county-compact/issues/7), [#8](https://github.com/andysolomon/county-compact/issues/8), [#11](https://github.com/andysolomon/county-compact/issues/11), [#13](https://github.com/andysolomon/county-compact/issues/13), [#19](https://github.com/andysolomon/county-compact/issues/19), [#20](https://github.com/andysolomon/county-compact/issues/20) |
| [#25 — Implement Cobb onboarding and an isolated optional combat tutorial](https://github.com/andysolomon/county-compact/issues/25) | CC-25 | P1 | [#23](https://github.com/andysolomon/county-compact/issues/23), [#24](https://github.com/andysolomon/county-compact/issues/24), [#21](https://github.com/andysolomon/county-compact/issues/21), [#19](https://github.com/andysolomon/county-compact/issues/19) |
| [#26 — Implement victory, defeat, campaign summary, and sandbox continuation](https://github.com/andysolomon/county-compact/issues/26) | CC-26 | P1 | [#11](https://github.com/andysolomon/county-compact/issues/11), [#13](https://github.com/andysolomon/county-compact/issues/13), [#18](https://github.com/andysolomon/county-compact/issues/18), [#20](https://github.com/andysolomon/county-compact/issues/20), [#23](https://github.com/andysolomon/county-compact/issues/23) |
| [#27 — Validate keyboard accessibility, responsive layouts, and performance](https://github.com/andysolomon/county-compact/issues/27) | CC-27 | P1 | [#24](https://github.com/andysolomon/county-compact/issues/24), [#25](https://github.com/andysolomon/county-compact/issues/25), [#26](https://github.com/andysolomon/county-compact/issues/26) |
| [#28 — Run all-county correctness gates and campaign playtests](https://github.com/andysolomon/county-compact/issues/28) | CC-28 | P1 | [#15](https://github.com/andysolomon/county-compact/issues/15), [#19](https://github.com/andysolomon/county-compact/issues/19), [#22](https://github.com/andysolomon/county-compact/issues/22), [#25](https://github.com/andysolomon/county-compact/issues/25), [#26](https://github.com/andysolomon/county-compact/issues/26), [#27](https://github.com/andysolomon/county-compact/issues/27) |

## Planning notes

All six stages are required for the first playable. Later-state expansion, deeper production chains, air/naval operations, and multiplayer are outside this backlog. Historical research and playtest findings may justify revisions to the design; record those decisions in the associated issues.

[Game design](../docs/game-design.md) · [Published issue plan](issues.json)
