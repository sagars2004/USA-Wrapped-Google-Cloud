"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES = [
  { key: 'height', label: 'Height', color: '#3b82f6' },
  { key: 'weight', label: 'Weight', color: '#ef4444' },
  { key: 'strength', label: 'Strength', color: '#8b5cf6' },
  { key: 'endurance', label: 'Endurance', color: '#10b981' },
  { key: 'agility', label: 'Agility', color: '#f59e0b' },
  { key: 'wingspan', label: 'Wingspan', color: '#06b6d4' },
];

const ARCHETYPES = [
  { name: 'The Iron Marathoner', weights: { height: 0.6, weight: 0.5, strength: 0.4, endurance: 0.9, agility: 0.6, wingspan: 0.5 } },
  { name: 'The Power Titan', weights: { height: 0.8, weight: 0.9, strength: 0.95, endurance: 0.4, agility: 0.3, wingspan: 0.8 } },
  { name: 'The Graceful Virtuoso', weights: { height: 0.5, weight: 0.4, strength: 0.3, endurance: 0.5, agility: 0.95, wingspan: 0.5 } },
  { name: 'The Wingspan Wonder', weights: { height: 0.85, weight: 0.6, strength: 0.5, endurance: 0.4, agility: 0.5, wingspan: 0.95 } },
];

function cosineSimilarity(a: Record<string, number>, b: Record<string, number>) {
  let dot = 0, magA = 0, magB = 0;
  for (const k of Object.keys(a)) {
    dot += (a[k] || 0) * (b[k] || 0);
    magA += (a[k] || 0) ** 2;
    magB += (b[k] || 0) ** 2;
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB) + 0.0001);
}

function getMatchedArchetype(values: Record<string, number>) {
  let best = ARCHETYPES[0];
  let bestScore = -1;
  for (const archetype of ARCHETYPES) {
    const score = cosineSimilarity(values, archetype.weights);
    if (score > bestScore) { bestScore = score; best = archetype; }
  }
  return { archetype: best, score: bestScore };
}

const SIZE = 240;
const RADIUS = 90;
const CX = SIZE / 2;
const CY = SIZE / 2;
const N = CATEGORIES.length;

function polarToXY(angle: number, r: number) {
  return {
    x: CX + r * Math.cos(angle - Math.PI / 2),
    y: CY + r * Math.sin(angle - Math.PI / 2),
  };
}

const RadarChart = () => {
  // Baseline (The "Average" or generated values)
  const [baselineValues] = useState<Record<string, number>>({
    height: 0.7,
    weight: 0.6,
    strength: 0.5,
    endurance: 0.8,
    agility: 0.6,
    wingspan: 0.75,
  });

  // User-modified values
  const [userValues, setUserValues] = useState<Record<string, number>>({ ...baselineValues });

  const [matchFlash, setMatchFlash] = useState(false);
  const prevMatch = React.useRef('');

  const { archetype: matched, score } = getMatchedArchetype(userValues);

  useEffect(() => {
    if (matched.name !== prevMatch.current) {
      prevMatch.current = matched.name;
      setMatchFlash(true);
      setTimeout(() => setMatchFlash(false), 800);
    }
  }, [matched.name]);

  const getPolyline = (vals: Record<string, number>) => {
    return CATEGORIES.map((cat, i) => {
      const angle = (2 * Math.PI * i) / N;
      const r = (vals[cat.key] || 0) * RADIUS;
      const p = polarToXY(angle, r);
      return `${p.x},${p.y}`;
    }).join(' ');
  };

  const baselinePoly = getPolyline(baselineValues);
  const userPoly = getPolyline(userValues);

  return (
    <div className="w-full h-full bg-white rounded-[2.5rem] p-8 flex flex-col text-gray-900 shadow-sm border border-gray-200/60 overflow-hidden">
      <div className="flex-shrink-0 mb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Archetype Profile</p>
        <AnimatePresence mode="wait">
          <motion.h3
            key={matched.name}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3 }}
            className={`text-2xl font-black tracking-tight transition-colors duration-300 ${matchFlash ? 'text-orange-500' : 'text-gray-900'}`}
          >
            {matched.name}
          </motion.h3>
        </AnimatePresence>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <motion.div
              className="h-1.5 rounded-full bg-orange-500"
              animate={{ width: `${score * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span className="text-[10px] text-gray-400 font-bold">{Math.round(score * 100)}% match</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 opacity-40" />
            <span>Gemini</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span>You</span>
          </div>
        </div>
        <AnimatePresence>
          {JSON.stringify(userValues) !== JSON.stringify(baselineValues) && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onClick={() => setUserValues({ ...baselineValues })}
              className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest flex items-center gap-1 transition-colors"
            >
              Reset Profile
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-shrink-0 flex justify-center py-4">
        <svg width={SIZE} height={SIZE} style={{ overflow: 'visible' }}>
          {/* Background rings */}
          {[0.25, 0.5, 0.75, 1.0].map((r, ri) => {
            const ringPts = CATEGORIES.map((_, i) => {
              const angle = (2 * Math.PI * i) / N;
              const p = polarToXY(angle, r * RADIUS);
              return `${p.x},${p.y}`;
            }).join(' ');
            return (
              <polygon
                key={ri}
                points={ringPts}
                fill="none"
                stroke="rgba(0,0,0,0.04)"
                strokeWidth={1}
              />
            );
          })}

          {/* Spokes */}
          {CATEGORIES.map((cat, i) => {
            const angle = (2 * Math.PI * i) / N;
            const outer = polarToXY(angle, RADIUS);
            return (
              <line key={cat.key} x1={CX} y1={CY} x2={outer.x} y2={outer.y}
                stroke="rgba(0,0,0,0.04)" strokeWidth={1} />
            );
          })}

          {/* Baseline Web (Semi-transparent Blue) */}
          <polygon
            points={baselinePoly}
            fill="rgba(59,130,246,0.15)"
            stroke="rgba(59,130,246,0.4)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />

          {/* User Web (Opaque Orange Stroke, Transparent Fill) */}
          <motion.polygon
            points={userPoly}
            fill="none"
            stroke="#f97316"
            strokeWidth={2.5}
            animate={{ points: userPoly }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          />

          {/* Category Labels */}
          {CATEGORIES.map((cat, i) => {
            const angle = (2 * Math.PI * i) / N;
            const labelPt = polarToXY(angle, RADIUS + 25);
            return (
              <text
                key={cat.key}
                x={labelPt.x}
                y={labelPt.y}
                textAnchor="middle"
                fontSize={10}
                fill="rgba(0,0,0,0.4)"
                fontWeight="black"
                className="uppercase tracking-widest"
              >
                {cat.label}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="flex-1 mt-8 space-y-6 overflow-y-auto min-h-0 pr-2">
        {CATEGORIES.map((cat) => (
          <div key={cat.key} className="flex items-center gap-4">
            <span className="text-[10px] font-black text-gray-400 w-20 flex-shrink-0 uppercase tracking-widest">{cat.label}</span>
            <div className="flex-1 relative">
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round((userValues[cat.key] || 0) * 100)}
                onChange={(e) => setUserValues(prev => ({ ...prev, [cat.key]: Number(e.target.value) / 100 }))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-orange-500"
                style={{
                  background: `linear-gradient(to right, #f97316 0%, #f97316 ${userValues[cat.key] * 100}%, rgba(0,0,0,0.05) ${userValues[cat.key] * 100}%, rgba(0,0,0,0.05) 100%)`
                }}
              />
            </div>
            <span className="text-[10px] font-black text-orange-500 w-8 text-right">{Math.round(userValues[cat.key] * 100)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export { RadarChart };
