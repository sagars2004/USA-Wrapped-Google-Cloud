"use client"

import React, { useState } from 'react';
import { motion } from 'motion/react';

const USChoropleth = ({ stats }: { stats: any }) => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  // Use fill hex codes for absolute reliability in SVG rendering
  const stateData = [
    { id: 'CA', name: 'California', sport: 'Swimming', count: 142, intensity: 0.9, x: 20, y: 50, w: 45, h: 80, color: '#22d3ee' },
    { id: 'TX', name: 'Texas', sport: 'Athletics', count: 89, intensity: 0.7, x: 100, y: 110, w: 70, h: 60, color: '#3b82f6' },
    { id: 'NY', name: 'New York', sport: 'Fencing', count: 45, intensity: 0.4, x: 240, y: 40, w: 30, h: 25, color: '#4f46e5' },
    { id: 'FL', name: 'Florida', sport: 'Tennis', count: 67, intensity: 0.6, x: 220, y: 140, w: 25, h: 45, color: '#a855f7' },
  ];

  return (
    <div className="relative w-full h-full bg-white rounded-[2.5rem] p-8 flex flex-col shadow-sm border border-gray-100 overflow-hidden group">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Regional Hubs</h3>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Olympic Footprint</p>
        </div>
        {hoveredState && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg"
          >
            {stateData.find(s => s.id === hoveredState)?.name}
          </motion.div>
        )}
      </div>

      <div className="flex-1 relative flex items-center justify-center">
        <svg viewBox="0 0 320 200" className="w-full h-auto max-h-[180px] drop-shadow-xl">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,0,0,0.02)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {stateData.map((state) => (
            <motion.rect
              key={state.id}
              x={state.x}
              y={state.y}
              width={state.w}
              height={state.h}
              rx={12}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                fill: hoveredState === state.id ? '#000' : state.color
              }}
              whileHover={{ y: state.y - 5, transition: { duration: 0.2 } }}
              onHoverStart={() => setHoveredState(state.id)}
              onHoverEnd={() => setHoveredState(null)}
              className="cursor-pointer transition-colors duration-300"
              style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
            />
          ))}
          
          <motion.path 
            d="M 65 90 L 100 110" 
            stroke="rgba(0,0,0,0.05)" 
            strokeWidth="2" 
            strokeDasharray="4 4"
            animate={{ strokeDashoffset: [0, 20] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          />
          <motion.path 
            d="M 170 110 L 220 140" 
            stroke="rgba(0,0,0,0.05)" 
            strokeWidth="2" 
            strokeDasharray="4 4"
            animate={{ strokeDashoffset: [0, -20] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          />
        </svg>
      </div>

      <div className="mt-6 flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {stateData.map((state) => (
          <motion.div 
            key={state.id} 
            whileHover={{ y: -2 }}
            className={`flex-shrink-0 rounded-2xl px-4 py-3 min-w-[100px] border transition-all ${
              hoveredState === state.id ? 'bg-gray-900 border-gray-900 text-white' : 'bg-gray-50 border-gray-100 text-gray-900'
            }`}
          >
            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${hoveredState === state.id ? 'text-gray-400' : 'text-gray-300'}`}>
              {state.id}
            </p>
            <p className="text-lg font-black leading-tight">{state.count}</p>
            <p className={`text-[9px] font-bold truncate ${hoveredState === state.id ? 'text-blue-400' : 'text-gray-400'}`}>
              {state.sport}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export { USChoropleth };
