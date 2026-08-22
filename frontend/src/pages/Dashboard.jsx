import { useEffect, useState } from "react";
import { Radio, ShieldAlert } from "lucide-react";

import {
  healthCheck,
  runCoordination,
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


export default function Dashboard() {

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


      const audioBlob =
        await speakText(text);


      const audioUrl = URL.createObjectURL(audioBlob);

const audio = new Audio(audioUrl);

audio.volume = 1.0;

audio.onended = () => {
  URL.revokeObjectURL(audioUrl);
};

audio.onerror = () => {
  console.error("Audio playback failed.");
  URL.revokeObjectURL(audioUrl);
};

await audio.play();

    } catch (err) {

      console.error(
        "Voice generation error:",
        err
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
  // UI
  // =========================================================

  return (

    <div className="min-h-screen">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-10 border-b border-border bg-base/85 backdrop-blur-md">

        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">


          {/* LOGO + TITLE */}

          <div className="flex items-center gap-3">

            <span className="grid h-9 w-9 place-items-center rounded-lg bg-coordinator/15 text-coordinator">

              <ShieldAlert
                size={18}
                strokeWidth={1.75}
              />

            </span>


            <div>

              <h1 className="text-[15px] font-bold tracking-tight text-text-primary">
                Emergency AI Coordinator
              </h1>

              <p className="text-[11px] text-text-tertiary">
                Multi-Agent Emergency Command Center
              </p>

            </div>

          </div>


          {/* DESKTOP FLOW */}

          <div className="hidden lg:block">

            <CoordinationFlow
              phase={phase}
            />

          </div>


          {/* SYSTEM STATUS */}

          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">

            <span
              className={`h-2 w-2 rounded-full ${
                systemStatus === "operational"
                  ? "bg-safe animate-pulse-slow"
                  : systemStatus === "offline"
                  ? "bg-critical"
                  : "bg-text-tertiary animate-pulse-slow"
              }`}
            />


            <span
              className={
                systemStatus === "operational"
                  ? "text-safe"
                  : systemStatus === "offline"
                  ? "text-critical"
                  : "text-text-tertiary"
              }
            >

              {systemStatus === "operational"
                ? "System Operational"
                : systemStatus === "offline"
                ? "Backend Unreachable"
                : "Checking…"}

            </span>

          </div>

        </div>


        {/* MOBILE FLOW */}

        <div className="border-t border-border px-6 py-2 lg:hidden">

          <CoordinationFlow
            phase={phase}
          />

        </div>

      </header>


      {/* =====================================================
          MAIN DASHBOARD
      ===================================================== */}

      <main className="mx-auto max-w-[1400px] space-y-6 px-6 py-8">


        {/* ===================================================
            INCIDENT INPUT
        =================================================== */}

        {!coordinationResult && !loading && (

          <IncidentIntakeForm
            draft={incidentDraft}
            onChange={setIncidentDraft}
            onSubmit={handleRunCoordination}
            submitting={loading}
          />

        )}


        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (

          <div className="flex items-start gap-3 rounded-xl border border-critical/30 bg-critical/10 p-4">

            <Radio
              size={16}
              className="mt-0.5 shrink-0 text-critical"
            />


            <div>

              <p className="text-[13px] font-semibold text-critical">
                Coordination Failed
              </p>

              <p className="mt-0.5 text-[13px] text-text-secondary">
                {error}
              </p>

            </div>

          </div>

        )}


        {/* ===================================================
            RESULTS
        =================================================== */}

        {(loading || coordinationResult) && (

          <>


            {/* =================================================
                INCIDENT OVERVIEW
            ================================================= */}

            {coordinationResult && (

              <div className="animate-rise">

                <IncidentOverview
                  incident={
                    coordinationResult.incident
                  }
                />

              </div>

            )}


            {/* =================================================
                EMERGENCY MAP
            ================================================= */}

            {coordinationResult && (

              <div className="animate-rise overflow-hidden rounded-xl border border-border bg-surface">


                {/* MAP HEADER */}

                <div className="border-b border-border px-5 py-4">

                  <div className="flex items-center gap-2">

                    <span className="h-2 w-2 rounded-full bg-safe animate-pulse-slow" />

                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-tertiary">
                      LIVE RESPONSE MAP
                    </p>

                  </div>


                  <h2 className="mt-1 text-[15px] font-semibold text-text-primary">
                    Emergency Location & Resources
                  </h2>


                  <p className="mt-1 text-[12px] text-text-secondary">
                    Incident location and nearby emergency resources
                  </p>

                </div>


                {/* MAP */}

                <div className="h-[500px] w-full">

                  <EmergencyMap />

                </div>

              </div>

            )}


            {/* =================================================
                AGENT INTELLIGENCE
            ================================================= */}

            <AgentGrid
              reports={
                coordinationResult?.agent_reports
              }
              loading={loading}
            />


            {/* =================================================
                REST OF DASHBOARD
            ================================================= */}

            {coordinationResult && (

              <>


                {/* =================================================
                    CONFLICTS
                ================================================= */}

                <div className="animate-rise">

                  <ConflictPanel

                    detected={
                      coordinationResult
                        .response_plan
                        ?.detected_conflicts
                    }

                    resolved={
                      coordinationResult
                        .response_plan
                        ?.resolved_conflicts
                    }

                  />

                </div>


                {/* =================================================
                    DECISION
                ================================================= */}

                <div className="animate-rise">

                  <DecisionPanel
                    plan={
                      coordinationResult
                        .response_plan
                    }
                  />


                  {/* =================================================
                      VOICE BUTTON
                  ================================================= */}

                  <div className="mt-4 flex justify-end">

                    <button
                      onClick={
                        handleSpeakDecision
                      }
                      disabled={voiceLoading}
                      className="flex items-center gap-2 rounded-lg border border-coordinator/30 bg-coordinator/10 px-4 py-2 text-[12px] font-semibold text-coordinator transition-all hover:bg-coordinator/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      <span className="text-base">

                        {voiceLoading
                          ? "⏳"
                          : "🔊"}

                      </span>


                      {voiceLoading
                        ? "Generating voice..."
                        : "Speak Decision"}

                    </button>

                  </div>

                </div>


                {/* =================================================
                    RESOURCES
                ================================================= */}

                <div className="animate-rise">

                  <ResourcePanel

                    incident={
                      coordinationResult.incident
                    }

                    allocations={
                      coordinationResult
                        .response_plan
                        ?.resource_allocations
                    }

                  />

                </div>


                {/* =================================================
                    WHAT IF
                ================================================= */}

                <div className="animate-rise">

                  <WhatIfPanel

                    incident={
                      coordinationResult.incident
                    }

                    onRunSimulation={
                      handleRunSimulation
                    }

                    loading={
                      simulationLoading
                    }

                    result={
                      simulationResult
                    }

                    error={
                      simulationError
                    }

                  />

                </div>


                {/* =================================================
                    NEW INCIDENT
                ================================================= */}

                <div className="flex justify-center pt-2">

                  <button
                    onClick={() => {

                      setCoordinationResult(
                        null
                      );

                      setSimulationResult(
                        null
                      );

                      setError(null);

                    }}
                    className="text-[12px] font-medium text-text-tertiary transition-colors hover:text-text-secondary"
                  >

                    Start a new incident scenario

                  </button>

                </div>

              </>

            )}

          </>

        )}

      </main>

    </div>

  );

}