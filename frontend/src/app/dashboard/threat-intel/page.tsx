"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { FileText, Search, ShieldCheck, Tag, Info, Database } from "lucide-react";

export default function ThreatIntelPage() {
  const [indicators, setIndicators] = useState<any[]>([]);
  const [techniques, setTechniques] = useState<any[]>([]);
  const [iocQuery, setIocQuery] = useState("198.51.100.45");
  const [enrichResult, setEnrichResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [indRes, techRes] = await Promise.all([
        api.get("/threat-intelligence"),
        api.get("/techniques")
      ]);
      if (indRes.data.success) setIndicators(indRes.data.data);
      if (techRes.data.success) setTechniques(techRes.data.data);
    } catch (err) {
      console.error("Failed to load threat intel data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEnrichLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!iocQuery.trim()) return;
    try {
      const res = await api.get(`/threat-intelligence/enrich?ioc=${encodeURIComponent(iocQuery)}`);
      if (res.data.success) {
        setEnrichResult(res.data.data);
      }
    } catch (err) {
      console.error("Failed to enrich IOC:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>Threat Intelligence & MITRE ATT&CK Matrix</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">IOC Reputation Lookup, Threat Actor Attribution & Tactic Mapping</p>
        </div>
      </div>

      {/* IOC Lookup Tool */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-sm text-white flex items-center space-x-2">
          <Search className="w-4 h-4 text-blue-400" />
          <span>Real-time Threat Indicator Enrichment</span>
        </h3>

        <form onSubmit={handleEnrichLookup} className="flex gap-3 text-xs font-mono">
          <input
            type="text"
            placeholder="Enter IP, domain, or file hash to enrich (e.g. 198.51.100.45)..."
            value={iocQuery}
            onChange={(e) => setIocQuery(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded p-2.5 text-white placeholder-slate-500"
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded font-semibold transition-colors">
            Enrich IOC
          </button>
        </form>

        {enrichResult && (
          <div className="p-4 bg-slate-900/80 border border-slate-700/80 rounded-lg space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">{enrichResult.iocValue}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] ${enrichResult.matched ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-slate-800 text-slate-400"}`}>
                {enrichResult.matched ? "MATCHED THREAT INTEL" : "UNMATCHED"}
              </span>
            </div>

            {enrichResult.matched ? (
              <div className="space-y-1 text-slate-300">
                <div>Type: <strong className="text-blue-400">{enrichResult.type}</strong> | Source: <strong className="text-cyan-400">{enrichResult.source}</strong></div>
                <div>Confidence Score: <strong className="text-emerald-400">{(enrichResult.confidence * 100).toFixed(0)}%</strong></div>
                <p className="text-slate-400 mt-1">{enrichResult.description}</p>
              </div>
            ) : (
              <p className="text-slate-400">{enrichResult.message}</p>
            )}
          </div>
        )}
      </div>

      {/* MITRE ATT&CK Techniques Grid */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-sm text-white flex items-center space-x-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <span>MITRE ATT&CK Enterprise Matrix Techniques</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {techniques.map((t) => (
            <div key={t.id} className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-400">{t.techniqueId}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                  {t.tactic}
                </span>
              </div>
              <h4 className="font-semibold text-xs text-white">{t.name}</h4>
              <p className="text-[11px] text-slate-400">{t.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
