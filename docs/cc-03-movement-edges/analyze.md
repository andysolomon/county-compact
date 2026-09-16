# Analyze — CC-03 movement edges and river crossings

Date: 2026-09-16. Workflow leaf: CC-03 (GitHub issue #3), branch `feat/cc-03-routes-crossings`. CC-02 merged in PR #32; CC-03 is the only open blocker for CC-04 and CC-06.

## Acceptance criteria and state

| Criterion | State | Evidence / gap |
|---|---|---|
| Date-source roads, rail corridors, river crossings, seats, settlements; separate evidence from scenario abstraction | Partial | Roads are bracketed 1940–1944 with shields untranscribed (U3-1). Rail has only the 1934 Leahy map (U3-2). No river-crossing data exists. Seats are placeholders (U-4). |
| Passable edges, crossing tags, terrain classes, protected facility records | Partial | Terrain classes and federal facilities are done (PR #30). No movement-edge or crossing dataset exists. |
| Period names and dates; no interstates or unverified reservoirs | Met for delivered research | issue-3-roads.md, issue-3-federal-facilities.md |
| Review Cobb–Fulton access, Rickenbacker naming, federal ownership; record unresolved questions | Met | issue-3-unresolved.md U3-1…U3-9, including operator questions U3-4 and U3-5 |

## What this pass can deliver

GDD §3.1: "A passable land crossing establishes a movement edge. A river boundary can connect neighbors but impose a crossing cost." §7 movement rules use a per-edge river-crossing flag.

- **Hydrography source:** Natural Earth 10m `rivers_lake_centerlines` plus the `rivers_north_america` supplement, both public domain ("All versions of Natural Earth raster + vector map data … are in the public domain"). Inside Georgia they include the Chattahoochee, Flint, Ocmulgee, Oconee, Altamaha, Ogeechee, Savannah, Satilla, St. Marys, Alapaha, Withlacoochee, Etowah, Oostanaula, Coosawattee, Conasauga, Chattooga, Tallapoosa, Alcovy and Ochlockonee. River courses are treated as stable since 1942; reservoirs are ignored because only centerlines are used.
  - `ne_10m_rivers_lake_centerlines.geojson` sha256 `bb854a900ecbd3b408df46d5e16e3e0f974ba55993f9d8b5c26e855273c0905a`
  - `ne_10m_rivers_north_america.geojson` sha256 `dcd2348655a5f3d0ea7be35024073ab24f09115d2e4efb77e7bc0a33567db682`
- **Movement edges:** every geographic adjacency edge becomes a passable land movement edge. This is labelled a scenario abstraction: every neighbour pair is assumed connected by some period road, and no impassable boundary is known. River-crossing tags are derived reproducibly: a shared boundary that follows a named river gets `crossing: { kind: "river", river }`.
- **Deferred (CC-03 stays `ready`):**
  - rail corridors (1934-only evidence under a non-commercial licence)
  - road-shield transcription (U3-1)
  - verified county seats (U-4)
  - the operator questions U3-4 and U3-5
