import os

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from twilio.rest import Client
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/sms", tags=["SMS"])


class SMSRequest(BaseModel):
    to: str
    message: str


@router.post("/send")
def send_sms(request: SMSRequest):

    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    twilio_phone_number = os.getenv("TWILIO_PHONE_NUMBER")

    if not account_sid or not auth_token or not twilio_phone_number:
        raise HTTPException(
            status_code=500,
            detail="Twilio credentials are missing"
        )

    try:
        client = Client(account_sid, auth_token)

        message = client.messages.create(
            body=request.message,
            from_=twilio_phone_number,
            to=request.to
        )

        return {
            "success": True,
            "message": "SMS sent successfully",
            "message_sid": message.sid,
            "to": request.to
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )