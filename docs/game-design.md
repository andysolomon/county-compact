# County Compact: Georgia, 1942

Game design document • Version 1.0 • Prepared for Andrew Solomon • 13 September 2026

**Design approach.** Make the real Georgia map the game board, county administration the player's starting power, and coalition building the engine of expansion. Use a deliberately fictional emergency compact to permit limited armed conflict inside an otherwise continuing United States. Keep money, materials, workforce, and political obligations readable; make the costs of acquiring territory as explicit as its benefits. Build the campaign around wartime investment and postwar adjustment, ending in 1948.

This document specifies a design, not a built or tested game. Every numerical game value is a proposed balancing value, not a historical measurement. Historical citations refer to the source register in section 12. Textual layout tables serve as wireframes; no application code is included.

## 1. Executive concept

**Working title:** County Compact: Georgia, 1942.

**Pitch:** Start with one of Georgia's 159 counties. Turn farms, factories, transport agreements, and local political support into a regional power. Negotiate a common government—or fight a limited territorial war—then make the resulting union function when wartime prosperity gives way to peace.

**Player fantasy:** “I began with Cobb County. I brought neighboring counties into a durable regional government and made it strong enough to shape Georgia.” An empire is an expanding regional administration and sphere of influence; it is not a medieval monarchy or a declaration of independence from the United States.

| Pillar | Design commitment | Evidence in play |
|---|---|---|
| Georgia is the strategic interface | All 159 real counties; meaningful terrain and transport | Players explain why a particular neighbor matters |
| Several routes to power | Integration, coalition leadership, dependency, and limited war | A peaceful campaign can achieve the main victory |
| Growth creates obligations | Administration, autonomy, services, and coalition consent | A new county changes spending and political decisions |
| History changes incentives | Investment, labor pressure, rationing, demobilization | A strong 1944 economy may need restructuring in 1946 |
| Explainable consequences | Visible calculations and treaty authority | Players can understand a deficit, rejection, or battle loss |

**Audience and format:** Desktop players who enjoy strategic maps but need a more approachable entry than a full global grand strategy game. A campaign targets 6–10 hours across 20–45-minute sessions. Pausing is unrestricted. No reflex-based combat.

**Initial release:** One Georgia scenario, one ruleset, all-county selection, six carefully authored opening profiles, and approximately 20–24 event definitions. The 16 samples below establish the required event content and reusable patterns.

## 2. Historical and alternate-history premise

### 2.1 Four explicit layers

| Label in the game | Meaning | Example |
|---|---|---|
| Historical background | Sourced real-world information | Bell's Marietta selection on February 19, 1942 [S1] |
| Scenario fiction | Authored divergence or institution | Metro Atlanta Coalition; emergency county compact |
| Game abstraction | A rule or balancing simplification | One workforce unit; monthly public revenue |
| Campaign outcome | Something caused by this playthrough | Paulding voluntarily integrates into Cobb's administration |

Every event has one category label and a “Historical note” drawer. Fictional political statements never appear under the historical label. Historical individuals may appear in contextual text, but fictional officials holding scenario offices use office titles, not invented quotations attributed to real people.

### 2.2 The selected divergence: the Georgia Emergency Compact

**Fictional divergence, December 18, 1941:** A severe failure of Georgia's procurement and revenue administration produces a constitutional confrontation between the state government, local authorities, and federal procurement agencies. Congress and Georgia adopt an extraordinary temporary compact. This is the game's major counterfactual assumption, not a historically probable legal development.

The compact delegates regional taxation, public works, supply coordination, and territorial security to county administrations. They can form regional governments. A joint **Compact Commission** can recognize negotiated administrative transfers and settlements of limited armed disputes. The federal government prioritizes uninterrupted national mobilization, tolerating contained disputes under this invented arrangement while retaining overwhelming coercive power.

The resulting setting requires a large suspension of historical plausibility. The fiction is stated on campaign selection and in the opening briefing; ordinary wartime decentralization alone would not explain tolerated county wars.

**Authority retained:** Washington controls foreign policy, the national armed forces, federal facilities, currency, national procurement, and federal law. Georgia retains statewide courts, civil law, and recognition of administrative arrangements through the fictional commission. County borders remain identifiable even when their governing administration changes.

**County authority:** Public budgets, local construction, contracts, local security formations, diplomacy under the compact, and integration subject to settlement rules. A player cannot command U.S. Army installations, seize federal aircraft, cancel federal law, or divert wartime bombers into county warfare.

**Why wars are not immediately suppressed:** The compact authorizes a narrow category of registered regional disputes and a short enforcement interval. The commission permits local forces to contest designated county administrations while monitoring transport and federal obligations. That authorization is fictional; it is the premise that makes the military game possible. There are no tactical targets involving civilians or federal facilities.

**Federal Standing, 0–100:** Begins at 70. It measures acceptance by the compact authorities, not popular legitimacy. Pay national service obligations and protect contracted facilities to maintain it. There is no ability to bribe it upward.

| Action or condition | Proposed consequence |
|---|---|
| Registered war begins | Aggressor loses 10 Standing; defender loses none |
| Every full month an actor remains the aggressor in an active war | −2 Standing |
| Every treaty cession imposed by that actor | −5 Standing per county |
| Breach truce or enter an unregistered war | −25 Standing; +25 expansion alarm among affected neighbors |
| Miss a monthly national service payment | −5 Standing; repayment remains due |
| Three successive peaceful, compliant months | +3 Standing at the third month; repeat every third month, cap 100 |
| Standing below 40 | No new federal contracts or registered offensive wars |
| Standing below 20 | Mandatory settlement notice; 60 days to settle all offensive wars and cure arrears |
| Fail that notice | Receivership defeat for that administration |

Registration requires a qualifying dispute, Standing at least 40, no existing offensive war, and expiration of any truce. Unregistered attacks are possible through an explicit second confirmation, with the penalties above. Protected facilities remain non-targetable. Statewide war duration is limited: at day 180, commission arbitration ends a registered war using the settlement rules in section 6. No promise that the real U.S. government would have behaved this way is implied.

**Postwar continuity:** A fictional 1945 renewal preserves compacts through December 1948 to settle debt and reconstruction obligations. At the end, the commission reviews the player government for lasting recognition. This supplies a clear campaign endpoint without rewriting every later decade of U.S. history.

## 3. Georgia map design

### 3.1 All-county coverage and geographic rules

The playable board contains exactly 159 county records, including small and strategically peripheral counties. No counties are merged to simplify selection. Every county can be selected, governed, fought over, and used as a campaign start. Cities and county seats are internal points of interest.

Use a flat orthographic Georgia map with its Atlantic coast, barrier-island geometry where legible, and a quiet outside-state margin. Mark Alabama, Florida, South Carolina, North Carolina, and Tennessee as nonplayable neighbors. Rivers include the Chattahoochee, Savannah, Altamaha, Ocmulgee, Oconee, and Flint. Terrain classes are mountain, Piedmont, coastal plain, and wetland; these are county-level dominant strategic abstractions, with river crossings stored on connections.

County political geometry and military access are separate datasets. A shared boundary establishes geographic adjacency. A passable land crossing establishes a movement edge. A river boundary can connect neighbors but impose a crossing cost; a point-only corner contact does not create a movement edge. Water-separated pieces within one county do not create a new county. No overseas or ocean movement in version one.

**Historical boundary policy:** Use February 1, 1942 as the reference date. Do not equate the modern count of 159 with proof that every modern polygon is historically identical. Historic county names, changes, seats, and disputed boundaries receive a separate review. Modern Fulton includes territory formerly administered by Campbell and Milton; those former counties must not reappear as separate 1942 starts. Verify that merger history in the geographic research gate before publishing the dataset.

### 3.2 Data preparation plan

| Layer | Recommended source and treatment | Release gate |
|---|---|---|
| County roster and modern base geometry | U.S. Census TIGER/Line county polygons, Georgia state code 13; public-domain federal data, retain notices [S7] | 159 unique county records; statewide coverage; official spelling |
| Historical changes | Newberry Atlas of Historical County Boundaries chronology and legal citations; consult Georgia Acts and state archival maps [S6] | Every difference from modern geometry resolved or visibly documented |
| Seats and important settlements | Period maps, Georgia Archives, Census publications | Historical name, county assignment, effective date, evidence |
| Rivers and coastline | Federal geographic data with documented provenance; simplify as one shared topology | No false crossings or unintended polygon gaps |
| Transport and power | Period Georgia highway maps, railroad maps, USGS historical maps; original traced schematics with rights review | Each strategic route has a dated source |
| Population | Published 1940 Census county counts; distinguish census counts from 1942 estimates | Citation, year, and estimate method stored per field |
| Economic ranks | Historical industry/agriculture evidence plus explicit design estimates | No invented exact historical income or output |

Census modern cartographic files are useful for initial mockups but are not sufficient historical evidence. Their access was blocked during this research pass; confirm release-specific metadata before ingestion. Inspect the Newberry Georgia download metadata and license before bundling (see docs/historical-research/issue-1-newberry-audit.md): the bundled deed is CC BY-NC-SA 2.5; the current download pages state "any lawful purpose, commercial or non-commercial, without licensing or permission fees" and that bundled out-of-date licenses can be ignored; the prior CC0 1.0 Universal [S6] claim is not supported by the audit and was corrected in Issue #1. Do not relicense as CC0. For any commercial distribution, obtain written confirmation from the Newberry that the "any lawful purpose" statement supersedes the bundled BY-NC-SA 2.5 deed. Use its historical Georgia snapshot and chronology to establish the 1942 geometry, with Census as the modern crosswalk and topology comparison. Independently check any disputed or ambiguous changes against the cited legal record (see docs/historical-research/issue-1-unresolved.md for the 39 counties with undated 1915-1952 boundary changes and the Floyd/Gordon and Marion/Talbot Census-only 1933/1934 changes).

Use `US-GA-13067` as Cobb's internal county identifier: a game namespace plus the current five-digit geographic crosswalk. The modern code is a software identifier, not a claim that the code existed in 1942. Display names and historical identities are separate from keys. Store effective dates and predecessor/successor links for future eras.

Build a county manifest with name, ID, geometry version, historical verification status, neighbors, movement edges, seat, source references, and starting owner. The initial game cannot ship with an omitted or inaccessible county. Political reassignment never alters the geometry.

**Avoid anachronisms:** No interstate highway overlay. Do not label Atlanta's airport with its modern name. Rickenbacker Field and the later Dobbins name require date-aware labels; S1 places the Dobbins naming in 1950, outside this campaign. The Metro Atlanta Coalition's name denotes a fictional organization, not a modern metropolitan statistical boundary. Do not show Lake Allatoona or other modern reservoirs in their present extent without verifying impoundment dates. On 1942-02-01, neither the Bell Aircraft plant nor the Marietta Army Air Field (later names: Cobb County AAF, Rickenbacker Field, Marietta AAF) had yet been established at the Marietta site; their timelines are documented in docs/historical-research/issue-3-unresolved.md U3-1 and U3-2 and are not part of the 1942-02-01 federal-facility roster (see docs/historical-research/issue-3-federal-facilities.md).

### 3.3 County statistics

Only treasury and materials are stockpiles. Workforce is an allocatable capacity, not a spendable currency. Administrative capacity and political meters constrain the player rather than forming additional inventory economies.

| Essential field | Range or unit | Strategic role |
|---|---|---|
| Population reference | People, source year, estimate flag | Historical context; informs initial workforce band |
| Workforce W | Capacity units, typically 3–30 at start | Shared among farms, industry, projects, services, and formations |
| Agriculture A; industry I | Levels 0–6 each | Income and materials; each staffed level uses 1 W |
| Commercial base B | 1–8 credits/month | Urban and trade activity, explicitly a balancing rank |
| Transport T; power E | Levels 0–3 each | Construction prerequisites, supply, industrial staffing ceiling |
| Service capacity H | Workforce units supported without crowding | Housing and local service pressure |
| Local support S | 0–100 | Revenue compliance, negotiation, unrest |
| Autonomy U; integration N | 0–100 each | Revenue share and durability of acquired control |
| Administrative offices O | Levels 0–2 | Adds capacity to the owning administration |
| Terrain and crossing tags | Categorical | Movement and defense |
| Facility state | Named project and lifecycle | Investment events and obligations |
| Authority relationships | Separate IDs and treaties | Owner, occupier, coalition, dependency, influence |

Unrest is derived as `100 − support`, shown with its causes. Urbanization is a descriptive band derived from commercial base and industrial concentration, rather than another independently managed meter. Workforce skill, age cohorts, electoral districts, detailed electricity generation, and crop-specific production remain extensions.

**Geographic identities:** Agriculture offers cheap recurring revenue and food contracts but is exposed to labor loss. Industry generates materials and high contract income but needs power, transport, and services. Mountain counties have slower movement and strong defense but fewer initial jobs. Coastal counties connect to outside trade and shipbuilding opportunities while facing long supply lines and dependence on national shipping demand.

## 4. Starting campaigns

### 4.1 Flagship: Cobb County, February 1, 1942

The player is the fictional **Cobb County Administrative Director**, seated in Marietta. They control Cobb's budget, public works, and one local security formation. They do not control Atlanta, federal procurement, or other coalition members.

**Metro Atlanta Coalition — entirely fictional:** Cobb, Fulton, DeKalb, Clayton, and Gwinnett. Fulton chairs the opening coalition. One county has one vote; this is an invented compact institution, not Georgia's historical county-unit electoral system. Internal administration, budgets, forces, and legal control remain with each member.

| Cobb opening parameter | Proposed game value |
|---|---:|
| Treasury / materials / debt | 120 credits / 20 units / 0 |
| Workforce / agriculture / industry / commercial base | 12 / 3 / 1 / 4 |
| Transport / power / service capacity / offices | 1 / 1 / 14 / 0 |
| Support / autonomy / integration | 65 / 0 / 100 |
| Federal Standing / war exhaustion | 70 / 0 |
| Active military | One security battalion, strength 100, morale 80 |
| Bell facility | Candidate site; no production or contract income |
| Administrative load / capacity | 1 / 6 |

The 12 W allocation is 3 agriculture, 1 industry, 2 essential services, 1 security formation, and 5 available. Construction can use 2 available W. The workforce figure is an abstraction, not 12,000 people or a historical labor count.

**Neighbor relationships:** Fulton +35 relations/55 trust; Cherokee +15/35; Bartow +5/25; Paulding +10/35; Douglas +10/30. Geographic adjacency must pass the map-data gate, including the Chattahoochee crossings toward Fulton. All these initial relationship numbers are scenario fiction. Bartow is affiliated with a northwestern bloc; Cherokee, Paulding, and Douglas initially retain independent administrations. Coalition membership with DeKalb, Clayton, and Gwinnett does not imply direct adjacency to Cobb.

**First three objectives:**

1. Keep three months of recurring expenditure in reserve while preparing Cobb's industrial application.
2. Fund the access works required for Bell and adopt a workforce services plan.
3. Sign one useful agreement with a neighboring administration and understand its limits.

**Threats:** Missing the industrial opportunity, overcrowding, a material shortage, and dependence on Fulton-controlled access. No forced opening invasion. **Opportunities:** Bell procurement, agriculture-to-industry transition, service cooperation with Fulton, and an access/development agreement with Paulding or Douglas.

The player may seek the coalition chair at the next annual election, propose charter changes, or leave with 90 days' notice. Leadership does not confer ownership. A member that is later integrated into another administration ceases to hold a separate coalition vote, preventing vote multiplication through controlled counties.

### 4.2 Any-county selection

All counties use February 1, 1942 and the same external history. Selecting Cobb reproduces the flagship state; disabling the tutorial does not change resources. A county may start independent, a coalition member, or—only when explicitly authored—a dependent. Version one assigns no unavoidable subordinate starts; dependency develops through play.

Show a searchable map and list, seat, affiliation, authority, economic strengths, workforce, adjacent actors, starting budget, estimated difficulty, and three county-specific opening objectives. Difficulty labels derive from visible factors: income coverage, nearby hostile strength, transport, and coalition security. They are advisory, not concealed AI bonuses.

| Start | Historical/geographic emphasis | Authored opening and challenge |
|---|---|---|
| Cobb / Marietta | Wartime aircraft investment [S1] | Coalition member; balanced tutorial; construction and housing pressure |
| Fulton / Atlanta | Rail, commercial, and administrative center [S1–S2] | Coalition chair; strong economy, competing member demands; moderate |
| Chatham / Savannah | Port and wartime shipbuilding [S2] | Savannah Trade League chair; contracts and coastal supply exposure; moderate |
| Muscogee / Columbus | Industrial activity and federal training presence [S2] | Chattahoochee Works Compact chair; federal facilities cannot become player troops; moderate |
| Dougherty / Albany | Southwestern agricultural-commercial role, detailed ranks pending research | Flint Agricultural Accord chair; build trade reach and retain farm labor; moderate-hard |
| Rabun / Clayton | Northeastern mountain geography, economic ranks pending research | Independent; defensive terrain, small workforce, slow expansion; hard |

Small counties receive a common constitutional minimum of 3 W, B of at least 1, and 40 opening credits. Every baseline start must admit a civilian allocation with recurring income at least 2 C above essential spending; adjust explicitly fictional agricultural or commercial ranks to meet that floor. Industry and starting armies still vary. Coalitions offer protection; materials can be purchased; basic defense is cheap; every county can host generic public-works and trade opportunities. A county does not need a Bell-like mega-project to win.

### 4.3 Starting regional powers

Use eight deliberately small fictional coalitions. These lists define initial membership; all other counties begin independent. This avoids implying eight historically real sovereign regions or filling a map with arbitrary equal-sized empires.

| Fictional coalition | Initial members; chair first | Priority |
|---|---|---|
| Metro Atlanta Coalition | Fulton, Cobb, DeKalb, Clayton, Gwinnett | Industrial infrastructure and coordination |
| Northwest Transport League | Floyd, Bartow, Gordon, Whitfield | Freight connections and mutual defense |
| Northeast Mutual Association | Clarke, Jackson, Madison, Oglethorpe | Local autonomy and exchange |
| Central Rail Compact | Bibb, Houston, Peach, Twiggs | Transport and federal logistics |
| Savannah Trade League | Chatham, Effingham, Bryan | Port access and construction |
| Coastal Production Association | Glynn, McIntosh, Camden | Shipbuilding and services |
| Chattahoochee Works Compact | Muscogee, Harris, Chattahoochee | Industry and defensive access |
| Flint Agricultural Accord | Dougherty, Lee, Mitchell, Worth | Agricultural trade and workforce retention |

Each list must be checked for usable route connectivity, not merely geographic proximity. There are 30 affiliated counties and 129 independent starts. Coalition transport access is granted by the opening charter; each member still owns its own counties and formations.

## 5. Core gameplay and progression

**Loop:** Inspect → fund development → negotiate → expand → integrate → respond to history → consolidate.

**First 10 minutes:** Pause; inspect Cobb, Fulton, and Paulding; read the authority badges; review the +8 monthly opening surplus; allocate construction labor; inspect Bell's future milestones; start one diplomatic action. No combat is required.

**Typical 30-minute session:** Review 2–6 game months, finish one improvement, resolve an event, negotiate or prosecute a limited objective, and inspect the resulting budget and integration pressures. The session closes with a compact “Since your last save” report.

**Early, 1942–43:** One to three directly administered counties, protection through treaties, selective development, a first coalition initiative. **Middle, 1944–45:** More connected territory or coalition leadership; pressure on staff, materials, national obligations, and worker services. **Late, 1946–48:** Diversify away from war contracts, integrate acquisitions, renew alliances, and establish a government capable of surviving federal review.

**Time:** Daily deterministic simulation, real calendar months. Speeds of 1, 4, and 12 simulated days per second; pause at important decisions, battles, notices, and construction completions by user preference. High speed advances more simulation steps, never changes the rules. The default is paused on campaign start and reload.

### Victory and defeat

Select a primary ambition at the start; it can be changed once before January 1944. Both major victories are available to every county.

| Ambition | Success requirements, all sustained for 6 month-end evaluations |
|---|---|
| Regional Union | At least 20 directly controlled counties, each with integration ≥70; connected administrative access; Standing ≥50; weighted support ≥60; no arrears; capacity at or above load |
| Commonwealth of Counties | Chair a coalition containing at least 35 distinct counties; at least 10 independent member administrations; cohesion ≥70; own support ≥60; Standing ≥50; all members at peace; no player arrears |

Dependencies and economically influenced counties do not count toward direct control. Coalition county totals count each geographic county once; dependent administrations cannot cast independent votes. Occupied enemy counties never count toward either victory.

Milestones at 3, 8, and 15 integrated counties—or 8, 18, and 28 coalition counties—give recognition cards and summaries, not free money. Maintain a separate civilian welfare record: service shortfalls, destroyed formations, public complaints resolved, and population displacement context. Avoid reducing human welfare to a conquest multiplier.

**Defeat:** Federal receivership; loss of every directly controlled county after a 90-day restoration period; or a full year unable to meet essential obligations after emergency financing is exhausted. Losing the capital alone relocates administration to another connected owned county and creates a one-month disruption. Poor support does not instantly end the game.

On December 31, 1948, a campaign with no major victory receives an honest “Ambition not achieved” evaluation and milestone score, rather than a fabricated victory. Optional sandbox continuation retains simulation and dynamic events, with a clear notice that authored historical coverage ends in 1948. Statewide domination is a sandbox goal, not a required first-release campaign target.

## 6. System specifications

All formulas in this section are proposed mechanics. Round displayed values to one decimal; keep fixed precision internally. A modifier that lasts several months begins at the next month boundary unless an event says otherwise. Effects with the same event ID do not stack.

### 6.1 Economy and development

**Purpose:** Make local investment, security, and expansion compete for the same limited capacity.

**Actions:** Staff farms and industry, queue a project, buy materials, change revenue effort, issue an emergency note, and accept or refuse optional contracts. Essential services and national obligations are visible baseline commitments.

**Resources:** Credits C, materials M, and workforce W. Credits represent public spending capacity, not dollars. Materials abstract scarce construction inputs rather than a detailed commodity market. Workforce units have no fixed person conversion.

For each directly controlled county:

- Staffed agriculture produces 4 C per level per month.
- Staffed industry produces 6 C and 2 M per level per month. Active industry cannot exceed `min(I, E + T)`.
- Commercial base contributes B credits. Population bands inform B during scenario preparation; population is not taxed a second time.
- Taxable revenue is `(4 × staffed A + 6 × staffed I + B) × compliance × autonomy share × revenue effort`.
- Compliance is `clamp(0.5 + support/100, 0.5, 1.0)`. Support 50 or greater pays full standard assessed revenue; higher support still benefits stability and diplomacy.
- Autonomy share is `1 − U/200`. At U=60, the common treasury receives 70%; the retained local share is abstracted into local administration and is not spendable a second time.
- Standard revenue effort is ×1.0; relief is ×0.9 with +1 monthly support; emergency effort is ×1.15 with −2 monthly support and expires after six months. Changing effort has a three-month cooldown.
- Contract income and treaty transfers appear as separate lines after tax. Contract payments follow fulfilled milestones; they are not magnified by tax settings.

**Illustrative Cobb monthly budget, before construction:**

| Revenue | C | Expenditure | C |
|---|---:|---|---:|
| Agriculture: 3 staffed levels | 12 | Essential services | 4 |
| Industry: 1 staffed level | 6 | County administration | 2 |
| Commerce | 4 | Security battalion maintenance | 3 |
| Bell contract | 0 | Coalition dues | 1 |
| | | National service obligation | 2 |
| | | Transport and power upkeep | 2 |
| **Total** | **22** | **Total** | **14** |
| **Monthly surplus** | **8** | | |

Opening materials grow by 2 M from industry plus 2 M from the administration's civilian allotment each month while Standing is at least 40. This is a fictional allocation, not a historical ration entitlement; it persists as a reconstruction allotment after 1945. It is once per independent administration, not per county. Dependencies retain their own allotment and cannot transfer it as tribute.

Services cost 2 C per required service W: 1 W in counties with total W≤6, otherwise 2 W. Administration costs 2 C per directly owned county plus 1 C per office level. Infrastructure upkeep is T+E credits. National service is 2 C per owned county through September 1945, then 1 C. Coalition dues are one C per voting administration; each member contributes to a separate common fund. Direct annexation removes the annexed actor's separate dues and allotment.

**Construction:** One project per county; 2 W reserved, costs charged up front, prerequisites checked before starting. Cancellation refunds 50% of the uncompleted fraction of credits and materials. No refund for completed work. Occupation pauses construction; recovery resumes it only after legal control and required workforce return.

| Project | Cost C/M | Duration | Prerequisite and result |
|---|---|---|---|
| Agricultural improvement | 24/4 | 60 days | A<6; +1 A; staffing still required |
| Industrial workshop | 45/12 | 90 days | E≥1, T≥1, I<6; +1 I |
| Transport improvement | 36/10 | 90 days | T<3; +1 T; construction changes capacity, not map adjacency |
| Power extension | 36/10 | 90 days | E<3; +1 E |
| Housing and public services | 30/6 | 60 days | +4 H; no automatic extra workforce |
| Administrative office | 30/6 | 60 days | O<2; +3 administrative capacity; +1 monthly upkeep |

Scenario projects such as Bell use event-specific costs and durations. A local project cannot add a bridge to an edge without a historically or fictionally documented construction record; newly built fictional crossings are labeled campaign outcomes.

**Materials market:** Buy at 3 C/M, maximum 6 M per month per administration. A valid outside trade route and Standing ≥40 are required; otherwise a neighbor may sell by treaty, limited by that seller's actual stock. No infinite local sale loop. Market purchase limits are administration-wide, and AI uses the same prices and caps. Material-shortage events adjust these limits visibly.

**Debt:** One 50 C emergency note, at most two outstanding. Each costs 1 C monthly interest and matures after 18 months. A first missed maturity restructures that note once for six months, adds 10 C principal and −5 Standing. A second missed maturity becomes arrears. No repeated refinancing loop. Net-negative treasury produces unpaid obligations; payment order is services, national service, debt interest, administration/infrastructure, forces, then voluntary dues. Unpaid forces lose 10 morale/month; unpaid services cost 3 support/month; no new projects or recruitment while arrears exist.

**Expansion effects:** An occupied county provides no taxes, materials, contracts, or recruitable W to its occupier. The legal owner also loses access to that county's revenue and capacity while occupied. Occupation costs the occupying administration 2 C/month and administrative load. After a cession, tax resumes with autonomy and support penalties; it does not become instantly productive at the former owner's rate.

**Feedback and AI:** Budget drawer shows actual last month, next-month forecast, temporary effects, and project completion changes. AI keeps a three-month essential-spending reserve before optional spending, prioritizes negative cashflow repair, and builds only when workforce and upkeep are affordable. Example: Cobb can buy a 36 C access project, but doing so reduces its reserve from 120 to 84 before monthly income; a second major commitment should be considered against the coming Bell obligation.

**Version-one boundary:** No commodity chains, private firm balance sheets, national stock market, or player-controlled monetary policy.

### 6.2 Population, support, and administration

**Purpose:** Give territorial growth a governance cost and make people more than an income number.

**Actions:** Adjust local autonomy, fund services, build administrative offices, sponsor integration, and answer public petitions. A county's population reference is informational; workforce movement is a coarse simulation layer, explicitly labeled as such.

**Capacity:** An administration has base capacity 6, plus 3 per functioning office level in accessible directly owned counties. Its load is 1 per home/fully integrated county, 3 per county with N<70, 2 per occupied enemy county, and 1 per dependent administration. A peaceful cession begins at N=30; a forced cession at N=0. Coalition membership alone adds no load. Offices and capacities belonging to independent allies do not become the chair's own resources.

An owned county is administratively accessible if it connects to the seat through owned counties or treaty-granted civil access. A disconnected owned county yields half its otherwise calculated taxes, cannot contribute office capacity, and cannot progress integration. Supply access and administrative access are distinct treaty flags.

When load exceeds capacity, each excess point reduces all owned counties' taxable revenue by 2%, capped at 30%, and makes integration progress zero. The penalty's cause is shown next to the treasury. An administration may still acquire territory above capacity; the forecast must show the resulting burden before acceptance.

**Local support:** At month end, apply +1 if services are staffed, W≤H, there are no arrears, and the county has had no combat or occupation that month; −2 if W>H; −3 if services are unstaffed. Add revenue-effort, event, and war-exhaustion effects. Support is capped 0–100. No positive peaceful-service recovery occurs in a county with unrest conditions above the threshold below.

Unrest ≥50 produces a petition with explicit causes. At unrest ≥70 for three month ends, the county enters noncooperation: half taxable revenue and integration paused. It leaves this state after support exceeds 40 for two month ends. Peaceful petitions are not enemy units. A secession demand can follow six months of noncooperation; mediation offers autonomy or release. Version one does not convert civilian dissent into endlessly spawning rebels.

**Integration:** One sponsored integration process per administration. Start for 15 C, then 2 C/month, N rises by 5 per month if support≥50, no occupation, accessible, and load≤capacity. At N≥70 it counts toward Regional Union; at N=100 integration is complete. Peaceful annexation therefore needs at least eight qualifying months to reach 70; forced annexation at least fourteen, and often longer to recover support. Autonomy starts at 60 after a peaceful union and 80 after a forced cession. Reducing autonomy by 10 costs 5 support and has a six-month cooldown. Increasing by 10 grants 3 support, also on that cooldown. Peace promises can establish a minimum autonomy for 24 months.

**Workforce:** Allocations may use increments of 0.5 W; a half-staffed productive level produces half its normal output. No independent births/deaths cohort model. At quarter end, a county with vacant productive slots, full services, support≥60, and at least 1 spare H may attract up to 0.5 W from one accessible willing county. A donor must retain 3 W and cannot lose more than 0.5 W per quarter. Rank donors by unallocated W, then lowest support, then county ID. Accept only if the receiving county's support is at least 10 higher. Internal moves conserve W; externally authored migration events explicitly identify an outside inflow. Military recruitment uses W from the recruiting county; there is no racial or gender productivity modifier.

**Historical injustices:** S2 and S9 document Georgia's segregation, disenfranchisement, unequal access to skilled work, and resistance to Black voting. S3 establishes the 1941 federal order against defense-employment discrimination, while also documenting weak enforcement. The game must not imply either that Jim Crow was absent or that the order instantly ended it.

Version one uses a sourced historical briefing, authored petitions and institutional responses, and permanent outcome records about access to training, housing, and benefits. Composite petitioners are labeled fictional. Broad support is an abstraction and never described as the consent of every community. Scenario integration uses an inclusive compact consultation, explicitly a fictional institution rather than Georgia's actual 1942 electoral process. Do not offer “segregation: +industry” policies, ethnic efficiency traits, or an optimal-oppression branch. Choices concern how to resource lawful access and address obstruction; inaction leaves documented harms and political obligations rather than erasing them.

AI prioritizes curing service shortfalls and overload before another cession. Example: three recently ceded counties consume 9 load before the home county is counted; one office is insufficient unless another county has integrated. The player sees exactly why further expansion is costly.

**Version-one boundary:** No full electoral simulation or demographic population groups. Historical and sensitivity review remain release requirements.

### 6.3 Diplomacy and coalitions

**Purpose:** Turn neighbors into useful partners without treating every agreement as annexation.

| Relationship | Budget and army authority | Transfer of legal control? |
|---|---|---|
| Direct control | Player controls that county's public budget and recruitment | Already held |
| Coalition membership | Each member keeps budget and forces; chair only controls delegated common decisions | No |
| Dependency | Dependent keeps its administration; pays 15% of positive tax income as tribute; overlord guarantees defense | No |
| Economic influence | An active agreement and visible influence score support future negotiations | No |
| Occupation | Occupier can hold and supply a force; no taxation or recruitment | No |

Relations R range −100 to +100; trust Q ranges 0–100. Relations describe current alignment; trust grows from kept commitments. Each administration can conduct two diplomatic actions simultaneously; proposing a treaty occupies a slot for 30 days. The target response and its reason list are visible immediately as a forecast; acceptance is evaluated at resolution. No diplomatic mana resource.

**Common acceptance rule:** Score = `0.4R + 0.3Q + shared benefit + security benefit − autonomy cost − threat penalty`. Shared benefit is 0/10/20 for no gain, a useful gain, or relief of an existing shortfall. Security benefit is 0/10/20 for no guarantee, matched defensive cover, or cover exceeding the strongest adjacent threat. Threat penalty is `0.3 × expansion alarm`, plus 20 if already fighting the proposer. Autonomy cost is 0 for access/nonaggression, 5 for trade, 15 for alliance/coalition, 35 for dependency, and 45 for integration. Show every term and current threshold.

Threshold is 25 for ordinary treaties and 35 for dependency or integration. Hard constraints below override scores. Any scripted exception is labeled, not hidden in the AI.

| Action | Core rules |
|---|---|
| Improve relations | 5 C, 30 days; +10 R; one per pair each 90 days; peaceful cap +60 from this action |
| Nonaggression | 24 months; breaking costs −25 Q and adds a disputed-claim trigger |
| Civil or military access | Separate grants; 12 months; revocation requires 30 days; forces evacuate on expiration |
| Economic agreement | 12 months; an affordable actual transfer or joint market access; route required; trust +1 per fulfilled month |
| Alliance | Mutual defensive requests; each ally chooses whether to honor, with refusal costing 20 Q |
| Coalition membership | Requires charter acceptance and member vote; no automatic merge of territory |
| Dependency | Requires explicit consent or peace term; tribute caps at positive taxable income; cannot recruit dependent W |
| Negotiated integration | R≥60, Q≥60, economic influence≥40, target support≥60, peace, and a 12-month economic agreement history; independent target must explicitly accept |
| Release administration | Transfer selected owned counties peacefully; their treasury starts with a disclosed player-funded settlement, no free creation funds |

Economic influence is bilateral, 0–100: +3 per month of a fulfilled economic agreement, +4 per completed joint project; −5 per month without an agreement. It does not create control or prevent a third-party agreement. At most one monthly gain per pair; repeated tiny transfers cannot farm influence.

On annexation, the target's remaining treasury, materials, debt, and local forces transfer with its counties, shown before signing. Treaty obligations are inherited unless a counterparty agrees otherwise. Direct annexation of a coalition member requires that member's consent and the coalition's 2/3 approval; it cannot be used to steal a member in secret.

**Coalition constitution:** One vote per independent member administration. Ordinary projects and admission require a strict majority; charter reform, collective offensive action, and integration of a member require two-thirds rounded up. A member must consent to surrender its own legal control regardless of majority. Ties retain the status quo. Defensive help is requested immediately but remains a member decision; a chair cannot silently command allied forces.

The common fund receives dues and pays only approved common projects. The chair proposes one common project at a time; a project is funded only after the specified contributions are actually in the fund. The chair may request a formation be delegated for one named war; its owner must approve and pays maintenance unless the resolution says otherwise. Delegation ends with peace.

Annual chair election on January 1, beginning in 1943. Each member votes for the candidate with highest R + Q + 10 if that candidate fulfilled the last common project − 20 if it broke a charter promise; ties favor the incumbent, then a stable ID. The human chooses their own ballot. Chair candidates need support≥50 and no arrears. No historical officeholder election is implied.

**Cohesion:** Start 65. Each month +1 when all dues are current and no charter dispute exists; −2 per unpaid member, capped at −6; −5 for a failed common project deadline; −10 for an unapproved offensive war by a member. Caps 0–100. Below 40, recruitment of new members stops. Below 25 for three months, members may leave without the normal notice penalty. A paid, peaceful coalition can recover naturally.

**Expansion alarm:** Actor-to-actor 0–100; +10 per peacefully integrated county, +20 per forced cession among administrations within two movement edges; +25 for treaty breach. Decays 2 per peaceful compliant month. High-alarm actors seek defensive agreements and reject dependence. This limits snowballing without hidden AI income.

**Example:** Paulding may accept development assistance while rejecting integration because trust and treaty duration are insufficient. The UI says “Economic agreement: likely accepted; integration unavailable—12 months of cooperation required.”

**Version-one boundary:** Fixed compact constitutions with a small number of reforms; no parliamentary seats, secret diplomacy, or detailed party politics.

### 6.4 Military conflict, occupation, and peace

**Purpose:** Provide an understandable high-cost route to territorial change, resolved on the county map.

**Recruitment:** A unit needs an owned, unoccupied county with support≥40, available W, paid services, and an affordable maintenance forecast. Regional assigned military W cannot exceed the greater of 1 W or 30% of accessible W. The 1 W floor lets a small administration field one basic formation, though it must still pay for it. Each county must retain at least 2 civilian W. Facilities belonging to Washington never supply player units. No historical unit names or personnel counts are implied.

| Formation | C/M; build time; W | Monthly upkeep | Role |
|---|---|---:|---|
| Security battalion | 20/4; 30 days; 1 W | 3 C | Power 10, local defense, ordinary movement |
| Mobile regiment | 35/10; 45 days; 1.5 W | 5 C | Power 14, faster travel; needs T≥2 and E≥1 at recruitment |
| Engineer company | 25/8; 30 days; 0.5 W | 3 C | Power 4; improves crossing and occupation; one support benefit per stack |

Units have strength and morale 0–100. Recruitment produces strength 100, morale 80. The maximum effective stack contains three line formations and one engineer; excess units wait in reserve and do not stack power endlessly.

**Movement:** Default one edge takes 7 days; mobile formations 4. Entering mountains adds 4 days, wetlands 3, and a river crossing 2. Both endpoint T≥2 subtracts 1 day. Engineer support removes one crossing day. Minimum 2 days per edge. A mixed stack uses its slowest formation. Entry requires ownership, access, or war with the controlling administration; a hostile occupier also blocks peaceful passage. Paths through neutral counties never silently grant access. Order cancellations take effect at the next reached county; right-click previews the path before commitment.

**Supply:** Trace at most three movement edges to an accessible owned supply county with T≥1 and staffed services. Military-access allies may permit transit but are not automatic supply sources. A treaty can explicitly add a shared supply depot. Federal facilities are excluded. Paths cannot pass through hostile occupied counties. Fully supplied stacks use multiplier 1; unsupplied stacks use 0.65, lose 2 strength/day after three days, and cannot reinforce. UI shows the exact failing edge.

**Combat:** On opposing forces meeting, movement stops and a battle begins. Fixed daily phases, both losses simultaneous. Effective power = sum of participating base power × strength fraction × morale fraction × supply multiplier × terrain/crossing modifier. Defender modifier is ×1.2 in Piedmont, ×1.35 in mountains, ×1.15 in wetlands, and ×1.0 in coastal plain. Attacker crossing modifier is ×0.85, or ×0.95 with an engineer. There is no dice roll in version one.

Each side suffers `max(1, 6 × enemy power / max(own power, 1))` total strength loss per day, capped at remaining participating strength and divided proportionally among participating formations. It also loses `3 + strength loss/2` morale per participating formation, capped at 20 daily. Reserves enter only between daily phases when a slot becomes vacant. A side retreats when average line morale<25 or line strength is below 30% of its strength at battle entry. Equal thresholds produce mutual retreat and no immediate occupation progress.

Retreat chooses the nearest legal, supplied, non-hostile county, preferring higher T then stable ID. Retreat takes one movement edge time; retreating forces cannot attack and cannot be retargeted by a new move order. If no retreat route exists, they surrender. Units at zero strength are removed. Losing a unit costs its owner 2 war exhaustion; the assigned W stays unavailable until demobilization accounting at peace. Retired surviving units return their assigned W immediately at a friendly supplied county; destroyed units return 50% after six months as an explicit recovery abstraction, not an assertion about real casualty outcomes.

**Reinforcement:** In supplied, friendly, unoccupied territory outside combat, a formation can recover 10 strength/month for 2 C and 1 M. No reinforcement while arrears exist. Morale recovers 10/month under the same conditions without that material charge.

**Occupation:** After enemy formations retreat, a supplied line formation must hold the county for 30 days; engineer support reduces this to 20. Occupation advances only with hostile forces absent. Leaving before completion erases progress after seven days. Completed occupation persists until enemy recapture or peace; a lone ungarrisoned county is recaptured after seven uncontested days by the legal owner's line formation. Garrisoning requires a real formation; there is no free occupation force. Occupation uses hatching over the legal owner's color. Battles alone never change legal control.

**War goals:** Enforce an existing access agreement, release a dependent, or settle an adjacent administrative claim. An access/dependency dispute requires an actual breached treaty. An adjacent claim can be petitioned for 15 C and 90 days; commission registration requires Standing≥40 and target-county support<50 or a target breach. Claims are visibly fictional legal instruments, not historical county entitlements. The player can still choose an unregistered attack with the federal penalties.

**War exhaustion:** Each active-war month adds 3; each county occupied by an enemy adds 2, capped at 10 total gain per month. War exhaustion is 0–100; at ≥40 it subtracts 1 local support/month, at ≥70 subtracts 3. Peace reduces it 5/month. Coalition allies maintain their own exhaustion and can request separate peace.

**War score:** From the aggressor's perspective, −100 to +100. County occupation contributes up to ±50 in proportion to each side's prewar directly controlled county count; holding the stated war-goal county adds ±25; net battle results add ±5 per victory, capped ±25. Liberation/access goals identify a specific county when registered. Score is not a currency that transfers ownership.

**Settlement costs:** Access enforcement 10; reparations 10–30 at 2 C per point, capped at the payer's available treasury; release dependency 30; county cession `20 + 2I + B`, maximum two counties per war, only occupied claimed counties contiguous through legal access to the recipient. Dependency terms cost 40 and require the target's seat occupied. No county containing a protected facility can transfer ownership of that facility itself.

A normal negotiated demand is accepted if total cost≤positive war score and the loser has exhaustion≥40 or its seat is occupied. Otherwise it may offer a lower-cost settlement. White peace becomes mutually acceptable after 90 days without a battle and no occupied counties. At day 180, the commission forces peace: the higher-score side may select valid terms costing at most half its positive score; ties impose status quo. The settlement cannot ignore the two-county limit. Units evacuate to the nearest legal county; access is temporarily granted for evacuation only, not renewed attack.

All settlements create a 24-month bilateral truce. Forced cessions begin with support reduced by 20, N=0, U=80, and minimum autonomy 60 for 24 months. Debt follows the ceded county's documented share where one was attached to a project; other debt stays with the issuing administration. Military formations do not transfer through a forced county cession unless a separate dependency agreement delegates them.

**Feedback and AI:** Show forecast strength, terrain, supply, upkeep, likely daily losses, federal costs, and potential settlement capacity. AI attacks only when effective power is at least 1.3 times estimated opposing accessible power, supply reaches the goal, and it can fund four war months. It retreats rather than feeding isolated units into impossible battles. All rules apply equally to the player.

**Example:** Capturing an adjacent county yields occupation hatching and war score. The player must negotiate its cession and then fund at least fourteen qualifying integration months. If the commission forces peace before occupation finishes, the claim produces no territorial award.

**Version-one boundary:** No tactical battlefield, air/naval combat, military technology tree, or civilian targeting.

### 6.5 AI and deterministic resolution

**Purpose:** Produce opponents and partners with legible goals and the same constraints as the player.

| AI profile | Priority order | Typical communicated reason |
|---|---|---|
| Industrial | Services → staffing → materials → safe contracts → protective treaties | “Power and housing must support another workshop.” |
| Agricultural | Retain productive labor → secure buyer/access → services → protection | “This agreement solves our transport shortfall.” |
| Small defensive | Solvency → nonaggression → coalition guarantee → inexpensive defense | “Your guarantee covers our strongest neighbor.” |
| Expansionist | Administration → lawful claim → supplied local superiority → integration | “Our current administrative load prevents another cession.” |
| Commercial/transport | Stable routes → access treaties → infrastructure → mediation | “War would break two existing trade routes.” |

AI evaluates county allocations monthly, diplomacy weekly, and military orders daily. Each administration takes at most one strategic commitment per week to prevent unmanageable proposal spam. Cash reserves, administrative load, treaty gates, and acceptance scores are hard limits. Difficulty changes deliberation breadth and willingness to form defensive combinations; it does not secretly create money, workforce, or materials. Optional player handicaps must be disclosed.

Resolve daily in a fixed order: expire treaties and apply external events; resolve dated decisions; finish construction/recruitment; progress movements; resolve simultaneous battles; progress occupation; assess standing notices. At month end: settle completed-month budgets and arrears; apply support/cohesion/exhaustion; update integration/influence; then evaluate victory. Quarter-end migration follows monthly administration. Ties use stable IDs. A seed selects permitted dynamic-event timing and AI tie preferences; it never changes an already committed result upon reload. Saves record the ruleset version, seed, date, event ledger, obligations, queues, and ongoing battles.

## 7. Historical event framework

### 7.1 Rules and continuity

**External historical events** retain their dates because the local Georgia scenario cannot change the world war. **Conditional historical events** retain historical context but require valid local conditions; Bell does not magically operate in an occupied, disconnected Cobb. **Dynamic alternate-history events** are explicitly generated by the simulation.

Historical calendar cards are distinct from player response windows. The player cannot vote to undo Japan's surrender or the G.I. Bill. A decision changes preparation, assistance, or local consequences. A missed opportunity remains in the history ledger with its cause.

If a known development fails its prerequisites, record “Historical development did not occur here in this campaign.” Retry only where the event specifies a window. Do not relabel a hypothetical factory in another county “the historical Bell plant.” If a facility is blocked, other counties can receive a generic, fictional contract opportunity with its own ID.

All numbers below are gameplay values. Changes to support, trust, Standing, and cohesion are points. Stock costs occur immediately. A choice cannot spend unavailable funds; explain the shortfall and preserve an affordable alternative. Decisions pause by default and have a 30-day response window unless specified. An unanswered card takes its labeled no-spend option; it never accepts debt or war automatically. Human decisions can queue; the economy only resumes when the player unpauses. AI selects under the same affordability checks.

### 7.2 Sample event catalog

#### E01 — Marietta selected for aircraft investment

Issue #3 research caveat: cached NGE evidence dates the Bell selection announcement to 19 February 1942 (after the 1942-02-01 reference date) and the groundbreaking to 2 April 1942; see docs/historical-research/issue-3-unresolved.md U3-2.

- **Class/basis:** Conditional historical, February 19, 1942 selection [S1]; local choices are fictional.
- **Window/preconditions:** February 19; Cobb exists and is not occupied. If occupied, offer one rescheduled review after liberation, before June 30, 1942, explicitly a counterfactual review.
- **Affected territories:** Cobb; notification to Metro Atlanta Coalition members.
- **Player text:** “The War Department has selected Marietta for an aircraft plant. Our immediate responsibilities concern access, services, and local preparation. Production has not begun.”
- **Choice A, accept enabling obligations:** Pay 20 C/4 M; pledge access and liaison support; unlock E02. No production income. Deadline June 30 to have T≥2 or a transport project underway.
- **Choice B, request delay (no-spend default):** No immediate cost; a single 90-day review. If requirements remain unmet then, cancel the local opportunity and record the divergence. No instant factory somewhere else.
- **Long term:** A leads to construction, workforce, and postwar exposure. B preserves reserves but may lose the contract chain.
- **AI:** Accept if cash remaining covers two essential-spending months and a viable transport plan exists; otherwise delay.
- **Repeat/cooldown:** Once per campaign, one permitted review; no repeated grants.

#### E02 — The construction commitment

- **Class/basis:** Conditional historical; April 2, 1942 groundbreaking and approximately thirteen-month main-building construction [S1].
- **Window/preconditions:** April 2–June 30, 1942; E01 accepted, Cobb unoccupied, transport funded or T≥2, Standing≥40.
- **Affected:** Cobb; Fulton receives a freight-demand notification.
- **Player text:** “Construction brings an immediate obligation to coordinate access and local services, well before the plant produces aircraft.”
- **A, fund the local commitment:** 24 C/8 M; reserve 1 W as liaison during a 395-day federal construction timeline; advance facility to Construction.
- **B, postpone (default):** No cost; postpone up to 60 days within the window. Missing the last date closes the chain.
- **Long term:** National construction is a protected facility milestone, separate from the county's single local project slot. The reserved liaison W is still unavailable for farms or armies. Occupation pauses local milestones and the opening date; losing them does not destroy a federal asset.
- **AI:** Fund when service staffing and 1 W remain available; otherwise postpone once.
- **Repeat:** Once; at most one postponement.

#### E03 — Production begins

- **Class/basis:** Conditional historical; manufacturing began in spring 1943 [S1]. The exact simulated commissioning date is a design result.
- **Window/preconditions:** From May 1943 through June 1945; 395 construction days completed, T≥2, E≥1, Standing≥40, Cobb unoccupied, and military/civil routes usable. Never fire before 1943.
- **Affected:** Cobb and its active freight partners.
- **Player text:** “The aircraft plant can begin work. Federal orders promise income, but production needs staff and dependable services.”
- **A, full local support:** Reserve 3 W, earn 20 C/month of conditional contract revenue; public support +3 once. No player aircraft or materials output.
- **B, limited support (no-spend default):** Reserve 1 W if available, earn 6 C/month; otherwise remain Ready without payment. The player may change staffing once every 90 days.
- **Long term:** Payments require operating prerequisites at each month end. E11 removes them in 1945. Workers are not automatically fired from the county economy when the federal contract ends; their capacity returns for other assignments.
- **AI:** Full support only if services remain funded and W≤H; otherwise limited.
- **Repeat:** Commissioning once; staffing is a management action, not a recurring event reward.

#### E04 — Workers arrive faster than services

- **Class/basis:** Dynamic event inspired by documented Bell-era employment and regional change [S1–S2]; this particular influx is fictional.
- **Window/preconditions:** Cobb in Construction for ≥180 days or Operating; has never received this event. Other counties use a generic version after an industrial increase of two levels.
- **Affected:** Cobb; regional partners see a service demand.
- **Player text:** “New arrivals are looking for work and a place to live. Public services are struggling to keep pace.”
- **Automatic effect:** +3 W from an explicitly outside-state inflow; compare new W with H immediately. This changes abstract workforce, not a claimed historical headcount.
- **A, temporary accommodation and service desks:** 12 C now; suppress the overcrowding support penalty for three months, allowing time to build permanent capacity.
- **B, use existing services (default):** No payment; normal W>H penalties apply. Log unresolved access and housing complaints.
- **Long term:** Housing projects raise H permanently; temporary relief does not. The player may secure cross-border services through an agreement rather than annexation.
- **AI:** Choose A when W>H and affordable; prioritize housing next.
- **Repeat:** Once for Cobb; generic version once per county, not repeated for rebuilding the same workshop.

#### E05 — An Atlanta-area transport agreement

- **Class/basis:** Dynamic alternate history; real regional rail/access importance provides context [S1].
- **Window/preconditions:** 1942–45; Cobb has a transport project or Bell construction, Fulton is at peace with Cobb, and both have an accessible route.
- **Affected:** Cobb and Fulton, each under its current controller.
- **Player text:** “Freight movements are testing our shared routes. Fulton proposes a joint schedule and maintenance arrangement.”
- **A, jointly fund coordination:** Each party explicitly accepts and pays 8 C; +10 bilateral R and +5 Q; a 12-month economic agreement begins, granting civil access but no military access. It uses the standard influence gain.
- **B, operate separately (default):** No cost, no relationship penalty; existing treaties continue.
- **Long term:** Cooperation can qualify the relationship for future integration discussions, but never satisfies the target's consent requirement by itself.
- **AI:** Accept if it solves a route need and preserves two months of essential spending.
- **Repeat:** Once per pair; normal treaty renewal thereafter has no repeat bonus.

#### E06 — Materials under rationing pressure

- **Class/basis:** External wartime pressure with abstracted timing and effects; general rationing is documented [S8]; precise local ration rules remain a source-verification item [Q4].
- **Window/preconditions:** Scenario date July 1, 1942, explicitly an authored pressure window rather than the date all rationing began; all administrations.
- **Affected:** Statewide, especially construction-heavy counties.
- **Player text:** “National priorities are tightening civilian access to scarce materials. Our remaining projects need a revised schedule.”
- **Automatic effect:** Outside-market purchase limit falls from 6 to 3 M/month for six months.
- **A, pooled procurement:** Pay 6 C; receive a one-time 2 M allocation. This is a limited scenario allocation, not unrestricted trading profit.
- **B, reschedule purchases (default):** No cost; accept the lower cap.
- **Long term:** Existing paid construction is not retroactively charged more. Unfunded plans may be delayed; diplomacy can source actual spare stocks.
- **AI:** Choose A only for a project with a material shortfall and sufficient reserve.
- **Repeat:** Once; shortage expires automatically. Future shortages use a separate dynamic event with a 12-month cooldown.

#### E07 — Farm labor and national mobilization

- **Class/basis:** Conditional historical pressure; wartime farm labor loss and defense employment are documented [S2].
- **Window/preconditions:** 1942–44, quarterly check; A≥3 and fewer than 1 unassigned W; active national mobilization.
- **Affected:** Qualifying agricultural county.
- **Player text:** “Farm employers face competing demands from national service and higher-paid industrial work.”
- **A, support seasonal coordination:** Pay 8 C; preserve current productive assignments for six months; no extra W is created.
- **B, release capacity for national obligations (default):** Reserve 1 W for six months; automatically reduce the lowest-priority farm assignment if necessary, show lost revenue; +3 Standing.
- **Long term:** The reserved W returns after six months. This is a temporary capacity abstraction, not a particular conscription order or an ethnicity-based labor pool.
- **AI:** A when farm income is required to meet essentials; B when reserves and alternative jobs permit it.
- **Repeat:** Maximum twice per county, with 18 months between occurrences; never overlap reservations.

#### E08 — Access to defense training

- **Class/basis:** Conditional historical context; Executive Order 8802 and unequal local employment access [S1–S3]. Petition and numerical outcomes are fictional.
- **Window/preconditions:** 1942–45; first operating defense contract in the administration.
- **Affected:** Contract county; relevant training/service locations.
- **Player text:** “Applicants report barriers to training and skilled employment. Federal policy prohibits defense-employment discrimination, but local implementation remains contested.”
- **A, fund access and complaint handling:** Pay 12 C; +4 support and +3 Standing; record staffed training access and grievance review.
- **B, phase implementation through existing offices (default):** No immediate payment; reserve 0.5 W for six months; +2 support at completion. If capacity is unavailable, enter a three-month implementation deadline and a visible unresolved complaint, not a fictitious success.
- **Long term:** A missed deadline brings −4 support and a new remedial notice; the harms remain in the record. A compliant contract does not end segregation across the county or state.
- **AI:** Choose A with reserves; otherwise B and prioritize its staffing. Never select discrimination for a production advantage.
- **Repeat:** Once per administration's first contract; unresolved notices reopen the same case without repeat rewards.

#### E09 — Coastal shipbuilding opportunity

- **Class/basis:** Conditional historical; Savannah and Brunswick wartime shipbuilding [S2]. Local funding rules are fictional.
- **Window/preconditions:** 1942–43; Chatham or Glynn, unoccupied, T≥1, E≥1, Standing≥40.
- **Affected:** Qualifying coastal county and its service partners.
- **Player text:** “A shipbuilding contract could expand local employment. Transport and services must be ready for the demand.”
- **A, support the contract:** 30 C/10 M; reserve 1 W for 180 days of preparation, then 2 W for operation; earn 12 C/month while national wartime demand remains active.
- **B, emphasize civilian commerce (default):** No cost or contract. The standard commercial economy continues; no compensating free bonus.
- **Long term:** On commissioning, use the generic E04-type service-pressure event if eligible. E11 ends the wartime revenue. Dates and yards must be individually verified before historical labels name a specific contract.
- **AI:** Accept if it can staff services and sustain the preparation interval.
- **Repeat:** One authored opportunity per county; no player-built navy results.

#### E10 — Preparing for returning veterans

- **Class/basis:** External historical law, June 22, 1944, with conditional local follow-up [S4].
- **Window/preconditions:** June 22, 1944; all administrations receive a news card, then an optional local response.
- **Affected:** Owned counties with offices or training facilities.
- **Player text:** “The G.I. Bill provides federal readjustment benefits. Local assistance can help eligible veterans navigate education and housing systems, where access remains unequal.”
- **A, establish assistance desks:** 10 C per administration; set PreparedForReturn; when E13 occurs, its service response costs 6 C less.
- **B, rely on existing administration (default):** No cost; no preparation discount.
- **Long term:** Record benefit-access work separately from general support. Do not suggest that passage guaranteed equal benefits; S4 documents exclusion and lending discrimination.
- **AI:** Prepare if two months of essential expenditure remain and at least one staffed office exists.
- **Repeat:** Once; the federal law is not conditional on a player's payment.

#### E11 — The war ends; orders are withdrawn

- **Class/basis:** External historical surrender, September 2, 1945 [S5]; Bell cancellation and layoffs [S1]. Using September month-end as the accounting transition is an abstraction.
- **Window/preconditions:** September 2, 1945 news; contract changes take effect October 1. Applies even to a player in a local war.
- **Affected:** All Georgia; strongest effects in Cobb and coastal contract counties.
- **Player text:** “Japan has formally surrendered. The national war has ended, but local finances must adjust as wartime contracts are canceled.”
- **Automatic effect:** Remove Bell and shipbuilding wartime payments on October 1; release reserved contract W; reduce national service cost to 1 C per owned county. Bell becomes Federally mothballed, not a player-owned workshop.
- **A, finance immediate transition assistance:** 12 C per affected contract county; prevent a temporary −4 support effect otherwise applied at cancellation.
- **B, preserve cash (default):** No payment; −4 support in affected counties; no invented countywide economic collapse. Existing ordinary jobs and income continue.
- **Long term:** Unlock E12, expose a forecast of recurring income without contracts, and retain the historical note that Marietta avoided severe postwar unemployment [S1].
- **AI:** A if it prevents support<50 and is affordable; otherwise preserve essential services.
- **Repeat:** Once. Local wars do not alter the external date.

#### E12 — What remains after Bell?

- **Class/basis:** Conditional historical context and alternate-history development choice; plant closure and later 1951 reopening are documented [S1].
- **Window/preconditions:** October 1945–December 1946; Cobb's Bell chain operated or reached Construction.
- **Affected:** Cobb and economic partners.
- **Player text:** “The federal plant is no longer producing. Skills and local infrastructure remain, but our administration cannot simply take ownership of the facility.”
- **A, diversify local workshops:** Unlock a 40 C/10 M, 90-day local project using 2 W and the standard county project slot; completion adds 1 I to the civilian economy if I<6 and power/transport support it. This is not conversion of the Bell building.
- **B, preserve reserves and seek agreements (default):** No cost; retain existing infrastructure and pursue ordinary development/trade actions.
- **Long term:** Diversification has normal staffing and maintenance implications. No automatic Lockheed event before the campaign ends in 1948; its real 1951 arrival lies outside scope.
- **AI:** A if a productive staffing slot and reserve are available; B otherwise.
- **Repeat:** Once; if declined, ordinary workshops remain available at ordinary prices.

#### E13 — Returning veterans and housing access

- **Class/basis:** Conditional postwar pressure with authored local case; readjustment and unequal benefit access [S2, S4].
- **Window/preconditions:** 1945–47; the first quarter after E11; county with active jobs and H−W<2.
- **Affected:** Qualifying county; one per administration in this event variant.
- **Player text:** “Returning residents need help finding housing and using the benefits available to them. Existing barriers mean assistance must reach more than those already well connected.”
- **A, targeted assistance and service coordination:** 14 C, or 8 C with PreparedForReturn; +3 support; suspend crowding penalties for three months and log an access program.
- **B, allocate existing staff (default):** Reserve 0.5 W for six months; prevent the event's additional −2 support if staffed. Ordinary crowding still applies. If no staff are available, the −2 support occurs and the unresolved case remains visible.
- **Long term:** No automatic new population or W; the event concerns existing simulated residents and returning-person context. Permanent housing requires construction.
- **AI:** Use cash when labor is scarce, staff when treasury is constrained.
- **Repeat:** Once per administration, no repeated benefit discount.

#### E14 — Regional authority after mobilization

- **Class/basis:** Entirely fictional compact renewal.
- **Window/preconditions:** November 1, 1945; all administrations.
- **Affected:** Statewide political arrangements.
- **Player text:** “The Compact Commission extends regional administration through 1948, subject to renewed financial and public-service obligations.”
- **A, file a consolidated recovery plan:** 10 C; +5 Standing; add a review reminder for any capacity overload.
- **B, retain the existing filing (default):** No cost; no Standing bonus. Current treaties remain valid under the scenario renewal.
- **Long term:** Explains why compacts survive the end of the national war. It does not claim an actual 1945 constitutional measure existed.
- **AI:** A if Standing<60 and affordable; otherwise B.
- **Repeat:** Once.

#### E15 — Petition for a common administration

- **Class/basis:** Dynamic alternate history.
- **Window/preconditions:** 1943–48; neighboring independent target meets all integration gates in section 6.3; target willingness score qualifies.
- **Affected:** Proposer and target counties.
- **Player text:** “Our partner is willing to discuss a common administration, with protected local autonomy and a funded transition.”
- **A, open a binding union offer:** Reserve 20 C for transition services; request consent and any required coalition vote. On acceptance, spend that reserve on the transition (it does not enter the target treasury), transfer the target's remaining stocks/debts, and start N=30, U=60; target's support changes by +3. On rejection, release the reserve. Preview acceptance and vote requirements clearly.
- **B, keep the partnership (default):** No cost or trust penalty; economic agreements continue.
- **Long term:** The new territory adds load; integration funding is a separate 15 C start plus 2 C/month. No instant victory credit.
- **AI:** A only when projected administrative load≤capacity and reserve≥three essential-spending months; otherwise B.
- **Repeat:** Same target may reconsider after 12 months; no repeat transfer bonus; cannot fire for an already integrated actor.

#### E16 — Members demand a charter reckoning

- **Class/basis:** Dynamic alternate history.
- **Window/preconditions:** Any date; coalition cohesion<40 for two month ends and at least three independent members.
- **Affected:** Coalition and its chair.
- **Player text:** “Members want a clear account of common spending and assurances that the chair will respect their authority.”
- **A, audit and renegotiate:** Chair pays 8 C; freeze new common projects for 60 days; at completion +10 cohesion if dues are current and no new charter breach occurred.
- **B, make the case under the existing charter (default):** No cost; hold a confidence vote after 30 days using chair-election preferences. If the chair loses, leadership changes without changing county ownership.
- **Long term:** Audit bonuses cannot offset continuing unpaid dues forever; member departure follows ordinary low-cohesion rules.
- **AI:** A when underlying dues problems are curable; B when it expects to retain confidence or cannot afford an audit.
- **Repeat:** Twelve-month coalition cooldown; one active charter case at a time.

### 7.3 Connected industrial chain

The required chain is E01 selection → E02 construction → E04 workforce/services pressure → E03 operation → E11 contract withdrawal → E12 civilian diversification. E05 transport, E08 training access, and E10/E13 readjustment intersect it when their prerequisites hold. E04 can happen during construction; the state machine must not require production first. Losing a link changes the later story: a plant that never operated does not generate the same layoff narrative or income loss.

The historical “What happened” panel and the campaign “What you did” panel remain separate throughout. That separation is particularly important when Cobb is AI-controlled in an any-county campaign.

## 8. Visual and UX design

### 8.1 Art direction

A 1940s strategic atlas on a government planning table: warm paper, precise ink, understated institutional stamps, and restrained cartographic texture. Let the map occupy the largest visual area. Avoid a page of equally weighted analytics cards, decorative medieval scrolls, or reproduction of Europa Universalis interface arrangements.

| Token | Starting direction | Use |
|---|---|---|
| Paper | #EEE7D8 | Map base and large panel surfaces |
| Ink | #252A2D | Text, main boundaries, icons |
| Atlantic | #527887 | Water and navigational context |
| Selection amber | #B5802B | Selection brackets and active action accents, not body text on paper |
| Alert | #8A3F35 | Warning symbols paired with text |
| Coalition colors | Muted teal, slate, ochre, olive, clay, plum | Identity fills, never the sole authority cue |

These are art-direction tokens, not verified contrast combinations. Validate text and controls against WCAG AA during mockups. Paper texture must not reduce contrast or obstruct small counties.

**Typography:** Use a restrained serif for titles and major geographic labels and a highly readable sans-serif for interface text. Prototype with locally available Georgia or DejaVu Serif and the system sans-serif stack; bundle an approved open-font pair such as Source Serif 4 and Source Sans 3 for a consistent release, including their licenses. Figures use tabular numerals. Decorative typewriter text is limited to short archival annotations. Normal interface text is 14–16 px, never microscopic archival lettering.

**Borders and symbols:** County boundaries 1 px; borders between legal administrations 2.5 px; coalition boundaries use a distinct dashed outer stroke in coalition mode. Selection uses a double stroke with four corner brackets, not merely a bright fill. Hover uses a subtle stipple and county label. Occupation uses diagonal hatching and an occupying-force badge above the unchanged owner fill. Contested battle counties add crossed-marker symbols; integration uses a progress-ring symbol and numeric status.

Cities use a filled circle, county seats a ringed circle, industry a factory silhouette, agriculture a grain symbol, rail junctions a junction symbol, and protected federal facilities a square with an “F” badge. Army counters use rectangle silhouettes with unit-type icons, strength bars, and owner initials. No historical faction insignia are required.

Rivers are quiet blue lines; verified rail corridors are thin parallel charcoal strokes and major roads single thin strokes. Route importance must survive grayscale. Terrain is a low-contrast hatch/relief layer, not a dramatic mountain model that hides county borders.

**Zoom behavior:** At state scale, show coalition/administration labels and at most 12 major settlements; suppress most facilities. At regional scale, prioritize selected and adjacent county labels, with a hard cap of 45 text labels. At county scale, show seats, facilities, and route detail, capped at 70 labels. Collision resolution prioritizes selection, alert, army, seat, then county name. A search/list route always reaches a small county even if its label is suppressed.

### 8.2 Map modes

| Mode | Initial release? | Primary question |
|---|---|---|
| Political control | Yes, default | Who legally governs this county, and is it occupied? |
| Coalitions and diplomacy | Yes | Who belongs together, and what access do I have? |
| Economy and industry | Yes | Where are income, productive jobs, and material sources? |
| Infrastructure and supply | Yes | Which routes work, and why is a force unsupplied? |
| Unrest and integration | Yes | Where is government overstretched or losing support? |
| Terrain | Yes, lightweight layer | Where will movement and combat be difficult? |
| Population and development | Later dedicated mode | Where are demographic and service concentrations? |

Population and development statistics remain visible in county details in version one; their separate map mode is deferred. Every legend explains classes and uses pattern/icon alternatives to color.

### 8.3 Screen specifications

| Screen | Hierarchy and visible information | Primary actions, disabled reasons, navigation |
|---|---|---|
| Main menu / campaigns | Continue first, Cobb campaign, any-county campaign, tutorial/training, settings; scenario fiction notice | Start/load; corrupt or newer-version saves show a clear reason; return from all menus without losing state |
| County selection | Search and filter; Georgia map; selected profile and authority; difficulty factors | Select, compare up to three, choose ambition, start; no county locked for difficulty; explanation if scenario validation fails |
| Strategic map | Date and key resources above map; selection left; one contextual drawer; modes below | Pause, inspect, act, navigate alerts; affordability/prerequisite reasons in place |
| County details | Owner/occupier/coalition badges first; budget/workforce second; projects, services, integration next | Allocate W, build, open diplomacy; unavailable controls say “Fulton governs this county,” not just gray buttons |
| Coalition management | Chair, independent members, cohesion, common fund, current motion | Propose/vote/request delegation/leave; identify consent, quorum, cost, and notice requirements |
| Economy / construction | Actual and forecast budget; recurring vs one-time costs; workforce conflicts; queue | Fund/cancel/change effort/buy materials; show slot occupied, shortage, or missing route before click |
| Diplomacy | Selected actor and authority; relations/trust; treaties; acceptance reasons | Improve relations, propose, join, integrate, claim; separate hard gates from low acceptance |
| Army management | Selected formations, upkeep, workforce, supply, current orders | Recruit, move, reinforce, retire; report military W cap, route block, and maintenance risk |
| Historical decision | Category/date; concise event narrative; actual options and forecasts; sources drawer | Choose/read context/locate affected county; preserve affordable option; historical outcomes never appear as reversible buttons |
| Peace negotiation | War goal, score, occupation, claims, candidate terms, governance forecast | Offer, counteroffer, white peace; show cost, legal gates, autonomy and truce effects; final summary confirmation |
| Campaign result | Ambition outcome; map timeline; governance/welfare record; historical versus alternate outcomes | Review timeline, export summary, continue sandbox, start again; sandbox notice describes historical coverage limit |

### 8.4 Text wireframes

Each table is a spatial specification, intended for direct translation into a mockup. Dimensions are proposed layouts, not screenshots.

**A. County selection — 1280×720 baseline**

| Region | Content |
|---|---|
| Top, 56 px | County Compact • New campaign • Back |
| Left, 280 px | Search “Cobb”; filter affiliation/difficulty; county list with seat and authority icons |
| Center, remaining width | Georgia map; Cobb bracketed; neighboring county outlines; zoom/reset |
| Right, 320 px | Cobb County / Marietta; “Direct control: Cobb only”; “Metro Atlanta Coalition member”; economy/workforce; difficulty causes; three opening objectives |
| Bottom, 64 px | Start date: 1 Feb 1942 • Ambition selector • Tutorial on • Begin campaign |

**B. Main map with Cobb selected**

| Region | Content |
|---|---|
| Top, 56 px | 1 Feb 1942 • Paused • Speed 1/4/12 • 120 C (+8/mo) • 20 M • 5 W available • Support 65 • Alerts |
| Left, 288 px | Cobb / Marietta; owner Cobb; coalition member; Bell: Candidate; local budget +8; project slot empty; workforce allocations |
| Center, ≥720 px with drawer closed | Political Georgia map; Cobb selected; Fulton coalition border context; visible county names; scale/reset |
| Context action rail, 56 px | Develop • Diplomacy • Forces; opening an action replaces or overlays one side panel at 1280 px |
| Bottom, 56 px | Control • Coalitions • Economy • Supply • Integration • Terrain; latest two log entries |
| Expanded top detail | Administrative load 1/6; Standing 70; exhaustion 0; all available through keyboard focus |

At 1280×720, left and right full-width panels never permanently occupy the screen together. An action drawer replaces the details panel or uses a dismissible overlay with at least 700 px of map exposed. At ≥1600 px, both panels may be pinned. This preserves usable geography at the minimum target size.

**C. Historical decision — Bell selection**

| Region | Content |
|---|---|
| Header | CONDITIONAL HISTORY • 19 Feb 1942 • Locate Cobb |
| Main narrative | “Marietta selected for aircraft investment”; two short paragraphs; explicit “Production has not begun” |
| Option A | Accept enabling obligations • 20 C / 4 M now • construction prerequisites • treasury after choice |
| Option B | Request delay • no immediate cost • one review; possible loss of opportunity |
| Footer | Historical note [S1] • affected counties • decision window • Confirm selected option |

**D. Coalition diplomacy — a membership proposal**

| Region | Content |
|---|---|
| Header | Metro Atlanta Coalition • Chair: Fulton • Cohesion 65 • Common fund balance |
| Left list | Five independent members; one vote each; votes show Pending/Yes/No with reasons |
| Main proposal | “Admit Paulding”; applicant keeps its own budget and forces; gains charter access; owes 1 C/mo |
| Forecast | Applicant acceptance breakdown; strict majority needed; no direct county transfer; common-fund impact |
| Actions | Submit motion / Amend offer / Back; a blocked motion states missing applicant consent or active proposal slot |

**E. Peace settlement — county cession**

| Region | Content |
|---|---|
| Header | Negotiation • War goal • Score +48 • Federal review in 27 days |
| Left | Eligible occupied claimed counties; no selectable unoccupied or unclaimed cession targets |
| Center | Proposed terms: cede one county • cost 26 • 24-month truce • autonomy floor 60 |
| Right | Receiving administration: load before/after, net revenue forecast, support reduction, N=0, U=80, −5 Standing |
| Footer | “Occupation ends; legal control transfers only when accepted” • Review agreement • Send offer |

The sample cost 26 represents a county with I=1 and B=4. It is illustrative, not a specified current county statistic.

### 8.5 Interaction and accessibility

Left-click selects a county or counter; a second selection updates the panel without opening a new window. Right-click issues movement only when a force is selected; first show destination, path, arrival, and supply preview. A visible Move button provides the same function for trackpads and keyboard users. Orders entering a new war require an explicit war confirmation, never a movement shortcut.

Drag empty map space or use middle-button drag to pan. Wheel/trackpad zoom centers on the pointer. Home resets the map; a visible Reset control duplicates it. Space pauses outside editable fields; 1/2/3 select speed; Escape backs out one layer; Tab navigates controls. Arrow keys navigate a focused county list; Enter selects and centers. Provide a screen-reader-friendly county/army list sharing the same actions as the canvas; do not require interaction with a WebGL polygon.

Tooltips expose calculated values on hover and focus; complex explanations use click-to-open help. Do not place the only explanation inside a tooltip. Respect reduced motion by removing pan easing, pulsing markers, and decorative transitions. No screen shake. Avoid animation that suggests simulation has continued while paused.

Confirm war declarations, treaty breaches, cessions, integration, and destructive save overwrite with a concise consequence summary. Ordinary allocations and map navigation do not require confirmation. Save before consequential actions when autosave is enabled. Autosave at each month end to a rotating local history, and provide manual export/import without a backend.

## 9. Tutorial and first-year walkthrough

### 9.1 Cobb onboarding

The tutorial is contextual guidance over the real campaign, not a separate resource-rich mode. It has eight short lessons with observable completion conditions. Dismissing the tutorial never disables core actions.

| Lesson | Player action | Completion proof |
|---|---|---|
| 1. Read your neighborhood | Select Cobb, then Fulton and Paulding | Identify a real neighbor and return to Cobb |
| 2. Understand membership | Open coalition and county authority details | Recognize that Fulton remains independently controlled |
| 3. Read the budget | Expand +8/month forecast | Distinguish 120 treasury from recurring surplus |
| 4. Fund a useful improvement | Start Cobb transport, allocate 2 W | See treasury 84, materials 10, and the future extra upkeep |
| 5. Respond to industry | Decide E01 and inspect its stages | Identify why Candidate is not Operating |
| 6. Negotiate | Improve a neighbor relationship or consider E05 | See civil access versus military access and a real acceptance reason |
| 7. Recruit and move | Inspect recruitment costs, then use optional training or recruit when affordable | Trace a legal supplied route; understand workforce opportunity cost |
| 8. Expand and integrate | Complete the first voluntary union, dependency, or valid settlement later in play | Observe that integration/authority changes depend on the relationship type |

Do not require lesson 8 in the opening session; normal integration gates make this a months-long campaign objective. The lesson returns when an eligible opportunity arises. The optional training scenario has copied data, a fictional marked opposing force, fixed reserves, and no effects on the campaign save. It teaches combat and peace without manufacturing an immediate war in 1942 Cobb.

### 9.2 Narrated first year, February–December 1942

This is an illustrative rule-consistent peaceful opening, not a historical account or a claim of playtesting. It assumes no extra construction, purchases, notes, recruitment, taxes, or unexpected dynamic penalties beyond the events listed.

**February:** You begin with 120 C/20 M, staff services, and leave the existing security battalion in Cobb. Fund transport for 36 C/10 M, reserving 2 W. Treasury becomes 84. On February 19, accept the Bell obligations for 20 C/4 M: 64 remains, with no plant income. The month-end +8 surplus brings treasury to 72.

**March–April:** March ends at 80. On April 2, pay the 24 C/8 M local construction commitment and reserve 1 W for liaison. The national construction timeline begins while the local transport project finishes separately. After April's +8, treasury is 64. You have enough unassigned workforce because ordinary jobs/services/security use 7 W, the transport project 2 W, and liaison 1 W, out of 12.

**May–June:** Transport completes in early May, returning 2 W and raising T to 2. Its additional upkeep changes the normal surplus from +8 to +7. By May month-end treasury is 71. In June, accept the joint Fulton agreement if Fulton also accepts and pays its share; Cobb pays 8 C. June ends at 70. Fulton remains its own administration; the arrangement grants civil, not military, access.

**July–September:** Take the no-spend rationing response because the current project plan already has enough materials. July ends at 77. On August 1 fund housing/services for 30 C/6 M; August ends at 54. Bell construction has been underway for 180 days by late September, triggering an outside inflow of 3 W. Housing completes around September 30, raising H from 14 to 18 before the month-end crowding check. September ends at 61. New workers can be available without magically creating productive jobs.

**October–December:** Keep reserves and avoid buying another force simply because the button is available. The three remaining +7 month-end surpluses bring treasury to 82. Bell is still under construction: full production cannot begin until 1943, and the future 3 W commitment is visible. Workforce is 15, with 1 W reserved for liaison and the normal jobs/services/security staffed; new investment is possible but should be compared with the upcoming operating plan.

The simplified cash ledger reconciles: `120 opening − 118 one-time costs + 80 recurring surplus = 82 closing`. Materials remain nonnegative: the first two monthly +4 allocations/production supply enough for the April commitment; subsequent production more than covers housing. No assumption of early bomber revenue is necessary.

### 9.3 Two viable expansion strategies

**A. Coalition builder:** Use the improved Fulton relationship to establish a common-project record, recruit independent neighbors as members, and prepare for the 1943 or 1944 chair contest. Make a useful Paulding agreement and build trust over a full year. Seek a voluntary union only after its support, influence, consent, and administrative-capacity gates are satisfied. Coalition counties contribute to Commonwealth progress when the player leads them; independent membership never appears as owned territory. The opportunity cost is slower direct income growth and the need to keep members satisfied.

**B. Armed regional administrator:** Keep the same cautious industrial opening, then use 1943 contract proceeds to fund a second line formation, a reserve, and administrative capacity. Secure military access and inspect a genuine adjacent dispute. Petition a registered claim only if its prerequisites exist; do not guarantee that a compliant neighbor will furnish a pretext. Fight a short supplied war for one claim, accept arbitration limits, and integrate before attacking again. This path trades money, workforce, Standing, and local support for direct territory. If no eligible dispute appears, development and diplomacy remain productive rather than forcing a scripted war.

The first year ends with different preparations, not an implausible instant empire. Larger expansion occurs through the mid-campaign decisions those preparations enable.

## 10. Initial scope and validation plan

### 10.1 Delivery sequence

| Gate | Required design/implementation outcome | Exit criterion |
|---|---|---|
| A. Historical map foundation | All-county manifest, corrected topology, date-aware names, source/license register | Exactly 159 selectable starts; neighbor and route audits pass |
| B. Economic vertical slice | Cobb, all-county inspection, staffing, budget, construction, daily/monthly calendar, local save | The opening ledger reconciles; no hidden workforce duplication |
| C. Peaceful regional game | All actors active, diplomacy, coalition motions, membership, integration | A peaceful multi-county campaign is possible under normal rules |
| D. Limited conflict | Recruitment, supply, movement, explainable battle, occupation, peace, Standing | Battle victory never bypasses legal cession and integration |
| E. Historical campaign | Industrial chain, 16 sample events refined into 20–24 total, postwar adjustment | Conditional events survive any-county starts and lost prerequisites |
| F. Complete first playable | Any county, both ambitions, AI, tutorial, summary, save/export, accessibility | Full campaign can reach victory, failure, and sandbox continuation |

Do not treat the military slice or pretty map alone as the first playable promised by this brief. The release scope includes all 159 counties, all-county selection, economy, construction, coalition diplomacy, warfare, occupation/peace, events, integration, and an ending. Six polished opening profiles supplement a complete baseline for every other county.

For a small team, prefer one map/graphics engineer, one simulation/UI engineer, and part-time design/history/QA support. Estimate milestones only after the map and peaceful slice are prototyped; there is no defensible fixed delivery estimate before that work. Limit event authoring and unit variety to protect the core loop.

### 10.2 Future technical acceptance targets

The implementation target is TypeScript in strict mode, Vite, Three.js, HTML/CSS panels, local saves, and no backend or required runtime asset downloads. This document specifies constraints rather than application code.

Use a mostly flat orthographic map, shared-topology county meshes batched into a small number of draws, an indexed adjacency graph, bounded labels, and simple army counters. Update ownership colors without rebuilding geometry. Rendering interpolates motion but never determines simulation results. Political and diplomatic actions are keyed by stable IDs; no rules depend on display text.

The map does not need one DOM node per county. Use canvas/WebGL labels or a bounded label layer. HTML panels render only visible list rows; provide an accessible virtualized county list. Bundle fonts, data, original icons, and any texture locally. Keep a provenance manifest with the shipped dataset. No paid services, runtime API keys, or online geographic lookup.

| Target | Proposed acceptance measurement, not an achieved result |
|---|---|
| Ordinary map responsiveness | 60 fps target at 1920×1080 on a declared integrated-GPU reference laptop; 95th-percentile frame time ≤20 ms in a repeatable navigation trace |
| Worst busy map | At least 30 fps with full county state, visible conflict counters, and the maximum label cap |
| Input feedback | Selection highlight within 100 ms; expensive forecasts may complete afterward with an explicit pending state |
| Simulation | Day step p95 below 5 ms and monthly evaluation below 50 ms on the reference machine; profile before committing to a worker |
| Loading | Interactive local campaign start within 5 seconds after bundled files are available |
| Size | Target initial compressed application/data assets ≤15 MB, excluding optional archival media; verify historical geometry quality before enforcing a lower cap |
| Offline | After obtaining the complete distribution, campaign, saves, fonts, and data require no outside requests |
| Saves | Same seed and orders produce the same outcome after reload; unsupported schema shows a migration/import explanation |

If WebGL is unavailable, provide a clear hardware/browser message and access to save export; a second map renderer is outside initial scope. A simple static county list may still permit inspecting a save without pretending the full game is supported.

### 10.3 Playtest and correctness plan

**Design questions:** Can a player distinguish owner from coalition chair? Do they understand why Bell has no opening income? Can they choose a neighbor for a geographic reason? Is peaceful expansion interesting before annexation becomes available? Does war create a strategic choice rather than a mandatory shortcut? Does the postwar period change priorities without an arbitrary catastrophe?

**First round:** Eight players unfamiliar with the design, using Cobb. Target at least six independently identifying the +8 surplus, coalition limits, and a next action within ten minutes. At least six should finish their first useful improvement without moderator intervention. Ask players to explain treaty and battle forecasts in their own words; do not count merely clicking through as understanding.

**Second round:** Six contrast starts plus at least twelve additional counties sampled across economy, geography, affiliation, and size. Run an automated solvency/start-access check for all 159; human sampling does not replace complete data validation. Every county needs a viable route to safety and economic growth, but equal winning difficulty is not the goal.

**High-value future checks:**

- County roster uniqueness, valid polygons, shared borders, no point-contact movement, no accidental isolated county.
- Workforce never allocated twice; contract capacity unavailable while reserved; migration preserves internal totals.
- Income, upkeep, debt, dues, and common-fund transfers reconcile; annexation cannot duplicate money or allotments.
- Coalition chair cannot spend member treasury, annex without consent, or issue undelegated army orders.
- Illegal movement fails before departure; supply responds to changing occupation/access.
- Simultaneous battle results do not depend on actor iteration order.
- Occupation does not alter owner; peace transfers only eligible counties; arbitration respects limits.
- Bell cannot operate before 1943, survive cancellation as an income source, or turn into player aircraft.
- Event choice affordability, deferred decisions, lost prerequisites, and once-only rewards behave consistently.
- Save/reload mid-battle, mid-project, and mid-event preserves state; importing malformed data does not overwrite the last good save.

These are future acceptance tests, not tests executed on software. This deliverable has been checked as a design document only.

### 10.4 Principal risks and decisions

| Risk | Response and decision gate |
|---|---|
| U.S. toleration of county war feels implausible | Explicit large counterfactual, contained scope, Standing and arbitration; test comprehension before writing extensive political lore |
| Rule count overwhelms a small game | Stage information through county context; retain only three economic resources and three formation types |
| Peaceful integration feels too slow | Coalitions, shared projects, and influence provide earlier expansion payoffs; test timing before reducing integration costs |
| Bell makes Cobb overwhelmingly stronger | Services and staffing limit immediate exploitation; contract income ends in 1945; other counties have different achievable ambitions |
| 159 territories amplify content work | Shared systems and generic events; six authored openings; exhaustive data and solvency gates |
| History becomes misleading flavor | Field-level provenance, conditional local outcomes, permanent fiction labels, historian and sensitivity review |
| AI appears arbitrary | Published acceptance terms, disclosed priorities, visible supply and budget constraints |
| Late game becomes empty speed-running | Victory requires stable governance; cap campaign at 1948; postwar conversion, coalition politics, and integration occupy the final years |

## 11. Expansion roadmap

Preserve state-independent county IDs, dated geography, separate relationships, configurable scenario rules, and event scopes from the start. An outside actor can own contracts or send pressure without requiring map geometry.

1. **First expansion: one neighboring state.** Choose after testing where geography and trade produce the most interesting border. Add a complete sourced county dataset, legal crossings, and a state-specific historical review; do not partially populate all five neighbors.
2. **Economic depth.** Add a second layer of transport or production only if the compact materials economy fails to create meaningful decisions. Preserve clear budget explanations.
3. **Institutions and demographics.** Expand local representation, elections, and migration with adequate historical research and review. Do not bolt a racial population-bonus system onto the existing workforce abstraction.
4. **Doctrine and technology.** Add a small number of choices only when the three-unit military system has demonstrated interesting outcomes. Air and naval play require new map and federal-authority assumptions.
5. **Wider national geography.** Revisit the entire premise, performance model, and victory scale before adding thousands of counties. Georgia's compact rules should not automatically become a claim about all U.S. governance.
6. **Multiplayer.** Last, after stable deterministic saves, explicit order resolution, and a separately designed synchronization/security model. It is not part of the local-only first release.

A later 1949–53 historical pack could address the Korean War and Lockheed's 1951 arrival [S1], but those events are deliberately outside the current campaign. Later historical content requires its own sources and conditional outcomes.

## 12. Sources and open questions

### 12.1 Source register

The sources marked “read” were retrieved and inspected for this design on September 13, 2026. Linked sources are cited for historical or geographic claims, not for the invented numerical rules. Online availability does not imply permission to reproduce photographs or page text; this document paraphrases and proposes original art.

| ID | Source | Claims or use | Verification status |
|---|---|---|---|
| S1 | Thomas A. Scott, [“Bell Bomber,” New Georgia Encyclopedia](https://www.georgiaencyclopedia.org/articles/government-politics/bell-bomber/) | February 19 selection; April 2 groundbreaking; spring 1943 manufacturing; approximately thirteen-month construction; unequal employment access; 1945 cancellation; postwar context; 1951 reopening | Read; article last edited November 3, 2020 |
| S2 | Edward A. Hatfield, [“World War II in Georgia,” New Georgia Encyclopedia](https://www.georgiaencyclopedia.org/articles/history-archaeology/world-war-ii-in-georgia/) | Mobilization; industrial and agricultural change; shipbuilding; labor migration; women's and Black workers' experiences; white primary and postwar politics | Read; article last edited July 15, 2020 |
| S3 | National Archives, [Executive Order 8802](https://www.archives.gov/milestone-documents/executive-order-8802) | June 25, 1941 order; defense-employment nondiscrimination provisions; enforcement context | Read, including transcript |
| S4 | National Archives, [Servicemen's Readjustment Act (1944)](https://www.archives.gov/milestone-documents/servicemens-readjustment-act) | June 22, 1944 enactment; education/housing/readjustment; documented unequal access | Read, including contextual explanation |
| S5 | National Archives, [Surrender of Japan (1945)](https://www.archives.gov/milestone-documents/surrender-of-japan) | September 2, 1945 formal surrender; external campaign transition | Read, including instrument transcript |
| S6 | Newberry Library, [Atlas of Historical County Boundaries](https://publications.newberry.org/ahcb/) and [About the Atlas](https://publications.newberry.org/ahcb/about/) | County chronology, historical boundary research, official session-law basis, reuse terms | Read. Issue #1 audit (docs/historical-research/issue-1-newberry-audit.md) found: bundled deed is CC BY-NC-SA 2.5; current download pages state "any lawful purpose, commercial or non-commercial, without licensing or permission fees" and that bundled out-of-date licenses can be ignored; no CC0 1.0 Universal language on any Newberry page. The CC0 claim in §3.2 text was incorrect and was corrected. |
| S7 | U.S. Census Bureau, [Cartographic Boundary Files](https://www.census.gov/geographies/mapping-files/time-series/geo/carto-boundary-file.html) and [TIGER/Line Shapefiles](https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.html) | Official modern county geometry and geographic identifiers; proposed crosswalk/base source | Cartographic page returned HTTP 403; release-specific files and metadata not verified here |
| S8 | The National WWII Museum, [“Rationing”](https://www.nationalww2museum.org/war/articles/rationing-during-wwii) | Wartime material shortages, ration books, local administration, phased rationing chronology | Read; game E06 date and quantities remain authored abstractions |
| S9 | Edward A. Hatfield, [“Segregation,” New Georgia Encyclopedia](https://www.georgiaencyclopedia.org/articles/history-archaeology/segregation/) | Jim Crow's legal and social effects, disenfranchisement, housing/employment barriers, Black institutions and resistance | Read; article last edited July 20, 2020 |

### 12.2 Open research and balancing questions

| ID | Unresolved item | Required resolution |
|---|---|---|
| Q1 | February 1942 county roster and boundary snapshot (split: roster verified against Newberry AHCBP and 1940 Census on 2026-09-14; 1942 boundary polygons still open; see docs/historical-research/issue-1-roster.md and issue-1-unresolved.md for the 39 counties with undated 1915-1952 changes and the Floyd/Gordon and Marion/Talbot Census-only 1933/1934 changes) | Document each of the 39 undated 1915-1952 Newberry boundary changes and the 4 Census-only 1933/1934 changes as before/after 1942-02-01 or "undetermined, modern polygon used"; license work belongs to Issue #2 if Newberry polygons are bundled |
| Q2 | Cobb and Atlanta period transport, river crossings, power, and reservoirs | Obtain period maps; verify U.S. 41 stages and actual route access; avoid modern network import |
| Q3 | County-level population and economic baselines | Extract cited 1940 county data; keep 1942 estimates and game ranks explicitly separate; do not infer all local statistics from statewide totals |
| Q4 | Georgia-specific rationing implementation and industrial materials allocation | Validate local institutions and dates before writing exact local historical claims; E06 remains an abstraction meanwhile |
| Q5 | Savannah and Brunswick contract/site-specific chronology | Verify each named yard and date before splitting E09 into fully authored historical chains |
| Q6 | Regional injustices and civic agency | Historical/sensitivity review of petitions, access choices, and outcome records; use contextual evidence beyond broad averages |
| Q7 | Coalition balance and any-county solvency | Author complete baseline statistics and AI profiles; test all 159 starts; do not claim this document is already balanced |
| Q8 | Pace and scale | Verify that 20 integrated counties or 35 coalition counties is feasible within the real session-time target; tune thresholds after observed play |
| Q9 | Asset/data rights | Preserve Census notices, Newberry provenance and license terms (CC BY-NC-SA 2.5 or "any lawful purpose" per current download pages; not CC0; see docs/historical-research/issue-1-newberry-audit.md), font licenses, and original-icon provenance; separately clear any future archival media |
| Q10 | Premise acceptance | Test whether players accept the clearly fictional compact; if they reject it, revise the scenario premise before expanding content |

### 12.3 Handoff status

**Specified:** Campaign dates, fictional authority framework, geography/data plan, county-stat model, Cobb starting state, eight initial coalitions, six opening profiles, economic and political rules, war/peace rules, AI priorities, sixteen event specifications, five textual wireframes, tutorial, first-year budget walkthrough, release scope, and validation gates.

**Still to produce in development:** Verified 159-county dataset and transport graph, complete starting-stat roster, rendered interface mockups, balanced event tuning, software, and playtest results. This document intentionally does not claim these implementation deliverables are complete.

**Project destination:** [andysolomon/county-compact](https://github.com/andysolomon/county-compact). The repository holds the design and implementation backlog. GitHub issues track development; no application is implemented yet.
