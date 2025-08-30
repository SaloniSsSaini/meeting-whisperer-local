import os, httpx
from typing import AsyncGenerator

MURF_TTS_URL = os.getenv("MURF_TTS_URL", "https://api.murf.ai/v1/speech/generate")
MURF_STREAMING_URL = os.getenv("MURF_STREAMING_URL")
MURF_KEY = os.getenv("MURF_API_KEY")

async def tts_rest_generate(text: str, voice_id: str = "en_female_01", language: str = "en") -> bytes:
    if not MURF_KEY:
        raise RuntimeError("MURF_API_KEY missing")
    payload = {
        "voice_id": voice_id,
        "text": text,
        "format": "mp3",
        "language": language,
    }
    async with httpx.AsyncClient(timeout=None) as client:
        r = await client.post(
            MURF_TTS_URL,
            headers={"Authorization": f"Bearer {MURF_KEY}"},
            json=payload,
        )
        r.raise_for_status()
        return r.content

async def tts_stream_generate(text: str, voice_id: str = "en_female_01", language: str = "en") -> AsyncGenerator[bytes, None]:
    mp3 = await tts_rest_generate(text, voice_id, language)
    CHUNK = 32_000
    for i in range(0, len(mp3), CHUNK):
        yield mp3[i:i+CHUNK]
