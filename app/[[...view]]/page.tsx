import { ScopeForceApp } from "@/components/scopeforce-app";

export default async function Page({ params }: { params: Promise<{ view?: string[] }> }) {
  const { view } = await params;
  return <ScopeForceApp view={(view ?? ["intake"]).join("/")} />;
}

