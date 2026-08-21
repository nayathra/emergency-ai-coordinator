from app.models.incident import Incident
from app.models.agent_report import AgentReport
from app.models.response_plan import ResponsePlan

from app.coordinator.conflict_engine import detect_conflicts
from app.coordinator.priority_engine import calculate_priorities


def coordinate_response(
    incident: Incident,
    reports: list[AgentReport],
) -> ResponsePlan:

    # ---------------------------------------------------------
    # 1. Detect conflicts between agent recommendations
    # ---------------------------------------------------------

    conflicts = detect_conflicts(
        reports,
        incident,
    )

    # ---------------------------------------------------------
    # 2. Rank agent priorities
    # ---------------------------------------------------------

    rankings = calculate_priorities(reports)

    # Select highest-priority agent
    top_agent = rankings[0] if rankings else None

    selected_actions = []
    resource_allocations = []
    reasoning = []
    resolved_conflicts = []
    alternative_actions = []

    # ---------------------------------------------------------
    # 3. Collect recommendations
    # ---------------------------------------------------------

    for report in reports:

        for recommendation in report.recommendations:
            selected_actions.append(recommendation)

        for request in report.resource_requests:

            # Do not treat ambulance requests as actual
            # allocations when no ambulances are available.
            if (
                incident.available_ambulances == 0
                and "ambulance" in request.lower()
            ):
                continue

            resource_allocations.append(
                f"{report.agent_name}: {request}"
            )

    # ---------------------------------------------------------
    # 4. Emergency resource availability
    # ---------------------------------------------------------

    if incident.available_ambulances == 0:

        # Remove impossible ambulance actions
        selected_actions = [
            action
            for action in selected_actions
            if "ambulance" not in action.lower()
        ]

        # Add realistic emergency response
        selected_actions.append(
            "Request external emergency ambulances."
        )

        selected_actions.append(
            "Prioritize critical medical cases for emergency transport."
        )

        resource_allocations.append(
            "Emergency Services: Request external ambulances because none are currently available."
        )

        resolved_conflicts.append(
            "Ambulance shortage addressed by requesting external emergency transport."
        )

        reasoning.append(
            "No ambulances are currently available, so internal ambulance allocation is impossible."
        )

        reasoning.append(
            "External emergency transport is required for critical medical cases."
        )

    # ---------------------------------------------------------
    # 5. Hard safety constraints
    # ---------------------------------------------------------

    for route in incident.blocked_routes:

        selected_actions = [
            action
            for action in selected_actions
            if route.lower() not in action.lower()
        ]

        reasoning.append(
            f"Blocked route {route} cannot be used."
        )

    # ---------------------------------------------------------
    # 6. Conflict resolution
    # ---------------------------------------------------------

    for conflict in conflicts:

        conflict_type = conflict.get("type")

        # -----------------------------------------------------
        # Route conflicts
        # -----------------------------------------------------

        if conflict_type == "route":

            resolved_conflicts.append(
                "Route recommendations were reconciled using "
                "available and non-blocked routes."
            )

            if incident.active_routes:

                safe_routes = [
                    route
                    for route in incident.active_routes
                    if route not in incident.blocked_routes
                ]

                if safe_routes:

                    selected_actions.append(
                        f"Use safe evacuation routes: "
                        f"{', '.join(safe_routes)}."
                    )

        # -----------------------------------------------------
        # Resource conflicts
        # -----------------------------------------------------

        elif conflict_type == "resource":

            resolved_conflicts.append(
                "Shared resource requests were prioritized "
                "according to emergency priority."
            )

        # -----------------------------------------------------
        # Resource availability conflicts
        # -----------------------------------------------------

        elif conflict_type == "resource_availability":

            # Ambulance shortage is already handled above.
            if conflict.get("resource") == "ambulances":
                resolved_conflicts.append(
                    "Ambulance shortage addressed by requesting "
                    "external emergency transport."
                )

        # -----------------------------------------------------
        # Constraint conflicts
        # -----------------------------------------------------

        elif conflict_type == "constraint":

            resolved_conflicts.append(
                "Emergency route constraints were enforced "
                "to prevent unsafe routing."
            )

        # -----------------------------------------------------
        # Priority conflicts
        # -----------------------------------------------------

        elif conflict_type == "priority":

            resolved_conflicts.append(
                "Conflicting priorities were ranked using "
                "priority, confidence, and domain safety weight."
            )

    # ---------------------------------------------------------
    # 7. Explain the decision
    # ---------------------------------------------------------

    if top_agent:

        reasoning.append(
            f"{top_agent['agent']} received the highest coordination "
            f"score of {top_agent['score']}."
        )

        reasoning.append(
            f"Priority: {top_agent['priority']}, "
            f"confidence: {top_agent['confidence']}."
        )

    if incident.severity >= 8:

        reasoning.append(
            "Incident severity is critical, so life-safety actions "
            "are prioritized."
        )

    if incident.affected_population >= 5000:

        reasoning.append(
            "Large affected population increases evacuation priority."
        )

    # ---------------------------------------------------------
    # 8. Alternatives
    # ---------------------------------------------------------

    if incident.active_routes:

        for route in incident.active_routes:

            if route not in incident.blocked_routes:

                alternative_actions.append(
                    f"Alternative evacuation route: {route}"
                )

    # ---------------------------------------------------------
    # 9. Remove duplicates while preserving order
    # ---------------------------------------------------------

    selected_actions = list(
        dict.fromkeys(selected_actions)
    )

    resource_allocations = list(
        dict.fromkeys(resource_allocations)
    )

    reasoning = list(
        dict.fromkeys(reasoning)
    )

    resolved_conflicts = list(
        dict.fromkeys(resolved_conflicts)
    )

    alternative_actions = list(
        dict.fromkeys(alternative_actions)
    )

    # ---------------------------------------------------------
    # 10. Build final response plan
    # ---------------------------------------------------------

    return ResponsePlan(
        incident_id=incident.incident_id,
        overall_priority=incident.severity,
        selected_actions=selected_actions,
        resource_allocations=resource_allocations,
        detected_conflicts=[
            conflict["description"]
            for conflict in conflicts
        ],
        resolved_conflicts=resolved_conflicts,
        reasoning=reasoning,
        alternative_actions=alternative_actions,
    )