import time, re, os, httpx
from collections import deque

class RollingSummarizer:
    def __init__(self, window_seconds=60, max_history=10):
        self.window = window_seconds
        self.max_history = max_history
        self.buffer = deque()
        self.history = []

    def feed(self, text: str, speaker: str = ""):
        now = time.time()
        self.buffer.append({"text": text, "ts": now, "speaker": speaker})
        while self.buffer and now - self.buffer[0]["ts"] > self.window:
            self.buffer.popleft()

    def join_window(self) -> str:
        return " ".join([b["text"] for b in self.buffer])

    def _fallback_summary(self, text: str) -> str:
        lines = [l.strip() for l in re.split(r'[.?!\n]', text) if l.strip()]
        bullets = lines[:4]
        return ("• " + "\n• ".join(bullets)) if bullets else "(no content)"

    async def llm_summary(self, text: str) -> str:
        if not text.strip():
            return ""
        key = os.getenv("OPENAI_API_KEY")
        if not key:
            return self._fallback_summary(text)
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": "Summarize meeting speech in 60-80 words. Bullet decisions & actions."},
                {"role": "user", "content": text},
            ],
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {key}"},
                json=payload,
            )
            r.raise_for_status()
            data = r.json()
            return data["choices"][0]["message"]["content"].strip()

    async def make_interval_summary(self):
        text = self.join_window()
        out = await self.llm_summary(text)
        item = {"summary": out, "ts": time.time()}
        if out:
            self.history.append(item)
            self.history = self.history[-self.max_history:]
        return item

    async def final_digest(self):
        if not self.history:
            return {"voice_script": "No significant items captured today."}
        joined = "\n".join([h["summary"] for h in self.history])
        key = os.getenv("OPENAI_API_KEY")
        if not key:
            return {"voice_script": f"Today we covered: {joined[:450]}."}
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": "Create a 140-180 word spoken digest grouped by Decisions, Actions, Risks."},
                {"role": "user", "content": joined},
            ],
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {key}"},
                json=payload,
            )
            r.raise_for_status()
            data = r.json()
            return {"voice_script": data["choices"][0]["message"]["content"].strip()}
