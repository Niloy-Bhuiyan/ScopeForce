"use client";

import { useMemo } from "react";
import {
  Background, BackgroundVariant, Controls, Handle, MarkerType, MiniMap,
  Position, ReactFlow, type Edge, type Node, type NodeProps,
} from "@xyflow/react";
import { CheckCircle2, CircleUserRound, Code2, FileCheck2, FlaskConical, Layers3, ListChecks } from "lucide-react";
import { campusLink } from "@/lib/domain/demo";
import { calculateBlastRadius, traceLineage } from "@/lib/domain/graph";
import type { EntityKind, GraphEntity } from "@/lib/domain/types";
import { useScopeStore, withRepairEntity } from "@/lib/store/use-scope-store";

export type GraphMode = "engineering" | "execution" | "impact" | "proof";
type ScopeNode = Node<{ entity: GraphEntity; dimmed: boolean; impact?: "changed" | "direct" | "indirect" }, "scope">;

const icons: Record<EntityKind, typeof CircleUserRound> = {
  need: CircleUserRound, requirement: FileCheck2, architecture: Layers3,
  task: ListChecks, code: Code2, test: FlaskConical, result: CheckCircle2,
};

function ScopeNodeCard({ data, selected }: NodeProps<ScopeNode>) {
  const Icon = icons[data.entity.kind];
  return (
    <div className={`graph-node kind-${data.entity.kind} ${data.dimmed ? "dimmed" : ""} ${selected ? "selected" : ""} ${data.impact ? `impact-${data.impact}` : ""}`} tabIndex={0} aria-label={`${data.entity.kind}: ${data.entity.title}`}>
      <Handle type="target" position={Position.Left} />
      <div className="node-kicker"><span><Icon size={15} /></span>{data.entity.id}</div>
      <strong>{data.entity.title}</strong>
      <p>{data.entity.description}</p>
      {data.entity.status && <small>{data.entity.status.replace("-", " ")}</small>}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = { scope: ScopeNodeCard };
const engineeringPositions: Record<string, { x: number; y: number }> = {
  "UN-001": { x: 20, y: 220 }, "REQ-014": { x: 250, y: 220 }, "ADR-007": { x: 490, y: 220 },
  "TASK-021": { x: 730, y: 220 }, "auth/verify.ts": { x: 970, y: 220 }, "TEST-014": { x: 1180, y: 390 },
  "RESULT-014": { x: 1410, y: 390 }, "REQ-010": { x: 250, y: 30 }, "NOTIFICATION": { x: 500, y: 30 },
  "DASHBOARD": { x: 970, y: 30 }, "TASK-024": { x: 1200, y: 30 },
};

export function ScopeGraph({ mode = "engineering", className = "" }: { mode?: GraphMode; className?: string }) {
  const selected = useScopeStore((state) => state.selectedNodeId);
  const setSelected = useScopeStore((state) => state.setSelectedNode);
  const repaired = useScopeStore((state) => state.driftRepaired);
  const entities = withRepairEntity(campusLink.entities, repaired);
  const trace = useMemo(() => traceLineage(selected, campusLink.relationships), [selected]);
  const blast = useMemo(() => calculateBlastRadius("REQ-014", campusLink.relationships), []);
  const nodes = useMemo<ScopeNode[]>(() => entities.map((entity) => {
    const impact = mode === "impact" ? entity.id === "REQ-014" ? "changed" : blast.direct.has(entity.id) ? "direct" : blast.indirect.has(entity.id) ? "indirect" : undefined : undefined;
    const visibleForProof = ["REQ-014", "auth/verify.ts", "TEST-014", "RESULT-014"].includes(entity.id);
    return {
      id: entity.id,
      type: "scope",
      position: engineeringPositions[entity.id] ?? { x: 1450, y: 30 },
      data: { entity, impact, dimmed: mode === "proof" ? !visibleForProof : mode === "impact" ? !impact : selected ? !trace.connected.has(entity.id) : false },
      selected: entity.id === selected,
      draggable: true,
    };
  }), [blast, entities, mode, selected, trace.connected]);
  const edges = useMemo<Edge[]>(() => campusLink.relationships.map((edge) => {
    const active = trace.connected.has(edge.source) && trace.connected.has(edge.target);
    const impactActive = mode === "impact" && (edge.source === "REQ-014" || blast.direct.has(edge.source) || blast.direct.has(edge.target) || blast.indirect.has(edge.target));
    return {
      ...edge,
      animated: mode === "execution" && active,
      style: { stroke: active || impactActive ? "var(--accent)" : "var(--border-strong)", strokeWidth: active || impactActive ? 2 : 1.1, opacity: mode === "proof" && !active ? 0.12 : 1 },
      markerEnd: { type: MarkerType.ArrowClosed, color: active || impactActive ? "var(--accent)" : "var(--border-strong)" },
    };
  }), [blast, mode, trace.connected]);

  return (
    <div className={`scope-graph ${className}`}>
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodeClick={(_, node) => setSelected(node.id)} fitView fitViewOptions={{ padding: 0.18 }} minZoom={0.35} maxZoom={1.6} nodesFocusable elementsSelectable>
        <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="var(--graph-dot)" />
        <Controls showInteractive={false} position="bottom-left" />
        {mode === "engineering" && <MiniMap pannable zoomable position="bottom-right" nodeColor="var(--accent-soft)" maskColor="rgba(246,242,235,.76)" />}
      </ReactFlow>
    </div>
  );
}

