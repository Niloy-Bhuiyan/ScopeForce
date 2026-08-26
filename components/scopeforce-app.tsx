"use client";

import { AppShell } from "./app-shell";
import {
  ArchitectureView, AuthView, BlastRadiusView, BuildView, ClarifyView, HandoffView,
  IntakeView, IntegrationsView, ProjectHomeView, ProofView, ScopeView, SettingsView,
} from "./views";
import { EngineeringGraphView } from "./views/engineering-graph-view";

export function ScopeForceApp({ view }: { view: string }) {
  if (["signin", "signup", "forgot-password", "reset-password", "onboarding"].includes(view)) return <AuthView mode={view} />;
  const views: Record<string, React.ReactNode> = {
    intake: <IntakeView />, projects: <ProjectHomeView />, clarify: <ClarifyView />, scope: <ScopeView />,
    architecture: <ArchitectureView />, graph: <EngineeringGraphView />, build: <BuildView />,
    proof: <ProofView />, "blast-radius": <BlastRadiusView />, handoff: <HandoffView />,
    integrations: <IntegrationsView />, settings: <SettingsView />,
  };
  return <AppShell view={view}>{views[view] ?? <ProjectHomeView />}</AppShell>;
}

