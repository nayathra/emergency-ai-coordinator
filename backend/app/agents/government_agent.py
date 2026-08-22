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

    # LLM-based Government analysis
    system_prompt = """
You are a Government Emergency Coordination AI.

Analyze the emergency from a government-level coordination perspective.

Focus on:
- Overall emergency severity
- Affected population
- Inter-agency coordination
- Emergency response priorities
- Resource mobilization
- Evacuation when necessary
- Public safety
- Unified command and coordination

Give concise, practical recommendations for an emergency
coordination center.

Do not invent facts that are not provided.
Clearly distinguish recommendations from known incident facts.
Human safety must remain the highest priority.
"""

    user_prompt = f"""
Emergency incident:

Incident ID: {incident.incident_id}
Incident type: {incident.incident_type}
Location: {incident.location}
Severity: {incident.severity}/10
Affected population: {incident.affected_population}

Available ambulances: {incident.available_ambulances}
Available shelters: {incident.available_shelters}

Blocked routes: {incident.blocked_routes}
Active routes: {incident.active_routes}

Urgent needs: {incident.urgent_needs}

Provide the government coordination team's recommended
immediate response and explain the main priorities.
"""

    ai_analysis = generate_response(
        system_prompt,
        user_prompt
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