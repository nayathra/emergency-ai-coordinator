from fastapi import APIRouter, Depends, HTTPException
import re

from app.models.incident import Incident
from app.services.orchestrator import run_all_agents
from app.coordinator.coordinator import coordinate_response
from app.routes.auth import current_user
from app.services.database import users_collection

router = APIRouter(prefix="/coordination", tags=["Coordination"])


def _number(value):
    match = re.search(r"\d+", str(value))
    return int(match.group()) if match else None


def _apply_live_updates(incident, updates):
    applied = []
    changed = incident.model_dump()

    for update in updates:
        metric = f"{update.get('metric', '')} {update.get('note', '')}".lower()
        value = update.get("value", "")
        number = _number(value)

        if "ambulance" in metric and number is not None:
            incident.available_ambulances = number
            applied.append(f"Ambulances updated to {number} from {update.get('organization') or 'field agency'}.")

        elif "shelter" in metric and number is not None:
            incident.available_shelters = number
            applied.append(f"Shelters updated to {number} from {update.get('organization') or 'field agency'}.")

        elif ("blocked route" in metric or "route blocked" in metric) and (update.get("note") or value):
            route_text = update.get("note") or value
            routes = re.findall(r"Route\s+[A-Za-z0-9-]+", route_text, flags=re.I)
            for route in routes:
                route = route.strip()
                if route not in incident.blocked_routes:
                    incident.blocked_routes.append(route)
                if route in incident.active_routes:
                    incident.active_routes.remove(route)
            if routes:
                applied.append(f"Route constraint updated: {', '.join(routes)}.")

        elif ("vehicle" in metric or "transport" in metric) and number is not None:
            applied.append(f"Transport availability reported as {number} by {update.get('organization') or 'field agency'}.")

    return applied, changed


@router.post("/run")
def run_coordination(incident: Incident):
    reports = run_all_agents(incident)
    response_plan = coordinate_response(incident, reports)
    return {
        "incident": incident.model_dump(),
        "agent_reports": [report.model_dump() for report in reports],
        "response_plan": response_plan.model_dump(),
    }


@router.post("/run-live")
def run_live_coordination(incident: Incident, user: dict = Depends(current_user)):
    if user["role"] != "government":
        raise HTTPException(status_code=403, detail="Only government coordinators can trigger live coordination.")

    rows = list(users_collection.find(
        {"resource_updates.0": {"$exists": True}},
        {"name": 1, "role": 1, "organization": 1, "resource_updates": 1},
    ))

    updates = []
    for row in rows:
        for update in row.get("resource_updates", []):
            item = dict(update)
            item["organization"] = row.get("organization") or row.get("name")
            item["role"] = row.get("role")
            updates.append(item)

    updates.sort(key=lambda item: item.get("updated_at", 0), reverse=True)
    applied_updates, _ = _apply_live_updates(incident, updates[:50])

    reports = run_all_agents(incident)
    response_plan = coordinate_response(incident, reports)

    return {
        "incident": incident.model_dump(),
        "agent_reports": [report.model_dump() for report in reports],
        "response_plan": response_plan.model_dump(),
        "live_updates_applied": applied_updates,
        "live_update_count": len(applied_updates),
    }
