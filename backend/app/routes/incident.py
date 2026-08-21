from fastapi import APIRouter, HTTPException
from app.models.incident import Incident
from app.services.database import incidents_collection

router = APIRouter(
    prefix="/incidents",
    tags=["Incidents"]
)


@router.get("/")
def get_incidents():
    try:
        incidents = list(incidents_collection.find())

        for incident in incidents:
            incident["_id"] = str(incident["_id"])

        return incidents

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch incidents: {str(e)}"
        )


@router.post("/")
def create_incident(incident: Incident):
    try:
        incident_data = incident.model_dump()

        result = incidents_collection.insert_one(incident_data)

        return {
            "message": "Incident created successfully",
            "incident_id": incident.incident_id,
            "database_id": str(result.inserted_id)
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create incident: {str(e)}"
        )