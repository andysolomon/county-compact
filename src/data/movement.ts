import raw from "./movement-edges.json";

/** A derived river-crossing tag on a movement edge. */
export interface RiverCrossing {
  readonly kind: "river";
  readonly river: string;
  /** Fraction (4 dp) of the shared boundary length lying along the river. */
  readonly boundaryFraction: number;
  readonly basis: "derived: Natural Earth 10m hydrography";
}

/** One undirected movement edge between adjacent counties, with a < b. */
export interface MovementEdge {
  readonly a: string;
  readonly b: string;
  readonly passable: true;
  readonly basis: "scenario-abstraction: geographic adjacency assumed road-connected";
  readonly crossing: RiverCrossing | null;
}

interface MovementFile {
  readonly provenance: Readonly<Record<string, unknown>>;
  readonly edges: readonly MovementEdge[];
}

const data = raw as unknown as MovementFile;

const pairKey = (a: string, b: string): string => (a < b ? `${a}|${b}` : `${b}|${a}`);

export const MOVEMENT_EDGES: readonly MovementEdge[] = data.edges;
export const MOVEMENT_PROVENANCE = data.provenance;

const EDGE_BY_PAIR: ReadonlyMap<string, MovementEdge> = new Map(MOVEMENT_EDGES.map((e) => [pairKey(e.a, e.b), e]));

/** The movement edge between two counties in either order, or undefined if none. */
export function movementEdge(a: string, b: string): MovementEdge | undefined {
  if (a === b) return undefined;
  return EDGE_BY_PAIR.get(pairKey(a, b));
}

/** The river crossing on the edge between two counties, or null if none. */
export function crossingOf(a: string, b: string): RiverCrossing | null {
  return movementEdge(a, b)?.crossing ?? null;
}
