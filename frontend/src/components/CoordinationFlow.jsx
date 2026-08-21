const STEPS = [
  "Incident",
  "Agents",
  "Conflicts",
  "Coordinator",
  "Action Plan",
];

/**
 * A slim, real signature element: a horizontal flow of the actual pipeline
 * (Incident -> Agents -> Conflict Detection -> Coordinator -> Action Plan).
 * `phase` drives which node is illuminated; it never fabricates timing,
 * it's purely a visual map of where processing is in the request lifecycle.
 */
export default function CoordinationFlow({ phase }) {
  // phase: 'idle' | 'running' | 'done'
  const activeIndex = phase === "idle" ? -1 : phase === "running" ? null : STEPS.length - 1;

  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {STEPS.map((step, i) => {
        const isRunningPulse = phase === "running";
        const isDone = activeIndex !== null && i <= activeIndex;
        const isLit = isDone || isRunningPulse;
        return (
          <div key={step} className="flex shrink-0 items-center gap-1">
            <div className="flex items-center gap-2">
              <span
                className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
                  isLit ? "bg-coordinator" : "bg-surface-3"
                } ${isRunningPulse ? "animate-pulse-slow" : ""}`}
                style={isRunningPulse ? { animationDelay: `${i * 0.15}s` } : undefined}
              />
              <span
                className={`whitespace-nowrap text-[11px] font-medium tracking-wide transition-colors duration-500 ${
                  isLit ? "text-text-secondary" : "text-text-tertiary"
                }`}
              >
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className={`mx-1.5 h-px w-6 shrink-0 transition-colors duration-500 ${
                  isLit && i < activeIndex ? "bg-coordinator/50" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}