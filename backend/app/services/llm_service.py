import os
import json
import urllib.request
import urllib.error

from dotenv import load_dotenv
from groq import Groq


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()


# =========================================================
# GROQ LLM
# =========================================================

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

MODEL = "openai/gpt-oss-120b"


def generate_response(
    system_prompt: str,
    user_prompt: str,
) -> str:
    """
    Generate an AI response using Groq.
    """

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": user_prompt,
            },
        ],
        temperature=0.2,
        max_completion_tokens=500,
    )

    return response.choices[0].message.content


# =========================================================
# ELEVENLABS TEXT-TO-SPEECH
# =========================================================

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

# Official ElevenLabs example voice.
# You can replace this later with another voice ID.
ELEVENLABS_VOICE_ID = os.getenv(
    "ELEVENLABS_VOICE_ID",
    "JBFqnCBsd6RMkjVDRZzb"
)

ELEVENLABS_MODEL = "eleven_flash_v2_5"


def generate_speech(text: str) -> bytes:
    """
    Convert text into speech using ElevenLabs.

    Returns:
        bytes: MP3 audio data
    """

    if not ELEVENLABS_API_KEY:
        raise ValueError(
            "ELEVENLABS_API_KEY is not configured in backend/.env"
        )

    if not text or not text.strip():
        raise ValueError(
            "Text cannot be empty."
        )

    url = (
        f"https://api.elevenlabs.io/v1/text-to-speech/"
        f"{ELEVENLABS_VOICE_ID}"
        f"?output_format=mp3_44100_128"
    )

    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
    }

    payload = {
        "text": text,
        "model_id": ELEVENLABS_MODEL,
    }

    data = json.dumps(payload).encode("utf-8")

    request = urllib.request.Request(
        url,
        data=data,
        headers=headers,
        method="POST",
    )

    try:
        with urllib.request.urlopen(
            request,
            timeout=60,
        ) as response:

            return response.read()

    except urllib.error.HTTPError as error:

        error_body = error.read().decode(
            "utf-8",
            errors="replace"
        )

        raise RuntimeError(
            f"ElevenLabs API error "
            f"{error.code}: {error_body}"
        )

    except urllib.error.URLError as error:

        raise RuntimeError(
            f"Could not connect to ElevenLabs: {error.reason}"
        )