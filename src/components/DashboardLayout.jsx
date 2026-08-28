// src/components/DashboardLayout.jsx

import React, { useState, useEffect } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

import {
  User,
  ScanQrCode,
  UploadCloud,
  X,
  AlertCircle,
  LogOut,
} from "lucide-react";

// ✅ Supabase Client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const navLinks = [
  { name: "Overview", href: "/dashboard" },
  { name: "Analytics", href: "/dashboard/analytics" },
  { name: "Log Metrics", href: "/dashboard/log" },
  { name: " Ai Scanner", href: "/dashboard/ai" },
  { name: "Reminders", href: "/dashboard/reminders" },
  { name: "Appointments", href: "/dashboard/appointments" },
];

export default function DashboardLayout() {
  const location = useLocation();

  // =========================
  // STATES
  // =========================
  const [userEmail, setUserEmail] = useState("");

  const [isScanOpen, setIsScanOpen] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);

  const [previewUrl, setPreviewUrl] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const [medicineInfo, setMedicineInfo] = useState("");

  // =========================
  // GET LOGGED USER
  // =========================
  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setUserEmail(user.email);
    }
  };

  // =========================
  // FILE CHANGE
  // =========================
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setSelectedFile(file);

      setPreviewUrl(URL.createObjectURL(file));

      setMedicineInfo("");
    }
  };

  // =========================
  // SCAN IMAGE
  // =========================
  const handleScanSubmit = async () => {
    if (!selectedFile) return;

    setIsLoading(true);

    setMedicineInfo("");

    const reader = new FileReader();

    reader.readAsDataURL(selectedFile);

    reader.onloadend = async () => {
      const base64Data = reader.result;

      try {
        const response = await fetch(
          "http://localhost:5000/api/scan-medicine",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              imageBase64: base64Data,
            }),
          }
        );

        const data = await response.json();

        if (data.success && data.information) {
          setMedicineInfo(data.information);
        } else if (data.error) {
          setMedicineInfo(`⚠️ Error: ${data.error}`);
        } else {
          setMedicineInfo(
            "⚠️ Analysis completed but no valid information returned."
          );
        }
      } catch (err) {
        setMedicineInfo(
          "❌ Connection failed. Ensure backend server is running on port 5000."
        );
      } finally {
        setIsLoading(false);
      }
    };
  };

  // =========================
  // SIGN OUT
  // =========================
  const handleSignOut = async () => {
    await supabase.auth.signOut();

    window.location.href = "/auth";
  };

  // =========================
  // CLOSE MODAL
  // =========================
  const closeScanner = () => {
    setIsScanOpen(false);

    setSelectedFile(null);

    setPreviewUrl(null);

    setMedicineInfo("");

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">

      {/* TOP RIBBON */}
      <div className="bg-slate-950 text-slate-200 px-4 py-2 text-xs font-medium sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 border-b border-slate-800 tracking-wide z-50">

        <div className="flex items-center gap-2">

          <span className="bg-purple-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm">
            GROQ VISION LIVE
          </span>

          <span className="text-slate-400">
            Need to identify a medicine or analyze a label?
            Click to scan instantly.
          </span>

        </div>

        <button
          onClick={() => setIsScanOpen(true)}
          className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 px-3 py-1 rounded-lg border border-slate-700/60 transition-all cursor-pointer text-[11px] font-bold"
        >
          <ScanQrCode className="h-3.5 w-3.5 text-sky-400" />

          Launch Medicine Scanner
        </button>

      </div>

      {/* NAVBAR */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-sm backdrop-blur-md bg-white/90">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex justify-between items-center h-16 w-full">

            {/* LEFT LOGO */}
            <div className="flex items-center">

              <Link
                to="/dashboard"
                className="flex items-center space-x-2.5 group"
              >

                <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-lg shadow-md shadow-blue-200 group-hover:scale-105 transition-transform">
                  🩺
                </div>

                <div>

                  <span className="font-black text-base tracking-tight block text-slate-900 leading-none">
                    SmartHealth
                  </span>

                  <span className="text-[9px] text-blue-600 font-black tracking-widest uppercase block mt-0.5">
                    AI Workspace
                  </span>

                </div>

              </Link>

            </div>

            {/* CENTER NAVIGATION */}
            <div className="hidden md:flex items-center space-x-1 h-full">

              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;

                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`inline-flex items-center px-4 h-16 text-xs font-black tracking-wide border-b-2 transition-all cursor-pointer uppercase ${
                      isActive
                        ? "text-blue-600 border-blue-600 bg-blue-50/20"
                        : "text-slate-500 border-transparent hover:text-slate-900 hover:bg-slate-50/50"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}

            </div>

            {/* RIGHT SECTION */}
            <div className="flex items-center gap-3">

              {/* PROFILE BUTTON */}
              <Link
                to="/dashboard/profile"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-2xl text-sm font-bold transition-all shadow-md active:scale-95"
              >
                <User className="h-4 w-4" />

                Profile
              </Link>

              {/* EMAIL CONTAINER */}
              <div className="hidden lg:flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-2 min-w-[340px] shadow-sm">

                <User className="h-4 w-4 text-slate-400 shrink-0" />

                <span className="font-mono text-xs tracking-wide text-slate-500 whitespace-nowrap">
                  Clinical ID:
                </span>

                <span className="font-semibold text-sm text-slate-700 truncate">
                  {userEmail || "Loading..."}
                </span>

              </div>

              {/* LOGOUT BUTTON */}
              <button
                onClick={handleSignOut}
                className="rounded-xl p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>

            </div>

          </div>

        </div>

      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Outlet />
        </div>

      </main>

      {/* SCANNER MODAL */}
      {isScanOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">

          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">

            {/* HEADER */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">

              <div>

                <h3 className="text-base font-bold text-slate-900">
                  AI Medicine Scanner
                </h3>

                <p className="text-xs text-slate-500 mt-0.5">
                  Upload packaging image to analyze medicine instantly.
                </p>

              </div>

              <button
                onClick={closeScanner}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

            </div>

            {/* BODY */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">

              {!previewUrl ? (
                <label className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-slate-50/40 cursor-pointer transition-all group">

                  <UploadCloud className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors" />

                  <span className="text-sm font-bold text-slate-700">
                    Click to upload image
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                </label>
              ) : (
                <div className="space-y-4">

                  <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center h-40">

                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-full object-contain"
                    />

                  </div>

                  {isLoading && (
                    <div className="flex flex-col items-center justify-center py-4 gap-2">

                      <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>

                      <p className="text-xs text-slate-500 font-bold">
                        AI analyzing medicine label...
                      </p>

                    </div>
                  )}

                  {medicineInfo && (
                    <div className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs font-mono leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                      {medicineInfo}
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* FOOTER */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">

              <button
                onClick={closeScanner}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Close
              </button>

              <button
                onClick={handleScanSubmit}
                disabled={!selectedFile || isLoading}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all"
              >
                {isLoading ? "Analyzing..." : "Run Scan"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}