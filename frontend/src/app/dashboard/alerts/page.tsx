"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Network, Play, ShieldAlert, CheckCircle, Info } from "lucide-react";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [correlations, setCorrelations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [correlating, setCorrelating] = useState(false);
  const [correlateStatus, setCorrelateStatus] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [alRes, coRes] = await Promise.all([
        api.get("/alerts"),
        api.get("/correlations")
      ]);
      if (alRes.data.success) setAlerts(alRes.data.data);
      if (coRes.data.success) setCorrelations(coRes.data.data);
    } catch (err) {
      console.error("Failed to load alerts & correlation data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunCorrelation = async () => {
    setCorrelating(true);
    setCorrelateStatus("Evaluating explainable alert correlation rules...");
    try {
      const res = await api.post("/correlations/run");
      if (res.data.success) {
        setCorrelateStatus(`Correlation engine executed! Generated ${res.data.data?.length || 0} correlation group(s).`);
        fetchData();
        setTimeout(() => setCorrelateStatus(null), 2500);
      }
    } catch (err: any) {
      setCorrelateStatus(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setCorrelating(false);
    }
  };

  const handleUpdateAlertStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/alerts/${id}`, { status });
      fetchData();
    } catch (err) {
      console.error("Failed to update alert status:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center space-x-2">
            <Network className="w-5 h-5 text-cyan-400" />
            <span>Alert Correlation Queue</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">Multi-Alert Deduplication & Time-Proximity Sequence Correlation</p>
        </div>

        <button
          onClick={handleRunCorrelation}
          disabled={correlating}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-lg shadow-cyan-600/20 disabled:opacity-50"
        >
          <Play className="w-4 h-4 text-white" />
          <span>{correlating ? "Correlating..." : "Run Correlation Engine"}</span>
        </button>
      </div>

      {correlateStatus && (
        <div className="p-3 bg-slate-900 border border-slate-700 text-cyan-400 text-xs font-mono rounded-lg flex items-center space-x-2">
          <Info className="w-4 h-4 shrink-0 text-cyan-400" />
          <span>{correlateStatus}</span>
        </div>
      )}

      {/* Correlation Groups Summary Cards */}
      {correlations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Active Correlation Groups</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {correlations.map((cg) => (
              <div key={cg.id} className="bg-[#131b2e] border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-white">{cg.groupName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {cg.alerts?.length || 0} Alerts
                  </span>
                </div>
                <p className="text-xs text-slate-400">{cg.correlationReason}</p>
                <div className="text-[10px] font-mono text-slate-500 flex items-center space-x-2">
                  <span>Rule: {cg.ruleName}</span>
                  <span>|</span>
                  <span>Confidence: {(cg.confidenceScore * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alert Queue Table */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-semibold text-sm text-white">Detection Alerts Queue</h3>
          <span className="text-[10px] font-mono text-slate-400">Total: {alerts.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 text-[11px]">
                <th className="pb-3 font-normal">TIMESTAMP</th>
                <th className="pb-3 font-normal">SEVERITY</th>
                <th className="pb-3 font-normal">DESCRIPTION</th>
                <th className="pb-3 font-normal">MITRE TTP</th>
                <th className="pb-3 font-normal">STATUS</th>
                <th className="pb-3 font-normal">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {alerts.map((al) => (
                <tr key={al.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 text-slate-400">{new Date(al.timestamp).toLocaleString()}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      al.severity === "CRITICAL" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                      {al.severity}
                    </span>
                  </td>
                  <td className="py-2.5 text-white max-w-sm">{al.description}</td>
                  <td className="py-2.5 text-blue-400">{al.mitreTechnique || "T1110"}</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                      {al.status}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <select
                      value={al.status}
                      onChange={(e) => handleUpdateAlertStatus(al.id, e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-slate-300 text-[10px] rounded p-1"
                    >
                      <option value="NEW">NEW</option>
                      <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
                      <option value="INVESTIGATING">INVESTIGATING</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="FALSE_POSITIVE">FALSE_POSITIVE</option>
                    </select>
                  </td>
                </tr>
              ))}
              {alerts.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 text-xs">No active detection alerts in queue.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
