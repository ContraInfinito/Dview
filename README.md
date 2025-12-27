# Deriv Trading Dashboard (FastAPI + React)

Local-only starter that proxies Deriv WebSocket data, computes EMAs (20/50/100/200), renders TradingView Lightweight Charts, and calls an external LLM for narrative analysis.

## Stack
- Backend: FastAPI, websockets client, httpx
- Frontend: React + Vite + lightweight-charts

## Setup
1) Clone/open this folder in VS Code.
2) Copy `.env.example` to `.env` and fill values:
   - `DERIV_TOKEN` (read-only token is enough for charts)
   - `LLM_API_URL`, `LLM_API_KEY` (optional, for AI analysis)
3) Backend
   - `cd backend`
   - `python -m venv .venv` (Windows: `python -m venv .venv`)
   - Activate: `.venv\Scripts\activate`
   - `pip install -r requirements.txt`
   - Run: `uvicorn main:app --reload --host 0.0.0.0 --port 8000`
4) Frontend (new terminal)
   - `cd frontend`
   - `npm install`
   - `npm run dev` (Vite on port 5173 with proxy to 8000)

## Usage
- Open http://localhost:5173 and switch between Boom 500 / Crash 500 and 1m/1h/1d timeframes.
- Click "AI Analysis" to request a narrative (requires LLM env vars set).

## API (backend)
- `GET /health`
- `GET /api/candles?symbol=BOOM500&timeframe=1m&count=400` → candles with EMA overlays
- `POST /api/analyze?symbol=BOOM500&timeframe=1m&count=200` → text analysis via external LLM

## Notes
- Keep tokens server-side; frontend calls backend only.
- This is a starter; add persistence, auth, and proper error handling before production use.
