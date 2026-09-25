import { useEffect, useState } from "react";
import { ArrowUpRight, Ambulance, Boxes, BrainCircuit, GitMerge, Home, LayoutDashboard, LoaderCircle, MapPinned, MessageCircle, Radio, RefreshCw, Route, ShieldAlert, UsersRound, Volume2 } from "lucide-react";

import {
  healthCheck,
  runCoordination,
  runLiveCoordination,
  runSimulation,
  speakText,
} from "../services/api";

import CoordinationFlow from "../components/CoordinationFlow";
import EmergencyMap from "../components/EmergencyMap";

import {
  IncidentIntakeForm,
  IncidentOverview,
} from "../components/IncidentPanel";

import AgentGrid from "../components/AgentGrid";
import ConflictPanel from "../components/ConflictPanel";
import DecisionPanel from "../components/DecisionPanel";
import ResourcePanel from "../components/ResourcePanel";
import WhatIfPanel from "../components/WhatIfPanel";
import OperationalFeed from "../components/OperationalFeed";
import AssistantPanel from "../components/AssistantPanel";


const DEFAULT_INCIDENT = {
  incident_id: "FLOOD-001",
  incident_type: "Flood",
  location: "Zone A",
  severity: 9,
  affected_population: 8000,
  blocked_routes: ["Route A"],
  active_routes: ["Route B", "Route C"],
  available_ambulances: 2,
  available_shelters: 2,
  urgent_needs: ["medical supplies", "food", "water"],
};


export default function Dashboard({ user, accessToken }) {

  // =========================================================
  // INCIDENT
  // =========================================================

  const [incidentDraft, setIncidentDraft] =
    useState(DEFAULT_INCIDENT);

  const [coordinationResult, setCoordinationResult] =
    useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  // =========================================================
  // SIMULATION
  // =========================================================

  const [simulationResult, setSimulationResult] =
    useState(null);

  const [simulationLoading, setSimulationLoading] =
    useState(false);

  const [simulationError, setSimulationError] =
    useState(null);


  // =========================================================
  // SYSTEM STATUS
  // =========================================================

  const [systemStatus, setSystemStatus] =
    useState("checking");


  // =========================================================
  // VOICE
  // =========================================================

  const [voiceLoading, setVoiceLoading] =
    useState(false);

  const [voiceLanguage, setVoiceLanguage] =
    useState("en");

  const [voiceError, setVoiceError] =
    useState(null);


  // =========================================================
  // HEALTH CHECK
  // =========================================================

  useEffect(() => {

    let cancelled = false;

    healthCheck()
      .then(() => {

        if (!cancelled) {
          setSystemStatus("operational");
        }

      })
      .catch(() => {

        if (!cancelled) {
          setSystemStatus("offline");
        }

      });

    return () => {
      cancelled = true;
    };

  }, []);


  // =========================================================
  // RUN COORDINATION
  // =========================================================

  const handleRunCoordination = async () => {

    setLoading(true);
    setError(null);

    setSimulationResult(null);
    setSimulationError(null);
    setVoiceError(null);

    try {

      const result =
        await runCoordination(incidentDraft);

      setCoordinationResult(result);

      setSystemStatus("operational");

    } catch (err) {

      setError(err.message);

      if (err.status === null) {
        setSystemStatus("offline");
      }

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // =========================================================
  // RECALCULATE FROM LIVE AGENCY UPDATES
  // =========================================================

  const handleRunLiveCoordination = async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const result = await runLiveCoordination(incidentDraft, accessToken);
      setIncidentDraft(result.incident);
      setCoordinationResult(result);
      setSystemStatus("operational");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  // RUN SIMULATION
  // =========================================================

  const handleRunSimulation = async (
    simulatedChanges
  ) => {

    setSimulationLoading(true);
    setSimulationError(null);

    try {

      const result =
        await runSimulation(
          coordinationResult.incident,
          simulatedChanges
        );

      setSimulationResult(result);

    } catch (err) {

      setSimulationError(err.message);

    } finally {

      setSimulationLoading(false);

    }

  };


  // =========================================================
  // SPEAK COORDINATOR DECISION
  // =========================================================

  const handleSpeakDecision = async () => {

    if (!coordinationResult?.response_plan) {
      return;
    }

    setVoiceLoading(true);
    setVoiceError(null);

    try {

      const plan =
        coordinationResult.response_plan;


      const text = [

        "Emergency response decision.",

        `Overall priority is ${plan.overall_priority} out of 10.`,

        ...(plan.selected_actions?.length
          ? [
              "Selected actions.",
              ...plan.selected_actions,
            ]
          : []),

        ...(plan.reasoning?.length
          ? [
              "Decision reasoning.",
              ...plan.reasoning,
            ]
          : []),

      ].join(" ");


      console.log(
        "Generating voice:",
        {
          language: voiceLanguage,
          text,
        }
      );


      const audioBlob =
        await speakText(
          text,
          voiceLanguage
        );


      if (!audioBlob || audioBlob.size === 0) {
        throw new Error(
          "The voice service returned empty audio."
        );
      }


      const audioUrl =
        URL.createObjectURL(audioBlob);

      const audio =
        new Audio(audioUrl);

      audio.volume = 1.0;

      audio.onended = () => {

        URL.revokeObjectURL(
          audioUrl
        );

      };

      audio.onerror = () => {

        console.error(
          "Audio playback failed."
        );

        URL.revokeObjectURL(
          audioUrl
        );

        setVoiceError(
          "Audio was generated but could not be played."
        );

        setVoiceLoading(false);

      };


      await audio.play();

    } catch (err) {

      console.error(
        "Voice generation/playback error:",
        err
      );

      setVoiceError(
        err?.message ||
        "Unable to generate or play the emergency voice."
      );

    } finally {

      setVoiceLoading(false);

    }

  };


  // =========================================================
  // COORDINATION PHASE
  // =========================================================

  const phase =
    loading
      ? "running"
      : coordinationResult
      ? "done"
      : "idle";


  // =========================================================
  // UI / MODULE NAVIGATION
  // =========================================================

  const [activeModule, setActiveModule] = useState("command");
  const [assistantOpen, setAssistantOpen] = useState(false);

  const modules = [
    { id: "command", label: "Command Center", icon: ShieldAlert },
    { id: "assistant", label: "AI Assistant", icon: MessageCircle },
    { id: "voice", label: "Voice Briefing", icon: Volume2 },
    { id: "agents", label: "Agent Intelligence", icon: BrainCircuit },
    { id: "conflicts", label: "Conflict Resolution", icon: GitMerge },
    { id: "resources", label: "Resource Allocation", icon: Boxes },
    { id: "simulation", label: "What-If Simulation", icon: RefreshCw },
    { id: "map", label: "Live Response Map", icon: MapPinned },
  ];

  const openModule = (id) => {
    if (!coordinationResult && id !== "command") return;
    setActiveModule(id);
    if (id === "assistant") setAssistantOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderModule = () => {
    if (!coordinationResult) {
      return (
        <section className="animate-rise grid min-h-[68vh] place-items-center rounded-3xl border border-border bg-surface/70 p-8">
          <IncidentIntakeForm
            draft={incidentDraft}
            onChange={setIncidentDraft}
            onSubmit={handleRunCoordination}
            submitting={loading}
          />
        </section>
      );
    }

    switch (activeModule) {
      case "assistant":
        return (
          <section className="animate-rise">
            <ModuleHeader
              eyebrow="GROUNDED COMMAND SUPPORT"
              title="AI Response Assistant"
              description="Ask questions about the current incident, agent reports, conflicts and coordinator decision."
              icon={MessageCircle}
            />
            <AssistantPanel
              incident={coordinationResult.incident}
              responsePlan={coordinationResult.response_plan}
              agentReports={coordinationResult.agent_reports}
            />
          </section>
        );

      case "voice":
        return (
          <section className="animate-rise">
            <ModuleHeader
              eyebrow="MULTILINGUAL DECISION BRIEFING"
              title="Voice Response Briefing"
              description="Turn the current coordinator decision into a concise spoken briefing for response teams."
              icon={Volume2}
            />
            <div className="rounded-3xl border border-coordinator/20 bg-gradient-to-br from-coordinator/[0.12] via-surface to-surface p-6 shadow-2xl shadow-coordinator/5">
              <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-center">
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-coordinator/15 text-coordinator ring-1 ring-coordinator/20">
                      {voiceLoading ? <LoaderCircle className="animate-spin" size={22} /> : <Volume2 size={22} />}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">Coordinator briefing ready</p>
                      <p className="text-xs text-text-tertiary">Human review remains required before real-world dispatch.</p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-border bg-base/40 p-4">
                      <p className="text-[10px] uppercase tracking-widest text-text-tertiary">Priority</p>
                      <p className="mt-1 text-xl font-bold text-text-primary">{coordinationResult.response_plan?.overall_priority ?? "—"}/10</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-base/40 p-4">
                      <p className="text-[10px] uppercase tracking-widest text-text-tertiary">Actions</p>
                      <p className="mt-1 text-xl font-bold text-text-primary">{coordinationResult.response_plan?.selected_actions?.length ?? 0}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-base/40 p-4">
                      <p className="text-[10px] uppercase tracking-widest text-text-tertiary">Language</p>
                      <p className="mt-1 text-xl font-bold text-text-primary">{voiceLanguage === "ta" ? "தமிழ்" : voiceLanguage === "hi" ? "हिन्दी" : "English"}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-base/60 p-4">
                  <label htmlFor="voice-language" className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Briefing language</label>
                  <select
                    id="voice-language"
                    value={voiceLanguage}
                    onChange={(e) => { setVoiceLanguage(e.target.value); setVoiceError(null); }}
                    disabled={voiceLoading}
                    className="mb-3 w-full rounded-xl border border-border bg-surface px-3 py-3 text-sm text-text-primary outline-none focus:border-coordinator/50"
                  >
                    <option value="en">English</option>
                    <option value="ta">தமிழ்</option>
                    <option value="hi">हिन्दी</option>
                  </select>
                  <button
                    onClick={handleSpeakDecision}
                    disabled={voiceLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-coordinator px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-coordinator/20 transition-all hover:-translate-y-0.5 hover:bg-coordinator/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {voiceLoading ? <><LoaderCircle className="animate-spin" size={16} /> Generating...</> : <><Volume2 size={16} /> Speak Decision</>}
                  </button>
                  {voiceError && <p className="mt-3 rounded-xl border border-critical/20 bg-critical/5 p-3 text-xs text-critical">{voiceError}</p>}
                </div>
              </div>
            </div>
          </section>
        );

      case "agents":
        return (
          <section className="animate-rise">
            <ModuleHeader eyebrow="05 SPECIALISTS · PARALLEL ANALYSIS" title="Agent Intelligence" description="Independent specialist reports are reconciled by the coordinator before the response plan is produced." icon={BrainCircuit} />
            <AgentGrid reports={coordinationResult.agent_reports} loading={loading} />
          </section>
        );

      case "conflicts":
        return (
          <section className="animate-rise">
            <ModuleHeader eyebrow="CROSS-AGENCY COORDINATION ENGINE" title="Conflict Resolution" description="Inspect competing recommendations and how the coordinator reconciled resource, route and priority constraints." icon={GitMerge} />
            <ConflictPanel detected={coordinationResult.response_plan?.detected_conflicts} resolved={coordinationResult.response_plan?.resolved_conflicts} />
            <div className="mt-5">
              <DecisionPanel plan={coordinationResult.response_plan} />
            </div>
          </section>
        );

      case "resources":
        return (
          <section className="animate-rise">
            <ModuleHeader eyebrow="RESOURCE ALLOCATION" title="Response Resources" description="Review allocations and simulate safe local dispatch commands. External messaging is not sent by this prototype." icon={Boxes} />
            <ResourcePanel
              incident={coordinationResult.incident}
              allocations={coordinationResult.response_plan?.resource_allocations}
              responsePlan={coordinationResult.response_plan}
            />
          </section>
        );

      case "simulation":
        return (
          <section className="animate-rise">
            <ModuleHeader eyebrow="DYNAMIC RE-PLANNING" title="What-If Simulation" description="Change a route, resource or capacity constraint and see how the response plan changes." icon={RefreshCw} />
            <WhatIfPanel
              incident={coordinationResult.incident}
              onRunSimulation={handleRunSimulation}
              loading={simulationLoading}
              result={simulationResult}
              error={simulationError}
            />
          </section>
        );

      case "map":
        return (
          <section className="animate-rise">
            <ModuleHeader eyebrow="SITUATIONAL AWARENESS" title="Live Response Map" description="A focused operational view of the incident location and emergency resources." icon={MapPinned} />
            <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl">
              <div className="h-[min(72vh,720px)] w-full"><EmergencyMap /></div>
            </div>
          </section>
        );

      default:
        return (
          <section className="animate-rise space-y-5">
            <div className="rounded-3xl border border-border bg-surface p-5 shadow-2xl">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-critical">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-critical" /> Active emergency
                  </div>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-primary">{coordinationResult.incident.incident_id} · {coordinationResult.incident.location}</h2>
                  <p className="mt-1 text-sm text-text-secondary">{coordinationResult.incident.incident_type} response coordination · {coordinationResult.incident.affected_population?.toLocaleString?.() ?? coordinationResult.incident.affected_population} people affected</p>
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-critical/20 bg-critical/5 px-4 py-3">
                  <ShieldAlert size={18} className="text-critical" />
                  <div><p className="text-[10px] uppercase tracking-widest text-text-tertiary">Severity</p><p className="text-lg font-bold text-critical">{coordinationResult.incident.severity}/10</p></div>
                </div>
              </div>
            </div>

            {user?.role === "government" && accessToken && (
              <OperationalFeed accessToken={accessToken} onRecalculate={handleRunLiveCoordination} />
            )}

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Affected", coordinationResult.incident.affected_population?.toLocaleString?.() ?? "—", UsersRound],
                ["Ambulances", coordinationResult.incident.available_ambulances ?? "—", Ambulance],
                ["Shelters", coordinationResult.incident.available_shelters ?? "—", Home],
                ["Blocked routes", coordinationResult.incident.blocked_routes?.length ?? 0, Route],
              ].map(([label, value, Icon]) => (
                <div key={label} className="group rounded-2xl border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-coordinator/30 hover:shadow-lg hover:shadow-coordinator/5">
                  <Icon size={16} className="text-coordinator transition-transform group-hover:scale-110" />
                  <p className="mt-4 text-[10px] uppercase tracking-widest text-text-tertiary">{label}</p>
                  <p className="mt-1 text-2xl font-bold text-text-primary">{value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
              <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl">
                <div className="border-b border-border px-5 py-4">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-safe"><span className="h-2 w-2 animate-pulse rounded-full bg-safe" /> Live response map</div>
                  <h3 className="mt-1 text-base font-semibold text-text-primary">Situational awareness</h3>
                </div>
                <div className="h-[min(52vh,560px)] min-h-[480px]"><EmergencyMap /></div>
              </div>
              <div className="rounded-2xl border border-coordinator/20 bg-surface p-6 shadow-xl shadow-black/10">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-coordinator">AI-assisted response command</p>
                <div className="mt-5 flex items-center justify-between">
                  <div><p className="text-xs text-text-tertiary">Overall priority</p><p className="mt-1 text-4xl font-bold text-text-primary">{coordinationResult.response_plan?.overall_priority ?? "—"}<span className="text-base text-text-tertiary">/10</span></p></div>
                  <div className="rounded-full border border-warning/20 bg-warning/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-warning">Human review</div>
                </div>
                <p className="mt-5 text-sm leading-6 text-text-secondary">{coordinationResult.response_plan?.reasoning?.[0] || "Coordinator has reconciled specialist recommendations into a response plan."}</p>
                <button onClick={() => openModule("conflicts")} className="mt-5 flex w-full items-center justify-between rounded-xl border border-border bg-base/40 px-4 py-3 text-xs font-semibold text-text-primary transition-all hover:border-coordinator/40 hover:bg-coordinator/5">Inspect decision reasoning <ArrowUpRight size={15} /></button>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-end justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-tertiary">Response modules</p><h3 className="mt-1 text-base font-semibold text-text-primary">Open a focused workspace</h3></div><span className="text-[11px] text-text-tertiary">Select any module</span></div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {modules.filter((m) => m.id !== "command").map(({id,label,icon:Icon}, index) => (
                  <button key={id} onClick={() => openModule(id)} className="group relative overflow-hidden rounded-xl border border-border bg-surface p-5 text-left transition-all duration-200 hover:border-coordinator/40 hover:bg-surface-2/50">
                    
                    <div className="relative flex items-start justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-coordinator ring-1 ring-border transition-all group-hover:scale-105 group-hover:ring-coordinator/30"><Icon size={18} /></span><span className="text-[10px] font-mono text-text-tertiary">0{index+1}</span></div>
                    <p className="relative mt-5 text-sm font-semibold text-text-primary">{label}</p>
                    <p className="relative mt-1 text-[11px] leading-5 text-text-tertiary">Open focused view <ArrowUpRight size={12} className="ml-1 inline transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></p>
                  </button>
                ))}
              </div>
            </div>
          </section>
        );
    }
  };

  const ModuleHeader = ({ eyebrow, title, description, icon: Icon }) => (
    <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-surface px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-coordinator/20 bg-coordinator/[0.07] text-coordinator"><Icon size={20} /></span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-coordinator">{eyebrow}</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-text-primary">{title}</h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-text-secondary">{description}</p>
        </div>
      </div>
      <button onClick={() => openModule("command")} className="flex items-center justify-center gap-2 rounded-lg border border-border bg-base/30 px-3.5 py-2.5 text-xs font-semibold text-text-secondary transition-colors hover:border-coordinator/30 hover:text-text-primary"><LayoutDashboard size={14} /> Command Center</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-base">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-[270px] shrink-0 border-r border-border bg-surface/80 backdrop-blur-xl lg:flex lg:flex-col">
          <div className="flex items-center gap-3 border-b border-border px-5 py-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-coordinator/15 text-coordinator ring-1 ring-coordinator/20"><ShieldAlert size={19} /></span>
            <div><p className="text-sm font-bold tracking-tight text-text-primary">Emergency AI</p><p className="text-[10px] text-text-tertiary">Coordinator · v2.0</p></div>
          </div>
          <div className="px-4 pt-5">
            <div className="mb-2 px-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-text-tertiary">Operations</div>
            <nav className="space-y-1">
              {modules.map(({id,label,icon:Icon}) => (
                <button key={id} onClick={() => openModule(id)} disabled={!coordinationResult && id !== "command"} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-all duration-200 ${activeModule === id ? "bg-coordinator/10 text-text-primary ring-1 ring-coordinator/20" : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"} disabled:cursor-not-allowed disabled:opacity-40`}>
                  <Icon size={16} className={activeModule === id ? "text-coordinator" : "text-text-tertiary transition-transform group-hover:scale-105"} />
                  <span>{label}</span>
                  {activeModule === id && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-coordinator shadow-[0_0_12px_rgba(109,106,246,0.8)]" />}
                </button>
              ))}
            </nav>
          </div>
          <div className="mt-auto border-t border-border p-4">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-base/40 p-3">
              <span className={`h-2 w-2 rounded-full ${systemStatus === "operational" ? "bg-safe animate-pulse-slow" : systemStatus === "offline" ? "bg-critical" : "bg-text-tertiary animate-pulse-slow"}`} />
              <div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">System</p><p className={`text-xs font-semibold ${systemStatus === "operational" ? "text-safe" : systemStatus === "offline" ? "text-critical" : "text-text-secondary"}`}>{systemStatus === "operational" ? "Operational" : systemStatus === "offline" ? "Offline" : "Checking..."}</p></div>
            </div>
            <p className="mt-3 truncate px-1 text-[10px] text-text-tertiary">{user?.organization || user?.name || "Authorized operator"}</p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-border bg-base/85 backdrop-blur-xl">
            <div className="flex min-h-[74px] items-center justify-between gap-3 px-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3 lg:hidden">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-coordinator/15 text-coordinator"><ShieldAlert size={17} /></span>
                <div className="min-w-0"><p className="truncate text-sm font-bold text-text-primary">Emergency AI Coordinator</p><p className="text-[10px] text-text-tertiary">Command interface</p></div>
              </div>
              <div className="hidden min-w-0 items-center gap-3 lg:flex">
                <div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-tertiary">Current workspace</p><p className="mt-0.5 text-sm font-semibold text-text-primary">{modules.find((m) => m.id === activeModule)?.label}</p></div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openModule("voice")} disabled={!coordinationResult} className="group flex items-center gap-2 rounded-full border border-coordinator/25 bg-coordinator/5 px-3 py-2 text-[11px] font-semibold text-text-primary transition-all hover:-translate-y-0.5 hover:border-coordinator/50 hover:bg-coordinator/10 disabled:cursor-not-allowed disabled:opacity-40"><span className="grid h-5 w-5 place-items-center rounded-full bg-coordinator/15 text-coordinator"><Volume2 size={11} /></span><span className="hidden sm:inline">Voice briefing</span></button>
                <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-[10px] font-semibold uppercase tracking-wider"><span className={`h-1.5 w-1.5 rounded-full ${systemStatus === "operational" ? "bg-safe animate-pulse-slow" : systemStatus === "offline" ? "bg-critical" : "bg-text-tertiary animate-pulse-slow"}`} />{systemStatus === "operational" ? "Live" : systemStatus === "offline" ? "Offline" : "Checking"}</div>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto border-t border-border px-4 py-2 lg:hidden">
              {modules.map(({id,label,icon:Icon}) => <button key={id} onClick={() => openModule(id)} disabled={!coordinationResult && id !== "command"} className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold transition-all ${activeModule === id ? "border-coordinator/40 bg-coordinator/10 text-text-primary" : "border-border bg-surface text-text-tertiary"} disabled:opacity-40`}><Icon size={12} />{label}</button>)}
            </div>
          </header>

          <main className="mx-auto w-full space-y-6 px-5 py-6 sm:px-7 lg:px-9 xl:px-10 2xl:px-12">
            {error && (
              <div className="animate-rise flex items-start gap-3 rounded-2xl border border-critical/30 bg-critical/10 p-4">
                <Radio size={16} className="mt-0.5 shrink-0 text-critical" />
                <div><p className="text-xs font-semibold text-critical">Coordination Failed</p><p className="mt-0.5 text-xs text-text-secondary">{error}</p></div>
              </div>
            )}
            {loading && !coordinationResult && (
              <div className="animate-rise rounded-3xl border border-coordinator/20 bg-surface p-8 text-center shadow-xl">
                <LoaderCircle className="mx-auto animate-spin text-coordinator" size={28} />
                <p className="mt-3 text-sm font-semibold text-text-primary">Coordinating specialist agents...</p>
                <p className="mt-1 text-xs text-text-tertiary">Reconciling routes, resources and response priorities.</p>
              </div>
            )}
            {renderModule()}
          </main>
        </div>
      </div>

    </div>
  );
}