from fastapi import APIRouter

from app.models.incident import Incident
from app.services.orchestrator import run_all_agents
from app.coordinator.coordinator import coordinate_response


router = APIRouter(
    prefix="/coordination",
    tags=["Coordination"],
)


@router.post("/run")
def run_coordination(incident: Incident):

    # Run all five specialized agents
    reports = run_all_agents(incident)

    # Coordinator resolves the combined situation
    response_plan = coordinate_response(
        incident,
        reports,
    )

    return {
        "incident": incident.model_dump(),
        "agent_reports": [
            report.model_dump()
            for report in reports
        ],
        "response_plan": response_plan.model_dump(),
    }