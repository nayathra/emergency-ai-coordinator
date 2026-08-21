import { Network } from "lucide-react";
import AgentCard, { AgentCardSkeleton } from "./AgentCard";
import { Panel } from "./primitives";

const AGENT_ORDER = ["Hospital", "Police", "Transport", "NGO / Relief", "Government"];

export default function AgentGrid({ reports, loading }) {
  return (
    <Panel
      title="Agent Intelligence"
      eyebrow="05 Specialists"
      icon={Network}
    >
      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {AGENT_ORDER.map((name, i) => (
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