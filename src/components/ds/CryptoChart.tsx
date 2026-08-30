import { useEffect, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  ColorType,
  LineStyle,
  type IChartApi,
  type UTCTimestamp,
} from "lightweight-charts";

import type { Candle } from "@/lib/crypto/binance";
import type { SmcResult } from "@/lib/crypto/smc";

export function CryptoChart({ candles, smc }: { candles: Candle[]; smc: SmcResult | null }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || candles.length === 0) return;

    const chart: IChartApi = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#94a3b8",
      },
      grid: {
        vertLines: { color: "rgba(148,163,184,0.08)" },
        horzLines: { color: "rgba(148,163,184,0.08)" },
      },
      rightPriceScale: { borderColor: "rgba(148,163,184,0.15)" },
      timeScale: {
        borderColor: "rgba(148,163,184,0.15)",
        timeVisible: true,
        secondsVisible: false,
      },
      width: container.clientWidth,
      height: 380,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });
    candleSeries.setData(
      candles.map((c) => ({
        time: c.time as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      })),
    );

    if (smc) {
      const emaFast = chart.addSeries(LineSeries, { color: "#38bdf8", lineWidth: 1 });
      emaFast.setData(
        smc.emaFast.map((v, i) => ({ time: candles[i]!.time as UTCTimestamp, value: v })),
      );
      const emaSlow = chart.addSeries(LineSeries, { color: "#f59e0b", lineWidth: 1 });
      emaSlow.setData(
        smc.emaSlow.map((v, i) => ({ time: candles[i]!.time as UTCTimestamp, value: v })),
      );

      const line = (price: number, color: string, title: string, dashed = true) =>
        candleSeries.createPriceLine({
          price,
          color,
          lineWidth: 1,
          lineStyle: dashed ? LineStyle.Dashed : LineStyle.Solid,
          title,
          axisLabelVisible: true,
        });

      if (smc.signal !== "none") {
        line(smc.entry, "#e2e8f0", "Entry", false);
        line(smc.stop, "#ef4444", "Stop");
        line(smc.target1, "#22c55e", "T1");
        line(smc.target2, "#22c55e", "T2");
      }
      smc.support.slice(0, 3).forEach((p, i) => line(p, "#22c55e", `S${i + 1}`));
      smc.resistance.slice(0, 3).forEach((p, i) => line(p, "#ef4444", `R${i + 1}`));
    }

    chart.timeScale().fitContent();

    const onResize = () => chart.applyOptions({ width: container.clientWidth });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      chart.remove();
    };
  }, [candles, smc]);

  return <div ref={containerRef} className="w-full" />;
}
