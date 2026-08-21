from app.models.incident import Incident
from app.models.agent_report import AgentReport
from app.services.llm_service import generate_response


def analyze_incident(incident: Incident) -> AgentReport:
    observations = []
    recommendations = []
    resource_requests = []
    constraints = []

    # Existing rule-based analysis
    if incident.blocked_routes:
        observations.append(
            f"Blocked routes detected: {', '.join(incident.blocked_routes)}"
        )

        recommendations.append(
            "Avoid blocked routes during evacuation."
        )

    if incident.affected_population > 5000:
        observations.append(
            "Large population requires controlled evacuation."
        )

        recommendations.append(
            "Prioritize crowd control and safe evacuation corridors."
        )

    recommendations.append(
        "Secure emergency routes before large-scale evacuation."
    )

    constraints.extend(
        [f"Route {route} must not be used." for route in incident.blocked_routes]
    )

    # AI-powered police analysis
    system_prompt = """
You are the Police Emergency Response Agent.

Analyze the emergency from a police and public-safety perspective.

Focus on:
- Public safety
- Crowd control
- Evacuation
- Blocked routes
- Emergency access routes
- Security and law enforcement resources

Give concise operational recommendations for emergency coordinators.
Do not invent facts that are not provided.
"""

    user_prompt = f"""
Emergency incident:

Incident type: {incident.incident_type}
Location: {incident.location}
Severity: {incident.severity}/10
Affected population: {incident.affected_population}
Blocked routes: {incident.blocked_routes}
Active routes: {incident.active_routes}
Urgent needs: {incident.urgent_needs}

Provide the police department's recommended immediate response.
"""

    ai_response = generate_response(
        system_prompt,
        user_prompt,
    )

    observations.append(
        f"AI Police Analysis: {ai_response}"
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