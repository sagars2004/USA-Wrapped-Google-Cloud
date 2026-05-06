import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { GLSLHills } from '@/components/ui/glsl-hills';
import { MapPin, User, ChevronRight, Sparkles, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function LandingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [metrics, setMetrics] = useState({
    heightFeet: 5,
    heightInches: 10,
    weightLbs: 165,
    strength: 5,
    endurance: 5,
    agility: 5,
    wingspanInches: 70
  });

  const [isLocating, setIsLocating] = useState(false);

  const handleLocate = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await res.json();
          if (data.principalSubdivision) {
            setLocation(data.principalSubdivision);
          }
        } catch (err) {
          console.error("Location detection failed:", err);
        } finally {
          setIsLocating(false);
        }
      }, () => setIsLocating(false));
    } else {
      setIsLocating(false);
    }
  };

  const handleMetricChange = (id: string, value: string, min: number, max: number) => {
    let num = parseInt(value) || 0;
    if (num < min && value !== '') num = min;
    if (num > max) num = max;
    setMetrics({ ...metrics, [id]: num });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Set a session flag to allow access to the wrapped page
    sessionStorage.setItem('wrapped_access', 'true');
    
    // Convert to total inches for storage/passing
    const totalHeight = (metrics.heightFeet * 12) + metrics.heightInches;
    
    const params = new URLSearchParams({
      name,
      location,
      height: totalHeight.toString(),
      weight: metrics.weightLbs.toString(),
      strength: metrics.strength.toString(),
      endurance: metrics.endurance.toString(),
      agility: metrics.agility.toString(),
      wingspan: metrics.wingspanInches.toString()
    });
    
    setTimeout(() => {
      router.push(`/wrapped?${params.toString()}`);
    }, 1200);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white font-sans text-gray-900 flex items-center justify-center p-6 sm:p-12">
      <Head>
        <title>Welcome to USA Wrapped</title>
      </Head>

      <div className="absolute inset-0 z-0">
        <GLSLHills width="100vw" height="100vh" speed={0.4} />
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]" />
      </div>

      <main className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 mb-4 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-gray-400 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            <p className="text-[10px] font-black text-gray-900 uppercase tracking-[0.3em]">
              Built by Sagar Sahu
            </p>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-gray-900 mb-4 leading-none">
            USA <span className="text-blue-600">Wrapped</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 font-medium max-w-xl mx-auto leading-relaxed">
            Enter your details to generate your personalized athletic identity using Gemini API and Google Cloud.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl bg-white/70 backdrop-blur-3xl border border-white/80 shadow-2xl rounded-[2.5rem] p-8 sm:p-10"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Identity</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/80 border border-gray-100 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="Your Name"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Home State</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-white/80 border border-gray-100 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="e.g. California"
                  />
                  <button
                    type="button"
                    onClick={handleLocate}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-50 transition-colors ${isLocating ? 'animate-pulse text-blue-600' : 'text-gray-400'}`}
                    title="Find my state"
                  >
                    <Activity size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1 mb-4 block">Bio-Metric Profiles (US Units)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-8">
                {/* Height */}
                <div className="space-y-2 col-span-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Height</span>
                  <div className="flex gap-2">
                    <div className="flex-1 flex flex-col gap-1">
                      <span className="text-xs font-black text-blue-600">{metrics.heightFeet} ft</span>
                      <input
                        type="range"
                        min="4"
                        max="7"
                        value={metrics.heightFeet}
                        onChange={(e) => setMetrics({ ...metrics, heightFeet: parseInt(e.target.value) })}
                        className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <span className="text-xs font-black text-blue-600">{metrics.heightInches} in</span>
                      <input
                        type="range"
                        min="0"
                        max="11"
                        value={metrics.heightInches}
                        onChange={(e) => setMetrics({ ...metrics, heightInches: parseInt(e.target.value) })}
                        className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Weight */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Weight (lbs)</span>
                    <span className="text-xs font-black text-blue-600">{metrics.weightLbs}</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="350"
                    value={metrics.weightLbs}
                    onChange={(e) => setMetrics({ ...metrics, weightLbs: parseInt(e.target.value) })}
                    className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Wingspan */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Wingspan (in)</span>
                    <span className="text-xs font-black text-blue-600">{metrics.wingspanInches}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="90"
                    value={metrics.wingspanInches}
                    onChange={(e) => setMetrics({ ...metrics, wingspanInches: parseInt(e.target.value) })}
                    className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Attributes */}
                {[
                  { id: 'strength', label: 'Strength', min: 1, max: 10 },
                  { id: 'endurance', label: 'Endurance', min: 1, max: 10 },
                  { id: 'agility', label: 'Agility', min: 1, max: 10 },
                ].map((m) => (
                  <div key={m.id} className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{m.label}</span>
                      <span className="text-xs font-black text-blue-600">{(metrics as any)[m.id]}</span>
                    </div>
                    <input
                      type="range"
                      min={m.min}
                      max={m.max}
                      value={(metrics as any)[m.id]}
                      onChange={(e) => setMetrics({ ...metrics, [m.id]: parseInt(e.target.value) })}
                      className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !name || !location}
              className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white text-lg font-black rounded-xl transition-all shadow-xl shadow-blue-100 active:scale-[0.98] disabled:opacity-30"
            >
              {isSubmitting ? "Generating Insights..." : "Generate My Wrapped"}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
