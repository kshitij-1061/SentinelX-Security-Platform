"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { GitBranch, Play, ShieldAlert, ArrowRight, Server, ShieldCheck, AlertCircle, Cpu } from "lucide-react";

export default function AttackPathsPage() {
  const [paths, setPaths] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string | null>(null);

  const fetchPaths = async () => {
    try {
      const res = await api.get("/attack-paths");
      if (res.data.success) setPaths(res.data.data);
    } catch (err) {
      console.error("Failed to load attack paths:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaths();
  }, []);

  const handleAnalyzeGraph = async () => {
    setAnalyzing(true);
    setAnalysisStatus("Traversing Graph topology via GraphAnalyzer engine...");
    try {
      const res = await api.post("/attack-paths/analyze");
      if (res.data.success) {
        setAnalysisStatus(`Graph analysis complete! Generated ${res.data.data?.length || 0} potential attack path model(s).`);
        fetchPaths();
        setTimeout(() => setAnalysisStatus(null), 2500);
      }
    } catch (err: any) {
      setAnalysisStatus(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center space-x-2">
            <GitBranch className="w-5 h-5 text-blue-400" />
            <span>Attack Path & Risk Analysis Graph</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">Deterministic Reachability Graph Topology & Explainable Risk Factor Scoring</p>
        </div>

        <button
          onClick={handleAnalyzeGraph}
          disabled={analyzing}
          className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50"
        >
          <Play className="w-4 h-4 text-white" />
          <span>{analyzing ? "Analyzing Topology..." : "Compute Attack Graph"}</span>
        </button>
      </div>

      {/* Mandatory Safety Concept Banner */}
      <div className="p-4 bg-slate-900 border border-blue-500/30 rounded-xl space-y-1 text-xs">
        <div className="flex items-center space-x-2 text-blue-400 font-semibold font-mono">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>IMPORTANT DISAMBIGUATION GUARANTEE:</span>
        </div>
        <p className="text-slate-300">
          <strong>Potential Attack Path:</strong> Represents theoretical reachability based on network exposure and vulnerability topology. It does <em>NOT</em> mean an active attack has occurred.
        </p>
        <p className="text-slate-400 text-[11px]">
          <strong>Observed Attack Activity:</strong> Confirmed telemetry alerts and honeypot probes triggered by actual threat actors.
        </p>
      </div>

      {analysisStatus && (
        <div className="p-3 bg-slate-900 border border-slate-700 text-blue-400 text-xs font-mono rounded-lg">
          {analysisStatus}
        </div>
      )}

      {/* Attack Paths List */}
      <div className="space-y-6">
        {paths.map((p) => {
          const riskExplanation = p.risks && p.risks.length > 0 ? JSON.parse(typeof p.risks[0].explanation === "string" ? p.risks[0].explanation : JSON.stringify(p.risks[0].explanation || {})) : null;

          return (
            <div key={p.id} className="bg-[#131b2e] border border-slate-800 rounded-xl p-6 space-y-4">
              {/* Path Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-semibold text-sm text-white flex items-center space-x-2">
                    <GitBranch className="w-4 h-4 text-blue-400" />
                    <span>{p.name}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{p.description}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-mono">RISK INDEX</div>
                    <div className="text-lg font-bold font-mono text-rose-400">{p.riskScore} / 100</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                    p.severity === "CRITICAL" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}>
                    {p.severity}
                  </span>
                </div>
              </div>

              {/* Graphical Step Nodes Sequence */}
              <div>
                <div className="text-xs font-mono font-semibold text-slate-400 mb-3 uppercase tracking-wider">Lateral Movement Step Topology</div>
                <div className="flex flex-wrap items-center gap-3">
                  {(p.nodes || []).map((node: any, idx: number) => (
                    <div key={node.id || idx} className="flex items-center space-x-3">
                      <div className="p-3 bg-slate-900 border border-slate-700/80 rounded-lg flex items-center space-x-2 text-xs">
                        <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-mono font-bold text-[10px]">
                          {node.stepIndex}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{node.label}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{node.nodeType}</div>
                        </div>
                      </div>

                      {idx < (p.nodes.length - 1) && (
                        <ArrowRight className="w-4 h-4 text-blue-400 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Explainable Factor Breakdown */}
              {riskExplanation && (
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg text-xs space-y-2 font-mono">
                  <div className="text-slate-300 font-bold text-[11px] uppercase tracking-wider text-blue-400">Explainable Factor Breakdown</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400">
                    <div>Criticality Factor: <strong className="text-white">{riskExplanation.criticalityFactor || 1.5}x</strong></div>
                    <div>Vulnerability Factor: <strong className="text-white">{riskExplanation.vulnerabilityFactor || 1.3}x</strong></div>
                    <div>Exposure Factor: <strong className="text-white">{riskExplanation.exposureFactor || 1.4}x</strong></div>
                    <div>Alert Evidence Factor: <strong className="text-white">{riskExplanation.alertEvidenceFactor || 1.2}x</strong></div>
                  </div>
                  <p className="text-slate-400 text-[11px] italic">{riskExplanation.reason}</p>
                </div>
              )}
            </div>
          );
        })}

        {paths.length === 0 && (
          <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-8 text-center text-slate-500 font-mono text-xs">
            No attack paths computed yet. Click 'Compute Attack Graph' above to analyze topology reachability.
          </div>
        )}
      </div>
    </div>
  );
}
