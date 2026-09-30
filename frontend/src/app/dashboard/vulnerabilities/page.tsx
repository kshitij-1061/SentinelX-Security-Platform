"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Plus, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Activity, 
  FileCode, 
  FileSpreadsheet,
  X,
  ExternalLink,
  Layers,
  ArrowUpDown
} from "lucide-react";

export default function VulnerabilitiesPage() {
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Import State
  const [importFormat, setImportFormat] = useState<"json" | "csv">("json");
  const [importPayload, setImportPayload] = useState("");
  const [importStats, setImportStats] = useState<any>(null);

  // Create Form State
  const [newVuln, setNewVuln] = useState({
    cve: "",
    title: "",
    description: "",
    severity: "CRITICAL",
    cvssScore: "9.0",
    affectedSoftware: "",
    affectedVersion: "",
    exploitability: "HIGH",
    remediation: ""
  });
  const [formError, setFormError] = useState<string | null>(null);

  const fetchVulnerabilities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "10");
      if (search) params.append("search", search);
      if (severity) params.append("severity", severity);
      if (status) params.append("status", status);

      const [listRes, summaryRes] = await Promise.all([
        api.get(`/vulnerabilities?${params.toString()}`),
        api.get("/vulnerabilities/summary")
      ]);

      if (listRes.data.success) {
        setVulnerabilities(listRes.data.data);
        setMeta(listRes.data.meta);
      }
      if (summaryRes.data.success) {
        setSummary(summaryRes.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch vulnerabilities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVulnerabilities();
  }, [page, search, severity, status]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      const cvss = parseFloat(newVuln.cvssScore);
      if (isNaN(cvss) || cvss < 0 || cvss > 10) {
        setFormError("CVSS score must be a number between 0.0 and 10.0");
        return;
      }

      if (newVuln.cve && !/^CVE-\d{4}-\d{4,7}$/i.test(newVuln.cve)) {
        setFormError("Invalid CVE format. Format must be CVE-YYYY-NNNN+ (e.g. CVE-2023-38606)");
        return;
      }

      const res = await api.post("/vulnerabilities", {
        cve: newVuln.cve || undefined,
        title: newVuln.title,
        description: newVuln.description,
        severity: newVuln.severity,
        cvssScore: cvss,
        affectedSoftware: newVuln.affectedSoftware,
        affectedVersion: newVuln.affectedVersion,
        exploitability: newVuln.exploitability,
        remediation: newVuln.remediation
      });

      if (res.data.success) {
        setShowCreateModal(false);
        setNewVuln({
          cve: "",
          title: "",
          description: "",
          severity: "CRITICAL",
          cvssScore: "9.0",
          affectedSoftware: "",
          affectedVersion: "",
          exploitability: "HIGH",
          remediation: ""
        });
        fetchVulnerabilities();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.error?.message || "Failed to create vulnerability record.");
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportStats(null);
    try {
      let parsedPayload: any = importPayload;
      if (importFormat === "json") {
        parsedPayload = JSON.parse(importPayload);
      }

      const res = await api.post("/vulnerabilities/import", {
        format: importFormat,
        payload: parsedPayload
      });

      if (res.data.success) {
        setImportStats(res.data.data);
        fetchVulnerabilities();
      }
    } catch (err: any) {
      setImportStats({
        failed: 1,
        errors: [err.response?.data?.error?.message || "Invalid import payload structure."]
      });
    }
  };

  const loadSampleImport = () => {
    if (importFormat === "json") {
      setImportPayload(JSON.stringify([
        {
          cve: "CVE-2023-38606",
          title: "macOS Kernel Memory Corruption Pointer Authentication Bypass",
          description: "An issue in kernel memory pointer authentication check allowing local privilege escalation.",
          severity: "CRITICAL",
          cvssScore: 9.3,
          affectedSoftware: "macOS Kernel",
          affectedVersion: "< 13.5",
          remediation: "Apply Apple Security Update macOS Ventura 13.5 or macOS Sonoma 14.0."
        }
      ], null, 2));
    } else {
      setImportPayload(`cve,title,description,severity,cvssScore,affectedSoftware,affectedVersion,remediation
CVE-2023-38606,macOS Kernel Privilege Escalation,Memory corruption flaw in kernel,CRITICAL,9.3,macOS Kernel,< 13.5,Update macOS to 13.5`);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
        return <span className="bg-red-950/60 text-red-400 border border-red-800 px-2.5 py-0.5 rounded text-xs font-semibold flex items-center gap-1.5 w-max"><ShieldAlert className="w-3.5 h-3.5" /> CRITICAL</span>;
      case "HIGH":
        return <span className="bg-orange-950/60 text-orange-400 border border-orange-800 px-2.5 py-0.5 rounded text-xs font-semibold flex items-center gap-1.5 w-max"><AlertTriangle className="w-3.5 h-3.5" /> HIGH</span>;
      case "MEDIUM":
        return <span className="bg-yellow-950/60 text-yellow-400 border border-yellow-800 px-2.5 py-0.5 rounded text-xs font-semibold w-max">MEDIUM</span>;
      default:
        return <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded text-xs font-semibold w-max">LOW</span>;
    }
  };

  const getCvssBadge = (score: number) => {
    let colorClass = "bg-slate-800 text-slate-300 border-slate-700";
    if (score >= 9.0) colorClass = "bg-red-950/80 text-red-300 border-red-800";
    else if (score >= 7.0) colorClass = "bg-orange-950/80 text-orange-300 border-orange-800";
    else if (score >= 4.0) colorClass = "bg-yellow-950/80 text-yellow-300 border-yellow-800";

    return (
      <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${colorClass}`}>
        {score.toFixed(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-mono font-bold text-slate-100 flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-red-400" />
            Vulnerability & Exposure Management
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Correlate software assets with CVE intelligence, evaluate explainable risk scores, and manage remediation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { setShowImportModal(true); setImportStats(null); }}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4 text-cyan-400" /> Import CVEs (JSON/CSV)
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-cyan-950/50"
          >
            <Plus className="w-4 h-4" /> Add Vulnerability
          </button>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Total CVE Records</p>
            <p className="text-2xl font-mono font-bold text-slate-100 mt-1">{summary?.total || 0}</p>
          </div>
          <div className="p-3 bg-slate-800/60 text-slate-300 rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Critical Severity</p>
            <p className="text-2xl font-mono font-bold text-red-400 mt-1">{summary?.bySeverity?.critical || 0}</p>
          </div>
          <div className="p-3 bg-red-950/40 text-red-400 rounded-lg border border-red-900/50">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">High Severity</p>
            <p className="text-2xl font-mono font-bold text-orange-400 mt-1">{summary?.bySeverity?.high || 0}</p>
          </div>
          <div className="p-3 bg-orange-950/40 text-orange-400 rounded-lg border border-orange-900/50">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Open vs Mitigated</p>
            <p className="text-2xl font-mono font-bold text-emerald-400 mt-1">
              {summary?.byStatus?.open || 0} / <span className="text-slate-400">{summary?.byStatus?.mitigated + summary?.byStatus?.resolved || 0}</span>
            </p>
          </div>
          <div className="p-3 bg-emerald-950/40 text-emerald-400 rounded-lg border border-emerald-900/50">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search CVE, Title, Software..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </div>
          <select
            value={severity}
            onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="MITIGATED">MITIGATED</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>
        </div>
      </div>

      {/* Vulnerabilities Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <Activity className="w-5 h-5 animate-spin text-cyan-400" />
            <span>Loading vulnerability records...</span>
          </div>
        ) : vulnerabilities.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No vulnerabilities found matching specified filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">CVE / Identifier</th>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">CVSS</th>
                  <th className="px-4 py-3 font-semibold">Severity</th>
                  <th className="px-4 py-3 font-semibold">Affected Software</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {vulnerabilities.map((vuln) => (
                  <tr key={vuln.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono font-semibold text-cyan-400">
                      {vuln.cve || vuln.vulnerabilityIdentifier}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-200 max-w-xs truncate">
                      {vuln.title}
                    </td>
                    <td className="px-4 py-3">
                      {getCvssBadge(vuln.cvssScore)}
                    </td>
                    <td className="px-4 py-3">
                      {getSeverityBadge(vuln.severity)}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">
                      {vuln.affectedSoftware} ({vuln.affectedVersion})
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs border font-mono ${
                        vuln.status === "OPEN" ? "bg-red-950/40 text-red-400 border-red-900" :
                        vuln.status === "IN_PROGRESS" ? "bg-yellow-950/40 text-yellow-400 border-yellow-900" :
                        "bg-emerald-950/40 text-emerald-400 border-emerald-900"
                      }`}>
                        {vuln.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/vulnerabilities/${vuln.id}`}
                        className="inline-flex items-center text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                      >
                        Inspect <ExternalLink className="w-3 h-3 ml-1" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing page {meta.page} of {meta.totalPages} ({meta.total} records)</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 bg-slate-800 rounded hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-slate-800"
            >
              Previous
            </button>
            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 bg-slate-800 rounded hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-slate-800"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-xl w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" /> Add New Vulnerability (CVE)
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 text-xs rounded">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">CVE ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="CVE-2023-38606"
                    value={newVuln.cve}
                    onChange={(e) => setNewVuln({ ...newVuln, cve: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">CVSS Score (0.0 - 10.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={newVuln.cvssScore}
                    onChange={(e) => setNewVuln({ ...newVuln, cvssScore: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Title *</label>
                <input
                  type="text"
                  placeholder="Remote Code Execution Flaw..."
                  value={newVuln.title}
                  onChange={(e) => setNewVuln({ ...newVuln, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description *</label>
                <textarea
                  rows={3}
                  placeholder="Detailed description of technical flaw..."
                  value={newVuln.description}
                  onChange={(e) => setNewVuln({ ...newVuln, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Severity</label>
                  <select
                    value={newVuln.severity}
                    onChange={(e) => setNewVuln({ ...newVuln, severity: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Exploitability State</label>
                  <select
                    value={newVuln.exploitability}
                    onChange={(e) => setNewVuln({ ...newVuln, exploitability: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="HIGH">HIGH (Active Exploits)</option>
                    <option value="FUNCTIONAL">FUNCTIONAL (POC Available)</option>
                    <option value="PROOF_OF_CONCEPT">PROOF_OF_CONCEPT</option>
                    <option value="UNPROVEN">UNPROVEN</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Affected Software *</label>
                  <input
                    type="text"
                    placeholder="Apache Log4j"
                    value={newVuln.affectedSoftware}
                    onChange={(e) => setNewVuln({ ...newVuln, affectedSoftware: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Affected Version *</label>
                  <input
                    type="text"
                    placeholder="< 2.15.0"
                    value={newVuln.affectedVersion}
                    onChange={(e) => setNewVuln({ ...newVuln, affectedVersion: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Remediation Guidance *</label>
                <input
                  type="text"
                  placeholder="Upgrade software package to version..."
                  value={newVuln.remediation}
                  onChange={(e) => setNewVuln({ ...newVuln, remediation: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded"
                >
                  Create Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-xl w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Upload className="w-4 h-4 text-cyan-400" /> Import Vulnerability Intelligence
              </h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium border-b border-slate-800 pb-2">
              <button
                onClick={() => setImportFormat("json")}
                className={`flex items-center gap-1.5 pb-1 border-b-2 ${
                  importFormat === "json" ? "border-cyan-500 text-cyan-400" : "border-transparent text-slate-400"
                }`}
              >
                <FileCode className="w-4 h-4" /> JSON Payload
              </button>
              <button
                onClick={() => setImportFormat("csv")}
                className={`flex items-center gap-1.5 pb-1 border-b-2 ${
                  importFormat === "csv" ? "border-cyan-500 text-cyan-400" : "border-transparent text-slate-400"
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" /> CSV Raw Text
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <label className="text-slate-400">Input Text Data</label>
                <button
                  type="button"
                  onClick={loadSampleImport}
                  className="text-cyan-400 hover:underline text-xs"
                >
                  Load Sample Data
                </button>
              </div>

              <textarea
                rows={8}
                placeholder={importFormat === "json" ? '[ { "cve": "CVE-2023-38606", "title": "...", "cvssScore": 9.3, ... } ]' : "cve,title,description,severity,cvssScore,affectedSoftware,affectedVersion,remediation\nCVE-2023-38606,Sample,Description,CRITICAL,9.3,macOS,<13.5,Update"}
                value={importPayload}
                onChange={(e) => setImportPayload(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                required
              />

              {importStats && (
                <div className={`p-3 rounded border text-xs ${
                  importStats.failed > 0 ? "bg-red-950/40 border-red-800 text-red-300" : "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                }`}>
                  <p className="font-semibold">Import Finished:</p>
                  <p>Created: {importStats.created || 0} | Updated: {importStats.updated || 0} | Failed: {importStats.failed || 0}</p>
                  {importStats.errors && importStats.errors.length > 0 && (
                    <ul className="mt-1 list-disc list-inside text-red-400">
                      {importStats.errors.map((err: string, idx: number) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded font-medium"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded"
                >
                  Run Bulk Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
