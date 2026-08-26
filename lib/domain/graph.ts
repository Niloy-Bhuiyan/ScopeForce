import type { GraphRelationship } from "./types";

export function traceLineage(id: string, edges: GraphRelationship[]) {
  const upstream = new Set<string>();
  const downstream = new Set<string>();
  const walk = (current: string, direction: "up" | "down", seen: Set<string>) => {
    for (const edge of edges) {
      const matches = direction === "up" ? edge.target === current : edge.source === current;
      if (!matches) continue;
      const next = direction === "up" ? edge.source : edge.target;
      if (!seen.has(next)) {
        seen.add(next);
        walk(next, direction, seen);
      }
    }
  };
  walk(id, "up", upstream);
  walk(id, "down", downstream);
  return { upstream, downstream, connected: new Set([id, ...upstream, ...downstream]) };
}

export function calculateBlastRadius(id: string, edges: GraphRelationship[]) {
  const direct = new Set(edges.filter((edge) => edge.source === id).map((edge) => edge.target));
  const indirect = new Set<string>();
  for (const node of direct) {
    traceLineage(node, edges).downstream.forEach((child) => {
      if (!direct.has(child)) indirect.add(child);
    });
  }
  return { direct, indirect };
}

