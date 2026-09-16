import raw from "./georgia-counties.json";

export interface CountyGeometry {
  readonly id: string;
  readonly fips: string;
  readonly name: string;
  readonly polygons: readonly (readonly (readonly (readonly [number, number])[])[])[];
  readonly centroid: readonly [number, number];
  readonly bbox: readonly [number, number, number, number];
}

interface GeometryFile {
  readonly provenance: Record<string, string | number>;
  readonly counties: readonly CountyGeometry[];
  readonly adjacency: Readonly<Record<string, readonly string[]>>;
}

const data = raw as unknown as GeometryFile;

export const GEOMETRY: readonly CountyGeometry[] = data.counties;
export const ADJACENCY: Readonly<Record<string, readonly string[]>> = data.adjacency;
export const GEOMETRY_PROVENANCE = data.provenance;
export const GEOMETRY_BY_ID: ReadonlyMap<string, CountyGeometry> = new Map(GEOMETRY.map((c) => [c.id, c]));
export const ID_BY_NAME: ReadonlyMap<string, string> = new Map(GEOMETRY.map((c) => [c.name, c.id]));

export function countyIdByName(name: string): string {
  const id = ID_BY_NAME.get(name);
  if (!id) throw new Error(`unknown county name: ${name}`);
  return id;
}

export function neighborsOf(id: string): readonly string[] {
  return ADJACENCY[id] ?? [];
}

/** Geographic adjacency: a shared boundary segment. Corner-only contacts are excluded. */
export function isAdjacencyEdge(a: string, b: string, sharedSegmentCount?: number): boolean {
  if (a === b) return false;
  if (sharedSegmentCount !== undefined) return sharedSegmentCount > 0;
  return (ADJACENCY[a] ?? []).includes(b);
}
