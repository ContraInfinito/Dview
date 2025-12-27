import asyncio
import json
from typing import Any, Dict, List

import websockets

from config import settings, timeframe_granularity


class DerivError(Exception):
    pass


def _ws_url() -> str:
    return f"{settings.deriv_api_endpoint}?app_id={settings.deriv_app_id}"


async def fetch_candles(
    symbol: str,
    granularity: int,
    count: int = 400,
    retries: int = 2,
) -> List[Dict[str, Any]]:
    """Fetch historical candles from Deriv via WebSocket with retry."""
    request = {
        "ticks_history": symbol,
        "style": "candles",
        "granularity": granularity,
        "count": count,
        "end": "latest",
    }

    last_error = None
    for attempt in range(retries + 1):
        try:
            async with websockets.connect(_ws_url(), close_timeout=10, ping_timeout=20) as ws:
                if settings.deriv_token:
                    await asyncio.wait_for(ws.send(json.dumps({"authorize": settings.deriv_token})), timeout=10)
                    auth_raw = await asyncio.wait_for(ws.recv(), timeout=10)
                    auth = json.loads(auth_raw)
                    if auth.get("error"):
                        raise DerivError(auth["error"].get("message", "Authorization failed"))

                await asyncio.wait_for(ws.send(json.dumps(request)), timeout=10)
                raw = await asyncio.wait_for(ws.recv(), timeout=15)
                payload = json.loads(raw)

                if payload.get("error"):
                    raise DerivError(payload["error"].get("message", "Deriv API error"))

                candles = payload.get("candles")
                if not candles:
                    raise DerivError("No candles returned from Deriv")

                return [
                    {
                        "epoch": c["epoch"],
                        "open": float(c["open"]),
                        "high": float(c["high"]),
                        "low": float(c["low"]),
                        "close": float(c["close"]),
                    }
                    for c in candles
                ]
        except (websockets.exceptions.WebSocketException, asyncio.TimeoutError, ConnectionError) as e:
            last_error = e
            if attempt < retries:
                await asyncio.sleep(0.5 * (attempt + 1))
                continue
            raise DerivError(f"Deriv API connection failed after {retries + 1} attempts: {str(e)}")
        except Exception as e:
            raise DerivError(f"Unexpected error fetching candles: {str(e)}")
    
    if last_error:
        raise DerivError(f"Failed to fetch candles: {str(last_error)}")
    raise DerivError("Failed to fetch candles")


def map_timeframe_to_granularity(timeframe: str) -> int:
    if timeframe not in timeframe_granularity:
        raise DerivError(f"Unsupported timeframe: {timeframe}")
    return timeframe_granularity[timeframe]
