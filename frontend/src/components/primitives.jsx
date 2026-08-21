import { itemText } from "../utils/format";

const TONE_STYLES = {
  critical: "bg-critical/10 text-critical border-critical/30",
  warning: "bg-warning/10 text-warning border-warning/30",
  safe: "bg-safe/10 text-safe border-safe/30",
  coordinator: "bg-coordinator/10 text-coordinator border-coordinator/30",
  neutral: "bg-surface-3 text-text-secondary border-border-strong",
};

export function Badge({ tone = "neutral", children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${TONE_STYLES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Panel({ title, eyebrow, icon: Icon, actions, children, className = "" }) {
  return (
    <section
      className={`rounded-xl border border-border bg-surface/80 backdrop-blur-sm ${className}`}
    >
      {(title || actions) && (
        <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-surface-2 text-text-secondary">
                <Icon size={15} strokeWidth={1.75} />
              </span>
            )}
            <div className="min-w-0">
              {eyebrow && (
                <p className="mono-tabular text-[10px] font-medium uppercase tracking-[0.14em] text-text-tertiary">
                  {eyebrow}
                </p>
              )}
              <h2 className="truncate text-[13px] font-semibold uppercase tracking-wider text-text-primary">
                {title}
              </h2>
            </div>
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function EmptyState({ label = "No data reported" }) {
  return (
    <div className="rounded-lg border border-dashed border-border-strong px-4 py-6 text-center text-[13px] text-text-tertiary">
      {label}
    </div>
  );
}

export function ListSection({ label, items, tone = "neutral", numbered = false }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
        {label}
      </p>
      <ul className="space-y-1.5">
        {items.map((entry, i) => (
          <li
            key={i}
            className="flex gap-2 text-[13px] leading-relaxed text-text-secondary"
          >
            {numbered ? (
              <span className="mono-tabular shrink-0 text-text-tertiary">
                {String(i + 1).padStart(2, "0")}
              </span>
            ) : (
              <span
                className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${
                  tone === "critical"
                    ? "bg-critical"
                    : tone === "warning"
                    ? "bg-warning"
                    : tone === "safe"
                    ? "bg-safe"
                    : "bg-text-tertiary"
                }`}
              />
            )}
            <span>{itemText(entry)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}