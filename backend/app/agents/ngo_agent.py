from app.models.incident import Incident
from app.models.agent_report import AgentReport


def analyze_incident(incident: Incident) -> AgentReport:
    observations = []
    recommendations = []
    resource_requests = []
    constraints = []

    if incident.available_shelters <= 2:
        observations.append("Shelter availability is limited.")
        resource_requests.append("Identify additional temporary shelters.")

    if "food" in incident.urgent_needs:
        recommendations.append(
            "Prioritize food distribution to affected communities."
        )

    if "water" in incident.urgent_needs:
        recommendations.append(
            "Prioritize clean water distribution."
        )

    recommendations.append(
        "Prioritize vulnerable populations for relief distribution."
    )

    constraints.append("Shelter capacity must not be exceeded.")

    return AgentReport(
        agent_name="NGO / Relief",
        priority=min(10, incident.severity),
        confidence=0.88,
        observations=observations,
        recommendations=recommendations,
        resource_requests=resource_requests,
        constraints=constraints,
    )