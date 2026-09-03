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
# TRANSLATION
# =========================================================

def translate_text(
    text: str,
    target_language: str,
) -> str:
    """
    Translate the final emergency response into the
    requested user-facing language.

    Internal agent reasoning remains in English.
    """

    if not text or not text.strip():
        raise ValueError(
            "Text cannot be empty."
        )

    system_prompt = f"""
You are a professional emergency communication translator.

Translate the provided emergency response into {target_language}.

Rules:
- Preserve the exact meaning.
- Do not add new information.
- Do not remove important information.
- Preserve numbers, locations, routes, resources and priorities.
- Keep emergency instructions clear and concise.
- Use natural spoken {target_language}.
- Do not explain the translation.
- Return only the translated text.
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
            "content": text,
        },
    ],
    temperature=0.1,
    max_completion_tokens=1500,
)

    translated = response.choices[0].message.content

    if not translated:
        raise RuntimeError(
            "Translation returned an empty response."
        )

    return translated.strip()


# =========================================================
# ELEVENLABS TEXT-TO-SPEECH
# =========================================================

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

ELEVENLABS_VOICE_ID = os.getenv(
    "ELEVENLABS_VOICE_ID",
    "JBFqnCBsd6RMkjVDRZzb"
)

ELEVENLABS_MODEL = "eleven_flash_v2_5"


def generate_speech(
    text: str,
    language: str = "en",
) -> bytes:
    """
    Convert text into speech using ElevenLabs.

    Supported languages:
        en = English
        ta = Tamil
        hi = Hindi

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

    language_codes = {
        "en": "en",
        "ta": "ta",
        "hi": "hi",
    }

    language = language.lower()

    if language not in language_codes:
        raise ValueError(
            "Unsupported language. Use 'en', 'ta', or 'hi'."
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
        "language_code": language_codes[language],
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