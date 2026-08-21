from app.models.incident import Incident
from app.models.agent_report import AgentReport
from app.services.llm_service import generate_response


def analyze_incident(incident: Incident) -> AgentReport:
    observations = []
    recommendations = []
    resource_requests = []
    constraints = []

    # Existing rule-based analysis
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

    # AI-powered hospital analysis
    system_prompt = """
You are the Hospital Emergency Response Agent.

Analyze the emergency from a hospital perspective.

Focus on:
- Patient care
- Ambulance availability
- Medical supplies
- Hospital capacity
- Emergency medical resources

Give a concise operational recommendation for emergency coordinators.
Do not invent facts that are not provided.
"""

    user_prompt = f"""
Emergency incident:

Location: {incident.location}
Severity: {incident.severity}/10
Available ambulances: {incident.available_ambulances}
Urgent needs: {incident.urgent_needs}

Provide the hospital's recommended immediate response.
"""

    ai_response = generate_response(
        system_prompt,
        user_prompt,
    )

    # Add the AI analysis to the hospital report
    observations.append(
        f"AI Hospital Analysis: {ai_response}"
    )

    return AgentReport(
        agent_name="Hospital",
        priority=min(10, incident.severity + 1),
        confidence=0.92,
        observations=observations,
        recommendations=recommendations,
        resource_requests=resource_requests,
        constraints=constraints,
    )