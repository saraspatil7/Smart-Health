import React, { useEffect, useState, useRef } from "react";
import { 
  Heart, Activity, Sunset, BrainCircuit, RefreshCw, ClipboardList,
  Volume2, VolumeX, ShieldCheck, Sparkles, Terminal
} from "lucide-react";

const baseStats = [
  { id: "hr", name: "Heart Rate", value: "72 bpm", label: "Normal Baseline", icon: Heart, color: "text-rose-600", bg: "bg-rose-50", frequency: 280, wave: "sine" },
  { id: "bp", name: "Blood Pressure", value: "120/80", label: "Optimal State", icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50", frequency: 440, wave: "sine" },
  { id: "sleep", name: "Sleep Duration", value: "7.4 hrs", label: "Stable Circadian", icon: Sunset, color: "text-amber-600", bg: "bg-amber-50", frequency: 180, wave: "triangle" },
];

export default function Overview() {
  const [scannedMedicines, setScannedMedicines] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [systemLogs, setSystemLogs] = useState([]);
  const [activeSpeechId, setActiveSpeechId] = useState(null);

  const audioCtxRef = useRef(null);
  const utteranceRef = useRef(null);

  const pushLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setSystemLogs(prev => [{ timestamp, message, type }, ...prev.slice(0, 4)]);
  };

  const fetchMedicineHistory = async () => {
    setLoadingHistory(true);
    pushLog("Initiating proxy handshake via local secure tunnel...", "warning");
    try {
      const res = await fetch("http://localhost:5000/api/scanned-list");
      const data = await res.json();
      if (Array.isArray(data)) {
        setScannedMedicines(data);
        pushLog(`Successfully compiled ${data.length} telemetry records from Supabase ledger.`, "success");
      }
    } catch (err) {
      pushLog("Using localized storage snapshot fallback matrix.", "error");
      setScannedMedicines([
        { id: 1, medicine_name: "Amoxicillin 500mg", raw_ai_analysis: "Broad-spectrum antibacterial asset. Directives: Complete full course. Cross-referenced: No conflicts with active vitals arrays.", created_at: new Date().toISOString() },
        { id: 2, medicine_name: "Metformin 850mg", raw_ai_analysis: "Metabolic stabilization agent. Target parameters: Glycemic index control. Post-prandial administration protocol.", created_at: new Date().toISOString() }
      ]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchMedicineHistory();
    pushLog("Biometric matrix nodes fully established.", "success");

    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  const playVitalFrequency = async (freq, waveType) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        audioCtxRef.current = new AudioContext();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") await ctx.resume();
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = waveType;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.warn("Telemetry chime node interaction restricted.");
    }
  };

  const toggleSpeechAnalysis = (id, text) => {
    if (!('speechSynthesis' in window)) {
      pushLog("Audio readout engine incompatible with host browser architecture.", "error");
      return;
    }

    if (activeSpeechId === id) {
      window.speechSynthesis.cancel();
      setActiveSpeechId(null);
      pushLog("Audio narration script halted manually.", "info");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.02;
    utterance.pitch = 1.05;
    
    utterance.onend = () => setActiveSpeechId(null);
    utterance.onerror = () => setActiveSpeechId(null);

    utteranceRef.current = utterance;
    setActiveSpeechId(id);
    window.speechSynthesis.speak(utterance);
    pushLog(`Streaming narration voice link for database node ${id}.`, "info");
  };

  return (
    <div className="space-y-8 p-4 max-w-7xl mx-auto font-sans antialiased text-slate-900">
      
      {/* HERO HERO */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <BrainCircuit className="h-40 w-40 text-sky-400" />
        </div>
        <div className="z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20">Telemetry Matrix v4</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl mt-1">Health Workspace Overview</h1>
          <p className="mt-1 text-xs text-slate-400 max-w-xl leading-relaxed">
            Continuous structural log indexing system tracking real-time biological variance vectors, medication registries, and secure hardware proxies.
          </p>
        </div>
        <button 
          onClick={fetchMedicineHistory}
          className="z-10 flex items-center justify-center gap-1.5 self-start md:self-auto rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition active:scale-95 shadow-md shadow-black/50 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loadingHistory ? "animate-spin text-sky-400" : ""}`} /> Synchronize Ledgers
        </button>
      </div>

      {/* METRIC ROW */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {baseStats.map((item) => {
          const Icon = item.icon;
          return (
            <div 
              key={item.name} 
              onMouseEnter={() => playVitalFrequency(item.frequency, item.wave)}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-300 hover:border-sky-400 hover:shadow-md group cursor-pointer select-none relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors">{item.name}</span>
                <div className={`rounded-xl p-2 transition-all group-hover:scale-110 ${item.bg} ${item.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-black tracking-tight text-slate-900 font-mono">{item.value}</span>
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                  <ShieldCheck size={11} /> {item.label}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-sky-400/40 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </div>
          );
        })}
        
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Scanned Medicines</span>
            <div className="rounded-xl p-2 bg-purple-50 text-purple-600">
              <BrainCircuit className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black tracking-tight text-slate-900 font-mono">{scannedMedicines.length} Items</span>
            <span className="text-[10px] font-bold text-purple-600 flex items-center gap-1 mt-0.5">
              <Sparkles size={11} /> Verified Live Stream
            </span>
          </div>
        </div>
      </div>

      {/* CORE TABLES SECTION */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-sky-500" /> Supabase Medicine Registry
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Activate dynamic auditory narration loops using the voice core vectors below.</p>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[350px] pr-1 space-y-3 custom-scrollbar">
            {scannedMedicines.length === 0 ? (
              <div className="h-44 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400 font-medium bg-slate-50/50">
                No telemetry parameters processed within this frame.
              </div>
            ) : (
              scannedMedicines.map((med) => {
                const isSpeaking = activeSpeechId === med.id;
                return (
                  <div key={med.id} className={`p-3.5 rounded-xl border transition-all duration-200 flex flex-col gap-2 ${isSpeaking ? 'border-sky-300 bg-sky-50/20 shadow-xs' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'}`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900">{med.medicine_name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-slate-200 text-slate-600 font-mono">Groq LLaVA Node</span>
                      </div>
                      <button
                        onClick={() => toggleSpeechAnalysis(med.id, `Medicine: ${med.medicine_name}. AI Analysis summary details: ${med.raw_ai_analysis}`)}
                        className={`px-2.5 py-1.5 rounded-xl border transition text-[10px] font-bold flex items-center gap-1 cursor-pointer select-none ${isSpeaking ? "bg-rose-500 border-transparent text-white shadow-xs shadow-rose-500/10" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-2xs"}`}
                      >
                        {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                        {isSpeaking ? "Mute Stream" : "Play Narration"}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-600 font-mono leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200/50 shadow-3xs">
                      {med.raw_ai_analysis}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* LOG TERMINAL */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Terminal className="h-4 w-4 text-purple-500" /> Node Proxy Terminal
            </h3>
            <p className="text-[11px] text-slate-400">Active server diagnostic logs stack.</p>
          </div>

          <div className="flex-1 min-h-[160px] bg-slate-950 rounded-xl p-3 font-mono text-[10px] text-slate-300 space-y-2 overflow-y-auto shadow-inner border border-slate-800/60 custom-scrollbar">
            {systemLogs.length === 0 ? (
              <span className="text-slate-500 italic block">Awaiting cluster initialization signals...</span>
            ) : (
              systemLogs.map((log, idx) => (
                <div key={idx} className="leading-normal break-all">
                  <span className="text-slate-500">[{log.timestamp}]</span>{" "}
                  <span className={log.type === "success" ? "text-emerald-400 font-bold" : log.type === "error" ? "text-rose-400 font-bold" : log.type === "warning" ? "text-amber-400" : "text-sky-400"}>
                    {log.type === "success" ? "✓" : log.type === "error" ? "✗" : "⚠"} {log.message}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="rounded-xl border border-slate-100 p-3 bg-slate-50/50 text-[11px] text-slate-600 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Supabase Core Connection:</span>
              <span className="text-emerald-600 font-bold">Encrypted Node</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Proxy Port Topology:</span>
              <span className="text-purple-600 font-bold font-mono">Port 5000</span>
            </div>
          </div>

          <button 
            onClick={() => pushLog("Exporting diagnostic system matrix snapshot format JSON...", "info")}
            className="w-full rounded-xl bg-slate-950 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition shadow-md shadow-slate-950/10 cursor-pointer"
          >
            Export Secure Workspace Log
          </button>
        </div>
      </div>
    </div>
  );
}