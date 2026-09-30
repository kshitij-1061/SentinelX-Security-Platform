"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { 
  Server, 
  ArrowLeft, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Activity, 
  Cpu, 
  HardDrive, 
  User, 
  MapPin, 
  Globe, 
  Terminal, 
  Layers, 
  Calendar,
  Key,
  ExternalLink
} from "lucide-react";

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [asset, setAsset] = useState<any>(null);
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "services" | "software" | "vulnerabilities">("overview");

  useEffect(() => {
    if (!id) return;
    fetchAssetDetail();
    fetchAssetVulnerabilities();
  }, [id]);

  const fetchAssetDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/assets/${id}`);
      if (res.data.success) {
        setAsset(res.data.data);
      } else {
        setError("Failed to load asset details.");
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Asset not found or error loading data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssetVulnerabilities = async () => {
    try {
      const res = await api.get(`/assets/${id}/vulnerabilities`);
      if (res.data.success) {
        setVulnerabilities(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch asset vulnerabilities:", err);
    }
  };

  const getCriticalityBadge = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return <span className="bg-red-950/60 text-red-400 border border-red-800 px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> CRITICAL</span>;
      case "HIGH":
        return <span className="bg-orange-950/60 text-orange-400 border border-orange-800 px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> HIGH</span>;
      case "MEDIUM":
        return <span className="bg-yellow-950/60 text-yellow-400 border border-yellow-800 px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5">MEDIUM</span>;
      default:
        return <span className="bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded text-xs font-semibold">LOW</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-800 px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE</span>;
      case "INACTIVE":
        return <span className="bg-slate-800 text-slate-400 border border-slate-700 px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> INACTIVE</span>;
      default:
        return <span className="bg-purple-950/60 text-purple-400 border border-purple-800 px-3 py-1 rounded text-xs font-semibold">DECOMMISSIONED</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-400">
        <Activity className="w-6 h-6 animate-spin mr-2 text-cyan-400" />
        <span>Loading asset details...</span>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="p-6">
        <Link href="/dashboard/assets" className="inline-flex items-center text-sm text-cyan-400 hover:text-cyan-300 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Asset Inventory
        </Link>
        <div className="bg-red-950/30 border border-red-800 text-red-300 p-6 rounded-lg flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-lg text-red-200">Asset Detail Error</h3>
            <p className="mt-1 text-sm">{error || "Asset not found."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header / Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/dashboard/assets" className="inline-flex items-center text-xs text-cyan-400 hover:text-cyan-300 mb-2">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Asset Inventory
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 border border-cyan-500/30 rounded-lg text-cyan-400">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-mono font-bold text-slate-100 flex items-center gap-3">
                {asset.hostname}
                <span className="text-xs font-sans font-normal px-2.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {asset.assetType}
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                IP: <span className="text-slate-200">{asset.ipAddress}</span> | MAC: <span className="text-slate-200">{asset.macAddress || "N/A"}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {getStatusBadge(asset.status)}
          {getCriticalityBadge(asset.criticality)}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 flex gap-6 text-sm">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "overview"
              ? "border-cyan-500 text-cyan-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Cpu className="w-4 h-4" /> Overview & Attributes
        </button>
        <button
          onClick={() => setActiveTab("services")}
          className={`pb-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "services"
              ? "border-cyan-500 text-cyan-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Terminal className="w-4 h-4" /> Open Services ({asset.services?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("software")}
          className={`pb-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "software"
              ? "border-cyan-500 text-cyan-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <HardDrive className="w-4 h-4" /> Installed Software ({asset.software?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("vulnerabilities")}
          className={`pb-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "vulnerabilities"
              ? "border-cyan-500 text-cyan-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-red-400" /> Vulnerabilities & Exposure ({vulnerabilities.length})
        </button>
      </div>

      {/* TAB CONTENT: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Core System Information */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" /> System Information
            </h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Hostname</dt>
                <dd className="font-mono text-slate-200 font-semibold">{asset.hostname}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">IP Address</dt>
                <dd className="font-mono text-slate-200">{asset.ipAddress}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">MAC Address</dt>
                <dd className="font-mono text-slate-200">{asset.macAddress || "Not Recorded"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Asset Type</dt>
                <dd className="text-slate-200 font-medium">{asset.assetType}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Operating System</dt>
                <dd className="text-slate-200">
                  {asset.operatingSystem || "Unknown"} {asset.operatingSystemVersion || ""}
                </dd>
              </div>
            </dl>
          </div>

          {/* Context & Ownership */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-purple-400" /> Environment & Ownership
            </h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Environment</dt>
                <dd className="text-slate-200 font-semibold">{asset.environment}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Asset Criticality</dt>
                <dd className="text-slate-200">{asset.criticality}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Asset Owner</dt>
                <dd className="text-slate-200">{asset.owner || "Unassigned"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Department</dt>
                <dd className="text-slate-200">{asset.department || "Unassigned"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Location / Zone</dt>
                <dd className="text-slate-200">{asset.location || "Datacenter Alpha"}</dd>
              </div>
            </dl>
          </div>

          {/* Timestamps & Lifecycle */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" /> Lifecycle & Auditing
            </h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Asset ID</dt>
                <dd className="font-mono text-xs text-slate-400 truncate">{asset.id}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">First Discovered / Created</dt>
                <dd className="text-slate-300 text-xs">
                  {new Date(asset.createdAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Last Updated</dt>
                <dd className="text-slate-300 text-xs">
                  {new Date(asset.updatedAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Last Probe / Scan Seen</dt>
                <dd className="text-slate-300 text-xs">
                  {new Date(asset.lastSeen).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Services */}
      {activeTab === "services" && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-medium text-slate-200 text-sm flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" /> Discovered Network Services
            </h3>
            <span className="text-xs text-slate-500">Total: {asset.services?.length || 0}</span>
          </div>

          {(!asset.services || asset.services.length === 0) ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No network services currently associated with this asset. Run a lab probe or import service data.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Port</th>
                    <th className="px-4 py-3 font-semibold">Protocol</th>
                    <th className="px-4 py-3 font-semibold">Service Name</th>
                    <th className="px-4 py-3 font-semibold">Version / Banner</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {asset.services.map((service: any) => (
                    <tr key={service.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono font-medium text-cyan-400">{service.port}</td>
                      <td className="px-4 py-3 uppercase text-xs font-mono text-slate-400">{service.protocol}</td>
                      <td className="px-4 py-3 font-semibold text-slate-200">{service.serviceName}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">{service.serviceVersion || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 rounded text-xs bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                          {service.status || "OPEN"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Software */}
      {activeTab === "software" && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-medium text-slate-200 text-sm flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-purple-400" /> Installed Software Inventory
            </h3>
            <span className="text-xs text-slate-500">Total: {asset.software?.length || 0}</span>
          </div>

          {(!asset.software || asset.software.length === 0) ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No installed software recorded for this asset.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Software Name</th>
                    <th className="px-4 py-3 font-semibold">Version</th>
                    <th className="px-4 py-3 font-semibold">Vendor</th>
                    <th className="px-4 py-3 font-semibold">Installed Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {asset.software.map((sw: any) => (
                    <tr key={sw.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-semibold text-slate-200">{sw.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-cyan-400">{sw.version}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{sw.vendor || "Unknown"}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {sw.installedAt ? new Date(sw.installedAt).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Vulnerabilities & Exposure */}
      {activeTab === "vulnerabilities" && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-medium text-slate-200 text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" /> Vulnerabilities & Exposure Risk
            </h3>
            <span className="text-xs text-slate-500">Total: {vulnerabilities.length}</span>
          </div>

          {vulnerabilities.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No known vulnerabilities or exposure risks linked to this asset.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">CVE / Identifier</th>
                    <th className="px-4 py-3 font-semibold">Title</th>
                    <th className="px-4 py-3 font-semibold">CVSS</th>
                    <th className="px-4 py-3 font-semibold">Exposure Zone</th>
                    <th className="px-4 py-3 font-semibold">Risk Score</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {vulnerabilities.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono font-semibold text-cyan-400">
                        {item.vulnerability.cve || item.vulnerability.vulnerabilityIdentifier}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-200 max-w-xs truncate">
                        {item.vulnerability.title}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-xs text-red-400">
                        {item.vulnerability.cvssScore.toFixed(1)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-xs bg-purple-950/60 text-purple-400 border border-purple-800">
                          {item.exposure}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded font-mono font-bold text-xs border ${
                          item.riskDetails?.riskScore >= 80 ? "bg-red-950 text-red-400 border-red-800" :
                          item.riskDetails?.riskScore >= 60 ? "bg-orange-950 text-orange-400 border-orange-800" :
                          "bg-yellow-950 text-yellow-400 border-yellow-800"
                        }`}>
                          {item.riskDetails?.riskScore?.toFixed(1) || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/dashboard/vulnerabilities/${item.vulnerability.id}`}
                          className="inline-flex items-center text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                        >
                          Inspect CVE <ExternalLink className="w-3 h-3 ml-1" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
