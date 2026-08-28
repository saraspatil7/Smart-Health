import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  User,
  Mail,
  Building2,
  Fingerprint,
  Shield,
  LogOut,
  Phone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ✅ Supabase Client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState("Loading...");
  const [phoneNumber, setPhoneNumber] = useState("Loading...");

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

    setUser(user);

    if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    } else if (user?.email) {
      setFullName(user.email);
    } else {
      setFullName("SmartHealth User");
    }

    const savedPhone =
      user?.user_metadata?.phone_number ||
      user?.user_metadata?.phone ||
      "Not provided";

    setPhoneNumber(savedPhone);
  };

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = async () => {
    await supabase.auth.signOut();

    navigate("/auth");
  };

  return (
    <div className="max-w-5xl mx-auto py-6">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-5xl font-black text-slate-900 tracking-tight">
          Account Profile
        </h1>

        <p className="text-slate-500 mt-2 text-lg">
          Manage your workspace identity metrics and account settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT PROFILE CARD */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">

          <div className="flex flex-col items-center text-center">

            {/* Avatar */}
            <div className="h-28 w-28 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <User className="h-14 w-14 text-white" />
            </div>

            {/* User Name */}
            <h2 className="mt-6 text-2xl font-black text-slate-900">
              {fullName}
            </h2>

            {/* Email */}
            <p className="text-blue-600 font-semibold mt-2 break-all">
              {user?.email || "Loading..."}
            </p>

            {/* Phone */}
            <p className="text-slate-500 font-medium mt-2">
              {phoneNumber}
            </p>

            {/* Status */}
            <div className="mt-6 inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold">
              <Shield className="h-4 w-4" />
              Active Session
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="mt-8 w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>

          </div>
        </div>

        {/* RIGHT DETAILS */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">

          <div className="flex items-center gap-3 mb-8">
            <Shield className="h-6 w-6 text-blue-600" />

            <h2 className="text-2xl font-black text-slate-900">
              Personal Credentials
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Full Name */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                Account Name
              </label>

              <div className="flex items-center gap-3 border border-slate-200 rounded-2xl px-4 py-4">
                <User className="h-5 w-5 text-slate-400" />

                <span className="font-semibold text-slate-800">
                  {fullName}
                </span>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                Email Address
              </label>

              <div className="flex items-center gap-3 border border-slate-200 rounded-2xl px-4 py-4">
                <Mail className="h-5 w-5 text-slate-400" />

                <span className="font-semibold text-slate-800 break-all">
                  {user?.email || "Loading..."}
                </span>
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                Department
              </label>

              <div className="flex items-center gap-3 border border-slate-200 rounded-2xl px-4 py-4">
                <Building2 className="h-5 w-5 text-slate-400" />

                <span className="font-semibold text-slate-800">
                  AI Healthcare Systems
                </span>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                Phone Number
              </label>

              <div className="flex items-center gap-3 border border-slate-200 rounded-2xl px-4 py-4">
                <Phone className="h-5 w-5 text-slate-400" />

                <span className="font-semibold text-slate-800">
                  {phoneNumber}
                </span>
              </div>
            </div>

            {/* User ID */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                User ID
              </label>

              <div className="flex items-center gap-3 border border-slate-200 rounded-2xl px-4 py-4">
                <Fingerprint className="h-5 w-5 text-slate-400" />

                <span className="font-semibold text-slate-800">
                  {user?.id?.slice(0, 12) || "Loading..."}
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}