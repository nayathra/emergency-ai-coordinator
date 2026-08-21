from app.models.incident import Incident
from app.models.agent_report import AgentReport


def analyze_incident(incident: Incident) -> AgentReport:
    observations = []
    recommendations = []
    resource_requests = []
    constraints = []

    if incident.severity >= 8:
        observations.append("High-severity emergency detected.")

    if incident.available_ambulances <= 2:
        observations.append("Ambulance availability is critically limited.")
        resource_requests.append("Prioritize ambulance allocation.")

    if "medical supplies" in incident.urgent_needs:
        recommendations.append("Prioritize medical supply delivery.")

    recommendations.append(
        f"Prioritize emergency medical support for {incident.location}."
    )

    constraints.append("Hospital capacity must not be exceeded.")

    return AgentReport(
        agent_name="Hospital",
        priority=min(10, incident.severity + 1),
        confidence=0.92,
        observations=observations,
        recommendations=recommendations,
        resource_requests=resource_requests,
        constraints=constraints,
    )