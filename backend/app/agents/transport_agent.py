from app.models.incident import Incident
from app.models.agent_report import AgentReport


def analyze_incident(incident: Incident) -> AgentReport:
    observations = []
    recommendations = []
    resource_requests = []
    constraints = []

    observations.append(
        f"{incident.available_ambulances} ambulances currently available."
    )

    if incident.available_ambulances <= 2:
        recommendations.append(
            "Reserve available ambulances for highest-priority zones."
        )
        resource_requests.append("Request additional emergency vehicles.")

    active_routes = [
        route for route in incident.active_routes
        if route not in incident.blocked_routes
    ]

    if active_routes:
        recommendations.append(
            f"Use available routes: {', '.join(active_routes)}"
        )

    constraints.extend(
        [f"Do not dispatch vehicles through {route}."
         for route in incident.blocked_routes]
    )

    return AgentReport(
        agent_name="Transport",
        priority=min(10, incident.severity),
        confidence=0.90,
        observations=observations,
        recommendations=recommendations,
        resource_requests=resource_requests,
        constraints=constraints,
    )