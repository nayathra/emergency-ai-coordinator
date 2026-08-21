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
<Panel title="Incident Intake" eyebrow="Configure Scenario" icon={MapPin}>
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-coordinator px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-coordinator/90 disabled:cursor-not-allowed disabled:opacity-60"  
  >  
    {submitting && <Loader2 size={15} className="animate-spin" />}  
    {submitting ? "Consulting Emergency Agents\u2026" : "Run Coordination Analysis"}  
  </button>  
</Panel>

);
}

function LabeledInput({ label, value, onChange, type = "text", className = "", ...rest }) {
return (
<label className={'block ${className}'}>
<span className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
{label}
</span>
<input
type={type}
value={value}
onChange={(e) => onChange(e.target.value)}
className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-[13px] text-text-primary outline-none transition-colors focus:border-coordinator"
{...rest}
/>
</label>
);
}