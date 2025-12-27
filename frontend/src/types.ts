export type Candle = {
  epoch: number;
  open: number;
  high: number;
  low: number;
  close: number;
  ema20?: number | null;
  ema50?: number | null;
  ema100?: number | null;
  ema200?: number | null;
};

export type CandleResponse = {
  symbol: string;
  timeframe: string;
  granularity: number;
  candles: Candle[];
};
