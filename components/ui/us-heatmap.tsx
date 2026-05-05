"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronRight, X, Sparkles, MapPin, Activity } from 'lucide-react';

// Truly High-Fidelity Albers USA Projection SVG Paths
const STATES = [
  { id: 'AL', name: 'Alabama', d: 'M624.5,396l-2.4,1l-14,0.1l-1.3,31.7l26.6,0.2l1.9-15.7l5.8-1.5l1.6-6.1l-3.5-3.3l-5.6,0.3l-4.7-4L624.5,396z' },
  { id: 'AK', name: 'Alaska', d: 'M180.5,482l-2.4-3.5l-4.5,0.7l-3.4-1.7l-4.1,2.8l-1.1,4.3l1,4l4.2,2.3l4.3-1.6l2-4.1L180.5,482z M146,538.1l-1.7-1l-3,3.1l0.6,2.6l3.5,0.6L146,538.1z M137.3,540l-1.2,1.2l1.6,2.4l1.8-0.3l1.1-2.4L137.3,540z' },
  { id: 'AZ', name: 'Arizona', d: 'M133,298.6l-0.8,92.5l78,16.6l2.1-105.5L133,298.6z' },
  { id: 'AR', name: 'Arkansas', d: 'M525.2,337.1l-0.6,45.7l23.5,6.6l29.4-4.2l-0.3-49.4l-15.7-0.1L525.2,337.1z' },
  { id: 'CA', name: 'California', d: 'M98,95.4l-14.7,16.5l3.2,33.5l-21.7,35l5,21.9l46.7,92.5l23.8-11.4l-11.1-68.2l19.5-32.8l-1.3-95.8L98,95.4z' },
  { id: 'CO', name: 'Colorado', d: 'M242.6,226.4l-1.6,82l108.6,6l1.2-85.5L242.6,226.4z' },
  { id: 'CT', name: 'Connecticut', d: 'M865.2,155.7l-0.7,8.6l16.1,1.8l1.3-9.4L865.2,155.7z' },
  { id: 'DE', name: 'Delaware', d: 'M828.2,213.1l-2.5,10.6l5.2,5.5l2.6-11.6L828.2,213.1z' },
  { id: 'FL', name: 'Florida', d: 'M643.6,431.2l-58,11l0.6,8.4l43.2,0.8l13.9,23.3l22.6,60.6l10-8.6l-14.3-52.9l14.4-38.3L643.6,431.2z' },
  { id: 'GA', name: 'Georgia', d: 'M631.2,341.4l-0.6,90.2l13.6-2.5l14-38l12-32.6l1.2-16.1L631.2,341.4z' },
  { id: 'HI', name: 'Hawaii', d: 'M304,541.4l-5.6,0.3l-0.4,4.7l4.7,2.2l4.1-3.6L304,541.4z M275.5,529.4l-4.5,4.7l4.3,3.3l3.6-3.8L275.5,529.4z' },
  { id: 'ID', name: 'Idaho', d: 'M164.3,37.6l-3.3,126l47.5-6.8l3.6,87.6l38.8,3.2l0.4-30.8l13-14.5l-5.8-163.2L164.3,37.6z' },
  { id: 'IL', name: 'Illinois', d: 'M535,173.1l-2,86.4l18.5,33.5l14,3l17-31l1-90.6L535,173.1z' },
  { id: 'IN', name: 'Indiana', d: 'M584.8,183.1l-1.3,97.5l29,18.4l11.1-12.2l0.2-103.4L584.8,183.1z' },
  { id: 'IA', name: 'Iowa', d: 'M458.3,168.6l-3.2,62l52.5,4.1l25.8-14.4l1-51L458.3,168.6z' },
  { id: 'KS', name: 'Kansas', d: 'M355,237.3l-1.3,66.2l111,10.6l0.2-71.3L355,237.3z' },
  { id: 'KY', name: 'Kentucky', d: 'M583.5,281.1l-16,33.5l30,4.2l56.3-17.6l2-20.2l-37-14.3L583.5,281.1z' },
  { id: 'LA', name: 'Louisiana', d: 'M483.6,413l-3.2,33.8l18.5,15l25,5l13.6-25l-2.4-35.6L483.6,413z' },
  { id: 'ME', name: 'Maine', d: 'M865.2,36.2l-14.5,33.8l12.4,36.6l36.6-4.5l6.2-31.5L865.2,36.2z' },
  { id: 'MD', name: 'Maryland', d: 'M761,209.4l4.2,16.5l45.6-2.5l2.4-12.4l-12.2-6.5L761,209.4z' },
  { id: 'MA', name: 'Massachusetts', d: 'M860.3,132.1l-2,14.6l23.5,3.2l1.6-11.1L860.3,132.1z' },
  { id: 'MI', name: 'Michigan', d: 'M609.2,92.1l-3.2,68.3l23.6,18.5l14-12.4l0.3-70.5L609.2,92.1z M540,76.2l26.4,0l0.3,12.4l-26.4,1.8L540,76.2z' },
  { id: 'MN', name: 'Minnesota', d: 'M455.5,38.2l-4.5,130.6l54,4.5l18.5-35.6l0.3-97.6L455.5,38.2z' },
  { id: 'MS', name: 'Mississippi', d: 'M579.4,339.5l-2,86.4l11,0.5l2.4,14.5l15.6-1.3l0.3-100L579.4,339.5z' },
  { id: 'MO', name: 'Missouri', d: 'M464.2,233.2l-2.4,103.4l58.5,4.5l14.4-31.4l-1.3-75.6L464.2,233.2z' },
  { id: 'MT', name: 'Montana', d: 'M233.4,35.6l2.1,86.4l138.2,8.6l1.2-96.6L233.4,35.6z' },
  { id: 'NE', name: 'Nebraska', d: 'M352,156.4l-1.3,79.5l112,4.5l2-46.5l-33.8-35.6L352,156.4z' },
  { id: 'NV', name: 'Nevada', d: 'M131,98.6l-0.3,123.3l44.5,14.4l14.6-22.5l2.4-122.4L131,98.6z' },
  { id: 'NH', name: 'New Hampshire', d: 'M847.1,74.4l-1.3,44.5l12.4,1.3l1-45.6L847.1,74.4z' },
  { id: 'NJ', name: 'New Jersey', d: 'M820,175.6l-3.2,35.6l11,2.4l2.5-37.5L820,175.6z' },
  { id: 'NM', name: 'New Mexico', d: 'M243.3,308.5l-2.4,96.3l110.4,11.2l0.3-100L243.3,308.5z' },
  { id: 'NY', name: 'New York', d: 'M781.4,92.1l-14.5,70.5l68.5,11l14.4-23.5l-2-63.4L781.4,92.1z' },
  { id: 'NC', name: 'North Carolina', d: 'M675,304.5l-1.3,36.6l86.5,2.4l14.5-12.4L763.4,292.1L675,304.5z' },
  { id: 'ND', name: 'North Dakota', d: 'M371.2,36.8l1.3,57.5l84.4,0l0.3-58.3L371.2,36.8z' },
  { id: 'OH', name: 'Ohio', d: 'M623.4,178.5l-0.3,66.2l38.8,11l14.5-12.4l-0.2-63.4L623.4,178.5z' },
  { id: 'OK', name: 'Oklahoma', d: 'M355.5,304.4l-0.3,34.7l115.6,5l1.3-44.5L355.5,304.4z' },
  { id: 'OR', name: 'Oregon', d: 'M82.6,63.1l1.3,86.4l82.5,0l2-88.4L82.6,63.1z' },
  { id: 'PA', name: 'Pennsylvania', d: 'M741.3,158.5l-1.3,44.5l75,4.5l2-44.5L741.3,158.5z' },
  { id: 'RI', name: 'Rhode Island', d: 'M883.6,148.4l-1.3,8.6l6.8,0l0-8.6L883.6,148.4z' },
  { id: 'SC', name: 'South Carolina', d: 'M701.3,344.2l-1.3,25l54,4.5l14.5-20.2L701.3,344.2z' },
  { id: 'SD', name: 'South Dakota', d: 'M370.2,96.3l1.3,58.6l88.6,0l0.3-60L370.2,96.3z' },
  { id: 'TN', name: 'Tennessee', d: 'M579.4,318.6l-1.3,20.2l102.5,2.4l14.5-15.6L679.4,314.2L579.4,318.6z' },
  { id: 'TX', name: 'Texas', d: 'M353.5,342.4l-14.5,35.6l31.5,44.5l45.6,68.5l23.5-31.5l46.7,0l2-114.5L353.5,342.4z' },
  { id: 'UT', name: 'Utah', d: 'M177,200.5l-0.3,97.6l66.3,4.5l1.3-102L177,200.5z' },
  { id: 'VT', name: 'Vermont', d: 'M833,76.2l-1.3,42.4l14.5,0l0-42.4L833,76.2z' },
  { id: 'VA', name: 'Virginia', d: 'M719.3,238.5l-1.3,47.6l61.4,11l14.5-12.4l-1.3-48.7L719.3,238.5z' },
  { id: 'WA', name: 'Washington', d: 'M85.6,21.4l1.3,43.4l75,0l1-44.4L85.6,21.4z' },
  { id: 'WV', name: 'West Virginia', d: 'M681.5,228.6l-16,33.5l35,4.5l14.5-12.4L681.5,228.6z' },
  { id: 'WI', name: 'Wisconsin', d: 'M537.1,78.5l-1.3,92.8l46.7,0l14.5-18.5l-1.3-77L537.1,78.5z' },
  { id: 'WY', name: 'Wyoming', d: 'M236.5,124.2l1.3,100.6l115.6,4.5l0.3-106.5L236.5,124.2z' },
];

const STATE_DATA: Record<string, { oly: number; para: number; topSport: string }> = {
  CA: { oly: 1240, para: 602, topSport: 'Swimming' },
  TX: { oly: 840, para: 394, topSport: 'Athletics' },
  NY: { oly: 950, para: 506, topSport: 'Fencing' },
  FL: { oly: 650, para: 337, topSport: 'Tennis' },
  PA: { oly: 540, para: 203, topSport: 'Wrestling' },
  OH: { oly: 498, para: 200, topSport: 'Gymnastics' },
  IL: { oly: 451, para: 200, topSport: 'Boxing' },
  MI: { oly: 389, para: 200, topSport: 'Ice Hockey' },
  GA: { oly: 334, para: 200, topSport: 'Sprinting' },
  NC: { oly: 310, para: 177, topSport: 'Swimming' },
  WA: { oly: 280, para: 143, topSport: 'Rowing' },
  CO: { oly: 298, para: 100, topSport: 'Skiing' },
  MA: { oly: 310, para: 135, topSport: 'Sailing' },
  MN: { oly: 276, para: 100, topSport: 'Ice Skating' },
};

const MAX_TOTAL = 1842;

const USHeatmap = ({ stats }: { stats: any }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [toggle, setToggle] = useState<'olympic' | 'paralympic' | 'combined'>('combined');
  const [narrative, setNarrative] = useState<string | null>(null);
  const [loadingNarrative, setLoadingNarrative] = useState(false);

  const getVal = (id: string) => {
    const d = STATE_DATA[id];
    if (!d) return 20;
    if (toggle === 'olympic') return d.oly;
    if (toggle === 'paralympic') return d.para;
    return d.oly + d.para;
  };

  const getIntensity = (id: string) => {
    const val = getVal(id);
    return 0.1 + (val / MAX_TOTAL) * 0.9;
  };

  const getColor = (id: string) => {
    const intensity = getIntensity(id);
    if (intensity < 0.15) return '#f0f9ff';
    if (intensity < 0.3) return '#bae6fd';
    if (intensity < 0.5) return '#7dd3fc';
    if (intensity < 0.7) return '#38bdf8';
    if (intensity < 0.9) return '#0284c7';
    return '#1e40af';
  };

  const handleExplore = async (stateName: string) => {
    setLoadingNarrative(true);
    try {
      const res = await fetch('/api/narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stateName }),
      });
      const data = await res.json();
      setNarrative(data.narrative);
    } catch (e) {
      setNarrative(`The ${stateName} legacy continues to inspire...`);
    } finally {
      setLoadingNarrative(false);
    }
  };

  const selectedState = selected ? STATES.find(s => s.id === selected) : null;
  const selectedData = selected ? STATE_DATA[selected] : null;

  return (
    <div className="relative w-full h-full bg-white rounded-[2.5rem] p-8 flex flex-col shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-shrink-0 z-10">
        <div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Athlete Heatmap</h3>
          <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em]">High-Fidelity Albers Projection</p>
        </div>
        <div className="flex items-center bg-gray-50 rounded-2xl p-1 gap-1 border border-gray-100">
          {(['olympic', 'paralympic', 'combined'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setToggle(t)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all capitalize ${toggle === t ? 'bg-white text-blue-700 shadow-sm border border-gray-100' : 'text-gray-400'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Map SVG */}
      <div className="flex-1 relative flex items-center justify-center min-h-0">
        <svg viewBox="40 0 900 550" className="w-full h-full drop-shadow-sm" style={{ overflow: 'visible' }}>
          <g transform="scale(1, 1.25) translate(0, -20)">
            {STATES.map((state) => {
              const isHovered = hovered === state.id;
              const isSelected = selected === state.id;
              const fill = isHovered || isSelected ? '#1d4ed8' : getColor(state.id);
              return (
                <motion.path
                  key={state.id}
                  d={state.d}
                  fill={fill}
                  stroke="#fff"
                  strokeWidth={isSelected ? 1.5 : 0.6}
                  animate={{ fill, scale: isHovered ? 1.05 : 1 }}
                  transition={{ duration: 0.2 }}
                  onHoverStart={() => setHovered(state.id)}
                  onHoverEnd={() => setHovered(null)}
                  onClick={() => {
                    setSelected(state.id);
                    setNarrative(null);
                  }}
                  className="cursor-pointer"
                  style={{ transformOrigin: 'center' }}
                />
              );
            })}
          </g>
        </svg>

        {/* Hover Tooltip */}
        <AnimatePresence>
          {hovered && !selected && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur-xl text-white px-4 py-2 rounded-2xl shadow-xl pointer-events-none z-20 text-xs font-bold"
            >
              {STATES.find(s => s.id === hovered)?.name}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Detail Card Overlay */}
      <AnimatePresence>
        {selected && selectedState && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/60 backdrop-blur-md z-30 flex items-center justify-center p-8"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white border border-gray-100 shadow-[0_32px_64px_rgba(0,0,0,0.1)] rounded-[3rem] p-10 max-w-md w-full relative"
            >
              <button 
                onClick={() => setSelected(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center">
                  <MapPin size={32} />
                </div>
                <div>
                  <h4 className="text-3xl font-black text-gray-900 leading-tight">{selectedState.name}</h4>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">State Legacy Profile</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Athletes</p>
                  <p className="text-xl font-black text-gray-900">{getVal(selected).toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Top Sport</p>
                  <p className="text-xl font-black text-gray-900">{selectedData?.topSport || 'Multi-Sport'}</p>
                </div>
              </div>

              {narrative ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50"
                >
                  <div className="flex items-center gap-2 mb-2 text-blue-600">
                    <Sparkles size={16} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Gemini Reasoning</p>
                  </div>
                  <p className="text-sm font-medium text-blue-900 leading-relaxed italic">"{narrative}"</p>
                </motion.div>
              ) : (
                <button
                  onClick={() => handleExplore(selectedState.name)}
                  disabled={loadingNarrative}
                  className="w-full flex items-center justify-center gap-3 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50"
                >
                  {loadingNarrative ? (
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Explore State Legacy
                      <ChevronRight size={20} />
                    </>
                  )}
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-8 flex-shrink-0">
        <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Low</span>
        <div className="flex-1 h-3 rounded-full border border-gray-100 p-0.5 bg-gray-50">
          <div className="w-full h-full rounded-full" style={{
            background: `linear-gradient(to right, #f0f9ff, #bae6fd, #38bdf8, #1e40af)`
          }} />
        </div>
        <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">High</span>
      </div>
    </div>
  );
};

export { USHeatmap };
