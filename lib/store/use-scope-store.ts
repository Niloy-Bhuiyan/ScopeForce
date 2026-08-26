"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { advanceBuild, reorderSafely } from "@/lib/domain/build-engine";
import { campusLink, initialNotifications } from "@/lib/domain/demo";
import type { BuildTask, GraphEntity, Notification, SourceDocument } from "@/lib/domain/types";

interface ScopeState {
  selectedNodeId: string;
  tasks: BuildTask[];
  notifications: Notification[];
  documents: SourceDocument[];
  driftRepaired: boolean;
  impactPlanCreated: boolean;
  buildPaused: boolean;
  toast: string | null;
  setSelectedNode: (id: string) => void;
  addDocument: (document: SourceDocument) => void;
  markDocument: (id: string, status: SourceDocument["status"]) => void;
  answerQuestion: (id: string) => void;
  toggleBuild: () => void;
  advance: () => void;
  resolveCollision: () => void;
  createRepairTask: () => void;
  createImpactPlan: () => void;
  markNotificationsRead: () => void;
  notify: (notification: Notification) => void;
  showToast: (message: string | null) => void;
}

export const useScopeStore = create<ScopeState>()(
  persist(
    (set) => ({
      selectedNodeId: "REQ-014",
      tasks: campusLink.tasks,
      notifications: initialNotifications,
      documents: campusLink.documents,
      driftRepaired: false,
      impactPlanCreated: false,
      buildPaused: true,
      toast: null,
      setSelectedNode: (selectedNodeId) => set({ selectedNodeId }),
      addDocument: (document) => set((state) => ({ documents: [...state.documents.filter((item) => item.id !== document.id), document] })),
      markDocument: (id, status) => set((state) => ({ documents: state.documents.map((item) => item.id === id ? { ...item, status } : item) })),
      answerQuestion: () => set({ toast: "Answer saved to the project scope." }),
      toggleBuild: () => set((state) => ({ buildPaused: !state.buildPaused, toast: state.buildPaused ? "Demo build resumed." : "Demo build paused." })),
      advance: () => set((state) => ({ tasks: advanceBuild(state.tasks), toast: "One deterministic build step advanced." })),
      resolveCollision: () => set((state) => ({
        tasks: reorderSafely(state.tasks, "TASK-020", "TASK-021"),
        notifications: [{ id: `N-${Date.now()}`, title: "Conflict resolved", detail: "TASK-021 now waits for TASK-020.", kind: "success", read: false }, ...state.notifications],
        toast: "Tasks reordered safely.",
      })),
      createRepairTask: () => set((state) => ({
        driftRepaired: true,
        tasks: [...state.tasks, { id: "TASK-024", title: "Guard protected dashboard", lane: "Frontend", module: "Route access", status: "ready", provider: "Demo engine", dependsOn: ["TASK-021"] }],
        notifications: [{ id: `N-${Date.now()}`, title: "Repair task created", detail: "TASK-024 now traces to REQ-014.", kind: "info", read: false }, ...state.notifications],
        toast: "Repair task added to the Engineering Graph.",
      })),
      createImpactPlan: () => set((state) => ({
        impactPlanCreated: true,
        tasks: [...state.tasks.filter((task) => task.id !== "TASK-030"), { id: "TASK-030", title: "Plan multi-organization membership", lane: "Data", module: "Organization model", status: "ready", provider: "Demo engine", dependsOn: [] }],
        notifications: [{ id: `N-${Date.now()}`, title: "Impact plan ready", detail: "Five affected nodes are linked to TASK-030.", kind: "success", read: false }, ...state.notifications],
        toast: "Impact plan created.",
      })),
      markNotificationsRead: () => set((state) => ({ notifications: state.notifications.map((item) => ({ ...item, read: true })) })),
      notify: (notification) => set((state) => ({ notifications: [notification, ...state.notifications] })),
      showToast: (toast) => set({ toast }),
    }),
    {
      name: "scopeforce-demo-state",
      partialize: ({ selectedNodeId, tasks, notifications, documents, driftRepaired, impactPlanCreated, buildPaused }) => ({ selectedNodeId, tasks, notifications, documents, driftRepaired, impactPlanCreated, buildPaused }),
    },
  ),
);

export function withRepairEntity(entities: GraphEntity[], repaired: boolean) {
  if (!repaired) return entities;
  const repairEntity: GraphEntity = { id: "TASK-024", kind: "task", title: "Guard protected dashboard", description: "Block unverified users from protected routes.", status: "ready" };
  return [...entities.filter((entity) => entity.id !== "TASK-024"), repairEntity];
}
