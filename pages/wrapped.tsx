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

export default function Wrapped() {
  const [stats, setStats] = useState<any>(null);
  const [archetype, setArchetype] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [userData, setUserData] = useState({ name: 'Guest', location: 'the US' });
  const chatRef = useRef<HTMLDivElement>(null);

  const scrollToChat = () => {
    chatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Focus the input if possible (optional)
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
        
        setUserData({ name, location });

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

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-gray-900 font-sans p-4 sm:p-8">
      <Head>
        <title>Your USA Wrapped</title>
      </Head>

      <main className="max-w-7xl mx-auto pt-6 pb-20">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium mb-8 transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Start
        </Link>

        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-gray-900 sm:text-7xl mb-2">USA Wrapped</h1>
            <p className="text-lg text-gray-500 font-medium max-w-xl">Your personalized dive into US-hosted Olympic history.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white rounded-2xl px-6 py-4 border border-gray-200/50 shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 mb-1">AI Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <p className="font-bold text-sm">Gemini 2.5 Pro Live</p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[minmax(320px,auto)] gap-6">
            
            {/* TILE 1: D3 US Heatmap — Now 50% width (col 1-2) */}
            <div className="col-span-1 md:col-span-2 min-h-[550px]">
              <D3USMap selected={selectedState} onSelect={setSelectedState} />
            </div>

            {/* TILE 2: Contextual Detail Tile — Now 50% width (col 3-4) */}
            <div className="col-span-1 md:col-span-2 min-h-[550px] bg-white rounded-[2.5rem] shadow-sm border border-gray-200/60 overflow-hidden relative">
              <AnimatePresence mode="wait">
                {!selectedState ? (
                  <motion.div
                    key="user-profile"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-10 h-full flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                          <Activity size={24} />
                        </div>
                        <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Personal Profile</span>
                      </div>
                      <h2 className="text-4xl font-black text-gray-900 leading-tight mb-4 tracking-tighter">
                        {archetype || 'Analyzing your potential...'}
                      </h2>
                      <p className="text-gray-500 font-medium leading-relaxed max-w-sm mb-8">
                        Based on your profile, we've identified your unique signature in American sports history.
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Your Data Points</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-400">Home State</p>
                          <p className="text-lg font-black text-gray-900">{userData.location}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-400">Identity</p>
                          <p className="text-lg font-black text-gray-900">{userData.name}</p>
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
                    className="p-10 h-full flex flex-col overflow-y-auto custom-scrollbar"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                          <MapPin size={24} />
                        </div>
                        <span className="text-xs font-black text-orange-500 uppercase tracking-widest">State Legacy</span>
                      </div>
                      <button 
                        onClick={() => setSelectedState(null)}
                        className="text-[10px] font-black text-gray-400 hover:text-gray-900 uppercase tracking-widest"
                      >
                        Reset to Me
                      </button>
                    </div>
                    <h2 className="text-5xl font-black text-gray-900 leading-tight mb-8 tracking-tighter">{selectedState}</h2>
                    
                    <div className="grid grid-cols-3 gap-3 mb-8">
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Olympic</p>
                        <p className="text-xl font-black text-gray-900">{STATE_DATA[selectedState]?.olympic || 15}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Para</p>
                        <p className="text-xl font-black text-gray-900">{STATE_DATA[selectedState]?.para || 5}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Top Sport</p>
                        <p className="text-xl font-black text-gray-900 truncate">{STATE_DATA[selectedState]?.sports[0]?.name || 'Swimming'}</p>
                      </div>
                    </div>

                    <button 
                      onClick={scrollToChat}
                      className="w-full mt-auto flex items-center justify-center gap-2 py-5 bg-gray-900 hover:bg-black text-white font-black rounded-2xl transition-all shadow-xl shadow-gray-200 group"
                    >
                      Learn More about {selectedState}
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* TILE 3: Interactive Radar — col 1-2, row 2-3 */}
            <div className="col-span-1 md:col-span-2 md:row-span-2 min-h-[660px]">
              <RadarChart />
            </div>

            {/* TILE 4: Total Athletes — col 3-4, row 2 */}
            <div className="col-span-1 md:col-span-2 min-h-[320px] bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-200/60 flex flex-col group hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-500">
              <ParticipationTrend total={stats?.totalRecords || 3636} />
            </div>

            {/* TILE 5: Gemini Chat — col 3-4, row 3, Now expanded */}
            <div 
              ref={chatRef}
              className="col-span-1 md:col-span-2 min-h-[500px] bg-white rounded-[2.5rem] shadow-sm border border-gray-200/60 relative overflow-hidden flex flex-col transition-all duration-500"
            >
              <div className="p-8 pb-4 flex-shrink-0">
                <div className="flex items-center gap-3 mb-1 text-gray-900">
                  <MessageSquare size={18} className="text-blue-600" />
                  <h3 className="text-lg font-black">Ask Gemini</h3>
                </div>
                <p className="text-gray-400 text-xs font-medium">Deep dive into any year, state, or athlete.</p>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 min-h-0">
                <AIChatInput />
              </div>
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 blur-[60px] rounded-full pointer-events-none" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
