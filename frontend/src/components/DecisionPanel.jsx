import { Sparkles, ArrowRight } from "lucide-react";
import { Panel, Badge, EmptyState } from "./primitives";
import { itemText, itemMeta, severityFromNumber } from "../utils/format";

function ActionItem({ action, index }) {
  const meta = itemMeta(action);
  return (
    <li className="flex gap-3.5 rounded-lg border border-coordinator/20 bg-coordinator/[0.05] p-3.5">
      <span className="mono-tabular grid h-6 w-6 shrink-0 place-items-center rounded-md bg-coordinator/15 text-[11px] font-semibold text-coordinator">
        {index + 1}
      </span>
      <div className="min-w-0">
        <p className="text-[13px] leading-relaxed text-text-primary">{itemText(action)}</p>
        {meta.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
            {meta.map(({ key, value }) => (
              <p key={key} className="text-[11px] text-text-tertiary">
                <span className="text-text-tertiary/80">{key}:</span>{" "}
                <span className="text-text-secondary">{String(value)}</span>
              </p>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}

export default function DecisionPanel({ plan }) {
  if (!plan) return null;
  const {
    overall_priority,
    selected_actions = [],
    reasoning = [],
    alternative_actions = [],
  } = plan;

  const tone = severityFromNumber(overall_priority, 10);

  return (
    <Panel
      title="Coordinator Decision"
      eyebrow="Explainable Action Plan"
      icon={Sparkles}
      actions={
        <Badge tone={tone}>Overall Priority {overall_priority}/10</Badge>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-text-secondary">
            Selected Actions
          </h3>
          {selected_actions.length > 0 ? (
            <ol className="space-y-2.5">
              {selected_actions.map((action, i) => (
                <ActionItem key={i} action={action} index={i} />
              ))}
            </ol>
          ) : (
            <EmptyState label="No actions selected" />
          )}

          {alternative_actions.length > 0 && (
            <div className="mt-5 border-t border-border pt-4">
              <h3 className="mb-2.5 text-[12px] font-semibold uppercase tracking-wider text-text-secondary">
                Alternative Actions Considered
              </h3>
              <ul className="space-y-2">
                {alternative_actions.map((alt, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[13px] text-text-tertiary"
                  >
                    <ArrowRight size={13} className="mt-1 shrink-0" strokeWidth={1.75} />
                    <span>{itemText(alt)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-text-secondary">
            Reasoning
          </h3>
          {reasoning.length > 0 ? (
            <div className="space-y-2.5 rounded-lg border border-border bg-surface-2/40 p-4">
              {reasoning.map((r, i) => (
                <p
                  key={i}
                  className="border-l-2 border-cyan/40 pl-3 text-[13px] leading-relaxed text-text-secondary"
                >
                  {itemText(r)}
                </p>
              ))}
            </div>
          ) : (
            <EmptyState label="No reasoning reported" />
          )}
        </div>
      </div>
    </Panel>
  );
}