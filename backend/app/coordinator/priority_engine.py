from app.models.agent_report import AgentReport


SAFETY_WEIGHTS = {
    "Government": 1.00,
    "Hospital": 0.95,
    "Police": 0.90,
    "Transport": 0.80,
    "NGO / Relief": 0.75,
}


def calculate_priorities(
    reports: list[AgentReport],
) -> list[dict]:

    ranked = []

    for report in reports:
        weight = SAFETY_WEIGHTS.get(report.agent_name, 0.70)

        score = round(
            report.priority * weight * report.confidence,
            2,
        )

        ranked.append(
            {
                "agent": report.agent_name,
                "priority": report.priority,
                "confidence": report.confidence,
                "weight": weight,
                "score": score,
            }
        )

    ranked.sort(
        key=lambda item: item["score"],
        reverse=True,
    )

    return ranked