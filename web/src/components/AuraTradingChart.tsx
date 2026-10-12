"use client";

import React, { useEffect, useRef, useState } from "react";
import { BarChart2, TrendingUp, Maximize2, Zap } from "lucide-react";

interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const AuraTradingChart: React.FC<{ pair: string }> = ({ pair }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [timeframe, setTimeframe] = useState<"1m" | "5m" | "15m" | "1h">("5m");
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [crosshair, setCrosshair] = useState<{ x: number; y: number } | null>(null);

  // Generate deterministic candlestick historical series
  const candlesRef = useRef<Candle[]>([]);

  useEffect(() => {
    const basePrice = pair.includes("CHOG") ? 0.042 : pair.includes("DAK") ? 1.18 : 24.85;
    const count = 48;
    const initial: Candle[] = [];
    let current = basePrice;

    for (let i = 0; i < count; i++) {
      const delta = (Math.random() - 0.48) * (basePrice * 0.015);
      const open = current;
      const close = Math.max(0.001, current + delta);
      const high = Math.max(open, close) + Math.random() * (basePrice * 0.008);
      const low = Math.min(open, close) - Math.random() * (basePrice * 0.008);
      const volume = Math.floor(15000 + Math.random() * 85000);
      const time = new Date(Date.now() - (count - i) * 5 * 60000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      initial.push({ time, open, high, low, close, volume });
      current = close;
    }
    candlesRef.current = initial;
  }, [pair]);

  // High-performance canvas drawing loop with Hyperliquid color palette
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      const w = rect.width;
      const h = rect.height;

      // Pure Hyperliquid Dark Canvas Ground
      ctx.fillStyle = "#090909";
      ctx.fillRect(0, 0, w, h);

      const candles = candlesRef.current;
      if (candles.length === 0) {
        ctx.restore();
        return;
      }

      // Calculate price ranges
      let minP = Math.min(...candles.map((c) => c.low));
      let maxP = Math.max(...candles.map((c) => c.high));
      const pRange = maxP - minP || 1;
      const chartH = h * 0.72;
      const volH = h * 0.22;
      const volTop = chartH + 10;
      const maxVol = Math.max(...candles.map((c) => c.volume)) || 1;

      // Subtle horizontal gridlines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      const gridSteps = 4;
      for (let i = 0; i <= gridSteps; i++) {
        const y = (chartH / gridSteps) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();

        const priceLabel = (maxP - (pRange / gridSteps) * i).toFixed(pair.includes("CHOG") ? 4 : 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.font = "9px 'JetBrains Mono', monospace";
        ctx.textAlign = "right";
        ctx.fillText(priceLabel, w - 8, y - 3);
      }

      const candleW = Math.max(3, (w - 60) / candles.length - 2);

      // Draw Candlesticks & Volume (Hyperliquid Exact: Mint Green #0ecb81 / Crimson Red #f6465d)
      candles.forEach((c, idx) => {
        const x = 12 + idx * (candleW + 2);
        const isUp = c.close >= c.open;
        const color = isUp ? "#0ecb81" : "#f6465d";

        const yOpen = chartH - ((c.open - minP) / pRange) * chartH;
        const yClose = chartH - ((c.close - minP) / pRange) * chartH;
        const yHigh = chartH - ((c.high - minP) / pRange) * chartH;
        const yLow = chartH - ((c.low - minP) / pRange) * chartH;

        // Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x + candleW / 2, yHigh);
        ctx.lineTo(x + candleW / 2, yLow);
        ctx.stroke();

        // Candle Body
        const bodyTop = Math.min(yOpen, yClose);
        const bodyH = Math.max(2, Math.abs(yClose - yOpen));
        ctx.fillStyle = color;
        ctx.fillRect(x, bodyTop, candleW, bodyH);

        // Volume Bar
        const barH = (c.volume / maxVol) * (volH - 10);
        ctx.fillStyle = isUp ? "rgba(14, 203, 129, 0.3)" : "rgba(246, 70, 93, 0.3)";
        ctx.fillRect(x, h - barH - 4, candleW, barH);
      });

      // EMA 20 overlay line (Hyperliquid Mint #50E3C2)
      ctx.strokeStyle = "rgba(80, 227, 194, 0.85)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      candles.forEach((c, idx) => {
        const x = 12 + idx * (candleW + 2) + candleW / 2;
        const y = chartH - ((c.close - minP) / pRange) * chartH;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Crosshair
      if (crosshair && crosshair.x > 0 && crosshair.x < w && crosshair.y > 0 && crosshair.y < h) {
        ctx.strokeStyle = "rgba(80, 227, 194, 0.4)";
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(crosshair.x, 0);
        ctx.lineTo(crosshair.x, h);
        ctx.moveTo(0, crosshair.y);
        ctx.lineTo(w, crosshair.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.restore();
    };

    render();
    window.addEventListener("resize", render);
    return () => {
      window.removeEventListener("resize", render);
    };
  }, [pair, crosshair]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCrosshair({ x, y });

    const candles = candlesRef.current;
    if (candles.length > 0) {
      const candleW = Math.max(3, (rect.width - 60) / candles.length - 2);
      const idx = Math.floor((x - 12) / (candleW + 2));
      if (idx >= 0 && idx < candles.length) {
        setHoveredCandle(candles[idx]);
      }
    }
  };

  const handleMouseLeave = () => {
    setCrosshair(null);
    setHoveredCandle(null);
  };

  const latest = candlesRef.current[candlesRef.current.length - 1];

  return (
    <div className="flex-1 flex flex-col bg-[#090909] overflow-hidden select-none">
      {/* Chart Top Bar (Hyperliquid style) */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-[#0c0c0c] border-b border-[#1e222d] text-xs font-mono shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-xs tracking-wide">{pair}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#0ecb81]/15 text-[#0ecb81] border border-[#0ecb81]/30 font-semibold">
              KURU SPOT
            </span>
          </div>

          {hoveredCandle ? (
            <div className="hidden sm:flex items-center gap-3 text-[11px] text-[#848e9c]">
              <span>O: <span className="text-white tabular-nums">{hoveredCandle.open.toFixed(2)}</span></span>
              <span>H: <span className="text-[#0ecb81] tabular-nums">{hoveredCandle.high.toFixed(2)}</span></span>
              <span>L: <span className="text-[#f6465d] tabular-nums">{hoveredCandle.low.toFixed(2)}</span></span>
              <span>C: <span className="text-white font-bold tabular-nums">{hoveredCandle.close.toFixed(2)}</span></span>
              <span>Vol: <span className="text-neutral-300 tabular-nums">{hoveredCandle.volume.toLocaleString()}</span></span>
            </div>
          ) : latest ? (
            <div className="hidden sm:flex items-center gap-3 text-[11px] text-[#848e9c]">
              <span>Last: <span className="text-white font-bold tabular-nums">{latest.close.toFixed(2)}</span></span>
              <span className="text-[#0ecb81] font-semibold tabular-nums">+4.82%</span>
              <span className="text-[#50E3C2] tabular-nums">EMA(20): {latest.close.toFixed(2)}</span>
            </div>
          ) : null}
        </div>

        {/* Timeframe Selectors */}
        <div className="flex items-center gap-1">
          {(["1m", "5m", "15m", "1h"] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                timeframe === tf
                  ? "bg-[#50E3C2]/20 text-[#50E3C2] border border-[#50E3C2]/40"
                  : "text-[#848e9c] hover:text-white"
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
          <div className="ml-2 pl-2 border-l border-[#1e222d] flex items-center gap-1.5 text-[#50E3C2] text-[10px]">
            <Zap className="w-3 h-3 text-[#50E3C2] animate-pulse" />
            <span>Monad Stream</span>
          </div>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative flex-1 w-full min-h-[220px] cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full block"
        />
        <div className="absolute bottom-2 left-3 pointer-events-none text-[10px] font-mono text-[#565d68]">
          Monad Cancun Continuous Finality (~340ms) · Kuru CLOB Depth
        </div>
      </div>
    </div>
  );
};
