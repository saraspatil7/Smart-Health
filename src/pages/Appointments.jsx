import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { 
  Calendar, Plus, Stethoscope, MapPin, Loader2, Sparkles, Zap, ShieldAlert,
  User, Mail
} from "lucide-react";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    patientName: "",
    email: "",
    disease: "",
    doctorSpecialist: "",
    address: "",
    pinCode: ""
  });

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (err) {
      console.error("Error reading database appointments:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { patientName, email, disease, doctorSpecialist, address, pinCode } = form;
    if (!patientName.trim() || !email.trim() || !doctorSpecialist.trim()) return;

    setSubmitting(true);
    try {
      const { error: dbError } = await supabase
        .from("appointments")
        .insert([
          {
            patient_name: patientName.trim(),
            email: email.trim(),
            disease: disease.trim(),
            doctor_specialist: doctorSpecialist.trim(),
            address: address.trim(),
            pin_code: pinCode.trim()
          }
        ]);

      if (dbError) throw dbError;

      let emailSent = false;
      try {
        const response = await fetch("/api/send-appointment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        });
        const result = await response.json();
        emailSent = result.success === true;
      } catch (emailErr) {
        console.warn("Email service unavailable:", emailErr.message);
      }

      setForm({ patientName: "", email: "", disease: "", doctorSpecialist: "", address: "", pinCode: "" });
      await fetchAppointments();
      alert(emailSent
        ? "Appointment booked and confirmation email sent!"
        : "Appointment booked successfully! (Email notification unavailable — backend server may be offline)");
    } catch (err) {
      console.error("Booking failure:", err.message);
      alert("Failed to confirm booking: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans antialiased text-slate-100 px-2 pb-12">
      
      {/* 👋 PREMIUM DARK HERO BLOCK */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl">
        <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none animate-pulse">
          <Stethoscope className="h-64 w-64 text-sky-400" />
        </div>
        
        <div className="max-w-xl z-10 relative space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-sky-500/10 border border-sky-400/20 text-sky-400 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase">
            <Zap className="h-3 w-3" /> Booking Link Operational
          </div>
          <h1 className="text-xl font-black tracking-tight sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
            Doctor's Consultation Portal
          </h1>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Schedule clinical follow-ups, organize localized clinic reference card datasets, and dispatch automated notification relays via Resend.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 items-start">
        
        {/* INPUT PORTAL CONSOLE FORM PANEL */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden md:col-span-1">
          <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-slate-900 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent w-1/2 absolute left-0 top-0 opacity-20 animate-pulse" />
          </div>

          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Plus className="h-3.5 w-3.5 text-blue-400" /> Book Consultation
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Patient Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={form.patientName}
                onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 text-white p-2.5 text-xs font-semibold outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Notification Email</label>
              <input
                type="email"
                placeholder="sandbox@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 text-white p-2.5 text-xs font-semibold outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Patient Condition / Symptoms</label>
              <input
                type="text"
                placeholder="e.g. Chronic Migraine"
                value={form.disease}
                onChange={(e) => setForm({ ...form, disease: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 text-white p-2.5 text-xs font-semibold outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Doctor Specialist Required</label>
              <select
                value={form.doctorSpecialist}
                onChange={(e) => setForm({ ...form, doctorSpecialist: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 text-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-blue-500 transition-all"
                required
              >
                <option value="" className="bg-slate-950 text-slate-500">-- Choose Specialist --</option>
                <option value="Dr. Amanda Ross (Cardiologist)" className="bg-slate-950 text-white">Dr. Amanda Ross (Cardiologist)</option>
                <option value="Dr. Sarah Jenkins (Neurologist)" className="bg-slate-950 text-white">Dr. Sarah Jenkins (Neurologist)</option>
                <option value="Dr. Robert Chen (Pediatrician)" className="bg-slate-950 text-white">Dr. Robert Chen (Pediatrician)</option>
                <option value="Dr. Elena Rostova (General Medicine)" className="bg-slate-950 text-white">Dr. Elena Rostova (General Medicine)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Clinic Center Address</label>
              <input
                type="text"
                placeholder="123 Medical Blvd, Floor 4"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 text-white p-2.5 text-xs font-semibold outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">PIN / Postal Code</label>
              <input
                type="text"
                placeholder="400001"
                value={form.pinCode}
                onChange={(e) => setForm({ ...form, pinCode: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 text-white p-2.5 text-xs font-mono focus:border-blue-500 transition-all placeholder:text-slate-600"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white p-2.5 text-xs font-bold transition disabled:bg-slate-800 disabled:text-slate-600 shadow-md shadow-blue-600/10 cursor-pointer"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Authorize Appointment"}
            </button>
          </form>
        </div>

        {/* LOG DATA CONTAINER DISPENSARY DISPLAY */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg md:col-span-2 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Calendar className="h-3.5 w-3.5 text-blue-400" /> Registered Diagnostic Consultations
          </h3>

          {loading ? (
            <div className="text-xs font-medium text-slate-500 flex items-center gap-2 py-12 justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-purple-400" /> Fetching ledger information blocks...
            </div>
          ) : appointments.length === 0 ? (
            <div className="border border-dashed border-slate-800 bg-slate-900/20 rounded-xl p-10 text-center text-xs text-slate-500 font-semibold max-w-md mx-auto">
              <ShieldAlert className="h-8 w-8 text-slate-700 mx-auto mb-2 animate-pulse" />
              No clinical appointment logs found inside this node. Submit the form layout to populate record data.
            </div>
          ) : (
            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
              {appointments.map((item) => (
                <div key={item.id} className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-start justify-between group hover:border-slate-700 transition">
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-200 tracking-tight">{item.doctor_specialist}</h4>
                    <div className="text-[11px] text-slate-400 font-medium space-y-1">
                      <p className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-600 uppercase text-[9px] tracking-wider">Patient:</span> 
                        <span className="text-slate-300 font-semibold">{item.patient_name}</span> 
                        <span className="text-slate-500 font-mono text-[10px]">({item.email})</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-600 uppercase text-[9px] tracking-wider">Condition:</span> 
                        <span className="text-slate-300 font-sans">{item.disease}</span>
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 pt-1 border-t border-slate-800/50">
                        <MapPin className="h-3 w-3 text-slate-600 shrink-0" />
                        <span>{item.address}, PIN: <span className="font-mono">{item.pin_code}</span></span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] uppercase font-black tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md shrink-0">
                    System Verified
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}