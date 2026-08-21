from app.models.incident import Incident
from app.models.agent_report import AgentReport


def analyze_incident(incident: Incident) -> AgentReport:
    observations = []
    recommendations = []
    resource_requests = []
    constraints = []

    observations.append(
        f"{incident.affected_population} people are affected."
    )

    if incident.severity >= 8:
        recommendations.append(
            "Activate high-priority emergency response."
        )

    if incident.affected_population >= 5000:
        recommendations.append(
            "Prioritize evacuation of high-density affected zones."
        )

    recommendations.append(
        "Coordinate all agencies under a unified response plan."
    )

    constraints.append(
        "Human safety must remain the highest-level priority."
    )

    return AgentReport(
        agent_name="Government",
        priority=min(10, incident.severity + 1),
        confidence=0.94,
        observations=observations,
        recommendations=recommendations,
        resource_requests=resource_requests,
        constraints=constraints,
    )