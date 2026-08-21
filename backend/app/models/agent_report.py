from pydantic import BaseModel
from typing import List


class AgentReport(BaseModel):
    agent_name: str

    priority: int
    confidence: float

    observations: List[str]
    recommendations: List[str]
    resource_requests: List[str]

    constraints: List[str]
    conflicts: List[str] = []