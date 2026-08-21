from fastapi import APIRouter
from copy import deepcopy

from app.models.incident import Incident
from app.services.orchestrator import run_all_agents
from app.coordinator.coordinator import coordinate_response


router = APIRouter(
    prefix="/simulation",
    tags=["What-If Simulation"],
)


@router.post("/run")
def run_simulation(
    incident: Incident,
    simulated_changes: dict,
):
    """
    Apply temporary changes to an incident,
    run the complete coordination pipeline again,
    and return the updated response plan.
    """

    # Keep the original incident unchanged
    simulated_incident = deepcopy(incident)

    # ---------------------------------------------------------
    # Apply simulated changes
    # ---------------------------------------------------------

    for field, value in simulated_changes.items():

        if hasattr(simulated_incident, field):
            setattr(simulated_incident, field, value)

    # ---------------------------------------------------------
    # Keep route state consistent
    # ---------------------------------------------------------

    # A blocked route cannot remain an active route.
    simulated_incident.active_routes = [
        route
        for route in simulated_incident.active_routes
        if route not in simulated_incident.blocked_routes
    ]

    # ---------------------------------------------------------
    # Run all agents again with the simulated situation
    # ---------------------------------------------------------

    reports = run_all_agents(simulated_incident)

    # ---------------------------------------------------------
    # Generate a new coordinated response
    # ---------------------------------------------------------

    new_plan = coordinate_response(
        simulated_incident,
        reports,
    )

    return {
        "original_incident": incident.model_dump(),
        "simulated_changes": simulated_changes,
        "simulated_incident": simulated_incident.model_dump(),
        "agent_reports": [
            report.model_dump()
            for report in reports
        ],
        "new_response_plan": new_plan.model_dump(),
    }