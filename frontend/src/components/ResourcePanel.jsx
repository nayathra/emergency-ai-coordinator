import { useState } from "react";
import {
  Boxes,
  Ambulance,
  Home,
  Truck,
  Siren,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { Panel, EmptyState } from "./primitives";
import { itemText, itemMeta } from "../utils/format";

function AvailabilityCard({ icon: Icon, label, value }) {
  const isZero = Number(value) === 0;

  return (
    <div className="rounded-lg border border-border bg-surface-2/60 p-4">
      <div className="flex items-center gap-2 text-text-secondary">
        <Icon size={15} strokeWidth={1.75} />

        <p className="text-[11px] font-medium uppercase tracking-wider">
          {label}
        </p>
      </div>

      <p
        className={`mono-tabular mt-2 text-2xl font-semibold ${
          isZero ? "text-critical" : "text-text-primary"
        }`}
      >
        {value}
      </p>

      {isZero && (
        <p className="mt-0.5 text-[11px] text-critical">
          Unavailable
        </p>
      )}
    </div>
  );
}

function AllocationRow({ item }) {
  const meta = itemMeta(item);

  return (
    <div className="rounded-lg border border-border bg-surface-2/50 p-3">
      <p className="text-[13px] text-text-primary">
        {itemText(item)}
      </p>

      {meta.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
          {meta.map(({ key, value }) => (
            <p
              key={key}
              className="text-[11px] text-text-tertiary"
            >
              <span className="text-text-tertiary/80">
                {key}:
              </span>{" "}
              <span className="text-text-secondary">
                {String(value)}
              </span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ResourcePanel({
  incident,
  allocations,
  responsePlan,
}) {
  const [dispatching, setDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);
  const [dispatchError, setDispatchError] = useState(null);

  const handleDispatch = async () => {
    setDispatching(true);
    setDispatchSuccess(false);
    setDispatchError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      setDispatchSuccess(true);
    } catch (error) {
      setDispatchError(error.message || "Dispatch simulation failed.");
    } finally {
      setDispatching(false);
    }
  };

  return (
    <Panel
      title="Resource Allocation"
      eyebrow="Available & Committed"
      icon={Boxes}
    >
      {/* Resource availability */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <AvailabilityCard
          icon={Ambulance}
          label="Ambulances"
          value={incident.available_ambulances}
        />

        <AvailabilityCard
          icon={Home}
          label="Shelters"
          value={incident.available_shelters}
        />

        <AvailabilityCard
          icon={Truck}
          label="Active Routes"
          value={incident.active_routes?.length ?? 0}
        />

        <AvailabilityCard
          icon={Boxes}
          label="Blocked Routes"
          value={incident.blocked_routes?.length ?? 0}
        />
      </div>

      {/* AI allocations */}
      <div className="mt-5 border-t border-border pt-4">
        <h3 className="mb-2.5 text-[12px] font-semibold uppercase tracking-wider text-text-secondary">
          Resource Allocations
        </h3>

        {allocations && allocations.length > 0 ? (
          <div className="space-y-2">
            {allocations.map((a, i) => (
              <AllocationRow
                key={i}
                item={a}
              />
            ))}
          </div>
        ) : (
          <EmptyState label="No allocations reported" />
        )}
      </div>

      {/* Dispatch section */}
      <div className="mt-5 border-t border-border pt-5">

        <div className="mb-3 flex items-center gap-2">
          <Siren
            size={16}
            className="text-critical"
          />

          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-text-primary">
              Emergency Dispatch
            </h3>

            <p className="text-[11px] text-text-tertiary">
              Simulated command dispatch — no external message is sent
            </p>
          </div>
        </div>

        <button
          onClick={handleDispatch}
          disabled={dispatching || dispatchSuccess}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-[12px] font-bold uppercase tracking-wider transition-all ${
            dispatchSuccess
              ? "cursor-default border border-safe/30 bg-safe/10 text-safe"
              : dispatching
              ? "cursor-wait border border-critical/30 bg-critical/10 text-critical"
              : "bg-critical text-white hover:bg-critical/90"
          }`}
        >
          {dispatchSuccess ? (
            <>
              <CheckCircle2 size={16} />
              Dispatch Simulation Complete
            </>
          ) : dispatching ? (
            <>
              <Siren
                size={16}
                className="animate-pulse"
              />
              Dispatching Resources...
            </>
          ) : (
            <>
              <Siren size={16} />
              Dispatch Emergency Resources
            </>
          )}
        </button>

        {dispatchSuccess && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-safe/20 bg-safe/5 p-3">
            <CheckCircle2
              size={15}
              className="mt-0.5 shrink-0 text-safe"
            />

            <p className="text-[11px] text-safe">
              AI response prepared successfully. This hackathon mode does not contact real emergency personnel.
            </p>
          </div>
        )}

        {dispatchError && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-critical/20 bg-critical/5 p-3">
            <AlertTriangle
              size={15}
              className="mt-0.5 shrink-0 text-critical"
            />

            <p className="text-[11px] text-critical">
              {dispatchError}
            </p>
          </div>
        )}
      </div>
    </Panel>
  );
}