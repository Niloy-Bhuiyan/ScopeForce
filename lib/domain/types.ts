export type EntityKind =
  | "need"
  | "requirement"
  | "architecture"
  | "task"
  | "code"
  | "test"
  | "result";

export type BuildStatus =
  | "waiting"
  | "ready"
  | "running"
  | "verifying"
  | "verified"
  | "blocked"
  | "conflict"
  | "failed";

export interface SourceDocument {
  id: string;
  name: string;
  content: string;
  status: "local" | "indexing" | "indexed" | "error";
}

export interface GraphEntity {
  id: string;
  kind: EntityKind;
  title: string;
  description: string;
  status?: BuildStatus | "on-track" | "drift";
  sourceIds?: string[];
  metadata?: Record<string, string>;
}

export interface GraphRelationship {
  id: string;
  source: string;
  target: string;
  relation: "derives" | "realizes" | "implements" | "verifies" | "proves" | "impacts";
}

export interface AcceptanceCriterion {
  id: string;
  requirementId: string;
  statement: string;
  verified: boolean;
}

export interface ClarificationQuestion {
  id: string;
  category: "users" | "permissions" | "workflow" | "data" | "integrations" | "constraints" | "quality";
  question: string;
  why: string;
  impact: "high" | "medium" | "low";
  status: "unanswered" | "answered" | "deferred";
  answer?: string;
  sourceIds: string[];
}

export interface BuildTask {
  id: string;
  title: string;
  lane: "Data" | "API" | "Frontend" | "QA";
  module: string;
  status: BuildStatus;
  provider: string;
  dependsOn: string[];
}

export interface Notification {
  id: string;
  title: string;
  detail: string;
  kind: "info" | "success" | "warning" | "danger";
  read: boolean;
}

export interface ProviderAdapter {
  id: string;
  name: string;
  capabilities: string[];
  status: "connected" | "available" | "not-configured" | "unsupported" | "error";
}

export interface Project {
  id: string;
  name: string;
  summary: string;
  journeyStage: "idea" | "scope" | "system" | "build" | "proof";
  documents: SourceDocument[];
  entities: GraphEntity[];
  relationships: GraphRelationship[];
  criteria: AcceptanceCriterion[];
  questions: ClarificationQuestion[];
  tasks: BuildTask[];
}

