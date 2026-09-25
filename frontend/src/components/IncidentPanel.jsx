import { MapPin, Loader2, Radio } from "lucide-react";
import { Badge, Panel } from "./primitives";
import { severityFromNumber } from "../utils/format";

function Field({ label, value, mono = true }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
        {label}
      </p>

      <p
        className={`mt-0.5 text-[14px] text-text-primary ${
          mono ? "mono-tabular" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function TagList({ items, tone = "neutral" }) {
if (!items || items.length === 0) {
return <span className="text-[13px] text-text-tertiary">None</span>;
}
return (
<div className="flex flex-wrap gap-1.5">
{items.map((item) => (
<Badge key={item} tone={tone}>
{item}
</Badge>
))}
</div>
);
}

/** Read-only overview, rendered strictly from the API's echoed incident object. */
export function IncidentOverview({ incident }) {
const severityTone = severityFromNumber(incident.severity, 10);
const isCritical = incident.severity >= 8;

return (
<Panel
title="Incident Overview"
eyebrow={incident.incident_id}
icon={MapPin}
actions={
isCritical ? (
<Badge tone="critical">
<Radio size={11} className="animate-pulse-slow" /> Critical
</Badge>
) : (
<Badge tone={severityTone}>Severity {incident.severity}</Badge>
)
}
>
<div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
<Field label="Incident Type" value={incident.incident_type} mono={false} />
<Field label="Location" value={incident.location} mono={false} />
<Field
  label="Severity"
  value={String(incident.severity) + " / 10"}
/>
<Field
label="Affected Population"
value={incident.affected_population?.toLocaleString?.() ?? incident.affected_population}
/>
<Field label="Available Ambulances" value={incident.available_ambulances} />
<Field label="Available Shelters" value={incident.available_shelters} />
</div>

<div className="mt-5 grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-3">  
    <div>  
      <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">  
        Active Routes  
      </p>  
      <TagList items={incident.active_routes} tone="safe" />  
    </div>  
    <div>  
      <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">  
        Blocked Routes  
      </p>  
      <TagList items={incident.blocked_routes} tone="critical" />  
    </div>  
    <div>  
      <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">  
        Urgent Needs  
      </p>  
      <TagList items={incident.urgent_needs} tone="warning" />  
    </div>  
  </div>

{incident.scenario_context && (
  <div className="mt-5 rounded-xl border border-gold/15 bg-gold/[0.035] p-4">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">Real-world incident context</p>
      <span className="rounded-full border border-gold/20 bg-gold/5 px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-gold">Evidence grounded</span>
    </div>
    <p className="mt-2 text-[11px] leading-5 text-text-secondary">
      {incident.scenario_context.evidence_snapshot || "Publicly reported Bihar flood information"}
    </p>
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {[
        ["Districts", incident.scenario_context.affected_districts],
        ["Panchayats", incident.scenario_context.inundated_gram_panchayats],
        ["NDRF teams", incident.scenario_context.ndrf_teams],
        ["Boats", incident.scenario_context.boats_deployed],
      ].map(([label, value]) => (
        <div key={label} className="rounded-lg border border-border bg-surface/60 p-2.5">
          <p className="text-[9px] uppercase tracking-wider text-text-tertiary">{label}</p>
          <p className="mt-1 mono-tabular text-sm font-semibold text-text-primary">{value ?? "—"}</p>
        </div>
      ))}
    </div>
    <p className="mt-3 text-[10px] leading-4 text-text-tertiary">
      {incident.scenario_context.real_world_note}
    </p>
  </div>
)}
</Panel>

);
}

/** Editable intake form used before the first coordination run. */
export function IncidentIntakeForm({ draft, onChange, onSubmit, submitting }) {
const update = (key, value) => onChange({ ...draft, [key]: value });
const updateList = (key, raw) =>
update(
key,
raw
.split(",")
.map((s) => s.trim())
.filter(Boolean)
);

return (
<Panel title="Incident Intake" eyebrow="LIVE SCENARIO CONFIGURATION" icon={MapPin} className="h-full command-glass">
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
<LabeledInput
label="Incident ID"
value={draft.incident_id}
onChange={(v) => update("incident_id", v)}
/>
<LabeledInput
label="Incident Type"
value={draft.incident_type}
onChange={(v) => update("incident_type", v)}
/>
<LabeledInput
label="Location"
value={draft.location}
onChange={(v) => update("location", v)}
/>
<LabeledInput
label="Severity (1-10)"
type="number"
min={1}
max={10}
value={draft.severity}
onChange={(v) => update("severity", Number(v))}
/>
<LabeledInput
label="Affected Population"
type="number"
min={0}
value={draft.affected_population}
onChange={(v) => update("affected_population", Number(v))}
/>
<LabeledInput
label="Available Ambulances"
type="number"
min={0}
value={draft.available_ambulances}
onChange={(v) => update("available_ambulances", Number(v))}
/>
<LabeledInput
label="Available Shelters"
type="number"
min={0}
value={draft.available_shelters}
onChange={(v) => update("available_shelters", Number(v))}
/>
<LabeledInput
label="Active Routes (comma separated)"
value={draft.active_routes.join(", ")}
onChange={(v) => updateList("active_routes", v)}
/>
<LabeledInput
label="Blocked Routes (comma separated)"
value={draft.blocked_routes.join(", ")}
onChange={(v) => updateList("blocked_routes", v)}
/>
<LabeledInput
label="Urgent Needs (comma separated)"
className="sm:col-span-2 lg:col-span-3"
value={draft.urgent_needs.join(", ")}
onChange={(v) => updateList("urgent_needs", v)}
/>
</div>

<button  
    onClick={onSubmit}  
    disabled={submitting}  
    className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-coordinator/30 bg-gradient-to-r from-coordinator to-[#3d72df] px-5 py-3.5 text-[13px] font-semibold text-white shadow-lg shadow-coordinator/20 transition-all hover:-translate-y-0.5 hover:shadow-coordinator/30 disabled:cursor-not-allowed disabled:opacity-60"  
  >  
    {submitting && <Loader2 size={15} className="animate-spin" />}  
    {submitting ? "Consulting Emergency Agents\u2026" : "Run Coordination Analysis"}  
  </button>  
</Panel>

);
}

function LabeledInput({ label, value, onChange, type = "text", className = "", ...rest }) {
return (
<label className={`block ${className}`}>
<span className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
{label}
</span>
<input
type={type}
value={value}
onChange={(e) => onChange(e.target.value)}
className="w-full rounded-xl border border-border bg-[#101a2b] px-3.5 py-3 text-[13px] text-text-primary outline-none transition-all placeholder:text-text-tertiary focus:border-coordinator focus:ring-2 focus:ring-coordinator/10"
{...rest}
/>
</label>
);
}