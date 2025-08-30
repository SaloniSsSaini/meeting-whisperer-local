<<<<<<< HEAD
# Meeting Whisperer (Local, No Docker)
Quick local run:

1) Copy `.env.example` -> `.env` and fill keys.
2) Backend:
   ```bash
   cd backend
   python -m venv .venv
   # mac/linux: source .venv/bin/activate
   # windows:   .venv\Scripts\Activate.ps1
   pip install --upgrade pip
   pip install -r requirements.txt
   uvicorn app:app --reload --port 8000
   # check: curl http://127.0.0.1:8000/health
   ```
3) Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4) Open http://localhost:5173 in Chrome. Allow mic. Speak. Summarize. Listen.
=======
# repolkis
Meeting Whisperer – Real-time voice transcription, summarization, and TTS using Murf AI and OpenAI APIs
>>>>>>> e9bbd51eb6fa4ab6a93885b515dabf98e4645c5c
