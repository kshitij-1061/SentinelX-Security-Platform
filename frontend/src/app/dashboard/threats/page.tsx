"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Radar, Plus, Terminal, Filter, ShieldAlert, Cpu } from "lucide-react";

export default function ThreatsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"EVENTS" | "RULES">("EVENTS");

  // Ingest Event Form Modal
  const [showIngestModal, setShowIngestModal] = useState(false);
  const [source, setSource] = useState("GENERIC_JSON");
  const [eventType, setEventType] = useState("SSH_BRUTEFORCE");
  const [sourceIP, setSourceIP] = useState("192.168.1.105");
  const [destinationIP, setDestinationIP] = useState("10.0.0.50");
  const [processName, setProcessName] = useState("sshd");
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [evRes, ruRes] = await Promise.all([
        api.get("/events?limit=20"),
        api.get("/detection-rules")
      ]);
      if (evRes.data.success) setEvents(evRes.data.data);
      if (ruRes.data.success) setRules(ruRes.data.data);
    } catch (err) {
      console.error("Failed to load threat detection data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIngestStatus("Ingesting telemetry...");
    try {
      const res = await api.post("/events", {
        source,
        eventType,
        sourceIP,
        destinationIP,
        process: processName,
        rawPayload: {
          timestamp: new Date().toISOString(),
          source_ip: sourceIP,
          destination_ip: destinationIP,
          event_type: eventType,
          process: processName
        }
      });
      if (res.data.success) {
        const alertCount = res.data.data.triggeredAlerts?.length || 0;
        setIngestStatus(`Event ingested successfully! ${alertCount} alert(s) triggered.`);
        fetchData();
        setTimeout(() => {
          setShowIngestModal(false);
          setIngestStatus(null);
        }, 1500);
      }
    } catch (err: any) {
      setIngestStatus(`Error: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center space-x-2">
            <Radar className="w-5 h-5 text-cyan-400" />
            <span>Threat & Network Detection Engine</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">Normalized Security Event Stream & Sigma / Suricata Rule Engine</p>
        </div>

        <button
          onClick={() => setShowIngestModal(true)}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-lg shadow-cyan-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Ingest Telemetry Event</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab("EVENTS")}
          className={`pb-3 text-xs font-mono font-semibold transition-colors flex items-center space-x-2 border-b-2 ${
            activeTab === "EVENTS"
              ? "border-cyan-500 text-cyan-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Normalized Events ({events.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("RULES")}
          className={`pb-3 text-xs font-mono font-semibold transition-colors flex items-center space-x-2 border-b-2 ${
            activeTab === "RULES"
              ? "border-cyan-500 text-cyan-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Detection Rules ({rules.length})</span>
        </button>
      </div>

      {/* Tab 1: Events Stream */}
      {activeTab === "EVENTS" && (
        <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 text-[11px]">
                  <th className="pb-3 font-normal">TIMESTAMP</th>
                  <th className="pb-3 font-normal">SOURCE</th>
                  <th className="pb-3 font-normal">EVENT TYPE</th>
                  <th className="pb-3 font-normal">SOURCE IP</th>
                  <th className="pb-3 font-normal">DESTINATION IP</th>
                  <th className="pb-3 font-normal">PROCESS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 text-slate-400">{new Date(ev.timestamp).toLocaleString()}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-cyan-400 border border-slate-700">
                        {ev.source}
                      </span>
                    </td>
                    <td className="py-2.5 text-white font-semibold">{ev.eventType}</td>
                    <td className="py-2.5 text-slate-300">{ev.sourceIP || "N/A"}</td>
                    <td className="py-2.5 text-slate-300">{ev.destinationIP || "N/A"}</td>
                    <td className="py-2.5 text-amber-400">{ev.process || "system"}</td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500 text-xs">No normalized security events recorded. Click 'Ingest Telemetry Event' to simulate.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Detection Rules */}
      {activeTab === "RULES" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule) => (
            <div key={rule.id} className="bg-[#131b2e] border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-white">{rule.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{rule.description}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  rule.severity === "CRITICAL" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}>
                  {rule.severity}
                </span>
              </div>

              <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-3 bg-slate-900/60 p-2.5 rounded border border-slate-800">
                <span>Source: <strong className="text-cyan-400">{rule.source}</strong></span>
                <span>|</span>
                <span>MITRE: <strong className="text-blue-400">{rule.mitreTechnique || "T1110"}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ingest Telemetry Modal */}
      {showIngestModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#131b2e] border border-slate-700 rounded-xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <span>Simulate Telemetry Event Ingestion</span>
            </h3>

            <form onSubmit={handleIngest} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Source Adapter</label>
                <select value={source} onChange={(e) => setSource(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white">
                  <option value="GENERIC_JSON">GENERIC_JSON</option>
                  <option value="SURICATA">SURICATA</option>
                  <option value="ZEEK">ZEEK</option>
                  <option value="SYSLOG">SYSLOG</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Event Type</label>
                <input type="text" value={eventType} onChange={(e) => setEventType(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Source IP</label>
                  <input type="text" value={sourceIP} onChange={(e) => setSourceIP(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Destination IP</label>
                  <input type="text" value={destinationIP} onChange={(e) => setDestinationIP(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Target Process Name</label>
                <input type="text" value={processName} onChange={(e) => setProcessName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
              </div>

              {ingestStatus && (
                <div className="p-2.5 rounded bg-slate-900 border border-slate-700 text-cyan-400 font-mono text-[11px]">
                  {ingestStatus}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowIngestModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded hover:bg-cyan-500">Ingest Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
