import type { Architecture } from "./types.js";

/** Layers ordered so each comes after the layers it imports, plus any import cycles between layers. */
export type LayerGraph = { readonly order: readonly string[]; readonly cycles: readonly (readonly string[])[] };

const importedLayers = (architecture: Architecture, name: string): readonly string[] => {
  return (architecture.layers[name]?.policy.dependencies.internal ?? []).filter((layer) => layer !== name);
};

const placeInOrder = (architecture: Architecture, names: readonly string[], placed: readonly string[]): readonly string[] => {
  const ready = names.filter((name) => !placed.includes(name) && importedLayers(architecture, name).every((layer) => placed.includes(layer)));
  if (ready.length === 0) return placed;
  return placeInOrder(architecture, names, [...placed, ...ready]);
};

/** Every layer reachable through imports from the frontier, breadth first. */
const reachableFrom = (architecture: Architecture, frontier: readonly string[], seen: readonly string[]): readonly string[] => {
  const [current, ...rest] = frontier;
  if (current === undefined) return seen;
  const next = importedLayers(architecture, current).filter((layer) => !seen.includes(layer));
  return reachableFrom(architecture, [...rest, ...next], [...seen, ...next]);
};

export const layerGraph = (architecture: Architecture): LayerGraph => {
  const names = Object.keys(architecture.layers);
  const order = placeInOrder(architecture, names, []);
  const unplaced = names.filter((name) => !order.includes(name));
  const reach = new Map(unplaced.map((name) => [name, reachableFrom(architecture, [name], [])]));
  const reaches = (from: string, to: string): boolean => reach.get(from)?.includes(to) === true;
  const groups = unplaced
    .filter((name) => reaches(name, name))
    .map((name) => unplaced.filter((other) => reaches(name, other) && reaches(other, name)));
  return { order: [...order, ...unplaced], cycles: [...new Map(groups.map((group) => [group.join(","), group])).values()] };
};
