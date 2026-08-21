import os
from dotenv import load_dotenv
from groq import Groq

# Load environment variables from backend/.env
load_dotenv()

# Create Groq client
client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

MODEL = "openai/gpt-oss-120b"


def generate_response(
    system_prompt: str,
    user_prompt: str,
) -> str:

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