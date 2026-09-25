from typing import Any, Dict, List

from fastapi import APIRouter
from pydantic import BaseModel, Field
import os

router = APIRouter(prefix="/assistant", tags=["AI Assistant"])


class AssistantRequest(BaseModel):
    question: str = Field(min_length=1, max_length=1000)
    incident: Dict[str, Any] = Field(default_factory=dict)
    response_plan: Dict[str, Any] = Field(default_factory=dict)
    agent_reports: List[Dict[str, Any]] = Field(default_factory=list)


def _text(value):
    if isinstance(value, list):
        return " ".join(str(v) for v in value)
    if isinstance(value, dict):
        return " ".join(f"{k}: {v}" for k, v in value.items())
    return str(value or "")


def _grounded_answer(req: AssistantRequest) -> str:
    q = req.question.lower()
    incident = req.incident
    plan = req.response_plan
    reports = req.agent_reports

    severity = incident.get("severity", "unknown")
    population = incident.get("affected_population", "unknown")
    ambulances = incident.get("available_ambulances", "unknown")
    shelters = incident.get("available_shelters", "unknown")
    blocked = incident.get("blocked_routes") or []
    active = incident.get("active_routes") or []
    actions = plan.get("selected_actions") or []
    reasoning = plan.get("reasoning") or []
    conflicts = plan.get("detected_conflicts") or []
    resolved = plan.get("resolved_conflicts") or []

    if any(k in q for k in ["why", "reason", "decision"]):
        if reasoning:
            return "The coordinator prioritized the response because " + " ".join(map(str, reasoning[:3])) + "."
        return f"The current incident is severity {severity}/10 with {population} people affected. The plan is based on the available resources and route constraints."

    if any(k in q for k in ["ambulance", "ambulances", "medical"]):
        return f"There are currently {ambulances} ambulances available. The hospital/transport recommendations are being reconciled with route constraints before dispatch. The active routes are {', '.join(active) if active else 'not specified'}."

    if any(k in q for k in ["shelter", "shelters", "ngo", "relief"]):
        return f"There are currently {shelters} shelters available. Relief coordination should prioritize food, water and vulnerable populations when those needs are present in the incident data."

    if any(k in q for k in ["route", "road", "blocked", "traffic", "evacuation"]):
        return f"Blocked routes: {', '.join(blocked) if blocked else 'none reported'}. Active routes: {', '.join(active) if active else 'none reported'}. The coordinator explicitly reconciles route recommendations against these constraints."

    if any(k in q for k in ["conflict", "disagree", "agent"]):
        return f"The system received {len(reports)} specialist reports, detected {len(conflicts)} conflicts and resolved {len(resolved)} conflicts in the current plan."

    if any(k in q for k in ["action", "do", "plan", "recommend", "recommendation"]):
        if actions:
            return "The current response actions are: " + " ".join(f"{i + 1}. {a}" for i, a in enumerate(actions[:5]))
        return "No response actions are currently available. Run the coordination analysis first."

    if any(k in q for k in ["severity", "how serious", "affected", "population"]):
        return f"The incident is currently recorded at severity {severity}/10, with an affected population of {population}."

    return (
        "I am the Emergency AI Coordinator assistant. I can explain the current incident, "
        "agent recommendations, conflicts, routes, resources and coordinator decision. "
        "Ask me something specific such as: “Why was this action prioritized?” or "
        "“What happens if Route B is blocked?”"
    )


@router.post("/ask")
def ask_assistant(req: AssistantRequest):
    question = req.question.strip()

    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        try:
            from openai import OpenAI

            client = OpenAI(api_key=api_key)
            context = {
                "incident": req.incident,
                "response_plan": req.response_plan,
                "agent_reports": req.agent_reports,
            }
            response = client.responses.create(
                model=os.getenv("OPENAI_MODEL", "gpt-5-mini"),
                instructions=(
                    "You are the Emergency AI Coordinator Assistant. Answer only from the supplied "
                    "incident context. Do not invent resources, routes, casualties, capabilities, "
                    "or actions. Explain uncertainty. You are decision support, not an autonomous "
                    "dispatcher. Keep answers concise and operational."
                ),
                input=f"Context:\n{context}\n\nUser question:\n{question}",
            )
            answer = response.output_text.strip()
            if answer:
                return {"answer": answer, "source": "grounded-ai"}
        except Exception:
            pass

    return {"answer": _grounded_answer(req), "source": "grounded-context"}
