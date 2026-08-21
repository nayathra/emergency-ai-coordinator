from app.models.agent_report import AgentReport
from app.models.incident import Incident


def detect_conflicts(
    reports: list[AgentReport],
    incident: Incident,
) -> list[dict]:

    conflicts = []

    # ---------------------------------------------------------
    # 1. Resource conflicts
    # ---------------------------------------------------------

    resource_claims = {}

    for report in reports:
        for request in report.resource_requests:

            request_lower = request.lower()

            # Normalize similar resource requests
            if "ambulance" in request_lower:
                resource = "ambulances"

            elif "vehicle" in request_lower:
                resource = "emergency vehicles"

            elif "shelter" in request_lower:
                resource = "shelters"

            else:
                resource = request

            resource_claims.setdefault(
                resource,
                []
            ).append(report.agent_name)

    for resource, agents in resource_claims.items():

        if len(agents) > 1:

            conflicts.append(
                {
                    "type": "resource",
                    "severity": "high",
                    "resource": resource,
                    "agents": agents,
                    "description": (
                        f"Multiple agents require the limited "
                        f"resource: {resource}."
                    ),
                }
            )

    # ---------------------------------------------------------
    # 2. Resource availability conflicts
    # ---------------------------------------------------------

    if incident.available_ambulances == 0:

        ambulance_agents = [
            report.agent_name
            for report in reports
            if any(
                "ambulance" in request.lower()
                for request in report.resource_requests
            )
        ]

        if ambulance_agents:

            conflicts.append(
                {
                    "type": "resource_availability",
                    "severity": "critical",
                    "resource": "ambulances",
                    "available": 0,
                    "agents": ambulance_agents,
                    "description": (
                        "Agents requested ambulance support, "
                        "but no ambulances are currently available."
                    ),
                }
            )

    # ---------------------------------------------------------
    # 3. Constraint conflicts
    # ---------------------------------------------------------

    constraints = []

    for report in reports:

        for constraint in report.constraints:

            constraints.append(
                {
                    "agent": report.agent_name,
                    "constraint": constraint,
                }
            )

    # Detect route constraints
    blocked_route_constraints = []

    for item in constraints:

        text = item["constraint"].lower()

        if "route" in text and (
            "must not" in text
            or "do not" in text
            or "avoid" in text
        ):
            blocked_route_constraints.append(item)

    if len(blocked_route_constraints) > 1:

        conflicts.append(
            {
                "type": "constraint",
                "severity": "medium",
                "agents": [
                    item["agent"]
                    for item in blocked_route_constraints
                ],
                "description": (
                    "Multiple agents have constraints "
                    "related to blocked emergency routes."
                ),
            }
        )

    # ---------------------------------------------------------
    # 4. Recommendation conflicts
    # ---------------------------------------------------------

    recommendations = []

    for report in reports:

        for recommendation in report.recommendations:

            recommendations.append(
                {
                    "agent": report.agent_name,
                    "recommendation": recommendation,
                }
            )

    # Detect route-related recommendations
    route_recommendations = [
        item
        for item in recommendations
        if "route" in item["recommendation"].lower()
    ]

    if len(route_recommendations) > 1:

        conflicts.append(
            {
                "type": "route",
                "severity": "medium",
                "agents": [
                    item["agent"]
                    for item in route_recommendations
                ],
                "description": (
                    "Multiple agents provided route-related "
                    "recommendations that require coordination."
                ),
                "recommendations": route_recommendations,
            }
        )

    # ---------------------------------------------------------
    # 5. Priority conflicts
    # ---------------------------------------------------------

    priorities = {
        report.agent_name: report.priority
        for report in reports
    }

    if priorities:

        highest = max(priorities.values())
        lowest = min(priorities.values())

        if highest - lowest >= 3:

            conflicts.append(
                {
                    "type": "priority",
                    "severity": "medium",
                    "priorities": priorities,
                    "description": (
                        "Agents have significantly different "
                        "priority assessments."
                    ),
                }
            )

    return conflicts