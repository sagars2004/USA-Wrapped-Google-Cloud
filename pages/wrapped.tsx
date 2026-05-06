import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { GLSLHills } from '@/components/ui/glsl-hills';
import { AIChatInput } from '@/components/ui/ai-chat-input';
import { D3USMap } from '@/components/ui/d3-us-map';
import { RadarChart } from '@/components/ui/radar-chart';
import { ParticipationTrend } from '@/components/ui/participation-trend';
import { Activity, Users, ArrowLeft, MessageSquare, MapPin, Sparkles, ArrowRight, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { STATE_DATA } from '@/constants/state-data';
import { MedalDistribution } from '@/components/ui/medal-distribution';
import { CoachingCorner } from '@/components/ui/coaching-corner';

const STATE_ABBREVIATIONS: Record<string, string> = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
  'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
  'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
  'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
  'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
  'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
  'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
};

export default function Wrapped() {
  const [stats, setStats] = useState<any>(null);
  const [archetype, setArchetype] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>({ name: 'Guest', location: 'the US', metrics: {} });
  const chatRef = useRef<HTMLDivElement>(null);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  const scrollToChat = () => {
    chatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (selectedState) {
      setPendingPrompt(`Tell me about the Olympic legacy of ${selectedState}. Mention some specific athletes from our records.`);
      // Clear the prompt after a short delay so it can be re-triggered
      setTimeout(() => setPendingPrompt(null), 100);
    }
  };

  useEffect(() => {
    // Check if the user came from the landing page
    const hasAccess = sessionStorage.getItem('wrapped_access');
    if (!hasAccess) {
      window.location.href = '/';
      return;
    }

    // Use a timeout to clear the flag after the page has stabilized
    // This prevents the StrictMode double-mount from triggering an accidental redirect
    const timer = setTimeout(() => {
      sessionStorage.removeItem('wrapped_access');
    }, 1000);

    async function fetchData() {
      try {
        const statsRes = await fetch('/api/wrapped-stats');
        const statsData = await statsRes.json();
        setStats(statsData.summary);

        const params = new URLSearchParams(window.location.search);
        const name = params.get('name') || 'Guest';
        const location = params.get('location') || 'the US';
        
        const metrics = {
          height: parseInt(params.get('height') || '180'),
          weight: parseInt(params.get('weight') || '75'),
          strength: parseInt(params.get('strength') || '5'),
          endurance: parseInt(params.get('endurance') || '5'),
          agility: parseInt(params.get('agility') || '5'),
          wingspan: parseInt(params.get('wingspan') || '185')
        };
        
        setUserData({ name, location, metrics });

        const aiRes = await fetch('/api/generate-archetype', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            stats: statsData.summary,
            userName: name,
            userLocation: location,
            metrics
          }),
        });
        const aiData = await aiRes.json();
        setArchetype(aiData.archetype);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();

    // Ensure we start at the top on every mount
    window.scrollTo(0, 0);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-gray-900 font-sans p-4 sm:p-8">
      <Head>
        <title>Your USA Wrapped</title>
      </Head>

      <main className="max-w-7xl mx-auto pt-6 pb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium mb-8 transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Start
        </Link>

        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-gray-900 sm:text-7xl mb-2">USA Wrapped</h1>
            <p className="text-lg text-gray-500 font-medium max-w-xl">Your personalized dive into Team USA's legacy at US-hosted Games.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white rounded-2xl px-6 py-4 border border-gray-200/50 shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 mb-1">AI Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <p className="font-bold text-sm">Gemini Pro Live API</p>
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-blue-100 rounded-full" />
              <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-auto gap-6">
            
            {/* TILE 1: D3 US Heatmap — Reverted to full size */}
            <div className="col-span-1 md:col-span-2 md:row-span-2 h-[574px]">
              <D3USMap selected={selectedState} onSelect={setSelectedState} />
            </div>

            {/* TILE 2: Contextual Detail Tile — 50% height reduction & compacted whitespace */}
            <div className="col-span-1 md:col-span-2 h-[275px] bg-white rounded-[2.5rem] shadow-sm border border-gray-200/60 overflow-hidden relative">
              <AnimatePresence mode="wait">
                {!selectedState ? (
                  <motion.div
                    key="user-profile"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-8 h-full flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                          <Activity size={20} />
                        </div>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Personal Profile</span>
                      </div>
                    </div>

                    <div className="mt-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Team USA Potential</p>
                      <h2 className="text-3xl font-black text-gray-900 leading-none tracking-tighter">
                        {archetype || 'Analyzing...'}
                      </h2>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <div className="grid grid-cols-4 gap-x-4 gap-y-2">
                        <div className="space-y-0.5">
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Home</p>
                          <p className="text-xs font-black text-gray-900 truncate">
                            {STATE_ABBREVIATIONS[userData.location] || userData.location}
                          </p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Identity</p>
                          <p className="text-xs font-black text-gray-900 truncate">{userData.name}</p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Height</p>
                          <p className="text-xs font-black text-gray-900">{Math.floor(userData.metrics.height / 12)}'{userData.metrics.height % 12}"</p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Weight</p>
                          <p className="text-xs font-black text-gray-900">{userData.metrics.weight} lb</p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Strength</p>
                          <p className="text-xs font-black text-gray-900">{userData.metrics.strength}/10</p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Endurance</p>
                          <p className="text-xs font-black text-gray-900">{userData.metrics.endurance}/10</p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Agility</p>
                          <p className="text-xs font-black text-gray-900">{userData.metrics.agility}/10</p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Wingspan</p>
                          <p className="text-xs font-black text-gray-900">{userData.metrics.wingspan}"</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="state-legacy"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6 h-full flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-end">
                      <button 
                        onClick={() => setSelectedState(null)}
                        className="text-[9px] font-black text-gray-400 hover:text-gray-900 uppercase tracking-widest"
                      >
                        Reset
                      </button>
                    </div>

                    <h2 className="text-3xl font-black text-gray-900 leading-none tracking-tighter mt-1 mb-2">{selectedState}</h2>
                    
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="bg-gray-50/50 p-2 rounded-xl border border-gray-100 flex items-center justify-between px-3">
                        <p className="text-[9px] font-black text-gray-400 uppercase">Olympic Games</p>
                        <p className="text-sm font-black text-gray-900">{STATE_DATA[selectedState]?.olympic || 15}</p>
                      </div>
                      <div className="bg-gray-50/50 p-2 rounded-xl border border-gray-100 flex items-center justify-between px-3">
                        <p className="text-[9px] font-black text-gray-400 uppercase">Paralympic Games</p>
                        <p className="text-sm font-black text-gray-900">{STATE_DATA[selectedState]?.para || 5}</p>
                      </div>
                    </div>

                    <div className="flex-1 min-h-0 bg-gray-50/50 rounded-2xl border border-gray-100 p-4 overflow-hidden mb-2 flex flex-col justify-center">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Trophy size={12} className="text-orange-500" />
                        Top Sport Achievement
                      </p>
                      {STATE_DATA[selectedState]?.topSport ? (
                        <p className="text-sm font-bold text-gray-900 leading-snug">
                          <span className="text-orange-600 font-black">{STATE_DATA[selectedState]?.topSport}:</span>
                          <span className="ml-1 text-gray-600">
                            {STATE_DATA[selectedState]?.gold} gold, {STATE_DATA[selectedState]?.silver} silver, {STATE_DATA[selectedState]?.bronze} bronze
                          </span>
                        </p>
                      ) : (
                        <p className="text-xs font-bold text-gray-500 italic leading-snug">
                          Multi-disciplinary: more Team USA achievements to come.
                        </p>
                      )}
                    </div>

                    <button 
                      onClick={scrollToChat}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-gray-600 hover:bg-black text-white font-black rounded-xl transition-all shadow-lg shadow-gray-200 group text-[11px]"
                    >
                      Deep Research in {selectedState}
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* TILE 2b: Podium Distribution — Condensed */}
            <div className="col-span-1 md:col-span-1 h-[275px] bg-white rounded-[2.5rem] shadow-sm border border-gray-200/60 overflow-hidden hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-500">
              <MedalDistribution 
                medals={stats?.medalDistribution || { Gold: 0, Silver: 0, Bronze: 0, Participated: 0 }}
                seasons={stats?.seasonDistribution || { Summer: 0, Winter: 0 }}
              />
            </div>

            {/* TILE 2c: Coaching Corner — New slot */}
            <div className="col-span-1 md:col-span-1 h-[275px] bg-white rounded-[2.5rem] shadow-sm border border-gray-200/60 overflow-hidden hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-500">
              <CoachingCorner />
            </div>

            {/* TILE 3: Interactive Radar — Aligned with Chat bottom */}
            <div className="col-span-1 md:col-span-2 md:row-span-2 h-[820px]">
              <RadarChart />
            </div>

            {/* TILE 4: Participation Trend — Restored to full width */}
            <div className="col-span-1 md:col-span-2 h-[340px] bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-200/60 flex flex-col group hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-500">
              <ParticipationTrend total={stats?.totalRecords || 3636} />
            </div>

            {/* TILE 5: Gemini Chat — Aligned with Radar bottom */}
            <div 
              ref={chatRef}
              className="col-span-1 md:col-span-2 h-[456px] bg-white rounded-[2.5rem] shadow-sm border border-gray-200/60 relative overflow-hidden flex flex-col transition-all duration-500"
            >
              <div className="p-8 pb-4 flex-shrink-0">
                <div className="flex items-center gap-3 mb-1 text-gray-900">
                  <MessageSquare size={18} className="text-blue-600" />
                  <h3 className="text-lg font-black">Ask Gemini</h3>
                </div>
                <p className="text-gray-400 text-xs font-medium">Deep dive into any year, state, or athlete.</p>
              </div>
              <div className="flex-1 flex flex-col min-h-0">
                <AIChatInput context={{ selectedState }} externalPrompt={pendingPrompt} />
              </div>
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 blur-[60px] rounded-full pointer-events-none" />
            </div>
          </div>
        )}

        {/* FOOTER: Professional Credit */}
        <footer className="mt-4 pb-2 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-gray-200/60 pt-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-[12px] font-black text-gray-400 uppercase tracking-[0.3em]">
              &copy; 2026 Sagar Sahu &middot; All Rights Reserved
            </p>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              <p className="text-[14px] font-bold text-gray-900 tracking-tight">
                Built for the 2026 Team USA x Google Cloud Hackathon
              </p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end gap-0.5">
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Stack</p>
              <p className="text-[12px] font-black text-gray-900">Next.js &middot; Gemini Pro &middot; Vertex AI</p>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Cloud</p>
              <p className="text-[12px] font-black text-gray-900">Google Cloud Platform</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
