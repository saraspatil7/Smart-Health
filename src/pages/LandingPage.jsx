// src/pages/LandingPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { 
  Shield, 
  BrainCircuit, 
  Clock, 
  Activity, 
  ArrowRight, 
  CheckCircle, 
  Sparkles 
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-blue-500/30 relative overflow-hidden">
      
      {/* Immersive Background Ambient Light Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-blue-500/10 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* 🌐 MINIMAL HEADER NAVIGATION */}
      <header className="border-b border-slate-900 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-lg shadow-lg shadow-blue-500/10">
              🩺
            </div>
            <div>
              <span className="font-black text-base tracking-tight block text-white leading-none">
                SmartHealth
              </span>
              <span className="text-[9px] text-blue-400 font-black tracking-widest uppercase block mt-1">
                AI Workspace
              </span>
            </div>
          </div>
          
          <Link
            to="/auth"
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
          >
            Access Portal <ArrowRight className="h-3.5 w-3.5 text-blue-400" />
          </Link>
        </div>
      </header>

      {/* 🚀 HERO PRESENTATION LAYOUT BLOCK */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center space-y-8 relative z-10">
        <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-400/20 text-blue-400 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase animate-pulse">
          <Sparkles className="h-3.5 w-3.5" /> Next-Generation Clinical Intelligence
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 max-w-3xl mx-auto leading-tight">
          The Intelligent Core for Localized Healthcare
        </h1>

        <p className="text-slate-400 font-medium text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Synthesize medical data streams, run computer vision pharmacology scans, and configure structural compliance loops through a secure telemetry workspace framework.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/auth"
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-xl shadow-blue-500/10 text-center active:scale-98 cursor-pointer"
          >
            Initialize Environment Node
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-center"
          >
            Review Core Parameters
          </a>
        </div>
      </section>

      {/* 📊 INTERACTIVE TELEMETRY OVERVIEW SUMMARY BADGES */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/40 border border-slate-900 p-6 rounded-3xl backdrop-blur-sm text-center">
          {[
            { label: "AI Diagnostic Sync", value: "99.4%" },
            { label: "Telemetry Latency", value: "< 24ms" },
            { label: "Database Encryption", value: "AES-256" },
            { label: "Active Nodes Linked", value: "Live" }
          ].map((stat, i) => (
            <div key={i} className="space-y-1 p-2">
              <p className="text-2xl font-black text-white font-mono">{stat.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🛠️ CORE FEATURES PARAMETERS MATRIX */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-900 relative z-10">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-xs font-black uppercase tracking-widest text-blue-400">System Modules</h2>
          <p className="text-xl sm:text-2xl font-black text-white tracking-tight">Engineered Functional Framework Arrays</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Feature 1: Groq Vision */}
          <div className="bg-slate-900/50 border border-slate-800/60 p-6 rounded-2xl space-y-4 hover:border-slate-700 transition-all shadow-xl group">
            <div className="h-10 w-10 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wide">AI Computer Vision</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Upload diagnostic pharmacology images directly to localized LLaVA vision nodes to pull instant active composition profiles and dosage alerts.
            </p>
          </div>

          {/* Feature 2: CRUD Logs */}
          <div className="bg-slate-900/50 border border-slate-800/60 p-6 rounded-2xl space-y-4 hover:border-slate-700 transition-all shadow-xl group">
            <div className="h-10 w-10 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wide">Telemetry CRUD Ledger</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Write, store, and modify chronological physiological parameters seamlessly into a unified dataset table linked directly to your Supabase instance.
            </p>
          </div>

          {/* Feature 3: Web Audio Scheduler */}
          <div className="bg-slate-900/50 border border-slate-800/60 p-6 rounded-2xl space-y-4 hover:border-slate-700 transition-all shadow-xl group">
            <div className="h-10 w-10 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wide">Compliance Clock Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Natively synthesize browser oscillator wave alerts through automated background time-checks to entirely prevent intake routing omissions.
            </p>
          </div>

        </div>
      </section>

      {/* 🔒 SECURITY AND COMPLIANCE SIGNPOST */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-xs font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 border-t border-slate-900">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>Supabase Infrastructure Layer Validated</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-blue-500 shrink-0" />
          <span>Groq Visual LLM Processing Secured</span>
        </div>
      </section>

    </div>
  );
}