import React, { useState } from "react";
import { groqChat, groqVision } from "../lib/groq.js";
import { supabase } from "../lib/supabaseClient.js";

import {
  Bot,
  Camera,
  Sparkles,
  Loader2,
  FileText,
  Send,
  UploadCloud,
  ShieldCheck,
  Zap
} from "lucide-react";

export default function AIWorkspace() {
  const [chat, setChat] = useState({
    prompt: "",
    reply: "",
    loading: false,
  });

  const [vision, setVision] = useState({
    reply: "",
    loading: false,
    preview: null,
  });

  // ================= CHAT ARCHITECTURE =================

  const askChat = async (e) => {
    e.preventDefault();

    const userQuestion = chat.prompt.trim();
    if (!userQuestion) return;

    setChat((c) => ({
      ...c,
      loading: true,
      reply: "",
    }));

    try {
      const reply = await groqChat(userQuestion);

      try {
        const { error: dbError } = await supabase
          .from('chat_history')
          .insert([
            {
              user_question: userQuestion,
              ai_answer: reply
            }
          ]);

        if (dbError) {
          console.warn("⚠️ Chat log database insertion failed:", dbError.message);
        }
      } catch (dbErr) {
        console.warn("⚠️ Chat log database background exception caught:", dbErr.message);
      }

      setChat((c) => ({
        ...c,
        reply,
        loading: false,
        prompt: "", 
      }));
    } catch (err) {
      console.error(err);
      setChat((c) => ({
        ...c,
        reply: `Failed to communicate with AI assistant: ${err.message}`,
        loading: false,
      }));
    }
  };

  // ================= IMAGE VISION & SUPABASE LEDGER =================

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const imageData = reader.result;

      setVision({
        reply: "",
        loading: true,
        preview: imageData,
      });

      try {
        const reply = await groqVision(imageData);
        const lines = reply.split('\n');

        const rawTitle = lines[0] || "";
        const cleanMedicineName = rawTitle
          .replace(/[#*`_-]/g, '')                
          .replace(/medicine\s*name\s*:\s*/i, '') 
          .trim();                                

        const purelyMedicalUses = lines.slice(1).join('\n').trim();

        try {
          const { error: dbError } = await supabase
            .from('medicine_scans')
            .insert([
              {
                medicine_name: cleanMedicineName || "Identified Medicine Matrix",
                raw_ai_analysis: purelyMedicalUses
              }
            ]);

          if (dbError) {
            console.warn("⚠️ Database insertion background warning:", dbError.message);
          }
        } catch (dbErr) {
          console.warn("⚠️ Database exception caught in background context:", dbErr.message);
        }

        setVision({
          reply,
          loading: false,
          preview: imageData,
        });
      } catch (err) {
        console.error("Vision Processing Error:", err);
        setVision({
          reply: `Failed to process image: ${err.message}`,
          loading: false,
          preview: imageData,
        });
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans antialiased text-slate-100 px-2 pb-12">
      
      {/* 👋 PREMIUM DARK HERO HEADER */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl">
        <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none animate-pulse">
          <Sparkles className="h-64 w-64 text-sky-400" />
        </div>
        
        <div className="max-w-xl z-10 relative space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-sky-500/10 border border-sky-400/20 text-sky-400 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase">
            <Zap className="h-3 w-3" /> Core Inference Active
          </div>
          <h1 className="text-xl font-black tracking-tight sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
            Advanced AI Diagnostics Terminal
          </h1>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Access specialized vision scanning parameters and clinical assistant bots powered by rapid LPU processing clusters.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 items-start">

        {/* ================= CHAT CARD ================= */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-lg relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-slate-900 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-transparent via-purple-500 to-transparent w-1/2 absolute left-0 top-0 opacity-20 animate-pulse" />
          </div>

          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-200">Ask Clinical Assistant</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Conversational query analysis matrix</p>
            </div>
          </div>

          <form onSubmit={askChat} className="space-y-3 pt-3">
            <textarea
              placeholder="Ask about medicines, symptoms, health tips..."
              value={chat.prompt}
              onChange={(e) =>
                setChat((c) => ({
                  ...c,
                  prompt: e.target.value,
                }))
              }
              rows={4}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs font-semibold text-white outline-none placeholder:text-slate-600 focus:border-purple-500 transition-all resize-none font-sans"
            />

            <button
              type="submit"
              disabled={chat.loading || !chat.prompt.trim()}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white px-4 py-2.5 text-xs font-bold transition disabled:text-slate-600 cursor-pointer shadow-md shadow-purple-600/10"
            >
              {chat.loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {chat.loading ? "Processing Tensors..." : "Send Parameter"}
            </button>
          </form>

          {chat.reply && (
            <div className="mt-4 rounded-xl bg-purple-950/20 border border-purple-500/20 p-4 text-xs font-semibold text-purple-200 whitespace-pre-line leading-relaxed font-sans shadow-inner">
              <p className="text-[10px] uppercase font-black text-purple-400 tracking-widest mb-2 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> AI Diagnostic Synthesis
              </p>
              {chat.reply}
            </div>
          )}
        </div>

        {/* ================= IMAGE SCANNER ================= */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-lg relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-slate-900 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-transparent via-sky-500 to-transparent w-1/2 absolute left-0 top-0 opacity-20 animate-pulse" />
          </div>

          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <div className="h-9 w-9 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-200">Vision Prescription Scanner</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Extract compound matrices using AI Vision</p>
            </div>
          </div>

          <div className="pt-3">
            <label className="group block rounded-xl border-2 border-dashed border-slate-800 bg-slate-900/50 p-6 text-center hover:border-sky-500 hover:bg-sky-500/5 transition-all cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="hidden"
              />
              <UploadCloud className="mx-auto h-7 w-7 text-slate-600 group-hover:text-sky-400 transition-colors mb-2" />
              <p className="text-xs font-bold text-slate-300">Upload medicine or prescription asset</p>
              <p className="text-[10px] text-slate-600 font-medium mt-0.5 font-mono">SUPPORTS: PNG // JPEG // WEBP</p>
            </label>
          </div>

          {vision.preview && (
            <div className="relative rounded-xl border border-slate-800 bg-slate-900/40 p-2 overflow-hidden flex justify-center mt-4">
              <img
                src={vision.preview}
                alt="Preview"
                className="max-h-40 rounded-lg object-contain border border-slate-800"
              />

              {vision.loading && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs font-bold gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-sky-400" />
                  <span className="font-mono text-[10px] text-slate-400 tracking-wider">PROCESSING MULTI-MODAL PIXELS...</span>
                </div>
              )}
            </div>
          )}

          {vision.reply && (
            <div className="mt-4 rounded-xl bg-sky-950/20 border border-sky-500/20 p-4 text-xs font-semibold text-sky-200 whitespace-pre-line leading-relaxed font-mono shadow-inner">
              <p className="text-[10px] uppercase font-black text-sky-400 tracking-widest mb-2 flex items-center gap-1 font-sans">
                <FileText className="h-3.5 w-3.5" /> Extraction Telemetry Report
              </p>
              {vision.reply}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}