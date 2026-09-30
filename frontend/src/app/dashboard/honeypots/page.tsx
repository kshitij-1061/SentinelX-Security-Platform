"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Flame, Plus, ShieldAlert, Play, Lock, Terminal } from "lucide-react";

export default function HoneypotsPage() {
  const [honeypots, setHoneypots] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate Deception Attack Modal
  const [selectedHp, setSelectedHp] = useState<any>(null);
  const [attackerIp, setAttackerIp] = useState("198.51.100.44");
  const [usernameAttempt, setUsernameAttempt] = useState("admin");
  const [commandAttempt, setCommandAttempt] = useState("cat /etc/shadow");
  const [simStatus, setSimStatus] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [hpRes, evRes] = await Promise.all([
        api.get("/honeypots"),
        api.get("/honeypot-events")
      ]);
      if (hpRes.data.success) setHoneypots(hpRes.data.data);
      if (evRes.data.success) setEvents(evRes.data.data);
    } catch (err) {
      console.error("Failed to load deception data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSimulateAttack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHp) return;
    setSimStatus("Launching safe lab deception simulation...");

    try {
      const res = await api.post("/honeypot-events", {
        honeypotId: selectedHp.id,
        sourceIP: attackerIp,
        eventType: "UNAUTHORIZED_TRAP_INTERACTION",
        username: usernameAttempt,
        commandData: commandAttempt
      });

      if (res.data.success) {
        setSimStatus("Simulated attack recorded safely! Redacted credential hash generated.");
        fetchData();
        setTimeout(() => {
          setSelectedHp(null);
          setSimStatus(null);
        }, 1500);
      }
    } catch (err: any) {
      setSimStatus(`Error: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center space-x-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <span>Deception & Honeypot Management</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">Controlled Lab Deception Traps & Credential-Leak Free Telemetry Pipeline</p>
        </div>
      </div>

      {/* Honeypot Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {honeypots.map((hp) => (
          <div key={hp.id} className="bg-[#131b2e] border border-slate-800 rounded-xl p-5 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <h4 className="font-semibold text-sm text-white">{hp.name}</h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold">
                {hp.status}
              </span>
            </div>

            <p className="text-xs text-slate-400">{hp.description}</p>

            <div className="text-[11px] font-mono text-slate-300 bg-slate-900/60 p-2.5 rounded border border-slate-800 space-y-1">
              <div>Type: <span className="text-orange-400 font-bold">{hp.type}</span></div>
              <div>Host: <span className="text-slate-400">{hp.hostname}</span></div>
              <div>Binding: <span className="text-blue-400">{hp.ip}:{hp.port}</span></div>
            </div>

            <button
              onClick={() => setSelectedHp(hp)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-1.5 rounded text-xs font-mono flex items-center justify-center space-x-1.5 transition-colors border border-slate-700"
            >
              <Play className="w-3 h-3 text-orange-400" />
              <span>Simulate Attack Probe</span>
            </button>
          </div>
        ))}
      </div>

      {/* Deception Events Log Table */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-orange-400" />
            <h3 className="font-semibold text-sm text-white">Trapped Deception Interaction Logs</h3>
          </div>
          <span className="text-[10px] font-mono text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded">SAFE LAB LOGS</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 text-[11px]">
                <th className="pb-3 font-normal">TIMESTAMP</th>
                <th className="pb-3 font-normal">ATTACKER IP</th>
                <th className="pb-3 font-normal">SERVICE</th>
                <th className="pb-3 font-normal">TARGET USER</th>
                <th className="pb-3 font-normal">COMMAND DATA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {events.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 text-slate-400">{new Date(ev.timestamp).toLocaleString()}</td>
                  <td className="py-2.5 text-rose-400 font-semibold">{ev.sourceIP}</td>
                  <td className="py-2.5 text-orange-400">{ev.service}</td>
                  <td className="py-2.5 text-slate-300">{ev.username || "root"}</td>
                  <td className="py-2.5 text-amber-300 truncate max-w-xs">{ev.commandData || ev.requestData || "PROBE"}</td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500 text-xs">No deception trap events logged yet. Click 'Simulate Attack Probe' above.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attack Simulation Modal */}
      {selectedHp && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#131b2e] border border-slate-700 rounded-xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <span>Simulate Attack on '{selectedHp.name}'</span>
            </h3>

            <form onSubmit={handleSimulateAttack} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Simulated Attacker Source IP</label>
                <input type="text" value={attackerIp} onChange={(e) => setAttackerIp(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Target Account Username</label>
                <input type="text" value={usernameAttempt} onChange={(e) => setUsernameAttempt(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Attempted Command</label>
                <input type="text" value={commandAttempt} onChange={(e) => setCommandAttempt(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded text-amber-300 text-[11px] flex items-center space-x-2">
                <Lock className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Deception Guarantee: Plain-text passwords are strictly SHA-256 redacted before DB entry.</span>
              </div>

              {simStatus && (
                <div className="p-2.5 rounded bg-slate-900 border border-slate-700 text-orange-400 font-mono text-[11px]">
                  {simStatus}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setSelectedHp(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-orange-600 text-white font-semibold rounded hover:bg-orange-500">Execute Safe Probe</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
