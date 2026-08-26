"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { campusLink } from "@/lib/domain/demo";
import { traceLineage } from "@/lib/domain/graph";
import { useScopeStore } from "@/lib/store/use-scope-store";
import { ScopeGraph } from "../scope-graph";

export function EngineeringGraphView() {
  const selectedId = useScopeStore((state) => state.selectedNodeId);
  const setSelected = useScopeStore((state) => state.setSelectedNode);
  const [query, setQuery] = useState("");
  const selected = campusLink.entities.find((entity) => entity.id === selectedId) ?? campusLink.entities[1];
  const lineage = useMemo(() => traceLineage(selected.id, campusLink.relationships), [selected.id]);
  const related = campusLink.entities.filter((entity) => lineage.connected.has(entity.id) && entity.id !== selected.id);
  const searchResults = query.trim() ? campusLink.entities.filter((entity) => `${entity.id} ${entity.title}`.toLowerCase().includes(query.toLowerCase())) : [];

  return (
    <section className="graph-page full-bleed-page">
      <div className="graph-page-head">
        <div><span className="eyebrow">Traceability</span><h1>Engineering Graph</h1><p>See why every line of software exists—and what it proves.</p></div>
        <div className="graph-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find ID or entity" aria-label="Search graph" />
          {searchResults.length > 0 && <div className="search-popover">{searchResults.map((entity) => <button key={entity.id} onClick={() => { setSelected(entity.id); setQuery(""); }}><span>{entity.id}</span>{entity.title}</button>)}</div>}
        </div>
      </div>
      <div className="graph-layout">
        <ScopeGraph />
        <aside className="graph-inspector">
          <span className={`entity-type kind-${selected.kind}`}>{selected.kind}</span>
          <h2>{selected.id}</h2>
          <h3>{selected.title}</h3>
          {selected.status && <span className="status success">{selected.status.replace("-", " ")}</span>}
          <div className="inspector-section"><h4>Description</h4><p>{selected.description}</p></div>
          {selected.sourceIds?.length ? <div className="inspector-section"><h4>Grounded by</h4>{selected.sourceIds.map((id) => <button className="linked-row" key={id}><span>{id}</span>CampusLink brief</button>)}</div> : null}
          <div className="inspector-section"><h4>Linked lineage</h4>{related.slice(0, 6).map((entity) => <button className="linked-row" key={entity.id} onClick={() => setSelected(entity.id)}><span>{entity.id}</span>{entity.title}</button>)}</div>
          <div className="inspector-meta"><span>Created</span><strong>Aug 26, 2026</strong><span>Project</span><strong>CampusLink</strong></div>
        </aside>
      </div>
    </section>
  );
}

