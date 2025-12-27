import axios from 'axios';
import { CandleResponse } from './types';

const apiBase = import.meta.env.VITE_API_BASE || '';

export async function fetchCandles(symbol: string, timeframe: string) {
  const count = timeframe === '1d' ? 100 : timeframe === '1h' ? 150 : 200;
  const res = await axios.get<CandleResponse>(`${apiBase}/api/candles`, {
    params: { symbol, timeframe, count },
    timeout: 30000,
  });
  return res.data;
}

export async function analyze(symbol: string, timeframe: string) {
  const res = await axios.post<{ analysis: string }>(`${apiBase}/api/analyze`, null, {
    params: { symbol, timeframe },
  });
  return res.data.analysis;
}
