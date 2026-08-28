import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient.js"; 
import { 
  Plus, Trash2, CheckCircle, AlertTriangle, ShieldAlert, Loader2, 
  Activity, Heart, ShieldAlert as AlertIcon, Sparkles, Edit2, X, Save
} from "lucide-react";

export default function LogMetrics() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: "Blood Pressure",
    value: "",
    unit: "mmHg"
  });

  const [editFormData, setEditFormData] = useState({
    date: "",
    type: "",
    value: "",
    unit: ""
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("clinical_metrics")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error("Ledger Sync Failure:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let unit = "mmHg";
    if (value === "Heart Rate") unit = "bpm";
    if (value === "Blood Sugar") unit = "mg/dL";
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
      unit: name === "type" ? unit : prev.unit
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    let unit = "mmHg";
    if (value === "Heart Rate") unit = "bpm";
    if (value === "Blood Sugar") unit = "mg/dL";

    setEditFormData(prev => ({
      ...prev,
      [name]: value,
      unit: name === "type" ? unit : prev.unit
    }));
  };

  const evaluateMetricStatus = (type, rawValue) => {
    const numVal = parseFloat(rawValue);
    if (isNaN(numVal) && type !== "Blood Pressure") return "Optimal";

    switch (type) {
      case "Blood Pressure":
        const parts = rawValue.split("/");
        if (parts.length === 2) {
          const systolic = parseFloat(parts[0]);
          const diastolic = parseFloat(parts[1]);
          if (systolic >= 140 || diastolic >= 90) return "High Risk Stage";
          if (systolic >= 120 || diastolic >= 80) return "Elevated Stage";
          if (systolic < 90 || diastolic < 60) return "Low Pressure";
        }
        return "Optimal";

      case "Heart Rate":
        if (numVal > 100) return "Tachycardia (High)";
        if (numVal < 60) return "Bradycardia (Low)";
        return "Optimal";

      case "Blood Sugar":
        if (numVal >= 140) return "Hyperglycemic (High)";
        if (numVal < 70) return "Hypoglycemic (Low)";
        return "Optimal";

      default:
        return "Optimal";
    }
  };

  const getInsights = () => {
    if (logs.length === 0) return { title: "Ready for Input", text: "Log your first reading above to generate an automated AI wellness health review.", type: "neutral" };
    
    const latestLog = logs[0];
    const status = latestLog.status;

    if (status === "Optimal") {
      return {
        title: "Vitals are Phenomenal!",
        text: `Your latest ${latestLog.type} reading of ${latestLog.value} ${latestLog.unit} looks perfectly balanced. Keep maintaining your current tracking schedule!`,
        type: "success"
      };
    }
    
    return {
      title: `Alert: ${status} Detected`,
      text: `Your last recorded ${latestLog.type} (${latestLog.value} ${latestLog.unit}) deviates from targeted parameters. Hydrate, rest, and cross-reference records.`,
      type: "warning"
    };
  };

  const insights = getInsights();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.value.trim()) return;

    setSubmitting(true);
    const calculatedStatus = evaluateMetricStatus(formData.type, formData.value.trim());

    try {
      const { error } = await supabase
        .from("clinical_metrics")
        .insert([
          {
            date: formData.date,
            type: formData.type,
            value: formData.value.trim(),
            unit: formData.unit,
            status: calculatedStatus
          }
        ]);

      if (error) throw error;
      
      setFormData(prev => ({ ...prev, value: "" }));
      await fetchLogs();
    } catch (err) {
      alert("Database Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (log) => {
    setEditingId(log.id);
    setEditFormData({
      date: log.date,
      type: log.type,
      value: log.value,
      unit: log.unit
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleUpdateSubmit = async (id) => {
    if (!editFormData.value.trim()) return;

    const reCalculatedStatus = evaluateMetricStatus(editFormData.type, editFormData.value.trim());
    try {
      const { error } = await supabase
        .from("clinical_metrics")
        .update({
          date: editFormData.date,
          type: editFormData.type,
          value: editFormData.value.trim(),
          unit: editFormData.unit,
          status: reCalculatedStatus
        })
        .eq("id", id);

      if (error) throw error;

      setEditingId(null);
      await fetchLogs();
    } catch (err) {
      alert("Update Failed: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from("clinical_metrics")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setLogs(prev => prev.filter(log => log.id !== id));
      if (editingId === id) setEditingId(null);
    } catch (err) {
      console.error("Purging parameters failed:", err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans antialiased text-slate-100 px-2 pb-12">
      
      {/* 👋 PREMIUM DARK HERO ELEMENT */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl">
        <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none animate-pulse">
          <Activity className="h-64 w-64 text-sky-400" />
        </div>
        
        <div className="max-w-xl z-10 relative space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-sky-500/10 border border-sky-400/20 text-sky-400 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase">
            <Sparkles className="h-3 w-3" /> Data Ingestion Matrix v4
          </div>
          <h1 className="text-xl font-black tracking-tight sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
            Clinical Vitals Ledger
          </h1>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Process health metrics, update historical telemetry entries, and securely parse biological status anomalies inside your isolated cluster space.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: DARK FORM PANEL */}
        <div className="space-y-4 lg:col-span-1">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-slate-900 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-transparent via-sky-400 to-transparent w-1/2 absolute left-0 top-0 opacity-20 animate-pulse" />
            </div>

            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Plus className="h-3.5 w-3.5 text-sky-400" /> Log Metric Telemetry
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Logging Date</label>
                <input 
                  type="date" 
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-800 px-3 py-2 text-xs font-semibold bg-slate-900 text-white focus:border-sky-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Metric Category</label>
                <select 
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-800 px-3 py-2 text-xs font-semibold bg-slate-900 text-slate-300 focus:border-sky-500 outline-none transition-all"
                >
                  <option value="Blood Pressure">Blood Pressure (mmHg)</option>
                  <option value="Heart Rate">Heart Rate (bpm)</option>
                  <option value="Blood Sugar">Blood Sugar (mg/dL)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Recorded Reading Value</label>
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    name="value"
                    placeholder={formData.type === "Blood Pressure" ? "e.g. 120/80" : "e.g. 72"}
                    value={formData.value}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 text-white pl-3 pr-16 py-2 text-xs font-mono focus:border-sky-500 outline-none transition-all"
                    required
                  />
                  <span className="absolute right-3 text-[10px] font-bold text-slate-500">{formData.unit}</span>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white py-2.5 text-xs font-bold transition shadow-md shadow-blue-600/10 cursor-pointer"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Commit Metric Vector"}
              </button>
            </form>
          </div>

          {/* DYNAMIC DANGER/SUCCESS STATUS MATRICES */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 ${
            insights.type === "success" 
              ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200" 
              : insights.type === "warning"
              ? "bg-amber-950/40 border-amber-500/30 text-amber-200 animate-pulse"
              : "bg-slate-900/60 border-slate-800 text-slate-300"
          }`}>
            <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              {insights.type === "success" ? <Sparkles className="h-4 w-4 text-emerald-400" /> : <AlertIcon className="h-4 w-4 text-amber-400" />}
              {insights.title}
            </h4>
            <p className="text-[11px] font-semibold leading-relaxed opacity-90 font-sans">{insights.text}</p>
          </div>
        </div>

        {/* RIGHT COLUMN: PREMIUM DARK TABLE GRID LOGS */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Historical Tracking Logs</h3>
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
              <ShieldAlert className="h-3 w-3" /> Ledger Active
            </span>
          </div>

          {loading ? (
            <div className="text-xs font-medium text-slate-500 flex items-center gap-2 py-12 justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-purple-400" /> Syncing network parameters...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center p-12 text-xs text-slate-500 font-semibold italic">
              No historical compliance records found. Submit data parameters to track vectors.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-slate-800 text-[10px] uppercase tracking-wider font-black text-slate-500">
                    <th className="py-3 px-5">Timestamp</th>
                    <th className="py-3 px-5">Metric</th>
                    <th className="py-3 px-5">Reading</th>
                    <th className="py-3 px-5">Evaluation Summary</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs font-bold text-slate-300">
                  {logs.map((log) => {
                    const isEditing = editingId === log.id;
                    return (
                      <tr key={log.id} className={`transition-colors ${isEditing ? "bg-indigo-950/20" : "hover:bg-slate-900/30"}`}>
                        
                        <td className="py-3 px-5">
                          {isEditing ? (
                            <input 
                              type="date"
                              name="date"
                              value={editFormData.date}
                              onChange={handleEditInputChange}
                              className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-white outline-none focus:border-purple-500 max-w-[130px]"
                            />
                          ) : (
                            <span className="text-slate-500 font-sans font-medium">{log.date}</span>
                          )}
                        </td>

                        <td className="py-3 px-5">
                          {isEditing ? (
                            <select
                              name="type"
                              value={editFormData.type}
                              onChange={handleEditInputChange}
                              className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-slate-200 focus:border-purple-500 outline-none"
                            >
                              <option value="Blood Pressure">Blood Pressure</option>
                              <option value="Heart Rate">Heart Rate</option>
                              <option value="Blood Sugar">Blood Sugar</option>
                            </select>
                          ) : (
                            <span className="text-slate-200 font-extrabold">{log.type}</span>
                          )}
                        </td>

                        <td className="py-3 px-5">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input 
                                type="text"
                                name="value"
                                value={editFormData.value}
                                onChange={handleEditInputChange}
                                className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 font-mono text-xs max-w-[80px] focus:border-purple-500 outline-none text-white"
                              />
                              <span className="text-[10px] text-slate-500 font-sans font-normal">{editFormData.unit}</span>
                            </div>
                          ) : (
                            <span className="font-mono text-slate-100">
                              {log.value} <span className="text-[10px] text-slate-500 font-sans font-normal">{log.unit}</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-5">
                          {isEditing ? (
                            <span className="text-[10px] text-slate-500 font-mono italic font-normal">Re-evaluating threshold vectors...</span>
                          ) : (
                            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border ${
                              log.status === "Optimal" 
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}>
                              {log.status === "Optimal" ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                              {log.status}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-5 text-right">
                          <div className="flex justify-end gap-1.5">
                            {isEditing ? (
                              <>
                                <button 
                                  onClick={() => handleUpdateSubmit(log.id)}
                                  className="text-emerald-400 hover:bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/20 bg-slate-900 transition cursor-pointer"
                                  title="Commit Modifications"
                                >
                                  <Save className="h-3.5 w-3.5" />
                                </button>
                                <button 
                                  onClick={cancelEditing}
                                  className="text-slate-400 hover:bg-slate-800 p-1.5 rounded-lg border border-slate-800 bg-slate-900 transition cursor-pointer"
                                  title="Abort Modifications"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  onClick={() => startEditing(log)}
                                  className="text-slate-500 hover:text-sky-400 p-1.5 rounded-lg hover:bg-slate-900 transition cursor-pointer"
                                  title="Modify Row Matrix"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDelete(log.id)}
                                  className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-900 transition cursor-pointer"
                                  title="Purge Vector Node"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}