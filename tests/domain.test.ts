import { describe, expect, it } from "vitest";
import { advanceBuild, findCollisions, reorderSafely } from "@/lib/domain/build-engine";
import { campusLink } from "@/lib/domain/demo";
import { calculateBlastRadius, traceLineage } from "@/lib/domain/graph";

describe("engineering graph", () => {
  it("traces a requirement from need through verified result", () => {
    const trace = traceLineage("REQ-014", campusLink.relationships);
    expect(trace.upstream.has("UN-001")).toBe(true);
    expect(trace.downstream.has("RESULT-014")).toBe(true);
  });

  it("distinguishes direct and indirect impact", () => {
    const impact = calculateBlastRadius("REQ-014", campusLink.relationships);
    expect(impact.direct.has("ADR-007")).toBe(true);
    expect(impact.indirect.has("RESULT-014")).toBe(true);
  });
});

describe("deterministic build orchestration", () => {
  it("detects same-module collisions and safely serializes them", () => {
    const collisions = findCollisions(campusLink.tasks);
    expect(collisions.some((collision) => collision.module === "User Service")).toBe(true);
    const reordered = reorderSafely(campusLink.tasks, "TASK-020", "TASK-021");
    expect(reordered.find((task) => task.id === "TASK-021")?.dependsOn).toContain("TASK-020");
  });

  it("advances only one ready task", () => {
    const next = advanceBuild(campusLink.tasks);
    expect(next.filter((task) => task.status === "running")).toHaveLength(1);
  });
});

