from pydantic import BaseModel, Field
from typing import List


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