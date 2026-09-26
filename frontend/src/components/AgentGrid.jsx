import { Network, CheckCircle2, AlertTriangle, Activity } from "lucide-react";
import AgentCard, { AgentCardSkeleton } from "./AgentCard";
import { Panel } from "./primitives";

const AGENT_ORDER = ["Hospital", "Police", "Transport", "NGO / Relief", "Government"];

export default function AgentGrid({ reports, loading }) {
  const reportCount = reports?.length ?? 0;
  const highPriority = reports?.filter((r) => Number(r.priority ?? r.priority_score ?? 0) >= 9).length ?? 0;

  return (
    <Panel
      title="Agent Intelligence"
      eyebrow="05 Specialists · Parallel Analysis"
      icon={Network}
    >
      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-border bg-surface-2/40 px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-text-tertiary"><Activity size={12}/><span className="text-[10px] font-semibold uppercase tracking-wider">Agents</span></div>
          <p className="mono-tabular mt-1 text-lg font-bold text-text-primary">{loading ? "—" : reportCount}/5</p>
        </div>
        <div className="rounded-lg border border-safe/20 bg-safe/[0.04] px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-safe"><CheckCircle2 size={12}/><span className="text-[10px] font-semibold uppercase tracking-wider">Reporting</span></div>
          <p className="mono-tabular mt-1 text-lg font-bold text-text-primary">{loading ? "…" : reportCount}</p>
        </div>
        <div className="rounded-lg border border-critical/20 bg-critical/[0.04] px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-critical"><AlertTriangle size={12}/><span className="text-[10px] font-semibold uppercase tracking-wider">High Priority</span></div>
          <p className="mono-tabular mt-1 text-lg font-bold text-text-primary">{loading ? "…" : highPriority}</p>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 text-[11px] text-text-tertiary">
        <span className="h-1.5 w-1.5 rounded-full bg-safe animate-pulse-slow" />
        <span>Specialists report independently before the coordinator reconciles constraints.</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {AGENT_ORDER.map((name) => (
            <AgentCardSkeleton key={name} name={name} active />
          ))}
        </div>
      ) : reports && reports.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {reports.map((report) => (
            <AgentCard key={report.agent_name} report={report} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {AGENT_ORDER.map((name) => (
            <AgentCardSkeleton key={name} name={name} active={false} />
          ))}
        </div>
      )}
    </Panel>
  );
}
