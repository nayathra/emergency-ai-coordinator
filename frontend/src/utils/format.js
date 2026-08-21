// Utilities for rendering backend data whose exact shape (string vs object)
// isn't guaranteed. Nothing here invents content -- it only extracts and
// labels whatever the API actually returned.

const TEXT_KEYS = [
"description",
"text",
"title",
"action",
"detail",
"summary",
"message",
"name",
"reason",
];

const SEVERITY_KEYS = ["severity", "level", "priority_level", "status"];

/** Best-effort primary text for a list item that may be a string or object. */
export function itemText(item) {
if (item == null) return "";
if (typeof item === "string") return item;
if (typeof item === "number") return String(item);
if (typeof item === "object") {
for (const key of TEXT_KEYS) {
if (typeof item[key] === "string" && item[key].trim()) return item[key];
}
// Fall back to the first string-valued field.
const firstString = Object.values(item).find((v) => typeof v === "string");
if (firstString) return firstString;
return JSON.stringify(item);
}
return String(item);
}

/** Secondary key/value pairs on an object item, excluding the field already used as primary text. */
export function itemMeta(item) {
if (typeof item !== "object" || item === null) return [];
const usedKey = TEXT_KEYS.find(
(key) => typeof item[key] === "string" && item[key].trim()
);
return Object.entries(item)
.filter(([key, value]) => key !== usedKey)
.filter(([, value]) => typeof value === "string" || typeof value === "number")
.map(([key, value]) => ({ key: formatLabel(key), value }));
}

/** Extract a severity-ish word from an object item, if present. */
export function itemSeverity(item) {
if (typeof item !== "object" || item === null) return null;
for (const key of SEVERITY_KEYS) {
if (typeof item[key] === "string") return item[key];
if (typeof item[key] === "number") return null;
}
return null;
}

export function formatLabel(key) {
return key
.replace(/_/g, " ")
.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Map a free-text severity word to a semantic tone used across the UI. */
export function severityTone(word) {
if (!word) return "neutral";
const w = String(word).toLowerCase();
if (/(critical|high|severe|blocked|denied|unresolved)/.test(w)) return "critical";
if (/(medium|warning|moderate|pending|partial)/.test(w)) return "warning";
if (/(low|resolved|safe|operational|clear|available)/.test(w)) return "safe";
return "neutral";
}

export function severityFromNumber(n, max = 10) {
if (typeof n !== "number") return "neutral";
const ratio = n / max;
if (ratio >= 0.75) return "critical";
if (ratio >= 0.5) return "warning";
return "safe";
}