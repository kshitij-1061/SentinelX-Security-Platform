"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { 
  Server, 
  Bug, 
  Network, 
  Siren, 
  ShieldCheck, 
  Activity, 
  Clock, 
  Flame,
  GitBranch,
  ArrowUpRight,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell 
} from "recharts";

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [sumRes, anaRes, auditRes] = await Promise.all([
          api.get("/dashboard/summary"),
          api.get("/dashboard/analytics"),
          api.get("/audit-logs/?limit=8")
        ]);

        if (sumRes.data.success) setSummary(sumRes.data.data);
        if (anaRes.data.success) setAnalytics(anaRes.data.data);
        if (auditRes.data.success) setAuditLogs(auditRes.data.data);
      } catch (err) {
        console.error("Error loading SOC dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const SEVERITY_COLORS: Record<string, string> = {
    CRITICAL: "#f43f5e",
    HIGH: "#f97316",
    MEDIUM: "#eab308",
    LOW: "#3b82f6"
  };

  return (
    <div className="space-y-6">
      {/* Title & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-blue-400" />
            <span>Security Command Center</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">Unified Threat Intelligence & Attack Path Risk Analysis Platform</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/attack-paths"
            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-lg shadow-blue-600/20"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Attack Topology</span>
          </Link>
          <div className="bg-[#131b2e] border border-slate-800 px-3 py-1.5 rounded-lg flex items-center space-x-2 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">SOC ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Assets */}
        <Link href="/dashboard/assets" className="bg-[#131b2e] border border-slate-800 hover:border-blue-500/50 rounded-xl p-4 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Total Assets</span>
            <Server className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{summary?.metrics?.totalAssets ?? 0}</div>
          <div className="mt-2 text-[10px] text-slate-500 font-mono flex items-center space-x-1">
            <span>Critical: {summary?.metrics?.criticalAssets ?? 0}</span>
          </div>
        </Link>

        {/* Card 2: Vulnerabilities */}
        <Link href="/dashboard/vulnerabilities" className="bg-[#131b2e] border border-slate-800 hover:border-amber-500/50 rounded-xl p-4 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Vulnerabilities</span>
            <Bug className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{summary?.metrics?.totalVulnerabilities ?? 0}</div>
          <div className="mt-2 text-[10px] text-amber-400 font-mono">
            High/Critical CVEs
          </div>
        </Link>

        {/* Card 3: Detection Alerts */}
        <Link href="/dashboard/alerts" className="bg-[#131b2e] border border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Active Alerts</span>
            <Network className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{summary?.metrics?.totalAlerts ?? 0}</div>
          <div className="mt-2 text-[10px] text-cyan-400 font-mono">
            Correlated Groups: {summary?.metrics?.correlationGroups ?? 0}
          </div>
        </Link>

        {/* Card 4: Honeypot Traps */}
        <Link href="/dashboard/honeypots" className="bg-[#131b2e] border border-slate-800 hover:border-orange-500/50 rounded-xl p-4 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Honeypots</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{summary?.metrics?.activeHoneypots ?? 0}</div>
          <div className="mt-2 text-[10px] text-orange-400 font-mono">
            Events Trapped: {summary?.metrics?.honeypotEvents ?? 0}
          </div>
        </Link>

        {/* Card 5: Incidents */}
        <Link href="/dashboard/incidents" className="bg-[#131b2e] border border-slate-800 hover:border-rose-500/50 rounded-xl p-4 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Open Incidents</span>
            <Siren className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{summary?.metrics?.openIncidents ?? 0}</div>
          <div className="mt-2 text-[10px] text-rose-400 font-mono">
            Safe Simulation Mode
          </div>
        </Link>
      </div>

      {/* Analytics Charts & Threat Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Events vs Alerts Trend */}
        <div className="lg:col-span-2 bg-[#131b2e] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Security Event Ingestion & Alert Generation</h3>
              <p className="text-[11px] text-slate-400 font-mono">24-Hour Telemetry Processing Rate</p>
            </div>
            <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">REALTIME</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.eventTrend || [
                { time: "00:00", events: 120, alerts: 4 },
                { time: "04:00", events: 80, alerts: 2 },
                { time: "08:00", events: 250, alerts: 15 },
                { time: "12:00", events: 410, alerts: 28 },
                { time: "16:00", events: 380, alerts: 20 },
                { time: "20:00", events: 190, alerts: 8 }
              ]}>
                <defs>
                  <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }} />
                <Area type="monotone" dataKey="events" stroke="#3b82f6" fillOpacity={1} fill="url(#colorEvents)" name="Events Ingested" />
                <Area type="monotone" dataKey="alerts" stroke="#f43f5e" fillOpacity={1} fill="url(#colorAlerts)" name="Detection Alerts" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Alert Severity Breakdown</h3>
              <p className="text-[11px] text-slate-400 font-mono">Current Active Queue</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.severityDistribution || [
                { severity: "CRITICAL", count: summary?.metrics?.criticalAlerts || 3 },
                { severity: "HIGH", count: 8 },
                { severity: "MEDIUM", count: 14 },
                { severity: "LOW", count: 5 }
              ]}>
                <XAxis dataKey="severity" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {(analytics?.severityDistribution || [
                    { severity: "CRITICAL", count: 3 },
                    { severity: "HIGH", count: 8 },
                    { severity: "MEDIUM", count: 14 },
                    { severity: "LOW", count: 5 }
                  ]).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.severity] || "#3b82f6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Target Assets & Incidents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High Risk Assets Panel */}
        <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">High Value Target Assets</h3>
            </div>
            <Link href="/dashboard/assets" className="text-xs text-blue-400 hover:underline flex items-center space-x-1">
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {(summary?.topTargetAssets || []).slice(0, 4).map((a: any) => (
              <div key={a.id} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-white flex items-center space-x-2">
                    <span>{a.hostname}</span>
                    <span className="text-[10px] font-mono text-slate-400">({a.ipAddress})</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Env: <span className="text-slate-300 font-mono">{a.environment}</span> | Criticality: <span className="text-rose-400 font-semibold font-mono">{a.criticality}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {a.vulnerabilities?.length || 0} CVEs
                  </span>
                </div>
              </div>
            ))}
            {(!summary?.topTargetAssets || summary?.topTargetAssets.length === 0) && (
              <div className="text-xs text-slate-500 font-mono py-4 text-center">No high-risk assets recorded yet.</div>
            )}
          </div>
        </div>

        {/* Active Open Incidents */}
        <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Siren className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-semibold text-white">Active Security Incidents</h3>
            </div>
            <Link href="/dashboard/incidents" className="text-xs text-blue-400 hover:underline flex items-center space-x-1">
              <span>Investigation Workspace</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {(summary?.recentIncidents || []).slice(0, 4).map((inc: any) => (
              <div key={inc.id} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-white">{inc.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Assigned: <span className="text-slate-300">{inc.assignedAnalyst || "Unassigned"}</span> | Status: <span className="text-blue-400 font-mono font-semibold">{inc.status}</span>
                  </div>
                </div>
                <div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    inc.severity === "CRITICAL" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}>
                    {inc.severity}
                  </span>
                </div>
              </div>
            ))}
            {(!summary?.recentIncidents || summary?.recentIncidents.length === 0) && (
              <div className="text-xs text-slate-500 font-mono py-4 text-center">No open security incidents.</div>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Audit Stream Panel */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-sm text-white">SOC Telemetry & Audit Stream</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">IMMUTABLE LOGS</span>
        </div>

        {auditLogs.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs font-mono">No audit trail entries recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 text-[11px]">
                  <th className="pb-2 font-normal">TIMESTAMP</th>
                  <th className="pb-2 font-normal">ACTION</th>
                  <th className="pb-2 font-normal">STATUS</th>
                  <th className="pb-2 font-normal">RESOURCE</th>
                  <th className="pb-2 font-normal">IP ADDRESS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 text-slate-400 flex items-center space-x-1.5">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </td>
                    <td className="py-2 font-semibold text-blue-400">{log.action}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        log.status === "SUCCESS" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2 text-slate-300">{log.resource || "System"}</td>
                    <td className="py-2 text-slate-400">{log.ipAddress || log.ip_address || "127.0.0.1"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
