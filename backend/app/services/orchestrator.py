from app.models.incident import Incident
from app.models.agent_report import AgentReport

from app.agents.hospital_agent import analyze_incident as hospital_analysis
from app.agents.police_agent import analyze_incident as police_analysis
from app.agents.transport_agent import analyze_incident as transport_analysis
from app.agents.ngo_agent import analyze_incident as ngo_analysis
from app.agents.government_agent import analyze_incident as government_analysis


def run_all_agents(incident: Incident) -> list[AgentReport]:
    """
    Send the incident to all specialized emergency-response agents.
    Each agent independently analyzes the situation.
    """

    reports = [
        hospital_analysis(incident),
        police_analysis(incident),
        transport_analysis(incident),
        ngo_analysis(incident),
        government_analysis(incident),
    ]

    return reports