import { AlertTriangle, ShieldCheck } from "lucide-react";
import { Panel, Badge, EmptyState } from "./primitives";
import { itemText, itemMeta, itemSeverity, severityTone } from "../utils/format";

function ConflictRow({ conflict, defaultTone }) {
  const text = itemText(conflict);
  const rawSeverity = itemSeverity(conflict);
  const tone = rawSeverity ? severityTone(rawSeverity) : defaultTone;
  const meta = itemMeta(conflict);

  return (
    <div className="rounded-lg border border-border bg-surface-2/50 p-3.5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] leading-relaxed text-text-primary">{text}</p>
        <Badge tone={tone} className="shrink-0">
          {rawSeverity || (defaultTone === "critical" ? "Detected" : "Resolved")}
        </Badge>
      </div>
      {meta.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {meta.map(({ key, value }) => (
            <p key={key} className="text-[11px] text-text-tertiary">
              <span className="text-text-tertiary/80">{key}:</span>{" "}
              <span className="text-text-secondary">{String(value)}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ConflictPanel({ detected, resolved }) {
  const hasDetected = detected && detected.length > 0;
  const hasResolved = resolved && resolved.length > 0;

  return (
    <Panel title="Conflict Detection" eyebrow="Coordination Engine" icon={AlertTriangle}>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle size={14} className="text-critical" strokeWidth={1.75} />
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-text-secondary">
              Detected Conflicts
            </h3>
            <Badge tone={hasDetected ? "critical" : "neutral"}>
              {detected?.length ?? 0}
            </Badge>
          </div>
          {hasDetected ? (
            <div className="space-y-2.5">
              {detected.map((c, i) => (
                <ConflictRow key={i} conflict={c} defaultTone="critical" />
              ))}
            </div>
          ) : (
            <EmptyState label="No conflicts detected" />
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck size={14} className="text-safe" strokeWidth={1.75} />
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-text-secondary">
              Resolved Conflicts
            </h3>
            <Badge tone={hasResolved ? "safe" : "neutral"}>{resolved?.length ?? 0}</Badge>
          </div>
          {hasResolved ? (
            <div className="space-y-2.5">
              {resolved.map((c, i) => (
                <ConflictRow key={i} conflict={c} defaultTone="safe" />
              ))}
            </div>
          ) : (
            <EmptyState label="No conflicts resolved yet" />
          )}
        </div>
      </div>
    </Panel>
  );
}