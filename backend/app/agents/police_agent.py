from app.models.incident import Incident
from app.models.agent_report import AgentReport


def analyze_incident(incident: Incident) -> AgentReport:
    observations = []
    recommendations = []
    resource_requests = []
    constraints = []

    if incident.blocked_routes:
        observations.append(
            f"Blocked routes detected: {', '.join(incident.blocked_routes)}"
        )

        recommendations.append(
            "Avoid blocked routes during evacuation."
        )

    if incident.affected_population > 5000:
        observations.append("Large population requires controlled evacuation.")
        recommendations.append(
            "Prioritize crowd control and safe evacuation corridors."
        )

    recommendations.append(
        "Secure emergency routes before large-scale evacuation."
    )

    constraints.extend(
        [f"Route {route} must not be used." for route in incident.blocked_routes]
    )

    return AgentReport(
        agent_name="Police",
        priority=min(10, incident.severity),
        confidence=0.95,
        observations=observations,
        recommendations=recommendations,
        resource_requests=resource_requests,
        constraints=constraints,
    )