from app.models.incident import Incident
from app.models.agent_report import AgentReport
from app.services.llm_service import generate_response


def analyze_incident(incident: Incident) -> AgentReport:
    observations = []
    recommendations = []
    resource_requests = []
    constraints = []

    # Existing rule-based logic
    observations.append(
        f"{incident.available_ambulances} ambulances currently available."
    )

    if incident.available_ambulances <= 2:
        recommendations.append(
            "Reserve available ambulances for highest-priority zones."
        )
        resource_requests.append(
            "Request additional emergency vehicles."
        )

    active_routes = [
        route for route in incident.active_routes
        if route not in incident.blocked_routes
    ]

    if active_routes:
        recommendations.append(
            f"Use available routes: {', '.join(active_routes)}"
        )

    constraints.extend(
        [
            f"Do not dispatch vehicles through {route}."
            for route in incident.blocked_routes
        ]
    )

    # LLM-based transport analysis
    system_prompt = """
You are an Emergency Transport Coordination AI.

Analyze the incident from the perspective of ambulance,
emergency vehicle, and route coordination.

Focus on:
- Ambulance availability
- Severity of the incident
- Affected population
- Blocked routes
- Active routes
- Emergency vehicle requirements

Give concise, practical operational recommendations.
Do not invent exact real-world information that is not provided.
"""

    user_prompt = f"""
Incident ID: {incident.incident_id}
Incident Type: {incident.incident_type}
Location: {incident.location}
Severity: {incident.severity}/10
Affected Population: {incident.affected_population}

Available Ambulances: {incident.available_ambulances}
Available Shelters: {incident.available_shelters}

Blocked Routes: {incident.blocked_routes}
Active Routes: {incident.active_routes}

Urgent Needs: {incident.urgent_needs}
"""

    ai_analysis = generate_response(
        system_prompt,
        user_prompt
    )

    observations.append(
        f"AI Transport Analysis: {ai_analysis}"
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