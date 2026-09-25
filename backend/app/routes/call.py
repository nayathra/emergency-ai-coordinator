import os

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/voice", tags=["Voice Calls"])


class VoiceCallRequest(BaseModel):
    text: str
    to: str | None = None
    language: str = "en"


@router.post("/call")
def make_voice_call(request: VoiceCallRequest):
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_PHONE_NUMBER")
    to_number = request.to or os.getenv("TWILIO_CALL_TO")

    if not account_sid or not auth_token or not from_number:
        raise HTTPException(status_code=500, detail="Twilio credentials are missing.")
    if not to_number:
        raise HTTPException(status_code=400, detail="Set TWILIO_CALL_TO in the backend environment or provide an authorized destination.")
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Call briefing text cannot be empty.")

    language_map = {"en": "en-IN", "hi": "hi-IN", "ta": "ta-IN"}
    twilio_language = language_map.get(request.language.lower(), "en-IN")

    try:
        twiml = VoiceResponse()
        twiml.say(
            request.text.strip(),
            language=twilio_language,
        )

        client = Client(account_sid, auth_token)
        call = client.calls.create(
            twiml=str(twiml),
            from_=from_number,
            to=to_number,
        )

        return {
            "success": True,
            "message": "Emergency briefing call initiated.",
            "call_sid": call.sid,
            "to": to_number,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Twilio call failed: {exc}") from exc
