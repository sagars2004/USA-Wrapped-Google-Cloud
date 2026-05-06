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
    <div className="h-full flex flex-col p-5">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest leading-none">Podium Distribution</h3>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Success Breakdown</p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {/* Medal Distribution */}
        <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-3 h-full flex flex-col justify-between overflow-hidden">
          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2 text-center">National Medal Tally</p>
          <div className="space-y-1.5 flex-1 flex flex-col justify-center">
            {medalData.map((m, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <div className={`w-7 h-7 ${m.color} rounded-xl flex items-center justify-center shadow-sm flex-shrink-0`}>
                  {React.cloneElement(m.icon as React.ReactElement<{ size?: number }>, { size: 14 })}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-[9px] font-black">
                    <span className="text-gray-500 uppercase tracking-tighter">{m.label}</span>
                    <span className="text-gray-900">{m.value}</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-0.5">
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
