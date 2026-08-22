from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel

from app.services.llm_service import generate_speech


router = APIRouter(
    prefix="/voice",
    tags=["Voice"],
)


class VoiceRequest(BaseModel):
    text: str


@router.post("/speak")
def speak(request: VoiceRequest):
    try:
        audio = generate_speech(request.text)

        return Response(
            content=audio,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline; filename=emergency_response.mp3"
            },
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )