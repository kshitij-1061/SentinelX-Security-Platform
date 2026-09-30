"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { 
  Siren, 
  Plus, 
  ShieldAlert, 
  Clock, 
  FileText, 
  Lock, 
  ShieldCheck, 
  CheckCircle,
  AlertTriangle,
  Play
} from "lucide-react";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Incident Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState("Unauthorized SSH Access Investigation");
  const [description, setDescription] = useState("Bruteforce attempts detected targeting database server.");
  const [severity, setSeverity] = useState("HIGH");

  // Analyst Note & Evidence Input
  const [newNote, setNewNote] = useState("");
  const [evidenceDescription, setEvidenceDescription] = useState("");
  const [evidenceSource, setEvidenceSource] = useState("Syslog-10.0.0.50");

  // Controlled Response Simulation Modal
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [actionType, setActionType] = useState("ISOLATE_TEST_ENDPOINT");
  const [actionTarget, setActionTarget] = useState("db-cluster-01");
  const [actionReason, setActionReason] = useState("Contain lateral movement risk");
  const [confirmSimulation, setConfirmSimulation] = useState(false);
  const [responseLog, setResponseLog] = useState<string | null>(null);

  const fetchIncidents = async () => {
    try {
      const res = await api.get("/incidents");
      if (res.data.success) {
        setIncidents(res.data.data);
        if (res.data.data.length > 0 && !selectedIncident) {
          selectIncident(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load incidents:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectIncident = async (inc: any) => {
    try {
      const res = await api.get(`/incidents/${inc.id}`);
      if (res.data.success) {
        setSelectedIncident(res.data.data);
        const tlRes = await api.get(`/incidents/${inc.id}/timeline`);
        if (tlRes.data.success) setTimeline(tlRes.data.data);
      }
    } catch (err) {
      console.error("Failed to load incident details:", err);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/incidents", {
        title,
        description,
        severity,
        status: "NEW"
      });
      if (res.data.success) {
        setShowCreateModal(false);
        fetchIncidents();
      }
    } catch (err) {
      console.error("Failed to create incident:", err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedIncident) return;
    try {
      const res = await api.post(`/incidents/${selectedIncident.id}/notes`, { content: newNote });
      if (res.data.success) {
        setNewNote("");
        selectIncident(selectedIncident);
      }
    } catch (err) {
      console.error("Failed to add note:", err);
    }
  };

  const handleAddEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceDescription.trim() || !selectedIncident) return;
    try {
      const res = await api.post(`/incidents/${selectedIncident.id}/evidence`, {
        type: "LOG_EXTRACT",
        description: evidenceDescription,
        source: evidenceSource,
        reference: `evidence-${Date.now()}`
      });
      if (res.data.success) {
        setEvidenceDescription("");
        selectIncident(selectedIncident);
      }
    } catch (err) {
      console.error("Failed to add evidence:", err);
    }
  };

  const handleExecuteResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmSimulation || !selectedIncident) return;
    setResponseLog("Executing safe response action in simulation mode...");
    try {
      const res = await api.post(`/incidents/${selectedIncident.id}/actions`, {
        action: actionType,
        target: actionTarget,
        reason: actionReason,
        confirmed: true
      });
      if (res.data.success) {
        const log = res.data.data.simulationResult?.auditDetails || "Response simulated successfully.";
        setResponseLog(log);
        setTimeout(() => {
          setShowResponseModal(false);
          setResponseLog(null);
          selectIncident(selectedIncident);
        }, 2000);
      }
    } catch (err: any) {
      setResponseLog(`Error: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleResolveIncident = async () => {
    if (!selectedIncident) return;
    try {
      const res = await api.patch(`/incidents/${selectedIncident.id}`, {
        status: "RESOLVED",
        resolution: "Threat contained & verified via safe response simulation."
      });
      if (res.data.success) {
        fetchIncidents();
      }
    } catch (err) {
      console.error("Failed to resolve incident:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center space-x-2">
            <Siren className="w-5 h-5 text-rose-400" />
            <span>Incident Investigation & Controlled Response</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">SOC Investigation Timeline, Evidence Vault & Safe Response Simulation Framework</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-lg shadow-rose-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Incident Case</span>
        </button>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Incidents List */}
        <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider font-mono">Incident Queue</h3>
          
          <div className="space-y-2">
            {incidents.map((inc) => (
              <button
                key={inc.id}
                onClick={() => selectIncident(inc)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedIncident?.id === inc.id
                    ? "bg-blue-600/10 border-blue-500/50 text-white"
                    : "bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs truncate max-w-[180px]">{inc.title}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                    inc.severity === "CRITICAL" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}>
                    {inc.severity}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center justify-between">
                  <span>Status: <strong className="text-blue-400">{inc.status}</strong></span>
                  <span>{new Date(inc.createdAt).toLocaleDateString()}</span>
                </div>
              </button>
            ))}

            {incidents.length === 0 && (
              <div className="text-xs text-slate-500 font-mono py-8 text-center">No active incidents.</div>
            )}
          </div>
        </div>

        {/* Right 2 Columns: Detailed Investigation Panel */}
        {selectedIncident ? (
          <div className="lg:col-span-2 space-y-6">
            {/* Case Details Card */}
            <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-base text-white">{selectedIncident.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{selectedIncident.description}</p>
                </div>

                <div className="flex items-center space-x-2">
                  {selectedIncident.status !== "RESOLVED" && (
                    <button
                      onClick={() => setShowResponseModal(true)}
                      className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center space-x-1 transition-colors"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Execute Controlled Response</span>
                    </button>
                  )}

                  {selectedIncident.status !== "RESOLVED" ? (
                    <button
                      onClick={handleResolveIncident}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center space-x-1 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Resolve Case</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold rounded">
                      CASE RESOLVED
                    </span>
                  )}
                </div>
              </div>

              {/* Investigation Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">Chronological Investigation Timeline</h4>
                
                <div className="relative pl-6 space-y-4 border-l border-slate-800">
                  {timeline.map((item: any, idx: number) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[31px] top-0.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-[#131b2e]" />
                      <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-white">{item.title}</span>
                          <span className="text-[10px] font-mono text-slate-400">{new Date(item.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-300">{item.description}</p>
                        <div className="text-[10px] font-mono text-blue-400">Author: {item.author || "SOC Analyst"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Note & Evidence Forms Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                {/* Note Form */}
                <form onSubmit={handleAddNote} className="space-y-2">
                  <label className="block text-xs font-mono text-slate-400">Add Analyst Note</label>
                  <input
                    type="text"
                    placeholder="Enter observation notes..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white"
                  />
                  <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-500">
                    Add Note
                  </button>
                </form>

                {/* Evidence Form */}
                <form onSubmit={handleAddEvidence} className="space-y-2">
                  <label className="block text-xs font-mono text-slate-400">Attach Evidence Artifact</label>
                  <input
                    type="text"
                    placeholder="Evidence description..."
                    value={evidenceDescription}
                    onChange={(e) => setEvidenceDescription(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white"
                  />
                  <button type="submit" className="px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded hover:bg-amber-500">
                    Attach Evidence
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-[#131b2e] border border-slate-800 rounded-xl p-12 text-center text-slate-500 font-mono text-xs">
            Select an incident from the queue to view investigation timeline and response tools.
          </div>
        )}
      </div>

      {/* Controlled Response Simulation Modal */}
      {showResponseModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#131b2e] border border-slate-700 rounded-xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Lock className="w-5 h-5 text-amber-400" />
              <span>Controlled Response Execution (SAFE SIMULATION)</span>
            </h3>

            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded text-rose-300 text-xs font-mono flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>SAFETY GUARANTEE: Response operates in strict SAFE_SIMULATION mode. Explicit confirmation is required.</span>
            </div>

            <form onSubmit={handleExecuteResponse} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Response Action Type</label>
                <select value={actionType} onChange={(e) => setActionType(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white">
                  <option value="ISOLATE_TEST_ENDPOINT">ISOLATE_TEST_ENDPOINT</option>
                  <option value="BLOCK_TEST_IP">BLOCK_TEST_IP</option>
                  <option value="DISABLE_TEST_ACCOUNT">DISABLE_TEST_ACCOUNT</option>
                  <option value="ADD_TEST_BLOCKLIST">ADD_TEST_BLOCKLIST</option>
                  <option value="CLOSE_INCIDENT">CLOSE_INCIDENT</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Target Host / IP / Account</label>
                <input type="text" value={actionTarget} onChange={(e) => setActionTarget(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Justification Reason</label>
                <input type="text" value={actionReason} onChange={(e) => setActionReason(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="confirmCheck"
                  checked={confirmSimulation}
                  onChange={(e) => setConfirmSimulation(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-400"
                />
                <label htmlFor="confirmCheck" className="text-white font-semibold cursor-pointer">
                  I explicitly confirm this response simulation request.
                </label>
              </div>

              {responseLog && (
                <div className="p-3 rounded bg-slate-900 border border-slate-700 text-amber-400 font-mono text-[11px]">
                  {responseLog}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowResponseModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700">Cancel</button>
                <button
                  type="submit"
                  disabled={!confirmSimulation}
                  className="px-4 py-2 bg-amber-600 text-white font-semibold rounded hover:bg-amber-500 disabled:opacity-50"
                >
                  Execute Simulation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
