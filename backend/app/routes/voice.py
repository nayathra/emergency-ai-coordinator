from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel

from app.services.llm_service import (
    generate_speech,
    translate_text,
)


router = APIRouter(
    prefix="/voice",
    tags=["Voice"],
)


class VoiceRequest(BaseModel):
    text: str
    language: str = "en"


@router.post("/speak")
def speak(request: VoiceRequest):
    try:
        language = request.language.lower()

        supported_languages = {
            "en": "English",
            "ta": "Tamil",
            "hi": "Hindi",
        }

        if language not in supported_languages:
            raise ValueError(
                "Unsupported language. Use 'en', 'ta', or 'hi'."
            )

        text = request.text

        # Translate only the final user-facing response.
        if language != "en":
            text = translate_text(
                text,
                supported_languages[language],
            )

        audio = generate_speech(
            text,
            language,
        )

        return Response(
            content=audio,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": (
                    "inline; filename=emergency_response.mp3"
                )
            },
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )