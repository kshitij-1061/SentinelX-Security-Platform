"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { 
  ShieldAlert, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Activity, 
  Server, 
  Layers, 
  Terminal, 
  CheckSquare, 
  Plus, 
  ExternalLink,
  Cpu,
  Globe,
  User,
  Calendar,
  X
} from "lucide-react";

export default function VulnerabilityDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [vulnerability, setVulnerability] = useState<any>(null);
  const [allAssets, setAllAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Link Asset Modal State
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkForm, setLinkForm] = useState({
    assetId: "",
    detectedVersion: "",
    exposure: "INTERNAL",
    notes: ""
  });

  // Create Remediation Task Modal State
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    assetId: "",
    assignedTo: "secops-team@enterprise.lan",
    priority: "HIGH",
    dueDate: "",
    description: ""
  });

  useEffect(() => {
    if (!id) return;
    fetchVulnerabilityDetail();
    fetchAllAssets();
  }, [id]);

  const fetchVulnerabilityDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/vulnerabilities/${id}`);
      if (res.data.success) {
        setVulnerability(res.data.data);
      } else {
        setError("Failed to load vulnerability details.");
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Vulnerability record not found.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAssets = async () => {
    try {
      const res = await api.get("/assets?limit=100");
      if (res.data.success) {
        setAllAssets(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch asset inventory for linking:", err);
    }
  };

  const handleLinkAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post(`/assets/${linkForm.assetId}/vulnerabilities`, {
        vulnerabilityId: id,
        detectedVersion: linkForm.detectedVersion || vulnerability.affectedVersion,
        exposure: linkForm.exposure,
        notes: linkForm.notes
      });
      if (res.data.success) {
        setShowLinkModal(false);
        fetchVulnerabilityDetail();
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || "Failed to link asset.");
    }
  };

  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/remediations", {
        vulnerabilityId: id,
        assetId: taskForm.assetId,
        assignedTo: taskForm.assignedTo,
        priority: taskForm.priority,
        dueDate: taskForm.dueDate || undefined,
        description: taskForm.description || `Remediate ${vulnerability.cve || vulnerability.title} on asset.`
      });
      if (res.data.success) {
        setShowTaskModal(false);
        fetchVulnerabilityDetail();
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || "Failed to create remediation task.");
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
        return <span className="bg-red-950/60 text-red-400 border border-red-800 px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> CRITICAL</span>;
      case "HIGH":
        return <span className="bg-orange-950/60 text-orange-400 border border-orange-800 px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> HIGH</span>;
      case "MEDIUM":
        return <span className="bg-yellow-950/60 text-yellow-400 border border-yellow-800 px-3 py-1 rounded text-xs font-semibold">MEDIUM</span>;
      default:
        return <span className="bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded text-xs font-semibold">LOW</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-400">
        <Activity className="w-6 h-6 animate-spin mr-2 text-cyan-400" />
        <span>Loading vulnerability details...</span>
      </div>
    );
  }

  if (error || !vulnerability) {
    return (
      <div className="p-6">
        <Link href="/dashboard/vulnerabilities" className="inline-flex items-center text-sm text-cyan-400 hover:text-cyan-300 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Vulnerabilities List
        </Link>
        <div className="bg-red-950/30 border border-red-800 text-red-300 p-6 rounded-lg flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-lg text-red-200">Vulnerability Record Error</h3>
            <p className="mt-1 text-sm">{error || "Vulnerability not found."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard/vulnerabilities" className="inline-flex items-center text-xs text-cyan-400 hover:text-cyan-300 mb-2">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Vulnerability Intelligence
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 border border-red-500/30 rounded-lg text-red-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-mono font-bold text-slate-100 flex items-center gap-3">
                {vulnerability.cve || vulnerability.vulnerabilityIdentifier}
              </h1>
              <p className="text-sm font-semibold text-slate-300 mt-0.5">{vulnerability.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded flex items-center gap-2">
              <span className="text-xs text-slate-500">CVSS v3.1:</span>
              <span className="font-mono text-base font-bold text-red-400">{vulnerability.cvssScore.toFixed(1)}</span>
            </div>
            {getSeverityBadge(vulnerability.severity)}
          </div>
        </div>
      </div>

      {/* Main Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Vulnerability Description</h3>
            <p className="text-slate-300 text-sm leading-relaxed">{vulnerability.description}</p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Remediation Guidance
            </h4>
            <p className="text-slate-200 text-xs font-mono">{vulnerability.remediation}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">Technical Attributes</h3>
          <dl className="space-y-3 text-xs">
            <div>
              <dt className="text-slate-500">Affected Software</dt>
              <dd className="font-semibold text-slate-200">{vulnerability.affectedSoftware}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Affected Versions</dt>
              <dd className="font-mono text-cyan-400">{vulnerability.affectedVersion}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Exploitability State</dt>
              <dd className="font-semibold text-orange-400">{vulnerability.exploitability}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Intelligence Source</dt>
              <dd className="text-slate-300">{vulnerability.source || "NVD"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Discovered Date</dt>
              <dd className="text-slate-400">{new Date(vulnerability.discoveredAt).toLocaleString()}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Affected Assets & Risk Scores */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" /> Exposed Assets & Risk Prioritization
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Calculates explainable risk scores combining CVSS, asset criticality, exposure zone, and exploitability.
            </p>
          </div>

          <button
            onClick={() => setShowLinkModal(true)}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-semibold rounded flex items-center gap-1.5 w-max"
          >
            <Plus className="w-3.5 h-3.5" /> Link Asset
          </button>
        </div>

        {(!vulnerability.assets || vulnerability.assets.length === 0) ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No assets currently linked to this vulnerability. Click &quot;Link Asset&quot; to associate an asset from your inventory.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Asset Hostname</th>
                  <th className="px-4 py-3 font-semibold">IP Address</th>
                  <th className="px-4 py-3 font-semibold">Criticality</th>
                  <th className="px-4 py-3 font-semibold">Exposure</th>
                  <th className="px-4 py-3 font-semibold">Risk Score</th>
                  <th className="px-4 py-3 font-semibold">Risk Factors Breakdown</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {vulnerability.assets.map((link: any) => (
                  <tr key={link.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-200">
                      {link.asset.hostname}
                    </td>
                    <td className="px-4 py-3 font-mono text-cyan-400">{link.asset.ipAddress}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-800 border border-slate-700 text-slate-300 font-semibold">
                        {link.asset.criticality}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs bg-purple-950/60 text-purple-400 border border-purple-800 font-semibold">
                        {link.exposure}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded font-mono font-bold text-xs border ${
                        link.riskDetails?.riskScore >= 80 ? "bg-red-950 text-red-400 border-red-800" :
                        link.riskDetails?.riskScore >= 60 ? "bg-orange-950 text-orange-400 border-orange-800" :
                        "bg-yellow-950 text-yellow-400 border-yellow-800"
                      }`}>
                        {link.riskDetails?.riskScore?.toFixed(1) || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400 text-2xs">
                      Crit: x{link.riskDetails?.factors?.criticalityWeight} | Exp: x{link.riskDetails?.factors?.exposureWeight} | Exploit: x{link.riskDetails?.factors?.exploitabilityWeight}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/assets/${link.asset.id}`}
                        className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-medium"
                      >
                        Inspect Asset <ExternalLink className="w-3 h-3 ml-1" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Remediation Tasks */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-400" /> Remediation Tasks ({vulnerability.remediations?.length || 0})
          </h3>
          <button
            disabled={!vulnerability.assets || vulnerability.assets.length === 0}
            onClick={() => {
              if (vulnerability.assets && vulnerability.assets.length > 0) {
                setTaskForm({ ...taskForm, assetId: vulnerability.assets[0].assetId });
                setShowTaskModal(true);
              }
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded flex items-center gap-1.5 disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" /> Assign Remediation Task
          </button>
        </div>

        {(!vulnerability.remediations || vulnerability.remediations.length === 0) ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No remediation tasks currently assigned for this vulnerability.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Assigned To</th>
                  <th className="px-4 py-3 font-semibold">Asset Hostname</th>
                  <th className="px-4 py-3 font-semibold">Priority</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Task Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {vulnerability.remediations.map((task: any) => (
                  <tr key={task.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-semibold text-slate-200">{task.assignedTo}</td>
                    <td className="px-4 py-3 font-mono text-cyan-400">{task.asset?.hostname}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs bg-red-950/50 text-red-400 border border-red-800">
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-mono border ${
                        task.status === "COMPLETED" ? "bg-emerald-950/60 text-emerald-400 border-emerald-800" : "bg-yellow-950/60 text-yellow-400 border-yellow-800"
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{task.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* LINK ASSET MODAL */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" /> Link Asset to Vulnerability
              </h3>
              <button onClick={() => setShowLinkModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLinkAssetSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select Target Asset *</label>
                <select
                  value={linkForm.assetId}
                  onChange={(e) => setLinkForm({ ...linkForm, assetId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  required
                >
                  <option value="">-- Choose Asset --</option>
                  {allAssets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.hostname} ({asset.ipAddress}) - {asset.criticality}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Exposure Zone</label>
                <select
                  value={linkForm.exposure}
                  onChange={(e) => setLinkForm({ ...linkForm, exposure: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="EXTERNAL_FACING">EXTERNAL_FACING (Highest Exposure)</option>
                  <option value="DMZ">DMZ Zone</option>
                  <option value="INTERNAL">INTERNAL Network</option>
                  <option value="AIR_GAPPED">AIR_GAPPED Isolated</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Detected Version</label>
                <input
                  type="text"
                  placeholder={vulnerability.affectedVersion}
                  value={linkForm.detectedVersion}
                  onChange={(e) => setLinkForm({ ...linkForm, detectedVersion: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded"
                >
                  Link & Calculate Risk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" /> Assign Remediation Task
              </h3>
              <button onClick={() => setShowTaskModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Assigned Security Engineer</label>
                <input
                  type="text"
                  value={taskForm.assignedTo}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Remediation Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Task Description</label>
                <textarea
                  rows={3}
                  placeholder="Upgrade software package..."
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded"
                >
                  Create Remediation Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
