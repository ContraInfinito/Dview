import { useEffect, useRef } from 'react';
import { createChart, ColorType, Time } from 'lightweight-charts';
import { Candle } from '../types';

type Props = {
  candles: Candle[];
};

export function Chart({ candles }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() =>
    {
      if (!containerRef.current || candles.length === 0) return;

      const chart = createChart(containerRef.current, {
        layout: { background: { type: ColorType.Solid, color: '#0f141c' }, textColor: '#e8edf5' },
        grid: {
          vertLines: { color: '#1f2a3a' },
          horzLines: { color: '#1f2a3a' },
        },
        rightPriceScale: { borderVisible: false },
        timeScale: { borderVisible: false },
      });

      const candleSeries = chart.addCandlestickSeries({
        upColor: '#2ecc71', downColor: '#e74c3c', borderVisible: false, wickUpColor: '#2ecc71', wickDownColor: '#e74c3c',
      });

      const ema20 = chart.addLineSeries({ color: '#66d9ff', lineWidth: 1.5 });
      const ema50 = chart.addLineSeries({ color: '#f1c40f', lineWidth: 1.5 });
      const ema100 = chart.addLineSeries({ color: '#e67e22', lineWidth: 1.5 });
      const ema200 = chart.addLineSeries({ color: '#9b59b6', lineWidth: 1.5 });

      const toTime = (epoch: number): Time => epoch as Time;

      candleSeries.setData(
        candles.map((c) => ({
          time: toTime(c.epoch),
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }))
      );

      const mapEma = (key: keyof Candle) =>
        candles
          .filter((c) => c[key] !== undefined && c[key] !== null)
          .map((c) => ({ time: toTime(c.epoch), value: c[key] as number }));

      ema20.setData(mapEma('ema20'));
      ema50.setData(mapEma('ema50'));
      ema100.setData(mapEma('ema100'));
      ema200.setData(mapEma('ema200'));

      const handleResize = () => {
        if (containerRef.current) {
          chart.applyOptions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight });
        }
      };

      handleResize();
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    }, [candles]);

  return <div className="chart-container" ref={containerRef} />;
}
