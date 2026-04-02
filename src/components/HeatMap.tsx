"use client";

import { useState, useMemo } from "react";
import { Article } from "@/types";
import { extractGeoData, GeoPoint } from "@/lib/geo";
import { WORLD_PATHS } from "@/lib/world-paths";
import { Globe, X } from "lucide-react";

interface HeatMapProps {
  articles: Article[];
}

// Convert lat/lng to SVG Mercator projection coordinates
function project(
  lat: number,
  lng: number,
  width: number,
  height: number
): { x: number; y: number } {
  const x = ((lng + 180) / 360) * width;
  // Mercator projection with clamping
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = height / 2 - (mercN / Math.PI) * (height / 2);
  return { x, y };
}

function HeatDot({
  point,
  maxCount,
  width,
  height,
}: {
  point: GeoPoint;
  maxCount: number;
  width: number;
  height: number;
}) {
  const [hover, setHover] = useState(false);
  const { x, y } = project(point.lat, point.lng, width, height);
  const intensity = Math.min(point.count / maxCount, 1);
  const radius = 4 + intensity * 12;

  // Color from yellow (low) to red (high)
  const r = 255;
  const g = Math.round(200 * (1 - intensity));
  const b = 0;
  const color = `rgb(${r}, ${g}, ${b})`;

  return (
    <g>
      {/* Glow */}
      <circle
        cx={x}
        cy={y}
        r={radius * 2}
        fill={color}
        opacity={0.1 + intensity * 0.15}
      />
      {/* Main dot */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={color}
        opacity={0.6 + intensity * 0.4}
        stroke={color}
        strokeWidth={1}
        strokeOpacity={0.3}
        className="cursor-pointer transition-all duration-200"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      />
      {/* Pulse animation for hot spots */}
      {intensity > 0.5 && (
        <circle
          cx={x}
          cy={y}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          opacity={0.5}
        >
          <animate
            attributeName="r"
            from={String(radius)}
            to={String(radius * 2.5)}
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            from="0.5"
            to="0"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      )}
      {/* Count label */}
      <text
        x={x}
        y={y + 1}
        textAnchor="middle"
        dominantBaseline="central"
        className="text-[8px] font-bold fill-white pointer-events-none select-none"
      >
        {point.count}
      </text>
      {/* Tooltip */}
      {hover && (
        <g>
          <rect
            x={x + 12}
            y={y - 40}
            width={Math.max(point.country.length * 7, 130)}
            height={20 + point.articles.slice(0, 3).length * 12}
            rx={4}
            fill="#18181b"
            stroke="#3f3f46"
            strokeWidth={1}
          />
          <text
            x={x + 18}
            y={y - 25}
            className="text-[10px] font-bold fill-emerald-400"
          >
            {point.country} ({point.count})
          </text>
          {point.articles.slice(0, 3).map((a, i) => (
            <text
              key={i}
              x={x + 18}
              y={y - 13 + i * 12}
              className="text-[8px] fill-zinc-400"
            >
              {a.title.substring(0, 35)}...
            </text>
          ))}
        </g>
      )}
    </g>
  );
}

export default function HeatMap({ articles }: HeatMapProps) {
  const [open, setOpen] = useState(false);
  const geoData = useMemo(() => extractGeoData(articles), [articles]);
  const maxCount = Math.max(...geoData.map((p) => p.count), 1);

  const WIDTH = 800;
  const HEIGHT = 420;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 transition-colors text-xs text-zinc-500"
      >
        <Globe className="w-3.5 h-3.5" />
        <span className="font-mono">Heatmap</span>
        {geoData.length > 0 && (
          <span className="bg-blue-500/20 text-blue-400 text-[9px] font-bold px-1 py-0.5 rounded">
            {geoData.length}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-bold text-zinc-100">
                  HEATMAP GÉOGRAPHIQUE
                </h2>
                <span className="text-[10px] text-zinc-600 font-mono">
                  {geoData.length} ZONES ACTIVES
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Map */}
            <div className="p-4">
              <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                className="w-full bg-zinc-950 rounded border border-zinc-800"
              >
                {/* Continent outlines */}
                {WORLD_PATHS.map((d, i) => (
                  <path
                    key={i}
                    d={d}
                    fill="#1a1a2e"
                    stroke="#2a2a3e"
                    strokeWidth={0.8}
                  />
                ))}

                {/* Grid lines (subtle, over continents) */}
                {Array.from({ length: 7 }, (_, i) => {
                  const y = (i * HEIGHT) / 6;
                  return (
                    <line
                      key={`h${i}`}
                      x1={0}
                      y1={y}
                      x2={WIDTH}
                      y2={y}
                      stroke="#27272a"
                      strokeWidth={0.3}
                      strokeOpacity={0.5}
                    />
                  );
                })}
                {Array.from({ length: 13 }, (_, i) => {
                  const x = (i * WIDTH) / 12;
                  return (
                    <line
                      key={`v${i}`}
                      x1={x}
                      y1={0}
                      x2={x}
                      y2={HEIGHT}
                      stroke="#27272a"
                      strokeWidth={0.3}
                      strokeOpacity={0.5}
                    />
                  );
                })}

                {/* Equator */}
                <line
                  x1={0}
                  y1={HEIGHT / 2}
                  x2={WIDTH}
                  y2={HEIGHT / 2}
                  stroke="#3f3f46"
                  strokeWidth={0.5}
                  strokeDasharray="4 4"
                />

                {/* Data points */}
                {geoData.map((point) => (
                  <HeatDot
                    key={point.code}
                    point={point}
                    maxCount={maxCount}
                    width={WIDTH}
                    height={HEIGHT}
                  />
                ))}
              </svg>
            </div>

            {/* Legend / Rankings */}
            <div className="px-4 pb-3 flex items-center gap-4 flex-wrap">
              {geoData.slice(0, 8).map((point) => (
                <div
                  key={point.code}
                  className="flex items-center gap-1.5 text-[10px] font-mono"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: `rgb(255, ${Math.round(200 * (1 - point.count / maxCount))}, 0)`,
                    }}
                  />
                  <span className="text-zinc-400">{point.country}</span>
                  <span className="text-zinc-600">{point.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
