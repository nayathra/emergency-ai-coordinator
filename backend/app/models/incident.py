from pydantic import BaseModel, Field
from typing import Any, Dict, List


class Incident(BaseModel):
    incident_id: str
    incident_type: str
    location: str
    severity: int = Field(ge=1, le=10)

    affected_population: int = Field(ge=0)

    blocked_routes: List[str] = Field(default_factory=list)
    active_routes: List[str] = Field(default_factory=list)

    available_ambulances: int = Field(ge=0)
    available_shelters: int = Field(ge=0)

    urgent_needs: List[str] = Field(default_factory=list)

    # Real-world incident context plus clearly labelled prototype assumptions.
    # Agents may ignore fields they do not need, while the UI/assistant can
    # preserve the evidence basis for the simulation.
    scenario_context: Dict[str, Any] = Field(default_factory=dict)
