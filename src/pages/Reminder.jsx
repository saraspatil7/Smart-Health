// src/pages/Reminder.jsx
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { 
  Clock, 
  Calendar, 
  Plus, 
  Pill, 
  CheckCircle2, 
  Loader2,
  Trash2,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck
} from "lucide-react";

export default function Reminder() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    medicineName: "",
    dosage: "",
    time: "",
    frequency: "Daily"
  });
  const [submitting, setSubmitting] = useState(false);
  
  // 🔔 Alarm Ring Tracking Hooks
  const [activeAlarm, setActiveAlarm] = useState(null);
  const audioContextRef = useRef(null);
  const beepIntervalRef = useRef(null);

  // Fetch saved schedules from Supabase reminders table
  const fetchReminders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .order("reminder_time", { ascending: true }); // Updated to target database reminder_time column

      if (error) throw error;
      setReminders(data || []);
    } catch (err) {
      console.error("Error connecting to Supabase reminders:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  // 🔔 BACKGROUND WORKER: Checks current clock values against scheduled entries every 30 seconds
  useEffect(() => {
    const checkTimeAndRingAlarms = () => {
      if (reminders.length === 0 || activeAlarm) return;

      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, "0");
      const currentMinutes = String(now.getMinutes()).padStart(2, "0");
      const currentTimeString = `${currentHours}:${currentMinutes}`;

      const matchingSchedule = reminders.find(item => {
        if (!item.reminder_time) return false; // Target database table column
        const targetTimeClean = item.reminder_time.slice(0, 5);
        return targetTimeClean === currentTimeString;
      });

      if (matchingSchedule) {
        triggerAudioRing(matchingSchedule);
      }
    };

    const workerLoop = setInterval(checkTimeAndRingAlarms, 30000); 
    return () => clearInterval(workerLoop);
  }, [reminders, activeAlarm]);

  // 🔊 Synthesize browser web-audio oscillator alert sounds natively
  const triggerAudioRing = async (reminderItem) => {
    setActiveAlarm(reminderItem);
    if (beepIntervalRef.current) clearInterval(beepIntervalRef.current);

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      beepIntervalRef.current = setInterval(() => {
        if (!ctx || ctx.state === "closed") return;
        
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime); 
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start();
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.stop(ctx.currentTime + 0.5);
      }, 1000);

    } catch (err) {
      console.error("Web Audio tracking failed initialize:", err);
    }
  };

  // 🔇 Global Alarm Silence Handler
  const stopAlarmRing = () => {
    if (beepIntervalRef.current) {
      clearInterval(beepIntervalRef.current);
      beepIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setActiveAlarm(null);
  };

  // Create intake reminder rows using proper database table schema structures
  const handleCreateReminder = async (e) => {
    e.preventDefault();
    if (!form.medicineName.trim() || !form.time) return;

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase
        .from("reminders")
        .insert([
          {
            user_id: session?.user?.id || null, // Associates row mapping securely to session profile IDs
            medicine_name: form.medicineName.trim(),
            dosage: form.dosage.trim() || "As directed",
            reminder_time: form.time, // Updated to point cleanly to database schema column
            frequency: form.frequency
          }
        ]);

      if (error) throw error;

      setForm({ medicineName: "", dosage: "", time: "", frequency: "Daily" });
      await fetchReminders();
    } catch (err) {
      console.error("Database connection insertion failed:", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Purge medication entries
  const handleDeleteReminder = async (id) => {
    try {
      const { error } = await supabase
        .from("reminders")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setReminders((prev) => prev.filter((item) => item.id !== id));
      
      if (activeAlarm && activeAlarm.id === id) {
        stopAlarmRing();
      }
    } catch (err) {
      console.error("Failed to delete row entry:", err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans antialiased text-slate-100 px-2 pb-12 relative">
      
      {/* 🚨 PREMIUM NEON ALARM OVERLAY DISPLAY */}
      {activeAlarm && (
        <div className="fixed bottom-6 right-6 z-50 bg-rose-950 border border-rose-500/40 text-rose-200 rounded-2xl p-5 shadow-2xl max-w-sm animate-bounce flex flex-col gap-3 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl animate-pulse">
              <Volume2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-black tracking-tight text-white">⏰ Ingestion Window Triggered</h4>
              <p className="text-xs text-rose-300/90 font-semibold mt-1">
                Administer <span className="text-white font-bold">{activeAlarm.medicine_name}</span> ({activeAlarm.dosage}) immediately.
              </p>
            </div>
          </div>
          <button
            onClick={stopAlarmRing}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-50 text-white py-2 text-xs font-black transition shadow-md shadow-rose-600/20 cursor-pointer"
          >
            <VolumeX className="h-3.5 w-3.5" /> Silence Ingestion Engine
          </button>
        </div>
      )}

      {/* 👋 PREMIUM DARK HERO BLOCK */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl">
        <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none animate-pulse">
          <Clock className="h-64 w-64 text-sky-400" />
        </div>
        
        <div className="max-w-xl z-10 relative space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-sky-500/10 border border-sky-400/20 text-sky-400 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase">
            <Sparkles className="h-3 w-3" /> Schedule Routine Module Active
          </div>
          <h1 className="text-xl font-black tracking-tight sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
            Patient Medical Intake Scheduler
          </h1>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Configure structured routine alerts, minimize dose omissions, and track pharmaceutical synchronization loops through your localized node array.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 items-start">
        
        {/* INPUT FORM PANEL */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden md:col-span-1">
          <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-slate-900 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent w-1/2 absolute left-0 top-0 opacity-20 animate-pulse" />
          </div>

          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Plus className="h-3.5 w-3.5 text-blue-400" /> Add Intake Routine
          </h3>

          <form onSubmit={handleCreateReminder} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Medicine Name</label>
              <input
                type="text"
                placeholder="e.g. Diptamp-500"
                value={form.medicineName}
                onChange={(e) => setForm(p => ({ ...p, medicineName: e.target.value }))}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 text-white p-2.5 text-xs font-semibold outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Dosage Size</label>
              <input
                type="text"
                placeholder="e.g. 1 Tablet"
                value={form.dosage}
                onChange={(e) => setForm(p => ({ ...p, dosage: e.target.value }))}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 text-white p-2.5 text-xs font-semibold outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Target Time</label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm(p => ({ ...p, time: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 text-slate-200 p-2.5 text-xs font-mono font-semibold outline-none focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Interval</label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm(p => ({ ...p, frequency: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 text-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-blue-500 transition-all"
                >
                  <option>Daily</option>
                  <option>Twice a Day</option>
                  <option>As Needed</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !form.medicineName.trim() || !form.time}
              className="w-full mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white p-2.5 text-xs font-bold transition disabled:bg-slate-800 disabled:text-slate-600 shadow-md shadow-blue-600/10 cursor-pointer"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Authorize Schedule"}
            </button>
          </form>
        </div>

        {/* DATA CONTAINER LIST */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg md:col-span-2 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Calendar className="h-3.5 w-3.5 text-blue-400" /> Active Patient Routines
          </h3>

          {loading ? (
            <div className="text-xs font-medium text-slate-500 flex items-center gap-2 py-8 justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-purple-400" /> Synchronizing cloud schedules...
            </div>
          ) : reminders.length === 0 ? (
            <div className="border border-dashed border-slate-800 bg-slate-900/20 rounded-xl p-10 text-center text-xs text-slate-500 font-semibold max-w-md mx-auto">
              <Pill className="h-8 w-8 text-slate-700 mx-auto mb-2 animate-pulse" />
              No active clinical schedules registered within this array node.
            </div>
          ) : (
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
              {reminders.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl group hover:border-slate-700 transition">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg flex items-center justify-center font-mono font-black text-xs shadow-inner">
                      {item.reminder_time?.slice(0, 5)} {/* Targets table reminder_time string slices */}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-200 tracking-tight">{item.medicine_name}</h4>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                        {item.dosage} — Scheduled <span className="text-slate-400 font-mono font-normal">{item.frequency}</span> Interval
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] uppercase font-black tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Sync Active
                    </span>
                    <button 
                      onClick={() => handleDeleteReminder(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-900 transition md:opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                      title="Purge Vector Route"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}