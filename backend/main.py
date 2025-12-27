import asyncio
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, Query
import httpx
import logging
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from deriv import DerivError, fetch_candles, map_timeframe_to_granularity
from ema import compute_ema_series
from llm import analyze_with_llm

app = FastAPI(title="Deriv Trading Dashboard API", version="0.1.0")

logger = logging.getLogger("uvicorn.error")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.get("/api/candles")
async def get_candles(
    symbol: str = Query(..., description="Instrument code, e.g., BOOM500 or CRASH500"),
    timeframe: str = Query("1m", description="Timeframe: 1m, 1h, or 1d"),
    count: int = Query(200, ge=50, le=600, description="Number of candles"),
) -> Dict[str, Any]:
    try:
        granularity = map_timeframe_to_granularity(timeframe)
        candles = await fetch_candles(symbol=symbol, granularity=granularity, count=count)
    except DerivError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    closes = [c["close"] for c in candles]
    ema_periods = [20, 50, 100, 200]
    ema_map: Dict[int, List[Optional[float]]] = {
        p: compute_ema_series(closes, p) for p in ema_periods
    }

    enriched: List[Dict[str, Any]] = []
    for idx, c in enumerate(candles):
        enriched.append(
            {
                **c,
                "ema20": ema_map[20][idx],
                "ema50": ema_map[50][idx],
                "ema100": ema_map[100][idx],
                "ema200": ema_map[200][idx],
            }
        )

    return {
        "symbol": symbol,
        "timeframe": timeframe,
        "granularity": granularity,
        "candles": enriched,
    }


@app.post("/api/analyze")
async def analyze_market(
    symbol: str = Query(..., description="Instrument code"),
    timeframe: str = Query("1m", description="Timeframe: 1m, 1h, or 1d"),
    count: int = Query(200, ge=50, le=400, description="Candles to analyze"),
) -> Dict[str, str]:
    try:
        granularity = map_timeframe_to_granularity(timeframe)
        candles = await fetch_candles(symbol=symbol, granularity=granularity, count=count)
        
        # Fetch additional timeframe for multi-timeframe analysis
        support_candles = None
        if timeframe == "1d":
            # Daily analysis needs hourly to see how daily is forming
            hourly_gran = map_timeframe_to_granularity("1h")
            support_candles = await fetch_candles(symbol=symbol, granularity=hourly_gran, count=48)
        elif timeframe == "1h":
            # Hourly analysis needs 1m to see how hourly is forming
            min_gran = map_timeframe_to_granularity("1m")
            support_candles = await fetch_candles(symbol=symbol, granularity=min_gran, count=120)
        
        summary = await analyze_with_llm(
            symbol=symbol, 
            timeframe=timeframe, 
            candles=candles,
            support_candles=support_candles
        )
    except DerivError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except httpx.HTTPError as exc:
        detail = exc.response.text if getattr(exc, "response", None) else str(exc)
        status = exc.response.status_code if getattr(exc, "response", None) else "?"
        logger.error("LLM request failed (status=%s): %s", status, detail)
        raise HTTPException(status_code=400, detail=f"LLM error: {detail}")
    except Exception as exc:  # defensive: surface unexpected errors
        logger.exception("Unexpected error during analysis")
        raise HTTPException(status_code=500, detail=str(exc))

    return {"analysis": summary}
