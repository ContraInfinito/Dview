from typing import List, Optional


def compute_ema_series(values: List[float], period: int) -> List[Optional[float]]:
    """Return EMA values aligned with inputs, padded with None until period is available."""
    if period <= 0:
        raise ValueError("period must be positive")
    if not values:
        return []

    alpha = 2 / (period + 1)
    ema_values: List[Optional[float]] = [None] * len(values)

    # Seed with simple average of first `period` values
    if len(values) >= period:
        seed = sum(values[:period]) / period
        ema_values[period - 1] = seed
        prev = seed
        for i in range(period, len(values)):
            prev = alpha * values[i] + (1 - alpha) * prev
            ema_values[i] = prev
    return ema_values
