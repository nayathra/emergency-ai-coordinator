import {
  HeartPulse,
  ShieldAlert,
  Truck,
  HeartHandshake,
  Landmark,
  Loader2,
} from "lucide-react";
import { Badge, ListSection } from "./primitives";
import { severityFromNumber } from "../utils/format";

const AGENT_ICONS = {
  Hospital: HeartPulse,
  Police: ShieldAlert,
  Transport: Truck,
  "NGO / Relief": HeartHandshake,
  Government: Landmark,
};

function agentIcon(name) {
  return AGENT_ICONS[name] || HeartPulse;
}

export function AgentCardSkeleton({ name, active }) {
  const Icon = agentIcon(name);
  return (
    <div
      className={`rounded-xl border p-4 transition-colors duration-300 ${
        active
          ? "border-coordinator/40 bg-coordinator/[0.06]"
          : "border-border bg-surface/60"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
            active ? "bg-coordinator/15 text-coordinator" : "bg-surface-2 text-text-tertiary"
          }`}
        >
          <Icon size={16} strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-text-primary">{name}</p>
          <p className="text-[11px] text-text-tertiary">
            {active ? "Analyzing incident\u2026" : "Awaiting dispatch"}
          </p>
        </div>
        {active && <Loader2 size={14} className="animate-spin text-coordinator" />}
      </div>
    </div>
  );
}

export default function AgentCard({ report }) {
  const Icon = agentIcon(report.agent_name);
  const priorityTone = severityFromNumber(report.priority, 10);
  const confidencePct = Math.round((report.confidence ?? 0) * 100);

  return (
    <article className="animate-rise flex flex-col gap-4 rounded-xl border border-border bg-surface/80 p-5 transition-colors hover:border-border-strong">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-text-secondary">
            <Icon size={17} strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-[14px] font-semibold text-text-primary">
              {report.agent_name}
            </h3>
            <p className="text-[11px] text-text-tertiary">Specialist Agent</p>
          </div>
        </div>
        <Badge tone={priorityTone}>P{report.priority}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-surface-2/60 px-3 py-2.5">
          <p className="mono-tabular text-xl font-semibold text-text-primary">
            {confidencePct}%
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
            Confidence
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface-2/60 px-3 py-2.5">
          <p className="mono-tabular text-xl font-semibold text-text-primary">
            {report.priority}
            <span className="text-sm text-text-tertiary">/10</span>
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
            Priority
          </p>
        </div>
      </div>

      <div className="space-y-3.5 border-t border-border pt-3.5">
        <ListSection label="Observations" items={report.observations} />
        <ListSection label="Recommendations" items={report.recommendations} tone="coordinator" />
        <ListSection label="Resource Requests" items={report.resource_requests} tone="warning" />
        <ListSection label="Constraints" items={report.constraints} />
        {report.conflicts && report.conflicts.length > 0 && (
          <ListSection label="Flagged Conflicts" items={report.conflicts} tone="critical" />
        )}
        {!report.observations?.length &&
          !report.recommendations?.length &&
          !report.resource_requests?.length &&
          !report.constraints?.length && (
            <p className="text-[12px] text-text-tertiary">No additional detail reported.</p>
          )}
      </div>
    </article>
  );
}