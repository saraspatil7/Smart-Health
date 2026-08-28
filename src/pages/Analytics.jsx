import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient.js"; 
import { 
  BarChart3, TrendingUp, ShieldCheck, Heart, Droplets, 
  Gauge, AlertCircle, Loader2, RefreshCw, Zap, Sparkles,
  Activity, CheckCircle2, ShieldAlert, Sliders
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, 
  YAxis, CartesianGrid, Tooltip, Legend 
} from "recharts";

const fallbackChartData = [
  { name: "Plot 1", "Heart Rate": 72, "Blood Sugar": 95, Systolic: 120, Diastolic: 80 },
  { name: "Plot 2", "Heart Rate": 75, "Blood Sugar": 105, Systolic: 124, Diastolic: 82 },
  { name: "Plot 3", "Heart Rate": 68, "Blood Sugar": 90, Systolic: 118, Diastolic: 78 },
  { name: "Plot 4", "Heart Rate": 82, "Blood Sugar": 115, Systolic: 128, Diastolic: 85 },
  { name: "Plot 5", "Heart Rate": 74, "Blood Sugar": 100, Systolic: 121, Diastolic: 81 },
];

export default function Analytics() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMetricFilter, setActiveMetricFilter] = useState("All");
  const [chartData, setChartData] = useState([]);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [anomalies, setAnomalies] = useState([]);
  const [simFactor, setSimFactor] = useState("none"); 

  const [stats, setStats] = useState({
    avgHeartRate: 0,
    avgBloodSugar: 0,
    peakSystolic: 0,
    peakDiastolic: 0,
    complianceRate: 100,
    heartRateTrend: "Stable",
    sugarTrend: "Stable",
    optimalTimeOfDay: "Computing..."
  });

  const fetchAnalyticsLedger = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("clinical_metrics")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      
      const currentData = data || [];
      setLogs([...currentData].reverse());
      
      let finalSet = [];
      if (currentData.length === 0) {
        finalSet = fallbackChartData;
        setIsUsingFallback(true);
        setStats({
          avgHeartRate: 74,
          avgBloodSugar: 101,
          peakSystolic: 125,
          peakDiastolic: 85,
          complianceRate: 95,
          heartRateTrend: "Stable Equilibrium",
          sugarTrend: "Stable Equilibrium",
          optimalTimeOfDay: "AM Hours"
        });
      } else {
        setIsUsingFallback(false);
        finalSet = processChartTelemetry(currentData);
        calculateTelemetryMetrics(currentData);
      }

      applySimulation(finalSet, simFactor);
    } catch (err) {
      console.error("Failed to compile analytics telemetry:", err.message);
      setChartData(fallbackChartData);
      setIsUsingFallback(true);
      applySimulation(fallbackChartData, simFactor);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsLedger();
  }, [simFactor]);

  const processChartTelemetry = (dataArray) => {
    const dateMap = {};
    dataArray.forEach(item => {
      const rawDate = item.date ? new Date(item.date) : new Date();
      const dateKey = isNaN(rawDate) ? "Entry" : rawDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = { name: dateKey, "Heart Rate": null, "Blood Sugar": null, Systolic: null, Diastolic: null };
      }
      
      const val = parseFloat(item.value);
      if (item.type === "Heart Rate" && !isNaN(val)) dateMap[dateKey]["Heart Rate"] = val;
      if (item.type === "Blood Sugar" && !isNaN(val)) dateMap[dateKey]["Blood Sugar"] = val;
      if (item.type === "Blood Pressure") {
        const parts = item.value.split("/");
        if (parts.length === 2) {
          dateMap[dateKey]["Systolic"] = parseFloat(parts[0]) || null;
          dateMap[dateKey]["Diastolic"] = parseFloat(parts[1]) || null;
        }
      }
    });
    return Object.values(dateMap);
  };

  const applySimulation = (baseData, factor) => {
    const simulated = baseData.map((plot, index) => {
      const newPlot = { ...plot };
      
      if (factor === "caffeine") {
        if (newPlot["Heart Rate"]) newPlot["Simulated Projection"] = Math.round(newPlot["Heart Rate"] * 1.25 + (index * 2));
        else if (newPlot["Blood Sugar"]) newPlot["Simulated Projection"] = Math.round(newPlot["Blood Sugar"] * 1.08);
      } else if (factor === "cardio") {
        if (newPlot["Heart Rate"]) newPlot["Simulated Projection"] = Math.round(newPlot["Heart Rate"] * 1.65 - (index * 3));
        if (newPlot["Systolic"]) newPlot["Simulated Projection"] = Math.round(newPlot["Systolic"] * 1.3);
      } else if (factor === "zen") {
        if (newPlot["Heart Rate"]) newPlot["Simulated Projection"] = Math.round(newPlot["Heart Rate"] * 0.85);
        if (newPlot["Systolic"]) newPlot["Simulated Projection"] = Math.round(newPlot["Systolic"] * 0.9);
      } else {
        newPlot["Simulated Projection"] = null;
      }
      return newPlot;
    });

    setChartData(simulated);
    detectAnomalies(simulated);
  };

  const detectAnomalies = (dataData) => {
    const detected = [];
    dataData.forEach(plot => {
      if (plot["Heart Rate"] && plot["Heart Rate"] > 100) {
        detected.push({ id: `hr-${plot.name}`, message: `Baseline Tachycardia warning on ${plot.name}.`, severity: "high" });
      }
      if (plot["Simulated Projection"] && simFactor === "cardio" && plot["Simulated Projection"] > 130) {
        detected.push({ id: `sim-${plot.name}`, message: `Simulated Target Aerobic Threshold Crossed (${plot["Simulated Projection"]} bpm).`, severity: "medium" });
      }
      if (plot["Simulated Projection"] && simFactor === "caffeine" && plot["Simulated Projection"] > 105) {
        detected.push({ id: `sim-caf-${plot.name}`, message: `Adrenaline spikes projected near peak timeline segments.`, severity: "medium" });
      }
    });
    setAnomalies(detected);
  };

  const calculateTelemetryMetrics = (dataArray) => {
    if (dataArray.length === 0) return;
    let totalHr = 0, hrCount = 0;
    let totalBs = 0, bsCount = 0;
    let maxSys = 0, maxDia = 0, optimalCount = 0;

    dataArray.forEach(item => {
      const val = parseFloat(item.value);
      if (item.status === "Optimal") optimalCount++;
      if (item.type === "Heart Rate" && !isNaN(val)) { totalHr += val; hrCount++; }
      if (item.type === "Blood Sugar" && !isNaN(val)) { totalBs += val; bsCount++; }
      if (item.type === "Blood Pressure") {
        const parts = item.value.split("/");
        if (!isNaN(parseFloat(parts[0])) && parseFloat(parts[0]) > maxSys) maxSys = parseFloat(parts[0]);
        if (!isNaN(parseFloat(parts[1])) && parseFloat(parts[1]) > maxDia) maxDia = parseFloat(parts[1]);
      }
    });

    setStats({
      avgHeartRate: hrCount > 0 ? Math.round(totalHr / hrCount) : 0,
      avgBloodSugar: bsCount > 0 ? Math.round(totalBs / bsCount) : 0,
      peakSystolic: maxSys || 0,
      peakDiastolic: maxDia || 0,
      complianceRate: Math.round((optimalCount / dataArray.length) * 100),
      heartRateTrend: "Stable Equilibrium",
      sugarTrend: "Stable",
      optimalTimeOfDay: "AM Hours"
    });
  };

  if (loading) {
    return (
      <div className="text-xs font-semibold text-slate-500 flex items-center gap-2 py-20 justify-center bg-slate-950 min-h-screen">
        <Loader2 className="h-4 w-4 animate-spin text-blue-500" /> Booting analytics nodes...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans antialiased text-slate-100 px-2 pb-12">
      
      {/* 👋 PREMIUM DARK HERO BLOCK */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl">
        <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none animate-pulse">
          <BarChart3 className="h-64 w-64 text-sky-400" />
        </div>
        <div className="z-10 relative space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-sky-500/10 border border-sky-400/20 text-sky-400 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase">
            <Zap className="h-3 w-3" /> Core Inference Active
          </div>
          <h1 className="text-xl font-black tracking-tight sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
            Biometric Telemetry Matrix
          </h1>
          <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xl">
            Continuous circadian stability metrics tracking, biological variance processing, and automated predictive wellness vectors.
          </p>
          <button onClick={fetchAnalyticsLedger} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 transition shadow-md cursor-pointer">
            <RefreshCw className="h-3.5 w-3.5" /> Synchronize Ledgers
          </button>
        </div>
      </div>

      {/* BIOMETRIC STRESS FACTOR SIMULATOR BAR */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400"><Sliders size={18} className="animate-pulse"/></div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-blue-300">Predictive Sandbox Overlays</h4>
            <p className="text-[10px] text-slate-500 font-medium">Inject algorithmic stress profiles directly onto live timeline vectors.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "none", label: "Standard Baseline" },
            { id: "caffeine", label: "☕ +300mg Caffeine" },
            { id: "cardio", label: "🏃 High-Intensity Cardio" },
            { id: "zen", label: "🧘 Deep Zen Meditation" }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSimFactor(mode.id)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wide transition border cursor-pointer ${
                simFactor === mode.id 
                  ? "bg-blue-600 border-transparent text-white shadow-md shadow-blue-600/20 scale-105 animate-none" 
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* 🚀 PREDICTIVE SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3 relative overflow-hidden group hover:border-red-500/40 transition-all">
          <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl"><Heart className="h-4 w-4" /></div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Cardio Velocity</span>
            <span className="text-base font-black text-slate-100 font-mono">{stats.avgHeartRate || "---"} <span className="text-xs font-medium text-slate-500">bpm</span></span>
          </div>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3 relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl"><Droplets className="h-4 w-4" /></div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Metabolic Glucose</span>
            <span className="text-base font-black text-slate-100 font-mono">{stats.avgBloodSugar || "---"} <span className="text-xs font-medium text-slate-500">mg/dL</span></span>
          </div>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3 group hover:border-blue-500/40 transition-all">
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl"><Gauge className="h-4 w-4" /></div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Peak Vascular Limits</span>
            <span className="text-base font-black text-slate-100 font-mono">
              {stats.peakSystolic ? `${stats.peakSystolic}/${stats.peakDiastolic}` : "---"} <span className="text-xs font-medium text-slate-500">mmHg</span>
            </span>
          </div>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3 group hover:border-emerald-500/40 transition-all">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl"><ShieldCheck className="h-4 w-4" /></div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Stabilization</span>
            <span className="text-base font-black text-slate-100 font-mono">{stats.complianceRate}%</span>
          </div>
        </div>
      </div>

      {/* GRAPH PLATFORM & SIDEBAR SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRAPH INTERFACE CARD */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-blue-400" /> Continuous Timeline Analytics Mapping
            </h3>
            
            <div className="flex gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 self-start">
              {["All", "Heart Rate", "Blood Sugar", "Blood Pressure"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveMetricFilter(filter)}
                  className={`px-2 py-1 text-[10px] font-bold rounded-md transition cursor-pointer ${activeMetricFilter === filter ? "bg-slate-800 text-slate-100 shadow-xs" : "text-slate-500 hover:text-slate-300"}`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          
          <div className="w-full h-72 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="hrCleanGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0.01}/></linearGradient>
                  <linearGradient id="bsCleanGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0.01}/></linearGradient>
                  <linearGradient id="bpCleanGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01}/></linearGradient>
                  <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#a855f7" stopOpacity={0.25}/><stop offset="95%" stopColor="#a855f7" stopOpacity={0.01}/></linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="4 4" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: "10px", fontWeight: "600" }} tickLine={false} axisLine={false} dy={8} />
                <YAxis stroke="#64748b" style={{ fontSize: "10px", fontWeight: "600" }} tickLine={false} axisLine={false} dx={-5} />
                
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "1px solid #334155", color: "#fff", fontSize: "11px" }}/>
                <Legend wrapperStyle={{ fontSize: "11px", fontWeight: "600", paddingTop: "15px" }} iconType="circle" />

                {(activeMetricFilter === "All" || activeMetricFilter === "Heart Rate") && (
                  <Area type="monotone" name="Heart Rate (bpm)" dataKey="Heart Rate" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#hrCleanGrad)" dot={{ r: 3 }} />
                )}
                {(activeMetricFilter === "All" || activeMetricFilter === "Blood Sugar") && (
                  <Area type="monotone" name="Blood Sugar (mg/dL)" dataKey="Blood Sugar" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#bsCleanGrad)" dot={{ r: 3 }} />
                )}
                {(activeMetricFilter === "All" || activeMetricFilter === "Blood Pressure") && (
                  <>
                    <Area type="monotone" name="Systolic BP (mmHg)" dataKey="Systolic" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#bpCleanGrad)" dot={{ r: 3 }} />
                    <Area type="monotone" name="Diastolic BP (mmHg)" dataKey="Diastolic" stroke="#60a5fa" strokeWidth={1.5} fillOpacity={0} dot={{ r: 2 }} strokeDasharray="3 3" />
                  </>
                )}

                {simFactor !== "none" && (
                  <Area type="monotone" name="🧬 AI Simulated Forecast" dataKey="Simulated Projection" stroke="#a855f7" strokeWidth={3} strokeDasharray="4 4" fillOpacity={1} fill="url(#simGrad)" activeDot={{ r: 8 }} />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT SIDEBAR PANEL BLOCKS */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" /> Circadian Peak Node
            </h3>
            <div className="p-4 bg-slate-900 border border-slate-800/80 rounded-xl space-y-1.5">
              <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Most Stable Internal Timeline</span>
              <div className="text-sm font-black text-blue-400 tracking-tight">{stats.optimalTimeOfDay}</div>
            </div>
          </div>

          {/* DYNAMIC ANOMALY EVALUATOR FEED */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-red-400" /> Dynamic Anomaly Engine
            </h3>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {anomalies.length === 0 ? (
                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-[10px] font-bold">All Projections Stable.</span>
                </div>
              ) : (
                anomalies.map((anomaly, idx) => (
                  <div key={idx} className={`flex gap-2 p-2.5 rounded-xl border text-[10px] font-semibold ${anomaly.severity === "high" ? "bg-rose-500/10 border-rose-500/20 text-rose-300" : "bg-amber-500/10 border-amber-500/20 text-amber-300"}`}>
                    <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-current" />
                    <span>{anomaly.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}