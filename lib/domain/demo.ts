import type { Notification, Project, ProviderAdapter } from "./types";

export const campusLink: Project = {
  id: "CAMPUSLINK",
  name: "CampusLink",
  summary: "Student services platform connecting campus resources.",
  journeyStage: "build",
  documents: [
    {
      id: "SRC-001",
      name: "CampusLink product brief",
      content: "Students need a secure way to verify their campus email. Unverified accounts must not access protected areas. Verification links expire after 20 minutes.",
      status: "local",
    },
  ],
  entities: [
    { id: "UN-001", kind: "need", title: "Trusted campus access", description: "Students need a secure way to verify their campus email address.", sourceIds: ["SRC-001"] },
    { id: "REQ-014", kind: "requirement", title: "Verify user email", description: "Verify a unique campus email before protected access.", status: "on-track", sourceIds: ["SRC-001"] },
    { id: "ADR-007", kind: "architecture", title: "Auth Service", description: "Owns identity, verification tokens, and access gates.", metadata: { boundary: "Security", decision: "Time-limited signed token" } },
    { id: "TASK-021", kind: "task", title: "Implement verification flow", description: "Create the verification token and guarded activation flow.", status: "ready", metadata: { module: "User Service" } },
    { id: "auth/verify.ts", kind: "code", title: "auth/verify.ts", description: "Verification handler and token validation." },
    { id: "TEST-014", kind: "test", title: "Email verification happy path", description: "Verifies token, expiry, replay, and activation.", status: "verified" },
    { id: "RESULT-014", kind: "result", title: "Requirement satisfied", description: "12 assertions passed with linked evidence.", status: "verified" },
    { id: "REQ-010", kind: "requirement", title: "Register student account", description: "Create an account with a campus identity.", status: "on-track" },
    { id: "NOTIFICATION", kind: "architecture", title: "Notification Service", description: "Sends email verification and system notices." },
    { id: "DASHBOARD", kind: "code", title: "app/dashboard/page.tsx", description: "Protected student dashboard route.", status: "drift" },
  ],
  relationships: [
    { id: "E-01", source: "UN-001", target: "REQ-014", relation: "derives" },
    { id: "E-02", source: "REQ-014", target: "ADR-007", relation: "realizes" },
    { id: "E-03", source: "ADR-007", target: "TASK-021", relation: "implements" },
    { id: "E-04", source: "TASK-021", target: "auth/verify.ts", relation: "implements" },
    { id: "E-05", source: "auth/verify.ts", target: "TEST-014", relation: "verifies" },
    { id: "E-06", source: "TEST-014", target: "RESULT-014", relation: "proves" },
    { id: "E-07", source: "REQ-010", target: "REQ-014", relation: "derives" },
    { id: "E-08", source: "REQ-014", target: "NOTIFICATION", relation: "realizes" },
    { id: "E-09", source: "REQ-014", target: "DASHBOARD", relation: "implements" },
  ],
  criteria: [
    { id: "AC-014-1", requirementId: "REQ-014", statement: "Only verified students can reach protected areas.", verified: false },
    { id: "AC-014-2", requirementId: "REQ-014", statement: "Verification links expire after 20 minutes.", verified: true },
    { id: "AC-014-3", requirementId: "REQ-014", statement: "A consumed link cannot be replayed.", verified: true },
  ],
  questions: [
    { id: "Q-001", category: "permissions", question: "Which areas are accessible before email verification?", why: "Defines the authentication boundary and route guards.", impact: "high", status: "unanswered", sourceIds: ["SRC-001"] },
    { id: "Q-002", category: "integrations", question: "Which email delivery provider should send verification links?", why: "Affects provider setup, retry behavior, and operating cost.", impact: "medium", status: "unanswered", sourceIds: ["SRC-001"] },
    { id: "Q-003", category: "quality", question: "Is a 20-minute verification expiry acceptable for all student groups?", why: "Affects token policy, support cases, and security posture.", impact: "medium", status: "answered", answer: "Yes for MVP.", sourceIds: ["SRC-001"] },
  ],
  tasks: [
    { id: "TASK-018", title: "Define core entities", lane: "Data", module: "Identity schema", status: "verified", provider: "Demo engine", dependsOn: [] },
    { id: "TASK-019", title: "Create migrations", lane: "Data", module: "Identity schema", status: "verified", provider: "Demo engine", dependsOn: ["TASK-018"] },
    { id: "TASK-020", title: "Implement handlers", lane: "API", module: "User Service", status: "ready", provider: "Codex (simulated)", dependsOn: ["TASK-019"] },
    { id: "TASK-021", title: "Update user module", lane: "API", module: "User Service", status: "conflict", provider: "Codex (simulated)", dependsOn: ["TASK-019"] },
    { id: "TASK-022", title: "Edit profiles flow", lane: "Frontend", module: "User Service", status: "ready", provider: "Gemini (simulated)", dependsOn: ["TASK-020"] },
    { id: "TASK-023", title: "Verification test plan", lane: "QA", module: "Auth verification", status: "waiting", provider: "Claude (simulated)", dependsOn: ["TASK-020"] },
  ],
};

export const initialNotifications: Notification[] = [
  { id: "N-1", title: "Predicted conflict", detail: "TASK-020 and TASK-021 both affect User Service.", kind: "warning", read: false },
  { id: "N-2", title: "Drift detected", detail: "REQ-014 is missing route-guard evidence.", kind: "danger", read: false },
  { id: "N-3", title: "Context ready", detail: "CampusLink product brief is available for retrieval.", kind: "success", read: true },
];

export const providers: ProviderAdapter[] = [
  { id: "github", name: "GitHub", capabilities: ["repository sync", "pull requests"], status: "connected" },
  { id: "openai", name: "OpenAI / Codex", capabilities: ["RAG generation", "embeddings"], status: "not-configured" },
  { id: "gemini", name: "Gemini", capabilities: ["planned execution adapter"], status: "available" },
  { id: "claude", name: "Claude", capabilities: ["planned execution adapter"], status: "not-configured" },
  { id: "grok", name: "Grok", capabilities: ["planned execution adapter"], status: "available" },
];

