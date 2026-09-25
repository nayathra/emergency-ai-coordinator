import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, Loader2, ArrowRight, Ambulance, Route, GitCompare, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Panel, Badge, EmptyState } from "./primitives";
import { itemText, itemMeta } from "../utils/format";

function ConditionCard({ label, icon: Icon, children }) {
  return (
    <div className="rounded-lg border border-border bg-surface-2/50 p-4">
      <div className="mb-2.5 flex items-center gap-2 text-text-secondary">
        <Icon size={14} strokeWidth={1.75} />
        <p className="text-[11px] font-medium uppercase tracking-wider">{label}</p>
      </div>
      {children}
    </div>
  );
}

function RouteToggle({ route, blocked, onToggle }) {
  return (
    <button
      onClick={() => onToggle(route)}
      className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-[13px] transition-colors ${
        blocked
          ? "border-critical/40 bg-critical/10 text-critical"
          : "border-border bg-surface-3/60 text-text-secondary hover:border-border-strong"
      }`}
    >
      <span>{route}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wider">
        {blocked ? "Blocked" : "Active"}
      </span>
    </button>
  );
}

function PlanSnapshot({ title, plan, tone }) {
  if (!plan) return <EmptyState label="No plan available" />;
  return (
    <div className="rounded-lg border border-border bg-surface-2/40 p-4">
      <div className="mb-2.5 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
          {title}
        </p>
        <Badge tone={tone}>Priority {plan.overall_priority}/10</Badge>
      </div>
      {plan.selected_actions?.length > 0 ? (
        <ul className="space-y-1.5">
          {plan.selected_actions.map((a, i) => (
            <li key={i} className="text-[13px] leading-relaxed text-text-primary">
              <span className="mono-tabular text-text-tertiary">
                {String(i + 1).padStart(2, "0")}
              </span>{" "}
              {itemText(a)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[12px] text-text-tertiary">No actions selected</p>
      )}
    </div>
  );
}

export default function WhatIfPanel({ incident, onRunSimulation, loading, result, error }) {
  const allRoutes = useMemo(
    () => [...(incident.active_routes || []), ...(incident.blocked_routes || [])],
    [incident.active_routes, incident.blocked_routes]
  );

  const [ambulances, setAmbulances] = useState(incident.available_ambulances ?? 0);
  const [blockedSet, setBlockedSet] = useState(new Set(incident.blocked_routes || []));

  useEffect(() => {
    setAmbulances(incident.available_ambulances ?? 0);
    setBlockedSet(new Set(incident.blocked_routes || []));
  }, [incident.incident_id]);

  const toggleRoute = (route) => {
    setBlockedSet((prev) => {
      const next = new Set(prev);
      if (next.has(route)) next.delete(route);
      else next.add(route);
      return next;
    });
  };

  const hasChanges =
    ambulances !== incident.available_ambulances ||
    blockedSet.size !== (incident.blocked_routes?.length ?? 0) ||
    [...blockedSet].some((r) => !incident.blocked_routes?.includes(r));

  const maxAmbulances = Math.max(5, (incident.available_ambulances ?? 0) * 2, 5);

  const handleRun = () => {
    onRunSimulation({
      available_ambulances: ambulances,
      blocked_routes: [...blockedSet],
    });
  };

  return (
    <Panel
      title="What-If Simulation"
      eyebrow="Stress-Test the Response"
      icon={SlidersHorizontal}
      className="border-coordinator/25"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
            Current Situation
          </p>
          <div className="grid grid-cols-2 gap-3">
            <ConditionCard label="Available Ambulances" icon={Ambulance}>
              <p className="mono-tabular text-xl font-semibold text-text-primary">
                {incident.available_ambulances}
              </p>
            </ConditionCard>
            <ConditionCard label="Blocked Routes" icon={Route}>
              <p className="mono-tabular text-xl font-semibold text-text-primary">
                {incident.blocked_routes?.length ?? 0}
                <span className="text-sm text-text-tertiary"> / {allRoutes.length}</span>
              </p>
            </ConditionCard>
          </div>

          <div className="border-t border-border pt-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
              Change Conditions
            </p>

            <label className="mb-1.5 flex items-center justify-between text-[12px] text-text-secondary">
              <span>Ambulances</span>
              <span className="mono-tabular text-text-primary">{ambulances}</span>
            </label>
            <input
              type="range"
              min={0}
              max={maxAmbulances}
              value={ambulances}
              onChange={(e) => setAmbulances(Number(e.target.value))}
              className="w-full accent-coordinator"
            />

            <p className="mb-2 mt-4 text-[12px] text-text-secondary">Routes</p>
            <div className="space-y-1.5">
              {allRoutes.map((route) => (
                <RouteToggle
                  key={route}
                  route={route}
                  blocked={blockedSet.has(route)}
                  onToggle={toggleRoute}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleRun}
            disabled={loading || !hasChanges}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-coordinator px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-coordinator/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {loading ? "Re-evaluating Emergency Conditions\u2026" : hasChanges ? "Run Simulation" : "Change a condition first"}
          </button>

          {!hasChanges && !loading && (
            <p className="text-center text-[11px] text-text-tertiary">
              Adjust ambulances or routes to simulate a change.
            </p>
          )}

          {error && (
            <p className="rounded-lg border border-critical/30 bg-critical/10 px-3 py-2 text-[12px] text-critical">
              {error}
            </p>
          )}
        </div>

        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
            Simulation Result
          </p>
          {result ? (
            <div className="animate-rise space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-coordinator/20 bg-coordinator/[0.05] px-3.5 py-3">
                <div className="flex items-center gap-2">
                  <GitCompare size={14} className="text-coordinator" />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-text-primary">Re-planning impact</p>
                    <p className="text-[10px] text-text-tertiary">The coordinator recalculated the response under the simulated conditions.</p>
                  </div>
                </div>
                <span className={`rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${hasChanges ? "border-coordinator/20 bg-coordinator/10 text-coordinator" : "border-border bg-surface-2 text-text-tertiary"}`}>{hasChanges ? "Re-planned" : "No change"}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-surface-2/40 p-3.5">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                    Current Reality
                  </p>
                  <p className="text-[12px] text-text-secondary">
                    {result.original_incident?.available_ambulances} ambulances
                  </p>
                  <p className="text-[12px] text-text-secondary">
                    {result.original_incident?.blocked_routes?.length ?? 0} routes blocked
                  </p>
                </div>
                <div className="rounded-lg border border-coordinator/30 bg-coordinator/[0.06] p-3.5">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-coordinator">
                    Simulated Reality
                  </p>
                  <p className="text-[12px] text-text-primary">
                    {result.simulated_incident?.available_ambulances} ambulances
                  </p>
                  <p className="text-[12px] text-text-primary">
                    {result.simulated_incident?.blocked_routes?.length ?? 0} routes blocked
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-text-tertiary">
                <div className="h-px flex-1 bg-border" />
                <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-coordinator">
                  Response Changed <ArrowRight size={12} />
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {result.new_response_plan?.selected_actions?.length ? (
                <div className="rounded-lg border border-safe/20 bg-safe/[0.04] p-3.5">
                  <div className="mb-2 flex items-center gap-2 text-safe">
                    <CheckCircle2 size={14} />
                    <p className="text-[10px] font-semibold uppercase tracking-wider">New plan generated</p>
                  </div>
                  <p className="text-[12px] leading-relaxed text-text-secondary">
                    {result.new_response_plan.selected_actions.length} actions selected under the changed conditions.
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-2 rounded-lg border border-critical/20 bg-critical/[0.04] p-3.5">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0 text-critical" />
                  <p className="text-[12px] leading-relaxed text-text-secondary">The simulation did not produce a new action set.</p>
                </div>
              )}

              <PlanSnapshot
                title="New Decision"
                plan={result.new_response_plan}
                tone="coordinator"
              />
            </div>
          ) : (
            <EmptyState label="Run a simulation to see how the response plan changes." />
          )}
        </div>
      </div>
    </Panel>
  );
}