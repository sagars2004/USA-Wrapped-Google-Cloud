"use client"

import React from 'react';
import { motion } from 'motion/react';

// Historical data points (Year, Count)
const HISTORICAL_DATA = [
  { year: 1896, count: 14 },
  { year: 1904, count: 526 }, // St. Louis
  { year: 1924, count: 299 },
  { year: 1932, count: 474 }, // LA
  { year: 1948, count: 300 },
  { year: 1960, count: 292 },
  { year: 1980, count: 0 }, // Boycott
  { year: 1984, count: 522 }, // LA
  { year: 1996, count: 646 }, // Atlanta
  { year: 2002, count: 202 }, // SLC
  { year: 2024, count: 592 },
  { year: 2026, count: 600 }, // Projected
];

const ParticipationTrend = ({ total }: { total: number }) => {
  const width = 400;
  const height = 140;
  const maxCount = Math.max(...HISTORICAL_DATA.map(d => d.count));
  
  // Create area path
  const points = HISTORICAL_DATA.map((d, i) => {
    const x = (i / (HISTORICAL_DATA.length - 1)) * width;
    const y = height - (d.count / maxCount) * height * 0.8;
    return `${x},${y}`;
  });

  const areaPath = `M 0,${height} ${points.join(' ')} L ${width},${height} Z`;
  const linePath = `M ${points.join(' ')}`;

  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Historical Participation</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-5xl font-black text-gray-900 leading-none tracking-tighter">
            {total.toLocaleString()}
          </h3>
          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+120 Years</span>
        </div>
      </div>

      <div className="flex-1 relative mt-6 min-h-[120px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          preserveAspectRatio="none"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.5, 1].map((p) => (
            <line
              key={p}
              x1="0" y1={p * height}
              x2={width} y2={p * height}
              stroke="rgba(0,0,0,0.03)"
              strokeWidth="1"
            />
          ))}

          {/* Area */}
          <motion.path
            d={areaPath}
            fill="url(#areaGradient)"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            style={{ transformOrigin: 'bottom' }}
          />

          {/* Line */}
          <motion.path
            d={linePath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />

          {/* Year Markers */}
          {HISTORICAL_DATA.filter((_, i) => i % 3 === 0).map((d, i) => {
            const x = (HISTORICAL_DATA.indexOf(d) / (HISTORICAL_DATA.length - 1)) * width;
            return (
              <text
                key={d.year}
                x={x}
                y={height + 15}
                textAnchor="middle"
                fontSize="10"
                fill="#9ca3af"
                fontWeight="bold"
              >
                {d.year}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="mt-8 pt-4 border-t border-gray-100">
        <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
          From the first <span className="text-gray-900 font-bold">14 athletes</span> in Athens 1896 to the projected <span className="text-gray-900 font-bold">600+</span> for the 2026 Winter Legacy.
        </p>
      </div>
    </div>
  );
};

export { ParticipationTrend };
