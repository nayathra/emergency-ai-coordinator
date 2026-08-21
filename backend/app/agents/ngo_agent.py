from app.models.incident import Incident
from app.models.agent_report import AgentReport
from app.services.llm_service import generate_response


def analyze_incident(incident: Incident) -> AgentReport:
    observations = []
    recommendations = []
    resource_requests = []
    constraints = []

    # Existing rule-based logic
    if incident.available_shelters <= 2:
        observations.append(
            "Shelter availability is limited."
        )
        resource_requests.append(
            "Identify additional temporary shelters."
        )

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

    constraints.append(
        "Shelter capacity must not be exceeded."
    )

    # LLM-based NGO / Relief analysis
    system_prompt = """
You are an NGO and Emergency Relief Coordination AI.

Analyze the emergency from a humanitarian relief perspective.

Focus on:
- Shelter availability
- Food and water requirements
- Vulnerable populations
- Relief distribution
- Emergency supplies
- Temporary shelter requirements
- Safe and fair resource distribution

Give concise, practical recommendations for emergency coordinators.
Do not invent facts that are not provided.
Do not assume resources are available unless stated.
"""

    user_prompt = f"""
Emergency incident:

Incident ID: {incident.incident_id}
Incident type: {incident.incident_type}
Location: {incident.location}
Severity: {incident.severity}/10
Affected population: {incident.affected_population}

Available shelters: {incident.available_shelters}
Urgent needs: {incident.urgent_needs}

Blocked routes: {incident.blocked_routes}
Active routes: {incident.active_routes}

Provide the NGO / relief team's recommended immediate response.
"""

    ai_analysis = generate_response(
        system_prompt,
        user_prompt
    )

    observations.append(
        f"AI NGO / Relief Analysis: {ai_analysis}"
    )

    return AgentReport(
        agent_name="NGO / Relief",
        priority=min(10, incident.severity),
        confidence=0.88,
        observations=observations,
        recommendations=recommendations,
        resource_requests=resource_requests,
        constraints=constraints,
    )