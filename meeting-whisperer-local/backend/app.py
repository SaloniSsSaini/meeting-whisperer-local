import os
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from services.summarizer import RollingSummarizer
from services.murf import tts_rest_generate, tts_stream_generate

load_dotenv()

app = FastAPI(title="Meeting Whisperer API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

summ = RollingSummarizer()

class Line(BaseModel):
    text: str
    speaker: str | None = ""

class TTSReq(BaseModel):
    text: str
    voice_id: str = "en_female_01"
    language: str = "en"

@app.get("/health")
async def health():
    return {"ok": True}

@app.post("/api/transcript")
async def feed_transcript(line: Line):
    summ.feed(line.text, line.speaker or "")
    return {"ok": True}

@app.get("/api/summary")
async def api_summary():
    data = await summ.make_interval_summary()
    return JSONResponse(data)

@app.get("/api/digest")
async def api_digest():
    data = await summ.final_digest()
    return JSONResponse(data)

@app.post("/api/tts")
async def api_tts(req: TTSReq):
    mp3 = await tts_rest_generate(req.text, req.voice_id, req.language)
    return StreamingResponse(iter([mp3]), media_type="audio/mpeg")

@app.websocket("/ws/tts")
async def ws_tts(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            payload = await ws.receive_json()
            text = payload.get("text", "")
            voice = payload.get("voice_id", "en_female_01")
            lang = payload.get("language", "en")
            async for chunk in tts_stream_generate(text, voice, lang):
                await ws.send_bytes(chunk)
            await ws.send_json({"event": "end"})
    except WebSocketDisconnect:
        pass
