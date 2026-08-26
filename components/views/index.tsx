"use client";

import Link from "next/link";
import {
  AlertTriangle, ArrowRight, AudioLines, BellRing, Blocks, Bot, Check, CheckCircle2,
  ChevronRight, CircleHelp, CloudUpload, Code2, Database, Download, FileJson, FileText,
  GitFork, GitPullRequest, KeyRound, Layers3, LockKeyhole, Mic, Network, Pause, Play,
  RotateCcw, Settings2, ShieldCheck, Sparkles, Square, Upload, UserRound, UsersRound, XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { campusLink, providers } from "@/lib/domain/demo";
import { useScopeStore } from "@/lib/store/use-scope-store";
import { Brand } from "../brand";
import { ScopeGraph } from "../scope-graph";

function PageHeading({ eyebrow, title, accent, description, actions }: { eyebrow?: string; title: string; accent?: string; description: string; actions?: React.ReactNode }) {
  return <div className="page-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}{accent && <> <em>{accent}</em></>}</h1><p>{description}</p></div>{actions && <div className="heading-actions">{actions}</div>}</div>;
}

function Status({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "success" | "warning" | "danger" | "info" | "neutral" }) {
  return <span className={`status ${tone}`}>{tone === "success" && <Check size={12} />}{children}</span>;
}

export function IntakeView() {
  const [tab, setTab] = useState<"notes" | "files" | "voice">("notes");
  const [notes, setNotes] = useState("A student services platform that connects learners to campus resources. Students sign up with a campus email and must verify it before reaching protected areas.");
  const [ragState, setRagState] = useState<"idle" | "indexing" | "indexed" | "error">("idle");
  const [recording, setRecording] = useState<"idle" | "recording" | "stopped" | "denied" | "unsupported">("idle");
  const recorder = useRef<MediaRecorder | null>(null);
  const addDocument = useScopeStore((state) => state.addDocument);
  const markDocument = useScopeStore((state) => state.markDocument);
  const showToast = useScopeStore((state) => state.showToast);

  const ingest = async (content: string, name: string) => {
    const document = { id: `SRC-${String(Date.now()).slice(-4)}`, name, content, status: "indexing" as const };
    addDocument(document); setRagState("indexing");
    try {
      const response = await fetch("/api/ai/ingest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ project_id: campusLink.id, documents: [{ source_id: document.id, name, content }] }) });
      if (!response.ok) throw new Error("Indexing failed");
      markDocument(document.id, "indexed"); setRagState("indexed"); showToast("Project context indexed with source traceability.");
    } catch {
      markDocument(document.id, "local"); setRagState("error"); showToast("Saved locally. AI indexing is unavailable in this dev runtime.");
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    if (file.size > 2_000_000 || !["text/plain", "text/markdown", "application/json", "text/csv"].includes(file.type) && !/\.(txt|md|json|csv)$/i.test(file.name)) {
      setRagState("error"); showToast("This file type isn’t supported. Use TXT, MD, JSON, or CSV under 2 MB."); return;
    }
    await ingest(await file.text(), file.name);
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") { setRecording("unsupported"); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorder.current = new MediaRecorder(stream);
      recorder.current.start(); setRecording("recording");
    } catch { setRecording("denied"); }
  };
  const stopRecording = () => { recorder.current?.stop(); recorder.current?.stream.getTracks().forEach((track) => track.stop()); setRecording("stopped"); };

  return <section>
    <PageHeading eyebrow="Idea intake" title="Turn rough ideas into" accent="buildable software." description="Capture what you know. ScopeForce turns it into a system, a graph, and a proof plan." />
    <div className="intake-layout">
      <div className="paper-card intake-card">
        <div className="tab-bar" role="tablist">
          <button className={tab === "notes" ? "active" : ""} onClick={() => setTab("notes")}><FileText size={18} /> Paste notes</button>
          <button className={tab === "files" ? "active" : ""} onClick={() => setTab("files")}><Upload size={18} /> Upload files</button>
          <button className={tab === "voice" ? "active" : ""} onClick={() => setTab("voice")}><Mic size={18} /> Voice note</button>
        </div>
        {tab === "notes" && <><label className="sr-only" htmlFor="idea-notes">Product notes</label><textarea id="idea-notes" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={4000} /><div className="field-meta"><span>Plain language is perfect.</span><span>{notes.length} / 4000</span></div></>}
        {tab === "files" && <label className="upload-zone"><input type="file" onChange={(event) => handleFiles(event.target.files)} accept=".txt,.md,.json,.csv" /><CloudUpload size={32} /><strong>Choose project context</strong><span>TXT, Markdown, JSON, or CSV · 2 MB max</span></label>}
        {tab === "voice" && <div className="voice-zone"><div className={`voice-orb ${recording}`}><AudioLines size={30} /></div><strong>{recording === "recording" ? "Listening…" : recording === "stopped" ? "Voice note captured locally" : "Record a voice note"}</strong><p>{recording === "denied" ? "Microphone permission was denied. Upload a file instead." : recording === "unsupported" ? "Voice recording is not supported here. Upload a file instead." : "Your browser will ask before using the microphone."}</p>{recording === "recording" ? <button className="button secondary" onClick={stopRecording}><Square size={16} /> Stop recording</button> : <button className="button secondary" onClick={startRecording}><Mic size={16} /> Start recording</button>}</div>}
        <div className="intake-footer"><div className={`rag-state ${ragState}`}>{ragState === "indexing" ? "Indexing context…" : ragState === "indexed" ? "Context indexed" : ragState === "error" ? "Local draft safe" : "Private workspace draft"}</div><button className="button primary" disabled={tab === "notes" && notes.trim().length < 20} onClick={() => ingest(notes, "Intake notes")}>Structure idea <ArrowRight size={17} /></button></div>
      </div>
      <aside className="paper-card outcome-card"><h2>What you’ll get</h2>{[[FileJson,"A structured brief","Stable needs and requirements"],[CircleHelp,"Key questions","Only decisions that change engineering"],[Layers3,"System design","Architecture linked to intent"],[Network,"Build graph & proof","Tasks, code, tests, and evidence"]].map(([Icon,title,detail]) => { const ItemIcon = Icon as typeof FileJson; return <div className="outcome-row" key={String(title)}><span><ItemIcon size={20} /></span><div><strong>{String(title)}</strong><p>{String(detail)}</p></div></div>; })}<div className="privacy-note"><LockKeyhole size={16} /> Your context stays under your control.</div></aside>
    </div>
    <div className="flow-preview">{[["01","Brief"],["02","Questions"],["03","System"],["04","Build Graph"],["05","Proof"]].map(([number,label], index) => <div key={label} className="flow-step"><span>{number}</span><strong>{label}</strong>{index < 4 && <ArrowRight size={15} />}</div>)}</div>
  </section>;
}

export function ProjectHomeView() {
  return <section>
    <PageHeading eyebrow="Projects / CampusLink" title="CampusLink" description={campusLink.summary} actions={<Link className="button secondary" href="/settings"><Settings2 size={16} /> Project settings</Link>} />
    <div className="journey">{[["Idea","Define the opportunity"],["Scope","Clarify what matters"],["System","Design the foundation"],["Build","Control execution"],["Proof","Validate outcomes"]].map(([title,detail], index) => <div key={title} className={`journey-step ${index <= 3 ? "complete" : ""} ${index === 3 ? "current" : ""}`}><span>{index + 1}</span><strong>{title}</strong><small>{detail}</small></div>)}</div>
    <div className="project-grid">
      <article className="paper-card project-signal"><div className="signal-title"><Sparkles size={22} /><div><h2>CampusLink is moving well</h2><p>The system is coherent. Two decisions need your review before the build advances.</p></div></div><h3>Decisions needing review</h3><Link href="/clarify" className="decision-row"><span><KeyRound size={18} /></span><div><strong>Authentication boundary</strong><p>Decide which routes are public before verification.</p></div><ArrowRight size={16} /></Link><Link href="/architecture" className="decision-row"><span><Database size={18} /></span><div><strong>Storage strategy</strong><p>Confirm the source of truth for campus identity.</p></div><ArrowRight size={16} /></Link></article>
      <article className="paper-card system-preview"><ScopeGraph mode="engineering" /><Link href="/graph">Explore the Engineering Graph <ArrowRight size={15} /></Link></article>
    </div>
    <div className="attention-strip"><div><Status tone="success">28 requirements understood</Status><p>Most scope is stable.</p></div><div><Status tone="info">14 build tasks</Status><p>One collision needs review.</p></div><div><Status tone="warning">1 drift signal</Status><p>Missing protected-route evidence.</p></div><Link className="button primary" href="/graph">View project graph <ArrowRight size={16} /></Link></div>
  </section>;
}

export function ClarifyView() {
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const answerQuestion = useScopeStore((state) => state.answerQuestion);
  const generate = async () => { setLoading(true); try { await fetch("/api/ai/clarify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ project_id: campusLink.id, topic: "email verification access boundary", top_k: 4 }) }); setGenerated(true); } catch { setGenerated(true); } finally { setLoading(false); } };
  return <section><PageHeading eyebrow="CampusLink / Scope" title="Clarify what changes engineering." description="Only questions with downstream consequences are surfaced." actions={<button className="button secondary" onClick={generate} disabled={loading}><Sparkles size={16} /> {loading ? "Retrieving context…" : "Propose grounded questions"}</button>} />
    {generated && <div className="inline-message info"><Bot size={18} /><div><strong>Demo grounding path</strong><p>Questions are based on SRC-001. Configure OpenAI to use live structured generation.</p></div></div>}
    <div className="question-layout"><div className="question-list">{campusLink.questions.map((question) => <article className="paper-card question-card" key={question.id}><div className="question-top"><span className="question-category">{question.category}</span><Status tone={question.impact === "high" ? "danger" : "warning"}>{question.impact} impact</Status></div><h2>{question.question}</h2><div className="why"><CircleHelp size={17} /><div><strong>Why this matters</strong><p>{question.why}</p></div></div><div className="source-row"><FileText size={14} /> Grounded in <button>SRC-001 · CampusLink product brief</button></div>{question.status === "answered" ? <div className="answer-saved"><CheckCircle2 size={17} /> {question.answer}</div> : <div className="question-actions"><button className="button primary small" onClick={() => answerQuestion(question.id)}>Answer</button><button className="button ghost small">Defer</button></div>}</article>)}</div>
    <aside className="paper-card clarify-summary"><h2>Scope signal</h2><div className="summary-number">3<span>material questions</span></div><div className="summary-row"><span>Security boundary</span><Status tone="danger">High</Status></div><div className="summary-row"><span>Provider choice</span><Status tone="warning">Medium</Status></div><div className="summary-row"><span>Token policy</span><Status tone="success">Resolved</Status></div><Link href="/scope" className="button primary">Review structured scope <ArrowRight size={16} /></Link></aside></div>
  </section>;
}

export function ScopeView() {
  const [editing, setEditing] = useState(false);
  return <section><PageHeading eyebrow="CampusLink / Scope" title="Structured scope" description="Stable objects—not a single markdown document." actions={<button className="button secondary" onClick={() => setEditing(!editing)}>{editing ? "Finish editing" : "Edit scope"}</button>} />
    <div className="scope-columns"><aside className="scope-index paper-card"><strong>Scope objects</strong>{["User needs  4","Requirements  12","Constraints  5","Assumptions  3","Acceptance criteria  24","Unresolved  2"].map((item, index) => <button className={index === 1 ? "active" : ""} key={item}>{item}</button>)}</aside><div className="scope-detail paper-card"><div className="scope-detail-head"><div><span className="entity-type kind-requirement">Requirement</span><h2>REQ-014 · Verify user email</h2></div><Status tone="success">On track</Status></div><label>Requirement statement<textarea disabled={!editing} defaultValue="Students must verify their unique campus email address before accessing protected areas." /></label><div className="detail-grid"><div><span>Derived from</span><button className="linked-row"><span>UN-001</span>Trusted campus access</button></div><div><span>Architecture</span><button className="linked-row"><span>ADR-007</span>Auth Service</button></div></div><h3>Acceptance criteria</h3>{campusLink.criteria.map((criterion) => <label className="criterion" key={criterion.id}><input type="checkbox" defaultChecked={criterion.verified} disabled={!editing} /><span><strong>{criterion.id}</strong>{criterion.statement}</span></label>)}<div className="source-evidence"><FileText size={18} /><div><strong>Grounding evidence</strong><p>SRC-001 supports the verification rule and token expiry. The protected-area definition remains unresolved.</p></div><Status tone="info">2 chunks</Status></div></div></div>
  </section>;
}

export function ArchitectureView() {
  return <section><PageHeading eyebrow="CampusLink / System" title="Design decisions with lineage." description="Components and boundaries stay connected to the requirements they serve." />
    <div className="architecture-layout"><div className="paper-card architecture-canvas"><div className="boundary-label">Public client</div><div className="arch-node"><UsersRound /><strong>Web App</strong><span>Next.js</span></div><ChevronRight className="arch-arrow" /><div className="security-boundary"><span>Security boundary</span><div className="arch-node accent"><ShieldCheck /><strong>API Gateway</strong><span>Route guards</span></div><div className="arch-stack"><div className="arch-node selected"><KeyRound /><strong>Auth Service</strong><span>ADR-007</span></div><div className="arch-node"><UserRound /><strong>User Service</strong><span>Profiles</span></div></div></div><ChevronRight className="arch-arrow" /><div className="arch-stack"><div className="arch-node"><Database /><strong>PostgreSQL</strong><span>Identity data</span></div><div className="arch-node"><BellRing /><strong>Notification</strong><span>Email delivery</span></div></div></div>
    <aside className="paper-card architecture-inspector"><span className="entity-type kind-architecture">Architecture decision</span><h2>ADR-007</h2><h3>Signed, time-limited verification token</h3><p>Keep verification authority inside Auth Service and expose a single-use activation endpoint.</p><h4>Rationale</h4><p>Meets REQ-014 without giving the notification provider access to identity state.</p><h4>Requirement lineage</h4><button className="linked-row"><span>REQ-014</span>Verify user email</button><h4>Security boundary</h4><Status tone="warning">Identity write access</Status></aside></div>
  </section>;
}

export function BuildView() {
  const tasks = useScopeStore((state) => state.tasks);
  const paused = useScopeStore((state) => state.buildPaused);
  const toggle = useScopeStore((state) => state.toggleBuild);
  const advance = useScopeStore((state) => state.advance);
  const resolve = useScopeStore((state) => state.resolveCollision);
  const hasConflict = tasks.some((task) => task.status === "conflict");
  const lanes = ["Data", "API", "Frontend", "QA"] as const;
  return <section><PageHeading eyebrow="Build orchestration · Simulation" title="Control the build," accent="not just the prompts." description="A deterministic demo engine plans, progresses, and verifies work without pretending a provider ran it." actions={<Status tone="info">Simulation mode</Status>} />
    <div className="build-layout"><div className="paper-card build-board"><div className="build-legend">{["running","waiting","verified","blocked","conflict"].map((status) => <span key={status}><i className={status} />{status}</span>)}</div>{lanes.map((lane) => <div className="build-lane" key={lane}><div className="lane-label"><span>{lane === "Data" ? <Database /> : lane === "API" ? <Blocks /> : lane === "Frontend" ? <Code2 /> : <ShieldCheck />}</span><strong>{lane}</strong><small>Deterministic lane</small></div><div className="lane-tasks">{tasks.filter((task) => task.lane === lane).map((task) => <article className={`task-card ${task.status}`} key={task.id}><span>{task.id}</span><strong>{task.title}</strong><small>{task.provider}</small><Status tone={task.status === "verified" ? "success" : task.status === "conflict" ? "danger" : task.status === "running" ? "info" : "neutral"}>{task.status}</Status></article>)}</div></div>)}
      <div className="build-controls"><button className="button primary" onClick={toggle}>{paused ? <Play size={16} /> : <Pause size={16} />}{paused ? "Resume build" : "Pause build"}</button><button className="button secondary" onClick={advance} disabled={hasConflict}>Advance one step</button><span><ShieldCheck size={16} /> Safe mode on</span></div></div>
      <aside>{hasConflict ? <article className="paper-card conflict-card"><div className="conflict-icon"><AlertTriangle /></div><Status tone="danger">Predicted conflict</Status><h2>Both tasks affect User Service.</h2><p>TASK-020 and TASK-021 modify the same module without an explicit order.</p><h3>Recommendation</h3><strong>Run handlers before the user module.</strong><p className="muted">This establishes the contract before the dependent update lands.</p><button className="button primary" onClick={resolve}>Reorder safely <RotateCcw size={16} /></button></article> : <article className="paper-card conflict-card resolved"><CheckCircle2 /><Status tone="success">Parallelism safe</Status><h2>The collision is resolved.</h2><p>TASK-021 now waits for TASK-020. The build can advance.</p></article>}<article className="paper-card activity-card"><h3>Build activity</h3>{tasks.slice(-4).map((task) => <div key={task.id}><i className={task.status} /><span><strong>{task.title}</strong><small>{task.status}</small></span></div>)}</article></aside></div>
  </section>;
}

export function ProofView() {
  const repaired = useScopeStore((state) => state.driftRepaired);
  const repair = useScopeStore((state) => state.createRepairTask);
  const chain = [[FileText,"Requirement","REQ-014","Verify user email"],[Code2,"Implementation","auth/verify.ts","Token verification"],[ShieldCheck,"Tests","TEST-014","12 assertions passed"],[GitPullRequest,"Evidence","PR #341","Approved review"],[CheckCircle2,"Result","RESULT-014","Partially verified"]] as const;
  return <section><PageHeading eyebrow="Proof & verification" title="Prove the build still matches" accent="the plan." description="Every claim is backed by linked implementation, tests, and evidence." />
    <div className="proof-layout"><div className="paper-card proof-chain"><div className="proof-selected"><span>Selected requirement</span><h2>REQ-014 · Verify user email</h2><p>Unverified students must not access protected areas.</p></div><div className="evidence-chain">{chain.map(([Icon,label,id,title], index) => <article key={id}><span className="evidence-check">{index < 4 ? <Check /> : <AlertTriangle />}</span><div className="evidence-icon"><Icon /></div><small>{label}</small><strong>{title}</strong><span>{id}</span>{index < chain.length - 1 && <ArrowRight className="chain-arrow" />}</article>)}</div>
      {!repaired ? <div className="drift-panel"><AlertTriangle /><div><Status tone="danger">Drift detected</Status><h3>The dashboard route permits unverified users.</h3><p>The plan requires verified email access. No passing route-guard evidence is linked to REQ-014.</p></div><button className="button primary" onClick={repair}>Create repair task</button></div> : <div className="drift-panel resolved"><CheckCircle2 /><div><Status tone="success">Repair planned</Status><h3>TASK-024 now closes the evidence gap.</h3><p>The task is linked to REQ-014 and ready in the Build view.</p></div><Link href="/build" className="button secondary">View task <ArrowRight size={16} /></Link></div>}</div>
    <aside className="paper-card verification-summary"><h2>Verification summary</h2><div className={repaired ? "verify-state" : "verify-state warning"}>{repaired ? <ShieldCheck /> : <AlertTriangle />}<strong>{repaired ? "Repair planned" : "Evidence incomplete"}</strong><p>{repaired ? "All known gaps have assigned work." : "Two criteria pass; protected-route proof is missing."}</p></div>{campusLink.criteria.map((criterion) => <div className="summary-row" key={criterion.id}><span>{criterion.id}</span>{criterion.verified ? <CheckCircle2 className="success-icon" /> : <XCircle className="danger-icon" />}</div>)}</aside></div>
  </section>;
}

export function BlastRadiusView() {
  const created = useScopeStore((state) => state.impactPlanCreated);
  const createPlan = useScopeStore((state) => state.createImpactPlan);
  return <section><PageHeading eyebrow="CampusLink / Change impact" title="Blast Radius" description="See how one changed requirement propagates through the same Engineering Graph." />
    <div className="change-card paper-card"><div><span>Proposed change</span><h2>Users can belong to multiple organizations.</h2><p>Membership roles and permissions become organization-scoped.</p></div><div><span>Change type</span><Status tone="warning">Feature</Status></div><div><span>Source</span><strong>Intake brief</strong><small>Today, 9:41 AM</small></div></div>
    <div className="impact-layout"><div className="paper-card impact-graph"><div className="graph-subnav"><span><i className="changed" /> Changed</span><span><i className="direct" /> Direct impact</span><span><i className="indirect" /> Indirect impact</span></div><ScopeGraph mode="impact" /></div><aside className="paper-card impact-summary"><h2>Impact summary</h2><div className="risk-line"><span>Risk level</span><Status tone="danger">High</Status></div>{[[Network,"Impacted services","5","2 direct · 3 indirect"],[Database,"Data assets","1","Membership table"],[Code2,"APIs to update","3","2 internal · 1 external"],[ShieldCheck,"Affected tests","12","Security and access"]].map(([Icon,label,value,detail]) => { const I = Icon as typeof Network; return <div className="impact-stat" key={String(label)}><span><I /></span><div><strong>{String(label)}</strong><small>{String(detail)}</small></div><b>{String(value)}</b></div>; })}<div className="effort"><span>Estimated rework</span><strong>2–3 weeks</strong></div><button className="button primary" onClick={createPlan} disabled={created}>{created ? <CheckCircle2 /> : <Network />}{created ? "Impact plan created" : "Create impact plan"}</button></aside></div>
  </section>;
}

export function HandoffView() {
  const tasks = useScopeStore((state) => state.tasks);
  const showToast = useScopeStore((state) => state.showToast);
  const download = () => { const payload = { exportedAt: new Date().toISOString(), truth: { real: ["graph", "RAG API", "export"], simulated: ["coding provider execution"] }, project: { ...campusLink, tasks } }; const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })); const link = document.createElement("a"); link.href = url; link.download = "campuslink-build-package.json"; link.click(); URL.revokeObjectURL(url); showToast("Structured build package exported."); };
  return <section className="handoff-page"><div className="handoff-main"><Status tone="success">You’re all set</Status><h1>Handoff with<br /><em>confidence.</em></h1><p>Everything material is structured, traceable, and ready for the next build decision.</p><div className="completion-list">{["Requirements verified","Architecture complete","Execution graph prepared","Proof gaps assigned"].map((item) => <div key={item}><span><Check /></span><strong>{item}</strong></div>)}</div><div className="handoff-actions"><Link href="/build" className="button primary"><Bot size={17} /> Build with agents <ArrowRight size={16} /></Link><button className="button secondary" onClick={download}><Download size={17} /> Export build package</button></div><small className="secure-line"><LockKeyhole size={14} /> Secure. Reproducible. Explicit about simulated execution.</small></div><aside className="paper-card export-card"><h2>Export destinations</h2>{[[GitFork,"GitHub repository","Push code and documents"],[FileJson,"Handoff pack","Structured project graph"],[FileText,"Docs bundle","Architecture and product docs"]].map(([Icon,title,detail]) => { const I = Icon as typeof GitFork; return <button key={String(title)} onClick={String(title) === "Handoff pack" ? download : undefined}><span><I /></span><div><strong>{String(title)}</strong><small>{String(detail)}</small></div><ChevronRight /></button>; })}<div className="transfer-note"><ShieldCheck /><div><strong>Transfer with confidence</strong><p>Every claim is connected to its source and evidence state.</p></div></div></aside></section>;
}

export function IntegrationsView() {
  const providerIcon: Record<string, typeof GitFork> = { github: GitFork, openai: Bot, gemini: Sparkles, claude: Bot, grok: Network };
  return <section><PageHeading eyebrow="Provider boundary" title="Integrations" description="Connect the tools and models you use. Statuses below are intentionally truthful." />
    <div className="integrations-layout"><div className="provider-list">{providers.map((provider) => { const Icon = providerIcon[provider.id]; const tone = provider.status === "connected" ? "success" : provider.status === "available" ? "info" : provider.status === "not-configured" ? "warning" : "neutral"; return <article className="paper-card provider-card" key={provider.id}><span className={`provider-icon ${provider.id}`}><Icon /></span><div><h2>{provider.name}</h2><p>{provider.capabilities.join(" · ")}</p></div><Status tone={tone}>{provider.status.replace("-", " ")}</Status><ChevronRight /></article>; })}<div className="inline-message warning"><AlertTriangle /><div><strong>No coding provider is executing work.</strong><p>Build orchestration is a labelled deterministic simulation. OpenAI is used only for Project Context Intelligence when configured.</p></div></div></div><aside className="paper-card adapter-card"><h2>How it works</h2><p>ScopeForce routes capabilities through explicit adapters while deterministic software retains graph, permission, and dependency control.</p><div className="adapter-diagram"><div><Brand compact /></div><ArrowRight /><div>Provider<br />adapter</div><ArrowRight /><div className="adapter-stack"><span>GitHub <Check /></span><span>OpenAI <AlertTriangle /></span><span>Gemini <i /></span></div></div><hr /><h3>Your data. Your choice.</h3><p><ShieldCheck /> Secrets stay in environment variables.</p><p><Settings2 /> Enable only the capabilities you need.</p><p><Network /> The graph remains provider-neutral.</p></aside></div>
  </section>;
}

export function SettingsView() {
  const [section, setSection] = useState("Profile");
  return <section><PageHeading eyebrow="Workspace" title="Settings" description="Manage your identity, workspace defaults, preferences, and plan." />
    <div className="settings-layout"><aside className="settings-nav paper-card">{["Profile","Workspace","Notifications","Integrations","Plan & Billing"].map((item) => <button className={section === item ? "active" : ""} key={item} onClick={() => setSection(item)}>{item}</button>)}<Link href="/signin">Sign out</Link></aside><div className="settings-panel paper-card">{section === "Plan & Billing" ? <><h2>Plan & Billing</h2><p>No payment method is stored. This is subscription UI only.</p><div className="plan-grid"><article><Status tone="neutral">Starter</Status><h3>$0 <small>/ month</small></h3><p>One project, local graph, demo orchestration.</p><button className="button secondary">Current plan</button></article><article className="featured"><Status tone="success">Pro</Status><h3>$29 <small>/ month</small></h3><p>Unlimited graphs, durable context, team review.</p><button className="button primary">Join waitlist</button></article></div></> : section === "Notifications" ? <><h2>Notification preferences</h2><p>Choose which engineering signals should interrupt you.</p>{["Decision needs review","Predicted conflict","Drift detected","Verification passed","Deployment complete"].map((item, index) => <label className="toggle-row" key={item}><span><strong>{item}</strong><small>{index < 2 ? "Immediate" : "In activity drawer"}</small></span><input type="checkbox" defaultChecked={index !== 4} /></label>)}</> : <><h2>{section}</h2><p>These demo settings are saved in this browser only.</p><label>Display name<input defaultValue="Niloy Bhuiyan" /></label><label>Workspace name<input defaultValue="ScopeForce workspace" /></label><label>Default project<input defaultValue="CampusLink" /></label><button className="button primary">Save changes</button></>}</div></div>
  </section>;
}

export function AuthView({ mode }: { mode: string }) {
  const title = mode === "signup" ? "Create your workspace" : mode === "forgot-password" ? "Reset your password" : mode === "reset-password" ? "Choose a new password" : mode === "onboarding" ? "Shape your first project" : "Welcome back";
  return <main className="auth-page"><section className="auth-brand-panel"><Brand /><div><span className="eyebrow">Engineering control plane</span><h1>From intent<br />to <em>evidence.</em></h1><p>Scope every decision, control the build, and prove what shipped.</p></div><small>ScopeForce · MVP</small></section><section className="auth-form-panel"><form className="auth-card" onSubmit={(event) => event.preventDefault()}><Status tone="success">Demo authentication</Status><h2>{title}</h2><p>This local boundary demonstrates the complete account flow without faking OAuth.</p>{mode !== "forgot-password" && <label>Full name<input placeholder="Your name" autoComplete="name" /></label>}<label>Email<input type="email" placeholder="you@company.com" autoComplete="email" /></label>{!["forgot-password","onboarding"].includes(mode) && <label>Password<input type="password" placeholder="••••••••••" autoComplete={mode === "signup" ? "new-password" : "current-password"} /></label>}<Link href={mode === "onboarding" ? "/intake" : "/projects"} className="button primary">{mode === "signup" ? "Create workspace" : mode === "forgot-password" ? "Send reset link" : mode === "onboarding" ? "Start with an idea" : "Continue to ScopeForce"}<ArrowRight size={16} /></Link><div className="auth-links">{mode === "signin" ? <><Link href="/forgot-password">Forgot password?</Link><Link href="/signup">Create account</Link></> : <Link href="/signin">Back to sign in</Link>}</div></form></section></main>;
}
