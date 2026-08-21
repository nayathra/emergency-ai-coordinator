from fastapi import APIRouter

from app.models.incident import Incident
from app.services.orchestrator import run_all_agents


router = APIRouter(prefix="/agents", tags=["Agents"])


@router.post("/analyze")
def analyze_incident(incident: Incident):
    reports = run_all_agents(incident)

    return {
        "incident_id": incident.incident_id,
        "agent_count": len(reports),
        "reports": [report.model_dump() for report in reports],
    }