import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Activity, 
  BrainCircuit, 
  Clock, 
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Zap,
  Terminal
} from 'lucide-react';

export default function DashboardHome() {
  const navigate = useNavigate();
  const [inferenceSpeed, setInferenceSpeed] = useState(145);
  const [activeCluster, setActiveCluster] = useState("LPU-Alpha");

  // Simulated real-time performance log ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setInferenceSpeed(Math.floor(142 + Math.random() * 14));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const quickMetrics = [
    { title: "Heart Rate", value: "72 bpm", status: "Normal Baseline", color: "text-emerald-400 border-emerald-500/30", bg: "bg-emerald-500/10" },
    { title: "Sleep Analysis", value: "7h 45m", status: "Optimal Wave", color: "text-blue-400 border-blue-500/30", bg: "bg-blue-500/10" },
    { title: "Active Steps", value: "8,432", status: "84% Efficiency", color: "text-amber-400 border-amber-500/30", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans antialiased p-2">
      
      {/* 👋 WELCOME HERO BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl">
        <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none animate-pulse">
          <BrainCircuit className="h-64 w-64 text-sky-400" />
        </div>
        
        <div className="max-w-xl z-10 relative space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-sky-500/10 border border-sky-400/20 text-sky-400 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase">
            <Sparkles className="h-3 w-3 animate-spin" /> Neural Pipeline Operational
          </div>
          
          <h1 className="text-xl font-black tracking-tight sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
            Clinical AI Terminal Overview
          </h1>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Continuous local ingestion engine monitoring live bio-telemetry updates and structural compound analysis. Access the vision laboratory to initiate real-time multi-modal scans.
          </p>
          
          <div className="pt-2">
            <button
              onClick={() => navigate('/dashboard/ai')}
              className="inline-flex items-center gap-2 bg-white text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-md hover:bg-slate-100 transform active:scale-95 transition-all cursor-pointer"
            >
              Launch AI Vision Lab <ArrowRight className="h-3.5 w-3.5 stroke-[3]" />
            </button>
          </div>
        </div>
      </div>

      {/* 📊 METRICS SCORECARD GRID WITH SHIMMER PULSE ANIMATION */}
      <div className="grid gap-4 sm:grid-cols-3">
        {quickMetrics.map((metric, idx) => (
          <div 
            key={idx} 
            className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition"
          >
            {/* Underlying glowing edge line simulating pulse wave signals */}
            <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-slate-900 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-transparent via-sky-400 to-transparent w-1/2 absolute left-0 top-0 opacity-40 animate-pulse" style={{ animationDuration: '2s' }} />
            </div>

            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block">
                  {metric.title}
                </span>
                <span className="text-2xl font-black text-white block mt-1.5 font-mono tracking-tight">
                  {metric.value}
                </span>
              </div>
              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${metric.bg} ${metric.color}`}>
                {metric.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 🧬 MAIN CONTENT TWO-COLUMN SPLIT */}
      <div className="grid gap-6 md:grid-cols-3 items-start">
        
        {/* Left Columns: Recent Diagnostic Summary Logs */}
        <div className="md:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Bio-Telemetry Matrix Streams</h3>
                <p className="text-[10px] text-slate-400 font-medium">Verified chronological dataset logs.</p>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold rounded-md flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" /> Synchronized
            </span>
          </div>
          
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-slate-50/40">
            <div className="p-4 flex items-center justify-between text-xs font-medium hover:bg-slate-50/80 transition group cursor-pointer">
              <div className="flex items-center gap-3.5">
                <Clock className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition" />
                <div>
                  <p className="font-extrabold text-slate-800">Complete Blood Count (CBC) Panel</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">NODE GATEWAY // INGESTION_OK</p>
                </div>
              </div>
              <span className="text-slate-500 font-mono text-[10px] bg-white px-2 py-0.5 rounded-md border border-slate-200/60 shadow-2xs">2 hours ago</span>
            </div>
            
            <div className="p-4 flex items-center justify-between text-xs font-medium hover:bg-slate-50/80 transition group cursor-pointer">
              <div className="flex items-center gap-3.5">
                <Clock className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition" />
                <div>
                  <p className="font-extrabold text-slate-800">Cardio EKG Waveform Analysis</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">WAVE_FORM // HARMONIC_STABLE</p>
                </div>
              </div>
              <span className="text-slate-500 font-mono text-[10px] bg-white px-2 py-0.5 rounded-md border border-slate-200/60 shadow-2xs">Yesterday</span>
            </div>
          </div>
        </div>

        {/* Right Column: AI Model Security Banner Insights */}
        <div className="bg-slate-950 text-slate-100 rounded-2xl p-5 shadow-xl space-y-4 border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-purple-400" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Cluster Diagnostics</h3>
            </div>
            <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
          </div>

          <div className="space-y-3">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-500">Inference Core Velocity:</span>
              <span className="text-purple-400 font-bold tracking-tight">{inferenceSpeed} t/s</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">Active LPU Array Node</label>
              <div className="grid grid-cols-2 gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                {["LPU-Alpha", "LPU-Beta"].map((cluster) => (
                  <button
                    key={cluster}
                    onClick={() => setActiveCluster(cluster)}
                    className={`py-1 text-[10px] font-mono rounded transition cursor-pointer ${
                      activeCluster === cluster 
                        ? "bg-purple-600 text-white font-bold animate-none" 
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {cluster}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/80 flex gap-2.5 items-start text-[10px] text-slate-400 leading-normal">
            <ShieldAlert className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-200 font-bold block mb-0.5">Privacy Guardrails Active</span>
              Multi-modal compound processing layers are secured behind active client tokens passing vision filters.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}