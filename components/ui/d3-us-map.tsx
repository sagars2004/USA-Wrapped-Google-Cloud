"use client"

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Script from 'next/script';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Activity, Users, Trophy } from 'lucide-react';
import { STATE_DATA } from '@/constants/state-data';



// Define constants outside the component to prevent reference-based re-renders
const COLOR_RAMP = ['#dbeafe', '#93c5fd', '#3b82f6', '#2563eb', '#1e3a8a'];
const MAP_WIDTH = 960;
const MAP_HEIGHT = 600;

const D3USMap = ({ selected, onSelect }: { selected: string | null; onSelect: (name: string | null) => void }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<'both' | 'olympic' | 'para'>('both');
  const [tooltip, setTooltip] = useState<{ x: number, y: number, visible: boolean, content: any } | null>(null);
  const [scriptsLoaded, setScriptsLoaded] = useState(0);

  const handleScriptLoad = () => setScriptsLoaded(prev => prev + 1);

  useEffect(() => {
    if (scriptsLoaded < 2 || !svgRef.current) return;

    const d3 = (window as any).d3;
    const topojson = (window as any).topojson;

    if (!d3 || !topojson) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous only on core changes

    const projection = d3.geoAlbersUsa().scale(1070).translate([MAP_WIDTH / 2, MAP_HEIGHT / 2]);
    const path = d3.geoPath().projection(projection);

    // Fetch TopoJSON
    fetch("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json")
      .then(res => res.json())
      .then(us => {
        const states = topojson.feature(us, us.objects.states).features;

        // Domain calculation based on filter
        const counts = states.map((s: any) => {
          const data = STATE_DATA[s.properties.name] || { olympic: 15, para: 5 };
          if (filter === 'olympic') return data.olympic;
          if (filter === 'para') return data.para;
          return data.olympic + data.para;
        });
        
        const colorScale = d3.scaleQuantize()
          .domain([d3.min(counts), d3.max(counts)])
          .range(COLOR_RAMP);

        const g = svg.append("g");

        g.selectAll("path")
          .data(states)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("fill", (s: any) => {
            const data = STATE_DATA[s.properties.name] || { olympic: 15, para: 5 };
            const val = filter === 'olympic' ? data.olympic : (filter === 'para' ? data.para : data.olympic + data.para);
            return colorScale(val);
          })
          .attr("stroke", "#fff")
          .attr("stroke-width", 0.8)
          .attr("class", "state-path")
          .style("cursor", "pointer")
          .style("transition", "stroke 0.2s, stroke-width 0.2s")
          .on("mouseover", function(event: any, s: any) {
            const data = STATE_DATA[s.properties.name] || { olympic: 15, para: 5, sports: [] };
            d3.select(this)
              .attr("stroke", "#F59E0B")
              .attr("stroke-width", 2.5)
              .raise();
            
            setTooltip({
              x: event.clientX,
              y: event.clientY,
              visible: true,
              content: {
                name: s.properties.name,
                oly: data.olympic,
                para: data.para
              }
            });
          })
          .on("mousemove", (event: any) => {
            setTooltip(prev => prev ? { ...prev, x: event.clientX, y: event.clientY } : null);
          })
          .on("mouseout", function() {
            const isSelected = d3.select(this).attr("data-selected") === "true";
            if (!isSelected) {
              d3.select(this)
                .attr("stroke", "#fff")
                .attr("stroke-width", 0.8);
            }
            setTooltip(null);
          })
          .on("click", function(event: any, s: any) {
            const name = s.properties.name;
            onSelect(selected === name ? null : name);
          });
      });
  }, [scriptsLoaded, filter, selected]); // Added selected to handle state clicks correctly

  // Update selection styling
  useEffect(() => {
    if (!svgRef.current) return;
    const d3 = (window as any).d3;
    if (!d3) return;

    d3.select(svgRef.current).selectAll(".state-path")
      .attr("stroke", (s: any) => s.properties.name === selected ? "#F59E0B" : "#fff")
      .attr("stroke-width", (s: any) => s.properties.name === selected ? 2.5 : 0.8)
      .attr("data-selected", (s: any) => s.properties.name === selected ? "true" : "false")
      .attr("fill-opacity", (s: any) => s.properties.name === selected ? 0.9 : 1);
  }, [selected]);

  return (
    <div className="w-full h-full bg-white rounded-[2.5rem] p-8 flex flex-col shadow-sm border border-gray-100 overflow-hidden" ref={containerRef}>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js" onLoad={handleScriptLoad} />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js" onLoad={handleScriptLoad} />

      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Team USA Legacy</h3>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">D3 Albers Projection</p>
        </div>
        
        <div className="flex items-center bg-gray-50 rounded-xl p-1 gap-1 border border-gray-100 self-start md:self-center">
          {[
            { id: 'both', label: 'All' },
            { id: 'olympic', label: 'Oly' },
            { id: 'para', label: 'Para' }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id as any)}
              className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all ${filter === btn.id ? 'bg-white text-blue-700 shadow-sm border border-gray-100' : 'text-gray-400'}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map SVG */}
      <div className="flex-1 relative flex items-center justify-center min-h-0">
        <svg
          ref={svgRef}
          viewBox="0 0 960 600"
          className="w-full h-full drop-shadow-sm"
          style={{ background: 'transparent' }}
        />

        {/* Tooltip */}
        <AnimatePresence>
          {tooltip && tooltip.visible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed z-[100] bg-white border border-gray-200 p-2 rounded-lg shadow-xl pointer-events-none"
              style={{
                left: tooltip.x + 12,
                top: tooltip.y + 8,
                fontSize: '11px'
              }}
            >
              <p className="font-bold text-gray-900">{tooltip.content.name}</p>
              <p className="text-gray-500">{tooltip.content.oly} Oly · {tooltip.content.para} Para</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="flex flex-col items-center mt-4 gap-2">
        <div className="flex items-center gap-1">
          {COLOR_RAMP.map((color, i) => (
            <div key={i} className="w-8 h-2 first:rounded-l-full last:rounded-r-full" style={{ backgroundColor: color }} />
          ))}
        </div>
        <div className="flex justify-between w-40 text-[9px] font-black text-gray-400 uppercase tracking-widest">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
};

export { D3USMap };
