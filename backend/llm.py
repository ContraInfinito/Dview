import asyncio
import logging
from typing import Any, Dict, List

from groq import Groq

from config import settings

logger = logging.getLogger("uvicorn.error")


async def analyze_with_llm(
    symbol: str, 
    timeframe: str, 
    candles: List[Dict[str, Any]],
    support_candles: List[Dict[str, Any]] | None = None
) -> str:
    """Call Groq chat completions. Returns a short narrative; falls back if not configured."""
    if not settings.llm_api_key:
        return "LLM API not configured. Provide LLM_API_KEY in the backend .env to enable analysis."

    closes = [c["close"] for c in candles[-120:]]
    last_close = closes[-1] if closes else None
    
    # Build timeframe-specific prompt
    bias_rule = "Instrument bias: Boom 500 = longs only; Crash 500 = shorts only. If bias violates, say 'No setup: bias mismatch' and stop.\n"
    
    if timeframe == "1d":
        prompt = (
            "You are a disciplined daily timeframe trading analyst. Follow ALL rules, keep output under 200 words.\n"
            f"{bias_rule}"
            "Daily Analysis Process:\n"
            "1) Daily candle projection: Predict how the current daily candle will close (red/green). Check trend vs EMAs (20/50/100/200), momentum, exhaustion signs (very large/small candles at trend extremes), climax patterns.\n"
            "2) Hourly validation: Use the provided hourly candles to see HOW the daily move was constructed. Look for: exhaustion in hourly structure, thrust-fade patterns, stalls, failed breakouts, retests of key levels, EMA relationship changes.\n"
            "3) Key risks: Note any contradictions between daily bias and hourly structure.\n"
            "Output: Bias check; daily projection (bullish/bearish close); hourly evidence (supporting/contradicting); key risks."
        )
    elif timeframe == "1h":
        prompt = (
            "You are a disciplined hourly timeframe trading analyst. Follow ALL rules, keep output under 200 words.\n"
            f"{bias_rule}"
            "Hourly Analysis Process:\n"
            "1) Hourly candle projection: Predict the next 1-2 hourly candles. Check trend vs EMAs (20/50/100/200), momentum, exhaustion signs, pattern formations (engulfing, pin bars, hammers, double tops/bottoms).\n"
            "2) 1-minute validation: Use the provided 1m candles to see HOW the current hourly candle is forming. Look for: micro-structure exhaustion, thrust-fade on 1m, rejections at levels, momentum shifts, failed follow-through.\n"
            "3) POI (optional): If bias aligns and structure is favorable, suggest a reasonable 1m entry zone; otherwise state 'No clear POI'.\n"
            "Output: Bias check; hourly projection; 1m micro-structure evidence; POI or 'No clear POI'; key risks."
        )
    else:  # 1m
        prompt = (
            "You are a disciplined intraday 1-minute trading analyst. Follow ALL rules, keep output under 180 words.\n"
            f"{bias_rule}"
            "1-Minute Analysis Process (only if context is favorable):\n"
            "1) Micro-structure: Read recent 1m candles for pattern formations (hammer, engulfing, pin bar, double top/bottom, climax candles). Check trend vs EMAs (20/50/100/200).\n"
            "2) Momentum: Is price extending the trend or showing reversal signs (exhaustion wicks, failed follow-through, rejection candles)?\n"
            "3) POI: If bias aligns and structure is clear, suggest a specific 1m entry zone; otherwise state 'No clear POI' or 'Wait for better context'.\n"
            "Output: Bias check; micro-structure read; momentum assessment; POI or wait signal; key risks."
        )
    
    # Prepare user message with support candles if available
    support_info = ""
    if support_candles:
        support_closes = [c["close"] for c in support_candles[-60:]]
        support_tf = "hourly" if timeframe == "1d" else "1-minute"
        support_info = f"\n{support_tf.capitalize()} support candles (last {len(support_closes)}): {support_closes}\n{support_tf.capitalize()} last close: {support_closes[-1] if support_closes else 'N/A'}"

    client = Groq(api_key=settings.llm_api_key)

    def _run_sync():
        return client.chat.completions.create(
            model=settings.llm_model,
            messages=[
                {"role": "system", "content": prompt},
                {
                    "role": "user",
                    "content": (
                        f"Symbol: {symbol}\nPrimary timeframe: {timeframe}\n"
                        f"Primary closes (last {len(closes)}): {closes}\n"
                        f"Primary last close: {last_close}"
                        f"{support_info}"
                    ),
                },
            ],
            temperature=0.6,
            max_tokens=800,
            top_p=0.95,
            stream=False,
        )

    try:
        completion = await asyncio.to_thread(_run_sync)
        if completion and completion.choices and len(completion.choices) > 0:
            choice = completion.choices[0]
            if hasattr(choice, 'message') and hasattr(choice.message, 'content'):
                msg = choice.message.content
                if msg:
                    return msg.strip()
        logger.error("LLM response structure unexpected: completion=%s, has_choices=%s", 
                     type(completion).__name__, 
                     hasattr(completion, 'choices') if completion else False)
        return "LLM response could not be parsed."
    except Exception as e:
        logger.exception("LLM call failed")
        raise
