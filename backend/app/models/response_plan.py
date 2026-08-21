from pydantic import BaseModel
from typing import List


class ResponsePlan(BaseModel):
    incident_id: str

    overall_priority: int

    selected_actions: List[str]
    resource_allocations: List[str]

    detected_conflicts: List[str]
    resolved_conflicts: List[str]

    reasoning: List[str]

    alternative_actions: List[str] = []