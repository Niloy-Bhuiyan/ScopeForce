# Engineering Graph

The graph is ScopeForce’s primary artifact and visual identity. One data structure supports four lenses: engineering lineage, execution state, proof chain, and impact. `traceLineage` computes transitive upstream/downstream sets. `calculateBlastRadius` separates direct from indirect effects. The UI passes these sets to a single React Flow implementation, fading unrelated nodes rather than rebuilding the graph per page.

The canonical trace is `UN-001 → REQ-014 → ADR-007 → TASK-021 → auth/verify.ts → TEST-014 → RESULT-014`.

