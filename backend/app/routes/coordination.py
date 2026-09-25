from datetime import datetime, timezone

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


def _latest_updates(updates):
    latest = {}
    for update in updates:
        key = (
            update.get("role", ""),
            update.get("organization", ""),
            update.get("metric", "").strip().lower(),
        )
        current = latest.get(key)
        if current is None or update.get("updated_at", datetime.min.replace(tzinfo=timezone.utc)) > current.get(
            "updated_at", datetime.min.replace(tzinfo=timezone.utc)
        ):
            latest[key] = update
    return sorted(
        latest.values(),
        key=lambda item: item.get("updated_at", datetime.min.replace(tzinfo=timezone.utc)),
        reverse=True,
    )


def _apply_live_updates(incident, updates):
    applied = []

    for update in updates:
        role = update.get("role", "")
        metric = update.get("metric", "").strip().lower()
        value = update.get("value", "")
        note = update.get("note", "")
        number = _number(value)
        source = update.get("organization") or role or "field agency"

        if role == "hospital" and metric == "ambulances" and number is not None:
            incident.available_ambulances = max(0, number)
            applied.append(f"Ambulances updated to {number} from {source}.")

        elif role == "ngo" and metric == "shelters" and number is not None:
            incident.available_shelters = max(0, number)
            applied.append(f"Shelters updated to {number} from {source}.")

        elif role == "police" and metric == "blocked route":
            route_text = value or note
            routes = re.findall(r"Route\s+[A-Za-z0-9-]+", route_text, flags=re.I)
            for route in routes:
                route = route.strip()
                if route not in incident.blocked_routes:
                    incident.blocked_routes.append(route)
                if route in incident.active_routes:
                    incident.active_routes.remove(route)
            if routes:
                applied.append(f"Route constraint updated: {', '.join(routes)} from {source}.")

        elif role == "police" and metric == "open routes":
            routes = re.findall(r"Route\s+[A-Za-z0-9-]+", value or note, flags=re.I)
            for route in routes:
                route = route.strip()
                if route in incident.blocked_routes:
                    incident.blocked_routes.remove(route)
                if route not in incident.active_routes:
                    incident.active_routes.append(route)
            if routes:
                applied.append(f"Open routes updated: {', '.join(routes)} from {source}.")

        elif role == "transport" and metric == "emergency vehicles" and number is not None:
            applied.append(f"Emergency vehicle availability reported as {number} by {source}.")

        elif role in {"hospital", "ngo", "police", "transport", "citizen"}:
            applied.append(f"{metric.title()} update received from {source}.")

    return applied


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

    updates = _latest_updates(updates)
    applied_updates = _apply_live_updates(incident, updates[:50])

    reports = run_all_agents(incident)
    response_plan = coordinate_response(incident, reports)

    return {
        "incident": incident.model_dump(),
        "agent_reports": [report.model_dump() for report in reports],
        "response_plan": response_plan.model_dump(),
        "live_updates_applied": applied_updates,
        "live_update_count": len(applied_updates),
    }
