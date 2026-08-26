import type { BuildStatus, BuildTask } from "./types";

export function findCollisions(tasks: BuildTask[]) {
  return tasks.flatMap((task, index) =>
    tasks.slice(index + 1)
      .filter((candidate) => task.module === candidate.module && !task.dependsOn.includes(candidate.id) && !candidate.dependsOn.includes(task.id))
      .map((candidate) => ({ first: task.id, second: candidate.id, module: task.module })),
  );
}

export function reorderSafely(tasks: BuildTask[], firstId: string, secondId: string) {
  return tasks.map((task) => {
    if (task.id === firstId) return { ...task, status: "ready" as const };
    if (task.id === secondId) return { ...task, status: "waiting" as const, dependsOn: [...new Set([...task.dependsOn, firstId])] };
    return task;
  });
}

export function advanceBuild(tasks: BuildTask[]) {
  const statusOrder = ["ready", "running", "verifying"] as const;
  const active = tasks.find((task) => statusOrder.includes(task.status as (typeof statusOrder)[number]));
  if (!active) return tasks;
  const next: BuildStatus = active.status === "ready" ? "running" : active.status === "running" ? "verifying" : "verified";
  return tasks.map((task) => task.id === active.id ? { ...task, status: next } : task);
}
