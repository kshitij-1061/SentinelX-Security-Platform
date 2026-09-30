"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { 
  Server, 
  Search, 
  Filter, 
  Upload, 
  Radar, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  X,
  FileCode,
  Layers,
  HardDrive
} from "lucide-react";

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState("");
  const [assetType, setAssetType] = useState("");
  const [criticality, setCriticality] = useState("");
  const [status, setStatus] = useState("");
  const [environment, setEnvironment] = useState("");
  const [page, setPage] = useState(1);

  // Modal States
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [importResult, setImportResult] = useState<any>(null);
  const [discoveryStatus, setDiscoveryStatus] = useState<string | null>(null);

  // New Asset Form
  const [newAsset, setNewAsset] = useState({
    hostname: "",
    ipAddress: "",
    macAddress: "",
    assetType: "SERVER",
    operatingSystem: "",
    operatingSystemVersion: "",
    environment: "PRODUCTION",
    criticality: "MEDIUM",
    owner: "",
    department: "",
    location: ""
  });

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "10");
      if (search) params.append("search", search);
      if (assetType) params.append("assetType", assetType);
      if (criticality) params.append("criticality", criticality);
      if (status) params.append("status", status);
      if (environment) params.append("environment", environment);

      const [assetsRes, metricsRes] = await Promise.all([
        api.get(`/assets?${params.toString()}`),
        api.get("/assets/metrics")
      ]);

      if (assetsRes.data.success) {
        setAssets(assetsRes.data.data);
        setMeta(assetsRes.data.meta);
      }
      if (metricsRes.data.success) {
        setMetrics(metricsRes.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch assets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [page, search, assetType, criticality, status, environment]);

  const handleRunDiscovery = async () => {
    setDiscoveryStatus("Executing controlled lab asset probe (Subnet: 192.168.1.0/24)...");
    try {
      const res = await api.post("/assets/discovery", {
        provider: "MOCK",
        targetSubnet: "192.168.1.0/24"
      });
      if (res.data.success) {
        setDiscoveryStatus(`Lab probe complete! Discovered ${res.data.data.totalDiscovered} assets (${res.data.data.newAssetsCreated} new created, ${res.data.data.existingAssetsUpdated} updated).`);
        fetchAssets();
      }
    } catch (err: any) {
      setDiscoveryStatus(err.response?.data?.error?.message || "Discovery probe failed.");
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportResult(null);
    try {
      const parsedRecords = JSON.parse(importJson);
      const res = await api.post("/assets/import", { records: Array.isArray(parsedRecords) ? parsedRecords : [parsedRecords] });
      if (res.data.success) {
        setImportResult(res.data.data);
        fetchAssets();
      }
    } catch (err: any) {
      setImportResult({ error: err.message || "Invalid JSON syntax provided." });
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/assets", newAsset);
      if (res.data.success) {
        setShowCreateModal(false);
        setNewAsset({
          hostname: "",
          ipAddress: "",
          macAddress: "",
          assetType: "SERVER",
          operatingSystem: "",
          operatingSystemVersion: "",
          environment: "PRODUCTION",
          criticality: "MEDIUM",
          owner: "",
          department: "",
          location: ""
        });
        fetchAssets();
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || "Failed to create asset.");
    }
  };

  const getCriticalityBadge = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      case "HIGH":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "MEDIUM":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Enterprise Asset Inventory</h2>
          <p className="text-xs text-slate-400 font-mono mt-1">Module 1: Infrastructure Visibility, Discovery & Topology Foundation</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRunDiscovery}
            className="flex items-center space-x-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors"
          >
            <Radar className="w-4 h-4" />
            <span>Run Lab Discovery Probe</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Import JSON</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-lg text-xs font-medium transition-colors shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {/* Discovery Status Banner */}
      {discoveryStatus && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center justify-between text-xs text-blue-400 font-mono">
          <div className="flex items-center space-x-2">
            <Radar className="w-4 h-4 animate-spin shrink-0" />
            <span>{discoveryStatus}</span>
          </div>
          <button onClick={() => setDiscoveryStatus(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Cards Grid */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
              <span>TOTAL INVENTORY</span>
              <Server className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">{metrics.total}</div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">{metrics.active} Systems Active</div>
          </div>

          <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
              <span>CRITICAL ASSETS</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-rose-400 font-mono">{metrics.critical}</div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">Crown-Jewel Tier</div>
          </div>

          <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
              <span>DECOYS & HONEYPOTS</span>
              <Layers className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400 font-mono">{metrics.honeypots}</div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">Deception Layer</div>
          </div>

          <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
              <span>ACTIVE STATUS</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">
              {metrics.total > 0 ? Math.round((metrics.active / metrics.total) * 100) : 0}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">Operational Uptime</div>
          </div>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search Hostname, IP, OS, Owner..."
              className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Asset Type Filter */}
          <select
            value={assetType}
            onChange={(e) => { setAssetType(e.target.value); setPage(1); }}
            className="bg-[#0b0f17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Asset Types</option>
            <option value="SERVER">Server</option>
            <option value="WORKSTATION">Workstation</option>
            <option value="NETWORK_DEVICE">Network Device</option>
            <option value="DATABASE">Database</option>
            <option value="APPLICATION">Application</option>
            <option value="CONTAINER">Container</option>
            <option value="CLOUD_RESOURCE">Cloud Resource</option>
            <option value="HONEY_POT">Honeypot Decoy</option>
          </select>

          {/* Criticality Filter */}
          <select
            value={criticality}
            onChange={(e) => { setCriticality(e.target.value); setPage(1); }}
            className="bg-[#0b0f17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Criticality Tiers</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          {/* Environment Filter */}
          <select
            value={environment}
            onChange={(e) => { setEnvironment(e.target.value); setPage(1); }}
            className="bg-[#0b0f17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Environments</option>
            <option value="PRODUCTION">Production</option>
            <option value="STAGING">Staging</option>
            <option value="DEVELOPMENT">Development</option>
            <option value="DMZ">DMZ / Perimeter</option>
          </select>
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                <th className="p-3.5 font-semibold">HOSTNAME</th>
                <th className="p-3.5 font-semibold">IP ADDRESS</th>
                <th className="p-3.5 font-semibold">TYPE</th>
                <th className="p-3.5 font-semibold">OS / PLATFORM</th>
                <th className="p-3.5 font-semibold">ENVIRONMENT</th>
                <th className="p-3.5 font-semibold">CRITICALITY</th>
                <th className="p-3.5 font-semibold">STATUS</th>
                <th className="p-3.5 font-semibold">SERVICES</th>
                <th className="p-3.5 font-semibold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-500">Querying asset inventory...</td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-500">No enterprise assets found matching query criteria. Click 'Run Lab Discovery Probe' to populate lab assets.</td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-bold text-white">
                      <Link href={`/dashboard/assets/${asset.id}`} className="hover:text-blue-400 underline underline-offset-4">
                        {asset.hostname}
                      </Link>
                    </td>
                    <td className="p-3.5 text-blue-400 font-semibold">{asset.ipAddress}</td>
                    <td className="p-3.5 text-slate-300">
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 text-[10px]">
                        {asset.assetType}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">{asset.operatingSystem || "N/A"}</td>
                    <td className="p-3.5 text-slate-400">{asset.environment || "PRODUCTION"}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] border ${getCriticalityBadge(asset.criticality)}`}>
                        {asset.criticality}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        asset.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-700 text-slate-400"
                      }`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400 font-mono">
                      {asset.services ? `${asset.services.length} ports` : "0 ports"}
                    </td>
                    <td className="p-3.5 text-right">
                      <Link
                        href={`/dashboard/assets/${asset.id}`}
                        className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                      >
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Showing Page {meta.page} of {meta.totalPages || 1} ({meta.total} total assets)</span>
          <div className="flex space-x-2">
            <button
              disabled={meta.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={meta.page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* JSON Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#131b2e] border border-slate-800 rounded-2xl w-full max-w-2xl p-6 relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileCode className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-sm">Bulk Asset JSON Import</h3>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1 font-mono">Paste Asset Records Array (JSON Format)</label>
                <textarea
                  rows={8}
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  placeholder={`[\n  {\n    "hostname": "WEB-SERVER-02",\n    "ipAddress": "192.168.1.25",\n    "assetType": "SERVER",\n    "criticality": "HIGH"\n  }\n]`}
                  className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              {importResult && (
                <div className={`p-3 rounded-lg text-xs font-mono border ${
                  importResult.error ? "bg-rose-500/10 border-rose-500/30 text-rose-400" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                }`}>
                  {importResult.error ? (
                    <div>Error: {importResult.error}</div>
                  ) : (
                    <div>
                      Import Completed! Total: {importResult.totalRecords} | Successful: {importResult.successfulRecords} | Failed: {importResult.failedRecords}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium"
                >
                  Process Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Add Asset Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#131b2e] border border-slate-800 rounded-2xl w-full max-w-xl p-6 relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-sm">Create Enterprise Asset</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Hostname *</label>
                  <input
                    type="text"
                    required
                    value={newAsset.hostname}
                    onChange={(e) => setNewAsset({ ...newAsset, hostname: e.target.value })}
                    placeholder="WEB-SERVER-01"
                    className="w-full bg-[#0b0f17] border border-slate-700 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">IP Address *</label>
                  <input
                    type="text"
                    required
                    value={newAsset.ipAddress}
                    onChange={(e) => setNewAsset({ ...newAsset, ipAddress: e.target.value })}
                    placeholder="192.168.1.100"
                    className="w-full bg-[#0b0f17] border border-slate-700 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Asset Type</label>
                  <select
                    value={newAsset.assetType}
                    onChange={(e) => setNewAsset({ ...newAsset, assetType: e.target.value })}
                    className="w-full bg-[#0b0f17] border border-slate-700 rounded p-2 text-white"
                  >
                    <option value="SERVER">SERVER</option>
                    <option value="WORKSTATION">WORKSTATION</option>
                    <option value="NETWORK_DEVICE">NETWORK DEVICE</option>
                    <option value="DATABASE">DATABASE</option>
                    <option value="APPLICATION">APPLICATION</option>
                    <option value="CONTAINER">CONTAINER</option>
                    <option value="CLOUD_RESOURCE">CLOUD RESOURCE</option>
                    <option value="HONEY_POT">HONEYPOT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Criticality</label>
                  <select
                    value={newAsset.criticality}
                    onChange={(e) => setNewAsset({ ...newAsset, criticality: e.target.value })}
                    className="w-full bg-[#0b0f17] border border-slate-700 rounded p-2 text-white"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Environment</label>
                  <select
                    value={newAsset.environment}
                    onChange={(e) => setNewAsset({ ...newAsset, environment: e.target.value })}
                    className="w-full bg-[#0b0f17] border border-slate-700 rounded p-2 text-white"
                  >
                    <option value="PRODUCTION">PRODUCTION</option>
                    <option value="STAGING">STAGING</option>
                    <option value="DEVELOPMENT">DEVELOPMENT</option>
                    <option value="DMZ">DMZ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">OS Family</label>
                  <input
                    type="text"
                    value={newAsset.operatingSystem}
                    onChange={(e) => setNewAsset({ ...newAsset, operatingSystem: e.target.value })}
                    placeholder="Ubuntu Linux"
                    className="w-full bg-[#0b0f17] border border-slate-700 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Owner / Team</label>
                  <input
                    type="text"
                    value={newAsset.owner}
                    onChange={(e) => setNewAsset({ ...newAsset, owner: e.target.value })}
                    placeholder="SecOps Infrastructure"
                    className="w-full bg-[#0b0f17] border border-slate-700 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium"
                >
                  Create Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
