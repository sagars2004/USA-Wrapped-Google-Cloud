"use client"

import React from 'react';
import { motion } from 'motion/react';
import { Sun, Snowflake, Trophy, Award, Medal, Users } from 'lucide-react';

interface MedalDistributionProps {
  medals: {
    Gold: number;
    Silver: number;
    Bronze: number;
    Participated: number;
  };
  seasons: {
    Summer: number;
    Winter: number;
  };
}

export const MedalDistribution = ({ medals, seasons }: MedalDistributionProps) => {
  const totalMedals = medals.Gold + medals.Silver + medals.Bronze + medals.Participated;
  const totalSeasons = seasons.Summer + seasons.Winter;

  const medalData = [
    { label: 'Gold', value: medals.Gold, color: 'bg-yellow-400', icon: <Trophy size={14} className="text-yellow-600" /> },
    { label: 'Silver', value: medals.Silver, color: 'bg-gray-300', icon: <Award size={14} className="text-gray-500" /> },
    { label: 'Bronze', value: medals.Bronze, color: 'bg-orange-300', icon: <Medal size={14} className="text-orange-700" /> },
    { label: 'Challengers', value: medals.Participated, color: 'bg-blue-100', icon: <Users size={14} className="text-blue-500" /> },
  ];

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Global Success Profile</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Historical Dataset Breakdown</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Season Balance */}
        <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-4 flex flex-col justify-center">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Season Split</p>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-[10px] font-black mb-1">
                <span className="flex items-center gap-1"><Sun size={10} className="text-orange-500" /> SUMMER</span>
                <span className="text-gray-900">{Math.round((seasons.Summer / totalSeasons) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(seasons.Summer / totalSeasons) * 100}%` }}
                  className="h-full bg-orange-500 rounded-full"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-[10px] font-black mb-1">
                <span className="flex items-center gap-1"><Snowflake size={10} className="text-blue-400" /> WINTER</span>
                <span className="text-gray-900">{Math.round((seasons.Winter / totalSeasons) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(seasons.Winter / totalSeasons) * 100}%` }}
                  className="h-full bg-blue-500 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Medal Distribution */}
        <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-4 flex flex-col justify-between overflow-hidden">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Medal Podium</p>
          <div className="space-y-2">
            {medalData.map((m, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className={`w-6 h-6 ${m.color} rounded-lg flex items-center justify-center`}>
                  {m.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-[9px] font-black">
                    <span className="text-gray-500 uppercase tracking-tighter">{m.label}</span>
                    <span className="text-gray-900">{m.value}</span>
                  </div>
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden mt-0.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(m.value / totalMedals) * 100}%` }}
                      className={`h-full ${m.color}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
