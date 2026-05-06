"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb, Info, AlertCircle, Quote } from 'lucide-react';

const TRIVIA = [
  {
    fact: "In the Olympic Games St. Louis 1904, the marathon winner actually hitched a ride in a car for 11 miles. He was disqualified, but the 'spirit of innovation' lived on!",
    tip: "Coach says: Your high Agility means you don't need a car. Just stick to the track!"
  },
  {
    fact: "The Olympic Games Los Angeles 1932 saw the first-ever 'Olympic Village.' Before that, athletes just stayed in local hotels or on boats!",
    tip: "Coach says: With your Strength, you'd have been the one helping move the furniture into the new village."
  },
  {
    fact: "At the Olympic Games Atlanta 1996, the youngest Team USA member was just 14 years old. Talent has no age limit!",
    tip: "Coach says: Your metrics suggest you're in your 'Golden Era' of potential. Stay hungry!"
  },
  {
    fact: "The Olympic Winter Games Lake Placid 1980 featured the 'Miracle on Ice,' where a group of college kids beat the world's best.",
    tip: "Coach says: Never underestimate a 'Balanced Contender.' Your stats are perfectly tuned for a miracle."
  }
];

export const CoachingCorner = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % TRIVIA.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full flex flex-col p-5 bg-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/5 blur-[60px] rounded-full" />
      <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-purple-500/5 blur-[50px] rounded-full" />

      <div className="flex items-center gap-2 mb-3 relative z-10">
        <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100 flex-shrink-0">
          <Lightbulb size={14} className="text-blue-600" />
        </div>
        <div>
          <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest leading-none">Coaching Corner</h3>
          <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">AI Legend Advice</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center relative z-10 min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            <div className="min-h-0">
              <div className="flex items-start gap-1.5 mb-1.5">
                <Info size={10} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-wider">Historical Insight</p>
              </div>
              <p className="text-[11px] font-bold leading-relaxed italic text-gray-600 line-clamp-3">
                "{TRIVIA[index].fact}"
              </p>
            </div>

            <div className="bg-gray-50/80 backdrop-blur-sm p-3 rounded-xl border border-gray-100">
              <div className="flex items-center gap-1.5 mb-1">
                <Quote size={10} className="text-blue-600" />
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">Coach's Response</p>
              </div>
              <p className="text-[11px] font-black leading-snug text-gray-900">
                {TRIVIA[index].tip}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-3 flex items-center gap-1">
        {TRIVIA.map((_, i) => (
          <div 
            key={i} 
            className={`h-1 rounded-full transition-all duration-500 ${i === index ? 'w-4 bg-blue-600' : 'w-1 bg-gray-200'}`}
          />
        ))}
      </div>
    </div>
  );
};
